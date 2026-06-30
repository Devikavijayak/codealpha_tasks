import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Users, 
    Tag, 
    MessageSquare, 
    Settings, 
    LogOut, 
    Search,
    Bell,
    CreditCard,
    ShieldCheck,
    Layers
} from 'lucide-react';

const AdminLayout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { name: 'Products', icon: <ShoppingBag size={20} />, path: '/admin/products' },
        { name: 'Orders', icon: <CreditCard size={20} />, path: '/admin/orders' },
        { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
        { name: 'Categories', icon: <Layers size={20} />, path: '/admin/categories' },
        { name: 'Coupons', icon: <Tag size={20} />, path: '/admin/coupons' },
        { name: 'Reviews', icon: <MessageSquare size={20} />, path: '/admin/reviews' },
    ];

    const settingItems = [
        { name: 'Site Settings', icon: <Settings size={20} />, path: '/admin/settings' },
        { name: 'Payment Settings', icon: <CreditCard size={20} />, path: '/admin/payments' },
        { name: 'Roles & Permissions', icon: <ShieldCheck size={20} />, path: '/admin/roles' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                        <ShoppingBag size={24} />
                    </div>
                    <span>ShopEasy Admin</span>
                </div>

                <nav className="admin-sidebar-nav">
                    {navItems.map((item) => (
                        <Link 
                            key={item.name} 
                            to={item.path} 
                            className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    <div className="admin-nav-label">Settings</div>
                    
                    {settingItems.map((item) => (
                        <Link 
                            key={item.name} 
                            to={item.path} 
                            className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="px-4 mt-auto">
                    <button onClick={handleLogout} className="admin-nav-item w-full text-left mt-auto">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <div className="admin-search">
                        <Search size={18} className="text-muted" />
                        <input type="text" placeholder="Search anything..." />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-muted hover:text-primary transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 pl-6 border-l border-light">
                            <div className="text-right">
                                <p className="text-sm font-bold">{user?.name || 'Admin'}</p>
                                <p className="text-[10px] text-muted font-bold uppercase">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="admin" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
