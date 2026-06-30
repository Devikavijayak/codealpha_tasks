import { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Package, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const { user } = useContext(AuthContext);

    const tabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/api/orders/myorders', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setOrders(data);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Delivered': return <span className="badge badge-success px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">Delivered</span>;
            case 'Shipped': return <span className="badge badge-info px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">Shipped</span>;
            case 'Cancelled': return <span className="badge badge-error px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">Cancelled</span>;
            case 'Processing': return <span className="badge badge-warning px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">Placed</span>;
            default: return <span className="badge badge-info px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">Placed</span>;
        }
    };

    const filteredOrders = activeTab === 'All' 
        ? orders 
        : activeTab === 'Placed' 
            ? orders.filter(o => o.status === 'Processing')
            : orders.filter(o => o.status === activeTab);

    return (
        <div className="container py-10 min-h-[70vh]">
            <h2 className="text-3xl font-black mb-10 text-slate-900">My Orders</h2>

            {/* Tabs */}
            <div className="flex gap-10 border-b border-light mb-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {['All', 'Placed', 'Shipped', 'Delivered', 'Cancelled'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-black transition-all border-b-4 tracking-wide ${activeTab === tab ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            
            <div className="flex flex-col gap-8">
                {filteredOrders.length === 0 ? (
                    <div className="card py-24 text-center flex flex-col items-center border-2 border-dashed border-light bg-slate-50/50">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50">
                            <Package size={40} className="text-dim" />
                        </div>
                        <p className="text-2xl font-bold mb-3 text-slate-900">No orders found</p>
                        <p className="text-slate-500 mb-10">You haven't placed any orders in this category yet.</p>
                        <Link to="/shop" className="btn-primary px-10 py-4 shadow-xl shadow-primary/20">Start Shopping</Link>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order._id} className="card p-8 hover:shadow-xl hover:border-primary/20 transition-all group border-light">
                            <div className="flex flex-wrap items-center justify-between gap-8 mb-8">
                                <div className="flex flex-wrap gap-x-12 gap-y-6">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order ID</p>
                                        <p className="font-black text-sm text-slate-900">#ORD{order._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date</p>
                                        <p className="font-bold text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Amount</p>
                                        <p className="font-black text-sm text-slate-900">₹{order.totalPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    {getStatusBadge(order.status)}
                                    <Link to={`/order/${order._id}`} className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-1 hover:underline">
                                        View Details <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-light flex flex-wrap gap-4">
                                {order.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-light group-hover:bg-white transition-colors">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-light bg-white p-1">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-black text-slate-400 uppercase leading-tight line-clamp-1 w-28">{item.name}</p>
                                            <p className="text-xs font-black text-slate-900">Qty: {item.qty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Orders;
