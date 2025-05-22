import { useState, useEffect } from 'react';

export default function useColorMapping(colors) {
    const [colorHexMap, setColorHexMap] = useState({});

    const fallbackColors = [
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Silver', hex: '#C0C0C0' },
        { name: 'Gold', hex: '#FFD700' },
        { name: 'Blue', hex: '#0000FF' },
        { name: 'Red', hex: '#FF0000' },
        { name: 'Green', hex: '#008000' },
        { name: 'Yellow', hex: '#FFFF00' },
        { name: 'Orange', hex: '#FFA500' },
        { name: 'Purple', hex: '#800080' },
        { name: 'Pink', hex: '#FFC0CB' },
        { name: 'Brown', hex: '#A52A2A' },
        { name: 'Gray', hex: '#808080' },
        { name: 'Grey', hex: '#808080' },
        { name: 'Cyan', hex: '#00FFFF' },
        { name: 'Magenta', hex: '#FF00FF' },
        { name: 'Lime', hex: '#00FF00' },
        { name: 'Teal', hex: '#008080' },
        { name: 'Indigo', hex: '#4B0082' },
        { name: 'Violet', hex: '#EE82EE' },
        { name: 'Maroon', hex: '#800000' },
        { name: 'Navy', hex: '#000080' },
        { name: 'Olive', hex: '#808000' },
        { name: 'Coral', hex: '#FF7F50' },
        { name: 'Titanium Black', hex: '#878681' }
    ];

    const getColorHex = async (name) => {
        if (!name) return '#808080';
        const normalizedName = name.toLowerCase();

        if (colorHexMap[normalizedName]) {
            return colorHexMap[normalizedName];
        }

        const fallbackMatch = fallbackColors.find(
            (c) => c.name.toLowerCase() === normalizedName
        );
        if (fallbackMatch) {
            setColorHexMap(prev => ({ ...prev, [normalizedName]: fallbackMatch.hex }));
            return fallbackMatch.hex;
        }

        try {
            const response = await fetch(`/api/get-color-hex?name=${encodeURIComponent(name)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch color hex');
            }
            const data = await response.json();
            const hex = data.hex || '#808080';
            setColorHexMap(prev => ({ ...prev, [normalizedName]: hex }));
            return hex;
        } catch (error) {
            console.error(`Error fetching hex for color ${name}:`, error);
            const defaultHex = '#808080';
            setColorHexMap(prev => ({ ...prev, [normalizedName]: defaultHex }));
            return defaultHex;
        }
    };

    const getBackgroundColor = (colorName) => {
        if (!colorName) return '#808080';
        const normalizedName = colorName.toLowerCase();
        return colorHexMap[normalizedName] || '#808080';
    };

    useEffect(() => {
        const fetchColors = async () => {
            for (const { color } of colors) {
                if (color && !colorHexMap[color.toLowerCase()]) {
                    await getColorHex(color);
                }
            }
        };
        if (colors.length > 0) {
            fetchColors();
        }
    }, [colors]);

    return { getBackgroundColor };
}
