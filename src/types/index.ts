// ============ 消息类型 ============
export type TargetType = 'public' | 'group' | 'private';

export interface Message {
  id: number;
  sender: string;
  target_type: TargetType;
  target_id: string;
  content: string;
  timestamp: number;
  avatar_url: string;
}

// ============ 用户类型 ============
export interface User {
  username: string;
  avatar_url: string;
  is_online: boolean;
  last_ip?: string;
}

export interface UserProfile {
  username: string;
  avatar_url: string;
  signature: string;
  background_url: string;
}

// ============ 群组类型 ============
export interface Group {
  id: number;
  name: string;
  owner: string;
  created_at?: number;
}

export interface GroupMember {
  username: string;
  is_owner: boolean;
  joined_at: number;
}

// ============ 认证类型 ============
export interface AuthResponse {
  type: 'auth_ok' | 'auth_err';
  username?: string;
  token?: string;
  avatar_url?: string;
  content?: string;
}

// ============ WebSocket 消息类型 ============
export interface SyncData {
  type: 'sync_data';
  friends: string[];
  groups: Group[];
}

export interface WSMessage {
  type: string;
  id?: number;
  sender?: string;
  target_type?: TargetType;
  target_id?: string;
  content?: string;
  timestamp?: number;
  avatar_url?: string;
  message_id?: number;
  username?: string;
  token?: string;
  friends?: string[];
  groups?: Group[];
  count?: number;
  group_id?: string | number;
  new_name?: string;
  announcement?: string;
}

// ============ 聊天室状态 ============
export interface ChatSession {
  id: string;
  type: TargetType;
  name: string;
  lastMessage?: string;
  lastTime?: number;
  unread: number;
  avatar?: string;
  owner?: string;
}

// ============ WebSocket Action ============
export interface WSAction {
  action: string;
  username?: string;
  password?: string;
  token?: string;
  target_type?: TargetType;
  target_id?: string;
  content?: string;
  friend_username?: string;
  group_id?: number | string;
  new_name?: string;
  announcement?: string;
  message_id?: number;
  members?: string[];
  avatar_url?: string;
}

// ============ 主题 ============
export type Theme = 'light' | 'dark';

// ============ 服务器配置 ============
export interface ServerConfig {
  host: string;
  port: number;
  wsUrl: string;
  httpUrl: string;
}
