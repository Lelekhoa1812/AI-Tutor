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
    const validatedData = classroomSchema.parse(body)

    // Create classroom in our database first
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

    // Send data to backend service
    const backendResponse = await fetch('https://binkhoale1812-tutorbot.hf.space/api/generate-timetable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: classroom.id,
        name: classroom.name,
        role: classroom.role,
        subject: classroom.subject,
        gradeLevel: classroom.gradeLevel,
        textbookUrl: classroom.textbookUrl,
        syllabusUrl: classroom.syllabusUrl,
        studyPreferences: classroom.studyPreferences
      })
    })

    if (!backendResponse.ok) {
      throw new Error('Failed to generate timetable from backend service')
    }

    const timetableData = await backendResponse.json()

    // Save timetable to database
    await prisma.timetable.create({
      data: {
        classroomId: classroom.id,
        schedule: timetableData.timetable
      }
    })

    return NextResponse.json({ 
      classroomId: classroom.id,
      timetable: timetableData.timetable
    })
  } catch (error) {
    console.error('Error creating classroom:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create classroom' },
      { status: 500 }
    )
  }
} 