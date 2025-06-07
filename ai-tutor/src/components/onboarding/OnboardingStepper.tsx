import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { onboardingSchema, type OnboardingData } from "@/types/onboarding";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RoleGradeStep } from "./steps/RoleGradeStep";
import { PdfUploadStep } from "./steps/PdfUploadStep";
import { CalendarPreferencesStep } from "./steps/CalendarPreferencesStep";

const STEPS = [
  { id: "roleGrade", title: "Role & Grade" },
  { id: "pdfUpload", title: "Upload PDF" },
  { id: "calendarPreferences", title: "Calendar Preferences" },
] as const;

export function OnboardingStepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useLocalStorage<OnboardingData>(
    "onboarding-data",
    {
      roleGrade: { role: "student", grade: 1 },
      pdfUpload: { pdfUrl: "" },
      calendarPreferences: { daysPerWeek: 5, hoursPerDay: 8 },
    }
  );

  const methods = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: onboardingData,
  });

  const onSubmit = (data: OnboardingData) => {
    setOnboardingData(data);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Handle completion
      console.log("Onboarding completed:", data);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <RoleGradeStep />;
      case 1:
        return <PdfUploadStep />;
      case 2:
        return <CalendarPreferencesStep />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                index <= currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {index + 1}
              </div>
              <div className="text-sm font-medium">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Card className="p-6">
            {renderStep()}
            <div className="flex justify-between mt-6">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {currentStep === STEPS.length - 1 ? "Complete" : "Next"}
              </button>
            </div>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
} 