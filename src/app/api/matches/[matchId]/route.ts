import { NextRequest, NextResponse } from 'next/server';
import { getMatchDetails, parseMatchData } from '@/lib/riot-api';

// GET /api/matches/[matchId] - Riot 매치 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;

    if (!matchId) {
      return NextResponse.json({ error: '매치 ID가 필요합니다.' }, { status: 400 });
    }

    const matchDetails = await getMatchDetails(matchId);
    const parsed = parseMatchData(matchDetails);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching match:', error);
    const message = error instanceof Error ? error.message : '매치 정보를 가져오는데 실패했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
