# 📝 Feedback Collection Platform

A full-stack web application that allows businesses to create custom feedback forms and collect responses from customers. Built with Django REST Framework and React with Material-UI.

![Platform Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Django](https://img.shields.io/badge/Django-4.2-green)
![React](https://img.shields.io/badge/React-18.0-blue)
![Material-UI](https://img.shields.io/badge/Material--UI-5.0-purple)

## ✨ Features

### 🏢 Admin/Business Features
- **User Authentication**: Secure login and registration system
- **Form Builder**: Create custom forms with text and multiple-choice questions
- **Response Analytics**: View responses with vote counts and visual summaries
- **CSV Export**: Download response data for further analysis
- **Public Links**: Generate shareable URLs for forms

### 👥 Customer/User Features
- **Public Access**: Submit feedback without requiring login
- **Mobile Responsive**: Works seamlessly on all devices
- **Real-time Validation**: Instant feedback on form submission

## 🛠️ Tech Stack

**Backend:**
- Django 4.2
- Django REST Framework
- SQLite (Development) / PostgreSQL (Production)
- CORS Headers for API access

**Frontend:**
- React 18
- Material-UI Components
- Axios for API requests
- React Router for navigation

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### 1. Clone Repository
https://github.com/Beclomethason/feedback-platform
cd feedback-platform

Navigate to backend
cd backend

Create virtual environment
python -m venv venv
Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

Install dependencies
pip install django djangorestframework django-cors-headers

Run migrations
python manage.py migrate

Create superuser
python manage.py createsuperuser

Start Django server
python manage.py runserver

### 3. Frontend Setup
Open new terminal and navigate to frontend
cd frontend

Install dependencies
npm install

Start React development server
npm start

### 4. Access Application
- **Admin Dashboard**: http://localhost:3000 (Register/Login)
- **Django Admin**: http://127.0.0.1:8000/admin
- **API Endpoints**: http://127.0.0.1:8000/api

## 📁 Project Structure

feedback-platform/
├── backend/ # Django REST API
│ ├── feedback_project/ # Main Django project
│ ├── authentication/ # User auth app
│ ├── forms/ # Form management app
│ ├── responses/ # Response handling app
│ ├── manage.py
│ └── db.sqlite3
├── frontend/ # React application
│ ├── public/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── services/ # API service layer
│ │ └── App.js
│ └── package.json
└── README.md

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Forms Management
- `GET /api/forms/` - List all forms
- `POST /api/forms/` - Create new form
- `GET /api/forms/{id}/` - Get form details
- `GET /api/forms/{id}/questions/` - Get form questions

### Responses
- `POST /api/responses/form/{id}/` - Submit form response
- `GET /api/responses/form/{id}/responses/` - Get form responses
- `GET /api/responses/form/{id}/export/` - Export responses as CSV

## 💡 Usage Guide

### Creating a Form
1. Register/Login to admin dashboard
2. Click "Create New Form"
3. Add form title and description
4. Add 3-5 questions (text or multiple choice)
5. Save form

### Sharing Forms
1. View forms in dashboard
2. Click "Copy Link" to get public URL
3. Share URL with customers
4. Monitor responses in real-time

### Analyzing Responses
1. Click "View Responses" on any form
2. See vote counts for multiple choice questions
3. Read individual text responses
4. Export data as CSV for detailed analysis

## 🎨 Design Decisions

### Architecture
- **Separation of Concerns**: Clear separation between API (Django) and UI (React)
- **RESTful API**: Standard REST endpoints for easy integration
- **Component-Based UI**: Reusable React components with Material-UI

### Database Design
- **UUID Primary Keys**: For secure, non-sequential form IDs
- **Flexible Question Types**: Extensible system for different question formats
- **Relational Structure**: Proper relationships between forms, questions, and responses

### Security
- **CSRF Protection**: Django CSRF middleware for API security
- **CORS Configuration**: Proper cross-origin request handling
- **Session Authentication**: Secure user session management

## 🚀 Deployment

### Production Setup
1. Update `settings.py` for production environment
2. Configure PostgreSQL database
3. Set environment variables
4. Deploy to Render/DigitalOcean/AWS

### Environment Variables
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://...
CORS_ALLOWED_ORIGINS=https://your-frontend.com

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📋 Future Enhancements

- [ ] Email notifications for new responses
- [ ] Form templates and themes
- [ ] Advanced analytics with charts
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Form embedding widgets

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [DhruvGithub](https://github.com/Beclomethason)
- LinkedIn: [DhruvLinkedIn](https://linkedin.com/in/dhruv-aseri-56a424228)

## 🙏 Acknowledgments

- Django REST Framework team for the excellent API framework
- Material-UI team for beautiful React components
- React team for the robust frontend framework

---

⭐ **Star this repo if you found it helpful!**
