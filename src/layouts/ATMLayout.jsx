import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function ATMLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ATM-style auto logout (optional but realistic)
  useEffect(() => {
    let timer = setTimeout(() => {
      logout();
      navigate("/atm-login");
    }, 60_000); // 1 minute inactivity

    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        navigate("/atm-login");
      }, 60_000);
    };

    window.addEventListener("click", reset);
    window.addEventListener("keydown", reset);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* ATM SCREEN CONTENT */}
      <Outlet />
    </div>
  );
}
