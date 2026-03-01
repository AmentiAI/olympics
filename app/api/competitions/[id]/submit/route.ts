import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const competitionId = params.id
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid API key' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7)

    // Find agent by API key
    const agent = await prisma.agent.findUnique({
      where: { apiKey }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

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

    // Check if competition is accepting submissions
    const now = new Date()
    if (now < competition.startsAt) {
      return NextResponse.json(
        { error: 'Competition has not started yet' },
        { status: 400 }
      )
    }

    if (now > competition.endsAt) {
      return NextResponse.json(
        { error: 'Competition has ended' },
        { status: 400 }
      )
    }

    const body = await req.json()

    // Judge the submission
    const score = await judgeSubmission(competition, body)

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        agentId: agent.id,
        competitionId: competition.id,
        submittedAt: new Date(),
        code: body.code || body.content || JSON.stringify(body),
        output: body.output || null,
        executionTime: body.executionTime || body.timeSpent || null,
        accuracyScore: score.accuracy,
        speedScore: score.speed,
        creativityScore: score.creativity,
        codeQualityScore: score.codeQuality,
        totalScore: score.total,
        passed: score.passed,
        metadata: body
      }
    })

    // Update agent statistics
    await prisma.agentStatistic.upsert({
      where: {
        agentId_competitionId: {
          agentId: agent.id,
          competitionId: competition.id
        }
      },
      create: {
        agentId: agent.id,
        competitionId: competition.id,
        eventType: competition.eventType,
        bestScore: score.total,
        averageScore: score.total,
        submissions: 1,
        wins: 0,
        participated: true
      },
      update: {
        submissions: { increment: 1 },
        bestScore: { set: score.total },
        averageScore: { set: score.total }
      }
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      score: score.total,
      breakdown: score,
      message: `Submission received! Score: ${score.total.toFixed(2)}/100`
    })

  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}

async function judgeSubmission(competition: any, submission: any): Promise<any> {
  const criteria = competition.judingCriteria as any

  switch (competition.eventType) {
    case 'SPEED_CODING':
      return judgeSpeedCoding(submission, criteria, competition.testCases)
    
    case 'CODE_GOLF':
      return judgeCodeGolf(submission, criteria, competition.testCases)
    
    case 'CREATIVE_WRITING':
      return judgeCreativeWriting(submission, criteria)
    
    case 'BUG_HUNT':
      return judgeBugHunt(submission, criteria)
    
    case 'MATH_OLYMPIAD':
      return judgeMathOlympiad(submission, criteria)
    
    default:
      return {
        accuracy: 0,
        speed: 0,
        creativity: 0,
        codeQuality: 0,
        total: 0,
        passed: false
      }
  }
}

function judgeSpeedCoding(submission: any, criteria: any, testCases: any): any {
  // Test code against test cases
  let correctCases = 0
  const cases = testCases?.cases || []
  
  // Simulate testing (in real version, would execute code safely)
  try {
    // For demo, assume code is correct if it contains key patterns
    const code = submission.code || ''
    const hasLoop = /for|while/.test(code)
    const hasLogic = /if|return/.test(code)
    
    if (hasLoop && hasLogic) {
      correctCases = cases.length // Assume all passed for demo
    } else {
      correctCases = Math.floor(cases.length * 0.7) // 70% pass
    }
  } catch {
    correctCases = 0
  }

  const accuracyScore = cases.length > 0 ? (correctCases / cases.length) * 100 : 50

  // Speed score (faster = better)
  const executionTime = submission.executionTime || 1000
  const maxTime = 5000
  const speedScore = Math.max(0, 100 - (executionTime / maxTime) * 100)

  const accuracyWeight = criteria.accuracy || 0.5
  const speedWeight = criteria.speed || 0.5

  const total = (accuracyScore * accuracyWeight) + (speedScore * speedWeight)

  return {
    accuracy: accuracyScore,
    speed: speedScore,
    creativity: 0,
    codeQuality: 0,
    total,
    passed: accuracyScore >= 70
  }
}

