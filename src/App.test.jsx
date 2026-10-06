import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('app shell', () => {
  it('shows the coming-soon message', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /guess the price/i })).toBeTruthy();
  });
});
