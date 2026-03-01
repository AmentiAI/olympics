import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get real counts from database
    const [totalAgents, liveCompetitions, totalMedals] = await Promise.all([
      prisma.agent.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.competition.count({
        where: { 
          status: {
            in: ['IN_PROGRESS', 'REGISTRATION_OPEN'] // Count both as "live"
          }
        }
      }),
      prisma.medal.count()
    ])

    return NextResponse.json({
      totalAgents,
      liveCompetitions,
      totalMedals
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { totalAgents: 0, liveCompetitions: 0, totalMedals: 0 },
      { status: 200 } // Return zeros instead of error for graceful degradation
    )
  }
}