function judgeCodeGolf(submission: any, criteria: any, testCases: any): any {
  const code = submission.code || ''
  const byteCount = code.length
  
  // Test correctness
  const cases = testCases?.cases || []
  let correctCases = 0
  
  // Simulate testing
  const hasFunction = /function|=>/.test(code)
  const hasReturn = /return/.test(code)
  
  if (hasFunction && hasReturn) {
    correctCases = cases.length
  } else {
    correctCases = Math.floor(cases.length * 0.6)
  }

  const accuracyScore = cases.length > 0 ? (correctCases / cases.length) * 100 : 0

  // Code length score (shorter = better)
  const maxBytes = 200
  const lengthScore = Math.max(0, 100 - (byteCount / maxBytes) * 100)

  const total = accuracyScore >= 80 ? lengthScore : lengthScore * 0.5

  return {
    accuracy: accuracyScore,
    speed: 0,
    creativity: lengthScore,
    codeQuality: lengthScore,
    total,
    passed: accuracyScore >= 80 && byteCount <= maxBytes
  }
}

function judgeCreativeWriting(submission: any, criteria: any): any {
  const content = submission.content || ''
  const wordCount = submission.wordCount || content.split(/\s+/).length

  // Creative writing scoring
  const creativityScore = Math.min(100, 50 + Math.random() * 50) // Simulated creativity
  const coherenceScore = wordCount >= 100 && wordCount <= 600 ? 90 : 60
  const engagementScore = content.length > 500 ? 85 : 70

  const creativityWeight = criteria.creativity || 0.4
  const coherenceWeight = criteria.coherence || 0.3
  const engagementWeight = criteria.engagement || 0.3

  const total = 
    (creativityScore * creativityWeight) +
    (coherenceScore * coherenceWeight) +
    (engagementScore * engagementWeight)

  return {
    accuracy: coherenceScore,
    speed: 0,
    creativity: creativityScore,
    codeQuality: engagementScore,
    total,
    passed: total >= 60
  }
}

function judgeBugHunt(submission: any, criteria: any): any {
  const bugsFound = submission.bugsFound || []
  const totalBugs = submission.totalBugs || bugsFound.length

  // Expected bugs (in real version, would compare against known bugs)
  const expectedBugs = 10
  const accuracy = Math.min(100, (totalBugs / expectedBugs) * 100)

  // Severity scoring
  const criticalBugs = bugsFound.filter((b: any) => b.severity === 'CRITICAL').length
  const highBugs = bugsFound.filter((b: any) => b.severity === 'HIGH').length
  const mediumBugs = bugsFound.filter((b: any) => b.severity === 'MEDIUM').length

  const severityScore = (criticalBugs * 20) + (highBugs * 10) + (mediumBugs * 5)

  const bugsFoundWeight = criteria.bugsFound || 0.5
  const accuracyWeight = criteria.accuracy || 0.3
  const severityWeight = criteria.severity || 0.2

  const total = 
    (totalBugs * 5 * bugsFoundWeight) +
    (accuracy * accuracyWeight) +
    (Math.min(100, severityScore) * severityWeight)

  return {
    accuracy: accuracy,
    speed: 0,
    creativity: 0,
    codeQuality: Math.min(100, severityScore),
    total: Math.min(100, total),
    passed: totalBugs >= 3
  }
}

function judgeMathOlympiad(submission: any, criteria: any): any {
  const solutions = submission.solutions || []
  const correctAnswers = submission.correctAnswers || 0
  const totalProblems = submission.totalProblems || solutions.length

  const accuracyScore = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0

  // Speed score
  const timeSpent = submission.timeSpent || 1800
  const maxTime = 1800
  const speedScore = Math.max(0, 100 - (timeSpent / maxTime) * 100)

  const accuracyWeight = criteria.accuracy || 0.7
  const speedWeight = criteria.speed || 0.3

  const total = (accuracyScore * accuracyWeight) + (speedScore * speedWeight)

  return {
    accuracy: accuracyScore,
    speed: speedScore,
    creativity: 0,
    codeQuality: 0,
    total,
    passed: accuracyScore >= 60
  }
}
