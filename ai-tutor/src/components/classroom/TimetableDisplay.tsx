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
  timetable: TimetableSession[]
}

export function TimetableDisplay({ timetable }: TimetableDisplayProps) {
  // Group sessions by week
  const sessionsByWeek = timetable.reduce((acc, session) => {
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Materials</TableHead>
                    <TableHead>Homework</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={`${session.week}-${session.day}`}>
                      <TableCell>Day {session.day}</TableCell>
                      <TableCell>{session.durationHours} hour(s)</TableCell>
                      <TableCell className="font-medium">{session.topic}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {session.activities.map((activity, index) => (
                            <Badge key={index} variant="secondary" className="mr-1 mb-1">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {session.materials.map((material, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-muted-foreground">{session.homework}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
} 