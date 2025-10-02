# Firebase 보안 규칙 설정 가이드

## 1. Firebase Console 접속
https://console.firebase.google.com/

프로젝트: star-daily-note 선택

---

## 2. Authentication 활성화

1. 좌측 메뉴에서 **Authentication** 선택
2. **시작하기** 버튼 클릭
3. **Sign-in method** 탭 선택
4. **이메일/비밀번호** 제공업체 선택
5. **사용 설정** 토글을 켜기
6. **저장** 클릭

---

## 3. 환경 변수 설정

1. `env.local.example` 파일을 복사해 프로젝트 루트에 `.env.local`을 만듭니다.
2. Firebase Console > 프로젝트 설정 > 일반 탭에서 **`star-record-note`** 웹 앱의 구성 값을 확인합니다.
3. 아래 항목을 실제 값으로 채웁니다.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=... # optional
```

> `.env.local`은 이미 `.gitignore`에 포함되어 있으므로, **실제 값이 저장소에 커밋되지 않도록 주의**하세요.

---

## 4. Firestore 보안 규칙 업데이트

좌측 메뉴에서 **Firestore Database** → **규칙** 탭

다음 규칙으로 변경:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;

      match /record_note/{noteId} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

> `users/{userId}` 문서 내부에 `record_note` 서브컬렉션을 두고, 각 사용자만 자신의 음성 일기에 접근할 수 있도록 제한합니다.

**게시** 버튼 클릭하여 적용

---

## 5. Storage 보안 규칙 업데이트

좌측 메뉴에서 **Storage** → **규칙** 탭

다음 규칙으로 변경:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // 인증된 사용자만 자신의 음성 파일에 접근 가능
    match /entries/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

> 애플리케이션은 업로드 후 **파일 경로만 Firestore에 저장**하고, 재생 시점에 `getDownloadURL`을 호출해 일회성 URL을 생성합니다. 따라서 다운로드 토큰이 DB에 장기간 남지 않아 노출 위험을 줄일 수 있습니다.

**게시** 버튼 클릭하여 적용

---

## 완료!

이제 다음 기능이 작동합니다:
- ✅ 이메일/비밀번호 회원가입
- ✅ 로그인
- ✅ 로그아웃
- ✅ 인증된 사용자만 별 생성/조회 가능
- ✅ 보안 규칙 적용
