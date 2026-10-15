import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaUsers,
  FaCheckCircle,
  FaEye,
  FaSyncAlt,
  FaDownload,
} from "react-icons/fa";
import { getBuyerApi } from "../../services/auth.api";
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
  title: "No buyers found",
  sub: "Try a different name, email or buyer ID.",
};

const Buyers = () => {
  const [buyers, setBuyers] = useState([]);
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
      const res = await getBuyerApi();
      const data = res?.data?.data || res || [];
      setBuyers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load buyers. Please try again.");
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
    if (!s) return buyers;
    return buyers.filter((b) =>
      [b.full_name, b.email, b.phone, `buy-${b.id}`, String(b.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [buyers, dq]);

  const stats = useMemo(() => {
    const interested = buyers.reduce(
      (acc, b) => acc + (parseInt(b.total_properties, 10) || 0),
      0
    );
    const active = buyers.filter(
      (b) => (parseInt(b.total_properties, 10) || 0) > 0
    ).length;
    return [
      { label: "Registered Buyers", value: fmtNum(buyers.length), icon: FaUsers, tone: "blue" },
      { label: "Interested Assets", value: fmtNum(interested), sub: "total buyer interests", icon: FaCheckCircle, tone: "green" },
      { label: "Active Buyers", value: fmtNum(active), sub: `${buyers.length - active} with no activity`, icon: FaUsers, tone: "slate" },
    ];
  }, [buyers]);

  const columns = [
    {
      key: "id",
      label: "Buyer ID",
      sortable: true,
      width: "110px",
      cell: (r) => <span className="lp-id">#BUY-{r.id}</span>,
    },
    {
      key: "full_name",
      label: "Buyer",
      sortable: true,
      cell: (r) => (
        <div className="lp-user">
          <Avatar name={r.full_name} />
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
      label: "Interests",
      sortable: true,
      sortValue: (r) => parseInt(r.total_properties, 10) || 0,
      align: "right",
      cell: (r) => (
        <span className="lp-status tone-blue">
          <FaCheckCircle size={10} />
          {fmtNum(r.total_properties || 0)} assets
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
      `buyers-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { label: "Buyer ID", value: (r) => `BUY-${r.id}` },
        { label: "Name", value: (r) => r.full_name || "" },
        { label: "Email", value: (r) => r.email || "" },
        { label: "Phone", value: (r) => r.phone || "" },
        { label: "Interests", value: (r) => r.total_properties || 0 },
      ]
    );
  };

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Buyer Directory"
        sub="Registered buyers, their contact lines and asset interests across the platform."
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
        Buyer <span className="lp-accent">Directory</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder="Search by name, email or buyer ID…"
      />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">Buyers</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(buyers.length)} records`}
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
        title="Buyer Profile"
        sub="Directory record as reported by the platform."
      >
        {view && (
          <>
            <div className="lp-profile-hero">
              <Avatar name={view.full_name} lg />
              <div className="lp-profile-name">{view.full_name || "—"}</div>
              <div className="lp-profile-mail">{view.email || "No email on file"}</div>
            </div>
            <div className="lp-profile-grid">
              <div className="lp-info-card">
                <div className="k">Buyer ID</div>
                <div className="v lp-mono">BUY-{view.id}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Phone</div>
                <div className="v">{view.phone || "Not provided"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Interested Assets</div>
                <div className="v">{fmtNum(view.total_properties || 0)}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Record Type</div>
                <div className="v">Buyer</div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Buyers;
