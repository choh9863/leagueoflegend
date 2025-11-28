'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Ban, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTournamentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState('BO5');
  const [fearlessEnabled, setFearlessEnabled] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('내전 이름을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          format,
          fearlessEnabled,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '내전 생성에 실패했습니다.');
      }

      router.push(`/tournaments/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '내전 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/tournaments" className="inline-flex items-center text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        내전 목록으로
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            새 내전 만들기
          </CardTitle>
          <CardDescription>
            내전 설정을 입력하고 시작하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 내전 이름 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">내전 이름 *</label>
              <Input
                placeholder="예: 금요일 내전"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">설명</label>
              <Input
                placeholder="내전에 대한 간단한 설명 (선택사항)"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* 포맷 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">포맷</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="포맷 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BO1">BO1 (단판)</SelectItem>
                  <SelectItem value="BO3">BO3 (3판 2선승)</SelectItem>
                  <SelectItem value="BO5">BO5 (5판 3선승)</SelectItem>
                  <SelectItem value="BO7">BO7 (7판 4선승)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 피어리스 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    피어리스 모드
                  </label>
                  <p className="text-xs text-muted-foreground">
                    이전 게임에서 플레이한 챔피언을 다음 게임에서 사용할 수 없습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFearlessEnabled(!fearlessEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    fearlessEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      fearlessEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  '내전 생성'
                )}
              </Button>
              <Link href="/tournaments">
                <Button type="button" variant="outline">
                  취소
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
