// CRED Prototype — App Logic

// ---- Helpers ----
function orgAvatar(deal, size) {
  const s = size || 32;
  if (deal.logo) {
    return `<div class="org-avatar" style="background:${deal.color};width:${s}px;height:${s}px">
      <img src="${deal.logo}" alt="${deal.org}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        style="width:${s}px;height:${s}px;border-radius:6px;object-fit:contain;background:#fff;padding:2px">
      <span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:${Math.round(s * 0.34)}px">${deal.initials}</span>
    </div>`;
  }
  return `<div class="org-avatar" style="background:${deal.color};width:${s}px;height:${s}px;font-size:${Math.round(s * 0.34)}px">${deal.initials}</div>`;
}

// ---- Router ----
function navigate(hash) {
  window.location.hash = hash;
}

function handleRoute() {
  const hash = window.location.hash || '#login';
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.classList.remove('active'));

  const target = document.querySelector(hash);
  if (target) target.classList.add('active');
  else document.querySelector('#login').classList.add('active');
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
  handleRoute();
  initLogin();
  initTutorial();
  initDashboard();
  initWizard();
  initNotifications();
  initWidgetLibrary();
});

// ---- Login ----
function initLogin() {
  document.getElementById('loginBtn').addEventListener('click', (e) => {
    e.preventDefault();
    navigate('#tutorial');
  });
}

// ---- Tutorial ----
let tutorialStep = 0;

function initTutorial() {
  updateTutorial();
  document.getElementById('tutorialNext').addEventListener('click', () => {
    if (tutorialStep < 2) {
      tutorialStep++;
      updateTutorial();
    } else {
      navigate('#dashboard');
    }
  });
  document.getElementById('tutorialSkip').addEventListener('click', () => {
    navigate('#dashboard');
  });
}

function updateTutorial() {
  const slides = document.querySelectorAll('.tutorial-slide');
  const dots = document.querySelectorAll('.tutorial-dots .dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === tutorialStep));
  dots.forEach((d, i) => d.classList.toggle('active', i === tutorialStep));

  const nextBtn = document.getElementById('tutorialNext');
  nextBtn.textContent = tutorialStep === 2 ? 'Get Started' : 'Next';
}

// ---- Dashboard ----
function initDashboard() {
  renderDealPipeline();
  renderLatestDeals();

  document.getElementById('createBtn').addEventListener('click', () => {
    resetWizard();
    navigate('#wizard');
  });
}

function parseDealSize(str) {
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (str.includes('M')) return num * 1000000;
  if (str.includes('K')) return num * 1000;
  return num || 0;
}

function renderDealPipeline() {
  const heatOrder = { hot: 0, medium: 1, cold: 2 };
  const sorted = [...dealPipeline].sort((a, b) => {
    const heatDiff = heatOrder[a.heat] - heatOrder[b.heat];
    if (heatDiff !== 0) return heatDiff;
    return parseDealSize(b.dealSize) - parseDealSize(a.dealSize);
  });

  const container = document.getElementById('pipelineBody');
  container.innerHTML = sorted.map(deal => `
    <div class="deal-row" data-id="${deal.id}">
      ${orgAvatar(deal)}
      <span class="org-name">${deal.org}</span>
      <span class="deal-contact">${deal.contact}</span>
      <span class="deal-size">${deal.dealSize}</span>
      <span class="deal-stage">${deal.stage}</span>
      <span class="heat-dot ${deal.heat}" title="${deal.heat}"></span>
    </div>
  `).join('');

  container.querySelectorAll('.deal-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = parseInt(row.dataset.id);
      showDetail(dealPipeline.find(d => d.id === id));
    });
  });
}

function renderLatestDeals() {
  const container = document.getElementById('latestBody');
  container.innerHTML = latestDeals.map(deal => `
    <div class="latest-row">
      ${orgAvatar(deal)}
      <span class="org-name">${deal.org}</span>
      <span class="deal-date">${deal.date}</span>
      <span class="deal-seller">${deal.seller}</span>
      <span class="deal-type">${deal.type}</span>
    </div>
  `).join('');
}

