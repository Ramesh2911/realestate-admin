import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaEye,
  FaCheck,
  FaTimes,
  FaTrash,
  FaSyncAlt,
  FaDownload,
  FaPlus,
  FaStar,
  FaEdit,
} from "react-icons/fa";
import {
  getPropertyApi,
  getPropertyByIdApi,
  approvePropertyApi,
  rejectPropertyApi,
  deletePropertyApi,
  makeFeaturedApi,
} from "../../services/auth.api";
import PropertyEditModal from "./PropertyEditModal";
import {
  ListHero,
  StatGrid,
  Toolbar,
  ListTable,
  Pager,
  Modal,
  Confirm,
  StatusPill,
  VerifyChips,
} from "../../components/ListUI";
import {
  useDebounced,
  fmtNum,
  formatCr,
  downloadCsv,
} from "../../utils/list";

const EMPTY = {
  title: "No properties found",
  sub: "Try a different title, city or property ID.",
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
const API_ORIGIN = API_BASE.replace(/\/api\/v\d+\/?$/, "");

const resolveImageUrl = (src) => {
  if (!src) return "";
  const value = String(src).trim();
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || /^(data|blob):/i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
};

const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusOf = (r) => r.property_status || "Pending";

const statusGroup = (s) => {
  if (s === "Approved" || s === "Available") return "Approved";
  if (s === "Rejected") return "Rejected";
  return "Pending";
};

const statusTone = (s) => {
  const g = statusGroup(s);
  if (g === "Approved") return "green";
  if (g === "Rejected") return "red";
  return "amber";
};

const AllProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [view, setView] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const [editId, setEditId] = useState(null);
  const dq = useDebounced(q, 300);

  const roleId = useMemo(
    () =>
      Number(
        JSON.parse(localStorage.getItem("user") || "{}").role_id ?? NaN
      ),
    []
  );

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const response = await getPropertyApi();
      const data = response?.data?.data || response?.data || response || [];
      const fresh = Array.isArray(data) ? data : [];
      setProperties(fresh);
      setView((prev) =>
        prev ? fresh.find((x) => x.id === prev.id) || prev : null
      );
    } catch (err) {
      setError(err?.message || "Unable to load properties. Please try again.");
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

  const onCity = (v) => {
    setCity(v);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const s = dq.trim().toLowerCase();
    return properties.filter((p) => {
      if (status !== "all" && statusGroup(statusOf(p)) !== status) return false;
      if (city !== "all" && (p.city || "") !== city) return false;
      if (!s) return true;
      return [
        p.property_title || p.title,
        p.city,
        p.state,
        p.address,
        p.property_type,
        `prop-${p.id}`,
        String(p.id),
      ]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s));
    });
  }, [properties, dq, status, city]);

  const cities = useMemo(
    () =>
      Array.from(
        new Set(properties.map((p) => p.city).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b)),
    [properties]
  );

  const stats = useMemo(() => {
    const approved = properties.filter(
      (p) => statusGroup(statusOf(p)) === "Approved"
    ).length;
    const pending = properties.filter(
      (p) => statusGroup(statusOf(p)) === "Pending"
    ).length;
    const value = properties.reduce(
      (acc, p) => acc + (Number(String(p.price ?? "").replace(/[^0-9.]/g, "")) || 0),
      0
    );
    const pct = properties.length
      ? Math.round((approved / properties.length) * 100)
      : 0;
    return [
      { label: "Tracked Assets", value: fmtNum(properties.length), icon: FaBuilding, tone: "blue" },
      { label: "Approved & Live", value: fmtNum(approved), sub: `${pct}% of portfolio`, icon: FaCheckCircle, tone: "green" },
      { label: "Pending Review", value: fmtNum(pending), sub: "awaiting verification", icon: FaClock, tone: "amber" },
      { label: "Portfolio Value", value: formatCr(value), sub: "sum of listed prices", icon: FaRupeeSign, tone: "slate" },
    ];
  }, [properties]);

  const pills = useMemo(() => {
    const approved = properties.filter(
      (p) => statusGroup(statusOf(p)) === "Approved"
    ).length;
    const pending = properties.filter(
      (p) => statusGroup(statusOf(p)) === "Pending"
    ).length;
    return [
      { key: "all", label: "All", count: properties.length },
      { key: "Approved", label: "Approved", count: approved },
      { key: "Pending", label: "Pending", count: pending },
      { key: "Rejected", label: "Rejected", count: properties.length - approved - pending },
    ];
  }, [properties]);

  const isReviewed = useCallback(
    (row) => {
      const adminA = row.admin_a_status || "Pending";
      const adminB = row.admin_b_status || "Pending";
      const superAdmin = row.super_admin_status || "Pending";

      if (roleId === 2) return adminA !== "Pending";
      if (roleId === 3) return adminB !== "Pending";
      if (roleId === 1) {
        const consensus =
          (adminA === "Approved" && adminB === "Approved") ||
          (adminA === "Rejected" && adminB === "Rejected");
        return consensus || superAdmin !== "Pending";
      }
      return false;
    },
    [roleId]
  );

  const openView = async (row) => {
    setView(row);
    setViewLoading(true);
    try {
      const res = await getPropertyByIdApi(row.id);
      const full = res?.data?.data;
      if (full) setView((prev) => ({ ...(prev || row), ...full }));
    } catch {
      /* keep list-row fallback */
    } finally {
      setViewLoading(false);
    }
  };

  const executeStatusUpdate = async (id, type, comment) => {
    const toastId = toast.loading(
      `${type === "approve" ? "Approving" : "Rejecting"} property status…`
    );
    try {
      if (type === "approve") {
        await approvePropertyApi(id, { comments: comment, comment });
      } else {
        await rejectPropertyApi(id, { comments: comment, comment });
      }
      await loadData();
      toast.update(toastId, {
        render: "Property verification status updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(toastId, {
        render:
          err?.response?.data?.message || `Failed to ${type} property.`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const handleFeatured = async (row) => {
    const next = Number(row.featured) ? 0 : 1;
    const toastId = toast.loading(
      next ? "Marking property as featured…" : "Removing featured…"
    );
    try {
      await makeFeaturedApi(row.id, next);
      await loadData();
      toast.update(toastId, {
        render: next
          ? "Property marked as Featured."
          : "Property removed from Featured.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(toastId, {
        render: err?.response?.data?.message || "Failed to update featured.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  const handleApprove = (id) => {
    let commentText = "Verified and Approved";
    toast(
      ({ closeToast }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <strong style={{ fontSize: "13px", color: "#1b2b4b" }}>
            Approve Property #{id}
          </strong>
          <input
            type="text"
            defaultValue={commentText}
            onChange={(e) => {
              commentText = e.target.value;
            }}
            placeholder="Approval comment…"
            style={{
              padding: "6px 8px",
              borderRadius: "6px",
              border: "1px solid #dce8d8",
              fontSize: "12px",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "6px",
              justifyContent: "flex-end",
              marginTop: "4px",
            }}
          >
            <button
              onClick={closeToast}
              style={{
                padding: "5px 10px",
                background: "#F5FAF3",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                closeToast();
                executeStatusUpdate(id, "approve", commentText);
              }}
              style={{
                padding: "5px 12px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              Approve
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  };

  const handleReject = (id) => {
    let commentText = "Verification failed";
    toast(
      ({ closeToast }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <strong style={{ fontSize: "13px", color: "#dc2626" }}>
            Reject Property #{id}
          </strong>
          <input
            type="text"
            defaultValue={commentText}
            onChange={(e) => {
              commentText = e.target.value;
            }}
            placeholder="Rejection reason…"
            style={{
              padding: "6px 8px",
              borderRadius: "6px",
              border: "1px solid #dce8d8",
              fontSize: "12px",
            }}
          />
          <div
            style={{
              display: "flex",
              gap: "6px",
              justifyContent: "flex-end",
              marginTop: "4px",
            }}
          >
            <button
              onClick={closeToast}
              style={{
                padding: "5px 10px",
                background: "#F5FAF3",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                closeToast();
                executeStatusUpdate(id, "reject", commentText);
              }}
              style={{
                padding: "5px 12px",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }
    );
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDelBusy(true);
    try {
      await deletePropertyApi(delTarget.id);
      setDelTarget(null);
      toast.success("Property record deleted.");
      await loadData();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete property."
      );
    } finally {
      setDelBusy(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "Property ID",
      sortable: true,
      width: "115px",
      cell: (r) => <span className="lp-id">#PROP-{r.id}</span>,
    },
    {
      key: "property_title",
      label: "Listing",
      sortable: true,
      sortValue: (r) => r.property_title || r.title || "",
      cell: (r) => (
        <div style={{ minWidth: 0 }}>
          <div
            className="lp-user-name"
            title={r.property_title || r.title || "Untitled Property"}
          >
            {r.property_title || r.title || "Untitled Property"}
          </div>
          <div className="lp-cell-sub lp-nowrap">
            <FaMapMarkerAlt size={9} style={{ marginRight: 4 }} />
            {r.city
              ? `${r.city}${r.state ? `, ${r.state}` : ""}`
              : r.address || "Location N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Valuation",
      sortable: true,
      sortValue: (r) => Number(String(r.price ?? "").replace(/[^0-9.]/g, "")) || 0,
      align: "right",
      cell: (r) => (
        <span className="lp-money">
          ₹{fmtNum(Number(String(r.price ?? "").replace(/[^0-9.]/g, "")) || 0)}
        </span>
      ),
    },
    {
      key: "property_status",
      label: "Global Status",
      sortable: true,
      sortValue: (r) => statusGroup(statusOf(r)),
      cell: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <StatusPill tone={statusTone(statusOf(r))}>{statusOf(r)}</StatusPill>
          {Number(r.featured) ? (
            <StatusPill tone="amber">Featured</StatusPill>
          ) : null}
        </div>
      ),
    },
    {
      key: "verify",
      label: "Verifications",
      width: "118px",
      cell: (r) => (
        <VerifyChips
          superStatus={r.super_admin_status || "Pending"}
          adminA={r.admin_a_status || "Pending"}
          adminB={r.admin_b_status || "Pending"}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      width: "240px",
      cell: (r) => (
        <div className="lp-actions-cell">
          <button
            type="button"
            className="lp-icon-btn tone-blue"
            title="View details"
            aria-label={`View property ${r.id}`}
            onClick={() => {
              setEditId(null);
              openView(r);
            }}
          >
            <FaEye />
          </button>
          <button
            type="button"
            className="lp-icon-btn tone-amber"
            title="Edit property"
            aria-label={`Edit property ${r.id}`}
            onClick={() => {
              setView(null);
              setEditId(r.id);
            }}
          >
            <FaEdit />
          </button>
          {roleId === 1 && (
            <button
              type="button"
              className={`lp-icon-btn ${Number(r.featured) ? "tone-amber" : "tone-blue"}`}
              title={
                Number(r.featured)
                  ? "Remove from Featured Properties"
                  : "Mark as Featured Property"
              }
              aria-label={`Toggle featured for property ${r.id}`}
              onClick={() => handleFeatured(r)}
            >
              <FaStar
                style={{
                  color: Number(r.featured) ? "#f59e0b" : undefined,
                  fill: Number(r.featured) ? "#f59e0b" : "currentColor",
                }}
              />
            </button>
          )}
          {!isReviewed(r) ? (
            <>
              <button
                type="button"
                className="lp-icon-btn tone-green"
                title="Approve entry"
                aria-label={`Approve property ${r.id}`}
                onClick={() => handleApprove(r.id)}
              >
                <FaCheck />
              </button>
              <button
                type="button"
                className="lp-icon-btn tone-red"
                title="Reject entry"
                aria-label={`Reject property ${r.id}`}
                onClick={() => handleReject(r.id)}
              >
                <FaTimes />
              </button>
            </>
          ) : (
            <StatusPill tone="slate">Reviewed</StatusPill>
          )}
          <button
            type="button"
            className="lp-icon-btn tone-red"
            title="Delete record"
            aria-label={`Delete property ${r.id}`}
            onClick={() => setDelTarget(r)}
          >
            <FaTrash />
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
      `properties-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { label: "Property ID", value: (r) => `PROP-${r.id}` },
        { label: "Title", value: (r) => r.property_title || r.title || "" },
        { label: "Type", value: (r) => r.property_type || "" },
        { label: "City", value: (r) => r.city || "" },
        { label: "Address", value: (r) => r.address || "" },
        { label: "Price", value: (r) => r.price || 0 },
        { label: "Status", value: (r) => statusOf(r) },
        { label: "Admin A", value: (r) => r.admin_a_status || "Pending" },
        { label: "Admin B", value: (r) => r.admin_b_status || "Pending" },
        { label: "Super Admin", value: (r) => r.super_admin_status || "Pending" },
      ]
    );
  };

  const filtersActive = q !== "" || status !== "all" || city !== "all";

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Master Inventory"
        sub="Every listed asset with multi-tier verification state, valuation and review controls."
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
            <button
              type="button"
              className="lp-btn lp-btn-primary"
              onClick={() => navigate("/add-property")}
            >
              <FaPlus size={12} />
              Add Property
            </button>
          </>
        }
      >
        All Live <span className="lp-accent">Properties</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder="Search title, city, address or property ID…"
        pills={pills}
        activePill={status}
        onPill={onStatus}
        filters={
          <select
            className="lp-select"
            value={city}
            onChange={(e) => onCity(e.target.value)}
            aria-label="Filter by city"
          >
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        }
        activeCount={filtersActive ? "Filters active" : ""}
        onClear={
          filtersActive
            ? () => {
                setQ("");
                setStatus("all");
                setCity("all");
                setPage(1);
              }
            : null
        }
      />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">Properties</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(properties.length)} listings`}
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
          initialSort={{ key: "id", dir: "desc" }}
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
        size="lg"
        title="Property Details"
        sub={view ? `#PROP-${view.id} · full listing record` : ""}
      >
        {view && (
          <>
            <div className="lp-detail-head">
              <div className="lp-detail-title">
                {view.property_title || view.title || "Untitled Property"}
              </div>
              <div className="lp-detail-meta">
                <span className="where">
                  <FaMapMarkerAlt size={11} />
                  {[
                    view.address,
                    view.city,
                    view.state,
                    view.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Location N/A"}
                </span>
                <StatusPill tone={statusTone(statusOf(view))}>
                  {statusOf(view)}
                </StatusPill>
                {Number(view.featured) ? (
                  <StatusPill tone="amber">Featured</StatusPill>
                ) : null}
                <VerifyChips
                  superStatus={view.super_admin_status || "Pending"}
                  adminA={view.admin_a_status || "Pending"}
                  adminB={view.admin_b_status || "Pending"}
                />
              </div>
              <div className="lp-detail-price">
                ₹
                {fmtNum(
                  Number(String(view.price ?? "").replace(/[^0-9.]/g, "")) || 0
                )}
              </div>
            </div>

            {viewLoading && (
              <div className="lp-muted" style={{ fontSize: 12, marginTop: 8 }}>
                Loading full details…
              </div>
            )}

            <div className="lp-profile-grid" style={{ marginTop: 14 }}>
              <div className="lp-info-card">
                <div className="k">Posted By</div>
                <div className="v">{view.poster_name || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Contact Phone</div>
                <div className="v">
                  {view.poster_phone ? (
                    <a
                      href={`tel:${view.poster_phone}`}
                      style={{
                        color: "var(--primary-blue)",
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      {view.poster_phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">List For</div>
                <div className="v">{view.property_for || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Property Type</div>
                <div className="v">{view.property_type || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Category ID</div>
                <div className="v">
                  {view.category_id != null && view.category_id !== ""
                    ? `#${view.category_id}`
                    : "—"}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Area</div>
                <div className="v">
                  {view.area
                    ? `${fmtNum(view.area)} ${view.area_unit || "sq.ft"}`
                    : "—"}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Configuration</div>
                <div className="v">
                  {[
                    view.bedroom ? `${view.bedroom} bed` : "",
                    view.bathroom ? `${view.bathroom} bath` : "",
                    view.balcony ? `${view.balcony} balcony` : "",
                    view.parking ? `${view.parking} parking` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Furnishing</div>
                <div className="v">{view.furnishing || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Ownership</div>
                <div className="v">{view.ownership || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Construction</div>
                <div className="v">{view.construction_status || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Possession Date</div>
                <div className="v">{fmtDate(view.possession_date)}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Listed On</div>
                <div className="v">{fmtDate(view.created_at)}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Full Address</div>
                <div className="v">
                  {[view.address, view.city, view.state, view.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Pincode</div>
                <div className="v">{view.pincode || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Views</div>
                <div className="v">{view.view_count ?? 0}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Featured</div>
                <div className="v">{Number(view.featured) ? "Yes" : "No"}</div>
              </div>
            </div>

            <div className="lp-desc">
              <div className="k">Description</div>
              <p>{view.description || "No description provided."}</p>
            </div>

            <div className="lp-desc" style={{ marginTop: 12 }}>
              <div className="k">
                Gallery Images (
                {Array.isArray(view.images) ? view.images.length : 0})
              </div>
              {Array.isArray(view.images) && view.images.length > 0 ? (
                <div className="lp-detail-gallery">
                  {view.images.map((url, i) => (
                    <a
                      key={`img-${i}`}
                      href={resolveImageUrl(url)}
                      target="_blank"
                      rel="noreferrer"
                      title="Open full image"
                    >
                      <img src={resolveImageUrl(url)} alt="" />
                    </a>
                  ))}
                </div>
              ) : (
                <p>No gallery images uploaded.</p>
              )}
            </div>

            <div className="lp-desc" style={{ marginTop: 12 }}>
              <div className="k">
                Floor Plans (
                {Array.isArray(view.floor_plans)
                  ? view.floor_plans.length
                  : view.floor_plan_url || view.floor_plan
                    ? 1
                    : 0}
                )
              </div>
              {(() => {
                const plans = Array.isArray(view.floor_plans)
                  ? view.floor_plans
                  : view.floor_plan_url
                    ? [view.floor_plan_url]
                    : view.floor_plan
                      ? [`/uploads/property/floor-plans/${view.floor_plan}`]
                      : [];
                return plans.length > 0 ? (
                  <div className="lp-detail-gallery">
                    {plans.map((url, i) => (
                      <a
                        key={`fp-${i}`}
                        href={resolveImageUrl(url)}
                        target="_blank"
                        rel="noreferrer"
                        title="Open floor plan"
                      >
                        <img
                          className="plan"
                          src={resolveImageUrl(url)}
                          alt=""
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p>No floor plans uploaded.</p>
                );
              })()}
            </div>

            <div className="lp-desc" style={{ marginTop: 12 }}>
              <div className="k">
                Amenities (
                {Array.isArray(view.amenities) ? view.amenities.length : 0})
              </div>
              {Array.isArray(view.amenities) && view.amenities.length > 0 ? (
                <div className="lp-amenity-chips">
                  {view.amenities.map((a) => (
                    <span key={a.id ?? a.amenity_id} className="lp-kw">
                      {a.amenity_name}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No amenities selected.</p>
              )}
            </div>

            <div className="lp-verify-rows">
              <div className="lp-verify-row">
                <span className="lp-verify-role">Super Admin</span>
                <StatusPill tone={statusTone(view.super_admin_status || "Pending")}>
                  {view.super_admin_status || "Pending"}
                </StatusPill>
                <span className="lp-verify-note">
                  {view.super_admin_comment || "No comment recorded."}
                </span>
              </div>
              <div className="lp-verify-row">
                <span className="lp-verify-role">Admin A</span>
                <StatusPill tone={statusTone(view.admin_a_status || "Pending")}>
                  {view.admin_a_status || "Pending"}
                </StatusPill>
                <span className="lp-verify-note">
                  {view.admin_a_comment || "No comment recorded."}
                </span>
              </div>
              <div className="lp-verify-row">
                <span className="lp-verify-role">Admin B</span>
                <StatusPill tone={statusTone(view.admin_b_status || "Pending")}>
                  {view.admin_b_status || "Pending"}
                </StatusPill>
                <span className="lp-verify-note">
                  {view.admin_b_comment || "No comment recorded."}
                </span>
              </div>
            </div>
          </>
        )}
      </Modal>

      <PropertyEditModal
        open={!!editId}
        propertyId={editId}
        onClose={() => setEditId(null)}
        onSaved={() => {
          setLoading(true);
          loadData();
        }}
      />

      <Confirm
        open={!!delTarget}
        title="Delete this property?"
        message={
          delTarget
            ? `#${delTarget.id} — “${delTarget.property_title || delTarget.title || "Untitled Property"}” will be permanently removed from the inventory. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        busy={delBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDelTarget(null)}
      />
    </div>
  );
};

export default AllProperties;
