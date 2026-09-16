import { isLegalDoc, LEGAL_DOCS } from '@constants/legal';

describe('isLegalDoc', () => {
  it('reconnaît les documents publiés', () => {
    for (const doc of LEGAL_DOCS) expect(isLegalDoc(doc)).toBe(true);
  });

  it.each(['cgu', '', undefined])('refuse %p', (value) => {
    expect(isLegalDoc(value)).toBe(false);
  });
});
