import { Player, Match, LeagueSettings, Pairing, League } from "../types";
import { DEFAULT_ESCALATION_POINTS } from "../constants";

const LEAGUES_KEY = "strategium_leagues";
const DATA_PREFIX = "strategium_data_";

// --- League Management ---

export const getLeagues = (): League[] => {
  const stored = localStorage.getItem(LEAGUES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveLeagues = (leagues: League[]) => {
  localStorage.setItem(LEAGUES_KEY, JSON.stringify(leagues));
};

export const createLeague = (name: string, password?: string): League => {
  const leagues = getLeagues();
  const newLeague: League = {
    id: Date.now().toString(),
    name,
    password,
    settings: {
        name,
        startDate: new Date().toISOString(),
        currentWeek: 1,
        escalationPoints: DEFAULT_ESCALATION_POINTS
    }
  };
  saveLeagues([...leagues, newLeague]);
  return newLeague;
};

// --- Scoped Data Management ---

interface LeagueData {
    players: Player[];
    matches: Match[];
    pairings: Pairing[];
}

const getLeagueData = (leagueId: string): LeagueData => {
    const stored = localStorage.getItem(`${DATA_PREFIX}${leagueId}`);
    return stored ? JSON.parse(stored) : { players: [], matches: [], pairings: [] };
};

const saveLeagueData = (leagueId: string, data: LeagueData) => {
    localStorage.setItem(`${DATA_PREFIX}${leagueId}`, JSON.stringify(data));
};

export const getPlayers = (leagueId: string): Player[] => {
    return getLeagueData(leagueId).players;
};

export const savePlayers = (leagueId: string, players: Player[]) => {
    const data = getLeagueData(leagueId);
    data.players = players;
    saveLeagueData(leagueId, data);
};

export const getMatches = (leagueId: string): Match[] => {
    return getLeagueData(leagueId).matches;
};

export const saveMatches = (leagueId: string, matches: Match[]) => {
    const data = getLeagueData(leagueId);
    data.matches = matches;
    saveLeagueData(leagueId, data);
};

export const getPairings = (leagueId: string): Pairing[] => {
    return getLeagueData(leagueId).pairings;
};

export const savePairings = (leagueId: string, pairings: Pairing[]) => {
    const data = getLeagueData(leagueId);
    data.pairings = pairings;
    saveLeagueData(leagueId, data);
};

export const getSettings = (leagueId: string): LeagueSettings | null => {
   const leagues = getLeagues();
   const league = leagues.find(l => l.id === leagueId);
   return league ? league.settings : null;
};

export const saveSettings = (leagueId: string, settings: LeagueSettings) => {
    const leagues = getLeagues();
    const idx = leagues.findIndex(l => l.id === leagueId);
    if (idx !== -1) {
        leagues[idx].settings = settings;
        saveLeagues(leagues);
    }
};

// --- Import/Export ---

export const exportLeagueData = (leagueId: string): string => {
    const data = getLeagueData(leagueId);
    const settings = getSettings(leagueId);
    return JSON.stringify({ settings, data });
}

export const importLeagueData = (jsonString: string, name: string, password?: string): League | null => {
    try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.settings || !parsed.data) return null;
        
        const newLeague = createLeague(name, password);
        // Override settings
        saveSettings(newLeague.id, parsed.settings);
        // Override data (and fix IDs to match new league if we wanted to be strict, but we'll trust the import for now, actually we should update leagueId in entities)
        const importedData = parsed.data as LeagueData;
        
        // Fix up league IDs in the imported data to match the new container
        importedData.players.forEach(p => p.leagueId = newLeague.id);
        importedData.matches.forEach(m => m.leagueId = newLeague.id);
        importedData.pairings.forEach(p => p.leagueId = newLeague.id);

        saveLeagueData(newLeague.id, importedData);
        return newLeague;
    } catch (e) {
        console.error("Import failed", e);
        return null;
    }
}

// Helper to recalculate scores based on match history
export const recalculateStandings = (players: Player[], matches: Match[]): Player[] => {
  const newPlayers = players.map(p => ({
    ...p,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    gamingPoints: 0,
    // totalPoints is calculated at the end
  }));

  matches.forEach(m => {
    const p1 = newPlayers.find(p => p.id === m.player1Id);
    const p2 = newPlayers.find(p => p.id === m.player2Id);

    if (p1 && p2) {
      p1.gamesPlayed += 1;
      p2.gamesPlayed += 1;

      if (m.winnerId === p1.id) {
        p1.wins += 1;
        p1.gamingPoints += 3; // Standard 3 points for win
        p2.losses += 1;
        p2.gamingPoints += 1; // 1 point for loss (attendance)
      } else if (m.winnerId === p2.id) {
        p2.wins += 1;
        p2.gamingPoints += 3;
        p1.losses += 1;
        p1.gamingPoints += 1;
      } else {
        // Draw
        p1.draws += 1;
        p2.draws += 1;
        p1.gamingPoints += 2; // 2 points for draw
        p2.gamingPoints += 2;
      }
    }
  });

  return newPlayers.map(p => ({
    ...p,
    totalPoints: p.gamingPoints + p.paintingPoints
  })).sort((a, b) => b.totalPoints - a.totalPoints);
};