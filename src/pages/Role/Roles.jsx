import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { FaUserShield, FaShieldAlt } from 'react-icons/fa';

const C = { primaryBlue: '#0A4DB8', primaryGreen: '#7AC943', textDark: '#1b2b4b', textLight: '#6c7a89', border: '#dce8d8', white: '#ffffff', lightBg: '#F5FAF3' };

const STATIC_ROLES = [
    { roleKey: 'SUPER_ADMIN', label: 'Super Admin', clearance: 'All Platform Overview Scope Access', allocations: 'Global platform configuration nodes.' },
    { roleKey: 'BROKER', label: 'Broker Company Admin', clearance: 'Team Pipelines & Managed Custodians Scope', allocations: 'Manage sub-agents, allocate property bounds.' },
    { roleKey: 'AGENT', label: 'Field Operations Agent', clearance: 'Assigned Leads / Walkthroughs Registry Scope', allocations: 'Client interaction workflows, update visits status.' },
    { roleKey: 'OWNER', label: 'Property Asset Owner', clearance: 'Personal Inventory Portfolio Inquiries Scope', allocations: 'List property specifications, authorize view hooks.' },
];

const Roles = () => {
    const [roles] = useState(STATIC_ROLES);

    const customStyles = {
        headRow: { style: { backgroundColor: C.lightBg, borderBottomWidth: '2px', borderBottomColor: C.border } },
        headCells: { style: { color: C.textDark, fontWeight: '700' } },
        rows: { style: { minHeight: '64px' } },
    };

    const columns = [
        { name: 'System Context Role Key', selector: row => row.roleKey, cell: row => <code style={{ color: '#dc2626', fontWeight: '700', background: '#fef2f2', padding: '4px 8px', borderRadius: '4px' }}>{row.roleKey}</code>, width: '160px' },
        { name: 'Display Label', selector: row => row.label, cell: row => <span style={{ fontWeight: '700', color: C.textDark }}>{row.label}</span>, width: '180px' },
        { name: 'Clearance Level Boundary scope', selector: row => row.clearance, width: '280px' },
        { name: 'Functional Allocations Framework Mapping', selector: row => row.allocations }
    ];

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaUserShield size={28} color={C.primaryBlue} />
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.textDark, margin: 0 }}>System Access Roles Definition</h1>
                    <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Read-only structural baseline mapping cryptographic token boundary matrices hooks parameters.</p>
                </div>
            </div>

            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px' }}>
                <DataTable columns={columns} data={roles} customStyles={customStyles} responsive highlightOnHover />
            </div>
        </div>
    );
};

export default Roles;