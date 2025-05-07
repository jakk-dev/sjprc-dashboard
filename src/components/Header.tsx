import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ drawerWidth }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  if (!currentUser) return null;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: drawerWidth,
        right: 0,
        height: 40,
        backgroundColor: "rgba(94, 94, 94, 0.1)",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        zIndex: 1201, // Above MUI Drawer (default 1200)
      }}
    >
      <div>
        <strong>ID:</strong> {currentUser.id}{" "}
        <span style={{ marginLeft: 16 }} />
        <strong>Username:</strong> {currentUser.name}
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: "8px 16px",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
