import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/config.js";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { api } from "../utils/api";
import { useState } from "react";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = async () => {
    setError(null);
    setIsLoading(true);
    console.log("Google Sign-In initiated");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      // Sign in with Google popup
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      console.log("Google Sign-In successful:", resultsFromGoogle);
      
      if (!resultsFromGoogle.user.email || !resultsFromGoogle.user.displayName) {
        throw new Error("Missing required user information from Google");
      }

      // Send user data to the backend using api instance
      const response = await api.post("/user/login", {
        username: resultsFromGoogle.user.displayName,
        email: resultsFromGoogle.user.email,
        profile_pic: resultsFromGoogle.user.photoURL,
      });

      console.log("Backend response:", response.data);

      // Dispatch success action and navigate to the dashboard page
      console.log("User data:", response.data.message);
      const {created_at,...rest} = response.data.message;
      dispatch(signInSuccess({...rest}));
      console.log("Redux state updated:", {...rest});

      console.log("user:", user);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error during Google Sign-In:", error);
      // Display a user-friendly error message
      if (error.response && error.response.status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please enable popups for this site.");
      } else {
        setError(`Authentication failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isLoading}
        style={{ 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.75rem 1rem',
          border: '1px solid var(--border-color)',
          borderRadius: '0.375rem',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          fontSize: '0.9375rem',
          fontWeight: '500',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--bg-primary)',
          transition: 'all 0.2s',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1
        }}
        onMouseOver={e => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
            e.currentTarget.style.borderColor = 'var(--hover-border)';
          }
        }}
        onMouseOut={e => {
          e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        {isLoading ? (
          <span className="loading-indicator">Loading...</span>
        ) : (
          <>
            <svg 
              style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.75rem' }} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 48 48"
            >
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>
      {error && (
        <div style={{ 
          color: 'var(--error)', 
          marginTop: '0.75rem', 
          fontSize: '0.875rem',
          textAlign: 'center',
          padding: '0.5rem',
          backgroundColor: 'rgba(var(--error-rgb), 0.1)',
          borderRadius: '0.25rem',
          border: '1px solid rgba(var(--error-rgb), 0.2)'
        }}>
          {error}
        </div>
      )}
    </>
  );
}
                                                                                                        