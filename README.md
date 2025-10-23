# A2A Agent Registry

**Agent-to-Agent (A2A) 통신을 위한 에이전트 등록 및 검색 플랫폼**

## 프로젝트 개요

A2A Agent Registry는 분산 멀티 에이전트 시스템에서 에이전트들을 등록하고 검색할 수 있는 중앙 레지스트리 서비스입니다. FastAPI 기반의 백엔드 API와 React 기반의 프론트엔드 웹 인터페이스를 제공하며, JWT 인증 및 역할 기반 접근 제어(RBAC)를 통해 보안이 강화되어 있습니다.

### 주요 기능

- **에이전트 등록 및 관리**: 에이전트를 등록하고 능력(capability), 엔드포인트, 메타데이터를 관리
- **에이전트 검색**: 능력이나 헬스 상태로 에이전트를 필터링하여 검색
- **자동 헬스 체크**: 5분 간격으로 등록된 에이전트의 헬스 상태를 자동 점검 (APScheduler)
- **JWT 인증 시스템**: pbkdf2_sha256 해싱을 사용한 안전한 비밀번호 저장 및 JWT 토큰 기반 인증
- **역할 기반 접근 제어 (RBAC)**: Admin과 User 역할 구분, Admin만 에이전트 삭제 가능
- **모던 웹 UI**: React + TypeScript + Tailwind CSS로 구현된 반응형 사용자 인터페이스
- **RESTful API**: 표준 HTTP API 엔드포인트 제공

## 프로젝트 구조

```
a2a-registry/
├── backend/                 # FastAPI 백엔드 (Python)
│   ├── __init__.py
│   ├── server.py           # 메인 FastAPI 애플리케이션
│   ├── auth.py             # JWT 인증 및 권한 관리
│   ├── storage.py          # SQLite 데이터베이스 레이어
│   ├── health_scheduler.py # APScheduler 헬스 체크
│   ├── config.py           # 설정 관리
│   └── cli.py              # CLI 진입점
├── frontend/                # React 프론트엔드 (TypeScript)
│   ├── src/
│   │   ├── pages/          # React 페이지 컴포넌트
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── contexts/       # React Context (AuthContext)
│   │   └── api/            # API 클라이언트 (Axios)
│   └── package.json
├── config/
│   └── roles.yaml          # 역할 및 기본 사용자 설정
├── tests/                   # 테스트 코드
├── pyproject.toml          # Python 패키지 설정
├── DETAIL.md               # 상세 기술 문서 (영문)
└── README.md               # 이 파일

```

## 기술 스택

### Backend
- **FastAPI**: 고성능 비동기 웹 프레임워크
- **SQLite**: 경량 데이터베이스 (Storage layer)
- **JWT**: JSON Web Token 기반 인증 (python-jose)
- **pbkdf2_sha256**: 안전한 비밀번호 해싱 (passlib)
- **APScheduler**: 주기적 헬스 체크 스케줄러
- **httpx**: 비동기 HTTP 클라이언트

### Frontend
- **React 18**: 사용자 인터페이스 라이브러리
- **TypeScript**: 타입 안전성
- **Vite**: 빠른 빌드 도구
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **React Router v6**: 라우팅
- **Axios**: HTTP 클라이언트
- **React Query**: 서버 상태 관리
- **Lucide React**: 아이콘 라이브러리

## 시작하기

### 필수 요구사항

- **Python 3.11 이상**
- **Node.js 18 이상** 및 npm
- **가상환경 권장**

### 1. 프로젝트 클론 및 디렉토리 이동

```bash
cd a2a-registry
```

### 2. 백엔드 설정 및 실행

#### 2.1 Python 가상환경 생성 및 활성화

```bash
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# Windows: .venv\Scripts\activate
```

#### 2.2 Python 패키지 설치

```bash
pip install -e .
```

#### 2.3 백엔드 서버 실행

```bash
.venv/bin/a2a-registry serve --host 0.0.0.0 --port 8000
```

또는 make 사용:

```bash
make setup  # 초기 설정 (가상환경 생성 및 패키지 설치)
make run    # 서버 실행
```

서버가 실행되면 다음 주소에서 접근 가능합니다:
- **API 서버**: http://localhost:8000
- **API 문서** (Swagger): http://localhost:8000/docs

### 3. 프론트엔드 설정 및 실행

별도의 터미널에서:

#### 3.1 frontend 디렉토리로 이동

```bash
cd frontend
```

#### 3.2 npm 패키지 설치

```bash
npm install
```

#### 3.3 개발 서버 실행

```bash
npm run dev
```

프론트엔드가 실행되면:
- **웹 인터페이스**: http://localhost:5173

## 기본 사용자 계정

시스템에는 두 개의 기본 사용자가 설정되어 있습니다:

| Username | Password | Role  | 권한                                      |
|----------|----------|-------|------------------------------------------|
| `admin`  | `admin`  | Admin | 모든 권한 (에이전트 등록, 조회, 삭제, 헬스 체크) |
| `user`   | `user`   | User  | 제한된 권한 (에이전트 등록, 조회, 헬스 체크만)    |

