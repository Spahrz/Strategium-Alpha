import React, { useState } from 'react';
import { Player, Faction } from '../types';
import { FACTION_LIST } from '../constants';

interface PlayerManagerProps {
  players: Player[];
  onAddPlayer: (name: string, faction: Faction) => void;
  onRemovePlayer: (id: string) => void;
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, onAddPlayer, onRemovePlayer }) => {
  const [name, setName] = useState('');
  const [faction, setFaction] = useState<Faction>(Faction.SPACE_MARINES);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddPlayer(name, faction);
      setName('');
      setFaction(Faction.SPACE_MARINES);
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      
      if (confirmDeleteId === id) {
          onRemovePlayer(id);
          setConfirmDeleteId(null);
      } else {
          setConfirmDeleteId(id);
          // Reset confirmation after 3 seconds if not clicked
          setTimeout(() => {
              setConfirmDeleteId(prev => prev === id ? null : prev);
          }, 3000);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-auspex-border pb-4">
        <h2 className="text-xl font-bold text-imperial-gold uppercase tracking-widest">Company Roster</h2>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-1.5 rounded text-sm uppercase font-bold bg-imperial-gold text-black hover:bg-yellow-400 transition-colors"
        >
            {isAdding ? 'Cancel Requisition' : '+ Recruit Lord'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-auspex-panel p-6 rounded-lg border border-auspex-border space-y-4 animate-fade-in mb-8">
          <h3 className="text-sm font-bold text-text-secondary uppercase">New Commander Registration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs text-text-secondary mb-1">Commander Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                    placeholder="Enter name..."
                    required
                />
            </div>
            <div>
                <label className="block text-xs text-text-secondary mb-1">Faction Allegiance</label>
                <select
                    value={faction}
                    onChange={(e) => setFaction(e.target.value as Faction)}
                    className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                >
                    {FACTION_LIST.map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
                type="submit"
                className="bg-green-600 text-white text-sm font-bold uppercase px-6 py-2 rounded hover:bg-green-500 transition-colors"
            >
                Confirm Requisition
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map(player => (
            <div key={player.id} className="bg-auspex-panel border border-auspex-border rounded-lg p-4 relative group hover:border-imperial-gold transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-white text-lg">{player.name}</h3>
                        <p className="text-xs text-imperial-gold uppercase tracking-wider">{player.faction}</p>
                    </div>
                    <button 
                        type="button"
                        onClick={(e) => handleDeleteClick(e, player.id)}
                        className={`transition-all p-2 rounded z-20 relative flex items-center gap-1 ${confirmDeleteId === player.id ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-red-500 hover:bg-white/10'}`}
                        title={confirmDeleteId === player.id ? "Click to Confirm Delete" : "Remove Player"}
                    >
                         {confirmDeleteId === player.id ? (
                             <span className="text-xs font-bold uppercase whitespace-nowrap px-1">Confirm?</span>
                         ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                         )}
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-white/5 pt-4">
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Played</div>
                        <div className="font-mono text-white">{player.gamesPlayed}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase">W/L/D</div>
                        <div className="font-mono text-white">{player.wins}/{player.losses}/{player.draws}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Total Pts</div>
                        <div className="font-mono text-imperial-gold font-bold">{player.totalPoints}</div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerManager;