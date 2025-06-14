// src/app/api/classrooms/[id]/notes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all notes for a classroom
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const notes = await prisma.note.findMany({
      where: { classroomId: params.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST create a new note
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { content, name, color } = await req.json();
    const note = await prisma.note.create({
      data: {
        classroomId: params.id,
        content,
        name: name || "Note",
        color: color || "yellow", // default color
      }
    });
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}