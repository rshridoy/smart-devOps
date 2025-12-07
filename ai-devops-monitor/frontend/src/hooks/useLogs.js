import { useState, useEffect, useCallback } from 'react';
import { logsAPI } from '../utils/api';

export const useLogs = (autoRefresh = false, interval = 5000) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 100,
    level: null,
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await logsAPI.getAll(filters);
      setLogs(response.logs || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const searchLogs = useCallback(async (query) => {
    try {
      setLoading(true);
      const response = await logsAPI.search(query, filters.limit);
      setLogs(response.logs || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (autoRefresh) {
      const intervalId = setInterval(fetchLogs, interval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, interval, fetchLogs]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    searchLogs,
    filters,
    setFilters,
  };
};
