import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { FaSyncAlt, FaInfoCircle, FaPenFancy, FaEnvelopeOpenText, FaBalanceScale } from "react-icons/fa";
import { getContentApi, updateContentApi } from "../../services/auth.api";
import { ListHero } from "../../components/ListUI";
import "../Setting/Settings.css";

// About page er section gulo — prati section ekta sub-tab, field gulo
// site_settings er theke (about_* keys) load/save hoy.
const ABOUT_SECTIONS = [
  {
    id: "hero",
    label: "Hero",
    fields: [
      {
        key: "about_hero_eyebrow",
        label: "Eyebrow",
        type: "input",
        ph: "Redefining Modern Living",
      },
      {
        key: "about_hero_title",
        label: "Hero Title",
        type: "input",
        full: true,
        ph: "Architecting Dreams into *Reality*",
        hint: "*word* diye italic green highlight kora jabe.",
      },
      { key: "about_hero_sub", label: "Hero Subtitle", type: "textarea", rows: 2, full: true },
      {
        key: "about_hero_trust",
        label: "Trust Row",
        type: "textarea",
        rows: 2,
        full: true,
        ph: "12,000+ | happy families\n4.9 | on Google",
        hint: "Ek line e ek: Value | Text — icons (avatars/stars) auto add hoy.",
      },
      {
        key: "about_hero_stats",
        label: "Glass Stat Cards",
        type: "textarea",
        rows: 3,
        full: true,
        ph: "1200+ | Properties Managed\n99.2% | Client Satisfaction",
        hint: "Ek line e ek: Value | Label — animated counter.",
      },
      {
        key: "about_hero_highlights",
        label: "Highlight Cards",
        type: "textarea",
        rows: 3,
        full: true,
        ph: "Award-Winning Brokerage | Trusted since 2010 · RERA registered\n$2.4B+ in Sales Volume | Across 50+ cities worldwide",
        hint: "Ek line e ek: Title | Subtitle",
      },
    ],
  },
  {
    id: "awards",
    label: "Awards",
    fields: [
      {
        key: "about_awards",
        label: "Awards Marquee",
        type: "textarea",
        rows: 8,
        full: true,
        ph: "Top Broker 2024\nRERA Registered\nGoogle 4.9 Rating",
        hint: "Ek line e ek award label — icon gulo list er order onujayi cycle hobe.",
      },
    ],
  },
  {
    id: "overview",
    label: "Overview",
    fields: [
      { key: "about_overview_eyebrow", label: "Eyebrow", type: "input", ph: "Who We Are" },
      {
        key: "about_overview_title",
        label: "Section Title",
        type: "input",
        full: true,
        ph: "Pioneering Excellence in Luxury Real Estate",
      },
      {
        key: "about_overview_para",
        label: "Intro Paragraphs",
        type: "textarea",
        rows: 5,
        full: true,
        hint: "Blank line (faka line) diye paragraph split hoy.",
      },
      {
        key: "about_overview_list",
        label: "Checklist",
        type: "textarea",
        rows: 3,
        full: true,
        hint: "Ek line e ek checklist item.",
      },
      {
        key: "about_overview_stats",
        label: "Counters",
        type: "textarea",
        rows: 3,
        full: true,
        ph: "$2.4B+ | Volume Sold\n50+ | Cities Covered\n15+ | Years of Trust",
        hint: "Ek line e ek: Value | Label",
      },
      { key: "about_overview_img1", label: "Main Image URL", type: "input", full: true },
      { key: "about_overview_img2", label: "Overlay Image URL", type: "input", full: true },
      {
        key: "about_overview_badge_title",
        label: "Badge Title",
        type: "input",
        ph: "Award Winning",
      },
      {
        key: "about_overview_badge_sub",
        label: "Badge Subtitle",
        type: "input",
        ph: "Trusted brokerage since 2010",
      },
      { key: "about_mission_title", label: "Mission Title", type: "input", ph: "Our Mission" },
      { key: "about_mission", label: "Mission Text", type: "textarea", rows: 4 },
      { key: "about_vision_title", label: "Vision Title", type: "input", ph: "Our Vision" },
      { key: "about_vision", label: "Vision Text", type: "textarea", rows: 4 },
    ],
  },
  {
    id: "values",
    label: "Values",
    fields: [
      { key: "about_values_eyebrow", label: "Eyebrow", type: "input", ph: "Why Choose Us" },
      {
        key: "about_values_title",
        label: "Section Title",
        type: "input",
        full: true,
        ph: "Why Discerning Clients Choose Us",
      },
      { key: "about_values_sub", label: "Section Subtitle", type: "textarea", rows: 2, full: true },
      {
        key: "about_stats",
        label: "Stats Band",
        type: "textarea",
        rows: 5,
        full: true,
        ph: "$2.4B+ | Volume Sold\n1200+ | Properties Managed\n99.2% | Client Satisfaction",
        hint: "Ek line e ek: Value | Label — value e prefix/suffix number er sathe thakte pare.",
      },
      {
        key: "about_values",
        label: "Why Choose Us Cards",
        type: "textarea",
        rows: 6,
        full: true,
        ph: "Vetted Portfolio | Every property undergoes a rigorous 50-point inspection.",
        hint: "Ek line e ek card: Title | Desc — icon gulo order onujayi cycle hobe.",
      },
    ],
  },
  {
    id: "journey",
    label: "Journey",
    fields: [
      {
        key: "about_milestones_eyebrow",
        label: "Milestones Eyebrow",
        type: "input",
        ph: "Our Journey",
      },
      {
        key: "about_milestones_title",
        label: "Milestones Title",
        type: "input",
        full: true,
        ph: "A Decade of Milestones",
      },
      { key: "about_milestones_sub", label: "Milestones Subtitle", type: "textarea", rows: 2, full: true },
      {
        key: "about_milestones",
        label: "Timeline",
        type: "textarea",
        rows: 6,
        full: true,
        ph: "2010 | The Beginning | Founded in a single office with a bold promise.",
        hint: "Ek line e ek milestone: Year | Title | Desc",
      },
      {
        key: "about_steps_eyebrow",
        label: "Steps Eyebrow",
        type: "input",
        ph: "How It Works",
      },
      {
        key: "about_steps_title",
        label: "Steps Title",
        type: "input",
        full: true,
        ph: "The Acquisition Journey",
      },
      { key: "about_steps_sub", label: "Steps Subtitle", type: "textarea", rows: 2, full: true },
      {
        key: "about_steps",
        label: "Journey Steps",
        type: "textarea",
        rows: 4,
        full: true,
        ph: "Consultation | Understanding your investment criteria and lifestyle desires.",
        hint: "Ek line e ek step: Title | Desc — number (01, 02…) auto hoy.",
      },
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    fields: [
      { key: "about_gallery_eyebrow", label: "Eyebrow", type: "input", ph: "Inside Edge" },
      {
        key: "about_gallery_title",
        label: "Section Title",
        type: "input",
        full: true,
        ph: "Where Expertise Meets Elegance",
      },
      { key: "about_gallery_sub", label: "Section Subtitle", type: "textarea", rows: 2, full: true },
      {
        key: "about_gallery",
        label: "Gallery Images",
        type: "textarea",
        rows: 4,
        full: true,
        ph: "https://example.com/hq.jpg | Our Headquarters",
        hint: "Ek line e ek image: ImageURL | Label — prothom ta boro card, achta regular size hobe.",
      },
    ],
  },
  {
    id: "team",
    label: "Team",
    fields: [
      { key: "about_team_eyebrow", label: "Eyebrow", type: "input", ph: "Our People" },
      {
        key: "about_team_title",
        label: "Section Title",
        type: "input",
        full: true,
        ph: "Leadership Team",
      },
      { key: "about_team_sub", label: "Section Subtitle", type: "textarea", rows: 2, full: true },
      {
        key: "about_team",
        label: "Team Members",
        type: "textarea",
        rows: 4,
        full: true,
        ph: "Sarah Jenkins | Managing Principal & Founder | https://example.com/photo.jpg",
        hint: "Ek line e ek member: Name | Role | ImageURL",
      },
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    fields: [
      {
        key: "about_testimonials",
        label: "Testimonials",
        type: "textarea",
        rows: 6,
        full: true,
        ph: "Their market foresight and discretion are completely unmatched. | Marcus & Eleanor Vance | Estate Buyers",
        hint: "Ek line e ek: Quote | Name | Role",
      },
    ],
  },
  {
    id: "cta",
    label: "CTA",
    fields: [
      { key: "about_cta_eyebrow", label: "Eyebrow", type: "input", ph: "Let's Begin" },
      {
        key: "about_cta_title",
        label: "CTA Title",
        type: "input",
        full: true,
        ph: "Ready to Find Your *Dream* Property?",
        hint: "*word* diye italic green highlight kora jabe.",
      },
      { key: "about_cta_sub", label: "CTA Subtitle", type: "textarea", rows: 2, full: true },
      {
        key: "about_cta_card_title",
        label: "Contact Card Title",
        type: "input",
        full: true,
        ph: "Reach us directly",
      },
    ],
  },
];

const CONTACT_FIELDS = [
  {
    key: "_contact_note",
    label: "",
    type: "note",
    note: "Phone, email & address manage hoy Website Footer page e (Contact & Location panel) — oi same data Contact page o use hoy.",
    full: true,
  },
  {
    key: "contact_hours",
    label: "Office Hours",
    type: "textarea",
    rows: 5,
    ph: "Monday - Friday | 9:00 AM - 6:00 PM\nSaturday | 10:00 AM - 4:00 PM\nSunday | Closed",
    hint: "Ek line e ek row: Days | Time",
  },
  {
    key: "contact_faq",
    label: "FAQ",
    type: "textarea",
    rows: 5,
    ph: "How do I list my property? | Sign up as an owner and submit your listing — our team verifies within 24 hours.",
    hint: "Ek line e ek question: Question | Answer",
  },
  {
    key: "contact_whatsapp",
    label: "WhatsApp Number",
    type: "input",
    ph: "919876543210",
    hint: "Country code diye, bina + diye (jemon 919876543210)",
  },
  {
    key: "contact_map",
    label: "Google Map Embed URL",
    type: "textarea",
    rows: 3,
    full: true,
    ph: "https://www.google.com/maps/embed?pb=...",
  },
];

const LEGAL_SECTIONS = [
  {
    id: "privacy",
    label: "Privacy",
    fields: [
      {
        key: "legal_privacy_title",
        label: "Page Title",
        type: "input",
        ph: "Privacy Policy",
      },
      {
        key: "legal_privacy_updated",
        label: "Last Updated Line",
        type: "input",
        full: true,
        ph: "Last updated: 24 October 2026",
      },
      {
        key: "legal_privacy_content",
        label: "Page Content",
        type: "textarea",
        rows: 14,
        full: true,
        hint: "Blank line (faka line) diye paragraph tokho — heading syntax support hoy na.",
      },
    ],
  },
  {
    id: "terms",
    label: "Terms",
    fields: [
      {
        key: "legal_terms_title",
        label: "Page Title",
        type: "input",
        ph: "Terms & Conditions",
      },
      {
        key: "legal_terms_updated",
        label: "Last Updated Line",
        type: "input",
        full: true,
        ph: "Last updated: 24 October 2026",
      },
      {
        key: "legal_terms_content",
        label: "Page Content",
        type: "textarea",
        rows: 14,
        full: true,
        hint: "Blank line (faka line) diye paragraph tokho — heading syntax support hoy na.",
      },
    ],
  },
];

const CONTACT_SECTIONS = [{ id: "contact", label: "Contact", fields: CONTACT_FIELDS }];

const TABS = {
  about: { label: "About Page", icon: FaPenFancy, sections: ABOUT_SECTIONS },
  contact: { label: "Contact Page", icon: FaEnvelopeOpenText, sections: CONTACT_SECTIONS },
  legal: { label: "Legal Pages", icon: FaBalanceScale, sections: LEGAL_SECTIONS },
};

const CONTENT_KEYS = Object.values(TABS).flatMap((t) =>
  t.sections.flatMap((s) => s.fields.map((f) => f.key))
);

const EMPTY_FORM = {};
CONTENT_KEYS.forEach((k) => (EMPTY_FORM[k] = ""));

const PageContent = () => {
  const isSuperAdmin = useMemo(() => {
    try {
      return Number(JSON.parse(localStorage.getItem("user"))?.role_id) === 1;
    } catch {
      return false;
    }
  }, []);

  const [tab, setTab] = useState("about");
  const [section, setSection] = useState(ABOUT_SECTIONS[0].id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeSections = TABS[tab].sections;
  const activeSection = useMemo(
    () => activeSections.find((s) => s.id === section) || activeSections[0],
    [activeSections, section]
  );

  const loadData = useCallback(async () => {
    try {
      const res = await getContentApi();
      const data = res?.data?.data || {};
      setForm((f) => ({ ...EMPTY_FORM, ...f, ...data }));
    } catch {
      toast.error("Unable to load page content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const saveTab = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fields = activeSection.fields;
    const payload = {};
    fields.forEach((f) => {
      if (f.type !== "note") payload[f.key] = form[f.key] ?? "";
    });
    try {
      const res = await updateContentApi(payload);
      const data = res?.data?.data || {};
      setForm((f) => ({ ...f, ...data }));
      const tabName = TABS[tab].label.replace(" Page", "");
      toast.success(
        activeSections.length > 1
          ? `${tabName} · ${activeSection.label} content saved.`
          : `${tabName} content saved.`
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  const TabBtn = ({ id, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`lp-btn ${tab === id ? "lp-btn-primary" : "lp-btn-ghost"}`}
    >
      <Icon size={12} />
      {label}
    </button>
  );

  const renderField = (f) => {
    if (f.type === "note") {
      return (
        <div className={`lp-field ${f.full ? "full" : ""}`} key={f.key}>
          <div className="st-ro-note" style={{ margin: 0 }}>
            <FaInfoCircle size={13} />
            <span dangerouslySetInnerHTML={{ __html: f.note }} />
          </div>
        </div>
      );
    }
    const id = `pc-${f.key.replace(/_/g, "-")}`;
    const ro = {
      readOnly: !isSuperAdmin,
      className: !isSuperAdmin ? "st-readonly" : "",
    };
    return (
      <div className={`lp-field ${f.full ? "full" : ""}`} key={f.key}>
        <label htmlFor={id}>{f.label}</label>
        {f.type === "textarea" ? (
          <textarea
            id={id}
            rows={f.rows || 3}
            value={form[f.key] ?? ""}
            placeholder={f.ph || ""}
            onChange={(e) => setF(f.key, e.target.value)}
            {...ro}
          />
        ) : (
          <input
            id={id}
            type="text"
            value={form[f.key] ?? ""}
            placeholder={f.ph || ""}
            onChange={(e) => setF(f.key, e.target.value)}
            {...ro}
          />
        )}
        {f.hint && (
          <small style={{ color: "var(--text-light)", fontSize: 12 }}>{f.hint}</small>
        )}
      </div>
    );
  };

  return (
    <div className="lp-page">
      <ListHero
        eyebrow="Website Content"
        sub="About and Contact page content — write once, website e live."
        actions={
          <button
            type="button"
            className="lp-btn lp-btn-ghost"
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            disabled={loading}
          >
            <FaSyncAlt className={loading ? "lp-spin" : ""} size={13} />
            Refresh
          </button>
        }
      >
        Page <span className="lp-accent">Content</span>
      </ListHero>

      <div className="lp-panel">
        <div className="lp-panel-head">
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {Object.entries(TABS).map(([id, t]) => (
              <TabBtn key={id} id={id} icon={t.icon} label={t.label} />
            ))}
          </div>
          <div className="lp-panel-sub">
            {loading
              ? "Loading…"
              : activeSections.length > 1
                ? `Editing ${TABS[tab].label} · ${activeSection.label}`
                : `Editing ${TABS[tab].label}`}
          </div>
        </div>

        {activeSections.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexWrap: "wrap",
              padding: "0 24px 14px",
              borderBottom: "1px solid rgba(30, 76, 140, 0.08)",
              marginBottom: 16,
            }}
          >
            {activeSections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`lp-btn ${activeSection.id === s.id ? "lp-btn-primary" : "lp-btn-ghost"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {!isSuperAdmin && (
          <div className="st-ro-note" style={{ margin: "0 24px 16px" }}>
            <FaInfoCircle size={13} />
            Only a Super Admin can edit page content. You can view the current values.
          </div>
        )}

        <form onSubmit={saveTab} style={{ padding: "0 24px 24px" }}>
          <div className="lp-form-grid">
            {activeSection.fields.map(renderField)}
          </div>

          {isSuperAdmin && (
            <div className="st-foot" style={{ marginTop: 16 }}>
              <button type="submit" className="lp-btn lp-btn-primary" disabled={saving || loading}>
                {saving ? "Saving…" : `Save ${activeSection.label} content`}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PageContent;
