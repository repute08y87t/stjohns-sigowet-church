// ============ SINGLE GLOBAL BACKGROUND SLIDESHOW ============
const landingImage = 'images/LANDING PAGE.jpg';
const otherImages = [
    'images/PAGE 1.jpeg',
    'images/PAGE 2.jpeg',
    'images/PAGE 3.jpeg',
    'images/PAGE 4.jpeg',
    'images/PAGE 5.jpg',
    'images/PAGE 6.jpg',
    'images/PAGE 7.jpg',
    'images/PAGE 8.jpg'
];

let step = 0;
let imageIndex = 0;
const bgElement = document.getElementById('global-bg');

if (bgElement) {
    bgElement.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('${landingImage}')`;
    bgElement.style.backgroundSize = 'cover';
    bgElement.style.backgroundPosition = 'center';
}

function changeGlobalBackground() {
    if (!bgElement) return;
    
    bgElement.classList.add('fade-out');
    
    setTimeout(() => {
        if (step === 0) {
            bgElement.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('${otherImages[imageIndex]}')`;
            step = 1;
        } else {
            bgElement.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('${landingImage}')`;
            step = 0;
            imageIndex = (imageIndex + 1) % otherImages.length;
        }
        
        bgElement.classList.remove('fade-out');
    }, 750);
}

setInterval(changeGlobalBackground, 60000);

// ============ LOGO ROTATOR ============
const logos = ['images/CHURCH LOGO 1.jpeg', 'images/CHURCH LOGO 2.jpg'];
let logoIndex = 0;
const logoImg = document.getElementById('logoImage');

if (logoImg) {
    setInterval(() => {
        logoIndex = (logoIndex + 1) % logos.length;
        logoImg.style.opacity = '0';
        setTimeout(() => {
            logoImg.src = logos[logoIndex];
            logoImg.style.opacity = '1';
        }, 300);
    }, 3000);
}

// ============ LOAD MANAGER CONTENT FROM data.json ============
let churchData = {};

function loadManagerContent() {
    fetch('data.json?' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            churchData = data;
            updateWebsiteContent();
        })
        .catch(error => {
            console.log('Using default content');
            // Default content if file doesn't exist
            churchData = {
                events: [
                    "Annual Parish Harvest Festival - Coming Soon",
                    "KAMA & Mothers' Union Sunday - Coming Soon"
                ],
                announcements: "Welcome to ACK St. John's Sigowet",
                serviceTimes: {
                    sundayEnglish: "08:00 AM – 09:30 AM",
                    sundayKiswahili: "10:00 AM – 12:00 PM",
                    wednesday: "04:00 PM – 05:30 PM",
                    friday: "03:00 PM – 05:00 PM"
                },
                giving: {
                    mpesa: "[To be provided]",
                    bankAccount: "[To be provided]"
                }
            };
            updateWebsiteContent();
        });
}

function updateWebsiteContent() {
    // Update events
    if (churchData.events) {
        const eventList = document.querySelector('.event-list');
        if (eventList) {
            eventList.innerHTML = '';
            churchData.events.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event-item';
                eventDiv.textContent = event;
                eventList.appendChild(eventDiv);
            });
        }
    }
    
    // Update service times if provided
    if (churchData.serviceTimes) {
        const serviceCards = document.querySelectorAll('.service-card .time');
        if (serviceCards[0]) serviceCards[0].textContent = churchData.serviceTimes.sundayEnglish;
        if (serviceCards[1]) serviceCards[1].textContent = churchData.serviceTimes.sundayKiswahili;
        if (serviceCards[2]) serviceCards[2].textContent = churchData.serviceTimes.wednesday;
        if (serviceCards[3]) serviceCards[3].textContent = churchData.serviceTimes.friday;
    }
    
    // Update giving info
    if (churchData.giving) {
        const mpesaInput = document.getElementById('mpesaPaybill');
        const accountInput = document.getElementById('accountNumber');
        if (mpesaInput && churchData.giving.mpesa) mpesaInput.value = churchData.giving.mpesa;
        if (accountInput && churchData.giving.bankAccount) accountInput.value = churchData.giving.bankAccount;
    }
}

loadManagerContent();

// ============ PRAYER REQUEST FORM - Saves to localStorage and shows admin ============
let prayerRequests = JSON.parse(localStorage.getItem('prayerRequests')) || [];

function savePrayerRequest(name, message) {
    const newRequest = {
        id: Date.now(),
        name: name,
        message: message,
        date: new Date().toLocaleString(),
        status: 'pending'
    };
    prayerRequests.unshift(newRequest);
    localStorage.setItem('prayerRequests', JSON.stringify(prayerRequests));
    
    // Also create a downloadable file for the church manager
    const allPrayers = prayerRequests.map(r => `${r.date} - ${r.name}: ${r.message}`).join('\n\n');
    console.log('Prayer saved. Total prayers: ' + prayerRequests.length);
}

const prayerForm = document.getElementById('prayerForm');
if (prayerForm) {
    prayerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('prayerName').value;
        const message = document.getElementById('prayerMessage').value;
        
        savePrayerRequest(name, message);
        
        const response = document.getElementById('prayerResponse');
        response.innerHTML = `<p style="color: #FFD700;">✨ Thank you ${name}! Your prayer request has been received. Church leadership has been notified. God bless you. ✨</p>`;
        this.reset();
        
        setTimeout(() => {
            response.innerHTML = '';
        }, 5000);
    });
}

// ============ ADMIN PANEL (Hidden - Press 'A' key to open) ============
let adminVisible = false;

document.addEventListener('keydown', function(e) {
    if (e.key === 'a' || e.key === 'A') {
        showAdminPanel();
    }
});

function showAdminPanel() {
    const prayerCount = prayerRequests.length;
    const pendingCount = prayerRequests.filter(r => r.status === 'pending').length;
    
    let adminHtml = `
        <div id="adminPanel" style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10000; background:#1a1a2a; padding:25px; border-radius:20px; border:2px solid #FFD700; max-width:500px; width:90%; max-height:80vh; overflow:auto;">
            <h3 style="color:#FFD700;">Church Admin Panel</h3>
            <button onclick="closeAdminPanel()" style="float:right; background:#ff4444; border:none; padding:5px 10px; border-radius:10px; cursor:pointer;">✕</button>
            
            <div style="margin:20px 0; padding:15px; background:#0a0a0a; border-radius:15px;">
                <h4>📋 Prayer Requests (${prayerCount})</h4>
                <p>Pending: ${pendingCount}</p>
                <button onclick="downloadPrayerRequests()" style="background:#FFD700; color:#000; border:none; padding:8px 15px; border-radius:10px; margin-top:10px; cursor:pointer;">📥 Download All Prayers</button>
                <button onclick="clearPrayerRequests()" style="background:#ff4444; color:#fff; border:none; padding:8px 15px; border-radius:10px; margin-top:10px; margin-left:10px; cursor:pointer;">🗑 Clear All</button>
            </div>
            
            <div style="margin:20px 0; padding:15px; background:#0a0a0a; border-radius:15px;">
                <h4>📅 Manage Events</h4>
                <p>Edit the <strong>data.json</strong> file in your project folder</p>
                <p style="font-size:12px; color:#aaa;">Open data.json with Notepad and change the "events" list</p>
            </div>
            
            <div style="margin:20px 0; padding:15px; background:#0a0a0a; border-radius:15px;">
                <h4>💰 Manage Giving</h4>
                <p>Edit <strong>data.json</strong> to update M-Pesa and Bank details</p>
            </div>
            
            <div style="margin:20px 0; padding:15px; background:#0a0a0a; border-radius:15px;">
                <h4>📧 Email Settings</h4>
                <p>To receive prayer requests by email, use a free service like <strong>Formspree</strong> or <strong>EmailJS</strong></p>
            </div>
        </div>
        <div id="adminOverlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999;" onclick="closeAdminPanel()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', adminHtml);
}

