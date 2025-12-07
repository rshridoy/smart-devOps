import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PredictionChart = ({ prediction, service }) => {
  if (!prediction) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-300">No prediction data available</p>
      </div>
    );
  }

  const { probability, prediction: riskLevel, confidence, features } = prediction;

  const getRiskColor = (level) => {
    if (level === 'high_risk') return 'danger';
    if (level === 'medium_risk') return 'warning';
    return 'success';
  };

  const riskColor = getRiskColor(riskLevel);

  // Gauge chart data
  const gaugeData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        label: 'Failure Probability',
        data: [40, 30, 30],
        backgroundColor: [
          'rgba(34, 197, 94, 0.2)',
          'rgba(245, 158, 11, 0.2)',
          'rgba(239, 68, 68, 0.2)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Failure Prediction</h3>
          {service && (
            <span className="badge badge-info">{service}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Probability Gauge */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-32 h-32 mx-auto">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - probability)}`}
                  className={`text-${riskColor}-600`}
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-3xl font-bold text-gray-100">{(probability * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-400">Probability</div>
              </div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-${riskColor}-100`}>
              {riskLevel === 'high_risk' ? (
                <TrendingUp className={`h-12 w-12 text-${riskColor}-600`} />
              ) : riskLevel === 'medium_risk' ? (
                <AlertCircle className={`h-12 w-12 text-${riskColor}-600`} />
              ) : (
                <TrendingDown className={`h-12 w-12 text-${riskColor}-600`} />
              )}
            </div>
            <div className="mt-4">
              <div className={`text-lg font-bold text-${riskColor}-600`}>
                {riskLevel.replace('_', ' ').toUpperCase()}
              </div>
              <div className="text-sm text-gray-400">Risk Level</div>
            </div>
          </div>

          {/* Confidence */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {(confidence * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">Confidence</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      {features && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-100 mb-4">Prediction Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-300">Total Logs</div>
              <div className="text-2xl font-bold text-gray-100">{features.total_logs}</div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-300">Error Count</div>
              <div className="text-2xl font-bold text-danger-400">{features.error_count}</div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-300">Error Rate</div>
              <div className="text-2xl font-bold text-warning-400">
                {(features.error_rate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className={`card border-l-4 border-${riskColor}-500`}>
        <h3 className="text-lg font-bold text-gray-100 mb-3">Recommendation</h3>
        <div className="space-y-2 text-gray-200">
          {riskLevel === 'high_risk' && (
            <>
              <p>⚠️ <strong>Immediate attention required!</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Check service logs for errors</li>
                <li>Review recent deployments</li>
                <li>Scale resources if needed</li>
                <li>Alert on-call engineer</li>
              </ul>
            </>
          )}
          {riskLevel === 'medium_risk' && (
            <>
              <p>⚡ <strong>Monitor closely</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Increase monitoring frequency</li>
                <li>Review error patterns</li>
                <li>Prepare rollback plan</li>
              </ul>
            </>
          )}
          {riskLevel === 'low_risk' && (
            <>
              <p>✅ <strong>System is healthy</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Continue normal operations</li>
                <li>Routine monitoring in place</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
