import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"

const classroomSchema = z.object({
  name: z.string().min(2, 'Classroom name must be at least 2 characters'),
  role: z.enum(['tutor', 'student']),
  subject: z.string().min(1, 'Please select a subject'),
  gradeLevel: z.string().min(1, 'Please select a grade level'),
  textbookUrl: z.string().nullable().optional(),
  syllabusUrl: z.string().nullable().optional(),
  studyPreferences: z.object({
    daysPerWeek: z.number().min(1).max(7),
    hoursPerSession: z.number().min(0.5).max(4),
    learningStyle: z.enum(['step-by-step', 'conceptual', 'visual'])
  })
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const classrooms = await prisma.classroom.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(classrooms)
  } catch (error) {
    console.error('Error fetching classrooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classrooms' },
      { status: 500 }
    )
  }
}

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
    console.log('Received request body:', body)
    
    // Validate the request body
    const validatedData = classroomSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Create the classroom with the validated data
    const classroom = await prisma.classroom.create({
      data: {
        name: validatedData.name,
        role: validatedData.role,
        subject: validatedData.subject,
        gradeLevel: validatedData.gradeLevel,
        textbookUrl: validatedData.textbookUrl || null,
        syllabusUrl: validatedData.syllabusUrl || null,
        studyPreferences: validatedData.studyPreferences,
        userId: session.user.id
      }
    })

    console.log('Created classroom:', classroom)
    return NextResponse.json({ classroomId: classroom.id })
  } catch (error) {
    console.error('Error creating classroom:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create classroom' },
      { status: 500 }
    )
  }
} 