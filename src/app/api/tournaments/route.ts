import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tournaments } from '@/lib/db';

// GET /api/tournaments - 토너먼트 목록 가져오기
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const creatorId = searchParams.get('creatorId');

    let allTournaments = tournaments.getAll();

    // 필터링
    if (status) {
      allTournaments = allTournaments.filter(t => t.status === status);
    }
    if (creatorId) {
      allTournaments = allTournaments.filter(t => t.creatorId === creatorId);
    }

    // 내가 참가 중인 토너먼트도 포함
    if (session?.user?.id) {
      allTournaments = allTournaments.filter(t =>
        t.creatorId === session.user.id ||
        t.participants.some(p => p.userId === session.user.id) ||
        t.status === 'PENDING'
      );
    }

    // 최신순 정렬
    allTournaments.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(allTournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ error: '토너먼트 목록을 가져오는데 실패했습니다.' }, { status: 500 });
  }
}

// POST /api/tournaments - 토너먼트 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      format = 'BO5',
      fearlessEnabled = false
    } = body;

    if (!name) {
      return NextResponse.json({ error: '토너먼트 이름을 입력해주세요.' }, { status: 400 });
    }

    // 포맷에 따른 승리 필요 횟수 계산
    const formatWins: Record<string, number> = {
      'BO1': 1,
      'BO3': 2,
      'BO5': 3,
      'BO7': 4,
    };

    const newTournament = tournaments.create({
      name,
      description,
      format,
      winsRequired: formatWins[format] || 3,
      fearlessEnabled,
      status: 'PENDING',
      creatorId: session.user.id,
    });

    return NextResponse.json(newTournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json({ error: '토너먼트 생성에 실패했습니다.' }, { status: 500 });
  }
}
