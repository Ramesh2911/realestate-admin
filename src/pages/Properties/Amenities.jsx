import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaThLarge,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";
import {
  getAmenitiesAdminApi,
  createAmenityApi,
  updateAmenityApi,
  deleteAmenityApi,
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
import { useDebounced, fmtNum } from "../../utils/list";

const EMPTY = {
  title: "No amenities found",
  sub: "Add the first amenity to make it available on property forms.",
};

const Amenities = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formId, setFormId] = useState(null);
  const [form, setForm] = useState({ amenity_name: "", status: 1 });
  const [formBusy, setFormBusy] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const dq = useDebounced(q, 300);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const res = await getAmenitiesAdminApi();
      const data = res?.data?.data || res || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to load amenities.");
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
  };

  const openCreate = () => {
    setFormId(null);
    setForm({ amenity_name: "", status: 1 });
    setFormOpen(true);
  };

  const openEdit = (r) => {
    setFormId(r.id);
    setForm({ amenity_name: r.amenity_name || "", status: Number(r.status) || 0 });
    setFormOpen(true);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    const name = form.amenity_name.trim();
    if (!name) {
      toast.error("Amenity name is required.");
      return;
    }
    setFormBusy(true);
    try {
      if (formId) {
        await updateAmenityApi(formId, { amenity_name: name, status: form.status });
        toast.success("Amenity updated.");
      } else {
        await createAmenityApi({ amenity_name: name });
        toast.success("Amenity created.");
      }
      setFormOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save amenity.");
    } finally {
      setFormBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDelBusy(true);
    try {
      await deleteAmenityApi(delTarget.id);
      setDelTarget(null);
      toast.success("Amenity deleted.");
      await loadData();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 409
          ? "Amenity is used by properties — disable it instead."
          : "Failed to delete amenity.");
      toast.error(msg);
      setDelTarget(null);
    } finally {
      setDelBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const s = dq.trim().toLowerCase();
    if (!s) return items;
    return items.filter((r) =>
      [r.amenity_name, `AM-${r.id}`, String(r.id)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(s))
    );
  }, [items, dq]);

  const stats = useMemo(() => {
    const active = items.filter((r) => Number(r.status) === 1).length;
    return [
      { label: "Total Amenities", value: fmtNum(items.length), icon: FaThLarge, tone: "blue" },
      { label: "Active", value: fmtNum(active), sub: "shown on property forms", icon: FaCheckCircle, tone: "green" },
      { label: "Inactive", value: fmtNum(items.length - active), sub: "hidden from forms", icon: FaBan, tone: "slate" },
    ];
  }, [items]);

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      width: "80px",
      cell: (r) => <span className="lp-id">#AM-{r.id}</span>,
    },
    {
      key: "amenity_name",
      label: "Amenity",
      sortable: true,
      cell: (r) => (
        <div style={{ minWidth: 0 }}>
          <div className="lp-user-name">{r.amenity_name || "—"}</div>
          <div className="lp-cell-sub">
            {r.usage_count != null
              ? `Used by ${fmtNum(r.usage_count)} ${Number(r.usage_count) === 1 ? "property" : "properties"}`
              : ""}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => Number(r.status) || 0,
      cell: (r) =>
        Number(r.status) === 1 ? (
          <StatusPill tone="green">Active</StatusPill>
        ) : (
          <StatusPill tone="slate">Inactive</StatusPill>
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
            title="Edit amenity"
            aria-label={`Edit amenity ${r.id}`}
            onClick={() => openEdit(r)}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="lp-icon-btn tone-red"
            title="Delete amenity"
            aria-label={`Delete amenity ${r.id}`}
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
        eyebrow="Property Setup"
        sub="Master amenity list — what appears on website and property add forms."
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
              Add Amenity
            </button>
          </>
        }
      >
        Amenities <span className="lp-accent">Master</span>
      </ListHero>

      <StatGrid stats={stats} />

      <Toolbar
        search={q}
        onSearch={onSearch}
        placeholder="Search amenity name or ID…"
      />

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div>
            <div className="lp-panel-title">All Amenities</div>
            <div className="lp-panel-sub">
              {loading
                ? "Loading…"
                : `${fmtNum(filtered.length)} of ${fmtNum(items.length)} records`}
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
          initialSort={{ key: "id", dir: "asc" }}
        />
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={formId ? "Edit Amenity" : "Add Amenity"}
        sub={
          formId
            ? `Amenity #AM-${formId} — changes apply to future property forms`
            : "New amenity will appear on website & property add forms."
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
              form="amenity-form"
              className="lp-btn lp-btn-primary"
              disabled={formBusy}
            >
              {formBusy && <span className="lp-spin" style={{ display: "inline-flex" }} />}
              {formId ? "Save changes" : "Create amenity"}
            </button>
          </>
        }
      >
        <form id="amenity-form" className="lp-form-grid" onSubmit={saveForm}>
          <div className="lp-field full">
            <label htmlFor="am-name">Amenity Name *</label>
            <input
              id="am-name"
              type="text"
              required
              value={form.amenity_name}
              onChange={(e) => setForm((f) => ({ ...f, amenity_name: e.target.value }))}
              placeholder="e.g. Swimming Pool"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="am-status">Status</label>
            <select
              id="am-status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: Number(e.target.value) }))}
            >
              <option value={1}>Active — shown on forms</option>
              <option value={0}>Inactive — hidden</option>
            </select>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!delTarget}
        title="Delete this amenity?"
        message={
          delTarget
            ? `"${delTarget.amenity_name}" will be permanently removed. If it is used by properties, deletion will be blocked — disable it instead.`
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

export default Amenities;
