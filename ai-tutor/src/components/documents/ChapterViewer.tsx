import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Passage {
  text: string;
  page: number;
}

interface QAResponse {
  answer: string;
  passages: Passage[];
}

export function ChapterViewer({ chapterId }: { chapterId: string }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [qaResponse, setQaResponse] = useState<QAResponse | null>(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(`/api/documents/get_chapter?chapterId=${chapterId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch chapter");
        }
        const data = await response.json();
        setPdfUrl(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsAsking(true);
    setQaResponse(null);

    try {
      const response = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, chapterId }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let answer = "";
      let passages: Passage[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.answer) answer += data.answer;
            if (data.passages) passages = data.passages;
          }
        }
      }

      setQaResponse({ answer, passages });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAsking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive p-8">{error}</div>;
  }

  if (!pdfUrl) {
    return <div className="p-8">No PDF available</div>;
  }

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <div className="absolute bottom-8 right-8 z-10">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              Ask a question
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Ask about this chapter</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <Textarea
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                onClick={handleAskQuestion}
                disabled={isAsking || !question.trim()}
                className="w-full"
              >
                {isAsking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  "Ask"
                )}
              </Button>

              {qaResponse && (
                <div className="space-y-4 mt-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{qaResponse.answer}</ReactMarkdown>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Relevant passages:</h4>
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                      {qaResponse.passages.map((passage, index) => (
                        <div key={index} className="mb-4 last:mb-0">
                          <p className="text-sm text-muted-foreground mb-1">
                            Page {passage.page}
                          </p>
                          <p className="text-sm">{passage.text}</p>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="h-full overflow-auto">
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mx-auto"
          />
        </Document>
      </div>

      {numPages && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {numPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 