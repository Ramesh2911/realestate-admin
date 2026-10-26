import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaHome,
  FaUserTie,
  FaUserFriends,
  FaHandshake,
  FaCalendarCheck,
  FaFileContract,
  FaMoneyBillWave,
  FaChartBar,
  FaCog,
  FaUserShield,
  FaClipboardList,
  FaBell,
  FaNewspaper,
  FaQuestionCircle,
  FaEnvelope,
  FaCreditCard,
  FaCogs,
  FaMapMarkerAlt,
  FaLink,
  FaFileAlt,
  FaPenNib
} from "react-icons/fa";

export const SUPER_ADMIN_MENU = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    iconColor: "#0A4DB8",
  },
  {
    key: "activity-logs",
    label: "Activity Logs",
    path: "/activity-logs",
    icon: FaClipboardList,
    iconColor: "#7AC943",
  },
  {
    key: "users",
    label: "User Management",
    icon: FaUsers,
    type: "dropdown",
    iconColor: "#4d8dff",
    children: [
      {
        key: "owners",
        label: "Owners",
        path: "/owners",
        icon: FaUsers,
      },
      {
        key: "brokers",
        label: "Brokers",
        path: "/brokers",
        icon: FaUserTie,
      },
      {
        key: "developers",
        label: "Developers",
        path: "/developers",
        icon: FaBuilding,
      },
      {
        key: "buyers",
        label: "Buyers",
        path: "/buyers",
        icon: FaUserFriends,
      },
    ]
  },
  {
    key: "property",
    label: "Property",
    icon: FaHome,
    type: "dropdown",
    iconColor: "#7AC943",
    children: [
      {
        key: "properties",
        label: "All Properties",
        path: "/properties",
        icon: FaBuilding,
      },
    ]
  },
  {
    key: "leads",
    label: "Leads",
    path: "/leads",
    icon: FaHandshake,
    iconColor: "#f59e0b",
  },
  {
    key: "seo",
    label: "SEO Management",
    path: "/seo",
    icon: FaNewspaper,
    iconColor: "#0A4DB8",
  },
  {
    key: "footer",
    label: "Website Footer",
    path: "/footer",
    icon: FaLink,
    iconColor: "#0A4DB8",
  },
  {
    key: "page-content",
    label: "Page Content",
    path: "/page-content",
    icon: FaFileAlt,
    iconColor: "#0A4DB8",
  },
  {
    key: "blog-posts",
    label: "Blog Posts",
    path: "/blog-posts",
    icon: FaPenNib,
    iconColor: "#0A4DB8",
  },
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: FaChartBar,
    iconColor: "#0A4DB8",
  },
  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    icon: FaCog,
    iconColor: "#7AC943",
  },
];


export const ADMIN_A_MENU = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    iconColor: "#0A4DB8",
  },
  {
    key: "users",
    label: "User Management",
    icon: FaUsers,
    type: "dropdown",
    iconColor: "#4d8dff",
    children: [
      {
        key: "owners",
        label: "Owners",
        path: "/owners",
        icon: FaUsers,
      },
      {
        key: "brokers",
        label: "Brokers",
        path: "/brokers",
        icon: FaUserTie,
      },
      {
        key: "developers",
        label: "Developers",
        path: "/developers",
        icon: FaBuilding,
      },
      {
        key: "buyers",
        label: "Buyers",
        path: "/buyers",
        icon: FaUserFriends,
      }
    ]
  },
  {
    key: "property",
    label: "Property",
    path: "/properties",
    icon: FaHome,
    iconColor: "#7AC943",
  },
  {
    key: "leads",
    label: "Leads",
    path: "/leads",
    icon: FaHandshake,
    iconColor: "#f59e0b",
  },
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: FaChartBar,
    iconColor: "#0A4DB8",
  },
];


export const ADMIN_B_MENU = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    iconColor: "#0A4DB8",
  },
  {
    key: "users",
    label: "User Management",
    icon: FaUsers,
    type: "dropdown",
    iconColor: "#4d8dff",
    children: [
      {
        key: "owners",
        label: "Owners",
        path: "/owners",
        icon: FaUsers,
      },
      {
        key: "brokers",
        label: "Brokers",
        path: "/brokers",
        icon: FaUserTie,
      },
      {
        key: "developers",
        label: "Developers",
        path: "/developers",
        icon: FaBuilding,
      },
      {
        key: "buyers",
        label: "Buyers",
        path: "/buyers",
        icon: FaUserFriends,
      }
    ]
  },
  {
    key: "property",
    label: "Property",
    path: "/properties",
    icon: FaHome,
    iconColor: "#7AC943",
  },
  {
    key: "leads",
    label: "Leads",
    path: "/leads",
    icon: FaHandshake,
    iconColor: "#f59e0b",
  },
  {
    key: "site-visits",
    label: "Site Visits",
    path: "/site-visits",
    icon: FaMapMarkerAlt,
    iconColor: "#a78bfa",
  },
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: FaChartBar,
    iconColor: "#0A4DB8",
  },
];

/* ── Role → menu lookup ── */
export const getMenuByRole = (roleName) => {
  switch (roleName) {
    case "Super Admin":
      return SUPER_ADMIN_MENU;
    case "Admin A":
      return ADMIN_A_MENU;
    case "Admin B":
      return ADMIN_B_MENU;
    default:
      return [];
  }
};

/* ── Section grouping for premium sidebar labels ── */
const SECTIONS = [
  { label: "Overview", keys: ["dashboard", "activity-logs"] },
  { label: "Workspace", keys: ["users", "property", "leads", "site-visits"] },
  { label: "Insights", keys: ["seo", "footer", "page-content", "blog-posts", "reports"] },
  { label: "System", keys: ["settings", "roles"] },
];

export const groupMenu = (items) => {
  const groups = [];
  const used = new Set();

  SECTIONS.forEach((section) => {
    const sectionItems = items.filter((item) => section.keys.includes(item.key));
    if (sectionItems.length) {
      sectionItems.forEach((i) => used.add(i.key));
      groups.push({ id: section.label.toLowerCase(), label: section.label, items: sectionItems });
    }
  });

  const rest = items.filter((item) => !used.has(item.key));
  if (rest.length) groups.push({ id: "more", label: "More", items: rest });

  return groups;
};

/* ── Flat list of { label, path } for global search ── */
export const flattenNavItems = (menu) => {
  const flat = [];
  menu.forEach((item) => {
    if (item.type === "dropdown") {
      item.children?.forEach((child) => {
        if (child.path) flat.push({ label: child.label, path: child.path });
      });
    } else if (item.path) {
      flat.push({ label: item.label, path: item.path });
    }
  });
  return flat;
};
