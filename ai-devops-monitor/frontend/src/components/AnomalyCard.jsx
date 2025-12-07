import React from 'react';
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

const AnomalyCard = ({ anomaly }) => {
  const { log, anomaly_score } = anomaly;
  
  const getSeverity = (score) => {
    if (score >= 0.8) return { label: 'Critical', color: 'danger' };
    if (score >= 0.6) return { label: 'High', color: 'warning' };
    if (score >= 0.4) return { label: 'Medium', color: 'primary' };
    return { label: 'Low', color: 'gray' };
  };

  const severity = getSeverity(anomaly_score);

  return (
    <div className={`border-l-4 border-${severity.color}-500 bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className={`h-5 w-5 text-${severity.color}-600`} />
          <span className={`badge badge-${severity.color === 'danger' ? 'error' : severity.color === 'warning' ? 'warning' : 'info'}`}>
            {severity.label}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-${severity.color}-600">
            {(anomaly_score * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">Anomaly Score</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Clock className="h-4 w-4" />
          <span>{log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : 'N/A'}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-200">Service:</span>
          <span className="text-sm text-gray-300">{log.service}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`badge badge-${log.level === 'ERROR' || log.level === 'CRITICAL' ? 'error' : 'warning'}`}>
            {log.level}
          </span>
        </div>

        <div className="mt-3 p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-200 font-mono">
            {log.message}
          </p>
        </div>
      </div>
    </div>
  );
};

const AnomalyList = ({ anomalies, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-gray-300">Loading anomalies...</p>
      </div>
    );
  }

  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-300">No anomalies detected</p>
        <p className="text-sm text-gray-400 mt-1">System is running normally</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {anomalies.map((anomaly, index) => (
        <AnomalyCard key={index} anomaly={anomaly} />
      ))}
    </div>
  );
};

export default AnomalyList;
export { AnomalyCard };
