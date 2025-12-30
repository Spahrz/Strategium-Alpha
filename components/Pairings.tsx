import React, { useState } from 'react';
import { Player, Pairing } from '../types';
import { MISSIONS } from '../constants';

interface PairingsProps {
  players: Player[];
  pairings: Pairing[];
  currentWeek: number;
  onAddPairing: (p1Id: string, p2Id: string, mission: string) => void;
  onReportResult: (pairing: Pairing) => void;
}

const Pairings: React.FC<PairingsProps> = ({ players, pairings, currentWeek, onAddPairing, onReportResult }) => {
  const [p1Id, setP1Id] = useState('');
  const [p2Id, setP2Id] = useState('');
  const [mission, setMission] = useState(MISSIONS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const activePairings = pairings.filter(p => !p.completed && p.week === currentWeek);
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1Id && p2Id && p1Id !== p2Id) {
        onAddPairing(p1Id, p2Id, mission);
        setP1Id('');
        setP2Id('');
        setIsCreating(false);
    }
  };

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';
  const getPlayerFaction = (id: string) => players.find(p => p.id === id)?.faction || 'Unknown';

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center border-b border-auspex-border pb-4">
        <h2 className="text-xl font-bold text-imperial-gold uppercase tracking-widest">Sector Briefings (Week {currentWeek})</h2>
        <button 
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-1.5 rounded text-sm uppercase font-bold bg-imperial-gold text-black hover:bg-yellow-400 transition-colors"
        >
            {isCreating ? 'Cancel Orders' : '+ Issue Orders'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-auspex-panel p-6 rounded-lg border border-auspex-border space-y-4 animate-fade-in mb-8">
            <h3 className="text-sm font-bold text-text-secondary uppercase">New Engagement Order</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Attacker</label>
                    <select 
                        value={p1Id} 
                        onChange={e => setP1Id(e.target.value)}
                        className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                        required
                    >
                        <option value="">Select Player</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Defender</label>
                    <select 
                        value={p2Id} 
                        onChange={e => setP2Id(e.target.value)}
                        className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                        required
                    >
                        <option value="">Select Player</option>
                        {players.filter(p => p.id !== p1Id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Primary Objective</label>
                    <select 
                        value={mission} 
                        onChange={e => setMission(e.target.value)}
                        className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                    >
                        {MISSIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="bg-mechanicus-red text-white text-sm font-bold uppercase px-6 py-2 rounded hover:bg-red-500 transition-colors"
                >
                    Confirm Engagement
                </button>
            </div>
        </form>
      )}

      {activePairings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-auspex-border rounded-lg text-gray-500">
              <p className="mb-2">No active engagements detected for this sector.</p>
              <p className="text-xs">Issue new orders to commence hostilities.</p>
          </div>
      ) : (
          <div className="grid gap-4">
              {activePairings.map(pairing => (
                  <div key={pairing.id} className="bg-black/40 border border-auspex-border rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-gray-500 transition-colors">
                      <div className="flex-1 flex items-center justify-center md:justify-start gap-4">
                          <div className="text-right">
                              <div className="font-bold text-white">{getPlayerName(pairing.player1Id)}</div>
                              <div className="text-xs text-gray-500">{getPlayerFaction(pairing.player1Id)}</div>
                          </div>
                          <div className="text-imperial-gold font-bold text-sm bg-auspex-panel px-2 py-1 rounded">VS</div>
                          <div className="text-left">
                              <div className="font-bold text-white">{getPlayerName(pairing.player2Id)}</div>
                              <div className="text-xs text-gray-500">{getPlayerFaction(pairing.player2Id)}</div>
                          </div>
                      </div>
                      
                      <div className="flex-1 text-center">
                           <span className="text-xs uppercase text-text-secondary tracking-wider block mb-1">Mission Protocol</span>
                           <span className="text-sm font-mono text-white">{pairing.mission}</span>
                      </div>

                      <div className="flex-none">
                          <button 
                            onClick={() => onReportResult(pairing)}
                            className="bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/50 px-4 py-2 rounded text-sm uppercase font-bold transition-all"
                          >
                              Report Outcome
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Pairings;