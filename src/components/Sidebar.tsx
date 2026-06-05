import React, { useState, useMemo } from 'react';
import { useChat } from '../store/chatStore';
import type { TargetType, ChatSession } from '../types';
import ServerSettings from './ServerSettings';
import UserProfile from './UserProfile';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  isMobile: boolean;
  onClose: () => void;
}

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const { state, switchChat, logout } = useChat();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [tab, setTab] = useState<'chats' | 'friends' | 'groups' | 'add'>('chats');

  const chatSessions = useMemo<ChatSession[]>(() => {
    const sessions: ChatSession[] = [];
    sessions.push({ id: 'public', type: 'public', name: '公共大厅', unread: 0 });
    state.friends.forEach((friend) => {
      sessions.push({ id: friend, type: 'private', name: friend, unread: 0 });
    });
    state.groups.forEach((group) => {
      sessions.push({
        id: String(group.id),
        type: 'group',
        name: group.name,
        unread: 0,
        owner: group.owner,
      });
    });
    return sessions;
  }, [state.friends, state.groups]);

  if (showProfile) {
    return (
      <div className="h-full">
        <UserProfile onBack={() => setShowProfile(false)} />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="h-full">
        <ServerSettings onBack={() => setShowSettings(false)} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-chat-sidebar dark:bg-chat-sidebar-dark border-r border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-2xl select-none">
      {/* Mobile close button */}
      {isMobile && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* User Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            {state.avatarUrl ? (
              <img src={state.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-blue-500 flex-shrink-0">
                {state.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                {state.username}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${state.connected ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {state.connected ? '已连接' : '未连接'}
                </span>
              </div>
            </div>
          </button>
          <div className="flex items-center gap-1 flex-shrink-0">
            <ThemeToggle />
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
              title="退出登录"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {([
          { key: 'chats' as const, label: '聊天', icon: '💬' },
          { key: 'friends' as const, label: '好友', icon: '👤' },
          { key: 'groups' as const, label: '群组', icon: '👥' },
          { key: 'add' as const, label: '添加', icon: '➕' },
        ]).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-xs font-medium transition-colors relative ${
              tab === key
                ? 'text-blue-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <span className="sm:hidden">{icon}</span>
            <span className="hidden sm:inline">{label}</span>
            <span className="hidden sm:hidden">{label}</span>
            {tab === key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {tab === 'chats' && (
          <ChatList
            sessions={chatSessions}
            activeChatId={state.activeChat?.id || ''}
            activeChatType={state.activeChat?.type || ''}
            onSelect={(s) => { switchChat(s.type, s.id, s.name); if (isMobile) onClose(); }}
          />
        )}
        {tab === 'friends' && (
          <FriendList onChat={(name) => { switchChat('private', name, name); if (isMobile) onClose(); }} />
        )}
        {tab === 'groups' && (
          <GroupList onChat={(id, name) => { switchChat('group', String(id), name); if (isMobile) onClose(); }} />
        )}
        {tab === 'add' && <AddSection />}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>在线: {state.onlineCount} 人</span>
          <button
            onClick={() => setShowSettings(true)}
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            服务器设置
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Chat List ============ */
function ChatList({ sessions, activeChatId, activeChatType, onSelect }: {
  sessions: ChatSession[];
  activeChatId: string;
  activeChatType: string;
  onSelect: (session: ChatSession) => void;
}) {
  const iconMap: Record<string, JSX.Element> = {
    public: (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    ),
    group: (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    ),
  };

  return (
    <div className="py-1">
      {sessions.map((session) => {
        const isActive = session.type === activeChatType && session.id === activeChatId;
        const key = `${session.type}:${session.id}`;
        const icon = session.type === 'private'
          ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {session.name.charAt(0).toUpperCase()}
            </div>
          )
          : iconMap[session.type];

        return (
          <button
            key={key}
            onClick={() => onSelect(session)}
            className={`w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 transition-colors ${
              isActive
                ? 'bg-chat-active dark:bg-chat-active-dark'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800'
            }`}
          >
            {icon}
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {session.name}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {session.type === 'public' ? '公共聊天' : session.type === 'group' ? `${session.owner || ''} 的群聊` : '私聊'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ============ Friend List ============ */
function FriendList({ onChat }: { onChat: (name: string) => void }) {
  const { state, deleteFriend } = useChat();

  if (state.friends.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
        暂无好友，去"添加"标签页添加吧
      </div>
    );
  }

  return (
    <div className="py-1">
      {state.friends.map((friend) => (
        <div
          key={friend}
          className="flex items-center gap-3 px-4 py-3 sm:py-2.5 active:bg-gray-50 dark:active:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {friend.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={() => onChat(friend)}
            className="flex-1 text-left text-sm font-medium text-gray-800 dark:text-white truncate py-1"
          >
            {friend}
          </button>
          <button
            onClick={() => deleteFriend(friend)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 active:bg-red-100 transition-all flex-shrink-0"
            title="删除好友"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============ Group List ============ */
function GroupList({ onChat }: { onChat: (id: number, name: string) => void }) {
  const { state } = useChat();

  if (state.groups.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
        暂无群聊，去"添加"标签页创建吧
      </div>
    );
  }

  return (
    <div className="py-1">
      {state.groups.map((group) => (
        <button
          key={group.id}
          onClick={() => onChat(group.id, group.name)}
          className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
              {group.name}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              群主: {group.owner}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ============ Add Section ============ */
function AddSection() {
  const { addFriend, createGroup, switchChat } = useChat();
  const [friendName, setFriendName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [groupId, setGroupId] = useState('');

  return (
    <div className="p-4 space-y-5">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          添加好友
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            placeholder="输入用户名"
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && friendName.trim() && (addFriend(friendName.trim()), setFriendName(''))}
          />
          <button
            onClick={() => { if (friendName.trim()) { addFriend(friendName.trim()); setFriendName(''); } }}
            className="px-4 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium transition-colors flex-shrink-0"
          >
            添加
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          创建群聊
        </h3>
        <textarea
          value={groupMembers}
          onChange={(e) => setGroupMembers(e.target.value)}
          placeholder="输入成员用户名，用逗号分隔（至少3人）"
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none"
        />
        <button
          onClick={() => {
            const members = groupMembers.split(',').map((m) => m.trim()).filter(Boolean);
            if (members.length >= 3) { createGroup(members); setGroupMembers(''); }
            else alert('至少需要3位成员（用逗号分隔）');
          }}
          className="mt-2 w-full py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white text-sm font-medium transition-colors"
        >
          创建群聊
        </button>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          加入群聊
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            placeholder="输入群聊ID"
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && groupId && (switchChat('group', groupId, `群聊 ${groupId}`), setGroupId(''))}
          />
          <button
            onClick={() => { if (groupId) { switchChat('group', groupId, `群聊 ${groupId}`); setGroupId(''); } }}
            className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-medium transition-colors flex-shrink-0"
          >
            加入
          </button>
        </div>
      </div>
    </div>
  );
}
