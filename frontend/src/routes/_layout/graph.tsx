import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { useTheme } from '@mui/material';

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
  const theme = useTheme();
  const cyRef = useRef<HTMLDivElement>(null);
  const cyInstance = useRef<cytoscape.Core | null>(null);

  // 重置视图函数
  const handleFit = () => {
    if (cyInstance.current) {
      cyInstance.current.fit(undefined, 40);
    }
  };

  useEffect(() => {
    if (cyRef.current) {
      const cy = cytoscape({
        container: cyRef.current,
        elements: mockData,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': theme.palette.primary.main,
              'label': 'data(label)',
              'color': theme.palette.primary.contrastText,
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
              'line-color': theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600],
              'target-arrow-color': theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600],
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '12px',
              'color': theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[700]
            }
          }
        ],
        layout: {
          name: 'grid',
        }
      });
      cyInstance.current = cy;
      // 初始化自动fit
      cy.ready(() => {
        cy.fit(undefined, 40);
      });
      // 双击空白重置视图
      cy.on('dbltap', (evt) => {
        if (evt.target === cy) {
          cy.fit(undefined, 40);
        }
      });
      return () => {
        cyInstance.current = null;
        cy.destroy();
      };
    }
  }, [theme]);

  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: theme.palette.background.default, 
      position: 'relative' 
    }}>
      {/* 重置视图按钮 */}
      <button
        onClick={handleFit}
        style={{
          position: 'absolute',
          top: 30,
          right: 40,
          zIndex: 10,
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          border: 'none',
          borderRadius: 6,
          padding: '8px 18px',
          fontWeight: 500,
          fontSize: 15,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >重置视图</button>
      <div
        ref={cyRef}
        style={{
          width: 'calc(100vw - 300px)', 
          height: 'calc(100vh - 80px)', 
          minWidth: 600,
          minHeight: 400,
          background: theme.palette.background.paper,
          border: `1.5px solid ${theme.palette.divider}`,
          borderRadius: 18,
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 6px 24px 0 rgba(0,0,0,0.2)' 
            : '0 6px 24px 0 rgba(60,72,100,0.08)',
          transition: 'box-shadow 0.2s',
        }}
      />
    </div>
  );
};

export default GraphPage;
