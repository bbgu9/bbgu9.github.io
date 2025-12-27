document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const loader = document.querySelector('.loader');
    const contactDropdown = document.querySelector('.contact-dropdown');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
        particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 1 - 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > canvas.height) {
                particle.speedY *= -1;
            }

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(110, 142, 251, ${particle.opacity})`;
            ctx.fill();

            for (let j = index + 1; j < particles.length; j++) {
                const dx = particles[j].x - particle.x;
                const dy = particles[j].y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(110, 142, 251, ${0.1 * (1 - distance / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        });

        animationId = requestAnimationFrame(drawParticles);
    }

    function initParticles() {
        resizeCanvas();
        createParticles();
        drawParticles();
    }

    initParticles();

    window.addEventListener('resize', function() {
        cancelAnimationFrame(animationId);
        resizeCanvas();
        createParticles();
        drawParticles();
    });

    const typewriterText = "\u8d75\u4e00\u9e23\u7684\u4f5c\u54c1\u96c6";
    const typewriterElement = document.getElementById('typewriter');
    let charIndex = 0;

    function typeWriter() {
        if (charIndex < typewriterText.length) {
            typewriterElement.textContent += typewriterText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 100);
        }
    }

    setTimeout(typeWriter, 500);

    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            themeIcon.textContent = '\u2600';
        } else {
            themeIcon.textContent = '\uD83C\uDF19';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            if (newTheme === 'dark') {
                themeIcon.textContent = '\u2600';
            } else {
                themeIcon.textContent = '\uD83C\uDF19';
            }
        });
    }

    const backToTopButton = document.getElementById('backToTop');
    const progressBar = document.getElementById('progressBar');
    
    window.addEventListener('scroll', function() {
        if (backToTopButton) {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }

        if (progressBar) {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        }
    });

    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (loader) {
                loader.classList.add('active');
            }

            setTimeout(function() {
                if (loader) {
                    loader.classList.remove('active');
                }

                alert('\u6d88\u606f\u5df2\u53d1\u9001\u6210\u529f\uff01\u6211\u4eec\u4f1a\u5c3d\u5feb\u56de\u590d\u60a8\u3002');
                contactForm.reset();
            }, 1500);
        });
    }

    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    function updateActiveNav() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    const viewButtons = document.querySelectorAll('.view-btn');
    
    const projectData = {
        '\u667a\u80fd\u5bb6\u5c45\u63a7\u5236\u7cfb\u7edf': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u57fa\u4e8eSTM32\u7684\u667a\u80fd\u5bb6\u5c45\u63a7\u5236\u7cfb\u7edf\uff0c\u96c6\u6210\u4e86\u4f20\u611f\u5668\u6570\u636e\u91c7\u96c6\u3001\u65e0\u7ebf\u901a\u4fe1\u548c\u81ea\u52a8\u5316\u63a7\u5236\u529f\u80fd\uff0c\u5b9e\u73b0\u4e86\u8fdc\u7a0b\u76d1\u63a7\u548c\u667a\u80fd\u8054\u52a8\u3002\u7cfb\u7edf\u652f\u6301\u591a\u79cd\u4f20\u611f\u5668\u63a5\u5165\uff0c\u5305\u62ec\u6e29\u5ea6\u3001\u6e7f\u5ea6\u3001\u5149\u7167\u7b49\uff0c\u901a\u8fc7WiFi\u6a21\u5757\u5b9e\u73b0\u4e0e\u4e91\u5e73\u53f0\u7684\u901a\u4fe1\uff0c\u7528\u6237\u53ef\u4ee5\u901a\u8fc7\u624b\u673aAPP\u5b9e\u65f6\u67e5\u770b\u548c\u63a7\u5236\u5bb6\u5c45\u8bbe\u5907\u3002',
            tech: ['STM32', 'ESP8266', 'MQTT', 'Python', 'React Native'],
            highlights: [
                '\u652f\u6301\u591a\u4f20\u611f\u5668\u6570\u636e\u91c7\u96c6',
                '\u5b9e\u65f6\u8fdc\u7a0b\u76d1\u63a7\u529f\u80fd',
                '\u667a\u80fd\u573a\u666f\u8054\u52a8\uff0c\u652f\u63016\u79cd\u9884\u8bbe\u573a\u666f',
                '\u4f4e\u529f\u8017\u8bbe\u8ba1\uff0c\u7535\u6c60\u7eed\u822a\u53ef\u8fbe6\u4e2a\u6708'
            ]
        },
        '\u5de5\u4e1a\u6570\u636e\u91c7\u96c6\u6a21\u5757': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u9ad8\u7cbe\u5ea6\u5de5\u4e1a\u6570\u636e\u91c7\u96c6\u6a21\u5757\uff0c\u91c7\u752824\u4f4dADC\u548cFPGA\u6280\u672f\uff0c\u652f\u6301\u591a\u901a\u9053\u540c\u6b65\u91c7\u96c6\uff0c\u5e7f\u6cdb\u5e94\u7528\u4e8e\u5de5\u4e1a\u81ea\u52a8\u5316\u9886\u57df\u3002\u6a21\u5757\u5177\u6709\u9ad8\u7cbe\u5ea6\u3001\u9ad8\u91c7\u6837\u7387\u7684\u7279\u70b9\uff0c\u91c7\u6837\u7387\u53ef\u8fbe1MHz\uff0c\u652f\u630132\u901a\u9053\u540c\u6b65\u91c7\u96c6\uff0c\u5e76\u63d0\u4f9b\u591a\u79cd\u5de5\u4e1a\u603b\u7ebf\u63a5\u53e3\u3002',
            tech: ['FPGA', 'ADC', 'CPLD', 'Verilog', 'LabVIEW'],
            highlights: [
                '24\u4f4d\u9ad8\u7cbe\u5ea6ADC\uff0c\u91c7\u6837\u7387\u53ef\u8fbe1MHz',
                '\u652f\u630132\u901a\u9053\u540c\u6b65\u91c7\u96c6',
                '\u5185\u7f6eFPGA\u8fdb\u884c\u5b9e\u65f6\u6570\u636e\u5904\u7406',
                '\u63d0\u4f9b\u591a\u79cd\u5de5\u4e1a\u63a5\u53e3\uff0c\u652f\u6301Modbus\u548cCAN\u603b\u7ebf'
            ]
        },
        '\u5d4c\u5165\u5f0fLinux\u5f00\u53d1\u677f': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u57fa\u4e8eARM Cortex-A9\u7684\u5d4c\u5165\u5f0fLinux\u5f00\u53d1\u677f\uff0c\u96c6\u6210\u4e86\u4e30\u5bcc\u7684\u5916\u8bbe\u63a5\u53e3\uff0c\u652f\u6301\u591a\u79cd\u64cd\u4f5c\u7cfb\u7edf\uff0c\u9002\u7528\u4e8e\u7269\u8054\u7f51\u548c\u8fb9\u7f18\u8ba1\u7b97\u5e94\u7528\u3002\u5f00\u53d1\u677f\u4e3b\u9891\u9ad8\u8fbe1.5GHz\uff0c\u914d\u59072GB\u5185\u5b58\u548c16GB\u5b58\u50a8\uff0c\u652f\u63014K\u89c6\u9891\u8f93\u51fa\uff0c\u63d0\u4f9b\u5b8c\u6574\u7684\u8f6f\u4ef6\u5f00\u53d1\u5de5\u5177\u94fe\u3002',
            tech: ['ARM Cortex-A9', 'Linux Kernel', 'Device Tree', 'Yocto', 'Qt'],
            highlights: [
                '\u4e3b\u98911.5GHz\uff0c\u6027\u80fd\u5f3a\u52b2',
                '\u652f\u63014K\u89c6\u9891\u8f93\u51fa',
                '\u63d0\u4f9b\u5b8c\u6574\u7684\u8f6f\u4ef6\u5f00\u53d1\u73af\u5883',
                '\u652f\u6301\u591a\u79cd\u64cd\u4f5c\u7cfb\u7edf\uff1aLinux\u3001Android\u3001RTOS'
            ]
        },
        '\u7535\u673a\u9a71\u52a8\u63a7\u5236\u5668': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u9ad8\u6027\u80fd\u7535\u673a\u9a71\u52a8\u63a7\u5236\u5668\uff0c\u652f\u6301\u591a\u79cd\u7535\u673a\u7c7b\u578b\uff0c\u91c7\u7528FOC\u7b97\u6cd5\u5b9e\u73b0\u7cbe\u786e\u63a7\u5236\uff0c\u5e7f\u6cdb\u5e94\u7528\u4e8e\u673a\u5668\u4eba\u548c\u81ea\u52a8\u5316\u8bbe\u5907\u3002\u63a7\u5236\u5668\u652f\u6301BLDC\u548cPMSM\u7535\u673a\uff0c\u91c7\u7528\u5148\u8fdb\u7684FOC\u7b97\u6cd5\u5b9e\u73b0\u7cbe\u786e\u7684\u8f6c\u77e9\u63a7\u5236\uff0c\u5177\u6709\u54cd\u5e94\u5feb\u3001\u7cbe\u5ea6\u9ad8\u7684\u7279\u70b9\u3002',
            tech: ['FOC\u7b97\u6cd5', 'STM32', 'PID\u63a7\u5236', 'MATLAB', 'Altium Designer'],
            highlights: [
                '\u652f\u6301\u591a\u79cd\u7535\u673a\u7c7b\u578b',
                'FOC\u7b97\u6cd5\u5b9e\u73b0\u7cbe\u786e\u63a7\u5236',
                '\u54cd\u5e94\u901f\u5ea6\u5feb\uff0c\u63a7\u5236\u7cbe\u5ea6\u9ad8',
                '\u63d0\u4f9bCAN\u603b\u7ebf\u63a5\u53e3\uff0c\u6613\u4e8e\u96c6\u6210'
            ]
        }
    };

    const modal = document.getElementById('projectModal');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');
    const modalTech = document.getElementById('modalTech');
    const modalHighlights = document.getElementById('modalHighlights');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectTitle = this.closest('.project-info').querySelector('h3').textContent;
            const data = projectData[projectTitle];
            
            if (data) {
                modalTitle.textContent = projectTitle;
                modalImage.src = data.image;
                modalDescription.textContent = data.description;
                
                modalTech.innerHTML = '';
                data.tech.forEach(tech => {
                    const span = document.createElement('span');
                    span.textContent = tech;
                    modalTech.appendChild(span);
                });
                
                modalHighlights.innerHTML = '';
                data.highlights.forEach(highlight => {
                    const li = document.createElement('li');
                    li.textContent = highlight;
                    modalHighlights.appendChild(li);
                });
                
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    let lastScrollTop = 0;
    const nav = document.querySelector('nav');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (nav) {
            if (scrollTop > 100) {
                nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
            } else {
                nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        }
        
        lastScrollTop = scrollTop;
    });

    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    const header = document.querySelector('header');
    if (header) {
        header.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.3s ease';
        });

        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    if (contactDropdown && dropdownMenu) {
        const dropdownLinks = dropdownMenu.querySelectorAll('a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href.startsWith('mailto:') || href.startsWith('tel:')) {
                    return;
                }
                e.preventDefault();
                alert('\u8054\u7cfb\u65b9\u5f0f\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f');
            });
        });
    }
});
