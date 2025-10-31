# A2A Agent Registry

AI 에이전트를 등록, 검색, 관리하는 중앙 레지스트리 시스템입니다.

## 주요 기능

### 1. 에이전트 관리
- **에이전트 등록**: 새로운 AI 에이전트를 레지스트리에 등록
- **에이전트 조회**: 등록된 에이전트 목록 조회 및 상세 정보 확인
- **에이전트 삭제**: 관리자 권한으로 에이전트 제거 (역할 기반 접근 제어)
- **스킬 관리**: 에이전트의 스킬(기능) 등록 및 조회

### 2. 헬스 체크 시스템
- **자동 모니터링**: 5분 간격으로 등록된 에이전트의 상태 자동 확인
- **상태 관리**: 에이전트의 활성/비활성 상태 실시간 추적
- **장애 감지**: 연속 실패 횟수 기록 및 모니터링

### 3. 인증 및 권한 관리
- **JWT 기반 인증**: JSON Web Token을 사용한 안전한 인증
- **역할 기반 접근 제어 (RBAC)**: Admin, User 역할에 따른 차등 권한
- **사용자 관리**: 회원가입, 로그인, 사용자 정보 조회

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

#### 에이전트 관리
- `GET /agents` - 등록된 에이전트 목록 조회
- `POST /agents` - 새 에이전트 등록
- `GET /agents/{agent_id}` - 특정 에이전트 상세 정보
- `DELETE /agents/{agent_id}` - 에이전트 삭제 (Admin 전용)
- `GET /agents/{agent_id}/health` - 에이전트 헬스 상태 조회

#### 스킬 관리
- `POST /agents/{agent_id}/skills` - 에이전트에 스킬 등록
- `GET /agents/{agent_id}/skills` - 에이전트의 스킬 목록 조회

#### 인증
- `POST /auth/login` - 로그인 (JWT 토큰 발급)
- `POST /auth/register` - 회원가입
- `GET /auth/me` - 현재 로그인한 사용자 정보

#### 확장 기능
- `POST /agents/{agent_id}/extensions` - 확장 기능 등록
- `GET /agents/{agent_id}/extensions` - 확장 기능 목록 조회

### Frontend Routes (http://localhost:5173)
- `/` - 홈페이지 (에이전트 목록)
- `/login` - 로그인 페이지

## 빠른 시작

### 1. 환경 설정

```bash
# Python 가상환경 생성
python3 -m venv .venv
source .venv/bin/activate

# 의존성 설치
pip install -e .

# 프론트엔드 의존성 설치
cd frontend
npm install
cd ..
```

### 2. 환경 변수 설정

`.env` 파일 생성:
```env
STORAGE_TYPE=file           # file 또는 memory
STORAGE_DATA_DIR=./data     # 데이터 저장 경로
SECRET_KEY=your-secret-key-here
```

### 3. 서버 실행

```bash
# 백엔드 서버 (포트 8000)
STORAGE_TYPE=file STORAGE_DATA_DIR=./data .venv/bin/a2a-registry serve --host 0.0.0.0 --port 8000

# 프론트엔드 서버 (포트 5173)
cd frontend && npm run dev
```

### 4. 기본 계정

`config/roles.yaml`에 정의된 기본 계정:

- **Admin**: `admin` / `admin`
- **User**: `user` / `user`

## 기술 스택

### Backend
- **FastAPI**: 고성능 Python 웹 프레임워크
- **SQLAlchemy 2.0**: 비동기 ORM
- **PostgreSQL**: 프로덕션 데이터베이스
- **pgvector**: Vector similarity search
- **asyncpg**: PostgreSQL 비동기 드라이버
- **Pydantic**: 데이터 검증 및 직렬화
- **python-jose**: JWT 토큰 생성/검증
- **passlib**: 비밀번호 해싱
- **APScheduler**: 백그라운드 작업 스케줄링

### Frontend
- **React 18**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Vite**: 빌드 도구
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트

## 상세 문서

더 자세한 구현 내용은 [DETAIL_ko.md](DETAIL_ko.md)를 참고하세요.
