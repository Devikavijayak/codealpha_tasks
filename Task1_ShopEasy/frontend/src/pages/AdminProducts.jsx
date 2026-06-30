import { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Package, 
    X,
    Image as ImageIcon,
    Tag,
    DollarSign,
    Layers
} from 'lucide-react';

const AdminProducts = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        image: '',
        stock: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await API.get('/api/products');
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock)
            };

            if (editMode) {
                await API.put(`/api/products/${formData._id}`, payload, config);
            } else {
                await API.post('/api/products', payload, config);
            }
            
            setShowModal(false);
            setEditMode(false);
            setFormData({ name: '', price: '', category: '', description: '', image: '', stock: '' });
            fetchProducts();
            alert(`Product ${editMode ? 'updated' : 'added'} successfully!`);
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await API.delete(`/api/products/${id}`, config);
            fetchProducts();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const openEditModal = (product) => {
        setFormData(product);
        setEditMode(true);
        setShowModal(true);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Inventory Management</h2>
                    <p className="text-sm text-muted">Manage your product catalog and stock levels.</p>
                </div>
                <button 
                    onClick={() => { setEditMode(false); setFormData({ name: '', price: '', category: '', description: '', image: '', stock: '' }); setShowModal(true); }}
                    className="btn-primary"
                >
                    <Plus size={20} /> Add New Product
                </button>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="p-6 border-b border-light bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or category..." 
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs font-bold text-muted uppercase">Total: {products.length} Items</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-bold text-muted uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Product Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light">
                            {filteredProducts.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img src={p.image} className="w-12 h-12 rounded-lg object-cover border border-light" />
                                            <div>
                                                <p className="text-sm font-bold">{p.name}</p>
                                                <p className="text-[10px] text-muted line-clamp-1 max-w-[200px]">{p.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-sm">₹{p.price.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-xs font-bold ${p.stock < 10 ? 'text-error' : 'text-success'}`}>
                                                {p.stock} in stock
                                            </span>
                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${p.stock < 10 ? 'bg-error' : 'bg-success'}`}
                                                    style={{ width: `${Math.min(p.stock, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => openEditModal(p)}
                                                className="p-2 text-muted hover:text-primary hover:bg-primary-light rounded-lg transition-all"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteProduct(p._id)}
                                                className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-light flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-xl font-bold">{editMode ? 'Edit Product' : 'Add New Product'}</h3>
                                    <p className="text-sm text-muted">Enter product details to update the store catalog.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                    <X size={24} className="text-muted" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase ml-1">Product Title</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input className="input-field pl-10" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Wireless Headset" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase ml-1">Price (₹)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input className="input-field pl-10" type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase ml-1">Category</label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <select className="input-field pl-10 appearance-none bg-slate-100" name="category" value={formData.category} onChange={handleInputChange} required>
                                            <option value="">Select Category</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Clothing">Clothing</option>
                                            <option value="Footwear">Footwear</option>
                                            <option value="Home">Home</option>
                                            <option value="Accessories">Accessories</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase ml-1">Stock Level</label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input className="input-field pl-10" type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="100" required />
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-muted uppercase ml-1">Image URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input className="input-field pl-10" name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." required />
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-muted uppercase ml-1">Description</label>
                                    <textarea className="input-field min-h-[100px] py-3" name="description" value={formData.description} onChange={handleInputChange} placeholder="Write something about the product..." required />
                                </div>

                                <div className="md:col-span-2 flex gap-4 pt-4 border-t border-light mt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                    <button type="submit" className="btn-primary flex-1">{editMode ? 'Update Product' : 'Add Product'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminProducts;
