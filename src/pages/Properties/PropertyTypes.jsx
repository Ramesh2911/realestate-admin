import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { FaBuilding, FaPlus, FaSearch, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

const C = {
    primaryBlue: '#0A4DB8',
    primaryGreen: '#7AC943',
    textDark: '#1b2b4b',
    textLight: '#6c7a89',
    border: '#dce8d8',
    lightBg: '#F5FAF3',
    white: '#ffffff',
    danger: '#dc2626'
};

const STATIC_TYPES = [
    { id: 'TYPE-01', name: 'Apartment', code: 'APT', count: 482, premiumTax: '12%', active: true },
    { id: 'TYPE-02', name: 'Villa', code: 'VIL', count: 124, premiumTax: '18%', active: true },
    { id: 'TYPE-03', name: 'Commercial', code: 'COM', count: 96, premiumTax: '22%', active: true },
    { id: 'TYPE-04', name: 'Plot', code: 'PLT', count: 512, premiumTax: '5%', active: true },
    { id: 'TYPE-05', name: 'Penthouse', code: 'PNT', count: 34, premiumTax: '18%', active: true },
];

const PropertyTypes = () => {
    const [types, setTypes] = useState(STATIC_TYPES);
    const [filterText, setFilterText] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Structural Configuration Hook State Models
    const [formData, setFormData] = useState({ name: '', code: '', count: 0, premiumTax: '12%', active: true });

    const customStyles = {
        headRow: { style: { backgroundColor: C.lightBg, borderTopStyle: 'solid', borderTopWidth: '1px', borderTopColor: C.border, borderBottomWidth: '2px', borderBottomColor: C.border } },
        headCells: { style: { color: C.textDark, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' } },
        rows: { style: { minHeight: '58px', '&:not(:last-child)': { borderBottomStyle: 'solid', borderBottomWidth: '1px', borderBottomColor: C.border } } },
        cells: { style: { fontSize: '14px', color: C.textDark } },
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditItem(item);
            setFormData({ ...item });
        } else {
            setEditItem(null);
            setFormData({ name: '', code: '', count: 0, premiumTax: '12%', active: true });
        }
        setModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editItem) {
            setTypes(types.map(t => t.id === editItem.id ? { ...formData } : t));
        } else {
            const newId = `TYPE-${Math.floor(10 + Math.random() * 90)}`;
            setTypes([...types, { id: newId, ...formData }]);
        }
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Purging this functional classification blueprint will disconnect downstream automation definitions. Continue?")) {
            setTypes(types.filter(t => t.id !== id));
        }
    };

    const filteredItems = useMemo(() => {
        return types.filter(item =>
            item.name.toLowerCase().includes(filterText.toLowerCase()) ||
            item.code.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [types, filterText]);

    const columns = [
        { name: 'Blueprint Code', selector: row => row.id, sortable: true, cell: row => <span style={{ fontWeight: '700', color: C.textLight }}>{row.id}</span>, width: '150px' },
        { name: 'Classification Category', selector: row => row.name, sortable: true, cell: row => <span style={{ fontWeight: '700', color: C.textDark }}>{row.name}</span>, width: '220px' },
        { name: 'System Tag String', selector: row => row.code, sortable: true, cell: row => <span style={{ background: C.lightBg, padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', fontWeight: '600' }}>{row.code}</span>, width: '150px' },
        { name: 'Active Registry Count', selector: row => row.count, sortable: true, width: '180px' },
        { name: 'Standard Surcharge', selector: row => row.premiumTax, sortable: true, width: '160px' },
        {
            name: 'System Operational Actions', cell: row => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenModal(row)} style={{ padding: '6px', background: 'none', border: 'none', color: C.primaryBlue, cursor: 'pointer' }}><FaEdit size={14} /></button>
                    <button onClick={() => handleDelete(row.id)} style={{ padding: '6px', background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><FaTrash size={14} /></button>
                </div>
            ), ignoreRowClick: true, allowOverflow: true, button: true
        }
    ];

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* Structural Context Framing Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: C.textDark, margin: 0 }}>Property Classification bluePrints</h1>
                    <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Configure architectural data models and standard transaction rules parameters.</p>
                </div>
                <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: `linear-gradient(135deg, ${C.primaryBlue}, #003D99)`, color: C.white, border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(10,77,184,0.25)' }}><FaPlus /> Add Variant Spec</button>
            </div>

            {/* Main Core View Area Content Table Workspace container box block */}
            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px', boxShadow: '0 4px 20px rgba(10,77,184,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', maxWidth: '400px' }}>
                    <FaSearch color={C.textLight} style={{ marginRight: '10px' }} />
                    <input type="text" placeholder="Filter parameters classification keys..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', outline: 'none', fontSize: '14px', color: C.textDark }} />
                </div>

                <DataTable columns={columns} data={filteredItems} pagination customStyles={customStyles} responsive highlightOnHover />
            </div>

            {/* Configuration Blueprint Update Overlay Overlay Modal */}
            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(27,43,75,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: C.white, width: '100%', maxWidth: '480px', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: `1px solid ${C.border}` }}>
                        <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '800', color: C.textDark }}>{editItem ? 'Alter Structural Definition Profile' : 'Instantiate Classification Object'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Classification Identification Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Duplex Apartment Penthouse" style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>System Shortcode Tag</label>
                                    <input type="text" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g. PEN" style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Surcharge Tier Rating</label>
                                    <select value={formData.premiumTax} onChange={e => setFormData({ ...formData, premiumTax: e.target.value })} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', background: C.white }}>
                                        {['5%', '12%', '18%', '22%', '28%'].map(tax => <option key={tax} value={tax}>{tax}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '12px 20px', border: `1px solid ${C.border}`, borderRadius: '8px', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: C.primaryBlue, color: C.white, cursor: 'pointer', fontWeight: '700' }}>Deploy Definitions</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyTypes;