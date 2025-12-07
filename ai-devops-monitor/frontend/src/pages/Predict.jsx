import React, { useState } from 'react';
import { analysisAPI, logsAPI } from '../utils/api';
import PredictionChart from '../components/PredictionChart';
import RCABox from '../components/RCABox';
import { useLogs } from '../hooks/useLogs';

const Predict = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState('all');
  const { logs } = useLogs();

  const services = [...new Set(logs.map(log => log.service))].sort();

  const handlePredict = async () => {
    setLoading(true);
    try {
      const service = selectedService === 'all' ? null : selectedService;
      const result = await analysisAPI.predict(service);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRCA = async (logIds, context) => {
    const result = await analysisAPI.performRCA(logIds, context);
    return result;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Failure Prediction & Analysis</h1>
        <p className="text-gray-400 mt-1">AI-powered failure prediction and root cause analysis</p>
      </div>

      {/* Prediction Controls */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Run Prediction</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="input flex-1"
          >
            <option value="all">All Services</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          <button
            onClick={handlePredict}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Analyzing...' : 'Run Prediction'}
          </button>
        </div>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <PredictionChart 
          prediction={prediction} 
          service={selectedService !== 'all' ? selectedService : null} 
        />
      )}

      {/* Root Cause Analysis */}
      <RCABox logs={logs} onAnalyze={handleRCA} />
    </div>
  );
};

export default Predict;
