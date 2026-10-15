document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const header = document.getElementById('mainHeader');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const siteNav = document.getElementById('siteNav');
  const homepageView = document.getElementById('homepageView');
  const custom404View = document.getElementById('custom404View');
  const errorTargetName = document.getElementById('errorTargetName');
  const errorGoBackBtn = document.getElementById('errorGoBackBtn');
  const errorBackToHomeBtn = document.getElementById('errorBackToHomeBtn');
  const newsletterForm = document.getElementById('newsletterForm');

  let previousScrollPosition = 0;
  let isViewing404 = false;

  const handleHeaderScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); 

  const toggleMobileMenu = (forceClose = false) => {
    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    const shouldOpen = forceClose ? false : !isExpanded;

    mobileMenuToggle.setAttribute('aria-expanded', String(shouldOpen));
    mobileMenuToggle.classList.toggle('active', shouldOpen);
    siteNav.classList.toggle('open', shouldOpen);

    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  };

  if (mobileMenuToggle && siteNav) {
    mobileMenuToggle.addEventListener('click', () => toggleMobileMenu());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteNav.classList.contains('open')) {
        toggleMobileMenu(true);
      }
    });

    siteNav.querySelectorAll('a, button').forEach((elem) => {
      elem.addEventListener('click', () => {
        if (siteNav.classList.contains('open')) {
          toggleMobileMenu(true);
        }
      });
    });
  }

  const show404Screen = (targetName = 'Requested Page', pushState = true) => {

    if (!isViewing404) {
      previousScrollPosition = window.scrollY;
    }

    isViewing404 = true;

    if (errorTargetName) {
      errorTargetName.textContent = targetName;
    }

    homepageView.hidden = true;
    homepageView.classList.remove('active-view');

    custom404View.hidden = false;
    custom404View.classList.add('active-view');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    toggleMobileMenu(true);

    if (pushState && window.history && window.history.pushState) {
      const slug = encodeURIComponent(targetName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      window.history.pushState({ view: '404', target: targetName }, '', `#404-${slug}`);
    }
  };

  const restoreHomepage = (restoreScroll = false, pushState = true) => {
    isViewing404 = false;

    custom404View.hidden = true;
    custom404View.classList.remove('active-view');

    homepageView.hidden = false;
    homepageView.classList.add('active-view');

    if (restoreScroll && previousScrollPosition > 0) {
      window.scrollTo({ top: previousScrollPosition, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (pushState && window.history && window.history.pushState) {
      window.history.pushState({ view: 'home' }, '', window.location.pathname);
    }
  };

  if (errorGoBackBtn) {
    errorGoBackBtn.addEventListener('click', () => {

      if (window.history.length > 1) {
        window.history.back();
      } else {
        restoreHomepage(true, true);
      }
    });
  }

  if (errorBackToHomeBtn) {
    errorBackToHomeBtn.addEventListener('click', () => {
      restoreHomepage(false, true);
    });
  }

  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.view === '404') {
      show404Screen(e.state.target || 'Requested Page', false);
    } else {
      restoreHomepage(true, false);
    }
  });

  document.addEventListener('click', (e) => {

    const triggerElem = e.target.closest('[data-action="404"]');
    if (triggerElem) {
      e.preventDefault();
      const targetLabel = triggerElem.getAttribute('data-target-name') ||
                          triggerElem.innerText.trim() ||
                          'Interactive Feature';
      show404Screen(targetLabel, true);
      return;
    }

    const homeNavElem = e.target.closest('[data-action="home-nav"], a[href="#home"], .brand-logo');
    if (homeNavElem) {
      e.preventDefault();
      if (isViewing404) {
        restoreHomepage(false, true);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const emailVal = emailInput ? emailInput.value.trim() : '';

      const targetLabel = emailVal
        ? `Newsletter Subscription (${emailVal})`
        : 'Newsletter Subscription';

      if (emailInput) {
        emailInput.value = ''; 
      }

      show404Screen(targetLabel, true);
    });
  }

  const statNumbers = document.querySelectorAll('.stat-number');
  let hasAnimatedStats = false;

  const animateCounters = () => {
    const duration = 2000; 
    const startTime = performance.now();

    const targets = Array.from(statNumbers).map((el) => ({
      element: el,
      target: parseInt(el.getAttribute('data-target'), 10) || 0
    }));

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      targets.forEach(({ element, target }) => {
        const currentCount = Math.floor(easeOut * target);

        element.textContent = currentCount.toLocaleString();
      });

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        targets.forEach(({ element, target }) => {
          element.textContent = target.toLocaleString();
        });
      }
    };

    requestAnimationFrame(updateCounter);
  };

  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    const statsSection = document.getElementById('impact');
    if (statsSection) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedStats) {
            hasAnimatedStats = true;
            animateCounters();
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.25
      });

      observer.observe(statsSection);
    }
  } else {

    statNumbers.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      el.textContent = target.toLocaleString();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (isViewing404 && e.key === 'Backspace' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      restoreHomepage(true, true);
    }
  });

  console.log('Stackly Charity website initialized successfully.');
});
