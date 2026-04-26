const fs = require('fs');
const path = require('path');

const forms = [
    {
        file: 'duty-roster.html',
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
        
        // Fix items array which was broken in previous script
        c = c.replace(/var items = \$\{form\.items\};/g, "var items = " + form.items + ";");
        c = c.replace(/var items = \[\s*\{[\s\S]*?\s*\];/g, "var items = " + form.items + ";");

        // Remove the analysis grid (Strengths, Weaknesses, Opportunities, Notes)
        // It starts with <div class="analysis-grid"> and ends right before <!-- Signatures -->
        c = c.replace(/<!-- Analysis — 4 boxes with pre-defined checkable points -->[\s\S]*?<!-- Signatures -->/g, '<!-- Signatures -->');

        fs.writeFileSync(p, c, 'utf8');
        console.log("Updated", form.file);
    }
});
