"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";

// Dynamically import the worker from local dependency
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

export default function ClassroomResourcesPage() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Fetch the documentId for this classroom
  useEffect(() => {
    async function fetchDocumentId() {
      setLoading(true);
      setError(null);
      console.log('[DEBUG] Fetching resources for classroom:', id);
      
      try {
        const res = await fetch(`/api/classrooms/${id}/resources`);
        console.log('[DEBUG] API response status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('[DEBUG] API error:', errorText);
          throw new Error(`Failed to fetch classroom resources: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('[DEBUG] API response data:', data);
        
        if (!data.documentId) {
          throw new Error("No textbook found for this classroom");
        }
        
        // Construct the PDF URL
        const pdfUrl = `https://binkhoale1812-querysearcher.hf.space/import/textbook/${data.documentId}`;
        console.log('[DEBUG] PDF URL:', pdfUrl);
        setPdfUrl(pdfUrl);
        
      } catch (err: any) {
        console.error('[DEBUG] Error fetching resources:', err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchDocumentId();
  }, [id]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('[DEBUG] PDF loaded successfully, pages:', numPages);
    setNumPages(numPages);
    setPageNumber(1);
    setPdfLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('[DEBUG] PDF load error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setPdfLoading(false);
  }

  function goToPrevPage() {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }
  
  function goToNextPage() {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Classroom Resources</h1>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading textbook...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {!loading && !error && pdfUrl && (
        <div className="flex flex-col items-center">
          <div className="border rounded-lg shadow-lg mb-6 bg-white">
            <Document 
              file={pdfUrl} 
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-3"></div>
                  <span>Loading PDF...</span>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                width={Math.min(800, window.innerWidth - 100)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
          
          {numPages > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={goToPrevPage} 
                disabled={pageNumber <= 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pageNumber} of {numPages}
              </span>
              <Button 
                onClick={goToNextPage} 
                disabled={pageNumber >= numPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 