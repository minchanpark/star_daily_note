"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/AuthForm.module.css";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "인증에 실패했습니다.";
      
      // Firebase 에러 메시지를 한글로 변환
      if (errorMessage.includes("email-already-in-use")) {
        setError("이미 사용 중인 이메일입니다.");
      } else if (errorMessage.includes("invalid-email")) {
        setError("올바른 이메일 형식이 아닙니다.");
      } else if (errorMessage.includes("weak-password")) {
        setError("비밀번호는 최소 6자 이상이어야 합니다.");
      } else if (errorMessage.includes("user-not-found") || errorMessage.includes("wrong-password")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (errorMessage.includes("invalid-credential")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>별 일기</h1>
        <p className={styles.authSubtitle}>
          {isSignUp ? "새로운 계정을 만들어주세요" : "로그인하여 별들을 만나보세요"}
        </p>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.formInput}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.formInput}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          className={styles.toggleButton}
        >
          {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
