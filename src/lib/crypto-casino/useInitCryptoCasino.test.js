import { renderHook, act } from '@testing-library/react';
import { useInitCryptoCasino } from './useInitCryptoCasino';

// Mock the asset manifest
jest.mock('./asset-manifest.json', () => ({
  files: {
    'main.js': './cs/static/js/main.e486a427.js',
    'main.css': './cs/static/css/main.7bf51d58.css'
  }
}));

describe('useInitCryptoCasino', () => {
  let mockRef;
  let mockScriptElement;
  let mockCssElement;
  let mockBody;
  let mockHead;
  let originalCreateElement;
  let originalGetElementsByTagName;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock ref
    mockRef = { current: document.createElement('div') };

    // Create mock elements
    mockScriptElement = {
      async: false,
      id: '',
      src: '',
      onload: null,
      remove: jest.fn()
    };

    mockCssElement = {
      async: false,
      id: '',
      href: '',
      rel: '',
      onload: null,
      remove: jest.fn()
    };

    // Create mock body and head
    mockBody = {
      appendChild: jest.fn()
    };

    mockHead = {
      appendChild: jest.fn()
    };

    // Mock DOM methods
    originalCreateElement = document.createElement;
    originalGetElementsByTagName = document.getElementsByTagName;

    document.createElement = jest.fn((tagName) => {
      if (tagName === 'script') {
        return mockScriptElement;
      }
      if (tagName === 'link') {
        return mockCssElement;
      }
      return originalCreateElement.call(document, tagName);
    });

    document.getElementsByTagName = jest.fn((tagName) => {
      if (tagName === 'body') {
        return [mockBody];
      }
      return originalGetElementsByTagName.call(document, tagName);
    });

    // Mock document.head
    Object.defineProperty(document, 'head', {
      value: mockHead,
      writable: true
    });

    // Mock window.cryptoCasino
    global.window.cryptoCasino = {
      init: jest.fn()
    };
  });

  afterEach(() => {
    // Restore original methods
    document.createElement = originalCreateElement;
    document.getElementsByTagName = originalGetElementsByTagName;
    delete global.window.cryptoCasino;
  });

  test('should initialize with loading state true', () => {
    const { result } = renderHook(() => useInitCryptoCasino(mockRef, 'en'));
    
    expect(result.current.isLoading).toBe(true); // Both JS and CSS are loading initially
  });

  test('should create and append script element with correct attributes', () => {
    renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    expect(document.createElement).toHaveBeenCalledWith('script');
    expect(mockScriptElement.async).toBe(true);
    expect(mockScriptElement.id).toBe('crypto-casino-script-id');
    expect(mockScriptElement.src).toBe('./cs/static/js/main.e486a427.js');
    expect(mockBody.appendChild).toHaveBeenCalledWith(mockScriptElement);
  });

  test('should create and append CSS element with correct attributes', () => {
    renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    expect(document.createElement).toHaveBeenCalledWith('link');
    expect(mockCssElement.async).toBe(true);
    expect(mockCssElement.id).toBe('crypto-casino-css-id');
    expect(mockCssElement.href).toBe('./cs/static/css/main.7bf51d58.css');
    expect(mockCssElement.rel).toBe('stylesheet');
    expect(mockHead.appendChild).toHaveBeenCalledWith(mockCssElement);
  });

  test('should update loading state when script loads', () => {
    const { result } = renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Simulate script load
    act(() => {
      mockScriptElement.onload();
    });

    // Should still be loading because CSS hasn't loaded yet
    expect(result.current.isLoading).toBe(true);
  });

  test('should update loading state when CSS loads', () => {
    const { result } = renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    // Simulate CSS load
    act(() => {
      mockCssElement.onload();
    });

    // Should still be loading because script hasn't loaded yet
    expect(result.current.isLoading).toBe(true);
  });

  test('should set loading to false when both script and CSS are loaded', () => {
    const { result } = renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Simulate both script and CSS loading
    act(() => {
      mockScriptElement.onload();
      mockCssElement.onload();
    });

    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
  });

  test('should call cryptoCasino.init when both script and CSS are loaded', () => {
    const { result } = renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    // Simulate both script and CSS loading
    act(() => {
      mockScriptElement.onload();
      mockCssElement.onload();
    });

    // Wait for the effect to run
    act(() => {
      // Force re-render to trigger the second useEffect
    });

    expect(global.window.cryptoCasino.init).toHaveBeenCalledWith(mockRef.current, 'en');
  });

  test('should call cryptoCasino.init with different language', () => {
    const { result } = renderHook(() => useInitCryptoCasino(mockRef, 'fr'));

    // Simulate both script and CSS loading
    act(() => {
      mockScriptElement.onload();
      mockCssElement.onload();
    });

    // Wait for the effect to run
    act(() => {
      // Force re-render to trigger the second useEffect
    });

    expect(global.window.cryptoCasino.init).toHaveBeenCalledWith(mockRef.current, 'fr');
  });

  test('should cleanup script and CSS elements on unmount', () => {
    const { unmount } = renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    unmount();

    expect(mockScriptElement.remove).toHaveBeenCalled();
    expect(mockCssElement.remove).toHaveBeenCalled();
  });

  test('should not call cryptoCasino.init if window.cryptoCasino is not available', () => {
    delete global.window.cryptoCasino;
    
    const { result } = renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    // Simulate both script and CSS loading
    act(() => {
      mockScriptElement.onload();
      mockCssElement.onload();
    });

    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
    
    // Should not throw an error (the hook should handle missing cryptoCasino gracefully)
    expect(() => {
      act(() => {
        // Force re-render to trigger the second useEffect
      });
    }).not.toThrow();
  });

  test('should handle ref changes', () => {
    const newRef = { current: document.createElement('div') };
    const { result, rerender } = renderHook(
      ({ ref, language }) => useInitCryptoCasino(ref, language),
      { initialProps: { ref: mockRef, language: 'en' } }
    );

    // Simulate both script and CSS loading
    act(() => {
      mockScriptElement.onload();
      mockCssElement.onload();
    });

    // Change ref
    rerender({ ref: newRef, language: 'en' });

    act(() => {
      // Force re-render to trigger the second useEffect
    });

    expect(global.window.cryptoCasino.init).toHaveBeenCalledWith(newRef.current, 'en');
  });

  test('should handle language changes', () => {
    const { result, rerender } = renderHook(
      ({ ref, language }) => useInitCryptoCasino(ref, language),
      { initialProps: { ref: mockRef, language: 'en' } }
    );

    // Simulate both script and CSS loading
    act(() => {
      mockScriptElement.onload();
      mockCssElement.onload();
    });

    // Change language
    rerender({ ref: mockRef, language: 'es' });

    act(() => {
      // Force re-render to trigger the second useEffect
    });

    expect(global.window.cryptoCasino.init).toHaveBeenCalledWith(mockRef.current, 'es');
  });

  test('should handle script loading before CSS', () => {
    const { result } = renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Load script first
    act(() => {
      mockScriptElement.onload();
    });

    // Still loading because CSS hasn't loaded
    expect(result.current.isLoading).toBe(true);

    // Now load CSS
    act(() => {
      mockCssElement.onload();
    });

    // Now should be done loading
    expect(result.current.isLoading).toBe(false);
  });

  test('should handle CSS loading before script', () => {
    const { result } = renderHook(() => useInitCryptoCasino(mockRef, 'en'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Load CSS first
    act(() => {
      mockCssElement.onload();
    });

    // Still loading because script hasn't loaded
    expect(result.current.isLoading).toBe(true);

    // Now load script
    act(() => {
      mockScriptElement.onload();
    });

    // Now should be done loading
    expect(result.current.isLoading).toBe(false);
  });

  test('should handle null ref gracefully', () => {
    const nullRef = { current: null };
    
    expect(() => {
      renderHook(() => useInitCryptoCasino(nullRef, 'en'));
    }).not.toThrow();
  });
});