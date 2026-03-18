"""
共享数据加载器 - 处理各种数据格式的通用工具
用于 Skill 中的数据获取和预处理
"""

import json
import csv
import re
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
from datetime import datetime


def load_json_data(file_path: str, encoding: str = 'utf-8') -> Dict[str, Any]:
    """
    加载 JSON 数据文件

    Args:
        file_path: JSON 文件路径
        encoding: 文件编码

    Returns:
        解析后的 JSON 数据
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"文件不存在: {file_path}")

    with open(path, 'r', encoding=encoding) as f:
        return json.load(f)


def load_csv_data(
    file_path: str,
    encoding: str = 'utf-8',
    delimiter: str = ',',
    has_header: bool = True
) -> List[Dict[str, Any]]:
    """
    加载 CSV 数据文件

    Args:
        file_path: CSV 文件路径
        encoding: 文件编码
        delimiter: 分隔符
        has_header: 是否有表头

    Returns:
        字典列表，每个字典代表一行数据
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"文件不存在: {file_path}")

    data = []
    with open(path, 'r', encoding=encoding) as f:
        if has_header:
            reader = csv.DictReader(f, delimiter=delimiter)
        else:
            reader = csv.reader(f, delimiter=delimiter)

        for row in reader:
            if not has_header:
                # 如果没有表头，使用列索引作为键
                row = {f"col_{i}": v for i, v in enumerate(row)}
            data.append(dict(row))

    return data


def load_excel_data(
    file_path: str,
    sheet_name: Optional[str] = None,
    header_row: int = 0
) -> List[Dict[str, Any]]:
    """
    加载 Excel 数据文件

    Args:
        file_path: Excel 文件路径
        sheet_name: 工作表名称，默认为第一个
        header_row: 表头行索引

    Returns:
        字典列表
    """
    try:
        import pandas as pd

        df = pd.read_excel(
            file_path,
            sheet_name=sheet_name,
            header=header_row
        )

        # 处理 NaN 值
        df = df.replace({pd.NA: None, pd.NaT: None})
        df = df.where(pd.notnull(df), None)

        return df.to_dict('records')

    except ImportError:
        raise ImportError("需要安装 pandas 和 openpyxl: pip install pandas openpyxl")


def normalize_batch_id(raw_batch_id: str) -> str:
    """
    标准化批次号格式

    Gotcha: 批次号格式可能不一致，如:
    - BATCH202403001
    - 2024-03-001
    - 240301001
    - 24-03-001

    此函数尝试统一为标准格式: YYYYMMDDXXX

    Args:
        raw_batch_id: 原始批次号

    Returns:
        标准化后的批次号
    """
    if not raw_batch_id:
        return ""

    batch_id = raw_batch_id.strip().upper()

    # 移除前缀
    batch_id = re.sub(r'^BATCH', '', batch_id, flags=re.IGNORECASE)

    # 尝试匹配不同格式
    # 格式1: YYYY-MM-DD-XXX 或 YYYY-MM-XXX
    match = re.match(r'^(\d{4})-(\d{2})-(\d{2,3})$', batch_id)
    if match:
        return f"{match.group(1)}{match.group(2)}{match.group(3).zfill(3)}"

    # 格式2: YY-MM-XXX
    match = re.match(r'^(\d{2})-(\d{2})-(\d{3})$', batch_id)
    if match:
        year = "20" + match.group(1)
        return f"{year}{match.group(2)}{match.group(3)}"

    # 格式3: 纯数字 (YYYYMMDDXXX)
    match = re.match(r'^(\d{4})(\d{2})(\d{5})$', batch_id)
    if match:
        return batch_id

    # 格式4: YYMMDDXXX
    match = re.match(r'^(\d{2})(\d{2})(\d{5})$', batch_id)
    if match:
        return f"20{batch_id}"

    # 如果无法识别，返回原始值（大写）
    return batch_id


def detect_file_format(file_path: str) -> str:
    """
    检测文件格式

    Args:
        file_path: 文件路径

    Returns:
        文件格式: 'json', 'csv', 'excel', 'unknown'
    """
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == '.json':
        return 'json'
    elif suffix == '.csv':
        return 'csv'
    elif suffix in ['.xlsx', '.xls']:
        return 'excel'
    elif suffix in ['.txt', '.log']:
        return 'text'
    else:
        return 'unknown'


def auto_load_data(file_path: str, **kwargs) -> Union[Dict, List[Dict]]:
    """
    自动检测并加载数据文件

    Args:
        file_path: 数据文件路径
        **kwargs: 传递给具体加载函数的参数

    Returns:
        加载的数据
    """
    format_type = detect_file_format(file_path)

    if format_type == 'json':
        return load_json_data(file_path, **kwargs)
    elif format_type == 'csv':
        return load_csv_data(file_path, **kwargs)
    elif format_type == 'excel':
        return load_excel_data(file_path, **kwargs)
    else:
        raise ValueError(f"不支持的文件格式: {format_type}")


