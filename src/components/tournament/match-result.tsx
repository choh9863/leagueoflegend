'use client';

import { Match, GameParticipant } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatGameDuration, calculateKDA, getKDAColor, formatNumber, getPositionIcon } from '@/lib/utils';
import { Trophy, Clock, Swords } from 'lucide-react';

interface MatchResultProps {
  match: Match;
}

export function MatchResult({ match }: MatchResultProps) {
  const isCompleted = match.status === 'COMPLETED';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Swords className="h-5 w-5" />
            게임 {match.matchNumber}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isCompleted && match.winner && (
              <Badge variant={match.winner === 'BLUE' ? 'blue' : 'red'}>
                <Trophy className="h-3 w-3 mr-1" />
                {match.winner === 'BLUE' ? '블루팀' : '레드팀'} 승리
              </Badge>
            )}
            {match.gameData && (
              <Badge variant="outline" className="text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {formatGameDuration(match.gameData.gameDuration)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {match.gameData ? (
          <div className="space-y-4">
            {/* 블루팀 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${match.winner === 'BLUE' ? 'bg-blue-500' : 'bg-blue-500/50'}`} />
                <span className="font-medium text-blue-400">블루팀</span>
                {match.winner === 'BLUE' && <Trophy className="h-4 w-4 text-yellow-500" />}
              </div>
              <div className="space-y-1">
                {match.gameData.participants
                  .filter(p => p.teamId === 100)
                  .map((p, i) => (
                    <ParticipantRow key={i} participant={p} />
                  ))}
              </div>
            </div>

            {/* 레드팀 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${match.winner === 'RED' ? 'bg-red-500' : 'bg-red-500/50'}`} />
                <span className="font-medium text-red-400">레드팀</span>
                {match.winner === 'RED' && <Trophy className="h-4 w-4 text-yellow-500" />}
              </div>
              <div className="space-y-1">
                {match.gameData.participants
                  .filter(p => p.teamId === 200)
                  .map((p, i) => (
                    <ParticipantRow key={i} participant={p} />
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* 팀 구성만 표시 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-medium text-blue-400">블루팀</span>
              </div>
              {match.blueTeam.map((member, i) => (
                <div key={i} className="text-sm text-muted-foreground pl-5">
                  {member.summonerName}#{member.tagLine}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-medium text-red-400">레드팀</span>
              </div>
              {match.redTeam.map((member, i) => (
                <div key={i} className="text-sm text-muted-foreground pl-5">
                  {member.summonerName}#{member.tagLine}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ParticipantRow({ participant }: { participant: GameParticipant }) {
  const kda = calculateKDA(participant.kills, participant.deaths, participant.assists);
  const kdaColor = getKDAColor(participant.kills, participant.deaths, participant.assists);

  return (
    <div className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
      <div className="flex items-center gap-2">
        <span>{getPositionIcon(participant.teamPosition)}</span>
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${participant.championName}.png`}
          alt={participant.championName}
          className="w-8 h-8 rounded"
        />
        <div>
          <div className="font-medium">{participant.summonerName}</div>
          <div className="text-xs text-muted-foreground">{participant.championName}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="text-center">
          <div className="font-medium">
            {participant.kills}/{participant.deaths}/{participant.assists}
          </div>
          <div className={kdaColor}>{kda} KDA</div>
        </div>
        <div className="text-center text-muted-foreground">
          <div>{formatNumber(participant.totalDamageToChampions)}</div>
          <div>딜량</div>
        </div>
        <div className="text-center text-muted-foreground">
          <div>{formatNumber(participant.goldEarned)}</div>
          <div>골드</div>
        </div>
        <div className="text-center text-muted-foreground">
          <div>{participant.cs}</div>
          <div>CS</div>
        </div>
      </div>
    </div>
  );
}
