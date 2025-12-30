import { getDb } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from "firebase/firestore";
import { Player, Match, LeagueSettings, Pairing, League } from "../types";
import { DEFAULT_ESCALATION_POINTS } from "../constants";

// --- Helpers ---

export const recalculateStandings = (players: Player[], matches: Match[]): Player[] => {
  const newPlayers = players.map(p => ({
    ...p,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    gamingPoints: 0,
  }));

  matches.forEach(m => {
    const p1 = newPlayers.find(p => p.id === m.player1Id);
    const p2 = newPlayers.find(p => p.id === m.player2Id);

    if (p1 && p2) {
      p1.gamesPlayed += 1;
      p2.gamesPlayed += 1;

      if (m.winnerId === p1.id) {
        p1.wins += 1;
        p1.gamingPoints += 3;
        p2.losses += 1;
        p2.gamingPoints += 1;
      } else if (m.winnerId === p2.id) {
        p2.wins += 1;
        p2.gamingPoints += 3;
        p1.losses += 1;
        p1.gamingPoints += 1;
      } else {
        p1.draws += 1;
        p2.draws += 1;
        p1.gamingPoints += 2;
        p2.gamingPoints += 2;
      }
    }
  });

  return newPlayers.map(p => ({
    ...p,
    totalPoints: p.gamingPoints + p.paintingPoints
  })).sort((a, b) => b.totalPoints - a.totalPoints);
};

// --- League Management ---

export const getLeagues = async (): Promise<League[]> => {
  const q = query(collection(getDb(), "leagues"), orderBy("name"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) } as League));
};

export const getLeague = async (id: string): Promise<League | null> => {
    const d = await getDoc(doc(getDb(), "leagues", id));
    if (d.exists()) {
        return { id: d.id, ...(d.data() as DocumentData) } as League;
    }
    return null;
};

export const createLeague = async (name: string, password?: string): Promise<League> => {
  const settings: LeagueSettings = {
    name,
    startDate: new Date().toISOString(),
    currentWeek: 1,
    escalationPoints: DEFAULT_ESCALATION_POINTS
  };

  const docRef = await addDoc(collection(getDb(), "leagues"), {
    name,
    password: password || "",
    settings
  });

  return {
    id: docRef.id,
    name,
    password,
    settings
  };
};

export const subscribeToSettings = (leagueId: string, callback: (settings: LeagueSettings) => void) => {
    return onSnapshot(doc(getDb(), "leagues", leagueId), (docSnapshot: DocumentSnapshot<DocumentData>) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data() as any;
            if (data && data.settings) {
                callback(data.settings as LeagueSettings);
            }
        }
    });
};

export const updateSettings = async (leagueId: string, settings: LeagueSettings) => {
    const leagueRef = doc(getDb(), "leagues", leagueId);
    await updateDoc(leagueRef, { settings });
};

export const deleteLeague = async (leagueId: string) => {
    // Note: In a production environment with Firebase Functions, we would recursively delete subcollections.
    // For this client-side implementation, deleting the parent document effectively "hides" the data 
    // from the app navigation, which serves the purpose for this tool.
    await deleteDoc(doc(getDb(), "leagues", leagueId));
};

// --- Player Management ---

export const subscribeToPlayers = (leagueId: string, callback: (players: Player[]) => void) => {
    const q = query(collection(getDb(), "leagues", leagueId, "players"));
    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const players = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) } as Player));
        callback(players);
    });
};

export const addPlayerToLeague = async (leagueId: string, player: Omit<Player, "id">) => {
    await addDoc(collection(getDb(), "leagues", leagueId, "players"), player);
};

export const updatePlayer = async (leagueId: string, playerId: string, updates: Partial<Player>) => {
    await updateDoc(doc(getDb(), "leagues", leagueId, "players", playerId), updates);
};

export const removePlayer = async (leagueId: string, playerId: string) => {
    await deleteDoc(doc(getDb(), "leagues", leagueId, "players", playerId));
};

// --- Match Management ---

export const subscribeToMatches = (leagueId: string, callback: (matches: Match[]) => void) => {
    const q = query(collection(getDb(), "leagues", leagueId, "matches"));
    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const matches = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) } as Match));
        callback(matches);
    });
};

export const addMatch = async (leagueId: string, match: Match) => {
    await setDoc(doc(getDb(), "leagues", leagueId, "matches", match.id), match);
};

// --- Pairings Management ---

export const subscribeToPairings = (leagueId: string, callback: (pairings: Pairing[]) => void) => {
    const q = query(collection(getDb(), "leagues", leagueId, "pairings"));
    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const pairings = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) } as Pairing));
        callback(pairings);
    });
};

export const addPairing = async (leagueId: string, pairing: Pairing) => {
    await setDoc(doc(getDb(), "leagues", leagueId, "pairings", pairing.id), pairing);
};

export const updatePairing = async (leagueId: string, pairingId: string, updates: Partial<Pairing>) => {
    await updateDoc(doc(getDb(), "leagues", leagueId, "pairings", pairingId), updates);
};