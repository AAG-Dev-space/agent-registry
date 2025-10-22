# A2A Registry - 프론트엔드 설치 및 실행 가이드

## 📋 개요

A2A Registry를 위한 현대적인 웹 인터페이스가 성공적으로 구축되었습니다. 이 가이드는 프론트엔드를 설치하고 실행하는 방법을 안내합니다.

## 🎯 구현된 기능

### 1. 홈 페이지 (Home)
- A2A Registry 소개 및 주요 기능 안내
- 프로토콜 정보 표시
- 빠른 네비게이션 버튼

### 2. 에이전트 목록 (Agent List)
- 등록된 모든 에이전트 카드 형식으로 표시
- 실시간 검색 기능 (이름, 설명, 스킬로 검색)
- 에이전트 상세 정보 빠른 보기
- 전송 프로토콜 (JSONRPC, REST, GraphQL) 표시

### 3. 에이전트 등록 (Register Agent)
- 직관적인 폼 인터페이스
- 필수 정보 입력 (이름, 설명, URL, 버전)
- 동적 스킬 추가/제거
- 전송 프로토콜 선택
- 실시간 유효성 검증
- 성공/실패 피드백

### 4. 에이전트 상세 (Agent Detail)
- 에이전트의 모든 정보 표시
- 스킬 및 기능 상세 보기
- 확장 기능 정보
- 에이전트 삭제 기능

### 5. 서버 헬스 체크 (Health)
- 백엔드 서버 상태 모니터링
- 연결 문제 해결 가이드
- 사용 가능한 API 엔드포인트 정보

## 🛠 기술 스택

- **React 18** - 최신 React with TypeScript
- **Vite** - 빠른 빌드 도구 및 개발 서버
- **React Router** - 클라이언트 사이드 라우팅
- **Axios** - HTTP 클라이언트
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts           # API 클라이언트 (백엔드 통신)
│   ├── components/
│   │   └── Layout.tsx          # 메인 레이아웃 및 사이드바
│   ├── pages/
│   │   ├── Home.tsx            # 홈 페이지
│   │   ├── AgentList.tsx       # 에이전트 목록 페이지
│   │   ├── AgentDetail.tsx     # 에이전트 상세 페이지
│   │   ├── RegisterAgent.tsx   # 에이전트 등록 폼
│   │   └── Health.tsx          # 서버 헬스 체크
│   ├── types/
│   │   └── agent.ts            # TypeScript 타입 정의
│   ├── App.tsx                 # 메인 앱 컴포넌트 (라우팅)
│   ├── main.tsx                # 앱 진입점
│   └── index.css               # 전역 스타일 (Tailwind)
└── package.json                # 의존성 및 스크립트
```

## 🚀 설치 및 실행 방법

### 1단계: 프론트엔드 디렉토리로 이동

```bash
cd /home/app/05_agent_registry/ssai_agent_registry/a2a-registry/frontend
```

### 2단계: 의존성 설치 (이미 완료됨)

```bash
npm install
```

### 3단계: 백엔드 서버 실행

**새 터미널에서** 백엔드 서버를 먼저 실행해야 합니다:

```bash
cd /home/app/05_agent_registry/ssai_agent_registry/a2a-registry
.venv/bin/a2a-registry serve --host 0.0.0.0 --port 8000
```

백엔드 서버가 실행되면 다음과 같은 메시지가 표시됩니다:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 4단계: 프론트엔드 개발 서버 실행

프론트엔드 디렉토리에서:

```bash
npm run dev
```

프론트엔드 서버가 실행되면:
```
  VITE v7.1.11  ready in 191 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://0.0.0.0:5173/
