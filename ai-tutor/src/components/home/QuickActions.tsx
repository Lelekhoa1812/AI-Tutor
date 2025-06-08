'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, LineChart, PlayCircle } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              Start Learning
            </CardTitle>
            <CardDescription>
              Begin a new learning session with your AI tutor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/onboarding">
                Start Session
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Study Materials
            </CardTitle>
            <CardDescription>
              Access your personalized study materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/materials">
                View Materials
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Progress Report
            </CardTitle>
            <CardDescription>
              Track your learning progress and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/progress">
                View Progress
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
} 