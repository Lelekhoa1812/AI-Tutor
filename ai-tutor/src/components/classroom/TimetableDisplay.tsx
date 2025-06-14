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
                <TableRow className="hover:text-white transition-colors">
                  <TableHead className="text-justify">Day</TableHead>
                  <TableHead className="text-justify">Duration</TableHead>
                  <TableHead className="text-justify">Topic</TableHead>
                  <TableHead className="text-justify">Activities</TableHead>
                  <TableHead className="text-justify">Materials</TableHead>
                  <TableHead className="text-justify">Homework</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow
                      key={`${session.week}-${session.day}`}
                      className="group hover:bg-red-950 hover:text-white transition-colors"
                    >
                      <TableCell className="text-justify">Day {session.day}</TableCell>
                      <TableCell className="text-justify">{session.durationHours} hour(s)</TableCell>
                      <TableCell className="font-medium text-justify">{session.topic}</TableCell>
                      <TableCell className="text-justify">
                        <div className="space-y-1">
                          {session.activities.map((activity, index) => (
                            <Badge key={index} variant="outline"   className="mr-1 mb-1 flex group-hover:text-white group-hover:border-white transition-colors">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-justify">
                        <div className="space-y-1">
                          {session.materials.map((material, index) => (
                            <Badge key={index} variant="outline"  className="mr-1 mb-1 flex group-hover:text-white group-hover:border-white transition-colors">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] text-justify">
                        <p className="text-sm text-muted-foreground group-hover:text-white transition-colors">{session.homework}</p>
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