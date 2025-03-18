# Project Structure

This document outlines the directory structure and key files for the Custodian Integration Tool.

```
custodianDemo/
├── .github/                      # GitHub workflow configurations
├── client/                       # Frontend React application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── document/         # Document upload & processing components
│   │   │   ├── mapping/          # Mapping interface components
│   │   │   ├── schema/           # Schema management components
│   │   │   └── logic/            # Integration logic editor components
│   │   ├── contexts/             # React context providers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Page components
│   │   ├── services/             # API client services
│   │   ├── types/                # TypeScript type definitions
│   │   ├── utils/                # Utility functions
│   │   ├── App.tsx               # Main application component
│   │   └── index.tsx             # Application entry point
│   ├── package.json              # Frontend dependencies
│   └── tsconfig.json             # TypeScript configuration
├── server/                       # Backend Node.js application
│   ├── src/
│   │   ├── config/               # Configuration files
│   │   ├── controllers/          # Request handlers
│   │   ├── middlewares/          # Express middlewares
│   │   ├── models/               # MongoDB schema models
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Business logic services
│   │   │   ├── auth/             # Authentication services
│   │   │   ├── document/         # Document processing services
│   │   │   ├── mapping/          # Mapping prediction services
│   │   │   ├── schema/           # Schema management services
│   │   │   └── logic/            # Integration logic services
│   │   ├── types/                # TypeScript type definitions
│   │   ├── utils/                # Utility functions
│   │   └── index.ts              # Server entry point
│   ├── uploads/                  # Document upload storage directory
│   ├── package.json              # Backend dependencies
│   └── tsconfig.json             # TypeScript configuration
├── shared/                       # Shared code between client and server
│   ├── types/                    # Shared TypeScript interfaces
│   └── utils/                    # Shared utility functions
├── .env.example                  # Example environment variables
├── .eslintrc.js                  # ESLint configuration
├── .gitignore                    # Git ignore rules
├── .prettierrc                   # Prettier configuration
├── BUILD_PLAN.md                 # Build plan and progress tracking
├── LICENSE                       # License file
├── package.json                  # Root package.json for scripts and workspaces
├── PROJECT_STRUCTURE.md          # This file
├── README.md                     # Project documentation
└── tsconfig.json                 # Root TypeScript configuration
```

## Key Files and Their Purposes

### Configuration Files
- `.env.example` - Template for environment variables
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - Linting rules
- `.prettierrc` - Code formatting rules

### MongoDB Models
- `server/src/models/User.ts` - User authentication model
- `server/src/models/Document.ts` - Document metadata model
- `server/src/models/Schema.ts` - Schema definition model
- `server/src/models/Mapping.ts` - Mapping rules model
- `server/src/models/Integration.ts` - Integration logic model

### Core Services
- `server/src/services/document/parser.ts` - Document parsing service
- `server/src/services/mapping/predictor.ts` - Mapping prediction service
- `server/src/services/logic/executor.ts` - Integration logic execution service

### Key Frontend Components
- `client/src/components/document/FileUploader.tsx` - Document upload UI
- `client/src/components/schema/SchemaBuilder.tsx` - Schema definition UI
- `client/src/components/mapping/MappingInterface.tsx` - Mapping configuration UI
- `client/src/components/logic/CodeEditor.tsx` - Integration logic editor

### API Routes
- `server/src/routes/auth.ts` - Authentication endpoints
- `server/src/routes/documents.ts` - Document management endpoints
- `server/src/routes/schemas.ts` - Schema management endpoints
- `server/src/routes/mappings.ts` - Mapping endpoints
- `server/src/routes/integrations.ts` - Integration logic endpoints 