import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { setLocalStorage, getLocalStorage } from "../../utils/localstorage";

/* Supports both API tour objects (_id, heading) and legacy listing items (id, title) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Product = Record<string, any>;

interface WishlistState {
   wishlist: Product[];
}

const tourId = (item: Product): string =>
   String(item._id ?? item.id ?? "");

const tourTitle = (item: Product): string =>
   item.heading?.en ?? item.title ?? "Tour";

const initialState: WishlistState = {
   wishlist: getLocalStorage<Product>("wishlist") || [],
};

const wishlistSlice = createSlice({
   name: "wishlist",
   initialState,
   reducers: {
      addToWishlist: (state, { payload }: PayloadAction<Product>) => {
         const id = tourId(payload);
         const exists = state.wishlist.some((item) => tourId(item) === id);
         if (exists) {
            toast.info(`${tourTitle(payload)} is already in your wishlist`, { position: "top-right" });
         } else {
            state.wishlist.push(payload);
            toast.success(`${tourTitle(payload)} added to wishlist`, { position: "top-right" });
            setLocalStorage("wishlist", state.wishlist);
         }
      },
      removeFromWishlist: (state, { payload }: PayloadAction<Product>) => {
         const id = tourId(payload);
         state.wishlist = state.wishlist.filter((item) => tourId(item) !== id);
         toast.error("Removed from your wishlist", { position: "top-right" });
         setLocalStorage("wishlist", state.wishlist);
      },
      clearWishlist: (state) => {
         state.wishlist = [];
         setLocalStorage("wishlist", []);
      },
   },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
