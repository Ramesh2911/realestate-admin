import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import {
    FaHandshake, FaPlus, FaSearch, FaEdit, FaTrash,
    FaUser, FaTag, FaChartPie, FaCheckCircle, FaSpinner, FaTimesCircle
} from 'react-icons/fa';

const C = {
    primaryBlue: '#0A4DB8',
    primaryGreen: '#7AC943',
    textDark: '#1b2b4b',
    textLight: '#6c7a89',
    border: '#dce8d8',
    lightBg: '#F5FAF3',
    white: '#ffffff',
    success: '#16a34a',
    warning: '#b45309',
    danger: '#dc2626'
};

const STATIC_LEADS = [
    { id: 'LED-501', client: 'Rohit Sharma', property: 'Skyline Residency', broker: 'Ananya Sharma', value: '₹85,00,000', status: 'New' },
    { id: 'LED-502', client: 'Meera Nair', property: 'Palm Heights', broker: 'Rohan Das', value: '₹92,50,000', status: 'Contacted' },
    { id: 'LED-503', client: 'Vikram Malhotra', property: 'Oasis Tech Park', broker: 'Amit Verma', value: '₹5,10,00,000', status: 'Converted' },
    { id: 'LED-504', client: 'Anjali Roy', property: 'Silver Oak Acres', broker: 'Sanjay Reddy', value: '₹1,15,00,000', status: 'Lost' },
];

