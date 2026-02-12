'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Pitcher {
  id: string
  name: string
  team: string
  throws: string
  era: number
  fip: number
  k9: number
  bb9: number
  hr9: number
}

/* ---------- SVG Baseball Diamond ---------- */
function BaseballDiamond({
  runners,
  onToggle,
}: {
  runners: string[]
  onToggle: (base: string) => void
}) {
  const bases: { key: string; cx: number; cy: number }[] = [
    { key: 'first', cx: 78, cy: 50 },
    { key: 'second', cx: 50, cy: 22 },
    { key: 'third', cx: 22, cy: 50 },
  ]

  return (
    <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto select-none">
      {/* Field grass */}
      <polygon
        points="50,12 88,50 50,88 12,50"
        fill="none"
        stroke="rgba(34,197,94,0.25)"
        strokeWidth="1"
      />
      {/* Baselines */}
      <line x1="50" y1="88" x2="88" y2="50" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8" />
      <line x1="88" y1="50" x2="50" y2="12" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8" />
      <line x1="50" y1="12" x2="12" y2="50" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8" />
      <line x1="12" y1="50" x2="50" y2="88" stroke="rgba(148,163,184,0.2)" strokeWidth="0.8" />

      {/* Home plate */}
      <rect x="47" y="85" width="6" height="6" rx="1" fill="rgba(148,163,184,0.4)" transform="rotate(45 50 88)" />

      {/* Bases */}
      {bases.map(({ key, cx, cy }) => {
        const active = runners.includes(key)
        return (
          <g key={key} onClick={() => onToggle(key)} className="cursor-pointer">
            {active && (
              <circle cx={cx} cy={cy} r="10" fill="rgba(34,197,94,0.15)" />
            )}
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
              className="transition-colors duration-150"
            />
            {active && (
              <circle cx={cx} cy={cy} r="3" fill="#f59e0b" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- Section Header ---------- */
function SectionHeader({ title, accent = 'green' }: { title: string; accent?: 'green' | 'gold' }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-1 h-6 rounded-full ${accent === 'green' ? 'bg-field-500' : 'bg-gold-500'}`} />
      <h2 className="text-lg font-bold text-slate-100">{title}</h2>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [pitchers, setPitchers] = useState<Pitcher[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Form state
  const [inning, setInning] = useState(9)
  const [outs, setOuts] = useState(0)
  const [scoreHome, setScoreHome] = useState(3)
  const [scoreAway, setScoreAway] = useState(3)
  const [isHome, setIsHome] = useState(true)
  const [runners, setRunners] = useState<string[]>([])
  const [selectedPitchers, setSelectedPitchers] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/pitchers')
      .then((res) => res.json())
      .then((data) => setPitchers(data.pitchers))
  }, [])

  const filteredPitchers = useMemo(() => {
    if (!search.trim()) return pitchers
    const q = search.toLowerCase()
    return pitchers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q)
    )
  }, [pitchers, search])

  const toggleRunner = (base: string) => {
    setRunners((prev) =>
      prev.includes(base) ? prev.filter((b) => b !== base) : [...prev, base]
    )
  }

  const togglePitcher = (id: string) => {
    setSelectedPitchers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleSimulate = async () => {
    if (selectedPitchers.length < 2) {
      alert('Please select at least 2 pitchers to compare')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inning,
          outs,
          scoreHome,
          scoreAway,
          isHome,
          runners,
          pitcherIds: selectedPitchers,
          iterations: 1000,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push(`/results/${data.scenarioId}`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert('Simulation failed')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
            Bullpen Chaos Engine
          </h1>
          <p className="text-slate-400 mt-1">
            Simulate late-inning bullpen decisions with Monte Carlo analysis
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ─── Game Scenario ─── */}
          <div className="glass-card p-6 animate-slide-up">
            <SectionHeader title="Game Scenario" />

            <div className="space-y-5">
              {/* Scoreboard */}
              <div className="rounded-lg overflow-hidden border border-slate-700/50">
                <table className="w-full text-center text-sm">
                  <thead>
                    <tr className="bg-slate-800/60">
                      <th className="py-2 px-3 text-left text-slate-400 font-medium w-24">Team</th>
                      <th className="py-2 px-3 text-slate-400 font-medium">Runs</th>
                      <th className="py-2 px-3 text-slate-400 font-medium w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-700/40">
                      <td className="py-2 px-3 text-left font-semibold text-slate-300">AWAY</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={scoreAway}
                          onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
                          className="w-16 text-center text-lg font-bold !bg-transparent !border-0 !p-0"
                        />
                      </td>
                      <td className="py-2 px-3">
                        {!isHome && (
                          <span className="text-[0.65rem] font-bold bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded">
                            AT BAT
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-700/40">
                      <td className="py-2 px-3 text-left font-semibold text-slate-300">HOME</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={scoreHome}
                          onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
                          className="w-16 text-center text-lg font-bold !bg-transparent !border-0 !p-0"
                        />
                      </td>
                      <td className="py-2 px-3">
                        {isHome && (
                          <span className="text-[0.65rem] font-bold bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded">
                            AT BAT
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Inning + Team Pitching */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="stat-label block mb-1.5">Inning</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={inning}
                    onChange={(e) => setInning(parseInt(e.target.value) || 1)}
                    className="w-full text-center text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="stat-label block mb-1.5">Team Pitching</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setIsHome(true)}
                      className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                        isHome
                          ? 'bg-field-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Home
                    </button>
                    <button
                      onClick={() => setIsHome(false)}
                      className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                        !isHome
                          ? 'bg-field-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Away
                    </button>
                  </div>
                </div>
              </div>

              {/* Outs */}
              <div>
                <label className="stat-label block mb-1.5">Outs</label>
                <div className="flex gap-2">
                  {[0, 1, 2].map((o) => (
                    <button
                      key={o}
                      onClick={() => setOuts(o)}
                      className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${
                        outs === o
                          ? 'bg-gold-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diamond + runner labels */}
              <div>
                <label className="stat-label block mb-1.5">Runners On Base</label>
                <div className="flex items-center gap-4">
                  <BaseballDiamond runners={runners} onToggle={toggleRunner} />
                  <div className="text-sm text-slate-400 space-y-1">
                    {runners.length === 0 ? (
                      <span>Bases empty</span>
                    ) : (
                      runners.map((r) => (
                        <div key={r} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gold-500" />
                          <span className="capitalize">{r}</span>
                        </div>
                      ))
                    )}
                    <p className="text-slate-500 text-xs mt-2">Click bases to toggle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Pitcher Selection ─── */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <SectionHeader title={`Select Pitchers (${selectedPitchers.length})`} accent="gold" />

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-4"
            />

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredPitchers.map((pitcher) => {
                const selected = selectedPitchers.includes(pitcher.id)
                return (
                  <button
                    key={pitcher.id}
                    onClick={() => togglePitcher(pitcher.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selected
                        ? 'bg-field-600/20 border border-field-500/40'
                        : 'bg-slate-800/50 border border-transparent hover:bg-slate-800 hover:border-slate-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-100 truncate">
                          {selected && <span className="text-field-400 mr-1">&#10003;</span>}
                          {pitcher.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {pitcher.team} &middot; {pitcher.throws}HP
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-x-3 gap-y-0.5 text-right flex-shrink-0">
                        <span className="stat-label">ERA</span>
                        <span className="stat-label">FIP</span>
                        <span className="stat-label">K/9</span>
                        <span className="stat-label">BB/9</span>
                        <span className="stat-label">HR/9</span>
                        <span className="text-xs font-bold text-slate-200">{pitcher.era.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-200">{pitcher.fip.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-200">{pitcher.k9.toFixed(1)}</span>
                        <span className="text-xs font-bold text-slate-200">{pitcher.bb9.toFixed(1)}</span>
                        <span className="text-xs font-bold text-slate-200">{pitcher.hr9.toFixed(2)}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
              {filteredPitchers.length === 0 && (
                <p className="text-center text-slate-500 py-8 text-sm">No pitchers found</p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Simulate Button ─── */}
        <button
          onClick={handleSimulate}
          disabled={loading || selectedPitchers.length < 2}
          className="w-full mt-6 bg-field-600 hover:bg-field-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
              </svg>
              Running Simulation...
            </>
          ) : (
            'Run Simulation (1,000 iterations)'
          )}
        </button>
      </div>
    </div>
  )
}
