import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
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
  FiDownload,
  FiRefreshCw,
  FiHome,
  FiUsers,
  FiUserCheck,
  FiClock,
  FiTarget,
  FiSend,
  FiActivity,
  FiPieChart,
  FiMapPin,
  FiLayers,
  FiFileText,
} from "react-icons/fi";
import {
  getDashboardStatsApi,
  getAdminStatsApi,
  getPropertyStatsApi,
  getLeadsApi,
  getAllInterestsApi,
  getLogsApi,
  getPropertyApi,
} from "../../services/auth.api";
import { ListHero, StatGrid, StateView } from "../../components/ListUI";
import { fmtNum, formatCr, fmtWhen, downloadCsv } from "../../utils/list";
import "./Reports.css";

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
const STATUS_COLORS = {
  approved: "#7AC943",
  available: "#7AC943",
  sold: "#0A4DB8",
  pending: "#F59E0B",
  rejected: "#E11D48",
  rented: "#8B5CF6",
  other: "#94A3B8",
};

const LEAD_COLORS = {
  new: "#0A4DB8",
  contacted: "#F59E0B",
  converted: "#7AC943",
  lost: "#E11D48",
  closed: "#0A4DB8",
  other: "#94A3B8",
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

const legendFont = { family: "DM Sans", size: 12, weight: "600" };
const tickFont = { family: "DM Sans", size: 11, weight: "600" };

const colorFor = (key, map) => map[String(key || "").toLowerCase()] || map.other;

const actionTone = (action = "") => {
  const a = String(action).toLowerCase();
  if (/(create|add|insert|register|submit|approve)/.test(a)) return "create";
  if (/(login|logout|signin|signout|auth)/.test(a)) return "auth";
  if (/(update|edit|modify|change)/.test(a)) return "update";
  if (/(delete|remove|reject)/.test(a)) return "danger";
  return "mute";
};

const extractList = (res) => {
  const d = res?.data?.data ?? res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.pages)) return d.pages;
  if (Array.isArray(d?.requirements)) return d.requirements;
  if (Array.isArray(d?.interests)) return d.interests;
  return [];
};

const extractLogs = (res) => {
  const d = res?.data?.data ?? res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.logs)) return d.logs;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

/* ─────────────────────────────────────────────
    CHART COMPONENTS (props-driven, module scope)
───────────────────────────────────────────── */
const StatusDonut = ({ rows }) => {
  const total = rows.reduce((s, r) => s + (Number(r.count) || 0), 0);
  const labels = rows.map((r) => r.property_status || "Other");
  const data = {
    labels,
    datasets: [
      {
        data: rows.map((r) => Number(r.count) || 0),
        backgroundColor: labels.map((l) => colorFor(l, STATUS_COLORS)),
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };
  const options = {
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
          font: legendFont,
        },
      },
      tooltip: CHART_TOOLTIP,
    },
  };
  if (!rows.length) {
    return (
      <div className="rp-chart-empty">
        <FiPieChart size={22} />
        No property status data yet
      </div>
    );
  }
  return (
    <div className="rp-donut-wrap">
      <Doughnut data={data} options={options} />
      <div className="rp-donut-center">
        <b>{fmtNum(total)}</b>
        <span>Total</span>
      </div>
    </div>
  );
};

const CityBar = ({ rows }) => {
  const data = {
    labels: rows.map((r) => r.city || "Unknown"),
    datasets: [
      {
        label: "Properties",
        data: rows.map((r) => Number(r.count) || 0),
        backgroundColor: "rgba(10, 77, 184, 0.85)",
        hoverBackgroundColor: "#0A4DB8",
        borderRadius: 6,
        barThickness: 14,
      },
    ],
  };
  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: CHART_TOOLTIP },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#eef3ee" },
        border: { display: false },
        ticks: { color: "#6c7a89", font: tickFont, precision: 0 },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#1b2b4b", font: { ...tickFont, size: 12 } },
      },
    },
  };
  if (!rows.length) {
    return (
      <div className="rp-chart-empty">
        <FiMapPin size={22} />
        No city data yet
      </div>
    );
  }
  return (
    <div className="rp-bar-wrap">
      <Bar data={data} options={options} />
    </div>
  );
};

