import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import DealClawEngine from '../engine/DealClawEngine.mjs';

/** Helper: create a default config for tests. */
function makeConfig(overrides = {}) {
  return {
    dealId: 'test-deal-001',
    service: 'Solana RPC Node',
    budget: 10,
    walkAwayPrice: 15,
    marketData: {
      avgPrice: 8,
      alternatives: [
        { name: 'AltA', price: 7 },
        { name: 'AltB', price: 9 },
        { name: 'AltC', price: 11 },
      ],
    },
    ...overrides,
  };
}

// =============================================================================
// 1. Basic initialization
// =============================================================================
describe('DealClawEngine - Initialization', () => {
  it('1. constructor sets all fields from config', () => {
    const cfg = makeConfig();
    const engine = new DealClawEngine(cfg);
    assert.equal(engine.dealId, 'test-deal-001');
    assert.equal(engine.service, 'Solana RPC Node');
    assert.equal(engine.budget, 10);
    assert.equal(engine.walkAwayPrice, 15);
    assert.equal(engine.state, 'INITIATING');
    assert.equal(engine.bestAlternative, 7); // min of [7,9,11]
    assert.deepEqual(engine.rounds, []);
    assert.deepEqual(engine.vendorOffers, []);
    assert.deepEqual(engine.counterOffers, []);
  });
});

// =============================================================================
// 2-3. processRound - anchoring and concession mapping
// =============================================================================
describe('DealClawEngine - processRound basics', () => {
  it('2. first round anchoring offers ~40-80% of budget', () => {
    const engine = new DealClawEngine(makeConfig());
    const r = engine.processRound(12, 1);
    assert.equal(r.tactic, 'ANCHORING');
    // anchor should be between budget*0.5 and budget*0.8
    assert.ok(r.counterOffer >= 5, `counter ${r.counterOffer} should be >= floor 5`);
    assert.ok(r.counterOffer <= 8, `counter ${r.counterOffer} should be <= ceil 8`);
    assert.equal(engine.getState(), 'NEGOTIATING');
  });

  it('3. subsequent rounds use BATNA_LEVERAGE or CONCESSION_MAPPING', () => {
    // budget=10, walkAway=15, bestAlt=7. Vendor offers above budget avoid DEAL_CLOSED.
    const engine = new DealClawEngine(makeConfig());
    engine.processRound(14, 1); // anchoring
    const r2 = engine.processRound(12, 2); // above budget -> no close
    assert.equal(r2.tactic, 'BATNA_LEVERAGE');
    assert.ok(r2.counterOffer > 0);
    // round 3: need concession rate >= 0.15 for CONCESSION_MAPPING
    // rate = (12 - vendorOffer)/12 >= 0.15 => vendorOffer <= 10.2, but 10.2 > budget 10 => no close (10.2 > 10)
    // Also: _shouldClose checks vendorOffer <= walkAwayPrice(15) && round>=3 && vendorOffer <= bestAlt(7). 10.2 > 7 so no close.
    const r3 = engine.processRound(10.2, 3);
    assert.equal(r3.tactic, 'CONCESSION_MAPPING');
  });
});

// =============================================================================
// 4. BATNA leverage
// =============================================================================
describe('DealClawEngine - BATNA leverage', () => {
  it('4. BATNA_LEVERAGE references best alternative', () => {
    const engine = new DealClawEngine(makeConfig());
    engine.processRound(14, 1);
    const r = engine.processRound(13, 2);
    assert.equal(r.tactic, 'BATNA_LEVERAGE');
    assert.ok(r.reasoning.some(s => s.includes('BATNA')));
    assert.ok(r.reasoning.some(s => s.includes(String(engine.bestAlternative))));
  });
});

// =============================================================================
// 5. Tactic detection - HIGHBALL (vendor >150% budget) triggers aggressive anchor
// =============================================================================
describe('DealClawEngine - Tactic detection: HIGHBALL', () => {
  it('5. extremely high vendor offer triggers aggressive anchor with warning', () => {
    const engine = new DealClawEngine(makeConfig());
    // vendorOffer > 2x market avg (8) => aggressive
    const r = engine.processRound(20, 1);
    assert.equal(r.tactic, 'ANCHORING');
    assert.ok(r.reasoning.some(s => s.includes('aggressive')));
    assert.equal(r.confidence, 0.7);
  });
});

