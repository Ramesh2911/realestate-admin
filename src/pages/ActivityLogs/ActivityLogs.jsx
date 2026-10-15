import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiX,
  FiRefreshCw,
  FiDownload,
  FiActivity,
  FiDatabase,
  FiList,
  FiUsers,
  FiShield,
  FiHome,
  FiUser,
  FiTarget,
  FiGlobe,
  FiTag,
  FiClock,
  FiMonitor,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiAlertTriangle,
  FiLock,
  FiInbox,
  FiArrowRight,
} from "react-icons/fi";
import { getLogsApi } from "../../services/auth.api";
import "./ActivityLogs.css";

/* ─────────────────────────────────────────────
    HELPERS
───────────────────────────────────────────── */
const EMPTY_DATA = { logs: [], total: 0, page: 1, limit: 25, roles: [], types: [] };

const fmtExact = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const timeAgo = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SY";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const slugRole = (role = "") =>
  String(role)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const actionLabel = (action = "") =>
  String(action || "activity")
    .replace(/_/g, " ")
    .toUpperCase();

const actionTone = (action = "") => {
  const a = String(action).toUpperCase();
  if (a === "LOGIN" || a === "LOGOUT" || a.includes("AUTH")) return "auth";
  if (a.includes("APPROV")) return "approve";
  if (a.includes("REJECT") || a.includes("DELET")) return "reject";
  if (a.includes("INTEREST")) return "interest";
  if (a.includes("CREAT") || a.includes("SUBMIT")) return "create";
  if (a.includes("UPDAT") || a.includes("EDIT") || a.includes("CHANGE"))
    return "lead";
  return "mute";
};