function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const overlay = document.getElementById('adminOverlay');
    if (panel) panel.remove();
    if (overlay) overlay.remove();
}

function downloadPrayerRequests() {
    let content = "=== ACK ST. JOHN'S SIGOWET PRAYER REQUESTS ===\n\n";
    prayerRequests.forEach(r => {
        content += `[${r.date}] ${r.name}:\n${r.message}\n\n---\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `prayer-requests-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function clearPrayerRequests() {
    if (confirm('Are you sure? This will delete ALL prayer requests.')) {
        prayerRequests = [];
        localStorage.setItem('prayerRequests', JSON.stringify(prayerRequests));
        alert('All prayer requests cleared!');
        closeAdminPanel();
    }
}

// Expose functions globally
window.copyToClipboard = function(elementId) {
    const input = document.getElementById(elementId);
    input.select();
    document.execCommand('copy');
    alert('✓ Copied to clipboard!');
};

window.downloadPrayerRequests = downloadPrayerRequests;
window.clearPrayerRequests = clearPrayerRequests;
window.closeAdminPanel = closeAdminPanel;

// ============ SCROLL PROGRESS BAR ============
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
});

// ============ SPARKLING PARTICLES ============
function createParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];
    
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    function createParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.2,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.2
        };
    }
    
    function initParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }
    
    function drawParticles() {
        ctx.clearRect(0, 0, width, height);
        
        for (let p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha * 0.6})`;
            ctx.fill();
            
            p.x += p.speedX;
            p.y += p.speedY;
            
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
        }
        
        requestAnimationFrame(drawParticles);
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles(Math.floor(width * height / 8000));
    });
    
    resizeCanvas();
    initParticles(Math.floor(width * height / 8000));
    drawParticles();
}

createParticles('home-particles');
createParticles('about-particles');
createParticles('services-particles');
createParticles('sermons-particles');
createParticles('contact-particles');

// ============ SCROLL ANIMATIONS ============
const sections = document.querySelectorAll('.section');
const observerOptions = { 
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
};
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);
sections.forEach(section => { sectionObserver.observe(section); });

// ============ MOBILE MENU ============
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.backgroundColor = 'rgba(0,0,0,0.95)';
            navLinks.style.padding = '30px';
            navLinks.style.gap = '20px';
            navLinks.style.zIndex = '999';
        } else {
            navLinks.style.display = '';
        }
    });
}

// ============ SMOOTH NAVIGATION ============
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
            if (navLinks.classList && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navLinks.style.display = '';
            }
        }
    });
});

const exploreBtn = document.getElementById('exploreBtn');
if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
}

console.log('✨ ACK St. John\'s Sigowet - Admin Panel Ready (Press "A" key) ✨');