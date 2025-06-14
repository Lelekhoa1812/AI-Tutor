// src/app/classrooms/timetable/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TimetableDisplay } from "@/components/classroom/TimetableDisplay";

interface TimetablePageProps {
  params: { id: string }
}

export default async function TimetablePage({ params }: TimetablePageProps) {
  const timetable = await prisma.timetable.findUnique({
    where: { classroomId: params.id }
  });

  if (!timetable) return notFound();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Classroom Schedule</h1>
      <TimetableDisplay timetable={timetable.schedule as any} />
    </div>
  );
}