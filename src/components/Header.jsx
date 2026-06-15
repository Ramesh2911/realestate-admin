import React, { useState } from "react";
import ProfileDropdown from "./ProfileDropdown";
import logo from "../assets/logo.png";
import "./Header.css";
import { FiBell, FiMenu } from "react-icons/fi"; // Upgraded to premium thin line icons

const Header = ({ onToggleSidebar }) => {
  const [bellHover, setBellHover] = useState(false);

  return (
    <header className="premium-header">
      {/* LEFT PORTION: HAMBURGER & BRAND CAPTURE */}
      <div className="header-left-zone">
        <button
          className="hamburger-action-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FiMenu size={20} />
        </button>

        <div className="brand-logo-frame">
          <img src={logo} alt="brand logo" className="header-logo-image" />
        </div>
      </div>

      {/* RIGHT PORTION: UTILITY CONTROLS */}
      <div className="header-right-zone">
        {/* NOTIFICATION HUB TRIGGER */}
        <div
          className="notification-badge-trigger"
          onMouseEnter={() => setBellHover(true)}
          onMouseLeave={() => setBellHover(false)}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            border: `1px solid ${bellHover ? "#fc2779" : "#1e2230"}`,
            backgroundColor: bellHover ? "rgba(252, 39, 121, 0.05)" : "transparent",
            color: bellHover ? "#fc2779" : "#717789",
            transition: "all 0.25s ease",
            position: "relative",
          }}
        >
          <FiBell size={18} />
          {/* Subtle Live Notification Dot Indicator */}
          <span
            style={{
              position: "absolute",
              top: "11px",
              right: "12px",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#fc2779",
              boxShadow: "0 0 8px #fc2779",
            }}
          />
        </div>

        {/* PROFILE CONTROL INJECTION */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;