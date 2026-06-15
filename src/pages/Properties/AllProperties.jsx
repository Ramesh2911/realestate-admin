import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import {
    FaBuilding, FaPlus, FaSearch, FaEdit, FaTrash,
    FaMapMarkerAlt, FaTag, FaUserTie, FaEye
} from 'react-icons/fa';

// Premium Color System Accents
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

const STATIC_PROPERTIES = [
    { id: 'PROP-101', title: 'Skyline Residency', type: 'Apartment', location: 'Whitefield, Bangalore', price: '₹85,00.000', status: 'Available', broker: 'Ananya Sharma' },
    { id: 'PROP-102', title: 'Greenwood Meadows', type: 'Villa', location: 'Sarjapur Road, Bangalore', price: '₹2,40,00,000', status: 'Pending', broker: 'Rohan Das' },
    { id: 'PROP-103', title: 'Oasis Tech Park', type: 'Commercial', location: 'Sector V, Kolkata', price: '₹5,10,00,000', status: 'Available', broker: 'Amit Verma' },
    { id: 'PROP-104', title: 'Palm Heights', type: 'Apartment', location: 'New Town, Kolkata', price: '₹92,50,000', status: 'Sold', broker: 'Ananya Sharma' },
    { id: 'PROP-105', title: 'Silver Oak Acres', type: 'Plot', location: 'HSR Layout, Bangalore', price: '₹1,15,00,000', status: 'Available', broker: 'Sanjay Reddy' },
];

