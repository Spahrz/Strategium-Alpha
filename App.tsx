import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MatchReporter from './components/MatchReporter';
import PlayerManager from './components/PlayerManager';
import Pairings from './components/Pairings';
import LeagueAuth from './components/LeagueAuth';
import FirebaseSetup from './components/FirebaseSetup';
import LeagueSettingsManager from './components/LeagueSettingsManager';
import { Player, Match, LeagueSettings, Pairing, Faction } from './types';
import { 
  subscribeToPlayers, addPlayerToLeague, updatePlayer, removePlayer,
  subscribeToMatches, addMatch,
  subscribeToSettings, updateSettings, deleteLeague, getLeague,
  subscribeToPairings, addPairing, updatePairing,
  recalculateStandings
} from './services/storageService';
import { isFirebaseInitialized } from './services/firebase';

function App() {
  const [isFirebaseReady, setIsFirebaseReady] = useState(isFirebaseInitialized());
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State
  const [rawPlayers, setRawPlayers] = useState<Player[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [settings, setSettings] = useState<LeagueSettings | null>(null);
  
  const [matchReportInitialData, setMatchReportInitialData] = useState<Partial<Match> | null>(null);

  // --- Real-time Subscriptions ---
  useEffect(() => {
    if (!activeLeagueId || !isFirebaseReady) return;

    setRawPlayers([]);
    setMatches([]);
    setPairings([]);
    setSettings(null);

    const unsubSettings = subscribeToSettings(activeLeagueId, setSettings);
    const unsubPlayers = subscribeToPlayers(activeLeagueId, setRawPlayers);
    const unsubMatches = subscribeToMatches(activeLeagueId, setMatches);
    const unsubPairings = subscribeToPairings(activeLeagueId, setPairings);

    return () => {
        unsubSettings();
        unsubPlayers();
        unsubMatches();
        unsubPairings();
    };
  }, [activeLeagueId, isFirebaseReady]);

  // Recalculate Standings
  useEffect(() => {
    if (rawPlayers.length > 0 || matches.length > 0) {
        setPlayers(recalculateStandings(rawPlayers, matches));
    } else {
        setPlayers([]);
    }
  }, [rawPlayers, matches]);

  // --- Handlers ---

  const handleAddPlayer = async (name: string, faction: Faction) => {
    if (!activeLeagueId) return;
    try {
        await addPlayerToLeague(activeLeagueId, {
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
        });
    } catch (e) { console.error(e); }
  };

  const handleRemovePlayer = async (id: string) => {
    if (!activeLeagueId) return;
    try { await removePlayer(activeLeagueId, id); } catch (e) { console.error(e); }
  };

  const handleUpdatePainting = async (playerId: string, points: number) => {
    if (!activeLeagueId) return;
    try { await updatePlayer(activeLeagueId, playerId, { paintingPoints: points }); } catch (e) { console.error(e); }
  };

  const handleAddPairing = async (p1Id: string, p2Id: string, mission: string) => {
      if (!settings || !activeLeagueId) return;
      try {
          await addPairing(activeLeagueId, {
              id: Date.now().toString(),
              leagueId: activeLeagueId,
              player1Id: p1Id,
              player2Id: p2Id,
              mission,
              week: settings.currentWeek,
              completed: false
          });
      } catch (e) { console.error(e); }
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

  const handleReportMatch = async (match: Match) => {
    if (!activeLeagueId) return;
    match.leagueId = activeLeagueId;

    try {
        await addMatch(activeLeagueId, match);
        const specificPairing = pairings.find(p => p.id === match.id);
        const pairing = pairings.find(p => 
            p.week === match.week && 
            ((p.player1Id === match.player1Id && p.player2Id === match.player2Id) || 
             (p.player1Id === match.player2Id && p.player2Id === match.player1Id))
        );

        if (specificPairing) {
            await updatePairing(activeLeagueId, specificPairing.id, { completed: true });
        } else if (pairing) {
            await updatePairing(activeLeagueId, pairing.id, { completed: true });
        }
        setMatchReportInitialData(null);
    } catch (e) { console.error(e); }
  };

  const handleUpdateSettings = async (newSettings: LeagueSettings) => {
    if (!activeLeagueId) return;
    try {
      await updateSettings(activeLeagueId, newSettings);
    } catch (e) { console.error("Failed to update settings", e); }
  };

  const handleDeleteLeague = async (passwordAttempt: string) => {
    if (!activeLeagueId) return;
    try {
      const league = await getLeague(activeLeagueId);
      if (!league) return;

      if (league.password && league.password !== passwordAttempt) {
        alert("Incorrect Clearance Code. Exterminatus Denied.");
        return;
      }
      
      // If password matches or no password exists
      if (confirm("Are you absolutely sure you want to delete this campaign? This action is irreversible.")) {
        await deleteLeague(activeLeagueId);
        setActiveLeagueId(null);
      }
    } catch (e) {
      console.error("Failed to delete league", e);
      alert("An error occurred during purge protocols.");
    }
  };

  const handleExport = () => {
    if (!activeLeagueId) return;
    alert("Full JSON export is limited in cloud mode. Please use the dashboard to view data.");
  };

  const handleLogout = () => {
      setActiveLeagueId(null);
  };

  // --- Views ---

  if (!isFirebaseReady) {
      return <FirebaseSetup onConfigured={() => setIsFirebaseReady(true)} />;
  }

  if (!activeLeagueId) {
      return (
          <LeagueAuth onLeagueSelected={setActiveLeagueId} />
      );
  }

  if (!settings) return (
      <div className="bg-auspex-bg min-h-screen text-imperial-gold flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-imperial-gold border-t-transparent rounded-full animate-spin"></div>
          <div className="uppercase tracking-widest font-bold">Establishing Vox Link...</div>
      </div>
  );

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
        {activeTab === 'admin' && (
            <LeagueSettingsManager 
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onDeleteLeague={handleDeleteLeague}
            />
        )}
        </Layout>
    </div>
  );
}

export default App;