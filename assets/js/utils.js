// ============================================================
// PCOS CARE HUB � Shared Utilities (utils.js)
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
    const icons = { success: '', error: '✕', warning: '⚠', info: 'ℹ' };
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
    
    // Update global toggle icon if it exists
    const toggle = document.getElementById('globalThemeToggle');
    if (toggle) toggle.innerHTML = this.getIcon();
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
      no_cycle_logged: "No cycle logged yet � click Menstrual Cycle to start.",
      regular_cycle: "Regular cycle",
      irregular_cycle: "Irregular cycle",
      log_first_cycle: "Log first cycle",
      cycle_logged_activity: "Menstrual cycle logged � {length}-day cycle, {flow} flow",
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
      filter_by_type: "🔍 Filter by type...",
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
      snack: "🍎 Snack",
      meal_name_label: "What did you eat? *",
      meal_name_placeholder: "e.g., Grilled chicken with quinoa salad",
      food_categories: "Food Categories",
      protein: "🥩 Protein",
      vegetables: "🥦 Vegetables",
      fruits: "🍓 Fruits",
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
      cardio: "🏃 Cardio (Running, Cycling...)",
      strength: "💪 Strength Training",
      yoga: "🧘 Yoga",
      walking: "🚶 Walking",
      swimming: "🏊 Swimming",
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
      fair: "😐 Fair (Some disturbances)",
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
      pending_status: "⟳ Pending",
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
      reschedule_visit: "Reschedule Visit 🕓",
      reschedule_msg: "Please pick a new date and time for your consultation.",
      new_date: "New Date",
      new_time: "New Time",
      update_schedule: "Update Schedule",
      medical_officer: "Medical Officer",
      reschedule: "🕓 Reschedule",
      cancel_visit: "✕ Cancel",
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
      filter_by_type: "🔍 Filter by type...",
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
      hospital_hero_title: "Find Your Best Healthcare 🏥",
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
      exercise_saved_success: "Exercise saved! 🏃",
      water_logged_success: "Water intake updated! 💧",
      sleep_logged_success: "Sleep logged! 😴",
      amount: "Amount",
      day_total: "Day Total",
      logged_at: "Logged At"
    },
    si: {
      dashboard: "පුවරුව",
      settings: "සැකසුම්",
      profile: "පැතිකඩ",
      logout: "ඉවත් වන්න",
      notifications: "දැනුම්දීම්",
      messages: "පණිවිඩ",
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
      patient_portal: "රෝගී ද්වාරය",
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
      cycle_label: "චක්‍රය",
      status: "තත්වය",
      started_on: "ආරම්භ වූයේ",
      completed: "සම්පූර්ණයි",
      day: "දිනය",
      days: "දින",
      regular: "සාමාන්‍ය",
      irregular: "අක්‍රමවත්",
      save_cycle_data_success: "චක්‍ර දත්ත සාර්ථකව සුරකිණි!",
      no_cycle_logged: "තවමත් ඔසප් චක්‍රයක් සටහන් කර නැත — ආරම්භ කිරීමට මෙහි ක්ලික් කරන්න.",
      regular_cycle: "සාමාන්‍ය චක්‍රය",
      irregular_cycle: "අක්‍රමවත් චක්‍රය",
      log_first_cycle: "පළමු චක්‍රය සටහන් කරන්න",
      cycle_logged_activity: "ඔසප් චක්‍රය සටහන් කරන ලදී — දින {length} ක චක්‍රයක්, {flow} ශ්‍රාවයක්",
      loading_symptoms: "මෑත කාලීන රෝග ලක්ෂණ පූරණය වෙමින් පවතී...",
      loading_cycle: "චක්‍රයේ ක්‍රියාකාරිත්වය පූරණය වෙමින් පවතී...",
      exercise_goals: "ව්‍යායාම ඉලක්ක",
      diet_compliance: "ආහාර අනුකූලතාවය",
      water_intake: "ජලය පානය කිරීම",
      daily_goal: "දෛනික ඉලක්කය",
      glasses_logged: "සටහන් කළ වීදුරු ගණන",
      blood_test_activity: "සිටි රෝහල මගින් රුධිර පරීක්ෂණ වාර්තා එක් කරන ලදී",
      medical_documents: "මගේ වෛද්‍ය වාර්තා",
      upload_report: "වාර්තාව උඩුගත කරන්න",
      filter_by_type: "🔍 වර්ගය අනුව පෙරන්න...",
      total_files: "මුළු ගොනු සංඛ්‍යාව",
      added_this_month: "මේ මාසයේ එක් කරන ලදී",
      added_this_year: "මේ වසරේ එක් කරන ලදී",
      search_reports_placeholder: "නම හෝ ආයතනය අනුව සොයන්න...",
      all_documents: "සියලුම ලේඛන",
      all_lab_results: "සියලුම රසායනාගාර ප්‍රතිඵල",
      all_scans: "සියලුම ස්කෑන් පරීක්ෂණ",
      loading_vault: "වෛද්‍ය වාර්තා වෙත ප්‍රවේශ වෙමින් පවතී...",
      no_records_found: "වාර්තා කිසිවක් හමු නොවීය",
      no_records_msg: "ඔබ තවමත් මෙම ප්‍රවර්ගය යටතේ කිසිදු වාර්තාවක් එක් කර නොමැත.",
      upload_first_file: "ඔබේ පළමු ගොනුව උඩුගත කරන්න",
      save_medical_record: "වෛද්‍ය වාර්තාව සුරකින්න",
      report_name_label: "වාර්තාවේ නම",
      report_type_label: "වාර්තා වර්ගය / පරීක්ෂණය",
      hospital_clinic_label: "රෝහල / සායනය",
      doctor_requested_label: "ඉල්ලීම් කළ වෛද්‍යවරයා",
      attach_report_label: "වාර්තාව අමුණන්න (PDF/Img)",
      permanently_remove: "ස්ථිරවම ඉවත් කරන්නද?",
      are_you_sure_remove: "ඔබට මෙම වාර්තාව ඉවත් කිරීමට අවශ්‍ය බව විශ්වාසද?",
      ok_remove: "ඔව්, ඉවත් කරන්න",
      no_back: "නැත, පසුපසට",
      view: "බලන්න",
      download: "බාගන්න",
      remove: "ඉවත් කරන්න",
      report_uploaded_activity: "නව වෛද්‍ය වාර්තාවක් එක් කරන ලදී: {name}",
      meal_logged_activity: "{type} සටහන් කරන ලදී: {name}",
      exercise_logged_activity: "ව්‍යායාම සටහන් කරන ලදී: {name} (විනාඩි {duration})",
      water_logged_activity: "ජලය පානය කිරීම යාවත්කාලීන කරන ලදී: අද මුළු මි.ලී. {total}",
      sleep_logged_activity: "නින්ද සටහන් කරන ලදී: පැය {duration} ({quality})",
      appointment_activity: "ඉදිරි වෛද්‍ය හමුවීම: {hospital} හි {reason}",
      appointment_today: "අද දින හමුවීම: {hospital} හි {reason}",
      appointment_missed: "මග හැරුණු හමුවීම: {hospital} හි {reason}",
      uploaded: "උඩුගත කරන ලදී",
      pending: "පොරොත්තු",
      reviewed: "පරික්ෂා කරන ලදී",
      save_medical_record_success: "වෛද්‍ය වාර්තාව සාර්ථකව සුරකිණි!",
      record_removed_success: "වාර්තාව සාර්ථකව ඉවත් කරන ලදී.",
      general_view: "සාමාන්‍ය දසුන",
      specific_lab_tests: "විශේෂිත රසායනාගාර පරීක්ෂණ",
      scans: "ස්කෑන් පරීක්ෂණ",
      other: "වෙනත්",
      prescription: "බෙහෙත් වට්ටෝරුව",
      'LH (Luteinizing Hormone) Test': "LH (ලියුටිනයිසින් හෝමෝන) පරීක්ෂණය",
      'FSH (Follicle Stimulating Hormone) Test': "FSH (ෆොලිකල් උත්තේජක හෝමෝන) පරීක්ෂණය",
      'Testosterone Level Test': "ටෙස්ටොස්ටෙරෝන් මට්ටම පරීක්ෂාව",
      'Prolactin Test': "ප්‍රෝලැක්ටින් පරීක්ෂණය",
      'Thyroid Function Test (TSH, T3, T4)': "තයිරොයිඩ් ක්‍රියාකාරිත්ව පරීක්ෂණය (TSH, T3, T4)",
      'Pelvic Ultrasound Scan': "ශ්‍රෝණි අල්ට්‍රා සවුන්ඩ් ස්කෑන්",
      'Fasting Blood Sugar (FBS)': "නිරාහාර රුධිර සීනි (FBS)",
      'Oral Glucose Tolerance Test (OGTT)': "මුඛ ග්ලූකෝස් දරා ගැනීමේ පරීක්ෂණය (OGTT)",
      'HbA1c Test': "HbA1c පරීක්ෂණය",
      'Lipid Profile (Cholesterol Test)': "ලිපිඩ පැතිකඩ (කොලෙස්ටරෝල් පරීක්ෂණය)",
      meals_today: "🥗 අද දින ආහාර",
      log_meal_title: "➕ ආහාරයක් එක් කරන්න",
      meal_type_label: "ආහාර වර්ගය *",
      meal_type_placeholder: "ආහාර වර්ගය තෝරන්න...",
      breakfast: "උදේ ආහාරය",
      lunch: "දවල් ආහාරය",
      dinner: "රාත්‍රී ආහාරය",
      snack: "කෙටි ආහාරයක්",
      meal_name_label: "ඔබ ආහාරයට ගත්තේ කුමක්ද? *",
      meal_name_placeholder: "උදා: පලතුරු සලාදයක් සමඟ ග්‍රිල්ඩ් චිකන්",
      food_categories: "ආහාර කාණ්ඩ",
      protein: "ප්‍රෝටීන්",
      vegetables: "එළවළු",
      fruits: "පලතුරු",
      grains: "ධාන්‍ය",
      dairy: "කිරි ආශ්‍රිත නිෂ්පාදන",
      fats: "සෞඛ්‍ය සම්පන්න මේදය",
      calories_label: "කැලරි (විකල්ප)",
      calories_placeholder: "උදා: 450",
      notes_label: "සටහන්",
      meal_notes_placeholder: "මෙම ආහාරයෙන් පසු ඔබට හැඟුණේ කෙසේද? යම් රෝග ලක්ෂණ තිබේද?",
      save_meal: "💾 ආහාරය සුරකින්න",
      meal_history: "📋 ආහාර ඉතිහාසය",
      no_meals_msg: "තවමත් ආහාර ඇතුළත් කර නැත",
      log_exercise_title: "➕ ව්‍යායාමයක් එක් කරන්න",
      exercise_type_label: "ව්‍යායාම වර්ගය *",
      exercise_type_placeholder: "වර්ගය තෝරන්න...",
      cardio: "හෘද වාහිනී (දිවීම, පාපැදි පැදීම...)",
      strength: "ශක්තිය වර්ධනය කිරීම",
      yoga: "යෝග",
      walking: "ඇවිදීම",
      swimming: "පිහිනීම",
      stretching: "ඇඟ ඇදීම",
      exercise_name_label: "ව්‍යායාමයේ නම *",
      exercise_name_placeholder: "උදා: උදෑසන උද්‍යානයේ ඇවිදීම",
      duration_label: "කාලය (මිනිත්තු) *",
      intensity_label: "තීව්‍රතාවය",
      light: "සැහැල්ලු",
      moderate: "මධ්‍යම",
      vigorous: "දැඩි",
      calories_burned_label: "දහනය වූ කැලරි (අනුමාන)",
      feel_notes_placeholder: "ශක්ති මට්ටම, යම් වේදනාවක් හෝ අපහසුවක්...",
      save_exercise: "💾 ව්‍යායාමය සුරකින්න",
      exercise_history: "📋 ව්‍යායාම ඉතිහාසය",
      no_exercises_msg: "තවමත් ව්‍යායාම ඇතුළත් කර නැත",
      log_water_title: "💧 ජලය පානය කිරීම සටහන් කරන්න",
      quick_add: "වේගයෙන් එක් කරන්න",
      small_glass: "කුඩා වීදුරුවක්",
      medium_glass: "මධ්‍යම වීදුරුවක්",
      large_glass: "විශාල වීදුරුවක්",
      one_litre: "ලීටර් 1 ක්",
      custom_water_label: "නැතහොත් ප්‍රමාණය ඇතුළත් කරන්න (මි.ලී.)",
      custom_water_placeholder: "ප්‍රමාණය මි.ලී. වලින් ඇතුළත් කරන්න",
      today_intake_goal: "අද දින පානය · ඉලක්කය: 2,500 මි.ලී.",
      water_goal_reached: "දෛනික ඉලක්කයෙන්",
      water_history: "💧 ජලය පානය කිරීමේ ඉතිහාසය",
      no_water_msg: "අද දිනයේ ජලය පානය කිරීම සටහන් කර නැත",
      log_sleep_title: "😴 නින්ද සටහන් කරන්න",
      sleep_date_label: "නින්දට ගිය දිනය *",
      sleep_quality_label: "නින්දේ ගුණාත්මකභාවය",
      poor: "දුර්වලයි (නොසන්සුන්)",
      fair: "සාමාන්‍යයි",
      good: "හොඳයි",
      excellent: "ඉතා හොඳයි",
      bedtime_label: "නින්දට ගිය වේලාව *",
      waketime_label: "අවදි වූ වේලාව *",
      hours_slept_label: "නිදාගත් පැය ගණන",
      sleep_notes_placeholder: "ඔබේ නින්දට බලපෑ කරුණු? (කැෆේන්, ආතතිය, පරිසරය...)",
      save_sleep: "💾 නින්ද සුරකින්න",
      sleep_history: "📋 නින්දේ ඉතිහාසය",
      no_sleep_msg: "තවමත් නින්ද සටහන් කර නැත",
      total: "එකතුව",
      pending_status: "⟳ පොරොත්තු",
      reviewed_status: "පරික්ෂා කරන ලදී",
      uploaded_status: "උඩුගත කරන ලදී",
      no_upcoming_visits: "ඉදිරි හමුවීම් නැත",
      upload_first_report: "පළමු වාර්තාව උඩුගත කරන්න",
      appointment_activity: "ඉදිරි වෛද්‍ය හමුවීම: {hospital} හි {reason}",
      appointment_today: "අද දින හමුවීම: {hospital} හි {reason}",
      appointment_missed: "මග හැරුණු හමුවීම: {hospital} හි {reason}",
      records: "වාර්තා",
      records_today: "අද දින වාර්තා",
      amount: "ප්‍රමාණය",
      day_total: "දෛනික එකතුව",
      logged_at: "සටහන් කළ වේලාව",
      action: "ක්‍රියාව",
      log_meal_hint: "ඉහත පෝරමය පුරවා Save Meal ඔබන්න",
      log_exercise_hint: "ඔබේ පළමු ව්‍යායාමය සටහන් කරන්න",
      log_water_hint: "සටහන් කිරීම ආරම්භ කිරීමට බොත්තමක් ඔබන්න",
      log_sleep_hint: "නින්ද පිළිබඳ දත්ත ඉහත සටහන් කරන්න",
      track_lifestyle_title: "ඔබේ ජීවන රටාව නිරීක්ෂණය කරන්න 🌱",
      track_lifestyle_desc: "ඔබේ PCOS රෝග ලක්ෂණ ඵලදායී ලෙස කළමනාකරණය කිරීම සඳහා ඔබේ ආහාර වේල, ව්‍යායාම, ජල පරිභෝජනය සහ නින්ද නිරීක්ෂණය කරන්න.",
      manage_visits: "ඔබේ සායනික පැමිණීම් සහ උපදේශන කළමනාකරණය කරන්න",
      health_schedule_title: "ඔබේ සෞඛ්‍ය කාලසටහන 📅",
      health_schedule_subtitle: "ඔබේ වෛද්‍ය හමුවීම් පිළිබඳ විමසිලිමත් වන්න. විධිමත් පරීක්ෂාවන් PCOS කළමනාකරණය සඳහා ප්‍රධාන වේ.",
      upcoming: "ඉදිරි හමුවීම්",
      total_visits: "මුළු පැමිණීම් සංඛ්‍යාව",
      book_appointment: "➕ හමුවීමක් වෙන්කරවා ගන්න",
      all_appointments: "සියලුම හමුවීම්",
      history: "ඉතිහාසය",
      no_appts_found: "කිසිදු හමුවීමක් හමු නොවීය",
      no_appts_msg: "ඔබ තවමත් කිසිදු සායනික පැමිණීමක් සැලසුම් කර නැත. <br> පළමු හමුවීම වෙන්කරවා ගැනීමට දකුණු පස ඇති පෝරමය භාවිතා කරන්න!",
      schedule_new: "නව හමුවීමක්",
      hospital_name: "රෝහලේ නම",
      enter_hospital: "රෝහල හෝ සායනය ඇතුළත් කරන්න",
      doctor_name: "වෛද්‍යවරයාගේ නම",
      dr_name_optional: "වෛද්‍යවරයාගේ නම (විකල්ප)",
      visit_type: "පැමිණීමේ වර්ගය",
      consultation: "උපදේශනය",
      'pcos-check-up': "PCOS පරීක්ෂාව",
      'follow-up': "පසු විපරම",
      'lab-test': "පරීක්ෂණ/ස්කෑන්",
      reason_notes: "හේතුව / සටහන්",
      visit_reason_placeholder: "පැමිණීමේ අරමුණ කුමක්ද?",
      save_appointment: "💾 හමුවීම සුරකින්න",
      reschedule_visit: "හමුවීම නැවත සැලසුම් කරන්න 🕓",
      reschedule_msg: "කරුණාකර ඔබගේ උපදේශනය සඳහා නව දිනයක් සහ වේලාවක් තෝරන්න.",
      new_date: "නව දිනය",
      new_time: "නව වේලාව",
      update_schedule: "කාලසටහන යාවත්කාලීන කරන්න",
      medical_officer: "වෛද්‍ය නිලධාරී",
      reschedule: "🕓 නැවත සැලසුම් කරන්න",
      cancel_visit: "✕ අවලංගු කරන්න",
      upcoming: "ඉදිරි",
      completed: "සම්පූර්ණයි",
      cancelled: "අවලංගුයි",
      rescheduled: "නැවත සැලසුම් කළ",
      at: "දී",
      lab_results_title: "පරීක්ෂණ වාර්තා",
      total_results: "මුළු වාර්තා සංඛ්‍යාව",
      added_this_month: "මේ මාසයේ එක් කළ",
      added_this_year: "මේ වසරේ එක් කළ",
      search_lab_placeholder: "පරීක්ෂණය, ලැබ් එක හෝ වර්ගය අනුව සොයන්න...",
      all_lab_results: "සියලුම පරීක්ෂණ වාර්තා",
      received_only: "ලැබුණු වාර්තා පමණයි",
      pending_only: "පොරොත්තු වාර්තා පමණයි",
      loading_medical_records: "ඔබේ වෛද්‍ය වාර්තා ලබා ගනිමින් පවතී...",
      no_lab_results_found: "පරීක්ෂණ වාර්තා කිසිවක් හමු නොවීය",
      no_lab_results_msg: "ඔබේ පරීක්ෂණ වාර්තා උඩුගත කළ පසු හෝ ලැබ් එකෙන් ලැබුණු පසු මෙහි දිස්වනු ඇත.",
      upload_first_result: "📤 පළමු වාර්තාව උඩුගත කරන්න",
      upload_lab_result_title: "📤 පරීක්ෂණ වාර්තාවක් උඩුගත කරන්න",
      test_name_label: "පරීක්ෂණයේ නම *",
      test_category_label: "පරීක්ෂණ කාණ්ඩය",
      hospital_clinic_label: "රෝහල / සායනය",
      doctor_requested_label: "ඉල්ලීම් කළ වෛද්‍යවරයා",
      test_date_label: "පරීක්ෂණ දිනය *",
      attach_file_label: "PDF හෝ රූපයක් එක් කරන්න",
      click_to_select: "ගොනුව තෝරා ගැනීමට ක්ලික් කරන්න",
      save_medical_result: "වෛද්‍ය වාර්තාව සුරකින්න",
      remove_result_title: "වාර්තාව ඉවත් කරන්නද?",
      remove_result_msg: "ඔබට මෙම පරීක්ෂණ වාර්තාව ඉවත් කිරීමට අවශ්‍ය බව විශ්වාසද?",
      medical_documents_title: "මගේ වෛද්‍ය ලියකියවිලි",
      upload_report: "📤 වාර්තාවක් උඩුගත කරන්න",
      total_files: "මුළු ගොනු සංඛ්‍යාව",
      search_reports_placeholder: "නම හෝ ආයතනය අනුව සොයන්න...",
      filter_by_type: "🔍 වර්ගය අනුව පෙරන්න...",
      accessing_vault: "වෛද්‍ය ගබඩාවට පිවිසෙමින් පවතී...",
      no_records_found: "වාර්තා කිසිවක් හමු නොවීය",
      no_records_msg: "ඔබ තවමත් මෙම කාණ්ඩය යටතේ කිසිදු වාර්තාවක් උඩුගත කර නැත.",
      upload_first_file: "📤 ඔබේ පළමු ගොනුව උඩුගත කරන්න",
      upload_document_title: "📤 ලේඛනයක් උඩුගත කරන්න",
      report_name_label: "වාර්තාවේ නම *",
      report_type_label: "වාර්තා වර්ගය / පරීක්ෂණය *",
      attach_report_label: "වාර්තාව අමුණන්න (PDF/Img)",
      save_medical_record: "වෛද්‍ය වාර්තාව සුරකින්න",
      permanently_remove: "ස්ථිරවම ඉවත් කරන්නද?",
      are_you_sure_remove: "ඔබට මෙම වාර්තාව ඉවත් කිරීමට අවශ්‍ය බව විශ්වාසද?",
      ok_remove: "ඔව්, ඉවත් කරන්න",
      no_back: "නැත, පසුපසට",
      syncing: "සමමුහුර්ත කරමින්...",
      my_hospital_title: "මගේ ලියාපදිංචි රෝහල",
      manage_healthcare: "ඔබේ සෞඛ්‍ය සේවා සපයන්නන් කළමනාකරණය කරන්න",
      hospital_hero_title: "ඔබට හොඳම සෞඛ්‍ය සේවාව සොයා ගන්න 🏥",
      hospital_hero_desc: "ඔබේ සියලුම වෛද්‍ය ප්‍රතිකාර එකම ස්ථානයක තබා ගැනීම සඳහා ඔබේ ප්‍රාථමික රෝහල සහ විශේෂඥ සායනය සමඟ ලියාපදිංචි වන්න.",
      register_new_hospital: "නව රෝහලක් ලියාපදිංචි කරන්න",
      fetching_hospitals: "ඔබේ ලියාපදිංචි රෝහල් ලබා ගනිමින් පවතී...",
      register_new_title: "අලුතින් ලියාපදිංචි කරන්න",
      hospital_name_label: "රෝහල් නාමය *",
      specialist_doctor_label: "විශේෂඥ වෛද්‍යවරයා",
      address_label: "ලිපිනය",
      contact_number_label: "සම්බන්ධතා අංකය *",
      email_label: "විද්‍යුත් තැපෑල",
      set_primary_label: "ප්‍රාථමික රෝහල ලෙස සකසන්න",
      register_hospital_btn: "රෝහල ලියාපදිංචි කරන්න",
      no_hospitals_registered: "තවමත් රෝහල් ලියාපදිංචි කර නොමැත. ඔබේ පළමු සායනය දකුණු පසින් ලියාපදිංචි කරන්න!",
      primary_provider_badge: "ප්‍රාථමික සපයන්නා",
      special_care: "විශේෂ සත්කාර",
      remove: "ඉවත් කරන්න",
      make_primary: "ප්‍රාථමික කරන්න",
      hospital_registered_success: "රෝහල සාර්ථකව ලියාපදිංචි කරන ලදී!",
      primary_provider_updated: "ප්‍රාථමික සපයන්නා යාවත්කාලීන කරන ලදී!",
      hospital_removed: "රෝහල ඉවත් කරන ලදී",
      hospital_registered_activity: "රෝහල සමඟ ලියාපදිංචි වී ඇත: {name}",
      removed_from_both: "මෙය ඔබගේ වාර්තා ලැයිස්තුවෙන්ද ඉවත් වේ",
      profile_title: "මගේ පැතිකඩ",
      profile_subtitle: "ඔබේ පුද්ගලික සහ වෛද්‍ය තොරතුරු කළමනාකරණය කරන්න",
      personal_info: "පුද්ගලික තොරතුරු",
      full_name_label: "සම්පූර්ණ නම",
      email_address_label: "විද්‍යුත් තැපැල් ලිපිනය",
      phone_number_label: "දුරකථන අංකය",
      dob_label: "උපන් දිනය",
      gender_label: "ස්ත්‍රී පුරුෂ භාවය",
      blood_group_label: "රුධිර ගණය",
      security_password: "ආරක්ෂාව සහ මුරපදය",
      current_password: "වත්මන් මුරපදය",
      new_password: "නව මුරපදය",
      confirm_new_password: "නව මුරපදය තහවුරු කරන්න",
      update_password_btn: "මුරපදය යාවත්කාලීන කරන්න",
      data_management: "දත්ත සහ අතේ ගෙන යා හැකි බව",
      download_data_json: "මගේ දත්ත බාගත කරන්න (JSON)",
      export_summary_csv: "වෛද්‍ය සාරාංශය අපනයනය කරන්න (CSV)",
      download_health_doc: "පුද්ගලාරෝපිත සෞඛ්‍ය ලේඛනය (TXT)",
      danger_zone: "අන්තරාදායක කලාපය",
      deactivate_account: "ගිණුම අක්‍රිය කරන්න",
      confirm_deactivation_title: "අක්‍රිය කිරීම තහවුරු කරන්න",
      deactivate_msg: "මෙම ගිණුමට දින 30ක් ඇතුළත ලොග් නොවන්නේ නම්, එය ස්ථිරවම මකා දැමෙනු ඇත.",
      enter_password_confirm: "අක්‍රිය කිරීම තහවුරු කිරීමට කරුණාකර ඔබේ මුරපදය ඇතුළත් කරන්න:",
      confirm_logout: "තහවුරු කර ඉවත් වන්න",
      keep_account: "මගේ ගිණුම තබා ගන්න",
      edit_personal_info_btn: "පුද්ගලික තොරතුරු සංස්කරණය කරන්න",
      save_changes_btn: "වෙනස්කම් සුරකින්න",
      profile_address: "ලිපිනය",
      not_provided: "සපයා නැත",
      unknown_blood: "නොදන්නා",
      female: "ස්ත්‍රී",
      male: "පුරුෂ",
      other_gender: "වෙනත්",
      profile_updated_success: "පැතිකඩ යාවත්කාලීන කරන ලදී!",
      password_changed_success: "මුරපදය සාර්ථකව වෙනස් කරන ලදී!",
      account_deactivated_success: "ඔබේ ගිණුම සාර්ථකව අක්‍රිය කර ඇත. ඉවත් වෙමින් පවතී...",
      notifications: "දැනුම්දීම්",
      notifications_desc: "ඔබට දැනුම්දීම් සහ මතක් කිරීම් ලැබෙන ආකාරය කළමනාකරණය කරන්න",
      email_notif: "විද්‍යුත් තැපැල් දැනුම්දීම්",
      email_notif_desc: "හමුවීම් සහ සෞඛ්‍යය පිළිබඳ විද්‍යුත් තැපැල් යාවත්කාලීන ලබා ගන්න",
      sms_alerts: "SMS ඇඟවීම්",
      sms_alerts_desc: "හමුවීම් සඳහා කෙටි පණිවිඩ මතක් කිරීම් ලබා ගන්න",
      appointment_reminders: "හමුවීම් මතක් කිරීම්",
      appointment_reminders_desc: "ඔබේ නියමිත හමුවීම්වලට පෙර මතක් කිරීම් ලබා ගන්න",
      cycle_reminders: "චක්‍ර මතක් කිරීම්",
      cycle_reminders_desc: "ඔබේ ඔසප් චක්‍රයේ සිදුවීම් පිළිබඳව දැනුම් දෙන්න",
      health_tips_articles: "සෞඛ්‍ය උපදෙස් සහ ලිපි",
      health_tips_articles_desc: "සතිපතා සෞඛ්‍ය උපදෙස් සහ අධ්‍යාපනික අන්තර්ගතයන් ලබා ගන්න",
      privacy_data: "පෞද්ගලිකත්වය සහ දත්ත",
      privacy_info_banner: "ඔබේ සෞඛ්‍ය දත්ත සංකේතනය කර ආරක්ෂිතව ගබඩා කර ඇත. ඔබේ කැමැත්තෙන් තොරව අපි කිසිවිටක ඔබේ පුද්ගලික තොරතුරු තෙවන පාර්ශවයන් සමඟ බෙදා නොගනිමු.",
      data_sharing: "දත්ත බෙදාගැනීම",
      data_sharing_desc: "ඔබේ සෞඛ්‍ය වාර්තා වෙත ප්‍රවේශ වීමට සායනවලට ඉඩ දෙන්න",
      research_participation: "පර්යේෂණ සහභාගීත්වය",
      research_participation_desc: "පර්යේෂණවලට සහභාගී වීමෙන් PCOS සත්කාර වැඩිදියුණු කිරීමට අපට උදවු කරන්න",
      anonymous_analytics: "නිර්නාමික විශ්ලේෂණ",
      anonymous_analytics_desc: "ଭାବිତ සංඛ්‍යාලේඛන එවීමෙන් යෙදුම වැඩිදියුණු කිරීමට අපට උදවු කරන්න",
      theme: "තේමාව",
      light_mode: "ආලෝක ප්‍රකාරය",
      dark_mode: "අඳුරු ප්‍රකාරය",
      auto_system: "ස්වයංක්‍රීය (පද්ධතිය)",
      primary_color: "ප්‍රාථමික වර්ණ",
      text_size: "පෙළ ප්‍රමාණය",
      small_size: "කුඩා",
      medium_size: "මධ්‍යම",
      large_size: "විශාල",
      weight_unit: "බර ඒකකය",
      kilograms: "කිලෝග්‍රෑම් (kg)",
      pounds: "රාත්තල් (lbs)",
      height_unit: "උස ඒකකය",
      centimeters: "සෙන්ටිමීටර (cm)",
      feet_inches: "අඩි සහ අඟල්",
      avg_cycle_length: "සාමාන්‍ය චක්‍රයේ දිග (දින)",
      avg_period_duration: "සාමාන්‍ය ඔසප් කාලය (දින)",
      health_tracking_priorities: "සෞඛ්‍ය ලුහුබැඳීමේ ප්‍රමුඛතා",
      track_symptoms_opt: "රෝග ලක්ෂණ ලුහුබැඳීම",
      track_exercise_opt: "ව්‍යායාම සහ ක්‍රියාකාරකම්",
      track_nutrition_opt: "පෝෂණය සහ ආහාර",
      track_mood_opt: "මනෝභාවය සහ ආතතිය",
      track_sleep_opt: "නින්දේ ගුණාත්මකභාවය",
      save_health_settings_btn: "සෞඛ්‍ය සැකසුම් සුරකින්න",
      language_label: "භාෂාව",
      timezone_label: "කාල කලාපය",
      save_language_settings_btn: "භාෂා සැකසුම් සුරකින්න",
      clear_local_data_btn: "සියලුම දේශීය දත්ත මකන්න",
      clear_data_desc: "මෙය හැඹිලිගත දත්ත මකා දමනු ඇත නමුත් සේවාදායකයේ ඇති ඔබගේ ගிණුමට බලපාන්නේ නැත.",
      clinic: "සායනය",
      role_patient: "රෝගියා",
      fertile_window_status: "සරු කාලය",
      days: "දින",
      day: "දිනය",
      lifestyle_log_title: "ජීවන රටා සටහන",
      track_lifestyle_desc: "ඔබේ PCOS රෝග ලක්ෂණ ඵලදායී ලෙස කළමනාකරණය කිරීම සඳහා ඔබේ ආහාර වේල, ව්‍යායාම, සජලනය සහ නින්ද නිරීක්ෂණය කරන්න.",
      meal_log: "ආහාර සටහන",
      exercise_log: "ව්‍යායාම සටහන",
      hydration_log: "ජල පරිභෝජන සටහන",
      sleep_log: "නින්ද සටහන",
      search_logs_placeholder: "සටහන් සොයන්න…",
      select_type: "වර්ගය තෝරන්න…",
      meal_notes_placeholder: "ඔබට හැඟුණේ කෙසේද? යම් රෝග ලක්ෂණ තිබේද?",
      action: "ක්‍රියාව",
      food_categories: "ආහාර වර්ගීකරණය",
      records: "සටහන්",
      log_meal_title: "ඔබේ ආහාර වේල සටහන් කරන්න",
      meal_name_label: "ආහාරයේ නම",
      meal_time_label: "ආහාර ගත් වේලාව",
      meal_type_label: "ආහාර වර්ගය",
      breakfast: "උදෑසන ආහාරය",
      lunch: "දිවා ආහාරය",
      dinner: "රාත්‍රී ආහාරය",
      snack: "අතුරු පස",
      dietary_tags: "ආහාර ටැග්",
      high_protein: "ඉහළ ප්‍රෝටීන්",
      low_carb: "අඩු කාබෝහයිඩ්‍රේට්",
      vegetarian: "නිර්මාංශ",
      dairy_free: "කිරි රහිත",
      gluten_free: "ග්ලූටන් රහිත",
      sugar_free: "සීනි රහිත",
      portions_label: "කොටස් ප්‍රමාණය",
      log_meal_btn: "ආහාර වේල සටහන් කරන්න",
      log_exercise_title: "ඔබේ ව්‍යායාමය සටහන් කරන්න",
      exercise_name_label: "ව්‍යායාමයේ නම",
      duration_label: "කාලය (විනාඩි)",
      intensity_label: "තීව්‍රතාවය",
      low: "අඩු",
      moderate: "මධ්‍යම",
      high: "ඉහළ",
      calories_label: "දැවී ගිය කැලරි (දළ වශයෙන්)",
      log_exercise_btn: "ව්‍යායාමය සටහන් කරන්න",
      hydration_title: "ජල පරිභෝජන ලුහුබැඳීම",
      add_water: "ජලය එක් කරන්න",
      custom_amount: "අභිරුචි ප්‍රමාණය (ml)",
      hydration_history: "ජල පරිභෝජන ඉතිහාසය",
      log_sleep_title: "ඔබේ නින්ද සටහන් කරන්න",
      sleep_duration_label: "කාලය (පැය)",
      sleep_quality_label: "නින්දේ ගුණාත්මකභාවය",
      poor: "දුර්වල",
      fair: "සෑහෙන",
      good: "හොඳ",
      excellent: "විශිෂ්ට",
      wake_up_feeling: "අවදි වන විට දැනෙන හැඟීම",
      refreshed: "ප්‍රබෝධමත්",
      tired: "වෙහෙසකර",
      groggy: "කලබලකාරී",
      log_sleep_btn: "නින්ද සටහන් කරන්න",
      history: "ඉතිහාසය",
      no_meals_today: "අද දින සඳහා ආහාර සටහන් කර නොමැත.",
      no_exercises_today: "අද දින සඳහා ව්‍යායාම සටහන් කර නොමැත.",
      no_sleep_logged: "මෑතකදී නින්ද දත්ත සටහන් කර නොමැත.",
      daily_total: "දෛනික එකතුව",
      portions_unit: "කොටස්",
      minutes_unit: "විනාඩි",
      calories_unit: "kcal",
      hours_unit: "පැය",
      entry_deleted: "සටහන මකා දමන ලදී",
      meal_added: "ආහාර වේල එක් කරන ලදී!",
      exercise_added: "ව්‍යායාමය එක් කරන ලදී!",
      water_added: "ජල පරිභෝජනය යාවත්க்கාලීන කරන ලදී!",
      sleep_added: "නින්ද දත්ත සුරකින ලදී!",
      fill_fields_error: "කරුණාකර සියලුම අවශ්‍ය ක්ෂේත්‍ර පුරවන්න.",
      delete_confirm: "මෙම සටහන මකා දැමීමට ඔබට විශ්වාසද?",
      meal_saved_success: "ආහාර වේල සාර්ථකව සුරක්න ලදී! 🥗",
      exercise_saved_success: "ව්‍යායාම සුරක්න ලදී! 🏃",
      water_logged_success: "ජල පරිභෝජනය යාවත්කාලීන කරන ලදී! 💧",
      sleep_logged_success: "නින්ද සටහන් කරන ලදී! 😴",
      amount: "ප්‍රමාණය",
      day_total: "දෛනික එකතුව",
      logged_at: "සටහන් කළ වේලාව",
      received: "ලැබී ඇත",
      processing: "සැකසෙමින් පවතී",
      sync_complete_msg: "සමමුහුර්ත කිරීම අවසන්! ප්‍රතිඵලය පරීක්ෂණ වාර්තා සහ මගේ වාර්තා වෙත එක් කරන ලදී.",
      error_comm: "සන්නිවේදන දෝෂයකි.",
      removing_msg: "ඉවත් කරමින් පවතී...",
      unknown_date: "නොදන්නා දිනයක්",
      general: "සාමාන්‍ය",
      not_specified: "සඳහන් කර නැත",
      test_name_placeholder: "උදා: සම්පූර්ණ රුධිර පරීක්ෂාව, HbA1c",
      hospital_name_placeholder: "උදා: ආසිරි හෙල්ත්",
      doctor_name_placeholder: "උදා: වෛද්‍ය පෙරේරා",
      upload_size_limit: "උපරිම ප්‍රමාණය 10MB (PDF, JPG, PNG)"
    },
    ta: {
      dashboard: "டாஷ்போர்டு",
      settings: "அமைப்புகள்",
      profile: "சுயவிவரம்",
      logout: "வெளியேறு",
      notifications: "அறிவிப்புகள்",
      messages: "செய்திகள்",
      symptoms: "அறிகுறிகள்",
      cycle: "மாதவிடாய் சுழற்சி",
      reports: "அறிக்கைகள்",
      lifestyle: "வாழ்க்கை முறை பதிவு",
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
      patient_portal: "நோயாளி போர்டல்",
      upload_new_report: "புதிய அறிக்கையைப் பதிவேற்றவும்",
      log_activities: "இன்றைய செயல்பாடுகளைப் பதிவுசெய்க",
      log_first_cycle: "சுழற்சியைப் பதிவுசெய்",
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
      started_on: "தொடங்கியது",
      medical_documents: "எனது மருத்துவ ஆவணங்கள்",
      upload_report: "பதிவேற்றவும்",
      filter_by_type: "🔍 வகைப்படி வடிகட்டவும்...",
      total_files: "மொத்த கோப்புகள்",
      added_this_month: "இந்த மாதம் சேர்க்கப்பட்டது",
      added_this_year: "இந்த ஆண்டு சேர்க்கப்பட்டது",
      search_reports_placeholder: "பெயர் அல்லது மருத்துவமனை மூலம் தேடவும்...",
      all_documents: "அனைத்து ஆவணங்கள்",
      all_lab_results: "அனைத்து ஆய்வக முடிவுகள்",
      all_scans: "அனைத்து ஸ்கேன் முடிவுகள்",
      no_records_found: "ஆவணங்கள் எதுவும் இல்லை",
      no_records_msg: "இந்த பிரிவில் நீங்கள் இன்னும் எந்த ஆவணங்களையும் பதிவேற்றவில்லை.",
      view: "பார்",
      download: "பதிவிறக்கம்",
      remove: "நீக்கு",
      records: "பதிவுகள்",
      records_today: "இன்றைய பதிவுகள்",
      amount: "அளவு",
      day_total: "தினசரி மொத்தம்",
      logged_at: "பதிவு செய்யப்பட்ட நேரம்",
      action: "நடவடிக்கை",
      log_meal_hint: "மேலே உள்ள படிவத்தை பூர்த்தி செய்து சேமிக்கவும்",
      log_exercise_hint: "உங்கள் முதல் பயிற்சியைப் பதிவு செய்யவும்",
      log_water_hint: "பதிவு செய்ய பட்டனை அழுத்தவும்",
      log_sleep_hint: "தூக்கத் தரவை மேலே பதிவு செய்யவும்",
      appointment_missed: "சந்திப்பு தவறவிடப்பட்டது: {hospital} இல் {reason}",
      hospital_registered_activity: "மருத்துவமனையில் பதிவு செய்யப்பட்டுள்ளது: {name}",
      profile_title: "எனது சுயவிவரம்",
      profile_subtitle: "உங்கள் தனிப்பட்ட மற்றும் மருத்துவ தகவல்களை நிர்வகிக்கவும்",
      personal_info: "தனிப்பட்ட தகவல்",
      full_name_label: "முழு பெயர்",
      email_address_label: "மின்னஞ்சல் முகவரி",
      phone_number_label: "தொலைபேசி எண்",
      dob_label: "பிறந்த தேதி",
      gender_label: "பாலினம்",
      blood_group_label: "இரத்த வகை",
      security_password: "பாதுகாப்பு மற்றும் கடவுச்சொல்",
      current_password: "தற்போதைய கடவுச்சொல்",
      new_password: "புதிய கடவுச்சொல்",
      confirm_new_password: "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",
      update_password_btn: "கடவுச்சொல்லைப் புதுப்பிக்கவும்",
      data_management: "தரவு மற்றும் பெயர்வுத்திறன்",
      download_data_json: "எனது தரவை பதிவிறக்குக (JSON)",
      export_summary_csv: "மருத்துவ சுருக்கத்தை ஏற்றுமதி செய் (CSV)",
      download_health_doc: "தனிப்பயனாக்கப்பட்ட சுகாதார ஆவணம் (TXT)",
      danger_zone: "ஆபத்து மண்டலம்",
      deactivate_account: "கணக்கை முடக்கவும்",
      confirm_deactivation_title: "முடக்கத்தை உறுதிப்படுத்தவும்",
      deactivate_msg: "இந்த கணக்கு 30 நாட்களுக்குள் உள்நுழையவில்லை என்றால், அது நிரந்தரமாக நீக்கப்படும்.",
      enter_password_confirm: "முடக்கத்தை உறுதிப்படுத்த உங்கள் கடவுச்சொல்லை உள்ளிடவும்:",
      confirm_logout: "உறுதிப்படுத்தி வெளியேறு",
      keep_account: "எனது கணக்கை வைத்திருங்கள்",
      edit_personal_info_btn: "தனிப்பட்ட தகவலைத் திருத்தவும்",
      save_changes_btn: "மாற்றங்களைச் சேமிக்கவும்",
      profile_address: "முகவரி",
      not_provided: "வழங்கப்படவில்லை",
      unknown_blood: "தெரியவில்லை",
      female: "பெண்",
      male: "ஆண்",
      other_gender: "மற்றவை",
      profile_updated_success: "சுயவிவரம் புதுப்பிக்கப்பட்டது!",
      password_changed_success: "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!",
      account_deactivated_success: "உங்கள் கணக்கு வெற்றிகரமாக முடக்கப்பட்டது. வெளியேறுகிறது...",
      notifications: "அறிவிப்புகள்",
      notifications_desc: "அறிவிப்புகள் மற்றும் நினைவூட்டல்களைப் பெறுவதை நிர்வகிக்கவும்",
      email_notif: "மின்னஞ்சல் அறிவிப்புகள்",
      email_notif_desc: "சந்திப்புகள் மற்றும் ஆரோக்கியம் பற்றிய மின்னஞ்சல் புதுப்பிப்புகளைப் பெறுங்கள்",
      sms_alerts: "SMS விழிப்பூட்டல்கள்",
      sms_alerts_desc: "சந்திப்புகளுக்கான குறுஞ்செய்தி நினைவூட்டல்களைப் பெறுங்கள்",
      appointment_reminders: "சந்திப்பு நினைவூட்டல்கள்",
      appointment_reminders_desc: "திட்டமிடப்பட்ட சந்திப்புகளுக்கு முன் நினைவூட்டப் பெறுங்கள்",
      cycle_reminders: "சுழற்சி நினைவூட்டல்கள்",
      cycle_reminders_desc: "உங்கள் மாதவிடாய் சுழற்சி நிகழ்வுகள் பற்றி அறிவிக்கப் பெறுங்கள்",
      health_tips_articles: "ஆரோக்கிய குறிப்புகள் மற்றும் கட்டுரைகள்",
      health_tips_articles_desc: "வாராந்திர ஆரோக்கிய குறிப்புகள் மற்றும் கல்வி உள்ளடக்கத்தைப் பெறுங்கள்",
      privacy_data: "தனியுரிமை மற்றும் தரவு",
      privacy_info_banner: "உங்கள் சுகாதார தரவு குறியாக்கம் செய்யப்பட்டு பாதுகாப்பாக சேமிக்கப்படுகிறது. உங்கள் ஒப்புதலின்றி உங்கள் தனிப்பட்ட தகவலை ஒருபோதும் மூன்றாம் தரப்பினருடன் பகிர்ந்து கொள்ள மாட்டோம்.",
      data_sharing: "தரவு பகிர்வு",
      data_sharing_desc: "கிளினிக்குகள் உங்கள் சுகாதார பதிவுகளை அணுக அனுமதிக்கவும்",
      research_participation: "ஆராய்ச்சி பங்கேற்பு",
      research_participation_desc: "ஆராய்ச்சியில் பங்கேற்பதன் மூலம் பி.சி.ஓ.எஸ் பராமரிப்பை மேம்படுத்த எங்களுக்கு உதவுங்கள்",
      anonymous_analytics: "நிர்நாமிக பகுப்பாய்வு",
      anonymous_analytics_desc: "பயன்பாட்டு புள்ளிவிவரங்களை அனுப்புவதன் மூலம் பயன்பாட்டை மேம்படுத்த எங்களுக்கு உதவுங்கள்",
      theme: "கருப்பொருள்",
      light_mode: "ஒளி பயன்முறை",
      dark_mode: "இருண்ட பயன்முறை",
      auto_system: "தானியங்கி (அமைப்பு)",
      primary_color: "முதன்மை நிறம்",
      text_size: "உரை அளவு",
      small_size: "சிறியது",
      medium_size: "நடுத்தரம்",
      large_size: "பெரியது",
      weight_unit: "எடை அலகு",
      kilograms: "கிலோகிராம் (kg)",
      pounds: "பவுண்டுகள் (lbs)",
      height_unit: "உயர அலகு",
      centimeters: "சென்டிமீட்டர் (cm)",
      feet_inches: "அடி மற்றும் அங்குலம்",
      avg_cycle_length: "சராசரி சுழற்சி நீளம் (நாட்கள்)",
      avg_period_duration: "சராசரி மாதவிடாய் காலம் (நாட்கள்)",
      health_tracking_priorities: "சுகாதார கண்காணிப்பு முன்னுரிமைகள்",
      track_symptoms_opt: "அறிகுறி கண்காணிப்பு",
      track_exercise_opt: "உடற்பயிற்சி மற்றும் செயல்பாடு",
      track_nutrition_opt: "ஊட்டச்சத்து மற்றும் உணவு",
      track_mood_opt: "மனநிலை மற்றும் மன அழுத்தம்",
      track_sleep_opt: "தூக்கத்தின் தரம்",
      save_health_settings_btn: "சுகாதார அமைப்புகளைச் சேமிக்கவும்",
      language_label: "மொழி",
      timezone_label: "நேர மண்டலம்",
      save_language_settings_btn: "மொழி அமைப்புகளைச் சேமிக்கவும்",
      clear_local_data_btn: "அனைத்து உள்ளூர் தரவையும் அழிக்கவும்",
      clear_data_desc: "இது தற்காலிக தரவை அழிக்கும் ஆனால் சேவையகத்தில் உள்ள உங்கள் கணக்கை பாதிக்காது.",
      role_patient: "நோயாளி",
      fertile_window_status: "கருவுறுதல் காலம்",
      days: "நாட்கள்",
      day: "நாள்",
      lifestyle_log_title: "வாழ்க்கை முறை பதிவு",
      track_lifestyle_title: "உங்கள் வாழ்க்கை முறையைக் கண்காணியுங்கள் 🌱",
      track_lifestyle_desc: "உங்கள் பி.சி.ஓ.எஸ் அறிகுறிகளை திறம்பட நிர்வகிக்க உங்கள் உணவு, உடற்பயிற்சி, நீரேற்றம் மற்றும் தூக்கத்தை கண்காணிக்கவும்.",
      meal_log: "உணவு பதிவு",
      exercise_log: "உடற்பயிற்சி பதிவு",
      hydration_log: "நீரேற்றம் பதிவு",
      sleep_log: "தூக்க பதிவு",
      search_logs_placeholder: "பதிவுகளை தேடுங்கள்…",
      select_type: "வகையைத் தேர்ந்தெடுக்கவும்…",
      meal_notes_placeholder: "நீங்கள் எப்படி உணர்ந்தீர்கள்? ஏதேனும் அறிகுறிகள்?",
      action: "நடவடிக்கை",
      food_categories: "உணவு வகைகள்",
      records: "பதிவுகள்",
      log_meal_title: "உங்கள் உணவைப் பதிவுசெய்க",
      meal_name_label: "உணவின் பெயர்",
      meal_name_placeholder: "எ.கா., கினோவா சாலட்டுடன் வறுக்கப்பட்ட கோழி",
      meal_time_label: "உணவு நேரம்",
      meal_type_label: "உணவு வகை",
      breakfast: "காலை உணவு",
      lunch: "மதிய உணவு",
      dinner: "இரவு உணவு",
      snack: "சிற்றுண்டி",
      dietary_tags: "உணவு குறிச்சொற்கள்",
      high_protein: "அதிக புரதம்",
      low_carb: "குறைந்த கார்ப்",
      vegetarian: "சைவம்",
      dairy_free: "பால் அற்றது",
      gluten_free: "குளுட்டன் அற்றது",
      sugar_free: "சர்க்கரை அற்றது",
      portions_label: "பகுதிகள்",
      log_meal_btn: "உணவைப் பதிவுசெய்க",
      log_exercise_title: "உங்கள் உடற்பயிற்சியைப் பதிவுசெய்க",
      exercise_name_label: "உடற்பயிற்சியின் பெயர்",
      duration_label: "கால அளவு (நிமிடங்கள்)",
      intensity_label: "தீவிரம்",
      low: "குறைந்த",
      moderate: "மிதமான",
      high: "அதிக",
      calories_label: "எரிக்கப்பட்ட கலோரிகள் (தோராயமாக)",
      log_exercise_btn: "உடற்பயிற்சியைப் பதிவுசெய்க",
      exercise_name_placeholder: "எ.கா., பூங்காவில் காலை நேர ஓட்டம்",
      calories_burned_label: "எரிக்கப்பட்ட கலோரிகள் (தோராயமாக)",
      calories_placeholder: "எ.கா., 250",
      notes_label: "நீங்கள் எப்படி உணர்ந்தீர்கள்?",
      feel_notes_placeholder: "ஆற்றல் நிலை, ஏதேனும் வலி அல்லது அசௌகரியம்...",
      hydration_title: "நீரேற்றம் கண்காணிப்பு",
      quick_add: "விரைவான சேர்ப்பு",
      small_glass: "சிறிய கிளாஸ்",
      medium_glass: "நடுத்தர கிளாஸ்",
      large_glass: "பெரிய கிளாஸ்",
      one_litre: "1 லிட்டர்",
      custom_water_label: "அல்லது தனிப்பயன் அளவை உள்ளிடவும் (மி.லி)",
      custom_water_placeholder: "மி.லி-இல் அளவை உள்ளிடவும்",
      add: "சேர்",
      today_intake_goal: "இன்றைய உட்கொள்ளல் · இலக்கு: 2,500 மி.லி",
      water_goal_reached: "தினசரி இலக்கில்",
      hydration_history: "நீரேற்றம் வரலாறு",
      log_sleep_title: "உங்கள் தூக்கத்தைப் பதிவுசெய்க",
      sleep_date_label: "தூக்கத்தின் தேதி *",
      sleep_quality_label: "தூக்கத்தின் தரம்",
      select_quality: "தரத்தைத் தேர்ந்தெடுக்கவும்...",
      poor: "😟 மோசமான (மிகவும் அமைதியற்ற)",
      fair: "😐 சுமார் (சில இடையூறுகள்)",
      good: "🙂 நல்ல (பெரும்பாலும் அமைதியான)",
      excellent: "😄 சிறந்த (மிகவும் அமைதியான)",
      bedtime_label: "தூங்கும் நேரம் *",
      waketime_label: "எழும் நேரம் *",
      hours_slept_label: "தூங்கிய நேரம் (தானாக கணக்கிடப்படுகிறது)",
      sleep_duration_placeholder: "மேலே தூங்கும் மற்றும் எழும் நேரத்தை அமைக்கவும்",
      sleep_notes_placeholder: "உங்கள் தூக்கத்தைப் பாதித்த காரணிகள்? (கஃபைன், மன அழுத்தம், சூழல்...)",
      wake_up_feeling: "எழுந்திருக்கும் போது உணர்வு",
      refreshed: "புத்துணர்ச்சி",
      tired: "சோர்வு",
      groggy: "குழப்பமான",
      log_sleep_btn: "தூக்கத்தைப் பதிவுசெய்க",
      history: "வரலாறு",
      no_meals_today: "இன்று உணவுகள் எதுவும் பதிவு செய்யப்படவில்லை.",
      no_exercises_today: "இன்று உடற்பயிற்சிகள் எதுவும் பதிவு செய்யப்படவில்லை.",
      no_sleep_logged: "சமீபத்தில் தூக்க தரவு எதுவும் பதிவு செய்யப்படவில்லை.",
      daily_total: "தினசரி மொத்தம்",
      portions_unit: "பகுதிகள்",
      minutes_unit: "நிமிடங்கள்",
      calories_unit: "kcal",
      hours_unit: "மணிகள்",
      entry_deleted: "பதிவு நீக்கப்பட்டது",
      meal_added: "உணவு சேர்க்கப்பட்டது!",
      exercise_added: "உடற்பயிற்சி சேர்க்கப்பட்டது!",
      water_added: "நீர் உட்கொள்ளல் புதுப்பிக்கப்பட்டது!",
      sleep_added: "தூக்க தரவு சேமிக்கப்பட்டது!",
      fill_fields_error: "தயவுசெய்து தேவையான அனைத்து புலங்களையும் நிரப்பவும்.",
      delete_confirm: "இந்தப் பதிவை நீக்க விரும்புகிறீர்களா?",
      meal_saved_success: "உணவு வெற்றிகரமாகச் சேமிக்கப்பட்டது! 🥗",
      exercise_saved_success: "உடற்பயிற்சி சேமிக்கப்பட்டது! 🏃",
      water_logged_success: "நீர் உட்கொள்ளல் புதுப்பிக்கப்பட்டது! 💧",
      sleep_logged_success: "தூக்கம் பதிவு செய்யப்பட்டது! 😴",
      amount: "அளவு",
      day_total: "தினசரி மொத்தம்",
      logged_at: "பதிவு செய்யப்பட்ட நேரம்",
      acne: "பருக்கள்",
      fatigue: "சோர்வு",
      headache: "தலைவலி",
      bloating: "வீக்கம்",
      mood_swings: "மனநிலை மாற்றங்கள்",
      anxiety: "கவலை",
      depression: "மனச்சோர்வு",
      stress: "மன அழுத்தம்",
      irregular_period: "சீரற்ற மாதவிடாய்",
      heavy_bleeding: "அதிக இரத்தப்போக்கு",
      light_bleeding: "குறைந்த இரத்தப்போக்கு",
      pelvic_pain: "இடுப்பு வலி",
      weight_change: "எடை மாற்றம்",
      joint_pain: "மூட்டு வலி",
      hair_loss: "முடி உதிர்தல்",
      hair_growth: "அதிக முடி வளர்ச்சி",
      excess_hair_growth: "அதிக முடி வளர்ச்சி",
      dark_patches: "கருப்பு திட்டுகள்",
      skin_darkening: "சருமம் கருமையாதல்",
      cramps: "தசைப்பிடிப்பு",
      mild: "குறைந்த",
      moderate: "மிதமான",
      severe: "தீவிரமான",
      protein: "🥩 புரதம்",
      vegetables: "🥦 காய்கறிகள்",
      fruits: "🍓 பழங்கள்",
      grains: "🌾 தானியங்கள்",
      dairy: "🥛 பால் பொருட்கள்",
      fats: "🥑 ஆரோக்கியமான கொழுப்புகள்",
      medical_documents_title: "எனது மருத்துவ ஆவணங்கள்",
      upload_report: "அறிக்கையைப் பதிவேற்றவும்",
      upload_document_title: "📤 ஆவணத்தைப் பதிவேற்றவும்",
      report_name_label: "அறிக்கையின் பெயர் *",
      report_name_placeholder: "எ.கா. தைராய்டு சுயவிவரம், இடுப்பு ஸ்கேன்",
      report_type_label: "அறிக்கை வகை / பரிசோதனை *",
      hospital_clinic_label: "மருத்துவமனை / கிளினிக்",
      hospital_name_placeholder: "எ.கா. அப்பல்லோ மருத்துவமனை",
      doctor_requested_label: "கோரிய மருத்துவர்",
      doctor_name_placeholder: "எ.கா. டாக்டர் சில்வா",
      attach_report_label: "அறிக்கையை இணைக்கவும் (PDF/Img)",
      save_medical_record: "மருத்துவப் பதிவைச் சேமிக்கவும்",
      total_files: "மொத்த கோப்புகள்",
      added_this_month: "இந்த மாதம் சேர்க்கப்பட்டது",
      added_this_year: "இந்த ஆண்டு சேர்க்கப்பட்டது",
      search_reports_placeholder: "பெயர் அல்லது வசதி மூலம் தேடுங்கள்...",
      filter_by_type: "வகை மூலம் வடிகட்டவும்...",
      all_documents: "அனைத்து ஆவணங்கள்",
      all_lab_results: "அனைத்து ஆய்வக முடிவுகள்",
      all_scans: "அனைத்து ஸ்கேன்கள்",
      'LH (Luteinizing Hormone) Test': "LH (லூடினைசிங் ஹார்மோன்) பரிசோதனை",
      'FSH (Follicle Stimulating Hormone) Test': "FSH (ஃபோலிகல் தூண்டும் ஹார்மோன்) பரிசோதனை",
      'Testosterone Level Test': "டெஸ்டோஸ்டிரோன் அளவு பரிசோதனை",
      'Prolactin Test': "புரோலாக்டின் பரிசோதனை",
      'Thyroid Function Test (TSH, T3, T4)': "தைராய்டு செயல்பாடு பரிசோதனை (TSH, T3, T4)",
      'Pelvic Ultrasound Scan': "இடுப்பு அல்ட்ராசவுண்ட் ஸ்கேன்",
      'Fasting Blood Sugar (FBS)': "வெறும் வயிற்று இரத்த சர்க்கரை (FBS)",
      'Oral Glucose Tolerance Test (OGTT)': "வாய்வழி குளுக்கோஸ் சகிப்புத்தன்மை பரிசோதனை (OGTT)",
      'HbA1c Test': "HbA1c பரிசோதனை",
      'Lipid Profile (Cholesterol Test)': "லிப்பிட் சுயவிவரம் (கொலஸ்ட்ரால் பரிசோதனை)",
      prescription: "மருந்துச் சீட்டு",
      report_uploaded_activity: "புதிய மருத்துவ அறிக்கை பதிவேற்றப்பட்டது: {name}",
      cycle_logged_activity: "மாதவிடாய் சுழற்சி பதிவு செய்யப்பட்டது — {length} நாள் சுழற்சி, {flow} போக்கு",
      meal_logged_activity: "{type} பதிவு செய்யப்பட்டது: {name}",
      exercise_logged_activity: "உடற்பயிற்சி பதிவு செய்யப்பட்டது: {name} ({duration} நிமிடங்கள்)",
      water_logged_activity: "நீர் உட்கொள்ளல் புதுப்பிக்கப்பட்டது: இன்று மொத்தம் {total}மி.லி",
      sleep_logged_activity: "தூக்கம் பதிவு செய்யப்பட்டது: {duration} மணிகள் ({quality})",
      appointment_activity: "வரவிருக்கும் சந்திப்பு: {hospital} இல் {reason}",
      appointment_today: "இன்று சந்திப்பு: {hospital} இல் {reason}",
      appointment_missed: "சந்திப்பு தவறவிடப்பட்டது: {hospital} இல் {reason}",
      hospital_registered_activity: "மருத்துவமனையில் பதிவு செய்யப்பட்டுள்ளது: {name}",
      recorded: "பதிவு செய்யப்பட்டது",
      today: "இன்று",
      meal_history: "📋 உணவு வரலாறு",
      exercise_history: "📋 உடற்பயிற்சி வரலாறு",
      sleep_history: "📋 தூக்க வரலாறு",
      water_history: "💧 நீர் பதிவு வரலாறு",
      save_meal: "💾 உணவைச் சேமிக்கவும்",
      save_exercise: "💾 உடற்பயிற்சியைச் சேமிக்கவும்",
      save_sleep: "💾 தூக்கத்தைச் சேமிக்கவும்",
      meal_saved_success: "உணவு வெற்றிகரமாகச் சேமிக்கப்பட்டது! 🥗",
      exercise_saved_success: "உடற்பயிற்சி சேமிக்கப்பட்டது! 🏃",
      water_logged_success: "நீர் உட்கொள்ளல் புதுப்பிக்கப்பட்டது! 💧",
      sleep_logged_success: "தூக்கம் பதிவு செய்யப்பட்டது! 😴",
      my_hospital_title: "எனது மருத்துவமனை",
      manage_healthcare: "உங்கள் சுகாதார சேவை வழங்குநர்களை நிர்வகிக்கவும்",
      hospital_hero_title: "சிறந்த சுகாதார சேவையைக் கண்டறியவும் 🏥",
      register_new_hospital: "புதிய மருத்துவமனையைப் பதிவு செய்யவும்",
      manage_visits: "உங்கள் மருத்துவ சந்திப்புகளை நிர்வகிக்கவும்",
      health_schedule_title: "உங்கள் சுகாதார அட்டவணை 📅",
      health_schedule_subtitle: "உங்கள் மருத்துவ வருகைகளைக் கண்காணியுங்கள். பயனுள்ள பி.சி.ஓ.எஸ் மேலாண்மைக்கு முறையான பரிசோதனைகள் முக்கியம்.",
      upcoming: "வரவிருப்பவை",
      total_visits: "மொத்த சந்திப்புகள்",
      book_appointment: "➕ சந்திப்பை முன்பதிவு செய்",
      all_appointments: "அனைத்து சந்திப்புகள்",
      history: "வரலாறு",
      no_appts_found: "சந்திப்புகள் எதுவும் இல்லை",
      no_appts_msg: "நீங்கள் இன்னும் எந்த மருத்துவ சந்திப்புகளையும் திட்டமிடவில்லை. உங்கள் முதல் சந்திப்பை முன்பதிவு செய்ய வலது பக்கத்தில் உள்ள படிவத்தைப் பயன்படுத்தவும்!",
      schedule_new: "புதிய சந்திப்பு",
      search_appts: "மருத்துவமனை/மருத்துவர் மூலம் தேடவும்...",
      hospital_name: "மருத்துவமனையின் பெயர்",
      enter_hospital: "மருத்துவமனை/கிளினிக் பெயரை உள்ளிடவும்",
      doctor_name: "மருத்துவரின் பெயர்",
      dr_name_optional: "மருத்துவர் பெயர் (விருப்பத்திற்குரியது)",
      visit_type: "சந்திப்பு வகை",
      consultation: "ஆலோசனை",
      'pcos-check-up': "PCOS பரிசோதனை",
      'follow-up': "தொடர் சிகிச்சை",
      'lab-test': "ஆய்வகம்/ஸ்கேன்",
      reason_notes: "காரணம் / குறிப்புகள்",
      visit_reason_placeholder: "இந்த வருகையின் நோக்கம் என்ன?",
      save_appointment: "சந்திப்பைச் சேமிக்கவும்",
      reschedule_visit: "சந்திப்பை மறுஅட்டவணைப்படுத்தவும் 🕓",
      reschedule_msg: "உங்கள் ஆலோசனைக்கு ஒரு புதிய தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்.",
      new_date: "புதிய தேதி",
      new_time: "புதிய நேரம்",
      update_schedule: "அட்டவணையைப் புதுப்பிக்கவும்",
      medical_officer: "மருத்துவ அதிகாரி",
      cancel_visit: "இரத்து செய்",
      reschedule: "மறுஅட்டவணை",
      received_only: "பெறப்பட்டவை மட்டும்",
      pending_only: "பெண்டிங் மட்டும்",
      track_symptoms_title: "அறிகுறிகளைக் கண்காணிக்கவும்",
      log_your_symptoms: "உங்கள் அறிகுறிகளைப் பதிவு செய்யுங்கள்",
      overall_severity: "ஒட்டுமொத்த தீவிரம்",
      additional_notes: "கூடுதல் குறிப்புகள்",
      save_symptoms: "அறிகுறிகளைச் சேமிக்கவும்",
      your_symptom_history: "உங்கள் அறிகுறி வரலாறு",
      no_records_found: "பதிவுகள் எதுவும் இல்லை",
      no_records_msg: "இந்த பிரிவில் நீங்கள் இன்னும் அறிக்கைகளைப் பதிவேற்றவில்லை.",
      'FBC (Full Blood Count / CBC)': "FBC (முழு இரத்த எண்ணிக்கை / CBC)",
      'Vitamin D Test': "வைட்டமின் டி பரிசோதனை",
      'Vitamin B12 Test': "வைட்டமின் பி12 பரிசோதனை",
      'Ferritin (Iron Stores Test)': "பெரிட்டின் (இரும்புச் சேமிப்பு பரிசோதனை)",
      'Serum Insulin Test': "சீரம் இன்சுலின் பரிசோதனை",
      'DHEA-S Test (Dehydroepiandrosterone Sulfate)': "DHEA-S பரிசோதனை",
      'Cortisol Test': "கார்டிசோல் பரிசோதனை",
      'Liver Function Test (LFT)': "கல்லீரல் செயல்பாடு பரிசோதனை (LFT)",
      'Kidney Function Test (KFT)': "சிறுநீரக செயல்பாடு பரிசோதனை (KFT)",
      'Sex Hormone Binding Globulin (SHBG) Test': "SHBG பரிசோதனை",
      general_view: "பொதுக் காட்சி",
      specific_lab_tests: "குறிப்பிட்ட ஆய்வகப் பரிசோதனைகள்",
      scans: "ஸ்கேன்கள்",
      other: "மற்றவை",
      accessing_vault: "மருத்துவ பெட்டகத்தை அணுகுகிறது...",
      upload_first_file: "📤 உங்கள் முதல் கோப்பைப் பதிவேற்றவும்",
      permanently_remove: "நிரந்தரமாக நீக்கவா?",
      are_you_sure_remove: "இந்த மருத்துவப் பதிவை நீக்க விரும்புகிறீர்களா?",
      ok_remove: "சரி, நீக்கு",
      no_back: "இல்லை, பின்னால்",
      syncing: "ஒத்திசைக்கிறது...",
      save_medical_record_success: "மருத்துவப் பதிவு வெற்றிகரமாகச் சேமிக்கப்பட்டது!",
      record_removed_success: "பதிவு வெற்றிகரமாக நீக்கப்பட்டது.",
      error_occurred: "பிழை ஏற்பட்டது.",
      uploaded: "பதிவேற்றப்பட்டது",
      pending: "நிலுவையில் உள்ளது",
      reviewed: "மதிப்பாய்வு செய்யப்பட்டது",
      at: "நேரத்தில்",
      completed: "முடிக்கப்பட்டது",
      cancelled: "இரத்து செய்யப்பட்டது",
      rescheduled: "மறுஅட்டவணைப்படுத்தப்பட்டது",
      lab_results_title: "ஆய்வக முடிவுகள்",
      total_results: "மொத்த முடிவுகள்",
      upload_lab_result_title: "📤 ஆய்வக முடிவைப் பதிவேற்றவும்",
      added_this_month: "இந்த மாதம் சேர்க்கப்பட்டது",
      added_this_year: "இந்த ஆண்டு சேர்க்கப்பட்டது",
      all_lab_results: "அனைத்து ஆய்வக முடிவுகள்",
      search_lab_placeholder: "பரிசோதனை, ஆய்வகம் அல்லது வகை மூலம் தேடவும்...",
      test_category_label: "பரிசோதனை வகை",
      hospital_clinic_label: "மருத்துவமனை / கிளினிக்",
      doctor_requested_label: "மருத்துவர் கோரியது",
      test_date_label: "பரிசோதனை தேதி *",
      attach_file_label: "PDF அல்லது படத்தை இணைக்கவும்",
      save_medical_result: "மருத்துவ முடிவைச் சேமிக்கவும்",
      remove_result_title: "முடிவை நீக்கவா?",
      remove_result_msg: "இந்த நோய் கண்டறிதல் முடிவை நீக்க விரும்புகிறீர்களா?",
      removed_from_both: "இரண்டிலிருந்தும் நீக்கப்பட்டது",
      upload_first_result: "📤 முதல் முடிவைப் பதிவேற்றவும்",
      loading_medical_records: "உங்கள் மருத்துவ பதிவுகளை மீட்டெடுக்கிறது...",
      no_lab_results_found: "ஆய்வக முடிவுகள் எதுவும் இல்லை",
      no_lab_results_msg: "பதிவேற்றப்பட்டவுடன் அல்லது ஆய்வகங்களிலிருந்து பெறப்பட்டவுடன் உங்கள் நோய் கண்டறிதல் பதிவுகள் இங்கே தோன்றும்.",
      test_name_label: "பரிசோதனை பெயர் *",
      received: "பெறப்பட்டது",
      processing: "செயலாக்கப்படுகிறது",
      sync_complete_msg: "ஒத்திசைவு முடிந்தது! முடிவு ஆய்வக முடிவுகள் மற்றும் எனது அறிக்கைகளில் சேர்க்கப்பட்டது.",
      error_comm: "தொடர்பு பிழை.",
      removing_msg: "நீக்குகிறது...",
      unknown_date: "அறியப்படாத தேதி",
      general: "பொது",
      not_specified: "குறிப்பிடப்படவில்லை",
      test_name_placeholder: "உதாரணமாக: இரத்த எண்ணிக்கை, HbA1c",
      hospital_name_placeholder: "உதாரணமாக: அசிரி ஹெல்த்",
      doctor_name_placeholder: "உதாரணமாக: டாக்டர் பெரேரா",
      click_to_select: "கோப்பைத் தேர்ந்தெடுக்க கிளிக் செய்யவும்",
      upload_size_limit: "அதிகபட்ச அளவு 10MB (PDF, JPG, PNG)",
      hospital_hero_desc: "உங்கள் அனைத்து மருத்துவப் பராமரிப்பையும் ஒரே இடத்தில் வைத்திருப்பதற்காக உங்கள் முதன்மை மருத்துவமனை மற்றும் சிறப்பு கிளினிக்கில் பதிவு செய்யவும்.",
      fetching_hospitals: "உங்கள் பதிவுசெய்யப்பட்ட மருத்துவமனைகளைக் கண்டறிகிறது...",
      register_new_title: "📝 புதிதாகப் பதிவு செய்",
      primary_provider_badge: "முதன்மை வழங்குநர்",
      make_primary: "முதன்மை ஆக்கவும்",
      hospital_removed: "மருத்துவமனை நீக்கப்பட்டது",
      primary_provider_updated: "முதன்மை வழங்குநர் புதுப்பிக்கப்பட்டார்!",
      failed_load_hospitals: "பதிவுசெய்யப்பட்ட மருத்துவமனைகளை ஏற்றுவதில் தோல்வி.",
      no_hospitals_registered: "மருத்துவமனைகள் இன்னும் பதிவு செய்யப்படவில்லை. உங்கள் முதல் கிளினிக்கை வலது பக்கத்தில் பதிவு செய்யவும்!",
      hospital_name_label: "மருத்துவமனை பெயர் *",
      specialist_doctor_label: "சிறப்பு மருத்துவர்",
      address_label: "முகவரி",
      contact_number_label: "தொடர்பு எண் *",
      email_label: "மின்னஞ்சல்",
      set_primary_label: "முதன்மை மருத்துவமனையாக அமைக்கவும்",
      register_hospital_btn: "🏥 மருத்துவமனையைப் பதிவு செய்யவும்",
      doctor_placeholder: "டாக்டர் ஜேன் ஸ்மித்",
      address_placeholder: "தெரு, நகரம்...",
      contact_placeholder: "10 இலக்கங்கள் (உதாரணமாக: 0771234567)",
      email_placeholder: "info@hosp.com",
      special_care: "சிறப்பு சிகிச்சை",
      contact_10_digits_error: "தொடர்பு எண் சரியாக 10 இலக்கங்களைக் கொண்டிருக்க வேண்டும்.",
      clinic: "கிளினிக்"
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
    const dict = this.translations[lang] || this.translations.en;
    
    // 1. Localize text content/placeholders
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = dict[key];
        } else {
          // If the element contains an <i> tag or emoji-span, preserve it
          const icon = el.querySelector('i, .icon, .emoji');
          if (icon) {
            const iconHtml = icon.outerHTML;
            el.innerHTML = iconHtml + dict[key];
          } else {
            const originalText = el.innerText;
            const emojiMatch = originalText.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u);
            if (emojiMatch) {
              // Important: If it's a small circular button, we might NOT want the text.
              // But for general use, we append.
              el.innerText = emojiMatch[0] + dict[key];
            } else {
              el.innerText = dict[key];
            }
          }
        }
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

