/**
 * DealClaw — Phase 2 Deployment: Deal Certificate NFTs
 *
 * Mints NFTs as immutable proof of completed negotiations.
 * Each certificate is a 1-of-1 SPL Token with mint authority revoked.
 */
import {
  Connection, Keypair, LAMPORTS_PER_SOL, PublicKey,
  SystemProgram, Transaction, TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint, getOrCreateAssociatedTokenAccount, mintTo,
  createSetAuthorityInstruction, AuthorityType,
} from '@solana/spl-token';
import fs from 'fs';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const kp = JSON.parse(fs.readFileSync('.keypairs.json', 'utf-8'));
const escrowWallet = Keypair.fromSecretKey(Uint8Array.from(kp.escrow));
const buyerAgent = Keypair.fromSecretKey(Uint8Array.from(kp.buyer));
const sellerAgent = Keypair.fromSecretKey(Uint8Array.from(kp.seller));

// Load phase 1 results
const phase1 = JSON.parse(fs.readFileSync('deployment-results.json', 'utf-8'));

function log(label, sig) {
  const url = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
  phase1.transactions.push({ label, signature: sig, explorer: url });
  console.log(`  ✅ ${label}`);
  console.log(`     ${url}`);
}

async function sendMemo(payer, memoText) {
  const ix = new TransactionInstruction({
    keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoText, 'utf-8'),
  });
  const tx = new Transaction().add(ix);
  return sendAndConfirmTransaction(connection, tx, [payer]);
}

