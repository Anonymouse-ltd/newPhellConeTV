import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => { } });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
        </ThemeContext.Provider>
    );
};
