import React, { useState } from 'react';
import {
  Box, Search, Filter, ChevronRight, Activity, Link2, Zap,
  Settings, Clock, AlertCircle, CheckCircle, BarChart3,
  Cpu, Factory, Package, ShoppingCart, Users, Truck, FileText,
  MoreHorizontal, Plus, History, Shield, Tag
} from 'lucide-react';
import { MOCK_BUSINESS_OBJECTS, getObjectsByType } from '../constants';
import type { BusinessObject, BusinessObjectType } from '../types';

const objectTypeConfig: Record<BusinessObjectType, { icon: React.ElementType; color: string; label: string }> = {
  equipment: { icon: Cpu, color: 'text-blue-600', label: '设备' },
  material: { icon: Package, color: 'text-orange-600', label: '物料' },
  order: { icon: ShoppingCart, color: 'text-green-600', label: '订单' },
  product: { icon: Box, color: 'text-purple-600', label: '产品' },
  process: { icon: Factory, color: 'text-cyan-600', label: '工艺' },
  quality_event: { icon: Shield, color: 'text-red-600', label: '质量事件' },
  worker: { icon: Users, color: 'text-pink-600', label: '人员' },
  line: { icon: Activity, color: 'text-indigo-600', label: '产线' },
  customer: { icon: Users, color: 'text-teal-600', label: '客户' },
  supplier: { icon: Truck, color: 'text-amber-600', label: '供应商' }
};

