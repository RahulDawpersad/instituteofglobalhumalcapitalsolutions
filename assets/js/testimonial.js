// let currentTestimonialIndex = 0;
// const testimonials = document.querySelectorAll('.responsive-quote');
// const prevBtn = document.getElementById('prevBtn');
// const nextBtn = document.getElementById('nextBtn');

// function updateTestimonialDisplay() {
//   testimonials.forEach((testimonial, index) => {
//     testimonial.classList.remove('active');
//     if (index === currentTestimonialIndex) {
//       testimonial.classList.add('active');
//     }
//   });
// }

// prevBtn.addEventListener('click', () => {
//   currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
//   updateTestimonialDisplay();
// });

// nextBtn.addEventListener('click', () => {
//   currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
//   updateTestimonialDisplay();
// });

// // Initial setup
// updateTestimonialDisplay();
document.addEventListener("DOMContentLoaded", function () {
  const testimonials = document.querySelectorAll(".responsive-quote");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  let currentIndex = 0;

  function showTestimonial(index) {
      testimonials.forEach((testimonial, i) => {
          testimonial.style.opacity = "0";
          testimonial.style.transition = "opacity 0.5s ease-in-out";
          setTimeout(() => {
              testimonial.style.display = i === index ? "block" : "none";
              if (i === index) {
                  setTimeout(() => {
                      testimonial.style.opacity = "1";
                  }, 10);
              }
          }, 500);
      });
  }

  function nextTestimonial() {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
  }

  function prevTestimonial() {
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      showTestimonial(currentIndex);
  }

  prevBtn.addEventListener("click", prevTestimonial);
  nextBtn.addEventListener("click", nextTestimonial);

  showTestimonial(currentIndex);
});
