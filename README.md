# A2A Agent Registry

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

Docker Registry 기반 AI 에이전트 배포 및 관리 시스템입니다.
**A2A (Agent-to-Agent) Protocol v0.3.0** 구현체입니다.

## 🎯 주요 기능

### 1. Docker 기반 Agent 배포
- **Private Docker Registry 연동**: 레지스트리에 등록된 Agent 이미지 조회
- **원클릭 배포**: 이미지 선택 → 환경 변수 설정 → Agent 시작
- **자동 AgentCard 등록**: 컨테이너 시작 시 AgentCard 자동 fetch 및 Registry 등록
- **LLM 모델 설정**: AGENT_MODEL, AGENT_API_BASE, AGENT_API_KEY 환경 변수 지원

### 2. Agent 인스턴스 관리
- **실시간 상태 모니터링**: running, starting, stopped 상태 표시
- **포트 자동 할당**: 8000-8999 범위에서 자동 할당
- **로그 조회**: 컨테이너 로그 실시간 확인
- **버전 업데이트**: 같은 Agent의 새 버전 배포 시 자동 교체

### 3. CopilotKit Workbench (Interactive Chat UI)
- **CopilotKit 통합**: 현대적인 채팅 UI로 Agent와 대화
- **AG-UI Protocol 지원**: SSE 스트리밍 기반 실시간 통신
- **세션 관리**: 대화 저장 및 이어가기
- **Recent Sessions**: 최근 5개 세션 빠른 접근
- **히스토리 복원**: 이전 대화 클릭 시 전체 내역 자동 표시

### 4. 외부 Agent 등록 (API)
- **URL 기반 등록**: AgentCard URL 제공 시 자동 등록
- **자동 동기화**: 매일 새벽 3시 AgentCard 갱신
- **헬스 체크**: active/inactive/deprecated 상태 관리

## 🚀 빠른 시작

### Docker Compose로 실행 (권장)

```bash
# 1. Private Docker Registry 설정 (선택사항)
cd deploy
cp .env.example .env
# DOCKER_REGISTRY_URL을 실제 레지스트리 URL로 수정

# 2. 이미지 빌드
./build.sh

# 3. 서비스 시작
docker compose up -d

# 4. 서비스 접근
# Frontend: http://localhost:7600
# Backend API: http://localhost:7601
# CopilotKit Workbench: http://localhost:7602
# API Docs: http://localhost:7601/docs
```

### 환경 변수

```bash
# deploy/.env
DOCKER_REGISTRY_URL=http://localhost:5100  # Private Docker Registry URL (Harbor)
```

**지원 레지스트리:**
- Harbor: `http://localhost:5100` or `https://harbor.company.com`
- GCR: `https://gcr.io/your-project`
- Docker Hub: `https://registry-1.docker.io`
- Local: `http://localhost:5000`

**참고**: Harbor와 같이 hostname 검증을 하는 레지스트리는 `localhost`를 사용합니다 (`host.docker.internal` 대신).

## 📖 사용 방법

### 1. Docker Images 페이지에서 Agent 배포

1. **Docker Images** 버튼 클릭 (우측 상단)
2. Private Registry의 이미지 목록 확인
3. 원하는 이미지의 태그 선택 후 **시작** 클릭
4. 환경 변수 설정:
   - `AGENT_MODEL`: LLM 모델 (예: `gemini/gemini-2.5-flash`)
   - `AGENT_API_BASE`: LiteLLM Proxy URL (예: `http://host.docker.internal:4444`)
   - `AGENT_API_KEY`: API Key
5. **시작** 클릭
6. Agent가 자동으로 컨테이너에 배포되고 Registry에 등록됨

### 2. CopilotKit Workbench에서 Agent 테스트

1. **Agent 상세 페이지 접근**
   - Agent 목록에서 Agent 클릭

2. **Workbench 열기**
   - **Workbench 열기** 버튼 클릭
   - 모달 창에서 CopilotKit 채팅 UI 표시

3. **대화하기**
   - 메시지 입력 후 Enter
   - Agent가 실시간으로 응답 (SSE 스트리밍)

4. **세션 관리**
   - **New Chat**: 새 대화 시작
   - **Recent Sessions**: 이전 대화 클릭하여 이어가기
   - 대화 히스토리 자동 복원

### 3. Agent 삭제

**방법 1: Agent Detail 페이지**
- Agent 상세 페이지에서 **모든 인스턴스 삭제** 버튼 클릭
- 모든 Docker 컨테이너가 중지되고 삭제됨

**방법 2: Agent List 페이지**
- Agent 카드의 **Delete** 버튼 클릭
- AgentCard와 모든 인스턴스가 삭제됨

## 📋 API 엔드포인트

