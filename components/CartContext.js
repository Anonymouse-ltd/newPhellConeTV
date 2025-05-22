import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedCart = localStorage.getItem('cartItems');
            try {
                const parsedCart = storedCart ? JSON.parse(storedCart) : [];
                // Ensure all items have a valid quantity
                return parsedCart.map(item => ({
                    ...item,
                    quantity: Number.isInteger(item.quantity) ? item.quantity : 1
                }));
            } catch (e) {
                console.error('Error parsing cart from localStorage:', e);
                return [];
            }
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
            // Ensure the incoming quantity is a valid number
            const incomingQuantity = Number.isInteger(gadget.quantity) ? gadget.quantity : 1;
            console.log(`CartContext addToCart: ID=${gadget.id}, Color=${gadget.selectedColor}, Quantity=${incomingQuantity}`);
            // Check for existing item with same id and selectedColor
            const found = prev.find(item => item.id === gadget.id && item.selectedColor === gadget.selectedColor);
            if (found) {
                return prev.map(item =>
                    item.id === gadget.id && item.selectedColor === gadget.selectedColor
                        ? { ...item, quantity: (Number.isInteger(item.quantity) ? item.quantity : 0) + incomingQuantity }
                        : item
                );
            }
            // If no matching item-color combo, add new entry with quantity
            return [...prev, { ...gadget, quantity: incomingQuantity }];
        });
    };

    const removeFromCart = (id, color) => {
        setCartItems((prev) => prev.filter(item => !(item.id === id && item.selectedColor === color)));
    };

    const clearCart = () => setCartItems([]);

    const updateQuantity = (id, color, newQuantity) => {
        const validQuantity = Number.isInteger(newQuantity) && newQuantity > 0 ? newQuantity : 1;
        setCartItems((prev) =>
            prev.map(item =>
                item.id === id && item.selectedColor === color
                    ? { ...item, quantity: validQuantity }
                    : item
            )
        );
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
