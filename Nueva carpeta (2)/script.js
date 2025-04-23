console.log("DEBUG: script.js loaded"); // <-- Mensaje para verificar carga

document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded event fired"); // <-- Mensaje para verificar inicio

    const body = document.body;
    const burger = document.getElementById('burger-menu');
    const navLinks = document.getElementById('nav-links');
    const navItems = navLinks?.querySelectorAll('a');
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section[id]');
    const videoModal = document.getElementById('video-modal');
    const videoPlayerContainer = document.getElementById('video-player-container');
    const closeModalButton = document.getElementById('close-modal-button');
    const videoItems = document.querySelectorAll('.video-item');
    const currentYearSpan = document.getElementById('current-year');

    // --- Actualizar año ---
     if (currentYearSpan) {
         try { // Añadir try-catch por si acaso
            currentYearSpan.textContent = new Date().getFullYear();
         } catch (e) { console.error("Error setting year:", e); }
     }

    // --- Header Scroll Effect ---
     if (header) {
         try {
            window.addEventListener('scroll', () => {
                 header.classList.toggle('scrolled', window.scrollY > 50);
            });
         } catch (e) { console.error("Error setting scroll listener:", e); }
     }

    // --- Mobile Navigation ---
    if (burger && navLinks) {
        try {
            burger.addEventListener('click', () => {
                navLinks.classList.toggle('nav-active');
                burger.classList.toggle('toggle');
                body.style.overflow = navLinks.classList.contains('nav-active') ? 'hidden' : '';
            });
            navItems?.forEach(link => {
                link.addEventListener('click', () => {
                    if (navLinks.classList.contains('nav-active')) {
                        navLinks.classList.remove('nav-active');
                        burger.classList.remove('toggle');
                        body.style.overflow = '';
                    }
                });
            });
         } catch (e) { console.error("Error setting mobile nav listeners:", e); }
    }

    // --- Active Link Highlighting ---
     if (header && navItems && sections.length > 0) {
        try {
            const observerOptions = { root: null, rootMargin: `-${header.offsetHeight + 1}px 0px -70% 0px`, threshold: 0 };
            const sectionObserver = new IntersectionObserver((entries, observer) => {
                 entries.forEach(entry => {
                     if (entry.isIntersecting) {
                         const id = entry.target.getAttribute('id');
                         navItems.forEach(link => {
                             link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                         });
                     }
                 });
            }, observerOptions);
            sections.forEach(section => { if(section.id) { sectionObserver.observe(section); } });
         } catch (e) { console.error("Error setting intersection observer:", e); }
     }

    // --- Three.js Background ---
    let scene, camera, renderer, particleSystem;
    const heroBgContainer = document.getElementById('hero-3d-background');
    let animationFrameId;

    function initThreeJS() {
        console.log("DEBUG: Attempting initThreeJS..."); // <-- Mensaje Debug
        if (!heroBgContainer || typeof THREE === 'undefined') { // Check if THREE exists
             console.error("Three.js container or library not found/loaded.");
             if (heroBgContainer) heroBgContainer.innerHTML = '<p style="color: red; text-align: center; padding-top: 50px;">Error: Three.js no cargado.</p>';
             return;
        }
        try {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            heroBgContainer.innerHTML = ''; // Clear previous errors if any
            heroBgContainer.appendChild(renderer.domElement);

            const particleCount = window.innerWidth < 768 ? 3000 : 7000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            const primaryCssColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#00FFFF';
            const baseCyan = new THREE.Color(primaryCssColor);
            const lightCyanVariant = baseCyan.clone().lerp(new THREE.Color(0xffffff), 0.4);

            for (let i = 0; i < particleCount; i++) {
                let i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * 25;
                positions[i3 + 1] = (Math.random() - 0.5) * 25;
                positions[i3 + 2] = (Math.random() - 0.5) * 25;
                const particleColor = baseCyan.clone();
                particleColor.lerp(lightCyanVariant, Math.random() * 0.6);
                colors[i3] = particleColor.r;
                colors[i3 + 1] = particleColor.g;
                colors[i3 + 2] = particleColor.b;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({ size: 0.03, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false });

            particleSystem = new THREE.Points(geometry, material);
            scene.add(particleSystem);
            camera.position.z = 5;

            document.addEventListener('mousemove', onDocumentMouseMove, false);
            window.addEventListener('resize', onWindowResize, false); // Moved listener here
            console.log("DEBUG: Three.js initialized successfully."); // <-- Mensaje Debug
            animateThreeJS();

        } catch (e) {
            console.error("Error initializing Three.js or WebGL:", e);
            if (heroBgContainer) heroBgContainer.innerHTML = '<p style="color: red; text-align: center; padding-top: 50px;">Error al iniciar WebGL/3D.</p>';
        }
    }

    const clock = new THREE.Clock();

    function animateThreeJS() {
        if (!renderer || !scene || !camera) return;
        animationFrameId = requestAnimationFrame(animateThreeJS); // Request first
        const elapsedTime = clock.getElapsedTime();

        if (particleSystem) {
           particleSystem.rotation.y = elapsedTime * 0.05;
           particleSystem.rotation.x = elapsedTime * 0.02;
        }
         if (camera && scene) {
             camera.position.x += (mouseX / windowHalfX * 0.5 - camera.position.x) * 0.02;
             camera.position.y += (-mouseY / windowHalfY * 0.5 - camera.position.y) * 0.02;
             camera.lookAt(scene.position);
         }
        renderer.render(scene, camera);
    }

    let mouseX = 0, mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    function onDocumentMouseMove(event) { mouseX = (event.clientX - windowHalfX); mouseY = (event.clientY - windowHalfY); }
    function onWindowResize() { if (!camera || !renderer) return; camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); }
    // Removed duplicate resize listener

    // --- Video Modal Logic ---
     if (videoModal && videoPlayerContainer && closeModalButton && videoItems.length > 0) {
        console.log(`DEBUG: Found ${videoItems.length} video items. Setting up listeners...`); // <-- Mensaje Debug
        try {
            videoItems.forEach((item, index) => { // Added index for logging
                 item.addEventListener('click', () => {
                     console.log(`DEBUG: Clicked video item index ${index}`); // <-- Mensaje Debug
                     const videoId = item.getAttribute('data-video-id');
                     console.log(`DEBUG: Video ID found: "${videoId}"`); // <-- Mensaje Debug

                     const isValidId = videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
                     const isPlaceholder = videoId && (videoId.includes('VIDEO_ID') || videoId.includes('TU_VIDEO_ID'));

                     if (isValidId && !isPlaceholder) {
                         console.log("DEBUG: ID is valid and not placeholder. Creating iframe..."); // <-- Mensaje Debug
                         const iframe = document.createElement('iframe');
                         iframe.setAttribute('src', `https://www.youtube.com/embed/VIDEO_ID{videoId}?autoplay=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&color=white&origin=${window.location.origin}`);
                         iframe.setAttribute('title', 'Reproductor de video de YouTube');
                         iframe.setAttribute('frameborder', '0');
                         iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                         iframe.setAttribute('allowfullscreen', '');
                         videoPlayerContainer.innerHTML = '';
                         videoPlayerContainer.appendChild(iframe);
                         videoModal.classList.add('active');
                         body.style.overflow = 'hidden';
                         console.log("DEBUG: Modal opened with iframe."); // <-- Mensaje Debug
                     } else {
                        console.warn(`DEBUG: Video modal skipped: Invalid or placeholder video ID found ("${videoId}"). Update data-video-id in HTML.`);
                     }
                 });
             });

             const closeModal = () => {
                 console.log("DEBUG: Closing modal..."); // <-- Mensaje Debug
                 videoModal.classList.remove('active');
                 setTimeout(() => { videoPlayerContainer.innerHTML = ''; body.style.overflow = ''; }, 300);
             };

             closeModalButton.addEventListener('click', closeModal);
             videoModal.addEventListener('click', (event) => { if (event.target === videoModal) closeModal(); });
             window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && videoModal.classList.contains('active')) closeModal(); });
             console.log("DEBUG: Modal close listeners attached."); // <-- Mensaje Debug

        } catch(e) { console.error("Error setting up video modal listeners:", e); }
     } else {
         console.warn("DEBUG: Video modal elements not found or no video items present."); // <-- Mensaje Debug
     } // End Video Modal Logic

     // Initialize Three.js after DOM is ready and basic elements are found
     try {
        initThreeJS();
     } catch(e) { console.error("Error calling initThreeJS:", e); }


}); // Fin DOMContentLoaded