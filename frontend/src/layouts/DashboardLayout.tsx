import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  LayoutDashboard as Dashboard, Users as People, Activity as Timeline, FileText as Article,
  Shield, LogOut as Logout, Menu as MenuIcon, X, UserCircle, ChevronDown,
  Stethoscope as Healing, ClipboardList as MedicalInformation, BarChart3,
  CheckCircle2 as PendingActions, Settings, CalendarDays as EventNote,
  UserPlus as PersonAdd, Clock as Queue, CalendarCheck as EventAvailable,
  ActivitySquare as Science, Stethoscope as MedicalServices, Activity as ViewTimeline, HeartPulse
} from 'lucide-react';

export default function DashboardLayout() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-teal-50 text-teal-700 border-l-3 border-teal-600'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  const adminNav = [
    { text: 'Analytics', icon: <Dashboard size={18} />, path: '/admin/analytics' },
    { text: 'Appointment Analytics', icon: <EventAvailable size={18} />, path: '/admin/appointment-analytics' },
    { text: 'Approvals', icon: <PendingActions size={18} />, path: '/admin/approvals' },
    { text: 'Appointments', icon: <EventNote size={18} />, path: '/appointments' },
    { text: 'Doctor Availability', icon: <ViewTimeline size={18} />, path: '/admin/availability' },
    { text: 'Patients', icon: <People size={18} />, path: '/patients' },
    { text: 'Predictions', icon: <Timeline size={18} />, path: '/predictions' },
    { text: 'Consultations', icon: <Healing size={18} />, path: '/consultations' },
    { text: 'Doctors', icon: <MedicalServices size={18} />, path: '/admin/staff/doctors' },
    { text: 'Receptionists', icon: <People size={18} />, path: '/admin/staff/receptionists' },
    { text: 'Technicians', icon: <Science size={18} />, path: '/admin/staff/technicians' },
  ];

  const doctorNav = [
    { text: 'My Patients', icon: <People size={18} />, path: '/patients' },
    { text: 'My Schedule', icon: <EventNote size={18} />, path: '/doctor/schedule' },
    { text: 'Live Queue', icon: <Queue size={18} />, path: '/doctor/queue' },
    { text: 'Consultations', icon: <Healing size={18} />, path: '/consultations' },
    { text: 'Predictions', icon: <Timeline size={18} />, path: '/predictions' },
  ];

  const patientNav = [
    { text: 'My Profile', icon: <Dashboard size={18} />, path: '/me/profile' },
    { text: 'Health Tracking', icon: <HeartPulse size={18} />, path: '/me/tracking' },
    { text: 'My Appointments', icon: <EventNote size={18} />, path: '/me/appointments' },
    { text: 'My Medical History', icon: <MedicalInformation size={18} />, path: '/me/medical-history' },
    { text: 'My Consultations', icon: <Healing size={18} />, path: '/consultations' },
    { text: 'My Predictions', icon: <Timeline size={18} />, path: '/me/predictions' },
    { text: 'Risk Reports', icon: <Article size={18} />, path: '/me/reports' },
  ];

  const receptionistNav = [
    { text: 'Appointments', icon: <EventNote size={18} />, path: '/appointments' },
    { text: 'Book Appointment', icon: <EventAvailable size={18} />, path: '/appointments/new' },
    { text: 'Patients', icon: <People size={18} />, path: '/patients' },
    { text: 'Register Patient', icon: <PersonAdd size={18} />, path: '/patients/new' },
  ];

  const getNavItems = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
      case 'HOSPITAL_ADMIN': return adminNav;
      case 'DOCTOR': return doctorNav;
      case 'PATIENT': return patientNav;
      case 'RECEPTIONIST': return receptionistNav;
      default: return [];
    }
  };

  const roleBadgeColor = (user?.role === 'SUPER_ADMIN' || user?.role === 'HOSPITAL_ADMIN')
    ? 'bg-purple-100 text-purple-700 border-purple-200'
    : user?.role === 'DOCTOR'
    ? 'bg-teal-100 text-teal-700'
    : 'bg-blue-100 text-blue-700';

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">PrivHealth</h1>
            <p className="text-[11px] text-teal-600 font-medium">AI Platform</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-4">Navigation</p>
          {getNavItems().map((item, i) => (
            <NavLink key={i} to={item.path} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
              {item.icon} {item.text}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Logout size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <MenuIcon size={22} className="text-slate-600" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${roleBadgeColor}`}>
                {user?.role}
              </span>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 animate-fade-in">
                    <p className="px-4 py-2 text-xs text-slate-500">{user?.email}</p>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of your account? Any unsaved changes may be lost."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
