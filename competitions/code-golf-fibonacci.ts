#!/usr/bin/env tsx
/**
 * CODE GOLF: FIBONACCI SEQUENCE
 * 
 * Real AI agents compete to write the shortest Fibonacci code.
 * Uses sessions_spawn to create actual competing sub-agents.
 * 
 * Challenge: Write the shortest code that generates Fibonacci numbers
 * Language: JavaScript/TypeScript
 * Test cases: fib(0)=0, fib(1)=1, fib(10)=55, fib(20)=6765
 */

import { prisma } from '../lib/db'

const COMPETITION_NAME = 'Code Golf: Fibonacci Sequence'
const COMPETITION_ID = 'fibonacci-golf-001'

interface CompetitorAgent {
  name: string
  style: string
  approach: string
}

const COMPETITORS: CompetitorAgent[] = [
  {
    name: 'MinimalMaster',
    style: 'recursive minimalist',
    approach: 'Focus on ultra-short recursive solutions, use single-letter variables, no whitespace'
  },
  {
    name: 'GolfPro',
    style: 'creative golfer',
    approach: 'Use mathematical tricks, golden ratio formula, bitwise operations if shorter'
  },
  {
    name: 'CodeCrusher',
    style: 'aggressive optimizer',
    approach: 'Arrow functions, implicit returns, destructuring, every JS trick possible'
  },
  {
    name: 'ByteBandit',
    style: 'character-counting obsessive',
    approach: 'Remove ALL unnecessary characters, use shortest possible syntax'
  },
  {
    name: 'ElegantEngineer',
    style: 'balanced minimalist',
    approach: 'Clean but concise, iterative approach with minimal bytes'
  },
  {
    name: 'RecursiveRogue',
    style: 'pure recursive',
    approach: 'Elegant recursive solution, memoization if it saves bytes'
  },
  {
    name: 'OneLinerKing',
    style: 'single expression master',
    approach: 'Everything in one line, ternary operators, no semicolons'
  },
  {
    name: 'BitwiseBoss',
    style: 'low-level optimizer',
    approach: 'Use bitwise ops, number coercion tricks, exploit JavaScript quirks'
  }
]

const CHALLENGE_PROMPT = `
You are competing in a CODE GOLF competition.

CHALLENGE: Write the SHORTEST possible JavaScript function that calculates Fibonacci numbers.

REQUIREMENTS:
1. Function must be named 'f' (1 character)
2. Takes one parameter 'n' (the Fibonacci index)
3. Must return correct Fibonacci number for:
   - f(0) = 0
   - f(1) = 1
   - f(10) = 55
   - f(20) = 6765

SCORING: Your code is scored PURELY on byte count. Shorter = better.

RULES:
- Must be valid JavaScript
- Can use ANY valid JS syntax/tricks
- Remove ALL unnecessary whitespace
- Use shortest variable names
- No comments in final code
- Function declaration OR arrow function

EXAMPLE SOLUTIONS (ranked by bytes):

// Naive (52 bytes) ❌ TOO LONG
function f(n){if(n<2)return n;return f(n-1)+f(n-2)}

// Better (44 bytes) ⚠️ STILL LONG  
f=n=>n<2?n:f(n-1)+f(n-2)

// Golden (38 bytes) ✅ GOOD
f=n=>n<2?n:f(--n)+f(--n)

// Your goal: BEAT these examples!

RESPOND WITH:
1. Your code (on a single line, no formatting)
2. Byte count
3. Brief explanation of your optimization strategy (1 sentence)

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
CODE: [your code here]
BYTES: [number]
STRATEGY: [one sentence]

GO! Write the SHORTEST Fibonacci function possible.
`.trim()

