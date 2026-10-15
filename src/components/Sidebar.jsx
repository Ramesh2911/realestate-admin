import { NavLink, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { getMenuByRole, groupMenu } from "./sidebarConfig";
import {
  getOwnerApi,
  getBrokerApi,
  getDeveloperApi,
  getBuyerApi,
  getPropertyApi,
  getLeadsApi,
} from "../services/auth.api";
import logo from "../assets/logo.png";
import "./Sidebar.css";
import { FaChevronDown } from "react-icons/fa";

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

/* Live badge sources — only fetched for keys present in the current role's menu */
const COUNT_SOURCES = [
  { key: "owners", match: ["owners"], load: getOwnerApi },
  { key: "brokers", match: ["brokers"], load: getBrokerApi },
  { key: "developers", match: ["developers"], load: getDeveloperApi },
  { key: "buyers", match: ["buyers"], load: getBuyerApi },
  { key: "properties", match: ["properties", "property"], load: getPropertyApi },
  { key: "leads", match: ["leads"], load: getLeadsApi },
];

const fmtCount = (n) => {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10}K`;
  }
  return String(n);
};

const Sidebar = ({
  collapsed = false,
  isOpen = false,
  onClose = () => {},
  onExpand = () => {},
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [counts, setCounts] = useState({});
  const location = useLocation();

  const user = useMemo(() => readUser(), []);
  const roleName = user?.role_name || "";

  const items = useMemo(() => getMenuByRole(roleName), [roleName]);
  const groups = useMemo(() => groupMenu(items), [items]);

  // Auto-expand the dropdown that contains the active route
  // (state adjusted during render instead of an effect; prevPath starts
  // null so the initial route also triggers the sync)
  const [prevPath, setPrevPath] = useState(null);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    const parent = items.find(
      (i) =>
        i.type === "dropdown" &&
        i.children?.some((c) => c.path === location.pathname)
    );
    if (parent) setOpenDropdown(parent.key);
  }

  // Live count badges — one settled-all batch per menu load
  useEffect(() => {
    const sources = COUNT_SOURCES.filter((s) =>
      items.some(
        (i) =>
          s.match.includes(i.key) ||
          i.children?.some((c) => s.match.includes(c.key))
      )
    );
    if (!sources.length) return undefined;
    let alive = true;
    Promise.allSettled(sources.map((s) => s.load())).then((results) => {
      if (!alive) return;
      const next = {};
      results.forEach((r, idx) => {
        if (r.status !== "fulfilled") return;
        const body = r.value?.data;
        const list = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : null;
        if (Array.isArray(list)) next[sources[idx].key] = list.length;
      });
      setCounts(next);
    });
    return () => {
      alive = false;
    };
  }, [items]);

  const countForKey = (key) => {
    const src = COUNT_SOURCES.find((s) => s.match.includes(key));
    return src ? counts[src.key] : undefined;
  };

  const countForItem = (item) => {
    if (item.type !== "dropdown") return countForKey(item.key);
    const vals = (item.children || []).map((c) => countForKey(c.key));
    if (!vals.length || vals.some((v) => v === undefined)) return undefined;
    return vals.reduce((a, b) => a + b, 0);
  };

  const handleGroupClick = (item) => {
    if (collapsed) {
      onExpand();
      return;
    }
    setOpenDropdown((prev) => (prev === item.key ? null : item.key));
  };

  const displayName =
    user?.name || user?.username || user?.full_name || user?.email || "User";
  const initials = getInitials(displayName);

  const renderDropdown = (item, group) => {
    const ws = group?.id === "workspace";
    const chipStyle =
      ws && item.iconColor ? { "--chip": item.iconColor } : undefined;
    const hasActive = item.children?.some(
      (c) => c.path === location.pathname
    );
    const expanded = openDropdown === item.key && !collapsed;
    const badge = ws ? countForItem(item) : undefined;

    return (
      <div key={item.key} className="sidebar-group-item">
        <div
          className={`sidebar-item workzone-header ${
            expanded ? "is-open" : ""
          } ${hasActive ? "active" : ""}`}
          style={chipStyle}
          onClick={() => handleGroupClick(item)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleGroupClick(item);
            }
          }}
          role="button"
          tabIndex={0}
          title={collapsed ? item.label : undefined}
        >
          <span className={`sidebar-icon ${ws ? "sidebar-chip" : ""}`}>
            <item.icon size={17} />
          </span>
          <span className="sidebar-label">{item.label}</span>
          {badge !== undefined && (
            <span className="side-badge">{fmtCount(badge)}</span>
          )}
          <FaChevronDown
            className={`chevron ${expanded ? "open" : ""}`}
          />
        </div>

        <div className={`submenu ${expanded ? "open" : ""}`} style={chipStyle}>
          <div className="submenu-inner">
            {item.children?.map((child, idx) => {
              const childCount = ws ? countForKey(child.key) : undefined;
              return (
                <NavLink
                  key={child.key}
                  to={child.path}
                  style={{ "--i": idx }}
                  className={({ isActive }) =>
                    `sidebar-item sub-item ${isActive ? "active" : ""}`
                  }
                  onClick={onClose}
                  title={collapsed ? child.label : undefined}
                >
                  <span
                    className={`sidebar-icon ${
                      ws ? "sidebar-chip sidebar-chip-sm" : ""
                    }`}
                  >
                    <child.icon size={13} />
                  </span>
                  <span className="sidebar-label">{child.label}</span>
                  {childCount !== undefined && (
                    <span className="side-badge">{fmtCount(childCount)}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderItem = (item, group) => {
    if (item.type === "dropdown") return renderDropdown(item, group);

    const ws = group?.id === "workspace";
    const badge = ws ? countForKey(item.key) : undefined;
    const chipStyle =
      ws && item.iconColor ? { "--chip": item.iconColor } : undefined;

    return (
      <NavLink
        key={item.key}
        to={item.path}
        style={chipStyle}
        className={({ isActive }) =>
          `sidebar-item ${isActive ? "active" : ""}`
        }
        onClick={onClose}
        title={collapsed ? item.label : undefined}
      >
        <span className={`sidebar-icon ${ws ? "sidebar-chip" : ""}`}>
          <item.icon size={17} />
        </span>
        <span className="sidebar-label">{item.label}</span>
        {badge !== undefined && (
          <span className="side-badge">{fmtCount(badge)}</span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${
          collapsed ? "collapsed" : ""
        }`}
      >
        {/* Mobile drawer header */}
        <div className="sidebar-mobile-header">
          <div className="mobile-brand">
            <img src={logo} alt="logo" />
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Menu scroll area */}
        <div className="sidebar-menu">
          {groups.map((group) => (
            <div
              className={`sidebar-group ${
                group.id === "workspace" ? "is-workspace" : ""
              }`}
              key={group.label}
            >
              <div className="sidebar-section-label">{group.label}</div>
              {group.items.map((item) => renderItem(item, group))}
            </div>
          ))}
        </div>

        {/* User card */}
        <div
          className="sidebar-footer"
          title={collapsed ? `${displayName} · ${roleName || "Member"}` : undefined}
        >
          <span className="sidebar-footer-avatar">{initials}</span>
          <div className="sidebar-footer-info">
            <div className="sidebar-footer-name">{displayName}</div>
            <div className="sidebar-footer-role">{roleName || "Member"}</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
