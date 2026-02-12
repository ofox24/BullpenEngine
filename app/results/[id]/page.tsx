'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Result {
  pitcherId: string
  pitcherName: string
  avgRunsAllowed: number
  avgWinProbability: number
  wpDelta: number
  optimalChoice: boolean
}

interface Scenario {
  id: string
  inning: number
  outs: number
  scoreHome: number
  scoreAway: number
  isHome: boolean
  runnersOn: string
  results: Result[]
}

/* ---------- Mini Baseball Diamond ---------- */
function MiniDiamond({ runners }: { runners: string[] }) {
  const bases: { key: string; cx: number; cy: number }[] = [
    { key: 'first', cx: 78, cy: 50 },
    { key: 'second', cx: 50, cy: 22 },
    { key: 'third', cx: 22, cy: 50 },
  ]

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      <polygon
        points="50,12 88,50 50,88 12,50"
        fill="none"
        stroke="rgba(34,197,94,0.25)"
        strokeWidth="1.5"
      />
      <rect x="47" y="85" width="6" height="6" rx="1" fill="rgba(148,163,184,0.4)" transform="rotate(45 50 88)" />
      {bases.map(({ key, cx, cy }) => {
        const active = runners.includes(key)
        return (
          <g key={key}>
            <rect
              x={cx - 5}
              y={cy - 5}
              width="10"
              height="10"
              rx="1.5"
              transform={`rotate(45 ${cx} ${cy})`}
              fill={active ? '#22c55e' : 'rgba(148,163,184,0.25)'}
              stroke={active ? '#4ade80' : 'rgba(148,163,184,0.3)'}
              strokeWidth="1"
            />
            {active && <circle cx={cx} cy={cy} r="3" fill="#f59e0b" />}
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- Skeleton Loading ---------- */
function SkeletonLoading() {
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="shimmer-skeleton h-8 w-48 mb-6" />
        <div className="shimmer-skeleton h-10 w-72 mb-8" />
        <div className="glass-card p-6 mb-8">
          <div className="shimmer-skeleton h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="shimmer-skeleton h-4 w-16 mb-2" />
                <div className="shimmer-skeleton h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="shimmer-skeleton h-6 w-40 mb-3" />
              <div className="shimmer-skeleton h-4 w-24 mb-4" />
              <div className="shimmer-skeleton h-10 w-full mb-3" />
              <div className="shimmer-skeleton h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6">
          <div className="shimmer-skeleton h-6 w-56 mb-4" />
          <div className="shimmer-skeleton h-[300px] w-full" />
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/scenarios/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setScenario(data.scenario)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [params.id])

  if (loading) return <SkeletonLoading />

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-secondary)] text-xl">Scenario not found</div>
      </div>
    )
  }

  const runners = JSON.parse(scenario.runnersOn) as string[]

  const maxWp = Math.max(...scenario.results.map((r) => r.avgWinProbability))
  const chartData = scenario.results.map((r) => ({
    name: r.pitcherName.split(' ')[1] || r.pitcherName,
    fullName: r.pitcherName,
    wpPct: parseFloat((r.avgWinProbability * 100).toFixed(1)),
    optimal: r.optimalChoice,
  }))

  const getGrade = (wpDelta: number, optimal: boolean): string => {
    if (optimal) return 'A+'
    if (wpDelta >= -0.02) return 'A'
    if (wpDelta >= -0.04) return 'B'
    if (wpDelta >= -0.06) return 'C'
    return 'D'
  }

  const getGradeClasses = (grade: string): string => {
    if (grade === 'A+' || grade === 'A') return 'bg-field-500/20 text-field-400 border-field-500/30'
    if (grade === 'B') return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    if (grade === 'C') return 'bg-gold-500/20 text-gold-400 border-gold-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="group mb-6 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Simulator
        </button>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-6">
          Simulation Results
        </h1>

        {/* ─── Scenario Summary ─── */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full bg-field-500" />
            <h2 className="text-lg font-bold">Scenario</h2>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {/* Mini diamond */}
            <MiniDiamond runners={runners} />

            {/* Scoreboard mini */}
            <div className="rounded-lg overflow-hidden border border-[var(--border-subtle)] text-sm">
              <table className="text-center">
                <tbody>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <td className="py-1.5 px-3 text-left text-[var(--text-secondary)] font-medium">AWAY</td>
                    <td className="py-1.5 px-4 font-bold text-lg">{scenario.scoreAway}</td>
                    <td className="py-1.5 px-2">
                      {!scenario.isHome && (
                        <span className="text-[0.6rem] font-bold bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded">
                          BAT
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 text-left text-[var(--text-secondary)] font-medium">HOME</td>
                    <td className="py-1.5 px-4 font-bold text-lg">{scenario.scoreHome}</td>
                    <td className="py-1.5 px-2">
                      {scenario.isHome && (
                        <span className="text-[0.6rem] font-bold bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded">
                          BAT
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Inning */}
            <div>
              <div className="stat-label">Inning</div>
              <div className="stat-value">{scenario.inning}</div>
            </div>

            {/* Outs dots */}
            <div>
              <div className="stat-label">Outs</div>
              <div className="flex gap-1.5 mt-1">
                {[0, 1, 2].map((o) => (
                  <span
                    key={o}
                    className={`w-4 h-4 rounded-full ${
                      o < scenario.outs ? 'bg-gold-500' : 'bg-[var(--form-bg)] border border-[var(--border-subtle)]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Runners text */}
            <div>
              <div className="stat-label">Runners</div>
              <div className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                {runners.length === 0
                  ? 'Bases empty'
                  : runners.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Result Cards ─── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {scenario.results.map((result, i) => {
            const grade = getGrade(result.wpDelta, result.optimalChoice)
            const gradeClasses = getGradeClasses(grade)
            const wpPct = result.avgWinProbability * 100
            const barWidth = maxWp > 0 ? (result.avgWinProbability / maxWp) * 100 : 0

            return (
              <div
                key={result.pitcherId}
                className={`glass-card p-5 animate-slide-up ${
                  result.optimalChoice ? 'ring-1 ring-field-500/40' : ''
                }`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{result.pitcherName}</h3>
                    {result.optimalChoice && (
                      <div className="text-xs text-field-400 font-semibold mt-0.5">
                        Optimal Choice
                      </div>
                    )}
                  </div>
                  <span
                    className={`${gradeClasses} border px-2.5 py-1 rounded-md font-bold text-sm`}
                  >
                    {grade}
                  </span>
                </div>

                {/* Win probability bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="stat-label">Win Probability</span>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {wpPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--form-bg)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        result.optimalChoice ? 'bg-field-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      result.wpDelta >= 0 ? 'text-field-400' : 'text-red-400'
                    }`}
                  >
                    {result.wpDelta >= 0 ? '+' : ''}
                    {(result.wpDelta * 100).toFixed(1)}% vs avg
                  </div>
                </div>

                <div>
                  <span className="stat-label">Avg Runs Allowed</span>
                  <div className="text-xl font-bold text-[var(--text-primary)]">
                    {result.avgRunsAllowed.toFixed(2)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Chart ─── */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-gold-500" />
            <h2 className="text-lg font-bold">Win Probability Comparison</h2>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#b7ceca"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: 'rgba(148,163,184,0.25)' }}
                tickLine={false}
              />
              <YAxis
                stroke="#b7ceca"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                contentStyle={{
                  backgroundColor: '#07222a',
                  border: '1px solid rgba(148,163,184,0.25)',
                  borderRadius: '8px',
                  color: '#e9f5f3',
                  fontSize: 13,
                }}
                formatter={(value: number) => [`${value}%`, 'Win Prob']}
              />
              <Bar dataKey="wpPct" radius={[4, 4, 0, 0]} name="Win Prob %">
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.optimal ? '#22c55e' : '#3b82f6'}
                    fillOpacity={entry.optimal ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
