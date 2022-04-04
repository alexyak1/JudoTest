import React, { useState, useEffect } from "react";

export default function Techniques() {
    const url = "http://localhost:8787/techniques";
    const [items, setItems] = useState([]);

    useEffect((setError) => {
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    setItems(result)
                },
                (error) => {
                    setError(error);
                }
            )
    }, [])


    return (
        <div className='app'>
            <div>
                <h2>Here is all techniques:</h2>
                <ul>
                    {items.map(item => (
                        <div>
                            <li style={{ marginLeft: '1em' }} key={item.id}>
                                <h5>{item.name} belt: {item.belt}</h5>
                            </li>
                            <img
                                src={"https://lh3.googleusercontent.com/d/" + item.image_url.replaceAll('https://drive.google.com/file/d/', '').replaceAll('/view?usp=sharing', '') + "?authuser=0"}
                                alt="technique"
                            />
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    );
}
