/* ==========================================================================
   SkillPath - application logic
   Sections:
     1. Helpers & state (LocalStorage)
     2. Roadmap engine (rule-based personalization)
     3. UI helpers (toast, modal, stepper)
     4. Views: home, profile, career, roadmap, dashboard
     5. Router & event wiring
   ========================================================================== */
(function () {
  'use strict';

  const D = window.SKILLPATH_DATA;
  const STORAGE_KEY = 'skillpath.v1';
  // true  = every page load starts fresh from Home (good for demos and screen recordings)
  // false = restore the saved profile and progress after a refresh
  // Tests (and you) can override it by setting window.SKILLPATH_FRESH_START = false before this file loads.
  const START_FRESH = window.SKILLPATH_FRESH_START !== false;
  const STUDY_DAYS_PER_WEEK = 6;

  /* ------------------------------------------------------------------
     1. HELPERS & STATE
     ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function freshState() {
    return {
      version: 1,
      profile: null,        // {name, degree, year, language, level, hours}
      careerId: null,
      pendingCareer: null,  // career picked on the home page before a profile exists
      completed: {},        // {taskId: true}
      generatedAt: null,
      isDemo: false
    };
  }

  let state = freshState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) return freshState();
      const merged = Object.assign(freshState(), parsed);
      if (merged.careerId && !D.CAREERS[merged.careerId]) merged.careerId = null;
      if (!merged.completed || typeof merged.completed !== 'object') merged.completed = {};
      return merged;
    } catch (err) {
      return freshState();
    }
  }

  let storageWarned = false;
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      if (!storageWarned) {
        storageWarned = true;
        toast('Your browser blocked saving. Progress will be lost when you close this tab.', 'error');
      }
    }
  }

  function clearStorage() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
  }

  function hasProfile() { return !!state.profile; }
  function hasCareer() { return !!state.careerId; }
  function hasRoadmap() { return hasProfile() && hasCareer(); }

  function nextStep() {
    if (!hasProfile()) return 'profile';
    if (!hasCareer()) return 'career';
    return 'dashboard';
  }

  function canAccess(view) {
    switch (view) {
      case 'career': return hasProfile();
      case 'roadmap':
      case 'dashboard': return hasRoadmap();
      default: return true;
    }
  }

  function blockedMessage(view) {
    if (!hasProfile()) return 'Please complete your profile first.';
    if (!hasCareer()) return 'Please choose a career first.';
    return '';
  }

  /* ------------------------------------------------------------------
     2. ROADMAP ENGINE
     Transparent rules (no AI). The roadmap depends on what the student entered:
       level      Beginner     -> every module at standard length, beginner projects
                  Intermediate -> Phase 1 foundations become quick reviews (50% of the hours,
                                  first 2 tasks); core modules standard; beginner + intermediate projects
                  Advanced     -> foundations are quick reviews (40%), core modules 20% shorter; all projects
       language   used for the programming-basics module (Python, Java and AI/ML paths use their own)
       hours/day  duration = total hours / daily hours, with 6 study days a week
     ------------------------------------------------------------------ */
  const LEVEL_RULES = {
    Beginner: { foundations: 1, core: 1, review: false, projects: ['beginner'] },
    Intermediate: { foundations: 0.5, core: 1, review: true, projects: ['beginner', 'intermediate'] },
    Advanced: { foundations: 0.4, core: 0.8, review: true, projects: ['beginner', 'intermediate', 'advanced'] }
  };

  function fill(text, lang) { return String(text).replace(/\{lang\}/g, lang); }

  function buildRoadmap(st) {
    const career = D.CAREERS[st.careerId];
    const level = LEVEL_RULES[st.profile.level] ? st.profile.level : 'Beginner';
    const rule = LEVEL_RULES[level];
    const daily = Number(st.profile.hours) || 1;
    const lang = career.forceLang || st.profile.language;
    const reasons = [];

    function makeModule(id, phase) {
      const m = D.MODULES[id];
      const isFoundation = phase === 'foundations';
      const mult = isFoundation ? rule.foundations : rule.core;
      const review = isFoundation && rule.review;
      let tasks = m.tasks.map(t => fill(t, lang));
      let ids = tasks.map((_, i) => id + ':' + i);
      if (review) { tasks = tasks.slice(0, 2); ids = ids.slice(0, 2); }
      const resources = m.langResources ? (D.LANGUAGE_RESOURCES[lang] || D.LANGUAGE_RESOURCES.Python) : m.resources;
      let note = '';
      if (review) note = 'Quick review because your level is ' + level + ': make sure you can do these tasks, then move on.';
      else if (mult < 1) note = 'About 20% shorter because your level is ' + level + '.';
      return {
        id, kind: 'module', status: review ? 'review' : 'normal', title: fill(m.title, lang), why: m.why, note,
        hours: Math.max(2, Math.round(m.hours * mult)), tasks: tasks.map((text, i) => ({ id: ids[i], text })), resources: resources || []
      };
    }

    const foundations = career.foundations.map(id => makeModule(id, 'foundations'));
    const core = career.core.map(id => makeModule(id, 'core'));

    // Reasons shown to the student.
    if (level === 'Beginner') reasons.push('Level Beginner: every module uses its standard length and you start from the basics.');
    if (level === 'Intermediate') reasons.push('Level Intermediate: the ' + foundations.length + ' foundation modules in Phase 1 are quick reviews (about half the time and the first two tasks of each).');
    if (level === 'Advanced') reasons.push('Level Advanced: Phase 1 foundations are quick reviews (about 40% of the time) and Phase 2 modules are 20% shorter.');
    if (career.forceLang) reasons.push('The ' + career.name + ' path uses ' + career.forceLang + ' for the programming basics.');
    else reasons.push('Programming basics use your preferred language: ' + lang + '.');

    // Projects chosen by level.
    const projectIdeas = career.projects.map((p, i) => ({ index: i, title: p.title, desc: p.desc, level: p.level, recommended: rule.projects.indexOf(p.level) !== -1 }));
    const projectItems = projectIdeas.filter(p => p.recommended).map(p => ({
      id: 'proj' + p.index, kind: 'project', status: 'project', title: 'Project: ' + p.title, why: p.desc,
      note: 'Project level: ' + p.level + '. Recommended for your level (' + level + ').',
      hours: D.PROJECT_HOURS[p.level],
      tasks: [
        { id: 'proj' + p.index + ':0', text: 'Plan "' + p.title + '": list the features and sketch the screens or data flow' },
        { id: 'proj' + p.index + ':1', text: 'Build the first working version of "' + p.title + '"' },
        { id: 'proj' + p.index + ':2', text: 'Polish it, write a README with screenshots and push it to GitHub' }
      ],
      resources: [D.MODULES['git-basics'].resources[1]]
    }));
    reasons.push('Recommended ' + projectItems.length + ' project(s) for your level (' + level + '). All project ideas are listed below.');

    // Interview preparation.
    const interviewItems = [
      {
        id: 'int-career', kind: 'interview', status: 'interview', title: career.name + ' technical interview topics',
        why: 'Revise these topics until you can explain each one in your own words, with a small example.',
        note: '', hours: 4 * career.interview.length,
        tasks: career.interview.map((g, i) => ({ id: 'int-career:' + i, text: 'Revise ' + g.group + ': ' + g.items.join('; ') })),
        resources: [D.GENERAL_INTERVIEW.dsa.resources[0]]
      },
      {
        id: 'int-dsa', kind: 'interview', status: 'interview', title: D.GENERAL_INTERVIEW.dsa.title,
        why: 'Coding rounds are common in campus placements. Short, regular practice works better than cramming.',
        note: '', hours: 20,
        tasks: D.GENERAL_INTERVIEW.dsa.tasks.map((text, i) => ({ id: 'int-dsa:' + i, text })),
        resources: D.GENERAL_INTERVIEW.dsa.resources
      },
      {
        id: 'int-hr', kind: 'interview', status: 'interview', title: D.GENERAL_INTERVIEW.hr.title,
        why: 'Communication and clarity matter as much as technical skill.', note: '', hours: 6,
        tasks: D.GENERAL_INTERVIEW.hr.tasks.map((text, i) => ({ id: 'int-hr:' + i, text })),
        resources: D.GENERAL_INTERVIEW.hr.resources
      },
      {
        id: 'int-resume', kind: 'interview', status: 'interview', title: D.GENERAL_INTERVIEW.resume.title,
        why: 'Recruiters often decide in seconds. Make your best work easy to find.', note: '', hours: 6,
        tasks: D.GENERAL_INTERVIEW.resume.tasks.map((text, i) => ({ id: 'int-resume:' + i, text })),
        resources: D.GENERAL_INTERVIEW.resume.resources
      }
    ];

    const phases = [
      { id: 'p1', name: 'Phase 1: Foundations', desc: 'Build the base that every later skill depends on.', items: foundations },
      { id: 'p2', name: 'Phase 2: Core skills', desc: 'Learn the technologies for the ' + career.name + ' role, in order.', items: core },
      { id: 'p3', name: 'Phase 3: Projects & portfolio', desc: 'Prove your skills with projects you can show to recruiters.', items: projectItems },
      { id: 'p4', name: 'Phase 4: Interview preparation', desc: 'Revise, practise and polish your profile.', items: interviewItems }
    ];

    let totalHours = 0;
    let totalTasks = 0;
    phases.forEach(p => {
      p.hours = 0; p.tasks = 0;
      p.items.forEach(it => {
        it.days = Math.max(1, Math.ceil(it.hours / daily));
        p.hours += it.hours; p.tasks += it.tasks.length;
      });
      p.days = Math.ceil(p.hours / daily);
      totalHours += p.hours; totalTasks += p.tasks;
    });
    const totalDays = Math.ceil(totalHours / daily);
    const weeks = Math.max(1, Math.ceil(totalDays / STUDY_DAYS_PER_WEEK));
    reasons.push('Duration: ' + totalHours + ' study hours at ' + daily + ' hour(s) a day, ' + STUDY_DAYS_PER_WEEK + ' days a week, is about ' + weeks + ' week(s).');

    const warnings = [];
    if (daily < 1.5) warnings.push('At ' + daily + ' hour(s) a day the plan is long. If you can add even 30 more minutes, the finish date moves much closer.');
    if (weeks > 52) warnings.push('This roadmap is over a year long at your current pace. Consider focusing on Phases 1-3 first and revisiting Phase 4 when you are closer to placements.');

    return { career, lang, daily, phases, projectIdeas, reasons, warnings, totalHours, totalDays, weeks, totalTasks, level };
  }

  function currentRoadmap() { return buildRoadmap(state); }

  function allTaskIds(roadmap) {
    const ids = [];
    roadmap.phases.forEach(p => p.items.forEach(it => it.tasks.forEach(t => ids.push(t.id))));
    return ids;
  }

  function progressOf(roadmap) {
    const ids = allTaskIds(roadmap);
    const done = ids.filter(id => state.completed[id]).length;
    return { total: ids.length, done, remaining: ids.length - done, pct: ids.length ? Math.round((done / ids.length) * 100) : 0 };
  }

  /** Re-run the engine, drop completions that no longer exist, report how many were kept. */
  function regenerate() {
    const roadmap = currentRoadmap();
    const valid = new Set(allTaskIds(roadmap));
    const next = {};
    let kept = 0;
    Object.keys(state.completed).forEach(id => { if (valid.has(id) && state.completed[id]) { next[id] = true; kept += 1; } });
    state.completed = next;
    state.generatedAt = new Date().toISOString();
    saveState();
    return { roadmap, kept };
  }

  /* ------------------------------------------------------------------
     4. UI HELPERS
     ------------------------------------------------------------------ */
  function toast(message, type) {
    const region = $('#toastRegion');
    if (!region) return;
    const el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'info');
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = '<span class="toast-icon" aria-hidden="true">' + (type === 'error' ? '!' : type === 'success' ? '&#10003;' : 'i') + '</span><span></span>';
    el.lastChild.textContent = message;
    region.appendChild(el);
    const remove = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 250); };
    setTimeout(remove, type === 'error' ? 6000 : 4000);
    el.addEventListener('click', remove);
    while (region.children.length > 4) region.firstChild.remove();
  }

  let modalResolver = null;
  let lastFocus = null;
  function confirmDialog(opts) {
    const modal = $('#modal');
    $('#modalTitle').textContent = opts.title || 'Are you sure?';
    $('#modalMessage').textContent = opts.message || '';
    const ok = $('#modalConfirm');
    ok.textContent = opts.confirmText || 'Confirm';
    ok.className = 'btn ' + (opts.danger ? 'btn-danger' : 'btn-primary');
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    $('#modalCancel').focus();
    return new Promise(resolve => { modalResolver = resolve; });
  }
  function closeModal(result) {
    $('#modal').hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
    if (modalResolver) { const r = modalResolver; modalResolver = null; r(result); }
  }

  const STEPS = [
    { id: 'profile', label: 'Profile' },
    { id: 'career', label: 'Career' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'dashboard', label: 'Dashboard' }
  ];

  function renderSteppers() {
    $$('[data-stepper]').forEach(host => {
      const current = host.getAttribute('data-stepper');
      const currentIndex = STEPS.findIndex(s => s.id === current);
      host.innerHTML = '<ol class="stepper" aria-label="Progress through setup">' + STEPS.map((s, i) => {
        const done = (s.id === 'profile' && hasProfile()) || (s.id === 'career' && hasCareer()) ||
          (s.id === 'roadmap' && hasRoadmap() && i < currentIndex) ||
          (s.id === 'dashboard' && false);
        const cls = ['stepper-item'];
        if (i === currentIndex) cls.push('current');
        else if (done) cls.push('done');
        const allowed = canAccess(s.id);
        const inner = '<span class="stepper-dot">' + (done && i !== currentIndex ? '&#10003;' : (i + 1)) + '</span><span class="stepper-label">' + s.label + '</span>';
        return '<li class="' + cls.join(' ') + '">' + (allowed
          ? '<a href="#' + s.id + '"' + (i === currentIndex ? ' aria-current="step"' : '') + '>' + inner + '</a>'
          : '<span class="locked" aria-disabled="true">' + inner + '</span>') + '</li>';
      }).join('') + '</ol>';
    });
  }

  function ring(pct, label) {
    return '<div class="ring" style="--p:' + pct + '" role="img" aria-label="' + esc(label || (pct + ' percent')) + '"><div class="ring-inner"><b>' + pct + '%</b>' + (label ? '<span>' + esc(label) + '</span>' : '') + '</div></div>';
  }

  function bar(pct, cls) {
    return '<div class="bar ' + (cls || '') + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct + '%"></i></div>';
  }

  function formatHours(h) { return (Math.round(h * 10) / 10) + ' h'; }
  function formatDuration(weeks) {
    if (weeks < 8) return weeks + ' week' + (weeks === 1 ? '' : 's');
    const months = Math.round((weeks / 4.345) * 10) / 10;
    return weeks + ' weeks (about ' + months + ' months)';
  }

  /* ------------------------------------------------------------------
     5. VIEWS
     ------------------------------------------------------------------ */

  /* ---- Home ---- */
  function renderHome() {
    $('#homeCareers').innerHTML = Object.values(D.CAREERS).map(c =>
      '<article class="card career-card">' +
        '<div class="career-icon" aria-hidden="true">' + c.icon + '</div>' +
        '<h3>' + esc(c.name) + '</h3>' +
        '<p>' + esc(c.tagline) + '</p>' +
        '<ul class="chips">' + c.skills.slice(0, 4).map(s => '<li>' + esc(s) + '</li>').join('') + '</ul>' +
        '<button type="button" class="btn btn-soft btn-block" data-action="pick-career" data-id="' + c.id + '">Choose this path</button>' +
      '</article>').join('');

    $('#demoCards').innerHTML = D.SAMPLES.map(s => {
      const c = D.CAREERS[s.careerId];
      return '<article class="card demo-card">' +
        '<span class="badge badge-purple">Demo data</span>' +
        '<h3>' + esc(s.label.replace(/^Demo:\s*/, '')) + '</h3>' +
        '<p>Target role: <strong>' + esc(c.name) + '</strong><br>Level: ' + esc(s.profile.level) + ' · ' + esc(s.profile.hours) + ' h/day · Language: ' + esc(s.profile.language) + '</p>' +
        '<button type="button" class="btn btn-ghost btn-block" data-action="load-demo" data-id="' + s.id + '">Load this demo</button>' +
      '</article>';
    }).join('');

    const wb = $('#welcomeBack');
    if (hasProfile()) {
      let line = 'Welcome back, <strong>' + esc(state.profile.name) + '</strong>.';
      if (hasRoadmap()) {
        const p = progressOf(currentRoadmap());
        line += ' Your roadmap is ' + p.pct + '% complete.';
      } else {
        line += ' You have not finished setting up yet.';
      }
      wb.innerHTML = '<span>' + line + '</span> <button type="button" class="link-btn" data-action="start">Continue</button>';
      wb.hidden = false;
    } else {
      wb.hidden = true;
    }
  }

  /* ---- Profile ---- */
  function fillSelect(select, options, placeholder) {
    select.innerHTML = '<option value="">' + esc(placeholder) + '</option>' + options.map(o => '<option value="' + esc(o) + '">' + esc(o) + '</option>').join('');
  }

  function initProfileForm() {
    fillSelect($('#pfDegree'), D.OPTIONS.degrees, 'Select your degree');
    fillSelect($('#pfYear'), D.OPTIONS.years, 'Select your year');
    fillSelect($('#pfLanguage'), D.OPTIONS.languages, 'Select a language');
    $('#pfLevels').innerHTML = D.OPTIONS.levels.map((l, i) =>
      '<label class="seg"><input type="radio" name="level" value="' + l + '" id="pfLevel' + i + '"><span>' + l + '</span></label>').join('');
  }

  function renderProfile() {
    const editing = hasProfile();
    $('#profileTitle').textContent = editing ? 'Edit your details' : 'Tell us about yourself';
    $('#profileSubmit').textContent = editing ? 'Save changes' : 'Save & choose career';
    const form = $('#profileForm');
    clearFormErrors(form);
    const p = state.profile || { name: '', degree: '', year: '', language: '', level: '', hours: '' };
    form.elements.name.value = p.name;
    form.elements.degree.value = p.degree;
    form.elements.year.value = p.year;
    form.elements.language.value = p.language;
    form.elements.hours.value = p.hours;
    $$('input[name="level"]', form).forEach(r => { r.checked = r.value === p.level; });
  }

  function clearFormErrors(form) {
    $$('.field-error', form).forEach(e => { e.textContent = ''; });
    $$('.invalid', form).forEach(e => e.classList.remove('invalid'));
  }

  function setFieldError(form, name, message) {
    const slot = $('[data-error-for="' + name + '"]', form);
    if (slot) slot.textContent = message;
    const input = form.elements[name];
    if (input && input.classList) input.classList.add('invalid');
    if (input && input.length && input[0]) { /* radio group */ }
  }

  function validateProfile(values) {
    const errors = {};
    const name = values.name.trim().replace(/\s+/g, ' ');
    if (!name) errors.name = 'Please enter your name.';
    else if (name.length < 2) errors.name = 'Your name must be at least 2 characters.';
    else if (name.length > 40) errors.name = 'Your name must be 40 characters or fewer.';
    else if (!/^[\p{L}][\p{L}\p{M}\s.'\-()]*$/u.test(name)) errors.name = 'Use letters only (spaces, . - and apostrophes are fine).';
    if (!values.degree) errors.degree = 'Please select your degree.';
    if (!values.year) errors.year = 'Please select your year.';
    if (!values.language) errors.language = 'Please choose a language.';
    if (!values.level) errors.level = 'Please select your current level.';
    const hoursRaw = String(values.hours).trim();
    const hours = Number(hoursRaw);
    if (!hoursRaw) errors.hours = 'Please enter your daily study hours.';
    else if (!isFinite(hours)) errors.hours = 'Enter a number, for example 2 or 1.5.';
    else if (hours < 0.5 || hours > 12) errors.hours = 'Study hours must be between 0.5 and 12.';
    else if (Math.round(hours * 2) !== hours * 2) errors.hours = 'Use steps of 0.5 hours (for example 1, 1.5, 2).';
    return { errors, clean: { name, degree: values.degree, year: values.year, language: values.language, level: values.level, hours } };
  }

  function onProfileSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    clearFormErrors(form);
    const levelInput = $('input[name="level"]:checked', form);
    const values = {
      name: form.elements.name.value, degree: form.elements.degree.value, year: form.elements.year.value,
      language: form.elements.language.value, level: levelInput ? levelInput.value : '', hours: form.elements.hours.value
    };
    const { errors, clean } = validateProfile(values);
    const keys = Object.keys(errors);
    if (keys.length) {
      keys.forEach(k => setFieldError(form, k, errors[k]));
      toast('Please fix the highlighted fields.', 'error');
      const first = form.elements[keys[0]];
      if (first && first.focus && !first.length) first.focus();
      else if (keys[0] === 'level') { const r = $('input[name="level"]', form); if (r) r.focus(); }
      return;
    }
    const wasEditing = hasProfile();
    state.profile = clean;
    if (state.isDemo && /\(demo\)$/.test(clean.name) === false) state.isDemo = false;
    saveState(); // pendingCareer (picked on the home page) is kept until the career step confirms it
    if (wasEditing && hasRoadmap()) {
      const { kept } = regenerate();
      toast('Details saved and your roadmap was regenerated. ' + kept + ' completed task(s) kept.', 'success');
      go('dashboard');
    } else {
      toast(wasEditing ? 'Details saved.' : 'Profile saved. Now choose your career.', 'success');
      go(nextStep());
    }
  }

  /* ---- Career ---- */
  let careerPreview = null;
  let careerSeed = null; // set by actions that want a specific career pre-selected

  function renderCareer() {
    careerPreview = careerSeed || state.careerId || state.pendingCareer || null;
    careerSeed = null;
    $('#careerTitle').textContent = hasCareer() ? 'Change your target career' : 'Choose your target career';
    $('#careerConfirm').textContent = hasCareer() ? 'Update career & regenerate roadmap' : 'Build my roadmap';
    $('#careerList').innerHTML = Object.values(D.CAREERS).map(c => {
      const selected = c.id === careerPreview;
      return '<button type="button" role="radio" aria-checked="' + selected + '" class="career-option' + (selected ? ' selected' : '') + '" data-action="preview-career" data-id="' + c.id + '">' +
        '<span class="career-icon sm" aria-hidden="true">' + c.icon + '</span>' +
        '<span class="co-text"><b>' + esc(c.name) + '</b><small>' + esc(c.tagline) + '</small></span>' +
        (c.id === state.careerId ? '<span class="badge">Current</span>' : '') +
      '</button>';
    }).join('');
    renderCareerDetail();
  }

  function renderCareerDetail() {
    const host = $('#careerDetail');
    const c = D.CAREERS[careerPreview];
    if (!c) {
      host.innerHTML = '<div class="empty"><div class="career-icon" aria-hidden="true">?</div><h3>Select a career</h3><p>Choose a role on the left to see its description, skills, sample projects and the topics interviewers ask about.</p></div>';
      return;
    }
    const lang = c.forceLang ? '<p class="note">This path uses <strong>' + esc(c.forceLang) + '</strong> as its programming language.</p>' : '';
    const stackLength = c.foundations.length + c.core.length;
    host.innerHTML =
      '<div class="detail-head"><div class="career-icon" aria-hidden="true">' + c.icon + '</div><div><h2>' + esc(c.name) + '</h2><p class="muted">' + esc(c.tagline) + '</p></div></div>' +
      '<p>' + esc(c.description) + '</p>' + lang +
      '<h4>Skills you will build</h4><ul class="chips">' + c.skills.map(s => '<li>' + esc(s) + '</li>').join('') + '</ul>' +
      '<h4>What is on this path</h4><ul class="ticks"><li>' + stackLength + ' learning modules in a fixed order</li><li>' + c.projects.length + ' project ideas from beginner to advanced</li><li>' + c.interview.length + ' groups of interview topics</li></ul>' +
      '<h4>Project ideas</h4><ul class="plain">' + c.projects.map(p => '<li><b>' + esc(p.title) + '</b> <span class="badge badge-soft">' + esc(p.level) + '</span></li>').join('') + '</ul>';
  }

  async function confirmCareer() {
    if (!careerPreview || !D.CAREERS[careerPreview]) {
      toast('Please select a career first.', 'error');
      return;
    }
    if (careerPreview === state.careerId) {
      toast('This is already your target career.', 'info');
      go('dashboard');
      return;
    }
    const changing = hasCareer() && careerPreview !== state.careerId;
    if (changing) {
      const ok = await confirmDialog({
        title: 'Change target role?',
        message: 'Your roadmap will be rebuilt for ' + D.CAREERS[careerPreview].name + ' using your profile. Completed tasks in topics shared by both roles are kept.',
        confirmText: 'Change role'
      });
      if (!ok) return;
    }
    state.careerId = careerPreview;
    state.pendingCareer = null;
    saveState();
    const { kept } = regenerate();
    toast(changing ? 'Target role changed to ' + D.CAREERS[state.careerId].name + '. ' + kept + ' completed task(s) kept.' : D.CAREERS[state.careerId].name + ' selected. Your roadmap is ready.', 'success');
    go('roadmap');
  }

  /* ---- Roadmap ---- */
  function statusBadge(status) {
    const map = {
      review: ['Quick review', 'badge-good'],
      normal: ['Core', ''], project: ['Project', 'badge-purple'], interview: ['Interview', 'badge-soft']
    };
    const m = map[status] || map.normal;
    return '<span class="badge ' + m[1] + '">' + m[0] + '</span>';
  }

  function moduleCard(it, index, withDone) {
    const doneCount = it.tasks.filter(t => state.completed[t.id]).length;
    return '<article class="module-card status-' + it.status + '">' +
      '<div class="module-top"><span class="module-index">' + index + '</span><div class="module-title"><h4>' + esc(it.title) + '</h4>' +
      '<div class="meta">' + statusBadge(it.status) + '<span>&#9201; ' + formatHours(it.hours) + ' · about ' + it.days + ' day' + (it.days === 1 ? '' : 's') + '</span>' +
      (withDone ? '<span>' + doneCount + '/' + it.tasks.length + ' tasks done</span>' : '') + '</div></div></div>' +
      '<p class="why">' + esc(it.why) + '</p>' +
      (it.note ? '<p class="module-note">' + esc(it.note) + '</p>' : '') +
      '<details><summary>Practice tasks &amp; free resources</summary>' +
        '<h5>Practice tasks</h5><ul class="plain">' + it.tasks.map(t => '<li>' + esc(t.text) + '</li>').join('') + '</ul>' +
        (it.resources && it.resources.length ? '<h5>Free resources</h5><ul class="plain links">' + it.resources.map(r => '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.title) + '</a></li>').join('') + '</ul>' : '') +
      '</details></article>';
  }

  function renderRoadmap() {
    const host = $('#roadmapBody');
    const rm = currentRoadmap();
    const prog = progressOf(rm);
    let counter = 0;
    host.innerHTML =
      '<div class="page-head row-head"><div><h1>Your ' + esc(rm.career.name) + ' roadmap</h1>' +
        '<p>Built for <strong>' + esc(state.profile.name) + '</strong> · ' + esc(state.profile.degree) + ', ' + esc(state.profile.year) + ' · ' + esc(state.profile.level) + ' level' + (state.isDemo ? ' · <span class="badge badge-purple">Demo data</span>' : '') + '</p></div>' +
        '<div class="head-actions"><button type="button" class="btn btn-ghost btn-sm" data-action="regenerate">Regenerate roadmap</button><button type="button" class="btn btn-ghost btn-sm" data-action="print">Print / save PDF</button><button type="button" class="btn btn-primary btn-sm" data-action="go" data-to="dashboard">Track progress</button></div></div>' +
      '<div class="stat-grid">' +
        '<div class="stat"><span>Estimated duration</span><b>' + formatDuration(rm.weeks) + '</b><small>' + rm.totalDays + ' study days at ' + rm.daily + ' h/day</small></div>' +
        '<div class="stat"><span>Total study time</span><b>' + formatHours(rm.totalHours) + '</b><small>' + STUDY_DAYS_PER_WEEK + ' study days per week</small></div>' +
        '<div class="stat"><span>Learning modules</span><b>' + (rm.phases[0].items.length + rm.phases[1].items.length) + '</b><small>' + rm.projectIdeas.filter(p => p.recommended).length + ' projects · ' + rm.phases[3].items.length + ' interview steps</small></div>' +
        '<div class="stat"><span>Tasks</span><b>' + rm.totalTasks + '</b><small>' + prog.done + ' completed so far</small></div>' +
      '</div>' +
      (rm.warnings.length ? '<div class="callout warn">' + rm.warnings.map(w => '<p>' + esc(w) + '</p>').join('') + '</div>' : '') +
      '<section class="card why-card"><h3>Why this roadmap looks the way it does</h3>' +
        '<p class="muted">SkillPath uses simple, visible rules, not AI. These are the rules applied to your results:</p>' +
        '<ul class="ticks">' + rm.reasons.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul></section>' +
      rm.phases.map(p => {
        const cards = p.items.map(it => { counter += 1; return moduleCard(it, counter, false); }).join('');
        return '<section class="phase"><div class="phase-head"><div><h2>' + esc(p.name) + '</h2><p>' + esc(p.desc) + '</p></div>' +
          '<div class="phase-meta"><b>' + formatHours(p.hours) + '</b><span>~' + p.days + ' days</span></div></div><div class="module-grid">' + cards + '</div></section>';
      }).join('') +
      '<section class="phase"><div class="phase-head"><div><h2>All project ideas for ' + esc(rm.career.name) + '</h2><p>Recommended projects are part of Phase 3. Pick the others when you are ready for a challenge.</p></div></div>' +
        '<div class="grid grid-2">' + rm.projectIdeas.map(p => '<article class="card project-idea' + (p.recommended ? ' rec' : '') + '"><div class="meta"><span class="badge badge-soft">' + esc(p.level) + '</span>' + (p.recommended ? '<span class="badge badge-good">Recommended for you</span>' : '<span class="badge">Stretch goal</span>') + '</div><h4>' + esc(p.title) + '</h4><p>' + esc(p.desc) + '</p></article>').join('') + '</div></section>' +
      '<section class="phase"><div class="phase-head"><div><h2>Interview topics for ' + esc(rm.career.name) + '</h2><p>Questions interviewers commonly ask. Be ready to explain each in simple words.</p></div></div>' +
        '<div class="grid grid-3">' + rm.career.interview.map(g => '<article class="card"><h4>' + esc(g.group) + '</h4><ul class="plain">' + g.items.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul></article>').join('') + '</div></section>' +
      '<div class="form-actions spread"><button type="button" class="btn btn-ghost" data-action="edit-details">Edit my details</button><button type="button" class="btn btn-primary btn-lg" data-action="go" data-to="dashboard">Open my dashboard</button></div>';
  }

  /* ---- Dashboard ---- */
  function renderDashboard() {
    const host = $('#dashboardBody');
    const rm = currentRoadmap();
    const prog = progressOf(rm);
    host.innerHTML =
      '<div class="page-head row-head"><div><h1>Hello, ' + esc(state.profile.name) + '</h1>' +
        '<p>Target role: <strong>' + esc(rm.career.name) + '</strong> · ' + formatDuration(rm.weeks) + ' at ' + rm.daily + ' h/day' + (state.isDemo ? ' · <span class="badge badge-purple">Demo data</span>' : '') + '</p></div></div>' +
      '<div class="dash-top">' +
        '<div class="card progress-card">' + '<div id="dashRing">' + ring(prog.pct, 'complete') + '</div>' +
          '<div class="progress-stats">' +
            '<div><b id="statDone">' + prog.done + '</b><span>Completed</span></div>' +
            '<div><b id="statLeft">' + prog.remaining + '</b><span>Remaining</span></div>' +
            '<div><b id="statTotal">' + prog.total + '</b><span>Total tasks</span></div>' +
          '</div></div>' +
        '<div class="card"><h3>Phase progress</h3><div id="phaseBars">' + phaseBarsHtml(rm) + '</div></div>' +
      '</div>' +
      '<div class="toolbar"><div class="filter" role="group" aria-label="Filter tasks">' +
        '<button type="button" class="filter-btn active" data-action="filter" data-filter="all" aria-pressed="true">All</button>' +
        '<button type="button" class="filter-btn" data-action="filter" data-filter="remaining" aria-pressed="false">Remaining</button>' +
        '<button type="button" class="filter-btn" data-action="filter" data-filter="done" aria-pressed="false">Completed</button></div>' +
        '<div class="head-actions"><button type="button" class="btn btn-ghost btn-sm" data-action="go" data-to="roadmap">View full roadmap</button></div></div>' +
      '<div id="taskLists" data-filter="all">' + rm.phases.map(p =>
        '<section class="task-phase" data-phase="' + p.id + '"><h2>' + esc(p.name) + '</h2>' + p.items.map(it =>
          '<div class="task-group"><h4>' + esc(it.title) + ' <span class="group-count" data-group="' + esc(it.id) + '"></span></h4><ul class="tasks">' + it.tasks.map(t =>
            '<li class="task' + (state.completed[t.id] ? ' done' : '') + '"><label><input type="checkbox" class="task-check" data-task="' + esc(t.id) + '"' + (state.completed[t.id] ? ' checked' : '') + '><span class="check-box" aria-hidden="true"></span><span class="task-text">' + esc(t.text) + '</span></label></li>').join('') + '</ul></div>').join('') + '</section>').join('') +
        '<p class="empty-filter" id="emptyFilter" hidden>Nothing to show for this filter.</p></div>' +
      '<section class="card manage"><h3>Manage your plan</h3>' +
        '<p class="muted">Change anything without starting over. Completed tasks are kept wherever the same task still exists.</p>' +
        '<div class="manage-grid">' +
          '<button type="button" class="btn btn-ghost" data-action="edit-details">Edit student details</button>' +
          '<button type="button" class="btn btn-ghost" data-action="change-role">Change target role</button>' +
          '<button type="button" class="btn btn-ghost" data-action="regenerate">Regenerate roadmap</button>' +
        '</div>' +
        '<div class="danger-zone"><div><b>Danger zone</b><p class="muted small">These actions ask for confirmation first.</p></div>' +
          '<div class="head-actions"><button type="button" class="btn btn-outline-danger" data-action="reset-progress">Reset progress</button><button type="button" class="btn btn-danger" data-action="reset-all">Erase all my data</button></div></div>' +
      '</section>';
    updateDashboardStats();
  }

  function phaseBarsHtml(rm) {
    return rm.phases.map(p => {
      let total = 0; let done = 0;
      p.items.forEach(it => it.tasks.forEach(t => { total += 1; if (state.completed[t.id]) done += 1; }));
      const pct = total ? Math.round((done / total) * 100) : 0;
      return '<div class="topic-row"><div class="topic-label"><span>' + esc(p.name.replace(/^Phase \d: /, 'P' + p.id.slice(1) + ' · ')) + '</span><b>' + done + '/' + total + '</b></div>' + bar(pct) + '</div>';
    }).join('');
  }

  function updateDashboardStats() {
    const rm = currentRoadmap();
    const prog = progressOf(rm);
    const ringHost = $('#dashRing');
    if (ringHost) ringHost.innerHTML = ring(prog.pct, 'complete');
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setText('statDone', prog.done); setText('statLeft', prog.remaining); setText('statTotal', prog.total);
    const phaseHost = $('#phaseBars');
    if (phaseHost) phaseHost.innerHTML = phaseBarsHtml(rm);
    rm.phases.forEach(p => p.items.forEach(it => {
      const el = $('.group-count[data-group="' + it.id + '"]');
      if (el) el.textContent = it.tasks.filter(t => state.completed[t.id]).length + '/' + it.tasks.length;
    }));
    applyTaskFilter();
  }

  function applyTaskFilter() {
    const list = $('#taskLists');
    if (!list) return;
    const f = list.getAttribute('data-filter');
    let visible = 0;
    $$('.task', list).forEach(li => {
      const isDone = li.classList.contains('done');
      const show = f === 'all' || (f === 'done' && isDone) || (f === 'remaining' && !isDone);
      li.hidden = !show;
      if (show) visible += 1;
    });
    $$('.task-group', list).forEach(g => { g.hidden = !$$('.task', g).some(li => !li.hidden); });
    $$('.task-phase', list).forEach(s => { s.hidden = !$$('.task-group', s).some(g => !g.hidden); });
    const empty = $('#emptyFilter');
    if (empty) empty.hidden = visible > 0;
  }

  function onTaskToggle(input) {
    const id = input.getAttribute('data-task');
    if (input.checked) state.completed[id] = true; else delete state.completed[id];
    input.closest('.task').classList.toggle('done', input.checked);
    saveState();
    updateDashboardStats();
    const prog = progressOf(currentRoadmap());
    if (input.checked && prog.total > 0 && prog.done === prog.total) toast('Every task is complete. Outstanding work!', 'success');
  }

  /* ------------------------------------------------------------------
     6. ACTIONS, ROUTER & EVENT WIRING
     ------------------------------------------------------------------ */
  function loadDemo(id) {
    const sample = D.SAMPLES.find(s => s.id === id);
    if (!sample) return;
    state = freshState();
    state.profile = Object.assign({}, sample.profile);
    state.careerId = sample.careerId;
    state.isDemo = true;
    regenerate();
    toast('Demo loaded: ' + sample.profile.name + '. Explore, then reset or edit it to make it yours.', 'success');
    go('roadmap');
  }

  async function handleAction(action, el) {
    switch (action) {
      case 'start': go(nextStep()); break;
      case 'go': go(el.getAttribute('data-to')); break;
      case 'pick-career':
        if (hasProfile()) { careerSeed = el.getAttribute('data-id'); go('career'); }
        else { state.pendingCareer = el.getAttribute('data-id'); saveState(); toast(D.CAREERS[state.pendingCareer].name + ' noted. First, tell us about yourself.', 'info'); go('profile'); }
        break;
      case 'preview-career':
        careerPreview = el.getAttribute('data-id');
        $$('.career-option').forEach(b => { const on = b.getAttribute('data-id') === careerPreview; b.classList.toggle('selected', on); b.setAttribute('aria-checked', on); });
        renderCareerDetail();
        break;
      case 'load-demo': {
        if (hasProfile() && (Object.keys(state.completed).length || !state.isDemo)) {
          const ok = await confirmDialog({ title: 'Replace your current data?', message: 'Loading a demo will replace your saved profile and progress in this browser.', confirmText: 'Load demo', danger: true });
          if (!ok) return;
        }
        loadDemo(el.getAttribute('data-id'));
        break;
      }
      case 'edit-details': go('profile'); break;
      case 'change-role': careerSeed = state.careerId; go('career'); break;
      case 'regenerate': {
        const { kept, roadmap } = regenerate();
        toast('Roadmap regenerated: ' + roadmap.totalTasks + ' tasks, ' + kept + ' completed task(s) kept.', 'success');
        route();
        break;
      }
      case 'reset-progress': {
        const done = Object.keys(state.completed).length;
        if (!done) { toast('There is no progress to reset yet.', 'info'); return; }
        const ok = await confirmDialog({ title: 'Reset all progress?', message: 'This unticks all ' + done + ' completed task(s). Your profile and career stay as they are.', confirmText: 'Reset progress', danger: true });
        if (!ok) return;
        state.completed = {};
        saveState();
        toast('Progress reset.', 'success');
        renderDashboard();
        break;
      }
      case 'reset-all': {
        const ok = await confirmDialog({ title: 'Erase all your data?', message: 'This deletes your profile, career and progress from this browser. It cannot be undone.', confirmText: 'Erase everything', danger: true });
        if (!ok) return;
        clearStorage();
        state = freshState();
        careerPreview = null;
        toast('All data erased.', 'success');
        go('home');
        break;
      }
      case 'filter': {
        const list = $('#taskLists');
        list.setAttribute('data-filter', el.getAttribute('data-filter'));
        $$('.filter-btn').forEach(b => { const on = b === el; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
        applyTaskFilter();
        break;
      }
      case 'print': window.print(); break;
      default: break;
    }
  }

  const VIEWS = ['home', 'profile', 'career', 'roadmap', 'dashboard'];
  const HOME_ANCHORS = ['features', 'how-it-works', 'careers', 'demo', 'about'];

  function go(target) {
    if (location.hash === '#' + target) route();
    else location.hash = '#' + target;
  }

  function route() {
    let hash = (location.hash || '#home').slice(1);
    let anchor = null;
    if (HOME_ANCHORS.indexOf(hash) !== -1) { anchor = hash; hash = 'home'; }
    if (VIEWS.indexOf(hash) === -1) hash = 'home';

    if (!canAccess(hash)) {
      toast(blockedMessage(hash), 'error');
      const fallback = nextStep();
      if (location.hash !== '#' + fallback) { location.hash = '#' + fallback; return; }
      hash = fallback;
    }

    VIEWS.forEach(v => { $('#view-' + v).hidden = v !== hash; });
    renderSteppers();
    switch (hash) {
      case 'home': renderHome(); break;
      case 'profile': renderProfile(); break;
      case 'career': renderCareer(); break;
      case 'roadmap': renderRoadmap(); break;
      case 'dashboard': renderDashboard(); break;
      default: break;
    }
    updateNav(anchor || hash);
    closeNav();
    document.title = 'SkillPath - ' + ({ home: 'Your Personalized Path to a Software Career', profile: 'Student profile', career: 'Choose your career', roadmap: 'Your roadmap', dashboard: 'Progress dashboard' })[hash];
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
    } else {
      window.scrollTo(0, 0);
      const main = $('#main');
      if (main) main.focus({ preventScroll: true });
    }
  }

  function updateNav(active) {
    $$('.nav-menu a').forEach(a => {
      const on = a.getAttribute('data-nav') === active;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function closeNav() {
    const menu = $('#navMenu');
    const toggle = $('#navToggle');
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  function wireEvents() {
    document.addEventListener('click', event => {
      const el = event.target.closest('[data-action]');
      if (!el) return;
      event.preventDefault();
      handleAction(el.getAttribute('data-action'), el);
    });

    document.addEventListener('change', event => {
      if (event.target.classList && event.target.classList.contains('task-check')) onTaskToggle(event.target);
    });

    $('#profileForm').addEventListener('submit', onProfileSubmit);
    $('#careerConfirm').addEventListener('click', confirmCareer);

    $('#modalConfirm').addEventListener('click', () => closeModal(true));
    $('#modalCancel').addEventListener('click', () => closeModal(false));
    $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (!$('#modal').hidden) closeModal(false);
        else closeNav();
      }
      if (e.key === 'Tab' && !$('#modal').hidden) {
        const focusables = $$('#modal button');
        const first = focusables[0]; const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    $('#navToggle').addEventListener('click', () => {
      const menu = $('#navMenu');
      const open = menu.classList.toggle('open');
      $('#navToggle').setAttribute('aria-expanded', String(open));
      $('#navToggle').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    window.addEventListener('hashchange', route);
    // Expand the collapsed task/resource lists so they appear in printouts / saved PDFs.
    window.addEventListener('beforeprint', () => { $$('details').forEach(d => { d.open = true; }); });
  }

  function init() {
    if (START_FRESH) {
      // Demo / recording mode: every time the page is opened it starts from the Home page
      // with no saved data. Progress is still kept while the page stays open.
      clearStorage();
      state = freshState();
      if (location.hash && location.hash !== '#home') {
        try { history.replaceState(null, '', location.pathname + location.search + '#home'); }
        catch (err) { location.hash = '#home'; }
      }
    } else {
      state = loadState();
    }
    initProfileForm();
    wireEvents();
    route();
  }

  // Expose a tiny surface for automated tests.
  window.SkillPath = { buildRoadmap, validateProfile, getState: () => state, route };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
