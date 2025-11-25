import fs from 'fs';
import path from 'path';
import { User, Summoner, Tournament, FearlessBan } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

// 데이터 파일 경로
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SUMMONERS_FILE = path.join(DATA_DIR, 'summoners.json');
const TOURNAMENTS_FILE = path.join(DATA_DIR, 'tournaments.json');
const FEARLESS_BANS_FILE = path.join(DATA_DIR, 'fearless-bans.json');

// 데이터 디렉토리 확인 및 생성
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 파일 읽기 헬퍼
function readJsonFile<T>(filePath: string): T[] {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 파일 쓰기 헬퍼
function writeJsonFile<T>(filePath: string, data: T[]): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ID 생성
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ========================
// Users
// ========================
export const users = {
  getAll(): User[] {
    return readJsonFile<User>(USERS_FILE);
  },

  getById(id: string): User | undefined {
    return this.getAll().find(u => u.id === id);
  },

  getByDiscordId(discordId: string): User | undefined {
    return this.getAll().find(u => u.discordId === discordId);
  },

  getByEmail(email: string): User | undefined {
    return this.getAll().find(u => u.email === email);
  },

  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const users = this.getAll();
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeJsonFile(USERS_FILE, users);
    return newUser;
  },

  update(id: string, data: Partial<User>): User | undefined {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    users[index] = {
      ...users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile(USERS_FILE, users);
    return users[index];
  },

  upsertByDiscordId(discordId: string, data: Partial<User>): User {
    const existing = this.getByDiscordId(discordId);
    if (existing) {
      return this.update(existing.id, data)!;
    }
    return this.create({
      name: data.name || 'Unknown',
      email: data.email,
      image: data.image,
      discordId,
    });
  },
};

// ========================
// Summoners
// ========================
export const summoners = {
  getAll(): Summoner[] {
    return readJsonFile<Summoner>(SUMMONERS_FILE);
  },

  getById(id: string): Summoner | undefined {
    return this.getAll().find(s => s.id === id);
  },

  getByPuuid(puuid: string): Summoner | undefined {
    return this.getAll().find(s => s.puuid === puuid);
  },

  getByUserId(userId: string): Summoner[] {
    return this.getAll().filter(s => s.userId === userId);
  },

  getBySummonerName(name: string, tagLine: string): Summoner | undefined {
    return this.getAll().find(
      s => s.summonerName.toLowerCase() === name.toLowerCase() &&
           s.tagLine.toLowerCase() === tagLine.toLowerCase()
    );
  },

  create(summoner: Omit<Summoner, 'id' | 'createdAt' | 'updatedAt'>): Summoner {
    const summoners = this.getAll();
    const newSummoner: Summoner = {
      ...summoner,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    summoners.push(newSummoner);
    writeJsonFile(SUMMONERS_FILE, summoners);
    return newSummoner;
  },

  update(id: string, data: Partial<Summoner>): Summoner | undefined {
    const summoners = this.getAll();
    const index = summoners.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    summoners[index] = {
      ...summoners[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile(SUMMONERS_FILE, summoners);
    return summoners[index];
  },

  delete(id: string): boolean {
    const summoners = this.getAll();
    const filtered = summoners.filter(s => s.id !== id);
    if (filtered.length === summoners.length) return false;
    writeJsonFile(SUMMONERS_FILE, filtered);
    return true;
  },
};

// ========================
// Tournaments
// ========================
export const tournaments = {
  getAll(): Tournament[] {
    return readJsonFile<Tournament>(TOURNAMENTS_FILE);
  },

  getById(id: string): Tournament | undefined {
    return this.getAll().find(t => t.id === id);
  },

  getByCreatorId(creatorId: string): Tournament[] {
    return this.getAll().filter(t => t.creatorId === creatorId);
  },

  create(tournament: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt' | 'participants' | 'matches' | 'blueScore' | 'redScore'>): Tournament {
    const tournaments = this.getAll();
    const newTournament: Tournament = {
      ...tournament,
      id: generateId(),
      participants: [],
      matches: [],
      blueScore: 0,
      redScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tournaments.push(newTournament);
    writeJsonFile(TOURNAMENTS_FILE, tournaments);
    return newTournament;
  },

  update(id: string, data: Partial<Tournament>): Tournament | undefined {
    const tournaments = this.getAll();
    const index = tournaments.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    tournaments[index] = {
      ...tournaments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile(TOURNAMENTS_FILE, tournaments);
    return tournaments[index];
  },

  delete(id: string): boolean {
    const tournaments = this.getAll();
    const filtered = tournaments.filter(t => t.id !== id);
    if (filtered.length === tournaments.length) return false;
    writeJsonFile(TOURNAMENTS_FILE, filtered);
    return true;
  },

  addParticipant(tournamentId: string, participant: Tournament['participants'][0]): Tournament | undefined {
    const tournament = this.getById(tournamentId);
    if (!tournament) return undefined;

    // 이미 참가 중인지 확인
    if (tournament.participants.some(p => p.summonerId === participant.summonerId)) {
      return tournament;
    }

    tournament.participants.push(participant);
    return this.update(tournamentId, { participants: tournament.participants });
  },

  removeParticipant(tournamentId: string, participantId: string): Tournament | undefined {
    const tournament = this.getById(tournamentId);
    if (!tournament) return undefined;

    tournament.participants = tournament.participants.filter(p => p.id !== participantId);
    return this.update(tournamentId, { participants: tournament.participants });
  },

  addMatch(tournamentId: string, match: Tournament['matches'][0]): Tournament | undefined {
    const tournament = this.getById(tournamentId);
    if (!tournament) return undefined;

    tournament.matches.push(match);
    return this.update(tournamentId, { matches: tournament.matches });
  },

  updateMatch(tournamentId: string, matchId: string, data: Partial<Tournament['matches'][0]>): Tournament | undefined {
    const tournament = this.getById(tournamentId);
    if (!tournament) return undefined;

    const matchIndex = tournament.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return undefined;

    tournament.matches[matchIndex] = {
      ...tournament.matches[matchIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // 점수 업데이트
    let blueScore = 0;
    let redScore = 0;
    tournament.matches.forEach(m => {
      if (m.winner === 'BLUE') blueScore++;
      else if (m.winner === 'RED') redScore++;
    });

    return this.update(tournamentId, {
      matches: tournament.matches,
      blueScore,
      redScore,
      status: blueScore >= tournament.winsRequired || redScore >= tournament.winsRequired
        ? 'COMPLETED'
        : tournament.status
    });
  },
};

// ========================
// Fearless Bans
// ========================
export const fearlessBans = {
  getAll(): FearlessBan[] {
    return readJsonFile<FearlessBan>(FEARLESS_BANS_FILE);
  },

  getByTournamentId(tournamentId: string): FearlessBan[] {
    return this.getAll().filter(b => b.tournamentId === tournamentId);
  },

  getBySummonerInTournament(tournamentId: string, summonerPuuid: string): FearlessBan[] {
    return this.getAll().filter(
      b => b.tournamentId === tournamentId && b.summonerPuuid === summonerPuuid
    );
  },

  create(ban: Omit<FearlessBan, 'id' | 'createdAt'>): FearlessBan {
    const bans = this.getAll();

    // 이미 존재하는지 확인
    const existing = bans.find(
      b => b.tournamentId === ban.tournamentId &&
           b.summonerPuuid === ban.summonerPuuid &&
           b.championId === ban.championId
    );
    if (existing) return existing;

    const newBan: FearlessBan = {
      ...ban,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    bans.push(newBan);
    writeJsonFile(FEARLESS_BANS_FILE, bans);
    return newBan;
  },

  deleteByTournamentId(tournamentId: string): void {
    const bans = this.getAll();
    const filtered = bans.filter(b => b.tournamentId !== tournamentId);
    writeJsonFile(FEARLESS_BANS_FILE, filtered);
  },
};
