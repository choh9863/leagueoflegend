import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tournaments, fearlessBans } from '@/lib/db';

// GET /api/tournaments/[id] - 토너먼트 상세 정보
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = tournaments.getById(id);

    if (!tournament) {
      return NextResponse.json({ error: '토너먼트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 피어리스 밴 목록 포함
    const bans = fearlessBans.getByTournamentId(id);

    return NextResponse.json({ ...tournament, fearlessBans: bans });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json({ error: '토너먼트 정보를 가져오는데 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/tournaments/[id] - 토너먼트 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const tournament = tournaments.getById(id);

    if (!tournament) {
      return NextResponse.json({ error: '토너먼트를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (tournament.creatorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const updated = tournaments.update(id, body);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json({ error: '토너먼트 수정에 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/tournaments/[id] - 토너먼트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const tournament = tournaments.getById(id);

    if (!tournament) {
      return NextResponse.json({ error: '토너먼트를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (tournament.creatorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 피어리스 밴 기록도 삭제
    fearlessBans.deleteByTournamentId(id);
    tournaments.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: '토너먼트 삭제에 실패했습니다.' }, { status: 500 });
  }
}
