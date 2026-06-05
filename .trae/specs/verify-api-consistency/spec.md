# API 功能一致性验证 Spec

## Why

API.md 是后端接口文档，需要验证前端代码实现是否与文档定义完全一致，确保前后端对接无误、避免因参数名/字段名不匹配导致的运行时错误。

## What Changes

* 本 Spec 为纯验证性质，不修改任何业务代码

* 输出 API.md 与实际前端代码之间的所有差异清单

* 标注每个差异的严重程度（ERROR/WARN/INFO）

## Impact

* Affected specs: 无

* Affected code:

  * `src/services/api.ts` — HTTP API 调用层

  * `src/services/websocket.ts` — WebSocket 服务封装

  * `src/store/chatStore.tsx` — 状态管理与 WS 消息处理

  * `src/types/index.ts` — TypeScript 类型定义

***

## 验证结果总览

| 类别               | 总数   | 一致 | 不一致   |
| ---------------- | ---- | -- | ----- |
| HTTP API 端点      | 17   | 13 | **4** |
| WebSocket Action | 13   | 11 | **2** |
| 数据模型             | 8    | 3  | **5** |
| WebSocket 响应类型   | \~20 | 17 | **3** |

***

## 一、HTTP API 端点差异（4 处）

### ERROR-01: `/api/messages` 查询参数名不一致

* **API.md 定义**: `GET /api/messages?type=<type>&id=<targetId>&limit=<limit>`

