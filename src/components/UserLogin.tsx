import React, { useState, useEffect } from "react";
import usersData from "../data/users.json";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types/User";
import { useNavigate } from "react-router-dom";

const UserLogin: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    setUsers(usersData);
  }, []);

  const navigate = useNavigate();

  const handleLogin = () => {
    const match = users.find(
      (user) =>
        user.id === id.trim() &&
        user.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (match) {
      setLoggedInUser(match);
      setCurrentUser(match);
      setError("");
      navigate("/", { replace: true }); // ✅ Redirect after login
    } else {
      setError("ID and name do not match.");
      setLoggedInUser(null);
      setCurrentUser(null);
    }
  };

  if (loggedInUser) {
    return (
      <div>
        <h3>Welcome, {loggedInUser.name}!</h3>
        <button
          onClick={() => {
            setLoggedInUser(null);
            setCurrentUser(null);
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "#f4f4f4", // Optional
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "rgba(93, 93, 93, 0.1)",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          padding: "30px 24px", // ⬅️ Uniform horizontal padding
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Admin Login</h2>

        <input
          type="text"
          placeholder="Enter ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{
            marginBottom: 16,
            padding: "10px 12px",
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        />

        <input
          type="text"
          placeholder="Enter Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            marginBottom: 16,
            padding: "10px 12px",
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Login
        </button>

        {error && (
          <p
            style={{
              color: "red",
              marginTop: 16,
              textAlign: "center",
              fontSize: 14,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
