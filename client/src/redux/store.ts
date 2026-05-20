import { configureStore } from "@reduxjs/toolkit";
import cartSlice, { hydrateCart } from "./features/cartSlice";
import productSlice from "./features/productSlice";
import wishlistSlice from "./features/wishlistSlice";

const store = configureStore({
   reducer: {
      products: productSlice,
      cart: cartSlice,
      wishlist: wishlistSlice,
   },
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: false,
      }),
});

store.dispatch(hydrateCart());
export type RootState = ReturnType<typeof store.getState>;

export default store;