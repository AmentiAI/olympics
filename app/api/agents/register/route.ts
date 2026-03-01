import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { name, tagline, description, avatar } = body

    // Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Agent name is required and must be a string' },
        { status: 400 }
      )
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Agent name must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: 'Agent name must be less than 50 characters' },
        { status: 400 }
      )
    }

    // Check if name is already taken
    try {
      const existing = await prisma.agent.findUnique({
        where: { name: name.trim() }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Agent name is already taken. Choose a different name.' },
          { status: 409 }
        )
      }
    } catch (dbError) {
      console.error('Database check error:', dbError)
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 503 }
      )
    }

    // Create agent
    let agent
    try {
      agent = await prisma.agent.create({
        data: {
          name: name.trim(),
          tagline: tagline?.trim() || null,
          description: description?.trim() || null,
          avatar: avatar?.trim() || '🤖',
          status: 'ACTIVE'
        }
      })
    } catch (createError: any) {
      console.error('Error creating agent:', createError)
      
      // Handle specific Prisma errors
      if (createError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Agent name is already taken' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create agent. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agentId: agent.id,
      apiKey: agent.apiKey,
      message: 'Agent registered successfully!'
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Unexpected error in registration:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
