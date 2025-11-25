import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tournaments, summoners, generateId } from '@/lib/db';

// POST /api/tournaments/[id]/participants - 토너먼트 참가
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

    if (tournament.status !== 'PENDING') {
      return NextResponse.json({ error: '참가 신청이 마감되었습니다.' }, { status: 400 });
    }

    const body = await request.json();
    const { summonerId } = body;

    if (!summonerId) {
      return NextResponse.json({ error: '소환사를 선택해주세요.' }, { status: 400 });
    }

    // 소환사 정보 가져오기
    const summoner = summoners.getById(summonerId);
    if (!summoner) {
      return NextResponse.json({ error: '소환사를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 본인의 소환사인지 확인
    if (summoner.userId !== session.user.id) {
      return NextResponse.json({ error: '본인의 소환사만 등록할 수 있습니다.' }, { status: 403 });
    }

    // 이미 참가 중인지 확인
    if (tournament.participants.some(p => p.summonerId === summonerId)) {
      return NextResponse.json({ error: '이미 참가 중입니다.' }, { status: 400 });
    }

    // 참가자 추가
    const participant = {
      id: generateId(),
      tournamentId,
      userId: session.user.id,
      summonerId: summoner.id,
      summonerName: summoner.summonerName,
      tagLine: summoner.tagLine,
      tier: summoner.tier,
      rank: summoner.rank,
      team: undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = tournaments.addParticipant(tournamentId, participant);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error joining tournament:', error);
    return NextResponse.json({ error: '토너먼트 참가에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/tournaments/[id]/participants - 토너먼트 참가 취소
export async function DELETE(
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

    if (tournament.status !== 'PENDING') {
      return NextResponse.json({ error: '토너먼트가 시작되어 취소할 수 없습니다.' }, { status: 400 });
    }

    const body = await request.json();
    const { participantId } = body;

    // 본인의 참가인지 확인
    const participant = tournament.participants.find(p => p.id === participantId);
    if (!participant) {
      return NextResponse.json({ error: '참가자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 본인이거나 토너먼트 생성자만 취소 가능
    if (participant.userId !== session.user.id && tournament.creatorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const updated = tournaments.removeParticipant(tournamentId, participantId);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error leaving tournament:', error);
    return NextResponse.json({ error: '토너먼트 참가 취소에 실패했습니다.' }, { status: 500 });
  }
}
