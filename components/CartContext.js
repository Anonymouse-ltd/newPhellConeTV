import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedCart = localStorage.getItem('cartItems');
            return storedCart ? JSON.parse(storedCart) : [];
        }
        return [];
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const addToCart = (gadget) => {
        setCartItems((prev) => {
            const found = prev.find(item => item.id === gadget.id);
            if (found) {
                return prev.map(item =>
                    item.id === gadget.id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prev, { ...gadget, qty: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems((prev) => prev.filter(item => item.id !== id));
    };

    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
