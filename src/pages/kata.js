import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { ShowKataTechniques } from "../components/ShowKataTechniques";
import { ToTop } from "../components/NavigationComponents/toTop";

export default function Kata() {
    const [filterParam, setFilterColor] = useState('nage-no-kata');
    const [loadingStates, setLoadingStates] = useState({});
    const [allKataData, setAllKataData] = useState({});

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

    const applyFilter = (e) => {
        setFilterColor(e.value)
    }

    const kata_series = [
        "Te-waza", "Koshi-waza", "Ashi-Waza", "Masutemi-Waza", "Yoko-stemi-Waza"
    ];

    // Preload all kata data efficiently
    useEffect(() => {
        const host = window.location.hostname;
        const baseUrl = `http://${host}:8787`;
        
        // Initialize loading states
        const initialLoadingStates = {};
        kata_series.forEach(series => {
            initialLoadingStates[series] = true;
        });
        setLoadingStates(initialLoadingStates);

        // Load data for each series with staggered timing to avoid overwhelming the server
        kata_series.forEach((series, index) => {
            setTimeout(() => {
                fetch(`${baseUrl}/kata?type=${series}`)
                    .then(res => res.json())
                    .then(result => {
                        setAllKataData(prev => ({
                            ...prev,
                            [series]: result
                        }));
                        setLoadingStates(prev => ({
                            ...prev,
                            [series]: false
                        }));
                    })
                    .catch(error => {
                        console.error(`Error fetching ${series}:`, error);
                        setLoadingStates(prev => ({
                            ...prev,
                            [series]: false
                        }));
                    });
            }, index * 200); // Stagger requests by 200ms
        });
    }, []);

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
