"use client";

import { useAuth } from "@/contexts/AuthContext";
import NightSky from "@/components/NightSky";
import AuthForm from "@/components/AuthForm";

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
          color: "#fff",
        }}
      >
        로딩 중...
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <NightSky />;
};

export default Home;
