# Agent Card 구조 및 Backend API 명세서

## Agent Card 필드 구조

### 필수 필드 (Required Fields)

Agent를 등록할 때 반드시 필요한 필드들입니다:

```json
{
  "name": "Agent 이름 (Agent ID로도 사용됨)",
  "description": "Agent에 대한 설명",
  "url": "Agent 엔드포인트 URL",
  "version": "Agent 버전 (예: 1.0.0, 2.1.0)",
  "protocol_version": "A2A 프로토콜 버전 (예: 1.0)"
}
```

**검증 위치**: `backend/server.py:173-182`

---

### 선택 필드 (Optional Fields)

#### 1. preferred_transport
Agent가 선호하는 통신 방식을 지정합니다.

```json
{
  "preferred_transport": "JSONRPC"
}
```

- **기본값**: `"JSONRPC"` (미지정 시 자동 설정)
- **가능한 값**: `"JSONRPC"`, `"http"`, `"grpc"`
- **참고**: `backend/server.py:184-186`

#### 2. skills
UI에서 표시되는 스킬 태그들입니다. 홈페이지의 태그 필터링에 사용됩니다.

```json
{
  "skills": [
    {
      "id": "weather",
      "description": "Weather information"
    },
    {
      "id": "forecast",
      "description": "Weather forecasting"
    },
    {
      "id": "data-retrieval",
      "description": "Data retrieval"
    }
  ]
}
```

- **용도**: UI 필터링, 태그 표시
- **검색**: `skills[].id` 필드로 검색 가능
- **참고**: `data/agents.json:9-22`

#### 3. capabilities
A2A 프로토콜에서 정의하는 Agent의 실제 기능들입니다.

```json
{
  "capabilities": {
    "skills": [
      {
        "id": "get_current_weather",
        "description": "Get current weather conditions for a location"
      },
      {
        "id": "get_forecast",
        "description": "Get weather forecast for upcoming days"
      }
    ],
    "extensions": [
      {
        "uri": "https://extensions.example.com/weather-data",
        "description": "Weather data provider extension",
        "required": true,
        "params": {
          "api_key": "required"
        }
      }
    ]
  }
}
```

**하위 필드**:
- `capabilities.skills`: Agent가 제공하는 함수/기능 목록
- `capabilities.extensions`: Agent가 사용하는 Extension 목록

**Extension 처리**: Agent 등록 시 자동으로 Extension Registry에 등록됩니다 (`backend/server.py:193-214`)

#### 4. default_input_modes
Agent가 입력으로 받을 수 있는 데이터 형식(MIME type)을 지정합니다.

```json
{
  "default_input_modes": ["text/plain", "application/json"]
}
```

**일반적인 값**:
- `"text/plain"`: 일반 텍스트
- `"application/json"`: JSON 데이터
- `"text/markdown"`: Markdown 텍스트
- `"image/png"`, `"image/jpeg"`: 이미지
- `"audio/mpeg"`: 오디오
- `"application/pdf"`: PDF 문서

**용도**: Agent 간 통신 시 데이터 호환성 확인

#### 5. default_output_modes
Agent가 출력으로 생성할 수 있는 데이터 형식(MIME type)을 지정합니다.

```json
{
  "default_output_modes": ["text/plain", "application/json"]
}
```

**일반적인 값**: `default_input_modes`와 동일

**참고**: `frontend/src/types/agent.ts:43-44`

#### 6. health_check
Health 모니터링을 위한 설정입니다. 이 설정이 있으면 5분마다 자동으로 Health Check가 수행됩니다.

```json
{
  "health_check": {
    "url": "https://api.weather-agent.example.com/health",
    "expected_status": 200,
    "timeout": 10
  }
}
```

**필드 설명**:
- `url`: Health check 엔드포인트 URL (필수)
- `expected_status`: 정상 응답 코드 (기본값: 200)
- `timeout`: 타임아웃 시간(초) (기본값: 10)

