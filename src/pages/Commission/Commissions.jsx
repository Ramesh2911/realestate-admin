import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { FaMoneyBillWave, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa';

const C = { primaryBlue: '#0A4DB8', primaryGreen: '#7AC943', textDark: '#1b2b4b', textLight: '#6c7a89', border: '#dce8d8', white: '#ffffff', lightBg: '#F5FAF3', success: '#16a34a' };

const STATIC_COMMISSIONS = [
    { id: 'COM-801', dealId: '#D-1084', entity: 'Ananya Sharma (Broker)', gross: '₹2,46,000', companyShare: '₹49,200', payout: '₹1,96,800', status: 'Disbursed' },
    { id: 'COM-802', dealId: '#D-1082', entity: 'Vikram Singh (Agent)', gross: '₹1,20,000', companyShare: '₹24,000', payout: '₹96,000', status: 'Disbursed' },
    { id: 'COM-803', dealId: '#D-1083', entity: 'Rohan Das (Broker)', gross: '₹6,30,000', companyShare: '₹1,26,000', payout: '₹5,04,000', status: 'Pending' },
];

const Commissions = () => {
    const [commissions] = useState(STATIC_COMMISSIONS);
    const [filterText, setFilterText] = useState('');

    const customStyles = {
        headRow: { style: { backgroundColor: C.lightBg, borderBottomWidth: '2px', borderBottomColor: C.border } },
        headCells: { style: { color: C.textDark, fontWeight: '700' } },
    };

    const filteredItems = useMemo(() => {
        return commissions.filter(item =>
            item.entity.toLowerCase().includes(filterText.toLowerCase()) ||
            item.dealId.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [commissions, filterText]);

    const columns = [
        { name: 'Payout Record', selector: row => row.id, cell: row => <span style={{ fontWeight: '700', color: C.textLight }}>{row.id}</span> },
        { name: 'Source Deal', selector: row => row.dealId, cell: row => <span style={{ fontWeight: '700', color: C.primaryBlue }}>{row.dealId}</span> },
        { name: 'Beneficiary Entity', selector: row => row.entity, sortable: true, width: '200px' },
        { name: 'Gross Pool', selector: row => row.gross },
        { name: 'Platform Cut (20%)', selector: row => row.companyShare, cell: row => <span style={{ color: C.primaryBlue, fontWeight: '600' }}>{row.companyShare}</span> },
        { name: 'Net Payout', selector: row => row.payout, cell: row => <span style={{ color: C.success, fontWeight: '700' }}>{row.payout}</span> },
        {
            name: 'Status', selector: row => row.status, cell: row => (
                <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                    backgroundColor: row.status === 'Disbursed' ? 'rgba(22,163,74,0.1)' : 'rgba(245,158,11,0.1)',
                    color: row.status === 'Disbursed' ? C.success : '#b45309'
                }}>{row.status}</span>
            )
        }
    ];

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.textDark, margin: 0 }}>Commission Ledger</h1>
                    <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Platform profit architecture cuts splits monitoring tracking window panels.</p>
                </div>
            </div>

            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', maxWidth: '380px' }}>
                    <FaSearch color={C.textLight} style={{ marginRight: '10px' }} />
                    <input type="text" placeholder="Filter by deal reference or entity..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', outline: 'none' }} />
                </div>
                <DataTable columns={columns} data={filteredItems} pagination customStyles={customStyles} highlightOnHover />
            </div>
        </div>
    );
};

export default Commissions;