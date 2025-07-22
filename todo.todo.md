# University Logbook System - Task List

## ✅ Completed
- [x] Backend: User Authentication (Register & Login)

## 🚀 Backend Tasks
### 🔹 User Management
- [x] Role-based access control (Student, Supervisor, Admin)

### 🔹 Student Features
- [x] Enrollment Process → Assign student to supervisor via an enrollment key
- [ ] Logbook Submission → Students submit weekly reports
- [ ] View Report History → Students view submitted reports
- [ ] AI Plagiarism Detection → Integrate Hugging Face model for AI content detection

### 🔹 Supervisor Features
- [ ] View & Review Reports → Supervisors access student reports
- [ ] Provide Feedback → Supervisors comment and rate reports
- [ ] Approve/Reject Reports → Accept or reject student submissions

### 🔹 Organisation Supervisor Features
- [ ] View Reports → Industry supervisors can only view reports
- [ ] Approve Reports → Industry supervisors approve reports (No AI detection needed)

### 🔹 AI Detection Module
- [ ] Build AI Model → Fine-tune Hugging Face model for AI-generated content detection
- [ ] Integrate AI Detection → Connect AI model to Flask API
- [ ] Return Confidence Score → Send detection score & flagged status in JSON response

### 🔹 Admin Panel
- [ ] Dashboard Overview → View total users, reports, and flagged reports
- [ ] Manage Users → Admin can view all students, supervisors, and organisations
- [ ] Monitor AI Flags → Admin reviews flagged AI-generated reports

### 🔹 Notifications & Alerts
- [ ] Email Reminders → Weekly reminders for report submission
- [ ] Supervisor Notifications → Notify supervisors when reports are submitted
- [ ] AI Detection Alerts → Notify students if their report is flagged

### 🔹 Database & System Improvements
- [ ] Database Relationships → Ensure proper linking between students, supervisors, and reports
- [ ] Error Handling & Logging → Implement structured error handling
- [ ] API Documentation → Document all API endpoints


## 🚀 Frontend Tasks (Next.js)
### 🔹 User Interface
- [ ] Implement Login & Signup Pages
- [ ] Role-Based Dashboard (Student, Supervisor, Admin)

### 🔹 Student Features
- [ ] Enrollment Key Input Page
- [ ] Weekly Logbook Submission Form
- [ ] View Submitted Reports Page

### 🔹 Supervisor Features
- [ ] Reports Review Page
- [ ] Feedback & Approval Interface

### 🔹 AI Detection Integration
- [ ] Show AI Detection Results in UI
- [ ] Alert Students on Flagged Reports

### 🔹 Admin Panel
- [ ] Dashboard Overview (Reports, Users, AI Flags)
- [ ] User Management Page

### 🔹 Deployment & Testing
- [ ] Backend Deployment (Railway, Render, or AWS)
- [ ] Frontend Deployment (Vercel or Netlify)
- [ ] Final Testing & Debugging