// =============================================================================
// 6. Tactic detection - FALSE_URGENCY (offer ends in 9)
// =============================================================================
describe('DealClawEngine - Tactic detection: FALSE_URGENCY', () => {
  it('6. urgency pressure detected when offer ends in 9 on round >= 2', () => {
    const engine = new DealClawEngine(makeConfig());
    engine.processRound(14, 1);
    const r = engine.processRound(12.99, 2);
    assert.equal(r.tactic, 'TACTIC_DETECTION:urgency_pressure');
    assert.ok(r.reasoning.some(s => s.includes('Urgency pressure')));
  });
});

// =============================================================================
// 7. Tactic detection - EMOTIONAL_APPEAL (take-it-or-leave-it / <2% movement)
// =============================================================================
describe('DealClawEngine - Tactic detection: take-it-or-leave-it', () => {
  it('7. detects take-it-or-leave-it when vendor barely moves (<2%)', () => {
    const engine = new DealClawEngine(makeConfig());
    engine.processRound(14, 1);
    // second offer barely moves: 14 -> 13.9 => 0.7% movement
    const r = engine.processRound(13.9, 2);
    assert.equal(r.tactic, 'TACTIC_DETECTION:take_it_or_leave_it');
    assert.equal(r.counterOffer, engine.budget);
  });
});

// =============================================================================
// 8. Walk-away logic
// =============================================================================
describe('DealClawEngine - Walk-away', () => {
  it('8. walks away when vendor stays above walkAwayPrice after round 3 with low concession', () => {
    const engine = new DealClawEngine(makeConfig({ walkAwayPrice: 15 }));
    engine.processRound(20, 1);
    engine.processRound(19.9, 2);  // tiny concession
    const r = engine.processRound(19.85, 3);
    assert.equal(r.tactic, 'WALK_AWAY');
    assert.equal(engine.getState(), 'WALK_AWAY');
    assert.equal(r.counterOffer, null);
  });

  it('8b. always walks away at round 6', () => {
    const engine = new DealClawEngine(makeConfig());
    // force through 5 rounds with decreasing offers that stay above budget
    engine.processRound(14, 1);
    engine.processRound(13, 2);
    engine.processRound(12, 3);
    engine.processRound(11.5, 4);
    engine.processRound(11, 5);
    const r = engine.processRound(10.5, 6);
    assert.equal(r.tactic, 'WALK_AWAY');
  });
});

// =============================================================================
// 9. Deal closure
// =============================================================================
describe('DealClawEngine - Deal closure', () => {
  it('9. closes deal when vendor offer <= budget', () => {
    const engine = new DealClawEngine(makeConfig());
    const r = engine.processRound(9, 1); // 9 <= budget 10
    assert.equal(r.tactic, 'DEAL_CLOSED');
    assert.equal(engine.getState(), 'DEAL_CLOSED');
    assert.equal(r.confidence, 0.99);
  });

  it('9b. closes when offer <= walkAwayPrice, round >= 3, offer <= bestAlternative', () => {
    const engine = new DealClawEngine(makeConfig({ walkAwayPrice: 15 }));
    engine.processRound(14, 1);
    engine.processRound(11, 2);
    // round 3: offer 7 <= walkAwayPrice 15, round >= 3, 7 <= bestAlternative 7
    const r = engine.processRound(7, 3);
    assert.equal(r.tactic, 'DEAL_CLOSED');
  });
});

// =============================================================================
// 10. getSummary()
// =============================================================================
describe('DealClawEngine - getSummary', () => {
  it('10. returns correct summary format', () => {
    const engine = new DealClawEngine(makeConfig());
    engine.processRound(12, 1);
    const s = engine.getSummary();
    assert.equal(s.dealId, 'test-deal-001');
    assert.equal(s.service, 'Solana RPC Node');
    assert.equal(s.state, 'NEGOTIATING');
    assert.equal(s.totalRounds, 1);
    assert.equal(s.budget, 10);
    assert.equal(s.walkAwayPrice, 15);
    assert.equal(s.bestAlternative, 7);
    assert.ok(Array.isArray(s.rounds));
    assert.equal(s.rounds.length, 1);
  });
});

// =============================================================================
// 11. getReasoning()
// =============================================================================
describe('DealClawEngine - getReasoning', () => {
  it('11. returns reasoning array for valid round', () => {
    const engine = new DealClawEngine(makeConfig());
    engine.processRound(12, 1);
    const reasoning = engine.getReasoning(1);
    assert.ok(Array.isArray(reasoning));
    assert.ok(reasoning.length > 0);
    assert.ok(reasoning.every(r => typeof r === 'string'));
  });

  it('11b. returns null for non-existent round', () => {
    const engine = new DealClawEngine(makeConfig());
    assert.equal(engine.getReasoning(99), null);
  });
});