const Leads = () => {
    const [leads, setLeads] = useState(STATIC_LEADS);
    const [filterText, setFilterText] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({ client: '', property: '', broker: '', value: '', status: 'New' });

    const customStyles = {
        headRow: { style: { backgroundColor: C.lightBg, borderTop: `1px solid ${C.border}`, borderBottom: `2px solid ${C.border}` } },
        headCells: { style: { color: C.textDark, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' } },
        rows: { style: { minHeight: '64px', '&:not(:last-child)': { borderBottom: `1px solid ${C.border}` } } },
        cells: { style: { fontSize: '14px', color: C.textDark } },
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditItem(item);
            setFormData({ ...item });
        } else {
            setEditItem(null);
            setFormData({ client: '', property: '', broker: '', value: '', status: 'New' });
        }
        setModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editItem) {
            setLeads(leads.map(l => l.id === editItem.id ? { ...formData } : l));
        } else {
            const newId = `LED-${Math.floor(500 + Math.random() * 900)}`;
            setLeads([...leads, { id: newId, ...formData }]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Purge pipeline entry object permanently?")) {
            setLeads(leads.filter(l => l.id !== id));
        }
    };

    const filteredItems = useMemo(() => {
        return leads.filter(item =>
            item.client.toLowerCase().includes(filterText.toLowerCase()) ||
            item.property.toLowerCase().includes(filterText.toLowerCase()) ||
            item.id.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [leads, filterText]);

    const columns = [
        { name: 'Lead ID', selector: row => row.id, sortable: true, cell: row => <span style={{ fontWeight: '700', color: C.textLight }}>{row.id}</span>, width: '120px' },
        { name: 'Client Particulars', selector: row => row.client, sortable: true, cell: row => <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: C.textDark }}><FaUser size={12} /> {row.client}</span>, width: '180px' },
        { name: 'Target Property', selector: row => row.property, sortable: true, cell: row => <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.primaryBlue, fontWeight: '600' }}><FaTag size={12} /> {row.property}</span>, width: '240px' },
        { name: 'Custody Broker', selector: row => row.broker, sortable: true, width: '160px' },
        { name: 'Pipeline Value', selector: row => row.value, sortable: true, cell: row => <span style={{ fontWeight: '700' }}>{row.value}</span>, width: '150px' },
        {
            name: 'Status', selector: row => row.status, sortable: true, cell: row => (
                <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px',
                    backgroundColor: row.status === 'Converted' ? 'rgba(122,201,67,0.1)' : row.status === 'New' ? 'rgba(10,77,184,0.08)' : row.status === 'Contacted' ? 'rgba(245,158,11,0.1)' : 'rgba(220,38,38,0.1)',
                    color: row.status === 'Converted' ? C.success : row.status === 'New' ? C.primaryBlue : row.status === 'Contacted' ? C.warning : C.danger,
                    border: `1px solid ${row.status === 'Converted' ? 'rgba(122,201,67,0.25)' : row.status === 'New' ? 'rgba(10,77,184,0.18)' : row.status === 'Contacted' ? 'rgba(245,158,11,0.25)' : 'rgba(220,38,38,0.2)'}`
                }}>
                    {row.status === 'Converted' && <FaCheckCircle size={10} />}
                    {row.status === 'New' && <FaPlus size={10} />}
                    {row.status === 'Contacted' && <FaSpinner size={10} />}
                    {row.status === 'Lost' && <FaTimesCircle size={10} />}
                    {row.status}
                </span>
            ), width: '150px'
        },
        {
            name: 'Actions', cell: row => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenModal(row)} style={{ padding: '6px', background: 'none', border: 'none', color: C.primaryBlue, cursor: 'pointer' }}><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(row.id)} style={{ padding: '6px', background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><FaTrash size={14} /></button>
                </div>
            ), ignoreRowClick: true, allowOverflow: true, button: true
        }
    ];

    const stats = useMemo(() => {
        return {
            total: leads.length,
            converted: leads.filter(l => l.status === 'Converted').length,
        };
    }, [leads]);

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: C.textDark, margin: 0 }}>Lead Acquisition Management</h1>
                    <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Overview of conversion funnel tracking customer interaction states.</p>
                </div>
                <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: `linear-gradient(135deg, ${C.primaryBlue}, #003D99)`, color: C.white, border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(10,77,184,0.25)' }}><FaPlus /> Ingest Lead</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Active Pipeline Entries', val: stats.total, icon: <FaChartPie color={C.primaryBlue} /> },
                    { label: 'Successful Conversions', val: stats.converted, icon: <FaCheckCircle color={C.primaryGreen} /> }
                ].map((s, i) => (
                    <div key={i} style={{ background: C.white, padding: '24px', borderRadius: '16px', border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(10,77,184,0.03)' }}>
                        <div>
                            <div style={{ textTransform: 'uppercase', fontSize: '11px', color: C.textLight, fontWeight: '700', letterSpacing: '0.04em' }}>{s.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: C.textDark, marginTop: '6px' }}>{s.val}</div>
                        </div>
                        <div style={{ width: '44px', height: '44px', background: C.lightBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{s.icon}</div>
                    </div>
                ))}
            </div>

            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px', boxShadow: '0 4px 20px rgba(10,77,184,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', maxWidth: '400px' }}>
                    <FaSearch color={C.textLight} style={{ marginRight: '10px' }} />
                    <input type="text" placeholder="Search lead ID, client or property..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', outline: 'none', fontSize: '14px', color: C.textDark }} />
                </div>

                <DataTable columns={columns} data={filteredItems} pagination customStyles={customStyles} responsive highlightOnHover />
            </div>

            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(27,43,75,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: C.white, width: '100%', maxWidth: '500px', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: `1px solid ${C.border}` }}>
                        <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '800', color: C.textDark }}>{editItem ? 'Update Pipeline Trace' : 'Ingest Lead Object'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Client Name Details</label>
                                <input type="text" required value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Target Asset Property</label>
                                <input type="text" required value={formData.property} onChange={e => setFormData({ ...formData, property: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Assignee Broker</label>
                                    <input type="text" required value={formData.broker} onChange={e => setFormData({ ...formData, broker: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Estimated Cap Value</label>
                                    <input type="text" required value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} placeholder="e.g. ₹95,00,000" style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Pipeline Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', background: C.white }}>
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Lost">Lost</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '12px 20px', border: `1px solid ${C.border}`, borderRadius: '8px', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: C.primaryBlue, color: C.white, cursor: 'pointer', fontWeight: '700' }}>Commit Pipeline</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;