const fs = require('fs');
const path = require('path');

const forms = [
    {
        file: 'duty-roster.html',
        title: 'استمارة متابعة مناوبة المعلمين',
        dbKey: 'global_staff_db',
        thText: '<th>الاسم</th><th>تاريخ المراجعة</th><th>التخصص</th><th>مقر المناوبة</th><th>يوم المناوبة</th>',
        items: `[
    { text: 'الحضور المبكر لمقر المناوبة', w: 20 },
    { text: 'التواجد في المكان المخصص طوال فترة الفسحة', w: 20 },
    { text: 'الإشراف الفاعل على انصراف الطلاب', w: 20 },
    { text: 'حل المشكلات الطارئة أثناء المناوبة', w: 20 },
    { text: 'تسليم تقرير المناوبة للمشرف اليومي', w: 20 }
]`
    },
    {
        file: 'weak-student.html',
        title: 'استمارة حصر ومتابعة الطلاب المتأخرين دراسياً',
        dbKey: 'global_students_db',
        thText: '<th>اسم الطالب</th><th>الصف الدراسي</th><th>المادة</th><th>نوع الضعف</th><th>تاريخ المراجعة</th>',
        items: `[
    { text: 'الانتظام في الحضور وعدم الغياب المتكرر', w: 20 },
    { text: 'إحضار الكتب والأدوات المدرسية بانتظام', w: 20 },
    { text: 'المشاركة والتفاعل الإيجابي داخل الصف', w: 20 },
    { text: 'الالتزام بحل الواجبات وتسليم التكليفات', w: 20 },
    { text: 'مستوى التحسن الملحوظ في الاختبارات القصيرة', w: 20 }
]`
    },
    {
        file: 'gifted-student.html',
        title: 'نموذج ترشيح طالب موهوب / متميز سلوكياً',
        dbKey: 'global_students_db',
        thText: '<th>اسم الطالب</th><th>الصف الدراسي</th><th>مجال التفوق</th><th>المعدل التراكمي</th><th>تاريخ المراجعة</th>',
        items: `[
    { text: 'التفوق العلمي البارز في مادة التخصص أو بشكل عام', w: 20 },
    { text: 'القدرة العالية على الابتكار وحل المشكلات بطرق إبداعية', w: 20 },
    { text: 'المشاركة الفاعلة في المسابقات والأنشطة الإثرائية', w: 20 },
    { text: 'القيادة الإيجابية والمبادرة في الأنشطة المدرسية', w: 20 },
    { text: 'التميز في السلوك والانضباط المدرسي', w: 20 }
]`
    },
    {
        file: 'radio-eval.html',
        title: 'استمارة تقييم الإذاعة المدرسية',
        dbKey: 'global_classes_db',
        thText: '<th>الصف / الجماعة</th><th>موضوع الإذاعة</th><th>رائد الصف</th><th>الزمن المستغرق</th><th>التاريخ</th>',
        items: `[
    { text: 'الاستعداد المبكر والجاهزية قبل بداية الطابور', w: 20 },
    { text: 'تنوع الفقرات ومناسبتها للمرحلة العمرية', w: 20 },
    { text: 'جودة الإلقاء وسلامة اللغة العربية لدى الطلاب', w: 20 },
    { text: 'تفاعل الطلاب وانتباههم أثناء تقديم الإذاعة', w: 20 },
    { text: 'الالتزام بالوقت المحدد لبرنامج الإذاعة', w: 20 }
]`
    },
    {
        file: 'facility-tour.html',
        title: 'استمارة الجولة الإشرافية اليومية لمرافق المدرسة',
        dbKey: 'global_facilities_db',
        thText: '<th>المرفق المُتفقد</th><th>المسؤول عنه</th><th>حالة المرفق</th><th>وقت الجولة</th><th>تاريخ الجولة</th>',
        items: `[
    { text: 'نظافة الفصول الدراسية وسلامة التكييف والإنارة', w: 15 },
    { text: 'نظافة دورات المياه وتوفر المياه والصابون باستمرار', w: 15 },
    { text: 'نظافة الساحات والممرات والمظلات خالية من المخلفات', w: 15 },
    { text: 'المقصف المدرسي (النظافة، توفر الوجبات، التزام العمال بالزي)', w: 15 },
    { text: 'غرفة المعلمين (الترتيب، الجاهزية، وتوفر المستلزمات)', w: 10 },
    { text: 'المختبرات ومصادر التعلم (التنظيم الجيد وتوفر أدوات السلامة)', w: 15 },
    { text: 'سلامة الأبواب والنوافذ والمفاتيح الكهربائية وخلوها من المخاطر', w: 15 }
]`
    }
];

forms.forEach(form => {
    let p = path.join(__dirname, 'pages', form.file);
    if(fs.existsSync(p)){
        let c = fs.readFileSync(p, 'utf8');
        
        // Replace Title
        c = c.replace(/<title>.*?<\/title>/, `<title>\${form.title}</title>`);
        c = c.replace(/<div class="eval-title">.*?<\/div>/, `<div class="eval-title">\${form.title}</div>`);
        
        // Replace DB_KEY
        c = c.replace(/var DB_KEY\s*=\s*'[^']+';/, `var DB_KEY   = '\${form.dbKey}';`);
        c = c.replace(/window\.currentPageKey\s*=\s*'[^']+';/, `window.currentPageKey = '\${form.dbKey}_eval';`);
        
        // Replace Items
        c = c.replace(/var items = \[\s*\{[\s\S]*?\s*\];/, `var items = \${form.items};`);
        
        // Replace TH Row
        c = c.replace(/<th>الاسم<\/th><th>السجل المدني<\/th><th>التخصص<\/th><th>المؤهل<\/th><th>تاريخ المراجعة<\/th>/, form.thText);
        
        // Placeholder fixes
        if(form.file !== 'duty-roster.html'){
            c = c.replace('placeholder="الاسم الكامل"', 'placeholder="..."');
            c = c.replace('placeholder="رقم السجل"', 'placeholder="..."');
            c = c.replace('placeholder="المؤهل"', 'placeholder="..."');
            // Remove the oninput that connects to the teacher form signature if not relevant
            if(form.file === 'facility-tour.html' || form.file === 'radio-eval.html') {
                c = c.replace(/oninput="[^"]+"/g, "");
            }
        }
        
        fs.writeFileSync(p, c, 'utf8');
        console.log("Updated", form.file);
    }
});
