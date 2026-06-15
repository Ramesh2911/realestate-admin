import React, { useState } from 'react';
import { FaCog, FaSave, FaServer, FaLock, FaSlidersH } from 'react-icons/fa';

const C = { primaryBlue: '#0A4DB8', primaryGreen: '#7AC943', textDark: '#1b2b4b', textLight: '#6c7a89', border: '#dce8d8', white: '#ffffff', lightBg: '#F5FAF3' };

const Settings = () => {
    const [config, setConfig] = useState({ platformName: 'EdgeMile Realty Platform Engine', taxSplit: '20', tokenExpiry: '24' });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Configuration parameters updated in environment session state registry buffer pools safely.");
    };

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.textDark, margin: 0 }}>Global Platform Settings</h1>
                <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Configure critical operations, engine defaults, and system metadata splits configurations.</p>
            </div>

            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '32px', maxWidth: '680px', boxShadow: '0 4px 20px rgba(10,77,184,0.02)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>

                    <div>
                        <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', color: C.textDark }}><FaSlidersH color={C.primaryBlue} /> Core Platform Branding Parameters</h3>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>System Instance Name</label>
                        <input type="text" value={config.platformName} onChange={e => setConfig({ ...config, platformName: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', color: C.textDark }}><FaServer color={C.primaryGreen} /> Financial Splits</h3>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Company Revenue Cut (%)</label>
                            <input type="number" value={config.taxSplit} onChange={e => setConfig({ ...config, taxSplit: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', color: C.textDark }}><FaLock color={C.primaryBlue} /> Session Guard Limits</h3>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>JWT Token Lifetime Buffer (Hours)</label>
                            <input type="number" value={config.tokenExpiry} onChange={e => setConfig({ ...config, tokenExpiry: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: `1px solid ${C.border}`, marginTop: '12px' }}>
                        <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: C.primaryBlue, color: C.white, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(10,77,184,0.2)' }}><FaSave /> Persist System Configuration</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;