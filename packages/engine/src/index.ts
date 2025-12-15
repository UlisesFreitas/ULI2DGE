/**
 * Uli2dGE Engine
 *
 * @package @uli2dge/engine
 */
export const ENGINE_VERSION = '0.1.0';

export function getEngineGreeting(): string {
  const message = `Welcome to Uli2dGE Engine v${ENGINE_VERSION}!`;
  return message;
}

export { Renderer } from './Renderer';
export { GameObject } from './GameObject';
export { Scene } from './Scene';