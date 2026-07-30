
import { registerOverlay } from 'klinecharts';

export const registerCustomOverlays = () => {
  // Arrow Overlay
  registerOverlay({
    name: 'arrow',
    totalStep: 3,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 0) {
        const x1 = coordinates[0].x;
        const y1 = coordinates[0].y;
        const x2 = coordinates[1]?.x ?? x1;
        const y2 = coordinates[1]?.y ?? y1;
        
        const figures: any[] = [
          {
            type: 'line',
            attrs: {
              coordinates: [
                { x: x1, y: y1 },
                { x: x2, y: y2 }
              ]
            }
          }
        ];

        if (coordinates.length === 2) {
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLength = 10;
          
          figures.push(
            {
              type: 'line',
              attrs: {
                coordinates: [
                  { x: x2, y: y2 },
                  {
                    x: x2 - headLength * Math.cos(angle - Math.PI / 6),
                    y: y2 - headLength * Math.sin(angle - Math.PI / 6)
                  }
                ]
              }
            },
            {
              type: 'line',
              attrs: {
                coordinates: [
                  { x: x2, y: y2 },
                  {
                    x: x2 - headLength * Math.cos(angle + Math.PI / 6),
                    y: y2 - headLength * Math.sin(angle + Math.PI / 6)
                  }
                ]
              }
            }
          );
        }
        return figures;
      }
      return [];
    }
  });

  // Rectangle Overlay
  registerOverlay({
    name: 'rectangle',
    totalStep: 3,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 0) {
        const x1 = coordinates[0].x;
        const y1 = coordinates[0].y;
        const x2 = coordinates[1]?.x ?? x1;
        const y2 = coordinates[1]?.y ?? y1;
        
        return [
          {
            type: 'polygon',
            attrs: {
              coordinates: [
                { x: x1, y: y1 },
                { x: x2, y: y1 },
                { x: x2, y: y2 },
                { x: x1, y: y2 }
              ]
            }
          }
        ];
      }
      return [];
    }
  });
  // Barrier Overlay
  registerOverlay({
    name: 'barrier',
    totalStep: 2,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates, bounding, precision, overlay }) => {
      if (coordinates.length === 0 || !overlay.points[0]) return [];
      const { x, y } = coordinates[0];
      const price = overlay.points[0].value ?? 0;
      return [
        {
          type: 'line',
          attrs: {
            coordinates: [
              { x: 0, y },
              { x: bounding.width, y }
            ]
          },
          style: {
            style: 'dashed',
            dashedValue: [4, 4]
          }
        },
        {
          type: 'text',
          attrs: {
            x: 10,
            y: y - 10,
            text: `BARRIER: ${price.toFixed(precision.price)}`
          },
          style: {
            color: '#f59e0b',
            size: 10,
            weight: 'bold',
            family: 'monospace'
          }
        }
      ];
    }
  });

  // Trade Line Overlay
  registerOverlay({
    name: 'tradeLine',
    totalStep: 2,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures: ({ coordinates, bounding, precision, overlay }) => {
      if (coordinates.length === 0 || !overlay.points[0]) return [];
      const x1 = coordinates[0].x;
      const y = coordinates[0].y;
      const price = overlay.points[0].value ?? 0;
      const profit = (overlay.points[0] as any).profit ?? 0;
      const type = (overlay.points[0] as any).type ?? 'TRADE';
      const duration = (overlay.points[0] as any).duration ?? 30;

      let x2 = coordinates[1]?.x;
      if (!x2 || x2 <= x1) {
        // Project upcoming candle end position based on trade duration
        const estimatedOffset = Math.max(60, Math.min(bounding.width - x1, duration * 3));
        x2 = x1 + estimatedOffset;
      }

      // Transparent line colors (soft green for profit/call, soft red for loss/put)
      const lineColor = profit >= 0 ? 'rgba(34, 197, 94, 0.65)' : 'rgba(239, 68, 68, 0.65)';
      const textColor = profit >= 0 ? '#4ade80' : '#f87171';
      const dotColor = profit >= 0 ? '#22c55e' : '#ef4444';

      return [
        // Execution line from present candle to upcoming expiry candle
        {
          type: 'line',
          attrs: {
            coordinates: [
              { x: x1, y: y },
              { x: x2, y: y }
            ]
          },
          style: {
            color: lineColor,
            size: 2,
            style: 'dashed',
            dashedValue: [4, 4]
          }
        },
        // Execution entry candle dot marker
        {
          type: 'circle',
          attrs: {
            x: x1,
            y: y,
            r: 4
          },
          style: {
            style: 'fill',
            color: dotColor
          }
        },
        // Target expiry candle dot marker
        {
          type: 'circle',
          attrs: {
            x: x2,
            y: y,
            r: 4
          },
          style: {
            style: 'stroke',
            color: dotColor,
            size: 2
          }
        },
        // Floating label with execution details
        {
          type: 'text',
          attrs: {
            x: x1 + 6,
            y: y - 10,
            text: `${type.toUpperCase()} @ ${price.toFixed(precision.price)}`
          },
          style: {
            color: textColor,
            size: 10,
            weight: 'bold',
            family: 'monospace'
          }
        }
      ];
    }
  });

  // Circle Overlay
  registerOverlay({
    name: 'circle',
    totalStep: 3,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 0) {
        const p1 = coordinates[0];
        const p2 = coordinates[1] ?? p1;
        const radius = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        return [
          {
            type: 'circle',
            attrs: {
              x: p1.x,
              y: p1.y,
              r: radius
            },
            style: {
              style: 'stroke'
            }
          }
        ];
      }
      return [];
    }
  });

  // Triangle Overlay
  registerOverlay({
    name: 'triangle',
    totalStep: 4,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 0) {
        const p1 = coordinates[0];
        const p2 = coordinates[1] ?? p1;
        const p3 = coordinates[2] ?? p2;
        return [
          {
            type: 'polygon',
            attrs: {
              coordinates: [p1, p2, p3]
            },
            style: {
              style: 'stroke'
            }
          }
        ];
      }
      return [];
    }
  });

  // Text / Annotation Overlay
  registerOverlay({
    name: 'text',
    totalStep: 2,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates, overlay }) => {
      if (coordinates.length > 0) {
        const { x, y } = coordinates[0];
        const text = (overlay as any).styles?.text?.content || (overlay as any).label || 'Text Note';
        return [
          {
            type: 'text',
            attrs: {
              x,
              y,
              text: text,
              align: 'left',
              baseline: 'bottom'
            },
            style: {
              color: '#ffffff',
              size: 12,
              family: 'sans-serif',
              weight: 'bold'
            }
          }
        ];
      }
      return [];
    }
  });

  // Fibonacci Arc Overlay
  registerOverlay({
    name: 'arc',
    totalStep: 3,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 1) {
        const p1 = coordinates[0];
        const p2 = coordinates[1];
        const radius = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const ratios = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
        const colors = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#38bdf8'];
        
        const figures: any[] = [];
        
        // Draw connecting line
        figures.push({
          type: 'line',
          attrs: {
            coordinates: [p1, p2]
          },
          style: {
            color: 'rgba(255, 255, 255, 0.2)',
            style: 'dashed',
            dashedValue: [2, 2]
          }
        });

        // Draw multiple circles at Fibonacci ratios
        ratios.forEach((ratio, idx) => {
          figures.push({
            type: 'circle',
            attrs: {
              x: p1.x,
              y: p1.y,
              r: radius * ratio
            },
            style: {
              style: 'stroke',
              color: colors[idx % colors.length]
            }
          });
        });
        
        return figures;
      }
      return [];
    }
  });

  // Colourful Fibonacci Retracement Overlay
  registerOverlay({
    name: 'fibonacci',
    totalStep: 3,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates, bounding }) => {
      if (coordinates.length > 1) {
        const p1 = coordinates[0];
        const p2 = coordinates[1];
        const yDiff = p2.y - p1.y;
        
        const levels = [
          { ratio: 0, label: '0.000', color: '#ef4444' },
          { ratio: 0.236, label: '0.236', color: '#f97316' },
          { ratio: 0.382, label: '0.382', color: '#eab308' },
          { ratio: 0.5, label: '0.500', color: '#22c55e' },
          { ratio: 0.618, label: '0.618', color: '#06b6d4' },
          { ratio: 0.786, label: '0.786', color: '#3b82f6' },
          { ratio: 1.0, label: '1.000', color: '#a855f7' }
        ];
        
        const figures: any[] = [];
        
        // Connecting diagonal trendline
        figures.push({
          type: 'line',
          attrs: {
            coordinates: [p1, p2]
          },
          style: {
            color: 'rgba(255, 255, 255, 0.3)',
            style: 'dashed',
            dashedValue: [2, 2]
          }
        });

        levels.forEach(level => {
          const y = p1.y + yDiff * level.ratio;
          figures.push(
            {
              type: 'line',
              attrs: {
                coordinates: [
                  { x: 0, y },
                  { x: bounding.width, y }
                ]
              },
              style: {
                color: level.color,
                size: 1
              }
            },
            {
              type: 'text',
              attrs: {
                x: 10,
                y: y - 4,
                text: `${level.label} (${(level.ratio * 100).toFixed(1)}%)`
              },
              style: {
                color: level.color,
                size: 10,
                weight: 'bold',
                family: 'monospace'
              }
            }
          );
        });
        
        return figures;
      }
      return [];
    }
  });

  // Freehand Brush Overlay
  registerOverlay({
    name: 'brush',
    totalStep: 999,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 1) {
        return [
          {
            type: 'line',
            attrs: {
              coordinates: coordinates
            },
            style: {
              color: '#ef4444',
              size: 2
            }
          }
        ];
      }
      return [];
    }
  });

  // Highlighter Overlay
  registerOverlay({
    name: 'highlighter',
    totalStep: 999,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 1) {
        return [
          {
            type: 'line',
            attrs: {
              coordinates: coordinates
            },
            style: {
              color: 'rgba(239, 68, 68, 0.35)',
              size: 10
            }
          }
        ];
      }
      return [];
    }
  });
};