// =============================================================================
// 12. Multiple sequential rounds simulation
// =============================================================================
describe('DealClawEngine - Multiple sequential rounds', () => {
  it('12. produces valid results across multiple rounds', () => {
    const engine = new DealClawEngine(makeConfig());
    const results = [];
    const vendorPrices = [14, 12, 11, 10.8, 10.5];
    for (let i = 0; i < vendorPrices.length; i++) {
      const r = engine.processRound(vendorPrices[i], i + 1);
      results.push(r);
      if (r.tactic === 'DEAL_CLOSED' || r.tactic === 'WALK_AWAY') break;
    }
    // Should have processed multiple rounds
    assert.ok(results.length >= 3, 'Should process at least 3 rounds');
    // All results should have valid structure
    for (const r of results) {
      assert.ok(r.tactic, 'Each result should have a tactic');
      assert.ok(Array.isArray(r.reasoning), 'Each result should have reasoning');
      assert.ok(typeof r.confidence === 'number', 'Confidence should be a number');
    }
    // Engine should track all vendor offers
    assert.ok(engine.vendorOffers.length >= 3);
  });
});

// =============================================================================
// 13. Edge case: budget = 0
// =============================================================================
describe('DealClawEngine - Edge cases', () => {
  it('13. budget = 0 still processes without crash', () => {
    const engine = new DealClawEngine(makeConfig({
      budget: 0,
      walkAwayPrice: 0,
      marketData: { avgPrice: 0, alternatives: [{ name: 'X', price: 0 }] },
    }));
    const r = engine.processRound(0, 1);
    // vendorOffer 0 <= budget 0 => DEAL_CLOSED
    assert.equal(r.tactic, 'DEAL_CLOSED');
  });

  // =============================================================================
  // 14. Edge case: very high vendor price (10x budget)
  // =============================================================================
  it('14. 10x budget vendor price produces valid result', () => {
    const engine = new DealClawEngine(makeConfig());
    const r = engine.processRound(100, 1);
    assert.equal(r.tactic, 'ANCHORING');
    assert.ok(r.counterOffer <= engine.budget * 0.8);
    assert.ok(r.counterOffer >= engine.budget * 0.5);
    assert.ok(r.reasoning.some(s => s.includes('aggressive')));
  });
});

// =============================================================================
// 15. Full negotiation lifecycle
// =============================================================================
describe('DealClawEngine - Full lifecycle', () => {
  it('15. runs from start to deal close', () => {
    const engine = new DealClawEngine(makeConfig());
    assert.equal(engine.getState(), 'INITIATING');

    engine.processRound(14, 1);
    assert.equal(engine.getState(), 'NEGOTIATING');

    engine.processRound(11, 2);
    assert.equal(engine.getState(), 'NEGOTIATING');

    // Offer at budget => close
    const r = engine.processRound(10, 3);
    assert.equal(r.tactic, 'DEAL_CLOSED');
    assert.equal(engine.getState(), 'DEAL_CLOSED');

    const summary = engine.getSummary();
    assert.equal(summary.totalRounds, 3);
    assert.equal(summary.state, 'DEAL_CLOSED');
  });

  it('15b. runs from start to walk-away', () => {
    const engine = new DealClawEngine(makeConfig({ walkAwayPrice: 12 }));
    assert.equal(engine.getState(), 'INITIATING');

    engine.processRound(20, 1);
    engine.processRound(19.9, 2);
    const r = engine.processRound(19.85, 3);
    assert.equal(r.tactic, 'WALK_AWAY');
    assert.equal(engine.getState(), 'WALK_AWAY');
    assert.equal(r.counterOffer, null);
  });
});

// =============================================================================
// 16. Metrics and reasoning hash
// =============================================================================
describe('DealClawEngine - Result structure', () => {
  it('16. result contains all expected fields', () => {
    const engine = new DealClawEngine(makeConfig());
    const r = engine.processRound(12, 1);
    assert.ok('tactic' in r);
    assert.ok('counterOffer' in r);
    assert.ok('confidence' in r);
    assert.ok('reasoning' in r);
    assert.ok('reasoningHash' in r);
    assert.ok('metrics' in r);
    assert.ok(typeof r.reasoningHash === 'string');
    assert.equal(r.reasoningHash.length, 64); // sha256 hex
    assert.ok('vendorConcessionRate' in r.metrics);
    assert.ok('gapToTarget' in r.metrics);
    assert.ok('roundsRemaining' in r.metrics);
    assert.ok('walkAwayRisk' in r.metrics);
  });
});
