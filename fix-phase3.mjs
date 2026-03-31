/**
 * Fix Phase 3: Send compressed certificate metadata memo + save AI reasoning log.
 * The original cert memo exceeded Solana Memo's 566-byte limit due to full reasoning hashes.
 * Fix: compute a Merkle root of all reasoning hashes and include only that single hash.
 */
import {
  Connection, Keypair, LAMPORTS_PER_SOL, PublicKey,
  Transaction, TransactionInstruction, sendAndConfirmTransaction,
} from '@solana/web3.js';
import crypto from 'crypto';
import fs from 'fs';
import DealClawEngine from './engine/DealClawEngine.mjs';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const kp = JSON.parse(fs.readFileSync('.keypairs.json', 'utf-8'));
const escrowWallet = Keypair.fromSecretKey(Uint8Array.from(kp.escrow));
const buyerAgent = Keypair.fromSecretKey(Uint8Array.from(kp.buyer));
const sellerAgent = Keypair.fromSecretKey(Uint8Array.from(kp.seller));

const results = JSON.parse(fs.readFileSync('deployment-results.json', 'utf-8'));

async function sendMemo(payer, memoText) {
  const ix = new TransactionInstruction({
    keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoText, 'utf-8'),
  });
  const tx = new Transaction().add(ix);
  return sendAndConfirmTransaction(connection, tx, [payer]);
}

// Recreate the engine and replay the negotiation to get reasoning hashes
const engine = new DealClawEngine({
  dealId: 'advisory-003',
  service: 'Token Launch Advisory',
  budget: 0.2,
  walkAwayPrice: 0.25,
  marketData: {
    avgPrice: 0.35, minPrice: 0.15, maxPrice: 0.8,
    alternatives: [
      { provider: 'LaunchPad_A', price: 0.22 },
      { provider: 'LaunchPad_B', price: 0.28 },
    ],
  },
});

// Replay vendor model
function simulateVendorOffer(round, model, lastCounter) {
  const { floor, startPrice, decayRate } = model;
  if (round === 1) return startPrice;
  const span = startPrice - floor;
  const drop = span * (1 - Math.pow(decayRate, round));
  let offer = Math.round((startPrice - drop) * 1000) / 1000;
  if (lastCounter && offer - lastCounter < 0.04 && round >= 3) {
    offer = Math.round(((offer + lastCounter) / 2) * 1000) / 1000;
  }
  return Math.max(offer, floor);
}

const vendorModel = { floor: 0.18, startPrice: 0.6, decayRate: 0.55 };
let vendorOffer, result;
const allRounds = [];

for (let round = 1; round <= 8; round++) {
  vendorOffer = simulateVendorOffer(round, vendorModel, result?.counterOffer);
  result = engine.processRound(vendorOffer, round);
  allRounds.push({ round, vendorOffer, ...result });
  if (result.tactic === 'DEAL_CLOSED' || result.tactic === 'WALK_AWAY') break;
}

// Compute Merkle root of reasoning hashes
const hashes = allRounds.map(r => r.reasoningHash);
function merkleRoot(leaves) {
  if (leaves.length === 1) return leaves[0];
  const next = [];
  for (let i = 0; i < leaves.length; i += 2) {
    const left = leaves[i];
    const right = leaves[i + 1] || left;
    next.push(crypto.createHash('sha256').update(left + right).digest('hex'));
  }
  return merkleRoot(next);
}
const mRoot = merkleRoot(hashes);

