import React, { createContext, useContext, useState, useEffect } from 'react';
import { BoardTheme, getBoardTheme, DEFAULT_BOARD_THEME_ID } from '../theme/boardThemes';
import { loadSettings, updateSetting } from '../utils/settingsStorage';

interface BoardThemeContextType {
  boardTheme: BoardTheme;
  setBoardTheme: (id: string) => Promise<void>;
}

const BoardThemeContext = createContext<BoardThemeContextType | undefined>(undefined);

export function BoardThemeProvider({ children }: { children: React.ReactNode }) {
  const [boardTheme, setBoardThemeState] = useState<BoardTheme>(
    getBoardTheme(DEFAULT_BOARD_THEME_ID)
  );

  useEffect(() => {
    loadSettings().then(settings => {
      setBoardThemeState(getBoardTheme(settings.boardTheme ?? DEFAULT_BOARD_THEME_ID));
    });
  }, []);

  const setBoardTheme = async (id: string) => {
    await updateSetting('boardTheme', id);
    setBoardThemeState(getBoardTheme(id));
  };

  return (
    <BoardThemeContext.Provider value={{ boardTheme, setBoardTheme }}>
      {children}
    </BoardThemeContext.Provider>
  );
}

export function useBoardTheme() {
  const context = useContext(BoardThemeContext);
  if (context === undefined) {
    throw new Error('useBoardTheme must be used within a BoardThemeProvider');
  }
  return context;
}
