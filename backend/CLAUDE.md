# Backend - A2A Agent Registry

FastAPI 기반 에이전트 레지스트리 백엔드 서버

## 기술 스택

- **FastAPI**: 고성능 Python 웹 프레임워크
- **SQLAlchemy 2.0**: 비동기 ORM
- **PostgreSQL**: 프로덕션 데이터베이스
- **pgvector**: Vector similarity search
- **asyncpg**: PostgreSQL 비동기 드라이버
- **Pydantic**: 데이터 검증 및 직렬화
- **python-jose**: JWT 토큰 생성/검증
- **passlib**: 비밀번호 해싱
- **APScheduler**: 백그라운드 작업 스케줄링

## 프로젝트 구조

```
backend/
├── app/
│   ├── api/              # API 엔드포인트
│   │   └── v1/
│   │       ├── agents.py     # Agent CRUD
│   │       ├── auth.py       # 인증
│   │       ├── health.py     # 헬스 체크
│   │       └── extensions.py # 확장 기능
│   ├── core/             # 핵심 모듈
│   │   ├── config.py         # 설정 관리
│   │   ├── database.py       # DB 연결/세션
│   │   ├── security.py       # JWT, 인증
│   │   └── deps.py           # 의존성 주입
│   ├── models/           # SQLAlchemy 모델
│   │   ├── agent.py          # Agent 테이블
│   │   ├── user.py           # User 테이블
│   │   ├── health.py         # HealthStatus 테이블
│   │   └── extension.py      # Extension 테이블
│   ├── schemas/          # Pydantic 스키마
│   │   ├── agent.py          # Agent 요청/응답
│   │   ├── auth.py           # 인증 스키마
│   │   └── extension.py      # Extension 스키마
│   ├── services/         # 비즈니스 로직
│   │   ├── agent_service.py
│   │   ├── health_service.py
│   │   ├── extension_service.py
│   │   └── vector_service.py
│   └── main.py           # FastAPI 앱 엔트리포인트
├── graphql/              # GraphQL API (선택적)
├── proto/                # gRPC (선택적)
└── exceptions.py         # 커스텀 예외
```

## 아키텍처 레이어

### 1. API Layer (`api/v1/`)
- HTTP 요청/응답 처리
- JWT 인증 검증
- Pydantic 스키마 검증
- 라우트 정의

### 2. Service Layer (`services/`)
- 비즈니스 로직 구현
- 트랜잭션 관리
- 외부 서비스 호출
- 여러 모델 작업 조합

### 3. Data Layer (`models/`)
- SQLAlchemy ORM 모델
- 데이터베이스 테이블 매핑
- CRUD 작업

### 4. Database (PostgreSQL)
- `agents`: 에이전트 정보
- `users`: 사용자 정보
- `health_status`: 헬스 체크 상태
- `extensions`: 확장 기능

## 주요 기능

### 1. 에이전트 관리 (URL 기반)
- **등록**: AgentCard URL을 입력받아 등록
  - 사용자가 AgentCard URL만 제공 (예: `https://myagent.com/.well-known/agent-card.json`)
  - Registry가 URL에서 AgentCard JSON을 자동으로 fetch
  - Well-known 경로 권장: `/.well-known/agent-card.json`
- **검증**: AgentCard URL 접근성 확인 및 스키마 검증
- **조회**: 목록 및 상세 정보
- **삭제**: Admin 권한 필요
- **스킬 관리**: 에이전트별 기능 등록

### 2. AgentCard 자동 동기화 시스템
- **자동 폴링**: 하루 1회 주기적으로 모든 등록된 에이전트의 AgentCard URL 확인
- **변경 감지**: AgentCard 내용이 업데이트되면 자동으로 Registry에 반영
- **상태 추적**:
  - `active`: AgentCard 정상 접근 가능
  - `inactive`: URL 접근 실패 또는 타임아웃
  - `deprecated`: 연속 실패 또는 명시적 deprecated 표시
- **실패 관리**: 연속 실패 횟수 기록 및 모니터링

