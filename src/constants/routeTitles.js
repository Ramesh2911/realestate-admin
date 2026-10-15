export const ROUTE_TITLES = {
  "/dashboard": "Dashboard",
  "/my-profile": "My Profile",
  "/activity-logs": "Activity Logs",
  "/owners": "Owners",
  "/brokers": "Brokers",
  "/developers": "Developers",
  "/buyers": "Buyers",
  "/properties": "All Properties",
  "/add-property": "Add Property",
  "/property-types": "Property Types",
  "/leads": "Leads",
  "/seo": "SEO Management",
  "/reports": "Reports",
  "/settings": "Settings",
  "/site-visits": "Site Visits",
  "/deals": "Deals",
  "/commissions": "Commissions",
  "/roles": "Roles",
};

export const getPageTitle = (pathname) => {
  if (!pathname) return "Dashboard";
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return "Dashboard";

  const fullPath = "/" + segments.join("/");
  if (ROUTE_TITLES[fullPath]) return ROUTE_TITLES[fullPath];

  for (let i = segments.length; i > 0; i--) {
    const partial = "/" + segments.slice(0, i).join("/");
    if (ROUTE_TITLES[partial]) return ROUTE_TITLES[partial];
  }
  return segments[segments.length - 1]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const getBreadcrumbs = (pathname) => {
  const segments = (pathname || "/").split("/").filter(Boolean);
  if (!segments.length) return [{ label: "Dashboard", path: "/dashboard" }];

  return segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    return {
      label: ROUTE_TITLES[path] || getPageTitle(path),
      path,
    };
  });
};
