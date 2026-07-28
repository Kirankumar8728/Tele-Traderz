// TradingChart.tsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { init, dispose, Chart, registerOverlay } from 'klinecharts';
import { registerCustomOverlays } from '../overlays';
import { DERIV_WS_URL, TIMEFRAME_GRANULARITY } from '../constants';
import { NEW_APP_ID } from '../src/services/derivApiService';
import { Timeframe } from '../types';
import { 
  AlertCircle, Eye, EyeOff, RefreshCw, ChevronDown, Bell, Star, 
  Sparkles, FileText, History, Trash2, X, Sliders, Play, Plus, Map, Settings 
} from 'lucide-react';
import { format } from 'date-fns';

// Import newly created modular components
import ChartToolbar from './ChartToolbar';
import DrawingToolbar from './DrawingToolbar';
import StatusBar from './StatusBar';
import IndicatorLibrary, { DEFAULT_PARAMS_MAP } from './IndicatorLibrary';
import DrawingProperties from './DrawingProperties';
import ChartSettings from './ChartSettings';
import OverlayManager from './OverlayManager';
import IndicatorLayer from './IndicatorLayer';
import DrawingLayer from './DrawingLayer';
import { AISignalPanel } from './AISignalPanel';

// Import services and hooks
import { DrawingManager } from '../services/DrawingManager';
import { IndicatorManager } from '../services/IndicatorManager';
import { OverlayManager as OverlayService } from '../services/OverlayManager';
import { ChartUIService } from '../services/ChartUIService';
import { TemplateManager, ChartTemplate } from '../services/TemplateManager';
import { useToolbar } from '../hooks/useToolbar';
import { useDrawings } from '../hooks/useDrawings';
import { useIndicators } from '../hooks/useIndicators';
import { useDeriv } from '../hooks/useDeriv';
import { useChart } from '../hooks/useChart';
import { ChartStateMachine, ChartState } from '../services/ChartStateMachine';

interface TradingChartProps {
  underlying_symbol?: string;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  barrier?: string | number;
  openPositions?: any[];
  onMarketSelectorOpen?: () => void;
  onSymbolSelect?: (symbol: string) => void;
}

let overlaysRegistered = false;

