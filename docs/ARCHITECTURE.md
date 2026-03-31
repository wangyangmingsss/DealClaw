# DealClaw 技术架构文档

> DealClaw — 基于 Solana 的 AI 谈判代理（AI Negotiation Agent）

---

## 1. 架构总览

DealClaw 采用五层分层架构，从用户意图到链上结算形成完整闭环：

```
👤 Human — 设定条件 (budget, requirements, walk-away price)
    ↕
🦞 DealClaw Engine — 谈判策略引擎 (Anchoring, BATNA, Concession Mapping, Tactic Detection, Walk-Away)
    ↕
📝 Memo Program — 谈判记录链上存证 (每轮报价 hash 写入 Solana Memo Program)
    ↕
🔒 Escrow Wallet — SOL 锁定与释放 (Lock → Release/Refund)
    ↕
◎ Solana L1 — 最终结算层 + x402 Agent 间支付
```

**数据流说明：**

- **下行（谈判发起）：** Human 设定预算与底线 → Engine 生成策略 → 每轮报价写入 Memo → 资金锁入 Escrow → Solana 确认。
- **上行（结果回传）：** Solana 出块确认 → Escrow 状态变更 → Memo 记录可审计 → Engine 更新策略状态 → Human 收到结果通知。

---

## 2. DealClaw Negotiation Protocol (DNP)

DNP 定义了链上谈判的标准数据格式。每一轮谈判（round）对应一条 Solana Memo 交易，其 payload 为以下 JSON 结构的 SHA-256 哈希：

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

**字段定义：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `protocol` | string | 协议版本标识，当前为 `DNP/1.0` |
| `deal_id` | string | 全局唯一交易标识，前缀 `dc_` |
| `round` | uint | 当前谈判轮次，从 1 递增 |
| `vendor_offer` | object | 卖方本轮报价（金额、币种、条款） |
| `dealclaw_counter` | object | DealClaw 代理的还价方案 |
| `tactic` | string | 本轮采用的核心策略标识 |
| `note` | string | 策略引擎的决策说明（供审计） |

链上仅存储 `SHA-256(JSON)` 哈希值（32 bytes），完整 JSON 保存在链下索引中，通过哈希互验保证数据完整性。

---

## 3. 谈判策略引擎

DealClaw Engine 内置五大核心策略模块，根据实时谈判态势动态调度：

### 3.1 Anchoring（锚定效应）

首轮报价时，Engine 依据市场数据和用户预算计算锚定价格，通常设定为目标价的 70%-80%。利用认知锚定效应，将后续谈判区间拉向买方有利方向。锚定值的偏移幅度根据历史成交数据动态校准。

### 3.2 BATNA Analysis（最佳替代方案分析）

Engine 持续评估当前交易的 BATNA（Best Alternative to a Negotiated Agreement）。当卖方报价劣于 BATNA 阈值时，Engine 自动引入替代方案作为谈判筹码，或建议 Human 终止当前谈判。BATNA 评分模型综合考虑价格、交付周期、服务条款三个维度。

### 3.3 Concession Mapping（让步映射）

Engine 维护一张让步曲线（Concession Curve），追踪每轮双方的让步幅度与速率。通过分析卖方让步模式（递减型、阶梯型、僵持型），预判对方底线区间，并据此调整己方让步节奏——确保每轮让步幅度递减，传递"接近底线"的信号。

### 3.4 Tactic Detection（对手策略识别）

Engine 实时解析卖方行为模式，识别以下常见谈判策略：

| 策略标识 | 说明 | Engine 应对 |
|---|---|---|
| `scope_reduction` | 缩小交付范围以维持报价 | 重新锚定全范围报价 |
| `urgency_pressure` | 制造紧迫感迫使快速成交 | 引入冷静期，要求延长报价有效期 |
| `credential_inflation` | 夸大资质或过往业绩 | 请求链上可验证凭证 |
| `sunk_cost` | 利用已投入时间施压 | 重置谈判基线，忽略沉没成本 |
| `unbundling` | 拆分报价隐藏总成本 | 要求全包价（all-inclusive）对比 |
| `take_it_or_leave_it` | 最后通牒式报价 | 触发 BATNA 评估，准备 Walk-Away |

