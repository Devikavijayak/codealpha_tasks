import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingCart, HeartOff, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    return (
        <div className="container py-10 min-h-[70vh]">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-4xl font-black mb-2">My Wishlist</h2>
                    <p className="text-sm text-muted font-bold uppercase tracking-widest">{wishlistItems.length} items saved for later</p>
                </div>
                {wishlistItems.length > 0 && (
                    <Link to="/shop" className="text-primary font-bold flex items-center gap-2 hover:underline">
                        Continue Shopping <ArrowRight size={18} />
                    </Link>
                )}
            </div>

            <AnimatePresence>
                {wishlistItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card py-20 text-center flex flex-col items-center border-2 border-dashed border-light bg-slate-50/50"
                    >
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50">
                            <HeartOff size={40} className="text-dim" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Your wishlist is empty</h3>
                        <p className="text-muted mb-10 max-w-sm mx-auto">Seems like you haven't saved any favorites yet. Start exploring our marketplace to find items you love!</p>
                        <Link to="/shop" className="btn-primary px-10 py-4 shadow-xl shadow-primary/20">Explore Products</Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlistItems.map((product) => (
                            <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card group p-0 overflow-hidden hover:border-primary/30 transition-all"
                            >
                                <div className="aspect-[4/5] overflow-hidden relative bg-slate-50">
                                    <Link to={`/product/${product._id}`}>
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                    </Link>
                                    <button 
                                        onClick={() => removeFromWishlist(product._id)}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl text-error shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-error hover:text-white"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <p className="text-primary text-[10px] font-black uppercase tracking-widest">{product.category}</p>
                                        <div className="flex items-center gap-1 bg-success/10 text-success px-2 py-0.5 rounded-lg">
                                            <span className="text-[10px] font-bold">{product.rating || 4.5}</span>
                                            <Star size={10} className="fill-success" />
                                        </div>
                                    </div>
                                    
                                    <Link to={`/product/${product._id}`}>
                                        <h3 className="text-base font-bold mb-4 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                    </Link>
                                    
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black">₹{product.price.toLocaleString()}</span>
                                            <span className="text-xs text-muted line-through font-bold">₹{(product.price * 1.5).toLocaleString()}</span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => addToCart(product)}
                                            className="btn-primary w-full py-3.5 text-xs tracking-widest font-black uppercase shadow-lg shadow-primary/20 group-hover:shadow-primary/40 active:scale-95"
                                        >
                                            <ShoppingCart size={16} /> Move to Cart
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Wishlist;