```

### 5단계: 브라우저에서 접속

브라우저를 열고 다음 주소로 접속:
```
http://localhost:5173
```

## ✅ 현재 상태

### 백엔드 서버
- ✅ 포트 8000에서 실행 중
- ✅ CORS 설정 완료 (프론트엔드 연동 가능)
- ✅ 3개의 샘플 에이전트 등록됨:
  1. **weather-agent** - 날씨 정보 제공 (JSONRPC)
  2. **finance-agent** - 금융 데이터 분석 (REST)
  3. **translation-agent** - 다국어 번역 서비스 (GRAPHQL)

### 프론트엔드
- ✅ 프로덕션 빌드 성공
- ✅ 개발 서버 실행 중 (포트 5173)
- ✅ 모든 페이지 구현 완료
- ✅ API 클라이언트 설정 완료

## 🎨 디자인 특징

- **다크 테마**: 눈에 편한 슬레이트 색상 체계
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **모던 UI**: Tailwind CSS로 구현된 깔끔한 인터페이스
- **직관적 네비게이션**: 왼쪽 사이드바로 쉬운 페이지 이동
- **실시간 피드백**: 로딩, 성공, 에러 상태 표시

## 🔧 환경 변수 설정

`.env` 파일에서 백엔드 URL을 설정할 수 있습니다:

```bash
VITE_API_URL=http://localhost:8000
```

## 📊 API 엔드포인트

프론트엔드는 다음 REST API를 사용합니다:

| 메소드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/agents` | 모든 에이전트 목록 조회 |
| POST | `/agents` | 새 에이전트 등록 |
| GET | `/agents/:id` | 특정 에이전트 상세 정보 |
| POST | `/agents/search` | 에이전트 검색 |
| DELETE | `/agents/:id` | 에이전트 삭제 |
| GET | `/health` | 서버 헬스 체크 |

## 🧪 테스트 시나리오

### 1. 에이전트 목록 보기
1. 홈 페이지에서 "Browse Agents" 클릭
2. 등록된 3개의 샘플 에이전트 확인
3. 검색창에 "weather" 입력하여 필터링 테스트

### 2. 에이전트 등록
1. 사이드바에서 "Register Agent" 클릭
2. 폼에 정보 입력:
   - Name: `test-agent`
   - Description: `테스트 에이전트입니다`
   - URL: `https://test.example.com`
   - Version: `1.0.0`
3. "Add Skill" 버튼으로 스킬 추가
4. "Register Agent" 버튼 클릭
5. 성공 메시지 확인 후 자동으로 에이전트 목록으로 이동

### 3. 에이전트 상세 보기
1. 에이전트 목록에서 에이전트 카드의 링크 아이콘 클릭
2. 에이전트의 모든 정보 확인
3. "Delete" 버튼으로 삭제 가능

### 4. 서버 상태 확인
1. 사이드바에서 "Server Health" 클릭
2. 서버 상태 및 정보 확인
3. "Refresh" 버튼으로 상태 재확인

## 🔍 문제 해결

### 백엔드 연결 오류
**증상**: "Failed to load agents" 에러 메시지

**해결 방법**:
1. 백엔드 서버가 실행 중인지 확인:
   ```bash
   curl http://localhost:8000/health
   ```
2. 응답이 없으면 백엔드 서버 재시작:
   ```bash
   cd /home/app/05_agent_registry/ssai_agent_registry/a2a-registry
   .venv/bin/a2a-registry serve --host 0.0.0.0 --port 8000
   ```

### 프론트엔드 빌드 오류
**증상**: npm run build 실패

**해결 방법**:
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# Vite 캐시 삭제
rm -rf node_modules/.vite
```

### 포트 충돌
**증상**: "Port 5173 is already in use"

**해결 방법**:
```bash
# 다른 포트로 실행
npm run dev -- --port 3000
```

## 📝 추가 개발 가이드

### 새 페이지 추가하기
1. `src/pages/` 에 새 컴포넌트 생성
2. `src/App.tsx` 에 라우트 추가
3. `src/components/Layout.tsx` 에 네비게이션 링크 추가

### 스타일 커스터마이징
- `tailwind.config.js` 에서 색상, 폰트 등 커스터마이징
- `src/index.css` 에서 전역 스타일 수정

### API 클라이언트 확장
- `src/api/client.ts` 에 새 API 메소드 추가
- `src/types/agent.ts` 에 타입 정의 추가

## 🎉 완료!

A2A Registry 웹 인터페이스가 성공적으로 구축되었습니다.
이제 브라우저에서 http://localhost:5173 으로 접속하여 사용할 수 있습니다.

## 📞 참고 자료

- **프론트엔드 README**: `frontend/README.md`
- **백엔드 CLAUDE.md**: `CLAUDE.md` (루트 디렉토리)
- **A2A Protocol 문서**: https://a2a-protocol.org
- **FastAPI 문서**: https://fastapi.tiangolo.com/

---

**제작**: Claude Code로 생성됨
**날짜**: 2025-10-22
**버전**: A2A Registry v0.1.5 + Frontend v1.0.0
