# 🚀 Launch.Meme

**Decentralized meme coin platform on Solana** - Create, trade, and manage meme tokens with seamless wallet integration.

## ✨ Features

- **🔍 Token Discovery** - Browse trending meme coins with real-time charts
- **🪙 Token Creation** - Launch your own meme coin with custom parameters
- **📊 Portfolio Management** - Track your holdings and performance
- **💰 Trading Interface** - Swap tokens with live market data
- **🎯 Rewards System** - Earn rewards for platform engagement
- **🔐 Multi-Wallet Support** - MetaMask, Trust Wallet, and more

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Blockchain**: Solana Web3.js
- **Wallets**: Wallet Adapter (MetaMask, Trust Wallet, Phantom)
- **Auth**: Privy.io
- **State**: Zustand + React Query
- **Charts**: Recharts

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/launch.meme_web.git
cd launch.meme_web

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start development server
pnpm dev
```

### Build for Production

```bash
pnpm build
pnpm preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Design system components
│   └── pages/          # Page-specific components
├── pages/              # Route components
├── context/            # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API clients
└── stores/             # Zustand stores
```

## 🔧 Environment Variables

Create `.env` file with:

```env
VITE_WS_URL=wss://your-websocket-url.com
VITE_WS_JWT_TOKEN=your_jwt_token
VITE_API_BASE_URL=https://your-api-url.com/api
VITE_PRIVY_APP_ID=your_privy_id_here
```

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
