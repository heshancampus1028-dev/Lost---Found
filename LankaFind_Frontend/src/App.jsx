import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import ReportLostItem from './pages/ReportLostItem';
import ReportFoundItem from './pages/ReportFoundItem';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import ItemsMap from './pages/ItemsMap';
import ItemDetail from './pages/ItemDetail';
import PublicPoster from './pages/PublicPoster';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-100 transition-colors">
        {/* Navbar shown at the top of every page */}
        <Navbar /> 
        
        {/* Main content area where pages are swapped */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lost" element={<LostItems />} />
            <Route path="/lost/report" element={<ReportLostItem />} />
            <Route path="/found" element={<FoundItems />} />
            <Route path="/found/report" element={<ReportFoundItem />} />
            <Route path="/map" element={<ItemsMap />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/poster" element={<PublicPoster />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Footer shown at the bottom of every page */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
