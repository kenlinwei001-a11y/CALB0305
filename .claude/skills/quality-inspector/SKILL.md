# 质量检验助手

## 描述

当用户需要分析原材料质检数据、生成检验报告、或判断来料是否合格时调用此 Skill。特别适用于：来料检验异常、需要快速生成检验报告、批量分析多个批次质量数据。

## 使用场景

- 收到原料到货通知，需要快速完成来料检验
- 质检数据异常，需要分析原因并生成报告
- 需要批量对比多个批次的质量指标
- 需要生成符合国标的检验证书

## 初始化

首次使用时，检查 `config.json` 是否存在。如不存在，询问用户：
1. 默认检验标准（国标/企标/客户定制）
2. 报告输出格式（PDF/Excel/JSON）
3. 是否需要自动发送到指定邮箱

保存配置到 `config.json`。

## Gotchas（常见坑点）

1. **光谱仪数据格式不一致** - 不同型号光谱仪输出的波长范围可能不同（350-2500nm vs 1000-1700nm），必须先检查数据范围再处理
2. **批次号编码规则混乱** - 可能存在 BATCH202403001、20240301-B1、240301001 等多种格式，需要先标准化再存储
3. **温度单位陷阱** - 有些设备输出摄氏度，有些是华氏度，必须显式转换
4. **纯度阈值争议** - 不同客户对纯度要求不同（99.5% vs 99.9%），不能硬编码，必须从配置读取
5. **重复检测问题** - 同一批次可能被多次检测（初检/复检），需要检查 `inspection_history.log` 避免重复记录

## 核心工作流

### 1. 数据获取

使用 `scripts/data_loader.py` 中的辅助函数：

```python
from scripts.data_loader import load_spectrum_data, validate_batch_id

# 加载光谱数据（自动处理不同格式）
spectrum = load_spectrum_data(file_path, device_type='NIR')

# 验证并标准化批次号
batch_id = validate_batch_id(raw_batch_id)
```

### 2. 数据分析

```python
from scripts.analyzer import calculate_purity, detect_contaminants

# 计算纯度（自动加载对应材料的模型）
purity_score = calculate_purity(spectrum, material_type='Li2CO3')

# 检测污染物
detected = detect_contaminants(spectrum, threshold=0.001)
```

### 3. 报告生成

```python
from scripts.report_generator import generate_inspection_report

# 生成报告（自动应用配置的模板）
report = generate_inspection_report(
    batch_id=batch_id,
    results={'purity': purity_score, 'contaminants': detected},
    template=config['report_template']
)
```

### 4. 记录保存

```python
from scripts.history_manager import log_inspection

# 记录到历史日志（用于追踪变化和避免重复）
log_inspection(batch_id, results, log_file='inspection_history.log')
```

## 可用的辅助脚本

- `scripts/data_loader.py` - 数据加载和验证
- `scripts/analyzer.py` - 核心分析算法
- `scripts/report_generator.py` - 报告生成
- `scripts/history_manager.py` - 历史记录管理
- `scripts/visualizer.py` - 数据可视化

## 记忆与数据存储

Skill 会在以下位置存储数据：

- `inspection_history.log` - 所有检验记录（用于追踪变化和避免重复）
- `batch_cache/` - 批次数据缓存（避免重复读取大文件）
- `trends/` - 质量趋势数据（用于生成趋势图表）

## 示例

### 示例 1：基础来料检验

用户：来了一批碳酸锂，帮我检验一下

```python
# 1. 检查配置
config = load_config()

# 2. 询问批次号（如果没有提供）
batch_id = ask_user("请输入批次号：")

# 3. 检查是否已检测过
if is_already_inspected(batch_id, 'inspection_history.log'):
    last_result = get_last_inspection(batch_id)
    return f"该批次已于 {last_result['time']} 检测过，结果：{last_result['summary']}"

# 4. 加载数据
spectrum = load_spectrum_data(f"data/{batch_id}.csv")

# 5. 分析
purity = calculate_purity(spectrum, 'Li2CO3')
contaminants = detect_contaminants(spectrum)

# 6. 判定
threshold = config.get('purity_threshold', 99.5)
is_passed = purity >= threshold

# 7. 记录
log_inspection(batch_id, {'purity': purity, 'passed': is_passed})

# 8. 生成报告
report = generate_inspection_report(batch_id, {...})
```

### 示例 2：批量对比分析

用户：对比最近10批碳酸锂的纯度趋势

```python
# 从历史日志读取最近10批
recent_batches = get_recent_inspections('Li2CO3', limit=10, log_file='inspection_history.log')

# 提取纯度数据
purity_trend = [(b['batch_id'], b['results']['purity']) for b in recent_batches]

# 生成趋势图
chart = generate_trend_chart(purity_trend, output='trends/li2co3_purity.png')

# 分析趋势
analysis = analyze_trend(purity_trend)
# 输出："纯度呈上升趋势，平均值从 99.52% 提升至 99.67%，建议..."
```

## 故障排查

### 光谱数据读取失败

1. 检查文件格式（CSV/JSON/二进制）
2. 检查设备类型配置（NIR/MIR/Raman）
3. 查看 `logs/data_loader.log` 获取详细错误

### 纯度计算异常

1. 检查材料类型是否在支持列表
2. 检查光谱数据范围是否匹配模型要求
3. 查看 `logs/analyzer.log`

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0.0 | 2024-01 | 初始版本 |
| v1.1.0 | 2024-03 | 增加多设备支持 |
| v1.2.0 | 2024-06 | 添加历史记录功能 |
| v1.3.0 | 2024-09 | 增加批量对比分析 |

## 依赖

- Python 3.9+
- numpy, pandas, scipy
- matplotlib（用于可视化）
- reportlab（用于PDF报告）

## 权限要求

- 质检员角色或更高
- 读取 `data/` 目录
- 写入 `logs/` 和 `trends/` 目录
