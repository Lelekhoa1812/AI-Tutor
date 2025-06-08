import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const classroomSchema = z.object({
  name: z.string().min(2, 'Classroom name must be at least 2 characters'),
  role: z.enum(['tutor', 'student']),
  subject: z.string().min(1, 'Please select a subject'),
  gradeLevel: z.string().min(1, 'Please select a grade level'),
  textbookUrl: z.string().optional(),
  syllabusUrl: z.string().optional(),
  studyPreferences: z.object({
    daysPerWeek: z.number().min(1).max(7),
    hoursPerSession: z.number().min(0.5).max(4),
    learningStyle: z.enum(['step-by-step', 'conceptual', 'visual'])
  })
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate the request body
    const validatedData = classroomSchema.parse(body)

    const classroom = await prisma.classroom.create({
      data: {
        ...validatedData,
        // For now, we'll use a default user ID
        userId: 'default-user'
      }
    })

    return NextResponse.json({ classroomId: classroom.id })
  } catch (error) {
    console.error('Error creating classroom:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create classroom' },
      { status: 500 }
    )
  }
} 