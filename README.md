# 🌸 Radiant Glow Clinic — Website Project

## 📁 Folder Structure

```
radiant-glow-clinic/
│
├── index.html              ← Main Website (Public)
│
├── admin/
│   └── index.html          ← Admin Portal (SEPARATE URL — staff only)
│
└── assets/
    ├── css/
    │   ├── style.css       ← Main website styles
    │   └── admin.css       ← Admin portal styles
    └── js/
        ├── main.js         ← Main website logic + booking
        └── admin.js        ← Admin dashboard logic
```

---

## 🌐 URLs After Deployment

| Page              | URL                                 |
|-------------------|-------------------------------------|
| Home              | https://radiantglow.com           |
| Admin Portal      | https://yourdomain.com/admin/       |

Admin URL is completely separate — not linked anywhere on the main website.

---

## 🔐 Admin Login

- Username: admin
- Password: radiant2025

IMPORTANT: Change these in /assets/js/admin.js before going live!

---

## 🚀 How to Run in VS Code

1. Open the radiant-glow-clinic folder in VS Code
2. Install the Live Server extension
3. Right-click index.html → Open with Live Server
4. For admin: open admin/index.html with Live Server

---

## 📱 Features

### Main Website
- Responsive mobile-first design
- 5-page SPA (Home, Services, Gallery, Booking, Location)
- Appointment booking form
- Floating WhatsApp button
- Pink + Gold premium aesthetic

### Admin Portal (/admin/)
- Secure login — completely separate URL
- noindex meta tag (hidden from Google)
- Overview dashboard with stats
- Appointment management (Confirm / Reschedule / Done)
- Service and pricing editor
- Leads viewer with CSV export

---

## 🛠️ Customization Checklist

- Replace phone number +91 98765 43210 with real number
- Replace email hello@radiantglowlko.com with real email
- Update Google Maps link with exact clinic address
- Add real Before/After photos to gallery
- Change admin password in assets/js/admin.js
- Add Instagram handle in gallery section
