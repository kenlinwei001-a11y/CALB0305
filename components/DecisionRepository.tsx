import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Zap, Scale, Network, FileCode, Calendar,
  User, MessageCircle, ChevronRight, Clock, Tag,
  CheckCircle, AlertCircle, Download, Eye, GitBranch,
  History, Lightbulb, Lock, Box, TrendingUp
} from 'lucide-react';
import type { DecisionAsset, AssetSourceType } from '../types';
import { MOCK_DECISION_ASSETS } from '../constants';

// 资产类型配置
const ASSET_TYPE_CONFIG = {
  skill: { label: 'Skill', icon: Zap, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  constraint: { label: '约束规则', icon: Scale, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  ontology: { label: '本体关系', icon: Network, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  simulation_template: { label: '推演模板', icon: FileCode, color: 'text-green-600', bgColor: 'bg-green-50' },
  decision_graph: { label: '决策图谱', icon: GitBranch, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
};

// 来源类型配置
const SOURCE_CONFIG: Record<AssetSourceType, { label: string; badgeClass: string }> = {
  preset: {
    label: '系统预设',
    badgeClass: 'bg-gray-100 text-gray-600'
  },
  conversation: {
    label: '对话沉淀',
    badgeClass: 'bg-indigo-50 text-indigo-600'
  }
};

// 资产卡片组件
const AssetCard: React.FC<{ asset: DecisionAsset; onClick: () => void }> = ({ asset, onClick }) => {
  const typeConfig = ASSET_TYPE_CONFIG[asset.type];
  const sourceConfig = SOURCE_CONFIG[asset.source];
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer p-5"
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${typeConfig.bgColor} rounded-lg flex items-center justify-center`}>
            <TypeIcon size={20} className={typeConfig.color} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{asset.name}</h4>
            <span className="text-xs text-gray-400">{typeConfig.label}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${sourceConfig.badgeClass}`}>
          {sourceConfig.label}
        </span>
      </div>

      {/* 描述 */}
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{asset.description}</p>

      {/* 来源信息 */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <User size={12} />
          <span>{asset.sourceInfo.creator}</span>
          {asset.sourceInfo.creatorRole && (
            <span className="text-gray-300">· {asset.sourceInfo.creatorRole}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{new Date(asset.sourceInfo.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex gap-1">
          {asset.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} />
            {asset.usageStats.usageCount}次使用
          </span>
          {asset.source === 'conversation' && asset.sourceInfo.participants && (
            <span className="flex items-center gap-1">
              <MessageCircle size={12} />
              {asset.sourceInfo.participants.length}人参与
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// 资产详情抽屉
const AssetDetailDrawer: React.FC<{
  asset: DecisionAsset | null;
  onClose: () => void;
}> = ({ asset, onClose }) => {
  if (!asset) return null;

  const typeConfig = ASSET_TYPE_CONFIG[asset.type];
  const sourceConfig = SOURCE_CONFIG[asset.source];
  const TypeIcon = typeConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${typeConfig.bgColor} rounded-xl flex items-center justify-center`}>
                <TypeIcon size={24} className={typeConfig.color} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{asset.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sourceConfig.badgeClass}`}>
                    {sourceConfig.label}
                  </span>
                  <span className="text-xs text-gray-400">v{asset.version}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    asset.status === 'active' ? 'bg-green-50 text-green-600' :
                    asset.status === 'draft' ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {asset.status === 'active' ? '已激活' : asset.status === 'draft' ? '草稿' : '已弃用'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <span className="sr-only">关闭</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 描述 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">描述</h3>
            <p className="text-sm text-gray-600">{asset.description}</p>
          </div>

          {/* 来源信息 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <History size={16} />
              来源信息
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">创建人</span>
                <span className="text-gray-900">{asset.sourceInfo.creator}</span>
              </div>
              {asset.sourceInfo.creatorRole && (
                <div className="flex justify-between">
                  <span className="text-gray-500">角色</span>
                  <span className="text-gray-900">{asset.sourceInfo.creatorRole}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">创建时间</span>
                <span className="text-gray-900">
                  {new Date(asset.sourceInfo.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">更新时间</span>
                <span className="text-gray-900">
                  {new Date(asset.sourceInfo.updatedAt).toLocaleString('zh-CN')}
                </span>
              </div>
              {asset.sourceInfo.discussionTopic && (
                <div className="flex justify-between">
                  <span className="text-gray-500">讨论主题</span>
                  <span className="text-gray-900">{asset.sourceInfo.discussionTopic}</span>
                </div>
              )}
              {asset.sourceInfo.participants && asset.sourceInfo.participants.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">参与人员</span>
                  <span className="text-gray-900">{asset.sourceInfo.participants.join('、')}</span>
                </div>
              )}
            </div>
          </div>

          {/* 使用统计 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">使用统计</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <div className="text-2xl font-semibold text-gray-900">{asset.usageStats.usageCount}</div>
                <div className="text-xs text-gray-500 mt-1">使用次数</div>
              </div>
              {asset.usageStats.successRate && (
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <div className="text-2xl font-semibold text-green-600">
                    {(asset.usageStats.successRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">成功率</div>
                </div>
              )}
              {asset.usageStats.lastUsedAt && (
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date(asset.usageStats.lastUsedAt).toLocaleDateString('zh-CN')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">最后使用</div>
                </div>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {asset.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 资产内容预览 */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">内容预览</h3>
            <div className="p-4 bg-gray-900 rounded-xl text-gray-300 text-xs font-mono overflow-x-auto">
              <pre>{JSON.stringify(asset.content, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
            编辑
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Download size={16} />
            导出资产
          </button>
        </div>
      </div>
    </div>
  );
};

const DecisionRepository: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<AssetSourceType | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<DecisionAsset | null>(null);

  // 筛选资产
  const filteredAssets = useMemo(() => {
    return MOCK_DECISION_ASSETS.filter(asset => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'all' || asset.type === selectedType;
      const matchesSource = selectedSource === 'all' || asset.source === selectedSource;

      return matchesSearch && matchesType && matchesSource;
    });
  }, [searchTerm, selectedType, selectedSource]);

  // 统计
  const stats = useMemo(() => {
    return {
      total: MOCK_DECISION_ASSETS.length,
      skills: MOCK_DECISION_ASSETS.filter(a => a.type === 'skill').length,
      constraints: MOCK_DECISION_ASSETS.filter(a => a.type === 'constraint').length,
      fromConversation: MOCK_DECISION_ASSETS.filter(a => a.source === 'conversation').length,
      fromPreset: MOCK_DECISION_ASSETS.filter(a => a.source === 'preset').length,
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">决策资产库</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 {stats.total} 个资产 · 对话沉淀 {stats.fromConversation} 个 · 系统预设 {stats.fromPreset} 个
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Zap size={16} />
            导入资产
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.skills}</div>
              <div className="text-xs text-gray-500">Skills</div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Scale size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.constraints}</div>
              <div className="text-xs text-gray-500">约束规则</div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <MessageCircle size={20} className="text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.fromConversation}</div>
              <div className="text-xs text-gray-500">对话沉淀</div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Box size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{stats.total - stats.fromConversation}</div>
              <div className="text-xs text-gray-500">系统预设</div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="搜索资产名称、描述或标签..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 类型筛选 */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-gray-400"
        >
          <option value="all">全部类型</option>
          <option value="skill">Skills</option>
          <option value="constraint">约束规则</option>
          <option value="ontology">本体关系</option>
          <option value="simulation_template">推演模板</option>
          <option value="decision_graph">决策图谱</option>
        </select>

        {/* 来源筛选 */}
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value as AssetSourceType | 'all')}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-gray-400"
        >
          <option value="all">全部来源</option>
          <option value="conversation">对话沉淀</option>
          <option value="preset">系统预设</option>
        </select>
      </div>

      {/* 资产列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={() => setSelectedAsset(asset)}
            />
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-3">
              <Search size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">未找到匹配的资产</p>
            <p className="text-gray-400 text-xs mt-1">请尝试调整搜索条件</p>
          </div>
        )}
      </div>

      {/* 详情抽屉 */}
      {selectedAsset && (
        <AssetDetailDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default DecisionRepository;
