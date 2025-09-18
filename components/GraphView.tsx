

import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Person, RelationshipType } from '../types';

// FIX: Define types for D3 simulation data to satisfy TypeScript and fix type errors.
interface GraphNode extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    color: string;
}

interface GraphLink {
    source: string;
    target: string;
}

interface GraphViewProps {
    people: Person[];
    onNodeClick: (nodeId: string) => void;
    selectedNodeId: string | null;
    highlightedNodeId: string | null;
    relationshipTypes: RelationshipType[];
}

const GraphView: React.FC<GraphViewProps> = ({ people, onNodeClick, selectedNodeId, highlightedNodeId, relationshipTypes }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const colorMap = useMemo(() => {
        return new Map(relationshipTypes.map(rt => [rt.name, rt.color]));
    }, [relationshipTypes]);

    const { nodes, links } = useMemo(() => {
        const graphNodes: GraphNode[] = people.map(p => ({ 
            id: p.id, 
            name: p.name, 
            color: colorMap.get(p.primaryRelationship) || '#a3a3a3' 
        }));
        const graphLinks: GraphLink[] = [];
        const linkSet = new Set<string>();

        people.forEach(p => {
            p.relationships.forEach(r => {
                const sourceId = p.id;
                const targetId = r.connected_to_id;
                
                if (people.some(person => person.id === targetId)) {
                    const linkKey = [sourceId, targetId].sort().join('-');
                    if (!linkSet.has(linkKey)) {
                        graphLinks.push({ source: sourceId, target: targetId });
                        linkSet.add(linkKey);
                    }
                }
            });
        });

        return { nodes: graphNodes, links: graphLinks };
    }, [people, colorMap]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('background-color', '#1a1a1a');

        svg.selectAll("*").remove(); // Clear previous render

        // FIX: Provide explicit types for the simulation and forces to resolve overload errors.
        const simulation = d3.forceSimulation<GraphNode>(nodes)
            .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide().radius(30));

        const g = svg.append("g");

        const link = g.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', '#444')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 1.5);

        const node = g.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('cursor', 'pointer')
            .call(drag(simulation) as any)
            .on('click', (event, d) => {
                onNodeClick(d.id);
            });
            
        node.append('circle')
            .attr('r', 20)
            .attr('fill', d => d.color);

        node.append('text')
            .text(d => d.name)
            .attr('x', 0)
            .attr('y', 35)
            .attr('text-anchor', 'middle')
            .attr('fill', '#f0f0f0')
            .style('font-size', '12px')
            .style('pointer-events', 'none');

        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
        
        svg.call(zoom);

        simulation.on('tick', () => {
            // FIX: After simulation, link sources and targets are nodes. Cast to access x/y properties.
            // D3 mutates the links array, which TypeScript doesn't infer.
            link
                .attr('x1', d => ((d.source as unknown) as GraphNode).x)
                .attr('y1', d => ((d.source as unknown) as GraphNode).y)
                .attr('x2', d => ((d.target as unknown) as GraphNode).x)
                .attr('y2', d => ((d.target as unknown) as GraphNode).y);

            // FIX: The node datum is now correctly typed, so x and y properties are available.
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // FIX: Correctly type the simulation in the drag function
        function drag(simulation: d3.Simulation<GraphNode, undefined>) {
            function dragstarted(event: any) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            function dragged(event: any) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            function dragended(event: any) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
        }

        return () => {
            simulation.stop();
        };

    }, [nodes, links, onNodeClick]);
    
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);

        // FIX: Add correct type for datum 'd' to avoid 'any'
        svg.selectAll<SVGCircleElement, GraphNode>('circle')
            .transition().duration(200)
            .attr('r', d => d.id === selectedNodeId || d.id === highlightedNodeId ? 25 : 20)
            .attr('stroke', d => d.id === selectedNodeId ? '#fff' : ((d as GraphNode).id === highlightedNodeId ? '#3b82f6' : 'none'))
            .attr('stroke-width', d => d.id === selectedNodeId || d.id === highlightedNodeId ? 3 : 0);

    }, [selectedNodeId, highlightedNodeId]);


    return (
        <div ref={containerRef} className="w-full h-full">
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default GraphView;
