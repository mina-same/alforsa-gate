const stats = [
  {
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>,
    iconClass: "stat-card__icon--purple",
    value: "248",
    label: "Total Tours",
    trend: "+12%",
    trendClass: "stat-card__trend--up",
    trendUp: true,
    footer: <><span>18 new</span> tours this month</>,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M22 16.21v-1.451a2 2 0 00-1.088-1.784l-1.539-.77a2 2 0 00-1.696-.041l-.088.04-3.93 1.965-4.949-5.657-1.374.687 2.227 6.02-2.83 1.414-.802-.802-1.062.531 1.5 2.5 2.5 1.5.531-1.063-.802-.802 1.414-2.83 6.02 2.227.687-1.374-5.657-4.95 1.965-3.929.04-.088a2 2 0 00-.041-1.696l-.77-1.539A2 2 0 0020 7.241V5.79z" />
      </svg>
    ),
    iconClass: "stat-card__icon--slate",
    value: "1,042",
    label: "Total Flights",
    trend: "+8%",
    trendClass: "stat-card__trend--up",
    trendUp: true,
    footer: <><span>63 new</span> routes added</>,
  },
  {
    icon: <svg viewBox="0 0 24 24"><path d="M3 21h18M3 7v14M21 7v14M3 7a2 2 0 012-2h14a2 2 0 012 2M9 21v-8a3 3 0 016 0v8" /></svg>,
    iconClass: "stat-card__icon--gray",
    value: "374",
    label: "Total Hotels",
    trend: "+5%",
    trendClass: "stat-card__trend--up",
    trendUp: true,
    footer: <><span>24 new</span> properties listed</>,
  },
  {
    icon: <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    iconClass: "stat-card__icon--dark",
    value: "3,819",
    label: "Total Bookings",
    trend: "-3%",
    trendClass: "stat-card__trend--down",
    trendUp: false,
    footer: <><span>412</span> bookings this week</>,
  },
];

const bookings = [
  { ref: "#BK-1042", customer: "Ahmed Al-Rashid", type: "tour",   typeLabel: "Tour",   status: "confirmed",  amount: "$1,240" },
  { ref: "#BK-1041", customer: "Sara Johnson",    type: "flight", typeLabel: "Flight", status: "pending",    amount: "$380" },
  { ref: "#BK-1040", customer: "Mohammed Khalid", type: "hotel",  typeLabel: "Hotel",  status: "confirmed",  amount: "$890" },
  { ref: "#BK-1039", customer: "Emily Chen",      type: "tour",   typeLabel: "Tour",   status: "confirmed",  amount: "$2,100" },
  { ref: "#BK-1038", customer: "Omar Abdullah",   type: "flight", typeLabel: "Flight", status: "cancelled",  amount: "$520" },
  { ref: "#BK-1037", customer: "Fatima Al-Zahra", type: "hotel",  typeLabel: "Hotel",  status: "pending",    amount: "$650" },
];

const activities = [
  { type: "tour",   text: <><strong>New booking</strong> — Ahmed Al-Rashid booked "Desert Safari Dubai"</>, time: "2 min ago" },
  { type: "flight", text: <><strong>Route added</strong> — Cairo → Dubai is now live</>, time: "18 min ago" },
  { type: "hotel",  text: <><strong>Hotel updated</strong> — Grand Hyatt Dubai updated availability</>, time: "1 hr ago" },
  { type: "user",   text: <><strong>New user</strong> — Sara Johnson created an account</>, time: "2 hrs ago" },
  { type: "tour",   text: <><strong>Booking cancelled</strong> — Omar Abdullah cancelled "Nile Cruise"</>, time: "3 hrs ago" },
  { type: "flight", text: <><strong>Price updated</strong> — Riyadh → London fares revised</>, time: "5 hrs ago" },
];

const TourIcon  = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>;
const FlightIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M22 16.21v-1.451a2 2 0 00-1.088-1.784l-1.539-.77a2 2 0 00-1.696-.041l-.088.04-3.93 1.965-4.949-5.657-1.374.687 2.227 6.02-2.83 1.414-.802-.802-1.062.531 1.5 2.5 2.5 1.5.531-1.063-.802-.802 1.414-2.83 6.02 2.227.687-1.374-5.657-4.95 1.965-3.929.04-.088a2 2 0 00-.041-1.696l-.77-1.539A2 2 0 0020 7.241V5.79z" />
  </svg>
);
const HotelIcon  = () => <svg viewBox="0 0 24 24"><path d="M3 21h18M3 7v14M21 7v14M3 7a2 2 0 012-2h14a2 2 0 012 2M9 21v-8a3 3 0 016 0v8" /></svg>;
const UserIcon   = () => <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>;
const ArrowIcon  = () => <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
const UpIcon     = () => <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" /></svg>;
const DownIcon   = () => <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>;
const PlusIcon   = () => <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const ExportIcon = () => <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>;

const typeIcon = (type: string) => {
  if (type === "tour")   return <TourIcon />;
  if (type === "flight") return <FlightIcon />;
  if (type === "hotel")  return <HotelIcon />;
  return <UserIcon />;
};

interface AdminDashboardProps {
  onAddTour?: () => void;
  onManageTours?: () => void;
}

