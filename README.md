# Render API (SVG & HTML → PNG)

Private API for rendering **SVG** and **HTML** into **PNG images**, always returned as **Base64** strings.  
Designed for dynamic, on-demand image generation (avatars, posters, visual variants, etc.) without storing files.

---

## ✨ Features

- SVG → PNG rendering using **Sharp**
- HTML → PNG rendering using **Puppeteer (Chromium)**
- Supports:
  - External CSS files
  - Web fonts
  - Remote images
- Real rendering (not URL screenshots)
- Base64 output (no file storage)
- Browser reuse for better performance
- API key authentication
- CORS enabled
- Cloud Run–ready

---

## 🛠 Tech Stack

- Node.js
- Express
- Puppeteer
- Sharp
- Chromium
- Docker / Google Cloud Run

---

## 🔐 Authentication

All requests must include the following header:

x-api-key: YOUR_API_SECRET
Set via environment variable:

API_SECRET=your_secret_key


---

## 📌 Endpoints

---

### `POST /svg`

Converts raw SVG code into a PNG image.

#### Request Body SVG (JSON)

```json
{
  "svg": "<svg>...</svg>",
  "width": 512,
  "height": 512
}

#### Response (JSON)

{
  "status": "success",
  "data": {
    "mime": "image/png",
    "width": 512,
    "height": 512,
    "image": "BASE64_STRING"
  }
}

#### Request Body Poster (JSON)

{
  "html": "<!DOCTYPE html><html>...</html>",
  "width": 1200,
  "height": 1600,
  "deviceScaleFactor": 1,
  "background": true
}

#### Response (JSON)

{
  "status": "success",
  "data": {
    "mime": "image/png",
    "width": 1200,
    "height": 1600,
    "image": "BASE64_STRING"
  }
}