**Health Check 동작**:
- 스케줄러가 5분마다 실행 (`backend/health_scheduler.py`)
- 연속 3회 실패 시 `status: "inactive"`로 변경
- 참고: `backend/storage.py:378-380`

---

### 자동 추가 필드 (Auto-generated Fields)

#### health_status
Agent 조회 시 자동으로 추가되는 Health 상태 정보입니다.

```json
{
  "health_status": {
    "status": "active",
    "last_check_at": "2025-10-27T10:30:00.000Z",
    "failure_count": 0
  }
}
```

**status 값**:
- `"active"`: 정상 동작 중
- `"inactive"`: Health check 3회 연속 실패
- `"unknown"`: Health check 미설정 또는 아직 실행 안 됨

**참고**: `backend/server.py:234-238`

---

## 완전한 Agent Card 예시

```json
{
  "name": "Weather Assistant",
  "description": "A helpful AI agent that provides weather information and forecasts for any location worldwide",
  "url": "https://api.weather-agent.example.com",
  "version": "1.0.0",
  "protocol_version": "1.0",
  "preferred_transport": "JSONRPC",

  "default_input_modes": ["text/plain", "application/json"],
  "default_output_modes": ["text/plain", "application/json"],

  "skills": [
    {
      "id": "weather",
      "description": "Weather information"
    },
    {
      "id": "forecast",
      "description": "Weather forecasting"
    },
    {
      "id": "data-retrieval",
      "description": "Data retrieval"
    }
  ],

  "capabilities": {
    "skills": [
      {
        "id": "get_current_weather",
        "description": "Get current weather conditions for a location"
      },
      {
        "id": "get_forecast",
        "description": "Get weather forecast for upcoming days"
      }
    ],
    "extensions": [
      {
        "uri": "https://extensions.example.com/weather-data",
        "description": "Weather data provider",
        "required": true,
        "params": {
          "api_key": "required"
        }
      }
    ]
  },

  "health_check": {
    "url": "https://api.weather-agent.example.com/health",
    "expected_status": 200,
    "timeout": 10
  }
}
```

---

## Backend REST API 명세

### Agent 관리 API

#### 1. POST /agents
Agent를 Registry에 등록합니다.

**Request**:
```json
{
  "agent_card": {
    "name": "Agent 이름",
    "description": "설명",
    "url": "https://api.example.com",
    "version": "1.0.0",
    "protocol_version": "1.0"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "agent_id": "Agent 이름",
  "message": "Agent registered successfully",
  "extensions_processed": 2
}
```

**Error** (400 Bad Request):
```json
{
  "detail": "Missing required field: url"
}
```

**참고**: `backend/server.py:164-227`

---

#### 2. GET /agents/{agent_id}
특정 Agent의 정보를 조회합니다. Agent 이름에 공백이나 특수문자가 있으면 URL 인코딩이 필요합니다.

**Example**:
```bash
# 일반적인 경우
curl http://localhost:7601/agents/Weather%20Assistant

# 공백이 있는 경우 (URL 인코딩 필수)
curl http://localhost:7601/agents/Meeting%20Agent
```

**Response** (200 OK):
```json
{
  "agent_card": {
    "name": "Weather Assistant",
    "description": "...",
    "url": "https://api.weather-agent.example.com",
    "version": "1.0.0",
    "protocol_version": "1.0",
    "skills": [...],
    "capabilities": {...}
  },
  "health_status": {
    "status": "active",
    "last_check_at": "2025-10-27T10:30:00.000Z",
    "failure_count": 0
  }
}
```

**Error** (404 Not Found):
```json
{
  "detail": "Agent not found"
}
```

**참고**: `backend/server.py:229-241`

---

#### 3. GET /agents
등록된 모든 Agent 목록을 조회합니다. 각 Agent에는 health_status가 포함됩니다.

