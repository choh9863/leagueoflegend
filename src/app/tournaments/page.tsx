'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tournament } from '@/types';
import { Trophy, Plus, Users, Calendar, Ban } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export default function TournamentsPage() {
  const { data: session } = useSession();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      if (res.ok) {
        const data = await res.json();
        setTournaments(data);
      }
    } catch (err) {
      console.error('Failed to fetch tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Tournament['status']) => {
    const variants: Record<Tournament['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      PENDING: { variant: 'secondary', label: '대기 중' },
      IN_PROGRESS: { variant: 'default', label: '진행 중' },
      COMPLETED: { variant: 'outline', label: '완료' },
      CANCELLED: { variant: 'destructive', label: '취소됨' },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8" />
            내전 목록
          </h1>
          <p className="text-muted-foreground mt-2">
            진행 중이거나 참가 가능한 내전을 확인하세요.
          </p>
        </div>
        {session && (
          <Link href="/tournaments/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              새 내전 만들기
            </Button>
          </Link>
        )}
      </div>

      {tournaments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>아직 내전이 없습니다.</p>
            {session && (
              <Link href="/tournaments/new">
                <Button className="mt-4">첫 내전 만들기</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tournaments.map(tournament => (
            <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {tournament.name}
                        {tournament.fearlessEnabled && (
                          <Badge variant="red" className="text-xs">
                            <Ban className="h-3 w-3 mr-1" />
                            피어리스
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {tournament.description || '설명 없음'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(tournament.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>{tournament.format}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{tournament.participants.length}명 참가</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatRelativeTime(tournament.createdAt)}</span>
                    </div>
                    {tournament.status === 'IN_PROGRESS' && (
                      <div className="ml-auto">
                        <span className="text-blue-400">{tournament.blueScore}</span>
                        <span className="mx-1">:</span>
                        <span className="text-red-400">{tournament.redScore}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
