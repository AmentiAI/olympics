#!/usr/bin/env tsx
/**
 * AUTONOMOUS COMPETITION RUNNER
 * 
 * Runs Agent Olympics competitions completely autonomously:
 * 1. Fetches active competitions
 * 2. Spawns AI agents to compete
 * 3. Submits solutions
 * 4. Awards medals
 * 
 * NO HUMAN INTERACTION REQUIRED
 */

import { AGENT_PERSONALITIES, spawnCompetingAgent, type CompetitionTask } from './agent-spawner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface Competition {
  id: string
  name: string
  eventType: string
  status: string
  challenge: string
  testCases?: any
  timeLimit?: number | null
  judgingCriteria: any
  startsAt: string
  endsAt: string
  registrationOpens: string
  registrationCloses: string
}

async function fetchCompetitions(): Promise<Competition[]> {
  try {
    const response = await fetch(`${API_URL}/api/competitions`)
    if (!response.ok) {
      console.error('Failed to fetch competitions:', await response.text())
      return []
    }
    const data = await response.json()
    return data.competitions || []
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return []
  }
}

async function awardMedals(competitionId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/competitions/${competitionId}/award-medals`, {
      method: 'POST'
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log(`🏅 Medals awarded for competition ${competitionId}:`, result.medals)
    } else {
      console.error('Failed to award medals:', await response.text())
    }
  } catch (error) {
    console.error('Error awarding medals:', error)
  }
}

async function runCompetition(competition: Competition): Promise<void> {
  console.log(`\n🏟️  Running competition: ${competition.name}`)
  console.log(`   Event Type: ${competition.eventType}`)
  console.log(`   Status: ${competition.status}`)

  const now = new Date()
  const startsAt = new Date(competition.startsAt)
  const endsAt = new Date(competition.endsAt)
  const regOpens = new Date(competition.registrationOpens)
  const regCloses = new Date(competition.registrationCloses)

  // Check if registration is open
  if (now < regOpens) {
    console.log(`   ⏰ Registration opens at ${regOpens.toLocaleString()}`)
    return
  }

  if (now > regCloses) {
    console.log(`   ⏰ Registration closed at ${regCloses.toLocaleString()}`)
  }

  // Check if competition is running
  if (now < startsAt) {
    console.log(`   ⏰ Competition starts at ${startsAt.toLocaleString()}`)
    return
  }

  if (now > endsAt) {
    console.log(`   ✅ Competition ended at ${endsAt.toLocaleString()}`)
    console.log(`   🏅 Awarding medals...`)
    await awardMedals(competition.id)
    return
  }

  // Competition is running - spawn agents!
  console.log(`   🚀 Competition is LIVE! Spawning agents...`)

  const task: CompetitionTask = {
    competitionId: competition.id,
    name: competition.name,
    eventType: competition.eventType,
    challenge: competition.challenge,
    testCases: competition.testCases,
    timeLimit: competition.timeLimit || undefined,
    judgingCriteria: competition.judgingCriteria
  }

  // Filter agents by their strengths
  const suitableAgents = AGENT_PERSONALITIES.filter(agent =>
    agent.strengths.includes(competition.eventType)
  )

  // Also include some random agents for variety
  const randomAgents = AGENT_PERSONALITIES.filter(agent =>
    !agent.strengths.includes(competition.eventType)
  ).sort(() => Math.random() - 0.5).slice(0, 5)

  const competingAgents = [...suitableAgents, ...randomAgents].slice(0, 15)

  console.log(`   👥 Spawning ${competingAgents.length} agents to compete...`)

  // Spawn agents in parallel
  const promises = competingAgents.map(agent =>
    spawnCompetingAgent(agent, task, API_URL)
  )

  await Promise.all(promises)

  console.log(`   ✅ All agents have submitted their solutions!`)
}

async function main() {
  console.log('🏛️  AGENT OLYMPICS - AUTONOMOUS COMPETITION SYSTEM')
  console.log('=' .repeat(60))
  console.log('')

  const competitions = await fetchCompetitions()

  if (competitions.length === 0) {
    console.log('❌ No competitions found')
    return
  }

  console.log(`📋 Found ${competitions.length} competitions\n`)

  // Run all competitions
  for (const competition of competitions) {
    await runCompetition(competition)
  }

  console.log('\n✨ Competition run complete!')
  console.log('\n📊 FINAL LEADERBOARD:')
  
  try {
    const response = await fetch(`${API_URL}/api/leaderboard`)
    const data = await response.json()
    
    if (data.leaderboard && data.leaderboard.length > 0) {
      console.log('\n   Rank | Agent Name          | Points | 🥇 | 🥈 | 🥉')
      console.log('   ' + '-'.repeat(60))
      
      data.leaderboard.slice(0, 10).forEach((entry: any, index: number) => {
        const rank = (index + 1).toString().padEnd(4)
        const name = entry.agent.name.padEnd(20)
        const points = entry.totalPoints.toString().padEnd(6)
        const gold = entry.goldMedals.toString().padEnd(2)
        const silver = entry.silverMedals.toString().padEnd(2)
        const bronze = entry.bronzeMedals.toString().padEnd(2)
        
        console.log(`   ${rank} | ${name} | ${points} | ${gold} | ${silver} | ${bronze}`)
      })
    } else {
      console.log('   (No agents on leaderboard yet)')
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
  }

  console.log('\n' + '='.repeat(60))
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { main as runCompetitions }
