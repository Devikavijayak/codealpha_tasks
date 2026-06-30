import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axiosConfig';
import { motion } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Star, Truck, RefreshCcw, ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [selectedImg, setSelectedImg] = useState(0);
    
    const { addToCart } = useContext(CartContext);

    const fetchProduct = async () => {
        try {
            const { data } = await API.get(`/api/products/${id}`);
            setProduct(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    if (loading) return <div className="container py-20 text-center text-xl">Loading...</div>;
    if (!product) return <div className="container py-20 text-center text-xl text-error">Product not found.</div>;

    // Dummy thumbnails for the premium look in mockup
    const thumbnails = [
        product.image,
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"
    ];

    return (
        <div className="container py-10">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-800 hover:text-primary mb-10 transition-colors font-bold text-lg">
                <ArrowLeft size={22} /> Product Details
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Product Images (Left) */}
                <div className="flex flex-col gap-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-50 rounded-[2.5rem] p-12 flex items-center justify-center overflow-hidden aspect-square border border-light"
                    >
                        <img 
                            src={thumbnails[selectedImg]} 
                            alt={product.name} 
                            className="w-full h-full object-contain mix-blend-multiply"
                        />
                    </motion.div>
                    
                    <div className="flex gap-4 px-2">
                        {thumbnails.map((img, i) => (
                            <button 
                                key={i}
                                onClick={() => setSelectedImg(i)}
                                className={`w-28 h-28 rounded-3xl border-2 transition-all p-2 bg-slate-50 ${selectedImg === i ? 'border-primary' : 'border-transparent hover:border-light'}`}
                            >
                                <img src={img} alt="thumb" className="w-full h-full object-contain mix-blend-multiply" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info (Right) */}
                <div className="flex flex-col py-2">
                    <h1 className="text-4xl font-black mb-1 text-slate-900">{product.name}</h1>
                    <p className="text-slate-500 font-bold mb-4">{product.category}</p>
                    
                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex items-center gap-1 text-warning">
                            <Star size={16} className="fill-warning" />
                            <span className="text-sm font-black text-warning">{product.rating || 4.5}</span>
                        </div>
                        <span className="text-slate-400 text-sm font-bold">({product.numReviews || 0} reviews)</span>
                    </div>

                    <div className="flex items-baseline gap-4 mb-6">
                        <span className="text-4xl font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                        {product.discountPercentage > 0 && (
                            <>
                                <span className="text-lg text-slate-400 line-through font-bold">₹{(product.price * 1.5).toLocaleString()}</span>
                                <span className="text-success font-black text-sm uppercase">{product.discountPercentage}% OFF</span>
                            </>
                        )}
                    </div>

                    <p className="text-slate-500 leading-relaxed mb-10 text-sm font-medium max-w-lg">
                        {product.description || "High quality wireless headphones with noise cancellation and long battery life."}
                    </p>

                    <div className="mb-10">
                        <p className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Quantity:</p>
                        <div className="flex items-center gap-6 w-fit border border-light p-1.5 rounded-2xl bg-white shadow-sm">
                            <button 
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all active:scale-90"
                            >
                                <Minus size={18} className="text-slate-600" />
                            </button>
                            <span className="w-8 text-center font-black text-lg">{qty}</span>
                            <button 
                                onClick={() => setQty(qty < product.stock ? qty + 1 : qty)}
                                className={`w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all active:scale-90 ${qty >= product.stock ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                <Plus size={18} className="text-slate-600" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <button 
                            onClick={() => addToCart(product, qty)}
                            className="btn-primary py-4 text-sm tracking-widest font-black uppercase shadow-2xl shadow-primary/30"
                            disabled={product.stock === 0}
                        >
                            Add to Cart
                        </button>
                        <button 
                            onClick={() => { addToCart(product, qty); navigate('/cart'); }}
                            className="btn-secondary py-4 text-sm tracking-widest font-black uppercase bg-primary-light/50 border-none hover:bg-primary-light"
                            disabled={product.stock === 0}
                        >
                            Buy Now
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 border-t border-light pt-10">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-light transition-colors group-hover:bg-primary-light">
                                <Truck size={20} className="text-slate-600 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-800">Free Delivery</p>
                                <p className="text-[10px] text-slate-400 font-bold">on orders above ₹499</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-light transition-colors group-hover:bg-primary-light">
                                <RefreshCcw size={20} className="text-slate-600 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-800">7 Days Return</p>
                                <p className="text-[10px] text-slate-400 font-bold">No questions asked</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
