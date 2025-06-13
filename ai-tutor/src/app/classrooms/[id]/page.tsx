import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TimetableDisplay } from "@/components/classroom/TimetableDisplay"
import { Prisma } from "@prisma/client"

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
      timetable: true
    },
  }) as ClassroomWithTimetable | null

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
    </div>
  )
} 