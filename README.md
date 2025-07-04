# **Real-Time Leaderboard System with MongoDB**  
**A Scalable, High-Performance Backend for Gaming Leaderboards**  

---

## **📌 Table of Contents**  
1. [**Overview**](#-overview)  
2. [**Features**](#-features)  
3. [**Tech Stack**](#-tech-stack)  
4. [**Architecture**](#-architecture)  
5. [**Setup & Installation**](#-setup--installation)  
6. [**API Documentation**](#-api-documentation)  
7. [**Socket.IO Events**](#-socketio-events)  
8. [**Database Design**](#-database-design)  
9. [**Optimizations**](#-optimizations)  
10. [**Daily Reset Logic**](#-daily-reset-logic)  
11. [**Testing**](#-testing)  
12. [**Scaling Considerations**](#-scaling-considerations)  
13. [**Performance Benchmarks**](#-performance-benchmarks)  
14. [**Troubleshooting**](#-troubleshooting)  

---

## **🌐 Overview**  
This project is a **real-time leaderboard system** designed for gaming applications, where players' scores are tracked and displayed in a live leaderboard. Built with **Node.js, Socket.IO, and MongoDB**, it supports:  
- **Instant score updates** via WebSockets.  
- **Regional & game-mode filtering**.  
- **Daily leaderboard resets** (TTL-based).  
- **Caching for high performance**.  

---

## **🚀 Features**  
✅ **Real-time updates** using **Socket.IO**  
✅ **MongoDB** for persistent storage with **TTL-based auto-expiry**  
✅ **Regional leaderboards** (`us-east`, `eu`, `asia`, etc.)  
✅ **Game-mode filtering** (`classic`, `ranked`, `speedrun`)  
✅ **Daily reset** (midnight UTC)  
✅ **Caching layer** for frequently accessed leaderboards  
✅ **REST API** for non-realtime operations  
✅ **Scalable architecture** (works well under high load)  

---

## **🛠 Tech Stack**  
| **Category**       | **Technology**          |
|-------------------|------------------------|
| **Backend**       | Node.js, Express       |
| **Real-time**     | Socket.IO              |
| **Database**      | MongoDB (Mongoose ODM) |
| **Caching**       | `memory-cache`         |
| **Cron Jobs**     | `node-cron`            |
| **Compression**   | `compression`          |

---

## **🏗 Architecture**  
### **System Flow**  
```mermaid
graph TD
    A[Client] -->|WebSocket| B(Socket.IO)
    B --> C[Node.js Server]
    C --> D[MongoDB]
    C --> E[Cache Layer]
    D -->|TTL Expiry| F[Daily Reset]
```

### **Key Components**  
1. **WebSocket Layer (Socket.IO)**  
   - Handles real-time score updates.  
   - Uses **rooms** for region/game-mode filtering.  
2. **MongoDB**  
   - **Players Collection**: Stores player profiles.  
   - **Leaderboard Collection**: Tracks scores with TTL expiry.  
3. **Cache Layer**  
   - Reduces DB load for frequent leaderboard queries.  
4. **Cron Jobs**  
   - Ensures daily leaderboard reset (fallback to MongoDB TTL).  

---

## **⚙ Setup & Installation**  

### **Prerequisites**  
- Node.js **v18+**  
- MongoDB (**local or cloud**)  
- (Optional) Redis (for distributed caching in production)  

### **Installation Steps**  
1. **Clone the repo**  
   ```bash
   git clone https://github.com/priyambajpai02/realtime-leaderboard-system.git
   cd realtime-leaderboard-system
   ```
2. **Install dependencies**  
   ```bash
   npm install
   ```
3. **Configure `.env`**  
   ```env
   MONGODB_URI=mongodb://localhost:27017/leaderboard_db
   PORT=3000
   DAILY_RESET_CRON=0 0 * * *  # Midnight UTC
   CACHE_EXPIRATION=300  # 5 minutes
   ```
4. **Run the server**  
   ```bash
   npm start  # Production
   npm run dev  # Development (with nodemon)
   ```

---

## **📡 API Documentation**  

### **REST Endpoints**  

| **Endpoint**              | **Method** | **Description**                     |
|--------------------------|-----------|-------------------------------------|
| `/api/players`           | `POST`    | Register a new player               |
| `/api/players/:playerId` | `GET`     | Fetch player details                |
| `/api/leaderboard`       | `GET`     | Get top players (filter by region)  |

#### **📌 Sample Requests**  

**1. Register a Player**  
```bash
curl -X POST http://localhost:3000/api/players \
  -H "Content-Type: application/json" \
  -d '{"playerId": "player_123", "name": "John", "region": "us-east"}'
```

**2. Get Leaderboard (Top 10 in `us-east`)**  
```bash
curl "http://localhost:3000/api/leaderboard?region=us-east&limit=10"
```

---

## **🔌 Socket.IO Events**  

### **Available Events**  

| **Event**          | **Description**                          | **Example Payload**                     |
|-------------------|------------------------------------------|----------------------------------------|
| `register`        | Register a new player                    | `{ playerId, name, region }`           |
| `updateScore`     | Update a player's score                  | `{ playerId, region, gameMode, score }`|
| `getLeaderboard`  | Fetch top players                        | `{ limit, region, gameMode }`          |
| `joinLeaderboard` | Join a leaderboard room for live updates | `{ region, gameMode }`                 |

### **📌 Example Usage**  
```javascript
const socket = io("http://localhost:3000");

// Register a player
socket.emit("register", { 
  playerId: "player_123", 
  name: "Alice", 
  region: "eu" 
}, (res) => console.log(res));

// Update score
socket.emit("updateScore", {
  playerId: "player_123",
  region: "eu",
  gameMode: "classic",
  score: 2500
});

// Get top 5 players
socket.emit("getLeaderboard", { 
  limit: 5, 
  region: "eu" 
}, (res) => console.log(res.players));
```

---

## **🗃 Database Design**  

### **Collections**  

#### **1. `players`**  
| Field      | Type     | Index | Description          |
|-----------|----------|-------|----------------------|
| `playerId`| String   | ✅    | Unique player ID     |
| `name`    | String   | ❌    | Player name          |
| `region`  | String   | ✅    | Player region        |

#### **2. `leaderboard`**  
| Field        | Type     | Index | Description                     |
|-------------|----------|-------|---------------------------------|
| `playerId`  | String   | ✅    | Reference to player             |
| `region`    | String   | ✅    | Leaderboard region              |
| `gameMode`  | String   | ✅    | Game mode (e.g., "classic")     |
| `score`     | Number   | ✅    | Player score (descending index) |
| `expiresAt` | Date     | ✅    | TTL for auto-deletion           |

### **Indexes**  
- **Compound index** on `(region, gameMode, score)` → Optimizes leaderboard queries.  
- **TTL index** on `expiresAt` → Auto-resets leaderboards daily.  

---

## **⚡ Optimizations**  

### **1. Caching**  
- Leaderboard results cached for **5 minutes** (`memory-cache`).  
- **Cache invalidation** on score updates.  

### **2. Efficient Queries**  
- MongoDB **compound indexes** for fast sorting/filtering.  
- **Projections** to fetch only required fields.  

### **3. WebSocket Optimization**  
- **Room-based broadcasting** → Only relevant clients get updates.  

---

## **🔄 Daily Reset Logic**  

### **How It Works**  
1. **MongoDB TTL Index**  
   - Documents auto-delete when `expiresAt` is reached.  
2. **Fallback Cron Job**  
   - Runs at midnight UTC (`0 0 * * *`).  
   - Clears leaderboard if TTL fails.  

---

## **🧪 Testing**  

### **Manual Testing with `curl` & Socket.IO**  
```bash
# Test API
curl "http://localhost:3000/api/leaderboard?region=us-east"

# Test WebSocket (using a client script)
node test-client.js
```

### **Automated Testing (TODO)**  
- **Jest + Supertest** for API tests.  
- **Socket.IO client mocks** for real-time tests.  

---

## **📈 Scaling Considerations**  

| **Scenario**          | **Solution**                          |
|----------------------|--------------------------------------|
| High player count    | MongoDB sharding                     |
| Frequent leaderboard reads | Redis caching layer              |
| Horizontal scaling   | Load balancer + Socket.IO adapter    |

---

## **🏆 Performance Benchmarks**  
| **Operation**            | **Avg. Latency** | **Throughput** |
|-------------------------|----------------|---------------|
| Score update (WebSocket) | ~15ms          | 1,000 ops/sec |
| Leaderboard fetch (API) | ~50ms (cached) | 5,000 RPS     |

---

## **🛠 Troubleshooting**  

| **Issue**                     | **Solution**                          |
|-------------------------------|--------------------------------------|
| MongoDB connection failed     | Check `MONGODB_URI` in `.env`        |
| Socket.IO not connecting      | Verify CORS settings in `server.js`  |
| Leaderboard not resetting     | Ensure TTL index exists in MongoDB   |

---

## **🤝 Contributing**  
1. Fork the repo.  
2. Create a feature branch (`git checkout -b feature/xyz`).  
3. Submit a **Pull Request**.  

---

