# AutoScreen CV Processor

An intelligent resume screening system that automatically processes CVs, matches candidates with job positions, and sends assessment invitations via email.

## 🌟 Features

- **Automated CV Processing**: Extract structured data from PDF and DOCX resumes using AI
- **Intelligent Job Matching**: Match candidates with 14+ predefined job positions based on skills and experience
- **Email Notifications**: Automatically send assessment invitations to qualified candidates
- **Web Interface**: User-friendly React frontend for easy resume uploads
- **Database Integration**: Store candidate data and evaluation results in MySQL
- **Real-time Processing**: Get instant feedback on candidate qualifications

## 🏗️ System Architecture

```
Frontend (React) → FastAPI Backend → AI Processing (Ollama) → Database (MySQL) → Email Service
```

## 📋 Prerequisites

### Backend Requirements
- Python 3.8+
- MySQL Database
- Ollama (for AI processing)
- SMTP Email Account (for notifications)

### Frontend Requirements
- Node.js 14+
- npm or yarn

## 🚀 Installation & Setup

### 1. Backend Setup

#### Clone and Install Dependencies
```bash
git clone <repository-url>
cd autoscreen-backend
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=autoscreen_db

# Ollama Configuration
OLLAMA_MODEL=llama2  # or your preferred model
OLLAMA_BASE_URL=http://localhost:11434

# Email Configuration
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# Matching Configuration
MIN_MATCH_THRESHOLD=40.0
```

#### Database Setup
```sql
CREATE DATABASE autoscreen_db;
-- Tables will be created automatically by the application
```

#### Install and Start Ollama
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull required model
ollama pull llama2
```

#### Start Backend Server
```bash
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd autoscreen-frontend
npm install
```

#### Start Development Server
```bash
npm run dev
# or
npm start
```

The frontend will be available at `http://localhost:5173` (Vite) or `http://localhost:3000` (Create React App).

## 📊 Supported Job Positions

The system includes 14 predefined job positions:

1. **Full-Stack Developer** - JavaScript, React, Node.js, MongoDB
2. **UI/UX Designer** - Figma, Adobe XD, Wireframing, Prototyping
3. **DevOps Engineer** - Linux, CI/CD, Docker, Kubernetes
4. **Mobile App Developer (Android)** - Kotlin, Java, Android SDK
5. **Mobile App Developer (iOS)** - Swift, Xcode, iOS SDK
6. **Cloud Engineer** - AWS, GCP, Azure, Terraform
7. **QA Engineer** - Manual Testing, Automation, Selenium
8. **Product Manager** - Product Roadmap, Agile, Scrum
9. **Cybersecurity Analyst** - Network Security, SIEM, Firewalls
10. **Business Analyst** - Requirement Gathering, SQL, Data Analysis
11. **Data Analyst** - Python, SQL, Pandas, Data Visualization
12. **Frontend Developer** - JavaScript, React, HTML, CSS
13. **Backend Developer** - Node.js, Express.js, MongoDB, REST API
14. **AI/ML Developer** - Python, Machine Learning, TensorFlow

## 🔄 How It Works

1. **Upload Resume**: User uploads PDF/DOCX resume via web interface
2. **AI Processing**: Ollama extracts structured data (name, email, skills, experience)
3. **Database Storage**: Candidate information stored in MySQL database
4. **Job Matching**: System compares candidate skills with job requirements
5. **Qualification Check**: Evaluates match score and experience requirements
6. **Email Notification**: Sends assessment invitations to qualified candidates
7. **Results Display**: Shows detailed evaluation results in the frontend

## 📁 Project Structure

```
autoscreen/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py              # Configuration classes
│   ├── cv_Processor.py        # CV processing logic
│   ├── FilterAndTestLink.py   # Job matching and email service
│   └── requirements.txt       # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ResumeUpload.jsx  # Main upload component
    │   └── App.jsx
    ├── package.json
    └── README.md
```

## 🔧 API Endpoints

### Backend Endpoints

- `GET /` - API information and available endpoints
- `GET /health` - Health check endpoint
- `POST /upload-resume` - Upload and process resume file
- `POST /test-upload` - Test file upload functionality
- `OPTIONS /upload-resume` - CORS preflight handling

