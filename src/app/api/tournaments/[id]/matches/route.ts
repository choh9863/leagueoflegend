import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tournaments, fearlessBans, generateId } from '@/lib/db';
import { getMatchDetails, parseMatchData } from '@/lib/riot-api';
import { Match, TeamMember } from '@/types';

// POST /api/tournaments/[id]/matches - 새 매치 시작
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id: tournamentId } = await params;
    const tournament = tournaments.getById(tournamentId);

    if (!tournament) {
      return NextResponse.json({ error: '토너먼트를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (tournament.creatorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 토너먼트가 이미 완료되었는지 확인
    if (tournament.status === 'COMPLETED') {
      return NextResponse.json({ error: '토너먼트가 이미 종료되었습니다.' }, { status: 400 });
    }

    const body = await request.json();
    const { blueTeam, redTeam } = body as { blueTeam: TeamMember[]; redTeam: TeamMember[] };

    if (!blueTeam || !redTeam || blueTeam.length === 0 || redTeam.length === 0) {
      return NextResponse.json({ error: '양 팀 구성을 확인해주세요.' }, { status: 400 });
    }

    // 새 매치 생성
    const matchNumber = tournament.matches.length + 1;
    const newMatch: Match = {
      id: generateId(),
      tournamentId,
      matchNumber,
      status: 'PENDING',
      blueTeam,
      redTeam,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 토너먼트 상태 업데이트
    if (tournament.status === 'PENDING') {
      tournaments.update(tournamentId, { status: 'IN_PROGRESS' });
    }

    const updated = tournaments.addMatch(tournamentId, newMatch);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: '매치 생성에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/tournaments/[id]/matches - 매치 결과 등록
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id: tournamentId } = await params;
    const tournament = tournaments.getById(tournamentId);

    if (!tournament) {
      return NextResponse.json({ error: '토너먼트를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (tournament.creatorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { matchId, riotMatchId, winner } = body;

    if (!matchId) {
      return NextResponse.json({ error: '매치 ID가 필요합니다.' }, { status: 400 });
    }

    const match = tournament.matches.find(m => m.id === matchId);
    if (!match) {
      return NextResponse.json({ error: '매치를 찾을 수 없습니다.' }, { status: 404 });
    }

    let updateData: Partial<Match> = {
      status: 'COMPLETED',
      winner,
    };

    // Riot 매치 ID가 있으면 게임 데이터 가져오기
    if (riotMatchId) {
      try {
        const matchDetails = await getMatchDetails(riotMatchId);
        const gameData = parseMatchData(matchDetails);

        updateData = {
          ...updateData,
          riotMatchId,
          winner: gameData.winner,
          gameData: {
            gameId: gameData.gameId,
            gameDuration: gameData.gameDuration,
            gameMode: gameData.gameMode,
            participants: gameData.participants,
          },
        };

        // 피어리스 모드일 때 챔피언 밴 기록
        if (tournament.fearlessEnabled) {
          for (const participant of gameData.participants) {
            fearlessBans.create({
              tournamentId,
              matchNumber: match.matchNumber,
              summonerPuuid: participant.puuid,
              championId: participant.championId,
              championName: participant.championName,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching match data:', error);
        // 매치 데이터 가져오기 실패해도 수동 결과 등록은 가능
      }
    }

    const updated = tournaments.updateMatch(tournamentId, matchId, updateData);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ error: '매치 결과 등록에 실패했습니다.' }, { status: 500 });
  }
}
