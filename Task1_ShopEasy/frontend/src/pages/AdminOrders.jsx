import { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { 
    CreditCard, 
    Truck, 
    CheckCircle, 
    XCircle, 
    ChevronRight,
    Search,
    Calendar,
    User as UserIcon,
    ArrowUpRight
} from 'lucide-react';

const AdminOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await API.get('/api/orders', config);
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await API.put(`/api/orders/${id}/status`, { status }, config);
            fetchOrders();
            alert(`Order status updated to ${status}`);
        } catch (err) {
            alert('Update failed');
        }
    };

    const filteredOrders = orders.filter(o => 
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Marketplace Orders</h2>
                    <p className="text-sm text-muted">Track and fulfill customer orders from all over the world.</p>
                </div>
                <div className="flex gap-4">
                    <div className="stat-card py-2 px-4">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-muted uppercase">Pending</p>
                            <p className="text-lg font-bold">{orders.filter(o => !o.isDelivered).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="p-6 border-b border-light bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID or Customer..." 
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-bold text-muted uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Order Details</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-primary">#ORD{order._id.slice(-8).toUpperCase()}</span>
                                            <div className="flex items-center gap-1 text-[10px] text-muted">
                                                <Calendar size={10} />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                {order.user?.name?.charAt(0) || 'A'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{order.user?.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-muted">{order.user?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${
                                            order.status === 'Delivered' ? 'badge-success' : 
                                            order.status === 'Shipped' ? 'badge-info' : 'badge-warning'
                                        }`}>
                                            {order.status || 'Processing'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase">{order.paymentMethod}</span>
                                            <span className="text-[10px] text-success font-bold">{order.isPaid ? 'Paid' : 'Pending'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-sm">₹{order.totalPrice.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        {order.status !== 'Delivered' ? (
                                            <select 
                                                className="text-xs font-bold bg-slate-50 border border-light rounded-lg px-2 py-1 outline-none focus:border-primary"
                                                value={order.status || 'Processing'}
                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                            >
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        ) : (
                                            <span className="text-xs font-bold text-muted">Completed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminOrders;
