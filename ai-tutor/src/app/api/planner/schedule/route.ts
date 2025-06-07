import { NextResponse } from "next/server";

// Mock data - replace with actual database query
const mockSchedule = [
  {
    id: "1",
    title: "Introduction to Algebra",
    start: new Date(2024, 2, 18, 9, 0),
    end: new Date(2024, 2, 18, 10, 30),
    chapterId: "alg-1",
  },
  {
    id: "2",
    title: "Linear Equations",
    start: new Date(2024, 2, 19, 9, 0),
    end: new Date(2024, 2, 19, 10, 30),
    chapterId: "alg-2",
  },
  {
    id: "3",
    title: "Quadratic Functions",
    start: new Date(2024, 2, 20, 9, 0),
    end: new Date(2024, 2, 20, 10, 30),
    chapterId: "alg-3",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classroomId = searchParams.get("classroomId");

  if (!classroomId) {
    return NextResponse.json(
      { error: "Classroom ID is required" },
      { status: 400 }
    );
  }

  // TODO: Replace with actual database query
  // For now, return mock data
  return NextResponse.json(mockSchedule);
} 