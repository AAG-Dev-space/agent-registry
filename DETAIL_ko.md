# A2A 에이전트 레지스트리 – 상세 구현 가이드 (한글판)

## 개요

본 문서는 A2A(Agent-to-Agent) 레지스트리 구현 내용을 자세히 설명합니다. 주요 범위는 다음과 같습니다.
- 백엔드 API 엔드포인트와 동작 방식
- 프런트엔드 페이지 및 컴포넌트 구조
- 인증(Authentication) 및 권한(Authorization) 흐름
- 헬스 모니터링 시스템
- 백엔드와 프런트엔드의 상호 연동 방식

## 목차

1. [백엔드 아키텍처](#백엔드-아키텍처)  
2. [백엔드 API 엔드포인트](#백엔드-api-엔드포인트)  
3. [프런트엔드 아키텍처](#프런트엔드-아키텍처)  
4. [프런트엔드 페이지 및 컴포넌트](#프런트엔드-페이지-및-컴포넌트)  
5. [인증 흐름](#인증-흐름)  
6. [역할 기반 권한 제어](#역할-기반-권한-제어)  
7. [헬스 모니터링 시스템](#헬스-모니터링-시스템)  
8. [테스트 가이드](#테스트-가이드)

---

## 백엔드 아키텍처

### 기술 스택
- **웹 프레임워크**: FastAPI (비동기 Python 웹 프레임워크)
- **데이터베이스**: SQLite + 커스텀 스토리지 레이어
- **인증**: python-jose 기반 JWT(JSON Web Token)
- **비밀번호 해시**: passlib의 bcrypt
- **스케줄러**: APScheduler (주기적인 헬스 체크)
- **HTTP 클라이언트**: httpx (비동기 헬스 체크 요청에 사용)

### 디렉터리 구조
```
src/a2a_registry/
├── server.py            # 주요 FastAPI 애플리케이션 및 엔드포인트
├── auth.py              # 인증 유틸리티(JWT, 비밀번호 해싱 등)
├── storage.py           # 에이전트, 사용자, 헬스 상태 저장소 로직
├── health_scheduler.py  # APScheduler 기반 헬스 모니터링
└── models.py            # 데이터 모델 및 Pydantic 스키마
```

### 설정 파일
```
config/
└── roles.yaml           # 역할/권한 정의와 기본 사용자 계정
```

---

## 백엔드 API 엔드포인트

### 1. 인증 엔드포인트

#### POST /auth/login
**목적**: 사용자 인증 및 JWT 토큰 발급

**요청 바디**:
```json
{
  "username": "admin",
  "password": "admin"
}
```

**응답(200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**에러 응답**:
- `401 Unauthorized`: 아이디 혹은 비밀번호 오류
- `400 Bad Request`: 계정이 비활성화된 경우

**동작 흐름**:
1. 사용자 이름/비밀번호 수신
2. `storage.get_user(username)`로 사용자 조회
3. `verify_password()`로 bcrypt 비밀번호 검증
4. 사용자 활성 여부 확인
5. `create_access_token()`으로 JWT 생성(사용자명, 역할 포함)
6. 토큰 반환

**참고 코드**: [server.py:150-165](src/a2a_registry/server.py#L150-L165)

---

#### POST /auth/register
**목적**: 신규 사용자 등록(기본 역할은 "user")

**요청 바디**:
```json
{
  "username": "newuser",
  "password": "securepassword",
  "email": "user@example.com"
}
```

**응답(200 OK)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "username": "newuser"
}
```

**에러 응답**:
- `400 Bad Request`: 이미 존재하는 사용자명
- `500 Internal Server Error`: 사용자 생성 실패

**동작 흐름**:
1. 사용자명 중복 여부 확인
2. bcrypt로 비밀번호 해싱
3. role="user"로 데이터베이스에 저장
4. 성공 메시지 반환

**참고 코드**: [server.py:168-183](src/a2a_registry/server.py#L168-L183)

---

#### GET /auth/me
**목적**: 현재 로그인된 사용자 정보 조회

**헤더**:
```
Authorization: Bearer <jwt_token>
```

**응답(200 OK)**:
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "disabled": false
}
```

**에러 응답**:
- `401 Unauthorized`: 토큰이 없거나 유효하지 않음
- `400 Bad Request`: 계정 비활성화

**동작 흐름**:
1. HTTPBearer로 Authorization 헤더에서 토큰 추출
2. `decode_access_token()`으로 토큰 검증
3. 데이터베이스에서 사용자 정보 조회
4. 비밀번호 해시를 제외한 사용자 정보 반환

**참고 코드**: [server.py:186-188](src/a2a_registry/server.py#L186-L188)

---

### 2. 에이전트 관리 엔드포인트

#### GET /agents
**목적**: 모든 등록 에이전트 목록 조회(필터 옵션 포함)

**쿼리 파라미터**:
- `capability` (선택): 특정 기능 보유 에이전트만
- `status` (선택): 헬스 상태("active" 또는 "inactive")

**헤더**: 인증 불필요(공개 엔드포인트)

**응답(200 OK) 예시**:
```json
[
  {
    "agent_id": "weather-agent-v1",
    "name": "Weather Information Agent",
    "description": "Provides weather forecasts and current conditions",
    "capabilities": ["weather.forecast", "weather.current"],
    "endpoint": "https://api.example.com/weather",
    "health_check": {
      "url": "https://api.example.com/weather/health",
      "expected_status": 200,
      "timeout": 10
    },
    "metadata": {
      "version": "1.0.0",
      "provider": "WeatherCorp"
    },
    "registered_at": "2025-10-23T10:30:00Z",
    "health_status": {
      "status": "active",
      "last_check_at": "2025-10-23T15:25:00Z",
      "failure_count": 0
    }
  }
]
```

**동작 흐름**:
1. `storage.list_agents(capability, status)` 호출
2. 헬스 상태 포함한 에이전트 목록 반환

**참고 코드**: [server.py:191-199](src/a2a_registry/server.py#L191-L199)

---

#### GET /agents/{agent_id}
**목적**: 특정 에이전트 상세 조회

**경로 파라미터**:
- `agent_id`: 에이전트 고유 식별자

**헤더**: 인증 불필요

**응답(200 OK) 예시**: 위 목록 응답과 동일한 구조

**에러 응답**:
- `404 Not Found`: 에이전트 미존재

**동작 흐름**:
1. `storage.get_agent(agent_id)` 호출
2. 없으면 404 발생
3. 존재하면 헬스 상태와 함께 반환

**참고 코드**: [server.py:202-209](src/a2a_registry/server.py#L202-L209)

---

#### POST /agents
**목적**: 신규 에이전트 등록

**헤더**: 인증 불필요(누구나 등록 가능)

**요청 바디 예시**:
```json
{
  "agent_id": "weather-agent-v1",
  "name": "Weather Information Agent",
  "description": "Provides weather forecasts and current conditions",
  "capabilities": ["weather.forecast", "weather.current"],
  "endpoint": "https://api.example.com/weather",
  "health_check": {
    "url": "https://api.example.com/weather/health",
    "expected_status": 200,
    "timeout": 10
  },
  "metadata": {
    "version": "1.0.0",
    "provider": "WeatherCorp"
  }
}
```

**응답(200 OK)**:
```json
{
  "success": true,
  "message": "Agent registered successfully",
  "agent_id": "weather-agent-v1"
}
```

**에러 응답**:
- `400 Bad Request`: 이미 존재하는 agent_id
- `500 Internal Server Error`: 등록 실패

**동작 흐름**:
1. AgentRegistration 모델로 데이터 검증
2. agent_id 중복 확인
3. `storage.register_agent()` 호출
4. 성공 메시지 반환

**참고 코드**: [server.py:212-228](src/a2a_registry/server.py#L212-L228)

---

#### DELETE /agents/{agent_id}
**목적**: 에이전트 삭제 (관리자 전용)

**경로 파라미터**:
- `agent_id`

**헤더**:
```
Authorization: Bearer <jwt_token>
```

**필요 권한**: `admin`

**응답(200 OK)**:
```json
{
  "success": true,
  "message": "Agent unregistered successfully"
}
```

**에러 응답**:
- `401 Unauthorized`: 토큰 없음/유효하지 않음
- `403 Forbidden`: admin 권한 없음
- `404 Not Found`: 에이전트 미존재
- `500 Internal Server Error`: 삭제 실패

**동작 흐름**:
1. HTTPBearer로 토큰 체크
2. `require_admin()`로 admin 권한 검증
3. `storage.unregister_agent(agent_id)` 실행
4. 성공 메시지 반환

**보안 메모**: admin만 접근 가능. 프런트에서 버튼을 숨겨도 백엔드 체크가 최종 보안 장치.

**참고 코드**: [server.py:231-242](src/a2a_registry/server.py#L231-L242)

---

### 3. 헬스 모니터링 엔드포인트

#### GET /health/status/{agent_id}
**목적**: 특정 에이전트 헬스 상태 조회

**응답(200 OK)**:
```json
{
  "agent_id": "weather-agent-v1",
  "status": "active",
  "last_check_at": "2025-10-23T15:25:00Z",
  "failure_count": 0
}
```

**에러 응답**:
- `404 Not Found`: 에이전트 미존재 또는 헬스 정보 없음

**동작 흐름**:
1. `storage.get_agent_health_status(agent_id)` 호출
2. 헬스 데이터 반환

**참고 코드**: [server.py:245-254](src/a2a_registry/server.py#L245-L254)

---

#### POST /health/check/{agent_id}
**목적**: 특정 에이전트 헬스 체크 즉시 수행

**응답(200 OK)**:
```json
{
  "success": true,
  "message": "Health check completed",
  "agent_id": "weather-agent-v1",
  "is_healthy": true,
  "status": "active"
}
```

**에러 응답**:
- `404 Not Found`: 에이전트 없음 또는 헬스 설정 부재

**동작 흐름**:
1. 에이전트 정보 조회
2. `health_check` 설정 존재 여부 확인
3. `health_scheduler.check_agent_health()` 실행
4. 헬스 상태 갱신 및 결과 반환

**참고 코드**: [server.py:257-286](src/a2a_registry/server.py#L257-L286)

---

#### POST /health/check-all
**목적**: 헬스 체크 설정이 있는 모든 에이전트 즉시 검사

**응답(200 OK)**:
```json
{
  "success": true,
  "message": "Health checks completed for all agents"
}
```

**동작 흐름**:
1. `health_scheduler.run_immediate_check()` 호출
2. 설정된 모든 에이전트 검사 후 결과 반환

**참고 코드**: [server.py:289-294](src/a2a_registry/server.py#L289-L294)

---

### 4. 인증 관련 의존성

#### Security Dependencies

**HTTPBearer**
- Authorization 헤더에서 JWT 추출
- 보호된 엔드포인트에서 공통으로 사용

**get_current_user()**
- JWT 디코드 및 유효성 검증
- 사용자 정보 조회
- 존재하면 User 객체 반환, 아니면 None
- **코드**: [server.py:108-121](src/a2a_registry/server.py#L108-L121)

**require_user()**
- 로그인이 필수인 엔드포인트에서 사용
- 사용자 없으면 401, 비활성화면 400
- **코드**: [server.py:124-133](src/a2a_registry/server.py#L124-L133)

**require_admin()**
- admin 역할을 요구하는 엔드포인트에서 사용
- 권한 없으면 403
- **코드**: [server.py:136-141](src/a2a_registry/server.py#L136-L141)

---

## 프런트엔드 아키텍처

### 기술 스택
- **프레임워크**: React 18 + TypeScript
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios
- **상태 관리**: React Context (AuthContext)
- **스타일링**: Tailwind CSS + 커스텀 디자인 시스템
- **아이콘**: Lucide React
- **빌드 도구**: Vite

### 디렉터리 구조
```
frontend/src/
├── App.tsx                  # 루트 컴포넌트 및 라우팅 설정
├── main.tsx                 # 진입점
├── api/
│   └── client.ts            # Axios 인스턴스 + 인증 인터셉터
├── contexts/
│   └── AuthContext.tsx      # 전역 인증 상태 관리
├── components/
│   ├── Layout.tsx           # 상단 네비게이션 포함 레이아웃
│   └── ...
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── AgentList.tsx
│   ├── AgentDetail.tsx
│   ├── RegisterAgent.tsx
│   └── Health.tsx
└── styles/
    └── index.css
```

---

## 프런트엔드 페이지 및 컴포넌트

### 1. 인증 관련 페이지

#### 로그인 페이지 (`/login`)
- **파일**: [frontend/src/pages/Login.tsx](frontend/src/pages/Login.tsx)
- **기능**: 아이디/비밀번호 입력, 에러 표시, 로딩 상태, 기본 계정 안내
- **사용자 흐름**:
  1. 아이디/비밀번호 입력 후 로그인
  2. `AuthContext`의 `login()` 호출 → `/auth/login` 요청
  3. 성공 시 localStorage에 토큰 저장, `/agents`로 이동
  4. 실패 시 에러 메시지 출력
- **기본 계정**:
  - 관리자: `admin` / `admin`
  - 일반 사용자: `user` / `user`

---

### 2. 에이전트 관리 페이지

#### 에이전트 목록 (`/agents`)
- **파일**: [frontend/src/pages/AgentList.tsx](frontend/src/pages/AgentList.tsx)
- **기능**: 카드 레이아웃, 기능별/헬스상태 필터, 헬스 뱃지 표시, 상세 페이지 이동

#### 에이전트 상세 (`/agents/:agentId`)
- **파일**: [frontend/src/pages/AgentDetail.tsx](frontend/src/pages/AgentDetail.tsx)
- **기능**:
  - 상세 정보 표시
  - 헬스 상태 및 최근 체크 시각
  - “Check Health Now” 버튼
  - 관리자 전용 “Delete” 버튼
  - 관리자 권한 확인은 `useAuth()`의 `isAdmin`으로 처리
  - 삭제 요청은 `DELETE /agents/{agent_id}` (admin 토큰 필요)
  - 헬스 체크는 `POST /health/check/{agent_id}`

#### 에이전트 등록 (`/register`)
- **파일**: [frontend/src/pages/RegisterAgent.tsx](frontend/src/pages/RegisterAgent.tsx)
- **기능**: 다단계 입력 폼, 기능 추가/삭제, 헬스 설정 옵션, 메타데이터 키-값 관리
- **API**: `POST /agents`

#### 헬스 대시보드 (`/health`)
- **파일**: [frontend/src/pages/Health.tsx](frontend/src/pages/Health.tsx)
- **기능**: 총 에이전트 수, active/inactive 현황, 최근 체크 시간, 실패 횟수, 전체 헬스 체크 버튼
- **API**: `POST /health/check-all`

---

### 3. 레이아웃 및 네비게이션

#### Layout.tsx
- 상단 네비게이션 바와 사용자 정보 표시
- 로그인 상태에 따라 메뉴/로그아웃/관리자 배지 표현

#### Nav 항목
- Home, Agents, Register, Health
- 로그인하지 않은 경우 Login 링크 표시

#### Logout 동작
- `AuthContext`의 `logout()` 호출 → 토큰 삭제, 사용자 상태 초기화

---

## 인증 흐름

### 1. 로그인 과정
```
1. 사용자가 로그인 페이지에 아이디/비밀번호 입력
2. POST /auth/login 요청
3. 백엔드에서 비밀번호 검증(bcrypt)
4. JWT 토큰 발급 (username, role 포함)
5. 프런트엔드 AuthContext에서 토큰 저장(localStorage)
6. 추가로 GET /auth/me 호출해 사용자 정보 확인
7. /agents 페이지로 이동
```

### 2. 인증된 요청 흐름
```
1. React 컴포넌트가 API 호출 트리거
2. Axios 인터셉터가 localStorage에서 토큰 읽어 Authorization 헤더에 추가
3. FastAPI가 토큰 추출 후 검증
4. 필요 시 역할 검사(require_admin)
5. 엔드포인트 로직 실행
6. 응답 반환 → 컴포넌트에서 UI 업데이트
```

### 3. 토큰 유지
- 페이지 새로고침 시 `AuthContext`가 localStorage에서 토큰 재로딩
- 토큰이 있으면 `/auth/me` 호출로 사용자 정보 갱신

### 4. Axios 인터셉터
- `frontend/src/api/client.ts`에서 모든 요청 헤더에 자동으로 토큰 부착

---

## 역할 기반 권한 제어

### 역할 정의 (`config/roles.yaml`)
```yaml
roles:
  admin:
    permissions:
      - agent:register
      - agent:read
      - agent:delete
      - agent:health_check
  user:
    permissions:
      - agent:register
      - agent:read
```

### 기본 계정
- `admin` / `admin`: 관리자 (삭제 가능)
- `user` / `user`: 일반 사용자 (삭제 불가)

### 권한 적용 방식
- **백엔드**: `require_admin()` 의존성으로 최종 검증  
- **프런트**: `isAdmin`을 사용해 삭제 버튼 표시 여부 등 UI 제어
- 백엔드 검증이 진짜 보안이며, 프런트 제어는 UX 차원임

---

## 헬스 모니터링 시스템

### 구조
- `backend/health_scheduler.py`의 `HealthScheduler`
- APScheduler 기반으로 5분마다 자동 헬스 체크
- httpx로 비동기 HTTP 요청 실행

### 헬스 체크 설정
에이전트 등록 시 `health_check`를 함께 전달하면 모니터링 대상이 됩니다.
```json
{
  "health_check": {
    "url": "https://api.example.com/health",
    "expected_status": 200,
    "timeout": 10
  }
}
```

### 동작 흐름
1. 스케줄러가 `run_health_checks()` 실행
2. 헬스 체크 설정이 있는 에이전트 목록 조회
3. 각 에이전트별로 HTTP 요청:
   - 성공 시 상태 `active`, 실패 횟수 0으로 초기화
   - 실패 시 실패 횟수 증가, 3회 이상이면 `inactive`
4. 결과를 저장소에 업데이트

### 수동 실행
- 특정 에이전트: `POST /health/check/{agent_id}`
- 전체 에이전트: `POST /health/check-all`

### 헬스 상태 값
- `active`: 정상 응답 또는 실패 횟수 3회 미만
- `inactive`: 연속 3회 이상 실패

### 코드 위치
- 스케줄러: [health_scheduler.py](src/a2a_registry/health_scheduler.py)
- 저장소 메서드: [storage.py](src/a2a_registry/storage.py)
- 서버 연동: [server.py](src/a2a_registry/server.py)

---

## 테스트 가이드

### 백엔드 테스트

#### 1. 로그인 테스트 (관리자)
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```
- 성공 시 `access_token` 확인 후 저장

#### 2. 현재 사용자 조회
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer <token>"
```
- 관리자 정보가 반환되어야 함

#### 3. 에이전트 등록
```bash
curl -X POST http://localhost:8000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test-agent",
    "name": "Test Agent",
    "description": "A test agent",
    "capabilities": ["test.capability"],
    "endpoint": "https://example.com/test",
    "health_check": {
      "url": "https://example.com/health",
      "expected_status": 200,
      "timeout": 10
    }
  }'
```

#### 4. 에이전트 삭제(관리자 토큰 필요)
```bash
# 관리자 토큰으로 성공해야 함
curl -X DELETE http://localhost:8000/agents/test-agent \
  -H "Authorization: Bearer <admin_token>"

# 일반 사용자 토큰이면 403 발생
curl -X DELETE http://localhost:8000/agents/test-agent \
  -H "Authorization: Bearer <user_token>"
```

#### 5. 헬스 체크
```bash
# 개별 에이전트
curl -X POST http://localhost:8000/health/check/test-agent
# 전체 에이전트
curl -X POST http://localhost:8000/health/check-all
```

---

### 프런트엔드 테스트

#### 1. 로그인 흐름
1. 브라우저에서 `http://localhost:5173/login` 접속
2. `admin` / `admin` 입력
3. 로그인 성공 후 `/agents`로 리다이렉트 확인
4. 헤더에 사용자 정보 및 Admin 배지 표시 확인

#### 2. 일반 사용자 로그인
1. 로그아웃 후 `user` / `user`로 로그인
2. `/agents` 이동, Admin 배지가 없는지 확인

#### 3. 삭제 버튼 표시 여부
1. 관리자 로그인 → 에이전트 상세 페이지 → 삭제 버튼 존재
2. 일반 사용자 로그인 → 동일 페이지 → 삭제 버튼 없음

#### 4. 삭제 기능
1. 관리자 계정으로 상세 페이지 이동
2. 삭제 버튼 클릭 → 확인 → `/agents`로 이동

#### 5. 토큰 유지
1. 로그인 후 페이지 새로고침
2. 여전히 로그인 상태 유지 확인

#### 6. 헬스 체크
1. `/health` 페이지에서 “Check All Agents” 클릭
2. 헬스 상태 갱신 여부 확인

#### 7. 에이전트 등록
1. `/register`에서 폼 작성 후 제출
2. `/agents`에서 새 에이전트 확인

### 테스트 시나리오
- **시나리오 1**: 로그인하지 않은 사용자가 `/agents` 접근 → 목록은 보이지만 삭제 버튼 없음  
- **시나리오 2**: 토큰 만료(24시간) 후 보호된 요청 → 401 응답 → 로그인 페이지로 이동

---

이 문서는 원문(DETAIL.md)의 내용을 바탕으로 번역·정리한 자료입니다. 각 단계별로 실제 코드 위치를 함께 제시하였으므로, 필요한 경우 링크를 따라가며 소스 코드를 직접 확인하면 이해에 큰 도움이 됩니다.
