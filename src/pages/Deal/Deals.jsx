import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { FaFileContract, FaSearch, FaBriefcase, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

const C = { primaryBlue: '#0A4DB8', primaryGreen: '#7AC943', textDark: '#1b2b4b', textLight: '#6c7a89', border: '#dce8d8', white: '#ffffff', lightBg: '#F5FAF3', success: '#16a34a', warning: '#b45309', danger: '#dc2626' };

const STATIC_DEALS = [
    { id: '#D-1084', client: 'Ramesh Iyer', property: 'Skyline Residency', value: '₹82,00,000', status: 'Closed', date: '2026-06-10' },
    { id: '#D-1083', client: 'Sunita Kapoor', property: 'Greenwood Meadows', value: '₹2,10,00,000', status: 'In Progress', date: '2026-06-14' },
    { id: '#D-1081', client: 'Meena Pillai', property: 'Silver Oak Acres', value: '₹45,00,000', status: 'Cancelled', date: '2026-06-02' },
];

const Deals = () => {
    const [deals, setDeals] = useState(STATIC_DEALS);
    const [filterText, setFilterText] = useState('');

    const customStyles = {
        headRow: { style: { backgroundColor: C.lightBg, borderBottomWidth: '2px', borderBottomColor: C.border } },
        headCells: { style: { color: C.textDark, fontWeight: '700' } },
        rows: { style: { minHeight: '56px' } },
    };

    const filteredItems = useMemo(() => {
        return deals.filter(item =>
            item.client.toLowerCase().includes(filterText.toLowerCase()) ||
            item.property.toLowerCase().includes(filterText.toLowerCase()) ||
            item.id.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [deals, filterText]);

    const columns = [
        { name: 'Deal ID', selector: row => row.id, sortable: true, cell: row => <span style={{ fontWeight: '700', color: C.primaryBlue }}>{row.id}</span> },
        { name: 'Client', selector: row => row.client, sortable: true, cell: row => <span style={{ fontWeight: '600' }}>{row.client}</span> },
        { name: 'Property Asset', selector: row => row.property, sortable: true },
        { name: 'Contract Value', selector: row => row.value, sortable: true, cell: row => <span style={{ fontWeight: '700' }}>{row.value}</span> },
        { name: 'Execution Date', selector: row => row.date, sortable: true },
        {
            name: 'Status', selector: row => row.status, sortable: true, cell: row => (
                <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                    backgroundColor: row.status === 'Closed' ? 'rgba(22,163,74,0.1)' : row.status === 'In Progress' ? 'rgba(245,158,11,0.1)' : 'rgba(220,38,38,0.1)',
                    color: row.status === 'Closed' ? C.success : row.status === 'In Progress' ? C.warning : C.danger
                }}>{row.status}</span>
            )
        }
    ];

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.textDark, margin: 0 }}>Sales Pipeline & Deals</h1>
                <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Unified structural tracking of system closings and conversions.</p>
            </div>

            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', maxWidth: '380px' }}>
                    <FaSearch color={C.textLight} style={{ marginRight: '10px' }} />
                    <input type="text" placeholder="Search ID, client, target listing..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', outline: 'none' }} />
                </div>
                <DataTable columns={columns} data={filteredItems} pagination customStyles={customStyles} highlightOnHover />
            </div>
        </div>
    );
};

export default Deals;