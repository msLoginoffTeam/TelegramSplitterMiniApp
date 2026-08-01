import { render, screen } from '@testing-library/react';
import { App } from '@/app/App';

describe('App', () => {
  it('renders the browser shell', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: /совместные траты/i })).toBeInTheDocument();
    expect(screen.getByTestId('platform-kind')).toHaveTextContent('браузер');
  });
});
