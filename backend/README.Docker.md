# Fear & Greed Index Backend - Docker 가이드

## 빠른 시작

### 개발 환경으로 실행

```bash
# Docker Compose로 빌드 및 실행
docker-compose up --build

# 백그라운드로 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### 프로덕션 환경으로 실행

```bash
# 프로덕션 설정으로 실행
docker-compose -f docker-compose.prod.yml up --build -d

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f

# 중지
docker-compose -f docker-compose.prod.yml down
```

## API 접근

서비스가 시작되면 다음 URL로 접근 가능합니다:

- **Health Check**: http://localhost:8000/health
- **Fear & Greed API**: http://localhost:8000/api/v1/fear-greed
- **API Docs**: http://localhost:8000/docs

## Docker 명령어

### 컨테이너 관리

```bash
# 컨테이너 시작
docker-compose start

# 컨테이너 중지
docker-compose stop

# 컨테이너 재시작
docker-compose restart

# 컨테이너 삭제
docker-compose down

# 컨테이너와 볼륨 모두 삭제
docker-compose down -v
```

### 로그 및 디버깅

```bash
# 실시간 로그 확인
docker-compose logs -f backend

# 최근 100줄의 로그만 보기
docker-compose logs --tail=100 backend

# 컨테이너 내부 접근
docker-compose exec backend bash

# 컨테이너 내부에서 Python 인터랙티브 쉘
docker-compose exec backend python
```

### 이미지 관리

```bash
# 이미지 재빌드 (캐시 사용 안함)
docker-compose build --no-cache

# 사용하지 않는 이미지 정리
docker image prune -a
```

## 환경 변수

`docker-compose.yml` 또는 `.env` 파일에서 다음 환경 변수를 설정할 수 있습니다:

```env
LOG_LEVEL=INFO              # 로그 레벨 (DEBUG, INFO, WARNING, ERROR)
CACHE_TTL_MINUTES=30        # 캐시 유효 시간 (분)
MAX_RETRIES=3               # 스크래핑 재시도 횟수
```

## 볼륨 마운트

### 개발 모드 (docker-compose.yml)

소스 코드가 실시간으로 반영됩니다:
- `./api:/app/api`
- `./models:/app/models`
- `./scrapers:/app/scrapers`
- `./utils:/app/utils`
- `./main.py:/app/main.py`
- `./logs:/app/logs`

### 프로덕션 모드 (docker-compose.prod.yml)

로그만 호스트에 저장됩니다:
- `./logs:/app/logs`

## 헬스 체크

Docker Compose는 자동으로 헬스 체크를 실행합니다:
- **간격**: 30초마다
- **타임아웃**: 10초
- **재시도**: 3회
- **시작 대기**: 5초

헬스 체크 상태 확인:
```bash
docker-compose ps
```

## 프로덕션 배포

### 리소스 제한

프로덕션 설정(`docker-compose.prod.yml`)에는 다음과 같은 리소스 제한이 있습니다:

- **CPU 제한**: 최대 1.0 코어
- **메모리 제한**: 최대 512MB
- **CPU 예약**: 최소 0.5 코어
- **메모리 예약**: 최소 256MB

### 자동 재시작

프로덕션 모드에서는 컨테이너가 항상 자동으로 재시작됩니다:
- `restart: always`

## 트러블슈팅

### 포트 충돌

8000 포트가 이미 사용 중인 경우:

```yaml
# docker-compose.yml 수정
ports:
  - "8001:8000"  # 호스트 포트를 8001로 변경
```

### 권한 문제

로그 디렉토리 권한 문제 발생 시:

```bash
# 로그 디렉토리 권한 설정
chmod 777 logs/
```

### 빌드 오류

캐시 문제로 빌드 실패 시:

```bash
# 캐시 없이 재빌드
docker-compose build --no-cache
```

### 컨테이너가 시작되지 않는 경우

```bash
# 상세 로그 확인
docker-compose logs backend

# 컨테이너 상태 확인
docker-compose ps

# 헬스 체크 상태 확인
docker inspect fear-greed-backend | grep -A 10 Health
```

## 성능 모니터링

### 리소스 사용량 확인

```bash
# 실시간 리소스 사용량
docker stats fear-greed-backend

# 컨테이너 상세 정보
docker inspect fear-greed-backend
```

### 로그 분석

```bash
# 로그 파일 확인
tail -f logs/backend.log

# 에러 로그만 필터링
docker-compose logs backend | grep ERROR
```

## 개발 워크플로우

1. **로컬 개발**:
   ```bash
   docker-compose up
   ```

2. **코드 수정**: 마운트된 볼륨 덕분에 변경사항이 실시간 반영됨

3. **테스트**:
   ```bash
   docker-compose exec backend pytest
   ```

4. **프로덕션 테스트**:
   ```bash
   docker-compose -f docker-compose.prod.yml up
   ```

## 백업

### 로그 백업

```bash
# 로그 디렉토리 백업
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
```

## 정리

### 모든 컨테이너와 볼륨 삭제

```bash
docker-compose down -v
docker image rm fear-greed-backend
```

## 다음 단계

- Frontend Electron 앱을 Docker 백엔드 URL로 연결
- API Gateway 또는 리버스 프록시 추가 (nginx, traefik)
- 프로덕션 환경에 배포 (AWS, GCP, Azure)
