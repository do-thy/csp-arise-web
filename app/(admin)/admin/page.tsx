"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/configs/firebase";
import styles from "./admin.module.css";
import {
  Building2,
  Building,
  Layers3,
  MapPinned,
  DoorOpen,
  Boxes,
  Users,
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState({
    campuses: 2,
    buildings: 0,
    floors: 0,
    nodes: 0,
    rooms: 0,
    models: 9,
    users: 8,
  });

  const [campusStats, setCampusStats] = useState({
    digi: {
      buildings: 0,
      floors: 0,
      rooms: 0,
      nodes: 0,
    },

    main: {
      buildings: 0,
      floors: 0,
      rooms: 0,
      nodes: 0,
    },
  });

  useEffect(() => {

  const fetchDashboardStats = async () => {
    try {
      const digitalSnapshot = await getDocs(
        collection(db, "Nodes_Digital")
      );

      const mainSnapshot = await getDocs(
        collection(db, "Nodes_Main")
      );

      const digiBuildings = new Set<string>();
      const digiFloors = new Set<string>();

      let digiRooms = 0;

      digitalSnapshot.docs.forEach((doc) => {
        const data = doc.data();

        if (data.building) {
          digiBuildings.add(data.building);
        }

        if (data.building && data.floor) {
          digiFloors.add(`${data.building}-${data.floor}`);
        }

        if (Array.isArray(data.rooms)) {
          digiRooms += data.rooms.length;
        }
      });

      const mainBuildings = new Set<string>();
      const mainFloors = new Set<string>();

      let mainRooms = 0;

      mainSnapshot.docs.forEach((doc) => {
        const data = doc.data();

        if (data.building) {
          mainBuildings.add(data.building);
        }

        if (data.building && data.floor) {
          mainFloors.add(`${data.building}-${data.floor}`);
        }

        if (Array.isArray(data.rooms)) {
          mainRooms += data.rooms.length;
        }
      });

      const allDocs = [
        ...digitalSnapshot.docs,
        ...mainSnapshot.docs,
      ];

      const buildings = new Set<string>();
      const floors = new Set<string>();

      let totalRooms = 0;

      allDocs.forEach((doc) => {
        const data = doc.data();

        if (data.building) {
          buildings.add(data.building);
        }

        if (data.building && data.floor) {
          floors.add(`${data.building}-${data.floor}`);
        }

        if (Array.isArray(data.rooms)) {
          totalRooms += data.rooms.length;
        }
      });

      setStats({
        campuses: 2,
        buildings: buildings.size,
        floors: floors.size,
        nodes: allDocs.length,
        rooms: totalRooms,
        models: 9,
        users: 8,
      });

      setCampusStats({
        digi: {
          buildings: digiBuildings.size,
          floors: digiFloors.size,
          rooms: digiRooms,
          nodes: digitalSnapshot.docs.length,
        },

        main: {
          buildings: mainBuildings.size,
          floors: mainFloors.size,
          rooms: mainRooms,
          nodes: mainSnapshot.docs.length,
        },
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  fetchDashboardStats();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, Admin! Here&apos;s what&apos;s happening with your
            3D Navigation System.
          </p>
        </div>

        <div className={styles.dateBox}>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* STATISTICS */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.redBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.red}`}>
            <Building2 size={28} />
          </div>

          <h3>Campuses</h3>
          <h1>{stats.campuses}</h1>
          <p>Active Campuses</p>
        </div>

        <div className={`${styles.statCard} ${styles.orangeBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.orange}`}>
            <Building size={28} />
          </div>

          <h3>Buildings</h3>
          <h1>{stats.buildings}</h1>
          <p>Connected Buildings</p>
        </div>

        <div className={`${styles.statCard} ${styles.yellowBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.yellow}`}>
            <Layers3 size={28} />
          </div>

          <h3>Floors</h3>
          <h1>{stats.floors}</h1>
          <p>Mapped Floors</p>
        </div>

        <div className={`${styles.statCard} ${styles.purpleBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.purple}`}>
            <MapPinned size={28} />
          </div>

          <h3>Navigation Nodes</h3>
          <h1>{stats.nodes}</h1>
          <p>Active Nodes</p>
        </div>

        <div className={`${styles.statCard} ${styles.blueBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.blue}`}>
            <DoorOpen size={28} />
          </div>

          <h3>Rooms</h3>
          <h1>{stats.rooms}</h1>
          <p>Registered Rooms</p>
        </div>

        <div className={`${styles.statCard} ${styles.greenBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.green}`}>
            <Boxes size={28} />
          </div>

          <h3>3D Models</h3>
          <h1>{stats.models}</h1>
          <p>Uploaded Models</p>
        </div>

        <div className={`${styles.statCard} ${styles.cyanBorder}`}>
          <div className={`${styles.iconWrapper} ${styles.cyan}`}>
            <Users size={28} />
          </div>

          <h3>Users</h3>
          <h1>{stats.users}</h1>
          <p>System Users</p>
        </div>
      </div>

      {/* CAMPUS OVERVIEW */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Campus Overview</h2>

        <div className={styles.overviewGrid}>
          {/* DIGICAMPUS */}
          <div className={styles.overviewCard}>
            <div className={styles.overviewHeader}>
              <div className={`${styles.overviewIcon} ${styles.red}`}>
                <Building2 size={26} />
              </div>

              <div>
                <h3>DigiCampus</h3>
                <span className={styles.badge}>Primary</span>
              </div>
            </div>

            <div className={styles.overviewStats}>
              <div>
                <h2>{campusStats.digi.buildings}</h2>
                <p>Building</p>
              </div>

              <div>
                <h2>{campusStats.digi.floors}</h2>
                <p>Floors</p>
              </div>

              <div>
                <h2>{campusStats.digi.rooms}</h2>
                <p>Rooms</p>
              </div>

              <div>
                <h2>{campusStats.digi.nodes}</h2>
                <p>Nodes</p>
              </div>
            </div>
          </div>

          {/* MAIN CAMPUS */}
          <div className={styles.overviewCard}>
            <div className={styles.overviewHeader}>
              <div className={`${styles.overviewIcon} ${styles.blue}`}>
                <Building size={26} />
              </div>

              <div>
                <h3>Main Campus</h3>
                <span className={styles.badgeBlue}>Primary</span>
              </div>
            </div>

            <div className={styles.overviewStats}>
              <div>
                <h2>{campusStats.main.buildings}</h2>
                <p>Buildings</p>
              </div>

              <div>
                <h2>{campusStats.main.floors}</h2>
                <p>Floors</p>
              </div>

              <div>
                <h2>{campusStats.main.rooms}</h2>
                <p>Rooms</p>
              </div>

              <div>
                <h2>{campusStats.main.nodes}</h2>
                <p>Nodes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className={styles.bottomGrid}>
        {/* RECENT UPDATES */}
        <div className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h3>Recent Updates</h3>
            <button>View All</button>
          </div>

          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={`${styles.activityDot} ${styles.green}`} />

              <div>
                <h4>Room 402 added</h4>
                <p>DigiCampus • 2nd Floor</p>
              </div>

              <span>2 mins ago</span>
            </div>

            <div className={styles.activityItem}>
              <div className={`${styles.activityDot} ${styles.blue}`} />

              <div>
                <h4>Room 101 updated</h4>
                <p>Main Campus • 3rd Floor</p>
              </div>

              <span>15 mins ago</span>
            </div>

            <div className={styles.activityItem}>
              <div className={`${styles.activityDot} ${styles.purple}`} />

              <div>
                <h4>3D Model uploaded</h4>
                <p>Gd_1_MainBuilding.glb</p>
              </div>

              <span>1 hour ago</span>
            </div>

            <div className={styles.activityItem}>
              <div className={`${styles.activityDot} ${styles.orange}`} />

              <div>
                <h4>Link connection created</h4>
                <p>Hallway 1 ↔ Room 305</p>
              </div>

              <span>2 hours ago</span>
            </div>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className={styles.statusCard}>
          <div className={styles.cardHeader}>
            <h3>System Status</h3>
            <button>View Details</button>
          </div>

          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <div>
                <h4>Database</h4>
                <p>Healthy</p>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: "98%" }}
                />
              </div>

              <span>98%</span>
            </div>

            <div className={styles.statusItem}>
              <div>
                <h4>Storage</h4>
                <p>Healthy</p>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: "85%" }}
                />
              </div>

              <span>85%</span>
            </div>

            <div className={styles.statusItem}>
              <div>
                <h4>3D Models</h4>
                <p>Healthy</p>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: "76%" }}
                />
              </div>

              <span>76%</span>
            </div>

            <div className={styles.statusItem}>
              <div>
                <h4>Navigation Network</h4>
                <p>Healthy</p>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: "92%" }}
                />
              </div>

              <span>92%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}