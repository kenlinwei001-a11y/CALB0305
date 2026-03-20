# 智能体中台 (Agent Data OS) 集成方案

## 概述

本方案将新的"智能体中台"需求融合到现有专家能力平台中，**保留原有核心模块**（技能中心、MCP工具、场景推演）的基础上，新增六层架构的核心能力。

## 架构映射

### 六层架构与现有模块对应

```
新架构层级                    现有/新增模块
─────────────────────────────────────────────────
应用层（业务场景）              场景推演(OntologyGraph)
                              + 新增: 决策空间(DecisionSpace)

Agent层（多智能体系统）         新增: Agent执行监控
                              + 技能中心(SkillsRegistry)

Tool层（MCP工具系统）           MCP工具(MCPTools) ✓ 已存在

语义与本体层                   业务释义(AtomicOntology)
                              + 业务语义(BusinessSemantic)
                              + 新增: 业务对象模型(BusinessObject)

数据与事件层                   新增: 事件驱动架构支持

治理与安全层                   决策资产库(DecisionRepository)
                              + 新增: 治理策略
```

## 新增核心模块

### 1. 决策空间 (Decision Space) - `/decision-space`

**定位**: 替代传统 Dashboard 的新范式界面

**核心功能**:
- 推理链可视化 (Reasoning Chain)
- 实时异常检测与根因分析
- 决策建议与风险评估
- Agent 执行监控

**设计理念**:
```
传统 BI              Agent UI
─────────────────────────────────
Dashboard    →    Decision Space
图表          →    推理链
手动操作      →    自动执行
静态报表      →    动态推演
```

**界面结构**:
- 左侧导航: 推理链 / 建议 / 动作 / Agent
- 中心区域: 推理步骤可视化 + 详情
- 右侧面板: 风险评估 + 执行统计

### 2. 业务对象浏览器 (Business Object Browser) - `/objects`

**定位**: 面向Agent的可理解对象模型层

**核心概念**:
- 替代传统"表"概念，变为可理解对象
- 对象状态 + 生命周期 + 能力 + 规则
- 工业级指标语义绑定

**对象类型**:
| 类型 | 说明 | 示例 |
|------|------|------|
| equipment | 设备 | 激光焊接机 |
| material | 物料 | 极耳材料 |
| order | 订单 | 生产订单 |
| product | 产品 | 18650电芯 |
| process | 工艺 | 涂布工序 |
| quality_event | 质量事件 | 不良告警 |

**对象结构**:
```typescript
{
  id: "EQ-001",
  name: "激光焊接机 A01",
  type: "equipment",
  state: { code: "running", severity: "normal" },
  attributes: {
    temperature: { value: 85, unit: "°C", quality: {...} },
    oee: { value: 0.82, ... }
  },
  lifecycle: { stages: [...], transitions: [...] },
  relations: [{ type: "belongs_to", target: "LINE-A" }],
  capabilities: [{ name: "焊接参数调整", skillId: "..." }],
  rules: [{ trigger: "temp > 90", action: "alert" }]
}
```

### 3. 推理链系统 (Reasoning Graph)

**推理节点类型**:
| 类型 | 说明 | Agent |
|------|------|-------|
| anomaly | 异常检测 | Analyst |
| object | 对象关联 | Analyst |
| metric | 指标分析 | Analyst |
| causal | 因果推理 | Reasoner |
| decision | 决策建议 | Planner |
| action | 执行动作 | Executor |
| evidence | 证据节点 | - |

**执行闭环**:
```
感知(Perceive) → 理解(Understand) → 推理(Reason)
     ↑                                              ↓
学习(Learn) ← 执行(Execute) ← 决策(Decide)
```

### 4. Agent 系统

**多Agent协同架构**:

| Agent | 职责 | 能力 | 状态 |
|-------|------|------|------|
| Planner | 任务规划 | 拆解任务、编排流程 | idle/executing |
| Analyst | 数据分析 | 异常检测、模式识别 | reasoning |
| Reasoner | 因果推理 | 根因分析、影响评估 | idle |
| Executor | 执行器 | 调用工具、操作设备 | idle |
| Auditor | 风控审计 | 合规检查、风险评估 | idle |

**记忆体系**:
- 短期记忆: 当前任务上下文
- 长期记忆: 历史决策经验
- 案例库: 相似推演案例

### 5. 工业级指标语义标准

**指标定义示例 - OEE**:
```typescript
{
  id: "metric-oee",
  name: "设备综合效率",
  code: "OEE",
  formula: "availability × performance × quality",
  // 可信条件（数据质量要求）
  trustConditions: [
    { type: "frequency", threshold: 60, desc: "采样频率≥1分钟" },
    { type: "completeness", threshold: 95, desc: "完整度≥95%" }
  ],
  // 失效条件
  failureConditions: [
    { condition: "downtime_not_recorded", desc: "停机未记录导致虚高" }
  ],
  // 阈值配置
  thresholds: {
    critical: 0.5, warning: 0.65, target: 0.85, excellent: 0.9
  }
}
```

## 数据模型扩展

