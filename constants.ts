import { Faction } from "./types";

export const FACTION_LIST = Object.values(Faction);

export const DEFAULT_ESCALATION_POINTS = [
  500,  // Combat Patrol
  750,  // Enhanced Patrol
  1000, // Incursion
  1250, // Strike Force Light
  1500, // Strike Force
  2000  // Strike Force (Tournament Standard)
];

export const MISSIONS = [
  "Take and Hold",
  "Supply Drop",
  "Purge the Foe",
  "Land Ground",
  "The Ritual",
  "Priority Targets",
  "Sites of Power",
  "Scorched Earth"
];

export const DUMMY_PLAYERS = [
  {
    id: "p1",
    name: "Inquisitor Valerius",
    faction: Faction.SPACE_MARINES,
    gamesPlayed: 3,
    wins: 2,
    losses: 1,
    draws: 0,
    paintingPoints: 15,
    gamingPoints: 20,
    totalPoints: 35
  },
  {
    id: "p2",
    name: "Warboss Gorksmash",
    faction: Faction.ORKS,
    gamesPlayed: 3,
    wins: 1,
    losses: 2,
    draws: 0,
    paintingPoints: 30, // He painted a Stompa
    gamingPoints: 10,
    totalPoints: 40
  },
  {
    id: "p3",
    name: "Overlord Xanthek",
    faction: Faction.NECRONS,
    gamesPlayed: 2,
    wins: 2,
    losses: 0,
    draws: 0,
    paintingPoints: 10,
    gamingPoints: 20,
    totalPoints: 30
  }
];