import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { FaCalendarCheck, FaSearch, FaPlus, FaTrash, FaCheckCircle, FaClock } from 'react-icons/fa';

const C = { primaryBlue: '#0A4DB8', primaryGreen: '#7AC943', textDark: '#1b2b4b', textLight: '#6c7a89', border: '#dce8d8', lightBg: '#F5FAF3', white: '#ffffff', success: '#16a34a', warning: '#b45309' };

const STATIC_VISITS = [
    { id: 'SV-401', client: 'Kavitha Rao', property: 'Skyline Residency (Apt 4B)', date: '2026-06-18', time: '11:00 AM', agent: 'Vikram Singh', status: 'Scheduled' },
    { id: 'SV-402', client: 'Mohan Bhatia', property: 'Greenwood Meadows (Villa 3)', date: '2026-06-14', time: '04:30 PM', agent: 'Priya Nair', status: 'Completed' },
    { id: 'SV-403', client: 'Rajesh Gupta', property: 'Oasis Tech Park', date: '2026-06-20', time: '02:00 PM', agent: 'Vikram Singh', status: 'Scheduled' },
];

const SiteVisits = () => {
    const [visits, setVisits] = useState(STATIC_VISITS);
    const [filterText, setFilterText] = useState('');

    const customStyles = {
        headRow: { style: { backgroundColor: C.lightBg, borderBottomWidth: '2px', borderBottomColor: C.border } },
        headCells: { style: { color: C.textDark, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' } },
        rows: { style: { minHeight: '60px' } },
    };

    const filteredItems = useMemo(() => {
        return visits.filter(item =>
            item.client.toLowerCase().includes(filterText.toLowerCase()) ||
            item.property.toLowerCase().includes(filterText.toLowerCase()) ||
            item.agent.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [visits, filterText]);

    const handleUpdateStatus = (id, newStatus) => {
        setVisits(visits.map(v => v.id === id ? { ...v, status: newStatus } : v));
    };

    const columns = [
        { name: 'Visit ID', selector: row => row.id, sortable: true, cell: row => <span style={{ fontWeight: '700', color: C.primaryBlue }}>{row.id}</span>, width: '110px' },
        { name: 'Client Name', selector: row => row.client, sortable: true, cell: row => <span style={{ fontWeight: '600' }}>{row.client}</span> },
        { name: 'Target Property', selector: row => row.property, sortable: true, width: '220px' },
        { name: 'Schedule', selector: row => row.date, cell: row => <div><div>{row.date}</div><div style={{ fontSize: '12px', color: C.textLight }}>{row.time}</div></div>, sortable: true },
        { name: 'Assigned Agent', selector: row => row.agent, sortable: true },
        {
            name: 'Status', selector: row => row.status, cell: row => (
                <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                    backgroundColor: row.status === 'Completed' ? 'rgba(22,163,74,0.1)' : 'rgba(245,158,11,0.1)',
                    color: row.status === 'Completed' ? C.success : C.warning
                }}>{row.status}</span>
            )
        },
        {
            name: 'Action', cell: row => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {row.status === 'Scheduled' && (
                        <button onClick={() => handleUpdateStatus(row.id, 'Completed')} style={{ background: 'none', border: 'none', color: C.success, cursor: 'pointer' }} title="Mark Completed"><FaCheckCircle size={16} /></button>
                    )}
                    <button onClick={() => setVisits(visits.filter(v => v.id !== row.id))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }} title="Cancel Appointment"><FaTrash size={14} /></button>
                </div>
            ), ignoreRowClick: true, width: '100px'
        }
    ];

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.textDark, margin: 0 }}>Site Visits</h1>
                    <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Monitor agent-guided buyer walkthrough schedules.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: C.white, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontSize: '11px', color: C.textLight, fontWeight: '700', textTransform: 'uppercase' }}>Active Schedules</div><div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px' }}>{visits.filter(v => v.status === 'Scheduled').length}</div></div>
                    <FaClock size={20} color={C.primaryBlue} />
                </div>
                <div style={{ background: C.white, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontSize: '11px', color: C.textLight, fontWeight: '700', textTransform: 'uppercase' }}>Completed Walkthroughs</div><div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px' }}>{visits.filter(v => v.status === 'Completed').length}</div></div>
                    <FaCheckCircle size={20} color={C.primaryGreen} />
                </div>
            </div>

            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', maxWidth: '380px' }}>
                    <FaSearch color={C.textLight} style={{ marginRight: '10px' }} />
                    <input type="text" placeholder="Search clients, properties, agents..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', outline: 'none' }} />
                </div>
                <DataTable columns={columns} data={filteredItems} pagination customStyles={customStyles} highlightOnHover />
            </div>
        </div>
    );
};

export default SiteVisits;