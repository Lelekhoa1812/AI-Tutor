import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LearningTab } from '../LearningTab'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    learning: {
      getProgress: vi.fn().mockResolvedValue({
        completedLessons: 5,
        totalLessons: 10,
        currentStreak: 3,
      }),
    },
  },
}))

describe('LearningTab', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  it('renders loading state initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LearningTab />
      </QueryClientProvider>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders learning progress data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LearningTab />
      </QueryClientProvider>
    )

    // Wait for the data to load
    expect(await screen.findByText('5')).toBeInTheDocument()
    expect(await screen.findByText('10')).toBeInTheDocument()
    expect(await screen.findByText('3 days')).toBeInTheDocument()
  })
}) 