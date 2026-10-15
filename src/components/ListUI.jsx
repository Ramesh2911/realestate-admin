import { useState, useMemo, useEffect } from "react";
import { FaSearch, FaTrash, FaCircleNotch } from "react-icons/fa";
import {
  getInitials,
  pageWindow,
} from "../utils/list";
import "../pages/list-page.css";

/* ── Hero ── */
const ListHero = ({ eyebrow, sub, actions, children }) => (
  <header className="lp-hero">
    <div>
      <span className="lp-eyebrow">
        <i />
        {eyebrow}
      </span>
      <h1 className="lp-title">{children}</h1>
      {sub && <p className="lp-sub">{sub}</p>}
    </div>
    {actions && <div className="lp-hero-actions">{actions}</div>}
  </header>
);

/* ── Stat cards ── */
const StatGrid = ({ stats }) => (
  <div className="lp-stats">
    {stats.map((s) => (
      <div
        key={s.label}
        className={`lp-stat ${s.tone ? `tone-${s.tone}` : ""}`}
      >
        <div className="lp-stat-icon">{s.icon ? <s.icon /> : null}</div>
        <div>
          <div className="lp-stat-label">{s.label}</div>
          <div className="lp-stat-value">{s.value}</div>
          {s.sub && <div className="lp-stat-sub">{s.sub}</div>}
        </div>
      </div>
    ))}
  </div>
);

/* ── Toolbar: search + pills + extra filters + side actions ── */
const Toolbar = ({
  search,
  onSearch,
  placeholder = "Search…",
  pills,
  activePill,
  onPill,
  filters,
  side,
  activeCount,
  onClear,
}) => (
  <div className="lp-toolbar">
    <div className="lp-search">
      <FaSearch size={13} />
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {search && (
        <button
          type="button"
          className="lp-clear-btn"
          onClick={() => onSearch("")}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>

    {pills && pills.length > 0 && (
      <div className="lp-pills">
        {pills.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`lp-pill ${activePill === p.key ? "active" : ""}`}
            onClick={() => onPill(p.key)}
          >
            {p.label}
            {p.count !== undefined && (
              <span className="lp-pill-count">{p.count}</span>
            )}
          </button>
        ))}
      </div>
    )}

    {filters}

    {(side || onClear) && (
      <div className="lp-toolbar-side">
        {activeCount && <span className="lp-active-count">{activeCount}</span>}
        {onClear && (
          <button type="button" className="lp-clear-filters" onClick={onClear}>
            Clear filters
          </button>
        )}
        {side}
      </div>
    )}
  </div>
);

/* ── State blocks (empty / error) ── */
const StateView = ({ type = "empty", icon, title, sub, action }) => (
  <div className={`lp-state ${type}`}>
    <div className="lp-state-icon">{icon}</div>
    <h3>{title}</h3>
    {sub && <p>{sub}</p>}
    {action}
  </div>
);

