# Frontend - A2A Agent Registry

React + TypeScript 기반 에이전트 레지스트리 프론트엔드

## 기술 스택

- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Vite**: 빠른 빌드 도구
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **React Router**: 클라이언트 사이드 라우팅
- **Axios**: HTTP 클라이언트
- **Lucide React**: 아이콘 라이브러리

## 프로젝트 구조

```
src/
├── components/       # 재사용 가능한 UI 컴포넌트
│   ├── AgentCard.tsx
│   ├── AgentModal.tsx
│   ├── Layout.tsx
│   └── LanguageToggle.tsx
├── contexts/         # React Context
│   ├── AuthContext.tsx      # 인증 상태 관리
│   └── LanguageContext.tsx  # 다국어 지원
├── pages/            # 페이지 컴포넌트
│   ├── Home.tsx
│   ├── AgentList.tsx
│   ├── AgentDetail.tsx
│   ├── RegisterAgent.tsx
│   ├── Login.tsx
│   ├── Health.tsx
│   └── wiki/         # 문서 페이지
├── api/              # API 클라이언트
│   └── client.ts
└── types/            # TypeScript 타입 정의
    └── agent.ts
```

## 주요 기능

### 1. 에이전트 관리 (URL 기반)
- 에이전트 목록 조회 및 필터링
- 에이전트 상세 정보 모달
- **새 에이전트 등록**: AgentCard URL 입력 방식
  - URL 입력 폼 (예: `https://myagent.com/.well-known/agent-card.json`)
  - 실시간 URL 검증 기능
  - AgentCard 미리보기
- 에이전트 삭제 (Public - URL 소유권 검증)

### 2. 다국어 지원
- 한국어/영어 전환
- LanguageContext를 통한 언어 상태 관리
- 모든 페이지 및 컴포넌트에서 지원

### 3. 동기화 상태 모니터링
- 에이전트 동기화 상태 실시간 조회
- 상태별 시각적 표시 (active/inactive/deprecated)
- 마지막 동기화 시간 표시
- 수동 검증 버튼

## API 통신

### API Client (`src/api/client.ts`)
```typescript
- axios 인스턴스 설정
- 자동 JWT 토큰 첨부
- 요청/응답 인터셉터
- 기본 URL: http://localhost:8000
```

### 주요 엔드포인트
- `GET /api/v1/agents`: 에이전트 목록
- `POST /api/v1/agents`: 에이전트 등록 (AgentCard URL 전송)
- `GET /api/v1/agents/{id}`: 에이전트 상세
- `DELETE /api/v1/agents/{id}`: 에이전트 삭제
- `POST /api/v1/agents/{id}/verify`: AgentCard URL 수동 검증
- `GET /api/v1/agents/{id}/sync-status`: 동기화 상태 조회

## 컨텍스트 사용

### LanguageContext
```typescript
const { language, setLanguage, t } = useLanguage();

// 언어 전환
setLanguage('en'); // 또는 'ko'

// 번역
t('home.title')
```

## 라우트 구조

```
/ - 홈 (에이전트 목록)
/login - 로그인 페이지
/agents - 에이전트 목록
/agents/:id - 에이전트 상세
/register - 에이전트 등록
/health - 헬스 체크
/wiki/* - 문서 페이지
```

## 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (포트 5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 환경 변수

`.env` 파일 생성:
```
VITE_API_BASE_URL=http://localhost:8000
```

## 스타일링

- **Tailwind CSS**: 유틸리티 클래스 기반
- **반응형 디자인**: 모바일 우선 접근
- **다크 모드**: 미지원 (향후 추가 가능)

## 주요 컴포넌트

### AgentCard
에이전트 정보를 카드 형태로 표시하는 컴포넌트

### AgentModal
에이전트 상세 정보를 모달로 표시

### Layout
공통 레이아웃 (네비게이션, 사이드바 포함)

### LanguageToggle
언어 전환 버튼

## 빌드 최적화

- Vite의 빠른 HMR (Hot Module Replacement)
- 코드 분할 (React.lazy)
- TypeScript strict 모드
- ESLint 설정

---

## 🔄 UI 변경 계획: URL 기반 등록 시스템

