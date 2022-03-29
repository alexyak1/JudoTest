import React, { useState, useEffect } from "react";

export default function Techniques() {
    const url = "http://localhost:8787/techniques";
    const [items, setItems] = useState([]);

    useEffect((setError) => {
        fetch(url)
            .then(res => {
                if (!res.ok) {
                    throw new Error(res.statusText)
                }
                res.json()
            })
            .then(
                (result) => {
                    setItems(result)
                }).catch(err => { console.log(err) })
    }, [])


    if (items.length == 0) {
        return (
            <div class="quiz">
                <h1>Something went wrong</h1>
                <p>Could not load judo techniques.
                    We have a problem with DataBase
                </p>
            </div>)
    } else {
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
                                    src={"https://lh3.googleusercontent.com/d/" + item.image_url.replaceAll('https://drive.google.com/file/d/', '').replaceAll('/view?usp=sharing', '') + "?authuser=0"}
                                    alt="technique"
                                />
                                <li style={{ marginLeft: '1em' }} key={item.id}>
                                    {item.name} belt: {item.belt}
                                </li>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
}
