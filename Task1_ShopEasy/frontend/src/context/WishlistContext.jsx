import { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(JSON.parse(localStorage.getItem('wishlistItems')) || []);

    useEffect(() => {
        localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        const existItem = wishlistItems.find((x) => x._id === product._id);
        if (!existItem) {
            setWishlistItems([...wishlistItems, product]);
        } else {
            setWishlistItems(wishlistItems.filter((x) => x._id !== product._id));
        }
    };

    const removeFromWishlist = (id) => {
        setWishlistItems(wishlistItems.filter((x) => x._id !== id));
    };

    const isInWishlist = (id) => {
        return wishlistItems.some((x) => x._id === id);
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
