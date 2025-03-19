import React, { useState } from "react";
import Select from 'react-select';
import { ShowTechniques } from "../components/ShowTechniques";
import { ToTop } from "../components/NavigationComponents/toTop";

export default function Techniques() {
    const [filterParam, setFilterColor] = useState('yellow');

    const options = [
        { value: 'yellow', label: 'yellow' },
        { value: 'orange', label: 'orange' },
        { value: 'green', label: 'green' },
        { value: 'blue', label: 'blue' },
        { value: 'brown', label: 'brown' },
    ];

    const colourStyles = {
        option: (state) => ({
            backgroundColor: state.isSelected ? '#55555e' : '#f3f3f3',
            color: state.isSelected ? 'white' : '#222',
            padding: 15,
        }),
        control: (base) => ({
            ...base,
            width: '100%',
            minHeight: '36px',
            padding: '5px 10px',
        }),
    };

    const applyFilter = (e) => {
        setFilterColor(e.value);
    };

    return (
        <div className='app'>
            <title>Judo quiz | Techniques</title>
            <div>
                <h2>Here are all techniques:</h2>
                <div className="filter-select">
                    <label htmlFor="belt-select" className="sr-only">Select belt color</label>
                    <Select
                        id="belt-select"
                        value={options.find(option => option.value === filterParam)}  // Ensures the selected value is reflected
                        onChange={applyFilter}
                        options={options}
                        styles={colourStyles}
                        aria-labelledby="belt-select"
                    />
                </div>
                <ShowTechniques belt={filterParam} />
                <ToTop />
            </div>
        </div>
    );
}
