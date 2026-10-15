import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaBuilding,
  FaHome,
  FaHardHat,
  FaEye,
  FaSyncAlt,
  FaDownload,
} from "react-icons/fa";
import { getDeveloperApi } from "../../services/auth.api";
import {
  ListHero,
  StatGrid,
  Toolbar,
  ListTable,
  Pager,
  Modal,
  Avatar,
} from "../../components/ListUI";
import { useDebounced, fmtNum, downloadCsv } from "../../utils/list";

const EMPTY = {
  title: "No developers found",
  sub: "Try a different name, email or developer ID.",
};

const Developers = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [view, setView] = useState(null);
  const dq = useDebounced(q, 300);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const res = await getDeveloperApi();
      const data = res?.data?.data || res || [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load developers. Please try again.");
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

  const filtered = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((d) =>
      [d.full_name, d.email, d.phone, `dev-${d.id}`, String(d.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [rows, dq]);

  const stats = useMemo(() => {
    const units = rows.reduce(
      (acc, d) => acc + (parseInt(d.total_properties, 10) || 0),
      0
    );
    const withProjects = rows.filter(
      (d) => (parseInt(d.total_properties, 10) || 0) > 0
    ).length;
    return [
      { label: "Registered Developers", value: fmtNum(rows.length), icon: FaBuilding, tone: "blue" },
      { label: "Developed Units", value: fmtNum(units), sub: "tracked on the platform", icon: FaHome, tone: "green" },
      { label: "With Projects", value: fmtNum(withProjects), sub: `${rows.length - withProjects} without listings`, icon: FaHardHat, tone: "slate" },
    ];
  }, [rows]);

  const columns = [
    {
      key: "id",
      label: "Developer ID",
      sortable: true,
      width: "120px",
      cell: (r) => <span className="lp-id">#DEV-{r.id}</span>,
    },
    {
      key: "full_name",
      label: "Developer",
      sortable: true,
      cell: (r) => (
        <div className="lp-user">
          <Avatar name={r.full_name} tone="mute" />
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
      label: "Projects",
      sortable: true,
      sortValue: (r) => parseInt(r.total_properties, 10) || 0,
      align: "right",
      cell: (r) => (
        <span className="lp-status tone-blue">
          <FaBuilding size={10} />
          {fmtNum(r.total_properties || 0)} projects
        </span>
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
      `developers-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { label: "Developer ID", value: (r) => `DEV-${r.id}` },
        { label: "Name", value: (r) => r.full_name || "" },
        { label: "Email", value: (r) => r.email || "" },
        { label: "Phone", value: (r) => r.phone || "" },
        { label: "Projects", value: (r) => r.total_properties || 0 },
      ]
    );
  };

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Developer Network"
        sub="Developers and organizations delivering projects tracked across the marketplace."
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
        Developer <span className="lp-accent">Registry</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder="Search by name, email or developer ID…"
      />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">Developers</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(rows.length)} records`}
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
        title="Developer Profile"
        sub="Directory record as reported by the platform."
      >
        {view && (
          <>
            <div className="lp-profile-hero">
              <Avatar name={view.full_name} tone="mute" lg />
              <div className="lp-profile-name">{view.full_name || "—"}</div>
              <div className="lp-profile-mail">{view.email || "No email on file"}</div>
            </div>
            <div className="lp-profile-grid">
              <div className="lp-info-card">
                <div className="k">Developer ID</div>
                <div className="v lp-mono">DEV-{view.id}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Phone</div>
                <div className="v">{view.phone || "Not provided"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Developed Projects</div>
                <div className="v">{fmtNum(view.total_properties || 0)}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Record Type</div>
                <div className="v">Developer</div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Developers;