// ---- Detail View ----
function showDetail(record) {
  if (!record) return;

  // Basic info — avatar with logo
  const avatarEl = document.getElementById('detailAvatar');
  avatarEl.style.background = record.color;
  if (record.logo) {
    avatarEl.innerHTML = `<img src="${record.logo}" alt="${record.org}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
      style="width:56px;height:56px;border-radius:12px;object-fit:contain;background:#fff;padding:4px">
      <span style="display:none;width:100%;height:100%;align-items:center;justify-content:center">${record.initials}</span>`;
  } else {
    avatarEl.textContent = record.initials;
  }
  document.getElementById('detailOrg').textContent = record.org;
  document.getElementById('detailStage').textContent = record.stage;
  document.getElementById('detailDealSize2').textContent = record.dealSize;
  document.getElementById('detailType2').textContent = record.type;
  document.getElementById('detailStageFull2').textContent = record.stage;
  document.getElementById('detailProbability2').textContent = record.probability || '50%';
  document.getElementById('detailHeat2').textContent = record.heat.charAt(0).toUpperCase() + record.heat.slice(1);
  document.getElementById('detailAssignee2').textContent = record.assignee || 'Eszter Vass';
  document.getElementById('detailNotes2').textContent = record.notes;

  // Widget 1: Importance chart
  renderImportanceChart(record);

  // Widget 2: Deal type distribution
  renderDealTypeChart(record);

  // Widget 3: Activity timeline
  renderActivityTimeline(record);

  // Widget 4: Company news
  renderCompanyNews(record);

  // Widget 5: Contact profile
  renderContactProfile(record);

  // Widget 6: Documents
  renderDocumentsWidget(record);

  // Action buttons
  initDetailActions(record);

  navigate('#detail');
}

let currentDetailRecord = null;

function initDetailActions(record) {
  currentDetailRecord = record;

  // Upload button
  const btnUpload = document.getElementById('btnUpload');
  const fileInput = document.getElementById('detailFileUpload');
  // Remove old listeners by cloning
  const newBtn = btnUpload.cloneNode(true);
  btnUpload.parentNode.replaceChild(newBtn, btnUpload);
  const newInput = fileInput.cloneNode(true);
  fileInput.parentNode.replaceChild(newInput, fileInput);

  newBtn.addEventListener('click', () => newInput.click());
  newInput.addEventListener('change', () => {
    if (!newInput.files.length) return;
    if (!dealDocuments[record.id]) dealDocuments[record.id] = [];
    for (const file of newInput.files) {
      dealDocuments[record.id].push({
        name: file.name,
        size: formatFileSize(file.size),
        type: guessDocType(file.name),
        date: 'Just now'
      });
    }
    renderDocumentsWidget(record);
    // Add activity entry
    if (!activityLog[record.id]) activityLog[record.id] = [];
    activityLog[record.id].unshift({
      type: "upload", text: "File uploaded: " + newInput.files[0].name, time: "Just now", icon: "file"
    });
    renderActivityTimeline(record);
    newInput.value = '';
  });

  // Send Message button (non-functional, just visual feedback)
  const btnMsg = document.getElementById('btnSendMsg');
  const newMsgBtn = btnMsg.cloneNode(true);
  btnMsg.parentNode.replaceChild(newMsgBtn, btnMsg);

  // Edit button (non-functional, visual feedback)
  const btnEdit = document.getElementById('btnEditOpp');
  const newEditBtn = btnEdit.cloneNode(true);
  btnEdit.parentNode.replaceChild(newEditBtn, btnEdit);

  // Set Reminder button (non-functional, visual feedback)
  const btnReminder = document.getElementById('btnReminder');
  const newReminderBtn = btnReminder.cloneNode(true);
  btnReminder.parentNode.replaceChild(newReminderBtn, btnReminder);

  // Widget: Upload Document button — triggers the same file picker
  const btnWidgetUpload = document.getElementById('btnWidgetUpload');
  const newWidgetUploadBtn = btnWidgetUpload.cloneNode(true);
  btnWidgetUpload.parentNode.replaceChild(newWidgetUploadBtn, btnWidgetUpload);
  newWidgetUploadBtn.addEventListener('click', () => {
    document.getElementById('detailFileUpload').click();
  });

  // Widget: Send Message button (non-functional)
  const btnWidgetMsg = document.getElementById('btnWidgetSendMsg');
  const newWidgetMsgBtn = btnWidgetMsg.cloneNode(true);
  btnWidgetMsg.parentNode.replaceChild(newWidgetMsgBtn, btnWidgetMsg);

  // Widget: Add Contact button (non-functional)
  const btnAddContact = document.getElementById('btnAddContact');
  const newAddContactBtn = btnAddContact.cloneNode(true);
  btnAddContact.parentNode.replaceChild(newAddContactBtn, btnAddContact);
}