### Agent 관리
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/v1/agents` | Agent 목록 조회 |
| `GET` | `/api/v1/agents/{name}` | Agent 상세 조회 |
| `DELETE` | `/api/v1/agents/{name}` | Agent 삭제 (모든 인스턴스 포함) |
| `POST` | `/api/v1/agents/register-by-url` | 외부 Agent URL 등록 |

### Agent Loader (Docker 관리)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/v1/agent-loader/start` | Agent 인스턴스 시작 |
| `GET` | `/api/v1/agent-loader/instances` | 인스턴스 목록 조회 |
| `GET` | `/api/v1/agent-loader/instances/{id}` | 인스턴스 상세 조회 |
| `DELETE` | `/api/v1/agent-loader/instances/{id}` | 인스턴스 삭제 |
| `GET` | `/api/v1/agent-loader/instances/{id}/logs` | 컨테이너 로그 조회 |

### Workbench (CopilotKit + AG-UI)
| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/v1/agui/run` | AG-UI 프로토콜 엔드포인트 (SSE) |
| `GET` | `/api/v1/workbench/agents/{name}/sessions` | Agent별 세션 목록 |
| `GET` | `/api/v1/workbench/sessions/{id}/history` | 대화 히스토리 조회 |
| `DELETE` | `/api/v1/workbench/sessions/{id}` | 세션 삭제 |

**CopilotKit Workbench**: http://localhost:7602/workbench/{agentName}

**자세한 API 문서**: http://localhost:7601/docs

## 🏗️ 아키텍처

```
┌─────────────────┐      ┌──────────────────┐
│  React Frontend │      │ CopilotKit UI    │
│  (Agent List)   │      │  (Workbench)     │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         │ REST API               │ GraphQL → AG-UI (SSE)
         ▼                        ▼
┌──────────────────────────────────────────┐
│         FastAPI Backend                  │
│  - Agent Loader (Docker 관리)            │
│  - AG-UI Protocol (SSE 스트리밍)          │
│  - Workbench Sessions (대화 저장)        │
└────────┬─────────────────────────────────┘
         │
    ┌────┴─────┬──────────────┐
    ▼          ▼              ▼
┌────────┐ ┌────────┐ ┌──────────────┐
│Postgres│ │ Docker │ │Private Registry│
│  DB    │ │ Engine │ │ (Agent Images)│
└────────┘ └────────┘ └──────────────┘
```

## 📁 프로젝트 구조

```
ssai_agent_registry/
├── backend/
│   └── app/
│       ├── api/v1/              # REST API
│       │   ├── agents.py        # Agent CRUD
│       │   ├── agent_loader.py  # Docker 관리
│       │   ├── workbench.py     # Playground
│       │   └── docker_registry.py # Registry proxy
│       ├── services/            # 비즈니스 로직
│       │   ├── agent_service.py
│       │   ├── agent_loader_service.py
│       │   ├── docker_service.py
│       │   └── workbench_service.py
│       ├── models/              # DB 모델
│       │   ├── agent.py
│       │   ├── agent_instance.py
│       │   ├── chat_session.py
│       │   └── health.py
│       └── main.py              # FastAPI 앱
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── AgentList.tsx         # Agent 목록
│       │   ├── AgentDetail.tsx       # Agent 상세 + Workbench 모달
│       │   ├── DockerImages.tsx      # Docker Images
│       │   └── wiki/                 # 문서
│       └── api/client.ts             # API 클라이언트
│
├── copilot-workbench/          # CopilotKit Workbench (Next.js)
│   ├── app/
│   │   ├── api/copilotkit/     # GraphQL → AG-UI 브릿지
│   │   └── workbench/[agentName]/ # 채팅 UI + 세션 관리
│   ├── middleware.ts           # Backend API 프록시
│   └── Dockerfile
│
└── deploy/
    ├── docker-compose.yml      # 3개 서비스 (backend, frontend, copilot-workbench)
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    ├── build.sh                # 통합 빌드 스크립트
    └── .env.example            # 환경 변수 예시
```

## 🔧 기술 스택

**Backend**: FastAPI, SQLAlchemy, PostgreSQL, Docker SDK, httpx, APScheduler, AG-UI Protocol
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router
**CopilotKit Workbench**: Next.js 15, CopilotKit, @ag-ui/client, TypeScript
**Infrastructure**: Docker Compose, Nginx, pgvector

## 🛠️ 관리 명령어

```bash
# 로그 확인
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f copilot-workbench

# 서비스 재시작
docker compose restart backend
docker compose restart copilot-workbench

# 데이터베이스 백업
cd deploy
./backup_db.sh

# 헬스 체크
curl http://localhost:7601/health
```

## 📚 문서

- **[CLAUDE.md](CLAUDE.md)** - 개발 가이드 (프로젝트 구조, API, 개발 명령어)
- **[a2a_spec_v0.3.0.md](a2a_spec_v0.3.0.md)** - A2A 프로토콜 명세

## 📝 라이선스

MIT License

---

**Made with ❤️ by A2A Team**
