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
    ]
});

export const LevelMap = Object.freeze({
    1: "easy",
    2: "medium",
    3: "hard"
});