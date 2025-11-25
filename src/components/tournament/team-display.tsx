'use client';

import { TeamMember } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPositionIcon, getPositionName } from '@/lib/utils';

interface TeamDisplayProps {
  team: TeamMember[];
  side: 'BLUE' | 'RED';
  totalMMR?: number;
  score?: number;
  showScore?: boolean;
}

export function TeamDisplay({ team, side, totalMMR, score, showScore = false }: TeamDisplayProps) {
  const isBlue = side === 'BLUE';

  return (
    <Card className={`${isBlue ? 'border-blue-500/50' : 'border-red-500/50'}`}>
      <CardHeader className={`pb-2 ${isBlue ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${isBlue ? 'text-blue-400' : 'text-red-400'}`}>
            {isBlue ? '블루팀' : '레드팀'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showScore && score !== undefined && (
              <span className="text-2xl font-bold">{score}</span>
            )}
            {totalMMR !== undefined && (
              <Badge variant="secondary" className="text-xs">
                MMR: {totalMMR}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {team.map((member, index) => (
            <div
              key={member.id || index}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
            >
              <div className="flex items-center gap-2">
                {member.role && (
                  <span className="text-lg" title={getPositionName(member.role)}>
                    {getPositionIcon(member.role)}
                  </span>
                )}
                <div>
                  <span className="font-medium">{member.summonerName}</span>
                  <span className="text-muted-foreground text-sm ml-1">#{member.tagLine}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.tier && (
                  <Badge
                    variant={member.tier.toLowerCase() as 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'emerald' | 'diamond' | 'master' | 'grandmaster' | 'challenger'}
                  >
                    {member.tier} {member.rank}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {team.length === 0 && (
            <p className="text-center text-muted-foreground py-4">팀원이 없습니다</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
