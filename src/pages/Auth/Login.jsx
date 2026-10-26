import { useState } from "react";
import logo from "../../assets/logo.png";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginApi } from "../../services/auth.api";

export default function Login() {

  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);


  const validate = () => {
    let valid = true;
    if (!mobile.trim()) {
      setMobileError("Mobile number is required");
      valid = false;
    } else {
      setMobileError("");
    }
    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    } else {
      setPasswordError("");
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        mobile: mobile,
        password,
      };

      const response = await loginApi(payload);

      // API Response Data
      const { success, message, data } = response.data;

      if (success) {
        // Store JWT Token under the same key used by auth/api services
        localStorage.setItem("access_token", data.token);

        // Store User Information
        localStorage.setItem("user", JSON.stringify(data.user));

        // Store Role (Optional)
        localStorage.setItem("role", data.user.role_name);

        toast.success(message || "Login Successfully.");

        navigate("/dashboard");
      } else {
        toast.error(message || "Invalid Mobile Number or Password");
      }
    } catch (error) {
      console.error("Login Error:", error);

      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* ── LEFT BRAND PANEL ── */}
        <div className="login-left">
          <div className="login-left-logo">
            <img src={logo} alt="Brand Logo" />
          </div>
          <h1 className="login-left-title">Welcome Back</h1>
          <p className="login-left-sub">Your admin portal for seamless management</p>
          <div className="login-left-pills">
            <div className="login-pill">
              <span className="login-pill-dot" />
              <span>Secure Access</span>
            </div>
            <div className="login-pill">
              <span className="login-pill-dot" />
              <span>Real-time Dashboard</span>
            </div>
            <div className="login-pill">
              <span className="login-pill-dot" />
              <span>Full Analytics</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="login-right">
          <p className="login-right-eyebrow">Admin Portal</p>
          <h2>Sign In</h2>
          <p className="login-right-desc">Enter your credentials to access the dashboard.</p>

          {/* Mobile Field */}
          <div className="login-field">
            <label htmlFor="mobile">Mobile</label>
            <input
              id="mobile"
              type="tel"
              placeholder="XXXXXX3210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="tel"
              maxLength={10}
            />
            {mobileError && (
              <span className="error-text">⚠ {mobileError}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="password-box">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            {passwordError && (
              <span className="error-text">⚠ {passwordError}</span>
            )}
          </div>

          {/* Forgot Password */}
          <div className="forgot-password">
            <span onClick={() => alert("Forgot password flow")}>
              Forgot password?
            </span>
          </div>

          {/* Submit */}
          <button
            className="login-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}