function renderDocumentsWidget(record) {
  const container = document.getElementById('documentsWidget');
  const docs = dealDocuments[record.id] || [];

  if (docs.length === 0) {
    container.innerHTML = `
      <div class="empty-widget-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="empty-text">No documents yet</div>
        <div class="empty-subtext">Upload prospect sheets, offers, or contracts</div>
      </div>
    `;
    return;
  }

  const typeIcons = {
    'PDF': '#EF4444',
    'Document': '#2563EB',
    'Spreadsheet': '#059669',
    'Presentation': '#F59E0B',
    'Image': '#8B5CF6',
    'File': '#6B7280'
  };

  container.innerHTML = docs.map(d => `
    <div class="doc-item">
      <div class="doc-icon" style="background:${typeIcons[d.type] || '#6B7280'}">${d.type.substring(0, 3).toUpperCase()}</div>
      <div class="doc-info">
        <div class="doc-name">${d.name}</div>
        <div class="doc-meta">${d.type} &middot; ${d.size} &middot; ${d.date}</div>
      </div>
    </div>
  `).join('');
}

// ---- Detail Widgets ----

function calculateImportance(deal) {
  const prob = parseInt(deal.probability) || 50;
  const size = parseDealSize(deal.dealSize);
  const maxSize = 5000000; // normalize against $5M
  const stageW = stageWeights[deal.stage] || 0.3;

  // Weighted composite: 35% probability, 30% deal size, 35% stage
  return (prob / 100) * 0.35 + Math.min(size / maxSize, 1) * 0.30 + stageW * 0.35;
}

function renderImportanceChart(currentRecord) {
  const container = document.getElementById('importanceChart');
  const allDeals = dealPipeline.map(d => ({
    ...d,
    score: calculateImportance(d)
  })).sort((a, b) => b.score - a.score);

  const maxScore = Math.max(...allDeals.map(d => d.score));

  container.innerHTML = allDeals.map(d => {
    const pct = Math.round((d.score / maxScore) * 100);
    const isCurrent = d.id === currentRecord.id;
    return `
      <div class="imp-row ${isCurrent ? 'imp-current' : ''}">
        <div class="imp-label">
          ${orgAvatar(d, 24)}
          <span>${d.org}</span>
        </div>
        <div class="imp-bar-track">
          <div class="imp-bar-fill ${isCurrent ? 'imp-fill-current' : ''}" style="width:${pct}%"></div>
        </div>
        <span class="imp-score">${Math.round(d.score * 100)}</span>
      </div>
    `;
  }).join('');
}

