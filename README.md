# 별빛 일기 (Star Daily Note)

음성으로 기록하는 일기 앱입니다.

## Tech Stack

- **Frontend**: React 19 + Vite 6
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Authentication, Firestore, Storage, Analytics)
- **Deployment**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project ([Setup guide](./FIREBASE_SETUP.md))

### Installation

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp env.local.example .env.local
# .env.local 파일을 열어서 Firebase 설정값 입력
```

### Development

```bash
# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview

# Firebase에 배포
npm run deploy
```

## Project Structure

```
src/
  ├── components/     # React 컴포넌트
  │   ├── AuthForm.tsx
  │   ├── NightSky.tsx
  │   ├── RecordButton.tsx
  │   ├── Star.tsx
  │   └── UserMenu.tsx
  ├── contexts/       # React Context
  │   └── AuthContext.tsx
  ├── lib/           # 유틸리티
  │   └── firebase.ts
  ├── styles/        # CSS 모듈
  ├── App.tsx        # 메인 앱
  ├── main.tsx       # 진입점
  └── globals.css    # 전역 스타일
```

## Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deployment

Firebase Hosting을 사용합니다. 자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

