 // Progress simulation
    let progress = 0;
    const progressText = document.querySelector('.progress-text');
    const progressInterval = setInterval(() => {
      progress += Math.random() * 10;
      progressText.textContent = `Loading Sangrow... ${Math.min(100, Math.floor(progress))}%`;
      if (progress >= 100) clearInterval(progressInterval);
    }, 200);

    // Animation and loading handlers
    const loader = document.querySelector(".loader");
    const loaderContainer = document.getElementById("loader");
    const mainContent = document.getElementById("main-content");

    // Fallback for logo if it fails to load
    const img = new Image();
    img.src = "https://www.sangrow.in/logo.svg";
    img.onerror = () => {
      loader.style.backgroundImage = "none";
      loader.innerHTML = `
        <div class="fallback-text">
          Sangrow
        </div>
      `;
      progressText.textContent = "Loading resources...";
    };

    // Track animation completion
    loader.addEventListener('animationend', () => {
      completeLoading();
    });

    // Fallback in case animation doesn't fire
    const animationTimeout = setTimeout(() => {
      completeLoading();
    }, 4500); // Slightly longer than animation duration

    function completeLoading() {
      clearTimeout(animationTimeout);
      clearInterval(progressInterval);
      progressText.textContent = "Ready!";
      
      loaderContainer.style.opacity = "0";
      loaderContainer.style.visibility = "hidden";
      setTimeout(() => {
        loaderContainer.style.display = "none";
        loaderContainer.setAttribute("aria-busy", "false");
        mainContent.classList.remove("hidden");
        mainContent.classList.add("show");
        mainContent.setAttribute("aria-hidden", "false");
      }, 600);
    }

    // Handle window load
    window.addEventListener("load", () => {
      // If everything loads quickly, ensure minimum display time
      const minDisplayTime = 2000; // 2 seconds minimum
      const loadTime = performance.now();
      
      if (loadTime < minDisplayTime) {
        setTimeout(completeLoading, minDisplayTime - loadTime);
      }
    });