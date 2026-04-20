const fs = require('fs');

const hospitalsData = [
    ['Castle Street Hospital for Women', 'Colombo', 'Gynaecology, Fertility, Endocrinology', 'Premier women’s hospital offering comprehensive care for hormonal disorders, infertility, and reproductive health.'],
    ['De Soysa Hospital for Women', 'Colombo', 'Gynaecology, Subfertility Clinics', 'One of the largest maternity hospitals with specialized clinics for hormonal imbalance and fertility issues.'],
    ['National Hospital of Sri Lanka', 'Colombo', 'Gynaecology, Endocrinology', 'Largest tertiary hospital providing multidisciplinary treatment for complex PCOS cases.'],
    ['Teaching Hospital Kandy', 'Kandy', 'Gynaecology, Research', 'Leading academic medical centre with strong women’s health and hormonal research facilities.'],
    ['Teaching Hospital Karapitiya', 'Galle', 'Gynaecology, Endocrine Care', 'Major teaching hospital with advanced reproductive and hormonal disorder management.'],
    ['Teaching Hospital Mahamodara', 'Galle', 'Gynaecology, Maternity', 'Specialized maternity hospital with services for menstrual and fertility-related conditions.'],
    ['Teaching Hospital Ragama (Colombo North)', 'Ragama', 'Gynaecology, Endocrinology', 'Academic hospital with specialist clinics for hormonal imbalance and reproductive health.'],
    ['Teaching Hospital Kalubowila (Colombo South)', 'Kalubowila', 'Gynaecology, General Medicine', 'Provides accessible PCOS diagnosis and treatment with specialist clinics.'],
    ['Teaching Hospital Anuradhapura', 'Anuradhapura', 'Gynaecology, Rural Health', 'Major regional hospital supporting women’s hormonal and reproductive care.'],
    ['Teaching Hospital Jaffna', 'Jaffna', 'Gynaecology, Fertility', 'Northern province’s main teaching hospital with advanced women’s health services.'],
    ['Teaching Hospital Batticaloa', 'Batticaloa', 'Gynaecology, Community Care', 'Provides reproductive and hormonal disorder management for eastern region patients.'],
    ['Sri Jayewardenepura General Hospital', 'Nugegoda', 'Gynaecology, Multidisciplinary Clinics', 'Offers specialized gynaecology clinics including hormonal and obesity-related conditions.'],
    ['Lanka Hospitals', 'Colombo', 'Women’s Wellness, Gynaecology', 'Private hospital with advanced diagnostics and comprehensive care for PCOS and hormonal disorders.'],
    ['Ninewells Hospital', 'Colombo', 'Gynaecology, Fertility, Well-woman clinics', 'Specialized private hospital focusing on women’s health, fertility, and hormonal conditions.'],
    ['Asiri Medical Hospital', 'Colombo', 'Gynaecology, Surgical Care', 'Provides advanced treatment for ovarian cysts, hormonal disorders, and reproductive issues.'],
    ['Durdans Hospital', 'Colombo', 'Gynaecology, Fertility, Endocrine', 'Well-established private hospital with expert specialists in reproductive health.'],
    ['Hemas Hospital Wattala', 'Wattala', 'Gynaecology, Maternity', 'Modern private hospital offering comprehensive women’s health and hormonal care.'],
    ['Hemas Hospital Thalawathugoda', 'Thalawathugoda', 'Gynaecology, Fertility', 'Well-equipped facility with specialist obstetric and gynaecological services.'],
    ['Blue Cross Hospital', 'Rajagiriya', 'Gynaecology, Specialist Clinics', 'Provides consultant-led care for PCOS, menstrual disorders, and reproductive issues.'],
    ['Neville Fernando Teaching Hospital', 'Malabe', 'Gynaecology, Teaching & Research', 'Modern teaching hospital with specialist obstetric and gynaecology services.']
];

let html = '<div class="hospitals-grid">\n';
hospitalsData.forEach((h, idx) => {
    let name = h[0];
    let location = h[1];
    
    let specialtiesStr = '';
    h[2].split(',').forEach(tag => {
        specialtiesStr += `<span class="specialty-tag">${tag.trim()}</span>`;
    });

    let desc = h[3];
    
    let delayClass = '';
    if ((idx % 3) === 1) delayClass = ' reveal-delay-1';
    if ((idx % 3) === 2) delayClass = ' reveal-delay-2';

    html += `        <div class="hospital-card reveal${delayClass}">
          <div class="hospital-icon">🏥</div>
          <h4>${name}</h4>
          <div class="location">📍 ${location}</div>
          <div class="hospital-specialties">${specialtiesStr}</div>
          <p style="font-size:.875rem;margin-bottom:auto">${desc}</p>
          <button class="btn btn-primary btn-sm" style="width:100%; margin-top:16px;" onclick="Toast.success('Connecting with ${name}...')">Connect</button>
        </div>\n`;
});
html += '      </div>';

let fileContent = fs.readFileSync('src/pages/hospitals.html', 'utf8');

// Replace everything within <div class="hospitals-grid">...</div>
let newContent = fileContent.replace(/<div class="hospitals-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, `${html}\n    </div>\n  </section>`);

fs.writeFileSync('src/pages/hospitals.html', newContent, 'utf8');
console.log('Restored 20 hospital cards securely in UTF-8.');
