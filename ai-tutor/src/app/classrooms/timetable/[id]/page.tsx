// src/app/classrooms/timetable/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditableTimetable } from "@/components/classroom/EditableTimetable";

interface TimetablePageProps {
  params: { id: string }
}

export default async function TimetablePage({ params }: TimetablePageProps) {
  const timetable = await prisma.timetable.findUnique({
    where: { classroomId: params.id }
  });

  return (
    <div className="container mx-auto py-8">
      <EditableTimetable 
        timetable={timetable?.schedule as any || []} 
        classroomId={params.id}
      />
    </div>
  );
}