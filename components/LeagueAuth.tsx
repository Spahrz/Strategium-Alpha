import React, { useState, useEffect } from 'react';
import { League } from '../types';
import { getLeagues, createLeague } from '../services/storageService';

interface LeagueAuthProps {
  onLeagueSelected: (leagueId: string) => void;
}

const LeagueAuth: React.FC<LeagueAuthProps> = ({ onLeagueSelected }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [isLoading, setIsLoading] = useState(false);
  
  // Create Form
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Login Form
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
      setIsLoading(true);
      try {
        const fetched = await getLeagues();
        setLeagues(fetched);
      } catch (e) {
          console.error(e);
          setError("Failed to connect to the Strategium network.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsLoading(true);
    try {
        const league = await createLeague(newName, newPassword);
        onLeagueSelected(league.id);
    } catch (e) {
        setError("Creation failed.");
        setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const league = leagues.find(l => l.id === selectedLeagueId);
    if (!league) return;

    if (league.password && league.password !== passwordAttempt) {
        setError("Access Denied: Incorrect Clearance Code");
        return;
    }
    onLeagueSelected(league.id);
  };

  return (
    <div className="min-h-screen bg-auspex-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-auspex-panel border border-auspex-border rounded-lg shadow-2xl p-8 relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-imperial-gold to-transparent opacity-50"></div>
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-imperial-gold rounded-full flex items-center justify-center text-auspex-bg font-bold text-3xl border-4 border-white shadow-glow">
                I
            </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-imperial-gold uppercase tracking-widest mb-2">Strategium Alpha</h1>
        <p className="text-center text-text-secondary text-sm font-mono mb-8">Select Sector Operations or Establish New Zone</p>

        {view === 'list' && (
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center text-imperial-gold animate-pulse">Scanning frequencies...</div>
                ) : leagues.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 italic">No active campaigns found in this quadrant.</div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {leagues.map(l => (
                            <button
                                key={l.id}
                                onClick={() => {
                                    setSelectedLeagueId(l.id);
                                    setError('');
                                    setPasswordAttempt('');
                                }}
                                className={`w-full text-left px-4 py-3 rounded border transition-colors ${selectedLeagueId === l.id ? 'bg-imperial-gold text-black border-imperial-gold font-bold' : 'bg-black/30 text-text-primary border-auspex-border hover:border-gray-500'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{l.name}</span>
                                    {l.password && <span className="text-xs uppercase opacity-70">🔒 Secure</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {selectedLeagueId && (
                    <form onSubmit={handleLogin} className="mt-4 p-4 bg-black/20 rounded border border-white/5 animate-fade-in">
                        <label className="block text-xs text-text-secondary uppercase mb-1">Clearance Code</label>
                        <input 
                            type="password"
                            value={passwordAttempt}
                            onChange={e => setPasswordAttempt(e.target.value)}
                            className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 mb-2 focus:border-imperial-gold outline-none"
                            placeholder={leagues.find(l => l.id === selectedLeagueId)?.password ? "Enter Password" : "No Password Required"}
                        />
                        {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
                        <button type="submit" className="w-full bg-imperial-gold text-black font-bold uppercase py-2 rounded hover:bg-yellow-400 transition-colors">
                            Enter Strategium
                        </button>
                    </form>
                )}

                <div className="border-t border-auspex-border mt-6 pt-4 flex gap-2">
                    <button 
                        onClick={() => setView('create')}
                        className="flex-1 bg-auspex-border text-text-primary text-sm font-bold uppercase py-2 rounded hover:bg-slate-600 transition-colors"
                    >
                        + New League
                    </button>
                    <button 
                        onClick={() => loadLeagues()}
                        className="w-10 bg-auspex-border text-text-primary rounded hover:bg-slate-600 flex items-center justify-center"
                        title="Refresh"
                    >
                        ↻
                    </button>
                </div>
            </div>
        )}

        {view === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-white uppercase border-b border-auspex-border pb-2">Initialize Campaign</h3>
                <div>
                    <label className="block text-xs text-text-secondary uppercase mb-1">Campaign Name</label>
                    <input 
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                        placeholder="e.g. Sector 42 Escalation"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs text-text-secondary uppercase mb-1">Access Password (Optional)</label>
                    <input 
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-black/50 border border-gray-600 text-white rounded p-2 focus:border-imperial-gold outline-none"
                        placeholder="Leave blank for public access"
                    />
                </div>
                <div className="flex gap-2 pt-2">
                    <button 
                        type="button" 
                        onClick={() => setView('list')}
                        className="flex-1 bg-transparent border border-auspex-border text-text-secondary text-sm font-bold uppercase py-2 rounded hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 bg-imperial-gold text-black font-bold uppercase py-2 rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Initializing...' : 'Initialize'}
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default LeagueAuth;