'use client';

import { FearlessBan } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ban } from 'lucide-react';

interface FearlessBansProps {
  bans: FearlessBan[];
  summonerPuuid?: string;
}

export function FearlessBans({ bans, summonerPuuid }: FearlessBansProps) {
  // 챔피언별로 그룹화
  const groupedBans = bans.reduce((acc, ban) => {
    if (!acc[ban.championId]) {
      acc[ban.championId] = {
        championId: ban.championId,
        championName: ban.championName,
        matchNumbers: [],
      };
    }
    if (!acc[ban.championId].matchNumbers.includes(ban.matchNumber)) {
      acc[ban.championId].matchNumbers.push(ban.matchNumber);
    }
    return acc;
  }, {} as Record<number, { championId: number; championName: string; matchNumbers: number[] }>);

  const bannedChampions = Object.values(groupedBans);

  if (bannedChampions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Ban className="h-5 w-5 text-red-400" />
          피어리스 밴 목록
          {summonerPuuid && <span className="text-sm font-normal text-muted-foreground">(내 밴)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {bannedChampions.map((ban) => (
            <div
              key={ban.championId}
              className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20"
            >
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${ban.championName}.png`}
                alt={ban.championName}
                className="w-8 h-8 rounded grayscale"
              />
              <div>
                <div className="text-sm font-medium">{ban.championName}</div>
                <div className="text-xs text-muted-foreground">
                  게임 {ban.matchNumbers.join(', ')}에서 사용
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          위 챔피언들은 이후 게임에서 사용할 수 없습니다.
        </p>
      </CardContent>
    </Card>
  );
}
