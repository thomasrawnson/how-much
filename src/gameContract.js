export const QUESTION_COUNT = 5;
export const MAX_SCORE_PER_QUESTION = 100;
export const MAX_TOTAL_SCORE = QUESTION_COUNT * MAX_SCORE_PER_QUESTION;

export const CONTENT_POLICY = Object.freeze({
  priceSource: 'authored-static-fixture',
  liveRetailerApi: false,
  retailerScraping: false,
  permittedImageAsset: 'generic-original',
  retailerOrManufacturerAssets: false,
});

export const PROTOTYPE_ITEMS = Object.freeze([
  { id: 'milk', retailer: 'Tesco', name: 'Tesco British Semi Skimmed Milk 2.272L', pack: '2.272L', pricePence: 189, checkedDate: '2026-10-03', image: 'generic' },
  { id: 'bread', retailer: 'Tesco', name: 'Tesco Medium Sliced White Bread 800g', pack: '800g', pricePence: 125, checkedDate: '2026-10-03', image: 'generic' },
  { id: 'eggs', retailer: 'Tesco', name: 'Tesco Free Range Eggs 6 Pack', pack: '6 pack', pricePence: 210, checkedDate: '2026-10-03', image: 'generic' },
  { id: 'bananas', retailer: 'Tesco', name: 'Tesco Fairtrade Bananas 5 Pack', pack: '5 pack', pricePence: 150, checkedDate: '2026-10-03', image: 'generic' },
  { id: 'crisps', retailer: 'Tesco', name: 'Tesco Ready Salted Crisps 6 Pack', pack: '6 pack', pricePence: 175, checkedDate: '2026-10-03', image: 'generic' },
]);

export function validatePrototypeItems(items = PROTOTYPE_ITEMS) {
  if (!Array.isArray(items) || items.length !== QUESTION_COUNT) throw new Error('Prototype must contain exactly five questions');
  if (items.some((item) => item.retailer !== 'Tesco' || item.image !== 'generic' || !item.pack || !item.checkedDate || !Number.isInteger(item.pricePence) || item.pricePence <= 0)) {
    throw new Error('Prototype items must be complete Tesco records with positive integer pence');
  }
  return true;
}

export function scoreAnswer(guessPence, actualPence) {
  if (!Number.isInteger(guessPence) || !Number.isInteger(actualPence) || actualPence <= 0) throw new TypeError('Answers must be integer pence');
  const error = Math.abs(guessPence - actualPence);
  return Math.max(0, Math.min(MAX_SCORE_PER_QUESTION, Math.round(MAX_SCORE_PER_QUESTION * (1 - error / actualPence))));
}

export function scoreResults(guesses, items = PROTOTYPE_ITEMS) {
  validatePrototypeItems(items);
  if (!Array.isArray(guesses) || guesses.length !== QUESTION_COUNT) throw new Error('Score only complete five-question results');
  return Math.min(MAX_TOTAL_SCORE, guesses.reduce((total, guess, index) => total + scoreAnswer(guess, items[index].pricePence), 0));
}

export function revealResults(answeredQuestionCount, guesses, items = PROTOTYPE_ITEMS) {
  if (!Number.isInteger(answeredQuestionCount) || answeredQuestionCount < 0 || answeredQuestionCount > QUESTION_COUNT) {
    throw new TypeError('Answered question count must be an integer from zero to five');
  }
  return answeredQuestionCount === QUESTION_COUNT ? scoreResults(guesses, items) : null;
}

validatePrototypeItems();
