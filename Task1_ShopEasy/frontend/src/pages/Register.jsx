import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (user) navigate(redirect);
    }, [user, navigate, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
        } catch (err) {
            alert('Registration failed');
        }
    };

    return (
        <div className="container py-20 flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card w-full max-w-md p-10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold mb-2 text-gradient">Create Account</h2>
                    <p className="text-muted">Start your premium journey today</p>
                </div>

                <form onSubmit={submitHandler} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-muted px-1">Full Name</label>
                        <input 
                            type="text" 
                            className="input-field"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-muted px-1">Email Address</label>
                        <input 
                            type="email" 
                            className="input-field"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-muted px-1">Password</label>
                        <input 
                            type="password" 
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary justify-center mt-4 py-4">
                        Register Now
                    </button>
                    <p className="text-center mt-4 text-sm text-muted">
                        Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
