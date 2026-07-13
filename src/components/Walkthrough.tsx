import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isIntegrationsEnabled, INTEGRATIONS_EVENT } from '../lib/integrations';
import { getApplicableSteps, isElementVisible } from '../lib/walkthrough';
import type { WalkthroughStep } from '../lib/walkthrough';

export default function Walkthrough() {
  const [navEl, setNavEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<WalkthroughStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [integrationsEnabled, setIntegrationsEnabled] = useState(true);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNavEl(document.querySelector('.site-header__nav'));
    setIntegrationsEnabled(isIntegrationsEnabled());

    const handler = (e: Event) => {
      setIntegrationsEnabled((e as CustomEvent<{ enabled: boolean }>).detail.enabled);
    };
    document.addEventListener(INTEGRATIONS_EVENT, handler);
    return () => document.removeEventListener(INTEGRATIONS_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') advance();
      if (e.key === 'ArrowLeft') retreat();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, steps, stepIndex]);

  useEffect(() => {
    if (!open) return;
    const step = steps[stepIndex];
    if (!step) return;

    const el = document.querySelector(step.selector);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    function recompute() {
      const el2 = document.querySelector(step.selector);
      setTargetRect(el2 && isElementVisible(el2) ? el2.getBoundingClientRect() : null);
    }
    recompute();
    window.addEventListener('scroll', recompute, true);
    window.addEventListener('resize', recompute);
    const interval = setInterval(recompute, 400);
    return () => {
      window.removeEventListener('scroll', recompute, true);
      window.removeEventListener('resize', recompute);
      clearInterval(interval);
    };
  }, [open, stepIndex, steps, integrationsEnabled]);

  useLayoutEffect(() => {
    const popupEl = popupRef.current;
    if (!open || !popupEl) return;
    const margin = 16;
    const pw = popupEl.offsetWidth;
    const ph = popupEl.offsetHeight;

    if (!targetRect) {
      setPopupPos({
        top: Math.max(margin, (window.innerHeight - ph) / 2),
        left: Math.max(margin, (window.innerWidth - pw) / 2),
      });
      return;
    }

    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    let top = spaceBelow >= ph + margin || spaceBelow >= spaceAbove
      ? targetRect.bottom + margin
      : targetRect.top - ph - margin;
    top = Math.max(margin, Math.min(top, window.innerHeight - ph - margin));

    let left = Math.max(margin, Math.min(targetRect.left, window.innerWidth - pw - margin));

    setPopupPos({ top, left });
  }, [open, targetRect, stepIndex]);

  function start() {
    const applicable = getApplicableSteps();
    if (applicable.length === 0) return;
    setSteps(applicable);
    setStepIndex(0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  function advance() {
    setStepIndex((i) => {
      if (i >= steps.length - 1) {
        setOpen(false);
        return i;
      }
      return i + 1;
    });
  }

  function retreat() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const step = steps[stepIndex];

  return (
    <>
      {navEl &&
        createPortal(
          <button
            type="button"
            className={`walkthrough-trigger ${open ? 'walkthrough-trigger--active' : ''}`}
            onClick={open ? close : start}
            aria-pressed={open}
            aria-label={open ? 'End tour' : 'Take a tour'}
            title={open ? 'End tour' : 'Take a tour'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 5" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>,
          navEl
        )}

      {open && step && (
        <>
          {targetRect ? (
            <div
              className="walkthrough-highlight"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
            />
          ) : (
            <div className="walkthrough-scrim" onClick={close} />
          )}

          <div className="walkthrough-popup" ref={popupRef} style={popupPos} role="dialog" aria-modal="true" aria-label={step.title}>
            <div className="walkthrough-popup__header">
              <span className="walkthrough-popup__step">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <button className="walkthrough-popup__close" onClick={close} aria-label="End tour">
                ×
              </button>
            </div>
            <h3 className="walkthrough-popup__title">{step.title}</h3>
            <p className="walkthrough-popup__message">
              {integrationsEnabled ? step.messageOn : step.messageOff}
            </p>
            <div className="walkthrough-popup__nav">
              <button className="btn btn--outline walkthrough-popup__back" onClick={retreat} disabled={stepIndex === 0}>
                Back
              </button>
              <div className="walkthrough-popup__dots">
                {steps.map((s, i) => (
                  <span key={s.id} className={`walkthrough-dot ${i === stepIndex ? 'walkthrough-dot--active' : ''}`} />
                ))}
              </div>
              <button className="btn btn--primary walkthrough-popup__next" onClick={advance}>
                {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
