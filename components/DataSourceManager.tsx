import React, { useState, useEffect } from 'react';
import {
  Database, Server, Cloud, FileText, Settings, Plus,
  RefreshCw, CheckCircle, XCircle, Clock, ChevronRight,
  Table, Layers, Zap, Activity, Shield, Link as LinkIcon,
  Search, Filter, MoreVertical, Edit2, Trash2, Play,
  Pause, AlertCircle, BarChart3, Box
} from 'lucide-react';

// 数据源类型定义
interface DataSource {
  id: string;
  name: string;
  type: 'ERP' | 'MES' | 'PLM' | 'WMS' | 'IoT' | 'File' | 'Database';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  host: string;
  port: number;
  database?: string;
  description: string;
  lastSync?: string;
  tables?: DataTable[];
  syncFrequency: string;
  dataLayer: 'ODS' | 'DWD' | 'DWS' | 'ADS';
}

interface DataTable {
  id: string;
  name: string;
  schema: string;
  rowCount: number;
  size: string;
  lastUpdated: string;
  columns?: TableColumn[];
  tags?: string[];
}

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

// 模拟数据源数据
const MOCK_DATA_SOURCES: DataSource[] = [
  {
    id: 'erp-001',
    name: 'SAP ERP 生产系统',
    type: 'ERP',
    status: 'connected',
    host: 'erp.corp.local',
    port: 3300,
    database: 'SAPERP',
    description: '企业资源计划系统，包含订单、库存、财务数据',
    lastSync: '2024-03-15 14:30:00',
    syncFrequency: '每小时',
    dataLayer: 'ODS',
    tables: [
      { id: 't001', name: 'production_orders', schema: ' Manufacturing', rowCount: 1250000, size: '2.3 GB', lastUpdated: '2024-03-15', tags: ['订单', '生产'] },
      { id: 't002', name: 'material_master', schema: 'MasterData', rowCount: 45000, size: '180 MB', lastUpdated: '2024-03-14', tags: ['物料', '主数据'] },
      { id: 't003', name: 'inventory_movements', schema: 'Inventory', rowCount: 8900000, size: '15.2 GB', lastUpdated: '2024-03-15', tags: ['库存', '移动'] }
    ]
  },
  {
    id: 'mes-001',
    name: 'MES制造执行系统',
    type: 'MES',
    status: 'connected',
    host: 'mes.factory.local',
    port: 5432,
    database: 'MESDB',
    description: '制造执行系统，包含工艺参数、设备状态、质量数据',
    lastSync: '2024-03-15 14:35:00',
    syncFrequency: '实时',
    dataLayer: 'ODS',
    tables: [
      { id: 't101', name: 'equipment_status', schema: 'IoT', rowCount: 15600000, size: '28.5 GB', lastUpdated: '2024-03-15', tags: ['设备', 'IoT'] },
      { id: 't102', name: 'process_parameters', schema: 'Process', rowCount: 89000000, size: '156.3 GB', lastUpdated: '2024-03-15', tags: ['工艺', '参数'] },
      { id: 't103', name: 'quality_inspection', schema: 'Quality', rowCount: 2300000, size: '8.9 GB', lastUpdated: '2024-03-15', tags: ['质量', '检测'] }
    ]
  },
  {
    id: 'plm-001',
    name: 'Teamcenter PLM',
    type: 'PLM',
    status: 'syncing',
    host: 'plm.corp.local',
    port: 8080,
    description: '产品生命周期管理系统，包含BOM、工艺路线、设计数据',
    lastSync: '2024-03-15 13:00:00',
    syncFrequency: '每天',
    dataLayer: 'DWD',
    tables: [
      { id: 't201', name: 'bom_structure', schema: 'Engineering', rowCount: 125000, size: '520 MB', lastUpdated: '2024-03-15', tags: ['BOM', '结构'] },
      { id: 't202', name: 'process_routing', schema: 'Manufacturing', rowCount: 8900, size: '45 MB', lastUpdated: '2024-03-14', tags: ['工艺', '路线'] }
    ]
  },
  {
    id: 'wms-001',
    name: 'WMS仓储系统',
    type: 'WMS',
    status: 'connected',
    host: 'wms.warehouse.local',
    port: 1521,
    database: 'WMSPROD',
    description: '仓储管理系统，包含入库、出库、库存、物流数据',
    lastSync: '2024-03-15 14:40:00',
    syncFrequency: '每15分钟',
    dataLayer: 'ODS',
    tables: [
      { id: 't301', name: 'inbound_records', schema: 'Inbound', rowCount: 560000, size: '1.2 GB', lastUpdated: '2024-03-15', tags: ['入库'] },
      { id: 't302', name: 'outbound_records', schema: 'Outbound', rowCount: 480000, size: '1.1 GB', lastUpdated: '2024-03-15', tags: ['出库'] },
      { id: 't303', name: 'inventory_balance', schema: 'Inventory', rowCount: 120000, size: '350 MB', lastUpdated: '2024-03-15', tags: ['库存', '余额'] }
    ]
  },
  {
    id: 'iot-001',
    name: 'IoT设备数据采集',
    type: 'IoT',
    status: 'connected',
    host: 'mqtt.factory.local',
    port: 1883,
    description: 'IoT平台，实时采集设备传感器数据',
    lastSync: '2024-03-15 14:42:00',
    syncFrequency: '实时流式',
    dataLayer: 'ODS',
    tables: [
      { id: 't401', name: 'sensor_telemetry', schema: 'IoT', rowCount: 890000000, size: '1.2 TB', lastUpdated: '2024-03-15', tags: ['传感器', '遥测'] },
      { id: 't402', name: 'alarm_events', schema: 'Events', rowCount: 450000, size: '2.1 GB', lastUpdated: '2024-03-15', tags: ['告警', '事件'] }
    ]
  },
  {
    id: 'file-001',
    name: '生产报表文件',
    type: 'File',
    status: 'error',
    host: 'nas.corp.local',
    description: '生产日报、质量月报等Excel/PDF文件',
    lastSync: '2024-03-14 08:00:00',
    syncFrequency: '每天',
    dataLayer: 'ADS',
    tables: []
  }
];

