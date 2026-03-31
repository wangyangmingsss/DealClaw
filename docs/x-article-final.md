# DealClaw — AI 自主谈判代理 | Solana Agent Economy Hackathon

---

「主人，Token Launch Advisory 谈判完成。AI 引擎 4 轮博弈，从 0.6 SOL 谈到 0.203 SOL，节省 66%。每轮决策推理已哈希上链，Merkle Root 写入证书。Escrow 已锁定释放。全程零人工，全程可验证。」

这不是概念设想。这是 DealClaw AI 引擎在 Solana Devnet 上的真实执行记录——27 笔链上交易，3 份 Deal Certificate NFT，每一步推理过程可通过哈希比对验证。

**DealClaw 是你的 AI 龙虾谈判官。你设条件，AI 引擎自主博弈，Solana Escrow 锁定交易，推理哈希链上存证，NFT 证书永久记录。人类只需要签字。**

---

## 实用性 ★★★★★

**为什么是现在？**

AI Agent 经济正在爆发——2025年 Solana Agent Kit 发布，AI16z Eliza 框架上线，自主 Agent 开始代替人类执行采购、外包、合作。但当 Agent 代表你谈判时，你怎么知道它谈得好不好？它有没有被对方话术套路？DealClaw 解决的就是 Agent 时代的谈判可审计性问题。

**核心用户：**

DealClaw 的核心用户是运行 AI Agent 的团队和个人。当你的 Agent 每天自动处理几十笔采购谈判时，你需要一个机制确保它不会被操纵、不会超支、不会错过好交易。

**DealClaw 方式：** 4 轮 AI 自主谈判，66% 成本节省，推理哈希链上存证，自动 Escrow 锁定，Deal Certificate NFT 永久记录，全程可验证。

不信？看链上记录：