### 3.5 Walk-Away Protocol（退出协议）

当满足以下任一条件时，Engine 触发 Walk-Away：

1. 卖方最终报价超出用户设定的 `walk_away_price`。
2. 连续 N 轮（默认 N=3）卖方让步幅度低于阈值（僵持检测）。
3. Tactic Detection 识别到高风险策略且卖方拒绝调整。

Walk-Away 触发后，Engine 向 Escrow 发送 Refund 指令，资金原路退回买方钱包，并将最终状态写入 Memo 存证。

---

## 4. Escrow 流程

Escrow Wallet 是一个链上程序派生地址（PDA），由 DealClaw 合约控制，资金流转分为三个阶段：

### 4.1 Lock（锁定）

```
Buyer Wallet —— transfer(budget_amount) ——→ Escrow PDA
```

谈判启动时，买方将预算金额转入 Escrow PDA。该操作在 Solana 上作为原子交易执行，交易签名即为锁定凭证。锁定后资金由合约逻辑控制，任何单方无法提取。

### 4.2 Release（释放）

```
Escrow PDA —— transfer(agreed_amount) ——→ Seller Wallet
Escrow PDA —— transfer(remaining) ——→ Buyer Wallet
```

谈判达成一致且交付确认后，Engine 提交 Release 指令。合约验证 DNP 最终轮次的双方签名，将协议金额转入卖方钱包，剩余资金退回买方。Release 需要买方钱包的二次签名确认。

### 4.3 Refund（退款）

```
Escrow PDA —— transfer(full_amount) ——→ Buyer Wallet
```

Walk-Away 触发或谈判超时（默认 72 小时）后，合约自动执行全额退款。退款交易附带 Memo 记录，注明退出原因与最终轮次编号。

---

## 5. x402 支付协议

x402 是 DealClaw 用于 Agent 间支付认证的协议层，运行于 Solana L1 之上：

**认证流程：**

1. **钱包签名认证：** Agent 使用其 Solana 钱包私钥对请求 payload 签名（Ed25519），接收方通过公钥验证身份，无需中心化身份服务。
2. **支付条款编码：** 交易条款（金额、币种、到期时间、取消策略）编码为结构化数据，附加在 x402 协议头中，双方 Agent 在谈判开始前完成条款握手。
3. **L1 结算：** 最终支付通过 Solana 交易执行，交易指令中嵌入 x402 条款哈希，确保结算内容与协商条款严格一致。

x402 使得两个 AI Agent 可以在无人干预的情况下完成从身份验证到资金结算的全流程，适用于 Agent-to-Agent 自主交易场景。

---

## 6. 为什么是 Solana

DealClaw 选择 Solana 作为底层链，基于以下技术考量：

**亚秒级确认时间：** Solana 出块时间约 400ms，slot 确认在秒级完成。多轮谈判场景下（典型交易 5-15 轮），每轮 Memo 写入与状态更新均需链上确认——亚秒级延迟确保谈判节奏不被链上等待打断，用户体验接近实时。

**低廉的单轮存储成本：** 每轮谈判产生一条 Memo 交易（约 32 bytes 哈希），Solana 单笔交易费用约 0.000005 SOL。一场 10 轮谈判的链上存证总成本不到 0.0001 SOL，使得"逐轮上链"的审计粒度在经济上可行。

**原生 Escrow 支持：** Solana 的 Program Derived Address（PDA）机制天然适合构建 Escrow 账户——无需外部多签服务，合约逻辑直接控制资金流转。PDA 的确定性派生保证了 Escrow 地址可由交易双方独立计算验证。

**高吞吐量与并发支持：** Solana 理论峰值 65,000 TPS，支持多场谈判并行执行而不会产生拥堵。对于 DealClaw 这类高频交互型应用，网络容量不会成为瓶颈。

---

*DealClaw v1.0 | DNP/1.0 | Solana Mainnet*
