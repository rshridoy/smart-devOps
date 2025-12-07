import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, TrendingUp, Server, Database, Zap } from 'lucide-react';
import { logsAPI, analysisAPI, healthAPI } from '../utils/api';
import { useFetch } from '../hooks/useFetch';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLogs: 0,
    errors: 0,
    warnings: 0,
    anomalies: 0,
    services: 0
  });

  const { data: logs, loading: logsLoading } = useFetch(() => logsAPI.getAll({ limit: 100 }), []);
  const { data: anomalyData } = useFetch(() => analysisAPI.getAnomalies(100), []);
  const { data: healthData } = useFetch(() => healthAPI.check(), []);

  useEffect(() => {
    if (logs?.logs) {
      const logList = logs.logs;
      setStats({
        totalLogs: logList.length,
        errors: logList.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length,
        warnings: logList.filter(l => l.level === 'WARNING').length,
        anomalies: anomalyData?.anomalies_detected || 0,
        services: new Set(logList.map(l => l.service)).size
      });
    }
  }, [logs, anomalyData]);

  // Level distribution chart data
  const levelData = {
    labels: ['Debug', 'Info', 'Warning', 'Error', 'Critical'],
    datasets: [{
      data: logs?.logs ? [
        logs.logs.filter(l => l.level === 'DEBUG').length,
        logs.logs.filter(l => l.level === 'INFO').length,
        logs.logs.filter(l => l.level === 'WARNING').length,
        logs.logs.filter(l => l.level === 'ERROR').length,
        logs.logs.filter(l => l.level === 'CRITICAL').length,
      ] : [0, 0, 0, 0, 0],
      backgroundColor: [
        'rgba(156, 163, 175, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(127, 29, 29, 0.8)',
      ],
      borderColor: [
        'rgba(156, 163, 175, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(127, 29, 29, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 15,
    }]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(243, 244, 246)',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgba(55, 65, 81, 1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <div className="group card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Gradient Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${color}-500 to-${color}-600 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-100 mb-1">{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center space-x-1">
              <div className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-danger-900 bg-opacity-30 text-danger-400' : 'bg-success-900 bg-opacity-30 text-success-400'}`}>
                <span>{trend > 0 ? '↑' : '↓'}</span>
                <span>{Math.abs(trend)}%</span>
              </div>
              <span className="text-xs text-gray-500">vs last hour</span>
            </div>
          )}
        </div>
        <div className={`relative p-4 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-8 w-8 text-white" />
          <div className={`absolute inset-0 bg-${color}-400 rounded-xl opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300`}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-100 mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Real-time monitoring and analytics</p>
        </div>
        <div className="flex items-center space-x-3 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-success-500 animate-pulse"></div>
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-success-500 animate-ping"></div>
          </div>
          <span className="text-sm font-medium text-gray-200">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Activity}
          title="Total Logs"
          value={stats.totalLogs}
          color="primary"
        />
        <StatCard
          icon={AlertTriangle}
          title="Errors"
          value={stats.errors}
          color="danger"
          trend={stats.errors > 10 ? 12 : -5}
        />
        <StatCard
          icon={TrendingUp}
          title="Warnings"
          value={stats.warnings}
          color="warning"
        />
        <StatCard
          icon={Server}
          title="Services"
          value={stats.services}
          color="success"
        />
      </div>

      {/* Charts Row - Centered */}
      <div className="flex justify-center">
        {/* Log Level Distribution */}
        <div className="w-full max-w-3xl group card hover:shadow-2xl transition-all duration-300 border-2 border-gray-700 hover:border-primary-500 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-gradient-to-b from-primary-400 via-primary-500 to-primary-600 rounded-full shadow-lg shadow-primary-500/50"></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-100">Log Level Distribution</h2>
                <p className="text-sm text-gray-400 mt-1">System-wide log analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400 bg-gray-700 bg-opacity-50 px-4 py-2 rounded-full border border-gray-600">
              <Activity className="h-4 w-4" />
              <span className="font-semibold">{logs?.logs?.length || 0}</span>
              <span>logs</span>
            </div>
          </div>
          
          <div className="h-96 flex items-center justify-center relative">
            {!logsLoading && logs?.logs?.length > 0 ? (
              <Doughnut data={levelData} options={chartOptions} />
            ) : logsLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <p className="text-gray-400 text-sm">Loading data...</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700 rounded-full mb-4">
                  <Activity className="h-10 w-10 text-gray-500" />
                </div>
                <p className="text-gray-400 text-lg font-medium">No log data available</p>
                <p className="text-gray-500 text-sm mt-1">Start sending logs to see analytics</p>
              </div>
            )}
          </div>
          
          {/* Enhanced Statistics Grid */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-5 gap-3">
              {['Debug', 'Info', 'Warning', 'Error', 'Critical'].map((level, idx) => {
                const count = logs?.logs ? logs.logs.filter(l => l.level === level.toUpperCase()).length : 0;
                const colors = [
                  { bg: 'bg-gray-700', text: 'text-gray-400', border: 'border-gray-600' },
                  { bg: 'bg-blue-900 bg-opacity-20', text: 'text-blue-400', border: 'border-blue-700' },
                  { bg: 'bg-yellow-900 bg-opacity-20', text: 'text-yellow-400', border: 'border-yellow-700' },
                  { bg: 'bg-red-900 bg-opacity-20', text: 'text-red-400', border: 'border-red-700' },
                  { bg: 'bg-red-900 bg-opacity-30', text: 'text-red-300', border: 'border-red-600' }
                ];
                const style = colors[idx];
                return (
                  <div key={level} className={`${style.bg} ${style.border} border rounded-xl p-3 hover:scale-105 transition-transform duration-200 cursor-pointer`}>
                    <div className={`text-xs font-bold uppercase tracking-wider ${style.text} mb-2`}>{level}</div>
                    <div className="text-2xl font-bold text-gray-100">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Anomalies */}
      {anomalyData?.anomalies && anomalyData.anomalies.length > 0 && (
        <div className="card border-l-4 border-danger-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-danger-500 to-danger-600 opacity-5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger-500 bg-opacity-20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-danger-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">Recent Anomalies</h2>
                  <p className="text-sm text-gray-400 mt-1">AI-detected unusual patterns</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-danger-900 bg-opacity-30 rounded-full border border-danger-700">
                <span className="text-danger-400 font-bold">{anomalyData.anomalies.length}</span>
                <span className="text-gray-400 text-sm ml-1">detected</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {anomalyData.anomalies.slice(0, 5).map((anomaly, index) => (
                <div key={index} className="group flex items-center justify-between p-4 border-2 border-gray-700 rounded-xl hover:bg-gray-700 hover:border-danger-500 transition-all duration-200 hover:shadow-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="badge badge-error shadow-sm">{anomaly.log.level}</span>
                      <span className="text-sm font-semibold text-gray-200 bg-gray-700 px-3 py-1 rounded-full">{anomaly.log.service}</span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">{anomaly.log.message}</p>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-danger-400 mb-1">
                      {(anomaly.anomaly_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
