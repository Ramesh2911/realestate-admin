import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch } from "react-icons/fi";
import ProfileDropdown from "./ProfileDropdown";
import NotificationPanel from "./NotificationPanel";
import logo from "../assets/logo.png";
import { getMenuByRole, flattenNavItems } from "./sidebarConfig";
import { getBreadcrumbs } from "../constants/routeTitles";
import "./Header.css";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const Header = ({ onToggleSidebar }) => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const user = useMemo(() => readUser(), []);
  const navItems = useMemo(
    () => flattenNavItems(getMenuByRole(user?.role_name || "")),
    [user?.role_name]
  );

  const crumbs = getBreadcrumbs(location.pathname);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return navItems
      .filter((i) => i.label.toLowerCase().includes(q))
      .slice(0, 7);
  }, [query, navItems]);

  // Reset search when the route changes (adjust state during render)
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setQuery("");
    setShowResults(false);
    setMobileSearch(false);
  }

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowResults(true);
      }
      if (e.key === "Escape") setShowResults(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
        setMobileSearch(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (path) => {
    navigate(path);
    setQuery("");
    setShowResults(false);
    setMobileSearch(false);
  };

  const openMobileSearch = () => {
    setMobileSearch(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeMobileSearch = () => {
    setMobileSearch(false);
    setQuery("");
    setShowResults(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (results[0]) go(results[0].path);
  };

  return (
    <header
      className={`premium-header ${mobileSearch ? "mobile-searching" : ""}`}
    >
      {/* LEFT: menu toggle + brand + breadcrumb */}
      <div className="header-left-zone">
        <button
          type="button"
          className="hamburger-action-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FiMenu size={20} />
        </button>

        <div className="brand-logo-frame">
          <img src={logo} alt="brand logo" className="header-logo-image" />
        </div>

        <span className="header-divider" />

        <nav className="header-breadcrumb" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c.path} className="crumb-wrap">
              {i > 0 && <span className="crumb-sep">/</span>}
              <span
                className={
                  i === crumbs.length - 1
                    ? "header-crumb current"
                    : "header-crumb"
                }
              >
                {c.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* CENTER: global search */}
      <div className="header-center-zone">
        <form className="header-search" ref={searchRef} onSubmit={onSubmit}>
          <FiSearch className="search-icon" size={16} />
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            aria-label="Search pages"
          />
          <kbd className="search-kbd">Ctrl K</kbd>
          <button
            type="button"
            className="mobile-search-cancel"
            onClick={closeMobileSearch}
          >
            Cancel
          </button>

          {showResults && query.trim() && (
            <div className="search-results">
              {results.length === 0 ? (
                <div className="search-empty">No matching pages</div>
              ) : (
                results.map((r) => (
                  <button
                    type="button"
                    key={r.path}
                    className="search-result-item"
                    onClick={() => go(r.path)}
                  >
                    <span className="result-label">{r.label}</span>
                    <span className="result-path">{r.path}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </form>
      </div>

      {/* RIGHT: search trigger (mobile) + notifications + profile */}
      <div className="header-right-zone">
        <button
          type="button"
          className="icon-btn mobile-search-btn"
          onClick={openMobileSearch}
          aria-label="Search"
        >
          <FiSearch size={18} />
        </button>
        <NotificationPanel />
        <span className="header-divider" />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
