import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const mockData = {
  nodes: [
    { data: { id: 'a', label: '节点A' } },
    { data: { id: 'b', label: '节点B' } },
    { data: { id: 'c', label: '节点C' } },
    { data: { id: 'd', label: '节点D' } },
    { data: { id: 'e', label: '节点E' } },
    { data: { id: 'f', label: '节点F' } },
    { data: { id: 'g', label: '节点G' } },
    { data: { id: 'h', label: '节点H' } },
    { data: { id: 'i', label: '节点I' } },
    { data: { id: 'j', label: '节点J' } }
  ],
  edges: [
    { data: { source: 'a', target: 'b', label: '关系1' } },
    { data: { source: 'a', target: 'c', label: '关系2' } },
    { data: { source: 'b', target: 'd', label: '关系3' } },
    { data: { source: 'b', target: 'e', label: '关系4' } },
    { data: { source: 'c', target: 'f', label: '关系5' } },
    { data: { source: 'd', target: 'g', label: '关系6' } },
    { data: { source: 'e', target: 'g', label: '关系7' } },
    { data: { source: 'f', target: 'h', label: '关系8' } },
    { data: { source: 'g', target: 'i', label: '关系9' } },
    { data: { source: 'h', target: 'i', label: '关系10' } },
    { data: { source: 'i', target: 'j', label: '关系11' } },
    { data: { source: 'e', target: 'j', label: '关系12' } }
  ]
};

const GraphPage: React.FC = () => {
  const cyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cyRef.current) {
      const cy = cytoscape({
        container: cyRef.current,
        elements: mockData,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#0074D9',
              'label': 'data(label)',
              'color': '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '14px',
              'width': 50,
              'height': 50
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '12px',
              'color': '#888'
            }
          }
        ],
        layout: {
          name: 'grid',
          rows: 1
        }
      });
      return () => cy.destroy();
    }
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f9fa' }}>
      <div
        ref={cyRef}
        style={{
          width: 'calc(100vw - 300px)', 
          height: 'calc(100vh - 80px)', 
          minWidth: 600,
          minHeight: 400,
          background: '#fff',
          border: '1.5px solid #e0e3e7',
          borderRadius: 18,
          boxShadow: '0 6px 24px 0 rgba(60,72,100,0.08)',
          transition: 'box-shadow 0.2s',
        }}
      />
    </div>
  );
};

export default GraphPage;
