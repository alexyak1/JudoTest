import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { GrFormUp } from "react-icons/gr";



function ToTop({belt}) {

    const isMobile = useMediaQuery({ query: `(max-width: 632px)` });


    return (
        <div
        className="button-to-top"
        onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }}>

        {isMobile ? <GrFormUp /> : <button className="button-to-top">Scroll to top</button>}
    </div>
    );
}

export {ToTop};