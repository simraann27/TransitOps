import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/permissions';
import { 
  Navigation, 
  LayoutDashboard, 
  Truck, 
  Users, 
  Compass, 
  Wrench, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon,
  Search,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define sidebar menu items mapped to their permissions
  const menuItems = [
    { 
      name: "Dashboard", 
      icon: LayoutDashboard, 
      path: "/dashboard", 
      permission: "dashboard" 
    },
    { 
      name: "Fleet", 
      icon: Truck, 
      path: "/fleet", 
      permission: "fleet:view",
      altPermission: "fleet"
    },
    { 
      name: "Drivers", 
      icon: Users, 
      path: "/drivers", 
      permission: "drivers:view",
      altPermission: "drivers"
    },
    { 
      name: "Trips", 
      icon: Compass, 
      path: "/trips", 
      permission: "trips:view",
      altPermission: "trips"
    },
    { 
      name: "Maintenance", 
      icon: Wrench, 
      path: "/maintenance", 
      permission: "maintenance:view",
      altPermission: "maintenance"
    },
    { 
      name: "Fuel & Expenses", 
      icon: Receipt, 
      path: "/fuel-expenses", 
      permission: "fuel-expenses" 
    },
    { 
      name: "Analytics", 
      icon: BarChart3, 
      path: "/analytics", 
      permission: "analytics" 
    },
    { 
      name: "Settings", 
      icon: SettingsIcon, 
      path: "/settings",
      roleLimit: "Fleet Manager" // Visible only to Fleet Manager
    }
  ];

  // Filter menu items by permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false;
    
    // Check role limits
    if (item.roleLimit && user.role !== item.roleLimit) {
      return false;
    }
    
    // Check main permissions
    if (item.permission && hasPermission(user.role, item.permission)) {
      return true;
    }
    
    // Check alternative permissions
    if (item.altPermission && hasPermission(user.role, item.altPermission)) {
      return true;
    }

    // Default to false if permission keys exist but don't match
    return !item.permission && !item.altPermission && !item.roleLimit;
  });

  // Helper to get user initials
  const getUserInitials = (name = "") => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper to map role names to pastel colors
  const getRoleBadgeStyle = (role = "") => {
    switch (role) {
      case "Fleet Manager":
        return { backgroundColor: 'var(--color-blue-glow)', color: 'var(--color-blue-dark)' };
      case "Dispatcher":
        return { backgroundColor: 'var(--color-lavender-glow)', color: 'var(--color-lavender-dark)' };
      case "Safety Officer":
        return { backgroundColor: 'var(--color-peach-glow)', color: 'var(--color-peach-dark)' };
      case "Financial Analyst":
        return { backgroundColor: 'var(--color-mint-glow)', color: 'var(--color-mint-dark)' };
      default:
        return { backgroundColor: 'var(--bg-lavender-gray)', color: 'var(--text-secondary)' };
    }
  };

  const renderSidebarContent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      justifyContent: 'space-between'
    }}>
      <div>
        {/* Sidebar Header / Branding */}
        <div style={{
          padding: '24px 24px 32px 24px',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <Link to="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-blue)',
              color: 'var(--text-primary)',
            }}>
              <Navigation size={18} style={{ transform: 'rotate(45deg)' }} />
            </div>
            <span>Transit<span style={{ color: 'var(--color-lavender-dark)' }}>Ops</span></span>
          </Link>
        </div>

        {/* Menu Navigation Links */}
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredMenuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link 
                key={idx} 
                to={item.path} 
                onClick={() => setMobileSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-cream)' : 'transparent',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {/* Active left border indicator line */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '12px',
                    bottom: '12px',
                    width: '4px',
                    backgroundColor: 'var(--color-blue-dark)',
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
                <Icon size={18} style={{ color: isActive ? 'var(--color-blue-dark)' : 'inherit' }} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer / User Profile summary info */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: 'var(--bg-cream)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-blue-glow)',
          color: 'var(--color-blue-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          {getUserInitials(user?.name)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.name}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>
            {user?.role}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-warm-white)'
    }}>
      
      {/* DESKTOP SIDEBAR: Permanent and visible */}
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 90
      }} className="desktop-sidebar">
        {renderSidebarContent()}
      </aside>

      {/* MOBILE SIDEBAR: Off-canvas overlay drawer */}
      {mobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(27, 36, 48, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000
            }}
          />
          {/* Drawer container */}
          <aside style={{
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            width: '260px',
            backgroundColor: '#ffffff',
            boxShadow: '2px 0 20px rgba(0,0,0,0.1)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Close Button overlay */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)'
              }}
            >
              <X size={20} />
            </button>
            {renderSidebarContent()}
          </aside>
        </>
      )}

      {/* MAIN CONTENT AREA */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0 // Prevents grid overflow issues
      }}>
        
        {/* TOP NAVIGATION BAR */}
        <header style={{
          height: '70px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 80
        }}>
          {/* Left Topnav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger Button for mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                display: 'none',
                alignItems: 'center',
                padding: '4px'
              }}
              className="hamburger-btn"
            >
              <Menu size={24} />
            </button>

            {/* Search Box */}
            <div style={{ position: 'relative' }} className="search-box-wrapper">
              <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-light)' }}>
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search vehicles, dispatches, operators..." 
                style={{
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-cream)',
                  borderRadius: '10px',
                  padding: '8px 12px 8px 36px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  width: '320px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-blue-dark)';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-light)';
                  e.target.style.backgroundColor = 'var(--bg-cream)';
                }}
              />
            </div>
          </div>

          {/* Right Topnav (User Avatar, Role & Actions) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            {/* Current user initials, Name & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="user-info-section">
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.name}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  marginTop: '2px',
                  alignSelf: 'flex-end',
                  ...getRoleBadgeStyle(user?.role)
                }}>
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Interactive User profile dropdown click trigger */}
            <button 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-cream)',
                color: 'var(--text-secondary)',
                boxShadow: 'var(--shadow-soft)',
                position: 'relative'
              }}
            >
              <User size={18} />
            </button>

            {/* Dropdown Menu Overlay */}
            {userDropdownOpen && (
              <>
                <div 
                  onClick={() => setUserDropdownOpen(false)}
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                />
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: 'var(--shadow-hover)',
                  width: '180px',
                  zIndex: 100,
                  animation: 'fade-in 0.15s ease-out'
                }}>
                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'none',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#ef4444',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    className="logout-item-hover"
                  >
                    <LogOut size={16} />
                    Logout Session
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main style={{
          flex: 1,
          padding: '32px 24px',
          overflowY: 'auto'
        }}>
          {children}
        </main>
      </div>

      <style>{`
        .sidebar-link:hover {
          color: var(--text-primary) !important;
          background-color: var(--bg-cream) !important;
        }

        .logout-item-hover:hover {
          background-color: rgba(239, 68, 68, 0.05);
        }

        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile / Tablet Responsive Adjustments */
        @media (max-width: 992px) {
          .desktop-sidebar {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
        }

        @media (max-width: 576px) {
          .search-box-wrapper {
            display: none !important; /* Hide search box on small mobile screen */
          }
          .user-info-section {
            display: none !important; /* Hide name/role text on small mobile screens */
          }
        }
      `}</style>
    </div>
  );
}
