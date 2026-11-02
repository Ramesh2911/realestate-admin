import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaUsers,
  FaEye,
  FaSyncAlt,
  FaDownload,
} from "react-icons/fa";
import { getLoansApi } from "../../services/auth.api";
import {
  ListHero,
  StatGrid,
  Toolbar,
  ListTable,
  Pager,
  Modal,
  Avatar,
} from "../../components/ListUI";
import { useDebounced, fmtNum, downloadCsv, fmtWhen } from "../../utils/list";

const EMPTY = {
  title: "No loan applications found",
  sub: "Applications submitted from the website will appear here.",
};

const fmtInr = (n) => {
  const v = Number(n) || 0;
  return `₹${v.toLocaleString("en-IN")}`;
};

const Loans = () => {
  const [loans, setLoans] = useState([]);
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
      const res = await getLoansApi();
      const data = res?.data?.data || res || [];
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load loan applications. Please try again.");
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
    if (!s) return loans;
    return loans.filter((l) =>
      [l.name, l.email, l.phone, `LN-${l.id}`, String(l.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [loans, dq]);

  const stats = useMemo(() => {
    const total = loans.length;
    const totalAmount = loans.reduce((acc, l) => acc + (Number(l.amount) || 0), 0);
    const week = loans.filter((l) => {
      const t = new Date(l.created_at || 0).getTime();
      return Number.isFinite(t) && Date.now() - t < 7 * 86400000;
    }).length;
    return [
      { label: "Total Applications", value: fmtNum(total), icon: FaMoneyBillWave, tone: "green" },
      { label: "Requested Amount", value: fmtInr(totalAmount), sub: "combined loan value", icon: FaCheckCircle, tone: "blue" },
      { label: "Last 7 Days", value: fmtNum(week), sub: "recent applications", icon: FaUsers, tone: "slate" },
    ];
  }, [loans]);

  const columns = [
    {
      key: "id",
      label: "Loan ID",
      sortable: true,
      width: "110px",
      cell: (r) => <span className="lp-id">#LN-{r.id}</span>,
    },
    {
      key: "name",
      label: "Applicant",
      sortable: true,
      cell: (r) => (
        <div className="lp-user">
          <Avatar name={r.name} />
          <div style={{ minWidth: 0 }}>
            <div className="lp-user-name">{r.name || "—"}</div>
            <div className="lp-cell-sub">{r.email || r.phone || "No contact"}</div>
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
      key: "email",
      label: "Email",
      cell: (r) =>
        r.email ? (
          <span className="lp-nowrap">{r.email}</span>
        ) : (
          <span className="lp-muted">Not provided</span>
        ),
    },
    {
      key: "amount",
      label: "Loan Amount",
      sortable: true,
      sortValue: (r) => Number(r.amount) || 0,
      align: "right",
      cell: (r) => <span className="lp-money">{fmtInr(r.amount)}</span>,
    },
    {
      key: "created_at",
      label: "Applied On",
      sortable: true,
      sortValue: (r) => new Date(r.created_at || 0).getTime() || 0,
      width: "120px",
      cell: (r) => <span className="lp-muted">{fmtWhen(r.created_at)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      cell: (r) => (
        <div className="lp-actions-cell">
          <button
            type="button"
            className="lp-icon-btn tone-blue"
            title="View application"
            aria-label={`View loan ${r.id}`}
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
      `loan-applications-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { label: "Loan ID", value: (r) => `LN-${r.id}` },
        { label: "Name", value: (r) => r.name || "" },
        { label: "Phone", value: (r) => r.phone || "" },
        { label: "Email", value: (r) => r.email || "" },
        { label: "Amount", value: (r) => r.amount || 0 },
        { label: "Applied On", value: (r) => r.created_at || "" },
      ]
    );
  };

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Loan Desk"
        sub="Home loan applications submitted by visitors through the website."
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
        Loan <span className="lp-accent">Applications</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder="Search by name, phone, email or loan ID…"
      />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">Applications</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(loans.length)} records`}
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
          initialSort={{ key: "created_at", dir: "desc" }}
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
        title="Loan Application"
        sub={view ? `#LN-${view.id} · website submission` : ""}
      >
        {view && (
          <>
            <div className="lp-profile-hero">
              <Avatar name={view.name} lg />
              <div className="lp-profile-name">{view.name || "—"}</div>
              <div className="lp-profile-mail">{view.email || "No email on file"}</div>
            </div>
            <div className="lp-profile-grid">
              <div className="lp-info-card">
                <div className="k">Loan ID</div>
                <div className="v lp-mono">LN-{view.id}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Phone</div>
                <div className="v">{view.phone || "Not provided"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Loan Amount</div>
                <div className="v">{fmtInr(view.amount)}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Applied On</div>
                <div className="v">{fmtWhen(view.created_at)}</div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Loans;