### 현재 등록 폼 (AS-IS)
```typescript
// RegisterAgent.tsx
<form>
  <textarea name="agentCard" />  // JSON 전체 입력
  <button>등록</button>
</form>
```

### 새로운 등록 폼 (TO-BE)
```typescript
// RegisterAgent.tsx
<form>
  <input
    type="url"
    name="agentCardUrl"
    placeholder="https://myagent.com/.well-known/agent-card.json"
  />
  <button onClick={verifyUrl}>검증</button>
  {preview && <AgentCardPreview data={preview} />}
  <button type="submit">등록</button>
</form>
```

### 구현 계획

#### 1. RegisterAgent 페이지 변경
- [ ] JSON 입력 폼 → URL 입력 폼으로 변경
- [ ] URL 검증 버튼 추가
  - 클릭 시 `POST /agents/verify` 호출
  - AgentCard fetch 성공 시 미리보기 표시
- [ ] AgentCard 미리보기 컴포넌트 추가
- [ ] 등록 버튼: `{ "agent_card_url": "..." }` 형식으로 전송

#### 2. AgentCard 컴포넌트 개선
- [ ] 동기화 상태 표시 추가
  - 뱃지: active (녹색), inactive (회색), deprecated (빨강)
  - 마지막 동기화 시간 표시
- [ ] 수동 검증 버튼 추가 (Admin 전용)

#### 3. AgentDetail 페이지 개선
- [ ] `agent_card_url` 표시
- [ ] 동기화 상태 섹션 추가
  - 마지막 동기화: YYYY-MM-DD HH:mm
  - 상태: active/inactive/deprecated
  - 연속 실패 횟수
  - 마지막 에러 메시지 (있을 경우)
- [ ] "지금 검증" 버튼 추가

#### 4. 새로운 컴포넌트
```typescript
// components/AgentCardPreview.tsx
interface Props {
  data: AgentCard;
}
// AgentCard JSON을 읽기 좋게 표시

// components/SyncStatusBadge.tsx
interface Props {
  status: 'active' | 'inactive' | 'deprecated';
  lastSync?: string;
}
// 상태별 색상 뱃지 표시
```

#### 5. API 클라이언트 함수 추가
```typescript
// src/api/client.ts

// URL 검증 (미리보기용)
export const verifyAgentCardUrl = async (url: string) => {
  const res = await api.post('/agents/verify', { agent_card_url: url });
  return res.data;
};

// 에이전트 등록 (URL 기반)
export const registerAgentByUrl = async (url: string) => {
  const res = await api.post('/agents', { agent_card_url: url });
  return res.data;
};

// 동기화 상태 조회
export const getAgentSyncStatus = async (agentId: string) => {
  const res = await api.get(`/agents/${agentId}/sync-status`);
  return res.data;
};

// 수동 검증 실행
export const manualVerifyAgent = async (agentId: string) => {
  const res = await api.post(`/agents/${agentId}/verify`);
  return res.data;
};
```

#### 6. TypeScript 타입 추가
```typescript
// src/types/agent.ts

export interface AgentSyncStatus {
  agent_id: string;
  status: 'active' | 'inactive' | 'deprecated';
  last_sync_at: string;
  last_response_time_ms: number | null;
  consecutive_failures: number;
  last_error: string | null;
  card_hash: string;
}

export interface Agent {
  id: string;
  name: string;
  agent_card_url: string;  // 추가
  agent_card: AgentCard;
  created_at: string;
  updated_at: string;
  sync_status?: AgentSyncStatus;  // 추가
}
```

### UI/UX 개선사항

#### 등록 플로우
1. 사용자가 URL 입력
2. "검증" 버튼 클릭 → Loading
3. 성공 시 AgentCard 미리보기 표시
4. "등록" 버튼 활성화
5. 등록 완료 → 에이전트 목록으로 이동

#### 에러 처리
- URL 형식 오류: 즉시 표시
- 접근 불가: "URL에 접근할 수 없습니다"
- 타임아웃: "응답 시간 초과"
- 잘못된 JSON: "AgentCard 형식이 올바르지 않습니다"

#### Well-known 경로 안내
```tsx
<div className="info-box">
  <p>권장 경로: /.well-known/agent-card.json</p>
  <p>예시: https://myagent.com/.well-known/agent-card.json</p>
</div>
```
