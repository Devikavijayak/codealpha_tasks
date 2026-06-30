import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { CreditCard, CheckCircle, ArrowRight } from 'lucide-react';

const Payment = () => {
    const { savePaymentMethod } = useContext(CartContext);
    const [paymentMethod, setPaymentMethod] = useState('PayPal');
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        savePaymentMethod(paymentMethod);
        navigate('/placeorder');
    };

    return (
        <div className="container py-10 max-w-2xl">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold">Payment Method</h2>
                    <p className="text-muted text-sm">Select your preferred way to pay.</p>
                </div>
            </div>

            <div className="card p-8">
                <form onSubmit={submitHandler} className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer bg-white/2 hover:bg-white/5 border-white/5 peer-checked:border-primary">
                            <input 
                                type="radio" 
                                className="w-5 h-5 accent-primary" 
                                name="paymentMethod" 
                                value="PayPal" 
                                checked={paymentMethod === 'PayPal'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">PayPal or Credit Card</span>
                                <span className="text-xs text-muted">Fast and secure payment with your PayPal account or direct credit card.</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer bg-white/2 hover:bg-white/5 border-white/5 peer-checked:border-primary">
                            <input 
                                type="radio" 
                                className="w-5 h-5 accent-primary" 
                                name="paymentMethod" 
                                value="Stripe" 
                                checked={paymentMethod === 'Stripe'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">Stripe</span>
                                <span className="text-xs text-muted">Pay directly with your card via Stripe secure gateway.</span>
                            </div>
                        </label>
                    </div>

                    <button type="submit" className="btn-primary justify-center py-4 text-lg">
                        Continue to Summary <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Payment;
