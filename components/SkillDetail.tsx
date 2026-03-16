import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_SKILLS, SCENARIOS } from '../constants';
import { ArrowLeft, FileText, Settings, Code, Copy, Check, Network, BookOpen, FolderOpen } from 'lucide-react';

const SkillDetail: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const skill = MOCK_SKILLS.find(s => s.skill_id === skillId);
  const [activeTab, setActiveTab] = useState<'readme' | 'config' | 'script' | 'references' | 'assets'>('readme');
  const [copied, setCopied] = useState(false);

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
          <FileText size={24} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-medium mb-1">未找到技能</h2>
        <button
          onClick={() => navigate('/skills')}
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          返回注册中心
        </button>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'readme': return skill.files.readme;
      case 'config': return skill.files.config;
      case 'script': return skill.files.script;
      case 'references': return skill.files.references?.join('\n') || '暂无知识库文档';
      case 'assets': return skill.files.assets?.join('\n') || '暂无静态资源';
      default: return '';
    }
  };

  const domainName = SCENARIOS.find(s => s.id === skill.domain[0])?.name || skill.domain[0];

  // 获取技能层级
  const getSkillLevel = (skillId: string) => {
    if (skillId.startsWith('atom_')) return '原子层';
    if (skillId.startsWith('domain_')) return '领域层';
    if (skillId.startsWith('scenario_')) return '场景层';
    return '业务层';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/skills')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{skill.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
              <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{skill.skill_id}</span>
              <span>v{skill.version}</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">{domainName}</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">{getSkillLevel(skill.skill_id)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/ontology?scenario=${skill.domain[0]}`)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Network size={16} />
          <span>查看语义图谱</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* File Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-r border-gray-100 ${
              activeTab === 'readme' ? 'bg-white text-gray-900 border-t-2 border-t-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            <FileText size={16} />
            <span>SKILL.md</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-r border-gray-100 ${
              activeTab === 'config' ? 'bg-white text-gray-900 border-t-2 border-t-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            <Settings size={16} />
            <span>config.json</span>
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-r border-gray-100 ${
              activeTab === 'script' ? 'bg-white text-gray-900 border-t-2 border-t-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            <Code size={16} />
            <span>script.{skill.files.scriptLang}</span>
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-r border-gray-100 ${
              activeTab === 'references' ? 'bg-white text-gray-900 border-t-2 border-t-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            <BookOpen size={16} />
            <span>references ({skill.files.references?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-r border-gray-100 ${
              activeTab === 'assets' ? 'bg-white text-gray-900 border-t-2 border-t-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            <FolderOpen size={16} />
            <span>assets ({skill.files.assets?.length || 0})</span>
          </button>
        </div>

        {/* Content View */}
        <div className="relative bg-gray-900 min-h-[500px] max-h-[600px] overflow-auto">
          {activeTab !== 'references' && activeTab !== 'assets' && (
            <button
              onClick={() => handleCopy(getActiveContent())}
              className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white p-2 rounded-lg transition-colors z-10"
              title="复制内容"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          )}

          {activeTab === 'references' ? (
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <BookOpen size={16} />
                知识库文档
              </h3>
              {skill.files.references && skill.files.references.length > 0 ? (
                <ul className="space-y-2">
                  {skill.files.references.map((ref, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 font-mono w-6">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-sm">{ref}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">暂无知识库文档</p>
              )}
            </div>
          ) : activeTab === 'assets' ? (
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <FolderOpen size={16} />
                静态资源文件
              </h3>
              {skill.files.assets && skill.files.assets.length > 0 ? (
                <ul className="space-y-2">
                  {skill.files.assets.map((asset, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 font-mono w-6">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-sm font-mono text-gray-400">{asset}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">暂无静态资源</p>
              )}
            </div>
          ) : (
            <pre className="p-6 text-sm font-mono text-gray-300 leading-relaxed">
              <code>{getActiveContent()}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillDetail;
