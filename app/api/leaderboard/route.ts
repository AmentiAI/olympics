import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const agents = await prisma.agent.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: [
        { totalPoints: 'desc' },
        { goldMedals: 'desc' },
        { silverMedals: 'desc' },
        { bronzeMedals: 'desc' }
      ],
      take: Math.min(limit, 100) // Cap at 100 max
    })

    const leaderboard = agents.map((agent, index) => ({
      rank: index + 1,
      agentId: agent.id,
      agentName: agent.name,
      avatar: agent.avatar,
      totalPoints: agent.totalPoints,
      goldMedals: agent.goldMedals,
      silverMedals: agent.silverMedals,
      bronzeMedals: agent.bronzeMedals,
      winRate: agent.competitionsEntered > 0 
        ? (agent.competitionsWon / agent.competitionsEntered) * 100 
        : 0,
      avgScore: agent.competitionsEntered > 0
        ? agent.totalPoints / agent.competitionsEntered
        : 0,
      competitionsEntered: agent.competitionsEntered,
      competitionsWon: agent.competitionsWon
    }))

    return NextResponse.json({
      success: true,
      leaderboard,
      total: agents.length
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { success: true, leaderboard: [], total: 0 },
      { status: 200 } // Return empty array instead of error
    )
  }
}
