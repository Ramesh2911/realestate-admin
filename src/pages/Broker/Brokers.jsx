import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaUserTie,
  FaHome,
  FaCheckCircle,
  FaEye,
  FaSyncAlt,
  FaDownload,
} from "react-icons/fa";
import { getBrokerApi } from "../../services/auth.api";
import {
  ListHero,
  StatGrid,
  Toolbar,
  ListTable,
  Pager,
  Modal,
  Avatar,
  StatusPill,
} from "../../components/ListUI";
import { useDebounced, fmtNum, downloadCsv } from "../../utils/list";

const EMPTY = {
  title: "No brokers found",
  sub: "Try a different name, email or broker ID.",
};

const statusOf = (r) => r.status || "Active";

const Brokers = () => {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [view, setView] = useState(null);
  const dq = useDebounced(q, 300);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const res = await getBrokerApi();
      const data = res?.data?.data || res || [];
      setBrokers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load brokers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  const onSearch = (v) => {
    setQ(v);
    setPage(1);
  };

  const onStatus = (k) => {
    setStatus(k);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const s = dq.trim().toLowerCase();
    return brokers.filter((b) => {
      if (status !== "all" && statusOf(b) !== status) return false;
      if (!s) return true;
      return [b.full_name, b.email, b.phone, `brk-${b.id}`, String(b.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s));
    });
  }, [brokers, dq, status]);

  const stats = useMemo(() => {
    const active = brokers.filter((b) => statusOf(b) === "Active").length;
    const units = brokers.reduce(
      (acc, b) => acc + (parseInt(b.total_properties, 10) || 0),
      0
    );
    return [
      { label: "Enrolled Brokers", value: fmtNum(brokers.length), icon: FaUserTie, tone: "blue" },
      { label: "Active Operators", value: fmtNum(active), sub: `${brokers.length - active} suspended`, icon: FaCheckCircle, tone: "green" },
      { label: "Active Properties", value: fmtNum(units), sub: "listed via brokers", icon: FaHome, tone: "slate" },
    ];
  }, [brokers]);

  const pills = useMemo(() => {
    const active = brokers.filter((b) => statusOf(b) === "Active").length;
    return [
      { key: "all", label: "All", count: brokers.length },
      { key: "Active", label: "Active", count: active },
      { key: "Suspended", label: "Suspended", count: brokers.length - active },
    ];
  }, [brokers]);

  const columns = [
    {
      key: "id",
      label: "Broker ID",
      sortable: true,
      width: "110px",
      cell: (r) => <span className="lp-id">#BRK-{r.id}</span>,
    },
    {
      key: "full_name",
      label: "Broker",
      sortable: true,
      cell: (r) => (
        <div className="lp-user">
          <Avatar name={r.full_name} tone="alt" />
          <div style={{ minWidth: 0 }}>
            <div className="lp-user-name">{r.full_name || "—"}</div>
            <div className="lp-cell-sub">{r.email || "No email"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      cell: (r) =>
        r.phone ? (
          <span className="lp-nowrap">{r.phone}</span>
        ) : (
          <span className="lp-muted">Not provided</span>
        ),
    },
    {
      key: "total_properties",
      label: "Properties",
      sortable: true,
      sortValue: (r) => parseInt(r.total_properties, 10) || 0,
      align: "right",
      cell: (r) => (
        <span className="lp-status tone-blue">
          <FaHome size={10} />
          {fmtNum(r.total_properties || 0)} listed
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => statusOf(r),
      cell: (r) => (
        <StatusPill tone={statusOf(r) === "Active" ? "green" : "red"}>
          {statusOf(r)}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      cell: (r) => (
        <div className="lp-actions-cell">
          <button
            type="button"
            className="lp-icon-btn tone-blue"
            title="View profile"
            aria-label={`View ${r.full_name}`}
            onClick={() => setView(r)}
          >
            <FaEye />
          </button>
        </div>
      ),
    },
  ];

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * perPage, cur * perPage);

  const exportCsv = () => {
    downloadCsv(
      `brokers-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { label: "Broker ID", value: (r) => `BRK-${r.id}` },
        { label: "Name", value: (r) => r.full_name || "" },
        { label: "Email", value: (r) => r.email || "" },
        { label: "Phone", value: (r) => r.phone || "" },
        { label: "Properties", value: (r) => r.total_properties || 0 },
        { label: "Status", value: (r) => statusOf(r) },
      ]
    );
  };

  const filtersActive = q !== "" || status !== "all";

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Broker Network"
        sub="Verified brokers operating on the platform, their portfolios and account standing."
        actions={
          <>
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FaSyncAlt className={loading ? "lp-spin" : ""} size={13} />
              Refresh
            </button>
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={exportCsv}
              disabled={loading || !!error}
            >
              <FaDownload size={13} />
              Export CSV
            </button>
          </>
        }
      >
        Broker <span className="lp-accent">Directory</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder="Search by name, email or broker ID…"
        pills={pills}
        activePill={status}
        onPill={onStatus}
        activeCount={filtersActive ? "Filters active" : ""}
        onClear={
          filtersActive
            ? () => {
                setQ("");
                setStatus("all");
                setPage(1);
              }
            : null
        }
      />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">Brokers</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(brokers.length)} records`}
            </div>
          </div>
        </div>

        <ListTable
          columns={columns}
          rows={slice}
          rowKey={(r) => r.id}
          loading={loading}
          error={error}
          onRetry={handleRefresh}
          empty={EMPTY}
          initialSort={{ key: "full_name", dir: "asc" }}
        />

        {!loading && !error && filtered.length > 0 && (
          <Pager
            total={filtered.length}
            page={cur}
            onPage={setPage}
            perPage={perPage}
            onPerPage={(n) => {
              setPerPage(n);
              setPage(1);
            }}
          />
        )}
      </div>

      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title="Broker Profile"
        sub="Directory record as reported by the platform."
      >
        {view && (
          <>
            <div className="lp-profile-hero">
              <Avatar name={view.full_name} tone="alt" lg />
              <div className="lp-profile-name">{view.full_name || "—"}</div>
              <div className="lp-profile-mail">{view.email || "No email on file"}</div>
              <div style={{ marginTop: 10 }}>
                <StatusPill tone={statusOf(view) === "Active" ? "green" : "red"}>
                  {statusOf(view)}
                </StatusPill>
              </div>
            </div>
            <div className="lp-profile-grid">
              <div className="lp-info-card">
                <div className="k">Broker ID</div>
                <div className="v lp-mono">BRK-{view.id}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Phone</div>
                <div className="v">{view.phone || "Not provided"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Active Properties</div>
                <div className="v">{fmtNum(view.total_properties || 0)}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Record Type</div>
                <div className="v">Broker</div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Brokers;