const typeLabel = (type) =>
  String(type || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const typeIcon = (type) => {
  const t = String(type || "").toLowerCase();
  if (t.includes("property")) return FiHome;
  if (t.includes("user") || t === "user") return FiUser;
  if (t.includes("buyer") || t.includes("lead") || t.includes("requirement"))
    return FiTarget;
  if (t.includes("seo")) return FiGlobe;
  return FiTag;
};

const avatarTone = (role = "") => {
  const r = slugRole(role);
  if (r === "super-admin") return "";
  if (r === "admin-a") return "alt";
  if (r === "system") return "mute";
  return "";
};

const csvEscape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (filename, rows) => {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/* ─────────────────────────────────────────────
    SMALL COMPONENTS
───────────────────────────────────────────── */
const Avatar = ({ name, role }) => (
  <span className={`al-avatar ${avatarTone(role)}`}>
    {getInitials(name)}
  </span>
);

const RoleChip = ({ role }) => (
  <span className={`al-role-chip role-${slugRole(role)}`}>
    <FiShield size={10} />
    {role || "Unknown"}
  </span>
);

const ActionChip = ({ action }) => (
  <span className={`al-action tone-${actionTone(action)}`}>
    <i />
    {actionLabel(action)}
  </span>
);

const TargetBadge = ({ type, id, Icon }) => {
  if (!type && !id) return <span className="al-none">—</span>;
  return (
    <span className="al-target" title={typeLabel(type)}>
      {Icon && <Icon size={12} />}
      {typeLabel(type)}
      {id ? ` #${id}` : ""}
    </span>
  );
};

const StatChip = ({ icon: Icon, label, value, accent, bg }) => (
  <div
    className="al-stat"
    style={{ "--stat-accent": accent, "--stat-bg": bg }}
  >
    <span className="al-stat-icon">
      <Icon />
    </span>
    <div>
      <div className="al-stat-label">{label}</div>
      <div className="al-stat-value">{value}</div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
    PAGE
───────────────────────────────────────────── */
const ActivityLogs = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [restricted, setRestricted] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [view, setView] = useState("table");

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const params = useMemo(
    () => ({ page, limit, search: query, role, type, from, to }),
    [page, limit, query, role, type, from, to]
  );

  const fetchLogs = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      setRestricted(false);
      try {
        const res = await getLogsApi(params);
        const d = res.data?.data ?? res.data ?? EMPTY_DATA;
        setData({ ...EMPTY_DATA, ...d });
        const total = Number(d.total) || 0;
        const effLimit = Number(d.limit) || limit;
        const tp = Math.max(1, Math.ceil(total / effLimit));
        if (Number(d.page) > tp) setPage(tp);
      } catch (err) {
        console.error("Activity logs fetch error:", err);
        if (err?.response?.status === 403) {
          setRestricted(true);
          setData(null);
        } else if (!silent) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load activity logs."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [params, limit]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Debounced search → committed query (state set inside timer callback)
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const logs = useMemo(() => data?.logs ?? [], [data]);
  const total = Number(data?.total) || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasFilters = Boolean(query || role || type || from || to);

  const rangeFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeTo = Math.min(page * limit, total);

  const pageItems = useMemo(() => {
    const items = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
      return items;
    }
    items.push(1);
    if (page > 3) items.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      items.push(i);
    if (page < totalPages - 2) items.push("…");
    items.push(totalPages);
    return items;
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const users = new Set(logs.map((l) => l.user_id)).size;
    const rolesSeen = new Set(
      logs.map((l) => l.role_name).filter(Boolean)
    ).size;
    const loaded = Boolean(data);
    return [
      {
        key: "total",
        icon: FiDatabase,
        label: "Total Activities",
        value: loaded ? total.toLocaleString("en-IN") : "—",
        accent: "#0A4DB8",
        bg: "rgba(10, 77, 184, 0.09)",
      },
      {
        key: "showing",
        icon: FiList,
        label: "Showing",
        value: total ? `${rangeFrom}–${rangeTo}` : "0",
        accent: "#7AC943",
        bg: "rgba(122, 201, 67, 0.12)",
      },
      {
        key: "users",
        icon: FiUsers,
        label: "Users In View",
        value: users,
        accent: "#7c3aed",
        bg: "rgba(124, 58, 237, 0.1)",
      },
      {
        key: "roles",
        icon: FiShield,
        label: "Roles In View",
        value: rolesSeen,
        accent: "#d97706",
        bg: "rgba(245, 158, 11, 0.11)",
      },
    ];
  }, [logs, total, rangeFrom, rangeTo, data]);

  const setFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setQuery("");
    setRole("");
    setType("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const all = [];
      const CAP = 2000;
      let p = 1;
      let tp = 1;
      do {
        const res = await getLogsApi({
          page: p,
          limit: 100,
          search: query,
          role,
          type,
          from,
          to,
        });
        const d = res.data?.data ?? {};
        const rows = Array.isArray(d.logs) ? d.logs : [];
        all.push(...rows);
        tp = Math.max(1, Math.ceil((Number(d.total) || 0) / 100));
        p += 1;
      } while (p <= tp && all.length < CAP);

      if (!all.length) {
        toast.info("Nothing to export for the current filters.");
        return;
      }
      downloadCsv(
        `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`,
        [
          ["Time", "User", "Email", "Role", "Action", "Target", "Details", "IP"],
          ...all.map((l) => [
            l.created_at || "",
            l.full_name || "",
            l.email || "",
            l.role_name || "",
            l.action || "",
            l.target_type
              ? `${l.target_type}${l.target_id ? ` #${l.target_id}` : ""}`
              : "",
            l.details || "",
            l.ip_address || "",
          ]),
        ]
      );
      toast.success(`Exported ${all.length} activities.`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const typeOptions = useMemo(() => {
    const seen = data?.types ?? [];
    const merged = type && !seen.includes(type) ? [...seen, type] : seen;
    return merged;
  }, [data, type]);

  const roleOptions = useMemo(() => {
    const seen = data?.roles ?? [];
    const merged = role && !seen.includes(role) ? [...seen, role] : seen;
    return merged;
  }, [data, role]);

  const showSkeleton = loading && !data;
  const busy = loading && Boolean(data);

  /* ── Forbidden ── */
  if (restricted) {
    return (
      <div className="al-page">
        <div className="al-panel">
          <div className="al-state forbidden">
            <span className="al-state-icon">
              <FiLock />
            </span>
            <h3>Access restricted</h3>
            <p>
              Activity Logs are available to Super Admin accounts only. If you
              believe this is a mistake, contact your administrator.
            </p>
            <Link className="al-btn al-btn-primary" to="/dashboard">
              Back to Dashboard <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="al-page">
      {/* ── HERO ── */}
      <div className="al-hero">
        <div>
          <span className="al-hero-eyebrow">
            <i /> Audit Trail
          </span>
          <h1 className="al-title">Activity Logs</h1>
          <p className="al-sub">
            {data
              ? `Every user and system action across the platform — ${total.toLocaleString("en-IN")} ${total === 1 ? "entry" : "entries"} recorded, newest first.`
              : "Audit trail of all user and system actions across the platform."}
          </p>
        </div>
        <div className="al-hero-actions">
          <button
            type="button"
            className="al-btn al-btn-ghost"
            onClick={() => fetchLogs(true)}
            disabled={refreshing || showSkeleton}
          >
            <FiRefreshCw size={15} className={refreshing ? "al-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            className="al-btn al-btn-primary"
            onClick={handleExport}
            disabled={exporting || restricted}
          >
            <FiDownload size={15} />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="al-stats">
        {stats.map((s) => (
          <StatChip
            key={s.key}
            icon={s.icon}
            label={s.label}
            value={showSkeleton ? "—" : s.value}
            accent={s.accent}
            bg={s.bg}
          />
        ))}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="al-toolbar">
        <div className="al-toolbar-row">
          <div className="al-search">
            <FiSearch size={16} />
            <input
              type="text"
              value={search}
              placeholder="Search name, email, action or details…"
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search activity logs"
            />
            {search && (
              <button
                type="button"
                className="al-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          <select
            className="al-select"
            value={role}
            onChange={(e) => setFilter(setRole)(e.target.value)}
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <div className="al-date-group">
            <span>From</span>
            <input
              type="date"
              className="al-date"
              value={from}
              onChange={(e) => setFilter(setFrom)(e.target.value)}
              aria-label="From date"
            />
            <span>To</span>
            <input
              type="date"
              className="al-date"
              value={to}
              onChange={(e) => setFilter(setTo)(e.target.value)}
              aria-label="To date"
            />
          </div>

          {hasFilters && (
            <>
              <button
                type="button"
                className="al-clear-btn"
                onClick={handleClearFilters}
              >
                <FiX size={13} /> Clear filters
              </button>
              <span className="al-active-count">Filters active</span>
            </>
          )}
        </div>

        <div className="al-pills">
          <span className="al-pills-label">Activity type</span>
          <button
            type="button"
            className={`al-pill ${type === "" ? "active" : ""}`}
            onClick={() => setType("")}
          >
            All
          </button>
          {typeOptions.map((t) => (
            <button
              type="button"
              key={t}
              className={`al-pill ${type === t ? "active" : ""}`}
              onClick={() => setType(type === t ? "" : t)}
            >
              {typeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* ── PANEL ── */}
      <div
        className={`al-panel${busy ? " busy" : ""}`}
        aria-busy={busy || undefined}
      >
        <div className="al-panel-head">
          <div>
            <h3 className="al-panel-title">Platform Activity</h3>
            <div className="al-panel-sub">
              {showSkeleton
                ? "Loading activity…"
                : total
                  ? `${logs.length} on this page · filters apply instantly`
                  : "No results to display"}
            </div>
          </div>
          <div className="al-toggle" role="tablist" aria-label="View mode">
            <button
              type="button"
              className={view === "table" ? "active" : ""}
              onClick={() => setView("table")}
              role="tab"
              aria-selected={view === "table"}
            >
              <FiGrid size={14} /> <span>Table</span>
            </button>
            <button
              type="button"
              className={view === "timeline" ? "active" : ""}
              onClick={() => setView("timeline")}
              role="tab"
              aria-selected={view === "timeline"}
            >
              <FiClock size={14} /> <span>Timeline</span>
            </button>
          </div>
        </div>

        {/* Skeleton */}
        {showSkeleton && (
          <div>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div className="al-skel-row" key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!showSkeleton && error && (
          <div className="al-state error">
            <span className="al-state-icon">
              <FiAlertTriangle />
            </span>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button
              type="button"
              className="al-btn al-btn-primary"
              onClick={() => fetchLogs()}
            >
              <FiRefreshCw size={15} /> Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!showSkeleton && !error && !logs.length && (
          <div className="al-state empty">
            <span className="al-state-icon">
              <FiInbox />
            </span>
            <h3>
              {hasFilters ? "No matching activity" : "No activity yet"}
            </h3>
            <p>
              {hasFilters
                ? "No entries match your current search and filters. Try adjusting them."
                : "Actions performed by your team will appear here as soon as they happen."}
            </p>
            {hasFilters && (
              <button
                type="button"
                className="al-btn al-btn-ghost"
                onClick={handleClearFilters}
              >
                <FiX size={14} /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Table view */}
        {!showSkeleton && !error && logs.length > 0 && view === "table" && (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                  <th className="col-ip">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td data-label="Time">
                      <span>
                        <span className="al-time-main">
                          {fmtExact(l.created_at)}
                        </span>
                        <span className="al-time-rel">
                          {timeAgo(l.created_at)}
                        </span>
                      </span>
                    </td>
                    <td data-label="User">
                      <span className="al-user">
                        <Avatar name={l.full_name} role={l.role_name} />
                        <span className="al-user-text">
                          <span className="al-user-name">
                            {l.full_name || "System"}
                          </span>
                          <span className="al-user-email">
                            {l.email || "—"}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td data-label="Role">
                      <RoleChip role={l.role_name} />
                    </td>
                    <td data-label="Action">
                      <ActionChip action={l.action} />
                    </td>
                    <td data-label="Target">
                      <TargetBadge
                        type={l.target_type}
                        id={l.target_id}
                        Icon={typeIcon(l.target_type)}
                      />
                    </td>
                    <td data-label="Details">
                      <span
                        className="al-details"
                        title={l.details || ""}
                      >
                        {l.details || "—"}
                      </span>
                    </td>
                    <td data-label="IP" className="col-ip">
                      <span className="al-ip">
                        {l.ip_address || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Timeline view */}
        {!showSkeleton && !error && logs.length > 0 && view === "timeline" && (
          <div className="al-timeline">
            {logs.map((l) => (
              <div className="al-tl-item" key={l.id}>
                <span className="al-tl-avatar">
                  <Avatar name={l.full_name} role={l.role_name} />
                </span>
                <div className="al-tl-body">
                  <div className="al-tl-top">
                    <span className="al-tl-name">
                      {l.full_name || "System"}
                    </span>
                    <RoleChip role={l.role_name} />
                    <ActionChip action={l.action} />
                  </div>
                  <div className="al-tl-details">
                    {l.details || "No additional details recorded."}
                  </div>
                  <div className="al-tl-meta">
                    <span>
                      <FiClock size={12} />
                      {fmtExact(l.created_at)} · {timeAgo(l.created_at)}
                    </span>
                    <span>
                      <TargetBadge
                        type={l.target_type}
                        id={l.target_id}
                        Icon={typeIcon(l.target_type)}
                      />
                    </span>
                    {l.ip_address && (
                      <span>
                        <FiMonitor size={12} /> {l.ip_address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!showSkeleton && !error && total > 0 && (
          <div className="al-pagination">
            <span className="al-page-info">
              Showing <b>{rangeFrom}–{rangeTo}</b> of{" "}
              <b>{total.toLocaleString("en-IN")}</b> activities
            </span>
            <div className="al-page-controls">
              <label className="al-size-select">
                Rows
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  aria-label="Rows per page"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
              <button
                type="button"
                className="al-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <FiChevronLeft size={15} />
              </button>
              {pageItems.map((item, idx) =>
                item === "…" ? (
                  <span
                    className="al-page-ellipsis"
                    key={`e-${idx}`}
                  >
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    key={item}
                    className={`al-page-btn ${page === item ? "active" : ""}`}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                className="al-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Friendly hint for admins who landed here */}
      {!restricted && !loading && (
        <p
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "12.5px",
            color: "var(--text-light)",
          }}
        >
          <FiActivity size={12} style={{ verticalAlign: "-2px" }} /> Data
          refreshes live from the server — use Refresh or filters to re-query.
        </p>
      )}
    </div>
  );
};

export default ActivityLogs;
