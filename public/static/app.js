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

// Utility function to format time
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Global variables
let selectedTimeSlot = null;