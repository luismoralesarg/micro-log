# micro.log

Zero-knowledge encrypted micro-journaling app.

## Features

- 📖 Daily log with bullet-style entries
- 🏷️ Tags (#project) and mentions (@person)
- 🌙 Dreams journal
- 📝 Notes for longer content
- 💡 Ideas tracker with status
- ✨ Quotes collection
- 📊 Stats and insights
- 🔒 End-to-end encryption
- 🌓 Dark/light mode
- 💳 Stripe subscriptions ($2/month, 14-day trial)

## Quick Start

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your Firebase & Stripe keys

# Run development
npm run dev

# Run desktop app
npm run electron:dev
```

## Setup

1. Create Firebase project and enable Auth + Firestore
2. Create Stripe product ($2/month)
3. Configure webhook in Stripe Dashboard
4. Add environment variables
5. Deploy: `npm run deploy`

## Security

All data is encrypted client-side with AES-256-GCM.  
The server only stores encrypted blobs.  
**If you lose your passphrase, data cannot be recovered.**

## License

MIT
