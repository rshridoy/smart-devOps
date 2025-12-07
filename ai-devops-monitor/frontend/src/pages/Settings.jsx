import React, { useState } from 'react';
import { Bell, Mail, Send, Check } from 'lucide-react';
import { alertsAPI } from '../utils/api';

const Settings = () => {
  const [slackWebhook, setSlackWebhook] = useState('');
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    username: '',
    password: '',
    fromEmail: '',
    recipients: ''
  });
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestAlert = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const result = await alertsAPI.sendTest();
      setTestResult({ success: true, message: 'Test alert sent successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to send test alert' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Settings</h1>
        <p className="text-gray-400 mt-1">Configure alerts and notifications</p>
      </div>

      {/* Slack Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-100">Slack Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Webhook URL
            </label>
            <input
              type="text"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
              className="input w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Get your webhook URL from <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">Slack API</a>
            </p>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-100">Email Notifications</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              SMTP Host
            </label>
            <input
              type="text"
              value={emailSettings.smtpHost}
              onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
              placeholder="smtp.gmail.com"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              SMTP Port
            </label>
            <input
              type="text"
              value={emailSettings.smtpPort}
              onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
              placeholder="587"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Username
            </label>
            <input
              type="text"
              value={emailSettings.username}
              onChange={(e) => setEmailSettings({...emailSettings, username: e.target.value})}
              placeholder="your-email@gmail.com"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
            <input
              type="password"
              value={emailSettings.password}
              onChange={(e) => setEmailSettings({...emailSettings, password: e.target.value})}
              placeholder="App password"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              From Email
            </label>
            <input
              type="email"
              value={emailSettings.fromEmail}
              onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
              placeholder="devops@example.com"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Recipients (comma-separated)
            </label>
            <input
              type="text"
              value={emailSettings.recipients}
              onChange={(e) => setEmailSettings({...emailSettings, recipients: e.target.value})}
              placeholder="admin@example.com, ops@example.com"
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Test Alert */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Send className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-100">Test Alerts</h2>
        </div>
        
        <p className="text-gray-300 mb-4">
          Send a test alert to verify your configuration
        </p>

        <button
          onClick={handleTestAlert}
          disabled={loading}
          className="btn-primary flex items-center space-x-2"
        >
          <Send className="h-5 w-5" />
          <span>{loading ? 'Sending...' : 'Send Test Alert'}</span>
        </button>

        {testResult && (
          <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
            testResult.success ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
          }`}>
            {testResult.success ? (
              <Check className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
