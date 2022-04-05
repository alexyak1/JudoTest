import React, { useState, useEffect } from "react";

export default function Techniques() {
    const url = "https://quiz-judo.herokuapp.com/techniques";
    const [items, setItems] = useState([]);

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
                {items.map(item => (
                    <div>
                        <p key={item.id}>
                            <h3>{item.name}</h3>
                            <p>belt: {item.belt}</p>
                        </p>
                        <img
                            src={"https://lh3.googleusercontent.com/d/" + item.image_url.replaceAll('https://drive.google.com/file/d/', '').replaceAll('/view?usp=sharing', '') + "?authuser=0"}
                            alt="technique"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
