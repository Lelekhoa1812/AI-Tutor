// app/api/classrooms/[id]/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Delete Classroom
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First, delete the timetable(s) associated with this classroom
    await prisma.timetable.deleteMany({
      where: {
        classroomId: params.id
      }
    })

    // Then, delete the classroom
    await prisma.classroom.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting classroom:', error)
    return NextResponse.json({ error: 'Failed to delete classroom' }, { status: 500 })
  }
}

// Rename Classroom
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const updated = await prisma.classroom.update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        name: body.name
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating classroom:', error)
    return NextResponse.json({ error: 'Failed to update classroom' }, { status: 500 })
  }
}
