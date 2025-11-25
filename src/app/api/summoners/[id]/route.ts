import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { summoners } from '@/lib/db';
import { getFullSummonerInfo } from '@/lib/riot-api';

// GET /api/summoners/[id] - 소환사 정보 가져오기
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const summoner = summoners.getById(id);

    if (!summoner) {
      return NextResponse.json({ error: '소환사를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(summoner);
  } catch (error) {
    console.error('Error fetching summoner:', error);
    return NextResponse.json({ error: '소환사 정보를 가져오는데 실패했습니다.' }, { status: 500 });
  }
}

// PUT /api/summoners/[id] - 소환사 정보 업데이트
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
    const summoner = summoners.getById(id);

    if (!summoner) {
      return NextResponse.json({ error: '소환사를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (summoner.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // Riot API로 최신 정보 가져오기
    const summonerInfo = await getFullSummonerInfo(
      summoner.summonerName,
      summoner.tagLine,
      'kr'
    );

    const updated = summoners.update(id, summonerInfo);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating summoner:', error);
    const message = error instanceof Error ? error.message : '소환사 정보 업데이트에 실패했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/summoners/[id] - 소환사 삭제
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
    const summoner = summoners.getById(id);

    if (!summoner) {
      return NextResponse.json({ error: '소환사를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (summoner.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    summoners.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting summoner:', error);
    return NextResponse.json({ error: '소환사 삭제에 실패했습니다.' }, { status: 500 });
  }
}
