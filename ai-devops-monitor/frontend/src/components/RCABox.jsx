import React, { useState } from 'react';
import { Sparkles, Send, Loader, AlertTriangle, Lightbulb, CheckCircle, Target, Shield } from 'lucide-react';

const RCABox = ({ logs, onAnalyze }) => {
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [context, setContext] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleLogSelection = (logId) => {
    setSelectedLogs(prev => 
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const handleAnalyze = async () => {
    if (selectedLogs.length === 0) return;
    
    setLoading(true);
    try {
      const result = await onAnalyze(selectedLogs, context);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Log Selection */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-100">AI Root Cause Analysis</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          Select error logs to analyze with AI. The system will identify root causes and suggest fixes.
        </p>

        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {logs && logs.length > 0 ? (
            logs
              .filter(log => log.level === 'ERROR' || log.level === 'CRITICAL')
              .slice(0, 20)
              .map((log, index) => (
                <div
                  key={log._id || index}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedLogs.includes(log._id)
                      ? 'border-primary-500 bg-primary-900 bg-opacity-20'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                  }`}
                  onClick={() => toggleLogSelection(log._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`badge ${log.level === 'CRITICAL' ? 'badge-critical' : 'badge-error'}`}>
                          {log.level}
                        </span>
                        <span className="text-sm font-medium text-gray-200">{log.service}</span>
                        <span className="text-xs text-gray-400">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-300">{log.message}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedLogs.includes(log._id)}
                      onChange={() => toggleLogSelection(log._id)}
                      className="ml-3 h-5 w-5"
                    />
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No error logs available for analysis
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g., recent deployments, configuration changes, known issues..."
              className="input w-full h-24 resize-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={selectedLogs.length === 0 || loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Analyze with AI ({selectedLogs.length} logs selected)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="card border-l-4 border-primary-500 relative overflow-hidden">
          {/* Gradient background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500 to-primary-600 opacity-5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-500 bg-opacity-20 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-100">AI Analysis Results</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm bg-primary-900 bg-opacity-30 px-4 py-2 rounded-full border border-primary-700">
                <Send className="h-4 w-4 text-primary-400" />
                <span className="text-primary-400 font-semibold">{analysis.logs_analyzed || selectedLogs.length}</span>
                <span className="text-gray-300">logs analyzed</span>
              </div>
            </div>

            <div className="space-y-6">
              {(() => {
                const analysisText = analysis.analysis || analysis;
                const sections = {
                  summary: '',
                  rootCauses: '',
                  actions: '',
                  preventive: ''
                };

                // Parse the analysis text into sections
                const lines = analysisText.split('\n');
                let currentSection = '';
                
                lines.forEach(line => {
                  if (line.includes('**Analysis Summary:**') || line.includes('Analysis Summary')) {
                    currentSection = 'summary';
                  } else if (line.includes('**Likely Root Causes:**') || line.includes('Likely Root Causes') || line.includes('**Root Causes:**')) {
                    currentSection = 'rootCauses';
                  } else if (line.includes('**Recommended Actions:**') || line.includes('Recommended Actions')) {
                    currentSection = 'actions';
                  } else if (line.includes('**Preventive Measures:**') || line.includes('Preventive Measures')) {
                    currentSection = 'preventive';
                  } else if (currentSection && line.trim()) {
                    sections[currentSection] += line + '\n';
                  }
                });

                return (
                  <>
                    {/* Summary Section */}
                    {sections.summary && (
                      <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-5 hover:border-blue-600 transition-colors duration-200">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-blue-900 bg-opacity-30 rounded-lg flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                              Analysis Summary
                            </h4>
                            <div className="text-gray-200 leading-relaxed space-y-2">
                              {sections.summary.split('\n').map((line, idx) => {
                                if (!line.trim()) return null;
                                const cleanLine = line.replace(/^[-•]\s*/, '').trim();
                                return cleanLine ? (
                                  <p key={idx} className="flex items-start gap-2">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>{cleanLine}</span>
                                  </p>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Root Causes Section */}
                    {sections.rootCauses && (
                      <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-5 hover:border-red-600 transition-colors duration-200">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-red-900 bg-opacity-30 rounded-lg flex-shrink-0">
                            <Target className="h-6 w-6 text-red-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                              Likely Root Causes
                            </h4>
                            <div className="text-gray-200 leading-relaxed space-y-2">
                              {sections.rootCauses.split('\n').map((line, idx) => {
                                if (!line.trim()) return null;
                                const cleanLine = line.replace(/^[-•]\s*/, '').trim();
                                return cleanLine ? (
                                  <p key={idx} className="flex items-start gap-2">
                                    <span className="text-red-400 mt-1">▸</span>
                                    <span>{cleanLine}</span>
                                  </p>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommended Actions Section */}
                    {sections.actions && (
                      <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-5 hover:border-yellow-600 transition-colors duration-200">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-yellow-900 bg-opacity-30 rounded-lg flex-shrink-0">
                            <CheckCircle className="h-6 w-6 text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                              Recommended Actions
                            </h4>
                            <div className="text-gray-200 leading-relaxed space-y-3">
                              {sections.actions.split('\n').map((line, idx) => {
                                if (!line.trim()) return null;
                                const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
                                return cleanLine ? (
                                  <div key={idx} className="flex items-start gap-3 bg-gray-700 bg-opacity-40 p-3 rounded-lg hover:bg-opacity-60 transition-all duration-200">
                                    <span className="bg-yellow-500 bg-opacity-20 text-yellow-400 font-bold px-2 py-1 rounded text-xs flex-shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="flex-1">{cleanLine}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preventive Measures Section */}
                    {sections.preventive && (
                      <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-5 hover:border-green-600 transition-colors duration-200">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-green-900 bg-opacity-30 rounded-lg flex-shrink-0">
                            <Shield className="h-6 w-6 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                              Preventive Measures
                            </h4>
                            <div className="text-gray-200 leading-relaxed space-y-2">
                              {sections.preventive.split('\n').map((line, idx) => {
                                if (!line.trim()) return null;
                                const cleanLine = line.replace(/^[-•]\s*/, '').trim();
                                return cleanLine ? (
                                  <p key={idx} className="flex items-start gap-2 p-2 hover:bg-gray-700 hover:bg-opacity-30 rounded transition-all duration-150">
                                    <Lightbulb className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                                    <span>{cleanLine}</span>
                                  </p>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fallback: If parsing fails, show original text */}
                    {!sections.summary && !sections.rootCauses && !sections.actions && !sections.preventive && (
                      <div className="bg-gray-800 border-2 border-gray-700 rounded-xl p-6">
                        <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                          {analysisText}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RCABox;
