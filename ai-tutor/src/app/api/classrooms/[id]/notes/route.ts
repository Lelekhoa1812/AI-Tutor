import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all notes for a classroom
export async function GET(req: Request, { params }: { params: { classroomId: string } }) {
  const notes = await prisma.note.findMany({
    where: { classroomId: params.classroomId },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(notes)
}

// POST create a new note
export async function POST(req: Request, { params }: { params: { classroomId: string } }) {
  const { content } = await req.json()
  if (!params.classroomId) {
    return NextResponse.json({ error: "Missing classroomId" }, { status: 400 })
  }
  const note = await prisma.note.create({
    data: {
      classroomId: params.classroomId,
      content
    }
  })
  return NextResponse.json(note)
}