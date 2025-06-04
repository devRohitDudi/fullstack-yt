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

export default useAuthStore;
