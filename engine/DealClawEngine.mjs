import crypto from 'crypto';

/**
 * DealClaw AI Negotiation Engine
 * Real decision-making logic for Solana service negotiations.
 * @module DealClawEngine
 */
export default class DealClawEngine {
  /**
   * @param {Object} config
   * @param {string} config.dealId - Unique deal identifier
   * @param {string} config.service - Service being negotiated
   * @param {number} config.budget - Maximum buyer will pay (SOL)
   * @param {number} config.walkAwayPrice - Absolute ceiling (SOL)
   * @param {Object} config.marketData - Market pricing context
   */
  constructor({ dealId, service, budget, walkAwayPrice, marketData }) {
    this.dealId = dealId;
    this.service = service;
    this.budget = budget;
    this.walkAwayPrice = walkAwayPrice;
    this.market = marketData;
    this.bestAlternative = Math.min(...marketData.alternatives.map(a => a.price));
    this.state = 'INITIATING';
    this.rounds = [];
    this.vendorOffers = [];
    this.counterOffers = [];
    this.vendorConcessions = [];
    this.ourConcessions = [];
    this.initialConcession = null;
  }

  /**
   * Process a negotiation round against the vendor's offer.
   * @param {number} vendorOffer - Vendor's current offer in SOL
   * @param {number} round - Round number (1-based)
   * @returns {Object} Decision with tactic, counterOffer, confidence, reasoning, reasoningHash, metrics
   */
  processRound(vendorOffer, round) {
    this.state = 'NEGOTIATING';
    this.vendorOffers.push(vendorOffer);
    if (this.vendorOffers.length > 1) {
      this.vendorConcessions.push(this.vendorOffers[this.vendorOffers.length - 2] - vendorOffer);
    }
    if (this._shouldClose(vendorOffer, round)) {
      this.state = 'DEAL_CLOSED';
      return this._buildResult('DEAL_CLOSED', vendorOffer, round, 0.99,
        [`Vendor offer ${vendorOffer} SOL meets acceptance criteria`, `Deal closed on round ${round}`]);
    }
    if (this._shouldWalkAway(vendorOffer, round)) {
      this.state = 'WALK_AWAY';
      return this._buildResult('WALK_AWAY', null, round, 0.95,
        [`Offer ${vendorOffer} SOL exceeds walk-away threshold`, `Negotiation terminated after round ${round}`]);
    }
    const detected = this._detectTactics(vendorOffer, round);
    if (detected) return detected;
    const { tactic, counter, confidence, reasoning } = this._pickTactic(vendorOffer, round);
    this.counterOffers.push(counter);
    if (this.counterOffers.length > 1) {
      const diff = counter - this.counterOffers[this.counterOffers.length - 2];
      if (this.initialConcession === null && diff > 0) this.initialConcession = diff;
      this.ourConcessions.push(diff);
    }
    return this._buildResult(tactic, counter, round, confidence, reasoning);
  }
  /** @private Select primary tactic based on round and vendor behavior. */
  _pickTactic(vendorOffer, round) {
    if (round === 1) return this._anchoring(vendorOffer);
    if (round === 2 || this._vendorConcessionRate() < 0.15) return this._batnaLeverage(vendorOffer, round);
    return this._concessionMapping(vendorOffer, round);
  }
  /** @private Round 1 anchoring: open aggressively low based on market data. */
  _anchoring(vendorOffer) {
    const reasoning = [];
    const pctAbove = ((vendorOffer - this.market.avgPrice) / this.market.avgPrice * 100).toFixed(0);
    reasoning.push(`Vendor opened at ${vendorOffer} SOL, ${pctAbove}% above market avg (${this.market.avgPrice})`);
    let anchor = this.market.avgPrice * 0.65;
    const floor = this.budget * 0.5;
    const ceil = this.budget * 0.8;
    anchor = Math.max(floor, Math.min(ceil, anchor));
    anchor = +anchor.toFixed(4);
    reasoning.push(`Setting anchor at 65% of market avg: ${(this.market.avgPrice * 0.65).toFixed(4)} SOL`);
    reasoning.push(`Capped to [${floor.toFixed(4)}, ${ceil.toFixed(4)}]: ${anchor} SOL`);
    const aggressive = vendorOffer > this.market.avgPrice * 2;
    if (aggressive) reasoning.push('WARNING: Vendor pricing is aggressive (>2x market avg)');
    const confidence = aggressive ? 0.7 : 0.85;
    reasoning.push(`Confidence: ${confidence >= 0.8 ? 'high' : 'moderate'} (${confidence}) - ${this.market.alternatives.length} BATNA alternatives`);
    return { tactic: 'ANCHORING', counter: anchor, confidence, reasoning };
  }
  /** @private Round 2+: leverage BATNA alternatives to pressure vendor. */
  _batnaLeverage(vendorOffer, round) {
    const reasoning = [];
    const batnaScore = this.market.alternatives.reduce((s, a) => s + (vendorOffer - a.price), 0)
      / this.market.alternatives.length;
    reasoning.push(`BATNA score: ${batnaScore.toFixed(4)} (avg savings vs alternatives)`);
    reasoning.push(`Best alternative: ${this.bestAlternative} SOL`);
    const lastCounter = this.counterOffers.length > 0 ? this.counterOffers[this.counterOffers.length - 1] : this.budget * 0.5;
    let counter = Math.min(lastCounter * 1.15, this.budget * 0.9);
    counter = +counter.toFixed(4);
    reasoning.push(`Counter: min(${(lastCounter * 1.15).toFixed(4)}, ${(this.budget * 0.9).toFixed(4)}) = ${counter} SOL`);
    const confidence = batnaScore > 0 ? 0.8 : 0.6;
    reasoning.push(`Confidence: ${confidence} - BATNA ${batnaScore > 0 ? 'supports' : 'weak on'} our position`);
    return { tactic: 'BATNA_LEVERAGE', counter, confidence, reasoning };
  }
  /** @private Round 3+: diminishing concession strategy with floor prediction. */
  _concessionMapping(vendorOffer, round) {
    const reasoning = [];
    const base = this.initialConcession != null ? this.initialConcession : this.budget * 0.1;
    const concession = base * Math.pow(0.6, round - 1);
    const lastCounter = this.counterOffers.length > 0 ? this.counterOffers[this.counterOffers.length - 1] : this.budget * 0.5;
    let counter = +(lastCounter + concession).toFixed(4);
    counter = Math.min(counter, this.budget);
    reasoning.push(`Diminishing concession: ${base.toFixed(4)} * 0.6^${round - 1} = ${concession.toFixed(4)} SOL`);
    reasoning.push(`Counter: ${lastCounter.toFixed(4)} + ${concession.toFixed(4)} = ${counter} SOL`);
    if (this.vendorConcessions.length >= 2) {
      const avgDrop = this.vendorConcessions.reduce((a, b) => a + b, 0) / this.vendorConcessions.length;
      const estimatedFloor = +(vendorOffer - avgDrop * 2).toFixed(4);
      reasoning.push(`Predicted vendor floor: ${estimatedFloor} SOL (extrapolated from avg drop ${avgDrop.toFixed(4)})`);
    }
    const gap = vendorOffer - counter;
    const confidence = gap < this.budget * 0.3 ? 0.75 : 0.6;
    reasoning.push(`Gap to close: ${gap.toFixed(4)} SOL, confidence: ${confidence}`);
    return { tactic: 'CONCESSION_MAPPING', counter, confidence, reasoning };
  }
  /** @private Detect manipulative vendor tactics. Returns full result or null. */
  _detectTactics(vendorOffer, round) {
    if (round < 2) return null;
    const prev = this.vendorOffers[this.vendorOffers.length - 2];
    const movement = prev > 0 ? Math.abs(prev - vendorOffer) / prev : 1;
    // take-it-or-leave-it: less than 2% movement
    if (movement < 0.02) {
      const reasoning = [
        `Vendor moved only ${(movement * 100).toFixed(1)}% (<2%) - take-it-or-leave-it detected`,
        'Responding with firm counter at budget ceiling',
      ];
      this.counterOffers.push(this.budget);
      return this._buildResult('TACTIC_DETECTION:take_it_or_leave_it', this.budget, round, 0.7, reasoning);
    }
    // urgency pressure: offer ends in 9 (simulated signal)
    if (String(vendorOffer).endsWith('9') && round >= 2) {
      const counter = this.counterOffers.length > 0 ? this.counterOffers[this.counterOffers.length - 1] : this.budget * 0.7;
      const reasoning = [
        `Urgency pressure pattern detected (offer ${vendorOffer})`,
        `Ignoring pressure - holding position at ${counter} SOL`,
      ];
      this.counterOffers.push(counter);
      return this._buildResult('TACTIC_DETECTION:urgency_pressure', counter, round, 0.65, reasoning);
    }
    // scope reduction: headline dropped but effective concession is negative
    if (prev > vendorOffer && this.vendorConcessions.length > 0 && this.vendorConcessions[this.vendorConcessions.length - 1] < 0) {
      const counter = this.counterOffers.length > 0 ? this.counterOffers[this.counterOffers.length - 1] : this.budget * 0.7;
      const reasoning = [
        'Scope reduction detected: headline dropped but effective value decreased',
        `Countering at previous position ${counter} SOL`,
      ];
      this.counterOffers.push(counter);
      return this._buildResult('TACTIC_DETECTION:scope_reduction', counter, round, 0.6, reasoning);
    }
    return null;
  }
  /** @private Determine if negotiation should be abandoned. */
  _shouldWalkAway(vendorOffer, round) {
    if (round >= 6) return true;
    return vendorOffer > this.walkAwayPrice && round >= 3 && this._vendorConcessionRate() < 0.05;
  }