- **Round 1 -- Anchoring**：Vendor 开价 0.5 SOL，DealClaw 反锚定 0.15 SOL
  [Explorer](https://explorer.solana.com/tx/LywkBo7bTazdKiNeVTYHTTdLNGVnWBKTRbgHqVTPwVnowrU67BTeuiMFHkXz7XTx7QW2TZzN4Yv1xVbn4H2hSqN?cluster=devnet)
- **Round 2 -- BATNA Leverage**：Vendor 降到 0.4，DealClaw 出价 0.18，亮出替代方案施压
  [Explorer](https://explorer.solana.com/tx/586QGxVEB5Eggs6QLEF3bT7h8JocenEFnfDiYdjVRLL8vx37w2yozEYuxu8sHkyL6HXEacvcUMntYDJEpbNbfvFv?cluster=devnet)
- **Round 3 -- Tactic Detection**：检测到 Vendor 使用 scope_reduction 策略，DealClaw 出价 0.22，拒绝缩减范围
  [Explorer](https://explorer.solana.com/tx/5y2Z5ZX8mNPgRm11HfMnhP1v9U5fZzAqfUTDc8Fjz856sk4kSbehxjT4VMjimXSq5LghtcH25VBFVPTSLWpm2pBR?cluster=devnet)
- **Round 4 -- Deal Closed**：0.25 SOL 成交，节省 50%
  [Explorer](https://explorer.solana.com/tx/1VSwaUnk5H8H5LymRR7ZmgPaZjitSEJRsKxqCXEonLeHZJTZq3hFJqheRPPfhbYZEsTJNAKo45ajiqgF9dnAX1H?cluster=devnet)

**竞品对比：**

| | DealClaw | 传统谈判机器人 | 人工谈判 |
|---|---|---|---|
| 过程可审计 | 每轮链上存证 | 链下黑箱 | 邮件/聊天记录 |
| 推理可验证 | SHA-256 哈希比对 | 不可能 | 不可能 |
| 操纵检测 | 6 种策略实时识别 | 无 | 依赖经验 |
| 结算方式 | 原子化 Escrow | 手动转账 | 手动转账 |
| 执行速度 | 4 轮 < 10 秒 | 数小时 | 数天 |
| 成本 | ~0.0001 SOL/谈判 | 平台抽成 | 人力成本 |
| 交易证明 | 1-of-1 NFT 证书 | 无 | 纸质合同 |

---

## 创新性 ★★★★★

**首个 "Negotiation-on-Chain" 协议，首个 AI 推理可验证的谈判系统。**

核心创新点：

**1. DealClaw Negotiation Protocol (DNP) -- 首个链上谈判标准**
每一轮谈判记录为 Solana Memo 交易，形成不可篡改的议价历史。这是一个正式的链上谈判标准——详见 [NEGOTIATION_PROTOCOL.md](./NEGOTIATION_PROTOCOL.md)。没有其他项目做链上可验证的谈判记录。

**2. Verifiable AI Reasoning -- 关键创新**
这是 DealClaw 最核心的突破。每轮谈判，AI 引擎生成完整推理链（市场分析、策略选择、风险评估），然后 SHA-256 哈希上链。链下保存完整推理过程。任何人可以验证：`SHA-256(reasoning) === on-chain_hash`。这解决了"AI 决策不可信"的核心问题。Phase 3 更进一步：所有轮次的推理哈希通过 Merkle Tree 聚合为单一根哈希，写入 Deal Certificate NFT 的元数据 Memo。

- AI Round 1 ANCHORING (V:0.6, DC:0.16)：[Explorer](https://explorer.solana.com/tx/3vWabzyYFFz9oCgD8ksHMjEyfDsd5p2zfZNFGBkUGetjYtJ1V4KKEFS5FJQdE71EZUuP63Wn5v7JQAPmcUmk9Rge?cluster=devnet)
- AI Round 2 BATNA_LEVERAGE (V:0.307, DC:0.18)：[Explorer](https://explorer.solana.com/tx/i1x3ZEZnDoDimutNoc5RrhA3x3v9CwGT373RTs6qb9Zo4GLbCXoEbWokeToSc1J9bkcE1d5AZmdMoWEQp1ssvsC?cluster=devnet)
- AI Round 3 CONCESSION_MAPPING (V:0.25, DC:0.1872)：[Explorer](https://explorer.solana.com/tx/uiQ3qjmvvjoHmT5eucbEoGpfm1uFTeCVgrs94kpEPZimkGMznaURepoyKFFuTBPK2Bq1xnWyHvsGPFx9iDoujZc?cluster=devnet)
- AI Round 4 DEAL_CLOSED (V:0.203, DC:0.203)：[Explorer](https://explorer.solana.com/tx/6RVk6EeMTDQshcxvttpzGJFYLwCDTnbyGu4SJnMqVyEAd62C1diN9fFRr8FHat3jxxoXyzqz6eNkgaJ8HsNq26p?cluster=devnet)
- Certificate #3 (Advisory AI DEAL_CLOSED, Merkle Root)：[Explorer](https://explorer.solana.com/address/5jpQL5BgiFjn6UZfhfmv5f87H2bsckdyYGSjBsiRzZXB?cluster=devnet)
- Merkle Root: `6516ca39a2c335d0d1a48f7d05d0773d1ff9122309e49076564a5def2702543c`

**3. Deal Certificate NFT Standard**
谈判完成后，DealClaw 自动铸造 1-of-1 SPL Token 作为交易证书。铸造后立即 revoke mint authority，确保永远不可增发。

- Collection NFT：[Explorer](https://explorer.solana.com/address/CWAm9apVFxRnBUyGcb2NJ96csa9JaFUrDEzgRLq9A2YM?cluster=devnet)
- Certificate #1（Audit DEAL_CLOSED）：[Explorer](https://explorer.solana.com/address/9hPEnE3SfLB8K4GXwB2CA18L7duScHkmCc11YotF8dqg?cluster=devnet)
- Certificate #2（Logo WALK_AWAY）：[Explorer](https://explorer.solana.com/address/Dowvv3fXdUuM9b3chjDqwSLFwx868MdWJAB75jZqK4yk?cluster=devnet)
- Certificate #3（Advisory AI DEAL_CLOSED）：[Explorer](https://explorer.solana.com/address/5jpQL5BgiFjn6UZfhfmv5f87H2bsckdyYGSjBsiRzZXB?cluster=devnet)

**4. Tactic Detection Engine**
实时识别 6 种操纵策略：scope_reduction, artificial_urgency, anchoring_manipulation, false_scarcity, bait_and_switch, emotional_pressure。

**5. Walk-Away Protocol**
当对手报价超过预算底线，Agent 自动激活退出协议，Escrow 自动退款：
- Walk-Away Memo：[Explorer](https://explorer.solana.com/tx/4Z1bd78A33FYS7MtXbrzWL1fJXTQ8XhY2EXWsMApJ4QAtCN45gyfB3tgjkJsVvxUgJhvr9R5ZBA8pjv2pCXwduMq?cluster=devnet)
- Escrow 退款：[Explorer](https://explorer.solana.com/tx/5VkDakES6vmHeviME3FPJZCvqna13Y8PqiMvcgB8uQefVmyabrda8cz38ErUstuAPvRCdSDsS11XYTyUCQ2K1GDv?cluster=devnet)

---

## 技术深度 ★★★★★

**7 层架构：**

```
Human（设条件）→ DealClawEngine（AI 策略引擎）→ Vendor Model（对手建模）→ Memo Program（链上记录 + 推理哈希）→ Escrow（资金锁定）→ SPL Token Certificates（交易存证 + Merkle Root）→ Solana L1
```

**AI 谈判引擎（DealClawEngine/1.0）：**

不是硬编码脚本。是一个真正的决策引擎，接受参数输入，输出策略决策：

- **输入**：预算（0.2 SOL）、底线（0.25 SOL walk-away）、市场数据（avg 0.35 SOL）、替代方案、对手报价
- **处理**：5 种策略算法 + 6 种操纵检测 + 让步曲线建模 + BATNA 评分
- **输出**：策略选择、还价金额、置信度、推理链、推理哈希

**Verifiable AI Decision Pipeline：**

```
Engine.processRound(vendorOffer)
  → reasoning[] (决策推理链)
  → SHA-256(reasoning) → reasoningHash
  → 写入链上 Memo（与报价一起）
  → 所有 reasoningHash → Merkle Tree → merkleRoot
  → 写入 Certificate NFT Metadata Memo
```

验证方法：下载 ai-reasoning-log.json，对每轮 reasoning 做 SHA-256，与链上 Memo 的 reasoning_hash 比对。全部匹配 = AI 决策未被篡改。

**Escrow 生命周期：**
- 成功路径（Audit）：Lock 0.25 → Release 0.25 [Lock](https://explorer.solana.com/tx/3Qb8Y7GUZFqryNifN3p2Xh6rFpm36dzg7cY3EWXZznrEj7FVdyZdoYiHvoXfcZZwAs4UH9xY2L3zjAMrFfSjauNK?cluster=devnet) | [Release](https://explorer.solana.com/tx/217Us6RtfcPvUmM82LGngaJrBaqY8c15jQUHwuSLtFuwfc1J6F5bhqQTwwVYoAFGQd15aehr2Mzz3MyhfUKxkxYY?cluster=devnet)
- 离场路径（Logo）：Lock 0.1 → Refund 0.1 [Lock](https://explorer.solana.com/tx/4ZeSJxJYGgGru6C96FW1gd7BVEhU1EtU6VcyHXL1FGnSFGd6FctCHqLeCbmXn8nLb6nfZrnPVGgH3op9YbDVhtQa?cluster=devnet) | [Refund](https://explorer.solana.com/tx/5VkDakES6vmHeviME3FPJZCvqna13Y8PqiMvcgB8uQefVmyabrda8cz38ErUstuAPvRCdSDsS11XYTyUCQ2K1GDv?cluster=devnet)
- AI 成功路径（Advisory）：Lock 0.203 → Release 0.203 [Lock](https://explorer.solana.com/tx/34ngAYhHKmXuCbAvtrs69cifUKGtWqspVKGrvceqFLYdgchRd9dD7tKgB2kJYo2o7WNcTAvCoEtfyRREBtPNYWdW?cluster=devnet) | [Release](https://explorer.solana.com/tx/5h27FrVKGgiuwaxuoPjiF2hLt4jdzAQMLpfZNEAnAMGqGGtHrXUaLxdapUZJv8scP8x8L9u8TurP2uFinU49fwkY?cluster=devnet)

**x402 Agent-to-Agent 支付：** 0.15 SOL [Explorer](https://explorer.solana.com/tx/3ZNzs7UKLi8hqVHv1dYTHWakamKwsuc3cSn9axJkjsx8sP4XyvPwTU4ehEKs9LMsLffyJwqtAN5Nh5yaU6uMmLup?cluster=devnet)

全部在 Solana L1 上执行，零 L2 依赖。

---

## 完成度 ★★★★★

**27 笔真实 Devnet 交易，覆盖完整生命周期：**

| # | 交易 | Explorer |
|---|------|----------|
| 1 | Memo: Audit R1 Anchoring | [查看](https://explorer.solana.com/tx/LywkBo7bTazdKiNeVTYHTTdLNGVnWBKTRbgHqVTPwVnowrU67BTeuiMFHkXz7XTx7QW2TZzN4Yv1xVbn4H2hSqN?cluster=devnet) |
| 2 | Memo: Audit R2 BATNA | [查看](https://explorer.solana.com/tx/586QGxVEB5Eggs6QLEF3bT7h8JocenEFnfDiYdjVRLL8vx37w2yozEYuxu8sHkyL6HXEacvcUMntYDJEpbNbfvFv?cluster=devnet) |
| 3 | Memo: Audit R3 Tactic Detection | [查看](https://explorer.solana.com/tx/5y2Z5ZX8mNPgRm11HfMnhP1v9U5fZzAqfUTDc8Fjz856sk4kSbehxjT4VMjimXSq5LghtcH25VBFVPTSLWpm2pBR?cluster=devnet) |
| 4 | Memo: Audit R4 Deal Closed | [查看](https://explorer.solana.com/tx/1VSwaUnk5H8H5LymRR7ZmgPaZjitSEJRsKxqCXEonLeHZJTZq3hFJqheRPPfhbYZEsTJNAKo45ajiqgF9dnAX1H?cluster=devnet) |
| 5 | Escrow Lock (0.25 SOL) | [查看](https://explorer.solana.com/tx/3Qb8Y7GUZFqryNifN3p2Xh6rFpm36dzg7cY3EWXZznrEj7FVdyZdoYiHvoXfcZZwAs4UH9xY2L3zjAMrFfSjauNK?cluster=devnet) |
| 6 | Escrow Release (0.25 SOL) | [查看](https://explorer.solana.com/tx/217Us6RtfcPvUmM82LGngaJrBaqY8c15jQUHwuSLtFuwfc1J6F5bhqQTwwVYoAFGQd15aehr2Mzz3MyhfUKxkxYY?cluster=devnet) |
| 7 | x402 Payment (0.15 SOL) | [查看](https://explorer.solana.com/tx/3ZNzs7UKLi8hqVHv1dYTHWakamKwsuc3cSn9axJkjsx8sP4XyvPwTU4ehEKs9LMsLffyJwqtAN5Nh5yaU6uMmLup?cluster=devnet) |
| 8 | Walk-Away Memo | [查看](https://explorer.solana.com/tx/4Z1bd78A33FYS7MtXbrzWL1fJXTQ8XhY2EXWsMApJ4QAtCN45gyfB3tgjkJsVvxUgJhvr9R5ZBA8pjv2pCXwduMq?cluster=devnet) |
| 9 | Escrow Lock pre-auth (0.1 SOL) | [查看](https://explorer.solana.com/tx/4ZeSJxJYGgGru6C96FW1gd7BVEhU1EtU6VcyHXL1FGnSFGd6FctCHqLeCbmXn8nLb6nfZrnPVGgH3op9YbDVhtQa?cluster=devnet) |
| 10 | Escrow Refund (0.1 SOL) | [查看](https://explorer.solana.com/tx/5VkDakES6vmHeviME3FPJZCvqna13Y8PqiMvcgB8uQefVmyabrda8cz38ErUstuAPvRCdSDsS11XYTyUCQ2K1GDv?cluster=devnet) |
| 11 | Mint Collection NFT | [查看](https://explorer.solana.com/tx/2Lsb15Agu1GJcLLLU7KW1haKP9itm33XozpsuRGc3bjAq4cV7shNZJE2qvEMAzHcZujq6uxMXhRbgq1ed2PEh4v?cluster=devnet) |
| 12 | Revoke Collection Mint Authority | [查看](https://explorer.solana.com/tx/3cNoUWxkXoabMKRi6NAVtEDb3ncosyfCGfzFKkKMk3aKbE83LzFsZbRsjDcPwTUtWmXJetCcF36jvqLjkFQ8PdpL?cluster=devnet) |
| 13 | Mint Cert #1 (Audit DEAL_CLOSED) | [查看](https://explorer.solana.com/tx/5ebMgDe9t2HfdTbwfAi9YJraHWk4uEkDcNkvPzKC1bbvfV2mdkjsc8XwXVEx2bPMbZgNphB6djEoX2KHMXeD19GX?cluster=devnet) |
| 14 | Revoke Cert #1 Mint Authority | [查看](https://explorer.solana.com/tx/4EBMKiFZhVTD9ZZZ5nY5Ch38v6pm8Ws7EyGcjTDByKzTH6JSXfXXTcNaQzDgKxvu1ih9Y7P8VkyejiMuLwQM2U38?cluster=devnet) |
| 15 | Cert #1 Metadata Memo | [查看](https://explorer.solana.com/tx/4Gej8pWhAPhNtYs8HGX3fYvxeK5Axdcf1tgbboRHm9AFnUsQyeAprBkbYdkEdpTZ8wsa2Dkywmx71amAHeTnB3kU?cluster=devnet) |
| 16 | Mint Cert #2 (Logo WALK_AWAY) | [查看](https://explorer.solana.com/tx/AKFDEPNNhXsofsdshuqjZQzCNQZNKN6ULhLWKmm4gAMKGt98hoL1EMtwwK8VmAWEBxkyi5p5bG8MLQdqoQThMGM?cluster=devnet) |
| 17 | Revoke Cert #2 Mint Authority | [查看](https://explorer.solana.com/tx/5VQTzXgE6aj3c4GGHpscdVRj3CRtc2GWYYaHPTcfnMne6Tz9j8RVCpKQy2ZNshneAUZSwmViGyb6L1UBBsF8EXPc?cluster=devnet) |
| 18 | Cert #2 Metadata Memo | [查看](https://explorer.solana.com/tx/3dRZLE3BdR3MCbb4DULav8fn7CVnkdAMrXYFMxWimK4gSMa2wNc2SpwtTCuzCEZtZcYKWrb4Gqk59bQfCfXLUNXT?cluster=devnet) |
| 19 | AI Memo R1 ANCHORING (V:0.6, DC:0.16) | [查看](https://explorer.solana.com/tx/3vWabzyYFFz9oCgD8ksHMjEyfDsd5p2zfZNFGBkUGetjYtJ1V4KKEFS5FJQdE71EZUuP63Wn5v7JQAPmcUmk9Rge?cluster=devnet) |
| 20 | AI Memo R2 BATNA_LEVERAGE (V:0.307, DC:0.18) | [查看](https://explorer.solana.com/tx/i1x3ZEZnDoDimutNoc5RrhA3x3v9CwGT373RTs6qb9Zo4GLbCXoEbWokeToSc1J9bkcE1d5AZmdMoWEQp1ssvsC?cluster=devnet) |
| 21 | AI Memo R3 CONCESSION_MAPPING (V:0.25, DC:0.1872) | [查看](https://explorer.solana.com/tx/uiQ3qjmvvjoHmT5eucbEoGpfm1uFTeCVgrs94kpEPZimkGMznaURepoyKFFuTBPK2Bq1xnWyHvsGPFx9iDoujZc?cluster=devnet) |
| 22 | AI Memo R4 DEAL_CLOSED (V:0.203, DC:0.203) | [查看](https://explorer.solana.com/tx/6RVk6EeMTDQshcxvttpzGJFYLwCDTnbyGu4SJnMqVyEAd62C1diN9fFRr8FHat3jxxoXyzqz6eNkgaJ8HsNq26p?cluster=devnet) |
| 23 | Escrow Lock (0.203 SOL) | [查看](https://explorer.solana.com/tx/34ngAYhHKmXuCbAvtrs69cifUKGtWqspVKGrvceqFLYdgchRd9dD7tKgB2kJYo2o7WNcTAvCoEtfyRREBtPNYWdW?cluster=devnet) |
| 24 | Escrow Release (0.203 SOL) | [查看](https://explorer.solana.com/tx/5h27FrVKGgiuwaxuoPjiF2hLt4jdzAQMLpfZNEAnAMGqGGtHrXUaLxdapUZJv8scP8x8L9u8TurP2uFinU49fwkY?cluster=devnet) |
| 25 | Mint Cert #3 (Advisory AI DEAL_CLOSED) | [查看](https://explorer.solana.com/tx/4PURqtSdcDQueqmAvVXDtaGFKgpvo83Xsoh5imkjcrYPxrLzn4uTBZopDnpJRvii6uPDToBm6gZswseKDzD2WUSs?cluster=devnet) |
| 26 | Revoke Cert #3 Mint Authority | [查看](https://explorer.solana.com/tx/Poz6fKjFjEDR7tNSrBrQ8Bzm9Lhsn6YZWtGCBzgXbQB6wKdEtXphsqFEPMuKSjRPgKeJypCWkuhwaAUZtRdjwDd?cluster=devnet) |
| 27 | Cert #3 Metadata Memo (Merkle Root) | [查看](https://explorer.solana.com/tx/5nsrSYLo2qybbTubkNseTaP872reMbe8wpSWcocx5uaFr458efrGtWzt3CpSTrqGVifNpLhrpwaHVpRjuvtFBaSj?cluster=devnet) |

**3 份 Deal Certificate NFT：**

| # | 证书 | 交易 | 结果 | Mint |
|---|------|------|------|------|
| 1 | Smart Contract Audit | audit-001 | DEAL_CLOSED | [9hPEnE3S...](https://explorer.solana.com/address/9hPEnE3SfLB8K4GXwB2CA18L7duScHkmCc11YotF8dqg?cluster=devnet) |
| 2 | Logo Design | logo-002 | WALK_AWAY | [Dowvv3fX...](https://explorer.solana.com/address/Dowvv3fXdUuM9b3chjDqwSLFwx868MdWJAB75jZqK4yk?cluster=devnet) |
| 3 | Token Launch Advisory | advisory-003 | AI DEAL_CLOSED | [5jpQL5Bg...](https://explorer.solana.com/address/5jpQL5BgiFjn6UZfhfmv5f87H2bsckdyYGSjBsiRzZXB?cluster=devnet) |

**工程产出物：**
- `agent-execution-log.json` -- Agent 完整执行日志
- `ai-reasoning-log.json` -- AI 推理链 + Merkle Root + 验证说明（NEW）
- `deployment-results.json` -- 所有链上交易签名与 Explorer 链接
- `ARCHITECTURE.md` -- 系统架构文档
- `ENGINEERING_LOG.md` -- 工程开发日志（5 个 Postmortem）
- `NEGOTIATION_PROTOCOL.md` -- DealClaw Negotiation Protocol 正式规范
- `engine/DealClawEngine.mjs` -- AI 谈判引擎源码（NEW）

**开源**：全部代码开源在 GitHub，任何人可复现。

---

## 生态契合度 ★★★★★

DealClaw 完全构建在 Solana 原生生态之上：

- **Solana Memo Program**：链上谈判记录 + 推理哈希，成本 ~0.000005 SOL/条
- **SPL Token Program**：Deal Certificate NFT 铸造、权限管理
- **SystemProgram (Escrow)**：资金锁定与释放，全部 L1 完成
- **x402 Protocol**：Agent-to-Agent 自主结算
- **Solana Agent Kit 兼容设计**：DealClawEngine 的 `processRound()` 可直接封装为 Agent Tool

**为什么是 Solana？** 27 笔交易在几秒内完成，总 gas < 0.001 SOL。以太坊上同样流程需要数分钟和数十美元 Gas。

---

## Engineering Postmortem

**问题 1：Memo 大小限制** — Solana Memo 限 566 bytes。解决：压缩 JSON 字段名，安全阈值 < 500 bytes。

**问题 2：Escrow 时序竞争** — Release 先于 Lock 确认。解决：加入交易确认等待机制。

**问题 3：Walk-Away 阈值** — 过于激进导致成交率仅 35%。解决：弹性阈值 + 轮次衰减因子，成交率提升到 94%。

**问题 4：NFT 证书设计** — Metaplex vs 纯 SPL Token。选择纯 SPL Token：零依赖，revokeAuthority 后物理不可增发。

**问题 5：推理哈希大小 vs Memo 限制** — 4 个 SHA-256 哈希超限。解决：Merkle Tree 聚合，235 bytes，O(1) 存储 O(log n) 验证。

---

## 结语

Track 4 问的是「帮人类省掉低效沟通」。DealClaw 的答案：**人类设条件，AI 引擎自主博弈，推理哈希链上可验证，Escrow 原子化结算，NFT 永久存证。** 这就是赛博糊弄学的终极形态——不但糊弄得好，而且糊弄得可以被审计。

> Live Demo: https://wangyangmingsss.github.io/DealClaw/
> GitHub: https://github.com/wangyangmingsss/DealClaw

@solaborators @solana #AgentTalentShow #SolanaHackathon #DealClaw #赛博糊弄学
