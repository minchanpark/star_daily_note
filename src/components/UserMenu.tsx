"use client";

import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/NightSky.module.css";

const UserMenu = () => {
  const { user, logOut } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <div className={styles.userMenu}>
      <span className={styles.userEmail}>{user.email}</span>
      <button onClick={handleLogout} className={styles.logoutButton}>
        로그아웃
      </button>
    </div>
  );
};

export default UserMenu;
