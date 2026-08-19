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
  FaMapMarkerAlt
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
    iconColor: "#7AC943",
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
    iconColor: "#0A4DB8",
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
    iconColor: "#7AC943",
  },
  {
    key: "seo",
    label: "SEO Management",
    path: "/seo",
    icon: FaNewspaper,
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
    iconColor: "#7AC943",
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
    iconColor: "#7AC943",
  },
  {
    key: "site-visits",
    label: "Site Visits",
    path: "/site-visits",
    icon: FaMapMarkerAlt,
    iconColor: "#0A4DB8",
  },
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: FaChartBar,
    iconColor: "#0A4DB8",
  },
];
