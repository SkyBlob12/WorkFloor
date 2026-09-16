import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from '@hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('ne propage la valeur qu’après le délai', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'a' } },
    );
    expect(result.current).toBe('a');

    await rerender({ value: 'ab' });
    expect(result.current).toBe('a');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('ab');
  });
});
