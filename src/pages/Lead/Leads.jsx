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
  FaNewspaper,
  FaMoneyBillWave,
  FaFeatherAlt,
  FaLayerGroup,
  FaListUl,
} from "react-icons/fa";
import {
  getLeadsApi,
  createLeadApi,
  updateLeadApi,
  deleteLeadApi,
  getAllInterestsApi,
  getNewsletterApi,
  deleteNewsletterApi,
  getLoansApi,
  getAllLeadsApi,
  getPropertyByIdApi,
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

const NEWS_EMPTY = {
  title: "No subscribers yet",
  sub: "Popup and in-page newsletter signups will appear here.",
};

const LOAN_EMPTY = {
  title: "No loan applications",
  sub: "Home loan inquiries from the website will appear here.",
};

const FOOTER_EMPTY = {
  title: "No footer subscribers",
  sub: "Emails captured from the footer newsletter form will appear here.",
};

const PROP_VIEW_EMPTY = {
  title: "No property-linked leads",
  sub: "Leads tied to a listing will be grouped here.",
};

// Newsletter tab shows every non-footer source (popup, app, website);
// Footer Subscribers tab shows only the footer newsletter form.
const isFooterSub = (s) => String(s?.source || "website").toLowerCase() === "footer";

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
  const [view, setView] = useState("account"); // "account" | "property" — point 17
  const [reqs, setReqs] = useState([]);
  const [interests, setInterests] = useState([]);
  const [news, setNews] = useState([]);
  const [loans, setLoans] = useState([]);
  const [propGroups, setPropGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propLoading, setPropLoading] = useState(false);
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
  const [propModal, setPropModal] = useState(null); // { loading, data, error }
  const dq = useDebounced(q, 300);

  const loadData = useCallback(async () => {
    setError(null);
    const [a, b, c, d] = await Promise.allSettled([
      getLeadsApi(),
      getAllInterestsApi(),
      getNewsletterApi(),
      getLoansApi(),
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
    if (c.status === "fulfilled") {
      const d = c.value?.data?.data || c.value?.data || [];
      setNews(Array.isArray(d) ? d : []);
    }
    if (d.status === "fulfilled") {
      const d = d.value?.data?.data || d.value?.data || [];
      setLoans(Array.isArray(d) ? d : []);
    }
    setLoading(false);
  }, []);

  const loadPropertyView = useCallback(async () => {
    setPropLoading(true);
    try {
      const res = await getAllLeadsApi("property");
      const d = res.data?.data || res.data || [];
      setPropGroups(Array.isArray(d) ? d : []);
    } catch {
      setPropGroups([]);
    } finally {
      setPropLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (view === "property") loadPropertyView();
  }, [view, loadPropertyView]);

  const handleRefresh = () => {
    setLoading(true);
    loadData();
    if (view === "property") loadPropertyView();
  };

  const switchTab = (t) => {
    setTab(t);
    setPage(1);
    setStatus("all");
  };

  const switchView = (v) => {
    setView(v);
    setPage(1);
    setQ("");
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
      if (delTarget.__kind === "newsletter") {
        await deleteNewsletterApi(delTarget.id);
        toast.success("Subscriber removed.");
      } else {
        await deleteLeadApi(delTarget.id);
        toast.success("Requirement deleted.");
      }
      setDelTarget(null);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete record.");
    } finally {
      setDelBusy(false);
    }
  };

  const openPropPopup = async (row) => {
    if (!row?.property_id) return;
    setPropModal({ loading: true, data: null, error: null });
    try {
      const res = await getPropertyByIdApi(row.property_id);
      const p = res.data?.data || res.data || null;
      setPropModal({ loading: false, data: p, error: null });
    } catch (err) {
      setPropModal({
        loading: false,
        data: null,
        error: err?.response?.data?.message || "Unable to load property details.",
      });
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

  const footerNews = useMemo(() => news.filter(isFooterSub), [news]);
  const popupNews = useMemo(() => news.filter((s) => !isFooterSub(s)), [news]);

  const filteredNews = useMemo(() => {
    const s = dq.trim().toLowerCase();
    const base = tab === "footer" ? footerNews : popupNews;
    if (!s) return base;
    return base.filter((r) =>
      [r.email, r.source, `ns-${r.id}`, String(r.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [tab, footerNews, popupNews, dq]);

  const filteredLoans = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return loans;
    return loans.filter((r) =>
      [r.name, r.email, r.phone, `ln-${r.id}`, String(r.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [loans, dq]);

  const filteredGroups = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return propGroups;
    return propGroups
      .map((g) => ({
        ...g,
        leads: (g.leads || []).filter((l) =>
          [l.name, l.email, l.phone, l.title, l.city, String(l.id)]
            .filter(Boolean)
            .some((f) => String(f).toLowerCase().includes(s))
        ),
      }))
      .filter((g) => (g.leads || []).length > 0);
  }, [propGroups, dq]);

  const filtered =
    tab === "req"
      ? filteredReqs
      : tab === "int"
        ? filteredInts
        : tab === "loan"
          ? filteredLoans
          : filteredNews;

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

  const newsStats = useMemo(() => {
    const total = popupNews.length;
    const foot = footerNews.length;
    const week = news.filter((i) => {
      const t = new Date(i.created_at || 0).getTime();
      return Number.isFinite(t) && Date.now() - t < 7 * 86400000;
    }).length;
    return [
      { label: "Total Subscribers", value: fmtNum(news.length), icon: FaNewspaper, tone: "blue" },
      { label: "Popup / In-Page", value: fmtNum(total), sub: "lead popup & home card", icon: FaBolt, tone: "green" },
      { label: "Footer Form", value: fmtNum(foot), sub: "footer newsletter bar", icon: FaFeatherAlt, tone: "slate" },
      { label: "Last 7 Days", value: fmtNum(week), sub: "recent signups", icon: FaClock, tone: "amber" },
    ];
  }, [news, popupNews, footerNews]);

  const loanStats = useMemo(() => {
    const total = loans.length;
    const withEmail = loans.filter((l) => l.email).length;
    const week = loans.filter((i) => {
      const t = new Date(i.created_at || 0).getTime();
      return Number.isFinite(t) && Date.now() - t < 7 * 86400000;
    }).length;
    const amt = loans.reduce((s, l) => s + (Number(l.amount) || 0), 0);
    return [
      { label: "Loan Applications", value: fmtNum(total), icon: FaMoneyBillWave, tone: "blue" },
      { label: "Requested Volume", value: `₹${formatCr(amt)}`, sub: "sum of all asks", icon: FaBolt, tone: "green" },
      { label: "With Email", value: fmtNum(withEmail), sub: "reachable by mail", icon: FaUsers, tone: "slate" },
      { label: "Last 7 Days", value: fmtNum(week), sub: "recent applications", icon: FaClock, tone: "amber" },
    ];
  }, [loans]);

  const footerStats = useMemo(() => {
    const total = footerNews.length;
    const week = footerNews.filter((i) => {
      const t = new Date(i.created_at || 0).getTime();
      return Number.isFinite(t) && Date.now() - t < 7 * 86400000;
    }).length;
    const dupes = total - new Set(footerNews.map((n) => String(n.email || "").toLowerCase())).size;
    return [
      { label: "Footer Subscribers", value: fmtNum(total), icon: FaFeatherAlt, tone: "blue" },
      { label: "Last 7 Days", value: fmtNum(week), sub: "recent signups", icon: FaClock, tone: "amber" },
      { label: "Unique Emails", value: fmtNum(total - Math.max(0, dupes)), sub: "deduplicated", icon: FaUsers, tone: "green" },
      { label: "Duplicates", value: fmtNum(Math.max(0, dupes)), sub: "same email twice", icon: FaLayerGroup, tone: "slate" },
    ];
  }, [footerNews]);

  const stats =
    tab === "req"
      ? reqStats
      : tab === "int"
        ? intStats
        : tab === "loan"
          ? loanStats
          : tab === "footer"
            ? footerStats
            : newsStats;

  const propViewStats = useMemo(() => {
    const groups = propGroups.length;
    const total = propGroups.reduce((s, g) => s + (g.leads || []).length, 0);
    const linked = propGroups.filter((g) => g.property_id).length;
    const unassigned = total - propGroups.filter((g) => g.property_id)
      .reduce((s, g) => s + (g.leads || []).length, 0);
    return [
      { label: "Property Groups", value: fmtNum(groups), icon: FaLayerGroup, tone: "blue" },
      { label: "Linked Listings", value: fmtNum(linked), sub: "with a property ID", icon: FaBuilding, tone: "green" },
      { label: "Total Leads", value: fmtNum(total), sub: "across all groups", icon: FaBullseye, tone: "slate" },
      { label: "Unassigned", value: fmtNum(Math.max(0, unassigned)), sub: "no property linked", icon: FaClock, tone: "amber" },
    ];
  }, [propGroups]);

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
            <button
              type="button"
              className="lp-link"
              title={r.property_id ? "View property details" : "No linked property"}
              disabled={!r.property_id}
              onClick={() => openPropPopup(r)}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                font: "inherit",
                color: r.property_id ? "#1E4C8C" : undefined,
                textDecoration: r.property_id ? "underline" : "none",
                cursor: r.property_id ? "pointer" : "default",
                textAlign: "left",
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {r.property_title || "—"}
            </button>
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

  const newsColumns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      width: "90px",
      cell: (r) => <span className="lp-id">#NS-{r.id}</span>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      cell: (r) => (
        <div className="lp-user">
          <Avatar name={r.email} tone="alt" />
          <div style={{ minWidth: 0 }}>
            <div className="lp-user-name">{r.email || "—"}</div>
            <div className="lp-cell-sub">
              {tab === "footer" ? "Footer newsletter form" : "Popup / in-page signup"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
      cell: (r) => (
        <StatusPill tone={isFooterSub(r) ? "amber" : "green"}>
          {String(r.source || "website").toUpperCase()}
        </StatusPill>
      ),
    },
    {
      key: "created_at",
      label: "Subscribed",
      sortable: true,
      sortValue: (r) => new Date(r.created_at || 0).getTime() || 0,
      width: "115px",
      cell: (r) => <span className="lp-muted">{fmtWhen(r.created_at)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      cell: (r) => (
        <div className="lp-actions-cell">
          <button
            type="button"
            className="lp-icon-btn tone-red"
            title="Remove subscriber"
            aria-label={`Remove subscriber ${r.id}`}
            onClick={() => setDelTarget({ ...r, __kind: "newsletter" })}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const loanColumns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      width: "90px",
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
      sortable: true,
      cell: (r) => <span className="lp-muted">{r.phone || "—"}</span>,
    },
    {
      key: "amount",
      label: "Loan Amount",
      sortable: true,
      sortValue: (r) => Number(r.amount) || 0,
      align: "right",
      cell: (r) => <span className="lp-money">₹{fmtNum(Number(r.amount) || 0)}</span>,
    },
    {
      key: "created_at",
      label: "Applied",
      sortable: true,
      sortValue: (r) => new Date(r.created_at || 0).getTime() || 0,
      width: "115px",
      cell: (r) => <span className="lp-muted">{fmtWhen(r.created_at)}</span>,
    },
  ];

  const TAB_COLUMNS = { req: reqColumns, int: intColumns, news: newsColumns, footer: newsColumns, loan: loanColumns };
  const columns = TAB_COLUMNS[tab] || reqColumns;

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
    } else if (tab === "int") {
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
    } else if (tab === "loan") {
      downloadCsv(`loan-applications-${day}.csv`, filtered, [
        { label: "Loan ID", value: (r) => `LN-${r.id}` },
        { label: "Name", value: (r) => r.name || "" },
        { label: "Phone", value: (r) => r.phone || "" },
        { label: "Email", value: (r) => r.email || "" },
        { label: "Amount", value: (r) => r.amount ?? "" },
        { label: "Created", value: (r) => r.created_at || "" },
      ]);
    } else {
      const name = tab === "footer" ? `footer-subscribers-${day}.csv` : `newsletter-subscribers-${day}.csv`;
      downloadCsv(name, filtered, [
        { label: "ID", value: (r) => `NS-${r.id}` },
        { label: "Email", value: (r) => r.email || "" },
        { label: "Source", value: (r) => r.source || "" },
        { label: "Subscribed", value: (r) => r.created_at || "" },
      ]);
    }
  };

  const filtersActive =
    q !== "" || (tab === "req" && status !== "all");

  const TAB_DEFS = [
    { key: "req", label: "Post Requirement", count: reqs.length },
    { key: "int", label: "Property Enquiry", count: interests.length },
    { key: "news", label: "Newsletter", count: popupNews.length },
    { key: "loan", label: "Loan", count: loans.length },
    { key: "footer", label: "Footer Subscribers", count: footerNews.length },
  ];

  const TAB_META = {
    req: { title: "Buyer Requirements", empty: REQ_EMPTY, placeholder: "Search client, title, city or lead ID…" },
    int: { title: "Property Enquiries", empty: INT_EMPTY, placeholder: "Search buyer, property, city or message…" },
    news: { title: "Newsletter Subscribers", empty: NEWS_EMPTY, placeholder: "Search email or source…" },
    loan: { title: "Loan Applications", empty: LOAN_EMPTY, placeholder: "Search applicant, phone or email…" },
    footer: { title: "Footer Subscribers", empty: FOOTER_EMPTY, placeholder: "Search footer email…" },
  };
  const meta = TAB_META[tab] || TAB_META.req;
  const totalCount =
    tab === "req"
      ? reqs.length
      : tab === "int"
        ? interests.length
        : tab === "loan"
          ? loans.length
          : tab === "footer"
            ? footerNews.length
            : popupNews.length;

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Lead Engine"
        sub="All inbound leads — requirements, enquiries, newsletters and loans — with account-wise and property-wise views."
        actions={
          <>
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={handleRefresh}
              disabled={loading || propLoading}
            >
              <FaSyncAlt className={loading || propLoading ? "lp-spin" : ""} size={13} />
              Refresh
            </button>
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={exportCsv}
              disabled={loading || !!error || view === "property"}
            >
              <FaDownload size={13} />
              Export CSV
            </button>
            {tab === "req" && view === "account" && (
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

      {/* Account-wise / Property-wise toggle — point 17 */}
      <div className="lp-view-toggle" role="group" aria-label="Lead grouping view">
        <button
          type="button"
          className={`lp-view-btn ${view === "account" ? "active" : ""}`}
          onClick={() => switchView("account")}
          aria-pressed={view === "account"}
        >
          <FaListUl size={12} />
          Account-wise
        </button>
        <button
          type="button"
          className={`lp-view-btn ${view === "property" ? "active" : ""}`}
          onClick={() => switchView("property")}
          aria-pressed={view === "property"}
        >
          <FaLayerGroup size={12} />
          Property-wise
        </button>
      </div>

      {view === "account" && (
        <div className="lp-tabs" role="tablist" aria-label="Lead views">
          {TAB_DEFS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`lp-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => switchTab(t.key)}
            >
              {t.label}
              <span className="lp-tab-count">{fmtNum(t.count)}</span>
            </button>
          ))}
        </div>
      )}

      <StatGrid stats={view === "property" ? propViewStats : stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder={
          view === "property"
            ? "Search name, email, title or city in grouped leads…"
            : meta.placeholder
        }
        pills={view === "account" && tab === "req" ? pills : undefined}
        activePill={view === "account" && tab === "req" ? status : undefined}
        onPill={view === "account" && tab === "req" ? onStatus : undefined}
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

      {view === "property" ? (
        <div className="lp-panel">
          <div className="lp-panel-head">
            <div>
              <div className="lp-panel-title">Leads grouped by property</div>
              <div className="lp-panel-sub">
                {propLoading
                  ? "Loading…"
                  : `${fmtNum(filteredGroups.length)} property group${filteredGroups.length === 1 ? "" : "s"}`}
              </div>
            </div>
          </div>

          {propLoading ? (
            <div className="lp-state">
              <div className="lp-state-icon">
                <FaSyncAlt className="lp-spin" />
              </div>
              <h3>Loading property groups…</h3>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="lp-state">
              <div className="lp-state-icon">
                <FaBuilding />
              </div>
              <h3>{PROP_VIEW_EMPTY.title}</h3>
              <p>{PROP_VIEW_EMPTY.sub}</p>
            </div>
          ) : (
            <div className="lp-prop-groups">
              {filteredGroups.map((g) => (
                <div key={g.group} className="lp-prop-group">
                  <div className="lp-prop-group-head">
                    <div className="lp-prop-group-title">
                      {g.property_id ? `Property #${g.property_id}` : "Unassigned leads"}
                    </div>
                    <span className="lp-tab-count">{fmtNum((g.leads || []).length)}</span>
                  </div>
                  <div className="lp-prop-group-rows">
                    {(g.leads || []).map((l) => (
                      <div key={`${l.lead_type}-${l.id}`} className="lp-prop-lead-row">
                        <StatusPill tone={l.lead_type === "enquiry" ? "blue" : l.lead_type === "loan" ? "amber" : l.lead_type === "newsletter" ? "green" : "slate"}>
                          {l.lead_type}
                        </StatusPill>
                        <div className="lp-prop-lead-main">
                          <div className="lp-user-name">{l.name || l.email || "—"}</div>
                          <div className="lp-cell-sub">
                            {[l.title, l.city].filter(Boolean).join(" · ") || "—"}
                          </div>
                        </div>
                        <div className="lp-cell-sub">{l.phone || l.email || ""}</div>
                        <span className="lp-muted">{fmtWhen(l.created_at)}</span>
                        {l.lead_type === "enquiry" && l.property_id ? (
                          <button
                            type="button"
                            className="lp-icon-btn tone-blue"
                            title="View property"
                            aria-label={`View property ${l.property_id}`}
                            onClick={() => openPropPopup(l)}
                          >
                            <FaEye />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="lp-panel">
            <div className="lp-panel-head">
              <div>
                <div className="lp-panel-title">{meta.title}</div>
                <div className="lp-panel-sub">
                  {loading
                    ? "Loading…"
                    : `${fmtNum(filtered.length)} of ${fmtNum(totalCount)} records`}
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
              empty={meta.empty}
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
        </>
      )}

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
        title={delTarget?.__kind === "newsletter" ? "Remove this subscriber?" : "Delete this requirement?"}
        message={
          delTarget
            ? delTarget.__kind === "newsletter"
              ? `${delTarget.email || "This email"} will be removed from the ${
                  isFooterSub(delTarget) ? "footer" : "newsletter"
                } list. This cannot be undone.`
              : `#${delTarget.name || "this client"} — “${
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

      {/* Property details popup — opened from the enquiry property hyperlink */}
      <Modal
        open={!!propModal}
        onClose={() => setPropModal(null)}
        size="lg"
        title="Property Details"
        sub={propModal?.data ? `Listing #${propModal.data.id}` : ""}
      >
        {propModal?.loading ? (
          <div className="lp-state">
            <div className="lp-state-icon">
              <FaSyncAlt className="lp-spin" />
            </div>
            <h3>Loading property…</h3>
          </div>
        ) : propModal?.error ? (
          <div className="lp-state error">
            <h3>Unable to load property</h3>
            <p>{propModal.error}</p>
          </div>
        ) : propModal?.data ? (
          <>
            <div className="lp-profile-hero">
              {Array.isArray(propModal.data.images) && propModal.data.images.length > 0 ? (
                <img
                  src={resolveImageUrl(propModal.data.images[0])}
                  alt={propModal.data.property_title || "Property"}
                  style={{
                    width: "100%",
                    maxHeight: 220,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                />
              ) : null}
              <div className="lp-profile-name">
                {propModal.data.property_title || "Untitled Property"}
              </div>
              <div className="lp-profile-mail">
                {[propModal.data.address, propModal.data.city, propModal.data.state]
                  .filter(Boolean)
                  .join(", ") || "Location N/A"}
              </div>
              <div style={{ marginTop: 10 }}>
                <StatusPill tone={propModal.data.property_status === "Approved" ? "green" : "amber"}>
                  {propModal.data.property_status || "Pending"}
                </StatusPill>
              </div>
            </div>
            <div className="lp-profile-grid">
              <div className="lp-info-card">
                <div className="k">Price</div>
                <div className="v">
                  {propModal.data.price
                    ? `₹${fmtNum(parseMoney(propModal.data.price))}`
                    : "—"}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Type</div>
                <div className="v">{propModal.data.property_type || "—"}</div>
              </div>
              <div className="lp-info-card">
                <div className="k">Bedrooms / Baths</div>
                <div className="v">
                  {[propModal.data.bedrooms, propModal.data.bathrooms]
                    .filter((v) => v !== null && v !== undefined && v !== "")
                    .join(" / ") || "—"}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Area</div>
                <div className="v">
                  {propModal.data.area_sqft || propModal.data.carpet_area
                    ? `${propModal.data.area_sqft || propModal.data.carpet_area} sq ft`
                    : "—"}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Posted By</div>
                <div className="v">
                  {propModal.data.poster_name || "—"}
                  {propModal.data.poster_phone ? ` · ${propModal.data.poster_phone}` : ""}
                </div>
              </div>
              <div className="lp-info-card">
                <div className="k">Featured</div>
                <div className="v">
                  {Number(propModal.data.is_featured) ? "Yes" : "No"}
                </div>
              </div>
            </div>
            {propModal.data.description ? (
              <div className="lp-desc">
                <div className="k">Description</div>
                <p>{propModal.data.description}</p>
              </div>
            ) : null}
            {Array.isArray(propModal.data.images) && propModal.data.images.length > 1 ? (
              <div className="lp-desc">
                <div className="k">Gallery ({propModal.data.images.length})</div>
                <div className="lp-detail-gallery">
                  {propModal.data.images.map((url, i) => (
                    <a
                      key={`pg-${i}`}
                      href={resolveImageUrl(url)}
                      target="_blank"
                      rel="noreferrer"
                      title="Open full image"
                    >
                      <img src={resolveImageUrl(url)} alt={`Gallery ${i + 1}`} />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </Modal>
    </div>
  );
};

export default Leads;
