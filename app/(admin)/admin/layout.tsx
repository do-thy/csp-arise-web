import styles from "./admin.module.css";
import { Poppins } from "next/font/google";
import AdminSidebar from "./adminsidebar";

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
    <div className={`${styles.adminContainer} ${poppins.className}`}>
      {/* Sidebar - Handles its own responsive visibility */}
      <AdminSidebar />

      {/* Main Content Area - Image-free and background-colored via CSS module */}
      <main className={styles.pageContainer}>
        {children}
      </main>
    </div>
  );
}