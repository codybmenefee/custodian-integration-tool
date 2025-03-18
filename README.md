# Custodian Integration Tool

A proof-of-concept tool that automates the analysis of custodian integration patterns for a wealth tech platform.

## Project Overview

This tool allows technical users to streamline the initial integration process by:
- Automating documentation ingestion
- Managing schema definitions
- Creating mapping logic between custodian and destination data
- Storing and iterating on integration logic

## Key Features

- **Document Upload**: Support for PDF, CSV, JSON, XML, or other structured formats
- **Schema Management**: Define and version MongoDB schemas
- **Automated Mapping**: AI-assisted mapping between custodian and destination values
- **Integration Logic**: TypeScript-based integration logic with versioning
- **Testing Framework**: Test integration logic with sample data

## Tech Stack

- **Backend**: Node.js with TypeScript, Express
- **Frontend**: React with Next.js and TypeScript
- **Database**: MongoDB
- **File Storage**: Local storage (with option for S3)
- **Authentication**: JWT-based authentication

## Project Structure

The project follows a monorepo structure with three main packages:

- `client`: React frontend built with Next.js
- `server`: Node.js backend with Express and MongoDB
- `shared`: Common types and utilities shared between client and server

For a detailed overview of the project structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## Development Progress

We're following a structured build plan with small, manageable chunks of work. 

**Current progress is tracked in [BUILD_PLAN.md](./BUILD_PLAN.md)**

Each task in the build plan is marked with one of the following statuses:
- 🔄 Not Started
- ⏳ In Progress
- ✅ Completed
- 🔍 Needs Review

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- MongoDB (local or Atlas)

### Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Configure environment variables (copy `.env.example` to `.env` and edit as needed)
4. Start the development server: `npm run dev`

This will start both the client (on port 3000) and server (on port 5000) in development mode.

To run only the client:
```
npm run dev:client
```

To run only the server:
```
npm run dev:server
```

## Contributing

When contributing to this project:

1. Check [BUILD_PLAN.md](./BUILD_PLAN.md) to see the current focus and progress
2. Update task statuses as you work on them
3. Follow the git commit message conventions outlined in the repository rules
4. Add appropriate tests for new features

For more detailed contribution guidelines, see [GETTING_STARTED.md](./GETTING_STARTED.md).

## License

This project is licensed under the ISC License. 