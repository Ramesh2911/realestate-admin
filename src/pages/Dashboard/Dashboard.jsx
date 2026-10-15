import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  FiUsers,
  FiHome,
  FiTarget,
  FiClipboard,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiShoppingCart,
  FiKey,
  FiBriefcase,
  FiRefreshCw,
  FiDownload,
  FiMapPin,
  FiClock,
  FiArrowRight,
  FiCalendar,
  FiPieChart,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaUserTie } from "react-icons/fa";
import {
  getDashboardStatsApi,
  getAdminStatsApi,
  getLogsApi,
  getPropertyStatsApi,
} from "../../services/auth.api";
import useCountUp from "../../hooks/useCountUp";
import "./Dashboard.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

/* ─────────────────────────────────────────────
    CONSTANTS + HELPERS
───────────────────────────────────────────── */
const roleMap = {
  "Super Admin": "SUPER_ADMIN",
  "Admin A": "ADMIN_A",
  "Admin B": "ADMIN_B",
  Broker: "BROKER",
  Owner: "OWNER",
};

const formatCurrency = (val) => {
  if (val == null) return "₹0";
  const num = Number(val);
  if (Number.isNaN(num)) return val;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const formatNumber = (val) => {
  if (val == null) return "0";
  const num = Number(val);
  if (Number.isNaN(num)) return val;
  return num.toLocaleString("en-IN");
};

const formatPrice = (price) => {
  if (price == null || price === "") return "—";
  const num = Number(String(price).replace(/,/g, ""));
  if (Number.isNaN(num)) return String(price);
  return formatCurrency(num);
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

const statusClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "sold") return "approved";
  if (s === "pending" || s === "in progress") return "pending";
  if (s === "rejected") return "rejected";
  return "other";
};

const verifyTone = (value) => {
  const s = String(value || "").toLowerCase();
  if (s === "approved") return "ok";
  if (s === "rejected") return "no";
  if (s) return "wait";
  return "mute";
};

const actionTone = (action = "") => {
  const a = String(action).toLowerCase();
  if (/(create|add|insert|register|submit|approve)/.test(a)) return "create";
  if (/(login|logout|signin|signout|auth)/.test(a)) return "auth";
  if (/(update|edit|modify|change)/.test(a)) return "update";
  if (/(delete|remove|reject)/.test(a)) return "danger";
  return "mute";
};

const extractLogs = (res) => {
  const d = res?.data?.data ?? res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.logs)) return d.logs;
  return [];
};

const normalizeLog = (row, idx, fallbackName) => ({
  id: row?.id ?? row?._id ?? idx,
  name:
    row?.full_name ||
    row?.user ||
    row?.userName ||
    fallbackName ||
    "System",
  role: row?.role_name || row?.role || "",
  action: row?.action || row?.activity || "activity",
  details: row?.details || row?.description || row?.message || "",
  time: row?.created_at || row?.createdAt || row?.timestamp,
});

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

const CHART_TOOLTIP = {
  backgroundColor: "#0b1430",
  titleColor: "#ffffff",
  bodyColor: "rgba(255,255,255,0.85)",
  padding: 12,
  cornerRadius: 10,
  boxPadding: 6,
  titleFont: { family: "DM Sans", size: 12, weight: "700" },
  bodyFont: { family: "DM Sans", size: 12 },
};

/* ─────────────────────────────────────────────
    SMALL COMPONENTS
───────────────────────────────────────────── */
const StatValue = ({ value }) => {
  const numeric = Number(String(value ?? 0).replace(/[^\d.-]/g, ""));
  const safe = Number.isNaN(numeric) ? 0 : numeric;
  const count = useCountUp(safe);
  if (Number.isNaN(numeric)) return <>{String(value ?? 0)}</>;
  return <>{formatNumber(count)}</>;
};