// 数据源类型配置
const DATA_SOURCE_TYPES = [
  { type: 'ERP', icon: Box, color: 'bg-blue-500', label: 'ERP系统' },
  { type: 'MES', icon: Factory, color: 'bg-green-500', label: 'MES系统' },
  { type: 'PLM', icon: Layers, color: 'bg-purple-500', label: 'PLM系统' },
  { type: 'WMS', icon: Database, color: 'bg-orange-500', label: 'WMS系统' },
  { type: 'IoT', icon: Activity, color: 'bg-cyan-500', label: 'IoT平台' },
  { type: 'File', icon: FileText, color: 'bg-gray-500', label: '文件存储' },
  { type: 'Database', icon: Server, color: 'bg-indigo-500', label: '数据库' }
];

// 数据分层配置
const DATA_LAYERS = [
  { key: 'ODS', label: 'ODS', description: '原始数据', color: 'bg-gray-100 text-gray-600' },
  { key: 'DWD', label: 'DWD', description: '清洗数据', color: 'bg-blue-100 text-blue-600' },
  { key: 'DWS', label: 'DWS', description: '汇总数据', color: 'bg-green-100 text-green-600' },
  { key: 'ADS', label: 'ADS', description: '业务数据', color: 'bg-orange-100 text-orange-600' }
];

