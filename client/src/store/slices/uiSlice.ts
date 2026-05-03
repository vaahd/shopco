import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
}

const initialState: UIState = {
  isCartOpen: false,
  isMobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
  },
});

export const { toggleCart, setCartOpen, toggleMobileMenu, setMobileMenuOpen } = uiSlice.actions;
export default uiSlice.reducer;