const KpiCard = ({ icon: Icon, label, value, sub, tone }) => (
  <article className={`kpi-card tone-${tone}`}>
    <span className="kpi-glow" />
    <div className="kpi-top">
      <span className="kpi-icon">
        <Icon size={20} />
      </span>
      <span className="kpi-label">{label}</span>
    </div>
    <div className="kpi-value">
      <StatValue value={value} />
    </div>
    <div className="kpi-sub">
      <span className="kpi-sub-dot" />
      {sub}
    </div>
  </article>
);

const MiniTile = ({ icon: Icon, label, value }) => (
  <div className="mini-tile">
    <span className="mini-tile-icon">
      <Icon size={17} />
    </span>
    <div>
      <div className="mini-tile-value">
        <StatValue value={value} />
      </div>
      <div className="mini-tile-label">{label}</div>
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, text }) => (
  <div className="empty-state">
    <span className="empty-state-icon">
      <Icon size={22} />
    </span>
    <p>
      <b>{title}</b>
      {text}
    </p>
  </div>
);

const Skeleton = () => (
  <div className="dash-page">
    <div className="sk sk-hero" />
    <div className="sk-grid">
      <div className="sk sk-card" />
      <div className="sk sk-card" />
      <div className="sk sk-card" />
      <div className="sk sk-card" />
    </div>
    <div className="sk sk-wide" />
    <div className="sk-bottom">
      <div className="sk sk-panel" />
      <div className="sk sk-panel" />
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="dash-page">
    <div className="error-state">
      <span className="error-icon">
        <FiAlertTriangle />
      </span>
      <h3>Something went wrong</h3>
      <p>{message || "Failed to load dashboard data. Please try again."}</p>
      <button type="button" className="dash-btn dash-btn-primary" onClick={onRetry}>
        <FiRefreshCw size={15} /> Retry
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
    STATUS METER
───────────────────────────────────────────── */
const StatusMeter = ({ title, sub, segments, total }) => {
  const sum = segments.reduce((s, seg) => s + (Number(seg.value) || 0), 0);
  const count = Number(total) || 0;
  const hasData = count > 0 && sum > 0;

  return (
    <div className="meter-card">
      <div className="meter-card-head">
        <div>
          <h3 className="meter-card-title">{title}</h3>
          <div className="meter-card-sub">{sub}</div>
        </div>
        <div className="meter-legend">
          {segments.map((seg) => (
            <span className="meter-legend-item" key={seg.key}>
              <i style={{ background: seg.color }} />
              {seg.label} <b>{formatNumber(seg.value)}</b>
            </span>
          ))}
        </div>
      </div>

      {hasData ? (
        <div className="meter-bar">
          {segments.map((seg) => (
            <span
              key={seg.key}
              className={`meter-seg ${seg.key}`}
              style={{
                width: `${((Number(seg.value) || 0) / count) * 100}%`,
                background: seg.custom || undefined,
              }}
              title={`${seg.label}: ${formatNumber(seg.value)}`}
            />
          ))}
        </div>
      ) : (
        <div className="meter-empty">
          No properties to show yet — the pipeline will appear here.
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
    CHARTS
───────────────────────────────────────────── */
const STATUS_COLORS = {
  approved: "#7AC943",
  pending: "#f59e0b",
  rejected: "#e11d48",
};

const ChartsRow = ({ propStats }) => {
  const byStatus = Array.isArray(propStats?.byStatus)
    ? propStats.byStatus
    : [];
  const byCity = Array.isArray(propStats?.byCity) ? propStats.byCity : [];

  const total = byStatus.reduce((s, r) => s + (Number(r.count) || 0), 0);

  const statusLabels = byStatus.map((r) => r.property_status || "Other");
  const donutData = {
    labels: statusLabels,
    datasets: [
      {
        data: byStatus.map((r) => Number(r.count) || 0),
        backgroundColor: statusLabels.map(
          (l) => STATUS_COLORS[String(l).toLowerCase()] || "#0A4DB8"
        ),
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
          color: "#6c7a89",
          font: { family: "DM Sans", size: 12, weight: "600" },
        },
      },
      tooltip: CHART_TOOLTIP,
    },
  };

  const cityLabels = byCity.map((r) => r.city || "Unknown");
  const barData = {
    labels: cityLabels,
    datasets: [
      {
        label: "Properties",
        data: byCity.map((r) => Number(r.count) || 0),
        backgroundColor: "rgba(10, 77, 184, 0.85)",
        hoverBackgroundColor: "#0A4DB8",
        borderRadius: 6,
        barThickness: 14,
      },
    ],
  };

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: CHART_TOOLTIP,
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#eef3ee" },
        border: { display: false },
        ticks: {
          color: "#6c7a89",
          font: { family: "DM Sans", size: 11, weight: "600" },
          precision: 0,
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#1b2b4b",
          font: { family: "DM Sans", size: 12, weight: "600" },
        },
      },
    },
  };

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-card-head">
          <div>
            <h3 className="chart-card-title">Properties by Status</h3>
            <div className="chart-card-sub">Approval pipeline breakdown</div>
          </div>
          <span className="chart-tag">Live</span>
        </div>
        {byStatus.length ? (
          <div className="donut-wrap">
            <Doughnut data={donutData} options={donutOptions} />
            <div className="donut-center">
              <b>{formatNumber(total)}</b>
              <span>Total</span>
            </div>
          </div>
        ) : (
          <div className="chart-empty">
            <FiPieChart size={22} />
            No property data yet
          </div>
        )}
      </div>

      <div className="chart-card">
        <div className="chart-card-head">
          <div>
            <h3 className="chart-card-title">Top Cities</h3>
            <div className="chart-card-sub">
              Approved properties by location
            </div>
          </div>
          <span className="chart-tag">Top 8</span>
        </div>
        {byCity.length ? (
          <div className="bar-wrap">
            <Bar data={barData} options={barOptions} />
          </div>
        ) : (
          <div className="chart-empty">
            <FiMapPin size={22} />
            No city data yet
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
    RECENT PROPERTIES TABLE
───────────────────────────────────────────── */
const PropertiesTable = ({ rows }) => (
  <div className="section-card">
    <div className="section-head">
      <div>
        <h3 className="section-title">Recent Properties</h3>
        <div className="section-sub">
          Latest listings across the platform
        </div>
      </div>
      <span className="chart-tag">Latest 10</span>
    </div>

    {rows.length ? (
      <div className="table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Property</th>
              <th>Price</th>
              <th className="col-verify">Verify</th>
              <th>Status</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, idx) => {
              const status = p.property_status || p.status || "Pending";
              return (
                <tr key={p.id || p._id || idx}>
                  <td className="cell-id">#{p.id || p._id || idx + 1}</td>
                  <td>
                    <div className="cell-title">
                      {p.property_title || p.title || p.name || "—"}
                    </div>
                    <span className="cell-city">
                      <FiMapPin size={11} />
                      {p.city || p.location || "—"}
                    </span>
                  </td>
                  <td className="cell-price">{formatPrice(p.price)}</td>
                  <td className="col-verify">
                    <span className="verify-chips">
                      <span
                        className={`verify-chip ${verifyTone(p.admin_a_status)}`}
                        title={`Admin A: ${p.admin_a_status || "Not reviewed"}`}
                      >
                        A
                      </span>
                      <span
                        className={`verify-chip ${verifyTone(p.admin_b_status)}`}
                        title={`Admin B: ${p.admin_b_status || "Not reviewed"}`}
                      >
                        B
                      </span>
                      <span
                        className={`verify-chip ${verifyTone(p.super_admin_status)}`}
                        title={`Super Admin: ${p.super_admin_status || "Not reviewed"}`}
                      >
                        S
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${statusClass(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="cell-time">{timeAgo(p.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState
        icon={FiHome}
        title="No recent properties"
        text="New listings will appear here as soon as they are submitted."
      />
    )}
  </div>
);

/* ─────────────────────────────────────────────
    ACTIVITY TIMELINE
───────────────────────────────────────────── */
const ActivityTimeline = ({ items, fallbackName }) => (
  <div className="section-card">
    <div className="section-head">
      <div>
        <h3 className="section-title">Recent Activity</h3>
        <div className="section-sub">Latest actions across the platform</div>
      </div>
      <Link className="section-link" to="/activity-logs">
        View all <FiArrowRight size={13} />
      </Link>
    </div>

    {items.length ? (
      <div className="timeline">
        {items.map((item) => (
          <div className="timeline-item" key={item.id}>
            <span className="timeline-avatar">
              {getInitials(item.name || fallbackName)}
            </span>
            <div className="timeline-body">
              <div className="timeline-top">
                <span className="timeline-name">{item.name}</span>
                {item.role && (
                  <span className="timeline-role">{item.role}</span>
                )}
                <span
                  className={`timeline-action tone-${actionTone(item.action)}`}
                >
                  {item.action}
                </span>
              </div>
              <div className="timeline-details">
                {item.details || "No additional details recorded."}
              </div>
              <span className="timeline-time">
                <FiClock size={11} />
                {timeAgo(item.time) || "recently"}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={FiActivity}
        title="No recent activity"
        text="Actions performed by the team will show up here."
      />
    )}
  </div>
);

/* ─────────────────────────────────────────────
    DASHBOARD
───────────────────────────────────────────── */
const Dashboard = () => {
  const [storedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [activeRole] = useState(
    () => roleMap[storedUser.role_name] || "SUPER_ADMIN"
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [propStats, setPropStats] = useState(null);
  const [logs, setLogs] = useState([]);

  const isSuperAdmin = activeRole === "SUPER_ADMIN";
  const isAdminLike = activeRole === "ADMIN_A" || activeRole === "ADMIN_B";

  const userName =
    storedUser.full_name || storedUser.name || storedUser.username || "";
  const displayRoleName = storedUser.role_name || "Member";

  const fetchDashboardData = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        if (isSuperAdmin) {
          const [dashRes, logsRes, propRes] = await Promise.all([
            getDashboardStatsApi(),
            getLogsApi({ page: 1, limit: 10 }),
            getPropertyStatsApi(),
          ]);
          setDashboardStats(dashRes.data?.data || dashRes.data || {});
          setPropStats(propRes.data?.data || propRes.data || {});
          setLogs(extractLogs(logsRes));
        } else if (isAdminLike) {
          const adminRes = await getAdminStatsApi();
          setAdminStats(adminRes.data?.data || adminRes.data || {});
          setLogs([]);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (!silent) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load dashboard data. Please try again."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isSuperAdmin, isAdminLike]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const kpis = useMemo(() => {
    if (isSuperAdmin && dashboardStats) {
      const s = dashboardStats;
      return [
        {
          key: "users",
          label: "Total Users",
          value: s.totalUsers ?? 0,
          icon: FiUsers,
          tone: "blue",
          sub: `${formatNumber(s.totalOwners)} owners · ${formatNumber(s.totalBrokers)} brokers`,
        },
        {
          key: "properties",
          label: "Total Properties",
          value: s.totalProperties ?? 0,
          icon: FiHome,
          tone: "green",
          sub: `${formatNumber(s.approvedProperties)} approved · ${formatNumber(s.pendingProperties)} pending`,
        },
        {
          key: "leads",
          label: "Total Leads",
          value: s.totalLeads ?? 0,
          icon: FiTarget,
          tone: "violet",
          sub: `${formatNumber(s.totalInquiries)} property inquiries`,
        },
        {
          key: "pending",
          label: "Pending Reviews",
          value: s.pendingProperties ?? 0,
          icon: FiClipboard,
          tone: "amber",
          sub: `${formatNumber(s.rejectedProperties)} rejected`,
        },
      ];
    }
    if (isAdminLike && adminStats) {
      const s = adminStats;
      return [
        {
          key: "pending",
          label: "Pending Review",
          value: s.pendingReview ?? 0,
          icon: FiClipboard,
          tone: "amber",
          sub: "awaiting your action",
        },
        {
          key: "approved",
          label: "Total Approved",
          value: s.totalApproved ?? 0,
          icon: FiCheckCircle,
          tone: "green",
          sub: "properties approved",
        },
        {
          key: "rejected",
          label: "Total Rejected",
          value: s.totalRejected ?? 0,
          icon: FiXCircle,
          tone: "rose",
          sub: "properties rejected",
        },
        {
          key: "activity",
          label: "My Activity",
          value: Array.isArray(s.myActivity) ? s.myActivity.length : 0,
          icon: FiActivity,
          tone: "blue",
          sub: "actions logged",
        },
      ];
    }
    return [];
  }, [isSuperAdmin, isAdminLike, dashboardStats, adminStats]);

  const meterData = useMemo(() => {
    if (isSuperAdmin && dashboardStats) {
      const s = dashboardStats;
      const total = Number(s.totalProperties) || 0;
      const approved = Number(s.approvedProperties) || 0;
      const pending = Number(s.pendingProperties) || 0;
      const rejected = Number(s.rejectedProperties) || 0;
      const other = Math.max(0, total - approved - pending - rejected);
      const segments = [
        { key: "approved", label: "Approved", value: approved, color: "#7AC943" },
        { key: "pending", label: "Pending", value: pending, color: "#f59e0b" },
        { key: "rejected", label: "Rejected", value: rejected, color: "#e11d48" },
      ];
      if (other > 0) {
        segments.push({
          key: "other",
          label: "Other",
          value: other,
          color: "#0A4DB8",
        });
      }
      return { title: "Property Pipeline", sub: "Approval status across all listings", segments, total };
    }
    if (isAdminLike && adminStats) {
      const s = adminStats;
      const approved = Number(s.totalApproved) || 0;
      const pending = Number(s.pendingReview) || 0;
      const rejected = Number(s.totalRejected) || 0;
      return {
        title: "Review Pipeline",
        sub: "Your property verification workload",
        segments: [
          { key: "approved", label: "Approved", value: approved, color: "#7AC943" },
          { key: "pending", label: "Pending", value: pending, color: "#f59e0b" },
          { key: "rejected", label: "Rejected", value: rejected, color: "#e11d48" },
        ],
        total: approved + pending + rejected,
      };
    }
    return null;
  }, [isSuperAdmin, isAdminLike, dashboardStats, adminStats]);

  const recentProperties = useMemo(
    () =>
      isSuperAdmin && Array.isArray(dashboardStats?.recentProperties)
        ? dashboardStats.recentProperties.slice(0, 10)
        : [],
    [isSuperAdmin, dashboardStats]
  );

  const timelineItems = useMemo(() => {
    if (isSuperAdmin) {
      return logs.slice(0, 8).map((row, i) => normalizeLog(row, i, userName));
    }
    if (isAdminLike && Array.isArray(adminStats?.myActivity)) {
      return adminStats.myActivity
        .slice(0, 8)
        .map((row, i) => normalizeLog(row, i, userName));
    }
    return [];
  }, [isSuperAdmin, isAdminLike, logs, adminStats, userName]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const renderSubtitle = () => {
    if (isSuperAdmin && dashboardStats) {
      return `Full platform overview — ${formatNumber(dashboardStats.totalProperties)} properties and ${formatNumber(dashboardStats.totalUsers)} users across all regions.`;
    }
    if (isAdminLike && adminStats) {
      return `${formatNumber(adminStats.pendingReview)} properties pending your review, ${formatNumber(adminStats.totalApproved)} approved so far.`;
    }
    if (isSuperAdmin) return "Full platform overview — all regions, all teams.";
    if (isAdminLike)
      return "Review properties and manage your assigned workload.";
    return "Your activity overview.";
  };

  const handleExport = () => {
    const rows = [];
    rows.push(["Edge Mile Realty - Dashboard Export"]);
    rows.push(["Generated", new Date().toLocaleString("en-IN")]);
    rows.push(["Role", displayRoleName]);
    rows.push([]);

    if (kpis.length) {
      rows.push(["Metric", "Value"]);
      kpis.forEach((k) => rows.push([k.label, k.value]));
      rows.push([]);
    }

    if (meterData) {
      rows.push(["Pipeline Segment", "Count"]);
      meterData.segments.forEach((seg) =>
        rows.push([seg.label, seg.value])
      );
      rows.push([]);
    }

    if (recentProperties.length) {
      rows.push([
        "Property ID",
        "Title",
        "City",
        "Price",
        "Status",
        "Created At",
      ]);
      recentProperties.forEach((p) =>
        rows.push([
          p.id || p._id || "",
          p.property_title || p.title || "",
          p.city || "",
          p.price || "",
          p.property_status || p.status || "",
          p.created_at || "",
        ])
      );
      rows.push([]);
    }

    if (timelineItems.length) {
      rows.push(["Time", "User", "Role", "Action", "Details"]);
      timelineItems.forEach((t) =>
        rows.push([t.time || "", t.name, t.role, t.action, t.details])
      );
    }

    downloadCsv(
      `dashboard-export-${new Date().toISOString().slice(0, 10)}.csv`,
      rows
    );
  };

  const handleRefresh = () => fetchDashboardData(true);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="dash-page">
        <ErrorState message={error} onRetry={() => fetchDashboardData()} />
      </div>
    );
  }

  const showMeter = Boolean(meterData);
  const showMiniTiles = isSuperAdmin && dashboardStats;
  const showCharts = isSuperAdmin && propStats;
  const showProperties = isSuperAdmin;
  const showTimeline = isSuperAdmin || isAdminLike;

  return (
    <div className="dash-page">
      {/* ── HERO ── */}
      <div className="dash-hero">
        <div>
          <div className="dash-role-chip">{displayRoleName}</div>
          <h1 className="dash-title">
            {getGreeting()}
            {userName ? (
              <>
                , <span className="dash-title-accent">{userName}</span>
              </>
            ) : (
              ""
            )}
          </h1>
          <div className="dash-sub">{renderSubtitle()}</div>
          <div className="dash-date">
            <FiCalendar size={13} />
            {todayLabel}
          </div>
        </div>

        <div className="dash-actions">
          <button
            type="button"
            className="dash-btn dash-btn-ghost"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw size={15} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            className="dash-btn dash-btn-primary"
            onClick={handleExport}
          >
            <FiDownload size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      {kpis.length > 0 && (
        <div className="kpi-grid">
          {kpis.map((k) => (
            <KpiCard
              key={k.key}
              icon={k.icon}
              label={k.label}
              value={k.value}
              sub={k.sub}
              tone={k.tone}
            />
          ))}
        </div>
      )}

      {/* ── PIPELINE METER + MINI TILES ── */}
      {showMeter && (
        <StatusMeter
          title={meterData.title}
          sub={meterData.sub}
          segments={meterData.segments}
          total={meterData.total}
        />
      )}

      {showMiniTiles && (
        <div className="meter-card">
          <div className="meter-card-head">
            <div>
              <h3 className="meter-card-title">Community</h3>
              <div className="meter-card-sub">
                Users by category on the platform
              </div>
            </div>
          </div>
          <div className="mini-grid">
            <MiniTile
              icon={FiShoppingCart}
              label="Buyers"
              value={dashboardStats.totalBuyers ?? 0}
            />
            <MiniTile
              icon={FiKey}
              label="Owners"
              value={dashboardStats.totalOwners ?? 0}
            />
            <MiniTile
              icon={FaUserTie}
              label="Brokers"
              value={dashboardStats.totalBrokers ?? 0}
            />
            <MiniTile
              icon={FiBriefcase}
              label="Developers"
              value={dashboardStats.totalDevelopers ?? 0}
            />
          </div>
        </div>
      )}

      {/* ── CHARTS ── */}
      {showCharts && <ChartsRow propStats={propStats} />}

      {/* ── PROPERTIES + ACTIVITY ── */}
      <div className={`dash-bottom ${showProperties ? "" : "single"}`}>
        {showProperties && <PropertiesTable rows={recentProperties} />}
        {showTimeline && (
          <ActivityTimeline
            items={timelineItems}
            fallbackName={userName}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
