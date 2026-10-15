import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaGlobe,
  FaCheckCircle,
  FaPen,
  FaKey,
  FaEye,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaDownload,
  FaPlus,
} from "react-icons/fa";
import {
  getSeoPagesApi,
  createSeoPageApi,
  updateSeoPageApi,
  deleteSeoPageApi,
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
} from "../../components/ListUI";
import {
  useDebounced,
  fmtNum,
  fmtWhen,
  downloadCsv,
} from "../../utils/list";

const EMPTY = {
  title: "No SEO pages found",
  sub: "Try a different title, slug or keyword — or create a new SEO page.",
};

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const statusOf = (r) => (Number(r.status) === 1 ? "Published" : "Draft");
const statusTone = (r) => (Number(r.status) === 1 ? "green" : "amber");

const emptyForm = {
  title: "",
  slug: "",
  meta_title: "",
  meta_description: "",
  keywords: "",
  content: "",
  status: 1,
};

const SEOManagement = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [formId, setFormId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formBusy, setFormBusy] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const dq = useDebounced(q, 300);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const res = await getSeoPagesApi();
      const data = res?.data?.data || [];
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load SEO pages. Please try again.");
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

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setFormId(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
  };

  const openEdit = (r) => {
    setFormId(r.id);
    setForm({
      title: r.title || "",
      slug: r.slug || "",
      meta_title: r.meta_title || "",
      meta_description: r.meta_description || "",
      keywords: r.keywords || "",
      content: r.content || "",
      status: Number(r.status) === 1 ? 1 : 0,
    });
    setFormOpen(true);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    setFormBusy(true);
    const slug = form.slug.trim() || slugify(form.title);
    if (!slug) {
      setFormBusy(false);
      toast.error("A title or slug is required.");
      return;
    }
    const payload = {
      title: form.title.trim(),
      slug,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      content: form.content || null,
      keywords: form.keywords || null,
      status: form.status,
    };
    try {
      if (formId) {
        await updateSeoPageApi(formId, payload);
        toast.success("SEO page updated.");
      } else {
        await createSeoPageApi(payload);
        toast.success("SEO page created.");
      }
      setFormOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save SEO page.");
    } finally {
      setFormBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDelBusy(true);
    try {
      await deleteSeoPageApi(delTarget.id);
      setDelTarget(null);
      toast.success("SEO page deleted.");
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete SEO page.");
    } finally {
      setDelBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return pages;
    return pages.filter((r) =>
      [r.title, r.slug, r.meta_title, r.meta_description, r.keywords, `seo-${r.id}`, String(r.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [pages, dq]);

  const stats = useMemo(() => {
    const published = pages.filter((r) => Number(r.status) === 1).length;
    const withMeta = pages.filter((r) => (r.meta_description || "").trim()).length;
    const coverage = pages.length ? Math.round((withMeta / pages.length) * 100) : 0;
    return [
      { label: "SEO Pages", value: fmtNum(pages.length), icon: FaGlobe, tone: "blue" },
      { label: "Published", value: fmtNum(published), sub: `${pages.length - published} drafts`, icon: FaCheckCircle, tone: "green" },
      { label: "Meta Coverage", value: `${coverage}%`, sub: "pages with meta description", icon: FaPen, tone: "amber" },
      { label: "Keyword Sets", value: fmtNum(pages.filter((r) => (r.keywords || "").trim()).length), sub: "pages with keywords", icon: FaKey, tone: "slate" },
    ];
  }, [pages]);

  const columns = [
    {
      key: "id",
      label: "Page ID",
      sortable: true,
      width: "95px",
      cell: (r) => <span className="lp-id">#SEO-{r.id}</span>,
    },
    {
      key: "title",
      label: "Page",
      sortable: true,
      cell: (r) => (
        <div style={{ minWidth: 0 }}>
          <div className="lp-user-name" title={r.title}>
            {r.title || "—"}
          </div>
          <div className="lp-cell-sub" title={r.meta_title || ""}>
            {r.meta_title || "No meta title"}
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
      width: "140px",
      cell: (r) => <span className="lp-id">/{r.slug}</span>,
    },
    {
      key: "meta_description",
      label: "Meta Description",
      cell: (r) =>
        r.meta_description ? (
          <span
            className="lp-cell-sub"
            title={r.meta_description}
            style={{ display: "block", maxWidth: 230 }}
          >
            {r.meta_description}
          </span>
        ) : (
          <span className="lp-muted">—</span>
        ),
    },
    {
      key: "keywords",
      label: "Keywords",
      width: "180px",
      cell: (r) => {
        const kws = String(r.keywords || "")
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
        if (!kws.length) return <span className="lp-muted">—</span>;
        return (
          <span className="lp-kws">
            {kws.slice(0, 3).map((k) => (
              <span className="lp-kw" key={k}>
                {k}
              </span>
            ))}
            {kws.length > 3 && <span className="lp-kw more">+{kws.length - 3}</span>}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => statusOf(r),
      width: "115px",
      cell: (r) => <StatusPill tone={statusTone(r)}>{statusOf(r)}</StatusPill>,
    },
    {
      key: "updated_at",
      label: "Updated",
      sortable: true,
      sortValue: (r) => new Date(r.updated_at || r.created_at || 0).getTime() || 0,
      width: "105px",
      cell: (r) => (
        <span className="lp-muted">{fmtWhen(r.updated_at || r.created_at)}</span>
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
            title="Edit page"
            aria-label={`Edit SEO page ${r.id}`}
            onClick={() => openEdit(r)}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="lp-icon-btn tone-red"
            title="Delete page"
            aria-label={`Delete SEO page ${r.id}`}
            onClick={() => setDelTarget(r)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const pagesCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const cur = Math.min(page, pagesCount);
  const slice = filtered.slice((cur - 1) * perPage, cur * perPage);

  const exportCsv = () => {
    downloadCsv(
      `seo-pages-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered,
      [
        { label: "Page ID", value: (r) => `SEO-${r.id}` },
        { label: "Title", value: (r) => r.title || "" },
        { label: "Slug", value: (r) => r.slug || "" },
        { label: "Meta Title", value: (r) => r.meta_title || "" },
        { label: "Meta Description", value: (r) => r.meta_description || "" },
        { label: "Keywords", value: (r) => r.keywords || "" },
        { label: "Status", value: (r) => statusOf(r) },
        { label: "Created", value: (r) => r.created_at || "" },
        { label: "Updated", value: (r) => r.updated_at || "" },
      ]
    );
  };

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Search Visibility"
        sub="Manage slugs, meta tags and keywords for every public-facing page."
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
              onClick={openCreate}
            >
              <FaPlus size={12} />
              New SEO Page
            </button>
          </>
        }
      >
        SEO <span className="lp-accent">Pages</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder="Search title, slug, meta or keyword…"
      />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">Page Directory</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(pages.length)} pages`}
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
          initialSort={{ key: "updated_at", dir: "desc" }}
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
        title={formId ? "Edit SEO Page" : "New SEO Page"}
        sub={
          formId
            ? `Page #SEO-${formId} · meta tags sync on save`
            : "Define the slug, meta tags and keywords search engines will see."
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
              form="seo-form"
              className="lp-btn lp-btn-primary"
              disabled={formBusy}
            >
              {formBusy && <span className="lp-spin" style={{ display: "inline-flex" }} />}
              {formId ? "Save changes" : "Create page"}
            </button>
          </>
        }
      >
        <form id="seo-form" className="lp-form-grid" onSubmit={saveForm}>
          <div className="lp-field">
            <label htmlFor="seo-title">Page Title *</label>
            <input
              id="seo-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setF("title", e.target.value)}
              onBlur={() => {
                if (!formId && !form.slug.trim() && form.title.trim())
                  setF("slug", slugify(form.title));
              }}
              placeholder="e.g. Privacy Policy"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="seo-slug">URL Slug *</label>
            <input
              id="seo-slug"
              type="text"
              required
              value={form.slug}
              onChange={(e) => setF("slug", slugify(e.target.value))}
              placeholder="auto-generated from title if empty"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="seo-metatitle">Meta Title</label>
            <input
              id="seo-metatitle"
              type="text"
              value={form.meta_title}
              onChange={(e) => setF("meta_title", e.target.value)}
              placeholder="SEO title shown in search results (≤ 60 chars ideal)"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="seo-metadesc">Meta Description</label>
            <textarea
              id="seo-metadesc"
              value={form.meta_description}
              onChange={(e) => setF("meta_description", e.target.value)}
              placeholder="Short summary shown under the title in search results…"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="seo-keywords">Keywords</label>
            <input
              id="seo-keywords"
              type="text"
              value={form.keywords}
              onChange={(e) => setF("keywords", e.target.value)}
              placeholder="comma, separated, keywords"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="seo-content">Page Content</label>
            <textarea
              id="seo-content"
              style={{ minHeight: 110 }}
              value={form.content}
              onChange={(e) => setF("content", e.target.value)}
              placeholder="Body content for the page (HTML allowed)…"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="seo-status">Status</label>
            <select
              id="seo-status"
              value={form.status}
              onChange={(e) => setF("status", Number(e.target.value))}
            >
              <option value={1}>Published</option>
              <option value={0}>Draft</option>
            </select>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!delTarget}
        title="Delete this SEO page?"
        message={
          delTarget
            ? `“${delTarget.title}” (/${delTarget.slug}) will be permanently removed. Public routes using this slug will stop resolving.`
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

export default SEOManagement;
