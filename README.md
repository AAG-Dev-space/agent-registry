# A2A Agent Registry

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

AI 에이전트를 등록, 검색, 관리하는 중앙 레지스트리 시스템입니다.
**A2A (Agent-to-Agent) Protocol v0.3.0** 구현체입니다.

## 🎯 주요 기능

### 1. 이중 등록 모드 (Dual Registration)

#### URL 기반 등록 (URL-based Registration)
- **AgentCard URL 제공**: `/.well-known/agent-card.json` 호스팅
- **자동 동기화**: 매일 새벽 3시 자동 갱신
- **URL 소유권 검증**: 별도 인증 불필요
- **권장 사용**: 동적으로 변경되는 에이전트

#### 수동 등록 (Manual Registration)
- **JSON 직접 입력**: AgentCard를 레지스트리에 직접 제출
- **호스팅 불필요**: URL 없이 등록 가능
- **토큰 기반 삭제**: `x-registry.deleteToken` 사용
- **권장 사용**: 오프라인 또는 정적 에이전트

### 2. 자동 헬스 모니터링

#### AgentCard URL Health Check
- **대상**: URL 기반 등록 에이전트
- **방식**: AgentCard fetch + 검증
- **주기**: 일일 1회 (새벽 3시)
- **상태 전이**: unknown → active → inactive → deprecated

#### Agent Endpoint Health Check
- **대상**: 수동 등록 에이전트
- **방식**: 에이전트 URL로 HTTP GET 요청
- **주기**: 수동 Refresh만 (자동 sync 없음)
- **성공 기준**: HTTP 200만 허용

### 3. 소유권 기반 삭제 검증

#### Token-based Deletion (Priority 1)
```bash
# 수동 등록 에이전트
DELETE /api/v1/agents/{name}
Headers: x-registry-token: <your-secret-token>
```

#### URL-based Deletion (Priority 2)
```bash
# URL 기반 등록 에이전트
DELETE /api/v1/agents/{name}
# AgentCard를 재fetch하여 allowDelete 확인
```

### 4. 실시간 AgentCard 검증
- **필수 필드 체크**: name, url, preferredTransport, skills
- **프로토콜 검증**: JSONRPC/REST/gRPC만 허용
- **x-registry 검증**: 레지스트리 전용 확장 필드
- **실시간 피드백**: 검증 에러 상세 메시지

## �� 빠른 시작

### Docker Compose로 실행 (권장)

```bash
# 1. 이미지 빌드
cd ssai_agent_registry/deploy
./build.sh

# 2. 서비스 시작
docker compose up -d

# 3. 서비스 접근
# Frontend: http://localhost:7600
# Backend API: http://localhost:7601
# API Docs: http://localhost:7601/docs
```

### 개발 모드 (로컬)

**Backend:**
```bash
cd ssai_agent_registry/backend
python -m app.main  # Port 8000
```

**Frontend:**
```bash
cd ssai_agent_registry/frontend
npm install
npm run dev  # Port 5173
```

## 📋 API 엔드포인트

### 에이전트 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/v1/agents/register-by-url` | URL 기반 등록 |
| `POST` | `/api/v1/agents` | 수동 등록 (JSON 직접) |
| `POST` | `/api/v1/agents/verify` | AgentCard URL 검증 (등록 안 함) |
| `GET` | `/api/v1/agents` | 에이전트 목록 조회 |
| `GET` | `/api/v1/agents/{name}` | 에이전트 상세 조회 |
| `POST` | `/api/v1/agents/{name}/sync` | 수동 동기화 + 헬스 체크 |
| `DELETE` | `/api/v1/agents/{name}` | 에이전트 삭제 (소유권 검증) |
| `POST` | `/api/v1/agents/search` | 에이전트 검색 |

