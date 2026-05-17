import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  DEV_TOOLS_BAR_HIDDEN_DEFAULT,
  DEV_TOOLS_ENABLED,
} from '../constants/dev';

const STORAGE_KEY = '@foolish-you/dev-tools-bar-visible';

export const DEV_TOOLS_BAR_HEIGHT = 36;

type DevToolsUiContextValue = {
  ready: boolean;
  /** 底部 DEV 调试条是否显示（截图时可关闭） */
  barVisible: boolean;
  hideBar: () => void;
  showBar: () => void;
  toggleBar: () => void;
};

const DevToolsUiContext = createContext<DevToolsUiContextValue | null>(null);

async function readBarVisible(): Promise<boolean> {
  if (!DEV_TOOLS_ENABLED) return false;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === '0') return false;
    if (raw === '1') return true;
  } catch {
    // ignore
  }
  return !DEV_TOOLS_BAR_HIDDEN_DEFAULT;
}

async function writeBarVisible(visible: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, visible ? '1' : '0');
}

export function DevToolsUiProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!DEV_TOOLS_ENABLED);
  const [barVisible, setBarVisible] = useState(
    DEV_TOOLS_ENABLED ? !DEV_TOOLS_BAR_HIDDEN_DEFAULT : false,
  );

  useEffect(() => {
    if (!DEV_TOOLS_ENABLED) return;
    let cancelled = false;
    void (async () => {
      const visible = await readBarVisible();
      if (!cancelled) {
        setBarVisible(visible);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setVisible = useCallback((visible: boolean) => {
    setBarVisible(visible);
    if (DEV_TOOLS_ENABLED) {
      void writeBarVisible(visible);
    }
  }, []);

  const hideBar = useCallback(() => setVisible(false), [setVisible]);
  const showBar = useCallback(() => setVisible(true), [setVisible]);
  const toggleBar = useCallback(() => {
    setBarVisible((prev) => {
      const next = !prev;
      if (DEV_TOOLS_ENABLED) void writeBarVisible(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      ready,
      barVisible: DEV_TOOLS_ENABLED && barVisible,
      hideBar,
      showBar,
      toggleBar,
    }),
    [ready, barVisible, hideBar, showBar, toggleBar],
  );

  return (
    <DevToolsUiContext.Provider value={value}>{children}</DevToolsUiContext.Provider>
  );
}

export function useDevToolsUi(): DevToolsUiContextValue {
  const ctx = useContext(DevToolsUiContext);
  if (ctx == null) {
    return {
      ready: true,
      barVisible: false,
      hideBar: () => {},
      showBar: () => {},
      toggleBar: () => {},
    };
  }
  return ctx;
}

/** 为底部 DEV 条预留的安全区内边距（截图隐藏时为 0） */
export function useDevBottomInset(base: number): number {
  const { barVisible } = useDevToolsUi();
  return base + (barVisible ? DEV_TOOLS_BAR_HEIGHT : 0);
}