def validate_data_schema(
    data: Dict[str, Any],
    required_fields: List[str],
    field_types: Optional[Dict[str, type]] = None
) -> List[str]:
    """
    验证数据是否符合指定模式

    Args:
        data: 待验证的数据
        required_fields: 必需字段列表
        field_types: 字段类型要求 {字段名: 类型}

    Returns:
        错误信息列表，空列表表示验证通过
    """
    errors = []

    # 检查必需字段
    for field in required_fields:
        if field not in data or data[field] is None:
            errors.append(f"缺少必需字段: {field}")

    # 检查字段类型
    if field_types:
        for field, expected_type in field_types.items():
            if field in data and data[field] is not None:
                if not isinstance(data[field], expected_type):
                    errors.append(
                        f"字段 {field} 类型错误，期望 {expected_type.__name__}，"
                        f"实际 {type(data[field]).__name__}"
                    )

    return errors


def convert_temperature(
    value: float,
    from_unit: str,
    to_unit: str
) -> float:
    """
    温度单位转换

    Gotcha: 不同设备可能使用摄氏度(°C)或华氏度(°F)，必须显式转换

    Args:
        value: 温度值
        from_unit: 源单位 ('C', 'F', 'K')
        to_unit: 目标单位 ('C', 'F', 'K')

    Returns:
        转换后的温度值
    """
    from_unit = from_unit.upper()
    to_unit = to_unit.upper()

    if from_unit == to_unit:
        return value

    # 先转换为摄氏度
    if from_unit == 'C':
        celsius = value
    elif from_unit == 'F':
        celsius = (value - 32) * 5 / 9
    elif from_unit == 'K':
        celsius = value - 273.15
    else:
        raise ValueError(f"未知的源温度单位: {from_unit}")

    # 再转换为目标单位
    if to_unit == 'C':
        return celsius
    elif to_unit == 'F':
        return celsius * 9 / 5 + 32
    elif to_unit == 'K':
        return celsius + 273.15
    else:
        raise ValueError(f"未知的目标温度单位: {to_unit}")


def parse_date_string(
    date_str: str,
    formats: Optional[List[str]] = None
) -> Optional[datetime]:
    """
    解析日期字符串

    Gotcha: 日期格式可能不一致，如:
    - 2024-03-01
    - 01/03/2024
    - 2024年3月1日
    - 20240301

    Args:
        date_str: 日期字符串
        formats: 尝试的格式列表，默认为常见格式

    Returns:
        datetime 对象，解析失败返回 None
    """
    if not date_str:
        return None

    if formats is None:
        formats = [
            '%Y-%m-%d',
            '%Y-%m-%d %H:%M:%S',
            '%d/%m/%Y',
            '%m/%d/%Y',
            '%Y%m%d',
            '%Y年%m月%d日',
            '%Y/%m/%d',
        ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue

    return None


def merge_data_sources(
    primary_data: List[Dict],
    secondary_data: List[Dict],
    join_key: str,
    suffix: str = '_secondary'
) -> List[Dict]:
    """
    合并两个数据源

    Args:
        primary_data: 主数据
        secondary_data: 次要数据
        join_key: 连接键
        suffix: 次要数据字段后缀（用于区分相同字段名）

    Returns:
        合并后的数据
    """
    # 创建查找表
    lookup = {item.get(join_key): item for item in secondary_data if join_key in item}

    merged = []
    for item in primary_data:
        new_item = item.copy()
        key_value = item.get(join_key)

        if key_value and key_value in lookup:
            secondary_item = lookup[key_value]
            for k, v in secondary_item.items():
                if k != join_key:
                    new_key = f"{k}{suffix}" if k in new_item else k
                    new_item[new_key] = v

        merged.append(new_item)

    return merged


if __name__ == '__main__':
    # 测试代码
    print("测试数据加载器...")

    # 测试批次号标准化
    test_batches = [
        "BATCH202403001",
        "2024-03-001",
        "240301001",
        "24-03-001"
    ]

    for batch in test_batches:
        normalized = normalize_batch_id(batch)
        print(f"{batch} -> {normalized}")

    # 测试温度转换
    print(f"\n100°F = {convert_temperature(100, 'F', 'C'):.2f}°C")
    print(f"0°C = {convert_temperature(0, 'C', 'F'):.2f}°F")

    # 测试日期解析
    test_dates = ["2024-03-01", "2024年3月1日", "03/01/2024"]
    for date_str in test_dates:
        parsed = parse_date_string(date_str)
        print(f"{date_str} -> {parsed}")
