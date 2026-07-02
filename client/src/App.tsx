import { HelmetProvider } from "react-helmet-async"
import AppNavigation from "./navigation/Navigation"
import { Provider } from 'react-redux'
import store from "./redux/store"
import { AuthProvider } from "./context/AuthContext"
import { CurrencyProvider } from "./context/CurrencyContext"

const WHATSAPP_NUMBER = "966569191977";

function App() {

  return (
    <>
      <Provider store={store}>
        <HelmetProvider>
          <AuthProvider>
            <CurrencyProvider>
              <AppNavigation />
            </CurrencyProvider>
          </AuthProvider>
        </HelmetProvider>
      </Provider>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        style={{
          position: "fixed",
          bottom: "92px",
          right: "50px",
          zIndex: 9999,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(37,211,102,0.45)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.1)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 24px rgba(37,211,102,0.6)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(37,211,102,0.45)";
        }}
      >
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M16 2C8.268 2 2 8.268 2 16c0 2.387.627 4.629 1.724 6.572L2 30l7.623-1.699A13.934 13.934 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.54 11.54 0 01-5.9-1.614l-.422-.252-4.527 1.008 1.023-4.41-.276-.453A11.543 11.543 0 014.4 16C4.4 9.593 9.593 4.4 16 4.4S27.6 9.593 27.6 16 22.407 27.6 16 27.6z" fill="white"/>
          <path d="M22.003 19.13c-.33-.165-1.952-.963-2.254-1.073-.303-.11-.523-.165-.743.165-.22.33-.853 1.073-1.045 1.293-.193.22-.385.247-.715.082-.33-.165-1.394-.514-2.655-1.638-.981-.875-1.644-1.955-1.836-2.285-.193-.33-.02-.508.144-.672.149-.148.33-.385.495-.578.165-.192.22-.33.33-.55.11-.22.055-.413-.027-.578-.083-.165-.743-1.79-1.018-2.45-.268-.643-.54-.555-.743-.565-.192-.009-.413-.011-.633-.011-.22 0-.578.082-.88.413-.303.33-1.155 1.128-1.155 2.75 0 1.623 1.182 3.192 1.347 3.412.165.22 2.326 3.553 5.638 4.983.788.34 1.403.543 1.882.695.79.252 1.51.216 2.079.131.634-.094 1.952-.798 2.227-1.568.275-.77.275-1.43.192-1.568-.082-.138-.302-.22-.633-.385z" fill="white"/>
        </svg>
      </a>
    </>
  )
}

export default App
