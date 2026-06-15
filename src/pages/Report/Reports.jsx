import React from 'react';
import { FaChartBar, FaFileDownload, FaBuilding, FaHandshake, FaMoneyBillWave } from 'react-icons/fa';

const C = { primaryBlue: '#0A4DB8', primaryGreen: '#7AC943', textDark: '#1b2b4b', textLight: '#6c7a89', border: '#dce8d8', white: '#ffffff', lightBg: '#F5FAF3' };

const Reports = () => {
  const reportCards = [
    { title: 'Inventory Analytics Status', desc: 'Full spatial structural auditing mapping on properties inventory data registries.', icon: <FaBuilding color={C.primaryBlue}/>, size: '2.4 MB' },
    { title: 'Lead Conversion funnels', desc: 'Monthly performance assessment pipelines tracing transaction milestones metrics.', icon: <FaHandshake color={C.primaryGreen}/>, size: '1.8 MB' },
    { title: 'Financial Commission Gross Splits', desc: 'Quarterly breakdown of platform revenue streams allocation balances bookkeeping.', icon: <FaMoneyBillWave color={C.primaryBlue}/>, size: '4.1 MB' }
  ];

  return (
    <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.textDark, margin: 0 }}>Reports & Advanced Analytics</h1>
        <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Compile export platform operation datasets metrics spreadsheets books blocks.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {reportCards.map((r, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(10,77,184,0.02)' }}>
            <div>
              <div style={{ width: '48px', height: '48px', background: C.lightBg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '20px' }}>{r.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: C.textDark, margin: '0 0 8px' }}>{r.title}</h3>
              <p style={{ fontSize: '13px', color: C.textLight, margin: '0 0 20px', lineHeight: '1.5' }}>{r.desc}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: '12px', color: C.textLight, fontWeight: '600' }}>Format: XLSX ({r.size})</span>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: C.lightBg, color: C.primaryBlue, border: `1px solid ${C.primaryBlue}33`, borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}><FaFileDownload/> Export</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;