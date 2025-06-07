import { NextResponse } from "next/server";

// Mock RAG response - replace with actual RAG implementation
const mockRagResponse = {
  answer: "The quadratic formula is used to solve equations in the form ax² + bx + c = 0. It states that x = (-b ± √(b² - 4ac)) / 2a.",
  passages: [
    {
      text: "The quadratic formula is a fundamental tool in algebra for solving quadratic equations. It provides a direct method to find the roots of any quadratic equation in standard form.",
      page: 1,
    },
    {
      text: "To use the quadratic formula, first ensure the equation is in standard form: ax² + bx + c = 0. Then, identify the coefficients a, b, and c.",
      page: 2,
    },
  ],
};

export async function POST(request: Request) {
  const { question, chapterId } = await request.json();

  if (!question || !chapterId) {
    return NextResponse.json(
      { error: "Question and chapterId are required" },
      { status: 400 }
    );
  }

  // Create a TransformStream for streaming the response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Simulate streaming response
  (async () => {
    try {
      // Stream the answer
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ answer: mockRagResponse.answer })}\n\n`)
      );

      // Stream the passages
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ passages: mockRagResponse.passages })}\n\n`)
      );

      await writer.close();
    } catch (error) {
      console.error("Error streaming response:", error);
      await writer.abort(error);
    }
  })();

  return new NextResponse(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
} 