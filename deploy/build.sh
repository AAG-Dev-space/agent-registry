#!/bin/bash
# Docker 이미지 빌드 스크립트

set -e

echo "========================================="
echo "A2A Agent Registry - Docker 이미지 빌드"
echo "========================================="

# 스크립트 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo ""
echo "[1/2] Backend 이미지 빌드 중..."
docker build -f deploy/Dockerfile.backend -t a2a-registry-backend:latest .

echo ""
echo "[2/2] Frontend 이미지 빌드 중..."
docker build -f deploy/Dockerfile.frontend -t a2a-registry-frontend:latest .

echo ""
echo "========================================="
echo "빌드 완료!"
echo "========================================="
echo ""
echo "생성된 이미지:"
docker images | grep -E '(REPOSITORY|a2a-registry)'
echo ""
echo "다음 명령어로 서비스를 시작하세요:"
echo "  cd deploy"
echo "  docker compose up -d"
echo ""
