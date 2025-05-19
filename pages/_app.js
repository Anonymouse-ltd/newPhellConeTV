import '@/styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from '../components/CartContext';
import { WishlistProvider } from '../components/WishlistContext';
import { ThemeProvider } from '../components/ThemeContext';
export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
        <ToastContainer
          className="toast-position"
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          draggable
          theme="light"
        />
      </WishlistProvider>
    </CartProvider>
  );
}
