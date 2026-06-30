import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, User, LogOut, Package, Search, Home, ShoppingBag, ChevronDown, Heart } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { totalItems } = useContext(CartContext);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            navigate(`/shop?search=${searchTerm}`);
        }
    };

    return (
        <nav className="navbar">
            <div className="container flex justify-between items-center py-2">
                <Link to="/" className="text-2xl font-black text-primary flex items-center gap-1 tracking-tight">
                    ShopEasy
                </Link>

                <div className="hidden md:flex flex-1 justify-center px-12">
                    <div className="search-bar bg-slate-100/80 border border-transparent focus-within:border-primary/20 focus-within:bg-white focus-within:shadow-sm transition-all flex items-center pr-1 h-11 w-full max-w-lg rounded-xl overflow-hidden">
                        <input 
                            type="text" 
                            placeholder="Search for products..." 
                            className="bg-transparent border-none outline-none px-4 py-2 flex-1 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <button 
                            onClick={handleSearch} 
                            className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden lg:flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 text-muted hover:text-primary transition-all group">
                            <Home size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold">Home</span>
                        </Link>
                        <Link to="/shop" className="flex items-center gap-2 text-muted hover:text-primary transition-all group">
                            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold">Shop</span>
                        </Link>
                        <Link to="/orders" className="flex items-center gap-2 text-muted hover:text-primary transition-all group">
                            <Package size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold">Orders</span>
                        </Link>
                        <Link to="/wishlist" className="relative flex items-center gap-2 text-muted hover:text-primary transition-all group">
                            <Heart size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold">Wishlist</span>
                        </Link>
                    </div>

                    <Link to="/cart" className="relative flex items-center gap-2 text-muted hover:text-primary transition-all group">
                        <div className="relative">
                            <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-black shadow-lg shadow-primary/20">
                                    {totalItems}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold hidden sm:block">Cart</span>
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3 pl-6 border-l border-light ml-2">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-bold overflow-hidden border border-light">
                                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=f1f5f9&color=6d28d9&bold=true`} alt={user.name} />
                            </div>
                            <div className="hidden lg:flex items-center gap-1 cursor-pointer group relative">
                                <span className="text-sm font-bold text-text-main">{user.name?.split(' ')[0]}</span>
                                <ChevronDown size={14} className="text-muted group-hover:rotate-180 transition-transform" />
                                <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-light rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className="block px-4 py-2.5 text-sm font-medium hover:bg-primary-light hover:text-primary transition-colors">Admin Dashboard</Link>
                                    )}
                                    <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-error hover:bg-error/5 flex items-center gap-2 transition-colors">
                                        <LogOut size={14} /> Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.4rem' }}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

