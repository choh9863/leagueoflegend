import { TournamentParticipant, TeamMember, calculateMMR } from '@/types';

interface PlayerWithMMR extends TournamentParticipant {
  mmr: number;
}

interface BalancedTeams {
  blueTeam: TeamMember[];
  redTeam: TeamMember[];
  blueTotalMMR: number;
  redTotalMMR: number;
  mmrDifference: number;
}

// 참가자들의 MMR 계산
function calculatePlayersMMR(participants: TournamentParticipant[]): PlayerWithMMR[] {
  return participants.map(p => ({
    ...p,
    mmr: calculateMMR(p.tier, p.rank),
  }));
}

// 모든 가능한 팀 조합 생성 (5v5 기준)
function* generateCombinations(
  players: PlayerWithMMR[],
  teamSize: number,
  start: number = 0,
  current: PlayerWithMMR[] = []
): Generator<PlayerWithMMR[]> {
  if (current.length === teamSize) {
    yield [...current];
    return;
  }

  for (let i = start; i <= players.length - (teamSize - current.length); i++) {
    current.push(players[i]);
    yield* generateCombinations(players, teamSize, i + 1, current);
    current.pop();
  }
}

// 최적의 팀 밸런스 찾기
export function findBestBalance(participants: TournamentParticipant[]): BalancedTeams | null {
  if (participants.length < 2) {
    return null;
  }

  const teamSize = Math.floor(participants.length / 2);
  const playersWithMMR = calculatePlayersMMR(participants);
  const totalMMR = playersWithMMR.reduce((sum, p) => sum + p.mmr, 0);

  let bestBlueTeam: PlayerWithMMR[] = [];
  let bestRedTeam: PlayerWithMMR[] = [];
  let bestDiff = Infinity;

  // 모든 조합을 확인
  for (const blueTeam of generateCombinations(playersWithMMR, teamSize)) {
    const blueMMR = blueTeam.reduce((sum, p) => sum + p.mmr, 0);
    const redMMR = totalMMR - blueMMR;
    const diff = Math.abs(blueMMR - redMMR);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestBlueTeam = [...blueTeam];
      bestRedTeam = playersWithMMR.filter(p => !blueTeam.includes(p));
    }

    // 완벽한 밸런스 찾으면 종료
    if (diff === 0) break;
  }

  // TeamMember 형식으로 변환
  const blueTeam: TeamMember[] = bestBlueTeam.map(p => ({
    id: p.id,
    summonerId: p.summonerId,
    summonerName: p.summonerName,
    tagLine: p.tagLine,
    userId: p.userId,
    tier: p.tier,
    rank: p.rank,
  }));

  const redTeam: TeamMember[] = bestRedTeam.map(p => ({
    id: p.id,
    summonerId: p.summonerId,
    summonerName: p.summonerName,
    tagLine: p.tagLine,
    userId: p.userId,
    tier: p.tier,
    rank: p.rank,
  }));

  const blueTotalMMR = bestBlueTeam.reduce((sum, p) => sum + p.mmr, 0);
  const redTotalMMR = bestRedTeam.reduce((sum, p) => sum + p.mmr, 0);

  return {
    blueTeam,
    redTeam,
    blueTotalMMR,
    redTotalMMR,
    mmrDifference: Math.abs(blueTotalMMR - redTotalMMR),
  };
}

// 역할 기반 밸런스 (선호 포지션 고려)
export function findBalanceWithRoles(
  participants: TournamentParticipant[],
  preferredRoles?: Record<string, string> // { participantId: 'TOP' | 'JUNGLE' | ... }
): BalancedTeams | null {
  const result = findBestBalance(participants);
  if (!result) return null;

  // 역할 배정 (선호도가 있으면 적용)
  const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'] as const;

  const assignRoles = (team: TeamMember[]): TeamMember[] => {
    const assigned = new Set<string>();
    const assignedMembers: TeamMember[] = [];

    // 선호 역할이 있는 플레이어 먼저 배정
    if (preferredRoles) {
      for (const member of team) {
        const preferred = preferredRoles[member.id];
        if (preferred && !assigned.has(preferred)) {
          assigned.add(preferred);
          assignedMembers.push({ ...member, role: preferred as TeamMember['role'] });
        }
      }
    }

    // 나머지 플레이어 배정
    for (const member of team) {
      if (assignedMembers.find(m => m.id === member.id)) continue;

      for (const role of roles) {
        if (!assigned.has(role)) {
          assigned.add(role);
          assignedMembers.push({ ...member, role });
          break;
        }
      }
    }

    return assignedMembers;
  };

  return {
    ...result,
    blueTeam: assignRoles(result.blueTeam),
    redTeam: assignRoles(result.redTeam),
  };
}

// 랜덤 팀 배정
export function randomTeams(participants: TournamentParticipant[]): BalancedTeams | null {
  if (participants.length < 2) return null;

  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const teamSize = Math.floor(shuffled.length / 2);

  const blueParticipants = shuffled.slice(0, teamSize);
  const redParticipants = shuffled.slice(teamSize, teamSize * 2);

  const blueTeam: TeamMember[] = blueParticipants.map(p => ({
    id: p.id,
    summonerId: p.summonerId,
    summonerName: p.summonerName,
    tagLine: p.tagLine,
    userId: p.userId,
    tier: p.tier,
    rank: p.rank,
  }));

  const redTeam: TeamMember[] = redParticipants.map(p => ({
    id: p.id,
    summonerId: p.summonerId,
    summonerName: p.summonerName,
    tagLine: p.tagLine,
    userId: p.userId,
    tier: p.tier,
    rank: p.rank,
  }));

  const blueTotalMMR = blueParticipants.reduce((sum, p) => sum + calculateMMR(p.tier, p.rank), 0);
  const redTotalMMR = redParticipants.reduce((sum, p) => sum + calculateMMR(p.tier, p.rank), 0);

  return {
    blueTeam,
    redTeam,
    blueTotalMMR,
    redTotalMMR,
    mmrDifference: Math.abs(blueTotalMMR - redTotalMMR),
  };
}

// 팀 스왑
export function swapPlayers(
  teams: BalancedTeams,
  bluePlayerId: string,
  redPlayerId: string
): BalancedTeams {
  const blueIndex = teams.blueTeam.findIndex(p => p.id === bluePlayerId);
  const redIndex = teams.redTeam.findIndex(p => p.id === redPlayerId);

  if (blueIndex === -1 || redIndex === -1) return teams;

  const newBlueTeam = [...teams.blueTeam];
  const newRedTeam = [...teams.redTeam];

  // 스왑
  const temp = newBlueTeam[blueIndex];
  newBlueTeam[blueIndex] = newRedTeam[redIndex];
  newRedTeam[redIndex] = temp;

  // MMR 재계산
  const blueTotalMMR = newBlueTeam.reduce(
    (sum, p) => sum + calculateMMR(p.tier, p.rank),
    0
  );
  const redTotalMMR = newRedTeam.reduce(
    (sum, p) => sum + calculateMMR(p.tier, p.rank),
    0
  );

  return {
    blueTeam: newBlueTeam,
    redTeam: newRedTeam,
    blueTotalMMR,
    redTotalMMR,
    mmrDifference: Math.abs(blueTotalMMR - redTotalMMR),
  };
}
