
import { ESPNTeam, TeamWithConference, ScoutingReport } from "./index";

/**
 * Mock data to use when ESPN API is unavailable
 */

// Mock NBA Teams
export const mockNBATeams: Record<string, TeamWithConference[]> = {
  "Eastern Conference": [
    {
      id: "1",
      uid: "s:40~l:46~t:1",
      slug: "boston-celtics",
      location: "Boston",
      name: "Celtics",
      abbreviation: "BOS",
      displayName: "Boston Celtics",
      shortDisplayName: "Celtics",
      color: "007A33",
      alternateColor: "BA9653",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
      conference: { id: "1", name: "Eastern Conference", shortName: "East" },
      division: "Atlantic",
      record: "64-18"
    },
    {
      id: "2",
      uid: "s:40~l:46~t:2",
      slug: "brooklyn-nets",
      location: "Brooklyn",
      name: "Nets",
      abbreviation: "BKN",
      displayName: "Brooklyn Nets",
      shortDisplayName: "Nets",
      color: "000000",
      alternateColor: "FFFFFF",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png",
      conference: { id: "1", name: "Eastern Conference", shortName: "East" },
      division: "Atlantic",
      record: "32-50"
    },
    {
      id: "4",
      uid: "s:40~l:46~t:4",
      slug: "chicago-bulls",
      location: "Chicago",
      name: "Bulls",
      abbreviation: "CHI",
      displayName: "Chicago Bulls",
      shortDisplayName: "Bulls",
      color: "CE1141",
      alternateColor: "000000",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
      conference: { id: "1", name: "Eastern Conference", shortName: "East" },
      division: "Central",
      record: "39-43"
    }
  ],
  "Western Conference": [
    {
      id: "8",
      uid: "s:40~l:46~t:8",
      slug: "denver-nuggets",
      location: "Denver",
      name: "Nuggets",
      abbreviation: "DEN",
      displayName: "Denver Nuggets",
      shortDisplayName: "Nuggets",
      color: "0E2240",
      alternateColor: "FEC524",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png",
      conference: { id: "2", name: "Western Conference", shortName: "West" },
      division: "Northwest",
      record: "57-25"
    },
    {
      id: "9",
      uid: "s:40~l:46~t:9",
      slug: "golden-state-warriors",
      location: "Golden State",
      name: "Warriors",
      abbreviation: "GSW",
      displayName: "Golden State Warriors",
      shortDisplayName: "Warriors",
      color: "1D428A",
      alternateColor: "FFC72C",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png",
      conference: { id: "2", name: "Western Conference", shortName: "West" },
      division: "Pacific",
      record: "46-36"
    }
  ]
};

// Mock NCAA Teams
export const mockNCAATeams: Record<string, TeamWithConference[]> = {
  "ACC": [
    {
      id: "120",
      uid: "s:40~l:41~t:120",
      slug: "duke-blue-devils",
      location: "Duke",
      name: "Blue Devils",
      abbreviation: "DUKE",
      displayName: "Duke Blue Devils",
      shortDisplayName: "Duke",
      color: "0736A4",
      alternateColor: "FFFFFF",
      logo: "https://a.espncdn.com/i/teamlogos/ncaa/500/150.png",
      conference: { id: "1", name: "ACC", shortName: "ACC" },
      record: "27-9"
    },
    {
      id: "153",
      uid: "s:40~l:41~t:153",
      slug: "florida-state-seminoles",
      location: "Florida State",
      name: "Seminoles",
      abbreviation: "FSU",
      displayName: "Florida State Seminoles",
      shortDisplayName: "Florida St",
      color: "782F40",
      alternateColor: "CEB888",
      logo: "https://a.espncdn.com/i/teamlogos/ncaa/500/52.png",
      conference: { id: "1", name: "ACC", shortName: "ACC" },
      record: "17-16"
    }
  ],
  "Big 12": [
    {
      id: "239",
      uid: "s:40~l:41~t:239",
      slug: "kansas-jayhawks",
      location: "Kansas",
      name: "Jayhawks",
      abbreviation: "KU",
      displayName: "Kansas Jayhawks",
      shortDisplayName: "Kansas",
      color: "0051BA",
      alternateColor: "E8000D",
      logo: "https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png",
      conference: { id: "2", name: "Big 12", shortName: "Big 12" },
      record: "23-11"
    },
    {
      id: "251",
      uid: "s:40~l:41~t:251",
      slug: "houston-cougars",
      location: "Houston",
      name: "Cougars",
      abbreviation: "HOU",
      displayName: "Houston Cougars",
      shortDisplayName: "Houston",
      color: "C8102E",
      alternateColor: "7E878C",
      logo: "https://a.espncdn.com/i/teamlogos/ncaa/500/248.png",
      conference: { id: "2", name: "Big 12", shortName: "Big 12" },
      record: "32-5"
    }
  ]
};

