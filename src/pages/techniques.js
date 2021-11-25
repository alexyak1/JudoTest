import React, { useState, useEffect } from "react";

export default function Techniques() {
    const url = "http://localhost:8787/techniques";
    const [setError] = useState(null);
    const [items, setItems] = useState([]);

        useEffect(() => {
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
                    <h1>Here is all techniques:</h1>
                    <ul>
                        {items.map(item => (
                            <div style={
                                {
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '50vh',
                                }
                            } >
                                <img
                                    src={"https://lh3.googleusercontent.com/d/" + item.image_url.replaceAll('https://drive.google.com/file/d/','').replaceAll('/view?usp=sharing','') + "?authuser=0"}
                                    alt="technique"
                                />
                                <li style={{marginLeft: '1em'}} key={item.id}>
                                    {item.name} belt: {item.belt}
                                </li>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        );
}
