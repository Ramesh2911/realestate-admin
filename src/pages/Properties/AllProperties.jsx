import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaBuilding, FaSearch, FaTrash,
    FaMapMarkerAlt, FaTag, FaUserTie, FaEye,
    FaTimes, FaCheck, FaSpinner
} from 'react-icons/fa';

import { getPropertyApi, approvePropertyApi, rejectPropertyApi } from '../../services/auth.api';

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

const AllProperties = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        fetchPropertiesData();
    }, []);

    // 1. Fetch properties from backend API
    const fetchPropertiesData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPropertyApi();
            // Handle response payload formatted as: { success: true, message: "...", data: [...] }
            const data = response?.data?.data || response?.data || response || [];
            setProperties(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load property inventory:", err);
            const msg = err?.message || "Failed to load properties data";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // 2. Execute Approve/Reject API call and re-fetch real-time DB state
    const executeStatusUpdate = async (id, type, comment) => {
        const toastId = toast.loading(`${type === 'approve' ? 'Approving' : 'Rejecting'} property status...`);
        try {
            if (type === 'approve') {
                await approvePropertyApi(id, { comments: comment, comment: comment });
            } else {
                await rejectPropertyApi(id, { comments: comment, comment: comment });
            }

            // Trigger getPropertyApi to sync with updated MySQL verification state
            await fetchPropertiesData();

            toast.update(toastId, {
                render: `Property verification status updated successfully!`,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
        } catch (err) {
            console.error(`Failed to ${type} property:`, err);
            toast.update(toastId, {
                render: err?.response?.data?.message || `Failed to ${type} property.`,
                type: "error",
                isLoading: false,
                autoClose: 4000
            });
        }
    };

    // Prompt Toast for Approval
    const handleApprove = (id) => {
        let commentText = "Verified and Approved";

        toast(
            ({ closeToast }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong style={{ fontSize: '13px', color: C.textDark }}>Approve Property #{id}</strong>
                    <input
                        type="text"
                        defaultValue={commentText}
                        onChange={(e) => { commentText = e.target.value; }}
                        placeholder="Approval comment..."
                        style={{ padding: '6px', borderRadius: '4px', border: `1px solid ${C.border}`, fontSize: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                            onClick={closeToast}
                            style={{ padding: '4px 8px', background: C.lightBg, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                closeToast();
                                executeStatusUpdate(id, 'approve', commentText);
                            }}
                            style={{ padding: '4px 10px', background: C.success, color: C.white, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        >
                            Approve
                        </button>
                    </div>
                </div>
            ),
            { autoClose: false, closeOnClick: false }
        );
    };

    // Prompt Toast for Rejection
    const handleReject = (id) => {
        let commentText = "Verification failed";

        toast(
            ({ closeToast }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong style={{ fontSize: '13px', color: C.danger }}>Reject Property #{id}</strong>
                    <input
                        type="text"
                        defaultValue={commentText}
                        onChange={(e) => { commentText = e.target.value; }}
                        placeholder="Rejection reason..."
                        style={{ padding: '6px', borderRadius: '4px', border: `1px solid ${C.border}`, fontSize: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                            onClick={closeToast}
                            style={{ padding: '4px 8px', background: C.lightBg, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                closeToast();
                                executeStatusUpdate(id, 'reject', commentText);
                            }}
                            style={{ padding: '4px 10px', background: C.danger, color: C.white, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ),
            { autoClose: false, closeOnClick: false }
        );
    };

    // Prompt Toast for Deletion
    const handleDelete = (id) => {
        toast(
            ({ closeToast }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: C.textDark }}>Purge property record <strong>#{id}</strong>?</span>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={closeToast} style={{ padding: '4px 8px', background: C.lightBg, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                        <button
                            onClick={() => {
                                closeToast();
                                setProperties(prev => prev.filter(p => p.id !== id));
                                toast.success("Property record removed.");
                            }}
                            style={{ padding: '4px 10px', background: C.danger, color: C.white, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ),
            { autoClose: false, closeOnClick: false }
        );
    };

    const customStyles = {
        header: { style: { minHeight: '56px' } },
        headRow: { style: { backgroundColor: C.lightBg, borderTopStyle: 'solid', borderTopWidth: '1px', borderTopColor: C.border, borderBottomWidth: '2px', borderBottomColor: C.border } },
        headCells: { style: { color: C.textDark, fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' } },
        rows: { style: { minHeight: '72px', '&:not(:last-child)': { borderBottomStyle: 'solid', borderBottomWidth: '1px', borderBottomColor: C.border } } },
        cells: { style: { fontSize: '14px', color: C.textDark } },
    };

    const filteredItems = useMemo(() => {
        return properties.filter(item => {
            const title = item.property_title || item.title || '';
            const city = item.city || '';
            const address = item.address || '';
            const idStr = String(item.id || '');
            const query = filterText.toLowerCase();

            return title.toLowerCase().includes(query) ||
                city.toLowerCase().includes(query) ||
                address.toLowerCase().includes(query) ||
                idStr.toLowerCase().includes(query);
        });
    }, [properties, filterText]);

    const renderAdminBadge = (roleLabel, status) => {
        const currentStatus = status || 'Pending';
        const isApproved = currentStatus === 'Approved';
        const isPending = currentStatus === 'Pending';

        const color = isApproved ? C.success : isPending ? C.warning : C.danger;
        const bgColor = isApproved ? 'rgba(22,163,74,0.1)' : isPending ? 'rgba(245,158,11,0.1)' : 'rgba(220,38,38,0.1)';

        return (
            <span style={{
                fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px',
                backgroundColor: bgColor, color: color, whiteSpace: 'nowrap', display: 'inline-block'
            }}>
                {roleLabel}: <strong style={{ fontWeight: '800' }}>{currentStatus}</strong>
            </span>
        );
    };

    const columns = [
        {
            name: 'Property ID', selector: row => row.id, sortable: true,
            cell: row => <span style={{ fontWeight: '700', color: C.primaryBlue }}>#PROP-{row.id}</span>, width: '120px'
        },
        {
            name: 'Listing Details', selector: row => row.property_title || row.title, sortable: true,
            cell: row => {
                const title = row.property_title || row.title || 'Untitled Property';
                const location = row.city ? `${row.city}, ${row.state || ''}` : row.address || 'Location N/A';
                return (
                    <div style={{ padding: '6px 0' }}>
                        <div style={{ fontWeight: '700', color: C.textDark, marginBottom: '2px' }}>{title}</div>
                        <div style={{ fontSize: '12px', color: C.textLight, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaMapMarkerAlt size={10} /> {location}
                        </div>
                    </div>
                );
            }, width: '220px'
        },
        {
            name: 'Valuation', selector: row => row.price, sortable: true,
            cell: row => {
                const amount = parseFloat(row.price || 0);
                return <span style={{ fontWeight: '700' }}>₹{amount.toLocaleString('en-IN')}</span>;
            }, width: '130px'
        },
        {
            name: 'Global Status', selector: row => row.property_status, sortable: true,
            cell: row => {
                const status = row.property_status || 'Pending';
                const isApproved = status === 'Approved' || status === 'Available';
                const isPending = status === 'Pending';

                return (
                    <span style={{
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                        backgroundColor: isApproved ? 'rgba(22,163,74,0.1)' : isPending ? 'rgba(245,158,11,0.1)' : 'rgba(220,38,38,0.2)',
                        color: isApproved ? C.success : isPending ? C.warning : C.danger,
                        border: `1px solid ${isApproved ? 'rgba(22,163,74,0.2)' : isPending ? 'rgba(245,158,11,0.2)' : 'rgba(220,38,38,0.2)'}`,
                        whiteSpace: 'nowrap'
                    }}>{status}</span>
                );
            }, width: '130px'
        },
        {
            name: 'Verifications Hierarchy',
            cell: row => {
                // Directly reads flattened fields from SQL LEFT JOIN payload
                const adminA = row.admin_a_status || 'Pending';
                const adminB = row.admin_b_status || 'Pending';
                const superAdmin = row.super_admin_status || 'Pending';

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 0', width: '100%' }}>
                        <div>{renderAdminBadge('Super Admin', superAdmin)}</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                            {renderAdminBadge('Admin A', adminA)}
                            {renderAdminBadge('Admin B', adminB)}
                        </div>
                    </div>
                );
            }, width: '270px'
        },
        {
            name: 'Actions',
            cell: row => {
                // Retrieve current user info from localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const roleId = Number(user.role_id);

                const adminA = row.admin_a_status || 'Pending';
                const adminB = row.admin_b_status || 'Pending';
                const superAdmin = row.super_admin_status || 'Pending';

                // Check if the currently logged-in user has already submitted their review
                let isAlreadyReviewed = false;

                if (roleId === 2) {
                    // Admin A already reviewed
                    isAlreadyReviewed = adminA !== 'Pending';
                } else if (roleId === 3) {
                    // Admin B already reviewed
                    isAlreadyReviewed = adminB !== 'Pending';
                } else if (roleId === 1) {
                    // Super Admin only acts on conflicts or if super admin decision isn't finalized
                    const isConsensusReached = (adminA === 'Approved' && adminB === 'Approved') ||
                        (adminA === 'Rejected' && adminB === 'Rejected');
                    isAlreadyReviewed = isConsensusReached || superAdmin !== 'Pending';
                }

                return (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* View Details Button - Always visible */}
                        <button
                            onClick={() => navigate(`/properties/details/${row.id}`)}
                            style={{ padding: '6px', background: 'none', border: 'none', color: C.primaryBlue, cursor: 'pointer' }}
                            title="View Details"
                        >
                            <FaEye size={15} />
                        </button>

                        {/* Show Approve/Reject buttons ONLY IF the logged-in user hasn't reviewed yet */}
                        {!isAlreadyReviewed ? (
                            <>
                                <button
                                    onClick={() => handleApprove(row.id)}
                                    style={{ padding: '6px', background: 'none', border: 'none', color: C.success, cursor: 'pointer' }}
                                    title="Approve Entry"
                                >
                                    <FaCheck size={15} />
                                </button>
                                <button
                                    onClick={() => handleReject(row.id)}
                                    style={{ padding: '6px', background: 'none', border: 'none', color: '#eab308', cursor: 'pointer' }}
                                    title="Reject Entry"
                                >
                                    <FaTimes size={15} />
                                </button>
                            </>
                        ) : (
                            <span style={{ fontSize: '11px', color: C.textLight, fontStyle: 'italic', padding: '0 4px' }}>
                                Reviewed
                            </span>
                        )}

                        {/* Delete Button (Optional: Restrict to Super Admin or leave for all) */}
                        <button
                            onClick={() => handleDelete(row.id)}
                            style={{ padding: '6px', background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}
                            title="Purge Record"
                        >
                            <FaTrash size={15} />
                        </button>
                    </div>
                );
            },
            ignoreRowClick: true, allowOverflow: true, button: true, width: '160px'
        }
    ];

    const stats = useMemo(() => {
        const activeCount = properties.filter(p => p.property_status === 'Approved' || p.property_status === 'Available').length;
        const totalValuation = properties.reduce((acc, curr) => acc + parseFloat(curr.price || 0), 0);

        return {
            total: properties.length,
            available: activeCount,
            value: `₹${(totalValuation / 10000000).toFixed(2)} Cr`
        };
    }, [properties]);

    return (
        <div style={{ background: C.lightBg, minHeight: '100vh', padding: '32px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: C.textDark, margin: 0 }}>All Live Properties</h1>
                    <p style={{ color: C.textLight, margin: '4px 0 0', fontSize: '14px' }}>Master index of asset inventory records and multi-tier verification statuses.</p>
                </div>
            </div>

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

            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, padding: '24px', boxShadow: '0 4px 20px rgba(10,77,184,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 16px', marginBottom: '20px', maxWidth: '400px' }}>
                    <FaSearch color={C.textLight} style={{ marginRight: '10px' }} />
                    <input type="text" placeholder="Search title, context or structural index..." value={filterText} onChange={e => setFilterText(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', outline: 'none', fontSize: '14px', color: C.textDark }} />
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: C.textLight }}>
                        <FaSpinner className="animate-spin" size={28} style={{ marginBottom: '12px', color: C.primaryBlue }} />
                        <p style={{ margin: 0, fontWeight: '600' }}>Loading properties directory...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: C.danger }}>
                        <p style={{ margin: '0 0 12px', fontWeight: '700' }}>{error}</p>
                        <button onClick={fetchPropertiesData} style={{ padding: '8px 16px', background: C.primaryBlue, color: C.white, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Retry</button>
                    </div>
                ) : (
                    <DataTable columns={columns} data={filteredItems} pagination customStyles={customStyles} responsive highlightOnHover defaultSortFieldId={1} />
                )}
            </div>
        </div>
    );
};

export default AllProperties;