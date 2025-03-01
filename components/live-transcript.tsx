"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  speaker: string
  text: string
}

interface LiveTranscriptProps {
  messages: Message[]
}

export default function LiveTranscript({ messages }: LiveTranscriptProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <div ref={scrollAreaRef}>
      <ScrollArea className="h-[300px] rounded-md border p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Transcript will appear here...
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-start">
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      message.speaker === "Agent" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">{message.speaker}</div>
                    <div>{message.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

