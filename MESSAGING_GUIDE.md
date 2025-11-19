# Real-Time Messaging System Documentation

## Overview
A complete real-time messaging system with WebSocket support using Socket.IO, Prisma ORM, and NuxtUI components.

## Database Schema

### Conversation Model
Represents a conversation between users.
- `conversation_id` (Int): Primary key, auto-increment
- `created_at` (DateTime): Timestamp of creation
- `updated_at` (DateTime): Timestamp of last update
- **Relations**: `messages` (one-to-many)

### Message Model
Stores individual messages within conversations.
- `message_id` (Int): Primary key, auto-increment
- `conversation_id` (Int): Foreign key to Conversation
- `sender_id` (Int): Foreign key to User
- `content` (String): Message content
- `created_at` (DateTime): Timestamp of creation
- `is_read` (Boolean): Read status (default: false)
- **Relations**: 
  - `conversation` (many-to-one)
  - `sender` (many-to-one to User)
  - `attachments` (one-to-many)

### MessageAttachment Model
For handling file attachments in messages.
- `attachment_id` (Int): Primary key, auto-increment
- `message_id` (Int): Foreign key to Message
- `file_url` (String): URL to the file
- `file_name` (String): Original filename
- `file_type` (String): MIME type
- **Relations**: `message` (many-to-one)

## API Endpoints

### Conversations
- **GET** `/api/conversations/[userId]` - Get all conversations for a user
  - Returns: Array of conversations with latest messages

- **POST** `/api/conversations` - Create or get existing conversation
  - Body: `{ participant1_id: number, participant2_id: number }`
  - Returns: Conversation object

### Messages
- **GET** `/api/messages/[conversationId]` - Get all messages in a conversation
  - Returns: Array of messages sorted by creation date (ascending)

- **POST** `/api/messages/[conversationId]` - Send a new message
  - Body: `{ content: string, sender_id: number, attachments?: Array<{file_url, file_name, file_type}> }`
  - Returns: Created message with sender details

- **PATCH** `/api/messages/[messageId]` - Update message read status
  - Body: `{ is_read: boolean }`
  - Returns: Updated message

## Socket.IO Events

### Client → Server Events
- **join_conversation**: { conversation_id, user_id }
  - Join a conversation room for real-time updates

- **leave_conversation**: { conversation_id, user_id }
  - Leave a conversation room

- **send_message**: { conversation_id, content, sender_id }
  - Send a message (also creates it in database)

- **mark_as_read**: { message_id, conversation_id }
  - Mark a message as read

### Server → Client Events
- **new_message**: Message object
  - Broadcasted when a new message is sent

- **message_read**: Message object
  - Broadcasted when a message is marked as read

- **user_joined**: { user_id, conversation_id, activeUsers: number[] }
  - Broadcasted when a user joins a conversation

- **user_left**: { conversation_id, activeUsers: number[] }
  - Broadcasted when a user leaves a conversation

## Components

### Inbox Component (`app/pages/inbox.vue`)
Main messaging interface with:
- **Conversations List**: Shows all conversations with latest message preview
- **Chat View**: Displays messages and allows sending new ones
- **Real-time Updates**: Messages appear instantly when received
- **Online Indicator**: Shows Socket.IO connection status
- **Read Receipts**: Displays ✓ for sent and ✓✓ for read messages

Features:
- Auto-scroll to latest message
- Time formatting (now, Xm ago, HH:MM, MMM DD)
- Responsive design (mobile and desktop)
- Loading states

## Composable

### `useSocket()` Composable
Manages Socket.IO client connection and events.

**Methods:**
- `initSocket()`: Initialize Socket.IO connection
- `sendMessage(conversationId, content)`: Emit message to server
- `joinConversation(conversationId)`: Join conversation room
- `leaveConversation(conversationId)`: Leave conversation room
- `markAsRead(messageId, conversationId)`: Mark message as read
- `disconnect()`: Disconnect from server

**Reactive State:**
- `isConnected`: Boolean, socket connection status
- `messages`: Array, incoming messages from socket

**Usage:**
```ts
const { isConnected, messages, initSocket, sendMessage } = useSocket()

onMounted(() => {
  initSocket()
})

function sendMsg(content) {
  sendMessage(conversationId, content)
}
```

## Server Plugin

### Socket.IO Server Plugin (`server/plugins/socket.ts`)
Handles WebSocket server initialization and event handling:
- Manages active conversation rooms
- Broadcasts messages to connected users
- Updates read status across all clients
- Tracks user presence in conversations

## Installation & Setup

1. **Dependencies already installed:**
   - socket.io: ^4.7.2
   - socket.io-client: ^4.7.2
   - @prisma/client: ^6.17.1

2. **Database migration applied:**
   - Creates Conversation, Message, and MessageAttachment tables
   - Run: `npx prisma migrate dev`

3. **Development:**
   ```bash
   npm run dev
   # Server runs with Socket.IO support at localhost:3000
   ```

## Usage Example

### Starting a Conversation
```ts
// Create conversation between two users
const conversation = await $fetch('/api/conversations', {
  method: 'POST',
  body: {
    participant1_id: currentUserId,
    participant2_id: otherUserId
  }
})
```

### Sending Messages
```ts
const { joinConversation, sendMessage } = useSocket()

// Join the conversation room
joinConversation(conversationId)

// Send a message
const message = await $fetch(
  `/api/messages/${conversationId}`,
  {
    method: 'POST',
    body: {
      content: 'Hello!',
      sender_id: currentUserId
    }
  }
)
```

### Real-time Updates
Messages appear instantly when received via Socket.IO:
```ts
const { messages } = useSocket()

// Messages automatically appear here as they're received
watch(() => messages.value.length, () => {
  console.log('New message received:', messages.value)
})
```

## Best Practices

1. **Always join conversation** before expecting real-time updates
2. **Clean up on unmount** - leave conversations when component unmounts
3. **Handle connection failures** - implement reconnection logic
4. **Mark messages as read** - update read status for seen messages
5. **Validate sender_id** - ensure it matches authenticated user
6. **Use pagination** - load messages in batches for large conversations

## Performance Considerations

- **Socket.IO Rooms**: Users are automatically organized by conversation_id
- **Database Indexes**: Message queries use conversation_id for fast lookups
- **Real-time Broadcasts**: Only sent to users in the specific conversation room
- **Connection Pooling**: Uses Supabase connection pooler for database efficiency

## Security Notes

- Always authenticate Socket.IO connections via JWT token
- Validate user permissions before allowing message access
- Sanitize message content before storing in database
- Implement rate limiting for message sending
- Use HTTPS/WSS in production environments
