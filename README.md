# 🌸 PCOS Care Hub
### PUSL3190 Computing Project — University of Plymouth (NSBM)

**Student:** Unagollage Wijesinghe | **Index:** 10952470  
**Supervisor:** Ms. Dulanjali Wijesekara  
**Programme:** BSc (Hons) Software Engineering  

---

## 📁 Project Structure

```
pcos-hub/
│
├── index.html                        ← Home / Landing Page
│
├── src/
│   ├── pages/
│   │   ├── patient-dashboard.html    ← Patient Portal (7 sections)
│   │   ├── hospital-dashboard.html   ← Hospital Portal (5 sections)
│   │   └── admin-dashboard.html      ← Admin Panel (5 sections)
│   │
│   ├── styles/
│   │   ├── global.css                ← CSS variables, reset, shared components
│   │   ├── home.css                  ← Landing page specific styles
│   │   └── dashboard.css             ← All dashboard shared styles
│   │
│   ├── scripts/
│   │   ├── home.js                   ← Scroll reveal, counters, parallax
│   │   ├── patient-dashboard.js      ← Symptom tracker, cycle calendar, chatbot
│   │   ├── hospital-dashboard.js     ← Table search, animations
│   │   └── admin-dashboard.js        ← Growth chart, user management
│   │
│   └── components/
│       ├── navbar.html               ← Reusable navbar snippet (reference)
│       └── footer.html               ← Reusable footer snippet (reference)
│
├── assets/
│   ├── images/                       ← Page images, banners (add as needed)
│   ├── icons/                        ← Custom SVG icons (add as needed)
│   └── fonts/                        ← Local font files (optional, uses Google Fonts CDN)
│
├── public/
│   └── favicon.ico                   ← Site favicon (add as needed)
│
└── README.md                         ← This file
```

---

## 🚀 How to Run

**No build tools, no server needed.** Simply open in a browser:

```
double-click → index.html
```

Or serve locally with VS Code's **Live Server** extension for the best experience.

---

## 🔗 Page Navigation

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with features, research, and role portals |
| Patient Dashboard | `src/pages/patient-dashboard.html` | Symptom tracker, cycle calendar, reports, diet, chatbot |
| Hospital Dashboard | `src/pages/hospital-dashboard.html` | Patient records, lab results, consultations, upload |
| Admin Dashboard | `src/pages/admin-dashboard.html` | Hospital registry, user management, system health |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (semantic) |
| Styling | CSS3 (custom properties, flexbox, grid, animations) |
| Scripting | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts — Playfair Display + Nunito |
| Icons | Inline SVG |
| No frameworks | Pure HTML/CSS/JS — zero dependencies |

---

## ✨ Features

- **Scroll reveal animations** — elements animate in as you scroll
- **Interactive cycle calendar** — period, fertile, ovulation day tracking
- **Symptom toggle tracker** — click to log symptoms with severity slider
- **AI Care Assistant chatbot** — PCOS-specific Q&A with quick prompts
- **Mini bar charts** — activity and growth visualisations
- **Progress bars** — animated health goal tracking
- **Toast notifications** — feedback on every user action
- **Parallax hero** — decorative background elements respond to scroll
- **Hover transitions** — cards lift, borders animate, buttons transform
- **Responsive design** — works on desktop, tablet, and mobile
- **Detailed footer** — with PCOS resources, project info, and health disclaimer

---

## 📚 Research References

1. WHO (2023) — Polycystic Ovary Syndrome fact sheet
2. Arabkermani et al. (2025) — JMIR Mobile App Rating Study
3. Fahimeh Solat et al. (2025) — BMC Women's Health
4. Teede et al. (2023) — International PCOS Guideline, JCEM
5. Wang et al. (2025) — AI in PCOS Management, PMC
6. Kumarapeli et al. (2011) — South Asian PCOS, NIH

---

## 🔒 Security Design

- Role-based access: Admin / Patient / Hospital (separate portals)
- Two-factor authentication (2FA) planned for backend
- AES-256 encryption for medical record storage
- Hospital-mediated doctor access (no direct doctor login)
- HIPAA-inspired data handling principles

---

*© 2026 PCOS Care Hub · PUSL3190 Computing Project · University of Plymouth*