const DataSourceManager: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(MOCK_DATA_SOURCES);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [selectedTable, setSelectedTable] = useState<DataTable | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'lineage' | 'quality'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤数据源
  const filteredSources = dataSources.filter(source => {
    const matchType = filterType === 'all' || source.type === filterType;
    const matchSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       source.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-gray-400';
      case 'syncing': return 'bg-blue-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '已连接';
      case 'disconnected': return '已断开';
      case 'syncing': return '同步中';
      case 'error': return '异常';
      default: return '未知';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">数据源管理</h2>
          <p className="text-gray-500 mt-1">统一管理企业数据资产，对接ERP/MES/PLM等系统，构建Lakehouse数据架构</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl hover:bg-[#0051D5] flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
        >
          <Plus size={20} />
          添加数据源
        </button>
      </div>

      {/* 数据层架构说明 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {DATA_LAYERS.map((layer, index) => (
          <div key={layer.key} className={`p-4 rounded-xl ${layer.color} bg-opacity-20`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${layer.color} bg-opacity-20 flex items-center justify-center`}>
                <Database size={16} />
              </div>
              <span className="font-semibold">{layer.label}</span>
            </div>
            <p className="text-sm text-gray-600">{layer.description}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* 左侧数据源列表 */}
        <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          {/* 搜索和过滤 */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索数据源..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterType === 'all' ? 'bg-[#007AFF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {DATA_SOURCE_TYPES.slice(0, 5).map(({ type, color, label }) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterType === type ? `${color} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 数据源列表 */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredSources.map((source) => {
              const typeConfig = DATA_SOURCE_TYPES.find(t => t.type === source.type);
              const Icon = typeConfig?.icon || Database;
              return (
                <div
                  key={source.id}
                  onClick={() => { setSelectedSource(source); setSelectedTable(null); }}
                  className={`p-4 rounded-xl cursor-pointer transition-all mb-2 ${
                    selectedSource?.id === source.id
                      ? 'bg-[#007AFF]/10 border border-[#007AFF]/20'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${typeConfig?.color || 'bg-gray-500'} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={typeConfig?.color.replace('bg-', 'text-') || 'text-gray-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{source.name}</h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{source.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {source.syncFrequency}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-100">
                          {source.tables?.length || 0} 表
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          DATA_LAYERS.find(l => l.key === source.dataLayer)?.color
                        }`}>
                          {source.dataLayer}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 统计信息 */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{dataSources.length}</div>
                <div className="text-xs text-gray-500">数据源</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {dataSources.filter(s => s.status === 'connected').length}
                </div>
                <div className="text-xs text-gray-500">已连接</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {dataSources.reduce((acc, s) => acc + (s.tables?.length || 0), 0)}
                </div>
                <div className="text-xs text-gray-500">数据表</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧详情面板 */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {selectedSource ? (
            <>
              {/* 详情头部 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {(() => {
                      const typeConfig = DATA_SOURCE_TYPES.find(t => t.type === selectedSource.type);
                      const Icon = typeConfig?.icon || Database;
                      return (
                        <div className={`w-14 h-14 rounded-2xl ${typeConfig?.color || 'bg-gray-500'} bg-opacity-10 flex items-center justify-center`}>
                          <Icon size={28} className={typeConfig?.color.replace('bg-', 'text-') || 'text-gray-600'} />
                        </div>
                      );
                    })()}
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">{selectedSource.name}</h2>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                          selectedSource.status === 'connected' ? 'bg-green-100 text-green-700' :
                          selectedSource.status === 'error' ? 'bg-red-100 text-red-700' :
                          selectedSource.status === 'syncing' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {selectedSource.status === 'connected' && <CheckCircle size={12} />}
                          {selectedSource.status === 'error' && <XCircle size={12} />}
                          {selectedSource.status === 'syncing' && <RefreshCw size={12} className="animate-spin" />}
                          {getStatusText(selectedSource.status)}
                        </span>
                      </div>
                      <p className="text-gray-500 mt-1">{selectedSource.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Server size={14} />
                          {selectedSource.host}:{selectedSource.port}
                        </span>
                        {selectedSource.database && (
                          <span className="flex items-center gap-1">
                            <Database size={14} />
                            {selectedSource.database}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          上次同步: {selectedSource.lastSync}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#007AFF] text-white rounded-lg text-sm font-medium hover:bg-[#0051D5] flex items-center gap-2">
                      <RefreshCw size={16} />
                      立即同步
                    </button>
                    <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                      <Settings size={16} />
                      配置
                    </button>
                  </div>
                </div>

                {/* Tab导航 */}
                <div className="flex gap-6 mt-6">
                  {[
                    { key: 'overview', label: '概览', icon: BarChart3 },
                    { key: 'tables', label: '数据表', icon: Table },
                    { key: 'lineage', label: '数据血缘', icon: LinkIcon },
                    { key: 'quality', label: '数据质量', icon: Shield }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                        activeTab === key
                          ? 'border-[#007AFF] text-[#007AFF]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab内容 */}
              <div className="flex-1 overflow-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* 数据集成概览 */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedSource.tables?.reduce((acc, t) => acc + t.rowCount, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">总记录数</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedSource.tables?.length || 0}
                        </div>
                        <div className="text-sm text-gray-500">数据表</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {(() => {
                            const totalSize = selectedSource.tables?.reduce((acc, t) => {
                              const size = parseFloat(t.size);
                              return acc + (t.size.includes('TB') ? size * 1024 : t.size.includes('GB') ? size : size / 1024);
                            }, 0) || 0;
                            return totalSize > 1024 ? `${(totalSize / 1024).toFixed(1)} TB` : `${totalSize.toFixed(1)} GB`;
                          })()}
                        </div>
                        <div className="text-sm text-gray-500">存储大小</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-gray-900">{selectedSource.syncFrequency}</div>
                        <div className="text-sm text-gray-500">同步频率</div>
                      </div>
                    </div>

                    {/* 应用场景说明 */}
                    <div className="bg-blue-50 rounded-xl p-5">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Zap size={18} />
                        应用场景
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">技能中心</h5>
                          <p className="text-sm text-gray-600">
                            为{selectedSource.type}技能提供实时数据输入，如
                            {selectedSource.type === 'MES' && '设备健康监测、工艺参数优化'}
                            {selectedSource.type === 'ERP' && '需求预测、库存优化'}
                            {selectedSource.type === 'PLM' && 'BOM结构分析、工艺路线优化'}
                            {selectedSource.type === 'WMS' && '仓储效率分析、物流路径优化'}
                            {selectedSource.type === 'IoT' && '预测性维护、异常检测'}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">业务场景推演</h5>
                          <p className="text-sm text-gray-600">
                            支持产销协同、产能评估等推演场景的数据需求，
                            提供{selectedSource.dataLayer}层数据服务
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 最近同步表 */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">最近更新的表</h4>
                      <div className="space-y-2">
                        {selectedSource.tables?.slice(0, 3).map((table) => (
                          <div
                            key={table.id}
                            onClick={() => setSelectedTable(table)}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Table size={18} className="text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">{table.name}</div>
                                <div className="text-xs text-gray-500">{table.schema} · {table.rowCount.toLocaleString()} 行</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{table.size}</span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {table.lastUpdated}
                              </span>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tables' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">数据表列表</h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1">
                          <Filter size={14} />
                          筛选
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedSource.tables?.map((table) => (
                        <div
                          key={table.id}
                          onClick={() => setSelectedTable(table)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedTable?.id === table.id
                              ? 'border-[#007AFF] bg-[#007AFF]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Table size={20} className="text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{table.name}</div>
                                <div className="text-xs text-gray-500">{table.schema}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <div className="text-right">
                                <div className="font-medium text-gray-900">{table.rowCount.toLocaleString()}</div>
                                <div className="text-xs">行数</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">{table.size}</div>
                                <div className="text-xs">大小</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">{table.lastUpdated}</div>
                                <div className="text-xs">更新</div>
                              </div>
                            </div>
                          </div>
                          {table.tags && (
                            <div className="flex gap-2 mt-3">
                              {table.tags.map((tag, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'lineage' && (
                  <div className="text-center py-12 text-gray-500">
                    <LinkIcon size={48} className="mx-auto mb-4 opacity-30" />
                    <p>数据血缘图谱功能开发中...</p>
                    <p className="text-sm mt-2">将展示数据从ODS到ADS的流转路径</p>
                  </div>
                )}

                {activeTab === 'quality' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">98.5%</div>
                        <div className="text-sm text-green-700">数据完整性</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">99.2%</div>
                        <div className="text-sm text-blue-700">数据准确性</div>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-orange-600">2</div>
                        <div className="text-sm text-orange-700">异常告警</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">质量规则检查</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle size={18} className="text-green-600" />
                            <span className="text-sm">主键唯一性约束</span>
                          </div>
                          <span className="text-xs text-green-600">通过</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle size={18} className="text-green-600" />
                            <span className="text-sm">非空字段检查</span>
                          </div>
                          <span className="text-xs text-green-600">通过</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertCircle size={18} className="text-orange-600" />
                            <span className="text-sm">时间戳连续性</span>
                          </div>
                          <span className="text-xs text-orange-600">警告: 发现3个断点</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Database size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">请从左侧选择一个数据源</p>
                <p className="text-sm mt-2">查看数据表、血缘关系和数据质量</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加数据源模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">添加数据源</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <XCircle size={20} className="text-gray-400" />
                </button>
              </div>
              <p className="text-gray-500 mt-1">配置与企业系统的数据连接</p>
            </div>
            <div className="p-6">
              {/* 数据源类型选择 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">数据源类型</label>
                <div className="grid grid-cols-4 gap-3">
                  {DATA_SOURCE_TYPES.map(({ type, icon: Icon, color, label }) => (
                    <button
                      key={type}
                      className="p-4 rounded-xl border border-gray-200 hover:border-[#007AFF] hover:bg-[#007AFF]/5 transition-all text-center"
                    >
                      <div className={`w-10 h-10 rounded-lg ${color} bg-opacity-10 flex items-center justify-center mx-auto mb-2`}>
                        <Icon size={20} className={color.replace('bg-', 'text-')} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 连接配置 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数据源名称</label>
                  <input
                    type="text"
                    placeholder="例如：生产MES系统"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">主机地址</label>
                    <input
                      type="text"
                      placeholder="例如：mes.factory.local"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">端口</label>
                    <input
                      type="number"
                      placeholder="5432"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数据库名</label>
                  <input
                    type="text"
                    placeholder="例如：MESDB"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>
                </div>

                {/* 数据层选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">数据分层</label>
                  <div className="grid grid-cols-4 gap-3">
                    {DATA_LAYERS.map((layer) => (
                      <label
                        key={layer.key}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
                      >
                        <input type="radio" name="dataLayer" className="text-[#007AFF]" />
                        <div>
                          <div className="font-medium text-sm">{layer.label}</div>
                          <div className="text-xs text-gray-500">{layer.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium"
              >
                取消
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl hover:bg-[#0051D5] font-medium"
              >
                测试连接并保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceManager;
