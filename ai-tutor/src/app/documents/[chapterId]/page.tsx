"use client";

import { ChapterViewer } from "@/components/documents/ChapterViewer";

export default function ChapterPage({
  params,
}: {
  params: { chapterId: string };
}) {
  return <ChapterViewer chapterId={params.chapterId} />;
} 