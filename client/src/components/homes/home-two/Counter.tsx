import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import Counter1 from "../../../svg/home-one/Counter1";
import Counter2 from "../../../svg/home-one/Counter2";
import Counter3 from "../../../svg/home-one/Counter3";
import Counter4 from "../../../svg/home-one/Counter4";
import Count from "../../common/Count";

interface DataType {
   id: number;
   icon: JSX.Element;
   titleKey: string;
   count: number;
}

const counter_data: DataType[] = [
   { id: 1, icon: (<><Counter1 /></>), titleKey: "happy_clients", count: 65 },
   { id: 2, icon: (<><Counter2 /></>), titleKey: "country_tour", count: 10 },
   { id: 3, icon: (<><Counter3 /></>), titleKey: "tourism_award", count: 35 },
   { id: 4, icon: (<><Counter4 /></>), titleKey: "skilled_support", count: 24 },
];

const Counter = () => {
   const { t, i18n } = useTranslation();
   const isRtl = i18n.language?.startsWith('ar');
   return (
      <div className="tg-counter-area tg-counter-su-2 pt-85 pb-55">
         <div className="container">
            <div className="row">
               {counter_data.map((item) => (
                  <div key={item.id} className="col-lg-3 col-md-6 col-sm-6 mb-30">
                     <div className="tg-counter-item d-flex align-items-center" style={{ gap: '20px' }}>
                        <span className="tg-counter-icon d-inline-block">
                           {item.icon}
                        </span>
                        <div className="tg-counter-content p-relative">
                           <h2 className="tg-counter-title count">
                              <span className="odometer" data-count={item.count}><Count number={item.count} /></span>K
                           </h2>
                           <span className="tg-counter-subtitle">{t(`home4.counter.${item.titleKey}`)}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   )
}

export default Counter
