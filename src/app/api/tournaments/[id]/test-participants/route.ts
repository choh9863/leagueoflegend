import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tournaments, generateId } from '@/lib/db';

// 테스트용 더미 소환사 데이터
const DUMMY_SUMMONERS = [
  { name: 'Faker', tagLine: 'KR1', tier: 'CHALLENGER', rank: 'I' },
  { name: 'Keria', tagLine: 'KR1', tier: 'CHALLENGER', rank: 'I' },
  { name: 'Gumayusi', tagLine: 'KR1', tier: 'GRANDMASTER', rank: 'I' },
  { name: 'Oner', tagLine: 'KR1', tier: 'CHALLENGER', rank: 'I' },
  { name: 'Zeus', tagLine: 'KR1', tier: 'GRANDMASTER', rank: 'I' },
  { name: 'Chovy', tagLine: 'KR1', tier: 'CHALLENGER', rank: 'I' },
  { name: 'Peyz', tagLine: 'KR1', tier: 'GRANDMASTER', rank: 'I' },
  { name: 'Lehends', tagLine: 'KR1', tier: 'MASTER', rank: 'I' },
  { name: 'Peanut', tagLine: 'KR1', tier: 'GRANDMASTER', rank: 'I' },
  { name: 'Doran', tagLine: 'KR1', tier: 'MASTER', rank: 'I' },
  { name: 'ShowMaker', tagLine: 'KR1', tier: 'CHALLENGER', rank: 'I' },
  { name: 'Canyon', tagLine: 'KR1', tier: 'CHALLENGER', rank: 'I' },
  { name: 'TestPlayer1', tagLine: 'KR1', tier: 'DIAMOND', rank: 'I' },
  { name: 'TestPlayer2', tagLine: 'KR1', tier: 'DIAMOND', rank: 'II' },
  { name: 'TestPlayer3', tagLine: 'KR1', tier: 'PLATINUM', rank: 'I' },
  { name: 'TestPlayer4', tagLine: 'KR1', tier: 'PLATINUM', rank: 'III' },
  { name: 'TestPlayer5', tagLine: 'KR1', tier: 'GOLD', rank: 'I' },
  { name: 'TestPlayer6', tagLine: 'KR1', tier: 'GOLD', rank: 'II' },
  { name: 'TestPlayer7', tagLine: 'KR1', tier: 'SILVER', rank: 'I' },
  { name: 'TestPlayer8', tagLine: 'KR1', tier: 'BRONZE', rank: 'I' },
];

// POST /api/tournaments/[id]/test-participants - 테스트 참가자 추가
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

    const body = await request.json();
    const { count = 10 } = body; // 기본 10명 추가

    // 이미 참가한 소환사 이름 목록
    const existingNames = new Set(tournament.participants.map(p => p.summonerName));

    // 추가할 더미 소환사 선택
    const availableDummies = DUMMY_SUMMONERS.filter(d => !existingNames.has(d.name));
    const toAdd = availableDummies.slice(0, Math.min(count, availableDummies.length));

    // 참가자 추가
    for (const dummy of toAdd) {
      const participant = {
        id: generateId(),
        tournamentId,
        userId: `test-${generateId()}`, // 테스트용 가상 유저 ID
        summonerId: `test-summoner-${generateId()}`,
        summonerName: dummy.name,
        tagLine: dummy.tagLine,
        tier: dummy.tier,
        rank: dummy.rank,
        team: undefined,
        createdAt: new Date().toISOString(),
      };
      tournaments.addParticipant(tournamentId, participant);
    }

    const updated = tournaments.getById(tournamentId);
    return NextResponse.json({
      ...updated,
      added: toAdd.length,
      message: `${toAdd.length}명의 테스트 참가자가 추가되었습니다.`
    });
  } catch (error) {
    console.error('Error adding test participants:', error);
    return NextResponse.json({ error: '테스트 참가자 추가에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/tournaments/[id]/test-participants - 테스트 참가자 모두 삭제
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

    if (tournament.creatorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 테스트 참가자만 삭제 (userId가 'test-'로 시작하는 참가자)
    const realParticipants = tournament.participants.filter(
      p => !p.userId.startsWith('test-')
    );

    const removed = tournament.participants.length - realParticipants.length;
    tournaments.update(tournamentId, { participants: realParticipants });

    const updated = tournaments.getById(tournamentId);
    return NextResponse.json({
      ...updated,
      removed,
      message: `${removed}명의 테스트 참가자가 삭제되었습니다.`
    });
  } catch (error) {
    console.error('Error removing test participants:', error);
    return NextResponse.json({ error: '테스트 참가자 삭제에 실패했습니다.' }, { status: 500 });
  }
}
