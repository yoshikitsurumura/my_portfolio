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

// Initialize animations and chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CraneAIAnimations();

    // Chatbot toggle
    const chatbotToggler = document.querySelector('.chatbot-toggler');
    const chatbotWindow = document.querySelector('.chatbot-window');
    const conversation = document.querySelector('.chatbot-conversation');
    const input = document.querySelector('.chatbot-input input');
    const sendButton = document.querySelector('.chatbot-input button');

    if (chatbotToggler && chatbotWindow) {
        chatbotToggler.addEventListener('click', function() {
            chatbotWindow.classList.toggle('active');
        });
    }

    const qa_data = {
        "サービス": "AIチャットボット開発、業務自動化、Webアプリケーション開発などを提供しています。詳しくは<a href='index.html#services'>サービス一覧</a>をご覧ください。",
        "料金": "料金プランは、お客様のご要望に応じて個別に見積もりいたします。詳しくは各サービスページをご覧ください。",
        "実績": "金融サロン向けのAIチャットボットや、採用管理システムの開発などの実績があります。詳しくは<a href='index.html#achievements'>実績紹介</a>をご覧ください。",
        "問い合わせ": "お問い合わせは<a href='index.html#contact'>こちら</a>のフォームからお願いします。",
        "鶴村": "代表の鶴村佳輝は、AIと業務効率化の専門家です。詳しくは<a href='index.html#profile'>プロフィール</a>をご覧ください。",
        "ありがとう": "どういたしまして！他にご質問はありますか？"
    };

    const displayMessage = (message, sender) => {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('chatbot-message', sender);
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = message;
        messageWrapper.appendChild(messageContent);
        conversation.appendChild(messageWrapper);
        conversation.scrollTop = conversation.scrollHeight;
    };

    const handleUserInput = () => {
        const userInput = input.value.trim();
        if (userInput === "") return;

        displayMessage(userInput, 'user');
        input.value = "";

        let botResponse = "申し訳ありません、よく分かりませんでした。別の言葉で試していただけますか？";
        for (const key in qa_data) {
            if (userInput.toLowerCase().includes(key)) {
                botResponse = qa_data[key];
                break;
            }
        }

        setTimeout(() => {
            displayMessage(botResponse, 'bot');
        }, 500);
    };

    if (sendButton && input) {
        sendButton.addEventListener('click', handleUserInput);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserInput();
            }
        });
    }
});

