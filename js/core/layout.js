export function initResponsive() {
  // 1. Mobile Menu Toggle
  const header = document.querySelector('.main-header') || document.querySelector('.topbar');
  const navLinks = document.querySelector('.nav-links') || document.querySelector('.nav-links--center');
  
  if (header && navLinks) {
    let btn = document.querySelector('.mobile-menu-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'mobile-menu-btn';
      btn.innerHTML = '&#9776;'; // Hamburger icon
      btn.setAttribute('aria-label', 'Toggle Navigation');
      
      const accountMenu = header.querySelector('.account-menu') || header.querySelector('#accountMenuWrap');
      if (accountMenu) {
          header.insertBefore(btn, accountMenu);
      } else {
          header.appendChild(btn);
      }
    }
    
    btn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // 2. Master-Detail Back Button
  const listPanel = document.querySelector('.list-panel');
  const detailPanel = document.querySelector('.detail-panel');
  const layout = document.querySelector('.list-detail-layout');
  
  if (listPanel && detailPanel && layout) {
    let backBtn = document.querySelector('.mobile-back-btn');
    if (!backBtn) {
      backBtn = document.createElement('button');
      backBtn.className = 'mobile-back-btn';
      backBtn.innerHTML = '&#8592; Volver a la lista';
      detailPanel.prepend(backBtn);
    }
    
    backBtn.addEventListener('click', () => {
      layout.classList.remove('show-detail');
    });
  }
}

function inyectarFavicon() {
    const base = document.location.pathname.includes('/pages/') ? '../' : './';
    const iconsPath = `${base}assets/icons/`;

    const favicons = [
        { rel: 'icon', type: 'image/x-icon', href: `${iconsPath}favicon.ico` },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${iconsPath}favicon-32x32.png` },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${iconsPath}favicon-16x16.png` },
        { rel: 'apple-touch-icon', sizes: '180x180', href: `${iconsPath}apple-touch-icon.png` },
    ];

    favicons.forEach(({ rel, type, sizes, href }) => {
        const link = document.createElement('link');
        link.rel = rel;
        if (type) link.type = type;
        if (sizes) link.sizes = sizes;
        link.href = href;
        document.head.appendChild(link);
    });

    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = `${iconsPath}site.webmanifest`;
    document.head.appendChild(manifest);
}

document.addEventListener('DOMContentLoaded', () => {
    initResponsive();
    inyectarFavicon();
});