function renderDealTypeChart(currentRecord) {
  const container = document.getElementById('dealTypeChart');
  const typeCounts = {};
  dealPipeline.forEach(d => {
    typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
  });

  const total = dealPipeline.length;
  const typeColors = {
    "Title Sponsorship": "#3ECF8E",
    "Kit Sponsorship": "#6366F1",
    "Apparel Partnership": "#111111",
    "Stadium Naming": "#E61A27",
    "Event Sponsorship": "#F59E0B",
    "Technology Partnership": "#FF9900",
    "Hospitality Sponsorship": "#00A650"
  };

  const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  container.innerHTML = `
    <div class="dtype-bars">
      ${sorted.map(([type, count]) => {
        const pct = Math.round((count / total) * 100);
        const color = typeColors[type] || '#9CA3AF';
        const isCurrent = type === currentRecord.type;
        return `
          <div class="dtype-row ${isCurrent ? 'dtype-current' : ''}">
            <div class="dtype-label">${type}</div>
            <div class="dtype-bar-track">
              <div class="dtype-bar-fill" style="width:${pct}%;background:${color}"></div>
            </div>
            <span class="dtype-count">${count} deal${count > 1 ? 's' : ''} (${pct}%)</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderActivityTimeline(record) {
  const container = document.getElementById('activityTimeline');
  const badge = document.getElementById('activityBadge');
  const activities = activityLog[record.id] || [];

  // Set badge
  const heatLabels = { hot: 'Hot', medium: 'Warm', cold: 'Cold' };
  const heatClasses = { hot: 'badge-hot', medium: 'badge-medium', cold: 'badge-cold' };
  badge.textContent = heatLabels[record.heat] || 'Unknown';
  badge.className = 'activity-heat-badge ' + (heatClasses[record.heat] || '');

  if (activities.length === 0) {
    container.innerHTML = '<div class="timeline-empty">No recent activity recorded</div>';
    return;
  }

  const iconSvgs = {
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
  };

  container.innerHTML = activities.map((a, i) => `
    <div class="timeline-item">
      <div class="timeline-icon">${iconSvgs[a.icon] || iconSvgs.file}</div>
      <div class="timeline-content">
        <div class="timeline-text">${a.text}</div>
        <div class="timeline-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

function renderCompanyNews(record) {
  const container = document.getElementById('companyNewsWidget');
  const news = companyNews[record.org] || [];

  if (news.length === 0) {
    container.innerHTML = '<div class="timeline-empty">No recent news found for ' + record.org + '</div>';
    return;
  }

  container.innerHTML = news.map(n => `
    <a class="news-item" href="${n.url || '#'}" target="_blank" rel="noopener">
      <div class="news-title">${n.title}</div>
      <div class="news-meta">
        <span class="news-source">${n.source}</span>
        <span class="news-date">${n.date}</span>
      </div>
    </a>
  `).join('');
}

function renderContactProfile(record) {
  const container = document.getElementById('contactProfileWidget');
  const profile = contactProfiles[record.contact];

  if (!profile) {
    container.innerHTML = '<div class="timeline-empty">No profile data available for ' + record.contact + '</div>';
    return;
  }

  container.innerHTML = `
    <div class="cp-layout">
      <div class="cp-main">
        <div class="cp-header">
          <div class="cp-avatar" style="background:${record.color}">${record.contact.split(' ').map(w=>w[0]).join('')}</div>
          <div class="cp-info">
            <div class="cp-name">${record.contact}</div>
            <div class="cp-title">${profile.title}</div>
            <div class="cp-company">${profile.company}</div>
          </div>
        </div>
        <div class="cp-details">
          <div class="cp-detail-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${profile.location}</span>
          </div>
          <div class="cp-detail-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span>${profile.experience}</span>
          </div>
        </div>
      </div>
      <div class="cp-side">
        <div class="cp-stat">
          <div class="cp-stat-num">${profile.connections.toLocaleString()}</div>
          <div class="cp-stat-label">Connections</div>
        </div>
        <div class="cp-stat">
          <div class="cp-stat-num">${profile.mutual}</div>
          <div class="cp-stat-label">Mutual</div>
        </div>
        <a class="cp-linkedin" href="${profile.linkedin}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          View LinkedIn Profile
        </a>
      </div>
    </div>
  `;
}

// ---- Wizard ----
let wizardStep = 0;
const WIZARD_TOTAL_STEPS = 4;

function initWizard() {
  document.getElementById('wizardNext').addEventListener('click', () => {
    if (wizardStep < WIZARD_TOTAL_STEPS - 1) {
      wizardStep++;
      updateWizardStep();
    } else {
      createOpportunity();
    }
  });
  document.getElementById('wizardBack').addEventListener('click', () => {
    if (wizardStep > 0) {
      wizardStep--;
      updateWizardStep();
    }
  });
  document.getElementById('wizardCancel').addEventListener('click', () => {
    navigate('#dashboard');
  });

  // Record type selection
  document.querySelectorAll('.record-type-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.record-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  // Contact autocomplete
  initContactAutocomplete();

  // Live validation on mandatory fields
  ['wizOrgName', 'wizDealSize', 'wizContact'].forEach(id => {
    document.getElementById(id).addEventListener('input', validateWizardNext);
  });

  // Wizard file upload
  const wizFileZone = document.getElementById('wizFileZone');
  const wizFileInput = document.getElementById('wizFileInput');
  const wizFileList = document.getElementById('wizFileList');

  wizFileZone.addEventListener('click', () => wizFileInput.click());
  wizFileInput.addEventListener('change', () => updateWizFileList());

  function updateWizFileList() {
    const files = wizFileInput.files;
    if (!files.length) {
      wizFileList.innerHTML = '';
      return;
    }
    wizFileList.innerHTML = Array.from(files).map(f => `
      <div class="file-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;color:var(--text-muted);flex-shrink:0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span class="file-item-name">${f.name}</span>
        <span class="file-item-size">${formatFileSize(f.size)}</span>
      </div>
    `).join('');
  }
}

function initContactAutocomplete() {
  const input = document.getElementById('wizContact');
  const dropdown = document.getElementById('contactDropdown');

  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    if (!val) {
      dropdown.classList.remove('open');
      return;
    }

    const matches = contacts.filter(c => c.toLowerCase().includes(val));
    let html = matches.map(c =>
      `<div class="contact-option">${c}</div>`
    ).join('');

    // If no exact match, offer to add new
    const exactMatch = contacts.some(c => c.toLowerCase() === val);
    if (!exactMatch && val.length > 1) {
      html += `<div class="contact-option contact-add">+ Add "${input.value.trim()}" as new contact</div>`;
    }

    if (html) {
      dropdown.innerHTML = html;
      dropdown.classList.add('open');

      dropdown.querySelectorAll('.contact-option').forEach(opt => {
        opt.addEventListener('mousedown', (e) => {
          e.preventDefault();
          if (opt.classList.contains('contact-add')) {
            // Add the new contact to the list
            const newName = input.value.trim();
            contacts.push(newName);
            input.value = newName;
          } else {
            input.value = opt.textContent;
          }
          dropdown.classList.remove('open');
          validateWizardNext();
        });
      });
    } else {
      dropdown.classList.remove('open');
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => dropdown.classList.remove('open'), 150);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim()) input.dispatchEvent(new Event('input'));
  });
}

function resetWizard() {
  wizardStep = 0;
  document.querySelector('.record-type-card input[value="Opportunity"]').checked = true;
  document.querySelectorAll('.record-type-card').forEach(c => c.classList.remove('selected'));
  document.querySelector('.record-type-card:first-child').classList.add('selected');
  document.getElementById('wizOrgName').value = '';
  document.getElementById('wizDealType').value = 'Title Sponsorship';
  document.getElementById('wizDealSize').value = '';
  document.getElementById('wizProbability').value = '50';
  document.getElementById('wizStage').value = 'Contacted';
  document.getElementById('wizContact').value = '';
  document.getElementById('wizAssignee').value = 'Eszter Vass';
  document.getElementById('wizNotes').value = '';
  document.getElementById('wizardTitle').textContent = 'Create New Record';
  document.getElementById('wizFileInput').value = '';
  document.getElementById('wizFileList').innerHTML = '';
  updateWizardStep();
}

function updateWizardStep() {
  const steps = document.querySelectorAll('.wizard-step');
  steps.forEach((s, i) => s.classList.toggle('active', i === wizardStep));

  // Update title after step 0
  if (wizardStep > 0) {
    const selectedType = document.querySelector('input[name="recordType"]:checked').value;
    document.getElementById('wizardTitle').textContent = 'Create New ' + selectedType;
  } else {
    document.getElementById('wizardTitle').textContent = 'Create New Record';
  }

  // Update progress indicators
  document.querySelectorAll('.step-circle').forEach((c, i) => {
    c.classList.toggle('active', i === wizardStep);
    c.classList.toggle('completed', i < wizardStep);
    if (i < wizardStep) c.innerHTML = '&#10003;';
    else c.textContent = i + 1;
  });
  document.querySelectorAll('.step-label').forEach((l, i) => {
    l.classList.toggle('active', i === wizardStep);
  });
  document.querySelectorAll('.step-connector').forEach((c, i) => {
    c.classList.toggle('completed', i < wizardStep);
  });

  // Button states
  document.getElementById('wizardBack').style.visibility = wizardStep === 0 ? 'hidden' : 'visible';
  document.getElementById('wizardNext').textContent = wizardStep === WIZARD_TOTAL_STEPS - 1 ? 'Create Opportunity' : 'Next';

  // Validate mandatory fields for current step
  validateWizardNext();

  // Populate review
  if (wizardStep === WIZARD_TOTAL_STEPS - 1) populateReview();
}

function validateWizardNext() {
  const btn = document.getElementById('wizardNext');
  let valid = true;

  if (wizardStep === 1) {
    // Step 1 (Details): Company Name + Deal Size required
    const orgName = document.getElementById('wizOrgName').value.trim();
    const dealSize = document.getElementById('wizDealSize').value.trim();
    valid = orgName.length > 0 && dealSize.length > 0;
  } else if (wizardStep === 2) {
    // Step 2 (Context): Contact Person required
    const contact = document.getElementById('wizContact').value.trim();
    valid = contact.length > 0;
  }

  btn.disabled = !valid;
}

function populateReview() {
  const selectedType = document.querySelector('input[name="recordType"]:checked').value;
  document.getElementById('revRecordType').textContent = selectedType;
  document.getElementById('revOrg').textContent = document.getElementById('wizOrgName').value || '—';
  document.getElementById('revType').textContent = document.getElementById('wizDealType').value;
  document.getElementById('revSize').textContent = document.getElementById('wizDealSize').value || '—';
  document.getElementById('revProbability').textContent = (document.getElementById('wizProbability').value || '0') + '%';
  document.getElementById('revStage').textContent = document.getElementById('wizStage').value;
  document.getElementById('revContact').textContent = document.getElementById('wizContact').value || '—';
  document.getElementById('revAssignee').textContent = document.getElementById('wizAssignee').value || '—';
  document.getElementById('revNotes').textContent = document.getElementById('wizNotes').value || '—';
  const fileCount = document.getElementById('wizFileInput').files.length;
  document.getElementById('revAttachments').textContent = fileCount > 0 ? fileCount + ' file' + (fileCount > 1 ? 's' : '') : 'None';
}

// Track uploaded files per deal
const dealDocuments = {};

function createOpportunity() {
  const orgName = document.getElementById('wizOrgName').value.trim();
  const dealSize = document.getElementById('wizDealSize').value.trim();
  const initials = orgName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const assignee = document.getElementById('wizAssignee').value || 'Eszter Vass';

  const newId = dealPipeline.length + 1;

  const newDeal = {
    id: newId,
    org: orgName,
    initials: initials,
    color: color,
    dealSize: dealSize,
    stage: document.getElementById('wizStage').value,
    heat: 'hot',
    type: document.getElementById('wizDealType').value,
    contact: document.getElementById('wizContact').value || '—',
    notes: document.getElementById('wizNotes').value || 'No notes provided.',
    probability: document.getElementById('wizProbability').value + '%',
    assignee: assignee
  };

  // Add creation activity event
  activityLog[newId] = [
    { type: "create", text: "Opportunity created by " + assignee, time: "Just now", icon: "plus" }
  ];

  // Store any uploaded files
  const fileInput = document.getElementById('wizFileInput');
  if (fileInput.files.length > 0) {
    dealDocuments[newId] = [];
    for (const file of fileInput.files) {
      dealDocuments[newId].push({
        name: file.name,
        size: formatFileSize(file.size),
        type: guessDocType(file.name),
        date: 'Just now'
      });
    }
  }

  dealPipeline.unshift(newDeal);
  renderDealPipeline();
  showDetail(newDeal);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function guessDocType(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'PDF';
  if (['doc', 'docx'].includes(ext)) return 'Document';
  if (['xls', 'xlsx'].includes(ext)) return 'Spreadsheet';
  if (['ppt', 'pptx'].includes(ext)) return 'Presentation';
  if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return 'Image';
  return 'File';
}

// ---- Notifications ----
function initNotifications() {
  document.querySelectorAll('.notif-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const popover = trigger.querySelector('.notif-popover');
      const isOpen = popover.classList.contains('open');

      // Close all popovers first
      document.querySelectorAll('.notif-popover.open').forEach(p => p.classList.remove('open'));

      if (!isOpen) {
        popover.classList.add('open');
        // Remove the red dot once opened
        const dot = trigger.querySelector('.notif-dot');
        if (dot) dot.remove();
      }
    });
  });

  // Close popover when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.notif-popover.open').forEach(p => p.classList.remove('open'));
  });
}

// ---- Widget Library ----
let widgetLibrarySlide = 0;
const WIDGET_SLIDES = 4;
const addedWidgets = new Set();

function initWidgetLibrary() {
  const overlay = document.getElementById('widgetLibraryOverlay');
  const closeBtn = document.getElementById('wlClose');
  const prevBtn = document.getElementById('wlPrev');
  const nextBtn = document.getElementById('wlNext');

  // Wire "+" placeholder click to open modal
  document.querySelectorAll('.widget-placeholder').forEach(el => {
    el.addEventListener('click', openWidgetLibrary);
  });

  closeBtn.addEventListener('click', closeWidgetLibrary);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeWidgetLibrary();
  });

  prevBtn.addEventListener('click', () => {
    if (widgetLibrarySlide > 0) {
      widgetLibrarySlide--;
      updateCarousel();
    }
  });
  nextBtn.addEventListener('click', () => {
    if (widgetLibrarySlide < WIDGET_SLIDES - 1) {
      widgetLibrarySlide++;
      updateCarousel();
    }
  });

  // Dot navigation
  document.querySelectorAll('.wl-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      widgetLibrarySlide = i;
      updateCarousel();
    });
  });

  // Add widget buttons
  document.querySelectorAll('.wl-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.widget;
      addWidgetToDashboard(type);
      closeWidgetLibrary();
    });
  });

  // Populate mini previews
  populateWidgetPreviews();
}

function openWidgetLibrary() {
  widgetLibrarySlide = 0;
  updateCarousel();
  updateAddButtons();
  document.getElementById('widgetLibraryOverlay').classList.add('open');
}

function closeWidgetLibrary() {
  document.getElementById('widgetLibraryOverlay').classList.remove('open');
}

function updateCarousel() {
  const track = document.getElementById('wlTrack');
  track.style.transform = `translateX(-${widgetLibrarySlide * 100}%)`;

  // Update dots
  document.querySelectorAll('.wl-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === widgetLibrarySlide);
  });

  // Update arrows
  document.getElementById('wlPrev').disabled = widgetLibrarySlide === 0;
  document.getElementById('wlNext').disabled = widgetLibrarySlide === WIDGET_SLIDES - 1;
}

function updateAddButtons() {
  document.querySelectorAll('.wl-add-btn').forEach(btn => {
    const type = btn.dataset.widget;
    if (addedWidgets.has(type)) {
      btn.disabled = true;
      btn.textContent = 'Already Added';
    } else {
      btn.disabled = false;
      btn.textContent = 'Add to Dashboard';
    }
  });
}

function populateWidgetPreviews() {
  // Contacts preview
  const contactsContainer = document.getElementById('wlPreviewContacts');
  if (contactsContainer) {
    contactsContainer.innerHTML = favoriteContacts.slice(0, 3).map(c => `
      <div class="wl-pc-card">
        <div class="wl-pc-avatar" style="background:${c.color}">${c.initials}</div>
        <div class="wl-pc-name">${c.name.split(' ')[0]}</div>
        <div class="wl-pc-company">${c.company}</div>
      </div>
    `).join('');
  }

  // Companies preview
  const companiesContainer = document.getElementById('wlPreviewCompanies');
  if (companiesContainer) {
    companiesContainer.innerHTML = favoriteCompanies.slice(0, 4).map(c => `
      <div class="wl-pco-row">
        <div class="wl-pco-avatar" style="background:${c.color}">${c.initials}</div>
        <span class="wl-pco-name">${c.name}</span>
        <span class="wl-pco-industry">${c.industry}</span>
      </div>
    `).join('');
  }

  // Expiring deals preview
  const expiringContainer = document.getElementById('wlPreviewExpiring');
  if (expiringContainer) {
    expiringContainer.innerHTML = expiringDeals.slice(0, 3).map(d => `
      <div class="wl-pe-row">
        <span class="wl-pe-org">${d.org}</span>
        <span class="wl-pe-contact">${d.contact}</span>
        <span class="wl-pe-value">${d.value}</span>
        <span class="wl-pe-date">${d.expiryDate}</span>
      </div>
    `).join('');
  }
}

function addWidgetToDashboard(type) {
  if (addedWidgets.has(type)) return;
  addedWidgets.add(type);

  const widgetsRow = document.querySelector('#dashboard .widgets-row');

  // Find the placeholder widget (the one with .widget-placeholder)
  const placeholderWidget = widgetsRow.querySelector('.widget-placeholder').closest('.widget');

  // Create the new widget
  const newWidget = document.createElement('div');
  newWidget.className = 'widget';

  if (type === 'contacts') {
    newWidget.innerHTML = renderFavoriteContactsWidget();
  } else if (type === 'companies') {
    newWidget.innerHTML = renderFavoriteCompaniesWidget();
  } else if (type === 'expiring') {
    newWidget.innerHTML = renderExpiringDealsWidget();
  }

  // Insert before placeholder
  widgetsRow.insertBefore(newWidget, placeholderWidget);
}

function renderFavoriteContactsWidget() {
  return `
    <div class="widget-header">
      <h3>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Favorite Contacts
      </h3>
      <a>View More</a>
    </div>
    <div class="fav-contacts-grid">
      ${favoriteContacts.map(c => `
        <div class="fav-contact-card">
          <div class="fav-contact-avatar" style="background:${c.color}">${c.initials}</div>
          <div class="fav-contact-name">${c.name}</div>
          <div class="fav-contact-company">${c.company}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderFavoriteCompaniesWidget() {
  return `
    <div class="widget-header">
      <h3>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Favorite Companies
      </h3>
      <a>View More</a>
    </div>
    <div class="fav-companies-list">
      ${favoriteCompanies.map(c => `
        <div class="fav-company-row">
          <div class="fav-company-avatar" style="background:${c.color}">${c.initials}</div>
          <span class="fav-company-name">${c.name}</span>
          <span class="fav-company-industry">${c.industry}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderExpiringDealsWidget() {
  return `
    <div class="widget-header">
      <h3>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Expiring Deals
      </h3>
      <a>View More</a>
    </div>
    <div class="expiring-deals-list">
      ${expiringDeals.map(d => `
        <div class="expiring-deal-row">
          <span class="expiring-deal-org">${d.org}</span>
          <span class="expiring-deal-contact">${d.contact}</span>
          <span class="expiring-deal-value">${d.value}</span>
          <span class="expiring-deal-date">${d.expiryDate}</span>
        </div>
      `).join('')}
    </div>
  `;
}
