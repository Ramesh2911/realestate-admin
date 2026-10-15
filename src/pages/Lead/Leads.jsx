import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaDownload,
  FaEye,
  FaBullseye,
  FaCheckCircle,
  FaBolt,
  FaUsers,
  FaBuilding,
  FaClock,
} from "react-icons/fa";
import {
  getLeadsApi,
  createLeadApi,
  updateLeadApi,
  deleteLeadApi,
  getAllInterestsApi,
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
  Avatar,
} from "../../components/ListUI";
import {
  useDebounced,
  fmtNum,
  formatCr,
  parseMoney,
  downloadCsv,
  fmtWhen,
} from "../../utils/list";

const REQ_EMPTY = {
  title: "No requirements found",
  sub: "Adjust the search, or add a new buyer requirement.",
};

const INT_EMPTY = {
  title: "No interests found",
  sub: "Buyer inquiries on properties will appear here.",
};

const STATUS_TONE = { New: "blue", Contacted: "amber", Converted: "green", Lost: "red" };
const toneFor = (s) => STATUS_TONE[s] || "slate";

const PURPOSES = ["Buy", "Rent", "Sell", "Lease"];
const TYPES = ["Apartment", "House", "Villa", "Plot", "Commercial", "Office", "Warehouse", "Other"];
const STATUSES = ["New", "Contacted", "Converted", "Lost"];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  title: "",
  purpose: "Buy",
  property_type: "",
  min_budget: "",
  max_budget: "",
  city: "",
  beds: "",
  baths: "",
  min_area: "",
  max_area: "",
  amenities: "",
  notes: "",
  status: "New",
};

const budgetLabel = (r) => {
  const min = Number(r.min_budget) || 0;
  const max = Number(r.max_budget) || 0;
  if (min && max) return `${formatCr(min)} – ${formatCr(max)}`;
  if (max) return `up to ${formatCr(max)}`;
  if (min) return `from ${formatCr(min)}`;
  return "—";
};

const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v) || 0);

