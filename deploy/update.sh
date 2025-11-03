#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}A2A Agent Registry - 서비스 업데이트${NC}"
echo -e "${BLUE}==========================================${NC}"

# Change to deploy directory
cd "$(dirname "$0")"

# Parse command line arguments
UPDATE_TARGET="${1:-all}"  # all, backend, frontend
KEEP_DATA="${2:-yes}"      # yes, no

case "$UPDATE_TARGET" in
  backend)
    echo -e "\n${YELLOW}[1/3] Backend 서비스 재빌드 중...${NC}"
    docker compose build backend

    echo -e "\n${YELLOW}[2/3] Backend 컨테이너 재시작 중...${NC}"
    docker compose up -d backend

    echo -e "\n${YELLOW}[3/3] 서비스 상태 확인 중...${NC}"
    sleep 3
    docker compose ps backend

    echo -e "\n${GREEN}✓ Backend 업데이트 완료!${NC}"
    echo -e "${GREEN}✓ DB 데이터는 유지됩니다.${NC}"
    ;;

  frontend)
    echo -e "\n${YELLOW}[1/3] Frontend 서비스 재빌드 중...${NC}"
    docker compose build frontend

    echo -e "\n${YELLOW}[2/3] Frontend 컨테이너 재시작 중...${NC}"
    docker compose up -d frontend

    echo -e "\n${YELLOW}[3/3] 서비스 상태 확인 중...${NC}"
    sleep 3
    docker compose ps frontend

    echo -e "\n${GREEN}✓ Frontend 업데이트 완료!${NC}"
    ;;

  all)
    echo -e "\n${YELLOW}[1/4] 모든 서비스 재빌드 중...${NC}"
    docker compose build

    echo -e "\n${YELLOW}[2/4] 변경된 서비스 재시작 중...${NC}"
    docker compose up -d

    echo -e "\n${YELLOW}[3/4] 서비스 안정화 대기 중...${NC}"
    sleep 5

    echo -e "\n${YELLOW}[4/4] 서비스 상태 확인 중...${NC}"
    docker compose ps

    echo -e "\n${GREEN}✓ 전체 서비스 업데이트 완료!${NC}"
    echo -e "${GREEN}✓ DB 데이터는 유지됩니다.${NC}"
    ;;

  clean)
    echo -e "\n${RED}⚠️  주의: 모든 데이터가 삭제됩니다!${NC}"
    read -p "정말로 계속하시겠습니까? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
      echo "취소되었습니다."
      exit 0
    fi

    echo -e "\n${YELLOW}[1/5] 모든 컨테이너 중지 및 삭제...${NC}"
    docker compose down -v

    echo -e "\n${YELLOW}[2/5] 이미지 삭제...${NC}"
    docker rmi a2a-registry-backend a2a-registry-frontend 2>/dev/null || true

    echo -e "\n${YELLOW}[3/5] 새로 빌드 중...${NC}"
    docker compose build

    echo -e "\n${YELLOW}[4/5] 서비스 시작 중...${NC}"
    docker compose up -d

    echo -e "\n${YELLOW}[5/5] 서비스 상태 확인 중...${NC}"
    sleep 5
    docker compose ps

    echo -e "\n${GREEN}✓ 클린 재시작 완료!${NC}"
    echo -e "${RED}✓ 모든 DB 데이터가 초기화되었습니다.${NC}"
    ;;

  logs)
    SERVICE="${2:-backend}"
    echo -e "${BLUE}$SERVICE 로그 확인 중...${NC}"
    docker compose logs -f "$SERVICE"
    ;;

  *)
    echo -e "${RED}사용법:${NC}"
    echo "  $0 backend         # Backend만 업데이트 (DB 데이터 유지)"
    echo "  $0 frontend        # Frontend만 업데이트"
    echo "  $0 all             # 전체 업데이트 (DB 데이터 유지)"
    echo "  $0 clean           # 전체 삭제 후 재시작 (DB 데이터 삭제!)"
    echo "  $0 logs [service]  # 로그 보기 (기본: backend)"
    echo ""
    echo -e "${YELLOW}예시:${NC}"
    echo "  $0 backend         # 코드 수정 후 backend만 빠르게 업데이트"
    echo "  $0 all             # Git pull 후 전체 업데이트"
    echo "  $0 logs backend    # Backend 로그 실시간 확인"
    exit 1
    ;;
esac

echo -e "\n${BLUE}==========================================${NC}"
echo -e "${GREEN}서비스 URL:${NC}"
echo -e "  Frontend: ${BLUE}http://localhost:7600${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:7601${NC}"
echo -e "  API Docs: ${BLUE}http://localhost:7601/docs${NC}"
echo -e "${BLUE}==========================================${NC}"
