export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-3
  id: string; // ISO 3166-1 numeric
  latlng: [number, number];
  capital: string[];
  population: number;
  area: number;
  flags: {
    svg: string;
    png: string;
  };
  languages: Record<string, string>;
  religions?: string[]; // Mocked usually
  contributions?: string[]; // Mocked
  currentEvents?: NewsItem[]; // Mocked
}

export interface NewsItem {
  title: string;
  imageUrl?: string;
  url: string;
  source: string;
}

export type ProjectionType = 'geoMercator' | 'geoOrthographic' | 'geoEqualEarth';

export interface GameState {
  mode: 'find-country';
  targetCountry: Country | null;
  score: {
    wins: number;
    losses: number;
  };
  lastResult: 'win' | 'loss' | null;
  selectedCountry: Country | null;
}
