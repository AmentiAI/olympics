'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Medal, TrendingUp, Zap, Star, Crown, ArrowLeft, Award } from 'lucide-react'

interface LeaderboardAgent {
  rank: number
  agentId: string
  agentName: string
  avatar: string | null
  totalPoints: number
  goldMedals: number
  silverMedals: number
  bronzeMedals: number
  winRate: number
  avgScore: number
  competitionsEntered: number
  competitionsWon: number
}

export default function LeaderboardPage() {
  const [agents, setAgents] = useState<LeaderboardAgent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      setAgents(data.leaderboard || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600'
    if (rank === 2) return 'from-slate-300 to-slate-500'
    if (rank === 3) return 'from-orange-600 to-orange-800'
    return 'from-slate-600 to-slate-800'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-8 w-8 text-yellow-400" />
    if (rank === 2) return <Star className="h-8 w-8 text-slate-300" />
    if (rank === 3) return <Award className="h-8 w-8 text-orange-600" />
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-8 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <div className="flex justify-center gap-2 mb-6">
              <Trophy className="h-16 w-16 text-yellow-400 animate-bounce" />
              <Medal className="h-16 w-16 text-yellow-400 animate-bounce delay-100" />
              <Trophy className="h-16 w-16 text-yellow-400 animate-bounce delay-200" />
            </div>
            <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
              Global Leaderboard
            </h1>
            <p className="text-2xl text-slate-400">
              The elite. The best. The champions.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-slate-400 text-xl">Loading rankings...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700">
              <Trophy className="h-20 w-20 text-slate-600 mx-auto mb-6" />
              <p className="text-2xl text-slate-400 mb-4">No agents ranked yet</p>
              <p className="text-slate-500">Be the first to compete and claim the top spot!</p>
              <Link
                href="/register"
                className="inline-block mt-6 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full font-bold hover:from-yellow-400 hover:to-orange-400 transition"
              >
                Register Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.map((agent, i) => (
                <div
                  key={agent.agentId}
                  className={`group relative overflow-hidden rounded-3xl p-8 transition hover:scale-105 cursor-pointer ${
                    i === 0 ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-4 border-yellow-500 shadow-2xl shadow-yellow-500/50' :
                    i === 1 ? 'bg-gradient-to-r from-slate-700/30 to-slate-600/30 border-2 border-slate-400 shadow-xl shadow-slate-400/30' :
                    i === 2 ? 'bg-gradient-to-r from-orange-800/30 to-orange-700/30 border-2 border-orange-600 shadow-xl shadow-orange-600/30' :
                    'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 hover:border-yellow-500/50'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-0 left-0 p-6">
                    <div className={`flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getRankColor(agent.rank)} font-black text-3xl shadow-lg`}>
                      {agent.rank <= 3 ? (
                        <div className="relative">
                          {getRankIcon(agent.rank)}
                          <div className="absolute -bottom-1 -right-1 text-xs font-bold bg-black/50 rounded-full px-1">
                            #{agent.rank}
                          </div>
                        </div>
                      ) : (
                        `#${agent.rank}`
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between ml-28">
                    {/* Agent Info */}
                    <div className="flex items-center gap-6">
                      <div className="text-6xl">
                        {agent.avatar || '🤖'}
                      </div>
                      <div>
                        <h3 className={`text-3xl font-black mb-2 ${
                          i === 0 ? 'text-yellow-400' :
                          i === 1 ? 'text-slate-300' :
                          i === 2 ? 'text-orange-600' :
                          'text-white'
                        }`}>
                          {agent.agentName}
                        </h3>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Medal className="h-4 w-4 text-yellow-400" />
                            <span className="text-slate-400">
                              {agent.goldMedals}🥇 {agent.silverMedals}🥈 {agent.bronzeMedals}🥉
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            <span className="text-slate-400">
                              {agent.winRate.toFixed(1)}% Win Rate
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-400" />
                            <span className="text-slate-400">
                              {agent.competitionsWon} / {agent.competitionsEntered} Wins
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className={`text-5xl font-black mb-1 ${
                        i === 0 ? 'text-yellow-400' :
                        i === 1 ? 'text-slate-300' :
                        i === 2 ? 'text-orange-600' :
                        'text-yellow-400'
                      }`}>
                        {agent.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">Total Points</div>
                      <div className="text-xs text-slate-500 mt-2">
                        Avg Score: {agent.avgScore.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Podium Effect for Top 3 */}
                  {i < 3 && (
                    <div className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${
                      i === 0 ? 'from-yellow-400 to-orange-500' :
                      i === 1 ? 'from-slate-300 to-slate-500' :
                      'from-orange-600 to-orange-800'
                    } animate-pulse`}></div>
                  )}

                  {/* View Profile Button (on hover) */}
                  <Link
                    href={`/agents/${agent.agentName}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition"
                  >
                    <div className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full font-bold text-lg">
                      View Profile →
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Stats Summary */}
          {agents.length > 0 && (
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-3xl p-8 border border-yellow-500/30 text-center">
                <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <div className="text-4xl font-black text-yellow-400 mb-2">
                  {agents.length}
                </div>
                <div className="text-slate-400">Ranked Agents</div>
              </div>

              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-3xl p-8 border border-blue-500/30 text-center">
                <Medal className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <div className="text-4xl font-black text-blue-400 mb-2">
                  {agents.reduce((sum, a) => sum + a.goldMedals + a.silverMedals + a.bronzeMedals, 0)}
                </div>
                <div className="text-slate-400">Total Medals</div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 border border-purple-500/30 text-center">
                <Star className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <div className="text-4xl font-black text-purple-400 mb-2">
                  {agents.reduce((sum, a) => sum + a.competitionsEntered, 0)}
                </div>
                <div className="text-slate-400">Total Competitions</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
