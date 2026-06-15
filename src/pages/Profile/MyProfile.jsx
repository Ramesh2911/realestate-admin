import { useEffect, useState } from "react";

const MyProfile = () => {
    const [user, setUser] = useState(null);
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!user) {
        return (
            <div style={{ padding: "20px", color: "#6b7280" }}>
                No user data found
            </div>
        );
    }

    const pageStyle = {
        height: "100%",
        width: "100%",
        background: "#f3f6fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    };

    const wrapperStyle = {
        width: "100%",
        maxWidth: "900px",
        padding: isMobile ? "12px" : "20px",
        boxSizing: "border-box",
    };

    const titleStyle = {
        fontSize: isMobile ? "22px" : "28px",
        fontWeight: "700",
        marginBottom: "20px",
        color: "#111827",
        textAlign: isMobile ? "center" : "left",
    };

    const cardStyle = {
        background: "#ffffff",
        borderRadius: "14px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        padding: isMobile ? "20px" : "32px",
    };

    const headerStyle = {
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        gap: "16px",
        marginBottom: "28px",
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "20px",
        textAlign: isMobile ? "center" : "left",
    };

    const avatarStyle = {
        width: isMobile ? "64px" : "80px",
        height: isMobile ? "64px" : "80px",
        borderRadius: "50%",
        background: "#2563eb",
        color: "#ffffff",
        fontSize: isMobile ? "28px" : "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
        flexShrink: 0,
    };

    const nameStyle = {
        fontSize: isMobile ? "18px" : "20px",
        fontWeight: "600",
        color: "#111827",
    };

    const roleStyle = {
        fontSize: "14px",
        color: "#6b7280",
        marginTop: "4px",
    };

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: "18px",
    };

    const fieldStyle = {
        display: "flex",
        flexDirection: "column",
    };

    const labelStyle = {
        fontSize: "13px",
        marginBottom: "6px",
        color: "#6b7280",
    };

    const inputStyle = {
        padding: "12px 14px",
        fontSize: "15px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        color: "#111827",
        cursor: "not-allowed",
    };

    return (
        <div style={pageStyle}>
            <div style={wrapperStyle}>
                <h1 style={titleStyle}>My Profile</h1>

                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <div style={avatarStyle}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={nameStyle}>{user.name}</div>
                            <div style={roleStyle}>{user.role_name}</div>
                        </div>
                    </div>
                   
                    <div style={gridStyle}>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Full Name</label>
                            <input value={user.name} readOnly style={inputStyle} />
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Phone Number</label>
                            <input value={user.phone} readOnly style={inputStyle} />
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Email Address</label>
                            <input value={user.email} readOnly style={inputStyle} />
                        </div>

                        <div style={fieldStyle}>
                            <label style={labelStyle}>Role</label>
                            <input value={user.role_name} readOnly style={inputStyle} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
