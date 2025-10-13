import React, { useMemo } from "react";
import { ShowKataTechniques } from "../components/ShowKataTechniques";
import { ToTop } from "../components/NavigationComponents/toTop";
import { useAllKataCache } from "../hooks/useGlobalCache";

export default function Kata() {
    const kata_series = [
        "Te-waza", "Koshi-waza", "Ashi-Waza", "Masutemi-Waza", "Yoko-stemi-Waza"
    ];

    // Use global cache for all kata data
    const { data: allKataData, loadingStates } = useAllKataCache(kata_series);

    // Memoize loading state to prevent unnecessary re-renders
    const isLoading = useMemo(() => {
        return Object.values(loadingStates).some(loading => loading);
    }, [loadingStates]);

    // Show single loading state for better UX
    if (isLoading && Object.keys(allKataData).length === 0) {
        return (
            <div className='app'>
                <title>Judo quiz | Kata</title>
                <div className="loading-placeholder" style={{ padding: '40px', textAlign: 'center' }}>
                    Loading kata techniques...
                </div>
                <ToTop></ToTop>
            </div>
        );
    }

    return (
        <div className='app'>
        <title>Judo quiz | Kata</title>
            <div>
                
                {kata_series.map(kata_serie => (
                    <div key={kata_serie}>
                        <h2>{kata_serie}</h2>
                        <hr
                            style={{
                            background: "black",
                            height: "1px",
                            width: "40%",
                            border: "none",
                            }}
                        />
                        <ShowKataTechniques 
                            kataType={kata_serie} 
                            preloadedData={allKataData[kata_serie]}
                        />
                    </div>
                ))}

                <ToTop></ToTop>
            </div>
        </div>
    );
}
