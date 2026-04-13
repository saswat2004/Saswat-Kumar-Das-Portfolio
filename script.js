// ===== Vanta.js 3D NET Background =====
function initVanta() {
  if (typeof VANTA !== 'undefined' && typeof THREE !== 'undefined' && document.getElementById('vanta-bg')) {
    try {
      VANTA.NET({
        el: '#vanta-bg',
        mouseControls: true,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x6c63ff,
        backgroundColor: 0x0a0a1a,
        points: 12.00,
        maxDistance: 22.00,
        spacing: 18.00,
        showDots: true
      });
    } catch (err) {
      console.warn("Vanta initialization failed:", err);
    }
  }
}
document.addEventListener('DOMContentLoaded', initVanta);

// ===== Enhanced Particle Background =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let shootingStars = [];
let animFrameId;
let mouse = { x: -9999, y: -9999 };
const MOUSE_RADIUS = 150;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
document.addEventListener('mouseleave', () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

class Particle {
  constructor() {
    this.reset();
    this.baseSize = this.size;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.005 + Math.random() * 0.015;
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.2 + 0.4;
    this.baseSize = this.size;
    this.speedX = (Math.random() - 0.5) * 0.45;
    this.speedY = (Math.random() - 0.5) * 0.45;
    this.opacity = Math.random() * 0.5 + 0.15;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.005 + Math.random() * 0.015;
    // Color variation: purple, cyan, or pink
    const r = Math.random();
    if (r < 0.45) this.hue = 252;      // purple
    else if (r < 0.8) this.hue = 200;  // cyan
    else this.hue = 330;               // pink
  }
  update() {
    // Mouse repulsion
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_RADIUS && dist > 0) {
      const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * force * 3;
      this.y += Math.sin(angle) * force * 3;
    }

    this.x += this.speedX;
    this.y += this.speedY;

    // Pulsing size
    this.pulsePhase += this.pulseSpeed;
    this.size = this.baseSize + Math.sin(this.pulsePhase) * 0.6;

    if (this.x < -20) this.x = canvas.width + 20;
    if (this.x > canvas.width + 20) this.x = -20;
    if (this.y < -20) this.y = canvas.height + 20;
    if (this.y > canvas.height + 20) this.y = -20;
  }
  draw() {
    // Outer glow
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
    gradient.addColorStop(0, `hsla(${this.hue}, 85%, 72%, ${this.opacity * 0.4})`);
    gradient.addColorStop(1, `hsla(${this.hue}, 85%, 72%, 0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 85%, 75%, ${this.opacity})`;
    ctx.fill();
  }
}

// Shooting star class
class ShootingStar {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width * 1.5;
    this.y = -10;
    this.length = 60 + Math.random() * 100;
    this.speed = 4 + Math.random() * 6;
    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
    this.opacity = 0.6 + Math.random() * 0.4;
    this.life = 1;
    this.decay = 0.005 + Math.random() * 0.01;
    this.hue = Math.random() > 0.5 ? 252 : 200;
    this.active = true;
  }
  update() {
    this.x -= Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life -= this.decay;
    if (this.life <= 0 || this.y > canvas.height + 20) {
      this.active = false;
    }
  }
  draw() {
    const tailX = this.x + Math.cos(this.angle) * this.length;
    const tailY = this.y - Math.sin(this.angle) * this.length;
    const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
    gradient.addColorStop(0, `hsla(${this.hue}, 90%, 80%, ${this.opacity * this.life})`);
    gradient.addColorStop(1, `hsla(${this.hue}, 90%, 80%, 0)`);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(tailX, tailY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Head glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 90%, 90%, ${this.opacity * this.life})`;
    ctx.fill();
  }
}

function initParticles() {
  const count = Math.min(120, Math.floor(window.innerWidth * window.innerHeight / 10000));
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function drawConnections() {
  const maxDist = 140;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const alpha = 0.1 * (1 - dist / maxDist);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(140, 120, 255, ${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }

    // Mouse connection lines
    const dxM = particles[i].x - mouse.x;
    const dyM = particles[i].y - mouse.y;
    const distM = Math.sqrt(dxM * dxM + dyM * dyM);
    if (distM < MOUSE_RADIUS * 1.5) {
      const alpha = 0.15 * (1 - distM / (MOUSE_RADIUS * 1.5));
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = `rgba(180, 155, 250, ${alpha})`;
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }
  }
}

function spawnShootingStar() {
  if (shootingStars.length < 3 && Math.random() < 0.004) {
    shootingStars.push(new ShootingStar());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();

  // Shooting stars
  spawnShootingStar();
  shootingStars = shootingStars.filter(s => s.active);
  shootingStars.forEach(s => { s.update(); s.draw(); });

  animFrameId = requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// ===== Typing Animation =====
const typewriterEl = document.getElementById('typewriter');
const phrases = [
  'Final Year B.Tech CSE Student',
  'Aspiring Data Analyst',
  'Python • SQL • Power BI',
  'Data Storyteller',
  'Dashboard Builder'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 60;

function typeEffect() {
  const current = phrases[phraseIndex];
  if (isDeleting) {
    typewriterEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    typeSpeed = 30;
  } else {
    typewriterEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    typeSpeed = 70;
  }

  if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    typeSpeed = 2000; // pause before delete
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 400; // pause before next phrase
  }

  setTimeout(typeEffect, typeSpeed);
}

typeEffect();

// ===== Cursor Glow Effect =====
const cursorGlow = document.getElementById('cursorGlow');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorGlow.style.left = mouseX + 'px';
  cursorGlow.style.top = mouseY + 'px';
  cursorGlow.style.opacity = '1';
});

document.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
});

// ===== Glow Card Mouse Tracking =====
document.querySelectorAll('.glow-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', x + 'px');
    card.style.setProperty('--mouse-y', y + 'px');
  });
});

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
});

// ===== Mobile Nav Toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.classList.toggle('nav-open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.classList.remove('nav-open');
  });
});

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('.section, .hero');
const navLinkElements = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 150;
    if (window.pageYOffset >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinkElements.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNav);

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== Animated Counter =====
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const targetAttr = entry.target.getAttribute('data-target');
      if (targetAttr) {
        animateCounter(entry.target, targetAttr);
      }
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(num => counterObserver.observe(num));

function animateCounter(element, targetStr) {
  const targetNum = parseFloat(targetStr);
  if (isNaN(targetNum)) return;
  const suffix = targetStr.replace(/[0-9.]/g, '');
  
  let current = 0;
  const increment = targetNum / 40;
  const timer = setInterval(() => {
    current += increment;
    if (current >= targetNum) {
      element.textContent = targetNum + suffix;
      clearInterval(timer);
    } else {
      element.textContent = Math.ceil(current) + suffix;
    }
  }, 40);
}

// ===== Skills Tab Switching =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');

    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `tab-${targetTab}`) {
        content.classList.add('active');
        // Re-trigger reveal animations for newly visible content
        content.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('revealed');
          if (el.revealTimeout) clearTimeout(el.revealTimeout);
          el.revealTimeout = setTimeout(() => {
            requestAnimationFrame(() => {
              el.classList.add('revealed');
            });
          }, 50);
        });
      }
    });
  });
});

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ===== Skill Tag Hover Interaction =====
document.querySelectorAll('.skill-tag').forEach(tag => {
  tag.addEventListener('mouseenter', function() {
    const level = this.getAttribute('data-level');
    this.style.setProperty('--skill-level', level + '%');
  });
});

// ===== Hero Parallax =====
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  if (hero) {
    const scrolled = window.pageYOffset;
    const shapes = hero.querySelectorAll('.shape');
    shapes.forEach((shape, i) => {
      const speed = 0.1 + (i * 0.05);
      shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }
});

// ===== Tilt Effect on Cards =====
document.querySelectorAll('.project-card, .achievement-card, .interest-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * 6;
    const tiltY = (x - 0.5) * -6;
    card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== Page Load Animation =====
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
