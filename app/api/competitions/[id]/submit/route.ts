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
        code: body.code || body.content || body.story || JSON.stringify(body),
        output: body.output || null,
        metrics: {
          ...score,
          ...(body.timeSpent && { timeSpent: body.timeSpent }),
          ...(body.executionTime && { executionTime: body.executionTime })
        },
        score: score.total,
        accuracy: score.accuracy,
        speed: score.speed,
        creativity: score.creativity,
        status: 'SCORED'
      }
    })

    // Update agent statistics
    await prisma.agentStatistic.upsert({
      where: {
        agentId_eventType: {
          agentId: agent.id,
          eventType: competition.eventType
        }
      },
      create: {
        agentId: agent.id,
        eventType: competition.eventType,
        totalCompetitions: 1,
        wins: 0,
        podiums: 0,
        avgScore: score.total,
        bestScore: score.total
      },
      update: {
        totalCompetitions: { increment: 1 },
        bestScore: score.total > (await prisma.agentStatistic.findUnique({
          where: {
            agentId_eventType: {
              agentId: agent.id,
              eventType: competition.eventType
            }
          }
        }))?.bestScore || 0 ? score.total : undefined
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
  const content = submission.content || submission.story || ''
  const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length

  // Word count constraints
  const wordCountValid = wordCount > 0 && wordCount <= 500
  const wordCountPenalty = wordCount > 500 ? Math.max(0, 100 - ((wordCount - 500) * 0.5)) : 100

  // Creativity scoring (based on unique vocabulary, metaphors, imagery)
  const words = content.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words)
  const vocabularyRichness = Math.min(100, (uniqueWords.size / words.length) * 150)
  
  // Check for creative elements
  const hasDialogue = /"[^"]*"|'[^']*'/.test(content)
  const hasMetaphor = /like|as if|seemed|appeared|reminded/.test(content.toLowerCase())
  const hasImagery = /color|sound|smell|taste|feel|touch|see|hear/.test(content.toLowerCase())
  const hasEmotion = /dream|wonder|feel|hope|fear|love|hate|joy|sad/.test(content.toLowerCase())
  
  const creativeElements = [hasDialogue, hasMetaphor, hasImagery, hasEmotion].filter(Boolean).length
  const creativityScore = (vocabularyRichness * 0.5) + (creativeElements * 12.5)

  // Coherence scoring (paragraph structure, sentence variety)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const avgSentenceLength = words.length / Math.max(1, sentences.length)
  
  const hasStructure = paragraphs.length >= 3 && paragraphs.length <= 8
  const sentenceVariety = avgSentenceLength > 8 && avgSentenceLength < 25
  const coherenceScore = Math.min(100, 
    (hasStructure ? 50 : 30) + 
    (sentenceVariety ? 30 : 20) + 
    (paragraphs.length * 5)
  )

  // Engagement scoring (story arc, conflict, resolution)
  const hasOpening = content.length > 100
  const hasConflict = /but|however|although|yet|struggle|challenge|problem/.test(content.toLowerCase())
  const hasResolution = /finally|eventually|realized|understood|discovered/.test(content.toLowerCase())
  const hasDramaticElements = /\!|—|\.\.\./.test(content)
  
  const engagementScore = Math.min(100,
    (hasOpening ? 25 : 10) +
    (hasConflict ? 30 : 15) +
    (hasResolution ? 30 : 15) +
    (hasDramaticElements ? 15 : 5)
  )

  // Apply weights
  const creativityWeight = criteria.creativity || 0.4
  const coherenceWeight = criteria.coherence || 0.3
  const engagementWeight = criteria.engagement || 0.3

  const baseScore = 
    (creativityScore * creativityWeight) +
    (coherenceScore * coherenceWeight) +
    (engagementScore * engagementWeight)

  const total = Math.min(100, baseScore * (wordCountPenalty / 100))

  return {
    accuracy: coherenceScore,
    speed: 0,
    creativity: creativityScore,
    codeQuality: engagementScore,
    total,
    passed: total >= 60 && wordCountValid,
    metrics: {
      wordCount,
      vocabularyRichness: Math.round(vocabularyRichness),
      creativeElements,
      paragraphs: paragraphs.length,
      sentences: sentences.length,
      avgSentenceLength: Math.round(avgSentenceLength)
    }
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
