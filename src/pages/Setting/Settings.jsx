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
  FaChevronRight,
  FaBriefcase,
  FaMapMarkerAlt,
  FaEnvelopeOpenText,
  FaPercent,
  FaClock,
  FaCrown,
  FaExclamationTriangle,
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

const STRENGTH_STEPS = [
  { label: "Too weak", tone: "s0" },
  { label: "Weak", tone: "s1" },
  { label: "Fair", tone: "s2" },
  { label: "Good", tone: "s3" },
  { label: "Strong", tone: "s4" },
];

const SectionTitle = ({ icon: Icon, children, hint }) => (
  <div className="st-section-title">
    <span className="st-section-ic">
      <Icon size={12} />
    </span>
    <span className="st-section-txt">{children}</span>
    {hint && <span className="st-section-hint">{hint}</span>}
    <i className="st-section-line" />
  </div>
);

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
          placeholder="••••••••"
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
      <div className="st-card-banner tone-blue">
        <span className="st-card-ic">
          <FaUser />
        </span>
        <div className="st-card-headings">
          <div className="st-card-title">Profile</div>
          <div className="st-card-desc">
            Your personal and professional details
          </div>
        </div>
        <span className="st-chip">
          <FaShieldAlt size={10} />
          {profile.role_name || "Member"}
        </span>
        <i className="st-banner-orb" aria-hidden />
      </div>

      <div className="st-card-body">
        <div className="st-cover">
          <div className="st-cover-pattern" aria-hidden />
          <div className="st-identity">
            <div className="st-avatar-wrap">
              <div className="st-avatar">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={displayName} />
                ) : (
                  getInitials(displayName)
                )}
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
            <div className="st-identity-info">
              <div className="st-identity-name">{displayName}</div>
              <div className="st-identity-meta">
                {profile.email || "—"}
                {profile.company_name && (
                  <span className="st-identity-dot">•</span>
                )}
                {profile.company_name && (
                  <span className="st-identity-company">
                    {profile.company_name}
                  </span>
                )}
              </div>
            </div>
            <div className="st-identity-stats">
              <div className="st-mini-stat">
                <span className="k">City</span>
                <span className="v">{profile.city || "—"}</span>
              </div>
              <div className="st-mini-stat">
                <span className="k">RERA</span>
                <span className="v">{profile.rera_number || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={saveProfile}>
          <SectionTitle icon={FaUser} hint="Required fields marked">
            Personal details
          </SectionTitle>
          <div className="st-form">
            <div className="lp-field">
              <label htmlFor="f-name">Full name *</label>
              <input
                id="f-name"
                value={profile.full_name}
                onChange={(e) => set("full_name")(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="lp-field">
              <label htmlFor="f-mobile">Mobile *</label>
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
          </div>

          <SectionTitle icon={FaBriefcase} hint="Shown on listings">
            Business
          </SectionTitle>
          <div className="st-form">
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
          </div>

          <SectionTitle icon={FaMapMarkerAlt}>Address</SectionTitle>
          <div className="st-form">
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
            <span className="st-foot-hint">
              <FaInfoCircle size={11} /> Changes apply across your listings
            </span>
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
  const passed = checks.filter((c) => c.ok).length;
  const allOk = passed === checks.length;
  const match = newPw.length > 0 && newPw === confirmPw;
  const strength = STRENGTH_STEPS[match ? Math.max(passed, 1) : passed];

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
      <div className="st-card-banner tone-green">
        <span className="st-card-ic">
          <FaShieldAlt />
        </span>
        <div className="st-card-headings">
          <div className="st-card-title">Security</div>
          <div className="st-card-desc">Update your account password</div>
        </div>
        <span className="st-chip green">
          <FaLock size={10} />
          Encrypted
        </span>
        <i className="st-banner-orb" aria-hidden />
      </div>

      <div className="st-card-body">
        <form onSubmit={submit}>
          <SectionTitle icon={FaLock} hint="Use a unique password">
            Change password
          </SectionTitle>
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

          {newPw.length > 0 && (
            <div className="st-strength">
              <div className="st-strength-top">
                <span className="st-strength-label">Strength</span>
                <span className={`st-strength-val ${strength.tone}`}>
                  {strength.label}
                  <em>
                    {passed}/{checks.length}
                  </em>
                </span>
              </div>
              <div className="st-strength-bars" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <i
                    key={i}
                    className={`${strength.tone} ${i < passed ? "on" : ""}`}
                  />
                ))}
              </div>
            </div>
          )}

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

          <div className="st-tip">
            <FaInfoCircle size={13} />
            Avoid reusing passwords from other sites. A passphrase of 4+
            unrelated words works well.
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
    newsletter_heading: "",
    popup_heading: "",
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
      const payload = {
        platform_name: form.platform_name.trim(),
        revenue_percent: form.revenue_percent,
        token_hours: form.token_hours,
      };
      const news = form.newsletter_heading.trim();
      const popup = form.popup_heading.trim();
      if (news) payload.newsletter_heading = news;
      if (popup) payload.popup_heading = popup;
      const res = await updateSettingsApi(payload);
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

  const ro = !isSuperAdmin;

  return (
    <div className="st-card">
      <div className="st-card-banner tone-amber">
        <span className="st-card-ic">
          <FaSlidersH />
        </span>
        <div className="st-card-headings">
          <div className="st-card-title">Platform</div>
          <div className="st-card-desc">
            Global brand, revenue, session and site copy parameters
          </div>
        </div>
        <span className="st-chip amber">
          <FaCrown size={10} />
          {isSuperAdmin ? "Super Admin" : "View only"}
        </span>
        <i className="st-banner-orb" aria-hidden />
      </div>

      <div className="st-card-body">
        {ro && (
          <div className="st-ro-note">
            <FaInfoCircle size={13} />
            Only a Super Admin can edit platform settings. You can view the
            current values.
          </div>
        )}

        <form onSubmit={submit}>
          <SectionTitle icon={FaCrown}>Brand</SectionTitle>
          <div className="st-form">
            <div className="lp-field full">
              <label htmlFor="pf-name">Platform name</label>
              <input
                id="pf-name"
                value={form.platform_name}
                onChange={(e) => set("platform_name")(e.target.value)}
                readOnly={ro}
                disabled={ro}
                className={ro ? "st-readonly" : ""}
                placeholder="e.g. Edge Realty"
              />
            </div>
          </div>

          <SectionTitle icon={FaPercent} hint="Applies to new deals">
            Revenue &amp; session
          </SectionTitle>
          <div className="st-form">
            <div className="lp-field">
              <label htmlFor="pf-rev">Revenue cut (%)</label>
              <div className="st-input-ic">
                <FaPercent size={11} />
                <input
                  id="pf-rev"
                  type="number"
                  min="0"
                  max="100"
                  value={form.revenue_percent}
                  onChange={(e) => set("revenue_percent", e.target.value)}
                  readOnly={ro}
                  disabled={ro}
                  className={ro ? "st-readonly" : ""}
                />
              </div>
            </div>
            <div className="lp-field">
              <label htmlFor="pf-token">Token lifetime (hours)</label>
              <div className="st-input-ic">
                <FaClock size={11} />
                <input
                  id="pf-token"
                  type="number"
                  min="1"
                  max="720"
                  value={form.token_hours}
                  onChange={(e) => set("token_hours", e.target.value)}
                  readOnly={ro}
                  disabled={ro}
                  className={ro ? "st-readonly" : ""}
                />
              </div>
            </div>
          </div>

          <SectionTitle
            icon={FaEnvelopeOpenText}
            hint="Live on website & app"
          >
            Site copy
          </SectionTitle>
          <div className="st-form">
            <div className="lp-field">
              <label htmlFor="pf-news">Newsletter heading</label>
              <input
                id="pf-news"
                type="text"
                value={form.newsletter_heading}
                onChange={(e) => set("newsletter_heading", e.target.value)}
                placeholder="e.g. Get A Discount"
                readOnly={ro}
                disabled={ro}
                className={ro ? "st-readonly" : ""}
                maxLength={160}
              />
              <div className="st-field-hint">
                Shown above the footer newsletter form on the website.
              </div>
            </div>
            <div className="lp-field">
              <label htmlFor="pf-popup">Lead popup heading</label>
              <input
                id="pf-popup"
                type="text"
                value={form.popup_heading}
                onChange={(e) => set("popup_heading", e.target.value)}
                placeholder="e.g. Subscribe to our Newsletter"
                readOnly={ro}
                disabled={ro}
                className={ro ? "st-readonly" : ""}
                maxLength={160}
              />
              <div className="st-field-hint">
                Shown in the website and app lead popup newsletter block.
              </div>
            </div>
            <div className="lp-field full">
              <div className="st-previews">
                <div className="st-preview">
                  <span className="st-preview-tag">
                    <i className="dot green" /> Footer · website
                  </span>
                  <div className="st-preview-frame">
                    <div className="st-preview-title">
                      {form.newsletter_heading || "Get A Discount"}
                    </div>
                    <div className="st-preview-row">
                      <span className="st-preview-input">
                        Enter your email
                      </span>
                      <span className="st-preview-btn">Subscribe</span>
                    </div>
                  </div>
                </div>
                <div className="st-preview">
                  <span className="st-preview-tag">
                    <i className="dot blue" /> Lead popup · web &amp; app
                  </span>
                  <div className="st-preview-frame">
                    <div className="st-preview-title">
                      {form.popup_heading || "Subscribe to our Newsletter"}
                    </div>
                    <div className="st-preview-row">
                      <span className="st-preview-input">
                        Enter your email
                      </span>
                      <span className="st-preview-btn">Join</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="st-foot">
              <span className="st-foot-hint">
                <FaInfoCircle size={11} /> Copy updates go live immediately
              </span>
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
    </div>
  );
};

