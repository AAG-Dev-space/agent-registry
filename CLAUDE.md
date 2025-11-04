# A2A Agent Registry

AI 에이전트 등록 및 관리를 위한 중앙 레지스트리 시스템입니다.

## 프로젝트 개요

FastAPI 기반 백엔드와 React 기반 프론트엔드로 구성된 풀스택 애플리케이션입니다.

## 기술 스택

### Backend
- FastAPI (Python 웹 프레임워크)
- PostgreSQL + pgvector (데이터베이스)
- SQLAlchemy 2.0 (비동기 ORM)
- JWT 인증 (python-jose)

### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS
- React Router

## 주요 기능

1. **에이전트 관리 (URL 기반)**: AgentCard URL을 입력받아 자동 fetch 및 등록
2. **자동 동기화**: 하루 1회 AgentCard 폴링 및 변경사항 업데이트
3. **URL 소유권 인증**: AgentCard를 호스팅하는 것 자체가 소유권 증명
4. **스킬 관리**: 에이전트별 기능 등록

## 디렉터리 구조

```
ssai_agent_registry/
├── backend/          # FastAPI 백엔드
│   └── app/
│       ├── api/      # REST API 엔드포인트
│       ├── core/     # 설정, 데이터베이스, 인증
│       ├── models/   # SQLAlchemy 모델
│       ├── schemas/  # Pydantic 스키마
│       └── services/ # 비즈니스 로직
├── frontend/         # React 프론트엔드
│   └── src/
│       ├── components/
│       ├── contexts/ # Auth, Language
│       ├── pages/
│       └── api/
├── deploy/           # Docker 설정
└── config/           # 역할 설정
```

## 실행 방법

### Backend
```bash
python -m backend.app.main
# 또는
uvicorn backend.app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 환경 변수

`.env` 파일 참고:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `SECRET_KEY`: JWT 시크릿 키
- `ALLOWED_ORIGINS`: CORS 허용 도메인

## API 엔드포인트

- `GET /api/v1/agents`: 에이전트 목록
- `POST /api/v1/agents`: 에이전트 등록 (AgentCard URL 제공)
- `POST /api/v1/agents/{id}/verify`: AgentCard URL 수동 검증
- `DELETE /api/v1/agents/{id}`: 에이전트 삭제
- `GET /health`: 헬스 체크

## 인증 방식

- **인증 불필요**: 모든 API가 Public
- **URL 소유권**: AgentCard를 호스팅하는 것 자체가 소유권 증명
- **삭제 보호**: URL 접근 불가 시 자동 deprecated 처리

---

## 🔄 시스템 변경사항

### URL 기반 AgentCard 등록 시스템

#### 변경 개요
기존의 수동 등록 방식에서 **Agent가 자신의 AgentCard를 호스팅하고 Registry가 자동으로 가져가는 방식**으로 변경됩니다.

#### 주요 변경점

1. **등록 방식**
   - **기존**: 사용자가 AgentCard JSON 전체를 입력
   - **신규**: AgentCard URL만 입력 (예: `https://myagent.com/.well-known/agent-card.json`)
   - Registry가 URL에서 자동으로 AgentCard fetch

2. **검증 시스템**
   - **기존**: Health endpoint 확인 (5분 간격)
   - **신규**: AgentCard URL 접근성 확인 및 스키마 검증
   - 등록 시 즉시 검증, 이후 주기적 동기화

3. **자동 동기화**
   - **주기**: 하루 1회 모든 Agent의 AgentCard URL 폴링
   - **변경 감지**: 해시 비교를 통한 변경사항 자동 감지
   - **자동 업데이트**: 변경 시 Registry 자동 업데이트

#### AgentCard URL 권장 경로
```
https://myagent.company.com/.well-known/agent-card.json
```

#### 동기화 프로세스
```
Agent Server                     Registry
     │                               │
     │  /.well-known/agent-card.json │
     │◄──────────── GET ─────────────┤ (등록 시)
     ├─────────── 200 OK ───────────►│
     │         (AgentCard)            │
     │                               │
     │                               │ (하루 1회)
     │◄──────────── GET ─────────────┤
     ├─────────── 200 OK ───────────►│
     │                               │
     │                          변경 감지
     │                          자동 업데이트
```

#### 상태 관리
- **active**: AgentCard 정상 접근 가능
- **inactive**: URL 접근 실패 또는 타임아웃
- **deprecated**: 연속 3회 이상 실패

자세한 구현 계획은 [backend/CLAUDE.md](backend/CLAUDE.md)를 참고하세요.