const TradingChart: React.FC<TradingChartProps> = ({
  underlying_symbol = '1HZ100V',
  timeframe,
  onTimeframeChange,
  barrier,
  openPositions = [],
  onMarketSelectorOpen,
  onSymbolSelect
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const isDrawingBrushRef = useRef(false);
  const brushPointsRef = useRef<{ timestamp: number; value: number }[]>([]);
  const tempBrushOverlayIdRef = useRef<string | null>(null);
  
  const {
    state: chartState,
    candles,
    latestCandle: hookLatestCandle,
    lastPrice: hookLastPrice,
    errorMessage: hookErrorMessage,
    forceReload
  } = useChart(underlying_symbol, timeframe);

  const isLoading = chartState === ChartState.CONNECTING || chartState === ChartState.LOADING_HISTORY;
  const chartError = chartState === ChartState.ERROR ? hookErrorMessage : null;

  const [lastPrice, setLastPrice] = useState<number>(0);
  const [latestCandle, setLatestCandle] = useState<any>(null);

  // Layout states
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'indicators' | 'drawings' | 'settings' | 'alerts' | 'templates' | 'ai'>('indicators');
  
  const [isBottomOpen, setBottomOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<'positions' | 'history'>('positions');
  const [bottomHeight, setBottomHeight] = useState(140);
  const [isDraggingBottom, setIsDraggingBottom] = useState(false);

  // States for StatusBar
  const [crosshairData, setCrosshairData] = useState<any>(null);
  const [isIndicatorLegendExpanded, setIsIndicatorLegendExpanded] = useState(false);
  const [editingIndicatorId, setEditingIndicatorId] = useState<string | null>(null);
  const [editingIndicatorParams, setEditingIndicatorParams] = useState<{ label: string; value: number }[]>([]);
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Template Manager integration
  const [chartTemplates, setChartTemplates] = useState<ChartTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Hooks & Services
  const {
    drawingMode,
    setDrawingMode,
    drawings,
    clearAll: clearAllDrawings,
    toggleLock,
    toggleVisibility: toggleDrawingVisibility,
    removeDrawing
  } = useDrawings();

  const {
    activeIndicators,
    clearAll: clearAllIndicators,
    toggleVisibility: toggleIndicatorVisibility,
    removeIndicator: removeIndicatorFromChart,
    setParams: setIndicatorParams
  } = useIndicators();

  useEffect(() => {
    const handleTemplatesChange = (tpls: ChartTemplate[]) => {
      setChartTemplates(tpls);
    };
    TemplateManager.getInstance().registerListener(handleTemplatesChange);
    return () => {
      TemplateManager.getInstance().unregisterListener(handleTemplatesChange);
    };
  }, []);

  const handleApplyTemplate = (tpl: ChartTemplate) => {
    clearAllIndicators();
    // Use setTimeout to allow previous indicators to clear cleanly
    setTimeout(() => {
      tpl.indicators.forEach((ind: string) => {
        try {
          IndicatorManager.getInstance().addIndicator(ind);
        } catch (e) {
          console.error(`Failed to add template indicator ${ind}:`, e);
        }
      });
    }, 50);
  };

  const handleSaveCurrentTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    const activeTypes = activeIndicators.map(i => i.type);
    if (activeTypes.length === 0) {
      alert("No active indicators on chart to save!");
      return;
    }
    TemplateManager.getInstance().saveTemplate(newTemplateName.trim(), activeTypes, 'candle_solid', {});
    setNewTemplateName('');
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    TemplateManager.getInstance().deleteTemplate(id);
  };

  const {
    scaleType,
    showGrid,
    setScaleType,
    toggleGrid,
    fitContent,
    isFullscreen,
    takeScreenshot
  } = useToolbar();

  const { isConnected, sellContract, history = [], isHistoryLoading, getHistory } = useDeriv();

  // Refs for tracking data and layout
  const pingIntervalRef = useRef<any>(null);
  const barrierOverlayRef = useRef<string | null>(null);
  const positionOverlaysRef = useRef<Record<string, string>>({});

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (!overlaysRegistered) {
      try {
        registerCustomOverlays();
        overlaysRegistered = true;
      } catch (e) {
        console.error('Failed to register custom overlays:', e);
      }
    }

    try {
      const chart = init(chartContainerRef.current, {
        styles: {
          grid: {
            show: showGrid,
            horizontal: {
              show: true,
              size: 1,
              color: 'rgba(255, 255, 255, 0.05)',
              style: 'dashed' as any,
              dashedValue: [2, 2]
            },
            vertical: {
              show: true,
              size: 1,
              color: 'rgba(255, 255, 255, 0.05)',
              style: 'dashed' as any,
              dashedValue: [2, 2]
            }
          },
          candle: {
            type: (timeframe.endsWith('t') ? 'area' : 'candle_solid') as any,
            tooltip: {
              showRule: 'none' as any
            },
            bar: {
              upColor: '#22c55e',
              downColor: '#ef4444',
              noChangeColor: '#888888'
            },
            area: {
              lineSize: 2,
              lineColor: '#ef4444',
              backgroundColor: [{
                offset: 0,
                color: 'rgba(239, 68, 68, 0.2)'
              }, {
                offset: 1,
                color: 'rgba(239, 68, 68, 0)'
              }]
            }
          },
          indicator: {
            tooltip: {
              showRule: 'none' as any
            },
            lastValueMark: {
              show: true
            }
          },
          overlay: {
            point: {
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.25)',
              activeColor: '#ef4444',
              activeBorderColor: 'rgba(239, 68, 68, 0.5)',
              radius: 4,
              activeRadius: 5
            },
            line: {
              style: 'solid' as any,
              size: 1,
              color: 'rgba(255, 255, 255, 0.35)',
            },
            polygon: {
              style: 'fill' as any,
              color: 'rgba(239, 68, 68, 0.15)',
            },
            text: {
              color: 'rgba(255, 255, 255, 0.45)',
              size: 10,
              family: 'monospace'
            }
          },
          xAxis: {
            axisLine: { color: 'rgba(255, 255, 255, 0.08)' },
            tickText: { color: '#8f9cae', size: 10 }
          },
          yAxis: {
            axisLine: { color: 'rgba(255, 255, 255, 0.08)' },
            tickText: { color: '#8f9cae', size: 10 }
          }
        }
      });

      if (!chart) {
        throw new Error('KLineChart initialization returned null');
      }

      chartRef.current = chart;

      // Register chart instance to services for global interactive capabilities
      DrawingManager.getInstance().setChart(chart);
      IndicatorManager.getInstance().setChart(chart);
      OverlayService.getInstance().setChart(chart);
      ChartUIService.getInstance().setChart(chart);

      const handleResize = () => {
        chart.resize();
      };
      window.addEventListener('resize', handleResize);

      // Subscribe to Crosshair updates
      // @ts-ignore
      chart.subscribeAction('onCrosshairChange', (event: any) => {
        if (event && event.data) {
          setCrosshairData(event.data);
          
          let idx = event.dataIndex !== undefined ? event.dataIndex : event.data.dataIndex;
          if (idx !== undefined && idx !== null) {
            setHoveredDataIndex(idx);
          } else {
            // Try to match index by timestamp
            const targetTime = event.data.time || (event.data.kLineData?.timestamp);
            if (targetTime && chartRef.current) {
              const dataList = chartRef.current.getDataList();
              const foundIdx = dataList.findIndex((d: any) => d.timestamp === targetTime);
              if (foundIdx !== -1) {
                setHoveredDataIndex(foundIdx);
                return;
              }
            }
            setHoveredDataIndex(null);
          }
        } else {
          setCrosshairData(null);
          setHoveredDataIndex(null);
        }
      });

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartContainerRef.current) {
          dispose(chartContainerRef.current);
        }
      };
    } catch (e) {
      console.error('KLineChart Init Error:', e);
      ChartStateMachine.getInstance().transition(ChartState.ERROR, 'Failed to initialize chart engine');
    }
  }, []);

  // Handle Timeframe Type Change (Candle vs Area)
  useEffect(() => {
    if (!chartRef.current) return;
    const isTick = timeframe.endsWith('t');
    chartRef.current.setStyles({
      candle: {
        type: (isTick ? 'area' : 'candle_solid') as any,
        tooltip: {
          showRule: 'none' as any
        }
      }
    });
  }, [timeframe]);

  // Synchronize master hook state with component state
  useEffect(() => {
    if (hookLastPrice !== undefined && hookLastPrice !== null) {
      setLastPrice(hookLastPrice);
    }
  }, [hookLastPrice]);

  useEffect(() => {
    if (hookLatestCandle) {
      setLatestCandle(hookLatestCandle);
    }
  }, [hookLatestCandle]);

  // Synchronize candles into the visual KLineChart instance
  useEffect(() => {
    if (!chartRef.current) return;
    
    if (candles.length > 0) {
      chartRef.current.applyNewData(candles);
      setTimeout(() => chartRef.current?.resize(), 50);
    } else {
      chartRef.current.clearData();
    }
  }, [candles]);

  // Handle Dynamic Overlays for Drawing Tools
  useEffect(() => {
    if (!chartRef.current) return;

    const overlayMap: Record<string, string> = {
      'trendline': 'segment',
      'horizontal': 'horizontalStraightLine',
      'vertical': 'verticalStraightLine',
      'ray': 'ray',
      'arrow': 'arrow',
      'rectangle': 'rectangle',
      'circle': 'circle',
      'triangle': 'triangle',
      'fib': 'fibonacci',
      'text': 'text',
      'priceChannel': 'priceChannel',
      'parallelLine': 'parallelLine',
      'arc': 'arc'
    };

    if (drawingMode && drawingMode !== 'cursor' && drawingMode !== 'eraser' && drawingMode !== 'brush' && drawingMode !== 'highlighter') {
      const klineOverlay = overlayMap[drawingMode];
      if (klineOverlay) {
        chartRef.current.createOverlay({
          name: klineOverlay,
          onDrawEnd: (event: any) => {
            if (chartRef.current && event.overlay?.id) {
              chartRef.current.removeOverlay(event.overlay.id);
            }

            let textContent = 'Text Note';
            if (event.overlay?.name === 'text') {
              const userText = prompt('Enter note text:', 'Text Note');
              if (userText === null) {
                // User cancelled, do not save
                setDrawingMode(null);
                return true;
              }
              textContent = userText || 'Text Note';
            }

            // Register inside DrawingManager
            DrawingManager.getInstance().addDrawing({
              type: event.overlay.name,
              label: event.overlay.name === 'text' ? textContent.toUpperCase() : event.overlay.name.toUpperCase(),
              locked: false,
              visible: true,
              points: event.overlay.points,
              styles: event.overlay.name === 'text' ? {
                ...event.overlay.styles,
                text: {
                  content: textContent
                }
              } : event.overlay.styles
            });
            setDrawingMode(null);
            return true;
          }
        });
      }
    }
  }, [drawingMode]);

  // Handle freehand Brush, Highlighter, and Eraser tools
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const handleEraserClick = (clickX: number, clickY: number) => {
      if (!chartRef.current) return;
      const drawingsList = DrawingManager.getInstance().getDrawings();
      
      let closestDrawingId: string | null = null;
      let minDistance = Infinity;
      
      drawingsList.forEach(draw => {
        if (!draw.points || draw.points.length === 0) return;
        
        draw.points.forEach((p: any) => {
          const pixel = chartRef.current?.convertToPixel({
            timestamp: p.timestamp,
            value: p.value
          }, {}) as any;
          if (pixel && pixel.x !== undefined && pixel.y !== undefined) {
            const dx = pixel.x - clickX;
            const dy = pixel.y - clickY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDistance) {
              minDistance = dist;
              closestDrawingId = draw.id;
            }
          }
        });
      });
      
      if (closestDrawingId && minDistance < 20) {
        DrawingManager.getInstance().removeDrawing(closestDrawingId);
      }
    };

    const onDragStart = (clientX: number, clientY: number) => {
      if (!chartRef.current || !chartContainerRef.current) return;
      
      const rect = chartContainerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (drawingMode === 'eraser') {
        handleEraserClick(x, y);
        return;
      }

      isDrawingBrushRef.current = true;
      brushPointsRef.current = [];

      const coord = (chartRef.current as any).convertFromPixel({ x, y }, {}) as any;
      if (coord && coord.timestamp && coord.value !== undefined) {
        brushPointsRef.current.push({
          timestamp: coord.timestamp,
          value: coord.value
        });

        const overlayName = drawingMode === 'brush' ? 'brush' : 'highlighter';
        const tempId = chartRef.current.createOverlay({
          name: overlayName,
          points: [{ timestamp: coord.timestamp, value: coord.value }]
        });
        tempBrushOverlayIdRef.current = tempId as any;
      }
    };

    const onDragMove = (clientX: number, clientY: number) => {
      if (!chartRef.current || !chartContainerRef.current || !isDrawingBrushRef.current || !tempBrushOverlayIdRef.current) return;

      const rect = chartContainerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const coord = (chartRef.current as any).convertFromPixel({ x, y }, {}) as any;
      if (coord && coord.timestamp && coord.value !== undefined) {
        const lastPt = brushPointsRef.current[brushPointsRef.current.length - 1];
        if (!lastPt || lastPt.timestamp !== coord.timestamp || lastPt.value !== coord.value) {
          brushPointsRef.current.push({
            timestamp: coord.timestamp,
            value: coord.value
          });

          chartRef.current.overrideOverlay({
            id: tempBrushOverlayIdRef.current,
            points: [...brushPointsRef.current]
          });
        }
      }
    };

    const onDragEnd = () => {
      if (!chartRef.current || !isDrawingBrushRef.current) return;
      
      isDrawingBrushRef.current = false;

      if (tempBrushOverlayIdRef.current) {
        chartRef.current.removeOverlay(tempBrushOverlayIdRef.current);
        tempBrushOverlayIdRef.current = null;
      }

      if (brushPointsRef.current.length > 1) {
        const type = drawingMode === 'brush' ? 'brush' : 'highlighter';
        const label = drawingMode === 'brush' ? 'BRUSH' : 'HIGHLIGHTER';
        const strokeColor = drawingMode === 'brush' ? '#ef4444' : 'rgba(239, 68, 68, 0.35)';
        const strokeSize = drawingMode === 'brush' ? 2 : 10;

        DrawingManager.getInstance().addDrawing({
          type: type,
          label: label,
          locked: false,
          visible: true,
          points: [...brushPointsRef.current],
          styles: {
            line: {
              color: strokeColor,
              size: strokeSize
            }
          }
        });
      }

      setDrawingMode(null);
    };

    const handleCaptureMouseDown = (e: MouseEvent) => {
      if (drawingMode === 'brush' || drawingMode === 'highlighter' || drawingMode === 'eraser') {
        e.stopPropagation();
        onDragStart(e.clientX, e.clientY);
      }
    };

    const handleCaptureMouseMove = (e: MouseEvent) => {
      if (drawingMode === 'brush' || drawingMode === 'highlighter') {
        if (isDrawingBrushRef.current) {
          e.stopPropagation();
          onDragMove(e.clientX, e.clientY);
        }
      }
    };

    const handleCaptureMouseUp = (e: MouseEvent) => {
      if (drawingMode === 'brush' || drawingMode === 'highlighter') {
        if (isDrawingBrushRef.current) {
          e.stopPropagation();
          onDragEnd();
        }
      }
    };

    const handleCaptureTouchStart = (e: TouchEvent) => {
      if (drawingMode === 'brush' || drawingMode === 'highlighter' || drawingMode === 'eraser') {
        e.stopPropagation();
        const touch = e.touches[0];
        if (touch) {
          onDragStart(touch.clientX, touch.clientY);
        }
      }
    };

    const handleCaptureTouchMove = (e: TouchEvent) => {
      if (drawingMode === 'brush' || drawingMode === 'highlighter') {
        if (isDrawingBrushRef.current) {
          e.stopPropagation();
          const touch = e.touches[0];
          if (touch) {
            onDragMove(touch.clientX, touch.clientY);
          }
        }
      }
    };

    const handleCaptureTouchEnd = (e: TouchEvent) => {
      if (drawingMode === 'brush' || drawingMode === 'highlighter') {
        if (isDrawingBrushRef.current) {
          e.stopPropagation();
          onDragEnd();
        }
      }
    };

    container.addEventListener('mousedown', handleCaptureMouseDown, true);
    container.addEventListener('mousemove', handleCaptureMouseMove, true);
    container.addEventListener('mouseup', handleCaptureMouseUp, true);
    container.addEventListener('touchstart', handleCaptureTouchStart, true);
    container.addEventListener('touchmove', handleCaptureTouchMove, true);
    container.addEventListener('touchend', handleCaptureTouchEnd, true);

    return () => {
      container.removeEventListener('mousedown', handleCaptureMouseDown, true);
      container.removeEventListener('mousemove', handleCaptureMouseMove, true);
      container.removeEventListener('mouseup', handleCaptureMouseUp, true);
      container.removeEventListener('touchstart', handleCaptureTouchStart, true);
      container.removeEventListener('touchmove', handleCaptureTouchMove, true);
      container.removeEventListener('touchend', handleCaptureTouchEnd, true);
    };
  }, [drawingMode]);

  // Handle Barrier overlay displaying
  useEffect(() => {
    if (!chartRef.current) return;

    if (barrierOverlayRef.current) {
      chartRef.current.removeOverlay(barrierOverlayRef.current);
      barrierOverlayRef.current = null;
    }

    if (barrier !== undefined && barrier !== null && barrier !== '') {
      let barrierLevel: number;
      const barrierStr = barrier.toString();
      
      if (barrierStr.startsWith('+') || barrierStr.startsWith('-')) {
        barrierLevel = lastPrice + parseFloat(barrierStr);
      } else {
        barrierLevel = parseFloat(barrierStr);
      }

      if (!isNaN(barrierLevel) && barrierLevel > 0) {
        const id = chartRef.current.createOverlay({
          name: 'barrier',
          points: [{ value: barrierLevel }],
          styles: {
            line: {
              color: '#f59e0b',
              size: 2
            }
          },
          lock: true
        });
        barrierOverlayRef.current = id as string;
      }
    }
  }, [barrier, lastPrice]);

  // Handle Open Positions drawing
  useEffect(() => {
    if (!chartRef.current) return;

    Object.values(positionOverlaysRef.current).forEach(id => {
      chartRef.current?.removeOverlay(id);
    });
    positionOverlaysRef.current = {};

    openPositions.forEach(pos => {
      const entryPrice = parseFloat(pos.entry_price);
      const currentPrice = lastPrice;
      const profit = (currentPrice - entryPrice) * (pos.type === 'CALL' ? 1 : -1);

      const id = chartRef.current?.createOverlay({
        name: 'tradeLine',
        points: [{ value: entryPrice, profit: profit } as any],
        lock: true
      });
      if (id) {
        positionOverlaysRef.current[pos.id] = id as string;
      }
    });
  }, [openPositions, lastPrice]);

  // Handle Dragging bottom layout panel
  const startDragBottom = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingBottom(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingBottom) return;
      const terminalElement = document.querySelector('.terminal-container');
      if (terminalElement) {
        const bounds = terminalElement.getBoundingClientRect();
        const height = bounds.bottom - e.clientY;
        setBottomHeight(Math.max(60, Math.min(300, height)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingBottom(false);
    };

    if (isDraggingBottom) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingBottom]);

  // Formatting date for list views
  const formatEpoch = (epoch: number) => {
    return format(epoch * 1000, 'HH:mm:ss');
  };

  // Render Custom Indicator Legend overlay
  const formatIndicatorNameAndParams = (ind: any) => {
    const type = ind.type;
    let paramsStr = '';
    if (ind.params && Array.isArray(ind.params) && ind.params.length > 0) {
      paramsStr = `(${ind.params.join(',')})`;
    } else {
      const defaultParams = DEFAULT_PARAMS_MAP[type];
      if (defaultParams) {
        paramsStr = `(${defaultParams.map((p: any) => p.value).join(',')})`;
      }
    }
    return `${type}${paramsStr}`;
  };

  const activeDataIndex = useMemo(() => {
    if (!chartRef.current) return -1;
    const dataList = chartRef.current.getDataList();
    if (dataList.length === 0) return -1;

    if (hoveredDataIndex !== null && hoveredDataIndex >= 0 && hoveredDataIndex < dataList.length) {
      return hoveredDataIndex;
    }

    if (crosshairData && crosshairData.time) {
      const targetTime = typeof crosshairData.time === 'number' 
        ? crosshairData.time 
        : new Date(crosshairData.time).getTime();
      const idx = dataList.findIndex((d: any) => d.timestamp === targetTime);
      if (idx !== -1) return idx;
    }

    return dataList.length - 1;
  }, [crosshairData, hoveredDataIndex, latestCandle]);

  const renderIndicatorValues = (ind: any, dataIndex: number | null) => {
    if (!chartRef.current) return null;
    try {
      const result = (chartRef.current as any).getIndicatorResult(ind.paneId, ind.type);
      if (!result || dataIndex === null || dataIndex < 0 || dataIndex >= result.length) return null;
      const val = result[dataIndex];
      if (val === undefined || val === null) return null;
      
      if (typeof val === 'number') {
        return (
          <span className="text-[9px] font-mono font-bold text-gray-400">
            {val.toFixed(2)}
          </span>
        );
      }
      
      if (typeof val === 'object') {
        const keys = Object.keys(val).filter(k => typeof val[k] === 'number');
        if (keys.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {keys.map(k => {
              const numVal = val[k];
              let colorClass = 'text-gray-400';
              const kUpper = k.toUpperCase();
              if (kUpper.includes('UP')) colorClass = 'text-amber-500';
              else if (kUpper.includes('DN')) colorClass = 'text-blue-500';
              else if (kUpper.includes('MID')) colorClass = 'text-purple-400';
              else if (kUpper.includes('DIFF') || kUpper.includes('MACD')) colorClass = 'text-red-400';
              else if (kUpper.includes('DEA')) colorClass = 'text-emerald-400';
              
              return (
                <span key={k} className="text-[9px] font-mono font-bold whitespace-nowrap">
                  <span className="text-gray-500">{kUpper}:</span>{' '}
                  <span className={colorClass}>{numVal.toFixed(2)}</span>
                </span>
              );
            })}
          </div>
        );
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleEditLegendClick = (id: string, currentParams: any[], type: string) => {
    setEditingIndicatorId(id);
    const defaultParams = DEFAULT_PARAMS_MAP[type] || [];
    const list = defaultParams.map((def, idx) => {
      const actualVal = (currentParams && currentParams[idx] !== undefined) 
        ? currentParams[idx] 
        : def.value;
      return {
        label: def.label,
        value: actualVal
      };
    });
    
    if (list.length === 0 && currentParams && currentParams.length > 0) {
      currentParams.forEach((val, idx) => {
        list.push({
          label: `Param ${idx + 1}`,
          value: val
        });
      });
    }
    setEditingIndicatorParams(list);
  };

  const displayedLegendIndicators = useMemo(() => {
    if (isIndicatorLegendExpanded) {
      return activeIndicators;
    }
    return activeIndicators.slice(0, 3);
  }, [activeIndicators, isIndicatorLegendExpanded]);

  return (
    <div className="terminal-container klinecharts-container w-full h-full flex flex-col relative bg-[#0b0e14] border border-white/5 overflow-hidden rounded-3xl shadow-2xl">
      {/* 1. TOP TOOLBAR */}
      <ChartToolbar
        timeframe={timeframe}
        onTimeframeChange={onTimeframeChange}
        selectedSymbol={underlying_symbol}
        onMarketSelectorOpen={() => {
          if (onMarketSelectorOpen) {
            onMarketSelectorOpen();
          } else {
            window.dispatchEvent(new CustomEvent('OPEN_MARKET_SELECTOR'));
          }
        }}
        onTabChange={(tab) => {
          setActiveSidebarTab(tab);
        }}
        activeSidebarTab={activeSidebarTab}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onSymbolSelect={(sym) => {
          onTimeframeChange(timeframe); // Re-trigger tick
          if (onSymbolSelect) {
            onSymbolSelect(sym);
          } else {
            window.dispatchEvent(new CustomEvent('SELECT_SYMBOL_DIRECT', { detail: sym }));
          }
        }}
        onRefresh={forceReload}
      />

      {/* 2. BODY LAYOUT (Left Toolbar + Chart Area + Right Collapsible Sidebar) */}
      <div className="flex-1 min-h-0 flex relative">
        
        {/* LEFT TOOLBAR (Drawing tools column) */}
        <DrawingToolbar drawingMode={drawingMode} setDrawingMode={setDrawingMode} />

        {/* MIDDLE COLUMN: (Chart Canvas container + Bottom Panels) */}
        <div className="flex-1 min-w-0 flex flex-col relative bg-[#07090e]">
          
          {/* Main Chart Canvas container */}
          <div className="flex-1 min-h-0 relative">
            <div ref={chartContainerRef} className="absolute inset-0 z-10" />

            {/* Price badge floating at the top-right of chart */}
            <div className="absolute top-3 right-3 z-20 pointer-events-none">
              <div className="bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1.5 shadow-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono font-black text-white tabular-nums">
                  {lastPrice.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Bottom Center Floating Refresh Button */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
              <button
                onClick={() => forceReload()}
                className="p-2.5 bg-[#10141d]/90 hover:bg-[#181f2d] backdrop-blur-md border border-white/10 hover:border-violet-500/40 rounded-full text-gray-300 hover:text-white flex items-center justify-center shadow-xl hover:shadow-violet-500/10 transition-all cursor-pointer group"
                title="Refresh Chart"
              >
                <RefreshCw className={`w-4 h-4 text-violet-400 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              </button>
            </div>

            {/* Custom Active Indicators Legend Overlay */}
            <IndicatorLayer
              activeIndicators={activeIndicators}
              displayedLegendIndicators={displayedLegendIndicators}
              toggleIndicatorVisibility={toggleIndicatorVisibility}
              handleEditLegendClick={handleEditLegendClick}
              removeIndicatorFromChart={removeIndicatorFromChart}
              activeDataIndex={activeDataIndex}
              renderIndicatorValues={renderIndicatorValues}
              isIndicatorLegendExpanded={isIndicatorLegendExpanded}
              setIsIndicatorLegendExpanded={setIsIndicatorLegendExpanded}
              DEFAULT_PARAMS_MAP={DEFAULT_PARAMS_MAP}
            />

            {/* Drawing Mode Guide Layer Overlay */}
            <DrawingLayer
              drawingMode={drawingMode}
              setDrawingMode={setDrawingMode}
            />

            {/* Inline Indicator Parameters Editor Modal */}
            {editingIndicatorId && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0b0e14]/75 backdrop-blur-sm z-30 pointer-events-auto">
                <div className="bg-[#111622] border border-white/10 rounded-3xl p-5 w-72 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                      Edit {activeIndicators.find(i => i.id === editingIndicatorId)?.type} Params
                    </span>
                    <button 
                      onClick={() => setEditingIndicatorId(null)}
                      className="p-1 hover:bg-white/5 rounded-md text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar py-1">
                    {editingIndicatorParams.map((param, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{param.label}</span>
                        <input
                          type="number"
                          value={param.value}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditingIndicatorParams(prev => prev.map((p, i) => i === idx ? { ...p, value: val } : p));
                          }}
                          className="w-20 bg-[#0b0e14] border border-white/15 rounded-xl px-2.5 py-1 text-right text-[10px] font-mono font-bold text-white outline-none focus:border-red-500/50"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => setEditingIndicatorId(null)}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[9px] font-black uppercase text-gray-300 tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const numericArray = editingIndicatorParams.map(item => item.value);
                        setIndicatorParams(editingIndicatorId, numericArray);
                        setEditingIndicatorId(null);
                      }}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/15 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading / Error overlay states */}
            {isLoading && !chartError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0b0e14]/90 backdrop-blur-sm z-30">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Loading Market Data...</span>
                </div>
              </div>
            )}

            {chartError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0b0e14]/90 backdrop-blur-sm z-30 p-6">
                <div className="flex flex-col items-center gap-4 max-w-xs text-center">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Feed Offline</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">{chartError}</p>
                  </div>
                  <button 
                    onClick={() => forceReload()}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/10"
                  >
                    Retry connection
                  </button>
                </div>
              </div>
            )}
          </div>




        </div>

        {/* 3. RIGHT COLLAPSIBLE SIDEBAR PANEL (Indicators, Settings, Properties, Alerts, Templates) */}
        {isSidebarOpen && (
          <div className="w-72 bg-[#0b0e14] border-l border-white/5 flex flex-col justify-between select-none z-40 animate-in slide-in-from-right duration-200">
            {/* Sidebar Tabs Headers */}
            <div className="h-10 bg-[#111620] border-b border-white/5 flex items-center justify-between px-3">
              <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-red-500" />
                {activeSidebarTab}
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-white/5 rounded-md text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tabs List */}
            <div className="flex border-b border-white/5 bg-[#0e131d] px-2 py-1 gap-1 overflow-x-auto no-scrollbar">
              {(['indicators', 'drawings', 'settings', 'templates', 'ai'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveSidebarTab(tab)}
                  className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all text-center border ${
                    activeSidebarTab === tab
                      ? tab === 'ai'
                        ? 'bg-violet-600/10 border-violet-500/25 text-violet-400'
                        : 'bg-red-600/10 border-red-500/25 text-red-500'
                      : 'bg-transparent border-transparent text-gray-500 hover:text-white'
                  }`}
                >
                  {tab === 'indicators' && 'Indicators'}
                  {tab === 'drawings' && 'Drawing'}
                  {tab === 'settings' && 'Settings'}
                  {tab === 'templates' && 'Templates'}
                  {tab === 'ai' && 'AI'}
                </button>
              ))}
            </div>

            {/* Active Tab Panel Content */}
            <div className="flex-1 min-h-0 bg-[#07090e]">
              {activeSidebarTab === 'indicators' && <IndicatorLibrary />}
              {activeSidebarTab === 'drawings' && <DrawingProperties />}
              {activeSidebarTab === 'settings' && <ChartSettings />}
              {activeSidebarTab === 'ai' && <AISignalPanel symbol={underlying_symbol} timeframe={timeframe} candles={candles} />}
              {activeSidebarTab === 'templates' && (
                <div className="p-4 space-y-4 h-full flex flex-col min-h-0 text-gray-300">
                  {/* Save Current Template Form */}
                  <form onSubmit={handleSaveCurrentTemplate} className="bg-white/5 border border-white/5 rounded-2xl p-3 space-y-2 flex-shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500 block mb-1">Save Active Indicators</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Template Name..."
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        className="flex-1 bg-[#0b0e14]/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] font-bold outline-none focus:border-red-500/50"
                      />
                      <button
                        type="submit"
                        disabled={activeIndicators.length === 0}
                        className="px-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 shadow-lg shadow-red-600/15"
                      >
                        <Plus className="w-3 h-3" />
                        Save
                      </button>
                    </div>
                    <span className="text-[7px] text-gray-500 font-bold uppercase block">
                      Active: {activeIndicators.length > 0 ? activeIndicators.map(i => i.type).join(', ') : 'None'}
                    </span>
                  </form>

                  <div className="h-px bg-white/5 flex-shrink-0" />

                  {/* Templates List */}
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-24">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Select Template
                    </h3>

                    <div className="flex flex-col gap-1.5">
                      {chartTemplates.map(tpl => {
                        const isCustom = tpl.id.startsWith('tpl_');
                        return (
                          <div 
                            key={tpl.id}
                            onClick={() => handleApplyTemplate(tpl)}
                            className="bg-[#141922]/40 hover:bg-[#141922] border border-white/5 p-3 rounded-2xl text-left w-full transition-all group cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs font-black text-white uppercase group-hover:text-red-500 transition-colors truncate">
                                {tpl.name}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                {tpl.indicators.map((ind, i) => (
                                  <span key={i} className="text-[7px] font-black px-1 py-0.2 rounded bg-white/5 text-gray-400 uppercase">
                                    {ind}
                                  </span>
                                ))}
                                {isCustom && (
                                  <span className="text-[7px] font-black px-1 py-0.2 rounded bg-red-600/10 text-red-500 uppercase">
                                    Custom
                                  </span>
                                )}
                              </div>
                            </div>

                            {isCustom && (
                              <button
                                onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                                className="p-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-all"
                                title="Delete template"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM STATUS BAR (OHLC & telemetry data info) */}
      <StatusBar
        isConnected={isConnected}
        underlying_symbol={underlying_symbol}
        timeframe={timeframe}
        ohlc={latestCandle}
        crosshairData={crosshairData}
      />
    </div>
  );
};

export default TradingChart;
