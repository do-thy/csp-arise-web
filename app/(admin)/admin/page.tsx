import styles from "./admin.module.css";
import Image from "next/image";
import universityIcon from "./image/college.png";
import buildingIcon from "./image/building.png";
import floorIcon from "./image/multistorey.png";
import roomIcon from "./image/classroom.png";
import modelIcon from "./image/3d-modeling.png";
import mainCampus from "./image/mainCampus.png";
import digiCampus from "./image/digiCampus.png";
import update from "./image/changes.png";


export default function AdminPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.cardRow}>
          <div className={styles.card}>
            <Image
              src={universityIcon}
              alt="University Icon"
              height={80}
            />
            <div className={styles.cardText}>
              <p>Campuses</p>
              <h2>2</h2>
            </div>
          </div>

          <div className={styles.card}>
            <Image
              src={buildingIcon}
              alt="Building Icon"
              height={80}
            />
            <div className={styles.cardText}>
              <p>Buildings</p>
              <h2>4</h2>
            </div>
          </div>

          <div className={styles.card}>
            <Image
              src={floorIcon}
              alt="Floor Icon"
              height={80}
            />
            <div className={styles.cardText}>
              <p>Floors</p>
              <h2>12</h2>
            </div>
          </div>

          <div className={styles.card}>
            <Image
              src={roomIcon}
              alt="Room Icon"
              height={80}
            />
            <div className={styles.cardText}>
              <p>Rooms</p>
              <h2>210</h2>
            </div>
          </div>

          <div className={styles.card}>
            <Image
              src={modelIcon}
              alt="3D Model Icon"
              height={80}
            />
            <div className={styles.cardText}>
              <p>3D Models</p>
              <h2>9</h2>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Campus Overview</h2>
          <div className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <div className={styles.overviewText}>
                <h3>DigiCampus</h3>
                <p>Buildings: 1</p>
                <p>Floors: 4</p>
                <p>Rooms: 50</p>
              </div>
              <div className={styles.overviewImage}>
                <Image src={digiCampus} alt="DigiCampus" width={120} />
              </div>
            </div>
            <div className={styles.overviewCard}>
              <div className={styles.overviewText}>
                <h3>Main Campus</h3>
                <p>Buildings: 3</p>
                <p>Floors: 8</p>
                <p>Rooms: 160</p>
              </div>
              <div className={styles.overviewImage}>
                <Image src={mainCampus} alt="Main Campus" width={120} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.section2}>
          <h3>Recent Updates</h3>

          <div className={styles.updatesList}>
            <div className={styles.updateItem}>
              <Image src={update} alt="Update" width={40} height={40} />
              <span>Room 402 added</span>
            </div>

            <div className={styles.updateItem}>
              <Image src={update} alt="Update" width={40} height={40} />
              <span>Room 101 updated</span>
            </div>

            <div className={styles.updateItem}>
              <Image src={update} alt="Update" width={40} height={40} />
              <span>3D Model uploaded</span>
            </div>
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.btn}>+ Add Room</button>
          <button className={styles.btn}>+ Add Floor</button>
          <button className={styles.btn}>+ Upload 3D Model</button>
        </div>
      </div>
    </div>
  );
}