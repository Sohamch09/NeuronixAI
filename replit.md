# AI Chatbot Application

## Overview

This is a full-stack AI chatbot application built with React, Express, and TypeScript. The application features a modern chat interface with particle animations, real-time messaging, and AI-powered responses that can handle weather queries, news requests, calculations, and translations. The system uses an in-memory storage solution with support for PostgreSQL via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: Drizzle ORM configured for PostgreSQL (currently using in-memory storage)
- **Session Management**: Express sessions with PostgreSQL store support
- **API**: RESTful API design with structured error handling
- **Development**: Hot reload with Vite integration

### Design System
- **Component Library**: shadcn/ui with "new-york" style
- **Theme**: Custom dark theme with particle effects and gradients
- **Typography**: Neutral color scheme with CSS variables
- **Responsive**: Mobile-first design approach

## Key Components

### Chat Interface
- Real-time messaging with typing indicators
- Particle background animation for visual appeal
- Message bubbles with timestamps and user/bot differentiation
- Support for rich AI response formatting (weather cards, news cards, etc.)

### AI Integration
- Weather data responses with location and conditions
- News headline integration
- Basic calculator functionality
- Translation service placeholder
- Extensible architecture for additional AI services

### Storage Layer
- In-memory storage implementation (`MemStorage`)
- Database schema defined with Drizzle ORM
- Support for conversations and messages
- User management structure in place

### UI Components
- Comprehensive shadcn/ui component library
- Custom chat message components
- Particle background effects
- Loading states and error handling
- Toast notifications for user feedback

## Data Flow

1. **User Input**: User types message in chat interface
2. **API Request**: Frontend sends message to `/api/messages` endpoint
3. **Message Processing**: Backend creates user message and processes content
4. **AI Response**: System analyzes message content and generates appropriate AI response
5. **Storage**: Both user and AI messages are stored in the storage layer
6. **Real-time Update**: Frontend receives response and updates chat interface
7. **Visual Feedback**: Typing indicators and smooth animations provide user feedback

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless (@neondatabase/serverless)
- **ORM**: Drizzle ORM with Zod validation
- **UI Framework**: React with Radix UI primitives
- **Styling**: Tailwind CSS with class-variance-authority
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Hookform resolvers

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Full type coverage
- **ESBuild**: Production bundling for server
- **Hot Reload**: Vite development server integration

### External API Integrations
- Weather API (mock implementation - ready for real API)
- News API (mock implementation - ready for real API)
- Translation services (placeholder for future integration)

## Deployment Strategy

### Development Environment
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite development server with HMR
- **Database**: Environment variable configuration for DATABASE_URL
- **Session Store**: PostgreSQL session storage with connect-pg-simple

### Production Build
- **Client**: Vite builds to `dist/public` directory
- **Server**: ESBuild bundles server code to `dist/index.js`
- **Static Assets**: Express serves built client from public directory
- **Database**: PostgreSQL connection via environment variables

### Configuration
- TypeScript paths for clean imports (`@/`, `@shared/`)
- Tailwind CSS with custom theme variables
- Drizzle configuration for database migrations
- Vite aliases for development and build processes

The application is designed to be easily deployable to platforms like Replit, with proper environment variable configuration and database provisioning support.