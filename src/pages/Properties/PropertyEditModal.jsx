import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FaImage, FaTimes } from "react-icons/fa";
import {
  getPropertyByIdApi,
  updatePropertyApi,
  getCategoriesApi,
  getAmenitiesPublicApi,
} from "../../services/auth.api";
import { Modal } from "../../components/ListUI";

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
  category_id: "",
  property_title: "",
  property_for: "Sale",
  property_type: "Residential",
  price: "",
  area: "",
  area_unit: "sq.ft",
  bedroom: "0",
  bathroom: "0",
  balcony: "0",
  parking: "0",
  furnishing: "Unfurnished",
  ownership: "Freehold",
  construction_status: "Ready to Move",
  possession_date: "",
  description: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  latitude: "",
  longitude: "",
};

const toDateInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const PropertyEditModal = ({ open, propertyId, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingFloorPlans, setExistingFloorPlans] = useState([]);
  const [removeFloorPlan, setRemoveFloorPlan] = useState(false);
  const [floorPlanFiles, setFloorPlanFiles] = useState([]);
  const [floorPlanPreviews, setFloorPlanPreviews] = useState([]);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const loadLookups = useCallback(async () => {
    try {
      const [catRes, amenRes] = await Promise.all([
        getCategoriesApi(),
        getAmenitiesPublicApi(),
      ]);
      setCategories(catRes?.data?.data || []);
      setAmenities(amenRes?.data?.data || []);
    } catch {
      /* lookups optional */
    }
  }, []);

  useEffect(() => {
    if (!open || !propertyId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadLookups();
      try {
        const res = await getPropertyByIdApi(propertyId);
        const p = res?.data?.data;
        if (!p) throw new Error("Property not found");
        if (cancelled) return;
        setForm({
          category_id: p.category_id != null ? String(p.category_id) : "",
          property_title: p.property_title || "",
          property_for: p.property_for || "Sale",
          property_type: p.property_type || "Residential",
          price: p.price != null ? String(p.price) : "",
          area: p.area != null ? String(p.area) : "",
          area_unit: p.area_unit || "sq.ft",
          bedroom: String(p.bedroom ?? 0),
          bathroom: String(p.bathroom ?? 0),
          balcony: String(p.balcony ?? 0),
          parking: String(p.parking ?? 0),
          furnishing: p.furnishing || "Unfurnished",
          ownership: p.ownership || "Freehold",
          construction_status: p.construction_status || "Ready to Move",
          possession_date: toDateInput(p.possession_date),
          description: p.description || "",
          address: p.address || "",
          city: p.city || "",
          state: p.state || "",
          country: p.country || "India",
          pincode: p.pincode || "",
          latitude: p.latitude != null ? String(p.latitude) : "",
          longitude: p.longitude != null ? String(p.longitude) : "",
        });
        setExistingImages(Array.isArray(p.images) ? p.images : []);
        setImagesToDelete([]);
        setNewImages([]);
        setNewImagePreviews([]);
        const plans =
          Array.isArray(p.floor_plans) && p.floor_plans.length
            ? p.floor_plans
            : p.floor_plan_url
              ? [p.floor_plan_url]
              : p.floor_plan
                ? [`/uploads/property/floor-plans/${p.floor_plan}`]
                : [];
        setExistingFloorPlans(plans);
        setRemoveFloorPlan(false);
        setFloorPlanFiles([]);
        setFloorPlanPreviews([]);
        const ids = Array.isArray(p.amenity_ids)
          ? p.amenity_ids
          : Array.isArray(p.amenities)
            ? p.amenities.map((a) => a.id ?? a.amenity_id)
            : [];
        setSelectedAmenities(ids.map((x) => String(x)));
      } catch (err) {
        toast.error(
          err?.response?.data?.message || err.message || "Failed to load property."
        );
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, propertyId, loadLookups, onClose]);

  const onNewImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImages((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const markImageForDeletion = (url) => {
    setImagesToDelete((prev) => [...prev, url]);
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const onFloorPlans = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFloorPlanFiles((prev) => [...prev, ...files]);
    setFloorPlanPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    setRemoveFloorPlan(false);
    e.target.value = "";
  };

  const removeNewFloorPlan = (index) => {
    setFloorPlanFiles((prev) => prev.filter((_, i) => i !== index));
    setFloorPlanPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingFloorPlan = (index) => {
    setExistingFloorPlans((prev) => prev.filter((_, i) => i !== index));
    setRemoveFloorPlan(true);
  };

  const toggleAmenity = (id) => {
    const key = String(id);
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const saveForm = async (e) => {
    e.preventDefault();
    if (!form.property_title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("category_id", String(parseInt(form.category_id, 10) || ""));
      fd.append("property_title", form.property_title.trim());
      fd.append("property_for", form.property_for);
      fd.append("property_type", form.property_type);
      fd.append("price", String(form.price ?? "").trim());
      fd.append("area", String(form.area ?? "").trim());
      fd.append("area_unit", form.area_unit);
      fd.append("bedroom", String(parseInt(form.bedroom, 10) || 0));
      fd.append("bathroom", String(parseInt(form.bathroom, 10) || 0));
      fd.append("balcony", String(parseInt(form.balcony, 10) || 0));
      fd.append("parking", String(parseInt(form.parking, 10) || 0));
      fd.append("furnishing", form.furnishing);
      fd.append("ownership", form.ownership);
      fd.append("construction_status", form.construction_status);
      if (form.possession_date) fd.append("possession_date", form.possession_date);
      fd.append("description", form.description);
      fd.append("address", form.address);
      fd.append("city", form.city);
      fd.append("state", form.state);
      fd.append("country", form.country);
      fd.append("pincode", form.pincode);
      if (form.latitude) fd.append("latitude", form.latitude);
      if (form.longitude) fd.append("longitude", form.longitude);
      fd.append(
        "amenities",
        JSON.stringify(selectedAmenities.map((x) => parseInt(x, 10)).filter(Boolean))
      );

      if (floorPlanFiles.length > 0) {
        floorPlanFiles.forEach((file) => fd.append("floor_plan", file));
      } else if (removeFloorPlan) {
        fd.append("remove_floor_plan", "1");
      } else if (existingFloorPlans.length > 0) {
        const names = existingFloorPlans
          .map((u) => String(u).split("/").pop())
          .filter(Boolean);
        if (names.length) fd.append("floor_plan", names.join(","));
      }

      if (imagesToDelete.length > 0) {
        const names = imagesToDelete.map((u) => String(u).split("/").pop());
        fd.append("deleted_images", JSON.stringify(names));
      }
      newImages.forEach((file) => fd.append("property_images", file));

      await updatePropertyApi(propertyId, fd);
      toast.success("Property updated successfully.");
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to update property."
      );
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={() => {
        if (busy) return;
        onClose();
      }}
      size="lg"
      title="Edit Property"
      sub={propertyId ? `#PROP-${propertyId} · core fields, media & amenities` : ""}
      footer={
        <>
          <button
            type="button"
            className="lp-btn lp-btn-ghost"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="property-edit-form"
            className="lp-btn lp-btn-primary"
            disabled={busy || loading}
          >
            {busy && <span className="lp-spin" style={{ display: "inline-flex" }} />}
            Save changes
          </button>
        </>
      }
    >
      {loading ? (
        <div style={{ padding: 24, textAlign: "center", opacity: 0.7 }}>
          Loading property…
        </div>
      ) : (
        <form id="property-edit-form" className="lp-form-grid" onSubmit={saveForm}>
          <div className="lp-field full">
            <label htmlFor="pe-title">Title *</label>
            <input
              id="pe-title"
              type="text"
              required
              value={form.property_title}
              onChange={(e) => setF("property_title", e.target.value)}
              placeholder="Property title"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-category">Category</label>
            <select
              id="pe-category"
              value={form.category_id}
              onChange={(e) => setF("category_id", e.target.value)}
            >
              <option value="">-- Select --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="lp-field">
            <label htmlFor="pe-for">List For</label>
            <select
              id="pe-for"
              value={form.property_for}
              onChange={(e) => setF("property_for", e.target.value)}
            >
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
            </select>
          </div>
          <div className="lp-field">
            <label htmlFor="pe-type">Property Type</label>
            <select
              id="pe-type"
              value={form.property_type}
              onChange={(e) => setF("property_type", e.target.value)}
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          <div className="lp-field">
            <label htmlFor="pe-price">Price (₹) *</label>
            <input
              id="pe-price"
              type="text"
              required
              value={form.price}
              onChange={(e) => setF("price", e.target.value)}
              placeholder="e.g. 4500000"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-area">Area</label>
            <input
              id="pe-area"
              type="text"
              value={form.area}
              onChange={(e) => setF("area", e.target.value)}
              placeholder="e.g. 1200"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-area-unit">Area Unit</label>
            <select
              id="pe-area-unit"
              value={form.area_unit}
              onChange={(e) => setF("area_unit", e.target.value)}
            >
              <option value="sq.ft">sq.ft</option>
              <option value="sq.m">sq.m</option>
              <option value="sq.yd">sq.yd</option>
              <option value="acre">acre</option>
              <option value="bigha">bigha</option>
            </select>
          </div>
          <div className="lp-field">
            <label htmlFor="pe-bed">Bedrooms</label>
            <input
              id="pe-bed"
              type="number"
              min="0"
              value={form.bedroom}
              onChange={(e) => setF("bedroom", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-bath">Bathrooms</label>
            <input
              id="pe-bath"
              type="number"
              min="0"
              value={form.bathroom}
              onChange={(e) => setF("bathroom", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-balcony">Balconies</label>
            <input
              id="pe-balcony"
              type="number"
              min="0"
              value={form.balcony}
              onChange={(e) => setF("balcony", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-parking">Parking</label>
            <input
              id="pe-parking"
              type="number"
              min="0"
              value={form.parking}
              onChange={(e) => setF("parking", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-furnishing">Furnishing</label>
            <select
              id="pe-furnishing"
              value={form.furnishing}
              onChange={(e) => setF("furnishing", e.target.value)}
            >
              <option value="Unfurnished">Unfurnished</option>
              <option value="Semi Furnished">Semi Furnished</option>
              <option value="Fully Furnished">Fully Furnished</option>
            </select>
          </div>
          <div className="lp-field">
            <label htmlFor="pe-ownership">Ownership</label>
            <select
              id="pe-ownership"
              value={form.ownership}
              onChange={(e) => setF("ownership", e.target.value)}
            >
              <option value="Freehold">Freehold</option>
              <option value="Leasehold">Leasehold</option>
              <option value="Co-operative Society">Co-operative Society</option>
            </select>
          </div>
          <div className="lp-field">
            <label htmlFor="pe-construction">Construction Status</label>
            <select
              id="pe-construction"
              value={form.construction_status}
              onChange={(e) => setF("construction_status", e.target.value)}
            >
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction">Under Construction</option>
              <option value="New Launch">New Launch</option>
            </select>
          </div>
          <div className="lp-field">
            <label htmlFor="pe-possession">Possession Date</label>
            <input
              id="pe-possession"
              type="date"
              value={form.possession_date}
              onChange={(e) => setF("possession_date", e.target.value)}
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="pe-description">Description</label>
            <textarea
              id="pe-description"
              rows={3}
              value={form.description}
              onChange={(e) => setF("description", e.target.value)}
              placeholder="Listing description…"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="pe-address">Address</label>
            <input
              id="pe-address"
              type="text"
              value={form.address}
              onChange={(e) => setF("address", e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-city">City</label>
            <input
              id="pe-city"
              type="text"
              value={form.city}
              onChange={(e) => setF("city", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-state">State</label>
            <input
              id="pe-state"
              type="text"
              value={form.state}
              onChange={(e) => setF("state", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-country">Country</label>
            <input
              id="pe-country"
              type="text"
              value={form.country}
              onChange={(e) => setF("country", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-pincode">Pincode</label>
            <input
              id="pe-pincode"
              type="text"
              value={form.pincode}
              onChange={(e) => setF("pincode", e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-lat">Latitude</label>
            <input
              id="pe-lat"
              type="text"
              value={form.latitude}
              onChange={(e) => setF("latitude", e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pe-lng">Longitude</label>
            <input
              id="pe-lng"
              type="text"
              value={form.longitude}
              onChange={(e) => setF("longitude", e.target.value)}
              placeholder="optional"
            />
          </div>

          <div className="lp-field full">
            <label>Amenities</label>
            {amenities.length === 0 ? (
              <div className="lp-field-hint" style={{ fontSize: 12, opacity: 0.7 }}>
                No amenities available.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 8,
                }}
              >
                {amenities.map((a) => {
                  const checked = selectedAmenities.includes(String(a.id));
                  return (
                    <label
                      key={a.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        border: "1px solid rgba(30,76,140,.15)",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        background: checked ? "rgba(124,185,61,.12)" : "#fff",
                        borderColor: checked ? "#7CB93D" : undefined,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAmenity(a.id)}
                      />
                      <span style={{ truncate: "ellipsis", overflow: "hidden" }}>
                        {a.amenity_name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lp-field full">
            <label>Gallery Images</label>
            {existingImages.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {existingImages.map((url, i) => (
                  <div
                    key={`ex-${i}`}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid rgba(30,76,140,.15)",
                    }}
                  >
                    <img
                      src={resolveImageUrl(url)}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => markImageForDeletion(url)}
                      title="Remove image"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "none",
                        background: "#ef4444",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label className="lp-btn lp-btn-ghost" style={{ cursor: "pointer", marginBottom: 0 }}>
                <FaImage size={12} />
                Add images
                <input type="file" accept="image/*" multiple hidden onChange={onNewImages} />
              </label>
              <span className="lp-field-hint" style={{ fontSize: 12, opacity: 0.7 }}>
                PNG, JPG · up to 20 per save
              </span>
            </div>
            {newImagePreviews.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {newImagePreviews.map((src, i) => (
                  <div
                    key={`new-${i}`}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid #7CB93D",
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "none",
                        background: "#ef4444",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                      }}
                    >
                      <FaTimes />
                    </button>
                    <span
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        fontSize: 9,
                        fontWeight: 700,
                        background: "#7CB93D",
                        color: "#fff",
                        padding: "1px 4px",
                        borderRadius: 4,
                      }}
                    >
                      NEW
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lp-field full">
            <label>Floor Plans</label>
            {(existingFloorPlans.length > 0 || floorPlanPreviews.length > 0) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {floorPlanPreviews.map((src, i) => (
                  <div
                    key={`fp-new-${i}`}
                    style={{
                      position: "relative",
                      aspectRatio: "4/3",
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid #7CB93D",
                      background: "#f8fafc",
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: 4,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFloorPlan(i)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "none",
                        background: "#ef4444",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      <FaTimes />
                    </button>
                    <span
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        fontSize: 9,
                        fontWeight: 700,
                        background: "#7CB93D",
                        color: "#fff",
                        padding: "1px 4px",
                        borderRadius: 4,
                      }}
                    >
                      NEW
                    </span>
                  </div>
                ))}
                {existingFloorPlans.map((url, i) => (
                  <div
                    key={`fp-ex-${i}`}
                    style={{
                      position: "relative",
                      aspectRatio: "4/3",
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid rgba(30,76,140,.15)",
                      background: "#f8fafc",
                    }}
                  >
                    <img
                      src={resolveImageUrl(url)}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: 4,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingFloorPlan(i)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "none",
                        background: "#ef4444",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label className="lp-btn lp-btn-ghost" style={{ cursor: "pointer", marginBottom: 0 }}>
                <FaImage size={12} />
                Add floor plans
                <input type="file" accept="image/*" multiple hidden onChange={onFloorPlans} />
              </label>
              <span className="lp-field-hint" style={{ fontSize: 12, opacity: 0.7 }}>
                Up to 10 images
              </span>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PropertyEditModal;
