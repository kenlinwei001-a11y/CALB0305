import React, { useState, useEffect } from 'react';
import {
  Database, Server, Cloud, FileText, Settings, Plus,
  RefreshCw, CheckCircle, XCircle, Clock, ChevronRight,
  Table, Layers, Zap, Activity, Shield, Link as LinkIcon,
  Search, Filter, MoreVertical, Edit2, Trash2, Play,
  Pause, AlertCircle, BarChart3, Box, Factory, Network, Atom,
  Users, Truck, Key, Info, X, ChevronDown
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
      { id: 't001', name: 'production_orders', schema: 'prod', rowCount: 1250000, size: '256MB', lastUpdated: '2024-03-15 14:30:00', tags: ['订单', '生产'] },
      { id: 't002', name: 'inventory_stock', schema: 'prod', rowCount: 890000, size: '128MB', lastUpdated: '2024-03-15 14:30:00', tags: ['库存'] },
      { id: 't003', name: 'material_master', schema: 'master', rowCount: 45000, size: '32MB', lastUpdated: '2024-03-15 14:30:00', tags: ['物料', '主数据'] },
    ]
  },
  {
    id: 'mes-001',
    name: 'MES 制造执行系统',
    type: 'MES',
    status: 'connected',
    host: 'mes.corp.local',
    port: 3306,
    database: 'MESDB',
    description: '制造执行系统，包含工艺参数、设备状态、质量数据',
    lastSync: '2024-03-15 14:35:00',
    syncFrequency: '实时',
    dataLayer: 'ODS',
    tables: [
      { id: 't004', name: 'process_parameters', schema: 'mes', rowCount: 5000000, size: '1.2GB', lastUpdated: '2024-03-15 14:35:00', tags: ['工艺', '参数'] },
      { id: 't005', name: 'equipment_status', schema: 'mes', rowCount: 2500000, size: '512MB', lastUpdated: '2024-03-15 14:35:00', tags: ['设备', '状态'] },
      { id: 't006', name: 'quality_inspection', schema: 'mes', rowCount: 1800000, size: '384MB', lastUpdated: '2024-03-15 14:35:00', tags: ['质量', '检测'] },
    ]
  },
  {
    id: 'plm-001',
    name: 'PLM 产品生命周期',
    type: 'PLM',
    status: 'connected',
    host: 'plm.corp.local',
    port: 5432,
    database: 'PLMDB',
    description: '产品生命周期管理系统，包含BOM、工艺路线、设计文档',
    lastSync: '2024-03-15 13:00:00',
    syncFrequency: '每天',
    dataLayer: 'ODS',
    tables: [
      { id: 't007', name: 'bom_master', schema: 'plm', rowCount: 120000, size: '64MB', lastUpdated: '2024-03-15 13:00:00', tags: ['BOM'] },
      { id: 't008', name: 'process_route', schema: 'plm', rowCount: 85000, size: '48MB', lastUpdated: '2024-03-15 13:00:00', tags: ['工艺路线'] },
    ]
  },
  {
    id: 'wms-001',
    name: 'WMS 仓储管理系统',
    type: 'WMS',
    status: 'syncing',
    host: 'wms.corp.local',
    port: 3306,
    database: 'WMSDB',
    description: '仓储管理系统，包含入库、出库、库存、库位数据',
    lastSync: '2024-03-15 14:40:00',
    syncFrequency: '每15分钟',
    dataLayer: 'ODS',
    tables: [
      { id: 't009', name: 'inbound_records', schema: 'wms', rowCount: 3200000, size: '768MB', lastUpdated: '2024-03-15 14:40:00', tags: ['入库'] },
      { id: 't010', name: 'outbound_records', schema: 'wms', rowCount: 2800000, size: '640MB', lastUpdated: '2024-03-15 14:40:00', tags: ['出库'] },
      { id: 't011', name: 'location_inventory', schema: 'wms', rowCount: 150000, size: '32MB', lastUpdated: '2024-03-15 14:40:00', tags: ['库位', '库存'] },
    ]
  },
  {
    id: 'crm-001',
    name: 'CRM 客户关系系统',
    type: 'CRM',
    status: 'connected',
    host: 'crm.corp.local',
    port: 5432,
    database: 'CRMDB',
    description: '客户关系管理系统，包含客户数据、销售订单、市场活动',
    lastSync: '2024-03-15 14:30:00',
    syncFrequency: '每小时',
    dataLayer: 'ODS',
    tables: [
      { id: 't012', name: 'customer_master', schema: 'crm', rowCount: 25000, size: '16MB', lastUpdated: '2024-03-15 14:30:00', tags: ['客户', '主数据'] },
      { id: 't013', name: 'sales_orders', schema: 'crm', rowCount: 850000, size: '192MB', lastUpdated: '2024-03-15 14:30:00', tags: ['销售', '订单'] },
      { id: 't014', name: 'market_activities', schema: 'crm', rowCount: 12000, size: '8MB', lastUpdated: '2024-03-15 14:30:00', tags: ['市场'] },
    ]
  },
  {
    id: 'scm-001',
    name: 'SCM 供应链协同平台',
    type: 'SCM',
    status: 'connected',
    host: 'scm.corp.local',
    port: 3306,
    database: 'SCMDB',
    description: '供应链协同平台，包含供应商数据、采购订单、物流跟踪',
    lastSync: '2024-03-15 14:30:00',
    syncFrequency: '每30分钟',
    dataLayer: 'ODS',
    tables: [
      { id: 't015', name: 'supplier_master', schema: 'scm', rowCount: 3500, size: '4MB', lastUpdated: '2024-03-15 14:30:00', tags: ['供应商'] },
      { id: 't016', name: 'purchase_orders', schema: 'scm', rowCount: 420000, size: '96MB', lastUpdated: '2024-03-15 14:30:00', tags: ['采购', '订单'] },
      { id: 't017', name: 'logistics_tracking', schema: 'scm', rowCount: 1800000, size: '384MB', lastUpdated: '2024-03-15 14:30:00', tags: ['物流', '跟踪'] },
    ]
  },
  {
    id: 'iot-001',
    name: 'IoT 设备传感器',
    type: 'IoT',
    status: 'error',
    host: 'mqtt.corp.local',
    port: 1883,
    description: 'IoT传感器数据，包含温度、压力、振动等实时数据流',
    lastSync: '2024-03-15 12:00:00',
    syncFrequency: '实时',
    dataLayer: 'ODS',
    tables: [
      { id: 't018', name: 'sensor_temperature', schema: 'iot', rowCount: 50000000, size: '5GB', lastUpdated: '2024-03-15 12:00:00', tags: ['温度', '传感器'] },
      { id: 't019', name: 'sensor_pressure', schema: 'iot', rowCount: 48000000, size: '4.8GB', lastUpdated: '2024-03-15 12:00:00', tags: ['压力', '传感器'] },
      { id: 't020', name: 'sensor_vibration', schema: 'iot', rowCount: 45000000, size: '4.5GB', lastUpdated: '2024-03-15 12:00:00', tags: ['振动', '传感器'] },
    ]
  },
];

