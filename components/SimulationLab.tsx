import React, { useState } from 'react';
import {
  Beaker, Play, Plus, Trash2, Save, Download, RefreshCw,
  TrendingUp, TrendingDown, Minus, BarChart3, PieChart,
  Activity, Target, AlertTriangle, CheckCircle, Clock,
  ChevronRight, ChevronDown, Settings, Filter, Grid, List,
  GitCompare, Sliders, Zap
} from 'lucide-react';
import { MOCK_SIMULATION_SCENARIOS, MOCK_SIMULATION_RUNS } from '../constants';
import type { SimulationScenario, SimulationRun, WhatIfAnalysis } from '../types';

// Scenario Card Component
const ScenarioCard: React.FC<{
  scenario: SimulationScenario;
  isSelected: boolean;
  onClick: () => void;
}> = ({ scenario, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-50 border-2 border-blue-500'
          : 'bg-white border border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isSelected ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          <Beaker size={20} className={isSelected ? 'text-blue-600' : 'text-gray-500'} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{scenario.name}</h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{scenario.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{scenario.baseParams.length} 参数</span>
            <span>{scenario.variables.length} 变量</span>
            <span>{scenario.outputMetrics.length} 指标</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Parameter Slider Component
const ParameterSlider: React.FC<{
  param: SimulationScenario['baseParams'][0];
  value: any;
  onChange: (value: any) => void;
}> = ({ param, value, onChange }) => {
  if (param.type === 'number' && param.range) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900">{param.name}</span>
          <span className="text-lg font-semibold text-blue-600">{value || param.value}</span>
        </div>
        <input
          type="range"
          min={param.range.min}
          max={param.range.max}
          step={param.range.step}
          value={value || param.value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{param.range.min}</span>
          <span>{param.range.max}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-1">{param.name}</label>
      <input
        type={param.type === 'number' ? 'number' : 'text'}
        value={value || param.value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
      />
    </div>
  );
};

// Results Comparison Component
const ResultsComparison: React.FC<{
  runs: SimulationRun[];
}> = ({ runs }) => {
  if (runs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
        <p>暂无推演结果</p>
        <p className="text-sm mt-2">运行推演后在此对比结果</p>
      </div>
    );
  }

  const metrics = Object.keys(runs[0].results.metrics);

  return (
    <div className="space-y-4">
      {metrics.map(metric => (
        <div key={metric} className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">{metric}</span>
            <span className="text-xs text-gray-500">对比 {runs.length} 次运行</span>
          </div>

          <div className="space-y-2">
            {runs.map((run, idx) => (
              <div key={run.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">运行 {idx + 1}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.min((run.results.metrics[metric] / Math.max(...runs.map(r => r.results.metrics[metric]))) * 100, 100)}%` }}
                  >
                    <span className="text-xs text-white font-medium">{run.results.metrics[metric].toFixed(2)}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  run.results.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                  run.results.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {(run.results.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Simulation Lab Component
const SimulationLab: React.FC = () => {
  const [scenarios] = useState<SimulationScenario[]>(MOCK_SIMULATION_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(MOCK_SIMULATION_SCENARIOS[0]);
  const [viewMode, setViewMode] = useState<'setup' | 'run' | 'compare'>('setup');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [runs, setRuns] = useState<SimulationRun[]>(MOCK_SIMULATION_RUNS);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newRun: SimulationRun = {
      id: `run-${Date.now()}`,
      scenarioId: selectedScenario.id,
      status: 'completed',
      params: parameters,
      results: {
        metrics: {
          deliveryRate: 0.92 + Math.random() * 0.08,
          unitCost: 80 + Math.random() * 20,
          roi: 0.15 + Math.random() * 0.15
        },
        confidence: 0.8 + Math.random() * 0.15,
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        details: {
          timestamp: new Date().toISOString(),
          intermediateResults: {}
        }
      },
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString()
    };

    setRuns([...runs, newRun]);
    setIsRunning(false);
    setViewMode('compare');
  };

  const scenarioRuns = runs.filter(r => r.scenarioId === selectedScenario.id);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">推演实验室</h1>
            <p className="text-sm text-gray-500">What-if 分析与场景推演</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['setup', 'run', 'compare'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode === 'setup' ? '配置' : mode === 'run' ? '运行' : '对比'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Scenarios */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">推演场景</h3>
              <button className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {scenarios.map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={selectedScenario.id === scenario.id}
                onClick={() => {
                  setSelectedScenario(scenario);
                  setParameters({});
                }}
              />
            ))}
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'setup' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">基础参数</h2>
                <div className="grid grid-cols-2 gap-4">
                  {selectedScenario.baseParams.map(param => (
                    <ParameterSlider
                      key={param.name}
                      param={param}
                      value={parameters[param.name]}
                      onChange={(value) => setParameters({ ...parameters, [param.name]: value })}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">推演变量</h2>
                <div className="space-y-4">
                  {selectedScenario.variables.map(variable => (
                    <div key={variable.name} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{variable.name}</span>
                          <p className="text-sm text-gray-500">{variable.description}</p>
                        </div>
                        <span className="text-lg font-semibold text-blue-600">
                          {parameters[variable.name] || variable.baseValue}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={variable.range.min}
                        max={variable.range.max}
                        step={variable.range.step}
                        value={parameters[variable.name] || variable.baseValue}
                        onChange={(e) => setParameters({
                          ...parameters,
                          [variable.name]: parseFloat(e.target.value)
                        })}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">优化目标</h2>
                <div className="space-y-3">
                  {selectedScenario.objectives.map(obj => (
                    <div key={obj.metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target size={18} className="text-blue-500" />
                        <span className="font-medium text-gray-900">{obj.metric}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          obj.target === 'maximize' ? 'bg-green-100 text-green-700' :
                          obj.target === 'minimize' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {obj.target === 'maximize' ? '最大化' :
                           obj.target === 'minimize' ? '最小化' : '目标值'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">权重</span>
                        <span className="font-semibold text-gray-900">{(obj.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {isRunning ? (
                    <><RefreshCw size={20} className="animate-spin" /> 推演中...</>
                  ) : (
                    <><Play size={20} /> 开始推演</>
                  )}
                </button>
              </div>
            </div>
          )}

          {viewMode === 'compare' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">推演结果对比</h2>
                <span className="text-sm text-gray-500">共 {scenarioRuns.length} 次运行</span>
              </div>

              <ResultsComparison runs={scenarioRuns} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationLab;
