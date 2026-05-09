import { describe, it, expect } from 'vitest';
// In a real scenario, we would import L10n from utils.js
// For this demo, we'll test the structure of the translations object

const translations = {
  en: { dashboard: "Dashboard", settings: "Settings" },
  si: { dashboard: "ඩෑෂ්බෝඩ් එක", settings: "සිටින්ග්ස්" },
  ta: { dashboard: "டாஷ்போர்டு", settings: "அமைப்புகள்" }
};

describe('Localization Dictionary Integrity', () => {
  it('should have the same keys in all languages', () => {
    const languages = Object.keys(translations);
    const enKeys = Object.keys(translations.en).sort();
    
    languages.forEach(lang => {
      const currentKeys = Object.keys(translations[lang]).sort();
      expect(currentKeys).toEqual(enKeys);
    });
  });

  it('should not have empty values', () => {
    Object.values(translations).forEach(langDict => {
      Object.values(langDict).forEach(value => {
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });
});
