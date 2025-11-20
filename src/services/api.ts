import axios from 'axios';
import { Country, NewsItem } from '../types';

const BASE_URL = 'https://restcountries.com/v3.1';

// Mock data for fields not available in free public APIs without keys or complex scraping
const MOCK_CONTRIBUTIONS: Record<string, string[]> = {
    default: [
        "Rich cultural heritage and traditions",
        "Significant contributions to regional arts",
        "Unique culinary landscape"
    ],
    USA: ["Internet & Computing Revolution", "Space Exploration (Apollo)", "Jazz & Blues"],
    FRA: ["Modern Democracy concepts", "Cinema & Photography", "Haute Cuisine"],
    JPN: ["Automotive manufacturing", "Video Games & Electronics", "Anime/Manga"],
    GBR: ["Industrial Revolution", "Modern Parliamentary Democracy", "Pop Music (The Beatles)"],
    ITA: ["Renaissance Art", "Roman Law", "Opera"],
    DEU: ["Printing Press", "Automobile", "Classical Music (Bach, Beethoven)"],
    CHN: ["Paper & Gunpowder", "Compass", "Tea cultivation"],
    IND: ["Zero & Decimal System", "Yoga & Meditation", "Spices & Textiles"],
    BRA: ["Bossa Nova", "Biofuels", "Football excellence"],
};

const MOCK_RELIGIONS: Record<string, string[]> = {
    default: ["Christianity", "Islam", "Secular/Non-religious"],
    USA: ["Protestantism", "Catholicism", "Judaism"],
    IND: ["Hinduism", "Islam", "Christianity"],
    CHN: ["Buddhism", "Taoism", "Atheism"],
};

const MOCK_NEWS: NewsItem[] = [
    {
        title: "Economic summit yields new trade agreements",
        source: "Global News Wire",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1526304640155-246c0f935f81?auto=format&fit=crop&w=500&q=60"
    },
    {
        title: "National festival draws record crowds this year",
        source: "Local Times",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&w=500&q=60"
    },
    {
        title: "Tech sector sees rapid growth in the capital",
        source: "Tech Daily",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=60"
    }
];

export const api = {
    getAllCountries: async (): Promise<Country[]> => {
        try {
            const response = await axios.get(`${BASE_URL}/all?fields=name,cca3,ccn3,capital,population,area,flags,languages,latlng`);
            return response.data.map((c: any) => ({
                name: c.name.common,
                code: c.cca3,
                id: c.ccn3, // ISO 3166-1 numeric
                latlng: c.latlng || [0, 0],
                capital: c.capital || ['N/A'],
                population: c.population,
                area: c.area,
                flags: c.flags,
                languages: c.languages || {},
                religions: MOCK_RELIGIONS[c.cca3] || MOCK_RELIGIONS.default,
                contributions: MOCK_CONTRIBUTIONS[c.cca3] || MOCK_CONTRIBUTIONS.default,
                currentEvents: MOCK_NEWS
            }));
        } catch (error) {
            console.error("Failed to fetch countries", error);
            return [];
        }
    }
};
