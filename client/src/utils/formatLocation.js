 export const formatLocation = (location) => {
        if (!location || !location[0]?.address) return null;

        const address = location[0].address;

        // Разделяме адреса по запетая и вземаме последните 2 части (град, държава)
        const parts = address.split(',').map(part => part.trim());

        if (parts.length >= 2) {
            // Вземаме последните 2 части (град, държава)
            const city = parts[parts.length - 3];
            const country = parts[parts.length - 1];
            return `${city}, ${country}`;
        } else if (parts.length === 1) {
            // Ако има само 1 част, връщаме я
            return parts[0];
        }

        return address; // Fallback към пълния адрес
    };