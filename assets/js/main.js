// Advanced animations and interactions
class CraneAIAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupParallaxEffect();
        this.setupTypewriterEffect();
        this.setupParticleEffect();
        this.setupSmoothScrolling();
    }

    // Scroll-triggered animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.service-item, .achievement-item, .problem-item, .solution-item').forEach(el => {
            observer.observe(el);
        });
    }

    // Parallax effect for hero section
    setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('#hero-video');
            if (parallax) {
                const speed = scrolled * 0.5;
                parallax.style.transform = `translateY(${speed}px)`;
            }
        });
    }

    // Typewriter effect that preserves inline markup
    setupTypewriterEffect() {
        const heroText = document.querySelector('.hero-content h2');
        if (!heroText) {
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const clone = heroText.cloneNode(true);
        const animatedNodes = [];

        const cloneChildren = (sourceNode, targetNode) => {
            sourceNode.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const content = child.textContent;
                    if (content === null) {
                        return;
                    }
                    const isWhitespaceOnly = content.trim().length === 0;
                    const newTextNode = document.createTextNode(isWhitespaceOnly ? content : '');
                    targetNode.appendChild(newTextNode);
                    if (!isWhitespaceOnly && content.length > 0) {
                        animatedNodes.push({ node: newTextNode, text: content });
                    }
                } else {
                    const elementClone = child.cloneNode(false);
                    targetNode.appendChild(elementClone);
                    cloneChildren(child, elementClone);
                }
            });
        };

        heroText.innerHTML = '';
        cloneChildren(clone, heroText);

        if (prefersReducedMotion || animatedNodes.length === 0) {
            animatedNodes.forEach(({ node, text }) => {
                node.textContent = text;
            });
            return;
        }

        heroText.style.borderRight = '2px solid #00f0ff';

        let nodeIndex = 0;
        let charIndex = 0;

        const typeWriter = () => {
            const current = animatedNodes[nodeIndex];
            current.node.textContent += current.text.charAt(charIndex);
            charIndex += 1;

            if (charIndex >= current.text.length) {
                nodeIndex += 1;
                charIndex = 0;
            }

            if (nodeIndex < animatedNodes.length) {
                setTimeout(typeWriter, 50);
            } else {
                setTimeout(() => {
                    heroText.style.borderRight = 'none';
                }, 1000);
            }
        };

        setTimeout(typeWriter, 1000);
    }

    // Particle effect for background
    setupParticleEffect() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        canvas.style.opacity = '0.3';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            };
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push(createParticle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = '#00f0ff';
                ctx.fill();
            });

            requestAnimationFrame(animateParticles);
        }

        resizeCanvas();
        initParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });
    }

    // Enhanced smooth scrolling
    setupSmoothScrolling() {
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
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CraneAIAnimations();
});
