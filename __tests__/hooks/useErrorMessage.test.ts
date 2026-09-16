import { renderHook } from '@testing-library/react-native';

import { useErrorMessage } from '@hooks/useErrorMessage';
import { ServiceError } from '@services/errors';

describe('useErrorMessage', () => {
  it('traduit un code de service et retombe sur UNKNOWN sinon', async () => {
    const { result } = await renderHook(() => useErrorMessage());
    expect(result.current(new ServiceError('ALREADY_REPORTED'))).toBe('Vous avez déjà signalé cet avis.');
    expect(result.current(new Error('boom'))).toBe('Une erreur est survenue. Réessayez.');
  });
});
