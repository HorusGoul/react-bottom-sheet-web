import React, {
  useRef,
  useMemo,
  useLayoutEffect,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useDrag } from 'react-use-gesture';
import { useSpring, animated, config } from 'react-spring';
import clamp from 'lodash.clamp';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import './styles.css';

export interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  snapPoints?: number[];
  minimumVisibleHeight?: number;
  initialSnapPoint?: number;
  dragDelay?: number | boolean;
  scrollRef?: React.RefObject<HTMLElement>;
}

function Sheet(
  {
    snapPoints = [0, 0.7],
    initialSnapPoint,
    children,
    style,
    minimumVisibleHeight = 0,
    dragDelay = false,
    scrollRef,
    ...props
  }: SheetProps,
  ref: React.Ref<HTMLDivElement | null>
) {
  const [height, setHeight] = useState(
    () => document.documentElement.clientHeight
  );

  const realSnapPoints = useMemo(() => {
    return snapPoints.map(point => point * height).sort();
  }, [snapPoints, height]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dragInsideScrollRef = useRef(false);
  const [{ y }, set] = useSpring(() => {
    const snapPoint = initialSnapPoint
      ? initialSnapPoint
      : snapPoints[snapPoints.length - 1];

    return {
      y: height * snapPoint,
    };
  });

  useEffect(() => {
    const listener = () => setHeight(document.documentElement.clientHeight);

    window.addEventListener('resize', listener);

    return () => window.removeEventListener('resize', listener);
  }, []);

  useLayoutEffect(() => {
    sheetRef.current && disableBodyScroll(sheetRef.current);

    return () => {
      clearAllBodyScrollLocks();
    };
  }, []);

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
      if (!event) {
        return memo;
      }

      const nativeEvent = (event as any) as Event;

      if (first) {
        draggingRef.current = true;

        const fromElement = nativeEvent.srcElement || nativeEvent.target;

        if (scrollRef && scrollRef.current) {
          const path = pathUntilElement(
            fromElement as HTMLElement,
            sheetRef.current as HTMLElement
          );

          dragInsideScrollRef.current = path.includes(scrollRef.current);
        } else {
          dragInsideScrollRef.current = false;
        }
      } else if (last) {
        draggingRef.current = false;
      }

      let newY = memo + my;
      let applyFriction = true;
      const isInsideScroll = dragInsideScrollRef.current;

      if (isInsideScroll && scrollRef && scrollRef.current) {
        const scrollElement = scrollRef.current;

        if (my > 0) {
          // Down

          if (scrollElement.scrollTop !== 0) {
            // Prevent downwards movement from executing until
            // the scroll reaches the top
            return memo;
          }
        } else if (my < 0) {
          // Up

          const height =
            scrollElement.scrollHeight - scrollElement.offsetHeight;

          if (height !== scrollElement.scrollTop) {
            applyFriction = false;
          }
        }
      }

      if (applyFriction) {
        // adds friction when dragging the sheet upward
        // the more the user drags up, the more friction
        if (newY < 0) {
          newY = newY / (1 - newY * 0.005);
        }

        // if the user drags up passed a threshold, then we cancel
        // the drag so that the sheet resets to its open position
        if (newY < -120 && cancel) {
          cancel();
        }
      } else {
        if (newY < 0 && cancel) {
          // no friction means we should cancel drags
          // that attempt to move the sheet outside the viewport
          cancel();

          newY = 0;
        }
      }

      const lastSnapPoint = realSnapPoints[realSnapPoints.length - 1];

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
        const diff = height - lastSnapPoint;
        const safeAreaSize =
          minimumVisibleHeight > diff ? minimumVisibleHeight : diff;

        set({
          y: clamp(newY, -200, height - safeAreaSize),
          immediate: false,
          config: config.stiff,
        });
      }

      return memo;
    },
    {
      dragDelay: dragDelay,
    }
  );

  useImperativeHandle(ref, () => sheetRef.current, []);

  return (
    <animated.div
      ref={sheetRef}
      {...bind()}
      style={{
        ...style,
        height,
        transform: y.interpolate((y: number) => `translateY(${y}px)`),
      }}
      data-bottom-sheet
      {...props}
    >
      {children}
    </animated.div>
  );
}

export default forwardRef(Sheet);

function pathUntilElement(
  from: HTMLElement,
  to: HTMLElement,
  path: HTMLElement[] = []
): HTMLElement[] {
  const parent = from.parentElement;
  let newPath = [...path, from];

  if (!parent) {
    return newPath;
  }

  if (parent === to) {
    return [...newPath, parent];
  }

  return pathUntilElement(parent, to, newPath);
}
