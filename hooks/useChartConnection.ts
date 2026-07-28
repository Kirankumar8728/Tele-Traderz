// useChartConnection.ts
import { useState, useEffect } from 'react';
import { ChartStateMachine, ChartState } from '../services/ChartStateMachine';
import { ChartConnectionManager } from '../services/ChartConnectionManager';

export const useChartConnection = () => {
  const [connectionState, setConnectionState] = useState<ChartState>(ChartStateMachine.getInstance().getState());
  const [errorMessage, setErrorMessage] = useState<string | null>(ChartStateMachine.getInstance().getErrorMessage() || null);

  useEffect(() => {
    const sm = ChartStateMachine.getInstance();
    const handleStateChange = (state: ChartState, errorMsg?: string) => {
      setConnectionState(state);
      setErrorMessage(errorMsg || null);
    };

    sm.registerListener(handleStateChange);
    return () => {
      sm.unregisterListener(handleStateChange);
    };
  }, []);

  const connect = () => {
    ChartConnectionManager.getInstance().connect();
  };

  const disconnect = () => {
    ChartConnectionManager.getInstance().disconnect();
  };

  return {
    connectionState,
    errorMessage,
    connect,
    disconnect
  };
};
