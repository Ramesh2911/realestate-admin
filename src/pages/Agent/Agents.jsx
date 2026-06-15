import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import {
    FaUsers, FaPlus, FaSearch, FaEdit, FaTrash,
    FaEnvelope, FaPhone, FaUserTie, FaCheckCircle, FaChartLine
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
    danger: '#dc2626'
};

const STATIC_AGENTS = [
    { id: 'AGT-301', name: 'Vikram Singh', broker: 'Ananya Sharma', email: 'vikram@realestate.com', phone: '+91 91234 56789', closedDeals: 14 },
    { id: 'AGT-302', name: 'Priya Kulkarni', broker: 'Rohan Das', email: 'priya@primeproperties.in', phone: '+91 92345 67890', closedDeals: 8 },
    { id: 'AGT-303', name: 'Karthik Menon', broker: 'Amit Verma', email: 'karthik@vermarealty.com', phone: '+91 93456 78901', closedDeals: 22 },
    { id: 'AGT-304', name: 'Sneha Gupta', broker: 'Ananya Sharma', email: 'sneha@realestate.com', phone: '+91 94567 89012', closedDeals: 5 },
];

const Agents = () => {
    const [agents, setAgents] = useState(STATIC_AGENTS);
    const [filterText, setFilterText] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', broker: '', email: '', phone: '', closedDeals: 0 });

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
            setFormData({ name: '', broker: '', email: '', phone: '', closedDeals: 0 });
        }
        setModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editItem) {
            setAgents(agents.map(a => a.id === editItem.id ? { ...formData } : a));
        } else {
            const newId = `AGT-${Math.floor(300 + Math.random() * 900)}`;
            setAgents([...agents, { id: newId, ...formData }]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to remove this field agent profile?")) {
            setAgents(agents.filter(a => a.id !== id));
        }
    };

    const filteredItems = useMemo(() => {
        return agents.filter(item =>
            item.name.toLowerCase().includes(filterText.toLowerCase()) ||
            item.broker.toLowerCase().includes(filterText.toLowerCase()) ||
            item.email.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [agents, filterText]);

    const columns = [
        { name: 'Agent ID', selector: row => row.id, sortable: true, cell: row => <span style={{ fontWeight: '700', color: C.textLight }}>{row.id}</span>, width: '120px' },
        {
            name: 'Field Agent', selector: row => row.name, sortable: true, cell: row => (
                <div style={{ padding: '6px 0' }}>
                    <div style={{ fontWeight: '700', color: C.textDark, marginBottom: '2px' }}>{row.name}</div>
                    <div style={{ fontSize: '12px', color: C.textLight, display: 'flex', alignItems: 'center', gap: '6px' }}><FaEnvelope size={10} />{row.email}</div>
                </div>
            ), width: '240px'
        },
        { name: 'Direct Line', selector: row => row.phone, cell: row => <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.textLight }}><FaPhone size={11} />{row.phone}</span>, width: '150px' },
        { name: 'Broker Reference', selector: row => row.broker, sortable: true, cell: row => <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: C.primaryBlue }}><FaUserTie size={13} />{row.broker}</span>, width: '220px' },
        { name: 'Closures', selector: row => row.closedDeals, sortable: true, cell: row => <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: C.lightBg, padding: '4px 10px', borderRadius: '12px', fontWeight: '700', color: C.primaryGreen }}><FaChartLine size={12} /> {row.closedDeals} Deals</span>, width: '150px' },
        {
            name: 'Actions', cell: row => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenModal(row)} style={{ padding: '6px', background: 'none', border: 'none', color: C.primaryBlue, cursor: 'pointer' }}><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(row.id)} style={{ padding: '6px', background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><FaTrash size={14} /></button>
                </div>
            ), ignoreRowClick: true, allowOverflow: true, button: true
        }
    ];

    const totalClosures = useMemo(() => {
        return agents.reduce((acc, curr) => acc + curr.closedDeals, 0);
    }, [agents]);

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: C.textDark, margin: 0 }}>Agent Directory</h1>
                    <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Monitor assignments, closures performance, and field contact details.</p>
                </div>
                <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: `linear-gradient(135deg, ${C.primaryBlue}, #003D99)`, color: C.white, border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(10,77,184,0.25)' }}><FaPlus /> Provision Agent</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Registered Subordinates', val: agents.length, icon: <FaUsers color={C.primaryBlue} /> },
                    { label: 'Cumulative Contractual Closures', val: totalClosures, icon: <FaCheckCircle color={C.primaryGreen} /> }
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
                    <input type="text" placeholder="Search agent, email, or managing broker..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', outline: 'none', fontSize: '14px', color: C.textDark }} />
                </div>

                <DataTable columns={columns} data={filteredItems} pagination customStyles={customStyles} responsive highlightOnHover />
            </div>

            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(27,43,75,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: C.white, width: '100%', maxWidth: '500px', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: `1px solid ${C.border}` }}>
                        <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '800', color: C.textDark }}>{editItem ? 'Update Field Agent' : 'Create Agent Account'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Full Name Identity</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Managing Broker Reference</label>
                                <input type="text" required value={formData.broker} onChange={e => setFormData({ ...formData, broker: e.target.value })} placeholder="Broker name" style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Email Interface</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Phone Direct Line</label>
                                <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '12px 20px', border: `1px solid ${C.border}`, borderRadius: '8px', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: C.primaryBlue, color: C.white, cursor: 'pointer', fontWeight: '700' }}>Save Agent</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agents;