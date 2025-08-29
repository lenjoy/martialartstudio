# Elite Martial Arts Studio

A comprehensive web application for managing a martial arts studio with coach profiles, availability scheduling, and class bookings.

## Project Overview

- **Name**: Elite Martial Arts Studio
- **Goal**: Provide a modern web platform for martial arts studios to showcase coaches and manage class bookings
- **Features**: Coach profiles, availability management, online booking system, responsive design

## 🌐 URLs

- **Production**: https://5d83c267.martial-arts-studio.pages.dev
- **API Base**: https://5d83c267.martial-arts-studio.pages.dev/api
- **GitHub**: https://github.com/lenjoy/martialartstudio

## 🏛️ Data Architecture

### Data Models
- **Coaches**: Profile information, martial arts background, specialties, experience
- **Availability Slots**: Time slots when coaches are available (by day of week)
- **Students**: Student information (created automatically during booking)
- **Bookings**: Class reservations linking students with coaches at specific times
- **Class Types**: Different types of classes offered (private, group, etc.)

### Storage Services
- **Cloudflare D1**: SQLite-based globally distributed database
- **Local Development**: `.wrangler/state/v3/d1/` (local SQLite for development)

### Data Flow
1. Students browse coach profiles on frontend
2. Students select coach and preferred date
3. Frontend queries available time slots via API
4. Students book classes, creating student record and booking
5. Booking system prevents double-booking by checking existing reservations

## 📊 Currently Completed Features

✅ **Coach Management System**
- Complete CRUD operations for coaches
- Coach profiles with bio, background, specialties, photos
- Years of experience tracking
- Active/inactive status management

✅ **Availability Management**
- Weekly availability slots for each coach
- Day-of-week based scheduling (0=Sunday, 6=Saturday)
- Flexible time slots with customizable duration
- Real-time availability checking

✅ **Booking System**
- Student information capture (name, email, phone, experience level)
- Conflict prevention (prevents double-booking)
- Automatic student account creation
- Booking status management (confirmed, cancelled, completed)
- Notes and class type specification

✅ **Responsive Frontend**
- Modern, mobile-first design with Tailwind CSS
- Interactive coach selection and booking flow
- Real-time availability display
- Success/error feedback with modals
- FontAwesome icons for enhanced UX

✅ **API Endpoints**
- RESTful API design with proper error handling
- JSON responses with consistent structure
- CORS enabled for frontend-backend communication

## 🔗 Functional Entry URIs

### Coach Management
- `GET /api/coaches` - List all active coaches
- `GET /api/coaches/:id` - Get single coach with availability
- `POST /api/coaches` - Create new coach (admin)
- `PUT /api/coaches/:id` - Update coach information
- `DELETE /api/coaches/:id` - Soft delete coach

### Availability Management  
- `GET /api/availability/coach/:coach_id` - Get coach's availability schedule
- `GET /api/availability/slots?date=YYYY-MM-DD&coach_id=X` - Get available time slots
- `POST /api/availability/coach/:coach_id` - Add availability slot
- `PUT /api/availability/:id` - Update availability slot
- `DELETE /api/availability/:id` - Remove availability slot

### Booking System
- `GET /api/bookings` - List bookings (with filters: coach_id, student_email, date, status)
- `GET /api/bookings/:id` - Get single booking details
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/coach/:coach_id/upcoming` - Get upcoming bookings for coach

### Frontend Pages
- `/` - Main page with coach showcase and booking interface
- `#coaches` - Coach listings section
- `#booking` - Interactive booking form

## 🚧 Features Not Yet Implemented

❌ **Advanced Features**
- Email notifications for booking confirmations
- Calendar integration (Google Calendar, iCal)
- Payment processing for class fees
- Coach dashboard for managing their schedule
- Student account portal
- Group class management with participant limits
- Recurring class scheduling
- Waitlist functionality
- Review and rating system

❌ **Admin Features**
- Admin dashboard for studio management
- Analytics and reporting
- Revenue tracking
- Coach performance metrics
- Student attendance tracking

