import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="admin-body">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main
          className="admin-content"
          onClick={() => {
            if (sidebarOpen) closeSidebar();
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
