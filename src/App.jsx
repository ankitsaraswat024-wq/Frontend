import { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // FastAPI backend

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  const signup = async () => {
    try {
      await axios.post(`${API_URL}/signup`, null, {
        params: { username, password },
      });
      alert("Signup successful! Now login.");
    } catch (err) {
      alert("Signup failed: " + err.response?.data?.detail);
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, null, {
        params: { username, password },
      });
      setToken(res.data.access_token);
      alert("Login successful!");
    } catch (err) {
      alert("Login failed: " + err.response?.data?.detail);
    }
  };

  const getMe = async () => {
    try {
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      alert("Unauthorized or invalid token!");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "400px", margin: "auto" }}>
      <h2>JWT Auth Example</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <button onClick={signup} style={{ marginRight: "10px" }}>Signup</button>
      <button onClick={login}>Login</button>

      {token && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={getMe}>Get My Details</button>
        </div>
      )}

      {user && (
        <div style={{ marginTop: "20px", background: "#f3f3f3", padding: "10px" }}>
          <h4>User Details</h4>
          <p>ID: {user.user_id}</p>
          <p>Username: {user.username}</p>
        </div>
      )}
    </div>
  );
}

export default App;
