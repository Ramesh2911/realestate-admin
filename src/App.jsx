import {
  Routes,
  Route,
  Navigate
}
  from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./routes/ProtectedRoutes";
import AdminLayout from "./layouts/AdminLayout";

//Pages
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import MyProfile from "./pages/Profile/MyProfile";
import AllProperties from "./pages/Properties/AllProperties";
import PropertyTypes from "./pages/Properties/PropertyTypes";
import Brokers from "./pages/Broker/Brokers";
import Agents from "./pages/Agent/Agents";
import Owners from "./pages/Owner/Owners";
import Leads from "./pages/Lead/Leads";
import SiteVisits from "./pages/SiteVisit/SiteVisits";
import Deals from "./pages/Deal/Deals";
import Commissions from "./pages/Commission/Commissions";
import Reports from "./pages/Report/Reports";
import Roles from "./pages/Role/Roles";
import Settings from "./pages/Setting/Settings";
import AddProperty from "./pages/Properties/AddProperty";



function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/properties" element={<AllProperties />} />
          <Route path="/property-types" element={<PropertyTypes />} />
          <Route path="/brokers" element={<Brokers />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/site-visits" element={<SiteVisits />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
