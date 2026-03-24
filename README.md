# 🦞 DealClaw — AI Negotiation Agent on Solana

> You set the terms. The lobster does the haggling.

**DealClaw** is an autonomous AI negotiation agent. It conducts multi-round negotiations with counterparty agents on your behalf — anchoring, counter-offering, detecting tactics, and closing deals — while you do nothing. Powered by Solana escrow for trustless settlement and x402 for agent-to-agent payments.

🔗 **[Live Demo](https://0xcaptain888.github.io/DealClaw/)**

Built for the **Solana Agent Economy Hackathon: Agent Talent Show** — Track 4: 赛博糊弄学与赛博抽鞭子 (Cyber-Slacking & Cyber-Whipping)

---

## The Problem

Negotiation is exhausting. Whether you're hiring a freelancer, commissioning art, buying a service, or closing a deal — the back-and-forth drains your time and energy:

- Multiple rounds of messaging
- Emotional fatigue from haggling
- Missing better alternatives because you're stuck in one thread
- Accepting bad deals because you're tired of negotiating

This is the definition of **low-quality communication** that Track 4 asks us to eliminate.

## The Solution

**DealClaw** takes over the entire negotiation process:

1. **You describe what you want** — budget, requirements, walk-away price
2. **DealClaw negotiates autonomously** — multiple rounds, proven tactics, no emotion
3. **You show up to sign** — the deal is already done, locked in escrow

The human becomes a decision-maker, not a negotiator. That's peak 赛博糊弄学.

---

## Core Features

### 🧠 AI Negotiation Engine
DealClaw uses proven negotiation frameworks:
- **Anchoring** — Opens with a strategically low offer to set the frame
- **BATNA Analysis** — Leverages alternative options as leverage ("we have 3 competing quotes")
- **Concession Mapping** — Makes calculated concessions to build trust while protecting your interests
- **Tactic Detection** — Identifies when counterparties use scope reduction, urgency pressure, or credential justification
- **Walk-Away Protocol** — Automatically exits if terms exceed your limits. No bad deals, ever.

### 💬 Multi-Round Autonomous Negotiation
The demo showcases a complete 4-round negotiation for a Smart Contract Audit:
- Round 1: Vendor opens at 15 SOL → DealClaw counters at 5 SOL with market data
- Round 2: Vendor drops to 12 SOL → DealClaw offers 6.5 SOL with BATNA leverage
- Round 3: Vendor tries scope reduction at 9 SOL → DealClaw detects tactic, counters 7.5 SOL full scope
- Round 4: Vendor accepts 7.5 SOL → Deal locked in escrow. **50% savings.**

### 🔒 Solana Escrow
Agreed terms are locked in a Solana escrow smart contract. Funds are only released when the service is delivered and confirmed. Trustless, transparent, on-chain.

### ⚡ x402 Agent-to-Agent Payments
DealClaw uses the x402 protocol for agent-to-agent authentication and payment:
1. Agent authenticates via x402 HTTP header with Solana wallet signature
2. Payment terms negotiated and encoded in x402-compatible format
3. Escrow transaction submitted to Solana, funds released on delivery confirmation

### 📊 Performance Dashboard
- Total deals completed, SOL saved, average savings percentage, win rate
- Weekly savings chart
- Deal history with before/after prices

### 🌐 Bilingual
Full Chinese/English support with auto-detection and one-click toggle.

---

## Architecture

```
👤 Human — Sets Terms
     ↕
🦞 DealClaw Agent — Negotiation Engine
     ↕
🤖 Counterparty Agent — Vendor/Seller
     ↕
◎ Solana Escrow — Trustless Settlement
```

**Tech Stack**: Solana · x402 · OpenClaw · Anchor · MCP · Escrow Protocol

---

## Why This Fits Track 4

The hackathon asks:
> "Help your human negotiate so he could simply show up and close the deal."

DealClaw answers this literally. The agent handles ALL negotiation — the tedious back-and-forth, the emotional labor, the tactical games. The human's only job is to set terms and approve the final result.

- **赛博糊弄学 (Cyber-Slacking)**: The human does nothing while the agent haggles
- **赛博抽鞭子 (Cyber-Whipping)**: The agent aggressively pursues the best deal, never accepts bad terms, and walks away if necessary

---

## Local Development

```bash
git clone https://github.com/0xCaptain888/DealClaw.git
cd DealClaw
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## License

MIT

---

*Built for the Solana Agent Economy Hackathon: Agent Talent Show 🦞*
*Track 4: 赛博糊弄学与赛博抽鞭子*

*#AgentTalentShow*
