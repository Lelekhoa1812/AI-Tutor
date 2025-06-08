'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClassroomModal } from '@/components/classroom/ClassroomModal'

interface Classroom {
  id: string
  name: string
  gradeLevel: string
  subject: string
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Content Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Study Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add study materials content */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add schedule content */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add progress content */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add assignments content */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add notes content */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add resources content */}
            </CardContent>
          </Card>
        </div>
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