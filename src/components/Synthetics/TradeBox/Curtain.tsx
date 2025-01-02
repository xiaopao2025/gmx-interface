import cx from "classnames";
import { CSSProperties, PropsWithChildren, useCallback, useRef, useState } from "react";
import { RemoveScroll } from "react-remove-scroll";

import Button from "components/Button/Button";

import LeftArrowIcon from "img/ic_arrowleft16.svg?react";

const HEADER_HEIGHT = 52;
const DECELERATION = 0.01;
const DIRECTION_THRESHOLD = 2;
const MOVEMENT_THRESHOLD = 10;

const CURTAIN_STYLE: CSSProperties = {
  top: `calc(100dvh - ${HEADER_HEIGHT}px)`,
  height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
};

export function Curtain({
  children,
  header,
  dataQa,
}: PropsWithChildren<{
  header: React.ReactNode;
  dataQa?: string;
}>) {
  const curtainRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const currentRelativeY = useRef(0);
  const prevScreenY = useRef(0);
  const prevScreenX = useRef(0);
  const prevTime = useRef(0);
  const currentVelocity = useRef(0);
  const isDirectionLocked = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const [isOpen, setIsOpen] = useState(false);

  const handleAnimate = useCallback((newIsOpen: boolean) => {
    if (!curtainRef.current) return;

    const oldTransition = curtainRef.current.style.transition;
    const animation = curtainRef.current.animate(
      {
        transform: `translateY(${newIsOpen ? `calc(-100% + ${HEADER_HEIGHT}px)` : 0})`,
      },
      {
        duration: 150,
        easing: "ease-out",
        fill: "both",
      }
    );
    animation.addEventListener("finish", () => {
      animation.commitStyles();
      animation.cancel();
      if (curtainRef.current) {
        curtainRef.current.style.transition = oldTransition;
      }
    });
  }, []);

  const headerClick = useCallback(() => {
    setIsOpen(true);
    handleAnimate(true);
  }, [setIsOpen, handleAnimate]);

  const handleToggle = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    handleAnimate(newIsOpen);
  }, [isOpen, handleAnimate]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    handleAnimate(false);
  }, [setIsOpen, handleAnimate]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!curtainRef.current) {
      return;
    }

    isPointerDownRef.current = true;
    isDirectionLocked.current = false;
    isDraggingRef.current = false;
    startX.current = e.screenX;
    startY.current = e.screenY;

    const transformString = curtainRef.current.style.transform;
    const transform = new DOMMatrix(transformString);
    currentRelativeY.current = transform.f;
    prevScreenY.current = e.screenY;
    prevScreenX.current = e.screenX;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const offsetX = e.screenX - startX.current;
    const offsetY = e.screenY - startY.current;

    if (!isDirectionLocked.current) {
      const isVertical = Math.abs(offsetY) > Math.abs(offsetX) * DIRECTION_THRESHOLD;
      if (Math.abs(offsetX) > MOVEMENT_THRESHOLD || Math.abs(offsetY) > MOVEMENT_THRESHOLD) {
        isDirectionLocked.current = true;
        isDraggingRef.current = isVertical;
        if (!isVertical) return;
      }
    }

    if (!isDraggingRef.current || !curtainRef.current) return;

    const deltaY = e.screenY - prevScreenY.current;

    curtainRef.current.style.willChange = "transform";

    const time = e.timeStamp - prevTime.current;
    const velocity = deltaY / time;

    let newY = currentRelativeY.current + deltaY;

    if (newY > 0) {
      newY = 0;
    } else if (newY < -curtainRef.current.clientHeight + HEADER_HEIGHT) {
      newY = -curtainRef.current.clientHeight + HEADER_HEIGHT;
    }

    curtainRef.current.style.transform = `translateY(${newY}px)`;

    currentRelativeY.current = newY;
    prevTime.current = e.timeStamp;
    currentVelocity.current = velocity;

    prevScreenX.current = e.screenX;
    prevScreenY.current = e.screenY;
  }, []);

  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;

    if (!isDraggingRef.current || !curtainRef.current) {
      return;
    }

    isDraggingRef.current = false;
    curtainRef.current.style.willChange = "";

    const targetY =
      currentRelativeY.current +
      (Math.sign(currentVelocity.current) * currentVelocity.current ** 2) / (2 * DECELERATION);

    if (curtainRef.current) {
      const isOpen = curtainRef.current.clientHeight / 2 < -targetY;
      setIsOpen(isOpen);
      handleAnimate(isOpen);
    }
  }, [handleAnimate]);

  return (
    <>
      <div
        className={cx(
          "fixed inset-0 z-[999] bg-black/70 transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={handleClose}
      />
      <RemoveScroll enabled={isOpen}>
        <div
          data-qa={dataQa}
          ref={curtainRef}
          className="text-body-medium fixed left-0 right-0 z-[1000] flex flex-col rounded-t-4 border-x border-t border-gray-800 bg-slate-800
                     shadow-[0px_-24px_48px_-8px_rgba(0,0,0,0.35)]"
          style={CURTAIN_STYLE}
        >
          <div
            className="flex touch-none select-none items-stretch justify-between gap-4 px-15 pb-8 pt-8"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="grow" onClick={headerClick}>
              {header}
            </div>
            <Button
              variant="secondary"
              type="button"
              className="size-35 !bg-cold-blue-900 !px-0 !py-0"
              onClick={handleToggle}
            >
              <LeftArrowIcon
                className={cx(
                  "transition-transform delay-150 duration-500 ease-out",
                  isOpen ? "-rotate-90" : "rotate-90"
                )}
              />
            </Button>
          </div>

          <div className="flex grow flex-col overflow-y-auto">
            <div className="flex grow flex-col px-15 pb-10">{children}</div>
          </div>
        </div>
      </RemoveScroll>
    </>
  );
}
