import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaImages,
  FaCheckCircle,
  FaLayerGroup,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaExternalLinkAlt,
  FaCloudUploadAlt,
  FaTimes,
} from "react-icons/fa";
import {
  getBannersAdminApi,
  createBannerApi,
  updateBannerApi,
  deleteBannerApi,
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
import "./Banners.css";

const EMPTY = {
  title: "No banners found",
  sub: "Create a banner — it slides in the website and app home hero.",
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
  title: "",
  subtitle: "",
  link: "",
  sort_order: 0,
  is_active: 1,
  image: "",
};

const Banners = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formId, setFormId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formBusy, setFormBusy] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const dq = useDebounced(q, 300);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const res = await getBannersAdminApi();
      const data = res?.data?.data || [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load banners. Please try again.");
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

  const resetImageState = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
  };

  const openCreate = () => {
    setFormId(null);
    setForm({ ...emptyForm });
    resetImageState();
    setFormOpen(true);
  };

  const openEdit = (r) => {
    setFormId(r.id);
    setForm({
      title: r.title || "",
      subtitle: r.subtitle || "",
      link: r.link || "",
      sort_order: Number(r.sort_order) || 0,
      is_active: Number(r.is_active) === 0 ? 0 : 1,
      image: r.image || "",
    });
    resetImageState();
    setFormOpen(true);
  };

  const onImageFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(f));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.type.startsWith("image/")) {
      toast.error("Please drop an image file (JPG, PNG or WebP).");
      return;
    }
    setImageFile(f);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(f));
  };

  const saveForm = async (e) => {
    e.preventDefault();
    if (!formId && !imageFile && !form.image) {
      toast.error("Banner image is required.");
      return;
    }
    setFormBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("subtitle", form.subtitle.trim());
      fd.append("link", form.link.trim());
      fd.append("sort_order", String(Number(form.sort_order) || 0));
      fd.append("is_active", String(form.is_active));
      if (imageFile) fd.append("banner_image", imageFile);
      if (formId) {
        await updateBannerApi(formId, fd);
        toast.success("Banner updated.");
      } else {
        await createBannerApi(fd);
        toast.success("Banner created.");
      }
      setFormOpen(false);
      resetImageState();
      await loadData();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save banner."
      );
    } finally {
      setFormBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDelBusy(true);
    try {
      await deleteBannerApi(delTarget.id);
      setDelTarget(null);
      toast.success("Banner deleted.");
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete banner.");
    } finally {
      setDelBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.title, r.subtitle, r.link]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [rows, dq]);

  const stats = useMemo(() => {
    const active = rows.filter((r) => Number(r.is_active) === 1).length;
    const linked = rows.filter((r) => r.link).length;
    return [
      { label: "Total Banners", value: fmtNum(rows.length), icon: FaImages, tone: "blue" },
      { label: "Live", value: fmtNum(active), sub: `${rows.length - active} hidden`, icon: FaCheckCircle, tone: "green" },
      { label: "With Link", value: fmtNum(linked), sub: "clickable slides", icon: FaExternalLinkAlt, tone: "amber" },
      { label: "Slider Order", value: fmtNum(rows.length), sub: "by sort order", icon: FaLayerGroup, tone: "slate" },
    ];
  }, [rows]);

  const columns = [
    {
      key: "title",
      label: "Banner",
      sortable: true,
      cell: (r) => (
        <div className="lp-user">
          {r.image ? (
            <img
              src={resolveImageUrl(r.image)}
              alt={r.title || "Banner"}
              style={{
                width: 76,
                height: 44,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid rgba(30,76,140,.12)",
                flexShrink: 0,
              }}
            />
          ) : (
            <span className="lp-avatar" aria-hidden>
              <FaImage />
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            <div className="lp-user-name" title={r.title || "Untitled banner"}>
              {r.title || "Untitled banner"}
            </div>
            <div className="lp-cell-sub" title={r.subtitle || ""}>
              {r.subtitle || "No subtitle"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "link",
      label: "Link",
      sortable: true,
      cell: (r) =>
        r.link ? (
          <a
            className="lp-cell-sub"
            href={r.link}
            target="_blank"
            rel="noreferrer"
            title={r.link}
            style={{ color: "var(--primary-blue)", textDecoration: "underline" }}
          >
            {r.link}
          </a>
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
      sortValue: (r) => (Number(r.is_active) === 1 ? "Live" : "Hidden"),
      width: "100px",
      cell: (r) =>
        Number(r.is_active) === 1 ? (
          <StatusPill tone="green">Live</StatusPill>
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
            title="Edit banner"
            aria-label={`Edit banner ${r.id}`}
            onClick={() => openEdit(r)}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="lp-icon-btn tone-red"
            title="Delete banner"
            aria-label={`Delete banner ${r.id}`}
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
        eyebrow="Home Hero"
        sub="Slides shown in the website and app home hero slider."
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
              New Banner
            </button>
          </>
        }
      >
        Hero <span className="lp-accent">Banners</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar search={q} onSearch={setQ} placeholder="Search title, subtitle or link…" />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">All Banners</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(rows.length)} banners`}
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
          resetImageState();
        }}
        size="lg"
        title={formId ? "Edit Banner" : "New Banner"}
        sub={
          formId
            ? `Banner #${formId} · changes reflect in the hero slider immediately`
            : "Wide hero image with optional heading and subtext."
        }
        footer={
          <>
            <button
              type="button"
              className="lp-btn lp-btn-ghost"
              onClick={() => {
                setFormOpen(false);
                resetImageState();
              }}
              disabled={formBusy}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="banner-form"
              className="lp-btn lp-btn-primary"
              disabled={formBusy}
            >
              {formBusy && <span className="lp-spin" style={{ display: "inline-flex" }} />}
              {formId ? "Save changes" : "Create banner"}
            </button>
          </>
        }
      >
        <form id="banner-form" className="lp-form-grid" onSubmit={saveForm}>
          <div className="lp-field full">
            <label htmlFor="bn-title">Title</label>
            <input
              id="bn-title"
              type="text"
              value={form.title}
              onChange={(e) => setF("title", e.target.value)}
              placeholder="e.g. Find Your Dream Home"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="bn-sub">Subtitle</label>
            <input
              id="bn-sub"
              type="text"
              value={form.subtitle}
              onChange={(e) => setF("subtitle", e.target.value)}
              placeholder="Short supporting line…"
            />
          </div>
          <div className="lp-field full">
            <label>Banner Image *</label>
            <div
              className={`bn-uploader ${dragging ? "dragging" : ""} ${
                imagePreview || form.image ? "has-file" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {imagePreview || form.image ? (
                <div className="bn-preview">
                  <img
                    src={imagePreview || resolveImageUrl(form.image)}
                    alt="Banner preview"
                  />
                  <div className="bn-preview-bar">
                    <div className="bn-preview-meta">
                      <span className="bn-preview-name">
                        {imageFile ? imageFile.name : "Current banner image"}
                      </span>
                      <span className="bn-preview-size">
                        {imageFile
                          ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB`
                          : "1600 × 600"}
                      </span>
                    </div>
                    <div className="bn-preview-actions">
                      <label className="bn-chip-btn">
                        <FaImage size={11} />
                        {imageFile ? "Replace" : "Change"}
                        <input
                          id="bn-image"
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={onImageFile}
                        />
                      </label>
                      <button
                        type="button"
                        className="bn-chip-btn danger"
                        onClick={() => {
                          resetImageState();
                          setF("image", "");
                        }}
                        aria-label="Remove image"
                      >
                        <FaTimes size={11} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="bn-drop">
                  <span className="bn-drop-ic">
                    <FaCloudUploadAlt size={22} />
                  </span>
                  <span className="bn-drop-title">
                    Drop your banner here <em>or click to browse</em>
                  </span>
                  <span className="bn-drop-sub">
                    JPG, PNG or WebP · 1600 × 600 recommended · up to 5 MB
                  </span>
                  <input
                    id="bn-image"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onImageFile}
                  />
                </label>
              )}
            </div>
          </div>
          <div className="lp-field">
            <label htmlFor="bn-order">Sort Order</label>
            <input
              id="bn-order"
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(e) => setF("sort_order", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="bn-status">Status</label>
            <select
              id="bn-status"
              value={form.is_active}
              onChange={(e) => setF("is_active", Number(e.target.value))}
            >
              <option value={1}>Live</option>
              <option value={0}>Hidden</option>
            </select>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!delTarget}
        title="Delete this banner?"
        message={
          delTarget
            ? `“${delTarget.title || "Untitled banner"}” will be removed from the hero slider permanently.`
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

export default Banners;
