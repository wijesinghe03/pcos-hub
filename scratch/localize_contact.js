
const fs = require('fs');
const path = 'assets/js/utils.js';

try {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Update English (ends before si: {)
    const siStart = content.indexOf('si: {');
    const enInsertionPoint = content.lastIndexOf('}', siStart - 1);
    
    const enKeys = `      contact_title: "Contact Us — PCOS Care Hub",
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
      contact_success_desc: "We will respond within 24 hours."`;

    content = content.substring(0, enInsertionPoint) + ',\n' + enKeys + '\n    ' + content.substring(enInsertionPoint);

    // 2. Update Sinhala (ends before ta: {)
    const taStart = content.indexOf('ta: {');
    const siInsertionPoint = content.lastIndexOf('}', taStart - 1);

    const siKeys = `      contact_title: "අප අමතන්න — PCOS Care Hub",
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
      contact_success_desc: "අපි පැය 24ක් ඇතුළත ප්‍රතිචාර දක්වන්නෙමු."`;

    content = content.substring(0, siInsertionPoint) + ',\n' + siKeys + '\n    ' + content.substring(siInsertionPoint);

    // 3. Update Tamil (ends before set(lang) {)
    const setLangStart = content.indexOf('set(lang) {');
    const taInsertionPoint = content.lastIndexOf('}', setLangStart - 1);

    const taKeys = `      contact_title: "தொடர்பு கொள்ள — PCOS Care Hub",
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
      contact_success_desc: "நாங்கள் 24 மணிநேரத்திற்குள் பதிலளிப்போம்."`;

    content = content.substring(0, taInsertionPoint) + ',\n' + taKeys + '\n    ' + content.substring(taInsertionPoint);

    fs.writeFileSync(path, content, 'utf8');
    console.log("Contact localization complete for all languages.");
} catch (err) {
    console.error(err);
    process.exit(1);
}
