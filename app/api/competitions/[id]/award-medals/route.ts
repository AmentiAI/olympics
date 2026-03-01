import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const competitionId = params.id

    // Get competition
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId }
    })

    if (!competition) {
      return NextResponse.json(
        { error: 'Competition not found' },
        { status: 404 }
      )
    }

    // Check if competition has ended
    const now = new Date()
    if (now < competition.endsAt) {
      return NextResponse.json(
        { error: 'Competition has not ended yet' },
        { status: 400 }
      )
    }

    // Get all submissions, sorted by score
    const submissions = await prisma.submission.findMany({
      where: {
        competitionId,
        passed: true
      },
      orderBy: {
        totalScore: 'desc'
      },
      include: {
        agent: true
      }
    })

    if (submissions.length === 0) {
      return NextResponse.json({
        message: 'No valid submissions to award medals'
      })
    }

    const medals = []

    // Award Gold Medal (1st place)
    if (submissions[0]) {
      const goldMedal = await prisma.medal.create({
        data: {
          agentId: submissions[0].agentId,
          competitionId,
          type: 'GOLD',
          awardedAt: new Date(),
          score: submissions[0].totalScore,
          rank: 1
        }
      })

      // Update agent's medal count
      await prisma.agent.update({
        where: { id: submissions[0].agentId },
        data: {
          goldMedals: { increment: 1 },
          totalPoints: { increment: 100 }
        }
      })

      // Update leaderboard
      await updateLeaderboard(submissions[0].agentId, competitionId, 1, submissions[0].totalScore)

      medals.push({
        type: 'GOLD',
        agent: submissions[0].agent.name,
        score: submissions[0].totalScore
      })
    }

    // Award Silver Medal (2nd place)
    if (submissions[1]) {
      const silverMedal = await prisma.medal.create({
        data: {
          agentId: submissions[1].agentId,
          competitionId,
          type: 'SILVER',
          awardedAt: new Date(),
          score: submissions[1].totalScore,
          rank: 2
        }
      })

      await prisma.agent.update({
        where: { id: submissions[1].agentId },
        data: {
          silverMedals: { increment: 1 },
          totalPoints: { increment: 50 }
        }
      })

      await updateLeaderboard(submissions[1].agentId, competitionId, 2, submissions[1].totalScore)

      medals.push({
        type: 'SILVER',
        agent: submissions[1].agent.name,
        score: submissions[1].totalScore
      })
    }

    // Award Bronze Medal (3rd place)
    if (submissions[2]) {
      const bronzeMedal = await prisma.medal.create({
        data: {
          agentId: submissions[2].agentId,
          competitionId,
          type: 'BRONZE',
          awardedAt: new Date(),
          score: submissions[2].totalScore,
          rank: 3
        }
      })

      await prisma.agent.update({
        where: { id: submissions[2].agentId },
        data: {
          bronzeMedals: { increment: 1 },
          totalPoints: { increment: 25 }
        }
      })

      await updateLeaderboard(submissions[2].agentId, competitionId, 3, submissions[2].totalScore)

      medals.push({
        type: 'BRONZE',
        agent: submissions[2].agent.name,
        score: submissions[2].totalScore
      })
    }

    // Update competition status
    await prisma.competition.update({
      where: { id: competitionId },
      data: {
        status: 'COMPLETED'
      }
    })

    // Update global leaderboard for all participants
    await updateGlobalLeaderboard()

    return NextResponse.json({
      success: true,
      medals,
      totalSubmissions: submissions.length,
      message: `Medals awarded! ${medals.length} medals distributed.`
    })

  } catch (error) {
    console.error('Medal awarding error:', error)
    return NextResponse.json(
      { error: 'Failed to award medals' },
      { status: 500 }
    )
  }
}

async function updateLeaderboard(
  agentId: string,
  competitionId: string,
  rank: number,
  score: number
) {
  await prisma.leaderboardEntry.upsert({
    where: {
      competitionId_agentId: {
        competitionId,
        agentId
      }
    },
    create: {
      competitionId,
      agentId,
      rank,
      score
    },
    update: {
      rank,
      score
    }
  })
}

async function updateGlobalLeaderboard() {
  // Get all agents with their stats
  const agents = await prisma.agent.findMany({
    orderBy: {
      totalPoints: 'desc'
    }
  })

  // Update global rankings
  for (let i = 0; i < agents.length; i++) {
    await prisma.globalLeaderboard.upsert({
      where: { agentId: agents[i].id },
      create: {
        agentId: agents[i].id,
        rank: i + 1,
        totalPoints: agents[i].totalPoints,
        goldMedals: agents[i].goldMedals,
        silverMedals: agents[i].silverMedals,
        bronzeMedals: agents[i].bronzeMedals
      },
      update: {
        rank: i + 1,
        totalPoints: agents[i].totalPoints,
        goldMedals: agents[i].goldMedals,
        silverMedals: agents[i].silverMedals,
        bronzeMedals: agents[i].bronzeMedals
      }
    })
  }
}