const AllProperties = () => {
    const [properties, setProperties] = useState(STATIC_PROPERTIES);
    const [filterText, setFilterText] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Form Field State Models
    const [formData, setFormData] = useState({ title: '', type: 'Apartment', location: '', price: '', status: 'Available', broker: '' });

    // Custom Table Data Customization Engine
    const customStyles = {
        header: { style: { minHeight: '56px' } },
        headRow: { style: { backgroundColor: C.lightBg, borderTopStyle: 'solid', borderTopWidth: '1px', borderTopColor: C.border, borderBottomWidth: '2px', borderBottomColor: C.border } },
        headCells: { style: { color: C.textDark, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' } },
        rows: { style: { minHeight: '64px', '&:not(:last-child)': { borderBottomStyle: 'solid', borderBottomWidth: '1px', borderBottomColor: C.border } } },
        cells: { style: { fontSize: '14px', color: C.textDark } },
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditItem(item);
            setFormData({ ...item });
        } else {
            setEditItem(null);
            setFormData({ title: '', type: 'Apartment', location: '', price: '', status: 'Available', broker: '' });
        }
        setModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editItem) {
            setProperties(properties.map(p => p.id === editItem.id ? { ...formData } : p));
        } else {
            const newId = `PROP-${Math.floor(100 + Math.random() * 900)}`;
            setProperties([...properties, { id: newId, ...formData }]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to remove this listing?")) {
            setProperties(properties.filter(p => p.id !== id));
        }
    };

    const filteredItems = useMemo(() => {
        return properties.filter(item =>
            item.title.toLowerCase().includes(filterText.toLowerCase()) ||
            item.location.toLowerCase().includes(filterText.toLowerCase()) ||
            item.id.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [properties, filterText]);

    const columns = [
        { name: 'Property ID', selector: row => row.id, sortable: true, cell: row => <span style={{ fontWeight: '700', color: C.primaryBlue }}>{row.id}</span>, width: '120px' },
        {
            name: 'Listing Details', selector: row => row.title, sortable: true, cell: row => (
                <div style={{ padding: '6px 0' }}>
                    <div style={{ fontWeight: '700', color: C.textDark, marginBottom: '2px' }}>{row.title}</div>
                    <div style={{ fontSize: '12px', color: C.textLight, display: 'flex', alignItems: 'center', gap: '4px' }}><FaMapMarkerAlt size={10} /> {row.location}</div>
                </div>
            ), width: '260px'
        },
        { name: 'Category', selector: row => row.type, sortable: true, width: '130px' },
        { name: 'Valuation', selector: row => row.price, sortable: true, cell: row => <span style={{ fontWeight: '700' }}>{row.price}</span>, width: '140px' },
        { name: 'Custodian Broker', selector: row => row.broker, sortable: true, width: '160px' },
        {
            name: 'Status', selector: row => row.status, sortable: true, cell: row => (
                <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                    backgroundColor: row.status === 'Available' ? 'rgba(22,163,74,0.1)' : row.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(220,38,38,0.1)',
                    color: row.status === 'Available' ? C.success : row.status === 'Pending' ? C.warning : C.danger,
                    border: `1px solid ${row.status === 'Available' ? 'rgba(22,163,74,0.2)' : row.status === 'Pending' ? 'rgba(245,158,11,0.2)' : 'rgba(220,38,38,0.2)'}`
                }}>{row.status}</span>
            ), width: '130px'
        },
        {
            name: 'Actions', cell: row => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenModal(row)} style={{ padding: '6px', background: 'none', border: 'none', color: C.primaryBlue, cursor: 'pointer' }} title="Modify Entry"><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(row.id)} style={{ padding: '6px', background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }} title="Purge Record"><FaTrash size={14} /></button>
                </div>
            ), ignoreRowClick: true, allowOverflow: true, button: true
        }
    ];

    // Dynamic analytic metrics
    const stats = useMemo(() => {
        return {
            total: properties.length,
            available: properties.filter(p => p.status === 'Available').length,
            value: '₹9.42 Cr'
        };
    }, [properties]);

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* Structural Metric Cards Context Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: C.textDark, margin: 0 }}>All Live Properties</h1>
                    <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Master index of asset inventory records and allocations.</p>
                </div>
                <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: `linear-gradient(135deg, ${C.primaryBlue}, #003D99)`, color: C.white, border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(10,77,184,0.25)' }}><FaPlus /> Add New Listing</button>
            </div>

            {/* Analytics Summary Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Tracked Assets', val: stats.total, icon: <FaBuilding color={C.primaryBlue} /> },
                    { label: 'Active Open Marketplace', val: stats.available, icon: <FaTag color={C.primaryGreen} /> },
                    { label: 'Estimated Portfolio Cap', val: stats.value, icon: <FaUserTie color={C.primaryBlue} /> }
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

            {/* Core Component Workspace Box */}
            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px', boxShadow: '0 4px 20px rgba(10,77,184,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', maxWidth: '400px' }}>
                    <FaSearch color={C.textLight} style={{ marginRight: '10px' }} />
                    <input type="text" placeholder="Search title, context or structural index..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', outline: 'none', fontSize: '14px', color: C.textDark }} />
                </div>

                <DataTable columns={columns} data={filteredItems} pagination customStyles={customStyles} responsive highlightOnHover defaultSortFieldId={1} />
            </div>

            {/* Dynamic Overlay Layout Modal */}
            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(27,43,75,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: C.white, width: '100%', maxWidth: '550px', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: `1px solid ${C.border}` }}>
                        <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '800', color: C.textDark }}>{editItem ? 'Update Portfolio Listing' : 'Provision Asset Record'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Property Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Category Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', background: C.white }}>
                                        {['Apartment', 'Villa', 'Commercial', 'Plot', 'Penthouse'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Valuation Price</label>
                                    <input type="text" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. ₹95,00,000" style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Physical Address Location</label>
                                <input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Allocated Broker</label>
                                    <input type="text" required value={formData.broker} onChange={e => setFormData({ ...formData, broker: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Workflow Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', background: C.white }}>
                                        {['Available', 'Pending', 'Sold'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '12px 20px', border: `1px solid ${C.border}`, borderRadius: '8px', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: C.primaryBlue, color: C.white, cursor: 'pointer', fontWeight: '700' }}>Save Records</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllProperties;