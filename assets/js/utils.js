// ============================================================
// PCOS CARE HUB — Shared Utilities (utils.js)
// ============================================================

'use strict';

// ── Toast Notifications ──
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="margin-right:8px">${icons[type] || 'ℹ'}</span>${message}`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success(msg, d) { this.show(msg, 'success', d); },
  error(msg, d) { this.show(msg, 'error', d); },
  warning(msg, d) { this.show(msg, 'warning', d); },
};

// ── Page Loader ──
const PageLoader = {
  hide() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }
};

// ── Theme Management ──
const Theme = {
  init() {
    const savedTheme = localStorage.getItem('pcos_theme') || 'auto';
    this.apply(savedTheme);

    // Listen for system theme changes if in auto mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (localStorage.getItem('pcos_theme') === 'auto') {
        this.apply('auto');
      }
    });

    // Sync theme select dropdowns if they exist
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      themeSelect.value = savedTheme;
      themeSelect.addEventListener('change', (e) => {
        this.set(e.target.value);
      });
    }
  },
  set(theme) {
    localStorage.setItem('pcos_theme', theme);
    this.apply(theme);
    Toast.success(`Theme set to ${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`);
  },
  apply(theme) {
    let targetTheme = theme;
    if (theme === 'auto') {
      targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', targetTheme);
  },
  get() {
    return localStorage.getItem('pcos_theme') || 'auto';
  }
};

// ── Primary Color Management ──
const ColorTheme = {
  init() {
    const savedColor = localStorage.getItem('pcos_primary_color');
    if (savedColor) {
      this.apply(savedColor);
    }
  },
  set(color) {
    localStorage.setItem('pcos_primary_color', color);
    this.apply(color);
    Toast.success(`Primary color updated!`);
  },
  apply(color) {
    document.documentElement.style.setProperty('--purple-primary', color);
    // Also try to update the deep/mid variants slightly for better gradients
    // This is optional but makes the UI look better
    if (color === '#9370DB') { // Original Purple
      document.documentElement.style.setProperty('--purple-deep', '#5B2D8E');
    } else {
      // For other colors, just use the color itself for deep if we don't have a shaded version
      document.documentElement.style.setProperty('--purple-deep', color);
    }
  },
  get() {
    return localStorage.getItem('pcos_primary_color') || '#9370DB';
  }
};

// ── Font Size Management ──
const FontSize = {
  init() {
    const savedSize = localStorage.getItem('pcos_font_size') || 'medium';
    this.apply(savedSize);

    // Sync font size select dropdowns if they exist
    const fontSelect = document.getElementById('fontSizeSelect');
    if (fontSelect) {
      fontSelect.value = savedSize;
      fontSelect.addEventListener('change', (e) => {
        this.set(e.target.value);
      });
    }
  },
  set(size) {
    localStorage.setItem('pcos_font_size', size);
    this.apply(size);
    Toast.success(`Text size set to ${size.charAt(0).toUpperCase() + size.slice(1)}`);
  },
  apply(size) {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    document.documentElement.style.setProperty('--base-font-size', sizes[size] || '16px');
  },
  get() {
    return localStorage.getItem('pcos_font_size') || 'medium';
  }
};

// ── Localization (L10n) Management ──
const L10n = {
  translations: {
    en: {
      dashboard: "Dashboard",
      settings: "Settings",
      profile: "Profile",
      logout: "Logout",
      symptoms: "Track Symptoms",
      cycle: "Menstrual Cycle",
      reports: "My Reports",
      lifestyle: "Lifestyle Log",
      appointments: "Appointments",
      lab_results: "Lab Results",
      hospital: "My Hospital",
      welcome: "Welcome back",
      health_prefs: "Health Preferences",
      display_appearance: "Display & Appearance",
      language_region: "Language & Region",
      search_placeholder: "Search records...",
      last_cycle: "Last Cycle",
      next_period: "Next Period",
      lifestyle_score: "Lifestyle Score",
      hydration: "Hydration",
      weight: "Weight",
      mood: "Mood",
      sleep: "Sleep",
      todays_insights: "Today's Insights",
      upcoming_events: "Upcoming Events",
      quick_actions: "Quick Actions",
      track_pill: "Track Pill",
      log_water: "Log Water",
      add_symptom: "Add Symptom",
      daily_goal: "Daily Goal",
      average: "Average",
      view_all: "View All",
      cycle_length: "Cycle Length (days)",
      symptoms_logged: "Symptoms Logged",
      reports_total: "Reports Uploaded",
      appt_days: "Days to Appointment",
      recent_symptoms: "Recent Symptoms",
      recent_activity: "Recent Activity",
      health_progress: "Health Progress",
      welcome_subtitle: "Here's a summary of your PCOS management this week. Keep up the great work!",
      legend_period: "Period",
      legend_fertile: "Fertile",
      legend_ovulation: "Ovulation",
      legend_today: "Today",
      loading: "Loading...",
      cycle_label: "Cycle",
      flow: "Flow",
      no_cycle: "No cycle logged yet —",
      no_reports: "No reports yet —",
      no_visits: "No upcoming visits",
      start_tracking: "start tracking →",
      upload_one: "upload one →",
      meals_today: "Meals Today",
      water_ml: "Water (ml)",
      exercises: "Exercises",
      sleep_hrs: "Sleep (hrs)",
      water_goal: "Water Goal",
      upload_new_report: "Upload New Report",
      log_activities: "Log Today's Activities",
      log_meal: "Log Meal",
      log_exercise: "Log Exercise",
      log_sleep: "Log Sleep",
      patient_dashboard: "Patient Dashboard",
      track_symptoms_title: "Track Symptoms",
      log_your_symptoms: "Log Your Symptoms",
      search_symptoms: "Search symptoms...",
      date: "Date",
      time: "Time",
      physical_symptoms: "Physical Symptoms",
      cramps: "Cramps",
      fatigue: "Fatigue",
      headache: "Headache",
      bloating: "Bloating",
      skin_hair: "Skin & Hair",
      acne: "Acne",
      hair_loss: "Hair Loss",
      excess_hair_growth: "Excess Hair Growth",
      dark_patches: "Dark Patches",
      emotional_mental: "Emotional & Mental",
      mood_swings: "Mood Swings",
      anxiety: "Anxiety",
      depression: "Depression",
      stress: "Stress",
      reproductive: "Reproductive",
      irregular_period: "Irregular Period",
      heavy_bleeding: "Heavy Bleeding",
      light_bleeding: "Light Bleeding",
      pelvic_pain: "Pelvic Pain",
      overall_severity: "Overall Severity",
      mild: "Mild",
      moderate: "Moderate",
      severe: "Severe",
      additional_notes: "Additional Notes",
      notes_placeholder: "Any additional details about your symptoms...",
      save_symptoms: "Save Symptoms",
      cancel: "Cancel",
      symptom_history: "Symptom History",
      no_symptoms_logged: "No symptoms logged yet.",
      clear: "Clear",
      back: "Back",
      your_symptom_history: "Your Symptom History",
      weight_change: "Weight Change",
      joint_pain: "Joint Pain",
      hair_growth: "Excess Hair Growth",
      skin_darkening: "Dark Patches",
      section_main: "Main",
      section_health: "Health",
      section_account: "Account",
      current_phase: "Current Phase",
      period_duration_label: "Period Duration",
      predicted: "Predicted",
      cycle_calendar: "Monthly Cycle Calendar",
      previous: "Previous",
      next: "Next",
      sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat",
      period_start_date: "Period Start Date",
      period_end_date: "Period End Date",
      flow_intensity: "Flow Intensity",
      select_flow: "Select flow intensity...",
      light_flow: "Light",
      normal_flow: "Normal",
      heavy_flow: "Heavy",
      irregularities_mood_notes: "Note any irregularities, pain levels, mood changes...",
      save_cycle_data: "Save Cycle Data",
      cycle_history: "Cycle History",
      started_on: "Started on"
    },
    si: {
      dashboard: "පුවරුව",
      settings: "සැකසුම්",
      profile: "පැතිකඩ",
      logout: "ඉවත් වන්න",
      symptoms: "රෝග ලක්ෂණ",
      cycle: "ඔසප් චක්‍රය",
      reports: "වාර්තා",
      lifestyle: "ජීවන රටාව",
      appointments: "හමුවීම්",
      lab_results: "පරීක්ෂණ වාර්තා",
      hospital: "රෝහල",
      welcome: "නැවත සාදරයෙන් පිළිගනිමු",
      health_prefs: "සෞඛ්‍ය මනාප",
      display_appearance: "දර්ශනය සහ පෙනුම",
      language_region: "භාෂාව සහ කලාපය",
      search_placeholder: "සොයන්න...",
      last_cycle: "අවසාන චක්‍රය",
      next_period: "මීළඟ ඔසප් වීම",
      lifestyle_score: "ජීවන රටා ලකුණු",
      hydration: "ජල පරිභෝජනය",
      weight: "බර",
      mood: "මනෝභාවය",
      sleep: "නින්ද",
      todays_insights: "අද දින තොරතුරු",
      upcoming_events: "ඉදිරි සිදුවීම්",
      quick_actions: "කඩිනම් ක්‍රියා",
      track_pill: "ඖෂධ සටහන්",
      log_water: "ජලය සටහන්",
      add_symptom: "රෝග ලක්ෂණ එක් කරන්න",
      daily_goal: "දෛනික ඉලක්කය",
      average: "සාමාන්‍යය",
      view_all: "සියල්ල බලන්න",
      cycle_length: "චක්‍රයේ දිග (දින)",
      symptoms_logged: "සටහන් කළ රෝග ලක්ෂණ",
      reports_total: "වාර්තා එකතුව",
      appt_days: "හමුවීමට දින ගණන",
      recent_symptoms: "මෑත රෝග ලක්ෂණ",
      recent_activity: "මෑත ක්‍රියාකාරකම්",
      health_progress: "සෞඛ්‍ය ප්‍රගතිය",
      welcome_subtitle: "මෙම සතියේ ඔබගේ PCOS කළමනාකරණය පිළිබඳ සාරාංශයක් මෙන්න. දිගටම කරගෙන යන්න!",
      legend_period: "ඔසප් වීම",
      legend_fertile: "පලදායී කාලය",
      legend_ovulation: "අණ්ඩ මෝචනය",
      legend_today: "අද දින",
      loading: "පූරණය වෙමින් පවතී...",
      cycle_label: "චක්‍රය",
      flow: "ශ්‍රාවය",
      no_cycle: "තවමත් දත්ත ඇතුළත් කර නැත —",
      no_reports: "වාර්තා මෙතෙක් නැත —",
      no_visits: "ඉදිරි හමුවීම් නොමැත",
      start_tracking: "ලුහුබැඳීම ආරම්භ කරන්න →",
      upload_one: "එක් කරන්න →",
      meals_today: "අද දින ආහාර",
      water_ml: "ජලය (මි.ලී.)",
      exercises: "ව්‍යායාම",
      sleep_hrs: "නින්ද (පැය)",
      water_goal: "ජල ඉලක්කය",
      upload_new_report: "නව වාර්තාවක් උඩුගත කරන්න",
      log_activities: "අද දින ක්‍රියාකාරකම් සටහන් කරන්න",
      log_meal: "ආහාර සටහන්",
      log_exercise: "ව්‍යායාම සටහන්",
      log_sleep: "නින්ද සටහන්",
      patient_dashboard: "රෝගී පුවරුව",
      track_symptoms_title: "රෝග ලක්ෂණ ලුහුබැඳීම",
      log_your_symptoms: "ඔබේ රෝග ලක්ෂණ සටහන් කරන්න",
      search_symptoms: "රෝග ලක්ෂණ සොයන්න...",
      date: "දිනය",
      time: "වේලාව",
      physical_symptoms: "කායික රෝග ලක්ෂණ",
      cramps: "මස්පිඬු පෙරළීම",
      fatigue: "තෙහෙට්ටුව",
      headache: "හිසරදය",
      bloating: "බඩ පිපීම",
      skin_hair: "සම සහ හිසකෙස්",
      acne: "කුරුලෑ",
      hair_loss: "හිසකෙස් ගැලවී යාම",
      excess_hair_growth: "අධික රෝම වර්ධනය",
      dark_patches: "අඳුරු ලප",
      emotional_mental: "චිත්තවේගීය සහ මානසික",
      mood_swings: "මනෝභාවය වෙනස් වීම",
      anxiety: "කාංසාව",
      depression: "විෂාදය",
      stress: "ආතතිය",
      reproductive: "ප්‍රජනක",
      irregular_period: "අක්‍රමවත් ඔසප් වීම",
      heavy_bleeding: "අධික රුධිර වහනය",
      light_bleeding: "අඩු රුධිර වහනය",
      pelvic_pain: "ශ්‍රෝණි වේදනාව",
      overall_severity: "සමස්ත තීව්‍රතාවය",
      mild: "මෘදු",
      moderate: "මධ්‍යම",
      severe: "දරුණු",
      additional_notes: "අතිරේක සටහන්",
      notes_placeholder: "ඔබේ රෝග ලක්ෂණ පිළිබඳ අමතර තොරතුරු...",
      save_symptoms: "රෝග ලක්ෂණ සුරකින්න",
      cancel: "අවලංගු කරන්න",
      symptom_history: "රෝග ලක්ෂණ ඉතිහාසය",
      no_symptoms_logged: "තවමත් රෝග ලක්ෂණ සටහන් කර නැත.",
      clear: "මකන්න",
      back: "ආපසු",
      your_symptom_history: "ඔබේ රෝග ලක්ෂණ ඉතිහාසය",
      weight_change: "බර වෙනස් වීම",
      joint_pain: "සන්ධි වේදනාව",
      hair_growth: "අධික රෝම වර්ධනය",
      skin_darkening: "අඳුරු ලප",
      section_main: "ප්‍රධාන",
      section_health: "සෞඛ්‍ය",
      section_account: "ගිණුම",
      current_phase: "වත්මන් අවධිය",
      period_duration_label: "ඔසප් වීමේ කාලය",
      predicted: "අනුමාන කළ",
      cycle_calendar: "මාසික චක්‍ර දින දර්ශනය",
      previous: "පෙර",
      next: "මීළඟ",
      sun: "ඉරිදා", mon: "සඳුදා", tue: "අඟහරුදා", wed: "බදාදා", thu: "බ්‍රහස්පතින්දා", fri: "සිකුරාදා", sat: "සෙනසුරාදා",
      period_start_date: "ඔසප් වීම ආරම්භ වන දිනය",
      period_end_date: "ඔසප් වීම අවසන් වන දිනය",
      flow_intensity: "ශ්‍රාවයේ තීව්‍රතාවය",
      select_flow: "තීව්‍රතාවය තෝරන්න...",
      light_flow: "අඩු",
      normal_flow: "සාමාන්‍ය",
      heavy_flow: "අධික",
      irregularities_mood_notes: "අක්‍රමිකතා, වේදනා මට්ටම්, මනෝභාවය වෙනස්වීම් ආදිය සටහන් කරන්න...",
      save_cycle_data: "චක්‍ර දත්ත සුරකින්න",
      cycle_history: "චක්‍ර ඉතිහාසය",
      started_on: "ආරම්භ වූයේ"
    },
    ta: {
      dashboard: "டாஷ்போர்டு",
      settings: "அமைப்புகள்",
      profile: "சுயவிவரம்",
      logout: "வெளியேறு",
      symptoms: "அறிகுறிகள்",
      cycle: "மாதவிடாய் சுழற்சி",
      reports: "அறிக்கைகள்",
      lifestyle: "வாழ்க்கை முறை",
      appointments: "சந்திப்புகள்",
      lab_results: "ஆய்வக முடிவுகள்",
      hospital: "மருத்துவமனை",
      welcome: "மீண்டும் வருக",
      health_prefs: "சுகாதார விருப்பங்கள்",
      display_appearance: "தோற்றம் மற்றும் காட்சி",
      language_region: "மொழி மற்றும் பிராந்தியம்",
      search_placeholder: "தேடு...",
      last_cycle: "கடந்த சுழற்சி",
      next_period: "அடுத்த மாதவிடாய்",
      lifestyle_score: "வாழ்க்கை முறை மதிப்பெண்",
      hydration: "நீரேற்றம்",
      weight: "எடை",
      mood: "மனநிலை",
      sleep: "தூக்கம்",
      todays_insights: "இன்றைய நுண்ணறிவு",
      upcoming_events: "வரவிருக்கும் நிகழ்வுகள்",
      quick_actions: "விரைவான செயல்கள்",
      track_pill: "மாத்திரை பதிவு",
      log_water: "தண்ணீர் பதிவு",
      add_symptom: "அறிகுறி சேர்",
      daily_goal: "தினசரி இலக்கு",
      average: "சராசரி",
      view_all: "அனைத்தையும் பார்",
      cycle_length: "சுழற்சி நீளம் (நாட்கள்)",
      symptoms_logged: "அறிகுறிகள் பதிவு செய்யப்பட்டன",
      reports_total: "அறிக்கைகள் பதிவேற்றப்பட்டன",
      appt_days: "சந்திப்பிற்கான நாட்கள்",
      recent_symptoms: "சமீபத்திய அறிகுறிகள்",
      recent_activity: "சமீபத்திய செயல்பாடு",
      health_progress: "சுகாதார முன்னேற்றம்",
      welcome_subtitle: "இந்த வார உங்கள் பி.சி.ஓ.எஸ் செயல்பாடுகளின் சுருக்கம் இங்கே. தொடர்ந்து சிறப்பாகச் செய்யுங்கள்!",
      legend_period: "மாதவிடாய்",
      legend_fertile: "கருவுறுதல்",
      legend_ovulation: "கருமுட்டை வெளியேற்றம்",
      legend_today: "இன்று",
      loading: "ஏற்றப்படுகிறது...",
      cycle_label: "சுழற்சி",
      flow: "போக்கு",
      no_cycle: "இன்னும் தரவு இல்லை —",
      no_reports: "இன்னும் அறிக்கைகள் இல்லை —",
      no_visits: "வரவிருக்கும் சந்திப்புகள் இல்லை",
      start_tracking: "கண்காணிக்கத் தொடங்குங்கள் →",
      upload_one: "ஒன்றைப் பதிவேற்றவும் →",
      meals_today: "இன்றைய உணவுகள்",
      water_ml: "தண்ணீர் (மி.லி)",
      exercises: "உடற்பயிற்சிகள்",
      sleep_hrs: "தூக்கம் (மணி)",
      water_goal: "தண்ணீர் இலக்கு",
      upload_new_report: "புதிய அறிக்கையைப் பதிவேற்றவும்",
      log_activities: "இன்றைய செயல்பாடுகளைப் பதிவுசெய்க",
      log_meal: "உணவு பதிவு",
      log_exercise: "பயிற்சி பதிவு",
      log_sleep: "தூக்க பதிவு",
      patient_dashboard: "நோயாளி டாஷ்போர்டு",
      track_symptoms_title: "அறிகுறிகளைக் கண்காணித்தல்",
      log_your_symptoms: "உங்கள் அறிகுறிகளைப் பதிவுசெய்க",
      search_symptoms: "அறிகுறிகளைத் தேடுங்கள்...",
      date: "தேதி",
      time: "நேரம்",
      physical_symptoms: "உடல் அறிகுறிகள்",
      cramps: "தசைப்பிடிப்பு",
      fatigue: "சோர்வு",
      headache: "தலைவலி",
      bloating: "வீக்கம்",
      skin_hair: "சருமம் மற்றும் முடி",
      acne: "முகப்பரு",
      hair_loss: "முடி உதிர்தல்",
      excess_hair_growth: "அதிகப்படியான முடி வளர்ச்சி",
      dark_patches: "கருமையான திட்டுகள்",
      emotional_mental: "உணர்ச்சி மற்றும் மனநிலை",
      mood_swings: "மனநிலை மாற்றங்கள்",
      anxiety: "கவலை",
      depression: "மனச்சோர்வு",
      stress: "மன அழுத்தம்",
      reproductive: "இனப்பெருக்கம்",
      irregular_period: "ஒழுங்கற்ற மாதவிடாய்",
      heavy_bleeding: "அதிக இரத்தப்போக்கு",
      light_bleeding: "குறைவான இரத்தப்போக்கு",
      pelvic_pain: "இடுப்பு வலி",
      overall_severity: "ஒட்டுமொத்த தீவிரம்",
      mild: "லேசான",
      moderate: "மிதமான",
      severe: "கடுமையான",
      additional_notes: "கூடுதல் குறிப்புகள்",
      notes_placeholder: "உங்கள் அறிகுறிகளைப் பற்றிய கூடுதல் விவரங்கள்...",
      save_symptoms: "அறிகுறிகளைச் சேமிக்கவும்",
      cancel: "ரத்து செய்",
      symptom_history: "அறிகுறி வரலாறு",
      no_symptoms_logged: "இன்னும் அறிகுறிகள் பதிவு செய்யப்படவில்லை.",
      clear: "அழிக்கவும்",
      back: "பின்னால்",
      your_symptom_history: "உங்கள் அறிகுறி வரலாறு",
      weight_change: "எடை மாற்றம்",
      joint_pain: "மூட்டு வலி",
      hair_growth: "அதிகப்படியான முடி வளர்ச்சி",
      skin_darkening: "கருமையான திட்டுகள்",
      section_main: "முக்கிய",
      section_health: "சுகாதார",
      section_account: "கணக்கு",
      current_phase: "தற்போதைய நிலை",
      period_duration_label: "மாதவிடாய் காலம்",
      predicted: "கணிக்கப்பட்டது",
      cycle_calendar: "மாதாந்திர சுழற்சி காலண்டர்",
      previous: "முந்தைய",
      next: "அடுத்து",
      sun: "ஞாயிறு", mon: "திங்கள்", tue: "செவ்வாய்", wed: "புதன்", thu: "வியாழன்", fri: "வெள்ளி", sat: "சனி",
      period_start_date: "மாதவிடாய் தொடங்கும் தேதி",
      period_end_date: "மாதவிடாய் முடியும் தேதி",
      flow_intensity: "ஓட்ட செறிவு",
      select_flow: "செறிவைத் தேர்ந்தெடுக்கவும்...",
      light_flow: "லேசான",
      normal_flow: "சாதாரண",
      heavy_flow: "அதிகமான",
      irregularities_mood_notes: "ஏதேனும் முறையற்ற தன்மைகள், வலி நிலைகள், மனநிலை மாற்றங்களைக் கவனிக்கவும்...",
      save_cycle_data: "தரவைச் சேமிக்கவும்",
      cycle_history: "சுழற்சி வரலாறு",
      started_on: "தொடங்கியது"
    }
  },
  init() {
    const savedLang = localStorage.getItem('pcos_lang') || 'en';
    this.apply(savedLang);

    // Sync language select dropdowns
    const langSelect = document.getElementById('language');
    if (langSelect) {
      langSelect.value = savedLang;
      langSelect.addEventListener('change', (e) => {
        this.set(e.target.value);
      });
    }
  },
  set(lang) {
    localStorage.setItem('pcos_lang', lang);
    this.apply(lang);
    Toast.success(`Language changed!`);
    // Optional: Reload to apply all translations broadly
    setTimeout(() => location.reload(), 800);
  },
  apply(lang) {
    document.documentElement.setAttribute('lang', lang);
    const elements = document.querySelectorAll('[data-i18n]');
    const dict = this.translations[lang] || this.translations.en;
    
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          // If the element contains an <i> tag (icon), preserve it
          const icon = el.querySelector('i');
          if (icon) {
            // Keep the icon and update the text node after it
            const iconHtml = icon.outerHTML;
            el.innerHTML = `${iconHtml} ${dict[key]}`;
          } else {
            el.innerText = dict[key];
          }
        }
      }
    });
  },
  get() {
    return localStorage.getItem('pcos_lang') || 'en';
  }
};

// ── Intersection Observer Reveal ──
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.classList.add('revealed');
        observer.unobserve(el.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Navbar scroll effect ──
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // hamburger
  const ham = document.querySelector('.nav-hamburger');
  const drawer = document.querySelector('.nav-mobile-drawer');
  if (ham && drawer) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      drawer.classList.toggle('open');
    });
    // Close on link click
    drawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        ham.classList.remove('open');
        drawer.classList.remove('open');
      });
    });
  }
}

// ── Active Nav link highlighting ──
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

// ── Smooth scroll ──
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

// ── Count-up animation ──
function countUp(el, target, duration = 1800, suffix = '') {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const val = Math.floor(progress * target);
    el.textContent = val.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCountUps() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        countUp(el, target, 1600, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

// ── Tab switcher ──
function initTabs(containerSelector = '.info-tabs') {
  document.querySelectorAll(containerSelector).forEach(tabGroup => {
    tabGroup.querySelectorAll('.info-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        // deactivate all
        tabGroup.querySelectorAll('.info-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.info-panel').forEach(p => p.classList.remove('active'));
        // activate current
        tab.classList.add('active');
        const panel = document.getElementById('panel-' + target);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

// ── Sidebar for dashboards ──
function initSidebar() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!toggle || !sidebar) return;
  const open = () => { sidebar.classList.add('open'); overlay && (overlay.style.display = 'block'); };
  const close = () => { sidebar.classList.remove('open'); overlay && (overlay.style.display = 'none'); };
  toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay && overlay.addEventListener('click', close);
}

// ── Sidebar active item ──
function setSidebarActive() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

// ── Fake auth helper (localStorage demo) ──
const Auth = {
  login(user) {
    localStorage.setItem('pcos_user', JSON.stringify({ ...user, loggedIn: true }));
  },
  logout() {
    const userStr = localStorage.getItem('pcos_user');
    let target = 'index.html';
    try {
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') target = 'admin-login.html';
      }
    } catch (e) { }

    localStorage.removeItem('pcos_user');
    window.location.href = target;
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem('pcos_user')); } catch { return null; }
  },
  isLoggedIn() {
    const u = this.getUser();
    return u && u.loggedIn;
  }
};

// ── Progress bar animation ──
function animateProgressBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.progress-fill');
        if (fill) {
          const w = fill.dataset.width || '70%';
          setTimeout(() => fill.style.width = w, 100);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.progress-item').forEach(el => observer.observe(el));
}

// ── Upload area drag & drop ──
function initUploadArea(selector = '.upload-area') {
  document.querySelectorAll(selector).forEach(area => {
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area.addEventListener('drop', e => {
      e.preventDefault();
      area.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length) handleFileUpload(files, area);
    });
    area.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.pdf,.jpg,.jpeg,.png';
      input.addEventListener('change', () => { if (input.files.length) handleFileUpload(input.files, area); });
      input.click();
    });
  });
}
function handleFileUpload(files, area) {
  const file = files[0];
  const p = area.querySelector('.upload-text');
  if (p) p.innerHTML = `<span>✓ Uploaded:</span> ${file.name}`;
  Toast.success(`File "${file.name}" uploaded successfully!`);
}

// ── Symptom chip toggle ──
function initSymptomChips() {
  document.querySelectorAll('.symptom-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });
}

// ── Newsletter form ──
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      if (input && input.value) {
        Toast.success('Thank you for subscribing to PCOS Care Hub!');
        input.value = '';
      }
    });
  });
}

// ── HTML Escaping ──
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Session quality guard ──
// Returns the user object if the session is valid and complete.
// Returns null if there is no session or it lacks identifying fields.
// Does NOT redirect — let the callers decide what to do.
function checkSession() {
  const user = Auth.getUser();
  if (!user || !user.loggedIn) return null;
  // A valid session must have at least one of: id, email
  if (!user.id && !user.email) return null;
  return user;
}

// ── Global init ──
document.addEventListener('DOMContentLoaded', () => {
  PageLoader.hide();
  initReveal();
  initNavbar();
  setActiveNav();
  initSmoothScroll();
  initCountUps();
  initTabs();
  initSidebar();
  setSidebarActive();
  animateProgressBars();
  initUploadArea();
  initSymptomChips();
  initNewsletter();
  Toast.init();
  Theme.init();
  ColorTheme.init();
  FontSize.init();
  L10n.init();
});