**Example**:
```bash
curl http://localhost:7601/agents
```

**Response** (200 OK):
```json
{
  "agents": [
    {
      "name": "Weather Assistant",
      "description": "...",
      "url": "https://api.weather-agent.example.com",
      "version": "1.0.0",
      "protocol_version": "1.0",
      "skills": [...],
      "health_status": {
        "status": "active",
        "last_check_at": "2025-10-27T10:30:00.000Z",
        "failure_count": 0
      }
    },
    ...
  ],
  "count": 5
}
```

**참고**: `backend/server.py:243-255`

---

#### 4. DELETE /agents/{agent_id}
Agent를 Registry에서 삭제합니다. **Admin 권한 필요**

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Example**:
```bash
curl -X DELETE http://localhost:7601/agents/Weather%20Assistant \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Agent unregistered successfully",
  "extensions_cleaned": 2
}
```

**Error** (401 Unauthorized):
```json
{
  "detail": "Not authenticated"
}
```

**Error** (403 Forbidden):
```json
{
  "detail": "Admin privileges required"
}
```

**Error** (404 Not Found):
```json
{
  "detail": "Agent not found"
}
```

**참고**: `backend/server.py:257-275`

---

#### 5. POST /agents/search
Agent를 검색합니다. name, description, skills를 대상으로 검색합니다.

**Request**:
```json
{
  "query": "weather"
}
```

**Response** (200 OK):
```json
{
  "agents": [
    {
      "name": "Weather Assistant",
      "description": "...",
      "skills": [...]
    }
  ],
  "count": 1,
  "query": "weather"
}
```

**참고**: `backend/server.py:277-285`

---

### Health Check API

#### 6. POST /agents/{agent_id}/health/check
특정 Agent의 Health Check를 수동으로 실행합니다.

**Example**:
```bash
curl -X POST http://localhost:7601/agents/Weather%20Assistant/health/check
```

**Response** (200 OK):
```json
{
  "agent_id": "Weather Assistant",
  "is_healthy": true,
  "health_status": {
    "status": "active",
    "last_check_at": "2025-10-27T10:35:00.000Z",
    "failure_count": 0
  }
}
```

**Error** (400 Bad Request):
```json
{
  "detail": "Agent does not have health check configured"
}
```

**참고**: `backend/server.py:433-456`

---

#### 7. GET /agents/{agent_id}/health/status
특정 Agent의 Health 상태를 조회합니다.

**Example**:
```bash
curl http://localhost:7601/agents/Weather%20Assistant/health/status
```

**Response** (200 OK):
```json
{
  "agent_id": "Weather Assistant",
  "health_status": {
    "status": "active",
    "last_check_at": "2025-10-27T10:30:00.000Z",
    "failure_count": 0
  }
}
```

**참고**: `backend/server.py:458-477`

---

### Extension Discovery API

#### 8. GET /extensions
등록된 Extension 목록을 조회합니다. 필터링 및 페이지네이션을 지원합니다.

**Query Parameters**:
- `uri_pattern` (optional): Extension URI 패턴 필터
- `declaring_agents` (optional): Agent 이름으로 필터 (콤마 구분)
- `trust_levels` (optional): Trust level로 필터
- `page_size` (optional): 페이지 크기 (기본값: 100, 최대: 1000)
- `page_token` (optional): 페이지 토큰

**Example**:
```bash
curl "http://localhost:7601/extensions?uri_pattern=weather&page_size=50"
```

**Response** (200 OK):
```json
{
  "extensions": [
    {
      "uri": "https://extensions.example.com/weather-data",
      "description": "Weather data provider",
      "required": true,
      "params": {},
      "first_declared_by_agent": "Weather Assistant",
      "first_declared_at": "2025-10-27T10:00:00.000Z",
      "trust_level": "TRUST_LEVEL_UNVERIFIED",
      "declaring_agents": ["Weather Assistant", "Climate Agent"],
      "usage_count": 2
    }
  ],
  "count": 1,
  "total_count": 1,
  "next_page_token": null,
  "dev_mode": true
}
```

