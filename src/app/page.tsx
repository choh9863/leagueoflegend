'use client';

import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Users, Trophy, Ban, BarChart3, Shield } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/10">
            <Swords className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">LoL 내전 매니저</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          리그오브레전드 내전을 더 쉽게 관리하세요.<br />
          팀 밸런스, 피어리스, 게임 기록까지 한 곳에서!
        </p>

        {session ? (
          <div className="flex justify-center gap-4">
            <Link href="/tournaments/new">
              <Button size="lg" className="gap-2">
                <Trophy className="h-5 w-5" />
                새 내전 만들기
              </Button>
            </Link>
            <Link href="/tournaments">
              <Button size="lg" variant="outline" className="gap-2">
                내전 목록 보기
              </Button>
            </Link>
          </div>
        ) : (
          <Button size="lg" onClick={() => signIn('discord')} className="gap-2">
            <Shield className="h-5 w-5" />
            Discord로 시작하기
          </Button>
        )}
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              자동 팀 밸런스
            </CardTitle>
            <CardDescription>
              솔로랭크 티어를 기반으로 최적의 팀 밸런스를 자동으로 계산합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              MMR 기반 알고리즘으로 공정한 내전을 즐기세요. 랜덤 배정도 가능합니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-400" />
              피어리스 모드
            </CardTitle>
            <CardDescription>
              이전 게임에서 플레이한 챔피언은 자동으로 밴됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pro팀처럼 피어리스 내전을 즐겨보세요. 다양한 챔피언 풀이 필요합니다!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              상세 기록
            </CardTitle>
            <CardDescription>
              Riot API를 통해 게임 결과를 자동으로 가져옵니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              KDA, 딜량, CS, 골드 등 상세한 게임 통계를 확인하세요.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              다양한 포맷
            </CardTitle>
            <CardDescription>
              BO1, BO3, BO5, BO7 등 다양한 내전 포맷을 지원합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              단판부터 7전 4선승까지, 원하는 포맷으로 내전을 진행하세요.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              Discord 로그인
            </CardTitle>
            <CardDescription>
              Discord 계정으로 간편하게 로그인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              별도 회원가입 없이 Discord 계정 하나로 모든 기능을 이용하세요.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-orange-400" />
              소환사 등록
            </CardTitle>
            <CardDescription>
              Riot ID로 소환사를 등록하고 관리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              여러 계정을 등록하고 내전에 참가할 계정을 선택하세요.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How to Use */}
      <section className="py-8">
        <h2 className="text-2xl font-bold mb-6 text-center">사용 방법</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <h3 className="font-semibold mb-2">Discord 로그인</h3>
            <p className="text-sm text-muted-foreground">Discord 계정으로 로그인하세요.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <h3 className="font-semibold mb-2">소환사 등록</h3>
            <p className="text-sm text-muted-foreground">Riot ID로 소환사를 등록하세요.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <h3 className="font-semibold mb-2">내전 생성</h3>
            <p className="text-sm text-muted-foreground">새 내전을 만들고 친구들을 초대하세요.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mx-auto mb-3">
              4
            </div>
            <h3 className="font-semibold mb-2">게임 시작</h3>
            <p className="text-sm text-muted-foreground">팀 밸런스를 맞추고 내전을 시작하세요!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
