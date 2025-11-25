'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamDisplay } from '@/components/tournament/team-display';
import { MatchResult } from '@/components/tournament/match-result';
import { FearlessBans } from '@/components/tournament/fearless-bans';
import { SummonerCard } from '@/components/summoner/summoner-card';
import { Tournament, Summoner, TeamMember, FearlessBan } from '@/types';
import {
  Trophy,
  Users,
  ArrowLeft,
  Play,
  Shuffle,
  Scale,
  Ban,
  Plus,
  Check,
  X,
} from 'lucide-react';

interface TournamentWithBans extends Tournament {
  fearlessBans?: FearlessBan[];
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [tournament, setTournament] = useState<TournamentWithBans | null>(null);
  const [summoners, setSummoners] = useState<Summoner[]>([]);
  const [loading, setLoading] = useState(true);
  const [balancing, setBalancing] = useState(false);
  const [registering, setRegistering] = useState(false);

  // 팀 구성 상태
  const [blueTeam, setBlueTeam] = useState<TeamMember[]>([]);
  const [redTeam, setRedTeam] = useState<TeamMember[]>([]);
  const [blueMMR, setBlueMMR] = useState(0);
  const [redMMR, setRedMMR] = useState(0);

  // 매치 결과 등록
  const [showMatchInput, setShowMatchInput] = useState(false);
  const [riotMatchId, setRiotMatchId] = useState('');
  const [manualWinner, setManualWinner] = useState<'BLUE' | 'RED' | null>(null);

  const isCreator = session?.user?.id === tournament?.creatorId;
  const canJoin = tournament?.status === 'PENDING' && session?.user?.id;
  const hasJoined = tournament?.participants.some(p => p.userId === session?.user?.id);

  useEffect(() => {
    fetchTournament();
    if (session) {
      fetchSummoners();
    }
  }, [resolvedParams.id, session]);

