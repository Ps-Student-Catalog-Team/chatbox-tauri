import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Message, Group, ChatSession, Theme, WSMessage, TargetType } from '../types';
import { wsService } from '../services/websocket';
import { getMessages } from '../services/api';

// ============ State ============
interface AppState {
  // Auth
  isLoggedIn: boolean;
  username: string;
  token: string;
  avatarUrl: string;

  // Connection
  connected: boolean;

  // Data
  friends: string[];
  groups: Group[];
  messages: Record<string, Message[]>;
  chatSessions: ChatSession[];

  // UI
  activeChat: { type: TargetType; id: string; name: string } | null;
  theme: Theme;
  onlineCount: number;
  showSettings: boolean;
  showProfile: boolean;
  settingsSection: 'server' | 'profile' | 'friends' | 'groups';
}

const initialState: AppState = {
  isLoggedIn: false,
  username: '',
  token: '',
  avatarUrl: '',
  connected: false,
  friends: [],
  groups: [],
  messages: {},
  chatSessions: [],
  activeChat: null,
  theme: (localStorage.getItem('chatbox_theme') as Theme) || 'light',
  onlineCount: 0,
  showSettings: false,
  showProfile: false,
  settingsSection: 'profile',
};

// ============ Actions ============
type Action =
  | { type: 'LOGIN'; username: string; token: string; avatarUrl: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_CONNECTED'; connected: boolean }
  | { type: 'SYNC_DATA'; friends: string[]; groups: Group[] }
  | { type: 'ADD_FRIEND'; username: string }
  | { type: 'REMOVE_FRIEND'; username: string }
  | { type: 'ADD_GROUP'; group: Group }
  | { type: 'REMOVE_GROUP'; groupId: number }
  | { type: 'RENAME_GROUP'; groupId: number; newName: string }
  | { type: 'NEW_MESSAGE'; message: Message }
  | { type: 'WITHDRAW_MESSAGE'; messageId: number; targetType: TargetType; targetId: string }
  | { type: 'SET_MESSAGES'; key: string; messages: Message[] }
  | { type: 'SET_ACTIVE_CHAT'; chat: AppState['activeChat'] }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'SET_ONLINE_COUNT'; count: number }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'TOGGLE_PROFILE' }
  | { type: 'SET_SETTINGS_SECTION'; section: AppState['settingsSection'] }
  | { type: 'UPDATE_AVATAR'; avatarUrl: string }
  | { type: 'UPDATE_CHAT_SESSIONS'; sessions: ChatSession[] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isLoggedIn: true,
        username: action.username,
        token: action.token,
        avatarUrl: action.avatarUrl,
      };

    case 'LOGOUT':
      return { ...initialState, theme: state.theme };

    case 'SET_CONNECTED':
      return { ...state, connected: action.connected };

    case 'SYNC_DATA':
      return { ...state, friends: action.friends, groups: action.groups };

    case 'ADD_FRIEND':
      if (state.friends.includes(action.username)) return state;
      return { ...state, friends: [...state.friends, action.username] };

    case 'REMOVE_FRIEND':
      return { ...state, friends: state.friends.filter((f) => f !== action.username) };

    case 'ADD_GROUP':
      if (state.groups.find((g) => g.id === action.group.id)) return state;
      return { ...state, groups: [...state.groups, action.group] };

    case 'REMOVE_GROUP':
      return { ...state, groups: state.groups.filter((g) => g.id !== action.groupId) };

    case 'RENAME_GROUP':
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.groupId ? { ...g, name: action.newName } : g
        ),
      };

    case 'NEW_MESSAGE': {
      const key = `${action.message.target_type}:${action.message.target_id}`;
      const existing = state.messages[key] || [];
      if (existing.some((m) => m.id === action.message.id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [key]: [...existing, action.message],
        },
      };
    }

    case 'WITHDRAW_MESSAGE': {
      const key = `${action.targetType}:${action.targetId}`;
      const existing = state.messages[key];
      if (!existing) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [key]: existing.filter((m) => m.id !== action.messageId),
        },
      };
    }

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: { ...state.messages, [action.key]: action.messages },
      };

    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChat: action.chat };

    case 'SET_THEME':
      return { ...state, theme: action.theme };

    case 'SET_ONLINE_COUNT':
      return { ...state, onlineCount: action.count };

    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings, showProfile: false };

    case 'TOGGLE_PROFILE':
      return { ...state, showProfile: !state.showProfile, showSettings: false };

    case 'SET_SETTINGS_SECTION':
      return { ...state, settingsSection: action.section };

    case 'UPDATE_AVATAR':
      return { ...state, avatarUrl: action.avatarUrl };

    case 'UPDATE_CHAT_SESSIONS':
      return { ...state, chatSessions: action.sessions };

    default:
      return state;
  }
}