**참고**: `backend/server.py:288-323`

---

#### 9. GET /extensions/{uri}
특정 Extension의 정보를 조회합니다. URI는 URL 인코딩이 필요합니다.

**Example**:
```bash
curl "http://localhost:7601/extensions/https%3A%2F%2Fextensions.example.com%2Fweather-data"
```

**Response** (200 OK):
```json
{
  "extension_info": {
    "uri": "https://extensions.example.com/weather-data",
    "description": "Weather data provider",
    "required": true,
    "params": {},
    "first_declared_by_agent": "Weather Assistant",
    "first_declared_at": "2025-10-27T10:00:00.000Z",
    "trust_level": "TRUST_LEVEL_UNVERIFIED",
    "declaring_agents": ["Weather Assistant"],
    "usage_count": 1
  },
  "found": true
}
```

**Error** (404 Not Found):
```json
{
  "detail": "Extension not found"
}
```

**참고**: `backend/server.py:325-345`

---

#### 10. GET /agents/{agent_id}/extensions
특정 Agent가 사용하는 Extension 목록을 조회합니다.

**Example**:
```bash
curl http://localhost:7601/agents/Weather%20Assistant/extensions
```

**Response** (200 OK):
```json
{
  "agent_id": "Weather Assistant",
  "extensions": [
    {
      "uri": "https://extensions.example.com/weather-data",
      "description": "Weather data provider",
      "required": true,
      "params": {},
      "first_declared_by_agent": "Weather Assistant",
      "first_declared_at": "2025-10-27T10:00:00.000Z",
      "trust_level": "TRUST_LEVEL_UNVERIFIED",
      "declaring_agents": ["Weather Assistant"],
      "usage_count": 1
    }
  ],
  "count": 1
}
```

**참고**: `backend/server.py:347-367`

---

### Authentication API

#### 11. POST /auth/login
로그인하여 JWT 토큰을 받습니다.

**Request**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error** (401 Unauthorized):
```json
{
  "detail": "Incorrect username or password"
}
```

**기본 계정**:
- Username: `admin` / Password: `admin123` (role: admin)
- Username: `user` / Password: `user123` (role: user)

**참고**: `backend/server.py:370-395`

---

#### 12. POST /auth/register
새로운 사용자를 등록합니다. 새 사용자는 자동으로 'user' 역할이 부여됩니다.

**Request**:
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User registered successfully",
  "username": "newuser"
}
```

**Error** (400 Bad Request):
```json
{
  "detail": "Username already registered"
}
```

**참고**: `backend/server.py:397-421`

---

#### 13. GET /auth/me
현재 로그인한 사용자의 정보를 조회합니다.

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Example**:
```bash
curl http://localhost:7601/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response** (200 OK):
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "disabled": false
}
```

**Error** (401 Unauthorized):
```json
{
  "detail": "Not authenticated"
}
```

**참고**: `backend/server.py:423-426`

---

### JSON-RPC API

#### 14. POST /jsonrpc
JSON-RPC 2.0 엔드포인트입니다. A2A 프로토콜의 기본 통신 방식입니다.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "registry.list_agents",
  "params": {},
  "id": 1
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "agents": [...],
    "count": 5
  },
  "id": 1
}
```

**지원 메서드**:
- `registry.list_agents`: Agent 목록 조회
- `registry.get_agent`: Agent 정보 조회
- `registry.register_agent`: Agent 등록
- `registry.search_agents`: Agent 검색

**참고**: `backend/server.py:479-495`, `backend/jsonrpc_server.py`

---

### 기타 API

#### 15. GET /health
Registry 자체의 Health Check 엔드포인트입니다.

**Example**:
```bash
curl http://localhost:7601/health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "service": "A2A Registry"
}
```

