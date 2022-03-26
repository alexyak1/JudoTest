

import React from "react";

export default function BeltSelector({ childToParent }) {

    const beltColor = '';

    return (
        <>
            <h2>Select belt: </h2>
            <div>
                <button onClick={() => childToParent('yellow')}>Yellow</button>
                <button onClick={() => childToParent('orange')}>Orange</button>
            </div>
        </>
    );
};
