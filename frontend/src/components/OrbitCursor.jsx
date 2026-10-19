
import { useEffect, useRef } from 'react';

export default function OrbitCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) return;

    const pointerQuery = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    );

    const motionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    let frameId = null;
    let mouseX = -100;
    let mouseY = -100;
    let visible = false;
    let clickTimer = null;

    const moveCursor = () => {
      frameId = null;

      cursor.style.transform =
        `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      cursor.style.opacity = visible ? '1' : '0';
    };

    const onMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      visible = true;

      if (frameId === null) {
        frameId = requestAnimationFrame(moveCursor);
      }
    };

    const onMouseLeave = () => {
      visible = false;
      cursor.style.opacity = '0';
    };

    const onMouseEnter = () => {
      visible = true;
      cursor.style.opacity = '1';
    };

    const onPointerOver = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const interactive = target.closest(
        'a, button, [role="button"], input[type="submit"], ' +
        'input[type="button"], .cursor-interactive'
      );

      cursor.classList.toggle('is-hovering', Boolean(interactive));
    };

    const onPointerOut = (event) => {
      if (!event.relatedTarget) {
        cursor.classList.remove('is-hovering');
      }
    };

    const onClick = () => {
      cursor.classList.remove('is-clicking');

      // Restart the click animation.
      void cursor.offsetWidth;
      cursor.classList.add('is-clicking');

      window.clearTimeout(clickTimer);

      clickTimer = window.setTimeout(() => {
        cursor.classList.remove('is-clicking');
      }, 450);
    };

    const enableCursor = () => {
      if (!pointerQuery.matches) {
        document.body.classList.remove('orbit-cursor-enabled');
        cursor.style.display = 'none';
        return;
      }

      cursor.style.display = 'block';
      document.body.classList.add('orbit-cursor-enabled');

      window.addEventListener('mousemove', onMouseMove, {
        passive: true,
      });
      document.addEventListener('mouseover', onPointerOver);
      document.addEventListener('mouseout', onPointerOut);
      document.addEventListener('click', onClick);
      document.documentElement.addEventListener(
        'mouseleave',
        onMouseLeave
      );
      document.documentElement.addEventListener(
        'mouseenter',
        onMouseEnter
      );
    };

    const disableCursor = () => {
      document.body.classList.remove('orbit-cursor-enabled');

      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onPointerOver);
      document.removeEventListener('mouseout', onPointerOut);
      document.removeEventListener('click', onClick);

      document.documentElement.removeEventListener(
        'mouseleave',
        onMouseLeave
      );
      document.documentElement.removeEventListener(
        'mouseenter',
        onMouseEnter
      );

      cursor.style.display = 'none';
      cursor.classList.remove('is-hovering', 'is-clicking');
    };

    enableCursor();

    pointerQuery.addEventListener('change', () => {
      disableCursor();
      enableCursor();
    });

    const handleReducedMotion = () => {
      cursor.classList.toggle(
        'reduced-motion',
        motionQuery.matches
      );
    };

    handleReducedMotion();
    motionQuery.addEventListener('change', handleReducedMotion);

    return () => {
      disableCursor();

      pointerQuery.removeEventListener('change', enableCursor);
      motionQuery.removeEventListener(
        'change',
        handleReducedMotion
      );

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      window.clearTimeout(clickTimer);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="orbit-cursor"
      aria-hidden="true"
    >
      <span className="orbit-cursor__ring">
        <span className="orbit-cursor__satellite" />
      </span>

      <span className="orbit-cursor__core" />

      <span className="orbit-cursor__ripple" />
    </div>
  );
}
