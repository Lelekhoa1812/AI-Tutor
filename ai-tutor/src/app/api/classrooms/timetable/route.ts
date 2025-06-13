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
    activities: z.array(z.string()).optional().default([]),
    materials: z.array(z.string()).optional().default([]),
    homework: z.string().optional().default('')
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
    console.log('Received timetable data:', JSON.stringify(body, null, 2))

    // Validate the data
    const validatedData = timetableSchema.parse(body)
    console.log('Validated timetable data:', JSON.stringify(validatedData, null, 2))

    // Verify that the classroom belongs to the user
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: validatedData.classroomId,
        userId: session.user.id
      }
    })

    if (!classroom) {
      console.error('Classroom not found:', {
        classroomId: validatedData.classroomId,
        userId: session.user.id
      })
      return NextResponse.json(
        { error: 'Classroom not found' },
        { status: 404 }
      )
    }

    console.log('Found classroom:', JSON.stringify(classroom, null, 2))

    // Save the timetable
    try {
      const timetable = await prisma.timetable.create({
        data: {
          classroomId: validatedData.classroomId,
          schedule: validatedData.timetable as any
        }
      })
      console.log('Created timetable:', JSON.stringify(timetable, null, 2))
      return NextResponse.json(timetable)
    } catch (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }
  } catch (error) {
    console.error('Error saving timetable:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Validation error details:', error.errors)
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save timetable', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 