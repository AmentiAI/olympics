import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const competitions = await prisma.competition.findMany({
      include: {
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { startsAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      competitions
    })
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    )
  }
}
