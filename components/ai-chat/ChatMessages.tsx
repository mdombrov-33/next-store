import { ChatWindowProps } from '@/types/ai-chat'
import { useEffect, useState } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { useAutoScroll } from './hooks/useAutoScroll'

function ChatMessages({
  messages,
  setMessages,
  setIsTyping,
  isTyping,
  messagesContainerRef,
}: ChatWindowProps) {
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useAutoScroll(
    messagesContainerRef as React.RefObject<HTMLDivElement>,
    isTyping,
    messages,
    isInitialLoad
  )

  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [messages, isInitialLoad])

  return (
    <section className="flex flex-col h-full overflow-hidden">
      {/* Chat messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 outline-none overflow-y-auto overflow-x-auto border focus-visible:border-ring focus-visible:ring-ring/50 rounded whitespace-pre-wrap break-words p-2 space-y-2 bg-[var(--terminal-background)] text-sm"
      >
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div
                key={i}
                className="p-2 rounded text-2xl bg-primary text-primary-foreground self-end"
              >
                {msg.content.trim()}
              </div>
            )
          } else {
            //* If already animated, just show instantly
            if (msg.hasAnimated) {
              return (
                <div
                  key={i}
                  className="p-2 rounded text-2xl bg-muted self-start text-muted-foreground"
                >
                  {msg.content.trim()}
                </div>
              )
            }

            //* Animate only messages that are not animated yet
            return (
              <TypeAnimation
                key={i}
                sequence={[
                  () => setIsTyping(true), // typing started
                  msg.content.trim(),
                  100,
                  () => {
                    setIsTyping(false) // typing finished
                    //* Mark message as animated
                    setMessages((prev) => {
                      const newMessages = [...prev]
                      if (newMessages[i]) {
                        newMessages[i] = {
                          ...newMessages[i],
                          hasAnimated: true,
                        }
                      }
                      return newMessages
                    })
                  },
                ]}
                speed={95}
                wrapper="div"
                className="p-2 rounded text-2xl bg-muted self-start text-muted-foreground"
                cursor={false}
              />
            )
          }
        })}
      </div>
    </section>
  )
}

export default ChatMessages
