

import React from "react";

export default function BeltSelector(props) {
    const handleChange = (color) => {
        props.onchange({
            "color": color,
            "selectBelt":false,
        });
    }

    return (
        <>
           <h2>Select belt: </h2>
           <div>
               <button on onClick={() => handleChange("yellow")}>Yellow</button>
               <button on onClick={() => handleChange("orange")}>Orange</button>
            </div>
        </>
    );
};
