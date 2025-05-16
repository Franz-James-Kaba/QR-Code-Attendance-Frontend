# 📌 QR Code Attendance System - Frontend

🔹 This Angular application implements a **QR code-based attendance tracking system** with **role-based access** (Admin, NSP, and Facilitator). It features authentication workflows, dashboard interfaces, and role-specific functionality.

---

## 🚀 Tech Stack

| Technology   | Version      |
| ------------ | ------------ |
| Angular      | 19.1.0       |
| TypeScript   | 5.7          |
| Tailwind CSS | 3.4          |
| NgRx         | 19.0         |
| Jest         | Unit Testing |

---

## 📖 Project Overview

This application follows a modern Angular architecture, incorporating:
✅ **Angular 19**: Standalone components & lazy-loaded modules
✅ **NgRx**: State management for authentication & other features
✅ **Tailwind CSS**: Utility-first styling
✅ **Jest**: Unit testing framework
✅ **Role-Based Routing**: Admin, NSP, and Facilitator interfaces

---

## 🏁 Getting Started

### 📌 Prerequisites

Ensure you have the following installed:

- **Node.js** (18+)
- **npm** (9+)

### 📥 Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/qr-code-attendance-frontend.git

# Navigate to project directory
cd qr-code-attendance-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

📌 Open your browser and visit **[http://localhost:4200/](http://localhost:4200/)**. The application redirects to the **login page** by default.

---

## 🔑 Test Accounts

Use these mock accounts to test different user roles:

| Role                                         | Email                         | Password            |
| -------------------------------------------- | ----------------------------- | ------------------- |
| **Admin**                              | `admin@amalitech.com`       | `Admin@123`       |
| **NSP**                                | `nsp@amalitech.com`         | `Nsp@123`         |
| **Facilitator**                        | `facilitator@amalitech.com` | `Facilitator@123` |
| **New User (requires password reset)** | `new-user@amalitech.com`    | `NewUser@123`     |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── core/                   # Core functionality
│   │   ├── data/               # Mock data
│   │   ├── guards/             # Auth guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── services/           # Core services
│   │   └── store/              # NgRx store
│   ├── features/               # Feature modules
│   │   ├── Admin/              # Admin feature
│   │   ├── NSP/                # NSP feature
│   │   └── Facilitator/        # Facilitator feature
│   ├── layouts/                # Layout components
│   └── shared/                 # Shared modules
│       ├── components/         # Reusable components
│       ├── directives/         # Custom directives
│       ├── models/             # Shared interfaces and types
│       └── validators/         # Custom form validators
├── assets/                     # Static assets
└── environments/               # Environment configurations
```

---

## ⚙️ Feature Development Guide

### 📌 Setting Up Your Feature

Each **role-based feature** (Admin, NSP, Facilitator) follows the same structure:

```
features/[Feature]/
├── [feature].component.ts                # Root component
├── [feature].routes.ts                   # Feature routes
├── layouts/                              # Feature-specific layouts
│   └── [feature]-layout/
├── features/                             # Sub-features
│   ├── dashboard/
│   │   └── pages/
│   └── [other-sub-features]/
└── shared/                               # Feature-specific shared components
    └── components/
```

### 📌 Adding New Components

```bash
ng generate component features/[Feature]/features/[sub-feature]/pages/[component-name] --standalone
```

### 📌 Adding a Dashboard to NSP

```bash
ng generate component features/NSP/features/dashboard/pages/dashboard --standalone
```

Then update the `nsp.routes.ts` file:

```typescript
{
  path: 'dashboard',
  loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component')
    .then(m => m.DashboardComponent),
  data: {
    title: 'Dashboard',
    breadcrumbs: [{ label: 'Dashboard', link: '/nsp/dashboard' }]
  }
}
```

---

## 🎨 Styling Guidelines

✅ Use **Tailwind CSS** utility classes for styling
✅ Follow the **BEM methodology** within SCSS files
✅ Maintain a **consistent color scheme & design pattern**

---

## 📊 Component Library

| Component            | Description                              |
| -------------------- | ---------------------------------------- |
| **Button**     | Multi-variant button with loading states |
| **InputField** | Form input with validation support       |
| **Loading**    | Loading indicators for various contexts  |
| **OtpInput**   | Input for verification codes             |
| **Icon**       | SVG icon wrapper                         |

---

## 🔄 Git Workflow

✅ **Create feature branches:** `git checkout -b feature/your-feature-name`
✅ **Make small, focused commits**
✅ **Write descriptive commit messages**
✅ **Submit pull requests for review**

---

## ✅ Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

---

## 📦 Build and Deployment

```bash
# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🛠️ Additional Commands

```bash
# Fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format:fix
```

---

## 🔌 API Integration

### Base URL

The backend API is hosted at:

```
http://54.172.108.21
```

Use this base URL for all API requests as documented in the [BACKEND.MD](./BACKEND.MD) file.

Example API endpoint:

```
http://54.172.108.21/api/auth/login
```

---

## 📚 More Info

For additional Angular CLI commands, visit the **[Angular CLI Documentation](https://angular.io/cli)**. 🚀