❌ **Enhanced UX**
- Photo uploads for coaches
- Real-time notifications
- Mobile app (PWA)
- Advanced filtering and search
- Multi-language support

## 📋 User Guide

### For Students (Booking a Class)

1. **Browse Coaches**: Scroll down to view all available coaches, their specialties, and experience
2. **Select a Coach**: Click "Book Class" on any coach card or "View Details" to learn more
3. **Fill Booking Form**: 
   - Enter your name and email
   - Optionally add phone number
   - Select your experience level
   - Choose your preferred coach from dropdown
4. **Pick Date & Time**:
   - Select your preferred date (must be today or later)
   - Available time slots will appear automatically
   - Click on any available time slot to select it
5. **Add Notes**: Optionally add any specific goals or requirements
6. **Submit**: Click "Book Class" to confirm your reservation
7. **Confirmation**: You'll see a success modal confirming your booking

### For Studio Admins (API Usage)

**Adding a New Coach:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@studio.com",
    "bio": "Experienced Karate instructor...",
    "martial_arts_background": "20 years of Karate training...",
    "specialties": ["Karate", "Self-Defense"],
    "years_experience": 15,
    "phone": "+1-555-1234"
  }' \
  https://your-domain.com/api/coaches
```

**Setting Coach Availability:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "day_of_week": 1,
    "start_time": "09:00", 
    "end_time": "17:00",
    "slot_duration": 60
  }' \
  https://your-domain.com/api/availability/coach/1
```

## 🚀 Deployment

### Current Status
- **Platform**: Cloudflare Pages
- **Status**: ✅ Production Live
- **Tech Stack**: Hono + TypeScript + Cloudflare D1 + TailwindCSS
- **Database**: D1 SQLite (c08f2cef-7d28-4a8d-a8b0-f1417d6a05be)
- **Last Updated**: August 29, 2025

### Local Development
```bash
# Install dependencies
npm install

# Setup local database
npm run db:migrate:local
npm run db:seed

# Start development server
npm run dev:sandbox
# or
npm run build
pm2 start ecosystem.config.cjs
```

### Database Management
```bash
# Reset local database
npm run db:reset

# Apply migrations to local DB
npm run db:migrate:local

# Seed with sample data  
npm run db:seed

# Interactive SQL console
npm run db:console:local
```

### Production Deployment
1. Configure Cloudflare API key in Deploy tab
2. Create production D1 database:
   ```bash
   npx wrangler d1 create martial-arts-studio-production
   ```
3. Update `wrangler.jsonc` with database ID
4. Deploy:
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name martial-arts-studio
   ```

## 🔧 Recommended Next Steps

### Immediate Priorities
1. **Email Integration**: Set up email notifications using SendGrid or similar service
2. **Payment Processing**: Integrate Stripe for online payments
3. **Coach Dashboard**: Build interface for coaches to manage their availability
4. **Photo Uploads**: Implement coach photo upload functionality
5. **Enhanced Validation**: Add more robust form validation and error handling

### Medium-term Goals
1. **Admin Dashboard**: Complete studio management interface
2. **Mobile Optimization**: Enhance mobile experience and add PWA features
3. **Calendar Integration**: Sync with Google Calendar and other calendar apps
4. **Group Classes**: Add support for group classes with participant limits
5. **Analytics**: Implement booking analytics and reporting

### Long-term Vision
1. **Multi-studio Support**: Expand to support multiple studio locations
2. **Advanced Scheduling**: Recurring bookings and complex scheduling rules
3. **Community Features**: Student forums, achievement tracking, belt progression
4. **Mobile App**: Native iOS and Android applications
5. **AI Integration**: Smart scheduling recommendations and automated customer service

## 🛠️ Technical Notes

- **Database**: Uses Cloudflare D1 with local SQLite for development
- **Authentication**: Currently no authentication (add based on requirements)
- **File Storage**: Static files served from `public/static/` directory
- **API Design**: RESTful with consistent JSON responses and error handling
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Styling**: Tailwind CSS with custom animations and responsive design
- **Icons**: FontAwesome for consistent iconography