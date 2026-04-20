// ============================================================
// PCOS CARE HUB â€” Shared Utilities (utils.js)
// ============================================================

'use strict';

// â”€â”€ Toast Notifications â”€â”€
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
    const icons = { success: 'âœ“', error: 'âœ•', warning: 'âš ', info: 'â„¹' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="margin-right:8px">${icons[type] || 'â„¹'}</span>${message}`;
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

// â”€â”€ Page Loader â”€â”€
const PageLoader = {
  hide() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }
};

// â”€â”€ Theme Management â”€â”€
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
    return current === 'dark' ? 'â˜€ï¸' : 'ðŸŒ™';
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

// â”€â”€ Primary Color Management â”€â”€
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

// â”€â”€ Font Size Management â”€â”€
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

// â”€â”€ Localization (L10n) Management â”€â”€
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
      no_cycle: "No cycle logged yet â€”",
      no_reports: "No reports yet â€”",
      no_visits: "No upcoming visits",
      start_tracking: "start tracking â†’",
      upload_one: "upload one â†’",
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
      save_cycle_data_success: "âœ“ Cycle data saved successfully!",
      no_cycle_logged: "No cycle logged yet â€” click Menstrual Cycle to start.",
      regular_cycle: "Regular cycle",
      irregular_cycle: "Irregular cycle",
      log_first_cycle: "Log first cycle",
      cycle_logged_activity: "Menstrual cycle logged â€” {length}-day cycle, {flow} flow",
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
      save_medical_record_success: "âœ“ Medical record saved successfully!",
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
      meals_today: "ðŸ¥— Meals Today",
      log_meal_title: "âž• Log a Meal",
      meal_type_label: "Meal Type *",
      meal_type_placeholder: "Select meal type...",
      breakfast: "ðŸŒ… Breakfast",
      lunch: "â˜€ï¸ Lunch",
      dinner: "ðŸŒ™ Dinner",
      snack: "ðŸŽ Snack",
      meal_name_label: "What did you eat? *",
      meal_name_placeholder: "e.g., Grilled chicken with quinoa salad",
      food_categories: "Food Categories",
      protein: "ðŸ¥© Protein",
      vegetables: "ðŸ¥¦ Vegetables",
      fruits: "ðŸ“ Fruits",
      grains: "ðŸŒ¾ Whole Grains",
      dairy: "ðŸ¥› Dairy",
      fats: "ðŸ¥‘ Healthy Fats",
      calories_label: "Calories (optional)",
      calories_placeholder: "e.g., 450",
      notes_label: "Notes",
      meal_notes_placeholder: "How did you feel after this meal? Any symptoms?",
      save_meal: "ðŸ’¾ Save Meal",
      meal_history: "ðŸ“‹ Meal History",
      no_meals_msg: "No meals logged yet",
      log_exercise_title: "âž• Log an Exercise",
      exercise_type_label: "Exercise Type *",
      exercise_type_placeholder: "Select type...",
      cardio: "ðŸƒ Cardio (Running, Cycling...)",
      strength: "ðŸ’ª Strength Training",
      yoga: "ðŸ§˜ Yoga",
      walking: "ðŸš¶ Walking",
      swimming: "ðŸŠ Swimming",
      stretching: "ðŸ¤¸ Stretching",
      exercise_name_label: "Exercise Name *",
      exercise_name_placeholder: "e.g., Morning jog in the park",
      duration_label: "Duration (min) *",
      intensity_label: "Intensity",
      light: "ðŸŸ¢ Light",
      moderate: "ðŸŸ¡ Moderate",
      vigorous: "ðŸ”´ Vigorous",
      calories_burned_label: "Calories Burned (estimated)",
      feel_notes_placeholder: "Energy level, any pain or discomfort...",
      save_exercise: "ðŸ’¾ Save Exercise",
      exercise_history: "ðŸ“‹ Exercise History",
      no_exercises_msg: "No exercises logged yet",
      log_water_title: "ðŸ’§ Log Water Intake",
      quick_add: "Quick Add",
      small_glass: "Small glass",
      medium_glass: "Medium glass",
      large_glass: "Large glass",
      one_litre: "1 Litre",
      custom_water_label: "Or enter custom amount (ml)",
      custom_water_placeholder: "Enter amount in ml",
      today_intake_goal: "Today's intake Â· Goal: 2,500 ml",
      water_goal_reached: "of daily goal",
      water_history: "ðŸ’§ Water Log History",
      no_water_msg: "No water logged today",
      log_sleep_title: "ðŸ˜´ Log Sleep",
      sleep_date_label: "Sleep Date *",
      sleep_quality_label: "Sleep Quality",
      poor: "ðŸ˜Ÿ Poor (Very restless)",
      fair: "ðŸ˜ Fair (Some disturbances)",
      good: "ðŸ™‚ Good (Mostly restful)",
      excellent: "ðŸ˜„ Excellent (Very restful)",
      bedtime_label: "Bedtime *",
      waketime_label: "Wake Time *",
      hours_slept_label: "Hours Slept (auto-calculated)",
      sleep_duration_placeholder: "Set bedtime & wake time above",
      sleep_notes_placeholder: "Factors that affected your sleep? (caffeine, stress, environment...)",
      save_sleep: "ðŸ’¾ Save Sleep",
      sleep_history: "ðŸ“‹ Sleep History",
      no_sleep_msg: "No sleep logs yet",
      total: "total",
      pending_status: "âŸ³ Pending",
      reviewed_status: "âœ“ Reviewed",
      uploaded_status: "âœ“ Uploaded",
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
      track_lifestyle_title: "Track Your Lifestyle ðŸŒ±",
      track_lifestyle_desc: "Monitor your diet, exercise, hydration, and sleep to manage your PCOS symptoms effectively.",
      manage_visits: "Manage your clinic visits and consultations",
      health_schedule_title: "Your Health Schedule ðŸ“…",
      health_schedule_subtitle: "Keep track of your medical visits. Regular check-ups are key to effective PCOS management.",
      upcoming: "Upcoming",
      total_visits: "Total Visits",
      book_appointment: "âž• Book Appointment",
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
      save_appointment: "ðŸ’¾ Save Appointment",
      reschedule_visit: "Reschedule Visit ðŸ•“",
      reschedule_msg: "Please pick a new date and time for your consultation.",
      new_date: "New Date",
      new_time: "New Time",
      update_schedule: "Update Schedule",
      medical_officer: "Medical Officer",
      reschedule: "ðŸ•“ Reschedule",
      cancel_visit: "âœ• Cancel",
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
      upload_first_result: "ðŸ“¤ Upload First Result",
      upload_lab_result_title: "ðŸ“¤ Upload Lab Result",
      test_name_label: "Test Name *",
      test_category_label: "Test Category",
      hospital_clinic_label: "Hospital / Clinic",
      doctor_requested_label: "Doctor Requested",
      test_date_label: "Test Date *",
      attach_file_label: "Attach PDF or Image",
      click_to_select: "Click to select file",
      save_medical_result: "âœ“ Save Medical Result",
      remove_result_title: "Remove Result?",
      remove_result_msg: "Are you sure you want to remove this diagnostic result?",
      medical_documents_title: "My Medical Documents",
      upload_report: "ðŸ“¤ Upload Report",
      total_files: "Total Files",
      search_reports_placeholder: "Search by name or facility...",
      filter_by_type: "ðŸ” Filter by type...",
      accessing_vault: "Accessing medical vault...",
      no_records_found: "No records found",
      no_records_msg: "You haven't uploaded any reports in this category yet.",
      upload_first_file: "ðŸ“¤ Upload Your First File",
      upload_document_title: "ðŸ“¤ Upload Document",
      report_name_label: "Report Name *",
      report_type_label: "Report Type / Test *",
      attach_report_label: "Attach Report (PDF/Img)",
      save_medical_record: "âœ“ Save Medical Record",
      upload_document_title: "ðŸ“¤ Upload Document",
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
      hospital_registered_success: "âœ“ Hospital registered successfully!",
      primary_provider_updated: "âœ“ Primary provider updated!",
      hospital_removed: "âœ“ Hospital removed",
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
      profile_updated_success: "âœ“ Profile updated!",
      password_changed_success: "âœ“ Password changed successfully!",
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
      search_logs_placeholder: "Search logsâ€¦",
      select_type: "Select typeâ€¦",
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
      entry_deleted: "âœ“ Entry deleted",
      meal_added: "âœ“ Meal added!",
      exercise_added: "âœ“ Exercise added!",
      water_added: "âœ“ Water intake updated!",
      sleep_added: "âœ“ Sleep data saved!",
      fill_fields_error: "Please fill in all required fields.",
      delete_confirm: "Delete this entry?",
      meal_saved_success: "Meal saved successfully! ðŸ¥—",
      exercise_saved_success: "Exercise saved! ðŸƒ",
      water_logged_success: "Water intake updated! ðŸ’§",
      sleep_logged_success: "Sleep logged! ðŸ˜´",
      amount: "Amount",
      day_total: "Day Total",
      logged_at: "Logged At"
    },
    si: {
      dashboard: "à¶´à·”à·€à¶»à·”à·€",
      settings: "à·ƒà·à¶šà·ƒà·”à¶¸à·Š",
      profile: "à¶´à·à¶­à·’à¶šà¶©",
      logout: "à¶‰à·€à¶­à·Š à·€à¶±à·Šà¶±",
      notifications: "à¶¯à·à¶±à·”à¶¸à·Šà¶¯à·“à¶¸à·Š",
      messages: "à¶´à¶«à·’à·€à·’à¶©",
      symptoms: "à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶«",
      cycle: "à¶”à·ƒà¶´à·Š à¶ à¶šà·Šâ€à¶»à¶º",
      reports: "à·€à·à¶»à·Šà¶­à·",
      lifestyle: "à¶¢à·“à·€à¶± à¶»à¶§à·à·€",
      appointments: "à·„à¶¸à·”à·€à·“à¶¸à·Š",
      lab_results: "à¶´à¶»à·“à¶šà·Šà·‚à¶« à·€à·à¶»à·Šà¶­à·",
      hospital: "à¶»à·à·„à¶½",
      welcome: "à¶±à·à·€à¶­ à·ƒà·à¶¯à¶»à¶ºà·™à¶±à·Š à¶´à·’à·…à·’à¶œà¶±à·’à¶¸à·”",
      health_prefs: "à·ƒà·žà¶›à·Šâ€à¶º à¶¸à¶±à·à¶´",
      display_appearance: "à¶¯à¶»à·Šà·à¶±à¶º à·ƒà·„ à¶´à·™à¶±à·”à¶¸",
      language_region: "à¶·à·à·‚à·à·€ à·ƒà·„ à¶šà¶½à·à¶´à¶º",
      search_placeholder: "à·ƒà·œà¶ºà¶±à·Šà¶±...",
      last_cycle: "à¶…à·€à·ƒà·à¶± à¶ à¶šà·Šâ€à¶»à¶º",
      next_period: "à¶¸à·“à·…à¶Ÿ à¶”à·ƒà¶´à·Š à·€à·“à¶¸",
      lifestyle_score: "à¶¢à·“à·€à¶± à¶»à¶§à· à¶½à¶šà·”à¶«à·”",
      hydration: "à¶¢à¶½ à¶´à¶»à·’à¶·à·à¶¢à¶±à¶º",
      weight: "à¶¶à¶»",
      mood: "à¶¸à¶±à·à¶·à·à·€à¶º",
      sleep: "à¶±à·’à¶±à·Šà¶¯",
      todays_insights: "à¶…à¶¯ à¶¯à·’à¶± à¶­à·œà¶»à¶­à·”à¶»à·”",
      upcoming_events: "à¶‰à¶¯à·’à¶»à·’ à·ƒà·’à¶¯à·”à·€à·“à¶¸à·Š",
      quick_actions: "à¶šà¶©à·’à¶±à¶¸à·Š à¶šà·Šâ€à¶»à·’à¶ºà·",
      track_pill: "à¶–à·‚à¶° à·ƒà¶§à·„à¶±à·Š",
      log_water: "à¶¢à¶½à¶º à·ƒà¶§à·„à¶±à·Š",
      add_symptom: "à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶‘à¶šà·Š à¶šà¶»à¶±à·Šà¶±",
      daily_goal: "à¶¯à·›à¶±à·’à¶š à¶‰à¶½à¶šà·Šà¶šà¶º",
      average: "à·ƒà·à¶¸à·à¶±à·Šâ€à¶ºà¶º",
      view_all: "à·ƒà·’à¶ºà¶½à·Šà¶½ à¶¶à¶½à¶±à·Šà¶±",
      cycle_length: "à¶ à¶šà·Šâ€à¶»à¶ºà·š à¶¯à·’à¶œ (à¶¯à·’à¶±)",
      symptoms_logged: "à·ƒà¶§à·„à¶±à·Š à¶šà·… à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶«",
      reports_total: "à·€à·à¶»à·Šà¶­à· à¶‘à¶šà¶­à·”à·€",
      appt_days: "à·„à¶¸à·”à·€à·“à¶¸à¶§ à¶¯à·’à¶± à¶œà¶«à¶±",
      recent_symptoms: "à¶¸à·‘à¶­ à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶«",
      recent_activity: "à¶¸à·‘à¶­ à¶šà·Šâ€à¶»à·’à¶ºà·à¶šà·à¶»à¶šà¶¸à·Š",
      health_progress: "à·ƒà·žà¶›à·Šâ€à¶º à¶´à·Šâ€à¶»à¶œà¶­à·’à¶º",
      welcome_subtitle: "à¶¸à·™à¶¸ à·ƒà¶­à·’à¶ºà·š à¶”à¶¶à¶œà·š PCOS à¶šà·…à¶¸à¶±à·à¶šà¶»à¶«à¶º à¶´à·’à·…à·’à¶¶à¶³ à·ƒà·à¶»à·à¶‚à·à¶ºà¶šà·Š à¶¸à·™à¶±à·Šà¶±. à¶¯à·’à¶œà¶§à¶¸ à¶šà¶»à¶œà·™à¶± à¶ºà¶±à·Šà¶±!",
      legend_period: "à¶”à·ƒà¶´à·Š à·€à·“à¶¸",
      legend_fertile: "à¶´à¶½à¶¯à·à¶ºà·“ à¶šà·à¶½à¶º",
      legend_ovulation: "à¶…à¶«à·Šà¶© à¶¸à·à¶ à¶±à¶º",
      legend_today: "à¶…à¶¯ à¶¯à·’à¶±",
      loading: "à¶´à·–à¶»à¶«à¶º à·€à·™à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...",
      cycle_label: "à¶ à¶šà·Šâ€à¶»à¶º",
      flow: "à·à·Šâ€à¶»à·à·€à¶º",
      no_cycle: "à¶­à·€à¶¸à¶­à·Š à¶¯à¶­à·Šà¶­ à¶‡à¶­à·”à·…à¶­à·Š à¶šà¶» à¶±à·à¶­ â€”",
      no_reports: "à·€à·à¶»à·Šà¶­à· à¶¸à·™à¶­à·™à¶šà·Š à¶±à·à¶­ â€”",
      no_visits: "à¶‰à¶¯à·’à¶»à·’ à·„à¶¸à·”à·€à·“à¶¸à·Š à¶±à·œà¶¸à·à¶­",
      start_tracking: "à¶½à·”à·„à·”à¶¶à·à¶³à·“à¶¸ à¶†à¶»à¶¸à·Šà¶· à¶šà¶»à¶±à·Šà¶± â†’",
      upload_one: "à¶‘à¶šà·Š à¶šà¶»à¶±à·Šà¶± â†’",
      meals_today: "à¶…à¶¯ à¶¯à·’à¶± à¶†à·„à·à¶»",
      water_ml: "à¶¢à¶½à¶º (à¶¸à·’.à¶½à·“.)",
      exercises: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸",
      sleep_hrs: "à¶±à·’à¶±à·Šà¶¯ (à¶´à·à¶º)",
      water_goal: "à¶¢à¶½ à¶‰à¶½à¶šà·Šà¶šà¶º",
      patient_portal: "à¶»à·à¶œà·“ à¶¯à·Šà·€à·à¶»à¶º",
      upload_new_report: "à¶±à·€ à·€à·à¶»à·Šà¶­à·à·€à¶šà·Š à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶±à·Šà¶±",
      log_activities: "à¶…à¶¯ à¶¯à·’à¶± à¶šà·Šâ€à¶»à·’à¶ºà·à¶šà·à¶»à¶šà¶¸à·Š à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      log_meal: "à¶†à·„à·à¶» à·ƒà¶§à·„à¶±à·Š",
      log_exercise: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à·ƒà¶§à·„à¶±à·Š",
      log_sleep: "à¶±à·’à¶±à·Šà¶¯ à·ƒà¶§à·„à¶±à·Š",
      patient_dashboard: "à¶»à·à¶œà·“ à¶´à·”à·€à¶»à·”à·€",
      track_symptoms_title: "à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶½à·”à·„à·”à¶¶à·à¶³à·“à¶¸",
      log_your_symptoms: "à¶”à¶¶à·š à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      search_symptoms: "à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à·ƒà·œà¶ºà¶±à·Šà¶±...",
      date: "à¶¯à·’à¶±à¶º",
      time: "à·€à·šà¶½à·à·€",
      physical_symptoms: "à¶šà·à¶ºà·’à¶š à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶«",
      cramps: "à¶¸à·ƒà·Šà¶´à·’à¶¬à·” à¶´à·™à¶»à·…à·“à¶¸",
      fatigue: "à¶­à·™à·„à·™à¶§à·Šà¶§à·”à·€",
      headache: "à·„à·’à·ƒà¶»à¶¯à¶º",
      bloating: "à¶¶à¶© à¶´à·’à¶´à·“à¶¸",
      skin_hair: "à·ƒà¶¸ à·ƒà·„ à·„à·’à·ƒà¶šà·™à·ƒà·Š",
      acne: "à¶šà·”à¶»à·”à¶½à·‘",
      hair_loss: "à·„à·’à·ƒà¶šà·™à·ƒà·Š à¶œà·à¶½à·€à·“ à¶ºà·à¶¸",
      excess_hair_growth: "à¶…à¶°à·’à¶š à¶»à·à¶¸ à·€à¶»à·Šà¶°à¶±à¶º",
      dark_patches: "à¶…à¶³à·”à¶»à·” à¶½à¶´",
      emotional_mental: "à¶ à·’à¶­à·Šà¶­à·€à·šà¶œà·“à¶º à·ƒà·„ à¶¸à·à¶±à·ƒà·’à¶š",
      mood_swings: "à¶¸à¶±à·à¶·à·à·€à¶º à·€à·™à¶±à·ƒà·Š à·€à·“à¶¸",
      anxiety: "à¶šà·à¶‚à·ƒà·à·€",
      depression: "à·€à·’à·‚à·à¶¯à¶º",
      stress: "à¶†à¶­à¶­à·’à¶º",
      reproductive: "à¶´à·Šâ€à¶»à¶¢à¶±à¶š",
      irregular_period: "à¶…à¶šà·Šâ€à¶»à¶¸à·€à¶­à·Š à¶”à·ƒà¶´à·Š à·€à·“à¶¸",
      heavy_bleeding: "à¶…à¶°à·’à¶š à¶»à·”à¶°à·’à¶» à·€à·„à¶±à¶º",
      light_bleeding: "à¶…à¶©à·” à¶»à·”à¶°à·’à¶» à·€à·„à¶±à¶º",
      pelvic_pain: "à·à·Šâ€à¶»à·à¶«à·’ à·€à·šà¶¯à¶±à·à·€",
      overall_severity: "à·ƒà¶¸à·ƒà·Šà¶­ à¶­à·“à·€à·Šâ€à¶»à¶­à·à·€à¶º",
      mild: "à¶¸à·˜à¶¯à·”",
      moderate: "à¶¸à¶°à·Šâ€à¶ºà¶¸",
      severe: "à¶¯à¶»à·”à¶«à·”",
      additional_notes: "à¶…à¶­à·’à¶»à·šà¶š à·ƒà¶§à·„à¶±à·Š",
      notes_placeholder: "à¶”à¶¶à·š à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶´à·’à·…à·’à¶¶à¶³ à¶…à¶¸à¶­à¶» à¶­à·œà¶»à¶­à·”à¶»à·”...",
      save_symptoms: "à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      cancel: "à¶…à·€à¶½à¶‚à¶œà·” à¶šà¶»à¶±à·Šà¶±",
      symptom_history: "à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶‰à¶­à·’à·„à·à·ƒà¶º",
      no_symptoms_logged: "à¶­à·€à¶¸à¶­à·Š à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à·ƒà¶§à·„à¶±à·Š à¶šà¶» à¶±à·à¶­.",
      clear: "à¶¸à¶šà¶±à·Šà¶±",
      back: "à¶†à¶´à·ƒà·”",
      your_symptom_history: "à¶”à¶¶à·š à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶‰à¶­à·’à·„à·à·ƒà¶º",
      weight_change: "à¶¶à¶» à·€à·™à¶±à·ƒà·Š à·€à·“à¶¸",
      joint_pain: "à·ƒà¶±à·Šà¶°à·’ à·€à·šà¶¯à¶±à·à·€",
      hair_growth: "à¶…à¶°à·’à¶š à¶»à·à¶¸ à·€à¶»à·Šà¶°à¶±à¶º",
      skin_darkening: "à¶…à¶³à·”à¶»à·” à¶½à¶´",
      section_main: "à¶´à·Šâ€à¶»à¶°à·à¶±",
      section_health: "à·ƒà·žà¶›à·Šâ€à¶º",
      section_account: "à¶œà·’à¶«à·”à¶¸",
      current_phase: "à·€à¶­à·Šà¶¸à¶±à·Š à¶…à·€à¶°à·’à¶º",
      period_duration_label: "à¶”à·ƒà¶´à·Š à·€à·“à¶¸à·š à¶šà·à¶½à¶º",
      predicted: "à¶…à¶±à·”à¶¸à·à¶± à¶šà·…",
      cycle_calendar: "à¶¸à·à·ƒà·’à¶š à¶ à¶šà·Šâ€à¶» à¶¯à·’à¶± à¶¯à¶»à·Šà·à¶±à¶º",
      previous: "à¶´à·™à¶»",
      next: "à¶¸à·“à·…à¶Ÿ",
      sun: "à¶‰à¶»à·’à¶¯à·", mon: "à·ƒà¶³à·”à¶¯à·", tue: "à¶…à¶Ÿà·„à¶»à·”à¶¯à·", wed: "à¶¶à¶¯à·à¶¯à·", thu: "à¶¶à·Šâ€à¶»à·„à·ƒà·Šà¶´à¶­à·’à¶±à·Šà¶¯à·", fri: "à·ƒà·’à¶šà·”à¶»à·à¶¯à·", sat: "à·ƒà·™à¶±à·ƒà·”à¶»à·à¶¯à·",
      period_start_date: "à¶”à·ƒà¶´à·Š à·€à·“à¶¸ à¶†à¶»à¶¸à·Šà¶· à·€à¶± à¶¯à·’à¶±à¶º",
      period_end_date: "à¶”à·ƒà¶´à·Š à·€à·“à¶¸ à¶…à·€à·ƒà¶±à·Š à·€à¶± à¶¯à·’à¶±à¶º",
      flow_intensity: "à·à·Šâ€à¶»à·à·€à¶ºà·š à¶­à·“à·€à·Šâ€à¶»à¶­à·à·€à¶º",
      select_flow: "à¶­à·“à·€à·Šâ€à¶»à¶­à·à·€à¶º à¶­à·à¶»à¶±à·Šà¶±...",
      light_flow: "à¶…à¶©à·”",
      normal_flow: "à·ƒà·à¶¸à·à¶±à·Šâ€à¶º",
      heavy_flow: "à¶…à¶°à·’à¶š",
      irregularities_mood_notes: "à¶…à¶šà·Šâ€à¶»à¶¸à·’à¶šà¶­à·, à·€à·šà¶¯à¶±à· à¶¸à¶§à·Šà¶§à¶¸à·Š, à¶¸à¶±à·à¶·à·à·€à¶º à·€à·™à¶±à·ƒà·Šà·€à·“à¶¸à·Š à¶†à¶¯à·’à¶º à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±...",
      save_cycle_data: "à¶ à¶šà·Šâ€à¶» à¶¯à¶­à·Šà¶­ à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      cycle_history: "à¶ à¶šà·Šâ€à¶» à¶‰à¶­à·’à·„à·à·ƒà¶º",
      cycle_label: "à¶ à¶šà·Šâ€à¶»à¶º",
      status: "à¶­à¶­à·Šà·€à¶º",
      started_on: "à¶†à¶»à¶¸à·Šà¶· à·€à·–à¶ºà·š",
      completed: "à·ƒà¶¸à·Šà¶´à·–à¶»à·Šà¶«à¶ºà·’",
      day: "à¶¯à·’à¶±à¶º",
      days: "à¶¯à·’à¶±",
      regular: "à·ƒà·à¶¸à·à¶±à·Šâ€à¶º",
      irregular: "à¶…à¶šà·Šâ€à¶»à¶¸à·€à¶­à·Š",
      save_cycle_data_success: "âœ“ à¶ à¶šà·Šâ€à¶» à¶¯à¶­à·Šà¶­ à·ƒà·à¶»à·Šà¶®à¶šà·€ à·ƒà·”à¶»à¶šà·’à¶«à·’!",
      no_cycle_logged: "à¶­à·€à¶¸à¶­à·Š à¶”à·ƒà¶´à·Š à¶ à¶šà·Šâ€à¶»à¶ºà¶šà·Š à·ƒà¶§à·„à¶±à·Š à¶šà¶» à¶±à·à¶­ â€” à¶†à¶»à¶¸à·Šà¶· à¶šà·’à¶»à·“à¶¸à¶§ à¶¸à·™à·„à·’ à¶šà·Šà¶½à·’à¶šà·Š à¶šà¶»à¶±à·Šà¶±.",
      regular_cycle: "à·ƒà·à¶¸à·à¶±à·Šâ€à¶º à¶ à¶šà·Šâ€à¶»à¶º",
      irregular_cycle: "à¶…à¶šà·Šâ€à¶»à¶¸à·€à¶­à·Š à¶ à¶šà·Šâ€à¶»à¶º",
      log_first_cycle: "à¶´à·…à¶¸à·” à¶ à¶šà·Šâ€à¶»à¶º à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      cycle_logged_activity: "à¶”à·ƒà¶´à·Š à¶ à¶šà·Šâ€à¶»à¶º à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶± à¶½à¶¯à·“ â€” à¶¯à·’à¶± {length} à¶š à¶ à¶šà·Šâ€à¶»à¶ºà¶šà·Š, {flow} à·à·Šâ€à¶»à·à·€à¶ºà¶šà·Š",
      loading_symptoms: "à¶¸à·‘à¶­ à¶šà·à¶½à·“à¶± à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶´à·–à¶»à¶«à¶º à·€à·™à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...",
      loading_cycle: "à¶ à¶šà·Šâ€à¶»à¶ºà·š à¶šà·Šâ€à¶»à·’à¶ºà·à¶šà·à¶»à·’à¶­à·Šà·€à¶º à¶´à·–à¶»à¶«à¶º à·€à·™à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...",
      exercise_goals: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à¶‰à¶½à¶šà·Šà¶š",
      diet_compliance: "à¶†à·„à·à¶» à¶…à¶±à·”à¶šà·–à¶½à¶­à·à·€à¶º",
      water_intake: "à¶¢à¶½à¶º à¶´à·à¶±à¶º à¶šà·’à¶»à·“à¶¸",
      daily_goal: "à¶¯à·›à¶±à·’à¶š à¶‰à¶½à¶šà·Šà¶šà¶º",
      glasses_logged: "à·ƒà¶§à·„à¶±à·Š à¶šà·… à·€à·“à¶¯à·”à¶»à·” à¶œà¶«à¶±",
      blood_test_activity: "à·ƒà·’à¶§à·’ à¶»à·à·„à¶½ à¶¸à¶œà·’à¶±à·Š à¶»à·”à¶°à·’à¶» à¶´à¶»à·“à¶šà·Šà·‚à¶« à·€à·à¶»à·Šà¶­à· à¶‘à¶šà·Š à¶šà¶»à¶± à¶½à¶¯à·“",
      medical_documents: "à¶¸à¶œà·š à·€à·›à¶¯à·Šâ€à¶º à·€à·à¶»à·Šà¶­à·",
      upload_report: "à·€à·à¶»à·Šà¶­à·à·€ à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶±à·Šà¶±",
      filter_by_type: "ðŸ” à·€à¶»à·Šà¶œà¶º à¶…à¶±à·”à·€ à¶´à·™à¶»à¶±à·Šà¶±...",
      total_files: "à¶¸à·”à·…à·” à¶œà·œà¶±à·” à·ƒà¶‚à¶›à·Šâ€à¶ºà·à·€",
      added_this_month: "à¶¸à·š à¶¸à·à·ƒà¶ºà·š à¶‘à¶šà·Š à¶šà¶»à¶± à¶½à¶¯à·“",
      added_this_year: "à¶¸à·š à·€à·ƒà¶»à·š à¶‘à¶šà·Š à¶šà¶»à¶± à¶½à¶¯à·“",
      search_reports_placeholder: "à¶±à¶¸ à·„à· à¶†à¶ºà¶­à¶±à¶º à¶…à¶±à·”à·€ à·ƒà·œà¶ºà¶±à·Šà¶±...",
      all_documents: "à·ƒà·’à¶ºà¶½à·”à¶¸ à¶½à·šà¶›à¶±",
      all_lab_results: "à·ƒà·’à¶ºà¶½à·”à¶¸ à¶»à·ƒà·à¶ºà¶±à·à¶œà·à¶» à¶´à·Šâ€à¶»à¶­à·’à¶µà¶½",
      all_scans: "à·ƒà·’à¶ºà¶½à·”à¶¸ à·ƒà·Šà¶šà·‘à¶±à·Š à¶´à¶»à·“à¶šà·Šà·‚à¶«",
      loading_vault: "à·€à·›à¶¯à·Šâ€à¶º à·€à·à¶»à·Šà¶­à· à·€à·™à¶­ à¶´à·Šâ€à¶»à·€à·šà· à·€à·™à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...",
      no_records_found: "à·€à·à¶»à·Šà¶­à· à¶šà·’à·ƒà·’à·€à¶šà·Š à·„à¶¸à·” à¶±à·œà·€à·“à¶º",
      no_records_msg: "à¶”à¶¶ à¶­à·€à¶¸à¶­à·Š à¶¸à·™à¶¸ à¶´à·Šâ€à¶»à·€à¶»à·Šà¶œà¶º à¶ºà¶§à¶­à·š à¶šà·’à·ƒà·’à¶¯à·” à·€à·à¶»à·Šà¶­à·à·€à¶šà·Š à¶‘à¶šà·Š à¶šà¶» à¶±à·œà¶¸à·à¶­.",
      upload_first_file: "à¶”à¶¶à·š à¶´à·…à¶¸à·” à¶œà·œà¶±à·”à·€ à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶±à·Šà¶±",
      save_medical_record: "à·€à·›à¶¯à·Šâ€à¶º à·€à·à¶»à·Šà¶­à·à·€ à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      report_name_label: "à·€à·à¶»à·Šà¶­à·à·€à·š à¶±à¶¸",
      report_type_label: "à·€à·à¶»à·Šà¶­à· à·€à¶»à·Šà¶œà¶º / à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º",
      hospital_clinic_label: "à¶»à·à·„à¶½ / à·ƒà·à¶ºà¶±à¶º",
      doctor_requested_label: "à¶‰à¶½à·Šà¶½à·“à¶¸à·Š à¶šà·… à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà·",
      attach_report_label: "à·€à·à¶»à·Šà¶­à·à·€ à¶…à¶¸à·”à¶«à¶±à·Šà¶± (PDF/Img)",
      permanently_remove: "à·ƒà·Šà¶®à·’à¶»à·€à¶¸ à¶‰à·€à¶­à·Š à¶šà¶»à¶±à·Šà¶±à¶¯?",
      are_you_sure_remove: "à¶”à¶¶à¶§ à¶¸à·™à¶¸ à·€à·à¶»à·Šà¶­à·à·€ à¶‰à·€à¶­à·Š à¶šà·’à¶»à·“à¶¸à¶§ à¶…à·€à·à·Šâ€à¶º à¶¶à·€ à·€à·’à·à·Šà·€à·à·ƒà¶¯?",
      ok_remove: "à¶”à·€à·Š, à¶‰à·€à¶­à·Š à¶šà¶»à¶±à·Šà¶±",
      no_back: "à¶±à·à¶­, à¶´à·ƒà·”à¶´à·ƒà¶§",
      view: "à¶¶à¶½à¶±à·Šà¶±",
      download: "à¶¶à·à¶œà¶±à·Šà¶±",
      remove: "à¶‰à·€à¶­à·Š à¶šà¶»à¶±à·Šà¶±",
      report_uploaded_activity: "à¶±à·€ à·€à·›à¶¯à·Šâ€à¶º à·€à·à¶»à·Šà¶­à·à·€à¶šà·Š à¶‘à¶šà·Š à¶šà¶»à¶± à¶½à¶¯à·“: {name}",
      meal_logged_activity: "{type} à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶± à¶½à¶¯à·“: {name}",
      exercise_logged_activity: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶± à¶½à¶¯à·“: {name} (à·€à·’à¶±à·à¶©à·’ {duration})",
      water_logged_activity: "à¶¢à¶½à¶º à¶´à·à¶±à¶º à¶šà·’à¶»à·“à¶¸ à¶ºà·à·€à¶­à·Šà¶šà·à¶½à·“à¶± à¶šà¶»à¶± à¶½à¶¯à·“: à¶…à¶¯ à¶¸à·”à·…à·” à¶¸à·’.à¶½à·“. {total}",
      sleep_logged_activity: "à¶±à·’à¶±à·Šà¶¯ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶± à¶½à¶¯à·“: à¶´à·à¶º {duration} ({quality})",
      appointment_activity: "à¶‰à¶¯à·’à¶»à·’ à·€à·›à¶¯à·Šâ€à¶º à·„à¶¸à·”à·€à·“à¶¸: {hospital} à·„à·’ {reason}",
      appointment_today: "à¶…à¶¯ à¶¯à·’à¶± à·„à¶¸à·”à·€à·“à¶¸: {hospital} à·„à·’ {reason}",
      appointment_missed: "à¶¸à¶œ à·„à·à¶»à·”à¶«à·” à·„à¶¸à·”à·€à·“à¶¸: {hospital} à·„à·’ {reason}",
      uploaded: "à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶± à¶½à¶¯à·“",
      pending: "à¶´à·œà¶»à·œà¶­à·Šà¶­à·”",
      reviewed: "à¶´à¶»à·’à¶šà·Šà·‚à· à¶šà¶»à¶± à¶½à¶¯à·“",
      save_medical_record_success: "âœ“ à·€à·›à¶¯à·Šâ€à¶º à·€à·à¶»à·Šà¶­à·à·€ à·ƒà·à¶»à·Šà¶®à¶šà·€ à·ƒà·”à¶»à¶šà·’à¶«à·’!",
      record_removed_success: "à·€à·à¶»à·Šà¶­à·à·€ à·ƒà·à¶»à·Šà¶®à¶šà·€ à¶‰à·€à¶­à·Š à¶šà¶»à¶± à¶½à¶¯à·“.",
      general_view: "à·ƒà·à¶¸à·à¶±à·Šâ€à¶º à¶¯à·ƒà·”à¶±",
      specific_lab_tests: "à·€à·’à·à·šà·‚à·’à¶­ à¶»à·ƒà·à¶ºà¶±à·à¶œà·à¶» à¶´à¶»à·“à¶šà·Šà·‚à¶«",
      scans: "à·ƒà·Šà¶šà·‘à¶±à·Š à¶´à¶»à·“à¶šà·Šà·‚à¶«",
      other: "à·€à·™à¶±à¶­à·Š",
      prescription: "à¶¶à·™à·„à·™à¶­à·Š à·€à¶§à·Šà¶§à·à¶»à·”à·€",
      'LH (Luteinizing Hormone) Test': "LH (à¶½à·’à¶ºà·”à¶§à·’à¶±à¶ºà·’à·ƒà·’à¶±à·Š à·„à·à¶¸à·à¶±) à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º",
      'FSH (Follicle Stimulating Hormone) Test': "FSH (à·†à·œà¶½à·’à¶šà¶½à·Š à¶‹à¶­à·Šà¶­à·šà¶¢à¶š à·„à·à¶¸à·à¶±) à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º",
      'Testosterone Level Test': "à¶§à·™à·ƒà·Šà¶§à·œà·ƒà·Šà¶§à·™à¶»à·à¶±à·Š à¶¸à¶§à·Šà¶§à¶¸ à¶´à¶»à·“à¶šà·Šà·‚à·à·€",
      'Prolactin Test': "à¶´à·Šâ€à¶»à·à¶½à·à¶šà·Šà¶§à·’à¶±à·Š à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º",
      'Thyroid Function Test (TSH, T3, T4)': "à¶­à¶ºà·’à¶»à·œà¶ºà·’à¶©à·Š à¶šà·Šâ€à¶»à·’à¶ºà·à¶šà·à¶»à·’à¶­à·Šà·€ à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º (TSH, T3, T4)",
      'Pelvic Ultrasound Scan': "à·à·Šâ€à¶»à·à¶«à·’ à¶…à¶½à·Šà¶§à·Šâ€à¶»à· à·ƒà·€à·”à¶±à·Šà¶©à·Š à·ƒà·Šà¶šà·‘à¶±à·Š",
      'Fasting Blood Sugar (FBS)': "à¶±à·’à¶»à·à·„à·à¶» à¶»à·”à¶°à·’à¶» à·ƒà·“à¶±à·’ (FBS)",
      'Oral Glucose Tolerance Test (OGTT)': "à¶¸à·”à¶› à¶œà·Šà¶½à·–à¶šà·à·ƒà·Š à¶¯à¶»à· à¶œà·à¶±à·“à¶¸à·š à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º (OGTT)",
      'HbA1c Test': "HbA1c à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º",
      'Lipid Profile (Cholesterol Test)': "à¶½à·’à¶´à·’à¶© à¶´à·à¶­à·’à¶šà¶© (à¶šà·œà¶½à·™à·ƒà·Šà¶§à¶»à·à¶½à·Š à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º)",
      meals_today: "ðŸ¥— à¶…à¶¯ à¶¯à·’à¶± à¶†à·„à·à¶»",
      log_meal_title: "âž• à¶†à·„à·à¶»à¶ºà¶šà·Š à¶‘à¶šà·Š à¶šà¶»à¶±à·Šà¶±",
      meal_type_label: "à¶†à·„à·à¶» à·€à¶»à·Šà¶œà¶º *",
      meal_type_placeholder: "à¶†à·„à·à¶» à·€à¶»à·Šà¶œà¶º à¶­à·à¶»à¶±à·Šà¶±...",
      breakfast: "à¶‹à¶¯à·š à¶†à·„à·à¶»à¶º",
      lunch: "à¶¯à·€à¶½à·Š à¶†à·„à·à¶»à¶º",
      dinner: "à¶»à·à¶­à·Šâ€à¶»à·“ à¶†à·„à·à¶»à¶º",
      snack: "à¶šà·™à¶§à·’ à¶†à·„à·à¶»à¶ºà¶šà·Š",
      meal_name_label: "à¶”à¶¶ à¶†à·„à·à¶»à¶ºà¶§ à¶œà¶­à·Šà¶­à·š à¶šà·”à¶¸à¶šà·Šà¶¯? *",
      meal_name_placeholder: "à¶‹à¶¯à·: à¶´à¶½à¶­à·”à¶»à·” à·ƒà¶½à·à¶¯à¶ºà¶šà·Š à·ƒà¶¸à¶Ÿ à¶œà·Šâ€à¶»à·’à¶½à·Šà¶©à·Š à¶ à·’à¶šà¶±à·Š",
      food_categories: "à¶†à·„à·à¶» à¶šà·à¶«à·Šà¶©",
      protein: "à¶´à·Šâ€à¶»à·à¶§à·“à¶±à·Š",
      vegetables: "à¶‘à·…à·€à·…à·”",
      fruits: "à¶´à¶½à¶­à·”à¶»à·”",
      grains: "à¶°à·à¶±à·Šâ€à¶º",
      dairy: "à¶šà·’à¶»à·’ à¶†à·à·Šâ€à¶»à·’à¶­ à¶±à·’à·‚à·Šà¶´à·à¶¯à¶±",
      fats: "à·ƒà·žà¶›à·Šâ€à¶º à·ƒà¶¸à·Šà¶´à¶±à·Šà¶± à¶¸à·šà¶¯à¶º",
      calories_label: "à¶šà·à¶½à¶»à·’ (à·€à·’à¶šà¶½à·Šà¶´)",
      calories_placeholder: "à¶‹à¶¯à·: 450",
      notes_label: "à·ƒà¶§à·„à¶±à·Š",
      meal_notes_placeholder: "à¶¸à·™à¶¸ à¶†à·„à·à¶»à¶ºà·™à¶±à·Š à¶´à·ƒà·” à¶”à¶¶à¶§ à·„à·à¶Ÿà·”à¶«à·š à¶šà·™à·ƒà·šà¶¯? à¶ºà¶¸à·Š à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶­à·’à¶¶à·šà¶¯?",
      save_meal: "ðŸ’¾ à¶†à·„à·à¶»à¶º à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      meal_history: "ðŸ“‹ à¶†à·„à·à¶» à¶‰à¶­à·’à·„à·à·ƒà¶º",
      no_meals_msg: "à¶­à·€à¶¸à¶­à·Š à¶†à·„à·à¶» à¶‡à¶­à·”à·…à¶­à·Š à¶šà¶» à¶±à·à¶­",
      log_exercise_title: "âž• à·€à·Šâ€à¶ºà·à¶ºà·à¶¸à¶ºà¶šà·Š à¶‘à¶šà·Š à¶šà¶»à¶±à·Šà¶±",
      exercise_type_label: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à·€à¶»à·Šà¶œà¶º *",
      exercise_type_placeholder: "à·€à¶»à·Šà¶œà¶º à¶­à·à¶»à¶±à·Šà¶±...",
      cardio: "à·„à·˜à¶¯ à·€à·à·„à·’à¶±à·“ (à¶¯à·’à·€à·“à¶¸, à¶´à·à¶´à·à¶¯à·’ à¶´à·à¶¯à·“à¶¸...)",
      strength: "à·à¶šà·Šà¶­à·’à¶º à·€à¶»à·Šà¶°à¶±à¶º à¶šà·’à¶»à·“à¶¸",
      yoga: "à¶ºà·à¶œ",
      walking: "à¶‡à·€à·’à¶¯à·“à¶¸",
      swimming: "à¶´à·’à·„à·’à¶±à·“à¶¸",
      stretching: "à¶‡à¶Ÿ à¶‡à¶¯à·“à¶¸",
      exercise_name_label: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸à¶ºà·š à¶±à¶¸ *",
      exercise_name_placeholder: "à¶‹à¶¯à·: à¶‹à¶¯à·‘à·ƒà¶± à¶‹à¶¯à·Šâ€à¶ºà·à¶±à¶ºà·š à¶‡à·€à·’à¶¯à·“à¶¸",
      duration_label: "à¶šà·à¶½à¶º (à¶¸à·’à¶±à·’à¶­à·Šà¶­à·”) *",
      intensity_label: "à¶­à·“à·€à·Šâ€à¶»à¶­à·à·€à¶º",
      light: "à·ƒà·à·„à·à¶½à·Šà¶½à·”",
      moderate: "à¶¸à¶°à·Šâ€à¶ºà¶¸",
      vigorous: "à¶¯à·à¶©à·’",
      calories_burned_label: "à¶¯à·„à¶±à¶º à·€à·– à¶šà·à¶½à¶»à·’ (à¶…à¶±à·”à¶¸à·à¶±)",
      feel_notes_placeholder: "à·à¶šà·Šà¶­à·’ à¶¸à¶§à·Šà¶§à¶¸, à¶ºà¶¸à·Š à·€à·šà¶¯à¶±à·à·€à¶šà·Š à·„à· à¶…à¶´à·„à·ƒà·”à·€à¶šà·Š...",
      save_exercise: "ðŸ’¾ à·€à·Šâ€à¶ºà·à¶ºà·à¶¸à¶º à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      exercise_history: "ðŸ“‹ à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à¶‰à¶­à·’à·„à·à·ƒà¶º",
      no_exercises_msg: "à¶­à·€à¶¸à¶­à·Š à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à¶‡à¶­à·”à·…à¶­à·Š à¶šà¶» à¶±à·à¶­",
      log_water_title: "ðŸ’§ à¶¢à¶½à¶º à¶´à·à¶±à¶º à¶šà·’à¶»à·“à¶¸ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      quick_add: "à·€à·šà¶œà¶ºà·™à¶±à·Š à¶‘à¶šà·Š à¶šà¶»à¶±à·Šà¶±",
      small_glass: "à¶šà·”à¶©à· à·€à·“à¶¯à·”à¶»à·”à·€à¶šà·Š",
      medium_glass: "à¶¸à¶°à·Šâ€à¶ºà¶¸ à·€à·“à¶¯à·”à¶»à·”à·€à¶šà·Š",
      large_glass: "à·€à·’à·à·à¶½ à·€à·“à¶¯à·”à¶»à·”à·€à¶šà·Š",
      one_litre: "à¶½à·“à¶§à¶»à·Š 1 à¶šà·Š",
      custom_water_label: "à¶±à·à¶­à·„à·œà¶­à·Š à¶´à·Šâ€à¶»à¶¸à·à¶«à¶º à¶‡à¶­à·”à·…à¶­à·Š à¶šà¶»à¶±à·Šà¶± (à¶¸à·’.à¶½à·“.)",
      custom_water_placeholder: "à¶´à·Šâ€à¶»à¶¸à·à¶«à¶º à¶¸à·’.à¶½à·“. à·€à¶½à·’à¶±à·Š à¶‡à¶­à·”à·…à¶­à·Š à¶šà¶»à¶±à·Šà¶±",
      today_intake_goal: "à¶…à¶¯ à¶¯à·’à¶± à¶´à·à¶±à¶º Â· à¶‰à¶½à¶šà·Šà¶šà¶º: 2,500 à¶¸à·’.à¶½à·“.",
      water_goal_reached: "à¶¯à·›à¶±à·’à¶š à¶‰à¶½à¶šà·Šà¶šà¶ºà·™à¶±à·Š",
      water_history: "ðŸ’§ à¶¢à¶½à¶º à¶´à·à¶±à¶º à¶šà·’à¶»à·“à¶¸à·š à¶‰à¶­à·’à·„à·à·ƒà¶º",
      no_water_msg: "à¶…à¶¯ à¶¯à·’à¶±à¶ºà·š à¶¢à¶½à¶º à¶´à·à¶±à¶º à¶šà·’à¶»à·“à¶¸ à·ƒà¶§à·„à¶±à·Š à¶šà¶» à¶±à·à¶­",
      log_sleep_title: "ðŸ˜´ à¶±à·’à¶±à·Šà¶¯ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      sleep_date_label: "à¶±à·’à¶±à·Šà¶¯à¶§ à¶œà·’à¶º à¶¯à·’à¶±à¶º *",
      sleep_quality_label: "à¶±à·’à¶±à·Šà¶¯à·š à¶œà·”à¶«à·à¶­à·Šà¶¸à¶šà¶·à·à·€à¶º",
      poor: "à¶¯à·”à¶»à·Šà·€à¶½à¶ºà·’ (à¶±à·œà·ƒà¶±à·Šà·ƒà·”à¶±à·Š)",
      fair: "à·ƒà·à¶¸à·à¶±à·Šâ€à¶ºà¶ºà·’",
      good: "à·„à·œà¶³à¶ºà·’",
      excellent: "à¶‰à¶­à· à·„à·œà¶³à¶ºà·’",
      bedtime_label: "à¶±à·’à¶±à·Šà¶¯à¶§ à¶œà·’à¶º à·€à·šà¶½à·à·€ *",
      waketime_label: "à¶…à·€à¶¯à·’ à·€à·– à·€à·šà¶½à·à·€ *",
      hours_slept_label: "à¶±à·’à¶¯à·à¶œà¶­à·Š à¶´à·à¶º à¶œà¶«à¶±",
      sleep_notes_placeholder: "à¶”à¶¶à·š à¶±à·’à¶±à·Šà¶¯à¶§ à¶¶à¶½à¶´à·‘ à¶šà¶»à·”à¶«à·”? (à¶šà·à·†à·šà¶±à·Š, à¶†à¶­à¶­à·’à¶º, à¶´à¶»à·’à·ƒà¶»à¶º...)",
      save_sleep: "ðŸ’¾ à¶±à·’à¶±à·Šà¶¯ à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      sleep_history: "ðŸ“‹ à¶±à·’à¶±à·Šà¶¯à·š à¶‰à¶­à·’à·„à·à·ƒà¶º",
      no_sleep_msg: "à¶­à·€à¶¸à¶­à·Š à¶±à·’à¶±à·Šà¶¯ à·ƒà¶§à·„à¶±à·Š à¶šà¶» à¶±à·à¶­",
      total: "à¶‘à¶šà¶­à·”à·€",
      pending_status: "âŸ³ à¶´à·œà¶»à·œà¶­à·Šà¶­à·”",
      reviewed_status: "âœ“ à¶´à¶»à·’à¶šà·Šà·‚à· à¶šà¶»à¶± à¶½à¶¯à·“",
      uploaded_status: "âœ“ à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶± à¶½à¶¯à·“",
      no_upcoming_visits: "à¶‰à¶¯à·’à¶»à·’ à·„à¶¸à·”à·€à·“à¶¸à·Š à¶±à·à¶­",
      upload_first_report: "à¶´à·…à¶¸à·” à·€à·à¶»à·Šà¶­à·à·€ à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶±à·Šà¶±",
      appointment_activity: "à¶‰à¶¯à·’à¶»à·’ à·€à·›à¶¯à·Šâ€à¶º à·„à¶¸à·”à·€à·“à¶¸: {hospital} à·„à·’ {reason}",
      appointment_today: "à¶…à¶¯ à¶¯à·’à¶± à·„à¶¸à·”à·€à·“à¶¸: {hospital} à·„à·’ {reason}",
      appointment_missed: "à¶¸à¶œ à·„à·à¶»à·”à¶«à·” à·„à¶¸à·”à·€à·“à¶¸: {hospital} à·„à·’ {reason}",
      records: "à·€à·à¶»à·Šà¶­à·",
      records_today: "à¶…à¶¯ à¶¯à·’à¶± à·€à·à¶»à·Šà¶­à·",
      amount: "à¶´à·Šâ€à¶»à¶¸à·à¶«à¶º",
      day_total: "à¶¯à·›à¶±à·’à¶š à¶‘à¶šà¶­à·”à·€",
      logged_at: "à·ƒà¶§à·„à¶±à·Š à¶šà·… à·€à·šà¶½à·à·€",
      action: "à¶šà·Šâ€à¶»à·’à¶ºà·à·€",
      log_meal_hint: "à¶‰à·„à¶­ à¶´à·à¶»à¶¸à¶º à¶´à·”à¶»à·€à· Save Meal à¶”à¶¶à¶±à·Šà¶±",
      log_exercise_hint: "à¶”à¶¶à·š à¶´à·…à¶¸à·” à·€à·Šâ€à¶ºà·à¶ºà·à¶¸à¶º à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      log_water_hint: "à·ƒà¶§à·„à¶±à·Š à¶šà·’à¶»à·“à¶¸ à¶†à¶»à¶¸à·Šà¶· à¶šà·’à¶»à·“à¶¸à¶§ à¶¶à·œà¶­à·Šà¶­à¶¸à¶šà·Š à¶”à¶¶à¶±à·Šà¶±",
      log_sleep_hint: "à¶±à·’à¶±à·Šà¶¯ à¶´à·’à·…à·’à¶¶à¶³ à¶¯à¶­à·Šà¶­ à¶‰à·„à¶­ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      track_lifestyle_title: "à¶”à¶¶à·š à¶¢à·“à·€à¶± à¶»à¶§à·à·€ à¶±à·’à¶»à·“à¶šà·Šà·‚à¶«à¶º à¶šà¶»à¶±à·Šà¶± ðŸŒ±",
      track_lifestyle_desc: "à¶”à¶¶à·š PCOS à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶µà¶½à¶¯à·à¶ºà·“ à¶½à·™à·ƒ à¶šà·…à¶¸à¶±à·à¶šà¶»à¶«à¶º à¶šà·’à¶»à·“à¶¸ à·ƒà¶³à·„à· à¶”à¶¶à·š à¶†à·„à·à¶» à·€à·šà¶½, à·€à·Šâ€à¶ºà·à¶ºà·à¶¸, à¶¢à¶½ à¶´à¶»à·’à¶·à·à¶¢à¶±à¶º à·ƒà·„ à¶±à·’à¶±à·Šà¶¯ à¶±à·’à¶»à·“à¶šà·Šà·‚à¶«à¶º à¶šà¶»à¶±à·Šà¶±.",
      manage_visits: "à¶”à¶¶à·š à·ƒà·à¶ºà¶±à·’à¶š à¶´à·à¶¸à·’à¶«à·“à¶¸à·Š à·ƒà·„ à¶‹à¶´à¶¯à·šà·à¶± à¶šà·…à¶¸à¶±à·à¶šà¶»à¶«à¶º à¶šà¶»à¶±à·Šà¶±",
      health_schedule_title: "à¶”à¶¶à·š à·ƒà·žà¶›à·Šâ€à¶º à¶šà·à¶½à·ƒà¶§à·„à¶± ðŸ“…",
      health_schedule_subtitle: "à¶”à¶¶à·š à·€à·›à¶¯à·Šâ€à¶º à·„à¶¸à·”à·€à·“à¶¸à·Š à¶´à·’à·…à·’à¶¶à¶³ à·€à·’à¶¸à·ƒà·’à¶½à·’à¶¸à¶­à·Š à·€à¶±à·Šà¶±. à·€à·’à¶°à·’à¶¸à¶­à·Š à¶´à¶»à·“à¶šà·Šà·‚à·à·€à¶±à·Š PCOS à¶šà·…à¶¸à¶±à·à¶šà¶»à¶«à¶º à·ƒà¶³à·„à· à¶´à·Šâ€à¶»à¶°à·à¶± à·€à·š.",
      upcoming: "à¶‰à¶¯à·’à¶»à·’ à·„à¶¸à·”à·€à·“à¶¸à·Š",
      total_visits: "à¶¸à·”à·…à·” à¶´à·à¶¸à·’à¶«à·“à¶¸à·Š à·ƒà¶‚à¶›à·Šâ€à¶ºà·à·€",
      book_appointment: "âž• à·„à¶¸à·”à·€à·“à¶¸à¶šà·Š à·€à·™à¶±à·Šà¶šà¶»à·€à· à¶œà¶±à·Šà¶±",
      all_appointments: "à·ƒà·’à¶ºà¶½à·”à¶¸ à·„à¶¸à·”à·€à·“à¶¸à·Š",
      history: "à¶‰à¶­à·’à·„à·à·ƒà¶º",
      no_appts_found: "à¶šà·’à·ƒà·’à¶¯à·” à·„à¶¸à·”à·€à·“à¶¸à¶šà·Š à·„à¶¸à·” à¶±à·œà·€à·“à¶º",
      no_appts_msg: "à¶”à¶¶ à¶­à·€à¶¸à¶­à·Š à¶šà·’à·ƒà·’à¶¯à·” à·ƒà·à¶ºà¶±à·’à¶š à¶´à·à¶¸à·’à¶«à·“à¶¸à¶šà·Š à·ƒà·à¶½à·ƒà·”à¶¸à·Š à¶šà¶» à¶±à·à¶­. <br> à¶´à·…à¶¸à·” à·„à¶¸à·”à·€à·“à¶¸ à·€à·™à¶±à·Šà¶šà¶»à·€à· à¶œà·à¶±à·“à¶¸à¶§ à¶¯à¶šà·”à¶«à·” à¶´à·ƒ à¶‡à¶­à·’ à¶´à·à¶»à¶¸à¶º à¶·à·à·€à·’à¶­à· à¶šà¶»à¶±à·Šà¶±!",
      schedule_new: "à¶±à·€ à·„à¶¸à·”à·€à·“à¶¸à¶šà·Š",
      hospital_name: "à¶»à·à·„à¶½à·š à¶±à¶¸",
      enter_hospital: "à¶»à·à·„à¶½ à·„à· à·ƒà·à¶ºà¶±à¶º à¶‡à¶­à·”à·…à¶­à·Š à¶šà¶»à¶±à·Šà¶±",
      doctor_name: "à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà·à¶œà·š à¶±à¶¸",
      dr_name_optional: "à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà·à¶œà·š à¶±à¶¸ (à·€à·’à¶šà¶½à·Šà¶´)",
      visit_type: "à¶´à·à¶¸à·’à¶«à·“à¶¸à·š à·€à¶»à·Šà¶œà¶º",
      consultation: "à¶‹à¶´à¶¯à·šà·à¶±à¶º",
      'pcos-check-up': "PCOS à¶´à¶»à·“à¶šà·Šà·‚à·à·€",
      'follow-up': "à¶´à·ƒà·” à·€à·’à¶´à¶»à¶¸",
      'lab-test': "à¶´à¶»à·“à¶šà·Šà·‚à¶«/à·ƒà·Šà¶šà·‘à¶±à·Š",
      reason_notes: "à·„à·šà¶­à·”à·€ / à·ƒà¶§à·„à¶±à·Š",
      visit_reason_placeholder: "à¶´à·à¶¸à·’à¶«à·“à¶¸à·š à¶…à¶»à¶¸à·”à¶« à¶šà·”à¶¸à¶šà·Šà¶¯?",
      save_appointment: "ðŸ’¾ à·„à¶¸à·”à·€à·“à¶¸ à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      reschedule_visit: "à·„à¶¸à·”à·€à·“à¶¸ à¶±à·à·€à¶­ à·ƒà·à¶½à·ƒà·”à¶¸à·Š à¶šà¶»à¶±à·Šà¶± ðŸ•“",
      reschedule_msg: "à¶šà¶»à·”à¶«à·à¶šà¶» à¶”à¶¶à¶œà·š à¶‹à¶´à¶¯à·šà·à¶±à¶º à·ƒà¶³à·„à· à¶±à·€ à¶¯à·’à¶±à¶ºà¶šà·Š à·ƒà·„ à·€à·šà¶½à·à·€à¶šà·Š à¶­à·à¶»à¶±à·Šà¶±.",
      new_date: "à¶±à·€ à¶¯à·’à¶±à¶º",
      new_time: "à¶±à·€ à·€à·šà¶½à·à·€",
      update_schedule: "à¶šà·à¶½à·ƒà¶§à·„à¶± à¶ºà·à·€à¶­à·Šà¶šà·à¶½à·“à¶± à¶šà¶»à¶±à·Šà¶±",
      medical_officer: "à·€à·›à¶¯à·Šâ€à¶º à¶±à·’à¶½à¶°à·à¶»à·“",
      reschedule: "ðŸ•“ à¶±à·à·€à¶­ à·ƒà·à¶½à·ƒà·”à¶¸à·Š à¶šà¶»à¶±à·Šà¶±",
      cancel_visit: "âœ• à¶…à·€à¶½à¶‚à¶œà·” à¶šà¶»à¶±à·Šà¶±",
      upcoming: "à¶‰à¶¯à·’à¶»à·’",
      completed: "à·ƒà¶¸à·Šà¶´à·–à¶»à·Šà¶«à¶ºà·’",
      cancelled: "à¶…à·€à¶½à¶‚à¶œà·”à¶ºà·’",
      rescheduled: "à¶±à·à·€à¶­ à·ƒà·à¶½à·ƒà·”à¶¸à·Š à¶šà·…",
      at: "à¶¯à·“",
      lab_results_title: "à¶´à¶»à·“à¶šà·Šà·‚à¶« à·€à·à¶»à·Šà¶­à·",
      total_results: "à¶¸à·”à·…à·” à·€à·à¶»à·Šà¶­à· à·ƒà¶‚à¶›à·Šâ€à¶ºà·à·€",
      added_this_month: "à¶¸à·š à¶¸à·à·ƒà¶ºà·š à¶‘à¶šà·Š à¶šà·…",
      added_this_year: "à¶¸à·š à·€à·ƒà¶»à·š à¶‘à¶šà·Š à¶šà·…",
      search_lab_placeholder: "à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º, à¶½à·à¶¶à·Š à¶‘à¶š à·„à· à·€à¶»à·Šà¶œà¶º à¶…à¶±à·”à·€ à·ƒà·œà¶ºà¶±à·Šà¶±...",
      all_lab_results: "à·ƒà·’à¶ºà¶½à·”à¶¸ à¶´à¶»à·“à¶šà·Šà·‚à¶« à·€à·à¶»à·Šà¶­à·",
      received_only: "à¶½à·à¶¶à·”à¶«à·” à·€à·à¶»à·Šà¶­à· à¶´à¶¸à¶«à¶ºà·’",
      pending_only: "à¶´à·œà¶»à·œà¶­à·Šà¶­à·” à·€à·à¶»à·Šà¶­à· à¶´à¶¸à¶«à¶ºà·’",
      loading_medical_records: "à¶”à¶¶à·š à·€à·›à¶¯à·Šâ€à¶º à·€à·à¶»à·Šà¶­à· à¶½à¶¶à· à¶œà¶±à·’à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...",
      no_lab_results_found: "à¶´à¶»à·“à¶šà·Šà·‚à¶« à·€à·à¶»à·Šà¶­à· à¶šà·’à·ƒà·’à·€à¶šà·Š à·„à¶¸à·” à¶±à·œà·€à·“à¶º",
      no_lab_results_msg: "à¶”à¶¶à·š à¶´à¶»à·“à¶šà·Šà·‚à¶« à·€à·à¶»à·Šà¶­à· à¶‹à¶©à·”à¶œà¶­ à¶šà·… à¶´à·ƒà·” à·„à· à¶½à·à¶¶à·Š à¶‘à¶šà·™à¶±à·Š à¶½à·à¶¶à·”à¶«à·” à¶´à·ƒà·” à¶¸à·™à·„à·’ à¶¯à·’à·ƒà·Šà·€à¶±à·” à¶‡à¶­.",
      upload_first_result: "ðŸ“¤ à¶´à·…à¶¸à·” à·€à·à¶»à·Šà¶­à·à·€ à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶±à·Šà¶±",
      upload_lab_result_title: "ðŸ“¤ à¶´à¶»à·“à¶šà·Šà·‚à¶« à·€à·à¶»à·Šà¶­à·à·€à¶šà·Š à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶±à·Šà¶±",
      test_name_label: "à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶ºà·š à¶±à¶¸ *",
      test_category_label: "à¶´à¶»à·“à¶šà·Šà·‚à¶« à¶šà·à¶«à·Šà¶©à¶º",
      hospital_clinic_label: "à¶»à·à·„à¶½ / à·ƒà·à¶ºà¶±à¶º",
      doctor_requested_label: "à¶‰à¶½à·Šà¶½à·“à¶¸à·Š à¶šà·… à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà·",
      test_date_label: "à¶´à¶»à·“à¶šà·Šà·‚à¶« à¶¯à·’à¶±à¶º *",
      attach_file_label: "PDF à·„à· à¶»à·–à¶´à¶ºà¶šà·Š à¶‘à¶šà·Š à¶šà¶»à¶±à·Šà¶±",
      click_to_select: "à¶œà·œà¶±à·”à·€ à¶­à·à¶»à· à¶œà·à¶±à·“à¶¸à¶§ à¶šà·Šà¶½à·’à¶šà·Š à¶šà¶»à¶±à·Šà¶±",
      save_medical_result: "âœ“ à·€à·›à¶¯à·Šâ€à¶º à·€à·à¶»à·Šà¶­à·à·€ à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      remove_result_title: "à·€à·à¶»à·Šà¶­à·à·€ à¶‰à·€à¶­à·Š à¶šà¶»à¶±à·Šà¶±à¶¯?",
      remove_result_msg: "à¶”à¶¶à¶§ à¶¸à·™à¶¸ à¶´à¶»à·“à¶šà·Šà·‚à¶« à·€à·à¶»à·Šà¶­à·à·€ à¶‰à·€à¶­à·Š à¶šà·’à¶»à·“à¶¸à¶§ à¶…à·€à·à·Šâ€à¶º à¶¶à·€ à·€à·’à·à·Šà·€à·à·ƒà¶¯?",
      medical_documents_title: "à¶¸à¶œà·š à·€à·›à¶¯à·Šâ€à¶º à¶½à·’à¶ºà¶šà·’à¶ºà·€à·’à¶½à·’",
      upload_report: "ðŸ“¤ à·€à·à¶»à·Šà¶­à·à·€à¶šà·Š à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶±à·Šà¶±",
      total_files: "à¶¸à·”à·…à·” à¶œà·œà¶±à·” à·ƒà¶‚à¶›à·Šâ€à¶ºà·à·€",
      search_reports_placeholder: "à¶±à¶¸ à·„à· à¶†à¶ºà¶­à¶±à¶º à¶…à¶±à·”à·€ à·ƒà·œà¶ºà¶±à·Šà¶±...",
      filter_by_type: "ðŸ” à·€à¶»à·Šà¶œà¶º à¶…à¶±à·”à·€ à¶´à·™à¶»à¶±à·Šà¶±...",
      accessing_vault: "à·€à·›à¶¯à·Šâ€à¶º à¶œà¶¶à¶©à·à·€à¶§ à¶´à·’à·€à·’à·ƒà·™à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...",
      no_records_found: "à·€à·à¶»à·Šà¶­à· à¶šà·’à·ƒà·’à·€à¶šà·Š à·„à¶¸à·” à¶±à·œà·€à·“à¶º",
      no_records_msg: "à¶”à¶¶ à¶­à·€à¶¸à¶­à·Š à¶¸à·™à¶¸ à¶šà·à¶«à·Šà¶©à¶º à¶ºà¶§à¶­à·š à¶šà·’à·ƒà·’à¶¯à·” à·€à·à¶»à·Šà¶­à·à·€à¶šà·Š à¶‹à¶©à·”à¶œà¶­ à¶šà¶» à¶±à·à¶­.",
      upload_first_file: "ðŸ“¤ à¶”à¶¶à·š à¶´à·…à¶¸à·” à¶œà·œà¶±à·”à·€ à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶±à·Šà¶±",
      upload_document_title: "ðŸ“¤ à¶½à·šà¶›à¶±à¶ºà¶šà·Š à¶‹à¶©à·”à¶œà¶­ à¶šà¶»à¶±à·Šà¶±",
      report_name_label: "à·€à·à¶»à·Šà¶­à·à·€à·š à¶±à¶¸ *",
      report_type_label: "à·€à·à¶»à·Šà¶­à· à·€à¶»à·Šà¶œà¶º / à¶´à¶»à·“à¶šà·Šà·‚à¶«à¶º *",
      attach_report_label: "à·€à·à¶»à·Šà¶­à·à·€ à¶…à¶¸à·”à¶«à¶±à·Šà¶± (PDF/Img)",
      save_medical_record: "âœ“ à·€à·›à¶¯à·Šâ€à¶º à·€à·à¶»à·Šà¶­à·à·€ à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      permanently_remove: "à·ƒà·Šà¶®à·’à¶»à·€à¶¸ à¶‰à·€à¶­à·Š à¶šà¶»à¶±à·Šà¶±à¶¯?",
      are_you_sure_remove: "à¶”à¶¶à¶§ à¶¸à·™à¶¸ à·€à·à¶»à·Šà¶­à·à·€ à¶‰à·€à¶­à·Š à¶šà·’à¶»à·“à¶¸à¶§ à¶…à·€à·à·Šâ€à¶º à¶¶à·€ à·€à·’à·à·Šà·€à·à·ƒà¶¯?",
      ok_remove: "à¶”à·€à·Š, à¶‰à·€à¶­à·Š à¶šà¶»à¶±à·Šà¶±",
      no_back: "à¶±à·à¶­, à¶´à·ƒà·”à¶´à·ƒà¶§",
      syncing: "à·ƒà¶¸à¶¸à·”à·„à·”à¶»à·Šà¶­ à¶šà¶»à¶¸à·’à¶±à·Š...",
      my_hospital_title: "à¶¸à¶œà·š à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à¶»à·à·„à¶½",
      manage_healthcare: "à¶”à¶¶à·š à·ƒà·žà¶›à·Šâ€à¶º à·ƒà·šà·€à· à·ƒà¶´à¶ºà¶±à·Šà¶±à¶±à·Š à¶šà·…à¶¸à¶±à·à¶šà¶»à¶«à¶º à¶šà¶»à¶±à·Šà¶±",
      hospital_hero_title: "à¶”à¶¶à¶§ à·„à·œà¶³à¶¸ à·ƒà·žà¶›à·Šâ€à¶º à·ƒà·šà·€à·à·€ à·ƒà·œà¶ºà· à¶œà¶±à·Šà¶± ðŸ¥",
      hospital_hero_desc: "à¶”à¶¶à·š à·ƒà·’à¶ºà¶½à·”à¶¸ à·€à·›à¶¯à·Šâ€à¶º à¶´à·Šâ€à¶»à¶­à·’à¶šà·à¶» à¶‘à¶šà¶¸ à·ƒà·Šà¶®à·à¶±à¶ºà¶š à¶­à¶¶à· à¶œà·à¶±à·“à¶¸ à·ƒà¶³à·„à· à¶”à¶¶à·š à¶´à·Šâ€à¶»à·à¶®à¶¸à·’à¶š à¶»à·à·„à¶½ à·ƒà·„ à·€à·’à·à·šà·‚à¶¥ à·ƒà·à¶ºà¶±à¶º à·ƒà¶¸à¶Ÿ à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à·€à¶±à·Šà¶±.",
      register_new_hospital: "à¶±à·€ à¶»à·à·„à¶½à¶šà·Š à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à¶šà¶»à¶±à·Šà¶±",
      fetching_hospitals: "à¶”à¶¶à·š à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à¶»à·à·„à¶½à·Š à¶½à¶¶à· à¶œà¶±à·’à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...",
      register_new_title: "à¶…à¶½à·”à¶­à·’à¶±à·Š à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à¶šà¶»à¶±à·Šà¶±",
      hospital_name_label: "à¶»à·à·„à¶½à·Š à¶±à·à¶¸à¶º *",
      specialist_doctor_label: "à·€à·’à·à·šà·‚à¶¥ à·€à·›à¶¯à·Šâ€à¶ºà·€à¶»à¶ºà·",
      address_label: "à¶½à·’à¶´à·’à¶±à¶º",
      contact_number_label: "à·ƒà¶¸à·Šà¶¶à¶±à·Šà¶°à¶­à· à¶…à¶‚à¶šà¶º *",
      email_label: "à·€à·’à¶¯à·Šâ€à¶ºà·”à¶­à·Š à¶­à·à¶´à·‘à¶½",
      set_primary_label: "à¶´à·Šâ€à¶»à·à¶®à¶¸à·’à¶š à¶»à·à·„à¶½ à¶½à·™à·ƒ à·ƒà¶šà·ƒà¶±à·Šà¶±",
      register_hospital_btn: "à¶»à·à·„à¶½ à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à¶šà¶»à¶±à·Šà¶±",
      no_hospitals_registered: "à¶­à·€à¶¸à¶­à·Š à¶»à·à·„à¶½à·Š à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à¶šà¶» à¶±à·œà¶¸à·à¶­. à¶”à¶¶à·š à¶´à·…à¶¸à·” à·ƒà·à¶ºà¶±à¶º à¶¯à¶šà·”à¶«à·” à¶´à·ƒà·’à¶±à·Š à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à¶šà¶»à¶±à·Šà¶±!",
      primary_provider_badge: "à¶´à·Šâ€à¶»à·à¶®à¶¸à·’à¶š à·ƒà¶´à¶ºà¶±à·Šà¶±à·",
      special_care: "à·€à·’à·à·šà·‚ à·ƒà¶­à·Šà¶šà·à¶»",
      remove: "à¶‰à·€à¶­à·Š à¶šà¶»à¶±à·Šà¶±",
      make_primary: "à¶´à·Šâ€à¶»à·à¶®à¶¸à·’à¶š à¶šà¶»à¶±à·Šà¶±",
      hospital_registered_success: "âœ“ à¶»à·à·„à¶½ à·ƒà·à¶»à·Šà¶®à¶šà·€ à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à¶šà¶»à¶± à¶½à¶¯à·“!",
      primary_provider_updated: "âœ“ à¶´à·Šâ€à¶»à·à¶®à¶¸à·’à¶š à·ƒà¶´à¶ºà¶±à·Šà¶±à· à¶ºà·à·€à¶­à·Šà¶šà·à¶½à·“à¶± à¶šà¶»à¶± à¶½à¶¯à·“!",
      hospital_removed: "âœ“ à¶»à·à·„à¶½ à¶‰à·€à¶­à·Š à¶šà¶»à¶± à¶½à¶¯à·“",
      hospital_registered_activity: "à¶»à·à·„à¶½ à·ƒà¶¸à¶Ÿ à¶½à·’à¶ºà·à¶´à¶¯à·’à¶‚à¶ à·’ à·€à·“ à¶‡à¶­: {name}",
      removed_from_both: "à¶¸à·™à¶º à¶”à¶¶à¶œà·š à·€à·à¶»à·Šà¶­à· à¶½à·à¶ºà·’à·ƒà·Šà¶­à·”à·€à·™à¶±à·Šà¶¯ à¶‰à·€à¶­à·Š à·€à·š",
      profile_title: "à¶¸à¶œà·š à¶´à·à¶­à·’à¶šà¶©",
      profile_subtitle: "à¶”à¶¶à·š à¶´à·”à¶¯à·Šà¶œà¶½à·’à¶š à·ƒà·„ à·€à·›à¶¯à·Šâ€à¶º à¶­à·œà¶»à¶­à·”à¶»à·” à¶šà·…à¶¸à¶±à·à¶šà¶»à¶«à¶º à¶šà¶»à¶±à·Šà¶±",
      personal_info: "à¶´à·”à¶¯à·Šà¶œà¶½à·’à¶š à¶­à·œà¶»à¶­à·”à¶»à·”",
      full_name_label: "à·ƒà¶¸à·Šà¶´à·–à¶»à·Šà¶« à¶±à¶¸",
      email_address_label: "à·€à·’à¶¯à·Šâ€à¶ºà·”à¶­à·Š à¶­à·à¶´à·à¶½à·Š à¶½à·’à¶´à·’à¶±à¶º",
      phone_number_label: "à¶¯à·”à¶»à¶šà¶®à¶± à¶…à¶‚à¶šà¶º",
      dob_label: "à¶‹à¶´à¶±à·Š à¶¯à·’à¶±à¶º",
      gender_label: "à·ƒà·Šà¶­à·Šâ€à¶»à·“ à¶´à·”à¶»à·”à·‚ à¶·à·à·€à¶º",
      blood_group_label: "à¶»à·”à¶°à·’à¶» à¶œà¶«à¶º",
      security_password: "à¶†à¶»à¶šà·Šà·‚à·à·€ à·ƒà·„ à¶¸à·”à¶»à¶´à¶¯à¶º",
      current_password: "à·€à¶­à·Šà¶¸à¶±à·Š à¶¸à·”à¶»à¶´à¶¯à¶º",
      new_password: "à¶±à·€ à¶¸à·”à¶»à¶´à¶¯à¶º",
      confirm_new_password: "à¶±à·€ à¶¸à·”à¶»à¶´à¶¯à¶º à¶­à·„à·€à·”à¶»à·” à¶šà¶»à¶±à·Šà¶±",
      update_password_btn: "à¶¸à·”à¶»à¶´à¶¯à¶º à¶ºà·à·€à¶­à·Šà¶šà·à¶½à·“à¶± à¶šà¶»à¶±à·Šà¶±",
      data_management: "à¶¯à¶­à·Šà¶­ à·ƒà·„ à¶…à¶­à·š à¶œà·™à¶± à¶ºà· à·„à·à¶šà·’ à¶¶à·€",
      download_data_json: "à¶¸à¶œà·š à¶¯à¶­à·Šà¶­ à¶¶à·à¶œà¶­ à¶šà¶»à¶±à·Šà¶± (JSON)",
      export_summary_csv: "à·€à·›à¶¯à·Šâ€à¶º à·ƒà·à¶»à·à¶‚à·à¶º à¶…à¶´à¶±à¶ºà¶±à¶º à¶šà¶»à¶±à·Šà¶± (CSV)",
      download_health_doc: "à¶´à·”à¶¯à·Šà¶œà¶½à·à¶»à·à¶´à·’à¶­ à·ƒà·žà¶›à·Šâ€à¶º à¶½à·šà¶›à¶±à¶º (TXT)",
      danger_zone: "à¶…à¶±à·Šà¶­à¶»à·à¶¯à·à¶ºà¶š à¶šà¶½à·à¶´à¶º",
      deactivate_account: "à¶œà·’à¶«à·”à¶¸ à¶…à¶šà·Šâ€à¶»à·’à¶º à¶šà¶»à¶±à·Šà¶±",
      confirm_deactivation_title: "à¶…à¶šà·Šâ€à¶»à·’à¶º à¶šà·’à¶»à·“à¶¸ à¶­à·„à·€à·”à¶»à·” à¶šà¶»à¶±à·Šà¶±",
      deactivate_msg: "à¶¸à·™à¶¸ à¶œà·’à¶«à·”à¶¸à¶§ à¶¯à·’à¶± 30à¶šà·Š à¶‡à¶­à·”à·…à¶­ à¶½à·œà¶œà·Š à¶±à·œà·€à¶±à·Šà¶±à·š à¶±à¶¸à·Š, à¶‘à¶º à·ƒà·Šà¶®à·’à¶»à·€à¶¸ à¶¸à¶šà· à¶¯à·à¶¸à·™à¶±à·” à¶‡à¶­.",
      enter_password_confirm: "à¶…à¶šà·Šâ€à¶»à·’à¶º à¶šà·’à¶»à·“à¶¸ à¶­à·„à·€à·”à¶»à·” à¶šà·’à¶»à·“à¶¸à¶§ à¶šà¶»à·”à¶«à·à¶šà¶» à¶”à¶¶à·š à¶¸à·”à¶»à¶´à¶¯à¶º à¶‡à¶­à·”à·…à¶­à·Š à¶šà¶»à¶±à·Šà¶±:",
      confirm_logout: "à¶­à·„à·€à·”à¶»à·” à¶šà¶» à¶‰à·€à¶­à·Š à·€à¶±à·Šà¶±",
      keep_account: "à¶¸à¶œà·š à¶œà·’à¶«à·”à¶¸ à¶­à¶¶à· à¶œà¶±à·Šà¶±",
      edit_personal_info_btn: "à¶´à·”à¶¯à·Šà¶œà¶½à·’à¶š à¶­à·œà¶»à¶­à·”à¶»à·” à·ƒà¶‚à·ƒà·Šà¶šà¶»à¶«à¶º à¶šà¶»à¶±à·Šà¶±",
      save_changes_btn: "à·€à·™à¶±à·ƒà·Šà¶šà¶¸à·Š à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      profile_address: "à¶½à·’à¶´à·’à¶±à¶º",
      not_provided: "à·ƒà¶´à¶ºà· à¶±à·à¶­",
      unknown_blood: "à¶±à·œà¶¯à¶±à·Šà¶±à·",
      female: "à·ƒà·Šà¶­à·Šâ€à¶»à·“",
      male: "à¶´à·”à¶»à·”à·‚",
      other_gender: "à·€à·™à¶±à¶­à·Š",
      profile_updated_success: "âœ“ à¶´à·à¶­à·’à¶šà¶© à¶ºà·à·€à¶­à·Šà¶šà·à¶½à·“à¶± à¶šà¶»à¶± à¶½à¶¯à·“!",
      password_changed_success: "âœ“ à¶¸à·”à¶»à¶´à¶¯à¶º à·ƒà·à¶»à·Šà¶®à¶šà·€ à·€à·™à¶±à·ƒà·Š à¶šà¶»à¶± à¶½à¶¯à·“!",
      account_deactivated_success: "à¶”à¶¶à·š à¶œà·’à¶«à·”à¶¸ à·ƒà·à¶»à·Šà¶®à¶šà·€ à¶…à¶šà·Šâ€à¶»à·’à¶º à¶šà¶» à¶‡à¶­. à¶‰à·€à¶­à·Š à·€à·™à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...",
      notifications: "à¶¯à·à¶±à·”à¶¸à·Šà¶¯à·“à¶¸à·Š",
      notifications_desc: "à¶”à¶¶à¶§ à¶¯à·à¶±à·”à¶¸à·Šà¶¯à·“à¶¸à·Š à·ƒà·„ à¶¸à¶­à¶šà·Š à¶šà·’à¶»à·“à¶¸à·Š à¶½à·à¶¶à·™à¶± à¶†à¶šà·à¶»à¶º à¶šà·…à¶¸à¶±à·à¶šà¶»à¶«à¶º à¶šà¶»à¶±à·Šà¶±",
      email_notif: "à·€à·’à¶¯à·Šâ€à¶ºà·”à¶­à·Š à¶­à·à¶´à·à¶½à·Š à¶¯à·à¶±à·”à¶¸à·Šà¶¯à·“à¶¸à·Š",
      email_notif_desc: "à·„à¶¸à·”à·€à·“à¶¸à·Š à·ƒà·„ à·ƒà·žà¶›à·Šâ€à¶ºà¶º à¶´à·’à·…à·’à¶¶à¶³ à·€à·’à¶¯à·Šâ€à¶ºà·”à¶­à·Š à¶­à·à¶´à·à¶½à·Š à¶ºà·à·€à¶­à·Šà¶šà·à¶½à·“à¶± à¶½à¶¶à· à¶œà¶±à·Šà¶±",
      sms_alerts: "SMS à¶‡à¶Ÿà·€à·“à¶¸à·Š",
      sms_alerts_desc: "à·„à¶¸à·”à·€à·“à¶¸à·Š à·ƒà¶³à·„à· à¶šà·™à¶§à·’ à¶´à¶«à·’à·€à·’à¶© à¶¸à¶­à¶šà·Š à¶šà·’à¶»à·“à¶¸à·Š à¶½à¶¶à· à¶œà¶±à·Šà¶±",
      appointment_reminders: "à·„à¶¸à·”à·€à·“à¶¸à·Š à¶¸à¶­à¶šà·Š à¶šà·’à¶»à·“à¶¸à·Š",
      appointment_reminders_desc: "à¶”à¶¶à·š à¶±à·’à¶ºà¶¸à·’à¶­ à·„à¶¸à·”à·€à·“à¶¸à·Šà·€à¶½à¶§ à¶´à·™à¶» à¶¸à¶­à¶šà·Š à¶šà·’à¶»à·“à¶¸à·Š à¶½à¶¶à· à¶œà¶±à·Šà¶±",
      cycle_reminders: "à¶ à¶šà·Šâ€à¶» à¶¸à¶­à¶šà·Š à¶šà·’à¶»à·“à¶¸à·Š",
      cycle_reminders_desc: "à¶”à¶¶à·š à¶”à·ƒà¶´à·Š à¶ à¶šà·Šâ€à¶»à¶ºà·š à·ƒà·’à¶¯à·”à·€à·“à¶¸à·Š à¶´à·’à·…à·’à¶¶à¶³à·€ à¶¯à·à¶±à·”à¶¸à·Š à¶¯à·™à¶±à·Šà¶±",
      health_tips_articles: "à·ƒà·žà¶›à·Šâ€à¶º à¶‹à¶´à¶¯à·™à·ƒà·Š à·ƒà·„ à¶½à·’à¶´à·’",
      health_tips_articles_desc: "à·ƒà¶­à·’à¶´à¶­à· à·ƒà·žà¶›à·Šâ€à¶º à¶‹à¶´à¶¯à·™à·ƒà·Š à·ƒà·„ à¶…à¶°à·Šâ€à¶ºà·à¶´à¶±à·’à¶š à¶…à¶±à·Šà¶­à¶»à·Šà¶œà¶­à¶ºà¶±à·Š à¶½à¶¶à· à¶œà¶±à·Šà¶±",
      privacy_data: "à¶´à·žà¶¯à·Šà¶œà¶½à·’à¶šà¶­à·Šà·€à¶º à·ƒà·„ à¶¯à¶­à·Šà¶­",
      privacy_info_banner: "à¶”à¶¶à·š à·ƒà·žà¶›à·Šâ€à¶º à¶¯à¶­à·Šà¶­ à·ƒà¶‚à¶šà·šà¶­à¶±à¶º à¶šà¶» à¶†à¶»à¶šà·Šà·‚à·’à¶­à·€ à¶œà¶¶à¶©à· à¶šà¶» à¶‡à¶­. à¶”à¶¶à·š à¶šà·à¶¸à·à¶­à·Šà¶­à·™à¶±à·Š à¶­à·œà¶»à·€ à¶…à¶´à·’ à¶šà·’à·ƒà·’à·€à·’à¶§à¶š à¶”à¶¶à·š à¶´à·”à¶¯à·Šà¶œà¶½à·’à¶š à¶­à·œà¶»à¶­à·”à¶»à·” à¶­à·™à·€à¶± à¶´à·à¶»à·Šà·à·€à¶ºà¶±à·Š à·ƒà¶¸à¶Ÿ à¶¶à·™à¶¯à· à¶±à·œà¶œà¶±à·’à¶¸à·”.",
      data_sharing: "à¶¯à¶­à·Šà¶­ à¶¶à·™à¶¯à·à¶œà·à¶±à·“à¶¸",
      data_sharing_desc: "à¶”à¶¶à·š à·ƒà·žà¶›à·Šâ€à¶º à·€à·à¶»à·Šà¶­à· à·€à·™à¶­ à¶´à·Šâ€à¶»à·€à·šà· à·€à·“à¶¸à¶§ à·ƒà·à¶ºà¶±à·€à¶½à¶§ à¶‰à¶© à¶¯à·™à¶±à·Šà¶±",
      research_participation: "à¶´à¶»à·Šà¶ºà·šà·‚à¶« à·ƒà·„à¶·à·à¶œà·“à¶­à·Šà·€à¶º",
      research_participation_desc: "à¶´à¶»à·Šà¶ºà·šà·‚à¶«à·€à¶½à¶§ à·ƒà·„à¶·à·à¶œà·“ à·€à·“à¶¸à·™à¶±à·Š PCOS à·ƒà¶­à·Šà¶šà·à¶» à·€à·à¶©à·’à¶¯à·’à¶ºà·”à¶«à·” à¶šà·’à¶»à·“à¶¸à¶§ à¶…à¶´à¶§ à¶‹à¶¯à·€à·” à¶šà¶»à¶±à·Šà¶±",
      anonymous_analytics: "à¶±à·’à¶»à·Šà¶±à·à¶¸à·’à¶š à·€à·’à·à·Šà¶½à·šà·‚à¶«",
      anonymous_analytics_desc: "à¬­à¬¾à¬¬à·’à¬¤ à·ƒà¶‚à¶›à·Šâ€à¶ºà·à¶½à·šà¶›à¶± à¶‘à·€à·“à¶¸à·™à¶±à·Š à¶ºà·™à¶¯à·”à¶¸ à·€à·à¶©à·’à¶¯à·’à¶ºà·”à¶«à·” à¶šà·’à¶»à·“à¶¸à¶§ à¶…à¶´à¶§ à¶‹à¶¯à·€à·” à¶šà¶»à¶±à·Šà¶±",
      theme: "à¶­à·šà¶¸à·à·€",
      light_mode: "à¶†à¶½à·à¶š à¶´à·Šâ€à¶»à¶šà·à¶»à¶º",
      dark_mode: "à¶…à¶³à·”à¶»à·” à¶´à·Šâ€à¶»à¶šà·à¶»à¶º",
      auto_system: "à·ƒà·Šà·€à¶ºà¶‚à¶šà·Šâ€à¶»à·“à¶º (à¶´à¶¯à·Šà¶°à¶­à·’à¶º)",
      primary_color: "à¶´à·Šâ€à¶»à·à¶®à¶¸à·’à¶š à·€à¶»à·Šà¶«",
      text_size: "à¶´à·™à·… à¶´à·Šâ€à¶»à¶¸à·à¶«à¶º",
      small_size: "à¶šà·”à¶©à·",
      medium_size: "à¶¸à¶°à·Šâ€à¶ºà¶¸",
      large_size: "à·€à·’à·à·à¶½",
      weight_unit: "à¶¶à¶» à¶’à¶šà¶šà¶º",
      kilograms: "à¶šà·’à¶½à·à¶œà·Šâ€à¶»à·‘à¶¸à·Š (kg)",
      pounds: "à¶»à·à¶­à·Šà¶­à¶½à·Š (lbs)",
      height_unit: "à¶‹à·ƒ à¶’à¶šà¶šà¶º",
      centimeters: "à·ƒà·™à¶±à·Šà¶§à·’à¶¸à·“à¶§à¶» (cm)",
      feet_inches: "à¶…à¶©à·’ à·ƒà·„ à¶…à¶Ÿà¶½à·Š",
      avg_cycle_length: "à·ƒà·à¶¸à·à¶±à·Šâ€à¶º à¶ à¶šà·Šâ€à¶»à¶ºà·š à¶¯à·’à¶œ (à¶¯à·’à¶±)",
      avg_period_duration: "à·ƒà·à¶¸à·à¶±à·Šâ€à¶º à¶”à·ƒà¶´à·Š à¶šà·à¶½à¶º (à¶¯à·’à¶±)",
      health_tracking_priorities: "à·ƒà·žà¶›à·Šâ€à¶º à¶½à·”à·„à·”à¶¶à·à¶³à·“à¶¸à·š à¶´à·Šâ€à¶»à¶¸à·”à¶›à¶­à·",
      track_symptoms_opt: "à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶½à·”à·„à·”à¶¶à·à¶³à·“à¶¸",
      track_exercise_opt: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à·ƒà·„ à¶šà·Šâ€à¶»à·’à¶ºà·à¶šà·à¶»à¶šà¶¸à·Š",
      track_nutrition_opt: "à¶´à·à·‚à¶«à¶º à·ƒà·„ à¶†à·„à·à¶»",
      track_mood_opt: "à¶¸à¶±à·à¶·à·à·€à¶º à·ƒà·„ à¶†à¶­à¶­à·’à¶º",
      track_sleep_opt: "à¶±à·’à¶±à·Šà¶¯à·š à¶œà·”à¶«à·à¶­à·Šà¶¸à¶šà¶·à·à·€à¶º",
      save_health_settings_btn: "à·ƒà·žà¶›à·Šâ€à¶º à·ƒà·à¶šà·ƒà·”à¶¸à·Š à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      language_label: "à¶·à·à·‚à·à·€",
      timezone_label: "à¶šà·à¶½ à¶šà¶½à·à¶´à¶º",
      save_language_settings_btn: "à¶·à·à·‚à· à·ƒà·à¶šà·ƒà·”à¶¸à·Š à·ƒà·”à¶»à¶šà·’à¶±à·Šà¶±",
      clear_local_data_btn: "à·ƒà·’à¶ºà¶½à·”à¶¸ à¶¯à·šà·à·“à¶º à¶¯à¶­à·Šà¶­ à¶¸à¶šà¶±à·Šà¶±",
      clear_data_desc: "à¶¸à·™à¶º à·„à·à¶¹à·’à¶½à·’à¶œà¶­ à¶¯à¶­à·Šà¶­ à¶¸à¶šà· à¶¯à¶¸à¶±à·” à¶‡à¶­ à¶±à¶¸à·”à¶­à·Š à·ƒà·šà·€à·à¶¯à·à¶ºà¶šà¶ºà·š à¶‡à¶­à·’ à¶”à¶¶à¶œà·š à¶œà®¿à¶«à·”à¶¸à¶§ à¶¶à¶½à¶´à·à¶±à·Šà¶±à·š à¶±à·à¶­.",
      clinic: "à·ƒà·à¶ºà¶±à¶º",
      role_patient: "à¶»à·à¶œà·’à¶ºà·",
      fertile_window_status: "à·ƒà¶»à·” à¶šà·à¶½à¶º",
      days: "à¶¯à·’à¶±",
      day: "à¶¯à·’à¶±à¶º",
      lifestyle_log_title: "à¶¢à·“à·€à¶± à¶»à¶§à· à·ƒà¶§à·„à¶±",
      track_lifestyle_desc: "à¶”à¶¶à·š PCOS à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶µà¶½à¶¯à·à¶ºà·“ à¶½à·™à·ƒ à¶šà·…à¶¸à¶±à·à¶šà¶»à¶«à¶º à¶šà·’à¶»à·“à¶¸ à·ƒà¶³à·„à· à¶”à¶¶à·š à¶†à·„à·à¶» à·€à·šà¶½, à·€à·Šâ€à¶ºà·à¶ºà·à¶¸, à·ƒà¶¢à¶½à¶±à¶º à·ƒà·„ à¶±à·’à¶±à·Šà¶¯ à¶±à·’à¶»à·“à¶šà·Šà·‚à¶«à¶º à¶šà¶»à¶±à·Šà¶±.",
      meal_log: "à¶†à·„à·à¶» à·ƒà¶§à·„à¶±",
      exercise_log: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à·ƒà¶§à·„à¶±",
      hydration_log: "à¶¢à¶½ à¶´à¶»à·’à¶·à·à¶¢à¶± à·ƒà¶§à·„à¶±",
      sleep_log: "à¶±à·’à¶±à·Šà¶¯ à·ƒà¶§à·„à¶±",
      search_logs_placeholder: "à·ƒà¶§à·„à¶±à·Š à·ƒà·œà¶ºà¶±à·Šà¶±â€¦",
      select_type: "à·€à¶»à·Šà¶œà¶º à¶­à·à¶»à¶±à·Šà¶±â€¦",
      meal_notes_placeholder: "à¶”à¶¶à¶§ à·„à·à¶Ÿà·”à¶«à·š à¶šà·™à·ƒà·šà¶¯? à¶ºà¶¸à·Š à¶»à·à¶œ à¶½à¶šà·Šà·‚à¶« à¶­à·’à¶¶à·šà¶¯?",
      action: "à¶šà·Šâ€à¶»à·’à¶ºà·à·€",
      food_categories: "à¶†à·„à·à¶» à·€à¶»à·Šà¶œà·“à¶šà¶»à¶«à¶º",
      records: "à·ƒà¶§à·„à¶±à·Š",
      log_meal_title: "à¶”à¶¶à·š à¶†à·„à·à¶» à·€à·šà¶½ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      meal_name_label: "à¶†à·„à·à¶»à¶ºà·š à¶±à¶¸",
      meal_time_label: "à¶†à·„à·à¶» à¶œà¶­à·Š à·€à·šà¶½à·à·€",
      meal_type_label: "à¶†à·„à·à¶» à·€à¶»à·Šà¶œà¶º",
      breakfast: "à¶‹à¶¯à·‘à·ƒà¶± à¶†à·„à·à¶»à¶º",
      lunch: "à¶¯à·’à·€à· à¶†à·„à·à¶»à¶º",
      dinner: "à¶»à·à¶­à·Šâ€à¶»à·“ à¶†à·„à·à¶»à¶º",
      snack: "à¶…à¶­à·”à¶»à·” à¶´à·ƒ",
      dietary_tags: "à¶†à·„à·à¶» à¶§à·à¶œà·Š",
      high_protein: "à¶‰à·„à·… à¶´à·Šâ€à¶»à·à¶§à·“à¶±à·Š",
      low_carb: "à¶…à¶©à·” à¶šà·à¶¶à·à·„à¶ºà·’à¶©à·Šâ€à¶»à·šà¶§à·Š",
      vegetarian: "à¶±à·’à¶»à·Šà¶¸à·à¶‚à·",
      dairy_free: "à¶šà·’à¶»à·’ à¶»à·„à·’à¶­",
      gluten_free: "à¶œà·Šà¶½à·–à¶§à¶±à·Š à¶»à·„à·’à¶­",
      sugar_free: "à·ƒà·“à¶±à·’ à¶»à·„à·’à¶­",
      portions_label: "à¶šà·œà¶§à·ƒà·Š à¶´à·Šâ€à¶»à¶¸à·à¶«à¶º",
      log_meal_btn: "à¶†à·„à·à¶» à·€à·šà¶½ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      log_exercise_title: "à¶”à¶¶à·š à·€à·Šâ€à¶ºà·à¶ºà·à¶¸à¶º à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      exercise_name_label: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸à¶ºà·š à¶±à¶¸",
      duration_label: "à¶šà·à¶½à¶º (à·€à·’à¶±à·à¶©à·’)",
      intensity_label: "à¶­à·“à·€à·Šâ€à¶»à¶­à·à·€à¶º",
      low: "à¶…à¶©à·”",
      moderate: "à¶¸à¶°à·Šâ€à¶ºà¶¸",
      high: "à¶‰à·„à·…",
      calories_label: "à¶¯à·à·€à·“ à¶œà·’à¶º à¶šà·à¶½à¶»à·’ (à¶¯à·… à·€à·à¶ºà·™à¶±à·Š)",
      log_exercise_btn: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸à¶º à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      hydration_title: "à¶¢à¶½ à¶´à¶»à·’à¶·à·à¶¢à¶± à¶½à·”à·„à·”à¶¶à·à¶³à·“à¶¸",
      add_water: "à¶¢à¶½à¶º à¶‘à¶šà·Š à¶šà¶»à¶±à·Šà¶±",
      custom_amount: "à¶…à¶·à·’à¶»à·”à¶ à·’ à¶´à·Šâ€à¶»à¶¸à·à¶«à¶º (ml)",
      hydration_history: "à¶¢à¶½ à¶´à¶»à·’à¶·à·à¶¢à¶± à¶‰à¶­à·’à·„à·à·ƒà¶º",
      log_sleep_title: "à¶”à¶¶à·š à¶±à·’à¶±à·Šà¶¯ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      sleep_duration_label: "à¶šà·à¶½à¶º (à¶´à·à¶º)",
      sleep_quality_label: "à¶±à·’à¶±à·Šà¶¯à·š à¶œà·”à¶«à·à¶­à·Šà¶¸à¶šà¶·à·à·€à¶º",
      poor: "à¶¯à·”à¶»à·Šà·€à¶½",
      fair: "à·ƒà·‘à·„à·™à¶±",
      good: "à·„à·œà¶³",
      excellent: "à·€à·’à·à·’à·‚à·Šà¶§",
      wake_up_feeling: "à¶…à·€à¶¯à·’ à·€à¶± à·€à·’à¶§ à¶¯à·à¶±à·™à¶± à·„à·à¶Ÿà·“à¶¸",
      refreshed: "à¶´à·Šâ€à¶»à¶¶à·à¶°à¶¸à¶­à·Š",
      tired: "à·€à·™à·„à·™à·ƒà¶šà¶»",
      groggy: "à¶šà¶½à¶¶à¶½à¶šà·à¶»à·“",
      log_sleep_btn: "à¶±à·’à¶±à·Šà¶¯ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶±à·Šà¶±",
      history: "à¶‰à¶­à·’à·„à·à·ƒà¶º",
      no_meals_today: "à¶…à¶¯ à¶¯à·’à¶± à·ƒà¶³à·„à· à¶†à·„à·à¶» à·ƒà¶§à·„à¶±à·Š à¶šà¶» à¶±à·œà¶¸à·à¶­.",
      no_exercises_today: "à¶…à¶¯ à¶¯à·’à¶± à·ƒà¶³à·„à· à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à·ƒà¶§à·„à¶±à·Š à¶šà¶» à¶±à·œà¶¸à·à¶­.",
      no_sleep_logged: "à¶¸à·‘à¶­à¶šà¶¯à·“ à¶±à·’à¶±à·Šà¶¯ à¶¯à¶­à·Šà¶­ à·ƒà¶§à·„à¶±à·Š à¶šà¶» à¶±à·œà¶¸à·à¶­.",
      daily_total: "à¶¯à·›à¶±à·’à¶š à¶‘à¶šà¶­à·”à·€",
      portions_unit: "à¶šà·œà¶§à·ƒà·Š",
      minutes_unit: "à·€à·’à¶±à·à¶©à·’",
      calories_unit: "kcal",
      hours_unit: "à¶´à·à¶º",
      entry_deleted: "âœ“ à·ƒà¶§à·„à¶± à¶¸à¶šà· à¶¯à¶¸à¶± à¶½à¶¯à·“",
      meal_added: "âœ“ à¶†à·„à·à¶» à·€à·šà¶½ à¶‘à¶šà·Š à¶šà¶»à¶± à¶½à¶¯à·“!",
      exercise_added: "âœ“ à·€à·Šâ€à¶ºà·à¶ºà·à¶¸à¶º à¶‘à¶šà·Š à¶šà¶»à¶± à¶½à¶¯à·“!",
      water_added: "âœ“ à¶¢à¶½ à¶´à¶»à·’à¶·à·à¶¢à¶±à¶º à¶ºà·à·€à¶­à·Šà®•à¯à®•à·à¶½à·“à¶± à¶šà¶»à¶± à¶½à¶¯à·“!",
      sleep_added: "âœ“ à¶±à·’à¶±à·Šà¶¯ à¶¯à¶­à·Šà¶­ à·ƒà·”à¶»à¶šà·’à¶± à¶½à¶¯à·“!",
      fill_fields_error: "à¶šà¶»à·”à¶«à·à¶šà¶» à·ƒà·’à¶ºà¶½à·”à¶¸ à¶…à·€à·à·Šâ€à¶º à¶šà·Šà·‚à·šà¶­à·Šâ€à¶» à¶´à·”à¶»à·€à¶±à·Šà¶±.",
      delete_confirm: "à¶¸à·™à¶¸ à·ƒà¶§à·„à¶± à¶¸à¶šà· à¶¯à·à¶¸à·“à¶¸à¶§ à¶”à¶¶à¶§ à·€à·’à·à·Šà·€à·à·ƒà¶¯?",
      meal_saved_success: "à¶†à·„à·à¶» à·€à·šà¶½ à·ƒà·à¶»à·Šà¶®à¶šà·€ à·ƒà·”à¶»à¶šà·Šà¶± à¶½à¶¯à·“! ðŸ¥—",
      exercise_saved_success: "à·€à·Šâ€à¶ºà·à¶ºà·à¶¸ à·ƒà·”à¶»à¶šà·Šà¶± à¶½à¶¯à·“! ðŸƒ",
      water_logged_success: "à¶¢à¶½ à¶´à¶»à·’à¶·à·à¶¢à¶±à¶º à¶ºà·à·€à¶­à·Šà¶šà·à¶½à·“à¶± à¶šà¶»à¶± à¶½à¶¯à·“! ðŸ’§",
      sleep_logged_success: "à¶±à·’à¶±à·Šà¶¯ à·ƒà¶§à·„à¶±à·Š à¶šà¶»à¶± à¶½à¶¯à·“! ðŸ˜´",
      amount: "à¶´à·Šâ€à¶»à¶¸à·à¶«à¶º",
      day_total: "à¶¯à·›à¶±à·’à¶š à¶‘à¶šà¶­à·”à·€",
      logged_at: "à·ƒà¶§à·„à¶±à·Š à¶šà·… à·€à·šà¶½à·à·€",
      received: "à¶½à·à¶¶à·“ à¶‡à¶­",
      processing: "à·ƒà·à¶šà·ƒà·™à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“",
      sync_complete_msg: "à·ƒà¶¸à¶¸à·”à·„à·”à¶»à·Šà¶­ à¶šà·’à¶»à·“à¶¸ à¶…à·€à·ƒà¶±à·Š! à¶´à·Šâ€à¶»à¶­à·’à¶µà¶½à¶º à¶´à¶»à·“à¶šà·Šà·‚à¶« à·€à·à¶»à·Šà¶­à· à·ƒà·„ à¶¸à¶œà·š à·€à·à¶»à·Šà¶­à· à·€à·™à¶­ à¶‘à¶šà·Š à¶šà¶»à¶± à¶½à¶¯à·“.",
      error_comm: "à·ƒà¶±à·Šà¶±à·’à·€à·šà¶¯à¶± à¶¯à·à·‚à¶ºà¶šà·’.",
      removing_msg: "à¶‰à·€à¶­à·Š à¶šà¶»à¶¸à·’à¶±à·Š à¶´à·€à¶­à·“...",
      unknown_date: "à¶±à·œà¶¯à¶±à·Šà¶±à· à¶¯à·’à¶±à¶ºà¶šà·Š",
      general: "à·ƒà·à¶¸à·à¶±à·Šâ€à¶º",
      not_specified: "à·ƒà¶³à·„à¶±à·Š à¶šà¶» à¶±à·à¶­",
      test_name_placeholder: "à¶‹à¶¯à·: à·ƒà¶¸à·Šà¶´à·–à¶»à·Šà¶« à¶»à·”à¶°à·’à¶» à¶´à¶»à·“à¶šà·Šà·‚à·à·€, HbA1c",
      hospital_name_placeholder: "à¶‹à¶¯à·: à¶†à·ƒà·’à¶»à·’ à·„à·™à¶½à·Šà¶­à·Š",
      doctor_name_placeholder: "à¶‹à¶¯à·: à·€à·›à¶¯à·Šâ€à¶º à¶´à·™à¶»à·šà¶»à·",
      upload_size_limit: "à¶‹à¶´à¶»à·’à¶¸ à¶´à·Šâ€à¶»à¶¸à·à¶«à¶º 10MB (PDF, JPG, PNG)"
    },
    ta: {
      dashboard: "à®Ÿà®¾à®·à¯à®ªà¯‹à®°à¯à®Ÿà¯",
      settings: "à®…à®®à¯ˆà®ªà¯à®ªà¯à®•à®³à¯",
      profile: "à®šà¯à®¯à®µà®¿à®µà®°à®®à¯",
      logout: "à®µà¯†à®³à®¿à®¯à¯‡à®±à¯",
      notifications: "à®…à®±à®¿à®µà®¿à®ªà¯à®ªà¯à®•à®³à¯",
      messages: "à®šà¯†à®¯à¯à®¤à®¿à®•à®³à¯",
      symptoms: "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯",
      cycle: "à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯ à®šà¯à®´à®±à¯à®šà®¿",
      reports: "à®…à®±à®¿à®•à¯à®•à¯ˆà®•à®³à¯",
      lifestyle: "à®µà®¾à®´à¯à®•à¯à®•à¯ˆ à®®à¯à®±à¯ˆ à®ªà®¤à®¿à®µà¯",
      appointments: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯",
      lab_results: "à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯",
      hospital: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ",
      welcome: "à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®µà®°à¯à®•",
      health_prefs: "à®šà¯à®•à®¾à®¤à®¾à®° à®µà®¿à®°à¯à®ªà¯à®ªà®™à¯à®•à®³à¯",
      display_appearance: "à®¤à¯‹à®±à¯à®±à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®•à®¾à®Ÿà¯à®šà®¿",
      language_region: "à®®à¯Šà®´à®¿ à®®à®±à¯à®±à¯à®®à¯ à®ªà®¿à®°à®¾à®¨à¯à®¤à®¿à®¯à®®à¯",
      search_placeholder: "à®¤à¯‡à®Ÿà¯...",
      last_cycle: "à®•à®Ÿà®¨à¯à®¤ à®šà¯à®´à®±à¯à®šà®¿",
      next_period: "à®…à®Ÿà¯à®¤à¯à®¤ à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯",
      lifestyle_score: "à®µà®¾à®´à¯à®•à¯à®•à¯ˆ à®®à¯à®±à¯ˆ à®®à®¤à®¿à®ªà¯à®ªà¯†à®£à¯",
      hydration: "à®¨à¯€à®°à¯‡à®±à¯à®±à®®à¯",
      weight: "à®Žà®Ÿà¯ˆ",
      mood: "à®®à®©à®¨à®¿à®²à¯ˆ",
      sleep: "à®¤à¯‚à®•à¯à®•à®®à¯",
      todays_insights: "à®‡à®©à¯à®±à¯ˆà®¯ à®¨à¯à®£à¯à®£à®±à®¿à®µà¯",
      upcoming_events: "à®µà®°à®µà®¿à®°à¯à®•à¯à®•à¯à®®à¯ à®¨à®¿à®•à®´à¯à®µà¯à®•à®³à¯",
      quick_actions: "à®µà®¿à®°à¯ˆà®µà®¾à®© à®šà¯†à®¯à®²à¯à®•à®³à¯",
      track_pill: "à®®à®¾à®¤à¯à®¤à®¿à®°à¯ˆ à®ªà®¤à®¿à®µà¯",
      log_water: "à®¤à®£à¯à®£à¯€à®°à¯ à®ªà®¤à®¿à®µà¯",
      add_symptom: "à®…à®±à®¿à®•à¯à®±à®¿ à®šà¯‡à®°à¯",
      daily_goal: "à®¤à®¿à®©à®šà®°à®¿ à®‡à®²à®•à¯à®•à¯",
      average: "à®šà®°à®¾à®šà®°à®¿",
      view_all: "à®…à®©à¯ˆà®¤à¯à®¤à¯ˆà®¯à¯à®®à¯ à®ªà®¾à®°à¯",
      cycle_length: "à®šà¯à®´à®±à¯à®šà®¿ à®¨à¯€à®³à®®à¯ (à®¨à®¾à®Ÿà¯à®•à®³à¯)",
      symptoms_logged: "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®©",
      reports_total: "à®…à®±à®¿à®•à¯à®•à¯ˆà®•à®³à¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®Ÿà®©",
      appt_days: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà®¿à®±à¯à®•à®¾à®© à®¨à®¾à®Ÿà¯à®•à®³à¯",
      recent_symptoms: "à®šà®®à¯€à®ªà®¤à¯à®¤à®¿à®¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯",
      recent_activity: "à®šà®®à¯€à®ªà®¤à¯à®¤à®¿à®¯ à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯",
      health_progress: "à®šà¯à®•à®¾à®¤à®¾à®° à®®à¯à®©à¯à®©à¯‡à®±à¯à®±à®®à¯",
      welcome_subtitle: "à®‡à®¨à¯à®¤ à®µà®¾à®° à®‰à®™à¯à®•à®³à¯ à®ªà®¿.à®šà®¿.à®“.à®Žà®¸à¯ à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯à®•à®³à®¿à®©à¯ à®šà¯à®°à¯à®•à¯à®•à®®à¯ à®‡à®™à¯à®•à¯‡. à®¤à¯Šà®Ÿà®°à¯à®¨à¯à®¤à¯ à®šà®¿à®±à®ªà¯à®ªà®¾à®•à®šà¯ à®šà¯†à®¯à¯à®¯à¯à®™à¯à®•à®³à¯!",
      legend_period: "à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯",
      legend_fertile: "à®•à®°à¯à®µà¯à®±à¯à®¤à®²à¯",
      legend_ovulation: "à®•à®°à¯à®®à¯à®Ÿà¯à®Ÿà¯ˆ à®µà¯†à®³à®¿à®¯à¯‡à®±à¯à®±à®®à¯",
      legend_today: "à®‡à®©à¯à®±à¯",
      loading: "à®à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯...",
      cycle_label: "à®šà¯à®´à®±à¯à®šà®¿",
      flow: "à®ªà¯‹à®•à¯à®•à¯",
      no_cycle: "à®‡à®©à¯à®©à¯à®®à¯ à®¤à®°à®µà¯ à®‡à®²à¯à®²à¯ˆ â€”",
      no_reports: "à®‡à®©à¯à®©à¯à®®à¯ à®…à®±à®¿à®•à¯à®•à¯ˆà®•à®³à¯ à®‡à®²à¯à®²à¯ˆ â€”",
      no_visits: "à®µà®°à®µà®¿à®°à¯à®•à¯à®•à¯à®®à¯ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯ à®‡à®²à¯à®²à¯ˆ",
      start_tracking: "à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•à®¤à¯ à®¤à¯Šà®Ÿà®™à¯à®•à¯à®™à¯à®•à®³à¯ â†’",
      upload_one: "à®’à®©à¯à®±à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà¯à®®à¯ â†’",
      meals_today: "à®‡à®©à¯à®±à¯ˆà®¯ à®‰à®£à®µà¯à®•à®³à¯",
      water_ml: "à®¤à®£à¯à®£à¯€à®°à¯ (à®®à®¿.à®²à®¿)",
      exercises: "à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿à®•à®³à¯",
      sleep_hrs: "à®¤à¯‚à®•à¯à®•à®®à¯ (à®®à®£à®¿)",
      water_goal: "à®¤à®£à¯à®£à¯€à®°à¯ à®‡à®²à®•à¯à®•à¯",
      patient_portal: "à®¨à¯‹à®¯à®¾à®³à®¿ à®ªà¯‹à®°à¯à®Ÿà®²à¯",
      upload_new_report: "à®ªà¯à®¤à®¿à®¯ à®…à®±à®¿à®•à¯à®•à¯ˆà®¯à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà¯à®®à¯",
      log_activities: "à®‡à®©à¯à®±à¯ˆà®¯ à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯à®•à®³à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®•",
      log_first_cycle: "à®šà¯à®´à®±à¯à®šà®¿à®¯à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯",
      log_meal: "à®‰à®£à®µà¯ à®ªà®¤à®¿à®µà¯",
      log_exercise: "à®ªà®¯à®¿à®±à¯à®šà®¿ à®ªà®¤à®¿à®µà¯",
      log_sleep: "à®¤à¯‚à®•à¯à®• à®ªà®¤à®¿à®µà¯",
      patient_dashboard: "à®¨à¯‹à®¯à®¾à®³à®¿ à®Ÿà®¾à®·à¯à®ªà¯‹à®°à¯à®Ÿà¯",
      track_symptoms_title: "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®•à¯ à®•à®£à¯à®•à®¾à®£à®¿à®¤à¯à®¤à®²à¯",
      log_your_symptoms: "à®‰à®™à¯à®•à®³à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®•",
      search_symptoms: "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®¤à¯ à®¤à¯‡à®Ÿà¯à®™à¯à®•à®³à¯...",
      date: "à®¤à¯‡à®¤à®¿",
      time: "à®¨à¯‡à®°à®®à¯",
      physical_symptoms: "à®‰à®Ÿà®²à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯",
      cramps: "à®¤à®šà¯ˆà®ªà¯à®ªà®¿à®Ÿà®¿à®ªà¯à®ªà¯",
      fatigue: "à®šà¯‹à®°à¯à®µà¯",
      headache: "à®¤à®²à¯ˆà®µà®²à®¿",
      bloating: "à®µà¯€à®•à¯à®•à®®à¯",
      skin_hair: "à®šà®°à¯à®®à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®®à¯à®Ÿà®¿",
      acne: "à®®à¯à®•à®ªà¯à®ªà®°à¯",
      hair_loss: "à®®à¯à®Ÿà®¿ à®‰à®¤à®¿à®°à¯à®¤à®²à¯",
      excess_hair_growth: "à®…à®¤à®¿à®•à®ªà¯à®ªà®Ÿà®¿à®¯à®¾à®© à®®à¯à®Ÿà®¿ à®µà®³à®°à¯à®šà¯à®šà®¿",
      dark_patches: "à®•à®°à¯à®®à¯ˆà®¯à®¾à®© à®¤à®¿à®Ÿà¯à®Ÿà¯à®•à®³à¯",
      emotional_mental: "à®‰à®£à®°à¯à®šà¯à®šà®¿ à®®à®±à¯à®±à¯à®®à¯ à®®à®©à®¨à®¿à®²à¯ˆ",
      mood_swings: "à®®à®©à®¨à®¿à®²à¯ˆ à®®à®¾à®±à¯à®±à®™à¯à®•à®³à¯",
      anxiety: "à®•à®µà®²à¯ˆ",
      depression: "à®®à®©à®šà¯à®šà¯‹à®°à¯à®µà¯",
      stress: "à®®à®© à®…à®´à¯à®¤à¯à®¤à®®à¯",
      reproductive: "à®‡à®©à®ªà¯à®ªà¯†à®°à¯à®•à¯à®•à®®à¯",
      irregular_period: "à®’à®´à¯à®™à¯à®•à®±à¯à®± à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯",
      heavy_bleeding: "à®…à®¤à®¿à®• à®‡à®°à®¤à¯à®¤à®ªà¯à®ªà¯‹à®•à¯à®•à¯",
      light_bleeding: "à®•à¯à®±à¯ˆà®µà®¾à®© à®‡à®°à®¤à¯à®¤à®ªà¯à®ªà¯‹à®•à¯à®•à¯",
      pelvic_pain: "à®‡à®Ÿà¯à®ªà¯à®ªà¯ à®µà®²à®¿",
      overall_severity: "à®’à®Ÿà¯à®Ÿà¯à®®à¯Šà®¤à¯à®¤ à®¤à¯€à®µà®¿à®°à®®à¯",
      mild: "à®²à¯‡à®šà®¾à®©",
      moderate: "à®®à®¿à®¤à®®à®¾à®©",
      severe: "à®•à®Ÿà¯à®®à¯ˆà®¯à®¾à®©",
      additional_notes: "à®•à¯‚à®Ÿà¯à®¤à®²à¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯",
      notes_placeholder: "à®‰à®™à¯à®•à®³à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®ªà¯ à®ªà®±à¯à®±à®¿à®¯ à®•à¯‚à®Ÿà¯à®¤à®²à¯ à®µà®¿à®µà®°à®™à¯à®•à®³à¯...",
      save_symptoms: "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      cancel: "à®°à®¤à¯à®¤à¯ à®šà¯†à®¯à¯",
      symptom_history: "à®…à®±à®¿à®•à¯à®±à®¿ à®µà®°à®²à®¾à®±à¯",
      no_symptoms_logged: "à®‡à®©à¯à®©à¯à®®à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.",
      clear: "à®…à®´à®¿à®•à¯à®•à®µà¯à®®à¯",
      back: "à®ªà®¿à®©à¯à®©à®¾à®²à¯",
      your_symptom_history: "à®‰à®™à¯à®•à®³à¯ à®…à®±à®¿à®•à¯à®±à®¿ à®µà®°à®²à®¾à®±à¯",
      weight_change: "à®Žà®Ÿà¯ˆ à®®à®¾à®±à¯à®±à®®à¯",
      joint_pain: "à®®à¯‚à®Ÿà¯à®Ÿà¯ à®µà®²à®¿",
      hair_growth: "à®…à®¤à®¿à®•à®ªà¯à®ªà®Ÿà®¿à®¯à®¾à®© à®®à¯à®Ÿà®¿ à®µà®³à®°à¯à®šà¯à®šà®¿",
      skin_darkening: "à®•à®°à¯à®®à¯ˆà®¯à®¾à®© à®¤à®¿à®Ÿà¯à®Ÿà¯à®•à®³à¯",
      section_main: "à®®à¯à®•à¯à®•à®¿à®¯",
      section_health: "à®šà¯à®•à®¾à®¤à®¾à®°",
      section_account: "à®•à®£à®•à¯à®•à¯",
      current_phase: "à®¤à®±à¯à®ªà¯‹à®¤à¯ˆà®¯ à®¨à®¿à®²à¯ˆ",
      period_duration_label: "à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯ à®•à®¾à®²à®®à¯",
      predicted: "à®•à®£à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      cycle_calendar: "à®®à®¾à®¤à®¾à®¨à¯à®¤à®¿à®° à®šà¯à®´à®±à¯à®šà®¿ à®•à®¾à®²à®£à¯à®Ÿà®°à¯",
      previous: "à®®à¯à®¨à¯à®¤à¯ˆà®¯",
      next: "à®…à®Ÿà¯à®¤à¯à®¤à¯",
      sun: "à®žà®¾à®¯à®¿à®±à¯", mon: "à®¤à®¿à®™à¯à®•à®³à¯", tue: "à®šà¯†à®µà¯à®µà®¾à®¯à¯", wed: "à®ªà¯à®¤à®©à¯", thu: "à®µà®¿à®¯à®¾à®´à®©à¯", fri: "à®µà¯†à®³à¯à®³à®¿", sat: "à®šà®©à®¿",
      period_start_date: "à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯ à®¤à¯Šà®Ÿà®™à¯à®•à¯à®®à¯ à®¤à¯‡à®¤à®¿",
      period_end_date: "à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯ à®®à¯à®Ÿà®¿à®¯à¯à®®à¯ à®¤à¯‡à®¤à®¿",
      flow_intensity: "à®“à®Ÿà¯à®Ÿ à®šà¯†à®±à®¿à®µà¯",
      select_flow: "à®šà¯†à®±à®¿à®µà¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯...",
      light_flow: "à®²à¯‡à®šà®¾à®©",
      normal_flow: "à®šà®¾à®¤à®¾à®°à®£",
      heavy_flow: "à®…à®¤à®¿à®•à®®à®¾à®©",
      irregularities_mood_notes: "à®à®¤à¯‡à®©à¯à®®à¯ à®®à¯à®±à¯ˆà®¯à®±à¯à®± à®¤à®©à¯à®®à¯ˆà®•à®³à¯, à®µà®²à®¿ à®¨à®¿à®²à¯ˆà®•à®³à¯, à®®à®©à®¨à®¿à®²à¯ˆ à®®à®¾à®±à¯à®±à®™à¯à®•à®³à¯ˆà®•à¯ à®•à®µà®©à®¿à®•à¯à®•à®µà¯à®®à¯...",
      save_cycle_data: "à®¤à®°à®µà¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      cycle_history: "à®šà¯à®´à®±à¯à®šà®¿ à®µà®°à®²à®¾à®±à¯",
      started_on: "à®¤à¯Šà®Ÿà®™à¯à®•à®¿à®¯à®¤à¯",
      medical_documents: "à®Žà®©à®¤à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®†à®µà®£à®™à¯à®•à®³à¯",
      upload_report: "à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà¯à®®à¯",
      filter_by_type: "ðŸ” à®µà®•à¯ˆà®ªà¯à®ªà®Ÿà®¿ à®µà®Ÿà®¿à®•à®Ÿà¯à®Ÿà®µà¯à®®à¯...",
      total_files: "à®®à¯Šà®¤à¯à®¤ à®•à¯‹à®ªà¯à®ªà¯à®•à®³à¯",
      added_this_month: "à®‡à®¨à¯à®¤ à®®à®¾à®¤à®®à¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      added_this_year: "à®‡à®¨à¯à®¤ à®†à®£à¯à®Ÿà¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      search_reports_placeholder: "à®ªà¯†à®¯à®°à¯ à®…à®²à¯à®²à®¤à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ à®®à¯‚à®²à®®à¯ à®¤à¯‡à®Ÿà®µà¯à®®à¯...",
      all_documents: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®†à®µà®£à®™à¯à®•à®³à¯",
      all_lab_results: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯",
      all_scans: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®¸à¯à®•à¯‡à®©à¯ à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯",
      no_records_found: "à®†à®µà®£à®™à¯à®•à®³à¯ à®Žà®¤à¯à®µà¯à®®à¯ à®‡à®²à¯à®²à¯ˆ",
      no_records_msg: "à®‡à®¨à¯à®¤ à®ªà®¿à®°à®¿à®µà®¿à®²à¯ à®¨à¯€à®™à¯à®•à®³à¯ à®‡à®©à¯à®©à¯à®®à¯ à®Žà®¨à¯à®¤ à®†à®µà®£à®™à¯à®•à®³à¯ˆà®¯à¯à®®à¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà®¿à®²à¯à®²à¯ˆ.",
      view: "à®ªà®¾à®°à¯",
      download: "à®ªà®¤à®¿à®µà®¿à®±à®•à¯à®•à®®à¯",
      remove: "à®¨à¯€à®•à¯à®•à¯",
      records: "à®ªà®¤à®¿à®µà¯à®•à®³à¯",
      records_today: "à®‡à®©à¯à®±à¯ˆà®¯ à®ªà®¤à®¿à®µà¯à®•à®³à¯",
      amount: "à®…à®³à®µà¯",
      day_total: "à®¤à®¿à®©à®šà®°à®¿ à®®à¯Šà®¤à¯à®¤à®®à¯",
      logged_at: "à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿ à®¨à¯‡à®°à®®à¯",
      action: "à®¨à®Ÿà®µà®Ÿà®¿à®•à¯à®•à¯ˆ",
      log_meal_hint: "à®®à¯‡à®²à¯‡ à®‰à®³à¯à®³ à®ªà®Ÿà®¿à®µà®¤à¯à®¤à¯ˆ à®ªà¯‚à®°à¯à®¤à¯à®¤à®¿ à®šà¯†à®¯à¯à®¤à¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      log_exercise_hint: "à®‰à®™à¯à®•à®³à¯ à®®à¯à®¤à®²à¯ à®ªà®¯à®¿à®±à¯à®šà®¿à®¯à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯",
      log_water_hint: "à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯ à®ªà®Ÿà¯à®Ÿà®©à¯ˆ à®…à®´à¯à®¤à¯à®¤à®µà¯à®®à¯",
      log_sleep_hint: "à®¤à¯‚à®•à¯à®•à®¤à¯ à®¤à®°à®µà¯ˆ à®®à¯‡à®²à¯‡ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯",
      appointment_missed: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯ à®¤à®µà®±à®µà®¿à®Ÿà®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯: {hospital} à®‡à®²à¯ {reason}",
      hospital_registered_activity: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆà®¯à®¿à®²à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯: {name}",
      profile_title: "à®Žà®©à®¤à¯ à®šà¯à®¯à®µà®¿à®µà®°à®®à¯",
      profile_subtitle: "à®‰à®™à¯à®•à®³à¯ à®¤à®©à®¿à®ªà¯à®ªà®Ÿà¯à®Ÿ à®®à®±à¯à®±à¯à®®à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®¤à®•à®µà®²à¯à®•à®³à¯ˆ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®•à®µà¯à®®à¯",
      personal_info: "à®¤à®©à®¿à®ªà¯à®ªà®Ÿà¯à®Ÿ à®¤à®•à®µà®²à¯",
      full_name_label: "à®®à¯à®´à¯ à®ªà¯†à®¯à®°à¯",
      email_address_label: "à®®à®¿à®©à¯à®©à®žà¯à®šà®²à¯ à®®à¯à®•à®µà®°à®¿",
      phone_number_label: "à®¤à¯Šà®²à¯ˆà®ªà¯‡à®šà®¿ à®Žà®£à¯",
      dob_label: "à®ªà®¿à®±à®¨à¯à®¤ à®¤à¯‡à®¤à®¿",
      gender_label: "à®ªà®¾à®²à®¿à®©à®®à¯",
      blood_group_label: "à®‡à®°à®¤à¯à®¤ à®µà®•à¯ˆ",
      security_password: "à®ªà®¾à®¤à¯à®•à®¾à®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯",
      current_password: "à®¤à®±à¯à®ªà¯‹à®¤à¯ˆà®¯ à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯",
      new_password: "à®ªà¯à®¤à®¿à®¯ à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯",
      confirm_new_password: "à®ªà¯à®¤à®¿à®¯ à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯à®²à¯ˆ à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯",
      update_password_btn: "à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯à®²à¯ˆà®ªà¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®µà¯à®®à¯",
      data_management: "à®¤à®°à®µà¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà¯†à®¯à®°à¯à®µà¯à®¤à¯à®¤à®¿à®±à®©à¯",
      download_data_json: "à®Žà®©à®¤à¯ à®¤à®°à®µà¯ˆ à®ªà®¤à®¿à®µà®¿à®±à®•à¯à®•à¯à®• (JSON)",
      export_summary_csv: "à®®à®°à¯à®¤à¯à®¤à¯à®µ à®šà¯à®°à¯à®•à¯à®•à®¤à¯à®¤à¯ˆ à®à®±à¯à®±à¯à®®à®¤à®¿ à®šà¯†à®¯à¯ (CSV)",
      download_health_doc: "à®¤à®©à®¿à®ªà¯à®ªà®¯à®©à®¾à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®šà¯à®•à®¾à®¤à®¾à®° à®†à®µà®£à®®à¯ (TXT)",
      danger_zone: "à®†à®ªà®¤à¯à®¤à¯ à®®à®£à¯à®Ÿà®²à®®à¯",
      deactivate_account: "à®•à®£à®•à¯à®•à¯ˆ à®®à¯à®Ÿà®•à¯à®•à®µà¯à®®à¯",
      confirm_deactivation_title: "à®®à¯à®Ÿà®•à¯à®•à®¤à¯à®¤à¯ˆ à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯",
      deactivate_msg: "à®‡à®¨à¯à®¤ à®•à®£à®•à¯à®•à¯ 30 à®¨à®¾à®Ÿà¯à®•à®³à¯à®•à¯à®•à¯à®³à¯ à®‰à®³à¯à®¨à¯à®´à¯ˆà®¯à®µà®¿à®²à¯à®²à¯ˆ à®Žà®©à¯à®±à®¾à®²à¯, à®…à®¤à¯ à®¨à®¿à®°à®¨à¯à®¤à®°à®®à®¾à®• à®¨à¯€à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®®à¯.",
      enter_password_confirm: "à®®à¯à®Ÿà®•à¯à®•à®¤à¯à®¤à¯ˆ à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤ à®‰à®™à¯à®•à®³à¯ à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯à®²à¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà®µà¯à®®à¯:",
      confirm_logout: "à®‰à®±à¯à®¤à®¿à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®¿ à®µà¯†à®³à®¿à®¯à¯‡à®±à¯",
      keep_account: "à®Žà®©à®¤à¯ à®•à®£à®•à¯à®•à¯ˆ à®µà¯ˆà®¤à¯à®¤à®¿à®°à¯à®™à¯à®•à®³à¯",
      edit_personal_info_btn: "à®¤à®©à®¿à®ªà¯à®ªà®Ÿà¯à®Ÿ à®¤à®•à®µà®²à¯ˆà®¤à¯ à®¤à®¿à®°à¯à®¤à¯à®¤à®µà¯à®®à¯",
      save_changes_btn: "à®®à®¾à®±à¯à®±à®™à¯à®•à®³à¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      profile_address: "à®®à¯à®•à®µà®°à®¿",
      not_provided: "à®µà®´à®™à¯à®•à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ",
      unknown_blood: "à®¤à¯†à®°à®¿à®¯à®µà®¿à®²à¯à®²à¯ˆ",
      female: "à®ªà¯†à®£à¯",
      male: "à®†à®£à¯",
      other_gender: "à®®à®±à¯à®±à®µà¯ˆ",
      profile_updated_success: "âœ“ à®šà¯à®¯à®µà®¿à®µà®°à®®à¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯!",
      password_changed_success: "âœ“ à®•à®Ÿà®µà¯à®šà¯à®šà¯Šà®²à¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®®à®¾à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯!",
      account_deactivated_success: "à®‰à®™à¯à®•à®³à¯ à®•à®£à®•à¯à®•à¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®®à¯à®Ÿà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯. à®µà¯†à®³à®¿à®¯à¯‡à®±à¯à®•à®¿à®±à®¤à¯...",
      notifications: "à®…à®±à®¿à®µà®¿à®ªà¯à®ªà¯à®•à®³à¯",
      notifications_desc: "à®…à®±à®¿à®µà®¿à®ªà¯à®ªà¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à®¿à®©à¯ˆà®µà¯‚à®Ÿà¯à®Ÿà®²à¯à®•à®³à¯ˆà®ªà¯ à®ªà¯†à®±à¯à®µà®¤à¯ˆ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®•à®µà¯à®®à¯",
      email_notif: "à®®à®¿à®©à¯à®©à®žà¯à®šà®²à¯ à®…à®±à®¿à®µà®¿à®ªà¯à®ªà¯à®•à®³à¯",
      email_notif_desc: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®†à®°à¯‹à®•à¯à®•à®¿à®¯à®®à¯ à®ªà®±à¯à®±à®¿à®¯ à®®à®¿à®©à¯à®©à®žà¯à®šà®²à¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®ªà¯à®ªà¯à®•à®³à¯ˆà®ªà¯ à®ªà¯†à®±à¯à®™à¯à®•à®³à¯",
      sms_alerts: "SMS à®µà®¿à®´à®¿à®ªà¯à®ªà¯‚à®Ÿà¯à®Ÿà®²à¯à®•à®³à¯",
      sms_alerts_desc: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯à®•à¯à®•à®¾à®© à®•à¯à®±à¯à®žà¯à®šà¯†à®¯à¯à®¤à®¿ à®¨à®¿à®©à¯ˆà®µà¯‚à®Ÿà¯à®Ÿà®²à¯à®•à®³à¯ˆà®ªà¯ à®ªà¯†à®±à¯à®™à¯à®•à®³à¯",
      appointment_reminders: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯ à®¨à®¿à®©à¯ˆà®µà¯‚à®Ÿà¯à®Ÿà®²à¯à®•à®³à¯",
      appointment_reminders_desc: "à®¤à®¿à®Ÿà¯à®Ÿà®®à®¿à®Ÿà®ªà¯à®ªà®Ÿà¯à®Ÿ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯à®•à¯à®•à¯ à®®à¯à®©à¯ à®¨à®¿à®©à¯ˆà®µà¯‚à®Ÿà¯à®Ÿà®ªà¯ à®ªà¯†à®±à¯à®™à¯à®•à®³à¯",
      cycle_reminders: "à®šà¯à®´à®±à¯à®šà®¿ à®¨à®¿à®©à¯ˆà®µà¯‚à®Ÿà¯à®Ÿà®²à¯à®•à®³à¯",
      cycle_reminders_desc: "à®‰à®™à¯à®•à®³à¯ à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯ à®šà¯à®´à®±à¯à®šà®¿ à®¨à®¿à®•à®´à¯à®µà¯à®•à®³à¯ à®ªà®±à¯à®±à®¿ à®…à®±à®¿à®µà®¿à®•à¯à®•à®ªà¯ à®ªà¯†à®±à¯à®™à¯à®•à®³à¯",
      health_tips_articles: "à®†à®°à¯‹à®•à¯à®•à®¿à®¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®•à®Ÿà¯à®Ÿà¯à®°à¯ˆà®•à®³à¯",
      health_tips_articles_desc: "à®µà®¾à®°à®¾à®¨à¯à®¤à®¿à®° à®†à®°à¯‹à®•à¯à®•à®¿à®¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®•à®²à¯à®µà®¿ à®‰à®³à¯à®³à®Ÿà®•à¯à®•à®¤à¯à®¤à¯ˆà®ªà¯ à®ªà¯†à®±à¯à®™à¯à®•à®³à¯",
      privacy_data: "à®¤à®©à®¿à®¯à¯à®°à®¿à®®à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®¤à®°à®µà¯",
      privacy_info_banner: "à®‰à®™à¯à®•à®³à¯ à®šà¯à®•à®¾à®¤à®¾à®° à®¤à®°à®µà¯ à®•à¯à®±à®¿à®¯à®¾à®•à¯à®•à®®à¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà¯ à®ªà®¾à®¤à¯à®•à®¾à®ªà¯à®ªà®¾à®• à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯. à®‰à®™à¯à®•à®³à¯ à®’à®ªà¯à®ªà¯à®¤à®²à®¿à®©à¯à®±à®¿ à®‰à®™à¯à®•à®³à¯ à®¤à®©à®¿à®ªà¯à®ªà®Ÿà¯à®Ÿ à®¤à®•à®µà®²à¯ˆ à®’à®°à¯à®ªà¯‹à®¤à¯à®®à¯ à®®à¯‚à®©à¯à®±à®¾à®®à¯ à®¤à®°à®ªà¯à®ªà®¿à®©à®°à¯à®Ÿà®©à¯ à®ªà®•à®¿à®°à¯à®¨à¯à®¤à¯ à®•à¯Šà®³à¯à®³ à®®à®¾à®Ÿà¯à®Ÿà¯‹à®®à¯.",
      data_sharing: "à®¤à®°à®µà¯ à®ªà®•à®¿à®°à¯à®µà¯",
      data_sharing_desc: "à®•à®¿à®³à®¿à®©à®¿à®•à¯à®•à¯à®•à®³à¯ à®‰à®™à¯à®•à®³à¯ à®šà¯à®•à®¾à®¤à®¾à®° à®ªà®¤à®¿à®µà¯à®•à®³à¯ˆ à®…à®£à¯à®• à®…à®©à¯à®®à®¤à®¿à®•à¯à®•à®µà¯à®®à¯",
      research_participation: "à®†à®°à®¾à®¯à¯à®šà¯à®šà®¿ à®ªà®™à¯à®•à¯‡à®±à¯à®ªà¯",
      research_participation_desc: "à®†à®°à®¾à®¯à¯à®šà¯à®šà®¿à®¯à®¿à®²à¯ à®ªà®™à¯à®•à¯‡à®±à¯à®ªà®¤à®©à¯ à®®à¯‚à®²à®®à¯ à®ªà®¿.à®šà®¿.à®“.à®Žà®¸à¯ à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯ˆ à®®à¯‡à®®à¯à®ªà®Ÿà¯à®¤à¯à®¤ à®Žà®™à¯à®•à®³à¯à®•à¯à®•à¯ à®‰à®¤à®µà¯à®™à¯à®•à®³à¯",
      anonymous_analytics: "à®¨à®¿à®°à¯à®¨à®¾à®®à®¿à®• à®ªà®•à¯à®ªà¯à®ªà®¾à®¯à¯à®µà¯",
      anonymous_analytics_desc: "à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯à®Ÿà¯ à®ªà¯à®³à¯à®³à®¿à®µà®¿à®µà®°à®™à¯à®•à®³à¯ˆ à®…à®©à¯à®ªà¯à®ªà¯à®µà®¤à®©à¯ à®®à¯‚à®²à®®à¯ à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯à®Ÿà¯ˆ à®®à¯‡à®®à¯à®ªà®Ÿà¯à®¤à¯à®¤ à®Žà®™à¯à®•à®³à¯à®•à¯à®•à¯ à®‰à®¤à®µà¯à®™à¯à®•à®³à¯",
      theme: "à®•à®°à¯à®ªà¯à®ªà¯Šà®°à¯à®³à¯",
      light_mode: "à®’à®³à®¿ à®ªà®¯à®©à¯à®®à¯à®±à¯ˆ",
      dark_mode: "à®‡à®°à¯à®£à¯à®Ÿ à®ªà®¯à®©à¯à®®à¯à®±à¯ˆ",
      auto_system: "à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®¿ (à®…à®®à¯ˆà®ªà¯à®ªà¯)",
      primary_color: "à®®à¯à®¤à®©à¯à®®à¯ˆ à®¨à®¿à®±à®®à¯",
      text_size: "à®‰à®°à¯ˆ à®…à®³à®µà¯",
      small_size: "à®šà®¿à®±à®¿à®¯à®¤à¯",
      medium_size: "à®¨à®Ÿà¯à®¤à¯à®¤à®°à®®à¯",
      large_size: "à®ªà¯†à®°à®¿à®¯à®¤à¯",
      weight_unit: "à®Žà®Ÿà¯ˆ à®…à®²à®•à¯",
      kilograms: "à®•à®¿à®²à¯‹à®•à®¿à®°à®¾à®®à¯ (kg)",
      pounds: "à®ªà®µà¯à®£à¯à®Ÿà¯à®•à®³à¯ (lbs)",
      height_unit: "à®‰à®¯à®° à®…à®²à®•à¯",
      centimeters: "à®šà¯†à®©à¯à®Ÿà®¿à®®à¯€à®Ÿà¯à®Ÿà®°à¯ (cm)",
      feet_inches: "à®…à®Ÿà®¿ à®®à®±à¯à®±à¯à®®à¯ à®…à®™à¯à®•à¯à®²à®®à¯",
      avg_cycle_length: "à®šà®°à®¾à®šà®°à®¿ à®šà¯à®´à®±à¯à®šà®¿ à®¨à¯€à®³à®®à¯ (à®¨à®¾à®Ÿà¯à®•à®³à¯)",
      avg_period_duration: "à®šà®°à®¾à®šà®°à®¿ à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯ à®•à®¾à®²à®®à¯ (à®¨à®¾à®Ÿà¯à®•à®³à¯)",
      health_tracking_priorities: "à®šà¯à®•à®¾à®¤à®¾à®° à®•à®£à¯à®•à®¾à®£à®¿à®ªà¯à®ªà¯ à®®à¯à®©à¯à®©à¯à®°à®¿à®®à¯ˆà®•à®³à¯",
      track_symptoms_opt: "à®…à®±à®¿à®•à¯à®±à®¿ à®•à®£à¯à®•à®¾à®£à®¿à®ªà¯à®ªà¯",
      track_exercise_opt: "à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿ à®®à®±à¯à®±à¯à®®à¯ à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯",
      track_nutrition_opt: "à®Šà®Ÿà¯à®Ÿà®šà¯à®šà®¤à¯à®¤à¯ à®®à®±à¯à®±à¯à®®à¯ à®‰à®£à®µà¯",
      track_mood_opt: "à®®à®©à®¨à®¿à®²à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®®à®© à®…à®´à¯à®¤à¯à®¤à®®à¯",
      track_sleep_opt: "à®¤à¯‚à®•à¯à®•à®¤à¯à®¤à®¿à®©à¯ à®¤à®°à®®à¯",
      save_health_settings_btn: "à®šà¯à®•à®¾à®¤à®¾à®° à®…à®®à¯ˆà®ªà¯à®ªà¯à®•à®³à¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      language_label: "à®®à¯Šà®´à®¿",
      timezone_label: "à®¨à¯‡à®° à®®à®£à¯à®Ÿà®²à®®à¯",
      save_language_settings_btn: "à®®à¯Šà®´à®¿ à®…à®®à¯ˆà®ªà¯à®ªà¯à®•à®³à¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      clear_local_data_btn: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®‰à®³à¯à®³à¯‚à®°à¯ à®¤à®°à®µà¯ˆà®¯à¯à®®à¯ à®…à®´à®¿à®•à¯à®•à®µà¯à®®à¯",
      clear_data_desc: "à®‡à®¤à¯ à®¤à®±à¯à®•à®¾à®²à®¿à®• à®¤à®°à®µà¯ˆ à®…à®´à®¿à®•à¯à®•à¯à®®à¯ à®†à®©à®¾à®²à¯ à®šà¯‡à®µà¯ˆà®¯à®•à®¤à¯à®¤à®¿à®²à¯ à®‰à®³à¯à®³ à®‰à®™à¯à®•à®³à¯ à®•à®£à®•à¯à®•à¯ˆ à®ªà®¾à®¤à®¿à®•à¯à®•à®¾à®¤à¯.",
      role_patient: "à®¨à¯‹à®¯à®¾à®³à®¿",
      fertile_window_status: "à®•à®°à¯à®µà¯à®±à¯à®¤à®²à¯ à®•à®¾à®²à®®à¯",
      days: "à®¨à®¾à®Ÿà¯à®•à®³à¯",
      day: "à®¨à®¾à®³à¯",
      lifestyle_log_title: "à®µà®¾à®´à¯à®•à¯à®•à¯ˆ à®®à¯à®±à¯ˆ à®ªà®¤à®¿à®µà¯",
      track_lifestyle_title: "à®‰à®™à¯à®•à®³à¯ à®µà®¾à®´à¯à®•à¯à®•à¯ˆ à®®à¯à®±à¯ˆà®¯à¯ˆà®•à¯ à®•à®£à¯à®•à®¾à®£à®¿à®¯à¯à®™à¯à®•à®³à¯ ðŸŒ±",
      track_lifestyle_desc: "à®‰à®™à¯à®•à®³à¯ à®ªà®¿.à®šà®¿.à®“.à®Žà®¸à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆ à®¤à®¿à®±à®®à¯à®ªà®Ÿ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®• à®‰à®™à¯à®•à®³à¯ à®‰à®£à®µà¯, à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿, à®¨à¯€à®°à¯‡à®±à¯à®±à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®¤à¯‚à®•à¯à®•à®¤à¯à®¤à¯ˆ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•à®µà¯à®®à¯.",
      meal_log: "à®‰à®£à®µà¯ à®ªà®¤à®¿à®µà¯",
      exercise_log: "à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿ à®ªà®¤à®¿à®µà¯",
      hydration_log: "à®¨à¯€à®°à¯‡à®±à¯à®±à®®à¯ à®ªà®¤à®¿à®µà¯",
      sleep_log: "à®¤à¯‚à®•à¯à®• à®ªà®¤à®¿à®µà¯",
      search_logs_placeholder: "à®ªà®¤à®¿à®µà¯à®•à®³à¯ˆ à®¤à¯‡à®Ÿà¯à®™à¯à®•à®³à¯â€¦",
      select_type: "à®µà®•à¯ˆà®¯à¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯â€¦",
      meal_notes_placeholder: "à®¨à¯€à®™à¯à®•à®³à¯ à®Žà®ªà¯à®ªà®Ÿà®¿ à®‰à®£à®°à¯à®¨à¯à®¤à¯€à®°à¯à®•à®³à¯? à®à®¤à¯‡à®©à¯à®®à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯?",
      action: "à®¨à®Ÿà®µà®Ÿà®¿à®•à¯à®•à¯ˆ",
      food_categories: "à®‰à®£à®µà¯ à®µà®•à¯ˆà®•à®³à¯",
      records: "à®ªà®¤à®¿à®µà¯à®•à®³à¯",
      log_meal_title: "à®‰à®™à¯à®•à®³à¯ à®‰à®£à®µà¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®•",
      meal_name_label: "à®‰à®£à®µà®¿à®©à¯ à®ªà¯†à®¯à®°à¯",
      meal_name_placeholder: "à®Ž.à®•à®¾., à®•à®¿à®©à¯‹à®µà®¾ à®šà®¾à®²à®Ÿà¯à®Ÿà¯à®Ÿà®©à¯ à®µà®±à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®•à¯‹à®´à®¿",
      meal_time_label: "à®‰à®£à®µà¯ à®¨à¯‡à®°à®®à¯",
      meal_type_label: "à®‰à®£à®µà¯ à®µà®•à¯ˆ",
      breakfast: "à®•à®¾à®²à¯ˆ à®‰à®£à®µà¯",
      lunch: "à®®à®¤à®¿à®¯ à®‰à®£à®µà¯",
      dinner: "à®‡à®°à®µà¯ à®‰à®£à®µà¯",
      snack: "à®šà®¿à®±à¯à®±à¯à®£à¯à®Ÿà®¿",
      dietary_tags: "à®‰à®£à®µà¯ à®•à¯à®±à®¿à®šà¯à®šà¯Šà®±à¯à®•à®³à¯",
      high_protein: "à®…à®¤à®¿à®• à®ªà¯à®°à®¤à®®à¯",
      low_carb: "à®•à¯à®±à¯ˆà®¨à¯à®¤ à®•à®¾à®°à¯à®ªà¯",
      vegetarian: "à®šà¯ˆà®µà®®à¯",
      dairy_free: "à®ªà®¾à®²à¯ à®…à®±à¯à®±à®¤à¯",
      gluten_free: "à®•à¯à®³à¯à®Ÿà¯à®Ÿà®©à¯ à®…à®±à¯à®±à®¤à¯",
      sugar_free: "à®šà®°à¯à®•à¯à®•à®°à¯ˆ à®…à®±à¯à®±à®¤à¯",
      portions_label: "à®ªà®•à¯à®¤à®¿à®•à®³à¯",
      log_meal_btn: "à®‰à®£à®µà¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®•",
      log_exercise_title: "à®‰à®™à¯à®•à®³à¯ à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿à®¯à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®•",
      exercise_name_label: "à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿à®¯à®¿à®©à¯ à®ªà¯†à®¯à®°à¯",
      duration_label: "à®•à®¾à®² à®…à®³à®µà¯ (à®¨à®¿à®®à®¿à®Ÿà®™à¯à®•à®³à¯)",
      intensity_label: "à®¤à¯€à®µà®¿à®°à®®à¯",
      low: "à®•à¯à®±à¯ˆà®¨à¯à®¤",
      moderate: "à®®à®¿à®¤à®®à®¾à®©",
      high: "à®…à®¤à®¿à®•",
      calories_label: "à®Žà®°à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®•à®²à¯‹à®°à®¿à®•à®³à¯ (à®¤à¯‹à®°à®¾à®¯à®®à®¾à®•)",
      log_exercise_btn: "à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿à®¯à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®•",
      exercise_name_placeholder: "à®Ž.à®•à®¾., à®ªà¯‚à®™à¯à®•à®¾à®µà®¿à®²à¯ à®•à®¾à®²à¯ˆ à®¨à¯‡à®° à®“à®Ÿà¯à®Ÿà®®à¯",
      calories_burned_label: "à®Žà®°à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®•à®²à¯‹à®°à®¿à®•à®³à¯ (à®¤à¯‹à®°à®¾à®¯à®®à®¾à®•)",
      calories_placeholder: "à®Ž.à®•à®¾., 250",
      notes_label: "à®¨à¯€à®™à¯à®•à®³à¯ à®Žà®ªà¯à®ªà®Ÿà®¿ à®‰à®£à®°à¯à®¨à¯à®¤à¯€à®°à¯à®•à®³à¯?",
      feel_notes_placeholder: "à®†à®±à¯à®±à®²à¯ à®¨à®¿à®²à¯ˆ, à®à®¤à¯‡à®©à¯à®®à¯ à®µà®²à®¿ à®…à®²à¯à®²à®¤à¯ à®…à®šà¯Œà®•à®°à®¿à®¯à®®à¯...",
      hydration_title: "à®¨à¯€à®°à¯‡à®±à¯à®±à®®à¯ à®•à®£à¯à®•à®¾à®£à®¿à®ªà¯à®ªà¯",
      quick_add: "à®µà®¿à®°à¯ˆà®µà®¾à®© à®šà¯‡à®°à¯à®ªà¯à®ªà¯",
      small_glass: "à®šà®¿à®±à®¿à®¯ à®•à®¿à®³à®¾à®¸à¯",
      medium_glass: "à®¨à®Ÿà¯à®¤à¯à®¤à®° à®•à®¿à®³à®¾à®¸à¯",
      large_glass: "à®ªà¯†à®°à®¿à®¯ à®•à®¿à®³à®¾à®¸à¯",
      one_litre: "1 à®²à®¿à®Ÿà¯à®Ÿà®°à¯",
      custom_water_label: "à®…à®²à¯à®²à®¤à¯ à®¤à®©à®¿à®ªà¯à®ªà®¯à®©à¯ à®…à®³à®µà¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà®µà¯à®®à¯ (à®®à®¿.à®²à®¿)",
      custom_water_placeholder: "à®®à®¿.à®²à®¿-à®‡à®²à¯ à®…à®³à®µà¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà®µà¯à®®à¯",
      add: "à®šà¯‡à®°à¯",
      today_intake_goal: "à®‡à®©à¯à®±à¯ˆà®¯ à®‰à®Ÿà¯à®•à¯Šà®³à¯à®³à®²à¯ Â· à®‡à®²à®•à¯à®•à¯: 2,500 à®®à®¿.à®²à®¿",
      water_goal_reached: "à®¤à®¿à®©à®šà®°à®¿ à®‡à®²à®•à¯à®•à®¿à®²à¯",
      hydration_history: "à®¨à¯€à®°à¯‡à®±à¯à®±à®®à¯ à®µà®°à®²à®¾à®±à¯",
      log_sleep_title: "à®‰à®™à¯à®•à®³à¯ à®¤à¯‚à®•à¯à®•à®¤à¯à®¤à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®•",
      sleep_date_label: "à®¤à¯‚à®•à¯à®•à®¤à¯à®¤à®¿à®©à¯ à®¤à¯‡à®¤à®¿ *",
      sleep_quality_label: "à®¤à¯‚à®•à¯à®•à®¤à¯à®¤à®¿à®©à¯ à®¤à®°à®®à¯",
      select_quality: "à®¤à®°à®¤à¯à®¤à¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯...",
      poor: "ðŸ˜Ÿ à®®à¯‹à®šà®®à®¾à®© (à®®à®¿à®•à®µà¯à®®à¯ à®…à®®à¯ˆà®¤à®¿à®¯à®±à¯à®±)",
      fair: "ðŸ˜ à®šà¯à®®à®¾à®°à¯ (à®šà®¿à®² à®‡à®Ÿà¯ˆà®¯à¯‚à®±à¯à®•à®³à¯)",
      good: "ðŸ™‚ à®¨à®²à¯à®² (à®ªà¯†à®°à¯à®®à¯à®ªà®¾à®²à¯à®®à¯ à®…à®®à¯ˆà®¤à®¿à®¯à®¾à®©)",
      excellent: "ðŸ˜„ à®šà®¿à®±à®¨à¯à®¤ (à®®à®¿à®•à®µà¯à®®à¯ à®…à®®à¯ˆà®¤à®¿à®¯à®¾à®©)",
      bedtime_label: "à®¤à¯‚à®™à¯à®•à¯à®®à¯ à®¨à¯‡à®°à®®à¯ *",
      waketime_label: "à®Žà®´à¯à®®à¯ à®¨à¯‡à®°à®®à¯ *",
      hours_slept_label: "à®¤à¯‚à®™à¯à®•à®¿à®¯ à®¨à¯‡à®°à®®à¯ (à®¤à®¾à®©à®¾à®• à®•à®£à®•à¯à®•à®¿à®Ÿà®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯)",
      sleep_duration_placeholder: "à®®à¯‡à®²à¯‡ à®¤à¯‚à®™à¯à®•à¯à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®Žà®´à¯à®®à¯ à®¨à¯‡à®°à®¤à¯à®¤à¯ˆ à®…à®®à¯ˆà®•à¯à®•à®µà¯à®®à¯",
      sleep_notes_placeholder: "à®‰à®™à¯à®•à®³à¯ à®¤à¯‚à®•à¯à®•à®¤à¯à®¤à¯ˆà®ªà¯ à®ªà®¾à®¤à®¿à®¤à¯à®¤ à®•à®¾à®°à®£à®¿à®•à®³à¯? (à®•à®ƒà®ªà¯ˆà®©à¯, à®®à®© à®…à®´à¯à®¤à¯à®¤à®®à¯, à®šà¯‚à®´à®²à¯...)",
      wake_up_feeling: "à®Žà®´à¯à®¨à¯à®¤à®¿à®°à¯à®•à¯à®•à¯à®®à¯ à®ªà¯‹à®¤à¯ à®‰à®£à®°à¯à®µà¯",
      refreshed: "à®ªà¯à®¤à¯à®¤à¯à®£à®°à¯à®šà¯à®šà®¿",
      tired: "à®šà¯‹à®°à¯à®µà¯",
      groggy: "à®•à¯à®´à®ªà¯à®ªà®®à®¾à®©",
      log_sleep_btn: "à®¤à¯‚à®•à¯à®•à®¤à¯à®¤à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®•",
      history: "à®µà®°à®²à®¾à®±à¯",
      no_meals_today: "à®‡à®©à¯à®±à¯ à®‰à®£à®µà¯à®•à®³à¯ à®Žà®¤à¯à®µà¯à®®à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.",
      no_exercises_today: "à®‡à®©à¯à®±à¯ à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿à®•à®³à¯ à®Žà®¤à¯à®µà¯à®®à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.",
      no_sleep_logged: "à®šà®®à¯€à®ªà®¤à¯à®¤à®¿à®²à¯ à®¤à¯‚à®•à¯à®• à®¤à®°à®µà¯ à®Žà®¤à¯à®µà¯à®®à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ.",
      daily_total: "à®¤à®¿à®©à®šà®°à®¿ à®®à¯Šà®¤à¯à®¤à®®à¯",
      portions_unit: "à®ªà®•à¯à®¤à®¿à®•à®³à¯",
      minutes_unit: "à®¨à®¿à®®à®¿à®Ÿà®™à¯à®•à®³à¯",
      calories_unit: "kcal",
      hours_unit: "à®®à®£à®¿à®•à®³à¯",
      entry_deleted: "âœ“ à®ªà®¤à®¿à®µà¯ à®¨à¯€à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      meal_added: "âœ“ à®‰à®£à®µà¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯!",
      exercise_added: "âœ“ à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯!",
      water_added: "âœ“ à®¨à¯€à®°à¯ à®‰à®Ÿà¯à®•à¯Šà®³à¯à®³à®²à¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯!",
      sleep_added: "âœ“ à®¤à¯‚à®•à¯à®• à®¤à®°à®µà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯!",
      fill_fields_error: "à®¤à®¯à®µà¯à®šà¯†à®¯à¯à®¤à¯ à®¤à¯‡à®µà¯ˆà®¯à®¾à®© à®…à®©à¯ˆà®¤à¯à®¤à¯ à®ªà¯à®²à®™à¯à®•à®³à¯ˆà®¯à¯à®®à¯ à®¨à®¿à®°à®ªà¯à®ªà®µà¯à®®à¯.",
      delete_confirm: "à®‡à®¨à¯à®¤à®ªà¯ à®ªà®¤à®¿à®µà¯ˆ à®¨à¯€à®•à¯à®• à®µà®¿à®°à¯à®®à¯à®ªà¯à®•à®¿à®±à¯€à®°à¯à®•à®³à®¾?",
      meal_saved_success: "à®‰à®£à®µà¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®•à®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯! ðŸ¥—",
      exercise_saved_success: "à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯! ðŸƒ",
      water_logged_success: "à®¨à¯€à®°à¯ à®‰à®Ÿà¯à®•à¯Šà®³à¯à®³à®²à¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯! ðŸ’§",
      sleep_logged_success: "à®¤à¯‚à®•à¯à®•à®®à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯! ðŸ˜´",
      amount: "à®…à®³à®µà¯",
      day_total: "à®¤à®¿à®©à®šà®°à®¿ à®®à¯Šà®¤à¯à®¤à®®à¯",
      logged_at: "à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿ à®¨à¯‡à®°à®®à¯",
      acne: "à®ªà®°à¯à®•à¯à®•à®³à¯",
      fatigue: "à®šà¯‹à®°à¯à®µà¯",
      headache: "à®¤à®²à¯ˆà®µà®²à®¿",
      bloating: "à®µà¯€à®•à¯à®•à®®à¯",
      mood_swings: "à®®à®©à®¨à®¿à®²à¯ˆ à®®à®¾à®±à¯à®±à®™à¯à®•à®³à¯",
      anxiety: "à®•à®µà®²à¯ˆ",
      depression: "à®®à®©à®šà¯à®šà¯‹à®°à¯à®µà¯",
      stress: "à®®à®© à®…à®´à¯à®¤à¯à®¤à®®à¯",
      irregular_period: "à®šà¯€à®°à®±à¯à®± à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯",
      heavy_bleeding: "à®…à®¤à®¿à®• à®‡à®°à®¤à¯à®¤à®ªà¯à®ªà¯‹à®•à¯à®•à¯",
      light_bleeding: "à®•à¯à®±à¯ˆà®¨à¯à®¤ à®‡à®°à®¤à¯à®¤à®ªà¯à®ªà¯‹à®•à¯à®•à¯",
      pelvic_pain: "à®‡à®Ÿà¯à®ªà¯à®ªà¯ à®µà®²à®¿",
      weight_change: "à®Žà®Ÿà¯ˆ à®®à®¾à®±à¯à®±à®®à¯",
      joint_pain: "à®®à¯‚à®Ÿà¯à®Ÿà¯ à®µà®²à®¿",
      hair_loss: "à®®à¯à®Ÿà®¿ à®‰à®¤à®¿à®°à¯à®¤à®²à¯",
      hair_growth: "à®…à®¤à®¿à®• à®®à¯à®Ÿà®¿ à®µà®³à®°à¯à®šà¯à®šà®¿",
      excess_hair_growth: "à®…à®¤à®¿à®• à®®à¯à®Ÿà®¿ à®µà®³à®°à¯à®šà¯à®šà®¿",
      dark_patches: "à®•à®°à¯à®ªà¯à®ªà¯ à®¤à®¿à®Ÿà¯à®Ÿà¯à®•à®³à¯",
      skin_darkening: "à®šà®°à¯à®®à®®à¯ à®•à®°à¯à®®à¯ˆà®¯à®¾à®¤à®²à¯",
      cramps: "à®¤à®šà¯ˆà®ªà¯à®ªà®¿à®Ÿà®¿à®ªà¯à®ªà¯",
      mild: "à®•à¯à®±à¯ˆà®¨à¯à®¤",
      moderate: "à®®à®¿à®¤à®®à®¾à®©",
      severe: "à®¤à¯€à®µà®¿à®°à®®à®¾à®©",
      protein: "ðŸ¥© à®ªà¯à®°à®¤à®®à¯",
      vegetables: "ðŸ¥¦ à®•à®¾à®¯à¯à®•à®±à®¿à®•à®³à¯",
      fruits: "ðŸ“ à®ªà®´à®™à¯à®•à®³à¯",
      grains: "ðŸŒ¾ à®¤à®¾à®©à®¿à®¯à®™à¯à®•à®³à¯",
      dairy: "ðŸ¥› à®ªà®¾à®²à¯ à®ªà¯Šà®°à¯à®Ÿà¯à®•à®³à¯",
      fats: "ðŸ¥‘ à®†à®°à¯‹à®•à¯à®•à®¿à®¯à®®à®¾à®© à®•à¯Šà®´à¯à®ªà¯à®ªà¯à®•à®³à¯",
      medical_documents_title: "à®Žà®©à®¤à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®†à®µà®£à®™à¯à®•à®³à¯",
      upload_report: "à®…à®±à®¿à®•à¯à®•à¯ˆà®¯à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà¯à®®à¯",
      upload_document_title: "ðŸ“¤ à®†à®µà®£à®¤à¯à®¤à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà¯à®®à¯",
      report_name_label: "à®…à®±à®¿à®•à¯à®•à¯ˆà®¯à®¿à®©à¯ à®ªà¯†à®¯à®°à¯ *",
      report_name_placeholder: "à®Ž.à®•à®¾. à®¤à¯ˆà®°à®¾à®¯à¯à®Ÿà¯ à®šà¯à®¯à®µà®¿à®µà®°à®®à¯, à®‡à®Ÿà¯à®ªà¯à®ªà¯ à®¸à¯à®•à¯‡à®©à¯",
      report_type_label: "à®…à®±à®¿à®•à¯à®•à¯ˆ à®µà®•à¯ˆ / à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ *",
      hospital_clinic_label: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ / à®•à®¿à®³à®¿à®©à®¿à®•à¯",
      hospital_name_placeholder: "à®Ž.à®•à®¾. à®…à®ªà¯à®ªà®²à¯à®²à¯‹ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ",
      doctor_requested_label: "à®•à¯‹à®°à®¿à®¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯",
      doctor_name_placeholder: "à®Ž.à®•à®¾. à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®šà®¿à®²à¯à®µà®¾",
      attach_report_label: "à®…à®±à®¿à®•à¯à®•à¯ˆà®¯à¯ˆ à®‡à®£à¯ˆà®•à¯à®•à®µà¯à®®à¯ (PDF/Img)",
      save_medical_record: "âœ“ à®®à®°à¯à®¤à¯à®¤à¯à®µà®ªà¯ à®ªà®¤à®¿à®µà¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      total_files: "à®®à¯Šà®¤à¯à®¤ à®•à¯‹à®ªà¯à®ªà¯à®•à®³à¯",
      added_this_month: "à®‡à®¨à¯à®¤ à®®à®¾à®¤à®®à¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      added_this_year: "à®‡à®¨à¯à®¤ à®†à®£à¯à®Ÿà¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      search_reports_placeholder: "à®ªà¯†à®¯à®°à¯ à®…à®²à¯à®²à®¤à¯ à®µà®šà®¤à®¿ à®®à¯‚à®²à®®à¯ à®¤à¯‡à®Ÿà¯à®™à¯à®•à®³à¯...",
      filter_by_type: "à®µà®•à¯ˆ à®®à¯‚à®²à®®à¯ à®µà®Ÿà®¿à®•à®Ÿà¯à®Ÿà®µà¯à®®à¯...",
      all_documents: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®†à®µà®£à®™à¯à®•à®³à¯",
      all_lab_results: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯",
      all_scans: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®¸à¯à®•à¯‡à®©à¯à®•à®³à¯",
      'LH (Luteinizing Hormone) Test': "LH (à®²à¯‚à®Ÿà®¿à®©à¯ˆà®šà®¿à®™à¯ à®¹à®¾à®°à¯à®®à¯‹à®©à¯) à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'FSH (Follicle Stimulating Hormone) Test': "FSH (à®ƒà®ªà¯‹à®²à®¿à®•à®²à¯ à®¤à¯‚à®£à¯à®Ÿà¯à®®à¯ à®¹à®¾à®°à¯à®®à¯‹à®©à¯) à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'Testosterone Level Test': "à®Ÿà¯†à®¸à¯à®Ÿà¯‹à®¸à¯à®Ÿà®¿à®°à¯‹à®©à¯ à®…à®³à®µà¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'Prolactin Test': "à®ªà¯à®°à¯‹à®²à®¾à®•à¯à®Ÿà®¿à®©à¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'Thyroid Function Test (TSH, T3, T4)': "à®¤à¯ˆà®°à®¾à®¯à¯à®Ÿà¯ à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ (TSH, T3, T4)",
      'Pelvic Ultrasound Scan': "à®‡à®Ÿà¯à®ªà¯à®ªà¯ à®…à®²à¯à®Ÿà¯à®°à®¾à®šà®µà¯à®£à¯à®Ÿà¯ à®¸à¯à®•à¯‡à®©à¯",
      'Fasting Blood Sugar (FBS)': "à®µà¯†à®±à¯à®®à¯ à®µà®¯à®¿à®±à¯à®±à¯ à®‡à®°à®¤à¯à®¤ à®šà®°à¯à®•à¯à®•à®°à¯ˆ (FBS)",
      'Oral Glucose Tolerance Test (OGTT)': "à®µà®¾à®¯à¯à®µà®´à®¿ à®•à¯à®³à¯à®•à¯à®•à¯‹à®¸à¯ à®šà®•à®¿à®ªà¯à®ªà¯à®¤à¯à®¤à®©à¯à®®à¯ˆ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ (OGTT)",
      'HbA1c Test': "HbA1c à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'Lipid Profile (Cholesterol Test)': "à®²à®¿à®ªà¯à®ªà®¿à®Ÿà¯ à®šà¯à®¯à®µà®¿à®µà®°à®®à¯ (à®•à¯Šà®²à®¸à¯à®Ÿà¯à®°à®¾à®²à¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ)",
      prescription: "à®®à®°à¯à®¨à¯à®¤à¯à®šà¯ à®šà¯€à®Ÿà¯à®Ÿà¯",
      report_uploaded_activity: "à®ªà¯à®¤à®¿à®¯ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®…à®±à®¿à®•à¯à®•à¯ˆ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯: {name}",
      cycle_logged_activity: "à®®à®¾à®¤à®µà®¿à®Ÿà®¾à®¯à¯ à®šà¯à®´à®±à¯à®šà®¿ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯ â€” {length} à®¨à®¾à®³à¯ à®šà¯à®´à®±à¯à®šà®¿, {flow} à®ªà¯‹à®•à¯à®•à¯",
      meal_logged_activity: "{type} à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯: {name}",
      exercise_logged_activity: "à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯: {name} ({duration} à®¨à®¿à®®à®¿à®Ÿà®™à¯à®•à®³à¯)",
      water_logged_activity: "à®¨à¯€à®°à¯ à®‰à®Ÿà¯à®•à¯Šà®³à¯à®³à®²à¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯: à®‡à®©à¯à®±à¯ à®®à¯Šà®¤à¯à®¤à®®à¯ {total}à®®à®¿.à®²à®¿",
      sleep_logged_activity: "à®¤à¯‚à®•à¯à®•à®®à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯: {duration} à®®à®£à®¿à®•à®³à¯ ({quality})",
      appointment_activity: "à®µà®°à®µà®¿à®°à¯à®•à¯à®•à¯à®®à¯ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯: {hospital} à®‡à®²à¯ {reason}",
      appointment_today: "à®‡à®©à¯à®±à¯ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯: {hospital} à®‡à®²à¯ {reason}",
      appointment_missed: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯ à®¤à®µà®±à®µà®¿à®Ÿà®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯: {hospital} à®‡à®²à¯ {reason}",
      hospital_registered_activity: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆà®¯à®¿à®²à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯: {name}",
      recorded: "à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      today: "à®‡à®©à¯à®±à¯",
      meal_history: "ðŸ“‹ à®‰à®£à®µà¯ à®µà®°à®²à®¾à®±à¯",
      exercise_history: "ðŸ“‹ à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿ à®µà®°à®²à®¾à®±à¯",
      sleep_history: "ðŸ“‹ à®¤à¯‚à®•à¯à®• à®µà®°à®²à®¾à®±à¯",
      water_history: "ðŸ’§ à®¨à¯€à®°à¯ à®ªà®¤à®¿à®µà¯ à®µà®°à®²à®¾à®±à¯",
      save_meal: "ðŸ’¾ à®‰à®£à®µà¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      save_exercise: "ðŸ’¾ à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿à®¯à¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      save_sleep: "ðŸ’¾ à®¤à¯‚à®•à¯à®•à®¤à¯à®¤à¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      meal_saved_success: "à®‰à®£à®µà¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®•à®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯! ðŸ¥—",
      exercise_saved_success: "à®‰à®Ÿà®±à¯à®ªà®¯à®¿à®±à¯à®šà®¿ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯! ðŸƒ",
      water_logged_success: "à®¨à¯€à®°à¯ à®‰à®Ÿà¯à®•à¯Šà®³à¯à®³à®²à¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯! ðŸ’§",
      sleep_logged_success: "à®¤à¯‚à®•à¯à®•à®®à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯! ðŸ˜´",
      my_hospital_title: "à®Žà®©à®¤à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ",
      manage_healthcare: "à®‰à®™à¯à®•à®³à¯ à®šà¯à®•à®¾à®¤à®¾à®° à®šà¯‡à®µà¯ˆ à®µà®´à®™à¯à®•à¯à®¨à®°à¯à®•à®³à¯ˆ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®•à®µà¯à®®à¯",
      hospital_hero_title: "à®šà®¿à®±à®¨à¯à®¤ à®šà¯à®•à®¾à®¤à®¾à®° à®šà¯‡à®µà¯ˆà®¯à¯ˆà®•à¯ à®•à®£à¯à®Ÿà®±à®¿à®¯à®µà¯à®®à¯ ðŸ¥",
      register_new_hospital: "à®ªà¯à®¤à®¿à®¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆà®¯à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯",
      manage_visits: "à®‰à®™à¯à®•à®³à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯ˆ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®•à®µà¯à®®à¯",
      health_schedule_title: "à®‰à®™à¯à®•à®³à¯ à®šà¯à®•à®¾à®¤à®¾à®° à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆ ðŸ“…",
      health_schedule_subtitle: "à®‰à®™à¯à®•à®³à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®µà®°à¯à®•à¯ˆà®•à®³à¯ˆà®•à¯ à®•à®£à¯à®•à®¾à®£à®¿à®¯à¯à®™à¯à®•à®³à¯. à®ªà®¯à®©à¯à®³à¯à®³ à®ªà®¿.à®šà®¿.à®“.à®Žà®¸à¯ à®®à¯‡à®²à®¾à®£à¯à®®à¯ˆà®•à¯à®•à¯ à®®à¯à®±à¯ˆà®¯à®¾à®© à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆà®•à®³à¯ à®®à¯à®•à¯à®•à®¿à®¯à®®à¯.",
      upcoming: "à®µà®°à®µà®¿à®°à¯à®ªà¯à®ªà®µà¯ˆ",
      total_visits: "à®®à¯Šà®¤à¯à®¤ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯",
      book_appointment: "âž• à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯ˆ à®®à¯à®©à¯à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯",
      all_appointments: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯",
      history: "à®µà®°à®²à®¾à®±à¯",
      no_appts_found: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯ à®Žà®¤à¯à®µà¯à®®à¯ à®‡à®²à¯à®²à¯ˆ",
      no_appts_msg: "à®¨à¯€à®™à¯à®•à®³à¯ à®‡à®©à¯à®©à¯à®®à¯ à®Žà®¨à¯à®¤ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯à®•à®³à¯ˆà®¯à¯à®®à¯ à®¤à®¿à®Ÿà¯à®Ÿà®®à®¿à®Ÿà®µà®¿à®²à¯à®²à¯ˆ. à®‰à®™à¯à®•à®³à¯ à®®à¯à®¤à®²à¯ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯ˆ à®®à¯à®©à¯à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯ à®µà®²à®¤à¯ à®ªà®•à¯à®•à®¤à¯à®¤à®¿à®²à¯ à®‰à®³à¯à®³ à®ªà®Ÿà®¿à®µà®¤à¯à®¤à¯ˆà®ªà¯ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯!",
      schedule_new: "à®ªà¯à®¤à®¿à®¯ à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯",
      search_appts: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ/à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®®à¯‚à®²à®®à¯ à®¤à¯‡à®Ÿà®µà¯à®®à¯...",
      hospital_name: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆà®¯à®¿à®©à¯ à®ªà¯†à®¯à®°à¯",
      enter_hospital: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ/à®•à®¿à®³à®¿à®©à®¿à®•à¯ à®ªà¯†à®¯à®°à¯ˆ à®‰à®³à¯à®³à®¿à®Ÿà®µà¯à®®à¯",
      doctor_name: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à®¿à®©à¯ à®ªà¯†à®¯à®°à¯",
      dr_name_optional: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®ªà¯†à®¯à®°à¯ (à®µà®¿à®°à¯à®ªà¯à®ªà®¤à¯à®¤à®¿à®±à¯à®•à¯à®°à®¿à®¯à®¤à¯)",
      visit_type: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯ à®µà®•à¯ˆ",
      consultation: "à®†à®²à¯‹à®šà®©à¯ˆ",
      'pcos-check-up': "PCOS à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'follow-up': "à®¤à¯Šà®Ÿà®°à¯ à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ",
      'lab-test': "à®†à®¯à¯à®µà®•à®®à¯/à®¸à¯à®•à¯‡à®©à¯",
      reason_notes: "à®•à®¾à®°à®£à®®à¯ / à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯",
      visit_reason_placeholder: "à®‡à®¨à¯à®¤ à®µà®°à¯à®•à¯ˆà®¯à®¿à®©à¯ à®¨à¯‹à®•à¯à®•à®®à¯ à®Žà®©à¯à®©?",
      save_appointment: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      reschedule_visit: "à®šà®¨à¯à®¤à®¿à®ªà¯à®ªà¯ˆ à®®à®±à¯à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆà®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯ ðŸ•“",
      reschedule_msg: "à®‰à®™à¯à®•à®³à¯ à®†à®²à¯‹à®šà®©à¯ˆà®•à¯à®•à¯ à®’à®°à¯ à®ªà¯à®¤à®¿à®¯ à®¤à¯‡à®¤à®¿ à®®à®±à¯à®±à¯à®®à¯ à®¨à¯‡à®°à®¤à¯à®¤à¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯.",
      new_date: "à®ªà¯à®¤à®¿à®¯ à®¤à¯‡à®¤à®¿",
      new_time: "à®ªà¯à®¤à®¿à®¯ à®¨à¯‡à®°à®®à¯",
      update_schedule: "à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆà®¯à¯ˆà®ªà¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®µà¯à®®à¯",
      medical_officer: "à®®à®°à¯à®¤à¯à®¤à¯à®µ à®…à®¤à®¿à®•à®¾à®°à®¿",
      cancel_visit: "à®‡à®°à®¤à¯à®¤à¯ à®šà¯†à®¯à¯",
      reschedule: "à®®à®±à¯à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆ",
      received_only: "à®ªà¯†à®±à®ªà¯à®ªà®Ÿà¯à®Ÿà®µà¯ˆ à®®à®Ÿà¯à®Ÿà¯à®®à¯",
      pending_only: "à®ªà¯†à®£à¯à®Ÿà®¿à®™à¯ à®®à®Ÿà¯à®Ÿà¯à®®à¯",
      track_symptoms_title: "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®•à¯ à®•à®£à¯à®•à®¾à®£à®¿à®•à¯à®•à®µà¯à®®à¯",
      log_your_symptoms: "à®‰à®™à¯à®•à®³à¯ à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à¯à®™à¯à®•à®³à¯",
      overall_severity: "à®’à®Ÿà¯à®Ÿà¯à®®à¯Šà®¤à¯à®¤ à®¤à¯€à®µà®¿à®°à®®à¯",
      additional_notes: "à®•à¯‚à®Ÿà¯à®¤à®²à¯ à®•à¯à®±à®¿à®ªà¯à®ªà¯à®•à®³à¯",
      save_symptoms: "à®…à®±à®¿à®•à¯à®±à®¿à®•à®³à¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      your_symptom_history: "à®‰à®™à¯à®•à®³à¯ à®…à®±à®¿à®•à¯à®±à®¿ à®µà®°à®²à®¾à®±à¯",
      no_records_found: "à®ªà®¤à®¿à®µà¯à®•à®³à¯ à®Žà®¤à¯à®µà¯à®®à¯ à®‡à®²à¯à®²à¯ˆ",
      no_records_msg: "à®‡à®¨à¯à®¤ à®ªà®¿à®°à®¿à®µà®¿à®²à¯ à®¨à¯€à®™à¯à®•à®³à¯ à®‡à®©à¯à®©à¯à®®à¯ à®…à®±à®¿à®•à¯à®•à¯ˆà®•à®³à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà®¿à®²à¯à®²à¯ˆ.",
      'FBC (Full Blood Count / CBC)': "FBC (à®®à¯à®´à¯ à®‡à®°à®¤à¯à®¤ à®Žà®£à¯à®£à®¿à®•à¯à®•à¯ˆ / CBC)",
      'Vitamin D Test': "à®µà¯ˆà®Ÿà¯à®Ÿà®®à®¿à®©à¯ à®Ÿà®¿ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'Vitamin B12 Test': "à®µà¯ˆà®Ÿà¯à®Ÿà®®à®¿à®©à¯ à®ªà®¿12 à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'Ferritin (Iron Stores Test)': "à®ªà¯†à®°à®¿à®Ÿà¯à®Ÿà®¿à®©à¯ (à®‡à®°à¯à®®à¯à®ªà¯à®šà¯ à®šà¯‡à®®à®¿à®ªà¯à®ªà¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ)",
      'Serum Insulin Test': "à®šà¯€à®°à®®à¯ à®‡à®©à¯à®šà¯à®²à®¿à®©à¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'DHEA-S Test (Dehydroepiandrosterone Sulfate)': "DHEA-S à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'Cortisol Test': "à®•à®¾à®°à¯à®Ÿà®¿à®šà¯‹à®²à¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      'Liver Function Test (LFT)': "à®•à®²à¯à®²à¯€à®°à®²à¯ à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ (LFT)",
      'Kidney Function Test (KFT)': "à®šà®¿à®±à¯à®¨à¯€à®°à®• à®šà¯†à®¯à®²à¯à®ªà®¾à®Ÿà¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ (KFT)",
      'Sex Hormone Binding Globulin (SHBG) Test': "SHBG à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ",
      general_view: "à®ªà¯Šà®¤à¯à®•à¯ à®•à®¾à®Ÿà¯à®šà®¿",
      specific_lab_tests: "à®•à¯à®±à®¿à®ªà¯à®ªà®¿à®Ÿà¯à®Ÿ à®†à®¯à¯à®µà®•à®ªà¯ à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆà®•à®³à¯",
      scans: "à®¸à¯à®•à¯‡à®©à¯à®•à®³à¯",
      other: "à®®à®±à¯à®±à®µà¯ˆ",
      accessing_vault: "à®®à®°à¯à®¤à¯à®¤à¯à®µ à®ªà¯†à®Ÿà¯à®Ÿà®•à®¤à¯à®¤à¯ˆ à®…à®£à¯à®•à¯à®•à®¿à®±à®¤à¯...",
      upload_first_file: "ðŸ“¤ à®‰à®™à¯à®•à®³à¯ à®®à¯à®¤à®²à¯ à®•à¯‹à®ªà¯à®ªà¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà¯à®®à¯",
      permanently_remove: "à®¨à®¿à®°à®¨à¯à®¤à®°à®®à®¾à®• à®¨à¯€à®•à¯à®•à®µà®¾?",
      are_you_sure_remove: "à®‡à®¨à¯à®¤ à®®à®°à¯à®¤à¯à®¤à¯à®µà®ªà¯ à®ªà®¤à®¿à®µà¯ˆ à®¨à¯€à®•à¯à®• à®µà®¿à®°à¯à®®à¯à®ªà¯à®•à®¿à®±à¯€à®°à¯à®•à®³à®¾?",
      ok_remove: "à®šà®°à®¿, à®¨à¯€à®•à¯à®•à¯",
      no_back: "à®‡à®²à¯à®²à¯ˆ, à®ªà®¿à®©à¯à®©à®¾à®²à¯",
      syncing: "à®’à®¤à¯à®¤à®¿à®šà¯ˆà®•à¯à®•à®¿à®±à®¤à¯...",
      save_medical_record_success: "âœ“ à®®à®°à¯à®¤à¯à®¤à¯à®µà®ªà¯ à®ªà®¤à®¿à®µà¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®•à®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯!",
      record_removed_success: "à®ªà®¤à®¿à®µà¯ à®µà¯†à®±à¯à®±à®¿à®•à®°à®®à®¾à®• à®¨à¯€à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
      error_occurred: "à®ªà®¿à®´à¯ˆ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
      uploaded: "à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      pending: "à®¨à®¿à®²à¯à®µà¯ˆà®¯à®¿à®²à¯ à®‰à®³à¯à®³à®¤à¯",
      reviewed: "à®®à®¤à®¿à®ªà¯à®ªà®¾à®¯à¯à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      at: "à®¨à¯‡à®°à®¤à¯à®¤à®¿à®²à¯",
      completed: "à®®à¯à®Ÿà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      cancelled: "à®‡à®°à®¤à¯à®¤à¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      rescheduled: "à®®à®±à¯à®…à®Ÿà¯à®Ÿà®µà®£à¯ˆà®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      lab_results_title: "à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯",
      total_results: "à®®à¯Šà®¤à¯à®¤ à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯",
      upload_lab_result_title: "ðŸ“¤ à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà¯à®®à¯",
      added_this_month: "à®‡à®¨à¯à®¤ à®®à®¾à®¤à®®à¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      added_this_year: "à®‡à®¨à¯à®¤ à®†à®£à¯à®Ÿà¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      all_lab_results: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯",
      search_lab_placeholder: "à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ, à®†à®¯à¯à®µà®•à®®à¯ à®…à®²à¯à®²à®¤à¯ à®µà®•à¯ˆ à®®à¯‚à®²à®®à¯ à®¤à¯‡à®Ÿà®µà¯à®®à¯...",
      test_category_label: "à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ à®µà®•à¯ˆ",
      hospital_clinic_label: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ / à®•à®¿à®³à®¿à®©à®¿à®•à¯",
      doctor_requested_label: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯ à®•à¯‹à®°à®¿à®¯à®¤à¯",
      test_date_label: "à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ à®¤à¯‡à®¤à®¿ *",
      attach_file_label: "PDF à®…à®²à¯à®²à®¤à¯ à®ªà®Ÿà®¤à¯à®¤à¯ˆ à®‡à®£à¯ˆà®•à¯à®•à®µà¯à®®à¯",
      save_medical_result: "âœ“ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®®à¯à®Ÿà®¿à®µà¯ˆà®šà¯ à®šà¯‡à®®à®¿à®•à¯à®•à®µà¯à®®à¯",
      remove_result_title: "à®®à¯à®Ÿà®¿à®µà¯ˆ à®¨à¯€à®•à¯à®•à®µà®¾?",
      remove_result_msg: "à®‡à®¨à¯à®¤ à®¨à¯‹à®¯à¯ à®•à®£à¯à®Ÿà®±à®¿à®¤à®²à¯ à®®à¯à®Ÿà®¿à®µà¯ˆ à®¨à¯€à®•à¯à®• à®µà®¿à®°à¯à®®à¯à®ªà¯à®•à®¿à®±à¯€à®°à¯à®•à®³à®¾?",
      removed_from_both: "à®‡à®°à®£à¯à®Ÿà®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯à®®à¯ à®¨à¯€à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      upload_first_result: "ðŸ“¤ à®®à¯à®¤à®²à¯ à®®à¯à®Ÿà®¿à®µà¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®µà¯à®®à¯",
      loading_medical_records: "à®‰à®™à¯à®•à®³à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µ à®ªà®¤à®¿à®µà¯à®•à®³à¯ˆ à®®à¯€à®Ÿà¯à®Ÿà¯†à®Ÿà¯à®•à¯à®•à®¿à®±à®¤à¯...",
      no_lab_results_found: "à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯ à®Žà®¤à¯à®µà¯à®®à¯ à®‡à®²à¯à®²à¯ˆ",
      no_lab_results_msg: "à®ªà®¤à®¿à®µà¯‡à®±à¯à®±à®ªà¯à®ªà®Ÿà¯à®Ÿà®µà¯à®Ÿà®©à¯ à®…à®²à¯à®²à®¤à¯ à®†à®¯à¯à®µà®•à®™à¯à®•à®³à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ à®ªà¯†à®±à®ªà¯à®ªà®Ÿà¯à®Ÿà®µà¯à®Ÿà®©à¯ à®‰à®™à¯à®•à®³à¯ à®¨à¯‹à®¯à¯ à®•à®£à¯à®Ÿà®±à®¿à®¤à®²à¯ à®ªà®¤à®¿à®µà¯à®•à®³à¯ à®‡à®™à¯à®•à¯‡ à®¤à¯‹à®©à¯à®±à¯à®®à¯.",
      test_name_label: "à®ªà®°à®¿à®šà¯‹à®¤à®©à¯ˆ à®ªà¯†à®¯à®°à¯ *",
      received: "à®ªà¯†à®±à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      processing: "à®šà¯†à®¯à®²à®¾à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯",
      sync_complete_msg: "à®’à®¤à¯à®¤à®¿à®šà¯ˆà®µà¯ à®®à¯à®Ÿà®¿à®¨à¯à®¤à®¤à¯! à®®à¯à®Ÿà®¿à®µà¯ à®†à®¯à¯à®µà®• à®®à¯à®Ÿà®¿à®µà¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®Žà®©à®¤à¯ à®…à®±à®¿à®•à¯à®•à¯ˆà®•à®³à®¿à®²à¯ à®šà¯‡à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯.",
      error_comm: "à®¤à¯Šà®Ÿà®°à¯à®ªà¯ à®ªà®¿à®´à¯ˆ.",
      removing_msg: "à®¨à¯€à®•à¯à®•à¯à®•à®¿à®±à®¤à¯...",
      unknown_date: "à®…à®±à®¿à®¯à®ªà¯à®ªà®Ÿà®¾à®¤ à®¤à¯‡à®¤à®¿",
      general: "à®ªà¯Šà®¤à¯",
      not_specified: "à®•à¯à®±à®¿à®ªà¯à®ªà®¿à®Ÿà®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ",
      test_name_placeholder: "à®‰à®¤à®¾à®°à®£à®®à®¾à®•: à®‡à®°à®¤à¯à®¤ à®Žà®£à¯à®£à®¿à®•à¯à®•à¯ˆ, HbA1c",
      hospital_name_placeholder: "à®‰à®¤à®¾à®°à®£à®®à®¾à®•: à®…à®šà®¿à®°à®¿ à®¹à¯†à®²à¯à®¤à¯",
      doctor_name_placeholder: "à®‰à®¤à®¾à®°à®£à®®à®¾à®•: à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®ªà¯†à®°à¯‡à®°à®¾",
      click_to_select: "à®•à¯‹à®ªà¯à®ªà¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®• à®•à®¿à®³à®¿à®•à¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯",
      upload_size_limit: "à®…à®¤à®¿à®•à®ªà®Ÿà¯à®š à®…à®³à®µà¯ 10MB (PDF, JPG, PNG)",
      hospital_hero_desc: "à®‰à®™à¯à®•à®³à¯ à®…à®©à¯ˆà®¤à¯à®¤à¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®ªà¯ à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯ˆà®¯à¯à®®à¯ à®’à®°à¯‡ à®‡à®Ÿà®¤à¯à®¤à®¿à®²à¯ à®µà¯ˆà®¤à¯à®¤à®¿à®°à¯à®ªà¯à®ªà®¤à®±à¯à®•à®¾à®• à®‰à®™à¯à®•à®³à¯ à®®à¯à®¤à®©à¯à®®à¯ˆ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®šà®¿à®±à®ªà¯à®ªà¯ à®•à®¿à®³à®¿à®©à®¿à®•à¯à®•à®¿à®²à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯.",
      fetching_hospitals: "à®‰à®™à¯à®•à®³à¯ à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆà®•à®³à¯ˆà®•à¯ à®•à®£à¯à®Ÿà®±à®¿à®•à®¿à®±à®¤à¯...",
      register_new_title: "ðŸ“ à®ªà¯à®¤à®¿à®¤à®¾à®•à®ªà¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯",
      primary_provider_badge: "à®®à¯à®¤à®©à¯à®®à¯ˆ à®µà®´à®™à¯à®•à¯à®¨à®°à¯",
      make_primary: "à®®à¯à®¤à®©à¯à®®à¯ˆ à®†à®•à¯à®•à®µà¯à®®à¯",
      hospital_removed: "âœ“ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ à®¨à¯€à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯",
      primary_provider_updated: "âœ“ à®®à¯à®¤à®©à¯à®®à¯ˆ à®µà®´à®™à¯à®•à¯à®¨à®°à¯ à®ªà¯à®¤à¯à®ªà¯à®ªà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¾à®°à¯!",
      failed_load_hospitals: "à®ªà®¤à®¿à®µà¯à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà¯à®Ÿ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆà®•à®³à¯ˆ à®à®±à¯à®±à¯à®µà®¤à®¿à®²à¯ à®¤à¯‹à®²à¯à®µà®¿.",
      no_hospitals_registered: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆà®•à®³à¯ à®‡à®©à¯à®©à¯à®®à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®ªà¯à®ªà®Ÿà®µà®¿à®²à¯à®²à¯ˆ. à®‰à®™à¯à®•à®³à¯ à®®à¯à®¤à®²à¯ à®•à®¿à®³à®¿à®©à®¿à®•à¯à®•à¯ˆ à®µà®²à®¤à¯ à®ªà®•à¯à®•à®¤à¯à®¤à®¿à®²à¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯!",
      hospital_name_label: "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ à®ªà¯†à®¯à®°à¯ *",
      specialist_doctor_label: "à®šà®¿à®±à®ªà¯à®ªà¯ à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯",
      address_label: "à®®à¯à®•à®µà®°à®¿",
      contact_number_label: "à®¤à¯Šà®Ÿà®°à¯à®ªà¯ à®Žà®£à¯ *",
      email_label: "à®®à®¿à®©à¯à®©à®žà¯à®šà®²à¯",
      set_primary_label: "à®®à¯à®¤à®©à¯à®®à¯ˆ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆà®¯à®¾à®• à®…à®®à¯ˆà®•à¯à®•à®µà¯à®®à¯",
      register_hospital_btn: "ðŸ¥ à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆà®¯à¯ˆà®ªà¯ à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à®µà¯à®®à¯",
      doctor_placeholder: "à®Ÿà®¾à®•à¯à®Ÿà®°à¯ à®œà¯‡à®©à¯ à®¸à¯à®®à®¿à®¤à¯",
      address_placeholder: "à®¤à¯†à®°à¯, à®¨à®•à®°à®®à¯...",
      contact_placeholder: "10 à®‡à®²à®•à¯à®•à®™à¯à®•à®³à¯ (à®‰à®¤à®¾à®°à®£à®®à®¾à®•: 0771234567)",
      email_placeholder: "info@hosp.com",
      special_care: "à®šà®¿à®±à®ªà¯à®ªà¯ à®šà®¿à®•à®¿à®šà¯à®šà¯ˆ",
      contact_10_digits_error: "à®¤à¯Šà®Ÿà®°à¯à®ªà¯ à®Žà®£à¯ à®šà®°à®¿à®¯à®¾à®• 10 à®‡à®²à®•à¯à®•à®™à¯à®•à®³à¯ˆà®•à¯ à®•à¯Šà®£à¯à®Ÿà®¿à®°à¯à®•à¯à®• à®µà¯‡à®£à¯à®Ÿà¯à®®à¯.",
      clinic: "à®•à®¿à®³à®¿à®©à®¿à®•à¯"
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

// â”€â”€ Intersection Observer Reveal â”€â”€
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

// â”€â”€ Navbar scroll effect â”€â”€
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

// â”€â”€ Active Nav link highlighting â”€â”€
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

// â”€â”€ Smooth scroll â”€â”€
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

// â”€â”€ Count-up animation â”€â”€
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

// â”€â”€ Tab switcher â”€â”€
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

// â”€â”€ Sidebar for dashboards â”€â”€
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

// â”€â”€ Sidebar active item â”€â”€
function setSidebarActive() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

// â”€â”€ Fake auth helper (localStorage demo) â”€â”€
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

// â”€â”€ Progress bar animation â”€â”€
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

// â”€â”€ Upload area drag & drop â”€â”€
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
  if (p) p.innerHTML = `<span>âœ“ Uploaded:</span> ${file.name}`;
  Toast.success(`File "${file.name}" uploaded successfully!`);
}

// â”€â”€ Symptom chip toggle â”€â”€
function initSymptomChips() {
  document.querySelectorAll('.symptom-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });
}

// â”€â”€ Newsletter form â”€â”€
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

// â”€â”€ HTML Escaping â”€â”€
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// â”€â”€ Session quality guard â”€â”€
// Returns the user object if the session is valid and complete.
// Returns null if there is no session or it lacks identifying fields.
// Does NOT redirect â€” let the callers decide what to do.
function checkSession() {
  const user = Auth.getUser();
  if (!user || !user.loggedIn) return null;
  // A valid session must have at least one of: id, email
  if (!user.id && !user.email) return null;
  return user;
}

// â”€â”€ Global init â”€â”€
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

