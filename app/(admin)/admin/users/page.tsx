"use client";

import styles from "../admin.module.css";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/configs/firebase";

import {
  Users,
  ShieldCheck,
  Mail,
  Globe,
  Search,
} from "lucide-react";

interface UserData {
  id: string;
  username: string;
  name: string;
  email: string;
  provider: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    admins: 0,
    emailUsers: 0,
    googleUsers: 0,
  });

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      user.username.toLowerCase().includes(search) ||
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "users")
        );

        const fetchedUsers: UserData[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            username: data.username || "N/A",
            name: data.name || "N/A",
            email: data.email || "N/A",
            provider: data.provider || "email",
            role: data.role || "user",
          };
        });

        setUsers(fetchedUsers);

        const adminCount = fetchedUsers.filter(
          (user) => user.role === "admin"
        ).length;

        const emailCount = fetchedUsers.filter(
          (user) => user.provider === "email"
        ).length;

        const googleCount = fetchedUsers.filter(
          (user) => user.provider === "google"
        ).length;

        setUserStats({
          totalUsers: fetchedUsers.length,
          admins: adminCount,
          emailUsers: emailCount,
          googleUsers: googleCount,
        });

      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Users Management
          </h1>

          <p className={styles.subtitle}>
            Manage registered users and administrator roles.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        {/* TOTAL USERS */}
        <div className={`${styles.statCard} ${styles.blueBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.blue}`}>
            <Users size={28} />
          </div>

          <h3>Total Users</h3>

          <h1>{userStats.totalUsers}</h1>

          <p>Registered Accounts</p>
        </div>

        {/* ADMINS */}
        <div className={`${styles.statCard} ${styles.purpleBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.purple}`}>
            <ShieldCheck size={28} />
          </div>

          <h3>Administrators</h3>

          <h1>{userStats.admins}</h1>

          <p>System Admins</p>
        </div>

        {/* EMAIL USERS */}
        <div className={`${styles.statCard} ${styles.greenBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.green}`}>
            <Mail size={28} />
          </div>

          <h3>Email Accounts</h3>

          <h1>{userStats.emailUsers}</h1>

          <p>Email Authentication</p>
        </div>

        {/* GOOGLE USERS */}
        <div className={`${styles.statCard} ${styles.orangeBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.orange}`}>
            <Globe size={28} />
          </div>

          <h3>Google Accounts</h3>

          <h1>{userStats.googleUsers}</h1>

          <p>Google Authentication</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        {/* TABLE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Registered Users
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage registered users and administrator roles.
            </p>
          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3 w-full md:w-[300px]">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-y-4">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className="w-[16%] text-left px-5">
                  Username
                </th>

                <th className="w-[18%] text-left px-5">
                  Name
                </th>

                <th className="w-[24%] text-left px-5">
                  Email
                </th>

                <th className="w-[14%] text-center px-5">
                  Provider
                </th>

                <th className="w-[14%] text-center px-5">
                  Role
                </th>

                <th className="w-[14%] text-center px-5">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="bg-gray-50">
                  {/* USERNAME */}
                  <td className="rounded-l-2xl px-5 py-5 font-medium text-gray-800">
                    {user.username}
                  </td>

                  {/* NAME */}
                  <td className="px-5 py-5">
                    {user.name}
                  </td>

                  {/* EMAIL */}
                  <td className="px-5 py-5 text-gray-600">
                    {user.email}
                  </td>

                  {/* PROVIDER */}
                  <td className="px-5 py-5">
                    <div className="flex justify-center">
                      <span
                        className={`
                          inline-flex items-center px-3 py-1 rounded-full
                          text-xs font-semibold capitalize

                          ${
                            user.provider === "google"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        `}
                      >
                        {user.provider}
                      </span>
                    </div>
                  </td>

                  {/* ROLE */}
                  <td className="px-5 py-5">
                    <div className="flex justify-center">
                      <select
                        className={`
                          w-[160px]
                          text-sm font-semibold capitalize
                          rounded-xl px-4 py-3
                          outline-none border-none
                          cursor-pointer

                          ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }
                        `}
                        defaultValue={user.role}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="rounded-r-2xl px-5 py-5">
                    <div className="flex justify-center">
                      <button
                        className="
                          w-[100px]
                          bg-red-100 hover:bg-red-200
                          text-red-600
                          px-4 py-3
                          rounded-xl
                          text-sm font-semibold
                          transition
                        "
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}