### 新增 TypeScript 类型 (types.ts)

1. **BusinessObject** - 业务对象模型
2. **IndustrialMetric** - 工业级指标语义
3. **ReasoningChain** - 推理链
4. **ReasoningNode/Edge** - 推理节点和边
5. **Agent** - Agent定义
6. **BusinessEvent** - 业务事件
7. **DecisionSpace** - 决策空间
8. **GovernancePolicy** - 治理策略

### Mock 数据 (constants.ts)

- `MOCK_BUSINESS_OBJECTS`: 业务对象示例
- `MOCK_INDUSTRIAL_METRICS`: 指标定义示例
- `MOCK_REASONING_CHAINS`: 推理链示例
- `MOCK_AGENTS`: Agent定义
- `MOCK_BUSINESS_EVENTS`: 事件流示例
- `MOCK_DECISION_SPACES`: 决策空间示例

## 路由更新

新增导航项 (App.tsx):

| 路径 | 组件 | 说明 |
|------|------|------|
| /decision-space | DecisionSpace | 决策空间（新首页） |
| /objects | BusinessObjectBrowser | 业务对象浏览器 |
| /skills | SkillsRegistry | 技能中心（保留）|
| /mcp-tools | MCPTools | MCP工具（保留）|
| /atoms | AtomicOntologyModule | 业务释义（保留）|
| /ontology | OntologyGraph | 场景推演（保留）|
| /business-semantic | BusinessSemanticCreator | 业务语义（保留）|
| /decision-repository | DecisionRepository | 决策资产库（保留）|
| / | Dashboard | 仪表盘（保留）|

## 使用指南

### 场景1: 异常检测与根因分析

1. 进入 **决策空间** (`/decision-space`)
2. 查看当前异常: 焊接良率下降
3. 查看推理链:
   - 异常检测 → 关联对象 → 指标分析 → 因果推理 → 决策建议
4. 查看推荐方案:
   - 高优先级: 清洁冷却系统
   - 中优先级: 临时降低功率
5. 执行动作: 创建维护工单

### 场景2: 业务对象浏览

1. 进入 **业务对象** (`/objects`)
2. 按类型筛选: 设备/订单/物料等
3. 查看设备详情:
   - 当前状态和生命周期
   - 关键属性（温度、OEE等）
   - 关联关系
   - 触发规则
4. 调用对象能力: 焊接参数调整

### 场景3: Agent 监控

1. 在决策空间切换到 **Agent** 标签
2. 查看各Agent状态:
   - Planner: 规划任务
   - Analyst: 数据分析中
   - Reasoner: 因果推理
   - Executor: 执行动作
3. 查看执行统计:
   - 成功率、延迟、置信度

## 技术实现

### 组件清单

| 组件 | 路径 | 功能 |
|------|------|------|
| DecisionSpace | components/DecisionSpace.tsx | 决策空间主界面 |
| BusinessObjectBrowser | components/BusinessObjectBrowser.tsx | 业务对象浏览器 |
| ReasoningChainView | DecisionSpace 内部 | 推理链可视化 |
| AgentCard | DecisionSpace 内部 | Agent状态卡片 |
| RiskAssessmentPanel | DecisionSpace 内部 | 风险评估面板 |
| ObjectCard | BusinessObjectBrowser 内部 | 对象卡片 |
| ObjectDetail | BusinessObjectBrowser 内部 | 对象详情 |

### 状态管理

- 使用 React useState 管理本地状态
- Mock数据存储在 constants.ts
- 通过 props 传递数据

## 未来扩展

1. **事件总线**: 实现 Event Mesh，支持实时事件流
2. **Agent编排**: 可视化 Agent 工作流编排
3. **数字孪生**: 3D 设备模型与状态映射
4. **自然语言交互**: 与决策空间的对话式交互
5. **预测性分析**: 基于时序数据的预测模型

## 与现有模块的关系

```
                    ┌─────────────────┐
                    │   决策空间      │
                    │ (DecisionSpace) │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  业务对象浏览器 │   │   技能中心     │   │   场景推演     │
│  (/objects)   │   │  (/skills)    │   │ (/ontology)   │
└───────┬───────┘   └───────┬───────┘   └───────────────┘
        │                   │
        │         ┌────────┴────────┐
        │         │                 │
        ▼         ▼                 ▼
┌───────────────┐         ┌───────────────┐
│ 业务释义/原子  │         │   MCP工具     │
│  (/atoms)    │         │ (/mcp-tools)  │
└───────────────┘         └───────────────┘
```

## 总结

本集成方案在**不破坏现有功能**的前提下，新增了智能体中台的核心能力:

1. ✅ **决策空间**: 面向Agent的新UI范式
2. ✅ **业务对象模型**: 对象驱动的数据层
3. ✅ **推理链系统**: 可视化因果推理
4. ✅ **多Agent协同**: Planner/Analyst/Reasoner/Executor/Auditor
5. ✅ **工业级指标**: 带可信条件的语义标准

原有模块（技能中心、MCP工具、场景推演、业务语义）**完全保留**，通过新增模块扩展能力边界。