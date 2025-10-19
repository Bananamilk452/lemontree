# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- `pnpm dev`: Run the development server.
- `pnpm build`: Build the application for production.
- `pnpm start`: Start the production server.
- `pnpm lint`: Run ESLint to check for code quality.
- `pnpm format`: Format code with Prettier.
- `pnpm prisma <command>`: Run Prisma commands (e.g., `pnpm prisma migrate dev`, `pnpm prisma studio`).
- `pnpm migrate`: Deploy database migrations and generate Prisma client.

## High-level Architecture

This is a [Next.js](https://nextjs.org/) application using the App Router.

- **`app/`**: Contains the application's routes and pages. The directory structure defines the URL paths.
  - **`app/api/`**: Contains API routes for server-side endpoints.
  - **`app/dashboard/`**: Contains pages related to the user dashboard.
  - **`app/diary/`**: Contains pages for the diary feature.
  - **`app/memory/`**: Contains pages for the memory feature.
- **`components/`**: Contains reusable React components.
  - **`components/ui/`**: Contains UI components from a component library, likely [shadcn/ui](https://ui.shadcn.com/) given the file structure and dependencies (`@radix-ui`, `class-variance-authority`, `tailwind-merge`).
- **`lib/`**: Contains utility functions and libraries.
- **`prisma/`**: Contains the Prisma schema (`schema.prisma`) and database migration files.
- **`hooks/`**: Contains custom React hooks.
- **Styling**: The project uses [Tailwind CSS](https://tailwindcss.com/) for styling. Global styles are in `app/globals.css`.
- **Authentication**: Authentication seems to be handled via `better-auth` and related components in `components/auth`.
- **State Management**: The project uses `@tanstack/react-query` for server-state management.

## Development Workflow

After implementing a feature or write some codes, please run the following commands to ensure code quality and consistency:

1.  `pnpm build`: Check for Typescript errors. ignore the `PrismaClientInitializationError` in build time.
2.  `pnpm lint`: Check for any linting errors.
3.  `pnpm format`: Format the code.
