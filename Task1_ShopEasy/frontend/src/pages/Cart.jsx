import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cartItems, removeFromCart, updateQty, totalPrice } = useContext(CartContext);
    const navigate = useNavigate();

    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <div className="container py-10">
            <h2 className="text-3xl font-black mb-10 text-slate-900">Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <div className="card py-24 text-center flex flex-col items-center border-2 border-dashed border-light bg-slate-50/50">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50">
                        <ShoppingBag size={40} className="text-dim" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Your cart is empty</h3>
                    <p className="text-muted mb-10">Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/shop" className="btn-primary px-10 py-4 shadow-xl shadow-primary/20">Start Shopping</Link>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    <div className="card p-0 overflow-hidden border border-light">
                        <div className="grid grid-cols-12 gap-4 px-10 py-6 bg-slate-50/50 border-b border-light text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-2 text-center">Price</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-right pr-12">Total</div>
                        </div>

                        <div className="flex flex-col">
                            {cartItems.map((item) => (
                                <div key={item._id} className="grid grid-cols-12 gap-4 px-10 py-8 border-b border-light last:border-0 items-center hover:bg-slate-50/30 transition-colors">
                                    <div className="col-span-6 flex items-center gap-8">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-light flex-shrink-0 p-2">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 mb-1">{item.name}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-center font-black text-slate-900">
                                        ₹{item.price.toLocaleString()}
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <div className="flex items-center gap-4 bg-slate-100 p-1 rounded-xl border border-light">
                                            <button 
                                                onClick={() => updateQty(item._id, Math.max(1, item.qty - 1))}
                                                className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-primary transition-all active:scale-90"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-6 text-center font-black text-base">{item.qty}</span>
                                            <button 
                                                onClick={() => updateQty(item._id, item.qty + 1)}
                                                className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-primary transition-all active:scale-90"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right flex items-center justify-end gap-10">
                                        <span className="font-black text-xl text-slate-900">₹{(item.price * item.qty).toLocaleString()}</span>
                                        <button 
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-slate-400 hover:text-error transition-all p-2.5 hover:bg-error/5 rounded-xl"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-end gap-10 pt-4 px-4">
                        <div className="text-left">
                            <p className="text-lg font-bold text-slate-400">
                                Total ({totalItems} items)
                            </p>
                            <p className="text-5xl font-black text-slate-900">₹{totalPrice.toLocaleString()}</p>
                        </div>
                        <button 
                            onClick={() => navigate('/shipping')}
                            className="btn-primary px-16 py-5 text-sm tracking-widest font-black uppercase shadow-2xl shadow-primary/30 active:scale-95"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
