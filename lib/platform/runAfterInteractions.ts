import { InteractionManager } from 'react-native';

/**
 * Runs heavy synchronous work after the current UI interaction / animation frame,
 * so first paint and transitions stay responsive.
 */
export function runAfterInteractions<T>(
  fn: () => T | Promise<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    InteractionManager.runAfterInteractions(() => {
      Promise.resolve(fn()).then(resolve, reject);
    });
  });
}
