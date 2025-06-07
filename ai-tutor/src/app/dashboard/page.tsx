'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LearningTab } from '@/components/dashboard/LearningTab'
import { TimetableTab } from '@/components/dashboard/TimetableTab'
import { HomeworkTab } from '@/components/dashboard/HomeworkTab'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <Tabs defaultValue="learning" className="space-y-4">
        <TabsList>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="homework">Homework</TabsTrigger>
        </TabsList>
        <TabsContent value="learning">
          <LearningTab />
        </TabsContent>
        <TabsContent value="timetable">
          <TimetableTab />
        </TabsContent>
        <TabsContent value="homework">
          <HomeworkTab />
        </TabsContent>
      </Tabs>
    </div>
  )
} 