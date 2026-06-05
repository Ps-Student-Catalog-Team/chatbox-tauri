# Chatbox 后端 API 调用文档

> 服务端口: `40001`  
> 认证方式: Bearer Token（通过 WebSocket 登录/注册获取）  
> 管理员密钥: `admin666`

---

## 目录

- [认证相关](#认证相关)
- [WebSocket 通信](#websocket-通信)
- [用户接口](#用户接口)
- [消息接口](#消息接口)
- [文件上传](#文件上传)
- [群组接口](#群组接口)
- [管理员接口](#管理员接口)

---

## 认证相关

### 获取 Token

通过 WebSocket 连接 `/ws` 发送登录或注册消息，成功后返回 `token`。

后续 HTTP 请求需在 Header 中携带：
```
Authorization: Bearer <your_token>
```

---

## WebSocket 通信

**端点**: `ws://<host>:40001/ws`

所有消息均为 JSON 格式，通过 `action` 字段区分操作。

### 登录

**请求**:
```json
{
  "action": "login",
  "username": "admin",
  "password": "123"
}
```

**响应 (成功)**:
```json
{
  "type": "auth_ok",
  "username": "admin",
  "token": "a1b2c3d4e5f6...",
  "avatar_url": "/uploads/xxx.png"
}
```

**响应 (失败)**:
```json
{
  "type": "auth_err",
  "content": "账号或密码错误"
}
```

---

### 注册

**请求**:
```json
{
  "action": "register",
  "username": "newuser",
  "password": "123456"
}
```

**响应 (成功)**: 同登录成功格式

**响应 (失败)**:
```json
{
  "type": "auth_err",
  "content": "该账号已被注册"
}
```

---

### 恢复会话

使用已保存的 token 重新连接。

**请求**:
```json
{
  "action": "resume",
  "token": "a1b2c3d4e5f6..."
}
```

**响应**: 同登录成功格式

---

### 在线人数推送

服务端在用户上线/下线时主动推送当前在线人数，无需客户端请求。

**响应**:
```json
{
  "type": "online_users",
  "count": 5
}
```

---

### 同步数据

获取当前好友列表和群组列表。

**请求**:
```json
{
  "action": "sync"
}
```

**响应**:
```json
{
  "type": "sync_data",
  "friends": ["user1", "user2"],
  "groups": [
    {
      "id": 1,
      "name": "技术交流群",
      "owner": "admin"
    }
  ]
}
```

---

### 发送消息

**请求**:
```json
{
  "action": "msg",
  "target_type": "private|group|public",
  "target_id": "目标ID (用户名或群组ID)",
  "content": "消息内容"
}
```

**target_type 说明**:
| 值 | 说明 | target_id |
|---|---|---|
| `private` | 私聊 | 对方用户名 |
| `group` | 群聊 | 群组数字ID |
| `public` | 公共聊天 | `"global"` |

**广播消息 (所有在线用户收到)**:
```json
{
  "type": "msg",
  "id": 123,
  "target_type": "private",
  "target_id": "receiver",
  "sender": "sender",
  "content": "hello",
  "timestamp": 1700000000,
  "avatar_url": "/uploads/avatar.png"
}
```

---

### 撤回消息

仅允许撤回自己发送的消息。

**请求**:
```json
{
  "action": "withdraw_message",
  "message_id": 123
}
```

**响应 (成功)**:
```json
{
  "type": "withdraw_message_ok",
  "message_id": 123,
  "target_type": "private",
  "target_id": "receiver"
}
```

**广播撤回通知**:
```json
{
  "type": "withdraw_message",
  "message_id": 123,
  "target_type": "private",
  "target_id": "receiver"
}
```

> **注意**: 部分后端实现可能使用 `withdraw` 作为撤回通知的 type 别名，前端应同时兼容 `withdraw` 和 `withdraw_message` 两种类型。

---

### 好友管理

#### 添加好友

**请求**:
```json
{
  "action": "add_friend",
  "target_user": "friend_username"
}
```

#### 删除好友

**请求**:
```json
{
  "action": "delete_friend",
  "target_user": "friend_username"
}
```

**响应**:
```json
{
  "type": "delete_friend_ok",
  "target_user": "friend_username"
}
```

---

### 群组管理

#### 创建群组

至少需要 3 名成员（含创建者）。

**请求**:
```json
{
  "action": "create_group",
  "group_name": "新群组",
  "members": ["user1", "user2"]
}
```

**响应 (成功)**:
```json
{
  "type": "create_group_ok",
  "target_id": "3",
  "content": "新群组"
}
```

#### 重命名群组

仅群主可操作。

**请求**:
```json
{
  "action": "rename_group",
  "group_id": "3",
  "new_name": "新名称"
}
```

#### 发布群公告

仅群主可操作。公告以系统消息形式发送到群聊。

**请求**:
```json
{
  "action": "publish_announcement",
  "group_id": "3",
  "announcement": "本周五团建"
}
```

#### 添加群成员

仅群主可操作。

**请求**:
```json
{
  "action": "add_member_to_group",
  "group_id": "3",
  "members": ["newuser1", "newuser2"]
}
```

**响应**:
```json
{
  "type": "add_member_ok",
  "group_id": "3",
  "added": 2
}
```

#### 退出群组

**请求**:
```json
{
  "action": "quit_group",
  "group_id": "3"
}
```

#### 解散群组

仅群主可操作。解散后删除群组、成员关系及所有消息记录。

**请求**:
```json
{
  "action": "disband_group",
  "group_id": "3"
}
```

---

### 更新头像 (WebSocket 方式)

**请求**:
```json
{
  "action": "update_avatar",
  "content": "/uploads/new_avatar.png"
}
```

**响应**:
```json
{
  "type": "avatar_ok",
  "avatar_url": "/uploads/new_avatar.png"
}
```

---

## 用户接口

### 获取用户信息

```
GET /api/user/info?username=<username>
```

或使用当前登录用户（需 Authorization 头）：
```
GET /api/user/info
```

**响应**:
```json
{
  "username": "admin",
  "avatar_url": "/uploads/avatar.png",
  "signature": "这是我的签名",
  "background_url": "/uploads/bg.png"
}
```

---

### 更新用户信息

```
POST /api/user/update
Header: Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "signature": "新的个性签名",
  "username": "newname"  // 可选，修改用户名
}
```

**响应**: `200 OK`

**错误** (`409 Conflict`):
```json
{
  "error": "username_exists"
}
```

---

### 上传头像

```
POST /api/user/avatar
Header: Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**表单字段**: `avatar` (文件)

**响应**:
```json
{
  "url": "/uploads/xxx.png"
}
```

---

### 上传背景图

```
POST /api/user/background
Header: Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**表单字段**: `background` (文件)

**响应**:
```json
{
  "url": "/uploads/xxx.png"
}
```

---

### 重置密码

```
POST /api/reset-password
Content-Type: application/json
```

**请求体**:
```json
{
  "username": "admin",
  "password": "new_password"
}
```

**响应 (成功)**:
```json
{
  "status": "ok"
}
```

**响应 (失败, 404)**:
```json
{
  "message": "未找到对应的用户账号"
}
```

---

## 消息接口

### 获取消息历史

```
GET /api/messages?type=<type>&id=<targetId>&limit=<limit>
```

**参数说明**:

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| type | string | 是 | `public` / `group` / `private` |
| id | string | 是 | 目标 ID |
| limit | int | 否 | 返回数量，默认 100 |

**private 类型** 需要携带 Authorization 头。

**响应**:
```json
[
  {
    "id": 1,
    "target_type": "public",
    "target_id": "global",
    "sender": "user1",
    "content": "hello",
    "timestamp": 1700000000,
    "avatar_url": "/uploads/avatar.png"
  }
]
```

消息按时间正序排列（旧 → 新）。

---

### 获取在线用户数

```
GET /api/online-users
```

**响应**:
```json
{
  "online_count": 5
}
```

---

## 文件上传

### 通用图片上传

```
POST /api/upload
Content-Type: multipart/form-data
```

**表单字段**: `image` (文件)

**响应**:
```json
{
  "url": "/uploads/xxx.png"
}
```

上传后的文件可通过 `/uploads/<filename>` 访问。

---

## 群组接口

### 获取群组成员列表

```
GET /api/group/{groupId}/members
```

**响应**:
```json
{
  "members": [
    {
      "username": "admin",
      "is_owner": true
    },
    {
      "username": "user1",
      "is_owner": false
    }
  ]
}
```

---

## 管理员接口

所有管理员接口需要在 Query 参数或 POST Body 中携带 `secret=admin666`。

### 获取用户列表

```
GET /api/admin/users?secret=admin666
```

**响应**:
```json
[
  {
    "is_online": true,
    "username": "admin",
    "last_ip": "192.168.1.100"
  }
]
```

---

### 获取消息列表

```
GET /api/admin/messages?secret=admin666
```

**响应**:
```json
[
  {
    "ID": 1,
    "sender": "user1",
    "content": "hello world"
  }
]
```

---

### 删除用户

```
POST /api/admin/delete-user
Content-Type: application/json
```

**请求体**:
```json
{
  "secret": "admin666",
  "username": "tobedeleted"
}
```

**效果**: 强制断开该用户的 WebSocket、删除用户记录及其好友/群组关联。

**响应**: `200 OK`

---

### 删除消息

```
POST /api/admin/delete-message
Content-Type: application/json
```

**请求体**:
```json
{
  "secret": "admin666",
  "id": 123
}
```

**响应**: `200 OK`

---

### 获取全局禁言状态

```
GET /api/admin/status?secret=admin666
```

**响应**:
```json
{
  "global_mute": false
}
```

---

### 切换全局禁言

```
GET /api/admin/toggle-mute?secret=admin666
```

**响应**:
```json
{
  "global_mute": true
}
```

开启后，所有用户无法发送消息（`msg` action 会被忽略）。

---

### 发送系统广播公告

```
POST /api/admin/broadcast
Content-Type: application/json
```

**请求体**:
```json
{
  "secret": "admin666",
  "content": "服务器将于今晚维护"
}
```

**效果**: 以「📢 系统公告」身份向公共聊天室发送一条消息，所有在线用户可见。

**响应**: `200 OK`

---

## 数据模型

### User (用户)

> **注意**: 本模型为后端存储模型。前端另有简化的展示模型（不含 password/signature/background_url，增加 is_online 字段），详细资料请见 UserProfile。

| 字段 | 类型 | 说明 |
|---|---|---|
| username | string | 主键，唯一标识 |
| password | string | 密码（明文存储） |
| avatar_url | string | 头像 URL |
| signature | string | 个性签名 |
| background_url | string | 背景 URL |
| last_ip | string | 最后登录 IP |

### Message (消息)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | int64 | 自增主键 |
| target_type | string | `public` / `group` / `private` |
| target_id | string | 目标 ID |
| sender | string | 发送者用户名 |
| content | string | 消息内容 |
| timestamp | int64 | Unix 时间戳 |
| avatar_url | string | 发送者头像 |

### Group (群组)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | int | 自增主键 |
| name | string | 群组名称 |
| owner | string | 群主用户名 |
| created_at | int64 (可选) | 创建时间（Unix 时间戳） |

### GroupMember (群组成员)

| 字段 | 类型 | 说明 |
|---|---|---|
| username | string | 成员用户名 |
| is_owner | boolean | 是否为群主 |
| joined_at | int64 | 加入时间（Unix 时间戳） |

---

## 错误码说明

| HTTP 状态码 | 说明 |
|---|---|
| 200 | 成功 |
| 400 | 参数错误 / 无效的文件 |
| 401 | 未授权 / Token 无效 / 缺失 |
| 403 | 权限不足（管理员密钥错误） |
| 404 | 用户不存在 |
| 409 | 用户名已存在 |
| 500 | 服务器内部错误 |

---

## WebSocket 错误类型

| type | content |
|---|---|
| auth_err | 认证失败的具体原因 |
| create_group_err | 群组创建失败原因 |
| rename_group_err | 重命名失败原因 |
| publish_announcement_err | 发布公告失败原因 |
| disband_group_err | 解散群组失败原因 |
| quit_group_err | 退出群组失败原因 |
| add_member_err | 添加成员失败原因 |
| withdraw_message_err | 撤回消息失败原因 |
