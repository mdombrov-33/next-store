import { RefObject } from 'react'

export type Message = {
  id: string
  content: string
  clerkId: string
  senderName: string
  senderAvatar: string
  sentAt: Date
  chatRoomId: string
}

//* For socket-only usage, includes optional clientId
export type SocketMessage = Message & {
  clientId?: string
}

export interface ChatWindowProps {
  messages: Message[]
  bottomRef: RefObject<HTMLDivElement | null>
}

export interface ChatWrapperProps {
  messages: Message[]
  displayedName: string
  senderAvatar: string
}

export interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export type EmojiData = {
  shortcode: string
  src: string
}[]
