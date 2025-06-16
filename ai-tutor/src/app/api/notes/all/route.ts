import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 })
    }

    // Fetch all classrooms for the user, including notes
    const classrooms = await prisma.classroom.findMany({
      where: {
        userId: session.user.id,
        notes: {
          some: {}, // Only classrooms with at least one note
        },
      },
      select: {
        id: true,
        name: true,
        notes: {
          select: {
            id: true,
            name: true,
            content: true,
            color: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Transform for frontend
    const result = classrooms.map(c => ({
      classroomId: c.id,
      classroomName: c.name,
      notes: c.notes,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching all notes:', error)
    return NextResponse.json([], { status: 500 })
  }
}
