

import React from "react";

export default function BeltSelector({ setBeltColor }) {

    return (
        <>
            <h2>Select belt: </h2>
            <div>
                <button onClick={() => setBeltColor('yellow')}>Yellow</button>
                <button onClick={() => setBeltColor('orange')}>Orange</button>
            </div>
        </>
    );
};
