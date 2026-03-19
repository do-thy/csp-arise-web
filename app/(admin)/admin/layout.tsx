import styles from "./admin.module.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Admin CMS",
  description: "Admin dashboard for campus management system",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className={styles.adminContainer}>
          <aside className={styles.sidebar}>
            <div className={styles.logo}>ADMIN CMS</div>
            <nav className={styles.nav}>
              <ul>
                <li className={`${styles.navItem} ${styles.active}`}>
                  Dashboard
                </li>

                <li className={styles.navItem}>
                  Campuses
                </li>

                <li className={styles.subItem}>
                  DigiCampus
                </li>

                <li className={styles.subItem}>
                  Main Campus
                </li>

                <li className={styles.navItem}>Rooms</li>
                <li className={styles.navItem}>3D Models</li>
                <li className={styles.navItem}>Users</li>
                <li className={styles.navItem}>Settings</li>
              </ul>
            </nav>
          </aside>
          <main className={styles.mainContent}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}