import React, { useState, useEffect } from 'react';
import { LeagueSettings } from '../types';

interface LeagueSettingsManagerProps {
  settings: LeagueSettings;
  onUpdateSettings: (settings: LeagueSettings) => void;
  onDeleteLeague: (password: string) => void;
}

const LeagueSettingsManager: React.FC<LeagueSettingsManagerProps> = ({ settings, onUpdateSettings, onDeleteLeague }) => {
  const [localSettings, setLocalSettings] = useState<LeagueSettings>(settings);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Sync prop changes to local state
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    // Visual feedback handled by app state or could add toast here
  };

  const handleEscalationPointChange = (index: number, value: string) => {
    const newPoints = [...localSettings.escalationPoints];
    newPoints[index] = parseInt(value) || 0;
    setLocalSettings({ ...localSettings, escalationPoints: newPoints });
  };

  const addWeek = () => {
    const lastPoint = localSettings.escalationPoints[localSettings.escalationPoints.length - 1] || 1000;
    setLocalSettings({
        ...localSettings,
        escalationPoints: [...localSettings.escalationPoints, lastPoint]
    });
  };

  const removeWeek = () => {
    if (localSettings.escalationPoints.length <= 1) return;
    setLocalSettings({
        ...localSettings,
        escalationPoints: localSettings.escalationPoints.slice(0, -1)
    });
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onDeleteLeague(deletePassword);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      
      {/* Campaign Configuration */}
      <div className="bg-auspex-panel border border-auspex-border rounded-lg overflow-hidden shadow-xl">
        <div className="bg-black/30 px-6 py-4 border-b border-auspex-border flex justify-between items-center">
             <h2 className="text-xl font-bold text-imperial-gold uppercase tracking-widest flex items-center gap-2">
                <span className="text-xl">⚙️</span> Campaign Logistics
             </h2>
             <span className="text-xs text-text-secondary font-mono">SECTOR CONFIGURATION</span>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Campaign Name</label>
                    <input 
                        type="text" 
                        value={localSettings.name}
                        onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})}
                        className="w-full bg-black/50 border border-gray-600 text-white rounded p-3 focus:border-imperial-gold outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Current Phase (Week)</label>
                    <div className="flex items-center gap-4">
                        <button 
                            type="button"
                            onClick={() => setLocalSettings(prev => ({...prev, currentWeek: Math.max(1, prev.currentWeek - 1)}))}
                            className="bg-auspex-border hover:bg-gray-600 text-white px-3 py-2 rounded font-bold"
                        >
                            -
                        </button>
                        <span className="text-2xl font-mono font-bold text-imperial-gold w-12 text-center">{localSettings.currentWeek}</span>
                        <button 
                            type="button"
                            onClick={() => setLocalSettings(prev => ({...prev, currentWeek: prev.currentWeek + 1}))}
                            className="bg-auspex-border hover:bg-gray-600 text-white px-3 py-2 rounded font-bold"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* Escalation Points */}
            <div className="border-t border-white/5 pt-6">
                 <div className="flex justify-between items-end mb-4">
                    <label className="block text-xs font-bold text-text-secondary uppercase">Muster Limits (Points per Week)</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={removeWeek} className="text-xs text-red-400 hover:text-red-300 uppercase font-bold">[ - Remove Week ]</button>
                        <button type="button" onClick={addWeek} className="text-xs text-green-400 hover:text-green-300 uppercase font-bold">[ + Add Week ]</button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {localSettings.escalationPoints.map((points, idx) => (
                        <div key={idx} className={`relative group p-3 rounded border ${idx + 1 === localSettings.currentWeek ? 'bg-imperial-gold/10 border-imperial-gold' : 'bg-black/20 border-gray-700'}`}>
                            <span className="absolute top-1 left-2 text-[10px] text-gray-500 font-mono uppercase">Week {idx + 1}</span>
                            <input 
                                type="number"
                                value={points}
                                onChange={(e) => handleEscalationPointChange(idx, e.target.value)}
                                className="w-full bg-transparent text-right text-lg font-mono font-bold text-white focus:outline-none mt-2"
                            />
                            <span className="absolute bottom-2 right-8 text-xs text-gray-600">pts</span>
                        </div>
                    ))}
                 </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    className="bg-imperial-gold text-black font-bold uppercase px-8 py-3 rounded hover:bg-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
                >
                    Save Configuration
                </button>
            </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/10 border border-red-900/50 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-red-900/30 flex justify-between items-center">
             <h2 className="text-lg font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                ⚠️ Exterminatus Protocols
             </h2>
        </div>
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
                <p>Execute Exterminatus to permanently purge this campaign data from the archives.</p>
                <p className="text-red-400 text-xs mt-1">This action cannot be undone by any authority.</p>
            </div>
            
            {!isDeleteConfirmOpen ? (
                <button 
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="bg-transparent border border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-6 py-2 rounded uppercase font-bold text-sm transition-all"
                >
                    Initiate Purge
                </button>
            ) : (
                <form onSubmit={handleDeleteSubmit} className="flex flex-col gap-2 w-full md:w-auto animate-fade-in bg-black/50 p-4 rounded border border-red-900">
                    <label className="text-xs text-red-400 uppercase font-bold">Clearance Code Required</label>
                    <input 
                        type="password" 
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="bg-black border border-red-900 text-red-500 rounded px-2 py-1 outline-none focus:border-red-500 text-sm"
                        placeholder="Enter Campaign Password"
                        autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                         <button 
                            type="button"
                            onClick={() => {
                                setIsDeleteConfirmOpen(false);
                                setDeletePassword('');
                            }}
                            className="flex-1 bg-gray-800 text-gray-400 text-xs uppercase py-1.5 rounded hover:bg-gray-700"
                        >
                            Abort
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 bg-red-600 text-white text-xs font-bold uppercase py-1.5 rounded hover:bg-red-500"
                        >
                            Confirm Purge
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>

    </div>
  );
};

export default LeagueSettingsManager;