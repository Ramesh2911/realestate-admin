import React, { useState, useEffect } from 'react';
import {
  getDashboardStatsApi,
  getAdminStatsApi,
  getLogsApi,
} from '../../services/auth.api';

/* ─────────────────────────────────────────────
    COLOR SYSTEM
───────────────────────────────────────────── */
const C = {
  primaryBlue: '#0A4DB8',
  secondaryBlue: '#003D99',
  primaryGreen: '#7AC943',
  secondaryGreen: '#5FAF2F',
  lightBg: '#F5FAF3',
  white: '#ffffff',
  textDark: '#1b2b4b',
  textLight: '#6c7a89',
  border: '#dce8d8',
  success: '#16a34a',
  successBg: 'rgba(122,201,67,0.10)',
  successBorder: 'rgba(122,201,67,0.25)',
  warning: '#b45309',
  warningBg: 'rgba(245,158,11,0.10)',
  warningBorder: 'rgba(245,158,11,0.25)',
  danger: '#dc2626',
  dangerBg: 'rgba(220,38,38,0.10)',
  dangerBorder: 'rgba(220,38,38,0.20)',
  cardBg: '#ffffff',
  cardHover: '#f0f7ec',
  pageBg: '#F5FAF3',
  blueBg: 'rgba(10,77,184,0.07)',
  blueBorder: 'rgba(10,77,184,0.18)',
  blueText: '#0A4DB8',
};

const roleMap = {
  "Super Admin": "SUPER_ADMIN",
  "Admin A": "ADMIN_A",
  "Admin B": "ADMIN_B",
  "Broker": "BROKER",
  "Owner": "OWNER",
};

/* ─────────────────────────────────────────────
    STATUS BADGE CONFIG
───────────────────────────────────────────── */
const propertyStatusStyle = (status) => {
  const normalized = (status || '').toLowerCase();
  let bgColor, txtColor, borderClr, label;
  if (normalized === 'approved' || normalized === 'sold') {
    bgColor = C.successBg;
    txtColor = C.success;
    borderClr = C.successBorder;
    label = status;
  } else if (normalized === 'pending' || normalized === 'in progress') {
    bgColor = C.warningBg;
    txtColor = C.warning;
    borderClr = C.warningBorder;
    label = status;
  } else {
    bgColor = C.dangerBg;
    txtColor = C.danger;
    borderClr = C.dangerBorder;
    label = status || 'Rejected';
  }
  return {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: bgColor,
    color: txtColor,
    border: `1px solid ${borderClr}`,
  };
};

const propertyStatusDot = (status) => {
  const normalized = (status || '').toLowerCase();
  let bg;
  if (normalized === 'approved' || normalized === 'sold') bg = C.success;
  else if (normalized === 'pending' || normalized === 'in progress') bg = C.warning;
  else bg = C.danger;
  return { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: bg, flexShrink: 0 };
};

/* ─────────────────────────────────────────────
    LOADING SPINNER
───────────────────────────────────────────── */
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    gap: '16px',
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      border: `4px solid ${C.border}`,
      borderTopColor: C.primaryBlue,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ fontSize: '14px', color: C.textLight, fontWeight: '600' }}>
      Loading dashboard...
    </span>
  </div>
);

