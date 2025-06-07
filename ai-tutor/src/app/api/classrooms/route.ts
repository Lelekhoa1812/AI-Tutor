import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const {
      name,
      role,
      subject,
      gradeLevel,
      textbookUrl,
      syllabusUrl,
      studyPreferences
    } = data

    const classroom = await prisma.classroom.create({
      data: {
        name,
        role,
        subject,
        gradeLevel,
        textbookUrl,
        syllabusUrl,
        studyPreferences,
        userId: session.user.id
      }
    })

    return NextResponse.json({ classroomId: classroom.id })
  } catch (error) {
    console.error('Error creating classroom:', error)
    return NextResponse.json(
      { error: 'Failed to create classroom' },
      { status: 500 }
    )
  }
} 