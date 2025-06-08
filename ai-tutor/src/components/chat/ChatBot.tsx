'use client';

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Upload, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  subject?: string
  level?: string
  file?: File
}

const subjects = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology'
]

const gradeLevels = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12', 'Bachelor', 'Master', 'Doctorate'
]

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || !subject || !level) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      subject,
      level,
      file: selectedFile || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSelectedFile(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('query', input)
      formData.append('subject', subject)
      formData.append('level', level)
      formData.append('lang', 'EN')
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const response = await fetch('https://binkhoale1812-tutorbot.hf.space/chat', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Quick Tutoring Q&A</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      👨‍🏫
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'assistant'
                        ? 'bg-primary/10 prose prose-sm dark:prose-invert max-w-none'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      <>
                        {message.content}
                        {message.file && (
                          <div className="mt-2 text-sm">
                            📎 {message.file.name}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      👨‍🎓
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    👨‍🏫
                  </div>
                  <div className="max-w-[80%] rounded-lg p-3 bg-primary/10">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="space-y-2">
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>📎 {selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                disabled={isLoading || !subject || !level}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || !subject || !level}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && !selectedFile) || !subject || !level}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 