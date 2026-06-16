import { type JSX, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plane } from "lucide-react";
import BannerFormTwo from "./BannerFormTwo";

interface TabData {
   titleKey: string;
   icon: JSX.Element;
}

const tab_icons: Omit<TabData, 'titleKey'>[] = [
   {
      icon: (<> <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M16.5 2.5L8.8 10.2M16.5 2.5L11.6 16.5L8.8 10.2M16.5 2.5L2.5 7.4L8.8 10.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg></>),
   },
   {
      icon: (<><svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M1.5 17.5H14.3M11.9 7.1H9.5M12.7 10.3H9.5M12.7 13.5H9.5M3.1 17.5V2.46C3.1 1.8392 3.4768 1.5 4.06 1.5C5.3976 1.5 6.0664 1.5 6.6264 1.588C8.12821 1.82593 9.51614 2.53322 10.5913 3.60848C11.6664 4.68373 12.3735 6.07176 12.6112 7.5736C12.7 8.1336 12.7 8.8024 12.7 10.14V17.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg></>),
   },
   {
      icon: <Plane size={20} />,
   },
];

const tab_keys = ['banner_form.tours', 'banner_form.hotels', 'banner_form.flights'];

const form_data: number[] = [1, 2, 3];

const BannerFormThree = () => {
   const { t } = useTranslation();
   const [activeTab, setActiveTab] = useState(0);

   // Handle tab click event
   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   return (
      <div className="tg-booking-form-area tg-booking-form-space pb-105">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="tg-booking-form-wrap">
                     <div className="tg-booking-form-tabs">
                        <div className="nav nav-tab justify-content-center" id="nav-tab" role="tablist">
                           {tab_icons.map((tab, index) => (
                              <button key={index} className={`nav-link ${activeTab === index ? "active" : ""}`} onClick={() => handleTabClick(index)} id="nav-platform-tab">
                                 <span className="borders"></span>
                                 <span className="icon">{tab.icon}</span>
                                 <span>{t(tab_keys[index])}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="tab-content" id="nav-tabContent">
                        {form_data.map((item, index) => (
                           <div key={item} className={`tab-pane fade ${activeTab === index ? 'show active' : ''}`} id="nav-platform">
                              <div className="tg-booking-form-item">
                                 <BannerFormTwo />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default BannerFormThree
