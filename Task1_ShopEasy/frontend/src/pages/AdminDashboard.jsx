import { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { 
    Users, 
    ShoppingBag, 
    TrendingUp, 
    Package, 
    ChevronRight,
    ArrowUpRight,
    Plus,
    MoreHorizontal
} from 'lucide-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const salesData = [
        { name: 'May 8', orders: 20, revenue: 3000 },
        { name: 'May 9', orders: 45, revenue: 5000 },
        { name: 'May 10', orders: 38, revenue: 4500 },
        { name: 'May 11', orders: 65, revenue: 7000 },
        { name: 'May 12', orders: 55, revenue: 6200 },
        { name: 'May 13', orders: 75, revenue: 8500 },
        { name: 'May 14', orders: 85, revenue: 9800 },
    ];

    const pieData = [
        { name: 'Delivered', value: 1234, color: '#10b981' },
        { name: 'Shipped', value: 567, color: '#3b82f6' },
        { name: 'Pending', value: 345, color: '#f59e0b' },
        { name: 'Cancelled', value: 199, color: '#ef4444' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const pRes = await API.get('/api/products');
            const oRes = await API.get('/api/orders', config);
            setProducts(pRes.data);
            setOrders(oRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const stats = [
        { title: 'Total Users', value: '1,234', trend: '+12.5%', icon: <Users size={24} />, color: 'bg-indigo-50 text-indigo-600' },
        { title: 'Total Orders', value: orders.length, trend: '+15.3%', icon: <ShoppingBag size={24} />, color: 'bg-emerald-50 text-emerald-600' },
        { title: 'Total Revenue', value: `₹${orders.reduce((acc, o) => acc + o.totalPrice, 0).toLocaleString()}`, trend: '+18.6%', icon: <TrendingUp size={24} />, color: 'bg-purple-50 text-purple-600' },
        { title: 'Total Products', value: products.length, trend: '+8.4%', icon: <Package size={24} />, color: 'bg-amber-50 text-amber-600' },
    ];

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.title} className="stat-card">
                            <div>
                                <p className="text-sm font-bold text-muted mb-1">{stat.title}</p>
                                <h3 className="text-2xl font-extrabold mb-1">{stat.value}</h3>
                                <p className="text-xs font-bold text-success flex items-center gap-1">
                                    <TrendingUp size={12} /> {stat.trend} <span className="text-muted">vs last month</span>
                                </p>
                            </div>
                            <div className={`stat-icon ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 card">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold">Sales Overview</h3>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted">
                                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Orders
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Revenue (₹)
                                    </div>
                                </div>
                            </div>
                            <select className="bg-slate-50 border border-light rounded-lg px-3 py-1.5 text-xs font-bold outline-none">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-bold mb-8">Order Status</h3>
                        <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-extrabold">2,345</span>
                                <span className="text-[10px] font-bold text-muted uppercase">Total Orders</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mt-6">
                            {pieData.map((item) => (
                                <div key={item.name} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ background: item.color }}></span>
                                        <span className="font-medium text-muted">{item.name}</span>
                                    </div>
                                    <span className="font-bold">{item.value} ({((item.value / 2345) * 100).toFixed(1)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2 card p-0 overflow-hidden">
                        <div className="p-6 border-b border-light flex justify-between items-center">
                            <h3 className="text-lg font-bold">Recent Orders</h3>
                            <Link to="/admin/orders" className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                                View All <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-bold text-muted uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-light">
                                    {orders.slice(0, 5).map((order) => (
                                        <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-primary">#ORD{order._id.slice(-5).toUpperCase()}</td>
                                            <td className="px-6 py-4 text-sm font-medium">{order.user?.name || 'John Doe'}</td>
                                            <td className="px-6 py-4 text-sm text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-bold">₹{order.totalPrice.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${order.isDelivered ? 'badge-success' : 'badge-warning'}`}>
                                                    {order.isDelivered ? 'Delivered' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-muted">{order.paymentMethod || 'COD'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Selling Products */}
                    <div className="card p-0 overflow-hidden">
                        <div className="p-6 border-b border-light flex justify-between items-center">
                            <h3 className="text-lg font-bold">Top Selling Products</h3>
                            <Link to="/admin/products" className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                                View All <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="divide-y divide-light">
                            {products.slice(0, 5).map((product) => (
                                <div key={product._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-light">
                                            <img src={product.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold line-clamp-1">{product.name}</p>
                                            <p className="text-[10px] text-muted font-bold uppercase">{product.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">1,234</p>
                                        <p className="text-[10px] text-muted font-bold uppercase">Sold</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Low Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="card">
                        <h3 className="text-lg font-bold mb-6">Top Categories</h3>
                        <div className="flex flex-col gap-6">
                            {[
                                { name: 'Electronics', percent: 40, color: 'bg-indigo-600' },
                                { name: 'Clothing', percent: 30, color: 'bg-emerald-500' },
                                { name: 'Footwear', percent: 20, color: 'bg-purple-600' },
                                { name: 'Accessories', percent: 10, color: 'bg-amber-500' },
                            ].map((cat) => (
                                <div key={cat.name}>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span>{cat.name}</span>
                                        <span>{cat.percent}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className={`progress-fill ${cat.color}`} style={{ width: `${cat.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-bold mb-6">Low Stock Products</h3>
                        <div className="flex flex-col gap-4">
                            {products.filter(p => p.stock < 10).slice(0, 3).map((p) => (
                                <div key={p._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                                        <p className="text-xs font-bold line-clamp-1">{p.name}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-error uppercase">Stock: {p.stock}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/admin/products" className="quick-action-card">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                <Plus size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-muted uppercase">Add Product</span>
                        </Link>
                        <div className="quick-action-card">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                <Package size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-muted uppercase">Add Category</span>
                        </div>
                        <div className="quick-action-card">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-muted uppercase">Manage Users</span>
                        </div>
                        <div className="quick-action-card">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                                <Plus size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-muted uppercase">Site Settings</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;

