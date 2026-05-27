ROAD SOS - API ENDPOINTS FOR TESTING TEAM

General Configuration:
- Authentication: Most endpoints expect a header of 'X-Firebase-Uid': 'dummy_user_123' (currently mocked for MVP).
- Content-Type: application/json
- Important Note: The frontend currently has IP addresses hardcoded for the API_BASE_URL (e.g., http://192.168.43.149:8000/api and http://192.168.43.71:8000). Ensure your local backend matches these or update the frontend Redux slices for testing.

=======================================================
1. User Profile Endpoints (userSlice.ts)
=======================================================

* GET /api/users/profile/
  Description: Fetches the current user's medical profile and personal details.
  Payload: None

* PUT /api/users/profile/
  Description: Updates the user's profile information.
  Payload: 
  { 
    "full_name": "string", 
    "phone_number": "string", 
    "blood_group": "string", 
    "medical_notes": "string" 
  }

=======================================================
2. Emergency & SOS Endpoints (sosSlice.ts & HomeScreen.tsx)
=======================================================

* POST /api/sos/trigger/
  Description: CRITICAL - Triggers the active SOS alert and sends real-time coordinates to the backend/control room.
  Payload: 
  { 
    "latitude": float, 
    "longitude": float, 
    "service_type": "string" 
  }

* POST /api/services/sos-event/
  Description: Logs an SOS event (e.g. Police, Fire, Medical) into the user's history log.
  Payload: 
  { 
    "event_type": "string" 
  }

* GET /api/services/sos-event/
  Description: Fetches the user's historical SOS events for the History screen.
  Payload: None

=======================================================
3. Emergency Contacts Endpoints (contactsSlice.ts)
=======================================================

* GET /api/contacts/
  Description: Fetches the list of all saved emergency contacts (up to 5).
  Payload: None

* POST /api/contacts/
  Description: Adds a new emergency contact.
  Payload: 
  { 
    "contact_name": "string", 
    "relationship": "string", 
    "phone_number": "string" 
  }

* DELETE /api/contacts/{contactId}/
  Description: Deletes a specific emergency contact by their contactId.
  Payload: None

* GET /api/contacts/sms-template/
  Description: Fetches the dynamic SMS text template used when a user messages their contacts.
  Payload: None

=======================================================
QUICK REFERENCE ENDPOINT LIST
=======================================================
GET    /api/users/profile/
PUT    /api/users/profile/
POST   /api/sos/trigger/
POST   /api/services/sos-event/
GET    /api/services/sos-event/
GET    /api/contacts/
POST   /api/contacts/
DELETE /api/contacts/{contactId}/
GET    /api/contacts/sms-template/
