# Onboarding Portal

A full-stack application for managing onboarding processes.

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

### Frontend

- React
- TypeScript
- Vite
- Redux Toolkit
- Tailwind CSS
- shadcn/ui
- React Hook Form
- React Router

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/onboarding-portal
   JWT_SECRET=your-secret-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- Backend runs on http://localhost:5000
- Frontend runs on http://localhost:5173

## Project Architecture

### Frontend Architecture

The frontend follows a feature-based architecture with the following structure:

```
frontend/
├── src/
│   ├── api/           # API service functions and configurations
│   ├── assets/        # Static assets (images, fonts, etc.)
│   ├── components/    # Reusable UI components
│   ├── lib/           # Third-party library configurations
│   ├── pages/         # Page components and routes
│   ├── store/         # Redux store configuration and slices
│   ├── utils/         # Utility functions and helpers
│   ├── App.tsx        # Root component
│   └── main.tsx       # Application entry point
```

### Backend Architecture

The backend follows a modular architecture with the following structure:

```
backend/
├── src/
│   ├── config/        # Configuration files and environment variables
│   ├── controllers/   # Request handlers and business logic
│   ├── middleware/    # Custom middleware functions
│   ├── models/        # Mongoose models and schemas
│   ├── routes/        # API route definitions
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions and helpers
│   └── server.ts      # Application entry point
```

### Data Modeling

The application uses MongoDB with Mongoose for data modeling. Key models include:

1. **User Model**

   - Core user authentication and profile information
   - Fields:
     - `_id`: ObjectId (auto-generated)
     - `username`: String (required, unique, min 3 chars)
     - `email`: String (required, unique, lowercase)
     - `password`: String (required, min 6 chars, hashed)
     - `isAdmin`: Boolean (default: false)
     - `createdAt`: Date (auto-generated)

2. **OnboardingApplication Model**

   - Comprehensive onboarding application details
   - Fields:
     - `_id`: ObjectId (auto-generated)
     - `userId`: ObjectId (reference to User)
     - `status`: String (enum: "pending", "approved", "rejected")
     - `rejectionFeedback`: String
     - Personal Information:
       - `firstName`, `middleName`, `lastName`, `preferredName`
       - `profilePicture`: String
       - `address`: Object (addressOne, addressTwo, city, state, zipCode)
       - `cellPhone`, `workPhone`, `email`, `ssn`
       - `dateOfBirth`: Date
       - `gender`: String (enum: "male", "female", "prefer_not_to_say")
     - Citizenship Status:
       - `isPermanentResident`: Boolean
       - `type`: String (enum: "green_card", "citizen", "work_authorization")
       - `workAuthorizationType`: String (enum: "H1-B", "L2", "F1", "H4", "other")
       - `workAuthorizationOther`: String
       - `startDate`, `expirationDate`: Date
     - `reference`: Object (firstName, lastName, phone, email, relationship)
     - `emergencyContacts`: Array of contact objects
     - `documents`: Array of document objects (type, fileName, fileUrl, uploadDate)
     - `createdAt`, `updatedAt`: Date

3. **Visa Model**

   - Manages visa documentation and processing
   - Fields:
     - `_id`: ObjectId (auto-generated)
     - `user`: ObjectId (reference to User)
     - `documents`: Array of document objects containing:
       - `type`: String (enum: "OPT_RECEIPT", "OPT_EAD", "I_983", "I_20")
       - `fileUrl`: String
       - `status`: String (enum: "PENDING", "APPROVED", "REJECTED")
       - `feedback`: String
       - `uploadedAt`, `reviewedAt`: Date
     - `currentStep`: String (enum: document types)
     - `createdAt`, `updatedAt`: Date (auto-generated)

4. **RegistrationToken Model**
   - Manages user registration invitations
   - Fields:
     - `_id`: ObjectId (auto-generated)
     - `token`: String (required)
     - `email`: String (required)
     - `name`: String (required)
     - `expiresAt`: Date (required)
     - `status`: String (enum: "pending", "registered", default: "pending")
     - `createdAt`: Date (auto-generated)

Relationships:

- User has one-to-one relationship with OnboardingApplication
- User has one-to-one relationship with Visa
- RegistrationToken is linked to User through email
