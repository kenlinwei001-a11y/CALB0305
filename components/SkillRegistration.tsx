import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, Code, FileText, Target,
  Database, CheckCircle, AlertCircle, ChevronRight, Box,
  Layers, GitBranch, History, Wrench, FolderOpen,
  Library, BarChart3, Workflow, Shield, Server,
  FileCode, Sparkles, Leaf, Zap, Cpu
} from 'lucide-react';
import { Skill, SkillCategory, SKILL_CATEGORIES, SkillGotcha, SkillTriggerCondition } from '../types';
import { MOCK_SKILLS, getAllScenarios, ATOMIC_ONTOLOGY_LIBRARY, DYNAMIC_SCENARIOS } from '../constants';

interface FormData {
  skill_id: string;
  name: string;
  version: string;
  description: string;
  category: SkillCategory | '';
  domain: string[];
  capability_tags: string[];
  input_schema: Record<string, string>;
  output_schema: Record<string, string>;
  cost: number;
  latency: number;
  accuracy_score: number;
  dependencies: string[];
  triggerConditions: SkillTriggerCondition;
  gotchas: SkillGotcha[];
  memoryEnabled: boolean;
  memoryLogFile: string;
  helperScripts: string[];
  files: {
    readme: string;
    config: string;
    script: string;
    scriptLang: 'python' | 'javascript';
    references: string[];
    assets: string[];
  };
}

interface SchemaField { key: string; type: string; }

const categoryIcons: Record<string, React.ElementType> = {
  'library-api': Library, 'validation': CheckCircle, 'data-analysis': BarChart3,
  'workflow': Workflow, 'scaffolding': FileCode, 'code-quality': Shield,
  'cicd': GitBranch, 'runbook': FileText, 'infrastructure': Server, 'carbon-energy': Leaf
};

const severityColors = {
  low: 'bg-blue-50 text-blue-600 border-blue-200',
  medium: 'bg-amber-50 text-amber-600 border-amber-200',
  high: 'bg-orange-50 text-orange-600 border-orange-200',
  critical: 'bg-red-50 text-red-600 border-red-200'
};

const availableHelperScripts = [
  { id: 'data_loader', name: 'data_loader', description: '数据加载和格式处理' },
  { id: 'history_manager', name: 'history_manager', description: '执行历史记录和记忆功能' },
  { id: 'config_manager', name: 'config_manager', description: '配置管理和初始化' },
  { id: 'validator', name: 'validator', description: '输入验证和规则检查' },
  { id: 'report_generator', name: 'report_generator', description: '报告生成和格式化' }
];

const SkillRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [showScenarioSelector, setShowScenarioSelector] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    skill_id: '', name: '', version: '1.0.0', description: '', category: '',
    domain: [], capability_tags: [], input_schema: {}, output_schema: {},
    cost: 0.5, latency: 100, accuracy_score: 0.9, dependencies: [],
    triggerConditions: { description: '', examples: [], keywords: [] },
    gotchas: [], memoryEnabled: false, memoryLogFile: '', helperScripts: [],
    files: { readme: '', config: '{}', script: '', scriptLang: 'python', references: [], assets: [] }
  });

  const [tagInput, setTagInput] = useState('');
  const [dependencyInput, setDependencyInput] = useState('');
  const [inputSchemaFields, setInputSchemaFields] = useState<SchemaField[]>([]);
  const [outputSchemaFields, setOutputSchemaFields] = useState<SchemaField[]>([]);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldType, setNewFieldType] = useState('string');
  const [schemaMode, setSchemaMode] = useState<'input' | 'output'>('input');
  const [triggerExampleInput, setTriggerExampleInput] = useState('');
  const [triggerKeywordInput, setTriggerKeywordInput] = useState('');
  const [newGotcha, setNewGotcha] = useState<Partial<SkillGotcha>>({ id: '', title: '', description: '', severity: 'medium', solution: '' });
  const [referenceInput, setReferenceInput] = useState('');
  const [assetInput, setAssetInput] = useState('');

  const allScenarios = getAllScenarios();

  const codeTemplates = {
    python: `def handler(event):
    """技能主处理函数"""
    input_data = event.get('input_data', {})
    result = {'status': 'success', 'data': {}}
    return result`,
    javascript: `exports.handler = async (event) => {
  const inputData = event.input_data || {};
  const result = { status: 'success', data: {} };
  return result;
};`
  };

  useEffect(() => {
    if (!formData.files.script) {
      setFormData(prev => ({ ...prev, files: { ...prev.files, script: codeTemplates[prev.files.scriptLang] } }));
    }
  }, []);

  const validateStep = (step: number): boolean => {
    const errs: string[] = [];
    if (step === 1) {
      if (!formData.skill_id?.trim()) errs.push('技能ID不能为空');
      if (!formData.name?.trim()) errs.push('技能名称不能为空');
      if (!formData.category) errs.push('请选择技能分类');
      if (!formData.description?.trim()) errs.push('技能描述不能为空');
      if (!formData.domain?.length) errs.push('至少选择一个应用场景');
    }
    if (step === 2) {
      if (!formData.triggerConditions?.description?.trim()) errs.push('触发条件描述不能为空');
      if (!formData.triggerConditions?.examples?.length) errs.push('至少添加一个触发示例');
      if (!formData.triggerConditions?.keywords?.length) errs.push('至少添加一个触发关键词');
    }
    if (step === 3) {
      if (!Object.keys(formData.input_schema || {}).length) errs.push('至少定义一个输入参数');
      if (!Object.keys(formData.output_schema || {}).length) errs.push('至少定义一个输出参数');
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const handleNext = () => { validateStep(currentStep); setCurrentStep(prev => Math.min(prev + 1, 5)); };
  const handlePrev = () => { setCurrentStep(prev => Math.max(prev - 1, 1)); setErrors([]); };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;
    if (MOCK_SKILLS.some(s => s.skill_id === formData.skill_id)) {
      setErrors(['技能ID已存在，请使用其他ID']); return;
    }
    const newSkill: Skill = {
      skill_id: formData.skill_id, name: formData.name, version: formData.version,
      description: formData.description, domain: formData.domain,
      capability_tags: formData.capability_tags, input_schema: formData.input_schema,
      output_schema: formData.output_schema, cost: formData.cost, latency: formData.latency,
      accuracy_score: formData.accuracy_score, dependencies: formData.dependencies,
      category: formData.category as SkillCategory, triggerConditions: formData.triggerConditions,
      gotchas: formData.gotchas, files: formData.files
    };
    MOCK_SKILLS.push(newSkill);
    navigate(`/skills/${newSkill.skill_id}`);
  };

  // Helpers
  const addSchemaField = () => {
    if (!newFieldKey.trim()) return;
    if (schemaMode === 'input') {
      setFormData(prev => ({ ...prev, input_schema: { ...prev.input_schema, [newFieldKey]: newFieldType } }));
      setInputSchemaFields(prev => [...prev, { key: newFieldKey, type: newFieldType }]);
    } else {
      setFormData(prev => ({ ...prev, output_schema: { ...prev.output_schema, [newFieldKey]: newFieldType } }));
      setOutputSchemaFields(prev => [...prev, { key: newFieldKey, type: newFieldType }]);
    }
    setNewFieldKey('');
  };

  const removeSchemaField = (key: string, mode: 'input' | 'output') => {
    if (mode === 'input') {
      const newSchema = { ...formData.input_schema }; delete newSchema[key];
      setFormData(prev => ({ ...prev, input_schema: newSchema }));
      setInputSchemaFields(prev => prev.filter(f => f.key !== key));
    } else {
      const newSchema = { ...formData.output_schema }; delete newSchema[key];
      setFormData(prev => ({ ...prev, output_schema: newSchema }));
      setOutputSchemaFields(prev => prev.filter(f => f.key !== key));
    }
  };

  const toggleDomain = (scenarioId: string) => {
    setFormData(prev => ({ ...prev, domain: prev.domain.includes(scenarioId) ? prev.domain.filter(id => id !== scenarioId) : [...prev.domain, scenarioId] }));
  };

  const addTag = () => { if (tagInput.trim() && !formData.capability_tags.includes(tagInput.trim())) { setFormData(prev => ({ ...prev, capability_tags: [...prev.capability_tags, tagInput.trim()] })); setTagInput(''); } };
  const removeTag = (tag: string) => setFormData(prev => ({ ...prev, capability_tags: prev.capability_tags.filter(t => t !== tag) }));

  const addTriggerExample = () => { if (triggerExampleInput.trim()) { setFormData(prev => ({ ...prev, triggerConditions: { ...prev.triggerConditions, examples: [...prev.triggerConditions.examples, triggerExampleInput.trim()] } })); setTriggerExampleInput(''); } };
  const removeTriggerExample = (example: string) => setFormData(prev => ({ ...prev, triggerConditions: { ...prev.triggerConditions, examples: prev.triggerConditions.examples.filter(e => e !== example) } }));
  const addTriggerKeyword = () => { if (triggerKeywordInput.trim()) { setFormData(prev => ({ ...prev, triggerConditions: { ...prev.triggerConditions, keywords: [...prev.triggerConditions.keywords, triggerKeywordInput.trim()] } })); setTriggerKeywordInput(''); } };
  const removeTriggerKeyword = (keyword: string) => setFormData(prev => ({ ...prev, triggerConditions: { ...prev.triggerConditions, keywords: prev.triggerConditions.keywords.filter(k => k !== keyword) } }));

  const addGotcha = () => {
    if (!newGotcha.id?.trim() || !newGotcha.title?.trim() || !newGotcha.description?.trim()) return;
    const gotcha: SkillGotcha = { id: newGotcha.id.trim(), title: newGotcha.title.trim(), description: newGotcha.description.trim(), severity: newGotcha.severity || 'medium', solution: newGotcha.solution?.trim() || '' };
    setFormData(prev => ({ ...prev, gotchas: [...prev.gotchas, gotcha] }));
    setNewGotcha({ id: '', title: '', description: '', severity: 'medium', solution: '' });
  };
  const removeGotcha = (id: string) => setFormData(prev => ({ ...prev, gotchas: prev.gotchas.filter(g => g.id !== id) }));

  const toggleHelperScript = (scriptId: string) => setFormData(prev => ({ ...prev, helperScripts: prev.helperScripts.includes(scriptId) ? prev.helperScripts.filter(s => s !== scriptId) : [...prev.helperScripts, scriptId] }));

  const addReference = () => { if (referenceInput.trim()) { setFormData(prev => ({ ...prev, files: { ...prev.files, references: [...prev.files.references, referenceInput.trim()] } })); setReferenceInput(''); } };
  const removeReference = (ref: string) => setFormData(prev => ({ ...prev, files: { ...prev.files, references: prev.files.references.filter(r => r !== ref) } }));
  const addAsset = () => { if (assetInput.trim()) { setFormData(prev => ({ ...prev, files: { ...prev.files, assets: [...prev.files.assets, assetInput.trim()] } })); setAssetInput(''); } };
  const removeAsset = (asset: string) => setFormData(prev => ({ ...prev, files: { ...prev.files, assets: prev.files.assets.filter(a => a !== asset) } }));

  const addDependency = () => { if (dependencyInput.trim()) { setFormData(prev => ({ ...prev, dependencies: [...prev.dependencies, dependencyInput.trim()] })); setDependencyInput(''); } };
  const removeDependency = (dep: string) => setFormData(prev => ({ ...prev, dependencies: prev.dependencies.filter(d => d !== dep) }));

  const renderScenarioTree = () => (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {allScenarios.map(scenario => {
        const isSelected = formData.domain.includes(scenario.id);
        return (
          <div key={scenario.id} onClick={() => toggleDomain(scenario.id)} className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-gray-50 ring-1 ring-gray-200' : 'hover:bg-gray-50'}`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {isSelected && <CheckCircle size={12} className="text-white" />}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">{scenario.name}</span>
              <p className="text-xs text-gray-500">{scenario.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const stepTitles = ['基础信息', '触发条件', '接口定义', '实现与文档', '性能与依赖'];

  // Apple Style Components
  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-950/5 ${className}`}>{children}</div>
  );

  const SectionTitle = ({ children, description }: { children: React.ReactNode; description?: string }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all ${props.className || ''}`} />
  );

  const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none ${props.className || ''}`} />
  );

  return (
    <div className="h-full flex flex-col bg-gray-50/50">
      {/* Header - Apple Style */}
      <div className="flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate('/skills')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">注册新技能</h1>
            <p className="text-sm text-gray-500">创建并配置 AI 技能</p>
          </div>
        </div>

        {/* Step Indicator - Minimal */}
        <div className="flex items-center gap-2">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <React.Fragment key={idx}>
                <button onClick={() => setCurrentStep(stepNum)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive ? 'bg-gray-900 text-white' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${isActive ? 'bg-white/20' : isCompleted ? 'bg-gray-200' : 'bg-gray-100'}`}>
                    {isCompleted ? <CheckCircle size={12} /> : stepNum}
                  </span>
                  <span className="hidden lg:inline">{title}</span>
                </button>
                {idx < stepTitles.length - 1 && <ChevronRight size={14} className="text-gray-300" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-0.5 bg-gray-200">
        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(currentStep / 5) * 100}%` }} />
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mx-8 mt-6">
          <Card className="p-4 bg-red-50/50">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">请完善以下信息</p>
                <ul className="mt-1 space-y-1">
                  {errors.map((err, idx) => <li key={idx} className="text-sm text-red-700">{err}</li>)}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: 基础信息 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="p-8">
                <SectionTitle description="定义技能的基本信息和分类">基础信息</SectionTitle>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label required>技能 ID</Label>
                    <Input value={formData.skill_id} onChange={e => setFormData(p => ({ ...p, skill_id: e.target.value }))} placeholder="coating_thickness_control" />
                    <p className="text-xs text-gray-500 mt-2">小写字母、数字和下划线</p>
                  </div>
                  <div>
                    <Label required>版本</Label>
                    <Input value={formData.version} onChange={e => setFormData(p => ({ ...p, version: e.target.value }))} placeholder="1.0.0" />
                  </div>
                </div>
                <div className="mb-6">
                  <Label required>技能名称</Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="涂布厚度智能控制" />
                </div>
                <div className="mb-6">
                  <Label required>技能描述</Label>
                  <TextArea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="当用户需要...时调用此 Skill" rows={3} />
                  <p className="text-xs text-gray-500 mt-2">描述应该说明何时触发，而非功能是什么</p>
                </div>
              </Card>

              <Card className="p-8">
                <SectionTitle description="选择符合技能特性的分类">分类</SectionTitle>
                <div className="grid grid-cols-5 gap-4">
                  {SKILL_CATEGORIES.map(cat => {
                    const Icon = categoryIcons[cat.id] || Box;
                    const isSelected = formData.category === cat.id;
                    return (
                      <button key={cat.id} onClick={() => setFormData(p => ({ ...p, category: cat.id as SkillCategory }))} className={`p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                        <Icon size={24} className={`mb-3 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{cat.name}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-8">
                <SectionTitle description="选择技能适用的业务场景">应用场景</SectionTitle>
                {formData.domain.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.domain.map(domainId => {
                      const scenario = allScenarios.find(s => s.id === domainId);
                      return scenario ? (
                        <span key={domainId} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {scenario.name}
                          <button onClick={() => toggleDomain(domainId)} className="ml-2 hover:text-red-500"><Trash2 size={14} /></button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                <button onClick={() => setShowScenarioSelector(!showScenarioSelector)} className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  {showScenarioSelector ? '收起场景列表' : '+ 添加场景'}
                </button>
                {showScenarioSelector && <div className="mt-4 pt-4 border-t border-gray-100">{renderScenarioTree()}</div>}
              </Card>

              <Card className="p-8">
                <SectionTitle description="添加技能的能力标签">标签</SectionTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.capability_tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addTag()} placeholder="输入标签后按回车" className="flex-1" />
                  <button onClick={addTag} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"><Plus size={18} /></button>
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: 触发条件 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card className="p-8">
                <SectionTitle description="明确说明何时应该调用此技能">触发条件描述</SectionTitle>
                <TextArea value={formData.triggerConditions.description} onChange={e => setFormData(p => ({ ...p, triggerConditions: { ...p.triggerConditions, description: e.target.value } }))} placeholder="例如：在原材料入库检验环节，当质检员输入批次号时触发..." rows={3} />
              </Card>

              <Card className="p-8">
                <SectionTitle description="用户可能如何描述触发此技能的需求">触发示例</SectionTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.triggerConditions.examples.map((example, idx) => (
                    <span key={idx} className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm border border-green-100">
                      &ldquo;{example}&rdquo;
                      <button onClick={() => removeTriggerExample(example)} className="ml-2 hover:text-red-500"><Trash2 size={14} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={triggerExampleInput} onChange={e => setTriggerExampleInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addTriggerExample()} placeholder="例如：分析批次202403001的光谱数据" className="flex-1" />
                  <button onClick={addTriggerExample} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"><Plus size={18} /></button>
                </div>
              </Card>

              <Card className="p-8">
                <SectionTitle description="用于意图识别的关键词">触发关键词</SectionTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.triggerConditions.keywords.map((keyword, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                      {keyword}
                      <button onClick={() => removeTriggerKeyword(keyword)} className="ml-2 hover:text-red-500"><Trash2 size={14} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={triggerKeywordInput} onChange={e => setTriggerKeywordInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addTriggerKeyword()} placeholder="例如：光谱、纯度、检验" className="flex-1" />
                  <button onClick={addTriggerKeyword} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"><Plus size={18} /></button>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: 接口定义 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card className="p-8">
                <SectionTitle description="列出使用此技能时可能遇到的常见问题和陷阱">Gotchas（常见坑点）</SectionTitle>
                {formData.gotchas.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {formData.gotchas.map(gotcha => (
                      <div key={gotcha.id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-xs rounded-full border ${severityColors[gotcha.severity]}`}>{gotcha.severity}</span>
                              <span className="font-medium text-gray-900">{gotcha.title}</span>
                            </div>
                            <p className="text-sm text-gray-600">{gotcha.description}</p>
                            {gotcha.solution && <p className="text-sm text-green-600 mt-1">解决方案：{gotcha.solution}</p>}
                          </div>
                          <button onClick={() => removeGotcha(gotcha.id)} className="ml-4 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={newGotcha.id} onChange={e => setNewGotcha(p => ({ ...p, id: e.target.value }))} placeholder="坑点 ID" />
                    <select value={newGotcha.severity} onChange={e => setNewGotcha(p => ({ ...p, severity: e.target.value as any }))} className="px-4 py-3 bg-white border-0 rounded-xl text-sm">
                      <option value="low">低</option><option value="medium">中</option><option value="high">高</option><option value="critical">严重</option>
                    </select>
                  </div>
                  <Input value={newGotcha.title} onChange={e => setNewGotcha(p => ({ ...p, title: e.target.value }))} placeholder="坑点标题" />
                  <TextArea value={newGotcha.description} onChange={e => setNewGotcha(p => ({ ...p, description: e.target.value }))} placeholder="详细描述" rows={2} />
                  <TextArea value={newGotcha.solution} onChange={e => setNewGotcha(p => ({ ...p, solution: e.target.value }))} placeholder="解决方案（可选）" rows={2} />
                  <button onClick={addGotcha} disabled={!newGotcha.id?.trim() || !newGotcha.title?.trim() || !newGotcha.description?.trim()} className="w-full py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-200 disabled:opacity-50">添加坑点</button>
                </div>
              </Card>

              <Card className="p-8">
                <SectionTitle description="定义技能的输入和输出参数">接口参数</SectionTitle>
                <div className="flex gap-4 mb-6">
                  <button onClick={() => setSchemaMode('input')} className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${schemaMode === 'input' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>输入参数</button>
                  <button onClick={() => setSchemaMode('output')} className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${schemaMode === 'output' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>输出参数</button>
                </div>
                <div className="flex gap-2 mb-4">
                  <Input value={newFieldKey} onChange={e => setNewFieldKey(e.target.value)} onKeyPress={e => e.key === 'Enter' && addSchemaField()} placeholder="参数名称" className="flex-1" />
                  <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)} className="px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm">
                    <option value="string">字符串</option><option value="number">数值</option><option value="boolean">布尔</option><option value="array">数组</option><option value="object">对象</option>
                  </select>
                  <button onClick={addSchemaField} className="px-4 py-2 bg-gray-900 text-white rounded-xl"><Plus size={18} /></button>
                </div>
                <div className="space-y-2">
                  {(schemaMode === 'input' ? inputSchemaFields : outputSchemaFields).map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Database size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{field.key}</span>
                        <span className="px-2 py-0.5 bg-white text-gray-500 text-xs rounded-lg">{field.type}</span>
                      </div>
                      <button onClick={() => removeSchemaField(field.key, schemaMode)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Step 4: 实现与文档 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><History size={20} className="text-purple-600" /></div>
                    <div>
                      <h4 className="font-medium text-gray-900">记忆机制</h4>
                      <p className="text-xs text-gray-500">可选</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mb-3">
                    <input type="checkbox" checked={formData.memoryEnabled} onChange={e => setFormData(p => ({ ...p, memoryEnabled: e.target.checked }))} className="rounded" />
                    <span className="text-sm text-gray-700">启用记忆功能</span>
                  </label>
                  {formData.memoryEnabled && <Input value={formData.memoryLogFile} onChange={e => setFormData(p => ({ ...p, memoryLogFile: e.target.value }))} placeholder="execution_history.log" />}
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Wrench size={20} className="text-green-600" /></div>
                    <div>
                      <h4 className="font-medium text-gray-900">辅助脚本</h4>
                      <p className="text-xs text-gray-500">可选</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableHelperScripts.map(script => (
                      <label key={script.id} className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${formData.helperScripts.includes(script.id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        <input type="checkbox" checked={formData.helperScripts.includes(script.id)} onChange={() => toggleHelperScript(script.id)} className="hidden" />
                        {script.name}
                      </label>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><FolderOpen size={20} className="text-orange-600" /></div>
                    <div>
                      <h4 className="font-medium text-gray-900">文档与资源</h4>
                      <p className="text-xs text-gray-500">可选</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>参考文档</span>
                      <span className="text-gray-400">{formData.files.references.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>静态资源</span>
                      <span className="text-gray-400">{formData.files.assets.length}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-8">
                <SectionTitle description="编写技能的核心代码逻辑">脚本代码</SectionTitle>
                <div className="flex gap-2 mb-4">
                  <select value={formData.files.scriptLang} onChange={e => { const lang = e.target.value as 'python' | 'javascript'; setFormData(p => ({ ...p, files: { ...p.files, scriptLang: lang, script: codeTemplates[lang] } })); }} className="px-4 py-2 bg-gray-100 border-0 rounded-xl text-sm font-medium">
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                  <span className="flex-1"></span>
                  <span className="text-sm text-gray-500 py-2">配置文件 (JSON):</span>
                  <Input value={formData.files.config} onChange={e => setFormData(p => ({ ...p, files: { ...p.files, config: e.target.value } }))} placeholder='{"key": "value"}' className="w-48" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <TextArea value={formData.files.script} onChange={e => setFormData(p => ({ ...p, files: { ...p.files, script: e.target.value } }))} className="font-mono text-sm bg-gray-900 text-gray-100" rows={16} spellCheck={false} />
                  <div className="space-y-4">
                    <TextArea value={formData.files.readme} onChange={e => setFormData(p => ({ ...p, files: { ...p.files, readme: e.target.value } }))} placeholder="# README 文档" className="h-48" />
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h5 className="font-medium text-gray-900 mb-2">参考文档</h5>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.files.references.map((ref, idx) => <span key={idx} className="px-2 py-1 bg-white text-gray-600 text-xs rounded-lg">{ref}<button onClick={() => removeReference(ref)} className="ml-1 text-gray-400">×</button></span>)}
                      </div>
                      <div className="flex gap-2">
                        <Input value={referenceInput} onChange={e => setReferenceInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addReference()} placeholder="添加文档" className="flex-1" />
                        <button onClick={addReference} className="px-3 py-2 bg-gray-200 rounded-lg text-gray-600"><Plus size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 5: 性能与依赖 */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Zap size={24} className="text-blue-600" /></div>
                  <h4 className="font-medium text-gray-900 mb-1">平均延迟</h4>
                  <p className="text-3xl font-semibold text-gray-900 mb-4">{formData.latency}<span className="text-sm font-normal text-gray-500 ml-1">ms</span></p>
                  <input type="range" min="10" max="5000" value={formData.latency} onChange={e => setFormData(p => ({ ...p, latency: parseInt(e.target.value) }))} className="w-full" />
                </Card>
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><CheckCircle size={24} className="text-green-600" /></div>
                  <h4 className="font-medium text-gray-900 mb-1">准确率</h4>
                  <p className="text-3xl font-semibold text-gray-900 mb-4">{(formData.accuracy_score * 100).toFixed(0)}<span className="text-sm font-normal text-gray-500 ml-1">%</span></p>
                  <input type="range" min="0" max="100" value={Math.round(formData.accuracy_score * 100)} onChange={e => setFormData(p => ({ ...p, accuracy_score: parseInt(e.target.value) / 100 }))} className="w-full" />
                </Card>
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Cpu size={24} className="text-purple-600" /></div>
                  <h4 className="font-medium text-gray-900 mb-1">成本系数</h4>
                  <p className="text-3xl font-semibold text-gray-900 mb-4">{formData.cost.toFixed(1)}</p>
                  <input type="range" min="0" max="1" step="0.1" value={formData.cost} onChange={e => setFormData(p => ({ ...p, cost: parseFloat(e.target.value) }))} className="w-full" />
                </Card>
              </div>

              <Card className="p-8">
                <SectionTitle description="此技能依赖的其他技能">依赖技能</SectionTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.dependencies.map((dep, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      <GitBranch size={14} className="mr-1.5" />
                      {dep}
                      <button onClick={() => removeDependency(dep)} className="ml-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select value={dependencyInput} onChange={e => setDependencyInput(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-xl text-sm">
                    <option value="">选择依赖技能</option>
                    {MOCK_SKILLS.map(skill => <option key={skill.skill_id} value={skill.skill_id}>{skill.name}</option>)}
                  </select>
                  <button onClick={addDependency} disabled={!dependencyInput} className="px-4 py-2 bg-gray-900 text-white rounded-xl disabled:opacity-50"><Plus size={18} /></button>
                </div>
              </Card>

              <Card className="p-8 bg-gray-900 text-white">
                <h3 className="text-lg font-semibold mb-4">技能预览</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-400">ID:</span> <span className="font-mono">{formData.skill_id || '-'}</span></div>
                  <div><span className="text-gray-400">名称:</span> {formData.name || '-'}</div>
                  <div><span className="text-gray-400">分类:</span> {SKILL_CATEGORIES.find(c => c.id === formData.category)?.name || '-'}</div>
                  <div><span className="text-gray-400">版本:</span> {formData.version}</div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 bg-white border-t border-gray-200 flex justify-between items-center">
        <button type="button" onClick={() => navigate('/skills')} className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium">取消</button>
        <div className="flex gap-3">
          {currentStep > 1 && <button type="button" onClick={handlePrev} className="px-6 py-2.5 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50">上一步</button>}
          {currentStep < 5 ? (
            <button type="button" onClick={handleNext} className="px-6 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 flex items-center gap-2">下一步 <ChevronRight size={18} /></button>
          ) : (
            <button type="button" onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 flex items-center gap-2"><Save size={18} /> 提交注册</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillRegistration;