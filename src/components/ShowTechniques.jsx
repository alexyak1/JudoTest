import React, { useState, useEffect } from 'react';

function ShowTechniques({belt}) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch("https://quiz-judo.herokuapp.com/techniques?belt="+belt)
            .then(res => res.json())
            .then(
                (result) => {
                    setItems(result)
                }
            )
    },[belt])

    return (
        <div>
            {items.length} techniques for {belt} belt

            {items.map(filteredItem => (
                    <div>
                        <p key={filteredItem.id}>
                            <h3>{filteredItem.name}</h3>
                        </p>
                        <img
                            className="img-technique"
                            src={require("../pages/judo_techniques/" + filteredItem.belt + "/" + filteredItem.name + ".gif").default}
                            alt="technique"
                        />
                    </div>
                ))}
            </div>
    );
}

export {ShowTechniques};