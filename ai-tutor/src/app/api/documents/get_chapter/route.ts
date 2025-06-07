import { NextResponse } from "next/server";

// Mock data - replace with actual database/storage query
const mockChapters = {
  "alg-1": {
    url: "https://example.com/pdfs/algebra-chapter1.pdf",
  },
  "alg-2": {
    url: "https://example.com/pdfs/algebra-chapter2.pdf",
  },
  "alg-3": {
    url: "https://example.com/pdfs/algebra-chapter3.pdf",
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");

  if (!chapterId) {
    return NextResponse.json(
      { error: "Chapter ID is required" },
      { status: 400 }
    );
  }

  const chapter = mockChapters[chapterId as keyof typeof mockChapters];

  if (!chapter) {
    return NextResponse.json(
      { error: "Chapter not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(chapter);
} 