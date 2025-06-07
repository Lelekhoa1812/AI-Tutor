'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TimetableTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: api.timetable.getSchedule,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {data?.schedule.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.subject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <p>Time: {item.time}</p>
              <p>Duration: {item.duration} minutes</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 