**주의**: 프로덕션 환경에서는 반드시 `config/roles.yaml` 파일에서 기본 비밀번호를 변경하세요!

## 주요 기능 설명

### 1. 에이전트 등록

웹 UI의 "Register Agent" 페이지에서 새로운 에이전트를 등록할 수 있습니다:

- **Agent ID**: 고유 식별자
- **Name**: 에이전트 이름
- **Description**: 에이전트 설명
- **Capabilities**: 에이전트가 제공하는 기능 목록
- **Endpoint**: 에이전트 API 엔드포인트 URL
- **Health Check** (선택): 헬스 체크 설정
  - URL: 헬스 체크 엔드포인트
  - Expected Status: 정상 상태 코드 (기본: 200)
  - Timeout: 타임아웃 (초)

### 2. 에이전트 검색 및 필터링

"Agents" 페이지에서 등록된 모든 에이전트를 확인할 수 있으며:

- **Capability로 필터링**: 특정 기능을 가진 에이전트만 표시
- **상태로 필터링**: Active (정상) 또는 Inactive (비정상) 에이전트만 표시
- **실시간 헬스 상태**: 각 에이전트의 현재 헬스 상태를 배지로 표시

### 3. 헬스 모니터링

- **자동 헬스 체크**: APScheduler를 통해 5분마다 자동으로 등록된 에이전트들의 헬스를 점검
- **수동 헬스 체크**:
  - Agent Detail 페이지에서 "Check Health Now" 버튼으로 즉시 체크
  - Health 페이지에서 "Check All Agents" 버튼으로 모든 에이전트 체크
- **상태 추적**:
  - **Active**: 헬스 체크 성공 또는 실패 횟수 < 3
  - **Inactive**: 3회 이상 연속 실패

### 4. 인증 및 권한

#### 로그인
1. 웹 UI 우측 상단의 "Login" 버튼 클릭
2. Username과 Password 입력
3. 로그인 성공 시 JWT 토큰이 localStorage에 저장됨
4. 모든 API 요청에 자동으로 토큰이 포함됨 (Axios interceptor)

#### 권한 제어
- **User**: 에이전트 등록, 조회, 헬스 체크 가능
- **Admin**: User 권한 + 에이전트 삭제 권한
  - Agent Detail 페이지에서 "Delete" 버튼이 Admin에게만 표시됨

## API 엔드포인트

### 인증 API

- **POST /auth/login**: 로그인 (JWT 토큰 발급)
- **POST /auth/register**: 신규 사용자 등록
- **GET /auth/me**: 현재 사용자 정보 조회

### 에이전트 API

- **GET /agents**: 에이전트 목록 조회 (필터링 옵션: capability, status)
- **GET /agents/{agent_id}**: 특정 에이전트 상세 조회
- **POST /agents**: 새 에이전트 등록
- **DELETE /agents/{agent_id}**: 에이전트 삭제 (Admin 전용)

### 헬스 체크 API

- **GET /health/status/{agent_id}**: 에이전트 헬스 상태 조회
- **POST /health/check/{agent_id}**: 특정 에이전트 헬스 체크 실행
- **POST /health/check-all**: 모든 에이전트 헬스 체크 실행

자세한 API 문서는 http://localhost:8000/docs 에서 확인할 수 있습니다.

## 개발 가이드

### Backend 개발

```bash
# 가상환경 활성화
source .venv/bin/activate

# 개발 모드로 서버 실행 (auto-reload)
.venv/bin/a2a-registry serve --host 0.0.0.0 --port 8000 --reload

# 테스트 실행
pytest

# 코드 포맷팅
black backend/
ruff check backend/
```

### Frontend 개발

```bash
cd frontend

# 개발 서버 실행 (hot-reload)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 타입 체크
npm run type-check

# Linting
npm run lint
```

## 프로덕션 배포 시 주의사항

1. **비밀번호 변경**: `config/roles.yaml`의 기본 비밀번호를 강력한 비밀번호로 변경
2. **JWT Secret Key 변경**: `config/roles.yaml`의 `jwt.secret_key`를 랜덤한 값으로 변경
3. **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS 사용
4. **CORS 설정**: backend/server.py의 CORS 설정을 프로덕션 도메인으로 제한
5. **환경 변수**: 민감한 정보는 환경 변수로 관리

## 문서

- **DETAIL.md**: 상세 기술 문서 (영문)
  - 모든 API 엔드포인트 상세 설명
  - 인증 플로우 다이어그램
  - 헬스 모니터링 시스템 설명
  - 테스트 가이드
  - 트러블슈팅

- **API 문서** (Swagger): http://localhost:8000/docs

## 라이선스

MIT License

## 기여

Pull Request와 Issue를 환영합니다!

---

**Version**: 0.1.5
**Python**: 3.11+
**Node.js**: 18+
