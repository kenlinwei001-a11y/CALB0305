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
      readme: "# 原料纯度AI检测\n\n## 1. 概述\n\n### 1.1 业务价值\n原料纯度直接影响锂电池的能量密度和循环寿命。本技能通过AI驱动的多模态检测技术，实现原料纯度的自动化、高精度检测，替代传统人工化验流程，检测效率提升80%以上，误判率降低至0.1%以下。\n\n### 1.2 技术原理\n融合近红外光谱分析(NIR)与深度学习视觉检测，构建多模态融合模型。光谱模块检测分子结构特征，视觉模块识别表面杂质，融合层通过注意力机制综合判定，输出纯度评分及污染物分布。\n\n### 1.3 应用场景\n- 正极材料（磷酸铁锂、三元材料）来料检验\n- 负极材料（石墨、硅基材料）纯度检测\n- 电解液原料（LiPF6、溶剂）质量把控\n- 隔膜原料聚烯烃的洁净度评估\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 默认值 | 说明 |\n|--------|------|------|--------|------|\n| material_type | string | 是 | - | 原料类型，如Li2CO3、LiOH等 |\n| batch_id | string | 是 | - | 批次编号，唯一标识 |\n| purity_threshold | number | 否 | 99.5 | 纯度阈值(%)，低于此值判定为不合格 |\n| inspection_mode | string | 否 | 'auto' | 检测模式：auto/quick/deep |\n| sample_location | string | 否 | 'center' | 取样位置：center/edge/mixed |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 |\n|--------|------|------|\n| purity_score | number | 纯度评分(0-100)，综合光谱和视觉分析结果 |\n| contaminants | array | 污染物列表，包含类型、浓度、位置信息 |\n| is_passed | boolean | 是否通过检测 |\n| confidence | number | 模型置信度(0-1) |\n| spectra_data | object | 原始光谱数据（可选） |\n| visual_report | string | 视觉检测报告URL |\n\n## 4. 性能指标\n\n| 指标 | 数值 |\n|------|------|\n| 检测精度 | ±0.05% |\n| 响应时间 | <2秒 |\n| 吞吐量 | 60样本/小时 |\n| 准确率 | 99.9% |\n| 误报率 | <0.1% |\n\n## 5. 使用示例\n\n### 5.1 基础调用\n`skill.invoke({ material_type: 'Li2CO3', batch_id: 'BATCH202403001', purity_threshold: 99.5 })`\n\n### 5.2 深度检测模式\n`skill.invoke({ material_type: 'NCM811', batch_id: 'BATCH202403002', purity_threshold: 99.8, inspection_mode: 'deep' })`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| Purity_001 | 光谱仪连接异常 | 检查设备电源和数据线连接 |\n| Purity_002 | 样本识别失败 | 重新放置样本，确保采样区域清洁 |\n| Purity_003 | 模型推理超时 | 检查GPU资源，降低inspection_mode等级 |\n| Purity_004 | 批次号格式错误 | 核对batch_id格式是否符合规范 |\n| Purity_005 | 原料类型不支持 | 更新material_type为支持的类型 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更内容 |\n|------|------|----------|\n| v1.0.0 | 2024-01 | 初始版本，支持基础光谱检测 |\n| v2.0.0 | 2024-06 | 增加视觉融合模块，支持多模态检测 |\n| v2.1.0 | 2024-09 | 优化检测算法，提升响应速度 |\n\n## 8. 依赖与前置条件\n\n- 硬件：近红外光谱仪、工业相机(500万像素+)\n- 软件：CUDA 11.8+、Python 3.9+\n- 网络：可访问模型推理服务\n- 权限：需要质检员角色权限\n- 前置流程：原料入库登记完成",
      config: "{\"model\": \"purity_net_v2\", \"threshold\": 0.99}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    material_purity_check_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# 浆料粘度预测\n\n## 1. 概述\n\n### 1.1 业务价值\n浆料粘度是锂电池极片制造的关键工艺参数，直接影响涂布均匀性和极片质量。本技能通过实时预测浆料粘度，帮助工艺工程师提前调整搅拌参数，减少停机取样检测次数，提升产线OEE 15%以上，降低不良品率。\n\n### 1.2 技术原理\n基于LSTM时序神经网络，融合搅拌转速、温度、固含量、分散时间等多维工艺参数，建立粘度动态预测模型。模型考虑浆料老化特性和剪切稀化效应，实现非线性粘度变化趋势的精准预测。\n\n### 1.3 应用场景\n- 正极浆料（LFP/NCM）粘度在线监控\n- 负极浆料（石墨/硅碳）流变特性预测\n- 搅拌工艺参数优化建议\n- 涂布前浆料质量预检\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 默认值 | 说明 |\n|--------|------|------|--------|------|\n| solid_content | number | 是 | - | 固含量(%)，范围40-70 |\n| temperature | number | 是 | - | 浆料温度(°C)，范围15-45 |\n| mixing_speed | number | 是 | - | 搅拌转速(rpm)，范围50-300 |\n| dispersion_time | number | 否 | 0 | 分散时间(分钟) |\n| material_type | string | 否 | 'NCM' | 材料类型：LFP/NCM/Graphite/SiC |\n| solvent_ratio | number | 否 | 0.5 | 溶剂比例，范围0.4-0.6 |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 |\n|--------|------|------|\n| predicted_viscosity | number | 预测粘度值(mPa·s) |\n| viscosity_trend | string | 粘度趋势：rising/stable/falling |\n| confidence | number | 预测置信度(0-1) |\n| optimal_mixing_speed | number | 建议搅拌转速(rpm) |\n| warning_flag | boolean | 是否超出工艺窗口 |\n| time_to_target | number | 预计达到目标粘度时间(分钟) |\n\n## 4. 性能指标\n\n| 指标 | 数值 |\n|------|------|\n| 预测精度 | ±5% |\n| 响应时间 | <50ms |\n| 预测 horizon | 30分钟 |\n| MAPE | <3% |\n| R² | >0.95 |\n\n## 5. 使用示例\n\n### 5.1 基础调用\n`skill.invoke({ solid_content: 65, temperature: 25, mixing_speed: 150 })`\n\n### 5.2 完整参数调用\n`skill.invoke({ solid_content: 68, temperature: 28, mixing_speed: 180, dispersion_time: 120, material_type: 'NCM', solvent_ratio: 0.52 })`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| Visc_001 | 输入参数超出范围 | 检查solid_content是否在40-70范围内 |\n| Visc_002 | 模型推理失败 | 检查模型服务状态，尝试降低输入维度 |\n| Visc_003 | 温度传感器异常 | 检查温度传感器校准状态 |\n| Visc_004 | 历史数据不足 | 积累至少100条历史记录后再调用 |\n| Visc_005 | 材料类型不支持 | 使用支持的材料类型：LFP/NCM/Graphite/SiC |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更内容 |\n|------|------|----------|\n| v1.0.0 | 2023-08 | 初始版本，基于规则公式预测 |\n| v2.0.0 | 2024-01 | 引入LSTM模型，提升预测精度 |\n| v3.0.0 | 2024-06 | 增加趋势预测和工艺建议功能 |\n| v3.0.1 | 2024-09 | 优化模型推理速度，降低延迟 |\n\n## 8. 依赖与前置条件\n\n- 硬件：温度传感器、转速编码器、PLC数据采集模块\n- 软件：Python 3.9+、PyTorch 2.0+、ONNX Runtime\n- 数据：至少100条历史工艺-粘度对应数据用于模型校准\n- 网络：可访问时序数据库和模型推理服务\n- 权限：需要工艺工程师角色权限\n- 前置流程：搅拌工序启动，温度达到稳定状态",
      config: "{\"model\": \"visc_lstm_v3\"}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    viscosity_prediction_v3 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池制造工艺标准 V4.1》", "《浆料搅拌工艺操作规程》", "《极片涂布工艺参数手册》"],
      assets: ["templates/process_record_template.xlsx", "config/process_parameters.json", "charts/control_chart_template.png"]
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
      readme: "# 涂布厚度闭环控制\n\n## 1. 概述\n\n### 1.1 业务价值\n涂布厚度一致性是锂电池极片质量的核心指标，直接影响电芯容量和循环寿命。本技能通过β射线测厚仪实时监测涂布厚度，结合MPC模型预测控制算法，实现模头间隙的自动闭环调节，将厚度CPK从1.33提升至1.67以上，减少人工干预90%。\n\n### 1.2 技术原理\n采用模型预测控制(MPC)算法，结合β射线测厚仪的实时扫描数据，建立涂布厚度-模头间隙动态模型。控制器预测未来N步的厚度偏差，优化求解模头螺栓调整量，实现快速、稳定的厚度闭环控制，控制周期100ms。\n\n### 1.3 应用场景\n- 正极双面涂布厚度控制\n- 负极双面涂布厚度控制\n- 极片边缘削薄区厚度控制\n- 涂布换卷时的厚度快速收敛\n\n## 2. 输入规范\n\n| 参数名 | 类型 | 必填 | 默认值 | 说明 |\n|--------|------|------|--------|------|\n| beta_ray_reading | array | 是 | - | β射线测厚仪扫描数据数组(μm) |\n| current_gap | number | 是 | - | 当前模头间隙(μm) |\n| target_thickness | number | 否 | 150 | 目标涂布厚度(μm) |\n| line_speed | number | 否 | 30 | 涂布线速度(m/min) |\n| coating_width | number | 否 | 600 | 涂布宽度(mm) |\n| control_mode | string | 否 | 'auto' | 控制模式：auto/manual/adaptive |\n\n## 3. 输出规范\n\n| 参数名 | 类型 | 说明 |\n|--------|------|------|\n| adjustment_microns | number | 模头间隙调整量(μm)，正值为增大 |\n| predicted_thickness | number | 预测调整后的厚度(μm) |\n| control_action | string | 控制动作：increase/decrease/hold |\n| confidence | number | 控制决策置信度(0-1) |\n| cpk_current | number | 当前CPK值 |\n| adjustment_map | array | 各螺栓位置调整量分布 |\n\n## 4. 性能指标\n\n| 指标 | 数值 |\n|------|------|\n| 控制精度 | ±1μm |\n| 响应时间 | <100ms |\n| 超调量 | <2% |\n| 稳态误差 | <0.5μm |\n| CPK提升 | 从1.33到1.67+ |\n\n## 5. 使用示例\n\n### 5.1 基础调用\n`skill.invoke({ beta_ray_reading: [148, 149, 151, 152, 150], current_gap: 250 })`\n\n### 5.2 完整参数调用\n`skill.invoke({ beta_ray_reading: [148, 149, 151, 152, 150], current_gap: 250, target_thickness: 150, line_speed: 35, coating_width: 650, control_mode: 'adaptive' })`\n\n## 6. 故障处理\n\n| 错误码 | 说明 | 处理建议 |\n|--------|------|----------|\n| Coat_001 | 测厚仪通信中断 | 检查β射线测厚仪网络连接 |\n| Coat_002 | 模头执行器故障 | 检查伺服电机和传动机构 |\n| Coat_003 | 厚度偏差超限 | 检查浆料供应稳定性，确认target_thickness设置 |\n| Coat_004 | 控制算法发散 | 切换至manual模式，联系工艺工程师 |\n| Coat_005 | 输入数据异常 | 检查beta_ray_reading数组长度和数值范围 |\n\n## 7. 版本历史\n\n| 版本 | 日期 | 变更内容 |\n|------|------|----------|\n| v1.0.0 | 2023-06 | 初始版本，基于PID控制 |\n| v1.2.0 | 2023-12 | 引入前馈补偿，提升响应速度 |\n| v1.5.0 | 2024-06 | 升级为MPC控制，支持多变量优化 |\n\n## 8. 依赖与前置条件\n\n- 硬件：β射线测厚仪、伺服电机驱动的模头调节机构、PLC控制器\n- 软件：TwinCAT 3、MATLAB/Simulink Runtime、Python 3.9+\n- 网络：EtherCAT实时以太网、OPC UA数据接口\n- 权限：需要设备操作员或工艺工程师角色权限\n- 前置流程：涂布机运行稳定，测厚仪校准完成，浆料供应正常",
      config: "{\"target_thickness\": 150, \"control_period\": \"100ms\"}",
      script: "/**\n * coating_thickness_loop_v1 - 确定性执行脚本\n * 核心原则：相同输入 + 相同状态 = 相同输出\n */\n\nclass SkillExecutor {\n  constructor(config = {}) {\n    this.config = config;\n    this.startTime = Date.now();\n  }\n\n  /**\n   * 输入参数校验\n   */\n  validateInput(event) {\n    if (typeof event !== 'object' || event === null) {\n      return { valid: false, error: 'INPUT_MUST_BE_OBJECT' };\n    }\n    return { valid: true };\n  }\n\n  /**\n   * 执行逻辑 - 必须是确定性的\n   * 不允许使用 Math.random()、Date.now() 等不确定因素\n   */\n  execute(event) {\n    // 1. 输入校验\n    const validation = this.validateInput(event);\n    if (!validation.valid) {\n      return { error: validation.error, status: 'FAILED' };\n    }\n\n    // 2. 业务逻辑执行\n    const result = this.businessLogic(event);\n\n    // 3. 构建确定性输出\n    return {\n      status: 'SUCCESS',\n      result,\n      executionTimeMs: Date.now() - this.startTime\n    };\n  }\n\n  /**\n   * 业务逻辑实现\n   */\n  businessLogic(event) {\n    // 根据具体技能实现业务逻辑\n    return event;\n  }\n}\n\n/**\n * 技能入口函数\n */\nfunction handler(event, context = {}) {\n  const executor = new SkillExecutor(context.config);\n  return executor.execute(event);\n}\n\nmodule.exports = { handler, SkillExecutor };",
      scriptLang: "javascript",
      references: ["《锂电池制造工艺标准 V4.1》", "《浆料搅拌工艺操作规程》", "《极片涂布工艺参数手册》"],
      assets: ["templates/process_record_template.xlsx", "config/process_parameters.json", "charts/control_chart_template.png"]
    }
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
      readme: "# Roller Pressure Optimization\n\n维持极片压实密度恒定。",
      config: "{\"target_density\": 1.5}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    roller_pressure_opt_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Tension Control\n\nPID + 前馈控制算法，用于消除卷针非圆效应引起的张力波动。",
      config: "{\"kp\": 0.5, \"ki\": 0.1}",
      script: "/**\n * tension_control_algo_v1 - 确定性执行脚本\n * 核心原则：相同输入 + 相同状态 = 相同输出\n */\n\nclass SkillExecutor {\n  constructor(config = {}) {\n    this.config = config;\n    this.startTime = Date.now();\n  }\n\n  /**\n   * 输入参数校验\n   */\n  validateInput(event) {\n    if (typeof event !== 'object' || event === null) {\n      return { valid: false, error: 'INPUT_MUST_BE_OBJECT' };\n    }\n    return { valid: true };\n  }\n\n  /**\n   * 执行逻辑 - 必须是确定性的\n   * 不允许使用 Math.random()、Date.now() 等不确定因素\n   */\n  execute(event) {\n    // 1. 输入校验\n    const validation = this.validateInput(event);\n    if (!validation.valid) {\n      return { error: validation.error, status: 'FAILED' };\n    }\n\n    // 2. 业务逻辑执行\n    const result = this.businessLogic(event);\n\n    // 3. 构建确定性输出\n    return {\n      status: 'SUCCESS',\n      result,\n      executionTimeMs: Date.now() - this.startTime\n    };\n  }\n\n  /**\n   * 业务逻辑实现\n   */\n  businessLogic(event) {\n    // 根据具体技能实现业务逻辑\n    return event;\n  }\n}\n\n/**\n * 技能入口函数\n */\nfunction handler(event, context = {}) {\n  const executor = new SkillExecutor(context.config);\n  return executor.execute(event);\n}\n\nmodule.exports = { handler, SkillExecutor };",
      scriptLang: "javascript",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Soaking Prediction\n\n基于注液量和真空静置时间，预测电解液浸润质量。",
      config: "{}",
      script: "/**\n * electrolyte_soaking_pred_v1 - 确定性执行脚本\n * 核心原则：相同输入 + 相同状态 = 相同输出\n */\n\nclass SkillExecutor {\n  constructor(config = {}) {\n    this.config = config;\n    this.startTime = Date.now();\n  }\n\n  /**\n   * 输入参数校验\n   */\n  validateInput(event) {\n    if (typeof event !== 'object' || event === null) {\n      return { valid: false, error: 'INPUT_MUST_BE_OBJECT' };\n    }\n    return { valid: true };\n  }\n\n  /**\n   * 执行逻辑 - 必须是确定性的\n   * 不允许使用 Math.random()、Date.now() 等不确定因素\n   */\n  execute(event) {\n    // 1. 输入校验\n    const validation = this.validateInput(event);\n    if (!validation.valid) {\n      return { error: validation.error, status: 'FAILED' };\n    }\n\n    // 2. 业务逻辑执行\n    const result = this.businessLogic(event);\n\n    // 3. 构建确定性输出\n    return {\n      status: 'SUCCESS',\n      result,\n      executionTimeMs: Date.now() - this.startTime\n    };\n  }\n\n  /**\n   * 业务逻辑实现\n   */\n  businessLogic(event) {\n    // 根据具体技能实现业务逻辑\n    return event;\n  }\n}\n\n/**\n * 技能入口函数\n */\nfunction handler(event, context = {}) {\n  const executor = new SkillExecutor(context.config);\n  return executor.execute(event);\n}\n\nmodule.exports = { handler, SkillExecutor };",
      scriptLang: "javascript",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Capacity Prediction v5\n\n利用充电曲线特征（dV/dQ）预测电池容量。",
      config: "{\"feature_extraction\": \"standard\"}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    capacity_prediction_v5 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Thermal Runaway Warning\n\n监测电芯温升速率 (dT/dt) 和电压压差。",
      config: "{\"max_temp_diff\": 5.0}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    thermal_runaway_warning_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池安全生产规范》", "《热失控预防与应急处理》", "《Pack安全检测标准》"],
      assets: ["templates/safety_checklist_template.xlsx", "config/alert_thresholds.json", "procedures/emergency_response.pdf"]
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
      readme: "# S&OP Balancer (Lithium Battery Edition)\n\n## 概述\n锂电制造典型的TOC（瓶颈管理）场景优化器。针对后端化成（Formation）产能受限和中间品高温静置（Aging）周期长的特点，平衡前端极片制造速度与后端Pack交付需求。\n\n## 关键约束模型\n1. **化成柜OEE**: 限制电芯下线速度的硬约束。\n2. **静置室库位**: 限制WIP（在制品）积压上限。\n3. **正极材料供应**: LFP/NCM 昂贵主材的JIT到货匹配。\n\n## 业务价值\n* 消除化成段“堵柜”现象\n* 降低高价值正极材料库存资金占用\n* 确保 Pack 订单的齐套率",
      config: "{\"solver\": \"cbc\", \"time_horizon\": \"12 weeks\", \"constraints\": [\"formation_capacity\", \"aging_room_slots\"]}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    sop_balancer_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《生产计划管理规范》", "《产销协同作业指导书》", "《库存管理策略文档》"],
      assets: ["templates/production_plan_template.xlsx", "config/capacity_constraints.json", "config/material_lead_times.json"]
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
      readme: "# Equipment RUL Prediction\n\n## 概述\nRemaining Useful Life (RUL) 预测模型。\n\n## 输入数据\n* **振动频谱**: 频域特征用于识别轴承磨损。\n* **油液分析**: 铁谱分析数据用于检测齿轮箱磨损。\n\n## 算法\n结合 CNN (提取频域特征) 和 LSTM (时序退化建模) 的混合网络。",
      config: "{\"model_path\": \"s3://models/rul_hybrid_v2.pt\", \"threshold_alert\": 7}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    equipment_rul_pred_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《设备维护保养手册》", "《设备故障诊断指南》", "《设备点检标准》"],
      assets: ["templates/maintenance_record_template.xlsx", "config/equipment_specifications.json", "models/digital_twin_config.json"]
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
      readme: "# Repair Time Estimator\n\n## 概述\n当设备发生停机故障时，该技能用于快速估算预计修复时间 (Time-to-Repair)，辅助生产调度决策。\n\n## 核心逻辑\n1. **历史回溯**: 查询知识图谱中具有相同 `failure_code` 的历史工单，计算平均修复工时。\n2. **专家匹配**: 根据故障类型匹配技能矩阵，检查专家的当前工单状态及排班表。\n3. **备件物流**: \n   - 检查备件库存充足度。\n   - 计算从备件库（或供应商）到产线的物流距离和配送时间。\n\n## 场景示例\n涂布机模头堵塞，系统自动计算出清洗所需垫片库存充足，最近的熟练维修工在500米外的2号车间，预计总修复时间为 45 分钟。",
      config: "{\"search_radius\": \"factory_zone_a\", \"expert_skills_matrix\": \"db_ref_v1\", \"agv_speed\": \"1.5m/s\"}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    repair_time_estimator_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Cost Realtime Analyzer\n\n聚合SCADA能耗数据与MES投料数据，实时计算单吨成本。",
      config: "{\"currency\": \"CNY\", \"allocation_rule\": \"activity_based\"}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    cost_realtime_analyzer_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Inventory Optimizer\n\n识别库龄超标物料，并结合需求预测给出库存优化建议。",
      config: "{\"dead_stock_threshold_days\": 90}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    inventory_turnover_opt_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Energy Audit\n\n基于设备状态机监测能源浪费（如停机未断电）。",
      config: "{\"baseline_kwh\": 50}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    energy_consumption_audit_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Quality Prediction Model\n\n## 概述\n电芯质量预测模型，用于在化成分容前预测电芯质量等级。\n\n## 输入特征\n- **工艺参数**: 涂布重量、辊压厚度、卷绕张力等\n- **原材料规格**: 正极材料批次、电解液配方等\n- **设备状态**: 关键设备的健康度和稳定性\n- **环境数据**: 温湿度、洁净度等\n\n## 输出\n- 质量评分 (0-100)\n- 缺陷概率\n- 主要风险因素\n- 改进建议",
      config: "{\"model_type\": \"xgboost\", \"threshold\": 0.85}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    quality_predict_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
    }
  },
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
      readme: "# Demand Forecast for Lithium Battery\n\n## 概述\n针对锂电行业特点构建的需求预测模型，考虑储能/动力不同市场的周期性波动。\n\n## 算法特性\n- **时序分解**: 分离趋势、季节、周期和随机成分\n- **客户细分**: 区分储能大项目（波动大）和动力电池（相对稳）\n- **外部变量**: 纳入锂价指数、新能源车销量等宏观指标\n\n## 输出\n提供点预测和置信区间，支持S&OP决策。",
      config: "{\"horizon_weeks\": 52, \"confidence_level\": 0.95, \"models\": [\"prophet\", \"lstm\"]}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    demand_forecast_v3 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Capacity Evaluation\n\n## 概述\n锂电制造产能评估器，针对多工序串联特性计算整体产出能力。\n\n## 评估维度\n1. **理论产能**: 设备铭牌参数计算\n2. **可用产能**: 扣除计划停机、保养\n3. **有效产能**: 考虑良品率和换型时间\n4. **瓶颈识别**: 找出限制整体产出的关键工序（通常是化成）\n\n## 应用场景\n- 接单评审：评估新订单交付可行性\n- 产能规划：支持扩产投资决策",
      config: "{\"oee_target\": 0.85, \"quality_rate\": 0.98}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    capacity_evaluation_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Smart Scheduling Engine\n\n## 概述\n锂电行业专用高级排程系统，解决前后工序产能不匹配、换型时间长等痛点。\n\n## 核心算法\n- **约束传播**: 处理物料齐套、设备互斥等硬约束\n- **启发式规则**: 最小化换型时间、均衡化生产\n- **优化目标**: 最大化交付率、最小化WIP库存\n\n## 特殊处理\n- **化成段排程**: 考虑化成柜充放电程序时长差异\n- **静置等待**: 自动计算高温静置时间窗口\n- **紧急插单**: 支持快速评估插单对整体计划的影响",
      config: "{\"solver\": \"ortools\", \"time_bucket\": \"hour\", \"lookahead_days\": 30}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    smart_scheduling_v4 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    inventory_optimization_v3 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    supply_chain_collab_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    order_fulfillment_tracking_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    logistics_optimization_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Production-Sales Balance Alert\n\n## 概述\n产销平衡监控预警系统，支撑S&OP会议决策。\n\n## 预警类型\n1. **产能不足**: 需求 > 可用产能\n2. **产能闲置**: 产能利用率 < 70%\n3. **库存积压**: 成品库存 > 安全库存上限\n4. **缺货风险**: 成品库存 < 安全库存下限\n\n## 建议措施\n- 加班/外包\n- 促销活动\n- 客户优先级调整\n- 产能调配（储能/动力切换）",
      config: "{\"utilization_threshold_low\": 0.70, \"utilization_threshold_high\": 0.95}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    production_sales_alert_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# NPV/IRR Calculator\n\n## 概述\n基于现金流折现法的投资项目财务评估工具。\n\n## 计算逻辑\n- NPV = ∑(CF_t / (1+r)^t) - Initial_Investment\n- IRR: 使NPV=0的折现率\n- 回收期: 累计现金流转正的时间点\n\n## 应用场景\n- 新产线投资决策\n- 扩建 vs 新建方案比选\n- 不同选址方案的经济性评估",
      config: "{\"default_discount_rate\": 0.10, \"tax_rate\": 0.25}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    npv_calculator_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Location Optimizer\n\n## 概述\n多目标优化算法驱动的生产基地选址决策支持系统。\n\n## 评估维度\n1. **供应链成本**: 原材料运输 + 成品配送\n2. **运营成本**: 土地 + 人工 + 能源 + 税收\n3. **风险因素**: 环保政策 + 劳动力供给 + 地方财政\n4. **战略价值**: 靠近客户 + 产业集群 + 扩展空间\n\n## 算法\nAHP层次分析法 + TOPSIS理想解排序",
      config: "{\"transport_cost_per_km\": 0.5, \"logistics_weight\": 0.3, \"labor_weight\": 0.25}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    location_optimizer_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    risk_simulator_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    market_forecast_v2 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    capex_analyzer_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    sensitivity_analysis_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# OEE Analyzer\n\n## 概述\n设备综合效率（OEE）分析工具，基于锂电行业特点优化。\n\n## 计算公式\n- OEE = 时间开动率 × 性能开动率 × 质量合格率\n- 时间开动率 = 实际运行时间 / 计划工作时间\n- 性能开动率 = 实际产出 / 理论产出\n- 质量合格率 = 合格品数 / 总产出数\n\n## 应用场景\n- 产能评估\n- 瓶颈识别\n- 改善机会发现",
      config: "{\"world_class_oee\": 0.85, \"target_oee\": 0.80}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    oee_analyzer_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      readme: "# Bottleneck Identifier\n\n## 概述\n基于约束理论（TOC）的产线瓶颈识别工具。\n\n## 分析维度\n- 工序周期时间对比\n- 设备利用率分析\n- 在制品（WIP）堆积情况\n- 产出节拍差异\n\n## 锂电行业重点\n- 涂布工序：面密度控制\n- 卷绕工序：对齐度要求\n- 化成工序：充放电时间\n- 分容工序：容量测试时长",
      config: "{\"bottleneck_threshold\": 0.90, \"wip_threshold\": 1000}",
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    bottleneck_identifier_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)"
      ,
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    equipment_health_monitor_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)"
      ,
      scriptLang: "python",
      references: ["《设备维护保养手册》", "《设备故障诊断指南》", "《设备点检标准》"],
      assets: ["templates/maintenance_record_template.xlsx", "config/equipment_specifications.json", "models/digital_twin_config.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    roi_calculator_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    production_simulator_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)"
      ,
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    risk_assessor_v1 - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)"
      ,
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_equipment_health_assessment - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《设备维护保养手册》", "《设备故障诊断指南》", "《设备点检标准》"],
      assets: ["templates/maintenance_record_template.xlsx", "config/equipment_specifications.json", "models/digital_twin_config.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_rul_prediction - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《设备维护保养手册》", "《设备故障诊断指南》", "《设备点检标准》"],
      assets: ["templates/maintenance_record_template.xlsx", "config/equipment_specifications.json", "models/digital_twin_config.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_mttr_prediction - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_spare_part_demand_forecast - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_process_cycle_modeling - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_line_balancing - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_bottleneck_identification - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_scheduling_optimization - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_yield_ramp_prediction - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_supply_chain_capacity_matching - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    domain_oee_comprehensive_analysis - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_predictive_maintenance_decision - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《设备维护保养手册》", "《设备故障诊断指南》", "《设备点检标准》"],
      assets: ["templates/maintenance_record_template.xlsx", "config/equipment_specifications.json", "models/digital_twin_config.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_downtime_impact_assessment - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_repair_time_decision - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_repair_impact_simulation - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_demand_capacity_matching - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_inventory_optimization_decision - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_production_sales_deviation_alert - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_new_line_investment - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_multi_option_comparison - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_supply_chain_risk_assessment - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_future_capacity_prediction - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_expansion_benefit - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
      script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    scenario_constraint_bottleneck - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)",
      scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"]
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
    files: { readme: "# 时间序列预测\n\n## 技能概述\n时间序列预测技能用于对锂电池制造过程中的各类时序数据进行趋势预测，支持产能规划、需求预测、设备状态预判等场景。采用ARIMA、Prophet、LSTM等多种算法，自动选择最优模型。\n\n## 输入规范\n- `historical_data`: 历史数据数组，至少包含30个数据点\n- `forecast_horizon`: 预测步长，范围1-90（天/小时等）\n- `confidence_level`: 置信水平，可选0.8、0.9、0.95、0.99\n- `frequency`: 数据频率，支持'daily'、'hourly'、'weekly'\n- `seasonality_mode`: 季节性模式，可选'additive'、'multiplicative'\n\n## 输出规范\n- `predictions`: 预测值数组，长度等于forecast_horizon\n- `confidence_intervals`: 置信区间数组，包含lower和upper边界\n- `model_metrics`: 模型评估指标，包含MAPE、RMSE、MAE\n- `selected_model`: 最终选用的模型名称\n- `trend_direction`: 趋势方向，up/down/stable\n\n## 性能指标\n- 预测准确率：MAPE < 15%（常规场景）\n- 响应时间：< 3秒（数据量<1000条）\n- 支持并发：50个请求/秒\n\n## 使用示例\n```\n输入：\n{\n  historical_data: [120, 125, 118, 132, 140, ...],\n  forecast_horizon: 7,\n  confidence_level: 0.95,\n  frequency: 'daily'\n}\n\n输出：\n{\n  predictions: [145, 148, 152, 150, 155, 158, 160],\n  confidence_intervals: [{lower: 138, upper: 152}, ...],\n  model_metrics: {MAPE: 8.5, RMSE: 12.3},\n  trend_direction: 'up'\n}\n```\n\n## 故障处理\n- E001: 历史数据不足，请提供至少30个数据点\n- E002: 数据频率不一致，请检查时间间隔\n- E003: 异常值过多（>10%），建议先进行数据清洗\n- E004: 模型收敛失败，尝试简化季节性设置\n\n## 版本历史\n- v1.2.0 (2024-03): 新增LSTM深度学习支持\n- v1.1.0 (2024-02): 增加多季节性分解\n- v1.0.0 (2024-01): 初始版本，支持ARIMA和Prophet\n\n## 依赖与前置条件\n- 需要安装pandas、numpy、statsmodels、prophet、tensorflow\n- 建议内存配置：>=4GB\n- 数据预处理：建议使用atom_data_cleaning进行预处理", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_time_series_forecast - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 异常检测\n\n## 技能概述\n异常检测技能用于识别锂电池制造过程中的设备异常、质量异常和工艺偏差。支持统计方法（3-sigma、IQR）、机器学习方法（Isolation Forest、One-Class SVM）和深度学习方法（AutoEncoder），可应用于涂布厚度异常、温度波动、设备振动等场景。\n\n## 输入规范\n- `data`: 待检测的数据数组或矩阵\n- `method`: 检测方法，可选'statistical'、'isolation_forest'、'autoencoder'\n- `contamination`: 异常比例预估，范围0.01-0.1\n- `sensitivity`: 敏感度，可选'low'、'medium'、'high'\n- `window_size`: 滑动窗口大小，用于时序异常检测\n\n## 输出规范\n- `anomalies`: 异常点索引列表\n- `anomaly_scores`: 异常分数数组，分数越高越异常\n- `threshold_used`: 实际使用的阈值\n- `anomaly_labels`: 异常类型标签\n- `confidence`: 检测结果置信度\n\n## 性能指标\n- 检测准确率：>90%（已知异常类型）\n- 误报率：<5%\n- 响应时间：<200ms（数据量<10000条）\n- 支持实时流式检测\n\n## 使用示例\n```\n输入：\n{\n  data: [120, 125, 118, 500, 132, 140, 135, 600],\n  method: 'isolation_forest',\n  contamination: 0.05\n}\n\n输出：\n{\n  anomalies: [3, 7],\n  anomaly_scores: [0.2, 0.1, 0.15, 0.95, 0.12, 0.18, 0.14, 0.98],\n  threshold_used: 0.8,\n  anomaly_labels: ['spike', 'spike']\n}\n```\n\n## 故障处理\n- E101: 数据维度不匹配，请检查输入数据格式\n- E102: 模型训练失败，异常样本过少\n- E103: 参数超出范围，contamination应在0.01-0.1之间\n- E104: GPU内存不足，尝试使用CPU模式\n\n## 版本历史\n- v1.2.0 (2024-03): 新增AutoEncoder深度学习支持\n- v1.1.0 (2024-02): 增加时序滑动窗口检测\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scikit-learn、numpy、tensorflow（深度学习模式）\n- 建议内存配置：>=2GB\n- 训练数据：正常样本至少100条", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_anomaly_detection - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 变点检测\n\n## 技能概述\n变点检测技能用于识别锂电池制造过程中设备状态、工艺参数、质量指标的突变点。支持PELT、Binary Segmentation、Window-based等算法，可应用于检测设备退化转折点、工艺切换点、原材料批次变更等场景。\n\n## 输入规范\n- `time_series`: 时间序列数据数组\n- `penalty`: 惩罚系数，控制变点数量，默认值为10\n- `min_segment_length`: 最小分段长度，默认值为10\n- `model`: 成本模型，可选'l2'、'l1'、'rbf'\n- `algorithm`: 算法类型，可选'pelt'、'binseg'、'window'\n\n## 输出规范\n- `change_points`: 变点索引列表\n- `segments`: 分段信息，包含每段的起止点和统计特征\n- `confidence_scores`: 每个变点的置信度分数\n- `segment_stats`: 各段的均值、方差等统计量\n\n## 性能指标\n- 检测准确率：>85%（模拟数据）\n- 响应时间：<300ms（数据量<5000点）\n- 支持在线增量检测\n- 内存占用：<500MB\n\n## 使用示例\n```\n输入：\n{\n  time_series: [100, 102, 101, 103, 150, 152, 148, 155],\n  penalty: 5,\n  min_segment_length: 3,\n  algorithm: 'pelt'\n}\n\n输出：\n{\n  change_points: [4],\n  segments: [{start: 0, end: 3, mean: 101.5}, {start: 4, end: 7, mean: 151.25}],\n  confidence_scores: [0.95]\n}\n```\n\n## 故障处理\n- E201: 数据长度过短，请提供至少20个数据点\n- E202: 惩罚系数设置不当，变点过多或过少\n- E203: 算法收敛失败，尝试更换算法类型\n- E204: 内存溢出，尝试减小数据量或增大min_segment_length\n\n## 版本历史\n- v1.1.0 (2024-02): 新增在线增量检测模式\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装ruptures、numpy、scipy\n- 建议内存配置：>=2GB\n- 数据预处理：建议先进行去噪处理", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_change_point_detection - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 退化曲线拟合\n\n## 技能概述\n退化曲线拟合技能用于建模锂电池制造设备的性能退化过程，支持指数退化、线性退化、威布尔分布、对数线性等多种模型。广泛应用于设备健康度评估、剩余寿命预测、预防性维护决策等场景。\n\n## 输入规范\n- `health_indicators`: 健康指标数据数组\n- `time_points`: 对应的时间点数组\n- `model_type`: 退化模型类型，可选'exponential'、'linear'、'weibull'、'log_linear'\n- `failure_threshold`: 故障阈值，用于计算剩余寿命\n- `confidence_level`: 置信水平，默认0.95\n\n## 输出规范\n- `fitted_curve`: 拟合曲线数据点\n- `parameters`: 模型参数（如指数模型的a、b参数）\n- `r_squared`: 拟合优度R²\n- `predicted_failure_time`: 预测故障时间\n- `confidence_intervals`: 参数置信区间\n\n## 性能指标\n- 拟合优度R²：>0.85\n- 响应时间：<400ms\n- 支持批量处理：100条曲线/秒\n- 预测误差：MAPE < 20%\n\n## 使用示例\n```\n输入：\n{\n  health_indicators: [100, 98, 95, 92, 88, 85, 80, 75],\n  time_points: [0, 10, 20, 30, 40, 50, 60, 70],\n  model_type: 'exponential',\n  failure_threshold: 60\n}\n\n输出：\n{\n  fitted_curve: [100, 97.5, 95.1, 92.8, 90.5, 88.3, 86.1, 84.0],\n  parameters: {a: 100, b: 0.025},\n  r_squared: 0.98,\n  predicted_failure_time: 95\n}\n```\n\n## 故障处理\n- E301: 数据点不足，请提供至少5个数据点\n- E302: 模型拟合失败，尝试更换model_type\n- E303: 退化趋势不明显，无法建立可靠模型\n- E304: 参数超出物理意义范围，检查数据质量\n\n## 版本历史\n- v1.2.0 (2024-03): 新增威布尔退化模型\n- v1.1.0 (2024-02): 增加置信区间计算\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scipy、numpy、scikit-learn\n- 建议内存配置：>=2GB\n- 数据要求：健康指标应呈现单调退化趋势", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_degradation_curve_fitting - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 剩余寿命估计\n\n## 技能概述\n剩余寿命估计（RUL）技能基于设备退化模型预测锂电池制造设备的剩余可用时间。支持基于物理模型的方法、数据驱动方法和混合方法，可应用于卷绕机、涂布机、分切机等关键设备的维护计划制定。\n\n## 输入规范\n- `current_health`: 当前健康度指标（0-100）\n- `degradation_model`: 退化模型参数对象\n- `failure_threshold`: 故障阈值\n- `uncertainty_method`: 不确定性处理方法，可选'monte_carlo'、'confidence_interval'\n- `operating_conditions`: 当前工况参数\n\n## 输出规范\n- `rul_estimate`: RUL点估计值（小时/天）\n- `confidence_interval`: 置信区间\n- `failure_probability`: 随时间变化的故障概率数组\n- `recommendation`: 维护建议（立即/近期/正常）\n- `risk_level`: 风险等级\n\n## 性能指标\n- RUL预测误差：RMSE < 15%\n- 响应时间：<500ms\n- 置信区间覆盖率：>90%\n- 提前预警准确率：>85%\n\n## 使用示例\n```\n输入：\n{\n  current_health: 72,\n  degradation_model: {type: 'exponential', a: 100, b: 0.03},\n  failure_threshold: 60,\n  uncertainty_method: 'monte_carlo'\n}\n\n输出：\n{\n  rul_estimate: 240,\n  confidence_interval: {lower: 200, upper: 280},\n  failure_probability: [0.01, 0.02, ..., 0.5],\n  recommendation: '近期维护',\n  risk_level: 'medium'\n}\n```\n\n## 故障处理\n- E401: 退化模型无效，请检查模型参数\n- E402: 当前健康度已低于故障阈值\n- E403: 不确定性计算失败，尝试简化方法\n- E404: 工况数据缺失，使用默认工况\n\n## 版本历史\n- v1.2.0 (2024-03): 新增混合方法支持\n- v1.1.0 (2024-02): 增加多工况适应性\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scipy、numpy、atom_degradation_curve_fitting\n- 建议内存配置：>=2GB\n- 前置条件：已完成退化曲线拟合", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_remaining_useful_life - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 特征重要性计算\n\n## 技能概述\n特征重要性计算技能用于量化锂电池制造预测模型中各输入特征的贡献度。支持SHAP、Permutation Importance、Gini Importance等多种方法，帮助识别影响设备故障、质量缺陷、能耗的关键因素，支持模型可解释性和特征选择。\n\n## 输入规范\n- `model`: 已训练的预测模型对象\n- `features`: 特征矩阵（numpy数组或DataFrame）\n- `target`: 目标变量数组\n- `method`: 计算方法，可选'shap'、'permutation'、'gini'\n- `n_repeats`: Permutation重复次数，默认10\n\n## 输出规范\n- `importance_scores`: 特征重要性分数字典\n- `ranked_features`: 按重要性排序的特征名列表\n- `shap_values`: SHAP值矩阵（method='shap'时返回）\n- `feature_importance_df`: 包含特征名和重要性分数的DataFrame\n\n## 性能指标\n- 计算时间：<600ms（特征数<50）\n- 内存占用：<1GB\n- SHAP计算支持并行加速\n- 支持批量特征分析\n\n## 使用示例\n```\n输入：\n{\n  model: trained_model,\n  features: X_test,\n  target: y_test,\n  method: 'shap'\n}\n\n输出：\n{\n  importance_scores: {temperature: 0.35, vibration: 0.28, pressure: 0.15},\n  ranked_features: ['temperature', 'vibration', 'pressure'],\n  shap_values: [[0.2, -0.1, 0.05], ...]\n}\n```\n\n## 故障处理\n- E501: 模型不支持特征重要性提取\n- E502: 特征维度不匹配，请检查输入数据\n- E503: SHAP计算内存溢出，尝试减小样本量\n- E504: Permutation计算超时，减小n_repeats\n\n## 版本历史\n- v1.1.0 (2024-02): 新增Permutation Importance支持\n- v1.0.0 (2024-01): 初始版本，支持SHAP和Gini\n\n## 依赖与前置条件\n- 需要安装shap、scikit-learn、numpy、pandas\n- 建议内存配置：>=4GB（SHAP计算）\n- 前置条件：模型已完成训练", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_feature_importance - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 阈值判定算法\n\n## 技能概述\n阈值判定算法技能用于基于预设规则对锂电池制造过程中的参数进行分级判定和预警。支持多级阈值（正常/预警/告警/危险）、动态阈值调整、复合条件规则，广泛应用于设备状态监控、质量检测、环境参数控制等场景。\n\n## 输入规范\n- `value`: 当前测量值\n- `thresholds`: 阈值配置对象，如{warning: 80, alarm: 90, danger: 95}\n- `rules`: 复合规则数组，支持逻辑运算（AND/OR/NOT）\n- `hysteresis`: 迟滞带宽，防止阈值抖动\n- `time_window`: 持续时间窗口，用于持续异常检测\n\n## 输出规范\n- `decision`: 判定结果，如'normal'、'warning'、'alarm'、'danger'\n- `alert_level`: 告警级别\n- `action_required`: 是否需要采取行动\n- `triggered_rules`: 触发的规则列表\n- `duration`: 当前状态持续时间\n\n## 性能指标\n- 响应时间：<50ms\n- 判定准确率：>95%\n- 支持实时流处理：10000次/秒\n- 内存占用：<100MB\n\n## 使用示例\n```\n输入：\n{\n  value: 88,\n  thresholds: {warning: 80, alarm: 90, danger: 95},\n  hysteresis: 2\n}\n\n输出：\n{\n  decision: 'warning',\n  alert_level: 'medium',\n  action_required: true,\n  triggered_rules: ['threshold_warning'],\n  duration: 120\n}\n```\n\n## 故障处理\n- E601: 阈值配置无效，请检查阈值顺序\n- E602: 规则语法错误，请检查rules格式\n- E603: 迟滞带宽过大，可能导致判定延迟\n- E604: 时间窗口设置不当\n\n## 版本历史\n- v1.2.0 (2024-03): 新增复合规则支持\n- v1.1.0 (2024-02): 增加动态阈值调整\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装numpy\n- 建议内存配置：>=512MB\n- 无特殊前置条件", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_threshold_decision - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 概率分布拟合\n\n## 技能概述\n概率分布拟合技能用于对锂电池制造过程中的各类随机变量（如设备故障间隔、维修时间、物料交付时间）进行分布建模。支持正态、对数正态、威布尔、指数、伽马等15+种分布，自动选择最佳拟合模型，为可靠性分析和风险评估提供基础。\n\n## 输入规范\n- `data`: 观测数据数组\n- `distributions`: 待拟合分布列表，如['normal', 'weibull', 'lognormal']\n- `method`: 拟合方法，可选'mle'（最大似然）、'mme'（矩估计）\n- `goodness_of_fit_test`: 拟合优度检验方法，可选'ks'、'ad'\n\n## 输出规范\n- `best_fit`: 最佳拟合分布名称\n- `parameters`: 分布参数（如正态分布的mu、sigma）\n- `goodness_of_fit`: 拟合优度统计量\n- `fitted_pdf`: 拟合的概率密度函数数据\n- `aic_bic`: 模型选择指标\n\n## 性能指标\n- 拟合时间：<400ms（数据量<10000）\n- 支持分布类型：15+\n- 拟合优度检验：KS检验、AD检验\n- 支持右删失数据\n\n## 使用示例\n```\n输入：\n{\n  data: [120, 135, 128, 142, 155, 148, 160, 138],\n  distributions: ['normal', 'weibull', 'lognormal'],\n  method: 'mle'\n}\n\n输出：\n{\n  best_fit: 'normal',\n  parameters: {mu: 140.5, sigma: 12.3},\n  goodness_of_fit: {ks_statistic: 0.15, p_value: 0.82},\n  aic_bic: {aic: 45.2, bic: 48.1}\n}\n```\n\n## 故障处理\n- E701: 数据包含负值或非正值，某些分布无法拟合\n- E702: 拟合收敛失败，尝试更换分布类型\n- E703: 数据量过少，建议至少30个样本\n- E704: 所有分布拟合效果均不佳，检查数据质量\n\n## 版本历史\n- v1.2.0 (2024-03): 新增支持右删失数据\n- v1.1.0 (2024-02): 增加AIC/BIC模型选择\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scipy、numpy、statsmodels\n- 建议内存配置：>=1GB\n- 数据预处理：建议先进行异常值清洗", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_probability_distribution_fit - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 分类识别\n\n## 技能概述\n分类识别技能用于对锂电池制造过程中的样本进行分类预测，如故障类型识别、质量等级判定、设备状态分类等。支持随机森林、SVM、XGBoost、神经网络等多种算法，提供概率输出和置信度评估。\n\n## 输入规范\n- `features`: 特征矩阵\n- `labels`: 训练标签数组（训练时）\n- `new_data`: 待预测数据\n- `algorithm`: 算法类型，可选'random_forest'、'svm'、'xgboost'、'mlp'\n- `class_weights`: 类别权重，用于处理不平衡数据\n\n## 输出规范\n- `predictions`: 预测类别标签数组\n- `probabilities`: 各类别概率矩阵\n- `confidence`: 预测置信度数组\n- `feature_importance`: 特征重要性（树模型）\n\n## 性能指标\n- 预测准确率：>90%（取决于数据质量）\n- 响应时间：<300ms\n- 支持类别数：2-100类\n- 支持在线学习\n\n## 使用示例\n```\n输入：\n{\n  features: X_train,\n  labels: y_train,\n  new_data: X_test,\n  algorithm: 'random_forest'\n}\n\n输出：\n{\n  predictions: ['normal', 'fault_a', 'normal', 'fault_b'],\n  probabilities: [[0.9, 0.05, 0.05], [0.1, 0.8, 0.1], ...],\n  confidence: [0.9, 0.8, 0.85, 0.75]\n}\n```\n\n## 故障处理\n- E801: 类别不平衡严重，建议使用class_weights\n- E802: 特征维度不一致\n- E803: 模型过拟合，尝试增加正则化\n- E804: 未知类别出现在预测数据中\n\n## 版本历史\n- v1.2.0 (2024-03): 新增XGBoost支持\n- v1.1.0 (2024-02): 增加类别权重支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scikit-learn、xgboost、numpy\n- 建议内存配置：>=2GB\n- 训练数据：每类至少50个样本", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_classification - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 多变量回归预测\n\n## 技能概述\n多变量回归预测技能用于建立锂电池制造过程中多输入单输出的预测模型，如能耗预测、产量预测、质量指标预测等。支持线性回归、岭回归、Lasso、ElasticNet、多项式回归等方法，提供正则化和特征选择功能。\n\n## 输入规范\n- `X`: 输入特征矩阵\n- `y`: 目标变量数组\n- `X_new`: 待预测数据\n- `regularization`: 正则化类型，可选'none'、'l2'（岭回归）、'l1'（Lasso）\n- `alpha`: 正则化强度\n\n## 输出规范\n- `predictions`: 预测值数组\n- `coefficients`: 回归系数\n- `r_squared`: 决定系数R²\n- `residuals`: 残差数组\n- `confidence_intervals`: 预测置信区间\n\n## 性能指标\n- 预测精度：R² > 0.8\n- 响应时间：<400ms\n- 支持特征数：<1000\n- 支持样本数：<100000\n\n## 使用示例\n```\n输入：\n{\n  X: [[25, 60], [28, 65], [30, 70]],\n  y: [100, 110, 120],\n  X_new: [[26, 62]],\n  regularization: 'l2',\n  alpha: 0.1\n}\n\n输出：\n{\n  predictions: [103.5],\n  coefficients: [2.0, 0.5],\n  r_squared: 0.95,\n  residuals: [0.5, -0.3, 0.2]\n}\n```\n\n## 故障处理\n- E901: 特征矩阵奇异，尝试增加正则化\n- E902: 多重共线性严重，建议进行特征选择\n- E903: 预测值超出合理范围，检查模型\n- E904: 残差分布异常，模型可能欠拟合\n\n## 版本历史\n- v1.1.0 (2024-02): 新增ElasticNet支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scikit-learn、numpy、scipy\n- 建议内存配置：>=2GB\n- 数据预处理：建议进行标准化/归一化", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_multivariate_regression - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 聚类分析\n\n## 技能概述\n聚类分析技能用于对锂电池制造过程中的样本进行无监督分组，如设备工况模式识别、产品质量分级、供应商分类等。支持K-Means、DBSCAN、层次聚类、高斯混合模型等多种算法，自动确定最佳聚类数。\n\n## 输入规范\n- `data`: 输入数据矩阵\n- `n_clusters`: 聚类数量（K-Means等需要）\n- `algorithm`: 算法类型，可选'kmeans'、'dbscan'、'hierarchical'、'gmm'\n- `distance_metric`: 距离度量，可选'euclidean'、'manhattan'、'cosine'\n- `auto_k`: 是否自动确定聚类数\n\n## 输出规范\n- `labels`: 聚类标签数组\n- `cluster_centers`: 聚类中心坐标\n- `inertia`: 聚类内平方和（K-Means）\n- `silhouette_score`: 轮廓系数\n- `cluster_stats`: 各聚类的统计信息\n\n## 性能指标\n- 聚类质量：轮廓系数 > 0.5\n- 响应时间：<500ms（样本数<10000）\n- 支持维度：<100维\n- 支持算法：4种\n\n## 使用示例\n```\n输入：\n{\n  data: [[25, 60], [28, 65], [80, 90], [85, 95]],\n  n_clusters: 2,\n  algorithm: 'kmeans'\n}\n\n输出：\n{\n  labels: [0, 0, 1, 1],\n  cluster_centers: [[26.5, 62.5], [82.5, 92.5]],\n  inertia: 25.0,\n  silhouette_score: 0.78\n}\n```\n\n## 故障处理\n- E1001: 聚类数大于样本数\n- E1002: DBSCAN所有点被标记为噪声，尝试调整eps参数\n- E1003: 数据维度灾难，建议降维处理\n- E1004: 聚类结果不稳定，尝试多次初始化\n\n## 版本历史\n- v1.1.0 (2024-02): 新增自动确定聚类数\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scikit-learn、numpy、scipy\n- 建议内存配置：>=2GB\n- 数据预处理：建议进行标准化", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_clustering - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 资源分配算法\n\n## 技能概述\n资源分配算法技能用于优化分配锂电池制造过程中的有限资源（设备、人员、物料），以满足多目标需求。支持线性规划、启发式算法、遗传算法等方法，可应用于维修人员调度、AGV路径分配、生产任务分配等场景。\n\n## 输入规范\n- `resources`: 资源定义对象，包含各资源容量和成本\n- `demands`: 需求列表，包含需求量和优先级\n- `constraints`: 约束条件，如资源互斥、时间窗口\n- `objective`: 优化目标，可选'mimimize_cost'、'maximize_utilization'、'balance_load'\n\n## 输出规范\n- `allocation_plan`: 资源分配方案\n- `utilization_rate`: 资源利用率\n- `unmet_demands`: 未满足的需求列表\n- `total_cost`: 总成本\n- `allocation_matrix`: 分配矩阵\n\n## 性能指标\n- 求解时间：<600ms\n- 资源利用率：>85%\n- 需求满足率：>90%\n- 支持资源类型：<50种\n\n## 使用示例\n```\n输入：\n{\n  resources: {technician: 5, engineer: 2},\n  demands: [{id: 1, skill: 'technician', priority: 1}, ...],\n  objective: 'minimize_cost'\n}\n\n输出：\n{\n  allocation_plan: {1: 'technician_a', 2: 'engineer_b'},\n  utilization_rate: 0.87,\n  unmet_demands: [],\n  total_cost: 1500\n}\n```\n\n## 故障处理\n- E1101: 资源不足，无法满足所有需求\n- E1102: 约束条件冲突，无可行解\n- E1103: 求解超时，尝试简化问题\n- E1104: 资源定义不完整\n\n## 版本历史\n- v1.1.0 (2024-02): 新增多目标优化支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pulp、scipy、numpy\n- 建议内存配置：>=2GB\n- 前置条件：资源容量和需求已明确定义", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_resource_allocation - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 排队论计算\n\n## 技能概述\n排队论计算技能用于分析锂电池制造系统中的排队系统性能，如维修工单队列、AGV等待队列、物料检验队列等。支持M/M/1、M/M/c、M/G/1等经典排队模型，计算系统利用率、平均等待时间、队列长度等关键指标。\n\n## 输入规范\n- `arrival_rate`: 到达率（单位时间到达数）\n- `service_rate`: 服务率（单位时间服务数）\n- `servers`: 服务台数量\n- `capacity`: 系统容量（最大排队数），0表示无限\n- `model_type`: 模型类型，可选'M/M/1'、'M/M/c'、'M/G/1'\n\n## 输出规范\n- `utilization`: 系统利用率\n- `avg_wait_time`: 平均等待时间\n- `queue_length`: 平均队列长度\n- `prob_wait`: 需要等待的概率\n- `prob_empty`: 系统空闲概率\n\n## 性能指标\n- 计算时间：<150ms\n- 支持模型：5种经典排队模型\n- 精度：理论精确解\n- 支持稳态分析\n\n## 使用示例\n```\n输入：\n{\n  arrival_rate: 10,\n  service_rate: 12,\n  servers: 2,\n  model_type: 'M/M/c'\n}\n\n输出：\n{\n  utilization: 0.42,\n  avg_wait_time: 0.05,\n  queue_length: 0.5,\n  prob_wait: 0.15,\n  prob_empty: 0.58\n}\n```\n\n## 故障处理\n- E1201: 到达率大于服务率，系统不稳定\n- E1202: 利用率接近1，系统饱和\n- E1203: 参数为负值或零\n- E1204: 模型假设不满足\n\n## 版本历史\n- v1.1.0 (2024-02): 新增M/G/1模型支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装numpy、scipy\n- 建议内存配置：>=512MB\n- 数据要求：到达过程应符合泊松过程假设", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_queuing_theory - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 路径最短算法\n\n## 技能概述\n路径最短算法技能用于在锂电池制造相关的网络图中找到最优路径，如AGV最优路径、物料配送路径、供应链物流路径等。支持Dijkstra、A*、Bellman-Ford、Floyd-Warshall等算法，可处理带权有向图和无向图。\n\n## 输入规范\n- `graph`: 图结构对象，包含节点和边\n- `start`: 起点节点ID\n- `end`: 终点节点ID\n- `algorithm`: 算法类型，可选'dijkstra'、'a_star'、'bellman_ford'\n- `heuristic`: A*算法的启发函数（可选）\n\n## 输出规范\n- `path`: 最短路径节点序列\n- `distance`: 最短路径总权重\n- `visited_nodes`: 算法访问的节点数\n- `execution_time`: 算法执行时间\n- `alternatives`: 备选路径（k-shortest）\n\n## 性能指标\n- 响应时间：<100ms（节点数<10000）\n- 支持节点数：<100000\n- 支持边数：<500000\n- 内存占用：<1GB\n\n## 使用示例\n```\n输入：\n{\n  graph: {nodes: ['A', 'B', 'C'], edges: [{from: 'A', to: 'B', weight: 5}, ...]},\n  start: 'A',\n  end: 'C',\n  algorithm: 'dijkstra'\n}\n\n输出：\n{\n  path: ['A', 'B', 'C'],\n  distance: 12,\n  visited_nodes: 3,\n  execution_time: 5\n}\n```\n\n## 故障处理\n- E1301: 起点或终点不存在\n- E1302: 图中无路径连接起点和终点\n- E1303: 图中存在负权环\n- E1304: 图数据格式错误\n\n## 版本历史\n- v1.1.0 (2024-02): 新增A*算法支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装networkx、numpy\n- 建议内存配置：>=2GB\n- 图数据：节点和边应正确定义", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_shortest_path - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 线性规划求解\n\n## 技能概述\n线性规划求解技能用于解决锂电池制造中的资源优化、生产计划、成本最小化等线性优化问题。支持单纯形法、内点法等求解算法，可处理大规模线性规划问题，提供最优解、影子价格、灵敏度分析等完整信息。\n\n## 输入规范\n- `objective`: 目标函数定义（系数字典）\n- `constraints`: 约束条件数组\n- `bounds`: 变量边界定义\n- `method`: 求解方法，可选'simplex'、'interior_point'\n- `sense`: 优化方向，'minimize'或'maximize'\n\n## 输出规范\n- `optimal_value`: 最优目标函数值\n- `solution`: 最优解变量值\n- `status`: 求解状态\n- `shadow_prices`: 约束的影子价格\n- `slack_variables`: 松弛变量值\n\n## 性能指标\n- 求解时间：<800ms（变量数<10000）\n- 支持变量数：<100000\n- 支持约束数：<100000\n- 求解精度：1e-9\n\n## 使用示例\n```\n输入：\n{\n  objective: {x: 3, y: 2},\n  constraints: [{lhs: {x: 1, y: 1}, op: '<=', rhs: 10}],\n  sense: 'maximize'\n}\n\n输出：\n{\n  optimal_value: 30,\n  solution: {x: 10, y: 0},\n  status: 'optimal',\n  shadow_prices: [3]\n}\n```\n\n## 故障处理\n- E1401: 问题无可行解\n- E1402: 问题无界\n- E1403: 数值不稳定，尝试缩放系数\n- E1404: 求解器内存不足\n\n## 版本历史\n- v1.1.0 (2024-02): 新增内点法支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scipy、pulp、numpy\n- 建议内存配置：>=4GB\n- 问题建模：目标函数和约束应为线性", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_linear_programming - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 混合整数规划求解\n\n## 技能概述\n混合整数规划（MIP）求解技能用于解决锂电池制造中的离散决策问题，如设备启停决策、产线分配、人员排班等。支持分支定界、割平面等算法，可处理包含整数变量和连续变量的优化问题。\n\n## 输入规范\n- `objective`: 目标函数定义\n- `constraints`: 约束条件数组\n- `integer_vars`: 整数变量名列表\n- `binary_vars`: 二元变量名列表\n- `time_limit`: 求解时间限制（秒）\n\n## 输出规范\n- `optimal_value`: 最优目标函数值\n- `solution`: 最优解\n- `status`: 求解状态\n- `gap`: 最优间隙（%）\n- `solve_time`: 实际求解时间\n\n## 性能指标\n- 求解时间：<2000ms（小规模问题）\n- 支持整数变量：<10000个\n- 最优间隙：<1%（提前终止时）\n- 求解精度：1e-6\n\n## 使用示例\n```\n输入：\n{\n  objective: {x: 5, y: 3},\n  constraints: [{lhs: {x: 2, y: 1}, op: '<=', rhs: 10}],\n  integer_vars: ['x'],\n  time_limit: 60\n}\n\n输出：\n{\n  optimal_value: 25,\n  solution: {x: 5, y: 0},\n  status: 'optimal',\n  gap: 0,\n  solve_time: 0.5\n}\n```\n\n## 故障处理\n- E1501: 问题无可行解\n- E1502: 求解超时，返回当前最优解\n- E1503: 整数变量过多，求解困难\n- E1504: 内存不足，尝试减小问题规模\n\n## 版本历史\n- v1.1.0 (2024-02): 新增割平面加速\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pulp、cbc、gurobi（可选）\n- 建议内存配置：>=4GB\n- 前置条件：atom_linear_programming", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_mixed_integer_programming - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 多目标优化\n\n## 技能概述\n多目标优化技能用于解决锂电池制造中需要同时优化多个冲突目标的决策问题，如成本vs质量、交付vs库存、产能vs能耗等。支持NSGA-II、MOEA/D等进化算法，生成Pareto前沿解集供决策者选择。\n\n## 输入规范\n- `objectives`: 目标函数数组\n- `constraints`: 约束条件\n- `weights`: 目标权重（加权和方法）\n- `method`: 算法类型，可选'nsga2'、'moead'、'weighted_sum'\n- `population_size`: 种群大小\n- `generations`: 进化代数\n\n## 输出规范\n- `pareto_front`: Pareto前沿解集\n- `solutions`: 所有非支配解\n- `selected_solution`: 根据权重选择的推荐解\n- `convergence_metrics`: 收敛性指标\n- `diversity_metrics`: 多样性指标\n\n## 性能指标\n- 求解时间：<3000ms\n- Pareto解数量：50-200个\n- 收敛性：HV指标 > 0.8\n- 支持目标数：2-5个\n\n## 使用示例\n```\n输入：\n{\n  objectives: [{name: 'cost', sense: 'min'}, {name: 'time', sense: 'min'}],\n  constraints: [{type: 'ineq', expr: 'x + y <= 10'}],\n  method: 'nsga2',\n  population_size: 100\n}\n\n输出：\n{\n  pareto_front: [{cost: 100, time: 50}, {cost: 80, time: 60}, ...],\n  selected_solution: {cost: 90, time: 55},\n  convergence_metrics: {hv: 0.85}\n}\n```\n\n## 故障处理\n- E1601: 目标函数冲突严重\n- E1602: 种群过早收敛，尝试增大种群\n- E1603: 求解超时\n- E1604: Pareto前沿不连续\n\n## 版本历史\n- v1.1.0 (2024-02): 新增MOEA/D算法\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pymoo、numpy、scipy\n- 建议内存配置：>=4GB\n- 计算资源：建议使用多核CPU", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_multi_objective_optimization - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 库存模型计算\n\n## 技能概述\n库存模型计算技能用于优化锂电池制造企业的库存策略，包括原材料、在制品、成品库存。支持EOQ经济订货批量、报童模型、安全库存计算等多种经典库存模型，帮助企业平衡库存成本和服务水平。\n\n## 输入规范\n- `demand_params`: 需求参数（均值、标准差、分布类型）\n- `cost_params`: 成本参数（订货成本、持有成本、缺货成本）\n- `lead_time`: 提前期\n- `service_level`: 服务水平目标（0-1）\n- `model_type`: 模型类型，可选'eoq'、'newsvendor'、'base_stock'\n\n## 输出规范\n- `reorder_point`: 再订货点\n- `order_quantity`: 订货批量\n- `safety_stock`: 安全库存量\n- `total_cost`: 总库存成本\n- `cycle_service_level`: 周期服务水平\n\n## 性能指标\n- 计算时间：<300ms\n- 成本节约：10-30%\n- 服务水平达成率：>95%\n- 支持SKU数：<10000\n\n## 使用示例\n```\n输入：\n{\n  demand_params: {mean: 100, std: 20, type: 'normal'},\n  cost_params: {order_cost: 100, holding_cost: 5, shortage_cost: 50},\n  lead_time: 7,\n  service_level: 0.95\n}\n\n输出：\n{\n  reorder_point: 850,\n  order_quantity: 200,\n  safety_stock: 150,\n  total_cost: 12500,\n  cycle_service_level: 0.96\n}\n```\n\n## 故障处理\n- E1701: 需求参数无效\n- E1702: 成本参数为负\n- E1703: 服务水平超出范围（0-1）\n- E1704: 提前期为负\n\n## 版本历史\n- v1.1.0 (2024-02): 新增多品种联合补货\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scipy、numpy\n- 建议内存配置：>=1GB\n- 数据要求：历史需求数据用于参数估计", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_inventory_model - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 网络流计算\n\n## 技能概述\n网络流计算技能用于解决锂电池制造供应链中的物流优化问题，如多工厂产能分配、物料配送路径优化、仓储网络设计等。支持最小费用流、最大流、运输问题等经典网络流模型。\n\n## 输入规范\n- `network`: 网络结构定义（节点、边、容量、成本）\n- `source`: 源节点\n- `sink`: 汇节点\n- `supplies`: 节点供应量\n- `demands`: 节点需求量\n- `problem_type`: 问题类型，可选'mcf'、'max_flow'、'transportation'\n\n## 输出规范\n- `flow`: 各边上的流量分配\n- `total_cost`: 总运输成本\n- `feasible`: 是否存在可行解\n- `bottleneck_edges`: 瓶颈边列表\n- `dual_variables`: 对偶变量（影子价格）\n\n## 性能指标\n- 求解时间：<600ms\n- 支持节点数：<10000\n- 支持边数：<50000\n- 求解精度：整数解\n\n## 使用示例\n```\n输入：\n{\n  network: {nodes: ['S', 'A', 'B', 'T'], edges: [...]},\n  source: 'S',\n  sink: 'T',\n  supplies: {S: 100},\n  demands: {T: 100},\n  problem_type: 'mcf'\n}\n\n输出：\n{\n  flow: {('S','A'): 60, ('S','B'): 40, ...},\n  total_cost: 1500,\n  feasible: true,\n  bottleneck_edges: []\n}\n```\n\n## 故障处理\n- E1801: 供需不平衡\n- E1802: 容量不足，无法满足需求\n- E1803: 网络中存在负权环\n- E1804: 源点或汇点不存在\n\n## 版本历史\n- v1.1.0 (2024-02): 新增多商品流支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装networkx、pulp、numpy\n- 建议内存配置：>=2GB\n- 网络数据：节点和边应正确定义", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_network_flow - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 约束表达\n\n## 技能概述\n约束表达技能用于定义和验证锂电池制造过程中的各类约束条件，如产能约束、工艺约束、资源约束等。支持约束满足问题（CSP）建模，可进行约束传播、一致性检查、可行解搜索。\n\n## 输入规范\n- `variables`: 变量定义数组\n- `domains`: 变量取值域\n- `constraints`: 约束条件数组（算术、逻辑、全局约束）\n- `propagation_level`: 传播强度\n\n## 输出规范\n- `feasible`: 是否存在可行解\n- `solutions`: 可行解列表（可选）\n- `constraint_violations`: 违反的约束列表\n- `propagated_domains`: 传播后的取值域\n- `search_tree`: 搜索树信息\n\n## 性能指标\n- 验证时间：<200ms\n- 支持变量数：<1000\n- 支持约束数：<5000\n- 传播效率：>90%\n\n## 使用示例\n```\n输入：\n{\n  variables: ['x', 'y'],\n  domains: {x: [1,2,3], y: [1,2,3]},\n  constraints: [{type: 'neq', vars: ['x', 'y']}]\n}\n\n输出：\n{\n  feasible: true,\n  solutions: [{x: 1, y: 2}, {x: 1, y: 3}, ...],\n  constraint_violations: [],\n  propagated_domains: {x: [1,2,3], y: [1,2,3]}\n}\n```\n\n## 故障处理\n- E1901: 变量域为空\n- E1902: 约束语法错误\n- E1903: 搜索空间过大\n- E1904: 约束冲突，无可行解\n\n## 版本历史\n- v1.1.0 (2024-02): 新增全局约束支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装python-constraint、ortools\n- 建议内存配置：>=2GB\n- 约束定义：应符合CSP规范", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_constraint_expression - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 蒙特卡洛仿真\\n\\n## 技能概述\\n蒙特卡洛仿真技能用于对锂电池制造过程中的不确定性进行量化分析，通过随机采样模拟各种可能情景。支持财务风险评估、项目进度风险分析、库存风险模拟等场景，提供概率分布、置信区间、风险价值等指标。\\n\\n## 输入规范\\n- `model`: 仿真模型函数或表达式\\n- `distributions`: 输入变量概率分布定义\\n- `n_samples`: 采样次数，默认10000\\n- `seed`: 随机种子，保证可重复性\\n- `confidence_level`: 置信水平，默认0.95\\n\\n## 输出规范\\n- `results`: 仿真结果数组\\n- `statistics`: 统计量（均值、标准差、分位数）\\n- `confidence_intervals`: 置信区间\\n- `histogram`: 结果分布直方图数据\\n- `convergence`: 收敛性分析\\n\\n## 性能指标\\n- 仿真时间：<1500ms（10000次采样）\\n- 支持并行：是\\n- 收敛性：<1%误差\\n- 支持分布类型：15+\\n\\n## 使用示例\\n```\\n输入：\\n{\\n  model: \"revenue - cost\",\n  distributions: {revenue: {type: 'normal', mu: 1000, sigma: 100}, cost: {type: 'uniform', low: 600, high: 800}},\n  n_samples: 10000\n}\n\n输出：\n{\n  results: [150, 200, 180, ...],\n  statistics: {mean: 250, std: 50},\n  confidence_intervals: {lower: 160, upper: 340},\n  histogram: {bins: [...], counts: [...]}\n}\n```\n\n## 故障处理\n- E2001: 分布参数无效\n- E2002: 采样次数过多，内存不足\n- E2003: 模型计算错误\n- E2004: 结果不收敛，增加采样次数\n\n## 版本历史\n- v1.1.0 (2024-02): 新增拉丁超立方采样\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装numpy、scipy\n- 建议内存配置：>=4GB\n- 并行计算：支持多核并行", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_monte_carlo_simulation - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 贝叶斯更新\n\n## 技能概述\n贝叶斯更新技能用于根据新观测数据更新锂电池制造过程中的概率信念，如设备故障概率更新、需求预测修正、质量参数估计等。支持共轭先验、MCMC采样、变分推断等方法。\n\n## 输入规范\n- `prior`: 先验分布定义\n- `likelihood`: 似然函数定义\n- `observations`: 观测数据数组\n- `method`: 推断方法，可选'conjugate'、'mcmc'、'vi'\n- `n_samples`: MCMC采样次数\n\n## 输出规范\n- `posterior`: 后验分布参数\n- `posterior_predictive`: 后验预测分布\n- `credibility_interval`: 可信区间\n- `bayes_factor`: 贝叶斯因子（模型比较）\n- `convergence_diagnostics`: 收敛诊断（MCMC）\n\n## 性能指标\n- 更新时间：<600ms\n- 后验采样：<2秒\n- 支持分布：共轭分布对\n- MCMC收敛：Rhat < 1.1\n\n## 使用示例\n```\n输入：\n{\n  prior: {type: 'beta', alpha: 2, beta: 3},\n  likelihood: {type: 'binomial'},\n  observations: [1, 0, 1, 1, 0]\n}\n\n输出：\n{\n  posterior: {type: 'beta', alpha: 5, beta: 5},\n  posterior_predictive: {mean: 0.5, std: 0.15},\n  credibility_interval: {lower: 0.25, upper: 0.75}\n}\n```\n\n## 故障处理\n- E2101: 先验与似然不匹配\n- E2102: MCMC未收敛\n- E2103: 观测数据与模型不符\n- E2104: 后验分布计算失败\n\n## 版本历史\n- v1.1.0 (2024-02): 新增变分推断支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pymc、numpy、scipy\n- 建议内存配置：>=4GB\n- 先验选择：应基于领域知识", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_bayesian_update - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 现金流折现计算\n\n## 技能概述\n现金流折现（DCF）计算技能用于评估锂电池制造投资项目的财务价值，如新产线投资、设备更新、技术改造项目。计算NPV、IRR、投资回收期、盈利指数等指标，支持投资决策分析。\n\n## 输入规范\n- `cash_flows`: 现金流数组（正负表示流入流出）\n- `discount_rate`: 折现率（WACC）\n- `initial_investment`: 初始投资额\n- `terminal_value`: 终值（可选）\n- `inflation_rate`: 通货膨胀率（可选）\n\n## 输出规范\n- `npv`: 净现值\n- `irr`: 内部收益率\n- `payback_period`: 投资回收期\n- `pi`: 盈利指数\n- `discounted_cash_flows`: 折现后现金流\n\n## 性能指标\n- 计算时间：<100ms\n- 精度：小数点后6位\n- 支持期限：<100年\n- 支持变现金流\n\n## 使用示例\n```\n输入：\n{\n  cash_flows: [100, 120, 150, 180, 200],\n  discount_rate: 0.1,\n  initial_investment: 500\n}\n\n输出：\n{\n  npv: 125.8,\n  irr: 0.156,\n  payback_period: 3.5,\n  pi: 1.25,\n  discounted_cash_flows: [90.9, 99.2, 112.7, 122.9, 124.2]\n}\n```\n\n## 故障处理\n- E2201: 折现率为负\n- E2202: IRR不存在或多解\n- E2203: 现金流全为同号\n- E2204: 投资回收期超过计算期限\n\n## 版本历史\n- v1.1.0 (2024-02): 新增敏感性分析\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装numpy、financial\n- 建议内存配置：>=512MB\n- 数据要求：现金流应基于可靠预测", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_dcf_calculation - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 成本结构分解\n\n## 技能概述\n成本结构分解技能用于分析锂电池制造企业的成本构成，区分固定成本和变动成本，识别成本驱动因素。支持制造成本、运营成本、资本成本的多维度分解，为成本控制和定价决策提供依据。\n\n## 输入规范\n- `total_cost`: 总成本\n- `cost_categories`: 成本类别定义数组\n- `allocation_rules`: 成本分摊规则\n- `cost_driver`: 成本动因（产量、工时等）\n- `time_period`: 时间期间\n\n## 输出规范\n- `cost_breakdown`: 成本分解明细\n- `fixed_costs`: 固定成本总额\n- `variable_costs`: 变动成本总额\n- `unit_cost`: 单位成本\n- `cost_driver_analysis`: 成本动因分析\n\n## 性能指标\n- 分解时间：<150ms\n- 分解精度：99.9%\n- 支持成本项：<1000项\n- 支持多级分解\n\n## 使用示例\n```\n输入：\n{\n  total_cost: 1000000,\n  cost_categories: [{name: 'material', type: 'variable'}, {name: 'depreciation', type: 'fixed'}],\n  cost_driver: {name: 'production_volume', value: 10000}\n}\n\n输出：\n{\n  cost_breakdown: {material: 600000, depreciation: 200000, labor: 200000},\n  fixed_costs: 300000,\n  variable_costs: 700000,\n  unit_cost: 100\n}\n```\n\n## 故障处理\n- E2301: 成本类别不完整\n- E2302: 分摊规则冲突\n- E2303: 成本动因为零\n- E2304: 分解结果不平衡\n\n## 版本历史\n- v1.1.0 (2024-02): 新增作业成本法支持\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pandas、numpy\n- 建议内存配置：>=1GB\n- 数据要求：成本数据应准确归集", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_cost_structure - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 参数敏感性分析\n\n## 技能概述\n参数敏感性分析技能用于评估锂电池制造模型输出对各输入参数的敏感程度，识别关键影响因素。支持龙卷风图、蜘蛛图、Sobol指数等方法，广泛应用于财务模型、仿真模型、预测模型的分析。\n\n## 输入规范\n- `base_case`: 基准情景参数值\n- `parameters`: 待分析参数列表\n- `variation_range`: 变化范围（±百分比）\n- `model`: 分析模型函数\n- `method`: 分析方法，可选'tornado'、'spider'、'sobol'\n\n## 输出规范\n- `sensitivity_scores`: 敏感性得分\n- `tornado_data`: 龙卷风图数据\n- `spider_data`: 蜘蛛图数据\n- `critical_params`: 关键参数列表\n- `sobol_indices`: Sobol指数（全局敏感性）\n\n## 性能指标\n- 分析时间：<800ms\n- 支持参数：<50个\n- 精度：<1%\n- 支持方法：3种\n\n## 使用示例\n```\n输入：\n{\n  base_case: {price: 100, cost: 60, volume: 1000},\n  parameters: ['price', 'cost', 'volume'],\n  variation_range: 0.2,\n  method: 'tornado'\n}\n\n输出：\n{\n  sensitivity_scores: {price: 0.5, volume: 0.3, cost: 0.2},\n  tornado_data: [{param: 'price', low: -50, high: 50}, ...],\n  critical_params: ['price', 'volume']\n}\n```\n\n## 故障处理\n- E2401: 参数不在基准情景中\n- E2402: 模型计算失败\n- E2403: 变化范围过大\n- E2404: Sobol采样不足\n\n## 版本历史\n- v1.1.0 (2024-02): 新增Sobol全局敏感性分析\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装SALib、numpy、matplotlib\n- 建议内存配置：>=2GB\n- 模型要求：输入输出关系明确", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_sensitivity_analysis - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 负荷模拟\n\n## 技能概述\n负荷模拟技能用于模拟锂电池制造系统在不同负荷情景下的产能表现，识别瓶颈时段和过载风险。支持离散事件仿真，可模拟设备利用率、队列长度、等待时间等关键指标。\n\n## 输入规范\n- `capacity_limits`: 产能限制定义\n- `demand_scenarios`: 需求情景数组\n- `time_periods`: 模拟时间段\n- `resource_config`: 资源配置\n- `simulation_duration`: 模拟时长\n\n## 输出规范\n- `load_distribution`: 负荷分布\n- `bottleneck_periods`: 瓶颈时段\n- `utilization_forecast`: 利用率预测\n- `overload_risk`: 过载风险概率\n- `queue_statistics`: 队列统计\n\n## 性能指标\n- 模拟时间：<700ms\n- 支持时段：<1000个\n- 精度：<5%误差\n- 支持并行：是\n\n## 使用示例\n```\n输入：\n{\n  capacity_limits: {line1: 100, line2: 150},\n  demand_scenarios: [{name: 'peak', demand: 300}, {name: 'normal', demand: 200}],\n  time_periods: ['week1', 'week2', 'week3']\n}\n\n输出：\n{\n  load_distribution: [0.8, 0.9, 1.1],\n  bottleneck_periods: ['week3'],\n  utilization_forecast: [0.85, 0.92, 1.05],\n  overload_risk: 0.3\n}\n```\n\n## 故障处理\n- E2501: 需求超过最大产能\n- E2502: 资源配置不合理\n- E2503: 模拟时间过长\n- E2504: 随机种子不一致\n\n## 版本历史\n- v1.1.0 (2024-02): 新增多资源协调模拟\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装simpy、numpy\n- 建议内存配置：>=2GB\n- 数据要求：产能和需求数据应准确", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_load_simulation - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 约束规划求解\n\n## 技能概述\n约束规划（CP）求解技能用于解决锂电池制造中的复杂组合优化问题，如生产排程、人员排班、设备分配等。支持CP-SAT求解器，可处理大规模约束满足问题，寻找可行解或最优解。\n\n## 输入规范\n- `variables`: 决策变量定义\n- `domains`: 变量取值域\n- `constraints`: 约束条件数组\n- `objective`: 优化目标（可选）\n- `search_strategy`: 搜索策略\n\n## 输出规范\n- `solution`: 可行解或最优解\n- `objective_value`: 目标函数值\n- `solve_time`: 求解时间\n- `status`: 求解状态\n- `search_tree_size`: 搜索树规模\n\n## 性能指标\n- 求解时间：<1000ms\n- 支持变量：<100000个\n- 支持约束：<100000个\n- 找到可行解率：>95%\n\n## 使用示例\n```\n输入：\n{\n  variables: ['x', 'y'],\n  domains: {x: range(10), y: range(10)},\n  constraints: [{type: 'linear', expr: 'x + y <= 15'}],\n  objective: {type: 'maximize', expr: 'x + 2*y'}\n}\n\n输出：\n{\n  solution: {x: 0, y: 10},\n  objective_value: 20,\n  solve_time: 0.1,\n  status: 'optimal'\n}\n```\n\n## 故障处理\n- E2601: 无可行解\n- E2602: 求解超时\n- E2603: 内存不足\n- E2604: 约束表达错误\n\n## 版本历史\n- v1.1.0 (2024-02): 新增CP-SAT求解器\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装ortools、python-constraint\n- 建议内存配置：>=4GB\n- 问题建模：应符合CP规范", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_constraint_programming - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 因果图推理\n\n## 技能概述\n因果图推理技能用于分析锂电池制造过程中变量间的因果关系，支持干预效果估计和反事实分析。基于有向无环图（DAG）和do-calculus，可应用于根因分析、工艺优化决策、政策效果评估等场景。\n\n## 输入规范\n- `causal_graph`: 因果图结构（DAG）\n- `interventions`: 干预变量和值\n- `observations`: 观测数据\n- `target`: 目标变量\n- `method`: 推断方法，可选'backdoor'、'frontdoor'、'iv'\n\n## 输出规范\n- `causal_effects`: 因果效应估计\n- `counterfactuals`: 反事实结果\n- `confounders`: 混淆变量列表\n- `recommendations`: 干预建议\n- `causal_strength`: 因果强度\n\n## 性能指标\n- 推理时间：<1200ms\n- 支持节点：<100个\n- 支持边：<500条\n- 效应估计精度：<10%误差\n\n## 使用示例\n```\n输入：\n{\n  causal_graph: {nodes: ['temperature', 'defect_rate'], edges: [['temperature', 'defect_rate']]},\n  interventions: [{variable: 'temperature', value: 25}],\n  observations: {temperature: 30, defect_rate: 0.05},\n  target: 'defect_rate'\n}\n\n输出：\n{\n  causal_effects: {temperature_on_defect_rate: -0.01},\n  counterfactuals: {defect_rate_if_temp_25: 0.04},\n  confounders: [],\n  recommendations: ['降低温度可减少缺陷率']\n}\n```\n\n## 故障处理\n- E2701: 因果图存在环\n- E2702: 无法识别因果效应\n- E2703: 数据不足\n- E2704: 混淆变量未控制\n\n## 版本历史\n- v1.1.0 (2024-02): 新增反事实推理\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装dowhy、causalml、networkx\n- 建议内存配置：>=4GB\n- 因果图：应基于领域知识构建", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_causal_graph - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 图路径搜索\n\n## 技能概述\n图路径搜索技能用于在锂电池制造的复杂关系网络中寻找可行路径，如物料BOM展开、工艺路线规划、依赖关系分析等。支持BFS、DFS、A*、双向搜索等算法，可处理带约束的路径搜索问题。\n\n## 输入规范\n- `graph`: 图结构定义\n- `start`: 起始节点\n- `goal`: 目标节点\n- `algorithm`: 搜索算法\n- `constraints`: 路径约束条件\n\n## 输出规范\n- `path`: 找到的路径\n- `path_length`: 路径长度\n- `alternatives`: 备选路径\n- `visited`: 访问节点数\n- `search_time`: 搜索时间\n\n## 性能指标\n- 搜索时间：<300ms\n- 支持节点：<100000个\n- 支持边：<500000条\n- 路径质量：最优或近似最优\n\n## 使用示例\n```\n输入：\n{\n  graph: {nodes: ['A', 'B', 'C', 'D'], edges: [['A','B'], ['B','C'], ['A','D'], ['D','C']]},\n  start: 'A',\n  goal: 'C',\n  algorithm: 'bfs'\n}\n\n输出：\n{\n  path: ['A', 'B', 'C'],\n  path_length: 2,\n  alternatives: [['A', 'D', 'C']],\n  visited: 4,\n  search_time: 10\n}\n```\n\n## 故障处理\n- E2801: 起点或终点不存在\n- E2802: 无可行路径\n- E2803: 约束过于严格\n- E2804: 图数据格式错误\n\n## 版本历史\n- v1.1.0 (2024-02): 新增双向搜索\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装networkx、numpy\n- 建议内存配置：>=2GB\n- 图数据：应正确构建邻接关系", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_graph_path_search - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 特征选择算法\n\n## 技能概述\n特征选择技能用于从锂电池制造的大量候选特征中选择最相关的特征子集，提高模型性能、减少过拟合、降低计算成本。支持过滤法、包装法、嵌入法三大类方法，包括RFE、Lasso、互信息等具体算法。\n\n## 输入规范\n- `features`: 特征矩阵\n- `target`: 目标变量\n- `method`: 选择方法，可选'filter'、'wrapper'、'embedded'\n- `n_features`: 选择特征数\n- `scoring`: 评分指标\n\n## 输出规范\n- `selected_features`: 选中特征索引\n- `feature_scores`: 特征重要性得分\n- `ranking`: 特征排名\n- `support`: 选择掩码\n- `cv_scores`: 交叉验证得分\n\n## 性能指标\n- 选择时间：<500ms\n- 支持特征：<10000个\n- 支持样本：<100000个\n- 降维效果：保留>90%信息\n\n## 使用示例\n```\n输入：\n{\n  features: [[1,2,3], [2,3,4], [3,4,5]],\n  target: [1, 0, 1],\n  method: 'rfe',\n  n_features: 2\n}\n\n输出：\n{\n  selected_features: [0, 2],\n  feature_scores: [0.8, 0.3, 0.9],\n  ranking: [1, 3, 2],\n  support: [true, false, true]\n}\n```\n\n## 故障处理\n- E2901: 特征数少于选择数\n- E2902: 方法不支持数据类型\n- E2903: 所有特征得分相同\n- E2904: 内存不足\n\n## 版本历史\n- v1.1.0 (2024-02): 新增mRMR算法\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scikit-learn、skfeature\n- 建议内存配置：>=4GB\n- 数据预处理：建议先处理缺失值", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_feature_selection - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 趋势分解算法\n\n## 技能概述\n趋势分解技能用于将锂电池制造过程中的时间序列分解为趋势、季节性和残差成分，帮助理解数据背后的驱动因素。支持STL、X-11、SEATS等经典分解方法，可应用于需求预测、设备监控、质量分析等场景。\n\n## 输入规范\n- `time_series`: 时间序列数据\n- `period`: 季节周期长度\n- `model`: 分解模型，可选'additive'、'multiplicative'\n- `robust`: 是否使用鲁棒分解\n- `seasonal_deg`: 季节性平滑度\n\n## 输出规范\n- `trend`: 趋势成分\n- `seasonal`: 季节性成分\n- `residual`: 残差成分\n- `components`: 各成分统计信息\n- `seasonal_strength`: 季节性强弱\n\n## 性能指标\n- 分解时间：<400ms\n- 支持长度：<100000点\n- 周期支持：任意整数周期\n- 残差白噪声检验通过率：>90%\n\n## 使用示例\n```\n输入：\n{\n  time_series: [120, 130, 125, 140, 135, 145],\n  period: 3,\n  model: 'additive'\n}\n\n输出：\n{\n  trend: [122, 128, 132, 136, 140, 144],\n  seasonal: [-2, 2, -2, -2, 2, -2],\n  residual: [0, 0, -5, 6, -7, 3],\n  seasonal_strength: 0.6\n}\n```\n\n## 故障处理\n- E3001: 序列长度不足\n- E3002: 周期设置不当\n- E3003: 分解不收敛\n- E3004: 残差非白噪声\n\n## 版本历史\n- v1.1.0 (2024-02): 新增X-11分解\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装statsmodels、scipy\n- 建议内存配置：>=2GB\n- 数据要求：序列长度至少为2个周期", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_trend_decomposition - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 概率评分模型\n\n## 技能概述\n概率评分技能用于基于概率模型对锂电池制造中的风险事件进行量化评分，如供应商风险评分、设备故障风险评分、质量风险评分等。支持逻辑回归、朴素贝叶斯、概率神经网络等方法，输出0-100的标准化风险分数。\n\n## 输入规范\n- `features`: 特征向量\n- `model_weights`: 模型权重参数\n- `thresholds`: 风险等级阈值\n- `calibration`: 是否进行概率校准\n\n## 输出规范\n- `score`: 风险评分（0-100）\n- `probability`: 概率值（0-1）\n- `risk_level`: 风险等级（低/中/高/极高）\n- `factors`: 风险因子贡献度\n- `confidence`: 评分置信度\n\n## 性能指标\n- 评分时间：<100ms\n- 准确率：AUC > 0.85\n- 校准度：Brier score < 0.1\n- 支持特征：<100个\n\n## 使用示例\n```\n输入：\n{\n  features: {delivery_delay: 2, quality_issue: 1, financial_score: 80},\n  model_weights: {delivery_delay: 0.4, quality_issue: 0.3, financial_score: -0.3},\n  thresholds: {low: 30, medium: 60, high: 80}\n}\n\n输出：\n{\n  score: 65,\n  probability: 0.65,\n  risk_level: 'high',\n  factors: [{name: 'delivery_delay', contribution: 0.4}],\n  confidence: 0.85\n}\n```\n\n## 故障处理\n- E3101: 特征缺失\n- E3102: 概率校准失败\n- E3103: 阈值设置不合理\n- E3104: 模型权重不匹配\n\n## 版本历史\n- v1.1.0 (2024-02): 新增概率校准\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scikit-learn、scipy\n- 建议内存配置：>=1GB\n- 模型训练：权重应基于历史数据训练", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_probability_scoring - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 规则引擎执行\n\n## 技能概述\n规则引擎执行技能用于基于预定义规则对锂电池制造业务逻辑进行自动化决策，如质量判定、工艺参数调整、告警升级等。支持前向链、后向链推理，可处理复杂的多条件规则集，实现业务规则的灵活配置和快速响应。\n\n## 输入规范\n- `facts`: 事实数据对象\n- `rules`: 规则定义数组\n- `agenda`: 议程控制策略\n- `inference_mode`: 推理模式，可选'forward'、'backward'\n- `max_iterations`: 最大迭代次数\n\n## 输出规范\n- `fired_rules`: 触发的规则列表\n- `actions`: 执行的动作列表\n- `output_facts`: 输出事实\n- `execution_trace`: 执行轨迹\n- `inference_steps`: 推理步数\n\n## 性能指标\n- 执行时间：<50ms\n- 支持规则：<10000条\n- 触发准确率：100%\n- 并发处理：1000次/秒\n\n## 使用示例\n```\n输入：\n{\n  facts: {temperature: 85, pressure: 120},\n  rules: [{if: 'temperature > 80', then: 'alert = true'}],\n  inference_mode: 'forward'\n}\n\n输出：\n{\n  fired_rules: ['rule_1'],\n  actions: ['send_alert'],\n  output_facts: {temperature: 85, pressure: 120, alert: true},\n  execution_trace: [...]\n}\n```\n\n## 故障处理\n- E3201: 规则语法错误\n- E3202: 规则冲突\n- E3203: 推理循环\n- E3204: 超过最大迭代次数\n\n## 版本历史\n- v1.1.0 (2024-02): 新增规则优先级\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装durable-rules、pyknow\n- 建议内存配置：>=1GB\n- 规则定义：应符合规则引擎语法", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_rule_engine - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《设备维护保养手册》", "《设备故障诊断指南》", "《设备点检标准》"],
      assets: ["templates/maintenance_record_template.xlsx", "config/equipment_specifications.json", "models/digital_twin_config.json"] }
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
    files: { readme: "# 瓶颈识别算法\n\n## 技能概述\n瓶颈识别技能用于识别锂电池制造系统中的瓶颈资源和约束环节，基于约束理论（TOC）和产能分析。支持静态瓶颈识别和动态瓶颈漂移分析，帮助优化生产排程、提升系统产出。\n\n## 输入规范\n- `process_data`: 工艺流程数据\n- `resource_utilization`: 资源利用率数据\n- `demand`: 需求数据\n- `time_period`: 分析时间段\n- `method`: 识别方法，可选'toc'、'utilization'、'wait_time'\n\n## 输出规范\n- `bottlenecks`: 瓶颈资源列表\n- `bottleneck_severity`: 瓶颈严重程度\n- `throughput_impact`: 对产出的影响\n- `recommendations`: 优化建议\n- `bottleneck_drift`: 瓶颈漂移分析\n\n## 性能指标\n- 识别时间：<500ms\n- 准确率：>85%\n- 支持资源：<1000个\n- 支持时段：<1000个\n\n## 使用示例\n```\n输入：\n{\n  process_data: {stations: ['A', 'B', 'C'], cycle_times: [10, 15, 12]},\n  resource_utilization: {A: 0.8, B: 0.95, C: 0.7},\n  demand: 100\n}\n\n输出：\n{\n  bottlenecks: ['B'],\n  bottleneck_severity: {B: 0.95},\n  throughput_impact: 0.2,\n  recommendations: ['增加B站产能', '减少B站换型时间']\n}\n```\n\n## 故障处理\n- E3301: 工艺数据不完整\n- E3302: 利用率数据缺失\n- E3303: 多瓶颈冲突\n- E3304: 瓶颈漂移过快\n\n## 版本历史\n- v1.1.0 (2024-02): 新增动态瓶颈分析\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pandas、numpy\n- 建议内存配置：>=2GB\n- 数据要求：工艺和利用率数据应准确", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_bottleneck_detection - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 优先级排序算法\n\n## 技能概述\n优先级排序技能用于对锂电池制造中的任务、订单、告警等进行多准则优先级排序。支持AHP层次分析法、TOPSIS、加权评分等方法，可综合考虑紧急程度、重要性、资源约束等因素。\n\n## 输入规范\n- `items`: 待排序项目数组\n- `criteria`: 评价准则数组\n- `weights`: 准则权重\n- `method`: 排序方法，可选'ahp'、'topsis'、'weighted'\n- `scoring_scale`: 评分标度\n\n## 输出规范\n- `ranked_items`: 排序后项目\n- `scores`: 各项目得分\n- `top_k`: 前K个项目\n- `ties`: 并列项目组\n- `sensitivity`: 权重敏感性分析\n\n## 性能指标\n- 排序时间：<150ms\n- 支持项目：<10000个\n- 支持准则：<20个\n- 一致性比率：<0.1\n\n## 使用示例\n```\n输入：\n{\n  items: [{id: 1, urgency: 5, importance: 4}, {id: 2, urgency: 3, importance: 5}],\n  criteria: ['urgency', 'importance'],\n  weights: {urgency: 0.6, importance: 0.4},\n  method: 'weighted'\n}\n\n输出：\n{\n  ranked_items: [1, 2],\n  scores: {1: 4.6, 2: 3.8},\n  top_k: [1],\n  ties: []\n}\n```\n\n## 故障处理\n- E3401: 权重和不为1\n- E3402: AHP一致性不达标\n- E3403: 准则值缺失\n- E3404: 评分超出范围\n\n## 版本历史\n- v1.1.0 (2024-02): 新增TOPSIS方法\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装numpy、ahpy\n- 建议内存配置：>=1GB\n- 权重设置：应基于专家判断", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_priority_sorting - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 随机库存模型计算\n\n## 技能概述\n随机库存模型技能用于在需求不确定条件下优化锂电池制造企业的库存策略。支持报童模型、基础库存模型、(s,S)策略等，考虑需求分布、提前期不确定性，计算最优库存参数。\n\n## 输入规范\n- `demand_distribution`: 需求概率分布\n- `cost_params`: 成本参数\n- `lead_time`: 提前期\n- `service_level`: 服务水平目标\n- `review_period`: 盘点周期（周期盘点）\n\n## 输出规范\n- `optimal_policy`: 最优库存策略\n- `expected_cost`: 期望总成本\n- `fill_rate`: 订单满足率\n- `stockout_prob`: 缺货概率\n- `safety_stock`: 安全库存\n\n## 性能指标\n- 计算时间：<600ms\n- 成本节约：15-25%\n- 服务水平达成：>95%\n- 支持分布类型：5+\n\n## 使用示例\n```\n输入：\n{\n  demand_distribution: {type: 'normal', mean: 100, std: 20},\n  cost_params: {holding: 5, shortage: 50, ordering: 100},\n  lead_time: 7,\n  service_level: 0.95\n}\n\n输出：\n{\n  optimal_policy: {type: '(s,S)', s: 850, S: 1050},\n  expected_cost: 15000,\n  fill_rate: 0.97,\n  stockout_prob: 0.03,\n  safety_stock: 150\n}\n```\n\n## 故障处理\n- E3501: 需求分布参数无效\n- E3502: 服务水平超出范围\n- E3503: 成本参数为负\n- E3504: 提前期分布不支持\n\n## 版本历史\n- v1.1.0 (2024-02): 新增(s,S)策略\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scipy、numpy\n- 建议内存配置：>=2GB\n- 前置条件：atom_inventory_model", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_stochastic_inventory - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 动态规划求解\\n\\n## 技能概述\\n动态规划技能用于解决锂电池制造中的多阶段决策优化问题，如生产批量决策、设备更新决策、库存路径优化等。通过状态分解和递推求解，处理具有最优子结构的问题。\\n\\n## 输入规范\\n- `stages`: 阶段定义数组\\n- `states`: 状态空间定义\\n- `decisions`: 决策集合\\n- `transition`: 状态转移函数\\n- `reward`: 收益/成本函数\\n\\n## 输出规范\\n- `optimal_policy`: 最优策略\\n- `optimal_value`: 最优值\\n- `value_function`: 值函数\\n- `policy_function`: 策略函数\\n- `computation_time`: 计算时间\\n\\n## 性能指标\\n- 求解时间：<1000ms\\n- 支持阶段：<100个\\n- 支持状态：<10000个\\n- 内存占用：<4GB\\n\\n## 使用示例\\n```\\n输入：\\n{\\n  stages: [1, 2, 3],\\n  states: {inventory: [0, 100, 200]},\\n  decisions: {order: [0, 50, 100]},\\n  transition: \"inventory + order - demand\",\n  reward: \"-holding_cost - order_cost\"\n}\n\n输出：\n{\n  optimal_policy: {1: {0: 100, 100: 50}, ...},\n  optimal_value: -500,\n  value_function: {...},\n  policy_function: {...}\n}\n```\n\n## 故障处理\n- E3601: 状态空间过大\n- E3602: 状态转移无效\n- E3603: 内存溢出\n- E3604: 无最优解\n\n## 版本历史\n- v1.1.0 (2024-02): 新增值迭代加速\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装numpy、numba\n- 建议内存配置：>=4GB\n- 问题建模：应具有最优子结构", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_dynamic_programming - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 资源冲突检测算法\n\n## 技能概述\n资源冲突检测技能用于识别锂电池制造排程中的资源分配冲突，如设备双重预订、人员时间重叠、物料短缺等。支持时间窗口冲突、容量冲突、互斥约束检测，提供冲突解决方案建议。\n\n## 输入规范\n- `resource_allocations`: 资源分配方案\n- `resource_capacity`: 资源容量定义\n- `time_windows`: 时间窗口定义\n- `conflict_types`: 冲突类型列表\n\n## 输出规范\n- `conflicts`: 冲突列表\n- `conflict_graph`: 冲突图\n- `resolution_suggestions`: 解决建议\n- `severity`: 冲突严重程度\n- `affected_tasks`: 受影响任务\n\n## 性能指标\n- 检测时间：<300ms\n- 支持任务：<10000个\n- 支持资源：<1000个\n- 检测准确率：100%\n\n## 使用示例\n```\n输入：\n{\n  resource_allocations: [{task: 1, resource: 'A', start: 0, end: 10}, {task: 2, resource: 'A', start: 5, end: 15}],\n  resource_capacity: {A: 1},\n  time_windows: {task1: [0, 20], task2: [0, 20]}\n}\n\n输出：\n{\n  conflicts: [{type: 'time', tasks: [1, 2], resource: 'A', overlap: [5, 10]}],\n  conflict_graph: {nodes: [1, 2], edges: [[1, 2]]},\n  resolution_suggestions: ['调整任务2开始时间为10'],\n  severity: 'high'\n}\n```\n\n## 故障处理\n- E3701: 资源容量未定义\n- E3702: 时间窗口无效\n- E3703: 分配数据缺失\n- E3704: 冲突过多难以解决\n\n## 版本历史\n- v1.1.0 (2024-02): 新增互斥约束检测\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装networkx、pandas\n- 建议内存配置：>=2GB\n- 数据要求：分配方案应完整", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_resource_conflict_detection - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 约束松弛算法\n\n## 技能概述\n约束松弛技能用于在锂电池制造优化问题无可行解时，通过松弛部分约束寻找近似解。支持拉格朗日松弛、惩罚函数法等方法，计算约束的对偶值，识别关键约束。\n\n## 输入规范\n- `original_problem`: 原问题定义\n- `relaxable_constraints`: 可松弛约束列表\n- `penalty_weights`: 惩罚权重\n- `relaxation_method`: 松弛方法\n- `tolerance`: 容差\n\n## 输出规范\n- `relaxed_solution`: 松弛后解\n- `dual_values`: 对偶值\n- `constraint_violations`: 约束违反量\n- `gap`: 与原问题最优值的间隙\n- `relaxed_objective`: 松弛后目标值\n\n## 性能指标\n- 松弛时间：<800ms\n- 对偶间隙：<5%\n- 支持约束：<10000个\n- 收敛精度：1e-6\n\n## 使用示例\n```\n输入：\n{\n  original_problem: {objective: 'min', constraints: ['x + y <= 5', 'x >= 6']},\n  relaxable_constraints: ['x >= 6'],\n  penalty_weights: {'x >= 6': 10},\n  relaxation_method: 'lagrangian'\n}\n\n输出：\n{\n  relaxed_solution: {x: 5.5, y: 0},\n  dual_values: {'x >= 6': 10},\n  constraint_violations: {'x >= 6': -0.5},\n  gap: 5,\n  relaxed_objective: 55\n}\n```\n\n## 故障处理\n- E3801: 无可松弛约束\n- E3802: 松弛后仍无可行解\n- E3803: 对偶值不收敛\n- E3804: 惩罚权重过大\n\n## 版本历史\n- v1.1.0 (2024-02): 新增惩罚函数法\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装cvxpy、scipy\n- 建议内存配置：>=4GB\n- 前置条件：atom_linear_programming", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_constraint_relaxation - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 路径影响传播算法\n\n## 技能概述\n路径影响传播技能用于在锂电池制造的依赖网络中传播变更影响，评估变更对上下游环节的影响范围和程度。支持BOM影响分析、工艺变更影响、计划变更影响等场景。\n\n## 输入规范\n- `dependency_graph`: 依赖关系图\n- `changed_nodes`: 变更节点列表\n- `impact_weights`: 影响权重\n- `propagation_depth`: 传播深度限制\n- `direction`: 传播方向，可选'forward'、'backward'、'both'\n\n## 输出规范\n- `affected_nodes`: 受影响节点\n- `impact_magnitudes`: 影响程度\n- `propagation_paths`: 传播路径\n- `critical_paths`: 关键影响路径\n- `impact_summary`: 影响汇总\n\n## 性能指标\n- 传播时间：<500ms\n- 支持节点：<100000个\n- 支持深度：<100层\n- 传播完整率：>95%\n\n## 使用示例\n```\n输入：\n{\n  dependency_graph: {A: ['B', 'C'], B: ['D'], C: ['D']},\n  changed_nodes: ['A'],\n  impact_weights: {A: 1.0, B: 0.8, C: 0.7},\n  propagation_depth: 3\n}\n\n输出：\n{\n  affected_nodes: ['B', 'C', 'D'],\n  impact_magnitudes: {B: 0.8, C: 0.7, D: 0.75},\n  propagation_paths: [['A', 'B', 'D'], ['A', 'C', 'D']],\n  critical_paths: [['A', 'B', 'D']]\n}\n```\n\n## 故障处理\n- E3901: 依赖图存在环\n- E3902: 变更节点不存在\n- E3903: 传播深度过大\n- E3904: 影响权重未定义\n\n## 版本历史\n- v1.1.0 (2024-02): 新增双向传播\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装networkx、numpy\n- 建议内存配置：>=2GB\n- 图数据：依赖关系应正确定义", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_path_impact_propagation - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 根因分析算法\n\n## 技能概述\n根因分析技能用于分析锂电池制造过程中问题的根本原因，支持鱼骨图分析、5 Whys、故障树分析等方法。结合因果推理，从表象问题追溯到深层原因，提供预防性改进建议。\n\n## 输入规范\n- `problem`: 问题描述\n- `causal_factors`: 可能原因列表\n- `historical_cases`: 历史案例\n- `method`: 分析方法，可选'fishbone'、'5whys'、'fta'\n- `evidence`: 证据数据\n\n## 输出规范\n- `root_causes`: 根本原因列表\n- `cause_tree`: 原因树\n- `confidence_scores`: 置信度\n- `preventive_actions`: 预防措施\n- `contribution_analysis`: 贡献度分析\n\n## 性能指标\n- 分析时间：<700ms\n- 准确率：>80%\n- 支持因素：<100个\n- 树深度：<10层\n\n## 使用示例\n```\n输入：\n{\n  problem: '涂布厚度不均匀',\n  causal_factors: ['浆料粘度', '模头间隙', '走带速度'],\n  method: 'fishbone',\n  evidence: {viscosity_variance: 0.1, gap_variance: 0.05}\n}\n\n输出：\n{\n  root_causes: ['浆料粘度波动'],\n  cause_tree: {problem: '厚度不均', causes: [{name: '浆料粘度', subcauses: [...]}]},\n  confidence_scores: {'浆料粘度波动': 0.85},\n  preventive_actions: ['增加粘度控制', '优化搅拌工艺']\n}\n```\n\n## 故障处理\n- E4001: 问题描述不清晰\n- E4002: 原因因素不足\n- E4003: 证据与原因不匹配\n- E4004: 分析深度不足\n\n## 版本历史\n- v1.1.0 (2024-02): 新增故障树分析\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pandas、networkx\n- 建议内存配置：>=2GB\n- 前置条件：atom_causal_graph", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_root_cause_analysis - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 事件优先级排序\n\n## 技能概述\n事件优先级排序技能用于对锂电池制造过程中的异常事件、告警、任务等进行紧急程度和重要性评估，确定处理优先级。支持基于SLA、影响范围、资源可用性的动态优先级计算，确保关键问题得到及时处理。\n\n## 输入规范\n- `events`: 事件列表\n- `urgency_weights`: 紧急度权重\n- `impact_matrix`: 影响矩阵\n- `resources`: 可用资源\n- `sla_targets`: SLA目标\n\n## 输出规范\n- `prioritized_events`: 优先级排序后的事件\n- `priority_scores`: 优先级分数\n- `sla_compliance`: SLA合规预测\n- `schedule`: 建议处理顺序\n- `resource_allocation`: 资源分配建议\n\n## 性能指标\n- 排序时间：<100ms\n- 支持事件：<10000个\n- SLA达成率：>95%\n- 响应及时率：>90%\n\n## 使用示例\n```\n输入：\n{\n  events: [{id: 1, type: '故障', severity: 'high'}, {id: 2, type: '告警', severity: 'medium'}],\n  urgency_weights: {high: 3, medium: 2, low: 1},\n  sla_targets: {故障: 4, 告警: 8}\n}\n\n输出：\n{\n  prioritized_events: [1, 2],\n  priority_scores: {1: 90, 2: 60},\n  sla_compliance: {1: true, 2: true},\n  schedule: [{event: 1, start: 0, end: 2}, {event: 2, start: 2, end: 4}]\n}\n```\n\n## 故障处理\n- E4101: 事件数据不完整\n- E4102: SLA目标冲突\n- E4103: 资源不足\n- E4104: 优先级计算错误\n\n## 版本历史\n- v1.1.0 (2024-02): 新增动态优先级调整\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pandas、numpy\n- 建议内存配置：>=1GB\n- 事件定义：应包含必要属性", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_event_priority - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 履约概率评估\n\n## 技能概述\n履约概率评估技能用于预测锂电池制造供应链中各参与方按时履约的可能性，如供应商交付、物流运输、生产完成等。基于历史履约数据和实时状态，计算履约概率分布，支持风险评估和应急预案制定。\n\n## 输入规范\n- `supplier_history`: 历史履约数据\n- `order_complexity`: 订单复杂度\n- `external_factors`: 外部因素\n- `lead_time`: 承诺提前期\n- `current_status`: 当前状态\n\n## 输出规范\n- `on_time_prob`: 按时履约概率\n- `delay_risk`: 延迟风险\n- `expected_delay`: 预期延迟时间\n- `mitigation_options`: 缓解方案\n- `confidence_interval`: 置信区间\n\n## 性能指标\n- 评估时间：<300ms\n- 准确率：>85%\n- 支持供应商：<1000家\n- 预测 horizon：<90天\n\n## 使用示例\n```\n输入：\n{\n  supplier_history: {on_time_rate: 0.9, avg_delay: 2},\n  order_complexity: {sku_count: 5, qty: 1000},\n  lead_time: 14,\n  current_status: '生产中'\n}\n\n输出：\n{\n  on_time_prob: 0.85,\n  delay_risk: 0.15,\n  expected_delay: 1.5,\n  mitigation_options: ['提前催货', '启用备用供应商'],\n  confidence_interval: [0.75, 0.92]\n}\n```\n\n## 故障处理\n- E4201: 历史数据不足\n- E4202: 订单信息不完整\n- E4203: 外部因素数据缺失\n- E4204: 概率计算异常\n\n## 版本历史\n- v1.1.0 (2024-02): 新增实时状态更新\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装scipy、scikit-learn\n- 建议内存配置：>=2GB\n- 前置条件：atom_probability_distribution_fit", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_performance_probability - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 风险评分模型\n\n## 技能概述\n风险评分技能用于对锂电池制造供应链中的各类风险进行量化评估，如供应商风险、质量风险、交付风险等。基于多维度风险因子，计算综合风险分数和风险等级，支持风险矩阵可视化。\n\n## 输入规范\n- `risk_factors`: 风险因子数据\n- `weights`: 风险权重\n- `historical_data`: 历史风险事件\n- `industry_benchmarks`: 行业基准\n- `scoring_model`: 评分模型\n\n## 输出规范\n- `risk_score`: 风险评分（0-100）\n- `risk_rating`: 风险等级\n- `risk_breakdown`: 风险分解\n- `mitigation_priority`: 缓解优先级\n- `trend`: 风险趋势\n\n## 性能指标\n- 评分时间：<250ms\n- 准确率：>88%\n- 支持因子：<50个\n- 预警提前期：>7天\n\n## 使用示例\n```\n输入：\n{\n  risk_factors: {financial: 70, delivery: 60, quality: 80},\n  weights: {financial: 0.3, delivery: 0.4, quality: 0.3},\n  historical_data: [{event: '延迟', impact: 10000}],\n  industry_benchmarks: {avg_score: 65}\n}\n\n输出：\n{\n  risk_score: 68,\n  risk_rating: 'medium',\n  risk_breakdown: {financial: 21, delivery: 24, quality: 24},\n  mitigation_priority: ['quality', 'delivery'],\n  trend: 'stable'\n}\n```\n\n## 故障处理\n- E4301: 风险因子缺失\n- E4302: 权重和不为1\n- E4303: 历史数据不足\n- E4304: 基准数据无效\n\n## 版本历史\n- v1.1.0 (2024-02): 新增风险趋势分析\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pandas、numpy\n- 建议内存配置：>=2GB\n- 数据要求：风险因子应标准化", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_risk_scoring - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 备选路径搜索\n\n## 技能概述\n备选路径搜索技能用于在锂电池制造供应链中寻找替代供应路径和备用方案，当主路径中断时快速切换。支持多准则路径评估，考虑成本、时间、风险等因素，提供最优替代方案。\n\n## 输入规范\n- `supply_network`: 供应网络\n- `disrupted_paths`: 中断路径\n- `constraints`: 约束条件\n- `criteria`: 评估准则\n- `k`: 备选方案数量\n\n## 输出规范\n- `alternative_paths`: 备选路径列表\n- `path_scores`: 路径评分\n- `feasibility`: 可行性评估\n- `switching_costs`: 切换成本\n- `risk_assessment`: 风险评估\n\n## 性能指标\n- 搜索时间：<500ms\n- 路径质量：前3名包含最优解概率>90%\n- 支持节点：<10000个\n- 支持k值：<20\n\n## 使用示例\n```\n输入：\n{\n  supply_network: {nodes: ['A', 'B', 'C'], edges: [{from: 'A', to: 'B'}, {from: 'A', to: 'C'}]},\n  disrupted_paths: [['A', 'B']],\n  constraints: {max_cost: 1000, max_time: 5},\n  criteria: ['cost', 'time'],\n  k: 3\n}\n\n输出：\n{\n  alternative_paths: [['A', 'C', 'B']],\n  path_scores: {0: 85},\n  feasibility: {0: true},\n  switching_costs: [200],\n  risk_assessment: {0: 'low'}\n}\n```\n\n## 故障处理\n- E4401: 供应网络不完整\n- E4402: 无可行备选路径\n- E4403: 约束过于严格\n- E4404: 中断路径不存在\n\n## 版本历史\n- v1.1.0 (2024-02): 新增多准则评估\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装networkx、numpy\n- 建议内存配置：>=2GB\n- 前置条件：atom_shortest_path", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_alternative_path - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 情景生成算法\n\n## 技能概述\n情景生成技能用于生成锂电池制造what-if分析的多样化假设情景，覆盖乐观、悲观、基准等多种情况。支持正交设计、蒙特卡洛采样、拉丁超立方等方法，确保情景空间的充分探索。\n\n## 输入规范\n- `variable_ranges`: 变量范围定义\n- `constraints`: 约束条件\n- `n_scenarios`: 生成情景数\n- `diversity_metric`: 多样性度量\n- `method`: 生成方法\n\n## 输出规范\n- `scenarios`: 情景列表\n- `scenario_matrix`: 情景矩阵\n- `coverage_score`: 覆盖度评分\n- `extreme_cases`: 极端情景\n- `scenario_clusters`: 情景聚类\n\n## 性能指标\n- 生成时间：<600ms\n- 覆盖度：>90%\n- 支持变量：<100个\n- 支持情景：<10000个\n\n## 使用示例\n```\n输入：\n{\n  variable_ranges: {demand: [800, 1200], price: [90, 110]},\n  constraints: ['demand * price >= 80000'],\n  n_scenarios: 10,\n  method: 'lhs'\n}\n\n输出：\n{\n  scenarios: [{demand: 850, price: 95}, ...],\n  scenario_matrix: [[850, 95], ...],\n  coverage_score: 0.92,\n  extreme_cases: [{demand: 800, price: 90}, {demand: 1200, price: 110}]\n}\n```\n\n## 故障处理\n- E4501: 变量范围无效\n- E4502: 约束不可满足\n- E4503: 情景数过多\n- E4504: 覆盖度不足\n\n## 版本历史\n- v1.1.0 (2024-02): 新增情景聚类\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pyDOE、numpy\n- 建议内存配置：>=2GB\n- 变量定义：范围应合理", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_scenario_generation - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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
    files: { readme: "# 指标异常检测\n\n## 技能概述\n指标异常检测技能用于监控锂电池制造企业的关键绩效指标（KPI），自动识别指标异常变化。支持多维指标、季节性调整、基线对比，可应用于生产效率、质量指标、成本指标等的监控。\n\n## 输入规范\n- `metrics`: 当前指标值\n- `baselines`: 基线值\n- `thresholds`: 阈值定义\n- `seasonality`: 是否考虑季节性\n- `comparison_period`: 对比周期\n\n## 输出规范\n- `anomalies`: 异常指标列表\n- `anomaly_scores`: 异常分数\n- `trend_changes`: 趋势变化\n- `alerts`: 告警信息\n- `recommendations`: 改进建议\n\n## 性能指标\n- 检测时间：<300ms\n- 准确率：>89%\n- 支持指标：<1000个\n- 误报率：<5%\n\n## 使用示例\n```\n输入：\n{\n  metrics: {oee: 0.75, yield_rate: 0.92, cost_per_unit: 120},\n  baselines: {oee: 0.85, yield_rate: 0.95, cost_per_unit: 110},\n  thresholds: {oee: 0.1, yield_rate: 0.05, cost_per_unit: 15},\n  seasonality: true\n}\n\n输出：\n{\n  anomalies: ['oee', 'cost_per_unit'],\n  anomaly_scores: {oee: 0.85, cost_per_unit: 0.75},\n  trend_changes: [{metric: 'oee', direction: 'down'}],\n  alerts: [{level: 'warning', metric: 'oee'}]\n}\n```\n\n## 故障处理\n- E4601: 基线数据缺失\n- E4602: 阈值设置不当\n- E4603: 季节性模式未识别\n- E4604: 指标维度不匹配\n\n## 版本历史\n- v1.1.0 (2024-02): 新增多维异常检测\n- v1.0.0 (2024-01): 初始版本\n\n## 依赖与前置条件\n- 需要安装pandas、numpy\n- 建议内存配置：>=2GB\n- 前置条件：atom_anomaly_detection", config: "{}", script: "import json\nimport time\nfrom typing import Dict, Any, Optional\n\nclass SkillExecutor:\n    '''\n    atom_metric_anomaly_detection - 确定性执行脚本\n    核心原则：相同输入 + 相同状态 = 相同输出\n    '''\n\n    def __init__(self, config: Dict[str, Any]):\n        self.config = config\n        self.start_time = time.time()\n\n    def validate_input(self, event: Dict[str, Any]) -> tuple[bool, Optional[str]]:\n        '''输入参数校验'''\n        if not isinstance(event, dict):\n            return False, \"INPUT_MUST_BE_OBJECT\"\n        return True, None\n\n    def execute(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''\n        执行逻辑 - 必须是确定性的\n        不允许使用随机数、时间依赖等不确定因素\n        '''\n        # 1. 输入校验\n        is_valid, error = self.validate_input(event)\n        if not is_valid:\n            return {\"error\": error, \"status\": \"FAILED\"}\n\n        # 2. 业务逻辑执行（示例）\n        result = self._business_logic(event)\n\n        # 3. 构建确定性输出\n        return {\n            \"status\": \"SUCCESS\",\n            \"result\": result,\n            \"execution_time_ms\": int((time.time() - self.start_time) * 1000),\n            \"timestamp\": int(time.time())\n        }\n\n    def _business_logic(self, event: Dict[str, Any]) -> Dict[str, Any]:\n        '''业务逻辑实现'''\n        # 根据具体技能实现业务逻辑\n        return event\n\ndef handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:\n    '''技能入口函数'''\n    config = context.get('config', {}) if context else {}\n    executor = SkillExecutor(config)\n    return executor.execute(event)", scriptLang: "python",
      references: ["《锂电池原材料检验规范 V3.2》", "《GB/T 11064-2018 碳酸锂化学分析方法》", "《ISO 9001:2015 质量管理体系》"],
      assets: ["templates/inspection_report_template.xlsx", "templates/certificate_template.pdf", "config/specification_thresholds.json"] }
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