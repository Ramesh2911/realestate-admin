import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaLink,
  FaGlobe,
  FaCheckCircle,
  FaEyeSlash,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPhoneAlt,
  FaInfoCircle,
} from "react-icons/fa";
import {
  getFooterContactApi,
  updateFooterContactApi,
  getFooterLinksApi,
  createFooterLinkApi,
  updateFooterLinkApi,
  deleteFooterLinkApi,
} from "../../services/auth.api";
import {
  ListHero,
  StatGrid,
  ListTable,
  Modal,
  Confirm,
  StatusPill,
} from "../../components/ListUI";
import { fmtNum, fmtWhen } from "../../utils/list";
import "../Setting/Settings.css";

const EMPTY_CONTACT = { phone: "", email: "", address: "" };
const EMPTY_LINK = { label: "", url: "", sort_order: 0, status: 1, content: "" };

const EMPTY_TABLE = {
  title: "No footer links found",
  sub: "Add the Useful Links that should appear in the website footer.",
};

const FooterManager = () => {
  const isSuperAdmin = useMemo(() => {
    try {
      return Number(JSON.parse(localStorage.getItem("user"))?.role_id) === 1;
    } catch {
      return false;
    }
  }, []);

  // Contact
  const [contact, setContact] = useState(EMPTY_CONTACT);
  const [contactSaving, setContactSaving] = useState(false);

  // Links
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Link form modal
  const [formOpen, setFormOpen] = useState(false);
  const [formId, setFormId] = useState(null);
  const [form, setForm] = useState(EMPTY_LINK);
  const [formBusy, setFormBusy] = useState(false);

  // Delete confirm
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [cRes, lRes] = await Promise.allSettled([
        getFooterContactApi(),
        getFooterLinksApi(),
      ]);
      if (cRes.status === "fulfilled") {
        const data = cRes.value?.data?.data || EMPTY_CONTACT;
        setContact({ ...EMPTY_CONTACT, ...data });
      }
      if (lRes.status === "fulfilled") {
        const data = lRes.value?.data?.data || [];
        setLinks(Array.isArray(data) ? data : []);
      } else {
        setError("Unable to load footer content. Please try again.");
      }
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

  /* ── Contact save ── */
  const submitContact = async (e) => {
    e.preventDefault();
    if (!contact.phone.trim() || !contact.email.trim() || !contact.address.trim()) {
      toast.error("Phone, email and address are required.");
      return;
    }
    setContactSaving(true);
    try {
      const res = await updateFooterContactApi({
        phone: contact.phone.trim(),
        email: contact.email.trim(),
        address: contact.address.trim(),
      });
      const data = res.data?.data || {};
      setContact((c) => ({ ...c, ...data }));
      toast.success("Footer contact saved.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save contact.");
    } finally {
      setContactSaving(false);
    }
  };

  /* ── Link form ── */
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setFormId(null);
    setForm({ ...EMPTY_LINK, sort_order: links.length + 1 });
    setFormOpen(true);
  };

  const openEdit = (r) => {
    setFormId(r.id);
    setForm({
      label: r.label || "",
      url: r.url || "#",
      sort_order: Number(r.sort_order) || 0,
      status: Number(r.status) === 1 ? 1 : 0,
      content: r.content || "",
    });
    setFormOpen(true);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) {
      toast.error("Label is required.");
      return;
    }
    setFormBusy(true);
    const payload = {
      label: form.label.trim(),
      url: form.url.trim() || "#",
      sort_order: form.sort_order,
      status: form.status,
      content: form.content,
    };
    try {
      if (formId) {
        await updateFooterLinkApi(formId, payload);
        toast.success("Footer link updated.");
      } else {
        await createFooterLinkApi(payload);
        toast.success("Footer link created.");
      }
      setFormOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save footer link.");
    } finally {
      setFormBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDelBusy(true);
    try {
      await deleteFooterLinkApi(delTarget.id);
      setDelTarget(null);
      toast.success("Footer link deleted.");
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete footer link.");
    } finally {
      setDelBusy(false);
    }
  };

  const stats = useMemo(() => {
    const active = links.filter((r) => Number(r.status) === 1).length;
    return [
      { label: "Useful Links", value: fmtNum(links.length), icon: FaLink, tone: "blue" },
      { label: "Visible", value: fmtNum(active), sub: "shown on website", icon: FaCheckCircle, tone: "green" },
      { label: "Hidden", value: fmtNum(links.length - active), sub: "draft links", icon: FaEyeSlash, tone: "amber" },
    ];
  }, [links]);

  const columns = [
    {
      key: "id",
      label: "Order",
      sortable: true,
      width: "85px",
      sortValue: (r) => Number(r.sort_order) || 0,
      cell: (r) => <span className="lp-id">#{r.sort_order}</span>,
    },
    {
      key: "label",
      label: "Link Label",
      sortable: true,
      cell: (r) => (
        <div style={{ minWidth: 0 }}>
          <div className="lp-user-name" title={r.label}>
            {r.label || "—"}
          </div>
          <div className="lp-cell-sub" title={r.url || ""}>
            {r.url || "#"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => (Number(r.status) === 1 ? "Visible" : "Hidden"),
      width: "115px",
      cell: (r) =>
        Number(r.status) === 1 ? (
          <StatusPill tone="green">Visible</StatusPill>
        ) : (
          <StatusPill tone="amber">Hidden</StatusPill>
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
            title="Edit link"
            aria-label={`Edit footer link ${r.id}`}
            onClick={() => openEdit(r)}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="lp-icon-btn tone-red"
            title="Delete link"
            aria-label={`Delete footer link ${r.id}`}
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
        sub="Manage the contact details and Useful Links shown in the website footer."
        actions={
          <button
            type="button"
            className="lp-btn lp-btn-ghost"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? "lp-spin" : ""} size={13} />
            Refresh
          </button>
        }
      >
        Website <span className="lp-accent">Footer</span>
      </ListHero>

      <StatGrid stats={stats} />

      {/* ── Contact panel ── */}
      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">Contact & Location</div>
            <div className="lp-panel-sub">
              Phone, email and address shown in the footer Contact / Location columns.
            </div>
          </div>
        </div>

        {!isSuperAdmin && (
          <div className="st-ro-note" style={{ margin: "0 24px 16px" }}>
            <FaInfoCircle size={13} />
            Only a Super Admin can edit footer content. You can view the current values.
          </div>
        )}

        <form onSubmit={submitContact} style={{ padding: "0 24px 24px" }}>
          <div className="lp-form-grid">
            <div className="lp-field">
              <label htmlFor="ft-phone">Phone *</label>
              <input
                id="ft-phone"
                type="text"
                required
                value={contact.phone}
                readOnly={!isSuperAdmin}
                disabled={!isSuperAdmin}
                className={!isSuperAdmin ? "st-readonly" : ""}
                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                placeholder="(+91) 98765 43210"
              />
            </div>
            <div className="lp-field">
              <label htmlFor="ft-email">Email *</label>
              <input
                id="ft-email"
                type="email"
                required
                value={contact.email}
                readOnly={!isSuperAdmin}
                disabled={!isSuperAdmin}
                className={!isSuperAdmin ? "st-readonly" : ""}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                placeholder="info@example.com"
              />
            </div>
            <div className="lp-field full">
              <label htmlFor="ft-address">Address *</label>
              <textarea
                id="ft-address"
                required
                rows={2}
                value={contact.address}
                readOnly={!isSuperAdmin}
                disabled={!isSuperAdmin}
                className={!isSuperAdmin ? "st-readonly" : ""}
                onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))}
                placeholder="Street, Area, City- PIN"
              />
            </div>
          </div>

          {isSuperAdmin && (
            <div className="st-foot" style={{ marginTop: 16 }}>
              <button type="submit" className="lp-btn lp-btn-primary" disabled={contactSaving}>
                {contactSaving ? "Saving…" : "Save contact"}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* ── Useful Links panel ── */}
      <div className="lp-panel" style={{ marginTop: 24 }}>
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">Useful Links</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(links.length)} links · ordered by the Order value`}
            </div>
          </div>
          {isSuperAdmin && (
            <button type="button" className="lp-btn lp-btn-primary" onClick={openCreate}>
              <FaPlus size={12} />
              New Link
            </button>
          )}
        </div>

        <ListTable
          columns={columns}
          rows={links}
          rowKey={(r) => r.id}
          loading={loading}
          error={error}
          onRetry={handleRefresh}
          empty={EMPTY_TABLE}
          initialSort={{ key: "id", dir: "asc" }}
        />
      </div>

      {/* ── Link form modal ── */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formId ? "Edit Footer Link" : "New Footer Link"}
        sub="This link appears under Useful Links in the website footer."
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
              form="footer-link-form"
              className="lp-btn lp-btn-primary"
              disabled={formBusy}
            >
              {formBusy && <span className="lp-spin" style={{ display: "inline-flex" }} />}
              {formId ? "Save changes" : "Create link"}
            </button>
          </>
        }
      >
        <form id="footer-link-form" className="lp-form-grid" onSubmit={saveForm}>
          <div className="lp-field full">
            <label htmlFor="fl-label">Label *</label>
            <input
              id="fl-label"
              type="text"
              required
              value={form.label}
              onChange={(e) => setF("label", e.target.value)}
              placeholder="e.g. Privacy & Policy"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="fl-url">URL</label>
            <input
              id="fl-url"
              type="text"
              value={form.url}
              onChange={(e) => setF("url", e.target.value)}
              placeholder="/privacy-policy or https://…"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="fl-order">Order</label>
            <input
              id="fl-order"
              type="number"
              min="0"
              value={form.sort_order}
              onChange={(e) => setF("sort_order", e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="display order (1, 2, 3…)"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="fl-status">Status</label>
            <select
              id="fl-status"
              value={form.status}
              onChange={(e) => setF("status", Number(e.target.value))}
            >
              <option value={1}>Visible on website</option>
              <option value={0}>Hidden</option>
            </select>
          </div>
          <div className="lp-field full">
            <label htmlFor="fl-content">Page Content</label>
            <textarea
              id="fl-content"
              rows={8}
              style={{ minHeight: 160 }}
              value={form.content}
              onChange={(e) => setF("content", e.target.value)}
              placeholder={"Write the content shown when this menu link is clicked…\n\nUse a blank line between paragraphs."}
            />
            <small style={{ color: "var(--text-light)", fontSize: 12 }}>
              Website e link click korle ei content dekhabe. Blank line diye paragraph tokho.
            </small>
          </div>
        </form>
      </Modal>

      {/* ── Delete confirm ── */}
      <Confirm
        open={!!delTarget}
        title="Delete this footer link?"
        message={
          delTarget
            ? `“${delTarget.label}” will be permanently removed from the website footer.`
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

export default FooterManager;
