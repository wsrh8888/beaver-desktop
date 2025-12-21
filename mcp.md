# Beaver IM MCP Tools - 基于现有代码

## 🎯 工具分类说明
- **UI界面操作**: 打开实际的浏览器窗口，让用户可以看到和交互界面
- **数据API操作**: 直接调用业务逻辑API，返回数据，不打开UI界面

## 消息功能 (基于MessageBusiness + ChatSender)

### 数据API操作
- send_text_message - 发送文本消息 (ChatSender.sendMessage)
- get_chat_history - 获取聊天历史 (MessageBusiness.getChatHistory)
- get_chat_messages_by_seq - 按序列获取消息 (MessageBusiness.getChatMessagesBySeqRange)

## 好友功能 (基于FriendBusiness)

### 数据API操作
- get_friends_list - 获取好友列表 (FriendBusiness.getFriendsList)
- get_friends_by_ids - 根据ID批量获取好友 (FriendBusiness.getFriendsByIds)

## 群聊功能 (基于GroupBusiness)

### 数据API操作
- get_group_list - 获取群聊列表 (GroupBusiness.getGroupList)
- get_groups_batch - 批量获取群详情 (GroupBusiness.getGroupsBatch)
- get_group_members - 获取群成员 (GroupBusiness.getGroupMembers)
- get_group_members_batch - 批量获取群成员 (GroupBusiness.getGroupMembersBatch)
- get_group_join_requests - 获取入群申请 (GroupBusiness.getGroupJoinRequests)

## 通知功能 (基于NotificationInboxBusiness)

### 数据API操作
- get_unread_summary - 获取未读汇总 (NotificationInboxBusiness.getUnreadSummary)
- mark_event_read - 标记事件已读 (NotificationInboxBusiness.markEventRead)
- get_by_event_ids - 根据ID获取通知 (NotificationInboxBusiness.getByEventIds)

## 用户功能 (基于UserBusiness)

### 数据API操作
- handle_user_table_updates - 处理用户数据更新 (UserBusiness.handleTableUpdates)
- process_user_sync_batch - 批量同步用户 (UserBusiness.processBatchRequests)

## 数据同步 (现有同步机制)

### 数据API操作
- sync_messages_by_version - 消息版本同步 (MessageBusiness.syncMessagesByVersion)
- sync_messages_by_version_range - 消息范围同步 (MessageBusiness.syncMessagesByVersionRange)
- handle_friend_table_updates - 好友表更新 (FriendBusiness.handleTableUpdates)
- process_friend_sync_batch - 好友批量同步 (FriendBusiness.processBatchRequests)
- handle_group_table_updates - 群聊表更新 (GroupBusiness.handleTableUpdates)
- process_group_sync_batch - 群聊批量同步 (GroupBusiness.processBatchRequests)

## 界面窗口 (基于vite.config.ts配置)

### UI界面操作
- open_image_window - 打开图片查看器窗口 (image.html)
- open_video_window - 打开视频播放器窗口 (video.html)
- open_audio_window - 打开音频播放器窗口 (audio.html)

## 朋友圈功能 (基于MomentBusiness)

### UI界面操作
- open_moment_window - 打开朋友圈窗口界面 (moment.html)

### 数据API操作
- view_moments - 获取朋友圈动态数据
- create_moment - 发布朋友圈动态
- like_moment - 点赞动态
- comment_moment - 评论动态

## 表情包功能 (基于EmojiBusiness)

### 数据API操作
- handle_emoji_updates - 处理表情更新 (EmojiBusiness基础功能)

## 系统功能 (现有功能)

### 数据API操作
- logout - 退出登录 (已有logout功能)
- get_app_info - 获取应用信息 (基于现有配置)
