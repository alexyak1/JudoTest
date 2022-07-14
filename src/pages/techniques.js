import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { GrFormUp } from "react-icons/gr";
import { useMediaQuery } from 'react-responsive';

export default function Techniques() {
    const url = "https://quiz-judo.herokuapp.com/techniques";
    const [items, setItems] = useState([]);
    const [filterParam, setFilterColor] = useState('yellow');

    const options = [
        { value: 'yellow', label: 'yellow' },
        { value: 'orange', label: 'orange' },
        { value: 'green', label: 'green' },
        { value: 'blue', label: 'blue' },
        { value: 'brown', label: 'brown' },
    ]

    const colourStyles = {

        option: (provided, state) => ({
            // borderBottom: '1px dotted pink',
            backgroundColor: state.isSelected ? '#55555e' : '#f3f3f3',
            color: state.isSelected ? 'white' : '#222',
            padding: 15,
        }),
    };

    const applyFilter = (e) => {
        setFilterColor(e.value)
    }
    const isMobile = useMediaQuery({ query: `(max-width: 632px)` });

    useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    setItems(result)
                }
            )
    }, [])

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

                {items.filter(item => item.belt === filterParam).map(filteredItem => (
                    <div>
                        <p key={filteredItem.id}>
                            <h3>{filteredItem.name}</h3>
                            <p>belt: {filteredItem.belt}</p>
                        </p>
                        <img
                            className="img-technique"
                            src={require("./judo_techniques/" + filteredItem.belt + "/" + filteredItem.name + ".gif").default}
                            alt="technique"
                        />
                    </div>
                ))}
                <div
                    className="button-to-top"
                    onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    }}
                >

                    {isMobile ? <GrFormUp /> : <button className="button-to-top">Scroll to top</button>}
                </div>
            </div>
        </div>
    );
}
