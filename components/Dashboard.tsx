import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Zap, Database } from 'lucide-react';
import { RECENT_EXECUTIONS } from '../constants';

const data = [
  { name: '08:00', success: 40, latency: 240 },
  { name: '09:00', success: 30, latency: 139 },
  { name: '10:00', success: 20, latency: 980 },
  { name: '11:00', success: 27, latency: 390 },
  { name: '12:00', success: 18, latency: 480 },
  { name: '13:00', success: 23, latency: 380 },
  { name: '14:00', success: 34, latency: 430 },
];

// 简洁的KPI卡片 - 参考UI design风格
const KPICard = ({ title, value, subtext, icon: Icon }: { title: string, value: string, subtext?: string, icon: any }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-gray-500 text-sm mb-1">{title}</div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
      </div>
      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
        <Icon size={18} className="text-gray-600" />
      </div>
    </div>
  </div>
);

// 快捷操作卡片
const QuickActionCard = ({ title, desc, onClick }: { title: string, desc: string, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
  >
    <div className="font-medium text-gray-900 text-sm group-hover:text-gray-700">{title}</div>
    <div className="text-xs text-gray-500 mt-1">{desc}</div>
  </button>
);

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">欢迎使用 Nexus Platform</h2>
            <p className="text-sm text-gray-500 mt-1">今日概览 · 2026年3月16日</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-green-700 rounded-full text-sm">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            系统正常运行
          </div>
        </div>
      </div>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="总执行次数" value="1,284" subtext="较昨日 +12%" icon={Activity} />
        <KPICard title="成功率" value="98.2%" subtext="较昨日 +0.4%" icon={CheckCircle} />
        <KPICard title="平均时延" value="342ms" subtext="较昨日 -15ms" icon={Clock} />
        <KPICard title="活跃技能" value="42" subtext="+3 新增" icon={Zap} />
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-3 gap-4">
        <QuickActionCard
          title="新建推演任务"
          desc="创建业务场景推演分析任务"
        />
        <QuickActionCard
          title="查看数据血缘"
          desc="追踪数据来源和流向关系"
        />
        <QuickActionCard
          title="技能市场"
          desc="浏览和安装新的技能"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">执行性能趋势</h3>
            <select className="text-sm border-none bg-gray-50 rounded-lg px-3 py-1.5 text-gray-600 outline-none">
              <option>最近24小时</option>
              <option>最近7天</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #F0F0F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Line type="monotone" dataKey="success" stroke="#111827" strokeWidth={2} dot={{fill: '#111827', strokeWidth: 0, r: 3}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">技能调用分布</h3>
            <button className="text-sm text-gray-500 hover:text-gray-700">查看全部</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F9FAFB'}} />
                <Bar dataKey="success" fill="#111827" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 近期任务 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">近期任务</h3>
          <button className="text-sm text-gray-500 hover:text-gray-700">查看全部</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">任务ID</th>
                <th className="px-6 py-3 font-medium">描述</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium">技能</th>
                <th className="px-6 py-3 font-medium">耗时</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_EXECUTIONS.slice(0, 5).map((exec) => (
                <tr key={exec.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-gray-600">{exec.id}</td>
                  <td className="px-6 py-3 text-gray-900">{exec.task_text}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      exec.status === 'success' ? 'bg-gray-50 text-green-700' :
                      exec.status === 'failed' ? 'bg-gray-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {exec.status === 'success' ? '成功' : exec.status === 'failed' ? '失败' : '运行中'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      {exec.skills_used.slice(0, 2).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{s}</span>
                      ))}
                      {exec.skills_used.length > 2 && <span className="text-xs text-gray-400">+{exec.skills_used.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{exec.duration}ms</td>
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