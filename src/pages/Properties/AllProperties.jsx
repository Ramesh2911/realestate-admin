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
} from "react-icons/fa";
import {
  getPropertyApi,
  approvePropertyApi,
  rejectPropertyApi,
  deletePropertyApi,
} from "../../services/auth.api";
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
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
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
      cell: (r) => <StatusPill tone={statusTone(statusOf(r))}>{statusOf(r)}</StatusPill>,
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
      cell: (r) => (
        <div className="lp-actions-cell">
          <button
            type="button"
            className="lp-icon-btn tone-blue"
            title="View details"
            aria-label={`View property ${r.id}`}
            onClick={() => setView(r)}
          >
            <FaEye />
          </button>
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
        sub={view ? `#PROP-${view.id} · listed inventory record` : ""}
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
                  {view.address
                    ? view.address
                    : ""}
                  {view.city ? `${view.address ? " · " : ""}${view.city}` : ""}
                  {view.state ? `, ${view.state}` : ""}
                </span>
                <StatusPill tone={statusTone(statusOf(view))}>
                  {statusOf(view)}
                </StatusPill>
                <VerifyChips
                  superStatus={view.super_admin_status || "Pending"}
                  adminA={view.admin_a_status || "Pending"}
                  adminB={view.admin_b_status || "Pending"}
                />
              </div>
              <div className="lp-detail-price">
                ₹{fmtNum(
                  Number(String(view.price ?? "").replace(/[^0-9.]/g, "")) || 0
                )}
              </div>
            </div>

            <div className="lp-profile-grid" style={{ marginTop: 14 }}>
              <div className="lp-info-card">
                <div className="k">Property Type</div>
                <div className="v">{view.property_type || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Purpose</div>
                <div className="v">{view.property_for || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Configuration</div>
                <div className="v">
                  {view.bedroom ? `${view.bedroom} bed` : ""}
                  {view.bedroom && view.bathroom ? " · " : ""}
                  {view.bathroom ? `${view.bathroom} bath` : ""}
                  {!view.bedroom && !view.bathroom ? "—" : ""}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Area</div>
                <div className="v">
                  {view.area
                    ? `${fmtNum(view.area)} ${view.area_unit || "sq ft"}`
                    : "—"}
                </div>
              </div>
            </div>

            {view.description && (
              <div className="lp-desc">
                <div className="k">Description</div>
                <p>{view.description}</p>
              </div>
            )}

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
