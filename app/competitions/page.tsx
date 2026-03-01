'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Flame, Clock, Users, Zap, Award, Target, ArrowLeft, Play } from 'lucide-react'

interface Competition {
  id: string
  name: string
  description: string
  eventType: string
  status: string
  startsAt: string
  endsAt: string
  registrationCloses: string
  maxParticipants: number | null
  timeLimit: number | null
  goldPrize: number
  silverPrize: number
  bronzePrize: number
  _count?: {
    submissions: number
  }
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all')

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions')
      const data = await response.json()
      setCompetitions(data.competitions || [])
    } catch (error) {
      console.error('Failed to fetch competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      SPEED_CODING: '⚡',
      CODE_GOLF: '⛳',
      BUG_HUNT: '🐛',
      CREATIVE_WRITING: '✨',
      MATH_OLYMPIAD: '🧮',
      TRIVIA_CHALLENGE: '🎯',
      SECURITY_CTF: '🔒',
      TRANSLATION_ACCURACY: '🌐'
    }
    return icons[eventType] || '🏆'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      IN_PROGRESS: 'from-green-500 to-emerald-500',
      REGISTRATION_OPEN: 'from-blue-500 to-cyan-500',
      UPCOMING: 'from-purple-500 to-pink-500',
      JUDGING: 'from-yellow-500 to-orange-500',
      COMPLETED: 'from-slate-500 to-slate-600'
    }
    return colors[status] || 'from-slate-500 to-slate-600'
  }

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const timeRemaining = (dateString: string) => {
    const target = new Date(dateString)
    const now = new Date()
    const diff = target.getTime() - now.getTime()
    
    if (diff < 0) return 'Started'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours < 24) {
      return `${hours}h ${minutes}m`
    }
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }

  const filteredCompetitions = competitions.filter(comp => {
    if (filter === 'all') return true
    if (filter === 'live') return comp.status === 'IN_PROGRESS' || comp.status === 'REGISTRATION_OPEN'
    if (filter === 'upcoming') return comp.status === 'UPCOMING'
    if (filter === 'completed') return comp.status === 'COMPLETED'
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-700"></div>
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

          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Competitions
              </h1>
              <p className="text-xl text-slate-400">
                Choose your battlefield and prove your excellence
              </p>
            </div>
            <div className="flex items-center gap-3 text-3xl">
              <Flame className="h-12 w-12 text-orange-500 animate-bounce" />
              <span className="font-black text-yellow-400">
                {competitions.filter(c => c.status === 'IN_PROGRESS' || c.status === 'REGISTRATION_OPEN').length}
              </span>
              <span className="text-slate-400">LIVE</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-8">
            {['all', 'live', 'upcoming', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-3 rounded-full font-bold transition ${
                  filter === f
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-slate-400">Loading competitions...</p>
            </div>
          ) : filteredCompetitions.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700">
              <Trophy className="h-20 w-20 text-slate-600 mx-auto mb-6" />
              <p className="text-2xl text-slate-400">No competitions found</p>
              <p className="text-slate-500 mt-2">Check back soon for new challenges!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCompetitions.map(comp => (
                <div
                  key={comp.id}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8 border border-slate-700 hover:border-yellow-500/50 transition cursor-pointer"
                >
                  {/* Status Badge */}
                  <div className={`absolute top-6 right-6 px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor(comp.status)} font-bold text-sm shadow-lg`}>
                    {comp.status === 'IN_PROGRESS' && (
                      <span className="flex items-center gap-2">
                        <Play className="h-4 w-4 fill-white" />
                        LIVE
                      </span>
                    )}
                    {comp.status === 'REGISTRATION_OPEN' && 'OPEN'}
                    {comp.status === 'UPCOMING' && 'UPCOMING'}
                    {comp.status === 'JUDGING' && 'JUDGING'}
                    {comp.status === 'COMPLETED' && 'COMPLETED'}
                  </div>

                  {/* Event Icon */}
                  <div className="text-6xl mb-4">{getEventIcon(comp.eventType)}</div>

                  <div className="mb-4">
                    <div className="text-sm text-yellow-400 font-semibold mb-2">
                      {formatEventType(comp.eventType)}
                    </div>
                    <h3 className="text-3xl font-black mb-3 group-hover:text-yellow-400 transition">
                      {comp.name}
                    </h3>
                    <p className="text-slate-400 line-clamp-2">
                      {comp.description}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-slate-400">Participants</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {comp._count?.submissions || 0}
                        {comp.maxParticipants && ` / ${comp.maxParticipants}`}
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-slate-400">
                          {comp.status === 'IN_PROGRESS' ? 'Ends in' : 'Starts in'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">
                        {timeRemaining(comp.status === 'IN_PROGRESS' ? comp.endsAt : comp.startsAt)}
                      </div>
                    </div>
                  </div>

                  {/* Prize Pool */}
                  <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-4 border border-yellow-500/30 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">Prize Pool</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🥇</span>
                        <span className="font-bold text-yellow-400">{comp.goldPrize} pts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🥈</span>
                        <span className="font-bold text-slate-300">{comp.silverPrize} pts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🥉</span>
                        <span className="font-bold text-orange-600">{comp.bronzePrize} pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/competitions/${comp.id}`}
                    className="block w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full font-bold text-center hover:from-yellow-400 hover:to-orange-400 transition shadow-lg shadow-yellow-500/30"
                  >
                    {comp.status === 'IN_PROGRESS' ? (
                      <span className="flex items-center justify-center gap-2">
                        <Zap className="h-5 w-5" />
                        Compete Now
                      </span>
                    ) : comp.status === 'REGISTRATION_OPEN' ? (
                      <span className="flex items-center justify-center gap-2">
                        <Target className="h-5 w-5" />
                        Register Now
                      </span>
                    ) : (
                      'View Details'
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
