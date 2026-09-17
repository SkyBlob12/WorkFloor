import { act, renderHook } from '@testing-library/react-native';

import { useReviewForm } from '@hooks/useReviewForm';
import { useSubmitReview } from '@hooks/useReviewMutations';
import { emptyDraft } from '@utils/reviewRules';
import type { OwnReview } from '@app-types/domain';

jest.mock('@hooks/useReviewMutations', () => ({ useSubmitReview: jest.fn() }));

const mutate = jest.fn();
jest.mocked(useSubmitReview).mockReturnValue({ mutate, isPending: false } as unknown as ReturnType<
  typeof useSubmitReview
>);

async function renderForm(initialReview: OwnReview | null = null) {
  return renderHook(() => useReviewForm({ companyId: 'company-1', initialReview }));
}

async function fillValidReview(form: { current: ReturnType<typeof useReviewForm> }) {
  await act(async () => {
    form.current.update('rating_overall', 4);
    form.current.update('title', 'Bonne équipe');
    form.current.update('pros', 'Des collègues bienveillants et des missions variées.');
    form.current.update('cons', 'Des process parfois lourds et peu de télétravail.');
    form.current.setAttested(true);
  });
}

describe('useReviewForm', () => {
  beforeEach(() => mutate.mockClear());

  it('bloque l’envoi et expose les erreurs de validation', async () => {
    const { result } = await renderForm();
    await act(async () => result.current.submit());
    expect(result.current.formError).toEqual({ type: 'validation' });
    expect(result.current.errors.title).toEqual({ key: 'required' });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('exige l’attestation sur l’honneur, puis efface l’erreur une fois cochée', async () => {
    const { result } = await renderForm();
    await fillValidReview(result);
    await act(async () => result.current.setAttested(false));
    await act(async () => result.current.submit());
    expect(result.current.formError).toEqual({ type: 'validation' });
    expect(result.current.attestationError).toEqual({ key: 'attestationRequired' });
    expect(mutate).not.toHaveBeenCalled();

    await act(async () => result.current.setAttested(true));
    expect(result.current.attestationError).toBeUndefined();
  });

  it('envoie l’avis puis expose le statut renvoyé', async () => {
    const { result } = await renderForm();
    await fillValidReview(result);
    await act(async () => {
      result.current.setSalaryText('42 000');
      result.current.update('salary_period', 'year');
    });
    await act(async () => result.current.submit());

    expect(mutate).toHaveBeenCalledTimes(1);
    const [variables, callbacks] = mutate.mock.calls[0];
    expect(variables).toMatchObject({
      companyId: 'company-1',
      reviewId: null,
      attested: true,
      draft: { salary_amount: 42000, salary_period: 'year' },
    });

    const response = { id: 'r1', status: 'pending', hold_reason: 'new_account' };
    await act(async () => callbacks.onSuccess(response));
    expect(result.current.result).toEqual(response);
  });

  it('pré-remplit le formulaire en mode édition', async () => {
    const existing = { ...emptyDraft(), id: 'r1', title: 'Ancien titre', salary_amount: 30000 } as unknown as OwnReview;
    const { result } = await renderForm(existing);
    expect(result.current.isEdit).toBe(true);
    expect(result.current.draft.title).toBe('Ancien titre');
    expect(result.current.salaryText).toBe('30000');
    expect(result.current.attested).toBe(false);
  });

  it('envoie le SIRET du site choisi, ou null sans site', async () => {
    const { result } = await renderForm();
    await fillValidReview(result);
    await act(async () => result.current.submit());
    expect(mutate.mock.calls[0][0]).toMatchObject({ siteSiret: null });

    await act(async () => result.current.setSite({ siret: '45132133500437', city: 'LYON', postalCode: '69003' }));
    await act(async () => result.current.submit());
    expect(mutate.mock.calls[1][0]).toMatchObject({ siteSiret: '45132133500437' });
  });

  it('reprend le site d’un avis existant', async () => {
    const existing = {
      ...emptyDraft(),
      id: 'r1',
      site_id: 's1',
      site: { siret: '45132133500437', city: 'LYON', postal_code: '69003' },
    } as unknown as OwnReview;
    const { result } = await renderForm(existing);
    expect(result.current.site).toEqual({ siret: '45132133500437', city: 'LYON', postalCode: '69003' });
  });
});