  /** @private Determine if the current offer is acceptable. */
  _shouldClose(vendorOffer, round) {
    if (vendorOffer <= this.budget) return true;
    return vendorOffer <= this.walkAwayPrice && round >= 3 && vendorOffer <= this.bestAlternative;
  }
  /** @private Vendor concession rate between last two offers. */
  _vendorConcessionRate() {
    if (this.vendorOffers.length < 2) return 1;
    const prev = this.vendorOffers[this.vendorOffers.length - 2];
    return prev > 0 ? (prev - this.vendorOffers[this.vendorOffers.length - 1]) / prev : 0;
  }
  /** @private Build standardized result with metrics and reasoning hash. */
  _buildResult(tactic, counterOffer, round, confidence, reasoning) {
    const reasoningHash = crypto.createHash('sha256').update(JSON.stringify(reasoning)).digest('hex');
    const lastVendor = this.vendorOffers[this.vendorOffers.length - 1];
    const result = {
      tactic,
      counterOffer,
      confidence: +confidence.toFixed(2),
      reasoning,
      reasoningHash,
      metrics: {
        vendorConcessionRate: +this._vendorConcessionRate().toFixed(4),
        gapToTarget: +(lastVendor - this.budget).toFixed(4),
        roundsRemaining: Math.max(0, 6 - round),
        walkAwayRisk: +Math.min(1, Math.max(0,
          (lastVendor - this.walkAwayPrice) / this.walkAwayPrice + (round / 10)
        )).toFixed(2),
      },
    };
    this.rounds.push({ round, ...result });
    return result;
  }
  /** @returns {'INITIATING'|'NEGOTIATING'|'DEAL_CLOSED'|'WALK_AWAY'} Current engine state. */
  getState() { return this.state; }

  /** @returns {Object} Full negotiation summary with all rounds and config. */
  getSummary() {
    return {
      dealId: this.dealId, service: this.service, state: this.state,
      totalRounds: this.rounds.length, budget: this.budget,
      walkAwayPrice: this.walkAwayPrice, bestAlternative: this.bestAlternative,
      rounds: this.rounds,
    };
  }

  /**
   * Get reasoning chain for a specific round.
   * @param {number} round - Round number (1-based)
   * @returns {string[]|null} Array of reasoning steps, or null if round not found.
   */
  getReasoning(round) {
    const entry = this.rounds.find(r => r.round === round);
    return entry ? entry.reasoning : null;
  }
}