const TypeBar = ({ rows }) => {
  const data = {
    labels: rows.map((r) => r.property_type || "Other"),
    datasets: [
      {
        label: "Properties",
        data: rows.map((r) => Number(r.count) || 0),
        backgroundColor: "rgba(122, 201, 67, 0.85)",
        hoverBackgroundColor: "#7AC943",
        borderRadius: 6,
        barThickness: 22,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: CHART_TOOLTIP },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#1b2b4b", font: tickFont },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#eef3ee" },
        border: { display: false },
        ticks: { color: "#6c7a89", font: tickFont, precision: 0 },
      },
    },
  };
  if (!rows.length) {
    return (
      <div className="rp-chart-empty">
        <FiLayers size={22} />
        No property type data yet
      </div>
    );
  }
  return (
    <div className="rp-bar-wrap">
      <Bar data={data} options={options} />
    </div>
  );
};

const LeadFunnel = ({ rows }) => {
  const groups = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      const s = String(r.status || "new").toLowerCase();
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map, ([status, count]) => ({ status, count }));
  }, [rows]);

  const data = {
    labels: groups.map((g) => g.status),
    datasets: [
      {
        label: "Leads",
        data: groups.map((g) => g.count),
        backgroundColor: groups.map((g) => colorFor(g.status, LEAD_COLORS)),
        hoverBackgroundColor: groups.map((g) => colorFor(g.status, LEAD_COLORS)),
        borderRadius: 6,
        barThickness: 26,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: CHART_TOOLTIP },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#1b2b4b", font: tickFont },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#eef3ee" },
        border: { display: false },
        ticks: { color: "#6c7a89", font: tickFont, precision: 0 },
      },
    },
  };
  if (!groups.length) {
    return (
      <div className="rp-chart-empty">
        <FiTarget size={22} />
        No lead status data yet
      </div>
    );
  }
  return (
    <div className="rp-bar-wrap">
      <Bar data={data} options={options} />
    </div>
  );
};

/* ─────────────────────────────────────────────
    REPORT CARD + ACTIVITY LIST
───────────────────────────────────────────── */
const ReportCard = ({
  icon: Icon,
  tone,
  title,
  desc,
  metrics,
  rowCount,
  onExport,
  busy,
}) => (
  <div className="rp-card">
    <div className="rp-card-top">
      <span className={`rp-card-icon tone-${tone}`}>
        <Icon />
      </span>
      <div>
        <div className="rp-card-title">{title}</div>
        <div className="rp-card-desc">{desc}</div>
      </div>
    </div>
    <div className="rp-card-metrics">
      {metrics.map((m) => (
        <div className="rp-metric" key={m.label}>
          <b>{m.value}</b>
          <span>{m.label}</span>
        </div>
      ))}
    </div>
    <div className="rp-card-foot">
      <span className="rp-format">
        <b>{fmtNum(rowCount)}</b> rows · CSV
      </span>
      <button
        type="button"
        className="lp-btn lp-btn-primary"
        onClick={onExport}
        disabled={busy || !rowCount}
      >
        {busy ? "Exporting…" : "Export CSV"}
      </button>
    </div>
  </div>
);

