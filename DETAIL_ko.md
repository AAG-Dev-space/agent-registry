# A2A 에이전트 레지스트리 - 상세 구현 문서

## 목차
1. [시스템 개요](#시스템-개요)
2. [백엔드 구현](#백엔드-구현)
3. [프론트엔드 구현](#프론트엔드-구현)
4. [인증 시스템](#인증-시스템)
5. [스토리지 시스템](#스토리지-시스템)
6. [헬스 모니터링](#헬스-모니터링)
7. [API 상세 명세](#api-상세-명세)
8. [배포 및 운영](#배포-및-운영)

---

## 시스템 개요

A2A 에이전트 레지스트리는 AI 에이전트를 중앙에서 관리하는 시스템입니다.

### 핵심 구성 요소
- **Backend**: FastAPI 기반 REST API 서버
- **Frontend**: React + TypeScript 기반 웹 UI
- **Storage**: 파일 기반 또는 인메모리 데이터 저장소
- **Authentication**: JWT 토큰 기반 인증
- **Health Monitoring**: 에이전트 상태 자동 모니터링

### 기술 스택

**Backend**
- FastAPI 0.104+: 고성능 비동기 웹 프레임워크
- Pydantic: 데이터 검증 및 직렬화
- python-jose[cryptography]: JWT 토큰 생성/검증
- passlib[bcrypt]: 비밀번호 해싱 (pbkdf2_sha256 사용)
- APScheduler: 백그라운드 작업 스케줄링
- httpx: 비동기 HTTP 클라이언트
- PyYAML: YAML 설정 파일 파싱

**Frontend**
- React 18.2+: UI 라이브러리
- TypeScript 5.0+: 정적 타입 검사
- Vite 7.0+: 빌드 도구
- Tailwind CSS 3.4+: 유틸리티 CSS 프레임워크
- React Router DOM 6.22+: 클라이언트 사이드 라우팅
- Axios 1.6+: HTTP 클라이언트

---

## 백엔드 구현

### 프로젝트 구조

```
backend/
├── __init__.py         # 패키지 초기화
├── auth.py             # 인증 및 권한 관리
├── cli.py              # CLI 진입점
├── config.py           # 환경 설정
├── health.py           # 헬스 체크 스케줄러
├── models.py           # 데이터 모델
├── server.py           # FastAPI 애플리케이션
└── storage.py          # 저장소 추상화
```

### 주요 모듈 설명

#### 1. auth.py - 인증 시스템

**비밀번호 해싱**
```python
from passlib.context import CryptContext

# pbkdf2_sha256 사용 (bcrypt 호환성 문제로 변경)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """비밀번호를 해시화"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    return pwd_context.verify(plain_password, hashed_password)
```

**JWT 토큰 생성**
```python
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """JWT 액세스 토큰 생성"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=100*365))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

**역할 설정 로딩**
```python
class RoleConfig:
    def __init__(self, config_path: str | None = None):
        if config_path is None:
            # backend/auth.py -> backend/ -> a2a-registry/ -> config/roles.yaml
            config_path = str(Path(__file__).parent.parent / "config" / "roles.yaml")

        with open(config_path, encoding="utf-8") as f:
            self.config = yaml.safe_load(f)
```

#### 2. storage.py - 저장소 계층

**저장소 추상화**
```python
class StorageBackend(ABC):
    """저장소 백엔드 추상 클래스"""

    @abstractmethod
    async def get_agents(self) -> list[AgentCard]:
        """모든 에이전트 조회"""
        pass

    @abstractmethod
    async def create_agent(self, agent: AgentCard) -> str:
        """에이전트 생성"""
        pass

    @abstractmethod
    async def get_user(self, username: str) -> dict | None:
        """사용자 조회"""
        pass
```

**InMemoryStorage 구현**
- 메모리 내 딕셔너리로 데이터 저장
- 개발/테스트 용도
- 서버 재시작 시 데이터 손실

**FileStorage 구현**
- JSON 파일로 데이터 영구 저장
- `data/` 디렉터리에 파일 저장
  - `agents.json`: 에이전트 정보
  - `users.json`: 사용자 계정
  - `health_status.json`: 헬스 체크 상태
- 자동 파일 로딩 및 저장

```python
class FileStorage(StorageBackend):
    def __init__(self, data_dir: str = "/data") -> None:
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.agents_file = self.data_dir / "agents.json"
        self.users_file = self.data_dir / "users.json"
        self._agents: dict[str, AgentCard] = {}
        self._users: dict[str, dict] = {}
        self._load_agents()
        self._load_users()
        self._initialize_default_users()
```

#### 3. health.py - 헬스 모니터링

**헬스 체크 스케줄러**
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

def setup_health_monitoring(storage: StorageBackend) -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()

    # 5분마다 헬스 체크 실행
    scheduler.add_job(
        run_health_checks,
        trigger="interval",
        minutes=5,
        args=[storage],
        id="health_check",
        replace_existing=True,
    )

    scheduler.start()
    return scheduler
```

**헬스 체크 로직**
```python
async def run_health_checks(storage: StorageBackend) -> None:
    """등록된 모든 에이전트에 대해 헬스 체크 수행"""
    agents = await storage.get_agents_for_health_check()

    async with httpx.AsyncClient() as client:
        for agent_id, health_config in agents:
            url = health_config.get("url")
            timeout = health_config.get("timeout", 10)

            try:
                response = await client.get(url, timeout=timeout)
                if response.status_code == 200:
                    await storage.update_health_status(agent_id, "active", 0)
                else:
                    # 실패 카운트 증가
                    current = await storage.get_agent_health_status(agent_id)
                    failure_count = current.get("failure_count", 0) + 1
                    status = "inactive" if failure_count >= 3 else "active"
                    await storage.update_health_status(agent_id, status, failure_count)
            except Exception:
                # 네트워크 오류 등 처리
                current = await storage.get_agent_health_status(agent_id)
                failure_count = current.get("failure_count", 0) + 1
                await storage.update_health_status(agent_id, "inactive", failure_count)
```

#### 4. server.py - FastAPI 애플리케이션

**앱 초기화**
```python
def create_app() -> FastAPI:
    app = FastAPI(title="A2A Agent Registry")

    # CORS 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 스토리지 및 헬스 모니터링 초기화
    storage = get_storage_backend()
    scheduler = setup_health_monitoring(storage)

    # 엔드포인트 등록
    register_endpoints(app, storage)

    return app
```

**인증 의존성**
```python
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User | None:
    """JWT 토큰에서 현재 사용자 추출"""
    if not credentials:
        return None

    token_data = decode_access_token(credentials.credentials)
    if not token_data:
        return None

    user_dict = await storage.get_user(token_data.username)
    if not user_dict:
        return None

    return User(**user_dict)

async def require_user(current_user: User | None = Depends(get_current_user)) -> User:
    """인증된 사용자 필수"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

async def require_admin(current_user: User = Depends(require_user)) -> User:
    """관리자 권한 필수"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
```

---

## 프론트엔드 구현

### 프로젝트 구조

```
frontend/src/
├── components/         # 재사용 가능한 UI 컴포넌트
│   ├── AgentCard.tsx  # 에이전트 카드 컴포넌트
│   └── Navbar.tsx     # 네비게이션 바
├── contexts/          # React Context
│   └── AuthContext.tsx # 인증 상태 관리
├── pages/             # 페이지 컴포넌트
│   ├── Home.tsx       # 홈 페이지 (에이전트 목록)
│   └── Login.tsx      # 로그인 페이지
├── types/             # TypeScript 타입 정의
│   └── index.ts       # 공통 타입
├── utils/             # 유틸리티 함수
│   └── api.ts         # API 클라이언트
├── App.tsx            # 앱 루트 컴포넌트
└── main.tsx           # 앱 진입점
```

### 주요 컴포넌트 설명

#### 1. AuthContext.tsx - 인증 상태 관리

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 로그인
  const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    });

    const { access_token } = response.data;
    setToken(access_token);
    localStorage.setItem('auth_token', access_token);

    // 사용자 정보 가져오기
    await fetchCurrentUser(access_token);
  };

  // 로그아웃
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  // 관리자 여부 확인
  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 2. api.ts - API 클라이언트

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Axios 인터셉터 - 모든 요청에 JWT 토큰 자동 추가
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API 함수들
export const api = {
  // 에이전트 목록 조회
  getAgents: () => axios.get(`${API_BASE_URL}/agents`),

  // 에이전트 등록
  registerAgent: (agent: AgentCard) =>
    axios.post(`${API_BASE_URL}/agents`, agent),

  // 에이전트 삭제 (Admin 전용)
  deleteAgent: (agentId: string) =>
    axios.delete(`${API_BASE_URL}/agents/${agentId}`),

  // 로그인
  login: (username: string, password: string) =>
    axios.post(`${API_BASE_URL}/auth/login`, { username, password }),

  // 현재 사용자 정보
  getCurrentUser: () => axios.get(`${API_BASE_URL}/auth/me`),
};
```

#### 3. Home.tsx - 홈 페이지

```typescript
export default function Home() {
  const { user, isAdmin, logout } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // 에이전트 목록 로드
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await api.getAgents();
      setAgents(response.data.agents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  // 에이전트 삭제 (Admin 전용)
  const handleDelete = async (agentId: string) => {
    if (!isAdmin()) {
      alert('관리자만 삭제할 수 있습니다.');
      return;
    }

    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await api.deleteAgent(agentId);
        loadAgents(); // 목록 새로고침
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };

  return (
    <div>
      <Navbar user={user} onLogout={logout} />

      {/* 에이전트 등록 버튼 */}
      <button onClick={() => setIsRegisterModalOpen(true)}>
        Register New Agent
      </button>

      {/* 에이전트 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.name}
            agent={agent}
            onDelete={handleDelete}
            showDelete={isAdmin()}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 인증 시스템

### 인증 흐름

1. **로그인**
   ```
   사용자 입력 (username, password)
   → POST /auth/login
   → 비밀번호 검증 (pbkdf2_sha256)
   → JWT 토큰 생성 및 반환
   → 프론트엔드: localStorage에 토큰 저장
   ```

2. **인증된 요청**
   ```
   API 요청
   → Axios 인터셉터: Authorization 헤더에 토큰 추가
   → 백엔드: JWT 토큰 검증
   → 사용자 정보 추출
   → 요청 처리
   ```

3. **권한 확인**
   ```
   DELETE /agents/{id} 요청
   → get_current_user(): JWT에서 사용자 추출
   → require_admin(): 관리자 권한 확인
   → 권한 없으면 403 Forbidden
   → 권한 있으면 요청 처리
   ```

### 역할 기반 접근 제어 (RBAC)

**역할 정의 (config/roles.yaml)**
```yaml
roles:
  admin:
    description: "관리자 - 모든 권한"
    permissions:
      - read_agents
      - write_agents
      - delete_agents
      - manage_users

  user:
    description: "일반 사용자 - 읽기 및 쓰기"
    permissions:
      - read_agents
      - write_agents

default_users:
  - username: "admin"
    password: "admin"
    role: "admin"
    email: "admin@example.com"

  - username: "user"
    password: "user"
    role: "user"
    email: "user@example.com"
```

**권한 확인 예시**
- `GET /agents`: 인증 불필요 (public)
- `POST /agents`: 인증 필요 (user 또는 admin)
- `DELETE /agents/{id}`: 관리자 전용 (admin only)

---

## 스토리지 시스템

### 저장소 타입

#### 1. InMemoryStorage
- **용도**: 개발, 테스트
- **특징**:
  - 빠른 속도
  - 서버 재시작 시 데이터 손실
  - 설정: `STORAGE_TYPE=memory`

#### 2. FileStorage
- **용도**: 프로덕션, 영구 저장
- **특징**:
  - JSON 파일로 저장
  - 서버 재시작 시 자동 로딩
  - 설정: `STORAGE_TYPE=file STORAGE_DATA_DIR=./data`

**파일 구조**
```json
// data/agents.json
{
  "agent-id-1": {
    "name": "agent-id-1",
    "description": "설명",
    "url": "https://example.com",
    "version": "1.0.0",
    "protocol_version": "0.3.0",
    "preferred_transport": "JSONRPC",
    "skills": [],
    "health_check": {
      "url": "https://example.com/health",
      "timeout": 10
    }
  }
}

// data/users.json
{
  "admin": {
    "username": "admin",
    "email": "admin@example.com",
    "hashed_password": "$pbkdf2-sha256$...",
    "role": "admin",
    "disabled": false
  }
}

// data/health_status.json
{
  "agent-id-1": {
    "status": "active",
    "last_check_at": "2025-10-23T10:15:32.433689Z",
    "failure_count": 0
  }
}
```

---

## 헬스 모니터링

### 모니터링 흐름

1. **스케줄러 시작**
   - 서버 시작 시 APScheduler 초기화
   - 5분 간격으로 `run_health_checks()` 실행

2. **헬스 체크 실행**
   ```python
   for agent_id, health_config in agents:
       # health_check.url에 GET 요청
       response = await client.get(health_config['url'])

       if response.status_code == 200:
           # 성공: active 상태, failure_count = 0
           update_health_status(agent_id, "active", 0)
       else:
           # 실패: failure_count 증가
           failure_count += 1
           status = "inactive" if failure_count >= 3 else "active"
           update_health_status(agent_id, status, failure_count)
   ```

3. **상태 업데이트**
   - `health_status.json` 파일 업데이트
   - `last_check_at`: 마지막 체크 시간 (ISO 8601)
   - `status`: active / inactive
   - `failure_count`: 연속 실패 횟수

4. **프론트엔드 표시**
   - AgentCard 컴포넌트에 상태 배지 표시
   - 🟢 active: 초록색
   - 🔴 inactive: 빨간색

---

## API 상세 명세

### 에이전트 API

#### GET /agents
등록된 모든 에이전트 목록 조회

**요청**
```http
GET /agents HTTP/1.1
Host: localhost:8000
```

**응답**
```json
{
  "agents": [
    {
      "name": "my-agent",
      "description": "My awesome agent",
      "url": "https://example.com",
      "version": "1.0.0",
      "protocol_version": "0.3.0",
      "preferred_transport": "JSONRPC",
      "skills": [],
      "health_status": {
        "status": "active",
        "last_check_at": "2025-10-23T10:15:32.433689Z",
        "failure_count": 0
      }
    }
  ],
  "count": 1
}
```

#### POST /agents
새 에이전트 등록

**요청**
```http
POST /agents HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "name": "my-agent",
  "description": "My awesome agent",
  "url": "https://example.com",
  "version": "1.0.0",
  "protocol_version": "0.3.0",
  "preferred_transport": "JSONRPC",
  "skills": []
}
```

**응답**
```json
{
  "agent_id": "my-agent",
  "message": "Agent registered successfully"
}
```

#### DELETE /agents/{agent_id}
에이전트 삭제 (Admin 전용)

**요청**
```http
DELETE /agents/my-agent HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답**
```json
{
  "message": "Agent deleted successfully"
}
```

### 인증 API

#### POST /auth/login
로그인

**요청**
```http
POST /auth/login HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

**응답**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### GET /auth/me
현재 사용자 정보 조회

**요청**
```http
GET /auth/me HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**응답**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "disabled": false
}
```

---

## 배포 및 운영

### 환경 변수 설정

```bash
# .env 파일
STORAGE_TYPE=file                    # memory 또는 file
STORAGE_DATA_DIR=./data             # 데이터 저장 디렉터리
SECRET_KEY=your-secret-key-here     # JWT 시크릿 키 (변경 필수!)
ALGORITHM=HS256                      # JWT 알고리즘
ACCESS_TOKEN_EXPIRE_MINUTES=43200    # 토큰 만료 시간 (30일)
```

### 서버 실행

**개발 모드**
```bash
# 백엔드
.venv/bin/a2a-registry serve --host 0.0.0.0 --port 8000

# 프론트엔드
cd frontend && npm run dev
```

**프로덕션 모드**
```bash
# 백엔드
STORAGE_TYPE=file STORAGE_DATA_DIR=/var/data/a2a-registry \
.venv/bin/a2a-registry serve --host 0.0.0.0 --port 8000

# 프론트엔드 빌드
cd frontend && npm run build
# Nginx 등으로 정적 파일 서빙
```

### 보안 고려사항

1. **SECRET_KEY 변경**: 프로덕션 환경에서 반드시 강력한 시크릿 키 사용
2. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 적용
3. **CORS 설정**: 프로덕션에서는 특정 도메인만 허용하도록 CORS 설정 변경
4. **비밀번호 정책**: 기본 계정(admin/admin) 비밀번호 변경
5. **토큰 만료**: ACCESS_TOKEN_EXPIRE_MINUTES 적절히 설정

### 모니터링

**로그 확인**
```bash
# 백엔드 로그
tail -f server.log

# 주요 로그 메시지
# - "Loaded N agents from ..."  : 에이전트 로딩
# - "User logged in: ..."       : 로그인 성공
# - "Health check completed"    : 헬스 체크 완료
# - "Updated health status..."  : 에이전트 상태 업데이트
```

**헬스 체크 상태 확인**
```bash
# 특정 에이전트 헬스 상태
curl http://localhost:8000/agents/{agent_id}/health

# 모든 에이전트 상태 (health_status 필드 포함)
curl http://localhost:8000/agents
```

### 백업 및 복구

**데이터 백업**
```bash
# FileStorage 모드에서 data/ 디렉터리 전체 백업
tar -czf a2a-registry-backup-$(date +%Y%m%d).tar.gz data/
```

**데이터 복구**
```bash
# 백업 파일 압축 해제
tar -xzf a2a-registry-backup-20251023.tar.gz

# 서버 재시작하면 자동으로 로딩됨
```

---

## 문제 해결 (Troubleshooting)

### 로그인 실패
- **증상**: admin/admin으로 로그인 안 됨
- **원인**: roles.yaml 경로 오류 또는 비밀번호 해싱 문제
- **해결**:
  1. `backend/auth.py`의 config_path 확인
  2. `data/users.json` 파일 확인
  3. 서버 재시작으로 기본 사용자 재생성

### 에이전트가 표시되지 않음
- **증상**: 등록한 에이전트가 목록에 안 보임
- **원인**: InMemoryStorage 사용 중 또는 파일 로딩 실패
- **해결**:
  1. 환경 변수 확인: `STORAGE_TYPE=file`
  2. 서버 로그에서 "Loaded N agents" 메시지 확인
  3. `data/agents.json` 파일 존재 및 형식 확인

### 헬스 체크 실패
- **증상**: 에이전트 상태가 계속 inactive
- **원인**: 헬스 체크 URL 접근 불가
- **해결**:
  1. 에이전트의 `health_check.url` 확인
  2. 네트워크 연결 확인
  3. 타임아웃 설정 증가 (`health_check.timeout`)

### CORS 오류
- **증상**: 프론트엔드에서 API 호출 시 CORS 에러
- **원인**: 백엔드 CORS 설정 문제
- **해결**:
  1. `backend/server.py`의 CORS 설정 확인
  2. 프론트엔드 URL이 허용 목록에 있는지 확인

---

## 추가 개선 사항

### 향후 개발 계획
1. **데이터베이스 연동**: PostgreSQL, MySQL 지원
2. **검색 기능**: 에이전트 이름, 스킬로 검색
3. **페이지네이션**: 대량의 에이전트 처리
4. **웹훅**: 에이전트 상태 변경 시 알림
5. **통계 대시보드**: 에이전트 사용 통계, 헬스 체크 히스토리
6. **API 키 관리**: JWT 외 API 키 인증 지원
7. **감사 로그**: 모든 변경 사항 추적

---

## 참고 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [React 공식 문서](https://react.dev/)
- [JWT.io](https://jwt.io/)
- [Tailwind CSS 문서](https://tailwindcss.com/)
