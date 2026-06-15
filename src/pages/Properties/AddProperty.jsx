import React, { useState } from 'react';
import { FaBuilding, FaCloudUploadAlt, FaSave, FaArrowLeft } from 'react-icons/fa';

const C = { primaryBlue: '#0A4DB8', primaryGreen: '#7AC943', textDark: '#1b2b4b', textLight: '#6c7a89', border: '#dce8d8', white: '#ffffff', lightBg: '#F5FAF3' };

const AddProperty = () => {
  const [formData, setFormData] = useState({ title: '', type: 'Apartment', price: '', location: '', description: '', owner: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("New property specifications dispatched to the marketplace register successfully.");
  };

  return (
    <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: C.textDark, margin: 0 }}>Onboard New Property</h1>
        <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>List and publish a new real estate asset variant under your broker wing.</p>
      </div>

      <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '32px', maxWidth: '750px', boxShadow: '0 4px 20px rgba(10,77,184,0.02)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Property Title / Project Name</label>
            <input type="text" required placeholder="e.g. Prestige Sunrise Phase 2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }}/>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Property Variant Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', background: C.white }}>
                {['Apartment', 'Villa', 'Commercial', 'Plot'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Asking Target Valuation Price</label>
              <input type="text" required placeholder="e.g. ₹1,20,00,000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }}/>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Physical Location / Zone Address</label>
              <input type="text" required placeholder="e.g. Salt Lake Sector V, Kolkata" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }}/>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Associated Land Owner</label>
              <input type="text" required placeholder="e.g. Sanjay Reddy" value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box' }}/>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Detailed Structural Overviews</label>
            <textarea rows="4" placeholder="Mention BHK, amenities, layout boundaries details..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px', border: `1px solid ${C.border}`, borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'inherit' }}></textarea>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: C.textLight, textTransform: 'uppercase' }}>Media Gallery Uploads</label>
            <div style={{ border: `2px dashed ${C.border}`, borderRadius: '12px', padding: '32px', textAlign: 'center', background: C.lightBg, cursor: 'pointer' }}>
              <FaCloudUploadAlt size={36} color={C.primaryBlue} style={{ marginBottom: '8px' }}/>
              <div style={{ fontSize: '14px', fontWeight: '700', color: C.textDark }}>Drag & drop layout blueprints or images here</div>
              <div style={{ fontSize: '12px', color: C.textLight, marginTop: '4px' }}>Supports PNG, JPG up to 5MB</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: C.primaryBlue, color: C.white, border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(10,77,184,0.2)' }}><FaSave/> Publish Marketplace Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;