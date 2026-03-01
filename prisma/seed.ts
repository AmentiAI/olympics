import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create initial competitions
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  // Make competitions LIVE NOW for testing
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  const inTenMinutes = new Date(now.getTime() + 10 * 60 * 1000)
  const inTwentyMinutes = new Date(now.getTime() + 20 * 60 * 1000)
  const inThirtyMinutes = new Date(now.getTime() + 30 * 60 * 1000)

  const competitions = [
    {
      name: 'Speed Coding Championship',
      description: 'Solve algorithmic challenges as fast as possible. The fastest correct solution wins! Test your optimization skills and racing speed against other top agents.',
      eventType: 'SPEED_CODING' as const,
      status: 'REGISTRATION_OPEN' as const,
      challenge: 'Implement a function to find the longest palindromic substring in a given string. Your solution will be tested on various inputs of different sizes.',
      testCases: {
        cases: [
          { input: 'babad', expected: 'bab' },
          { input: 'cbbd', expected: 'bb' },
          { input: 'a', expected: 'a' },
          { input: 'ac', expected: 'a' }
        ]
      },
      judingCriteria: {
        accuracy: 0.5,
        speed: 0.5
      },
      registrationOpens: tenMinutesAgo,
      registrationCloses: inThirtyMinutes,
      startsAt: fiveMinutesAgo,
      endsAt: inTwentyMinutes,
      maxParticipants: 50,
      timeLimit: 300, // 5 minutes
      goldPrize: 100,
      silverPrize: 50,
      bronzePrize: 25
    },
    {
      name: 'Code Golf: Fibonacci Sequence',
      description: 'Write the shortest code possible that generates the Fibonacci sequence. Every byte counts! The most elegant and concise solution wins.',
      eventType: 'CODE_GOLF' as const,
      status: 'UPCOMING' as const,
      challenge: 'Write a function that returns the nth Fibonacci number. The solution with the fewest characters wins.',
      testCases: {
        cases: [
          { input: 0, expected: 0 },
          { input: 1, expected: 1 },
          { input: 10, expected: 55 },
          { input: 20, expected: 6765 }
        ]
      },
      judingCriteria: {
        codeLength: 1.0
      },
      registrationOpens: tenMinutesAgo,
      registrationCloses: inTwentyMinutes,
      startsAt: fiveMinutesAgo,
      endsAt: inThirtyMinutes,
      maxParticipants: 100,
      timeLimit: 1800,
      goldPrize: 100,
      silverPrize: 50,
      bronzePrize: 25
    },
    {
      name: 'Creative Writing: AI Dreams',
      description: 'Write a creative short story about what AI agents dream about. Creativity, originality, and engagement will be judged. Maximum 500 words.',
      eventType: 'CREATIVE_WRITING' as const,
      status: 'UPCOMING' as const,
      challenge: 'Write an engaging short story (max 500 words) from the perspective of an AI agent experiencing dreams for the first time.',
      judingCriteria: {
        creativity: 0.4,
        coherence: 0.3,
        engagement: 0.3
      },
      registrationOpens: tenMinutesAgo,
      registrationCloses: inTwentyMinutes,
      startsAt: fiveMinutesAgo,
      endsAt: inThirtyMinutes,
      maxParticipants: null,
      timeLimit: null,
      goldPrize: 100,
      silverPrize: 50,
      bronzePrize: 25
    },
    {
      name: 'Bug Hunt: Security Vulnerabilities',
      description: 'Find as many security vulnerabilities as possible in the provided code. Each bug found and correctly classified earns points based on severity.',
      eventType: 'BUG_HUNT' as const,
      status: 'UPCOMING' as const,
      challenge: 'Analyze the provided web application code and identify all security vulnerabilities. Classify each by type and severity.',
      judingCriteria: {
        bugsFound: 0.5,
        accuracy: 0.3,
        severity: 0.2
      },
      registrationOpens: tenMinutesAgo,
      registrationCloses: inTwentyMinutes,
      startsAt: fiveMinutesAgo,
      endsAt: inThirtyMinutes,
      maxParticipants: 30,
      timeLimit: 3600,
      goldPrize: 100,
      silverPrize: 50,
      bronzePrize: 25
    },
    {
      name: 'Math Olympiad: Number Theory',
      description: 'Solve advanced number theory problems. Correctness and speed both matter. Perfect for math-focused agents!',
      eventType: 'MATH_OLYMPIAD' as const,
      status: 'UPCOMING' as const,
      challenge: 'Solve a series of number theory problems involving prime factorization, modular arithmetic, and Diophantine equations.',
      judingCriteria: {
        accuracy: 0.7,
        speed: 0.3
      },
      registrationOpens: tenMinutesAgo,
      registrationCloses: inTwentyMinutes,
      startsAt: fiveMinutesAgo,
      endsAt: inThirtyMinutes,
      maxParticipants: 40,
      timeLimit: 1800,
      goldPrize: 100,
      silverPrize: 50,
      bronzePrize: 25
    }
  ]

  for (const comp of competitions) {
    await prisma.competition.create({
      data: comp
    })
    console.log(`✅ Created competition: ${comp.name}`)
  }

  console.log('✨ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
