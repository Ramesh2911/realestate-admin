import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaHandshake,
  FaCheckCircle,
  FaLayerGroup,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaGlobe,
} from "react-icons/fa";
import {
  getPartnersAdminApi,
  createPartnerApi,
  updatePartnerApi,
  deletePartnerApi,
} from "../../services/auth.api";
import {
  ListHero,
  StatGrid,
  Toolbar,
  ListTable,
  Modal,
  Confirm,
  StatusPill,
} from "../../components/ListUI";
import { useDebounced, fmtNum, fmtWhen } from "../../utils/list";

const EMPTY = {
  title: "No partner developers found",
  sub: "Add developer logos — they appear in the website and app home marquee.",
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

const emptyForm = {
  name: "",
  website: "",
  description: "",
  sort_order: 0,
  is_active: 1,
  logo: "",
};

const Partners = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formId, setFormId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formBusy, setFormBusy] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const dq = useDebounced(q, 300);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const res = await getPartnersAdminApi();
      const data = res?.data?.data || [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load partners. Please try again.");
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

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const resetLogoState = () => {
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview("");
  };

  const openCreate = () => {
    setFormId(null);
    setForm({ ...emptyForm });
    resetLogoState();
    setFormOpen(true);
  };

  const openEdit = (r) => {
    setFormId(r.id);
    setForm({
      name: r.name || "",
      website: r.website || "",
      description: r.description || "",
      sort_order: Number(r.sort_order) || 0,
      is_active: Number(r.is_active) === 0 ? 0 : 1,
      logo: r.logo || "",
    });
    resetLogoState();
    setFormOpen(true);
  };

  const onLogoFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(f));
  };

  const saveForm = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!formId && !logoFile && !form.logo) {
      toast.error("Logo image is required.");
      return;
    }
    setFormBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("website", form.website.trim());
      fd.append("description", form.description.trim());
      fd.append("sort_order", String(Number(form.sort_order) || 0));
      fd.append("is_active", String(form.is_active));
      if (logoFile) {
        fd.append("partner_logo", logoFile);
      } else if (formId && form.logo === "") {
        fd.append("logo", "");
      }
      if (formId) {
        await updatePartnerApi(formId, fd);
        toast.success("Partner updated.");
      } else {
        await createPartnerApi(fd);
        toast.success("Partner created.");
      }
      setFormOpen(false);
      resetLogoState();
      await loadData();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save partner."
      );
    } finally {
      setFormBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDelBusy(true);
    try {
      await deletePartnerApi(delTarget.id);
      setDelTarget(null);
      toast.success("Partner deleted.");
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete partner.");
    } finally {
      setDelBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.name, r.website, r.description]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [rows, dq]);

  const stats = useMemo(() => {
    const active = rows.filter((r) => Number(r.is_active) === 1).length;
    const withSite = rows.filter((r) => r.website).length;
    return [
      { label: "Total Partners", value: fmtNum(rows.length), icon: FaHandshake, tone: "blue" },
      { label: "Active", value: fmtNum(active), sub: `${rows.length - active} hidden`, icon: FaCheckCircle, tone: "green" },
      { label: "With Website", value: fmtNum(withSite), sub: "linked profiles", icon: FaGlobe, tone: "amber" },
      { label: "Marquee Slots", value: fmtNum(active), sub: "shown in home strip", icon: FaLayerGroup, tone: "slate" },
    ];
  }, [rows]);

  const columns = [
    {
      key: "name",
      label: "Developer",
      sortable: true,
      cell: (r) => (
        <div className="lp-user">
          {r.logo ? (
            <img
              src={resolveImageUrl(r.logo)}
              alt={r.name || "Partner"}
              style={{
                width: 40,
                height: 40,
                objectFit: "contain",
                background: "#fff",
                borderRadius: 8,
                border: "1px solid rgba(30,76,140,.12)",
                flexShrink: 0,
              }}
            />
          ) : (
            <span className="lp-avatar" aria-hidden>
              {(r.name || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            <div className="lp-user-name" title={r.name}>
              {r.name || "—"}
            </div>
            <div className="lp-cell-sub" title={r.website || ""}>
              {r.website || "No website"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      cell: (r) =>
        r.description ? (
          <span
            className="lp-cell-sub"
            title={r.description}
            style={{
              display: "block",
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {r.description}
          </span>
        ) : (
          <span className="lp-muted">—</span>
        ),
    },
    {
      key: "sort_order",
      label: "Order",
      sortable: true,
      width: "80px",
      align: "right",
      cell: (r) => <span className="lp-muted">{Number(r.sort_order) || 0}</span>,
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      sortValue: (r) => (Number(r.is_active) === 1 ? "Active" : "Hidden"),
      width: "105px",
      cell: (r) =>
        Number(r.is_active) === 1 ? (
          <StatusPill tone="green">Active</StatusPill>
        ) : (
          <StatusPill tone="amber">Hidden</StatusPill>
        ),
    },
    {
      key: "created_at",
      label: "Added",
      sortable: true,
      sortValue: (r) => new Date(r.created_at || 0).getTime() || 0,
      width: "105px",
      cell: (r) => <span className="lp-muted">{fmtWhen(r.created_at)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      cell: (r) => (
        <div className="lp-actions-cell">
          <button
            type="button"
            className="lp-icon-btn tone-blue"
            title="Edit partner"
            aria-label={`Edit partner ${r.id}`}
            onClick={() => openEdit(r)}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="lp-icon-btn tone-red"
            title="Delete partner"
            aria-label={`Delete partner ${r.id}`}
            onClick={() => setDelTarget(r)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Home Marquee"
        sub="Dynamic developer logos shown in the website and app partner strip."
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
            <button type="button" className="lp-btn lp-btn-primary" onClick={openCreate}>
              <FaPlus size={12} />
              New Partner
            </button>
          </>
        }
      >
        Partner <span className="lp-accent">Developers</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar search={q} onSearch={setQ} placeholder="Search name or website…" />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">All Partners</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(rows.length)} partners`}
            </div>
          </div>
        </div>

        <ListTable
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          loading={loading}
          error={error}
          onRetry={handleRefresh}
          empty={EMPTY}
          initialSort={{ key: "sort_order", dir: "asc" }}
        />
      </div>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          resetLogoState();
        }}
        size="lg"
        title={formId ? "Edit Partner" : "New Partner"}
        sub={
          formId
            ? `Partner #${formId} · changes reflect in the home marquee immediately`
            : "Developer name, logo and link shown in the home partner strip."
        }
        footer={
          <>
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={() => {
                setFormOpen(false);
                resetLogoState();
              }}
              disabled={formBusy}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="partner-form"
              className="lp-btn lp-btn-primary"
              disabled={formBusy}
            >
              {formBusy && <span className="lp-spin" style={{ display: "inline-flex" }} />}
              {formId ? "Save changes" : "Create partner"}
            </button>
          </>
        }
      >
        <form id="partner-form" className="lp-form-grid" onSubmit={saveForm}>
          <div className="lp-field full">
            <label htmlFor="pt-name">Name *</label>
            <input
              id="pt-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setF("name", e.target.value)}
              placeholder="e.g. Prestige Group"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="pt-website">Website</label>
            <input
              id="pt-website"
              type="url"
              value={form.website}
              onChange={(e) => setF("website", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="pt-desc">Description</label>
            <textarea
              id="pt-desc"
              rows={2}
              value={form.description}
              onChange={(e) => setF("description", e.target.value)}
              placeholder="Short line about the developer…"
            />
          </div>
          <div className="lp-field full">
            <label>Logo *</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <label
                className="lp-btn lp-btn-ghost"
                style={{ cursor: "pointer", marginBottom: 0 }}
              >
                <FaImage size={12} />
                {logoFile || form.logo ? "Change logo" : "Choose logo"}
                <input
                  id="pt-logo"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={onLogoFile}
                />
              </label>
              {(logoPreview || form.logo) && (
                <img
                  src={logoPreview || resolveImageUrl(form.logo)}
                  alt="Logo preview"
                  style={{
                    width: 72,
                    height: 48,
                    objectFit: "contain",
                    background: "#fff",
                    borderRadius: 6,
                    border: "1px solid rgba(30,76,140,.15)",
                  }}
                />
              )}
            </div>
            <div
              className="lp-field-hint"
              style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}
            >
              PNG or SVG with transparency works best. Square logos look cleanest in the marquee.
            </div>
          </div>
          <div className="lp-field">
            <label htmlFor="pt-order">Sort Order</label>
            <input
              id="pt-order"
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(e) => setF("sort_order", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pt-status">Status</label>
            <select
              id="pt-status"
              value={form.is_active}
              onChange={(e) => setF("is_active", Number(e.target.value))}
            >
              <option value={1}>Active</option>
              <option value={0}>Hidden</option>
            </select>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!delTarget}
        title="Delete this partner?"
        message={
          delTarget
            ? `“${delTarget.name}” will be removed from the home marquee permanently.`
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

export default Partners;
