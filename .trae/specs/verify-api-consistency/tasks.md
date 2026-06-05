# Tasks

- [x] Task 1: 修复 ERROR-01 — `/api/messages` 查询参数名与文档对齐
  - [x] 将 `target_type` 改为 `type`，`target_id` 改为 `id`
  - [x] 补充 `limit` 参数支持（默认100）
- [x] Task 2: 修复 ERROR-02 — 管理员删除消息字段名对齐
  - [x] 将 `message_id` 改为 `id`
- [x] Task 3: 修复 ERROR-05 — 好友操作参数名对齐
  - [x] 将 WS action 中 `friend_username` 改为 `target_user`
- [x] Task 4: 修复 WARN-03 — 在线用户数字段名对齐
  - [x] 将返回类型 `{ count }` 调整为 `{ online_count }`
- [x] Task 5: 修复 WARN-06 — 创建群组补充 group_name 参数
  - [x] `createGroup` 函数增加 `groupName` 参数并传入 WS action
  - [x] 更新 `ChatContextType.createGroup` 类型签名
  - [x] 更新 `Sidebar.tsx` 调用方：新增 groupName 输入框和状态

# Task Dependencies
- [Task 1-5] 无依赖关系，已全部完成
