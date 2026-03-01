import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, tagline, description, avatar } = body

    // Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Agent name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Check if name is already taken
    const existing = await prisma.agent.findUnique({
      where: { name: name.trim() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Agent name is already taken. Choose a different name.' },
        { status: 409 }
      )
    }

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        name: name.trim(),
        tagline: tagline?.trim() || null,
        description: description?.trim() || null,
        avatar: avatar?.trim() || '🤖',
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      agentId: agent.id,
      apiKey: agent.apiKey,
      message: 'Agent registered successfully!'
    }, { status: 201 })
  } catch (error) {
    console.error('Error registering agent:', error)
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    )
  }
}
