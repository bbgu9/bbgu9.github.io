// 节流函数 - 限制函数在一定时间内只能执行一次
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded事件已触发');
    const contactForm = document.getElementById('contactForm');
    const loaderContainer = document.getElementById('loaderContainer');
    console.log('loaderContainer元素:', loaderContainer);
    const loader = document.querySelector('.loader');
    console.log('loader元素:', loader);
    const contactDropdown = document.querySelector('.contact-dropdown');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const navToggle = document.getElementById('navToggle');
    const navList = document.getElementById('navList');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    // 页面加载完成后隐藏加载动画
    if (loaderContainer) {
        setTimeout(function() {
            console.log('准备隐藏loader...');
            console.log('当前loaderContainer类:', loaderContainer.className);
            loaderContainer.classList.add('hidden');
            console.log('添加hidden类后loaderContainer类:', loaderContainer.className);
            // 在loader隐藏后重新检查元素可见性，确保初始元素正确显示
            // 增加延迟时间，确保loader完全隐藏且页面布局稳定
            setTimeout(handleScrollAnimations, 300);
        }, 1000); // 1秒后隐藏加载动画
    }
    
    // 页面完全加载后再次尝试隐藏loader（作为后备方案）
    window.addEventListener('load', function() {
        console.log('window.load事件已触发');
        if (loaderContainer && !loaderContainer.classList.contains('hidden')) {
            console.log('window.load中尝试隐藏loader...');
            loaderContainer.classList.add('hidden');
            // 在loader隐藏后重新检查元素可见性，确保初始元素正确显示
            setTimeout(handleScrollAnimations, 300);
        }
        // 页面完全加载后再次检查元素可见性，确保所有元素正确显示
        setTimeout(handleScrollAnimations, 500);
    });
    
    // DOM内容完全解析后，再延迟一段时间检查元素可见性
    // 确保所有CSS和布局都已应用
    setTimeout(handleScrollAnimations, 800);
    
    // 汉堡菜单切换功能
    if (navToggle && navList) {
        navToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            navToggle.classList.toggle('open');
            // 防止页面滚动
            document.body.style.overflow = navList.classList.contains('active') ? 'hidden' : 'auto';
        });
        
        // 点击导航链接后关闭菜单
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navList.classList.remove('active');
                navToggle.classList.remove('open');
                document.body.style.overflow = 'auto';
            });
        });
        
        // 点击页面其他区域关闭菜单
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
                navList.classList.remove('active');
                navToggle.classList.remove('open');
                document.body.style.overflow = 'auto';
            }
        });
    }

    const canvas = document.getElementById('particleCanvas');
    let ctx;
    let particles = [];
    let animationId;
    const mouse = { x: null, y: null, radius: 100 };

    if (canvas) {
        ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            // 减少粒子数量，提高性能
            const particleCount = Math.floor((canvas.width * canvas.height) / 25000);
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

        // 添加鼠标事件监听器
        canvas.addEventListener('mousemove', function(event) {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        canvas.addEventListener('mouseout', function() {
            mouse.x = null;
            mouse.y = null;
        });

        canvas.addEventListener('click', function(event) {
            // 创建新粒子效果
            const clickParticles = 10;
            for (let i = 0; i < clickParticles; i++) {
                particles.push({
                    x: event.x,
                    y: event.y,
                    size: Math.random() * 3 + 1,
                    speedX: Math.random() * 3 - 1.5,
                    speedY: Math.random() * 3 - 1.5,
                    opacity: Math.random() * 0.8 + 0.2,
                    life: 3000,
                    birthTime: Date.now()
                });
            }
        });

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 移除死亡的粒子
            particles = particles.filter(particle => {
                if (particle.life) {
                    return Date.now() - particle.birthTime < particle.life;
                }
                return true;
            });
            
            particles.forEach((particle, index) => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // 鼠标交互 - 只对靠近鼠标的粒子应用力
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - particle.x;
                    const dy = mouse.y - particle.y;
                    const distanceSquared = dx * dx + dy * dy;
                    const radiusSquared = mouse.radius * mouse.radius;
                    
                    if (distanceSquared < radiusSquared) {
                        const distance = Math.sqrt(distanceSquared);
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const maxForce = 0.3; // 减少最大力，减少计算量
                        const forceX = forceDirectionX * force * maxForce;
                        const forceY = forceDirectionY * force * maxForce;
                        
                        particle.speedX -= forceX;
                        particle.speedY -= forceY;
                    }
                }

                // 边界检查
                if (particle.x < 0 || particle.x > canvas.width) {
                    particle.speedX *= -1;
                }
                if (particle.y < 0 || particle.y > canvas.height) {
                    particle.speedY *= -1;
                }

                // 限制粒子速度
                particle.speedX = Math.max(-1.5, Math.min(1.5, particle.speedX));
                particle.speedY = Math.max(-1.5, Math.min(1.5, particle.speedY));

                // 绘制粒子
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(110, 142, 251, ${particle.opacity})`;
                ctx.fill();

                // 粒子连线 - 减少连线距离和数量
                for (let j = index + 1; j < particles.length; j++) {
                    const dx = particles[j].x - particle.x;
                    const dy = particles[j].y - particle.y;
                    const distanceSquared = dx * dx + dy * dy;
                    const maxDistanceSquared = 80 * 80; // 减少最大距离
                    
                    if (distanceSquared < maxDistanceSquared) {
                        const distance = Math.sqrt(distanceSquared);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(110, 142, 251, ${0.05 * (1 - distance / 80)})`;
                        ctx.lineWidth = 0.3; // 减少线宽
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
    }

    const typewriterText = "\u8d75\u4e00\u9e23\u7684\u4f5c\u54c1\u96c6";
    const typewriterElement = document.getElementById('typewriter');
    let charIndex = 0;

    function typeWriter() {
        if (typewriterElement && charIndex < typewriterText.length) {
            typewriterElement.textContent += typewriterText.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 100);
        }
    }

    if (typewriterElement) {
        setTimeout(typeWriter, 500);
    }

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
    
    // 优化滚动事件处理 - 使用节流
    window.addEventListener('scroll', throttle(function() {
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
    }, 16)); // ~60fps

    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    if (contactForm) {
        // 表单实时验证
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        // 添加错误提示元素
        function addErrorElement(inputId, errorMessage) {
            const input = document.getElementById(inputId);
            let errorElement = input.nextElementSibling;
            
            if (!errorElement || !errorElement.classList.contains('error-message')) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                input.parentNode.appendChild(errorElement);
            }
            
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            input.classList.add('error');
        }

        // 移除错误提示
        function removeErrorElement(inputId) {
            const input = document.getElementById(inputId);
            const errorElement = input.nextElementSibling;
            
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.style.display = 'none';
            }
            
            input.classList.remove('error');
        }

        // 验证姓名
        nameInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                addErrorElement('name', '请输入您的姓名');
            } else if (this.value.length < 2) {
                addErrorElement('name', '姓名至少需要2个字符');
            } else {
                removeErrorElement('name');
            }
        });

        // 验证邮箱
        emailInput.addEventListener('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value.trim() === '') {
                addErrorElement('email', '请输入您的邮箱');
            } else if (!emailRegex.test(this.value)) {
                addErrorElement('email', '请输入有效的邮箱地址');
            } else {
                removeErrorElement('email');
            }
        });

        // 验证留言
        messageInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                addErrorElement('message', '请输入您的留言');
            } else if (this.value.length < 10) {
                addErrorElement('message', '留言内容至少需要10个字符');
            } else {
                removeErrorElement('message');
            }
        });

        // 表单提交处理
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 触发所有输入的验证
            nameInput.dispatchEvent(new Event('input'));
            emailInput.dispatchEvent(new Event('input'));
            messageInput.dispatchEvent(new Event('input'));
            
            // 检查是否有错误
            const hasErrors = document.querySelectorAll('.error').length > 0;
            
            if (!hasErrors) {
                if (loader) {
                    loader.classList.add('active');
                }

                setTimeout(function() {
                    if (loader) {
                        loader.classList.remove('active');
                    }

                    alert('\u6d88\u606f\u5df2\u53d1\u9001\u6210\u529f\uff01\u6211\u4eec\u4f1a\u5c3d\u5feb\u56de\u590d\u60a8\u3002');
                    contactForm.reset();
                    // 移除所有错误提示
                    removeErrorElement('name');
                    removeErrorElement('email');
                    removeErrorElement('message');
                }, 1500);
            }
        });
    }

    // 获取所有导航锚点链接和专栏标题链接
    const navAndColumnLinks = document.querySelectorAll('nav a[href^="#"], .column-title-link');
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

        navAndColumnLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // 滚动时的元素渐入动画
    function handleScrollAnimations() {
        // 获取所有需要添加渐入动画的元素
        const fadeElements = document.querySelectorAll('.fade-in, .project-card, .skill-tag');
        
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            } else {
                // 如果元素不在视口内，可以选择移除visible类以实现滚动时的重复动画
                // element.classList.remove('visible');
            }
        });
    }

    // 初始化时触发一次，确保可见元素已经有动画
    handleScrollAnimations();
    
    // 滚动时触发动画 - 使用节流优化性能
    window.addEventListener('scroll', throttle(handleScrollAnimations, 16)); // ~60fps

    window.addEventListener('scroll', throttle(updateActiveNav, 16)); // ~60fps
    updateActiveNav();

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // 只有当目标是页面内锚点（以#开头）时，才阻止默认行为并进行平滑滚动
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
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

    // 技能标签动画效果
    const skillTags = document.querySelectorAll('.skill-tag');
    
    // 技能标签加载动画
    function animateSkillTags() {
        skillTags.forEach((tag, index) => {
            setTimeout(() => {
                tag.style.opacity = '0';
                tag.style.transform = 'translateY(20px) scale(0.8)';
                
                setTimeout(() => {
                    tag.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    tag.style.opacity = '1';
                    tag.style.transform = 'translateY(0) scale(1)';
                }, 50);
            }, index * 80);
        });
    }

    // 技能标签点击效果
    skillTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // 添加点击动画
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });

        // 鼠标悬停时添加脉冲效果
        tag.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 1s ease-in-out';
        });

        tag.addEventListener('animationend', function() {
            this.style.animation = '';
        });
    });

    // 页面加载完成后执行技能标签动画
    window.addEventListener('load', function() {
        animateSkillTags();
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
        },
        '\u667a\u80fd\u786c\u4ef6\u5f00\u53d1\u677f': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u57fa\u4e8eARM\u67b6\u6784\u7684\u9ad8\u6027\u80fd\u667a\u80fd\u786c\u4ef6\u5f00\u53d1\u677f\uff0c\u96c6\u6210\u4e86\u591a\u79cd\u4f20\u611f\u5668\u548c\u5916\u8bbe\u63a5\u53e3\uff0c\u652f\u6301\u591a\u79cd\u5f00\u53d1\u73af\u5883\u548c\u5de5\u5177\u94fe\uff0c\u63d0\u4f9b\u4e30\u5bcc\u7684\u793a\u4f8b\u4ee3\u7801\u548c\u6587\u6863\u652f\u6301\u3002\u5f00\u53d1\u677f\u9002\u7528\u4e8e\u7269\u8054\u7f51\u3001\u673a\u5668\u4eba\u3001\u81ea\u52a8\u5316\u63a7\u5236\u7b49\u9886\u57df\u7684\u5feb\u901f\u539f\u578b\u5f00\u53d1\u548c\u4ea7\u54c1\u9a8c\u8bc1\u3002',
            tech: ['ARM Cortex-M7', 'STM32H7', 'Sensor Fusion', 'Altium Designer', 'Keil'],
            highlights: [
                '\u9ad8\u6027\u80fdARM Cortex-M7\u5904\u7406\u5668',
                '\u96c6\u6210\u591a\u79cd\u4f20\u611f\u5668\u548c\u5916\u8bbe\u63a5\u53e3',
                '\u652f\u6301\u591a\u79cd\u5f00\u53d1\u73af\u5883\u548c\u5de5\u5177\u94fe',
                '\u4e30\u5bcc\u7684\u793a\u4f8b\u4ee3\u7801\u548c\u6587\u6863\u652f\u6301'
            ]
        },
        '\u4f20\u611f\u5668\u6a21\u5757\u8bbe\u8ba1': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u9ad8\u7cbe\u5ea6\u4f20\u611f\u5668\u6a21\u5757\u8bbe\u8ba1\uff0c\u96c6\u6210\u4e86\u6e29\u5ea6\u3001\u6e7f\u5ea6\u3001\u538b\u529b\u3001\u52a0\u901f\u5ea6\u7b49\u591a\u79cd\u4f20\u611f\u5668\uff0c\u91c7\u7528\u9ad8\u7cbe\u5ea6ADC\u8fdb\u884c\u6570\u636e\u91c7\u96c6\uff0c\u652f\u6301I2C\u548cSPI\u901a\u4fe1\u63a5\u53e3\uff0c\u9002\u7528\u4e8e\u7269\u8054\u7f51\u548c\u667a\u80fd\u8bbe\u5907\u5e94\u7528\u3002\u6a21\u5757\u5177\u6709\u4f4e\u529f\u8017\u3001\u9ad8\u7cbe\u5ea6\u3001\u5c0f\u578b\u5316\u7684\u7279\u70b9\uff0c\u652f\u6301\u591a\u79cd\u5de5\u4f5c\u6a21\u5f0f\u548c\u6570\u636e\u8f93\u51fa\u683c\u5f0f\u3002',
            tech: ['MEMS\u4f20\u611f\u5668', 'ADC', 'I2C', 'SPI', '\u4f4e\u529f\u8017\u8bbe\u8ba1'],
            highlights: [
                '\u96c6\u6210\u591a\u79cd\u9ad8\u7cbe\u5ea6\u4f20\u611f\u5668',
                '\u652f\u6301I2C\u548cSPI\u901a\u4fe1\u63a5\u53e3',
                '\u4f4e\u529f\u8017\u8bbe\u8ba1\uff0c\u9002\u5408\u7535\u6c60\u4f9b\u7535\u5e94\u7528',
                '\u5c0f\u578b\u5316\u5c01\u88c5\uff0c\u4fbf\u4e8e\u96c6\u6210'
            ]
        },
        '\u5d4c\u5165\u5f0f\u7cfb\u7edf\u56fa\u4ef6': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u57fa\u4e8eRTOS\u7684\u5d4c\u5165\u5f0f\u7cfb\u7edf\u56fa\u4ef6\u5f00\u53d1\uff0c\u5b9e\u73b0\u4e86\u591a\u4efb\u52a1\u7ba1\u7406\u3001\u8bbe\u5907\u9a71\u52a8\u3001\u901a\u4fe1\u534f\u8ba4\u7b49\u529f\u80fd\uff0c\u9002\u7528\u4e8e\u5de5\u4e1a\u63a7\u5236\u3001\u667a\u80fd\u5bb6\u5c45\u3001\u533b\u7597\u8bbe\u5907\u7b49\u9886\u57df\u3002\u56fa\u4ef6\u91c7\u7528\u6a21\u5757\u5316\u8bbe\u8ba1\uff0c\u5177\u6709\u9ad8\u53ef\u9760\u6027\u3001\u5b9e\u65f6\u6027\u548c\u53ef\u6269\u5c55\u6027\uff0c\u652f\u6301\u591a\u79cd\u786c\u4ef6\u5e73\u53f0\u548c\u901a\u4fe1\u63a5\u53e3\u3002',
            tech: ['FreeRTOS', 'C/C++', 'STM32', 'UART', 'SPI'],
            highlights: [
                '\u57fa\u4e8eFreeRTOS\u7684\u5b9e\u65f6\u64cd\u4f5c\u7cfb\u7edf',
                '\u6a21\u5757\u5316\u8bbe\u8ba1\uff0c\u6613\u4e8e\u7ef4\u62a4\u548c\u6269\u5c55',
                '\u652f\u6301\u591a\u79cd\u786c\u4ef6\u5e73\u53f0\u548c\u901a\u4fe1\u63a5\u53e3',
                '\u9ad8\u53ef\u9760\u6027\u548c\u5b9e\u65f6\u6027\u80fd'
            ]
        },
        '\u5b9e\u65f6\u64cd\u4f5c\u7cfb\u7edf\u5e94\u7528': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u5b9e\u65f6\u64cd\u4f5c\u7cfb\u7edf\u5728\u5d4c\u5165\u5f0f\u7cfb\u7edf\u4e2d\u7684\u5e94\u7528\u5f00\u53d1\uff0c\u5b9e\u73b0\u4e86\u4efb\u52a1\u8c03\u5ea6\u3001\u8d44\u6e90\u7ba1\u7406\u3001\u4e2d\u65ad\u5904\u7406\u7b49\u529f\u80fd\uff0c\u9002\u7528\u4e8e\u5de5\u4e1a\u81ea\u52a8\u5316\u3001\u673a\u5668\u4eba\u3001\u822a\u7a7a\u822a\u5929\u7b49\u9886\u57df\u3002\u5e94\u7528\u91c7\u7528\u5148\u8fdb\u7684\u5b9e\u65f6\u8c03\u5ea6\u7b97\u6cd5\uff0c\u5177\u6709\u4f4e\u5ef6\u8fdf\u3001\u9ad8\u53ef\u9760\u6027\u7684\u7279\u70b9\uff0c\u652f\u6301\u591a\u79cd\u786c\u4ef6\u5e73\u53f0\u548c\u5f00\u53d1\u73af\u5883\u3002',
            tech: ['RTOS', '\u4efb\u52a1\u8c03\u5ea6', '\u4e2d\u65ad\u5904\u7406', '\u8d44\u6e90\u7ba1\u7406', 'C/C++'],
            highlights: [
                '\u5148\u8fdb\u7684\u5b9e\u65f6\u8c03\u5ea6\u7b97\u6cd5',
                '\u4f4e\u5ef6\u8fdf\u3001\u9ad8\u53ef\u9760\u6027',
                '\u652f\u6301\u591a\u79cd\u786c\u4ef6\u5e73\u53f0',
                '\u4e30\u5bcc\u7684\u5f00\u53d1\u5de5\u5177\u548c\u8c03\u8bd5\u652f\u6301'
            ]
        },
        '\u673a\u5668\u4eba\u5e95\u76d8\u63a7\u5236': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u673a\u5668\u4eba\u5e95\u76d8\u63a7\u5236\u7cfb\u7edf\u5f00\u53d1\uff0c\u5b9e\u73b0\u4e86\u8fd0\u52a8\u63a7\u5236\u3001\u8def\u5f84\u89c4\u5212\u3001\u907f\u969c\u7b49\u529f\u80fd\uff0c\u9002\u7528\u4e8e\u670d\u52a1\u673a\u5668\u4eba\u3001AGV\u3001\u65e0\u4eba\u673a\u7b49\u9886\u57df\u3002\u7cfb\u7edf\u91c7\u7528\u5148\u8fdb\u7684\u8fd0\u52a8\u63a7\u5236\u7b97\u6cd5\uff0c\u5177\u6709\u9ad8\u7cbe\u5ea6\u3001\u9ad8\u7a33\u5b9a\u6027\u7684\u7279\u70b9\uff0c\u652f\u6301\u591a\u79cd\u4f20\u611f\u5668\u8f93\u5165\u548c\u901a\u4fe1\u63a5\u53e3\u3002',
            tech: ['\u673a\u5668\u4eba\u63a7\u5236', '\u8fd0\u52a8\u5b66\u7b97\u6cd5', '\u8def\u5f84\u89c4\u5212', '\u907f\u969c', 'STM32'],
            highlights: [
                '\u9ad8\u7cbe\u5ea6\u8fd0\u52a8\u63a7\u5236',
                '\u5148\u8fdb\u7684\u8def\u5f84\u89c4\u5212\u7b97\u6cd5',
                '\u5b9e\u65f6\u907f\u969c\u529f\u80fd',
                '\u652f\u6301\u591a\u79cd\u4f20\u611f\u5668\u8f93\u5165'
            ]
        },
        '\u667a\u80fd\u8f66\u7ade\u8d5b\u7cfb\u7edf': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u667a\u80fd\u8f66\u7ade\u8d5b\u7cfb\u7edf\u5f00\u53d1\uff0c\u5b9e\u73b0\u4e86\u81ea\u52a8\u5bfb\u8ff9\u3001\u901f\u5ea6\u63a7\u5236\u3001\u907f\u969c\u7b49\u529f\u80fd\uff0c\u9002\u7528\u4e8e\u5404\u7c7b\u667a\u80fd\u8f66\u7ade\u8d5b\u548c\u6559\u5b66\u5b9e\u9a8c\u3002\u7cfb\u7edf\u91c7\u7528\u9ad8\u6027\u80fd\u5fae\u63a7\u5236\u5668\u548c\u4f20\u611f\u5668\uff0c\u5177\u6709\u5feb\u901f\u54cd\u5e94\u3001\u9ad8\u7cbe\u5ea6\u63a7\u5236\u7684\u7279\u70b9\uff0c\u652f\u6301\u591a\u79cd\u8d5b\u9053\u548c\u6bd4\u8d5b\u89c4\u5219\u3002',
            tech: ['\u667a\u80fd\u8f66\u63a7\u5236', '\u5bfb\u8ff9\u7b97\u6cd5', 'PID\u63a7\u5236', '\u4f20\u611f\u5668\u878d\u5408', 'C/C++'],
            highlights: [
                '\u9ad8\u7cbe\u5ea6\u81ea\u52a8\u5bfb\u8ff9\u529f\u80fd',
                '\u5feb\u901f\u54cd\u5e94\u7684\u901f\u5ea6\u63a7\u5236',
                '\u5b9e\u65f6\u907f\u969c\u548c\u8def\u5f84\u89c4\u5212',
                '\u652f\u6301\u591a\u79cd\u8d5b\u9053\u548c\u6bd4\u8d5b\u89c4\u5219'
            ]
        },
        '\u9879\u76ee\u7ba1\u7406\u7cfb\u7edf': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u57fa\u4e8eWeb\u7684\u9879\u76ee\u7ba1\u7406\u7cfb\u7edf\u5f00\u53d1\uff0c\u5b9e\u73b0\u4e86\u9879\u76ee\u8ba1\u5212\u3001\u4efb\u52a1\u5206\u914d\u3001\u8fdb\u5ea6\u8ddf\u8e2a\u3001\u6587\u6863\u7ba1\u7406\u7b49\u529f\u80fd\uff0c\u9002\u7528\u4e8e\u8f6f\u4ef6\u5f00\u53d1\u3001\u5de5\u7a0b\u5efa\u8bbe\u3001\u79d1\u7814\u9879\u76ee\u7b49\u9886\u57df\u3002\u7cfb\u7edf\u91c7\u7528\u524d\u540e\u7aef\u5206\u79bb\u67b6\u6784\uff0c\u5177\u6709\u826f\u597d\u7684\u7528\u6237\u4f53\u9a8c\u548c\u53ef\u6269\u5c55\u6027\uff0c\u652f\u6301\u591a\u79cd\u6743\u9650\u7ba1\u7406\u548c\u6570\u636e\u53ef\u89c6\u5316\u529f\u80fd\u3002',
            tech: ['React', 'Node.js', 'MongoDB', 'RESTful API', 'Redux'],
            highlights: [
                '\u5b8c\u6574\u7684\u9879\u76ee\u7ba1\u7406\u529f\u80fd',
                '\u524d\u540e\u7aef\u5206\u79bb\u67b6\u6784',
                '\u826f\u597d\u7684\u7528\u6237\u4f53\u9a8c\u548c\u53ef\u6269\u5c55\u6027',
                '\u652f\u6301\u591a\u79cd\u6743\u9650\u7ba1\u7406\u548c\u6570\u636e\u53ef\u89c6\u5316'
            ]
        },
        '\u6570\u636e\u53ef\u89c6\u5316\u5e73\u53f0': {
            image: 'https://via.placeholder.com/800x500',
            description: '\u57fa\u4e8eD3.js\u7684\u6570\u636e\u53ef\u89c6\u5316\u5e73\u53f0\u5f00\u53d1\uff0c\u5b9e\u73b0\u4e86\u6570\u636e\u91c7\u96c6\u3001\u5904\u7406\u3001\u5206\u6790\u3001\u53ef\u89c6\u5316\u7b49\u529f\u80fd\uff0c\u9002\u7528\u4e8e\u5de5\u4e1a\u76d1\u63a7\u3001\u91d1\u878d\u5206\u6790\u3001\u79d1\u5b66\u7814\u7a76\u7b49\u9886\u57df\u3002\u5e73\u53f0\u652f\u6301\u591a\u79cd\u6570\u636e\u6e90\u8f93\u5165\u548c\u6570\u636e\u683c\u5f0f\uff0c\u63d0\u4f9b\u4e30\u5bcc\u7684\u53ef\u89c6\u5316\u56fe\u8868\u548c\u4ea4\u4e92\u529f\u80fd\uff0c\u5177\u6709\u826f\u597d\u7684\u53ef\u5b9a\u5236\u6027\u548c\u6269\u5c55\u6027\u3002',
            tech: ['D3.js', 'JavaScript', 'HTML5', 'CSS3', 'RESTful API'],
            highlights: [
                '\u4e30\u5bcc\u7684\u53ef\u89c6\u5316\u56fe\u8868\u7c7b\u578b',
                '\u652f\u6301\u591a\u79cd\u6570\u636e\u6e90\u548c\u6570\u636e\u683c\u5f0f',
                '\u826f\u597d\u7684\u4ea4\u4e92\u529f\u80fd\u548c\u7528\u6237\u4f53\u9a8c',
                '\u9ad8\u5ea6\u53ef\u5b9a\u5236\u548c\u53ef\u6269\u5c55'
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

    // 鼠标跟随效果
    (function() {
        // 创建跟随元素
        const follower = document.createElement('div');
        follower.className = 'mouse-follower';
        document.body.appendChild(follower);
        
        // 可点击元素选择器
        const clickableElements = 'a, button, .column-card, .project-card, .view-btn, .submit-btn, .contact-btn, .theme-toggle, .back-to-top';
        
        // 鼠标移动事件
        document.addEventListener('mousemove', function(e) {
            // 更新跟随元素位置
            follower.style.left = e.clientX + 'px';
            follower.style.top = e.clientY + 'px';
            
            // 显示跟随元素
            follower.classList.add('visible');
            
            // 检查是否在可点击元素上
            const target = e.target;
            if (target.closest(clickableElements)) {
                follower.classList.add('hover');
            } else {
                follower.classList.remove('hover');
            }
        });
        
        // 鼠标点击事件
        document.addEventListener('mousedown', function() {
            follower.classList.add('click');
        });
        
        document.addEventListener('mouseup', function() {
            follower.classList.remove('click');
        });
        
        // 鼠标离开窗口事件
        document.addEventListener('mouseleave', function() {
            follower.classList.remove('visible');
        });
        
        // 鼠标进入窗口事件
        document.addEventListener('mouseenter', function(e) {
            if (e.clientX > 0 && e.clientX < window.innerWidth && e.clientY > 0 && e.clientY < window.innerHeight) {
                follower.classList.add('visible');
            }
        });
    })();

    // 技能标签鼠标悬停效果（使用已声明的skillTags变量）
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
