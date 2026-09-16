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

  it('attend le jeton anti-robot', async () => {
    const { result } = await renderForm();
    await fillValidReview(result);
    await act(async () => result.current.submit());
    expect(result.current.formError).toEqual({ type: 'captcha' });
  });

  it('envoie l’avis puis expose le statut renvoyé', async () => {
    const { result } = await renderForm();
    await fillValidReview(result);
    await act(async () => {
      result.current.onCaptchaToken('token');
      result.current.setSalaryText('42 000');
      result.current.update('salary_period', 'year');
    });
    await act(async () => result.current.submit());

    expect(mutate).toHaveBeenCalledTimes(1);
    const [variables, callbacks] = mutate.mock.calls[0];
    expect(variables).toMatchObject({
      companyId: 'company-1',
      reviewId: null,
      captchaToken: 'token',
      draft: { salary_amount: 42000, salary_period: 'year' },
    });

    await act(async () => {
      callbacks.onSuccess({ id: 'r1', status: 'pending' });
      callbacks.onSettled();
    });
    expect(result.current.result).toBe('pending');
    expect(result.current.captchaKey).toBe(1);
  });

  it('pré-remplit le formulaire en mode édition', async () => {
    const existing = { ...emptyDraft(), id: 'r1', title: 'Ancien titre', salary_amount: 30000 } as unknown as OwnReview;
    const { result } = await renderForm(existing);
    expect(result.current.isEdit).toBe(true);
    expect(result.current.draft.title).toBe('Ancien titre');
    expect(result.current.salaryText).toBe('30000');
  });
});
