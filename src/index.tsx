import * as React from 'react';
import { useRef, useMemo } from 'react';
import { useDrag } from 'react-use-gesture';
import { useSpring, animated, config } from 'react-spring';
import clamp from 'lodash.clamp';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

const sheetBaseStyles: React.CSSProperties = {
  position: 'fixed',
  backgroundColor: 'white',
  width: '100%',
};

function Sheet({ snapPoints = [0, 0.4, 0.8] }) {
  const height = document.documentElement.clientHeight;

  const realSnapPoints = useMemo(() => {
    return snapPoints.map(point => point * height).sort();
  }, [snapPoints, height]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [{ y }, set] = useSpring(() => ({ y: height * 0.8 }));

  const bind = useDrag(
    ({
      first,
      last,
      movement: [, my],
      vxvy: [, vy],
      memo = y.getValue(),
      cancel,
      event,
    }) => {
      event && event.preventDefault();

      let newY = memo + my;

      if (first) {
        draggingRef.current = true;

        sheetRef.current && disableBodyScroll(sheetRef.current);
      }
      // if this is not the first or last frame, it's a moving frame
      // then it means the user is dragging
      else if (last) {
        draggingRef.current = false;

        clearAllBodyScrollLocks();
      }
      // adds friction when dragging the sheet upward
      // the more the user drags up, the more friction
      if (newY < 0) newY = newY / (1 - newY * 0.005);

      // if the user drags up passed a threshold, then we cancel
      // the drag so that the sheet resets to its open position
      if (newY < -120 && cancel) {
        cancel();
      }
      if (last) {
        const [closestSnapPoint] = realSnapPoints.reduce(
          ([prev, prevDiff], point) => {
            const diff = Math.abs(point - newY);

            if (prevDiff > diff) {
              return [point, diff];
            }

            return [prev, prevDiff];
          },
          [height, height]
        );

        set({ y: closestSnapPoint, config: { ...config.stiff, velocity: vy } });
      } else {
        set({
          y: clamp(newY, -200, height),
          immediate: false,
          config: config.stiff,
        });
      }

      return memo;
    },
    {
      event: {
        passive: false,
      },
    }
  );

  return (
    <animated.div
      ref={sheetRef}
      {...bind()}
      style={{
        ...sheetBaseStyles,
        height,
        transform: y.interpolate(y => `translateY(${y}px)`),
      }}
    >
      Sheet
    </animated.div>
  );
}

export default Sheet;
