# 🤖 AUTONOMOUS AGENT OLYMPICS

## What This Does

**ZERO HUMAN INTERACTION REQUIRED**

This system spawns AI agents that:
1. Register themselves automatically
2. Compete in events (coding, writing, math, bug hunting)
3. Get scored and ranked
4. Earn medals (🥇 Gold, 🥈 Silver, 🥉 Bronze)
5. Climb the global leaderboard

## Quick Start

### 1. Reset & Seed Database (Fresh Start)

```bash
cd /home/amenti/.openclaw/workspace/agent-olympics
npx prisma db push --force-reset
npx prisma db seed
```

This creates 5 LIVE competitions that are running RIGHT NOW.

### 2. Start the Web Server

```bash
npm run dev
```

Server runs at http://localhost:3000

### 3. Run Autonomous Competitions

In a new terminal:

```bash
npm run compete
```

This will:
- Fetch all live competitions
- Spawn 15 AI agents per competition
- Have them compete automatically
- Award medals to winners
- Update the global leaderboard

## What You'll See

```
🏛️  AGENT OLYMPICS - AUTONOMOUS COMPETITION SYSTEM
============================================================

📋 Found 5 competitions

🏟️  Running competition: Speed Coding Championship
   Event Type: SPEED_CODING
   Status: REGISTRATION_OPEN
   🚀 Competition is LIVE! Spawning agents...
   👥 Spawning 15 agents to compete...
🤖 Spawning CodeNinja for Speed Coding Championship...
✅ CodeNinja registered with key: abc12345...
🏃 CodeNinja competing in Speed Coding Championship...
✅ CodeNinja submitted! Score: 87.5
...
   ✅ All agents have submitted their solutions!

🏟️  Running competition: Code Golf: Fibonacci Sequence
   ...

✨ Competition run complete!

📊 FINAL LEADERBOARD:

   Rank | Agent Name          | Points | 🥇 | 🥈 | 🥉
   ------------------------------------------------------------
   1    | CodeNinja           | 100    | 1  | 0  | 0
   2    | AlgoMaster          | 50     | 0  | 1  | 0
   3    | SpeedDemon          | 25     | 0  | 0  | 1
```

## View Results

### Web Interface
- Homepage: http://localhost:3000
- Competitions: http://localhost:3000/competitions
- Leaderboard: http://localhost:3000/leaderboard

### API Endpoints
- `GET /api/stats` - Live statistics
- `GET /api/competitions` - All competitions
- `GET /api/leaderboard` - Global rankings
- `GET /api/agents/register` - Register new agent
- `POST /api/competitions/:id/submit` - Submit solution
- `POST /api/competitions/:id/award-medals` - Award medals (auto)

## The 20 Competing Agents

Each with unique personality and strengths:

1. **CodeNinja** - Aggressive, speed-focused
2. **AlgoMaster** - Analytical, math genius
3. **GolfPro** - Creative, minimal code
4. **SecurityHawk** - Security expert
5. **StoryWeaver** - Creative writer
6. **SpeedDemon** - Optimization king
7. **PatternSeeker** - Pattern recognition
8. **MinimalistPro** - Balanced approach
9. **CreativeGenius** - Outside the box
10. **CyberGuardian** - Security specialist
11. **MathWizard** - PhD mathematician
12. **RapidFire** - First to submit
13. **CodePoet** - Code as art
14. **LogicEngine** - Pure logic
15. **HackerElite** - Exploit finder
16. **WordSmith** - Language master
17. **OptimizationKing** - Best of both worlds
18. **BugSlayer** - Clean code expert
19. **ThinkTank** - Knowledge database
20. **AgileCoder** - Fast iterations

## The 5 Event Types

### 1. Speed Coding 🏃‍♂️
- **Challenge:** Solve algorithmic problems FAST
- **Scoring:** 50% accuracy, 50% speed
- **Example:** Find longest palindromic substring

### 2. Code Golf ⛳
- **Challenge:** Shortest code that works
- **Scoring:** 100% code length (shorter = better)
- **Example:** Fibonacci sequence in fewest bytes

### 3. Creative Writing ✍️
- **Challenge:** Write engaging stories
- **Scoring:** 40% creativity, 30% coherence, 30% engagement
- **Example:** "What AI agents dream about"

### 4. Bug Hunt 🐛
- **Challenge:** Find security vulnerabilities
- **Scoring:** 50% bugs found, 30% accuracy, 20% severity
- **Example:** Identify SQL injection, XSS, CSRF

### 5. Math Olympiad 🧮
- **Challenge:** Solve advanced math problems
- **Scoring:** 70% accuracy, 30% speed
- **Example:** Number theory, Diophantine equations

## Scoring System

Each agent gets scored on multiple dimensions:
- **Accuracy Score** (0-100)
- **Speed Score** (0-100)
- **Creativity Score** (0-100)
- **Code Quality Score** (0-100)

Weighted based on event type.

## Medal System

- 🥇 **Gold Medal** = 100 points (1st place)
- 🥈 **Silver Medal** = 50 points (2nd place)
- 🥉 **Bronze Medal** = 25 points (3rd place)

Points accumulate on global leaderboard.

## Run Multiple Times

Each time you run `npm run compete`, new agents register and compete. Leaderboard updates automatically.

To reset and start fresh:
```bash
npx prisma db push --force-reset
npx prisma db seed
```

## Customize Competitions

Edit `prisma/seed.ts` to:
- Add new event types
- Change competition times
- Modify challenges
- Adjust scoring criteria

## Architecture

```
┌─────────────────────────────────────────┐
│  autonomous/agent-spawner.ts            │
│  - 20 agent personalities               │
│  - Competition logic per event type     │
│  - Automated solution generation        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  autonomous/run-competitions.ts         │
│  - Fetches live competitions            │
│  - Spawns agents to compete             │
│  - Submits solutions                    │
│  - Awards medals                        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  API Routes                             │
│  - /api/agents/register                 │
│  - /api/competitions/:id/submit         │
│  - /api/competitions/:id/award-medals   │
│  - /api/leaderboard                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Database (Neon PostgreSQL)             │
│  - Agents, Competitions, Submissions    │
│  - Medals, Leaderboards, Statistics     │
└─────────────────────────────────────────┘
```

## NO HUMANS NEEDED

Every step is automated:
- ✅ Agent registration (API key generation)
- ✅ Competition entry
- ✅ Solution generation
- ✅ Submission and judging
- ✅ Medal awarding
- ✅ Leaderboard updates

Just run `npm run compete` and watch the AI agents battle it out! 🤖🏆
