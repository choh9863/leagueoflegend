import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tournaments } from '@/lib/db';
import { findBestBalance, randomTeams } from '@/lib/team-balance';

// POST /api/tournaments/[id]/balance - 팀 밸런스 계산 및 저장
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

    if (tournament.participants.length < 2) {
      return NextResponse.json({ error: '최소 2명의 참가자가 필요합니다.' }, { status: 400 });
    }

    // 이미 팀이 구성되어 있고 게임이 진행 중인 경우
    if (tournament.status === 'IN_PROGRESS' && tournament.blueTeam.length > 0) {
      return NextResponse.json({
        error: '이미 게임이 진행 중입니다. 팀을 변경할 수 없습니다.'
      }, { status: 400 });
    }

    const body = await request.json();
    const { mode = 'balanced', save = false } = body;

    let result;
    if (mode === 'random') {
      result = randomTeams(tournament.participants);
    } else {
      result = findBestBalance(tournament.participants);
    }

    if (!result) {
      return NextResponse.json({ error: '팀 밸런스 계산에 실패했습니다.' }, { status: 500 });
    }

    // save 옵션이 true면 토너먼트에 팀 저장
    if (save) {
      tournaments.update(tournamentId, {
        blueTeam: result.blueTeam,
        redTeam: result.redTeam,
      });
    }

    return NextResponse.json({
      ...result,
      saved: save,
    });
  } catch (error) {
    console.error('Error calculating balance:', error);
    return NextResponse.json({ error: '팀 밸런스 계산에 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/tournaments/[id]/balance - 팀 구성 확정 (저장)
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

    // 이미 게임이 진행 중인 경우 팀 변경 불가
    if (tournament.status === 'IN_PROGRESS' && tournament.matches.length > 0) {
      return NextResponse.json({
        error: '이미 게임이 진행 중입니다. 팀을 변경할 수 없습니다.'
      }, { status: 400 });
    }

    const body = await request.json();
    const { blueTeam, redTeam } = body;

    if (!blueTeam || !redTeam) {
      return NextResponse.json({ error: '블루팀과 레드팀 정보가 필요합니다.' }, { status: 400 });
    }

    const updated = tournaments.update(tournamentId, {
      blueTeam,
      redTeam,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error saving teams:', error);
    return NextResponse.json({ error: '팀 저장에 실패했습니다.' }, { status: 500 });
  }
}
