import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import MainHeader from './components/Header';
import Footer from './components/Footer';
import Banner from './components/Banner';
import Features from './components/Features';
import Shop from './components/Shop';
import FeaturedProducts from './components/FeaturedProducts';
import Categories from './components/Categories';
import BecomeFarmer from './components/BecomeFarmer';

// Product Components
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import ProductForm from './components/products/ProductForm';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import EmailVerification from './components/auth/EmailVerification';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import FarmerRegistration from './components/auth/FarmerRegistration';
import Dashboard from './components/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';

// Market Components
import MarketDashboard from './components/market/MarketDashboard';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

// Cart Component
import Cart from './components/Cart';

// Home Page Component
const Home = () => (
  <>
    <MainHeader />
    <Banner />
    <Features />
    <FeaturedProducts />
    <Categories />
    <BecomeFarmer />
    <Footer />
  </>
);

// Main App Component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AdminProvider>
            <DashboardProvider>
            <div className="min-h-screen flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Auth Routes - No Header/Footer for cleaner UX */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-farmer" element={<FarmerRegistration />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Product Routes */}
              <Route path="/products/:id" element={
                <>
                  <MainHeader />
                  <main className="flex-grow">
                    <ProductDetail />
                  </main>
                  <Footer />
                </>
              } />
              <Route path="/products/new" element={
                <ProtectedRoute>
                  <MainHeader />
                  <main className="flex-grow">
                    <ProductForm />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />
              <Route path="/products/:id/edit" element={
                <ProtectedRoute>
                  <MainHeader />
                  <main className="flex-grow">
                    <ProductForm />
                  </main>
                  <Footer />
                </ProtectedRoute>
              } />

              {/* Market Route */}
              <Route path="/market" element={
                <>
                  <MainHeader />
                  <main className="flex-grow">
                    <MarketDashboard />
                  </main>
                  <Footer />
                </>
              } />

              {/* Shop Route */}
              <Route path="/shop" element={
                <>
                  <MainHeader />
                  <main className="flex-grow">
                    <Shop />
                  </main>
                  <Footer />
                </>
              } />

              {/* Dashboard Route */}
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
            
            {/* Cart Component */}
            <Cart />
          </div>
        </DashboardProvider>
      </AdminProvider>
    </CartProvider>
  </AuthProvider>
</Router>
);
};

export default App;
