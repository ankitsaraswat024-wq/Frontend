import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, verifyFace } from "../api";
import { toast } from "react-toastify";
import UsernameForm from "../components/UsernameForm";
import Camera from "../components/Camera";
import { useAuth } from "../auth/useAuth";

function HomePage() {
  const webcamRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();
  const { login, setUser } = useAuth();

  const handleStartCamera = (loginMode = false) => {
    if (!username.trim()) return toast.error("Enter username first.");
    if (!password.trim()) return toast.error("Enter password.");
    if (loginMode && !isVerified) {
      return toast.error("Please verify username and password first.");
    }
    setIsCameraOn(true);
    setIsLoginMode(loginMode);
  };

  const handleCapture = async () => {
    if (!webcamRef.current) return toast.error("Camera not ready.");
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const blob = await (await fetch(imageSrc)).blob();

      if (isLoginMode) {
        const result = await login(username, password, blob);
        if (result.success) {
          setIsCameraOn(false);
          toast.success(`✅ Welcome, ${username}!`);
          navigate("/dashboard");
        } else {
          toast.error(result.error || "❌ Invalid credentials or face mismatch");
        }
      } else {
        // Register: username/password/face are submitted
        const result = await registerUser(username, password, blob);
        if (result?.success) {
          toast.success("✅ Registered successfully (face verified & name checked)!");
          setUser({ username });
          setIsCameraOn(false);
        } else {
          toast.error(result?.error || "❌ Registration failed (possible duplicate face or username)");
          setIsCameraOn(false);
        }
      }
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail || "❌ Submission failed.";
      toast.error(detail.includes("Spoof") ? `⚠️ ${detail}` : detail);
    }
  };

  const handleVerifyCredentials = async () => {
    if (!username.trim()) return toast.error("Enter username first.");
    if (!password.trim()) return toast.error("Enter password.");

    try {
      const result = await loginUser(username, password); // Only credentials
      if (result.success) {
        toast.success("✅ Username and password verified!");
        setIsVerified(true);
      } else {
        toast.error(result?.error || "❌ Invalid credentials");
        setIsVerified(false);
      }
    } catch (err) {
      toast.error("❌ Invalid credentials");
      setIsVerified(false);
    }
  };

  return (
    <div className="container">
      <h2 className="heading">📸 Face Recognition</h2>
      <UsernameForm
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
      />
      {/* Verify Button */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button className="button" onClick={handleVerifyCredentials}>
          🔍 Verify Username & Password
        </button>
      </div>
      <div className="frameCard">
        {isCameraOn ? (
          <Camera
            webcamRef={webcamRef}
            handleCapture={handleCapture}
            isLoginMode={isLoginMode}
          />
        ) : (
          <div className="previewBox">
            <p className="instruction">
              {isLoginMode
                ? "Login: Capture your face for verification."
                : "Enter username & password, then start camera to register."}
            </p>
            <button className="button" onClick={() => handleStartCamera(false)}>
              📝 Start Camera (Register)
            </button>
            {/* Disable login with face button until verified */}
            <button
              className="button"
              onClick={() => handleStartCamera(true)}
              disabled={!isVerified}
              style={{ opacity: isVerified ? 1 : 0.5, cursor: isVerified ? "pointer" : "not-allowed" }}
              title={isVerified ? "" : "Please verify username and password first"}
            >
              🔑 (Login with Face)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
