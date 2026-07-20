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
  FaCogs
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
    key: "admin-management",
    label: "Admin Management",
    path: "/admins",
    icon: FaUserShield,
    iconColor: "#7AC943",
  },

  {
    key: "roles",
    label: "Role & Permission",
    path: "/roles",
    icon: FaUserShield,
    iconColor: "#0A4DB8",
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

      {
        key: "property-type",
        label: "Property Types",
        path: "/property-types",
        icon: FaBuilding,
      },

      {
        key: "approval",
        label: "Property Approval",
        path: "/property-approval",
        icon: FaClipboardList,
      }

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
    key: "site-visits",
    label: "Site Visits",
    path: "/site-visits",
    icon: FaCalendarCheck,
    iconColor: "#0A4DB8",
  },

  {
    key: "bookings",
    label: "Bookings",
    path: "/bookings",
    icon: FaFileContract,
    iconColor: "#7AC943",
  },

  {
    key: "payments",
    label: "Payments",
    path: "/payments",
    icon: FaCreditCard,
    iconColor: "#0A4DB8",
  },

  {
    key: "commission",
    label: "Commission",
    path: "/commission",
    icon: FaMoneyBillWave,
    iconColor: "#7AC943",
  },

  {
    key: "notifications",
    label: "Notifications",
    path: "/notifications",
    icon: FaBell,
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
    key: "approval",
    label: "Property Approval",
    path: "/property-approval",
    icon: FaClipboardList,
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
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: FaChartBar,
    iconColor: "#0A4DB8",
  },

  {
    key: "notifications",
    label: "Notifications",
    path: "/notifications",
    icon: FaBell,
    iconColor: "#7AC943",
  }

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
    key: "blog",
    label: "Blog",
    path: "/blog",
    icon: FaNewspaper,
    iconColor: "#7AC943",
  },

  {
    key: "contact",
    label: "Contact Enquiry",
    path: "/contact-enquiry",
    icon: FaEnvelope,
    iconColor: "#0A4DB8",
  },

  {
    key: "faq",
    label: "FAQ",
    path: "/faq",
    icon: FaQuestionCircle,
    iconColor: "#7AC943",
  },

  {
    key: "notifications",
    label: "Notifications",
    path: "/notifications",
    icon: FaBell,
    iconColor: "#0A4DB8",
  },

  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: FaChartBar,
    iconColor: "#7AC943",
  }

];