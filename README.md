# Neuronix AI - AI Chatbot Application

A dynamic AI chatbot web application powered by Google's Gemini AI, offering intelligent and interactive conversational experiences with real-time API integration.

## Features

- 🤖 **Google Gemini AI Integration** - Intelligent responses to any query
- 🎨 **Animated Particle Background** - 125+ colorful particles with trails and glow effects
- 📁 **File Upload Support** - Upload any file format via paperclip button
- 📚 **Chat History Navigation** - Sidebar to track and switch between conversations
- 🌙 **Dark Theme** - Modern dark interface with custom color scheme
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Google Gemini API
- **Database**: Drizzle ORM (in-memory storage)
- **State Management**: TanStack Query

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API Key

## Local Development Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd neuronix-ai
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Database (uses in-memory storage by default)
DATABASE_URL=your_postgresql_url_here

# Development
NODE_ENV=development
PORT=5000
```

### 3. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 4. Run the Application

```bash
# Start development server (both frontend and backend)
npm run dev

# The app will be available at http://localhost:5000
```

### 5. Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage layer
│   └── gemini.ts         # Gemini AI integration
└── shared/               # Shared types and schemas
    └── schema.ts         # Data models
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run build:server` - Build server only
- `npm run build:client` - Build client only

## API Endpoints

- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id/messages` - Get messages for conversation
- `POST /api/conversations/:id/messages` - Send message and get AI response

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI responses | Yes |
| `DATABASE_URL` | PostgreSQL connection string | No |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |

## Troubleshooting

### Common Issues

1. **"Module not found" errors**: Run `npm install` to ensure all dependencies are installed
2. **API key errors**: Make sure your `GEMINI_API_KEY` is valid and properly set in `.env`
3. **Port conflicts**: Change the `PORT` in `.env` if 5000 is already in use
4. **Build errors**: Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Performance Optimization

The app includes several optimizations:
- Memoized particle rendering
- Debounced API calls
- Efficient state management with TanStack Query
- Code splitting and lazy loading
- Optimized bundle size

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details