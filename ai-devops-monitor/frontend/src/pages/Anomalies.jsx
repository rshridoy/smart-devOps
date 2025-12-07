import React from 'react';
import { useFetch } from '../hooks/useFetch';
import { analysisAPI } from '../utils/api';
import AnomalyList from '../components/AnomalyCard';
import { RefreshCw } from 'lucide-react';

const Anomalies = () => {
  const { data, loading, refetch } = useFetch(() => analysisAPI.getAnomalies(200), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Anomalies</h1>
          <p className="text-gray-400 mt-1">ML-detected anomalies in system logs</p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {data && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-sm text-gray-300">Total Logs Analyzed</div>
            <div className="text-3xl font-bold text-gray-100">{data.total_logs}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-300">Anomalies Detected</div>
            <div className="text-3xl font-bold text-danger-400">{data.anomalies_detected}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-300">Detection Rate</div>
            <div className="text-3xl font-bold text-warning-400">
              {data.total_logs > 0 ? ((data.anomalies_detected / data.total_logs) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      )}

      <AnomalyList anomalies={data?.anomalies} loading={loading} />
    </div>
  );
};

export default Anomalies;
