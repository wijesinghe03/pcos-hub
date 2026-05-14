<?php
require_once 'src/php/db_connect.php';

$blogs = [
    [
        'title_en' => 'The Best Anti-Inflammatory Diet for PCOS Management',
        'category' => 'diet',
        'image_url' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
        'description_en' => 'Discover how a low-glycaemic, anti-inflammatory diet can help manage insulin resistance, reduce androgen levels, and improve hormonal balance in PCOS.',
        'read_time' => 6,
        'content_en' => 'Content for Diet Article...' // I'll fill these with actual content if needed, but for now I'll use placeholders or the text from blog.html
    ],
    [
        'title_en' => 'Exercise Guide for Women with PCOS: What Works Best',
        'category' => 'exercise',
        'image_url' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
        'description_en' => 'A combination of strength training and cardio can significantly improve insulin sensitivity, support weight management, and reduce PCOS symptoms.',
        'read_time' => 5,
        'content_en' => 'Content for Exercise Article...'
    ],
    [
        'title_en' => 'Managing Anxiety and Depression Linked to PCOS',
        'category' => 'mental',
        'image_url' => '../../images/photo13.jpg',
        'description_en' => 'PCOS significantly increases the risk of depression and anxiety. Learn practical strategies for mental wellness including CBT, mindfulness, and community support.',
        'read_time' => 7,
        'content_en' => 'Content for Mental Health Article...'
    ],
    [
        'title_en' => 'Understanding Insulin Resistance in PCOS',
        'category' => 'hormones',
        'image_url' => 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&auto=format&fit=crop&q=80',
        'description_en' => 'Up to 70% of women with PCOS have insulin resistance. Learn how it affects your body, why it matters, and what you can do about it through lifestyle and medical approaches.',
        'read_time' => 8,
        'content_en' => 'Content for Insulin Resistance Article...'
    ],
    [
        'title_en' => 'PCOS and Fertility: What You Need to Know',
        'category' => 'fertility',
        'image_url' => '../../images/photo11.jpg',
        'description_en' => 'PCOS is one of the leading causes of female infertility, but most women with PCOS can conceive with the right treatment. Understand your options from lifestyle to IVF.',
        'read_time' => 9,
        'content_en' => 'Content for Fertility Article...'
    ],
    [
        'title_en' => 'Why Sleep Is Critical for PCOS Management',
        'category' => 'wellness',
        'image_url' => 'https://images.unsplash.com/photo-1544991875-5dc1b05f607d?w=600&auto=format&fit=crop&q=80',
        'description_en' => 'Poor sleep worsens insulin resistance, disrupts hormone balance, and increases cortisol in PCOS. Discover evidence-backed sleep hygiene strategies tailored for PCOS.',
        'read_time' => 5,
        'content_en' => 'Content for Sleep Article...'
    ]
];

foreach ($blogs as $blog) {
    $stmt = $pdo->prepare("INSERT INTO blogs (title_en, category, image_url, description_en, read_time, content_en) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $blog['title_en'], 
        $blog['category'], 
        $blog['image_url'], 
        $blog['description_en'], 
        $blog['read_time'],
        $blog['content_en']
    ]);
}

echo "Successfully seeded " . count($blogs) . " blogs.\n";
?>
