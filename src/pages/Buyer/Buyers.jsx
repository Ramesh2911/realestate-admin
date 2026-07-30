import React, { useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import {
    FaUsers, FaPlus, FaSearch, FaEdit, FaTrash,
    FaEnvelope, FaPhone, FaHome, FaCheckCircle, FaSpinner
} from 'react-icons/fa';

// Import auth.api service
import { getBuyerApi } from '../../services/auth.api';

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

const Buyers = () => {
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', total_properties: 0 });

    // Fetch API Data on component mount
    useEffect(() => {
        fetchBuyersData();
    }, []);

    const fetchBuyersData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getBuyerApi();
            // Handle array directly or nested payload response safely
            const data = response?.data?.data || response || [];
            setBuyers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load buyers directory:", err);
            setError(err?.message || "Failed to load buyers data");
        } finally {
            setLoading(false);
        }
    };

    const customStyles = {
        headRow: { style: { backgroundColor: C.lightBg, borderTop: `1px solid ${C.border}`, borderBottom: `2px solid ${C.border}` } },
        headCells: { style: { color: C.textDark, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' } },
        rows: { style: { minHeight: '64px', '&:not(:last-child)': { borderBottom: `1px solid ${C.border}` } } },
        cells: { style: { fontSize: '14px', color: C.textDark } },
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditItem(item);
            setFormData({ 
                full_name: item.full_name || '', 
                email: item.email || '', 
                phone: item.phone || '', 
                total_properties: item.total_properties || 0
            });
        } else {
            setEditItem(null);
            setFormData({ full_name: '', email: '', phone: '', total_properties: 0 });
        }
        setModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editItem) {
            setBuyers(buyers.map(b => b.id === editItem.id ? { ...b, ...formData } : b));
        } else {
            const newId = Date.now();
            setBuyers([...buyers, { id: newId, ...formData }]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to remove this buyer profile?")) {
            setBuyers(buyers.filter(b => b.id !== id));
        }
    };

    const filteredItems = useMemo(() => {
        return buyers.filter(item =>
            (item.full_name || '').toLowerCase().includes(filterText.toLowerCase()) ||
            (item.email || '').toLowerCase().includes(filterText.toLowerCase()) ||
            String(item.id || '').toLowerCase().includes(filterText.toLowerCase())
        );
    }, [buyers, filterText]);

    const columns = [
        { 
            name: 'Buyer ID', 
            selector: row => row.id, 
            sortable: true, 
            cell: row => <span style={{ fontWeight: '700', color: C.textLight }}>#BUY-{row.id}</span>, 
            width: '130px' 
        },
        {
            name: 'Buyer Identity', 
            selector: row => row.full_name, 
            sortable: true, 
            cell: row => (
                <div style={{ padding: '6px 0' }}>
                    <div style={{ fontWeight: '700', color: C.textDark, marginBottom: '2px' }}>{row.full_name}</div>
                    <div style={{ fontSize: '12px', color: C.textLight, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaEnvelope size={10} />{row.email}
                    </div>
                </div>
            ), 
            width: '260px'
        },
        { 
            name: 'Direct Line', 
            selector: row => row.phone, 
            cell: row => (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.textLight }}>
                    <FaPhone size={11} />{row.phone || 'N/A'}
                </span>
            ), 
            width: '160px' 
        },
        {
            name: 'Actions', 
            cell: row => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenModal(row)} style={{ padding: '6px', background: 'none', border: 'none', color: C.primaryBlue, cursor: 'pointer' }}><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(row.id)} style={{ padding: '6px', background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><FaTrash size={14} /></button>
                </div>
            ), 
            ignoreRowClick: true, 
            allowOverflow: true, 
            button: true
        }
    ];

    const totalInterestedAssets = useMemo(() => {
        return buyers.reduce((acc, curr) => acc + (parseInt(curr.total_properties, 10) || 0), 0);
    }, [buyers]);

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: C.textDark, margin: 0 }}>Buyers Directory</h1>
                    <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Manage prospective buyers, lead profiles, and asset interest signals.</p>
                </div>
                {/* <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: `linear-gradient(135deg, ${C.primaryBlue}, #003D99)`, color: C.white, border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(10,77,184,0.25)' }}><FaPlus /> Register Buyer</button> */}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Registered Buyers', val: buyers.length, icon: <FaUsers color={C.primaryBlue} /> },
                    { label: 'Total Interested Assets', val: totalInterestedAssets, icon: <FaCheckCircle color={C.primaryGreen} /> }
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
                    <input type="text" placeholder="Search buyer ID, name or email..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', outline: 'none', fontSize: '14px', color: C.textDark }} />
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: C.textLight }}>
                        <FaSpinner className="animate-spin" size={28} style={{ marginBottom: '12px', color: C.primaryBlue }} />
                        <p style={{ margin: 0, fontWeight: '600' }}>Loading buyers directory...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: C.danger }}>
                        <p style={{ margin: '0 0 12px', fontWeight: '700' }}>{error}</p>
                        <button onClick={fetchBuyersData} style={{ padding: '8px 16px', background: C.primaryBlue, color: C.white, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Retry</button>
                    </div>
                ) : (
                    <DataTable 
                        columns={columns} 
                        data={filteredItems} 
                        pagination 
                        customStyles={customStyles} 
                        responsive 
                        highlightOnHover 
                    />
                )}
            </div>

            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(27,43,75,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: C.white, width: '100%', maxWidth: '500px', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: `1px solid ${C.border}` }}>
                        <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '800', color: C.textDark }}>{editItem ? 'Update Buyer Records' : 'Register Buyer Profile'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Full Identity Name</label>
                                <input type="text" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Electronic Address (Email)</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Cellular / Contact Line</label>
                                <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '12px 20px', border: `1px solid ${C.border}`, borderRadius: '8px', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: C.primaryBlue, color: C.white, cursor: 'pointer', fontWeight: '700' }}>Save Buyer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Buyers;