/* ─────────────────────────────────────────────
    MAIN
───────────────────────────────────────────── */
const TABS = [
  {
    key: "profile",
    label: "Profile",
    desc: "Personal & business details",
    icon: FaUser,
    tone: "blue",
  },
  {
    key: "security",
    label: "Security",
    desc: "Password & account safety",
    icon: FaLock,
    tone: "green",
  },
  {
    key: "platform",
    label: "Platform",
    desc: "Brand, revenue & site copy",
    icon: FaSlidersH,
    tone: "amber",
  },
];

const Settings = () => {
  const [tab, setTab] = useState("profile");
  const active = TABS.find((t) => t.key === tab) || TABS[0];

  return (
    <div className="lp-page st-page">
      <ListHero
        eyebrow="Account"
        sub="Manage your profile, password and platform configuration"
      >
        Settings
      </ListHero>

      <div className="st-layout">
        <nav className="st-nav" role="tablist" aria-label="Settings sections">
          <div className="st-nav-kicker">Sections</div>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`st-nav-item tone-${t.tone} ${
                tab === t.key ? "active" : ""
              }`}
              onClick={() => setTab(t.key)}
            >
              <span className="st-nav-ic">
                <t.icon size={14} />
              </span>
              <span className="st-nav-text">
                <span className="st-nav-label">{t.label}</span>
                <span className="st-nav-desc">{t.desc}</span>
              </span>
              <FaChevronRight className="st-nav-arrow" size={11} />
              {tab === t.key && <i className="st-nav-glow" aria-hidden />}
            </button>
          ))}
          <div className="st-nav-foot">
            <FaShieldAlt size={12} />
            <span>
              Session protected · changes are logged
            </span>
          </div>
        </nav>

        <div
          className="st-main"
          role="tabpanel"
          key={active.key}
          aria-label={active.label}
        >
          {tab === "profile" && <ProfilePanel />}
          {tab === "security" && <SecurityPanel />}
          {tab === "platform" && <PlatformPanel />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
