import { useState, useRef, useEffect, useMemo } from "react";
import { logoutApi } from "../services/auth.api";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaUnlock, FaChevronDown } from "react-icons/fa";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const user = useMemo(() => readUser(), []);
  const displayName =
    user?.name || user?.username || user?.full_name || user?.email || "User";
  const email = user?.email || "";
  const role = user?.role_name || "Member";
  const initials = getInitials(displayName);

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="profile-avatar">{initials}</span>
        <span className="profile-meta">
          <span className="profile-name">{displayName}</span>
          <span className="profile-role">{role}</span>
        </span>
        <FaChevronDown className="profile-chevron" />
      </button>

      <div className={`profile-menu ${open ? "open" : ""}`}>
        <div className="profile-menu-head">
          <span className="profile-avatar">{initials}</span>
          <div className="profile-menu-head-info">
            <div className="profile-menu-head-name">{displayName}</div>
            <div className="profile-menu-head-email">
              {email || role}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="profile-menu-item"
          onClick={() => {
            navigate("/my-profile");
            setOpen(false);
          }}
        >
          <FaUserCircle size={16} color="#4d8dff" />
          My Profile
        </button>

        <div className="profile-menu-divider" />

        <button
          type="button"
          className="profile-menu-item danger"
          onClick={logout}
        >
          <FaUnlock size={15} color="#f43f5e" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
