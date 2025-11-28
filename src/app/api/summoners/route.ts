import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { summoners } from '@/lib/db';
import { getFullSummonerInfo } from '@/lib/riot-api';

// GET /api/summoners - 내 소환사 목록 가져오기
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const userSummoners = summoners.getByUserId(session.user.id);
    return NextResponse.json(userSummoners);
  } catch (error) {
    console.error('Error fetching summoners:', error);
    return NextResponse.json({ error: '소환사 목록을 가져오는데 실패했습니다.' }, { status: 500 });
  }
}

// POST /api/summoners - 소환사 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { gameName, tagLine, region = 'kr' } = body;

    if (!gameName || !tagLine) {
      return NextResponse.json(
        { error: '게임 이름과 태그라인을 입력해주세요.' },
        { status: 400 }
      );
    }

    // Riot API로 소환사 정보 가져오기
    const summonerInfo = await getFullSummonerInfo(gameName, tagLine, region);

    // 이미 등록된 소환사인지 확인
    const existing = summoners.getByPuuid(summonerInfo.puuid);
    if (existing) {
      // 이미 다른 사용자가 등록한 소환사
      if (existing.userId !== session.user.id) {
        return NextResponse.json(
          { error: '이미 다른 사용자가 등록한 소환사입니다.' },
          { status: 400 }
        );
      }
      // 정보 업데이트
      const updated = summoners.update(existing.id, summonerInfo);
      return NextResponse.json(updated);
    }

    // 새 소환사 등록
    const newSummoner = summoners.create({
      ...summonerInfo,
      userId: session.user.id,
    });

    return NextResponse.json(newSummoner);
  } catch (error) {
    console.error('Error registering summoner:', error);
    const message = error instanceof Error ? error.message : '소환사 등록에 실패했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
