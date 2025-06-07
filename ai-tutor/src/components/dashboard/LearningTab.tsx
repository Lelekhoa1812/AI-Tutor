'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LearningTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['learning-progress'],
    queryFn: api.learning.getProgress,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Completed Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data?.completedLessons}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data?.totalLessons}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data?.currentStreak} days</p>
        </CardContent>
      </Card>
    </div>
  )
} 