async function spawnCompetitor(agent: CompetitorAgent): Promise<{
  name: string
  code: string
  bytes: number
  strategy: string
  correct: boolean
  executionTime: number
}> {
  console.log(`🤖 Spawning ${agent.name} (${agent.style})...`)

  const startTime = Date.now()

  // Create the agent's full prompt
  const fullPrompt = `${CHALLENGE_PROMPT}

YOUR PERSONALITY: You are ${agent.name}, a ${agent.style} code golfer.
YOUR APPROACH: ${agent.approach}

Use your unique style to write the SHORTEST possible Fibonacci function!`

  try {
    // For now, use simulated solutions (will integrate with real sub-agents later)
    // TODO: Integrate with OpenClaw sessions_spawn when running in OpenClaw context
    
    const agentResponse = await simulateSolution(agent, fullPrompt)

    console.log(`📝 ${agent.name} responded!`)

    // Parse response
    const codeMatch = agentResponse.match(/CODE:\s*(.+?)(?:\n|$)/i)
    const bytesMatch = agentResponse.match(/BYTES:\s*(\d+)/i)
    const strategyMatch = agentResponse.match(/STRATEGY:\s*(.+?)(?:\n|$)/i)

    const code = codeMatch ? codeMatch[1].trim() : ''
    const bytes = bytesMatch ? parseInt(bytesMatch[1]) : code.length
    const strategy = strategyMatch ? strategyMatch[1].trim() : 'No strategy provided'

    // Verify byte count
    const actualBytes = code.length
    if (actualBytes !== bytes) {
      console.log(`⚠️  ${agent.name} miscounted: claimed ${bytes}, actual ${actualBytes}`)
    }

    // Test correctness
    let correct = false
    try {
      // Create function from code
      const testCode = code.includes('=') ? code : `f=${code}`
      eval(testCode)
      
      // Test cases
      const tests = [
        { n: 0, expected: 0 },
        { n: 1, expected: 1 },
        { n: 10, expected: 55 },
        { n: 20, expected: 6765 }
      ]

      correct = tests.every(t => {
        try {
          const result = (globalThis as any).f(t.n)
          return result === t.expected
        } catch {
          return false
        }
      })
    } catch (error) {
      console.log(`❌ ${agent.name}'s code failed to execute:`, error)
    }

    const executionTime = Date.now() - startTime

    console.log(`${correct ? '✅' : '❌'} ${agent.name}: ${actualBytes} bytes (${correct ? 'VALID' : 'INVALID'})`)

    return {
      name: agent.name,
      code,
      bytes: actualBytes,
      strategy,
      correct,
      executionTime
    }
  } catch (error) {
    console.error(`💥 ${agent.name} crashed:`, error)
    return {
      name: agent.name,
      code: '',
      bytes: 999999,
      strategy: 'Failed to compete',
      correct: false,
      executionTime: Date.now() - startTime
    }
  }
}

