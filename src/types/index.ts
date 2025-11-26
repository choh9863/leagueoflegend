// 사용자 타입
export interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  discordId: string;
  createdAt: string;
  updatedAt: string;
}

// 소환사 타입
export interface Summoner {
  id: string;
  puuid: string;
  summonerId: string;
  summonerName: string;
  tagLine: string;
  profileIconId: number;
  summonerLevel: number;
  tier?: string;
  rank?: string;
  leaguePoints?: number;
  wins: number;
  losses: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// 토너먼트 타입
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: 'BO1' | 'BO3' | 'BO5' | 'BO7';
  winsRequired: number;
  fearlessEnabled: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  creatorId: string;
  participants: TournamentParticipant[];
  matches: Match[];
  blueTeam: TeamMember[];  // 고정된 블루팀
  redTeam: TeamMember[];   // 고정된 레드팀
  blueScore: number;
  redScore: number;
  createdAt: string;
  updatedAt: string;
}

// 토너먼트 참가자
export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  summonerId: string;
  summonerName: string;
  tagLine: string;
  tier?: string;
  rank?: string;
  team?: 'BLUE' | 'RED';
  createdAt: string;
}

// 매치
export interface Match {
  id: string;
  tournamentId: string;
  matchNumber: number;
  riotMatchId?: string;
  winner?: 'BLUE' | 'RED';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  blueTeam: TeamMember[];
  redTeam: TeamMember[];
  gameData?: GameData;
  createdAt: string;
  updatedAt: string;
}

// 팀 멤버
export interface TeamMember {
  id: string;
  summonerId: string;
  summonerName: string;
  tagLine: string;
  userId: string;
  role?: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
  tier?: string;
  rank?: string;
}

// 게임 데이터 (Riot API에서 가져온 데이터)
export interface GameData {
  gameId: string;
  gameDuration: number;
  gameMode: string;
  participants: GameParticipant[];
}

// 게임 참가자
export interface GameParticipant {
  puuid: string;
  summonerName: string;
  championId: number;
  championName: string;
  teamId: number; // 100 = Blue, 200 = Red
  teamPosition: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealt: number;
  totalDamageToChampions: number;
  goldEarned: number;
  cs: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
}

// 피어리스 밴
export interface FearlessBan {
  id: string;
  tournamentId: string;
  matchNumber: number;
  summonerPuuid: string;
  championId: number;
  championName: string;
  createdAt: string;
}

// MMR 계산용 티어 정보
export const TIER_VALUES: Record<string, number> = {
  'IRON': 0,
  'BRONZE': 400,
  'SILVER': 800,
  'GOLD': 1200,
  'PLATINUM': 1600,
  'EMERALD': 2000,
  'DIAMOND': 2400,
  'MASTER': 2800,
  'GRANDMASTER': 3200,
  'CHALLENGER': 3600,
};

export const RANK_VALUES: Record<string, number> = {
  'IV': 0,
  'III': 100,
  'II': 200,
  'I': 300,
};

// MMR 계산 함수
export function calculateMMR(tier?: string, rank?: string, lp?: number): number {
  if (!tier) return 1200; // 기본값 (골드 기준)
  const tierValue = TIER_VALUES[tier] || 1200;
  const rankValue = tier === 'MASTER' || tier === 'GRANDMASTER' || tier === 'CHALLENGER'
    ? 0
    : (RANK_VALUES[rank || 'IV'] || 0);
  const lpValue = lp || 0;
  return tierValue + rankValue + lpValue;
}

// Riot API 응답 타입
export interface RiotAccountResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface RiotSummonerResponse {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RiotLeagueEntry {
  leagueId: string;
  summonerId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface RiotMatchResponse {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    participants: RiotParticipant[];
    teams: RiotTeam[];
  };
}

export interface RiotParticipant {
  puuid: string;
  summonerName: string;
  riotIdGameName: string;
  riotIdTagline: string;
  championId: number;
  championName: string;
  teamId: number;
  teamPosition: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  goldEarned: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
}

export interface RiotTeam {
  teamId: number;
  win: boolean;
  bans: { championId: number; pickTurn: number }[];
}
