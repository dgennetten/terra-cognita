import React, { useState, useEffect } from 'react';
import { Country, GameState } from '../types';
import { Globe, Users, Languages, BookOpen, Newspaper, Award, AlertTriangle, CheckCircle } from 'lucide-react';

interface SidebarProps {
    gameState: GameState;
    onNextRound: () => void;
    isSidebarOpen: boolean;
    onShowTarget?: () => void;
    showTargetInfo?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ gameState, onNextRound, isSidebarOpen, onShowTarget, showTargetInfo = false }) => {
    const { targetCountry, selectedCountry, lastResult } = gameState;
    const [isResizing, setIsResizing] = useState(false);
    const [sidebarHeight, setSidebarHeight] = useState(40); // percentage

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsResizing(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const windowHeight = window.innerHeight;
            const newHeight = ((windowHeight - e.clientY) / windowHeight) * 100;
            setSidebarHeight(Math.min(Math.max(newHeight, 20), 80));
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isResizing || !e.touches[0]) return;
            const windowHeight = window.innerHeight;
            const newHeight = ((windowHeight - e.touches[0].clientY) / windowHeight) * 100;
            setSidebarHeight(Math.min(Math.max(newHeight, 20), 80));
        };

        const handleEnd = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [isResizing]);

    if (!targetCountry) return <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}><div className="panel-header">Loading...</div></div>;

    const isGameActive = lastResult === null;
    const isWin = lastResult === 'win';
    const displayCountry = (isWin || showTargetInfo) ? targetCountry : (selectedCountry || targetCountry);

    return (
        <div
            className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}
            style={{ height: window.innerWidth <= 768 ? `${sidebarHeight}vh` : '100%' }}
        >
            <div
                className="resize-handle"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            />

            <div className="panel-header">
                {isGameActive ? (
                    <div>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Mission:</h2>
                        <h1 style={{ fontSize: '2rem', color: 'var(--accent)' }}>Where is {targetCountry.name}?</h1>
                        <p>Locate and click the correct country on the map.</p>
                    </div>
                ) : (
                    <div>
                        {isWin ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                                <CheckCircle size={24} />
                                <h2>Mission Accomplished</h2>
                            </div>
                        ) : (
                            <div className="fail-banner">
                                <AlertTriangle size={24} style={{ marginBottom: '0.5rem' }} />
                                <div>MISSION FAILED</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
                                    You selected {selectedCountry?.name || 'Unknown'} instead of {targetCountry.name}.
                                </div>
                            </div>
                        )}
                        <button className="control-btn" onClick={onNextRound} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', background: 'var(--accent)', color: '#fff' }}>
                            Next Mission
                        </button>

                        {!isWin && !showTargetInfo && (
                            <button
                                className="control-btn"
                                onClick={() => {
                                    if (onShowTarget) onShowTarget();
                                }}
                                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                            >
                                Show me {targetCountry.name}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {!isGameActive && displayCountry && (
                <div className="panel-content">
                    <img src={displayCountry.flags.svg} alt={`${displayCountry.name} flag`} className="country-flag" />

                    <div className="info-grid">
                        <div className="info-item">
                            <label>Country</label>
                            <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{displayCountry.name}</span>
                        </div>
                        <div className="info-item">
                            <label>Capital</label>
                            <span>{displayCountry.capital.join(', ')}</span>
                        </div>
                        <div className="info-item">
                            <label>Population</label>
                            <span>{displayCountry.population.toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Languages size={18} color="var(--accent)" /> Languages
                        </h3>
                        <div>
                            {Object.values(displayCountry.languages).slice(0, 3).map(lang => (
                                <span key={lang} className="badge">{lang}</span>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={18} color="var(--accent)" /> Religions
                        </h3>
                        <div>
                            {displayCountry.religions?.map(rel => (
                                <span key={rel} className="badge">{rel}</span>
                            ))}
                        </div>
                    </div>

                    {(isWin || showTargetInfo) && (
                        <>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Award size={18} color="var(--accent)" /> Contributions
                                </h3>
                                <ul style={{ listStyle: 'none', paddingLeft: '0.5rem' }}>
                                    {displayCountry.contributions?.map((c, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            <span style={{ color: 'var(--accent)' }}>•</span> {c}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Newspaper size={18} color="var(--accent)" /> Current Events
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {displayCountry.currentEvents?.map((news, i) => (
                                        <a key={i} href={news.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                {news.imageUrl && <img src={news.imageUrl} alt="news" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />}
                                                <div style={{ padding: '0.75rem' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{news.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{news.source}</div>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
