import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  SUPER_ADMIN_MENU,
  ADMIN_A_MENU,
  ADMIN_B_MENU,
} from "./sidebarConfig";
import logo from "../assets/logo.png";
import "./Sidebar.css";
import { FaChevronDown } from "react-icons/fa";

const Sidebar = ({ isOpen = false, onClose = () => { } }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  // Get logged in user safely
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Extract the true role string from the API response structure
  const roleName = user?.role_name || "";

  // Dynamic Sidebar Based On Role
  let SIDEBAR_ITEMS = [];

  // Match against the explicit database string representations
  switch (roleName) {
    case "Super Admin":
      SIDEBAR_ITEMS = SUPER_ADMIN_MENU;
      break;

    case "Admin A":
      SIDEBAR_ITEMS = ADMIN_A_MENU;
      break;

    case "Admin B":
      SIDEBAR_ITEMS = ADMIN_B_MENU;
      break;

    default:
      SIDEBAR_ITEMS = [];
  }

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Mobile Header */}
        <div className="sidebar-mobile-header">
          <div
            className="mobile-brand"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img
              src={logo}
              alt="logo"
              style={{ height: 40 }}
            />
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="sidebar-menu">
          {SIDEBAR_ITEMS.map((item) => {
            // Dropdown Menu
            if (item.type === "dropdown") {
              return (
                <div key={item.key}>
                  <div
                    className="sidebar-item workzone-header"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.key
                          ? null
                          : item.key
                      )
                    }
                  >
                    <span
                      className="sidebar-icon"
                      style={{
                        color: item.iconColor,
                      }}
                    >
                      <item.icon size={17} />
                    </span>

                    <span className="sidebar-label">
                      {item.label}
                    </span>

                    <FaChevronDown
                      className={`chevron ${openDropdown === item.key
                        ? "open"
                        : ""
                        }`}
                    />
                  </div>

                  {openDropdown === item.key &&
                    item.children?.map((child) => (
                      <NavLink
                        key={child.key}
                        to={child.path}
                        className={({ isActive }) =>
                          `sidebar-item sub-item ${isActive ? "active" : ""
                          }`
                        }
                        onClick={onClose}
                      >
                        <span
                          className="sidebar-icon"
                          style={{
                            color: child.iconColor,
                          }}
                        >
                          <child.icon size={15} />
                        </span>

                        <span className="sidebar-label">
                          {child.label}
                        </span>
                      </NavLink>
                    ))}
                </div>
              );
            }

            // Normal Menu
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? "active" : ""
                  }`
                }
                onClick={onClose}
              >
                <span
                  className="sidebar-icon"
                  style={{
                    color: item.iconColor,
                  }}
                >
                  <item.icon size={17} />
                </span>

                <span className="sidebar-label">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;