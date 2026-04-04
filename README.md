<div align="center">

# 🚀 CodeSpect

### AI-Powered Code Review & Analysis Platform

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Developed by Team Qoders**

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Team](#-team)
- [License](#-license)

---

## 🎯 About

**CodeSpect** is a modern, AI-powered code review and analysis platform designed to streamline the code review process. It leverages cutting-edge AI models to provide intelligent insights, automated code reviews, and comprehensive analysis of your codebase.

### Key Highlights

- 🤖 **AI-Driven Reviews**: Powered by Google & OpenAI models for intelligent code analysis
- 🔍 **Smart Code Inspection**: Deep code understanding with vector embeddings
- 📊 **Visual Analytics**: Interactive dashboards and flow diagrams
- 🔐 **Secure Authentication**: Built with Better Auth for robust security
- ⚡ **Real-time Processing**: Background jobs with Inngest
- 🎨 **Modern UI**: Beautiful interface with shadcn/ui and Tailwind CSS

---

## ✨ Features

- **AI-Powered Code Reviews**: Get intelligent suggestions and catch potential issues
- **GitHub Integration**: Seamless connection with your repositories via Octokit
- **Inline Reviews**: Review code changes directly in the interface
- **Repository Analytics**: Comprehensive activity tracking and visualizations
- **Vector Search**: Advanced code search using Pinecone database
- **User Management**: Complete authentication and authorization system
- **Subscription Management**: Free and Pro tiers with Polar integration
- **Responsive Design**: Works flawlessly on desktop and mobile devices

---

## 🛠️ Tech Stack

### Frontend
<div align="center">

| Technology | Version | Purpose |
|-----------|---------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white) | 16.1.1 | React Framework |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | 19.2.3 | UI Library |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | 5.x | Type Safety |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | 4.x | Styling |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat&logo=shadcnui&logoColor=white) | Latest | UI Components |
| ![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=flat&logo=radix-ui&logoColor=white) | Latest | Primitives |
| ![Framer Motion](https://img.shields.io/badge/Motion-0055FF?style=flat&logo=framer&logoColor=white) | 12.x | Animations |
| ![Lucide Icons](https://img.shields.io/badge/Lucide-F56565?style=flat&logo=lucide&logoColor=white) | Latest | Icons |

</div>

### Backend & Database
<div align="center">

| Technology | Version | Purpose |
|-----------|---------|---------|
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) | 7.2.0 | ORM |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) | Latest | Database |
| ![Pinecone](https://img.shields.io/badge/Pinecone-000000?style=flat&logo=pinecone&logoColor=white) | Latest | Vector DB |
| ![Better Auth](https://img.shields.io/badge/Better_Auth-000000?style=flat&logo=auth0&logoColor=white) | 1.4.11 | Authentication |
| ![Inngest](https://img.shields.io/badge/Inngest-000000?style=flat&logo=inngest&logoColor=white) | 3.49.3 | Background Jobs |

</div>

### AI & Integration
<div align="center">

| Technology | Version | Purpose |
|-----------|---------|---------|
| ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white) | 3.0.50 | AI Models |
| ![Google AI](https://img.shields.io/badge/Google_AI-4285F4?style=flat&logo=google&logoColor=white) | 3.0.10 | AI Models |
| ![Octokit](https://img.shields.io/badge/Octokit-181717?style=flat&logo=github&logoColor=white) | 5.0.5 | GitHub API |
| ![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI-000000?style=flat&logo=vercel&logoColor=white) | 6.0.42 | AI Streaming |

</div>

### State Management & Data Fetching
<div align="center">

| Technology | Purpose |
|-----------|---------|
| ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat&logo=react-query&logoColor=white) | Server State |
| ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat&logo=reacthookform&logoColor=white) | Forms |
| ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat&logo=zod&logoColor=white) | Validation |

</div>

### Additional Libraries

- **UI Components**: React Day Picker, Recharts, React Flow, React Markdown
- **Utilities**: date-fns, nanoid, clsx, tailwind-merge
- **Code Highlighting**: Shiki
- **Styling**: class-variance-authority, cmdk, vaul, sonner

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **bun** package manager
- **PostgreSQL** database
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codespect.git
   cd codespect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables (see [Environment Variables](#-environment-variables))

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
codespect/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── features/             # Feature modules
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
├── inngest/              # Background job functions
└── generated/            # Generated files
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/codespect"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Models
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Pinecone
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="your-pinecone-environment"

# Inngest
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# Polar (Subscriptions)
POLAR_ACCESS_TOKEN="your-polar-access-token"
```

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Format code
npm run format

# Run Prisma Studio
npx prisma studio
```

### Adding UI Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

Components will be placed in the `components/ui` directory.

### Database Management

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Create a migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset
```

---

## 👥 Team

<div align="center">

### **Team Qoders**

| Member | Role | GitHub |
|--------|------|--------|
| **Patel Vrundkumar Hirenbhai** | Full Stack Developer | [@vrund-patel](https://github.com/Vrundpatel153) |
| **Hemil Prakashbhai Hansora** | Full Stack Developer | [@hemil-hansora](https://github.com/hemil-hansora) |

</div>

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

<div align="center">

### Built with ❤️ by Team Qoders

**[⭐ Star this repository](https://github.com/yourusername/codespect)** if you find it helpful!

</div>
