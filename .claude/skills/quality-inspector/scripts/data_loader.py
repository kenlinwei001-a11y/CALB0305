"""
数据加载和验证辅助函数
用于处理不同格式的光谱数据和批次号
"""

import pandas as pd
import json
import re
from pathlib import Path
from typing import Union, Dict, Any, Tuple

# 支持的设备类型和对应的波长范围
DEVICE_CONFIGS = {
    'NIR': {'wavelength_range': (1000, 1700), 'expected_columns': ['wavelength', 'intensity']},
    'MIR': {'wavelength_range': (350, 2500), 'expected_columns': ['wavelength', 'intensity']},
    'Raman': {'wavelength_range': (200, 4000), 'expected_columns': ['raman_shift', 'intensity']},
}

# 批次号标准化规则
BATCH_PATTERNS = [
    (r'BATCH(\d{4})(\d{2})(\d{3})', lambda m: f"{m.group(1)}{m.group(2)}{m.group(3)}"),  # BATCH202403001 -> 202403001
    (r'(\d{4})(\d{2})(\d{2})-B(\d+)', lambda m: f"{m.group(1)}{m.group(2)}{m.group(4).zfill(3)}"),  # 20240301-B1 -> 202403001
    (r'(\d{6})(\d{3})', lambda m: f"{m.group(1)}{m.group(2)}"),  # 240301001 -> 240301001 (保持)
]


def load_spectrum_data(file_path: str, device_type: str = 'NIR') -> pd.DataFrame:
    """
    加载光谱数据，自动处理不同格式

    Gotcha: 不同设备输出的列名可能不同
    - NIR设备通常输出 'wavelength', 'intensity'
    - 有些设备输出 'nm', 'absorbance'
    - CSV文件可能有不同的分隔符
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"光谱数据文件不存在: {file_path}")

    # 根据扩展名选择读取方式
    if path.suffix == '.csv':
        # 尝试不同分隔符
        for sep in [',', '\t', ';']:
            try:
                df = pd.read_csv(path, sep=sep)
                if len(df.columns) >= 2:
                    break
            except:
                continue
    elif path.suffix == '.json':
        with open(path) as f:
            data = json.load(f)
        df = pd.DataFrame(data)
    else:
        raise ValueError(f"不支持的文件格式: {path.suffix}")

    # 标准化列名
    df = _normalize_columns(df)

    # 验证波长范围
    config = DEVICE_CONFIGS.get(device_type, DEVICE_CONFIGS['NIR'])
    wavelength_col = 'wavelength' if 'wavelength' in df.columns else df.columns[0]

    actual_range = (df[wavelength_col].min(), df[wavelength_col].max())
    expected_range = config['wavelength_range']

    if actual_range[0] < expected_range[0] * 0.9 or actual_range[1] > expected_range[1] * 1.1:
        print(f"警告: 波长范围 {actual_range} 与预期 {expected_range} 不符")

    return df


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """标准化列名，处理不同设备的命名习惯"""
    column_mapping = {
        'nm': 'wavelength',
        'wavelength_nm': 'wavelength',
        '波長': 'wavelength',
        'absorbance': 'intensity',
        'abs': 'intensity',
        '吸光度': 'intensity',
        'raman_shift': 'raman_shift',
        '拉曼位移': 'raman_shift',
    }

    df = df.rename(columns=column_mapping)
    return df


def validate_batch_id(raw_batch_id: str) -> str:
    """
    验证并标准化批次号

    Gotcha: 不同供应商的批次号格式完全不同
    我们需要统一成内部格式：YYYYMMDDNNN
    """
    if not raw_batch_id:
        raise ValueError("批次号不能为空")

    # 尝试匹配各种模式
    for pattern, formatter in BATCH_PATTERNS:
        match = re.match(pattern, raw_batch_id)
        if match:
            return formatter(match)

    # 如果没有匹配，检查是否已经是标准格式
    if re.match(r'\d{9}$', raw_batch_id):
        return raw_batch_id

    # 清理特殊字符
    cleaned = re.sub(r'[^\w\d]', '', raw_batch_id)
    if len(cleaned) >= 9:
        return cleaned[:9]

    raise ValueError(f"无法识别批次号格式: {raw_batch_id}")


def load_config(skill_dir: str = '.') -> Dict[str, Any]:
    """加载技能配置"""
    config_path = Path(skill_dir) / 'config.json'

    if not config_path.exists():
        return {}

    with open(config_path) as f:
        return json.load(f)


def save_config(config: Dict[str, Any], skill_dir: str = '.') -> None:
    """保存技能配置"""
    config_path = Path(skill_dir) / 'config.json'

    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)


if __name__ == '__main__':
    # 测试代码
    print("测试批次号标准化:")
    test_cases = ['BATCH202403001', '20240301-B1', '240301001', 'B-2024-03-001']
    for case in test_cases:
        try:
            normalized = validate_batch_id(case)
            print(f"  {case} -> {normalized}")
        except ValueError as e:
            print(f"  {case} -> 错误: {e}")
