import { useEffect, useState, useContext } from 'react';
import API from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { 
    ShoppingCart, 
    Star, 
    Heart, 
    Search, 
    SlidersHorizontal, 
    ChevronDown, 
    X,
    Filter,
    ArrowUpDown
} from 'lucide-react';

const Shop = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search') || '';

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);

    // Filter States
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState(searchQuery);
    const [maxPrice, setMaxPrice] = useState(1000000); // High default
    const [minRating, setMinRating] = useState(0);
    const [minDiscount, setMinDiscount] = useState(0);
    const [sortBy, setSortBy] = useState('newest');

    const { addToCart } = useContext(CartContext);
    const { addToWishlist, isInWishlist } = useContext(WishlistContext);

    const categories = ['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Accessories', 'Sports'];
    const sortOptions = [
        { label: 'Newest First', value: 'newest' },
        { label: 'Price: Low to High', value: 'price_low' },
        { label: 'Price: High to Low', value: 'price_high' },
        { label: 'Rating: High to Low', value: 'rating' },
    ];

    useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/api/products');
            setProducts(data);
            setFilteredProducts(data);
            
            if (data.length > 0) {
                const max = Math.max(...data.map(p => p.price));
                setMaxPrice(max);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = [...products];

        // Apply Filters
        if (category !== 'All') {
            result = result.filter(p => p.category === category);
        }
        if (search) {
            result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (minRating > 0) {
            result = result.filter(p => p.rating >= minRating);
        }
        if (minDiscount > 0) {
            result = result.filter(p => (p.discountPercentage || 0) >= minDiscount);
        }
        if (maxPrice > 0) {
            result = result.filter(p => p.price <= maxPrice);
        }

        // Apply Sorting
        switch (sortBy) {
            case 'price_low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        setFilteredProducts(result);
    }, [category, search, maxPrice, minRating, minDiscount, sortBy, products]);

    const clearFilters = () => {
        setCategory('All');
        setSearch('');
        setMinRating(0);
        setMinDiscount(0);
        const max = products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000000;
        setMaxPrice(max);
    };

    return (
        <div className="container py-10">
            <div className="main-layout">
                {/* Sidebar (Permanent on Desktop, Drawer on Mobile) */}
                <aside className={`fixed inset-y-0 left-0 w-80 bg-white z-[210] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0 lg:w-full ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full sidebar overflow-hidden bg-white border border-light flex flex-col">
                        <div className="p-6 border-b border-light flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-900">Categories</h3>
                            <button 
                                type="button"
                                onClick={() => setShowSidebar(false)} 
                                className="lg:hidden bg-slate-200 text-slate-800 p-2 rounded-full transition-all active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-4 flex flex-col gap-1 overflow-y-auto">
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => { setCategory(cat); setShowSidebar(false); }}
                                    className={`sidebar-item ${category === cat ? 'active' : ''}`}
                                >
                                    {cat}
                                </button>
                            ))}

                            <div className="mt-8 px-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Price Range</p>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100000" 
                                    step="500"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-primary h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                                />
                                <div className="flex justify-between text-[10px] mt-4 text-slate-400 font-bold">
                                    <span>₹0</span>
                                    <span className="text-primary">₹{maxPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 px-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Rating</p>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => { setMinRating(0); setShowSidebar(false); }}
                                        className={`flex items-center gap-2 text-xs font-bold p-3 rounded-xl transition-all ${minRating === 0 ? 'bg-primary-light text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        All Ratings
                                    </button>
                                    {[4, 3, 2, 1].map(r => (
                                        <button 
                                            key={r}
                                            onClick={() => { setMinRating(r); setShowSidebar(false); }}
                                            className={`flex items-center gap-2 text-xs font-bold p-3 rounded-xl transition-all ${minRating === r ? 'bg-primary-light text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-0.5 text-warning">
                                                {r} <Star size={12} className="fill-warning" />
                                            </div>
                                            & Above
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1">
                    {/* Top Toolbar */}
                    <div className="bg-white p-6 rounded-[2rem] border border-light shadow-sm mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button 
                                onClick={() => setShowSidebar(true)}
                                className="lg:hidden flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <SlidersHorizontal size={18} />
                                Filters
                            </button>
                            <div className="h-10 w-px bg-light hidden md:block lg:hidden"></div>
                            <div className="flex flex-col gap-0.5">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Marketplace</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{filteredProducts.length} Items Found</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <div className="search-bar flex-1 md:w-64">
                                <Search size={18} className="text-muted" />
                                <input 
                                    type="text" 
                                    placeholder="Search..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative group">
                                <button className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-light text-sm font-bold hover:bg-white hover:border-primary transition-all">
                                    <ArrowUpDown size={16} className="text-primary" />
                                    {sortOptions.find(o => o.value === sortBy)?.label}
                                    <ChevronDown size={16} className="text-muted" />
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-light rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    {sortOptions.map(option => (
                                        <button 
                                            key={option.value}
                                            onClick={() => setSortBy(option.value)}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary-light hover:text-primary transition-colors ${sortBy === option.value ? 'text-primary font-bold bg-primary-light/50' : 'text-muted'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Active Filters Bar */}
                    {(category !== 'All' || minRating > 0 || minDiscount > 0) && (
                        <div className="flex flex-wrap gap-2 mb-8 items-center">
                            <span className="text-[10px] font-bold text-muted uppercase mr-2">Active Filters:</span>
                            {category !== 'All' && <FilterBadge label={category} onClear={() => setCategory('All')} />}
                            {minRating > 0 && <FilterBadge label={`${minRating}★ & Above`} onClear={() => setMinRating(0)} />}
                            {minDiscount > 0 && <FilterBadge label={`${minDiscount}%+ Off`} onClear={() => setMinDiscount(0)} />}
                        </div>
                    )}

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {loading ? (
                                Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                            ) : filteredProducts.length === 0 ? (
                                <div className="col-span-full py-20 text-center flex flex-col items-center">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                        <Search size={40} className="text-muted" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No matching items found</h3>
                                    <p className="text-muted mb-8 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                                    <button onClick={clearFilters} className="btn-secondary">Clear All Filters</button>
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <motion.div
                                        key={product._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="card group p-0 overflow-hidden hover:border-primary/30"
                                    >
                                        <div className="aspect-[4/5] overflow-hidden relative bg-slate-50">
                                            <Link to={`/product/${product._id}`}>
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </Link>
                                            
                                            {product.discountPercentage > 0 && (
                                                <div className="absolute top-4 left-0 bg-error text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-r-lg shadow-lg">
                                                    {product.discountPercentage}% OFF
                                                </div>
                                            )}

                                            <button 
                                                onClick={() => addToWishlist(product)}
                                                className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl transition-all hover:scale-110 hover:bg-white z-10"
                                            >
                                                <Heart 
                                                    size={20} 
                                                    className={isInWishlist(product._id) ? 'fill-error text-error' : 'text-text-muted'} 
                                                />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-primary text-[10px] font-black uppercase tracking-widest">{product.brand || 'Premium'}</p>
                                                <div className="flex items-center gap-1 bg-success/10 text-success px-2 py-0.5 rounded-lg">
                                                    <span className="text-[10px] font-bold">{product.rating || 4.5}</span>
                                                    <Star size={10} className="fill-success" />
                                                </div>
                                            </div>
                                            <Link to={`/product/${product._id}`}>
                                                <h3 className="text-base font-bold mb-3 line-clamp-1 group-hover:text-primary transition-colors leading-tight">{product.name}</h3>
                                            </Link>
                                            
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-2xl font-black">₹{product.price.toLocaleString()}</span>
                                                    {product.discountPercentage > 0 && (
                                                        <span className="text-xs text-muted line-through font-bold">₹{(product.price * (1 + product.discountPercentage/100)).toLocaleString()}</span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => addToCart(product)}
                                                    className="btn-primary w-full py-3.5 text-xs tracking-widest font-black uppercase shadow-lg shadow-primary/20 group-hover:shadow-primary/40 active:scale-95"
                                                >
                                                    <ShoppingCart size={16} /> Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilterBadge = ({ label, onClear }) => (
    <div className="flex items-center gap-2 bg-primary-light text-primary px-3 py-1.5 rounded-xl text-xs font-bold border border-primary/20 animate-fade-in">
        {label}
        <X size={14} className="cursor-pointer hover:scale-125 transition-transform" onClick={onClear} />
    </div>
);

const SkeletonCard = () => (
    <div className="card p-0 overflow-hidden animate-pulse">
        <div className="aspect-[4/5] bg-slate-200"></div>
        <div className="p-6 flex flex-col gap-4">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            <div className="h-10 bg-slate-200 rounded w-full mt-2"></div>
        </div>
    </div>
);

export default Shop;
