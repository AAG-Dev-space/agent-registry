# Agent Registry 등록 플로우

URL 기반 AgentCard 등록 및 동기화 시스템

---

## 1. Agent 준비 단계

```
Agent 개발자
    ↓
AgentCard JSON 작성
    ↓
웹 서버에 정적 파일 호스팅
    https://myagent.com/.well-known/agent-card.json
    ↓
URL 공개 접근 가능 확인
```

## 2. Registry 등록 플로우

### Frontend

```typescript
1. AgentCard URL 입력
   https://myagent.com/.well-known/agent-card.json

2. [검증] 버튼 (선택)
   POST /api/v1/agents/verify
   → AgentCard 미리보기 표시

3. [등록] 버튼
   POST /api/v1/agents
   Body: { "agent_card_url": "https://..." }
```

### Backend 처리

```python
POST /api/v1/agents
    ↓
1. HTTP GET: agent_card_url
   (타임아웃: 10초)
    ↓
2. AgentCard JSON 파싱 및 검증
    ↓
3. 중복 체크
   - 존재 → 업데이트
   - 없음 → 신규 생성
    ↓
4. 해시 생성 (변경 감지용)
   hash = sha256(agent_card)
    ↓
5. DB 저장
   - AgentModel
     ├─ name
     ├─ agent_card_url
     ├─ agent_card (JSONB)
     └─ updated_at

   - AgentSyncStatusModel
     ├─ status: "active"
     ├─ last_sync_at
     ├─ card_hash
     ├─ consecutive_failures: 0
     └─ last_response_time_ms
    ↓
6. 응답
   { "id": "...", "name": "...", "status": "active" }
```

## 3. 자동 동기화 (하루 1회)

```
APScheduler (매일 새벽 3시)
    ↓
AgentSyncService.sync_all_agents()
    ↓
모든 Agent 조회
    ↓
각 Agent마다:
    ├─ HTTP GET: agent_card_url
    ├─ AgentCard fetch
    ├─ 새 해시 계산
    ├─ 기존 해시와 비교
    │
    ├─ [변경 감지됨]
    │   ├─ agent_card 업데이트
    │   ├─ card_hash 업데이트
    │   ├─ status = "active"
    │   ├─ consecutive_failures = 0
    │   └─ last_sync_at 갱신
    │
    ├─ [변경 없음]
    │   ├─ status = "active"
    │   └─ last_sync_at 갱신
    │
    └─ [실패]
        ├─ status = "inactive"
        ├─ consecutive_failures += 1
        ├─ last_error 저장
        └─ if failures >= 3:
            └─ status = "deprecated"
```

## 4. 상태 전이

```
등록 → active
  ↓
폴링 성공 → active (유지)
  ↓
폴링 실패 1회 → inactive
  ↓
폴링 실패 2회 → inactive (유지)
  ↓
폴링 실패 3회 → deprecated
  ↓
수동 검증 성공 → active (복구)
```

## 5. API 엔드포인트

```python
# 등록 (Public)
POST /api/v1/agents
Body: { "agent_card_url": "https://..." }
→ fetch → 검증 → 저장

# 미리보기 검증 (Public)
POST /api/v1/agents/verify
Body: { "agent_card_url": "https://..." }
→ fetch → 검증 (저장 안함)

# 수동 동기화 (Public)
POST /api/v1/agents/{id}/verify
→ 즉시 동기화 실행

# 동기화 상태 조회 (Public)
GET /api/v1/agents/{id}/sync-status
→ { status, last_sync_at, consecutive_failures, ... }

# 목록 조회 (Public)
GET /api/v1/agents
→ 모든 Agent + 동기화 상태

# 삭제 (Public - URL 소유권 검증)
DELETE /api/v1/agents/{id}
→ Agent + SyncStatus 삭제
```

## 6. 전체 시퀀스 다이어그램

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│ Agent Server│         │   Registry   │         │   Frontend   │
└──────┬──────┘         └──────┬───────┘         └──────┬───────┘
       │                       │                        │
       │  /.well-known/        │                        │
       │  agent-card.json      │                        │
       │                       │                        │
       │                       │  1. URL 입력 & 등록    │
       │                       │◄───────────────────────┤
       │                       │                        │
       │◄──────────────────────┤                        │
       │   HTTP GET            │                        │
       ├──────────────────────►│                        │
       │   200 OK              │                        │
       │   AgentCard JSON      │                        │
       │                       │                        │
       │                  [검증 & 저장]                 │
       │                       │                        │
       │                       ├────────────────────────►
       │                       │   등록 완료            │
       │                       │                        │
       │                       │                        │
       │        [하루 1회 자동 동기화]                  │
       │                       │                        │
       │◄──────────────────────┤                        │
       │   HTTP GET            │                        │
       ├──────────────────────►│                        │
       │   200 OK              │                        │
       │                       │                        │
       │                  [해시 비교]                   │
       │                  [변경 감지]                   │
       │                  [자동 업데이트]               │
       │                       │                        │
```

## 7. 권장 AgentCard URL

```
https://myagent.company.com/.well-known/agent-card.json
```

## 8. 핵심 포인트

✅ **Agent는 AgentCard JSON을 웹서버에 호스팅**
✅ **사용자는 URL만 Registry에 입력**
✅ **인증 불필요**: 모든 API가 Public, URL 소유권이 곧 인증
✅ **Registry가 자동으로 fetch 및 검증**
✅ **하루 1회 자동 폴링으로 변경사항 감지**
✅ **실패 시 자동 상태 관리 (active → inactive → deprecated)**

→ Agent 개발자는 AgentCard 파일만 업데이트하면 Registry가 자동으로 동기화!
→ 별도의 회원가입, 로그인 절차 없이 즉시 등록 가능!
