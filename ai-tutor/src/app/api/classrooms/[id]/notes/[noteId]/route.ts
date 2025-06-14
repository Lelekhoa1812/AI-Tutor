// src/app/api/classrooms/[id]/notes/[noteId]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET a single note
export async function GET(req: Request, { params }: { params: { noteId: string } }) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.noteId }
    });
    
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

// PATCH update a note
export async function PATCH(req: Request, { params }: { params: { noteId: string } }) {
  try {
    const { content, name, color } = await req.json();
    const note = await prisma.note.update({
      where: { id: params.noteId },
      data: {
        ...(content !== undefined && { content }),
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
      }
    });
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE a note
export async function DELETE(req: Request, { params }: { params: { noteId: string } }) {
  try {
    await prisma.note.delete({
      where: { id: params.noteId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}