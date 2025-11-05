# A2A Agent Registry

AI 에이전트를 등록, 검색, 관리하는 중앙 레지스트리 시스템입니다.

## 주요 기능

### 1. URL 기반 에이전트 관리
- **에이전트 등록**: AgentCard URL만 입력하면 자동으로 fetch 및 등록
- **에이전트 조회**: 등록된 에이전트 목록 조회 및 상세 정보 확인
- **에이전트 삭제**: URL 소유권 검증 후 삭제 가능
- **스킬 관리**: 에이전트의 스킬(기능) 등록 및 조회

### 2. 자동 동기화 시스템
- **주기적 폴링**: 하루 1회 모든 에이전트의 AgentCard URL 확인
- **변경 감지**: 해시 비교를 통한 자동 변경사항 감지
- **상태 관리**: active/inactive/deprecated 자동 상태 전이
- **실패 관리**: 연속 실패 횟수 기록 및 모니터링

### 3. URL 소유권 기반 인증
- **인증 불필요**: 별도의 회원가입, 로그인 절차 없음
- **URL 소유권**: AgentCard를 호스팅하는 것 자체가 소유권 증명
- **권장 경로**: `/.well-known/agent-card.json`

### 4. 데이터 영속성
- **PostgreSQL + pgvector**: 프로덕션급 관계형 데이터베이스
- **JSONB 지원**: 유연한 스키마로 agent card 저장
- **Vector Search**: pgvector를 활용한 semantic search 지원
- **트랜잭션 관리**: ACID 보장으로 데이터 무결성 유지

## 디렉터리 구조

### 전체 구조
```
a2a-registry/
├── backend/              # FastAPI 백엔드 서버
│   ├── app/             # 애플리케이션 메인 디렉토리
│   │   ├── __init__.py
│   │   ├── main.py      # FastAPI 앱 생성 및 라이프사이클
│   │   ├── api/         # API 엔드포인트 (버전별)
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── agents.py      # Agent CRUD 엔드포인트
│   │   │       ├── extensions.py  # Extension 엔드포인트
│   │   │       ├── health.py      # Health check 엔드포인트
│   │   │       └── auth.py        # 인증 엔드포인트
│   │   ├── core/        # 핵심 모듈
│   │   │   ├── __init__.py
│   │   │   ├── config.py          # 설정 관리
│   │   │   ├── database.py        # DB 연결 및 세션
│   │   │   ├── security.py        # JWT, 인증 로직
│   │   │   └── deps.py            # 의존성 주입
│   │   ├── models/      # Database 모델 (SQLAlchemy)
│   │   │   ├── __init__.py
│   │   │   ├── agent.py           # Agent DB 모델
│   │   │   ├── extension.py       # Extension DB 모델
│   │   │   ├── health.py          # HealthStatus DB 모델
│   │   │   └── user.py            # User DB 모델
│   │   ├── schemas/     # API 스키마 (Pydantic)
│   │   │   ├── __init__.py
│   │   │   ├── agent.py           # Agent 요청/응답 스키마
│   │   │   ├── extension.py       # Extension 스키마
│   │   │   └── auth.py            # Auth 스키마
│   │   └── services/    # 비즈니스 로직
│   │       ├── __init__.py
│   │       ├── agent_service.py   # Agent 비즈니스 로직
│   │       ├── extension_service.py # Extension 비즈니스 로직
│   │       ├── health_service.py  # Health check 로직
│   │       └── vector_service.py  # Vector search 로직
│   ├── graphql/         # GraphQL API (선택적)
│   ├── proto/           # gRPC (선택적)
│   ├── cli.py           # CLI 진입점
│   └── exceptions.py    # 예외 정의
│
├── frontend/            # React + TypeScript 프론트엔드
│   ├── src/
│   │   ├── components/  # UI 컴포넌트
│   │   ├── contexts/    # React Context (AuthContext)
│   │   ├── pages/       # 페이지 컴포넌트
│   │   ├── types/       # TypeScript 타입 정의
│   │   └── utils/       # 유틸리티 함수 (API client)
│   ├── package.json
│   └── vite.config.ts
│
├── deploy/              # 배포 관련
│   ├── docker-compose.yml  # Docker Compose 설정
│   ├── Dockerfile.backend  # Backend 이미지
│   └── Dockerfile.frontend # Frontend 이미지
│
├── config/              # 설정 파일
│   └── roles.yaml       # 역할 정의 및 기본 사용자
│
├── tests/               # 테스트 코드
├── .env.example         # 환경 변수 예시
├── pyproject.toml       # Python 프로젝트 설정
└── README.md
```

### Backend 아키텍처 (레이어 구조)

