import axios from 'axios';
import {
  RiotAccountResponse,
  RiotSummonerResponse,
  RiotLeagueEntry,
  RiotMatchResponse,
  GameParticipant,
} from '@/types';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// 지역별 라우팅
const REGION_ROUTING: Record<string, string> = {
  kr: 'asia',
  jp1: 'asia',
  euw1: 'europe',
  eun1: 'europe',
  na1: 'americas',
  br1: 'americas',
  la1: 'americas',
  la2: 'americas',
  oc1: 'sea',
  ph2: 'sea',
  sg2: 'sea',
  th2: 'sea',
  tw2: 'sea',
  vn2: 'sea',
};

// API 요청 헬퍼
async function riotRequest<T>(url: string): Promise<T> {
  // API 키 확인
  if (!RIOT_API_KEY) {
    throw new Error('RIOT_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  }

  try {
    const response = await axios.get<T>(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Riot API Error:', error.response?.status, error.response?.data);
      if (error.response?.status === 404) {
        throw new Error('소환사를 찾을 수 없습니다.');
      }
      if (error.response?.status === 401) {
        throw new Error('API 키가 설정되지 않았습니다.');
      }
      if (error.response?.status === 403) {
        throw new Error('API 키가 만료되었거나 유효하지 않습니다. Riot Developer Portal에서 새 키를 발급받으세요.');
      }
      if (error.response?.status === 429) {
        throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
    throw new Error('Riot API 요청 중 오류가 발생했습니다.');
  }
}

// Riot ID로 계정 정보 가져오기
export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  region: string = 'kr'
): Promise<RiotAccountResponse> {
  const routing = REGION_ROUTING[region] || 'asia';
  const url = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotRequest<RiotAccountResponse>(url);
}

// PUUID로 소환사 정보 가져오기
export async function getSummonerByPuuid(
  puuid: string,
  region: string = 'kr'
): Promise<RiotSummonerResponse> {
  const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotRequest<RiotSummonerResponse>(url);
}

// 소환사 ID로 랭크 정보 가져오기
export async function getLeagueEntries(
  summonerId: string,
  region: string = 'kr'
): Promise<RiotLeagueEntry[]> {
  const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
  return riotRequest<RiotLeagueEntry[]>(url);
}

// 솔로랭크 정보만 가져오기
export async function getSoloRankInfo(
  summonerId: string,
  region: string = 'kr'
): Promise<RiotLeagueEntry | null> {
  const entries = await getLeagueEntries(summonerId, region);
  return entries.find(e => e.queueType === 'RANKED_SOLO_5x5') || null;
}

// 매치 ID 목록 가져오기
export async function getMatchIds(
  puuid: string,
  region: string = 'kr',
  count: number = 20,
  start: number = 0,
  queue?: number
): Promise<string[]> {
  const routing = REGION_ROUTING[region] || 'asia';
  let url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
  if (queue) {
    url += `&queue=${queue}`;
  }
  return riotRequest<string[]>(url);
}

// 매치 상세 정보 가져오기
export async function getMatchDetails(
  matchId: string,
  region: string = 'kr'
): Promise<RiotMatchResponse> {
  const routing = REGION_ROUTING[region] || 'asia';
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  return riotRequest<RiotMatchResponse>(url);
}

// 매치 데이터를 우리 형식으로 변환
export function parseMatchData(match: RiotMatchResponse): {
  gameId: string;
  gameDuration: number;
  gameMode: string;
  participants: GameParticipant[];
  winner: 'BLUE' | 'RED';
} {
  const blueTeam = match.info.teams.find(t => t.teamId === 100);
  const winner: 'BLUE' | 'RED' = blueTeam?.win ? 'BLUE' : 'RED';

  const participants: GameParticipant[] = match.info.participants.map(p => ({
    puuid: p.puuid,
    summonerName: p.riotIdGameName || p.summonerName,
    championId: p.championId,
    championName: p.championName,
    teamId: p.teamId,
    teamPosition: p.teamPosition,
    win: p.win,
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    totalDamageDealt: p.totalDamageDealt,
    totalDamageToChampions: p.totalDamageDealtToChampions,
    goldEarned: p.goldEarned,
    cs: p.totalMinionsKilled + p.neutralMinionsKilled,
    visionScore: p.visionScore,
    wardsPlaced: p.wardsPlaced,
    wardsKilled: p.wardsKilled,
    doubleKills: p.doubleKills,
    tripleKills: p.tripleKills,
    quadraKills: p.quadraKills,
    pentaKills: p.pentaKills,
  }));

  return {
    gameId: match.metadata.matchId,
    gameDuration: match.info.gameDuration,
    gameMode: match.info.gameMode,
    participants,
    winner,
  };
}

// 소환사 전체 정보 가져오기 (통합)
export async function getFullSummonerInfo(
  gameName: string,
  tagLine: string,
  region: string = 'kr'
) {
  // 1. Riot ID로 계정 정보
  const account = await getAccountByRiotId(gameName, tagLine, region);

  // 2. 소환사 정보
  const summoner = await getSummonerByPuuid(account.puuid, region);

  // 3. 랭크 정보
  const rankInfo = await getSoloRankInfo(summoner.id, region);

  return {
    puuid: account.puuid,
    summonerId: summoner.id,
    summonerName: account.gameName,
    tagLine: account.tagLine,
    profileIconId: summoner.profileIconId,
    summonerLevel: summoner.summonerLevel,
    tier: rankInfo?.tier,
    rank: rankInfo?.rank,
    leaguePoints: rankInfo?.leaguePoints,
    wins: rankInfo?.wins || 0,
    losses: rankInfo?.losses || 0,
  };
}

// 최근 플레이한 챔피언 목록 가져오기
export async function getRecentChampions(
  puuid: string,
  region: string = 'kr',
  matchCount: number = 20
): Promise<{ championId: number; championName: string; count: number }[]> {
  const matchIds = await getMatchIds(puuid, region, matchCount);
  const championCounts: Record<number, { name: string; count: number }> = {};

  for (const matchId of matchIds) {
    try {
      const match = await getMatchDetails(matchId, region);
      const participant = match.info.participants.find(p => p.puuid === puuid);
      if (participant) {
        if (!championCounts[participant.championId]) {
          championCounts[participant.championId] = {
            name: participant.championName,
            count: 0,
          };
        }
        championCounts[participant.championId].count++;
      }
    } catch {
      // 매치 정보 가져오기 실패 시 스킵
    }
  }

  return Object.entries(championCounts)
    .map(([id, data]) => ({
      championId: parseInt(id),
      championName: data.name,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count);
}