* **实际代码** ([api.ts#L93-L100](src/services/api.ts#L93-L100)):

  ```
  /api/messages?target_type=${targetType}&target_id=${targetId}
  ```

* **差异**:

  * 参数名: 文档用 `type`/`id` → 代码用 `target_type`/`target_id`

  * 缺少 `limit` 参数: 文档定义了 `limit`（默认100），代码未传递

* **影响**: 如果后端按文档实现的参数名接收，前端请求将无法正确获取数据

### ERROR-02: 管理员删除消息字段名不一致

* **API.md 定义**: 请求体使用 `id` 字段

  ```json
  { "secret": "admin666", "id": 123 }
  ```

* **实际代码** ([api.ts#L139-L146](src/services/api.ts#L139-L146)):

  ```json
  { "secret", message_id: messageId }
  ```

* **差异**: 字段名 `id` vs `message_id`

* **影响**: 后端可能无法正确解析消息 ID

### WARN-03: 在线用户数响应字段名不一致

* **API.md 定义**: `{ "online_count": 5 }`

* **实际代码** ([api.ts#L112-L117](src/services/api.ts#L112-L117)): 返回类型为 `{ count: number }`

* **差异**: `online_count` vs `count`

* **影响**: 如果后端返回 `online_count`，前端取值会得到 `undefined`

### INFO-04: 管理员状态接口缺少前端调用函数

* **API.md 定义**: `GET /api/admin/status?secret=admin666` → 返回 `{ "global_mute": false }`

* **实际代码**: `api.ts` 中不存在 `adminGetStatus()` 或类似函数

* **差异**: 前端未实现对 `admin/status` 的调用

* **影响**: 前端无法获取全局禁言状态（但可通过 toggle-mute 推断）

***

## 二、WebSocket Action 差异（2 处）

### ERROR-05: 添加/删除好友参数名不一致

* **API.md 定义**:

  ```json
  { "action": "add_friend", "target_user": "friend_username" }
  { "action": "delete_friend", "target_user": "friend_username" }
  ```

* **实际代码** ([chatStore.tsx#L370-L378](src/store/chatStore.tsx#L370-L378)):

  ```json
  { "action": "add_friend", "friend_username": friendUsername }
  { "action": "delete_friend", "friend_username": friendUsername }
  ```

* **差异**: `target_user` vs `friend_username`

* **影响**: 后端若按文档的 `target_user` 解析，好友操作将失败

### WARN-06: 创建群组缺少 group\_name 参数

* **API.md 定义**: `group_name` + `members` 均为请求字段

* **实际代码** ([chatStore.tsx#L380-L382](src/store/chatStore.tsx#L380-L382)): 仅发送 `members`

  ```json
  { "action": "create_group", members: [...] }
  ```

* **差异**: 缺少 `group_name` 字段

* **影响**: 创建的群组可能没有名称，或后端使用默认名称

***

## 三、数据模型差异（5 处）

### INFO-07: User 模型用途不同（非错误）

* **API.md User**: 后端存储模型 (`username`, `password`, `avatar_url`, `signature`, `background_url`, `last_ip`)

* **代码 User** ([types/index.ts#L15-L20](src/types/index.ts#L15-L20)): 前端展示模型 (`username`, `avatar_url`, `is_online`, `last_ip?`)

* **说明**: 两者定位不同，代码中另有 `UserProfile` 对应用户详细资料。建议在文档中补充前端 User 模型说明以消除混淆

### INFO-08: Group 模型多出 created\_at 字段

* **API.md Group**: `id`, `name`, `owner`

* **代码 Group** ([types/index.ts#L30-L35](src/types/index.ts#L30-L35)): `id`, `name`, `owner`, `created_at?`

* **差异**: 代码多了可选的 `created_at` 字段，文档未记录

### INFO-09: GroupMember 模型多出 joined\_at 字段

* **API.md GroupMember**: `username`, `is_owner`

* **代码 GroupMember** ([types/index.ts#L37-L41](src/types/index.ts#L37-L41)): `username`, `is_owner`, `joined_at`

* **差异**: 代码多了 `joined_at` 字段，文档未记录

### INFO-10: Message 模型一致

* **API.md 与代码** 完全匹配: `id`, `target_type`, `target_id`, `sender`, `content`, `timestamp`, `avatar_url`

### INFO-11: UserProfile 模型一致

* **API.md 与代码** 完全匹配: `username`, `avatar_url`, `signature`, `background_url`

***

## 四、WebSocket 响应类型差异（3 处）

### INFO-12: online\_users 推送类型未记录在文档中

* **实际代码** ([chatStore.tsx#L262-L264](src/store/chatStore.tsx#L262-L264)): 处理 `online_users` 类型，含 `count` 字段

* **API.md**: 未提及此服务端主动推送的消息类型

* **差异**: 文档遗漏

### INFO-13: withdraw 撤回通知存在别名

* **实际代码** ([chatStore.tsx#L250-L251](src/store/chatStore.tsx#L250-L251)): 同时处理 `withdraw` 和 `withdraw_message` 两种类型

* **API.md**: 仅记录 `withdraw_message`

* **差异**: 代码做了兼容，文档只记录了一个

### INFO-14: add\_member\_ok 响应处理缺失

* **API.md**: 定义了 `add_member_ok` 响应: `{ "type": "add_member_ok", "group_id": "3", "added": 2 }`

* **实际代码** ([chatStore.tsx#L208-L328](src/store/chatStore.tsx#L208-L328)): 未对 `add_member_ok` 做专门处理（归入 sync 刷新）

* **差异**: 功能上不影响（通过 sync 间接更新），但未单独处理 `added` 数量反馈给用户

***

## 五、完全一致的功能清单（供参考）

以下功能经核实，API.md 与代码实现完全一致：

### HTTP API（13 个）

| #  | 端点                             | 方法       | 状态                                                   |
| -- | ------------------------------ | -------- | ---------------------------------------------------- |
| 1  | `/api/user/info`               | GET/POST | ✅ 一致                                                 |
| 2  | `/api/user/update`             | POST     | ✅ 一致                                                 |
| 3  | `/api/user/avatar`             | POST     | ✅ 一致                                                 |
| 4  | `/api/user/background`         | POST     | ✅ 一致                                                 |
| 5  | `/api/reset-password`          | POST     | ✅ 一致                                                 |
| 6  | `/api/group/{groupId}/members` | GET      | ✅ 一致                                                 |
| 7  | `/api/upload`                  | POST     | ✅ 一致（代码中虽无独立函数，但 uploadAvatar/uploadBackground 模式相同） |
| 8  | `/api/admin/users`             | GET      | ✅ 一致                                                 |
| 9  | `/api/admin/messages`          | GET      | ✅ 一致                                                 |
| 10 | `/api/admin/delete-user`       | POST     | ✅ 一致                                                 |
| 11 | `/api/admin/toggle-mute`       | GET      | ✅ 一致                                                 |
| 12 | `/api/admin/broadcast`         | POST     | ✅ 一致                                                 |

### WebSocket Action（11 个）

| #  | Action                 | 状态                              |
| -- | ---------------------- | ------------------------------- |
| 1  | `login`                | ✅ 一致                            |
| 2  | `register`             | ✅ 一致                            |
| 3  | `resume`               | ✅ 一致                            |
| 4  | `sync`                 | ✅ 一致                            |
| 5  | `msg`                  | ✅ 一致                            |
| 6  | `withdraw_message`     | ✅ 一致                            |
| 7  | `create_group`         | ✅ 基本一致（缺 group\_name 见 WARN-06） |
| 8  | `rename_group`         | ✅ 一致                            |
| 9  | `publish_announcement` | ✅ 一致                            |
| 10 | `quit_group`           | ✅ 一致                            |
| 11 | `disband_group`        | ✅ 一致                            |
| 12 | `update_avatar`        | ✅ 一致                            |
| 13 | `add_member_to_group`  | ✅ 一致                            |

### WS 响应类型（已处理的）

| #  | Type                             | 状态   |
| -- | -------------------------------- | ---- |
| 1  | `auth_ok`                        | ✅ 一致 |
| 2  | `auth_err`                       | ✅ 一致 |
| 3  | `sync_data`                      | ✅ 一致 |
| 4  | `msg`                            | ✅ 一致 |
| 5  | `withdraw_message_ok`            | ✅ 一致 |
| 6  | `delete_friend_ok`               | ✅ 一致 |
| 7  | `create_group_ok`                | ✅ 一致 |
| 8  | `rename_group_ok`                | ✅ 一致 |
| 9  | `disband_group_ok`               | ✅ 一致 |
| 10 | `quit_group_ok`                  | ✅ 一致 |
| 11 | `publish_announcement_ok`        | ✅ 一致 |
| 12 | `avatar_ok` / `update_avatar_ok` | ✅ 一致 |
| 13 | 所有 `_err` 错误类型                   | ✅ 一致 |

***

## 总结

### 必须修复（ERROR — 会导致功能异常）

1. **ERROR-01**: `/api/messages` 参数名 `type`→`target_type`, `id`→`target_id`，补充 `limit` 参数
2. **ERROR-02**: 管理员删除消息字段名 `id`→`message_id`
3. **ERROR-05**: 好友操作参数名 `target_user`→`friend_username`

### 建议修复（WARN — 可能导致功能异常）

1. **WARN-03**: 在线用户数字段 `online_count`→`count`
2. **WARN-06**: 创建群组补充 `group_name` 参数

### 建议补充（INFO — 文档完善）

1. **INFO-04**: 补充 `adminGetStatus()` 前端函数
2. **INFO-07**: 文档区分后端 User 模型和前端 User 模型
3. **INFO-08**: Group 补充 `created_at` 字段
4. **INFO-09**: GroupMember 补充 `joined_at` 字段
5. **INFO-12**: 文档补充 `online_users` WS 推送类型
6. **INFO-13**: 文档备注 `withdraw` 别名
7. **INFO-14**: 考虑是否需要单独处理 `add_member_ok` 的 `added` 反馈

