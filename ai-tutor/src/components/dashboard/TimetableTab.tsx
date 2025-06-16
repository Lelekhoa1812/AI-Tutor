'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimetableDisplay } from '@/components/classroom/TimetableDisplay'
import { Loader2 } from 'lucide-react'

interface Classroom {
  id: string
  name: string
  subject: string
  gradeLevel: string
  timetable: {
    week: number
    day: number
    durationHours: number
    topic: string
    activities: string[]
    materials: string[]
    homework: string
  }[]
}

export function TimetableTab() {
  const { data: classrooms, isLoading, error } = useQuery<Classroom[]>({
    queryKey: ['schedule'],
    queryFn: async () => {
      const response = await fetch('/api/schedule')
      if (!response.ok) {
        throw new Error('Failed to fetch schedule')
      }
      const data = await response.json()
      console.log('API Response:', data) // Debug log
      return data
    }
  })

  console.log('Classrooms data:', classrooms) // Debug log

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading timetables...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-destructive">
        <p>Failed to load timetables. Please try again later.</p>
      </div>
    )
  }

  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <p>No timetables found. Create a classroom and generate a timetable to see your schedule.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {classrooms.map((classroom) => {
        console.log('Classroom timetable:', classroom.timetable) // Debug log
        return (
          <Card key={classroom.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{classroom.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {classroom.subject} • {classroom.gradeLevel}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TimetableDisplay timetable={classroom.timetable} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 