/* ── Native premium table: client sort + skeleton + empty/error + mobile cards ── */
const ListTable = ({
  columns,
  rows,
  rowKey,
  loading = false,
  error = null,
  onRetry,
  empty,
  initialSort = null,
}) => {
  const [sort, setSort] = useState(initialSort);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = col.sortValue || ((r) => r[col.key]);
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * dir;
      }
      return String(va).localeCompare(String(vb), undefined, {
        numeric: true,
      }) * dir;
    });
  }, [rows, columns, sort]);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: "asc" };
      if (prev.dir === "asc") return { key: col.key, dir: "desc" };
      return null;
    });
  };

  if (loading) {
    return (
      <div>
        {Array.from({ length: 6 }, (_, i) => (
          <div className="lp-skel-row" key={i}>
            <div className="lp-skel circle" />
            <div className="lp-skel w30" />
            <div className="lp-skel w40" />
            <div className="lp-skel w20" />
            <div className="lp-skel w20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <StateView
        type="error"
        icon={<span aria-hidden>⚠</span>}
        title="Something went wrong"
        sub={error}
        action={
          onRetry && (
            <button type="button" className="lp-btn lp-btn-primary" onClick={onRetry}>
              Try again
            </button>
          )
        }
      />
    );
  }

  if (!rows.length) {
    return (
      <StateView
        type="empty"
        icon={<span aria-hidden>⌕</span>}
        title="No records found"
        sub="Nothing matches the current search or filters."
        {...(empty || {})}
      />
    );
  }

  return (
    <div className="lp-table-wrap">
      <table className="lp-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={col.align === "right" ? "lp-right" : ""}
              >
                {col.sortable ? (
                  <button
                    type="button"
                    className={`lp-th-sort ${sort?.key === col.key ? "sorted" : ""}`}
                    onClick={() => toggleSort(col)}
                  >
                    {col.label}
                    <span className="lp-caret">
                      <i className={`up ${sort?.key === col.key && sort.dir === "asc" ? "on" : ""}`} />
                      <i className={`down ${sort?.key === col.key && sort.dir === "desc" ? "on" : ""}`} />
                    </span>
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  data-label={col.label}
                  className={[
                    col.align === "right" ? "lp-right" : "",
                    col.key === "actions" || col.actions ? "lp-td-actions" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {col.cell ? col.cell(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── Pagination ── */
const Pager = ({
  total,
  page,
  onPage,
  perPage,
  onPerPage,
  sizes = [10, 25, 50],
}) => {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const items = pageWindow(page, pages);

  return (
    <div className="lp-pager">
      <div className="lp-page-info">
        Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> records
      </div>
      {onPerPage && (
        <div className="lp-page-size-wrap">
          Rows
          <select
            className="lp-select sm"
            value={perPage}
            onChange={(e) => onPerPage(Number(e.target.value))}
          >
            {sizes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      <div className="lp-page-btns">
        <button
          type="button"
          className="lp-page-btn"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        {items.map((it, idx) =>
          it === "…" ? (
            <span className="lp-page-ellipsis" key={`e${idx}`}>…</span>
          ) : (
            <button
              type="button"
              key={it}
              className={`lp-page-btn ${it === page ? "active" : ""}`}
              onClick={() => onPage(it)}
            >
              {it}
            </button>
          )
        )}
        <button
          type="button"
          className="lp-page-btn"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
};

/* ── Modal ── */
const Modal = ({ open, onClose, size = "", title, sub, children, footer, center }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lp-modal-overlay" onClick={onClose}>
      <div
        className={`lp-modal ${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="lp-modal-head">
            <div>
              <div className="lp-modal-title">{title}</div>
              {sub && <div className="lp-modal-sub">{sub}</div>}
            </div>
            <button
              type="button"
              className="lp-modal-x"
              onClick={onClose}
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>
        )}
        <div className="lp-modal-body">{children}</div>
        {footer && (
          <div className={`lp-modal-foot ${center ? "center" : ""}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Confirm dialog ── */
const Confirm = ({
  open,
  title,
  message,
  confirmLabel = "Delete",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} onClose={onCancel} size="sm">
    <div className="lp-confirm-body">
      <div className={`lp-confirm-icon ${danger ? "" : "info"}`}>
        {danger ? <FaTrash /> : <span aria-hidden>!</span>}
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
    <div className="lp-modal-foot center">
      <button type="button" className="lp-btn lp-btn-ghost" onClick={onCancel}>
        Cancel
      </button>
      <button
        type="button"
        className={`lp-btn ${danger ? "lp-btn-danger" : "lp-btn-primary"}`}
        onClick={onConfirm}
        disabled={busy}
      >
        {busy && <FaCircleNotch className="lp-spin" size={13} />}
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

/* ── Status pill ── */
const StatusPill = ({ tone = "slate", children }) => (
  <span className={`lp-status tone-${tone}`}>
    <i />
    {children}
  </span>
);

/* ── A/B/S verification squares ── */
const verifyTone = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "approved") return "ok";
  if (v === "pending") return "wait";
  if (v === "rejected") return "no";
  return "mute";
};

const VerifyChips = ({ superStatus, adminA, adminB }) => (
  <span className="lp-verify">
    <span
      className={`lp-verify-chip ${verifyTone(superStatus)}`}
      title={`Super Admin: ${superStatus || "—"}`}
    >
      S
    </span>
    <span
      className={`lp-verify-chip ${verifyTone(adminA)}`}
      title={`Admin A: ${adminA || "—"}`}
    >
      A
    </span>
    <span
      className={`lp-verify-chip ${verifyTone(adminB)}`}
      title={`Admin B: ${adminB || "—"}`}
    >
      B
    </span>
  </span>
);

/* ── Avatar ── */
const Avatar = ({ name, tone = "", lg = false }) => (
  <span className={`lp-avatar ${tone} ${lg ? "lg" : ""}`}>
    {getInitials(name)}
  </span>
);

export {
  ListHero,
  StatGrid,
  Toolbar,
  StateView,
  ListTable,
  Pager,
  Modal,
  Confirm,
  StatusPill,
  VerifyChips,
  Avatar,
};