```
┌─────────────────────────────────────────────┐
│           Frontend (React)                  │
└─────────────────┬───────────────────────────┘
                  │ HTTP Request
                  ↓
┌─────────────────────────────────────────────┐
│  API Layer (api/v1/)                        │
│  - HTTP 요청/응답 처리                       │
│  - 인증/권한 확인                            │
│  - 입력 검증 (Pydantic schemas)             │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Service Layer (services/)                  │
│  - 비즈니스 로직                             │
│  - 트랜잭션 관리                             │
│  - 여러 DB 작업 조합                         │
│  - 외부 서비스 호출                          │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Data Layer (models/)                       │
│  - SQLAlchemy ORM 모델                      │
│  - DB 테이블 매핑                            │
│  - CRUD 작업                                 │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  PostgreSQL + pgvector                      │
│  - agents 테이블                             │
│  - extensions 테이블                         │
│  - health_status 테이블                      │
│  - users 테이블                              │
└─────────────────────────────────────────────┘
```

### 데이터 흐름 예시 (Agent 등록)

```
1. Frontend
   POST /api/v1/agents
   { "name": "my-agent", "url": "...", ... }

2. API Layer (api/v1/agents.py)
   - JWT 토큰 검증
   - AgentCard 스키마 검증
   - AgentService 호출

3. Service Layer (services/agent_service.py)
   - 비즈니스 검증 (중복 체크, URL 유효성)
   - Agent 생성/업데이트
   - Health status 초기화
   - Vector embedding 생성
   - 트랜잭션 커밋

4. Data Layer (models/agent.py)
   - AgentModel 인스턴스 생성
   - SQLAlchemy로 INSERT/UPDATE

5. PostgreSQL
   - agents 테이블에 저장
   - health_status 테이블에 초기 상태 저장
```

## API 엔드포인트

### Backend API (http://localhost:8000)

#### 에이전트 관리 (모두 Public API)
- `GET /api/v1/agents` - 등록된 에이전트 목록 조회
- `POST /api/v1/agents` - 새 에이전트 등록 (Body: `{ "agent_card_url": "https://..." }`)
- `GET /api/v1/agents/{agent_id}` - 특정 에이전트 상세 정보
- `DELETE /api/v1/agents/{agent_id}` - 에이전트 삭제 (URL 소유권 검증)
- `POST /api/v1/agents/{agent_id}/verify` - AgentCard URL 수동 검증
- `GET /api/v1/agents/{agent_id}/sync-status` - 동기화 상태 조회
- `POST /api/v1/agents/search` - 에이전트 검색

#### 스킬 관리
- `POST /api/v1/agents/{agent_id}/skills` - 에이전트에 스킬 등록
- `GET /api/v1/agents/{agent_id}/skills` - 에이전트의 스킬 목록 조회

### Frontend Routes (http://localhost:5173)
- `/` - 홈페이지 (에이전트 목록)
- `/register` - 에이전트 등록 페이지
- `/agents` - 에이전트 목록
- `/agents/:id` - 에이전트 상세
- `/wiki/*` - 문서 페이지

## 빠른 시작

### Docker Compose로 실행 (권장)

```bash
# 1. 이미지 빌드
cd deploy
./build.sh

# 2. 서비스 시작
docker compose up -d

# 3. 서비스 접근
# - Frontend: http://localhost:7600
# - Backend API: http://localhost:7601
# - PostgreSQL: localhost:5432
```

### 개발 모드 (로컬)

```bash
# Backend 서버 (포트 8000)
cd backend
python -m app.main

# Frontend 서버 (포트 5173)
cd frontend
npm install
npm run dev
```

### AgentCard 준비 및 등록

Agent 서버에 AgentCard JSON 파일을 호스팅하세요:

```json
// https://myagent.com/.well-known/agent-card.json
{
  "protocolVersion": "0.3.0",
  "name": "my-agent",
  "description": "My AI Agent",
  "url": "https://myagent.com",
  "version": "1.0.0",
  "preferredTransport": "JSONRPC",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false
  },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [...]
}
```

Registry에 AgentCard URL만 입력하면 자동으로 등록됩니다:

```bash
curl -X POST http://localhost:7601/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{"agent_card_url": "https://myagent.com/.well-known/agent-card.json"}'
```

## 기술 스택

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **SQLAlchemy 2.0**: 비동기 ORM
- **PostgreSQL**: 프로덕션 데이터베이스
- **pgvector**: Vector similarity search
- **asyncpg**: PostgreSQL 비동기 드라이버
- **Pydantic**: 데이터 검증 및 직렬화
- **httpx**: HTTP 클라이언트 (AgentCard fetch용)
- **APScheduler**: 백그라운드 작업 스케줄링

### Frontend
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Vite**: 빌드 도구
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트

## 개발 계획

### 완료
- ✅ URL 기반 AgentCard 등록 시스템
- ✅ 자동 동기화 (하루 1회 폴링)
- ✅ A2A v0.3.0 스펙 준수
- ✅ Wiki 문서 (한/영)

### 진행 중
- 🚧 AgentCard 기반 삭제/수정 권한 검증 ([todo_auth.md](todo_auth.md))

### 예정
- 📊 Agent 통계 대시보드
- 🔍 고급 검색 (Vector search)

---
## 라이선스

MIT License