// Mock WNBA Teams
export const mockWNBATeams: Record<string, TeamWithConference[]> = {
  "All Teams": [
    {
      id: "15",
      uid: "s:40~l:59~t:15",
      slug: "las-vegas-aces",
      location: "Las Vegas",
      name: "Aces",
      abbreviation: "LV",
      displayName: "Las Vegas Aces",
      shortDisplayName: "Aces",
      color: "000000",
      alternateColor: "BA0C2F",
      logo: "https://a.espncdn.com/i/teamlogos/wnba/500/lv.png",
      record: "34-6"
    },
    {
      id: "14",
      uid: "s:40~l:59~t:14",
      slug: "new-york-liberty",
      location: "New York",
      name: "Liberty",
      abbreviation: "NY",
      displayName: "New York Liberty",
      shortDisplayName: "Liberty",
      color: "5930BB",
      alternateColor: "2A702C",
      logo: "https://a.espncdn.com/i/teamlogos/wnba/500/ny.png",
      record: "32-8"
    }
  ]
};

// Mock scouting report for a team
export const mockScoutingReport: ScoutingReport = {
  id: "1",
  teamName: "Boston Celtics",
  displayName: "Boston Celtics",
  color: "007A33",
  alternateColor: "BA9653",
  logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
  conference: "Eastern Conference",
  division: "Atlantic",
  record: "64-18",
  strengths: [
    "Elite 3-point shooting",
    "Versatile defensive lineup",
    "Strong coaching system"
  ],
  weaknesses: [
    "Rebounding inconsistency",
    "Bench depth in certain matchups"
  ],
  offensiveStyle: "Pace and space with heavy 3-point volume",
  defensiveStyle: "Switching defense with versatile wings",
  keyStats: [
    { name: "3PT%", value: "38.5%", trend: "up" },
    { name: "Defensive Rating", value: "110.6", trend: "up" },
    { name: "Assists Per Game", value: "26.4", trend: "neutral" }
  ],
  coach: {
    name: "Joe Mazzulla",
    experience: "2nd season",
    background: "Former assistant who emphasizes analytics and spacing"
  },
  summary: {
    overview: "The Celtics are an elite team built around perimeter play and defensive versatility. Their combination of shooting, defensive switching, and coaching gives them advantages against most opponents.",
    gameplan: "They spread the floor with multiple shooters and use off-ball movement to create open looks. Defensively, they switch nearly everything and use their length to disrupt passing lanes.",
    starPlayers: ["Jayson Tatum", "Jaylen Brown", "Jrue Holiday"]
  },
  playerStats: [
    {
      id: "1001",
      name: "Jayson Tatum",
      position: "SF",
      number: "0",
      stats: {
        ppg: "27.6",
        rpg: "8.1",
        apg: "4.9",
        spg: "1.0",
        bpg: "0.5",
        fgp: "47.1%",
        tpp: "37.5%",
        ftp: "83.3%"
      },
      strengths: ["Three-level scorer", "Improving playmaker", "Defensive versatility"],
      weaknesses: ["Can settle for tough shots", "Turnover prone in traffic"],
      headshot: "https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4065648.png"
    },
    {
      id: "1002",
      name: "Jaylen Brown",
      position: "SG",
      number: "7",
      stats: {
        ppg: "23.0",
        rpg: "5.5",
        apg: "3.5",
        spg: "1.2",
        bpg: "0.5",
        fgp: "49.9%",
        tpp: "35.4%",
        ftp: "70.5%"
      },
      strengths: ["Explosive athleticism", "Improved ball-handling", "On-ball defense"],
      weaknesses: ["Free throw consistency", "Playmaking in traffic"],
      headshot: "https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3917376.png"
    }
  ]
};
