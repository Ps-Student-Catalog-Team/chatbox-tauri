import React, { useState, useEffect } from 'react';
import { useChat } from '../store/chatStore';
import { getUserInfo, uploadAvatar, updateUserProfile, uploadBackground, resetPassword } from '../services/api';
import type { UserProfile as UserProfileType } from '../types';

export default function UserProfile({ onBack }: { onBack: () => void }) {
  const { state, dispatch, updateAvatar } = useChat();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [signature, setSignature] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserInfo(state.username).then((data) => {
      setProfile(data);
      setSignature(data.signature || '');
    }).catch(() => {});
  }, [state.username]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const result = await uploadAvatar(file);
      console.log('avatar upload response:', result);
      const avatarUrl = result.avatar_url || result.url || '';
      if (avatarUrl) {
        setProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : null);
        dispatch({ type: 'UPDATE_AVATAR', avatarUrl });
        updateAvatar(avatarUrl);
      } else {
        setProfile((prev) => prev ? { ...prev, avatar_url: URL.createObjectURL(file) } : null);
      }
      alert('头像上传成功');
    } catch (err) {
      console.error('avatar upload failed:', err);
      alert('上传失败: ' + (err instanceof Error ? err.message : '请检查网络和后端服务'));
    }
    setLoading(false);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await uploadBackground(file);
      alert('背景图上传成功');
    } catch (err) {
      console.error('background upload failed:', err);
      alert('上传失败: ' + (err instanceof Error ? err.message : '请检查网络和后端服务'));
    }
    setLoading(false);
    e.target.value = '';
  };

  const handleUpdateSignature = async () => {
    try {
      await updateUserProfile({ signature });
      alert('签名更新成功');
    } catch {
      alert('更新失败');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      alert('请输入新密码');
      return;
    }
    try {
      await resetPassword(state.username, newPassword.trim());
      setNewPassword('');
      alert('密码重置成功');
    } catch {
      alert('重置失败');
    }
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
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">个人资料</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-blue-500 shadow-lg" />
          ) : state.avatarUrl ? (
            <img src={state.avatarUrl} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-blue-500 shadow-lg" />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold border-4 border-blue-500 shadow-lg">
              {state.username.charAt(0).toUpperCase()}
            </div>
          )}
          <label className="mt-2 py-1 text-xs text-blue-500 hover:text-blue-600 active:text-blue-700 cursor-pointer transition-colors">
            更换头像
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
          </label>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">用户名</label>
          <input
            type="text"
            value={state.username}
            disabled
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 cursor-not-allowed"
          />
        </div>

        {/* Signature */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">签名</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="写一句签名..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
            <button
              onClick={handleUpdateSignature}
              className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
            >
              保存
            </button>
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">聊天背景</label>
          <label className="block w-full py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-center text-xs text-gray-400 hover:text-blue-500 cursor-pointer transition-colors">
            点击上传背景图
            <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} disabled={loading} />
          </label>
        </div>

        {/* Reset password */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">重置密码</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="输入新密码"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
            <button
              onClick={handleResetPassword}
              className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
