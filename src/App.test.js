import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the useInitCryptoCasino hook
jest.mock('./lib/crypto-casino/useInitCryptoCasino', () => ({
  useInitCryptoCasino: jest.fn()
}));

import { useInitCryptoCasino } from './lib/crypto-casino/useInitCryptoCasino';

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading message when casino is loading', () => {
    useInitCryptoCasino.mockReturnValue({ isLoading: true });
    
    render(<App />);
    const loadingElement = screen.getByText(/loading casino/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('does not render loading message when casino is loaded', () => {
    useInitCryptoCasino.mockReturnValue({ isLoading: false });
    
    render(<App />);
    const loadingElement = screen.queryByText(/loading casino/i);
    expect(loadingElement).not.toBeInTheDocument();
  });

  test('renders App container with correct styles', () => {
    useInitCryptoCasino.mockReturnValue({ isLoading: false });
    
    render(<App />);
    const appContainer = screen.getByRole('main');
    expect(appContainer).toHaveClass('App');
    expect(appContainer).toHaveStyle({
      height: '500px',
      overflow: 'hidden'
    });
  });

  test('calls useInitCryptoCasino with correct parameters', () => {
    useInitCryptoCasino.mockReturnValue({ isLoading: false });
    
    render(<App />);
    
    expect(useInitCryptoCasino).toHaveBeenCalledWith(
      expect.any(Object), // ref object
      'en'
    );
  });
});
