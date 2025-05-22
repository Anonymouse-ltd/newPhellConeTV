import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedCart = localStorage.getItem('cartItems');
            try {
                const parsedCart = storedCart ? JSON.parse(storedCart) : [];
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
        const stock = gadget.selectedColorStock !== undefined ? gadget.selectedColorStock : gadget.stock;
        const incomingQuantity = Number.isInteger(gadget.quantity) ? gadget.quantity : 1;

        if (stock === 0 || (stock !== undefined && stock < incomingQuantity)) {
            toast.error(`${gadget.name} (${gadget.selectedColor || 'N/A'}) is out of stock or has insufficient stock.`, {
                position: "top-center",
                toastId: `cart-add-fail-${gadget.id}-${gadget.selectedColor || 'default'}`
            });
            return;
        }

        setCartItems((prev) => {
            const found = prev.find(item => item.id === gadget.id && item.selectedColor === gadget.selectedColor);
            if (found) {
                const newQuantity = (Number.isInteger(found.quantity) ? found.quantity : 0) + incomingQuantity;
                if (stock !== undefined && newQuantity > stock) {
                    toast.error(`Cannot add more ${gadget.name} (${gadget.selectedColor || 'N/A'}). Only ${stock} in stock.`, {
                        position: "top-center",
                        toastId: `cart-add-exceed-${gadget.id}-${gadget.selectedColor || 'default'}`
                    });
                    return prev;
                }
                return prev.map(item =>
                    item.id === gadget.id && item.selectedColor === gadget.selectedColor
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            }
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
            prev.map(item => {
                if (item.id === id && item.selectedColor === color) {
                    const stock = item.selectedColorStock !== undefined ? item.selectedColorStock : item.stock;
                    if (stock !== undefined && validQuantity > stock) {
                        toast.error(`Cannot update quantity for ${item.name} (${item.selectedColor || 'N/A'}). Only ${stock} in stock.`, {
                            position: "top-center",
                            toastId: `cart-update-exceed-${id}-${color || 'default'}`
                        });
                        return { ...item, quantity: Math.min(validQuantity, stock) };
                    }
                    return { ...item, quantity: validQuantity };
                }
                return item;
            })
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
