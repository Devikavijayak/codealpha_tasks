import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('cartItems')) || []);
    const [shippingAddress, setShippingAddress] = useState(JSON.parse(localStorage.getItem('shippingAddress')) || {});
    const [paymentMethod, setPaymentMethod] = useState(localStorage.getItem('paymentMethod') || 'PayPal');

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    }, [shippingAddress]);

    useEffect(() => {
        localStorage.setItem('paymentMethod', paymentMethod);
    }, [paymentMethod]);

    const addToCart = (product, qty = 1) => {
        console.log('Adding to cart:', product.name, qty);
        setCartItems(prev => {
            const existItem = prev.find((x) => x._id === product._id);
            const currentQty = existItem ? existItem.qty : 0;
            const newQty = currentQty + qty;

            if (newQty > product.stock) {
                alert(`Only ${product.stock} items available in stock`);
                return prev;
            }

            if (existItem) {
                return prev.map((x) => x._id === product._id ? { ...existItem, qty: newQty } : x);
            } else {
                return [...prev, { ...product, qty }];
            }
        });
    };

    const updateQty = (id, qty) => {
        console.log('Updating qty:', id, qty);
        const newQty = Number(qty);
        if (newQty < 1) return;
        
        setCartItems(prev => {
            const item = prev.find(x => x._id === id);
            if (item && item.stock !== undefined && newQty > item.stock) {
                alert(`Only ${item.stock} items available in stock`);
                return prev;
            }
            return prev.map((x) => x._id === id ? { ...x, qty: newQty } : x);
        });
    };

    const removeFromCart = (id) => {
        console.log('Removing from cart:', id);
        setCartItems(prev => prev.filter((x) => x._id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    const saveShippingAddress = (data) => {
        setShippingAddress(data);
    };

    const savePaymentMethod = (method) => {
        setPaymentMethod(method);
    };

    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateQty, 
            clearCart, 
            totalItems, 
            totalPrice,
            shippingAddress,
            saveShippingAddress,
            paymentMethod,
            savePaymentMethod
        }}>
            {children}
        </CartContext.Provider>
    );
};
