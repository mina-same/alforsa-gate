interface DataType {
   id: number;
   page: string;
   avatar: string;
   flag: string;
   name?: string;
   designation?: string;
   desc?: string;
}

const testi_data: DataType[] = [
   {
      id: 1,
      page: "home_2",
      avatar: "/assets/img/testimonial/avatar.png",
      flag: "🇺🇸",
   },
   {
      id: 2,
      page: "home_2",
      avatar: "/assets/img/testimonial/avatar-2.png",
      flag: "🇬🇧",
   },
   {
      id: 3,
      page: "home_2",
      avatar: "/assets/img/testimonial/avatar-3.png",
      flag: "🇦🇺",
   },
   {
      id: 4,
      page: "home_2",
      avatar: "/assets/img/testimonial/avatar-2.png",
      flag: "🇬🇧",
   },
   {
      id: 5,
      page: "home_2",
      avatar: "/assets/img/testimonial/avatar.png",
      flag: "🇸🇦",
   },
   {
      id: 6,
      page: "home_2",
      avatar: "/assets/img/testimonial/avatar-3.png",
      flag: "🇨🇦",
   },
   {
      id: 7,
      page: "home_2",
      avatar: "/assets/img/testimonial/avatar-2.png",
      flag: "🇩🇪",
   },
   {
      id: 8,
      page: "home_2",
      avatar: "/assets/img/testimonial/avatar.png",
      flag: "🇫🇷",
   },
];

export default testi_data;