import { Skill, OntologyData, ExecutionLog, Scenario, OntologyNode, OntologyLink, AtomicOntology, BusinessScenario, MolecularOntology, SimulationNodeConfig } from './types';

export const SCENARIOS: Scenario[] = [
  { id: 'predictive_maintenance', name: '1. 设备预测性维护', description: '设备健康度监测、RUL预测与异常预警' },
  { id: 'breakdown_maintenance', name: '2. 设备故障维修时间预测', description: '维修工时预测、备件库存与物流时间、专家调度' },
  { id: 'production_sales_match', name: '3. 产销匹配协同', description: 'S&OP层级的产销协同推演，包含需求预测、产能评估、库存优化、交付协同等，可调用产能评估推演预测分析' },
  { id: 'new_project_planning', name: '4. 新项目落地推演分析', description: '新产线投资决策分析、选址评估、财务测算与风险推演' },
  { id: 'capacity_assessment_prediction', name: '5. 产能评估推演预测分析', description: '供给侧产能评估，被产销匹配协同调用' },
];

export const MOCK_SKILLS: Skill[] = [
  {
    skill_id: "material_purity_check_v2",
    name: "原料纯度AI检测",
    version: "2.1.0",
    domain: ["raw_material"],
    capability_tags: ["quality", "material", "spectroscopy"],
    input_schema: { batch_id: "string", spectrum_data: "array" },
    output_schema: { purity_score: "number", impurities: "array" },
    cost: 0.3,
    latency: 120,
    accuracy_score: 0.98,
    dependencies: [],
    description: "基于光谱数据的原材料杂质含量快速分析。",
    files: {
      readme: `# 原料纯度AI检测 (Material Purity AI Check) v2.1.0

## 1. 技能概述

### 1.1 业务价值
本技能基于深度学习光谱分析技术，实现对锂电池正极材料（NCM/LFP）原料纯度的实时、无损检测。相比传统化学滴定法（耗时4-6小时），AI检测可在120秒内完成，检测精度达98%以上，显著降低因原料杂质导致的批次报废风险。

### 1.2 技术原理
采用卷积神经网络(CNN)对拉曼光谱数据进行特征提取，结合迁移学习技术，能够有效识别磁性异物（Fe、Cu、Zn等）、水分含量及碳酸盐杂质。模型通过FDA 21 CFR Part 11验证，符合锂电行业质量标准。

### 1.3 应用场景
- **来料检验**: 原料入库前的快速质量筛查
- **生产过程监控**: 搅拌工序中的实时纯度监测
- **出货检验**: 成品极片的质量确认

## 2. 输入规范

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| batch_id | string | 是 | 原料批次号，用于追溯 | "RAW-NCM-20240315-001" |
| spectrum_data | array[float] | 是 | 拉曼光谱数据，波长范围200-2000cm⁻¹ | [1024, 2048, 4096, ...] |
| material_type | string | 否 | 材料类型：NCM/LFP/LCO | "NCM811" |
| test_temperature | float | 否 | 检测环境温度(°C) | 25.0 |

## 3. 输出规范

| 参数名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| purity_score | float | 纯度评分(0-1)，≥0.99为合格 | 0.9992 |
| impurities | array | 检测到的杂质列表 | [{"type": "Fe", "ppm": 12.5}, ...] |
| confidence | float | 模型置信度 | 0.987 |
| test_duration_ms | int | 检测耗时(毫秒) | 118 |
| next_check_time | string | 建议下次检测时间(ISO8601) | "2024-03-15T14:30:00Z" |

## 4. 性能指标

- **准确率**: 98.5% (基于10万+样本验证)
- **召回率**: 99.2% (对关键杂质)
- **延迟**: P99 < 120ms
- **成本**: 0.3元/次
- **吞吐量**: 300次/分钟

## 5. 使用示例

### 示例1：来料检验
\`\`\`python
response = skill.invoke({
    "batch_id": "RAW-NCM-20240315-001",
    "spectrum_data": load_spectrum("batch_001.rmn"),
    "material_type": "NCM811"
})

if response["purity_score"] >= 0.99:
    approve_batch(response["batch_id"])
else:
    quarantine_batch(response["batch_id"], response["impurities"])
\`\`\`

## 6. 故障处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| E1001 | 光谱数据格式错误 | 检查输入数组长度是否为1024或2048 |
| E1002 | 材料类型不支持 | 确认material_type为NCM/LFP/LCO之一 |
| E1003 | 模型推理超时 | 检查网络连接或联系管理员 |
| E1004 | 光谱信号弱 | 清洁检测设备镜头，重新采样 |

## 7. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v2.1.0 | 2024-03 | 新增LFP材料支持，优化Fe杂质检测 |
| v2.0.0 | 2024-01 | 升级至CNN架构，准确率提升至98.5% |
| v1.0.0 | 2023-08 | 初始版本，支持NCM材料检测 |

## 8. 依赖与前置条件

- 拉曼光谱仪（波长分辨率≤2cm⁻¹）
- 标准样品库（已通过ISO认证）
- 网络带宽≥10Mbps

---
*本技能由锂电行业AI实验室开发，符合IATF 16949质量标准*`,
      config: "{\"model\": \"purity_net_v2\", \"threshold\": 0.99}",
      script: "def handler(event):\n    return {\"purity_score\": 0.999, \"impurities\": []}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "viscosity_prediction_v3",
    name: "浆料粘度预测",
    version: "3.0.1",
    domain: ["mixing"],
    capability_tags: ["viscosity", "mixing", "process_control"],
    input_schema: { solid_content: "number", temperature: "number", mixing_speed: "number" },
    output_schema: { predicted_viscosity: "number" },
    cost: 0.5,
    latency: 50,
    accuracy_score: 0.94,
    dependencies: [],
    description: "根据搅拌工艺参数实时预测浆料粘度趋势。",
    files: {
      readme: `# 浆料粘度预测 (Slurry Viscosity Prediction) v3.0.1

## 1. 技能概述

### 1.1 业务价值
锂电池浆料粘度是决定涂布质量的关键工艺参数。传统人工取样检测存在滞后性（30-60分钟），导致批量不良。本技能通过实时预测粘度趋势，提前15-30分钟预警异常，减少涂布缺陷率30%以上，年节约报废成本超500万元。

### 1.2 技术原理
基于LSTM长短期记忆网络，融合搅拌转速、温度、固含量、分散剂用量等多维时序数据。模型考虑浆料老化的非线性特性，采用Attention机制捕捉关键时间窗口特征。引入物理约束层，确保预测结果符合流体力学规律。

### 1.3 应用场景
- **涂布前预警**: 预测浆料是否适合上机涂布
- **搅拌终点判断**: 确定最佳搅拌停止时间
- **库存管理**: 预测浆料可用时间窗口
- **工艺优化**: 分析不同配方对粘度的影响

## 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| solid_content | float | 是 | 40-75% | 浆料固含量(%) |
| temperature | float | 是 | 15-35°C | 浆料温度 |
| mixing_speed | float | 是 | 50-200rpm | 搅拌转速 |
| mixing_time | float | 否 | 0-240min | 已搅拌时长 |
| dispersant_ratio | float | 否 | 0.5-3% | 分散剂比例 |
| solvent_type | string | 否 | - | 溶剂类型：NMP/水 |

## 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| predicted_viscosity | float | 预测粘度值 | mPa·s |
| confidence_interval | array | 95%置信区间 [下限, 上限] | mPa·s |
| trend | string | 趋势：rising/stable/falling | - |
| suitable_for_coating | boolean | 是否适合涂布 | - |
| recommended_action | string | 建议操作 | - |
| estimated_shelf_life | float | 预计可用时长 | 小时 |

## 4. 性能指标

- **准确率**: MAPE < 5%（粘度范围1000-15000 mPa·s）
- **R²得分**: 0.94
- **预测提前量**: 15-30分钟
- **延迟**: P99 < 50ms
- **成本**: 0.5元/次

## 5. 使用示例

### 示例1：涂布前粘度检查
\`\`\`python
result = skill.invoke({
    "solid_content": 65.5,
    "temperature": 25.0,
    "mixing_speed": 120,
    "mixing_time": 180
})

if result["suitable_for_coating"]:
    start_coating_process()
else:
    if result["trend"] == "rising":
        add_solvent()
    else:
        extend_mixing_time()
\`\`\`

## 6. 故障处理

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| E2001 | 固含量超出范围 | 检查固体投料量，确认在40-75%范围内 |
| E2002 | 温度异常 | 检查温控系统，确保15-35°C |
| E2003 | 模型漂移警告 | 建议重新采集样本进行模型校准 |

## 7. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v3.0.1 | 2024-02 | 修复高固含量(>70%)预测偏差问题 |
| v3.0.0 | 2024-01 | 引入Attention机制，支持240分钟长时预测 |
| v2.0.0 | 2023-10 | 增加溶剂类型参数，支持水系浆料 |

## 8. 依赖与前置条件

- 搅拌罐温度传感器（精度±0.5°C）
- 转速传感器（精度±1rpm）
- 固含量在线检测仪
- 历史样本≥1000批次用于模型训练`,
      config: "{\"model\": \"visc_lstm_v3\"}",
      script: "def predict_viscosity(params):\n    # Mock logic\n    return params['solid_content'] * 50 + params['temperature'] * -2",
      scriptLang: "python"
    }
  },
  {
    skill_id: "coating_thickness_loop_v1",
    name: "涂布厚度闭环控制",
    version: "1.5.0",
    domain: ["coating"],
    capability_tags: ["coating", "loop_control", "thickness"],
    input_schema: { beta_ray_reading: "array", current_gap: "number" },
    output_schema: { adjustment_microns: "number" },
    cost: 0.8,
    latency: 30,
    accuracy_score: 0.99,
    dependencies: [],
    description: "基于β射线测厚仪数据的模头间隙自动调节算法。",
    files: {
      readme: `# 涂布厚度闭环控制 (Coating Thickness Closed-Loop Control) v1.5.0

## 1. 技能概述

### 1.1 业务价值
锂电池极片涂布厚度均匀性直接影响电芯容量一致性和安全性。本技能实现β射线测厚仪数据的实时闭环控制，将横向厚度偏差控制在±2μm以内（行业平均水平±5μm）。通过自动调节模头螺栓，减少人工干预频次90%，提升涂布良率至99.5%，年节约成本超800万元。

### 1.2 技术原理
采用自适应PID控制算法结合前馈补偿：实时分析β射线扫描的横向厚度分布（通常512个扫描点），识别厚度异常区域。通过卡尔曼滤波消除测量噪声，运用二次规划算法计算最优螺栓调整量，实现多螺栓协同控制。控制周期100ms，确保快速响应。

### 1.3 应用场景
- **涂布过程控制**: 实时厚度闭环调节
- **换型快速调试**: 新规格产品快速达到目标厚度
- **异常恢复**: 厚度偏离后的自动修正
- **横向均匀性优化**: 消除
  },
  {
    skill_id: "roller_pressure_opt_v2",
    name: "辊压压力自适应优化",
    version: "2.0.0",
    domain: ["calendaring"],
    capability_tags: ["calendaring", "pressure", "density"],
    input_schema: { target_density: "number", incoming_thickness: "number" },
    output_schema: { hydraulic_pressure: "number" },
    cost: 0.4,
    latency: 200,
    accuracy_score: 0.92,
    dependencies: [],
    description: "根据来料厚度波动调整辊压压力以保证压实密度一致性。",
    files: {
      readme: `# 辊压压力自适应优化 (Roller Pressure Adaptive Optimization)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n辊压工序是锂电池极片制造的核心环节，直接影响电池的能量密度和循环寿命。本技能通过实时分析极片材料特性、目标密度和产线速度，动态优化辊压压力参数，实现：\n- 极片密度均匀性提升15-20%\n- 辊压缺陷率降低30%\n- 材料损耗减少8-12%\n- 产线换型时间缩短25%\n\n### 1.2 技术原理\n基于物理机理模型与数据驱动算法融合：\n- **弹性-塑性变形模型**：描述极片在辊压过程中的力学行为\n- **自适应PID控制**：实时调节压力响应\n- **数字孪生仿真**：预测不同压力下的密度分布\n- **强化学习优化**：持续学习最优控制策略\n\n### 1.3 应用场景\n- 正负极极片辊压工序\n- 新材料的辊压工艺开发\n- 多规格产品的快速换型\n- 辊压质量异常自动修正\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| target_density | number | 是 | 1.5-3.8 | 目标压实密度，单位：g/cm³ |\n| incoming_thickness | number | 是 | 100-400 | 来料厚度，单位：μm |\n| current_pressure | number | 否 | 50-500 | 当前辊压压力，单位：吨 |\n| line_speed | number | 否 | 5-80 | 产线速度，单位：m/min |\n| material_type | string | 否 | NCM/LFP/Graphite | 材料类型 |\n| roller_diameter | number | 否 | 400-800 | 轧辊直径，单位：mm |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| hydraulic_pressure | number | 推荐液压压力值 | bar |\n| optimal_pressure | number | 推荐最优辊压压力 | 吨 |\n| adjustment | number | 压力调整量 | 吨 |\n| confidence | number | 优化建议置信度 | 0-1 |\n| predicted_density | number | 预测压实密度 | g/cm³ |\n| density_uniformity | number | 密度均匀性评分 | 0-100 |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 密度预测准确率 | >=92% | 与实测值对比 |\n| 压力优化响应时间 | <=200ms | 单次推理延迟 |\n| 密度均匀性提升 | 15-20% | 相比人工设定 |\n| 系统可用性 | >=99.5% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.40 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 Python调用示例\n\`\`\`python\nimport requests\n\nresponse = requests.post(\n    "https://api.battery-ai.com/skills/roller_pressure_opt_v2",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={\n        "target_density": 2.65,\n        "incoming_thickness": 180,\n        "current_pressure": 280,\n        "line_speed": 35,\n        "material_type": "NCM"\n    }\n)\n\nresult = response.json()\nprint(f"推荐压力: {result['hydraulic_pressure']}bar")\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "hydraulic_pressure": 295.5,\n  "optimal_pressure": 295.5,\n  "adjustment": 15.5,\n  "confidence": 0.94,\n  "predicted_density": 2.64,\n  "density_uniformity": 88.5\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| ROLLER_001 | 输入压力超出安全范围 | 检查压力传感器，确认数值在50-500吨范围内 |\n| ROLLER_002 | 目标密度不可达 | 调整目标密度或检查材料配方 |\n| ROLLER_003 | 速度-厚度组合超限 | 降低速度或调整厚度参数 |\n| ROLLER_004 | 模型置信度不足 | 增加历史数据训练或人工确认 |\n| ROLLER_005 | 传感器数据异常 | 检查厚度传感器连接 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v2.0.0 | 2024-01 | 新增自适应控制算法，支持多材料类型 |\n| v1.5.0 | 2023-09 | 优化响应速度，增加置信度输出 |\n| v1.0.0 | 2023-06 | 初始版本，基础压力优化功能 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- 辊压机配备压力传感器（精度±0.5%）\n- 边缘计算节点：CPU 4核/内存8GB/存储100GB\n- 网络：工业以太网，延迟<10ms\n\n### 8.2 软件要求\n- MES系统接口版本>=3.2\n- 数据采集频率>=10Hz\n- 历史数据存储>=6个月\n\n### 8.3 数据要求\n- 至少1000组历史辊压数据用于模型训练\n- 包含压力-密度-厚度的完整对应关系\n- 质量检测数据（面密度、厚度分布）`,
      config: "{\"target_density\": 1.5}",
      script: "def optimize(target, current):\n    return target * 2000 # bar",
      scriptLang: "python"
    }
  },
  {
    skill_id: "tension_control_algo_v1",
    name: "卷绕张力波动抑制",
    version: "1.1.0",
    domain: ["winding"],
    capability_tags: ["winding", "motion_control"],
    input_schema: { real_time_tension: "array", speed: "number" },
    output_schema: { torque_compensation: "number" },
    cost: 0.2,
    latency: 10,
    accuracy_score: 0.95,
    dependencies: [],
    description: "高速卷绕过程中的动态张力补偿算法。",
    files: {
      readme: `# 卷绕张力波动抑制 (Tension Control Algorithm)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n卷绕工序是电芯制造的关键环节，张力控制直接影响电芯的循环寿命和安全性能。本技能通过实时监测和动态补偿，实现：\n- 张力波动降低60%以上\n- 卷绕缺陷率降低40%\n- 电芯循环寿命提升10-15%\n- 高速卷绕稳定性提升（支持≥800mm/s）\n\n### 1.2 技术原理\n采用多层级控制策略：\n- **PID反馈控制**：基础张力闭环控制\n- **前馈补偿**：消除卷针非圆效应引起的周期性波动\n- **自适应滤波**：实时抑制高频振动\n- **模型预测控制(MPC)**：预测张力变化趋势，提前补偿\n\n### 1.3 应用场景\n- 圆柱/方形电芯卷绕工序\n- 高速卷绕产线（≥60ppm）\n- 超薄极片卷绕（≤100μm）\n- 多层极片同步卷绕\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| real_time_tension | array | 是 | - | 实时张力数据序列，采样频率≥1kHz |\n| speed | number | 是 | 10-100 | 卷绕线速度，单位：mm/s |\n| target_tension | number | 否 | 50-500 | 目标张力值，单位：N |\n| spool_diameter | number | 否 | 50-300 | 当前卷针直径，单位：mm |\n| material_width | number | 否 | 50-300 | 极片宽度，单位：mm |\n| acceleration | number | 否 | 0-50 | 当前加速度，单位：mm/s² |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| torque_compensation | number | 扭矩补偿值 | N·m |\n| tension_error | number | 当前张力误差 | N |\n| control_output | number | 控制器输出 | % |\n| stability_index | number | 张力稳定性指数 | 0-100 |\n| vibration_amplitude | number | 振动幅值 | N |\n| compensation_mode | string | 补偿模式：PID/Feedforward/MPC | - |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 控制响应时间 | ≤10ms | 单次控制周期 |\n| 张力波动抑制率 | ≥60% | 相比开环控制 |\n| 稳态误差 | ≤±2% | 目标张力范围内 |\n| 超调量 | ≤5% | 动态响应过程 |\n| 系统可用性 | ≥99.9% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.20 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 JavaScript调用示例\n\`\`\`javascript\nconst response = await fetch('https://api.battery-ai.com/skills/tension_control_algo_v1', {\n  method: 'POST',\n  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },\n  body: JSON.stringify({\n    real_time_tension: [120.5, 121.2, 119.8, 122.1, ...],\n    speed: 65,\n    target_tension: 120,\n    spool_diameter: 180,\n    material_width: 150,\n    acceleration: 5\n  })\n});\n\nconst result = await response.json();\nconsole.log(\`扭矩补偿: \${result.torque_compensation} N·m\`);\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "torque_compensation": 2.35,\n  "tension_error": -1.2,\n  "control_output": 52.5,\n  "stability_index": 94.8,\n  "vibration_amplitude": 3.2,\n  "compensation_mode": "MPC"\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| TENSION_001 | 张力数据采样频率不足 | 检查传感器采样设置，确保≥1kHz |\n| TENSION_002 | 速度超出控制范围 | 调整卷绕速度至10-100mm/s范围内 |\n| TENSION_003 | 张力偏差过大 | 检查极片路径，确认无卡滞或打滑 |\n| TENSION_004 | 控制器饱和 | 降低加速度或检查机械传动 |\n| TENSION_005 | 传感器信号异常 | 检查张力传感器连接和校准 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v1.1.0 | 2024-02 | 新增MPC预测控制，提升高速稳定性 |\n| v1.0.1 | 2023-11 | 优化PID参数自适应 |\n| v1.0.0 | 2023-08 | 初始版本，基础PID+前馈控制 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- 张力传感器：精度±0.5%，采样率≥1kHz\n- 伺服驱动器：响应时间≤5ms\n- 边缘计算节点：CPU 2核/内存4GB\n\n### 8.2 软件要求\n- 运动控制系统版本≥2.5\n- 实时操作系统：周期≤1ms\n- 与MES系统时间同步\n\n### 8.3 数据要求\n- 历史张力数据≥10000条\n- 包含正常/异常工况样本\n- 标定数据：张力-扭矩对应关系`,
      config: "{\"kp\": 0.5, \"ki\": 0.1}",
      script: "const pid = new PID(0.5, 0.1, 0);\nreturn pid.update(target - current);",
      scriptLang: "javascript"
    }
  },
  {
    skill_id: "electrolyte_soaking_pred_v1",
    name: "注液浸润效果预测",
    version: "1.0.0",
    domain: ["baking_injection"],
    capability_tags: ["injection", "process_prediction"],
    input_schema: { injection_amount: "number", vacuum_time: "number", cell_weight: "number" },
    output_schema: { soaking_score: "number" },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.89,
    dependencies: [],
    description: "预测电解液在电芯内部的浸润程度。",
    files: {
      readme: `# 注液浸润效果预测 (Electrolyte Soaking Prediction)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n电解液浸润质量直接影响电池的倍率性能和循环寿命。本技能通过分析注液工艺参数，预测浸润效果，实现：\n- 浸润不良品检出率提升35%\n- 静置时间优化，产能提升15%\n- 电解液用量精准控制，成本降低8%\n- 首效和循环性能一致性提升\n\n### 1.2 技术原理\n融合多物理场仿真与机器学习：\n- **毛细流动模型**：模拟电解液在多孔电极中的渗透\n- **浸润动力学**：考虑粘度、表面张力和孔隙结构\n- **真空扩散模型**：预测真空静置阶段的浸润加速效果\n- **深度学习**：基于历史数据建立浸润质量预测模型\n\n### 1.3 应用场景\n- 圆柱/方形/软包电芯注液工序\n- 新型电解液配方验证\n- 极片孔隙结构优化\n- 注液工艺参数窗口确定\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| injection_amount | number | 是 | 2-10 | 注液量，单位：g |\n| vacuum_time | number | 是 | 30-300 | 真空静置时间，单位：秒 |\n| cell_weight | number | 是 | 50-500 | 电芯重量，单位：g |\n| porosity | number | 否 | 30-50 | 极片孔隙率，单位：% |\n| electrolyte_viscosity | number | 否 | 2-10 | 电解液粘度，单位：mPa·s |\n| temperature | number | 否 | 20-45 | 环境温度，单位：℃ |\n| pressure | number | 否 | -95~-50 | 真空度，单位：kPa |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| soaking_score | number | 浸润质量评分 | 0-100 |\n| soaking_uniformity | number | 浸润均匀性 | 0-100 |\n| predicted_time | number | 建议静置时间 | 秒 |\n| risk_level | string | 风险等级：high/medium/low | - |\n| confidence | number | 预测置信度 | 0-1 |\n| recommendations | array | 工艺优化建议 | - |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 浸润质量预测准确率 | >=89% | 与解剖验证对比 |\n| 不良品检出率 | >=92% | 浸润不良电芯 |\n| 预测响应时间 | <=600ms | 单次推理延迟 |\n| 静置时间优化效果 | 10-20% | 缩短静置时间 |\n| 系统可用性 | >=99.5% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.40 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 JavaScript调用示例\n\`\`\`javascript\nconst response = await fetch('https://api.battery-ai.com/skills/electrolyte_soaking_pred_v1', {\n  method: 'POST',\n  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },\n  body: JSON.stringify({\n    injection_amount: 5.2,\n    vacuum_time: 120,\n    cell_weight: 180,\n    porosity: 38,\n    electrolyte_viscosity: 4.5,\n    temperature: 25,\n    pressure: -85\n  })\n});\n\nconst result = await response.json();\nconsole.log(\`浸润评分: \${result.soaking_score}\`);\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "soaking_score": 87.5,\n  "soaking_uniformity": 91.2,\n  "predicted_time": 135,\n  "risk_level": "low",\n  "confidence": 0.91,\n  "recommendations": [\n    "建议延长静置时间至135秒",\n    "可适当提高真空度以加速浸润"\n  ]\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| SOAK_001 | 注液量超出正常范围 | 检查注液泵校准和计量精度 |\n| SOAK_002 | 真空度不足 | 检查真空系统密封性和泵性能 |\n| SOAK_003 | 孔隙率数据缺失 | 输入极片孔隙率或连接极片检测数据 |\n| SOAK_004 | 预测置信度低 | 增加历史数据或检查工艺稳定性 |\n| SOAK_005 | 温度超出工艺窗口 | 调整环境温度至20-45℃范围 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v1.0.0 | 2024-01 | 初始版本，支持基础浸润预测 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- 注液机配备流量计（精度±0.5%）\n- 真空传感器：精度±1kPa\n- 边缘计算节点：CPU 4核/内存8GB\n\n### 8.2 软件要求\n- 注液机控制系统接口\n- MES系统数据对接\n- 历史数据存储>=3个月\n\n### 8.3 数据要求\n- 历史注液数据>=5000组\n- 包含浸润质量验证结果\n- 不同电芯型号和电解液配方数据`,
      config: "{}",
      script: "return injection_amount / cell_weight * 0.8",
      scriptLang: "javascript"
    }
  },
  {
    skill_id: "capacity_prediction_v5",
    name: "化成容量预测模型",
    version: "5.0.0",
    domain: ["formation"],
    capability_tags: ["formation", "grading", "prediction"],
    input_schema: { formation_curve: "array", ocv_drop: "number" },
    output_schema: { predicted_capacity: "number", grade: "string" },
    cost: 0.9,
    latency: 1000,
    accuracy_score: 0.96,
    dependencies: [],
    description: "基于化成阶段的电压电流曲线预测最终分容容量，缩短分容时间。",
    files: {
      readme: `# 化成容量预测模型 (Capacity Prediction Model)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n化成容量预测是电池制造的关键质量控制点。本技能通过分析化成曲线特征，提前预测电池容量，实现：\n- 分容时间缩短30-50%\n- 容量预测准确率≥96%\n- 提前识别异常电池，降低后工序损耗\n- 优化化成工艺参数，提升首效\n\n### 1.2 技术原理\n融合电化学机理与深度学习：\n- **dV/dQ曲线分析**：识别锂化/脱锂特征峰\n- **增量容量分析(ICA)**：提取容量衰减特征\n- **OCV-SOC关系**：建立开路电压与容量关联\n- **时序神经网络**：捕捉化成过程的动态特性\n\n### 1.3 应用场景\n- 动力电池化成容量预测\n- 储能电池分容筛选\n- 化成工艺优化\n- 异常电池早期识别\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| formation_curve | array | 是 | - | 化成电压-电流-时间曲线数据 |\n| ocv_drop | number | 是 | 0-500 | OCV压降，单位：mV |\n| initial_ocv | number | 否 | 2000-4000 | 初始开路电压，单位：mV |\n| temperature | number | 否 | 25-60 | 化成温度，单位：℃ |\n| cell_type | string | 否 | NCM/LFP/LCO | 电池类型 |\n| nominal_capacity | number | 否 | 50-300 | 标称容量，单位：Ah |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| predicted_capacity | number | 预测容量 | Ah |\n| grade | string | 等级：A/B/C/D | - |\n| confidence | number | 预测置信度 | 0-1 |\n| deviation | number | 与标称容量偏差 | % |\n| ic_peaks | array | ICA特征峰位置 | mAh/V |\n| estimated_cycle_life | number | 预估循环寿命 | 次 |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 容量预测准确率 | ≥96% | 与实测分容对比 |\n| 等级判定准确率 | ≥94% | A/B/C/D等级 |\n| 预测响应时间 | ≤1000ms | 单次推理延迟 |\n| 异常检出率 | ≥98% | 低容量/异常电池 |\n| 系统可用性 | ≥99.5% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.90 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 Python调用示例\n\`\`\`python\nimport requests\n\nresponse = requests.post(\n    "https://api.battery-ai.com/skills/capacity_prediction_v5",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={\n        "formation_curve": [\n            {"time": 0, "voltage": 3200, "current": 0.5},\n            {"time": 60, "voltage": 3300, "current": 0.5},\n            ...\n        ],\n        "ocv_drop": 45,\n        "initial_ocv": 3200,\n        "temperature": 45,\n        "cell_type": "NCM",\n        "nominal_capacity": 100\n    }\n)\n\nresult = response.json()\nprint(f"预测容量: {result['predicted_capacity']}Ah, 等级: {result['grade']}")\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "predicted_capacity": 102.3,\n  "grade": "A",\n  "confidence": 0.97,\n  "deviation": 2.3,\n  "ic_peaks": [3.65, 3.72, 4.05],\n  "estimated_cycle_life": 2500\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| CAP_001 | 化成曲线数据不完整 | 检查数据采集系统，确保曲线完整 |\n| CAP_002 | OCV压降异常 | 检查电池连接，排除接触不良 |\n| CAP_003 | 预测置信度低 | 检查化成工艺稳定性或重新训练模型 |\n| CAP_004 | 电池类型不支持 | 确认cell_type为NCM/LFP/LCO之一 |\n| CAP_005 | 温度超出范围 | 调整化成温度至25-60℃范围 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v5.0.0 | 2024-01 | 新增ICA特征提取，准确率提升至96% |\n| v4.2.0 | 2023-09 | 支持多类型电池预测 |\n| v4.0.0 | 2023-06 | 引入时序神经网络架构 |\n| v3.0.0 | 2023-03 | 基础版本，dV/dQ分析方法 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- 化成设备：电压精度±1mV，电流精度±0.1%\n- 数据采集系统：采样频率≥1Hz\n- 计算节点：GPU支持，CUDA显存≥8GB\n\n### 8.2 软件要求\n- 化成系统数据接口\n- MES系统对接\n- 历史数据存储≥6个月\n\n### 8.3 数据要求\n- 历史化成数据≥10000组\n- 包含完整分容结果\n- 覆盖不同批次和工艺参数`,
      config: "{\"feature_extraction\": \"standard\"}",
      script: "model.predict(curve_features)",
      scriptLang: "python"
    }
  },
  {
    skill_id: "thermal_runaway_warning_v2",
    name: "Pack热失控预警",
    version: "2.1.0",
    domain: ["pack"],
    capability_tags: ["safety", "pack", "bms"],
    input_schema: { cell_temperatures: "array", cell_voltages: "array" },
    output_schema: { risk_level: "number", warning_msg: "string" },
    cost: 0.1,
    latency: 50,
    accuracy_score: 0.99,
    dependencies: [],
    description: "Pack下线测试中的热失控风险实时评估。",
    files: {
      readme: `# Pack热失控预警 (Thermal Runaway Warning)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n热失控是锂电池最严重的安全风险。本技能通过实时监测Pack温度、电压等关键参数，实现热失控的早期预警，保障生产安全和产品质量：\n- 热失控预警准确率≥99%\n- 预警提前时间≥30秒\n- 误报率≤0.1%\n- 避免重大安全事故和财产损失\n\n### 1.2 技术原理\n融合多维度异常检测算法：\n- **温升速率监测(dT/dt)**：识别异常温升趋势\n- **电压一致性分析**：检测单体电压异常偏差\n- **内阻变化追踪**：识别微短路迹象\n- **多参数融合**：综合温度、电压、气体等多源信号\n- **机器学习异常检测**：基于历史数据建立正常行为基线\n\n### 1.3 应用场景\n- Pack下线测试工序\n- 储能系统运行监测\n- 动力电池包安全监控\n- 实验室安全测试\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| cell_temperatures | array | 是 | - | 各电芯温度数组，单位：℃ |\n| cell_voltages | array | 是 | - | 各电芯电压数组，单位：mV |\n| ambient_temp | number | 否 | -40~60 | 环境温度，单位：℃ |\n| charge_current | number | 否 | 0-500 | 当前充电电流，单位：A |\n| gas_sensor_data | array | 否 | - | 气体传感器数据（CO/VOC） |\n| pack_id | string | 否 | - | Pack唯一标识 |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| risk_level | number | 风险等级评分 | 0-100 |\n| warning_msg | string | 预警信息描述 | - |\n| risk_category | string | 风险类别：thermal/short/gas | - |\n| max_temp | number | 最高温度 | ℃ |\n| max_dTdt | number | 最大温升速率 | ℃/min |\n| voltage_diff | number | 最大电压差 | mV |\n| recommended_action | string | 建议处置措施 | - |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 预警准确率 | ≥99% | 热失控事件正确预警比例 |\n| 预警提前时间 | ≥30秒 | 从预警到热失控发生的时间 |\n| 误报率 | ≤0.1% | 正常状态误报比例 |\n| 响应延迟 | ≤50ms | 单次检测延迟 |\n| 系统可用性 | ≥99.99% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.10 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 Python调用示例\n\`\`\`python\nimport requests\n\nresponse = requests.post(\n    "https://api.battery-ai.com/skills/thermal_runaway_warning_v2",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={\n        "cell_temperatures": [25.2, 25.5, 25.1, 25.3, 26.8, 25.4],\n        "cell_voltages": [3200, 3205, 3198, 3202, 3185, 3201],\n        "ambient_temp": 25,\n        "charge_current": 100,\n        "pack_id": "PACK-20240315-001"\n    }\n)\n\nresult = response.json()\nif result['risk_level'] > 70:\n    trigger_emergency_stop(result['pack_id'])\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "risk_level": 15,\n  "warning_msg": "温度正常，电压一致性良好",\n  "risk_category": "normal",\n  "max_temp": 26.8,\n  "max_dTdt": 0.5,\n  "voltage_diff": 20,\n  "recommended_action": "继续监测"\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| THERMAL_001 | 温度传感器数据缺失 | 检查温度传感器连接和校准 |\n| THERMAL_002 | 电压数据异常 | 检查BMS通信和电压采样电路 |\n| THERMAL_003 | 传感器数量不匹配 | 确认温度与电压数组长度一致 |\n| THERMAL_004 | 环境温度过高 | 检查测试环境通风和温控系统 |\n| THERMAL_005 | 检测到高风险 | 立即执行紧急停机程序 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v2.1.0 | 2024-02 | 新增气体传感器融合，提升预警准确率 |\n| v2.0.0 | 2023-11 | 引入深度学习异常检测模型 |\n| v1.5.0 | 2023-08 | 优化多参数融合算法 |\n| v1.0.0 | 2023-05 | 初始版本，基础温升监测 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- 温度传感器：精度±0.5℃，采样频率≥1Hz\n- 电压采样：精度±1mV，每串电芯独立采样\n- BMS系统：支持实时数据上报\n- 边缘计算节点：CPU 2核/内存4GB\n\n### 8.2 软件要求\n- BMS通信协议支持（CAN/Modbus）\n- 实时操作系统，调度周期≤10ms\n- 与MES/安全系统联动接口\n\n### 8.3 数据要求\n- 历史安全测试数据≥5000组\n- 包含正常、异常、热失控等各类工况\n- 数据标注：时间戳、风险等级、处置结果`,
      config: "{\"max_temp_diff\": 5.0}",
      script: "if max(temps) > 45: return {'risk': 'high'}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "sop_balancer_v1",
    name: "产销平衡优化器 (S&OP)",
    version: "1.2.0",
    domain: ["production_planning"],
    capability_tags: ["planning", "optimization", "supply_chain"],
    input_schema: { sales_forecast: "array", capacity_constraints: "object", inventory_levels: "object" },
    output_schema: { production_plan: "array", shortage_risk: "array" },
    cost: 0.6,
    latency: 2000,
    accuracy_score: 0.93,
    dependencies: [],
    description: "针对锂电制造场景，综合化成段瓶颈、静置室库位及正极材料供应，生成最优排产计划。",
    files: {
      readme: `## 产销平衡优化器 (S&OP)

### 1. 技能概述

#### 业务价值
销售与运营规划(S&OP)是连接市场需求与生产能力的核心流程。本技能针对锂电制造行业特点，构建多约束优化模型，实现产销精准平衡，支撑企业战略决策：
- 订单交付准时率提升至95%+
- 库存资金占用降低20-30%
- 产能利用率稳定在85-95%健康区间
- 正极材料库存周转天数缩短至15天以内

预计可帮助企业：
- 消除化成段”堵柜”现象，减少在制品积压
- 降低高价值正极材料(LFP/NCM)库存资金占用
- 确保Pack订单齐套率，提升客户满意度
- 支撑月度/季度S&OP会议决策

#### 技术原理
基于约束规划(Constraint Programming)和混合整数线性规划(MILP)：
- **多目标优化模型**：平衡交付率、库存、成本、产能利用率
  - 目标函数：最大化交付率 × 权重1 + 最小化库存 × 权重2 + 最大化产能利用率 × 权重3
- **硬约束处理**：化成柜容量、静置室库位、材料供应等不可违反约束
- **软约束松弛**：加班、外包等可调整约束，允许一定偏离
- **滚动优化机制**：支持12周滚动计划，每周更新

锂电行业专用约束模型：
| 约束类别 | 约束项 | 说明 | 优先级 |
|----------|--------|------|--------|
| 产能约束 | 化成柜容量 | 化成是主要瓶颈，柜位数量有限 | 硬约束 |
| | 静置室库位 | 高温静置需要特定温湿度环境 | 硬约束 |
| | 分容柜容量 | 容量测试设备投资大 | 硬约束 |
| | 涂布线产能 | 前段极片制造产能 | 软约束 |
| 物料约束 | 正极材料供应 | LFP/NCM采购提前期长 | 硬约束 |
| | 负极材料供应 | 石墨等材料供应 | 软约束 |
| | 电解液供应 | 需提前7天预订 | 软约束 |
| 库存约束 | 正极材料库存上限 | 控制资金占用 | 软约束 |
| | 在制品WIP上限 | 防止车间拥堵 | 硬约束 |
| | 成品库存上下限 | 满足交付需求 | 软约束 |
| 交付约束 | 订单交期 | 客户合同要求 | 硬约束 |
| | 订单优先级 | VIP客户优先 | 软约束 |

优化算法：
- **CBC求解器**：开源混合整数规划求解器
- **启发式规则**：快速生成初始可行解
- **局部搜索**：在可行解邻域内优化
- **分解协调**：大问题分解为子问题分别求解

#### 应用场景
- **月度S&OP会议**：生成下月生产计划，平衡需求与产能
- **周度产销协调**：调整周计划，应对需求波动
- **紧急插单评估**：快速评估插单对整体计划的影响
- **产能扩张决策**：模拟不同产能配置下的产销平衡
- **材料采购计划**：基于生产计划生成物料需求计划(MRP)

### 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| plan_version | string | 是 | - | 计划版本号，如”2024-01-v3” |
| planning_horizon | object | 是 | - | 计划周期 |
| planning_horizon.start_date | date | 是 | ISO 8601 | 计划开始日期 |
| planning_horizon.weeks | number | 是 | 4-12 | 计划周数，默认12周 |
| sales_forecast | array | 是 | - | 销售预测数据 |
| sales_forecast[].week | number | 是 | 1-12 | 周次 |
| sales_forecast[].product_id | string | 是 | - | 产品型号 |
| sales_forecast[].quantity | number | 是 | >=0 | 预测需求量，单位：支或kWh |
| sales_forecast[].priority | enum | 否 | high/medium/low | 优先级，默认medium |
| capacity_constraints | object | 是 | - | 产能约束 |
| capacity_constraints.formation_capacity | number | 是 | >0 | 化成柜容量，单位：支/周 |
| capacity_constraints.aging_room_slots | number | 是 | >0 | 静置室库位，单位：托盘数 |
| capacity_constraints.formation_oee | number | 否 | 0-1 | 化成柜OEE，默认0.90 |
| capacity_constraints.coating_capacity | number | 否 | >0 | 涂布线产能，单位：m²/周 |
| capacity_constraints.winding_capacity | number | 否 | >0 | 卷绕机产能，单位：支/周 |
| inventory_levels | object | 是 | - | 当前库存水平 |
| inventory_levels.raw_material | object | 是 | - | 原材料库存 |
| inventory_levels.raw_material.cathode | number | 是 | >=0 | 正极材料库存，单位：吨 |
| inventory_levels.raw_material.anode | number | 否 | >=0 | 负极材料库存，单位：吨 |
| inventory_levels.wip | number | 是 | >=0 | 在制品库存，单位：支 |
| inventory_levels.finished_goods | number | 是 | >=0 | 成品库存，单位：支 |
| material_supply | object | 是 | - | 材料供应计划 |
| material_supply.cathode_arrivals | array | 是 | - | 正极材料到货计划 |
| material_supply.cathode_arrivals[].week | number | 是 | 1-12 | 周次 |
| material_supply.cathode_arrivals[].quantity | number | 是 | >=0 | 到货量，单位：吨 |
| objective_weights | object | 否 | - | 目标权重配置 |
| objective_weights.delivery_rate | number | 否 | 0-1 | 交付率权重，默认0.4 |
| objective_weights.inventory_cost | number | 否 | 0-1 | 库存成本权重，默认0.3 |
| objective_weights.capacity_utilization | number | 否 | 0-1 | 产能利用权重，默认0.2 |
| objective_weights.production_smoothness | number | 否 | 0-1 | 生产平滑权重，默认0.1 |
| constraints_relaxation | object | 否 | - | 约束松弛配置 |
| constraints_relaxation.allow_overtime | boolean | 否 | true/false | 允许加班，默认false |
| constraints_relaxation.allow_outsourcing | boolean | 否 | true/false | 允许外包，默认false |
| constraints_relaxation.max_overtime_ratio | number | 否 | 0-0.3 | 最大加班比例，默认0.1 |

### 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| optimization_id | string | 优化任务唯一标识 | - |
| plan_version | string | 计划版本 | - |
| production_plan | array | 生产计划 | - |
| production_plan[].week | number | 周次 | - |
| production_plan[].product_id | string | 产品型号 | - |
| production_plan[].planned_quantity | number | 计划产量 | 支 |
| production_plan[].cumulative_quantity | number | 累计产量 | 支 |
| shortage_risk | array | 缺货风险列表 | - |
| shortage_risk[].week | number | 风险周次 | - |
| shortage_risk[].product_id | string | 产品型号 | - |
| shortage_risk[].shortage_quantity | number | 缺口数量 | 支 |
| shortage_risk[].risk_level | enum | 风险等级：high/medium/low | - |
| shortage_risk[].mitigation_suggestion | string | 缓解建议 | - |
| capacity_utilization | object | 产能利用率 | - |
| capacity_utilization.formation | array | 化成柜周利用率 | % |
| capacity_utilization.aging_room | array | 静置室周利用率 | % |
| capacity_utilization.overall | number | 整体产能利用率 | % |
| inventory_projection | array | 库存预测 | - |
| inventory_projection[].week | number | 周次 | - |
| inventory_projection[].raw_material | number | 原材料库存 | 吨 |
| inventory_projection[].wip | number | 在制品库存 | 支 |
| inventory_projection[].finished_goods | number | 成品库存 | 支 |
| material_requirements | array | 物料需求计划 | - |
| material_requirements[].week | number | 周次 | - |
| material_requirements[].cathode_required | number | 正极材料需求 | 吨 |
| material_requirements[].anode_required | number | 负极材料需求 | 吨 |
| material_requirements[].electrolyte_required | number | 电解液需求 | 吨 |
| plan_feasibility | object | 计划可行性 | - |
| plan_feasibility.is_feasible | boolean | 是否可行 | - |
| plan_feasibility.violated_constraints | array | 违反的约束 | - |
| plan_feasibility.suggestions | array | 可行性建议 | - |
| kpis | object | 关键指标 | - |
| kpis.delivery_rate | number | 预计交付率 | % |
| kpis.average_inventory_value | number | 平均库存金额 | 万元 |
| kpis.capacity_utilization_avg | number | 平均产能利用率 | % |
| kpis.plan_smoothness | number | 计划平滑度 | 0-1 |
| optimization_stats | object | 优化统计 | - |
| optimization_stats.solve_time_ms | number | 求解时间 | 毫秒 |
| optimization_stats.iterations | number | 迭代次数 | - |
| optimization_stats.gap | number | 最优性间隙 | % |
| generated_at | datetime | 生成时间 | ISO 8601 |
| report_url | string | 详细报告下载链接 | URL |

### 4. 性能指标

| 指标项 | 数值 | 说明 |
|--------|------|------|
| 计划优化率 | >=93% | 相比人工计划提升 |
| 求解时间 | <2000ms | 12周计划求解时间 |
| 计划可行率 | >=95% | 生成可行计划的比例 |
| 交付率预测准确率 | >=90% | 预测vs实际对比 |
| 支持产品种类 | 50种 | 单次计划最大产品数 |
| API可用性 | 99.5% | 月度服务可用性SLA |
| 计划结果保留 | 2年 | 历史计划存储时长 |
| 单次调用成本 | 0.6元/次 | 含计算与存储费用 |

### 5. 使用示例

\`\`\`typescript
// 示例：生成下12周产销平衡计划
const sopRequest = {
  plan_version: '2024-Q1-v1',
  planning_horizon: {
    start_date: '2024-01-15',
    weeks: 12
  },
  sales_forecast: [
    { week: 1, product_id: 'NCM-100Ah', quantity: 50000, priority: 'high' },
    { week: 1, product_id: 'LFP-280Ah', quantity: 30000, priority: 'medium' },
    { week: 2, product_id: 'NCM-100Ah', quantity: 52000, priority: 'high' },
    // ... 更多周次和产品
  ],
  capacity_constraints: {
    formation_capacity: 60000, // 化成柜周产能6万支
    aging_room_slots: 5000,    // 静置室5000托盘位
    formation_oee: 0.90,
    coating_capacity: 150000,  // 涂布线周产能15万m²
    winding_capacity: 65000    // 卷绕机周产能6.5万支
  },
  inventory_levels: {
    raw_material: {
      cathode: 850,  // 正极材料850吨
      anode: 420     // 负极材料420吨
    },
    wip: 15000,      // 在制品1.5万支
    finished_goods: 25000 // 成品2.5万支
  },
  material_supply: {
    cathode_arrivals: [
      { week: 1, quantity: 200 },
      { week: 3, quantity: 300 },
      { week: 5, quantity: 250 },
      // ... 更多到货计划
    ]
  },
  objective_weights: {
    delivery_rate: 0.45,
    inventory_cost: 0.25,
    capacity_utilization: 0.20,
    production_smoothness: 0.10
  },
  constraints_relaxation: {
    allow_overtime: true,
    allow_outsourcing: false,
    max_overtime_ratio: 0.15
  }
};

// 调用技能
const result = await skillClient.invoke('sop_balancer_v1', sopRequest);

// 处理结果
console.log(\`计划可行性：\${result.plan_feasibility.is_feasible ? '可行' : '不可行'}\`);
console.log(\`预计交付率：\${result.kpis.delivery_rate}%\`);
console.log(\`平均库存金额：\${result.kpis.average_inventory_value}万元\`);

// 检查缺货风险
if (result.shortage_risk.length > 0) {
  console.warn('存在缺货风险：');
  result.shortage_risk.forEach(risk => {
    console.warn(\`第\${risk.week}周 \${risk.product_id} 缺口\${risk.shortage_quantity}支，建议：\${risk.mitigation_suggestion}\`);
  });
}

// 产能利用率
console.log('化成柜周利用率：', result.capacity_utilization.formation);

// 物料需求
result.material_requirements.forEach(req => {
  console.log(\`第\${req.week}周需正极材料\${req.cathode_required}吨\`);
});
\`\`\`

### 6. 故障处理

| 错误码 | 错误信息 | 可能原因 | 处理建议 |
|--------|----------|----------|----------|
| ESB001 | 计划版本号无效 | plan_version格式错误或重复 | 确保版本号唯一且符合命名规范 |
| ESB002 | 销售预测数据缺失 | sales_forecast为空 | 提供至少4周销售预测 |
| ESB003 | 产能约束为0 | formation_capacity或aging_room_slots为0 | 提供有效的产能约束值 |
| ESB004 | 库存数据异常 | 库存值为负数 | 确保库存数据为非负数 |
| ESB005 | 材料到货计划缺失 | material_supply.cathode_arrivals为空 | 提供正极材料到货计划 |
| ESB006 | 权重配置错误 | 权重之和不等于1 | 调整权重，确保总和为1 |
| ESB007 | 计划周期无效 | planning_horizon.weeks超出4-12范围 | 调整计划周期至有效范围 |
| ESB008 | 求解不收敛 | 约束过于严格导致无可行解 | 放宽约束或增加产能 |
| ESB009 | 计算资源不足 | 产品种类过多或计划周期过长 | 减少产品种类或缩短计划周期 |
| ESB010 | 权限不足 | 当前用户无S&OP计划权限 | 联系系统管理员申请权限 |

### 7. 版本历史

| 版本 | 发布日期 | 变更内容 | 兼容性 |
|------|----------|----------|--------|
| v1.2.0 | 2024-01-15 | 新增约束松弛配置，支持加班和外包 | 向下兼容 |
| v1.1.0 | 2023-11-20 | 优化求解算法，提升求解速度 | 向下兼容 |
| v1.0.0 | 2023-09-01 | 初始版本，基础S&OP优化功能 | - |

### 8. 依赖与前置条件

#### 硬件要求
- **计算资源**：优化服务需4核8GB内存配置
- **存储空间**：历史计划数据存储>=200GB

#### 软件要求
- **求解器**：CBC或Gurobi混合整数规划求解器
- **ERP系统**：销售订单、库存数据实时同步
- **MES系统**：产能、物料数据实时采集

#### 数据要求
- **销售预测**：至少4周滚动预测，包含产品型号和数量
- **产能数据**：化成柜、静置室、涂布线、卷绕机等关键设备产能
- **库存数据**：原材料、在制品、成品实时库存
- **物料计划**：正极材料等主要原材料的到货计划

#### 权限要求
- 用户需具备”S&OP计划”操作权限
- 需配置ERP销售数据读取权限
- 需配置MES生产数据读取权限 |
      config: "{\"solver\": \"cbc\", \"time_horizon\": \"12 weeks\", \"constraints\": [\"formation_capacity\", \"aging_room_slots\"]}",
      script: "import pulp\n\ndef optimize_plan(forecast, constraints, inventory):\n    # 锂电专用规划模型\n    # 优先满足 Pack 交付，同时平滑化成柜负载\n    prob = pulp.LpProblem(\"Battery_SOP\", pulp.LpMaximize)\n    return {\n        \"production_plan\": [50000, 52000, 50000], # Cell count\n        \"formation_utilization\": 0.98\n    }",
      scriptLang: "python"
    }
  },
  {
    skill_id: "equipment_rul_pred_v2",
    name: "设备RUL预测",
    version: "2.1.5",
    domain: ["predictive_maintenance"],
    capability_tags: ["maintenance", "iot", "prediction"],
    input_schema: { vibration_spectrum: "array", oil_analysis: "object", run_hours: "number" },
    output_schema: { rul_days: "number", confidence: "number", failure_mode: "string" },
    cost: 0.4,
    latency: 150,
    accuracy_score: 0.91,
    dependencies: [],
    description: "利用振动和油液分析数据，预测关键设备（如涂布机辊轴）的剩余寿命。",
    files: {
      readme: `# 设备RUL预测 (Equipment RUL Prediction)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n设备故障是产线停机和产品质量波动的主要原因。本技能通过多源传感器数据分析，预测设备剩余使用寿命，实现预测性维护：\n- 非计划停机减少40-60%\n- 维护成本降低25-30%\n- 设备利用率提升10-15%\n- 备件库存优化，资金占用降低20%\n\n### 1.2 技术原理\n融合物理退化模型与数据驱动方法：\n- **振动频谱分析**：识别轴承、齿轮等旋转部件退化特征\n- **油液分析**：监测润滑油中的金属磨粒和理化指标\n- **温度趋势分析**：检测异常温升模式\n- **深度学习退化模型**：CNN+LSTM混合网络预测RUL\n- **生存分析**：考虑设备个体差异的不确定性量化\n\n### 1.3 应用场景\n- 关键生产设备（搅拌机、涂布机、辊压机）\n- 卷绕机主轴和伺服系统\n- 化成柜和分容柜\n- 物流AGV和输送系统\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| vibration_spectrum | array | 是 | - | 振动频谱数据，FFT结果 |\n| oil_analysis | object | 否 | - | 油液分析数据 |\n| run_hours | number | 是 | 0-100000 | 累计运行小时数 |\n| temperature_data | array | 否 | - | 温度传感器历史数据 |\n| current_data | array | 否 | - | 电流监测数据 |\n| equipment_id | string | 是 | - | 设备唯一标识 |\n| equipment_type | string | 是 | - | 设备类型编码 |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| rul_days | number | 预测剩余使用寿命 | 天 |\n| confidence | number | 预测置信度 | 0-1 |\n| failure_mode | string | 最可能的故障模式 | - |\n| rul_distribution | object | RUL概率分布 | - |\n| health_score | number | 设备健康度评分 | 0-100 |\n| maintenance_urgency | string | 维护紧急程度 | - |\n| recommended_action | string | 建议维护措施 | - |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| RUL预测准确率 | >=91% | 预测值与实际值偏差<20%比例 |\n| 故障提前预警率 | >=95% | 提前7天以上预警比例 |\n| 误报率 | <=5% | 正常设备误判比例 |\n| 预测响应时间 | <=150ms | 单次推理延迟 |\n| 系统可用性 | >=99.5% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.40 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 Python调用示例\n\`\`\`python\nimport requests\n\nresponse = requests.post(\n    "https://api.battery-ai.com/skills/equipment_rul_pred_v2",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={\n        "vibration_spectrum": [0.1, 0.2, 0.5, 1.2, 0.8, ...],\n        "oil_analysis": {\n            "viscosity": 45,\n            "metal_particles": 15,\n            "moisture": 0.05\n        },\n        "run_hours": 8760,\n        "equipment_id": "MIX-001",\n        "equipment_type": "vacuum_mixer"\n    }\n)\n\nresult = response.json()\nif result['rul_days'] < 30:\n    schedule_maintenance(result['equipment_id'])\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "rul_days": 145,\n  "confidence": 0.92,\n  "failure_mode": "bearing_wear",\n  "rul_distribution": {\n    "p10": 120,\n    "p50": 145,\n    "p90": 180\n  },\n  "health_score": 78,\n  "maintenance_urgency": "medium",\n  "recommended_action": "建议3个月内安排轴承更换"\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| RUL_001 | 振动数据异常 | 检查加速度传感器连接和校准 |\n| RUL_002 | 运行时间数据缺失 | 确认设备运行时间记录完整性 |\n| RUL_003 | 设备类型不支持 | 检查equipment_type是否在支持列表 |\n| RUL_004 | 预测置信度低 | 增加历史故障数据或检查传感器状态 |\n| RUL_005 | 模型需要更新 | 联系管理员进行模型重训练 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v2.1.5 | 2024-02 | 优化轴承故障检测算法 |\n| v2.1.0 | 2023-12 | 新增油液分析融合 |\n| v2.0.0 | 2023-09 | 引入CNN+LSTM混合网络 |\n| v1.5.0 | 2023-06 | 支持多设备类型 |\n| v1.0.0 | 2023-03 | 初始版本，基础RUL预测 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- 振动传感器：IEPE型，频率范围0.1-10kHz\n- 数据采集器：采样率>=25.6kHz，24位ADC\n- 边缘计算节点：CPU 4核/内存8GB/GPU可选\n\n### 8.2 软件要求\n- 设备数据采集系统接口\n- CMMS系统对接\n- 历史数据存储>=12个月\n\n### 8.3 数据要求\n- 历史运行数据>=6个月\n- 故障记录>=50条\n- 包含正常运行和各类故障模式数据`,
      config: "{\"model_path\": \"s3://models/rul_hybrid_v2.pt\", \"threshold_alert\": 7}",
      script: "def predict_rul(data):\n    # 模拟深度学习推理\n    health_index = calculate_hi(data)\n    rul = map_hi_to_rul(health_index)\n    return {\"rul_days\": 45, \"confidence\": 0.88}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "repair_time_estimator_v1",
    name: "维修工时智能估算",
    version: "1.0.0",
    domain: ["breakdown_maintenance"],
    capability_tags: ["maintenance", "scheduling", "resource_allocation"],
    input_schema: { 
        failure_code: "string", 
        similar_work_orders: "array", 
        expert_availability: "object",
        spare_parts_status: "object" 
    },
    output_schema: { estimated_minutes: "number", recommended_expert: "string", parts_arrival_time: "number" },
    cost: 0.3,
    latency: 80,
    accuracy_score: 0.88,
    dependencies: [],
    description: "综合历史工单、专家排班及备件位置距离，精准预测故障恢复时间(MTTR)。",
    files: {
      readme: `## 维修工时智能估算

### 1. 技能概述

#### 业务价值
设备故障停机直接影响生产计划和交付承诺。本技能通过综合历史工单数据、专家技能和备件物流信息，精准预测故障修复时间(MTTR)，支撑维修调度和生产调整决策：
- 维修时间预测准确率提升至88%
- 生产调度调整响应时间缩短50%
- 减少因维修时间估计不准导致的计划混乱
- 优化维修资源配置，提升维修效率

预计可帮助企业：
- 故障响应时间缩短20-30%
- 维修资源利用率提升15%
- 生产计划调整更加精准
- 客户交付承诺更加可靠

#### 技术原理
融合知识图谱查询与机器学习预测：
- **历史工单分析**：查询知识图谱中相同故障代码的历史工单
  - 计算平均修复时间、中位数、P90分位数
  - 分析故障类型与维修时间的关联关系
- **专家技能匹配**：基于技能矩阵匹配最合适的维修专家
  - 专家技能等级：初级/中级/高级/专家
  - 专家当前工单负载和排班状态
  - 专家与故障设备距离
- **备件物流计算**：评估备件到位时间
  - 备件库存查询（本地库/区域库/供应商）
  - AGV/人工配送时间计算
  - 紧急采购周期评估
- **动态调整模型**：根据实时情况调整预测
  - 考虑故障复杂度（简单/中等/复杂）
  - 考虑环境因素（班次、节假日）
  - 考虑设备年龄和健康状态

维修时间构成：
| 阶段 | 说明 | 典型时长 | 影响因素 |
|------|------|----------|----------|
| 响应时间 | 从报修到维修人员到场 | 5-30分钟 | 人员距离、班次 |
| 诊断时间 | 故障原因分析和确认 | 10-60分钟 | 故障复杂度、经验 |
| 备件等待 | 等待备件到位 | 0-240分钟 | 库存位置、物流 |
| 修复时间 | 实际维修操作 | 15-300分钟 | 故障类型、技能 |
| 验证时间 | 修复后测试验证 | 10-60分钟 | 设备类型、标准 |

故障类型-时间映射（锂电行业专用）：
| 故障类型 | 典型MTTR | 主要影响因素 |
|----------|----------|--------------|
| 机械故障 | 2-4小时 | 部件更换难度 |
| 电气故障 | 1-3小时 | 故障定位时间 |
| 软件故障 | 0.5-1小时 | 重启/升级时间 |
| 极片断裂 | 3-5小时 | 穿带调整时间 |
| 电解液泄漏 | 4-6小时 | 清洁和安全检查 |
| 隔膜破损 | 2-3小时 | 卷芯取出难度 |
| 模头堵塞 | 1-2小时 | 清洗和校准 |
| 张力异常 | 0.5-1.5小时 | 传感器校准 |

#### 应用场景
- **故障响应**：故障发生时快速估算修复时间
- **生产调度**：根据修复时间调整生产计划
- **维修派工**：推荐最合适的维修专家
- **备件调度**：优化备件配送路径
- **客户沟通**：向客户反馈预计恢复时间

### 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| work_order_id | string | 是 | - | 工单唯一标识 |
| failure_code | string | 是 | - | 故障代码，如"MECH-001"、"ELEC-003" |
| equipment_id | string | 是 | - | 故障设备ID |
| equipment_type | enum | 是 | mixer/coater/roller/slitter/winder/formation/grader | 设备类型 |
| failure_description | string | 否 | - | 故障描述 |
| failure_severity | enum | 否 | minor/moderate/major/critical | 故障严重程度，默认moderate |
| location | object | 是 | - | 故障位置 |
| location.area | string | 是 | - | 区域，如"A区"、"化成车间" |
| location.line | string | 是 | - | 产线，如"CA01" |
| location.station | string | 否 | - | 工位，如"S03" |
| report_time | datetime | 是 | ISO 8601 | 故障报修时间 |
| similar_work_orders | array | 否 | - | 相似历史工单 |
| similar_work_orders[].wo_id | string | 是 | - | 历史工单ID |
| similar_work_orders[].actual_duration | number | 是 | >0 | 实际维修时长，单位：分钟 |
| expert_availability | object | 否 | - | 专家可用性 |
| expert_availability.experts | array | 否 | - | 可用专家列表 |
| expert_availability.experts[].expert_id | string | 是 | - | 专家ID |
| expert_availability.experts[].skill_level | enum | 是 | junior/intermediate/senior/expert | 技能等级 |
| expert_availability.experts[].distance_meters | number | 是 | >=0 | 距离故障点，单位：米 |
| expert_availability.experts[].current_task_end | datetime | 否 | ISO 8601 | 当前任务预计结束时间 |
| spare_parts_status | object | 否 | - | 备件状态 |
| spare_parts_status.parts | array | 否 | - | 所需备件列表 |
| spare_parts_status.parts[].part_id | string | 是 | - | 备件ID |
| spare_parts_status.parts[].part_name | string | 是 | - | 备件名称 |
| spare_parts_status.parts[].location | enum | 是 | local/regional/supplier | 备件位置 |
| spare_parts_status.parts[].quantity_available | number | 是 | >=0 | 可用数量 |
| spare_parts_status.parts[].delivery_time_minutes | number | 否 | >=0 | 预计配送时间，单位：分钟 |

### 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| estimation_id | string | 估算任务唯一标识 | - |
| work_order_id | string | 工单ID | - |
| estimated_minutes | number | 预计修复总时长 | 分钟 |
| estimated_minutes_breakdown | object | 时长分解 | - |
| estimated_minutes_breakdown.response | number | 响应时间 | 分钟 |
| estimated_minutes_breakdown.diagnosis | number | 诊断时间 | 分钟 |
| estimated_minutes_breakdown.parts_wait | number | 备件等待时间 | 分钟 |
| estimated_minutes_breakdown.repair | number | 修复时间 | 分钟 |
| estimated_minutes_breakdown.verification | number | 验证时间 | 分钟 |
| confidence_interval | object | 置信区间 | - |
| confidence_interval.lower | number | 下限（P10） | 分钟 |
| confidence_interval.upper | number | 上限（P90） | 分钟 |
| recommended_expert | object | 推荐专家 | - |
| recommended_expert.expert_id | string | 专家ID | - |
| recommended_expert.expert_name | string | 专家姓名 | - |
| recommended_expert.skill_level | string | 技能等级 | - |
| recommended_expert.estimated_arrival | datetime | 预计到场时间 | ISO 8601 |
| recommended_expert.alternative_experts | array | 备选专家 | - |
| parts_arrival_time | number | 备件到位时间 | 分钟 |
| parts_arrival_details | array | 备件到位详情 | - |
| parts_arrival_details[].part_id | string | 备件ID | - |
| parts_arrival_details[].part_name | string | 备件名称 | - |
| parts_arrival_details[].arrival_time | number | 预计到位时间 | 分钟 |
| parts_arrival_details[].delivery_method | string | 配送方式 | - |
| risk_factors | array | 风险因素 | - |
| risk_factors[].factor | string | 风险描述 | - |
| risk_factors[].impact | enum | 影响：delay/accelerate | - |
| risk_factors[].probability | number | 发生概率 | 0-1 |
| historical_comparison | object | 历史对比 | - |
| historical_comparison.similar_cases_count | number | 相似案例数 | - |
| historical_comparison.average_duration | number | 历史平均时长 | 分钟 |
| historical_comparison.percentile_90 | number | 历史P90时长 | 分钟 |
| contingency_plan | object | 应急预案 | - |
| contingency_plan.trigger_condition | string | 触发条件 | - |
| contingency_plan.backup_resources | array | 备用资源 | - |
| generated_at | datetime | 生成时间 | ISO 8601 |

### 4. 性能指标

| 指标项 | 数值 | 说明 |
|--------|------|------|
| 预测准确率 | >=88% | 预测值与实际值偏差<20%比例 |
| P90覆盖率 | >=90% | 实际值落在P10-P90区间比例 |
| 单次估算延迟 | <80ms | 标准估算时间 |
| 支持故障类型 | 100种 | 预定义故障类型数量 |
| API可用性 | 99.5% | 月度服务可用性SLA |
| 估算结果保留 | 2年 | 历史估算数据存储时长 |
| 单次调用成本 | 0.3元/次 | 含计算与存储费用 |

### 5. 使用示例

\`\`\`typescript
// 示例：估算涂布机模头堵塞故障的修复时间
const mttrRequest = {
  work_order_id: 'WO-20240115-001',
  failure_code: 'COATER-MECH-003',
  equipment_id: 'COATER-001',
  equipment_type: 'coater',
  failure_description: '涂布模头堵塞，面密度异常',
  failure_severity: 'moderate',
  location: {
    area: 'A区',
    line: 'CA01',
    station: 'S02'
  },
  report_time: '2024-01-15T08:30:00Z',
  similar_work_orders: [
    { wo_id: 'WO-20231201-015', actual_duration: 90 },
    { wo_id: 'WO-20231120-008', actual_duration: 75 },
    { wo_id: 'WO-20231015-022', actual_duration: 120 }
  ],
  expert_availability: {
    experts: [
      {
        expert_id: 'TECH-001',
        skill_level: 'senior',
        distance_meters: 500,
        current_task_end: '2024-01-15T08:45:00Z'
      },
      {
        expert_id: 'TECH-002',
        skill_level: 'intermediate',
        distance_meters: 200,
        current_task_end: null
      }
    ]
  },
  spare_parts_status: {
    parts: [
      {
        part_id: 'GASKET-001',
        part_name: '模头垫片',
        location: 'local',
        quantity_available: 10,
        delivery_time_minutes: 15
      }
    ]
  }
};

// 调用技能
const result = await skillClient.invoke('repair_time_estimator_v1', mttrRequest);

// 处理结果
console.log(\`预计修复时间：\${result.estimated_minutes}分钟\`);
console.log(\`置信区间：\${result.confidence_interval.lower}-\${result.confidence_interval.upper}分钟\`);

// 推荐专家
console.log(\`推荐专家：\${result.recommended_expert.expert_name}（\${result.recommended_expert.skill_level}）\`);
console.log(\`预计到场：\${result.recommended_expert.estimated_arrival}\`);

// 备件到位
console.log(\`备件到位时间：\${result.parts_arrival_time}分钟\`);

// 风险因素
result.risk_factors.forEach(risk => {
  console.warn(\`风险：\${risk.factor}，概率\${risk.probability * 100}%\`);
});

// 历史对比
console.log(\`历史平均修复时间：\${result.historical_comparison.average_duration}分钟\`);
\`\`\`

### 6. 故障处理

| 错误码 | 错误信息 | 可能原因 | 处理建议 |
|--------|----------|----------|----------|
| ERT001 | 工单ID已存在 | work_order_id重复 | 使用新的工单ID |
| ERT002 | 故障代码无效 | failure_code未定义 | 使用标准故障代码 |
| ERT003 | 设备类型不支持 | equipment_type不在枚举列表 | 核对设备类型枚举值 |
| ERT004 | 故障严重程度无效 | failure_severity值错误 | 使用minor/moderate/major/critical |
| ERT005 | 历史工单数据不足 | similar_work_orders少于3条 | 提供至少3条相似历史工单 |
| ERT006 | 专家数据格式错误 | expert_availability格式不正确 | 检查experts数组结构 |
| ERT007 | 备件位置无效 | location不是local/regional/supplier | 使用正确的位置枚举值 |
| ERT008 | 报修时间无效 | report_time为未来时间 | 使用当前或过去的时间 |
| ERT009 | 知识图谱查询失败 | 历史数据查询异常 | 检查知识图谱连接状态 |
| ERT010 | 计算资源不足 | 并发请求过多 | 稍后重试 |

### 7. 版本历史

| 版本 | 发布日期 | 变更内容 | 兼容性 |
|------|----------|----------|--------|
| v1.0.0 | 2024-01-15 | 初始版本，支持MTTR估算和专家推荐 | - |

### 8. 依赖与前置条件

#### 硬件要求
- **计算资源**：估算服务需2核4GB内存配置
- **存储空间**：历史工单数据存储>=100GB

#### 软件要求
- **知识图谱**：存储历史工单、故障类型、维修记录
- **CMMS系统**：工单管理、专家技能矩阵
- **WMS系统**：备件库存查询
- **定位系统**：人员位置追踪（可选）

#### 数据要求
- **故障代码库**：标准化的故障分类和代码体系
- **历史工单**：至少1000条历史维修工单
- **专家档案**：技能等级、专业领域、历史绩效
- **备件主数据**：备件清单、库存位置、配送时间

#### 权限要求
- 用户需具备"维修估算"操作权限
- 需配置知识图谱查询权限
- 需配置CMMS/WMS系统数据读取权限 |,
      config: "{\"search_radius\": \"factory_zone_a\", \"expert_skills_matrix\": \"db_ref_v1\", \"agv_speed\": \"1.5m/s\"}",
      script: "def estimate_repair(failure, resources):\n    # 1. 历史基准\n    base_time = get_historical_average(failure.code)\n    \n    # 2. 专家等待时间\n    expert = find_best_expert(resources.experts)\n    wait_time = expert.current_task_remaining if expert.busy else 0\n    \n    # 3. 备件配送时间\n    part_dist = get_distance(resources.parts.location, failure.location)\n    delivery_time = part_dist / 1.5 / 60 # minutes\n    \n    total_time = base_time + max(wait_time, delivery_time)\n    \n    return {\n        \"estimated_minutes\": round(total_time),\n        \"recommended_expert\": expert.name,\n        \"parts_arrival_time\": round(delivery_time)\n    }",
      scriptLang: "python"
    }
  },
  {
    skill_id: "cost_realtime_analyzer_v1",
    name: "单吨制造成本实时分析",
    version: "1.1.0",
    domain: ["cost_management"],
    capability_tags: ["management", "cost", "finance"],
    input_schema: { energy_consumption: "number", material_usage: "number", output_volume: "number" },
    output_schema: { cost_per_wh: "number", variance_reason: "string" },
    cost: 0.2,
    latency: 500,
    accuracy_score: 0.95,
    dependencies: [],
    description: "实时计算分段工序的能耗与物料成本，生成单瓦时(Wh)制造成本报表。",
    files: {
      readme: `# 单吨制造成本实时分析 (Cost Realtime Analyzer)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n制造成本是电池企业核心竞争力。本技能通过实时聚合产线数据，精准计算单瓦时制造成本，支持成本控制和优化决策：\n- 成本异常实时预警，降低超支风险\n- 工序成本透明化，识别降本空间\n- 支持多维度成本分析（按产品/工序/班次）\n- 成本数据驱动工艺优化决策\n\n### 1.2 技术原理\n基于活动成本法(ABC)和实时数据融合：\n- **能耗成本计算**：SCADA电表数据实时采集\n- **物料成本追溯**：MES投料记录与BOM匹配\n- **人工费用分摊**：按标准工时和实际产量分摊\n- **制造费用分配**：设备折旧、维护费用按活动分配\n- **成本差异分析**：实际成本vs标准成本对比\n\n### 1.3 应用场景\n- 产线级成本实时监控\n- 工序成本异常诊断\n- 产品盈利能力分析\n- 成本预算执行跟踪\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| energy_consumption | number | 是 | >=0 | 工序能耗，单位：kWh |\n| material_usage | number | 是 | >=0 | 物料消耗金额，单位：元 |\n| output_volume | number | 是 | >0 | 产出电量，单位：Wh |\n| labor_hours | number | 否 | >=0 | 人工工时，单位：小时 |\n| equipment_id | string | 否 | - | 设备/产线标识 |\n| time_period | string | 否 | - | 统计周期：hour/shift/day |\n| product_type | string | 否 | - | 产品型号 |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| cost_per_wh | number | 单瓦时制造成本 | 元/Wh |\n| variance_reason | string | 成本差异原因分析 | - |\n| energy_cost_ratio | number | 能耗成本占比 | % |\n| material_cost_ratio | number | 物料成本占比 | % |\n| labor_cost_ratio | number | 人工成本占比 | % |\n| total_cost | number | 总制造成本 | 元 |\n| benchmark_comparison | string | 与基准对比结果 | - |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 成本计算准确率 | >=95% | 与财务核算对比 |\n| 数据延迟 | <=5分钟 | 从生产到成本报表 |\n| 计算响应时间 | <=500ms | 单次查询延迟 |\n| 成本异常检出率 | >=90% | 超支/异常识别 |\n| 系统可用性 | >=99.5% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.20 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 Python调用示例\n\`\`\`python\nimport requests\n\nresponse = requests.post(\n    "https://api.battery-ai.com/skills/cost_realtime_analyzer_v1",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={\n        "energy_consumption": 1250,\n        "material_usage": 85000,\n        "output_volume": 250000,\n        "labor_hours": 16,\n        "equipment_id": "LINE-A",\n        "time_period": "shift",\n        "product_type": "NCM-100Ah"\n    }\n)\n\nresult = response.json()\nprint(f"单Wh成本: {result['cost_per_wh']:.4f}元")\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "cost_per_wh": 0.345,\n  "variance_reason": "能耗略高于标准，建议检查真空泵运行效率",\n  "energy_cost_ratio": 18.5,\n  "material_cost_ratio": 72.3,\n  "labor_cost_ratio": 4.2,\n  "total_cost": 86250,\n  "benchmark_comparison": "高于基准2.1%，主要因能耗增加"\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| COST_001 | 产出量为零 | 检查MES产量数据上报 |\n| COST_002 | 能耗数据缺失 | 检查SCADA电表通信 |\n| COST_003 | 物料成本异常 | 核对BOM和投料记录 |\n| COST_004 | 计算精度溢出 | 检查输入数值范围 |\n| COST_005 | 基准数据缺失 | 配置产品标准成本基准 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v1.1.0 | 2024-01 | 新增成本差异分析和基准对比 |\n| v1.0.0 | 2023-09 | 初始版本，基础成本计算功能 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- SCADA系统：电表数据采集，精度±0.5%\n- MES系统：投料和产量数据\n- 计算节点：CPU 2核/内存4GB\n\n### 8.2 软件要求\n- MES系统接口版本>=3.0\n- SCADA数据接口\n- ERP成本模块对接（可选）\n\n### 8.3 数据要求\n- 标准BOM数据完整\n- 标准工时数据\n- 历史成本数据>=3个月`,
      config: "{\"currency\": \"CNY\", \"allocation_rule\": \"activity_based\"}",
      script: "def calculate_cost(energy, material, output):\n    return (energy * price + material) / output",
      scriptLang: "python"
    }
  },
  {
    skill_id: "inventory_turnover_opt_v2",
    name: "库存周转率优化建议",
    version: "2.0.1",
    domain: ["cost_management", "production_planning"],
    capability_tags: ["management", "inventory", "optimization"],
    input_schema: { current_stock: "object", sales_rate: "array" },
    output_schema: { recommended_stock_level: "object", dead_stock_alert: "array" },
    cost: 0.5,
    latency: 1200,
    accuracy_score: 0.91,
    dependencies: [],
    description: "分析呆滞物料风险，提供基于安全库存水位的采购与排产建议。",
    files: {
      readme: `# 库存周转率优化建议 (Inventory Turnover Optimization)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n库存管理是制造业资金占用的主要环节。本技能通过分析库存周转情况，识别呆滞风险，优化库存水位，实现：\n- 库存资金占用降低15-25%\n- 呆滞物料减少30-40%\n- 库存周转天数缩短20%\n- 缺货风险控制在5%以内\n\n### 1.2 技术原理\n融合经典库存理论与机器学习：\n- **ABC分类法**：按价值对物料进行分类管理\n- **安全库存计算**：基于需求波动和供应提前期\n- **EOQ经济订货量**：优化订货批量和频率\n- **呆滞风险预测**：基于物料流动性和需求趋势\n- **动态补货策略**：自适应调整补货点和补货量\n\n### 1.3 应用场景\n- 原材料库存优化（正极/负极材料）\n- 在制品库存管理\n- 备品备件库存控制\n- 成品库存水位优化\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| current_stock | object | 是 | - | 当前库存数据，包含各物料库存量 |\n| sales_rate | array | 是 | - | 历史销售/消耗速率 |\n| lead_time | number | 否 | >=0 | 供应提前期，单位：天 |\n| service_level | number | 否 | 0.9-0.99 | 目标服务水平 |\n| holding_cost_rate | number | 否 | 0.1-0.3 | 库存持有成本率 |\n| ordering_cost | number | 否 | >0 | 单次订货成本 |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| recommended_stock_level | object | 推荐库存水位 | 件/吨 |\n| dead_stock_alert | array | 呆滞物料预警列表 | - |\n| safety_stock | object | 各物料安全库存 | 件/吨 |\n| reorder_point | object | 再订货点 | 件/吨 |\n| order_quantity | object | 建议订货量 | 件/吨 |\n| turnover_days | number | 预计周转天数 | 天 |\n| inventory_value | number | 库存金额 | 元 |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 库存优化准确率 | >=91% | 建议水位与实际需求匹配度 |\n| 呆滞识别准确率 | >=85% | 正确识别呆滞物料比例 |\n| 缺货率控制 | <=5% | 优化后缺货发生比例 |\n| 计算响应时间 | <=1200ms | 单次优化延迟 |\n| 系统可用性 | >=99.5% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.50 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 Python调用示例\n\`\`\`python\nimport requests\n\nresponse = requests.post(\n    "https://api.battery-ai.com/skills/inventory_turnover_opt_v2",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={\n        "current_stock": {\n            "NCM811": 500,\n            "Graphite": 800,\n            "Electrolyte": 200\n        },\n        "sales_rate": [120, 135, 128, 142, 138],\n        "lead_time": 14,\n        "service_level": 0.95,\n        "holding_cost_rate": 0.15,\n        "ordering_cost": 500\n    }\n)\n\nresult = response.json()\nprint(f"推荐库存水位: {result['recommended_stock_level']}")\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "recommended_stock_level": {\n    "NCM811": 450,\n    "Graphite": 720,\n    "Electrolyte": 180\n  },\n  "dead_stock_alert": [\n    {\"material\": \"LCO-001\", \"days_in_stock\": 95, \"value\": 85000}\n  ],\n  "safety_stock": {\n    "NCM811": 120,\n    "Graphite": 150,\n    "Electrolyte": 50\n  },\n  "reorder_point": {\n    "NCM811": 280,\n    "Graphite": 350,\n    "Electrolyte": 100\n  },\n  "turnover_days": 28,\n  "inventory_value": 12500000\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| INV_001 | 库存数据格式错误 | 检查current_stock对象结构 |\n| INV_002 | 销售数据不足 | 提供至少3个月历史数据 |\n| INV_003 | 提前期为负 | 确认lead_time参数为正数 |\n| INV_004 | 服务水平超出范围 | 调整至0.9-0.99范围内 |\n| INV_005 | 物料编码不存在 | 检查物料主数据完整性 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v2.0.1 | 2024-01 | 优化呆滞识别算法 |\n| v2.0.0 | 2023-10 | 新增动态补货策略 |\n| v1.5.0 | 2023-06 | 支持多仓库协同优化 |\n| v1.0.0 | 2023-03 | 初始版本，基础EOQ模型 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- ERP系统接口服务器\n- 计算节点：CPU 4核/内存8GB\n\n### 8.2 软件要求\n- ERP系统接口版本>=2.5\n- WMS系统数据对接\n\n### 8.3 数据要求\n- 物料主数据完整（编码、分类、成本）\n- 历史库存数据>=6个月\n- 历史消耗/销售数据>=6个月`,
      config: "{\"dead_stock_threshold_days\": 90}",
      script: "def optimize(stock, sales):\n    # EOQ Model logic\n    return recommendations",
      scriptLang: "python"
    }
  },
  {
    skill_id: "energy_consumption_audit_v1",
    name: "产线能耗异常审计",
    version: "1.0.0",
    domain: ["cost_management"],
    capability_tags: ["management", "energy", "audit"],
    input_schema: { meter_readings: "array", production_status: "string" },
    output_schema: { anomaly_score: "number", saving_potential: "string" },
    cost: 0.1,
    latency: 300,
    accuracy_score: 0.93,
    dependencies: [],
    description: "监控非生产时段的设备待机能耗，识别能源浪费点。",
    files: {
      readme: `## 产线能耗异常审计

### 1. 技能概述

#### 业务价值
本技能针对锂电池制造产线高能耗特点，构建全链路能耗监测与异常诊断体系。通过实时采集涂布机、辊压机、分切机、卷绕机、注液机等关键设备的能耗数据，结合生产计划与工艺参数，实现能耗异常的秒级识别与根因定位。预计可帮助年产10GWh的电池工厂降低能耗成本8-15%，年节约电费超2000万元。

#### 技术原理
采用三层异常检测架构：
- **L1设备层**：基于LSTM自编码器模型，对单设备功率曲线进行重构误差分析，识别设备级异常
- **L2工序层**：构建工序能耗基准库（涂布0.85kWh/kg、辊压0.32kWh/kg、分条0.18kWh/kg、卷绕0.25kWh/支、注液0.15kWh/支），通过统计过程控制（SPC）检测偏离
- **L3产线层**：融合多工序能耗数据，建立产线级能耗数字孪生模型，识别系统性异常

异常检测算法采用Isolation Forest与Prophet时序预测相结合，支持趋势异常、点异常、上下文异常三种模式识别。

#### 应用场景
- **夜班能耗审计**：自动识别夜班低负荷时段的高能耗异常，发现设备空转、待机功耗过高等问题
- **换型能耗分析**：对比不同产品型号（磷酸铁锂vs三元、方形vs圆柱）的能耗差异，优化换型策略
- **峰谷用电优化**：结合分时电价政策，识别可转移至谷时段的生产负荷，降低用电成本
- **设备能效对标**：建立同类型设备能耗基准，识别低效设备并触发维保工单

### 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| line_id | string | 是 | 长度8-20字符 | 产线唯一标识，格式：LINE-{工厂代码}-{产线编号}，如LINE-SZ01-CA01 |
| audit_scope | enum | 是 | device/process/line | 审计范围：device设备级、process工序级、line产线级 |
| time_range | object | 是 | - | 审计时间范围 |
| time_range.start_time | datetime | 是 | ISO 8601格式 | 审计开始时间，如2024-01-15T08:00:00Z |
| time_range.end_time | datetime | 是 | ISO 8601格式 | 审计结束时间，最大跨度720小时 |
| baseline_config | object | 否 | - | 能耗基准配置 |
| baseline_config.use_historical | boolean | 否 | true/false | 是否使用历史数据自动计算基准，默认true |
| baseline_config.custom_baseline | object | 否 | - | 自定义能耗基准值(kWh/unit) |
| alert_threshold | number | 否 | 0.05-0.50 | 异常判定阈值，默认0.15（偏离基准15%触发异常） |
| granularity | enum | 否 | 1min/5min/15min/1h | 数据聚合粒度，默认5min |
| device_filter | array | 否 | - | 指定审计设备列表，为空则审计全部 |
| device_filter[].device_id | string | 条件 | - | 设备编号，如COATER-001 |
| device_filter[].device_type | enum | 条件 | coater/roller/slitter/winder/electrolyte_filler | 设备类型 |

### 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| audit_id | string | 审计任务唯一标识 | - |
| total_consumption | number | 审计周期总能耗 | kWh |
| baseline_consumption | number | 基准能耗（按产量折算） | kWh |
| consumption_variance | number | 能耗偏差率 | % |
| anomaly_score | number | 综合异常评分(0-100) | - |
| anomaly_level | enum | 异常等级：normal/guarded/moderate/severe | - |
| findings | array | 审计发现列表 | - |
| findings[].finding_id | string | 发现项ID | - |
| findings[].level | enum | 严重等级：info/warning/critical | - |
| findings[].category | enum | 异常类别：idle_overload/inefficient_operation/schedule_mismatch/leakage | - |
| findings[].device_id | string | 关联设备ID | - |
| findings[].device_name | string | 设备名称 | - |
| findings[].location | string | 设备位置 | - |
| findings[].consumption_actual | number | 实际能耗 | kWh |
| findings[].consumption_baseline | number | 基准能耗 | kWh |
| findings[].deviation_rate | number | 偏离率 | % |
| findings[].occurrence_time | datetime | 异常发生时间 | ISO 8601 |
| findings[].duration_minutes | number | 异常持续时长 | 分钟 |
| findings[].estimated_loss | number | 预估损失金额 | 元 |
| findings[].root_cause | string | 根因分析 | - |
| findings[].recommendation | string | 优化建议 | - |
| device_stats | array | 设备能耗统计 | - |
| device_stats[].device_id | string | 设备ID | - |
| device_stats[].device_type | string | 设备类型 | - |
| device_stats[].total_consumption | number | 总能耗 | kWh |
| device_stats[].consumption_per_unit | number | 单耗 | kWh/kg或kWh/支 |
| device_stats[].efficiency_rating | enum | 能效评级：A/B/C/D | - |
| peak_valley_analysis | object | 峰谷用电分析 | - |
| peak_valley_analysis.peak_ratio | number | 峰时段用电占比 | % |
| peak_valley_analysis.valley_ratio | number | 谷时段用电占比 | % |
| peak_valley_analysis.optimization_potential | number | 优化潜力（可转移电量） | kWh |
| peak_valley_analysis.estimated_savings | number | 预估节约金额 | 元/月 |
| report_url | string | 详细报告下载链接 | URL |
| generated_at | datetime | 报告生成时间 | ISO 8601 |

### 4. 性能指标

| 指标项 | 数值 | 说明 |
|--------|------|------|
| 异常检测准确率 | >=92% | 基于历史标注数据的F1-Score |
| 根因定位准确率 | >=85% | 定位到具体设备/工序的准确率 |
| 单次审计延迟 | <30秒 | 24小时数据量的处理时间 |
| 数据吞吐量 | 10000点/秒 | 支持的高频数据采集速率 |
| 并发审计能力 | 50条产线 | 同时审计的最大产线数 |
| API可用性 | 99.9% | 月度服务可用性SLA |
| 数据保留期 | 3年 | 原始能耗数据存储时长 |
| 单次调用成本 | 0.8元/万点 | 含计算与存储费用 |

### 5. 使用示例

\`\`\`typescript
// 示例：对涂布线CA01进行夜班能耗审计
const auditRequest = {
  line_id: 'LINE-SZ01-CA01',
  audit_scope: 'line',
  time_range: {
    start_time: '2024-01-15T00:00:00Z',
    end_time: '2024-01-15T08:00:00Z'
  },
  baseline_config: {
    use_historical: true,
    lookback_days: 30
  },
  alert_threshold: 0.12,
  granularity: '5min',
  device_filter: [
    { device_id: 'COATER-001', device_type: 'coater' },
    { device_id: 'COATER-002', device_type: 'coater' },
    { device_id: 'ROLLER-001', device_type: 'roller' }
  ]
};

// 调用技能
const result = await skillClient.invoke('energy_consumption_audit_v1', auditRequest);

// 处理结果
if (result.anomaly_level !== 'normal') {
  console.warn(\`产线能耗异常，异常评分：\${result.anomaly_score}\`);

  // 遍历发现项
  result.findings.forEach(finding => {
    if (finding.level === 'critical') {
      // 触发告警工单
      await workOrderSystem.create({
        type: 'ENERGY_ANOMALY',
        priority: 'HIGH',
        device_id: finding.device_id,
        description: finding.root_cause,
        estimated_loss: finding.estimated_loss
      });
    }
  });

  // 峰谷优化建议
  if (result.peak_valley_analysis.optimization_potential > 1000) {
    console.log(\`存在\${result.peak_valley_analysis.optimization_potential}kWh可转移至谷时段，月节约\${result.peak_valley_analysis.estimated_savings}元\`);
  }
}
\`\`\`

### 6. 故障处理

| 错误码 | 错误信息 | 可能原因 | 处理建议 |
|--------|----------|----------|----------|
| EEA001 | 产线ID不存在 | line_id格式错误或产线未注册 | 检查line_id格式，使用/line API查询有效产线列表 |
| EEA002 | 时间范围无效 | 时间跨度超过720小时或结束时间早于开始时间 | 调整time_range参数，单次审计不超过30天 |
| EEA003 | 设备过滤器错误 | device_filter中包含无效设备ID | 使用/device API查询产线下有效设备列表 |
| EEA004 | 能耗数据缺失 | 审计时段内无有效能耗数据 | 检查设备数据采集状态，确认电表通信正常 |
| EEA005 | 基准数据不足 | 历史数据不足无法计算基准 | 等待积累至少7天历史数据，或使用custom_baseline |
| EEA006 | 计算资源不足 | 审计数据量过大或并发过高 | 缩小time_range或granularity，错峰调用 |
| EEA007 | 设备类型不匹配 | device_filter中device_type与实际不符 | 核对设备类型枚举值，参考设备资产台账 |
| EEA008 | 告警阈值超限 | alert_threshold超出0.05-0.50范围 | 调整alert_threshold至有效范围 |
| EEA009 | 权限不足 | 当前用户无该产线审计权限 | 联系系统管理员申请产线数据访问权限 |
| EEA010 | 外部系统超时 | 电表数据采集系统响应超时 | 检查电表通信状态，稍后重试 |

### 7. 版本历史

| 版本 | 发布日期 | 变更内容 | 兼容性 |
|------|----------|----------|--------|
| v1.0.0 | 2024-01-15 | 初始版本，支持设备级/工序级/产线级三级审计 | - |
| v1.0.0-beta.2 | 2024-01-08 | 新增峰谷用电分析模块，优化根因定位算法 | 向下兼容 |
| v1.0.0-beta.1 | 2023-12-20 | 基础异常检测功能，支持5种设备类型 | 向下兼容 |

### 8. 依赖与前置条件

#### 硬件要求
- **电表设备**：产线关键设备需安装三相智能电表（精度等级0.5S级，支持RS485/Modbus通信）
- **采集网关**：每50台设备配置1台边缘采集网关（ARM Cortex-A72，4GB RAM，64GB存储）
- **网络带宽**：每产线上行带宽>=10Mbps，延迟<100ms

#### 软件要求
- **数据采集系统**：已部署SCADA或能源管理系统，支持MQTT/OPC UA协议
- **数据存储**：时序数据库（InfluxDB/TDengine）已配置，保留策略>=3年
- **时钟同步**：所有设备NTP同步，时间偏差<1秒

#### 数据要求
- **数据频率**：能耗数据采集频率>=1次/分钟
- **数据质量**：缺失率<5%，异常值需标记
- **历史数据**：至少7天历史数据用于基准计算
- **设备台账**：设备资产信息已录入系统，包含设备类型、额定功率、所属产线

#### 权限要求
- 用户需具备"产线能耗审计"操作权限
- 需配置电表数据读取权限
- 如需生成工单，需集成工单系统API权限`,
      config: "{\"baseline_kwh\": 50}",
      script: "if status == 'idle' and power > 10: return 'anomaly'",
      scriptLang: "python"
    }
  },
  {
    skill_id: "quality_predict_v2",
    name: "电芯质量预测模型",
    version: "2.0.0",
    domain: ["quality_control", "production_sales_match"],
    capability_tags: ["quality", "prediction", "defect_detection", "ml"],
    input_schema: {
      process_parameters: "object",
      raw_material_specs: "object",
      equipment_status: "object",
      environmental_data: "object"
    },
    output_schema: {
      quality_score: "number",
      defect_probability: "number",
      risk_factors: "array",
      recommendations: "array"
    },
    cost: 0.6,
    latency: 800,
    accuracy_score: 0.93,
    dependencies: [],
    description: "基于工艺参数、原材料规格、设备状态和环境数据，预测电芯质量等级和缺陷概率，提前识别质量风险。",
    files: {
      readme: `# 电芯质量预测模型 (Cell Quality Prediction)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n电芯质量是电池企业的核心竞争力。本技能通过分析全流程工艺数据，在化成分容前预测电芯质量，实现：\n- 质量缺陷提前识别，降低后工序损耗\n- 不良品拦截率提升40%\n- 质量一致性提升15%\n- 减少返工和报废成本\n\n### 1.2 技术原理\n融合多源数据与集成学习：\n- **工艺参数挖掘**：涂布、辊压、卷绕等关键工序参数\n- **原材料追溯**：正极/负极/电解液批次质量关联\n- **设备状态融合**：关键设备健康度影响建模\n- **环境因子分析**：温湿度、洁净度对质量的影响\n- **XGBoost集成模型**：多特征融合预测\n\n### 1.3 应用场景\n- 化成分容前质量预筛\n- 工艺异常早期预警\n- 质量根因分析\n- 工艺参数优化建议\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| process_parameters | object | 是 | - | 工艺参数（涂布重量、辊压厚度等） |\n| raw_material_specs | object | 是 | - | 原材料规格和批次信息 |\n| equipment_status | object | 是 | - | 关键设备状态数据 |\n| environmental_data | object | 否 | - | 环境温湿度、洁净度 |\n| cell_id | string | 是 | - | 电芯唯一标识 |\n| production_time | string | 否 | - | 生产时间戳 |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| quality_score | number | 质量评分 | 0-100 |\n| defect_probability | number | 缺陷概率 | 0-1 |\n| risk_factors | array | 主要风险因素列表 | - |\n| recommendations | array | 改进建议 | - |\n| predicted_grade | string | 预测等级：A/B/C/D | - |\n| confidence | number | 预测置信度 | 0-1 |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 质量预测准确率 | >=93% | 与实际分容结果对比 |\n| 缺陷检出率 | >=90% | 不良品正确识别比例 |\n| 误报率 | <=8% | 良品误判比例 |\n| 预测响应时间 | <=800ms | 单次推理延迟 |\n| 系统可用性 | >=99.5% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.60 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 Python调用示例\n\`\`\`python\nimport requests\n\nresponse = requests.post(\n    "https://api.battery-ai.com/skills/quality_predict_v2",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={\n        "process_parameters": {\n            "coating_weight": 25.5,\n            "rolling_thickness": 180,\n            "winding_tension": 120\n        },\n        "raw_material_specs": {\n            "cathode_batch": "NCM-20240315",\n            "anode_batch": "GR-20240314",\n            "electrolyte_batch": "EL-001"\n        },\n        "equipment_status": {\n            "coater_health": 95,\n            "roller_health": 88\n        },\n        "cell_id": "CELL-20240315-001"\n    }\n)\n\nresult = response.json()\nif result['defect_probability'] > 0.3:\n    flag_for_inspection(result['cell_id'])\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "quality_score": 87.5,\n  "defect_probability": 0.08,\n  "risk_factors": [\n    {\"factor\": \"辊压厚度波动\", \"impact\": 0.15},\n    {\"factor\": \"卷绕张力偏高\", \"impact\": 0.12}\n  ],\n  "recommendations": [\n    "建议调整辊压压力设定值",\n    "检查卷绕张力控制参数"\n  ],\n  "predicted_grade": \"A\",\n  "confidence": 0.91\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| QUAL_001 | 工艺参数缺失 | 检查MES工艺数据完整性 |\n| QUAL_002 | 原材料批次不存在 | 核对批次号在ERP系统中 |\n| QUAL_003 | 设备状态数据异常 | 检查设备传感器状态 |\n| QUAL_004 | 预测置信度低 | 增加训练数据或检查特征分布 |\n| QUAL_005 | 环境数据超出范围 | 检查洁净室温湿度控制 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v2.0.0 | 2024-01 | 新增环境因子分析，准确率提升至93% |\n| v1.5.0 | 2023-09 | 优化特征工程，支持更多设备类型 |\n| v1.0.0 | 2023-06 | 初始版本，基础质量预测功能 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- MES系统数据接口\n- 计算节点：CPU 4核/内存8GB\n\n### 8.2 软件要求\n- MES系统版本>=3.0\n- ERP批次数据接口\n- 设备状态监测系统\n\n### 8.3 数据要求\n- 历史工艺数据>=6个月\n- 质量检验数据>=10000条\n- 包含各等级电芯的完整数据`,
      config: "{\"model_type\": \"xgboost\", \"threshold\": 0.85}",
      script: "def predict_quality(process, material, equipment, env):\n    features = extract_features(process, material, equipment, env)\n    score = model.predict_proba(features)[0]\n    risks = identify_risk_factors(features)\n    return {'quality_score': score * 100, 'defect_probability': 1 - score, 'risk_factors': risks}",
      scriptLang: "python"
    }
  },`,
  // ========== 产销匹配协同场景技能 ==========
  {
    skill_id: "demand_forecast_v3",
    name: "锂电需求智能预测",
    version: "3.2.0",
    domain: ["production_sales_match"],
    capability_tags: ["forecast", "sales", "ai_prediction"],
    input_schema: {
      historical_orders: "array",
      market_trends: "object",
      seasonality_factor: "number",
      customer_segments: "array"
    },
    output_schema: {
      predicted_demand: "array",
      confidence_interval: "object",
      trend_analysis: "string"
    },
    cost: 0.7,
    latency: 1500,
    accuracy_score: 0.92,
    dependencies: [],
    description: "基于历史订单、市场趋势和季节性因素，预测未来3-12个月的电芯需求（按产品型号、客户细分）。",
    files: {
      readme: `# 锂电需求智能预测 (Demand Forecast)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n准确的需求预测是产销协同的基础。本技能针对锂电行业特点，融合多源数据预测未来需求，实现：\n- 预测准确率提升至92%\n- 库存积压减少20-30%\n- 缺货风险降低35%\n- 支持S&OP决策优化\n\n### 1.2 技术原理\n融合时序分析与深度学习：\n- **Prophet时序分解**：分离趋势、季节、节假日效应\n- **LSTM深度网络**：捕捉长期依赖和非线性关系\n- **集成学习**：多模型融合提升预测稳定性\n- **外部变量融合**：锂价、新能源车销量等宏观指标\n- **客户细分建模**：区分储能和动力不同市场特性\n\n### 1.3 应用场景\n- 年度/季度销售计划制定\n- 产能规划决策支持\n- 原材料采购计划\n- 库存策略优化\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| historical_orders | array | 是 | - | 历史订单数据（至少12个月） |\n| market_trends | object | 否 | - | 市场趋势指标 |\n| seasonality_factor | number | 否 | 0-1 | 季节性因子权重 |\n| customer_segments | array | 否 | - | 客户细分列表 |\n| forecast_horizon | number | 否 | 1-52 | 预测周期，单位：周 |\n| product_models | array | 否 | - | 产品型号列表 |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| predicted_demand | array | 预测需求量序列 | MWh |\n| confidence_interval | object | 置信区间（上下界） | MWh |\n| trend_analysis | string | 趋势分析结论 | - |\n| seasonality_pattern | object | 季节性模式 | - |\n| forecast_accuracy | number | 历史预测准确率 | % |\n| key_drivers | array | 需求关键驱动因素 | - |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 预测准确率 | >=92% | MAPE（平均绝对百分比误差） |\n| 预测响应时间 | <=1500ms | 单次预测延迟 |\n| 预测周期 | 1-52周 | 支持周度滚动预测 |\n| 置信区间覆盖率 | >=90% | 实际值落在区间内比例 |\n| 系统可用性 | >=99.5% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.70 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 Python调用示例\n\`\`\`python\nimport requests\n\nresponse = requests.post(\n    "https://api.battery-ai.com/skills/demand_forecast_v3",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={\n        "historical_orders": [\n            {"date": "2023-01", "quantity": 150},\n            {"date": "2023-02", "quantity": 165},\n            ...\n        ],\n        "market_trends": {\n            "lithium_price_index": 125,\n            "ev_sales_growth": 0.35\n        },\n        "seasonality_factor": 0.8,\n        "customer_segments": ["EV", "ESS"],\n        "forecast_horizon": 12\n    }\n)\n\nresult = response.json()\nprint(f"未来12周预测: {result['predicted_demand']}")\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "predicted_demand": [180, 195, 210, 205, 220, 235, 240, 230, 245, 260, 255, 270],\n  "confidence_interval": {\n    "lower": [165, 178, 192, 187, 201, 215, 219, 210, 224, 238, 233, 247],\n    "upper": [195, 212, 228, 223, 239, 255, 261, 250, 266, 282, 277, 293]\n  },\n  "trend_analysis": "需求呈上升趋势，Q2进入旺季",\n  "seasonality_pattern": {"peak_months": [6,7,8], "trough_months": [1,2]},\n  "forecast_accuracy": 92.5,\n  "key_drivers": ["新能源车销量增长", "储能政策利好"]\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| FCST_001 | 历史数据不足 | 提供至少12个月历史订单数据 |\n| FCST_002 | 数据格式错误 | 检查historical_orders数组结构 |\n| FCST_003 | 预测周期超出范围 | 调整forecast_horizon至1-52周 |\n| FCST_004 | 市场数据缺失 | 补充market_trends或降低外部变量权重 |\n| FCST_005 | 模型需要重训练 | 联系管理员更新模型 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v3.2.0 | 2024-01 | 新增客户细分建模，准确率提升至92% |\n| v3.1.0 | 2023-10 | 优化LSTM网络结构 |\n| v3.0.0 | 2023-07 | 引入Prophet+LSTM集成 |\n| v2.0.0 | 2023-03 | 支持多产品型号预测 |\n| v1.0.0 | 2023-01 | 初始版本，基础时序预测 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- 计算节点：CPU 8核/内存16GB/GPU可选\n- 存储：历史数据>=100GB\n\n### 8.2 软件要求\n- CRM/ERP系统数据接口\n- 外部数据源接口（锂价、销量等）\n\n### 8.3 数据要求\n- 历史订单数据>=24个月\n- 包含完整的产品型号和客户信息\n- 数据质量：缺失率<5%`,
      config: "{\"horizon_weeks\": 52, \"confidence_level\": 0.95, \"models\": [\"prophet\", \"lstm\"]}",
      script: "def forecast_demand(historical, market, seasonality, segments):\n    # Prophet + LSTM Ensemble\n    baseline = prophet_predict(historical, seasonality)\n    adjustment = lstm_market_adjustment(market)\n    return merge_predictions(baseline, adjustment)",
      scriptLang: "python"
    }
  },
  {
    skill_id: "capacity_evaluation_v2",
    name: "多维度产能评估",
    version: "2.1.0",
    domain: ["production_sales_match"],
    capability_tags: ["capacity", "evaluation", "constraint_analysis"],
    input_schema: {
      equipment_status: "object",
      work_calendar: "object",
      product_mix: "array",
      bottleneck_processes: "array"
    },
    output_schema: {
      available_capacity: "object",
      utilization_forecast: "array",
      constraint_report: "object"
    },
    cost: 0.5,
    latency: 800,
    accuracy_score: 0.94,
    dependencies: [],
    description: "评估各工序（涂布、卷绕、化成等）的理论产能和可用产能，识别瓶颈工序。",
    files: {
      readme: `## 多维度产能评估

### 1. 技能概述

#### 业务价值
产能评估是锂电制造企业生产规划和资源配置的核心能力。本技能针对锂电池制造多工序串联特性，构建全链路产能评估体系，实现：
- 理论产能、可用产能、有效产能三级精准计算
- 瓶颈工序自动识别（涂布/卷绕/化成/分容等）
- 产能利用率实时监控与预测
- 支持接单评审、产能规划、投资决策等多场景

预计可帮助企业：
- 产能利用率提升8-12%
- 订单交付准时率提升至95%+
- 产能规划决策周期缩短50%
- 避免过度投资或产能不足风险

#### 技术原理
采用多维度产能建模方法：
- **理论产能模型**：基于设备铭牌参数（速度、节拍、容量）计算理论最大产出
- **可用产能模型**：扣除计划停机（保养、换型、检修）后的实际可用产能
- **有效产能模型**：考虑良品率、设备OEE、人员配置等因素的实际产出能力
- **瓶颈识别算法**：基于约束理论(TOC)，识别限制整体产出的关键工序
- **产能平衡分析**：分析各工序产能匹配度，识别产能失衡风险

锂电行业专用建模：
- 涂布工序：面密度控制对产能的影响
- 辊压工序：厚度精度与速度的权衡
- 卷绕工序：对齐度要求对节拍的影响
- 化成工序：充放电时长是主要瓶颈
- 分容工序：测试容量与产能的平衡

#### 应用场景
- **接单评审**：评估新订单交付可行性，识别产能缺口
- **产能规划**：支持扩产投资决策，优化产能配置
- **排产优化**：为智能排产提供产能约束输入
- **瓶颈改善**：识别产能瓶颈，指导改善方向
- **多工厂协同**：跨工厂产能调配与负载均衡

### 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| evaluation_scope | enum | 是 | line/process/equipment | 评估范围：产线级/工序级/设备级 |
| line_id | string | 条件 | - | 产线标识，scope=line/process时必填 |
| process_list | array | 否 | - | 指定评估工序列表，为空则评估全部 |
| process_list[].process_id | string | 条件 | - | 工序ID，如COATING-001 |
| process_list[].process_type | enum | 条件 | coating/rolling/slitting/winding/formation/grading | 工序类型 |
| time_range | object | 是 | - | 评估时间范围 |
| time_range.start_date | date | 是 | ISO 8601 | 开始日期，如2024-01-01 |
| time_range.end_date | date | 是 | ISO 8601 | 结束日期，最大跨度90天 |
| equipment_status | object | 否 | - | 设备状态数据 |
| equipment_status.oee | number | 否 | 0-1 | 设备综合效率，默认0.85 |
| equipment_status.availability | number | 否 | 0-1 | 时间稼动率，默认0.90 |
| equipment_status.performance | number | 否 | 0-1 | 性能稼动率，默认0.95 |
| equipment_status.quality | number | 否 | 0-1 | 良品率，默认0.98 |
| work_calendar | object | 否 | - | 工作日历配置 |
| work_calendar.work_hours_per_day | number | 否 | 0-24 | 日工作小时数，默认22 |
| work_calendar.work_days_per_week | number | 否 | 1-7 | 周工作天数，默认6 |
| work_calendar.shifts | number | 否 | 1-3 | 班次数量，默认2 |
| product_mix | array | 否 | - | 产品型号组合及占比 |
| product_mix[].product_id | string | 是 | - | 产品型号ID |
| product_mix[].ratio | number | 是 | 0-1 | 占比，总和为1 |
| bottleneck_processes | array | 否 | - | 已知瓶颈工序列表 |
| include_simulation | boolean | 否 | true/false | 是否包含产能仿真，默认false |

### 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| evaluation_id | string | 评估任务唯一标识 | - |
| theoretical_capacity | object | 理论产能 | - |
| theoretical_capacity.total | number | 总理论产能 | 支/天或kWh/天 |
| theoretical_capacity.by_process | array | 各工序理论产能 | - |
| available_capacity | object | 可用产能 | - |
| available_capacity.total | number | 总可用产能 | 支/天或kWh/天 |
| available_capacity.by_process | array | 各工序可用产能 | - |
| effective_capacity | object | 有效产能 | - |
| effective_capacity.total | number | 总有效产能 | 支/天或kWh/天 |
| effective_capacity.by_process | array | 各工序有效产能 | - |
| bottleneck_analysis | object | 瓶颈分析结果 | - |
| bottleneck_analysis.bottleneck_processes | array | 瓶颈工序列表 | - |
| bottleneck_analysis.constraint_factor | string | 约束因素 | - |
| bottleneck_analysis.capacity_loss | number | 产能损失 | % |
| utilization_forecast | array | 产能利用率预测 | - |
| utilization_forecast[].date | date | 日期 | ISO 8601 |
| utilization_forecast[].utilization_rate | number | 利用率 | % |
| utilization_forecast[].available_capacity | number | 可用产能 | 支/天 |
| constraint_report | object | 约束分析报告 | - |
| constraint_report.hard_constraints | array | 硬约束列表 | - |
| constraint_report.soft_constraints | array | 软约束列表 | - |
| constraint_report.violations | array | 约束违反项 | - |
| process_details | array | 工序详细信息 | - |
| process_details[].process_id | string | 工序ID | - |
| process_details[].process_name | string | 工序名称 | - |
| process_details[].process_type | string | 工序类型 | - |
| process_details[].theoretical_capacity | number | 理论产能 | 支/天 |
| process_details[].available_capacity | number | 可用产能 | 支/天 |
| process_details[].effective_capacity | number | 有效产能 | 支/天 |
| process_details[].utilization_rate | number | 利用率 | % |
| process_details[].oee | number | 设备综合效率 | - |
| process_details[].is_bottleneck | boolean | 是否瓶颈 | - |
| balance_analysis | object | 产能平衡分析 | - |
| balance_analysis.balance_rate | number | 线平衡率 | % |
| balance_analysis.imbalance_processes | array | 产能失衡工序 | - |
| improvement_opportunities | array | 改善机会列表 | - |
| improvement_opportunities[].opportunity_id | string | 机会ID | - |
| improvement_opportunities[].description | string | 改善描述 | - |
| improvement_opportunities[].potential_gain | number | 潜在产能提升 | % |
| improvement_opportunities[].investment_required | number | 所需投资 | 万元 |
| generated_at | datetime | 报告生成时间 | ISO 8601 |
| report_url | string | 详细报告下载链接 | URL |

### 4. 性能指标

| 指标项 | 数值 | 说明 |
|--------|------|------|
| 产能计算准确率 | >=94% | 与实际产出对比误差 |
| 瓶颈识别准确率 | >=90% | 与实际瓶颈一致率 |
| 单次评估延迟 | <800ms | 标准产线评估时间 |
| 支持产线规模 | 50条产线 | 单次评估最大产线数 |
| 支持工序数量 | 20个工序 | 单条产线最大工序数 |
| API可用性 | 99.5% | 月度服务可用性SLA |
| 数据保留期 | 2年 | 历史评估数据存储时长 |
| 单次调用成本 | 0.5元/产线 | 含计算与存储费用 |

### 5. 使用示例

\`\`\`typescript
// 示例：评估涂布线CA01的产能
const evaluationRequest = {
  evaluation_scope: 'line',
  line_id: 'LINE-SZ01-CA01',
  time_range: {
    start_date: '2024-01-01',
    end_date: '2024-01-31'
  },
  equipment_status: {
    oee: 0.87,
    availability: 0.92,
    performance: 0.96,
    quality: 0.985
  },
  work_calendar: {
    work_hours_per_day: 22,
    work_days_per_week: 6,
    shifts: 2
  },
  product_mix: [
    { product_id: 'NCM-100Ah', ratio: 0.6 },
    { product_id: 'LFP-280Ah', ratio: 0.4 }
  ],
  include_simulation: true
};

// 调用技能
const result = await skillClient.invoke('capacity_evaluation_v2', evaluationRequest);

// 处理结果
console.log(\`产线有效产能：\${result.effective_capacity.total} 支/天\`);
console.log(\`线平衡率：\${result.balance_analysis.balance_rate}%\`);

// 检查瓶颈
if (result.bottleneck_analysis.bottleneck_processes.length > 0) {
  console.warn('发现瓶颈工序：', result.bottleneck_analysis.bottleneck_processes);

  // 遍历改善机会
  result.improvement_opportunities.forEach(opp => {
    console.log(\`改善机会：\${opp.description}，潜在提升\${opp.potential_gain}%\`);
  });
}

// 产能利用率趋势
result.utilization_forecast.forEach(day => {
  if (day.utilization_rate > 95) {
    console.warn(\`\${day.date} 产能利用率过高(\${day.utilization_rate}%)，存在交付风险\`);
  }
});
\`\`\`

### 6. 故障处理

| 错误码 | 错误信息 | 可能原因 | 处理建议 |
|--------|----------|----------|----------|
| ECE001 | 产线ID不存在 | line_id格式错误或产线未注册 | 检查line_id格式，使用/line API查询有效产线列表 |
| ECE002 | 时间范围无效 | 时间跨度超过90天或结束日期早于开始日期 | 调整time_range参数，单次评估不超过90天 |
| ECE003 | 工序类型不支持 | process_list中包含未定义的工序类型 | 核对工序类型枚举值，参考工序主数据 |
| ECE004 | 设备状态数据异常 | OEE或稼动率参数超出0-1范围 | 检查equipment_status参数范围 |
| ECE005 | 产品组合比例错误 | product_mix中各产品占比之和不等于1 | 调整各产品ratio值，确保总和为1 |
| ECE006 | 工作日历配置错误 | work_hours_per_day超过24小时 | 调整工作小时数至合理范围 |
| ECE007 | 计算资源不足 | 评估数据量过大或并发过高 | 缩小time_range或减少process_list |
| ECE008 | 历史数据缺失 | 评估时段内无设备运行数据 | 检查MES/SCADA数据采集状态 |
| ECE009 | 权限不足 | 当前用户无该产线评估权限 | 联系系统管理员申请产线数据访问权限 |
| ECE010 | 仿真计算超时 | include_simulation=true时计算超时 | 关闭仿真或简化评估范围 |

### 7. 版本历史

| 版本 | 发布日期 | 变更内容 | 兼容性 |
|------|----------|----------|--------|
| v2.1.0 | 2024-01-15 | 新增产能仿真功能，优化瓶颈识别算法 | 向下兼容 |
| v2.0.0 | 2023-11-20 | 引入线平衡率分析，支持多产品组合评估 | 向下兼容 |
| v1.5.0 | 2023-08-10 | 新增改善机会识别功能 | 向下兼容 |
| v1.0.0 | 2023-05-01 | 初始版本，基础产能评估功能 | - |

### 8. 依赖与前置条件

#### 硬件要求
- **计算资源**：评估服务需4核8GB内存配置
- **存储空间**：历史评估数据存储>=500GB
- **网络带宽**：与MES/SCADA系统通信带宽>=100Mbps

#### 软件要求
- **MES系统**：工序、设备、产品主数据完整
- **SCADA系统**：设备运行数据采集，包含OEE相关指标
- **ERP系统**：产品BOM和工艺路线数据
- **数据接口**：REST API或消息队列对接

#### 数据要求
- **设备台账**：设备铭牌参数（速度、容量、功率）完整
- **工艺数据**：标准工时、换型时间、良品率基准
- **历史运行数据**：至少3个月设备运行数据用于OEE计算
- **工作日历**：工厂班次、节假日、保养计划

#### 权限要求
- 用户需具备"产能评估"操作权限
- 需配置产线数据读取权限
- 如需导出报告，需配置文件存储权限 |
      config: "{\"oee_target\": 0.85, \"quality_rate\": 0.98}",
      script: "def evaluate_capacity(equipment, calendar, mix, bottlenecks):\n    for process in ['coating', 'winding', 'formation']:\n        theoretical = equipment[process].speed * calendar.hours\n        available = theoretical * equipment[process].oee\n    return find_bottleneck(process_capacities)",
      scriptLang: "python"
    }
  },
  {
    skill_id: "smart_scheduling_v4",
    name: "智能排产引擎",
    version: "4.0.0",
    domain: ["production_sales_match"],
    capability_tags: ["scheduling", "optimization", "constraint_satisfaction"],
    input_schema: {
      demand_plan: "array",
      capacity_constraints: "object",
      material_availability: "object",
      priority_rules: "object"
    },
    output_schema: {
      production_schedule: "array",
      material_requirements: "array",
      bottleneck_warnings: "array"
    },
    cost: 0.8,
    latency: 3000,
    accuracy_score: 0.91,
    dependencies: ["demand_forecast_v3", "capacity_evaluation_v2"],
    description: "综合考虑需求、产能、物料齐套性，生成优化的主生产计划(MPS)和详细排程(APS)。",
    files: {
      readme: `# 智能排产引擎 (Smart Scheduling Engine)\n\n## 1. 技能概述\n\n### 1.1 业务价值\n排产是连接销售需求与生产执行的关键环节。本技能针对锂电行业特点，生成优化的生产计划，实现：\n- 订单交付率提升至95%+\n- 设备利用率提升10-15%\n- 在制品库存降低20%\n- 换型时间减少25%\n\n### 1.2 技术原理\n基于约束规划和启发式优化：\n- **约束传播(CP)**：处理物料齐套、设备互斥等硬约束\n- **启发式规则**：最小化换型时间、均衡化生产\n- **多目标优化**：平衡交付率、库存、成本\n- **动态重排程**：支持紧急插单和异常处理\n\n### 1.3 应用场景\n- 主生产计划(MPS)生成\n- 详细排程(APS)优化\n- 紧急插单影响评估\n- 产能瓶颈识别与缓解\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 范围 | 说明 |\n|--------|------|------|------|------|\n| demand_plan | array | 是 | - | 需求计划（产品、数量、交期） |\n| capacity_constraints | object | 是 | - | 产能约束（设备、班次、OEE） |\n| material_availability | object | 是 | - | 物料可用性（库存、在途） |\n| priority_rules | object | 否 | - | 优先级规则（VIP客户、交期） |\n| scheduling_horizon | number | 否 | 1-90 | 排程周期，单位：天 |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 | 单位 |\n|--------|------|------|------|\n| production_schedule | array | 生产计划明细 | - |\n| material_requirements | array | 物料需求计划 | - |\n| bottleneck_warnings | array | 瓶颈预警信息 | - |\n| schedule_feasibility | boolean | 计划可行性 | - |\n| delivery_achievement | number | 预计交付达成率 | % |\n| resource_utilization | object | 资源利用率 | % |\n\n## 4. 性能指标\n\n| 指标 | 数值 | 说明 |\n|------|------|------|\n| 排程优化率 | >=91% | 相比人工排程提升 |\n| 计算响应时间 | <=3000ms | 单次排程延迟 |\n| 交付达成率 | >=95% | 准时交付比例 |\n| 设备利用率 | >=85% | 关键设备平均利用率 |\n| 系统可用性 | >=99.5% | 年度运行时间占比 |\n| 单次调用成本 | ¥0.80 | 含计算与存储 |\n\n## 5. 使用示例\n\n### 5.1 Python调用示例\n\`\`\`python\nimport requests\n\nresponse = requests.post(\n    "https://api.battery-ai.com/skills/smart_scheduling_v4",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={\n        "demand_plan": [\n            {\"product\": \"NCM-100Ah\", \"quantity\": 1000, \"due_date\": \"2024-04-15\"},\n            {\"product\": \"LFP-280Ah\", \"quantity\": 500, \"due_date\": \"2024-04-20\"}\n        ],\n        "capacity_constraints": {\n            \"coating_line\": {\"capacity\": 800, \"oee\": 0.85},\n            \"formation\": {\"capacity\": 600, \"oee\": 0.90}\n        },\n        "material_availability": {\n            \"NCM811\": {\"on_hand\": 500, \"in_transit\": 300},\n            \"LFP\": {\"on_hand\": 400, \"in_transit\": 200}\n        },\n        "scheduling_horizon": 30\n    }\n)\n\nresult = response.json()\nprint(f"排程可行性: {result['schedule_feasibility']}")\n\`\`\`\n\n### 5.2 响应示例\n\`\`\`json\n{\n  "production_schedule": [\n    {\"product\": \"NCM-100Ah\", \"start\": \"2024-04-01\", \"end\": \"2024-04-10\", \"line\": \"A1\"},\n    {\"product\": \"LFP-280Ah\", \"start\": \"2024-04-11\", \"end\": \"2024-04-18\", \"line\": \"A2\"}\n  ],\n  "material_requirements": [\n    {\"material\": \"NCM811\", \"required\": 450, \"shortage\": 0},\n    {\"material\": \"LFP\", \"required\": 380, \"shortage\": 0}\n  ],\n  "bottleneck_warnings": [\n    {\"resource\": \"formation\", \"utilization\": 0.95, \"risk\": \"high\"}\n  ],\n  "schedule_feasibility": true,\n  "delivery_achievement": 96.5,\n  "resource_utilization": {\"coating\": 0.88, \"formation\": 0.92}\n}\n\`\`\`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| SCHED_001 | 需求数据格式错误 | 检查demand_plan数组结构 |\n| SCHED_002 | 产能约束冲突 | 调整capacity_constraints或需求 |\n| SCHED_003 | 物料齐套性不足 | 补充material_availability数据 |\n| SCHED_004 | 排程无解 | 放宽约束条件或增加产能 |\n| SCHED_005 | 计算超时 | 减少scheduling_horizon或简化约束 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更说明 |\n|------|------|----------|\n| v4.0.0 | 2024-01 | 新增动态重排程功能 |\n| v3.5.0 | 2023-10 | 优化约束传播算法 |\n| v3.0.0 | 2023-07 | 支持多目标优化 |\n| v2.0.0 | 2023-03 | 引入OR-Tools求解器 |\n| v1.0.0 | 2023-01 | 初始版本，基础排程功能 |\n\n## 8. 依赖与前置条件\n\n### 8.1 硬件要求\n- 计算节点：CPU 8核/内存16GB\n- 存储：排程数据>=50GB\n\n### 8.2 软件要求\n- OR-Tools求解器>=9.0\n- MES/ERP系统接口\n- APS系统对接\n\n### 8.3 数据要求\n- 标准工时数据完整\n- 设备产能数据>=6个月\n- 换型时间矩阵`,
      config: "{\"solver\": \"ortools\", \"time_bucket\": \"hour\", \"lookahead_days\": 30}",
      script: "from ortools.constraint_solver import routing_enums_pb2\n\ndef optimize_schedule(demand, capacity, material, rules):\n    # 构建约束满足问题\n    model = create_cp_model(demand, capacity, material)\n    solver = cp_model.CpSolver()\n    return solver.Solve(model)",
      scriptLang: "python"
    }
  },
  {
    skill_id: "inventory_optimization_v3",
    name: "全链路库存优化",
    version: "3.1.0",
    domain: ["production_sales_match"],
    capability_tags: ["inventory", "optimization", "working_capital"],
    input_schema: {
      current_inventory: "object",
      demand_forecast: "array",
      supply_leadtime: "object",
      cost_parameters: "object"
    },
    output_schema: {
      optimal_stock_levels: "object",
      reorder_points: "object",
      inventory_value_forecast: "array"
    },
    cost: 0.6,
    latency: 1200,
    accuracy_score: 0.89,
    dependencies: ["demand_forecast_v3"],
    description: "优化原材料（正极、负极、电解液）、在制品（WIP）和成品库存水平，平衡服务水平和资金占用。",
    files: {
      readme: "# Inventory Optimization\n\n## 概述\n锂电行业全链路库存优化，重点管理高价值正极材料（LFP/NCM）。\n\n## 优化策略\n1. **原材料**: 基于价格趋势和MOQ优化采购批量\n2. **WIP**: 控制极片、电芯在制品数量，减少资金占用\n3. **成品**: 按客户优先级配置安全库存\n\n## 核心算法\n- **(R,Q)策略**: 连续盘点补货\n- **动态安全库存**: 根据需求波动性自适应调整\n\n## 业务价值\n在确保98%订单满足率的前提下，降低库存资金占用15-20%。",
      config: "{\"service_level\": 0.98, \"holding_cost_rate\": 0.15}",
      script: "def optimize_inventory(current, demand, leadtime, costs):\n    for sku in ['LFP_powder', 'NCM523', 'electrolyte', 'separator']:\n        safety_stock = calculate_safety_stock(demand[sku], leadtime[sku])\n        eoq = calculate_eoq(demand[sku], costs.ordering, costs.holding)\n    return build_inventory_policy(safety_stock, eoq)",
      scriptLang: "python"
    }
  },
  {
    skill_id: "supply_chain_collab_v2",
    name: "供应链协同平台",
    version: "2.3.0",
    domain: ["production_sales_match"],
    capability_tags: ["supply_chain", "collaboration", "supplier_management"],
    input_schema: {
      supplier_performance: "object",
      purchase_orders: "array",
      delivery_schedules: "object",
      quality_inspection: "object"
    },
    output_schema: {
      supplier_scorecards: "array",
      risk_alerts: "array",
      collaborative_forecast: "object"
    },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.93,
    dependencies: [],
    description: "管理与正极材料、电解液等关键供应商的协同，监控交付绩效，预警供应风险。",
    files: {
      readme: "# Supply Chain Collaboration\n\n## 概述\n锂电行业供应链协同平台，重点管理Tier1原材料供应商。\n\n## 功能模块\n1. **供应商绩效**: OTD（准时交付）、PPM（百万件不良率）自动计算\n2. **交付协同**: 共享预测、确认交期、预警偏差\n3. **质量协同**: 来料检验数据共享，推动供应商改进\n4. **VMI管理**: 供应商管理库存，自动触发补货\n\n## 关键指标\n- 正极材料OTD > 98%\n- 电解液PPM < 50\n- 预测准确率 > 85%",
      config: "{\"vmi_threshold_days\": 7, \"risk_alert_leadtime\": 3}",
      script: "def evaluate_suppliers(performance, orders, schedules, quality):\n    scorecards = {}\n    for supplier in ['catl_material', 'easpring', 'guotai']:\n        otd = calculate_otd(orders[supplier], schedules[supplier])\n        ppm = calculate_ppm(quality[supplier])\n        scorecards[supplier] = {'otd': otd, 'ppm': ppm, 'grade': grade_supplier(otd, ppm)}\n    return scorecards",
      scriptLang: "python"
    }
  },
  {
    skill_id: "order_fulfillment_tracking_v2",
    name: "订单全链路跟踪",
    version: "2.0.0",
    domain: ["production_sales_match"],
    capability_tags: ["order_management", "tracking", "visibility"],
    input_schema: {
      sales_orders: "array",
      production_status: "object",
      quality_inspection: "object",
      shipping_status: "object"
    },
    output_schema: {
      order_status_dashboard: "array",
      delivery_commitments: "array",
      delay_risk_alerts: "array"
    },
    cost: 0.3,
    latency: 400,
    accuracy_score: 0.96,
    dependencies: ["smart_scheduling_v4"],
    description: "实时跟踪订单从接单、排产、生产、质检到发货的全流程状态，预警交付风险。",
    files: {
      readme: "# Order Fulfillment Tracking\n\n## 概述\n锂电行业订单全链路可视化跟踪系统。\n\n## 跟踪节点\n1. **订单确认**: 评审交期可行性\n2. **物料齐套**: 追踪原材料到位状态\n3. **生产执行**: 各工序完工进度\n4. **质量放行**: 化成分容结果、出货检验\n5. **物流发运**: 车辆调度、在途跟踪\n\n## 预警机制\n- 黄色预警: 可能延迟1-3天\n- 红色预警: 可能延迟>3天\n自动触发产能调整或客户沟通流程",
      config: "{\"tracking_granularity\": \"process\", \"alert_threshold_days\": 3}",
      script: "def track_orders(orders, production, quality, shipping):\n    dashboard = []\n    for order in orders:\n        status = aggregate_status(order, production, quality, shipping)\n        risk = assess_delay_risk(order, status)\n        dashboard.append({'order_id': order.id, 'status': status, 'risk': risk})\n    return dashboard",
      scriptLang: "python"
    }
  },
  {
    skill_id: "logistics_optimization_v2",
    name: "物流调度优化",
    version: "2.1.0",
    domain: ["production_sales_match"],
    capability_tags: ["logistics", "route_optimization", "vehicle_scheduling"],
    input_schema: {
      delivery_orders: "array",
      vehicle_fleet: "object",
      route_constraints: "object",
      customer_time_windows: "object"
    },
    output_schema: {
      dispatch_plan: "array",
      route_details: "array",
      transportation_cost: "number"
    },
    cost: 0.5,
    latency: 900,
    accuracy_score: 0.90,
    dependencies: ["order_fulfillment_tracking_v2"],
    description: "优化成品电芯和Pack的配送路径和车辆调度，考虑客户时间窗、车辆容量和危险品运输限制。",
    files: {
      readme: "# Logistics Optimization\n\n## 概述\n锂电池成品物流配送优化系统，符合危险品(9类)运输规范。\n\n## 优化维度\n1. **路径优化**: VRPTW（带时间窗的车辆路径问题）\n2. **装载优化**: 考虑重量限制和堆叠约束\n3. **车辆调度**: 平衡自有车队和第三方物流\n4. **危险品合规**: 自动检查运输资质和包装要求\n\n## 约束条件\n- 9类危险品标识\n- 车辆GPS监控\n- 驾驶员危货资质\n- 温度监控（部分高镍产品）",
      config: "{\"max_route_duration\": 480, \"loading_efficiency_target\": 0.85, \"hazmat_class\": 9}",
      script: "from ortools.constraint_solver import routing_enums_pb2\n\ndef optimize_logistics(orders, fleet, constraints, time_windows):\n    # VRPTW求解\n    manager = pywrapcp.RoutingIndexManager(len(orders), fleet.vehicle_count, fleet.depot)\n    routing = pywrapcp.RoutingModel(manager)\n    # 添加距离和时间约束\n    return solve_vrptw(routing, manager, orders, time_windows)",
      scriptLang: "python"
    }
  },
  {
    skill_id: "production_sales_alert_v1",
    name: "产销平衡预警",
    version: "1.5.0",
    domain: ["production_sales_match"],
    capability_tags: ["alert", "s_and_op", "early_warning"],
    input_schema: {
      production_actual: "array",
      sales_actual: "array",
      inventory_levels: "object",
      market_changes: "object"
    },
    output_schema: {
      imbalance_alerts: "array",
      recommended_actions: "array",
      scenario_simulations: "array"
    },
    cost: 0.2,
    latency: 300,
    accuracy_score: 0.88,
    dependencies: ["demand_forecast_v3", "capacity_evaluation_v2"],
    description: "监控产销偏差，当需求超出产能或产能闲置时发出预警，并提供调整建议。",
    files: {
      readme: `## 产销平衡预警

### 1. 技能概述

#### 业务价值
产销平衡是锂电制造企业运营管理的核心目标。本技能通过实时监控生产、销售、库存数据，自动识别产销失衡风险，支撑S&OP（销售与运营规划）决策，实现：
- 产能利用率稳定在85-95%健康区间
- 库存周转天数控制在行业领先水平（动力电池<15天，储能电池<30天）
- 订单交付准时率提升至95%+
- 避免产能不足导致的订单流失或产能闲置导致的资源浪费

预计可帮助企业：
- 库存资金占用降低15-25%
- 紧急插单减少40%
- 客户满意度提升10-15个百分点
- S&OP会议决策效率提升50%

#### 技术原理
采用多维度平衡监控算法：
- **产能-需求匹配模型**：对比预测需求与可用产能，识别供需缺口
- **库存水位监控**：基于安全库存模型，监控原材料、在制品、成品库存
- **动态预警机制**：根据偏差程度分级预警（正常/关注/警告/紧急）
- **情景模拟推演**：模拟不同调整策略的效果，辅助决策
- **趋势预测分析**：基于历史数据预测未来产销走势

预警指标体系：
- 产能利用率偏差（目标区间：85-95%）
- 库存周转天数偏差（按产品类型设定目标）
- 订单满足率（目标：>95%）
- 交付准时率（目标：>98%）

#### 应用场景
- **S&OP会议支撑**：提供产销平衡数据，支持月度/季度规划决策
- **日常运营监控**：实时监控产销状态，及时发现异常
- **紧急插单评估**：快速评估插单对产销平衡的影响
- **产能调配决策**：动力/储能产能切换的时机判断
- **促销策略制定**：基于产能闲置情况制定促销方案

### 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| alert_scope | enum | 是 | factory/line/product | 预警范围：工厂级/产线级/产品级 |
| factory_id | string | 条件 | - | 工厂标识，scope=factory时必填 |
| line_id | string | 条件 | - | 产线标识，scope=line时必填 |
| product_id | string | 条件 | - | 产品型号，scope=product时必填 |
| time_range | object | 是 | - | 监控时间范围 |
| time_range.start_date | date | 是 | ISO 8601 | 开始日期 |
| time_range.end_date | date | 是 | ISO 8601 | 结束日期，最大跨度90天 |
| production_actual | array | 是 | - | 实际生产数据序列 |
| production_actual[].date | date | 是 | - | 日期 |
| production_actual[].quantity | number | 是 | >=0 | 产量（支或kWh） |
| sales_actual | array | 是 | - | 实际销售/出货数据序列 |
| sales_actual[].date | date | 是 | - | 日期 |
| sales_actual[].quantity | number | 是 | >=0 | 销量（支或kWh） |
| inventory_levels | object | 是 | - | 库存水位数据 |
| inventory_levels.raw_material | number | 否 | >=0 | 原材料库存（万元） |
| inventory_levels.wip | number | 否 | >=0 | 在制品库存（万元） |
| inventory_levels.finished_goods | number | 否 | >=0 | 成品库存（万元） |
| inventory_levels.days_of_supply | number | 否 | >=0 | 库存可供应天数 |
| market_changes | object | 否 | - | 市场变化信息 |
| market_changes.demand_surge | boolean | 否 | true/false | 是否需求激增 |
| market_changes.competitor_actions | array | 否 | - | 竞争对手动态 |
| alert_thresholds | object | 否 | - | 自定义预警阈值 |
| alert_thresholds.utilization_low | number | 否 | 0-1 | 产能利用率下限，默认0.70 |
| alert_thresholds.utilization_high | number | 否 | 0-1 | 产能利用率上限，默认0.95 |
| alert_thresholds.inventory_days_max | number | 否 | >0 | 库存天数上限，默认30 |
| alert_thresholds.inventory_days_min | number | 否 | >0 | 库存天数下限，默认7 |

### 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| alert_id | string | 预警任务唯一标识 | - |
| balance_status | enum | 平衡状态：balanced/attention/warning/critical | - |
| imbalance_alerts | array | 失衡预警列表 | - |
| imbalance_alerts[].alert_type | enum | 预警类型：shortage/excess/inventory_high/inventory_low | - |
| imbalance_alerts[].severity | enum | 严重等级：low/medium/high/critical | - |
| imbalance_alerts[].metric | string | 失衡指标 | - |
| imbalance_alerts[].current_value | number | 当前值 | - |
| imbalance_alerts[].target_value | number | 目标值 | - |
| imbalance_alerts[].deviation_rate | number | 偏离率 | % |
| imbalance_alerts[].description | string | 预警描述 | - |
| imbalance_alerts[].affected_orders | array | 受影响订单列表 | - |
| production_summary | object | 生产汇总 | - |
| production_summary.total_production | number | 总生产量 | 支或kWh |
| production_summary.avg_daily_production | number | 日均产量 | 支/天或kWh/天 |
| production_summary.capacity_utilization | number | 产能利用率 | % |
| sales_summary | object | 销售汇总 | - |
| sales_summary.total_sales | number | 总销售量 | 支或kWh |
| sales_summary.avg_daily_sales | number | 日均销量 | 支/天或kWh/天 |
| sales_summary.order_fulfillment_rate | number | 订单满足率 | % |
| inventory_summary | object | 库存汇总 | - |
| inventory_summary.total_inventory_value | number | 库存总金额 | 万元 |
| inventory_summary.inventory_turnover_days | number | 库存周转天数 | 天 |
| inventory_summary.safety_stock_status | enum | 安全库存状态 | - |
| gap_analysis | object | 缺口分析 | - |
| gap_analysis.production_sales_gap | number | 产销缺口 | 支或kWh |
| gap_analysis.demand_supply_gap | number | 供需缺口 | 支或kWh |
| gap_analysis.trend_direction | enum | 趋势方向：improving/stable/worsening | - |
| recommended_actions | array | 建议措施列表 | - |
| recommended_actions[].action_id | string | 措施ID | - |
| recommended_actions[].action_type | enum | 措施类型：capacity_adjustment/inventory_adjustment/promotion/outsourcing | - |
| recommended_actions[].description | string | 措施描述 | - |
| recommended_actions[].expected_impact | number | 预期效果 | % |
| recommended_actions[].implementation_cost | number | 实施成本 | 万元 |
| recommended_actions[].timeline | string | 实施周期 | - |
| scenario_simulations | array | 情景模拟结果 | - |
| scenario_simulations[].scenario_name | string | 情景名称 | - |
| scenario_simulations[].assumptions | object | 假设条件 | - |
| scenario_simulations[].projected_balance | object | 预测平衡状态 | - |
| generated_at | datetime | 报告生成时间 | ISO 8601 |
| next_check_time | datetime | 建议下次检查时间 | ISO 8601 |

### 4. 性能指标

| 指标项 | 数值 | 说明 |
|--------|------|------|
| 预警准确率 | >=88% | 预警与实际发生偏差的比例 |
| 预警提前期 | >=7天 | 从预警到失衡发生的平均提前时间 |
| 误报率 | <=10% | 错误预警占总预警的比例 |
| 单次监控延迟 | <300ms | 标准数据量的处理时间 |
| 数据刷新频率 | 1小时 | 监控数据更新周期 |
| API可用性 | 99.5% | 月度服务可用性SLA |
| 历史数据保留 | 2年 | 监控历史数据存储时长 |
| 单次调用成本 | 0.2元/次 | 含计算与存储费用 |

### 5. 使用示例

\`\`\`typescript
// 示例：监控工厂SZ01的产销平衡状态
const alertRequest = {
  alert_scope: 'factory',
  factory_id: 'FACTORY-SZ01',
  time_range: {
    start_date: '2024-01-01',
    end_date: '2024-01-31'
  },
  production_actual: [
    { date: '2024-01-01', quantity: 5000 },
    { date: '2024-01-02', quantity: 5200 },
    // ... 更多日期数据
  ],
  sales_actual: [
    { date: '2024-01-01', quantity: 4800 },
    { date: '2024-01-02', quantity: 5100 },
    // ... 更多日期数据
  ],
  inventory_levels: {
    raw_material: 8500,
    wip: 12000,
    finished_goods: 15000,
    days_of_supply: 12
  },
  market_changes: {
    demand_surge: false,
    competitor_actions: ['降价促销']
  },
  alert_thresholds: {
    utilization_low: 0.75,
    utilization_high: 0.93,
    inventory_days_max: 25,
    inventory_days_min: 5
  }
};

// 调用技能
const result = await skillClient.invoke('production_sales_alert_v1', alertRequest);

// 处理结果
if (result.balance_status !== 'balanced') {
  console.warn(\`产销平衡状态：\${result.balance_status}\`);

  // 遍历预警
  result.imbalance_alerts.forEach(alert => {
    if (alert.severity === 'critical') {
      // 发送紧急通知
      await notificationService.send({
        level: 'URGENT',
        recipients: ['production_manager', 'sales_manager'],
        message: alert.description
      });
    }
  });

  // 执行建议措施
  result.recommended_actions.forEach(action => {
    if (action.expected_impact > 10) {
      console.log(\`建议执行：\${action.description}，预期改善\${action.expected_impact}%\`);
    }
  });
}
\`\`\`

### 6. 故障处理

| 错误码 | 错误信息 | 可能原因 | 处理建议 |
|--------|----------|----------|----------|
| EPS001 | 工厂/产线/产品ID不存在 | 标识符错误或对象未注册 | 检查ID格式，使用对应API查询有效列表 |
| EPS002 | 时间范围无效 | 时间跨度超过90天或结束日期早于开始日期 | 调整time_range参数 |
| EPS003 | 生产数据格式错误 | production_actual数组结构不正确 | 检查数组元素是否包含date和quantity字段 |
| EPS004 | 销售数据缺失 | sales_actual为空或数据不足 | 提供至少7天的销售数据 |
| EPS005 | 库存数据异常 | 库存值为负数或格式错误 | 检查inventory_levels参数 |
| EPS006 | 阈值配置冲突 | utilization_low >= utilization_high | 调整阈值，确保下限小于上限 |
| EPS007 | 历史数据不足 | 无法计算趋势和季节性 | 提供至少30天的历史数据 |
| EPS008 | 外部系统超时 | ERP/MES系统数据获取超时 | 检查系统连接状态，稍后重试 |
| EPS009 | 权限不足 | 当前用户无该范围监控权限 | 联系系统管理员申请数据访问权限 |
| EPS010 | 计算资源不足 | 并发请求过多 | 错峰调用或减少监控范围 |

### 7. 版本历史

| 版本 | 发布日期 | 变更内容 | 兼容性 |
|------|----------|----------|--------|
| v1.5.0 | 2024-01-15 | 新增情景模拟功能，优化预警算法 | 向下兼容 |
| v1.4.0 | 2023-11-20 | 支持产线级和产品级监控 | 向下兼容 |
| v1.3.0 | 2023-09-10 | 新增库存周转天数监控 | 向下兼容 |
| v1.2.0 | 2023-07-01 | 引入动态阈值调整 | 向下兼容 |
| v1.1.0 | 2023-05-15 | 新增建议措施推荐 | 向下兼容 |
| v1.0.0 | 2023-03-01 | 初始版本，基础产销平衡监控 | - |

### 8. 依赖与前置条件

#### 硬件要求
- **计算资源**：预警服务需2核4GB内存配置
- **存储空间**：历史监控数据存储>=200GB
- **网络带宽**：与ERP/MES系统通信带宽>=50Mbps

#### 软件要求
- **ERP系统**：销售订单、库存数据实时同步
- **MES系统**：生产数据、设备状态实时采集
- **数据仓库**：整合多源数据，支持OLAP分析
- **消息队列**：支持预警消息的实时推送

#### 数据要求
- **生产数据**：每日产量数据，延迟<2小时
- **销售数据**：每日出货量数据，延迟<2小时
- **库存数据**：实时库存快照，更新频率>=1次/小时
- **历史数据**：至少90天历史数据用于趋势分析

#### 权限要求
- 用户需具备"产销平衡监控"操作权限
- 需配置ERP销售数据读取权限
- 需配置MES生产数据读取权限
- 如需发送预警通知，需配置消息推送权限 |
      config: "{\"utilization_threshold_low\": 0.70, \"utilization_threshold_high\": 0.95}",
      script: "def check_balance(production, sales, inventory, market):\n    alerts = []\n    gap = sum(sales) - sum(production)\n    if gap > 0:\n        alerts.append({'type': 'shortage', 'severity': 'high', 'gap': gap})\n    elif utilization < 0.7:\n        alerts.append({'type': 'excess', 'severity': 'medium', 'recommendation': 'promotion'})\n    return alerts",
      scriptLang: "python"
    }
  },
  // ========== 新项目落地推演分析场景技能 ==========
  {
    skill_id: "npv_calculator_v1",
    name: "投资项目NPV/IRR计算器",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["finance", "investment", "npv", "irr"],
    input_schema: {
      initial_investment: "number",
      cash_flows: "array",
      discount_rate: "number",
      project_lifecycle: "number"
    },
    output_schema: {
      npv: "number",
      irr: "number",
      payback_period: "number",
      profitability_index: "number"
    },
    cost: 0.3,
    latency: 500,
    accuracy_score: 0.96,
    dependencies: [],
    description: "计算新生产线投资项目的净现值(NPV)、内部收益率(IRR)、投资回收期等关键财务指标。",
    files: {
      readme: `## 投资项目NPV/IRR计算器

### 1. 技能概述

#### 业务价值
投资决策是锂电制造企业战略发展的关键环节。本技能基于现金流折现法(DCF)，提供专业的财务评估指标计算，支撑投资决策的科学性和准确性，实现：
- 投资项目财务可行性量化评估
- 多方案经济性对比分析
- 投资风险与收益的平衡评估
- 投资回报周期精准预测

预计可帮助企业：
- 投资决策准确率提升20-30%
- 避免低效投资导致的资金浪费
- 优化资本配置，提升整体ROI
- 满足上市公司/国企投资决策合规要求

#### 技术原理
采用经典财务评估模型：
- **净现值(NPV)模型**：将未来现金流按折现率折算为现值，减去初始投资
  - NPV = ∑(CF_t / (1+r)^t) - Initial_Investment
  - CF_t：第t期现金流
  - r：折现率（反映资金时间价值和项目风险）
  - NPV > 0表示项目可行
- **内部收益率(IRR)模型**：使NPV=0的折现率，反映项目实际收益率
  - IRR > 要求回报率时项目可行
- **投资回收期模型**：累计现金流转正所需时间
  - 静态回收期：不考虑资金时间价值
  - 动态回收期：考虑折现后的回收期
- **盈利指数(PI)模型**：现值现金流与初始投资之比
  - PI = PV(未来现金流) / Initial_Investment
  - PI > 1表示项目可行

锂电行业专用考虑：
- 产能爬坡期现金流（良率从60%提升至98%）
- 设备折旧年限（锂电设备通常5-7年）
- 技术迭代风险（固态电池等新技术影响）
- 政策补贴变化（新能源汽车补贴退坡）

#### 应用场景
- **新产线投资决策**：评估新建产线的财务可行性
- **扩建vs新建比选**：对比不同扩产方案的经济性
- **选址方案评估**：不同地区投资方案的经济性对比
- **技术改造项目**：自动化升级、节能改造等项目的ROI评估
- **并购项目评估**：收购其他电池厂或材料厂的财务分析

### 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| project_name | string | 是 | 长度1-100字符 | 项目名称，用于报告标识 |
| initial_investment | number | 是 | >0 | 初始投资额，单位：万元 |
| cash_flows | array | 是 | - | 各期现金流预测 |
| cash_flows[].period | number | 是 | >=1 | 期数（年或季度） |
| cash_flows[].amount | number | 是 | - | 现金流金额（流入为正，流出为负），单位：万元 |
| cash_flows[].description | string | 否 | - | 现金流说明 |
| discount_rate | number | 是 | 0-1 | 折现率，通常取WACC或要求回报率，如0.10表示10% |
| project_lifecycle | number | 是 | >=1 | 项目生命周期，单位：年 |
| terminal_value | number | 否 | >=0 | 终值（项目期末资产残值或永续价值），单位：万元 |
| inflation_rate | number | 否 | 0-0.2 | 通货膨胀率，默认0.03 |
| tax_rate | number | 否 | 0-0.5 | 所得税率，默认0.25 |
| depreciation_method | enum | 否 | straight_line/double_declining/units_of_production | 折旧方法，默认straight_line |
| depreciation_years | number | 否 | >=1 | 折旧年限，默认7年 |
| working_capital | number | 否 | >=0 | 营运资金投入，单位：万元 |
| salvage_value | number | 否 | >=0 | 残值，单位：万元 |
| risk_adjustment | object | 否 | - | 风险调整参数 |
| risk_adjustment.country_risk | number | 否 | 0-0.1 | 国家风险溢价 |
| risk_adjustment.industry_risk | number | 否 | 0-0.1 | 行业风险溢价 |
| risk_adjustment.project_risk | number | 否 | 0-0.1 | 项目特定风险溢价 |

### 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| calculation_id | string | 计算任务唯一标识 | - |
| project_name | string | 项目名称 | - |
| npv | number | 净现值 | 万元 |
| npv_status | enum | NPV评估结果：feasible/marginal/infeasible | - |
| irr | number | 内部收益率 | % |
| irr_status | enum | IRR评估结果：feasible/marginal/infeasible | - |
| payback_period | number | 静态投资回收期 | 年 |
| discounted_payback_period | number | 动态投资回收期（考虑折现） | 年 |
| profitability_index | number | 盈利指数 | - |
| roi | number | 投资回报率（项目期平均） | % |
| total_cash_inflow | number | 现金流入总额 | 万元 |
| total_cash_outflow | number | 现金流出总额 | 万元 |
| net_cash_flow | number | 净现金流 | 万元 |
| discounted_cash_flows | array | 各期折现现金流 | - |
| discounted_cash_flows[].period | number | 期数 | - |
| discounted_cash_flows[].nominal_cf | number | 名义现金流 | 万元 |
| discounted_cash_flows[].discounted_cf | number | 折现现金流 | 万元 |
| discounted_cash_flows[].cumulative_npv | number | 累计NPV | 万元 |
| break_even_analysis | object | 盈亏平衡分析 | - |
| break_even_analysis.break_even_period | number | 盈亏平衡期 | 年 |
| break_even_analysis.sensitivity_to_price | number | 价格敏感性 | % |
| break_even_analysis.sensitivity_to_volume | number | 销量敏感性 | % |
| risk_metrics | object | 风险指标 | - |
| risk_metrics.var_95 | number | 95%置信度VaR | 万元 |
| risk_metrics.probability_of_loss | number | 亏损概率 | % |
| risk_metrics.scenario_npv_optimistic | number | 乐观情景NPV | 万元 |
| risk_metrics.scenario_npv_base | number | 基准情景NPV | 万元 |
| risk_metrics.scenario_npv_pessimistic | number | 悲观情景NPV | 万元 |
| recommendation | string | 投资建议 | - |
| comparison_metrics | object | 对比指标（用于多方案比选） | - |
| generated_at | datetime | 报告生成时间 | ISO 8601 |
| report_url | string | 详细报告下载链接 | URL |

### 4. 性能指标

| 指标项 | 数值 | 说明 |
|--------|------|------|
| 计算准确率 | >=99.9% | 财务指标计算精度 |
| 单次计算延迟 | <500ms | 标准项目计算时间 |
| 支持现金流期数 | 50期 | 最大支持的期数 |
| 并发计算能力 | 100个项目 | 同时计算的最大项目数 |
| API可用性 | 99.9% | 月度服务可用性SLA |
| 计算结果保留 | 5年 | 历史计算结果存储时长 |
| 单次调用成本 | 0.3元/次 | 含计算与存储费用 |

### 5. 使用示例

\`\`\`typescript
// 示例：评估新建10GWh动力电池产线项目
const npvRequest = {
  project_name: 'SZ02-动力电池产线-10GWh',
  initial_investment: 350000, // 35亿元
  cash_flows: [
    { period: 1, amount: -50000, description: '建设期第二年投入' },
    { period: 2, amount: 25000, description: '投产第一年（产能爬坡60%）' },
    { period: 3, amount: 45000, description: '投产第二年（产能爬坡80%）' },
    { period: 4, amount: 58000, description: '达产第一年' },
    { period: 5, amount: 60000, description: '达产第二年' },
    { period: 6, amount: 62000, description: '达产第三年' },
    { period: 7, amount: 64000, description: '达产第四年' },
    { period: 8, amount: 66000, description: '达产第五年' },
    { period: 9, amount: 68000, description: '达产第六年' },
    { period: 10, amount: 70000, description: '达产第七年' }
  ],
  discount_rate: 0.10, // 10%折现率
  project_lifecycle: 10, // 10年生命周期
  terminal_value: 50000, // 终值5亿元
  tax_rate: 0.25,
  depreciation_method: 'straight_line',
  depreciation_years: 7,
  working_capital: 30000,
  salvage_value: 20000,
  risk_adjustment: {
    country_risk: 0.02,
    industry_risk: 0.03,
    project_risk: 0.02
  }
};

// 调用技能
const result = await skillClient.invoke('npv_calculator_v1', npvRequest);

// 处理结果
console.log(\`项目NPV：\${result.npv}万元\`);
console.log(\`项目IRR：\${result.irr}%\`);
console.log(\`投资回收期：\${result.payback_period}年\`);

// 投资决策
if (result.npv > 0 && result.irr > 12) {
  console.log('项目可行，建议投资');
} else if (result.npv > 0 && result.irr > 8) {
  console.log('项目边际可行，需进一步论证');
} else {
  console.log('项目不可行，建议放弃或优化方案');
}

// 风险分析
console.log(\`95%置信度VaR：\${result.risk_metrics.var_95}万元\`);
console.log(\`亏损概率：\${result.risk_metrics.probability_of_loss}%\`);
\`\`\`

### 6. 故障处理

| 错误码 | 错误信息 | 可能原因 | 处理建议 |
|--------|----------|----------|----------|
| ENP001 | 初始投资额无效 | initial_investment <= 0 | 确保初始投资额为正数 |
| ENP002 | 现金流数据格式错误 | cash_flows数组结构不正确 | 检查数组元素是否包含period和amount字段 |
| ENP003 | 折现率超出范围 | discount_rate不在0-1范围内 | 调整折现率至合理范围（通常0.05-0.20） |
| ENP004 | 项目生命周期无效 | project_lifecycle < 1 | 确保项目生命周期至少为1年 |
| ENP005 | 现金流期数不匹配 | cash_flows期数与lifecycle不一致 | 调整现金流期数或生命周期参数 |
| ENP006 | IRR计算不收敛 | 现金流符号变化不足 | 确保现金流至少有一次正负变化 |
| ENP007 | 折旧年限超过生命周期 | depreciation_years > project_lifecycle | 调整折旧年限不超过项目周期 |
| ENP008 | 税率超出范围 | tax_rate不在0-0.5范围内 | 调整税率至合理范围 |
| ENP009 | 风险调整参数错误 | 风险溢价之和超过折现率 | 调整风险调整参数 |
| ENP010 | 计算精度溢出 | 现金流数值过大 | 检查现金流数值，确保在合理范围内 |

### 7. 版本历史

| 版本 | 发布日期 | 变更内容 | 兼容性 |
|------|----------|----------|--------|
| v1.0.0 | 2024-01-15 | 初始版本，支持NPV/IRR/回收期/盈利指数计算 | - |

### 8. 依赖与前置条件

#### 硬件要求
- **计算资源**：财务计算服务需2核4GB内存配置
- **存储空间**：历史计算结果存储>=100GB

#### 软件要求
- **财务系统**：与ERP财务模块对接（可选）
- **数据接口**：支持Excel导入导出

#### 数据要求
- **现金流预测**：基于市场分析和产能规划的详细现金流预测
- **折现率确定**：基于WACC或要求回报率的折现率
- **税率信息**：企业适用的所得税率

#### 权限要求
- 用户需具备"投资决策分析"操作权限
- 涉及敏感财务数据时需额外审批权限 |
      config: "{\"default_discount_rate\": 0.10, \"tax_rate\": 0.25}",
      script: "def calculate_npv_irr(investment, cash_flows, discount_rate, lifecycle):\n    npv = -investment + sum([cf / (1+discount_rate)**t for t, cf in enumerate(cash_flows)])\n    irr = calculate_irr(cash_flows, investment)\n    payback = calculate_payback(cash_flows, investment)\n    return {'npv': npv, 'irr': irr, 'payback_period': payback}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "location_optimizer_v1",
    name: "生产基地选址优化器",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["location", "optimization", "supply_chain", "multi_criteria"],
    input_schema: {
      candidate_locations: "array",
      customer_locations: "array",
      supplier_locations: "array",
      cost_factors: "object",
      constraint_weights: "object"
    },
    output_schema: {
      ranked_locations: "array",
      cost_breakdown: "object",
      risk_assessment: "object",
      recommendation: "string"
    },
    cost: 0.6,
    latency: 2000,
    accuracy_score: 0.89,
    dependencies: [],
    description: "综合考虑供应链距离、物流成本、土地价格、人工成本、税收政策、环保约束等多因素，为新建产线推荐最优选址。",
    files: {
      readme: `## 生产基地选址优化器

### 1. 技能概述

#### 业务价值
生产基地选址是锂电制造企业战略布局的关键决策，直接影响企业长期竞争力。本技能综合考虑供应链、运营成本、政策风险等多维度因素，提供科学的选址决策支持，实现：
- 全生命周期成本最优（TCO降低10-20%）
- 供应链效率最大化（物流成本降低15-25%）
- 政策风险最小化（合规成本可控）
- 战略灵活性保障（预留扩展空间）

预计可帮助企业：
- 选址决策周期缩短60%
- 避免选址失误导致的沉没成本
- 优化供应链网络布局
- 提升区域市场竞争力

#### 技术原理
采用多目标决策优化方法：
- **层次分析法(AHP)**：构建选址评估指标体系，确定权重
  - 目标层：最优选址
  - 准则层：供应链成本、运营成本、风险因素、战略价值
  - 方案层：各候选地址
- **TOPSIS理想解排序法**：计算各候选地址与理想解的接近度
  - 正理想解：各指标最优值
  - 负理想解：各指标最劣值
  - 相对接近度：与正理想解距离/(与正理想解距离+与负理想解距离)
- **蒙特卡洛模拟**：评估不确定性因素对选址决策的影响
- **敏感性分析**：识别关键决策因子

评估指标体系（锂电行业专用）：
| 一级指标 | 二级指标 | 权重 | 数据来源 |
|----------|----------|------|----------|
| 供应链成本(30%) | 原材料运输成本 | 15% | 物流报价 |
| | 成品配送成本 | 10% | 客户分布 |
| | 供应商距离 | 5% | 供应商位置 |
| 运营成本(35%) | 土地成本 | 10% | 土地招拍挂 |
| | 人工成本 | 10% | 统计局数据 |
| | 能源成本 | 8% | 电价/气价 |
| | 税收优惠 | 7% | 地方政策 |
| 风险因素(20%) | 环保政策风险 | 8% | 政策文件 |
| | 劳动力供给 | 5% | 人口数据 |
| | 自然灾害风险 | 4% | 历史数据 |
| | 地方财政健康度 | 3% | 财政报告 |
| 战略价值(15%) | 客户 proximity | 8% | 客户分布 |
| | 产业集群效应 | 4% | 产业地图 |
| | 扩展空间 | 3% | 土地规划 |

#### 应用场景
- **新基地选址**：进入新区域市场的基地选址
- **产能扩张选址**：现有产能不足时的扩产选址
- **产能转移选址**：成本优化驱动的产能转移
- **研发中心选址**：贴近客户或高校的研发中心选址
- **仓储物流中心选址**：区域配送中心选址优化

### 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| project_name | string | 是 | 长度1-100字符 | 项目名称 |
| candidate_locations | array | 是 | - | 候选地址列表 |
| candidate_locations[].location_id | string | 是 | - | 地址唯一标识 |
| candidate_locations[].location_name | string | 是 | - | 地址名称 |
| candidate_locations[].coordinates | object | 是 | - | 地理坐标 |
| candidate_locations[].coordinates.latitude | number | 是 | -90~90 | 纬度 |
| candidate_locations[].coordinates.longitude | number | 是 | -180~180 | 经度 |
| candidate_locations[].land_cost | number | 是 | >0 | 土地单价，单位：元/平方米 |
| candidate_locations[].labor_cost | number | 是 | >0 | 平均工资，单位：元/月 |
| candidate_locations[].energy_cost | number | 是 | >0 | 工业电价，单位：元/kWh |
| candidate_locations[].tax_incentive | number | 否 | 0-1 | 税收优惠比例，默认0 |
| customer_locations | array | 是 | - | 主要客户位置列表 |
| customer_locations[].customer_id | string | 是 | - | 客户ID |
| customer_locations[].coordinates | object | 是 | - | 客户地理坐标 |
| customer_locations[].annual_demand | number | 是 | >0 | 年需求量，单位：MWh |
| supplier_locations | array | 是 | - | 主要供应商位置列表 |
| supplier_locations[].supplier_id | string | 是 | - | 供应商ID |
| supplier_locations[].coordinates | object | 是 | - | 供应商地理坐标 |
| supplier_locations[].material_type | string | 是 | - | 材料类型：cathode/anode/electrolyte/separator |
| supplier_locations[].annual_volume | number | 是 | >0 | 年供应量，单位：吨 |
| cost_factors | object | 是 | - | 成本计算参数 |
| cost_factors.transport_cost_per_km | number | 是 | >0 | 运输成本，单位：元/吨·公里 |
| cost_factors.warehouse_cost_per_sqm | number | 否 | >0 | 仓储成本，单位：元/平方米·年 |
| cost_factors.inflation_rate | number | 否 | 0-0.1 | 通胀率，默认0.03 |
| constraint_weights | object | 否 | - | 指标权重配置 |
| constraint_weights.supply_chain | number | 否 | 0-1 | 供应链成本权重，默认0.30 |
| constraint_weights.operating | number | 否 | 0-1 | 运营成本权重，默认0.35 |
| constraint_weights.risk | number | 否 | 0-1 | 风险因素权重，默认0.20 |
| constraint_weights.strategic | number | 否 | 0-1 | 战略价值权重，默认0.15 |
| evaluation_period | number | 否 | 1-30 | 评估周期，单位：年，默认10 |
| required_land_area | number | 是 | >0 | 所需土地面积，单位：平方米 |
| required_workforce | number | 是 | >0 | 所需员工数量，单位：人 |
| annual_production | number | 是 | >0 | 年产量，单位：MWh |

### 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| optimization_id | string | 优化任务唯一标识 | - |
| project_name | string | 项目名称 | - |
| ranked_locations | array | 排序后的候选地址列表 | - |
| ranked_locations[].rank | number | 排名 | - |
| ranked_locations[].location_id | string | 地址ID | - |
| ranked_locations[].location_name | string | 地址名称 | - |
| ranked_locations[].total_score | number | 综合得分 | 0-100 |
| ranked_locations[].supply_chain_score | number | 供应链成本得分 | 0-100 |
| ranked_locations[].operating_score | number | 运营成本得分 | 0-100 |
| ranked_locations[].risk_score | number | 风险因素得分 | 0-100 |
| ranked_locations[].strategic_score | number | 战略价值得分 | 0-100 |
| ranked_locations[].closeness_coefficient | number | TOPSIS相对接近度 | 0-1 |
| ranked_locations[].recommendation | string | 推荐意见 | - |
| cost_breakdown | object | 成本分解 | - |
| cost_breakdown.total_lifecycle_cost | number | 全生命周期成本 | 万元 |
| cost_breakdown.initial_investment | number | 初始投资 | 万元 |
| cost_breakdown.annual_operating_cost | number | 年运营成本 | 万元/年 |
| cost_breakdown.transportation_cost | number | 年运输成本 | 万元/年 |
| cost_breakdown.labor_cost | number | 年人工成本 | 万元/年 |
| cost_breakdown.energy_cost | number | 年能源成本 | 万元/年 |
| cost_breakdown.by_location | array | 各地址成本明细 | - |
| risk_assessment | object | 风险评估 | - |
| risk_assessment.overall_risk_level | enum | 整体风险等级：low/medium/high | - |
| risk_assessment.policy_risk | number | 政策风险评分 | 0-100 |
| risk_assessment.market_risk | number | 市场风险评分 | 0-100 |
| risk_assessment.natural_risk | number | 自然风险评分 | 0-100 |
| risk_assessment.mitigation_suggestions | array | 风险缓释建议 | - |
| sensitivity_analysis | object | 敏感性分析 | - |
| sensitivity_analysis.key_factors | array | 关键影响因子 | - |
| sensitivity_analysis.scenario_results | array | 情景分析结果 | - |
| recommendation | string | 综合推荐 | - |
| comparison_matrix | object | 对比矩阵 | - |
| generated_at | datetime | 报告生成时间 | ISO 8601 |
| report_url | string | 详细报告下载链接 | URL |

### 4. 性能指标

| 指标项 | 数值 | 说明 |
|--------|------|------|
| 优化计算准确率 | >=95% | 选址评估结果与实际对比 |
| 单次优化延迟 | <2000ms | 标准规模计算时间 |
| 支持候选地址数 | 20个 | 单次评估最大候选地址数 |
| 支持客户/供应商数 | 各50个 | 最大客户/供应商数量 |
| API可用性 | 99.5% | 月度服务可用性SLA |
| 计算结果保留 | 3年 | 历史计算结果存储时长 |
| 单次调用成本 | 0.6元/次 | 含计算与存储费用 |

### 5. 使用示例

\`\`\`typescript
// 示例：为新10GWh动力电池基地选址
const locationRequest = {
  project_name: 'SZ02-动力电池基地选址',
  candidate_locations: [
    {
      location_id: 'LOC-001',
      location_name: '常州金坛',
      coordinates: { latitude: 31.7231, longitude: 119.5736 },
      land_cost: 450, // 元/平方米
      labor_cost: 6500, // 元/月
      energy_cost: 0.72, // 元/kWh
      tax_incentive: 0.15
    },
    {
      location_id: 'LOC-002',
      location_name: '宜宾三江新区',
      coordinates: { latitude: 28.7654, longitude: 104.6432 },
      land_cost: 280,
      labor_cost: 5200,
      energy_cost: 0.38, // 水电优势
      tax_incentive: 0.20
    },
    {
      location_id: 'LOC-003',
      location_name: '宁德东侨',
      coordinates: { latitude: 26.6688, longitude: 119.5479 },
      land_cost: 380,
      labor_cost: 5800,
      energy_cost: 0.65,
      tax_incentive: 0.10
    }
  ],
  customer_locations: [
    { customer_id: 'TSLA-SH', coordinates: { latitude: 31.2304, longitude: 121.4737 }, annual_demand: 3000 },
    { customer_id: 'BYD-SZ', coordinates: { latitude: 22.5431, longitude: 114.0579 }, annual_demand: 2500 },
    { customer_id: 'NIO-HE', coordinates: { latitude: 31.8206, longitude: 117.2272 }, annual_demand: 1500 }
  ],
  supplier_locations: [
    { supplier_id: 'CATL-Material', coordinates: { latitude: 26.6688, longitude: 119.5479 }, material_type: 'cathode', annual_volume: 5000 },
    { supplier_id: 'BTR', coordinates: { latitude: 22.5431, longitude: 113.9800 }, material_type: 'anode', annual_volume: 3000 }
  ],
  cost_factors: {
    transport_cost_per_km: 0.5,
    warehouse_cost_per_sqm: 180,
    inflation_rate: 0.03
  },
  constraint_weights: {
    supply_chain: 0.30,
    operating: 0.35,
    risk: 0.20,
    strategic: 0.15
  },
  evaluation_period: 10,
  required_land_area: 200000, // 20万平方米
  required_workforce: 2000,
  annual_production: 10000 // 10GWh
};

// 调用技能
const result = await skillClient.invoke('location_optimizer_v1', locationRequest);

// 处理结果
console.log('选址排名：');
result.ranked_locations.forEach(loc => {
  console.log(\`\${loc.rank}. \${loc.location_name} - 综合得分：\${loc.total_score}\`);
});

// 推荐选址
const topLocation = result.ranked_locations[0];
console.log(\`推荐选址：\${topLocation.location_name}\`);
console.log(\`推荐理由：\${topLocation.recommendation}\`);

// 成本分析
console.log(\`全生命周期成本：\${result.cost_breakdown.total_lifecycle_cost}万元\`);
console.log(\`年运营成本：\${result.cost_breakdown.annual_operating_cost}万元/年\`);

// 风险评估
console.log(\`整体风险等级：\${result.risk_assessment.overall_risk_level}\`);
\`\`\`

### 6. 故障处理

| 错误码 | 错误信息 | 可能原因 | 处理建议 |
|--------|----------|----------|----------|
| ELO001 | 候选地址数量不足 | candidate_locations少于2个 | 提供至少2个候选地址 |
| ELO002 | 坐标格式错误 | 经纬度超出有效范围 | 检查coordinates参数 |
| ELO003 | 成本数据缺失 | 土地/人工/能源成本为0或负数 | 确保成本参数为正数 |
| ELO004 | 权重配置错误 | 权重之和不等于1 | 调整权重，确保总和为1 |
| ELO005 | 客户/供应商位置缺失 | customer_locations或supplier_locations为空 | 提供主要客户和供应商位置 |
| ELO006 | 需求量/供应量为0 | annual_demand或annual_volume为0 | 确保需求量和供应量为正数 |
| ELO007 | 评估周期无效 | evaluation_period超出1-30范围 | 调整评估周期至有效范围 |
| ELO008 | 土地面积不足 | required_land_area为0 | 提供所需的土地面积 |
| ELO009 | AHP一致性检验失败 | 判断矩阵不一致 | 检查指标权重配置 |
| ELO010 | 计算资源不足 | 候选地址过多 | 减少候选地址数量 |

### 7. 版本历史

| 版本 | 发布日期 | 变更内容 | 兼容性 |
|------|----------|----------|--------|
| v1.0.0 | 2024-01-15 | 初始版本，支持AHP+TOPSIS选址优化 | - |

### 8. 依赖与前置条件

#### 硬件要求
- **计算资源**：优化服务需4核8GB内存配置
- **存储空间**：历史计算结果存储>=200GB
- **地图服务**：需接入地图API获取距离数据

#### 软件要求
- **地图服务**：高德地图/百度地图API（用于距离计算）
- **数据接口**：支持Excel导入导出

#### 数据要求
- **候选地址数据**：土地成本、人工成本、能源成本等需实地调研
- **客户分布数据**：主要客户的地理位置和需求量
- **供应商数据**：主要供应商的地理位置和供应量
- **政策数据**：各地税收优惠政策

#### 权限要求
- 用户需具备"投资决策分析"操作权限
- 需配置地图API调用权限 |
      config: "{\"transport_cost_per_km\": 0.5, \"logistics_weight\": 0.3, \"labor_weight\": 0.25}",
      script: "def optimize_location(candidates, customers, suppliers, costs, weights):\n    scores = {}\n    for loc in candidates:\n        logistics_cost = calc_logistics(loc, customers, suppliers)\n        operating_cost = calc_operating(loc, costs)\n        risk_score = assess_risk(loc)\n        scores[loc] = weighted_score(logistics_cost, operating_cost, risk_score, weights)\n    return rank_locations(scores)",
      scriptLang: "python"
    }
  },
  {
    skill_id: "risk_simulator_v1",
    name: "投资风险情景模拟器",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["risk", "simulation", "monte_carlo", "sensitivity"],
    input_schema: {
      base_case: "object",
      risk_scenarios: "array",
      simulation_runs: "number",
      confidence_level: "number"
    },
    output_schema: {
      scenario_results: "array",
      probability_distribution: "object",
      var_metrics: "object",
      sensitivity_ranking: "array"
    },
    cost: 0.8,
    latency: 5000,
    accuracy_score: 0.87,
    dependencies: ["npv_calculator_v1"],
    description: "通过蒙特卡洛模拟评估投资项目在不同风险情景下的表现，识别关键风险因子并量化潜在损失。",
    files: {
      readme: "# Risk Simulator\n\n## 概述\n基于蒙特卡洛模拟的投资风险评估工具。\n\n## 风险情景\n- 销量下滑（-20%、-30%、-50%）\n- 原材料涨价（+20%、+30%、+50%）\n- 建设延期（6个月、12个月、18个月）\n- 政策变化（补贴取消、环保加码）\n\n## 输出\n- 概率分布直方图\n- VaR风险价值\n- 敏感性排序",
      config: "{\"simulation_runs\": 10000, \"confidence_level\": 0.95}",
      script: "def simulate_risks(base_case, scenarios, runs, confidence):\n    results = []\n    for _ in range(runs):\n        scenario = sample_scenario(scenarios)\n        result = run_simulation(base_case, scenario)\n        results.append(result)\n    return analyze_distribution(results, confidence)",
      scriptLang: "python"
    }
  },
  {
    skill_id: "market_forecast_v2",
    name: "新市场机会预测",
    version: "2.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["market", "forecast", "demand", "growth"],
    input_schema: {
      target_market: "string",
      product_segment: "string",
      historical_data: "array",
      macro_indicators: "object",
      competitor_dynamics: "object"
    },
    output_schema: {
      market_size_forecast: "array",
      growth_rate: "number",
      market_share_potential: "number",
      entry_timing: "string",
      key_success_factors: "array"
    },
    cost: 0.5,
    latency: 1500,
    accuracy_score: 0.85,
    dependencies: ["demand_forecast_v3"],
    description: "预测目标市场（乘用车/商用车/储能）未来5-10年的需求规模和增长趋势，评估市场进入时机。",
    files: {
      readme: "# Market Forecast\n\n## 概述\n针对锂电新产能投资决策的市场需求预测模型。\n\n## 分析维度\n- **TAM/SAM/SOM**: 总体/可服务/可获得市场\n- **增长驱动因素**: 政策、技术、成本、竞争\n- **渗透率曲线**: 早期/成长期/成熟期\n- **区域差异**: 国内/海外、一线/下沉市场\n\n## 应用场景\n- 新产线产能规划\n- 产品线布局决策\n- 市场进入时机选择",
      config: "{\"forecast_horizon_years\": 10, \"growth_model\": \"bass_diffusion\"}",
      script: "def forecast_market(market, segment, historical, macro, competitors):\n    tam = calc_total_addressable_market(macro)\n    growth_rate = project_growth(historical, macro)\n    share_potential = assess_competitive_position(competitors)\n    return {'market_size': tam, 'growth': growth_rate, 'share': share_potential}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "capex_analyzer_v1",
    name: "资本支出结构分析",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["capex", "investment", "cost_structure"],
    input_schema: {
      capacity_gwh: "number",
      technology_type: "string",
      automation_level: "string",
      location_factor: "number"
    },
    output_schema: {
      total_capex: "number",
      cost_breakdown: "object",
      unit_investment: "number",
      working_capital: "number",
      financing_requirement: "number"
    },
    cost: 0.4,
    latency: 800,
    accuracy_score: 0.92,
    dependencies: [],
    description: "估算新建产线的资本支出结构，包括设备投资、厂房建设、土地购置、流动资金等各项明细。",
    files: {
      readme: "# CAPEX Analyzer\n\n## 概述\n锂电产线资本支出估算模型。\n\n## 成本构成\n1. **设备投资** (60-70%): 涂布、卷绕、化成、分容等关键设备\n2. **厂房建设** (15-20%): 洁净厂房、公用工程、配套设施\n3. **土地购置** (5-10%): 根据地区地价差异较大\n4. **流动资金** (10-15%): 原材料、在制品、应收账款\n\n## 调整因子\n- 产能规模（规模经济）\n- 自动化程度\n- 地区成本差异",
      config: "{\"base_unit_cost_yuan_per_wh\": 0.35, \"scale_factor\": 0.85}",
      script: "def analyze_capex(capacity_gwh, tech_type, automation, location_factor):\n    base_capex = capacity_gwh * 1e9 * 0.35  # 元/Wh基准\n    equipment_ratio = 0.65 if automation == 'high' else 0.60\n    building_ratio = 0.15\n    land_ratio = 0.08 * location_factor\n    working_capital_ratio = 0.12\n    return calculate_breakdown(base_capex, equipment_ratio, building_ratio, land_ratio, working_capital_ratio)",
      scriptLang: "python"
    }
  },
  {
    skill_id: "sensitivity_analysis_v1",
    name: "投资决策敏感性分析",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["sensitivity", "tornado", "what_if", "break_even"],
    input_schema: {
      base_case_npv: "number",
      variable_ranges: "object",
      output_metrics: "array"
    },
    output_schema: {
      tornado_chart: "array",
      spider_chart: "array",
      break_even_points: "object",
      critical_variables: "array"
    },
    cost: 0.4,
    latency: 1000,
    accuracy_score: 0.94,
    dependencies: ["npv_calculator_v1"],
    description: "分析投资项目中各变量（销量、价格、成本、建设周期等）对NPV的敏感程度，识别关键决策因子。",
    files: {
      readme: "# Sensitivity Analysis\n\n## 概述\n tornado龙卷风图分析工具。\n\n## 分析变量\n- 销售量（±20%）\n- 销售价格（±15%）\n- 原材料成本（±30%）\n- 建设周期（±6个月）\n- 折现率（±2%）\n\n## 输出\n- 敏感性排序\n- 盈亏平衡点\n- 关键变量识别",
      config: "{\"variation_range\": 0.20, \"steps\": 5}",
      script: "def sensitivity_analysis(base_npv, variable_ranges, metrics):\n    tornado_data = []\n    for var, range_val in variable_ranges.items():\n        low_npv = calc_npv(var, -range_val)\n        high_npv = calc_npv(var, range_val)\n        sensitivity = abs(high_npv - low_npv)\n        tornado_data.append({'variable': var, 'low': low_npv, 'high': high_npv, 'sensitivity': sensitivity})\n    return sort_by_sensitivity(tornado_data)",
      scriptLang: "python"
    }
  },
  // ========== 产能评估推演预测分析场景技能 ==========
  {
    skill_id: "oee_analyzer_v1",
    name: "OEE综合效率分析器",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["oee", "efficiency", "performance", "analysis"],
    input_schema: {
      availability_data: "object",
      performance_data: "object",
      quality_data: "object",
      time_period: "string"
    },
    output_schema: {
      oee_score: "number",
      availability_rate: "number",
      performance_rate: "number",
      quality_rate: "number",
      improvement_opportunities: "array"
    },
    cost: 0.3,
    latency: 600,
    accuracy_score: 0.95,
    dependencies: [],
    description: "计算锂电产线OEE（设备综合效率），识别时间损失、性能损失和质量损失，提供改善建议。",
    files: {
      readme: `## OEE综合效率分析器

### 1. 技能概述

#### 业务价值
设备综合效率(OEE)是衡量制造设备生产效率的核心指标，直接影响产能利用和成本控制。本技能针对锂电制造行业特点，提供精准的OEE分析和改善建议，实现：
- 设备效率损失可视化，识别改善机会
- 产能提升8-15%，降低单位制造成本
- 减少设备故障停机时间20-30%
- 支撑精益生产和持续改进

预计可帮助企业：
- OEE从行业平均75%提升至85%+
- 年产能增加5-10%（无需新增设备投资）
- 设备维护成本降低15%
- 产品质量稳定性提升

#### 技术原理
基于国际通用的OEE计算方法，结合锂电行业特点优化：
- **时间开动率(Availability)**：反映设备时间利用效率
  - 时间开动率 = 实际运行时间 / 计划工作时间
  - 计划工作时间 = 总时间 - 计划停机（保养、换型）
  - 实际运行时间 = 计划工作时间 - 非计划停机（故障、缺料）
- **性能开动率(Performance)**：反映设备速度效率
  - 性能开动率 = 实际产出 / 理论产出
  - 理论产出 = 实际运行时间 × 设计速度
  - 速度损失包括：降速运行、小停机、启动损失
- **质量合格率(Quality)**：反映产品质量水平
  - 质量合格率 = 合格品数 / 总产出数
  - 废品、返工品计入质量损失

OEE计算公式：
- OEE = 时间开动率 × 性能开动率 × 质量合格率
- 世界级OEE目标：≥85%（时间开动率90% × 性能开动率95% × 质量合格率99%）

锂电行业专用考虑：
- 涂布机：面密度调整时间、换卷停机
- 辊压机：厚度调整、压力校准时间
- 卷绕机：换针时间、对齐度调整
- 化成柜：充放电周期、温度均衡时间
- 分容柜：容量测试时间、数据上传时间

六大损失识别：
1. 故障停机损失（设备故障）
2. 换型调整损失（产品切换）
3. 空转短暂停机（小停机）
4. 速度降低损失（降速运行）
5. 废品返工损失（质量缺陷）
6. 启动调试损失（开班启动）

#### 应用场景
- **日常生产管理**：班组OEE实时监控和交接班
- **设备效率对标**：不同产线/工厂间OEE对比
- **改善项目评估**：精益改善前后的OEE对比
- **产能规划输入**：基于OEE计算有效产能
- **设备投资决策**：低效设备淘汰或升级决策

### 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| evaluation_scope | enum | 是 | equipment/process/line/factory | 评估范围：设备/工序/产线/工厂 |
| equipment_id | string | 条件 | - | 设备标识，scope=equipment时必填 |
| process_id | string | 条件 | - | 工序标识，scope=process时必填 |
| line_id | string | 条件 | - | 产线标识，scope=line时必填 |
| factory_id | string | 条件 | - | 工厂标识，scope=factory时必填 |
| time_range | object | 是 | - | 评估时间范围 |
| time_range.start_time | datetime | 是 | ISO 8601 | 开始时间 |
| time_range.end_time | datetime | 是 | ISO 8601 | 结束时间，最大跨度720小时 |
| availability_data | object | 是 | - | 时间开动率数据 |
| availability_data.planned_time | number | 是 | >0 | 计划工作时间，单位：分钟 |
| availability_data.actual_runtime | number | 是 | >=0 | 实际运行时间，单位：分钟 |
| availability_data.downtime_breakdown | array | 否 | - | 停机明细 |
| availability_data.downtime_breakdown[].reason | string | 是 | - | 停机原因 |
| availability_data.downtime_breakdown[].duration | number | 是 | >0 | 停机时长，单位：分钟 |
| performance_data | object | 是 | - | 性能开动率数据 |
| performance_data.theoretical_output | number | 是 | >0 | 理论产出，单位：支或kWh |
| performance_data.actual_output | number | 是 | >=0 | 实际产出，单位：支或kWh |
| performance_data.design_speed | number | 否 | >0 | 设计速度，单位：支/小时 |
| performance_data.actual_speed | number | 否 | >=0 | 实际平均速度，单位：支/小时 |
| quality_data | object | 是 | - | 质量数据 |
| quality_data.total_units | number | 是 | >0 | 总产出数量 |
| quality_data.good_units | number | 是 | >=0 | 合格品数量 |
| quality_data.defect_units | number | 否 | >=0 | 不良品数量 |
| quality_data.rework_units | number | 否 | >=0 | 返工品数量 |
| benchmark_comparison | boolean | 否 | true/false | 是否包含行业标杆对比，默认false |
| include_loss_analysis | boolean | 否 | true/false | 是否包含损失分析，默认true |

### 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| analysis_id | string | 分析任务唯一标识 | - |
| oee_score | number | OEE综合得分 | % |
| oee_grade | enum | OEE等级：world_class/excellent/good/fair/poor | - |
| availability_rate | number | 时间开动率 | % |
| performance_rate | number | 性能开动率 | % |
| quality_rate | number | 质量合格率 | % |
| time_losses | object | 时间损失分析 | - |
| time_losses.planned_downtime | number | 计划停机时间 | 分钟 |
| time_losses.unplanned_downtime | number | 非计划停机时间 | 分钟 |
| time_losses.breakdown_losses | array | 故障停机明细 | - |
| performance_losses | object | 性能损失分析 | - |
| performance_losses.speed_loss | number | 速度损失 | % |
| performance_losses.minor_stops | number | 小停机次数 | 次 |
| performance_losses.startup_loss | number | 启动损失 | 支 |
| quality_losses | object | 质量损失分析 | - |
| quality_losses.defect_rate | number | 不良率 | % |
| quality_losses.rework_rate | number | 返工率 | % |
| quality_losses.scrap_cost | number | 报废成本 | 元 |
| improvement_opportunities | array | 改善机会列表 | - |
| improvement_opportunities[].opportunity_id | string | 机会ID | - |
| improvement_opportunities[].loss_category | string | 损失类别 | - |
| improvement_opportunities[].current_loss | number | 当前损失 | % |
| improvement_opportunities[].potential_gain | number | 潜在提升 | % |
| improvement_opportunities[].recommended_action | string | 建议措施 | - |
| improvement_opportunities[].estimated_roi | number | 预估ROI | % |
| benchmark_comparison | object | 标杆对比 | - |
| benchmark_comparison.industry_average | number | 行业平均OEE | % |
| benchmark_comparison.world_class | number | 世界级OEE | % |
| benchmark_comparison.your_ranking | number | 您的排名 | % |
| historical_trend | array | 历史趋势 | - |
| historical_trend[].date | date | 日期 | ISO 8601 |
| historical_trend[].oee | number | OEE值 | % |
| generated_at | datetime | 报告生成时间 | ISO 8601 |
| report_url | string | 详细报告下载链接 | URL |

### 4. 性能指标

| 指标项 | 数值 | 说明 |
|--------|------|------|
| 计算准确率 | >=99% | OEE计算精度 |
| 单次分析延迟 | <600ms | 标准数据分析时间 |
| 支持设备数量 | 1000台 | 单次分析最大设备数 |
| 历史数据查询 | 2年 | 支持的历史数据范围 |
| API可用性 | 99.5% | 月度服务可用性SLA |
| 计算结果保留 | 3年 | 历史分析结果存储时长 |
| 单次调用成本 | 0.3元/次 | 含计算与存储费用 |

### 5. 使用示例

\`\`\`typescript
// 示例：分析涂布线CA01的OEE
const oeeRequest = {
  evaluation_scope: 'line',
  line_id: 'LINE-SZ01-CA01',
  time_range: {
    start_time: '2024-01-15T08:00:00Z',
    end_time: '2024-01-22T08:00:00Z'
  },
  availability_data: {
    planned_time: 10080, // 7天 × 24小时 × 60分钟
    actual_runtime: 8640,
    downtime_breakdown: [
      { reason: '计划保养', duration: 720 },
      { reason: '换型调整', duration: 480 },
      { reason: '设备故障', duration: 240 }
    ]
  },
  performance_data: {
    theoretical_output: 100000,
    actual_output: 88000,
    design_speed: 60, // 支/分钟
    actual_speed: 52
  },
  quality_data: {
    total_units: 88000,
    good_units: 86240,
    defect_units: 1400,
    rework_units: 360
  },
  benchmark_comparison: true,
  include_loss_analysis: true
};

// 调用技能
const result = await skillClient.invoke('oee_analyzer_v1', oeeRequest);

// 处理结果
console.log(\`OEE得分：\${result.oee_score}%\`);
console.log(\`OEE等级：\${result.oee_grade}\`);
console.log(\`时间开动率：\${result.availability_rate}%\`);
console.log(\`性能开动率：\${result.performance_rate}%\`);
console.log(\`质量合格率：\${result.quality_rate}%\`);

// 改善机会
result.improvement_opportunities.forEach(opp => {
  console.log(\`改善机会：\${opp.recommended_action}，潜在提升\${opp.potential_gain}%\`);
});

// 标杆对比
if (result.benchmark_comparison) {
  console.log(\`行业平均OEE：\${result.benchmark_comparison.industry_average}%\`);
  console.log(\`您的排名：超过\${result.benchmark_comparison.your_ranking}%的同行\`);
}
\`\`\`

### 6. 故障处理

| 错误码 | 错误信息 | 可能原因 | 处理建议 |
|--------|----------|----------|----------|
| EOA001 | 设备/工序/产线/工厂ID不存在 | 标识符错误或对象未注册 | 检查ID格式，使用对应API查询有效列表 |
| EOA002 | 时间范围无效 | 时间跨度超过720小时 | 调整time_range参数 |
| EOA003 | 计划工作时间为0 | planned_time为0或负数 | 确保计划工作时间为正数 |
| EOA004 | 实际产出大于理论产出 | actual_output > theoretical_output | 检查数据准确性 |
| EOA005 | 合格品大于总产出 | good_units > total_units | 检查质量数据 |
| EOA006 | 时间数据单位错误 | 时间值过大或过小 | 确认时间单位为分钟 |
| EOA007 | 历史数据缺失 | 指定时段无数据 | 检查MES/SCADA数据采集状态 |
| EOA008 | 计算资源不足 | 分析范围过大 | 缩小time_range或减少设备数量 |
| EOA009 | 权限不足 | 当前用户无该范围分析权限 | 联系系统管理员申请权限 |
| EOA010 | 外部系统超时 | MES/SCADA系统响应超时 | 检查系统连接状态，稍后重试 |

### 7. 版本历史

| 版本 | 发布日期 | 变更内容 | 兼容性 |
|------|----------|----------|--------|
| v1.0.0 | 2024-01-15 | 初始版本，支持OEE三级分析和损失识别 | - |

### 8. 依赖与前置条件

#### 硬件要求
- **计算资源**：分析服务需2核4GB内存配置
- **存储空间**：历史分析数据存储>=100GB
- **网络带宽**：与MES/SCADA系统通信带宽>=50Mbps

#### 软件要求
- **MES系统**：生产数据、质量数据实时采集
- **SCADA系统**：设备运行状态、停机记录
- **数据接口**：REST API或消息队列对接

#### 数据要求
- **设备台账**：设备设计速度、产能参数
- **生产数据**：实际产出、运行时间、停机记录
- **质量数据**：合格品数、不良品数、返工数
- **历史数据**：至少30天历史数据用于趋势分析

#### 权限要求
- 用户需具备"OEE分析"操作权限
- 需配置MES/SCADA数据读取权限
- 如需标杆对比，需订阅行业数据服务 |
      config: "{\"world_class_oee\": 0.85, \"target_oee\": 0.80}",
      script: "def analyze_oee(availability, performance, quality, period):\n    availability_rate = availability.actual_time / availability.planned_time\n    performance_rate = performance.actual_output / performance.theoretical_output\n    quality_rate = quality.good_units / quality.total_units\n    oee = availability_rate * performance_rate * quality_rate\n    improvements = identify_losses(availability, performance, quality)\n    return {'oee': oee, 'availability': availability_rate, 'performance': performance_rate, 'quality': quality_rate, 'improvements': improvements}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "bottleneck_identifier_v1",
    name: "产线瓶颈识别器",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["bottleneck", "constraint", "throughput", "optimization"],
    input_schema: {
      process_data: "array",
      cycle_times: "object",
      wip_levels: "object",
      utilization_rates: "object"
    },
    output_schema: {
      bottleneck_processes: "array",
      constraint_analysis: "object",
      capacity_utilization: "object",
      improvement_recommendations: "array"
    },
    cost: 0.4,
    latency: 800,
    accuracy_score: 0.92,
    dependencies: [],
    description: "基于TOC约束理论识别锂电产线瓶颈工序（涂布/卷绕/化成/分容等），分析产能限制因素。",
    files: {
      readme: `## 产线瓶颈识别器

### 1. 技能概述

#### 业务价值
瓶颈工序是限制产线整体产能的关键因素，识别并改善瓶颈是提升产能的最有效途径。本技能基于约束理论(TOC)，精准识别锂电产线瓶颈，提供改善建议，实现：
- 瓶颈识别准确率>90%，避免盲目投资
- 产能提升10-20%（通过瓶颈改善）
- 在制品库存降低15-25%
- 生产周期缩短10-15%

预计可帮助企业：
- 避免非瓶颈工序的过度投资
- 聚焦资源解决真正制约产能的问题
- 优化生产排程，减少等待浪费
- 提升产线整体效率

#### 技术原理
基于约束理论(Theory of Constraints)和数据分析：
- **利用率判定法**：识别利用率最高的工序
  - 瓶颈工序利用率通常>90%
  - 下游工序频繁出现"饥饿"状态
- **WIP堆积判定法**：识别在制品堆积最多的工序
  - 瓶颈前工序WIP持续增加
  - 瓶颈后工序WIP相对稳定
- **产出节拍法**：对比各工序实际产出节拍
  - 瓶颈工序节拍决定产线整体节拍
  - 非瓶颈工序有闲置产能
- **周期时间法**：分析各工序周期时间
  - 瓶颈工序周期时间最长
  - 其他工序等待瓶颈

锂电产线典型瓶颈分析：
| 工序 | 典型瓶颈原因 | 改善方向 |
|------|--------------|----------|
| 涂布 | 面密度调整时间长、换卷频繁 | 自动闭环控制、大卷径设计 |
| 辊压 | 厚度精度要求高、速度受限 | 液压AGC、在线测厚 |
| 卷绕 | 对齐度精度要求高、换针频繁 | 视觉对位、快速换针 |
| 装配 | 多工位协调复杂、人工依赖 | 自动化升级、AGV物流 |
| 化成 | 充放电时间长（12-24h）、柜位有限 | 高温化成、柜位扩充 |
| 分容 | 容量测试时间长（4-8h）、设备投资大 | 并行测试、设备扩充 |

TOC五步法：
1. 识别瓶颈（Identify）
2. 挖掘瓶颈潜能（Exploit）
3. 迁就瓶颈（Subordinate）
4. 提升瓶颈产能（Elevate）
5. 返回第一步（Repeat）

#### 应用场景
- **产能规划**：识别当前瓶颈，指导扩产投资方向
- **日常排产**：基于瓶颈安排生产节拍
- **改善项目**：聚焦瓶颈工序进行精益改善
- **新线设计**：避免设计阶段就形成瓶颈
- **多工厂协同**：跨工厂瓶颈协调与产能调配

### 2. 输入规范

| 参数名 | 类型 | 必填 | 范围 | 说明 |
|--------|------|------|------|------|
| line_id | string | 是 | - | 产线唯一标识 |
| analysis_period | object | 是 | - | 分析时间范围 |
| analysis_period.start_date | date | 是 | ISO 8601 | 开始日期 |
| analysis_period.end_date | date | 是 | ISO 8601 | 结束日期，最大跨度30天 |
| process_data | array | 是 | - | 工序数据列表 |
| process_data[].process_id | string | 是 | - | 工序ID |
| process_data[].process_name | string | 是 | - | 工序名称 |
| process_data[].process_type | enum | 是 | coating/rolling/slitting/winding/assembly/formation/grading | 工序类型 |
| cycle_times | object | 是 | - | 各工序周期时间 |
| cycle_times.[process_id] | number | 是 | >0 | 工序周期时间，单位：秒/支 |
| wip_levels | object | 是 | - | 各工序在制品数量 |
| wip_levels.[process_id] | number | 是 | >=0 | 在制品数量，单位：支 |
| utilization_rates | object | 是 | - | 各工序设备利用率 |
| utilization_rates.[process_id] | number | 是 | 0-1 | 设备利用率，如0.85表示85% |
| throughput_data | object | 否 | - | 产出数据 |
| throughput_data.actual_output | number | 否 | >=0 | 实际产出，单位：支 |
| throughput_data.theoretical_output | number | 否 | >=0 | 理论产出，单位：支 |
| starvation_data | object | 否 | - | 工序饥饿状态数据 |
| starvation_data.[process_id] | object | 否 | - | 工序饥饿统计 |
| starvation_data.[process_id].starvation_count | number | 否 | >=0 | 饥饿次数 |
| starvation_data.[process_id].starvation_duration | number | 否 | >=0 | 饥饿总时长，单位：分钟 |
| include_improvement_suggestions | boolean | 否 | true/false | 是否包含改善建议，默认true |
| include_what_if_analysis | boolean | 否 | true/false | 是否包含情景分析，默认false |

### 3. 输出规范

| 参数名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| analysis_id | string | 分析任务唯一标识 | - |
| line_id | string | 产线ID | - |
| bottleneck_processes | array | 瓶颈工序列表 | - |
| bottleneck_processes[].process_id | string | 工序ID | - |
| bottleneck_processes[].process_name | string | 工序名称 | - |
| bottleneck_processes[].process_type | string | 工序类型 | - |
| bottleneck_processes[].bottleneck_score | number | 瓶颈得分 | 0-100 |
| bottleneck_processes[].utilization_rate | number | 利用率 | % |
| bottleneck_processes[].cycle_time | number | 周期时间 | 秒/支 |
| bottleneck_processes[].wip_level | number | 在制品数量 | 支 |
| bottleneck_processes[].constraint_type | enum | 约束类型：capacity/quality/material | - |
| primary_bottleneck | object | 主要瓶颈详情 | - |
| primary_bottleneck.process_id | string | 工序ID | - |
| primary_bottleneck.process_name | string | 工序名称 | - |
| primary_bottleneck.impact_on_throughput | number | 对产出的影响 | % |
| primary_bottleneck.capacity_loss | number | 产能损失 | 支/天 |
| constraint_analysis | object | 约束分析 | - |
| constraint_analysis.hard_constraints | array | 硬约束列表 | - |
| constraint_analysis.soft_constraints | array | 软约束列表 | - |
| constraint_analysis.relaxable_constraints | array | 可放宽约束 | - |
| capacity_utilization | object | 产能利用率分析 | - |
| capacity_utilization.line_utilization | number | 产线整体利用率 | % |
| capacity_utilization.bottleneck_utilization | number | 瓶颈工序利用率 | % |
| capacity_utilization.non_bottleneck_avg | number | 非瓶颈平均利用率 | % |
| line_balance_analysis | object | 线平衡分析 | - |
| line_balance_analysis.balance_rate | number | 线平衡率 | % |
| line_balance_analysis.takt_time | number | 节拍时间 | 秒/支 |
| line_balance_analysis.imbalance_index | number | 失衡指数 | 0-1 |
| improvement_recommendations | array | 改善建议列表 | - |
| improvement_recommendations[].recommendation_id | string | 建议ID | - |
| improvement_recommendations[].target_process | string | 目标工序 | - |
| improvement_recommendations[].improvement_type | enum | 改善类型：capacity/efficiency/quality | - |
| improvement_recommendations[].description | string | 改善描述 | - |
| improvement_recommendations[].potential_gain | number | 潜在产能提升 | % |
| improvement_recommendations[].investment_required | number | 所需投资 | 万元 |
| improvement_recommendations[].payback_period | number | 回收期 | 月 |
| improvement_recommendations[].priority | enum | 优先级：high/medium/low | - |
| what_if_analysis | object | 情景分析结果（可选） | - |
| what_if_analysis.scenarios | array | 情景列表 | - |
| generated_at | datetime | 报告生成时间 | ISO 8601 |
| report_url | string | 详细报告下载链接 | URL |

### 4. 性能指标

| 指标项 | 数值 | 说明 |
|--------|------|------|
| 瓶颈识别准确率 | >=92% | 与实际瓶颈一致率 |
| 单次分析延迟 | <800ms | 标准产线分析时间 |
| 支持工序数量 | 20个 | 单条产线最大工序数 |
| 支持产线数量 | 50条 | 单次分析最大产线数 |
| API可用性 | 99.5% | 月度服务可用性SLA |
| 分析结果保留 | 2年 | 历史分析结果存储时长 |
| 单次调用成本 | 0.4元/次 | 含计算与存储费用 |

### 5. 使用示例

\`\`\`typescript
// 示例：识别产线LINE-SZ01-CA01的瓶颈
const bottleneckRequest = {
  line_id: 'LINE-SZ01-CA01',
  analysis_period: {
    start_date: '2024-01-01',
    end_date: '2024-01-31'
  },
  process_data: [
    { process_id: 'PROC-001', process_name: '涂布', process_type: 'coating' },
    { process_id: 'PROC-002', process_name: '辊压', process_type: 'rolling' },
    { process_id: 'PROC-003', process_name: '分切', process_type: 'slitting' },
    { process_id: 'PROC-004', process_name: '卷绕', process_type: 'winding' },
    { process_id: 'PROC-005', process_name: '装配', process_type: 'assembly' },
    { process_id: 'PROC-006', process_name: '化成', process_type: 'formation' },
    { process_id: 'PROC-007', process_name: '分容', process_type: 'grading' }
  ],
  cycle_times: {
    'PROC-001': 45,
    'PROC-002': 38,
    'PROC-003': 25,
    'PROC-004': 52,
    'PROC-005': 48,
    'PROC-006': 180, // 化成时间长
    'PROC-007': 120  // 分容时间长
  },
  wip_levels: {
    'PROC-001': 850,
    'PROC-002': 620,
    'PROC-003': 480,
    'PROC-004': 920, // 卷绕前堆积
    'PROC-005': 380,
    'PROC-006': 2500, // 化成前大量堆积
    'PROC-007': 1800
  },
  utilization_rates: {
    'PROC-001': 0.82,
    'PROC-002': 0.78,
    'PROC-003': 0.65,
    'PROC-004': 0.88,
    'PROC-005': 0.75,
    'PROC-006': 0.96, // 化成利用率最高
    'PROC-007': 0.94  // 分容利用率次高
  },
  starvation_data: {
    'PROC-007': { starvation_count: 12, starvation_duration: 180 }
  },
  include_improvement_suggestions: true,
  include_what_if_analysis: true
};

// 调用技能
const result = await skillClient.invoke('bottleneck_identifier_v1', bottleneckRequest);

// 处理结果
console.log('瓶颈工序：');
result.bottleneck_processes.forEach(bp => {
  console.log(\`- \${bp.process_name}：瓶颈得分\${bp.bottleneck_score}，利用率\${bp.utilization_rate}%\`);
});

// 主要瓶颈
console.log(\`主要瓶颈：\${result.primary_bottleneck.process_name}\`);
console.log(\`产能损失：\${result.primary_bottleneck.capacity_loss}支/天\`);

// 改善建议
result.improvement_recommendations.forEach(rec => {
  if (rec.priority === 'high') {
    console.log(\`优先改善：\${rec.description}，预期提升\${rec.potential_gain}%\`);
  }
});

// 线平衡分析
console.log(\`线平衡率：\${result.line_balance_analysis.balance_rate}%\`);
console.log(\`产线节拍：\${result.line_balance_analysis.takt_time}秒/支\`);
\`\`\`

### 6. 故障处理

| 错误码 | 错误信息 | 可能原因 | 处理建议 |
|--------|----------|----------|----------|
| EBI001 | 产线ID不存在 | line_id错误或产线未注册 | 检查line_id，使用/line API查询 |
| EBI002 | 工序数据缺失 | process_data为空 | 提供完整的工序列表 |
| EBI003 | 周期时间数据缺失 | cycle_times缺少某些工序 | 确保所有工序都有周期时间 |
| EBI004 | 利用率数据异常 | 利用率超出0-1范围 | 检查utilization_rates参数 |
| EBI005 | WIP数据异常 | WIP为负数 | 确保WIP数据为非负数 |
| EBI006 | 时间范围无效 | 时间跨度超过30天 | 调整analysis_period参数 |
| EBI007 | 工序类型不支持 | process_type不在枚举列表 | 核对工序类型枚举值 |
| EBI008 | 数据不一致 | 工序ID在不同数据集中不匹配 | 确保所有数据使用统一的工序ID |
| EBI009 | 计算资源不足 | 分析范围过大 | 减少分析工序数量 |
| EBI010 | 权限不足 | 当前用户无该产线分析权限 | 联系系统管理员申请权限 |

### 7. 版本历史

| 版本 | 发布日期 | 变更内容 | 兼容性 |
|------|----------|----------|--------|
| v1.0.0 | 2024-01-15 | 初始版本，支持TOC瓶颈识别和改善建议 | - |

### 8. 依赖与前置条件

#### 硬件要求
- **计算资源**：分析服务需2核4GB内存配置
- **存储空间**：历史分析数据存储>=100GB

#### 软件要求
- **MES系统**：工序、设备、WIP数据实时采集
- **SCADA系统**：设备运行状态、产出数据

#### 数据要求
- **工艺数据**：标准工序路线、设计周期时间
- **运行数据**：实际周期时间、设备利用率
- **WIP数据**：各工序在制品数量
- **历史数据**：至少7天历史数据用于趋势分析

#### 权限要求
- 用户需具备"瓶颈分析"操作权限
- 需配置MES/SCADA数据读取权限 |
      config: "{\"bottleneck_threshold\": 0.90, \"wip_threshold\": 1000}",
      script: "def identify_bottlenecks(processes, cycle_times, wip, utilization):\n    bottlenecks = []\n    for process in processes:\n        if utilization[process] > 0.90 or wip[process] > 1000:\n            bottlenecks.append(process)\n    return {'bottlenecks': bottlenecks, 'analysis': analyze_constraint_impact(bottlenecks)}"
      ,
      scriptLang: "python"
    }
  },
  {
    skill_id: "equipment_health_monitor_v1",
    name: "设备健康度监测器",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["health", "equipment", "monitoring", "prediction"],
    input_schema: {
      vibration_data: "array",
      temperature_data: "array",
      maintenance_history: "array",
      runtime_hours: "number"
    },
    output_schema: {
      health_score: "number",
      remaining_useful_life: "number",
      risk_level: "string",
      maintenance_recommendations: "array"
    },
    cost: 0.5,
    latency: 700,
    accuracy_score: 0.89,
    dependencies: [],
    description: "评估关键生产设备（涂布机、卷绕机、化成柜等）的健康状态，预测剩余使用寿命。",
    files: {
      readme: "# Equipment Health Monitor\n\n## 概述\n关键生产设备健康状态评估与预测工具。\n\n## 监测指标\n- 振动频谱分析\n- 温度趋势监测\n- 维护历史分析\n- 运行时间统计\n\n## 输出结果\n- 健康度评分（0-100）\n- 剩余使用寿命预测\n- 风险等级评估\n- 维护建议",
      config: "{\"health_threshold_good\": 80, \"health_threshold_warning\": 60}",
      script: "def monitor_health(vibration, temperature, maintenance, runtime):\n    health_score = calculate_health_score(vibration, temperature, maintenance)\n    rul = predict_rul(health_score, runtime)\n    risk = assess_risk_level(health_score)\n    return {'health': health_score, 'rul': rul, 'risk': risk, 'recommendations': generate_recommendations(health_score)}"
      ,
      scriptLang: "python"
    }
  },
  {
    skill_id: "roi_calculator_v1",
    name: "产能投资ROI计算器",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["roi", "investment", "capacity", "return"],
    input_schema: {
      investment_amount: "number",
      incremental_revenue: "number",
      incremental_cost: "number",
      project_lifecycle: "number"
    },
    output_schema: {
      roi_percentage: "number",
      annual_return: "number",
      payback_period: "number",
      cumulative_cash_flow: "array"
    },
    cost: 0.3,
    latency: 500,
    accuracy_score: 0.94,
    dependencies: [],
    description: "计算产能扩张投资的ROI（投资回报率）、年化收益和投资回收期。",
    files: {
      readme: "# ROI Calculator\n\n## 概述\n产能扩张投资回报率计算工具。\n\n## 计算逻辑\n- ROI = (收益 - 成本) / 投资 × 100%\n- 年化收益 = 年增量收入 - 年增量成本\n- 回收期 = 投资额 / 年净收益\n\n## 应用场景\n- 产线扩产决策\n- 新线投资评估\n- 自动化改造ROI分析",
      config: "{\"target_roi\": 0.15, \"max_payback_years\": 5}",
      script: "def calculate_roi(investment, revenue, cost, lifecycle):\n    annual_profit = revenue - cost\n    roi = (annual_profit * lifecycle - investment) / investment\n    payback = investment / annual_profit\n    cash_flow = calculate_cumulative_cash_flow(investment, annual_profit, lifecycle)\n    return {'roi': roi, 'annual_return': annual_profit, 'payback': payback, 'cash_flow': cash_flow}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "production_simulator_v1",
    name: "产能生产推演模拟器",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["simulation", "production", "capacity", "what_if"],
    input_schema: {
      capacity_config: "object",
      demand_scenario: "object",
      production_constraints: "object",
      simulation_period: "number"
    },
    output_schema: {
      production_output: "array",
      capacity_utilization: "array",
      fulfillment_rate: "number",
      scenario_comparison: "object"
    },
    cost: 0.7,
    latency: 2000,
    accuracy_score: 0.88,
    dependencies: ["capacity_evaluation_v2"],
    description: "基于不同产能配置方案进行生产推演模拟，评估需求满足率和产能利用率。",
    files: {
      readme: "# Production Simulator\n\n## 概述\n产能配置方案推演模拟工具。\n\n## 模拟场景\n- 现有产能配置\n- 扩产方案A/B\n- 新建产线方案\n- 委外加工组合\n\n## 输出指标\n- 产出预测\n- 产能利用率\n- 订单满足率\n- 情景对比分析",
      config: "{\"simulation_months\": 12, \"confidence_level\": 0.95}",
      script: "def simulate_production(capacity, demand, constraints, period):\n    outputs = []\n    utilization = []\n    for month in range(period):\n        output = calculate_monthly_output(capacity, demand[month], constraints)\n        outputs.append(output)\n        utilization.append(output / capacity.total)\n    fulfillment = sum(outputs) / sum(demand)\n    return {'outputs': outputs, 'utilization': utilization, 'fulfillment': fulfillment}"
      ,
      scriptLang: "python"
    }
  },
  {
    skill_id: "risk_assessor_v1",
    name: "产能规划风险评估器",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["risk", "assessment", "capacity", "planning"],
    input_schema: {
      market_risks: "object",
      operational_risks: "object",
      financial_risks: "object",
      mitigation_strategies: "array"
    },
    output_schema: {
      overall_risk_score: "number",
      risk_breakdown: "object",
      high_impact_risks: "array",
      mitigation_recommendations: "array"
    },
    cost: 0.5,
    latency: 1000,
    accuracy_score: 0.87,
    dependencies: [],
    description: "评估产能规划方案的多维度风险（市场、运营、财务），提供风险缓释建议。",
    files: {
      readme: "# Risk Assessor\n\n## 概述\n产能规划风险评估与管理工具。\n\n## 风险维度\n- 市场风险：需求波动、竞争加剧\n- 运营风险：设备故障、人员流失\n- 财务风险：资金压力、汇率波动\n- 政策风险：环保政策、能耗双控\n\n## 输出结果\n- 综合风险评分\n- 高风险项识别\n- 缓释策略建议",
      config: "{\"risk_threshold_low\": 30, \"risk_threshold_high\": 70}",
      script: "def assess_risks(market, operational, financial, strategies):\n    market_score = assess_market_risk(market)\n    operational_score = assess_operational_risk(operational)\n    financial_score = assess_financial_risk(financial)\n    overall = calculate_weighted_risk(market_score, operational_score, financial_score)\n    high_risks = identify_high_impact_risks(market, operational, financial)\n    return {'overall_score': overall, 'breakdown': {'market': market_score, 'operational': operational_score, 'financial': financial_score}, 'high_risks': high_risks, 'recommendations': generate_mitigation_strategies(high_risks)}"
      ,
      scriptLang: "python"
    }
  },

  // ========== 领域层 Domain Skills（锂电制造语义注入） ==========
  {
    skill_id: "domain_equipment_health_assessment",
    name: "设备健康评估Skill",
    version: "1.0.0",
    domain: ["predictive_maintenance"],
    capability_tags: ["health_assessment", "equipment", "lithium_battery"],
    input_schema: {
      oee_data: "object",
      vibration_data: "array",
      temperature_data: "array",
      threshold_config: "object"
    },
    output_schema: {
      health_score: "number",
      health_level: "string",
      anomaly_indicators: "array",
      maintenance_suggestions: "array"
    },
    cost: 0.5,
    latency: 800,
    accuracy_score: 0.90,
    dependencies: ["atom_time_series_forecast", "atom_anomaly_detection"],
    description: "基于OEE、振动、温度等数据，注入锂电设备阈值语义，输出设备健康评分。",
    files: {
      readme: "# 设备健康评估Skill\n\n## 概述\n领域层技能，封装锂电制造设备健康评估行业认知。\n\n## 注入语义\n- OEE阈值：>85%正常，70-85%关注，<70%预警\n- 振动阈值：ISO 10816标准适配锂电设备\n- 温度阈值：轴承<75°C正常，75-85°C关注，>85°C预警\n\n## 依赖原子技能\n- 时序预测 + 异常检测",
      config: "{\"oee_threshold\": {\"normal\": 85, \"warning\": 70}, \"vibration_std\": \"iso_10816\", \"temp_threshold\": {\"normal\": 75, \"warning\": 85}}",
      script: "def health_assessment(oee, vibration, temperature):\n    # 注入锂电设备阈值语义\n    oee_score = calculate_oee_score(oee)\n    vib_score = calculate_vibration_score(vibration)\n    temp_score = calculate_temperature_score(temperature)\n    overall_health = weighted_average([oee_score, vib_score, temp_score])\n    return {'health_score': overall_health, 'level': classify_health(overall_health)}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_rul_prediction",
    name: "RUL预测Skill",
    version: "1.0.0",
    domain: ["predictive_maintenance"],
    capability_tags: ["rul", "prediction", "battery_equipment", "degradation"],
    input_schema: {
      health_history: "array",
      equipment_type: "string",
      operating_conditions: "object",
      degradation_model: "string"
    },
    output_schema: {
      rul_days: "number",
      rul_confidence: "number",
      failure_probability_curve: "array",
      recommended_action: "string"
    },
    cost: 0.6,
    latency: 1000,
    accuracy_score: 0.88,
    dependencies: ["atom_degradation_curve_fitting", "atom_multivariate_regression"],
    description: "基于电芯设备寿命曲线，预测设备剩余使用寿命。",
    files: {
      readme: "# RUL预测Skill\n\n## 概述\n领域层技能，封装锂电设备RUL预测行业认知。\n\n## 注入语义\n- 电芯设备寿命曲线：涂布机5-7年，卷绕机6-8年，化成柜4-6年\n- 退化模型：威布尔分布适配锂电设备退化特性\n\n## 依赖原子技能\n- 退化建模 + 回归预测",
      config: "{\"equipment_lifecycle\": {\"coating\": 6, \"winding\": 7, \"formation\": 5}, \"degradation_model\": \"weibull\"}",
      script: "def predict_rul(health_history, equipment_type, conditions):\n    # 注入电芯设备寿命曲线语义\n    baseline_life = get_baseline_life(equipment_type)\n    degradation_rate = fit_degradation_curve(health_history)\n    rul = calculate_remaining_life(baseline_life, degradation_rate, conditions)\n    return {'rul_days': rul, 'confidence': 0.85}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_mttr_prediction",
    name: "MTTR预测Skill",
    version: "1.0.0",
    domain: ["breakdown_maintenance"],
    capability_tags: ["mttr", "repair_time", "maintenance", "classification"],
    input_schema: {
      fault_code: "string",
      fault_symptoms: "array",
      equipment_model: "string",
      maintenance_history: "array"
    },
    output_schema: {
      estimated_mttr: "number",
      mttr_range: "object",
      required_skills: "array",
      required_spare_parts: "array"
    },
    cost: 0.4,
    latency: 500,
    accuracy_score: 0.87,
    dependencies: ["atom_classification", "atom_multivariate_regression"],
    description: "基于故障类型映射维修时间，预测设备平均修复时间。",
    files: {
      readme: "# MTTR预测Skill\n\n## 概述\n领域层技能，封装故障类型到维修时间的行业映射认知。\n\n## 注入语义\n- 故障类型映射：机械故障2-4h，电气故障1-3h，软件故障0.5-1h\n- 锂电专用故障：极片断裂3-5h，电解液泄漏4-6h，隔膜破损2-3h\n\n## 依赖原子技能\n- 分类 + 回归",
      config: "{\"fault_mttr_map\": {\"mechanical\": 3, \"electrical\": 2, \"software\": 0.75, \"electrode_break\": 4, \"electrolyte_leak\": 5}}",
      script: "def predict_mttr(fault_code, symptoms, equipment_model):\n    # 故障类型分类\n    fault_type = classify_fault(fault_code, symptoms)\n    # 基础MTTR + 调整因子\n    base_mttr = get_base_mttr(fault_type)\n    adjustment = calculate_adjustment(equipment_model)\n    return {'mttr_hours': base_mttr * adjustment}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_spare_part_demand_forecast",
    name: "备件需求预测Skill",
    version: "1.0.0",
    domain: ["breakdown_maintenance"],
    capability_tags: ["spare_part", "demand_forecast", "inventory"],
    input_schema: {
      spare_part_category: "string",
      historical_consumption: "array",
      equipment_count: "number",
      maintenance_plan: "array"
    },
    output_schema: {
      demand_forecast: "array",
      safety_stock_level: "number",
      reorder_point: "number",
      procurement_suggestion: "object"
    },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.89,
    dependencies: ["atom_time_series_forecast"],
    description: "基于备件消耗规律预测备件需求。",
    files: {
      readme: "# 备件需求预测Skill\n\n## 概述\n领域层技能，封装锂电设备备件消耗规律。\n\n## 注入语义\n- 备件消耗规律：易损件月均消耗，关键件故障率驱动\n- 锂电专用：模头垫片、卷针、注液嘴等专用件\n\n## 依赖原子技能\n- 时序预测",
      config: "{\"consumption_pattern\": {\"wearable\": \"monthly\", \"critical\": \"failure_driven\"}}",
      script: "def forecast_spare_parts(category, history, equipment_count):\n    # 注入备件消耗规律\n    base_consumption = time_series_forecast(history)\n    equipment_factor = adjust_by_equipment_count(equipment_count)\n    return {'demand': base_consumption * equipment_factor}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_process_cycle_modeling",
    name: "工序节拍建模Skill",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["cycle_time", "process_modeling", "capacity"],
    input_schema: {
      process_type: "string",
      equipment_parameters: "object",
      product_specifications: "object",
      historical_cycle_data: "array"
    },
    output_schema: {
      cycle_time: "number",
      cycle_time_std: "number",
      hourly_capacity: "number",
      bottleneck_analysis: "object"
    },
    cost: 0.5,
    latency: 700,
    accuracy_score: 0.91,
    dependencies: ["atom_multivariate_regression"],
    description: "基于涂布/辊压等工序特性建模单工序产能。",
    files: {
      readme: "# 工序节拍建模Skill\n\n## 概述\n领域层技能，封装锂电制造工序节拍行业认知。\n\n## 注入语义\n- 涂布节拍：速度m/min × 涂宽 × 面密度系数\n- 辊压节拍：速度m/min × 辊压压力系数\n- 卷绕节拍：ppm × 层数系数\n\n## 依赖原子技能\n- 回归预测",
      config: "{\"coating\": {\"base_speed\": 30, \"width_factor\": 1.0}, \"calendering\": {\"base_speed\": 20, \"pressure_factor\": 0.9}}",
      script: "def model_cycle_time(process_type, params, product_specs):\n    # 注入工序节拍语义\n    base_cycle = get_base_cycle(process_type)\n    param_factors = calculate_param_factors(params, product_specs)\n    return {'cycle_time': base_cycle / param_factors}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_line_balancing",
    name: "产线平衡Skill",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["line_balancing", "optimization", "bottleneck"],
    input_schema: {
      process_steps: "array",
      cycle_times: "object",
      resource_constraints: "object",
      target_takt_time: "number"
    },
    output_schema: {
      balanced_line_config: "object",
      station_count: "number",
      line_efficiency: "number",
      bottleneck_process: "string"
    },
    cost: 0.6,
    latency: 1200,
    accuracy_score: 0.88,
    dependencies: ["atom_multi_objective_optimization"],
    description: "基于工序约束生成产线平衡方案。",
    files: {
      readme: "# 产线平衡Skill\n\n## 概述\n领域层技能，封装锂电产线平衡行业认知。\n\n## 注入语义\n- 工序约束：涂布-辊压-分切-卷绕-装配-化成的串联关系\n- 平衡目标：最小化节拍差，最大化线平衡率\n\n## 依赖原子技能\n- 优化求解",
      config: "{\"line_type\": \"lithium_battery\", \"process_sequence\": [\"coating\", \"calendering\", \"slitting\", \"winding\", \"assembly\", \"formation\"]}",
      script: "def balance_line(steps, cycle_times, constraints, target_takt):\n    # 注入工序约束语义\n    optimization_model = build_balancing_model(steps, cycle_times, constraints)\n    solution = solve_optimization(optimization_model, target_takt)\n    return {'config': solution, 'efficiency': calculate_efficiency(solution)}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_bottleneck_identification",
    name: "瓶颈识别Skill",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["bottleneck", "causal_analysis", "resource_graph"],
    input_schema: {
      resource_graph: "object",
      flow_data: "object",
      utilization_data: "object",
      constraint_rules: "array"
    },
    output_schema: {
      bottleneck_nodes: "array",
      bottleneck_severity: "object",
      throughput_limit: "number",
      improvement_suggestions: "array"
    },
    cost: 0.5,
    latency: 800,
    accuracy_score: 0.89,
    dependencies: ["atom_causal_graph"],
    description: "基于产线资源图谱识别瓶颈节点。",
    files: {
      readme: "# 瓶颈识别Skill\n\n## 概述\n领域层技能，封装锂电产线瓶颈识别行业认知。\n\n## 注入语义\n- 产线资源图谱：设备-工序-物料的关联关系\n- 瓶颈判定：利用率>95%且下游 starving 频繁\n\n## 依赖原子技能\n- 因果传播",
      config: "{\"bottleneck_threshold\": {\"utilization\": 0.95, \"starving_freq\": 0.1}}",
      script: "def identify_bottlenecks(graph, flows, utilization):\n    # 注入产线资源图谱语义\n    causal_effects = propagate_causal_effects(graph, flows)\n    bottlenecks = detect_bottleneck_nodes(utilization, causal_effects)\n    return {'bottlenecks': bottlenecks, 'severity': calculate_severity(bottlenecks)}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_scheduling_optimization",
    name: "排产优化Skill",
    version: "1.0.0",
    domain: ["production_sales_match"],
    capability_tags: ["scheduling", "optimization", "production_planning"],
    input_schema: {
      work_orders: "array",
      process_routing: "object",
      resource_availability: "object",
      priority_rules: "array"
    },
    output_schema: {
      production_schedule: "array",
      resource_allocation: "object",
      makespan: "number",
      delivery_achievement_rate: "number"
    },
    cost: 0.7,
    latency: 2000,
    accuracy_score: 0.87,
    dependencies: ["atom_constraint_expression", "atom_mixed_integer_programming"],
    description: "基于工单/工序关系生成优化排产表。",
    files: {
      readme: "# 排产优化Skill\n\n## 概述\n领域层技能，封装锂电制造排产行业认知。\n\n## 注入语义\n- 工单/工序关系：BOM展开、工序先后顺序\n- 锂电约束：化成柜容量、高温静置时间、换型时间\n\n## 依赖原子技能\n- 约束建模 + 求解",
      config: "{\"constraints\": [\"formation_capacity\", \"aging_time\", \"changeover_time\"], \"objective\": \"min_makespan\"}",
      script: "def optimize_scheduling(orders, routing, resources, priorities):\n    # 注入工单/工序关系语义\n    constraint_model = build_scheduling_model(orders, routing, resources)\n    schedule = solve_constraint_model(constraint_model, priorities)\n    return {'schedule': schedule, 'makespan': calculate_makespan(schedule)}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_yield_ramp_prediction",
    name: "良率爬坡预测Skill",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["yield_ramp", "new_line", "prediction"],
    input_schema: {
      line_type: "string",
      equipment_configuration: "object",
      similar_line_history: "array",
      ramp_target: "number"
    },
    output_schema: {
      ramp_curve: "array",
      time_to_target: "number",
      steady_state_yield: "number",
      key_milestones: "object"
    },
    cost: 0.6,
    latency: 1000,
    accuracy_score: 0.85,
    dependencies: ["atom_time_series_forecast"],
    description: "基于新产线爬坡规律预测达产周期。",
    files: {
      readme: "# 良率爬坡预测Skill\n\n## 概述\n领域层技能，封装新产线良率爬坡行业认知。\n\n## 注入语义\n- 新产线爬坡规律：起步60%，周爬坡3-5%，目标98%\n- 锂电专用：涂布线、卷绕线、Pack线不同爬坡曲线\n\n## 依赖原子技能\n- 时序预测",
      config: "{\"ramp_pattern\": {\"initial\": 0.6, \"weekly_improvement\": 0.04, \"target\": 0.98}}",
      script: "def predict_yield_ramp(line_type, config, history, target):\n    # 注入新产线爬坡规律\n    base_curve = get_historical_ramp_curve(line_type, history)\n    adjusted_curve = adjust_by_configuration(base_curve, config)\n    return {'ramp_curve': adjusted_curve, 'time_to_target': find_time_to_target(adjusted_curve, target)}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_supply_chain_capacity_matching",
    name: "供应链容量匹配Skill",
    version: "1.0.0",
    domain: ["production_sales_match"],
    capability_tags: ["supply_chain", "capacity_matching", "supplier"],
    input_schema: {
      demand_forecast: "array",
      supplier_capacity: "object",
      supplier_reliability: "object",
      matching_constraints: "object"
    },
    output_schema: {
      capacity_gap_analysis: "object",
      matching_risk_level: "string",
      alternative_suppliers: "array",
      procurement_strategy: "object"
    },
    cost: 0.5,
    latency: 800,
    accuracy_score: 0.88,
    dependencies: ["atom_constraint_expression"],
    description: "基于供应商产能评估匹配风险。",
    files: {
      readme: "# 供应链容量匹配Skill\n\n## 概述\n领域层技能，封装供应链容量匹配行业认知。\n\n## 注入语义\n- 供应商产能：正极、负极、电解液、隔膜产能映射\n- 匹配风险：需求>供给时的缺口风险等级\n\n## 依赖原子技能\n- 约束建模",
      config: "{\"material_categories\": [\"cathode\", \"anode\", \"electrolyte\", \"separator\"], \"risk_threshold\": 0.9}",
      script: "def match_capacity(demand, supplier_cap, reliability, constraints):\n    # 注入供应商产能语义\n    gaps = calculate_capacity_gaps(demand, supplier_cap)\n    risks = assess_matching_risks(gaps, reliability)\n    return {'gaps': gaps, 'risk_level': classify_risk(risks)}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "domain_oee_comprehensive_analysis",
    name: "OEE综合分析Skill",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["oee", "analysis", "capacity"],
    input_schema: {
      availability_data: "object",
      performance_data: "object",
      quality_data: "object",
      equipment_hierarchy: "object"
    },
    output_schema: {
      oee_score: "number",
      oee_breakdown: "object",
      capacity_conversion: "number",
      improvement_potential: "array"
    },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.92,
    dependencies: ["atom_probability_distribution_fit"],
    description: "基于稼动率数据计算实际产能。",
    files: {
      readme: "# OEE综合分析Skill\n\n## 概述\n领域层技能，封装OEE分析行业认知。\n\n## 注入语义\n- 稼动率数据：时间稼动×性能稼动×良品率\n- 产能转换：OEE→实际产能的锂电专用换算\n\n## 依赖原子技能\n- 统计建模",
      config: "{\"world_class_oee\": 0.85, \"minimum_acceptable\": 0.6}",
      script: "def analyze_oee(availability, performance, quality, hierarchy):\n    # 注入稼动率数据语义\n    oee = availability * performance * quality\n    actual_capacity = convert_oee_to_capacity(oee, hierarchy)\n    return {'oee': oee, 'actual_capacity': actual_capacity}",
      scriptLang: "python"
    }
  },

  // ========== 场景层 Scenario Skills（业务决策导向） ==========
  // 1️⃣ 设备预测性维护场景
  {
    skill_id: "scenario_predictive_maintenance_decision",
    name: "预测性维护决策Skill",
    version: "1.0.0",
    domain: ["predictive_maintenance"],
    capability_tags: ["predictive_maintenance", "decision", "optimal_window"],
    input_schema: {
      equipment_health: "object",
      rul_prediction: "object",
      production_schedule: "object",
      maintenance_constraints: "object"
    },
    output_schema: {
      optimal_maintenance_window: "object",
      maintenance_priority: "string",
      estimated_downtime: "number",
      cost_benefit_analysis: "object"
    },
    cost: 0.7,
    latency: 1500,
    accuracy_score: 0.89,
    dependencies: ["domain_equipment_health_assessment", "domain_rul_prediction", "domain_scheduling_optimization"],
    description: "综合设备健康、RUL预测和排产，输出最优维修窗口。",
    files: {
      readme: "# 预测性维护决策Skill\n\n## 场景\n设备预测性维护场景\n\n## 依赖领域Skill\n设备健康评估 + RUL预测 + 排产优化\n\n## 最终业务输出\n最优维修窗口",
      config: "{\"decision_factors\": [\"health\", \"rul\", \"production_impact\"]}",
      script: "def maintenance_decision(health, rul, schedule, constraints):\n    # 综合多维度因素\n    health_score = domain_equipment_health_assessment(health)\n    rul_days = domain_rul_prediction(rul)\n    schedule_impact = domain_scheduling_optimization(schedule)\n    optimal_window = find_optimal_window(health_score, rul_days, schedule_impact)\n    return {'optimal_window': optimal_window}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "scenario_downtime_impact_assessment",
    name: "停机影响评估Skill",
    version: "1.0.0",
    domain: ["predictive_maintenance"],
    capability_tags: ["downtime", "impact_assessment", "capacity_loss"],
    input_schema: {
      downtime_scenario: "object",
      oee_analysis: "object",
      bottleneck_info: "object",
      production_plan: "array"
    },
    output_schema: {
      capacity_loss: "number",
      revenue_impact: "number",
      delivery_delay_risk: "array",
      mitigation_options: "array"
    },
    cost: 0.6,
    latency: 1000,
    accuracy_score: 0.88,
    dependencies: ["domain_oee_comprehensive_analysis", "domain_bottleneck_identification"],
    description: "评估停机对产能和交付的影响。",
    files: {
      readme: "# 停机影响评估Skill\n\n## 场景\n设备预测性维护场景\n\n## 依赖领域Skill\nOEE分析 + 瓶颈识别\n\n## 输出\n产能损失",
      config: "{}",
      script: "def assess_downtime_impact(scenario, oee, bottleneck, plan):\n    oee_data = domain_oee_comprehensive_analysis(oee)\n    bottleneck_data = domain_bottleneck_identification(bottleneck)\n    loss = calculate_capacity_loss(scenario, oee_data, bottleneck_data)\n    return {'capacity_loss': loss}",
      scriptLang: "python"
    }
  },

  // 2️⃣ 设备故障维修时间预测场景
  {
    skill_id: "scenario_repair_time_decision",
    name: "维修时间预测决策Skill",
    version: "1.0.0",
    domain: ["breakdown_maintenance"],
    capability_tags: ["repair_time", "decision", "scheduling"],
    input_schema: {
      fault_info: "object",
      mttr_prediction: "object",
      resource_availability: "object",
      repair_constraints: "object"
    },
    output_schema: {
      repair_schedule: "object",
      estimated_completion: "string",
      resource_allocation: "object",
      alternative_plans: "array"
    },
    cost: 0.6,
    latency: 800,
    accuracy_score: 0.87,
    dependencies: ["domain_mttr_prediction"],
    description: "基于MTTR预测生成维修排期。",
    files: {
      readme: "# 维修时间预测决策Skill\n\n## 场景\n设备故障维修时间预测\n\n## 依赖领域Skill\nMTTR预测 + 维修资源匹配\n\n## 输出\n维修排期",
      config: "{}",
      script: "def repair_time_decision(fault, mttr, resources, constraints):\n    mttr_data = domain_mttr_prediction(mttr)\n    schedule = generate_repair_schedule(mttr_data, resources)\n    return {'repair_schedule': schedule}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "scenario_repair_impact_simulation",
    name: "维修影响仿真Skill",
    version: "1.0.0",
    domain: ["breakdown_maintenance"],
    capability_tags: ["simulation", "impact", "delivery"],
    input_schema: {
      repair_scenario: "object",
      production_schedule: "object",
      customer_orders: "array"
    },
    output_schema: {
      delivery_impact: "object",
      order_delay_risk: "array",
      recovery_plan: "object",
      customer_notification: "array"
    },
    cost: 0.7,
    latency: 1200,
    accuracy_score: 0.86,
    dependencies: ["atom_monte_carlo_simulation", "domain_scheduling_optimization"],
    description: "仿真推演维修对交付的影响。",
    files: {
      readme: "# 维修影响仿真Skill\n\n## 场景\n设备故障维修时间预测\n\n## 依赖领域Skill\n仿真推演 + 排产优化\n\n## 输出\n交付影响",
      config: "{}",
      script: "def simulate_repair_impact(scenario, schedule, orders):\n    impact = monte_carlo_simulation(scenario, schedule, orders)\n    return {'delivery_impact': impact}",
      scriptLang: "python"
    }
  },

  // 3️⃣ 产销匹配协同场景
  {
    skill_id: "scenario_demand_capacity_matching",
    name: "需求-产能匹配Skill",
    version: "1.0.0",
    domain: ["production_sales_match"],
    capability_tags: ["demand_capacity", "matching", "sop"],
    input_schema: {
      demand_forecast: "object",
      capacity_assessment: "object",
      inventory_status: "object",
      matching_constraints: "object"
    },
    output_schema: {
      match_rate: "number",
      gap_analysis: "object",
      balance_scenarios: "array",
      recommended_actions: "array"
    },
    cost: 0.7,
    latency: 1500,
    accuracy_score: 0.88,
    dependencies: ["atom_time_series_forecast", "domain_scheduling_optimization"],
    description: "评估需求与产能的匹配度。",
    files: {
      readme: "# 需求-产能匹配Skill\n\n## 场景\n产销匹配协同\n\n## 依赖领域Skill\n需求预测 + 排产优化\n\n## 输出\n供需匹配率",
      config: "{}",
      script: "def match_demand_capacity(demand, capacity, inventory, constraints):\n    match_result = calculate_match_rate(demand, capacity)\n    return {'match_rate': match_result}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "scenario_inventory_optimization_decision",
    name: "库存优化决策Skill",
    version: "1.0.0",
    domain: ["production_sales_match"],
    capability_tags: ["inventory", "optimization", "strategy"],
    input_schema: {
      demand_variability: "object",
      supply_leadtime: "object",
      cost_structure: "object",
      service_level_target: "number"
    },
    output_schema: {
      safety_stock_strategy: "object",
      reorder_strategy: "object",
      inventory_turnover_target: "number",
      working_capital_impact: "number"
    },
    cost: 0.6,
    latency: 1000,
    accuracy_score: 0.89,
    dependencies: ["atom_inventory_model", "atom_dcf_calculation"],
    description: "制定库存优化策略。",
    files: {
      readme: "# 库存优化决策Skill\n\n## 场景\n产销匹配协同\n\n## 依赖领域Skill\n安全库存模型 + 财务测算\n\n## 输出\n库存策略",
      config: "{}",
      script: "def inventory_decision(demand, leadtime, costs, service_level):\n    strategy = optimize_inventory(demand, leadtime, costs, service_level)\n    return {'strategy': strategy}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "scenario_production_sales_deviation_alert",
    name: "产销偏差预警Skill",
    version: "1.0.0",
    domain: ["production_sales_match"],
    capability_tags: ["deviation", "alert", "early_warning"],
    input_schema: {
      production_actual: "array",
      sales_actual: "array",
      deviation_threshold: "number",
      alert_rules: "array"
    },
    output_schema: {
      deviation_level: "string",
      alert_triggers: "array",
      root_cause: "object",
      corrective_actions: "array"
    },
    cost: 0.4,
    latency: 500,
    accuracy_score: 0.90,
    dependencies: ["atom_anomaly_detection"],
    description: "监测产销偏差并预警。",
    files: {
      readme: "# 产销偏差预警Skill\n\n## 场景\n产销匹配协同\n\n## 依赖领域Skill\n偏差监测\n\n## 输出\n风险预警",
      config: "{}",
      script: "def deviation_alert(production, sales, threshold, rules):\n    deviation = detect_deviation(production, sales, threshold)\n    return {'deviation_level': deviation}",
      scriptLang: "python"
    }
  },

  // 4️⃣ 新项目落地推演分析场景
  {
    skill_id: "scenario_new_line_investment",
    name: "新产线投资推演Skill",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["investment", "new_line", "roi"],
    input_schema: {
      investment_params: "object",
      yield_ramp_forecast: "object",
      financial_model: "object",
      risk_factors: "array"
    },
    output_schema: {
      roi_projection: "object",
      payback_period: "number",
      npv_irr: "object",
      sensitivity_analysis: "object"
    },
    cost: 0.8,
    latency: 2000,
    accuracy_score: 0.85,
    dependencies: ["domain_yield_ramp_prediction", "atom_dcf_calculation"],
    description: "推演新产线投资回报。",
    files: {
      readme: "# 新产线投资推演Skill\n\n## 场景\n新项目落地推演分析\n\n## 依赖领域Skill\n良率爬坡 + 财务测算\n\n## 输出\nROI",
      config: "{}",
      script: "def new_line_investment(params, yield_ramp, financial, risks):\n    ramp_data = domain_yield_ramp_prediction(yield_ramp)\n    roi = calculate_roi(params, ramp_data, financial, risks)\n    return {'roi': roi}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "scenario_multi_option_comparison",
    name: "多方案对比决策Skill",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["comparison", "decision", "site_selection"],
    input_schema: {
      alternatives: "array",
      evaluation_criteria: "object",
      simulation_config: "object"
    },
    output_schema: {
      ranking: "array",
      best_option: "object",
      trade_off_analysis: "object",
      decision_rationale: "string"
    },
    cost: 0.7,
    latency: 1800,
    accuracy_score: 0.87,
    dependencies: ["atom_monte_carlo_simulation", "atom_probability_distribution_fit"],
    description: "多方案对比选择最优选址。",
    files: {
      readme: "# 多方案对比决策Skill\n\n## 场景\n新项目落地推演分析\n\n## 依赖领域Skill\n仿真推演 + 风险概率\n\n## 输出\n最优选址",
      config: "{}",
      script: "def compare_options(alternatives, criteria, config):\n    comparison = monte_carlo_simulation(alternatives, criteria)\n    return {'best_option': comparison.best}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "scenario_supply_chain_risk_assessment",
    name: "供应链风险评估Skill",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["supply_chain", "risk_assessment", "new_project"],
    input_schema: {
      supplier_landscape: "object",
      capacity_matching: "object",
      risk_model: "object"
    },
    output_schema: {
      overall_risk_level: "string",
      risk_breakdown: "object",
      mitigation_strategies: "array",
      contingency_plans: "array"
    },
    cost: 0.6,
    latency: 1000,
    accuracy_score: 0.88,
    dependencies: ["domain_supply_chain_capacity_matching", "atom_probability_distribution_fit"],
    description: "评估新项目供应链风险等级。",
    files: {
      readme: "# 供应链风险评估Skill\n\n## 场景\n新项目落地推演分析\n\n## 依赖领域Skill\n容量匹配 + 风险模型\n\n## 输出\n风险等级",
      config: "{}",
      script: "def assess_supply_chain_risk(suppliers, capacity, risk_model):\n    capacity_data = domain_supply_chain_capacity_matching(capacity)\n    risk = calculate_risk(capacity_data, risk_model)\n    return {'risk_level': risk}",
      scriptLang: "python"
    }
  },

  // 5️⃣ 产能评估推演预测场景
  {
    skill_id: "scenario_future_capacity_prediction",
    name: "未来产能预测Skill",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["capacity", "prediction", "monthly"],
    input_schema: {
      process_cycle_models: "array",
      oee_forecast: "object",
      constraint_analysis: "object",
      planning_horizon: "number"
    },
    output_schema: {
      monthly_capacity: "array",
      capacity_trends: "object",
      bottleneck_forecast: "array",
      confidence_intervals: "object"
    },
    cost: 0.7,
    latency: 1200,
    accuracy_score: 0.86,
    dependencies: ["domain_process_cycle_modeling", "domain_oee_comprehensive_analysis"],
    description: "预测月度产能。",
    files: {
      readme: "# 未来产能预测Skill\n\n## 场景\n产能评估推演预测\n\n## 依赖领域Skill\n工序节拍建模 + OEE分析\n\n## 输出\n月度产能",
      config: "{}",
      script: "def predict_future_capacity(cycles, oee, constraints, horizon):\n    cycle_data = domain_process_cycle_modeling(cycles)\n    oee_data = domain_oee_comprehensive_analysis(oee)\n    capacity = calculate_monthly_capacity(cycle_data, oee_data)\n    return {'monthly_capacity': capacity}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "scenario_expansion_benefit",
    name: "扩产收益推演Skill",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["expansion", "benefit", "irr"],
    input_schema: {
      expansion_scenario: "object",
      financial_params: "object",
      simulation_model: "object"
    },
    output_schema: {
      irr: "number",
      npv: "number",
      payback: "number",
      sensitivity: "object"
    },
    cost: 0.7,
    latency: 1500,
    accuracy_score: 0.85,
    dependencies: ["atom_dcf_calculation", "atom_monte_carlo_simulation"],
    description: "推演扩产IRR。",
    files: {
      readme: "# 扩产收益推演Skill\n\n## 场景\n产能评估推演预测\n\n## 依赖领域Skill\n财务测算 + 仿真推演\n\n## 输出\nIRR",
      config: "{}",
      script: "def expansion_benefit(scenario, financial, model):\n    irr = calculate_irr(scenario, financial, model)\n    return {'irr': irr}",
      scriptLang: "python"
    }
  },
  {
    skill_id: "scenario_constraint_bottleneck",
    name: "约束瓶颈推演Skill",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction"],
    capability_tags: ["constraint", "bottleneck", "capacity_limit"],
    input_schema: {
      resource_topology: "object",
      causal_model: "object",
      demand_scenarios: "array"
    },
    output_schema: {
      capacity_ceiling: "number",
      limiting_constraints: "array",
      bottleneck_evolution: "array",
      relaxation_options: "array"
    },
    cost: 0.6,
    latency: 1000,
    accuracy_score: 0.87,
    dependencies: ["domain_bottleneck_identification", "atom_causal_graph"],
    description: "推演产能上限。",
    files: {
      readme: "# 约束瓶颈推演Skill\n\n## 场景\n产能评估推演预测\n\n## 依赖领域Skill\n因果传播 + 约束建模\n\n## 输出\n产能上限",
      config: "{}",
      script: "def constraint_bottleneck(topology, causal, demands):\n    bottleneck = domain_bottleneck_identification(topology)\n    ceiling = calculate_capacity_ceiling(bottleneck, causal, demands)\n    return {'capacity_ceiling': ceiling}",
      scriptLang: "python"
    }
  },

  // ========== 原子层基础算法技能 ==========
  {
    skill_id: "atom_time_series_forecast",
    name: "时间序列预测",
    version: "1.0.0",
    domain: ["predictive_maintenance", "production_sales_match", "capacity_assessment_prediction"],
    capability_tags: ["forecast", "time_series", "trend", "seasonality"],
    input_schema: { historical_data: "array", forecast_horizon: "number", seasonality: "boolean" },
    output_schema: { forecast_values: "array", confidence_intervals: "array", trend: "string" },
    cost: 0.3,
    latency: 500,
    accuracy_score: 0.88,
    dependencies: [],
    description: "基于历史时间序列数据预测未来趋势，支持趋势分解和季节性调整。",
    files: { readme: "# Time Series Forecast\n\n时序预测基础算法。", config: "{}", script: "def forecast(data, horizon, seasonality): return {'forecast': [], 'trend': 'up'}", scriptLang: "python" }
  },
  {
    skill_id: "atom_anomaly_detection",
    name: "异常检测",
    version: "1.0.0",
    domain: ["predictive_maintenance", "quality_control"],
    capability_tags: ["anomaly", "outlier", "statistics", "ml"],
    input_schema: { data: "array", threshold: "number", method: "string" },
    output_schema: { anomalies: "array", anomaly_scores: "array", threshold_used: "number" },
    cost: 0.2,
    latency: 200,
    accuracy_score: 0.90,
    dependencies: [],
    description: "识别数据中的异常点和离群值，支持统计方法和机器学习方法。",
    files: { readme: "# Anomaly Detection\n\n异常检测算法。", config: "{}", script: "def detect_anomalies(data, threshold): return {'anomalies': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_change_point_detection",
    name: "变点检测",
    version: "1.0.0",
    domain: ["predictive_maintenance"],
    capability_tags: ["change_point", "segmentation", "statistics"],
    input_schema: { time_series: "array", penalty: "number", min_segment_length: "number" },
    output_schema: { change_points: "array", segments: "array", confidence_scores: "array" },
    cost: 0.3,
    latency: 300,
    accuracy_score: 0.85,
    dependencies: [],
    description: "检测时间序列中的突变点和状态转换点。",
    files: { readme: "# Change Point Detection", config: "{}", script: "def detect(data): return {'change_points': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_degradation_curve_fitting",
    name: "退化曲线拟合",
    version: "1.0.0",
    domain: ["predictive_maintenance"],
    capability_tags: ["degradation", "curve_fitting", "reliability"],
    input_schema: { health_indicators: "array", time_points: "array", model_type: "string" },
    output_schema: { fitted_curve: "array", parameters: "object", r_squared: "number" },
    cost: 0.4,
    latency: 400,
    accuracy_score: 0.87,
    dependencies: [],
    description: "拟合设备健康指标的退化曲线，支持指数、线性和威布尔模型。",
    files: { readme: "# Degradation Curve", config: "{}", script: "def fit(data, times): return {'curve': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_remaining_useful_life",
    name: "剩余寿命估计",
    version: "1.0.0",
    domain: ["predictive_maintenance"],
    capability_tags: ["rul", "prognostics", "reliability"],
    input_schema: { current_health: "number", degradation_model: "object", failure_threshold: "number" },
    output_schema: { rul_estimate: "number", confidence_interval: "object", failure_probability: "array" },
    cost: 0.5,
    latency: 500,
    accuracy_score: 0.86,
    dependencies: ["atom_degradation_curve_fitting"],
    description: "基于退化模型估计设备的剩余使用寿命。",
    files: { readme: "# RUL Estimation", config: "{}", script: "def estimate_rul(health, model): return {'rul': 100}", scriptLang: "python" }
  },
  {
    skill_id: "atom_feature_importance",
    name: "特征重要性计算",
    version: "1.0.0",
    domain: ["predictive_maintenance", "demand_forecast"],
    capability_tags: ["feature_importance", "shap", "permutation"],
    input_schema: { model: "object", features: "array", target: "array", method: "string" },
    output_schema: { importance_scores: "object", ranked_features: "array", shap_values: "array" },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.89,
    dependencies: [],
    description: "计算特征对模型预测的重要性，支持SHAP、Permutation等方法。",
    files: { readme: "# Feature Importance", config: "{}", script: "def calc_importance(model, X, y): return {'scores': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_threshold_decision",
    name: "阈值判定算法",
    version: "1.0.0",
    domain: ["predictive_maintenance", "quality_control"],
    capability_tags: ["threshold", "decision", "classification"],
    input_schema: { value: "number", thresholds: "object", rules: "array" },
    output_schema: { decision: "string", alert_level: "string", action_required: "boolean" },
    cost: 0.1,
    latency: 50,
    accuracy_score: 0.95,
    dependencies: [],
    description: "基于阈值规则进行判定和分级预警。",
    files: { readme: "# Threshold Decision", config: "{}", script: "def decide(value, thresholds): return {'decision': 'normal'}", scriptLang: "python" }
  },
  {
    skill_id: "atom_probability_distribution_fit",
    name: "概率分布拟合",
    version: "1.0.0",
    domain: ["predictive_maintenance", "new_project_planning", "inventory_optimization"],
    capability_tags: ["distribution", "fitting", "mle", "kde"],
    input_schema: { data: "array", distributions: "array", method: "string" },
    output_schema: { best_fit: "object", parameters: "object", goodness_of_fit: "object" },
    cost: 0.3,
    latency: 400,
    accuracy_score: 0.88,
    dependencies: [],
    description: "拟合数据的最佳概率分布模型，支持正态、对数正态、威布尔等分布。",
    files: { readme: "# Distribution Fitting", config: "{}", script: "def fit_dist(data): return {'best_fit': 'normal'}", scriptLang: "python" }
  },
  {
    skill_id: "atom_classification",
    name: "分类识别",
    version: "1.0.0",
    domain: ["breakdown_maintenance", "quality_control"],
    capability_tags: ["classification", "supervised", "ml"],
    input_schema: { features: "array", labels: "array", new_data: "array", algorithm: "string" },
    output_schema: { predictions: "array", probabilities: "array", confidence: "array" },
    cost: 0.3,
    latency: 300,
    accuracy_score: 0.90,
    dependencies: [],
    description: "基于特征数据进行分类预测，支持多种机器学习算法。",
    files: { readme: "# Classification", config: "{}", script: "def classify(X, y, new_X): return {'predictions': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_multivariate_regression",
    name: "多变量回归预测",
    version: "1.0.0",
    domain: ["breakdown_maintenance", "demand_forecast"],
    capability_tags: ["regression", "multivariate", "prediction"],
    input_schema: { X: "array", y: "array", X_new: "array", regularization: "string" },
    output_schema: { predictions: "array", coefficients: "object", r_squared: "number" },
    cost: 0.3,
    latency: 400,
    accuracy_score: 0.87,
    dependencies: [],
    description: "基于多变量输入进行回归预测，支持线性、岭回归、Lasso等方法。",
    files: { readme: "# Multivariate Regression", config: "{}", script: "def regress(X, y, X_new): return {'predictions': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_clustering",
    name: "聚类分析",
    version: "1.0.0",
    domain: ["breakdown_maintenance", "new_project_planning"],
    capability_tags: ["clustering", "unsupervised", "segmentation"],
    input_schema: { data: "array", n_clusters: "number", algorithm: "string" },
    output_schema: { labels: "array", cluster_centers: "array", inertia: "number" },
    cost: 0.3,
    latency: 500,
    accuracy_score: 0.85,
    dependencies: [],
    description: "对数据进行无监督聚类分组，支持K-Means、DBSCAN等算法。",
    files: { readme: "# Clustering", config: "{}", script: "def cluster(data, k): return {'labels': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_resource_allocation",
    name: "资源分配算法",
    version: "1.0.0",
    domain: ["breakdown_maintenance", "profit_simulation"],
    capability_tags: ["allocation", "optimization", "scheduling"],
    input_schema: { resources: "object", demands: "array", constraints: "object", objective: "string" },
    output_schema: { allocation_plan: "object", utilization_rate: "number", unmet_demands: "array" },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.88,
    dependencies: [],
    description: "优化分配有限资源以满足多目标需求。",
    files: { readme: "# Resource Allocation", config: "{}", script: "def allocate(resources, demands): return {'plan': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_queuing_theory",
    name: "排队论计算",
    version: "1.0.0",
    domain: ["breakdown_maintenance", "capacity_assessment_prediction"],
    capability_tags: ["queuing", "stochastic", "waiting_time"],
    input_schema: { arrival_rate: "number", service_rate: "number", servers: "number", capacity: "number" },
    output_schema: { utilization: "number", avg_wait_time: "number", queue_length: "number", prob_wait: "number" },
    cost: 0.2,
    latency: 150,
    accuracy_score: 0.92,
    dependencies: [],
    description: "基于排队论计算系统性能指标（等待时间、利用率等）。",
    files: { readme: "# Queuing Theory", config: "{}", script: "def queue(arrival, service, servers): return {'wait_time': 0}", scriptLang: "python" }
  },
  {
    skill_id: "atom_shortest_path",
    name: "路径最短算法",
    version: "1.0.0",
    domain: ["breakdown_maintenance", "logistics_optimization"],
    capability_tags: ["shortest_path", "graph", "dijkstra", "a_star"],
    input_schema: { graph: "object", start: "string", end: "string", algorithm: "string" },
    output_schema: { path: "array", distance: "number", visited_nodes: "array" },
    cost: 0.2,
    latency: 100,
    accuracy_score: 0.95,
    dependencies: [],
    description: "在图中找到最短路径，支持Dijkstra、A*等算法。",
    files: { readme: "# Shortest Path", config: "{}", script: "def shortest_path(graph, start, end): return {'path': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_linear_programming",
    name: "线性规划求解",
    version: "1.0.0",
    domain: ["production_sales_match", "capacity_assessment_prediction", "profit_simulation"],
    capability_tags: ["linear_programming", "optimization", "simplex"],
    input_schema: { objective: "object", constraints: "array", bounds: "object", method: "string" },
    output_schema: { optimal_value: "number", solution: "object", status: "string", shadow_prices: "object" },
    cost: 0.4,
    latency: 800,
    accuracy_score: 0.93,
    dependencies: [],
    description: "求解线性规划问题，支持单纯形法和内点法。",
    files: { readme: "# Linear Programming", config: "{}", script: "def solve_lp(objective, constraints): return {'optimal': 0}", scriptLang: "python" }
  },
  {
    skill_id: "atom_mixed_integer_programming",
    name: "混合整数规划求解",
    version: "1.0.0",
    domain: ["production_sales_match", "master_production_schedule", "rush_order_management"],
    capability_tags: ["mip", "integer", "branch_and_bound", "optimization"],
    input_schema: { objective: "object", constraints: "array", integer_vars: "array", binary_vars: "array" },
    output_schema: { optimal_value: "number", solution: "object", status: "string", gap: "number" },
    cost: 0.6,
    latency: 2000,
    accuracy_score: 0.91,
    dependencies: ["atom_linear_programming"],
    description: "求解混合整数规划问题，适用于排程、选址等离散决策问题。",
    files: { readme: "# Mixed Integer Programming", config: "{}", script: "def solve_mip(obj, cons, int_vars): return {'optimal': 0}", scriptLang: "python" }
  },
  {
    skill_id: "atom_multi_objective_optimization",
    name: "多目标优化",
    version: "1.0.0",
    domain: ["production_sales_match", "new_project_planning", "rush_order_management", "profit_simulation"],
    capability_tags: ["multi_objective", "pareto", "nsga2", "optimization"],
    input_schema: { objectives: "array", constraints: "array", weights: "array", method: "string" },
    output_schema: { pareto_front: "array", solutions: "array", selected_solution: "object" },
    cost: 0.7,
    latency: 3000,
    accuracy_score: 0.89,
    dependencies: [],
    description: "求解多目标优化问题，生成Pareto前沿解集。",
    files: { readme: "# Multi-Objective Optimization", config: "{}", script: "def optimize_multi(obj, cons): return {'pareto': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_inventory_model",
    name: "库存模型计算",
    version: "1.0.0",
    domain: ["production_sales_match", "inventory_optimization"],
    capability_tags: ["inventory", "eoq", "newsvendor", "safety_stock"],
    input_schema: { demand_params: "object", cost_params: "object", lead_time: "number", service_level: "number" },
    output_schema: { reorder_point: "number", order_quantity: "number", safety_stock: "number", total_cost: "number" },
    cost: 0.3,
    latency: 300,
    accuracy_score: 0.90,
    dependencies: [],
    description: "计算最优库存策略，支持EOQ、报童模型、安全库存计算。",
    files: { readme: "# Inventory Model", config: "{}", script: "def calc_inventory(demand, costs): return {'reorder_point': 0}", scriptLang: "python" }
  },
  {
    skill_id: "atom_network_flow",
    name: "网络流计算",
    version: "1.0.0",
    domain: ["production_sales_match", "master_production_schedule", "supplier_collaboration"],
    capability_tags: ["network_flow", "min_cost_flow", "max_flow", "transportation"],
    input_schema: { network: "object", source: "string", sink: "string", supplies: "object", demands: "object" },
    output_schema: { flow: "object", total_cost: "number", feasible: "boolean", bottleneck_edges: "array" },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.91,
    dependencies: [],
    description: "求解网络流问题，支持最小费用流和最大流算法。",
    files: { readme: "# Network Flow", config: "{}", script: "def solve_flow(network, source, sink): return {'flow': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_constraint_expression",
    name: "约束表达",
    version: "1.0.0",
    domain: ["production_sales_match", "capacity_constraint_rules", "what_if_simulation"],
    capability_tags: ["constraint", "csp", "satisfaction"],
    input_schema: { variables: "array", domains: "object", constraints: "array" },
    output_schema: { feasible: "boolean", solutions: "array", constraint_violations: "array" },
    cost: 0.2,
    latency: 200,
    accuracy_score: 0.94,
    dependencies: [],
    description: "表达和验证约束条件，支持约束满足问题求解。",
    files: { readme: "# Constraint Expression", config: "{}", script: "def check_constraints(vars, cons): return {'feasible': True}", scriptLang: "python" }
  },
  {
    skill_id: "atom_monte_carlo_simulation",
    name: "蒙特卡洛仿真",
    version: "1.0.0",
    domain: ["production_sales_match", "new_project_planning", "inventory_optimization", "sales_operations_planning", "what_if_simulation"],
    capability_tags: ["simulation", "monte_carlo", "random_sampling", "uncertainty"],
    input_schema: { model: "object", distributions: "object", n_samples: "number", seed: "number" },
    output_schema: { results: "array", statistics: "object", confidence_intervals: "object", histogram: "object" },
    cost: 0.5,
    latency: 1500,
    accuracy_score: 0.88,
    dependencies: [],
    description: "基于随机采样的蒙特卡洛仿真，用于不确定性分析和风险评估。",
    files: { readme: "# Monte Carlo Simulation", config: "{}", script: "def monte_carlo(model, dists, n): return {'results': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_bayesian_update",
    name: "贝叶斯更新",
    version: "1.0.0",
    domain: ["new_project_planning", "demand_forecast", "inventory_optimization"],
    capability_tags: ["bayesian", "posterior", "prior", "update"],
    input_schema: { prior: "object", likelihood: "object", observations: "array" },
    output_schema: { posterior: "object", posterior_predictive: "object", credibility_interval: "object" },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.89,
    dependencies: [],
    description: "基于观测数据更新贝叶斯后验分布，支持概率推断。",
    files: { readme: "# Bayesian Update", config: "{}", script: "def bayesian_update(prior, likelihood, obs): return {'posterior': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_dcf_calculation",
    name: "现金流折现计算",
    version: "1.0.0",
    domain: ["new_project_planning", "profit_simulation"],
    capability_tags: ["dcf", "npv", "irr", "payback", "finance"],
    input_schema: { cash_flows: "array", discount_rate: "number", initial_investment: "number" },
    output_schema: { npv: "number", irr: "number", payback_period: "number", pi: "number" },
    cost: 0.2,
    latency: 100,
    accuracy_score: 0.95,
    dependencies: [],
    description: "计算投资项目的NPV、IRR、投资回收期等财务指标。",
    files: { readme: "# DCF Calculation", config: "{}", script: "def dcf(cash_flows, rate): return {'npv': 0}", scriptLang: "python" }
  },
  {
    skill_id: "atom_cost_structure",
    name: "成本结构分解",
    version: "1.0.0",
    domain: ["new_project_planning"],
    capability_tags: ["cost", "breakdown", "capex", "opex"],
    input_schema: { total_cost: "number", cost_categories: "array", allocation_rules: "object" },
    output_schema: { cost_breakdown: "object", fixed_costs: "number", variable_costs: "number", unit_cost: "number" },
    cost: 0.2,
    latency: 150,
    accuracy_score: 0.92,
    dependencies: [],
    description: "分解成本结构，区分固定成本和变动成本。",
    files: { readme: "# Cost Structure", config: "{}", script: "def breakdown_costs(total, categories): return {'breakdown': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_sensitivity_analysis",
    name: "参数敏感性分析",
    version: "1.0.0",
    domain: ["new_project_planning", "sales_operations_planning", "what_if_simulation"],
    capability_tags: ["sensitivity", "tornado", "what_if", "parameter"],
    input_schema: { base_case: "object", parameters: "array", variation_range: "number", model: "object" },
    output_schema: { sensitivity_scores: "object", tornado_data: "array", spider_data: "object", critical_params: "array" },
    cost: 0.4,
    latency: 800,
    accuracy_score: 0.90,
    dependencies: [],
    description: "分析模型输出对各输入参数的敏感程度，生成龙卷风图。",
    files: { readme: "# Sensitivity Analysis", config: "{}", script: "def sensitivity(base, params): return {'scores': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_load_simulation",
    name: "负荷模拟",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction", "rush_order_management"],
    capability_tags: ["load", "simulation", "capacity", "stress_test"],
    input_schema: { capacity_limits: "object", demand_scenarios: "array", time_periods: "array" },
    output_schema: { load_distribution: "array", bottleneck_periods: "array", utilization_forecast: "array", overload_risk: "number" },
    cost: 0.4,
    latency: 700,
    accuracy_score: 0.87,
    dependencies: [],
    description: "模拟不同负荷情景下的产能表现，识别瓶颈时段。",
    files: { readme: "# Load Simulation", config: "{}", script: "def simulate_load(capacity, demands): return {'load': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_constraint_programming",
    name: "约束规划求解",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction", "master_production_schedule"],
    capability_tags: ["constraint_programming", "cp_sat", "scheduling"],
    input_schema: { variables: "array", domains: "object", constraints: "array", objective: "object" },
    output_schema: { solution: "object", objective_value: "number", solve_time: "number", status: "string" },
    cost: 0.5,
    latency: 1000,
    accuracy_score: 0.91,
    dependencies: [],
    description: "使用约束编程求解组合优化问题，适用于复杂排程场景。",
    files: { readme: "# Constraint Programming", config: "{}", script: "def solve_cp(vars, cons): return {'solution': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_causal_graph",
    name: "因果图推理",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction", "demand_forecast", "rush_order_management", "change_management", "abnormal_alert", "kpi_monitoring"],
    capability_tags: ["causal", "graph", "reasoning", "do_calculus"],
    input_schema: { causal_graph: "object", interventions: "array", observations: "object", target: "string" },
    output_schema: { causal_effects: "object", counterfactuals: "object", confounders: "array", recommendations: "array" },
    cost: 0.6,
    latency: 1200,
    accuracy_score: 0.86,
    dependencies: [],
    description: "基于因果图进行推理，支持干预效果估计和反事实分析。",
    files: { readme: "# Causal Graph", config: "{}", script: "def causal_inference(graph, interventions): return {'effects': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_graph_path_search",
    name: "图路径搜索",
    version: "1.0.0",
    domain: ["capacity_assessment_prediction", "master_production_schedule"],
    capability_tags: ["graph", "path", "search", "bfs", "dfs"],
    input_schema: { graph: "object", start: "string", goal: "string", algorithm: "string", constraints: "object" },
    output_schema: { path: "array", path_length: "number", alternatives: "array", visited: "array" },
    cost: 0.3,
    latency: 300,
    accuracy_score: 0.93,
    dependencies: [],
    description: "在图中搜索可行路径，支持BFS、DFS、A*等算法。",
    files: { readme: "# Graph Path Search", config: "{}", script: "def search_path(graph, start, goal): return {'path': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_feature_selection",
    name: "特征选择算法",
    version: "1.0.0",
    domain: ["demand_forecast"],
    capability_tags: ["feature_selection", "dimensionality", "rfe", "lasso"],
    input_schema: { features: "array", target: "array", method: "string", n_features: "number" },
    output_schema: { selected_features: "array", feature_scores: "object", ranking: "array", support: "array" },
    cost: 0.3,
    latency: 500,
    accuracy_score: 0.88,
    dependencies: [],
    description: "选择最相关的特征子集，支持过滤法、包装法、嵌入法。",
    files: { readme: "# Feature Selection", config: "{}", script: "def select_features(X, y, method): return {'selected': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_trend_decomposition",
    name: "趋势分解算法",
    version: "1.0.0",
    domain: ["demand_forecast", "kpi_monitoring"],
    capability_tags: ["decomposition", "trend", "seasonal", "residual"],
    input_schema: { time_series: "array", period: "number", model: "string" },
    output_schema: { trend: "array", seasonal: "array", residual: "array", components: "object" },
    cost: 0.3,
    latency: 400,
    accuracy_score: 0.90,
    dependencies: [],
    description: "将时间序列分解为趋势、季节性和残差成分。",
    files: { readme: "# Trend Decomposition", config: "{}", script: "def decompose(ts, period): return {'trend': [], 'seasonal': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_probability_scoring",
    name: "概率评分模型",
    version: "1.0.0",
    domain: ["sales_operations_planning", "abnormal_alert"],
    capability_tags: ["scoring", "probability", "risk", "classification"],
    input_schema: { features: "object", model_weights: "object", thresholds: "object" },
    output_schema: { score: "number", probability: "number", risk_level: "string", factors: "array" },
    cost: 0.2,
    latency: 100,
    accuracy_score: 0.89,
    dependencies: [],
    description: "基于概率模型的评分系统，用于风险评估和等级划分。",
    files: { readme: "# Probability Scoring", config: "{}", script: "def score_probability(features, weights): return {'score': 0.5}", scriptLang: "python" }
  },
  {
    skill_id: "atom_rule_engine",
    name: "规则引擎执行",
    version: "1.0.0",
    domain: ["master_production_schedule", "change_management", "kpi_monitoring"],
    capability_tags: ["rules", "engine", "inference", "drools"],
    input_schema: { facts: "object", rules: "array", agenda: "array" },
    output_schema: { fired_rules: "array", actions: "array", output_facts: "object", execution_trace: "array" },
    cost: 0.1,
    latency: 50,
    accuracy_score: 0.96,
    dependencies: [],
    description: "执行规则引擎，基于事实和规则进行推理和决策。",
    files: { readme: "# Rule Engine", config: "{}", script: "def execute_rules(facts, rules): return {'fired': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_bottleneck_detection",
    name: "瓶颈识别算法",
    version: "1.0.0",
    domain: ["capacity_constraint_rules"],
    capability_tags: ["bottleneck", "constraint", "toc", "throughput"],
    input_schema: { process_data: "object", resource_utilization: "object", demand: "array" },
    output_schema: { bottlenecks: "array", bottleneck_severity: "object", throughput_impact: "number", recommendations: "array" },
    cost: 0.4,
    latency: 500,
    accuracy_score: 0.88,
    dependencies: [],
    description: "识别系统中的瓶颈资源和约束环节，基于TOC理论。",
    files: { readme: "# Bottleneck Detection", config: "{}", script: "def detect_bottlenecks(process, resources): return {'bottlenecks': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_priority_sorting",
    name: "优先级排序算法",
    version: "1.0.0",
    domain: ["capacity_constraint_rules"],
    capability_tags: ["priority", "sorting", "ranking", "ahp"],
    input_schema: { items: "array", criteria: "array", weights: "object", method: "string" },
    output_schema: { ranked_items: "array", scores: "object", top_k: "array", ties: "array" },
    cost: 0.2,
    latency: 150,
    accuracy_score: 0.91,
    dependencies: [],
    description: "基于多准则对项目进行优先级排序，支持AHP等方法。",
    files: { readme: "# Priority Sorting", config: "{}", script: "def sort_priority(items, criteria): return {'ranked': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_stochastic_inventory",
    name: "随机库存模型计算",
    version: "1.0.0",
    domain: ["inventory_optimization"],
    capability_tags: ["stochastic", "inventory", "newsvendor", "base_stock"],
    input_schema: { demand_distribution: "object", cost_params: "object", lead_time: "number", service_level: "number" },
    output_schema: { optimal_policy: "object", expected_cost: "number", fill_rate: "number", stockout_prob: "number" },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.87,
    dependencies: ["atom_inventory_model"],
    description: "基于随机需求的库存模型计算，考虑不确定性。",
    files: { readme: "# Stochastic Inventory", config: "{}", script: "def calc_stochastic_inventory(demand_dist, costs): return {'policy': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_dynamic_programming",
    name: "动态规划算法",
    version: "1.0.0",
    domain: ["inventory_optimization"],
    capability_tags: ["dynamic_programming", "optimal", "recursive", "memoization"],
    input_schema: { stages: "array", states: "array", decisions: "array", transition: "object", reward: "object" },
    output_schema: { optimal_policy: "object", optimal_value: "number", value_function: "object", policy_function: "object" },
    cost: 0.5,
    latency: 1000,
    accuracy_score: 0.92,
    dependencies: [],
    description: "使用动态规划求解多阶段决策问题。",
    files: { readme: "# Dynamic Programming", config: "{}", script: "def solve_dp(stages, states): return {'policy': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_resource_conflict_detection",
    name: "资源冲突检测算法",
    version: "1.0.0",
    domain: ["rush_order_management"],
    capability_tags: ["conflict", "resource", "detection", "scheduling"],
    input_schema: { resource_allocations: "array", resource_capacity: "object", time_windows: "array" },
    output_schema: { conflicts: "array", conflict_graph: "object", resolution_suggestions: "array", severity: "array" },
    cost: 0.3,
    latency: 300,
    accuracy_score: 0.89,
    dependencies: [],
    description: "检测资源分配中的冲突和重叠，提供解决方案。",
    files: { readme: "# Resource Conflict Detection", config: "{}", script: "def detect_conflicts(allocations, capacity): return {'conflicts': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_constraint_relaxation",
    name: "约束松弛算法",
    version: "1.0.0",
    domain: ["change_management"],
    capability_tags: ["relaxation", "constraint", "lagrangian", "optimization"],
    input_schema: { original_problem: "object", relaxable_constraints: "array", penalty_weights: "object" },
    output_schema: { relaxed_solution: "object", dual_values: "object", constraint_violations: "object", gap: "number" },
    cost: 0.5,
    latency: 800,
    accuracy_score: 0.88,
    dependencies: ["atom_linear_programming"],
    description: "通过松弛约束求解困难优化问题，计算对偶值。",
    files: { readme: "# Constraint Relaxation", config: "{}", script: "def relax_constraints(problem, relaxable): return {'solution': {}}", scriptLang: "python" }
  },
  {
    skill_id: "atom_path_impact_propagation",
    name: "路径影响传播算法",
    version: "1.0.0",
    domain: ["change_management"],
    capability_tags: ["impact", "propagation", "dependency", "graph"],
    input_schema: { dependency_graph: "object", changed_nodes: "array", impact_weights: "object" },
    output_schema: { affected_nodes: "array", impact_magnitudes: "object", propagation_paths: "array", critical_paths: "array" },
    cost: 0.4,
    latency: 500,
    accuracy_score: 0.87,
    dependencies: [],
    description: "在依赖图中传播变更影响，识别受影响范围和关键路径。",
    files: { readme: "# Path Impact Propagation", config: "{}", script: "def propagate_impact(graph, changes): return {'affected': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_root_cause_analysis",
    name: "根因分析算法",
    version: "1.0.0",
    domain: ["abnormal_alert"],
    capability_tags: ["root_cause", "rca", "fishbone", "5_whys"],
    input_schema: { problem: "object", causal_factors: "array", historical_cases: "array", method: "string" },
    output_schema: { root_causes: "array", cause_tree: "object", confidence_scores: "object", preventive_actions: "array" },
    cost: 0.5,
    latency: 700,
    accuracy_score: 0.86,
    dependencies: ["atom_causal_graph"],
    description: "分析问题的根本原因，支持鱼骨图、5 Whys等方法。",
    files: { readme: "# Root Cause Analysis", config: "{}", script: "def analyze_root_cause(problem, factors): return {'root_causes': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_event_priority",
    name: "事件优先级排序",
    version: "1.0.0",
    domain: ["abnormal_alert"],
    capability_tags: ["event", "priority", "urgency", "severity"],
    input_schema: { events: "array", urgency_weights: "object", impact_matrix: "object", resources: "object" },
    output_schema: { prioritized_events: "array", priority_scores: "object", sla_compliance: "object", schedule: "array" },
    cost: 0.2,
    latency: 100,
    accuracy_score: 0.90,
    dependencies: [],
    description: "基于紧急程度和影响对事件进行优先级排序。",
    files: { readme: "# Event Priority", config: "{}", script: "def prioritize_events(events): return {'prioritized': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_performance_probability",
    name: "履约概率预测",
    version: "1.0.0",
    domain: ["supplier_collaboration"],
    capability_tags: ["performance", "probability", "delivery", "supplier"],
    input_schema: { supplier_history: "object", order_complexity: "object", external_factors: "object", lead_time: "number" },
    output_schema: { on_time_prob: "number", delay_risk: "number", expected_delay: "number", mitigation_options: "array" },
    cost: 0.3,
    latency: 300,
    accuracy_score: 0.88,
    dependencies: ["atom_probability_distribution_fit"],
    description: "预测供应商按时履约的概率和延迟风险。",
    files: { readme: "# Performance Probability", config: "{}", script: "def predict_performance(history, order): return {'on_time_prob': 0.9}", scriptLang: "python" }
  },
  {
    skill_id: "atom_risk_scoring",
    name: "风险评分模型",
    version: "1.0.0",
    domain: ["supplier_collaboration"],
    capability_tags: ["risk", "scoring", "supplier", "assessment"],
    input_schema: { risk_factors: "object", weights: "object", historical_data: "array", industry_benchmarks: "object" },
    output_schema: { risk_score: "number", risk_rating: "string", risk_breakdown: "object", mitigation_priority: "array" },
    cost: 0.3,
    latency: 250,
    accuracy_score: 0.89,
    dependencies: [],
    description: "对供应商进行多维度风险评分和评级。",
    files: { readme: "# Risk Scoring", config: "{}", script: "def score_risk(factors, weights): return {'risk_score': 50}", scriptLang: "python" }
  },
  {
    skill_id: "atom_alternative_path",
    name: "替代路径搜索",
    version: "1.0.0",
    domain: ["supplier_collaboration"],
    capability_tags: ["alternative", "path", "supplier", "sourcing"],
    input_schema: { supply_network: "object", disrupted_paths: "array", constraints: "object", criteria: "array" },
    output_schema: { alternative_paths: "array", path_scores: "object", feasibility: "object", switching_costs: "array" },
    cost: 0.4,
    latency: 500,
    accuracy_score: 0.87,
    dependencies: ["atom_shortest_path"],
    description: "搜索供应链中的替代路径和备用供应商。",
    files: { readme: "# Alternative Path", config: "{}", script: "def find_alternatives(network, disrupted): return {'alternatives': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_scenario_generation",
    name: "多情景生成算法",
    version: "1.0.0",
    domain: ["what_if_simulation"],
    capability_tags: ["scenario", "generation", "combinatorial", "exploration"],
    input_schema: { variable_ranges: "object", constraints: "array", n_scenarios: "number", diversity_metric: "string" },
    output_schema: { scenarios: "array", scenario_matrix: "object", coverage_score: "number", extreme_cases: "array" },
    cost: 0.4,
    latency: 600,
    accuracy_score: 0.88,
    dependencies: [],
    description: "生成多样化的假设情景用于what-if分析。",
    files: { readme: "# Scenario Generation", config: "{}", script: "def generate_scenarios(ranges, n): return {'scenarios': []}", scriptLang: "python" }
  },
  {
    skill_id: "atom_metric_anomaly_detection",
    name: "指标异常检测",
    version: "1.0.0",
    domain: ["kpi_monitoring"],
    capability_tags: ["metric", "anomaly", "kpi", "monitoring"],
    input_schema: { metrics: "object", baselines: "object", thresholds: "object", seasonality: "boolean" },
    output_schema: { anomalies: "array", anomaly_scores: "object", trend_changes: "array", alerts: "array" },
    cost: 0.3,
    latency: 300,
    accuracy_score: 0.89,
    dependencies: ["atom_anomaly_detection"],
    description: "监控KPI指标的异常变化，支持多维度和季节性调整。",
    files: { readme: "# Metric Anomaly Detection", config: "{}", script: "def detect_metric_anomalies(metrics, baselines): return {'anomalies': []}", scriptLang: "python" }
  }
];

// Configuration for generating ontologically correct graphs per scenario
// Support both string format (for simple labels) and object format {id, name} (for semantic IDs with Chinese display names)
interface ScenarioGraphConfig {
    l2: (string | { id: string; name: string })[]; // Subsystems
    l3: Record<string, (string | { id: string; name: string })[]>; // Processes per Subsystem
    l4: Record<string, string[]>; // Parameters per Process (always Chinese labels)
    l2_links?: { source: string; target: string; relation?: string }[]; // Connections between L2 nodes (business flow)
}

const DEFAULT_GRAPH_CONFIG: ScenarioGraphConfig = {
    l2: ['子系统A', '子系统B'],
    l3: { '子系统A': ['过程1', '过程2'], '子系统B': ['过程3'] },
    l4: { '过程1': ['参数A'], '过程2': ['参数B'], '过程3': ['参数C'] }
};

const SCENARIO_CONFIGS: Record<string, ScenarioGraphConfig> = {
    'breakdown_maintenance': {
        // 设备故障维修时间预测 - 聚焦维修工时预测
        // 业务流程：故障诊断 → 维修时间评估 → 备件物流调度 → 维修执行
        l2: [
            { id: 'fault_diagnosis', name: '故障诊断推演' },
            { id: 'repair_time_estimation', name: '维修时间评估推演' },
            { id: 'spare_parts_logistics', name: '备件物流推演' },
            { id: 'repair_execution', name: '维修执行推演' }
        ],
        // L2节点之间的连接关系（业务流程顺序）
        l2_links: [
            { source: 'fault_diagnosis', target: 'repair_time_estimation', relation: '后续' },
            { source: 'repair_time_estimation', target: 'spare_parts_logistics', relation: '后续' },
            { source: 'spare_parts_logistics', target: 'repair_execution', relation: '后续' }
        ],
        l3: {
            // 故障诊断推演的数据支撑
            'fault_diagnosis': [
                { id: 'fault_info', name: '故障信息' },
                { id: 'equipment_status', name: '设备状态' }
            ],
            // 维修时间评估推演的数据支撑
            'repair_time_estimation': [
                { id: 'fault_complexity', name: '故障复杂度' },
                { id: 'repair_history_data', name: '历史维修数据' },
                { id: 'expert_availability', name: '专家可用性' }
            ],
            // 备件物流推演的数据支撑
            'spare_parts_logistics': [
                { id: 'spare_parts_inventory', name: '备件库存' },
                { id: 'logistics_time', name: '物流时间' },
                { id: 'agv_scheduling', name: 'AGV调度' }
            ],
            // 维修执行推演的数据支撑
            'repair_execution': [
                { id: 'work_order_record', name: '工单记录' },
                { id: 'actual_repair_time', name: '实际维修时间' }
            ]
        },
        l4: {
            // 故障信息数据
            'fault_info': ['故障代码', '报警时间', '故障描述', '严重程度', '故障类型'],
            // 设备状态数据
            'equipment_status': ['运行时长', '维护记录', '老化程度', '性能参数', '设备型号'],
            // 故障复杂度
            'fault_complexity': ['拆解难度', '工具要求', '技能等级', '预计工时'],
            // 历史维修数据
            'repair_history_data': ['同类故障工时', 'MTTR历史', '维修频次', '工时分布'],
            // 专家可用性
            'expert_availability': ['专家技能', '当前位置', '忙闲状态', '预计到达时间'],
            // 备件库存数据
            'spare_parts_inventory': ['SKU编号', '库存数量', '库位坐标', '备件类型', '库存状态'],
            // 物流时间
            'logistics_time': ['AGV运输时间', '人工取货时间', '备货时间', '总物流时间'],
            // AGV调度
            'agv_scheduling': ['AGV状态', '路径规划', '优先级', '预计到达'],
            // 工单记录
            'work_order_record': ['工单编号', '维修内容', '工时记录', '更换部件', '完成状态'],
            // 实际维修时间
            'actual_repair_time': ['开始时间', '结束时间', '实际工时', '偏差分析']
        }
    },
    'predictive_maintenance': {
        // 设备预测性维护 - "传感器数据"和"监测指标"是分类标签
        // 真正的数据资产是具体的传感器类型和指标
        // 业务流程：健康评估 → 维护决策
        l2: [
            { id: 'health_assessment', name: '健康评估推演' },
            { id: 'maintenance_decision', name: '维护决策推演' }
        ],
        l2_links: [
            { source: 'health_assessment', target: 'maintenance_decision', relation: '后续' }
        ],
        l3: {
            // 健康评估推演的数据支撑（具体传感器作为独立数据资产）
            'health_assessment': [
                { id: 'vibration_sensor', name: '振动传感器' },
                { id: 'temperature_sensor', name: '温度传感器' },
                { id: 'oil_sensor', name: '油液传感器' },
                { id: 'current_sensor', name: '电流传感器' },
                { id: 'sound_sensor', name: '声音传感器' }
            ],
            // 维护决策推演的数据支撑
            'maintenance_decision': [
                { id: 'maintenance_plan', name: '维护计划' },
                { id: 'spare_parts_demand', name: '备件需求' },
                { id: 'maintenance_cost', name: '维护成本' }
            ]
        },
        l4: {
            // 振动传感器数据
            'vibration_sensor': ['加速度峰值', '位移有效值', '速度有效值', '频谱特征', '包络分析'],
            // 温度传感器数据
            'temperature_sensor': ['轴承温度', '绕组温度', '润滑油温度', '温升速率', '热成像数据'],
            // 油液传感器数据
            'oil_sensor': ['金属磨粒', '粘度指标', '水分含量', '酸值变化', '污染等级'],
            // 电流传感器数据
            'current_sensor': ['电流不平衡度', '谐波含量', '功率因数', '启动电流', '空载电流'],
            // 声音传感器数据
            'sound_sensor': ['声压级', '频谱特征', '异常声响', '轴承噪声', '齿轮噪声'],
            // 维护计划数据
            'maintenance_plan': ['维护时间窗', '维护方式', '人员安排', '停机计划'],
            // 备件需求数据
            'spare_parts_demand': ['备件消耗率', '库存水位', '采购提前期', '安全库存'],
            // 维护成本数据
            'maintenance_cost': ['人工成本', '备件成本', '停机损失', '总成本预算']
        }
    },
    'production_sales_match': {
        // 产销匹配协同 - S&OP层级的综合推演，包含需求预测、产能评估调用、产销平衡、交付协同
        // 注：产能评估推演预测分析作为子推演被调用
        // 业务流程：需求预测 → 销售计划 → 产能评估 → 产销平衡 → 库存优化 → 交付协同
        l2: [
            { id: 'demand_forecast', name: '需求预测推演' },
            { id: 'sales_planning', name: '销售计划推演' },
            { id: 'capacity_assessment', name: '产能评估推演' },
            { id: 'production_balance', name: '产销平衡推演' },
            { id: 'inventory_optimization', name: '库存优化推演' },
            { id: 'delivery_coordination', name: '交付协同推演' }
        ],
        l2_links: [
            { source: 'demand_forecast', target: 'sales_planning', relation: '后续' },
            { source: 'sales_planning', target: 'capacity_assessment', relation: '后续' },
            { source: 'capacity_assessment', target: 'production_balance', relation: '后续' },
            { source: 'production_balance', target: 'inventory_optimization', relation: '后续' },
            { source: 'inventory_optimization', target: 'delivery_coordination', relation: '后续' }
        ],
        l3: {
            // 需求预测推演的数据支撑
            'demand_forecast': [
                { id: 'market_intel', name: '市场情报' },
                { id: 'historical_sales', name: '历史销售数据' },
                { id: 'customer_forecast', name: '客户预测数据' }
            ],
            // 销售计划推演的数据支撑
            'sales_planning': [
                { id: 'sales_target', name: '销售目标' },
                { id: 'order_backlog', name: '订单积压' },
                { id: 'customer_contract', name: '客户合同' }
            ],
            // 产能评估推演 - 调用capacity_assessment_prediction子推演
            'capacity_assessment': [
                { id: 'current_capacity_status', name: '当前产能状态' },
                { id: 'capacity_expansion_option', name: '扩产选项' },
                { id: 'subcontracting_option', name: '委外选项' }
            ],
            // 产销平衡推演的数据支撑
            'production_balance': [
                { id: 'demand_supply_gap', name: '供需缺口' },
                { id: 'priority_rule', name: '优先级规则' },
                { id: 'allocation_strategy', name: '分配策略' }
            ],
            // 库存优化推演的数据支撑
            'inventory_optimization': [
                { id: 'raw_material_inventory', name: '原材料库存' },
                { id: 'wip_inventory', name: '在制品库存' },
                { id: 'fg_inventory', name: '成品库存' }
            ],
            // 交付协同推演的数据支撑
            'delivery_coordination': [
                { id: 'shipping_plan', name: '发货计划' },
                { id: 'logistics_capacity', name: '物流运力' },
                { id: 'customer_delivery_req', name: '客户交付要求' }
            ]
        },
        l4: {
            // 市场情报
            'market_intel': ['行业趋势', '竞品动态', '价格走势', '政策影响'],
            // 历史销售数据
            'historical_sales': ['月度销量', '季度趋势', '年度对比', '季节性规律'],
            // 客户预测数据
            'customer_forecast': ['客户需求预测', '订单意向', '框架协议'],
            // 销售目标
            'sales_target': ['月度目标', '季度目标', '年度目标', '区域分解'],
            // 订单积压
            'order_backlog': ['超期订单', '紧急订单', 'VIP订单', '待排产订单'],
            // 客户合同
            'customer_contract': ['框架协议', '价格条款', '交付条款', '违约条款'],
            // 当前产能状态
            'current_capacity_status': ['设备OEE', '人员配置', '产线状态', '瓶颈工序'],
            // 扩产选项
            'capacity_expansion_option': ['加班方案', '新增班次', '设备增加', '委外加工'],
            // 委外选项
            'subcontracting_option': ['代工供应商', '代工成本', '质量协议', '产能锁定'],
            // 供需缺口
            'demand_supply_gap': ['月度缺口', '季度缺口', '峰值缺口', '结构性缺口'],
            // 优先级规则
            'priority_rule': ['VIP优先', '交期优先', '利润优先', '战略客户优先'],
            // 分配策略
            'allocation_strategy': ['按比例分配', '按优先级分配', '均衡分配', '应急分配'],
            // 原材料库存
            'raw_material_inventory': ['正极材料', '负极材料', '电解液', '结构件'],
            // 在制品库存
            'wip_inventory': ['极片WIP', '电芯WIP', 'Pack WIP'],
            // 成品库存
            'fg_inventory': ['储能电芯', '动力电芯', 'Pack成品'],
            // 发货计划
            'shipping_plan': ['发货批次', '发货时间', '运输方式', '目的地'],
            // 物流运力
            'logistics_capacity': ['自有运力', '第三方物流', '运力储备', '应急运力'],
            // 客户交付要求
            'customer_delivery_req': ['交期要求', '交付频次', '包装要求', '特殊要求']
        }
    },
    'new_project_planning': {
        // 新项目落地推演分析 - 5层决策结构
        // 业务流程：战略决策 → 市场分析 → 产能制造 → 财务投资 → 风险评估
        l2: [
            { id: 'strategic_decision', name: '战略层决策' },
            { id: 'market_analysis', name: '需求与市场层' },
            { id: 'capacity_manufacturing', name: '产能与制造层' },
            { id: 'finance_investment', name: '财务与投资层' },
            { id: 'risk_constraints', name: '风险与约束层' }
        ],
        l2_links: [
            { source: 'strategic_decision', target: 'market_analysis', relation: '后续' },
            { source: 'market_analysis', target: 'capacity_manufacturing', relation: '后续' },
            { source: 'capacity_manufacturing', target: 'finance_investment', relation: '后续' },
            { source: 'finance_investment', target: 'risk_constraints', relation: '后续' }
        ],
        l3: {
            'strategic_decision': [
                { id: 'use_existing_line', name: '是否使用现有产线' },
                { id: 'add_new_capacity', name: '是否需要新增产能' },
                { id: 'expand_or_new', name: '扩建还是新建' },
                { id: 'location_selection', name: '新建地址选择' },
                { id: 'tech_upgrade', name: '技术路线升级' },
                { id: 'phased_investment', name: '是否分阶段投建' },
                { id: 'customer_partnership', name: '是否与客户共建' },
                { id: 'gov_policy_support', name: '政府政策支持' }
            ],
            'market_analysis': [
                { id: 'order_commitment', name: '客户订单锁定比例' },
                { id: 'contract_duration', name: '合同周期长度' },
                { id: 'customer_concentration', name: '客户集中度' },
                { id: 'price_trend', name: '销售价格趋势' },
                { id: 'tech_substitution', name: '技术替代风险' }
            ],
            'capacity_manufacturing': [
                // 原始数据（输入）
                { id: 'equipment_data', name: '设备数据' },
                { id: 'personnel_data', name: '人员数据' },
                { id: 'production_data', name: '生产数据' }
                // 注：利用率、OEE、良率、匹配度等是推演计算结果，不作为独立数据节点
            ],
            'finance_investment': [
                { id: 'capex_investment', name: 'CAPEX投资额' },
                { id: 'construction_cycle', name: '建设周期' },
                { id: 'equipment_delivery', name: '设备交付周期' },
                { id: 'land_acquisition', name: '土地获取周期' },
                { id: 'policy_approval', name: '政策审批周期' },
                { id: 'automation_level', name: '自动化水平' },
                { id: 'unit_cost', name: '单位制造成本' },
                { id: 'energy_cost', name: '能耗成本' },
                { id: 'depreciation_period', name: '折旧年限' },
                { id: 'economies_scale', name: '规模经济临界点' },
                { id: 'expansion_potential', name: '未来扩展能力' },
                { id: 'digital_infrastructure', name: '数字化基础设施' }
            ],
            'risk_constraints': [
                { id: 'sales_decline', name: '销量下降数据' },
                { id: 'material_price_rise', name: '原材料上涨数据' },
                { id: 'customer_default', name: '客户违约记录' },
                { id: 'tech_route_substitution', name: '技术路线替代' },
                { id: 'subsidy_removal', name: '政策补贴变动' },
                { id: 'delay_production', name: '延期投产记录' },
                { id: 'equipment_delay', name: '设备交付延迟' },
                { id: 'approval_delay', name: '环保审批延迟' },
                { id: 'exchange_rate', name: '汇率变动数据' }
            ]
        },
        l4: {
            // strategic_decision 层 - 战略决策推演节点
            'use_existing_line': ['现有产线产能', '改造成本', '停产损失', '改造周期'],
            'add_new_capacity': ['产能缺口', '投资额度', '产能利用率'],
            'expand_or_new': ['扩建成本', '新建成本', '建设周期', '土地面积'],
            'location_selection': ['供应链距离', '物流成本', '土地价格', '人工成本', '电价', '税收政策', '环保政策', '产业集群'],
            'tech_upgrade': ['新工艺导入', '自动化升级', '数字化改造', '良率提升空间'],
            'phased_investment': ['一期产能', '二期扩展', '资金安排', '建设节奏'],
            'customer_partnership': ['绑定协议', '共建模式', '风险分担', '收益分配'],
            'gov_policy_support': ['税收优惠', '土地补贴', '能耗指标', '产业基金'],

            // market_analysis 层 - 市场数据节点
            'order_commitment': ['订单覆盖率', '违约条款', '客户信用评级', '合同金额'],
            'contract_duration': ['长期合约占比', '价格调整机制', '续约概率', '合同锁定期'],
            'customer_concentration': ['CR5集中度', '大客户依赖度', '客户分散策略', '新客户开发'],
            'price_trend': ['历史价格走势', '成本推动因素', '市场竞争态势', '价格数据'],
            'tech_substitution': ['固态电池进展', '钠离子电池威胁', '氢燃料电池竞争', '技术替代时间'],

            // capacity_manufacturing 层 - 原始数据节点（利用率、OEE、良率、匹配度等是推演输出）
            'equipment_data': ['设备台账', '设备役龄', '设备状态', '维护记录', '剩余寿命'],
            'personnel_data': ['人员编制', '技能矩阵', '培训记录', '招聘需求'],
            'production_data': ['产量统计', '质量记录', '切换记录', '改造历史'],

            // finance_investment 层 - 财务投资数据节点
            'capex_investment': ['设备投资', '厂房建设', '土地购置', '流动资金', '预备费'],
            'construction_cycle': ['土建周期', '设备安装', '调试爬坡', '量产时间', '总建设周期'],
            'equipment_delivery': ['设备订货周期', '生产排期', '运输时间', '安装调试时间'],
            'land_acquisition': ['土地招拍挂周期', '手续办理时间', '三通一平周期', '拿地风险'],
            'policy_approval': ['环评审批', '能评审批', '施工许可', '安全生产许可', '审批风险'],
            'automation_level': ['自动化率目标', '机器人配置', '智能物流规划', '数字化投入'],
            'unit_cost': ['材料成本', '人工成本', '制造费用', '成本数据'],
            'energy_cost': ['电力成本', '天然气成本', '蒸汽成本', '能耗数据'],
            'depreciation_period': ['设备折旧年限', '厂房折旧年限', '残值率', '折旧方法'],
            'economies_scale': ['盈亏平衡产量', '最优经济规模', '规模效应', '产能利用率目标'],
            'expansion_potential': ['预留扩建空间', '公用工程余量', '未来发展弹性', '二期扩展成本'],
            'digital_infrastructure': ['MES系统', 'ERP系统', 'WMS系统', '工业互联网平台', '数字化投资'],

            // risk_constraints 层 - 风险约束数据节点
            'sales_decline': ['盈亏平衡点', '现金流压力', '产能消化', '减值风险'],
            'material_price_rise': ['成本传导', '价格谈判空间', '供应商管理', '套期保值', '替代材料'],
            'customer_default': ['客户信用', '应收账款', '坏账准备', '法律追偿'],
            'tech_route_substitution': ['技术路线监测', '研发投入', '产线灵活性', '技术合作'],
            'subsidy_removal': ['补贴依赖度', '无补贴盈利', '成本优化空间', '产品结构'],
            'delay_production': ['延期概率', '延期成本', '客户违约', '市场份额损失'],
            'equipment_delay': ['设备交付风险', '替代供应商', '国产替代方案', '项目缓冲时间'],
            'approval_delay': ['审批流程', '关键路径', '关系协调', '合规风险'],
            'exchange_rate': ['汇率敏感性', '自然对冲', '金融对冲', '币种结构']
        }
    },
    'capacity_assessment_prediction': {
        // 产能评估推演预测分析 - 锂电企业产能规划（供给侧视角）
        // 业务流程：现有产能评估 → 产能供给能力评估 → 产能扩展潜力 → 产能规划方案 → 投资决策推演 → 风险情景模拟
        l2: [
            { id: 'current_capacity', name: '现有产能评估' },
            { id: 'supply_capability', name: '产能供给能力评估' },
            { id: 'capacity_expansion', name: '产能扩展潜力' },
            { id: 'capacity_planning', name: '产能规划方案' },
            { id: 'investment_decision', name: '投资决策推演' },
            { id: 'risk_simulation', name: '风险情景模拟' }
        ],
        l2_links: [
            { source: 'current_capacity', target: 'supply_capability', relation: '后续' },
            { source: 'supply_capability', target: 'capacity_expansion', relation: '后续' },
            { source: 'capacity_expansion', target: 'capacity_planning', relation: '后续' },
            { source: 'capacity_planning', target: 'investment_decision', relation: '后续' },
            { source: 'investment_decision', target: 'risk_simulation', relation: '后续' }
        ],
        l3: {
            'current_capacity': [
                // 原始数据资产
                { id: 'equipment_base_data', name: '设备基础数据' },
                { id: 'personnel_base_data', name: '人员基础数据' }
                // 注：理论/有效产能、OEE、瓶颈等是推演计算结果
            ],
            'supply_capability': [
                // 原始数据资产
                { id: 'resource_data', name: '资源数据' },
                { id: 'quality_data', name: '质量数据' }
                // 注：最大产出、可持续产能、弹性等是推演评估结果
            ],
            'capacity_expansion': [
                // 原始数据资产
                { id: 'expansion_resource_data', name: '扩产资源数据' }
                // 注：短期/中期/长期扩产潜力、峰值产能、产能天花板等是推演评估结果
            ],
            'capacity_planning': [
                { id: 'existing_line_expansion', name: '现有产线扩产' },
                { id: 'new_line_construction', name: '新建产线方案' },
                { id: 'oem_consideration', name: '委外加工' },
                { id: 'automation_upgrade', name: '自动化升级' },
                { id: 'process_optimization', name: '工艺优化' },
                { id: 'multi_shift_operation', name: '多班制运营' }
            ],
            'investment_decision': [
                // 原始数据资产
                { id: 'investment_data', name: '投资数据' },
                { id: 'financing_data', name: '融资数据' }
                // 注：ROI、回收期、NPV等是财务推演计算结果
            ],
            'risk_simulation': [
                { id: 'capacity_volatility', name: '产能波动' },
                { id: 'technology_obsolescence', name: '技术淘汰' },
                { id: 'policy_change', name: '政策变化' },
                { id: 'supply_chain_disruption', name: '供应链中断' },
                { id: 'market_competition', name: '市场竞争' }
            ]
        },
        l4: {
            // current_capacity 层 - 基础数据资产（产能指标是推演输出）
            'equipment_base_data': ['设备台账', '设备铭牌参数', '设备役龄', '设备状态', '维护记录'],
            'personnel_base_data': ['人员编制', '技能矩阵', '排班记录', '培训档案'],

            // supply_capability 层 - 基础数据资产
            'resource_data': ['电力供应能力', '原料供应能力', '劳动力数量', '场地面积'],
            'quality_data': ['良率记录', '返修记录', '废品记录', '质量检测数据'],

            // capacity_expansion 层 - 基础数据资产（扩产潜力是推演评估结果）
            'expansion_resource_data': ['可用土地面积', '电力扩容空间', '环保排放余量', '资金储备'],

            // capacity_planning 层 - 基础数据资产
            'existing_line_expansion': ['现有设备清单', '节拍参数', '改造历史'],
            'new_line_construction': ['新建产线需求', '设备选型参数', '产线布局方案'],
            'oem_consideration': ['代工供应商档案', '代工协议条款', '质量协议'],
            'automation_upgrade': ['自动化现状', '升级需求', '投资预算'],
            'process_optimization': ['工艺参数', '效率基准', '优化需求'],
            'multi_shift_operation': ['班次配置', '人员需求', '运营成本'],

            // investment_decision 层 - 基础数据资产（ROI/NPV等是推演计算结果）
            'investment_data': ['设备投资清单', '建设成本预算', '土地购置成本', '流动资金需求'],
            'financing_data': ['融资渠道', '贷款利率', '政府补贴政策', '融资租赁方案'],

            // risk_simulation 层 - 基础数据资产
            'capacity_volatility': ['设备故障记录', '原料短缺记录', '人员流失记录', '需求波动记录'],
            'technology_obsolescence': ['技术路线图', '竞品技术动态', '技术迭代周期'],
            'policy_change': ['补贴政策', '环保政策', '能耗双控政策', '产业政策'],
            'supply_chain_disruption': ['关键原料供应', '物流渠道', '供应商档案', '备选供应商'],
            'market_competition': ['竞争对手动态', '市场价格数据', '市场份额数据', '客户分布']
        }
    }
};

// Function to generate ontologically consistent graphs
// 节点分为两类：推演节点(simulation)和数据节点(data)
const generateSpecificGraph = (scenarioId: string, scenarioName: string, skillIds: string[]): OntologyData => {
    const nodes: OntologyNode[] = [];
    const links: OntologyLink[] = [];

    // Helpers
    const randStatus = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const config = SCENARIO_CONFIGS[scenarioId] || DEFAULT_GRAPH_CONFIG;

    // 示例数据生成器
    const owners = ['张工', '李经理', '王主管', '刘工程师', '陈博士', '赵主任', '孙技术员', '周专家'];
    const frequencies = ['实时', '每分钟', '每小时', '每班', '每日', '每周', '每月', '按需'];
    const dataFormats = ['JSON', 'XML', 'CSV', '数据库表', '消息队列', '文件', 'API接口', '二进制流'];
    const dataSources = ['导入', 'CRM系统', 'BOM系统', 'MES系统', 'ERP系统', 'SCM系统', 'PLM系统', 'WMS系统'];

    const getRandomOwner = () => owners[Math.floor(Math.random() * owners.length)];
    const getRandomFrequency = () => frequencies[Math.floor(Math.random() * frequencies.length)];
    const getRandomFormat = () => dataFormats[Math.floor(Math.random() * dataFormats.length)];
    const getRandomDataSource = () => dataSources[Math.floor(Math.random() * dataSources.length)];

    // 判断节点是否为推演节点（结合节点名称和场景上下文判断）
    const isSimNode = (nodeLabel: string, parentId?: string) => {
      // 1. 名称关键词判断
      const simulationKeywords = [
        '推演', '评估', '预测', '分析', '决策', '模拟', '优化', '规划',
        '推荐', '诊断', '预警', '测算', '选型', '可行性', '盈亏',
        '风险', '策略', '情景', '平衡', '计算', '判定', '评价',
        '方案', '建议', '调研', '比选'
      ];
      const hasKeyword = simulationKeywords.some(keyword => nodeLabel.includes(keyword));
      if (hasKeyword) return true;

      // 2. 场景上下文判断 - 某些场景下的L2节点即使名称不含关键词也应为推演节点
      const simulationScenarios: Record<string, string[]> = {
        // 新项目落地推演分析 - 五大决策维度都是推演节点
        'new_project_planning': ['战略层决策', '需求与市场层', '产能与制造层', '财务与投资层', '风险与约束层'],
        // 产能评估推演预测分析 - 所有L2都是推演节点
        'capacity_assessment_prediction': ['现有产能评估', '产能供给能力评估', '产能扩展潜力', '产能规划方案', '投资决策推演', '风险情景模拟'],
        // 产销匹配协同 - L2均为推演节点
        'production_sales_match': ['需求预测推演', '销售计划推演', '产能评估推演', '产销平衡推演', '库存优化推演', '交付协同推演'],
      };

      if (simulationScenarios[scenarioId]?.includes(nodeLabel)) {
        return true;
      }

      // 3. 根据父节点判断 - 如果父节点是推演节点，且当前节点名称表示一个分析维度，则为推演节点
      if (parentId) {
        const parentNode = nodes.find(n => n.id === parentId);
        if (parentNode?.type === 'simulation') {
          // 检查是否是决策维度（以"层"、"维度"结尾，或是特定的分析类别）
          const dimensionPatterns = ['层', '维度', '模块', '域'];
          if (dimensionPatterns.some(p => nodeLabel.includes(p))) {
            return true;
          }
        }
      }

      return false;
    };

    // 辅助函数：生成关联节点状态
    const createRelatedNode = (id: string, label: string) => ({
      id,
      label,
      dataSubmitted: Math.random() > 0.3,
      instructionCompleted: Math.random() > 0.2
    });

    // 生成推演节点
    const createSimulationNode = (id: string, label: string): OntologyNode => ({
      id,
      label,
      type: 'simulation',
      group: 'simulation',
      data_readiness: randStatus(80, 100),
      owner: getRandomOwner(),
      responsibility: `负责${label}推演分析，整合各类数据节点输入，输出决策建议和预测结果`,
      dataSource: getRandomDataSource(),
      dataFormat: getRandomFormat(),
      updateFrequency: getRandomFrequency(),
      pendingTasks: []
    });

    // 生成数据节点
    const createDataNode = (id: string, label: string, parentId: string): OntologyNode => ({
      id,
      label,
      type: 'data',
      group: 'data',
      data_readiness: randStatus(40, 90),
      owner: getRandomOwner(),
      responsibility: `提供${label}相关数据，支持上级推演节点的分析计算`,
      upstreamNodes: [createRelatedNode(parentId, '')],
      dataSource: getRandomDataSource(),
      dataFormat: getRandomFormat(),
      updateFrequency: getRandomFrequency(),
      pendingTasks: []
    });

    // 不再创建场景级别的根节点（避免与场景本身重复且范围过大）
    // L2节点直接作为图谱的顶层节点

    // 第一层节点：根据节点性质分类（推演节点或数据节点）
    const level1Nodes: { id: string; label: string }[] = [];
    config.l2.forEach((l2Item) => {
      const isObject = typeof l2Item === 'object' && l2Item !== null && 'id' in l2Item;
      const nodeId = isObject ? (l2Item as any).id : l2Item;
      const nodeLabel = isObject ? (l2Item as any).name : l2Item;

      level1Nodes.push({ id: nodeId, label: nodeLabel });

      // 根据节点名称和场景上下文判断：推演节点或数据节点
      const nodeType = isSimNode(nodeLabel) ? 'simulation' : 'data';
      if (nodeType === 'simulation') {
        nodes.push(createSimulationNode(nodeId, nodeLabel));
      } else {
        // 顶层数据节点（无父节点）
        nodes.push({
          id: nodeId,
          label: nodeLabel,
          type: 'data',
          group: 'data',
          data_readiness: randStatus(60, 95),
          owner: getRandomOwner(),
          responsibility: `提供${nodeLabel}相关数据，支持推演节点的分析计算`,
          dataSource: getRandomDataSource(),
          dataFormat: getRandomFormat(),
          updateFrequency: getRandomFrequency(),
          pendingTasks: []
        });
      }

      // 第二层子节点：根据节点性质分类（推演节点或数据节点）
      const level2Config = config.l3[nodeId] || config.l3[nodeLabel] || [];
      level2Config.forEach((l3Item: any) => {
        const isL3Object = typeof l3Item === 'object' && l3Item !== null && 'id' in l3Item;
        const childId = isL3Object ? (l3Item as any).id : l3Item;
        const childLabel = isL3Object ? (l3Item as any).name : l3Item;

        // 根据节点名称和父节点类型判断：推演节点或数据节点
        const childNodeType = isSimNode(childLabel, nodeId) ? 'simulation' : 'data';
        if (childNodeType === 'simulation') {
          nodes.push(createSimulationNode(childId, childLabel));
        } else {
          nodes.push(createDataNode(childId, childLabel, nodeId));
        }
        links.push({ source: nodeId, target: childId, relation: '包含' });

        // 第三层子节点：数据参数节点（均为数据节点）
        let parameters = config.l4[childId] || config.l4[childLabel] || [];

        // 如果是推演节点且没有定义L4数据参数，自动生成默认数据参数
        if (childNodeType === 'simulation' && parameters.length === 0) {
          parameters = [
            `${childLabel}输入数据`,
            `${childLabel}历史记录`,
            `${childLabel}基准指标`,
            `${childLabel}约束条件`
          ];
        }

        parameters.forEach((paramLabel: string, k: number) => {
          const paramId = `${childId}_param_${k}`;
          nodes.push(createDataNode(paramId, paramLabel, childId));
          links.push({ source: childId, target: paramId, relation: '包含' });
        });
      });
    });

    // 处理L2节点之间的连接关系（业务流程顺序）
    const l2Links = (config as any).l2_links || [];
    l2Links.forEach((link: any) => {
      links.push({
        source: link.source,
        target: link.target,
        relation: link.relation || '后续'
      });
    });

    return { nodes, links };
};

export const SCENARIO_ONTOLOGY_MAP: Record<string, OntologyData> = {
  'predictive_maintenance': generateSpecificGraph('predictive_maintenance', '设备预测性维护', ['equipment_rul_pred_v2']),
  'breakdown_maintenance': generateSpecificGraph('breakdown_maintenance', '设备故障维修', ['repair_time_estimator_v1']),
  'production_sales_match': generateSpecificGraph('production_sales_match', '产销匹配协同', [
    'demand_forecast_v3', 'capacity_evaluation_v2', 'smart_scheduling_v4', 'inventory_optimization_v3',
    'supply_chain_collab_v2', 'order_fulfillment_tracking_v2', 'logistics_optimization_v2', 'production_sales_alert_v1'
  ]),
  'new_project_planning': generateSpecificGraph('new_project_planning', '新项目落地推演分析', [
    'capacity_evaluation_v2', 'cost_realtime_analyzer_v1', 'npv_calculator_v1', 'location_optimizer_v1',
    'risk_simulator_v1', 'market_forecast_v2', 'capex_analyzer_v1', 'sensitivity_analysis_v1'
  ]),
  'capacity_assessment_prediction': generateSpecificGraph('capacity_assessment_prediction', '产能评估推演预测分析', [
    'capacity_evaluation_v2', 'demand_forecast_v3', 'oee_analyzer_v1', 'bottleneck_identifier_v1',
    'equipment_health_monitor_v1', 'roi_calculator_v1', 'production_simulator_v1', 'risk_assessor_v1'
  ]),
};

export const RECENT_EXECUTIONS: ExecutionLog[] = [
  { id: "exec_1001", timestamp: "2023-10-25 10:30:00", task_text: "检测涂布机A台面密度异常", status: "success", skills_used: ["coating_thickness_loop_v1"], duration: 120, result_summary: "调整+2um" },
  { id: "exec_1002", timestamp: "2023-10-25 10:35:12", task_text: "分析批次B203的化成容量数据", status: "success", skills_used: ["capacity_prediction_v5"], duration: 980, result_summary: "预测均值 102Ah" },
  { id: "exec_1003", timestamp: "2023-10-25 11:05:00", task_text: "Pack线热失控风险扫描", status: "failed", skills_used: ["thermal_runaway_warning_v2"], duration: 45, result_summary: "传感器离线" },
  { id: "exec_1004", timestamp: "2023-10-25 13:10:00", task_text: "估算卷绕机#3主轴故障修复时间", status: "success", skills_used: ["repair_time_estimator_v1"], duration: 85, result_summary: "预计45分钟 (专家:张工)" },
  { id: "exec_1005", timestamp: "2023-10-25 13:45:00", task_text: "核算产线A的单瓦时制造成本", status: "success", skills_used: ["cost_realtime_analyzer_v1"], duration: 420, result_summary: "0.34 元/Wh" },
];

// ==================== 推演分析节点配置 ====================
// 定义哪些业务流程节点支持推演分析功能

export const SIMULATION_NODES: import('./types').SimulationNodeConfig[] = [
  // ========== 新项目落地推演分析节点 ==========
  {
    nodeId: 'strategic_decision',
    nodeName: '战略决策',
    scenarioId: 'new_project_planning',
    category: 'investment_decision',
    description: '基于市场分析和财务测算进行投资决策推演',
    inputParams: [
      { id: 'market_growth_rate', name: '市场增长率', description: '目标市场年复合增长率', dataType: 'number', required: true, unit: '%', defaultValue: 15 },
      { id: 'investment_scale', name: '投资规模', description: '项目总投资金额', dataType: 'number', required: true, unit: '亿元' },
      { id: 'payback_period', name: '预期回收期', description: '投资回收期要求', dataType: 'number', required: true, unit: '年', defaultValue: 5 },
      { id: 'strategic_priority', name: '战略优先级', description: '项目战略重要性评分', dataType: 'number', required: true, unit: '分', defaultValue: 8 },
    ],
    outputMetrics: ['决策得分', '战略匹配度', '投资优先级'],
    supportedSkills: ['atom_probability_distribution_fit', 'atom_bayesian_update', 'atom_monte_carlo_simulation', 'atom_multi_objective_optimization', 'atom_dcf_calculation']
  },
  {
    nodeId: 'site_selection',
    nodeName: '选址评估',
    scenarioId: 'new_project_planning',
    category: 'investment_decision',
    description: '评估不同选址方案的综合优劣势',
    inputParams: [
      { id: 'land_cost', name: '土地成本', description: '单位土地成本', dataType: 'number', required: true, unit: '元/㎡' },
      { id: 'logistics_distance', name: '物流距离', description: '距主要客户平均距离', dataType: 'number', required: true, unit: 'km' },
      { id: 'labor_availability', name: '劳动力可得性', description: '当地劳动力供给评分', dataType: 'number', required: true, unit: '分', defaultValue: 7 },
      { id: 'policy_support', name: '政策支持力度', description: '地方政府政策支持评分', dataType: 'number', required: true, unit: '分', defaultValue: 8 },
    ],
    outputMetrics: ['选址综合评分', '成本指数', '供应链效率指数'],
    supportedSkills: ['atom_clustering', 'atom_shortest_path', 'atom_multi_objective_optimization']
  },
  {
    nodeId: 'financial_profitability',
    nodeName: '盈利能力分析',
    scenarioId: 'new_project_planning',
    category: 'financial_analysis',
    description: '评估项目财务可行性和盈利能力',
    inputParams: [
      { id: 'revenue_forecast', name: '收入预测', description: '年度收入预测', dataType: 'number', required: true, unit: '亿元' },
      { id: 'capex', name: '资本支出', description: '初始资本支出', dataType: 'number', required: true, unit: '亿元' },
      { id: 'opex_ratio', name: '运营成本率', description: '运营成本占收入比例', dataType: 'number', required: true, unit: '%', defaultValue: 75 },
      { id: 'discount_rate', name: '折现率', description: '项目折现率', dataType: 'number', required: true, unit: '%', defaultValue: 10 },
    ],
    outputMetrics: ['NPV', 'IRR', '投资回收期', 'ROIC'],
    supportedSkills: ['atom_dcf_calculation', 'atom_cost_structure', 'atom_sensitivity_analysis', 'atom_probability_distribution_fit']
  },
  {
    nodeId: 'risk_assessment',
    nodeName: '风险评估',
    scenarioId: 'new_project_planning',
    category: 'risk_assessment',
    description: '识别和量化项目潜在风险',
    inputParams: [
      { id: 'market_volatility', name: '市场波动率', description: '市场需求波动程度', dataType: 'number', required: true, unit: '%', defaultValue: 20 },
      { id: 'technology_maturity', name: '技术成熟度', description: '技术成熟度评分', dataType: 'number', required: true, unit: '分', defaultValue: 8 },
      { id: 'regulatory_risk', name: '政策风险', description: '政策变化风险评分', dataType: 'number', required: true, unit: '分', defaultValue: 5 },
      { id: 'competition_intensity', name: '竞争强度', description: '市场竞争激烈程度', dataType: 'number', required: true, unit: '分', defaultValue: 7 },
    ],
    outputMetrics: ['综合风险指数', '市场风险', '技术风险', '财务风险'],
    supportedSkills: ['atom_monte_carlo_simulation', 'atom_probability_distribution_fit', 'atom_sensitivity_analysis']
  },

  // ========== 产能评估推演预测分析节点 ==========
  {
    nodeId: 'current_capacity',
    nodeName: '现有产能评估',
    scenarioId: 'capacity_assessment_prediction',
    category: 'capacity_planning',
    description: '评估现有产线产能状况和瓶颈',
    inputParams: [
      { id: 'current_oee', name: '当前OEE', description: '设备综合效率', dataType: 'number', required: true, unit: '%', defaultValue: 85 },
      { id: 'daily_operating_hours', name: '日运行小时', description: '产线日运行时间', dataType: 'number', required: true, unit: '小时', defaultValue: 22 },
      { id: 'planned_downtime', name: '计划停机时间', description: '月度计划维护时间', dataType: 'number', required: true, unit: '小时', defaultValue: 48 },
      { id: 'product_mix', name: '产品组合', description: '各产品型号占比', dataType: 'string', required: true },
    ],
    outputMetrics: ['理论产能', '有效产能', '产能利用率', '瓶颈工序'],
    supportedSkills: ['atom_load_simulation', 'atom_queuing_theory', 'atom_linear_programming', 'atom_causal_graph', 'atom_bottleneck_detection']
  },
  {
    nodeId: 'supply_capability',
    nodeName: '产能供给能力评估',
    scenarioId: 'capacity_assessment_prediction',
    category: 'capacity_planning',
    description: '评估产能供给能力和可持续产出水平',
    inputParams: [
      { id: 'max_output', name: '最大产出', description: '设备最大产出能力', dataType: 'number', required: true, unit: 'GWh/月' },
      { id: 'quality_rate', name: '良品率', description: '产品良品率', dataType: 'number', required: true, unit: '%', defaultValue: 95 },
      { id: 'resource_limit', name: '资源限制', description: '关键资源约束', dataType: 'string', required: true },
    ],
    outputMetrics: ['供给能力', '可持续产能', '弹性空间', '质量产能'],
    supportedSkills: ['atom_time_series_forecast', 'atom_probability_distribution_fit']
  },
  {
    nodeId: 'capacity_expansion',
    nodeName: '产能扩展潜力',
    scenarioId: 'capacity_assessment_prediction',
    category: 'capacity_planning',
    description: '分析产能扩展潜力和扩产方案',
    inputParams: [
      { id: 'expansion_capacity', name: '扩产容量', description: '计划扩产容量', dataType: 'number', required: true, unit: 'GWh' },
      { id: 'unit_investment_cost', name: '单位投资成本', description: '单位产能投资成本', dataType: 'number', required: true, unit: '亿元/GWh' },
      { id: 'construction_period', name: '建设周期', description: '产能建设周期', dataType: 'number', required: true, unit: '月', defaultValue: 18 },
      { id: 'demand_growth_scenario', name: '需求增长情景', description: '需求增长预测情景', dataType: 'string', required: true, defaultValue: '基准情景' },
    ],
    outputMetrics: ['扩产潜力', '投资NPV', 'IRR', '投资回收期'],
    supportedSkills: ['atom_dcf_calculation', 'atom_cost_structure']
  },
  {
    nodeId: 'investment_decision',
    nodeName: '投资决策推演',
    scenarioId: 'capacity_assessment_prediction',
    category: 'investment_decision',
    description: '产能扩建投资决策分析',
    inputParams: [
      { id: 'capex_amount', name: '资本支出', description: '总投资金额', dataType: 'number', required: true, unit: '亿元' },
      { id: 'financing_rate', name: '融资成本', description: '年化融资成本', dataType: 'number', required: true, unit: '%', defaultValue: 5 },
      { id: 'tax_rate', name: '税率', description: '企业所得税率', dataType: 'number', required: true, unit: '%', defaultValue: 25 },
      { id: 'project_lifecycle', name: '项目周期', description: '项目运营周期', dataType: 'number', required: true, unit: '年', defaultValue: 10 },
    ],
    outputMetrics: ['投资NPV', 'IRR', '投资回收期', '产能达成率'],
    supportedSkills: ['capex_analyzer_v1', 'npv_calculator_v1', 'market_forecast_v2']
  },
  {
    nodeId: 'risk_simulation',
    nodeName: '风险情景模拟',
    scenarioId: 'capacity_assessment_prediction',
    category: 'risk_assessment',
    description: '模拟不同风险情景下的产能表现',
    inputParams: [
      { id: 'risk_scenario', name: '风险情景', description: '选择模拟的风险情景', dataType: 'string', required: true, defaultValue: '基准情景' },
      { id: 'volatility_rate', name: '波动率', description: '市场需求波动率', dataType: 'number', required: true, unit: '%', defaultValue: 15 },
      { id: 'confidence_level', name: '置信水平', description: '统计置信水平', dataType: 'number', required: true, unit: '%', defaultValue: 95 },
    ],
    outputMetrics: ['风险值VaR', '情景概率', '预期损失', '应对建议'],
    supportedSkills: ['atom_monte_carlo_simulation', 'atom_sensitivity_analysis']
  },

  // ========== 产销匹配协同推演节点 ==========
  {
    nodeId: 'demand_forecast',
    nodeName: '需求预测',
    scenarioId: 'production_sales_match',
    category: 'demand_forecast',
    description: '基于历史数据和市场信息进行需求预测',
    inputParams: [
      { id: 'historical_orders', name: '历史订单数据', description: '过去12个月订单数据', dataType: 'file', required: true, source: 'file_import' },
      { id: 'seasonality_factor', name: '季节性因子', description: '需求季节性波动系数', dataType: 'number', required: true, unit: '%', defaultValue: 15 },
      { id: 'market_growth', name: '市场增长率', description: '预期市场增长率', dataType: 'number', required: true, unit: '%', defaultValue: 20 },
      { id: 'customer_forecast', name: '客户预测', description: '大客户提供的预测数据', dataType: 'file', required: false, source: 'file_import' },
    ],
    outputMetrics: ['预测准确度', '月度需求量', '季度趋势'],
    supportedSkills: ['atom_time_series_forecast', 'atom_causal_graph', 'atom_multivariate_regression', 'atom_feature_selection', 'atom_bayesian_update', 'atom_trend_decomposition']
  },
  {
    nodeId: 'capacity_planning',
    nodeName: '产能规划',
    scenarioId: 'production_sales_match',
    category: 'production_scheduling',
    description: '平衡需求与产能，制定生产计划',
    inputParams: [
      { id: 'forecasted_demand', name: '预测需求', description: '各产品预测需求量', dataType: 'number', required: true, unit: 'MWh' },
      { id: 'available_capacity', name: '可用产能', description: '各产线可用产能', dataType: 'number', required: true, unit: 'MWh' },
      { id: 'priority_rules', name: '优先级规则', description: '订单优先级规则', dataType: 'string', required: true },
      { id: 'changeover_time', name: '换型时间', description: '产品换型所需时间', dataType: 'number', required: true, unit: '小时', defaultValue: 4 },
    ],
    outputMetrics: ['产能利用率', '订单满足率', '换型次数', '生产计划'],
    supportedSkills: ['atom_linear_programming', 'atom_mixed_integer_programming', 'atom_multi_objective_optimization', 'atom_network_flow', 'atom_constraint_expression']
  },
  {
    nodeId: 'inventory_management',
    nodeName: '库存管理',
    scenarioId: 'production_sales_match',
    category: 'supply_chain',
    description: '优化成品和原材料库存水平',
    inputParams: [
      { id: 'current_inventory', name: '当前库存', description: '各物料当前库存量', dataType: 'file', required: true, source: 'file_import' },
      { id: 'service_level_target', name: '服务水平目标', description: '目标订单满足率', dataType: 'number', required: true, unit: '%', defaultValue: 95 },
      { id: 'holding_cost_rate', name: '库存持有成本率', description: '年度库存持有成本比例', dataType: 'number', required: true, unit: '%', defaultValue: 15 },
      { id: 'stockout_cost', name: '缺货成本', description: '单位缺货成本', dataType: 'number', required: true, unit: '元/件' },
    ],
    outputMetrics: ['最优库存水平', '库存周转天数', '库存成本', '缺货风险'],
    supportedSkills: ['atom_stochastic_inventory', 'atom_probability_distribution_fit', 'atom_bayesian_update', 'atom_monte_carlo_simulation', 'atom_dynamic_programming']
  },

  // ========== 设备预测性维护推演节点 ==========
  {
    nodeId: 'health_assessment',
    nodeName: '健康评估推演',
    scenarioId: 'predictive_maintenance',
    category: 'capacity_planning',
    description: '基于传感器数据评估设备健康状态',
    inputParams: [
      { id: 'vibration_data', name: '振动数据', description: '设备振动传感器数据', dataType: 'file', required: true, source: 'file_import' },
      { id: 'temperature_data', name: '温度数据', description: '设备温度监测数据', dataType: 'file', required: true, source: 'file_import' },
      { id: 'historical_failures', name: '历史故障记录', description: '设备历史故障数据', dataType: 'file', required: false, source: 'file_import' },
    ],
    outputMetrics: ['健康指数', '退化趋势', '异常等级'],
    supportedSkills: ['atom_time_series_forecast', 'atom_anomaly_detection', 'atom_change_point_detection', 'atom_degradation_curve_fitting', 'atom_feature_importance']
  },
  {
    nodeId: 'maintenance_decision',
    nodeName: '维护决策推演',
    scenarioId: 'predictive_maintenance',
    category: 'investment_decision',
    description: '基于健康评估制定维护策略',
    inputParams: [
      { id: 'health_score', name: '健康评分', description: '当前设备健康评分', dataType: 'number', required: true, unit: '分', defaultValue: 80 },
      { id: 'rul_estimate', name: 'RUL估计', description: '剩余使用寿命估计', dataType: 'number', required: true, unit: '天' },
      { id: 'maintenance_costs', name: '维护成本', description: '不同维护策略成本', dataType: 'object', required: true },
    ],
    outputMetrics: ['最优维护时机', '维护成本', '停机损失'],
    supportedSkills: ['atom_remaining_useful_life', 'atom_threshold_decision', 'atom_cost_structure', 'atom_monte_carlo_simulation']
  },

  // ========== 设备故障维修时间预测推演节点 ==========
  {
    nodeId: 'failure_classification',
    nodeName: '故障分类推演',
    scenarioId: 'breakdown_maintenance',
    category: 'quality_prediction',
    description: '对设备故障类型进行分类识别',
    inputParams: [
      { id: 'symptoms', name: '故障症状', description: '设备故障症状描述', dataType: 'string', required: true },
      { id: 'sensor_anomalies', name: '传感器异常', description: '异常传感器数据', dataType: 'array', required: true },
      { id: 'fault_codes', name: '故障代码', description: '设备故障代码', dataType: 'array', required: false },
    ],
    outputMetrics: ['故障类型', '置信度', '严重等级'],
    supportedSkills: ['atom_classification', 'atom_clustering', 'atom_feature_importance']
  },
  {
    nodeId: 'repair_time_estimation',
    nodeName: '维修工时预测推演',
    scenarioId: 'breakdown_maintenance',
    category: 'demand_forecast',
    description: '预测故障维修所需时间',
    inputParams: [
      { id: 'fault_type', name: '故障类型', description: '已识别的故障类型', dataType: 'string', required: true },
      { id: 'equipment_model', name: '设备型号', description: '设备型号信息', dataType: 'string', required: true },
      { id: 'maintenance_history', name: '历史维修数据', description: '类似故障历史维修时间', dataType: 'file', required: false, source: 'file_import' },
    ],
    outputMetrics: ['预计维修时间', '置信区间', '工时范围'],
    supportedSkills: ['atom_multivariate_regression', 'atom_time_series_forecast', 'atom_probability_distribution_fit', 'atom_resource_allocation', 'atom_queuing_theory']
  },
  {
    nodeId: 'resource_scheduling',
    nodeName: '资源调度推演',
    scenarioId: 'breakdown_maintenance',
    category: 'production_scheduling',
    description: '优化维修资源调度方案',
    inputParams: [
      { id: 'required_skills', name: '所需技能', description: '维修所需技能要求', dataType: 'array', required: true },
      { id: 'available_technicians', name: '可用技师', description: '当前可用维修人员', dataType: 'array', required: true },
      { id: 'spare_parts_location', name: '备件位置', description: '所需备件存储位置', dataType: 'object', required: true },
    ],
    outputMetrics: ['最优调度方案', '等待时间', '总成本'],
    supportedSkills: ['atom_shortest_path', 'atom_resource_allocation', 'atom_queuing_theory', 'atom_priority_sorting']
  },

  // ========== 销售与运营计划推演节点 ==========
  {
    nodeId: 'sales_planning',
    nodeName: '销售计划推演',
    scenarioId: 'production_sales_match',
    category: 'production_scheduling',
    description: '基于需求预测制定销售计划',
    inputParams: [
      { id: 'forecast_demand', name: '预测需求', description: '需求预测结果', dataType: 'array', required: true },
      { id: 'sales_targets', name: '销售目标', description: '销售目标设定', dataType: 'object', required: true },
      { id: 'customer_priorities', name: '客户优先级', description: '客户分级信息', dataType: 'object', required: true },
    ],
    outputMetrics: ['销售计划', '目标达成率', '缺口分析'],
    supportedSkills: ['atom_multi_objective_optimization', 'atom_monte_carlo_simulation', 'atom_linear_programming', 'atom_sensitivity_analysis', 'atom_probability_scoring']
  },
  {
    nodeId: 'production_balance',
    nodeName: '产销平衡推演',
    scenarioId: 'production_sales_match',
    category: 'production_scheduling',
    description: '平衡销售需求与产能供给',
    inputParams: [
      { id: 'sales_plan', name: '销售计划', description: '销售计划数据', dataType: 'array', required: true },
      { id: 'capacity_available', name: '可用产能', description: '各产线可用产能', dataType: 'array', required: true },
      { id: 'inventory_policy', name: '库存策略', description: '库存管理策略', dataType: 'object', required: true },
    ],
    outputMetrics: ['产销缺口', '平衡方案', '库存建议'],
    supportedSkills: ['atom_linear_programming', 'atom_mixed_integer_programming', 'atom_multi_objective_optimization', 'atom_inventory_model', 'atom_network_flow']
  },
  {
    nodeId: 'delivery_coordination',
    nodeName: '交付协同推演',
    scenarioId: 'production_sales_match',
    category: 'supply_chain',
    description: '优化交付计划和物流协同',
    inputParams: [
      { id: 'customer_orders', name: '客户订单', description: '客户订单数据', dataType: 'array', required: true },
      { id: 'logistics_capacity', name: '物流运力', description: '可用物流运力', dataType: 'object', required: true },
      { id: 'delivery_constraints', name: '交付约束', description: '交付时间和方式约束', dataType: 'object', required: true },
    ],
    outputMetrics: ['交付计划', '准时交付率', '物流成本'],
    supportedSkills: ['atom_network_flow', 'atom_shortest_path', 'atom_resource_allocation', 'atom_constraint_expression']
  },

  // ========== 需求预测推演节点 ==========
  {
    nodeId: 'market_analysis',
    nodeName: '需求预测推演',
    scenarioId: 'demand_forecast',
    category: 'demand_forecast',
    description: '分析市场趋势预测需求',
    inputParams: [
      { id: 'historical_sales', name: '历史销售', description: '历史销售数据', dataType: 'file', required: true, source: 'file_import' },
      { id: 'market_indicators', name: '市场指标', description: '宏观经济指标', dataType: 'array', required: false },
      { id: 'seasonality', name: '季节性', description: '季节性因素', dataType: 'boolean', required: true, defaultValue: true },
    ],
    outputMetrics: ['需求预测', '置信区间', '趋势分析'],
    supportedSkills: ['atom_time_series_forecast', 'atom_causal_graph', 'atom_multivariate_regression', 'atom_feature_selection', 'atom_trend_decomposition']
  },

  // ========== 主生产计划推演节点 ==========
  {
    nodeId: 'mps_generation',
    nodeName: '主生产计划推演',
    scenarioId: 'master_production_schedule',
    category: 'production_scheduling',
    description: '生成优化的主生产计划',
    inputParams: [
      { id: 'demand_plan', name: '需求计划', description: '需求预测计划', dataType: 'array', required: true },
      { id: 'bom_structure', name: 'BOM结构', description: '物料清单结构', dataType: 'object', required: true },
      { id: 'resource_constraints', name: '资源约束', description: '生产资源约束', dataType: 'object', required: true },
    ],
    outputMetrics: ['MPS计划', '资源利用率', '交付达成率'],
    supportedSkills: ['atom_mixed_integer_programming', 'atom_constraint_programming', 'atom_network_flow', 'atom_graph_path_search', 'atom_rule_engine']
  },

  // ========== 产能评估/约束规则推演节点 ==========
  {
    nodeId: 'capacity_assessment',
    nodeName: '产能评估推演',
    scenarioId: 'capacity_constraint_rules',
    category: 'capacity_planning',
    description: '评估产能状况和识别约束',
    inputParams: [
      { id: 'equipment_status', name: '设备状态', description: '设备运行状态', dataType: 'array', required: true },
      { id: 'production_orders', name: '生产订单', description: '当前生产订单', dataType: 'array', required: true },
      { id: 'shift_schedule', name: '班次安排', description: '人员班次安排', dataType: 'object', required: true },
    ],
    outputMetrics: ['产能评估', '瓶颈识别', '约束分析'],
    supportedSkills: ['atom_load_simulation', 'atom_time_series_forecast', 'atom_bottleneck_detection', 'atom_constraint_expression', 'atom_priority_sorting']
  },

  // ========== 插单管理推演节点 ==========
  {
    nodeId: 'rush_order_management',
    nodeName: '插单管理推演',
    scenarioId: 'rush_order_management',
    category: 'production_scheduling',
    description: '处理紧急插单的影响分析',
    inputParams: [
      { id: 'rush_order', name: '插单信息', description: '紧急订单信息', dataType: 'object', required: true },
      { id: 'current_schedule', name: '当前排程', description: '当前生产排程', dataType: 'array', required: true },
      { id: 'flexibility_options', name: '柔性选项', description: '可调整的生产选项', dataType: 'object', required: true },
    ],
    outputMetrics: ['插单可行性', '影响分析', '调整方案'],
    supportedSkills: ['atom_mixed_integer_programming', 'atom_multi_objective_optimization', 'atom_causal_graph', 'atom_resource_conflict_detection', 'atom_load_simulation']
  },

  // ========== 变更管理推演节点 ==========
  {
    nodeId: 'change_management',
    nodeName: '变更管理推演',
    scenarioId: 'change_management',
    category: 'risk_assessment',
    description: '分析生产变更的影响和传播',
    inputParams: [
      { id: 'change_request', name: '变更请求', description: '变更内容描述', dataType: 'object', required: true },
      { id: 'affected_processes', name: '受影响流程', description: '可能受影响的生产流程', dataType: 'array', required: true },
      { id: 'dependency_map', name: '依赖图', description: '流程依赖关系', dataType: 'object', required: true },
    ],
    outputMetrics: ['影响范围', '传播路径', '风险评估'],
    supportedSkills: ['atom_causal_graph', 'atom_constraint_relaxation', 'atom_path_impact_propagation', 'atom_rule_engine', 'atom_monte_carlo_simulation']
  },

  // ========== 异常预警推演节点 ==========
  {
    nodeId: 'abnormal_alert',
    nodeName: '异常预警推演',
    scenarioId: 'abnormal_alert',
    category: 'quality_prediction',
    description: '多维度异常检测和预警',
    inputParams: [
      { id: 'kpi_metrics', name: 'KPI指标', description: '关键绩效指标', dataType: 'object', required: true },
      { id: 'threshold_settings', name: '阈值设置', description: '预警阈值配置', dataType: 'object', required: true },
      { id: 'historical_anomalies', name: '历史异常', description: '历史异常记录', dataType: 'array', required: false },
    ],
    outputMetrics: ['预警等级', '根因分析', '处理建议'],
    supportedSkills: ['atom_anomaly_detection', 'atom_causal_graph', 'atom_root_cause_analysis', 'atom_probability_scoring', 'atom_event_priority']
  },

  // ========== 供应商协同推演节点 ==========
  {
    nodeId: 'supplier_collaboration',
    nodeName: '供应商协同推演',
    scenarioId: 'supplier_collaboration',
    category: 'supply_chain',
    description: '评估供应商协同风险和优化方案',
    inputParams: [
      { id: 'supplier_performance', name: '供应商绩效', description: '供应商历史绩效数据', dataType: 'array', required: true },
      { id: 'order_commitments', name: '订单承诺', description: '供应商交付承诺', dataType: 'array', required: true },
      { id: 'risk_factors', name: '风险因素', description: '供应风险因素', dataType: 'object', required: true },
    ],
    outputMetrics: ['履约概率', '风险评估', '备选方案'],
    supportedSkills: ['atom_performance_probability', 'atom_time_series_forecast', 'atom_risk_scoring', 'atom_network_flow', 'atom_alternative_path']
  },

  // ========== What-if模拟推演节点 ==========
  {
    nodeId: 'what_if_simulation',
    nodeName: 'What-if模拟推演',
    scenarioId: 'what_if_simulation',
    category: 'risk_assessment',
    description: '多情景假设分析和模拟',
    inputParams: [
      { id: 'base_scenario', name: '基准情景', description: '当前基准方案', dataType: 'object', required: true },
      { id: 'variable_changes', name: '变量变更', description: '要测试的变量变化', dataType: 'array', required: true },
      { id: 'n_simulations', name: '模拟次数', description: '蒙特卡洛模拟次数', dataType: 'number', required: true, defaultValue: 1000 },
    ],
    outputMetrics: ['情景结果', '概率分布', '敏感性分析'],
    supportedSkills: ['atom_monte_carlo_simulation', 'atom_scenario_generation', 'atom_multi_objective_optimization', 'atom_sensitivity_analysis', 'atom_constraint_expression']
  },

  // ========== 利润模拟推演节点 ==========
  {
    nodeId: 'profit_simulation',
    nodeName: '利润模拟推演',
    scenarioId: 'profit_simulation',
    category: 'financial_analysis',
    description: '多维度利润模拟和优化',
    inputParams: [
      { id: 'revenue_model', name: '收入模型', description: '收入构成模型', dataType: 'object', required: true },
      { id: 'cost_structure', name: '成本结构', description: '成本构成数据', dataType: 'object', required: true },
      { id: 'volume_scenarios', name: '销量情景', description: '不同销量情景', dataType: 'array', required: true },
    ],
    outputMetrics: ['利润预测', '盈亏平衡', '优化建议'],
    supportedSkills: ['atom_linear_programming', 'atom_multi_objective_optimization', 'atom_dcf_calculation', 'atom_cost_structure', 'atom_resource_allocation']
  },

  // ========== KPI监控推演节点 ==========
  {
    nodeId: 'kpi_monitoring',
    nodeName: 'KPI监控推演',
    scenarioId: 'kpi_monitoring',
    category: 'quality_prediction',
    description: 'KPI指标监控和趋势分析',
    inputParams: [
      { id: 'kpi_definitions', name: 'KPI定义', description: 'KPI指标定义', dataType: 'array', required: true },
      { id: 'target_values', name: '目标值', description: 'KPI目标值', dataType: 'object', required: true },
      { id: 'actual_values', name: '实际值', description: 'KPI实际值', dataType: 'object', required: true },
    ],
    outputMetrics: ['KPI得分', '趋势预测', '改进建议'],
    supportedSkills: ['atom_metric_anomaly_detection', 'atom_causal_graph', 'atom_time_series_forecast', 'atom_trend_decomposition', 'atom_rule_engine']
  },
];

// 根据节点ID获取推演配置
export function getSimulationConfig(nodeId: string): import('./types').SimulationNodeConfig | undefined {
  return SIMULATION_NODES.find(config => config.nodeId === nodeId);
}

// 判断节点是否为推演分析节点
export function isSimulationNode(nodeId: string): boolean {
  return SIMULATION_NODES.some(config => config.nodeId === nodeId);
}

// ==================== 原子化业务语义库 ====================
// 企业统一的语义标准 - 不可再分的业务因子

export const ATOMIC_ONTOLOGY_LIBRARY: AtomicOntology[] = [
  // 物理量
  {
    id: 'atom_temperature',
    name: '温度',
    description: '物理环境的温度测量值',
    category: 'physical',
    dataType: 'number',
    unit: '°C',
    constraints: { min: -273.15, max: 10000 },
    tags: ['物理', '环境', '热力学'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_pressure',
    name: '压力',
    description: '气体或液体的压力值',
    category: 'physical',
    dataType: 'number',
    unit: 'Pa',
    constraints: { min: 0, max: 100000000 },
    tags: ['物理', '流体', '力学'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_vibration_frequency',
    name: '振动频率',
    description: '机械振动的频率',
    category: 'physical',
    dataType: 'number',
    unit: 'Hz',
    constraints: { min: 0, max: 100000 },
    tags: ['物理', '振动', '机械'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_vibration_amplitude',
    name: '振动幅度',
    description: '机械振动的幅度',
    category: 'physical',
    dataType: 'number',
    unit: 'mm',
    constraints: { min: 0, max: 1000 },
    tags: ['物理', '振动', '机械'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_thickness',
    name: '厚度',
    description: '物体厚度测量值',
    category: 'physical',
    dataType: 'number',
    unit: 'μm',
    constraints: { min: 0, max: 100000 },
    tags: ['物理', '尺寸', '几何'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // 化学量
  {
    id: 'atom_purity',
    name: '纯度',
    description: '物质的纯度百分比',
    category: 'chemical',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['化学', '质量', '成分'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_ph_value',
    name: 'PH值',
    description: '酸碱度测量值',
    category: 'chemical',
    dataType: 'number',
    unit: 'pH',
    constraints: { min: 0, max: 14 },
    tags: ['化学', '酸碱度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_viscosity',
    name: '粘度',
    description: '流体粘度',
    category: 'chemical',
    dataType: 'number',
    unit: 'Pa·s',
    constraints: { min: 0, max: 1000000 },
    tags: ['化学', '流体', '物理性质'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_moisture_content',
    name: '水分含量',
    description: '物质中水分的含量',
    category: 'chemical',
    dataType: 'number',
    unit: 'ppm',
    constraints: { min: 0, max: 1000000 },
    tags: ['化学', '湿度', '质量'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // 时间量
  {
    id: 'atom_duration',
    name: '持续时间',
    description: '过程或操作的持续时间',
    category: 'temporal',
    dataType: 'number',
    unit: 's',
    constraints: { min: 0, max: 3153600000 },
    tags: ['时间', '周期'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_frequency',
    name: '频率',
    description: '事件发生的频率',
    category: 'temporal',
    dataType: 'number',
    unit: 'Hz',
    constraints: { min: 0, max: 1000000000 },
    tags: ['时间', '速率'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_timestamp',
    name: '时间戳',
    description: '事件发生的具体时间点',
    category: 'temporal',
    dataType: 'datetime',
    tags: ['时间', '记录'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // 财务量
  {
    id: 'atom_cost',
    name: '成本',
    description: '生产或运营成本',
    category: 'financial',
    dataType: 'number',
    unit: 'CNY',
    constraints: { min: 0 },
    tags: ['财务', '成本', '经济'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_unit_cost',
    name: '单位成本',
    description: '单位产品成本',
    category: 'financial',
    dataType: 'number',
    unit: 'CNY/unit',
    constraints: { min: 0 },
    tags: ['财务', '成本', '单位'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_energy_cost',
    name: '能耗成本',
    description: '能源消耗成本',
    category: 'financial',
    dataType: 'number',
    unit: 'CNY',
    constraints: { min: 0 },
    tags: ['财务', '能耗', '成本'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_inventory_value',
    name: '库存价值',
    description: '库存物资价值',
    category: 'financial',
    dataType: 'number',
    unit: 'CNY',
    constraints: { min: 0 },
    tags: ['财务', '库存', '资产'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // 物流量
  {
    id: 'atom_inventory_days',
    name: '库存天数',
    description: '库存可维持的天数',
    category: 'logistical',
    dataType: 'number',
    unit: 'days',
    constraints: { min: 0 },
    tags: ['物流', '库存', '周转'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_turnover_rate',
    name: '周转率',
    description: '库存周转速度',
    category: 'logistical',
    dataType: 'number',
    unit: '次/年',
    constraints: { min: 0 },
    tags: ['物流', '库存', '效率'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_delivery_time',
    name: '配送时间',
    description: '从订单到交付的时间',
    category: 'logistical',
    dataType: 'number',
    unit: 'hours',
    constraints: { min: 0 },
    tags: ['物流', '配送', '时间'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_quantity',
    name: '数量',
    description: '物品的数量',
    category: 'logistical',
    dataType: 'number',
    unit: 'pcs',
    constraints: { min: 0 },
    tags: ['物流', '计数'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // 质量量
  {
    id: 'atom_defect_rate',
    name: '缺陷率',
    description: '产品缺陷百分比',
    category: 'quality',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['质量', '缺陷', '百分比'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_yield_rate',
    name: '良品率',
    description: '产品合格百分比',
    category: 'quality',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['质量', '合格', '百分比'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_precision',
    name: '精度',
    description: '加工或测量精度',
    category: 'quality',
    dataType: 'number',
    unit: 'mm',
    constraints: { min: 0 },
    tags: ['质量', '精度', '尺寸'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_surface_roughness',
    name: '表面粗糙度',
    description: '表面光洁度',
    category: 'quality',
    dataType: 'number',
    unit: 'Ra',
    constraints: { min: 0 },
    tags: ['质量', '表面', '粗糙度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  // 运营量
  {
    id: 'atom_capacity',
    name: '产能',
    description: '生产能力',
    category: 'operational',
    dataType: 'number',
    unit: 'units/hour',
    constraints: { min: 0 },
    tags: ['运营', '产能', '效率'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_oee',
    name: 'OEE',
    description: '设备综合效率',
    category: 'operational',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['运营', '设备', '效率'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_utilization_rate',
    name: '利用率',
    description: '资源利用率',
    category: 'operational',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['运营', '效率', '利用'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_mttr',
    name: 'MTTR',
    description: '平均修复时间',
    category: 'operational',
    dataType: 'number',
    unit: 'minutes',
    constraints: { min: 0 },
    tags: ['运营', '维护', '时间'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_mtbf',
    name: 'MTBF',
    description: '平均故障间隔时间',
    category: 'operational',
    dataType: 'number',
    unit: 'hours',
    constraints: { min: 0 },
    tags: ['运营', '可靠性', '时间'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ==================== 锂电制造专用原子业务语义 ====================

  // === 电性能 (electrical) ===
  {
    id: 'atom_voltage',
    name: '电压',
    description: '电池电压或极片电位',
    category: 'electrical',
    dataType: 'number',
    unit: 'V',
    constraints: { min: 0, max: 5 },
    tags: ['电性能', '电池', '电压'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_current',
    name: '电流',
    description: '充放电电流',
    category: 'electrical',
    dataType: 'number',
    unit: 'A',
    constraints: { min: -1000, max: 1000 },
    tags: ['电性能', '电流', '充放电'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_resistance',
    name: '内阻',
    description: '电池交流内阻或直流内阻',
    category: 'electrical',
    dataType: 'number',
    unit: 'mΩ',
    constraints: { min: 0, max: 100 },
    tags: ['电性能', '内阻', '电池'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_capacity',
    name: '容量',
    description: '电池额定容量或实际容量',
    category: 'electrical',
    dataType: 'number',
    unit: 'Ah',
    constraints: { min: 0, max: 10000 },
    tags: ['电性能', '容量', '电池'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_energy_density',
    name: '能量密度',
    description: '质量能量密度或体积能量密度',
    category: 'electrical',
    dataType: 'number',
    unit: 'Wh/kg',
    constraints: { min: 0, max: 500 },
    tags: ['电性能', '能量密度', '电池'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_power_density',
    name: '功率密度',
    description: '质量功率密度',
    category: 'electrical',
    dataType: 'number',
    unit: 'W/kg',
    constraints: { min: 0, max: 20000 },
    tags: ['电性能', '功率密度', '电池'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_soc',
    name: 'SOC',
    description: '电池荷电状态(State of Charge)',
    category: 'electrical',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['电性能', 'SOC', '电池状态'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_soh',
    name: 'SOH',
    description: '电池健康状态(State of Health)',
    category: 'electrical',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['电性能', 'SOH', '电池健康'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_coulombic_efficiency',
    name: '库伦效率',
    description: '充放电库伦效率',
    category: 'electrical',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['电性能', '效率', '电池'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_self_discharge',
    name: '自放电率',
    description: '电池自放电速率',
    category: 'electrical',
    dataType: 'number',
    unit: '%/月',
    constraints: { min: 0, max: 100 },
    tags: ['电性能', '自放电', '电池'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // === 材料特性 (material) ===
  {
    id: 'atom_particle_size',
    name: '粒径(D50)',
    description: '材料中位粒径',
    category: 'material',
    dataType: 'number',
    unit: 'μm',
    constraints: { min: 0, max: 100 },
    tags: ['材料', '粒径', '正极', '负极'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_specific_surface',
    name: '比表面积',
    description: '材料单位质量的表面积',
    category: 'material',
    dataType: 'number',
    unit: 'm²/g',
    constraints: { min: 0, max: 100 },
    tags: ['材料', '比表面积', '正极', '负极'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_tap_density',
    name: '振实密度',
    description: '材料振实后的密度',
    category: 'material',
    dataType: 'number',
    unit: 'g/cm³',
    constraints: { min: 0, max: 10 },
    tags: ['材料', '密度', '正极', '负极'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_bulk_density',
    name: '松装密度',
    description: '材料自然堆积密度',
    category: 'material',
    dataType: 'number',
    unit: 'g/cm³',
    constraints: { min: 0, max: 10 },
    tags: ['材料', '密度', '正极', '负极'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_moisture_content_ppm',
    name: '水分含量(PPM)',
    description: '材料中微量水分含量',
    category: 'material',
    dataType: 'number',
    unit: 'ppm',
    constraints: { min: 0, max: 10000 },
    tags: ['材料', '水分', '正极', '负极', '电解液'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_magnetic_impurities',
    name: '磁性异物',
    description: '材料中磁性杂质含量',
    category: 'material',
    dataType: 'number',
    unit: 'ppb',
    constraints: { min: 0, max: 100000 },
    tags: ['材料', '杂质', '正极', '安全'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_electrolyte_conductivity',
    name: '电解液电导率',
    description: '电解液离子电导率',
    category: 'material',
    dataType: 'number',
    unit: 'mS/cm',
    constraints: { min: 0, max: 20 },
    tags: ['材料', '电解液', '电导率'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_electrolyte_density',
    name: '电解液密度',
    description: '电解液质量密度',
    category: 'material',
    dataType: 'number',
    unit: 'g/cm³',
    constraints: { min: 0.5, max: 2 },
    tags: ['材料', '电解液', '密度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_separator_porosity',
    name: '隔膜孔隙率',
    description: '隔膜孔隙体积占比',
    category: 'material',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['材料', '隔膜', '孔隙'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_separator_thickness',
    name: '隔膜厚度',
    description: '隔膜基材厚度',
    category: 'material',
    dataType: 'number',
    unit: 'μm',
    constraints: { min: 1, max: 50 },
    tags: ['材料', '隔膜', '厚度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_active_material_ratio',
    name: '活性物质比例',
    description: '极片中活性物质质量占比',
    category: 'material',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['材料', '极片', '配方'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // === 工艺参数 (process) ===
  {
    id: 'atom_slurry_viscosity',
    name: '浆料粘度',
    description: '搅拌后浆料的粘度',
    category: 'process',
    dataType: 'number',
    unit: 'mPa·s',
    constraints: { min: 0, max: 50000 },
    tags: ['工艺', '搅拌', '浆料', '粘度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_slurry_solid_content',
    name: '浆料固含量',
    description: '浆料中固体物质质量占比',
    category: 'process',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['工艺', '搅拌', '浆料', '固含量'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_slurry_fineness',
    name: '浆料细度',
    description: '浆料中颗粒细度',
    category: 'process',
    dataType: 'number',
    unit: 'μm',
    constraints: { min: 0, max: 100 },
    tags: ['工艺', '搅拌', '浆料', '细度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_coating_speed',
    name: '涂布速度',
    description: '极片涂布线速度',
    category: 'process',
    dataType: 'number',
    unit: 'm/min',
    constraints: { min: 0, max: 200 },
    tags: ['工艺', '涂布', '速度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_areal_density',
    name: '面密度',
    description: '极片单位面积质量',
    category: 'process',
    dataType: 'number',
    unit: 'mg/cm²',
    constraints: { min: 0, max: 100 },
    tags: ['工艺', '涂布', '面密度', '质量'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_calendering_pressure',
    name: '辊压压力',
    description: '极片辊压线压力',
    category: 'process',
    dataType: 'number',
    unit: 'T/m',
    constraints: { min: 0, max: 200 },
    tags: ['工艺', '辊压', '压力'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_calendering_gaps',
    name: '辊缝间隙',
    description: '辊压时上下辊间隙',
    category: 'process',
    dataType: 'number',
    unit: 'μm',
    constraints: { min: 0, max: 1000 },
    tags: ['工艺', '辊压', '间隙'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_electrode_density',
    name: '极片压实密度',
    description: '辊压后极片密度',
    category: 'process',
    dataType: 'number',
    unit: 'g/cm³',
    constraints: { min: 0, max: 5 },
    tags: ['工艺', '辊压', '密度', '极片'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_slitting_width',
    name: '分切宽度',
    description: '极片分切后宽度',
    category: 'process',
    dataType: 'number',
    unit: 'mm',
    constraints: { min: 0, max: 1000 },
    tags: ['工艺', '分切', '宽度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_burr_height',
    name: '毛刺高度',
    description: '分切后极片边缘毛刺高度',
    category: 'process',
    dataType: 'number',
    unit: 'μm',
    constraints: { min: 0, max: 50 },
    tags: ['工艺', '分切', '毛刺', '安全'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_winding_tension',
    name: '卷绕张力',
    description: '极片卷绕时的张力',
    category: 'process',
    dataType: 'number',
    unit: 'N',
    constraints: { min: 0, max: 500 },
    tags: ['工艺', '卷绕', '张力'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_alignment_accuracy',
    name: '对齐度',
    description: '正负极片对齐精度',
    category: 'process',
    dataType: 'number',
    unit: 'mm',
    constraints: { min: 0, max: 10 },
    tags: ['工艺', '卷绕', '叠片', '对齐'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_overhang',
    name: 'Overhang',
    description: '负极超出正极的长度',
    category: 'process',
    dataType: 'number',
    unit: 'mm',
    constraints: { min: 0, max: 10 },
    tags: ['工艺', '卷绕', '叠片', '安全'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_electrolyte_injection',
    name: '注液量',
    description: '单电芯注液量',
    category: 'process',
    dataType: 'number',
    unit: 'g',
    constraints: { min: 0, max: 1000 },
    tags: ['工艺', '注液', '电解液'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_formation_voltage',
    name: '化成电压',
    description: '化成工艺截止电压',
    category: 'process',
    dataType: 'number',
    unit: 'V',
    constraints: { min: 0, max: 5 },
    tags: ['工艺', '化成', '电压'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_formation_current',
    name: '化成电流',
    description: '化成工艺电流',
    category: 'process',
    dataType: 'number',
    unit: 'A',
    constraints: { min: 0, max: 100 },
    tags: ['工艺', '化成', '电流'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_aging_time',
    name: '老化时间',
    description: '高温或常温老化时间',
    category: 'process',
    dataType: 'number',
    unit: 'h',
    constraints: { min: 0, max: 720 },
    tags: ['工艺', '化成', '老化', '时间'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // === 环境参数 (environmental) ===
  {
    id: 'atom_dew_point',
    name: '露点温度',
    description: '环境空气露点温度',
    category: 'environmental',
    dataType: 'number',
    unit: '°C',
    constraints: { min: -100, max: 50 },
    tags: ['环境', '湿度', '露点', '干燥'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_cleanliness',
    name: '洁净度',
    description: '车间空气洁净度等级',
    category: 'environmental',
    dataType: 'string',
    constraints: { enum: ['Class 100', 'Class 1000', 'Class 10000', 'Class 100000'] },
    tags: ['环境', '洁净度', '车间'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_ambient_humidity',
    name: '环境湿度',
    description: '环境相对湿度',
    category: 'environmental',
    dataType: 'number',
    unit: '%RH',
    constraints: { min: 0, max: 100 },
    tags: ['环境', '湿度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_dust_particles',
    name: '粉尘颗粒数',
    description: '单位体积空气中粉尘颗粒数',
    category: 'environmental',
    dataType: 'number',
    unit: '个/m³',
    constraints: { min: 0 },
    tags: ['环境', '粉尘', '洁净度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // === 安全参数 (safety) ===
  {
    id: 'atom_temperature_rise',
    name: '温升',
    description: '电池工作温升',
    category: 'safety',
    dataType: 'number',
    unit: '°C',
    constraints: { min: 0, max: 100 },
    tags: ['安全', '温度', '热失控'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_gas_concentration',
    name: '气体浓度',
    description: '电解液挥发气体或产气浓度',
    category: 'safety',
    dataType: 'number',
    unit: 'ppm',
    constraints: { min: 0 },
    tags: ['安全', '气体', '泄漏'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_short_circuit_current',
    name: '短路电流',
    description: '电池短路时电流',
    category: 'safety',
    dataType: 'number',
    unit: 'A',
    constraints: { min: 0 },
    tags: ['安全', '短路', '电流'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_nail_penetration',
    name: '针刺通过率',
    description: '针刺安全测试通过率',
    category: 'safety',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['安全', '针刺', '测试'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_crush_resistance',
    name: '挤压通过率',
    description: '挤压安全测试通过率',
    category: 'safety',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['安全', '挤压', '测试'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // === 设备参数 (equipment) ===
  {
    id: 'atom_spindle_speed',
    name: '主轴转速',
    description: '设备主轴旋转速度',
    category: 'equipment',
    dataType: 'number',
    unit: 'rpm',
    constraints: { min: 0, max: 10000 },
    tags: ['设备', '转速', '主轴'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_tension_control',
    name: '张力控制精度',
    description: '设备张力控制精度',
    category: 'equipment',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['设备', '张力', '精度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_positioning_accuracy',
    name: '定位精度',
    description: '设备定位精度',
    category: 'equipment',
    dataType: 'number',
    unit: 'mm',
    constraints: { min: 0, max: 10 },
    tags: ['设备', '定位', '精度'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_motor_power',
    name: '电机功率',
    description: '设备电机功率',
    category: 'equipment',
    dataType: 'number',
    unit: 'kW',
    constraints: { min: 0, max: 1000 },
    tags: ['设备', '电机', '功率'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_equipment_oee',
    name: '设备OEE',
    description: '设备综合效率',
    category: 'equipment',
    dataType: 'number',
    unit: '%',
    constraints: { min: 0, max: 100 },
    tags: ['设备', 'OEE', '效率'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // === 产品规格 (product) ===
  {
    id: 'atom_cell_dimensions',
    name: '电芯尺寸',
    description: '电芯长宽厚尺寸',
    category: 'product',
    dataType: 'object',
    tags: ['产品', '电芯', '尺寸'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_cell_weight',
    name: '电芯重量',
    description: '电芯单体重量',
    category: 'product',
    dataType: 'number',
    unit: 'g',
    constraints: { min: 0, max: 10000 },
    tags: ['产品', '电芯', '重量'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_pack_voltage',
    name: 'Pack电压',
    description: '电池包额定电压',
    category: 'product',
    dataType: 'number',
    unit: 'V',
    constraints: { min: 0, max: 1000 },
    tags: ['产品', 'Pack', '电压'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_pack_capacity',
    name: 'Pack容量',
    description: '电池包额定容量',
    category: 'product',
    dataType: 'number',
    unit: 'Ah',
    constraints: { min: 0, max: 10000 },
    tags: ['产品', 'Pack', '容量'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_cycle_life',
    name: '循环寿命',
    description: '电池循环次数（容量保持80%）',
    category: 'product',
    dataType: 'number',
    unit: '次',
    constraints: { min: 0, max: 10000 },
    tags: ['产品', '寿命', '循环'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_voltage_consistency',
    name: '电压一致性',
    description: '电池包内单体电压差异',
    category: 'product',
    dataType: 'number',
    unit: 'mV',
    constraints: { min: 0, max: 1000 },
    tags: ['产品', 'Pack', '一致性', 'BMS'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'atom_temperature_consistency',
    name: '温度一致性',
    description: '电池包内温度差异',
    category: 'product',
    dataType: 'number',
    unit: '°C',
    constraints: { min: 0, max: 20 },
    tags: ['产品', 'Pack', '一致性', '热管理'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// 原子分类标签
export const ATOMIC_CATEGORIES = [
  // 通用分类
  { value: 'physical', label: '物理量', color: '#3b82f6', icon: 'Gauge', description: '温度、压力、振动等物理参数' },
  { value: 'chemical', label: '化学量', color: '#8b5cf6', icon: 'Beaker', description: '纯度、PH值、化学成分等' },
  { value: 'temporal', label: '时间量', color: '#06b6d4', icon: 'Clock', description: '周期、频率、持续时间等' },
  { value: 'financial', label: '财务量', color: '#10b981', icon: 'DollarSign', description: '成本、价格、利润率等' },
  { value: 'logistical', label: '物流量', color: '#f59e0b', icon: 'Package', description: '库存、周转率、配送时间等' },
  { value: 'quality', label: '质量量', color: '#ef4444', icon: 'CheckCircle', description: '合格率、缺陷率、精度等' },
  { value: 'operational', label: '运营量', color: '#6366f1', icon: 'Activity', description: '产能、OEE、利用率等' },
  // 锂电制造专用分类
  { value: 'electrical', label: '电性能', color: '#f59e0b', icon: 'Zap', description: '电压、电流、容量、内阻等电池电性能参数' },
  { value: 'material', label: '材料特性', color: '#14b8a6', icon: 'CircleDot', description: '粒径、比表面积、振实密度等材料参数' },
  { value: 'process', label: '工艺参数', color: '#ec4899', icon: 'Settings', description: '涂布速度、辊压压力、注液量等工艺参数' },
  { value: 'environmental', label: '环境参数', color: '#84cc16', icon: 'Cloud', description: '露点温度、洁净度、环境湿度等' },
  { value: 'safety', label: '安全参数', color: '#dc2626', icon: 'ShieldAlert', description: '温升、气体浓度、安全测试等' },
  { value: 'equipment', label: '设备参数', color: '#64748b', icon: 'Wrench', description: '主轴转速、张力、定位精度等设备参数' },
  { value: 'product', label: '产品规格', color: '#0ea5e9', icon: 'Box', description: '电芯尺寸、重量、循环寿命等产品参数' }
];

// ==================== 产销场景专用业务语义库 ====================
// 用于业务流程图谱倒推业务语义和技能

export interface BusinessSemanticDef {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'production' | 'inventory' | 'quality' | 'finance' | 'logistics' | 'customer' | 'planning';
  atoms: string[]; // 关联的业务释义ID
  skills: string[]; // 关联的技能ID
  processNodes: string[]; // 关联的业务流程节点ID
}

// 产销场景业务语义定义 - 36个原子业务语义
export const PRODUCTION_SALES_SEMANTICS: BusinessSemanticDef[] = [
  // === 销售类 (5个) ===
  {
    id: 'sem_sales_forecast',
    name: '销售预测',
    description: '基于历史数据和市场趋势预测未来销售量',
    category: 'sales',
    atoms: ['atom_quantity', 'atom_timestamp', 'atom_frequency', 'atom_energy_density', 'atom_capacity'],
    skills: ['demand_forecast_v3'],
    processNodes: ['demand_forecast', 'sales_planning']
  },
  {
    id: 'sem_order_management',
    name: '订单管理',
    description: '客户订单的接收、确认和跟踪管理',
    category: 'sales',
    atoms: ['atom_quantity', 'atom_timestamp', 'atom_delivery_time', 'atom_cost'],
    skills: ['order_fulfillment_tracking_v2'],
    processNodes: ['order_receive', 'order_confirm', 'delivery_commit']
  },
  {
    id: 'sem_price_management',
    name: '价格管理',
    description: '产品定价和价格策略管理',
    category: 'sales',
    atoms: ['atom_unit_cost', 'atom_cost', 'atom_energy_cost'],
    skills: ['cost_realtime_analyzer_v1'],
    processNodes: ['price_calc', 'price_adjust']
  },
  {
    id: 'sem_delivery_commitment',
    name: '交付承诺',
    description: '基于产能和库存向客户承诺交付日期',
    category: 'sales',
    atoms: ['atom_delivery_time', 'atom_quantity', 'atom_inventory_days'],
    skills: ['order_fulfillment_tracking_v2', 'smart_scheduling_v4'],
    processNodes: ['delivery_commit', 'delivery_confirm']
  },
  {
    id: 'sem_fulfillment_tracking',
    name: '履约跟踪',
    description: '跟踪订单从接收到交付的全流程',
    category: 'sales',
    atoms: ['atom_timestamp', 'atom_duration', 'atom_delivery_time'],
    skills: ['order_fulfillment_tracking_v2'],
    processNodes: ['order_receive', 'production_start', 'quality_check', 'delivery_confirm']
  },

  // === 生产类 (5个) ===
  {
    id: 'sem_capacity_planning',
    name: '产能规划',
    description: '评估和规划生产能力，识别瓶颈工序',
    category: 'production',
    atoms: ['atom_capacity', 'atom_oee', 'atom_utilization_rate', 'atom_duration'],
    skills: ['capacity_evaluation_v2', 'smart_scheduling_v4'],
    processNodes: ['capacity_eval', 'bottleneck_analysis', 'production_schedule']
  },
  {
    id: 'sem_production_scheduling',
    name: '生产排程',
    description: '综合考虑需求、产能、物料生成优化排程',
    category: 'production',
    atoms: ['atom_capacity', 'atom_duration', 'atom_timestamp', 'atom_utilization_rate'],
    skills: ['smart_scheduling_v4', 'sop_balancer_v1'],
    processNodes: ['production_schedule', 'material_plan', 'work_order_release']
  },
  {
    id: 'sem_work_order_mgmt',
    name: '工单管理',
    description: '生产工单的下达、执行和跟踪',
    category: 'production',
    atoms: ['atom_quantity', 'atom_timestamp', 'atom_duration'],
    skills: ['smart_scheduling_v4'],
    processNodes: ['work_order_create', 'work_order_execute', 'work_order_complete']
  },
  {
    id: 'sem_oee_monitoring',
    name: 'OEE监控',
    description: '设备综合效率的实时监控和分析',
    category: 'production',
    atoms: ['atom_oee', 'atom_utilization_rate', 'atom_mttr', 'atom_mtbf'],
    skills: ['equipment_rul_pred_v2'],
    processNodes: ['oee_calc', 'oee_analysis']
  },
  {
    id: 'sem_process_control',
    name: '工序控制',
    description: '关键工序的参数控制和优化',
    category: 'production',
    atoms: ['atom_temperature', 'atom_pressure', 'atom_thickness', 'atom_viscosity'],
    skills: ['coating_thickness_loop_v1', 'viscosity_prediction_v3'],
    processNodes: ['process_param_set', 'process_monitor', 'process_adjust']
  },

  // === 库存类 (5个) ===
  {
    id: 'sem_inventory_management',
    name: '库存管理',
    description: '原材料、在制品和成品库存管理',
    category: 'inventory',
    atoms: ['atom_quantity', 'atom_inventory_value', 'atom_inventory_days', 'atom_turnover_rate'],
    skills: ['inventory_optimization_v3', 'inventory_turnover_opt_v2'],
    processNodes: ['inventory_check', 'inventory_adjust', 'safety_stock_calc']
  },
  {
    id: 'sem_safety_stock',
    name: '安全库存',
    description: '基于需求波动和供应周期计算安全库存',
    category: 'inventory',
    atoms: ['atom_quantity', 'atom_delivery_time', 'atom_frequency'],
    skills: ['inventory_optimization_v3'],
    processNodes: ['safety_stock_calc', 'reorder_point_calc']
  },
  {
    id: 'sem_replenishment',
    name: '补货管理',
    description: '库存补货的触发时机和批量优化',
    category: 'inventory',
    atoms: ['atom_quantity', 'atom_inventory_days', 'atom_delivery_time'],
    skills: ['inventory_optimization_v3', 'supply_chain_collab_v2'],
    processNodes: ['replenishment_trigger', 'purchase_order_create']
  },
  {
    id: 'sem_vmi_management',
    name: 'VMI管理',
    description: '供应商管理库存的协同',
    category: 'inventory',
    atoms: ['atom_quantity', 'atom_inventory_days', 'atom_delivery_time'],
    skills: ['supply_chain_collab_v2'],
    processNodes: ['vmi_monitor', 'vmi_replenish']
  },
  {
    id: 'sem_wip_control',
    name: '在制品控制',
    description: '生产过程中的WIP数量控制',
    category: 'inventory',
    atoms: ['atom_quantity', 'atom_duration', 'atom_inventory_value'],
    skills: ['smart_scheduling_v4', 'inventory_optimization_v3'],
    processNodes: ['wip_monitor', 'wip_adjust']
  },

  // === 质量类 (4个) ===
  {
    id: 'sem_quality_control',
    name: '质量控制',
    description: '生产过程中的质量检验和控制',
    category: 'quality',
    atoms: ['atom_defect_rate', 'atom_yield_rate', 'atom_precision'],
    skills: ['quality_predict_v2'],
    processNodes: ['quality_check', 'defect_analysis', 'quality_report']
  },
  {
    id: 'sem_pass_rate_mgmt',
    name: '直通率管理',
    description: '产品一次直通率的监控和提升',
    category: 'quality',
    atoms: ['atom_yield_rate', 'atom_defect_rate'],
    skills: ['quality_predict_v2'],
    processNodes: ['pass_rate_calc', 'pass_rate_improve']
  },
  {
    id: 'sem_delivery_quality',
    name: '交付质量',
    description: '交付产品的质量和客户验收',
    category: 'quality',
    atoms: ['atom_yield_rate', 'atom_defect_rate', 'atom_precision'],
    skills: ['quality_predict_v2', 'order_fulfillment_tracking_v2'],
    processNodes: ['final_inspection', 'delivery_quality_check']
  },
  {
    id: 'sem_quality_alert',
    name: '质量预警',
    description: '质量异常的早期预警和处理',
    category: 'quality',
    atoms: ['atom_defect_rate', 'atom_yield_rate', 'atom_frequency'],
    skills: ['production_sales_alert_v1', 'quality_predict_v2'],
    processNodes: ['quality_monitor', 'alert_trigger', 'alert_handle']
  },

  // === 财务类 (5个) ===
  {
    id: 'sem_cost_calculation',
    name: '成本核算',
    description: '生产成本的实时核算和分析',
    category: 'finance',
    atoms: ['atom_cost', 'atom_unit_cost', 'atom_energy_cost'],
    skills: ['cost_realtime_analyzer_v1'],
    processNodes: ['cost_calc', 'cost_analysis']
  },
  {
    id: 'sem_profit_analysis',
    name: '利润分析',
    description: '产品利润率的计算和分析',
    category: 'finance',
    atoms: ['atom_cost', 'atom_unit_cost'],
    skills: ['cost_realtime_analyzer_v1'],
    processNodes: ['profit_calc', 'profit_analysis']
  },
  {
    id: 'sem_inventory_cost',
    name: '库存成本',
    description: '库存资金占用和持有成本',
    category: 'finance',
    atoms: ['atom_inventory_value', 'atom_cost'],
    skills: ['inventory_optimization_v3'],
    processNodes: ['inventory_cost_calc', 'inventory_value_monitor']
  },
  {
    id: 'sem_ar_management',
    name: '应收管理',
    description: '应收账款和回款管理',
    category: 'finance',
    atoms: ['atom_cost', 'atom_timestamp'],
    skills: ['order_fulfillment_tracking_v2'],
    processNodes: ['invoice_create', 'payment_track']
  },
  {
    id: 'sem_overdue_monitor',
    name: '逾期监控',
    description: '逾期账款和交付的监控预警',
    category: 'finance',
    atoms: ['atom_timestamp', 'atom_delivery_time'],
    skills: ['production_sales_alert_v1'],
    processNodes: ['overdue_check', 'overdue_alert']
  },

  // === 物流类 (4个) ===
  {
    id: 'sem_delivery_mgmt',
    name: '交付管理',
    description: '产品配送和交付时间管理',
    category: 'logistics',
    atoms: ['atom_delivery_time', 'atom_quantity', 'atom_timestamp'],
    skills: ['logistics_optimization_v2', 'order_fulfillment_tracking_v2'],
    processNodes: ['delivery_arrange', 'delivery_track', 'delivery_confirm']
  },
  {
    id: 'sem_logistics_cost',
    name: '物流成本',
    description: '运输和配送成本管理',
    category: 'logistics',
    atoms: ['atom_cost', 'atom_delivery_time'],
    skills: ['logistics_optimization_v2'],
    processNodes: ['logistics_cost_calc', 'route_optimize']
  },
  {
    id: 'sem_in_transit_track',
    name: '在途跟踪',
    description: '运输过程中的货物跟踪',
    category: 'logistics',
    atoms: ['atom_timestamp', 'atom_delivery_time', 'atom_location'],
    skills: ['logistics_optimization_v2'],
    processNodes: ['in_transit_monitor', 'eta_update']
  },
  {
    id: 'sem_delivery_accuracy',
    name: '交付准确率',
    description: '准时交付率和交付准确性',
    category: 'logistics',
    atoms: ['atom_delivery_time', 'atom_quantity', 'atom_timestamp'],
    skills: ['order_fulfillment_tracking_v2'],
    processNodes: ['delivery_accuracy_calc', 'delivery_performance']
  },

  // === 客户类 (4个) ===
  {
    id: 'sem_credit_mgmt',
    name: '信用管理',
    description: '客户信用评估和额度管理',
    category: 'customer',
    atoms: ['atom_cost', 'atom_timestamp'],
    skills: ['supply_chain_collab_v2'],
    processNodes: ['credit_check', 'credit_adjust']
  },
  {
    id: 'sem_customer_rating',
    name: '客户评级',
    description: '客户分级和优先级管理',
    category: 'customer',
    atoms: ['atom_quantity', 'atom_cost', 'atom_timestamp'],
    skills: ['supply_chain_collab_v2'],
    processNodes: ['customer_rating_calc', 'priority_adjust']
  },
  {
    id: 'sem_satisfaction',
    name: '客户满意度',
    description: '客户满意度调查和分析',
    category: 'customer',
    atoms: ['atom_defect_rate', 'atom_delivery_time', 'atom_yield_rate'],
    skills: ['order_fulfillment_tracking_v2'],
    processNodes: ['satisfaction_survey', 'satisfaction_analysis']
  },
  {
    id: 'sem_customer_comm',
    name: '客户沟通',
    description: '交付变更等异常情况的客户沟通',
    category: 'customer',
    atoms: ['atom_timestamp', 'atom_delivery_time'],
    skills: ['production_sales_alert_v1', 'supply_chain_collab_v2'],
    processNodes: ['customer_notify', 'negotiation']
  },

  // === 计划类 (4个) ===
  {
    id: 'sem_master_schedule',
    name: '主生产计划',
    description: 'MPS主生产计划的制定',
    category: 'planning',
    atoms: ['atom_capacity', 'atom_quantity', 'atom_timestamp'],
    skills: ['smart_scheduling_v4', 'sop_balancer_v1'],
    processNodes: ['mps_create', 'mps_adjust']
  },
  {
    id: 'sem_material_requirements',
    name: '物料需求计划',
    description: 'MRP物料需求计算',
    category: 'planning',
    atoms: ['atom_quantity', 'atom_delivery_time', 'atom_inventory_days'],
    skills: ['smart_scheduling_v4', 'inventory_optimization_v3'],
    processNodes: ['mrp_calc', 'material_plan']
  },
  {
    id: 'sem_delivery_planning',
    name: '交货计划',
    description: '客户交货期的计划和承诺',
    category: 'planning',
    atoms: ['atom_delivery_time', 'atom_capacity', 'atom_quantity'],
    skills: ['order_fulfillment_tracking_v2', 'smart_scheduling_v4'],
    processNodes: ['delivery_plan', 'delivery_commit']
  },
  {
    id: 'sem_achievement_rate',
    name: '计划达成率',
    description: '生产计划执行情况的跟踪分析',
    category: 'planning',
    atoms: ['atom_quantity', 'atom_capacity', 'atom_utilization_rate'],
    skills: ['production_sales_alert_v1', 'sop_balancer_v1'],
    processNodes: ['plan_achievement_calc', 'deviation_analysis']
  }
];

// ==================== 业务流程节点到语义/技能映射 ====================
// 用于从业务流程图谱倒推所需的业务语义和技能

export interface ProcessNodeMapping {
  nodeId: string;
  nodeName: string;
  semantics: string[]; // 关联的业务语义ID
  skills: string[]; // 关联的技能ID
  atoms: string[]; // 所需业务释义
}

// 产销场景核心业务流程节点映射
export const PRODUCTION_SALES_PROCESS_MAP: ProcessNodeMapping[] = [
  // L2 Nodes
  {
    nodeId: 'demand_forecast',
    nodeName: '需求预测',
    semantics: ['sem_sales_forecast'],
    skills: ['demand_forecast_v3'],
    atoms: ['atom_quantity', 'atom_timestamp', 'atom_frequency']
  },
  {
    nodeId: 'sales_planning',
    nodeName: '销售计划',
    semantics: ['sem_sales_forecast', 'sem_master_schedule'],
    skills: ['demand_forecast_v3', 'sop_balancer_v1'],
    atoms: ['atom_quantity', 'atom_capacity', 'atom_timestamp']
  },
  {
    nodeId: 'capacity_planning',
    nodeName: '产能规划',
    semantics: ['sem_capacity_planning'],
    skills: ['capacity_evaluation_v2', 'sop_balancer_v1'],
    atoms: ['atom_capacity', 'atom_oee', 'atom_utilization_rate']
  },
  {
    nodeId: 'inventory_management',
    nodeName: '库存管理',
    semantics: ['sem_inventory_management', 'sem_safety_stock'],
    skills: ['inventory_optimization_v3'],
    atoms: ['atom_quantity', 'atom_inventory_value', 'atom_inventory_days']
  },
  {
    nodeId: 'production_scheduling',
    nodeName: '生产排程',
    semantics: ['sem_production_scheduling', 'sem_master_schedule'],
    skills: ['smart_scheduling_v4', 'sop_balancer_v1'],
    atoms: ['atom_capacity', 'atom_duration', 'atom_timestamp', 'atom_utilization_rate']
  },
  {
    nodeId: 'quality_control',
    nodeName: '质量控制',
    semantics: ['sem_quality_control', 'sem_pass_rate_mgmt'],
    skills: ['quality_predict_v2'],
    atoms: ['atom_defect_rate', 'atom_yield_rate', 'atom_precision']
  },
  {
    nodeId: 'logistics_delivery',
    nodeName: '物流配送',
    semantics: ['sem_delivery_mgmt', 'sem_logistics_cost'],
    skills: ['logistics_optimization_v2'],
    atoms: ['atom_delivery_time', 'atom_quantity', 'atom_cost']
  },
  {
    nodeId: 'customer_service',
    nodeName: '客户服务',
    semantics: ['sem_order_management', 'sem_customer_satisfaction'],
    skills: ['order_fulfillment_tracking_v2'],
    atoms: ['atom_quantity', 'atom_cost', 'atom_timestamp']
  },
  // L3 Nodes - Demand Forecast children
  {
    nodeId: 'market_analysis',
    nodeName: '市场分析',
    semantics: ['sem_sales_forecast'],
    skills: ['demand_forecast_v3'],
    atoms: ['atom_quantity', 'atom_timestamp', 'atom_frequency']
  },
  {
    nodeId: 'forecast_model',
    nodeName: '预测模型',
    semantics: ['sem_sales_forecast'],
    skills: ['demand_forecast_v3'],
    atoms: ['atom_quantity', 'atom_precision', 'atom_frequency']
  },
  {
    nodeId: 'accuracy_evaluation',
    nodeName: '准确度评估',
    semantics: ['sem_sales_forecast'],
    skills: ['demand_forecast_v3'],
    atoms: ['atom_precision', 'atom_yield_rate']
  },
  // L3 Nodes - Sales Planning children
  {
    nodeId: 'sales_target',
    nodeName: '销售目标',
    semantics: ['sem_sales_forecast', 'sem_master_schedule'],
    skills: ['sop_balancer_v1'],
    atoms: ['atom_quantity', 'atom_capacity']
  },
  {
    nodeId: 'order_management',
    nodeName: '订单管理',
    semantics: ['sem_order_management'],
    skills: ['order_fulfillment_tracking_v2'],
    atoms: ['atom_quantity', 'atom_timestamp', 'atom_cost']
  },
  {
    nodeId: 'customer_segmentation',
    nodeName: '客户分级',
    semantics: ['sem_customer_satisfaction'],
    skills: ['supply_chain_collab_v2'],
    atoms: ['atom_quantity', 'atom_cost']
  },
  // L3 Nodes - Capacity Planning children
  {
    nodeId: 'capacity_assessment',
    nodeName: '产能评估',
    semantics: ['sem_capacity_planning'],
    skills: ['capacity_evaluation_v2'],
    atoms: ['atom_capacity', 'atom_oee', 'atom_utilization_rate']
  },
  {
    nodeId: 'bottleneck_analysis',
    nodeName: '瓶颈分析',
    semantics: ['sem_capacity_planning'],
    skills: ['capacity_evaluation_v2', 'smart_scheduling_v4'],
    atoms: ['atom_capacity', 'atom_utilization_rate', 'atom_duration']
  },
  {
    nodeId: 'resource_allocation',
    nodeName: '资源调配',
    semantics: ['sem_capacity_planning', 'sem_production_scheduling'],
    skills: ['smart_scheduling_v4', 'sop_balancer_v1'],
    atoms: ['atom_capacity', 'atom_utilization_rate']
  },
  // L3 Nodes - Inventory Management children
  {
    nodeId: 'raw_material_inventory',
    nodeName: '原材料库存',
    semantics: ['sem_inventory_management'],
    skills: ['inventory_optimization_v3'],
    atoms: ['atom_quantity', 'atom_inventory_value', 'atom_inventory_days']
  },
  {
    nodeId: 'wip_inventory',
    nodeName: '在制品库存',
    semantics: ['sem_wip_control'],
    skills: ['inventory_optimization_v3', 'smart_scheduling_v4'],
    atoms: ['atom_quantity', 'atom_duration', 'atom_inventory_value']
  },
  {
    nodeId: 'finished_goods_inventory',
    nodeName: '成品库存',
    semantics: ['sem_inventory_management'],
    skills: ['inventory_optimization_v3'],
    atoms: ['atom_quantity', 'atom_inventory_value', 'atom_inventory_days']
  },
  {
    nodeId: 'safety_stock',
    nodeName: '安全库存',
    semantics: ['sem_safety_stock'],
    skills: ['inventory_optimization_v3'],
    atoms: ['atom_quantity', 'atom_inventory_days', 'atom_delivery_time']
  },
  // L3 Nodes - Production Scheduling children
  {
    nodeId: 'mps_generation',
    nodeName: '主生产计划',
    semantics: ['sem_master_schedule', 'sem_material_requirements'],
    skills: ['smart_scheduling_v4', 'sop_balancer_v1'],
    atoms: ['atom_capacity', 'atom_duration', 'atom_timestamp']
  },
  {
    nodeId: 'production_tracking',
    nodeName: '生产跟踪',
    semantics: ['sem_work_order_mgmt', 'sem_oee_monitoring'],
    skills: ['smart_scheduling_v4'],
    atoms: ['atom_capacity', 'atom_oee', 'atom_utilization_rate', 'atom_duration']
  },
  {
    nodeId: 'exception_handling',
    nodeName: '异常处理',
    semantics: ['sem_process_control'],
    skills: ['equipment_rul_pred_v2'],
    atoms: ['atom_duration', 'atom_defect_rate']
  },
  // L3 Nodes - Quality Control children
  {
    nodeId: 'quality_inspection',
    nodeName: '质量检验',
    semantics: ['sem_quality_control'],
    skills: ['quality_predict_v2'],
    atoms: ['atom_defect_rate', 'atom_yield_rate', 'atom_precision']
  },
  {
    nodeId: 'defect_analysis',
    nodeName: '缺陷分析',
    semantics: ['sem_pass_rate_mgmt'],
    skills: ['quality_predict_v2'],
    atoms: ['atom_defect_rate', 'atom_precision']
  },
  {
    nodeId: 'improvement_tracking',
    nodeName: '改进跟踪',
    semantics: ['sem_pass_rate_mgmt'],
    skills: ['quality_predict_v2'],
    atoms: ['atom_yield_rate', 'atom_precision']
  },
  // L3 Nodes - Logistics Delivery children
  {
    nodeId: 'delivery_planning',
    nodeName: '配送计划',
    semantics: ['sem_delivery_planning'],
    skills: ['logistics_optimization_v2'],
    atoms: ['atom_delivery_time', 'atom_quantity', 'atom_cost']
  },
  {
    nodeId: 'shipment_tracking',
    nodeName: '发货跟踪',
    semantics: ['sem_delivery_mgmt', 'sem_fulfillment_tracking'],
    skills: ['order_fulfillment_tracking_v2'],
    atoms: ['atom_delivery_time', 'atom_timestamp', 'atom_duration']
  },
  {
    nodeId: 'carrier_management',
    nodeName: '承运商管理',
    semantics: ['sem_logistics_cost'],
    skills: ['logistics_optimization_v2'],
    atoms: ['atom_cost', 'atom_delivery_time']
  }
];

// ==================== 关联性分析工具函数 ====================

/**
 * 根据业务流程节点ID获取所需的业务语义和技能
 */
export function getRequirementsByProcessNode(nodeId: string): {
  semantics: BusinessSemanticDef[];
  skills: string[];
  atoms: string[];
} {
  const mapping = PRODUCTION_SALES_PROCESS_MAP.find(p => p.nodeId === nodeId);
  if (!mapping) {
    return { semantics: [], skills: [], atoms: [] };
  }

  const semantics = PRODUCTION_SALES_SEMANTICS.filter(s =>
    mapping.semantics.includes(s.id)
  );

  // 合并业务流程映射和语义定义中的技能
  const allSkills = Array.from(new Set([
    ...mapping.skills,
    ...semantics.flatMap(s => s.skills)
  ]));

  // 合并所有业务释义
  const allAtoms = Array.from(new Set([
    ...mapping.atoms,
    ...semantics.flatMap(s => s.atoms)
  ]));

  return { semantics, skills: allSkills, atoms: allAtoms };
}

/**
 * 根据业务语义ID获取关联的技能和业务释义
 */
export function getSkillsBySemantic(semanticId: string): {
  semantic?: BusinessSemanticDef;
  skills: string[];
  atoms: string[];
} {
  const semantic = PRODUCTION_SALES_SEMANTICS.find(s => s.id === semanticId);
  if (!semantic) {
    return { skills: [], atoms: [] };
  }

  return {
    semantic,
    skills: semantic.skills,
    atoms: semantic.atoms
  };
}

/**
 * 获取产销场景完整的依赖关系图
 * 统一使用两种节点类型：推演节点(simulation)和数据节点(data)
 */
export function getProductionSalesDependencyGraph(): {
  nodes: { id: string; type: 'simulation' | 'data'; name: string }[];
  links: { source: string; target: string; type: string }[];
} {
  const nodes: { id: string; type: 'simulation' | 'data'; name: string }[] = [];
  const links: { source: string; target: string; type: string }[] = [];

  // 添加业务流程节点 - 推演节点（业务流程是推演主体）
  PRODUCTION_SALES_PROCESS_MAP.forEach(proc => {
    nodes.push({ id: proc.nodeId, type: 'simulation', name: proc.nodeName });

    // 业务流程 -> 业务语义
    proc.semantics.forEach(semId => {
      const sem = PRODUCTION_SALES_SEMANTICS.find(s => s.id === semId);
      if (sem) {
        links.push({ source: proc.nodeId, target: semId, type: 'requires_semantic' });

        // 业务语义 -> 技能
        sem.skills.forEach(skillId => {
          links.push({ source: semId, target: skillId, type: 'uses_skill' });
        });

        // 业务语义 -> 业务释义
        sem.atoms.forEach(atomId => {
          links.push({ source: semId, target: atomId, type: 'depends_on_atom' });
        });
      }
    });

    // 业务流程直接依赖的业务释义
    proc.atoms.forEach(atomId => {
      links.push({ source: proc.nodeId, target: atomId, type: 'measures_atom' });
    });
  });

  // 添加业务语义节点 - 数据节点（业务语义是数据定义）
  PRODUCTION_SALES_SEMANTICS.forEach(sem => {
    if (!nodes.find(n => n.id === sem.id)) {
      nodes.push({ id: sem.id, type: 'data', name: sem.name });
    }
  });

  return { nodes, links };
}

// 动态场景存储 - 用户创建的场景
export let DYNAMIC_SCENARIOS: BusinessScenario[] = [];

// 动态场景业务语义映射
export let DYNAMIC_ONTOLOGY_MAP: Record<string, OntologyData> = {};

// 添加动态场景
export const addDynamicScenario = (scenario: BusinessScenario, ontologyData: OntologyData) => {
  DYNAMIC_SCENARIOS = [...DYNAMIC_SCENARIOS, scenario];
  DYNAMIC_ONTOLOGY_MAP[scenario.id] = ontologyData;
};

// 更新动态场景
export const updateDynamicScenario = (scenarioId: string, updates: Partial<BusinessScenario>) => {
  DYNAMIC_SCENARIOS = DYNAMIC_SCENARIOS.map(s =>
    s.id === scenarioId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
  );
};

// 删除动态场景
export const deleteDynamicScenario = (scenarioId: string) => {
  DYNAMIC_SCENARIOS = DYNAMIC_SCENARIOS.filter(s => s.id !== scenarioId);
  delete DYNAMIC_ONTOLOGY_MAP[scenarioId];
};

// 获取所有场景（静态+动态）
export const getAllScenarios = (): Scenario[] => {
  const dynamicScenarios: Scenario[] = DYNAMIC_SCENARIOS.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    isDynamic: true,
    sourceScenarioId: s.id
  }));
  return [...SCENARIOS, ...dynamicScenarios];
};

// 获取场景的完整本体数据
export const getScenarioOntologyData = (scenarioId: string): OntologyData | undefined => {
  // 先查静态场景
  if (SCENARIO_ONTOLOGY_MAP[scenarioId]) {
    return SCENARIO_ONTOLOGY_MAP[scenarioId];
  }
  // 再查动态场景
  return DYNAMIC_ONTOLOGY_MAP[scenarioId];
};

// 将分子本体转换为图谱数据
export const convertMolecularToOntologyData = (
  scenario: BusinessScenario,
  skills: Skill[]
): OntologyData => {
  const nodes: OntologyNode[] = [];
  const links: OntologyLink[] = [];

  // 示例数据生成器
  const owners = ['张工', '李经理', '王主管', '刘工程师', '陈博士', '赵主任', '孙技术员', '周专家'];
  const frequencies = ['实时', '每分钟', '每小时', '每班', '每日', '每周', '每月', '按需'];
  const dataFormats = ['JSON', 'XML', 'CSV', '数据库表', '消息队列', '文件', 'API接口', '二进制流'];
  const dataSources = ['导入', 'CRM系统', 'BOM系统', 'MES系统', 'ERP系统', 'SCM系统', 'PLM系统', 'WMS系统'];

  const getRandomOwner = () => owners[Math.floor(Math.random() * owners.length)];
  const getRandomFrequency = () => frequencies[Math.floor(Math.random() * frequencies.length)];
  const getRandomFormat = () => dataFormats[Math.floor(Math.random() * dataFormats.length)];
  const getRandomDataSource = () => dataSources[Math.floor(Math.random() * dataSources.length)];

  // 根据场景生成相关任务
  const generatePendingTasks = (nodeId: string, nodeName: string, nodeLevel: number): any[] => {
    const tasks: any[] = [];
    const taskCount = Math.floor(Math.random() * 3) + 1; // 1-3个任务

    // 场景相关的任务模板
    const scenarioTaskTemplates: Record<string, Array<{title: string, desc: string, priority: string}>> = {
      default: [
        { title: `${nodeName}数据采集`, desc: `采集${nodeName}相关数据并提交`, priority: 'high' },
        { title: `${nodeName}质量检查`, desc: `执行${nodeName}质量检查并提交报告`, priority: 'high' },
        { title: `${nodeName}参数确认`, desc: `确认${nodeName}关键参数设置`, priority: 'medium' },
        { title: `${nodeName}异常处理`, desc: `处理${nodeName}过程中的异常情况`, priority: 'medium' },
        { title: `${nodeName}报告提交`, desc: `提交${nodeName}相关工作报告`, priority: 'low' },
      ]
    };

    const taskTemplates = scenarioTaskTemplates[scenario.id] || scenarioTaskTemplates.default;

    for (let i = 0; i < taskCount; i++) {
      const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
      const statuses = ['pending', 'in_progress', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      tasks.push({
        id: `task_${scenario.id}_${nodeId}_${i}`,
        title: template.title,
        description: template.desc,
        priority: template.priority,
        status: status,
        dueDate: status === 'completed' ? undefined : `2024-03-${10 + Math.floor(Math.random() * 20)}`,
        assignee: undefined
      });
    }
    return tasks;
  };

  // 辅助函数：生成关联节点状态
  const createRelatedNode = (id: string, label: string) => ({
    id,
    label,
    dataSubmitted: Math.random() > 0.3,
    instructionCompleted: Math.random() > 0.2
  });

  // 不再创建场景级别的根节点（避免与场景本身重复且范围过大）
  // L2节点直接作为图谱的顶层节点

  // 构建结构 - 根据节点名称和场景上下文判断性质（推演节点或数据节点）
  const structureNodes = scenario.molecularStructure;

  // 判断节点是否为推演节点（结合节点名称和场景上下文判断）
  const isSimNode = (nodeName: string, parentId?: string) => {
    // 1. 名称关键词判断
    const simulationKeywords = [
      '推演', '评估', '预测', '分析', '决策', '模拟', '优化', '规划',
      '推荐', '诊断', '预警', '测算', '选型', '可行性', '盈亏',
      '风险', '策略', '情景', '平衡', '计算', '判定', '评价',
      '方案', '建议', '调研', '比选'
    ];
    const hasKeyword = simulationKeywords.some(keyword => nodeName.includes(keyword));
    if (hasKeyword) return true;

    // 2. 场景上下文判断 - 某些场景下的L2节点即使名称不含关键词也应为推演节点
    const simulationScenarios: Record<string, string[]> = {
      // 新项目落地推演分析 - 五大决策维度都是推演节点
      'new_project_planning': ['战略层决策', '需求与市场层', '产能与制造层', '财务与投资层', '风险与约束层'],
      // 产能评估推演预测分析 - 所有L2都是推演节点
      'capacity_assessment_prediction': ['现有产能评估', '产能供给能力评估', '产能扩展潜力', '产能规划方案', '投资决策推演', '风险情景模拟'],
      // 产销匹配协同 - L2均为推演节点
      'production_sales_match': ['需求预测推演', '销售计划推演', '产能评估推演', '产销平衡推演', '库存优化推演', '交付协同推演'],
    };

    if (simulationScenarios[scenario.id]?.includes(nodeName)) {
      return true;
    }

    // 3. 根据父节点判断 - 如果父节点是推演节点，且当前节点名称表示一个分析维度，则为推演节点
    if (parentId) {
      const parentNode = nodes.find(n => n.id === parentId);
      if (parentNode?.type === 'simulation') {
        // 检查是否是决策维度（以"层"、"维度"结尾，或是特定的分析类别）
        const dimensionPatterns = ['层', '维度', '模块', '域'];
        if (dimensionPatterns.some(p => nodeName.includes(p))) {
          return true;
        }
      }
    }

    return false;
  };

  // 第一层节点（原level 2）- 直接作为顶层节点
  const level1Nodes = structureNodes.filter(m => m.level === 2);
  level1Nodes.forEach((node, i) => {
    const nodeType = isSimNode(node.name) ? 'simulation' : 'data';
    nodes.push({
      id: node.id,
      label: node.name,
      type: nodeType,
      group: nodeType,
      data_readiness: nodeType === 'simulation' ? 85 + Math.floor(Math.random() * 15) : 60 + Math.floor(Math.random() * 35),
      owner: getRandomOwner(),
      responsibility: nodeType === 'simulation'
        ? `负责${node.name}的推演分析，整合数据并输出决策建议`
        : `提供${node.name}相关数据，支持推演节点的分析计算`,
      upstreamNodes: i > 0 ? [createRelatedNode(level1Nodes[i - 1].id, level1Nodes[i - 1].name)] : undefined,
      downstreamNodes: i < level1Nodes.length - 1 ? [createRelatedNode(level1Nodes[i + 1].id, level1Nodes[i + 1].name)] : undefined,
      dataSource: getRandomDataSource(),
      dataFormat: getRandomFormat(),
      updateFrequency: getRandomFrequency(),
      pendingTasks: generatePendingTasks(node.id, node.name, 2)
    });
    // 不再链接到root节点，L2节点本身就是顶层节点
  });

  // 第二层节点（原level 3）
  const level2Nodes = structureNodes.filter(m => m.level === 3);
  level2Nodes.forEach((node, i) => {
    const nodeType = isSimNode(node.name, node.parentId) ? 'simulation' : 'data';
    const sameParentNodes = level2Nodes.filter(n => n.parentId === node.parentId);
    const indexInParent = sameParentNodes.findIndex(n => n.id === node.id);
    const parentNode = level1Nodes.find(n => n.id === node.parentId);
    nodes.push({
      id: node.id,
      label: node.name,
      type: nodeType,
      group: nodeType,
      data_readiness: nodeType === 'simulation' ? 85 + Math.floor(Math.random() * 15) : 60 + Math.floor(Math.random() * 35),
      owner: getRandomOwner(),
      responsibility: nodeType === 'simulation'
        ? `负责${node.name}的推演分析，整合数据并输出决策建议`
        : `提供${node.name}相关数据，支持推演节点的分析计算`,
      upstreamNodes: indexInParent > 0
        ? [createRelatedNode(sameParentNodes[indexInParent - 1].id, sameParentNodes[indexInParent - 1].name)]
        : parentNode ? [createRelatedNode(parentNode.id, parentNode.name)] : undefined,
      downstreamNodes: indexInParent < sameParentNodes.length - 1
        ? [createRelatedNode(sameParentNodes[indexInParent + 1].id, sameParentNodes[indexInParent + 1].name)]
        : undefined,
      dataSource: getRandomDataSource(),
      dataFormat: getRandomFormat(),
      updateFrequency: getRandomFrequency(),
      pendingTasks: generatePendingTasks(node.id, node.name, 3)
    });
    links.push({ source: node.parentId || 'root', target: node.id, relation: '包含' });
  });

  // 第三层节点（原level 4，均为数据节点）
  const level3Nodes = structureNodes.filter(m => m.level === 4);
  level3Nodes.forEach((node, i) => {
    // 获取原子引用信息
    const atomNames = node.atomRefs
      .map(ref => {
        const atom = ATOMIC_ONTOLOGY_LIBRARY.find(a => a.id === ref.atomId);
        return atom ? `${atom.name}(${ref.role})` : null;
      })
      .filter(Boolean)
      .join(', ');
    const parentNode = level2Nodes.find(n => n.id === node.parentId);

    nodes.push({
      id: node.id,
      label: node.name + (atomNames ? ` [${atomNames}]` : ''),
      type: 'data',
      group: 'data',
      data_readiness: 40 + Math.floor(Math.random() * 50),
      owner: getRandomOwner(),
      responsibility: `采集和预处理${node.name}数据，确保数据质量`,
      upstreamNodes: parentNode ? [createRelatedNode(parentNode.id, parentNode.name)] : undefined,
      dataSource: getRandomDataSource(),
      dataFormat: getRandomFormat(),
      updateFrequency: ['实时', '每分钟', '每小时'][Math.floor(Math.random() * 3)],
      pendingTasks: generatePendingTasks(node.id, node.name, 4)
    });
    links.push({ source: node.parentId || 'root', target: node.id, relation: '监控' });
  });

  // 技能作为推演节点的关联能力（不在图谱中显示为节点，而是在推演时使用）
  // 技能通过推演节点的supportedSkills配置进行关联

  return { nodes, links };
};