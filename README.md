# LoL 내전 매니저

리그오브레전드 내전을 쉽게 관리할 수 있는 웹 애플리케이션입니다.

## 주요 기능

### 1. 팀 밸런스
- 솔로랭크 티어 기반 MMR 계산
- 자동 최적 밸런스 매칭
- 랜덤 팀 배정 지원

### 2. 피어리스 모드
- 이전 게임에서 플레이한 챔피언 자동 밴
- 시리즈 내 다양한 챔피언 풀 요구

### 3. 다양한 포맷
- BO1 (단판)
- BO3 (3판 2선승)
- BO5 (5판 3선승)
- BO7 (7판 4선승)

### 4. 게임 기록
- Riot API 연동으로 자동 결과 수집
- KDA, 딜량, 골드, CS 등 상세 통계
- 수동 결과 입력 지원

### 5. 간편한 로그인
- Discord OAuth 로그인
- 별도 회원가입 불필요

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js (Discord Provider)
- **Database**: JSON File Storage (개발용) / PostgreSQL (프로덕션 권장)
- **External API**: Riot Games API

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Discord OAuth
# https://discord.com/developers/applications 에서 애플리케이션 생성
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Riot API
# https://developer.riotgames.com/ 에서 API 키 발급
RIOT_API_KEY="your-riot-api-key"
```

### 3. Discord OAuth 설정

1. [Discord Developer Portal](https://discord.com/developers/applications)에서 새 애플리케이션 생성
2. OAuth2 > General에서 Client ID와 Client Secret 복사
3. OAuth2 > Redirects에 `http://localhost:3000/api/auth/callback/discord` 추가

### 4. Riot API 키 발급

1. [Riot Developer Portal](https://developer.riotgames.com/)에 가입
2. Dashboard에서 Development API Key 발급
3. 프로덕션 사용 시 Production API Key 신청 필요

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

### 6. 프로덕션 빌드

```bash
npm run build
npm start
```

## 사용 방법

1. **Discord로 로그인** - 홈페이지에서 Discord 로그인 버튼 클릭
2. **소환사 등록** - 소환사 관리 페이지에서 Riot ID 입력 (예: 소환사이름#KR1)
3. **내전 생성** - 새 내전 만들기에서 이름, 포맷, 피어리스 여부 설정
4. **참가자 모집** - 생성된 내전 링크를 공유하여 참가자 모집
5. **팀 구성** - 밸런스 맞추기 또는 랜덤 배정으로 팀 구성
6. **게임 진행** - 실제 롤 게임 진행
7. **결과 등록** - Riot 매치 ID 입력 또는 수동으로 승자 선택

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth
│   │   ├── summoners/     # 소환사 API
│   │   ├── tournaments/   # 토너먼트 API
│   │   └── matches/       # 매치 API
│   ├── login/             # 로그인 페이지
│   ├── summoners/         # 소환사 관리 페이지
│   └── tournaments/       # 토너먼트 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── tournament/       # 토너먼트 관련 컴포넌트
│   └── summoner/         # 소환사 관련 컴포넌트
├── lib/                   # 유틸리티 및 서비스
│   ├── auth.ts           # NextAuth 설정
│   ├── db.ts             # JSON 데이터베이스
│   ├── riot-api.ts       # Riot API 클라이언트
│   ├── team-balance.ts   # 팀 밸런스 알고리즘
│   └── utils.ts          # 유틸리티 함수
└── types/                 # TypeScript 타입 정의
```

## 라이선스

MIT License
