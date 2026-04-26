// ============================================================
// PCOS CARE HUB - Shared Utilities (utils.js)
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
    const icons = { success: '', error: '✖', warning: '⚠', info: 'ℹ' };
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

    // Initial injection of theme toggle if topbar exists
    this.injectToggle();

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
  injectToggle() {
    // Look for topbar actions to inject the toggle button
    const topActions = document.querySelector('.topbar-actions');
    if (topActions && !document.getElementById('globalThemeToggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'globalThemeToggle';
      toggleBtn.className = 'theme-toggle-btn';
      toggleBtn.title = 'Switch Theme';
      toggleBtn.innerHTML = this.getIcon();
      toggleBtn.onclick = () => this.toggle();
      
      // Insert before notifications button if possible
      const notifBtn = topActions.querySelector('.topbar-icon-btn');
      if (notifBtn) {
        topActions.insertBefore(toggleBtn, notifBtn);
      } else {
        topActions.appendChild(toggleBtn);
      }
    }
  },
  toggle() {
    const current = this.get();
    let next = 'dark';
    if (current === 'dark') next = 'light';
    else if (current === 'light') next = 'dark';
    else {
      // If auto, check current system state and flip it
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      next = systemIsDark ? 'light' : 'dark';
    }
    this.set(next);
    
    // Update icons on all toggle buttons
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(btn => btn.innerHTML = this.getIcon());
  },
  getIcon() {
    const current = document.documentElement.getAttribute('data-theme');
    return current === 'dark' ? '☀️' : '🌙';
  },
  set(theme) {
    localStorage.setItem('pcos_theme', theme);
    this.apply(theme);
    Toast.success(`Theme set to ${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`);
    
    // Sync settings dropdown if on settings page
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = theme;
  },
  apply(theme) {
    let targetTheme = theme;
    if (theme === 'auto') {
      targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', targetTheme);
    
    // Update all toggle icons if they exist
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(toggle => {
      toggle.innerHTML = this.getIcon();
    });
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
      notifications: "Notifications",
      messages: "Messages",
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
      patient_portal: "Patient Portal",
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
      cycle_label: "Cycle",
      status: "Status",
      started_on: "Started on",
      completed: "Completed",
      day: "Day",
      days: "days",
      regular: "Regular",
      irregular: "Irregular",
      save_cycle_data_success: "Cycle data saved successfully!",
      no_cycle_logged: "No cycle logged yet — click Menstrual Cycle to start.",
      regular_cycle: "Regular cycle",
      irregular_cycle: "Irregular cycle",
      log_first_cycle: "Log first cycle",
      cycle_logged_activity: "Menstrual cycle logged — {length}-day cycle, {flow} flow",
      loading_symptoms: "Loading recent symptoms...",
      loading_cycle: "Loading cycle activity...",
      exercise_goals: "Exercise Goals",
      diet_compliance: "Diet Compliance",
      water_intake: "Water Intake",
      daily_goal: "Daily Goal",
      glasses_logged: "Glasses Logged",
      blood_test_activity: "Blood test results uploaded by City Hospital",
      medical_documents: "My Medical Documents",
      upload_report: "Upload Report",
      filter_by_type: "ðŸ” Filter by type...",
      total_files: "Total Files",
      added_this_month: "Added This Month",
      added_this_year: "Added This Year",
      search_reports_placeholder: "Search by name or facility...",
      all_documents: "All Documents",
      all_lab_results: "All Lab Results",
      all_scans: "All Scans",
      loading_vault: "Accessing medical vault...",
      no_records_found: "No records found",
      no_records_msg: "You haven't uploaded any reports in this category yet.",
      upload_first_file: "Upload Your First File",
      save_medical_record: "Save Medical Record",
      report_name_label: "Report Name",
      report_type_label: "Report Type / Test",
      hospital_clinic_label: "Hospital / Clinic",
      doctor_requested_label: "Doctor Requested",
      attach_report_label: "Attach Report (PDF/Img)",
      permanently_remove: "Permanently Remove?",
      are_you_sure_remove: "Are you sure you want to remove this record?",
      ok_remove: "OK, Remove",
      no_back: "No, Back",
      view: "View",
      download: "Download",
      remove: "Remove",
      uploaded: "Uploaded",
      pending: "Pending",
      reviewed: "Reviewed",
      save_medical_record_success: "Medical record saved successfully!",
      record_removed_success: "Record removed successfully.",
      general_view: "General View",
      specific_lab_tests: "Specific Lab Tests",
      scans: "Scans",
      other: "Other",
      prescription: "Prescription",
      'LH (Luteinizing Hormone) Test': "LH (Luteinizing Hormone) Test",
      'FSH (Follicle Stimulating Hormone) Test': "FSH (Follicle Stimulating Hormone) Test",
      'Testosterone Level Test': "Testosterone Level Test",
      'Prolactin Test': "Prolactin Test",
      'Thyroid Function Test (TSH, T3, T4)': "Thyroid Function Test (TSH, T3, T4)",
      'Pelvic Ultrasound Scan': "Pelvic Ultrasound Scan",
      'Fasting Blood Sugar (FBS)': "Fasting Blood Sugar (FBS)",
      'Oral Glucose Tolerance Test (OGTT)': "Oral Glucose Tolerance Test (OGTT)",
      'HbA1c Test': "HbA1c Test",
      'Lipid Profile (Cholesterol Test)': "Lipid Profile (Cholesterol Test)",
      meals_today: "🥗 Meals Today",
      log_meal_title: "➕ Log a Meal",
      meal_type_label: "Meal Type *",
      meal_type_placeholder: "Select meal type...",
      breakfast: "🌅 Breakfast",
      lunch: "☀️ Lunch",
      dinner: "🌙 Dinner",
      snack: "ðŸŽ Snack",
      meal_name_label: "What did you eat? *",
      meal_name_placeholder: "e.g., Grilled chicken with quinoa salad",
      food_categories: "Food Categories",
      protein: "🥩 Protein",
      vegetables: "🥦 Vegetables",
      fruits: "ðŸ“ Fruits",
      grains: "🌾 Whole Grains",
      dairy: "🥛 Dairy",
      fats: "🥑 Healthy Fats",
      calories_label: "Calories (optional)",
      calories_placeholder: "e.g., 450",
      notes_label: "Notes",
      meal_notes_placeholder: "How did you feel after this meal? Any symptoms?",
      save_meal: "💾 Save Meal",
      meal_history: "📋 Meal History",
      no_meals_msg: "No meals logged yet",
      log_exercise_title: "➕ Log an Exercise",
      exercise_type_label: "Exercise Type *",
      exercise_type_placeholder: "Select type...",
      cardio: "ðŸƒ Cardio (Running, Cycling...)",
      strength: "💪 Strength Training",
      yoga: "🧘 Yoga",
      walking: "🚶 Walking",
      swimming: "ðŸŠ Swimming",
      stretching: "🤸 Stretching",
      exercise_name_label: "Exercise Name *",
      exercise_name_placeholder: "e.g., Morning jog in the park",
      duration_label: "Duration (min) *",
      intensity_label: "Intensity",
      light: "🟢 Light",
      moderate: "🟡 Moderate",
      vigorous: "🔴 Vigorous",
      calories_burned_label: "Calories Burned (estimated)",
      feel_notes_placeholder: "Energy level, any pain or discomfort...",
      save_exercise: "💾 Save Exercise",
      exercise_history: "📋 Exercise History",
      no_exercises_msg: "No exercises logged yet",
      log_water_title: "💧 Log Water Intake",
      quick_add: "Quick Add",
      small_glass: "Small glass",
      medium_glass: "Medium glass",
      large_glass: "Large glass",
      one_litre: "1 Litre",
      custom_water_label: "Or enter custom amount (ml)",
      custom_water_placeholder: "Enter amount in ml",
      today_intake_goal: "Today's intake · Goal: 2,500 ml",
      water_goal_reached: "of daily goal",
      water_history: "💧 Water Log History",
      no_water_msg: "No water logged today",
      log_sleep_title: "😴 Log Sleep",
      sleep_date_label: "Sleep Date *",
      sleep_quality_label: "Sleep Quality",
      poor: "😟 Poor (Very restless)",
      fair: "ðŸ˜ Fair (Some disturbances)",
      good: "🙂 Good (Mostly restful)",
      excellent: "😄 Excellent (Very restful)",
      bedtime_label: "Bedtime *",
      waketime_label: "Wake Time *",
      hours_slept_label: "Hours Slept (auto-calculated)",
      sleep_duration_placeholder: "Set bedtime & wake time above",
      sleep_notes_placeholder: "Factors that affected your sleep? (caffeine, stress, environment...)",
      save_sleep: "💾 Save Sleep",
      sleep_history: "📋 Sleep History",
      no_sleep_msg: "No sleep logs yet",
      total: "total",
      pending_status: "⏳ Pending",
      reviewed_status: "Reviewed",
      uploaded_status: "Uploaded",
      no_upcoming_visits: "No upcoming visits",
      upload_first_report: "Upload first report",
      report_uploaded_activity: "New medical report uploaded: {name}",
      meal_logged_activity: "{type} logged: {name}",
      exercise_logged_activity: "Exercise logged: {name} ({duration} min)",
      water_logged_activity: "Water intake updated: {total}ml total today",
      sleep_logged_activity: "Sleep logged: {duration} hours ({quality})",
      appointment_activity: "Upcoming appointment: {reason} at {hospital}",
      appointment_today: "Appointment today: {reason} at {hospital}",
      appointment_missed: "Missed appointment: {reason} at {hospital}",
      records: "records",
      records_today: "records today",
      amount: "Amount",
      day_total: "Day Total",
      logged_at: "Logged At",
      action: "Action",
      log_meal_hint: "Fill the form above and hit Save Meal",
      log_exercise_hint: "Start moving and log your first workout",
      log_water_hint: "Click a button above to start logging",
      log_sleep_hint: "Log your sleep data above",
      clinic: "Clinic",
      error_occurred: "An error occurred.",
      track_lifestyle_title: "Track Your Lifestyle 🌱",
      track_lifestyle_desc: "Monitor your diet, exercise, hydration, and sleep to manage your PCOS symptoms effectively.",
      manage_visits: "Manage your clinic visits and consultations",
      health_schedule_title: "Your Health Schedule 📅",
      health_schedule_subtitle: "Keep track of your medical visits. Regular check-ups are key to effective PCOS management.",
      upcoming: "Upcoming",
      total_visits: "Total Visits",
      book_appointment: "➕ Book Appointment",
      all_appointments: "All Appointments",
      history: "History",
      no_appts_found: "No Appointments Found",
      no_appts_msg: "You haven't scheduled any clinic visits yet. <br> Use the form on the right to book your first appointment!",
      schedule_new: "Schedule New",
      hospital_name: "Hospital Name",
      enter_hospital: "Enter Hospital/Clinic",
      doctor_name: "Doctor Name",
      dr_name_optional: "Dr. Name (Optional)",
      visit_type: "Visit Type",
      consultation: "Consultation",
      'pcos-check-up': "PCOS Check-up",
      'follow-up': "Follow-up",
      'lab-test': "Lab/Scan",
      reason_notes: "Reason / Notes",
      visit_reason_placeholder: "What is the visit for?",
      save_appointment: "💾 Save Appointment",
      reschedule_visit: "Reschedule Visit 🕒",
      reschedule_msg: "Please pick a new date and time for your consultation.",
      new_date: "New Date",
      new_time: "New Time",
      update_schedule: "Update Schedule",
      medical_officer: "Medical Officer",
      reschedule: "🕒 Reschedule",
      cancel_visit: "✖ Cancel",
      upcoming: "Upcoming",
      completed: "Completed",
      cancelled: "Cancelled",
      rescheduled: "Rescheduled",
      at: "at",
      lab_results_title: "Lab Results",
      total_results: "Total Results",
      added_this_month: "Added This Month",
      added_this_year: "Added This Year",
      search_lab_placeholder: "Search by test, lab, or category...",
      all_lab_results: "All Lab Results",
      received_only: "Received Only",
      pending_only: "Pending Only",
      loading_medical_records: "Retrieving your medical records...",
      no_lab_results_found: "No lab results found",
      no_lab_results_msg: "Your diagnostic records will appear here once uploaded or received from labs.",
      upload_first_result: "📤 Upload First Result",
      upload_lab_result_title: "📤 Upload Lab Result",
      test_name_label: "Test Name *",
      test_category_label: "Test Category",
      hospital_clinic_label: "Hospital / Clinic",
      doctor_requested_label: "Doctor Requested",
      test_date_label: "Test Date *",
      attach_file_label: "Attach PDF or Image",
      click_to_select: "Click to select file",
      save_medical_result: "Save Medical Result",
      remove_result_title: "Remove Result?",
      remove_result_msg: "Are you sure you want to remove this diagnostic result?",
      medical_documents_title: "My Medical Documents",
      upload_report: "📤 Upload Report",
      total_files: "Total Files",
      search_reports_placeholder: "Search by name or facility...",
      filter_by_type: "ðŸ” Filter by type...",
      accessing_vault: "Accessing medical vault...",
      no_records_found: "No records found",
      no_records_msg: "You haven't uploaded any reports in this category yet.",
      upload_first_file: "📤 Upload Your First File",
      upload_document_title: "📤 Upload Document",
      report_name_label: "Report Name *",
      report_type_label: "Report Type / Test *",
      attach_report_label: "Attach Report (PDF/Img)",
      save_medical_record: "Save Medical Record",
      upload_document_title: "📤 Upload Document",
      report_name_placeholder: "e.g. Thyroid Profile, Pelvic Scan",
      hospital_name_placeholder: "e.g. Apollo Hospital",
      doctor_name_placeholder: "e.g. Dr. Silva",
      permanently_remove: "Permanently Remove?",
      are_you_sure_remove: "Are you sure you want to remove this medical record?",
      ok_remove: "OK, Remove",
      no_back: "No, Back",
      syncing: "Syncing...",
      my_hospital_title: "My Registered Hospital",
      manage_healthcare: "Manage your healthcare providers",
      hospital_hero_title: "Find Your Best Healthcare ðŸ¥",
      hospital_hero_desc: "Register with your primary hospital and specialist clinic to keep all your medical care in one place.",
      register_new_hospital: "Register New Hospital",
      fetching_hospitals: "Fetching your registered hospitals...",
      register_new_title: "Register New",
      hospital_name_label: "Hospital Name *",
      specialist_doctor_label: "Specialist Doctor",
      address_label: "Address",
      contact_number_label: "Contact Number *",
      email_label: "Email",
      set_primary_label: "Set as Primary Hospital",
      register_hospital_btn: "Register Hospital",
      no_hospitals_registered: "No hospitals registered yet. Register your first clinic on the right!",
      primary_provider_badge: "Primary Provider",
      special_care: "Special Care",
      remove: "Remove",
      make_primary: "Make Primary",
      hospital_registered_success: "Hospital registered successfully!",
      primary_provider_updated: "Primary provider updated!",
      hospital_removed: "Hospital removed",
      hospital_registered_activity: "Registered with hospital: {name}",
      removed_from_both: "This also removes it from your Reports list",
      profile_title: "My Profile",
      profile_subtitle: "Manage your personal and medical information",
      personal_info: "Personal Information",
      full_name_label: "Full Name",
      email_address_label: "Email Address",
      phone_number_label: "Phone Number",
      dob_label: "Date of Birth",
      gender_label: "Gender",
      blood_group_label: "Blood Group",
      security_password: "Security & Password",
      current_password: "Current Password",
      new_password: "New Password",
      confirm_new_password: "Confirm New Password",
      update_password_btn: "Update Password",
      data_management: "Data & Portability",
      download_data_json: "Download My Data (JSON)",
      export_summary_csv: "Export Medical Summary (CSV)",
      download_health_doc: "Personalized Health Document (TXT)",
      danger_zone: "Danger Zone",
      deactivate_account: "Deactivate Account",
      confirm_deactivation_title: "Confirm Deactivation",
      deactivate_msg: "If this account is not logged into within 30 days, it will be permanently deleted.",
      enter_password_confirm: "Please enter your password to confirm deactivation:",
      confirm_logout: "Confirm & Logout",
      keep_account: "Keep My Account",
      edit_personal_info_btn: "Edit Personal Info",
      save_changes_btn: "Save Changes",
      profile_address: "Address",
      not_provided: "Not provided",
      unknown_blood: "Unknown",
      female: "Female",
      male: "Male",
      other_gender: "Other",
      profile_updated_success: "Profile updated!",
      password_changed_success: "Password changed successfully!",
      account_deactivated_success: "Your account has been deactivated successfully. Logging out...",
      
      // Public Pages
      nav_home: "Home",
      nav_about: "About Us",
      nav_features: "Features",
      nav_pcos_info: "PCOS Info",
      nav_hospitals: "Hospitals",
      nav_blog: "Blog",
      nav_contact: "Contact",
      nav_login: "Log In",
      nav_signup: "Get Connected",
      nav_get_connected: "Get Connected",
      nav_records: "Secure Health Records",
      lang_changed_toast: "Language changed successfully!",

      // Blog Page
      blog_hero_title: "PCOS Knowledge Center",
      blog_hero_desc: "Evidence-based articles, tips, and guides to help you understand and manage PCOS better every day.",
      blog_tag_diet: "Diet & Nutrition",
      blog_tag_exercise: "Exercise",
      blog_tag_mental: "Mental Health",
      blog_tag_hormones: "Hormones",
      blog_tag_fertility: "Fertility",
      blog_tag_wellness: "Wellness",
      blog_read_more: "Read More →",
      blog_title_1: "The Best Anti-Inflammatory Diet for PCOS Management",
      blog_desc_1: "Discover how a low-glycaemic, anti-inflammatory diet can help manage insulin resistance, reduce androgen levels, and improve hormonal balance in PCOS.",
      blog_date_1: "Feb 20, 2026",
      blog_read_time_1: "6 min read",
      blog_title_2: "Exercise Guide for Women with PCOS: What Works Best",
      blog_desc_2: "A combination of strength training and cardio can significantly improve insulin sensitivity, support weight management, and reduce PCOS symptoms.",
      blog_date_2: "Feb 15, 2026",
      blog_read_time_2: "5 min read",
      blog_title_3: "Managing Anxiety and Depression Linked to PCOS",
      blog_desc_3: "PCOS significantly increases the risk of depression and anxiety. Learn practical strategies for mental wellness including CBT, mindfulness, and community support.",
      blog_date_3: "Feb 10, 2026",
      blog_read_time_3: "7 min read",
      blog_title_4: "Understanding Insulin Resistance in PCOS",
      blog_desc_4: "Up to 70% of women with PCOS have insulin resistance. Learn how it affects your body, why it matters, and what you can do about it through lifestyle and medical approaches.",
      blog_date_4: "Feb 5, 2026",
      blog_read_time_4: "8 min read",
      blog_title_5: "PCOS and Fertility: What You Need to Know",
      blog_desc_5: "PCOS is one of the leading causes of female infertility, but most women with PCOS can conceive with the right treatment. Understand your options from lifestyle to IVF.",
      blog_date_5: "Jan 28, 2026",
      blog_read_time_5: "9 min read",
      blog_title_6: "Why Sleep Is Critical for PCOS Management",
      blog_desc_6: "Poor sleep worsens insulin resistance, disrupts hormone balance, and increases cortisol in PCOS. Discover evidence-backed sleep hygiene strategies tailored for PCOS.",
      blog_date_6: "Jan 22, 2026",
      blog_read_time_6: "5 min read",
      
      hero_badge_text: "Sri Lanka's #1 PCOS Platform",
      hero_title_main: "Manage PCOS",
      hero_title_highlight: "Smarter & Safer",
      hero_desc_text: "A comprehensive platform for Sri Lankan women to manage PCOS smartly and securely — track symptoms, connect with hospitals, and access your health records anytime.",
      hero_stat_reports: "Reports Uploaded",
      hero_stat_patients: "Patients Supported",
      hero_stat_hospitals: "Partner Hospitals",
      about_badge_num: "8–13%",
      about_badge_lbl: "of women affected by PCOS worldwide",
      btn_get_started: "Get Started Free",
      btn_learn_more: "Learn More",
      trust_free: "Free to join",
      trust_secure: "Secure & Private",
      trust_hospital: "Hospital Integrated",
      
      choose_language: "Choose Language:",
      
      footer_about_title: "About PCOS Care Hub",
      footer_about_desc: "Sri Lanka's first dedicated digital healthcare platform for PCOS management. Empowering women through technology and secure health data.",
      footer_links_title: "Quick Links",
      footer_legal_title: "Legal & Privacy",
      footer_contact_title: "Contact Us",
      footer_copyright: "All Rights Reserved.",
      
      feature_section_title: "Everything You Need to Manage PCOS",
      feature_section_subtitle: "Powerful features designed for patients, healthcare providers, and clinics to work together.",
      feature_1_title: "Symptom Tracking",
      feature_1_desc: "Log your daily symptoms, cycle changes, and mood to see long-term patterns and triggers.",
      feature_2_title: "Secure Health Vault",
      feature_2_desc: "Upload and organize all your medical reports, scans, and lab results in one encrypted place.",
      feature_3_title: "Hospital Integration",
      feature_3_desc: "Connect directly with leading clinics and hospitals in Sri Lanka for seamless data sharing.",
      feature_4_title: "Lifestyle Logs",
      feature_3_desc: "Connect directly with leading clinics and hospitals in Sri Lanka for seamless data sharing.",
      feature_4_title: "Lifestyle Logs",
      feature_4_desc: "Monitor your nutrition, exercise, water intake, and sleep quality to improve hormonal balance.",
      
      stat_patients_reg: "Patients Registered",
      stat_sat_rate_short: "Patient Satisfaction",
      how_works_title_small: "How It Works",
      roles_title_small: "User Roles",
      // Home Page Sections
      about_hub_title: "About PCOS Care Hub",
      about_hub_text_1: "Polycystic Ovary Syndrome (PCOS) is a chronic hormonal condition affecting 8–13% of women of reproductive age. In Sri Lanka, many women struggle with fragmented paper-based records, limited doctor-patient communication, and lack of a centralized management system.",
      about_hub_text_2: "PCOS Care Hub was built specifically to address these gaps — offering a secure, web-based platform where patients, hospitals, and administrators all work together in one unified ecosystem.",
      portal_title: "Patient Portal",
      portal_desc: "Track symptoms, menstrual cycles, lifestyle data, upload reports and view your health timeline.",
      interface_title: "Hospital Interface",
      interface_desc: "Manage lab results, consultations, and patient records under controlled, role-based access.",
      admin_title: "Admin Dashboard",
      admin_desc: "Full system oversight, hospital approvals, user management and audit logs.",
      btn_join: "Join PCOS Care Hub",
      
      platform_features_title: "Platform Features",
      features_main_title: "Everything You Need to Manage PCOS",
      features_main_subtitle: "Comprehensive tools designed for patients, hospitals, and administrators to work together seamlessly.",
      feat_symptom_title: "Symptom Tracking",
      feat_symptom_desc: "Log daily symptoms like irregular periods, acne, hair loss, fatigue and mood changes. Visualize patterns over time with intuitive charts and trend analysis.",
      feat_cycle_title: "Menstrual Cycle Tracker",
      feat_cycle_desc: "Track cycle length, flow intensity, and predict ovulation windows. Log period dates and receive smart reminders for upcoming cycles and appointments.",
      feat_records_title: "Secure Medical Records",
      feat_records_desc: "Upload, store and share lab reports, ultrasound scans, and prescriptions securely. No more lost paper records — your history is always accessible.",
      feat_hosp_title: "Hospital Integration",
      feat_hosp_desc: "Hospitals can post lab results directly to patient profiles, manage consultations, and ensure physicians have complete, accurate medical histories.",
      feat_lifestyle_title: "Lifestyle & Nutrition Log",
      feat_lifestyle_desc: "Track your daily meals, water intake, exercise routines and sleep quality. Get personalized lifestyle insights based on PCOS management guidelines.",
      feat_role_title: "Role-Based Access Control",
      feat_role_desc: "Three distinct user roles — Patient, Hospital, Administrator — with carefully controlled permissions ensuring data privacy and HIPAA-compliant security.",
      
      knowledge_center: "PCOS Knowledge Center",
      knowledge_title: "Everything You Need to Know About PCOS",
      knowledge_subtitle: "Evidence-based information to help you understand, manage, and thrive with PCOS.",
      know_symptoms: "Symptoms",
      know_causes: "Causes",
      know_treatment: "Treatment",
      know_diet: "Diet & Lifestyle",
      know_mental: "Mental Health",
      
      symp_periods_title: "Irregular Periods",
      symp_periods_desc: "Having fewer than 8 menstrual cycles per year, cycles longer than 35 days, or complete absence of menstruation. This is one of the most common PCOS symptoms.",
      symp_androgen_title: "Excess Androgen",
      symp_androgen_desc: "Elevated male hormones causing excess facial/body hair (hirsutism), severe acne, and male-pattern baldness or thinning hair on the scalp.",
      symp_ovaries_title: "Polycystic Ovaries",
      symp_ovaries_desc: "Enlarged ovaries containing many small fluid-filled sacs (follicles) that surround the eggs, visible on ultrasound. Despite the name, cysts may not always be present.",
      symp_weight_title: "Weight Changes",
      symp_weight_desc: "Unexplained weight gain, especially around the abdomen, or difficulty losing weight despite diet and exercise. Insulin resistance is often a contributing factor.",
      symp_fatigue_title: "Fatigue & Sleep Issues",
      symp_fatigue_desc: "Persistent tiredness, low energy, and difficulty sleeping are common in PCOS, often linked to hormonal imbalances and insulin resistance.",
      symp_mood_title: "Mood Changes",
      symp_mood_desc: "Higher rates of depression, anxiety, and mood swings are associated with PCOS due to hormonal fluctuations and the emotional impact of chronic illness.",
      
      cause_insulin_title: "Insulin Resistance",
      cause_insulin_desc: "Up to 70% of women with PCOS have insulin resistance. When cells don't respond properly to insulin, the pancreas produces more, which can stimulate excess androgen production.",
      cause_genetics_title: "Genetics",
      cause_genetics_desc: "PCOS tends to run in families. If your mother or sister has PCOS, you have a significantly higher risk. Multiple genes are likely involved, making it a complex genetic condition.",
      cause_hormone_title: "Hormonal Imbalance",
      cause_hormone_desc: "Excess production of androgens (male hormones) disrupts follicle development, preventing regular ovulation. LH and FSH imbalances also contribute to cycle irregularities.",
      cause_inflammation_title: "Inflammation",
      cause_inflammation_desc: "Low-grade chronic inflammation is common in PCOS and may stimulate polycystic ovaries to produce androgens. Diet, lifestyle, and gut health all play roles.",
      
      treat_pill_title: "Hormonal Contraceptives",
      treat_pill_desc: "Combined oral contraceptives help regulate menstrual cycles, reduce androgen levels, clear acne, and decrease hair growth. Often first-line treatment for cycle irregularities.",
      treat_metformin_title: "Metformin",
      treat_metformin_desc: "An insulin-sensitizing medication that can improve insulin resistance, help regulate menstrual cycles, support weight management, and reduce long-term diabetes risk.",
      treat_lifestyle_title: "Lifestyle Therapy",
      treat_lifestyle_desc: "Even 5–10% weight loss can significantly improve PCOS symptoms, restore ovulation, and reduce health risks. Regular exercise and a balanced diet are foundational treatments.",
      treat_fertility_title: "Fertility Treatments",
      treat_fertility_desc: "For women trying to conceive, options include ovulation induction (Clomifene, Letrozole), Gonadotropins, and in some cases, laparoscopic ovarian drilling.",
      
      diet_gi_title: "Low Glycaemic Diet",
      diet_gi_desc: "Foods that don't spike blood sugar — whole grains, legumes, vegetables, and fruits — help manage insulin resistance. Avoid white rice, refined flour, and sugary drinks.",
      diet_anti_title: "Anti-Inflammatory Foods",
      diet_anti_desc: "Include fatty fish (salmon, mackerel), leafy greens, berries, nuts, and olive oil. Omega-3 fatty acids can reduce androgen levels and improve insulin sensitivity.",
      diet_exercise_title: "Regular Exercise",
      diet_exercise_desc: "Aim for 150+ minutes of moderate activity weekly. Strength training improves insulin sensitivity; cardio helps with weight management. Even brisk walking makes a difference.",
      diet_sleep_title: "Sleep & Stress Management",
      diet_sleep_desc: "Poor sleep worsens insulin resistance and hormonal balance. Aim for 7–9 hours. Stress-reduction techniques like yoga, meditation, and mindfulness can help regulate cortisol.",
      
      mental_anxiety_title: "Depression & Anxiety",
      mental_anxiety_desc: "Women with PCOS are significantly more likely to experience depression and anxiety. Hormonal fluctuations, body image concerns, and fertility worries all contribute. Seeking support is vital.",
      mental_image_title: "Body Image & Self-Esteem",
      mental_image_desc: "Visible symptoms like acne, hair changes, and weight gain can affect self-confidence. PCOS Care Hub connects you with supportive communities and resources to build resilience.",
      mental_support_title: "Support Networks",
      mental_support_desc: "Connecting with others who have PCOS reduces isolation and improves mental wellbeing. Online communities, local support groups, and therapy can all make a meaningful difference.",
      mental_cbt_title: "Cognitive Behavioral Therapy",
      mental_cbt_desc: "CBT has shown evidence for improving depression, anxiety, and body image in PCOS. Don't hesitate to speak with a mental health professional who understands chronic conditions.",
      
      stat_women_global: "Women Affected Globally",
      stat_prev_sl: "Prevalence in Sri Lanka",
      stat_partner_hosp: "Partner Hospitals",
      stat_sat_rate: "Patient Satisfaction Rate",
      
      how_works_title: "Get Started in 4 Simple Steps",
      how_works_subtitle: "Join thousands of Sri Lankan women already managing their PCOS smarter.",
      step_1_title: "Create Account",
      step_1_desc: "Sign up as a Patient or Hospital in minutes with secure email verification.",
      step_2_title: "Build Your Profile",
      step_2_desc: "Enter your health history, connect with your hospital, and upload existing medical records.",
      step_3_title: "Track & Monitor",
      step_3_desc: "Log daily symptoms, cycles, meals and activity. Watch your health patterns emerge.",
      step_4_title: "Connect with Care",
      step_4_desc: "Share records with your hospital, receive lab results, and attend consultations with complete data.",

      testimonials_title: "What Our Users Say",
      testimonial_1_text: "\"PCOS Care Hub has completely changed how I manage my condition. I no longer worry about losing reports — everything is safe and accessible. My doctor at the hospital can see my full history now.\"",
      role_patient_colombo: "Patient, Colombo",
      testimonial_2_text: "\"As a gynaecologist, having patients' full symptom history and uploaded reports through the hospital portal has dramatically improved my consultations. Clinical decisions are now data-driven.\"",
      role_doctor_kandy: "Gynaecologist, Kandy",
      testimonial_3_text: "\"The cycle tracker and symptom logging features are excellent. I can see patterns I never noticed before. The lifestyle tracking helps me stay on track with my diet and exercise goals.\"",
      role_patient_gampaha: "Patient, Gampaha",
      btn_add_review: "✍️ Add Your Review",
      review_modal_title: "Share Your Experience",
      full_name_label: "Your Name",
      full_name_placeholder: "Ex: Amanda Perera",
      rev_role_label: "Role / Location",
      rev_role_placeholder: "Ex: Patient, Colombo",
      rating_label: "Rating",
      rating_5: "★★★★★ (5/5 Stars)",
      rating_4: "★★★★☆ (4/5 Stars)",
      rating_3: "★★★☆☆ (3/5 Stars)",
      rating_2: "★★☆☆☆ (2/5 Stars)",
      rating_1: "★☆☆☆☆ (1/5 Star)",
      rev_text_label: "Your Honest Review",
      rev_text_placeholder: "Tell us how PCOS Care Hub helped you...",
      btn_submit_review: "Submit Review",
      review_success_msg: "Thank you for adding review!",

      footer_tagline: "Sri Lanka's first dedicated digital platform for managing Polycystic Ovary Syndrome — empowering patients and healthcare providers with secure, connected care.",
      footer_links_title: "Quick Links",
      footer_resources_title: "PCOS Resources",
      footer_stay_updated: "Stay Updated",
      footer_newsletter_desc: "Get the latest PCOS news, research, and wellness tips delivered to your inbox.",
      footer_email_placeholder: "Your email address",
      footer_subscribe_btn: "Subscribe",
      footer_no_spam: "No spam, unsubscribe anytime",
      footer_patients_reg: "Patients Registered",
      footer_partner_hosp: "Partner Hospitals",
      footer_sat_rate_short: "Patient Satisfaction",
      footer_copy: "Built with ♥ for Sri Lankan Women's Health.",
      footer_rights: "All rights reserved.",
      footer_privacy: "Privacy Policy",
      footer_terms: "Terms of Service",
      footer_cookies: "Cookie Policy",

      res_understanding: "Understanding PCOS",
      res_symptom_checker: "Symptom Checker",
      res_diet: "Diet & Nutrition",
      res_exercise: "Exercise Guide",
      res_mental: "Mental Wellness",
      res_faqs: "FAQs",
      appearance: "Appearance",
      
      roles_title: "Built for Everyone in the PCOS Journey",
      role_patient_title: "Patient Login",
      role_patient_subtitle: "Take control of your health journey with powerful self-management tools.",
      role_patient_feat_1: "Symptom & cycle tracking",
      role_patient_feat_2: "Upload & manage reports",
      role_patient_feat_3: "Lifestyle & diet logging",
      role_patient_feat_4: "View lab results",
      role_patient_feat_5: "Appointment reminders",
      role_patient_btn: "Sign In as Patient",
      role_hospital_title: "Hospital Login",
      role_hospital_subtitle: "Streamline patient management and improve clinical decision-making.",
      role_hospital_feat_1: "Manage patient records",
      role_hospital_feat_2: "Upload lab results",
      role_hospital_feat_3: "Consultation management",
      role_hospital_feat_4: "Search patient history",
      role_hospital_feat_5: "Secure role-based access",
      role_hospital_btn: "Sign In as Hospital",
      
      cta_journey_title: "Start Your PCOS Journey Today",
      cta_journey_desc: "Join thousands of Sri Lankan women who are managing their PCOS smarter, safer, and with more confidence.",
      cta_create_btn: "Create Free Account",
      cta_login_text: "Already a member? Log In",
      
      footer_resources_title: "PCOS Resources",
      res_understanding: "Understanding PCOS",
      res_symptom_checker: "Symptom Checker",
      res_diet: "Diet & Nutrition",
      res_exercise: "Exercise Guide",
      res_mental: "Mental Wellness",
      res_faqs: "FAQs",
      footer_stay_updated: "Stay Updated",
      footer_newsletter_desc: "Get the latest PCOS news, research, and wellness tips delivered to your inbox.",
      footer_email_placeholder: "Your email address",
      footer_subscribe_btn: "Subscribe",
      footer_no_spam: "No spam, unsubscribe anytime",
      
      about_title: "About Us — PCOS Care Hub",
      about_hero_title: "About PCOS Care Hub",
      about_hero_subtitle: "Transforming PCOS management in Sri Lanka through secure, integrated, patient-first digital healthcare",
      about_mission_vision_title: "Our Mission & Vision",
      about_mission_vision_p1: "PCOS Care Hub was founded with a singular mission: to empower Sri Lankan women with PCOS through technology, education, and care coordination.",
      about_mission_vision_p2: "We recognize that PCOS is more than a medical condition—it's a complex journey affecting fertility, mental health, physical appearance, and overall well-being. Women in Sri Lanka often face fragmented healthcare, lost medical records, and limited access to specialized PCOS knowledge.",
      about_mission_vision_p3: "Our vision is to create an ecosystem where every woman living with PCOS can access comprehensive tools, reliable health information, and connected care from both medical professionals and understanding communities.",
      about_stat_patients: "Women Using the Platform",
      about_stat_hospitals: "Partnered Hospitals & Clinics",
      about_stat_reports: "Medical Reports Secured",
      about_problem_title: "The Problem We're Solving",
      about_problem_1_title: "Fragmented Records",
      about_problem_1_desc: "Women with PCOS visit multiple healthcare providers but often have no centralized system to track their health journey. Lab reports get lost, medical histories are incomplete, and doctors can't see the full picture.",
      about_problem_2_title: "Limited Knowledge",
      about_problem_2_desc: "Despite affecting 8-13% of women globally and 13% of Sri Lankan women, PCOS awareness and education remain low. Many patients don't understand their condition, treatment options, or lifestyle modifications.",
      about_problem_3_title: "Disconnected Care",
      about_problem_3_desc: "Patient-doctor communication is limited to appointment times. Hospitals lack real-time access to patient symptom data, lifestyle patterns, and medication adherence—all crucial for effective PCOS management.",
      about_problem_4_title: "Mental Health Burden",
      about_problem_4_desc: "PCOS patients experience depression and anxiety at higher rates. Without community support and mental health resources, women often feel isolated and unsupported in their journey.",
      about_problem_5_title: "Inconsistent Standards",
      about_problem_5_desc: "Diagnosis and management vary widely across hospitals. Sri Lankan patients often lack access to standardized PCOS protocols and evidence-based treatment guidelines.",
      about_problem_6_title: "Privacy & Data Concerns",
      about_problem_6_desc: "Paper records are vulnerable to loss or mishandling. Women worry about privacy when sharing sensitive health information with multiple providers.",
      about_solution_title: "How We're Solving It",
      about_solution_main_title: "A Unified Digital Ecosystem",
      about_solution_1_title: "Centralized Health Records",
      about_solution_1_desc: "All medical reports, test results, consultations, and symptom data in one secure, accessible place. Never lose important documents again.",
      about_solution_2_title: "Intelligent Tracking Tools",
      about_solution_2_desc: "Track symptoms, menstrual cycles, lifestyle habits, and medications. Our smart analytics help identify patterns and triggers unique to your body.",
      about_solution_3_title: "Hospital Integration",
      about_solution_3_desc: "Hospitals can securely access patient data, post lab results in real-time, and provide better informed care. Less paperwork, better decisions.",
      about_solution_4_title: "Evidence-Based Education",
      about_solution_4_desc: "Learn about PCOS from research-backed articles, symptom guides, treatment options, nutrition tips, and mental wellness resources—all in one place.",
      about_solution_5_title: "Community & Support",
      about_solution_5_desc: "Connect with other women managing PCOS, share experiences, and find strength in community. Mental health is part of comprehensive care.",
      about_solution_6_title: "Privacy & Security First",
      about_solution_6_desc: "Military-grade encryption, HIPAA compliance, and role-based access controls ensure your sensitive health data stays private and protected.",
      about_values_title: "Our Core Values",
      about_values_1_title: "Patient-First",
      about_values_1_desc: "Every feature, decision, and update starts with one question: Does this help our patients?",
      about_values_2_title: "Security & Privacy",
      about_values_2_desc: "Your health data is sacred. We use industry-leading encryption and never compromise on privacy.",
      about_values_3_title: "Evidence-Based",
      about_values_3_desc: "All information and recommendations are grounded in scientific research and clinical best practices.",
      about_values_4_title: "Accessible",
      about_values_4_desc: "Affordable, easy-to-use, and designed specifically for Sri Lankan women and healthcare providers.",
      about_context_title: "Why Sri Lanka Needed PCOS Care Hub",
      about_context_subtitle: "The Sri Lankan PCOS Context",
      about_context_1_title: "High Prevalence",
      about_context_1_desc: "Approximately 13% of Sri Lankan women of reproductive age have PCOS—affecting hundreds of thousands of women island-wide.",
      about_context_2_title: "Distributed Healthcare",
      about_context_2_desc: "Women in urban areas like Colombo may have access to specialists, but those in rural regions struggle to find doctors knowledgeable in PCOS.",
      about_context_3_title: "Limited Specialist Access",
      about_context_3_desc: "PCOS specialist gynaecologists are concentrated in major urban centers. Many women rely on general practitioners unfamiliar with PCOS management.",
      about_context_4_title: "Digital Health Gap",
      about_context_4_desc: "While digital health is growing, few platforms specifically address PCOS in the Sri Lankan context with local support and healthcare partnerships.",
      about_impact_title: "Our Impact So Far",
      about_impact_1_title: "Patient Satisfaction Rate",
      about_impact_1_desc: "Women feel supported and empowered by our platform.",
      about_impact_2_title: "Medical Reports Uploaded",
      about_impact_2_desc: "Women have securely stored their health documents.",
      about_impact_3_title: "Districts Reached",
      about_impact_3_desc: "Women across Sri Lanka using PCOS Care Hub.",
      about_quote_text: "\"PCOS Care Hub has been truly transformative for PCOS management in Sri Lanka. The platform bridges the gap between patients and healthcare providers while normalizing these conversations.\"",
      about_quote_author: "— Dr. Nimalka Fernando, Lead Gynaecologist, Kandy Hospital",
      about_cta_title: "Join Our Mission",
      about_cta_desc: "Whether you're a woman managing PCOS, a healthcare provider, or an administrator, you have a role to play in transforming PCOS care in Sri Lanka.",
      about_btn_explore: "Explore Features",

      features_hero_title: "Powerful Features for Every Role",
      features_hero_subtitle: "Comprehensive tools designed for patients, hospitals, and administrators to manage PCOS better together",
      features_patient_badge: "Patient Features",
      features_patient_title: "Tools to Manage Your PCOS Journey",
      features_symptom_title: "Symptom Tracking",
      features_symptom_desc: "Log your daily symptoms with our intuitive interface. Track irregular periods, acne, hair loss, fatigue, weight changes, mood swings, and more. Our system learns your patterns and provides personalized insights.",
      features_symptom_li1: "Log symptoms in seconds",
      features_symptom_li2: "Visual trend charts and analytics",
      features_symptom_li3: "Identify symptom triggers",
      features_symptom_li4: "Export reports for doctor visits",
      features_cycle_title: "Menstrual Cycle Tracker",
      features_cycle_desc: "Track your menstrual cycle with precision. Record cycle length, flow intensity, and duration. Get smart predictions for ovulation windows and upcoming periods, plus reminders for appointments.",
      features_cycle_li1: "Track period dates easily",
      features_cycle_li2: "Predict ovulation windows",
      features_cycle_li3: "Get appointment reminders",
      features_cycle_li4: "Understand cycle patterns",
      features_records_title: "Secure Medical Records",
      features_records_desc: "Upload and securely store all your medical documents in one place. Lab reports, ultrasound images, prescriptions, and consultation notes—all encrypted and protected. Never lose an important document again.",
      features_records_li1: "Upload any medical document",
      features_records_li2: "Military-grade encryption",
      features_records_li3: "Control who can access",
      features_records_li4: "Download or share with doctors",
      features_lifestyle_title: "Lifestyle & Nutrition Tracker",
      features_lifestyle_desc: "Log your daily meals, water intake, exercise routines, and sleep quality. Track how lifestyle factors affect your PCOS symptoms and get personalized recommendations based on evidence-based PCOS management guidelines.",
      features_lifestyle_li1: "Log meals and nutrition",
      features_lifestyle_li2: "Track exercise and activity",
      features_lifestyle_li3: "Monitor sleep patterns",
      features_lifestyle_li4: "Correlate lifestyle with symptoms",
      features_hosp_conn_title: "Hospital Connection",
      features_hosp_conn_desc: "Connect directly with your hospital or clinic. Share your health data securely, receive lab results in real-time, and stay updated on consultations—all in one place. Your healthcare team stays informed about your complete health journey.",
      features_hosp_conn_li1: "Share data with your hospital",
      features_hosp_conn_li2: "Receive lab results online",
      features_hosp_conn_li3: "Schedule & manage appointments",
      features_hosp_conn_li4: "Message your healthcare team",
      features_hosp_badge: "Hospital Features",
      features_hosp_title: "Streamline Patient Management",
      features_hosp_record_title: "Patient Record Management",
      features_hosp_record_desc: "Access complete patient health histories instantly. View all uploaded documents, medical records, and consultation notes in one secure portal. Make informed clinical decisions based on complete data.",
      features_hosp_lab_title: "Lab Results Upload",
      features_hosp_lab_desc: "Post lab results directly to patient profiles in seconds. Patients receive instant notifications and can view their results online. Reduce paper-based result distribution.",
      features_hosp_consult_title: "Consultation Management",
      features_hosp_consult_desc: "Schedule consultations, share examination notes, and communicate with patients between appointments. Track consultation history and patient progress over time.",
      features_hosp_search_title: "Advanced Patient Search",
      features_hosp_search_desc: "Quickly find patients by name, ID, email, or phone. Filter by diagnosis, symptoms, or test results. Streamline patient lookups and reduce administrative time.",
      features_hosp_analytics_title: "Hospital Analytics",
      features_hosp_analytics_desc: "View dashboards with patient data insights. Understand common symptoms, diagnoses, and treatment effectiveness. Generate reports for hospital administration and quality improvement.",
      features_hosp_rbac_title: "Role-Based Access Control",
      features_hosp_rbac_desc: "Assign roles to staff members and control who can access what information. Ensure patient privacy while giving clinicians the access they need.",
      features_admin_badge: "Admin Features",
      features_admin_title: "System Oversight & Management",
      features_admin_user_title: "User Management",
      features_admin_user_desc: "Manage all user accounts across the platform. Register patients, hospitals, and administrators. Deactivate accounts, verify email addresses, and maintain user records securely.",
      features_admin_hosp_title: "Hospital Approvals",
      features_admin_hosp_desc: "Review and approve new hospital registrations. Verify credentials, validate hospital details, and maintain a network of trusted partners. Ensure quality across the platform.",
      features_admin_audit_title: "Audit Logs & Compliance",
      features_admin_audit_desc: "Monitor all system activities with comprehensive audit trails. Track user actions, data access, and changes for regulatory compliance and security purposes.",
      features_admin_analytics_title: "Analytics Dashboard",
      features_admin_analytics_desc: "View platform-wide analytics including user statistics, hospital activity, feature usage, and growth metrics. Data-driven insights for platform improvement.",
      features_admin_config_title: "System Configuration",
      features_admin_config_desc: "Configure platform settings, manage notifications, set policies, and customize email templates. Control system behavior and messaging to match organizational needs.",
      features_admin_security_title: "Security & Monitoring",
      features_admin_security_desc: "Manage security settings, view system performance metrics, monitor for suspicious activities, and ensure platform stability. Immediate alerts for critical issues.",
      features_common_title: "Features for Everyone",
      features_common_mobile_title: "Mobile Responsive",
      features_common_mobile_desc: "Access PCOS Care Hub from any device—desktop, tablet, or phone. Same experience, full functionality, anywhere you go.",
      features_common_notif_title: "Smart Notifications",
      features_common_notif_desc: "Get timely reminders for appointments, medication, cycles, and important milestones. Customize notification preferences.",
      features_common_lang_title: "Multi-Language Support",
      features_common_lang_desc: "Available in English, Sinhala, and Tamil. Connect with healthcare providers in your preferred language.",
      features_common_export_title: "Data Export",
      features_common_export_desc: "Export your health data in standard formats for backup, personal records, or sharing with other healthcare providers.",
      features_common_enc_title: "End-to-End Encryption",
      features_common_enc_desc: "Your data is encrypted both in transit and at rest. Only authorized users can access your information.",
      features_common_acc_title: "Accessibility First",
      features_common_acc_desc: "Designed for users of all abilities. Screen reader compatible, keyboard navigable, and WCAG compliant.",
      features_common_fast_title: "Lightning Fast",
      features_common_fast_desc: "Optimized performance even on slower internet connections. Quick loading times, minimal data usage.",
      features_common_support_title: "24/7 Support",
      features_common_support_desc: "Need help? Our support team is ready. Email, chat, or knowledge base—choose your preferred contact method.",
      features_comp_title: "Feature Comparison by Role",
      features_comp_th_feature: "Feature",
      features_comp_th_patient: "Patient",
      features_comp_th_hospital: "Hospital",
      features_comp_th_admin: "Admin",
      features_comp_row_symptom: "Symptom Tracking",
      features_comp_row_cycle: "Cycle Tracking",
      features_comp_row_records: "Upload Medical Records",
      features_comp_row_lifestyle: "Lifestyle Tracking",
      features_comp_row_results: "View Hospital Results",
      features_comp_row_search: "Patient Search & Access",
      features_comp_row_lab: "Post Lab Results",
      features_comp_row_consult: "Manage Consultations",
      features_comp_row_user: "User Management",
      features_comp_row_hosp_app: "Hospital Approvals",
      features_comp_row_analytics: "Analytics & Audit Logs",
      features_cta_title: "Ready to Experience These Features?",
      features_cta_desc: "Join thousands of women and healthcare providers already using PCOS Care Hub to revolutionize PCOS management.",
      features_btn_learn_pcos: "Learn About PCOS",
      
      notifications: "Notifications",
      notifications_desc: "Manage how you receive notifications and reminders",
      email_notif: "Email Notifications",
      email_notif_desc: "Receive email updates about appointments and health",
      sms_alerts: "SMS Alerts",
      sms_alerts_desc: "Get text message reminders for appointments",
      appointment_reminders: "Appointment Reminders",
      appointment_reminders_desc: "Get reminded before your scheduled appointments",
      cycle_reminders: "Cycle Reminders",
      cycle_reminders_desc: "Get notified about your menstrual cycle events",
      health_tips_articles: "Health Tips & Articles",
      health_tips_articles_desc: "Receive weekly health tips and educational content",
      privacy_data: "Privacy & Data",
      privacy_info_banner: "Your health data is encrypted and stored securely. We never share your personal information with third parties without your consent.",
      data_sharing: "Data Sharing",
      data_sharing_desc: "Allow clinics to access your health records",
      research_participation: "Research Participation",
      research_participation_desc: "Help us improve PCOS care by participating in research",
      anonymous_analytics: "Anonymous Analytics",
      anonymous_analytics_desc: "Help us improve the app by sending usage statistics",
      theme: "Theme",
      light_mode: "Light Mode",
      dark_mode: "Dark Mode",
      auto_system: "Auto (System)",
      primary_color: "Primary Color",
      text_size: "Text Size",
      small_size: "Small",
      medium_size: "Medium",
      large_size: "Large",
      weight_unit: "Weight Unit",
      kilograms: "Kilograms (kg)",
      pounds: "Pounds (lbs)",
      height_unit: "Height Unit",
      centimeters: "Centimeters (cm)",
      feet_inches: "Feet & Inches",
      avg_cycle_length: "Average Cycle Length (days)",
      avg_period_duration: "Average Period Duration (days)",
      health_tracking_priorities: "Health Tracking Priorities",
      track_symptoms_opt: "Symptom tracking",
      track_exercise_opt: "Exercise & Activity",
      track_nutrition_opt: "Nutrition & Diet",
      track_mood_opt: "Mood & Stress",
      track_sleep_opt: "Sleep Quality",
      save_health_settings_btn: "Save Health Settings",
      language_label: "Language",
      timezone_label: "Timezone",
      save_language_settings_btn: "Save Language Settings",
      clear_local_data_btn: "Clear All Local Data",
      clear_data_desc: "This will clear cached data but won't affect your account on the server.",
      role_patient: "Patient",
      fertile_window_status: "Fertile Window",
      days: "days",
      day: "Day",
      lifestyle_log_title: "Lifestyle Log",
      track_lifestyle_desc: "Monitor your diet, exercise, hydration, and sleep to manage your PCOS symptoms effectively.",
      meal_log: "Meal Log",
      exercise_log: "Exercise Log",
      hydration_log: "Hydration Log",
      sleep_log: "Sleep Log",
      search_logs_placeholder: "Search logs…",
      select_type: "Select type…",
      meal_notes_placeholder: "How did you feel? Any symptoms?",
      action: "Action",
      food_categories: "Food Categories",
      records: "records",
      log_meal_title: "Log Your Meal",
      meal_name_label: "Meal Name",
      meal_time_label: "Meal Time",
      meal_type_label: "Meal Type",
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snack",
      dietary_tags: "Dietary Tags",
      high_protein: "High Protein",
      low_carb: "Low Carb",
      vegetarian: "Vegetarian",
      dairy_free: "Dairy Free",
      gluten_free: "Gluten Free",
      sugar_free: "Sugar Free",
      portions_label: "Portions",
      log_meal_btn: "Log Meal",
      log_exercise_title: "Log Your Exercise",
      exercise_name_label: "Exercise Name",
      duration_label: "Duration (minutes)",
      intensity_label: "Intensity",
      low: "Low",
      moderate: "Moderate",
      high: "High",
      calories_label: "Calories Burnt (est.)",
      log_exercise_btn: "Log Exercise",
      hydration_title: "Hydration Tracker",
      add_water: "Add Water",
      custom_amount: "Custom Amount (ml)",
      hydration_history: "Hydration History",
      log_sleep_title: "Log Your Sleep",
      sleep_duration_label: "Duration (hours)",
      sleep_quality_label: "Sleep Quality",
      poor: "Poor",
      fair: "Fair",
      good: "Good",
      excellent: "Excellent",
      wake_up_feeling: "Wake up Feeling",
      refreshed: "Refreshed",
      tired: "Tired",
      groggy: "Groggy",
      log_sleep_btn: "Log Sleep",
      history: "History",
      no_meals_today: "No meals logged for today.",
      no_exercises_today: "No exercises logged for today.",
      no_sleep_logged: "No sleep data logged recently.",
      daily_total: "Daily Total",
      portions_unit: "portions",
      minutes_unit: "minutes",
      calories_unit: "kcal",
      hours_unit: "hours",
      entry_deleted: "Entry deleted",
      meal_added: "Meal added!",
      exercise_added: "Exercise added!",
      water_added: "Water intake updated!",
      sleep_added: "Sleep data saved!",
      fill_fields_error: "Please fill in all required fields.",
      delete_confirm: "Delete this entry?",
      meal_saved_success: "Meal saved successfully! 🥗",
      exercise_saved_success: "Exercise saved! ðŸƒ",
      water_logged_success: "Water intake updated! 💧",
      sleep_logged_success: "Sleep logged! 😴",
      amount: "Amount",
      day_total: "Day Total",
      logged_at: "Logged At",
      info_title: "PCOS Information — PCOS Care Hub",
      info_hero_title: "Understanding PCOS",
      info_hero_subtitle: "Comprehensive, evidence-based information to help you understand, manage, and thrive with Polycystic Ovary Syndrome",
      info_what_title: "What is PCOS?",
      info_what_p1: "<strong>Polycystic Ovary Syndrome (PCOS)</strong> is a common endocrine disorder affecting women of reproductive age. Despite its name, PCOS involves much more than just ovarian cysts—it's a complex condition involving hormonal imbalance, insulin resistance, and inflammation.",
      info_what_p2: "PCOS affects approximately <strong>8–13% of women worldwide</strong>, making it one of the most common reproductive disorders. In developing countries like Sri Lanka, the prevalence is around <strong>13%</strong>, affecting hundreds of thousands of women across the country.",
      info_what_p3: "The condition is characterized by three diagnostic criteria (Rotterdam Criteria), and a diagnosis requires at least 2 of the 3:",
      info_what_li1: "<strong>Ovulatory dysfunction:</strong> Irregular or absent menstrual cycles (fewer than 8 cycles/year)",
      info_what_li2: "<strong>Hyperandrogenism (excess androgens):</strong> Clinical signs (hirsutism, acne) or elevated testosterone levels",
      info_what_li3: "<strong>Polycystic ovaries:</strong> Multiple small follicles visible on ultrasound (â‰¥12 per ovary)",
      info_symptoms_title: "Symptoms of PCOS",
      info_symptoms_subtitle: "PCOS symptoms vary widely between women and can change over time. Here are the most common manifestations:",
      info_symptom_irregular_title: "Irregular Periods",
      info_symptom_irregular_desc: "Periods that are infrequent, unpredictable, or absent. Cycles may be longer than 35 days or fewer than 8 cycles per year. Some women experience prolonged bleeding.",
      info_symptom_hair_title: "Excess Hair Growth (Hirsutism)",
      info_symptom_hair_desc: "Unwanted facial and body hair due to elevated androgen levels. This commonly affects the face, chest, back, and stomach areas.",
      info_symptom_acne_title: "Acne & Oily Skin",
      info_symptom_acne_desc: "Hormonal acne that often appears on the face, chest, and back due to increased sebaceous gland activity from elevated androgens.",
      info_symptom_loss_title: "Hair Loss",
      info_symptom_loss_desc: "Hair thinning or male-pattern baldness (androgenetic alopecia) on the scalp, often while facial/body hair increases paradoxically.",
      info_symptom_weight_title: "Weight Gain & Difficulty Losing Weight",
      info_symptom_weight_desc: "Unexplained weight gain, especially in the abdomen. Insulin resistance makes it harder to lose weight despite diet and exercise.",
      info_symptom_fatigue_title: "Fatigue & Sleep Issues",
      info_symptom_fatigue_desc: "Persistent tiredness, low energy, and sleep disturbances. Often related to insulin resistance, hormonal imbalances, and sometimes sleep apnea.",
      info_symptom_mood_title: "Mood Disturbances",
      info_symptom_mood_desc: "Depression, anxiety, and mood swings are 2-3 times more common in women with PCOS. Related to hormonal fluctuations and emotional stress.",
      info_symptom_infertility_title: "Infertility or Subfertility",
      info_symptom_infertility_desc: "Difficulty getting pregnant due to irregular ovulation. PCOS is one of the leading causes of infertility, but many treatments can help.",
      info_symptom_skin_title: "Skin Darkening (Acanthosis Nigricans)",
      info_symptom_skin_desc: "Dark, velvety patches of skin, usually in body creases (neck, armpits, groin). A sign of insulin resistance.",
      info_causes_title: "Causes & Risk Factors",
      info_causes_subtitle: "The exact cause of PCOS is not fully understood, but research suggests a combination of genetic and environmental factors:",
      info_cause_genetic_title: "🧬 Genetic Factors",
      info_cause_genetic_li1: "<strong>Family History:</strong> PCOS runs in families. If your mother or sister has PCOS, your risk is significantly higher.",
      info_cause_genetic_li2: "<strong>Multiple Genes Involved:</strong> This is not a single-gene condition. Many genes contribute to PCOS susceptibility.",
      info_cause_insulin_title: "🔬 Insulin Resistance",
      info_cause_insulin_li1: "<strong>Most Common Factor:</strong> 50-70% of women with PCOS have insulin resistance. Cells don't respond properly to insulin.",
      info_cause_insulin_li2: "<strong>Cascade Effect:</strong> This causes the pancreas to produce excess insulin, which triggers excess androgen production, disrupting ovulation.",
      info_cause_inflammation_title: "⚡ Inflammation",
      info_cause_inflammation_li1: "<strong>Chronic Low-Grade Inflammation:</strong> Women with PCOS have elevated inflammatory markers.",
      info_cause_inflammation_li2: "<strong>Stimulates Androgens:</strong> This inflammation may trigger polycystic ovaries to produce excess male hormones.",
      info_cause_env_title: "🌿 Environmental & Lifestyle",
      info_cause_env_li1: "<strong>Diet & Weight:</strong> High-sugar, low-fiber diets increase PCOS risk and severity.",
      info_cause_env_li2: "<strong>Sedentary Lifestyle:</strong> Lack of physical activity contributes to insulin resistance and weight gain.",
      info_diagnosis_title: "Diagnosis of PCOS",
      info_diagnosis_desc: "There is no single definitive test for PCOS. Diagnosis is based on clinical features and test results meeting the <strong>Rotterdam Criteria</strong>, which requires at least 2 of 3 features:",
      info_diagnosis_tests_title: "Diagnostic Tests Include:",
      info_diagnosis_li1: "<strong>Blood Tests:</strong> Testosterone, FSH, LH, glucose, insulin levels, lipid profile",
      info_diagnosis_li2: "<strong>Pelvic Ultrasound:</strong> To visualize ovaries for multiple follicles",
      info_diagnosis_li3: "<strong>Pelvic Examination:</strong> To check for signs of excess androgen",
      info_diagnosis_li4: "<strong>Medical History:</strong> Irregular periods, infertility, family history",
      info_diagnosis_li5: "<strong>Other Tests:</strong> Glucose tolerance test, thyroid function, to rule out other conditions",
      info_treatment_title: "Treatment & Management",
      info_treatment_subtitle: "PCOS is manageable with a combination of medical and lifestyle treatments tailored to your individual needs:",
      info_treat_hormone_title: "Hormonal Contraceptives",
      info_treat_hormone_desc: "Regulate menstrual cycles, reduce androgen levels, improve acne and hair growth. Usually first-line treatment.",
      info_treat_metformin_title: "Metformin",
      info_treat_metformin_desc: "Improves insulin resistance, helps regulate cycles, supports weight management, and reduces diabetes risk.",
      info_treat_lifestyle_title: "Lifestyle Modifications",
      info_treat_lifestyle_desc: "Even 5-10% weight loss significantly improves PCOS. Regular exercise, balanced diet, stress management crucial.",
      info_treat_anti_title: "Anti-Androgen Medications",
      info_treat_anti_desc: "Spironolactone, flutamide reduce effects of excess androgens. Help with acne, hair loss, and hirsutism.",
      info_treat_nutri_title: "Nutritional Management",
      info_treat_nutri_desc: "Low glycaemic index diet, anti-inflammatory foods (omega-3s, leafy greens), adequate protein. Avoid refined sugars.",
      info_treat_fertility_title: "Fertility Treatments",
      info_treat_fertility_desc: "For women trying to conceive: ovulation induction medications, hormone therapies, and assisted reproductive techniques.",
      info_risks_title: "PCOS & Long-Term Health Risks",
      info_risk_diabetes_title: "🩺 Type 2 Diabetes",
      info_risk_diabetes_desc: "Women with PCOS have significantly higher risk of developing type 2 diabetes (up to 40% risk). Regular monitoring and lifestyle changes are important.",
      info_risk_cardio_title: "â¤ï¸ Cardiovascular Disease",
      info_risk_cardio_desc: "Elevated cholesterol, blood pressure, and inflammatory markers increase heart disease risk. Regular cardiac screening recommended.",
      info_risk_metabolic_title: "📊 Metabolic Syndrome",
      info_risk_metabolic_desc: "A cluster of conditions including obesity, high blood pressure, high cholesterol, and insulin resistance—common in PCOS.",
      info_risk_mental_title: "🧠 Mental Health Issues",
      info_risk_mental_desc: "Depression (2-3x higher) and anxiety are common. Body image concerns, infertility worries, and hormonal changes all contribute.",
      info_risk_endo_title: "ðŸ¥ Endometrial Hyperplasia",
      info_risk_endo_desc: "Infrequent periods increase endometrial cancer risk. Regular monitoring and treatments to induce periods are recommended.",
      info_risk_preg_title: "🤰 Pregnancy Complications",
      info_risk_preg_desc: "Higher risks of gestational diabetes, preeclampsia, and miscarriage. With proper management, successful pregnancies are very achievable.",
      info_lifestyle_title: "Lifestyle Management Strategies",
      info_life_nutri_title: "🥗 Nutrition",
      info_life_nutri_li1: "<strong>Choose Low Glycaemic Index Foods:</strong> Whole grains, legumes, vegetables, fruits. Avoid white rice, refined flour, sugary foods.",
      info_life_nutri_li2: "<strong>Anti-Inflammatory Diet:</strong> Fatty fish (salmon, mackerel), leafy greens, berries, nuts, olive oil. Omega-3 fatty acids help.",
      info_life_nutri_li3: "<strong>Adequate Protein:</strong> Helps with satiety and blood sugar control. Aim for lean meat, fish, tofu, legumes.",
      info_life_nutri_li4: "<strong>Limit Inflammatory Foods:</strong> Reduce processed foods, saturated fats, sugary drinks, and fried foods.",
      info_life_nutri_li5: "<strong>Stay Hydrated:</strong> Drink plenty of water. Aim for 8+ glasses daily.",
      info_life_exercise_title: "ðŸƒ Exercise",
      info_life_exercise_li1: "<strong>Aim for 150+ Minutes Weekly:</strong> Moderate-intensity aerobic activity like brisk walking, cycling, swimming.",
      info_life_exercise_li2: "<strong>Strength Training:</strong> 2-3 days per week improves insulin sensitivity and helps with weight management.",
      info_life_exercise_li3: "<strong>High-Intensity Interval Training (HIIT):</strong> Short bursts of intense exercise can be very effective for PCOS.",
      info_life_exercise_li4: "<strong>Find Activities You Enjoy:</strong> You're more likely to stick with it long-term.",
      info_life_sleep_title: "😴 Sleep & Stress",
      info_life_sleep_li1: "<strong>Aim for 7-9 Hours Nightly:</strong> Poor sleep worsens insulin resistance and hormonal balance. Maintain consistent sleep schedule.",
      info_life_sleep_li2: "<strong>Manage Stress:</strong> Cortisol affects hormones and inflammation. Try: yoga, meditation, deep breathing, journaling.",
      info_life_sleep_li3: "<strong>Limit Screen Time Before Bed:</strong> Blue light interferes with melatonin production.",
      info_life_sleep_li4: "<strong>Create Sleep-Friendly Environment:</strong> Dark, cool, quiet bedroom. Avoid caffeine late in the day.",
      info_life_mental_title: "🧠 Mental Health",
      info_life_mental_li1: "<strong>Seek Support:</strong> Talk to friends, family, or support groups. You're not alone in this journey.",
      info_life_mental_li2: "<strong>Consider Therapy:</strong> Cognitive behavioral therapy (CBT) has evidence for improving depression and anxiety in PCOS.",
      info_life_mental_li3: "<strong>Practice Self-Compassion:</strong> PCOS is challenging, but you're managing it well. Celebrate small wins.",
      info_life_mental_li4: "<strong>Body Acceptance:</strong> Work on accepting your body and focusing on health rather than appearance.",
      info_living_well_title: "Living Well with PCOS",
      info_living_well_p1: "PCOS is a chronic condition, but it's highly manageable. With the right combination of medical care, lifestyle changes, and support, you can control symptoms and live a healthy, fulfilling life.",
      info_living_well_p2: "Remember: Every person's PCOS is different. Work with your healthcare team to develop a personalized management plan. Track your symptoms, learn what works for your body, and stay committed to your health journey.",
      info_btn_community: "Join Our Community",
      info_btn_about: "About PCOS Care Hub",

      // Hospitals Page
      hosp_title: "Partner Hospitals — PCOS Care Hub",
      hosp_hero_title: "Partner Hospitals",
      hosp_hero_subtitle: "PCOS Care Hub partners with leading hospitals across Sri Lanka to provide seamless, integrated healthcare for women with PCOS.",
      hosp_btn_connect: "Connect",
      hosp_toast_connecting: "Connecting with",

      // Hospital Names
      hosp_castle_name: "Castle Street Hospital for Women",
      hosp_desoysa_name: "De Soysa Hospital for Women",
      hosp_national_name: "National Hospital of Sri Lanka",
      hosp_kandy_name: "Teaching Hospital Kandy",
      hosp_karapitiya_name: "Teaching Hospital Karapitiya",
      hosp_mahamodara_name: "Teaching Hospital Mahamodara",
      hosp_ragama_name: "Teaching Hospital Ragama (Colombo North)",
      hosp_kalubowila_name: "Teaching Hospital Kalubowila (Colombo South)",
      hosp_anuradhapura_name: "Teaching Hospital Anuradhapura",
      hosp_jaffna_name: "Teaching Hospital Jaffna",
      hosp_batticaloa_name: "Teaching Hospital Batticaloa",
      hosp_sjp_name: "Sri Jayewardenepura General Hospital",
      hosp_lanka_name: "Lanka Hospitals",
      hosp_nine_name: "Ninewells Hospital",
      hosp_asiri_name: "Asiri Medical Hospital",
      hosp_durdans_name: "Durdans Hospital",
      hosp_hemas_w_name: "Hemas Hospital Wattala",
      hosp_hemas_t_name: "Hemas Hospital Thalawathugoda",
      hosp_blue_name: "Blue Cross Hospital",
      hosp_neville_name: "Neville Fernando Teaching Hospital",

      // Hospital Descriptions
      hosp_castle_desc: "Premier women's hospital offering comprehensive care for hormonal disorders, infertility, and reproductive health.",
      hosp_desoysa_desc: "One of the largest maternity hospitals with specialized clinics for hormonal imbalance and fertility issues.",
      hosp_national_desc: "Largest tertiary hospital providing multidisciplinary treatment for complex PCOS cases.",
      hosp_kandy_desc: "Leading academic medical centre with strong women's health and hormonal research facilities.",
      hosp_karapitiya_desc: "Major teaching hospital with advanced reproductive and hormonal disorder management.",
      hosp_mahamodara_desc: "Specialized maternity hospital with services for menstrual and fertility-related conditions.",
      hosp_ragama_desc: "Academic hospital with specialist clinics for hormonal imbalance and reproductive health.",
      hosp_kalubowila_desc: "Provides accessible PCOS diagnosis and treatment with specialist clinics.",
      hosp_anuradhapura_desc: "Major regional hospital supporting women's hormonal and reproductive care.",
      hosp_jaffna_desc: "Northern province's main teaching hospital with advanced women's health services.",
      hosp_batticaloa_desc: "Provides reproductive and hormonal disorder management for eastern region patients.",
      hosp_sjp_desc: "Offers specialized gynaecology clinics including hormonal and obesity-related conditions.",
      hosp_lanka_desc: "Private hospital with advanced diagnostics and comprehensive care for PCOS and hormonal disorders.",
      hosp_nine_desc: "Specialized private hospital focusing on women's health, fertility, and hormonal conditions.",
      hosp_asiri_desc: "Provides advanced treatment for ovarian cysts, hormonal disorders, and reproductive issues.",
      hosp_durdans_desc: "Well-established private hospital with expert specialists in reproductive health.",
      hosp_hemas_w_desc: "Modern private hospital offering comprehensive women's health and hormonal care.",
      hosp_hemas_t_desc: "Well-equipped facility with specialist obstetric and gynaecological services.",
      hosp_blue_desc: "Provides consultant-led care for PCOS, menstrual disorders, and reproductive issues.",
      hosp_neville_desc: "Modern teaching hospital with specialist obstetric and gynaecology services.",

      // Specialties
      hosp_spec_gynae: "Gynaecology",
      hosp_spec_fertility: "Fertility",
      hosp_spec_endo: "Endocrinology",
      hosp_spec_subfertility: "Subfertility Clinics",
      hosp_spec_research: "Research",
      hosp_spec_maternity: "Maternity",
      hosp_spec_general: "General Medicine",
      hosp_spec_rural: "Rural Health",
      hosp_spec_community: "Community Care",
      hosp_spec_multidisc: "Multidisciplinary Clinics",
      hosp_spec_wellness: "Women's Wellness",
      hosp_spec_wellwoman: "Well-woman clinics",
      hosp_spec_surgical: "Surgical Care",
      hosp_spec_specialist: "Specialist Clinics",
      hosp_spec_teaching_research: "Teaching & Research",

      // Locations
      hosp_loc_colombo: "Colombo",
      hosp_loc_kandy: "Kandy",
      hosp_loc_galle: "Galle",
      hosp_loc_ragama: "Ragama",
      hosp_loc_kalubowila: "Kalubowila",
      hosp_loc_anuradhapura: "Anuradhapura",
      hosp_loc_jaffna: "Jaffna",
      hosp_loc_batticaloa: "Batticaloa",
      hosp_loc_nugegoda: "Nugegoda",
      hosp_loc_wattala: "Wattala",
      hosp_loc_thalawathugoda: "Thalawathugoda",
      hosp_loc_rajagiriya: "Rajagiriya",
      hosp_loc_malabe: "Malabe",

      // My Hospital Page
      my_hospital_title: "My Hospital",
      manage_healthcare: "Manage your healthcare providers",
      hospital_hero_title: "Find Your Best Healthcare ðŸ¥",
      hospital_hero_desc: "Register with your primary hospital and specialist clinic to keep all your medical care in one place.",
      register_new_hospital: "Register New Hospital",
      fetching_hospitals: "Fetching your registered hospitals...",
      register_new_title: "ðŸ“ Register New",
      hospital_name_label: "Hospital Name *",
      hospital_name_placeholder: "e.g. Asiri Hospital",
      specialist_doctor_label: "Specialist Doctor",
      doctor_placeholder: "Dr. Jane Smith",
      address_label: "Address",
      address_placeholder: "Street, City...",
      contact_number_label: "Contact Number *",
      contact_placeholder: "10 digits (e.g. 0771234567)",
      email_label: "Email",
      email_placeholder: "info@hosp.com",
      set_primary_label: "Set as Primary Hospital",
      register_hospital_btn: "ðŸ¥ Register Hospital",
      failed_load_hospitals: "Failed to load registered hospitals.",
      no_hospitals_registered: "No hospitals registered yet.",
      primary_provider_badge: "Primary Provider",
      special_care: "Specialist Care",
      remove: "Remove",
      make_primary: "Make Primary",
      contact_10_digits_error: "Contact number must be exactly 10 digits.",
      hospital_registered_success: "Hospital registered successfully!",
      are_you_sure_remove: "Are you sure you want to remove",
      hospital_removed: "Hospital removed successfully.",
      primary_provider_updated: "Primary provider updated!",
      section_main: "Main",
      section_health: "Health",
      section_account: "Account",

      contact_title: "Contact Us — PCOS Care Hub",
      contact_hero_title: "Contact Our Team",
      contact_hero_desc: "Have questions about the platform? Interested in partnering with us? Our team in Colombo is ready to assist you.",
      contact_form_title: "Send Us a Message",
      contact_form_subtitle: "Fill out the form below and we'll get back to you within 24 hours.",
      contact_name_placeholder: "Jane Doe",
      contact_email_label: "Email Address",
      contact_email_placeholder: "jane@example.com",
      contact_subject_label: "Subject",
      contact_subject_option_default: "Select a topic",
      contact_subject_option_patient: "Patient Support",
      contact_subject_option_hospital: "Hospital Partnership",
      contact_subject_option_technical: "Technical Issue",
      contact_subject_option_other: "General Inquiry",
      contact_message_label: "Your Message",
      contact_message_placeholder: "How can we help you today?",
      contact_btn_submit: "Send Message — We're Listening",
      contact_info_title: "Contact Information",
      contact_loc_title: "Our Location",
      contact_loc_desc: "123 Healthcare Plaza, Colombo 07, Sri Lanka",
      contact_call_title: "Call Us",
      contact_email_title: "Email Us",
      contact_follow_title: "Follow Our Journey",
      contact_map_title: "Proudly Based in Sri Lanka",
      contact_map_desc: "Serving women across the island from our central hub in Colombo.",
      contact_success_title: "Thank you for sending a message!",
      contact_success_desc: "We will respond within 24 hours."
    },

    si: {
      nav_home: "ප්‍රධාන පිටුව",
      nav_about: "අප ගැන",
      nav_features: "විශේෂාංග",
      nav_pcos_info: "PCOS තොරතුරු",
      nav_hospitals: "රෝහල්",
      nav_blog: "බ්ලොග්",
      nav_contact: "සම්බන්ධ වන්න",
      nav_login: "පිවිසෙන්න",
      nav_signup: "සම්බන්ධ වන්න",
      nav_get_connected: "සම්බන්ධ වන්න",
      nav_records: "ආරක්ෂිත සෞඛ්‍ය වාර්තා",
      lang_changed_toast: "භාෂාව සාර්ථකව වෙනස් කරන ලදි!",
      blog_hero_title: "PCOS දැනුම මධ්‍යස්ථානය",
      blog_hero_desc: "PCOS වඩාත් හොඳින් අවබෝධ කර ගැනීමට සහ කළමනාකරණය කිරීමට උපකාරී වන ලිපි, උපදෙස් සහ මාර්ගෝපදේශ.",
      blog_tag_diet: "ආහාර සහ පෝෂණය",
      blog_tag_exercise: "ව්‍යායාම",
      blog_tag_mental: "මානසික සෞඛ්‍යය",
      blog_tag_hormones: "හෝමෝන",
      blog_tag_fertility: "ප්‍රජනක සෞඛ්‍යය",
      blog_tag_wellness: "සුවතාවය",
      blog_read_more: "වැඩිදුර කියවන්න →",
      blog_title_1: "PCOS කළමනාකරණය සඳහා හොඳම ප්‍රති-ප්‍රදාහ ආහාර රටාව",
      blog_desc_1: "ඉන්සියුලින් ප්‍රතිරෝධය පාලනය කිරීමට සහ හෝමෝන සමබරතාවය වැඩි දියුණු කිරීමට ප්‍රති-ප්‍රදාහ ආහාර රටාවක් උපකාරී වන ආකාරය සොයා ගන්න.",
      blog_date_1: "2026 පෙබරවාරි 20",
      blog_read_time_1: "විනාඩි 6ක කියවීමක්",
      blog_title_2: "PCOS සහිත කාන්තාවන් සඳහා ව්‍යායාම මාර්ගෝපදේශය",
      blog_desc_2: "ශක්ති පුහුණුව සහ හෘද රෝග ව්‍යායාම මගින් ඉන්සියුලින් සංවේදීතාව වැඩි දියුණු කළ හැකිය.",
      blog_date_2: "2026 පෙබරවාරි 15",
      blog_read_time_2: "විනාඩි 5ක කියවීමක්",
      blog_title_3: "PCOS හා සම්බන්ධ කාංසාව සහ විශාදය කළමනාකරණය කිරීම",
      blog_desc_3: "PCOS මගින් විශාදය සහ කාංසාව ඇතිවීමේ අවදානම සැලකිය යුතු ලෙස වැඩි කරයි.",
      blog_date_3: "2026 පෙබරවාරි 10",
      blog_read_time_3: "විනාඩි 7ක කියවීමක්",
      blog_title_4: "PCOS හි ඉන්සියුලින් ප්‍රතිරෝධය අවබෝධ කර ගැනීම",
      blog_desc_4: "PCOS සහිත කාන්තාවන්ගෙන් 70%ක් දක්වා ඉන්සියුලින් ප්‍රතිරෝධය පවතී.",
      blog_date_4: "2026 පෙබරවාරි 5",
      blog_read_time_4: "විනාඩි 8ක කියවීමක්",
      blog_title_5: "PCOS සහ ප්‍රජනක සෞඛ්‍යය: ඔබ දැනගත යුතු දේ",
      blog_desc_5: "PCOS යනු කාන්තා වඳභාවයට ප්‍රධානතම හේතුවකි, නමුත් බොහෝ කාන්තාවන්ට ප්‍රතිකාර මගින් දරුවන් ලැබිය හැකිය.",
      blog_date_5: "2026 ජනවාරි 28",
      blog_read_time_5: "විනාඩි 9ක කියවීමක්",
      blog_title_6: "PCOS පාලනය සඳහා නින්ද තීරණාත්මක වන්නේ ඇයි?",
      blog_desc_6: "අඩු නින්ද ඉන්සියුලින් ප්‍රතිරෝධය සහ හෝමෝන අසමතුලිතතාවය තවත් නරක අතට හැරවිය හැකිය.",
      blog_date_6: "2026 ජනවාරි 22",
      blog_read_time_6: "විනාඩි 5ක කියවීමක්",
      hero_badge_text: "ශ්‍රී ලංකාවේ අංක 1 PCOS වේදිකාව",
      hero_title_main: "PCOS කළමනාකරණය",
      hero_title_highlight: "වඩාත් බුද්ධිමත් හා ආරක්ෂිතව",
      hero_desc_text: "ශ්‍රී ලාංකික කාන්තාවන්ට PCOS බුද්ධිමත්ව සහ ආරක්ෂිතව කළමනාකරණය කිරීමට ඇති සම්පූර්ණ වේදිකාව — රෝග ලක්ෂණ නිරීක්ෂණය කරන්න, රෝහල් සමඟ සම්බන්ධ වන්න, සහ ඕනෑම වේලාවක ඔබේ සෞඛ්‍ය වාර්තා වෙත ප්‍රවේශ වන්න.",
      hero_stat_reports: "වාර්තා උඩුගත කරන ලදී",
      hero_stat_patients: "රෝගීන්ට සහාය විය",
      hero_stat_hospitals: "හවුල්කාර රෝහල්",
      about_badge_num: "8-13%",
      about_badge_lbl: "ලොව පුරා PCOS රෝගයෙන් පෙළෙන කාන්තාවන්",
      btn_get_started: "නොමිලේ ආරම්භ කරන්න",
      btn_learn_more: "වැඩි විස්තර",
      trust_free: "නොමිලේ සම්බන්ධ වන්න",
      trust_secure: "ආරක්ෂිත සහ පෞද්ගලික",
      trust_hospital: "රෝහල් සමඟ සම්බන්ධිත",
      dash_overview: "දළ විශ්ලේෂණය",
      dash_symptoms: "රෝග ලක්ෂණ",
      dash_reports: "වාර්තා",
      dash_appointments: "හමුවීම්",
      dash_settings: "සැකසුම්",
      dash_logout: "ඉවත් වන්න",
      features_title: "විශේෂාංග — PCOS Care Hub",
      about_title: "අප ගැන — PCOS Care Hub",
      about_hero_title: "PCOS Care Hub ගැන",
      about_hero_subtitle: "ආරක්ෂිත, ඒකාබද්ධ සහ රෝගියාට මුල් තැන දෙන ඩිජිටල් සෞඛ්‍ය සේවාව හරහා ශ්‍රී ලංකාවේ PCOS කළමනාකරණය විප්ලවීය වෙනසකට ලක් කිරීම",
      about_mission_vision_title: "අපගේ මෙහෙවර සහ දැක්ම",
      about_mission_vision_p1: "PCOS Care Hub ආරම්භ කරන ලද්දේ එකම මෙහෙවරක් ඇතිවය: තාක්ෂණය, අධ්‍යාපනය සහ සත්කාර සම්බන්ධීකරණය හරහා PCOS සහිත ශ්‍රී ලාංකික කාන්තාවන් සවිබල ගැන්වීම.",
      about_mission_vision_p2: "PCOS යනු වෛද්‍යමය තත්ත්වයකට වඩා වැඩි යමක් බව අපි හඳුනා ගනිමු - එය ප්‍රජනන හැකියාව, මානසික සෞඛ්‍යය, බාහිර පෙනුම සහ සමස්ත යහපැවැත්මට බලපාන සංකීර්ණ ගමනකි.",
      about_mission_vision_p3: "අපගේ දැක්ම වන්නේ PCOS සමඟ ජීවත් වන සෑම කාන්තාවකටම විස්තීර්ණ මෙවලම්, විශ්වාසදායක සෞඛ්‍ය තොරතුරු සහ වෛද්‍ය වෘත්තිකයන්ගෙන් සහ අවබෝධයක් ඇති ප්‍රජාවන්ගෙන් සම්බන්ධිත සත්කාර ලබා ගත හැකි පද්ධතියක් නිර්මාණය කිරීමයි.",
      about_stat_patients: "වේදිකාව භාවිතා කරන කාන්තාවන්",
      about_stat_hospitals: "හවුල්කාර රෝහල් සහ සායන",
      about_stat_reports: "ආරක්ෂිත වෛද්‍ය වාර්තා",
      about_problem_title: "අපි විසඳන ගැටළුව",
      about_problem_1_title: "විසිරුණු වාර්තා",
      about_problem_1_desc: "PCOS සහිත කාන්තාවන් සෞඛ්‍ය සේවා සපයන්නන් කිහිප දෙනෙකු වෙත ගියත්, ඔවුන්ගේ සෞඛ්‍ය ගමන නිරීක්ෂණය කිරීමට මධ්‍යගත පද්ධතියක් නොමැත. වාර්තා නැති වීම සහ වෛද්‍යවරුන්ට සම්පූර්ණ ඉතිහාසය දැක ගැනීමට නොහැකි වීම මෙහි ඇති ගැටළුවයි.",
      about_problem_2_title: "සීමිත දැනුම",
      about_problem_2_desc: "ශ්‍රී ලාංකික කාන්තාවන්ගෙන් 13%ක් පීඩා විඳිතිත්, PCOS පිළිබඳ දැනුවත්භාවය තවමත් අඩු මට්ටමක පවතී. බොහෝ රෝගීන් තම තත්ත්වය හෝ ජීවන රටා වෙනස්කම් ගැන නිසි ලෙස නොදනිති.",
      about_problem_3_title: "සම්බන්ධ නොවන සත්කාර",
      about_problem_3_desc: "රෝගී-වෛද්‍ය සන්නිවේදනය හමුවීම් වාරවලට පමණක් සීමා වේ. රෝහල්වලට රෝගියාගේ දෛනික රෝග ලක්ෂණ සහ ජීවන රටා දත්ත ලබා ගැනීමට ක්‍රමයක් නොමැත.",
      about_problem_4_title: "මානසික සෞඛ්‍ය බර",
      about_problem_4_desc: "PCOS රෝගීන් විශාදය සහ කාංසාව අත්විඳීමට වැඩි ඉඩක් ඇත. ප්‍රජා සහාය සහ මානසික සෞඛ්‍ය සම්පත් නොමැතිව කාන්තාවන් බොහෝ විට තනිවී ඇති බව හැඟේ.",
      about_problem_5_title: "අසංස්ථිත ප්‍රමිතීන්",
      about_problem_5_desc: "රෝහල් පුරා රෝග විනිශ්චය සහ කළමනාකරණය බෙහෙවින් වෙනස් වේ. බොහෝ රෝගීන්ට ප්‍රමිතියෙන් යුත් ප්‍රතිකාර මාර්ගෝපදේශ සඳහා ප්‍රවේශය නොමැත.",
      about_problem_6_title: "පෞද්ගලිකත්වය සහ දත්ත පිළිබඳ ගැටළු",
      about_problem_6_desc: "කඩදාසි වාර්තා නැති වීමට හෝ වැරදි ලෙස පරිහරණය වීමට ඉඩ ඇත. සංවේදී සෞඛ්‍ය තොරතුරු බෙදා ගැනීමේදී කාන්තාවන් පෞද්ගලිකත්වය පිළිබඳව සැලකිලිමත් වේ.",
      about_solution_title: "අපි එය විසඳන ආකාරය",
      about_solution_main_title: "ඒකාබද්ධ ඩිජිටල් පද්ධතියක්",
      about_solution_1_title: "මධ්‍යගත සෞඛ්‍ය වාර්තා",
      about_solution_1_desc: "සියලුම වෛද්‍ය වාර්තා, පරීක්ෂණ ප්‍රතිඵල සහ රෝග ලක්ෂණ දත්ත එකම ආරක්ෂිත ස්ථානයක. වැදගත් ලියකියවිලි නැවත කිසිදා නැති නොවේ.",
      about_solution_2_title: "බුද්ධිමත් ලුහුබැඳීමේ මෙවලම්",
      about_solution_2_desc: "රෝග ලක්ෂණ, ඔසප් චක්‍ර සහ ජීවන රටා පුරුදු නිරීක්ෂණය කරන්න. ඔබේ ශරීරයට ආවේණික වූ රටාවන් හඳුනා ගැනීමට අපගේ පද්ධතිය උපකාරී වේ.",
      about_solution_3_title: "රෝහල් ඒකාබද්ධතාවය",
      about_solution_3_desc: "රෝහල්වලට ආරක්ෂිතව රෝගී දත්ත වෙත ප්‍රවේශ විය හැකි අතර රසායනාගාර ප්‍රතිඵල සජීවීව ඇතුළත් කළ හැකිය. අඩු ලිපි ලේඛන, වඩා හොඳ තීරණ.",
      about_solution_4_title: "විද්‍යාත්මක දැනුම",
      about_solution_4_desc: "PCOS පිළිබඳ විද්‍යාත්මක ලිපි, රෝග ලක්ෂණ මාර්ගෝපදේශ සහ පෝෂණ උපදෙස් සියල්ල එකම ස්ථානයකින් ලබා ගන්න.",
      about_solution_5_title: "ප්‍රජාව සහ සහාය",
      about_solution_5_desc: "PCOS කළමනාකරණය කරන අනෙකුත් කාන්තාවන් සමඟ සම්බන්ධ වන්න, අත්දැකීම් බෙදා ගන්න සහ එකිනෙකාට ශක්තියක් වන්න.",
      about_solution_6_title: "පෞද්ගලිකත්වය සහ ආරක්ෂාවට මුල් තැන",
      about_solution_6_desc: "ඉහළ පෙළේ සංකේතනය සහ ප්‍රවේශ පාලනයන් මගින් ඔබේ සංවේදී සෞඛ්‍ය දත්ත ආරක්ෂිතව පවතින බව සහතික කරයි.",
      about_values_title: "අපගේ මූලික වටිනාකම්",
      about_values_1_title: "රෝගියාට මුල් තැන",
      about_values_1_desc: "සෑම තීරණයක්ම සහ යාවත්කාලීන කිරීමක්ම ආරම්භ වන්නේ 'මෙය අපගේ රෝගීන්ට උපකාරී වේද?' යන ප්‍රශ්නයෙනි.",
      about_values_2_title: "ආරක්ෂාව සහ පෞද්ගලිකත්වය",
      about_values_2_desc: "ඔබේ සෞඛ්‍ය දත්ත පූජනීයයි. අපි ආරක්ෂාව සම්බන්ධයෙන් කිසිවිටෙකත් සම්මුතීන් ඇති කර නොගනිමු.",
      about_values_3_title: "විද්‍යාත්මක පදනම",
      about_values_3_desc: "සියලුම තොරතුරු සහ නිර්දේශ විද්‍යාත්මක පර්යේෂණ සහ සායනික හොඳම භාවිතයන් මත පදනම් වේ.",
      about_values_4_title: "පහසු ප්‍රවේශය",
      about_values_4_desc: "අඩු පිරිවැයක් සහිත, භාවිතයට පහසු සහ විශේෂයෙන් ශ්‍රී ලාංකික කාන්තාවන් සහ රෝහල් සඳහා නිර්මාණය කර ඇත.",
      about_context_title: "ශ්‍රී ලංකාවට PCOS Care Hub අවශ්‍ය වූයේ ඇයි?",
      about_context_subtitle: "ශ්‍රී ලාංකීය PCOS සන්දර්භය",
      about_context_1_title: "ඉහළ ව්‍යාප්තිය",
      about_context_1_desc: "ශ්‍රී ලංකාවේ ප්‍රජනක වයසේ පසුවන කාන්තාවන්ගෙන් 13%ක් පමණ PCOS රෝගයෙන් පීඩා විඳිති.",
      about_context_2_title: "විසිරුණු සෞඛ්‍ය සේවාවන්",
      about_context_2_desc: "නාගරික ප්‍රදේශවල සිටින කාන්තාවන්ට විශේෂඥ වෛද්‍යවරුන් වෙත ප්‍රවේශය තිබිය හැකි නමුත් ග්‍රාමීය ප්‍රදේශවල කාන්තාවන් ඒ සඳහා අපහසුතාවයට පත්වේ.",
      about_context_3_title: "විශේෂඥ වෛද්‍යවරුන්ගේ සීමිත ප්‍රවේශය",
      about_context_3_desc: "PCOS විශේෂඥ වෛද්‍යවරුන් ප්‍රධාන නගරවලට සීමා වී ඇත. බොහෝ කාන්තාවන් සාමාන්‍ය වෛද්‍යවරුන් මත යැපීමට සිදු වේ.",
      about_context_4_title: "ඩිජිටල් සෞඛ්‍ය පරතරය",
      about_context_4_desc: "ඩිජිටල් සෞඛ්‍ය සේවාවන් වර්ධනය වෙමින් පැවතුනද, ශ්‍රී ලාංකීය සන්දර්භය තුළ PCOS සඳහා වෙන්වූ වේදිකාවන් ඇත්තේ ඉතා අඩුවෙනි.",
      about_impact_title: "අපගේ මෙතෙක් බලපෑම",
      about_impact_1_title: "රෝගී තෘප්තිමත් වීමේ ප්‍රතිශතය",
      about_impact_1_desc: "අපගේ වේදිකාව හරහා කාන්තාවන් සවිබල ගැන්වෙන බව හැඟේ.",
      about_impact_2_title: "උඩුගත කළ වෛද්‍ය වාර්තා",
      about_impact_2_desc: "කාන්තාවන් තම සෞඛ්‍ය ලියකියවිලි ආරක්ෂිතව ගබඩා කර ඇත.",
      about_impact_3_title: "ළඟා වූ දිස්ත්‍රික්ක සංඛ්‍යාව",
      about_impact_3_desc: "ශ්‍රී ලංකාව පුරා සිටින කාන්තාවන් PCOS Care Hub භාවිතා කරති.",
      about_quote_text: "\"PCOS Care Hub ශ්‍රී ලංකාවේ PCOS කළමනාකරණය සඳහා සැබවින්ම විප්ලවීය වෙනසක් සිදු කර ඇත. මෙම වේදිකාව රෝගීන් සහ සෞඛ්‍ය සේවා සපයන්නන් අතර පරතරය නැති කරයි.\"",
      about_quote_author: "— වෛද්‍ය නිමල්කා ප්‍රනාන්දු, ප්‍රධාන ස්ත්‍රී රෝග විශේෂඥ වෛද්‍ය, මහනුවර රෝහල",
      about_cta_title: "අපගේ මෙහෙවරට එක්වන්න",
      about_cta_desc: "ඔබ PCOS කළමනාකරණය කරන කාන්තාවක් හෝ සෞඛ්‍ය සේවා සපයන්නෙකු වුවද, ශ්‍රී ලංකාවේ PCOS සත්කාරය වෙනස් කිරීමට ඔබට දායක විය හැකිය.",
      about_btn_explore: "විශේෂාංග ගවේෂණය කරන්න",
      features_hero_title: "සෑම භූමිකාවකටම ගැළපෙන බලවත් විශේෂාංග",
      features_hero_subtitle: "රෝගීන්, රෝහල් සහ පරිපාලකයින් සඳහා PCOS වඩා හොඳින් කළමනාකරණය කිරීමට නිර්මාණය කර ඇති මෙවලම්",
      features_patient_badge: "රෝගී විශේෂාංග",
      features_patient_title: "ඔබේ PCOS ගමන කළමනාකරණය කිරීමට මෙවලම්",
      features_symptom_title: "රෝග ලක්ෂණ නිරීක්ෂණය",
      features_symptom_desc: "ඔබේ දෛනික රෝග ලක්ෂණ අපගේ පහසු පද්ධතිය හරහා සටහන් කරන්න. ඔසප් වීමේ අක්‍රමිකතා, කුරුලෑ, හිසකෙස් ගැලවී යාම ආදිය නිරීක්ෂණය කරන්න.",
      features_symptom_li1: "තත්පර කිහිපයකින් රෝග ලක්ෂණ සටහන් කරන්න",
      features_symptom_li2: "දත්ත ප්‍රස්ථාර සහ විශ්ලේෂණ",
      features_symptom_li3: "රෝග ලක්ෂණ උද්දීපනය වන අවස්ථා හඳුනා ගන්න",
      features_symptom_li4: "වෛද්‍ය හමුවීම් සඳහා වාර්තා ලබා ගන්න",
      features_cycle_title: "ඔසප් චක්‍ර නිරීක්ෂකය",
      features_cycle_desc: "ඔබේ ඔසප් චක්‍රය ඉතා නිවැරදිව නිරීක්ෂණය කරන්න. චක්‍රයේ කාලසීමාව සහ තීව්‍රතාවය සටහන් කරන්න.",
      features_cycle_li1: "ඔසප් දින පහසුවෙන් සටහන් කරන්න",
      features_cycle_li2: "ඩිම්බ මෝචනය වන කාලය පුරෝකථනය කරන්න",
      features_cycle_li3: "හමුවීම් පිළිබඳ මතක් කිරීම් ලබා ගන්න",
      features_cycle_li4: "චක්‍රයේ රටාවන් තේරුම් ගන්න",
      features_records_title: "ආරක්ෂිත වෛද්‍ය වාර්තා",
      features_records_desc: "ඔබේ සියලුම වෛද්‍ය වාර්තා එකම ආරක්ෂිත ස්ථානයක ගබඩා කරන්න.",
      features_records_li1: "ඕනෑම වෛද්‍ය ලේඛනයක් උඩුගත කරන්න",
      features_records_li2: "ඉහළම මට්ටමේ සංකේතනය",
      features_records_li3: "ප්‍රවේශය පාලනය කරන්න",
      features_records_li4: "වෛද්‍යවරුන් සමඟ බෙදා ගන්න",
      features_lifestyle_title: "ජීවන රටා සහ පෝෂණ නිරීක්ෂකය",
      features_lifestyle_desc: "ඔබේ දෛනික ආහාර වේල, ව්‍යායාම සහ නින්දේ ගුණාත්මකභාවය සටහන් කරන්න.",
      features_lifestyle_li1: "ආහාර සහ පෝෂණය සටහන් කරන්න",
      features_lifestyle_li2: "ව්‍යායාම සහ ක්‍රියාකාරකම් නිරීක්ෂණය",
      features_lifestyle_li3: "නින්දේ රටාවන් නිරීක්ෂණය",
      features_lifestyle_li4: "ජීවන රටාව සහ රෝග ලක්ෂණ අතර සම්බන්ධය තේරුම් ගන්න",
      features_hosp_conn_title: "රෝහල් ඒකාබද්ධතාවය",
      features_hosp_conn_desc: "ශ්‍රී ලංකාව පුරා ඇති අපගේ හවුල්කාර රෝහල් ජාලය සමඟ සෘජුවම සම්බන්ධ වන්න.",
      features_hosp_conn_li1: "ඔබේ දත්ත රෝහල සමඟ බෙදා ගන්න",
      features_hosp_conn_li1: "ඔබේ දත්ත රෝහල සමඟ බෙදා ගන්න",
      features_hosp_conn_li2: "රසායනාගාර ප්‍රතිඵල අන්තර්ජාලය හරහා ලබා ගන්න",
      features_hosp_conn_li3: "හමුවීම් වෙන් කරවා ගැනීම සහ කළමනාකරණය",
      features_hosp_conn_li4: "ඔබේ වෛද්‍ය කණ්ඩායමට පණිවිඩ යවන්න",
      features_hosp_badge: "රෝහල් විශේෂාංග",
      features_hosp_title: "රෝගී කළමනාකරණය විධිමත් කිරීම",
      features_hosp_record_title: "රෝගී වාර්තා කළමනාකරණය",
      features_hosp_record_desc: "රෝගියාගේ සම්පූර්ණ සෞඛ්‍ය ඉතිහාසය වහාම ලබා ගන්න. සියලුම ලේඛන සහ උපදේශන සටහන් එකම ආරක්ෂිත ස්ථානයකින් බලන්න.",
      features_hosp_lab_title: "රසායනාගාර ප්‍රතිඵල උඩුගත කිරීම",
      features_hosp_lab_desc: "රසායනාගාර ප්‍රතිඵල රෝගියාගේ ගිණුමට සෘජුවම ඇතුළත් කරන්න. රෝගීන්ට ඒ පිළිබඳව දැනුම්දීම් ලැබෙනු ඇත.",
      features_hosp_consult_title: "උපදේශන කළමනාකරණය",
      features_hosp_consult_desc: "හමුවීම් කාලසටහන්ගත කිරීම, පරීක්ෂණ සටහන් බෙදා ගැනීම සහ රෝගීන් සමඟ සන්නිවේදනය කිරීම.",
      features_hosp_search_title: "උසස් රෝගී සෙවුම",
      features_hosp_search_desc: "නම, හැඳුනුම්පත හෝ දුරකථන අංකය මගින් රෝගීන් ඉක්මනින් සොයා ගන්න.",
      features_hosp_analytics_title: "රෝහල් විශ්ලේෂණ",
      features_hosp_analytics_desc: "රෝගී දත්ත පිළිබඳ ප්‍රස්ථාර සහ වාර්තා බලන්න.",
      features_hosp_rbac_title: "භූමිකාව මත පදනම් වූ ප්‍රවේශය",
      features_hosp_rbac_desc: "සේවකයින්ට විවිධ ප්‍රවේශ මට්ටම් ලබා දී රෝගීන්ගේ පෞද්ගලිකත්වය සුරකින්න.",
      features_admin_badge: "පරිපාලක විශේෂාංග",
      features_admin_title: "පද්ධති අධීක්ෂණය සහ කළමනාකරණය",
      features_admin_user_title: "පරිශීලක කළමනාකරණය",
      features_admin_user_desc: "සියලුම පරිශීලක ගිණුම් කළමනාකරණය කරන්න. රෝගීන් සහ රෝහල් ලියාපදිංචි කිරීම හෝ අත්හිටුවීම සිදු කරන්න.",
      features_admin_hosp_title: "රෝහල් අනුමත කිරීම්",
      features_admin_hosp_desc: "අලුතින් ලියාපදිංචි වන රෝහල් පරීක්ෂා කර අනුමත කරන්න.",
      features_admin_audit_title: "විගණන වාර්තා",
      features_admin_audit_desc: "පද්ධතියේ සියලුම ක්‍රියාකාරකම් අධීක්ෂණය කරන්න.",
      features_admin_analytics_title: "විශ්ලේෂණ උපකරණ පුවරුව",
      features_admin_analytics_desc: "පරිශීලක සංඛ්‍යාලේඛන සහ වර්ධන වේගය පිළිබඳ වාර්තා බලන්න.",
      features_admin_config_title: "පද්ධති සැකසුම්",
      features_admin_config_desc: "පද්ධති සැකසුම්, දැනුම්දීම් සහ ප්‍රතිපත්ති කළමනාකරණය කරන්න.",
      features_admin_security_title: "ආරක්ෂාව සහ අධීක්ෂණය",
      features_admin_security_desc: "ආරක්ෂක සැකසුම් කළමනාකරණය සහ පද්ධති ස්ථායීතාවය සහතික කිරීම.",
      features_common_title: "අවශ්‍ය සියලුම විශේෂාංග",
      features_common_title: "අවශ්‍ය සියලුම විශේෂාංග",
      features_common_mobile_title: "ජංගම දුරකථන සඳහා සුදුසු",
      features_common_mobile_desc: "ඕනෑම උපාංගයකින් - පරිගණක, ටැබ්ලට් හෝ ජංගම දුරකථන - PCOS Care Hub වෙත ප්‍රවේශ වන්න.",
      features_common_notif_title: "ස්මාර්ට් දැනුම්දීම්",
      features_common_notif_desc: "හමුවීම්, ඖෂධ, චක්‍ර සහ වැදගත් අවස්ථාවන් සඳහා නියමිත වේලාවට මතක් කිරීම් ලබා ගන්න.",
      features_common_lang_title: "බහු භාෂා සහාය",
      features_common_lang_desc: "ඉංග්‍රීසි, සිංහල සහ දෙමළ භාෂාවලින් ලබා ගත හැකිය. ඔබට කැමති භාෂාවකින් වෛද්‍යවරුන් සමඟ සම්බන්ධ වන්න.",
      features_common_export_title: "දත්ත අපනයනය",
      features_common_export_desc: "ඔබේ සෞඛ්‍ය දත්ත වෙනත් වෛද්‍යවරුන් සමඟ බෙදා ගැනීමට හෝ පුද්ගලික වාර්තා ලෙස තබා ගැනීමට අපනයනය කරන්න.",
      features_common_enc_title: "මුන-සිට-මුන සංකේතනය",
      features_common_enc_desc: "ඔබේ දත්ත සම්ප්‍රේෂණය වන විට සහ ගබඩා කර ඇති විට සංකේතනය කර ඇත.",
      features_common_acc_title: "පහසු ප්‍රවේශය",
      features_common_acc_desc: "සියලුම හැකියාවන් සහිත පරිශීලකයින් සඳහා නිර්මාණය කර ඇත.",
      features_common_fast_title: "ඉතා වේගවත්",
      features_common_fast_desc: "මන්දගාමී අන්තර්ජාල සම්බන්ධතා වල පවා හොඳින් ක්‍රියා කරයි.",
      features_common_support_title: "24/7 සහාය",
      features_common_support_desc: "උදව් අවශ්‍යද? අපගේ සහාය කණ්ඩායම සූදානම්.",
      features_comp_title: "පංගු අනුව විශේෂාංග සැසඳීම",
      features_comp_th_feature: "විශේෂාංගය",
      features_comp_th_patient: "රෝගියා",
      features_comp_th_hospital: "රෝහල",
      features_comp_th_admin: "පරිපාලක",
      features_comp_row_symptom: "රෝග ලක්ෂණ නිරීක්ෂණය",
      features_comp_row_cycle: "චක්‍ර නිරීක්ෂණය",
      features_comp_row_records: "වෛද්‍ය වාර්තා උඩුගත කිරීම",
      features_comp_row_lifestyle: "ජීවන රටා නිරීක්ෂණය",
      features_comp_row_results: "රෝහල් ප්‍රතිඵල බැලීම",
      features_comp_row_search: "රෝගීන් සෙවීම සහ ප්‍රවේශය",
      features_comp_row_lab: "රසායනාගාර ප්‍රතිඵල ඇතුළත් කිරීම",
      features_comp_row_consult: "උපදේශන කළමනාකරණය",
      features_comp_row_user: "පරිශීලක කළමනාකරණය",
      features_comp_row_hosp_app: "රෝහල් අනුමත කිරීම්",
      features_comp_row_analytics: "ප්‍රස්ථාර සහ විගණන වාර්තා",
      features_cta_title: "මෙම විශේෂාංග අත්විඳීමට සූදානම්ද?",
      features_cta_desc: "PCOS කළමනාකරණය වෙනස් කිරීමට අප හා එක්වන්න.",
      features_btn_learn_pcos: "PCOS ගැන ඉගෙන ගන්න",
      track_symptoms_opt: "රෝග ලක්ෂණ නිරීක්ෂණය",
      track_symptoms_opt: "රෝග ලක්ෂණ නිරීක්ෂණය",
      cycle: "ඔසප් චක්‍රය",
      lifestyle: "ජීවන රටා සටහන",
      footer_about_title: "PCOS Care Hub ගැන",
      about_hub_title: "PCOS Care Hub ගැන",
      about_hub_text_1: "පොලිසිස්ටික් ඕවරි සින්ඩ්‍රෝමය (PCOS) යනු ප්‍රජනක වයසේ පසුවන කාන්තාවන්ගෙන් 8-13% කට බලපාන දිගුකාලීන හෝමෝන තත්ත්වයකි. ශ්‍රී ලංකාවේ බොහෝ කාන්තාවන් විසිරුණු කඩදාසි වාර්තා, සීමිත වෛද්‍ය-රෝගී සන්නිවේදනය සහ මධ්‍යගත කළමනාකරණ පද්ධතියක් නොමැතිකම නිසා අපහසුතාවයට පත් වේ.",
      about_hub_text_2: "මෙම ගැටළු මඟහරවා ගැනීම සඳහා PCOS Care Hub විශේෂයෙන් නිර්මාණය කර ඇත — රෝගීන්, රෝහල් සහ පරිපාලකයින් සියලු දෙනාටම එකම පද්ධතියක් තුළ සම්බන්ධ වී ක්‍රියා කළ හැකි ආරක්ෂිත වේදිකාවක් මෙයින් සැපයෙයි.",
      portal_title: "රෝගී ද්වාරය",
      portal_desc: "රෝග ලක්ෂණ, ඔසප් චක්‍ර, ජීවන රටා දත්ත නිරීක්ෂණය කරන්න, වාර්තා උඩුගත කරන්න සහ ඔබේ සෞඛ්‍ය ඉතිහාසය බලන්න.",
      interface_title: "රෝහල් අතුරුමුහුණත",
      interface_desc: "රසායනාගාර ප්‍රතිඵල, වෛද්‍ය උපදෙස් සහ රෝගී වාර්තා ආරක්ෂිතව කළමනාකරණය කරන්න.",
      admin_title: "පරිපාලක පුවරුව",
      admin_desc: "සම්පූර්ණ පද්ධති අධීක්ෂණය, රෝහල් අනුමැතිය, පරිශීලක කළමනාකරණය සහ විගණන වාර්තා.",
      btn_join: "PCOS Care Hub සමඟ සම්බන්ධ වන්න",
      platform_features_title: "වේදිකාවේ විශේෂාංග",
      features_main_title: "PCOS කළමනාකරණයට ඔබට අවශ්‍ය සියල්ල",
      features_main_subtitle: "රෝගීන්, රෝහල් සහ පරිපාලකයින්ට බාධාවකින් තොරව එක්ව ක්‍රියා කළ හැකි පරිදි නිර්මාණය කර ඇති සම්පූර්ණ මෙවලම් කට්ටලය.",
      feat_symptom_title: "රෝග ලක්ෂණ නිරීක්ෂණය",
      feat_symptom_desc: "අක්‍රමවත් ඔසප් වීම, කුරුලෑ, රෝම හැලීම, තෙහෙට්ටුව සහ මනෝභාවය වෙනස් වීම් වැනි දෛනික රෝග ලක්ෂණ සටහන් කරන්න. ප්‍රස්ථාර මගින් ඔබේ සෞඛ්‍ය රටාවන් විශ්ලේෂණය කරන්න.",
      feat_cycle_title: "ඔසප් චක්‍ර නිරීක්ෂකය",
      feat_cycle_desc: "චක්‍රයේ දිග, රුධිර වහනය වන ප්‍රමාණය නිරීක්ෂණය කරන්න සහ ඩිම්බ මෝචනය වන කාලය කල්තියා දැනගන්න. මතක් කිරීම් සහ උපදෙස් ලබා ගන්න.",
      feat_records_title: "ආරක්ෂිත වෛද්‍ය වාර්තා",
      feat_records_desc: "රසායනාගාර වාර්තා, ස්කෑන් වාර්තා සහ බෙහෙත් වට්ටෝරු ආරක්ෂිතව උඩුගත කර තබා ගන්න. දැන් ඔබේ වෛද්‍ය ඉතිහාසය ඕනෑම වේලාවක ලබා ගත හැකිය.",
      feat_hosp_title: "රෝහල් ඒකාබද්ධතාවය",
      feat_hosp_desc: "රෝහල්වලට රසායනාගාර ප්‍රතිඵල කෙලින්ම රෝගී ගිණුම්වලට ඇතුළත් කළ හැකිය. එමගින් වෛද්‍යවරුන්ට නිවැරදි වෛද්‍ය ඉතිහාසයක් දැක ගත හැකිය.",
      feat_lifestyle_title: "ජීවන රටාව සහ පෝෂණ සටහන",
      feat_lifestyle_desc: "ඔබේ දෛනික ආහාර වේල, ජලය පානය කිරීම, ව්‍යායාම සහ නින්දේ ගුණාත්මකභාවය නිරීක්ෂණය කරන්න. PCOS සඳහා සුදුසු උපදෙස් ලබා ගන්න.",
      feat_role_title: "ආරක්ෂිත ප්‍රවේශ පාලනය",
      feat_role_desc: "රෝගියා, රෝහල සහ පරිපාලක ලෙස භූමිකාවන් තුනක් ඇත — පෞද්ගලිකත්වය සහ ආරක්ෂාව තහවුරු කරන පරිදි ප්‍රවේශය සීමා කර ඇත.",
      knowledge_center: "PCOS දැනුම මධ්‍යස්ථානය",
      knowledge_title: "PCOS ගැන ඔබ දැනගත යුතු සියල්ල",
      knowledge_subtitle: "PCOS අවබෝධ කර ගැනීමට සහ සාර්ථකව කළමනාකරණය කිරීමට අවශ්‍ය විද්‍යාත්මක තොරතුරු.",
      know_symptoms: "රෝග ලක්ෂණ",
      know_causes: "හේතු",
      know_treatment: "ප්‍රතිකාර",
      know_diet: "ආහාර සහ ජීවන රටාව",
      know_mental: "මානසික සෞඛ්‍යය",
      symp_periods_title: "අක්‍රමවත් ඔසප් වීම",
      symp_periods_desc: "වසරකට ඔසප් වාර 8කට වඩා අඩු වීම, දින 35කට වඩා වැඩි චක්‍ර හෝ ඔසප් වීම සම්පූර්ණයෙන්ම නතර වීම. මෙය ප්‍රධාන PCOS රෝග ලක්ෂණයකි.",
      symp_androgen_title: "අධික ඇන්ඩ්‍රොජන් මට්ටම",
      symp_androgen_desc: "පුරුෂ හෝමෝන වැඩි වීම නිසා මුහුණේ/ශරීරයේ අනවශ්‍ය රෝම වර්ධනය, අධික ලෙස කුරුලෑ ඇතිවීම සහ හිසකෙස් තුනී වීම සිදු වේ.",
      symp_ovaries_title: "බහු කෝෂ්ඨික ඩිම්බ කෝෂ (Polycystic Ovaries)",
      symp_ovaries_desc: "ඩිම්බ වටා කුඩා දියර පිරුණු බුබුලු සහිත විශාල වූ ඩිම්බ කෝෂ. මෙය ස්කෑන් පරීක්ෂණයකින් දැක ගත හැකිය.",
      symp_weight_title: "ශරීර බරේ වෙනස්වීම්",
      symp_weight_desc: "හේතුවක් නොමැතිව බර වැඩි වීම හෝ ආහාර පාලනය කළත් බර අඩු කර ගැනීමට ඇති අපහසුව. මෙයට ඉන්සියුලින් ප්‍රතිරෝධය බලපෑ හැකිය.",
      symp_fatigue_title: "තෙහෙට්ටුව සහ නින්ද ආශ්‍රිත ගැටළු",
      symp_fatigue_desc: "නිතර දැනෙන වෙහෙස, ශක්තිය අඩු බව සහ නින්ද නොයාම PCOS හි පොදු ලක්ෂණ වේ.",
      symp_mood_title: "මනෝභාවය වෙනස් වීම්",
      symp_mood_desc: "හෝමෝන උච්චාවචනයන් සහ දිගුකාලීන රෝගී තත්ත්වයක චිත්තවේගීය බලපෑම හේතුවෙන් PCOS සහිත කාන්තාවන් අතර විශාදය, කාංසාව සහ මනෝභාවය වෙනස් වීම් වැඩි වශයෙන් දක්නට ලැබේ.",
      cause_insulin_title: "ඉන්සියුලින් ප්‍රතිරෝධය",
      cause_insulin_desc: "PCOS සහිත කාන්තාවන්ගෙන් 70%ක් දක්වා ඉන්සියුලින් ප්‍රතිරෝධය පවතී. සෛල ඉන්සියුලින් වලට නිසි ලෙස ප්‍රතිචාර නොදක්වන විට, අග්න්‍යාශය වැඩිපුර ඉන්සියුලින් නිපදවන අතර, එය අතිරික්ත ඇන්ඩ්‍රොජන් නිෂ්පාදනය උත්තේජනය කළ හැකිය.",
      cause_genetics_title: "ජාන විද්‍යාව",
      cause_genetics_desc: "PCOS පවුල් අතර පැතිරීමේ ප්‍රවණතාවක් පවතී. ඔබේ මවට හෝ සහෝදරියට PCOS තිබේ නම්, ඔබට එය වැළඳීමේ වැඩි අවදානමක් ඇත. මේ සඳහා ජාන කිහිපයක් බලපෑ හැකිය.",
      cause_hormone_title: "හෝමෝන අසමතුලිතතාවය",
      cause_hormone_desc: "ඇන්ඩ්‍රොජන් (පුරුෂ හෝමෝන) අතිරික්තයක් නිපදවීම නිසා ඩිම්බ කෝෂ වල ක්‍රියාකාරිත්වයට බාධා ඇති වන අතර නිතිපතා ඩිම්බ මෝචනය වීම වළක්වයි. LH සහ FSH හෝමෝන අසමතුලිතතාවය ද මේ සඳහා බලපායි.",
      cause_inflammation_title: "ප්‍රදාහය (Inflammation)",
      cause_inflammation_desc: "PCOS සහිත කාන්තාවන් අතර දිගුකාලීන අඩු මට්ටමේ ප්‍රදාහයක් දක්නට ලැබෙන අතර එය ඇන්ඩ්‍රොජන් නිපදවීමට ඩිම්බ කෝෂ උත්තේජනය කළ හැකිය. ආහාර, ජීවන රටාව සහ බඩවැල්වල සෞඛ්‍යය මේ සඳහා බලපායි.",
      treat_pill_title: "හෝමෝන උපත් පාලන ක්‍රම",
      treat_pill_desc: "සංයුක්ත මුඛ උපත් පාලන පෙති මගින් මාසික ඔසප් චක්‍රය නියාමනය කිරීමට, ඇන්ඩ්‍රොජන් මට්ටම අඩු කිරීමට, කුරුලෑ සුව කිරීමට සහ අනවශ්‍ය රෝම වර්ධනය අඩු කිරීමට උපකාරී වේ.",
      treat_metformin_title: "මෙට්ෆෝමින් (Metformin)",
      treat_metformin_desc: "ඉන්සියුලින් සංවේදීතාව වැඩි කරන මෙම ඖෂධය මගින් ඉන්සියුලින් ප්‍රතිරෝධය වැඩි දියුණු කිරීමට, ඔසප් චක්‍රය නියාමනය කිරීමට සහ බර පාලනය කිරීමට උපකාරී වේ.",
      treat_lifestyle_title: "ජීවන රටා චිකිත්සාව",
      treat_lifestyle_desc: "ශරීර බර 5-10% කින් අඩු කර ගැනීමෙන් පවා PCOS රෝග ලක්ෂණ සැලකිය යුතු ලෙස වැඩි දියුණු කළ හැකිය. නිතිපතා ව්‍යායාම සහ සමබර ආහාර වේලක් මේ සඳහා ඉතා වැදගත් වේ.",
      treat_fertility_title: "ප්‍රජනක ප්‍රතිකාර",
      treat_fertility_desc: "දරුවන් බලාපොරොත්තු වන කාන්තාවන් සඳහා, ඩිම්බ මෝචනය උත්තේජනය කිරීමේ ඖෂධ සහ ඇතැම් අවස්ථාවලදී ලැපරොස්කොපික් සැත්කම් වැනි විකල්ප පවතී.",
      diet_gi_title: "අඩු ග්ලයිසීමික් ආහාර රටාව (Low GI Diet)",
      diet_gi_desc: "ලේ වල සීනි මට්ටම ඉක්මනින් ඉහළ නොදමන ආහාර (මුළු ධාන්‍ය, පියලි වර්ග, එළවළු සහ පලතුරු) ඉන්සියුලින් ප්‍රතිරෝධය පාලනය කිරීමට උපකාරී වේ.",
      diet_anti_title: "ප්‍රති-ප්‍රදාහ ආහාර",
      diet_anti_desc: "තෙල් සහිත මාළු, පලා වර්ග, බෙරි වර්ග, ඇට වර්ග සහ ඔලිව් තෙල් ආහාරයට එක් කර ගන්න. ඔමේගා-3 මගින් ඇන්ඩ්‍රොජන් මට්ටම අඩු කර ඉන්සියුලින් සංවේදීතාව වැඩි කළ හැකිය.",
      diet_exercise_title: "නිතිපතා ව්‍යායාම",
      diet_exercise_desc: "සතියකට අවම වශයෙන් විනාඩි 150ක්වත් මධ්‍යස්ථ ව්‍යායාම වල නිරත වන්න. ශක්ති පුහුණුව මගින් ඉන්සියුලින් සංවේදීතාව වැඩි කරන අතර හෘද රෝග ව්‍යායාම බර පාලනයට උපකාරී වේ.",
      diet_sleep_title: "නින්ද සහ ආතති කළමනාකරණය",
      diet_sleep_desc: "අඩු නින්ද ඉන්සියුලින් ප්‍රතිරෝධය සහ හෝමෝන සමබරතාවය නරක අතට හැරවිය හැකිය. දිනකට පැය 7-9ක නින්දක් ලබා ගන්න. යෝග සහ භාවනා මගින් ආතතිය අඩු කර ගත හැකිය.",
      mental_anxiety_title: "විශාදය සහ කාංසාව",
      mental_anxiety_desc: "PCOS සහිත කාන්තාවන් විශාදය සහ කාංසාව අත්විඳීමට වැඩි ඉඩක් ඇත. හෝමෝන වෙනස්වීම් සහ ශරීර ස්වරූපය පිළිබඳ ගැටළු මෙයට බලපායි. සහාය ලබා ගැනීම ඉතා වැදගත් වේ.",
      mental_image_title: "ශරීර ස්වරූපය සහ ආත්ම අභිමානය",
      mental_image_desc: "කුරුලෑ, රෝම වර්ධනය සහ බර වැඩිවීම වැනි රෝග ලක්ෂණ ආත්ම විශ්වාසයට බලපෑ හැකිය. PCOS Care Hub ඔබට මේ සඳහා සහාය වන ප්‍රජාවන් සමඟ සම්බන්ධ වීමට උපකාරී වේ.",
      mental_support_title: "සහායක ජාල",
      mental_support_desc: "PCOS සහිත අනෙක් පුද්ගලයින් සමඟ සම්බන්ධ වීමෙන් තනිකම අඩු වන අතර මානසික සුවතාවය වැඩි දියුණු වේ. මාර්ගගත ප්‍රජාවන් සහ ප්‍රතිකාර කණ්ඩායම් මේ සඳහා උපකාරී වේ.",
      mental_cbt_title: "ප්‍රජානන චර්යාත්මක චිකිත්සාව (CBT)",
      mental_cbt_desc: "PCOS හි විශාදය, කාංසාව සහ ශරීර ස්වරූපය පිළිබඳ ගැටළු වැඩි දියුණු කිරීම සඳහා CBT ප්‍රතිකාරය සාර්ථක බව පෙනී ගොස් ඇත.",
      stat_women_global: "ලොව පුරා බලපෑමට ලක් වූ කාන්තාවන්",
      stat_prev_sl: "ශ්‍රී ලංකාවේ ව්‍යාප්තිය",
      stat_partner_hosp: "හවුල්කාර රෝහල්",
      stat_sat_rate: "රෝගී තෘප්තිමත් වීමේ ප්‍රතිශතය",
      how_works_title_small: "එය ක්‍රියා කරන ආකාරය",
      how_works_title: "සරල පියවර 4කින් ආරම්භ කරන්න",
      how_works_subtitle: "බුද්ධිමත්ව PCOS කළමනාකරණය කරන දහස් ගණන් ශ්‍රී ලාංකික කාන්තාවන් සමඟ සම්බන්ධ වන්න.",
      step_1_title: "ගිණුමක් සාදන්න",
      step_1_desc: "මිනිත්තු කිහිපයකින් ආරක්ෂිතව රෝගියෙකු හෝ රෝහලක් ලෙස ලියාපදිංචි වන්න.",
      step_2_title: "ඔබේ පැතිකඩ සකස් කරන්න",
      step_2_desc: "ඔබේ සෞඛ්‍ය ඉතිහාසය ඇතුළත් කර ඔබේ රෝහල සමඟ සම්බන්ධ වන්න.",
      step_3_title: "නිරීක්ෂණය සහ පරීක්ෂාව",
      step_3_desc: "දෛනික රෝග ලක්ෂණ, චක්‍ර, ආහාර සහ ක්‍රියාකාරකම් සටහන් කරන්න. ඔබේ සෞඛ්‍ය රටාවන් නිරීක්ෂණය කරන්න.",
      step_4_title: "වෛද්‍ය සේවාවන් සමඟ සම්බන්ධ වන්න",
      step_4_desc: "ඔබේ වාර්තා රෝහල සමඟ බෙදා ගන්න, රසායනාගාර ප්‍රතිඵල ලබා ගන්න සහ සම්පූර්ණ දත්ත සමඟ වෛද්‍ය උපදෙස් ලබා ගන්න.",
      roles_title_small: "පරිශීලක භූමිකාවන්",
      roles_title: "PCOS ගමනේ සිටින සෑම කෙනෙකුටම නිර්මාණය කර ඇත",
      role_patient_title: "රෝගී පිවිසුම",
      role_patient_subtitle: "බලගතු ස්වයං කළමනාකරණ මෙවලම් සමඟ ඔබේ සෞඛ්‍ය ගමන පාලනය කරන්න.",
      role_patient_feat_1: "රෝග ලක්ෂණ සහ චක්‍ර නිරීක්ෂණය",
      role_patient_feat_2: "වාර්තා උඩුගත කිරීම සහ කළමනාකරණය",
      role_patient_feat_3: "ජීවන රටාව සහ ආහාර පාලනය",
      role_patient_feat_4: "රසායනාගාර ප්‍රතිඵල බලන්න",
      role_patient_feat_5: "හමුවීම් පිළිබඳ මතක් කිරීම්",
      role_patient_btn: "රෝගියෙකු ලෙස ඇතුළු වන්න",
      role_hospital_title: "රෝහල් පිවිසුම",
      role_hospital_subtitle: "රෝගී කළමනාකරණය විධිමත් කර වෛද්‍ය තීරණ ගැනීම වැඩි දියුණු කරන්න.",
      role_hospital_feat_1: "රෝගී වාර්තා කළමනාකරණය",
      role_hospital_feat_2: "රසායනාගාර ප්‍රතිඵල උඩුගත කිරීම",
      role_hospital_feat_3: "වෛද්‍ය උපදෙස් කළමනාකරණය",
      role_hospital_feat_4: "රෝගී ඉතිහාසය පරීක්ෂා කිරීම",
      role_hospital_feat_5: "ආරක්ෂිත ප්‍රවේශ පාලනය",
      role_hospital_btn: "රෝහලක් ලෙස ඇතුළු වන්න",
      testimonials_title: "අපගේ පරිශීලකයින් පවසන දේ",
      testimonial_1_text: "\"PCOS Care Hub මගේ රෝගී තත්ත්වය කළමනාකරණය කරන ආකාරය සම්පූර්ණයෙන්ම වෙනස් කර ඇත. දැන් මම වාර්තා නැතිවීම ගැන කරදර වෙන්නේ නැහැ — සියල්ල ආරක්ෂිතයි. රෝහලේ මගේ වෛද්‍යවරයාට දැන් මගේ සම්පූර්ණ ඉතිහාසය දැක ගත හැකිය.\"",
      role_patient_colombo: "රෝගියා, කොළඹ",
      testimonial_2_text: "\"ස්ත්‍රී රෝග විශේෂඥ වෛද්‍යවරයකු ලෙස, රෝහල් ද්වාරය හරහා රෝගීන්ගේ සම්පූර්ණ රෝග ලක්ෂණ ඉතිහාසය සහ වාර්තා වෙත ප්‍රවේශ වීමට ලැබීම මගේ වෛද්‍ය උපදෙස් ලබා දීම බෙහෙවින් වැඩි දියුණු කර ඇත. වෛද්‍ය තීරණ දැන් දත්ත මත පදනම් වේ.\"",
      role_doctor_kandy: "විශේෂඥ වෛද්‍ය, මහනුවර",
      testimonial_3_text: "\"චක්‍ර නිරීක්ෂකය සහ රෝග ලක්ෂණ සටහන් කිරීමේ විශේෂාංග විශිෂ්ටයි. මට මීට පෙර කිසිදා නොදැක්ක රටාවන් දැන් දැක ගත හැකිය. ජීවන රටා ලුහුබැඳීම මගේ ආහාර සහ ව්‍යායාම ඉලක්ක කරා යාමට මට උපකාරී වේ.\"",
      role_patient_gampaha: "රෝගියා, ගම්පහ",
      btn_add_review: "✍️ ඔබේ අදහස එක් කරන්න",
      review_modal_title: "ඔබේ අත්දැකීම් බෙදා ගන්න",
      full_name_label: "ඔබේ නම",
      rev_role_label: "භූමිකාව / ස්ථානය",
      rev_role_placeholder: "උදා: රෝගියා, කොළඹ",
      rating_label: "ශ්‍රේණිගත කිරීම",
      rating_5: "★★★★★ (තරු 5/5)",
      rating_4: "★★★★☆ (තරු 4/5)",
      rating_3: "★★★☆☆ (තරු 3/5)",
      rating_2: "★★☆☆☆ (තරු 2/5)",
      rating_1: "★☆☆☆☆ (තරු 1/5)",
      rev_text_label: "ඔබේ අවංක අදහස",
      rev_text_placeholder: "PCOS Care Hub ඔබට උපකාරී වූ ආකාරය අපට කියන්න...",
      btn_submit_review: "අදහස ඉදිරිපත් කරන්න",
      review_success_msg: "අදහස එක් කිරීම ගැන ස්තූතියි!",
      cta_journey_title: "අදම ඔබේ PCOS ගමන ආරම්භ කරන්න",
      cta_journey_desc: "තම PCOS තත්ත්වය බුද්ධිමත්ව සහ විශ්වාසයෙන් යුතුව කළමනාකරණය කරන දහස් ගණන් ශ්‍රී ලාංකික කාන්තාවන් සමඟ සම්බන්ධ වන්න.",
      hosp_title: "හවුල්කාර රෝහල් — PCOS Care Hub",
      hosp_hero_title: "අපගේ හවුල්කාර රෝහල් ජාලය",
      hosp_hero_desc: "ශ්‍රී ලංකාවේ ප්‍රමුඛතම රෝහල් සමඟ සම්බන්ධ වී ඔබේ PCOS කළමනාකරණය සඳහා විශේෂඥ සහාය ලබා ගන්න.",
      hosp_hero_subtitle: "ශ්‍රී ලංකාව පුරා විසිරී ඇති PCOS සහ කාන්තා සෞඛ්‍ය පිළිබඳ විශේෂඥ රෝහල් සමඟ සම්බන්ධ වන්න.",
      hosp_spec_gynae: "නාරිවේදය",
      hosp_spec_fertility: "සරුභාවය",
      hosp_spec_subfertility: "අඩු සරුභාවය",
      hosp_spec_wellwoman: "Well Woman සායනය",
      hosp_spec_surgical: "උසස් ශල්‍යකර්ම",
      hosp_spec_endo: "අන්තරාසර්ග විද්‍යාව",
      hosp_spec_maternity: "මාතෘ සත්කාර",
      hosp_spec_specialist: "විශේෂඥ උපදේශන",
      hosp_spec_teaching_research: "ඉගැන්වීම් සහ පර්යේෂණ",
      hosp_spec_research: "පර්යේෂණ සහ අධ්‍යාපනය",
      hosp_spec_general: "සාමාන්්‍ය වෛද්‍ය විද්‍යාව",
      hosp_spec_rural: "ග්‍රාමීය සෞඛ්‍ය සේවා",
      hosp_spec_community: "ප්‍රජා සත්කාර",
      hosp_spec_multidisc: "බහු-විශේෂඥ සත්කාර",
      hosp_spec_wellness: "සුවතා මධ්‍යස්ථාන",
      hosp_loc_colombo: "කොළඹ",
      hosp_loc_wattala: "වත්තල",
      hosp_loc_thalawathugoda: "තලවතුගොඩ",
      hosp_loc_rajagiriya: "රාජගිරිය",
      hosp_loc_malabe: "මාලඹේ",
      hosp_loc_kandy: "මහනුවර",
      hosp_loc_galle: "ගාල්ල",
      hosp_loc_ragama: "රාගම",
      hosp_loc_kalubowila: "කළුබෝවිල",
      hosp_loc_anuradhapura: "අනුරාධපුරය",
      hosp_loc_jaffna: "යාපනය",
      hosp_loc_batticaloa: "මඩකලපුව",
      hosp_loc_nugegoda: "නුගේගොඩ",
      hosp_btn_connect: "සම්බන්ධ වන්න",
      hosp_nine_name: "Nine Wells රෝහල",
      hosp_nine_desc: "කොළඹ 05 පිහිටි ප්‍රමුඛතම මාතෘ සහ කාන්තා සෞඛ්‍ය රෝහලකි.",
      hosp_asiri_name: "Asiri Surgical රෝහල",
      hosp_asiri_desc: "කාන්තා සෞඛ්‍ය සඳහා වෙන් වූ ඒකක සහිත කොළඹ 05 පිහිටි ප්‍රමුඛතම ශල්‍ය රෝහලකි.",
      hosp_durdans_name: "Durdans රෝහල",
      hosp_durdans_desc: "කොළඹ 03 පිහිටි බහු-විශේෂඥ වෛද්‍ය ප්‍රතිකාර රෝහලකි.",
      hosp_hemas_w_name: "Hemas රෝහල - වත්තල",
      hosp_hemas_w_desc: "වත්තල පිහිටි නවීන පහසුකම් සහිත පූර්ණ සෞඛ්‍ය සේවා රෝහලකි.",
      hosp_hemas_t_name: "Hemas රෝහල - තලවතුගොඩ",
      hosp_hemas_t_desc: "තලවතුගොඩ පිහිටි විශේෂිත නාරිවේද ඒකක සහිත නවීන රෝහලකි.",
      hosp_blue_name: "Lanka Hospitals",
      hosp_blue_desc: "රාජගිරිය පිහිටි පූර්ණ සෞඛ්‍ය සේවා සපයන්නෙකි.",
      hosp_neville_name: "නෙවිල් ප්‍රනාන්දු ශික්ෂණ රෝහල",
      hosp_neville_desc: "මාලඹේ පිහිටි විශාලතම පෞද්ගලික ශික්ෂණ රෝහලකි.",
      hosp_castle_name: "කාසල් වීදිය කාන්තා රෝහල",
      hosp_castle_desc: "කාන්තා සෞඛ්‍ය සහ මාතෘ සත්කාර සඳහා වෙන් වූ ප්‍රමුඛතම රජයේ රෝහලකි.",
      hosp_desoysa_name: "ද සොයිසා කාන්තා රෝහල",
      hosp_desoysa_desc: "විශේෂිත සත්කාර සපයන ශ්‍රී ලංකාවේ පැරණිතම මාතෘ රෝහලකි.",
      hosp_national_name: "ශ්‍රී ලංකා ජාතික රෝහල",
      hosp_national_desc: "විශේෂිත අන්තරාසර්ග ඒකක සහිත ශ්‍රී ලංකාවේ ප්‍රධානතම මහ රෝහලයි.",
      hosp_kandy_name: "ජාතික රෝහල - මහනුවර",
      hosp_kandy_desc: "මධ්‍යම පළාතේ ප්‍රධානතම රෝහලයි.",
      hosp_karapitiya_name: "ශික්ෂණ රෝහල - කරාපිටිය",
      hosp_karapitiya_desc: "දකුණු පළාතේ විශාලතම සෞඛ්‍ය සේවා සැපයුම්කරු වේ.",
      hosp_mahamodara_name: "මහමෝදර මාතෘ රෝහල",
      hosp_mahamodara_desc: "දකුණු පළාතට සේවය සපයන විශේෂිත මාතෘ රෝහලකි.",
      hosp_ragama_name: "ශික්ෂණ රෝහල - රාගම",
      hosp_ragama_desc: "ගම්පහ දිස්ත්‍රික්කයට සේවය සපයන ප්‍රධාන රෝහලකි.",
      hosp_kalubowila_name: "ශික්ෂණ රෝහල - කළුබෝවිල",
      hosp_kalubowila_desc: "දකුණු කොළඹ ප්‍රදේශයට සේවය සපයන ප්‍රධාන රෝහලකි.",
      hosp_anuradhapura_name: "ශික්ෂණ රෝහල - අනුරාධපුරය",
      hosp_anuradhapura_desc: "උතුරු මැද පළාතේ ප්‍රධානතම සෞඛ්‍ය සේවා සපයන්නා වේ.",
      hosp_jaffna_name: "ශික්ෂණ රෝහල - යාපනය",
      hosp_jaffna_desc: "උතුරු පළාතේ ප්‍රධානතම රෝහල වේ.",
      hosp_batticaloa_name: "ශික්ෂණ රෝහල - මඩකලපුව",
      hosp_batticaloa_desc: "ශ්‍රී ලංකාවේ නැගෙනහිර පළාතට සේවය සපයන ප්‍රධාන රෝහලකි.",
      hosp_sjp_name: "ශ්‍රී ජයවර්ධනපුර මහ රෝහල",
      hosp_sjp_desc: "කෝට්ටේ/නුගේගොඩ පිහිටි අර්ධ රාජ්‍ය විශේෂිත රෝහලකි.",
      hosp_lanka_name: "Lanka Hospitals",
      hosp_lanka_desc: "කොළඹ පිහිටි පිළිගත් බහු-විශේෂඥ පෞද්ගලික රෝහලකි.",
      info_title: "PCOS තොරතුරු — PCOS Care Hub",
      info_hero_title: "PCOS ගැන තේරුම් ගැනීම",
      info_hero_subtitle: "ඔබේ සෞඛ්‍ය තත්ත්වය තේරුම් ගැනීමට සහ කළමනාකරණය කිරීමට උපකාරී වන විද්‍යාත්මක තොරතුරු.",
      info_what_title: "PCOS යනු කුමක්ද?",
      info_what_p1: "පොලිසිස්ටික් ඕවරි සින්ඩ්‍රෝමය (PCOS) යනු ප්‍රජනක වයසේ පසුවන කාන්තාවන් අතර බහුලව දක්නට ලැබෙන හෝමෝන අසමතුලිතතාවයකි.",
      info_what_p2: "ලොව පුරා කාන්තාවන්ගෙන් 8-13% කට පමණ PCOS බලපාන අතර ශ්‍රී ලංකාවේද එය බහුලව දක්නට ලැබේ.",
      info_what_p3: "මෙම තත්ත්වය හඳුනා ගැනීමට නිර්ණායක තුනක් (Rotterdam Criteria) භාවිතා කරයි:",
      info_what_li1: "ඩිම්බ මෝචනය නිසි පරිදි සිදු නොවීම: අක්‍රමවත් හෝ නැති වී ගිය ඔසප් චක්‍ර.",
      info_what_li2: "පුරුෂ හෝමෝන වැඩි වීම: කුරුලෑ හෝ අනවශ්‍ය රෝම වර්ධනය.",
      info_what_li3: "පොලිසිස්ටික් ඩිම්බ කෝෂ: ස්කෑන් පරීක්ෂණයකදී ඩිම්බ කෝෂවල කුඩා බුබුළු වැනි ස්වභාවයක් පෙනීම.",
      info_symptoms_title: "PCOS හි රෝග ලක්ෂණ",
      info_symptoms_subtitle: "රෝග ලක්ෂණ එක් එක් කාන්තාවට වෙනස් විය හැකි අතර කාලයත් සමඟ වෙනස් විය හැක.",
      info_symptom_irregular_title: "අක්‍රමවත් ඔසප් චක්‍ර",
      info_symptom_irregular_desc: "ඔසප් වීම ප්‍රමාද වීම, අනපේක්ෂිත ලෙස සිදුවීම හෝ සම්පූර්ණයෙන්ම නැවතී යාම.",
      info_symptom_hair_title: "අනවශ්‍ය රෝම වර්ධනය",
      info_symptom_hair_desc: "මුහුණේ සහ ශරීරයේ අනවශ්‍ය ලෙස රෝම වර්ධනය වීම.",
      info_symptom_acne_title: "කුරුලෑ සහ තෙල් සහිත සම",
      info_symptom_acne_desc: "හෝමෝන අසමතුලිතතාවය නිසා මුහුණේ, පපුවේ සහ පිටේ කුරුලෑ ඇති වීම.",
      info_symptom_loss_title: "හිසකෙස් ගැලවී යාම",
      info_symptom_loss_desc: "හිසකෙස් තුනී වීම හෝ හිස මුදුනේ කෙස් ගැලවී යාම.",
      info_symptom_weight_title: "බර වැඩි වීම",
      info_symptom_weight_desc: "පැහැදිලි හේතුවක් නොමැතිව බර වැඩි වීම, විශේෂයෙන් උදරය අවට.",
      info_symptom_fatigue_title: "අධික තෙහෙට්ටුව",
      info_symptom_fatigue_desc: "නිතර දැනෙන විඩාව සහ ශක්තිය අඩු බව.",
      info_symptom_mood_title: "මානසික තත්ත්වයන්",
      info_symptom_mood_desc: "විසදය, කාංසාව සහ නිතර වෙනස් වන මානසික ස්වභාවය.",
      info_symptom_infertility_title: "සරුභාවය පිළිබඳ ගැටලු",
      info_symptom_infertility_desc: "ඩිම්බ මෝචනය අක්‍රමවත් වීම නිසා ගැබ් ගැනීමට අපහසු වීම.",
      info_symptom_skin_title: "සම කළු වීම",
      info_symptom_skin_desc: "බෙල්ල, කිහිලි වැනි ස්ථානවල සම ඝන වී කළු පැහැ වීම.",
      info_causes_title: "හේතු සහ අවදානම් සාධක",
      info_causes_subtitle: "PCOS සඳහා නිශ්චිත හේතුව තවමත් හරියටම සොයාගෙන නැත, නමුත් පර්යේෂණවලට අනුව ජානමය සහ පාරිසරික සාධකවල බලපෑමක් පවතී.",
      info_cause_genetic_title: "ජානමය සාධක",
      info_cause_genetic_li1: "පවුල් ඉතිහාසය: ඔබේ මවට හෝ සහෝදරියකට PCOS තිබේ නම්, ඔබේ අවදානම වැඩිය.",
      info_cause_genetic_li2: "ජාන කිහිපයක බලපෑම: මෙය තනි ජානයක් නිසා සිදුවන්නක් නොවේ.",
      info_cause_insulin_title: "ඉන්සියුලින් ප්‍රතිරෝධය",
      info_cause_insulin_li1: "බහුලවම දක්නට ලැබෙන සාධකය: PCOS ඇති කාන්තාවන්ගෙන් 50-70% කට ඉන්සියුලින් ප්‍රතිරෝධය පවතී.",
      info_cause_insulin_li2: "හෝමෝන අසමතුලිතතාවය: මෙය ශරීරයේ ඇන්ඩ්‍රොජන් හෝමෝන මට්ටම ඉහළ යාමට හේතු වේ.",
      info_cause_inflammation_title: "ප්‍රදාහය (Inflammation)",
      info_cause_inflammation_li1: "නිදන්ගත ප්‍රදාහය: PCOS ඇති කාන්තාවන්ගේ ශරීරයේ ප්‍රදාහය පෙන්නුම් කරන සලකුණු පවතී.",
      info_cause_inflammation_li2: "හෝමෝන උද්දීපනය: මෙම ප්‍රදාහය මගින් ඩිම්බ කෝෂ වැඩිපුර පුරුෂ හෝමෝන නිපදවීමට පෙළඹවිය හැක.",
      info_cause_env_title: "පාරිසරික සහ ජීවන රටාව",
      info_cause_env_li1: "ආහාර සහ බර: සීනි අධික ආහාර සහ තන්තු අඩු ආහාර PCOS අවදානම වැඩි කරයි.",
      info_cause_env_li2: "අක්‍රීය ජීවන රටාව: ශාරීරික ක්‍රියාකාරකම් නොමැතිකම බර වැඩිවීමට හේතු වේ.",
      info_diagnosis_title: "PCOS හඳුනා ගැනීම",
      info_diagnosis_desc: "PCOS හඳුනා ගැනීමට තනි පරීක්ෂණයක් නොමැත. එය රෝග ලක්ෂණ සහ පරීක්ෂණ ප්‍රතිඵල කිහිපයක් මත පදනම් වේ.",
      info_diagnosis_tests_title: "රෝග විනිශ්චය පරීක්ෂණ:",
      info_diagnosis_li1: "රුධිර පරීක්ෂණ: ටෙස්ටොස්ටෙරෝන්, FSH, LH සහ සීනි මට්ටම පරීක්ෂා කිරීම.",
      info_diagnosis_li2: "පැල්වික් ස්කෑන් (Ultrasound): ඩිම්බ කෝෂවල පෙනුම පරීක්ෂා කිරීම.",
      info_diagnosis_li3: "ශාරීරික පරීක්ෂාව: අනවශ්‍ය රෝම වර්ධනය වැනි ලක්ෂණ පරීක්ෂා කිරීම.",
      info_diagnosis_li4: "වෛද්‍ය ඉතිහාසය: ඔසප් චක්‍රයේ අක්‍රමිකතා සහ පවුල් ඉතිහාසය.",
      info_diagnosis_li5: "වෙනත් පරීක්ෂණ: තයිරොයිඩ් පරීක්ෂණ වැනි වෙනත් හේතූන් බැහැර කිරීමට කරන පරීක්ෂණ.",
      info_treatment_title: "ප්‍රතිකාර සහ කළමනාකරණය",
      info_treatment_subtitle: "PCOS යනු වෛද්‍ය ප්‍රතිකාර සහ ජීවන රටා වෙනස්කම් මගින් පාලනය කළ හැකි තත්ත්වයකි.",
      info_treat_hormone_title: "හෝමෝන උපත් පාලන ක්‍රම",
      info_treat_hormone_desc: "ඔසප් චක්‍රය විධිමත් කිරීමට සහ පුරුෂ හෝමෝන මට්ටම අඩු කිරීමට උපකාරී වේ.",
      info_treat_metformin_title: "මෙට්ෆෝමින් (Metformin)",
      info_treat_metformin_desc: "ඉන්සියුලින් ප්‍රතිරෝධය අඩු කර ඔසප් චක්‍රය පාලනය කිරීමට උපකාරී වේ.",
      info_treat_lifestyle_title: "ජීවන රටා වෙනස්කම්",
      info_treat_lifestyle_desc: "බර අඩු කර ගැනීම, ක්‍රමවත් ව්‍යායාම සහ සමබර ආහාර වේලක් අතිශයින් වැදගත් වේ.",
      info_treat_anti_title: "ඇන්ටි-ඇන්ඩ්‍රොජන් ඖෂධ",
      info_treat_anti_desc: "කුරුලෑ සහ අනවශ්‍ය රෝම වර්ධනය වැනි පුරුෂ හෝමෝනවල බලපෑම් අඩු කරයි.",
      info_treat_nutri_title: "පෝෂණ කළමනාකරණය",
      info_treat_nutri_desc: "අඩු ග්ලයිසමික් දර්ශකයක් සහිත ආහාර සහ ප්‍රදාහය අඩු කරන ආහාර.",
      info_treat_fertility_title: "ප්‍රජනක ප්‍රතිකාර",
      info_treat_fertility_desc: "දරුවන් බලාපොරොත්තු වන කාන්තාවන් සඳහා ඩිම්බ මෝචනය උත්තේජනය කරන ඖෂධ.",
      cta_create_btn: "නොමිලේ ගිණුමක් සාදන්න",
      cta_login_text: "දැනටමත් සාමාජිකයෙක්ද? පිවිසෙන්න",
      info_risks_title: "PCOS සහ දිගුකාලීන සෞඛ්‍ය අවදානම්",
      info_risk_diabetes_title: "2 වන වර්ගයේ දියවැඩියාව",
      info_risk_diabetes_desc: "PCOS ඇති කාන්තාවන්ට දියවැඩියාව ඇතිවීමේ අවදානම වැඩිය. නිසි පරීක්ෂාව වැදගත් වේ.",
      info_risk_cardio_title: "හෘද වාහිනී රෝග",
      info_risk_cardio_desc: "කොලෙස්ටරෝල් සහ රුධිර පීඩනය වැඩිවීම හෘද රෝග අවදානම වැඩි කරයි.",
      info_title: "PCOS තොරතුරු — PCOS Care Hub",
      info_risk_metabolic_title: "සමස්ත පරිවෘත්තීය සින්ඩ්‍රෝමය",
      info_risk_metabolic_desc: "තරබාරුකම සහ ඉන්සියුලින් ප්‍රතිරෝධය ඇතුළු තත්ත්වයන් කිහිපයක එකතුවකි.",
      info_risk_mental_title: "මානසික සෞඛ්‍ය ගැටලු",
      info_risk_mental_desc: "විසදය සහ කාංසාව PCOS ඇති කාන්තාවන් අතර බහුලව දක්නට ලැබේ.",
      info_risk_endo_title: "ගර්භාෂ බිත්ති ඝන වීම",
      info_risk_endo_desc: "අක්‍රමවත් ඔසප් චක්‍ර නිසා ගර්භාෂ පිළිකා ඇතිවීමේ අවදානම වැඩි විය හැක.",
      info_risk_preg_title: "ගැබ්ගැනීමේ සංකූලතා",
      info_risk_preg_desc: "ගර්භණී දියවැඩියාව සහ අධික රුධිර පීඩනය ඇතිවීමේ අවදානම වැඩිය.",
      info_lifestyle_title: "ජීවන රටා කළමනාකරණ උපාය මාර්ග",
      info_life_nutri_title: "පෝෂණය",
      info_life_nutri_li1: "අඩු ග්ලයිසමික් දර්ශකයක් සහිත ආහාර තෝරා ගන්න",
      info_life_nutri_li2: "ප්‍රදාහය අඩු කරන ආහාර වේලක්",
      info_life_nutri_li3: "ප්‍රමාණවත් ප්‍රෝටීන්",
      info_life_nutri_li4: "ප්‍රදාහය ඇති කරන ආහාර සීමා කරන්න",
      info_life_nutri_li5: "හොඳින් ජලය පානය කරන්න",
      info_life_exercise_title: "ව්‍යායාම",
      info_life_exercise_li1: "සතියකට මිනිත්තු 150 කට වඩා ව්‍යායාම කරන්න",
      info_life_exercise_li2: "මාංශ පේශි ශක්තිමත් කිරීමේ ව්‍යායාම",
      info_life_exercise_li3: "HIIT ව්‍යායාම",
      info_life_exercise_li4: "ඔබ කැමති ක්‍රියාකාරකම්වල නිරත වන්න",
      info_life_sleep_title: "නින්ද සහ ආතතිය",
      info_life_sleep_li1: "රාත්‍රියට පැය 7-9 ක නින්දක් ලබා ගන්න",
      info_life_sleep_li2: "ආතතිය කළමනාකරණය කරන්න",
      info_life_sleep_li3: "නින්දට පෙර තිර කාලය සීමා කරන්න",
      info_life_sleep_li4: "සුවදායී නිදන පරිසරයක් නිර්මාණය කරන්න",
      info_life_mental_title: "මානසික සෞඛ්‍යය",
      info_life_mental_li1: "සහාය සොයන්න",
      info_life_mental_li2: "උපදේශනය ලබා ගැනීම සලකා බලන්න",
      info_life_mental_li3: "තමා ගැනම දයාවෙන් කටයුතු කරන්න",
      info_life_mental_li4: "ශරීරය පිළිගැනීම",
      info_living_well_title: "PCOS සමඟ හොඳින් ජීවත් වීම",
      info_living_well_p1: "PCOS යනු දීර්ඝකාලීන තත්ත්වයක් වුවද, එය හොඳින් කළමනාකරණය කළ හැකිය.",
      info_living_well_p2: "පුද්ගලික කළමනාකරණ සැලසුමක් සකස් කිරීමට ඔබේ වෛද්‍ය කණ්ඩායම සමඟ කටයුතු කරන්න.",
      info_btn_community: "අපගේ ප්‍රජාවට එක්වන්න",
      info_btn_about: "PCOS Care Hub ගැන",
      contact_title: "අප අමතන්න — PCOS Care Hub",
      contact_hero_title: "අපගේ කණ්ඩායම අමතන්න",
      contact_hero_desc: "වේදිකාව පිළිබඳ ගැටළු තිබේද? අප සමඟ හවුල් වීමට කැමතිද? කොළඹ සිටින අපගේ කණ්ඩායම ඔබට සහාය වීමට සූදානම්.",
      contact_form_title: "අපට පණිවිඩයක් එවන්න",
      contact_form_subtitle: "පහත පෝරමය පුරවන්න, අපි පැය 24ක් ඇතුළත ඔබ හා සම්බන්ධ වන්නෙමු.",
      contact_name_placeholder: "ඔබේ නම",
      contact_email_label: "විද්‍යුත් තැපැල් ලිපිනය",
      contact_email_placeholder: "jane@example.com",
      contact_subject_label: "විෂය",
      contact_subject_option_default: "මාතෘකාවක් තෝරන්න",
      contact_subject_option_patient: "රෝගී සහාය",
      contact_subject_option_hospital: "රෝහල් හවුල්කාරිත්වය",
      contact_subject_option_technical: "තාක්ෂණික ගැටළු",
      contact_subject_option_other: "සාමාන්‍ය විමසීම්",
      contact_message_label: "ඔබේ පණිවිඩය",
      contact_message_placeholder: "අද අපි ඔබට උදව් කරන්නේ කෙසේද?",
      contact_btn_submit: "පණිවිඩය එවන්න — අපි සවන් දී සිටිමු",
      contact_info_title: "සම්බන්ධතා තොරතුරු",
      contact_loc_title: "අපගේ පිහිටීම",
      contact_loc_desc: "123 හෙල්ත්කෙයාර් ප්ලාසා, කොළඹ 07, ශ්‍රී ලංකාව",
      contact_call_title: "අප අමතන්න",
      contact_email_title: "විද්‍යුත් තැපෑල",
      contact_follow_title: "අපගේ ගමන අනුගමනය කරන්න",
      contact_map_title: "ශ්‍රී ලංකාව පදනම් කරගත් සේවාවක්",
      contact_map_desc: "කොළඹ පිහිටි අපගේ මධ්‍යස්ථානයේ සිට දිවයින පුරා සිටින කාන්තාවන්ට සේවය සලසයි.",
      contact_success_title: "පණිවිඩය එවීමට ස්තූතියි!",
      contact_success_desc: "අපි පැය 24ක් ඇතුළත ප්‍රතිචාර දක්වන්නෙමු."
    },
    ta: {
      nav_home: "முகப்பு",
      nav_about: "எங்களைப் பற்றி",
      nav_features: "அம்சங்கள்",
      nav_pcos_info: "PCOS தகவல்",
      nav_hospitals: "மருத்துவமனைகள்",
      nav_blog: "வலைப்பதிவு",
      nav_contact: "தொடர்பு",
      nav_login: "உள்நுழை",
      nav_signup: "இணையுங்கள்",
      nav_get_connected: "இணையுங்கள்",
      nav_records: "பாதுகாப்பான சுகாதார பதிவுகள்",
      lang_changed_toast: "மொழி வெற்றிகரமாக மாற்றப்பட்டது!",
      blog_hero_title: "PCOS அறிவு மையம்",
      blog_hero_desc: "PCOS-ஐ சிறப்பாகப் புரிந்துகொள்ளவும் நிர்வகிக்கவும் உதவும் கட்டுரைகள், குறிப்புகள் மற்றும் வழிகாட்டிகள்.",
      blog_tag_diet: "உணவு மற்றும் ஊட்டச்சத்து",
      blog_tag_exercise: "உடற்பயிற்சி",
      blog_tag_mental: "மன ஆரோக்கியம்",
      blog_tag_hormones: "ஹார்மோன்கள்",
      blog_tag_fertility: "கருவுறுதல்",
      blog_tag_wellness: "நல்வாழ்வு",
      blog_read_more: "மேலும் படிக்க →",
      blog_title_1: "PCOS மேலாண்மைக்கான சிறந்த உணவு முறை",
      blog_desc_1: "இன்சுலின் எதிர்ப்பைக் கட்டுப்படுத்தவும் ஹார்மோன் சமநிலையை மேம்படுத்தவும் உணவு முறை எவ்வாறு உதவுகிறது என்பதைக் கண்டறியவும்.",
      blog_date_1: "பிப்ரவரி 20, 2026",
      blog_read_time_1: "6 நிமிட வாசிப்பு",
      blog_title_2: "PCOS உடைய பெண்களுக்கான உடற்பயிற்சி வழிகாட்டி",
      blog_desc_2: "பயிற்சி மற்றும் கார்டியோ உடற்பயிற்சிகள் இன்சுலின் உணர்திறனை கணிசமாக மேம்படுத்தும்.",
      blog_date_2: "பிப்ரவரி 15, 2026",
      blog_read_time_2: "5 நிமிட வாசிப்பு",
      blog_title_3: "PCOS தொடர்பான கவலை மற்றும் மன அழுத்தத்தை நிர்வகித்தல்",
      blog_desc_3: "PCOS மனச்சோர்வு மற்றும் கவலையின் அபாயத்தை கணிசமாக அதிகரிக்கிறது.",
      blog_date_3: "பிப்ரவரி 10, 2026",
      blog_read_time_3: "7 நிமிட வாசிப்பு",
      blog_title_4: "PCOS இல் இன்சுலின் எதிர்ப்பைப் புரிந்துகொள்ளுதல்",
      blog_desc_4: "PCOS உடைய 70% பெண்களுக்கு இன்சுலின் எதிர்ப்பு உள்ளது.",
      blog_date_4: "பிப்ரவரி 5, 2026",
      blog_read_time_4: "8 நிமிட வாசிப்பு",
      blog_title_5: "PCOS மற்றும் கருவுறுதல்: நீங்கள் தெரிந்து கொள்ள வேண்டியவை",
      blog_desc_5: "PCOS பெண் மலட்டுத்தன்மைக்கு முக்கிய காரணங்களில் ஒன்றாகும், ஆனால் சிகிச்சையின் மூலம் கருத்தரிக்க முடியும்.",
      blog_date_5: "ஜனவரி 28, 2026",
      blog_read_time_5: "9 நிமிட வாசிப்பு",
      blog_title_6: "PCOS மேலாண்மைக்கு தூக்கம் ஏன் முக்கியமானது?",
      blog_desc_6: "குறைந்த தூக்கம் இன்சுலின் எதிர்ப்பு மற்றும் ஹார்மோன் சமநிலையின்மையை மோசமாக்கும்.",
      blog_date_6: "ஜනவரி 22, 2026",
      blog_read_time_6: "5 நிமிட வாசிப்பு",
      hero_badge_text: "இலங்கையின் #1 பி.சி.ஓ.எஸ் தளம்",
      hero_title_main: "பி.சி.ஓ.எஸ் மேலாண்மை",
      hero_title_highlight: "புத்திசாலித்தனம் & பாதுகாப்பு",
      hero_desc_text: "இலங்கை பெண்கள் பி.சி.ஓ.எஸ்-ஐ புத்திசாலித்தனமாகவும் பாதுகாப்பாகவும் நிர்வகிப்பதற்கான ஒரு விரிவான தளம் — அறிகுறிகளைக் கண்காணிக்கவும், மருத்துவமனைகளுடன் இணையவும் மற்றும் உங்கள் சுகாதார பதிவுகளை எப்போது வேண்டுமானாலும் அணுகவும்.",
      hero_stat_reports: "அறிக்கைகள் பதிவேற்றப்பட்டன",
      hero_stat_patients: "நோயாளிகளுக்கு ஆதரவு",
      hero_stat_hospitals: "கூட்டு மருத்துவமனைகள்",
      about_badge_num: "8-13%",
      about_badge_lbl: "உலகளவில் PCOS-ஆல் பாதிக்கப்பட்ட பெண்கள்",
      btn_get_started: "இலவசமாகத் தொடங்குங்கள்",
      btn_learn_more: "மேலும் அறிய",
      trust_free: "இணைய இலவசம்",
      trust_secure: "பாதுகாப்பானது & தனிப்பட்டது",
      trust_hospital: "மருத்துவமனையுடன் ஒருங்கிணைக்கப்பட்டது",
      dash_overview: "கண்ணோட்டம்",
      dash_symptoms: "அறிகுறிகள்",
      dash_reports: "அறிக்கைகள்",
      dash_appointments: "சந்திப்புகள்",
      dash_settings: "அமைப்புகள்",
      dash_logout: "வெளியேறு",
      features_title: "அம்சங்கள் — PCOS Care Hub",
      about_title: "எங்களைப் பற்றி — PCOS Care Hub",
      about_hero_title: "PCOS Care Hub பற்றி",
      about_hero_subtitle: "இலங்கையில் PCOS மேலாண்மையை பாதுகாப்பான மற்றும் நோயாளிக்கு முதலிடம் கொடுக்கும் டிஜிட்டல் சுகாதாரம் மூலம் மாற்றியமைத்தல்",
      about_mission_vision_title: "எமது நோக்கம் & தொலைநோக்கு",
      about_mission_vision_p1: "தொழில்நுட்பம் மற்றும் கல்வி மூலம் PCOS உடைய இலங்கை பெண்களை வலுப்படுத்துவதே எமது முக்கிய நோக்கமாகும்.",
      about_mission_vision_p2: "PCOS என்பது ஒரு மருத்துவ நிலை என்பதை விட, அது ஒரு பெண்ணின் வாழ்க்கை முறையையே பாதிக்கும் ஒரு பயணம் என்பதை நாங்கள் உணர்ந்துள்ளோம்.",
      about_mission_vision_p3: "ஒவ்வொரு பெண்ணும் விரிவான கருவிகள் மற்றும் நம்பகமான சுகாதாரத் தகவல்களை அணுகக்கூடிய ஒரு சூழலை உருவாக்குவதே எமது இலக்காகும்.",
      about_stat_patients: "தளத்தைப் பயன்படுத்தும் பெண்கள்",
      about_stat_hospitals: "கூட்டு மருத்துவமனைகள் & கிளினிக்குகள்",
      about_stat_reports: "பாதுகாக்கப்பட்ட மருத்துவ அறிக்கைகள்",
      about_problem_title: "நாங்கள் தீர்க்கும் பிரச்சனை",
      about_problem_1_title: "சிதறிய பதிவுகள்",
      about_problem_1_desc: "PCOS உடைய பெண்கள் பல மருத்துவர்களைச் சந்திக்கிறார்கள், ஆனால் அவர்களின் சுகாதாரப் பயணத்தைக் கண்காணிக்க மையப்படுத்தப்பட்ட அமைப்பு இல்லை. அறிக்கைகள் தொலைந்து போவது ஒரு முக்கிய பிரச்சனையாக உள்ளது.",
      about_problem_2_title: "வரையறுக்கப்பட்ட அறிவு",
      about_problem_2_desc: "இலங்கை பெண்களில் 13% பேர் பாதிக்கப்பட்டிருந்தாலும், PCOS பற்றிய விழிப்புணர்வு குறைவாகவே உள்ளது. பல நோயாளிகள் தங்களின் சிகிச்சை விருப்பங்களைப் புரிந்து கொள்ளவில்லை.",
      about_problem_3_title: "துண்டிக்கப்பட்ட சிகிச்சை",
      about_problem_3_desc: "நோயாளி-மருத்துவர் தொடர்பு சந்திப்பு நேரங்களுக்கு மட்டுமே மட்டுப்படுத்தப்பட்டுள்ளது. மருத்துவர்களால் நோயாளியின் அன்றாட அறிகுறி தரவுகளைப் பார்க்க முடிவதில்லை.",
      about_problem_4_title: "மனநல சுமை",
      about_problem_4_desc: "PCOS நோயாளிகள் மனச்சோர்வு மற்றும் கவலையை அதிகமாக அனுபவிக்கிறார்கள். சமூக ஆதரவு இல்லாமல் பெண்கள் தனிமையை உணர்கிறார்கள்.",
      about_problem_5_title: "ஒரே மாதிரியான தரநிலைகள் இல்லை",
      about_problem_5_desc: "மருத்துவமனைகள் முழுவதும் நோயறிதல் மற்றும் மேலாண்மை முறை வேறுபடுகிறது. நோயாளிகளுக்கு முறையான சிகிச்சை வழிகாட்டுதல்கள் கிடைப்பதில்லை.",
      about_problem_6_title: "தனியுரிமை மற்றும் தரவு கவலைகள்",
      about_problem_6_desc: "காகித பதிவுகள் காணாமல் போகவோ அல்லது தவறாக கையாளப்படவோ வாய்ப்புள்ளது. உணர்திறன் மிக்க சுகாதார தகவல்களைப் பகிரும்போது பெண்கள் தனியுரிமை குறித்து கவலைப்படுகிறார்கள்.",
      about_solution_title: "நாங்கள் அதை எவ்வாறு தீர்க்கிறோம்",
      about_solution_main_title: "ஒரு ஒருங்கிணைந்த டிஜிட்டல் சுற்றுச்சூழல் அமைப்பு",
      about_solution_1_title: "மையப்படுத்தப்பட்ட சுகாதார பதிவுகள்",
      about_solution_1_desc: "அனைத்து மருத்துவ அறிக்கைகள், சோதனை முடிவுகள் மற்றும் அறிகுறி தரவுகள் ஒரே பாதுகாப்பான இடத்தில். முக்கியமான ஆவணங்களை இனி ஒருபோதும் இழக்காதீர்கள்.",
      about_solution_2_title: "புத்திசாலித்தனமான கண்காணிப்பு கருவிகள்",
      about_solution_2_desc: "அறிகுறிகள், மாதவிடாய் சுழற்சிகள் மற்றும் வாழ்க்கை முறை பழக்கங்களைக் கண்காணிக்கவும். உங்கள் உடலுக்கு தனித்துவமான வடிவங்களைக் கண்டறிய எங்கள் பகுப்பாய்வு உதவுகிறது.",
      hosp_title: "கூட்டு மருத்துவமனைகள் — PCOS Care Hub",
      hosp_hero_title: "எங்கள் கூட்டு மருத்துவமனை நெட்வொர்க்",
      hosp_hero_desc: "உங்கள் PCOS மேலாண்மைக்கு நிபுணர் ஆதரவைப் பெற இலங்கையிலுள்ள முன்னணி மருத்துவமனைகளுடன் இணையுங்கள்.",
      hosp_hero_subtitle: "இலங்கை முழுவதும் PCOS மற்றும் பெண்கள் ஆரோக்கியத்தில் நிபுணத்துவம் பெற்ற முன்னணி சுகாதார வழங்குநர்களுடன் இணையுங்கள்.",
      hosp_spec_gynae: "மகப்பேறியல்",
      hosp_spec_fertility: "கருவுறுதல்",
      hosp_spec_subfertility: "துணை கருவுறுதல்",
      hosp_spec_wellwoman: "பெண்கள் நல கிளினிக்",
      hosp_spec_surgical: "அறுவை சிகிச்சை சிறப்பு",
      hosp_spec_endo: "நாளமில்லா சுரப்பியல்",
      hosp_spec_maternity: "மகப்பேறு பராமரிப்பு",
      hosp_spec_specialist: "நிபுணர் ஆலோசனைகள்",
      hosp_spec_teaching_research: "கற்பித்தல் மற்றும் ஆராய்ச்சி",
      hosp_spec_research: "ஆராய்ச்சி மற்றும் கல்வி",
      hosp_spec_general: "பொது மருத்துவம்",
      hosp_spec_rural: "கிராமப்புற சுகாதார சேவை",
      hosp_spec_community: "சமூக சேவை",
      hosp_spec_multidisc: "பல்துறை பராமரிப்பு",
      hosp_spec_wellness: "நலவாழ்வு மையங்கள்",
      hosp_loc_colombo: "கொழும்பு",
      hosp_loc_wattala: "வத்தளை",
      hosp_loc_thalawathugoda: "தலவத்துகொட",
      hosp_loc_rajagiriya: "ராஜகிரிய",
      hosp_loc_malabe: "மாலபே",
      hosp_loc_kandy: "கண்டி",
      hosp_loc_galle: "காலி",
      hosp_loc_ragama: "ராகம",
      hosp_loc_kalubowila: "களுபோவில",
      hosp_loc_anuradhapura: "அனுராதபுரம்",
      hosp_loc_jaffna: "யாழ்ப்பாணம்",
      hosp_loc_batticaloa: "மட்டக்களப்பு",
      hosp_loc_nugegoda: "நுகேகொடை",
      hosp_btn_connect: "இப்போதே இணையுங்கள்",
      hosp_nine_name: "நைன் வெல்ஸ் மருத்துவமனை",
      hosp_nine_desc: "கொழும்பு 05 இல் உள்ள முன்னணி மகப்பேறு மற்றும் பெண்கள் நல மருத்துவமனை.",
      hosp_asiri_name: "ஆசிரி சர்ஜிக்கல் மருத்துவமனை",
      hosp_asiri_desc: "பெண்கள் நலனுக்காக பிரத்யேக அலகுகளைக் கொண்ட கொழும்பு 05 இல் உள்ள முன்னணி அறுவை சிகிச்சை மருத்துவமனை.",
      hosp_durdans_name: "டர்டன்ஸ் மருத்துவமனை",
      hosp_durdans_desc: "கொழும்பு 03 இல் உள்ள பல்துறை சிறப்பு மருத்துவமனை.",
      hosp_hemas_w_name: "ஹேமாஸ் மருத்துவமனை - வத்தளை",
      hosp_hemas_w_desc: "வத்தளையில் உள்ள நவீன வசதிகள் கொண்ட முழுமையான சுகாதார சேவை மருத்துவமனை.",
      hosp_hemas_t_name: "ஹேமாஸ் மருத்துவமனை - தலவத்துகொட",
      hosp_hemas_t_desc: "தலவத்துகொடவில் உள்ள சிறப்பு மகப்பேறியல் அலகுகளைக் கொண்ட நவீன மருத்துவமனை.",
      hosp_blue_name: "லங்கா மருத்துவமனை",
      hosp_blue_desc: "ராஜகிரியவில் உள்ள முழுமையான சுகாதார சேவை வழங்குநர்.",
      hosp_neville_name: "நெவில் பெர்னாண்டோ கற்பித்தல் மருத்துவமனை",
      hosp_neville_desc: "மாலபேவில் உள்ள மிகப்பெரிய தனியார் கற்பித்தல் மருத்துவமனை.",
      hosp_lanka_name: "லங்கா மருத்துவமனை",
      hosp_lanka_desc: "கொழும்பில் உள்ள அங்கீகரிக்கப்பட்ட பல்துறை சிறப்பு தனியார் மருத்துவமனை.",
      hosp_castle_name: "காசில் வீதி பெண்கள் மருத்துவமனை",
      hosp_castle_desc: "பெண்கள் ஆரோக்கியம் மற்றும் மகப்பேறு பராமரிப்புக்காக அர்ப்பணிக்கப்பட்ட முன்னணி அரசு மருத்துவமனை.",
      hosp_desoysa_name: "டி சொய்சா பெண்கள் மருத்துவமனை",
      hosp_desoysa_desc: "சிறப்பு பராமரிப்பு வழங்கும் இலங்கையின் பழமையான மகப்பேறு மருத்துவமனைகளில் ஒன்று.",
      hosp_national_name: "இலங்கை தேசிய மருத்துவமனை",
      hosp_national_desc: "சிறப்பு நாளமில்லா சுரப்பியல் அலகுகளைக் கொண்ட இலங்கையின் முன்னணி பொது மருத்துவமனை.",
      hosp_kandy_name: "தேசிய மருத்துவமனை - கண்டி",
      hosp_kandy_desc: "மத்திய மாகாணத்தில் உள்ள முக்கிய மருத்துவ சேவை வழங்குநர்.",
      hosp_karapitiya_name: "கற்பித்தல் மருத்துவமனை - கராப்பிட்டிய",
      hosp_karapitiya_desc: "தென் மாகாணத்தில் உள்ள மிகப்பெரிய சுகாதார சேவை வழங்குநர்.",
      hosp_mahamodara_name: "மஹமோதர மகப்பேறு மருத்துவமனை",
      hosp_mahamodara_desc: "தென் பிராந்தியத்திற்கு சேவை செய்யும் சிறப்பு மகப்பேறு மருத்துவமனை.",
      hosp_ragama_name: "கற்பித்தல் மருத்துவமனை - ராகம",
      hosp_ragama_desc: "கம்பஹா மாவட்டத்திற்கு சேவை செய்யும் முக்கிய மருத்துவ வசதி.",
      hosp_kalubowila_name: "கற்பித்தல் மருத்துவமனை - களுபோவில",
      hosp_kalubowila_desc: "கொழும்பு தெற்கு பிராந்தியத்திற்கு சேவை செய்யும் முக்கிய சுகாதார வசதி.",
      hosp_anuradhapura_name: "கற்பித்தல் மருத்துவமனை - அனுராதபுரம்",
      hosp_anuradhapura_desc: "வடமத்திய மாகாணத்திற்கான முதன்மை சுகாதார சேவை வழங்குநர்.",
      hosp_jaffna_name: "கற்பித்தல் மருத்துவமனை - யாழ்ப்பாணம்",
      hosp_jaffna_desc: "வட மாகாணத்தில் உள்ள முதன்மை மருத்துவமனை.",
      hosp_batticaloa_name: "கற்பித்தல் மருத்துவமனை - மட்டக்களப்பு",
      hosp_batticaloa_desc: "இலங்கையின் கிழக்கு மாகாணத்திற்கு சேவை செய்யும் முக்கிய மருத்துவமனை.",
      hosp_sjp_name: "ஸ்ரீ ஜெயவர்தனபுர பொது மருத்துவமனை",
      hosp_sjp_desc: "கோட்டே/நுகேகொடை பகுதியில் உள்ள அரை அரசு சிறப்பு மருத்துவமனை.",
      info_title: "PCOS தகவல் — PCOS Care Hub",
      info_hero_title: "PCOS பற்றி புரிந்துகொள்ளுதல்",
      info_hero_subtitle: "உங்கள் ஹார்மோன் ஆரோக்கியப் பயணத்தை நிர்வகிக்க உதவும் ஆதாரபூர்வமான தகவல்கள்.",
      info_what_title: "PCOS என்றால் என்ன?",
      info_what_p1: "பாலிசிஸ்டிக் ஓவரி சிண்ட்ரோம் (PCOS) என்பது இனப்பெருக்க வயதுடைய பெண்களை பாதிக்கும் ஒரு பொதுவான ஹார்மோன் கோளாறு ஆகும்.",
      info_what_p2: "நோயறிதல் பொதுவாக ரோட்டர்டாம் அளவுகோல்களை (Rotterdam Criteria) அடிப்படையாகக் கொண்டது.",
      info_what_p3: "நோயறிதல் செய்யப்பட, பின்வருவனவற்றில் குறைந்தது இரண்டையாவது நீங்கள் கொண்டிருக்க வேண்டும்:",
      info_what_li1: "ஒழுங்கற்ற அல்லது மாதவிடாய் இல்லாத நிலை.",
      info_what_li2: "ஆண்ட்ரோஜன்களின் (ஆண் ஹார்மோன்கள்) அதிக அளவு.",
      info_what_li3: "அல்ட்ராசவுண்டில் காணப்படும் பாலிசிஸ்டிக் கருப்பைகள்.",
      info_symptoms_title: "PCOS இன் பொதுவான அறிகுறிகள்",
      info_symptoms_subtitle: "அறிகுறிகள் நபருக்கு நபர் கணிசமாக வேறுபடலாம்.",
      info_symptom_irregular_title: "ஒழுங்கற்ற மாதவிடாய்",
      info_symptom_irregular_desc: "அடிக்கடி வராத, ஒழுங்கற்ற அல்லது நீண்ட மாதவிடாய் சுழற்சிகள்.",
      info_symptom_hair_title: "அதிகப்படியான முடி வளர்ச்சி",
      info_symptom_hair_desc: "ஹிர்சுட்டிசம் (hirsutism) என்று அழைக்கப்படும் இது முகம், மார் அல்லது முதுகைப் பாதிக்கும்.",
      info_symptom_acne_title: "கடுமையான முகப்பரு",
      info_symptom_acne_desc: "சாதாரண சிகிச்சைகளுக்கு எளிதில் கட்டுப்படாத ஹார்மோன் முகப்பரு.",
      info_symptom_loss_title: "முடி மெலிதல்",
      info_symptom_loss_desc: "தலைமுடியில் ஏற்படும் வழுக்கை அல்லது முடி மெலிதல்.",
      info_symptom_weight_title: "உடல் எடை அதிகரிப்பு",
      info_symptom_weight_desc: "எடையைக் குறைப்பதில் சிரமம் மற்றும் வயிற்றில் கொழுப்பு சேருதல்.",
      info_symptom_fatigue_title: "நாள்பட்ட சோர்வு",
      info_symptom_fatigue_desc: "போதுமான ஓய்வு எடுத்த பிறகும் தொடர்ந்து சோர்வாக உணருதல்.",
      info_symptom_mood_title: "மனநிலை மாற்றங்கள்",
      info_symptom_mood_desc: "பதட்டம், மனச்சோர்வு மற்றும் மனநிலை மாற்றங்கள் ஏற்படும் அபாயம்.",
      info_symptom_infertility_title: "மலட்டுத்தன்மை",
      info_symptom_infertility_desc: "ஒழுங்கற்ற அண்டவிடுப்பின் காரணமாக கருத்தரிப்பதில் சிரமம்.",
      info_symptom_skin_title: "தோல் கருமையடைதல்",
      info_symptom_skin_desc: "உடல் மடிப்புகளில் ஏற்படும் கருமையான திட்டுகள் (Acanthosis Nigricans).",
      info_risks_title: "PCOS மற்றும் நீண்ட கால சுகாதார அபாயங்கள்",
      info_risk_diabetes_title: "வகை 2 நீரிழிவு நோய்",
      info_risk_diabetes_desc: "PCOS உள்ள பெண்களுக்கு வகை 2 நீரிழிவு நோய் வருவதற்கான அபாயம் அதிகம்.",
      info_risk_cardio_title: "இருதய நோய்",
      info_risk_cardio_desc: "அதிக கொலஸ்ட்ரால் மற்றும் இரத்த அழுத்தம் இதய நோய் அபாயத்தை அதிகரிக்கிறது.",
      info_risk_metabolic_title: "மெட்டபாலிக் சிண்ட்ரோம்",
      info_risk_metabolic_desc: "உடல் பருமன் மற்றும் இன்சுலின் எதிர்ப்பு உள்ளிட்ட நிலைமைகளின் தொகுப்பு.",
      info_risk_mental_title: "மனநலப் பிரச்சினைகள்",
      info_risk_mental_desc: "PCOS உள்ள பெண்களிடம் மனச்சோர்வு மற்றும் பதட்டம் பொதுவாகக் காணப்படுகிறது.",
      info_risk_endo_title: "எண்டோமெட்ரியல் ஹைப்பர் பிளாசியா",
      info_risk_endo_desc: "ஒழுங்கற்ற மாதவிடாய் கருப்பை புற்றுநோய் அபாயத்தை அதிகரிக்கும்.",
      info_risk_preg_title: "கர்ப்பகால சிக்கல்கள்",
      info_risk_preg_desc: "கர்ப்பகால நீரிழிவு மற்றும் இரத்த அழுத்தம் அதிகரிக்கும் அபாயம்.",
      info_causes_title: "PCOS-ஐ எது உண்டாக்குகிறது?",
      info_causes_subtitle: "சரியான காரணம் தெரியவில்லை என்றாலும், பல காரணிகள் இதில் பங்கு வகிக்கின்றன.",
      info_cause_genetic_title: "மரபியல்",
      info_cause_genetic_li1: "PCOS குடும்பங்களில் தொடர வாய்ப்புள்ளது.",
      info_cause_genetic_li2: "மரபணு காரணிகள் ஆண்ட்ரோஜன் அளவை பாதிக்கின்றன.",
      info_cause_insulin_title: "இன்சுலின் எதிர்ப்பு",
      info_cause_insulin_li1: "அதிகப்படியான இன்சுலின் ஆண்ட்ரோஜன் உற்பத்தியை அதிகரிக்கிறது.",
      info_cause_insulin_li2: "PCOS உள்ள பெரும்பாலான பெண்களுக்கு இன்சுலின் எதிர்ப்பு உள்ளது.",
      info_cause_inflammation_title: "குறைந்த அளவிலான வீக்கம்",
      info_cause_inflammation_li1: "வீக்கம் பாலிசிஸ்டிக் கருப்பைகளைத் தூண்டுகிறது.",
      info_cause_inflammation_li2: "இது இன்சுலின் எதிர்ப்பு மற்றும் உடல் பருமனுடன் தொடர்புடையது.",
      info_cause_env_title: "சுற்றுச்சூழல் காரணிகள்",
      info_cause_env_li1: "உணவு மற்றும் வாழ்க்கை முறை தேர்வுகள்.",
      info_cause_env_li2: "நாளமில்லா சுரப்பிகளை பாதிக்கும் காரணிகள்.",
      info_diagnosis_title: "நோயறிதல் மற்றும் பரிசோதனை",
      info_diagnosis_desc: "PCOS-ஐ நிர்வகிப்பதற்கும் நீண்ட கால சிக்கல்களைத் தடுப்பதற்கும் முன்கூட்டியே கண்டறிவது அவசியம்.",
      info_diagnosis_tests_title: "பொதுவான நோயறிதல் முறைகள்",
      info_diagnosis_li1: "மருத்துவ வரலாறு மதிப்பாய்வு",
      info_diagnosis_li2: "உடல் பரிசோதனை",
      info_diagnosis_li3: "பெல்விக் அல்ட்டாசவுண்ட்",
      info_diagnosis_li4: "இரத்த பரிசோதனைகள் (ஹார்மோன் பரிசோதனை)",
      info_diagnosis_li5: "குளுக்கோஸ் தாங்கும் திறன் சோதனை",
      info_treatment_title: "சிகிச்சை மற்றும் மேலாண்மை",
      info_treatment_subtitle: "தனிப்பயனாக்கப்பட்ட சிகிச்சை திட்டங்கள் அறிகுறிகளைக் குறைப்பதிலும் ஆரோக்கியத்தைப் பாதுகாப்பதிலும் கவனம் செலுத்துகின்றன.",
      info_treat_hormone_title: "ஹார்மோன் கருத்தடை முறைகள்",
      info_treat_hormone_desc: "மாதவிடாய் சுழற்சியை ஒழுங்குபடுத்துகிறது மற்றும் ஆண்ட்ரோஜன் அளவைக் குறைக்கிறது.",
      info_treat_metformin_title: "மெட்ஃபார்மின்",
      info_treat_metformin_desc: "இன்சுலின் உணர்திறனை மேம்படுத்துகிறது மற்றும் உடல் எடையை நிர்வகிக்க உதவுகிறது.",
      info_treat_lifestyle_title: "வாழ்க்கை முறை மாற்றங்கள்",
      info_treat_lifestyle_desc: "உணவு மற்றும் உடற்பயிற்சி PCOS சிகிச்சையின் அடிப்படையாகும்.",
      info_treat_anti_title: "ஆண்ட்ரோஜன் எதிர்ப்பு மருந்துகள்",
      info_treat_anti_desc: "முடி வளர்ச்சி மற்றும் முகப்பரு அறிகுறிகளைக் குறைக்க உதவுகிறது.",
      info_treat_nutri_title: "ஊட்டச்சத்து கூடுதல்",
      info_treat_nutri_desc: "இனோசிட்டால், வைட்டமின் டி மற்றும் ஒமேகா-3 ஆகியவை பயனுள்ளதாக இருக்கும்.",
      info_treat_fertility_title: "கருவுறுதல் சிகிச்சைகள்",
      info_treat_fertility_desc: "கருத்தரிக்க முயற்சிக்கும் பெண்களுக்கு அண்டவிடுப்பின் தூண்டுதல் சிகிச்சை.",
      info_lifestyle_title: "வாழ்க்கை முறை மேலாண்மை உத்திகள்",
      info_life_nutri_title: "ஊட்டச்சத்து",
      info_life_nutri_li1: "குறைந்த கிளைசெமிக் குறியீட்டு உணவுகளைத் தேர்ந்தெடுங்கள்",
      info_life_nutri_li2: "வீக்க எதிர்ப்பு உணவு முறை",
      info_life_nutri_li3: "போதுமான புரதம்",
      info_life_nutri_li4: "வீக்கத்தை உண்டாக்கும் உணவுகளைத் தவிர்க்கவும்",
      info_life_nutri_li5: "நிறைய தண்ணீர் குடிக்கவும்",
      info_life_exercise_title: "உடற்பயிற்சி",
      info_life_exercise_li1: "வாரத்திற்கு 150+ நிமிடங்கள் உடற்பயிற்சி செய்யுங்கள்",
      info_life_exercise_li2: "வலிமைப் பயிற்சி",
      info_life_exercise_li3: "HIIT உடற்பயிற்சிகள்",
      info_life_exercise_li4: "நீங்கள் ரசிக்கும் செயல்பாடுகளில் ஈடுபடுங்கள்",
      info_life_sleep_title: "தூக்கம் மற்றும் மன அழுத்தம்",
      info_life_sleep_li1: "இரவில் 7-9 மணிநேரம் தூங்குங்கள்",
      info_life_sleep_li2: "மன அழுத்தத்தை நிர்வகிக்கவும்",
      info_life_sleep_li3: "தூங்குவதற்கு முன் திரையைப் பார்ப்பதைத் தவிர்க்கவும்",
      info_life_sleep_li4: "வசதியான தூக்க சூழலை உருவாக்குங்கள்",
      info_life_mental_title: "மன ஆரோக்கியம்",
      info_life_mental_li1: "ஆதரவைத் தேடுங்கள்",
      info_life_mental_li2: "ஆலோசனை பெறுவதைக் கருத்தில் கொள்ளுங்கள்",
      info_life_mental_li3: "சுய இரக்கத்தைப் பழகுங்கள்",
      info_life_mental_li4: "உடல் ரீதியான ஏற்பு",
      info_living_well_title: "PCOS உடன் சிறப்பாக வாழ்தல்",
      info_living_well_p1: "PCOS ஒரு நீண்டகால நிலை, ஆனால் அதை சிறப்பாக நிர்வகிக்க முடியும்.",
      info_living_well_p2: "தனிப்பயனாக்கப்பட்ட திட்டத்தை உருவாக்க உங்கள் மருத்துவக் குழுவுடன் இணைந்து செயல்படுங்கள்.",
      info_btn_community: "எங்கள் சமூகத்தில் இணையுங்கள்",
      info_btn_about: "PCOS Care Hub பற்றி",
      contact_title: "தொடர்பு கொள்ள — PCOS Care Hub",
      contact_hero_title: "எங்கள் குழுவைத் தொடர்பு கொள்ளுங்கள்",
      contact_hero_desc: "தளம் குறித்து கேள்விகள் உள்ளதா? எங்களுடன் இணைய விரும்புகிறீர்களா? கொழும்பில் உள்ள எமது குழு உங்களுக்கு உதவ தயாராக உள்ளது.",
      contact_form_title: "எங்களுக்கு ஒரு செய்தியை அனுப்புங்கள்",
      contact_form_subtitle: "கீழே உள்ள படிவத்தைப் பூர்த்தி செய்யுங்கள், நாங்கள் 24 மணிநேரத்திற்குள் உங்களைத் தொடர்புகொள்கிறோம்.",
      contact_name_placeholder: "ஜேன் டோ",
      contact_email_label: "மின்னஞ்சல் முகவரி",
      contact_email_placeholder: "jane@example.com",
      contact_subject_label: "பொருள்",
      contact_subject_option_default: "ஒரு தலைப்பைத் தேர்ந்தெடுக்கவும்",
      contact_subject_option_patient: "நோயாளி ஆதரவு",
      contact_subject_option_hospital: "மருத்துவமனை கூட்டாண்மை",
      contact_subject_option_technical: "தொழில்நுட்ப சிக்கல்",
      contact_subject_option_other: "பொது விசாரணை",
      contact_message_label: "உங்கள் செய்தி",
      contact_message_placeholder: "இன்று நாங்கள் உங்களுக்கு எப்படி உதவ முடியும்?",
      contact_btn_submit: "செய்தியை அனுப்புங்கள் — நாங்கள் கேட்டுக் கொண்டிருக்கிறோம்",
      contact_info_title: "தொடர்பு தகவல்",
      contact_loc_title: "எங்கள் இருப்பிடம்",
      contact_loc_desc: "123 ஹெல்த்கேர் பிளாசா, கொழும்பு 07, இலங்கை",
      contact_call_title: "எங்களை அழைக்கவும்",
      contact_email_title: "எங்களுக்கு மின்னஞ்சல் அனுப்புங்கள்",
      contact_follow_title: "எங்கள் பயணத்தைப் பின்தொடரவும்",
      contact_map_title: "இலங்கையை அடிப்படையாகக் கொண்டது",
      contact_map_desc: "கொழும்பில் உள்ள எமது மையத்திலிருந்து தீவு முழுவதும் உள்ள பெண்களுக்கு சேவை செய்கிறோம்.",
      contact_success_title: "செய்தி அனுப்பியதற்கு நன்றி!",
      contact_success_desc: "நாங்கள் 24 மணிநேரத்திற்குள் பதிலளிப்போம்."
    },
  },
  set(lang) {
    localStorage.setItem('pcos_lang', lang);
    this.apply(lang);
    const msg = this.t('lang_changed_toast') || `Language changed to ${lang.toUpperCase()}!`;
    Toast.success(msg);
    // Optional: Reload to apply all translations broadly
    setTimeout(() => location.reload(), 800);
  },
  apply(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.remove('lang-en', 'lang-si', 'lang-ta');
    document.body.classList.add('lang-' + lang);
    
    const dict = this.translations[lang] || this.translations.en;
    
    // 1. Localize text content/placeholders
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          // If the element contains an icon/emoji tag, preserve it
          const icon = el.querySelector('i, .icon, .emoji, span:first-child');
          if (icon && (icon.innerText.trim().length <= 2 || icon.classList.contains('icon') || icon.tagName === 'I')) {
            const iconHtml = icon.outerHTML;
            el.innerHTML = iconHtml + ' ' + dict[key];
          } else {
            const originalText = el.innerText;
            const emojiRegex = /^([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u;
            const emojiMatch = originalText.match(emojiRegex);
            const hasHtml = /<[a-z][\s\S]*>/i.test(dict[key]);

            let content = dict[key];
            // If HTML has a leading emoji but translation string also starts with an emoji, 
            // don't double it up. Otherwise, prepend the HTML's emoji.
            if (emojiMatch && !emojiRegex.test(content)) {
              content = emojiMatch[0] + content;
            }

            if (hasHtml) {
              el.innerHTML = content;
            } else {
              el.innerText = content;
            }
          }
        }
      } else {
        // Fallback for missing keys: don't wipe content, just log it
        console.warn(`L10n: Missing key [${key}] for language [${lang}]`);
      }
    });

    // 2. Localize titles/tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key]) {
        el.setAttribute('title', dict[key]);
      }
    });
  },
  get() {
    return localStorage.getItem('pcos_lang') || 'en';
  },
  init() {
    const lang = this.get();
    this.apply(lang);
  },
  t(key) {
    const lang = this.get();
    const dict = this.translations[lang] || this.translations.en;
    return dict[key] || this.translations.en[key] || key;
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

// ── Statistics Management ──
const Stats = {
  async fetch() {
    try {
      // Find the correct path to get_stats.php
      const path = window.location.pathname;
      const root = path.includes('/src/pages/') 
        ? '../../' 
        : (path.includes('/admin/') ? '../' : './');
      
      const res = await fetch(root + 'src/php/get_stats.php');
      const data = await res.json();
      
      if (data.status === 'success') {
        return data.data;
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
    return null;
  },
  async update() {
    const data = await this.fetch();
    if (!data) return;

    // Mapping of data-stat keys to database results
    const mapping = {
      'patients': data.patients,
      'hospitals': data.hospitals,
      'reports': data.reports
    };

    document.querySelectorAll('[data-stat]').forEach(el => {
      const statKey = el.getAttribute('data-stat');
      if (mapping[statKey] !== undefined) {
        const newValue = mapping[statKey];
        const oldValue = parseFloat(el.dataset.count);
        
        // Update the data-count attribute
        el.setAttribute('data-count', newValue);
        
        // If it was already observed/animated, we might need to re-trigger
        // but typically Stats.update runs fast enough on DOMContentLoaded.
        // If we want to be sure, we can clear data-observed and re-init.
        el.removeAttribute('data-observed');
      }
    });
    
    // Re-initialize countups to catch updated data-count attributes
    initCountUps();
  }
};

// Global observer for count-ups
let countUpObserver = null;

function initCountUps() {
  if (countUpObserver) {
    // If already exists, just observe any new elements
    document.querySelectorAll('[data-count]:not([data-observed])').forEach(el => {
      el.setAttribute('data-observed', 'true');
      countUpObserver.observe(el);
    });
    return;
  }

  countUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        countUp(el, target, 1600, suffix);
        countUpObserver.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  
  document.querySelectorAll('[data-count]').forEach(el => {
    el.setAttribute('data-observed', 'true');
    countUpObserver.observe(el);
  });
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
  if (p) p.innerHTML = `<span>Uploaded:</span> ${file.name}`;
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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const btn = form.querySelector('.newsletter-btn');
      
      if (input && input.value) {
        const email = input.value;
        const originalBtnText = btn.innerText;
        
        try {
          btn.disabled = true;
          btn.innerText = 'Subscribing...';
          
          const formData = new FormData();
          formData.append('email', email);
          
          const path = window.location.pathname;
          const root = path.includes('/src/pages/') 
            ? path.split('/src/pages/')[0] 
            : path.substring(0, path.lastIndexOf('/'));
          
          const res = await fetch(root + '/src/php/subscribe_newsletter.php', {
            method: 'POST',
            body: formData
          });
          
          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error('Invalid JSON response:', text);
            throw new Error('Server returned an invalid response.');
          }
          
          if (data.status === 'success') {
            Toast.success('Thank you for subscribing to PCOS Care Hub! Check your email.');
            input.value = '';
          } else {
            Toast.error(data.message || 'Failed to subscribe.');
          }
        } catch (err) {
          console.error(err);
          Toast.error('An error occurred. Please try again.');
        } finally {
          btn.disabled = false;
          btn.innerText = originalBtnText;
        }
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
  if (typeof PageLoader !== 'undefined') PageLoader.hide();
  initReveal();
  initNavbar();
  setActiveNav();
  initSmoothScroll();
  // initCountUps(); // Moved inside Stats.update() or after it
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
  
  // Fetch stats and then init countups
  Stats.update().then(() => {
    initCountUps();
  });
});

