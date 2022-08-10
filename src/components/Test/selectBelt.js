

import React from "react";

export default function BeltSelector({ setBeltColor }) {

    return (
        <>
            <h4>Select belt: </h4>
            <div>
                <button onClick={() => setBeltColor('yellow')}>Yellow</button>
                <button onClick={() => setBeltColor('orange')}>Orange</button>
                <button onClick={() => setBeltColor('green')}>Green</button>
                <button onClick={() => setBeltColor('blue')}>Blue</button>
                <button onClick={() => setBeltColor('brown')}>Brown</button>
            </div>
        </>
    );
};
