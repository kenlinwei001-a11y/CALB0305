import React, { useState } from 'react';
import {
  Search, Filter, Star, Download, ShoppingCart, CheckCircle,
  Zap, BookOpen, Clock, TrendingUp, User, ChevronRight, Tag,
  StarHalf, ThumbsUp, MessageSquare, Shield, Code, GitBranch,
  Grid, List, ArrowUpDown, ExternalLink, Package
} from 'lucide-react';
import { MOCK_MARKET_SKILLS } from '../constants';
import type { MarketSkill } from '../types';

// Skill Card Component
const SkillCard: React.FC<{
  skill: MarketSkill;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}>= ({ skill, viewMode, onClick }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<StarHalf key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300" />);
      }
    }
    return stars;
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
            <Zap size={24} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{skill.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                skill.pricing.type === 'free' ? 'bg-green-100 text-green-700' :
                skill.pricing.type === 'paid' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {skill.pricing.type === 'free' ? '免费' :
                 skill.pricing.type === 'paid' ? '¥' + skill.pricing.price :
                 '订阅'}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                {renderStars(skill.rating.average)}
                <span className="text-gray-500 ml-1">({skill.rating.count})</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">{skill.usage.totalDownloads} 下载</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">{skill.marketInfo.publisher}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
          <Zap size={24} className="text-blue-600" />
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          skill.pricing.type === 'free' ? 'bg-green-100 text-green-700' :
          skill.pricing.type === 'paid' ? 'bg-blue-100 text-blue-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {skill.pricing.type === 'free' ? '免费' :
           skill.pricing.type === 'paid' ? '¥' + skill.pricing.price :
           '订阅'}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{skill.name}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{skill.description}</p>

      <div className="flex items-center gap-1 mb-3">
        {renderStars(skill.rating.average)}
        <span className="text-sm text-gray-500 ml-1">({skill.rating.count})</span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{skill.usage.totalDownloads} 下载</span>
        <span>{skill.marketInfo.publisher}</span>
      </div>
    </div>
  );
};

// Skill Detail Modal
const SkillDetailModal: React.FC<{
  skill: MarketSkill | null;
  onClose: () => void;
}>= ({ skill, onClose }) => {
  if (!skill) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center">
                <Zap size={32} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{skill.name}</h2>
                <p className="text-gray-500 mt-1">{skill.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                    {skill.category}
                  </span>
                  {skill.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <span className="sr-only">关闭</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Stats */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-gray-900">{skill.rating.average}</div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(skill.rating.average) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500 mt-1">{skill.rating.count} 评价</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{skill.usage.totalDownloads}</div>
                <div className="text-sm text-gray-500">总下载</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{skill.usage.monthlyActive}</div>
                <div className="text-sm text-gray-500">月活跃用户</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{(skill.usage.successRate * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-500">成功率</div>
              </div>
            </div>

            {/* Middle Column - Details */}
            <div className="col-span-2 space-y-6">
              {/* Publisher Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">发布者信息</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{skill.marketInfo.publisher}</div>
                    <div className="text-sm text-gray-500">{skill.marketInfo.publisherRole}</div>
                  </div>
                </div>
              </div>

              {/* Dependencies */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">依赖项</h3>
                <div className="space-y-2">
                  {skill.dependencies.tools.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Code size={16} className="text-gray-400" />
                      <span className="text-gray-500">工具:</span>
                      <div className="flex gap-1">
                        {skill.dependencies.tools.map(tool => (
                          <span key={tool} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{tool}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skill.dependencies.dataSources.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Database size={16} className="text-gray-400" />
                      <span className="text-gray-500">数据源:</span>
                      <div className="flex gap-1">
                        {skill.dependencies.dataSources.map(ds => (
                          <span key={ds} className="px-2 py-0.5 bg-green-50 text-green-600 rounded">{ds}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews */}
              {skill.reviews.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">用户评价</h3>
                  <div className="space-y-3">
                    {skill.reviews.map(review => (
                      <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{review.userName}</span>
                            {review.verified && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                已验证
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{review.rating}</span>
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900">{review.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{review.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{new Date(review.timestamp).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={12} />
                            {review.helpful} 有用
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            查看文档
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download size={18} />
            {skill.pricing.type === 'free' ? '免费获取' : '购买'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Import Database icon
import { Database } from 'lucide-react';

// Main Skill Market Component
const SkillMarket: React.FC = () => {
  const [skills] = useState<MarketSkill[]>(MOCK_MARKET_SKILLS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSkill, setSelectedSkill] = useState<MarketSkill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    pricing: 'all',
    rating: 0
  });

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = !searchQuery ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filters.category === 'all' || skill.category === filters.category;
    const matchesPricing = filters.pricing === 'all' || skill.pricing.type === filters.pricing;
    const matchesRating = skill.rating.average >= filters.rating;
    return matchesSearch && matchesCategory && matchesPricing && matchesRating;
  });

  const categories = ['all', ...Array.from(new Set(skills.map(s => s.category)))];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Skill Market</h1>
            <p className="text-sm text-gray-500">发现和分享AI技能</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索技能..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">全部分类</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filters.pricing}
              onChange={(e) => setFilters({ ...filters, pricing: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">全部价格</option>
              <option value="free">免费</option>
              <option value="paid">付费</option>
              <option value="subscription">订阅</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-4'}`}>
          {filteredSkills.map(skill => (
            <SkillCard
              key={skill.skill_id}
              skill={skill}
              viewMode={viewMode}
              onClick={() => setSelectedSkill(skill)}
            />
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <SkillDetailModal
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
      />
    </div>
  );
};

export default SkillMarket;
