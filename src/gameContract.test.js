import { describe, expect, it } from 'vitest';
import {
  CONTENT_POLICY,
  MAX_SCORE_PER_QUESTION,
  MAX_TOTAL_SCORE,
  PROTOTYPE_ITEMS,
  QUESTION_COUNT,
  revealResults,
  scoreAnswer,
  scoreResults,
  validatePrototypeItems,
} from './gameContract.js';

describe('prototype scoring contract', () => {
  it('locks the exact five Tesco fixture values', () => {
    expect(PROTOTYPE_ITEMS).toHaveLength(QUESTION_COUNT);
    expect(PROTOTYPE_ITEMS).toEqual([
      { id: 'milk', retailer: 'Tesco', name: 'Tesco British Semi Skimmed Milk 2.272L', pack: '2.272L', pricePence: 189, checkedDate: '2026-10-03', image: 'generic' },
      { id: 'bread', retailer: 'Tesco', name: 'Tesco Medium Sliced White Bread 800g', pack: '800g', pricePence: 125, checkedDate: '2026-10-03', image: 'generic' },
      { id: 'eggs', retailer: 'Tesco', name: 'Tesco Free Range Eggs 6 Pack', pack: '6 pack', pricePence: 210, checkedDate: '2026-10-03', image: 'generic' },
      { id: 'bananas', retailer: 'Tesco', name: 'Tesco Fairtrade Bananas 5 Pack', pack: '5 pack', pricePence: 150, checkedDate: '2026-10-03', image: 'generic' },
      { id: 'crisps', retailer: 'Tesco', name: 'Tesco Ready Salted Crisps 6 Pack', pack: '6 pack', pricePence: 175, checkedDate: '2026-10-03', image: 'generic' },
    ]);
  });

  it('enforces exactly five complete questions', () => {
    expect(validatePrototypeItems()).toBe(true);
    expect(() => validatePrototypeItems([...PROTOTYPE_ITEMS, { pricePence: 1 }])).toThrow();
    expect(() => validatePrototypeItems(PROTOTYPE_ITEMS.slice(0, 4))).toThrow();
  });

  it('awards 100 for an exact guess and rounds with Math.round', () => {
    expect(scoreAnswer(189, 189)).toBe(100);
    expect(scoreAnswer(190, 189)).toBe(99);
    expect(scoreAnswer(201, 200)).toBe(100);
  });

  it('floors large errors at zero and caps question and total scores', () => {
    expect(scoreAnswer(0, 189)).toBe(0);
    expect(scoreAnswer(99999, 189)).toBe(0);
    expect(scoreAnswer(189, 189)).toBe(MAX_SCORE_PER_QUESTION);
    expect(scoreResults(PROTOTYPE_ITEMS.map(({ pricePence }) => pricePence))).toBe(MAX_TOTAL_SCORE);
    expect(MAX_TOTAL_SCORE).toBe(500);
  });

  it('accepts only positive integer-pence actuals and integer-pence guesses', () => {
    expect(PROTOTYPE_ITEMS.every(({ pricePence }) => Number.isInteger(pricePence) && pricePence > 0)).toBe(true);
    expect(() => scoreAnswer(189.5, 189)).toThrow(/integer pence/);
    expect(() => scoreAnswer(189, 189.5)).toThrow(/integer pence/);
    expect(() => scoreAnswer(189, 0)).toThrow(/integer pence/);
    expect(() => validatePrototypeItems(PROTOTYPE_ITEMS.map((item, index) => index ? item : { ...item, pricePence: 1.5 }))).toThrow(/integer pence/);
  });

  it('reveals correct answers only after all five questions', () => {
    const exactGuesses = PROTOTYPE_ITEMS.map(({ pricePence }) => pricePence);
    expect(revealResults(0, [])).toBeNull();
    expect(revealResults(4, exactGuesses.slice(0, 4))).toBeNull();
    expect(() => scoreResults([189])).toThrow();
    expect(revealResults(5, exactGuesses)).toBe(500);
    expect(() => revealResults(5.5, exactGuesses)).toThrow(/integer/);
  });

  it('prohibits live retailer integrations and branded image assets', () => {
    expect(CONTENT_POLICY).toEqual({
      priceSource: 'authored-static-fixture',
      liveRetailerApi: false,
      retailerScraping: false,
      permittedImageAsset: 'generic-original',
      retailerOrManufacturerAssets: false,
    });
    expect(PROTOTYPE_ITEMS.every(({ image }) => image === 'generic')).toBe(true);
    expect(() => validatePrototypeItems(PROTOTYPE_ITEMS.map((item, index) => index ? item : { ...item, image: 'tesco-product-photo' }))).toThrow();
  });
});
