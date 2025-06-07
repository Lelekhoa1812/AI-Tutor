import { useFormContext } from "react-hook-form";
import { type OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function PdfUploadStep() {
  const { register, formState: { errors } } = useFormContext<OnboardingData>();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Here you would typically upload the file to your storage service
    // and get back a URL. For now, we'll just create a local URL
    const url = URL.createObjectURL(file);
    
    // Update the form with the URL
    const event = {
      target: { name: "pdfUpload.pdfUrl", value: url },
    };
    register("pdfUpload.pdfUrl").onChange(event);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pdf">Upload PDF</Label>
        <Input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        {errors.pdfUpload?.pdfUrl && (
          <p className="text-sm text-destructive">{errors.pdfUpload.pdfUrl.message}</p>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Please upload a PDF file containing your learning materials or syllabus.</p>
        <p>Maximum file size: 10MB</p>
      </div>
    </div>
  );
} 