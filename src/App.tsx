import React, { useState, useEffect, useCallback } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import { api } from './services/api';
import { Country, GameState, ProjectionType } from './types';
import { Globe, Settings, Map as MapIcon } from 'lucide-react';
import 'react-tooltip/dist/react-tooltip.css';

function App() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [projection, setProjection] = useState<ProjectionType>('geoEqualEarth');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [gameState, setGameState] = useState<GameState>({
        mode: 'find-country',
        targetCountry: null,
        score: { wins: 0, losses: 0 },
        lastResult: null,
        selectedCountry: null
    });

    const [focusLocation, setFocusLocation] = useState<{ coordinates: [number, number], zoom: number } | null>(null);
    const [showTargetInfo, setShowTargetInfo] = useState(false);

    const startNewRound = useCallback((countryList: Country[] = countries) => {
        if (countryList.length === 0) return;
        const randomCountry = countryList[Math.floor(Math.random() * countryList.length)];
        setGameState(prev => ({
            ...prev,
            targetCountry: randomCountry,
            lastResult: null,
            selectedCountry: null
        }));
        setFocusLocation(null); // Reset zoom
        setShowTargetInfo(false);
    }, [countries]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await api.getAllCountries();
            setCountries(data);
            setLoading(false);
            startNewRound(data);
        };
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCountryClick = (geo: any) => {
        // Try to find the country in our data
        // geo.properties usually has ISO_A3 or similar
        const code = geo.properties.ISO_A3 || geo.properties.iso_a3;
        const id = geo.id; // Often numeric string or number

        const selected = countries.find(c =>
            c.code === code ||
            c.id === String(id).padStart(3, '0') ||
            c.id === String(id)
        );

        if (!selected) {
            console.warn("Country not found for code/id:", code, id);
            return;
        }

        // If round is over, just update selection for exploration
        if (gameState.lastResult !== null) {
            setGameState(prev => ({
                ...prev,
                selectedCountry: selected
            }));
            setShowTargetInfo(false);
            return;
        }

        const isCorrect = selected.code === gameState.targetCountry?.code;

        setGameState(prev => ({
            ...prev,
            selectedCountry: selected,
            lastResult: isCorrect ? 'win' : 'loss',
            score: {
                wins: prev.score.wins + (isCorrect ? 1 : 0),
                losses: prev.score.losses + (isCorrect ? 0 : 1)
            }
        }));

        setIsSidebarOpen(true);
    };

    const handleShowTarget = () => {
        if (gameState.targetCountry) {
            const area = gameState.targetCountry.area || 0;
            let zoomLevel = 4;

            if (area > 5000000) zoomLevel = 3;
            else if (area > 1000000) zoomLevel = 4;
            else if (area > 100000) zoomLevel = 5;
            else if (area > 10000) zoomLevel = 6;
            else if (area > 1000) zoomLevel = 8;
            else zoomLevel = 10;

            setFocusLocation({
                coordinates: gameState.targetCountry.latlng,
                zoom: zoomLevel
            });
            setShowTargetInfo(true);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)', color: '#fff' }}>
                Loading Global Data...
            </div>
        );
    }

    return (
        <div className="app-container">
            <div className="game-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 'bold', marginRight: '1rem' }}>
                    <Globe size={20} color="var(--accent)" />
                    Terra Cognita
                </div>

                <div style={{ position: 'relative' }}>
                    <select
                        className="projection-select"
                        value={projection}
                        onChange={(e) => setProjection(e.target.value as ProjectionType)}
                    >
                        <option value="geoMercator">Mercator</option>
                        <option value="geoOrthographic">Globe</option>
                        <option value="geoEqualEarth">Equal Earth</option>
                    </select>
                </div>
            </div>

            <div className="score-board">
                <div className="score-item">
                    <span className="score-label">Wins</span>
                    <span className="score-value wins">{gameState.score.wins}</span>
                </div>
                <div className="score-item">
                    <span className="score-label">Losses</span>
                    <span className="score-value losses">{gameState.score.losses}</span>
                </div>
            </div>

            <div className="map-container">
                <Map
                    projection={projection}
                    onCountryClick={handleCountryClick}
                    highlightedCountry={gameState.lastResult ? gameState.targetCountry : null}
                    focusLocation={focusLocation}
                />
            </div>

            <Sidebar
                gameState={gameState}
                onNextRound={() => startNewRound()}
                isSidebarOpen={isSidebarOpen}
                onShowTarget={handleShowTarget}
                showTargetInfo={showTargetInfo}
            />
        </div>
    );
}

export default App;
