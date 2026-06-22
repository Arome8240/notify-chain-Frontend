"use client";

import { useCallback, useRef } from "react";

/**
 * Provides keyboard navigation for a list of focusable rows.
 *
 * Usage:
 *   const { listRef, getRowProps } = useKeyboardList(items.length);
 *
 *   <ul ref={listRef} role="listbox" ...>
 *     {items.map((item, index) => (
 *       <li key={item.id} {...getRowProps(index)}>...</li>
 *     ))}
 *   </ul>
 *
 * Keyboard contract:
 *   ArrowDown / ArrowUp  → move focus to next / previous row
 *   Home                 → focus first row
 *   End                  → focus last row
 *   Enter / Space        → activate the row's primary action (if any)
 *
 * Screen reader notes:
 *   - Each row gets role="option" and aria-setsize / aria-posinset so
 *     assistive technologies announce position within the list.
 *   - tabIndex is managed: only the focused row (or row 0 if none) is in
 *     the natural tab order (roving-tabindex pattern).
 */
export function useKeyboardList(length: number) {
  const listRef = useRef<HTMLUListElement | HTMLOListElement | null>(null);
  const focusedIndex = useRef<number>(0);

  const focusRow = useCallback(
    (index: number) => {
      if (!listRef.current) return;
      const rows = listRef.current.querySelectorAll<HTMLElement>(
        "[data-keyboard-row]"
      );
      if (!rows[index]) return;

      // Roving tabindex: remove from previous, add to next.
      rows.forEach((r) => r.setAttribute("tabindex", "-1"));
      rows[index].setAttribute("tabindex", "0");
      rows[index].focus();
      focusedIndex.current = index;
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, index: number) => {
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          focusRow(Math.min(index + 1, length - 1));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          focusRow(Math.max(index - 1, 0));
          break;
        }
        case "Home": {
          e.preventDefault();
          focusRow(0);
          break;
        }
        case "End": {
          e.preventDefault();
          focusRow(length - 1);
          break;
        }
        // Enter / Space: let the event bubble so any child button/link inside
        // the row can handle its own activation naturally.
        default:
          break;
      }
    },
    [focusRow, length]
  );

  /**
   * Spread the returned props onto every row element.
   * `tabIndex` uses the roving pattern: first row starts in tab order,
   * rest are -1 until focused via keyboard.
   */
  const getRowProps = useCallback(
    (index: number) => ({
      "data-keyboard-row": true,
      role: "option" as const,
      "aria-posinset": index + 1,
      "aria-setsize": length,
      tabIndex: index === 0 ? 0 : -1,
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) =>
        handleKeyDown(e, index),
      onFocus: () => {
        focusedIndex.current = index;
      },
    }),
    [handleKeyDown, length]
  );

  return { listRef, getRowProps, focusRow };
}
