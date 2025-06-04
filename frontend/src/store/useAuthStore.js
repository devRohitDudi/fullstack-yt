// store/useAuthStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  currentUsername: "",
  setCurrentUsername: (value) => set({ currentUsername: value }),
  userAvatar: null,
  setUserAvatar: (value) => set({ userAvatar: value }),
}));

import { persist } from "zustand/middleware";

const usePreferencesStore = create(
  persist(
    (set) => ({
      interests: [],
      setUserInterests: (value) => set({ interests: value }),
    }),
    {
      name: "user-preferences", // Key in localStorage
      getStorage: () => localStorage, // Optional, defaults to localStorage
    }
  )
);

export { usePreferencesStore };
export default useAuthStore;
