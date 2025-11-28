# A2A Agent Registry - Detailed Documentation

## 목차 (Table of Contents)

1. [개요 (Overview)](#개요-overview)
2. [시스템 아키텍처 (System Architecture)](#시스템-아키텍처-system-architecture)
3. [데이터베이스 설계 (Database Design)](#데이터베이스-설계-database-design)
4. [백엔드 아키텍처 (Backend Architecture)](#백엔드-아키텍처-backend-architecture)
5. [프론트엔드 아키텍처 (Frontend Architecture)](#프론트엔드-아키텍처-frontend-architecture)
6. [핵심 기능 (Key Features)](#핵심-기능-key-features)
7. [API 명세 (API Specification)](#api-명세-api-specification)
8. [배포 가이드 (Deployment Guide)](#배포-가이드-deployment-guide)
9. [개발 가이드 (Development Guide)](#개발-가이드-development-guide)
10. [운영 가이드 (Operations Guide)](#운영-가이드-operations-guide)

---

## 개요 (Overview)

### 프로젝트 소개

A2A Agent Registry는 **Agent-to-Agent (A2A) Protocol v0.3.0**을 구현한 중앙 집중식 AI 에이전트 레지스트리입니다. 에이전트 발견, 등록, 관리 및 헬스 모니터링 기능을 제공합니다.

### 핵심 개념

**AgentCard URL 소유권 = 에이전트 소유권**
- 전통적인 인증 시스템 없음
- AgentCard를 호스팅하는 URL이 소유권 증명
- 수동 등록의 경우 deleteToken 기반 소유권 증명

### 기술 스택

**Backend:**
- FastAPI (Python 비동기 웹 프레임워크)
- PostgreSQL 16 + pgvector (벡터 검색 지원)
- SQLAlchemy (비동기 ORM)
- APScheduler (백그라운드 작업 스케줄링)
- httpx (비동기 HTTP 클라이언트)

**Frontend:**
- React 19 + TypeScript
- React Router (클라이언트 라우팅)
- Axios (HTTP 클라이언트)
- Tailwind CSS (스타일링)
- Lucide React (아이콘)

**Infrastructure:**
- Docker Compose (오케스트레이션)
- Nginx (정적 파일 서빙 및 리버스 프록시)

---

## 시스템 아키텍처 (System Architecture)

### 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                          사용자 (User)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Nginx)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ AgentList    │  │ RegisterAgent│  │ AgentDetail  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Statistics   │  │ Wiki Pages   │  │ Layout       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  API Client (Axios) ────────────────────────────────────────▶   │
└───────────────────────────────────┬──────────────────────────────┘
                                    │ HTTP/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                           │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              API Layer (api/v1/)                       │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │     │
│  │  │ Agents   │  │ Health   │  │ Search   │             │     │
│  │  └──────────┘  └──────────┘  └──────────┘             │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │           Service Layer (services/)                    │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │     │
│  │  │AgentService  │  │HealthService │  │Verification  │ │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       ▼                                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │            Model Layer (models/)                       │     │
│  │  ┌──────────────┐  ┌──────────────┐                   │     │
│  │  │ AgentModel   │  │HealthStatus  │                   │     │
│  │  └──────────────┘  └──────────────┘                   │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│  ┌────────────────────┴───────────────────────────────────┐     │
│  │          Scheduler (APScheduler)                       │     │
│  │  Daily Sync Job (3:00 AM) ─▶ sync_all_agents()       │     │
│  └────────────────────────────────────────────────────────┘     │
└───────────────────────────────────┬──────────────────────────────┘
                                    │ SQLAlchemy (async)
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                PostgreSQL 16 + pgvector                          │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ agents       │  │ health_status│                             │
│  │ (JSONB card) │  │ (metrics)    │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

**1. URL 기반 등록 (URL-based Registration)**
```
User → Frontend → POST /register-by-url → Backend
     → Fetch AgentCard from URL → Validate → Store in DB
     → Schedule daily sync
```

**2. 수동 등록 (Manual Registration)**
```
User → Frontend → Paste JSON → Validate → POST /agents
     → Backend → Force allowDelete=true → Store in DB
     → No auto-sync (static AgentCard)
```

**3. 헬스 체크 (Health Check)**
```
Scheduler (3 AM) → sync_all_agents()
  ├─ URL-based agents: Fetch AgentCard → Update DB
  └─ Manual agents: Ping agent URL → Update health status
```

**4. 삭제 검증 (Delete Verification)**
```
DELETE /agents/{name}
  ├─ Priority 1: Token-based (x-registry-token header)
  └─ Priority 2: URL-based (re-fetch AgentCard)
```

---

## 데이터베이스 설계 (Database Design)

### ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────┐
│            agents                        │
├─────────────────────────────────────────┤
│ name              VARCHAR(255) PK        │
│ agent_card_url    VARCHAR(512) NULLABLE │ ◀── URL 기반 등록 시에만 존재
│ agent_card        JSONB NOT NULL        │ ◀── 전체 AgentCard JSON
│ embedding         VECTOR(384) NULLABLE  │ ◀── 미사용 (향후 시맨틱 검색용)
│ created_at        TIMESTAMP             │
│ updated_at        TIMESTAMP             │
└────────────┬────────────────────────────┘
             │ 1:1
             │
             │ FK: agent_name
┌────────────▼────────────────────────────┐
│        health_status                     │
├─────────────────────────────────────────┤
│ agent_name           VARCHAR(255) PK    │
│ status               VARCHAR(50)        │ ◀── active/inactive/deprecated/unknown
│ last_check_at        TIMESTAMP          │
│ last_response_time_ms INTEGER           │
│ failure_count        INTEGER            │ ◀── 0~3+ (3+ = deprecated)
│ last_error           VARCHAR(512)       │
│ created_at           TIMESTAMP          │
│ updated_at           TIMESTAMP          │
└─────────────────────────────────────────┘
```

### 테이블 상세 설명

#### `agents` 테이블

**용도:** 에이전트 메타데이터 및 AgentCard 저장

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `name` | VARCHAR(255) | PRIMARY KEY | 에이전트 고유 식별자 |
| `agent_card_url` | VARCHAR(512) | NULLABLE | AgentCard 호스팅 URL (URL 기반 등록만) |
| `agent_card` | JSONB | NOT NULL | 전체 AgentCard JSON |
| `embedding` | VECTOR(384) | NULLABLE | 임베딩 벡터 (미사용, 향후 확장) |
| `created_at` | TIMESTAMP | NOT NULL | 생성 시각 (UTC) |
| `updated_at` | TIMESTAMP | NOT NULL | 수정 시각 (UTC) |

**인덱스:**
- Primary Key: `name` (클러스터드 인덱스)

**JSONB 구조 (`agent_card`):**
```json
{
  "name": "agent-name",
  "description": "Agent description",
  "url": "https://agent-endpoint.com",
  "protocolVersion": "0.3.0",
  "version": "1.0.0",
  "preferredTransport": "JSONRPC",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false,
    "stateTransitionHistory": false
  },
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [
    {
      "id": "skill-id",
      "name": "Skill Name",
      "description": "Skill description",
      "tags": ["tag1", "tag2"],
      "inputModes": ["text/plain"],
      "outputModes": ["text/plain"],
      "parameters": {}
    }
  ],
  "x-registry": {
    "contact": "owner@example.com",
    "owner": "owner-id",
    "department": "Department Name",
    "homepage": "https://homepage.com",
    "usageDescription": "How to use this agent",
    "allowDelete": true,
    "deleteToken": "secret-token-123"
  }
}
```

#### `health_status` 테이블

**용도:** 에이전트 가용성 및 헬스 메트릭 추적

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| `agent_name` | VARCHAR(255) | PRIMARY KEY, FK | agents.name 참조 |
| `status` | VARCHAR(50) | NOT NULL | 헬스 상태 (active/inactive/deprecated/unknown) |
| `last_check_at` | TIMESTAMP | NULLABLE | 마지막 헬스 체크 시각 |
| `last_response_time_ms` | INTEGER | NULLABLE | 마지막 응답 시간 (밀리초) |
| `failure_count` | INTEGER | NOT NULL, DEFAULT 0 | 연속 실패 횟수 (0~3+) |
| `last_error` | VARCHAR(512) | NULLABLE | 마지막 에러 메시지 |
| `created_at` | TIMESTAMP | NOT NULL | 생성 시각 |
| `updated_at` | TIMESTAMP | NOT NULL | 수정 시각 |

**상태 전이 규칙:**
```
unknown (초기 상태)
  │
  ├─ Sync Success ──▶ active (failure_count = 0)
  │
  └─ Sync Failure ──▶ inactive (failure_count = 1~2)
                        │
                        └─ 3+ Failures ──▶ deprecated
```

---

## 백엔드 아키텍처 (Backend Architecture)

### 디렉토리 구조

```
backend/
├── app/
│   ├── main.py                    # FastAPI 앱 진입점
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py        # API 라우터 집합
│   │       └── agents.py          # 에이전트 엔드포인트
│   ├── core/
│   │   ├── config.py              # 환경 설정
│   │   ├── database.py            # DB 연결 및 세션
│   │   └── deps.py                # 의존성 주입
│   ├── models/
│   │   ├── agent.py               # AgentModel (SQLAlchemy)
│   │   └── health.py              # HealthStatusModel
│   ├── schemas/
│   │   └── agent.py               # Pydantic 스키마 (요청/응답)
│   ├── services/
│   │   ├── agent_service.py       # 비즈니스 로직
│   │   └── verification.py        # 소유권 검증
│   └── scheduler.py               # APScheduler 설정
├── tests/
│   ├── conftest.py                # Pytest 픽스처
│   ├── test_lifecycle.py          # E2E 테스트
│   └── endpoints/
│       ├── test_agents.py
│       └── ...
└── requirements.txt
```

### API 엔드포인트 (`api/v1/agents.py`)

#### 등록 엔드포인트

**1. POST `/api/v1/agents` - 수동 등록**
```python
@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def register_agent(
    agent_card: AgentCardRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    수동 등록: AgentCard JSON을 직접 제출
    - agent_card_url 없음
    - x-registry.allowDelete 강제로 True 설정
    - x-registry.deleteToken 필수
    """
```

**2. POST `/api/v1/agents/register-by-url` - URL 기반 등록**
```python
@router.post("/register-by-url", response_model=dict)
async def register_by_url(
    request: RegisterByUrlRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    URL 기반 등록: AgentCard URL 제공
    - URL에서 AgentCard 자동 fetch
    - 일일 자동 동기화 활성화
    """
```

**3. POST `/api/v1/agents/verify` - 검증만 수행**
```python
@router.post("/verify", response_model=dict)
async def verify_agent_card(
    request: VerifyAgentCardRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    등록 없이 AgentCard URL 검증
    - 프론트엔드 미리보기용
    - 상세한 검증 에러 반환
    """
```

#### 조회 엔드포인트

**4. GET `/api/v1/agents` - 전체 목록**
```python
@router.get("", response_model=dict)
async def list_agents(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    페이지네이션 지원
    - 각 에이전트에 health_status 포함
    """
```

**5. GET `/api/v1/agents/{agent_id}` - 상세 정보**
```python
@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    특정 에이전트 상세 정보
    - health_status 포함
    """
```

#### 관리 엔드포인트

**6. POST `/api/v1/agents/{agent_id}/sync` - 수동 동기화**
```python
@router.post("/{agent_id}/sync", response_model=AgentResponse)
async def sync_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    AgentCard 즉시 동기화 + 헬스 체크
    - URL 기반: AgentCard fetch
    - 수동 등록: 엔드포인트 ping
    """
```

**7. DELETE `/api/v1/agents/{agent_id}` - 삭제**
```python
@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    x_registry_token: str | None = Header(None),
):
    """
    소유권 검증 후 삭제
    Priority 1: 토큰 검증 (x-registry-token 헤더)
    Priority 2: URL 검증 (AgentCard 재fetch)
    """
```

**8. POST `/api/v1/agents/search` - 검색**
```python
@router.post("/search", response_model=dict)
async def search_agents(
    request: AgentSearchRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    간단한 텍스트 검색
    - name, description 대상
    - 대소문자 무시
    """
```

### 서비스 레이어 (`services/agent_service.py`)

#### 핵심 메서드

**1. `register_agent(agent_card)` - 등록/업데이트**
```python
async def register_agent(self, agent_card: dict) -> dict:
    """
    에이전트 등록 또는 업데이트

    처리 흐름:
    1. 필수 필드 검증 (name, url, preferredTransport, skills)
    2. 중복 URL 체크
    3. 수동 등록일 경우 x-registry.allowDelete = True 강제
    4. 기존 에이전트 존재 시 UPDATE, 없으면 INSERT
    5. health_status 초기화 (status='unknown')
    6. agent_card_url 존재 시 즉시 검증 및 헬스 체크
    """
```

**2. `sync_agent_card(agent_id)` - 동기화**
```python
async def sync_agent_card(self, agent_id: str) -> dict:
    """
    에이전트 동기화 (2가지 모드)

    Mode 1: AgentCard URL 기반 (agent_card_url 존재)
      1. URL에서 AgentCard fetch
      2. 검증 수행
      3. DB에 agent_card 업데이트
      4. health_status 업데이트

    Mode 2: Agent URL 기반 (agent_card_url 없음, 수동 등록)
      1. agent.url로 GET 요청
      2. HTTP 200 여부만 체크
      3. health_status만 업데이트 (agent_card 고정)
    """
```

**3. `verify_agent_card_url(url)` - 검증**
```python
async def verify_agent_card_url(self, url: str) -> dict:
    """
    AgentCard URL 검증

    반환값:
    {
        "success": bool,
        "agent_card": dict | None,
        "error": str | None,
        "validation_errors": list[str],
        "response_time_ms": int
    }

    검증 항목:
    - HTTP 접근 가능 여부 (10s timeout)
    - JSON 파싱 가능 여부
    - 필수 필드 존재 여부
    - preferredTransport 값 유효성 (JSONRPC/REST/gRPC)
    - x-registry 필드 검증
    """
```

**4. `ping_agent_endpoint(url)` - 엔드포인트 헬스 체크**
```python
async def ping_agent_endpoint(self, agent_url: str) -> dict:
    """
    에이전트 엔드포인트 직접 체크 (수동 등록 전용)

    방식: HTTP GET 요청
    성공 기준: HTTP 200만 허용

    기존 문제: HTTP 405도 성공으로 처리 → False Positive
    개선: HTTP 200만 성공으로 처리
    """
```

**5. `sync_all_agents()` - 일괄 동기화**
```python
async def sync_all_agents(self) -> dict:
    """
    모든 에이전트 동기화 (스케줄러 전용)

    처리:
    - 모든 에이전트 순회
    - 각 에이전트별 sync_agent_card() 호출
    - 개별 실패해도 계속 진행
    - 성공/실패 통계 반환

    호출: 매일 새벽 3시 (APScheduler)
    """
```

### 검증 서비스 (`services/verification.py`)

**소유권 검증 로직:**
```python
async def verify_delete_permission(agent_card_url: str) -> Tuple[bool, str]:
    """
    삭제 권한 검증 (URL 기반)

    Process:
    1. agent_card_url에서 현재 AgentCard fetch
    2. x-registry.allowDelete 확인 (기본값: True)
    3. False면 삭제 거부
    4. True면 삭제 허용

    에러 처리:
    - HTTP 에러 → (False, "Failed to fetch AgentCard")
    - JSON 파싱 에러 → (False, "Invalid AgentCard JSON")
    - allowDelete=false → (False, "Delete not allowed")
    """
```

### 스케줄러 (`scheduler.py`)

**일일 동기화 작업:**
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = AsyncIOScheduler()

# 매일 새벽 3시에 실행
scheduler.add_job(
    sync_all_agents_job,
    trigger=CronTrigger(hour=3, minute=0),
    id='sync_all_agents',
    name='Sync all agents daily',
    replace_existing=True,
)

# FastAPI 라이프사이클에 연결
@app.on_event("startup")
async def start_scheduler():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_scheduler():
    scheduler.shutdown()
```

---

## 프론트엔드 아키텍처 (Frontend Architecture)

### 디렉토리 구조

```
frontend/
├── src/
│   ├── main.tsx                   # React 진입점
│   ├── App.tsx                    # 메인 앱 (라우터 설정)
│   ├── pages/
│   │   ├── Home.tsx               # 에이전트 목록
│   │   ├── AgentDetail.tsx        # 에이전트 상세
│   │   ├── RegisterAgent.tsx      # 등록 페이지 (URL/Manual)
│   │   ├── Statistics.tsx         # 통계 대시보드
│   │   ├── Health.tsx             # 헬스 체크
│   │   └── wiki/
│   │       ├── GettingStarted.tsx
│   │       ├── TermsSpecs.tsx
│   │       └── Roadmap.tsx
│   ├── components/
│   │   ├── Layout.tsx             # 공통 레이아웃
│   │   ├── AgentCard.tsx          # 에이전트 카드
│   │   ├── AgentCardPreview.tsx   # 미리보기
│   │   ├── AgentModal.tsx         # 모달
│   │   └── LanguageToggle.tsx     # 언어 전환
│   ├── contexts/
│   │   └── LanguageContext.tsx    # i18n 컨텍스트
│   ├── api/
│   │   └── client.ts              # Axios API 클라이언트
│   ├── types/
│   │   └── agent.ts               # TypeScript 타입 정의
│   └── index.css                  # Tailwind CSS
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 주요 페이지

#### 1. AgentList (`/agents`)

**기능:**
- 전체 에이전트 그리드 뷰
- 스킬별 필터링 (태그 클릭)
- 헬스 상태 배지 (active/inactive/deprecated)
- 에이전트 이름 기반 아이콘 선택

**상태 관리:**
```typescript
const [agents, setAgents] = useState<AgentCard[]>([]);
const [selectedTag, setSelectedTag] = useState<string | null>(null);
const [loading, setLoading] = useState(true);
```

**핵심 로직:**
```typescript
// 태그 필터링
const filteredAgents = selectedTag
  ? agents.filter(agent =>
      agent.skills?.some(skill => skill.id === selectedTag)
    )
  : agents;

// 에이전트 로드
useEffect(() => {
  const loadAgents = async () => {
    const data = await agentApi.listAgents();
    setAgents(data);
  };
  loadAgents();
}, []);
```

#### 2. RegisterAgent (`/register`)

**기능:**
- 2가지 등록 모드 (탭 UI)
  - **URL Mode**: AgentCard URL 입력 → 자동 fetch 및 검증
  - **Manual Mode**: JSON 직접 입력 → 실시간 검증
- 단계별 안내 (Step 1, 2, 3)
- 샘플 JSON 제공 (복사 버튼)
- 실시간 JSON 검증 및 에러 표시
- AgentCard 미리보기
- 다국어 지원 (한국어/영어)

**URL Mode 흐름:**
```typescript
// Step 1: URL 입력 및 검증
const handleVerifyUrl = async () => {
  const result = await agentApi.verifyAgentCardUrl(agentCardUrl);
  if (result.success) {
    setVerificationStatus('success');
    setVerifiedAgentCard(result.agent_card);
  } else {
    setVerificationStatus('error');
    setValidationErrors(result.validation_errors);
  }
};

// Step 2: 검증된 AgentCard 미리보기

// Step 3: 등록
const handleSubmit = async () => {
  await agentApi.registerAgentByUrl(agentCardUrl);
  navigate('/agents');
};
```

**Manual Mode 흐름:**
```typescript
// JSON 입력 및 실시간 검증
const validateManualJson = (jsonText: string) => {
  const parsed = JSON.parse(jsonText);
  const errors: string[] = [];

  // 필수 필드 체크
  if (!parsed.name) errors.push('Missing: name');
  if (!parsed.url) errors.push('Missing: url');
  if (!parsed.preferredTransport) errors.push('Missing: preferredTransport');
  if (!parsed.skills?.length) errors.push('Missing: skills');

  // x-registry 체크
  if (!parsed['x-registry']?.contact) errors.push('Missing: x-registry.contact');
  if (!parsed['x-registry']?.owner) errors.push('Missing: x-registry.owner');
  // ... 기타 필드

  if (errors.length > 0) {
    setValidationErrors(errors);
  } else {
    setPreviewAgentCard(parsed);
  }
};

// 등록
const handleSubmit = async () => {
  await agentApi.registerAgent(previewAgentCard);
  navigate('/agents');
};
```

**샘플 AgentCard:**
```typescript
const sampleAgentCard = {
  name: "my-agent",
  description: "Description of your agent",
  url: "http://your-domain.com",
  preferredTransport: "JSONRPC",
  skills: [
    {
      id: "skill-id",
      name: "Skill Name",
      description: "Skill description",
      tags: ["tag1", "tag2"],
      inputModes: ["text/plain"],
      outputModes: ["text/plain"],
      parameters: {}
    }
  ],
  "x-registry": {
    contact: "agent-owner@example.com",
    owner: "knoxid",
    department: "AI Research Team",
    homepage: "http://example.com/my-agent",
    usageDescription: "Send JSONRPC 2.0 requests...",
    deleteToken: "your-secret-delete-token-here"
  }
};
```

#### 3. AgentDetail (`/agents/:agentId`)

**기능:**
- 에이전트 상세 정보 표시
- 소유자 정보 (x-registry)
- 헬스 상태 메트릭
- 스킬 및 역량 상세
- Refresh 버튼 (수동 동기화)
- Delete 버튼 (소유권 검증)
  - URL 기반: 확인 다이얼로그
  - 수동 등록: 토큰 입력 모달

**핵심 로직:**
```typescript
// 삭제 처리 (모드 자동 감지)
const handleDelete = () => {
  const hasAgentCardUrl = agent.agent_card_url;

  if (!hasAgentCardUrl) {
    // 수동 등록 → 토큰 모달
    setShowDeleteModal(true);
  } else {
    // URL 기반 → 확인 다이얼로그
    if (confirm(`Delete agent "${agent.name}"?`)) {
      handleDeleteWithToken(undefined);
    }
  }
};

// 토큰 기반 삭제
const handleDeleteWithToken = async (token?: string) => {
  await agentApi.deleteAgent(agentId, token);
  navigate('/agents');
};
```

**Delete 모달 (수동 등록 전용):**
```tsx
{showDeleteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl max-w-md p-6">
      {/* 경고 메시지 */}
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p>등록 시 설정한 <strong>deleteToken</strong>을 입력해야 합니다.</p>
      </div>

      {/* 토큰 입력 */}
      <input
        type="text"
        value={deleteToken}
        onChange={(e) => setDeleteToken(e.target.value)}
        placeholder="deleteToken 입력"
      />

      {/* 버튼 */}
      <button onClick={() => setShowDeleteModal(false)}>취소</button>
      <button
        onClick={() => handleDeleteWithToken(deleteToken)}
        disabled={!deleteToken.trim()}
      >
        삭제
      </button>
    </div>
  </div>
)}
```

### API 클라이언트 (`api/client.ts`)

**Axios 설정:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증 토큰 자동 주입 (향후 사용)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**API 메서드:**
```typescript
export const agentApi = {
  // 등록
  registerAgent: async (agentCard: AgentCard) => {
    const response = await apiClient.post('/v1/agents', agentCard);
    return response.data;
  },

  registerAgentByUrl: async (url: string) => {
    const response = await apiClient.post('/v1/agents/register-by-url', {
      agent_card_url: url,
    });
    return response.data;
  },

  // 검증
  verifyAgentCardUrl: async (url: string) => {
    const response = await apiClient.post('/v1/agents/verify', { url });
    return response.data;
  },

  // 조회
  listAgents: async () => {
    const response = await apiClient.get('/v1/agents');
    return response.data.agents;
  },

  getAgent: async (agentId: string) => {
    const response = await apiClient.get(`/v1/agents/${agentId}`);
    return response.data;
  },

  // 관리
  refreshAgentCard: async (agentId: string) => {
    const response = await apiClient.post(`/v1/agents/${agentId}/sync`);
    return response.data;
  },

  deleteAgent: async (agentId: string, token?: string) => {
    const response = await apiClient.delete(`/v1/agents/${agentId}`, {
      headers: token ? { 'x-registry-token': token } : {},
    });
    return response.data;
  },

  // 검색
  searchAgents: async (query: string) => {
    const response = await apiClient.post('/v1/agents/search', { query });
    return response.data.agents;
  },
};
```

### 상태 관리

**LanguageContext (i18n):**
```typescript
const LanguageContext = createContext<{
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;
  t: (ko: string, en: string) => string;
}>({
  language: 'ko',
  setLanguage: () => {},
  t: (ko, en) => ko,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  const t = (ko: string, en: string) => {
    return language === 'ko' ? ko : en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 사용 예시
const { t } = useLanguage();
<h1>{t('에이전트 등록', 'Register Agent')}</h1>
```

---

## 핵심 기능 (Key Features)

### 1. 이중 등록 모드 (Dual Registration)

#### URL 기반 등록

**특징:**
- AgentCard를 공개 URL에 호스팅 필요
- 레지스트리가 자동으로 fetch 및 검증
- 일일 자동 동기화 (새벽 3시)
- 에이전트가 AgentCard 제어 유지

**권장 URL:**
```
https://your-domain.com/.well-known/agent-card.json
```

**등록 흐름:**
```
1. User: AgentCard를 /.well-known/agent-card.json에 호스팅
2. User: 레지스트리에 URL 제출
3. Registry: URL에서 AgentCard fetch
4. Registry: 필수 필드 검증
5. Registry: DB에 저장 (agent_card_url + agent_card)
6. Scheduler: 매일 새벽 3시 자동 동기화
```

**장점:**
- 에이전트 정보 중앙 관리 (자신의 서버)
- 자동 업데이트 (AgentCard 수정 → 다음날 반영)
- 삭제 제어 (allowDelete 필드로 제어)

**단점:**
- 공개 URL 호스팅 필요
- HTTPS 권장 (보안)

#### 수동 등록

**특징:**
- AgentCard JSON을 직접 붙여넣기
- URL 호스팅 불필요
- 자동 동기화 없음 (static AgentCard)
- `x-registry.allowDelete` 강제로 `true`
- `x-registry.deleteToken` 필수

**등록 흐름:**
```
1. User: RegisterAgent 페이지 → Manual 탭
2. User: AgentCard JSON 작성 (샘플 복사 가능)
3. Frontend: 실시간 JSON 검증
4. User: 등록 클릭
5. Registry: 서버 검증
6. Registry: x-registry.allowDelete = true 강제 설정
7. Registry: DB에 저장 (agent_card_url = NULL)
```

**장점:**
- URL 호스팅 불필요
- 오프라인 에이전트 지원
- 즉시 등록 가능

**단점:**
- 자동 동기화 없음 (수동 업데이트 필요)
- deleteToken 분실 시 삭제 불가능

### 2. 헬스 모니터링

#### Mode 1: AgentCard URL Health Check

**대상:** URL 기반 등록 에이전트

**방식:**
```
1. agent_card_url에서 AgentCard fetch (10s timeout)
2. HTTP 200 응답 확인
3. JSON 파싱 가능 여부
4. 필수 필드 검증
5. 성공 → agent_card 업데이트 + health_status='active'
6. 실패 → failure_count++, health_status 업데이트
```

**트리거:**
- 등록 시 즉시 1회
- 수동 Sync 버튼 클릭
- 일일 자동 동기화 (3 AM)

#### Mode 2: Agent Endpoint Health Check

**대상:** 수동 등록 에이전트 (agent_card_url 없음)

**방식:**
```
1. agent.url로 GET 요청 (10s timeout)
2. HTTP 200 응답 확인
3. 성공 → health_status='active'
4. 실패 → failure_count++
```

**트리거:**
- 수동 Sync 버튼 클릭만 (자동 동기화 없음)

**중요:** HTTP 405 등 다른 상태 코드는 실패로 처리 (엄격한 검증)

#### 상태 전이

```
unknown (초기)
  │
  ├─ Success ──▶ active (failure_count=0)
  │
  └─ Failure ──▶ inactive (failure_count=1~2)
                   │
                   └─ 3+ Failures ──▶ deprecated
```

### 3. 소유권 검증 및 삭제

#### 토큰 기반 삭제 (Priority 1)

**대상:** 수동 등록 에이전트

**방식:**
```
DELETE /api/v1/agents/{name}
Headers: x-registry-token: <secret-token>

Backend:
1. DB에서 agent 조회
2. x-registry.allowDelete 확인 (false면 거부)
3. 제공된 토큰과 x-registry.deleteToken 비교
4. 일치 → 삭제 허용
5. 불일치 → 403 Forbidden
```

**UI 흐름:**
```
1. User: Agent Detail 페이지 → Delete 버튼
2. Frontend: agent_card_url 없음 감지 → 모달 표시
3. User: deleteToken 입력
4. Frontend: DELETE 요청 (x-registry-token 헤더)
5. Backend: 토큰 검증 → 삭제
6. Frontend: 목록 페이지로 이동
```

#### URL 기반 삭제 (Priority 2)

**대상:** URL 기반 등록 에이전트

**방식:**
```
DELETE /api/v1/agents/{name}
(토큰 헤더 없음)

Backend:
1. DB에서 agent 조회
2. x-registry.allowDelete 확인 (false면 거부)
3. agent_card_url에서 현재 AgentCard 재fetch
4. 재fetch한 AgentCard의 x-registry.allowDelete 확인
5. true → 삭제 허용
6. false → 403 Forbidden
```

**UI 흐름:**
```
1. User: Agent Detail 페이지 → Delete 버튼
2. Frontend: agent_card_url 존재 감지 → 확인 다이얼로그
3. User: 확인
4. Frontend: DELETE 요청
5. Backend: URL 검증 → 삭제
6. Frontend: 목록 페이지로 이동
```

### 4. AgentCard 검증

#### 필수 필드

**기본 정보:**
- `name` (string): 에이전트 이름
- `description` (string): 설명
- `url` (string): 에이전트 엔드포인트 URL
- `preferredTransport` (enum): `JSONRPC` | `REST` | `gRPC`

**스킬:**
- `skills` (array): 최소 1개 이상
  - `id` (string): 스킬 ID
  - `name` (string): 스킬 이름
  - `description` (string): 스킬 설명
  - `tags` (array): 태그 목록
  - `inputModes` (array): 입력 모드
  - `outputModes` (array): 출력 모드

**x-registry (레지스트리 확장):**
- `contact` (string): 연락처 이메일
- `owner` (string): 소유자 ID
- `department` (string): 부서명
- `homepage` (string): 홈페이지 URL
- `usageDescription` (string): 사용 방법 설명

#### 선택 필드 (기본값 권장)

- `protocolVersion`: `"0.3.0"` (A2A 프로토콜 버전)
- `version`: `"0.0"` (에이전트 버전)
- `capabilities`: `{streaming: false, pushNotifications: false, stateTransitionHistory: false}`
- `defaultInputModes`: `["text/plain"]`
- `defaultOutputModes`: `["text/plain"]`

**주의:** 백엔드는 기본값을 자동 할당하지 않음. 프론트엔드 문서에만 권장사항 표시.

### 5. 자동 동기화 스케줄러

**설정:**
```python
# 매일 새벽 3시 실행
CronTrigger(hour=3, minute=0)
```

**동작:**
```
1. sync_all_agents() 호출
2. DB에서 모든 에이전트 조회
3. 각 에이전트별:
   - agent_card_url 있음 → AgentCard fetch + 검증
   - agent_card_url 없음 → agent.url ping
   - health_status 업데이트
4. 성공/실패 통계 로깅
```

**실행 결과 예시:**
```
[2025-11-19 03:00:00] INFO: Starting daily agent sync
[2025-11-19 03:00:02] INFO: Synced 'agent-1' (URL-based): success
[2025-11-19 03:00:03] INFO: Synced 'agent-2' (Manual): success
[2025-11-19 03:00:15] WARNING: Synced 'agent-3' (URL-based): timeout
[2025-11-19 03:00:16] INFO: Daily sync completed: 2 success, 1 failed
```

---

## API 명세 (API Specification)

### 공통 사항

**Base URL:** `/api/v1`

**Content-Type:** `application/json`

**인증:** 현재 없음 (모든 엔드포인트 public)

**CORS:** 환경변수 `ALLOWED_ORIGINS`로 제어

### 엔드포인트 상세

#### 1. POST `/agents` - 수동 등록

**Request:**
```json
{
  "name": "my-agent",
  "description": "Agent description",
  "url": "https://agent.example.com",
  "preferredTransport": "JSONRPC",
  "skills": [
    {
      "id": "skill-1",
      "name": "Skill Name",
      "description": "Skill description",
      "tags": ["tag1"],
      "inputModes": ["text/plain"],
      "outputModes": ["text/plain"]
    }
  ],
  "x-registry": {
    "contact": "owner@example.com",
    "owner": "owner-id",
    "department": "AI Team",
    "homepage": "https://example.com",
    "usageDescription": "How to use",
    "deleteToken": "secret-123"
  }
}
```

**Response (201 Created):**
```json
{
  "name": "my-agent",
  "description": "Agent description",
  "url": "https://agent.example.com",
  "protocol_version": "0.3.0",
  "version": "0.0",
  "preferred_transport": "JSONRPC",
  "skills": [...],
  "x-registry": {
    "contact": "owner@example.com",
    "owner": "owner-id",
    "department": "AI Team",
    "homepage": "https://example.com",
    "usageDescription": "How to use",
    "allowDelete": true,
    "deleteToken": "secret-123"
  },
  "health_status": {
    "status": "unknown",
    "last_check_at": null,
    "failure_count": 0
  },
  "created_at": "2025-11-19T03:00:00Z",
  "updated_at": "2025-11-19T03:00:00Z"
}
```

**Errors:**
- `400 Bad Request`: 필수 필드 누락, 검증 실패
- `409 Conflict`: 이미 존재하는 name 또는 url

#### 2. POST `/agents/register-by-url` - URL 기반 등록

**Request:**
```json
{
  "agent_card_url": "https://example.com/.well-known/agent-card.json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "agent_id": "my-agent"
}
```

**Errors:**
- `400 Bad Request`: URL fetch 실패, 검증 실패
- `409 Conflict`: 이미 존재하는 name 또는 url

#### 3. POST `/agents/verify` - AgentCard URL 검증

**Request:**
```json
{
  "url": "https://example.com/.well-known/agent-card.json"
}
```

**Response (200 OK) - 성공:**
```json
{
  "success": true,
  "agent_card": {
    "name": "my-agent",
    "description": "...",
    ...
  },
  "response_time_ms": 150
}
```

**Response (200 OK) - 실패:**
```json
{
  "success": false,
  "error": "Failed to fetch AgentCard: Connection timeout",
  "validation_errors": [
    "Missing required field: name",
    "Missing required field: skills"
  ],
  "response_time_ms": 10000
}
```

#### 4. GET `/agents` - 전체 목록

**Query Parameters:**
- `limit` (int, default=100, max=1000): 반환 개수
- `offset` (int, default=0): 건너뛸 개수

**Response (200 OK):**
```json
{
  "agents": [
    {
      "name": "agent-1",
      "description": "...",
      "url": "...",
      "agent_card_url": "https://...",
      "health_status": {
        "status": "active",
        "last_check_at": "2025-11-19T03:00:00Z",
        "failure_count": 0
      },
      ...
    }
  ],
  "count": 1
}
```

#### 5. GET `/agents/{agent_id}` - 상세 정보

**Response (200 OK):**
```json
{
  "name": "my-agent",
  "description": "...",
  "url": "...",
  "agent_card_url": "https://...",
  "skills": [...],
  "capabilities": {...},
  "x-registry": {...},
  "health_status": {
    "status": "active",
    "last_check_at": "2025-11-19T03:00:00Z",
    "last_response_time_ms": 150,
    "failure_count": 0,
    "last_error": null
  },
  "created_at": "2025-11-19T03:00:00Z",
  "updated_at": "2025-11-19T03:00:00Z"
}
```

**Errors:**
- `404 Not Found`: 에이전트 없음

#### 6. POST `/agents/{agent_id}/sync` - 수동 동기화

**Response (200 OK):**
```json
{
  "name": "my-agent",
  "agent_card": {...},
  "health_status": {
    "status": "active",
    "last_check_at": "2025-11-19T10:30:00Z",
    "last_response_time_ms": 120,
    "failure_count": 0
  }
}
```

**Errors:**
- `404 Not Found`: 에이전트 없음
- `500 Internal Server Error`: Sync 실패

#### 7. DELETE `/agents/{agent_id}` - 삭제

**Headers:**
- `x-registry-token` (선택): 수동 등록 에이전트의 deleteToken

**Response (204 No Content):** (성공 시 body 없음)

**Errors:**
- `404 Not Found`: 에이전트 없음
- `403 Forbidden`: 삭제 권한 없음 (토큰 불일치 또는 allowDelete=false)
- `400 Bad Request`: 검증 방법 없음 (토큰도 없고 URL도 없음)

#### 8. POST `/agents/search` - 검색

**Request:**
```json
{
  "query": "chatbot"
}
```

**Response (200 OK):**
```json
{
  "agents": [
    {
      "name": "chatbot-agent",
      "description": "A conversational chatbot agent",
      ...
    }
  ],
  "count": 1
}
```

#### 9. GET `/health` - 서버 헬스 체크

**Response (200 OK):**
```json
{
  "status": "healthy"
}
```

---

## 배포 가이드 (Deployment Guide)

### Docker Compose 배포 (권장)

**1. 프로젝트 클론:**
```bash
git clone <repository-url>
cd 05_agent_registry/ssai_agent_registry
```

**2. 환경 변수 설정 (선택):**

`deploy/.env` 파일 생성:
```bash
# Database
POSTGRES_DB=a2a_registry
POSTGRES_USER=a2a_user
POSTGRES_PASSWORD=change-me-in-production

# Backend
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=["http://localhost:7600","https://yourdomain.com"]
DEBUG=false

# Frontend
VITE_API_URL=/api
```

**3. 이미지 빌드:**
```bash
cd deploy
./build.sh
```

**4. 서비스 시작:**
```bash
docker compose up -d
```

**5. 서비스 확인:**
```bash
# 컨테이너 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f backend
docker compose logs -f frontend

# 헬스 체크
curl http://localhost:7601/health
curl http://localhost:7600
```

**6. 접속:**
- Frontend: http://localhost:7600
- Backend API: http://localhost:7601
- PostgreSQL: localhost:5432 (외부 노출 안 됨)

### 서비스 관리

**로그 확인:**
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

**서비스 재시작:**
```bash
docker compose restart backend
docker compose restart frontend
```

**서비스 중지 (데이터 유지):**
```bash
docker compose down
```

**서비스 중지 (데이터 삭제):**
```bash
docker compose down -v
```

**이미지 재빌드:**
```bash
# 캐시 무시하고 재빌드
docker compose build --no-cache

# 또는
cd deploy
./build.sh
```

### 데이터베이스 백업/복원

**백업:**
```bash
cd deploy
./backup_db.sh
```

백업 파일: `backups/a2a_registry_backup_YYYYMMDD_HHMMSS.sql.gz`

**복원:**
```bash
cd deploy
./restore_db.sh backups/a2a_registry_backup_20251119_030000.sql.gz
```

**수동 백업 (Docker 명령):**
```bash
# SQL 백업
docker exec a2a-registry-postgres pg_dump -U a2a_user a2a_registry | gzip > backup.sql.gz

# Volume 백업
docker run --rm \
  -v a2a-registry-postgres-data:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/volume_backup.tar.gz -C /data .
```

### Production 배포 권장사항

**1. 환경 변수 보안:**
```bash
# 강력한 SECRET_KEY 생성
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 강력한 DB 비밀번호 설정
POSTGRES_PASSWORD=$(openssl rand -base64 32)
```

**2. HTTPS 설정 (Nginx):**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:7600;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:7601/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**3. 방화벽 설정:**
```bash
# 7600 (Frontend), 7601 (Backend)만 외부 오픈
ufw allow 7600/tcp
ufw allow 7601/tcp
ufw deny 5432/tcp  # PostgreSQL 외부 차단
```

**4. 모니터링 설정:**
```bash
# 컨테이너 헬스 체크
watch docker compose ps

# 리소스 사용량 모니터링
docker stats
```

**5. 자동 백업 (Cron):**
```bash
# crontab -e
0 3 * * * cd /path/to/deploy && ./backup_db.sh >> backups/backup.log 2>&1
```

### Docker Volume 관리

**Volume 위치 확인:**
```bash
docker volume inspect a2a-registry-postgres-data
```

**Volume 직접 접근 (디버깅):**
```bash
docker run --rm -it \
  -v a2a-registry-postgres-data:/data \
  ubuntu bash

# 컨테이너 내부
cd /data
ls -la
```

**Volume 복사 (마이그레이션):**
```bash
# 백업
docker run --rm \
  -v a2a-registry-postgres-data:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/data.tar.gz -C /data .

# 복원 (새 서버)
docker run --rm \
  -v a2a-registry-postgres-data-new:/data \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/data.tar.gz -C /data
```

---

## 개발 가이드 (Development Guide)

### 로컬 개발 환경 설정

#### Backend 개발

**1. 가상환경 생성:**
```bash
cd ssai_agent_registry/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

**2. 의존성 설치:**
```bash
pip install -r requirements.txt
```

**3. 데이터베이스 준비:**

**Option A: Docker PostgreSQL**
```bash
docker run -d \
  --name a2a-postgres \
  -e POSTGRES_DB=a2a_registry \
  -e POSTGRES_USER=a2a_user \
  -e POSTGRES_PASSWORD=a2a_password \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

**Option B: 로컬 PostgreSQL**
```bash
createdb a2a_registry
psql a2a_registry -c "CREATE EXTENSION vector;"
```

**4. 환경 변수 설정:**

`.env` 파일 생성:
```bash
DATABASE_URL=postgresql+asyncpg://a2a_user:a2a_password@localhost:5432/a2a_registry
SECRET_KEY=dev-secret-key
ALLOWED_ORIGINS=["http://localhost:5173"]
DEBUG=true
```

**5. 서버 실행:**
```bash
# Option 1: main.py 직접 실행
python -m app.main

# Option 2: uvicorn
uvicorn app.main:app --reload --port 8000
```

**6. API 문서 확인:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### Frontend 개발

**1. 의존성 설치:**
```bash
cd ssai_agent_registry/frontend
npm install
```

**2. 환경 변수 설정:**

`.env` 파일 생성:
```bash
VITE_API_URL=http://localhost:8000/api
```

**3. 개발 서버 실행:**
```bash
npm run dev
```

**4. 접속:**
- Frontend: http://localhost:5173

**5. 빌드:**
```bash
npm run build
npm run preview  # 빌드 결과 미리보기
```

### 테스트

#### Backend 테스트

**전체 테스트 실행:**
```bash
cd backend
pytest
```

**커버리지 포함:**
```bash
pytest --cov=backend/app --cov-report=term-missing
```

**특정 테스트 파일:**
```bash
pytest backend/tests/endpoints/test_agents.py
```

**특정 테스트 함수:**
```bash
pytest backend/tests/endpoints/test_agents.py::test_register_agent
```

**Verbose 모드:**
```bash
pytest -v -s
```

#### Frontend 테스트 (미구현)

```bash
cd frontend
npm run test
```

### 코드 스타일

#### Backend (Python)

**Linting:**
```bash
ruff check .
```

**Formatting:**
```bash
ruff format .
# 또는
black .
```

**Type Checking:**
```bash
mypy backend/app
```

#### Frontend (TypeScript)

**Linting:**
```bash
npm run lint
```

**Formatting (Prettier):**
```bash
npm run format
```

### Git 워크플로우

**브랜치 전략:**
```
main (production)
  └── develop (integration)
      ├── feature/agent-registration
      ├── feature/health-monitoring
      └── bugfix/delete-verification
```

**Commit 메시지 규칙:**
```
type(scope): subject

[optional body]

[optional footer]
```

**Type:**
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

**예시:**
```
feat(agent): Add manual registration mode

- Add Manual tab in RegisterAgent page
- Implement client-side JSON validation
- Force allowDelete=true for manual agents

Closes #123
```

### 디버깅

#### Backend 디버깅

**VS Code `launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload",
        "--port",
        "8000"
      ],
      "jinja": true,
      "justMyCode": false,
      "env": {
        "DATABASE_URL": "postgresql+asyncpg://a2a_user:a2a_password@localhost:5432/a2a_registry"
      }
    }
  ]
}
```

**로깅 레벨 조정:**
```python
# app/main.py
import logging

logging.basicConfig(level=logging.DEBUG)
```

#### Frontend 디버깅

**React DevTools 설치:**
- Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/...

**Console 로깅:**
```typescript
console.log('Agent data:', agent);
console.error('Failed to load:', error);
```

**Network 탭 확인:**
- Chrome DevTools → Network
- API 요청/응답 확인

---

## 운영 가이드 (Operations Guide)

### 헬스 체크

**애플리케이션 헬스:**
```bash
# Backend
curl http://localhost:7601/health
# Response: {"status":"healthy"}

# Frontend
curl http://localhost:7600
# Response: HTML content
```

**컨테이너 헬스:**
```bash
docker compose ps
```

**데이터베이스 헬스:**
```bash
docker exec a2a-registry-postgres pg_isready -U a2a_user
```

### 로그 관리

**실시간 로그 확인:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

**최근 로그 (마지막 100줄):**
```bash
docker compose logs --tail=100 backend
```

**특정 시간 이후 로그:**
```bash
docker compose logs --since="2025-11-19T10:00:00" backend
```

**로그 저장:**
```bash
docker compose logs backend > backend.log 2>&1
```

### 데이터베이스 관리

**PostgreSQL 접속:**
```bash
docker exec -it a2a-registry-postgres psql -U a2a_user a2a_registry
```

**SQL 쿼리:**
```sql
-- 에이전트 수 확인
SELECT COUNT(*) FROM agents;

-- 헬스 상태별 에이전트 수
SELECT status, COUNT(*) FROM health_status GROUP BY status;

-- 최근 등록된 에이전트
SELECT name, created_at FROM agents ORDER BY created_at DESC LIMIT 10;

-- 가장 많이 실패한 에이전트
SELECT agent_name, failure_count, last_error
FROM health_status
WHERE failure_count > 0
ORDER BY failure_count DESC;
```

**데이터베이스 크기 확인:**
```sql
SELECT pg_size_pretty(pg_database_size('a2a_registry'));
```

**테이블별 크기:**
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 성능 모니터링

**컨테이너 리소스 사용량:**
```bash
docker stats
```

**데이터베이스 연결 수:**
```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'a2a_registry';
```

**느린 쿼리 확인:**
```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 문제 해결 (Troubleshooting)

#### 1. 컨테이너가 시작되지 않음

**증상:** `docker compose up -d` 실패

**해결:**
```bash
# 로그 확인
docker compose logs

# 이미지 재빌드
docker compose build --no-cache

# Volume 권한 확인
ls -la /var/lib/docker/volumes/
```

#### 2. Frontend에서 API 접근 불가

**증상:** Network error in browser console

**해결:**
```bash
# Backend 헬스 확인
curl http://localhost:7601/health

# CORS 설정 확인
docker compose logs backend | grep CORS

# Nginx 프록시 설정 확인 (deploy/nginx.conf)
```

#### 3. 데이터베이스 연결 실패

**증상:** `sqlalchemy.exc.OperationalError`

**해결:**
```bash
# PostgreSQL 상태 확인
docker compose ps postgres

# 연결 문자열 확인
docker compose exec backend env | grep DATABASE_URL

# PostgreSQL 로그 확인
docker compose logs postgres
```

#### 4. 스케줄러 작동 안 함

**증상:** 에이전트가 자동 동기화되지 않음

**해결:**
```bash
# Backend 로그에서 스케줄러 시작 확인
docker compose logs backend | grep scheduler

# 수동 동기화 테스트
curl -X POST http://localhost:7601/api/v1/agents/{agent_id}/sync

# 스케줄러 재시작
docker compose restart backend
```

#### 5. AgentCard URL fetch 실패

**증상:** `Failed to fetch AgentCard: Connection timeout`

**원인:**
- URL이 10초 내에 응답하지 않음
- 방화벽 차단
- URL이 잘못됨

**해결:**
```bash
# URL 직접 테스트
curl -I https://example.com/.well-known/agent-card.json

# Timeout 확인
time curl https://example.com/.well-known/agent-card.json

# Backend에서 테스트 (Docker 네트워크 내부)
docker compose exec backend curl https://example.com/.well-known/agent-card.json
```

### 업그레이드 가이드

**1. 코드 업데이트:**
```bash
git pull origin main
```

**2. 의존성 업데이트:**

**Backend:**
```bash
cd backend
pip install -r requirements.txt --upgrade
```

**Frontend:**
```bash
cd frontend
npm install
```

**3. 데이터베이스 마이그레이션:**

**현재:** 마이그레이션 시스템 없음 (SQLAlchemy auto-create)

**향후 Alembic 사용 시:**
```bash
alembic upgrade head
```

**4. Docker 이미지 재빌드:**
```bash
cd deploy
./build.sh
docker compose down
docker compose up -d
```

**5. 헬스 체크:**
```bash
curl http://localhost:7601/health
curl http://localhost:7600
```

### 보안 권장사항

**1. 환경 변수 보안:**
- `.env` 파일을 `.gitignore`에 추가
- Production 환경변수는 Docker Secrets 사용

**2. Database 보안:**
- 강력한 비밀번호 사용
- 외부 접근 차단 (Docker 네트워크 내부만)
- 정기적 백업

**3. API 보안:**
- Rate Limiting 추가 (향후)
- Input Sanitization 강화
- HTTPS 사용

**4. 로그 보안:**
- 민감 정보 로깅 금지 (비밀번호, 토큰)
- 로그 파일 권한 제한

**5. 정기 업데이트:**
```bash
# 의존성 취약점 확인
pip list --outdated
npm audit

# 업데이트
pip install --upgrade <package>
npm audit fix
```

### 용량 관리

**디스크 사용량 확인:**
```bash
# Docker 전체 사용량
docker system df

# 컨테이너별 사용량
docker ps -s

# Volume 사용량
docker volume ls
du -sh /var/lib/docker/volumes/a2a-registry-postgres-data
```

**정리 작업:**
```bash
# 사용하지 않는 이미지 삭제
docker image prune -a

# 사용하지 않는 Volume 삭제 (주의!)
docker volume prune

# 7일 이상 된 백업 삭제 (자동)
# deploy/backup_db.sh에 포함됨
```

---

## 부록 (Appendix)

### A. 주요 파일 목록

**Backend 핵심 파일:**
```
backend/app/main.py                - FastAPI 앱 진입점
backend/app/api/v1/agents.py       - 에이전트 API 엔드포인트
backend/app/services/agent_service.py - 비즈니스 로직
backend/app/models/agent.py        - AgentModel (SQLAlchemy)
backend/app/models/health.py       - HealthStatusModel
backend/app/scheduler.py           - APScheduler 설정
backend/app/core/config.py         - 환경 설정
backend/app/core/database.py       - DB 연결
```

**Frontend 핵심 파일:**
```
frontend/src/App.tsx               - 메인 앱 + 라우터
frontend/src/pages/RegisterAgent.tsx - 등록 페이지 (핵심)
frontend/src/pages/AgentDetail.tsx   - 상세 페이지 (삭제 모달)
frontend/src/api/client.ts           - API 클라이언트
frontend/src/contexts/LanguageContext.tsx - i18n
```

**Docker 설정:**
```
deploy/docker-compose.yml          - 서비스 오케스트레이션
deploy/Dockerfile.backend          - Backend 이미지
deploy/Dockerfile.frontend         - Frontend 이미지
deploy/nginx.conf                  - Nginx 설정
deploy/build.sh                    - 빌드 스크립트
deploy/backup_db.sh                - 백업 스크립트
deploy/restore_db.sh               - 복원 스크립트
```

### B. 환경 변수 전체 목록

**Backend:**
```bash
# Required
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database
SECRET_KEY=your-secret-key

# Optional
ACCESS_TOKEN_EXPIRE_MINUTES=30  # 향후 인증 사용 시
ALLOWED_ORIGINS=["http://localhost:5173"]
DEBUG=false
A2A_REGISTRY_DEV_MODE=true  # 개발 모드
```

**Frontend:**
```bash
VITE_API_URL=/api  # API 베이스 URL (기본값: /api)
```

**PostgreSQL:**
```bash
POSTGRES_DB=a2a_registry
POSTGRES_USER=a2a_user
POSTGRES_PASSWORD=a2a_password
```

### C. 용어 사전 (Glossary)

| 용어 | 설명 |
|------|------|
| **A2A Protocol** | Agent-to-Agent Protocol, AI 에이전트 간 통신 표준 |
| **AgentCard** | 에이전트 메타데이터를 담은 JSON 문서 |
| **agent_card_url** | AgentCard를 호스팅하는 URL |
| **x-registry** | 레지스트리 전용 확장 필드 |
| **deleteToken** | 수동 등록 에이전트의 삭제 토큰 |
| **allowDelete** | 삭제 허용 플래그 (기본값: true) |
| **Health Status** | 에이전트 가용성 상태 (active/inactive/deprecated/unknown) |
| **Sync** | AgentCard 동기화 및 헬스 체크 |
| **Manual Registration** | AgentCard JSON을 직접 입력하는 등록 방식 |
| **URL-based Registration** | AgentCard URL을 제공하는 등록 방식 |
| **preferredTransport** | 선호하는 통신 프로토콜 (JSONRPC/REST/gRPC) |

### D. 참고 자료 (References)

**A2A Protocol:**
- Specification: `a2a_spec_v0.3.0.md`
- RFC 8615 (Well-Known URIs): https://tools.ietf.org/html/rfc8615

**기술 문서:**
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- PostgreSQL: https://www.postgresql.org/docs/
- pgvector: https://github.com/pgvector/pgvector
- SQLAlchemy: https://docs.sqlalchemy.org/
- Tailwind CSS: https://tailwindcss.com/docs

**프로젝트 문서:**
- `README.md` - 프로젝트 개요
- `CLAUDE.md` - Claude Code 가이드
- `FLOW.md` - 등록 플로우 다이어그램
- `purpose.md` - 프로젝트 목적
- `todo_auth.md` - 인증 계획

---

## 라이선스 및 기여 (License & Contributing)

### 라이선스

[프로젝트 라이선스 정보]

### 기여 방법

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### 연락처

- Project Lead: [이름]
- Email: [이메일]
- Issue Tracker: [GitHub Issues URL]

---

**Last Updated:** 2025-11-19

**Document Version:** 1.0.0
