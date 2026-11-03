"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ALREADY_ANIMATED = "[data-scroll-animated]";
const KEPT_WHOLE =
  "p, h1, h2, h3, h4, h5, h6, table, form, img, picture, svg, video, iframe, canvas";
const MAX_BLOCK_SHARE_OF_SCREEN = 0.6;
const REVEAL_MS = 600;
const STAGGER_MS = 80;
const MAX_STAGGER_STEPS = 6;
const TRIGGER_MARGIN = "0px 0px -80px 0px";

// Picks what animates as one piece: anything short enough to read at a glance,
// and each card of a grid so that a row arrives one card at a time.
function findBlocks(element: Element, maxHeight: number): Element[] {
  if (element.matches(ALREADY_ANIMATED)) return [];

  const { display, position } = getComputedStyle(element);
  if (position === "absolute" || position === "fixed") return [];

  const canSplit = element.children.length > 0 && !element.matches(KEPT_WHOLE);
  const tooTall = element.getBoundingClientRect().height > maxHeight;
  const hasAnimatedPart = element.querySelector(ALREADY_ANIMATED) !== null;

  if (hasAnimatedPart || (canSplit && (tooTall || display === "grid"))) {
    return [...element.children].flatMap((child) =>
      findBlocks(child, maxHeight)
    );
  }
  return [element];
}

function clearReveal(block: Element) {
  block.removeAttribute("data-reveal");
  (block as HTMLElement).style.transitionDelay = "";
}

function reveal(block: Element, delayMs: number) {
  (block as HTMLElement).style.transitionDelay = `${delayMs}ms`;
  block.setAttribute("data-reveal", "shown");
  // Hands the block back its own transitions, such as a card's hover.
  window.setTimeout(() => clearReveal(block), REVEAL_MS + delayMs);
}

// Animates every page from one place, so new pages need no wrappers. Only blocks
// below the first screen are hidden, and only once this has run, so a page shows
// in full without JavaScript and nothing on screen ever flickers.
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const screenHeight = window.innerHeight;
    const maxHeight = screenHeight * MAX_BLOCK_SHARE_OF_SCREEN;
    const blocks = findBlocks(main, maxHeight).filter(
      (block) => block.getBoundingClientRect().top > screenHeight
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            observer.unobserve(entry.target);
            reveal(entry.target, Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS);
          });
      },
      { rootMargin: TRIGGER_MARGIN }
    );

    blocks.forEach((block) => {
      block.setAttribute("data-reveal", "hidden");
      observer.observe(block);
    });

    return () => {
      observer.disconnect();
      blocks.forEach(clearReveal);
    };
  }, [pathname]);

  return null;
}
