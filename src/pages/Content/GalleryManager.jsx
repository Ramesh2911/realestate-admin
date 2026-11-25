import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { FaCloudUploadAlt, FaTimes, FaImage, FaPen } from "react-icons/fa";
import {
  uploadContentGalleryApi,
  deleteContentGalleryApi,
} from "../../services/auth.api";
import "./GalleryManager.css";

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

// "url | label" per line → [{url, label}]
const parseGallery = (raw) =>
  String(raw || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("|");
      if (idx < 0) return { url: line, label: "" };
      return { url: line.slice(0, idx).trim(), label: line.slice(idx + 1).trim() };
    });

// [{url, label}] → "url | label" per line
const serializeGallery = (items) =>
  items
    .filter((it) => it && it.url)
    .map((it) => (it.label ? `${it.url} | ${it.label}` : it.url))
    .join("\n");

const isLocalUpload = (url) =>
  String(url || "").startsWith("/uploads/content/gallery/");

/**
 * Premium multi-image gallery manager.
 * value: "url | label" newline string (site_settings about_gallery).
 * onChange(nextValue) keeps parent form in sync; upload/delete go through API.
 */
const GalleryManager = ({ value, onChange, disabled }) => {
  const items = parseGallery(value);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const commit = (next) => onChange(serializeGallery(next));

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!files.length) {
      toast.error("Please choose image files (JPG, PNG or WebP).");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("gallery_image", f));
      const res = await uploadContentGalleryApi(fd);
      const uploaded = res?.data?.data?.images || [];
      if (!uploaded.length) {
        toast.error("Upload failed — no image returned.");
        return;
      }
      const next = [
        ...items,
        ...uploaded.map((url) => ({ url, label: "" })),
      ];
      commit(next);
      toast.success(
        `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded.`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled || busy) return;
    uploadFiles(e.dataTransfer.files);
  };

  const removeAt = async (idx) => {
    const target = items[idx];
    const next = items.filter((_, i) => i !== idx);
    commit(next);
    if (isLocalUpload(target.url) && !disabled) {
      try {
        await deleteContentGalleryApi(target.url);
      } catch {
        /* file cleanup is best-effort */
      }
    }
  };

  const setLabel = (idx, label) => {
    const next = items.map((it, i) => (i === idx ? { ...it, label } : it));
    commit(next);
  };

  return (
    <div className="gm-root">
      <div
        className={`gm-drop ${dragging ? "dragging" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <button
          type="button"
          className="gm-drop-btn"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          <span className="gm-drop-ic">
            <FaCloudUploadAlt size={18} />
          </span>
          <span className="gm-drop-title">
            {busy ? "Uploading…" : "Drop images here"}
            <em> or click to browse</em>
          </span>
          <span className="gm-drop-sub">
            JPG, PNG or WebP · multi-select supported · first image = large card
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={disabled || busy}
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <div className="gm-grid">
          {items.map((it, idx) => (
            <div className="gm-card" key={`${it.url}-${idx}`}>
              <div className="gm-thumb">
                <img src={resolveImageUrl(it.url)} alt={it.label || `Gallery ${idx + 1}`} />
                {idx === 0 && <span className="gm-badge">Large card</span>}
                {!disabled && (
                  <button
                    type="button"
                    className="gm-remove"
                    onClick={() => removeAt(idx)}
                    aria-label="Remove image"
                  >
                    <FaTimes size={11} />
                  </button>
                )}
              </div>
              <label className="gm-label">
                <FaPen size={10} />
                <input
                  type="text"
                  value={it.label}
                  placeholder="Caption label…"
                  disabled={disabled}
                  onChange={(e) => setLabel(idx, e.target.value)}
                />
              </label>
            </div>
          ))}
          {!disabled && (
            <button
              type="button"
              className="gm-card gm-add"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <FaImage size={16} />
              Add more
            </button>
          )}
        </div>
      )}

      <div className="gm-foot">
        {items.length} image{items.length === 1 ? "" : "s"} · saved with this
        section when you press Save.
      </div>
    </div>
  );
};

export default GalleryManager;
