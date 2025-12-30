import React, { useState } from 'react';
import { Player, LeagueSettings, Faction } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DashboardProps {
  players: Player[];
  settings: LeagueSettings;
  onUpdatePainting: (playerId: string, points: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ players, settings, onUpdatePainting }) => {
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [paintInput, setPaintInput] = useState<number>(0);

  // Helper for faction colors
  const getFactionColor = (faction: Faction) => {
    switch (faction) {
      case Faction.SPACE_MARINES: return '#3b82f6';
      case Faction.NECRONS: return '#22c55e';
      case Faction.ORKS: return '#16a34a'; // Orks are green too
      case Faction.ADEPTUS_MECHANICUS: return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const handlePaintClick = (player: Player) => {
    setEditingPlayer(player.id);
    setPaintInput(player.paintingPoints);
  };

  const savePainting = (playerId: string) => {
    onUpdatePainting(playerId, paintInput);
    setEditingPlayer(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* League Status Banner */}
      <div className="bg-gradient-to-r from-auspex-panel to-slate-900 border border-auspex-border rounded-lg p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-32 h-32 text-imperial-gold" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-imperial-gold uppercase tracking-widest mb-2">{settings.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-black/30 p-3 rounded border border-white/10">
            <p className="text-xs text-text-secondary uppercase">Current Phase</p>
            <p className="text-xl font-mono text-white">Week {settings.currentWeek}</p>
          </div>
          <div className="bg-black/30 p-3 rounded border border-white/10">
            <p className="text-xs text-text-secondary uppercase">Muster Limit</p>
            <p className="text-xl font-mono text-mechanicus-red">{settings.escalationPoints[settings.currentWeek - 1] || 2000} pts</p>
          </div>
          <div className="bg-black/30 p-3 rounded border border-white/10">
            <p className="text-xs text-text-secondary uppercase">Active Lords</p>
            <p className="text-xl font-mono text-white">{players.length}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Column */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-text-primary uppercase border-l-4 border-imperial-gold pl-3">
            Leaderboard
          </h3>
          <div className="bg-auspex-panel rounded-lg border border-auspex-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-auspex-border">
                <thead className="bg-black/40">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider hidden sm:table-cell">Faction</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Battle Pts</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">Paint Pts</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-imperial-gold uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-auspex-border">
                  {players.map((player, idx) => (
                    <tr key={player.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-text-secondary">#{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{player.name}</div>
                        <div className="text-xs text-text-secondary sm:hidden">{player.faction}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary hidden sm:table-cell">{player.faction}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-white font-mono">{player.gamingPoints}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono">
                        {editingPlayer === player.id ? (
                          <div className="flex items-center justify-center space-x-2">
                             <input 
                                type="number" 
                                className="w-16 bg-black border border-imperial-gold text-white px-1 py-0.5 rounded text-center"
                                value={paintInput}
                                onChange={(e) => setPaintInput(Number(e.target.value))}
                                autoFocus
                             />
                             <button onClick={() => savePainting(player.id)} className="text-green-500 hover:text-green-400">✓</button>
                             <button onClick={() => setEditingPlayer(null)} className="text-red-500 hover:text-red-400">✗</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handlePaintClick(player)}
                            className="text-text-secondary hover:text-imperial-gold border-b border-dashed border-gray-600 hover:border-imperial-gold"
                            title="Click to edit painting score"
                          >
                            {player.paintingPoints}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-imperial-gold font-bold font-mono text-lg">{player.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Charts Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-text-primary uppercase border-l-4 border-imperial-gold pl-3">
            Auspex Scan
          </h3>
          <div className="bg-auspex-panel p-4 rounded-lg border border-auspex-border h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={players}>
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} interval={0} />
                <YAxis tick={{fill: '#94a3b8'}} />
                <Tooltip 
                    contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}}
                    itemStyle={{color: '#fbbf24'}}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="totalPoints" name="Total Points" radius={[4, 4, 0, 0]}>
                  {players.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getFactionColor(entry.faction)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <h4 className="text-sm font-bold text-text-secondary mb-2 uppercase">Recent Activity</h4>
            <div className="text-xs text-gray-500 space-y-2">
                <p>• {players[0]?.name} is leading the crusade.</p>
                <p>• Highest painting score: {Math.max(...players.map(p => p.paintingPoints))} pts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;