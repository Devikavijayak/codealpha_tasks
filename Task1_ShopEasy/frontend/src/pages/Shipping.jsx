import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ArrowLeft } from 'lucide-react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const Shipping = () => {
    const { cartItems, shippingAddress, saveShippingAddress, savePaymentMethod, totalPrice, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    
    const [fullName, setFullName] = useState(shippingAddress.fullName || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [phone, setPhone] = useState(shippingAddress.phone || '');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

    const navigate = useNavigate();

    const placeOrderHandler = async (e) => {
        e.preventDefault();
        try {
            if (!user) {
                alert('Please login to place an order');
                navigate('/login');
                return;
            }

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // Map cart items to the structure expected by the backend (needs 'product' field for ID)
            const orderItems = cartItems.map(item => ({
                name: item.name,
                qty: item.qty,
                image: item.image,
                price: item.price,
                product: item._id
            }));

            const orderData = {
                orderItems,
                shippingAddress: { fullName, address, city, postalCode, phone },
                paymentMethod,
                totalPrice,
            };

            const { data } = await API.post('/api/orders', orderData, config);
            
            if (data) {
                clearCart();
                // Show a clean success state or navigate
                navigate('/orders');
            }
        } catch (err) {
            console.error('Order Error:', err.response?.data || err.message);
            alert(err.response?.data?.message || 'Failed to place order. Please check all fields.');
        }
    };

    return (
        <div className="container py-10 max-w-2xl">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-800 hover:text-primary mb-10 transition-colors font-bold text-lg">
                <ArrowLeft size={22} /> Checkout
            </button>

            <form onSubmit={placeOrderHandler} className="flex flex-col gap-12">
                {/* Shipping Address */}
                <section>
                    <h3 className="text-xl font-black mb-8 text-slate-900">Shipping Address</h3>
                    <div className="grid grid-cols-1 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                            <input 
                                className="input-field bg-slate-50/50 border-light" 
                                type="text" 
                                placeholder="John Doe"
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                            <input 
                                className="input-field bg-slate-50/50 border-light" 
                                type="text" 
                                placeholder="123, MG Road, Indiranagar"
                                value={address} 
                                onChange={(e) => setAddress(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City</label>
                                <input 
                                    className="input-field bg-slate-50/50 border-light" 
                                    type="text" 
                                    placeholder="Bangalore"
                                    value={city} 
                                    onChange={(e) => setCity(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pincode</label>
                                <input 
                                    className="input-field bg-slate-50/50 border-light" 
                                    type="text" 
                                    placeholder="560038"
                                    value={postalCode} 
                                    onChange={(e) => setPostalCode(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                            <input 
                                className="input-field bg-slate-50/50 border-light" 
                                type="text" 
                                placeholder="9876543210"
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>
                </section>

                {/* Payment Method */}
                <section>
                    <h3 className="text-xl font-black mb-8 text-slate-900">Payment Method</h3>
                    <div className="flex flex-col gap-4">
                        <label className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary-light/30' : 'border-light bg-slate-50/30'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`}>
                                {paymentMethod === 'Cash on Delivery' && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <input 
                                type="radio" 
                                name="payment" 
                                className="hidden" 
                                checked={paymentMethod === 'Cash on Delivery'} 
                                onChange={() => setPaymentMethod('Cash on Delivery')}
                            />
                            <span className="font-bold text-sm text-slate-700">Cash on Delivery</span>
                        </label>
                        
                        <label className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${paymentMethod === 'Online' ? 'border-primary bg-primary-light/30' : 'border-light bg-slate-50/30'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Online' ? 'border-primary bg-primary' : 'border-slate-300 bg-white'}`}>
                                {paymentMethod === 'Online' && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <input 
                                type="radio" 
                                name="payment" 
                                className="hidden" 
                                checked={paymentMethod === 'Online'} 
                                onChange={() => setPaymentMethod('Online')}
                            />
                            <span className="font-bold text-sm text-slate-700">Online Payment (UPI / Card / Net Banking)</span>
                        </label>
                    </div>
                </section>

                <div className="pt-8 flex flex-col gap-6">
                    <button type="submit" className="btn-primary w-full py-5 text-sm tracking-widest font-black uppercase shadow-2xl shadow-primary/30 active:scale-95">
                        Place Order
                    </button>
                    <p className="text-center text-sm font-bold text-slate-400">
                        Total Amount: <span className="text-slate-900 ml-1">₹{totalPrice.toLocaleString()}</span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Shipping;
