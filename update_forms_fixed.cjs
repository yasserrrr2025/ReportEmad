const fs = require('fs');
const path = require('path');

const forms = [
    {
        file: 'duty-roster.html',
        title: 'استمارة متابعة مناوبة المعلمين',
        dbKey: 'global_staff_db',
        thText: '<th>الاسم</th><th>السجل المدني</th><th>التخصص</th><th>مقر المناوبة</th><th>تاريخ المراجعة</th>',
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
        thText: '<th>الاسم</th><th>السجل المدني</th><th>التخصص</th><th>المؤهل</th><th>تاريخ المراجعة</th>',
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
        thText: '<th>الاسم</th><th>السجل المدني</th><th>التخصص</th><th>المؤهل</th><th>تاريخ المراجعة</th>',
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
        thText: '<th>الاسم</th><th>السجل المدني</th><th>التخصص</th><th>المؤهل</th><th>تاريخ المراجعة</th>',
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
        thText: '<th>الاسم</th><th>السجل المدني</th><th>التخصص</th><th>المؤهل</th><th>تاريخ المراجعة</th>',
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
        c = c.replace(/<title>.*?<\/title>/, "<title>" + form.title + "</title>");
        c = c.replace(/<div class="eval-title">.*?<\/div>/, '<div class="eval-title">' + form.title + '</div>');
        
        // Replace DB_KEY
        c = c.replace(/var DB_KEY\s*=\s*'[^']+';/, "var DB_KEY   = '" + form.dbKey + "';");
        c = c.replace(/window\.currentPageKey\s*=\s*'[^']+';/, "window.currentPageKey = '" + form.dbKey + "_eval';");
        
        // Replace Items
        c = c.replace(/var items = \[\s*\{[\s\S]*?\s*\];/, "var items = " + form.items + ";");
        
        // Change management bar label
        if(form.dbKey === 'global_students_db') {
            c = c.replace(/<i class="fa-solid fa-users"><\/i> إدارة المعلمين/g, '<i class="fa-solid fa-user-graduate"></i> إدارة الطلاب');
            c = c.replace(/إضافة معلم/g, 'إضافة طالب');
            c = c.replace(/اسم المعلم/g, 'اسم الطالب');
            c = c.replace(/رقم السجل/g, 'رقم الهوية');
            c = c.replace(/التخصص/g, 'الصف الدراسي');
            c = c.replace(/المؤهل/g, 'المادة / مجال التفوق');
            c = c.replace(/استيراد \d+ معلم/g, 'استيراد طلاب');
        } else if (form.dbKey === 'global_classes_db') {
            c = c.replace(/<i class="fa-solid fa-users"><\/i> إدارة المعلمين/g, '<i class="fa-solid fa-users-rectangle"></i> إدارة الفصول/الجماعات');
            c = c.replace(/إضافة معلم/g, 'إضافة فصل/جماعة');
            c = c.replace(/اسم المعلم/g, 'الصف / الجماعة');
            c = c.replace(/رقم السجل/g, 'موضوع الإذاعة');
            c = c.replace(/التخصص/g, 'رائد الصف');
        } else if (form.dbKey === 'global_facilities_db') {
            c = c.replace(/<i class="fa-solid fa-users"><\/i> إدارة المعلمين/g, '<i class="fa-solid fa-building"></i> إدارة الجولات');
            c = c.replace(/إضافة معلم/g, 'إضافة مرفق');
            c = c.replace(/اسم المعلم/g, 'المرفق المتفقد');
        }

        fs.writeFileSync(p, c, 'utf8');
        console.log("Updated", form.file);
    }
});
