import type {
  ApiConversation,
  ApiConversationWithMessages,
  ApiMessage,
  Conversation,
  ConversationDetail,
  Message,
  MessageRole,
} from '@/types'
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT_MS } from '@/constants'

function mapConversation(raw: ApiConversation): Conversation {
  return {
    id: raw.id,
    title: raw.title,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

function mapMessage(raw: ApiMessage): Message {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    role: raw.role,
    content: raw.content,
    status: 'complete',
    createdAt: raw.created_at,
  }
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONVERSATIONS}`, {
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Failed to fetch conversations: ${response.status}`)
  const data = (await response.json()) as ApiConversation[]
  return data.map(mapConversation)
}

export async function createConversation(title?: string): Promise<Conversation> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONVERSATIONS}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title ?? null }),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Failed to create conversation: ${response.status}`)
  const data = (await response.json()) as ApiConversation
  return mapConversation(data)
}

export async function fetchConversationWithMessages(id: string): Promise<ConversationDetail> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONVERSATION(id)}`, {
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Failed to fetch conversation: ${response.status}`)
  const data = (await response.json()) as ApiConversationWithMessages
  return {
    conversation: mapConversation(data),
    messages: data.messages.map(mapMessage),
  }
}

export async function addMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MESSAGES(conversationId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, content }),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Failed to add message: ${response.status}`)
  const data = (await response.json()) as ApiMessage
  return mapMessage(data)
}

export async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONVERSATION(id)}`, {
    method: 'DELETE',
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Failed to delete conversation: ${response.status}`)
}
