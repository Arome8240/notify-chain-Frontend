# NotifyChain Local Development Setup Guide

This guide will help you set up NotifyChain for local development.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Required Dependencies](#required-dependencies)
- [Installation Steps](#installation-steps)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js
- Version: 18.x or higher (recommended: LTS version)
- Download: [https://nodejs.org/](https://nodejs.org/)

### 2. Package Manager
This project uses **pnpm** as the package manager.

Install pnpm:
```bash
npm install -g pnpm
```

### 3. Git
- Download: [https://git-scm.com/](https://git-scm.com/)

---

## Required Dependencies

### Frontend Dependencies
The frontend is built with:
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand (state management)
- Radix UI components
- Stellar Wallets Kit

All dependencies are listed in `frontend/package.json` and will be installed automatically.

---

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/notify-chain-Frontend-1.git
cd notify-chain-Frontend-1
```

### Step 2: Install Frontend Dependencies

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
pnpm install
```

---

## Environment Variables

Create a `.env.local` file in the `frontend` directory. Use the following template:

```env
# Example environment variables
# Add any required environment variables here
```

If you need to connect to specific services or APIs, add the necessary variables here.

---

## Running the Application

### Start the Development Server

```bash
cd frontend
pnpm dev
```

The application will be available at: `http://localhost:3000`

### Other Available Scripts

- `pnpm build`: Build the production version
- `pnpm start`: Start the production server
- `pnpm lint`: Run the linter

---

## Troubleshooting

### Common Issues & Solutions

#### 1. `pnpm install` fails
- **Solution**: Delete `node_modules` and `pnpm-lock.yaml`, then try again
  ```bash
  cd frontend
  Remove-Item -Recurse -Force node_modules
  Remove-Item pnpm-lock.yaml
  pnpm install
  ```

#### 2. Port 3000 is already in use
- **Solution**: Change the port in `package.json` or kill the process using port 3000
  - To kill the process on Windows:
    ```powershell
    netstat -ano | findstr :3000
    taskkill /PID <PID> /F
    ```

#### 3. TypeScript errors
- **Solution**: Ensure you're using the correct TypeScript version and run `pnpm build` to check for issues

#### 4. Stellar wallet connection issues
- **Solution**: Make sure you have a Stellar wallet extension installed (e.g., Freighter)

---

## Next Steps

- Explore the codebase
- Check the [README.md](README.md) for project overview
- Start contributing!
