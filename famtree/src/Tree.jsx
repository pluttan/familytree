import * as d3 from 'd3';
import $ from 'jquery';
import React, { Component } from 'react';
import './Tree.scss';
import data from './Data';

class Tree extends Component {
    constructor(props) {
        super();

        this.idsvg = props.id;
        this.setMainState = props.setMainState;
        this.mainState = props.mainState;

        this.zoom = this.zoom.bind(this);
        this.toggleChildren = this.toggleChildren.bind(this);
        this.click = this.click.bind(this);
        this.update = this.update.bind(this);
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    init() {

        this.totalNodes = 0;
        this.maxLabelLength = 0;

        this.panSpeed = 100;
        this.panBoundary = 20;

        this.i = 0;
        this.duration = 750;

        this.tree = d3.layout.tree()
            .separation((a, b) => (a.parent === b.parent ? 100 : 130));

        this.diagonal = d3.svg.diagonal()
            .projection((d) => {
                return [d.y, d.x];
            });



        this.translateY = 0;
        this.translateX = 0;

        this.visit(this.props.mainState.json, (d, tr) => {
            this.totalNodes += 1;
            this.maxLabelLength = Math.max(d.name.length, this.maxLabelLength);

        }, (d) => {
            return d.children;
        });


        this.zoomListener = d3.behavior.zoom();
        this.zoomListener.scaleExtent([0.1, 3]);
        this.zoomListener.on("zoom", this.zoom);

        this.viewerWidth = $(document).width();
        this.viewerHeight = $(document).height();
        this.baseSvg = d3.select(`#${this.idsvg}`).append("svg")
            .attr("width", this.viewerWidth)
            .attr("height", this.viewerHeight)
            .attr("class", "overlay")
            .call(this.zoomListener)
            .on("dblclick.zoom", null);
        this.svgGroup = this.baseSvg.append("g");
        this.dragListener = d3.behavior.drag();
        this.update(this.props.mainState.json);
        this.centerNode(this.props.mainState.json);

        this.overCircle = (d) => {
            this.selectedNode = d;
            this.updateTempConnector();
        };
        this.outCircle = (d) => {
            this.selectedNode = null;
            this.updateTempConnector();
        };

        this.baseSvg.append('defs')

            .append("pattern")
            .attr("id", "img1")
            .attr("patternUnits", "objectBoundingBox")
            .attr("width", "25")
            .attr("height", "25")

            .append("image")
            .attr("xlink:href", "https://mir-s3-cdn-cf.behance.net/project_modules/2800_opt_1/56d79925736477.56349f4bef09d.jpg")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 40)
            .attr("height", 40)

            .append("filter")
            .attr("id", "blur-filter")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", "100%")
            .attr("height", "100%")
            .append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 0.3)

            .append("mask")
            .attr("id", "square-mask")
            .append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white")
            .style("object-fit", "contain")

