import { useState, useRef, useEffect } from "react";
import { logoutApi } from "../services/auth.api";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FaUnlock } from "react-icons/fa";

const ProfileDropdown = () => {

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const logout = async () => {
    try {
      await logoutApi();

      localStorage.clear();
      sessionStorage.clear();

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);

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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="profile-wrapper" ref={wrapperRef}>
      <div
        className="profile-trigger"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span style={{ fontSize: "20px", lineHeight: "1" }}> <FaUserCircle size={30} /></span>
      </div>

      <div
        className={`profile-menu ${open ? "open" : ""}`}
        style={{
          display: open ? 'block' : 'none', // Structural toggle control
          position: 'absolute',
          right: '0',
          top: '100%',
          marginTop: '12px',
          backgroundColor: '#11131c',       // Matching premium dark surface background
          border: '1px solid #1e2230',       // Crisp, razor-thin premium border
          borderRadius: '14px',
          width: '200px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          zIndex: 999,
          padding: '6px'
        }}
      >
        {/* MY PROFILE INTERACTIVE ROW */}
        <div
          className="menu-item"
          onClick={() => {
            navigate("/my-profile");
            setOpen(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#161924';
            e.currentTarget.querySelector('span').style.color = '#fc2779'; // Luxury pink highlight on hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.querySelector('span').style.color = '#ffffff';
          }}
        >
          <FaUserCircle size={18} color="#fc2779" style={{ minWidth: '18px' }} />
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#ffffff', // FORCE readable text color
            transition: 'color 0.2s ease'
          }}>
            My Profile
          </span>
        </div>

        {/* LOGOUT INTERACTIVE ROW */}
        <div
          className="menu-item logout"
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginTop: '2px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)'; // Soft crimson aura background
            e.currentTarget.querySelector('span').style.color = '#f43f5e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.querySelector('span').style.color = '#717789';
          }}
        >
          <FaUnlock size={16} color="#f43f5e" style={{ minWidth: '16px' }} />
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#717789', // Sophisticated muted gray by default for logout
            transition: 'color 0.2s ease'
          }}>
            Logout
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
