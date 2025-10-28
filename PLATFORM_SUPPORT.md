# Agent Platform 지원 가이드

## 문제 상황

A2A (Agent-to-Agent) 프로토콜은 표준이지만, 각 Agent 플랫폼마다 구현 방식이 다를 수 있습니다:

- **Agno**: A2A v0.3.0 표준을 따르며 `/a2a/message/send` 형식 사용
- **Generic Agents**: 단순한 JSON-RPC 형식 사용
- **LangChain/AutoGen**: 각자의 고유 프로토콜 사용

현재 Registry는 generic JSON-RPC 예제만 제공하여 Agno 같은 특정 플랫폼 사용자에게 혼란을 줄 수 있습니다.

---

## 해결 방안

### 방안 1: Platform 필드 추가 (추천) ⭐⭐⭐

#### 개요
Agent 등록 시 `metadata.platform` 필드를 추가하여 플랫폼 정보를 저장하고, Agent Detail 페이지에서 해당 플랫폼에 맞는 사용 예제를 동적으로 생성합니다.

#### Agent Card 구조
```json
{
  "name": "My Agno Agent",
  "description": "Agent built with Agno platform",
  "url": "https://api.agno-agent.example.com",
  "version": "1.0.0",
  "protocol_version": "1.0",

  "metadata": {
    "platform": "agno",
    "platform_version": "1.0.0",
    "owner": {
      "team": "AI Platform"
    }
  }
}
```

#### 지원 플랫폼
- `"agno"`: Agno platform (A2A v0.3.0 표준)
- `"generic"`: Generic JSON-RPC agent (기본값)
- `"langchain"`: LangChain agents
- `"autogen"`: Microsoft AutoGen
- `"custom"`: 커스텀 프로토콜

#### 장점
- ✅ 유연성: 새 플랫폼 추가 시 코드 수정 최소화
- ✅ 정확성: 각 플랫폼에 맞는 정확한 예제 제공
- ✅ 확장성: 플랫폼별 추가 기능 구현 가능
- ✅ 하위 호환성: 기존 Agent는 "generic"으로 처리

---

### 방안 2: 다중 예제 탭 제공

#### 개요
Agent Detail 페이지에서 여러 플랫폼 예제를 탭으로 제공합니다.

#### UI 구조
```
┌─────────────────────────────────────────┐
│ How to Use This Agent                   │
│                                          │
│ [Generic] [Agno] [LangChain] [Custom]  │ ← 탭
│                                          │
│ curl -X POST ...                        │
│ (선택된 플랫폼의 예제)                    │
└─────────────────────────────────────────┘
```

#### 장점
- ✅ 모든 플랫폼 예제를 한 번에 제공
- ✅ 사용자가 자신의 플랫폼 선택 가능

#### 단점
- ❌ UI가 복잡해짐
- ❌ 대부분의 사용자에게 불필요한 정보

---

### 방안 3: A2A 표준 스키마만 사용 (장기 목표)

#### 개요
모든 Agent가 A2A v0.3.0 표준을 엄격히 따르도록 강제합니다.

#### Agno A2A 표준 예제
```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Hello, can you help me?"
        }
      ]
    }
  },
  "id": "request-123"
}
```

#### 장점
- ✅ 표준 준수
- ✅ 플랫폼 간 상호운용성 극대화

#### 단점
- ❌ 기존 Agent 마이그레이션 필요
- ❌ 비표준 플랫폼 지원 불가

---

## 추천 구현: 방안 1 (Platform 필드)

### 1단계: Agent Card metadata에 platform 추가

**Register Agent 페이지**:
```typescript
// Platform 선택 드롭다운 추가
<select name="platform" onChange={handlePlatformChange}>
  <option value="generic">Generic (기본)</option>
  <option value="agno">Agno</option>
  <option value="langchain">LangChain</option>
  <option value="autogen">AutoGen</option>
  <option value="custom">Custom</option>
</select>
```

### 2단계: Platform별 예제 템플릿 생성

**예제 생성 함수**:
```typescript
function getMessageExample(agent: AgentCard): string {
  const platform = agent.metadata?.platform || 'generic';

  switch (platform) {
    case 'agno':
      return getAgnoExample(agent);
    case 'langchain':
      return getLangChainExample(agent);
    default:
      return getGenericExample(agent);
  }
}
```

### 3단계: Agent Detail 페이지 수정

Platform에 따라 다른 curl 명령어와 설명을 표시:

```typescript
{/* Platform-specific guide */}
{agent.metadata?.platform === 'agno' && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <p className="text-sm text-blue-800">
      ℹ️ This agent uses Agno platform (A2A v0.3.0 standard)
    </p>
  </div>
)}
```

---

## 플랫폼별 메시지 형식 비교

### Generic (현재)
```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "type": "text",
          "content": "Hello"
        }
      ]
    }
  },
  "id": "1"
}
```

### Agno (A2A v0.3.0)
```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "kind": "text",
          "text": "Hello"
        }
      ]
    }
  },
  "id": "request-123"
}
```

**차이점**:
1. `parts[].type` → `parts[].kind`
2. `parts[].content` → `parts[].text`
3. Response 구조가 다름 (task, contextId, history 포함)

### LangChain
```python
from langchain.agents import AgentExecutor
agent.invoke({"input": "Hello"})
```

---

## 구현 우선순위

### Phase 1: 기본 지원 (즉시)
1. ✅ metadata.platform 필드 추가
2. ✅ Register Agent에 platform 선택 UI 추가
3. ✅ Agent Detail에서 platform별 예제 표시

### Phase 2: 고급 기능 (향후)
1. Platform별 추가 설정 옵션
2. Platform별 Health Check 방식
3. Platform별 응답 포맷 처리

### Phase 3: 통합 (장기)
1. A2A v0.3.0 완전 준수
2. Platform adapter 개발
3. Cross-platform 테스트 도구

---

## 예상 질문 (FAQ)

### Q1: 기존 Agent는 어떻게 되나요?
**A**: `metadata.platform`이 없으면 자동으로 "generic"으로 처리됩니다.

### Q2: 여러 플랫폼을 동시에 지원하는 Agent는?
**A**: `metadata.platforms` 배열로 확장 가능합니다:
```json
{
  "metadata": {
    "platforms": ["agno", "generic"]
  }
}
```

### Q3: 플랫폼 추가는 어떻게 하나요?
**A**:
1. `PLATFORM_SUPPORT.md`에 플랫폼 문서 추가
2. `getMessageExample()` 함수에 case 추가
3. Register Agent UI에 옵션 추가

### Q4: A2A 표준 버전이 업그레이드되면?
**A**: `protocol_version` 필드로 버전 관리하며, platform과 독립적입니다.

---

## 다음 단계

1. **의사결정**: 방안 1 (Platform 필드) 구현 여부 결정
2. **UI 설계**: Register Agent 페이지 platform 선택 UI 디자인
3. **예제 작성**: 각 플랫폼별 정확한 메시지 형식 문서화
4. **코드 구현**: Frontend (Agent Detail, Register Agent) 수정
5. **테스트**: 각 플랫폼별 예제 검증

---

## 참고 자료

- [A2A Protocol Specification](https://github.com/a2a-org/a2a-protocol)
- [Agno Documentation](https://docs.agno.com/reference-api/schema/a2a/send-message)
- [LangChain Agents](https://python.langchain.com/docs/modules/agents/)
- [Microsoft AutoGen](https://microsoft.github.io/autogen/)
