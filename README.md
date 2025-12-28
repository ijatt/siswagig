# SiswaGig 🎓💼

A freelance job marketplace platform connecting UiTM students with freelance opportunities. Built with Nuxt 3, Vue 3, Prisma, and PostgreSQL.

![SiswaGig](https://img.shields.io/badge/Nuxt-3.x-00DC82?style=flat-square&logo=nuxt.js)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)

## ✨ Features

### For Freelancers (Students)
- 🔍 **Smart Job Discovery** - AI-powered job recommendations using TF-IDF and Cosine Similarity
- 📍 **Location-Based Matching** - Find jobs near your campus using geolocation
- 📝 **Easy Applications** - Apply to jobs with cover letters and proposals
- 💬 **Real-time Messaging** - Chat with clients via Socket.IO
- 👤 **Profile Management** - Showcase your skills and portfolio

### For Clients
- 📋 **Job Posting** - Create detailed job listings with required skills
- 👥 **Application Management** - Review, hire, or reject applicants
- 💬 **Direct Communication** - Message freelancers directly
- 📊 **Dashboard** - Track all your posted jobs and applications

### Platform Features
- 🤖 **AI Job Matching** - TF-IDF vectorization with weighted similarity scoring
- 🌍 **Geolocation** - Haversine formula for distance-based recommendations
- 🔐 **Authentication** - JWT-based secure authentication
- 📱 **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- ⚡ **Real-time Updates** - Socket.IO for live messaging

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Nuxt 3 / Vue 3 |
| Language | TypeScript |
| Database | PostgreSQL (Prisma ORM) |
| Styling | Tailwind CSS + Nuxt UI |
| Auth | JWT Tokens |
| Real-time | Socket.IO |
| Icons | Lucide Icons |

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm/pnpm/yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ijatt/siswagig.git
   cd siswagig
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/siswagig"
   DIRECT_URL="postgresql://user:password@localhost:5432/siswagig"
   JWT_SECRET="your-secret-key"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database (optional)**
   ```bash
   node prisma/seeder.js
   node prisma/job-seeder.js
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 🚀 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run Prisma Studio (database GUI)
npx prisma studio
```

## 📁 Project Structure

```
siswagig/
├── app/
│   ├── components/       # Vue components
│   ├── composables/      # Composable functions
│   ├── layouts/          # App layouts
│   ├── middleware/       # Route middleware
│   ├── pages/            # Page components
│   ├── stores/           # Pinia stores
│   └── assets/css/       # Global styles
├── server/
│   ├── api/              # API endpoints
│   ├── plugins/          # Server plugins
│   └── utils/            # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🔌 API Endpoints

### Authentication
- `POST /api/user/sign-up` - Register new user
- `POST /api/user/sign-in` - Login user
- `POST /api/user/sign-out` - Logout user

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/create` - Create new job
- `GET /api/jobs/recommended` - Get AI-recommended jobs
- `GET /api/jobs/match-with-history` - Advanced recommendations

### Applications
- `POST /api/jobs/apply` - Apply to a job
- `GET /api/jobs/application/:id` - Get user applications
- `GET /api/jobs/client-applications` - Get client's received applications

### User
- `GET /api/user` - Get current user
- `PATCH /api/user/:id` - Update user profile
- `POST /api/user/location` - Save user location

## 🤖 AI Matching Algorithm

The job recommendation system uses:

1. **TF-IDF Vectorization** - Converts text to numerical vectors
2. **Cosine Similarity** - Measures similarity between vectors
3. **Weighted Scoring** - Combines multiple factors:
   - Skill Match: 40%
   - Bio/Experience Match: 25%
   - Title Relevance: 15%
   - Distance Score: 20%

4. **Geolocation** - Haversine formula for distance calculation

## 📍 Location Features

- Browser Geolocation API integration
- Manual coordinate entry
- Distance-based job filtering
- Campus location references for UiTM students

## 📚 Documentation

- [Geolocation Implementation](./GEOLOCATION_IMPLEMENTATION.md)
- [Job Matching Algorithm](./JOB_MATCHING_ALGORITHM.md)
- [UiTM Locations Reference](./UITM_LOCATIONS_REFERENCE.md)
- [Quick Start Guide](./GEOLOCATION_QUICK_START.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **SiswaGig Team** - UiTM Students

---

Made with ❤️ for UiTM students