### 3. AgentCard 검증 시스템
- **URL 검증**: AgentCard URL 접근성 확인 (HTTP GET)
- **스키마 검증**: AgentCard JSON 구조 및 필수 필드 검증
- **응답 시간 측정**: 접근 가능 여부 및 응답 속도 기록
- **에러 처리**: 타임아웃, 연결 오류, 잘못된 JSON 형식 등 처리

### 4. Vector Search (pgvector)
- 에이전트 설명 임베딩
- 시맨틱 검색 지원

### 5. 인증 방식
- **URL 소유권 기반**: AgentCard URL을 호스팅하는 것 자체가 소유권 증명
- **별도 인증 불필요**: JWT, OAuth 등의 전통적인 인증 시스템 제거
- **삭제 보호**: AgentCard URL 접근 불가 시 자동으로 deprecated 처리

## API 엔드포인트

### 에이전트 (`/api/v1/agents`)
```python
GET    /agents                    # 목록 조회 (Public)
POST   /agents                    # 등록 (Public)
        # Body: { "agent_card_url": "https://..." }
        # Registry가 URL에서 AgentCard를 fetch하여 등록
GET    /agents/{id}               # 상세 조회 (Public)
DELETE /agents/{id}               # 삭제 (Public)
        # URL 소유권 검증 필요
POST   /agents/{id}/verify        # AgentCard URL 수동 검증 (Public)
GET    /agents/{id}/sync-status   # 동기화 상태 조회 (Public)
POST   /agents/search             # 에이전트 검색 (Public)
```

### 스킬 (`/api/v1/agents/{id}/skills`)
```python
POST /agents/{id}/skills  # 스킬 등록
GET  /agents/{id}/skills  # 스킬 목록
```

## 데이터 모델

### AgentModel
```python
- id: UUID (Primary Key)
- name: str
- agent_card_url: str          # AgentCard JSON 파일 URL
- agent_card: dict (JSONB)     # fetch한 AgentCard 내용
- created_at: datetime
- updated_at: datetime
```

### AgentSyncStatusModel (변경됨: 기존 HealthStatusModel)
```python
- id: UUID (Primary Key)
- agent_id: UUID (Foreign Key)
- status: str (active/inactive/deprecated)
- last_sync_at: datetime       # 마지막 동기화 시간
- last_response_time_ms: int   # URL 응답 시간
- consecutive_failures: int    # 연속 실패 횟수
- last_error: str              # 마지막 에러 메시지
- card_hash: str               # AgentCard 변경 감지용 해시
```

## 설정 (`core/config.py`)

```python
# 환경 변수
DATABASE_URL: str           # PostgreSQL 연결
SECRET_KEY: str             # JWT 시크릿
ALLOWED_ORIGINS: list       # CORS 허용 도메인
DEBUG: bool                 # 디버그 모드
```

## 데이터베이스 연결 (`core/database.py`)

```python
# 비동기 엔진 및 세션
async_engine: AsyncEngine
async_session_maker: async_sessionmaker

# 초기화 및 종료
await init_db()    # 테이블 생성
await close_db()   # 연결 종료
```

## 보안 (`core/security.py`)

```python
# 비밀번호 해싱
get_password_hash(password: str) -> str
verify_password(plain: str, hashed: str) -> bool

# JWT 토큰
create_access_token(data: dict) -> str
decode_access_token(token: str) -> dict

# 역할 설정
role_config: RoleConfig  # roles.yaml 로드
```

## 의존성 주입 (`core/deps.py`)

```python
# DB 세션
get_db() -> AsyncSession

# 현재 사용자
get_current_user() -> UserModel

# Admin 권한 확인
get_current_admin_user() -> UserModel
```

## 실행 방법

### 개발 모드
```bash
# 직접 실행
python -m backend.app.main

# uvicorn 사용
uvicorn backend.app.main:app --reload --port 8000
```

### 프로덕션 모드
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 환경 변수 설정

