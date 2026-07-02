import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState } from "../../../redux/store";

const TotalWishlist = () => {
   const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlist);
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true);
   }, []);

   if (!isClient) return null;

   return <>{wishlistItems.length}</>;
};

export default TotalWishlist;
