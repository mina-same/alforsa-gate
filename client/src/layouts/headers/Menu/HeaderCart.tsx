/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import UseCartInfo from "../../../hooks/UseCartInfo";
import { remove_cart_product } from "../../../redux/features/cartSlice";

const HeaderCart = () => {

   const [mounted, setMounted] = useState(false);
   const productItem = useSelector((state: any) => state.cart.cart);
   const dispatch = useDispatch();
   const { total } = UseCartInfo();

   useEffect(() => {
      setMounted(true);
   }, []);

   if (!mounted) return null;

   return (
      <div className="minicart">
         {productItem.length === 0 ? (
            <div className="mb-30">
               <div className="empty_bag text-center">
                  <p className="py-3">Your Bag is Empty</p>
                  <Link to={"/shop"} className="swiftcart-btn-black swiftcart-btn-black-large">
                     Go To Shop
                  </Link>
               </div>
            </div>
         ) : (
            <>
               {productItem.map((item: any, i: any) => (
                  <div key={i} className="cart-content-wrap d-flex align-items-center justify-content-between">
                     <div className="cart-img-info d-flex align-items-center">
                        <div className="cart-thumb">
                           <Link to="/shop-details">
                              <img src={item.thumb} alt="" />
                           </Link>
                        </div>
                        <div className="cart-content">
                           <h5 className="cart-title"><Link to="/shop-details">{item.title}</Link></h5>
                           <span> ${item.price} <del>${item.delete_price}</del></span>
                        </div>
                     </div>
                     <div onClick={() => dispatch(remove_cart_product(item))} className="cart-del-icon">
                        <span><i className="fa-light fa-trash-can"></i></span>
                     </div>
                  </div>
               ))}
               <div className="cart-total-price d-flex align-items-center justify-content-between">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
               </div>
               <div className="minicart-btn">
                  <Link className="cart-btn mb-10" to="/cart"><span>Shopping Cart</span></Link>
                  <Link className="cart-btn cart-btn-black" to="/checkout"><span>Checkout</span></Link>
               </div></>
         )}
      </div>
   )
}

export default HeaderCart
