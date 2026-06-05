import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '../store/chatStore';
import type { Message } from '../types';

interface ChatAreaProps {
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export default function ChatArea({ isMobile, onToggleSidebar }: ChatAreaProps) {
  const { state, sendMessage, withdrawMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = state.activeChat;
  const messageKey = active ? `${active.type}:${active.id}` : '';
  const messages = state.messages[messageKey] || [];
  const isGroup = active?.type === 'group';
  const groupInfo = isGroup && active ? state.groups.find((g) => String(g.id) === active.id) : null;
  const isOwner = groupInfo?.owner === state.username;

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [active?.id, active?.type]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !active) return;
    sendMessage(active.type, active.id, input.trim());
    setInput('');
    inputRef.current?.focus();
  }, [input, active, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleWithdraw = (msg: Message) => {
    if (msg.sender === state.username) {
      if (confirm('确定要撤回这条消息吗？')) {
        withdrawMessage(msg.id);
      }
    }
  };

  // Welcome screen
  if (!active) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chat-bg dark:bg-chat-bg-dark">
        {/* Mobile header */}
        {isMobile && (
          <div className="absolute top-0 left-0 right-0 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="打开菜单"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="ml-2 text-base font-semibold text-gray-800 dark:text-white">ChatBox</span>
          </div>
        )}
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 mb-6">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            欢迎使用 ChatBox
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {isMobile ? '点击左上角菜单选择聊天' : '选择一个聊天开始对话'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-bg dark:bg-chat-bg-dark min-w-0">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors flex-shrink-0"
              aria-label="打开菜单"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white truncate">
              {active.name}
            </h2>
            <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
              {active.type === 'public' ? '公共大厅' : active.type === 'group' ? '群聊' : '私聊'}
              {' · '}{state.onlineCount} 人在线
            </p>
          </div>
        </div>

        {/* Group Menu */}
        {active.type === 'group' && (
          <GroupMenu
            groupId={parseInt(active.id)}
            groupName={active.name}
            isOwner={isOwner}
          />
        )}
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3 sm:py-4 space-y-0.5"
      >
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
            <div className="text-4xl mb-3">💬</div>
            暂无消息，发送第一条消息吧
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMine = msg.sender === state.username;
          const isSystem = msg.sender === 'system' || msg.sender === '[系统]';
          const showAvatar = idx === 0 || messages[idx - 1]?.sender !== msg.sender;
          const showTime = idx === 0 ||
            (msg.timestamp - (messages[idx - 1]?.timestamp || 0)) > 300000;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center py-2">
                <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`message-enter flex ${isMine ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
            >
              <div className={`flex gap-1.5 sm:gap-2 ${isMobile ? 'max-w-[88%]' : 'max-w-[70%]'} ${isMine ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {showAvatar ? (
                  msg.avatar_url ? (
                    <img src={msg.avatar_url} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 mt-1" />
                  ) : (
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0 mt-1 ${
                      isMine ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'
                    }`}>
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )
                ) : (
                  <div className={`${isMobile ? 'w-7' : 'w-7 sm:w-8'} flex-shrink-0`} />
                )}

                <div className={`min-w-0 ${isMine ? 'items-end' : 'items-start'}`}>
                  {/* Sender name in group */}
                  {showAvatar && isGroup && (
                    <div className={`text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mb-0.5 ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                      {msg.sender}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative group/msg px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl text-sm break-words ${
                      isMine
                        ? 'bg-chat-bubble-self dark:bg-chat-bubble-self-dark text-white rounded-br-md'
                        : 'bg-chat-bubble dark:bg-chat-bubble-dark text-gray-800 dark:text-gray-100 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.content}

                    {/* Long press / hover withdraw */}
                    {isMine && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleWithdraw(msg); }}
                        className="absolute -top-2 -right-1 sm:right-2 opacity-0 group-hover/msg:opacity-100 w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white text-[10px] sm:text-xs flex items-center justify-center transition-opacity shadow active:scale-95"
                        title="撤回"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Time */}
                  {showTime && (
                    <div className={`text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 safe-area-bottom">
        <div className="flex items-end gap-1.5 sm:gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none max-h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            style={{ minHeight: isMobile ? '40px' : '42px', fontSize: isMobile ? '16px' : '14px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 sm:p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white transition-colors disabled:cursor-not-allowed flex-shrink-0"
            style={{ minWidth: isMobile ? '40px' : '42px', minHeight: isMobile ? '40px' : '42px' }}
            aria-label="发送"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Group Menu ============ */
function GroupMenu({ groupId, groupName, isOwner }: {
  groupId: number;
  groupName: string;
  isOwner: boolean;
}) {
  const { renameGroup, publishAnnouncement, disbandGroup, quitGroup } = useChat();
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = () => {
    const newName = prompt('请输入新群名：', groupName);
    if (newName?.trim()) renameGroup(groupId, newName.trim());
    setShowMenu(false);
  };

  const handleAnnounce = () => {
    const ann = prompt('请输入公告内容：');
    if (ann?.trim()) publishAnnouncement(groupId, ann.trim());
    setShowMenu(false);
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 text-gray-400 transition-colors"
        aria-label="群设置"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 z-50">
            {isOwner ? (
              <>
                <button onClick={handleRename} className="w-full text-left px-4 py-3 sm:py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors">
                  ✏️ 重命名群聊
                </button>
                <button onClick={handleAnnounce} className="w-full text-left px-4 py-3 sm:py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors">
                  📢 发布公告
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                <button
                  onClick={() => { if (confirm('确定解散？此操作不可撤销！')) { disbandGroup(groupId); setShowMenu(false); } }}
                  className="w-full text-left px-4 py-3 sm:py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 active:bg-red-100 dark:active:bg-red-900/50 transition-colors"
                >
                  🗑 解散群聊
                </button>
              </>
            ) : (
              <button
                onClick={() => { if (confirm('确定退出？')) { quitGroup(groupId); setShowMenu(false); } }}
                className="w-full text-left px-4 py-3 sm:py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 active:bg-red-100 dark:active:bg-red-900/50 transition-colors"
              >
                🚪 退出群聊
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ============ Helpers ============ */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (isToday) return `${hours}:${minutes}`;
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}
