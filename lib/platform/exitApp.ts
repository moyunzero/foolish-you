import { BackHandler } from 'react-native';

/**
 * 退出应用（结果页主按钮）。
 * - Android：系统 API，可真正退出。
 * - iOS：Apple 不提供官方「程序自杀」接口；BackHandler.exitApp() 在部分环境无效，
 *   用户需自行上滑回主屏幕（符合 App Store 规范）。
 */
export function exitApplication(): void {
  BackHandler.exitApp();
}
