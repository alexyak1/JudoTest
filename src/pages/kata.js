import React, { useState } from "react";
import Select from 'react-select';
import { ShowKataTechniques } from "../components/ShowKataTechniques";
import { ToTop } from "../components/NavigationComponents/toTop";

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

    const applyFilter = (e) => {
        setFilterColor(e.value)
    }

    var kata_series = [
        "Te-waza", "Koshi-waza", "Ashi-Waza", "Masutemi-Waza", "Yoko-stemi-Waza"
    ]

    return (
        <div className='app'>
            <div>
                <h2>Techniques for {filterParam}:</h2>
                <div className="filter-select">
                    <p>Select Kata</p>
                    <Select
                        defaultValue={options[0]}
                        onChange={applyFilter}
                        options={options}
                        styles={colourStyles} />
                </div>
                
                {kata_series.map(kata_serie => (
                    <div>
                        <h2>{kata_serie}</h2>
                        <ShowKataTechniques kataType={kata_serie} />
                    </div>
                ))}

                <ToTop></ToTop>
            </div>
        </div>
    );
}
