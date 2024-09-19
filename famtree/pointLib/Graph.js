import React, { useEffect, useRef } from 'react';
import Point from "./Point";

const Graph = ({ x, y }) => {
    const svgRef = useRef();

    useEffect(() => {
        new Point()
            .nodeY()
            .nodeX(30, 0, true)
            .nodeY(20, 2, true)
            .nodeX(-30, -60)
            .nodeY(50, 0, true)
            .createNodeY(50, 5)
            .createNodeY(-50, 5, true)
            .lineY()
            .createArrowY(30, 0.3)
            .show(svgRef.current);
    }, []);

    return <svg ref={svgRef} margin-top={y} margin-left={x} position={"absolute"} width={500} height={500} />;
};

export default Graph;
