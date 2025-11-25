'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SummonerCard } from '@/components/summoner/summoner-card';
import { Summoner } from '@/types';
import { Plus, Search, User } from 'lucide-react';

export default function SummonersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summoners, setSummoners] = useState<Summoner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSummoners();
    }
  }, [session]);

  const fetchSummoners = async () => {
    try {
      const res = await fetch('/api/summoners');
      if (res.ok) {
        const data = await res.json();
        setSummoners(data);
      }
    } catch (err) {
      console.error('Failed to fetch summoners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !tagLine) {
      setError('게임 이름과 태그라인을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/summoners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName, tagLine }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '소환사 등록에 실패했습니다.');
      }

      setSummoners(prev => [...prev, data]);
      setGameName('');
      setTagLine('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '소환사 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async (id: string) => {
    try {
      const res = await fetch(`/api/summoners/${id}`, { method: 'PUT' });
      if (res.ok) {
        const updated = await res.json();
        setSummoners(prev => prev.map(s => s.id === id ? updated : s));
      }
    } catch (err) {
      console.error('Failed to refresh summoner:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/summoners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSummoners(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete summoner:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          소환사 관리
        </h1>
        <p className="text-muted-foreground mt-2">
          내전에 참가할 소환사 계정을 등록하고 관리하세요.
        </p>
      </div>

      {/* 소환사 등록 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            소환사 등록
          </CardTitle>
          <CardDescription>
            Riot ID를 입력하여 소환사를 등록하세요. (예: 소환사이름#KR1)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="flex gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="게임 이름"
                value={gameName}
                onChange={e => setGameName(e.target.value)}
                className="flex-1"
              />
              <span className="flex items-center text-muted-foreground">#</span>
              <Input
                placeholder="태그 (KR1)"
                value={tagLine}
                onChange={e => setTagLine(e.target.value)}
                className="w-32"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  등록
                </>
              )}
            </Button>
          </form>
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* 등록된 소환사 목록 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">등록된 소환사 ({summoners.length})</h2>
        {summoners.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              등록된 소환사가 없습니다. 위에서 소환사를 등록해주세요.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {summoners.map(summoner => (
              <SummonerCard
                key={summoner.id}
                summoner={summoner}
                onRefresh={handleRefresh}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
