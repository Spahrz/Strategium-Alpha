import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MatchReporter from './components/MatchReporter';
import PlayerManager from './components/PlayerManager';
import Pairings from './components/Pairings';
import LeagueAuth from './components/LeagueAuth';
import { Player, Match, LeagueSettings, Pairing, Faction } from './types';
import { 
  getPlayers, savePlayers, 
  getMatches, saveMatches, 
  getSettings, saveSettings,
  getPairings, savePairings,
  recalculateStandings,
  exportLeagueData
} from './services/storageService';

function App() {
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [settings, setSettings] = useState<LeagueSettings | null>(null);
  
  const [matchReportInitialData, setMatchReportInitialData] = useState<Partial<Match> | null>(null);

  // Load Data whenever activeLeagueId changes
  useEffect(() => {
    if (!activeLeagueId) return;

    const loadedPlayers = getPlayers(activeLeagueId);
    const loadedMatches = getMatches(activeLeagueId);
    const loadedSettings = getSettings(activeLeagueId);
    const loadedPairings = getPairings(activeLeagueId);

    const updatedPlayers = recalculateStandings(loadedPlayers, loadedMatches);
    
    setPlayers(updatedPlayers);
    setMatches(loadedMatches);
    setSettings(loadedSettings);
    setPairings(loadedPairings);
    
    // Default tab
    setActiveTab('dashboard');
  }, [activeLeagueId]);

  // --- Players Handlers ---

  const handleAddPlayer = (name: string, faction: Faction) => {
    if (!activeLeagueId) return;
    const newPlayer: Player = {
        id: Date.now().toString(),
        leagueId: activeLeagueId,
        name,
        faction,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        paintingPoints: 0,
        gamingPoints: 0,
        totalPoints: 0
    };
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    savePlayers(activeLeagueId, updatedPlayers);
  };

  const handleRemovePlayer = (id: string) => {
    if (!activeLeagueId) return;
    const updatedPlayers = players.filter(p => p.id !== id);
    setPlayers(updatedPlayers);
    savePlayers(activeLeagueId, updatedPlayers);
  };

  const handleUpdatePainting = (playerId: string, points: number) => {
    if (!activeLeagueId) return;
    const updatedPlayers = players.map(p => 
      p.id === playerId ? { ...p, paintingPoints: points, totalPoints: p.gamingPoints + points } : p
    ).sort((a, b) => b.totalPoints - a.totalPoints);

    setPlayers(updatedPlayers);
    savePlayers(activeLeagueId, updatedPlayers);
  };

  // --- Pairings Handlers ---

  const handleAddPairing = (p1Id: string, p2Id: string, mission: string) => {
      if (!settings || !activeLeagueId) return;
      const newPairing: Pairing = {
          id: Date.now().toString(),
          leagueId: activeLeagueId,
          player1Id: p1Id,
          player2Id: p2Id,
          mission,
          week: settings.currentWeek,
          completed: false
      };
      const updatedPairings = [...pairings, newPairing];
      setPairings(updatedPairings);
      savePairings(activeLeagueId, updatedPairings);
  };

  const handleInitiateReport = (pairing: Pairing) => {
      setMatchReportInitialData({
          player1Id: pairing.player1Id,
          player2Id: pairing.player2Id,
          mission: pairing.mission,
          id: pairing.id 
      });
      setActiveTab('matches');
  };

  // --- Match Handlers ---

  const handleReportMatch = (match: Match) => {
    if (!activeLeagueId) return;
    
    // Ensure league ID is set
    match.leagueId = activeLeagueId;

    const newMatches = [...matches, match];
    setMatches(newMatches);
    saveMatches(activeLeagueId, newMatches);

    const updatedPairings = pairings.map(p => 
        p.id === match.id ? { ...p, completed: true } : p
    );
    setPairings(updatedPairings);
    savePairings(activeLeagueId, updatedPairings);

    const updatedPlayers = recalculateStandings(players, newMatches);
    setPlayers(updatedPlayers);
    savePlayers(activeLeagueId, updatedPlayers);
    
    setMatchReportInitialData(null);
  };

  const handleExport = () => {
      if (!activeLeagueId) return;
      const json = exportLeagueData(activeLeagueId);
      navigator.clipboard.writeText(json).then(() => {
          alert("League Data copied to clipboard! Share this JSON string with your friends so they can import it.");
      });
  };

  const handleLogout = () => {
      setActiveLeagueId(null);
  };

  if (!activeLeagueId) {
      return <LeagueAuth onLeagueSelected={setActiveLeagueId} />;
  }

  if (!settings) return <div className="bg-auspex-bg min-h-screen text-white flex items-center justify-center">Loading Strategium...</div>;

  return (
    <div className="relative">
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'dashboard' && (
            <div className="space-y-4">
                <div className="flex justify-end gap-2">
                     <button onClick={handleExport} className="text-xs text-imperial-gold border border-imperial-gold px-2 py-1 rounded hover:bg-imperial-gold hover:text-black">
                        Export Data
                    </button>
                    <button onClick={handleLogout} className="text-xs text-text-secondary border border-text-secondary px-2 py-1 rounded hover:bg-white/10">
                        Switch League
                    </button>
                </div>
                <Dashboard 
                    players={players} 
                    settings={settings}
                    onUpdatePainting={handleUpdatePainting}
                />
            </div>
        )}
        {activeTab === 'pairings' && (
            <Pairings 
                players={players}
                pairings={pairings}
                currentWeek={settings.currentWeek}
                onAddPairing={handleAddPairing}
                onReportResult={handleInitiateReport}
            />
        )}
        {activeTab === 'matches' && (
            <MatchReporter 
            players={players} 
            matches={matches} 
            currentWeek={settings.currentWeek}
            onReportMatch={handleReportMatch}
            initialMatchData={matchReportInitialData}
            />
        )}
        {activeTab === 'roster' && (
            <PlayerManager 
                players={players}
                onAddPlayer={handleAddPlayer}
                onRemovePlayer={handleRemovePlayer}
            />
        )}
        </Layout>
    </div>
  );
}

export default App;