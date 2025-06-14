'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClassroomModal } from '@/components/classroom/ClassroomModal'
import { BookOpen, Calendar, TrendingUp, ClipboardList, StickyNote, Link2 } from 'lucide-react'

interface Classroom {
  id: string
  name: string
  gradeLevel: string
  subject: string
}

const cardData = [
  {
    title: "Study Materials",
    description: "Access your textbooks, notes, and resources.",
    icon: <BookOpen className="h-10 w-10 text-blue-500" />,
  },
  {
    title: "Schedule",
    description: "View and manage your study timetable.",
    icon: <Calendar className="h-10 w-10 text-green-500" />,
  },
  {
    title: "Progress",
    description: "Track your learning progress and achievements.",
    icon: <TrendingUp className="h-10 w-10 text-purple-500" />,
  },
  {
    title: "Assignments",
    description: "Check and submit your assignments.",
    icon: <ClipboardList className="h-10 w-10 text-orange-500" />,
  },
  {
    title: "Notes",
    description: "Review and organize your class notes.",
    icon: <StickyNote className="h-10 w-10 text-yellow-500" />,
  },
  {
    title: "Resources",
    description: "Find additional learning materials.",
    icon: <Link2 className="h-10 w-10 text-teal-500" />,
  },
]

function DashboardContent() {
  const searchParams = useSearchParams()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const success = searchParams.get('success')

  useEffect(() => {
    fetchClassrooms()
  }, [])

  useEffect(() => {
    const classroomId = searchParams.get('classroomId')
    if (classroomId) {
      const classroom = classrooms.find(c => c.id === classroomId)
      if (classroom) {
        setSelectedClassroom(classroom)
      }
    }
  }, [searchParams, classrooms])

  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/classrooms')
      if (!response.ok) throw new Error('Failed to fetch classrooms')
      const data = await response.json()
      setClassrooms(data)
    } catch (error) {
      console.error('Error fetching classrooms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {success === 'onboarding' ? 'Onboarding completed successfully!' : 'Operation completed successfully!'}
              </p>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-center mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardData.map((card) => (
          <Card key={card.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-col items-center">
              <div className="mb-2 rounded-full bg-muted bg-secondary p-3 flex items-center justify-center">
                {card.icon}
              </div>
              <CardTitle className="text-center">{card.title}</CardTitle>
              <p className="text-sm text-muted-foreground text-center mt-1">{card.description}</p>
            </CardHeader>
            <CardContent>
              {/* Add card-specific content here */}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedClassroom && (
        <ClassroomModal
          isOpen={!!selectedClassroom}
          onClose={() => setSelectedClassroom(null)}
          classroomId={selectedClassroom.id}
          classroomName={selectedClassroom.name}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
} 