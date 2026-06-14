import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SofaComfortVideoList } from './sofa-comfort-video-list';
import { EVENT_HOW_IT_SITS } from '@castlery/modules-tracking-services';

// ── shared-redux-store: dispatch is a no-op resolving promise ────────────────
const mockDispatch = jest.fn(() => Promise.resolve());
jest.mock('@castlery/shared-redux-store', () => ({
  useAppDispatch: () => mockDispatch,
}));

// ── tracking: EVENT_HOW_IT_SITS returns a plain action we can assert on ───────
jest.mock('@castlery/modules-tracking-services', () => ({
  EVENT_HOW_IT_SITS: jest.fn((payload: any) => ({ type: 'how_it_sits', payload })),
}));

// ── fortress: radios expose checked state; layout primitives are passthroughs ─
jest.mock('@castlery/fortress', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  return {
    __esModule: true,
    Stack: ({ children }: any) => <div>{children}</div>,
    Typography: ({ children }: any) => <div>{children}</div>,
    RadioGroup: ({ children }: any) => <div role="radiogroup">{children}</div>,
    RadioButton: ({ value, label, checked, onChange }: any) => (
      <label>
        <input
          type="radio"
          data-testid={`radio-${value}`}
          data-checked={String(!!checked)}
          value={value}
          checked={!!checked}
          onChange={() => onChange?.({ target: { value } })}
        />
        {label}
      </label>
    ),
    useBreakpoints: () => ({ desktop: true, mobile: false }),
  };
});

// ── shared-components: FortressVideo mock exposing onEnded + ref handle ────────
jest.mock('@castlery/shared-components', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  return {
    __esModule: true,
    FortressVideo: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        play: jest.fn(),
        pause: jest.fn(),
        replay: jest.fn(),
      }));
      return (
        <div
          data-testid={`video-${props.src}`}
          data-src={props.src}
          data-loop={String(!!props.loop)}
          data-autoplay={String(!!props.autoPlay)}
        >
          <button
            type="button"
            data-testid={`video-ended-${props.src}`}
            onClick={() => props.onEnded?.({ type: 'ended' })}
          >
            end {props.src}
          </button>
        </div>
      );
    }),
  };
});

const makeVideo = (persona: string) => ({
  media: { filename: `video-${persona}.mp4` },
  persona,
});

const checked = (persona: string) => screen.getByTestId(`radio-${persona}`).getAttribute('data-checked');

const endVideo = (persona: string) => fireEvent.click(screen.getByTestId(`video-ended-video-${persona}.mp4`));

beforeAll(() => {
  (global as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SofaComfortVideoList — auto-advance', () => {
  it('renders one radio per video and highlights the first on mount', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B'), makeVideo('C')]} listTitle="Comfort" />);

    expect(screen.getByTestId('radio-A')).toBeTruthy();
    expect(screen.getByTestId('radio-B')).toBeTruthy();
    expect(screen.getByTestId('radio-C')).toBeTruthy();
    expect(checked('A')).toBe('true');
    expect(checked('B')).toBe('false');
  });

  it('advances to the next video and moves the highlight when the active video ends', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B'), makeVideo('C')]} listTitle="Comfort" />);

    endVideo('A');

    expect(checked('A')).toBe('false');
    expect(checked('B')).toBe('true');
  });

  it('wraps back to the first video after the last one ends', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B'), makeVideo('C')]} listTitle="Comfort" />);

    endVideo('A'); // -> B
    endVideo('B'); // -> C
    expect(checked('C')).toBe('true');

    endVideo('C'); // wraps -> A
    expect(checked('A')).toBe('true');
  });

  it('does not fire a click-tracking event on auto-advance', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B')]} listTitle="Comfort" />);

    endVideo('A');

    const clickCall = (EVENT_HOW_IT_SITS as jest.Mock).mock.calls.find(
      ([payload]) => payload?.category === 'how_it_sits_click'
    );
    expect(clickCall).toBeUndefined();
  });

  it('manual label click switches the active video and fires click tracking; later end advances from there', async () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B'), makeVideo('C')]} listTitle="Comfort" />);

    fireEvent.click(screen.getByTestId('radio-C'));
    expect(checked('C')).toBe('true');

    await waitFor(() =>
      expect(EVENT_HOW_IT_SITS).toHaveBeenCalledWith(expect.objectContaining({ category: 'how_it_sits_click' }))
    );

    endVideo('C'); // wraps to A
    expect(checked('A')).toBe('true');
  });

  it('keeps a single video looping and does not advance on end', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A')]} listTitle="Comfort" />);

    expect(screen.getByTestId('video-video-A.mp4').getAttribute('data-loop')).toBe('true');

    endVideo('A');
    expect(checked('A')).toBe('true');
  });

  it('ignores onEnded from a non-active video (stale guard)', () => {
    render(<SofaComfortVideoList videoList={[makeVideo('A'), makeVideo('B'), makeVideo('C')]} listTitle="Comfort" />);

    endVideo('A'); // -> B
    expect(checked('B')).toBe('true');

    // A is no longer active; its onEnded should be ignored
    endVideo('A');
    expect(checked('B')).toBe('true');
  });
});
