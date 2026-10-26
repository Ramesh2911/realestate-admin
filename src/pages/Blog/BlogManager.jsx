import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaNewspaper,
  FaCheckCircle,
  FaPen,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import {
  getBlogPostsApi,
  createBlogPostApi,
  updateBlogPostApi,
  deleteBlogPostApi,
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
  title: "No blog posts found",
  sub: "Create your first blog post — it will appear in the website home page blog section.",
};

const emptyForm = {
  title: "",
  tag: "",
  post_date: "",
  excerpt: "",
  image_url: "",
  status: 1,
};

const toDateInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
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
      const res = await getBlogPostsApi();
      const data = res?.data?.data || [];
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load blog posts. Please try again.");
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

  const openCreate = () => {
    setFormId(null);
    setForm({ ...emptyForm, post_date: toDateInput(new Date()) });
    setFormOpen(true);
  };

  const openEdit = (r) => {
    setFormId(r.id);
    setForm({
      title: r.title || "",
      tag: r.tag || "",
      post_date: toDateInput(r.post_date),
      excerpt: r.excerpt || "",
      image_url: r.image_url || "",
      status: Number(r.status) === 1 ? 1 : 0,
    });
    setFormOpen(true);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setFormBusy(true);
    const payload = {
      title: form.title.trim(),
      tag: form.tag.trim(),
      post_date: form.post_date || null,
      excerpt: form.excerpt.trim(),
      image_url: form.image_url.trim(),
      status: form.status,
    };
    try {
      if (formId) {
        await updateBlogPostApi(formId, payload);
        toast.success("Blog post updated.");
      } else {
        await createBlogPostApi(payload);
        toast.success("Blog post created.");
      }
      setFormOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save blog post.");
    } finally {
      setFormBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDelBusy(true);
    try {
      await deleteBlogPostApi(delTarget.id);
      setDelTarget(null);
      toast.success("Blog post deleted.");
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete blog post.");
    } finally {
      setDelBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter((r) =>
      [r.title, r.tag, r.slug, r.excerpt]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [posts, dq]);

  const stats = useMemo(() => {
    const published = posts.filter((r) => Number(r.status) === 1).length;
    const tags = new Set(posts.map((r) => r.tag).filter(Boolean)).size;
    return [
      { label: "Total Posts", value: fmtNum(posts.length), icon: FaNewspaper, tone: "blue" },
      { label: "Published", value: fmtNum(published), sub: `${posts.length - published} drafts`, icon: FaCheckCircle, tone: "green" },
      { label: "Categories", value: fmtNum(tags), sub: "unique tags", icon: FaPen, tone: "amber" },
    ];
  }, [posts]);

  const columns = [
    {
      key: "title",
      label: "Post",
      sortable: true,
      cell: (r) => (
        <div style={{ minWidth: 0 }}>
          <div className="lp-user-name" title={r.title}>
            {r.title || "—"}
          </div>
          <div className="lp-cell-sub" title={r.excerpt || ""}>
            {r.excerpt || "No excerpt"}
          </div>
        </div>
      ),
    },
    {
      key: "tag",
      label: "Tag",
      sortable: true,
      width: "130px",
      cell: (r) => (r.tag ? <span className="lp-kw">{r.tag}</span> : <span className="lp-muted">—</span>),
    },
    {
      key: "post_date",
      label: "Date",
      sortable: true,
      sortValue: (r) => new Date(r.post_date || 0).getTime() || 0,
      width: "120px",
      cell: (r) => <span className="lp-muted">{fmtDate(r.post_date)}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => (Number(r.status) === 1 ? "Published" : "Draft"),
      width: "115px",
      cell: (r) =>
        Number(r.status) === 1 ? (
          <StatusPill tone="green">Published</StatusPill>
        ) : (
          <StatusPill tone="amber">Draft</StatusPill>
        ),
    },
    {
      key: "updated_at",
      label: "Updated",
      sortable: true,
      sortValue: (r) => new Date(r.updated_at || r.created_at || 0).getTime() || 0,
      width: "105px",
      cell: (r) => <span className="lp-muted">{fmtWhen(r.updated_at || r.created_at)}</span>,
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
            title="Edit post"
            aria-label={`Edit blog post ${r.id}`}
            onClick={() => openEdit(r)}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="lp-icon-btn tone-red"
            title="Delete post"
            aria-label={`Delete blog post ${r.id}`}
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
        eyebrow="Website Content"
        sub="Blog posts shown in the website home page blog section."
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
              New Post
            </button>
          </>
        }
      >
        Blog <span className="lp-accent">Posts</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={setQ}
        placeholder="Search title, tag or excerpt…"
      />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">All Posts</div>
            <div className="lp-panel-sub">
              {loading ? "Loading…" : `${fmtNum(filtered.length)} of ${fmtNum(posts.length)} posts`}
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
          initialSort={{ key: "post_date", dir: "desc" }}
        />
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="lg"
        title={formId ? "Edit Blog Post" : "New Blog Post"}
        sub={
          formId
            ? `Post #${formId} · changes reflect on the website immediately`
            : "Title, tag, date, excerpt and cover image for the home page card."
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
              form="blog-form"
              className="lp-btn lp-btn-primary"
              disabled={formBusy}
            >
              {formBusy && <span className="lp-spin" style={{ display: "inline-flex" }} />}
              {formId ? "Save changes" : "Create post"}
            </button>
          </>
        }
      >
        <form id="blog-form" className="lp-form-grid" onSubmit={saveForm}>
          <div className="lp-field full">
            <label htmlFor="bl-title">Title *</label>
            <input
              id="bl-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setF("title", e.target.value)}
              placeholder="e.g. 10 Things You Must Know Before Buying a Home"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="bl-tag">Tag</label>
            <input
              id="bl-tag"
              type="text"
              value={form.tag}
              onChange={(e) => setF("tag", e.target.value)}
              placeholder="e.g. Home Buying"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="bl-date">Publish Date</label>
            <input
              id="bl-date"
              type="date"
              value={form.post_date}
              onChange={(e) => setF("post_date", e.target.value)}
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="bl-excerpt">Excerpt</label>
            <textarea
              id="bl-excerpt"
              rows={3}
              value={form.excerpt}
              onChange={(e) => setF("excerpt", e.target.value)}
              placeholder="Short summary shown on the blog card…"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="bl-image">Cover Image URL</label>
            <input
              id="bl-image"
              type="text"
              value={form.image_url}
              onChange={(e) => setF("image_url", e.target.value)}
              placeholder="https://images.unsplash.com/photo-…?auto=format&fit=crop&w=480&h=320&q=80"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="bl-status">Status</label>
            <select
              id="bl-status"
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
        title="Delete this blog post?"
        message={delTarget ? `“${delTarget.title}” will be permanently removed from the website.` : ""}
        confirmLabel="Delete"
        danger
        busy={delBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDelTarget(null)}
      />
    </div>
  );
};

export default BlogManager;
