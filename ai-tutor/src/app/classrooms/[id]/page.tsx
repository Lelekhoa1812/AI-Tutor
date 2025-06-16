// src/app/classrooms/[id]/page.tsx
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TimetableDisplay } from "@/components/classroom/TimetableDisplay"
import { Prisma } from "@prisma/client"
import { BookOpen, Calendar, TrendingUp, ClipboardList, StickyNote, Link2 } from "lucide-react";
import Link from "next/link";

type ClassroomWithTimetable = Prisma.ClassroomGetPayload<{
  include: { timetable: true }
}>

interface ClassroomPageProps {
  params: {
    id: string
  }
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return notFound()
  }

  const classroom = await prisma.classroom.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      timetable: true,
    },
  }) as ClassroomWithTimetable | null;

  if (!classroom) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{classroom.name}</h1>
      
      {classroom.timetable?.schedule ? (
        <TimetableDisplay timetable={classroom.timetable.schedule as any} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No timetable available for this classroom.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-6 my-8">
        <div className="flex flex-wrap justify-center gap-6">
          <Link href={`/classrooms/${classroom.id}/materials`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Study Materials" title="Study Materials">
                <BookOpen className="h-10 w-10 group-hover:text-primary transition-colors" />
              </button>
              <span className="mt-2 text-sm font-medium text-center">Study Materials</span>
            </div>
          </Link>
          <Link href={`/classrooms/timetable/${classroom.id}`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Schedule" title="Schedule">
                <Calendar className="h-10 w-10 group-hover:text-primary transition-colors" />
              </button>
              <span className="mt-2 text-sm font-medium text-center">Schedule</span>
            </div>
          </Link>
          <Link href={`/classrooms/${classroom.id}/progress`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Progress" title="Progress">
                <TrendingUp className="h-10 w-10 group-hover:text-primary transition-colors" />
              </button>
              <span className="mt-2 text-sm font-medium text-center">Progress</span>
            </div>
          </Link>
          <Link href={`/classrooms/${classroom.id}/assignments`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Assignments" title="Assignments">
                <ClipboardList className="h-10 w-10 group-hover:text-primary transition-colors" />
              </button>
              <span className="mt-2 text-sm font-medium text-center">Assignments</span>
            </div>
          </Link>
          <Link href={`/classrooms/${classroom.id}/notes`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Notes" title="Notes">
                <StickyNote className="h-10 w-10 group-hover:text-primary transition-colors" />
              </button>
              <span className="mt-2 text-sm font-medium text-center">Notes</span>
            </div>
          </Link>
          <Link href={`/classrooms/${classroom.id}/resources`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Resources" title="Resources">
                <Link2 className="h-10 w-10 group-hover:text-primary transition-colors" />
              </button>
              <span className="mt-2 text-sm font-medium text-center">Resources</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 