/* ─────────────────────────────────────────────
    ERROR STATE
───────────────────────────────────────────── */
const ErrorState = ({ message, onRetry }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    gap: '16px',
  }}>
    <div style={{
      width: '56px',
      height: '56px',
      borderRadius: '14px',
      background: C.dangerBg,
      border: `1px solid ${C.dangerBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '26px',
    }}>⚠️</div>
    <p style={{ fontSize: '15px', color: C.textDark, fontWeight: '700', margin: 0 }}>
      Something went wrong
    </p>
    <p style={{ fontSize: '13px', color: C.textLight, margin: 0, textAlign: 'center', maxWidth: '360px' }}>
      {message || 'Failed to load dashboard data. Please try again.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          background: `linear-gradient(135deg, ${C.primaryBlue}, ${C.secondaryBlue})`,
          color: '#fff',
          border: 'none',
          padding: '10px 24px',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '13px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(10,77,184,0.25)',
          marginTop: '4px',
        }}
      >
        Retry
      </button>
    )}
  </div>
);

/* ─────────────────────────────────────────────
    DASHBOARD COMPONENT
───────────────────────────────────────────── */
const Dashboard = () => {
  const [activeRole, setActiveRole] = useState('SUPER_ADMIN');
  const [displayRoleName, setDisplayRoleName] = useState('Super Admin');
  const [userName, setUserName] = useState('');
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [hoveredCard, setHoveredCard] = useState(null);
  const [btnHover, setBtnHover] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [logs, setLogs] = useState([]);

  const isSuperAdmin = activeRole === 'SUPER_ADMIN';
  const isAdminA = activeRole === 'ADMIN_A';
  const isAdminB = activeRole === 'ADMIN_B';
  const isAdminLike = isAdminA || isAdminB;

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSuperAdmin) {
        const [dashRes, logsRes] = await Promise.all([
          getDashboardStatsApi(),
          getLogsApi({ page: 1, limit: 10 }),
        ]);
        setDashboardStats(dashRes.data?.data || dashRes.data || {});
        const logData = logsRes.data?.data;
        setLogs(Array.isArray(logData) ? logData : Array.isArray(logData?.logs) ? logData.logs : []);
      } else if (isAdminLike) {
        const [adminRes, logsRes] = await Promise.all([
          getAdminStatsApi(),
          getLogsApi({ page: 1, limit: 10 }),
        ]);
        setAdminStats(adminRes.data?.data || adminRes.data || {});
        const logData = logsRes.data?.data;
        setLogs(Array.isArray(logData) ? logData : Array.isArray(logData?.logs) ? logData.logs : []);
      } else {
        const logsRes = await getLogsApi({ page: 1, limit: 10 });
        const logData = logsRes.data?.data;
        setLogs(Array.isArray(logData) ? logData : Array.isArray(logData?.logs) ? logData.logs : []);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load dashboard data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.full_name || '');
        if (parsedUser.role_name) {
          setDisplayRoleName(parsedUser.role_name);
        }
        setActiveRole(roleMap[parsedUser.role_name] || 'SUPER_ADMIN');
      } catch (err) {
        console.error('Error reading user from localStorage:', err);
      }
    }

    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [activeRole]);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;
  const statCols = isMobile ? 1 : isTablet ? 2 : 4;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatCurrency = (val) => {
    if (val == null) return '₹0';
    const num = Number(val);
    if (isNaN(num)) return val;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatNumber = (val) => {
    if (val == null) return '0';
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('en-IN');
  };

  const buildSuperAdminStats = () => {
    if (!dashboardStats) return [];
    return [
      {
        key: 'totalUsers',
        label: 'Total Users',
        value: formatNumber(dashboardStats.totalUsers),
        icon: '👥',
        positive: true,
        trend: '',
        subText: 'registered users',
      },
      {
        key: 'totalProperties',
        label: 'Total Properties',
        value: formatNumber(dashboardStats.totalProperties),
        icon: '🏢',
        positive: true,
        trend: '',
        subText: `${formatNumber(dashboardStats.pendingProperties)} pending review`,
      },
      {
        key: 'pendingProperties',
        label: 'Pending Reviews',
        value: formatNumber(dashboardStats.pendingProperties),
        icon: '📋',
        positive: false,
        trend: '',
        subText: `${formatNumber(dashboardStats.approvedProperties)} approved`,
      },
      {
        key: 'totalLeads',
        label: 'Total Leads',
        value: formatNumber(dashboardStats.totalLeads),
        icon: '🎯',
        positive: true,
        trend: '',
        subText: 'lead inquiries',
      },
      {
        key: 'totalBuyers',
        label: 'Total Buyers',
        value: formatNumber(dashboardStats.totalBuyers),
        icon: '🛒',
        positive: true,
        trend: '',
        subText: 'active buyers',
      },
      {
        key: 'totalOwners',
        label: 'Total Owners',
        value: formatNumber(dashboardStats.totalOwners),
        icon: '🏠',
        positive: true,
        trend: '',
        subText: 'property owners',
      },
    ];
  };

  const buildAdminStats = () => {
    if (!adminStats) return [];
    return [
      {
        key: 'pendingReview',
        label: 'Pending Review',
        value: formatNumber(adminStats.pendingReview),
        icon: '📋',
        positive: false,
        trend: '',
        subText: 'awaiting your action',
      },
      {
        key: 'totalApproved',
        label: 'Total Approved',
        value: formatNumber(adminStats.totalApproved),
        icon: '✅',
        positive: true,
        trend: '',
        subText: 'properties approved',
      },
      {
        key: 'totalRejected',
        label: 'Total Rejected',
        value: formatNumber(adminStats.totalRejected),
        icon: '❌',
        positive: false,
        trend: '',
        subText: 'properties rejected',
      },
      {
        key: 'myActivity',
        label: 'My Activity',
        value: formatNumber(adminStats.myActivity),
        icon: '📊',
        positive: true,
        trend: '',
        subText: 'actions this month',
      },
    ];
  };

  const currentStats = isSuperAdmin ? buildSuperAdminStats() : isAdminLike ? buildAdminStats() : [];

  const recentProperties = isSuperAdmin
    ? Array.isArray(dashboardStats?.recentProperties)
      ? dashboardStats.recentProperties.slice(0, 6)
      : []
    : [];

  const recentTableHeaders = ['ID', 'Title', 'City', 'Price', 'Status'];

  const tableHeaders = isSuperAdmin || isAdminLike ? recentTableHeaders : ['ID', 'Description', 'Action'];

  const getLogsTableData = () => {
    return logs.slice(0, 8).map((log, idx) => {
      const logId = log.id || log._id || idx + 1;
      const desc =
        log.description ||
        log.message ||
        log.action ||
        log.activity ||
        `Activity #${logId}`;
      return { id: logId, desc };
    });
  };

  const showRecentPropertiesTable = isSuperAdmin && recentProperties.length > 0;
  const showLogsTable = logs.length > 0;

  const formatPrice = (price) => {
    if (price == null) return '-';
    const num = Number(price);
    if (isNaN(num)) return price;
    return formatCurrency(num);
  };

  const getStatusLabel = (property) => {
    return property.status || property.status_name || 'Pending';
  };

  /* ── INLINE STYLES ── */
  const S = {
    page: {
      backgroundColor: C.pageBg,
      color: C.textDark,
      minHeight: '100vh',
      padding: isMobile ? '24px 16px' : '36px 40px',
      fontFamily: "Inter, 'DM Sans', system-ui, sans-serif",
      boxSizing: 'border-box',
    },
    header: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '16px' : '0',
      marginBottom: '32px',
    },
    roleTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      background: C.blueBg,
      border: `1px solid ${C.blueBorder}`,
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.08em',
      color: C.blueText,
      textTransform: 'uppercase',
      marginBottom: '8px',
    },
    title: {
      fontSize: isMobile ? '24px' : '30px',
      fontWeight: '800',
      color: C.textDark,
      margin: 0,
      letterSpacing: '-0.02em',
    },
    subtitle: {
      fontSize: '14px',
      color: C.textLight,
      marginTop: '4px',
    },
    btnReport: {
      background: btnHover
        ? `linear-gradient(135deg, ${C.primaryGreen}, ${C.secondaryGreen})`
        : `linear-gradient(135deg, ${C.primaryBlue}, ${C.secondaryBlue})`,
      color: '#fff',
      border: 'none',
      padding: '12px 22px',
      borderRadius: '12px',
      fontWeight: '700',
      fontSize: '13px',
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto',
      boxShadow: btnHover
        ? '0 6px 20px rgba(122,201,67,0.30)'
        : '0 4px 14px rgba(10,77,184,0.25)',
      transition: 'all 0.25s ease',
      transform: btnHover ? 'translateY(-1px)' : 'translateY(0)',
      letterSpacing: '0.02em',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${statCols}, 1fr)`,
      gap: '20px',
      marginBottom: '32px',
    },
    card: (key) => {
      const hov = hoveredCard === key;
      return {
        backgroundColor: hov ? C.cardHover : C.cardBg,
        borderRadius: '18px',
        border: `1px solid ${hov ? C.primaryGreen + '55' : C.border}`,
        padding: '24px 20px',
        boxShadow: hov
          ? '0 8px 28px rgba(10,77,184,0.12)'
          : '0 2px 10px rgba(10,77,184,0.05)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'default',
      };
    },
    cardAccentBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      borderRadius: '18px 0 0 18px',
      background: `linear-gradient(180deg, ${C.primaryBlue}, ${C.primaryGreen})`,
    },
    cardIconBox: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '42px',
      height: '42px',
      borderRadius: '10px',
      background: C.blueBg,
      border: `1px solid ${C.blueBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
    },
    cardLabel: {
      fontSize: '11px',
      fontWeight: '700',
      color: C.textLight,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      paddingLeft: '12px',
    },
    cardValue: {
      fontSize: isMobile ? '26px' : '28px',
      fontWeight: '800',
      color: C.textDark,
      margin: '10px 0 6px',
      letterSpacing: '-0.02em',
      paddingLeft: '12px',
    },
    cardTrend: (positive) => ({
      fontSize: '12px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      paddingLeft: '12px',
      color: positive ? C.success : C.primaryBlue,
    }),
    cardTrendSub: {
      fontSize: '12px',
      fontWeight: '400',
      color: C.textLight,
    },
    sectionGrid: {
      display: 'grid',
      gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '1.55fr 1.45fr',
      gap: '20px',
    },
    sectionCard: {
      backgroundColor: C.cardBg,
      borderRadius: '20px',
      border: `1px solid ${C.border}`,
      padding: isMobile ? '20px 16px' : '28px',
      boxShadow: '0 2px 12px rgba(10,77,184,0.06)',
    },
    sectionTitle: {
      fontSize: '17px',
      fontWeight: '800',
      color: C.textDark,
      margin: '0 0 3px',
      letterSpacing: '-0.01em',
    },
    sectionSub: {
      fontSize: '12px',
      color: C.textLight,
    },
    chartViewToggle: {
      padding: '6px 12px',
      borderRadius: '8px',
      background: C.blueBg,
      border: `1px solid ${C.blueBorder}`,
      color: C.primaryBlue,
      fontSize: '12px',
      fontWeight: '700',
      cursor: 'pointer',
    },
    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      marginTop: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      minWidth: isMobile ? '460px' : 'auto',
    },
    th: {
      padding: '10px 14px',
      color: C.textLight,
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: `2px solid ${C.border}`,
      background: C.lightBg,
    },
    thFirst: { borderRadius: '8px 0 0 0' },
    thLast: { borderRadius: '0 8px 0 0' },
    td: {
      padding: '13px 14px',
      fontSize: '13px',
      color: C.textDark,
      borderBottom: `1px solid ${C.border}`,
      verticalAlign: 'middle',
    },
    tdId: {
      padding: '13px 14px',
      fontSize: '13px',
      fontWeight: '700',
      color: C.primaryBlue,
      borderBottom: `1px solid ${C.border}`,
      verticalAlign: 'middle',
    },
    tdBold: {
      padding: '13px 14px',
      fontSize: '13px',
      fontWeight: '700',
      color: C.textDark,
      borderBottom: `1px solid ${C.border}`,
      verticalAlign: 'middle',
    },
    emptyState: {
      padding: '48px 20px',
      textAlign: 'center',
      color: C.textLight,
      fontSize: '14px',
    },
  };

  const renderSubtitle = () => {
    if (isSuperAdmin && dashboardStats) {
      return `Full platform overview — ${formatNumber(dashboardStats.totalProperties)} properties, ${formatNumber(dashboardStats.totalUsers)} users across all regions.`;
    }
    if (isAdminLike && adminStats) {
      return `${formatNumber(adminStats.pendingReview)} properties pending your review, ${formatNumber(adminStats.totalApproved)} approved so far.`;
    }
    if (isSuperAdmin) return 'Full platform overview — all regions, all teams.';
    if (isAdminLike) return 'Review properties and manage your assigned workload.';
    return 'Your activity overview.';
  };

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.header}>
          <div>
            <div style={S.roleTag}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.primaryGreen, display: 'inline-block' }} />
              {displayRoleName}
            </div>
            <h1 style={S.title}>{getGreeting()}{userName ? `, ${userName}` : ''}</h1>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={S.page}>
        <div style={S.header}>
          <div>
            <div style={S.roleTag}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.primaryGreen, display: 'inline-block' }} />
              {displayRoleName}
            </div>
            <h1 style={S.title}>{getGreeting()}{userName ? `, ${userName}` : ''}</h1>
          </div>
        </div>
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* ── PAGE HEADER ── */}
      <div style={S.header}>
        <div>
          <div style={S.roleTag}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.primaryGreen, display: 'inline-block' }} />
            {displayRoleName}
          </div>
          <h1 style={S.title}>
            {getGreeting()}{userName ? `, ${userName}` : ''}
          </h1>
          <div style={S.subtitle}>{renderSubtitle()}</div>
        </div>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          <button
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={S.btnReport}
          >
            ↓ Export Report
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={S.grid}>
        {currentStats.map((stat) => (
          <div
            key={stat.key}
            onMouseEnter={() => setHoveredCard(stat.key)}
            onMouseLeave={() => setHoveredCard(null)}
            style={S.card(stat.key)}
          >
            <div style={S.cardAccentBar} />
            <div style={S.cardIconBox}>{stat.icon}</div>
            <div style={S.cardLabel}>{stat.label}</div>
            <div style={S.cardValue}>{stat.value}</div>
            {(stat.trend || stat.subText) && (
              <div style={S.cardTrend(stat.positive)}>
                {stat.trend && <span>{stat.positive ? '↑' : '●'} {stat.trend}</span>}
                <span style={S.cardTrendSub}>{stat.subText}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── BOTTOM SECTION: RECENT PROPERTIES + ACTIVITY ── */}
      <div style={S.sectionGrid}>
        {/* Recent Properties Table (Super Admin) */}
        {showRecentPropertiesTable && (
          <div style={S.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={S.sectionTitle}>Recent Properties</h2>
                <div style={S.sectionSub}>Latest property listings across the platform</div>
              </div>
              <span style={S.chartViewToggle}>Monthly ▾</span>
            </div>

            <div style={S.tableWrapper}>
              <table style={S.table}>
                <thead>
                  <tr style={{ background: C.lightBg }}>
                    {recentTableHeaders.map((h, i) => (
                      <th
                        key={h}
                        style={{
                          ...S.th,
                          ...(i === 0 ? S.thFirst : {}),
                          ...(i === recentTableHeaders.length - 1 ? S.thLast : {}),
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentProperties.map((prop, idx) => (
                    <tr
                      key={prop.id || prop._id || idx}
                      style={{ background: idx % 2 === 0 ? '#ffffff' : C.lightBg + '88' }}
                    >
                      <td style={S.tdId}>#{prop.id || prop._id || idx + 1}</td>
                      <td style={S.tdBold}>{prop.title || prop.name || '-'}</td>
                      <td style={S.td}>{prop.city || prop.location || '-'}</td>
                      <td style={S.tdBold}>{formatPrice(prop.price)}</td>
                      <td style={S.td}>
                        <span style={propertyStatusStyle(getStatusLabel(prop))}>
                          <span style={propertyStatusDot(getStatusLabel(prop))} />
                          {getStatusLabel(prop)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state for recent properties if none */}
        {isSuperAdmin && !showRecentPropertiesTable && (
          <div style={S.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={S.sectionTitle}>Recent Properties</h2>
                <div style={S.sectionSub}>Latest property listings across the platform</div>
              </div>
            </div>
            <div style={S.emptyState}>
              <p style={{ margin: 0, fontSize: '14px', color: C.textLight }}>
                No recent properties found.
              </p>
            </div>
          </div>
        )}

        {/* Activity Log / Admin Activity Table */}
        {showLogsTable && (
          <div style={S.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={S.sectionTitle}>
                  {isAdminLike ? 'My Activity' : 'Recent Activity'}
                </h2>
                <div style={S.sectionSub}>
                  {isAdminLike ? 'Your recent actions and updates' : 'Latest platform activity'}
                </div>
              </div>
              <span style={{ ...S.chartViewToggle, color: C.primaryGreen, background: C.successBg, borderColor: C.successBorder }}>
                View All →
              </span>
            </div>

            <div style={S.tableWrapper}>
              <table style={S.table}>
                <thead>
                  <tr style={{ background: C.lightBg }}>
                    <th style={{ ...S.th, ...S.thFirst, width: '80px' }}>ID</th>
                    <th style={{ ...S.th, ...S.thLast }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {getLogsTableData().map((log, idx) => (
                    <tr
                      key={log.id}
                      style={{ background: idx % 2 === 0 ? '#ffffff' : C.lightBg + '88' }}
                    >
                      <td style={S.tdId}>#{log.id}</td>
                      <td style={S.tdBold}>{log.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state for logs */}
        {!showLogsTable && (
          <div style={S.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={S.sectionTitle}>
                  {isAdminLike ? 'My Activity' : 'Recent Activity'}
                </h2>
                <div style={S.sectionSub}>
                  {isAdminLike ? 'Your recent actions and updates' : 'Latest platform activity'}
                </div>
              </div>
            </div>
            <div style={S.emptyState}>
              <p style={{ margin: 0, fontSize: '14px', color: C.textLight }}>
                No recent activity found.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
