import Link from "next/link";
import { SignOut } from "./AuthButton";


export const metadata = {
  title: "Navbar",
  description: "The navigation bar component for the ARISE web application.",
};

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400","500","600","700"],
});

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">ARISE</div>

      <div className="nav-center">
        <Link href="/">
          <p>HOMPAGE</p>
        </Link>

        <Link href="/map">
          <p>MAP</p>
        </Link>

        <Link href="/search">
          <p>SEARCH</p>
        </Link>


      </div>

      <div className="nav-right">
        <SignOut />
      </div>
    </nav>
  );
}