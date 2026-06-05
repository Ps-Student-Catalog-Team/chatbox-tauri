# 验证清单

## ERROR 级别（会导致功能异常）
- [x] ERROR-01: `/api/messages` 查询参数名已与 API.md 对齐（type/id + limit） — api.ts L93-95
- [x] ERROR-02: 管理员删除消息请求体字段名已与 API.md 对齐（id） — api.ts L143
- [x] ERROR-05: 好友操作 WS action 参数名已与 API.md 对齐（target_user） — chatStore.tsx L371,376

## WARN 级别（可能导致功能异常）
- [x] WARN-03: 在线用户数响应字段名已与 API.md 对齐（online_count） — api.ts L112
- [x] WARN-06: 创建群组 WS action 已包含 group_name 参数 — chatStore.tsx L380-382, Sidebar.tsx L351-356,L368

## INFO 级别（文档完善，已全部补充）
- [x] INFO-04: 已在 api.ts 补充 `adminGetStatus()` 函数 — api.ts L153-L156
- [x] INFO-07: API.md User 模型已添加前后端模型区分说明 — API.md L715
- [x] INFO-08: API.md Group 模型已补充 `created_at` 字段 — API.md L745
- [x] INFO-09: API.md 新增 `GroupMember` 模型定义（含 `joined_at`） — API.md L747-L753
- [x] INFO-12: API.md 已补充 `online_users` WebSocket 推送类型 — API.md L110-L120
- [x] INFO-13: API.md 已备注 `withdraw` 别名兼容说明 — API.md L205
- [x] INFO-14: `add_member_ok` 响应已单独处理（显示添加成员数量） — chatStore.tsx L271-L275
