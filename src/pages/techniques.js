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

    return (
        <div className='app'>
            <div>
                <h2>Here is all techniques:</h2>
                <div className="filter-select">
                    <p>Select belt color</p>
                    <Select
                        defaultValue={options[0]}
                        onChange={applyFilter}
                        options={options}
                        styles={colourStyles} />
                </div>
                <ShowTechniques belt={filterParam} />
                <ToTop></ToTop>
            </div>
        </div>
    );
}
