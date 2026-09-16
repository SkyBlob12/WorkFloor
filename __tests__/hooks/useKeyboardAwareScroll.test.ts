import { Keyboard, type KeyboardEvent, type ScrollView } from 'react-native';

import { act, renderHook } from '@testing-library/react-native';

import { useKeyboardAwareScroll } from '@hooks/useKeyboardAwareScroll';

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

type Listener = (event: KeyboardEvent) => void;

function measurable(y: number, height: number) {
  return { measureInWindow: jest.fn((callback: (x: number, y: number, w: number, h: number) => void) => callback(0, y, 390, height)) };
}

function keyboardEvent(screenY: number): KeyboardEvent {
  return { endCoordinates: { screenX: 0, screenY, width: 390, height: 800 - screenY } } as KeyboardEvent;
}

describe('useKeyboardAwareScroll', () => {
  const listeners = new Map<string, Listener>();

  beforeEach(() => {
    listeners.clear();
    jest.spyOn(Keyboard, 'addListener').mockImplementation((name, listener) => {
      listeners.set(name, listener as Listener);
      return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('réserve la place du clavier et centre le champ actif', async () => {
    const { result } = await renderHook(() => useKeyboardAwareScroll());
    const scroll = { getNativeScrollRef: () => measurable(0, 800), scrollTo: jest.fn() };
    result.current.scrollRef.current = scroll as unknown as ScrollView;

    await act(async () => result.current.reveal(measurable(600, 50)));
    expect(scroll.scrollTo).not.toHaveBeenCalled();

    await act(async () => listeners.get('keyboardWillShow')?.(keyboardEvent(500)));
    // Recouvrement 300 + demi-zone visible 250.
    expect(result.current.bottomInset).toBe(550);
    // Centre du champ 625, centre visible 250.
    expect(scroll.scrollTo).toHaveBeenLastCalledWith({ y: 375, animated: true });

    await act(async () => listeners.get('keyboardWillHide')?.(keyboardEvent(800)));
    expect(result.current.bottomInset).toBe(0);
  });

  it('recentre directement en changeant de champ clavier ouvert', async () => {
    const { result } = await renderHook(() => useKeyboardAwareScroll());
    const scroll = { getNativeScrollRef: () => measurable(0, 800), scrollTo: jest.fn() };
    result.current.scrollRef.current = scroll as unknown as ScrollView;

    await act(async () => listeners.get('keyboardWillShow')?.(keyboardEvent(500)));
    await act(async () => result.current.reveal(measurable(300, 50)));
    expect(scroll.scrollTo).toHaveBeenLastCalledWith({ y: 75, animated: true });
  });
});
