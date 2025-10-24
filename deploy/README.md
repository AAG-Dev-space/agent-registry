# A2A Agent Registry - Docker 배포 가이드

Docker를 사용하여 A2A Agent Registry를 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

- Docker 20.10 이상
- Docker Compose 2.0 이상

## 🚀 빠른 시작

### 1. Docker 이미지 빌드

```bash
cd deploy
./build.sh
```

### 2. 환경 변수 설정 (선택사항)

배포 디렉토리에 `.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:

```bash
# .env 파일 예시
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
PORT=80
```

### 3. Docker Compose로 실행

```bash
docker compose up -d
```

### 4. 애플리케이션 접속

브라우저에서 `http://localhost` (또는 설정한 포트)로 접속합니다.

## 📦 이미지 구성

### Backend 이미지
- **Base Image**: `python:3.11-slim`
- **Multi-stage build**로 최적화
- 최종 이미지 크기: ~150MB (예상)
- 포함 내용:
  - Python 애플리케이션
  - 필수 의존성만 포함
  - 파일 기반 저장소 지원

### Frontend 이미지
- **Base Image**: `nginx:1.25-alpine`
- **Multi-stage build**로 최적화
- 최종 이미지 크기: ~25MB (예상)
- 포함 내용:
  - 빌드된 정적 파일
  - Nginx 웹 서버
  - 최적화된 nginx 설정

## 🏗️ 개별 이미지 빌드

### Backend 빌드
```bash
cd ..  # 프로젝트 루트로 이동
docker build -f deploy/Dockerfile.backend -t a2a-registry-backend:latest .
```

### Frontend 빌드
```bash
docker build -f deploy/Dockerfile.frontend -t a2a-registry-frontend:latest .
```

## 🔧 설정

### 환경 변수

#### Backend
- `STORAGE_TYPE`: 저장소 타입 (기본값: `file`)
- `STORAGE_DATA_DIR`: 데이터 디렉토리 경로 (기본값: `/app/data`)
- `SECRET_KEY`: JWT 시크릿 키 (**프로덕션에서 반드시 변경**)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 액세스 토큰 만료 시간 (기본값: `30`)

#### Frontend
- `PORT`: 외부 노출 포트 (기본값: `80`)

### 볼륨

#### backend-data
- 경로: `/app/data`
- 용도: 에이전트, 사용자, 헬스 상태 데이터 저장
- 타입: Docker 볼륨

## 📊 헬스 체크

### Backend
- 엔드포인트: `http://localhost:8000/health`
- 간격: 30초
- 타임아웃: 10초
- 재시도: 3회

### Frontend
- 엔드포인트: `http://localhost:80/`
- 간격: 30초
- 타임아웃: 3초
- 재시도: 3회

## 🛠️ 관리 명령어

### 로그 확인
```bash
# 전체 로그
docker-compose logs -f

# Backend만
docker-compose logs -f backend

# Frontend만
docker-compose logs -f frontend
```

### 컨테이너 상태 확인
```bash
docker-compose ps
```

### 컨테이너 재시작
```bash
# 전체 재시작
docker-compose restart

# Backend만
docker-compose restart backend

# Frontend만
docker-compose restart frontend
```

### 컨테이너 중지
```bash
docker-compose down
```

### 데이터 포함 완전 삭제
```bash
docker-compose down -v
```

## 🔍 문제 해결

### 포트 충돌
포트 80이 이미 사용 중인 경우 `.env` 파일에서 다른 포트를 설정:
```bash
PORT=8080
```

### 데이터 초기화
저장된 데이터를 초기화하려면:
```bash
docker-compose down -v
docker-compose up -d
```

### 로그 확인
에러 발생 시 로그를 확인:
```bash
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend
```

## 📝 프로덕션 배포 체크리스트

- [ ] `SECRET_KEY` 환경 변수를 안전한 랜덤 값으로 변경
- [ ] HTTPS 설정 (리버스 프록시 사용 권장)
- [ ] 방화벽 설정
- [ ] 백업 전략 수립 (볼륨 데이터)
- [ ] 모니터링 설정
- [ ] 로그 로테이션 설정

## 🌐 네트워크 구성

Docker Compose는 다음과 같은 네트워크를 생성합니다:

- **a2a-network**: Frontend와 Backend가 통신하는 브리지 네트워크
- Frontend는 `/api/*` 요청을 Backend로 프록시

## 📚 추가 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [프로젝트 README](../README.md)
- [상세 구현 문서](../DETAIL_ko.md)
