'use client'

import { useState, FormEvent, useRef } from 'react'
import axios from 'axios'

interface ChatMessage {
  type: 'user' | 'bot'
  text: string
}

export default function PDFChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const API_BASE_URL = 'https://chatbot-4dq9.onrender.com'

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', selectedFile)

      try {
        await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        setMessages([
          ...messages, 
          { type: 'bot', text: `PDF "${selectedFile.name}" uploaded successfully!` }
        ])
      } catch {
        setMessages([
          ...messages, 
          { type: 'bot', text: 'Error uploading PDF. Please try again.' }
        ])
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleChat = async (event: FormEvent) => {
    event.preventDefault()
    const input = chatInputRef.current
    if (!input || !input.value.trim()) return

    const userMessage = input.value
    setMessages([...messages, { type: 'user', text: userMessage }])
    input.value = ''
    setIsProcessing(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, { 
        question: userMessage 
      })

      setMessages(prev => [
        ...prev, 
        { type: 'bot', text: response.data.response }
      ])
    } catch {
      setMessages(prev => [
        ...prev, 
        { type: 'bot', text: 'Sorry, something went wrong. Please try again.' }
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Chatbot</h1>

      {/* File Upload */}
      <div className="mb-4">
        <input 
          type="file" 
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>

      {/* Chat Messages */}
      <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-2 p-2 rounded ${
              msg.type === 'user' 
                ? 'bg-blue-100 text-right' 
                : 'bg-green-100 text-left'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleChat} className="flex">
        <input 
          type="text"
          ref={chatInputRef}
          placeholder="Ask a question about the PDF"
          className="flex-grow border rounded-l p-2"
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          className="bg-green-500 text-white px-4 py-2 rounded-r"
          disabled={isProcessing}
        >
          {isProcessing ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}