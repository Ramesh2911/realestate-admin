import { useState } from "react";
import logo from "../../assets/logo.png";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileError, setMobileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);


  const USERS = [
    {
      mobile: "9999999991",
      password: "123456",
      role: "SUPER_ADMIN",
      name: "Super Admin",
    },
    {
      mobile: "9999999992",
      password: "123456",
      role: "BROKER",
      name: "Broker User",
    },
    {
      mobile: "9999999993",
      password: "123456",
      role: "AGENT",
      name: "Agent User",
    },
    {
      mobile: "9999999994",
      password: "123456",
      role: "OWNER",
      name: "Property Owner",
    },
  ];

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

    setTimeout(() => {
      const user = USERS.find(
        (item) =>
          item.mobile === mobile &&
          item.password === password
      );

      if (!user) {
        setLoading(false);
        alert("Invalid Mobile Number or Password");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: Date.now(),
          name: user.name,
          mobile: user.mobile,
          role: user.role,
        })
      );

      setLoading(false);

      navigate("/dashboard");
    }, 1000);
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