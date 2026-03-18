"""
历史记录管理 - 实现 Skill 的"记忆"功能
用于：追踪变化、避免重复检测、生成趋势分析
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict


@dataclass
class InspectionRecord:
    """检验记录数据结构"""
    batch_id: str
    material_type: str
    inspection_time: str
    purity: float
    contaminants: List[Dict[str, Any]]
    is_passed: bool
    inspector: str
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'InspectionRecord':
        return cls(**data)


def log_inspection(
    batch_id: str,
    results: Dict[str, Any],
    material_type: str = "Unknown",
    inspector: str = "AI",
    notes: str = "",
    log_file: str = "inspection_history.log"
) -> None:
    """
    记录一次检验到历史日志

    这是 Skill "记忆"功能的核心。通过记录每次检验，我们可以：
    1. 避免对同一批次重复检测
    2. 追踪质量趋势
    3. 对比历史批次
    """
    log_path = Path(log_file)

    # 创建记录
    record = InspectionRecord(
        batch_id=batch_id,
        material_type=material_type,
        inspection_time=datetime.now().isoformat(),
        purity=results.get('purity', 0.0),
        contaminants=results.get('contaminants', []),
        is_passed=results.get('is_passed', False),
        inspector=inspector,
        notes=notes
    )

    # 追加到日志文件（JSON Lines 格式）
    with open(log_path, 'a') as f:
        f.write(json.dumps(record.to_dict(), ensure_ascii=False) + '\n')


def is_already_inspected(batch_id: str, log_file: str = "inspection_history.log") -> bool:
    """检查批次是否已经被检验过"""
    log_path = Path(log_file)

    if not log_path.exists():
        return False

    with open(log_path) as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                if record['batch_id'] == batch_id:
                    return True
            except json.JSONDecodeError:
                continue

    return False


def get_last_inspection(batch_id: str, log_file: str = "inspection_history.log") -> Optional[Dict[str, Any]]:
    """获取批次的最近一次检验记录"""
    log_path = Path(log_file)

    if not log_path.exists():
        return None

    last_record = None

    with open(log_path) as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                if record['batch_id'] == batch_id:
                    last_record = record
            except json.JSONDecodeError:
                continue

    return last_record


def get_recent_inspections(
    material_type: Optional[str] = None,
    limit: int = 10,
    log_file: str = "inspection_history.log"
) -> List[Dict[str, Any]]:
    """
    获取最近的检验记录

    用于趋势分析和批量对比
    """
    log_path = Path(log_file)

    if not log_path.exists():
        return []

    records = []

    with open(log_path) as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                if material_type is None or record.get('material_type') == material_type:
                    records.append(record)
            except json.JSONDecodeError:
                continue

    # 按时间排序，取最近的
    records.sort(key=lambda x: x['inspection_time'], reverse=True)
    return records[:limit]


def compare_with_history(
    batch_id: str,
    current_results: Dict[str, Any],
    log_file: str = "inspection_history.log"
) -> Dict[str, Any]:
    """
    将当前结果与历史同类型批次对比

    输出示例：
    {
        "comparison": "当前批次纯度 99.7%，高于同类平均水平 99.5%",
        "trend": "最近10批纯度呈上升趋势",
        "rank": 3  # 在最近10批中排名第3
    }
    """
    material_type = current_results.get('material_type', 'Unknown')
    current_purity = current_results.get('purity', 0.0)

    # 获取同类型的历史记录
    history = get_recent_inspections(material_type, limit=20, log_file=log_file)

    if len(history) < 2:
        return {
            "comparison": "历史数据不足，无法对比",
            "trend": "未知",
            "rank": None
        }

    # 计算统计数据
    purities = [r['purity'] for r in history if r['batch_id'] != batch_id]
    avg_purity = sum(purities) / len(purities)
    min_purity = min(purities)
    max_purity = max(purities)

    # 确定排名
    all_purities = purities + [current_purity]
    all_purities.sort(reverse=True)
    rank = all_purities.index(current_purity) + 1

    # 趋势判断
    if len(purities) >= 5:
        recent_5 = purities[:5]
        older_5 = purities[5:10] if len(purities) >= 10 else purities[5:]
        recent_avg = sum(recent_5) / len(recent_5)
        older_avg = sum(older_5) / len(older_5) if older_5 else recent_avg

        if recent_avg > older_avg * 1.01:
            trend = "上升"
        elif recent_avg < older_avg * 0.99:
            trend = "下降"
        else:
            trend = "稳定"
    else:
        trend = "数据不足"

    # 生成对比描述
    diff = current_purity - avg_purity
    if abs(diff) < 0.01:
        comparison = f"当前批次纯度 {current_purity:.2f}%，与同类平均水平持平"
    elif diff > 0:
        comparison = f"当前批次纯度 {current_purity:.2f}%，高于同类平均水平 {avg_purity:.2f}% (+{diff:.2f}%)"
    else:
        comparison = f"当前批次纯度 {current_purity:.2f}%，低于同类平均水平 {avg_purity:.2f}% ({diff:.2f}%)"

    return {
        "comparison": comparison,
        "trend": trend,
        "rank": f"{rank}/{len(all_purities)}",
        "stats": {
            "avg": avg_purity,
            "min": min_purity,
            "max": max_purity,
            "current": current_purity
        }
    }


def generate_trend_report(
    material_type: str,
    days: int = 30,
    log_file: str = "inspection_history.log"
) -> str:
    """
    生成质量趋势报告

    用于周报、月报等定期报告
    """
    history = get_recent_inspections(material_type, limit=100, log_file=log_file)

    if not history:
        return f"暂无 {material_type} 的检验记录"

    total = len(history)
    passed = sum(1 for r in history if r['is_passed'])
    avg_purity = sum(r['purity'] for r in history) / total

    report = f"""
# {material_type} 质量趋势报告（最近{days}天）

## 总体统计
- 检验批次: {total}
- 通过率: {passed}/{total} ({passed/total*100:.1f}%)
- 平均纯度: {avg_purity:.2f}%

## 趋势分析
待补充...

## 异常批次
待补充...
"""

    return report


if __name__ == '__main__':
    # 测试代码
    print("测试历史记录管理...")

    # 模拟一些记录
    test_batches = [
        ('202403001', 'Li2CO3', 99.52, True),
        ('202403002', 'Li2CO3', 99.48, True),
        ('202403003', 'Li2CO3', 99.65, True),
        ('202403004', 'Li2CO3', 99.71, True),
    ]

    for batch, material, purity, passed in test_batches:
        log_inspection(
            batch_id=batch,
            results={'purity': purity, 'is_passed': passed, 'contaminants': []},
            material_type=material,
            inspector="AI"
        )

    # 测试重复检测检查
    print(f"202403001 已检测: {is_already_inspected('202403001')}")
    print(f"202403999 已检测: {is_already_inspected('202403999')}")

    # 测试对比
    comparison = compare_with_history('202403005', {'material_type': 'Li2CO3', 'purity': 99.75})
    print(f"对比结果: {comparison}")
