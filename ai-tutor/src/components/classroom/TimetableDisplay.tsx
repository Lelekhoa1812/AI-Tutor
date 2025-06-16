// src/components/classroom/TimetableDisplay.tsx
import React from 'react'
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

interface TimetableSession {
  week: number
  day: number
  durationHours: number
  topic: string
  activities: string[]
  materials: string[]
  homework: string
}

interface TimetableDisplayProps {
  timetable: TimetableSession[] | string | null
}

export function TimetableDisplay({ timetable }: TimetableDisplayProps) {
  // Parse timetable if it's a string
  let parsedTimetable: TimetableSession[] = []
  
  if (typeof timetable === 'string') {
    try {
      parsedTimetable = JSON.parse(timetable)
    } catch (error) {
      console.error('Failed to parse timetable:', error)
      return (
        <div className="p-4 text-center text-muted-foreground">
          Failed to load timetable data
        </div>
      )
    }
  } else if (Array.isArray(timetable)) {
    parsedTimetable = timetable
  } else if (timetable === null) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No timetable data available
      </div>
    )
  }

  if (!Array.isArray(parsedTimetable) || parsedTimetable.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No timetable sessions found
      </div>
    )
  }

  // Group sessions by week
  const sessionsByWeek = parsedTimetable.reduce((acc, session) => {
    if (!acc[session.week]) {
      acc[session.week] = []
    }
    acc[session.week].push(session)
    return acc
  }, {} as Record<number, TimetableSession[]>)

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <div className="p-4 space-y-6">
        {Object.entries(sessionsByWeek).map(([week, sessions]) => (
          <Card key={week}>
            <CardHeader>
              <CardTitle>Week {week}</CardTitle>
              <CardDescription>Learning schedule for week {week}</CardDescription>
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
  )
} 