const ObjectCard: React.FC<{
  obj: BusinessObject;
  isSelected: boolean;
  onClick: () => void;
}> = ({ obj, isSelected, onClick }) => {
  const config = objectTypeConfig[obj.type];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-50 ring-2 ring-blue-500 border-transparent'
          : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50`}>
          <Icon size={20} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">{obj.id}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              obj.state.severity === 'normal' ? 'bg-green-100 text-green-700' :
              obj.state.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              obj.state.severity === 'error' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {obj.state.name}
            </span>
          </div>
          <h4 className="font-medium text-gray-900 truncate">{obj.name}</h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{obj.description}</p>

          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Link2 size={12} />
              {obj.relations.length} 关系
            </span>
            <span className="flex items-center gap-1">
              <Zap size={12} />
              {obj.capabilities.length} 能力
            </span>
            <span className="flex items-center gap-1">
              <Shield size={12} />
              {obj.rules.length} 规则
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ObjectDetail: React.FC<{ obj: BusinessObject }> = ({ obj }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attributes' | 'relations' | 'rules'>('overview');
  const config = objectTypeConfig[obj.type];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <config.icon size={32} className={config.color} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500">{obj.id}</span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {config.label}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{obj.name}</h2>
            <p className="text-gray-600 mt-1">{obj.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            obj.state.severity === 'normal' ? 'bg-green-100 text-green-700' :
            obj.state.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
            obj.state.severity === 'error' ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            {obj.state.name}
          </span>
          <span className="text-sm text-gray-500">
            更新于 {new Date(obj.state.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { id: 'overview', label: '概览', icon: Activity },
          { id: 'attributes', label: '属性', icon: BarChart3 },
          { id: 'relations', label: '关系', icon: Link2 },
          { id: 'rules', label: '规则', icon: Shield }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">生命周期</h3>
              <div className="flex items-center gap-2">
                {obj.lifecycle.stages.map((stage, idx) => (
                  <React.Fragment key={stage.id}>
                    <div className={`px-3 py-2 rounded-lg text-sm ${
                      obj.currentLifecycleStage === stage.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      {stage.name}
                    </div>
                    {idx < obj.lifecycle.stages.length - 1 && (
                      <ChevronRight size={16} className="text-gray-300" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">关键属性</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(obj.attributes).slice(0, 4).map(([key, attr]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">{attr.name}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold text-gray-900">{attr.value}</span>
                      {attr.unit && <span className="text-sm text-gray-500">{attr.unit}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${attr.quality.freshness}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {attr.quality.freshness}% 新鲜度
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">能力</h3>
              <div className="flex flex-wrap gap-2">
                {obj.capabilities.map(cap => (
                  <span
                    key={cap.id}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    <Zap size={14} className="inline mr-1" />
                    {cap.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="space-y-3">
            {Object.entries(obj.attributes).map(([key, attr]) => (
              <div key={key} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{attr.name}</div>
                    <div className="text-xs text-gray-500">{key} · {attr.dataType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{attr.value}</div>
                    {attr.unit && <div className="text-xs text-gray-500">{attr.unit}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <div className="text-xs text-gray-500">新鲜度</div>
                    <div className="font-medium text-gray-900">{attr.quality.freshness}%</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <div className="text-xs text-gray-500">准确度</div>
                    <div className="font-medium text-gray-900">{attr.quality.accuracy}%</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <div className="text-xs text-gray-500">完整度</div>
                    <div className="font-medium text-gray-900">{attr.quality.completeness}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'relations' && (
          <div className="space-y-3">
            {obj.relations.map(rel => (
              <div key={rel.id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    rel.type === 'belongs_to' ? 'bg-purple-100 text-purple-700' :
                    rel.type === 'produces' ? 'bg-green-100 text-green-700' :
                    rel.type === 'consumes' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {rel.type === 'belongs_to' ? '属于' :
                     rel.type === 'produces' ? '生产' :
                     rel.type === 'consumes' ? '消耗' :
                     rel.type === 'triggers' ? '触发' :
                     rel.type === 'influences' ? '影响' : '引用'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{rel.targetObjectId}</div>
                    <div className="text-xs text-gray-500">{rel.targetObjectType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">关系强度</div>
                    <div className="font-medium text-gray-900">{(rel.strength * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-3">
            {obj.rules.map(rule => (
              <div key={rule.id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="font-medium text-gray-900">{rule.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    优先级: {rule.priority}
                  </span>
                </div>
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm font-mono text-gray-600">
                  IF {rule.trigger.condition} THEN {rule.actions.map(a => a.type).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BusinessObjectBrowser: React.FC = () => {
  const [selectedType, setSelectedType] = useState<BusinessObjectType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObject, setSelectedObject] = useState<BusinessObject | null>(null);

  const filteredObjects = MOCK_BUSINESS_OBJECTS.filter(obj => {
    const matchesType = selectedType === 'all' || obj.type === selectedType;
    const matchesSearch = searchQuery === '' ||
      obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const typeCounts = Object.fromEntries(
    Object.keys(objectTypeConfig).map(type => [
      type,
      MOCK_BUSINESS_OBJECTS.filter(obj => obj.type === type).length
    ])
  );

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">业务对象</h2>
            <button className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索对象..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedType === 'all'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Box size={18} />
            <span className="flex-1 text-left">全部对象</span>
            <span className="text-xs text-gray-400">{MOCK_BUSINESS_OBJECTS.length}</span>
          </button>

          <div className="mt-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">按类型</div>
            {Object.entries(objectTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as BusinessObjectType)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === type
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <config.icon size={18} className={config.color} />
                <span className="flex-1 text-left">{config.label}</span>
                <span className="text-xs text-gray-400">{typeCounts[type] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Object List */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">共 {filteredObjects.length} 个对象</span>
            <button className="p-1.5 text-gray-400 hover:text-gray-600">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {filteredObjects.map(obj => (
            <ObjectCard
              key={obj.id}
              obj={obj}
              isSelected={selectedObject?.id === obj.id}
              onClick={() => setSelectedObject(obj)}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 overflow-hidden">
        {selectedObject ? (
          <ObjectDetail obj={selectedObject} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Box size={48} className="mx-auto mb-4 opacity-50" />
              <p>选择一个业务对象查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessObjectBrowser;