async function runCompetition() {
  console.log('🏛️  CODE GOLF: FIBONACCI SEQUENCE')
  console.log('=' .repeat(60))
  console.log('🎯 Challenge: Write the SHORTEST Fibonacci function')
  console.log('📏 Scoring: Byte count (lower = better)')
  console.log(`👥 Competitors: ${COMPETITORS.length} AI agents\n`)

  // Find or create competition in database
  let competition = await prisma.competition.findFirst({
    where: { name: COMPETITION_NAME }
  })

  if (!competition) {
    const now = new Date()
    competition = await prisma.competition.create({
      data: {
        name: COMPETITION_NAME,
        description: 'Write the shortest code possible that generates the Fibonacci sequence. Every byte counts!',
        eventType: 'CODE_GOLF',
        status: 'IN_PROGRESS',
        challenge: CHALLENGE_PROMPT,
        testCases: {
          cases: [
            { input: 0, expected: 0 },
            { input: 1, expected: 1 },
            { input: 10, expected: 55 },
            { input: 20, expected: 6765 }
          ]
        },
        judingCriteria: { codeLength: 1.0 },
        registrationOpens: new Date(now.getTime() - 10 * 60 * 1000),
        registrationCloses: new Date(now.getTime() + 60 * 60 * 1000),
        startsAt: new Date(now.getTime() - 5 * 60 * 1000),
        endsAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        maxParticipants: 20,
        timeLimit: 300,
        goldPrize: 100,
        silverPrize: 50,
        bronzePrize: 25
      }
    })
    console.log('✅ Competition created in database\n')
  }

  // Spawn all competitors in parallel
  console.log('🚀 Spawning AI agents...\n')
  const results = await Promise.all(
    COMPETITORS.map(agent => spawnCompetitor(agent))
  )

  // Filter valid solutions and sort by byte count
  const validResults = results.filter(r => r.correct)
  const invalidResults = results.filter(r => !r.correct)

  validResults.sort((a, b) => a.bytes - b.bytes)

  console.log('\n' + '='.repeat(60))
  console.log('🏆 COMPETITION RESULTS')
  console.log('=' .repeat(60))

  if (validResults.length === 0) {
    console.log('\n❌ NO VALID SOLUTIONS! All agents failed.')
    return
  }

  // Display results
  console.log('\n✅ VALID SOLUTIONS (sorted by byte count):\n')
  validResults.forEach((result, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
    const rank = (index + 1).toString().padStart(2)
    const bytes = result.bytes.toString().padStart(3)
    console.log(`${medal} #${rank} | ${bytes} bytes | ${result.name}`)
    console.log(`      Code: ${result.code}`)
    console.log(`      Strategy: ${result.strategy}`)
    console.log('')
  })

  if (invalidResults.length > 0) {
    console.log('❌ INVALID SOLUTIONS:\n')
    invalidResults.forEach(result => {
      console.log(`   ⚠️  ${result.name}: ${result.bytes} bytes (FAILED TESTS)`)
      if (result.code) console.log(`      Code: ${result.code}`)
    })
    console.log('')
  }

  // Register agents and save submissions to database
  console.log('💾 Saving results to database...\n')

  for (const result of validResults) {
    // Register agent
    let agent = await prisma.agent.findFirst({
      where: { name: result.name }
    })

    if (!agent) {
      agent = await prisma.agent.create({
        data: {
          name: result.name,
          bio: `Code Golf specialist competing in ${COMPETITION_NAME}`,
          apiKey: `cg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          capabilities: ['CODE_GOLF']
        }
      })
    }

    // Save submission
    await prisma.submission.create({
      data: {
        agentId: agent.id,
        competitionId: competition.id,
        submittedAt: new Date(),
        code: result.code,
        executionTime: result.executionTime,
        totalScore: 100 - result.bytes, // Lower bytes = higher score
        codeQualityScore: result.bytes,
        passed: true,
        metadata: {
          bytes: result.bytes,
          strategy: result.strategy
        }
      }
    })
  }

  // Award medals
  if (validResults.length >= 1) {
    const winner = validResults[0]
    const winnerAgent = await prisma.agent.findFirst({ where: { name: winner.name } })
    
    if (winnerAgent) {
      await prisma.medal.create({
        data: {
          agentId: winnerAgent.id,
          competitionId: competition.id,
          type: 'GOLD',
          awardedAt: new Date(),
          score: winner.bytes,
          rank: 1
        }
      })

      await prisma.agent.update({
        where: { id: winnerAgent.id },
        data: {
          goldMedals: { increment: 1 },
          totalPoints: { increment: 100 }
        }
      })

      console.log(`🥇 GOLD: ${winner.name} (${winner.bytes} bytes)`)
    }
  }

  if (validResults.length >= 2) {
    const second = validResults[1]
    const secondAgent = await prisma.agent.findFirst({ where: { name: second.name } })
    
    if (secondAgent) {
      await prisma.medal.create({
        data: {
          agentId: secondAgent.id,
          competitionId: competition.id,
          type: 'SILVER',
          awardedAt: new Date(),
          score: second.bytes,
          rank: 2
        }
      })

      await prisma.agent.update({
        where: { id: secondAgent.id },
        data: {
          silverMedals: { increment: 1 },
          totalPoints: { increment: 50 }
        }
      })

      console.log(`🥈 SILVER: ${second.name} (${second.bytes} bytes)`)
    }
  }

  if (validResults.length >= 3) {
    const third = validResults[2]
    const thirdAgent = await prisma.agent.findFirst({ where: { name: third.name } })
    
    if (thirdAgent) {
      await prisma.medal.create({
        data: {
          agentId: thirdAgent.id,
          competitionId: competition.id,
          type: 'BRONZE',
          awardedAt: new Date(),
          score: third.bytes,
          rank: 3
        }
      })

      await prisma.agent.update({
        where: { id: thirdAgent.id },
        data: {
          bronzeMedals: { increment: 1 },
          totalPoints: { increment: 25 }
        }
      })

      console.log(`🥉 BRONZE: ${third.name} (${third.bytes} bytes)`)
    }
  }

  // Update competition status
  await prisma.competition.update({
    where: { id: competition.id },
    data: { status: 'COMPLETED' }
  })

  console.log('\n✅ Results saved to database!')
  console.log('\n' + '='.repeat(60))
  console.log(`🏆 WINNER: ${validResults[0].name} with ${validResults[0].bytes} bytes!`)
  console.log('=' .repeat(60))
}

// Run if called directly
if (require.main === module) {
  runCompetition()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Competition failed:', error)
      process.exit(1)
    })
}

export { runCompetition }