### Example API Response

```json
{
  "success": true,
  "message": "Resume processed successfully",
  "data": {
    "status": "success",
    "candidate_id": 123,
    "candidate_name": "John Doe",
    "candidate_email": "john@example.com",
    "positions_evaluated": 14,
    "qualified_positions": ["Full-Stack Developer", "Frontend Developer"],
    "notifications_sent": 2,
    "detailed_evaluations": [...]
  }
}
```

## 🎯 Matching Algorithm

The system uses a sophisticated matching algorithm:

1. **Skill Matching**: Fuzzy string matching to identify relevant skills
2. **Score Calculation**: Percentage match based on required skills coverage
3. **Experience Validation**: Minimum experience requirement check
4. **Qualification Threshold**: Default 40% match score required
5. **Preferred Skills Bonus**: Additional consideration for preferred skills

## 📧 Email Integration

Qualified candidates automatically receive:
- Personalized assessment invitation
- Job position details
- Unique assessment link
- Match score information
- Next steps instructions

## 🛠️ Configuration Options

### Matching Threshold
Adjust the minimum match score required for qualification:
```env
MIN_MATCH_THRESHOLD=50.0  # 50% minimum match
```

### Email Templates
Customize email templates in `FilterAndTestLink.py`:
- Subject line format
- Email body content
- Assessment link format

### Job Requirements
Add or modify job positions in `main.py`:
```python
JobRequirement(
    title="Your Job Title",
    required_skills=["Skill1", "Skill2"],
    preferred_skills=["Optional1", "Optional2"],
    min_experience=1.0,
    test_link="https://your-assessment-platform.com",
    department="Your Department"
)
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check MySQL service
   sudo systemctl status mysql
   # Verify credentials in .env file
   ```

2. **Ollama Model Issues**
   ```bash
   # Check Ollama status
   ollama list
   # Pull model if missing
   ollama pull llama2
   ```

3. **Email Sending Failures**
   - Verify SMTP credentials
   - Enable "Less secure app access" for Gmail
   - Use app-specific passwords for 2FA accounts

4. **CORS Errors**
   - Ensure frontend URL is allowed in CORS settings
   - Check if FastAPI server is running on correct port

5. **File Upload Issues**
   - Verify file format (PDF/DOCX only)
   - Check file size (max 10MB)
   - Ensure proper FormData parameter name (`file`)

### Debug Mode

Enable detailed logging by setting:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📈 Performance Optimization

- **Database Indexing**: Add indexes on frequently queried columns
- **Caching**: Implement Redis for skill matching results
- **Async Processing**: Use background tasks for email sending
- **File Optimization**: Compress uploaded files before processing

## 🔒 Security Considerations

- Input validation for uploaded files
- SQL injection prevention with parameterized queries
- Email rate limiting to prevent spam
- Secure storage of credentials using environment variables
- CORS configuration for production deployment

## 🚀 Deployment

### Docker Deployment (Recommended)

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Environment Variables

```env
# Production Database
DB_HOST=your-production-db-host
DB_USER=prod_user
DB_PASSWORD=secure_password

# Production Email
EMAIL_ADDRESS=noreply@yourcompany.com
EMAIL_PASSWORD=app_specific_password

# Security
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## 📚 Dependencies

### Backend Dependencies
```txt
fastapi==0.104.1
uvicorn==0.24.0
mysql-connector-python==8.2.0
python-multipart==0.0.6
python-dotenv==1.0.0
requests==2.31.0
fuzzywuzzy==0.18.0
python-levenshtein==0.23.0
```

### Frontend Dependencies
```json
{
  "react": "^18.0.0",
  "tailwindcss": "^3.0.0"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@yourcompany.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

## 🗺️ Roadmap

- [ ] Support for more file formats (DOC, RTF)
- [ ] Advanced AI models integration
- [ ] Multi-language support
- [ ] Custom job requirement templates
- [ ] Analytics dashboard
- [ ] Bulk resume processing
- [ ] Integration with ATS systems
- [ ] Mobile application

---

**Built with ❤️ using FastAPI, React, and AI Technology**
