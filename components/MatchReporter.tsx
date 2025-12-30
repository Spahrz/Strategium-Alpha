import React, { useState, useEffect } from 'react';
import { Player, Match } from '../types';
import { MISSIONS } from '../constants';
import { generateBattleNarrative } from '../services/geminiService';

interface MatchReporterProps {
  players: Player[];
  matches: Match[];
  currentWeek: number;
  onReportMatch: (match: Match) => void;
  initialMatchData?: Partial<Match> | null;
}

const MatchReporter: React.FC<MatchReporterProps> = ({ 
  players, 
  matches, 
  currentWeek, 
  onReportMatch,
  initialMatchData 
}) => {
  const [view, setView] = useState<'history' | 'report'>('history');
  
  // Form State
  const [p1Id, setP1Id] = useState('');
  const [p2Id, setP2Id] = useState('');
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [mission, setMission] = useState(MISSIONS[0]);
  const [highlights, setHighlights] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load initial data if provided (e.g. from Pairings tab)
  useEffect(() => {
    if (initialMatchData) {
        setView('report');
        if (initialMatchData.player1Id) setP1Id(initialMatchData.player1Id);
        if (initialMatchData.player2Id) setP2Id(initialMatchData.player2Id);
        if (initialMatchData.mission) setMission(initialMatchData.mission);
    }
  }, [initialMatchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1Id || !p2Id || p1Id === p2Id) return;

    setIsGenerating(true);

    const player1 = players.find(p => p.id === p1Id);
    const player2 = players.find(p => p.id === p2Id);

    const winnerId = p1Score > p2Score ? p1Id : (p2Score > p1Score ? p2Id : null);

    const newMatch: Match = {
      id: initialMatchData?.id || Date.now().toString(),
      date: new Date().toISOString(),
      player1Id: p1Id,
      player2Id: p2Id,
      player1Score: p1Score,
      player2Score: p2Score,
      mission,
      pointsLimit: 1000, // Should come from settings
      winnerId,
      week: currentWeek
    } as Match & { week: number };

    // Generate AI Narrative
    if (player1 && player2) {
      const story = await generateBattleNarrative(newMatch, player1, player2, highlights);
      newMatch.narrative = story;
    }

    onReportMatch(newMatch);
    setIsGenerating(false);
    setView('history');
    // Reset Form
    setP1Score(0);
    setP2Score(0);
    setHighlights('');
    setP1Id('');
    setP2Id('');
  };

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';
  const getPlayerFaction = (id: string) => players.find(p => p.id === id)?.faction || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-auspex-border pb-4">
        <h2 className="text-xl font-bold text-imperial-gold uppercase tracking-widest">Battle Logs</h2>
        <div className="space-x-2">
            <button 
                onClick={() => setView('history')}
                className={`px-4 py-1.5 rounded text-sm uppercase font-bold transition-colors ${view === 'history' ? 'bg-imperial-gold text-black' : 'bg-auspex-panel text-gray-400 hover:bg-gray-700'}`}
            >
                Archives
            </button>
            <button 
                onClick={() => {
                    setView('report');
                    setP1Id('');
                    setP2Id('');
                }}
                className={`px-4 py-1.5 rounded text-sm uppercase font-bold transition-colors ${view === 'report' ? 'bg-imperial-gold text-black' : 'bg-auspex-panel text-gray-400 hover:bg-gray-700'}`}
            >
                + Log Battle
            </button>
        </div>
      </div>

      {view === 'report' && (
        <form onSubmit={handleSubmit} className="bg-auspex-panel p-6 rounded-lg border border-auspex-border space-y-6 animate-fade-in">
          {initialMatchData && (
              <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded text-sm text-blue-200 mb-4">
                  Reporting results for scheduled briefing.
              </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player 1 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-imperial-gold uppercase">Attacker (Player 1)</label>
              <select 
                value={p1Id} 
                onChange={e => setP1Id(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                required
                disabled={!!initialMatchData?.player1Id}
              >
                <option value="">Select Player</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.faction})</option>)}
              </select>
              <input 
                type="number" 
                min="0" max="100" 
                value={p1Score} 
                onChange={e => setP1Score(Number(e.target.value))}
                className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                placeholder="Score (0-100)"
              />
            </div>

            {/* Player 2 */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-imperial-gold uppercase">Defender (Player 2)</label>
              <select 
                value={p2Id} 
                onChange={e => setP2Id(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                required
                disabled={!!initialMatchData?.player2Id}
              >
                <option value="">Select Player</option>
                {players.filter(p => p.id !== p1Id).map(p => <option key={p.id} value={p.id}>{p.name} ({p.faction})</option>)}
              </select>
              <input 
                type="number" 
                min="0" max="100" 
                value={p2Score} 
                onChange={e => setP2Score(Number(e.target.value))}
                className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                placeholder="Score (0-100)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="block text-sm font-bold text-text-secondary uppercase">Mission</label>
                <select 
                    value={mission}
                    onChange={e => setMission(e.target.value)}
                    className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                >
                    {MISSIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-bold text-text-secondary uppercase">Battle Highlights</label>
                <textarea 
                    value={highlights}
                    onChange={e => setHighlights(e.target.value)}
                    placeholder="Briefly describe key moments for the Chronicles (e.g., 'Warlord slain by lucky shot', 'Terminators held the center')"
                    className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 h-24 focus:border-imperial-gold outline-none text-sm"
                />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
                type="submit" 
                disabled={isGenerating}
                className="bg-imperial-gold text-black font-bold uppercase px-8 py-3 rounded hover:bg-yellow-400 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
            >
                {isGenerating ? 'Communing with Machine Spirit...' : 'Submit Battle Log'}
            </button>
          </div>
        </form>
      )}

      {view === 'history' && (
        <div className="grid gap-6">
            {matches.length === 0 && (
                <div className="text-center py-12 text-gray-500 italic">No battles recorded in the archives yet.</div>
            )}
            {matches.slice().reverse().map(match => (
                <div key={match.id} className="bg-auspex-panel border border-auspex-border rounded-lg overflow-hidden hover:border-gray-500 transition-colors">
                    <div className="bg-black/30 px-6 py-3 border-b border-white/5 flex flex-wrap justify-between items-center gap-2">
                        <span className="text-xs font-mono text-text-secondary">{new Date(match.date).toLocaleDateString()}</span>
                        <span className="text-xs font-bold text-imperial-gold uppercase tracking-wider">{match.mission}</span>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                            <div className={`text-center md:text-left flex-1 ${match.winnerId === match.player1Id ? 'text-green-400' : 'text-gray-300'}`}>
                                <div className="text-lg font-bold">{getPlayerName(match.player1Id)}</div>
                                <div className="text-xs text-gray-500">{getPlayerFaction(match.player1Id)}</div>
                                <div className="text-3xl font-mono mt-1">{match.player1Score}</div>
                            </div>
                            <div className="text-gray-600 font-bold text-xl px-4">VS</div>
                            <div className={`text-center md:text-right flex-1 ${match.winnerId === match.player2Id ? 'text-green-400' : 'text-gray-300'}`}>
                                <div className="text-lg font-bold">{getPlayerName(match.player2Id)}</div>
                                <div className="text-xs text-gray-500">{getPlayerFaction(match.player2Id)}</div>
                                <div className="text-3xl font-mono mt-1">{match.player2Score}</div>
                            </div>
                        </div>
                        
                        {match.narrative && (
                            <div className="bg-black/40 p-4 rounded border-l-2 border-imperial-gold relative">
                                <h4 className="text-xs font-bold text-imperial-gold uppercase mb-2">Battle Chronicle</h4>
                                <p className="text-sm text-gray-300 italic font-serif leading-relaxed">
                                    "{match.narrative}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MatchReporter;