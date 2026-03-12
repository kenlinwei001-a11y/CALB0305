import React, { useState, useEffect } from 'react';
import {
  Database, Server, Cloud, FileText, Settings, Plus,
  RefreshCw, CheckCircle, XCircle, Clock, ChevronRight,
  Table, Layers, Zap, Activity, Shield, Link as LinkIcon,
  Search, Filter, MoreVertical, Edit2, Trash2, Play,
  Pause, AlertCircle, BarChart3, Box, Factory, Network, Atom,
  Users, Truck, Key, Info, X
} from 'lucide-react';

// 数据源类型定义
interface DataSource {
  id: string;
  name: string;
  type: 'ERP' | 'MES' | 'PLM' | 'WMS' | 'CRM' | 'SCM' | 'IoT' | 'File' | 'Database';
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
    id: 'crm-001',
    name: 'Salesforce CRM',
    type: 'CRM',
    status: 'connected',
    host: 'crm.corp.local',
    port: 443,
    database: 'CRMDB',
    description: '客户关系管理系统，包含客户信息、销售机会、合同数据、服务工单',
    lastSync: '2024-03-15 14:45:00',
    syncFrequency: '每30分钟',
    dataLayer: 'DWD',
    tables: [
      { id: 't501', name: 'customer_master', schema: 'Sales', rowCount: 8500, size: '420 MB', lastUpdated: '2024-03-15', tags: ['客户', '主数据'] },
      { id: 't502', name: 'sales_opportunities', schema: 'Sales', rowCount: 12500, size: '680 MB', lastUpdated: '2024-03-15', tags: ['销售', '机会'] },
      { id: 't503', name: 'service_tickets', schema: 'Service', rowCount: 45000, size: '1.8 GB', lastUpdated: '2024-03-15', tags: ['服务', '工单'] },
      { id: 't504', name: 'customer_forecasts', schema: 'Planning', rowCount: 3600, size: '120 MB', lastUpdated: '2024-03-15', tags: ['预测', '需求'] }
    ]
  },
  {
    id: 'scm-001',
    name: 'Oracle SCM供应链系统',
    type: 'SCM',
    status: 'connected',
    host: 'scm.corp.local',
    port: 1521,
    database: 'SCMPROD',
    description: '供应链管理系统，包含采购、供应商、物流、需求计划数据',
    lastSync: '2024-03-15 14:50:00',
    syncFrequency: '每小时',
    dataLayer: 'DWD',
    tables: [
      { id: 't601', name: 'purchase_orders', schema: 'Procurement', rowCount: 890000, size: '4.2 GB', lastUpdated: '2024-03-15', tags: ['采购', '订单'] },
      { id: 't602', name: 'supplier_master', schema: 'MasterData', rowCount: 3200, size: '180 MB', lastUpdated: '2024-03-14', tags: ['供应商', '主数据'] },
      { id: 't603', name: 'demand_plans', schema: 'Planning', rowCount: 156000, size: '890 MB', lastUpdated: '2024-03-15', tags: ['需求', '计划'] },
      { id: 't604', name: 'logistics_routes', schema: 'Logistics', rowCount: 12000, size: '320 MB', lastUpdated: '2024-03-14', tags: ['物流', '路线'] }
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
  { type: 'CRM', icon: Users, color: 'bg-pink-500', label: 'CRM系统' },
  { type: 'SCM', icon: Truck, color: 'bg-teal-500', label: 'SCM系统' },
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
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'lineage' | 'quality' | 'ontology'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOntologyMappingModal, setShowOntologyMappingModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
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
      {/* 紧凑的页面标题 + 数据层架构 */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">数据源管理</h2>
            <p className="text-xs text-gray-500 mt-0.5">统一数据资产管理 · Lakehouse架构</p>
          </div>
          {/* 紧凑的数据层标签 */}
          <div className="flex items-center gap-2">
            {DATA_LAYERS.map((layer) => (
              <div key={layer.key} className={`px-3 py-1.5 rounded-lg ${layer.color} bg-opacity-30 flex items-center gap-1.5`}>
                <span className="text-xs font-semibold">{layer.label}</span>
                <span className="text-[10px] opacity-70">{layer.description}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051D5] flex items-center gap-1.5 transition-all duration-200 shadow-sm text-sm font-medium"
        >
          <Plus size={16} />
          添加数据源
        </button>
      </div>

      {/* 统计概览卡片 - 水平排列 */}
      <div className="flex gap-3 mb-4 shrink-0">
        <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Database size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{dataSources.length}</div>
            <div className="text-xs text-gray-500">数据源总数</div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">{dataSources.filter(s => s.status === 'connected').length}</div>
            <div className="text-xs text-gray-500">已连接</div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Table size={20} className="text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">{dataSources.reduce((acc, s) => acc + (s.tables?.length || 0), 0)}</div>
            <div className="text-xs text-gray-500">数据表总数</div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Activity size={20} className="text-orange-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-orange-600">
              {(() => {
                const totalSize = dataSources.reduce((acc, s) => {
                  return acc + (s.tables?.reduce((tacc, t) => {
                    const size = parseFloat(t.size);
                    return tacc + (t.size.includes('TB') ? size * 1024 : t.size.includes('GB') ? size : size / 1024);
                  }, 0) || 0);
                }, 0);
                return totalSize > 1024 ? `${(totalSize / 1024).toFixed(1)}TB` : `${totalSize.toFixed(0)}GB`;
              })()}
            </div>
            <div className="text-xs text-gray-500">总存储量</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
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
                    { key: 'ontology', label: '本体映射', icon: Network },
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

                {activeTab === 'ontology' && (
                  <div className="space-y-6">
                    {/* 本体映射概览 */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Atom size={20} className="text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">原子本体映射</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">
                          {selectedSource.tables?.reduce((acc, t) => acc + (t.columns?.length || 3), 0) || 0}
                        </div>
                        <div className="text-xs text-blue-600">字段映射数</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers size={20} className="text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">业务语义</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-700">
                          {selectedSource.type === 'ERP' ? 8 : selectedSource.type === 'MES' ? 12 : selectedSource.type === 'PLM' ? 6 : 4}
                        </div>
                        <div className="text-xs text-purple-600">关联场景数</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Network size={20} className="text-green-600" />
                          <span className="text-sm font-medium text-green-900">覆盖率</span>
                        </div>
                        <div className="text-2xl font-bold text-green-700">87%</div>
                        <div className="text-xs text-green-600">本体对齐度</div>
                      </div>
                    </div>

                    {/* 数据表-本体映射 */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">数据表与本体映射关系</h4>
                        <button
                          onClick={() => setShowOntologyMappingModal(true)}
                          className="px-3 py-1.5 bg-[#007AFF] text-white rounded-lg text-sm hover:bg-[#0051D5]"
                        >
                          + 添加映射
                        </button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {selectedSource.tables?.map((table) => (
                          <div key={table.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Table size={18} className="text-gray-400" />
                                <span className="font-medium text-gray-900">{table.name}</span>
                                <span className="text-xs text-gray-400">({table.schema})</span>
                              </div>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {table.tags?.join(' · ') || '未分类'}
                              </span>
                            </div>
                            {/* 字段-本体映射 */}
                            <div className="ml-6 space-y-2">
                              {[
                                { field: 'timestamp', atom: 'atom_timestamp', type: '时间戳', desc: '记录创建时间' },
                                { field: 'line_id', atom: 'atom_production_line', type: '生产线', desc: '生产线编号' },
                                { field: 'product_code', atom: 'atom_product_model', type: '产品型号', desc: '产品编码' }
                              ].slice(0, selectedSource.type === 'MES' ? 3 : 2).map((mapping, idx) => (
                                <div key={idx} className="flex items-center gap-4 text-sm">
                                  <div className="w-32 text-gray-600">{mapping.field}</div>
                                  <div className="flex-1 flex items-center gap-2">
                                    <span className="text-gray-400">→</span>
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                      {mapping.atom}
                                    </span>
                                    <span className="text-gray-500">{mapping.type}</span>
                                  </div>
                                  <span className="text-xs text-gray-400">{mapping.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 业务语义关联 */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h4 className="font-semibold text-gray-900 mb-4">关联业务语义场景</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: '产能利用率分析', category: '生产类', atoms: ['atom_capacity', 'atom_oee', 'atom_throughput'], description: '分析生产线产能利用情况，识别瓶颈工序，优化资源配置', relatedTables: ['equipment_status', 'process_parameters', 'production_orders'] },
                          { name: '库存周转优化', category: '库存类', atoms: ['atom_inventory', 'atom_turnover', 'atom_safety_stock'], description: '优化库存水平，降低库存成本，提高资金周转效率', relatedTables: ['inventory_movements', 'inventory_balance', 'material_master'] },
                          { name: '质量追溯分析', category: '质量类', atoms: ['atom_yield_rate', 'atom_defect_rate', 'atom_quality_score'], description: '追溯产品质量问题根源，分析不良原因，提升产品质量', relatedTables: ['quality_inspection', 'process_parameters', 'alarm_events'] },
                          { name: '需求预测', category: '销售类', atoms: ['atom_demand_forecast', 'atom_order_quantity', 'atom_delivery_date'], description: '基于历史数据和市场趋势预测未来需求，指导生产计划', relatedTables: ['production_orders', 'customer_forecasts', 'sales_opportunities'] }
                        ].slice(0, selectedSource.type === 'ERP' ? 4 : selectedSource.type === 'MES' ? 3 : 2).map((scenario, idx) => (
                          <div
                            key={idx}
                            onClick={() => { setSelectedScenario(scenario); setShowScenarioModal(true); }}
                            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{scenario.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{scenario.category}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {scenario.atoms.map((atom) => (
                                <span key={atom} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                  {atom}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 本体层次归属 */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-900 mb-4">本体层次归属</h4>
                      <div className="flex items-center gap-4">
                        {[
                          { level: 'L1', name: '原子本体', desc: '不可再分的基础业务语义', count: 36, active: true },
                          { level: 'L2', name: '子系统', desc: '功能模块组合', count: 8, active: true },
                          { level: 'L3', name: '工艺流程', desc: '制造过程定义', count: 12, active: selectedSource.type !== 'File' },
                          { level: 'L4', name: '参数定义', desc: '具体操作参数', count: 48, active: selectedSource.type === 'MES' || selectedSource.type === 'IoT' }
                        ].map((layer, idx, arr) => (
                          <React.Fragment key={layer.level}>
                            <div className={`flex-1 p-3 rounded-lg border-2 ${layer.active ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                              <div className="text-xs font-bold text-gray-400 mb-1">{layer.level}</div>
                              <div className="font-semibold text-gray-900 text-sm">{layer.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{layer.desc}</div>
                              <div className="text-lg font-bold text-blue-600 mt-2">{layer.count}</div>
                            </div>
                            {idx < arr.length - 1 && (
                              <ChevronRight size={20} className="text-gray-300" />
                            )}
                          </React.Fragment>
                        ))}
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

      {/* Palantir风格本体映射配置弹窗 */}
      {showOntologyMappingModal && selectedSource && (
        <OntologyMappingModal
          isOpen={showOntologyMappingModal}
          onClose={() => setShowOntologyMappingModal(false)}
          dataSource={selectedSource}
        />
      )}

      {/* 业务语义场景详情弹窗 */}
      <ScenarioModal
        isOpen={showScenarioModal}
        onClose={() => setShowScenarioModal(false)}
        scenario={selectedScenario}
        dataSource={selectedSource}
      />
    </div>
  );
};

// Palantir风格本体映射配置弹窗组件
interface OntologyMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSource: DataSource;
}

const OntologyMappingModal: React.FC<OntologyMappingModalProps> = ({ isOpen, onClose, dataSource }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTable, setSelectedTable] = useState<DataTable | null>(dataSource.tables?.[0] || null);
  const [selectedObjectType, setSelectedObjectType] = useState('');
  const [propertyMappings, setPropertyMappings] = useState<Array<{source: string, target: string, transform?: string}>>([]);
  const [primaryKey, setPrimaryKey] = useState('');
  const [links, setLinks] = useState<Array<{targetObject: string; linkType: string; sourceProp: string; targetProp: string}>>([]);

  // Palantir风格的本体对象类型
  const objectTypes = [
    { id: 'ProductionLine', name: '生产线', category: '制造', description: '物理生产线实体', icon: Factory },
    { id: 'Equipment', name: '设备', category: '制造', description: '生产设备资产', icon: Settings },
    { id: 'Product', name: '产品', category: '物料', description: '产品型号/SKU', icon: Box },
    { id: 'Material', name: '物料', category: '物料', description: '原材料/半成品', icon: Layers },
    { id: 'WorkOrder', name: '工单', category: '生产', description: '生产作业指令', icon: FileText },
    { id: 'QualityRecord', name: '质量记录', category: '质量', description: '检测/检验记录', icon: Shield },
    { id: 'Customer', name: '客户', category: '销售', description: '客户实体', icon: Users },
    { id: 'Supplier', name: '供应商', category: '采购', description: '供应商实体', icon: Truck },
    { id: 'Inventory', name: '库存', category: '仓储', description: '库存记录', icon: Database },
    { id: 'SensorData', name: '传感器数据', category: 'IoT', description: '设备传感器读数', icon: Activity },
  ];

  // 本体属性定义
  const objectTypeProperties: Record<string, Array<{name: string, type: string; description: string; required: boolean}>> = {
    ProductionLine: [
      { name: 'lineId', type: 'string', description: '生产线唯一标识', required: true },
      { name: 'lineName', type: 'string', description: '生产线名称', required: true },
      { name: 'capacity', type: 'number', description: '产能(GWh/年)', required: false },
      { name: 'oee', type: 'number', description: '设备综合效率', required: false },
      { name: 'status', type: 'string', description: '运行状态', required: true },
      { name: 'location', type: 'string', description: '所属基地', required: true },
    ],
    Equipment: [
      { name: 'equipmentId', type: 'string', description: '设备编号', required: true },
      { name: 'equipmentName', type: 'string', description: '设备名称', required: true },
      { name: 'model', type: 'string', description: '型号', required: false },
      { name: 'manufacturer', type: 'string', description: '制造商', required: false },
      { name: 'installDate', type: 'timestamp', description: '安装日期', required: false },
      { name: 'healthScore', type: 'number', description: '健康评分', required: false },
    ],
    Product: [
      { name: 'productCode', type: 'string', description: '产品编码', required: true },
      { name: 'productName', type: 'string', description: '产品名称', required: true },
      { name: 'specification', type: 'string', description: '规格', required: false },
      { name: 'category', type: 'string', description: '类别', required: true },
      { name: 'unitPrice', type: 'number', description: '单价', required: false },
    ],
    WorkOrder: [
      { name: 'orderId', type: 'string', description: '工单号', required: true },
      { name: 'productCode', type: 'string', description: '产品编码', required: true },
      { name: 'plannedQty', type: 'number', description: '计划数量', required: true },
      { name: 'actualQty', type: 'number', description: '实际数量', required: false },
      { name: 'startTime', type: 'timestamp', description: '开始时间', required: false },
      { name: 'endTime', type: 'timestamp', description: '结束时间', required: false },
      { name: 'status', type: 'string', description: '工单状态', required: true },
    ],
    QualityRecord: [
      { name: 'recordId', type: 'string', description: '记录ID', required: true },
      { name: 'inspectionType', type: 'string', description: '检验类型', required: true },
      { name: 'batchNo', type: 'string', description: '批次号', required: true },
      { name: 'result', type: 'string', description: '检验结果', required: true },
      { name: 'defectRate', type: 'number', description: '不良率', required: false },
      { name: 'inspector', type: 'string', description: '检验员', required: false },
    ],
  };

  // 链接类型定义
  const linkTypes = [
    { id: 'produces', name: '生产', description: '生产线生产产品' },
    { id: 'contains', name: '包含', description: '生产线包含设备' },
    { id: 'feeds', name: '供应', description: '物料供应生产线' },
    { id: 'assigned_to', name: '分配至', description: '工单分配至生产线' },
    { id: 'inspects', name: '检验', description: '质量记录检验工单' },
    { id: 'orders', name: '订购', description: '客户订购产品' },
    { id: 'supplies', name: '供货', description: '供应商供货物料' },
  ];

  // 模拟源表字段
  const sourceFields = selectedTable ? [
    { name: 'id', type: 'bigint', nullable: false, sample: '10001' },
    { name: 'code', type: 'varchar(50)', nullable: false, sample: 'LINE-001' },
    { name: 'name', type: 'varchar(100)', nullable: false, sample: '一号生产线' },
    { name: 'capacity', type: 'decimal(10,2)', nullable: true, sample: '5.5' },
    { name: 'status', type: 'varchar(20)', nullable: false, sample: 'running' },
    { name: 'location', type: 'varchar(50)', nullable: true, sample: '常州基地' },
    { name: 'created_at', type: 'timestamp', nullable: false, sample: '2024-01-15 08:30:00' },
    { name: 'updated_at', type: 'timestamp', nullable: true, sample: '2024-03-15 14:20:00' },
  ] : [];

  const steps = [
    { id: 1, name: '选择对象类型', description: '定义映射的目标本体对象' },
    { id: 2, name: '属性映射', description: '配置字段与属性的对应关系' },
    { id: 3, name: '主键与链接', description: '设置标识和对象关系' },
    { id: 4, name: '验证与发布', description: '检查映射配置并发布' },
  ];

  const currentProperties = objectTypeProperties[selectedObjectType] || [];

  const handleAddLink = () => {
    setLinks([...links, { targetObject: '', linkType: '', sourceProp: '', targetProp: '' }]);
  };

  const handleUpdateLink = (index: number, field: string, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Network size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">本体映射配置</h3>
              <p className="text-xs text-gray-500">Palantir Ontology Mapping Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* 步骤导航 */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep === step.id ? 'bg-[#007AFF] text-white' :
                    currentStep > step.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? <CheckCircle size={16} /> : step.id}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className={`text-sm font-medium ${currentStep === step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          {/* Step 1: 选择对象类型 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Info size={18} />
                  选择数据源表和目标本体对象类型
                </h4>
                <p className="text-sm text-blue-700">
                  将 <strong>{dataSource.name}</strong> 的数据表映射到平台本体模型中的对象类型。对象类型定义了业务实体的结构和行为。
                </p>
              </div>

              {/* 数据表选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">选择数据表</label>
                <div className="grid grid-cols-3 gap-3">
                  {dataSource.tables?.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTable?.id === table.id
                          ? 'border-[#007AFF] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Table size={18} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{table.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">{table.rowCount.toLocaleString()} 行 · {table.size}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 对象类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">选择目标对象类型</label>
                <div className="grid grid-cols-2 gap-3">
                  {objectTypes.map((obj) => {
                    const Icon = obj.icon;
                    return (
                      <button
                        key={obj.id}
                        onClick={() => setSelectedObjectType(obj.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedObjectType === obj.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedObjectType === obj.id ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{obj.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{obj.category}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{obj.description}</div>
                            <div className="text-xs text-purple-600 mt-1 font-mono">{obj.id}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 属性映射 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <h4 className="font-semibold text-purple-900 mb-2">配置属性映射</h4>
                <p className="text-sm text-purple-700">
                  将数据源字段映射到本体对象的属性。必填属性必须映射，选填属性可选择性映射。
                </p>
              </div>

              {/* 源字段预览 */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Database size={16} className="text-gray-400" />
                    源数据字段
                  </h5>
                  <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">字段名</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">类型</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">示例</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sourceFields.map((field) => (
                          <tr key={field.name} className="hover:bg-white">
                            <td className="px-3 py-2 font-mono text-xs">{field.name}</td>
                            <td className="px-3 py-2 text-xs text-gray-500">{field.type}</td>
                            <td className="px-3 py-2 text-xs text-gray-400">{field.sample}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Box size={16} className="text-gray-400" />
                    目标本体属性
                  </h5>
                  <div className="space-y-2">
                    {currentProperties.map((prop) => (
                      <div key={prop.name} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-purple-700">{prop.name}</span>
                            {prop.required && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">必填</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{prop.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{prop.description}</p>
                        <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option value="">选择源字段...</option>
                          {sourceFields.map((f) => (
                            <option key={f.name} value={f.name}>{f.name} ({f.type})</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 转换规则 */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3">数据转换规则 (Transformations)</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-2">
                      <option>字段转换</option>
                      <option>条件映射</option>
                      <option>聚合计算</option>
                    </select>
                    <input
                      type="text"
                      placeholder="例如: UPPER(line_code)"
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2"
                    />
                    <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
                      添加
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 主键与链接 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <h4 className="font-semibold text-green-900 mb-2">配置主键和对象关系</h4>
                <p className="text-sm text-green-700">
                  定义对象的主键（唯一标识）和与其他对象类型的关系链接。
                </p>
              </div>

              {/* 主键配置 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Key size={16} className="text-gray-400" />
                  主键配置 (Primary Key)
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">主键字段</label>
                    <select
                      value={primaryKey}
                      onChange={(e) => setPrimaryKey(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">选择主键字段...</option>
                      {sourceFields.map((f) => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">主键生成策略</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option>使用源字段值</option>
                      <option>UUID自动生成</option>
                      <option>复合主键</option>
                      <option>哈希生成</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 链接关系 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-gray-900 flex items-center gap-2">
                    <LinkIcon size={16} className="text-gray-400" />
                    对象链接关系 (Object Links)
                  </h5>
                  <button
                    onClick={handleAddLink}
                    className="px-3 py-1.5 bg-[#007AFF] text-white rounded-lg text-sm hover:bg-[#0051D5]"
                  >
                    + 添加链接
                  </button>
                </div>

                <div className="space-y-3">
                  {links.map((link, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="grid grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">目标对象</label>
                          <select
                            value={link.targetObject}
                            onChange={(e) => handleUpdateLink(index, 'targetObject', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                          >
                            <option value="">选择对象...</option>
                            {objectTypes.map((obj) => (
                              <option key={obj.id} value={obj.id}>{obj.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">关系类型</label>
                          <select
                            value={link.linkType}
                            onChange={(e) => handleUpdateLink(index, 'linkType', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                          >
                            <option value="">选择关系...</option>
                            {linkTypes.map((lt) => (
                              <option key={lt.id} value={lt.id}>{lt.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">源属性</label>
                          <select
                            value={link.sourceProp}
                            onChange={(e) => handleUpdateLink(index, 'sourceProp', e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                          >
                            <option value="">选择属性...</option>
                            {currentProperties.map((p) => (
                              <option key={p.name} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">目标属性</label>
                            <input
                              type="text"
                              value={link.targetProp}
                              onChange={(e) => handleUpdateLink(index, 'targetProp', e.target.value)}
                              placeholder="如: lineId"
                              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveLink(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {links.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <LinkIcon size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">暂无链接关系，点击上方按钮添加</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 反向链接 */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3">反向链接 (Reverse Links)</h5>
                <p className="text-xs text-gray-500 mb-3">自动生成从目标对象到本对象的反向引用</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#007AFF]" defaultChecked />
                  <span className="text-sm text-gray-700">启用反向链接</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: 验证与发布 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <h4 className="font-semibold text-orange-900 mb-2">验证映射配置</h4>
                <p className="text-sm text-orange-700">
                  在发布前验证所有配置是否正确。系统将检查必填字段映射、主键唯一性、链接有效性等。
                </p>
              </div>

              {/* 验证结果 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle size={20} className="text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-900">对象类型配置</div>
                    <div className="text-sm text-green-700">已选择对象类型: {objectTypes.find(o => o.id === selectedObjectType)?.name || '未选择'}</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded">通过</span>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle size={20} className="text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-900">属性映射</div>
                    <div className="text-sm text-green-700">已映射 {currentProperties.filter(p => p.required).length} 个必填属性</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded">通过</span>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <AlertCircle size={20} className="text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-900">主键配置</div>
                    <div className="text-sm text-blue-700">{primaryKey ? `主键字段: ${primaryKey}` : '请配置主键字段'}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${primaryKey ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                    {primaryKey ? '通过' : '待配置'}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <LinkIcon size={20} className="text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">链接关系</div>
                    <div className="text-sm text-gray-500">已配置 {links.length} 个对象链接</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">可选</span>
                </div>
              </div>

              {/* 预览 */}
              <div className="bg-gray-900 rounded-xl p-4 overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 font-mono">MAPPING_PREVIEW.json</span>
                  <span className="text-xs text-gray-500">Preview</span>
                </div>
                <pre className="text-xs text-green-400 font-mono">
{JSON.stringify({
  mappingId: `map_${Date.now()}`,
  dataSource: dataSource.id,
  sourceTable: selectedTable?.name,
  targetObjectType: selectedObjectType,
  primaryKey: {
    sourceField: primaryKey,
    strategy: 'SOURCE_VALUE'
  },
  properties: currentProperties.map(p => ({
    ontologyProperty: p.name,
    sourceField: p.name.toLowerCase(),
    required: p.required
  })),
  links: links.map(l => ({
    targetObject: l.targetObject,
    linkType: l.linkType,
    foreignKey: {
      source: l.sourceProp,
      target: l.targetProp
    }
  })),
  createdAt: new Date().toISOString()
}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            className={`px-5 py-2.5 rounded-xl font-medium ${
              currentStep === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            disabled={currentStep === 1}
          >
            上一步
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-medium"
            >
              取消
            </button>
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl hover:bg-[#0051D5] font-medium"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={() => {
                  alert('本体映射配置已保存！');
                  onClose();
                }}
                className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <CheckCircle size={18} />
                发布映射
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 业务语义场景详情弹窗组件
interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: any;
  dataSource: DataSource | null;
}

const ScenarioModal: React.FC<ScenarioModalProps> = ({ isOpen, onClose, scenario, dataSource }) => {
  if (!isOpen || !scenario) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{scenario.name}</h3>
              <p className="text-xs text-gray-500">业务语义场景详情</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">场景类别</div>
              <div className="font-semibold text-gray-900">{scenario.category}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">关联数据源</div>
              <div className="font-semibold text-gray-900">{dataSource?.name || '-'}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">原子语义数量</div>
              <div className="font-semibold text-purple-600">{scenario.atoms?.length || 0} 个</div>
            </div>
          </div>

          {/* 场景描述 */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Info size={18} />
              场景描述
            </h4>
            <p className="text-sm text-blue-700 leading-relaxed">{scenario.description}</p>
          </div>

          {/* 引用的原子语义 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Atom size={18} className="text-purple-500" />
              引用的原子业务语义
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {scenario.atoms?.map((atom: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-400 font-mono">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-mono">{atom}</span>
                  <span className="text-sm text-gray-600">
                    {atom === 'atom_capacity' && '产能 - 生产线最大产出能力'}
                    {atom === 'atom_oee' && 'OEE - 设备综合效率指标'}
                    {atom === 'atom_throughput' && '吞吐量 - 单位时间产出量'}
                    {atom === 'atom_inventory' && '库存量 - 物料存储数量'}
                    {atom === 'atom_turnover' && '周转率 - 库存周转次数'}
                    {atom === 'atom_safety_stock' && '安全库存 - 最低库存警戒线'}
                    {atom === 'atom_yield_rate' && '良品率 - 合格产品比例'}
                    {atom === 'atom_defect_rate' && '不良率 - 不合格产品比例'}
                    {atom === 'atom_quality_score' && '质量评分 - 综合质量指标'}
                    {atom === 'atom_demand_forecast' && '需求预测 - 未来需求预估'}
                    {atom === 'atom_order_quantity' && '订单数量 - 客户订购量'}
                    {atom === 'atom_delivery_date' && '交付日期 - 承诺交货时间'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 关联数据表 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Table size={18} className="text-blue-500" />
              关联数据表
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {scenario.relatedTables?.map((table: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Database size={16} className="text-gray-400" />
                  <span className="text-sm font-mono text-gray-700">{table}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 数据流图 */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Network size={18} className="text-green-500" />
              数据流向
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                  <Database size={24} className="text-blue-600" />
                </div>
                <div className="text-xs text-gray-600">数据源</div>
                <div className="text-xs font-mono text-gray-400">{dataSource?.type}</div>
              </div>
              <div className="flex-1 px-4">
                <div className="h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400"></div>
                <div className="text-xs text-center text-gray-400 mt-1">抽取 → 清洗 → 映射</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                  <Box size={24} className="text-purple-600" />
                </div>
                <div className="text-xs text-gray-600">本体对象</div>
                <div className="text-xs font-mono text-gray-400">{scenario.category.replace('类', '')}</div>
              </div>
              <div className="flex-1 px-4">
                <div className="h-0.5 bg-gradient-to-r from-purple-400 to-green-400"></div>
                <div className="text-xs text-center text-gray-400 mt-1">实例化</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                  <Layers size={24} className="text-green-600" />
                </div>
                <div className="text-xs text-gray-600">业务场景</div>
                <div className="text-xs font-mono text-gray-400">分析</div>
              </div>
            </div>
          </div>

          {/* 使用示例 */}
          <div className="bg-gray-900 rounded-xl p-4 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 font-mono">SCENARIO_USAGE.json</span>
              <span className="text-xs text-gray-500">配置示例</span>
            </div>
            <pre className="text-xs text-green-400 font-mono">
{JSON.stringify({
  scenario: scenario.name,
  dataSource: dataSource?.name,
  objectType: scenario.category.replace('类', ''),
  atomMappings: scenario.atoms?.map((atom: string) => ({
    atomId: atom,
    sourceTable: scenario.relatedTables?.[0],
    sourceField: atom.replace('atom_', '')
  })),
  updateFrequency: '每小时',
  lastSync: new Date().toISOString()
}, null, 2)}
            </pre>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl font-medium"
          >
            关闭
          </button>
          <button
            onClick={() => {
              alert('已跳转至业务语义配置页面');
              onClose();
            }}
            className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl hover:bg-[#0051D5] font-medium flex items-center gap-2"
          >
            <Zap size={18} />
            查看推演配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceManager;
