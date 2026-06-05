import type { Message, UserProfile, GroupMember, ServerConfig, TargetType } from '../types';

const DEFAULT_CONFIG: ServerConfig = {
  host: '127.0.0.1',
  port: 40001,
  wsUrl: 'ws://127.0.0.1:40001/ws',
  httpUrl: 'http://127.0.0.1:40001',
};

let config: ServerConfig = { ...DEFAULT_CONFIG };

export function setServerConfig(newConfig: Partial<ServerConfig>) {
  config = { ...config, ...newConfig };
  if (newConfig.host || newConfig.port) {
    config.wsUrl = `ws://${config.host}:${config.port}/ws`;
    config.httpUrl = `http://${config.host}:${config.port}`;
  }
  localStorage.setItem('server_config', JSON.stringify(config));
}

export function getServerConfig(): ServerConfig {
  const saved = localStorage.getItem('server_config');
  if (saved) {
    try {
      config = { ...config, ...JSON.parse(saved) };
    } catch { /* ignore */ }
  }
  return config;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('chatbox_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============ 用户 API ============
export async function getUserInfo(username: string): Promise<UserProfile> {
  const res = await fetch(`${config.httpUrl}/api/user/info?username=${encodeURIComponent(username)}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateUserProfile(data: { signature?: string; username?: string }): Promise<any> {
  const res = await fetch(`${config.httpUrl}/api/user/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function uploadAvatar(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch(`${config.httpUrl}/api/user/avatar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return res.json();
}

export async function uploadBackground(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('background', file);
  const res = await fetch(`${config.httpUrl}/api/user/background`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return res.json();
}

export async function resetPassword(username: string, newPassword: string): Promise<any> {
  const res = await fetch(`${config.httpUrl}/api/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ username, password: newPassword }),
  });
  return res.json();
}

// ============ 消息 API ============
export async function getMessages(targetType: TargetType, targetId: string): Promise<Message[]> {
  const res = await fetch(
    `${config.httpUrl}/api/messages?target_type=${targetType}&target_id=${encodeURIComponent(targetId)}`,
    { headers: getAuthHeaders() }
  );
  const data = await res.json();
  return data.messages || data || [];
}

// ============ 群组 API ============
export async function getGroupMembers(groupId: number): Promise<GroupMember[]> {
  const res = await fetch(`${config.httpUrl}/api/group/${groupId}/members`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return data.members || [];
}

// ============ 在线用户 API ============
export async function getOnlineUsers(): Promise<{ count: number }> {
  const res = await fetch(`${config.httpUrl}/api/online-users`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ============ 管理员 API ============
export async function adminGetUsers(secret: string): Promise<any> {
  const res = await fetch(`${config.httpUrl}/api/admin/users?secret=${secret}`);
  return res.json();
}

export async function adminGetMessages(secret: string): Promise<any> {
  const res = await fetch(`${config.httpUrl}/api/admin/messages?secret=${secret}`);
  return res.json();
}

export async function adminDeleteUser(secret: string, username: string): Promise<any> {
  const res = await fetch(`${config.httpUrl}/api/admin/delete-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, username }),
  });
  return res.json();
}

export async function adminDeleteMessage(secret: string, messageId: number): Promise<any> {
  const res = await fetch(`${config.httpUrl}/api/admin/delete-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, message_id: messageId }),
  });
  return res.json();
}

export async function adminToggleMute(secret: string): Promise<any> {
  const res = await fetch(`${config.httpUrl}/api/admin/toggle-mute?secret=${secret}`);
  return res.json();
}

export async function adminBroadcast(secret: string, content: string): Promise<any> {
  const res = await fetch(`${config.httpUrl}/api/admin/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, content }),
  });
  return res.json();
}
