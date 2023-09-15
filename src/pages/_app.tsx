import "@/styles/globals.css";

import { type AppType } from "next/app";

import { api } from "@/lib/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default api.withTRPC(MyApp);
