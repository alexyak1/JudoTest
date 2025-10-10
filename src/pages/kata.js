import React, { useState, useEffect, useCallback } from "react";
import Select from 'react-select';
import { ShowKataTechniques } from "../components/ShowKataTechniques";
import { ToTop } from "../components/NavigationComponents/toTop";
import { useAllKataCache } from "../hooks/useGlobalCache";

export default function Kata() {
    const [filterParam, setFilterColor] = useState('nage-no-kata');

    const options = [
        { value: 'nage-no-kata', label: 'nage-no-kata' },
    ]

    const colourStyles = {
        option: (state) => ({
            backgroundColor: state.isSelected ? '#55555e' : '#f3f3f3',
            color: state.isSelected ? 'white' : '#222',
            padding: 15,
        }),
    };

    const applyFilter = useCallback((e) => {
        setFilterColor(e.value)
    }, []);

    const kata_series = [
        "Te-waza", "Koshi-waza", "Ashi-Waza", "Masutemi-Waza", "Yoko-stemi-Waza"
    ];

    // Use global cache for all kata data
    const { data: allKataData, loadingStates, error } = useAllKataCache(kata_series);

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
                        {loadingStates[kata_serie] ? (
                            <div className="loading-placeholder">
                                Loading {kata_serie} techniques...
                            </div>
                        ) : (
                            <ShowKataTechniques 
                                kataType={kata_serie} 
                                preloadedData={allKataData[kata_serie]}
                            />
                        )}
                    </div>
                ))}

                <ToTop></ToTop>
            </div>
        </div>
    );
}
