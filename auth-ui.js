/* =========================================================
   STUDYFLOW AI - auth-ui.js

   Makes the Log In / Sign Up menus (popups) open and close,
   the profile dropdown work, and the mobile menu work.

   It only SHOWS and HIDES the popups. The real login and
   sign-up (Supabase) still runs from index.js.

   Safe to use together with index.js: it only ever sets a
   popup to "open" or "closed", it never flips it, so nothing
   happens twice.
========================================================= */

(function () {
    'use strict';

    var MODALS = ['loginModal', 'signupModal', 'contactModal'];

    function byId(id) {
        return document.getElementById(id);
    }

    /* ---------- close the profile dropdown + mobile menu ---------- */

    function closeMenus() {
        var dropdown = byId('profileDropdown');
        var nav = byId('mainNav');
        var menuBtn = byId('mobileMenuBtn');

        if (dropdown) dropdown.classList.remove('show');
        if (nav) nav.classList.remove('mobile-open');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }

    /* ---------- open / close a popup ---------- */

    function openModal(id) {
        var modal = byId(id);
        if (!modal) return;

        // only one popup at a time
        MODALS.forEach(function (other) {
            var el = byId(other);
            if (el && other !== id) el.classList.add('hidden');
        });

        modal.classList.remove('hidden');
        closeMenus();

        var firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(function () {
                firstInput.focus();
            }, 60);
        }
    }

    function closeModal(id) {
        var modal = byId(id);
        if (modal) modal.classList.add('hidden');
    }

    /* ---------- which button opens what ---------- */

    var OPEN_LOGIN = ['welcomeLoginBtn', 'loginBtn', 'socialLoginBtn', 'switchToLogin'];
    var OPEN_SIGNUP = ['welcomeSignupBtn', 'signupBtn', 'switchToSignup'];
    var OPEN_CONTACT = ['contactBtn'];

    /* ---------- profile dropdown + hamburger menu ----------
       We read the state BEFORE the click is handled and set the
       final state afterwards, so the menu opens/closes correctly
       even if index.js also toggles it. */

    document.addEventListener(
        'click',
        function (event) {
            var profileBtn = event.target.closest('#profileBtn');
            var menuBtn = event.target.closest('#mobileMenuBtn');

            if (profileBtn) {
                var dropdown = byId('profileDropdown');
                if (dropdown) {
                    var openDropdown = !dropdown.classList.contains('show');
                    setTimeout(function () {
                        dropdown.classList.toggle('show', openDropdown);
                    }, 0);
                }
            }

            if (menuBtn) {
                var nav = byId('mainNav');
                if (nav) {
                    var openNav = !nav.classList.contains('mobile-open');
                    setTimeout(function () {
                        nav.classList.toggle('mobile-open', openNav);
                        menuBtn.setAttribute('aria-expanded', String(openNav));
                    }, 0);
                }
            }
        },
        true
    );

    /* ---------- all other clicks ---------- */

    document.addEventListener('click', function (event) {
        var target = event.target;

        // click on the dark background behind a popup closes it
        if (target.classList && target.classList.contains('modal')) {
            target.classList.add('hidden');
            return;
        }

        // click anywhere outside the profile menu closes the dropdown
        if (!target.closest('.profile-menu')) {
            var dropdown = byId('profileDropdown');
            if (dropdown) dropdown.classList.remove('show');
        }

        // the X button on a popup
        var closeBtn = target.closest('[data-close]');
        if (closeBtn) {
            closeModal(closeBtn.getAttribute('data-close'));
            return;
        }

        var button = target.closest('button');
        if (!button || !button.id) return;

        if (OPEN_LOGIN.indexOf(button.id) !== -1) {
            openModal('loginModal');
        } else if (OPEN_SIGNUP.indexOf(button.id) !== -1) {
            openModal('signupModal');
        } else if (OPEN_CONTACT.indexOf(button.id) !== -1) {
            // only if a contact popup exists in the page
            if (byId('contactModal')) openModal('contactModal');
        }
    });

    /* ---------- Escape closes popups ---------- */

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;

        MODALS.forEach(closeModal);
        closeMenus();
    });
})();