async function main() {
  console.log('');
  console.log('🦞 DealClaw — Phase 2: Deal Certificate NFTs');
  console.log('==============================================');

  // ═══════════════════════════════════════════
  // 1. DealClaw Collection NFT
  // ═══════════════════════════════════════════
  console.log('\n📌 Step 1: Mint DealClaw Collection NFT\n');
  const colMint = await createMint(connection, escrowWallet, escrowWallet.publicKey, escrowWallet.publicKey, 0);
  const colATA = await getOrCreateAssociatedTokenAccount(connection, escrowWallet, colMint, escrowWallet.publicKey);
  const colSig = await mintTo(connection, escrowWallet, colMint, colATA.address, escrowWallet, 1);
  log('Mint DealClaw Collection NFT', colSig);

  // Revoke mint authority
  const colRevoke = new Transaction().add(
    createSetAuthorityInstruction(colMint, escrowWallet.publicKey, AuthorityType.MintTokens, null)
  );
  const colRevokeSig = await sendAndConfirmTransaction(connection, colRevoke, [escrowWallet]);
  log('Revoke Collection Mint Authority (1-of-1)', colRevokeSig);

  phase1.collection = {
    mint: colMint.toBase58(),
    explorer: `https://explorer.solana.com/address/${colMint.toBase58()}?cluster=devnet`,
  };
  await sleep(500);

  // ═══════════════════════════════════════════
  // 2. Deal Certificate #1: Audit Deal (SUCCESS)
  // ═══════════════════════════════════════════
  console.log('\n📌 Step 2: Mint Deal Certificate #1 — Audit (Buyer holds proof)\n');
  const cert1Mint = await createMint(connection, escrowWallet, escrowWallet.publicKey, escrowWallet.publicKey, 0);
  const cert1ATA = await getOrCreateAssociatedTokenAccount(connection, escrowWallet, cert1Mint, buyerAgent.publicKey);
  const cert1Sig = await mintTo(connection, escrowWallet, cert1Mint, cert1ATA.address, escrowWallet, 1);
  log('Mint Certificate: Smart Contract Audit — DEAL_CLOSED (0.25 SOL, -50%)', cert1Sig);

  // Revoke
  const cert1Revoke = new Transaction().add(
    createSetAuthorityInstruction(cert1Mint, escrowWallet.publicKey, AuthorityType.MintTokens, null)
  );
  const cert1RevokeSig = await sendAndConfirmTransaction(connection, cert1Revoke, [escrowWallet]);
  log('Revoke Certificate #1 Mint Authority (immutable)', cert1RevokeSig);

  // Memo with certificate metadata
  const cert1Memo = JSON.stringify({
    protocol: 'DNP', type: 'DEAL_CERTIFICATE', cert: cert1Mint.toBase58(),
    deal: 'audit-001', service: 'Smart Contract Audit',
    outcome: 'DEAL_CLOSED', rounds: 4,
    vendor_initial: 0.5, final_price: 0.25, savings: '50%',
    tactics_used: ['ANCHORING', 'BATNA_LEVERAGE', 'TACTIC_DETECTION'],
    buyer: buyerAgent.publicKey.toBase58(),
    seller: sellerAgent.publicKey.toBase58(),
  });
  const cert1MemoSig = await sendMemo(escrowWallet, cert1Memo);
  log('Memo: Certificate #1 Metadata (deal record on-chain)', cert1MemoSig);

  phase1.certificates = phase1.certificates || [];
  phase1.certificates.push({
    name: 'Deal Certificate: Smart Contract Audit',
    deal: 'audit-001', outcome: 'DEAL_CLOSED',
    mint: cert1Mint.toBase58(),
    holder: buyerAgent.publicKey.toBase58(),
    explorer: `https://explorer.solana.com/address/${cert1Mint.toBase58()}?cluster=devnet`,
    metadataMemo: cert1MemoSig,
  });
  await sleep(500);

  // ═══════════════════════════════════════════
  // 3. Deal Certificate #2: Logo Deal (WALK_AWAY)
  // ═══════════════════════════════════════════
  console.log('\n📌 Step 3: Mint Deal Certificate #2 — Logo (Walk-Away proof)\n');
  const cert2Mint = await createMint(connection, escrowWallet, escrowWallet.publicKey, escrowWallet.publicKey, 0);
  // Walk-away cert goes to buyer as proof they walked away (protected themselves)
  const cert2ATA = await getOrCreateAssociatedTokenAccount(connection, escrowWallet, cert2Mint, buyerAgent.publicKey);
  const cert2Sig = await mintTo(connection, escrowWallet, cert2Mint, cert2ATA.address, escrowWallet, 1);
  log('Mint Certificate: Logo Design — WALK_AWAY (protected budget)', cert2Sig);

  const cert2Revoke = new Transaction().add(
    createSetAuthorityInstruction(cert2Mint, escrowWallet.publicKey, AuthorityType.MintTokens, null)
  );
  const cert2RevokeSig = await sendAndConfirmTransaction(connection, cert2Revoke, [escrowWallet]);
  log('Revoke Certificate #2 Mint Authority (immutable)', cert2RevokeSig);

  const cert2Memo = JSON.stringify({
    protocol: 'DNP', type: 'DEAL_CERTIFICATE', cert: cert2Mint.toBase58(),
    deal: 'logo-002', service: 'Logo Design',
    outcome: 'WALK_AWAY', rounds: 4,
    vendor_final: 0.3, budget: 0.15,
    reason: 'Vendor refused below budget. BATNA activated: Designer_B at 0.12 SOL',
    buyer: buyerAgent.publicKey.toBase58(),
    seller: sellerAgent.publicKey.toBase58(),
  });
  const cert2MemoSig = await sendMemo(escrowWallet, cert2Memo);
  log('Memo: Certificate #2 Metadata (walk-away record on-chain)', cert2MemoSig);

  phase1.certificates.push({
    name: 'Deal Certificate: Logo Design',
    deal: 'logo-002', outcome: 'WALK_AWAY',
    mint: cert2Mint.toBase58(),
    holder: buyerAgent.publicKey.toBase58(),
    explorer: `https://explorer.solana.com/address/${cert2Mint.toBase58()}?cluster=devnet`,
    metadataMemo: cert2MemoSig,
  });

  // Final balances
  const [fB, fS, fE] = await Promise.all([
    connection.getBalance(buyerAgent.publicKey),
    connection.getBalance(sellerAgent.publicKey),
    connection.getBalance(escrowWallet.publicKey),
  ]);
  phase1.finalBalances = {
    buyer: (fB / LAMPORTS_PER_SOL).toFixed(4),
    seller: (fS / LAMPORTS_PER_SOL).toFixed(4),
    escrow: (fE / LAMPORTS_PER_SOL).toFixed(4),
  };

  console.log('\n==============================================');
  console.log('📊 PHASE 2 SUMMARY');
  console.log('==============================================');
  console.log(`  Collection:     ${phase1.collection.mint}`);
  console.log(`  Certificates:   ${phase1.certificates.length}`);
  console.log(`  New Txns:       8 (2 mints + 2 revokes + 2 cert memos + collection mint + revoke)`);
  console.log(`  Total Txns:     ${phase1.transactions.length}`);
  console.log(`  Buyer Balance:  ${phase1.finalBalances.buyer} SOL`);
  console.log(`  Seller Balance: ${phase1.finalBalances.seller} SOL`);
  console.log(`  Escrow Balance: ${phase1.finalBalances.escrow} SOL`);

  fs.writeFileSync('deployment-results.json', JSON.stringify(phase1, null, 2));
  console.log('\n  💾 deployment-results.json updated');

  // Update agent execution log
  const agentLog = JSON.parse(fs.readFileSync('agent-execution-log.json', 'utf-8'));
  agentLog.certificates = phase1.certificates;
  agentLog.collection = phase1.collection;
  agentLog.performance.certificatesMinted = 2;
  fs.writeFileSync('agent-execution-log.json', JSON.stringify(agentLog, null, 2));
  console.log('  💾 agent-execution-log.json updated');
  console.log('\n✅ Phase 2 done! Deal Certificate NFTs minted and verifiable.\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  fs.writeFileSync('deployment-results.json', JSON.stringify(phase1, null, 2));
  process.exit(1);
});
