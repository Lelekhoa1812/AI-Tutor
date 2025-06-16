'use client'

import { TimetableTab } from '@/components/dashboard/TimetableTab'

export default function SchedulePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Schedule</h1>
      <TimetableTab />
    </div>
  )
} 