### 헬스 체크

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/health` | 서버 헬스 체크 |

**자세한 API 문서**: http://localhost:7601/docs (Swagger UI)

## 📁 프로젝트 구조

```
ssai_agent_registry/
├── backend/                    # FastAPI 백엔드
│   └── app/
│       ├── main.py             # FastAPI 앱 진입점
│       ├── api/v1/             # API 엔드포인트
│       │   └── agents.py       # 에이전트 CRUD
│       ├── core/               # 핵심 모듈
│       │   ├── config.py       # 환경 설정
│       │   ├── database.py     # DB 연결
│       │   └── deps.py         # 의존성 주입
│       ├── models/             # SQLAlchemy 모델
│       │   ├── agent.py        # AgentModel
│       │   └── health.py       # HealthStatusModel
│       ├── schemas/            # Pydantic 스키마
│       │   └── agent.py        # 요청/응답 스키마
│       ├── services/           # 비즈니스 로직
│       │   ├── agent_service.py
│       │   └── verification.py
│       └── scheduler.py        # APScheduler (일일 sync)
│
├── frontend/                   # React 프론트엔드
│   └── src/
│       ├── pages/              # 페이지 컴포넌트
│       │   ├── Home.tsx        # 에이전트 목록
│       │   ├── RegisterAgent.tsx  # 등록 페이지 (URL/Manual)
│       │   ├── AgentDetail.tsx    # 상세 페이지
│       │   └── wiki/           # Wiki 문서
│       ├── components/         # UI 컴포넌트
│       ├── api/                # API 클라이언트
│       └── contexts/           # React Context (i18n)
│
├── deploy/                     # Docker 배포
│   ├── docker-compose.yml      # 서비스 오케스트레이션
│   ├── Dockerfile.backend      # Backend 이미지
│   ├── Dockerfile.frontend     # Frontend 이미지
│   ├── build.sh                # 빌드 스크립트
│   ├── backup_db.sh            # DB 백업
│   └── restore_db.sh           # DB 복원
│
├── CLAUDE.md                   # Claude Code 가이드
├── README.md                   # 프로젝트 개요 (이 파일)
└── README_DETAIL.md            # 상세 문서 (2000+ 줄)
```

## 🏗️ 아키텍처

### 시스템 구조

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────────────┐
│  Frontend (React + Nginx)   │
│  - Agent List               │
│  - Register Agent (2 modes) │
│  - Agent Detail             │
│  - Statistics               │
└──────┬──────────────────────┘
       │ REST API
       ▼
┌─────────────────────────────┐
│  Backend (FastAPI)          │
│  ┌─────────────────────┐    │
│  │  API Layer          │    │
│  └──────┬──────────────┘    │
│         │                   │
│  ┌──────▼──────────────┐    │
│  │  Service Layer      │    │
│  │  - AgentService     │    │
│  │  - Verification     │    │
│  └──────┬──────────────┘    │
│         │                   │
│  ┌──────▼──────────────┐    │
│  │  Model Layer        │    │
│  │  - AgentModel       │    │
│  │  - HealthStatus     │    │
│  └──────┬──────────────┘    │
│         │                   │
│  ┌──────▼──────────────┐    │
│  │  Scheduler          │    │
│  │  Daily Sync (3 AM)  │    │
│  └─────────────────────┘    │
└──────┬──────────────────────┘
       │ SQLAlchemy
       ▼
┌─────────────────────────────┐
│  PostgreSQL 16 + pgvector   │
│  - agents                   │
│  - health_status            │
└─────────────────────────────┘
```

### 데이터베이스 스키마

**agents 테이블:**
- `name` (PK): 에이전트 이름
- `agent_card_url` (nullable): AgentCard 호스팅 URL
- `agent_card` (JSONB): 전체 AgentCard JSON
- `created_at`, `updated_at`

**health_status 테이블:**
- `agent_name` (PK, FK): agents.name
- `status`: active/inactive/deprecated/unknown
- `last_check_at`: 마지막 헬스 체크 시각
- `failure_count`: 연속 실패 횟수 (0~3+)
- `last_response_time_ms`: 응답 시간
- `last_error`: 에러 메시지

## 📖 사용 예시

### 1. URL 기반 등록

**AgentCard 호스팅:**
```json
// https://myagent.com/.well-known/agent-card.json
{
  "protocolVersion": "0.3.0",
  "name": "my-agent",
  "description": "My AI Agent",
  "url": "https://myagent.com",
  "preferredTransport": "JSONRPC",
  "skills": [
    {
      "id": "chat",
      "name": "Chat",
      "description": "Conversational AI",
      "tags": ["nlp", "chatbot"],
      "inputModes": ["text/plain"],
      "outputModes": ["text/plain"]
    }
  ],
  "x-registry": {
    "contact": "admin@myagent.com",
    "owner": "my-company",
    "department": "AI Team",
    "homepage": "https://myagent.com",
    "usageDescription": "Send JSONRPC requests to /api",
    "allowDelete": true
  }
}
```

**등록 요청:**
```bash
curl -X POST http://localhost:7601/api/v1/agents/register-by-url \
  -H "Content-Type: application/json" \
  -d '{"agent_card_url": "https://myagent.com/.well-known/agent-card.json"}'
```

### 2. 수동 등록

