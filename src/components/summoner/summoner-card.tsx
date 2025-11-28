'use client';

import { Summoner } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTierColor, getTierBgColor } from '@/lib/utils';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SummonerCardProps {
  summoner: Summoner;
  onRefresh?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (summoner: Summoner) => void;
}

export function SummonerCard({
  summoner,
  onRefresh,
  onDelete,
  selectable = false,
  selected = false,
  onSelect,
}: SummonerCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const tierVariant = summoner.tier?.toLowerCase() as 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'emerald' | 'diamond' | 'master' | 'grandmaster' | 'challenger' | undefined;

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh(summoner.id);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('정말 이 소환사를 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      await onDelete(summoner.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(summoner);
    }
  };

  return (
    <Card
      className={`transition-all ${
        selectable ? 'cursor-pointer hover:border-primary' : ''
      } ${selected ? 'border-primary ring-2 ring-primary' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summoner.profileIconId}.png`}
              alt="Profile Icon"
              className="w-12 h-12 rounded-full border-2 border-border"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{summoner.summonerName}</span>
                <span className="text-muted-foreground text-sm">#{summoner.tagLine}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {summoner.tier ? (
                  <Badge variant={tierVariant || 'secondary'}>
                    {summoner.tier} {summoner.rank}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Unranked</Badge>
                )}
                {summoner.leaguePoints !== undefined && summoner.tier && (
                  <span className="text-sm text-muted-foreground">{summoner.leaguePoints} LP</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Lv. {summoner.summonerLevel} | {summoner.wins}승 {summoner.losses}패
              </div>
            </div>
          </div>

          {!selectable && (
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefresh();
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
