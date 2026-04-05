import { redirect } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-container">
      <h1 className="home-title">ARISE</h1>

      <div className="home-buttons">
        <Link href="/map">
          <button>MAP</button>
        </Link>
        <Link href="/search">
          <button>ROOM SEARCH</button>
        </Link>
      </div>
    </div>
  );
}

