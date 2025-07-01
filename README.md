# homelib - 1 Week MVP Planner

**Goal**: Build a Raspberry Pi-powered local backup system for households.
Users can connect over Wi-Fi, create storage partitions, upload files, and access them via a clean UI.
Includes Redis LRU caching and optional cloud upload stubs.

---

## Day 1 - Project Bootstrap & Local Upload API

* [X] Create basic REST API:
  * [X] `GET /file` (download file)
  * [X] `POST /file` (upload file)
  * [X] `GET /files` (list files in disk with certain path or default root)
  * [X] `GET /files-zip` (download multiple files as a zip, max 20 files)
  * [X] `POST /user` (create a new user in the database)
* [X] Pass tests for all implemented APIs
* [X] Set up middleware to track users
* [X] Create `/mnt` directory for Windows/MacOS users
* [] Store files to `homelib/mnt/{username}/`
* [X] Set up Docker Compose and database containers
* [X] Create simple user tables
* [X] Seed user tables with two admin users
---

## Day 2 - Frontend UI (Basic Dashboard)

* [ ] Create web UI (React, Next.js, or plain HTML/CSS)
* [ ] Login page (token-based or simple username/password)
* [ ] File upload form
* [ ] List uploaded files
* [ ] Storage info card (used/available)

**Goal**: Upload and view files via browser.

---

## Day 3 - Partitioning & Multi-User Support

* [ ] Add `/create-user` endpoint
* [ ] Separate directory for each user
* [ ] Only allow users to access their own files
* [ ] Optional: Add shared folder flag for public access

**Goal**: Multiple users with their own file partitions.

---

## Day 4 - Redis LRU Caching Layer

* [ ] Integrate Redis
* [ ] Track file `last_accessed`, `hit_count`
* [ ] Use Redis as cache for recent files
* [ ] Evict least recently used files when full
* [ ] Log cache hits/misses

**Goal**: Redis caches recently accessed files.

---

## Day 5 - Cloud Sync (Stub) + Polish

* [ ] Add "Enable Cloud Backup" toggle in UI
* [ ] Stub function for cloud upload (e.g., `uploadToS3()`)
* [ ] Mark files as "synced to cloud" in DB
* [ ] Add total storage usage UI
* [ ] Refactor routes and error messages

**Goal**: App is functional with visible cloud backup toggle.

---

## Day 6 - Device Discovery + Upload Tool

* [ ] Set up `avahi-daemon` to make device discoverable as `homelib.local`
* [ ] Optional: Build CLI tool for uploading
* [ ] Test web upload from phones and laptops
* [ ] Support multi-file upload and drag-and-drop

**Goal**: Usable on LAN from multiple devices.

---

## Day 7 - Testing, Polish, Deployment

* [ ] Test end-to-end with 2+ users and 3+ devices
* [ ] Stress test Redis and HDD usage
* [ ] Polish frontend layout and language
* [ ] Write `README.md` with:

  * [ ] Project overview
  * [ ] Tech stack
  * [ ] Setup steps
  * [ ] Future improvements
* [ ] Capture screenshots or GIFs

**Goal**: MVP ready to demo, share, and deploy.

---

## Future Ideas (Post-MVP)

* [ ] Mobile app wrapper (React Native)
* [ ] Scheduled automatic backups
* [ ] End-to-end encryption
* [ ] Granular permission controls
* [ ] External access via Tailscale
