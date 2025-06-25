# 🏠 homelib - 1 Week MVP Planner

> Goal: Build a Raspberry Pi-powered local backup system for households.  
> Users can connect over Wi-Fi, create storage partitions, upload files, and access them via a clean UI.  
> Includes Redis LRU caching and optional cloud upload stubs.

---

## Day 1 — Project Bootstrap & Local Upload API

- [✅] Create basic REST API:
  - `GET /file` (download file)
  - `POST /file` (upload file)
  - `GET /files` (list files in disk with certain path or default root)
  - `GET /files-zip` (download multiple files as a zip *max 20)
  - `POST /user` (create a new user in the database)

- [✅] pass tests for all implemented apis

- [  ] set up middleware to track users
- [  ] create /mnt directory for Windows/MacOS users
- [✅] Store files to `homelib/mnt/{username}/`
- [  ] set up docker compose and database containers
- [  ] create simple user tables

---

## 🗓️ Day 2 — Frontend UI (Basic Dashboard)

- [ ] Create web UI (React, Next.js, or plain HTML/CSS)
- [ ] Login page (token-based or simple username/password)
- [ ] File upload form
- [ ] List uploaded files
- [ ] Storage info card (used/available)

✅ By end of day: Upload and view files via browser.

---

## 🗓️ Day 3 — Partitioning & Multi-User Support

- [ ] Add `/create-user` endpoint
- [ ] Separate directory for each user
- [ ] Only allow users to access their own files
- [ ] (Optional) Add “shared” folder flag for public access

✅ By end of day: Multiple users with their own file partitions.

---

## 🗓️ Day 4 — Redis LRU Caching Layer

- [ ] Integrate Redis
- [ ] Track file `last_accessed`, `hit_count`
- [ ] Use Redis as cache for recent files
- [ ] Evict least recently used files when full
- [ ] Log cache hits/misses

✅ By end of day: Redis caches recently accessed files.

---

## 🗓️ Day 5 — Cloud Sync (Stub) + Polish

- [ ] Add “Enable Cloud Backup” toggle in UI
- [ ] Stub function for cloud upload (e.g. `uploadToS3()`)
- [ ] Mark files as "synced to cloud" in DB
- [ ] Add total storage usage UI
- [ ] Refactor routes and error messages

✅ By end of day: App is functional, cloud toggle is visible.

---

## 🗓️ Day 6 — Device Discovery + Upload Tool

- [ ] Set up `avahi-daemon` → discoverable as `homelib.local`
- [ ] (Optional) Build CLI tool for uploading
- [ ] Test web upload from phones + laptops
- [ ] Support multi-file upload + drag-n-drop

✅ By end of day: Easily usable on LAN from multiple devices.

---

## 🗓️ Day 7 — Testing, Polish, Deployment

- [ ] Test end-to-end with 2+ users and 3+ devices
- [ ] Stress test Redis + HDD usage
- [ ] Polish frontend layout and language
- [ ] Write `README.md` with:
  - Project overview
  - Tech stack
  - Setup steps
  - Future improvements
- [ ] Capture screenshots or GIFs

✅ By end of day: MVP ready to demo, share, and deploy.

---

## 🛠️ Future Ideas (Post-MVP)

- Mobile app wrapper (React Native)
- Scheduled automatic backups
- End-to-end encryption
- Granular permission controls
- External access via Tailscale

---

