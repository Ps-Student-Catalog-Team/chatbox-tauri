import { useState } from 'react';
import { getServerConfig, setServerConfig } from '../services/api';
import { wsService } from '../services/websocket';

export default function ServerSettings({ onBack }: { onBack: () => void }) {
  const config = getServerConfig();
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(String(config.port));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const newPort = parseInt(port) || 40001;
    setServerConfig({ host: host.trim(), port: newPort });
    wsService.disconnect();
    setTimeout(() => wsService.connect(), 500);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-chat-sidebar dark:bg-chat-sidebar-dark border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 text-gray-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">服务器设置</h2>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            服务器地址
          </label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="127.0.0.1"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            端口
          </label>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            placeholder="40001"
          />
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white'
          }`}
        >
          {saved ? '已保存 ✓' : '保存并重连'}
        </button>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">
            默认账号
          </h3>
          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p>admin / 123</p>
            <p>test01 / 123</p>
          </div>
        </div>

        <div className="pt-2">
          <h3 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">
            说明
          </h3>
          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p>• 后端默认端口: 40001</p>
            <p>• 支持局域网内任意 IP 连接</p>
            <p>• 管理密钥: admin666</p>
          </div>
        </div>
      </div>
    </div>
  );
}
