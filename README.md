# EventX - Event Management App

A full-stack event management application built with React Native (Expo) frontend and Node.js backend.

## 🚀 Features

### Frontend (React Native + Expo)
- Modern, responsive UI with dark/light theme support
- User authentication (login/register)
- Event browsing and filtering
- User profile management
- Admin panel for event management
- Real-time updates and notifications

### Backend (Node.js + Express + MongoDB)
- RESTful API with JWT authentication
- User registration and login
- Password hashing with bcrypt
- Input validation and sanitization
- MongoDB database integration
- Security middleware (Helmet, CORS)

## 📁 Project Structure

```
EventX/
├── app/                    # Frontend screens (Expo Router)
├── components/            # Reusable UI components
├── constants/            # Theme and styling constants
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── backend/             # Node.js backend
│   ├── controllers/     # API controllers
│   ├── middleware/      # Auth and validation middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── config/          # Database and server config
└── assets/              # Images and fonts
```

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Expo CLI (for frontend development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EventX
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp config.env.example config.env
# Edit config.env with your MongoDB URI and JWT secret

# Start the server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate back to root directory
cd ..

# Install dependencies
npm install

# Start the Expo development server
npm start
```

The frontend will be available through Expo Go app or web browser.

## 🔧 Configuration

### Backend Environment Variables

Create a `backend/config.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventx
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Frontend API Configuration

Update the API base URL in `services/api.ts` if needed:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Health Check
- `GET /api/health` - API status check

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  college: String (required),
  department: String (required),
  password: String (required, hashed),
  isAdmin: Boolean (default: false),
  registeredEvents: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Request logging

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm test
```

## 📦 Scripts

### Backend Scripts
```bash
npm run dev      # Start development server with auto-restart
npm start        # Start production server
npm test         # Run tests
```

### Frontend Scripts
```bash
npm start        # Start Expo development server
npm run android  # Start Android emulator
npm run ios      # Start iOS simulator
npm run web      # Start web version
```

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB connection string
4. Set up proper CORS origins
5. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the app: `expo build`
2. Deploy to app stores or web platforms
3. Update API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console logs for error messages
2. Ensure MongoDB is running
3. Verify all environment variables are set correctly
4. Check that the API base URL is correct in the frontend

## 🔄 Updates

- Keep dependencies updated regularly
- Monitor security advisories
- Test thoroughly before deploying updates

---

**Happy Coding! 🎉**
