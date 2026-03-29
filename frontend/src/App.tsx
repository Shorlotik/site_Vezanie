import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Delivery } from "./pages/Delivery";
import { Contact } from "./pages/Contact";
import { Order } from "./pages/Order";
import { Faq } from "./pages/Faq";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminOrderDetail } from "./pages/AdminOrderDetail";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/order" element={<Order />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/order/:id" element={<AdminOrderDetail />} />
      </Routes>
    </Layout>
  );
}
