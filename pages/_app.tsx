import "@/styles/globals.css";
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