// Get cert3 mint address from the on-chain transaction
// We need to look it up - find the mint txn in results
const mintTxn = results.transactions.find(t => t.label.includes('Mint Certificate #3'));
// We'll get the mint from the on-chain transaction
// For now, query it from the connection
async function main() {
  console.log('Fixing Phase 3: Sending compressed certificate metadata memo...\n');
  console.log('Reasoning hashes:');
  allRounds.forEach(r => console.log(`  R${r.round}: ${r.reasoningHash.slice(0, 16)}...`));
  console.log(`Merkle root: ${mRoot.slice(0, 16)}...`);

  // Get cert3 mint by parsing the mint transaction
  const mintSig = mintTxn.signature;
  const txInfo = await connection.getParsedTransaction(mintSig, { maxSupportedTransactionVersion: 0 });
  // Find the mint address from inner instructions
  let cert3Mint = null;
  if (txInfo?.meta?.postTokenBalances?.length > 0) {
    cert3Mint = txInfo.meta.postTokenBalances[0].mint;
  }
  if (!cert3Mint) {
    // Fallback: check preTokenBalances or innerInstructions
    const innerIxs = txInfo?.meta?.innerInstructions || [];
    for (const group of innerIxs) {
      for (const ix of group.instructions) {
        if (ix.parsed?.type === 'mintTo' && ix.parsed?.info?.mint) {
          cert3Mint = ix.parsed.info.mint;
        }
      }
    }
  }
  console.log(`Certificate #3 mint: ${cert3Mint}`);

  // Compressed cert memo with Merkle root instead of individual hashes
  const certMemo = JSON.stringify({
    p: 'DNP/1.0', t: 'CERT', d: 'advisory-003',
    s: 'Token Launch Advisory', o: 'DEAL_CLOSED',
    r: 4, fp: 0.203, sv: '66%',
    m: cert3Mint,
    mr: mRoot.slice(0, 32),
    e: 'DealClawEngine/1.0',
  });

  console.log(`Memo size: ${Buffer.from(certMemo, 'utf-8').length} bytes`);

  const sig = await sendMemo(escrowWallet, certMemo);
  const url = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
  console.log(`  [OK] Memo: Certificate #3 Metadata (AI deal, Merkle root)`);
  console.log(`     ${url}`);

  // Update results
  results.transactions.push({
    label: 'Memo: Certificate #3 Metadata (AI deal, reasoning Merkle root)',
    signature: sig,
    explorer: url,
  });

  results.certificates = results.certificates || [];
  results.certificates.push({
    name: 'Deal Certificate: Token Launch Advisory',
    deal: 'advisory-003',
    outcome: 'DEAL_CLOSED',
    mint: cert3Mint,
    holder: buyerAgent.publicKey.toBase58(),
    explorer: `https://explorer.solana.com/address/${cert3Mint}?cluster=devnet`,
    metadataMemo: sig,
    reasoningMerkleRoot: mRoot,
  });

  // Add negotiation record
  results.negotiations = results.negotiations || [];
  results.negotiations.push({
    service: 'Token Launch Advisory',
    outcome: 'DEAL_CLOSED',
    engine: 'DealClawEngine/1.0',
    rounds: allRounds.map(r => ({
      round: r.round, vendor: r.vendorOffer, dealclaw: r.counterOffer,
      tactic: r.tactic, confidence: r.confidence,
      reasoningHash: r.reasoningHash,
    })),
    finalPrice: 0.203,
    savings: '66%',
  });

  // Final balances
  const [fB, fS, fE] = await Promise.all([
    connection.getBalance(buyerAgent.publicKey),
    connection.getBalance(sellerAgent.publicKey),
    connection.getBalance(escrowWallet.publicKey),
  ]);
  results.finalBalances = {
    buyer: (fB / LAMPORTS_PER_SOL).toFixed(4),
    seller: (fS / LAMPORTS_PER_SOL).toFixed(4),
    escrow: (fE / LAMPORTS_PER_SOL).toFixed(4),
  };

  fs.writeFileSync('deployment-results.json', JSON.stringify(results, null, 2));
  console.log('  [SAVED] deployment-results.json');

  // Save AI reasoning log
  const aiLog = {
    engine: 'DealClawEngine/1.0',
    deal: engine.getSummary(),
    rounds: allRounds,
    merkleRoot: mRoot,
    verifiable: {
      note: 'Each round reasoning_hash is on-chain in individual memo txns. Merkle root of all hashes is in certificate memo. Verify: SHA-256(JSON.stringify(reasoning)) === reasoning_hash for each round.',
      reasoningChains: allRounds.map(r => ({
        round: r.round, reasoning: r.reasoning, hash: r.reasoningHash,
      })),
    },
  };
  fs.writeFileSync('ai-reasoning-log.json', JSON.stringify(aiLog, null, 2));
  console.log('  [SAVED] ai-reasoning-log.json');

  console.log(`\nTotal transactions: ${results.transactions.length}`);
  console.log(`Certificates: ${results.certificates.length}`);
  console.log('Phase 3 fix complete.\n');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
