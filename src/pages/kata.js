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
        <title>Judo quiz | Kata</title>
            <div>
                
                {kata_series.map(kata_serie => (
                    <div>
                        <h2>{kata_serie}</h2>
                        <hr
                            style={{
                            background: "black",
                            height: "1px",
                            width: "40%",
                            border: "none",
                            }}
                        />
                        <ShowKataTechniques kataType={kata_serie} />
                    </div>
                ))}

                <ToTop></ToTop>
            </div>
        </div>
    );
}
