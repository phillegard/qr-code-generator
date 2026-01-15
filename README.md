# QR Code Generator

A web application for generating QR codes for URLs, text, contact information, and WiFi networks.

## Features

- **URL QR Codes** - Generate QR codes for websites (auto-adds `https://` if missing)
- **Text QR Codes** - Encode any plain text into a QR code
- **Contact QR Codes** - Create vCard QR codes with name, phone, email, organization, and website
- **WiFi QR Codes** - Share WiFi credentials (WPA/WPA2 or open networks)
- **Real-time Generation** - QR codes update instantly as you type
- **Download** - Save QR codes as PNG images
- **Copy Data** - Copy the encoded data to clipboard

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- QRious (QR code generation)

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Select a tab based on what you want to encode (URL, Text, Contact, or WiFi)
2. Fill in the form fields
3. The QR code generates automatically as you type
4. Click **Download** to save as PNG or **Copy Data** to copy the encoded string
