import React, { useState, useEffect } from 'react';

function ShowKataTechniques({kataType}) {
    const [items, setItems] = useState([]);
    useEffect(() => {
        fetch("http://35.228.96.180:8787/kata?type="+kataType)
            .then(res => res.json())
            .then(
                (result) => {
                    setItems(result)
                }
            )
    },[kataType])

    return (
        <div>
            {items.length} techniques for {kataType}

            {items.map(filteredItem => (
                    <div key={filteredItem.id}>
                        <h3>{filteredItem.name}</h3>
                        <img
                            className="img-technique"
                            src={require("../pages/kata_techniques/" + filteredItem.kata_name + "/" + filteredItem.name + ".gif")}
                            alt="technique"
                        />
                    </div>
                ))}
            </div>
    );
}

export {ShowKataTechniques};