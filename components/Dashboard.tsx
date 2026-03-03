import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { RECENT_EXECUTIONS } from '../constants';
import ProductionSalesMetricsBoard from './ProductionSalesMetricsBoard';
import ProductOperationsBoard from './ProductOperationsBoard';

const data = [
  { name: '08:00', success: 40, latency: 240 },
  { name: '09:00', success: 30, latency: 139 },
  { name: '10:00', success: 20, latency: 980 },
  { name: '11:00', success: 27, latency: 390 },
  { name: '12:00', success: 18, latency: 480 },
  { name: '13:00', success: 23, latency: 380 },
  { name: '14:00', success: 34, latency: 430 },
];

const KPICard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="text-gray-500 text-sm font-medium">{title}</div>
      <div className="p-2 bg-[#007AFF]/10 rounded-xl text-[#007AFF]">{icon}</div>
    </div>
    <div className="flex items-baseline">
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
      {trend && <div className="ml-2 text-sm text-[#34C759] font-semibold">{trend}</div>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 产销协同指标看板 */}
      <ProductionSalesMetricsBoard />

      {/* 产品经营看板 - 乘用车/商用车/储能 */}
      <ProductOperationsBoard />

      {/* 原有 KPI 卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="总执行次数" value="1,284" icon={<Activity size={20} />} trend="+12%" />
        <KPICard title="成功率" value="98.2%" icon={<CheckCircle size={20} />} trend="+0.4%" />
        <KPICard title="平均时延" value="342ms" icon={<Clock size={20} />} trend="-15ms" />
        <KPICard title="活跃技能" value="42" icon={<AlertTriangle size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm h-[400px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">执行性能趋势</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8E8E93'}} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#8E8E93'}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#8E8E93'}} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.95)' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="success" stroke="#007AFF" strokeWidth={3} dot={false} name="请求数/分" />
              <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#FF9500" strokeWidth={3} dot={false} name="时延 (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm h-[400px]">
           <h3 className="text-lg font-semibold text-gray-900 mb-6">技能调用分布</h3>
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#F2F2F7'}} />
              <Bar dataKey="success" fill="#007AFF" radius={[8, 8, 0, 0]} name="调用次数" />
            </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">近期任务</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">任务 ID</th>
                <th className="px-6 py-4">任务描述</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">调用技能</th>
                <th className="px-6 py-4">耗时</th>
                <th className="px-6 py-4">结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_EXECUTIONS.map((exec) => (
                <tr key={exec.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[#007AFF]">{exec.id}</td>
                  <td className="px-6 py-4">{exec.task_text}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      exec.status === 'success' ? 'bg-[#34C759]/10 text-[#34C759]' :
                      exec.status === 'failed' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-[#FF9500]/10 text-[#FF9500]'
                    }`}>
                      {exec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {exec.skills_used.map(s => (
                      <span key={s} className="mr-1 bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">{s}</span>
                    ))}
                  </td>
                  <td className="px-6 py-4">{exec.duration}ms</td>
                  <td className="px-6 py-4 truncate max-w-xs" title={exec.result_summary}>{exec.result_summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;