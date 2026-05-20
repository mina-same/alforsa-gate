/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from "react-helmet-async";
import ErrorBoundary from "../ui/ErrorBoundary";

const SEO = ({ pageTitle }: any) => {
  return (
    <ErrorBoundary>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{pageTitle} Tourex - Tour & Travel Booking React js Template</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="Zibber - Consulting React Template" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Helmet>
    </ErrorBoundary>
  );
};

export default SEO;