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
- **파일 기반 저장소**: JSON 파일로 데이터 영구 저장
- **인메모리 모드**: 개발/테스트용 임시 저장소 지원
- **자동 로딩**: 서버 재시작 시 저장된 데이터 자동 복원

## 디렉터리 구조

```
a2a-registry/
├── backend/              # FastAPI 백엔드 서버
│   ├── __init__.py
│   ├── auth.py          # JWT 인증 및 권한 관리
│   ├── cli.py           # CLI 진입점
│   ├── config.py        # 환경 설정
│   ├── health.py        # 헬스 체크 스케줄러
│   ├── models.py        # 데이터 모델 (Pydantic)
│   ├── server.py        # FastAPI 애플리케이션
│   └── storage.py       # 저장소 추상화 계층
│
├── frontend/            # React + TypeScript 프론트엔드
│   ├── src/
│   │   ├── components/  # UI 컴포넌트
│   │   ├── contexts/    # React Context (AuthContext)
│   │   ├── pages/       # 페이지 컴포넌트 (Home, Login)
│   │   ├── types/       # TypeScript 타입 정의
│   │   └── utils/       # 유틸리티 함수 (API client)
│   ├── package.json
│   └── vite.config.ts
│
├── config/              # 설정 파일
│   └── roles.yaml       # 역할 정의 및 기본 사용자
│
├── data/                # 데이터 저장소 (FileStorage 모드)
│   ├── agents.json      # 등록된 에이전트
│   ├── users.json       # 사용자 계정
│   └── health_status.json  # 헬스 체크 상태
│
├── tests/               # 테스트 코드
├── .env                 # 환경 변수
├── pyproject.toml       # Python 프로젝트 설정
└── README.md
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
- **Pydantic**: 데이터 검증 및 직렬화
- **python-jose**: JWT 토큰 생성/검증
- **passlib**: 비밀번호 해싱 (pbkdf2_sha256)
- **APScheduler**: 백그라운드 작업 스케줄링
- **httpx**: 비동기 HTTP 클라이언트

### Frontend
- **React 18**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Vite**: 빌드 도구
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트

## 상세 문서

더 자세한 구현 내용은 [DETAIL_ko.md](DETAIL_ko.md)를 참고하세요.
