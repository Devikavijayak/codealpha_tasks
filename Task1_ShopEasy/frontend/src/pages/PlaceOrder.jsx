import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { MapPin, CreditCard, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

const PlaceOrder = () => {
    const navigate = useNavigate();
    const { cartItems, shippingAddress, paymentMethod, totalPrice, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    // Calculate Prices
    const itemsPrice = totalPrice;
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
    const finalTotalPrice = itemsPrice + shippingPrice + taxPrice;

    const placeOrderHandler = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.post(
                'http://localhost:5000/api/orders',
                {
                    orderItems: cartItems.map(item => ({
                        name: item.name,
                        qty: item.qty,
                        image: item.image,
                        price: item.price,
                        product: item._id
                    })),
                    shippingAddress,
                    paymentMethod,
                    itemsPrice,
                    shippingPrice,
                    taxPrice,
                    totalPrice: finalTotalPrice,
                },
                config
            );

            clearCart();
            navigate(`/orders`);
        } catch (error) {
            alert(error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/shop');
        }
    }, [cartItems, navigate]);

    return (
        <div className="container py-10">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted hover:text-primary mb-8 transition-colors font-semibold">
                <ArrowLeft size={18} /> Back
            </button>

            <h2 className="text-3xl font-bold mb-10">Review Your Order</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Shipping Info */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6 text-primary">
                            <MapPin size={20} />
                            <h3 className="text-xl font-bold">Shipping Address</h3>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-light">
                            <p className="font-bold text-lg mb-1">{shippingAddress.fullName}</p>
                            <p className="text-muted leading-relaxed">
                                {shippingAddress.address}, {shippingAddress.city}<br />
                                {shippingAddress.postalCode}<br />
                                Phone: {shippingAddress.phone}
                            </p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6 text-primary">
                            <CreditCard size={20} />
                            <h3 className="text-xl font-bold">Payment Method</h3>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-light flex items-center justify-between">
                            <span className="font-bold text-lg">{paymentMethod}</span>
                            <span className="badge badge-success">Selected</span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6 text-primary">
                            <ShoppingBag size={20} />
                            <h3 className="text-xl font-bold">Order Items</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-light">
                                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-light">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <Link to={`/product/${item._id}`} className="font-bold hover:text-primary transition-colors">{item.name}</Link>
                                        <p className="text-xs text-muted">Quantity: {item.qty}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">₹{(item.qty * item.price).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-32 shadow-xl shadow-slate-200">
                        <h3 className="text-2xl font-bold mb-8">Summary</h3>
                        
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex justify-between items-center text-muted font-medium">
                                <span>Items</span>
                                <span className="text-text-main">₹{itemsPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-muted font-medium">
                                <span>Shipping</span>
                                <span className={shippingPrice === 0 ? 'text-success font-bold' : 'text-text-main'}>
                                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-muted font-medium">
                                <span>Tax (GST 18%)</span>
                                <span className="text-text-main">₹{taxPrice.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-light my-2"></div>
                            <div className="flex justify-between items-center text-2xl font-bold">
                                <span>Total</span>
                                <span className="text-primary">₹{finalTotalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <button 
                            onClick={placeOrderHandler}
                            disabled={cartItems.length === 0}
                            className="btn-primary w-full py-4 text-lg shadow-lg shadow-primary/20"
                        >
                            Place Order <ArrowRight size={20} className="ml-2" />
                        </button>

                        <p className="text-xs text-center text-muted mt-6 leading-relaxed px-4">
                            By placing your order, you agree to our <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;

