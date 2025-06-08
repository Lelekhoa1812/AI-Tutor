'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Form Schema
const classroomSchema = z.object({
  name: z.string().min(2, 'Classroom name must be at least 2 characters'),
  role: z.enum(['tutor', 'student']),
  subject: z.string().min(1, 'Please select a subject'),
  gradeLevel: z.string().min(1, 'Please select a grade level'),
  textbook: z.instanceof(File).optional(),
  syllabus: z.instanceof(File).optional(),
  studyPreferences: z.object({
    daysPerWeek: z.number().min(1).max(7),
    hoursPerSession: z.number().min(0.5).max(4),
    learningStyle: z.enum(['step-by-step', 'conceptual', 'visual'])
  })
})

type ClassroomFormData = z.infer<typeof classroomSchema>

const subjects = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology'
]

const gradeLevels = [
  'Bachelor', 'Master', 'Doctorate',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12', 'Tertiary'
]

const steps = [
  { id: 1, title: 'Classroom Info' },
  { id: 2, title: 'Upload Docs' },
  { id: 3, title: 'Study Preferences' }
]

export function ClassroomStepper() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      role: 'student',
      studyPreferences: {
        daysPerWeek: 3,
        hoursPerSession: 1,
        learningStyle: 'step-by-step'
      }
    }
  })

  const handleFileUpload = async (file: File, type: 'textbook' | 'syllabus') => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      return data.url
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive'
      })
      return null
    }
  }

  const onSubmit = async (data: ClassroomFormData) => {
    setIsSubmitting(true)
    try {
      // Upload files if present
      const [textbookUrl, syllabusUrl] = await Promise.all([
        data.textbook ? handleFileUpload(data.textbook, 'textbook') : null,
        data.syllabus ? handleFileUpload(data.syllabus, 'syllabus') : null
      ])

      // Create classroom
      const response = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          textbookUrl,
          syllabusUrl
        })
      })

      if (!response.ok) throw new Error('Failed to create classroom')

      const { classroomId } = await response.json()
      router.push(`/dashboard?classroomId=${classroomId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create classroom. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          {/* Stepper Navigation */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                      currentStep === step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/25 text-muted-foreground"
                    )}
                  >
                    {step.id}
                  </div>
                  {step.id < steps.length && (
                    <div
                      className={cn(
                        "h-0.5 w-8",
                        currentStep > step.id ? "bg-primary" : "bg-muted-foreground/25"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Title */}
          <h2 className="text-2xl font-semibold text-center">
            {steps.find(step => step.id === currentStep)?.title}
          </h2>

          {/* Step Content */}
          <div className="space-y-4">
            {currentStep === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classroom Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter classroom name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="tutor" />
                            </FormControl>
                            <FormLabel>Tutor</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="student" />
                            </FormControl>
                            <FormLabel>Student</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject.toLowerCase()}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gradeLevels.map((grade) => (
                            <SelectItem key={grade} value={grade.toLowerCase()}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {currentStep === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="textbook"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Primary Textbook (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="syllabus"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Syllabus (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {currentStep === 3 && (
              <>
                <FormField
                  control={form.control}
                  name="studyPreferences.daysPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days per Week</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={7}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studyPreferences.hoursPerSession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours per Session</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0.5}
                          max={4}
                          step={0.5}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studyPreferences.learningStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Learning Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select learning style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="step-by-step">Step by Step</SelectItem>
                          <SelectItem value="conceptual">Conceptual</SelectItem>
                          <SelectItem value="visual">Visual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Classroom'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
} 