`.env` 파일:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=["http://localhost:5173"]
DEBUG=true
```

## 데이터베이스 마이그레이션

```bash
# Alembic 사용 (선택적)
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 테스트

```bash
pytest backend/tests/
```

## 로깅

- 표준 Python logging 사용
- 레벨: INFO, WARNING, ERROR
- 포맷: 타임스탬프, 레벨, 메시지

## 에러 처리

- 커스텀 예외 클래스 (`exceptions.py`)
- FastAPI 예외 핸들러
- HTTP 상태 코드 및 에러 메시지 표준화

---

## 🔄 변경 계획: URL 기반 AgentCard 시스템

### 현재 시스템 (AS-IS)
1. **등록**: 사용자가 AgentCard JSON을 직접 입력
2. **헬스체크**: 5분마다 Agent의 health endpoint 확인
3. **업데이트**: 사용자가 수동으로 AgentCard 재등록

### 새로운 시스템 (TO-BE)
1. **등록**: AgentCard URL만 입력
2. **검증**: URL에서 AgentCard fetch 및 스키마 검증
3. **동기화**: 하루 1회 자동 폴링 및 변경사항 업데이트

### 구현 계획

#### Phase 1: 데이터 모델 변경
- [ ] `AgentModel`에 `agent_card_url` 필드 추가
- [ ] `HealthStatusModel` → `AgentSyncStatusModel`로 리네이밍
- [ ] `card_hash` 필드 추가 (변경 감지용)
- [ ] 마이그레이션 스크립트 작성

#### Phase 2: API 변경
- [ ] `POST /agents` 엔드포인트 수정
  - 기존: `AgentCard` 전체 받기
  - 신규: `{ "agent_card_url": "..." }` 받기
  - AgentCard fetch 및 검증 로직 추가
- [ ] `POST /agents/{id}/verify` 엔드포인트 추가 (수동 검증)
- [ ] `GET /agents/{id}/sync-status` 엔드포인트 추가

#### Phase 3: Service Layer 변경
- [ ] `AgentService.register_agent()` 수정
  - URL에서 AgentCard fetch
  - 스키마 검증
  - 해시 생성 및 저장
- [ ] `HealthService` → `AgentSyncService`로 리팩토링
  - `verify_url()` → `fetch_agent_card()` 변경
  - AgentCard JSON 파싱 및 검증
  - 해시 비교를 통한 변경 감지

#### Phase 4: 스케줄러 변경
- [ ] 기존 5분 간격 헬스체크 → 24시간 간격 동기화로 변경
- [ ] APScheduler 설정 업데이트
- [ ] 동기화 실패 시 재시도 로직 추가

#### Phase 5: Frontend 변경
- [ ] 등록 폼: AgentCard JSON 입력 → URL 입력으로 변경
- [ ] 검증 버튼: URL 접근성 즉시 확인
- [ ] 동기화 상태 표시: 마지막 동기화 시간, 상태 표시

### AgentCard URL 권장 경로
```
https://myagent.company.com/.well-known/agent-card.json
```

### 동기화 프로세스
```
1. Scheduler (하루 1회)
   ↓
2. 모든 등록된 Agent의 agent_card_url에 HTTP GET
   ↓
3. AgentCard JSON fetch
   ↓
4. 해시 계산 및 기존 해시와 비교
   ↓
5. 변경 감지 시 → DB 업데이트
   변경 없으면 → last_sync_at만 업데이트
```

### 에러 처리 전략
- **타임아웃**: 10초 내 응답 없으면 실패 처리
- **연속 실패**: 3회 이상 실패 시 `deprecated` 상태로 변경
- **잘못된 JSON**: 스키마 검증 실패 시 에러 로그 저장
- **404/500**: HTTP 에러 시 consecutive_failures 증가

### 마이그레이션 전략
- 기존 AgentCard는 agent_card 필드에 유지
- agent_card_url은 nullable로 시작
- 점진적으로 URL 기반 등록으로 전환
- 기존 데이터 호환성 유지
