import React, { useState, useEffect } from "react";
import Select from 'react-select';

export default function Techniques() {
    const url = "https://quiz-judo.herokuapp.com/techniques";
    const [items, setItems] = useState([]);
    const [filterParam, setFilterColor] = useState(['yellow']);

    const options = [
        { value: 'yellow', label: 'yellow' },
        { value: 'orange', label: 'orange' },
        { value: 'green', label: 'green' }
    ]

    const applyFilter = (e) => {
        setFilterColor(e.value)
    }

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
                <div><p>Select belt color</p>
                    <div className="abc">
                        <Select
                            defaultValue={options[0]}
                            onChange={applyFilter}
                            options={options} />
                    </div>
                </div>

                {items.filter(item => item.belt == filterParam).map(filteredItem => (
                    <div>
                        <p key={filteredItem.id}>
                            <h3>{filteredItem.name}</h3>
                            <p>belt: {filteredItem.belt}</p>
                        </p>
                        <img
                            src={"https://lh3.googleusercontent.com/d/" + filteredItem.image_url.replaceAll('https://drive.google.com/file/d/', '').replaceAll('/view?usp=sharing', '') + "?authuser=0"}
                            alt="technique"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
