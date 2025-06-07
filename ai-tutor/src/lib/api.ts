import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

// Example API endpoints
export const api = {
  learning: {
    getProgress: async () => {
      // TODO: Implement actual API call
      return {
        completedLessons: 5,
        totalLessons: 10,
        currentStreak: 3,
      }
    },
  },
  timetable: {
    getSchedule: async () => {
      // TODO: Implement actual API call
      return {
        schedule: [
          { id: 1, subject: 'Math', time: '09:00', duration: 60 },
          { id: 2, subject: 'Science', time: '11:00', duration: 45 },
        ],
      }
    },
  },
  homework: {
    getAssignments: async () => {
      // TODO: Implement actual API call
      return {
        assignments: [
          { id: 1, subject: 'Math', title: 'Algebra Practice', dueDate: '2024-03-20' },
          { id: 2, subject: 'Science', title: 'Lab Report', dueDate: '2024-03-22' },
        ],
      }
    },
  },
} 