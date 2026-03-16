import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Box, Zap, CircleDot, Settings, Cloud, ShieldAlert, Wrench, Activity, Gauge, Beaker, Clock, DollarSign, Package, CheckCircle, Layers, ArrowRight } from 'lucide-react';
import { ATOMIC_ONTOLOGY_LIBRARY, ATOMIC_CATEGORIES } from '../constants';
import { AtomicOntology } from '../types';

// 图标映射
const iconMap: Record<string, React.ElementType> = {
  Gauge, Beaker, Clock, DollarSign, Package, CheckCircle, Activity,
  Zap, CircleDot, Settings, Cloud, ShieldAlert, Wrench, Box
};

// 统一使用灰色图标
const GrayIcon: React.FC<{ icon: React.ElementType }> = ({ icon: Icon }) => (
  <Icon size={16} className="text-gray-500" />
);

const AtomicOntologyModule: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAtom, setSelectedAtom] = useState<AtomicOntology | null>(null);

  // 接收来自关联性分析的跳转
  useEffect(() => {
    if (location.state?.selectedAtom) {
      const atom = ATOMIC_ONTOLOGY_LIBRARY.find(a => a.id === location.state.selectedAtom);
      if (atom) {
        setSelectedAtom(atom);
        setSelectedCategory(atom.category);
      }
    }
  }, [location.state]);

  // 过滤原子业务语义
  const filteredAtoms = ATOMIC_ONTOLOGY_LIBRARY.filter(atom => {
    const matchesCategory = selectedCategory === 'all' || atom.category === selectedCategory;
    const matchesSearch =
      atom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atom.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atom.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // 统计各分类数量
  const categoryStats = ATOMIC_CATEGORIES.map(cat => ({
    ...cat,
    count: ATOMIC_ONTOLOGY_LIBRARY.filter(atom => atom.category === cat.value).length
  }));

  const getCategoryLabel = (categoryValue: string) => {
    return ATOMIC_CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue;
  };

  const getCategoryColor = (categoryValue: string) => {
    return ATOMIC_CATEGORIES.find(c => c.value === categoryValue)?.color || '#64748b';
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">原子业务语义库</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {ATOMIC_ONTOLOGY_LIBRARY.length} 个原子业务语义
          </p>
        </div>

        {/* 场景原子业务语义入口 */}
        <button
          onClick={() => navigate('/atoms/scenario')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Layers size={16} />
          <span>场景原子业务语义</span>
        </button>
      </div>

      {/* 分类统计卡片 */}
      <div className="grid grid-cols-7 gap-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-3 rounded-xl border transition-all text-left ${
            selectedCategory === 'all'
              ? 'bg-gray-50 border-gray-900'
              : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
          }`}
        >
          <div className="text-xs text-gray-400 mb-1">全部</div>
          <div className="text-xl font-semibold text-gray-900">{ATOMIC_ONTOLOGY_LIBRARY.length}</div>
          <div className="text-xs text-gray-400">个业务语义</div>
        </button>
        {categoryStats.map(cat => {
          const Icon = iconMap[cat.icon] || Box;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`p-3 rounded-xl border transition-all text-left ${
                selectedCategory === cat.value
                  ? 'bg-gray-50 border-gray-900'
                  : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon size={16} className="text-gray-500" />
                <span className="text-xs text-gray-400">{cat.count}</span>
              </div>
              <div className="text-xs font-medium text-gray-700 truncate">{cat.label}</div>
            </button>
          );
        })}
      </div>

      {/* 搜索栏 */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="搜索原子业务语义名称、描述或标签..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors">
          <Filter size={16} />
          <span>筛选</span>
        </button>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* 左侧列表 */}
        <div className="w-2/3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <span className="font-medium text-gray-700">
              {selectedCategory === 'all' ? '全部原子业务语义' : getCategoryLabel(selectedCategory)}
            </span>
            <span className="text-xs text-gray-400">共 {filteredAtoms.length} 个</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-3">
              {filteredAtoms.map(atom => {
                return (
                  <button
                    key={atom.id}
                    onClick={() => setSelectedAtom(atom)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedAtom?.id === atom.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-gray-900">{atom.name}</span>
                      {atom.unit && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {atom.unit}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{atom.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {atom.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredAtoms.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Box size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm">未找到匹配的原子业务语义</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧详情 */}
        <div className="w-1/3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {selectedAtom ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">{selectedAtom.name}</h3>
                <p className="text-xs text-gray-400 mt-1">ID: {selectedAtom.id}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-400">分类</label>
                  <div className="mt-1">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {getCategoryLabel(selectedAtom.category)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400">描述</label>
                  <p className="mt-1 text-sm text-gray-700">{selectedAtom.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400">数据类型</label>
                    <p className="mt-1 text-sm text-gray-700">{selectedAtom.dataType}</p>
                  </div>
                  {selectedAtom.unit && (
                    <div>
                      <label className="text-xs text-gray-400">单位</label>
                      <p className="mt-1 text-sm text-gray-700">{selectedAtom.unit}</p>
                    </div>
                  )}
                </div>

                {selectedAtom.constraints && (
                  <div>
                    <label className="text-xs text-gray-400">约束条件</label>
                    <div className="mt-1 text-sm text-gray-700 space-y-1">
                      {selectedAtom.constraints.min !== undefined && (
                        <p className="text-xs">最小值: {selectedAtom.constraints.min}</p>
                      )}
                      {selectedAtom.constraints.max !== undefined && (
                        <p className="text-xs">最大值: {selectedAtom.constraints.max}</p>
                      )}
                      {selectedAtom.constraints.enum && (
                        <p className="text-xs">枚举值: {selectedAtom.constraints.enum.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-400">标签</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedAtom.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="text-xs text-gray-400">应用场景</label>
                  <p className="mt-1 text-xs text-gray-500">
                    该原子业务语义可在技能注册中心和业务流程图谱编辑器中被引用，
                    用于定义技能输入输出参数和业务场景中的关键指标。
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Box size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-400">点击左侧原子业务语义查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtomicOntologyModule;
