import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, GraduationCap, Lightbulb, Sparkles } from "lucide-react"
import Link from "next/link"
import { QuickActions } from "@/components/home/QuickActions"
import { ChatBot } from "@/components/chat/ChatBot"
import { ClientWrapper } from "@/components/ClientWrapper"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Welcome back, {session?.user?.name || 'Student'}!
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Continue your learning journey with personalized AI tutoring.
        </p>
      </section>

      {/* Quick Actions */}
      <ClientWrapper>
        <QuickActions />
      </ClientWrapper>

      {/* ChatBot Section */}
      <ClientWrapper>
        <section className="py-8">
          <ChatBot />
        </section>
      </ClientWrapper>

      {/* Features Section */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Personalized Learning
            </CardTitle>
            <CardDescription>
              Get customized learning paths based on your goals and learning style.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Our AI tutor adapts to your pace and preferences, ensuring you get the most out of every session.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Smart Tutoring
            </CardTitle>
            <CardDescription>
              Access intelligent tutoring that understands your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get instant answers, explanations, and guidance across various subjects and topics.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Progress Tracking
            </CardTitle>
            <CardDescription>
              Monitor your learning journey with detailed analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your progress, identify areas for improvement, and celebrate your achievements.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Your AI-Powered Learning Journey
        </h2>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Experience personalized learning with our AI tutor. Get instant help, track your progress, and achieve your academic goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/onboarding">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
