# A2A Agent Registry - Docker 배포 가이드

## 🚀 빠른 시작

```bash
cd deploy

# 빌드 & 실행
./build.sh
docker compose up -d

# 접속
# Frontend: http://localhost:7600
# Backend:  http://localhost:7601
```

---

## 📁 데이터 저장

PostgreSQL 데이터는 Docker managed volume `agent_registry_db`에 자동 저장됩니다.

**Volume 위치**: `/var/lib/docker/volumes/agent_registry_db/_data`

**장점**:
- Docker가 자동 관리
- 권한 문제 없음
- 컨테이너 재시작 시 데이터 유지

---

## 🛠️ 주요 명령어

### 로그 확인
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### 중지 (데이터 유지)
```bash
docker compose down
```

### 재시작
```bash
docker compose restart backend
docker compose restart frontend
```

### 완전 초기화 (데이터 삭제 주의!)
```bash
docker compose down -v
```

---

## 🔄 코드 업데이트

### Backend만 수정
```bash
docker compose build backend
docker compose up -d backend
```

### Frontend만 수정
```bash
docker compose build frontend
docker compose up -d frontend
```

### 전체 재빌드
```bash
./build.sh
docker compose up -d
```

---

## 📌 환경 변수 (선택사항)

`.env` 파일 생성:
```bash
# deploy/.env
POSTGRES_PASSWORD=your_password
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 🔍 문제 해결

### 변경사항이 반영 안 됨
```bash
# 이미지 재빌드 필요
docker compose build --no-cache
docker compose up -d
```

### 데이터 백업
```bash
# Volume 백업
docker run --rm \
  -v agent_registry_db:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz -C /data .
```

### 데이터 복원
```bash
# Volume 복원
docker run --rm \
  -v agent_registry_db:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup-YYYYMMDD.tar.gz -C /data
```

### Volume 확인
```bash
# Volume 목록
docker volume ls

# Volume 상세 정보
docker volume inspect agent_registry_db
```

---

## 📚 추가 문서

- **프로젝트 README**: [../README.md](../README.md)
- **Docker 공식 문서**: https://docs.docker.com/compose/
