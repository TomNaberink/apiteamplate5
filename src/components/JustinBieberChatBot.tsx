'use client'

import { useState } from 'react'

export default function JustinBieberChatBot() {
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'justin' | 'teacher', content: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasTeacherResponded, setHasTeacherResponded] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return

    // Add user message to conversation
    const updatedConversation = [
      ...conversation,
      { role: 'user', content: message }
    ]
    setConversation(updatedConversation)
    setMessage('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: `You are Justin Bieber. Respond to this message in your style, using your personality and way of speaking. Include references to your music, life experiences, and beliefs where relevant. Message: ${message}` 
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const data = await res.json()
      setConversation([
        ...updatedConversation,
        { role: 'justin', content: data.response }
      ])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const requestTeacherFeedback = async () => {
    if (hasTeacherResponded || conversation.length === 0) return

    setIsLoading(true)
    try {
      const userMessages = conversation
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n')

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: `You are an experienced English teacher reviewing a HAVO 4 (Dutch high school) student's English conversation. Analyze their English usage and provide constructive feedback on: grammar, vocabulary, sentence structure, and general language proficiency. Be encouraging but point out areas for improvement. Here are their messages:\n\n${userMessages}` 
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const data = await res.json()
      setConversation([
        ...conversation,
        { role: 'teacher', content: data.response }
      ])
      setHasTeacherResponded(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-xl">🎤</span>
          </div>
          <div>
            <h2 className="text-white font-bold">Chat with Justin Bieber</h2>
            <p className="text-purple-200 text-sm">Never say never, belieber!</p>
          </div>
        </div>
        <button
          onClick={requestTeacherFeedback}
          disabled={isLoading || hasTeacherResponded || conversation.length === 0}
          className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {hasTeacherResponded ? '✓ Feedback Given' : '📝 Get English Feedback'}
        </button>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 ${
                msg.role === 'user'
                  ? 'bg-purple-100 text-gray-800'
                  : msg.role === 'teacher'
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              }`}
            >
              {msg.role !== 'user' && (
                <div className={`text-xs font-medium mb-1 ${
                  msg.role === 'teacher' ? 'text-blue-600' : 'text-purple-600'
                }`}>
                  {msg.role === 'teacher' ? 'English Teacher' : 'Justin Bieber'}
                </div>
              )}
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Justin..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}