// src/app/classrooms/[id]/page.tsx
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TimetableDisplay } from "@/components/classroom/TimetableDisplay"
import { Prisma } from "@prisma/client"
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0H3m9 0a9 9 0 100-18 9 9 0 000 18z" /></svg>
              </button>
              <span className="mt-2 text-sm font-medium text-center">Study Materials</span>
            </div>
          </Link>
          <Link href={`/classrooms/timetable/${classroom.id}`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Schedule" title="Schedule">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18" /></svg>
              </button>
              <span className="mt-2 text-sm font-medium text-center">Schedule</span>
            </div>
          </Link>
          <Link href={`/classrooms/${classroom.id}/progress`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Progress" title="Progress">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </button>
              <span className="mt-2 text-sm font-medium text-center">Progress</span>
            </div>
          </Link>
          <Link href={`/classrooms/${classroom.id}/assignments`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Assignments" title="Assignments">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6M9 11h6M9 15h6" /></svg>
              </button>
              <span className="mt-2 text-sm font-medium text-center">Assignments</span>
            </div>
          </Link>
          <Link href={`/classrooms/${classroom.id}/notes`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Notes" title="Notes">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h4" /></svg>
              </button>
              <span className="mt-2 text-sm font-medium text-center">Notes</span>
            </div>
          </Link>
          <Link href={`/classrooms/${classroom.id}/resources`}>
            <div className="flex flex-col items-center group">
              <button className="rounded-full p-5 bg-white shadow hover:bg-primary/10 transition-colors" aria-label="Resources" title="Resources">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
              </button>
              <span className="mt-2 text-sm font-medium text-center">Resources</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
} 