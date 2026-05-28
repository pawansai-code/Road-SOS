# ROAD-SOS: RECOMMENDED FOLDER STRUCTURE

## 1. FRONTEND (React Native / Expo)

```
frontend/src/
├── assets/      - Static files like images, custom fonts, and generic icons.
├── components/  - Reusable, stateless UI components (e.g., SOS buttons, text inputs, custom modals).
├── constants/   - Configuration, theme variables (colors, typography, spacing), and environment fallbacks.
├── navigation/  - React Navigation setup (Stack, Tab, Drawer navigators) and route definitions.
├── screens/     - Complete UI views/pages (e.g., HomeScreen, LiveTrackingScreen, ProfileScreen).
├── services/    - External API clients (Axios), third-party integrations (Firebase, Expo APIs), and data fetching logic.
├── store/       - Global state management setup (Redux slices like userSlice, sosSlice, contactsSlice).
├── types/       - Global TypeScript types, interfaces, and enums for strict typing across the app.
└── utils/       - Helper functions, date formatters, validators, and generic shared logic.
```

---

## 2. BACKEND (Python / Django REST Framework)

```
backend/
├── core_project/  - Main Django project directory containing global settings (settings.py, urls.py, wsgi.py, asgi.py).
├── api/           - Django app dedicated to REST API logic (views.py, urls.py).
├── models/        - (or inside apps) Django models defining the PostgreSQL database schema (e.g., UserProfile, SOSEvent, Contact).
├── serializers/   - Classes converting complex database models into JSON format for the frontend.
├── migrations/    - Auto-generated database schema version control files.
├── manage.py      - Django command-line utility for server execution and database migrations.
├── .env           - Secret environment variables (database credentials, Firebase keys).
└── requirements.txt - List of all Python dependencies for easy installation.
```

---

## WHY THIS STRUCTURE IS A BETTER CHOICE FOR A SCALABLE PROJECT

### 1. Separation of Concerns (SoC)

By strictly separating frontend UI components from backend business logic, and further dividing the frontend (components vs. screens vs. services) and backend (models vs. serializers vs. views), developers can focus on one domain at a time without being overwhelmed by unrelated code.

### 2. Reusability & DRY (Don't Repeat Yourself)

On the frontend, shared elements live in `components/`. On the backend, reusable API logic lives in `serializers/` and `utils/`. This prevents code duplication. If a database schema changes, you only need to update the Model and its Serializer in one place, and the entire API automatically reflects the change.

### 3. Decoupling State from Presentation (Frontend) & Data from Delivery (Backend)

The frontend separates visual rendering from state management (`store/`). The backend separates database definitions (`models/`) from API delivery (`api/` and `serializers/`). This modularity makes it easier to swap implementations (e.g., replace Redux with Context API, or swap Django REST Framework with FastAPI) without rewriting the entire application.

### 4. Predictability for Team Collaboration & Onboarding

This directory tree follows industry-standard React Native and Django patterns. When new developers join the Road-SOS team, they will intuitively know where to look for:

- API calls → `services/`
- Redux slices → `store/`
- Database queries → `models/`
- UI components → `components/`

Consistency reduces cognitive load and accelerates development velocity.

### 5. Independent Testability

Because the logic is highly modular, you can write automated unit tests for frontend `utils/` and backend `api/views/` entirely independently. You can mock API responses to test the frontend, and you can test the backend using Django's built-in testing suite without needing the mobile app to be running.
