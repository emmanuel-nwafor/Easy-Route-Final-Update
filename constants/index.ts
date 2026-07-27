export const FLIGHT_IMAGES = [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1000&auto=format&fit=crop',
    'https://i.pinimg.com/736x/0b/d3/d4/0bd3d45fd094f1eaf0776d95ff815028.jpg',
    'https://i.pinimg.com/736x/69/07/32/690732f1e892946e4bd1ece346011e16.jpg',
    'https://i.pinimg.com/736x/67/a9/5e/67a95eb3146b3690e392c914c6aa401e.jpg'
];

export const TRAIN_IMAGES = [
    'https://i.pinimg.com/736x/f4/f7/df/f4f7dfd2da1597a34b2b206556333712.jpg',
    'https://i.pinimg.com/736x/2b/85/68/2b856846358463584635846358463584.jpg',
    'https://i.pinimg.com/736x/56/ec/94/56ec94822c3c07f9dc37b7e70db22bd9.jpg',
    'https://i.pinimg.com/1200x/9b/15/d0/9b15d018dbec13c8340b2065ed8a517e.jpg',
    'https://i.pinimg.com/736x/4d/0f/bc/4d0fbc67a505a15661a7a7e9ee9faf70.jpg'
];

export const BUS_IMAGES = [
    'https://i.pinimg.com/1200x/c0/07/c5/c007c5b09eb00ea20af7df549489d018.jpg',
    'https://i.pinimg.com/736x/f2/e4/67/f2e467f893e9cb305ef50924f25656ab.jpg',
    'https://i.pinimg.com/1200x/47/6e/fa/476efa6ac7f0dffd6f3cfddb6278bdf4.jpg',
    'https://i.pinimg.com/1200x/39/f6/09/39f609a048052463a7f43acfa40f88f5.jpg'
];

export const translateAirportCode = (code: string) => {
    if (!code) return '';
    const clean = code.trim().toUpperCase();
    const airportMap: Record<string, string> = {
        'LHR': 'London Heathrow Airport',
        'DPS': 'Denpasar Bali Airport',
        'CDG': 'Paris Charles de Gaulle Airport',
        'JFK': 'New York John F. Kennedy Airport',
        'DXB': 'Dubai International Airport',
        'SIN': 'Singapore Changi Airport',
        'LOS': 'Murtala Muhammed Airport (Lagos)',
        'NBO': 'Jomo Kenyatta Airport (Nairobi)',
        'CPT': 'Cape Town International Airport',
        'HND': 'Tokyo Haneda Airport',
        'AMS': 'Amsterdam Airport Schiphol',
        'FRA': 'Frankfurt Airport',
        'IST': 'Istanbul Airport',
        'ORD': 'Chicago O\'Hare Airport',
        'LAX': 'Los Angeles Airport',
        'LHS': 'London Heathrow (LHS)',
        'DHS': 'Denpasar Airport (DHS)',
    };
    return airportMap[clean] || clean;
};