const ActivityList = ({ rows }) => {
  if (!rows.length) {
    return <div className="rp-act-empty">No activity in this range.</div>;
  }
  return (
    <div className="rp-act-list">
      {rows.map((r, i) => (
        <div className="rp-act-item" key={r.id ?? i}>
          <span className={`rp-act-icon ${actionTone(r.action)}`}>
            <FiActivity />
          </span>
          <div className="rp-act-body">
            <div className="rp-act-line">
              <span className="rp-act-action">{r.action || "activity"}</span>
              <span className="rp-act-who">{r.name || "System"}</span>
            </div>
            {r.details && (
              <div className="rp-act-details" title={r.details}>
                {r.details}
              </div>
            )}
          </div>
          <span className="rp-act-time">{fmtWhen(r.time)}</span>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
    MAIN
───────────────────────────────────────────── */
const ReportsPage = () => {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);
  const isSuperAdmin = Number(storedUser.role_id) === 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);

  const [stats, setStats] = useState(null);
  const [propStats, setPropStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [interests, setInterests] = useState([]);
  const [logs, setLogs] = useState([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const logParams = { page: 1, limit: 50 };
      if (from) logParams.from = from;
      if (to) logParams.to = to;

      if (isSuperAdmin) {
        const [sRes, pRes, lRes, iRes, logsRes, propRes] =
          await Promise.allSettled([
            getDashboardStatsApi(),
            getPropertyStatsApi(),
            getLeadsApi(),
            getAllInterestsApi(),
            getLogsApi(logParams),
            getPropertyApi(),
          ]);
        setStats(sRes.status === "fulfilled" ? sRes.value?.data?.data || sRes.value?.data || {} : null);
        setPropStats(pRes.status === "fulfilled" ? pRes.value?.data?.data || pRes.value?.data || {} : null);
        setLeads(lRes.status === "fulfilled" ? extractList(lRes.value) : []);
        setInterests(iRes.status === "fulfilled" ? extractList(iRes.value) : []);
        setLogs(logsRes.status === "fulfilled" ? extractLogs(logsRes.value) : []);
        setProperties(propRes.status === "fulfilled" ? extractList(propRes.value) : []);
      } else {
        const [aRes, lRes, iRes] = await Promise.allSettled([
          getAdminStatsApi(),
          getLeadsApi(),
          getAllInterestsApi(),
        ]);
        setAdminStats(aRes.status === "fulfilled" ? aRes.value?.data?.data || aRes.value?.data || {} : null);
        setLeads(lRes.status === "fulfilled" ? extractList(lRes.value) : []);
        setInterests(iRes.status === "fulfilled" ? extractList(iRes.value) : []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, from, to]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* Derived data */
  const byStatus = propStats?.byStatus || [];
  const byCity = useMemo(() => (propStats?.byCity || []).slice(0, 8), [propStats]);
  const byType = useMemo(() => (propStats?.byType || []).slice(0, 8), [propStats]);

  const leadCounts = useMemo(() => {
    const c = { total: leads.length, new: 0, contacted: 0, converted: 0, lost: 0 };
    leads.forEach((l) => {
      const s = String(l.status || "new").toLowerCase();
      if (c[s] !== undefined) c[s] += 1;
    });
    return c;
  }, [leads]);

  const stats2 = isSuperAdmin ? stats : adminStats;

  const heroStats = useMemo(() => {
    if (isSuperAdmin && stats) {
      return [
        { label: "Total Users", value: fmtNum(stats.totalUsers ?? 0), icon: FiUsers, tone: "blue" },
        { label: "Properties", value: fmtNum(stats.totalProperties ?? 0), icon: FiHome, tone: "green" },
        { label: "Approved", value: fmtNum(stats.approvedProperties ?? stats.totalApproved ?? 0), icon: FiUserCheck, tone: "green" },
        { label: "Pending", value: fmtNum(stats.pendingProperties ?? stats.totalPending ?? 0), icon: FiClock, tone: "amber" },
        { label: "Leads", value: fmtNum(leadCounts.total), icon: FiTarget, tone: "blue" },
        { label: "Inquiries", value: fmtNum(interests.length), icon: FiSend, tone: "green" },
      ];
    }
    if (!isSuperAdmin && adminStats) {
      return [
        { label: "Pending Review", value: fmtNum(adminStats.pendingReview ?? adminStats.pending ?? 0), icon: FiClock, tone: "amber" },
        { label: "Approved", value: fmtNum(adminStats.approved ?? adminStats.totalApproved ?? 0), icon: FiUserCheck, tone: "green" },
        { label: "Rejected", value: fmtNum(adminStats.rejected ?? adminStats.totalRejected ?? 0), icon: FiSend, tone: "red" },
        { label: "My Activity", value: fmtNum((adminStats.myActivity || []).length), icon: FiActivity, tone: "blue" },
      ];
    }
    return [];
  }, [isSuperAdmin, stats, adminStats, leadCounts.total, interests.length]);

  const activityRows = useMemo(() => {
    if (isSuperAdmin) return logs;
    const my = adminStats?.myActivity || [];
    return my.map((r, i) => ({
      id: r.id ?? i,
      name: r.full_name || r.user || "Me",
      action: r.action || r.activity || "activity",
      details: r.details || r.description || "",
      time: r.created_at || r.createdAt,
    }));
  }, [isSuperAdmin, logs, adminStats]);

  /* Exports */
  const exportInventory = () => {
    if (!properties.length) {
      toast.info("Nothing to export for inventory.");
      return;
    }
    setExporting("inv");
    downloadCsv("inventory-report.csv", properties, [
      { label: "ID", value: (r) => r.id },
      { label: "Title", value: (r) => r.title },
      { label: "City", value: (r) => r.city },
      { label: "Type", value: (r) => r.property_type },
      { label: "Status", value: (r) => r.property_status || r.status },
      { label: "Price", value: (r) => r.price },
    ]);
    setExporting(null);
  };

  const exportLeads = () => {
    if (!leads.length) {
      toast.info("Nothing to export for the lead funnel.");
      return;
    }
    setExporting("leads");
    downloadCsv("lead-funnel-report.csv", leads, [
      { label: "ID", value: (r) => r.id },
      { label: "Name", value: (r) => r.full_name || r.name },
      { label: "Phone", value: (r) => r.phone || r.mobile },
      { label: "Status", value: (r) => r.status },
      { label: "Requirement", value: (r) => r.requirement || r.message },
      { label: "Budget", value: (r) => r.budget },
    ]);
    setExporting(null);
  };

  const exportActivity = () => {
    if (!activityRows.length) {
      toast.info("Nothing to export for the current range.");
      return;
    }
    setExporting("act");
    const rows = activityRows.map((r) => ({
      name: r.name,
      action: r.action,
      details: r.details,
      time: r.time,
    }));
    downloadCsv("activity-report.csv", rows, [
      { label: "User", value: (r) => r.name },
      { label: "Action", value: (r) => r.action },
      { label: "Details", value: (r) => r.details },
      { label: "Time", value: (r) => (r.time ? new Date(r.time).toLocaleString("en-IN") : "") },
    ]);
    setExporting(null);
  };

  if (loading) {
    return (
      <div className="lp-page">
        <div className="rp-skel wide" style={{ height: 120, marginBottom: 16 }} />
        <div className="rp-charts" style={{ marginBottom: 16 }}>
          <div className="rp-skel chart" />
          <div className="rp-skel chart" />
        </div>
        <div className="rp-cards">
          <div className="rp-skel card" />
          <div className="rp-skel card" />
          <div className="rp-skel card" />
        </div>
      </div>
    );
  }

  if (error && !stats2) {
    return (
      <div className="lp-page">
        <StateView
          type="error"
          icon={<span aria-hidden>⚠</span>}
          title="Unable to load reports"
          sub={error}
          action={
            <button type="button" className="lp-btn lp-btn-primary" onClick={loadData}>
              Try again
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Analytics"
        sub={
          isSuperAdmin
            ? "Platform-wide performance, inventory, leads and audit trail"
            : "Your assigned pipeline, leads and recent activity"
        }
        actions={
          <div className="rp-range">
            {isSuperAdmin && (
              <>
                <input
                  type="date"
                  className="rp-date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  aria-label="From date"
                />
                <span className="rp-range-sep">→</span>
                <input
                  type="date"
                  className="rp-date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  aria-label="To date"
                />
              </>
            )}
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={loadData}
              title="Refresh"
            >
              <FiRefreshCw size={13} /> Refresh
            </button>
          </div>
        }
      >
        Reports &amp; Analytics
      </ListHero>

      {heroStats.length > 0 && <StatGrid stats={heroStats} />}

      {/* Charts */}
      <div className="rp-charts" style={{ marginTop: 16 }}>
        {isSuperAdmin ? (
          <>
            <div className="rp-chart-card">
              <div className="rp-chart-head">
                <div>
                  <h3 className="rp-chart-title">Properties by Status</h3>
                  <div className="rp-chart-sub">Approval pipeline breakdown</div>
                </div>
                <span className="rp-tag live">Live</span>
              </div>
              <StatusDonut rows={byStatus} />
            </div>
            <div className="rp-chart-card">
              <div className="rp-chart-head">
                <div>
                  <h3 className="rp-chart-title">Top Cities</h3>
                  <div className="rp-chart-sub">Properties by location</div>
                </div>
                <span className="rp-tag">Top 8</span>
              </div>
              <CityBar rows={byCity} />
            </div>
            <div className="rp-chart-card">
              <div className="rp-chart-head">
                <div>
                  <h3 className="rp-chart-title">Property Types</h3>
                  <div className="rp-chart-sub">Inventory composition</div>
                </div>
                <span className="rp-tag">Top 8</span>
              </div>
              <TypeBar rows={byType} />
            </div>
            <div className="rp-chart-card">
              <div className="rp-chart-head">
                <div>
                  <h3 className="rp-chart-title">Lead Funnel</h3>
                  <div className="rp-chart-sub">Requirements by status</div>
                </div>
                <span className="rp-tag">{fmtNum(leadCounts.total)}</span>
              </div>
              <LeadFunnel rows={leads} />
            </div>
          </>
        ) : (
          <div className="rp-chart-card" style={{ gridColumn: "1 / -1" }}>
            <div className="rp-chart-head">
              <div>
                <h3 className="rp-chart-title">Lead Funnel</h3>
                <div className="rp-chart-sub">Your requirements by status</div>
              </div>
              <span className="rp-tag">{fmtNum(leadCounts.total)}</span>
            </div>
            <LeadFunnel rows={leads} />
          </div>
        )}
      </div>

      {/* Report cards */}
      <div className="rp-cards" style={{ marginTop: 16 }}>
        {isSuperAdmin && (
          <ReportCard
            icon={FiHome}
            tone="blue"
            title="Inventory Analytics"
            desc="Full property inventory snapshot with approval and portfolio value."
            metrics={[
              { label: "Total", value: fmtNum(properties.length) },
              {
                label: "Portfolio",
                value: formatCr(
                  properties.reduce((s, r) => s + (Number(String(r.price || "").replace(/[^0-9.]/g, "")) || 0), 0)
                ),
              },
            ]}
            rowCount={properties.length}
            onExport={exportInventory}
            busy={exporting === "inv"}
          />
        )}
        <ReportCard
          icon={FiTarget}
          tone="green"
          title="Lead Funnel"
          desc={
            isSuperAdmin
              ? "All buyer requirements across the platform with conversion snapshot."
              : "Your captured buyer requirements and conversion snapshot."
          }
          metrics={[
            { label: "Requirements", value: fmtNum(leadCounts.total) },
            { label: "New", value: fmtNum(leadCounts.new) },
            { label: "Converted", value: fmtNum(leadCounts.converted) },
            { label: "Inquiries", value: fmtNum(interests.length) },
          ]}
          rowCount={leads.length}
          onExport={exportLeads}
          busy={exporting === "leads"}
        />
        <ReportCard
          icon={FiFileText}
          tone="amber"
          title={isSuperAdmin ? "Activity & Audit" : "My Activity"}
          desc={
            isSuperAdmin
              ? "Audit trail of platform actions within the selected date range."
              : "Your recent actions on the platform."
          }
          metrics={[
            { label: "Events", value: fmtNum(activityRows.length) },
            {
              label: "Range",
              value: from || to ? `${from || "…"} → ${to || "…"}` : "All time",
            },
          ]}
          rowCount={activityRows.length}
          onExport={exportActivity}
          busy={exporting === "act"}
        />
      </div>

      {/* Recent activity */}
      <div className="rp-activity" style={{ marginTop: 16 }}>
        <div className="rp-act-head">
          <h3 className="rp-chart-title">Recent Activity</h3>
          <span className="rp-tag">{fmtNum(activityRows.length)}</span>
        </div>
        <ActivityList rows={activityRows.slice(0, 8)} />
      </div>
    </div>
  );
};

export default ReportsPage;
