
$path = "c:\xampp\htdocs\pcos-hub\assets\js\utils.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# The corrupted block starts after the first Sinhala metformin desc and ends before metabolic risk title
$startMarker = 'info_treat_metformin_desc: "ඉන්සියුලින් ප්‍රතිරෝධය අඩු කර ඔසප් චක්‍රය පාලනය කිරීමට උපකාරී වේ.",'
$endMarker = 'info_risk_metabolic_title: "සමස්ත පරිවෘත්තීය සින්ඩ්‍රෝමය",'

$startIndex = $content.IndexOf($startMarker)
if ($startIndex -eq -1) { Write-Error "Start marker not found"; exit }
$startIndex += $startMarker.Length

$endIndex = $content.IndexOf($endMarker)
if ($endIndex -eq -1) { Write-Error "End marker not found"; exit }

$restoredContent = @"

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
"@

$newContent = $content.Substring(0, $startIndex) + $restoredContent + "`n      " + $content.Substring($endIndex)

[System.IO.File]::WriteAllText($path, $newContent, [System.Text.Encoding]::UTF8)
Write-Host "Restoration complete."
