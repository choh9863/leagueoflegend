import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tournaments } from '@/lib/db';
import { findBestBalance, randomTeams } from '@/lib/team-balance';

// POST /api/tournaments/[id]/balance - 팀 밸런스 계산
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

    const body = await request.json();
    const { mode = 'balanced' } = body; // 'balanced' or 'random'

    let result;
    if (mode === 'random') {
      result = randomTeams(tournament.participants);
    } else {
      result = findBestBalance(tournament.participants);
    }

    if (!result) {
      return NextResponse.json({ error: '팀 밸런스 계산에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating balance:', error);
    return NextResponse.json({ error: '팀 밸런스 계산에 실패했습니다.' }, { status: 500 });
  }
}
