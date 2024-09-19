import * as d3 from 'd3';

class Point {
    constructor(x = 50, y = 0, animate = 3000, predPoint = undefined) {
        this.x = x;
        this.y = y;
        this.animate = animate;
        this.nextPoint = undefined;
        this.predPoint = predPoint;
        if (predPoint)
            predPoint.nextPoint = this;
    }

    inverseXY(from = this, to = this) {
        while (from !== to && from !== undefined) {
            let x = from.x;
            from.x = from.y;
            from.y = x;

            from = from.nextPoint;
        }
        if (from !== undefined) {
            let x = from.x;
            from.x = from.y;
            from.y = x;
        }

        return to;
    }

    createLineXY_Absolute(x = 50, y = 50, animate = 3000) {
        return new Point(x, y, animate, this);
    }

    createLineXY(x = 50, y = 50) {
        return this.createLineXY_Absolute(this.x + x, this.y + y);
    }

    createLineX(i = 50) {
        return this.createLineXY(i, 0);
    }

    createLineY(i = 50) {
        return this.createLineXY(0, i);
    }

    lineX(i = 50) {
        return this.createLineXY(i, 0);
    }

    lineY(i = 50) {
        return this.createLineXY(0, i);
    }

    createNodeX(i = 50, outy = 0, usey = false, inverse = false) {
        if (i < 0) {
            outy = 2 * i - outy;
            i = -i;
        }
        if (usey === true) {
            var x = this.y;
            var y = this.x;
        } else {
            x = this.x;
            y = this.y;
        }
        if (inverse)
            this.createLineXY_Absolute(x - i / 2, y + (i + outy) / 2)
                .createLineXY_Absolute(x, y + i + outy)
                .createLineXY_Absolute(x + i / 2, y + (i + outy) / 2)
                .createLineXY_Absolute(x, y);
        else
            this.createLineXY_Absolute(x + i / 2, y + (i + outy) / 2)
                .createLineXY_Absolute(x, y + i + outy)
                .createLineXY_Absolute(x - i / 2, y + (i + outy) / 2)
                .createLineXY_Absolute(x, y);
        return this.upToDate();
    }

    createNodeY(i = 50, outx = 0) {
        let node = this.createNodeX(i, outx, true);
        return this.inverseXY(this.nextPoint, node);
    }

    createNoizeX(i = 50, maxNoize = 1, step = 2, rnd = true) {
        let iImp = i;
        let rand = rnd ? Math.random() : 1;
        let node = this.createLineXY(step, -rand * maxNoize * 2)
            .createLineXY(step, 0)
            .createLineXY(step, rand * maxNoize * 2)
            .createLineXY(step, 0)
            .createLineXY(step, rand * maxNoize)
            .createLineXY(step, 0)
            .createLineXY(step, -rand * maxNoize)
            .createLineXY(step, 0);
        i -= step * 8;
        while (i - step * 8 > 0) {
            let rand = rnd ? Math.random() : 1;
            node = node
                .createLineXY(step, -rand * maxNoize * 2)
                .createLineXY(step, 0)
                .createLineXY(step, rand * maxNoize * 2)
                .createLineXY(step, 0)
                .createLineXY(step, rand * maxNoize)
                .createLineXY(step, 0)
                .createLineXY(step, -rand * maxNoize)
                .createLineXY(step, 0);
            i -= step * 8;
        }
        return node.createLineXY_Absolute(this.x + iImp, this.y);
    }

    createNoizeY(i = 50, maxNoize = 1, step = 2, rnd = true) {
        let iImp = i;
        let rand = rnd ? Math.random() : 1;
        let node = this.createLineXY(-rand * maxNoize * 2, step)
            .createLineXY(0, step)
            .createLineXY(rand * maxNoize * 2, step)
            .createLineXY(0, step)
            .createLineXY(rand * maxNoize, step)
            .createLineXY(0, step)
            .createLineXY(-rand * maxNoize, step)
            .createLineXY(0, step);
        i -= step * 8;
        while (i - step * 8 > 0) {
            let rand = rnd ? Math.random() : 1;
            node = node
                .createLineXY(-rand * maxNoize * 2, step)
                .createLineXY(0, step)
                .createLineXY(rand * maxNoize * 2, step)
                .createLineXY(0, step)
                .createLineXY(rand * maxNoize, step)
                .createLineXY(0, step)
                .createLineXY(-rand * maxNoize, step)
                .createLineXY(0, step);

            i -= step * 8;
        }
        return node.createLineXY_Absolute(this.x, this.y + iImp);
    }

    createArrowX(x = 20, ang = 0.5) {
        this.createLineXY(-x, x * ang)
            .createLineXY(x / 2, -x * ang)
            .createLineXY(-x / 2, -x * ang)
            .createLineXY(x, x * ang)
            .createLineXY(-x / 2, (x * ang) / 2);
        return this.upToDate();
    }

    createArrowY(y = 20, ang = 0.5) {
        this.createLineXY(y * ang, -y)
            .createLineXY(-y * ang, y / 2)
            .createLineXY(-y * ang, -y / 2)
            .createLineXY(y * ang, y)
            .createLineXY((y * ang) / 2, -y / 2);
        return this.upToDate();
    }

    nodeX(i = 50, outy = 0, inverse = false) {
        if (i < 0)
            return this.createLineX(i)
                .createNodeX(i, outy, false, true)
                .createLineX(i);
        if (inverse)
            return this.createLineX(i).createNodeX(-i, outy).createLineX(i);
        return this.createLineX(i).createNodeX(i, outy).createLineX(i);
    }

    nodeY(i = 50, outx = 0, inverse = false) {
        if (i < 0)
            return this.createLineY(i)
                .createNodeY(i, outx, false, true)
                .createLineY(i);
        if (inverse)
            return this.createLineY(i).createNodeY(-i, outx).createLineY(i);
        return this.createLineY(i).createNodeY(i, outx).createLineY(i);
    }

    arrowX() {
        return this.lineX(20).nodeX(20, -4).lineX().createArrowX(30);
    }

    getCurve() {
        let res = [];
        let pp = this;
        while (pp !== undefined) {
            res.push({ x: pp.x, y: pp.y });
            pp = pp.nextPoint;
        }
        return res;
    }

    upToDate() {
        let pp = this;
        while (pp.nextPoint !== undefined) pp = pp.nextPoint;
        return pp;
    }

    downToDate() {
        let pp = this;
        while (pp.predPoint !== undefined) pp = pp.predPoint;
        return pp;
    }

    getCurveRev() {
        return this.downToDate().getCurve();
    }

    getLine() {
        return d3
            .line()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(d3.curveBasis);
    }

    newAnimate(animate = 3000) {
        let pp = this.downToDate();
        while (pp !== undefined) {
            pp.animate = animate;
            pp = pp.nextPoint;
        }
        return this;
    }

    show(elem, name = "path", fill = "none", stroke = "blue", strokeWidth = 2) {
        const path = d3.select(elem)
            .append("path")
            .datum(this.getCurveRev())
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("d", this.getLine());

        const totalLength = path.node().getTotalLength();

        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(this.animate)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        return this;
    }

}

export default Point;