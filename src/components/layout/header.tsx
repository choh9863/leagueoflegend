'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Swords, User, LogOut, Settings, Trophy } from 'lucide-react';

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Swords className="h-6 w-6 text-primary" />
            <span>LoL 내전</span>
          </Link>

          {session && (
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/tournaments"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Trophy className="h-4 w-4 inline-block mr-1" />
                토너먼트
              </Link>
              <Link
                href="/summoners"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="h-4 w-4 inline-block mr-1" />
                소환사 관리
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium">{session.user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4 mr-1" />
                로그아웃
              </Button>
            </div>
          ) : (
            <Button onClick={() => signIn('discord')}>
              <Settings className="h-4 w-4 mr-2" />
              Discord로 로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