// ============ Context ============
interface ChatContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  sendMessage: (targetType: TargetType, targetId: string, content: string) => void;
  login: (username: string, password: string, isRegister?: boolean) => void;
  logout: () => void;
  addFriend: (friendUsername: string) => void;
  deleteFriend: (friendUsername: string) => void;
  createGroup: (groupName: string, members: string[]) => void;
  loadMessages: (targetType: TargetType, targetId: string) => Promise<void>;
  switchChat: (type: TargetType, id: string, name: string) => void;
  renameGroup: (groupId: number, newName: string) => void;
  publishAnnouncement: (groupId: number, announcement: string) => void;
  disbandGroup: (groupId: number) => void;
  quitGroup: (groupId: number) => void;
  withdrawMessage: (messageId: number) => void;
  updateAvatar: (avatarUrl: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    localStorage.setItem('chatbox_theme', state.theme);
  }, [state.theme]);

  // WebSocket message handler
  useEffect(() => {
    const unsub = wsService.onMessage((msg: WSMessage) => {
      switch (msg.type) {
        case 'auth_ok':
          localStorage.setItem('chatbox_token', msg.token!);
          dispatch({
            type: 'LOGIN',
            username: msg.username!,
            token: msg.token!,
            avatarUrl: msg.avatar_url || '',
          });
          break;

        case 'auth_err':
          alert(msg.content || '认证失败');
          break;

        case 'sync_data':
          dispatch({
            type: 'SYNC_DATA',
            friends: msg.friends || [],
            groups: msg.groups || [],
          });
          break;

        case 'msg':
          if (msg.id && msg.sender && msg.target_type && msg.target_id) {
            dispatch({
              type: 'NEW_MESSAGE',
              message: {
                id: msg.id,
                sender: msg.sender,
                target_type: msg.target_type,
                target_id: msg.target_id,
                content: msg.content || '',
                timestamp: msg.timestamp || Date.now(),
                avatar_url: msg.avatar_url || '',
              },
            });
          }
          break;

        case 'withdraw':
        case 'withdraw_message':
          if (msg.message_id && msg.target_type && msg.target_id) {
            dispatch({
              type: 'WITHDRAW_MESSAGE',
              messageId: msg.message_id,
              targetType: msg.target_type,
              targetId: msg.target_id,
            });
          }
          break;

        case 'online_users':
          dispatch({ type: 'SET_ONLINE_COUNT', count: msg.count || 0 });
          break;

        case 'add_friend_ok': {
          wsService.send({ action: 'sync' });
          break;
        }

        case 'add_member_ok': {
          alert(`成功添加 ${msg.added || 0} 位成员`);
          wsService.send({ action: 'sync' });
          break;
        }

        case 'create_group_ok': {
          wsService.send({ action: 'sync' });
          break;
        }

        case 'rename_group_ok':
          if (msg.group_id && msg.new_name) {
            dispatch({
              type: 'RENAME_GROUP',
              groupId: typeof msg.group_id === 'string' ? parseInt(msg.group_id) : msg.group_id,
              newName: msg.new_name,
            });
          }
          break;

        case 'disband_group_ok':
          if (msg.group_id) {
            const gid = typeof msg.group_id === 'string' ? parseInt(msg.group_id) : msg.group_id;
            dispatch({ type: 'REMOVE_GROUP', groupId: gid });
          }
          break;

        case 'quit_group_ok':
          if (msg.group_id) {
            const gid = typeof msg.group_id === 'string' ? parseInt(msg.group_id) : msg.group_id;
            dispatch({ type: 'REMOVE_GROUP', groupId: gid });
          }
          break;

        // Error messages
        case 'add_friend_err':
        case 'create_group_err':
        case 'rename_group_err':
        case 'disband_group_err':
        case 'quit_group_err':
        case 'publish_announcement_err':
        case 'withdraw_message_err':
          alert(msg.content || '操作失败');
          break;

        case 'publish_announcement_ok':
          alert('公告已发布');
          break;

        case 'delete_friend_ok':
          wsService.send({ action: 'sync' });
          break;

        case 'update_avatar_ok':
        case 'avatar_ok':
          wsService.send({ action: 'sync' });
          break;
      }
    });

    return unsub;
  }, []);

  // Connection status
  useEffect(() => {
    const unsub = wsService.onStatusChange((connected) => {
      dispatch({ type: 'SET_CONNECTED', connected });
    });
    return unsub;
  }, []);

  const login = useCallback((username: string, password: string, isRegister = false) => {
    wsService.connect();
    // Wait for connection then send login/register
    const checkAndSend = () => {
      if (wsService.isConnected) {
        wsService.send({
          action: isRegister ? 'register' : 'login',
          username,
          password,
        });
      } else {
        setTimeout(checkAndSend, 100);
      }
    };
    checkAndSend();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('chatbox_token');
    wsService.disconnect();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const sendMessage = useCallback((targetType: TargetType, targetId: string, content: string) => {
    wsService.send({
      action: 'msg',
      target_type: targetType,
      target_id: targetId,
      content,
    });
  }, []);

  const addFriend = useCallback((friendUsername: string) => {
    wsService.send({ action: 'add_friend', target_user: friendUsername });
  }, []);

  const deleteFriend = useCallback((friendUsername: string) => {
    if (confirm(`确定要删除好友 ${friendUsername} 吗？`)) {
      wsService.send({ action: 'delete_friend', target_user: friendUsername });
    }
  }, []);

  const createGroup = useCallback((groupName: string, members: string[]) => {
    wsService.send({ action: 'create_group', group_name: groupName, members });
  }, []);

  const loadMessages = useCallback(async (targetType: TargetType, targetId: string) => {
    try {
      const messages = await getMessages(targetType, targetId);
      dispatch({
        type: 'SET_MESSAGES',
        key: `${targetType}:${targetId}`,
        messages,
      });
    } catch (e) {
      console.error('Failed to load messages:', e);
    }
  }, []);

  const switchChat = useCallback(
    (type: TargetType, id: string, name: string) => {
      dispatch({ type: 'SET_ACTIVE_CHAT', chat: { type, id, name } });
      loadMessages(type, id);
    },
    [loadMessages]
  );

  const renameGroup = useCallback((groupId: number, newName: string) => {
    wsService.send({ action: 'rename_group', group_id: groupId, new_name: newName });
  }, []);

  const publishAnnouncement = useCallback((groupId: number, announcement: string) => {
    wsService.send({ action: 'publish_announcement', group_id: groupId, announcement });
  }, []);

  const disbandGroup = useCallback((groupId: number) => {
    if (confirm('确定要解散此群聊吗？此操作不可撤销！')) {
      wsService.send({ action: 'disband_group', group_id: groupId });
    }
  }, []);

  const quitGroup = useCallback((groupId: number) => {
    if (confirm('确定要退出此群聊吗？')) {
      wsService.send({ action: 'quit_group', group_id: groupId });
    }
  }, []);

  const withdrawMessage = useCallback((messageId: number) => {
    wsService.send({ action: 'withdraw_message', message_id: messageId });
  }, []);

  const updateAvatar = useCallback((avatarUrl: string) => {
    wsService.send({ action: 'update_avatar', content: avatarUrl });
  }, []);

  const value: ChatContextType = {
    state,
    dispatch,
    sendMessage,
    login,
    logout,
    addFriend,
    deleteFriend,
    createGroup,
    loadMessages,
    switchChat,
    renameGroup,
    publishAnnouncement,
    disbandGroup,
    quitGroup,
    withdrawMessage,
    updateAvatar,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextType {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
