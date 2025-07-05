"use client"

import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Save, X, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TimetableSession {
  week: number
  day: number
  durationHours: number
  topic: string
  activities: string[]
  materials: string[]
  homework: string
}

interface EditableTimetableProps {
  timetable: TimetableSession[]
  classroomId: string
  onSave?: (timetable: TimetableSession[]) => void
}

export function EditableTimetable({ timetable: initialTimetable, classroomId, onSave }: EditableTimetableProps) {
  const [timetable, setTimetable] = useState<TimetableSession[]>(initialTimetable || [])
  const [editingSession, setEditingSession] = useState<TimetableSession | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Group sessions by week
  const sessionsByWeek = timetable.reduce((acc, session) => {
    if (!acc[session.week]) {
      acc[session.week] = []
    }
    acc[session.week].push(session)
    return acc
  }, {} as Record<number, TimetableSession[]>)

  const getMaxWeek = () => {
    return Math.max(...timetable.map(s => s.week), 0)
  }

  const getMaxDayForWeek = (week: number) => {
    const weekSessions = timetable.filter(s => s.week === week)
    return Math.max(...weekSessions.map(s => s.day), 0)
  }

  const addNewWeek = () => {
    const newWeek = getMaxWeek() + 1
    const newSession: TimetableSession = {
      week: newWeek,
      day: 1,
      durationHours: 1,
      topic: '',
      activities: [],
      materials: [],
      homework: ''
    }
    setTimetable([...timetable, newSession])
    setEditingSession(newSession)
  }

  // If no timetable exists, show a message to create one
  if (!initialTimetable || initialTimetable.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Timetable Found</h2>
          <p className="text-muted-foreground">
            This classroom doesn't have a timetable yet. Create one to get started!
          </p>
          <Button onClick={() => {
            addNewWeek()
            setIsEditing(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Week
          </Button>
        </div>
      </div>
    )
  }

  const addNewDay = (week: number) => {
    const newDay = getMaxDayForWeek(week) + 1
    const newSession: TimetableSession = {
      week,
      day: newDay,
      durationHours: 1,
      topic: '',
      activities: [],
      materials: [],
      homework: ''
    }
    setTimetable([...timetable, newSession])
    setEditingSession(newSession)
  }

  const deleteSession = (week: number, day: number) => {
    setTimetable(timetable.filter(s => !(s.week === week && s.day === day)))
  }

  const updateSession = (updatedSession: TimetableSession) => {
    setTimetable(timetable.map(s => 
      s.week === updatedSession.week && s.day === updatedSession.day 
        ? updatedSession 
        : s
    ))
    setEditingSession(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Determine if this is a new timetable or an update
      const isNewTimetable = !initialTimetable || initialTimetable.length === 0
      const method = isNewTimetable ? 'POST' : 'PUT'
      
      const response = await fetch('/api/classrooms/timetable', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroomId,
          timetable
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save timetable')
      }

      toast({
        title: "Success",
        description: isNewTimetable ? "Timetable created successfully" : "Timetable saved successfully",
      })

      onSave?.(timetable)
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save timetable",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const SessionEditDialog = ({ session, onSave, onCancel }: {
    session: TimetableSession
    onSave: (session: TimetableSession) => void
    onCancel: () => void
  }) => {
    const [editedSession, setEditedSession] = useState<TimetableSession>(session)
    const [newActivity, setNewActivity] = useState('')
    const [newMaterial, setNewMaterial] = useState('')

    const addActivity = () => {
      if (newActivity.trim()) {
        setEditedSession({
          ...editedSession,
          activities: [...editedSession.activities, newActivity.trim()]
        })
        setNewActivity('')
      }
    }

    const removeActivity = (index: number) => {
      setEditedSession({
        ...editedSession,
        activities: editedSession.activities.filter((_, i) => i !== index)
      })
    }

    const addMaterial = () => {
      if (newMaterial.trim()) {
        setEditedSession({
          ...editedSession,
          materials: [...editedSession.materials, newMaterial.trim()]
        })
        setNewMaterial('')
      }
    }

    const removeMaterial = (index: number) => {
      setEditedSession({
        ...editedSession,
        materials: editedSession.materials.filter((_, i) => i !== index)
      })
    }

    return (
      <Dialog open={true} onOpenChange={() => onCancel()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Session - Week {session.week}, Day {session.day}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={editedSession.durationHours}
                  onChange={(e) => setEditedSession({
                    ...editedSession,
                    durationHours: parseFloat(e.target.value) || 1
                  })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={editedSession.topic}
                onChange={(e) => setEditedSession({
                  ...editedSession,
                  topic: e.target.value
                })}
                placeholder="Enter topic"
              />
            </div>

            <div>
              <Label>Activities</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="Add activity"
                  onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                />
                <Button type="button" onClick={addActivity} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedSession.activities.map((activity, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {activity}
                    <button
                      onClick={() => removeActivity(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Materials</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Add material"
                  onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
                />
                <Button type="button" onClick={addMaterial} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedSession.materials.map((material, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {material}
                    <button
                      onClick={() => removeMaterial(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="homework">Homework</Label>
              <Textarea
                id="homework"
                value={editedSession.homework}
                onChange={(e) => setEditedSession({
                  ...editedSession,
                  homework: e.target.value
                })}
                placeholder="Enter homework assignment"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={() => onSave(editedSession)}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Classroom Timetable</h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Timetable
            </Button>
          ) : (
            <>
              <Button onClick={addNewWeek} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Week
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="h-[600px] w-full rounded-md border">
        <div className="p-4 space-y-6">
          {Object.entries(sessionsByWeek).map(([week, sessions]) => (
            <Card key={week}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Week {week}</CardTitle>
                    <CardDescription>Learning schedule for week {week}</CardDescription>
                  </div>
                  {isEditing && (
                    <Button onClick={() => addNewDay(parseInt(week))} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Day
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:text-white transition-colors">
                        <TableHead className="min-w-[100px] text-justify">Day</TableHead>
                        <TableHead className="min-w-[100px] text-justify">Duration</TableHead>
                        <TableHead className="min-w-[200px] text-justify">Topic</TableHead>
                        <TableHead className="min-w-[200px] text-justify">Activities</TableHead>
                        <TableHead className="min-w-[200px] text-justify">Materials</TableHead>
                        <TableHead className="min-w-[200px] text-justify">Homework</TableHead>
                        {isEditing && (
                          <TableHead className="min-w-[100px] text-justify">Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow
                          key={`${session.week}-${session.day}`}
                          className="group hover:bg-red-950 hover:text-white transition-colors"
                        >
                          <TableCell className="min-w-[100px] text-justify">Day {session.day}</TableCell>
                          <TableCell className="min-w-[100px] text-justify">{session.durationHours} hour(s)</TableCell>
                          <TableCell className="min-w-[200px] font-medium text-justify">{session.topic}</TableCell>
                          <TableCell className="min-w-[200px] text-justify">
                            <div className="space-y-1">
                              {session.activities.map((activity, index) => (
                                <Badge key={index} variant="outline" className="mr-1 mb-1 flex group-hover:text-white group-hover:border-white transition-colors">
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[200px] text-justify">
                            <div className="space-y-1">
                              {session.materials.map((material, index) => (
                                <Badge key={index} variant="outline" className="mr-1 mb-1 flex group-hover:text-white group-hover:border-white transition-colors">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[200px] text-justify">
                            <p className="text-sm text-muted-foreground group-hover:text-white transition-colors">{session.homework}</p>
                          </TableCell>
                          {isEditing && (
                            <TableCell className="min-w-[100px] text-justify">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingSession(session)}
                                  className="group-hover:bg-green-600 group-hover:border-green-600 group-hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteSession(session.week, session.day)}
                                  className="group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white hover:bg-red-700 hover:border-red-700 hover:text-white transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {editingSession && (
        <SessionEditDialog
          session={editingSession}
          onSave={updateSession}
          onCancel={() => setEditingSession(null)}
        />
      )}
    </div>
  )
} 