import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "./AdminLayout.css";

const MOBILE_QUERY = "(max-width: 768px)";
const COLLAPSE_KEY = "admin_sidebar_collapsed";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "1"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handleChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileOpen(false);
      else setCollapsed(false);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const toggleSidebar = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => {
        const next = !v;
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
        return next;
      });
    }
  };

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const expandSidebar = () => {
    setCollapsed(false);
    localStorage.setItem(COLLAPSE_KEY, "0");
  };

  return (
    <div className={`admin-layout ${collapsed && !isMobile ? "sb-collapsed" : ""}`}>
      <Header onToggleSidebar={toggleSidebar} />
      <div className="admin-body">
        <Sidebar
          collapsed={!isMobile && collapsed}
          isOpen={mobileOpen}
          onClose={closeMobile}
          onExpand={expandSidebar}
        />
        <main className="admin-content" onClick={closeMobile}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
