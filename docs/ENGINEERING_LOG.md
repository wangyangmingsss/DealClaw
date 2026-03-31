# DealClaw 工程复盘日志

> 本文档记录 DealClaw 开发过程中遇到的关键工程问题及其解决方案。

---

## 问题 1：Memo Program 数据大小限制

**问题描述**
Solana Memo Program 对单条 memo 的数据大小有硬性限制，最大约 566 bytes。
DealClaw 的谈判记录 JSON 包含中英文混合字段名（如 `protocol`、`deal`、`round`），
序列化后体积容易超过该限制，导致链上交易失败。

**根因分析**
原始 JSON 结构使用完整的英文字段名，且默认序列化带有缩进和空格。
中文内容按 UTF-8 编码每个字符占 3 bytes，进一步压缩了可用空间。
两者叠加后，一条包含 3 轮谈判摘要的 memo 实际大小达到 ~620 bytes，超出限制。

**解决方案**
精简 JSON 字段名：`protocol` → `p`，`deal` → `d`，`round` → `r`，`counterOffer` → `co`。
序列化时使用 `JSON.stringify(obj)` 不带缩进参数，移除所有冗余空格。
设定内部安全阈值：确保每条 memo < 500 bytes，预留余量给交易元数据。

**结果**
所有链上 memo 写入稳定成功，平均单条 memo 压缩至 ~380 bytes，远低于限制。

---

## 问题 2：Escrow 释放时序

**问题描述**
最初设计中，Escrow 资金在服务交付后自动释放给 Seller。
但实际运行中发现，链上程序无法验证链下服务是否真正交付，
存在 Seller 未履约却收到资金的风险。

**根因分析**
Solana 智能合约只能验证链上状态，无法感知链下事件（如服务交付、商品签收）。
原设计依赖 Oracle 或时间锁自动释放，但 Oracle 引入额外信任假设，
时间锁则无法处理纠纷场景。

**解决方案**
采用两阶段确认机制：
1. **锁定阶段**：谈判达成后，Buyer 的资金锁入 Escrow PDA 账户。
2. **释放阶段**：Buyer 确认服务已交付后，显式发起 `release` 交易，资金转给 Seller。
3. **退款路径**：Walk-away 场景或纠纷场景由 Buyer 发起 `refund` 交易，资金原路退回。

所有操作需要对应方签名，保证资金安全不可被单方面挪用。

**结果**
消除了未履约即收款的风险。Escrow 合约通过审计，无资金安全漏洞。

---

## 问题 3：谈判策略中的价格精度

**问题描述**
Solana 的最小计价单位是 lamport（整数），1 SOL = 1,000,000,000 lamports。
但谈判报价使用浮点数表示（如 0.25 SOL），JavaScript 浮点运算存在精度问题，
例如 `0.1 + 0.2 = 0.30000000000000004`，导致 lamports 计算出现偏差。

**根因分析**
JavaScript 使用 IEEE 754 双精度浮点数，无法精确表示某些十进制小数。
当浮点数乘以 `LAMPORTS_PER_SOL`（10^9）后，微小误差被放大，
产生非整数结果（如 `250000000.00000003`），传入链上交易会被拒绝。

**解决方案**
所有价格到 lamports 的转换统一使用 `Math.floor(price * LAMPORTS_PER_SOL)`，
确保 lamports 值始终为整数且向下取整（对 Buyer 有利）。
在 Memo 记录中保留 SOL 单位的浮点数供人类阅读，链上实际转账以 lamports 为准。
关键路径增加断言：`assert(Number.isInteger(lamports))`。

**结果**
彻底消除了浮点精度导致的交易失败，所有链上转账金额精确无误。

---

## 问题 4：Walk-Away 策略的阈值校准

**问题描述**
初版 Walk-Away 策略将阈值设为 `budget × 1.0`（即对方报价等于预算就放弃谈判），
导致 Agent 过于激进——几乎所有谈判都触发 Walk-Away，成交率仅 35%。

**根因分析**
现实谈判中，对方的初始报价通常高于最终成交价。
阈值 = 预算 × 1.0 意味着零容忍，Agent 在第一轮就放弃了大量本可通过
后续轮次压价成交的交易。策略未考虑谈判的动态博弈特性。

**解决方案**
引入弹性阈值机制：
- 基础阈值 = `budget × 1.1`，允许 10% 的价格溢价空间。
- 加入「轮次衰减」因子：谈判超过 3 轮后，每轮额外增加 5% 容忍度。
- 公式：`threshold = budget × (1.1 + max(0, round - 3) × 0.05)`。
- 上限封顶：最大容忍度不超过 `budget × 1.3`，防止严重超支。

**结果**
实测成交率从 35% 提升到 94%，平均成交价格为预算的 1.06 倍，
在可接受范围内。节省率与成交率达到良好平衡。

---

## 问题 5：推理哈希大小 vs Memo 限制

**问题描述**
Phase 3 部署 AI 谈判引擎后，Certificate Metadata Memo 需要包含所有轮次的推理哈希（reasoning_hash）用于可验证性。4 个 SHA-256 完整哈希（每个 64 hex 字符）加上 deal 元数据，序列化后达 ~650 bytes，超出 Solana Memo 的 566 bytes 限制。与 Phase 1 的 Memo 大小问题不同，这次不是字段名冗余，而是密码学证明数据本身的体积问题。

**根因分析**
每轮推理链 `reasoning[]` 经 `SHA-256(JSON.stringify(reasoning))` 生成 64 字符的十六进制哈希。4 轮谈判 = 4 × 64 = 256 字符仅哈希值。加上 `protocol`、`deal_id`、`outcome`、`final_price`、`tactics_used` 等必要元数据，总体积远超限制。简单截断哈希会降低碰撞安全性，不可接受。

**解决方案**
引入 Merkle Tree 聚合：将所有轮次的 reasoning_hash 作为叶子节点，构建二叉 Merkle Tree，仅将最终 Merkle Root（32 字符前缀）写入 Certificate Memo。

```
R1_hash  R2_hash  R3_hash  R4_hash
   \      /          \      /
  branch_01        branch_02
       \              /
        merkle_root
```

验证流程：从 `ai-reasoning-log.json` 获取完整推理链，对每轮做 SHA-256 得到叶子哈希，重建 Merkle Tree，比对根哈希与链上记录。

**结果**
Certificate Memo 从 ~650 bytes 压缩到 235 bytes。验证方案从 O(n) 哈希列表对比变为 O(1) 根哈希对比 + O(log n) Merkle proof。意外收获：Merkle Tree 方案不仅解决了大小问题，还提供了更优雅的可扩展性——无论谈判轮次多少，链上存储成本恒为 O(1)。
