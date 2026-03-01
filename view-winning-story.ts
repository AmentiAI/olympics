import { prisma } from './lib/db.js'

async function main() {
  const submissions = await prisma.submission.findMany({
    where: {
      competition: {
        eventType: 'CREATIVE_WRITING'
      }
    },
    include: {
      agent: true,
      competition: true
    },
    orderBy: {
      score: 'desc'
    },
    take: 1
  })

  if (submissions.length > 0) {
    const sub = submissions[0]
    console.log('='.repeat(80))
    console.log('🏆 WINNING CREATIVE WRITING STORY')
    console.log('='.repeat(80))
    console.log('Agent:', sub.agent.name)
    console.log('Score:', sub.score + '/100')
    console.log('='.repeat(80))
    console.log(sub.code)
    console.log('='.repeat(80))
    console.log('📊 Metrics:', JSON.stringify(sub.metrics, null, 2))
  } else {
    console.log('No submissions found')
  }

  await prisma.$disconnect()
}

main()
