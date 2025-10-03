# Firebase 배포 가이드# Firebase 배포 가이드



## 사전 준비## 사전 준비



### 1. Firebase CLI 설치### 1. Firebase CLI 설치

```bash```bash

npm install -g firebase-toolsnpm install -g firebase-tools

``````



### 2. Firebase 로그인### 2. Firebase 로그인

```bash```bash

firebase loginfirebase login

``````



## 배포 방법## 배포 방법



### 자동 배포 (권장)### 자동 배포 (권장)

```bash```bash

npm run deploynpm run deploy

``````



이 명령어는 다음을 자동으로 실행합니다:이 명령어는 다음을 자동으로 실행합니다:

1. Vite 프로젝트 빌드 (`npm run build`)1. Next.js 프로젝트 빌드 (`npm run build`)

2. Firebase 호스팅에 배포 (`firebase deploy --only hosting`)2. Firebase 호스팅에 배포 (`firebase deploy --only hosting`)



### 수동 배포### 수동 배포

```bash```bash

# 1. 프로젝트 빌드# 1. 프로젝트 빌드

npm run buildnpm run build



# 2. Firebase 호스팅에 배포# 2. Firebase 호스팅에 배포

firebase deploy --only hostingfirebase deploy --only hosting

``````



## 설정 파일## 설정 파일



### `firebase.json`### `firebase.json`

- `public: "dist"` - Vite 빌드 출력 폴더- `public: "out"` - Next.js static export 폴더

- 모든 요청을 `index.html`로 리다이렉트 (SPA 라우팅)- 모든 요청을 `index.html`로 리다이렉트 (SPA 라우팅)

- 정적 파일 캐싱 설정- 정적 파일 캐싱 설정



### `vite.config.ts`### `next.config.ts`

- React 플러그인 설정- `output: 'export'` - 정적 HTML로 내보내기

- 경로 alias 설정 (`@` → `./src`)- `images.unoptimized: true` - 이미지 최적화 비활성화 (static export 필수)

- 빌드 출력 디렉토리: `dist`

### `.firebaserc`

### `.firebaserc`- 프로젝트 ID: `star-record-note`

- 프로젝트 ID: `star-record-note`

## 주의사항

## 환경 변수

⚠️ **Static Export 제한사항:**

`.env.local` 파일의 환경 변수는 빌드 시에 번들에 포함됩니다.- API Routes 사용 불가

`VITE_` 접두사가 있는 변수만 클라이언트에서 사용 가능합니다.- Server-side Rendering (SSR) 불가

- Incremental Static Regeneration (ISR) 불가

⚠️ **보안 주의:** Firebase API Key는 공개되어도 괜찮지만, `.env.local` 파일은 절대 커밋하지 마세요.- Dynamic Routes의 일부 기능 제한



## 배포 후 확인현재 프로젝트는 클라이언트 사이드 렌더링만 사용하므로 문제없이 작동합니다.



배포가 완료되면 다음 URL에서 확인할 수 있습니다:## 환경 변수

```

https://star-record-note.web.app`.env.local` 파일의 환경 변수는 빌드 시에 번들에 포함됩니다.

또는`NEXT_PUBLIC_` 접두사가 있는 변수만 클라이언트에서 사용 가능합니다.

https://star-record-note.firebaseapp.com

```## 배포 후 확인



## 문제 해결배포가 완료되면 다음 URL에서 확인할 수 있습니다 (Firebase 콘솔에서 호스팅 URL 확인):

```

### Firebase CLI를 찾을 수 없는 경우https://star-record-note.web.app

```bash또는

# 전역 설치 확인https://star-record-note.firebaseapp.com

npm list -g firebase-tools```



# 재설치## 문제 해결

npm install -g firebase-tools

```### Firebase CLI를 찾을 수 없는 경우

```bash

### 빌드 오류 발생 시# 전역 설치 확인

```bashnpm list -g firebase-tools

# node_modules 삭제 후 재설치

rm -rf node_modules package-lock.json# 재설치

npm installnpm install -g firebase-tools

npm run build```

```

### 빌드 오류 발생 시

### 환경 변수가 로드되지 않는 경우```bash

```bash# node_modules 삭제 후 재설치

# .env.local 파일 확인rm -rf node_modules package-lock.json

cat .env.localnpm install

npm run build

# 환경 변수 접두사가 VITE_로 시작하는지 확인```

# 예: VITE_FIREBASE_API_KEY=...
```
