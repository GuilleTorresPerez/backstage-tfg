import { render } from '@testing-library/react';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';

describe('DESY wordmark logos', () => {
  it('LogoFull renders the expanded wordmark svg', () => {
    const { container } = render(<LogoFull />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 144 32');
    expect(svg?.getAttribute('aria-label')).toBe(
      'Ir a la página de inicio de la aplicación',
    );
  });

  it('LogoIcon renders the mini wordmark svg', () => {
    const { container } = render(<LogoIcon />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 32 32');
    expect(svg?.getAttribute('aria-label')).toBe(
      'Ir a la página de inicio de la aplicación',
    );
  });

  it('neither logo carries the Backstage default fill #7df3e1', () => {
    const full = render(<LogoFull />).container.innerHTML;
    const icon = render(<LogoIcon />).container.innerHTML;
    expect(full.toLowerCase()).not.toContain('#7df3e1');
    expect(icon.toLowerCase()).not.toContain('#7df3e1');
  });

  it('LogoFull text glyph fill is white, not the starter near-black', () => {
    // Derived value: starter ships the text in #161615 (near-black). On the
    // dark-blue sidebar that fails WCAG AA; we override to #ffffff.
    // See docs/desy-tokens.md → "Wordmark text fill — derived value".
    const html = render(<LogoFull />).container.innerHTML.toLowerCase();
    expect(html).toContain('#ffffff');
    expect(html).not.toContain('#161615');
  });
});
