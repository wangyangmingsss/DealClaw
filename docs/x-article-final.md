# DealClaw — AI 自主谈判代理 | Solana Agent Economy Hackathon

---

「主人，Smart Contract Audit 谈判完成。4 轮讨价还价，从 0.5 SOL 谈到 0.25 SOL。已锁入 Escrow，节省 50%。Deal Certificate NFT 已铸造，铸造权已永久销毁。全程零人工。」

这不是概念设想。这是 DealClaw Agent 在 Solana Devnet 上的真实执行记录——18 笔链上交易，全部可验证。

**DealClaw 是你的 AI 龙虾谈判官。你设条件，龙虾讨价还价，Solana Escrow 锁定交易，NFT 证书永久存证。人类只需要签字。**

---

## 实用性 ★★★★★

谈判是最被低估的效率黑洞。

每一次采购、外包、合作，都要经历：来回拉锯几小时，情绪消耗，信息不对称，最终可能还多付 30-50%。更要命的是——谈完没记录，扯皮无凭据。

DealClaw 方式：4 轮自主谈判，50% 成本节省，自动 Escrow 锁定，Deal Certificate NFT 永久存证，全程链上可验证。

不信？看链上记录：

- **Round 1 — Anchoring**：Vendor 开价 0.5 SOL，DealClaw 反锚定 0.15 SOL
  [Explorer](https://explorer.solana.com/tx/LywkBo7bTazdKiNeVTYHTTdLNGVnWBKTRbgHqVTPwVnowrU67BTeuiMFHkXz7XTx7QW2TZzN4Yv1xVbn4H2hSqN?cluster=devnet)
- **Round 2 — BATNA Leverage**：Vendor 降到 0.4，DealClaw 出价 0.18，亮出替代方案施压
  [Explorer](https://explorer.solana.com/tx/586QGxVEB5Eggs6QLEF3bT7h8JocenEFnfDiYdjVRLL8vx37w2yozEYuxu8sHkyL6HXEacvcUMntYDJEpbNbfvFv?cluster=devnet)
- **Round 3 — Tactic Detection**：检测到 Vendor 使用 scope_reduction 策略，DealClaw 出价 0.22，拒绝缩减范围
  [Explorer](https://explorer.solana.com/tx/5y2Z5ZX8mNPgRm11HfMnhP1v9U5fZzAqfUTDc8Fjz856sk4kSbehxjT4VMjimXSq5LghtcH25VBFVPTSLWpm2pBR?cluster=devnet)
- **Round 4 — Deal Closed**：0.25 SOL 成交，节省 50%
  [Explorer](https://explorer.solana.com/tx/1VSwaUnk5H8H5LymRR7ZmgPaZjitSEJRsKxqCXEonLeHZJTZq3hFJqheRPPfhbYZEsTJNAKo45ajiqgF9dnAX1H?cluster=devnet)

**目标用户**：Agent 开发者、自由职业者、DAO 采购。任何需要「讨价还价」的场景，DealClaw 都能代劳。

**竞品对比**：市面上没有任何工具做链上可验证的谈判记录。传统谈判机器人都是链下黑箱——你无法审计它说了什么、让了多少、为什么成交。DealClaw 的每一轮出价、策略、对手反应，全部写在 Solana 上，任何人可查。

---

## 创新性 ★★★★★

**首个 "Negotiation-on-Chain" 协议。**

核心创新点：

**1. DealClaw Negotiation Protocol (DNP)**
每一轮谈判记录为 Solana Memo 交易，形成不可篡改的议价历史。这是一个正式的链上谈判标准——详见 [NEGOTIATION_PROTOCOL.md](./NEGOTIATION_PROTOCOL.md)。没有其他项目做链上可验证的谈判记录。

**2. Deal Certificate NFT Standard**
谈判完成后，DealClaw 自动铸造 1-of-1 SPL Token 作为交易证书。关键设计：铸造后立即 revoke mint authority，确保该 NFT 永远不可增发，成为不可篡改的交易凭证。每张证书通过 Memo 交易关联完整的元数据（交易类型、金额、结果、时间戳）。

- Collection NFT：[Explorer](https://explorer.solana.com/address/CWAm9apVFxRnBUyGcb2NJ96csa9JaFUrDEzgRLq9A2YM?cluster=devnet)
- Certificate #1（Audit DEAL_CLOSED）：[Explorer](https://explorer.solana.com/address/9hPEnE3SfLB8K4GXwB2CA18L7duScHkmCc11YotF8dqg?cluster=devnet)
- Certificate #2（Logo WALK_AWAY）：[Explorer](https://explorer.solana.com/address/Dowvv3fXdUuM9b3chjDqwSLFwx868MdWJAB75jZqK4yk?cluster=devnet)

**3. Tactic Detection Engine**
实时识别 6 种操纵策略：scope_reduction, artificial_urgency, anchoring_manipulation, false_scarcity, bait_and_switch, emotional_pressure。检测到操纵时自动调整谈判策略，不被人类话术套路。

**4. Walk-Away Protocol**
当对手报价超过预算底线，Agent 自动激活退出协议，Escrow 自动退款。不是「建议退出」，是 Agent 自主决策并执行。

Logo Design 谈判就是 Walk-Away 的真实案例——Vendor 最终报价 0.3 SOL 超过预算 0.15 SOL，DealClaw 果断离场：
- Walk-Away Memo：[Explorer](https://explorer.solana.com/tx/4Z1bd78A33FYS7MtXbrzWL1fJXTQ8XhY2EXWsMApJ4QAtCN45gyfB3tgjkJsVvxUgJhvr9R5ZBA8pjv2pCXwduMq?cluster=devnet)
- Escrow 退款：[Explorer](https://explorer.solana.com/tx/5VkDakES6vmHeviME3FPJZCvqna13Y8PqiMvcgB8uQefVmyabrda8cz38ErUstuAPvRCdSDsS11XYTyUCQ2K1GDv?cluster=devnet)
- 即便交易失败，依然铸造 Certificate #2 记录结果：[Explorer](https://explorer.solana.com/tx/AKFDEPNNhXsofsdshuqjZQzCNQZNKN6ULhLWKmm4gAMKGt98hoL1EMtwwK8VmAWEBxkyi5p5bG8MLQdqoQThMGM?cluster=devnet)

---

## 技术深度 ★★★★☆

**6 层架构：**

```
Human（设条件）→ DealClaw Engine（AI 谈判）→ Memo Program（链上记录）→ Escrow（资金锁定）→ SPL Token Certificates（交易存证）→ Solana L1
```

**谈判策略引擎（5 种策略）：**
- Anchoring：低锚定开局，掌握心理主动权
- BATNA Leverage：亮出替代方案，施加谈判压力
- Concession Mapping：计算让步梯度，控制收敛速度
- Tactic Detection：实时识别对手操纵策略
- Walk-Away Protocol：超过底线自动离场

**Escrow 生命周期：**
- 成功路径：Lock → Release（审计交易）
  - Lock（0.25 SOL）：[Explorer](https://explorer.solana.com/tx/3Qb8Y7GUZFqryNifN3p2Xh6rFpm36dzg7cY3EWXZznrEj7FVdyZdoYiHvoXfcZZwAs4UH9xY2L3zjAMrFfSjauNK?cluster=devnet)
  - Release（0.25 SOL）：[Explorer](https://explorer.solana.com/tx/217Us6RtfcPvUmM82LGngaJrBaqY8c15jQUHwuSLtFuwfc1J6F5bhqQTwwVYoAFGQd15aehr2Mzz3MyhfUKxkxYY?cluster=devnet)
- 离场路径：Lock → Refund（Logo 交易）
  - Lock（0.1 SOL）：[Explorer](https://explorer.solana.com/tx/4ZeSJxJYGgGru6C96FW1gd7BVEhU1EtU6VcyHXL1FGnSFGd6FctCHqLeCbmXn8nLb6nfZrnPVGgH3op9YbDVhtQa?cluster=devnet)
  - Refund（0.1 SOL）：[Explorer](https://explorer.solana.com/tx/5VkDakES6vmHeviME3FPJZCvqna13Y8PqiMvcgB8uQefVmyabrda8cz38ErUstuAPvRCdSDsS11XYTyUCQ2K1GDv?cluster=devnet)

**Deal Certificate NFT 流程：**

```
createMint → mintTo（1 token）→ revokeAuthority（不可增发）→ Memo（元数据上链）
```

每个步骤都是独立的链上交易：
- Mint Collection NFT：[Explorer](https://explorer.solana.com/tx/2Lsb15Agu1GJcLLLU7KW1haKP9itm33XozpsuRGc3bjAq4cV7shNZJE2qvEMAzHcZujq6uxMXhRbgq1ed2PEh4v?cluster=devnet)
- Revoke Collection Mint Authority：[Explorer](https://explorer.solana.com/tx/3cNoUWxkXoabMKRi6NAVtEDb3ncosyfCGfzFKkKMk3aKbE83LzFsZbRsjDcPwTUtWmXJetCcF36jvqLjkFQ8PdpL?cluster=devnet)
- Mint Certificate #1：[Explorer](https://explorer.solana.com/tx/5ebMgDe9t2HfdTbwfAi9YJraHWk4uEkDcNkvPzKC1bbvfV2mdkjsc8XwXVEx2bPMbZgNphB6djEoX2KHMXeD19GX?cluster=devnet)
- Revoke Cert #1 Authority：[Explorer](https://explorer.solana.com/tx/4EBMKiFZhVTD9ZZZ5nY5Ch38v6pm8Ws7EyGcjTDByKzTH6JSXfXXTcNaQzDgKxvu1ih9Y7P8VkyejiMuLwQM2U38?cluster=devnet)
- Cert #1 Metadata Memo：[Explorer](https://explorer.solana.com/tx/4Gej8pWhAPhNtYs8HGX3fYvxeK5Axdcf1tgbboRHm9AFnUsQyeAprBkbYdkEdpTZ8wsa2Dkywmx71amAHeTnB3kU?cluster=devnet)
- Mint Certificate #2：[Explorer](https://explorer.solana.com/tx/AKFDEPNNhXsofsdshuqjZQzCNQZNKN6ULhLWKmm4gAMKGt98hoL1EMtwwK8VmAWEBxkyi5p5bG8MLQdqoQThMGM?cluster=devnet)
- Revoke Cert #2 Authority：[Explorer](https://explorer.solana.com/tx/5VQTzXgE6aj3c4GGHpscdVRj3CRtc2GWYYaHPTcfnMne6Tz9j8RVCpKQy2ZNshneAUZSwmViGyb6L1UBBsF8EXPc?cluster=devnet)
- Cert #2 Metadata Memo：[Explorer](https://explorer.solana.com/tx/3dRZLE3BdR3MCbb4DULav8fn7CVnkdAMrXYFMxWimK4gSMa2wNc2SpwtTCuzCEZtZcYKWrb4Gqk59bQfCfXLUNXT?cluster=devnet)

**x402 Agent-to-Agent 支付：**
- NFT Commission 快速成交，0.15 SOL：[Explorer](https://explorer.solana.com/tx/3ZNzs7UKLi8hqVHv1dYTHWakamKwsuc3cSn9axJkjsx8sP4XyvPwTU4ehEKs9LMsLffyJwqtAN5Nh5yaU6uMmLup?cluster=devnet)

**关键地址：**
- Escrow 钱包：[Explorer](https://explorer.solana.com/address/8fzHM3zW1ZpqSAK9jN7Lhwb8k4SxBm2YKozSsKU78Q2S?cluster=devnet)
- Buyer 钱包：[Explorer](https://explorer.solana.com/address/DzgRF9ReaE11PV3ViaLaADNCqQbfnw1QB2ukxotRSdsv?cluster=devnet)
- Seller 钱包：[Explorer](https://explorer.solana.com/address/GteXijiHQTw98kB9zMknxv6tjvkSEGHyBU358exnKaAL?cluster=devnet)

全部在 Solana L1 上执行，零 L2 依赖。

---

## 完成度 ★★★★★

**18 笔真实 Devnet 交易，覆盖完整生命周期：谈判 → Escrow → 支付 → Walk-Away → NFT 证书铸造。**

| # | 交易 | Explorer |
|---|------|----------|
| 1 | Memo: Audit Round 1 — Anchoring | [查看](https://explorer.solana.com/tx/LywkBo7bTazdKiNeVTYHTTdLNGVnWBKTRbgHqVTPwVnowrU67BTeuiMFHkXz7XTx7QW2TZzN4Yv1xVbn4H2hSqN?cluster=devnet) |
| 2 | Memo: Audit Round 2 — BATNA | [查看](https://explorer.solana.com/tx/586QGxVEB5Eggs6QLEF3bT7h8JocenEFnfDiYdjVRLL8vx37w2yozEYuxu8sHkyL6HXEacvcUMntYDJEpbNbfvFv?cluster=devnet) |
| 3 | Memo: Audit Round 3 — Tactic Detection | [查看](https://explorer.solana.com/tx/5y2Z5ZX8mNPgRm11HfMnhP1v9U5fZzAqfUTDc8Fjz856sk4kSbehxjT4VMjimXSq5LghtcH25VBFVPTSLWpm2pBR?cluster=devnet) |
| 4 | Memo: Audit Round 4 — Deal Closed | [查看](https://explorer.solana.com/tx/1VSwaUnk5H8H5LymRR7ZmgPaZjitSEJRsKxqCXEonLeHZJTZq3hFJqheRPPfhbYZEsTJNAKo45ajiqgF9dnAX1H?cluster=devnet) |
| 5 | Escrow Lock (0.25 SOL) | [查看](https://explorer.solana.com/tx/3Qb8Y7GUZFqryNifN3p2Xh6rFpm36dzg7cY3EWXZznrEj7FVdyZdoYiHvoXfcZZwAs4UH9xY2L3zjAMrFfSjauNK?cluster=devnet) |
| 6 | Escrow Release (0.25 SOL) | [查看](https://explorer.solana.com/tx/217Us6RtfcPvUmM82LGngaJrBaqY8c15jQUHwuSLtFuwfc1J6F5bhqQTwwVYoAFGQd15aehr2Mzz3MyhfUKxkxYY?cluster=devnet) |
| 7 | x402 Payment (0.15 SOL) | [查看](https://explorer.solana.com/tx/3ZNzs7UKLi8hqVHv1dYTHWakamKwsuc3cSn9axJkjsx8sP4XyvPwTU4ehEKs9LMsLffyJwqtAN5Nh5yaU6uMmLup?cluster=devnet) |
| 8 | Walk-Away Memo | [查看](https://explorer.solana.com/tx/4Z1bd78A33FYS7MtXbrzWL1fJXTQ8XhY2EXWsMApJ4QAtCN45gyfB3tgjkJsVvxUgJhvr9R5ZBA8pjv2pCXwduMq?cluster=devnet) |
| 9 | Escrow Lock — pre-auth (0.1 SOL) | [查看](https://explorer.solana.com/tx/4ZeSJxJYGgGru6C96FW1gd7BVEhU1EtU6VcyHXL1FGnSFGd6FctCHqLeCbmXn8nLb6nfZrnPVGgH3op9YbDVhtQa?cluster=devnet) |
| 10 | Escrow Refund (0.1 SOL) | [查看](https://explorer.solana.com/tx/5VkDakES6vmHeviME3FPJZCvqna13Y8PqiMvcgB8uQefVmyabrda8cz38ErUstuAPvRCdSDsS11XYTyUCQ2K1GDv?cluster=devnet) |
| 11 | Mint Collection NFT | [查看](https://explorer.solana.com/tx/2Lsb15Agu1GJcLLLU7KW1haKP9itm33XozpsuRGc3bjAq4cV7shNZJE2qvEMAzHcZujq6uxMXhRbgq1ed2PEh4v?cluster=devnet) |
| 12 | Revoke Collection Mint Authority | [查看](https://explorer.solana.com/tx/3cNoUWxkXoabMKRi6NAVtEDb3ncosyfCGfzFKkKMk3aKbE83LzFsZbRsjDcPwTUtWmXJetCcF36jvqLjkFQ8PdpL?cluster=devnet) |
| 13 | Mint Certificate #1 (Audit DEAL_CLOSED) | [查看](https://explorer.solana.com/tx/5ebMgDe9t2HfdTbwfAi9YJraHWk4uEkDcNkvPzKC1bbvfV2mdkjsc8XwXVEx2bPMbZgNphB6djEoX2KHMXeD19GX?cluster=devnet) |
| 14 | Revoke Cert #1 Mint Authority | [查看](https://explorer.solana.com/tx/4EBMKiFZhVTD9ZZZ5nY5Ch38v6pm8Ws7EyGcjTDByKzTH6JSXfXXTcNaQzDgKxvu1ih9Y7P8VkyejiMuLwQM2U38?cluster=devnet) |
| 15 | Cert #1 Metadata Memo | [查看](https://explorer.solana.com/tx/4Gej8pWhAPhNtYs8HGX3fYvxeK5Axdcf1tgbboRHm9AFnUsQyeAprBkbYdkEdpTZ8wsa2Dkywmx71amAHeTnB3kU?cluster=devnet) |
| 16 | Mint Certificate #2 (Logo WALK_AWAY) | [查看](https://explorer.solana.com/tx/AKFDEPNNhXsofsdshuqjZQzCNQZNKN6ULhLWKmm4gAMKGt98hoL1EMtwwK8VmAWEBxkyi5p5bG8MLQdqoQThMGM?cluster=devnet) |
| 17 | Revoke Cert #2 Mint Authority | [查看](https://explorer.solana.com/tx/5VQTzXgE6aj3c4GGHpscdVRj3CRtc2GWYYaHPTcfnMne6Tz9j8RVCpKQy2ZNshneAUZSwmViGyb6L1UBBsF8EXPc?cluster=devnet) |
| 18 | Cert #2 Metadata Memo | [查看](https://explorer.solana.com/tx/3dRZLE3BdR3MCbb4DULav8fn7CVnkdAMrXYFMxWimK4gSMa2wNc2SpwtTCuzCEZtZcYKWrb4Gqk59bQfCfXLUNXT?cluster=devnet) |

**工程产出物：**
- `agent-execution-log.json` — Agent 完整执行日志（含 Phase 1 & Phase 2）
- `deployment-results.json` — 所有链上交易签名与 Explorer 链接
- `ARCHITECTURE.md` — 系统架构文档
- `ENGINEERING_LOG.md` — 工程开发日志
- `NEGOTIATION_PROTOCOL.md` — DealClaw Negotiation Protocol 正式规范

**开源**：全部代码开源在 GitHub，任何人可复现。

---

## 生态契合度 ★★★★★

DealClaw 完全构建在 Solana 原生生态之上，使用 4 个核心协议：

- **Solana Memo Program**：原生链上程序，零额外合约部署，每轮谈判记录成本 ~0.000005 SOL
- **SPL Token Program**：Deal Certificate NFT 的铸造、转账、权限管理全部通过 SPL Token 标准完成——无需 Metaplex，无需自定义合约
- **x402 Protocol**：Agent-to-Agent 支付协议，实现自主结算
- **Escrow on L1**：资金锁定与释放全部在 Solana L1 完成，无需 L2 或跨链桥

**为什么是 Solana？**
多轮谈判需要亚秒级确认。4 轮谈判 Memo + Escrow Lock/Release + NFT 铸造 + 权限撤销 + 元数据上链 = 18 笔交易在几秒内完成。以太坊上同样的流程需要数分钟和数十美元 Gas。Solana 的速度和成本结构天然适配高频交互型 Agent。

---

## Engineering Postmortem

**问题 1：Memo 大小限制**
Solana Memo Program 单条 Memo 限制 566 bytes。早期设计想把完整谈判上下文塞进去，直接报错。解决方案：压缩为结构化 JSON（round/vendor/dealclaw/tactic），关键信息上链，详细日志存本地 execution log。

**问题 2：Escrow 时序竞争**
Lock 和 Release 必须严格顺序执行，但异步环境下偶发 Release 先于 Lock 确认。解决方案：加入交易确认等待机制，Lock 确认后再触发 Release 指令。

**问题 3：Walk-Away 判定阈值**
最初 Walk-Away 阈值设太激进，Agent 在第 2 轮就想离场。调整为：至少完成 3 轮谈判 + 对手连续 2 轮让步幅度 < 5% 才触发 Walk-Away，避免过早放弃潜在好交易。

**问题 4：NFT 证书设计抉择**
最初考虑用 Metaplex 标准铸造 NFT，但引入额外依赖和复杂度。最终选择纯 SPL Token 方案：createMint（decimals=0, supply=1）→ mintTo → revokeAuthority。优势：零外部依赖，铸造权撤销后物理上不可增发，元数据通过 Memo 交易关联而非链上存储，成本极低。取舍：没有标准的 NFT metadata 展示（如图片、属性），但对于交易证书场景，链上可验证性比视觉展示更重要。

---

## 结语

Track 4 问的是「帮人类省掉低效沟通」。DealClaw 的答案：**人类设条件，龙虾去谈判，链上锁交易，NFT 永久存证。** 这就是赛博糊弄学的终极形态。

> Live Demo: https://wangyangmingsss.github.io/DealClaw/
> GitHub: https://github.com/wangyangmingsss/DealClaw

@solaborators @solana #AgentTalentShow #SolanaHackathon #DealClaw #赛博糊弄学
