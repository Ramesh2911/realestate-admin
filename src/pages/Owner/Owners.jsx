import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaUsers,
  FaHome,
  FaBuilding,
  FaEye,
  FaSyncAlt,
  FaDownload,
} from "react-icons/fa";
import { getOwnerApi } from "../../services/auth.api";
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
  title: "No owners found",
  sub: "Try a different name, email or owner ID.",
};

const Owners = () => {
  const [owners, setOwners] = useState([]);
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
      const res = await getOwnerApi();
      const data = res?.data?.data || res || [];
      setOwners(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load owners. Please try again.");
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
    if (!s) return owners;
    return owners.filter((o) =>
      [o.full_name, o.email, o.phone, `own-${o.id}`, String(o.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [owners, dq]);

  const stats = useMemo(() => {
    const units = owners.reduce(
      (acc, o) => acc + (parseInt(o.total_properties, 10) || 0),
      0
    );
    const withListings = owners.filter(
      (o) => (parseInt(o.total_properties, 10) || 0) > 0
    ).length;
    return [
      { label: "Registered Owners", value: fmtNum(owners.length), icon: FaUsers, tone: "blue" },
      { label: "Listed Units", value: fmtNum(units), sub: "across the marketplace", icon: FaHome, tone: "green" },
      { label: "Owners With Listings", value: fmtNum(withListings), sub: `${owners.length - withListings} without listings`, icon: FaBuilding, tone: "slate" },
    ];
  }, [owners]);

  const columns = [
    {
      key: "id",
      label: "Owner ID",
      sortable: true,
      width: "110px",
      cell: (r) => <span className="lp-id">#OWN-{r.id}</span>,
    },
    {
      key: "full_name",
      label: "Owner",
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
      `owners-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { label: "Owner ID", value: (r) => `OWN-${r.id}` },
        { label: "Name", value: (r) => r.full_name || "" },
        { label: "Email", value: (r) => r.email || "" },
        { label: "Phone", value: (r) => r.phone || "" },
        { label: "Properties", value: (r) => r.total_properties || 0 },
      ]
    );
  };

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="User Directory"
        sub="Every property owner registered on the platform, with their listed inventory in one place."
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
        Property <span className="lp-accent">Owners</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder="Search by name, email or owner ID…"
      />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">Owners</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(owners.length)} records`}
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
        title="Owner Profile"
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
                <div className="k">Owner ID</div>
                <div className="v lp-mono">OWN-{view.id}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Phone</div>
                <div className="v">{view.phone || "Not provided"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Listed Properties</div>
                <div className="v">{fmtNum(view.total_properties || 0)}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Record Type</div>
                <div className="v">Property Owner</div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Owners;
