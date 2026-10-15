import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaUser,
  FaShieldAlt,
  FaSlidersH,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaInfoCircle,
  FaLock,
} from "react-icons/fa";
import {
  getProfileApi,
  updateProfileApi,
  changePasswordApi,
  getSettingsApi,
  updateSettingsApi,
} from "../../services/auth.api";
import { ListHero } from "../../components/ListUI";
import { getInitials } from "../../utils/list";
import "./Settings.css";

/* ─────────────────────────────────────────────
    HELPERS
───────────────────────────────────────────── */
const emptyProfile = {
  full_name: "",
  email: "",
  mobile: "",
  role_name: "",
  company_name: "",
  rera_number: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  profile_image: "",
};

const PASSWORD_RULES = [
  { key: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { key: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { key: "num", label: "A number", test: (p) => /\d/.test(p) },
];

const PasswordInput = ({ id, label, value, onChange, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="lp-field">
      <label htmlFor={id}>{label}</label>
      <div className="st-pw-wrap">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="st-pw-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
    PROFILE PANEL
───────────────────────────────────────────── */
const ProfilePanel = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await getProfileApi();
      const data = res.data?.data || res.data || {};
      setProfile((p) => ({ ...p, ...data }));
    } catch {
      toast.error("Unable to load profile.");
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const set = (key) => (value) => setProfile((p) => ({ ...p, [key]: value }));

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.full_name.trim() || !profile.mobile.trim()) {
      toast.error("Full name and mobile number are required.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("full_name", profile.full_name.trim());
      fd.append("mobile", profile.mobile.trim());
      fd.append("company_name", profile.company_name || "");
      fd.append("rera_number", profile.rera_number || "");
      fd.append("address", profile.address || "");
      fd.append("city", profile.city || "");
      fd.append("state", profile.state || "");
      fd.append("country", profile.country || "");
      fd.append("pincode", profile.pincode || "");
      if (file) fd.append("profile_image", file);
      const res = await updateProfileApi(fd);
      const data = res.data?.data || res.data || {};
      setProfile((p) => ({ ...p, ...data }));
      setFile(null);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile.full_name || "User";
  const avatarSrc = preview || profile.profile_image || "";

  return (
    <div className="st-card">
      <div className="st-card-head">
        <span className="st-card-icon">
          <FaUser />
        </span>
        <div>
          <div className="st-card-title">Profile</div>
          <div className="st-card-desc">
            Your personal and professional details
          </div>
        </div>
      </div>

      <div className="st-profile-top">
        <div className="st-avatar-wrap">
          <div className="st-avatar">
            {avatarSrc ? <img src={avatarSrc} alt={displayName} /> : getInitials(displayName)}
          </div>
          <label className="st-avatar-edit" title="Change photo">
            <FaCamera />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={onFile}
            />
          </label>
        </div>
        <div>
          <div className="st-identity-name">{displayName}</div>
          <div className="st-identity-meta">
            {profile.email || "—"}
          </div>
          <span className="st-badge">
            <FaShieldAlt size={10} />
            {profile.role_name || "Member"}
          </span>
        </div>
      </div>

      <form onSubmit={saveProfile}>
        <div className="st-form">
          <div className="lp-field">
            <label htmlFor="f-name">Full name</label>
            <input
              id="f-name"
              value={profile.full_name}
              onChange={(e) => set("full_name")(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="f-mobile">Mobile</label>
            <input
              id="f-mobile"
              value={profile.mobile}
              onChange={(e) => set("mobile")(e.target.value)}
              placeholder="Mobile number"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="f-email">Email</label>
            <input
              id="f-email"
              className="st-readonly"
              value={profile.email}
              readOnly
              disabled
            />
          </div>
          <div className="lp-field">
            <label htmlFor="f-role">Role</label>
            <input
              id="f-role"
              className="st-readonly"
              value={profile.role_name}
              readOnly
              disabled
            />
          </div>
          <div className="lp-field">
            <label htmlFor="f-company">Company name</label>
            <input
              id="f-company"
              value={profile.company_name || ""}
              onChange={(e) => set("company_name")(e.target.value)}
              placeholder="Company / agency"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="f-rera">RERA number</label>
            <input
              id="f-rera"
              value={profile.rera_number || ""}
              onChange={(e) => set("rera_number")(e.target.value)}
              placeholder="RERA registration"
            />
          </div>
          <div className="lp-field full">
            <label htmlFor="f-address">Address</label>
            <textarea
              id="f-address"
              value={profile.address || ""}
              onChange={(e) => set("address")(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="lp-field">
            <label htmlFor="f-city">City</label>
            <input
              id="f-city"
              value={profile.city || ""}
              onChange={(e) => set("city")(e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="f-state">State</label>
            <input
              id="f-state"
              value={profile.state || ""}
              onChange={(e) => set("state")(e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="f-country">Country</label>
            <input
              id="f-country"
              value={profile.country || ""}
              onChange={(e) => set("country")(e.target.value)}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="f-pincode">Pincode</label>
            <input
              id="f-pincode"
              value={profile.pincode || ""}
              onChange={(e) => set("pincode")(e.target.value)}
            />
          </div>
        </div>

        <div className="st-foot">
          <button
            type="submit"
            className="lp-btn lp-btn-primary"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─────────────────────────────────────────────
    SECURITY PANEL
───────────────────────────────────────────── */
const SecurityPanel = () => {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const checks = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(newPw) })),
    [newPw]
  );
  const allOk = checks.every((c) => c.ok);
  const match = newPw.length > 0 && newPw === confirmPw;

  const submit = async (e) => {
    e.preventDefault();
    if (!oldPw || !newPw) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (!allOk) {
      toast.error("New password does not meet all requirements.");
      return;
    }
    if (!match) {
      toast.error("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await changePasswordApi({
        old_password: oldPw,
        new_password: newPw,
      });
      toast.success("Password changed.");
      setOldPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="st-card">
      <div className="st-card-head">
        <span className="st-card-icon green">
          <FaShieldAlt />
        </span>
        <div>
          <div className="st-card-title">Security</div>
          <div className="st-card-desc">Update your account password</div>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="st-form">
          <div className="lp-field full">
            <PasswordInput
              id="pw-old"
              label="Current password"
              value={oldPw}
              onChange={setOldPw}
              autoComplete="current-password"
            />
          </div>
          <div className="lp-field">
            <PasswordInput
              id="pw-new"
              label="New password"
              value={newPw}
              onChange={setNewPw}
              autoComplete="new-password"
            />
          </div>
          <div className="lp-field">
            <PasswordInput
              id="pw-confirm"
              label="Confirm new password"
              value={confirmPw}
              onChange={setConfirmPw}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="st-rules">
          {checks.map((c) => (
            <div className={`st-rule ${c.ok ? "ok" : ""}`} key={c.key}>
              <span className="st-rule-dot">
                {c.ok ? <FaCheck /> : ""}
              </span>
              {c.label}
            </div>
          ))}
        </div>

        <div className="st-foot">
          <button
            type="submit"
            className="lp-btn lp-btn-primary"
            disabled={saving || !allOk || !match}
          >
            {saving ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ─────────────────────────────────────────────
    PLATFORM PANEL
───────────────────────────────────────────── */
const PlatformPanel = () => {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);
  const isSuperAdmin = Number(storedUser.role_id) === 1;

  const [form, setForm] = useState({
    platform_name: "",
    revenue_percent: "",
    token_hours: "",
  });
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const res = await getSettingsApi();
      const data = res.data?.data || res.data || {};
      setForm((f) => ({ ...f, ...data }));
    } catch {
      toast.error("Unable to load platform settings.");
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.platform_name.trim()) {
      toast.error("Platform name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await updateSettingsApi({
        platform_name: form.platform_name.trim(),
        revenue_percent: form.revenue_percent,
        token_hours: form.token_hours,
      });
      const data = res.data?.data || res.data || {};
      setForm((f) => ({ ...f, ...data }));
      toast.success("Platform settings saved.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save platform settings."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="st-card">
      <div className="st-card-head">
        <span className="st-card-icon amber">
          <FaSlidersH />
        </span>
        <div>
          <div className="st-card-title">Platform</div>
          <div className="st-card-desc">
            Global brand, revenue and session parameters
          </div>
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="st-ro-note">
          <FaInfoCircle size={13} />
          Only a Super Admin can edit platform settings. You can view the current values.
        </div>
      )}

      <form onSubmit={submit}>
        <div className="st-form">
          <div className="lp-field full">
            <label htmlFor="pf-name">Platform name</label>
            <input
              id="pf-name"
              value={form.platform_name}
              onChange={(e) => set("platform_name")(e.target.value)}
              readOnly={!isSuperAdmin}
              disabled={!isSuperAdmin}
              className={!isSuperAdmin ? "st-readonly" : ""}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pf-rev">Revenue cut (%)</label>
            <input
              id="pf-rev"
              type="number"
              min="0"
              max="100"
              value={form.revenue_percent}
              onChange={(e) => set("revenue_percent")(e.target.value)}
              readOnly={!isSuperAdmin}
              disabled={!isSuperAdmin}
              className={!isSuperAdmin ? "st-readonly" : ""}
            />
          </div>
          <div className="lp-field">
            <label htmlFor="pf-token">Token lifetime (hours)</label>
            <input
              id="pf-token"
              type="number"
              min="1"
              max="720"
              value={form.token_hours}
              onChange={(e) => set("token_hours")(e.target.value)}
              readOnly={!isSuperAdmin}
              disabled={!isSuperAdmin}
              className={!isSuperAdmin ? "st-readonly" : ""}
            />
          </div>
        </div>

        {isSuperAdmin && (
          <div className="st-foot">
            <button
              type="submit"
              className="lp-btn lp-btn-primary"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

/* ─────────────────────────────────────────────
    MAIN
───────────────────────────────────────────── */
const TABS = [
  { key: "profile", label: "Profile", icon: FaUser },
  { key: "security", label: "Security", icon: FaLock },
  { key: "platform", label: "Platform", icon: FaSlidersH },
];

const Settings = () => {
  const [tab, setTab] = useState("profile");

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Account"
        sub="Manage your profile, password and platform configuration"
      >
        Settings
      </ListHero>

      <div className="st-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`st-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfilePanel />}
      {tab === "security" && <SecurityPanel />}
      {tab === "platform" && <PlatformPanel />}
    </div>
  );
};

export default Settings;