const Leads = () => {
  const [tab, setTab] = useState("req");
  const [reqs, setReqs] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [formId, setFormId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formBusy, setFormBusy] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const [viewInt, setViewInt] = useState(null);
  const dq = useDebounced(q, 300);

  const loadData = useCallback(async () => {
    setError(null);
    const [a, b] = await Promise.allSettled([
      getLeadsApi(),
      getAllInterestsApi(),
    ]);
    if (a.status === "fulfilled") {
      const d = a.value?.data?.data || a.value?.data || [];
      setReqs(Array.isArray(d) ? d : []);
    } else {
      setError(a.reason?.message || "Unable to load requirements. Please retry.");
    }
    if (b.status === "fulfilled") {
      const d = b.value?.data?.data || b.value?.data || [];
      setInterests(Array.isArray(d) ? d : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  const switchTab = (t) => {
    setTab(t);
    setPage(1);
    setStatus("all");
  };

  const onSearch = (v) => {
    setQ(v);
    setPage(1);
  };

  const onStatus = (k) => {
    setStatus(k);
    setPage(1);
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setFormId(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
  };

  const openEdit = (r) => {
    setFormId(r.id);
    setForm({
      name: r.name || "",
      phone: r.phone || "",
      email: r.email || "",
      title: r.title || "",
      purpose: r.purpose || "Buy",
      property_type: r.property_type || "",
      min_budget: r.min_budget ?? "",
      max_budget: r.max_budget ?? "",
      city: r.city || "",
      beds: r.beds ?? "",
      baths: r.baths ?? "",
      min_area: r.min_area ?? "",
      max_area: r.max_area ?? "",
      amenities: r.amenities || "",
      notes: r.notes || "",
      status: r.status || "New",
    });
    setFormOpen(true);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      title: form.title || null,
      purpose: form.purpose,
      property_type: form.property_type || null,
      min_budget: toNum(form.min_budget),
      max_budget: toNum(form.max_budget),
      city: form.city || null,
      beds: toNum(form.beds),
      baths: toNum(form.baths),
      min_area: toNum(form.min_area),
      max_area: toNum(form.max_area),
      amenities: form.amenities || null,
      notes: form.notes || null,
      ...(formId ? { status: form.status } : {}),
    };
    try {
      if (formId) {
        await updateLeadApi(formId, payload);
        toast.success("Requirement updated.");
      } else {
        await createLeadApi(payload);
        toast.success("Requirement created.");
      }
      setFormOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save requirement.");
    } finally {
      setFormBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDelBusy(true);
    try {
      await deleteLeadApi(delTarget.id);
      setDelTarget(null);
      toast.success("Requirement deleted.");
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete requirement.");
    } finally {
      setDelBusy(false);
    }
  };

  const filteredReqs = useMemo(() => {
    const s = dq.trim().toLowerCase();
    return reqs.filter((r) => {
      if (status !== "all" && (r.status || "New") !== status) return false;
      if (!s) return true;
      return [r.name, r.email, r.phone, r.title, r.city, `ld-${r.id}`, String(r.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s));
    });
  }, [reqs, dq, status]);

  const filteredInts = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return interests;
    return interests.filter((r) =>
      [
        r.buyer_name,
        r.buyer_email,
        r.buyer_phone,
        r.property_title,
        r.city,
        r.message,
        `in-${r.id}`,
        String(r.id),
      ]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [interests, dq]);

  const filtered = tab === "req" ? filteredReqs : filteredInts;

  const reqStats = useMemo(() => {
    const total = reqs.length;
    const converted = reqs.filter((r) => r.status === "Converted").length;
    const fresh = reqs.filter((r) => (r.status || "New") === "New").length;
    const rate = total ? Math.round((converted / total) * 100) : 0;
    return [
      { label: "Total Requirements", value: fmtNum(total), icon: FaBullseye, tone: "blue" },
      { label: "Fresh Intake", value: fmtNum(fresh), sub: "awaiting first contact", icon: FaClock, tone: "amber" },
      { label: "Conversions", value: fmtNum(converted), sub: "closed from pipeline", icon: FaCheckCircle, tone: "green" },
      { label: "Conversion Rate", value: `${rate}%`, sub: "converted ÷ total", icon: FaBolt, tone: "slate" },
    ];
  }, [reqs]);

  const intStats = useMemo(() => {
    const total = interests.length;
    const buyers = new Set(
      interests.map((i) => i.user_id || i.buyer_email || i.buyer_name).filter(Boolean)
    ).size;
    const props = new Set(interests.map((i) => i.property_id).filter(Boolean)).size;
    const week = interests.filter((i) => {
      const t = new Date(i.created_at || 0).getTime();
      return Number.isFinite(t) && Date.now() - t < 7 * 86400000;
    }).length;
    return [
      { label: "Total Interests", value: fmtNum(total), icon: FaBolt, tone: "blue" },
      { label: "Engaged Buyers", value: fmtNum(buyers), sub: "unique buyer accounts", icon: FaUsers, tone: "green" },
      { label: "Properties Targeted", value: fmtNum(props), sub: "distinct listings", icon: FaBuilding, tone: "slate" },
      { label: "Last 7 Days", value: fmtNum(week), sub: "recent inquiries", icon: FaClock, tone: "amber" },
    ];
  }, [interests]);

  const stats = tab === "req" ? reqStats : intStats;

  const pills = useMemo(() => {
    const count = (s) => reqs.filter((r) => (r.status || "New") === s).length;
    return [
      { key: "all", label: "All", count: reqs.length },
      { key: "New", label: "New", count: count("New") },
      { key: "Contacted", label: "Contacted", count: count("Contacted") },
      { key: "Converted", label: "Converted", count: count("Converted") },
      { key: "Lost", label: "Lost", count: count("Lost") },
    ];
  }, [reqs]);

  const reqColumns = [
    {
      key: "id",
      label: "Lead ID",
      sortable: true,
      width: "95px",
      cell: (r) => <span className="lp-id">#LD-{r.id}</span>,
    },
    {
      key: "name",
      label: "Client",
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
      key: "title",
      label: "Requirement",
      sortable: true,
      cell: (r) => (
        <div style={{ minWidth: 0 }}>
          <div className="lp-user-name" title={r.title || "Untitled requirement"}>
            {r.title || "Untitled requirement"}
          </div>
          <div className="lp-cell-sub">
            {[r.purpose, r.property_type].filter(Boolean).join(" · ") || "Any preference"}
          </div>
        </div>
      ),
    },
    {
      key: "min_budget",
      label: "Budget",
      sortable: true,
      sortValue: (r) => Number(r.min_budget) || Number(r.max_budget) || 0,
      align: "right",
      cell: (r) => <span className="lp-money">{budgetLabel(r)}</span>,
    },
    {
      key: "city",
      label: "Location",
      sortable: true,
      cell: (r) => (
        <div style={{ minWidth: 0 }}>
          <div className="lp-user-name">{r.city || "Any city"}</div>
          <div className="lp-cell-sub">
            {[r.beds ? `${r.beds} bed` : "", r.baths ? `${r.baths} bath` : ""]
              .filter(Boolean)
              .join(" · ") || "Any layout"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => r.status || "New",
      cell: (r) => <StatusPill tone={toneFor(r.status || "New")}>{r.status || "New"}</StatusPill>,
    },
    {
      key: "created_at",
      label: "Received",
      sortable: true,
      sortValue: (r) => new Date(r.created_at || 0).getTime() || 0,
      width: "105px",
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
            title="Edit requirement"
            aria-label={`Edit lead ${r.id}`}
            onClick={() => openEdit(r)}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="lp-icon-btn tone-red"
            title="Delete requirement"
            aria-label={`Delete lead ${r.id}`}
            onClick={() => setDelTarget(r)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const intColumns = [
    {
      key: "id",
      label: "Interest ID",
      sortable: true,
      width: "95px",
      cell: (r) => <span className="lp-id">#IN-{r.id}</span>,
    },
    {
      key: "buyer_name",
      label: "Buyer",
      sortable: true,
      cell: (r) => (
        <div className="lp-user">
          <Avatar name={r.buyer_name} tone="alt" />
          <div style={{ minWidth: 0 }}>
            <div className="lp-user-name">{r.buyer_name || "Guest buyer"}</div>
            <div className="lp-cell-sub">{r.buyer_email || r.buyer_phone || "No contact"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "property_title",
      label: "Property",
      sortable: true,
      cell: (r) => (
        <div className="lp-user" style={{ justifyContent: "space-between" }}>
          <div style={{ minWidth: 0 }}>
            <div className="lp-user-name">{r.property_title || "—"}</div>
            <div className="lp-cell-sub">
              {[r.city, r.address].filter(Boolean).join(" · ") || "Location N/A"}
            </div>
          </div>
          {r.price ? (
            <span className="lp-money">₹{fmtNum(parseMoney(r.price))}</span>
          ) : null}
        </div>
      ),
    },
    {
      key: "message",
      label: "Message",
      cell: (r) =>
        r.message ? (
          <span
            className="lp-cell-sub"
            title={r.message}
            style={{
              display: "block",
              maxWidth: 190,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {r.message}
          </span>
        ) : (
          <span className="lp-muted">—</span>
        ),
    },
    {
      key: "owner_name",
      label: "Owner",
      sortable: true,
      cell: (r) => (
        <div style={{ minWidth: 0 }}>
          <div className="lp-user-name">{r.owner_name || "—"}</div>
          <div className="lp-cell-sub">{r.owner_email || ""}</div>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Received",
      sortable: true,
      sortValue: (r) => new Date(r.created_at || 0).getTime() || 0,
      width: "105px",
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
            title="View interest"
            aria-label={`View interest ${r.id}`}
            onClick={() => setViewInt(r)}
          >
            <FaEye />
          </button>
        </div>
      ),
    },
  ];

  const columns = tab === "req" ? reqColumns : intColumns;

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * perPage, cur * perPage);

  const exportCsv = () => {
    const day = new Date().toISOString().slice(0, 10);
    if (tab === "req") {
      downloadCsv(`requirements-${day}.csv`, filtered, [
        { label: "Lead ID", value: (r) => `LD-${r.id}` },
        { label: "Name", value: (r) => r.name || "" },
        { label: "Phone", value: (r) => r.phone || "" },
        { label: "Email", value: (r) => r.email || "" },
        { label: "Title", value: (r) => r.title || "" },
        { label: "Purpose", value: (r) => r.purpose || "" },
        { label: "Property Type", value: (r) => r.property_type || "" },
        { label: "Min Budget", value: (r) => r.min_budget ?? "" },
        { label: "Max Budget", value: (r) => r.max_budget ?? "" },
        { label: "City", value: (r) => r.city || "" },
        { label: "Beds", value: (r) => r.beds ?? "" },
        { label: "Baths", value: (r) => r.baths ?? "" },
        { label: "Status", value: (r) => r.status || "New" },
        { label: "Created", value: (r) => r.created_at || "" },
      ]);
    } else {
      downloadCsv(`interests-${day}.csv`, filtered, [
        { label: "Interest ID", value: (r) => `IN-${r.id}` },
        { label: "Buyer", value: (r) => r.buyer_name || "" },
        { label: "Buyer Email", value: (r) => r.buyer_email || "" },
        { label: "Buyer Phone", value: (r) => r.buyer_phone || "" },
        { label: "Property", value: (r) => r.property_title || "" },
        { label: "City", value: (r) => r.city || "" },
        { label: "Price", value: (r) => r.price ?? "" },
        { label: "Owner", value: (r) => r.owner_name || "" },
        { label: "Message", value: (r) => r.message || "" },
        { label: "Received", value: (r) => r.created_at || "" },
      ]);
    }
  };

  const filtersActive = q !== "" || (tab === "req" && status !== "all");

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Lead Engine"
        sub="Buyer requirements with full pipeline control, plus live property interest signals."
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
            {tab === "req" && (
              <button
                type="button"
                className="lp-btn lp-btn-primary"
                onClick={openCreate}
              >
                <FaPlus size={12} />
                New Requirement
              </button>
            )}
          </>
        }
      >
        Lead <span className="lp-accent">Pipeline</span>
      </ListHero>

      <div className="lp-tabs" role="tablist" aria-label="Lead views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "req"}
          className={`lp-tab ${tab === "req" ? "active" : ""}`}
          onClick={() => switchTab("req")}
        >
          Requirements
          <span className="lp-tab-count">{fmtNum(reqs.length)}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "int"}
          className={`lp-tab ${tab === "int" ? "active" : ""}`}
          onClick={() => switchTab("int")}
        >
          Interests
          <span className="lp-tab-count">{fmtNum(interests.length)}</span>
        </button>
      </div>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder={
          tab === "req"
            ? "Search client, title, city or lead ID…"
            : "Search buyer, property, city or message…"
        }
        pills={tab === "req" ? pills : undefined}
        activePill={tab === "req" ? status : undefined}
        onPill={tab === "req" ? onStatus : undefined}
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
            <div className="lp-panel-title">
              {tab === "req" ? "Buyer Requirements" : "Property Interests"}
            </div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(
                    (tab === "req" ? reqs : interests).length
                  )} records`}
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
          empty={tab === "req" ? REQ_EMPTY : INT_EMPTY}
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
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="lg"
        title={formId ? "Edit Requirement" : "New Requirement"}
        sub={
          formId
            ? `Lead #LD-${formId} · updates sync to the pipeline instantly`
            : "Capture a buyer's brief — budgets, layout and city preferences."
        }
        footer={
          <>
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={() => setFormOpen(false)}
              disabled={formBusy}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="lead-form"
              className="lp-btn lp-btn-primary"
              disabled={formBusy}
            >
              {formBusy && <span className="lp-spin" style={{ display: "inline-flex" }} />}
              {formId ? "Save changes" : "Create requirement"}
            </button>
          </>
        }
      >
        <form id="lead-form" className="lp-form-grid" onSubmit={saveForm}>
          {!formId && (
            <>
              <div className="lp-field">
                <label htmlFor="ld-name">Full Name *</label>
                <input
                  id="ld-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setF("name", e.target.value)}
                  placeholder="e.g. Priya Menon"
                />
              </div>
              <div className="lp-field">
                <label htmlFor="ld-phone">Phone *</label>
                <input
                  id="ld-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setF("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div className="lp-field full">
                <label htmlFor="ld-email">Email</label>
                <input
                  id="ld-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setF("email", e.target.value)}
                  placeholder="optional"
                />
              </div>
            </>
          )}

          <div className="lp-field full">
            <label htmlFor="ld-title">Requirement Title</label>
            <input
              id="ld-title"
              type="text"
              value={form.title}
              onChange={(e) => setF("title", e.target.value)}
              placeholder="e.g. 3BHK sea-facing apartment in Bandra"
            />
          </div>

          <div className="lp-field">
            <label htmlFor="ld-purpose">Purpose</label>
            <select
              id="ld-purpose"
              value={form.purpose}
              onChange={(e) => setF("purpose", e.target.value)}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="lp-field">
            <label htmlFor="ld-type">Property Type</label>
            <select
              id="ld-type"
              value={form.property_type}
              onChange={(e) => setF("property_type", e.target.value)}
            >
              <option value="">Any type</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="lp-field">
            <label htmlFor="ld-min">Min Budget (₹)</label>
            <input
              id="ld-min"
              type="number"
              min="0"
              value={form.min_budget}
              onChange={(e) => setF("min_budget", e.target.value)}
              placeholder="e.g. 5000000"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="ld-max">Max Budget (₹)</label>
            <input
              id="ld-max"
              type="number"
              min="0"
              value={form.max_budget}
              onChange={(e) => setF("max_budget", e.target.value)}
              placeholder="e.g. 12000000"
            />
          </div>

          <div className="lp-field">
            <label htmlFor="ld-city">City</label>
            <input
              id="ld-city"
              type="text"
              value={form.city}
              onChange={(e) => setF("city", e.target.value)}
              placeholder="e.g. Mumbai"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="ld-status">Status</label>
            <select
              id="ld-status"
              value={form.status}
              onChange={(e) => setF("status", e.target.value)}
              disabled={!formId}
              style={!formId ? { opacity: 0.65 } : undefined}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="lp-field">
            <label htmlFor="ld-beds">Bedrooms</label>
            <input
              id="ld-beds"
              type="number"
              min="0"
              value={form.beds}
              onChange={(e) => setF("beds", e.target.value)}
              placeholder="e.g. 3"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="ld-baths">Bathrooms</label>
            <input
              id="ld-baths"
              type="number"
              min="0"
              value={form.baths}
              onChange={(e) => setF("baths", e.target.value)}
              placeholder="e.g. 2"
            />
          </div>

          <div className="lp-field">
            <label htmlFor="ld-minarea">Min Area (sq ft)</label>
            <input
              id="ld-minarea"
              type="number"
              min="0"
              value={form.min_area}
              onChange={(e) => setF("min_area", e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="ld-maxarea">Max Area (sq ft)</label>
            <input
              id="ld-maxarea"
              type="number"
              min="0"
              value={form.max_area}
              onChange={(e) => setF("max_area", e.target.value)}
              placeholder="optional"
            />
          </div>

          <div className="lp-field full">
            <label htmlFor="ld-amen">Amenities</label>
            <input
              id="ld-amen"
              type="text"
              value={form.amenities}
              onChange={(e) => setF("amenities", e.target.value)}
              placeholder="e.g. gym, pool, clubhouse (comma separated)"
            />
          </div>

          <div className="lp-field full">
            <label htmlFor="ld-notes">Notes</label>
            <textarea
              id="ld-notes"
              value={form.notes}
              onChange={(e) => setF("notes", e.target.value)}
              placeholder="Anything else the team should know…"
            />
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!delTarget}
        title="Delete this requirement?"
        message={
          delTarget
            ? `#${delTarget.name || "this client"} — “${
                delTarget.title || "Untitled requirement"
              }” will be removed from the pipeline. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        busy={delBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDelTarget(null)}
      />

      <Modal
        open={!!viewInt}
        onClose={() => setViewInt(null)}
        title="Interest Record"
        sub={viewInt ? `#IN-${viewInt.id} · property inquiry` : ""}
      >
        {viewInt && (
          <>
            <div className="lp-profile-hero">
              <Avatar name={viewInt.buyer_name} tone="alt" lg />
              <div className="lp-profile-name">
                {viewInt.buyer_name || "Guest buyer"}
              </div>
              <div className="lp-profile-mail">
                {viewInt.buyer_email || "No email on file"}
              </div>
              <div style={{ marginTop: 10 }}>
                <StatusPill tone="blue">
                  {viewInt.status || "Interested"}
                </StatusPill>
              </div>
            </div>
            <div className="lp-profile-grid">
              <div className="lp-info-card">
                <div className="k">Buyer Phone</div>
                <div className="v">{viewInt.buyer_phone || "Not provided"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Received</div>
                <div className="v">{fmtWhen(viewInt.created_at)}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Property</div>
                <div className="v">{viewInt.property_title || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Valuation</div>
                <div className="v">
                  {viewInt.price ? `₹${fmtNum(parseMoney(viewInt.price))}` : "—"}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Location</div>
                <div className="v">
                  {[viewInt.address, viewInt.city].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Property Owner</div>
                <div className="v">
                  {viewInt.owner_name || "—"}
                  {viewInt.owner_email ? ` · ${viewInt.owner_email}` : ""}
                </div>
              </div>
            </div>
            <div className="lp-desc">
              <div className="k">Buyer Message</div>
              <p>{viewInt.message || "No message provided with this inquiry."}</p>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Leads;
