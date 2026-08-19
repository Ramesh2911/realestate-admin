import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import {
  FaClipboardList, FaSearch, FaUser, FaShieldAlt, FaCogs, FaInfoCircle, FaCalendarAlt
} from 'react-icons/fa';
import API from '../../services/api';

const C = {
  primaryBlue: '#0A4DB8',
  primaryGreen: '#7AC943',
  textDark: '#1b2b4b',
  textLight: '#6c7a89',
  border: '#dce8d8',
  lightBg: '#F5FAF3',
  white: '#ffffff',
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/dashboard/logs');
      setLogs(res.data?.logs || res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch activity logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const customStyles = {
    headRow: { style: { backgroundColor: C.lightBg, borderTop: `1px solid ${C.border}`, borderBottom: `2px solid ${C.border}` } },
    headCells: { style: { color: C.textDark, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' } },
    rows: { style: { minHeight: '56px', '&:not(:last-child)': { borderBottom: `1px solid ${C.border}` } } },
    cells: { style: { fontSize: '14px', color: C.textDark } },
  };

  const columns = [
    {
      name: 'User',
      selector: row => row.user || row.userName || row.username || 'N/A',
      sortable: true,
      cell: row => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: C.textDark }}>
          <FaUser size={12} color={C.primaryBlue} />
          {row.user || row.userName || row.username || 'N/A'}
        </span>
      ),
      width: '180px',
    },
    {
      name: 'Role',
      selector: row => row.role || row.userRole || 'N/A',
      sortable: true,
      cell: row => (
        <span style={{
          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px',
          backgroundColor: row.role === 'SUPER_ADMIN' ? 'rgba(10,77,184,0.08)' : 'rgba(122,201,67,0.1)',
          color: row.role === 'SUPER_ADMIN' ? C.primaryBlue : C.primaryGreen,
          border: `1px solid ${row.role === 'SUPER_ADMIN' ? 'rgba(10,77,184,0.18)' : 'rgba(122,201,67,0.25)'}`,
        }}>
          <FaShieldAlt size={10} />
          {row.role || row.userRole || 'N/A'}
        </span>
      ),
      width: '140px',
    },
    {
      name: 'Action',
      selector: row => row.action || row.activity || 'N/A',
      sortable: true,
      cell: row => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.textDark, fontWeight: '600' }}>
          <FaCogs size={12} color={C.primaryBlue} />
          {row.action || row.activity || 'N/A'}
        </span>
      ),
      width: '200px',
    },
    {
      name: 'Details',
      selector: row => row.details || row.description || row.message || '',
      sortable: true,
      cell: row => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.textLight, fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <FaInfoCircle size={12} />
          {row.details || row.description || row.message || '-'}
        </span>
      ),
    },
    {
      name: 'Date',
      selector: row => row.createdAt || row.timestamp || row.date || '',
      sortable: true,
      cell: row => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.textLight, fontSize: '13px' }}>
          <FaCalendarAlt size={12} />
          {row.createdAt
            ? new Date(row.createdAt).toLocaleString()
            : row.timestamp
              ? new Date(row.timestamp).toLocaleString()
              : row.date || 'N/A'}
        </span>
      ),
      width: '180px',
    },
  ];

  const filteredItems = logs.filter(item => {
    const search = filterText.toLowerCase();
    return (
      (item.user || item.userName || item.username || '').toLowerCase().includes(search) ||
      (item.action || item.activity || '').toLowerCase().includes(search) ||
      (item.details || item.description || item.message || '').toLowerCase().includes(search) ||
      (item.role || item.userRole || '').toLowerCase().includes(search)
    );
  });

  return (
    <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: C.textDark, margin: 0 }}>Activity Logs</h1>
          <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Audit trail of all user and system actions across the platform.</p>
        </div>
        <button onClick={fetchLogs} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: `linear-gradient(135deg, ${C.primaryBlue}, #003D99)`, color: C.white, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(10,77,184,0.25)' }}>
          <FaClipboardList /> Refresh
        </button>
      </div>

      <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px', boxShadow: '0 4px 20px rgba(10,77,184,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', maxWidth: '400px' }}>
          <FaSearch color={C.textLight} style={{ marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Search by user, action, role..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            style={{ background: 'none', border: 'none', width: '100%', outline: 'none', fontSize: '14px', color: C.textDark }}
          />
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', color: '#dc2626', fontSize: '14px', marginBottom: '16px', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <DataTable
          columns={columns}
          data={filteredItems}
          customStyles={customStyles}
          pagination
          responsive
          highlightOnHover
          progressPending={loading}
          progressComponent={
            <div style={{ padding: '40px', textAlign: 'center', color: C.textLight }}>
              <FaClipboardList size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px' }}>Loading activity logs...</p>
            </div>
          }
          noDataComponent={
            <div style={{ padding: '40px', textAlign: 'center', color: C.textLight }}>
              <FaClipboardList size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px' }}>No activity logs found.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ActivityLogs;
