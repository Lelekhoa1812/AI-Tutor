'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      router.push('/dashboard')
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to AI Tutor</h1>
        <OnboardingStepper />
      </div>
    </div>
  );
} 