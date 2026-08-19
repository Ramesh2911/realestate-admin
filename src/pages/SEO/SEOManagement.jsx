import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import {
  FaNewspaper, FaSearch, FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaFileAlt
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
  danger: '#dc2626',
};

const SEOManagement = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    keywords: '',
    content: '',
  });

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await API.get('/seo/pages');
      setPages(res.data?.pages || res.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch SEO pages.');
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        title: item.title || '',
        slug: item.slug || '',
        description: item.description || '',
        keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.keywords || ''),
        content: item.content || '',
      });
    } else {
      setEditItem(null);
      setFormData({ title: '', slug: '', description: '', keywords: '', content: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      };

      if (editItem) {
        await API.put(`/seo/pages/${editItem._id || editItem.id}`, payload);
      } else {
        await API.post('/seo/pages', payload);
      }
      setModalOpen(false);
      fetchPages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save SEO page.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this SEO page permanently?')) {
      try {
        await API.delete(`/seo/pages/${id}`);
        fetchPages();
      } catch (err) {
        setError('Failed to delete SEO page.');
      }
    }
  };

  const customStyles = {
    headRow: { style: { backgroundColor: C.lightBg, borderTop: '1px solid ' + C.border, borderBottom: '2px solid ' + C.border } },
    headCells: { style: { color: C.textDark, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' } },
    rows: { style: { minHeight: '56px' } },
    cells: { style: { fontSize: '14px', color: C.textDark } },
  };

  const columns = [
    {
      name: 'Title',
      selector: row => row.title,
      sortable: true,
      cell: row => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: C.textDark }}>
          <FaFileAlt size={12} color={C.primaryBlue} />
          {row.title}
        </span>
      ),
      width: '220px',
    },
    {
      name: 'Slug',
      selector: row => row.slug,
      sortable: true,
      cell: row => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C.primaryBlue, fontWeight: '600', fontSize: '13px' }}>
          <FaExternalLinkAlt size={10} />
          /{row.slug}
        </span>
      ),
      width: '200px',
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      cell: row => (
        <span style={{ color: C.textLight, fontSize: '13px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.description || '-'}
        </span>
      ),
    },
    {
      name: 'Keywords',
      selector: row => row.keywords,
      sortable: true,
      cell: row => {
        const keywords = Array.isArray(row.keywords) ? row.keywords : (row.keywords || '').split(',');
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {keywords.slice(0, 3).map((kw, i) => (
              <span key={i} style={{
                padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
                backgroundColor: 'rgba(10,77,184,0.08)', color: C.primaryBlue, border: '1px solid rgba(10,77,184,0.15)',
              }}>
                {kw.trim()}
              </span>
            ))}
            {keywords.length > 3 && (
              <span style={{ fontSize: '10px', color: C.textLight }}>+{keywords.length - 3}</span>
            )}
          </div>
        );
      },
      width: '200px',
    },
    {
      name: 'Date',
      selector: row => row.createdAt,
      sortable: true,
      cell: row => (
        <span style={{ color: C.textLight, fontSize: '13px' }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
        </span>
      ),
      width: '120px',
    },
    {
      name: 'Actions',
      cell: row => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleOpenModal(row)} style={{ padding: '6px', background: 'none', border: 'none', color: C.primaryBlue, cursor: 'pointer' }}>
            <FaEdit size={14} />
          </button>
          <button onClick={() => handleDelete(row._id || row.id)} style={{ padding: '6px', background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}>
            <FaTrash size={14} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '100px',
    },
  ];

  const filteredItems = pages.filter(item => {
    const search = filterText.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(search) ||
      (item.slug || '').toLowerCase().includes(search) ||
      (item.description || '').toLowerCase().includes(search)
    );
  });

  return (
    <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: C.textDark, margin: 0 }}>SEO Management</h1>
          <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Manage meta titles, descriptions, keywords, and SEO page content.</p>
        </div>
        <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, ' + C.primaryBlue + ', #003D99)', color: C.white, border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(10,77,184,0.25)' }}>
          <FaPlus /> Add SEO Page
        </button>
      </div>

      <div style={{ background: C.white, borderRadius: '20px', border: '1px solid ' + C.border, padding: '24px', boxShadow: '0 4px 20px rgba(10,77,184,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: C.lightBg, border: '1px solid ' + C.border, borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', maxWidth: '400px' }}>
          <FaSearch color={C.textLight} style={{ marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Search by title, slug, description..."
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
              <FaNewspaper size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px' }}>Loading SEO pages...</p>
            </div>
          }
          noDataComponent={
            <div style={{ padding: '40px', textAlign: 'center', color: C.textLight }}>
              <FaNewspaper size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px' }}>No SEO pages found. Create your first SEO page.</p>
            </div>
          }
        />
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(27,43,75,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.white, width: '100%', maxWidth: '560px', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid ' + C.border, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '800', color: C.textDark }}>{editItem ? 'Update SEO Page' : 'Create SEO Page'}</h3>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Page Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. About Us" style={{ width: '100%', padding: '12px', border: '1px solid ' + C.border, borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>URL Slug</label>
                <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. about-us" style={{ width: '100%', padding: '12px', border: '1px solid ' + C.border, borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Meta Description</label>
                <textarea rows={3} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="SEO meta description for search engines" style={{ width: '100%', padding: '12px', border: '1px solid ' + C.border, borderRadius: '8px', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Keywords (comma-separated)</label>
                <input type="text" value={formData.keywords} onChange={e => setFormData({ ...formData, keywords: e.target.value })} placeholder="e.g. real estate, property, buy" style={{ width: '100%', padding: '12px', border: '1px solid ' + C.border, borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Page Content</label>
                <textarea rows={6} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Full page content body" style={{ width: '100%', padding: '12px', border: '1px solid ' + C.border, borderRadius: '8px', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '12px 20px', border: '1px solid ' + C.border, borderRadius: '8px', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: C.primaryBlue, color: C.white, cursor: 'pointer', fontWeight: '700' }}>{editItem ? 'Update Page' : 'Create Page'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOManagement;
