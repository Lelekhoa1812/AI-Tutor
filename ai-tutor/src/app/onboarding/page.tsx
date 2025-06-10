'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClassroomStepper } from "@/components/onboarding/ClassroomStepper"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Pencil, Check, Trash2 } from 'lucide-react'
import { ClassroomModal } from '@/components/classroom/ClassroomModal'

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
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null)
  const [newName, setNewName] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)

  useEffect(() => {
    fetchClassrooms()
  }, [])

  // Fetch classrooms from db with content
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

  const handleClassroomClick = (classroom: Classroom) => {
    setSelectedClassroom(classroom)
  }
  
  // Rename Classroom
  const handleRename = async (classroomId: string) => {
    try {
      const response = await fetch(`/api/classrooms/${classroomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })
      if (!response.ok) throw new Error('Failed to rename classroom')
      setEditingClassroom(null)
      fetchClassrooms()
    } catch (error) {
      console.error('Error renaming classroom:', error)
    }
  }

  // Delete Classroom
  const handleDelete = async (classroomId: string) => {
    try {
      const response = await fetch(`/api/classrooms/${classroomId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete classroom')
      await fetchClassrooms() // Refresh UI
    } catch (error) {
      console.error('Error deleting classroom:', error)
    }
  }
  

  const handleDialogClose = () => {
    setShowOnboarding(false)
    fetchClassrooms() // Refresh the list when dialog is closed
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
              onClick={() => handleClassroomClick(classroom)}
            >
              <CardHeader className="p-0">
                <div className="flex items-start justify-between w-full">
                  {/* Classroom Name */}
                  <CardTitle className="flex-1">
                    {editingClassroom === classroom.id ? (
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(classroom.id)}
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      classroom.name
                    )}
                  </CardTitle>
                  {/* Button group */}
                  <div className="flex items-center space-x-1">
                      {/* Rename Classroom */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (editingClassroom === classroom.id) {
                            handleRename(classroom.id)
                          } else {
                            setEditingClassroom(classroom.id)
                            setNewName(classroom.name)
                          }
                        }}
                      >
                        {editingClassroom === classroom.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                      </Button>
                      {/* Delete Classroom */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          setClassroomToDelete(classroom)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                <p className="text-sm text-muted-foreground">
                  {classroom.gradeLevel} • {classroom.subject}
                </p>
              </CardContent>
            </Card>
          ))}

          <Card 
            className="rounded-2xl p-4 shadow-md hover:shadow-lg transition cursor-pointer border-dashed"
            onClick={() => setShowOnboarding(true)}
          >
            <CardContent className="flex flex-col items-center justify-center h-32">
              <div className="text-2xl mb-2">+</div>
              <p className="text-lg font-medium">New Classroom</p>
            </CardContent>
          </Card>
          {/* Classroom Stepper Dialog */}
          <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
            <DialogContent className="max-w-2xl">
              <ClassroomStepper />
            </DialogContent>
          </Dialog>
          {/* Delete Classroom Dialog */}
          <Dialog open={!!classroomToDelete} onOpenChange={() => setClassroomToDelete(null)}>
            <DialogContent>
              <h2 className="text-lg font-semibold">Delete Classroom</h2>
              <p>Are you sure you want to delete <strong>{classroomToDelete?.name}</strong>? This action cannot be undone.</p>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setClassroomToDelete(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!classroomToDelete) return
                    await handleDelete(classroomToDelete.id)
                    setClassroomToDelete(null)
                  }}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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