"""
共享历史记录管理器 - 实现 Skill 的"记忆"功能
用于：追踪变化、避免重复操作、生成趋势分析
"""

import json
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, asdict
from enum import Enum


class LogLevel(Enum):
    """日志级别"""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


@dataclass
class ExecutionRecord:
    """执行记录数据结构"""
    execution_id: str
    skill_id: str
    task_type: str
    input_hash: str  # 输入参数的哈希，用于检测重复
    input_summary: str  # 输入摘要（可读）
    output_summary: str  # 输出摘要
    status: str  # 'success', 'failed', 'partial'
    execution_time: float  # 执行耗时（秒）
    timestamp: str
    metadata: Dict[str, Any]  # 额外元数据

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ExecutionRecord':
        return cls(**data)


def generate_execution_id(skill_id: str, input_data: Dict[str, Any]) -> str:
    """
    生成执行记录的唯一ID

    Args:
        skill_id: Skill 标识
        input_data: 输入数据

    Returns:
        唯一执行ID
    """
    content = f"{skill_id}:{json.dumps(input_data, sort_keys=True, ensure_ascii=False)}"
    return hashlib.md5(content.encode()).hexdigest()[:12]


def hash_input_data(input_data: Dict[str, Any]) -> str:
    """
    计算输入数据的哈希值

    Args:
        input_data: 输入数据

    Returns:
        哈希值
    """
    content = json.dumps(input_data, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(content.encode()).hexdigest()[:16]


def log_execution(
    skill_id: str,
    task_type: str,
    input_data: Dict[str, Any],
    output_data: Any,
    status: str = "success",
    execution_time: float = 0.0,
    metadata: Optional[Dict[str, Any]] = None,
    log_file: str = "execution_history.log"
) -> str:
    """
    记录一次 Skill 执行到历史日志

    这是 Skill "记忆"功能的核心。通过记录每次执行，我们可以：
    1. 避免对相同输入重复执行
    2. 追踪执行历史
    3. 对比历史结果
    4. 生成执行统计

    Args:
        skill_id: Skill 标识
        task_type: 任务类型
        input_data: 输入数据
        output_data: 输出数据
        status: 执行状态
        execution_time: 执行耗时（秒）
        metadata: 额外元数据
        log_file: 日志文件路径

    Returns:
        执行记录ID
    """
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    # 生成执行ID和输入哈希
    execution_id = generate_execution_id(skill_id, input_data)
    input_hash = hash_input_data(input_data)

    # 创建记录
    record = ExecutionRecord(
        execution_id=execution_id,
        skill_id=skill_id,
        task_type=task_type,
        input_hash=input_hash,
        input_summary=_summarize_input(input_data),
        output_summary=_summarize_output(output_data),
        status=status,
        execution_time=execution_time,
        timestamp=datetime.now().isoformat(),
        metadata=metadata or {}
    )

    # 追加到日志文件（JSON Lines 格式）
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(json.dumps(record.to_dict(), ensure_ascii=False) + '\n')

    return execution_id


def is_already_executed(
    skill_id: str,
    input_data: Dict[str, Any],
    log_file: str = "execution_history.log",
    within_hours: Optional[int] = None
) -> bool:
    """
    检查相同输入是否已经被执行过

    Gotcha: 某些操作不应该重复执行，如数据导入、通知发送等

    Args:
        skill_id: Skill 标识
        input_data: 输入数据
        log_file: 日志文件路径
        within_hours: 限制时间范围（小时），None 表示不限制

    Returns:
        是否已执行过
    """
    log_path = Path(log_file)
    if not log_path.exists():
        return False

    input_hash = hash_input_data(input_data)
    cutoff_time = None

    if within_hours is not None:
        cutoff_time = datetime.now() - timedelta(hours=within_hours)

    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                if (record['skill_id'] == skill_id and
                    record['input_hash'] == input_hash):

                    # 检查时间限制
                    if cutoff_time is not None:
                        record_time = datetime.fromisoformat(record['timestamp'])
                        if record_time < cutoff_time:
                            continue

                    return True
            except (json.JSONDecodeError, KeyError):
                continue

    return False


def get_last_execution(
    skill_id: str,
    input_data: Optional[Dict[str, Any]] = None,
    log_file: str = "execution_history.log"
) -> Optional[Dict[str, Any]]:
    """
    获取指定 Skill 的最近一次执行记录

    Args:
        skill_id: Skill 标识
        input_data: 可选，指定输入数据
        log_file: 日志文件路径

    Returns:
        最近一次执行记录，如果没有返回 None
    """
    log_path = Path(log_file)
    if not log_path.exists():
        return None

    target_hash = hash_input_data(input_data) if input_data else None
    last_record = None

    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                if record['skill_id'] == skill_id:
                    if target_hash is None or record['input_hash'] == target_hash:
                        if last_record is None or record['timestamp'] > last_record['timestamp']:
                            last_record = record
            except (json.JSONDecodeError, KeyError):
                continue

    return last_record


def get_recent_executions(
    skill_id: Optional[str] = None,
    task_type: Optional[str] = None,
    limit: int = 10,
    status: Optional[str] = None,
    log_file: str = "execution_history.log"
) -> List[Dict[str, Any]]:
    """
    获取最近的执行记录

    Args:
        skill_id: 可选，按 Skill 筛选
        task_type: 可选，按任务类型筛选
        limit: 返回记录数量限制
        status: 可选，按状态筛选
        log_file: 日志文件路径

    Returns:
        执行记录列表
    """
    log_path = Path(log_file)
    if not log_path.exists():
        return []

    records = []

    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                record = json.loads(line.strip())

                # 应用筛选
                if skill_id and record.get('skill_id') != skill_id:
                    continue
                if task_type and record.get('task_type') != task_type:
                    continue
                if status and record.get('status') != status:
                    continue

                records.append(record)
            except (json.JSONDecodeError, KeyError):
                continue

    # 按时间排序，取最近的
    records.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return records[:limit]


def compare_with_history(
    skill_id: str,
    current_result: Dict[str, Any],
    metric_key: str,
    compare_func: Optional[Callable[[Any, Any], str]] = None,
    log_file: str = "execution_history.log"
) -> Dict[str, Any]:
    """
    将当前结果与历史执行结果对比

    Args:
        skill_id: Skill 标识
        current_result: 当前结果
        metric_key: 对比的指标键
        compare_func: 可选，自定义对比函数
        log_file: 日志文件路径

    Returns:
        对比结果
    """
    history = get_recent_executions(skill_id=skill_id, limit=20, log_file=log_file)

    if not history:
        return {
            "comparison": "无历史数据，无法对比",
            "trend": "unknown",
            "historical_avg": None,
            "current_value": current_result.get(metric_key)
        }

    # 从历史记录中提取指标值
    historical_values = []
    for record in history:
        try:
            metadata = record.get('metadata', {})
            if metric_key in metadata:
                historical_values.append(metadata[metric_key])
        except:
            continue

    if not historical_values:
        return {
            "comparison": "历史记录中无此指标",
            "trend": "unknown",
            "historical_avg": None,
            "current_value": current_result.get(metric_key)
        }

    current_value = current_result.get(metric_key)
    avg_value = sum(historical_values) / len(historical_values)

    # 趋势判断（最近5次 vs 之前）
    trend = "stable"
    if len(historical_values) >= 5:
        recent_avg = sum(historical_values[:5]) / 5
        older_values = historical_values[5:10] if len(historical_values) >= 10 else historical_values[5:]
        if older_values:
            older_avg = sum(older_values) / len(older_values)
            if recent_avg > older_avg * 1.02:
                trend = "increasing"
            elif recent_avg < older_avg * 0.98:
                trend = "decreasing"

    # 生成对比描述
    if compare_func:
        comparison = compare_func(current_value, historical_values)
    else:
        diff = current_value - avg_value if current_value is not None else 0
        if abs(diff) < 0.01 * avg_value if avg_value else True:
            comparison = f"当前值 {current_value} 与历史平均水平 {avg_value:.2f} 持平"
        elif diff > 0:
            comparison = f"当前值 {current_value} 高于历史平均水平 {avg_value:.2f} (+{diff:.2f})"
        else:
            comparison = f"当前值 {current_value} 低于历史平均水平 {avg_value:.2f} ({diff:.2f})"

    return {
        "comparison": comparison,
        "trend": trend,
        "historical_avg": avg_value,
        "current_value": current_value,
        "historical_count": len(historical_values),
        "historical_min": min(historical_values),
        "historical_max": max(historical_values)
    }


def get_execution_statistics(
    skill_id: Optional[str] = None,
    days: int = 7,
    log_file: str = "execution_history.log"
) -> Dict[str, Any]:
    """
    获取执行统计信息

    Args:
        skill_id: 可选，按 Skill 筛选
        days: 统计天数
        log_file: 日志文件路径

    Returns:
        统计信息
    """
    log_path = Path(log_file)
    if not log_path.exists():
        return {
            "total_executions": 0,
            "success_rate": 0,
            "avg_execution_time": 0
        }

    cutoff_time = datetime.now() - timedelta(days=days)

    total = 0
    success = 0
    total_time = 0
    status_counts = {}

    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                record = json.loads(line.strip())

                # 时间筛选
                record_time = datetime.fromisoformat(record['timestamp'])
                if record_time < cutoff_time:
                    continue

                # Skill 筛选
                if skill_id and record.get('skill_id') != skill_id:
                    continue

                total += 1
                status = record.get('status', 'unknown')
                status_counts[status] = status_counts.get(status, 0) + 1

                if status == 'success':
                    success += 1

                total_time += record.get('execution_time', 0)

            except (json.JSONDecodeError, KeyError):
                continue

    return {
        "total_executions": total,
        "success_rate": success / total if total > 0 else 0,
        "avg_execution_time": total_time / total if total > 0 else 0,
        "status_counts": status_counts,
        "period_days": days
    }


def clear_old_logs(
    days: int = 30,
    log_file: str = "execution_history.log",
    archive: bool = True
) -> int:
    """
    清理旧日志记录

    Args:
        days: 保留天数
        log_file: 日志文件路径
        archive: 是否归档而不是删除

    Returns:
        清理的记录数量
    """
    log_path = Path(log_file)
    if not log_path.exists():
        return 0

    cutoff_time = datetime.now() - timedelta(days=days)

    kept_records = []
    removed_count = 0

    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                record = json.loads(line.strip())
                record_time = datetime.fromisoformat(record['timestamp'])

                if record_time >= cutoff_time:
                    kept_records.append(record)
                else:
                    removed_count += 1
            except:
                continue

    # 归档旧记录
    if archive and removed_count > 0:
        archive_path = log_path.with_suffix(f".archive.{datetime.now().strftime('%Y%m%d')}.log")
        with open(archive_path, 'w', encoding='utf-8') as f:
            for record in kept_records:
                f.write(json.dumps(record, ensure_ascii=False) + '\n')

    # 重写日志文件
    with open(log_path, 'w', encoding='utf-8') as f:
        for record in kept_records:
            f.write(json.dumps(record, ensure_ascii=False) + '\n')

    return removed_count


def _summarize_input(input_data: Dict[str, Any], max_length: int = 100) -> str:
    """生成输入摘要"""
    summary = json.dumps(input_data, ensure_ascii=False)
    if len(summary) > max_length:
        summary = summary[:max_length] + "..."
    return summary


def _summarize_output(output_data: Any, max_length: int = 100) -> str:
    """生成输出摘要"""
    summary = json.dumps(output_data, ensure_ascii=False, default=str)
    if len(summary) > max_length:
        summary = summary[:max_length] + "..."
    return summary


if __name__ == '__main__':
    # 测试代码
    print("测试历史记录管理器...")

    # 模拟记录
    for i in range(5):
        log_execution(
            skill_id="test-skill",
            task_type="analysis",
            input_data={"batch_id": f"20240300{i+1}", "param": "value"},
            output_data={"result": f"output_{i}"},
            status="success",
            execution_time=1.5 + i * 0.1,
            metadata={"score": 0.9 + i * 0.02}
        )

    # 测试重复检查
    print(f"是否已执行: {is_already_executed('test-skill', {'batch_id': '202403001', 'param': 'value'})}")

    # 测试获取最近记录
    recent = get_recent_executions(skill_id="test-skill", limit=3)
    print(f"最近记录数: {len(recent)}")

    # 测试统计
    stats = get_execution_statistics(skill_id="test-skill")
    print(f"统计: {stats}")
