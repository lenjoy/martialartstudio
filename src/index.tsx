import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import coaches from './routes/coaches'
import availability from './routes/availability'
import bookings from './routes/bookings'
import calendar from './routes/calendar'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer for HTML pages
app.use(renderer)

// API Routes
app.route('/api/coaches', coaches)
app.route('/api/availability', availability)
app.route('/api/bookings', bookings)
app.route('/api/calendar', calendar)

// Main page
app.get('/', (c) => {
  return c.render(
    <div>
      <div className="hero-section bg-gradient-to-r from-red-900 to-red-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            <i className="fas fa-fist-raised mr-4"></i>
            Elite Martial Arts Studio
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Master traditional and modern martial arts with our expert instructors. 
            From beginners to advanced practitioners, we guide your journey to excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#coaches" className="bg-white text-red-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              <i className="fas fa-users mr-2"></i>
              Meet Our Coaches
            </a>
            <a href="#calendar" className="bg-red-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              <i className="fas fa-calendar-alt mr-2"></i>
              View Schedule
            </a>
            <a href="#booking" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-900 transition-colors">
              <i className="fas fa-calendar-plus mr-2"></i>
              Book a Class
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <section id="coaches" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            <i className="fas fa-user-ninja mr-3"></i>
            Our Expert Coaches
          </h2>
          <div id="coaches-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Coaches will be loaded dynamically */}
          </div>
        </section>

        <section id="calendar" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            <i className="fas fa-calendar-alt mr-3"></i>
            Studio Schedule Calendar
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <label className="text-sm font-medium text-gray-700">Select Date:</label>
                <input 
                  type="date" 
                  id="calendar-date" 
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button 
                  onclick="loadCalendar()" 
                  className="bg-red-900 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors">
                  <i className="fas fa-search mr-1"></i>
                  View Schedule
                </button>
              </div>
              <div id="calendar-summary" className="text-sm text-gray-600">
                Select a date to view the studio schedule
              </div>
            </div>
            <div id="calendar-content" className="min-h-96">
              <div className="text-center text-gray-500 py-12">
                <i className="fas fa-calendar-alt text-4xl mb-4 opacity-50"></i>
                <p>Choose a date above to see all coaches' availability for that day</p>
              </div>
            </div>
          </div>
        </section>

        <section id="booking" className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            <i className="fas fa-calendar-check mr-3"></i>
            Book Your Training Session
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Booking Form */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-4">Schedule Your Class</h3>
                <form id="booking-form" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Name</label>
                      <input type="text" id="student-name" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" id="student-email" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                    <input type="tel" id="student-phone" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience Level</label>
                    <select id="experience-level" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Coach</label>
                    <select id="coach-select" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="">Choose a coach...</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Date</label>
                    <input type="date" id="booking-date" required className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Available Time Slots</label>
                    <div id="time-slots" className="grid grid-cols-2 gap-2 mt-2">
                      {/* Time slots will be populated dynamically */}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                    <textarea id="booking-notes" rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Any specific goals or requirements..."></textarea>
                  </div>
                  
                  <button type="submit" className="w-full bg-red-900 text-white py-3 rounded-md font-semibold hover:bg-red-800 transition-colors">
                    <i className="fas fa-calendar-plus mr-2"></i>
                    Book Class
                  </button>
                </form>
              </div>
              
              {/* Coach Details */}
              <div id="coach-details" className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-semibold mb-4">Coach Information</h3>
                <div id="selected-coach-info">
                  <p className="text-gray-500">Select a coach to view details...</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Success Modal */}
      <div id="success-modal" className="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <i className="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-6">Your training session has been successfully booked. You'll receive a confirmation email shortly.</p>
            <button onclick="closeModal()" className="bg-red-900 text-white px-6 py-2 rounded-md hover:bg-red-800 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default app
