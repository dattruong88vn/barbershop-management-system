const RECENT_SEARCHES_KEY = "barberos:recent-customer-searches";
const RECENT_SEARCHES_EVENT = "barberos:recent-customer-searches-updated";
const EMPTY_RECENT_SEARCHES: string[] = [];

let recentSearchesSnapshot: string[] = EMPTY_RECENT_SEARCHES;
let recentSearchesSnapshotValue: string | null = null;

export function getStoredRecentSearches() {
  if (typeof window === "undefined") {
    return EMPTY_RECENT_SEARCHES;
  }

  const storedSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY);

  if (storedSearches === recentSearchesSnapshotValue) {
    return recentSearchesSnapshot;
  }

  recentSearchesSnapshotValue = storedSearches;

  if (!storedSearches) {
    recentSearchesSnapshot = EMPTY_RECENT_SEARCHES;
    return recentSearchesSnapshot;
  }

  try {
    const parsedSearches: unknown = JSON.parse(storedSearches);

    recentSearchesSnapshot = Array.isArray(parsedSearches)
      ? parsedSearches.filter((item): item is string => typeof item === "string")
      : [];
    return recentSearchesSnapshot;
  } catch {
    recentSearchesSnapshot = EMPTY_RECENT_SEARCHES;
    return recentSearchesSnapshot;
  }
}

export function subscribeToRecentSearches(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === RECENT_SEARCHES_KEY) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(RECENT_SEARCHES_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(RECENT_SEARCHES_EVENT, onStoreChange);
  };
}

export function getEmptyRecentSearches() {
  return EMPTY_RECENT_SEARCHES;
}

export function writeStoredRecentSearches(searches: string[]) {
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  window.dispatchEvent(new Event(RECENT_SEARCHES_EVENT));
}
