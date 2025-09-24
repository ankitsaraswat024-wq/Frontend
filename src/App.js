import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "459111757593-hpnpd591itdubpqafgibljolavq304bq.apps.googleusercontent.com";

// const CLIENT_ID = #githubid
// function App() {

//   useEffect(() => {
//     const queryString = window.location.search; 
//     const urlParams = new URLSearchParams(queryString);
//     const codeParam = urlParams.get("code");
//     console.log(codeParam);
//   },[]);
// function loginwithGithub() {
//   window.location.assign("https://github.com/login/oauth/authorize?cliend_id="+CLIENT_ID);
// }

// return (
//   <div className="App">
//     <header className="App-header">
//       <button onClick={loginwithGithub}>
//         Login With Github
//       </button>
//     </header>
//   </div>
// );
// }

function Login() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Optionally verify token is still valid
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const token = credentialResponse.credential;
      if (!token) {
        throw new Error("No credential received from Google");
      }
      
      const decoded = jwtDecode(token);
      console.log("Google User:", decoded);
      console.log("Token issuance time (iat):", new Date(decoded.iat * 1000).toISOString());
      console.log("Token expiration time (exp):", new Date(decoded.exp * 1000).toISOString());

      // Send token to FastAPI backend for verification
      console.log("Sending token to backend:", token);
      const response = await fetch("http://127.0.0.1:8000/auth/google/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // For cookie handling
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error response:", errorData);
        throw new Error(`HTTP error! status: ${response.status}, detail: ${errorData.detail || "Unknown error"}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);

      if (data.access_token) {
        // Store token and handle successful login
        localStorage.setItem("access_token", data.access_token);
        setIsLoggedIn(true);
        setUserInfo({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture
        });
        console.log("Login successful!");
        // Example: window.location.href = "/dashboard";
      } else {
        console.error("No access token received from backend");
        alert("Login failed: No access token received.");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Update UI to show error to user
      alert(`Login failed: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (error) => {
    console.error("Google Login Failed:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // More detailed error handling
    let errorMessage = "Google Login failed. ";
    if (error.error === 'popup_closed_by_user') {
      errorMessage += "Login popup was closed. Please try again.";
    } else if (error.error === 'access_denied') {
      errorMessage += "Access was denied. Please allow permissions and try again.";
    } else if (error.error === 'invalid_client') {
      errorMessage += "Invalid client configuration. Please check your Google Client ID.";
    } else {
      errorMessage += "Please try again.";
    }
    
    alert(errorMessage);
  };

  const handleCameraStart = () => {
    // Placeholder for camera-based face recognition logic
    console.log("Starting camera for face recognition...");
    // Add your face recognition logic here
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setUserInfo(null);
    console.log("Logged out successfully");
  };

  // Placeholder function if needed elsewhere
  const handleGoogleLoginClick = () => {
    console.log("Google Login button clicked - this function is deprecated");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ textAlign: "center", padding: "50px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Face Recognition & Login System</h1>
        
        {!isLoggedIn ? (
          <div>
            <div style={{ margin: "20px 0" }}>
              <button
                onClick={handleCameraStart}
                style={{
                  padding: "12px 24px",
                  marginRight: "10px",
                  cursor: "pointer",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px"
                }}
              >
                Start Camera (Register)
              </button>
            </div>

            <div style={{ margin: "30px 0" }}>
              <h3>Login with Google</h3>
              {loading ? (
                <div style={{ margin: "20px 0" }}>
                  <p>Loading...</p>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", margin: "20px 0" }}>
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    logo_alignment="left"
                    width="300"
                    auto_select={false}
                    cancel_on_tap_outside={true}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "10px" }}>
              <h2>Welcome!</h2>
              {userInfo && (
                <div>
                  {userInfo.picture && (
                    <img 
                      src={userInfo.picture} 
                      alt="Profile" 
                      style={{ width: "60px", height: "60px", borderRadius: "50%", margin: "10px" }}
                    />
                  )}
                  <p><strong>Name:</strong> {userInfo.name}</p>
                  <p><strong>Email:</strong> {userInfo.email}</p>
                </div>
              )}
            </div>
            
            <div style={{ margin: "20px 0" }}>
              <button
                onClick={handleCameraStart}
                style={{
                  padding: "12px 24px",
                  marginRight: "10px",
                  cursor: "pointer",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px"
                }}
              >
                Start Camera (Face Recognition)
              </button>
              
              <button
                onClick={handleLogout}
                style={{
                  padding: "12px 24px",
                  cursor: "pointer",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "16px"
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;