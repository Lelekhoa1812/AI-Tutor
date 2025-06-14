import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET a single note
export async function GET(req: Request, { params }: { params: { noteId: string } }) {
  const note = await prisma.note.findUnique({
    where: { id: params.noteId }
  })
  return NextResponse.json(note)
}

// PATCH update a note
export async function PATCH(req: Request, { params }: { params: { noteId: string } }) {
  const { content } = await req.json()
  const note = await prisma.note.update({
    where: { id: params.noteId },
    data: { content }
  })
  return NextResponse.json(note)
}

// DELETE a note
export async function DELETE(req: Request, { params }: { params: { noteId: string } }) {
  await prisma.note.delete({
    where: { id: params.noteId }
  })
  return NextResponse.json({ success: true })
}