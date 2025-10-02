# Firebase 배포 가이드

## 사전 준비

### 1. Firebase CLI 설치
```bash
npm install -g firebase-tools
```

### 2. Firebase 로그인
```bash
firebase login
```

## 배포 방법

### 자동 배포 (권장)
```bash
npm run deploy
```

이 명령어는 다음을 자동으로 실행합니다:
1. Next.js 프로젝트 빌드 (`npm run build`)
2. Firebase 호스팅에 배포 (`firebase deploy --only hosting`)

### 수동 배포
```bash
# 1. 프로젝트 빌드
npm run build

# 2. Firebase 호스팅에 배포
firebase deploy --only hosting
```

## 설정 파일

### `firebase.json`
- `public: "out"` - Next.js static export 폴더
- 모든 요청을 `index.html`로 리다이렉트 (SPA 라우팅)
- 정적 파일 캐싱 설정

### `next.config.ts`
- `output: 'export'` - 정적 HTML로 내보내기
- `images.unoptimized: true` - 이미지 최적화 비활성화 (static export 필수)

### `.firebaserc`
- 프로젝트 ID: `star-record-note`

## 주의사항

⚠️ **Static Export 제한사항:**
- API Routes 사용 불가
- Server-side Rendering (SSR) 불가
- Incremental Static Regeneration (ISR) 불가
- Dynamic Routes의 일부 기능 제한

현재 프로젝트는 클라이언트 사이드 렌더링만 사용하므로 문제없이 작동합니다.

## 환경 변수

`.env.local` 파일의 환경 변수는 빌드 시에 번들에 포함됩니다.
`NEXT_PUBLIC_` 접두사가 있는 변수만 클라이언트에서 사용 가능합니다.

## 배포 후 확인

배포가 완료되면 다음 URL에서 확인할 수 있습니다 (Firebase 콘솔에서 호스팅 URL 확인):
```
https://star-record-note.web.app
또는
https://star-record-note.firebaseapp.com
```

## 문제 해결

### Firebase CLI를 찾을 수 없는 경우
```bash
# 전역 설치 확인
npm list -g firebase-tools

# 재설치
npm install -g firebase-tools
```

### 빌드 오류 발생 시
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```