**Web UI 사용:**
1. http://localhost:7600/register 접속
2. **Manual** 탭 선택
3. AgentCard JSON 입력 (샘플 복사 버튼 제공)
4. 실시간 검증 확인
5. **Register** 클릭

**중요:** `x-registry.deleteToken` 필드 반드시 설정 (삭제 시 필요)

### 3. 에이전트 삭제

**수동 등록 에이전트:**
1. Agent Detail 페이지에서 **Delete** 버튼 클릭
2. `deleteToken` 입력 모달 표시
3. 등록 시 설정한 토큰 입력
4. **삭제** 클릭

**URL 기반 에이전트:**
1. AgentCard의 `allowDelete: true` 확인
2. Agent Detail 페이지에서 **Delete** 버튼 클릭
3. 확인 다이얼로그에서 **OK** 클릭

## 🔧 기술 스택

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **SQLAlchemy 2.0**: 비동기 ORM
- **PostgreSQL 16**: 프로덕션 데이터베이스
- **pgvector**: Vector similarity search (향후 사용)
- **asyncpg**: PostgreSQL 비동기 드라이버
- **Pydantic**: 데이터 검증
- **httpx**: 비동기 HTTP 클라이언트
- **APScheduler**: 백그라운드 스케줄링

### Frontend
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Vite**: 빌드 도구
- **Tailwind CSS**: 유틸리티 CSS
- **React Router**: 클라이언트 라우팅
- **Axios**: HTTP 클라이언트
- **Lucide React**: 아이콘

### Infrastructure
- **Docker Compose**: 컨테이너 오케스트레이션
- **Nginx**: 정적 파일 서빙 + 리버스 프록시

## 🛠️ 관리 및 운영

### 데이터베이스 백업

```bash
cd deploy
./backup_db.sh
```

백업 파일: `backups/a2a_registry_backup_YYYYMMDD_HHMMSS.sql.gz`

### 데이터베이스 복원

```bash
cd deploy
./restore_db.sh backups/a2a_registry_backup_20251119_030000.sql.gz
```

### 로그 확인

```bash
# 전체 로그
docker compose logs -f

# Backend만
docker compose logs -f backend

# Frontend만
docker compose logs -f frontend
```

### 서비스 재시작

```bash
docker compose restart backend
docker compose restart frontend
```

### 헬스 체크

```bash
# Backend
curl http://localhost:7601/health

# Frontend
curl http://localhost:7600
```

## 📚 문서

- **[README_DETAIL.md](README_DETAIL.md)** - 상세 문서 (2000+ 줄)
  - 시스템 아키텍처
  - 데이터베이스 설계
  - API 명세
  - 배포 가이드
  - 개발 가이드
  - 운영 가이드

- **[CLAUDE.md](CLAUDE.md)** - Claude Code 개발 가이드
  - 프로젝트 개요
  - 코드 구조
  - 개발 명령어
  - A2A 프로토콜 준수 사항

- **[a2a_spec_v0.3.0.md](a2a_spec_v0.3.0.md)** - A2A 프로토콜 명세

- **[todo_auth.md](todo_auth.md)** - 인증/권한 계획 (완료)

## 🗺️ 로드맵

### ✅ 완료된 기능
- URL 기반 AgentCard 등록
- 수동 AgentCard 등록 (JSON 직접 입력)
- 자동 헬스 모니터링 (일일 sync)
- 토큰 기반 삭제 검증
- Agent URL 헬스 체크 fallback
- 실시간 JSON 검증
- 다국어 지원 (한국어/영어)
- Delete 모달 UI (토큰 입력)
- A2A v0.3.0 프로토콜 준수

### 🚧 진행 중
- 통계 대시보드
- 사용량 분석

### 📋 계획 중
- Vector 기반 시맨틱 검색
- 카테고리별 에이전트 분류
- 인증/권한 시스템 (선택적)
- API Rate Limiting
- Webhook 알림

## ⚙️ 환경 변수

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://a2a_user:password@postgres:5432/a2a_registry

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:7600"]

# Debug
DEBUG=false
```

### Frontend (.env)

```bash
VITE_API_URL=/api
```

## 🧪 테스트

```bash
cd backend

# 전체 테스트
pytest

# 커버리지 포함
pytest --cov=backend/app --cov-report=term-missing

# 특정 테스트
pytest backend/tests/endpoints/test_agents.py
```

## 🤝 기여 방법

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 라이선스

MIT License

## 📞 문의

- Issues: [GitHub Issues](repository-url/issues)
- Email: [연락처]

---

**Made with ❤️ by A2A Team**
