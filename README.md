# How Much?!

A mobile-first five-price quiz prototype. This slice locks the prototype contract: five static Tesco fixture items, integer-pence prices, and a score of `round(100 * (1 - abs(guess - actual) / actual))`, bounded to 0–100 per question and 0–500 overall. Results are available only after all five answers.

Fixture data is authored and static; it uses no API, scraping, persistence, gameplay flow, or remote imagery. Future product work must verify current Tesco pricing and provide appropriately licensed imagery before release. Runtime rounding uses JavaScript `Math.round` (ties toward positive infinity).

## Local commands

Requires Node 20 and npm 10.

```sh
npm ci
npm run dev
npm run build
npm run preview
npm test
npm run lint
```
