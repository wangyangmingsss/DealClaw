---
dnp: 1
title: DealClaw Negotiation Protocol (DNP)
status: Living
type: Standards Track
created: 2026-03-31
---

# DNP-1: DealClaw Negotiation Protocol

## 前言 (Preamble)

| 字段 | 值 |
|---|---|
| DNP | 1 |
| 标题 | DealClaw Negotiation Protocol |
| 状态 | Living |
| 类型 | Standards Track |
| 创建日期 | 2026-03-31 |
| 依赖协议 | Solana Memo Program (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`), SPL Token Standard |
| 网络 | Solana (当前部署: Devnet) |

---

## 摘要 (Abstract)

DealClaw Negotiation Protocol (DNP) 定义了一套基于 Solana 区块链的链上谈判存证标准。DNP 规范了 AI 谈判代理（Negotiation Agent）在多轮博弈过程中的消息格式、状态机转换、资金托管生命周期以及交易凭证（Deal Certificate）的铸造标准。协议的核心设计目标是：**使 Agent 间的商业谈判过程具备可审计性、不可篡改性和经济执行力**。

DNP 利用 Solana Memo Program 记录每一轮谈判的结构化数据，通过 Escrow PDA 实现原子化的资金锁定与释放，并以 1-of-1 SPL Token 形式铸造不可变的交易凭证 NFT。协议内置五种博弈策略和六种操纵行为检测机制，为自主 AI 代理提供了完整的谈判执行框架。

---

## 动机 (Motivation)

### 问题陈述

在 AI Agent 自主交易的新范式下，传统商业谈判面临三个根本性缺陷：

1. **不可审计性 (Non-Auditability)**：传统谈判通过邮件、即时消息或口头进行，过程记录分散、易篡改、难以事后验证。当 AI Agent 代表人类执行谈判时，委托人（Human）无法可靠地审计代理的决策过程——Agent 是否遵循了预算约束？是否在不利条件下坚持了退出策略？

2. **执行力缺失 (Lack of Enforcement)**：传统谈判的"达成一致"与"资金结算"是分离的两个环节，中间存在违约窗口。在 Agent-to-Agent 场景下，缺乏原子化的承诺-执行绑定机制意味着协议可以被单方面撕毁而无链上后果。

3. **策略不透明 (Strategy Opacity)**：AI Agent 的谈判策略对委托人而言是黑箱。当 Agent 代理数百万美元的采购谈判时，委托人需要一种机制来验证 Agent 是否采用了合理策略、是否识别并抵御了对方的操纵行为。

### DNP 的解决方案

DNP 通过将谈判过程编码为链上不可变记录，同时将资金流转与谈判状态机绑定，从根本上解决以上问题：

- **逐轮存证**：每一轮谈判的报价、还价、策略选择和决策说明均以结构化 JSON 写入 Solana Memo，形成不可篡改的审计日志。
- **原子化托管**：谈判启动时资金即锁入链上 Escrow，状态机转换（成交/退出）直接触发资金流转，消除违约窗口。
- **策略可验证**：每条 Memo 记录包含策略标识（tactic）和操纵检测结果，委托人可链上验证 Agent 的完整决策链。
- **凭证不可变**：交易结果铸造为 1-of-1 NFT，Mint Authority 立即撤销，形成永久性的链上交易凭证。

---

## 规范 (Specification)

### 1. 消息格式 (Message Format)

每一轮谈判（Round）对应一条 Solana Memo 交易。Memo 的 payload 为以下 JSON 结构：

```json
{
  "protocol": "DNP/1.0",
  "deal_id": "dc_8f3a...b2e1",
  "round": 3,
  "vendor_offer": {
    "amount": 120.0,
    "currency": "SOL",
    "terms": "30-day delivery, no warranty"
  },
  "dealclaw_counter": {
    "amount": 95.5,
    "currency": "SOL",
    "terms": "14-day delivery, 90-day warranty"
  },
  "tactic": "anchoring",
  "note": "Counter anchored at 20% below vendor opening; injecting warranty clause."
}
```

#### 1.1 字段定义 (Field Definitions)

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `protocol` | `string` | YES | 协议版本标识符，当前版本固定为 `"DNP/1.0"`。遵循语义化版本 `DNP/<major>.<minor>` 格式。 |
| `deal_id` | `string` | YES | 全局唯一交易标识符。格式：`dc_` 前缀 + 16 字节十六进制随机数（共 36 字符）。同一谈判的所有轮次共享相同 `deal_id`。 |
| `round` | `uint` | YES | 当前谈判轮次编号，从 `1` 开始单调递增。每条 Memo 的 `round` 值必须严格等于前一条 `round + 1`。 |
| `vendor_offer` | `object` | YES | 卖方（Vendor）本轮报价。包含 `amount`（数值）、`currency`（字符串，如 `"SOL"`）、`terms`（字符串，交付条款）。 |
| `dealclaw_counter` | `object` | YES | DealClaw 代理的还价方案。结构与 `vendor_offer` 相同。当状态为 `DEAL_CLOSED` 时，`amount` 应与 `vendor_offer.amount` 相等。 |
| `tactic` | `string` | YES | 本轮采用的核心策略标识符。有效值见 [策略注册表](#5-策略注册表-tactic-registry)。 |
| `note` | `string` | NO | 策略引擎的决策说明，供事后审计使用。最大 200 字符（UTF-8）。 |

#### 1.2 压缩编码 (Compact Encoding)

Solana Memo Program 对单条 memo 的数据大小限制为 **566 bytes**。为确保所有 DNP 消息均能在该限制内完成链上写入，实现端必须（MUST）遵循以下压缩规范：

| 约束 | 要求 |
|---|---|
| 序列化方式 | `JSON.stringify(obj)` 无缩进、无冗余空格 |
| 字段名压缩 | 链上存储时允许使用简写映射：`p`=protocol, `d`=deal_id, `r`=round, `vo`=vendor_offer, `co`=dealclaw_counter, `t`=tactic, `n`=note |
| 安全阈值 | 实现端应（SHOULD）确保每条 memo < **500 bytes**，预留 66 bytes 给交易元数据 |
| 超限处理 | 若压缩后仍超限，`note` 字段应（SHOULD）首先被截断；若仍超限，`terms` 字段应替换为哈希引用 |

#### 1.3 链上存储策略

DNP 支持两种链上存储模式，由实现端根据消息体积选择：

| 模式 | 链上数据 | 链下数据 | 完整性验证 |
|---|---|---|---|
| **Full Mode** | 完整 JSON（压缩编码后 < 500 bytes） | 无 | 直接读取链上 Memo 数据 |
| **Hash Mode** | `SHA-256(JSON)` 32 bytes | 完整 JSON 存于链下索引 | 链下 JSON 的 SHA-256 哈希值与链上记录比对 |

当前参考实现采用 **Full Mode**，将压缩后的完整 JSON 直接写入 Memo。

### 2. 状态机 (State Machine)

一个 DNP 交易（Deal）的生命周期由以下有限状态机定义：

```
                     ┌─────────────────────────────────────────┐
                     │            (next round)                 │
                     ▼                                         │
  ┌──────────┐   vendor_offer   ┌──────────────┐   agree    ┌─┴───────────┐
  │INITIATING├──────────────────►NEGOTIATING   ├────────────►DEAL_CLOSED  │
  └──────────┘                  └──────┬───────┘            └─────────────┘
                                       │
                            ┌──────────┼──────────┐
                            │          │          │
                         timeout    walk_away  stalemate
                            │          │          │
                            ▼          ▼          ▼
                        ┌──────────────────────────┐
                        │       WALK_AWAY          │
                        └──────────────────────────┘
```

#### 2.1 状态定义

| 状态 | 说明 | 关联链上操作 |
|---|---|---|
| `INITIATING` | 谈判已创建，买方预算已设定，等待卖方首轮报价 | Escrow Lock 交易提交 |
| `NEGOTIATING` | 多轮博弈进行中，双方交替报价与还价 | 每轮写入一条 Memo 交易 |
| `DEAL_CLOSED` | 双方达成一致，`vendor_offer.amount == dealclaw_counter.amount` | 最终轮 Memo + Escrow Release + Certificate Mint |
| `WALK_AWAY` | 谈判终止，未达成协议 | 最终轮 Memo + Escrow Refund + Certificate Mint |

#### 2.2 状态转换规则

| 源状态 | 目标状态 | 触发条件 |
|---|---|---|
| `INITIATING` | `NEGOTIATING` | 收到 `round: 1` 的 `vendor_offer` |
| `NEGOTIATING` | `NEGOTIATING` | `vendor_offer.amount != dealclaw_counter.amount` 且未满足任何退出条件 |
| `NEGOTIATING` | `DEAL_CLOSED` | `vendor_offer.amount == dealclaw_counter.amount`（价格收敛） |
| `NEGOTIATING` | `WALK_AWAY` | 满足以下任一条件：**(a)** 卖方最终报价超出 `walk_away_price`；**(b)** 连续 N 轮（默认 N=3）让步幅度低于阈值（僵持检测）；**(c)** Tactic Detection 识别到高风险操纵策略且卖方拒绝调整；**(d)** 超时（默认 72 小时无新 round） |

> **不变量 (Invariant)**：`DEAL_CLOSED` 和 `WALK_AWAY` 均为终态（Terminal State），一旦进入不可逆转。

### 3. Escrow 生命周期 (Escrow Lifecycle)

Escrow 钱包为 Solana Program Derived Address (PDA)，由 DealClaw 合约逻辑控制。资金流转严格绑定状态机转换。

#### 3.1 Lock (锁定)

```
Buyer Wallet ── transfer(budget_amount) ──► Escrow PDA
```

- **触发时机**：状态进入 `INITIATING` 时
- **金额**：买方设定的预算金额（`budget_amount`），以 lamports 为单位
- **精度规范**：`lamports = Math.floor(price_in_sol * 1_000_000_000)`，确保整数值且向下取整（对买方有利）
- **原子性**：Lock 操作作为单条 Solana 交易执行，交易签名即为锁定凭证
- **约束**：锁定后资金由合约逻辑控制，任何单方无法提取

#### 3.2 Release (释放)

```
Escrow PDA ── transfer(agreed_amount)  ──► Seller Wallet
Escrow PDA ── transfer(remaining)      ──► Buyer Wallet
```

- **触发时机**：状态转换为 `DEAL_CLOSED` 且买方完成二次签名确认
- **金额分配**：`agreed_amount` 为最终成交价；`remaining = budget_amount - agreed_amount` 退回买方
- **验证要求**：合约必须（MUST）验证 DNP 最终轮次的 `dealclaw_counter.amount == vendor_offer.amount`

#### 3.3 Refund (退款)

```
Escrow PDA ── transfer(full_amount) ──► Buyer Wallet
```

- **触发时机**：状态转换为 `WALK_AWAY`
- **金额**：全额退款，`full_amount == budget_amount`
- **附加记录**：退款交易必须（MUST）附带 Memo，注明退出原因代码与最终轮次编号

---

## 4. Deal Certificate 标准 (Deal Certificate Standard)

每笔完成的谈判（无论 `DEAL_CLOSED` 还是 `WALK_AWAY`）均铸造一枚 Deal Certificate NFT，作为该交易的永久性链上凭证。

### 4.1 Token 规范

| 属性 | 要求 |
|---|---|
| Token 标准 | SPL Token (Solana Program Library) |
| 供应量 | 1-of-1（Supply = 1, Decimals = 0） |
| Mint Authority | 铸造完成后立即（MUST）撤销（Revoke），确保不可增发 |
| Freeze Authority | 无（设置为 `null`） |
| 集合归属 | 所有 Certificate 归属于同一 Collection NFT |

### 4.2 Collection NFT

Collection NFT 是所有 Deal Certificate 的父级 Token，用于在链上建立谈判凭证的统一集合关系。

| 属性 | 值 |
|---|---|
| 名称 | `DealClaw Certificates` |
| Mint 地址 | `CWAm9apVFxRnBUyGcb2NJ96csa9JaFUrDEzgRLq9A2YM` |
| 供应量 | 1-of-1 |
| Mint Authority | 已撤销 |

### 4.3 Certificate 元数据

每枚 Certificate 的元数据通过独立的 Memo 交易写入链上，结构如下：

```json
{
  "protocol": "DNP/1.0",
  "type": "DEAL_CERTIFICATE",
  "deal_id": "audit-001",
  "service": "Smart Contract Audit",
  "outcome": "DEAL_CLOSED",
  "final_price": 0.25,
  "currency": "SOL",
  "savings_pct": 50,
  "rounds_total": 4,
  "tactics_used": ["ANCHORING", "BATNA_LEVERAGE", "TACTIC_DETECTION"],
  "mint": "<certificate_mint_address>",
  "collection": "CWAm9apVFxRnBUyGcb2NJ96csa9JaFUrDEzgRLq9A2YM"
}
```

### 4.4 铸造流程

Certificate 的铸造遵循严格的顺序执行协议：

```
1. Mint SPL Token (supply=1, decimals=0)
       │
2. Transfer Token → Buyer Wallet (holder)
       │
3. Revoke Mint Authority → null
       │
4. Write Metadata Memo (certificate details as JSON)
```

> **关键约束**：步骤 3（Revoke）必须（MUST）在步骤 4（Metadata Memo）之前完成。这确保了在元数据上链时，Token 已经是不可变的。任何人均可通过查询 Mint Account 的 `mintAuthority` 字段验证此不变量。

### 4.5 Certificate 语义

| 结果类型 | Certificate 含义 | 附加语义 |
|---|---|---|
| `DEAL_CLOSED` | 证明买方通过 AI 谈判代理以 `final_price` 成功采购了 `service`，节省了 `savings_pct`% | 可作为链上采购凭证、供应商评价依据 |
| `WALK_AWAY` | 证明买方的 AI 代理在不利条件下正确执行了退出策略，保护了 `budget_amount` 的资金安全 | 可作为代理决策质量的证明 |

---

## 5. 策略注册表 (Tactic Registry)

### 5.1 核心谈判策略

DNP 定义了五种核心谈判策略（Tactic），每轮 Memo 的 `tactic` 字段必须（MUST）引用以下注册值之一：

| 策略标识 | 名称 | 说明 | 适用轮次 |
|---|---|---|---|
| `ANCHORING` | 锚定效应 | 首轮报价设定为目标价的 70%-80%，利用认知锚定效应将谈判区间拉向买方有利方向。锚定偏移幅度依据历史成交数据动态校准。 | 通常用于 Round 1 |
| `BATNA_LEVERAGE` | 最佳替代方案杠杆 | 持续评估当前交易的 BATNA (Best Alternative to a Negotiated Agreement)。当卖方报价劣于 BATNA 阈值时，引入替代方案作为谈判筹码。评分模型综合价格、交付周期、服务条款三维度。 | 任意轮次 |
| `CONCESSION_MAPPING` | 让步映射 | 维护让步曲线（Concession Curve），追踪每轮双方让步幅度与速率。分析卖方让步模式（递减型/阶梯型/僵持型），预判对方底线区间。确保己方每轮让步幅度递减，传递"接近底线"信号。 | Round 2+ |
| `TACTIC_DETECTION` | 对手策略识别 | 实时解析卖方行为模式，识别已注册的操纵策略类型（见 5.2 节）。检测结果附加在 `tactic` 字段中，格式：`TACTIC_DETECTION:<manipulation_type>`。 | 任意轮次 |
| `WALK_AWAY` | 退出协议 | 终止谈判的最终策略。触发条件见状态机规范（2.2 节）。触发后 Escrow 执行 Refund，资金原路退回。 | 终止轮 |

此外，`DEAL_CLOSED` 作为特殊终态标识，用于标记双方达成一致的最终轮次。

### 5.2 操纵行为检测类型 (Manipulation Detection Types)

Tactic Detection 模块能够识别以下六种卖方操纵行为。当检测到操纵行为时，`tactic` 字段格式为 `TACTIC_DETECTION:<type>`：

| 操纵类型标识 | 名称 | 行为特征 | Engine 自动应对策略 |
|---|---|---|---|
| `scope_reduction` | 范围缩减 | 卖方在维持报价不变的同时缩小交付范围或降低服务规格 | 重新锚定全范围报价，要求恢复原始交付范围 |
| `urgency_pressure` | 紧迫感施压 | 卖方制造虚假时间压力（如"限时优惠"、"名额即将售罄"），迫使买方在未充分评估下快速成交 | 引入冷静期（Cooling Period），要求延长报价有效期至不少于 48 小时 |
| `credential_inflation` | 资质膨胀 | 卖方夸大团队资质、过往业绩或行业认证 | 要求提供链上可验证凭证（Verifiable Credentials），无法提供则下调信任评分 |
| `sunk_cost` | 沉没成本利用 | 卖方引用双方已投入的谈判时间和精力，施压买方接受不利条款 | 重置谈判基线（Baseline Reset），仅基于当前条款评估，忽略历史投入 |
| `unbundling` | 拆分报价 | 卖方将原本包含在总价中的项目拆分单独计费，隐藏实际总成本 | 要求提供全包价（All-Inclusive Price）进行对比，计算拆分前后总价差异 |
| `take_it_or_leave_it` | 最后通牒 | 卖方发出不可协商的最终报价，拒绝进一步谈判 | 立即触发 BATNA 评估；若 BATNA 评分优于当前报价，激活 Walk-Away Protocol |

---

## 6. 安全考量 (Security Considerations)

### 6.1 Memo 完整性

- **不可篡改性**：一旦 Memo 交易被 Solana 网络确认（finalized），其内容即不可修改或删除。DNP 消息的完整性由 Solana 共识机制保障。
- **轮次连续性验证**：审计方应（SHOULD）验证同一 `deal_id` 下所有 Memo 的 `round` 字段严格递增且无间断。任何缺失的轮次编号应视为协议违规。
- **Hash Mode 安全性**：采用 Hash Mode 时，链下 JSON 的 SHA-256 哈希必须（MUST）与链上 Memo 记录完全匹配。不匹配的记录应被视为已损坏。

### 6.2 Escrow 安全

- **PDA 控制**：Escrow 资金由 Program Derived Address 控制，私钥不存在于任何实体手中，资金仅可通过合约逻辑转移。
- **双签名机制**：Release 操作需要买方钱包的二次签名确认，防止合约逻辑被单方面触发。
- **超时保护**：默认 72 小时超时自动触发 Refund，防止资金被永久锁定。
- **精度安全**：所有 SOL 到 lamports 的转换必须（MUST）使用 `Math.floor()` 取整，并通过 `Number.isInteger()` 断言验证，防止浮点精度错误导致的资金异常。

### 6.3 Certificate 不可变性

- **Mint Authority 撤销**：Certificate 铸造后，Mint Authority 立即设为 `null`。此操作不可逆，确保该 Token 永远不会被增发。
- **验证方法**：任何人均可通过查询 SPL Token Mint Account 的 `mintAuthority` 字段验证该 Certificate 是否为真正的 1-of-1 Token。

### 6.4 隐私考量

- **Full Mode 信息暴露**：Full Mode 下完整谈判数据对所有链上观察者可见，包括报价金额和条款。对隐私敏感的谈判应（SHOULD）使用 Hash Mode。
- **deal_id 不可关联性**：`deal_id` 采用随机生成的十六进制标识符，不包含任何可关联到现实身份的信息。

---

## 7. 参考实现 (Reference Implementation)

### 7.1 部署脚本

本协议的参考实现以 Node.js 脚本形式提供：

| 脚本 | 路径 | 说明 |
|---|---|---|
| Phase 1 部署 | [`deploy-dealclaw.mjs`](../deploy-dealclaw.mjs) | 完整谈判流程部署：Memo 写入、Escrow Lock/Release/Refund、x402 支付 |
| Phase 2 部署 | [`deploy-phase2.mjs`](../deploy-phase2.mjs) | Deal Certificate 铸造：Collection NFT + Certificate Mint + Authority Revoke + Metadata Memo |

### 7.2 已部署网络

| 参数 | 值 |
|---|---|
| 网络 | Solana Devnet |
| Memo Program | `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` |
| Escrow PDA | `8fzHM3zW1ZpqSAK9jN7Lhwb8k4SxBm2YKozSsKU78Q2S` |
| Buyer Wallet | `DzgRF9ReaE11PV3ViaLaADNCqQbfnw1QB2ukxotRSdsv` |
| Seller Wallet | `GteXijiHQTw98kB9zMknxv6tjvkSEGHyBU358exnKaAL` |

---

## 8. 链上部署实例 (On-Chain Deployment Examples)

以下为 DNP 在 Solana Devnet 上的真实部署记录，所有交易均可通过 Solana Explorer 独立验证。

### 8.1 谈判案例 #1：Smart Contract Audit (DEAL_CLOSED)

**谈判参数**：买方预算 0.5 SOL，目标采购智能合约审计服务。

| 轮次 | 卖方报价 | DealClaw 还价 | 策略 | Memo 交易 |
|---|---|---|---|---|
| Round 1 | 0.50 SOL | 0.15 SOL | `ANCHORING` | [Explorer](https://explorer.solana.com/tx/LywkBo7bTazdKiNeVTYHTTdLNGVnWBKTRbgHqVTPwVnowrU67BTeuiMFHkXz7XTx7QW2TZzN4Yv1xVbn4H2hSqN?cluster=devnet) |
| Round 2 | 0.40 SOL | 0.18 SOL | `BATNA_LEVERAGE` | [Explorer](https://explorer.solana.com/tx/586QGxVEB5Eggs6QLEF3bT7h8JocenEFnfDiYdjVRLL8vx37w2yozEYuxu8sHkyL6HXEacvcUMntYDJEpbNbfvFv?cluster=devnet) |
| Round 3 | 0.32 SOL | 0.22 SOL | `TACTIC_DETECTION:scope_reduction` | [Explorer](https://explorer.solana.com/tx/5y2Z5ZX8mNPgRm11HfMnhP1v9U5fZzAqfUTDc8Fjz856sk4kSbehxjT4VMjimXSq5LghtcH25VBFVPTSLWpm2pBR?cluster=devnet) |
| Round 4 | 0.25 SOL | 0.25 SOL | `DEAL_CLOSED` | [Explorer](https://explorer.solana.com/tx/1VSwaUnk5H8H5LymRR7ZmgPaZjitSEJRsKxqCXEonLeHZJTZq3hFJqheRPPfhbYZEsTJNAKo45ajiqgF9dnAX1H?cluster=devnet) |

**结果**：成交价 0.25 SOL，节省 50%。

**Escrow 操作**：

| 操作 | 金额 | 交易 |
|---|---|---|
| Lock (Buyer -> Escrow) | 0.25 SOL | [Explorer](https://explorer.solana.com/tx/3Qb8Y7GUZFqryNifN3p2Xh6rFpm36dzg7cY3EWXZznrEj7FVdyZdoYiHvoXfcZZwAs4UH9xY2L3zjAMrFfSjauNK?cluster=devnet) |
| Release (Escrow -> Seller) | 0.25 SOL | [Explorer](https://explorer.solana.com/tx/217Us6RtfcPvUmM82LGngaJrBaqY8c15jQUHwuSLtFuwfc1J6F5bhqQTwwVYoAFGQd15aehr2Mzz3MyhfUKxkxYY?cluster=devnet) |

**Deal Certificate**：

| 属性 | 值 |
|---|---|
| Mint 地址 | [`9hPEnE3SfLB8K4GXwB2CA18L7duScHkmCc11YotF8dqg`](https://explorer.solana.com/address/9hPEnE3SfLB8K4GXwB2CA18L7duScHkmCc11YotF8dqg?cluster=devnet) |
| 持有者 | `DzgRF9ReaE11PV3ViaLaADNCqQbfnw1QB2ukxotRSdsv` |
| 结果 | `DEAL_CLOSED` |
| Metadata Memo | [Explorer](https://explorer.solana.com/tx/4Gej8pWhAPhNtYs8HGX3fYvxeK5Axdcf1tgbboRHm9AFnUsQyeAprBkbYdkEdpTZ8wsa2Dkywmx71amAHeTnB3kU?cluster=devnet) |

### 8.2 谈判案例 #2：Logo Design (WALK_AWAY)

**谈判参数**：买方预算 0.15 SOL，目标采购 Logo 设计服务。卖方最终报价 0.30 SOL，超出预算 100%。

| 事件 | 交易 |
|---|---|
| Walk-Away Memo | [Explorer](https://explorer.solana.com/tx/4Z1bd78A33FYS7MtXbrzWL1fJXTQ8XhY2EXWsMApJ4QAtCN45gyfB3tgjkJsVvxUgJhvr9R5ZBA8pjv2pCXwduMq?cluster=devnet) |
| Escrow Lock (0.1 SOL pre-auth) | [Explorer](https://explorer.solana.com/tx/4ZeSJxJYGgGru6C96FW1gd7BVEhU1EtU6VcyHXL1FGnSFGd6FctCHqLeCbmXn8nLb6nfZrnPVGgH3op9YbDVhtQa?cluster=devnet) |
| Escrow Refund (0.1 SOL -> Buyer) | [Explorer](https://explorer.solana.com/tx/5VkDakES6vmHeviME3FPJZCvqna13Y8PqiMvcgB8uQefVmyabrda8cz38ErUstuAPvRCdSDsS11XYTyUCQ2K1GDv?cluster=devnet) |

**结果**：BATNA 评估后激活 Walk-Away Protocol，资金全额退回买方。

**Deal Certificate**：

| 属性 | 值 |
|---|---|
| Mint 地址 | [`Dowvv3fXdUuM9b3chjDqwSLFwx868MdWJAB75jZqK4yk`](https://explorer.solana.com/address/Dowvv3fXdUuM9b3chjDqwSLFwx868MdWJAB75jZqK4yk?cluster=devnet) |
| 持有者 | `DzgRF9ReaE11PV3ViaLaADNCqQbfnw1QB2ukxotRSdsv` |
| 结果 | `WALK_AWAY` |
| Metadata Memo | [Explorer](https://explorer.solana.com/tx/3dRZLE3BdR3MCbb4DULav8fn7CVnkdAMrXYFMxWimK4gSMa2wNc2SpwtTCuzCEZtZcYKWrb4Gqk59bQfCfXLUNXT?cluster=devnet) |

### 8.3 Collection NFT

| 属性 | 值 |
|---|---|
| Mint 地址 | [`CWAm9apVFxRnBUyGcb2NJ96csa9JaFUrDEzgRLq9A2YM`](https://explorer.solana.com/address/CWAm9apVFxRnBUyGcb2NJ96csa9JaFUrDEzgRLq9A2YM?cluster=devnet) |
| Mint 交易 | [Explorer](https://explorer.solana.com/tx/2Lsb15Agu1GJcLLLU7KW1haKP9itm33XozpsuRGc3bjAq4cV7shNZJE2qvEMAzHcZujq6uxMXhRbgq1ed2PEh4v?cluster=devnet) |
| Authority Revoke 交易 | [Explorer](https://explorer.solana.com/tx/3cNoUWxkXoabMKRi6NAVtEDb3ncosyfCGfzFKkKMk3aKbE83LzFsZbRsjDcPwTUtWmXJetCcF36jvqLjkFQ8PdpL?cluster=devnet) |

---

## 版权声明 (Copyright)

本规范文档遵循 CC0 1.0 Universal 协议，放弃所有版权及相关权利。

---

*DNP-1 | DealClaw Negotiation Protocol v1.0 | Solana Devnet | 2026-03-31*
