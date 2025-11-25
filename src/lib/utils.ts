import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 티어 색상
export function getTierColor(tier?: string): string {
  const colors: Record<string, string> = {
    IRON: 'text-gray-500',
    BRONZE: 'text-amber-700',
    SILVER: 'text-gray-400',
    GOLD: 'text-yellow-500',
    PLATINUM: 'text-teal-400',
    EMERALD: 'text-emerald-500',
    DIAMOND: 'text-blue-400',
    MASTER: 'text-purple-500',
    GRANDMASTER: 'text-red-500',
    CHALLENGER: 'text-yellow-300',
  };
  return colors[tier || ''] || 'text-gray-500';
}

// 티어 배경 색상
export function getTierBgColor(tier?: string): string {
  const colors: Record<string, string> = {
    IRON: 'bg-gray-500/20',
    BRONZE: 'bg-amber-700/20',
    SILVER: 'bg-gray-400/20',
    GOLD: 'bg-yellow-500/20',
    PLATINUM: 'bg-teal-400/20',
    EMERALD: 'bg-emerald-500/20',
    DIAMOND: 'bg-blue-400/20',
    MASTER: 'bg-purple-500/20',
    GRANDMASTER: 'bg-red-500/20',
    CHALLENGER: 'bg-yellow-300/20',
  };
  return colors[tier || ''] || 'bg-gray-500/20';
}

// 포지션 아이콘
export function getPositionIcon(position?: string): string {
  const icons: Record<string, string> = {
    TOP: '🏔️',
    JUNGLE: '🌲',
    MID: '⚔️',
    MIDDLE: '⚔️',
    ADC: '🏹',
    BOTTOM: '🏹',
    SUPPORT: '🛡️',
    UTILITY: '🛡️',
  };
  return icons[position || ''] || '❓';
}

// 포지션 한글명
export function getPositionName(position?: string): string {
  const names: Record<string, string> = {
    TOP: '탑',
    JUNGLE: '정글',
    MID: '미드',
    MIDDLE: '미드',
    ADC: '원딜',
    BOTTOM: '원딜',
    SUPPORT: '서포터',
    UTILITY: '서포터',
  };
  return names[position || ''] || position || '';
}

// KDA 계산
export function calculateKDA(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(2);
}

// KDA 색상
export function getKDAColor(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return 'text-yellow-500';
  const kda = (kills + assists) / deaths;
  if (kda >= 5) return 'text-yellow-500';
  if (kda >= 4) return 'text-blue-400';
  if (kda >= 3) return 'text-teal-400';
  if (kda >= 2) return 'text-green-400';
  return 'text-gray-400';
}

// 게임 시간 포맷
export function formatGameDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// 숫자 포맷 (천 단위)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// 날짜 포맷
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 상대 시간 포맷
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDate(dateString);
}
