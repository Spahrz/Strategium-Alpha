export enum Faction {
  SPACE_MARINES = "Adeptus Astartes",
  ASTRA_MILITARUM = "Astra Militarum",
  ADEPTUS_MECHANICUS = "Adeptus Mechanicus",
  ADEPTUS_CUSTODES = "Adeptus Custodes",
  IMPERIAL_KNIGHTS = "Imperial Knights",
  CHAOS_SPACE_MARINES = "Chaos Space Marines",
  WORLD_EATERS = "World Eaters",
  THOUSAND_SONS = "Thousand Sons",
  DEATH_GUARD = "Death Guard",
  CHAOS_DAEMONS = "Chaos Daemons",
  CHAOS_KNIGHTS = "Chaos Knights",
  AELDARI = "Aeldari",
  DRUKHARI = "Drukhari",
  NECRONS = "Necrons",
  ORKS = "Orks",
  TAU_EMPIRE = "T'au Empire",
  TYRANIDS = "Tyranids",
  GENESTEALER_CULTS = "Genestealer Cults",
  LEAGUES_OF_VOTANN = "Leagues of Votann",
  GREY_KNIGHTS = "Grey Knights",
  SISTERS_OF_BATTLE = "Adepta Sororitas"
}

export interface League {
  id: string;
  name: string;
  password?: string; // Optional password for access
  settings: LeagueSettings;
}

export interface Player {
  id: string;
  leagueId: string;
  name: string;
  faction: Faction;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  paintingPoints: number; // 0-10 per model/unit completed
  gamingPoints: number; // League specific scoring
  totalPoints: number;
}

export interface Match {
  id: string;
  leagueId: string;
  date: string;
  player1Id: string;
  player2Id: string;
  player1Score: number;
  player2Score: number;
  mission: string;
  pointsLimit: number;
  winnerId: string | null; // null for draw
  narrative?: string; // AI Generated Battle Report
  week: number;
}

export interface Pairing {
  id: string;
  leagueId: string;
  player1Id: string;
  player2Id: string;
  mission?: string;
  week: number;
  completed: boolean;
}

export interface LeagueSettings {
  name: string;
  startDate: string;
  currentWeek: number;
  escalationPoints: number[]; // e.g. [500, 750, 1000, 1500, 2000]
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}