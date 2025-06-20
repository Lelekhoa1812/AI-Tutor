// src/components/onboarding/ClassroomStepper.tsx
'use client'

import React, { useState, useEffect } from 'react'
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
import { Loader2, Search, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// Candidate type (nearest match book)
interface Candidate {
  candidate_id: string
  title: string
  description?: string
  author?: string
  year?: number
  source: 'google' | 'openlibrary' | 'ia' | 'gutenberg'
  ref: Record<string, any>
  previewUrl?: string
}

// Form Schema
const classroomSchema = z.object({
  name: z.string().min(2, 'Classroom name must be at least 2 characters'),
  role: z.enum(['tutor', 'student']),
  subject: z.string().min(1, 'Please select a subject'),
  gradeLevel: z.string().min(1, 'Please select a grade level'),
  notice: z.string().optional().nullable(),
  textbook: z.object({
    source: z.enum(['upload', 'online', 'google', 'openlibrary', 'ia', 'gutenberg']).optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    documentId: z.string().optional(),
    uri: z.string().optional(),
    file: z.any().optional()
  }).optional().nullable(),
  syllabus: z.object({
    source: z.enum(['upload', 'online', 'google', 'openlibrary', 'ia', 'gutenberg']).optional(),
    id: z.string().optional(),
    title: z.string().optional(),
    documentId: z.string().optional(),
    uri: z.string().optional(),
    file: z.any().optional()
  }).optional().nullable(),
  studyPreferences: z.object({
    daysPerWeek: z.number().min(1).max(7),
    numberWeekTotal: z.number().min(1).max(52),
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
  'Self-study',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12', 'Tertiary', 'Postgraduate'
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
  const [isGeneratingTimetable, setIsGeneratingTimetable] = useState(false)
  const [timetableGenerated, setTimetableGenerated] = useState(false)
  const [classroomId, setClassroomId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [previewOnlyCandidates, setPreviewOnlyCandidates] = useState<Record<string, string>>({})
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'complete'>('idle')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'complete'>('idle')
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null)
  const [timetableData, setTimetableData] = useState<any>(null)

  const form = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: '',
      role: 'student',
      subject: '',
      gradeLevel: '',
      textbook: {
        source: undefined,
        documentId: undefined,
        file: null
      },
      syllabus: {
        source: undefined,
        documentId: undefined,
        file: null
      },
      studyPreferences: {
        daysPerWeek: 3,
        numberWeekTotal: 12,
        hoursPerSession: 1,
        learningStyle: 'step-by-step'
      }
    },
    mode: 'onChange'
  })

  // Add form state logging
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log('Form values changed:', value)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Add form error logging
  useEffect(() => {
    console.log('Form errors:', form.formState.errors)
  }, [form.formState.errors])

  // Enum steps
  const validateCurrentStep = async () => {
    const currentValues = form.getValues()
    console.log('Validating step:', currentStep, 'with values:', currentValues)
    
    switch (currentStep) {
      case 1:
        // Validate only name, role, subject, and gradeLevel
        return form.trigger(['name', 'role', 'subject', 'gradeLevel'])
      case 2:
        // No validation needed for step 2 as files are optional
        return true
      case 3:
        // Validate all study preferences fields
        return form.trigger([
          'studyPreferences.daysPerWeek',
          'studyPreferences.numberWeekTotal',
          'studyPreferences.hoursPerSession',
          'studyPreferences.learningStyle'
        ])
      default:
        return false
    }
  }

  // Trim and send query searching closest match
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    // On searching session, await endpoint
    setIsSearching(true)
    try {
      const response = await fetch(`https://binkhoale1812-querysearcher.hf.space/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      // Map data to Candidate type
      setCandidates(
        data.map((item: any) => {
          const previewUrl =
            item.source === 'google'
              ? `https://books.google.com/books/about?id=${item.ref?.id}&redir_esc=y`
              : item.web_reader_url || null;
          // Return url for preview (CHANGED on google source)
          return {
            candidate_id: item.candidate_id,
            title: item.title,
            author: item.author,
            year: item.year,
            description: `${item.author || ''} (${item.year || 'n/a'})`,
            source: item.source,
            ref: item.ref,
            previewUrl
          } as Candidate;
        })
      );      
      // Set preview links for candidates that are not downloadable
      const previewLinks = data.reduce((acc: Record<string, string>, item: any) => {
        if (!item.download_available && item.web_reader_url) {
          acc[item.candidate_id] = item.web_reader_url
        }
        return acc
      }, {})
      setPreviewOnlyCandidates(previewLinks)      
    } catch (error) {
      toast({
        title: 'Search Failed',
        description: 'Failed to search for documents. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleImport = async (candidate: Candidate) => {
    const docId = candidate.candidate_id;
    setSelectedCandidate(candidate)
    setImportStatus('importing')
    console.log('[DEBUG] Importing document:', docId)
    // Open WebSocket *immediately*
    const ws = new WebSocket(`wss://binkhoale1812-querysearcher.hf.space/ws/documents/${docId}`);
    setWsConnection(ws);
    // Connect immediately to WebSocket
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[DEBUG] WebSocket message received:', data);

      if (data.status === 'NOT_FOUND') {
        toast({
          title: 'Import Error',
          description: 'The import job could not be found. Please try again.',
          variant: 'destructive'
        });
        setImportStatus('idle');
        setSelectedCandidate(null);
        ws.close();
        setWsConnection(null);
        return;
      }
      // If import is ready, update form and state
      if (data.status === 'READY') {
        console.log('[DEBUG] Import complete, updating form and state');
        console.log('[DEBUG] Textbook source (from candidate):', candidate.source);
        setImportStatus('complete');
        setSelectedCandidate(null);
        ws.close();
        setWsConnection(null);
        // Update form with new document ID
        form.setValue('textbook', {
          source: candidate.source,
          id: data.id,
          title: data.title,
          documentId: data.documentId,
          uri: data.uri
        });
        
        toast({
          title: 'Import Complete',
          description: 'Textbook imported successfully!',
        });
      }
    };
    
    ws.onerror = () => {
      toast({
        title: 'Import Failed',
        description: 'WebSocket error occurred.',
        variant: 'destructive'
      });
      setImportStatus('idle');
      ws.close();
      setWsConnection(null);
    };
    // Then fire off the import request
    try {
      const response = await fetch('https://binkhoale1812-querysearcher.hf.space/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: docId,
          title: candidate.title,
          source: candidate.source,
          ref: candidate.ref
        })
      });
      // If preview only, update form and state
      if (response.status === 403) {
        const body = await response.json();
        const webPreview = body?.previewUrl ?? candidate.ref?.webReaderLink ?? candidate.ref?.url;
        if (webPreview) {
          toast({
            title: 'Preview Only',
            description: 'This book is not available for download, but can be previewed online.',
          });
          setPreviewOnlyCandidates((prev) => ({ ...prev, [docId]: webPreview }));
          ws.close();
          setWsConnection(null);
          return;
        }
        throw new Error('Download not permitted and no preview available');
      }
      // If import failed, show error
      if (!response.ok) throw new Error('Import failed');
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Failed to import document. Please try again.',
        variant: 'destructive'
      });
      setImportStatus('idle');
      ws.close();
      setWsConnection(null);
    }
  };
  
  // Cleanup WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close()
      }
    }
  }, [wsConnection])

  const handleFileUpload = async (file: File | undefined, type: 'textbook' | 'syllabus') => {
    if (!file) return null
    
    // Generate a unique candidate_id for the upload
    const candidate_id = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const title = file.name.replace(/\.[^/.]+$/, "") // Remove file extension
    
    setUploadStatus('uploading')
    console.log('[DEBUG] Uploading file:', file.name, 'with candidate_id:', candidate_id)
    
    // Open WebSocket connection immediately
    const ws = new WebSocket(`wss://binkhoale1812-querysearcher.hf.space/ws/documents/${candidate_id}`)
    setWsConnection(ws)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('[DEBUG] WebSocket message received (upload):', data)
      
      if (data.status === 'NOT_FOUND') {
        toast({
          title: 'Upload Error',
          description: 'The upload job could not be found. Please try again.',
          variant: 'destructive'
        })
        setUploadStatus('idle')
        ws.close()
        setWsConnection(null)
        return
      }
      
      if (data.status === 'READY') {
        console.log('[DEBUG] Upload complete, updating form and state')
        setUploadStatus('complete')
        ws.close()
        setWsConnection(null)
        
        // Update form with uploaded document
        if (type === 'textbook') {
          form.setValue('textbook', {
            source: 'upload',
            id: data.id,
            title: data.title,
            documentId: data.documentId,
            uri: data.uri
          })
        } else if (type === 'syllabus') {
          form.setValue('syllabus', {
            source: 'upload',
            documentId: data.documentId,
            uri: data.uri
          })
        }
        
        toast({
          title: 'Upload Complete',
          description: `${type === 'textbook' ? 'Textbook' : 'Syllabus'} uploaded successfully!`,
        })
      }
    }
    
    ws.onerror = () => {
      toast({
        title: 'Upload Failed',
        description: 'WebSocket error occurred during upload.',
        variant: 'destructive'
      })
      setUploadStatus('idle')
      ws.close()
      setWsConnection(null)
    }
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('candidate_id', candidate_id)
      formData.append('source', 'manual')

      const response = await fetch('https://binkhoale1812-querysearcher.hf.space/import/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[DEBUG] Upload API error:', errorText)
        throw new Error(`Upload failed: ${response.status}`)
      }
      
      console.log('[DEBUG] Upload request sent successfully')
      
    } catch (error) {
      console.error('[DEBUG] Error uploading file:', error)
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive'
      })
      setUploadStatus('idle')
      ws.close()
      setWsConnection(null)
    }
  }

  // Generate a unique ID for the classroom
  const generateClassroomId = (name: string) => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${random}`
  }

  const generateTimetable = async (data: ClassroomFormData) => {
    try {
      setIsGeneratingTimetable(true)
      // Generate a unique ID for the classroom
      const newClassroomId = generateClassroomId(data.name)
      setClassroomId(newClassroomId)
      
      console.log('Generating timetable...')
      const timetableResponse = await fetch('https://binkhoale1812-tutorbot.hf.space/api/generate-timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: data.name, // use name as temp-id, properly using newClassroomId 
          name: data.name,
          role: data.role,
          subject: data.subject,
          gradeLevel: data.gradeLevel,
          textbookUrl: data.textbook?.documentId || null,
          syllabusUrl: data.syllabus?.documentId || null,
          studyPreferences: data.studyPreferences
        })
      })

      if (!timetableResponse.ok) {
        throw new Error('Failed to generate timetable')
      }

      const timetableData = await timetableResponse.json()
      console.log('Timetable generated:', timetableData)

      // Parse the timetable_raw JSON string
      const timetableJson = JSON.parse(timetableData.timetable_raw.replace(/```json\n|\n```/g, ''))
      console.log('Parsed timetable:', timetableJson)

      // Transform the data if needed
      const transformedTimetable = timetableJson.timetable.map((session: any) => ({
        week: session.week,
        day: session.day,
        durationHours: session.durationHours,
        topic: session.topic,
        activities: session.activities || [],
        materials: session.materials || [],
        homework: session.homework || ''
      }))

      setTimetableData(transformedTimetable)
      setTimetableGenerated(true)
      toast({
        title: "Success!",
        description: "Timetable generated successfully. You can now create the classroom.",
      })
    } catch (error) {
      console.error('Error generating timetable:', error)
      // Provide user-friendly error message
      toast({
        title: "Unable to Generate Timetable",
        description: "We encountered an issue while creating your timetable. This is usually temporary - please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingTimetable(false)
    }
  }

  const onSubmit = async (data: ClassroomFormData) => {
    try {
      setIsSubmitting(true)
      console.log('Submitting form with data:', data)

      // Prepare payload for backend
      const payload = {
        ...data,
        textbook: data.textbook || null,
        syllabus: data.syllabus || null,
        timetable: timetableData || null
      }

      // First, create the classroom
      const classroomResponse = await fetch('/api/classrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!classroomResponse.ok) {
        const errorData = await classroomResponse.json()
        throw new Error(errorData.error || 'Failed to create classroom')
      }

      const classroomResult = await classroomResponse.json()
      console.log('Classroom created:', classroomResult)

      // Save the timetable to our database
      console.log('Saving timetable with data:', {
        classroomId: classroomResult.classroomId,
        timetable: timetableData
      })
      const saveTimetableResponse = await fetch('/api/classrooms/timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroomId: classroomResult.classroomId,
          timetable: timetableData
        })
      })

      if (!saveTimetableResponse.ok) {
        const errorData = await saveTimetableResponse.json()
        console.error('Failed to save timetable:', errorData)
        throw new Error(errorData.error || 'Failed to save timetable')
      }

      toast({
        title: "Success!",
        description: "Classroom created and timetable saved successfully.",
      })

      // Only close and redirect on complete success
      router.refresh()
      router.push(`/classrooms/${classroomResult.classroomId}?success=true`)
    } catch (error) {
      console.error('Error in form submission:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create classroom",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the handleNext function
  const handleNext = async () => {
    console.log('handleNext called, current step:', currentStep)
    const isValid = await validateCurrentStep()
    console.log('Step validation result:', isValid)
    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault(); // Prevent form submission
        if (timetableGenerated) {
          onSubmit(form.getValues());
        }
      }} className="space-y-8">
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
                  name="notice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Add any special instructions or notices" 
                          {...field} 
                          value={field.value || ''}
                        />
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
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Primary Textbook</h3>
                  
                  {/* File Upload Section */}
                  <Card>
                    <CardContent className="pt-6">
                <FormField
                  control={form.control}
                        name="textbook.file"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                            <FormLabel>Upload Local PDF</FormLabel>
                      <FormControl>
                              <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      onChange(file)
                                      form.setValue('textbook', {
                                        source: 'upload',
                                        file
                                      })
                                    }
                                  }}
                          {...field}
                        />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const input = document.createElement('input')
                                    input.type = 'file'
                                    input.accept = '.pdf'
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0]
                                      if (file) {
                                        onChange(file)
                                        form.setValue('textbook', {
                                          source: 'upload',
                                          file
                                        })
                                      }
                                    }
                                    input.click()
                                  }}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                                {form.getValues('textbook')?.file && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFileUpload(form.getValues('textbook')?.file, 'textbook')}
                                    disabled={uploadStatus === 'uploading'}
                                  >
                                    {uploadStatus === 'uploading' ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                      </>
                                    ) : uploadStatus === 'complete' ? (
                                      'Uploaded'
                                    ) : (
                                      'Upload'
                                    )}
                                  </Button>
                                )}
                              </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                    </CardContent>
                  </Card>

                  {/* Online Search Section */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <FormLabel>Search Online</FormLabel>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Search for textbooks (e.g., 'Calculus Stewart 8th')"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                          >
                            {isSearching ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {/* Search Results wrapped in scrollable div */}
                        {candidates.length > 0 && (
                          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
                            {candidates.map((candidate) => {
                              // Format the metadata display consistently
                              const formatMetadata = () => {
                                const parts = []
                                
                                // Clean and format author
                                if (candidate.author) {
                                  // Remove extra parentheses and formatting from author
                                  const cleanAuthor = candidate.author
                                    .replace(/\([^)]*\)/g, '') // Remove parentheses content
                                    .replace(/\s+/g, ' ') // Normalize whitespace
                                    .trim()
                                  if (cleanAuthor) {
                                    parts.push(cleanAuthor)
                                  }
                                }
                                
                                // Add year if available
                                if (candidate.year) {
                                  parts.push(candidate.year.toString())
                                }
                                
                                // Always add source
                                parts.push(`Source: ${candidate.source}`)
                                
                                return parts.join(' • ')
                              }

                              return (
                                <Card key={candidate.candidate_id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium">{candidate.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {formatMetadata()}
                                        </p>
                                      </div>
                                      {candidate.previewUrl ? (
                                        <Button
                                          variant="link"
                                          className="text-blue-600"
                                          onClick={() => window.open(candidate.previewUrl, '_blank')}
                                        >
                                          Preview
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleImport(candidate)}
                                          disabled={importStatus === 'importing' && selectedCandidate?.candidate_id === candidate.candidate_id}
                                        >
                                          {selectedCandidate?.candidate_id === candidate.candidate_id ? (
                                            importStatus === 'importing' ? (
                                              <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Importing...
                                              </>
                                            ) : importStatus === 'complete' ? (
                                              'Imported'
                                            ) : (
                                              'Import'
                                            )
                                          ) : (
                                            'Import'
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Syllabus Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Syllabus</h3>
                <FormField
                  control={form.control}
                    name="syllabus.file"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                        <FormLabel>Upload Syllabus (Optional)</FormLabel>
                      <FormControl>
                          <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  onChange(file)
                                  form.setValue('syllabus', {
                                    source: 'upload',
                                    file
                                  })
                                }
                              }}
                          {...field}
                        />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = '.pdf'
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    onChange(file)
                                    form.setValue('syllabus', {
                                      source: 'upload',
                                      file
                                    })
                                  }
                                }
                                input.click()
                              }}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            {form.getValues('syllabus')?.file && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFileUpload(form.getValues('syllabus')?.file, 'syllabus')}
                                disabled={uploadStatus === 'uploading'}
                              >
                                {uploadStatus === 'uploading' ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : uploadStatus === 'complete' ? (
                                  'Uploaded'
                                ) : (
                                  'Upload'
                                )}
                              </Button>
                            )}
                          </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </div>
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
                  name="studyPreferences.numberWeekTotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Number of Weeks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={52}
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
            disabled={currentStep === 1 || isSubmitting}
          >
            Previous
          </Button>
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || importStatus === 'importing'}
            >
              Next
            </Button>
          ) : (
            <div className="flex justify-end space-x-4">
            {!timetableGenerated ? (
              <Button
                type="button"
                onClick={() => generateTimetable(form.getValues())}
                disabled={isGeneratingTimetable}
              >
                {isGeneratingTimetable ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Timetable...
                  </>
                ) : (
                  'Generate Timetable'
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => onSubmit(form.getValues())}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Classroom...
                  </>
                ) : (
                  'Create Classroom'
                )}
            </Button>
            )}
          </div>
          )}
        </div>
      </form>
    </Form>
  )
} 