const AdminDashboard = ({ onAddTour, onManageTours }: AdminDashboardProps) => (
  <div className="admin-content">

    {/* Quick actions */}
    <div className="quick-actions">
      <button className="quick-action-btn quick-action-btn--primary" type="button" onClick={onAddTour}>
        <PlusIcon /> Add Tour
      </button>
      <button className="quick-action-btn quick-action-btn--outline" type="button">
        <PlusIcon /> Add Flight
      </button>
      <button className="quick-action-btn quick-action-btn--outline" type="button">
        <PlusIcon /> Add Hotel
      </button>
      <button className="quick-action-btn quick-action-btn--outline" type="button">
        <ExportIcon /> Export
      </button>
    </div>

    {/* Stat cards */}
    <div className="admin-stats-grid">
      {stats.map((s, i) => (
        <div className="stat-card" key={i}>
          <div className="stat-card__header">
            <div className={`stat-card__icon ${s.iconClass}`}>{s.icon}</div>
            <div className={`stat-card__trend ${s.trendClass}`}>
              {s.trendUp ? <UpIcon /> : <DownIcon />}
              {s.trend}
            </div>
          </div>
          <div className="stat-card__value">{s.value}</div>
          <div className="stat-card__label">{s.label}</div>
          <div className="stat-card__footer">{s.footer}</div>
        </div>
      ))}
    </div>

    {/* Service cards */}
    <div className="admin-section-grid">

      {/* Tours */}
      <button className="service-card service-card--button" type="button" onClick={onManageTours}>
        <div className="service-card__head">
          <div className="service-card__head-icon"><TourIcon /></div>
          <div className="service-card__head-text">
            <span className="sc-title">Tours</span>
            <span className="sc-count">248 packages total</span>
          </div>
        </div>
        <div className="service-card__body">
          <p className="service-card__desc">
            Manage tour packages, itineraries, pricing and availability across all destinations.
          </p>
          <div className="service-card__stats">
            <div className="stat-item"><span className="stat-val">186</span><span className="stat-lbl">Active</span></div>
            <div className="stat-item"><span className="stat-val">42</span><span className="stat-lbl">Pending</span></div>
            <div className="stat-item"><span className="stat-val">20</span><span className="stat-lbl">Archived</span></div>
          </div>
          <span className="service-card__action">Manage Tours <ArrowIcon /></span>
        </div>
      </button>

      {/* Flights */}
      <div className="service-card">
        <div className="service-card__head">
          <div className="service-card__head-icon"><FlightIcon /></div>
          <div className="service-card__head-text">
            <span className="sc-title">Flights</span>
            <span className="sc-count">1,042 routes total</span>
          </div>
        </div>
        <div className="service-card__body">
          <p className="service-card__desc">
            Track routes, schedules, seat availability and airline partner integrations.
          </p>
          <div className="service-card__stats">
            <div className="stat-item"><span className="stat-val">924</span><span className="stat-lbl">Active</span></div>
            <div className="stat-item"><span className="stat-val">78</span><span className="stat-lbl">Delayed</span></div>
            <div className="stat-item"><span className="stat-val">40</span><span className="stat-lbl">Cancelled</span></div>
          </div>
          <span className="service-card__action">Manage Flights <ArrowIcon /></span>
        </div>
      </div>

      {/* Hotels */}
      <div className="service-card">
        <div className="service-card__head">
          <div className="service-card__head-icon"><HotelIcon /></div>
          <div className="service-card__head-text">
            <span className="sc-title">Hotels</span>
            <span className="sc-count">374 properties total</span>
          </div>
        </div>
        <div className="service-card__body">
          <p className="service-card__desc">
            Manage hotel listings, room types, amenities and seasonal pricing.
          </p>
          <div className="service-card__stats">
            <div className="stat-item"><span className="stat-val">310</span><span className="stat-lbl">Active</span></div>
            <div className="stat-item"><span className="stat-val">48</span><span className="stat-lbl">Review</span></div>
            <div className="stat-item"><span className="stat-val">16</span><span className="stat-lbl">Suspended</span></div>
          </div>
          <span className="service-card__action">Manage Hotels <ArrowIcon /></span>
        </div>
      </div>

    </div>

    {/* Bookings + Activity */}
    <div className="admin-grid">

      <div className="admin-card">
        <div className="admin-card__head">
          <h3>Recent Bookings</h3>
          <a href="#" className="view-all">View all</a>
        </div>
        <div className="admin-card__body">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={i}>
                  <td className="booking-ref">{b.ref}</td>
                  <td>{b.customer}</td>
                  <td>
                    <span className={`booking-type booking-type--${b.type}`}>
                      {typeIcon(b.type)}
                      {b.typeLabel}
                    </span>
                  </td>
                  <td>
                    <span className={`booking-status booking-status--${b.status}`}>{b.status}</span>
                  </td>
                  <td className="booking-amount">{b.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__head">
          <h3>Recent Activity</h3>
          <a href="#" className="view-all">View all</a>
        </div>
        <div className="admin-card__body">
          <ul className="activity-list">
            {activities.map((a, i) => (
              <li key={i}>
                <div className={`activity-icon activity-icon--${a.type}`}>
                  {typeIcon(a.type)}
                </div>
                <div className="activity-body">
                  <p className="activity-text">{a.text}</p>
                  <span className="activity-time">{a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  </div>
);

export default AdminDashboard;
