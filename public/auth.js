/* ========================================
   DevLabs — GitHub Auth Module
   ======================================== */
(function () {
  'use strict';

  let currentUser = null;

  async function checkAuth() {
    try {
      const res = await fetch('/auth/me');
      if (res.ok) currentUser = await res.json();
    } catch {}
    renderNavAuth();
    document.dispatchEvent(new CustomEvent('auth-ready', { detail: { user: currentUser } }));
  }

  function renderNavAuth() {
    const container = document.getElementById('auth-nav');
    if (!container) return;

    if (currentUser) {
      container.innerHTML =
        '<div class="auth-user">' +
          '<a href="admin.html" class="auth-user__panel magnetic" data-strength="10" title="Panel de control">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>' +
          '</a>' +
          '<a href="javascript:void(0)" class="auth-user__avatar-link" id="auth-avatar-toggle">' +
            '<img class="auth-user__avatar" src="' + currentUser.avatar + '" alt="' + currentUser.login + '">' +
            '<span class="auth-user__role-badge">' + currentUser.role + '</span>' +
          '</a>' +
          '<div class="auth-dropdown" id="auth-dropdown">' +
            '<div class="auth-dropdown__header">' +
              '<img class="auth-dropdown__avatar" src="' + currentUser.avatar + '" alt="">' +
              '<div>' +
                '<div class="auth-dropdown__name">' + currentUser.name + '</div>' +
                '<div class="auth-dropdown__login">@' + currentUser.login + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="auth-dropdown__divider"></div>' +
            '<a href="admin.html" class="auth-dropdown__item">' +
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>' +
              'Panel de control' +
            '</a>' +
            '<a href="/auth/logout" class="auth-dropdown__item auth-dropdown__item--danger">' +
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
              'Cerrar sesi\u00f3n' +
            '</a>' +
          '</div>' +
        '</div>';

      const toggle = document.getElementById('auth-avatar-toggle');
      const dropdown = document.getElementById('auth-dropdown');
      if (toggle && dropdown) {
        toggle.addEventListener('click', function (e) {
          e.stopPropagation();
          dropdown.classList.toggle('open');
        });
        document.addEventListener('click', function () {
          dropdown.classList.remove('open');
        });
      }
    } else {
      container.innerHTML =
        '<a href="/auth/login" class="auth-login-btn magnetic" data-strength="10">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>' +
          '<span>Iniciar sesi\u00f3n</span>' +
        '</a>';
    }
  }

  window.DevLabsAuth = {
    getUser: function () { return currentUser; },
    isLoggedIn: function () { return !!currentUser; },
    isOwner: function () { return currentUser && currentUser.role === 'owner'; },
    refresh: checkAuth,
  };

  document.addEventListener('DOMContentLoaded', checkAuth);
})();
