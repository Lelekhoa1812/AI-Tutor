'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Pencil } from 'lucide-react'

interface Classroom {
  id: string
  name: string
  gradeLevel: string
  subject: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingClassroom, setEditingClassroom] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/classrooms/list')
      const data = await response.json()
      setClassrooms(data)
    } catch (error) {
      console.error('Error fetching classrooms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClassroomClick = (classroomId: string) => {
    router.push(`/dashboard?classroomId=${classroomId}`)
  }

  const handleRename = async (classroomId: string) => {
    try {
      await fetch(`/classrooms/${classroomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })
      setEditingClassroom(null)
      fetchClassrooms()
    } catch (error) {
      console.error('Error renaming classroom:', error)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Your Classrooms</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {classrooms.map((classroom) => (
            <Card 
              key={classroom.id}
              className="rounded-2xl p-4 shadow-md hover:shadow-lg transition cursor-pointer"
              onClick={() => handleClassroomClick(classroom.id)}
            >
              <CardHeader className="p-0">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">
                    {editingClassroom === classroom.id ? (
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleRename(classroom.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(classroom.id)}
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      classroom.name
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingClassroom(classroom.id)
                      setNewName(classroom.name)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                <p className="text-sm text-muted-foreground">
                  {classroom.gradeLevel} • {classroom.subject}
                </p>
              </CardContent>
            </Card>
          ))}

          <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
            <DialogTrigger asChild>
              <Card className="rounded-2xl p-4 shadow-md hover:shadow-lg transition cursor-pointer border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <div className="text-2xl mb-2">+</div>
                  <p className="text-lg font-medium">New Classroom</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <OnboardingStepper />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
} 