**참고**: `backend/server.py:428-431`

---

#### 16. GET /
서비스 정보 및 사용 가능한 프로토콜을 조회합니다.

**Example**:
```bash
curl http://localhost:7601/
```

**Response** (200 OK):
```json
{
  "service": "A2A Registry",
  "version": "0.1.0",
  "description": "Agent-to-Agent Registry Service with dual transport support",
  "protocols": {
    "primary": {
      "transport": "JSONRPC",
      "endpoint": "/jsonrpc",
      "description": "JSON-RPC 2.0 endpoint (A2A default)"
    },
    "secondary": {
      "transport": "HTTP+JSON",
      "endpoints": {
        "register": "POST /agents",
        "get": "GET /agents/{id}",
        "list": "GET /agents",
        "search": "POST /agents/search",
        "unregister": "DELETE /agents/{id}",
        "list_extensions": "GET /extensions",
        "get_extension": "GET /extensions/{uri}",
        "agent_extensions": "GET /agents/{id}/extensions"
      },
      "description": "REST API endpoints (convenience)"
    }
  },
  "mode": {
    "development": true,
    "extension_verification": false,
    "domain_verification": false,
    "signature_verification": false
  },
  "health_check": "/health",
  "documentation": "/docs"
}
```

**참고**: `backend/server.py:497-545`

---

## Health Check 동작 방식

### 자동 Health Check
- **주기**: 5분마다 실행
- **스케줄러**: `backend/health_scheduler.py`의 `HealthScheduler` 클래스
- **실행 조건**: Agent Card에 `health_check.url` 필드가 있는 경우
- **실패 처리**: 연속 3회 실패 시 `status: "inactive"`로 변경

### Health Check 흐름
```
1. 스케줄러가 5분마다 실행
2. health_check.url로 GET 요청
3. expected_status와 응답 코드 비교
4. 성공: failure_count 초기화, status: "active"
5. 실패: failure_count 증가
6. failure_count >= 3: status: "inactive"
```

**참고**: `backend/health_scheduler.py`

---

## 검색 기능

### 검색 대상 필드
`POST /agents/search` API는 다음 필드들을 검색합니다:
- `name`: Agent 이름
- `description`: Agent 설명
- `skills[].id`: 스킬 ID

### 검색 로직
- 대소문자 구분 없음 (case-insensitive)
- 부분 일치 (partial match)
- OR 조건: 세 필드 중 하나라도 일치하면 결과에 포함

**참고**: `backend/storage.py:213-230`

---

## 프로토콜 버전

이 Registry는 **A2A (Agent-to-Agent) Protocol v0.3.0**을 기반으로 합니다.

- **A2A 프로토콜**: Linux Foundation 주도 오픈소스 프로젝트
- **참여 조직**: 150개 이상
- **목표**: 서로 다른 프레임워크, 플랫폼, 공급업체 간 에이전트 상호운용성

**관련 라이브러리**: `fasta2a` (FastAPI용 A2A 스키마 라이브러리)

---

## 데이터 저장소

### 파일 기반 저장소 (기본)
- **위치**: `/data` 디렉토리
- **파일**:
  - `agents.json`: Agent Card 데이터
  - `health_status.json`: Health 상태 데이터
  - `extensions.json`: Extension 데이터
  - `users.json`: 사용자 데이터

### Docker 볼륨
- `backend-data` 볼륨이 `/data`에 마운트
- 샘플 데이터는 Docker 이미지의 `/app/data`에서 자동으로 복사됨
- 볼륨을 초기화하려면: `docker compose down -v`

**참고**: `backend/storage.py`, `docker-compose.yml`

---

## 추가 참고 자료

- **FastAPI Docs**: http://localhost:7601/docs (Swagger UI)
- **GitHub Issues**: https://github.samsungds.net/aiagent/agent-registry/issues
- **Roadmap**: Frontend의 Wiki > Roadmap 페이지 참조
