import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import cartReducer, { fetchCartFromServer } from "./slices/cartSlice";
import authReducer, { loginWithJWT } from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import wishlistReducer, { fetchWishlistFromServer } from "./slices/wishlistSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: loginWithJWT.fulfilled,
  effect: async (_, listenerApi) => {
    listenerApi.dispatch(fetchCartFromServer() as any);
    listenerApi.dispatch(fetchWishlistFromServer() as any);
  },
});

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    ui: uiReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