// 数据源类型配置
const DATA_SOURCE_TYPES = [
  { type: 'ERP', name: 'ERP系统', icon: Database, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { type: 'MES', name: 'MES系统', icon: Factory, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { type: 'PLM', name: 'PLM系统', icon: Layers, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { type: 'WMS', name: 'WMS系统', icon: Box, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { type: 'CRM', name: 'CRM系统', icon: Users, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { type: 'SCM', name: 'SCM系统', icon: Truck, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { type: 'IoT', name: 'IoT设备', icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { type: 'File', name: '文件', icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { type: 'Database', name: '数据库', icon: Database, color: 'text-gray-600', bgColor: 'bg-gray-50' },
];

// 状态配置 - 简化为灰度
const STATUS_CONFIG = {
  connected: { label: '已连接', icon: CheckCircle, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  disconnected: { label: '未连接', icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  syncing: { label: '同步中', icon: RefreshCw, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  error: { label: '异常', icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

// 数据分层配置 - 简化为灰度
const LAYER_CONFIG = {
  ODS: { name: 'ODS', desc: '操作数据层', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  DWD: { name: 'DWD', desc: '明细数据层', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  DWS: { name: 'DWS', desc: '服务数据层', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  ADS: { name: 'ADS', desc: '应用数据层', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

// 获取数据源类型配置
const getDataSourceTypeConfig = (type: string) => {
  return DATA_SOURCE_TYPES.find(t => t.type === type) || DATA_SOURCE_TYPES[0];
};

// 模拟数据血缘关系
const MOCK_LINEAGE = {
  't001': { upstream: ['material_master', 'bom_master'], downstream: ['dwd_production_fact', 'dws_order_summary'] },
  't002': { upstream: [], downstream: ['dwd_inventory_fact'] },
  't004': { upstream: [], downstream: ['dwd_process_fact', 'dws_quality_summary'] },
};

const DataSourceManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sources' | 'lineage' | 'ontology'>('sources');
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [selectedTable, setSelectedTable] = useState<DataTable | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOntologyModal, setShowOntologyModal] = useState(false);

  const filteredSources = MOCK_DATA_SOURCES.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题区域 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">数据源管理</h2>
            <p className="text-sm text-gray-500 mt-0.5">{MOCK_DATA_SOURCES.length} 个数据源 · {MOCK_DATA_SOURCES.reduce((acc, s) => acc + (s.tables?.length || 0), 0)} 张数据表</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowOntologyModal(true)}
              className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Network size={16} />
              <span>本体映射</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span>添加数据源</span>
            </button>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="flex gap-1 border-b border-gray-100">
          {[
            { id: 'sources', label: '数据源列表', icon: Database },
            { id: 'lineage', label: '数据血缘', icon: Network },
            { id: 'ontology', label: '本体映射', icon: Atom },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索栏 */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="搜索数据源名称或类型..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white text-sm transition-colors bg-white">
            <Filter size={16} />
            <span>筛选</span>
          </button>
        </div>

        {/* 数据源列表 */}
        {activeTab === 'sources' && (
          <div className="space-y-3">
            {filteredSources.map((source) => {
              const typeConfig = getDataSourceTypeConfig(source.type);
              const statusConfig = STATUS_CONFIG[source.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={source.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all overflow-hidden"
                >
                  {/* 数据源头部 */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedSource(selectedSource?.id === source.id ? null : source)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <typeConfig.icon size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{source.name}</span>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full">
                            {LAYER_CONFIG[source.dataLayer].name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {source.host}:{source.port} {source.database && `· ${source.database}`} · {source.tables?.length || 0} 张表
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">同步: {source.syncFrequency}</span>
                      <ChevronRight
                        size={16}
                        className={`text-gray-400 transition-transform ${selectedSource?.id === source.id ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>

                  {/* 展开的表列表 */}
                  {selectedSource?.id === source.id && source.tables && (
                    <div className="border-t border-gray-50 bg-gray-50/30"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">数据表 ({source.tables.length})</span>
                          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <RefreshCw size={12} />
                            刷新元数据
                          </button>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden"
                        >
                          <table className="w-full text-sm"
                          >
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">表名</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Schema</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">行数</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">大小</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">标签</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100"
                            >
                              {source.tables.map((table) => (
                                <tr
                                  key={table.id}
                                  className="hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setSelectedTable(selectedTable?.id === table.id ? null : table)}
                                >
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <Table size={14} className="text-gray-400" />
                                      <span className="font-mono text-xs text-gray-700">{table.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs text-gray-500">{table.schema}</td>
                                  <td className="px-4 py-2.5 text-right text-xs text-gray-600">{table.rowCount.toLocaleString()}</td>
                                  <td className="px-4 py-2.5 text-right text-xs text-gray-600">{table.size}</td>
                                  <td className="px-4 py-2.5">
                                    <div className="flex gap-1">
                                      {table.tags?.map((tag) => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 数据血缘视图 */}
        {activeTab === 'lineage' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Network size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">数据血缘图谱</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">可视化展示数据从源头到应用的完整流转路径，包括上游依赖和下游影响分析</p>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              查看完整血缘图谱
            </button>
          </div>
        )}

        {/* 本体映射视图 */}
        {activeTab === 'ontology' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <Atom size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">本体映射配置</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">将数据源字段映射到业务本体模型，建立数据与业务语义的关联关系</p>
            <button
              onClick={() => setShowOntologyModal(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              配置本体映射
            </button>
          </div>
        )}
      </div>

      {/* 添加数据源模态框 */}
      {showAddModal && (
        <AddDataSourceModal onClose={() => setShowAddModal(false)} />
      )}

      {/* 本体映射模态框 */}
      {showOntologyModal && (
        <OntologyMappingModal onClose={() => setShowOntologyModal(false)} />
      )}
    </div>
  );
};

// 添加数据源模态框
const AddDataSourceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900">添加数据源</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6"
        >
          {step === 1 && (
            <div className="space-y-4"
            >
              <h4 className="text-sm font-medium text-gray-700">选择数据源类型</h4>
              <div className="grid grid-cols-3 gap-3"
              >
                {DATA_SOURCE_TYPES.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => setSelectedType(type.type)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      selectedType === type.type
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}

                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2"
                    >
                      <type.icon size={20} className="text-gray-600" />
                    </div>
                    <div className="font-medium text-sm text-gray-900">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100"
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"

            取消
          </button>
          <button
            onClick={() => selectedType && setStep(2)}
            disabled={!selectedType}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"

            下一步
          </button>
        </div>
      </div>
    </div>
  );
};

// 本体映射模态框
const OntologyMappingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [selectedTable, setSelectedTable] = useState<DataTable | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">配置本体映射</h3>
            <p className="text-xs text-gray-500 mt-0.5">步骤 {step}/4: {step === 1 ? '选择数据源' : step === 2 ? '选择数据表' : step === 3 ? '字段映射' : '业务语义关联'}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6"
        >
          {step === 1 && (
            <div className="space-y-4"
            >
              <h4 className="text-sm font-medium text-gray-700">选择数据源</h4>
              <div className="space-y-2"
              >
                {MOCK_DATA_SOURCES.map((source) => {
                  const typeConfig = getDataSourceTypeConfig(source.type);
                  return (
                    <button
                      key={source.id}
                      onClick={() => setSelectedSource(source)}
                      className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-3 ${
                        selectedSource?.id === source.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}

                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"
                      >
                        <typeConfig.icon size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1"
                      >
                        <div className="font-medium text-sm text-gray-900">{source.name}</div>
                        <div className="text-xs text-gray-500">{source.type} · {source.tables?.length || 0} 张表</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && selectedSource && (
            <div className="space-y-4"
            >
              <h4 className="text-sm font-medium text-gray-700">选择数据表</h4>
              <div className="space-y-2"
              >
                {selectedSource.tables?.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      selectedTable?.id === table.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}

                    <div className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3"
                      >
                        <Table size={20} className="text-gray-400" />
                        <div>
                          <div className="font-medium text-sm text-gray-900 font-mono">{table.name}</div>
                          <div className="text-xs text-gray-500">{table.rowCount.toLocaleString()} 行 · {table.size}</div>
                        </div>
                      </div>
                      <div className="flex gap-1"
                      >
                        {table.tags?.map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && selectedTable && (
            <div className="space-y-4"
            >
              <div className="flex items-center justify-between"
            >
                <h4 className="text-sm font-medium text-gray-700">字段映射配置</h4>
                <span className="text-xs text-gray-400">表: {selectedTable.name}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 text-center"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3"
                >
                  <Layers size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">字段映射功能开发中...</p>
                <p className="text-xs text-gray-400 mt-1">将 {selectedTable.name} 的字段映射到业务本体属性</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4"
            >
              <h4 className="text-sm font-medium text-gray-700">业务语义关联</h4>
              <div className="bg-gray-50 rounded-xl p-8 text-center"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3"
                >
                  <Network size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">业务语义关联功能开发中...</p>
                <p className="text-xs text-gray-400 mt-1">将映射后的本体与业务场景关联</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between px-6 py-4 border-t border-gray-100"
        >
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"

            上一步
          </button>
          <div className="flex gap-2"
          >
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"

              取消
            </button>
            <button
              onClick={() => {
                if (step < 4) {
                  setStep(step + 1);
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"

              {step === 4 ? '完成' : '下一步'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourceManager;