            .append("pattern")
            .attr("id", "img-pattern")
            .attr("patternUnits", "objectBoundingBox")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("image")
            .attr("xlink:href", "https://yt3.googleusercontent.com/2yYF_H9D3yUTCQ-NuTFz_n8QDbiqdRlPO8xr4-9-BsfML6CHiKvODrMXIezxTZ910oBMcncJ=s900-c-k-c0x00ffffff-no-rj")
            .attr("width", "1")
            .attr("height", "1");
        return this;
    }

    toParentExec(obj) {
        if (obj.parent) {
            return this.toParentExec(obj.parent);
        }
        return obj;
    }

    findNodeAndExecute(obj, targetId, callback, pnode) {
        if (obj.id === targetId) {
            callback(obj);
            return pnode;
        }
        if (obj.children && obj.children.length > 0) {
            for (const child of obj.children) {
                const foundNode = this.findNodeAndExecute(child, targetId, callback, pnode);
                if (foundNode) {
                    return pnode;
                }
            }
        }
        return null;
    }

    findNode(obj, targetId) {
        if (obj.id === targetId) {
            return obj;
        }
        if (obj.children && obj.children.length > 0) {
            for (const child of obj.children) {
                const foundNode = this.findNode(child, targetId);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    }

    visit(parent, visitFn, childrenFn) {
        if (parent === undefined) return;
        visitFn(parent);
        parent.children = childrenFn(parent);

        if (parent.children) {
            for (let i = 0; i < parent.children.length; i++) {
                this.visit(parent.children[i], visitFn, childrenFn);
            }
        }
    }

    sortTree() {
        this.tree.sort((a, b) => {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }

    zoom() {
        this.svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(this.collapse);
            d.children = null;
        }
    }

    expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(this.expand);
            d._children = null;
        }
    }

    updateTempConnector() {
        this.data = [];
        if (this.draggingNode !== null && this.selectedNode !== null) {
            this.data = [{
                source: {
                    x: this.selectedNode.y0,
                    y: this.selectedNode.x0
                },
                target: {
                    x: this.draggingNode.y0,
                    y: this.draggingNode.x0
                }
            }];
        }
        this.link = this.svgGroup.selectAll(".templink").data(this.data);

        this.link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        this.link.attr("d", d3.svg.diagonal());

        this.link.exit().remove();
    };

    async centerNode(source) {

        let scale = this.zoomListener.scale();
        if (scale < 1.3) scale = 1.3;
        this.translateY = -source.x0 * scale + $('body').height() / 2 - 100;
        this.translateX = -source.y0 * scale + this.viewerWidth / 2;
        this.svgGroup.transition()
            .duration(this.duration).attr("transform", "translate(" + this.translateX + "," + this.translateY + ")scale(" + scale + ")");
        this.zoomListener.scale(scale);
        this.zoomListener.translate([this.translateX, this.translateY]);


        await this.props.setMainState({
            ...this.props.mainState,
            cardCheckedId: source.id,
            dataCheckedUser: false
        });

        await data.getUserById(this.props.mainState, this.props.setMainState);

        d3.selectAll('.allrect').attr("stroke", "none");
        d3.selectAll("#allrect" + this.props.mainState.cardCheckedId)
            .attr("stroke", this.props.mainState.user.acientcolor);
    }

    async click(d) {
        if (this.props.mainState.inst === "arrowinst") {
            if (d3.event.defaultPrevented) return;
            await this.centerNode(d);
            this.update(d);
        }
        if (this.props.mainState.inst === "toggleinst") {
            if (d3.event.defaultPrevented) return;
            await this.toggleChildren(d);
            this.update(d);
            await this.centerNode(d);
        }
        if (this.props.mainState.inst === "deleteinst") {
            await this.deleteNode(d);
        }
        if (this.props.mainState.inst === 'addinst') {
            await this.addNode(d);
        }
    }

    async toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
            this.collapse(d);
            d3.selectAll("#allrect" + d.id).style("fill", "rgba(47, 55, 70, 0.85)");

        } else if (d._children) {
            d.children = d._children;
            d._children = null;
            this.expand(d);
            d3.selectAll("#allrect" + d.id).style("fill", "rgba(17, 25, 40, 0.75)");
        }
        data.saveJsonFamilyById(this.props.mainState, this.props.setMainState);
        return d;
    }

    async addNode(d) {
        let newNode = {
            id: parseInt((await data.getNodeId()).data[0].min),
            name: ''
        }

        data.insertPersonById(newNode.id, this.props.mainState, this.props.setMainState);

        if (d.children) {
            d.children.push(newNode);
        } else {
            d.children = [newNode];
        }

        await this.props.setMainState({
            ...this.props.mainState,
            cardCheckedId: newNode.id,
            dataCheckedUser: false,
            json: this.toParentExec(d)
        });

        data.saveJsonFamilyById(this.props.mainState, this.props.setMainState);
        await data.getUserById(this.props.mainState, this.props.setMainState);

        this.centerNode(d);
        this.update(newNode);

        return this.toParentExec(d);
    }

    async deleteNode(d) {
        if (d.parent) {
            let parent = d.parent;
            let json = this.props.mainState.json;

            let out = this.findNodeAndExecute(json, parent.id, (parentNode) => {
                parentNode.children = parentNode.children.filter(child => child.id !== d.id);
            }, json);

            const allChildrenIds = (() => {
                const flattenChildrenIds = (person, idsArray) => {
                    idsArray.push(person.id)
                    if (person.children && person.children.length > 0) {
                        person.children.forEach(
                            child => {
                                flattenChildrenIds(child, idsArray);
                            });
                    }
                };
                const result = [];
                flattenChildrenIds(d, result);
                return result;
            })();
            data.deletePersonsById(allChildrenIds, this.props.mainState, this.props.setMainState);
            this.props.setMainState({
                ...this.props.mainState,
                json: json
            });
            data.saveJsonFamilyById(this.props.mainState, this.props.setMainState);

            this.centerNode(parent);
            this.update(parent);
        }
    }

    childCount(level, n) {
        if (n.children && n.children.length > 0) {
            if (this.levelWidth.length <= level + 1) this.levelWidth.push(0);

            this.levelWidth[level + 1] += n.children.length;
            for (let i = 0; i < n.children.length; i++) {
                this.childCount(level + 1, n.children[i]);
            }
        }
    };

    update(source) {
        this.levelWidth = [1];

        this.childCount(0, this.props.mainState.json);
        this.newHeight = d3.max(this.levelWidth) * 140;
        this.tree = this.tree.size([this.newHeight, this.viewerWidth]);
        this.baseSvg.attr("height", this.newHeight);

        this.nodes = this.tree.nodes(this.props.mainState.json).reverse();
        this.links = this.tree.links(this.nodes);

        this.nodes.forEach((d) => {
            d.y = (d.depth * 300);
        });

        this.node = this.svgGroup.selectAll("g.node")
            .data(this.nodes, (d) => {
                return d.id || (d.id = ++this.i);
            });
        this.node.exit().remove();

        this.nodeEnter = this.node.enter().append("g")
            .call(this.dragListener)
            .attr("class", "node")
            .attr("id", (d) => {
                return "node-id" + d.id;
            })
            .attr("transform", (d) => {
                return "translate(" + source.y + "," + source.x + ")";
            });


        this.nodeEnter.append("rect")
            .attr("class", "allrect")
            .attr("id", (d) => {
                return "allrect" + d.id;
            })
            .attr("rx", "0.5em")
            .attr("ry", "0.5em")
            .attr("x", "-2.8em")
            .attr("y", "-2.5em")
            .style("filter", "url(#blur-filter)");

        this.nodeEnter.on('click', this.click);


        this.nodeEnter.append('image')
            .attr("x", "-1.4em")
            .attr("y", "-2em")
            .attr('class', 'nodeCircle')
            .attr("width", "2.8em")
            .attr("height", "2.8em");

        this.nodeEnter.append("text")
            .attr("text-id", (d) => {
                return "text" + d.id;
            })
            .attr("x", "-0.25em")
            .attr("y", "2em")
            .attr("dy", ".1em")
            .attr("stroke", "0")
            .attr('class', 'nodeText')
            .style("fill-opacity", 0)
            .attr("text-anchor", "middle");

        this.nodeEnter.append("rect")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.1)
            .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", (node) => {
                this.overCircle(node);
            })
            .on("mouseout", (node) => {
                this.outCircle(node);
            });

        this.nodeUpdate = this.node.transition()
            .duration(this.duration)
            .attr("transform", (d) => {
                return "translate(" + d.y + "," + d.x + ")";
            });

        this.nodeUpdate.select("text")
            .style("fill-opacity", 1)
            .text((d) => {
                return (d.name.length > 8) ? d.name.slice(0, 7) + '…' : d.name;
            });

        this.nodeExit = this.node.exit().transition()
            .duration(this.duration)
            .attr("transform", (d) => {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        this.nodeExit.select("text")
            .style("fill-opacity", 0);

        this.link = this.svgGroup.selectAll("path.link")
            .data(this.links, (d) => {
                return d.target.id;
            });

        this.link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", (d) => {
                this.o = {
                    x: source.x,
                    y: source.y
                };
                return this.diagonal({
                    source: this.o,
                    target: this.o
                });
            });

        this.link.transition()
            .duration(this.duration)
            .attr("d", this.diagonal);

        this.link.exit().transition()
            .duration(this.duration)
            .attr("d", (d) => {
                this.o = {
                    x: source.x,
                    y: source.y
                };
                return this.diagonal({
                    source: this.o,
                    target: this.o
                });
            })
            .remove();

        this.nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        d3.selectAll("path.link").style("stroke", (d) => {
            return d.target.nodecolor ? d.target.nodecolor : d.source.nodecolor ? d.source.nodecolor : "#bc98ff"
        });

        d3.selectAll('.allrect').style("fill", (d) => {
            return d.cardcolor ? d.cardcolor :
                (d._children ?
                    "rgba(47, 55, 70)" : "rgba(17, 25, 40)"
                )
        }).style("opacity", 0.75)

        d3.selectAll(".nodeCircle").attr("href", (d) => {
            return d.img ? data.proxy + '/' + d.img :
                "https://sun9-61.userapi.com/impg/Nmr-zXlvQJVdOKwba4I6UUA8AU5vzMI7nLU4YA/rdJcKatS0hQ.jpg?size=807x807&quality=95&sign=45cae21d20fb3e245efa79f71e32ee43&c_uniq_tag=Alh9UH5Tbf6vZsIs_y2UOIuDoAvbMLPV9gQm60sLjGg&type=album"
        });

    }

    componentDidCatch(error, errorInfo) {
        console.error('Ошибка в компоненте Tree:', error, errorInfo);
        this.setState({ hasError: true });
    }

    componentDidMount() {
        if (!this.props.mainState.json)
            data.getJson(this.props.mainState.selectedFamilyId, this.props.mainState, this.props.setMainState);
        if (this.props.mainState.json) {
            this.props.setMainState({
                ...this.props.mainState,
                treeNeedUpdate: false,
                json: {
                    ...this.props.mainState.json,
                    x0: 0,
                    y0: -this.viewerHeight
                }
            })
            this.mounted = true;
            this.init();
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.mainState !== prevProps.mainState && this.mounted === undefined) {
            this.componentDidMount();
        }
        if (this.props.mainState.treeNeedUpdate) {
            d3.selectAll('.allrect').attr("stroke", "none");
            d3.selectAll("#allrect" + this.props.mainState.cardCheckedId)
                .attr("stroke", this.props.mainState.user.acientcolor);
            this.visit(this.props.mainState.json, (d, tr) => {
                this.totalNodes += 1;
                this.maxLabelLength = Math.max(d.name.length, this.maxLabelLength);

            }, (d) => {
                return d.children;
            });
            this.update(this.props.mainState.json);
            this.props.setMainState({
                ...this.props.mainState,
                treeNeedUpdate: false,
            });
        }
        if (this.props.mainState.home) {
            this.centerNode(this.props.mainState.json);
            this.props.setMainState({
                ...this.props.mainState,
                home: false,
            });
        }
    }

    render() {
        return (<div id={this.idsvg}></div>);
    }

}


export default Tree;