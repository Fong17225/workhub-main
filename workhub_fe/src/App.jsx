import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import InterviewDashboard from './pages/InterviewDashboard';
import AddSlotPage from './pages/AddSlotPage';
import AdminDashboard from './pages/AdminDashboard';
import CreateSessionAndSlots from './pages/CreateSessionAndSlots';

function RequireRecruiterOrAdmin({ children }) {
  const token = localStorage.getItem('token');
  let role = null;
  if (token) {
    try {
      role = JSON.parse(atob(token.split('.')[1])).role?.toLowerCase();
    } catch {}
  }
  if (role === 'recruiter' || role === 'admin') {
    return children;
  }
  return <div className="text-center text-red-500 py-10">Bạn không có quyền truy cập trang này.</div>;
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/:id" element={<JobDetails />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/interview-dashboard" element={<InterviewDashboard />} />
                  <Route path="/add-slot" element={<AddSlotPage />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/create-session-and-slots/:jobId" element={
                    <RequireRecruiterOrAdmin>
                      <CreateSessionAndSlots jobId={null} />
                    </RequireRecruiterOrAdmin>
                  } />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
