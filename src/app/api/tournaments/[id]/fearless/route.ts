import { NextRequest, NextResponse } from 'next/server';
import { fearlessBans } from '@/lib/db';

// GET /api/tournaments/[id]/fearless - 피어리스 밴 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const summonerPuuid = searchParams.get('summonerPuuid');

    let bans = fearlessBans.getByTournamentId(tournamentId);

    // 특정 소환사의 밴만 필터링
    if (summonerPuuid) {
      bans = bans.filter(b => b.summonerPuuid === summonerPuuid);
    }

    // 챔피언별로 그룹화
    const groupedBans: Record<number, {
      championId: number;
      championName: string;
      bannedFor: string[];
      matchNumbers: number[];
    }> = {};

    for (const ban of bans) {
      if (!groupedBans[ban.championId]) {
        groupedBans[ban.championId] = {
          championId: ban.championId,
          championName: ban.championName,
          bannedFor: [],
          matchNumbers: [],
        };
      }
      if (!groupedBans[ban.championId].bannedFor.includes(ban.summonerPuuid)) {
        groupedBans[ban.championId].bannedFor.push(ban.summonerPuuid);
      }
      if (!groupedBans[ban.championId].matchNumbers.includes(ban.matchNumber)) {
        groupedBans[ban.championId].matchNumbers.push(ban.matchNumber);
      }
    }

    return NextResponse.json({
      bans,
      grouped: Object.values(groupedBans),
    });
  } catch (error) {
    console.error('Error fetching fearless bans:', error);
    return NextResponse.json({ error: '피어리스 밴 목록을 가져오는데 실패했습니다.' }, { status: 500 });
  }
}
