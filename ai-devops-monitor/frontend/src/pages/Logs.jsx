import React from 'react';
import { useLogs } from '../hooks/useLogs';
import LogTable from '../components/LogTable';

const Logs = () => {
  const { logs, loading, fetchLogs, filters, setFilters } = useLogs(true, 10000);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Logs</h1>
        <p className="text-gray-400 mt-1">View and search system logs in real-time</p>
      </div>

      <LogTable logs={logs} loading={loading} onRefresh={fetchLogs} />
    </div>
  );
};

export default Logs;
