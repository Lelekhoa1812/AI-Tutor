import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all classrooms with timetables for the schedule view
    const classrooms = await prisma.classroom.findMany({
      where: {
        userId: session.user.id,
        timetable: {
          isNot: null
        }
      },
      select: {
        id: true,
        name: true,
        subject: true,
        gradeLevel: true,
        timetable: {
          select: {
            schedule: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to ensure timetable is in the correct format
    const transformedClassrooms = classrooms.map(classroom => {
      let timetable = []
      try {
        if (classroom.timetable?.schedule) {
          timetable = classroom.timetable.schedule as any[]
        }
      } catch (error) {
        console.error('Error parsing timetable:', error)
      }

      return {
        id: classroom.id,
        name: classroom.name,
        subject: classroom.subject,
        gradeLevel: classroom.gradeLevel,
        timetable
      }
    })

    console.log('Transformed classrooms:', transformedClassrooms) // Debug log

    return NextResponse.json(transformedClassrooms)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
} 