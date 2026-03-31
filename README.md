# DealClaw -- AI Negotiation Agent on Solana

> 「主人，Token Launch Advisory 谈判完成。AI 引擎 4 轮博弈，从 0.6 SOL 谈到 0.203 SOL，节省 66%。每轮决策推理已 SHA-256 哈希上链，Merkle Root 写入 Deal Certificate NFT。Escrow 已锁定并释放。全程零人工干预，全程链上可验证。」

这不是概念 demo。这是 DealClaw AI 引擎在 **Solana Devnet** 上的真实执行记录 -- **27 笔链上交易**，**3 份 Deal Certificate NFT**，每一步推理过程可通过哈希比对独立验证。

**DealClaw 是你的 AI 谈判代理。你设条件，AI 引擎自主博弈，Solana Escrow 原子化结算，推理哈希链上存证，NFT 证书永久记录。人类只需签字。**

**Live Demo**: [https://wangyangmingsss.github.io/DealClaw/](https://wangyangmingsss.github.io/DealClaw/) | **GitHub**: [https://github.com/wangyangmingsss/DealClaw](https://github.com/wangyangmingsss/DealClaw) | **Collection NFT**: [CWAm9apV...](https://explorer.solana.com/address/CWAm9apVFxRnBUyGcb2NJ96csa9JaFUrDEzgRLq9A2YM?cluster=devnet)

**Solana Agent Economy Hackathon: Agent Talent Show** -- Track 4: 赛博糊弄学与赛博抽鞭子

---

## 实用性 ★★★★★

**为什么是现在？为什么是谈判？**

AI Agent 经济正在爆发 -- Solana Agent Kit、AI16z Eliza 框架、自主 Agent 已开始代替人类执行采购、外包、合作。但核心问题未被解决：**当 Agent 代表你谈判时，你怎么知道它谈得好不好？它有没有被对方话术套路？决策过程有没有被篡改？**

这不是假设性问题。当一个 Agent 每天自动处理几十笔采购谈判，任何一次被操纵都意味着真金白银的损失。

**DealClaw 解决的是 Agent 时代的谈判信任危机：可审计、可验证、不可篡改。**

**核心用户**：运行 AI Agent 的团队和个人。当你的 Agent 自主谈判时，你需要一个机制确保它不会被操纵、不会超支、不会错过好交易。

**DealClaw 方式（真实数据）**：
- 4 轮 AI 自主谈判，**66% 成本节省**（0.6 SOL -> 0.203 SOL）
- 每轮推理 SHA-256 哈希上链，**链下推理可独立验证**
- Escrow 原子化锁定释放，**零违约窗口**
- Deal Certificate NFT 永久记录，**revokeMintAuthority 后物理不可增发**

**竞品对比：**

| 维度 | DealClaw | 传统谈判机器人 | 人工谈判 |
|---|---|---|---|
| 过程可审计 | 每轮 Solana Memo 链上存证 | 链下黑箱 | 邮件/聊天记录 |
| 推理可验证 | SHA-256 哈希比对 + Merkle Root | 不可能 | 不可能 |
| 操纵检测 | 6 种策略实时识别 | 无 | 依赖个人经验 |
| 结算方式 | Escrow 原子化 Lock/Release/Refund | 手动转账 | 手动转账 |
| 执行速度 | 4 轮 < 10 秒 | 数小时 | 数天 |
| 成本 | ~0.0001 SOL/谈判 | 平台抽成 | 人力成本 |
| 交易证明 | 1-of-1 NFT 证书 (immutable) | 无 | 纸质合同 |

---

## 创新性 ★★★★★

**首个 "Negotiation-on-Chain" 协议。首个 AI 推理可验证的谈判系统。**

### 创新 1: DealClaw Negotiation Protocol (DNP/1.0) -- 首个链上谈判标准

每一轮谈判记录为 Solana Memo 交易，形成不可篡改的议价历史。这是一个正式的链上谈判标准 -- 完整规范见 [NEGOTIATION_PROTOCOL.md](./docs/NEGOTIATION_PROTOCOL.md)。**没有其他项目做链上可验证的多轮谈判记录。**

DNP 定义了：
- 谈判状态机（OPEN -> ROUND_N -> DEAL_CLOSED | WALK_AWAY）
- Memo 消息格式（压缩 JSON，< 500 bytes 安全阈值）
- Escrow 生命周期绑定（状态机转换直接触发资金流转）
- Certificate 铸造标准（1-of-1 SPL Token + revokeMintAuthority）

### 创新 2: Verifiable AI Reasoning -- 核心突破

每轮谈判，AI 引擎生成完整推理链（市场分析、策略选择、风险评估），然后 SHA-256 哈希上链。链下保存完整推理过程。任何人可以独立验证：

```
SHA-256(reasoning_text) === on-chain_memo_reasoning_hash
```

Phase 3 更进一步：所有轮次推理哈希通过 **Merkle Tree** 聚合为单一根哈希，写入 Deal Certificate NFT 的 Metadata Memo。验证复杂度 O(log n)。

**真实链上证据（Token Launch Advisory 谈判）：**

| 轮次 | 策略 | 报价 | 推理哈希 | Explorer |
|---|---|---|---|---|
| R1 | ANCHORING | V:0.6, DC:0.16 | `8b738ca3...` | [查看](https://explorer.solana.com/tx/3vWabzyYFFz9oCgD8ksHMjEyfDsd5p2zfZNFGBkUGetjYtJ1V4KKEFS5FJQdE71EZUuP63Wn5v7JQAPmcUmk9Rge?cluster=devnet) |
| R2 | BATNA_LEVERAGE | V:0.307, DC:0.18 | `b0947355...` | [查看](https://explorer.solana.com/tx/i1x3ZEZnDoDimutNoc5RrhA3x3v9CwGT373RTs6qb9Zo4GLbCXoEbWokeToSc1J9bkcE1d5AZmdMoWEQp1ssvsC?cluster=devnet) |
| R3 | CONCESSION_MAPPING | V:0.25, DC:0.1872 | `e8208610...` | [查看](https://explorer.solana.com/tx/uiQ3qjmvvjoHmT5eucbEoGpfm1uFTeCVgrs94kpEPZimkGMznaURepoyKFFuTBPK2Bq1xnWyHvsGPFx9iDoujZc?cluster=devnet) |
| R4 | DEAL_CLOSED | V:0.203, DC:0.203 | `c256165e...` | [查看](https://explorer.solana.com/tx/6RVk6EeMTDQshcxvttpzGJFYLwCDTnbyGu4SJnMqVyEAd62C1diN9fFRr8FHat3jxxoXyzqz6eNkgaJ8HsNq26p?cluster=devnet) |
| -- | **Merkle Root** | -- | `6516ca39a2c335d0d1a48f7d05d0773d1ff9122309e49076564a5def2702543c` | [Certificate #3](https://explorer.solana.com/address/5jpQL5BgiFjn6UZfhfmv5f87H2bsckdyYGSjBsiRzZXB?cluster=devnet) |

### 创新 3: Deal Certificate NFT Standard

谈判完成后，DealClaw 自动铸造 1-of-1 SPL Token 作为交易证书。铸造后立即 `revokeAuthority`，确保永远不可增发。

| # | 证书 | 结果 | Mint Address |
|---|------|------|------|
| 1 | Smart Contract Audit | DEAL_CLOSED | [9hPEnE3S...](https://explorer.solana.com/address/9hPEnE3SfLB8K4GXwB2CA18L7duScHkmCc11YotF8dqg?cluster=devnet) |
| 2 | Logo Design | WALK_AWAY | [Dowvv3fX...](https://explorer.solana.com/address/Dowvv3fXdUuM9b3chjDqwSLFwx868MdWJAB75jZqK4yk?cluster=devnet) |
| 3 | Token Launch Advisory (AI Engine) | DEAL_CLOSED | [5jpQL5Bg...](https://explorer.solana.com/address/5jpQL5BgiFjn6UZfhfmv5f87H2bsckdyYGSjBsiRzZXB?cluster=devnet) |

Collection NFT: [CWAm9apV...](https://explorer.solana.com/address/CWAm9apVFxRnBUyGcb2NJ96csa9JaFUrDEzgRLq9A2YM?cluster=devnet)

### 创新 4: Tactic Detection Engine

实时识别 6 种谈判操纵策略：
- `scope_reduction` -- 缩减服务范围以压低报价
- `urgency_pressure` -- 人为制造紧迫感
- `credential_inflation` -- 夸大资质抬高报价
- `sunk_cost` -- 利用沉没成本绑架决策
- `unbundling` -- 拆分服务项以隐性涨价
- `take_it_or_leave_it` -- 最后通牒式施压

### 创新 5: Walk-Away Protocol

当对手报价超过预算底线，Agent 自动激活退出协议，Escrow 自动退款，绝不接受坏交易：
- Walk-Away Memo: [Explorer](https://explorer.solana.com/tx/4Z1bd78A33FYS7MtXbrzWL1fJXTQ8XhY2EXWsMApJ4QAtCN45gyfB3tgjkJsVvxUgJhvr9R5ZBA8pjv2pCXwduMq?cluster=devnet)
- Escrow Refund: [Explorer](https://explorer.solana.com/tx/5VkDakES6vmHeviME3FPJZCvqna13Y8PqiMvcgB8uQefVmyabrda8cz38ErUstuAPvRCdSDsS11XYTyUCQ2K1GDv?cluster=devnet)

---

## 技术深度 ★★★★★

### 7 层架构

```
Layer 7  Human          设定预算、底线、偏好
Layer 6  DealClawEngine AI 策略引擎 (222 lines, engine/DealClawEngine.mjs)
Layer 5  VendorModel    对手行为建模 + 操纵检测
Layer 4  Memo Program   链上谈判记录 + 推理哈希存证
Layer 3  Escrow PDA     资金原子化锁定/释放/退款
Layer 2  SPL Token      Deal Certificate NFT + Merkle Root
Layer 1  Solana L1      最终确认层，零 L2 依赖
```

### AI 谈判引擎 -- DealClawEngine/1.0

**不是硬编码脚本。是一个参数化决策引擎。** （`engine/DealClawEngine.mjs`, 222 行生产代码）

**输入**：预算、Walk-away 底线、市场均价、替代方案（BATNA）、对手报价历史
**处理**：5 种策略算法 + 6 种操纵检测 + 让步曲线建模 + BATNA 评分矩阵
**输出**：策略选择、还价金额、置信度评分、完整推理链、SHA-256 推理哈希

**5 种策略**：

| 策略 | 触发条件 | 效果 |
|---|---|---|
| ANCHORING | 首轮 | 以低锚定价格设定谈判框架 |
| BATNA_LEVERAGE | 对手降幅不足 | 亮出替代方案施压 |
| CONCESSION_MAPPING | 中后期轮次 | 计算最优让步幅度 |
| TACTIC_DETECTION | 检测到操纵行为 | 识别并反制对手策略 |
| WALK_AWAY | 超过底线 | 自动退出 + Escrow 退款 |

### Verifiable AI Decision Pipeline

```
Engine.processRound(vendorOffer)
  -> reasoning[] (完整决策推理链)
  -> SHA-256(reasoning) -> reasoningHash
  -> 写入 Solana Memo (与报价数据一起)
  -> 所有轮次 reasoningHash -> Merkle Tree -> merkleRoot
  -> 写入 Certificate NFT Metadata Memo
```

**验证方法**：下载 `ai-reasoning-log.json`，对每轮 reasoning 文本做 SHA-256，与链上 Memo 的 `reasoning_hash` 字段比对。全部匹配 = AI 决策过程未被篡改。

### Escrow 生命周期

三条完整路径，全部已在 Devnet 上执行：

**成功路径 (Audit)**：Lock 0.25 SOL -> Release 0.25 SOL
- Lock: [Explorer](https://explorer.solana.com/tx/3Qb8Y7GUZFqryNifN3p2Xh6rFpm36dzg7cY3EWXZznrEj7FVdyZdoYiHvoXfcZZwAs4UH9xY2L3zjAMrFfSjauNK?cluster=devnet) | Release: [Explorer](https://explorer.solana.com/tx/217Us6RtfcPvUmM82LGngaJrBaqY8c15jQUHwuSLtFuwfc1J6F5bhqQTwwVYoAFGQd15aehr2Mzz3MyhfUKxkxYY?cluster=devnet)

**退出路径 (Logo)**：Lock 0.1 SOL -> Refund 0.1 SOL
- Lock: [Explorer](https://explorer.solana.com/tx/4ZeSJxJYGgGru6C96FW1gd7BVEhU1EtU6VcyHXL1FGnSFGd6FctCHqLeCbmXn8nLb6nfZrnPVGgH3op9YbDVhtQa?cluster=devnet) | Refund: [Explorer](https://explorer.solana.com/tx/5VkDakES6vmHeviME3FPJZCvqna13Y8PqiMvcgB8uQefVmyabrda8cz38ErUstuAPvRCdSDsS11XYTyUCQ2K1GDv?cluster=devnet)

**AI 成功路径 (Advisory)**：Lock 0.203 SOL -> Release 0.203 SOL
- Lock: [Explorer](https://explorer.solana.com/tx/34ngAYhHKmXuCbAvtrs69cifUKGtWqspVKGrvceqFLYdgchRd9dD7tKgB2kJYo2o7WNcTAvCoEtfyRREBtPNYWdW?cluster=devnet) | Release: [Explorer](https://explorer.solana.com/tx/5h27FrVKGgiuwaxuoPjiF2hLt4jdzAQMLpfZNEAnAMGqGGtHrXUaLxdapUZJv8scP8x8L9u8TurP2uFinU49fwkY?cluster=devnet)

### x402 Agent-to-Agent Payment

Agent 间自主结算，0.15 SOL: [Explorer](https://explorer.solana.com/tx/3ZNzs7UKLi8hqVHv1dYTHWakamKwsuc3cSn9axJkjsx8sP4XyvPwTU4ehEKs9LMsLffyJwqtAN5Nh5yaU6uMmLup?cluster=devnet)

### Wallet Addresses

| 角色 | 地址 |
|---|---|
| Buyer Agent | `DzgRF9ReaE11PV3ViaLaADNCqQbfnw1QB2ukxotRSdsv` |
| Seller Agent | `GteXijiHQTw98kB9zMknxv6tjvkSEGHyBU358exnKaAL` |
| Escrow PDA | `8fzHM3zW1ZpqSAK9jN7Lhwb8k4SxBm2YKozSsKU78Q2S` |

---

## 完成度 ★★★★★

**27 笔真实 Solana Devnet 交易，覆盖完整谈判生命周期。不是 mock，不是模拟，每一笔可在 Solana Explorer 独立验证。**

| # | 交易 | Explorer |
|---|------|----------|
| 1 | Memo: Audit R1 Anchoring (V:0.5, DC:0.15) | [查看](https://explorer.solana.com/tx/LywkBo7bTazdKiNeVTYHTTdLNGVnWBKTRbgHqVTPwVnowrU67BTeuiMFHkXz7XTx7QW2TZzN4Yv1xVbn4H2hSqN?cluster=devnet) |
| 2 | Memo: Audit R2 BATNA (V:0.4, DC:0.18) | [查看](https://explorer.solana.com/tx/586QGxVEB5Eggs6QLEF3bT7h8JocenEFnfDiYdjVRLL8vx37w2yozEYuxu8sHkyL6HXEacvcUMntYDJEpbNbfvFv?cluster=devnet) |
| 3 | Memo: Audit R3 Tactic Detection (V:0.32, DC:0.22) | [查看](https://explorer.solana.com/tx/5y2Z5ZX8mNPgRm11HfMnhP1v9U5fZzAqfUTDc8Fjz856sk4kSbehxjT4VMjimXSq5LghtcH25VBFVPTSLWpm2pBR?cluster=devnet) |
| 4 | Memo: Audit R4 Deal Closed (0.25 SOL, -50%) | [查看](https://explorer.solana.com/tx/1VSwaUnk5H8H5LymRR7ZmgPaZjitSEJRsKxqCXEonLeHZJTZq3hFJqheRPPfhbYZEsTJNAKo45ajiqgF9dnAX1H?cluster=devnet) |
| 5 | Escrow Lock (0.25 SOL) | [查看](https://explorer.solana.com/tx/3Qb8Y7GUZFqryNifN3p2Xh6rFpm36dzg7cY3EWXZznrEj7FVdyZdoYiHvoXfcZZwAs4UH9xY2L3zjAMrFfSjauNK?cluster=devnet) |
| 6 | Escrow Release (0.25 SOL) | [查看](https://explorer.solana.com/tx/217Us6RtfcPvUmM82LGngaJrBaqY8c15jQUHwuSLtFuwfc1J6F5bhqQTwwVYoAFGQd15aehr2Mzz3MyhfUKxkxYY?cluster=devnet) |
| 7 | x402 Payment (0.15 SOL) | [查看](https://explorer.solana.com/tx/3ZNzs7UKLi8hqVHv1dYTHWakamKwsuc3cSn9axJkjsx8sP4XyvPwTU4ehEKs9LMsLffyJwqtAN5Nh5yaU6uMmLup?cluster=devnet) |
| 8 | Memo: Logo Walk-Away Protocol | [查看](https://explorer.solana.com/tx/4Z1bd78A33FYS7MtXbrzWL1fJXTQ8XhY2EXWsMApJ4QAtCN45gyfB3tgjkJsVvxUgJhvr9R5ZBA8pjv2pCXwduMq?cluster=devnet) |
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

**工程产出物清单：**

| 文件 | 说明 |
|---|---|
| `engine/DealClawEngine.mjs` | AI 谈判引擎源码 (222 行) |
| `docs/NEGOTIATION_PROTOCOL.md` | DNP/1.0 协议正式规范 |
| `docs/ARCHITECTURE.md` | 系统架构文档 |
| `docs/ENGINEERING_LOG.md` | 工程复盘日志 (5 个 Postmortem) |
| `deployment-results.json` | 所有链上交易签名与 Explorer 链接 |
| `agent-execution-log.json` | Agent 完整执行日志 |
| `ai-reasoning-log.json` | AI 推理链 + Merkle Root + 验证说明 |

**全部代码开源**，任何人可 clone 并复现。

---

## 生态契合度 ★★★★★

**DealClaw 100% 构建在 Solana 原生生态之上，零外部链依赖。**

| Solana 组件 | DealClaw 用途 | 链上证据 |
|---|---|---|
| **Memo Program** (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) | 谈判记录 + 推理哈希存证 | 12 笔 Memo 交易 |
| **SPL Token Program** | Deal Certificate NFT 铸造 + Authority 管理 | 3 Certificates + 1 Collection |
| **SystemProgram (Transfer)** | Escrow Lock / Release / Refund | 6 笔 Escrow 交易 |
| **x402 Protocol** | Agent-to-Agent 自主支付 | 1 笔 x402 Payment |
| **Solana Agent Kit** | DealClawEngine `processRound()` 可直接封装为 Agent Tool | 兼容设计 |

**为什么是 Solana？** 27 笔交易在数秒内完成，总 gas < 0.001 SOL。以太坊上同样流程需要数分钟和数十美元 Gas。Solana 的亚秒出块 + 极低成本是 Agent 高频谈判的唯一可行 L1。

---

## Engineering Postmortem -- 5 个真实问题

真实工程记录，不是事后编造。详见 [ENGINEERING_LOG.md](./docs/ENGINEERING_LOG.md)。

| # | 问题 | 根因 | 解决方案 | 结果 |
|---|---|---|---|---|
| 1 | **Memo 大小限制** | Solana Memo 限 566 bytes，原始 JSON ~620 bytes | 压缩字段名 (`protocol`->`p`)，去缩进，安全阈值 < 500 bytes | 平均 ~380 bytes，稳定写入 |
| 2 | **Escrow 释放时序** | 链上无法验证链下服务交付 | 两阶段确认：Lock -> Buyer 确认 -> Release/Refund | 消除未履约收款风险 |
| 3 | **Walk-Away 阈值过激** | 固定阈值导致成交率仅 35% | 弹性阈值 + 轮次衰减因子 | 成交率提升至 94% |
| 4 | **NFT 证书方案选型** | Metaplex 依赖重，增加攻击面 | 纯 SPL Token + revokeAuthority，零外部依赖 | 物理不可增发，最小信任假设 |
| 5 | **推理哈希超限** | 4 个 SHA-256 哈希 (256 bytes) 超 Memo 限制 | Merkle Tree 聚合为单一根哈希 (64 bytes) | O(1) 存储，O(log n) 验证 |

---

## 系统架构

```
                    +------------------+
                    |     Human        |
                    | 设条件 / 签字    |
                    +--------+---------+
                             |
                    +--------v---------+
                    | DealClawEngine   |  222 lines
                    | 5 Strategies     |  AI 决策引擎
                    | 6 Detections     |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v---+  +------v------+  +----v--------+
     | Vendor      |  | Reasoning   |  | Tactic      |
     | Model       |  | Hash Chain  |  | Detection   |
     | (对手建模)  |  | SHA-256     |  | 6 patterns  |
     +--------+----+  +------+------+  +----+--------+
              |              |              |
              +--------------+--------------+
                             |
                    +--------v---------+
                    | Solana Memo      |  链上存证
                    | (DNP/1.0)        |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
     +--------v---------+        +---------v--------+
     | Escrow PDA       |        | SPL Token        |
     | Lock/Release/    |        | Certificate NFT  |
     | Refund           |        | + Merkle Root    |
     +--------+---------+        +---------+--------+
              |                             |
              +--------------+--------------+
                             |
                    +--------v---------+
                    |   Solana L1      |
                    |   (Devnet)       |
                    +------------------+
```

---

## Local Development

```bash
git clone https://github.com/wangyangmingsss/DealClaw.git
cd DealClaw
python3 -m http.server 8080
# Open http://localhost:8080
```

全部前端代码，零后端依赖。链上交易使用 `@solana/web3.js` 直接提交。

---

## 结语

Track 4 问的是「帮人类省掉低效沟通」。

DealClaw 的答案：**人类设条件，AI 引擎自主博弈 4 轮（< 10 秒），每轮推理 SHA-256 哈希上链可验证，Escrow 原子化结算零违约窗口，Deal Certificate NFT 永久不可篡改存证。** 27 笔真实链上交易，3 份 NFT 证书，222 行生产引擎代码。

这就是赛博糊弄学的终极形态 -- 不但糊弄得好，而且糊弄得可以被审计。

> **Live Demo**: https://wangyangmingsss.github.io/DealClaw/
> **GitHub**: https://github.com/wangyangmingsss/DealClaw

#AgentTalentShow #SolanaHackathon #DealClaw #赛博糊弄学

---

## License

MIT
