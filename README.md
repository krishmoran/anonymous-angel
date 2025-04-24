# Anonymous Angel

Send anonymous gifts with ease.

## Setup

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/anonymous-angel.git
cd anonymous-angel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:
```
ZINC_API_KEY=your_zinc_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
npm start
```

## Deployment

The project is ready to deploy on Vercel with minimal configuration. 