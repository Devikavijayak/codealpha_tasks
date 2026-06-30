import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Star } from 'lucide-react';

const categories = [
    "All Categories", "Electronics", "Clothing", "Home & Kitchen", "Books", "Beauty", "Sports"
];

const featuredProducts = [
    { id: 1, name: "Wireless Headphones", category: "Electronics", price: 2499, oldPrice: 4999, rating: 4.5, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
    { id: 2, name: "Smart Watch", category: "Electronics", price: 3999, oldPrice: 6999, rating: 4.3, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" },
    { id: 3, name: "Men Hoodie", category: "Clothing", price: 799, oldPrice: 1499, rating: 4.2, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80" },
    { id: 4, name: "Running Shoes", category: "Sports", price: 1899, oldPrice: 2999, rating: 4.6, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" },
];

const Home = () => {
    return (
        <div className="container">
            <div className="main-layout">
                {/* Sidebar */}
                <aside className="sidebar">
                    <h3 className="mb-6 px-4 text-lg">Categories</h3>
                    <div className="flex flex-col gap-1">
                        {categories.map((cat, i) => (
                            <Link key={i} to={`/shop?category=${cat}`} className={`sidebar-item ${i === 0 ? 'active' : ''}`}>
                                {cat}
                            </Link>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main>
                    {/* Hero Banner */}
                    <div className="hero-banner">
                        <div className="z-10 max-w-lg">
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-5xl font-black mb-4 leading-tight text-slate-900"
                            >
                                Summer Sale <br /> <span className="text-primary">Up to 50% Off</span>
                            </motion.h2>
                            <p className="text-slate-600 mb-8 text-lg font-medium">
                                Discover amazing deals on top brands and latest products.
                            </p>
                            <Link to="/shop" className="btn-primary shadow-2xl shadow-primary/40 px-10 py-4 text-base">
                                Shop Now
                            </Link>
                        </div>
                        <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden hidden lg:block">
                            <img 
                                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" 
                                alt="Sale Banner" 
                                className="w-full h-full object-cover"
                                style={{ 
                                    objectPosition: 'center 20%',
                                    maskImage: 'linear-gradient(to left, black 70%, transparent 100%)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Featured Products */}
                    <section>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold">Featured Products</h2>
                            <Link to="/shop" className="text-primary font-semibold flex items-center gap-1 hover:underline">
                                View All <ChevronRight size={18} />
                            </Link>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <Link key={product.id} to={`/product/${product.id}`} className="card p-0 overflow-hidden">
                                    <div className="aspect-square bg-slate-100 relative group">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-muted mb-1">{product.category}</p>
                                        <h3 className="text-base font-bold mb-2 line-clamp-1">{product.name}</h3>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                                                <span className="text-xs text-muted line-through ml-2">₹{product.oldPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm font-semibold">
                                                <Star size={14} className="fill-warning text-warning" />
                                                <span>{product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Home;

