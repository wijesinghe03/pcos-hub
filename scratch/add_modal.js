const fs = require('fs');

const path = 'c:/xampp/htdocs/pcos-hub/src/pages/hospitals.html';
let content = fs.readFileSync(path, 'utf8');

// Replace the onclick in all buttons
content = content.replace(/onclick="Toast\.success\(L10n\.t\('hosp_toast_connecting'\)\s*\+\s*'\s*'\s*\+\s*L10n\.t\('([^']+)'\)\s*\+\s*'\.\.\.'\)"/g, function(match, nameKey) {
  // We can deduce the desc key from the name key. 
  // nameKey is like hosp_castle_name. 
  // descKey is like hosp_castle_desc
  const descKey = nameKey.replace('_name', '_desc');
  return `onclick="openHospitalModal('${nameKey}', '${descKey}')"`;
});

// Add modal HTML before <script src="../../assets/js/utils.js">
const modalHtml = `
  <!-- Hospital Connect Modal -->
  <div id="hospital-connect-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:2000; align-items:center; justify-content:center; padding: 20px; backdrop-filter: blur(4px);">
    <div class="modal-content" style="background:var(--bg-card); border-radius:var(--radius-lg); width:100%; max-width:850px; max-height:90vh; overflow-y:auto; padding:40px; position:relative; box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid var(--border); animation: slideUp 0.3s ease-out forwards;">
      <button onclick="closeHospitalModal()" style="position:absolute; top:24px; right:24px; background:var(--bg-light); border:1px solid var(--border); border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; cursor:pointer; color:var(--text-mid); transition:all 0.2s;">&times;</button>
      
      <div style="text-align:center; margin-bottom:40px;">
        <div style="width:70px; height:70px; background:linear-gradient(135deg, var(--purple-light), var(--purple-primary)); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 20px; color:white; box-shadow:0 10px 20px rgba(138, 43, 226, 0.2);">🏥</div>
        <h2 id="modal-hospital-name" style="color:var(--text-main); font-size:2rem; font-weight:700; margin-bottom:12px; letter-spacing:-0.5px;">Welcome</h2>
        <p id="modal-hospital-desc" style="color:var(--text-mid); font-size:1.1rem; max-width:600px; margin:0 auto; line-height:1.6;">Excellent care awaits you. Connect with leading specialists.</p>
      </div>

      <div style="display:flex; align-items:center; margin-bottom:24px; gap:12px;">
        <h3 style="font-size:1.3rem; color:var(--text-main); margin:0;">Available Gynaecologists</h3>
        <span style="background:var(--purple-pale); color:var(--purple-primary); padding:4px 10px; border-radius:20px; font-size:0.8rem; font-weight:600;">5 Doctors</span>
        <div style="flex-grow:1; height:1px; background:var(--border);"></div>
      </div>
      
      <div class="doctors-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:24px; margin-bottom:32px;" id="doctors-container">
        <!-- Doctor Cards Injected by JS -->
      </div>
      
      <div style="background:linear-gradient(145deg, var(--bg-light), var(--bg-card)); padding:28px; border-radius:var(--radius-lg); margin-top:40px; border:1px solid var(--border); display:flex; gap:24px; align-items:flex-start;">
        <div style="font-size:2.5rem;">🌟</div>
        <div>
          <h4 style="color:var(--text-main); font-size:1.2rem; margin-bottom:12px;">About Our Specialized Care</h4>
          <p style="font-size:0.95rem; color:var(--text-mid); margin-bottom:0; line-height:1.6;">By connecting with this hospital, you gain access to state-of-the-art diagnostic facilities and expert multidisciplinary care. Our gynaecologists provide comprehensive evaluations and personalized treatment plans for PCOS, fertility concerns, and overall reproductive health.</p>
        </div>
      </div>
      
      <div style="text-align:center; margin-top:40px; display:flex; justify-content:center; gap:16px;">
        <button class="btn" onclick="closeHospitalModal()" style="padding:12px 30px; background:var(--bg-light); color:var(--text-main); border:1px solid var(--border);">Cancel</button>
        <button class="btn btn-primary" onclick="confirmConnection()" style="padding:12px 40px; box-shadow:0 8px 16px rgba(138,43,226,0.2);">Confirm Connection</button>
      </div>
    </div>
  </div>

  <style>
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .doctor-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .doctor-card:hover {
      border-color: var(--purple-light);
      box-shadow: 0 10px 20px rgba(0,0,0,0.05);
      transform: translateY(-5px);
    }
    .doctor-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--purple-pale);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 16px;
      box-shadow: 0 4px 10px rgba(138,43,226,0.1);
    }
    .doctor-name {
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
      font-size: 1.05rem;
    }
    .doctor-spec {
      font-size: 0.85rem;
      color: var(--purple-primary);
      margin-bottom: 12px;
      font-weight: 600;
    }
    .doctor-exp {
      font-size: 0.8rem;
      color: var(--text-light);
      background: var(--bg-light);
      padding: 4px 12px;
      border-radius: 20px;
      display: inline-block;
    }
    [data-theme="dark"] .doctor-card:hover {
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
  </style>

  <script>
    const mockDoctors = [
      { name: "Dr. Sarah Perera", spec: "Senior Consultant Gynaecologist", exp: "15+ Years Exp", img: "👩‍⚕️" },
      { name: "Dr. Kamal Fernando", spec: "Obstetrician & Gynaecologist", exp: "12+ Years Exp", img: "👨‍⚕️" },
      { name: "Dr. Anjalie Silva", spec: "Reproductive Endocrinologist", exp: "10+ Years Exp", img: "👩‍⚕️" },
      { name: "Dr. Roshan de Silva", spec: "Fertility Specialist", exp: "8+ Years Exp", img: "👨‍⚕️" },
      { name: "Dr. Nilmini Jayasinghe", spec: "Consultant Gynaecologist", exp: "20+ Years Exp", img: "👩‍⚕️" }
    ];

    let currentHospitalKey = '';

    function openHospitalModal(nameKey, descKey) {
      currentHospitalKey = nameKey;
      const modal = document.getElementById('hospital-connect-modal');
      const nameEl = document.getElementById('modal-hospital-name');
      const descEl = document.getElementById('modal-hospital-desc');
      const container = document.getElementById('doctors-container');
      
      // Update text based on translations if available
      const hospitalName = L10n.t(nameKey) || 'Selected Hospital';
      const hospitalDesc = L10n.t(descKey) || 'Excellent care awaits you.';
      
      nameEl.textContent = 'Welcome to ' + hospitalName;
      descEl.textContent = hospitalDesc;
      
      // Render doctors
      container.innerHTML = mockDoctors.map((doc, index) => \`
        <div class="doctor-card" style="animation: slideUp 0.3s ease-out \${index * 0.1}s forwards; opacity:0;">
          <div class="doctor-avatar">\${doc.img}</div>
          <div class="doctor-name">\${doc.name}</div>
          <div class="doctor-spec">\${doc.spec}</div>
          <div class="doctor-exp">\${doc.exp}</div>
        </div>
      \`).join('');
      
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    function closeHospitalModal() {
      const modal = document.getElementById('hospital-connect-modal');
      modal.style.display = 'none';
      document.body.style.overflow = 'auto'; // Restore scrolling
    }
    
    function confirmConnection() {
      const hospitalName = L10n.t(currentHospitalKey) || 'the hospital';
      closeHospitalModal();
      Toast.success('Successfully connected to ' + hospitalName + '!');
    }
    
    // Close on outside click
    document.getElementById('hospital-connect-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeHospitalModal();
      }
    });
  </script>
`;

content = content.replace('<script src="../../assets/js/utils.js"></script>', modalHtml + '\n  <script src="../../assets/js/utils.js"></script>');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated hospitals.html');
