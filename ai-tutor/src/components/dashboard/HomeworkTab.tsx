'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function HomeworkTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: api.homework.getAssignments,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {data?.assignments.map((assignment) => (
        <Card key={assignment.id}>
          <CardHeader>
            <CardTitle>{assignment.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <p>Subject: {assignment.subject}</p>
              <p>Due: {assignment.dueDate}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 