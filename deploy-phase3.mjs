/**
 * DealClaw — Phase 3 Deployment: AI-Driven Negotiation
 *
 * Uses DealClawEngine to run a real AI-driven deal on Solana Devnet.
 * Each round's reasoning is hashed and recorded on-chain via memo.
 * Final outcome: escrow settlement + certificate NFT #3.
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
import crypto from 'crypto';
import fs from 'fs';
import DealClawEngine from './engine/DealClawEngine.mjs';

// ─── Setup ───────────────────────────────────────────────────────────────────
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const kp = JSON.parse(fs.readFileSync('.keypairs.json', 'utf-8'));
const escrowWallet = Keypair.fromSecretKey(Uint8Array.from(kp.escrow));
const buyerAgent   = Keypair.fromSecretKey(Uint8Array.from(kp.buyer));
const sellerAgent  = Keypair.fromSecretKey(Uint8Array.from(kp.seller));

// Load prior phase results
const results = JSON.parse(fs.readFileSync('deployment-results.json', 'utf-8'));
const phase3TxnStart = results.transactions.length;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function log(label, sig) {
  const url = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
  results.transactions.push({ label, signature: sig, explorer: url });
  console.log(`  [OK] ${label}`);
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

// ─── Vendor Simulation ──────────────────────────────────────────────────────
// Tuned so vendor reaches ~0.20 SOL around round 4-5.
// Exponential decay from startPrice toward floor.
function simulateVendorOffer(round, model, lastDealClawOffer) {
  const { floor, startPrice, decayRate } = model;
  if (round === 1) return startPrice;
  const span = startPrice - floor;
  const drop = span * (1 - Math.pow(decayRate, round));
  let offer = Math.round((startPrice - drop) * 1000) / 1000;
  // If DealClaw countered close to our current position, concede a bit more
  if (lastDealClawOffer && offer - lastDealClawOffer < 0.04 && round >= 3) {
    offer = Math.round(((offer + lastDealClawOffer) / 2) * 1000) / 1000;
  }
  return Math.max(offer, floor);
}

// ─── AI Engine Initialization ───────────────────────────────────────────────
const engine = new DealClawEngine({
  dealId: 'advisory-003',
  service: 'Token Launch Advisory',
  budget: 0.2,
  walkAwayPrice: 0.25,
  marketData: {
    avgPrice: 0.35,
    minPrice: 0.15,
    maxPrice: 0.8,
    alternatives: [
      { provider: 'LaunchPad_A', price: 0.22 },
      { provider: 'LaunchPad_B', price: 0.28 },
    ],
  },
});

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('DealClaw — Phase 3: AI-Driven Negotiation');
  console.log('==========================================');

  // Check balances
  console.log('\nChecking wallet balances...\n');
  const [bBal, sBal, eBal] = await Promise.all([
    connection.getBalance(buyerAgent.publicKey),
    connection.getBalance(sellerAgent.publicKey),
    connection.getBalance(escrowWallet.publicKey),
  ]);
  console.log(`  Buyer (DealClaw):  ${(bBal / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  console.log(`  Seller (Vendor):   ${(sBal / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  console.log(`  Escrow:            ${(eBal / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

  // ═══════════════════════════════════════════════════════════════════════════
  // AI NEGOTIATION LOOP
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- AI Negotiation: Token Launch Advisory (advisory-003) ---\n');

  const vendorModel = { floor: 0.18, startPrice: 0.6, decayRate: 0.55 };
  let vendorOffer;
  let result;
  const allRounds = [];

  for (let round = 1; round <= 8; round++) {
    // Vendor makes offer
    vendorOffer = simulateVendorOffer(round, vendorModel, result?.counterOffer);

    // AI Engine decides
    result = engine.processRound(vendorOffer, round);
    allRounds.push({ round, vendorOffer, ...result });

    // Deploy memo on-chain
    const memo = JSON.stringify({
      protocol: 'DNP/1.0',
      deal: 'advisory-003',
      round,
      vendor_offer: vendorOffer,
      dealclaw_counter: result.counterOffer,
      tactic: result.tactic,
      confidence: result.confidence,
      reasoning_hash: result.reasoningHash,
      model: 'DealClawEngine/1.0',
    });
    const sig = await sendMemo(buyerAgent, memo);
    log(`AI Memo: Advisory R${round} -- ${result.tactic} (V:${vendorOffer}, DC:${result.counterOffer})`, sig);
    await sleep(500);

    // Check terminal states
    if (result.tactic === 'DEAL_CLOSED' || result.tactic === 'WALK_AWAY') break;
  }

  const outcome = result.tactic; // 'DEAL_CLOSED' or 'WALK_AWAY'
  const finalPrice = outcome === 'DEAL_CLOSED' ? result.counterOffer : null;
  const escrowAmount = outcome === 'DEAL_CLOSED' ? finalPrice : 0.1; // pre-auth for walk-away
  const escrowLamports = Math.floor(escrowAmount * LAMPORTS_PER_SOL);

  console.log(`\nNegotiation outcome: ${outcome}`);
  if (finalPrice !== null) {
    console.log(`Final price: ${finalPrice} SOL`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ESCROW SETTLEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Escrow Settlement ---\n');

  // Escrow Lock: Buyer -> Escrow
  const lockTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: buyerAgent.publicKey,
      toPubkey: escrowWallet.publicKey,
      lamports: escrowLamports,
    })
  );
  const lockSig = await sendAndConfirmTransaction(connection, lockTx, [buyerAgent]);
  log(`Escrow Lock: Buyer -> Escrow (${escrowAmount} SOL)`, lockSig);
  results.escrowOps = results.escrowOps || [];
  results.escrowOps.push({
    type: 'lock', deal: 'advisory-003', amount: escrowAmount,
    from: buyerAgent.publicKey.toBase58(), to: escrowWallet.publicKey.toBase58(),
    signature: lockSig,
    explorer: `https://explorer.solana.com/tx/${lockSig}?cluster=devnet`,
  });
  await sleep(500);

  if (outcome === 'DEAL_CLOSED') {
    // Release: Escrow -> Seller
    const releaseTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: escrowWallet.publicKey,
        toPubkey: sellerAgent.publicKey,
        lamports: escrowLamports,
      })
    );
    const releaseSig = await sendAndConfirmTransaction(connection, releaseTx, [escrowWallet]);
    log(`Escrow Release: Escrow -> Seller (${escrowAmount} SOL)`, releaseSig);
    results.escrowOps.push({
      type: 'release', deal: 'advisory-003', amount: escrowAmount,
      from: escrowWallet.publicKey.toBase58(), to: sellerAgent.publicKey.toBase58(),
      signature: releaseSig,
      explorer: `https://explorer.solana.com/tx/${releaseSig}?cluster=devnet`,
    });
  } else {
    // Refund: Escrow -> Buyer
    const refundTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: escrowWallet.publicKey,
        toPubkey: buyerAgent.publicKey,
        lamports: escrowLamports,
      })
    );
    const refundSig = await sendAndConfirmTransaction(connection, refundTx, [escrowWallet]);
    log(`Escrow Refund: Escrow -> Buyer (${escrowAmount} SOL walk-away)`, refundSig);
    results.escrowOps.push({
      type: 'refund', deal: 'advisory-003', amount: escrowAmount,
      from: escrowWallet.publicKey.toBase58(), to: buyerAgent.publicKey.toBase58(),
      signature: refundSig,
      explorer: `https://explorer.solana.com/tx/${refundSig}?cluster=devnet`,
    });
  }
  await sleep(500);

  // ═══════════════════════════════════════════════════════════════════════════
  // CERTIFICATE NFT #3
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n--- Mint Deal Certificate #3 ---\n');

  const cert3Mint = await createMint(
    connection, escrowWallet, escrowWallet.publicKey, escrowWallet.publicKey, 0
  );
  const cert3ATA = await getOrCreateAssociatedTokenAccount(
    connection, escrowWallet, cert3Mint, buyerAgent.publicKey
  );
  const cert3MintSig = await mintTo(
    connection, escrowWallet, cert3Mint, cert3ATA.address, escrowWallet, 1
  );
  log(`Mint Certificate #3: Token Launch Advisory -- ${outcome}`, cert3MintSig);
  await sleep(500);

  // Revoke mint authority (1-of-1 immutable)
  const revokeTx = new Transaction().add(
    createSetAuthorityInstruction(cert3Mint, escrowWallet.publicKey, AuthorityType.MintTokens, null)
  );
  const revokeSig = await sendAndConfirmTransaction(connection, revokeTx, [escrowWallet]);
  log('Revoke Certificate #3 Mint Authority (immutable)', revokeSig);
  await sleep(500);

  // Certificate metadata memo with all reasoning hashes
  const reasoningHashes = allRounds.map(r => r.reasoningHash);
  const summary = engine.getSummary();
  const vendorInitial = allRounds[0].vendorOffer;
  const tacticsUsed = [...new Set(allRounds.map(r => r.tactic))];
  const savingsVsOpen = finalPrice != null
    ? `${Math.round((1 - finalPrice / vendorInitial) * 100)}%` : null;
  const savingsVsMarket = finalPrice != null
    ? `${Math.round((1 - finalPrice / 0.35) * 100)}%` : null;

  const certMemo = JSON.stringify({
    protocol: 'DNP/1.0',
    type: 'DEAL_CERTIFICATE',
    cert: cert3Mint.toBase58(),
    deal: 'advisory-003',
    service: 'Token Launch Advisory',
    outcome,
    rounds: allRounds.length,
    vendor_initial: vendorInitial,
    final_price: finalPrice,
    savings: savingsVsOpen,
    savings_vs_market: savingsVsMarket,
    tactics_used: tacticsUsed,
    reasoning_hashes: reasoningHashes,
    model: 'DealClawEngine/1.0',
    buyer: buyerAgent.publicKey.toBase58(),
    seller: sellerAgent.publicKey.toBase58(),
  });
  const certMemoSig = await sendMemo(escrowWallet, certMemo);
  log('Memo: Certificate #3 Metadata (AI deal record on-chain)', certMemoSig);

  // Update certificates in results
  results.certificates = results.certificates || [];
  results.certificates.push({
    name: 'Deal Certificate: Token Launch Advisory',
    deal: 'advisory-003',
    outcome,
    mint: cert3Mint.toBase58(),
    holder: buyerAgent.publicKey.toBase58(),
    explorer: `https://explorer.solana.com/address/${cert3Mint.toBase58()}?cluster=devnet`,
    metadataMemo: certMemoSig,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE AI REASONING LOG
  // ═══════════════════════════════════════════════════════════════════════════
  const aiLog = {
    engine: 'DealClawEngine/1.0',
    deal: engine.getSummary(),
    rounds: allRounds,
    verifiable: {
      note: 'Each round reasoning_hash on-chain. Full reasoning in this file. Verify: SHA-256(JSON.stringify(reasoning)) === reasoning_hash',
      reasoningChains: allRounds.map(r => ({
        round: r.round,
        reasoning: r.reasoning,
        hash: r.reasoningHash,
      })),
    },
  };
  fs.writeFileSync('ai-reasoning-log.json', JSON.stringify(aiLog, null, 2));
  console.log('\n  [SAVED] ai-reasoning-log.json');

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE deployment-results.json
  // ═══════════════════════════════════════════════════════════════════════════
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

  // Add negotiation record
  results.negotiations = results.negotiations || [];
  results.negotiations.push({
    service: 'Token Launch Advisory',
    outcome,
    engine: 'DealClawEngine/1.0',
    rounds: allRounds.map(r => ({
      round: r.round,
      vendor: r.vendorOffer,
      dealclaw: r.counterOffer,
      tactic: r.tactic,
      confidence: r.confidence,
      reasoningHash: r.reasoningHash,
    })),
    finalPrice,
    savings: savingsVsOpen,
    savingsVsMarket,
  });

  fs.writeFileSync('deployment-results.json', JSON.stringify(results, null, 2));
  console.log('  [SAVED] deployment-results.json updated');

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  const phase3TxnCount = results.transactions.length - phase3TxnStart;
  console.log('\n==========================================');
  console.log('PHASE 3 SUMMARY');
  console.log('==========================================');
  console.log(`  Total Transactions:     ${results.transactions.length}`);
  console.log(`  New AI-Driven Txns:     ${phase3TxnCount}`);
  console.log(`  Negotiation Rounds:     ${allRounds.length}`);
  console.log(`  Outcome:                ${outcome}`);
  if (finalPrice !== null) {
    console.log(`  Final Price:            ${finalPrice} SOL`);
    console.log(`  Savings vs Vendor Open: ${savingsVsOpen}`);
    console.log(`  Savings vs Market Avg:  ${savingsVsMarket}`);
  }
  console.log(`  Certificate #3 Mint:    ${cert3Mint.toBase58()}`);
  console.log(`  Tactics Used:           ${tacticsUsed.join(', ')}`);
  console.log(`  Reasoning Hashes:`);
  allRounds.forEach(r => {
    console.log(`    R${r.round}: ${r.reasoningHash.slice(0, 16)}...`);
  });
  console.log(`  Buyer Balance:          ${results.finalBalances.buyer} SOL`);
  console.log(`  Seller Balance:         ${results.finalBalances.seller} SOL`);
  console.log(`  Escrow Balance:         ${results.finalBalances.escrow} SOL`);
  console.log('\nPhase 3 done. AI negotiation deployed and verifiable on Solana Explorer.\n');
}

main().catch(err => {
  console.error('\nError:', err.message);
  console.error(err.stack);
  // Save partial results on failure
  try {
    fs.writeFileSync('deployment-results.json', JSON.stringify(results, null, 2));
    console.log('Partial results saved to deployment-results.json');
  } catch (_) { /* ignore */ }
  process.exit(1);
});
