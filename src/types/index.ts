/**
 * 음성 일기 엔트리 타입
 */
export type StarEntry = {
  /** Firestore 문서 ID */
  id: string;
  /** Firebase Storage 경로 */
  storagePath: string;
  /** 생성 시간 */
  createdAt: Date | null;
  /** 화면상 X 위치 (%) */
  x: number;
  /** 화면상 Y 위치 (%) */
  y: number;
};

/**
 * Firebase 사용자 정보
 */
export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};
