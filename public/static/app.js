// Martial Arts Studio Frontend JavaScript

let coaches = [];
let selectedCoach = null;
let availableSlots = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadCoaches();
    setupEventListeners();
    
    // Set minimum date to today
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    // Set calendar date to today
    const calendarDateInput = document.getElementById('calendar-date');
    if (calendarDateInput) {
        const today = new Date().toISOString().split('T')[0];
        calendarDateInput.value = today;
        calendarDateInput.min = today;
        // Auto-load today's calendar
        loadCalendar();
    }
});

// Load coaches from API
async function loadCoaches() {
    try {
        const response = await axios.get('/api/coaches');
        if (response.data.success) {
            coaches = response.data.coaches;
            renderCoaches();
            populateCoachSelect();
        } else {
            console.error('Failed to load coaches:', response.data.error);
        }
    } catch (error) {
        console.error('Error loading coaches:', error);
    }
}

// Render coaches cards
function renderCoaches() {
    const container = document.getElementById('coaches-list');
    if (!container) return;

    container.innerHTML = coaches.map(coach => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="relative">
                <img src="${coach.photo_url || '/static/images/default-coach.jpg'}" 
                     alt="${coach.name}" 
                     class="w-full h-64 object-cover"
                     onerror="this.src='/static/images/default-coach.jpg'">
                <div class="absolute top-4 right-4">
                    <span class="bg-red-900 text-white px-3 py-1 rounded-full text-sm">
                        ${coach.years_experience} years
                    </span>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2">${coach.name}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${coach.bio || 'Experienced martial arts instructor'}</p>
                <div class="mb-3">
                    <h4 class="font-medium text-sm text-gray-700 mb-1">Specialties:</h4>
                    <div class="flex flex-wrap gap-1">
                        ${coach.specialties.map(specialty => 
                            `<span class="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">${specialty}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    <button onclick="selectCoachForBooking(${coach.id})" 
                            class="bg-red-900 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors">
                        <i class="fas fa-calendar-plus mr-1"></i>
                        Book Class
                    </button>
                    <button onclick="showCoachDetails(${coach.id})" 
                            class="text-red-900 hover:text-red-700 font-medium">
                        View Details →
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Populate coach select dropdown
function populateCoachSelect() {
    const select = document.getElementById('coach-select');
    if (!select) return;

    select.innerHTML = '<option value="">Choose a coach...</option>' +
        coaches.map(coach => 
            `<option value="${coach.id}">${coach.name} - ${coach.specialties.join(', ')}</option>`
        ).join('');
}

// Show coach details
function showCoachDetails(coachId) {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach) return;

    const detailsContainer = document.getElementById('selected-coach-info');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
        <div class="coach-profile">
            <div class="flex items-center mb-4">
                <img src="${coach.photo_url || '/static/images/default-coach.jpg'}" 
                     alt="${coach.name}" 
                     class="w-16 h-16 rounded-full object-cover mr-4"
                     onerror="this.src='/static/images/default-coach.jpg'">
                <div>
                    <h4 class="font-semibold text-lg">${coach.name}</h4>
                    <p class="text-gray-600">${coach.years_experience} years experience</p>
                </div>
            </div>
            
            <div class="space-y-3">
                <div>
                    <h5 class="font-medium text-sm text-gray-700 mb-1">Specialties:</h5>
                    <div class="flex flex-wrap gap-1">
                        ${coach.specialties.map(specialty => 
                            `<span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">${specialty}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div>
                    <h5 class="font-medium text-sm text-gray-700 mb-1">Background:</h5>
                    <p class="text-gray-600 text-sm">${coach.martial_arts_background}</p>
                </div>
                
                ${coach.bio ? `
                    <div>
                        <h5 class="font-medium text-sm text-gray-700 mb-1">About:</h5>
                        <p class="text-gray-600 text-sm">${coach.bio}</p>
                    </div>
                ` : ''}
                
                <div class="pt-3 border-t">
                    <button onclick="selectCoachForBooking(${coach.id})" 
                            class="w-full bg-red-900 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors">
                        <i class="fas fa-calendar-plus mr-2"></i>
                        Select This Coach
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Select coach for booking
function selectCoachForBooking(coachId) {
    const select = document.getElementById('coach-select');
    if (select) {
        select.value = coachId;
        handleCoachChange();
    }
    
    // Scroll to booking form
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

// Handle coach selection change
async function handleCoachChange() {
    const coachSelect = document.getElementById('coach-select');
    const dateInput = document.getElementById('booking-date');
    
    if (!coachSelect || !dateInput) return;
    
    const coachId = coachSelect.value;
    
    if (coachId) {
        selectedCoach = coaches.find(c => c.id == coachId);
        showCoachDetails(coachId);
        
        // Load available slots if date is selected
        if (dateInput.value) {
            await loadAvailableSlots(coachId, dateInput.value);
        }
    } else {
        selectedCoach = null;
        const detailsContainer = document.getElementById('selected-coach-info');
        if (detailsContainer) {
            detailsContainer.innerHTML = '<p class="text-gray-500">Select a coach to view details...</p>';
        }
        clearTimeSlots();
    }
}

// Handle date change
async function handleDateChange() {
    const coachSelect = document.getElementById('coach-select');
    const dateInput = document.getElementById('booking-date');
    
    if (!coachSelect || !dateInput) return;
    
    const coachId = coachSelect.value;
    const date = dateInput.value;
    
    if (coachId && date) {
        await loadAvailableSlots(coachId, date);
    } else {
        clearTimeSlots();
    }
}

// Load available time slots
async function loadAvailableSlots(coachId, date) {
    try {
        const response = await axios.get(`/api/availability/slots?coach_id=${coachId}&date=${date}`);
        if (response.data.success) {
            availableSlots = response.data.available_slots;
            renderTimeSlots();
        } else {
            console.error('Failed to load available slots:', response.data.error);
            clearTimeSlots();
        }
    } catch (error) {
        console.error('Error loading available slots:', error);
        clearTimeSlots();
    }
}

// Render time slots
function renderTimeSlots() {
    const container = document.getElementById('time-slots');
    if (!container) return;

    if (availableSlots.length === 0) {
        container.innerHTML = '<p class="col-span-2 text-gray-500 text-center py-4">No available slots for this date</p>';
        return;
    }

    container.innerHTML = availableSlots.map(slot => `
        <button type="button" 
                onclick="selectTimeSlot('${slot.start_time}')"
                class="time-slot-btn border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-red-50 hover:border-red-300 transition-colors">
            ${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}
        </button>
    `).join('');
}

// Clear time slots
function clearTimeSlots() {
    const container = document.getElementById('time-slots');
    if (container) {
        container.innerHTML = '<p class="col-span-2 text-gray-500 text-center py-4">Select coach and date to view available times</p>';
    }
}

// Select time slot
function selectTimeSlot(startTime) {
    // Remove previous selection
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.remove('bg-red-900', 'text-white');
        btn.classList.add('border-gray-300');
    });
    
    // Highlight selected slot
    event.target.classList.add('bg-red-900', 'text-white');
    event.target.classList.remove('border-gray-300');
    
    // Store selected time
    selectedTimeSlot = startTime;
}

// Setup event listeners
function setupEventListeners() {
    const coachSelect = document.getElementById('coach-select');
    if (coachSelect) {
        coachSelect.addEventListener('change', handleCoachChange);
    }
    
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        dateInput.addEventListener('change', handleDateChange);
    }
    
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
}

// Handle booking form submission
async function handleBookingSubmit(event) {
    event.preventDefault();
    
    const formData = {
        student_name: document.getElementById('student-name').value,
        student_email: document.getElementById('student-email').value,
        student_phone: document.getElementById('student-phone').value,
        experience_level: document.getElementById('experience-level').value,
        coach_id: parseInt(document.getElementById('coach-select').value),
        booking_date: document.getElementById('booking-date').value,
        start_time: selectedTimeSlot,
        notes: document.getElementById('booking-notes').value
    };
    
    // Validate required fields
    if (!formData.student_name || !formData.student_email || !formData.coach_id || 
        !formData.booking_date || !formData.start_time) {
        alert('Please fill in all required fields and select a time slot.');
        return;
    }
    
    try {
        const response = await axios.post('/api/bookings', formData);
        if (response.data.success) {
            showSuccessModal();
            resetBookingForm();
        } else {
            alert('Booking failed: ' + response.data.error);
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('An error occurred while creating your booking. Please try again.');
    }
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Reset booking form
function resetBookingForm() {
    const form = document.getElementById('booking-form');
    if (form) {
        form.reset();
    }
    
    clearTimeSlots();
    selectedCoach = null;
    selectedTimeSlot = null;
    
    const detailsContainer = document.getElementById('selected-coach-info');
    if (detailsContainer) {
        detailsContainer.innerHTML = '<p class="text-gray-500">Select a coach to view details...</p>';
    }
}

// Calendar functions
async function loadCalendar() {
    const dateInput = document.getElementById('calendar-date');
    const calendarContent = document.getElementById('calendar-content');
    const calendarSummary = document.getElementById('calendar-summary');
    
    if (!dateInput || !calendarContent) return;
    
    const selectedDate = dateInput.value;
    if (!selectedDate) {
        calendarContent.innerHTML = '<div class="text-center text-gray-500 py-12">Please select a date</div>';
        return;
    }
    
    try {
        // Show loading state
        calendarContent.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-2xl text-red-900"></i><p class="mt-2">Loading schedule...</p></div>';
        
        const response = await axios.get(`/api/calendar/daily?date=${selectedDate}`);
        if (response.data.success) {
            currentCalendarData = response.data.calendar;
            renderCalendar(currentCalendarData);
            updateCalendarSummary(currentCalendarData);
        } else {
            calendarContent.innerHTML = `<div class="text-center text-red-500 py-12">Error: ${response.data.error}</div>`;
        }
    } catch (error) {
        console.error('Error loading calendar:', error);
        calendarContent.innerHTML = '<div class="text-center text-red-500 py-12">Failed to load calendar data</div>';
    }
}

function renderCalendar(calendarData) {
    const container = document.getElementById('calendar-content');
    if (!container) return;
    
    const timeSlots = Object.keys(calendarData.time_slots);
    
    if (timeSlots.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-12">
                <i class="fas fa-calendar-times text-4xl mb-4 opacity-50"></i>
                <h3 class="text-lg font-semibold mb-2">No Classes Scheduled</h3>
                <p>No coaches are available on ${calendarData.day_name}, ${formatDate(calendarData.date)}</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <div class="calendar-grid">
            <div class="mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">
                    ${calendarData.day_name}, ${formatDate(calendarData.date)}
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div class="bg-blue-50 rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold text-blue-600">${calendarData.total_coaches}</div>
                        <div class="text-sm text-blue-700">Total Coaches</div>
                    </div>
                    <div class="bg-green-50 rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold text-green-600">${calendarData.available_slots}</div>
                        <div class="text-sm text-green-700">Available Slots</div>
                    </div>
                    <div class="bg-red-50 rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold text-red-600">${calendarData.booked_slots}</div>
                        <div class="text-sm text-red-700">Booked Slots</div>
                    </div>
                    <div class="bg-purple-50 rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold text-purple-600">${calendarData.available_slots + calendarData.booked_slots}</div>
                        <div class="text-sm text-purple-700">Total Slots</div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                ${timeSlots.map(timeSlot => {
                    const slots = calendarData.time_slots[timeSlot];
                    return `
                        <div class="border border-gray-200 rounded-lg overflow-hidden">
                            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                <h4 class="font-semibold text-gray-800">
                                    <i class="fas fa-clock mr-2"></i>
                                    ${formatTime(timeSlot)}
                                </h4>
                            </div>
                            <div class="p-4">
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    ${slots.map(slot => renderCalendarSlot(slot)).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderCalendarSlot(slot) {
    const statusColors = {
        available: 'bg-green-50 border-green-200 text-green-800',
        booked: 'bg-red-50 border-red-200 text-red-800',
        unavailable: 'bg-gray-50 border-gray-200 text-gray-600'
    };
    
    const statusIcons = {
        available: 'fas fa-check-circle text-green-500',
        booked: 'fas fa-user-clock text-red-500',
        unavailable: 'fas fa-times-circle text-gray-400'
    };
    
    return `
        <div class="border rounded-lg p-3 ${statusColors[slot.status]} ${slot.status === 'available' ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}">
            <div class="flex items-center justify-between mb-2">
                <h5 class="font-semibold text-sm">${slot.coach_name}</h5>
                <i class="${statusIcons[slot.status]} text-sm"></i>
            </div>
            <div class="text-xs space-y-1">
                <div class="flex flex-wrap gap-1">
                    ${slot.coach_specialties.map(specialty => 
                        `<span class="bg-white bg-opacity-70 px-1 py-0.5 rounded text-xs">${specialty}</span>`
                    ).join('')}
                </div>
                <div class="font-medium">${slot.time_slot}</div>
                ${slot.status === 'booked' ? `
                    <div class="mt-2 pt-2 border-t border-current border-opacity-20">
                        <div class="font-medium">Student: ${slot.student_name || 'N/A'}</div>
                        <div class="capitalize">${slot.class_type || 'Private'} Class</div>
                    </div>
                ` : ''}
                ${slot.status === 'available' ? `
                    <button onclick="quickBook(${slot.coach_id}, '${currentCalendarData.date}', '${slot.start_time}')" 
                            class="w-full mt-2 bg-green-600 text-white py-1 rounded text-xs hover:bg-green-700 transition-colors">
                        Quick Book
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function updateCalendarSummary(calendarData) {
    const summary = document.getElementById('calendar-summary');
    if (!summary) return;
    
    const utilizationRate = calendarData.available_slots + calendarData.booked_slots > 0 
        ? Math.round((calendarData.booked_slots / (calendarData.available_slots + calendarData.booked_slots)) * 100)
        : 0;
    
    summary.innerHTML = `
        ${calendarData.available_slots} available, ${calendarData.booked_slots} booked 
        (${utilizationRate}% utilization)
    `;
}

function quickBook(coachId, date, startTime) {
    // Pre-fill booking form and scroll to it
    const coachSelect = document.getElementById('coach-select');
    const dateInput = document.getElementById('booking-date');
    
    if (coachSelect) coachSelect.value = coachId;
    if (dateInput) dateInput.value = date;
    
    // Trigger coach change to load availability
    handleCoachChange().then(() => {
        // Select the time slot
        setTimeout(() => {
            const timeButtons = document.querySelectorAll('.time-slot-btn');
            timeButtons.forEach(btn => {
                if (btn.textContent.includes(formatTime(startTime))) {
                    btn.click();
                }
            });
        }, 500);
    });
    
    // Scroll to booking section
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

// Utility function to format time
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Utility function to format date
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Global variables
let selectedTimeSlot = null;
let currentCalendarData = null;