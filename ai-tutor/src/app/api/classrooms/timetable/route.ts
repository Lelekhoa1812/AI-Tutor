import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"

const timetableSchema = z.object({
  classroomId: z.string(),
  timetable: z.array(z.object({
    week: z.number(),
    day: z.number(),
    durationHours: z.number(),
    topic: z.string(),
    activities: z.array(z.string()),
    materials: z.array(z.string()),
    homework: z.string()
  }))
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = timetableSchema.parse(body)

    // Verify that the classroom belongs to the user
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: validatedData.classroomId,
        userId: session.user.id
      }
    })

    if (!classroom) {
      return NextResponse.json(
        { error: 'Classroom not found' },
        { status: 404 }
      )
    }

    // Save the timetable
    const timetable = await prisma.timetable.create({
      data: {
        classroomId: validatedData.classroomId,
        schedule: validatedData.timetable
      }
    })

    return NextResponse.json(timetable)
  } catch (error) {
    console.error('Error saving timetable:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save timetable' },
      { status: 500 }
    )
  }
} 