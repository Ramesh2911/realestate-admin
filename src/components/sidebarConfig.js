import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaHome,
  FaUserTie,
  FaHandshake,
  FaCalendarCheck,
  FaFileContract,
  FaMoneyBillWave,
  FaChartBar,
  FaCog,
  FaUserShield,
} from "react-icons/fa";

/* =====================================================
   SUPER ADMIN MENU
===================================================== */

export const SUPER_ADMIN_MENU = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    iconColor: "#0A4DB8",
  },

  {
    key: "property-management",
    label: "Property",
    icon: FaHome,
    iconColor: "#0A4DB8",
    type: "dropdown",
    children: [
      {
        key: "all-properties",
        label: "All Properties",
        path: "/properties",
        icon: FaBuilding,
        iconColor: "#0A4DB8",
      },
      {
        key: "property-types",
        label: "Property Types",
        path: "/property-types",
        icon: FaBuilding,
        iconColor: "#7AC943",
      },
    ],
  },
  {
    key: "broker-management",
    label: "Broker",
    path: "/brokers",
    icon: FaUserTie,
    iconColor: "#7AC943",
  },

  {
    key: "agent-management",
    label: "Agent",
    path: "/agents",
    icon: FaUsers,
    iconColor: "#0A4DB8",
  },

  {
    key: "owner-management",
    label: "Property Owners",
    path: "/owners",
    icon: FaUsers,
    iconColor: "#7AC943",
  },

  {
    key: "lead-management",
    label: "Lead",
    path: "/leads",
    icon: FaHandshake,
    iconColor: "#0A4DB8",
  },
  {
    key: "site-visits",
    label: "Site Visits",
    path: "/site-visits",
    icon: FaCalendarCheck,
    iconColor: "#7AC943",
  },

  {
    key: "deals",
    label: "Deals",
    path: "/deals",
    icon: FaFileContract,
    iconColor: "#0A4DB8",
  },

  {
    key: "commissions",
    label: "Commission",
    path: "/commissions",
    icon: FaMoneyBillWave,
    iconColor: "#7AC943",
  },

  {
    key: "reports",
    label: "Reports & Analytics",
    path: "/reports",
    icon: FaChartBar,
    iconColor: "#0A4DB8",
  },

  {
    key: "roles",
    label: "Roles",
    path: "/roles",
    icon: FaUserShield,
    iconColor: "#7AC943",
  },

  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    icon: FaCog,
    iconColor: "#0A4DB8",
  },
];

/* =====================================================
   BROKER MENU
===================================================== */

export const BROKER_MENU = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    iconColor: "#0A4DB8",
  },

  {
    key: "properties",
    label: "Properties",
    icon: FaHome,
    iconColor: "#0A4DB8",
    type: "dropdown",
    children: [
      {
        key: "add-property",
        label: "Add Property",
        path: "/properties/add",
        icon: FaBuilding,
        iconColor: "#7AC943",
      },
      {
        key: "all-properties",
        label: "My Properties",
        path: "/properties",
        icon: FaBuilding,
        iconColor: "#0A4DB8",
      },
    ],
  },

  {
    key: "agents",
    label: "My Agents",
    path: "/agents",
    icon: FaUsers,
    iconColor: "#7AC943",
  },

  {
    key: "owners",
    label: "Property Owners",
    path: "/owners",
    icon: FaUsers,
    iconColor: "#0A4DB8",
  },

  {
    key: "leads",
    label: "Leads",
    path: "/leads",
    icon: FaHandshake,
    iconColor: "#7AC943",
  },

  {
    key: "site-visits",
    label: "Site Visits",
    path: "/site-visits",
    icon: FaCalendarCheck,
    iconColor: "#0A4DB8",
  },

  {
    key: "deals",
    label: "Deals",
    path: "/deals",
    icon: FaFileContract,
    iconColor: "#7AC943",
  },

  {
    key: "commission",
    label: "Commission",
    path: "/commission",
    icon: FaMoneyBillWave,
    iconColor: "#0A4DB8",
  },

  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: FaChartBar,
    iconColor: "#7AC943",
  },
];

/* =====================================================
   AGENT MENU
===================================================== */

export const AGENT_MENU = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    iconColor: "#0A4DB8",
  },

  {
    key: "assigned-properties",
    label: "Assigned Properties",
    path: "/assigned-properties",
    icon: FaHome,
    iconColor: "#7AC943",
  },

  {
    key: "leads",
    label: "Assigned Leads",
    path: "/leads",
    icon: FaHandshake,
    iconColor: "#0A4DB8",
  },

  {
    key: "site-visits",
    label: "Site Visits",
    path: "/site-visits",
    icon: FaCalendarCheck,
    iconColor: "#7AC943",
  },

  {
    key: "deals",
    label: "Deals",
    path: "/deals",
    icon: FaFileContract,
    iconColor: "#0A4DB8",
  },

  {
    key: "reports",
    label: "Performance Reports",
    path: "/reports",
    icon: FaChartBar,
    iconColor: "#7AC943",
  },
];

/* =====================================================
   PROPERTY OWNER MENU
===================================================== */

export const OWNER_MENU = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: FaTachometerAlt,
    iconColor: "#0A4DB8",
  },

  {
    key: "properties",
    label: "My Properties",
    path: "/my-properties",
    icon: FaHome,
    iconColor: "#7AC943",
  },

  {
    key: "property-inquiries",
    label: "Property Inquiries",
    path: "/property-inquiries",
    icon: FaHandshake,
    iconColor: "#0A4DB8",
  },

  {
    key: "site-visits",
    label: "Visit Requests",
    path: "/visit-requests",
    icon: FaCalendarCheck,
    iconColor: "#7AC943",
  },

  {
    key: "agreements",
    label: "Documents",
    path: "/documents",
    icon: FaFileContract,
    iconColor: "#0A4DB8",
  },
];