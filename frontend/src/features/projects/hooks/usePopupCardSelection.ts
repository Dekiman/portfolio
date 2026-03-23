import {
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";

export type PopupCardsSelectionStore = {
  getSelectedCardId: () => string | null;
  openCard: (cardId: string) => void;
  closeCard: () => void;
  subscribe: (listener: () => void) => () => void;
};

export const PopupCardsSelectionContext =
  createContext<PopupCardsSelectionStore | null>(null);

export function createPopupCardsSelectionStore(): PopupCardsSelectionStore {
  let selectedCardId: string | null = null;
  const listeners = new Set<() => void>();

  const emitChange = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  return {
    getSelectedCardId: () => selectedCardId,
    openCard: (cardId) => {
      if (selectedCardId === cardId) {
        return;
      }

      selectedCardId = cardId;
      emitChange();
    },
    closeCard: () => {
      if (!selectedCardId) {
        return;
      }

      selectedCardId = null;
      emitChange();
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function usePopupCardsSelectionStore(): PopupCardsSelectionStore {
  const store = useContext(PopupCardsSelectionContext);

  if (!store) {
    throw new Error("PopupCards selection store is missing.");
  }

  return store;
}

export function useSelectedPopupCardId(): string | null {
  const store = usePopupCardsSelectionStore();

  return useSyncExternalStore(
    store.subscribe,
    store.getSelectedCardId,
    store.getSelectedCardId,
  );
}

export function useIsPopupCardActive(cardId: string): boolean {
  const store = usePopupCardsSelectionStore();

  return useSyncExternalStore(
    store.subscribe,
    () => store.getSelectedCardId() === cardId,
    () => false,
  );
}
