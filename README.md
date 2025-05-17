
# Offline Mode POS System (Inspired by Moniepoint)

This is a backend-only system that replicates how fintechs like Moniepoint and OPay handle offline transactions in low-connectivity environments. It simulates local transaction queuing, smart retry mechanisms, geo-tagging, and device-based isolation — all with Node.js, Redis, MySQL, and no frontend.

---

## 🚀 Key Features

- **Offline Transaction Queuing:**  
  Transactions are stored locally using Redis when internet access is unavailable, simulating real-world POS behavior.

- **Smart Background Sync Engine:**  
  A background service automatically retries syncing queued transactions to the main MySQL database with exponential backoff logic.

- **Geo-Tagging:**  
  Every transaction includes latitude and longitude metadata to track where it occurred.

- **Duplicate Detection:**  
  Prevents double processing of identical transactions using UUID and timestamp-based matching.

- **Manual Force Sync Endpoint:**  
  A dedicated route allows manual resync in edge cases — mimicking real POS device logic.

- **Retry Tracking & Sync Logs:**  
  Each transaction tracks retry attempts, and all sync events are logged for agent visibility.

- **Device ID Isolation:**  
  Every transaction is tied to a unique device to ensure multi-terminal integrity.

- **Transaction History & Status:**  
  View all past transactions, whether synced or pending, per device.

---

## 📦 Tech Stack

- **Node.js** — Server runtime
- **Express.js** — Routing and API handling
- **Redis** — Simulated local queue for POS transactions
- **MySQL** — Central database for reconciliation and synced data
- **cron (node-cron)** — Background job scheduler for sync retries
- **Geo APIs / request IP** —  for capturing device location



---

## 🛠️ Setup & Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/offline-pos-backend.git
cd offline-pos-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up `.env` file**

```env
PORT=8000
MYSQL_DB_NAME=your_db
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
REDIS_URL=redis://localhost:6379
DEVICE_TOKEN=sample-dev-token
```

4. **Start Redis and MySQL locally**

5. **Run the project**

```bash
npm start
```

---

## 📮 API Endpoints

| Method | Route                       | Description                               |
| ------ | --------------------------- | ----------------------------------------- |
| `POST` | `/transactions/local`       | Queue a new transaction offline (Redis)   |
| `GET`  | `/transactions/local`       | Get all pending (unsynced) transactions   |
| `GET`  | `/transactions/history`     | View all transactions (synced + unsynced) |
| `POST` | `/transactions/sync/force`  | Manually trigger sync for a device        |
| `GET`  | `/transactions/logs`        | View sync attempt logs                    |
| `POST` | `/transactions/sync/engine` | (Auto-called) Background sync logic       |

---


---

## 🤔 What Problem Does It Solve?

In rural or low-bandwidth environments, POS terminals often lose connection. This system ensures:

* No transaction is lost due to poor internet
* Transactions are securely stored until the device reconnects
* Manual sync and tracking options for agents
* Real-time data reconciliation when internet resumes

---

## ✅ Testing Locally

Use **Postman** or **cURL** to test the following:

* Submit transactions with `POST /transactions/local`
* Simulate network loss (turn off DB or API temporarily)
* Trigger `/transactions/sync/engine` manually or via cron
* View sync attempts via `/transactions/logs`



---

## 🙌 About the Author

**Amadi Emmanuel**
Backend Developer | Fintech Infrastructure Enthusiast
If you're building bold ideas in payments, agent banking, or offline-first fintech, let’s collaborate!