  const fetchTournament = async () => {
    try {
      const res = await fetch(`/api/tournaments/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data);
      } else {
        router.push('/tournaments');
      }
    } catch (err) {
      console.error('Failed to fetch tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummoners = async () => {
    try {
      const res = await fetch('/api/summoners');
      if (res.ok) {
        const data = await res.json();
        setSummoners(data);
      }
    } catch (err) {
      console.error('Failed to fetch summoners:', err);
    }
  };

  const handleJoin = async (summonerId: string) => {
    setRegistering(true);
    try {
      const res = await fetch(`/api/tournaments/${resolvedParams.id}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summonerId }),
      });

      if (res.ok) {
        const data = await res.json();
        setTournament(data);
      }
    } catch (err) {
      console.error('Failed to join tournament:', err);
    } finally {
      setRegistering(false);
    }
  };

  const handleLeave = async () => {
    const participant = tournament?.participants.find(p => p.userId === session?.user?.id);
    if (!participant) return;

    try {
      const res = await fetch(`/api/tournaments/${resolvedParams.id}/participants`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: participant.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setTournament(data);
      }
    } catch (err) {
      console.error('Failed to leave tournament:', err);
    }
  };

  const handleBalance = async (mode: 'balanced' | 'random') => {
    setBalancing(true);
    try {
      const res = await fetch(`/api/tournaments/${resolvedParams.id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      if (res.ok) {
        const data = await res.json();
        setBlueTeam(data.blueTeam);
        setRedTeam(data.redTeam);
        setBlueMMR(data.blueTotalMMR);
        setRedMMR(data.redTotalMMR);
      }
    } catch (err) {
      console.error('Failed to balance teams:', err);
    } finally {
      setBalancing(false);
    }
  };

  const handleStartMatch = async () => {
    if (blueTeam.length === 0 || redTeam.length === 0) {
      alert('팀 구성을 먼저 해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/tournaments/${resolvedParams.id}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueTeam, redTeam }),
      });

      if (res.ok) {
        const data = await res.json();
        setTournament(data);
        setShowMatchInput(true);
      }
    } catch (err) {
      console.error('Failed to start match:', err);
    }
  };

  const handleRegisterResult = async () => {
    const currentMatch = tournament?.matches[tournament.matches.length - 1];
    if (!currentMatch) return;

    if (!riotMatchId && !manualWinner) {
      alert('Riot 매치 ID를 입력하거나 수동으로 승자를 선택해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/tournaments/${resolvedParams.id}/matches`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: currentMatch.id,
          riotMatchId: riotMatchId || undefined,
          winner: manualWinner || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTournament(data);
        setShowMatchInput(false);
        setRiotMatchId('');
        setManualWinner(null);
        // 팀 초기화
        setBlueTeam([]);
        setRedTeam([]);
      }
    } catch (err) {
      console.error('Failed to register result:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  const isCompleted = tournament.status === 'COMPLETED';
  const currentMatchPending = tournament.matches.some(m => m.status === 'PENDING');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/tournaments" className="inline-flex items-center text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        내전 목록으로
      </Link>

      {/* 토너먼트 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                {tournament.name}
                {tournament.fearlessEnabled && (
                  <Badge variant="red" className="ml-2">
                    <Ban className="h-3 w-3 mr-1" />
                    피어리스
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                {tournament.description || '설명 없음'}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge variant={
                tournament.status === 'PENDING' ? 'secondary' :
                tournament.status === 'IN_PROGRESS' ? 'default' :
                tournament.status === 'COMPLETED' ? 'outline' : 'destructive'
              }>
                {tournament.status === 'PENDING' ? '대기 중' :
                 tournament.status === 'IN_PROGRESS' ? '진행 중' :
                 tournament.status === 'COMPLETED' ? '완료' : '취소됨'}
              </Badge>
              <div className="mt-2 text-2xl font-bold">
                <span className="text-blue-400">{tournament.blueScore}</span>
                <span className="mx-2">:</span>
                <span className="text-red-400">{tournament.redScore}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {tournament.format} ({tournament.winsRequired}승 필요)
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 참가자 목록 & 참가 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            참가자 ({tournament.participants.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 참가자 목록 */}
          <div className="flex flex-wrap gap-2">
            {tournament.participants.map(p => (
              <Badge key={p.id} variant="secondary" className="py-1 px-3">
                {p.summonerName}#{p.tagLine}
                {p.tier && <span className="ml-1 text-xs opacity-70">({p.tier})</span>}
              </Badge>
            ))}
            {tournament.participants.length === 0 && (
              <p className="text-muted-foreground">아직 참가자가 없습니다.</p>
            )}
          </div>

          {/* 참가/탈퇴 버튼 */}
          {canJoin && !hasJoined && summoners.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">참가할 소환사 선택:</p>
              <div className="grid md:grid-cols-2 gap-2">
                {summoners.map(summoner => (
                  <div
                    key={summoner.id}
                    onClick={() => !registering && handleJoin(summoner.id)}
                    className="cursor-pointer"
                  >
                    <SummonerCard summoner={summoner} selectable />
                  </div>
                ))}
              </div>
            </div>
          )}

          {canJoin && !hasJoined && summoners.length === 0 && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                참가하려면 먼저{' '}
                <Link href="/summoners" className="text-primary underline">
                  소환사를 등록
                </Link>
                해주세요.
              </p>
            </div>
          )}

          {canJoin && hasJoined && (
            <div className="border-t pt-4">
              <Button variant="outline" onClick={handleLeave}>
                <X className="h-4 w-4 mr-2" />
                참가 취소
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 팀 밸런스 & 매치 관리 (주최자용) */}
      {isCreator && !isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              팀 구성
            </CardTitle>
            <CardDescription>
              팀 밸런스를 맞추고 게임을 시작하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 밸런스 버튼 */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleBalance('balanced')}
                disabled={balancing || tournament.participants.length < 2}
              >
                <Scale className="h-4 w-4 mr-2" />
                밸런스 맞추기
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBalance('random')}
                disabled={balancing || tournament.participants.length < 2}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                랜덤 배정
              </Button>
            </div>

            {/* 팀 표시 */}
            {(blueTeam.length > 0 || redTeam.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4">
                <TeamDisplay team={blueTeam} side="BLUE" totalMMR={blueMMR} />
                <TeamDisplay team={redTeam} side="RED" totalMMR={redMMR} />
              </div>
            )}

            {/* 매치 시작/결과 등록 */}
            {blueTeam.length > 0 && redTeam.length > 0 && !currentMatchPending && (
              <Button onClick={handleStartMatch} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                게임 {tournament.matches.length + 1} 시작
              </Button>
            )}

            {/* 결과 등록 */}
            {showMatchInput && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">게임 결과 등록</h4>
                <div className="space-y-2">
                  <label className="text-sm">Riot 매치 ID (선택)</label>
                  <Input
                    placeholder="예: KR_1234567890"
                    value={riotMatchId}
                    onChange={e => setRiotMatchId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    매치 ID를 입력하면 게임 상세 정보를 자동으로 가져옵니다.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm">또는 수동으로 승자 선택</label>
                  <div className="flex gap-2">
                    <Button
                      variant={manualWinner === 'BLUE' ? 'blue' : 'outline'}
                      onClick={() => setManualWinner('BLUE')}
                      className="flex-1"
                    >
                      블루팀 승리
                    </Button>
                    <Button
                      variant={manualWinner === 'RED' ? 'red' : 'outline'}
                      onClick={() => setManualWinner('RED')}
                      className="flex-1"
                    >
                      레드팀 승리
                    </Button>
                  </div>
                </div>
                <Button onClick={handleRegisterResult} className="w-full">
                  <Check className="h-4 w-4 mr-2" />
                  결과 등록
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 피어리스 밴 목록 */}
      {tournament.fearlessEnabled && tournament.fearlessBans && tournament.fearlessBans.length > 0 && (
        <FearlessBans bans={tournament.fearlessBans} />
      )}

      {/* 매치 결과 목록 */}
      {tournament.matches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">매치 기록</h2>
          {tournament.matches.map(match => (
            <MatchResult key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
