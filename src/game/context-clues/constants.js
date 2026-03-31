export const TutorialText = Object.freeze({
    T1: "สวัสดีตอน [...] นะครับ\n \n[เช้า] [กลางวัน] [เย็น]"
})
export const PresetQuiz = Object.freeze({
    easy: [
        {
            id: "quiz_001",
            textParts: ["สุนัขตัวนั้นเห่าเสียง", "จนฉันตกใจ"],
            correctAnswers: ["ดัง"],
            options: ["ดัง", "เบา", "กลัว"]
        },
        {
            id: "quiz_002",
            textParts: ["ฉันชอบกินผลไม้ที่มีรส", "มาก"],
            correctAnswers: ["หวาน"],
            options: ["เผ็ด", "หวาน", "สูง"]
        },
        {
            id: "quiz_003",
            textParts: ["แม่ทอดไข่เจียวกลิ่น", "ฟุ้งไปทั่วบ้าน"],
            correctAnswers: ["หอม"],
            options: ["เหม็น", "ขม", "หอม"]
        }
    ],
    hard: [
        {
            id: "quiz_001",
            textParts: ["ฉันชอบไปเที่ยว", "แต่เพื่อนของฉันชอบไปเที่ยว", "มากกว่า"],
            correctAnswers: ["ภูเขา", "ทะเล"],
            options: ["ภูเขา", "ทะเล", "ตู้เย็น", "หนังสือ"]
        },
        {
            id: "quiz_002",
            textParts: ["ก่อนออกจากบ้านทุกครั้ง อย่าลืมปิด", "และถอด", "เครื่องใช้ไฟฟ้าเพื่อความปลอดภัย"],
            correctAnswers: ["พัดลม", "ปลั๊ก"],
            options: ["พัดลม", "ปลั๊ก", "หน้าต่าง", "รองเท้า"]
        },
        {
            id: "quiz_003",
            textParts: ["การนอนหลับพักผ่อนให้เพียงพอจะช่วยให้", "ปลอดโปร่งและมีความ", "ที่ดีขึ้นในการเรียน"],
            correctAnswers: ["สมอง", "จำ"],
            options: ["สมอง", "จำ", "กระเพาะ", "ลืม"]
        }
    ]
});

export const LevelMap = Object.freeze({
    1: "easy",
    2: "medium",
    3: "hard"
});

export const BlankWord = Object.freeze({
    text: "วางคำ",
    isRender: true
});