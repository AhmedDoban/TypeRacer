import { Inter } from "next/font/google";
import "@/Style/root.css";
import "@/Style/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/Components/Header/Header.jsx";
import "../../node_modules/@fortawesome/fontawesome-free/css/all.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TypeRacer",
  description:
    "TypeRacer is a thrilling online typing game that challenges players to test and improve their typing speed and accuracy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
