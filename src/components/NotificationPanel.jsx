import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheckCircle } from "react-icons/fi";
import {
  getNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllReadApi,
} from "../services/auth.api";
import "./NotificationPanel.css";

const extractList = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.notifications)) return d.notifications;
  if (Array.isArray(d?.rows)) return d.rows;
  return [];
};

const extractCount = (res) => {
  const d = res?.data;
  if (typeof d === "number") return d;
  if (typeof d?.count === "number") return d.count;
  if (typeof d?.unreadCount === "number") return d.unreadCount;
  if (typeof d?.unread === "number") return d.unread;
  if (typeof d?.data === "number") return d.data;
  if (typeof d?.data?.count === "number") return d.data.count;
  if (typeof d?.data?.unreadCount === "number") return d.data.unreadCount;
  return 0;
};

const timeAgo = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
};

const isUnread = (n) =>
  !(n?.is_read ?? n?.isRead ?? n?.read ?? false);

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const fetchCount = useCallback(async () => {
    try {
      const res = await getUnreadCountApi();
      setUnread(extractCount(res));
    } catch {
      /* silently ignore */
    }
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotificationsApi({ limit: 15 });
      setItems(extractList(res));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 60000);
    return () => clearInterval(id);
  }, [fetchCount]);

  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const openPanel = () => setOpen((v) => !v);

  const handleItemClick = async (item) => {
    const id = item?.id ?? item?._id;
    if (id && isUnread(item)) {
      try {
        await markNotificationReadApi(id);
        fetchCount();
      } catch {
        /* ignore */
      }
    }
    const path = item?.path || item?.link;
    if (path) {
      navigate(path);
      setOpen(false);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllReadApi();
      setUnread(0);
      setItems((prev) =>
        prev.map((n) => ({ ...n, is_read: true, isRead: true, read: true }))
      );
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="icon-btn notification-trigger"
        onClick={openPanel}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <FiBell size={18} />
        {unread > 0 && (
          <span className="notification-count">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
        <span className="notification-pulse" />
      </button>

      {open && (
        <div className="notification-panel" role="menu">
          <div className="notification-head">
            <div>
              <h4>Notifications</h4>
              <span>{unread > 0 ? `${unread} unread` : "You're all caught up"}</span>
            </div>
            {unread > 0 && (
              <button
                type="button"
                className="mark-all-btn"
                onClick={handleMarkAll}
              >
                <FiCheckCircle size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading && (
              <div className="notification-loading">
                <span className="spinner" />
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="notification-empty">
                <FiBell size={22} />
                <p>No notifications yet</p>
              </div>
            )}

            {!loading &&
              items.map((n, idx) => {
                const id = n?.id ?? n?._id ?? idx;
                const unreadItem = isUnread(n);
                return (
                  <button
                    type="button"
                    key={id}
                    className={`notification-item ${unreadItem ? "unread" : ""}`}
                    onClick={() => handleItemClick(n)}
                  >
                    <span className="notification-dot" />
                    <span className="notification-body">
                      <span className="notification-title">
                        {n?.title || n?.message || n?.description || "Notification"}
                      </span>
                      <span className="notification-time">
                        {timeAgo(n?.created_at || n?.createdAt || n?.date)}
                      </span>
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
