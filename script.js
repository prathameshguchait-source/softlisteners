     // softlisteners — site + booking wizard behaviour
// Pure vanilla JS, no build step, no external state beyond the current page load.

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setCopyYear();
    hideLoaderOnReady();
    setupHeaderScrollShadow();
    setupMobileMenu();
    setupRevealOnScroll();
    setupFaqAccordion();
    setupBookingWizard(); // no-ops safely if booking markup isn't on this page
  }

  /* ---------------- misc ---------------- */

  function setCopyYear() {
    var el = document.getElementById('copyYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  function hideLoaderOnReady() {
    var loader = document.getElementById('site-loader');
    if (!loader) return;
    window.addEventListener('load', function () {
      loader.classList.add('hidden');
    });
    // fallback in case 'load' already fired
    setTimeout(function () { loader.classList.add('hidden'); }, 1200);
  }

  function setupHeaderScrollShadow() {
    var header = document.querySelector('header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  function setupMobileMenu() {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function setupRevealOnScroll() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  }

  function setupFaqAccordion() {
    document.querySelectorAll('.faq-q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.closest('.faq-item');
        var wrap = item.querySelector('.faq-a-wrap');
        var isOpen = item.classList.contains('open');
        item.classList.toggle('open', !isOpen);
        q.setAttribute('aria-expanded', String(!isOpen));
        wrap.style.maxHeight = !isOpen ? wrap.scrollHeight + 'px' : '0px';
      });
    });
  }

  /* ---------------- booking wizard ---------------- */

  var UPI_ID = '8446913797@slc';
  var UPI_PAYEE_NAME = 'softlisteners';
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mpqvanyg';
  var PRICE_MAP = { 10: 50, 20: 100, 30: 150 };
  var TIME_SLOTS = [
    { h: 9, m: 0, label: '9:00 AM' },
    { h: 10, m: 0, label: '10:00 AM' },
    { h: 11, m: 0, label: '11:00 AM' },
    { h: 12, m: 0, label: '12:00 PM' },
    { h: 13, m: 0, label: '1:00 PM' },
    { h: 14, m: 0, label: '2:00 PM' },
    { h: 15, m: 0, label: '3:00 PM' },
    { h: 16, m: 0, label: '4:00 PM' },
    { h: 17, m: 0, label: '5:00 PM' },
    { h: 18, m: 0, label: '6:00 PM' },
    { h: 19, m: 0, label: '7:00 PM' },
    { h: 20, m: 0, label: '8:00 PM' },
    { h: 21, m: 0, label: '9:00 PM' },
    { h: 22, m: 0, label: '10:00 PM' }
  ];

  function setupBookingWizard() {
    var bookingSection = document.getElementById('booking');
    if (!bookingSection) return; // this page has no booking wizard (e.g. legal pages)

    var state = { mins: null, price: null, dateObj: null, dateLabel: null, time: null };
    var reviewed = false;
    var currentStep = 1;

    var els = {
      toStep2: document.getElementById('toStep2'),
      toStep3: document.getElementById('toStep3'),
      toStep4: document.getElementById('toStep4'),
      backTo1: document.getElementById('backTo1'),
      backTo2: document.getElementById('backTo2'),
      backTo3: document.getElementById('backTo3'),
      restartBooking: document.getElementById('restartBooking'),
      dateGrid: document.getElementById('dateGrid'),
      timeGrid: document.getElementById('timeGrid'),
      form: document.getElementById('detailsForm'),
      reviewCard: document.getElementById('reviewCard'),
      editReviewBtn: document.getElementById('editReviewBtn'),
      submitBtn: document.getElementById('reviewSubmitBtn'),
      statusEl: document.getElementById('detailStatus'),
      upiQr: document.getElementById('upiQr'),
      upiPayBtn: document.getElementById('upiPayBtn'),
      upiCopyBtn: document.getElementById('upiCopyBtn'),
      progressFill: document.querySelector('.progress-fill')
    };

    /* ---- session step ---- */
    document.querySelectorAll('.pick-session').forEach(function (btn) {
      btn.addEventListener('click', function () { selectSession(btn.dataset.mins); });
    });
    document.querySelectorAll('.pick-plan').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectSession(btn.dataset.mins);
        goToStep(1);
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    function selectSession(mins) {
      state.mins = Number(mins);
      state.price = PRICE_MAP[state.mins];
      document.querySelectorAll('.pick-session').forEach(function (b) {
        b.classList.toggle('selected', Number(b.dataset.mins) === state.mins);
      });
      if (els.toStep2) els.toStep2.disabled = false;
    }

    /* ---- navigation ---- */
    if (els.toStep2) els.toStep2.addEventListener('click', function () { goToStep(2); });
    if (els.backTo1) els.backTo1.addEventListener('click', function () { goToStep(1); });
    if (els.toStep3) els.toStep3.addEventListener('click', function () { goToStep(3); });
    if (els.backTo2) els.backTo2.addEventListener('click', function () { goToStep(2); });
    if (els.toStep4) els.toStep4.addEventListener('click', function () { goToStep(4); });
    if (els.backTo3) els.backTo3.addEventListener('click', function () { goToStep(3); });
    if (els.restartBooking) els.restartBooking.addEventListener('click', resetWizard);

    function goToStep(n) {
      currentStep = n;
      document.querySelectorAll('.book-panel').forEach(function (p) {
        p.classList.toggle('active', Number(p.dataset.panel) === n);
      });
      document.querySelectorAll('.progress-step').forEach(function (p) {
        p.classList.toggle('active', Number(p.dataset.step) <= n);
      });
      if (els.progressFill) els.progressFill.style.width = ((n - 1) / 4) * 100 + '%';
      if (n === 2) renderDateGrid();
      if (n === 3) renderTimeGrid();
      if (n === 4) prepStep4();
    }

    /* ---- dynamic date generation ---- */
    function generateDates() {
      var now = new Date();
      // if it's past the last slot (10 PM), skip today entirely
      var startOffset = now.getHours() >= 22 ? 1 : 0;
      var weekdayFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
      var monthFmt = new Intl.DateTimeFormat('en-IN', { month: 'short' });
      var days = [];
      for (var i = 0; i < 7; i++) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + startOffset + i);
        days.push({
          dateObj: d,
          weekday: weekdayFmt.format(d),
          day: d.getDate(),
          month: monthFmt.format(d)
        });
      }
      return days;
    }

    function isSameDay(a, b) {
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function availableSlotsFor(dateObj) {
      var now = new Date();
      if (!isSameDay(dateObj, now)) return TIME_SLOTS.slice();
      return TIME_SLOTS.filter(function (s) {
        return s.h > now.getHours() || (s.h === now.getHours() && s.m > now.getMinutes());
      });
    }

    function renderDateGrid() {
      if (!els.dateGrid) return;
      els.dateGrid.innerHTML = '';
      var dates = generateDates();
      dates.forEach(function (d) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-card pick-date';
        btn.innerHTML = '<div class="oc-top">' + d.weekday + ' ' + d.day + '</div><div class="oc-sub">' + d.month + '</div>';
        btn.addEventListener('click', function () {
          document.querySelectorAll('.pick-date').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          state.dateObj = d.dateObj;
          state.dateLabel = d.weekday + ' ' + d.day + ' ' + d.month;
          state.time = null;
          if (els.toStep3) els.toStep3.disabled = false;
        });
        els.dateGrid.appendChild(btn);
      });
    }

    function renderTimeGrid() {
      if (!els.timeGrid || !state.dateObj) return;
      els.timeGrid.innerHTML = '';
      var slots = availableSlotsFor(state.dateObj);
      if (!slots.length) {
        els.timeGrid.innerHTML = '<p class="empty-state">No times left for this day — please go back and choose another date.</p>';
        if (els.toStep4) els.toStep4.disabled = true;
        return;
      }
      slots.forEach(function (s) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-card pick-time';
        btn.innerHTML = '<div class="oc-top">' + s.label + '</div>';
        btn.addEventListener('click', function () {
          document.querySelectorAll('.pick-time').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          state.time = s.label;
          if (els.toStep4) els.toStep4.disabled = false;
        });
        els.timeGrid.appendChild(btn);
      });
    }

    /* ---- step 4: UPI + QR ---- */
    function buildUpiUrl() {
      var params = ['pa=' + encodeURIComponent(UPI_ID), 'pn=' + encodeURIComponent(UPI_PAYEE_NAME)];
      if (state.price) params.push('am=' + encodeURIComponent(state.price), 'cu=INR');
      if (state.mins) params.push('tn=' + encodeURIComponent('softlisteners ' + state.mins + ' min session'));
      return 'upi://pay?' + params.join('&');
    }

    function prepStep4() {
      var upiUrl = buildUpiUrl();
      if (els.upiPayBtn) els.upiPayBtn.setAttribute('href', upiUrl);
      renderQr(upiUrl);
    }

    function renderQr(upiUrl) {
      var wrap = els.upiQr ? els.upiQr.parentElement : null;
      if (window.QRCode && els.upiQr) {
        window.QRCode.toCanvas(els.upiQr, upiUrl, {
          width: 176,
          margin: 1,
          color: { dark: '#362F3D', light: '#FFFFFF' }
        }, function (err) {
          if (err) {
            console.error('QR generation failed, using fallback image:', err);
            showQrFallback(upiUrl, wrap);
          }
        });
      } else {
        // library didn't load (CDN blocked, offline, etc.) — use an image-based fallback
        showQrFallback(upiUrl, wrap);
      }
    }

    function showQrFallback(upiUrl, wrap) {
      if (!wrap) return;
      var img = document.createElement('img');
      img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=' + encodeURIComponent(upiUrl);
      img.alt = 'UPI payment QR code';
      img.className = 'upi-qr';
      img.width = 176;
      img.height = 176;
      wrap.innerHTML = '';
      wrap.appendChild(img);
    }

    if (els.upiCopyBtn) {
      els.upiCopyBtn.addEventListener('click', function () {
        var restore = function () {
          els.upiCopyBtn.textContent = 'Copy UPI ID';
          els.upiCopyBtn.classList.remove('copied');
        };
        var markCopied = function () {
          els.upiCopyBtn.textContent = 'Copied ✓';
          els.upiCopyBtn.classList.add('copied');
          setTimeout(restore, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(UPI_ID).then(markCopied).catch(function () {
            fallbackCopy(UPI_ID);
            markCopied();
          });
        } else {
          fallbackCopy(UPI_ID);
          markCopied();
        }
      });
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* no-op */ }
      document.body.removeChild(ta);
    }

    /* ---- review + submit ---- */
    if (els.form) {
      els.form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!reviewed) {
          if (!els.form.checkValidity()) {
            els.form.reportValidity();
            return;
          }
          showReview();
          return;
        }
        submitBooking();
      });
    }

    if (els.editReviewBtn) {
      els.editReviewBtn.addEventListener('click', function () {
        reviewed = false;
        if (els.reviewCard) els.reviewCard.hidden = true;
        if (els.submitBtn) els.submitBtn.textContent = 'Review booking';
      });
    }

    function showReview() {
      setText('revName', getVal('bName'));
      setText('revDuration', state.mins ? state.mins + ' minutes' : '—');
      setText('revDate', state.dateLabel || '—');
      setText('revTime', state.time || '—');
      setText('revAmount', state.price ? '₹' + state.price : '—');
      setText('revUpi', getVal('bUpi'));
      if (els.reviewCard) {
        els.reviewCard.hidden = false;
        els.reviewCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (els.submitBtn) els.submitBtn.textContent = 'Confirm & send booking';
      reviewed = true;
    }

    function submitBooking() {
      if (els.submitBtn) { els.submitBtn.disabled = true; els.submitBtn.textContent = 'Sending…'; }
      clearStatus();

      var payload = {
        'Full Name': getVal('bName'),
        'Email': getVal('bEmail'),
        'Phone Number': getVal('bPhone'),
        'Session Duration': state.mins + ' minutes',
        'Preferred Date': state.dateLabel,
        'Preferred Time': state.time,
        'Amount Paid': '₹' + state.price,
        'UPI Transaction ID': getVal('bUpi'),
        'Notes': getVal('bNotes')
      };

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (res.ok) return true;
          return res.json().catch(function () { return {}; }).then(function (data) {
            throw new Error((data && data.error) || 'Something went wrong. Please try again.');
          });
        })
        .then(function () {
          onSubmitSuccess(payload);
        })
        .catch(function () {
          showStatus("We couldn't send your booking — please check your connection and try again.", 'err');
          if (els.submitBtn) { els.submitBtn.disabled = false; els.submitBtn.textContent = 'Confirm & send booking'; }
        });
    }

    function onSubmitSuccess(payload) {
      setText('confirmName', payload['Full Name'] || 'there');
      setText('confirmEmail', payload['Email'] || '');
      var summary = document.getElementById('finalSummary');
      if (summary) {
        summary.innerHTML =
          row('Session', payload['Session Duration']) +
          row('Date', payload['Preferred Date']) +
          row('Time', payload['Preferred Time']) +
          row('Amount paid', payload['Amount Paid']);
      }
      goToStep(5);
      resetFormOnly();
    }

    function row(label, value) {
      return '<div class="summary-row"><span>' + label + '</span><span>' + escapeHtml(String(value || '')) + '</span></div>';
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function resetFormOnly() {
      if (els.form) els.form.reset();
      if (els.reviewCard) els.reviewCard.hidden = true;
      reviewed = false;
      if (els.submitBtn) { els.submitBtn.textContent = 'Review booking'; els.submitBtn.disabled = false; }
    }

    function resetWizard() {
      state.mins = null; state.price = null; state.dateObj = null; state.dateLabel = null; state.time = null;
      resetFormOnly();
      document.querySelectorAll('.pick-session, .pick-date, .pick-time').forEach(function (b) { b.classList.remove('selected'); });
      if (els.toStep2) els.toStep2.disabled = true;
      if (els.toStep3) els.toStep3.disabled = true;
      if (els.toStep4) els.toStep4.disabled = true;
      clearStatus();
      goToStep(1);
    }

    function showStatus(msg, type) {
      if (!els.statusEl) return;
      els.statusEl.textContent = msg;
      els.statusEl.className = 'status-msg show ' + type;
    }
    function clearStatus() {
      if (!els.statusEl) return;
      els.statusEl.textContent = '';
      els.statusEl.className = 'status-msg';
    }
    function getVal(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }
    function setText(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    }
  }
})();
      
