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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Link href={`/classrooms/${classroom.id}/materials`}><button className="w-full p-6 border rounded-lg font-bold">Study Materials</button></Link>
        <Link href={`/classrooms/timetable/${classroom.id}`}><button className="w-full p-6 border rounded-lg font-bold">Schedule</button></Link>
        <Link href={`/classrooms/${classroom.id}/progress`}><button className="w-full p-6 border rounded-lg font-bold">Progress</button></Link>
        <Link href={`/classrooms/${classroom.id}/assignments`}><button className="w-full p-6 border rounded-lg font-bold">Assignments</button></Link>
        <Link href={`/classrooms/${classroom.id}/notes`}><button className="w-full p-6 border rounded-lg font-bold">Notes</button></Link>
        <Link href={`/classrooms/${classroom.id}/resources`}><button className="w-full p-6 border rounded-lg font-bold">Resources</button></Link>
      </div>
    </div>
  )
} 