gsap.registerPlugin(ScrollTrigger);

// Hero Section Animations
gsap.from(".hero-text h1", {
  duration: 1.5,
  y: -50,
  opacity: 0,
  ease: "power2.out",
});

gsap.from(".hero-text p", {
  duration: 1,
  y: 30,
  opacity: 0,
  ease: "power2.out",
  stagger: 0.3,
});

gsap.from(".hero-feature", {
  duration: 1,
  y: 30,
  opacity: 0,
  ease: "power2.out",
  stagger: 0.2,
  scrollTrigger: {
    trigger: ".hero-features",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

// Hero Image Slide-in and Continuous Floating Effect
gsap.from(".animated-image", {
  duration: 1.5,
  x: 100,
  opacity: 0,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".hero-animation",
    start: "top 80%",
    toggleActions: "play none none reverse",
    onComplete: floatAnimation, // Call the float animation function when slide-in completes
  },
});

// Function for Continuous Floating Animation
function floatAnimation() {
  gsap.to(".animated-image", {
    y: -10,
    duration: 2,
    repeat: -1, // Infinite loop
    yoyo: true, // Reverses direction on each cycle
    ease: "power1.inOut",
  });
}

// Parallax Effect for Background Images
document.querySelectorAll(".parallax-section").forEach((section) => {
  gsap.to(section, {
    backgroundPositionY: "50%",
    ease: "none",
    scrollTrigger: {
      trigger: section,
      scrub: 1, // Allows smooth transition
    },
  });
});

// Categories Section Animation
gsap.from(".category-item", {
  duration: 1,
  opacity: 0,
  y: 20,
  ease: "power2.out",
  stagger: 0.2,
  scrollTrigger: {
    trigger: ".categories-section",
    start: "top 85%",
    toggleActions: "play none none reverse",
  },
});

// Products Section Animation (fade-in with stagger for each product)
gsap.from(".product-container", {
  duration: 1,
  opacity: 0,
  y: 20,
  ease: "power2.out",
  stagger: 0.1, // Slight stagger for each product
  scrollTrigger: {
    trigger: ".products-grid",
    start: "top 85%",
    toggleActions: "play none none reverse",
  },
});

// Special Offers Section Animation with Parallax
gsap.from(".offer-item", {
  duration: 1,
  opacity: 0,
  y: 20,
  ease: "power2.out",
  stagger: 0.2,
  scrollTrigger: {
    trigger: ".special-offers-section",
    start: "top 85%",
    toggleActions: "play none none reverse",
  },
});

// Testimonials Section (fade-in with slight scale effect)
gsap.from(".testimonial-item", {
  duration: 1.2,
  opacity: 0,
  y: 20,
  scale: 0.95, // Adds a pop-in effect
  ease: "power2.out",
  stagger: 0.2,
  scrollTrigger: {
    trigger: ".testimonials-section",
    start: "top 85%",
    toggleActions: "play none none reverse",
  },
});

// Newsletter Section (fade-in with slight delay for form elements)
gsap.from(".newsletter-section h2, .newsletter-section p, .newsletter-form", {
  duration: 1,
  opacity: 0,
  y: 30,
  ease: "power2.out",
  stagger: 0.2,
  scrollTrigger: {
    trigger: ".newsletter-section",
    start: "top 85%",
    toggleActions: "play none none reverse",
  },
});

// Footer Animation
gsap.from(".footer-content", {
  duration: 1,
  opacity: 0,
  y: 30,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".footer",
    start: "top 90%",
    toggleActions: "play none none reverse",
  },
});
