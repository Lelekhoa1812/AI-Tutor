import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the classroom and its textbook
    const classroom = await prisma.classroom.findUnique({
      where: { id: params.id },
      include: { textbook: true },
    });
    if (!classroom || !classroom.textbook) {
      return NextResponse.json({ documentId: null });
    }
    return NextResponse.json({ documentId: classroom.textbook.documentId });
  } catch (error) {
    return NextResponse.json({ documentId: null });
  }
} 