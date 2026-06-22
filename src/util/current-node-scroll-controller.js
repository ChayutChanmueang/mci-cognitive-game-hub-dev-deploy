const DEFAULT_SCROLL_OFFSET = 120;
const DEFAULT_SCROLL_TOLERANCE = 96;

export function bindCurrentNodeScrollController({
    root,
    state = null,
    activeKey = "",
    on = null,
    scrollAreaSelector = "[data-hub-scroll]",
    scrollButtonSelector = "[data-scroll-top]",
    scrollButtonIconSelector = "md-icon",
    activeSectionSelector = (key) => `[data-program-day="${key}"]`,
    currentNodeSelector = ".hub-clean-level.is-current",
    completedNodeSelector = ".hub-clean-level.is-done",
    fallbackNodeSelector = ".hub-clean-level",
    offsetElementSelector = ".hub-clean-topbar",
    visibleClass = "is-visible",
    scrollTopStateKey = "scrollTop",
    scrollButtonTarget = "current",
} = {}) {
    const scrollArea = root?.querySelector(scrollAreaSelector);
    const scrollButton = root?.querySelector(scrollButtonSelector);
    const scrollButtonIcon = scrollButton?.querySelector(scrollButtonIconSelector);
    const addListener = typeof on === "function"
        ? on
        : (target, eventName, handler, listenerOptions) => target?.addEventListener(eventName, handler, listenerOptions);

    const getScrollOffset = () => {
        if (!scrollArea) {
            return 0;
        }

        const offsetElement = root.querySelector(offsetElementSelector);
        const scrollAreaRect = scrollArea.getBoundingClientRect();
        const offsetElementRect = offsetElement?.getBoundingClientRect();
        const offsetElementBottom = offsetElementRect
            ? Math.max(0, offsetElementRect.bottom - scrollAreaRect.top)
            : 160;

        return Math.max(DEFAULT_SCROLL_OFFSET, offsetElementBottom + Math.round(scrollArea.clientHeight * 0.03));
    };

    const getScrollTolerance = () => {
        if (!scrollArea) {
            return DEFAULT_SCROLL_TOLERANCE;
        }

        return Math.max(DEFAULT_SCROLL_TOLERANCE, Math.round(scrollArea.clientHeight * 0.3));
    };

    const getScrollUnitScale = () => {
        const content = scrollArea?.firstElementChild;
        const visualHeight = content?.getBoundingClientRect?.().height || 0;
        return visualHeight > 0
            ? scrollArea.scrollHeight / visualHeight
            : 1;
    };

    const getCurrentNodeTarget = () => {
        const sectionSelector = typeof activeSectionSelector === "function"
            ? activeSectionSelector(activeKey)
            : activeSectionSelector;
        const activeSection = root?.querySelector(sectionSelector);

        if (!activeSection) {
            return null;
        }

        const currentNode = activeSection.querySelector(currentNodeSelector);
        if (currentNode) {
            return currentNode;
        }

        const completedNodes = Array.from(activeSection.querySelectorAll(completedNodeSelector));
        return completedNodes.at(-1)
            || activeSection.querySelector(fallbackNodeSelector)
            || activeSection;
    };

    const getCurrentNodeScrollTop = () => {
        if (!scrollArea) {
            return 0;
        }

        const targetNode = getCurrentNodeTarget();
        if (!targetNode) {
            return 0;
        }

        const scrollAreaRect = scrollArea.getBoundingClientRect();
        const targetRect = targetNode.getBoundingClientRect();

        return targetRect
            ? Math.max(
                0,
                scrollArea.scrollTop
                    + ((targetRect.top - scrollAreaRect.top - getScrollOffset()) * getScrollUnitScale()),
            )
            : 0;
    };

    const updateScrollButton = () => {
        const value = scrollArea?.scrollTop || 0;
        const targetTop = scrollButtonTarget === "top" ? 0 : getCurrentNodeScrollTop();
        const deltaFromCurrentNode = value - targetTop;
        const scrollTolerance = getScrollTolerance();
        const isAwayFromCurrentNode = Math.abs(deltaFromCurrentNode) > scrollTolerance;
        const shouldScrollDown = scrollButtonTarget !== "top" && deltaFromCurrentNode < -scrollTolerance;

        if (state && scrollTopStateKey) {
            state[scrollTopStateKey] = value;
        }

        scrollButton?.classList.toggle(visibleClass, isAwayFromCurrentNode);
        scrollButton?.setAttribute(
            "aria-label",
            shouldScrollDown ? "เลื่อนลงไปยังจุดปัจจุบัน" : "เลื่อนขึ้นไปยังจุดปัจจุบัน",
        );
        scrollButton?.setAttribute("data-scroll-direction", shouldScrollDown ? "down" : "up");

        if (scrollButtonIcon) {
            scrollButtonIcon.textContent = shouldScrollDown ? "arrow_downward" : "arrow_upward";
        }
    };

    const restoreScrollPosition = () => {
        if (!scrollArea) {
            return;
        }

        const currentNodeTarget = getCurrentNodeTarget();
        scrollArea.scrollTop = currentNodeTarget
            ? getCurrentNodeScrollTop()
            : Math.max(0, Number(state?.[scrollTopStateKey]) || 0);
        updateScrollButton();
    };

    addListener(scrollArea, "scroll", updateScrollButton, { passive: true });
    addListener(scrollButton, "click", () => {
        const targetTop = scrollButtonTarget === "top" ? 0 : getCurrentNodeScrollTop();
        scrollArea?.scrollTo({ top: targetTop, behavior: "smooth" });
    });
    requestAnimationFrame(restoreScrollPosition);

    return {
        scrollArea,
        scrollButton,
        getCurrentNodeTarget,
        getCurrentNodeScrollTop,
        restoreScrollPosition,
        updateScrollButton,
    };
}
