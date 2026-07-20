import React, { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────
    ROLE-BASED STATIC DATA
───────────────────────────────────────────── */
const ROLE_DATA = {
  SUPER_ADMIN: {
    greeting: 'Super Admin',
    subtitle: 'Full platform overview — all regions, all teams.',
    stats: [
      { key: 'properties', label: 'Total Properties', value: '1,248', trend: '+12.4%', subText: 'vs last month', icon: '🏢', positive: true },
      { key: 'brokers', label: 'Active Brokers', value: '86', trend: '+3', subText: 'this month', icon: '🤝', positive: true },
      { key: 'agents', label: 'Active Agents', value: '342', trend: '+18', subText: 'this month', icon: '👔', positive: true },
      { key: 'owners', label: 'Property Owners', value: '5,610', trend: '+94', subText: 'registered', icon: '🏠', positive: true },
      { key: 'leads', label: 'Total Leads', value: '3,920', trend: '+22.0%', subText: 'vs last week', icon: '🎯', positive: true },
      { key: 'visits', label: 'Site Visits', value: '728', trend: '+8.5%', subText: 'this month', icon: '📍', positive: true },
      { key: 'deals', label: 'Closed Deals', value: '194', trend: '+15.2%', subText: 'vs last month', icon: '✅', positive: true },
      { key: 'commission', label: 'Total Commission', value: '₹48.6L', trend: '+19.8%', subText: 'vs last month', icon: '💰', positive: true },
    ],
    orders: [
      { id: '#D-1084', name: 'Ramesh Iyer', type: 'Apartment', value: '₹82L', status: 'Closed' },
      { id: '#D-1083', name: 'Sunita Kapoor', type: 'Villa', value: '₹2.1Cr', status: 'In Progress' },
      { id: '#D-1082', name: 'Arjun Nair', type: 'Commercial', value: '₹1.4Cr', status: 'Closed' },
      { id: '#D-1081', name: 'Meena Pillai', type: 'Plot', value: '₹45L', status: 'Cancelled' },
      { id: '#D-1080', name: 'Vikram Malhotra', type: 'Apartment', value: '₹95L', status: 'Closed' },
    ],
    chartLabel: 'Commission Revenue (₹L)',
    chartData: [
      { month: 'Jan', height: 42 }, { month: 'Feb', height: 58 },
      { month: 'Mar', height: 72 }, { month: 'Apr', height: 61 },
      { month: 'May', height: 95 }, { month: 'Jun', height: 83 },
    ],
    tableHeaders: ['Deal ID', 'Client', 'Property Type', 'Value', 'Status'],
  },

  BROKER: {
    greeting: 'Broker',
    subtitle: 'Your team performance & pipeline at a glance.',
    stats: [
      { key: 'myprops', label: 'My Properties', value: '148', trend: '+6', subText: 'listed', icon: '🏢', positive: true },
      { key: 'myagents', label: 'My Agents', value: '24', trend: '+2', subText: 'active', icon: '👔', positive: true },
      { key: 'newleads', label: 'New Leads', value: '312', trend: '+34', subText: 'this week', icon: '🎯', positive: true },
      { key: 'visits', label: 'Site Visits', value: '89', trend: '+11', subText: 'this month', icon: '📍', positive: true },
      { key: 'deals', label: 'Active Deals', value: '27', trend: '+4', subText: 'ongoing', icon: '🔄', positive: true },
      { key: 'commission', label: 'Commission Earned', value: '₹6.2L', trend: '+18.4%', subText: 'this month', icon: '💰', positive: true },
    ],
    orders: [
      { id: '#L-2041', name: 'Pooja Sharma', type: '3BHK Flat', value: '₹74L', status: 'In Progress' },
      { id: '#L-2040', name: 'Nikhil Gupta', type: 'Villa', value: '₹1.8Cr', status: 'Closed' },
      { id: '#L-2039', name: 'Divya Menon', type: 'Plot', value: '₹38L', status: 'In Progress' },
      { id: '#L-2038', name: 'Sanjay Reddy', type: 'Office', value: '₹92L', status: 'Cancelled' },
    ],
    chartLabel: 'Lead Conversion (Monthly)',
    chartData: [
      { month: 'Jan', height: 38 }, { month: 'Feb', height: 52 },
      { month: 'Mar', height: 65 }, { month: 'Apr', height: 55 },
      { month: 'May', height: 90 }, { month: 'Jun', height: 78 },
    ],
    tableHeaders: ['Lead ID', 'Client', 'Property', 'Value', 'Status'],
  },

  AGENT: {
    greeting: 'Agent',
    subtitle: 'Your assigned leads, visits & closures.',
    stats: [
      { key: 'assignedprops', label: 'Assigned Properties', value: '32', trend: '+4', subText: 'active', icon: '🏠', positive: true },
      { key: 'assignedleads', label: 'Assigned Leads', value: '58', trend: '+12', subText: 'this week', icon: '🎯', positive: true },
      { key: 'visits', label: 'Site Visits', value: '21', trend: '+5', subText: 'scheduled', icon: '📍', positive: true },
      { key: 'deals', label: 'Closed Deals', value: '9', trend: '+2', subText: 'this month', icon: '✅', positive: true },
    ],
    orders: [
      { id: '#V-3011', name: 'Kavitha Rao', type: '2BHK Flat', value: '₹52L', status: 'Closed' },
      { id: '#V-3010', name: 'Mohan Bhatia', type: 'Plot', value: '₹29L', status: 'In Progress' },
      { id: '#V-3009', name: 'Lakshmi Nair', type: 'Villa', value: '₹1.1Cr', status: 'In Progress' },
      { id: '#V-3008', name: 'Tarun Seth', type: '3BHK Flat', value: '₹68L', status: 'Cancelled' },
    ],
    chartLabel: 'Visits Conducted (Monthly)',
    chartData: [
      { month: 'Jan', height: 30 }, { month: 'Feb', height: 45 },
      { month: 'Mar', height: 60 }, { month: 'Apr', height: 50 },
      { month: 'May', height: 85 }, { month: 'Jun', height: 70 },
    ],
    tableHeaders: ['Visit ID', 'Client', 'Property', 'Value', 'Status'],
  },

  OWNER: {
    greeting: 'Owner',
    subtitle: 'Your listed properties, inquiries & visit requests.',
    stats: [
      { key: 'myprops', label: 'My Properties', value: '6', trend: '+1', subText: 'this month', icon: '🏠', positive: true },
      { key: 'inquiries', label: 'Property Inquiries', value: '38', trend: '+9', subText: 'this week', icon: '📬', positive: true },
      { key: 'visitreqs', label: 'Visit Requests', value: '14', trend: '+3', subText: 'pending', icon: '📅', positive: true },
      { key: 'listings', label: 'Active Listings', value: '4', trend: 'Live', subText: 'on market', icon: '📌', positive: false },
    ],
    orders: [
      { id: '#P-4001', name: 'Flat 4B, Whitefield', type: '2BHK', value: '₹65L', status: 'In Progress' },
      { id: '#P-4002', name: 'Plot 12, Sarjapur', type: 'Plot', value: '₹32L', status: 'Closed' },
      { id: '#P-4003', name: 'Villa 3, HSR Layout', type: 'Villa', value: '₹1.6Cr', status: 'In Progress' },
      { id: '#P-4004', name: 'Shop 7, MG Road', type: 'Comm.', value: '₹88L', status: 'Cancelled' },
    ],
    chartLabel: 'Inquiry Trend (Monthly)',
    chartData: [
      { month: 'Jan', height: 20 }, { month: 'Feb', height: 35 },
      { month: 'Mar', height: 55 }, { month: 'Apr', height: 40 },
      { month: 'May', height: 80 }, { month: 'Jun', height: 65 },
    ],
    tableHeaders: ['Property ID', 'Property', 'Type', 'Ask Price', 'Status'],
  },
};

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

/* ─────────────────────────────────────────────
    STATUS BADGE CONFIG
───────────────────────────────────────────── */
const statusStyle = (status) => ({
  padding: '5px 12px',
  borderRadius: '20px',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  backgroundColor:
    status === 'Closed' ? C.successBg :
      status === 'In Progress' ? C.warningBg : C.dangerBg,
  color:
    status === 'Closed' ? C.success :
      status === 'In Progress' ? C.warning : C.danger,
  border: `1px solid ${status === 'Closed' ? C.successBorder :
    status === 'In Progress' ? C.warningBorder : C.dangerBorder
    }`,
});

const statusDot = (status) => ({
  width: '6px', height: '6px', borderRadius: '50%',
  backgroundColor:
    status === 'Closed' ? C.success :
      status === 'In Progress' ? C.warning : C.danger,
  flexShrink: 0,
});

/* ─────────────────────────────────────────────
    DASHBOARD COMPONENT
───────────────────────────────────────────── */
const Dashboard = () => {
  const [activeRole, setActiveRole] = useState('SUPER_ADMIN');
  const [displayRoleName, setDisplayRoleName] = useState('Super Admin');
  const [userName, setUserName] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUserName(parsedUser.full_name || "");

        // Dynamically save the raw API role name for the badge
        if (parsedUser.role_name) {
          setDisplayRoleName(parsedUser.role_name);
        }

        // Exact match mapping for internal UI configuration selection
        const roleMap = {
          "Super Admin": "SUPER_ADMIN",
          "Broker": "BROKER",
          "Agent": "AGENT",
          "Owner": "OWNER",
        };

        setActiveRole(roleMap[parsedUser.role_name] || "SUPER_ADMIN");
      } catch (error) {
        console.error("Error reading token configurations: ", error);
      }
    }

    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  const data = ROLE_DATA[activeRole] || ROLE_DATA.SUPER_ADMIN;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCols = isMobile ? 1 : isTablet ? 2 : 4;

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
      top: 0, left: 0,
      width: '4px', height: '100%',
      borderRadius: '18px 0 0 18px',
      background: `linear-gradient(180deg, ${C.primaryBlue}, ${C.primaryGreen})`,
    },
    cardIconBox: {
      position: 'absolute',
      top: '20px', right: '20px',
      width: '42px', height: '42px',
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
    chartContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: '200px',
      paddingTop: '28px',
      gap: '10px',
      marginTop: '24px',
    },
    bar: (height, active) => ({
      width: '100%',
      height: `${height}%`,
      background: active
        ? `linear-gradient(180deg, ${C.primaryBlue} 0%, ${C.secondaryBlue} 100%)`
        : `linear-gradient(180deg, ${C.primaryGreen}44 0%, ${C.primaryGreen}11 100%)`,
      borderRadius: '6px 6px 3px 3px',
      border: active ? 'none' : `1px solid ${C.primaryGreen}33`,
      transition: 'all 0.3s ease',
      position: 'relative',
    }),
    barLabel: {
      textAlign: 'center',
      fontSize: '11px',
      fontWeight: '600',
      color: C.textLight,
      marginTop: '8px',
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
  };

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
            {getGreeting()}{userName ? `, ${userName}` : `, ${data.greeting}`}
          </h1>
          <div style={S.subtitle}>{data.subtitle}</div>
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
        {data.stats.map((stat) => (
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
            <div style={S.cardTrend(stat.positive)}>
              <span>{stat.positive ? '↑' : '●'} {stat.trend}</span>
              <span style={S.cardTrendSub}>{stat.subText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHART + TABLE ── */}
      <div style={S.sectionGrid}>
        {/* Revenue / Trend Chart */}
        <div style={S.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={S.sectionTitle}>{data.chartLabel}</h2>
              <div style={S.sectionSub}>6-month performance trend</div>
            </div>
            <span style={S.chartViewToggle}>Monthly ▾</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '200px', paddingBottom: '20px', paddingRight: '4px' }}>
              {['100', '75', '50', '25', '0'].map(l => (
                <span key={l} style={{ fontSize: '10px', color: C.textLight, fontWeight: '600' }}>{l}</span>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={S.chartContainer}>
                {data.chartData.map((item, idx) => (
                  <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={S.bar(item.height, idx === data.chartData.length - 2)} />
                    <div style={S.barLabel}>{item.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.textLight }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: `linear-gradient(135deg, ${C.primaryBlue}, ${C.secondaryBlue})`, display: 'inline-block' }} />
              Peak Month
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: C.textLight }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: `${C.primaryGreen}44`, border: `1px solid ${C.primaryGreen}33`, display: 'inline-block' }} />
              Regular
            </div>
          </div>
        </div>

        {/* Recent Orders / Activity Table */}
        <div style={S.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={S.sectionTitle}>Recent Activity</h2>
              <div style={S.sectionSub}>Latest transactions for your role</div>
            </div>
            <span style={{ ...S.chartViewToggle, color: C.primaryGreen, background: C.successBg, borderColor: C.successBorder }}>
              View All →
            </span>
          </div>

          <div style={S.tableWrapper}>
            <table style={S.table}>
              <thead>
                <tr style={{ background: C.lightBg }}>
                  {data.tableHeaders.map((h, i) => (
                    <th
                      key={h}
                      style={{
                        ...S.th,
                        ...(i === 0 ? S.thFirst : {}),
                        ...(i === data.tableHeaders.length - 1 ? S.thLast : {}),
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order, idx) => (
                  <tr
                    key={idx}
                    style={{ background: idx % 2 === 0 ? '#ffffff' : C.lightBg + '88' }}
                  >
                    <td style={S.tdId}>{order.id}</td>
                    <td style={S.td}>{order.name}</td>
                    <td style={S.td}>{order.type}</td>
                    <td style={S.tdBold}>{order.value}</td>
                    <td style={S.td}>
                      <span style={statusStyle(order.status)}>
                        <span style={statusDot(order.status)} />
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;