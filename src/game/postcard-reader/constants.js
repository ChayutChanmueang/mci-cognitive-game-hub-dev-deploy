// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    title: 'Postcard',
    description: 'เกมอ่านข้อความและตอบคำถาม',
    instructions: 'อ่านข้อความในโปสการ์ด แล้วตอบคำถามให้ถูกต้อง',
    /** Default level shown when none is stored in session (1 = easy, 2 = medium, 3 = hard) */
    defaultLevel: 1,
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => {
        if (level === 1) return 'ประโยคสั้นๆ จำข้อมูลเดียว';
        if (level === 2) return '2 ประโยค จำข้อมูล 2 อย่าง';
        return '3 ประโยค มีตัวเลขเข้ามาเกี่ยว';
    },
    // Panel colour tokens — override the shared CSS defaults for this game
    panelBorderColor: '#54AC24',
    panelHeaderColor: '#65BD35',
    // Font colour tokens
    primaryFontColor: '#446930',
    secondaryFontColor: '#6F9F55',
});

// ---------------------------------------------------------------------------
// Game Over Panel Settings
// ---------------------------------------------------------------------------
export const GameOverSetting = Object.freeze({
    // Panel colour tokens for the game-over result panel
    panelBorderColor: '#54AC24',
    panelHeaderColor: '#65BD35',
    // Font colour tokens
    primaryFontColor: '#446930',
    secondaryFontColor: '#6F9F55',
});

// ---------------------------------------------------------------------------
// Game constants
// ---------------------------------------------------------------------------
export const SampleConstants = Object.freeze({
    VARIABLE1: "Testing..."
})
export const Difficulty = Object.freeze({
    EASY: 'Easy',
    NORMAL: 'Normal',
    HARD: 'Hard'
});

export const DifficultyLevelNumber = Object.freeze({
    [Difficulty.EASY]: 1,
    [Difficulty.NORMAL]: 2,
    [Difficulty.HARD]: 3,
});

export function getDifficultyLevelNumber(difficulty) {
    return DifficultyLevelNumber[difficulty] || Number(difficulty) || 1;
}

export const Config = Object.freeze({
    MaxPostcards: {
        [Difficulty.EASY]: 3,
        [Difficulty.NORMAL]: 5,
        [Difficulty.HARD]: 5
    },
    ScorePerCorrect: 20,
    MemoryTimeS: 15, // 15 seconds to memorize
    QuizTimeLimitMs: 180000 // 3 minutes for total quiz session
});

export const GameLevels = {
    [Difficulty.EASY]: [
        {
            Postcard: "สวัสดีครับตา วันนี้ผมไป ทะเล และกิน ปูเผา อร่อยมาก",
            Questions: [
                {
                    Question: "หลานไปเที่ยวที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "ทะเล", Sprite: "🌊", isCorrect: true },
                        { ChoiceText: "ภูเขา", Sprite: "⛰️", isCorrect: false },
                        { ChoiceText: "น้ำตก", Sprite: "🏞️", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานกินอะไร?",
                    Choice: [
                        { ChoiceText: "ปูเผา", Sprite: "🦀", isCorrect: true },
                        { ChoiceText: "ปลาทอด", Sprite: "🐟", isCorrect: false },
                        { ChoiceText: "กุ้งเผา", Sprite: "🦐", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมซื้อ เสื้อใหม่ สีฟ้า สวยมากครับ และซื้อ หมวก สีขาว มาด้วย",
            Questions: [
                {
                    Question: "หลานซื้อเสื้อสีอะไร?",
                    Choice: [
                        { ChoiceText: "สีฟ้า", Sprite: "🟦", isCorrect: true },
                        { ChoiceText: "สีแดง", Sprite: "🟥", isCorrect: false },
                        { ChoiceText: "สีเขียว", Sprite: "🟩", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้อหมวกสีอะไร?",
                    Choice: [
                        { ChoiceText: "สีขาว", Sprite: "🤍", isCorrect: true },
                        { ChoiceText: "สีดำ", Sprite: "🖤", isCorrect: false },
                        { ChoiceText: "สีเหลือง", Sprite: "💛", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "วันหยุดนี้ผมไป ปั่นจักรยาน ที่ สวนสาธารณะ สนุกมากครับ",
            Questions: [
                {
                    Question: "หลานไปทำกิจกรรมอะไร?",
                    Choice: [
                        { ChoiceText: "ปั่นจักรยาน", Sprite: "🚲", isCorrect: true },
                        { ChoiceText: "วิ่ง", Sprite: "🏃", isCorrect: false },
                        { ChoiceText: "เตะบอล", Sprite: "⚽", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "สวนสาธารณะ", Sprite: "🌳", isCorrect: true },
                        { ChoiceText: "ห้าง", Sprite: "🛒", isCorrect: false },
                        { ChoiceText: "ทะเล", Sprite: "🌊", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เมื่อเช้าผม ดื่มนม และกิน ขนมปังปิ้ง ก่อนไปโรงเรียน",
            Questions: [
                {
                    Question: "ตอนเช้าหลานดื่มอะไร?",
                    Choice: [
                        { ChoiceText: "นม", Sprite: "🥛", isCorrect: true },
                        { ChoiceText: "น้ำผลไม้", Sprite: "🧃", isCorrect: false },
                        { ChoiceText: "กาแฟ", Sprite: "☕", isCorrect: false }
                    ]
                },
                {
                    Question: "ตอนเช้าหลานกินอะไร?",
                    Choice: [
                        { ChoiceText: "ขนมปังปิ้ง", Sprite: "🍞", isCorrect: true },
                        { ChoiceText: "ไข่ดาว", Sprite: "🍳", isCorrect: false },
                        { ChoiceText: "ซีเรียล", Sprite: "🥣", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตอนเย็นผมไป เตะบอล กับเพื่อนที่ สนามหญ้า หน้าบ้าน",
            Questions: [
                {
                    Question: "ตอนเย็นหลานไปเล่นอะไร?",
                    Choice: [
                        { ChoiceText: "เตะบอล", Sprite: "⚽", isCorrect: true },
                        { ChoiceText: "แบดมินตัน", Sprite: "🏸", isCorrect: false },
                        { ChoiceText: "บาส", Sprite: "🏀", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานไปเล่นที่ไหน?",
                    Choice: [
                        { ChoiceText: "สนามหญ้า", Sprite: "🌱", isCorrect: true },
                        { ChoiceText: "ลานปูน", Sprite: "🛣️", isCorrect: false },
                        { ChoiceText: "โรงยิม", Sprite: "🏫", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไปเที่ยว สวนดอกไม้ และซื้อ ดอกกุหลาบ มาฝากแม่",
            Questions: [
                {
                    Question: "หลานไปเที่ยวที่ไหน?",
                    Choice: [
                        { ChoiceText: "สวนดอกไม้", Sprite: "🌷", isCorrect: true },
                        { ChoiceText: "ป่าชายเลน", Sprite: "🌳", isCorrect: false },
                        { ChoiceText: "ภูเขา", Sprite: "⛰️", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้อดอกอะไรมา?",
                    Choice: [
                        { ChoiceText: "กุหลาบ", Sprite: "🌹", isCorrect: true },
                        { ChoiceText: "ทานตะวัน", Sprite: "🌻", isCorrect: false },
                        { ChoiceText: "มะลิ", Sprite: "💮", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "แม่พาไป ตลาดสด และซื้อ มังคุด กลับมาบ้าน",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "ตลาดสด", Sprite: "🎪", isCorrect: true },
                        { ChoiceText: "ห้างสรรพสินค้า", Sprite: "🏬", isCorrect: false },
                        { ChoiceText: "ร้านสะดวกซื้อ", Sprite: "🏪", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้ออะไรกลับมา?",
                    Choice: [
                        { ChoiceText: "มังคุด", Sprite: "🟪", isCorrect: true },
                        { ChoiceText: "แตงโม", Sprite: "🍉", isCorrect: false },
                        { ChoiceText: "กล้วย", Sprite: "🍌", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "วันนี้ผมไป โรงหนัง และกิน ป๊อปคอร์น ตอนดูหนังครับ",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "โรงหนัง", Sprite: "🎬", isCorrect: true },
                        { ChoiceText: "สนามกีฬา", Sprite: "🏟️", isCorrect: false },
                        { ChoiceText: "โรงละคร", Sprite: "🎭", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานกินอะไรตอนดูหนัง?",
                    Choice: [
                        { ChoiceText: "ป๊อปคอร์น", Sprite: "🍿", isCorrect: true },
                        { ChoiceText: "ช็อกโกแลต", Sprite: "🍫", isCorrect: false },
                        { ChoiceText: "เฟรนช์ฟรายส์", Sprite: "🍟", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เราไปนั่ง คาเฟ่ และผมสั่ง ชาไข่มุก มากิน อร่อยมาก",
            Questions: [
                {
                    Question: "หลานไปนั่งที่ไหน?",
                    Choice: [
                        { ChoiceText: "คาเฟ่", Sprite: "☕", isCorrect: true },
                        { ChoiceText: "ร้านก๋วยเตี๋ยว", Sprite: "🍜", isCorrect: false },
                        { ChoiceText: "ร้านหมูกระทะ", Sprite: "🥩", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานสั่งอะไรมากิน?",
                    Choice: [
                        { ChoiceText: "ชาไข่มุก", Sprite: "🧋", isCorrect: true },
                        { ChoiceText: "น้ำอัดลม", Sprite: "🥤", isCorrect: false },
                        { ChoiceText: "ชาเขียว", Sprite: "🍵", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไป ห้องสมุด เพื่อไปอ่าน นิทาน เรื่องใหม่",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "ห้องสมุด", Sprite: "📚", isCorrect: true },
                        { ChoiceText: "โรงเรียน", Sprite: "🏫", isCorrect: false },
                        { ChoiceText: "บ้านเพื่อน", Sprite: "🏠", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานไปอ่านอะไร?",
                    Choice: [
                        { ChoiceText: "นิทาน", Sprite: "📖", isCorrect: true },
                        { ChoiceText: "หนังสือพิมพ์", Sprite: "📰", isCorrect: false },
                        { ChoiceText: "สมุดโน้ต", Sprite: "📒", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ไปเที่ยว น้ำตก น้ำเย็นมาก ผมเห็น ปลาคาร์ป ว่ายน้ำด้วย",
            Questions: [
                {
                    Question: "หลานไปเที่ยวที่ไหน?",
                    Choice: [
                        { ChoiceText: "น้ำตก", Sprite: "🏞️", isCorrect: true },
                        { ChoiceText: "ทะเล", Sprite: "🌊", isCorrect: false },
                        { ChoiceText: "บ่อน้ำพุร้อน", Sprite: "♨️", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานเห็นปลาอะไร?",
                    Choice: [
                        { ChoiceText: "ปลาคาร์ป", Sprite: "🎏", isCorrect: true },
                        { ChoiceText: "โลมา", Sprite: "🐬", isCorrect: false },
                        { ChoiceText: "ฉลาม", Sprite: "🦈", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไปดู ไดโนเสาร์ ที่ พิพิธภัณฑ์ ตัวใหญ่มากครับ",
            Questions: [
                {
                    Question: "หลานไปดูอะไร?",
                    Choice: [
                        { ChoiceText: "ไดโนเสาร์", Sprite: "🦖", isCorrect: true },
                        { ChoiceText: "ช้าง", Sprite: "🐘", isCorrect: false },
                        { ChoiceText: "เสือ", Sprite: "🐅", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานไปดูที่ไหน?",
                    Choice: [
                        { ChoiceText: "พิพิธภัณฑ์", Sprite: "🏛️", isCorrect: true },
                        { ChoiceText: "ละครสัตว์", Sprite: "🎪", isCorrect: false },
                        { ChoiceText: "สวนสัตว์", Sprite: "🌳", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไป ห้างสรรพสินค้า เพื่อไปซื้อ รองเท้าผ้าใบ คู่ใหม่",
            Questions: [
                {
                    Question: "หลานไปที่ไหน?",
                    Choice: [
                        { ChoiceText: "ห้างสรรพสินค้า", Sprite: "🏬", isCorrect: true },
                        { ChoiceText: "ตลาดนัด", Sprite: "🎪", isCorrect: false },
                        { ChoiceText: "มินิมาร์ท", Sprite: "🏪", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้ออะไร?",
                    Choice: [
                        { ChoiceText: "รองเท้าผ้าใบ", Sprite: "👟", isCorrect: true },
                        { ChoiceText: "รองเท้าแตะ", Sprite: "🩴", isCorrect: false },
                        { ChoiceText: "รองเท้าหนัง", Sprite: "👞", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "วันหยุดผมไป ฟาร์ม และได้ป้อนอาหาร แกะ ด้วยครับ",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "ฟาร์ม", Sprite: "🏡", isCorrect: true },
                        { ChoiceText: "ตึกตึกสูง", Sprite: "🏢", isCorrect: false },
                        { ChoiceText: "โรงงาน", Sprite: "🏭", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานป้อนอาหารสัตว์อะไร?",
                    Choice: [
                        { ChoiceText: "แกะ", Sprite: "🐑", isCorrect: true },
                        { ChoiceText: "วัว", Sprite: "🐄", isCorrect: false },
                        { ChoiceText: "หมู", Sprite: "🐖", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไป สระว่ายน้ำ และเอา แว่นตากันน้ำ ไปด้วย",
            Questions: [
                {
                    Question: "หลานไปที่ไหน?",
                    Choice: [
                        { ChoiceText: "สระว่ายน้ำ", Sprite: "🏊", isCorrect: true },
                        { ChoiceText: "ทะเล", Sprite: "🌊", isCorrect: false },
                        { ChoiceText: "แม่น้ำ", Sprite: "🏞️", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานเอาอะไรไปด้วย?",
                    Choice: [
                        { ChoiceText: "แว่นตากันน้ำ", Sprite: "🥽", isCorrect: true },
                        { ChoiceText: "ห่วงยาง", Sprite: "🛟", isCorrect: false },
                        { ChoiceText: "ชุดว่ายน้ำ", Sprite: "🩱", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ครอบครัวเราไป ภูเขา และกาง เต็นท์ นอนดูดาวกัน",
            Questions: [
                {
                    Question: "หลานไปเที่ยวที่ไหน?",
                    Choice: [
                        { ChoiceText: "ภูเขา", Sprite: "⛰️", isCorrect: true },
                        { ChoiceText: "เกาะ", Sprite: "🏝️", isCorrect: false },
                        { ChoiceText: "ทะเลทราย", Sprite: "🏜️", isCorrect: false }
                    ]
                },
                {
                    Question: "ครอบครัวไปนอนที่ไหน?",
                    Choice: [
                        { ChoiceText: "เต็นท์", Sprite: "⛺", isCorrect: true },
                        { ChoiceText: "โรงแรม", Sprite: "🏨", isCorrect: false },
                        { ChoiceText: "บ้านพัก", Sprite: "🏠", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เมื่อวานไป ร้านอาหาร และสั่ง พิซซ่า ถาดใหญ่มากิน",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "ร้านอาหาร", Sprite: "🍽️", isCorrect: true },
                        { ChoiceText: "ร้านขนมปัง", Sprite: "🍞", isCorrect: false },
                        { ChoiceText: "ร้านน้ำแข็งใส", Sprite: "🍧", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานสั่งอะไรมากิน?",
                    Choice: [
                        { ChoiceText: "พิซซ่า", Sprite: "🍕", isCorrect: true },
                        { ChoiceText: "สปาเก็ตตี้", Sprite: "🍝", isCorrect: false },
                        { ChoiceText: "เบอร์เกอร์", Sprite: "🍔", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตาครับ ผมไป ร้านของเล่น และซื้อ หุ่นยนต์ มาใหม่ 1 ตัว",
            Questions: [
                {
                    Question: "หลานไปที่ไหน?",
                    Choice: [
                        { ChoiceText: "ร้านของเล่น", Sprite: "🧸", isCorrect: true },
                        { ChoiceText: "ร้านเสื้อผ้า", Sprite: "👕", isCorrect: false },
                        { ChoiceText: "ร้านหนังสือ", Sprite: "📚", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้ออะไรมา?",
                    Choice: [
                        { ChoiceText: "หุ่นยนต์", Sprite: "🤖", isCorrect: true },
                        { ChoiceText: "รถบังคับ", Sprite: "🚗", isCorrect: false },
                        { ChoiceText: "โยโย่", Sprite: "🪀", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ที่ โรงเรียน วันนี้มีวิชาศิลปะ ผมได้ วาดรูป สนุกมาก",
            Questions: [
                {
                    Question: "หลานไปที่ไหน?",
                    Choice: [
                        { ChoiceText: "โรงเรียน", Sprite: "🏫", isCorrect: true },
                        { ChoiceText: "โรงพยาบาล", Sprite: "🏥", isCorrect: false },
                        { ChoiceText: "โบสถ์", Sprite: "⛪", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานทำกิจกรรมอะไร?",
                    Choice: [
                        { ChoiceText: "วาดรูป", Sprite: "🎨", isCorrect: true },
                        { ChoiceText: "ร้องเพลง", Sprite: "🎵", isCorrect: false },
                        { ChoiceText: "เต้นรำ", Sprite: "💃", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไป สถานีรถไฟ เพื่อซื้อ ตั๋ว ไปเที่ยวต่างจังหวัด",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "สถานีรถไฟ", Sprite: "🚉", isCorrect: true },
                        { ChoiceText: "สนามบิน", Sprite: "✈️", isCorrect: false },
                        { ChoiceText: "ท่ารถบัส", Sprite: "🚌", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานไปซื้ออะไร?",
                    Choice: [
                        { ChoiceText: "ตั๋ว", Sprite: "🎫", isCorrect: true },
                        { ChoiceText: "หนังสือพิมพ์", Sprite: "📰", isCorrect: false },
                        { ChoiceText: "ของกิน", Sprite: "🍔", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เราแวะ ร้านเบเกอรี่ และซื้อ ครัวซองต์ หอมๆ มากิน",
            Questions: [
                {
                    Question: "หลานแวะร้านอะไร?",
                    Choice: [
                        { ChoiceText: "ร้านเบเกอรี่", Sprite: "🥐", isCorrect: true },
                        { ChoiceText: "ร้านสเต็ก", Sprite: "🥩", isCorrect: false },
                        { ChoiceText: "ร้านซูชิ", Sprite: "🍣", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้ออะไรมากิน?",
                    Choice: [
                        { ChoiceText: "ครัวซองต์", Sprite: "🥐", isCorrect: true },
                        { ChoiceText: "โดนัท", Sprite: "🍩", isCorrect: false },
                        { ChoiceText: "เค้ก", Sprite: "🍰", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "พ่อพาไปเที่ยว สวนผลไม้ ผมได้กิน ทุเรียน อร่อยที่สุดเลย",
            Questions: [
                {
                    Question: "หลานไปเที่ยวที่ไหน?",
                    Choice: [
                        { ChoiceText: "สวนผลไม้", Sprite: "🌳", isCorrect: true },
                        { ChoiceText: "ทุ่งดอกไม้", Sprite: "🌻", isCorrect: false },
                        { ChoiceText: "ทุ่งนา", Sprite: "🌾", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานได้กินอะไร?",
                    Choice: [
                        { ChoiceText: "ทุเรียน", Sprite: "🍈", isCorrect: true },
                        { ChoiceText: "มะม่วง", Sprite: "🥭", isCorrect: false },
                        { ChoiceText: "สับปะรด", Sprite: "🍍", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตอนเย็นผมไป สนามเด็กเล่น และชอบเล่น ชิงช้า มากๆ",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "สนามเด็กเล่น", Sprite: "🛝", isCorrect: true },
                        { ChoiceText: "สวนสนุก", Sprite: "🎢", isCorrect: false },
                        { ChoiceText: "สนามกีฬา", Sprite: "🏟️", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานชอบเล่นอะไร?",
                    Choice: [
                        { ChoiceText: "ชิงช้า", Sprite: "🪢", isCorrect: true },
                        { ChoiceText: "สไลเดอร์", Sprite: "🛝", isCorrect: false },
                        { ChoiceText: "สเก็ตบอร์ด", Sprite: "🛹", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เมื่อคืนไปเที่ยว งานวัด ผมซื้อ สายไหม สีชมพูกินด้วยครับ",
            Questions: [
                {
                    Question: "หลานไปเที่ยวที่ไหน?",
                    Choice: [
                        { ChoiceText: "งานวัด", Sprite: "🎡", isCorrect: true },
                        { ChoiceText: "ตลาดกลางคืน", Sprite: "🎪", isCorrect: false },
                        { ChoiceText: "ห้าง", Sprite: "🏢", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้ออะไรกิน?",
                    Choice: [
                        { ChoiceText: "สายไหม", Sprite: "🍡", isCorrect: true },
                        { ChoiceText: "ป๊อปคอร์น", Sprite: "🍿", isCorrect: false },
                        { ChoiceText: "ฮอทดอก", Sprite: "🌭", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมปั่นจักรยานไป ไปรษณีย์ เพื่อส่ง จดหมาย หาคุณตาครับ",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "ไปรษณีย์", Sprite: "🏤", isCorrect: true },
                        { ChoiceText: "ธนาคาร", Sprite: "🏦", isCorrect: false },
                        { ChoiceText: "ร้านสะดวกซื้อ", Sprite: "🏪", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานไปส่งอะไร?",
                    Choice: [
                        { ChoiceText: "จดหมาย", Sprite: "✉️", isCorrect: true },
                        { ChoiceText: "พัสดุ", Sprite: "📦", isCorrect: false },
                        { ChoiceText: "ของเล่น", Sprite: "🧸", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "วันนี้แม่พาไป คลินิกทำฟัน เพื่อไป ถอนฟัน ที่ผุครับ",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "คลินิกทำฟัน", Sprite: "🏥", isCorrect: true },
                        { ChoiceText: "โรงเรียน", Sprite: "🏫", isCorrect: false },
                        { ChoiceText: "ห้างสรรพสินค้า", Sprite: "🏬", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานไปทำอะไร?",
                    Choice: [
                        { ChoiceText: "ถอนฟัน", Sprite: "🦷", isCorrect: true },
                        { ChoiceText: "ตรวจตา", Sprite: "👁️", isCorrect: false },
                        { ChoiceText: "ตรวจหู", Sprite: "👂", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เราไปเที่ยว ทะเลสาบ และเช่าเรือเพื่อ พายเรือ เล่นกัน",
            Questions: [
                {
                    Question: "หลานไปเที่ยวที่ไหน?",
                    Choice: [
                        { ChoiceText: "ทะเลสาบ", Sprite: "🏞️", isCorrect: true },
                        { ChoiceText: "ทะเล", Sprite: "🌊", isCorrect: false },
                        { ChoiceText: "สระว่ายน้ำ", Sprite: "💦", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานทำกิจกรรมอะไร?",
                    Choice: [
                        { ChoiceText: "พายเรือ", Sprite: "🛶", isCorrect: true },
                        { ChoiceText: "ว่ายน้ำ", Sprite: "🏊", isCorrect: false },
                        { ChoiceText: "ตกปลา", Sprite: "🎣", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไป อควาเรียม มาครับ ได้เห็นปลา ฉลาม ตัวใหญ่ว่ายผ่านหน้าด้วย",
            Questions: [
                {
                    Question: "หลานไปเที่ยวที่ไหน?",
                    Choice: [
                        { ChoiceText: "อควาเรียม", Sprite: "🦈", isCorrect: true },
                        { ChoiceText: "น้ำตก", Sprite: "🏞️", isCorrect: false },
                        { ChoiceText: "สวนสัตว์", Sprite: "🐒", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานเห็นปลาอะไรตัวใหญ่?",
                    Choice: [
                        { ChoiceText: "ฉลาม", Sprite: "🦈", isCorrect: true },
                        { ChoiceText: "โลมา", Sprite: "🐬", isCorrect: false },
                        { ChoiceText: "วาฬ", Sprite: "🐳", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไป ร้านดอกไม้ และซื้อ ดอกทานตะวัน มาจัดแจกันที่บ้าน",
            Questions: [
                {
                    Question: "หลานไปที่ไหนมา?",
                    Choice: [
                        { ChoiceText: "ร้านดอกไม้", Sprite: "💐", isCorrect: true },
                        { ChoiceText: "ร้านกาแฟ", Sprite: "☕", isCorrect: false },
                        { ChoiceText: "ร้านขนมปัง", Sprite: "🍞", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้อดอกอะไร?",
                    Choice: [
                        { ChoiceText: "ทานตะวัน", Sprite: "🌻", isCorrect: true },
                        { ChoiceText: "กุหลาบ", Sprite: "🌹", isCorrect: false },
                        { ChoiceText: "ทิวลิป", Sprite: "🌷", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมแวะ ร้านตัดผม เพราะผมยาวแล้ว เลยสั่งช่าง ตัดผมสั้น ครับ",
            Questions: [
                {
                    Question: "หลานไปที่ไหน?",
                    Choice: [
                        { ChoiceText: "ร้านตัดผม", Sprite: "✂️", isCorrect: true },
                        { ChoiceText: "ร้านซักรีด", Sprite: "👕", isCorrect: false },
                        { ChoiceText: "ร้านสะดวกซื้อ", Sprite: "🛒", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานทำอะไร?",
                    Choice: [
                        { ChoiceText: "ตัดผมสั้น", Sprite: "👦", isCorrect: true },
                        { ChoiceText: "ย้อมสีผม", Sprite: "👱", isCorrect: false },
                        { ChoiceText: "โกนหนวด", Sprite: "🧔", isCorrect: false }
                    ]
                }
            ]
        }
    ],
    [Difficulty.NORMAL]: [
        {
            Postcard: "วันนี้ผมไป สวนสัตว์ ตอนแรกว่าจะไปดู ยีราฟ แต่ผมชอบดู ช้าง มากกว่า เลยซื้อ กล้วย ไปให้มัน",
            Questions: [
                {
                    Question: "สรุปแล้วหลานชอบดูสัตว์อะไรมากกว่า?",
                    Choice: [
                        { ChoiceText: "ช้าง", Sprite: "🐘", isCorrect: true },
                        { ChoiceText: "ยีราฟ", Sprite: "🦒", isCorrect: false },
                        { ChoiceText: "ลิง", Sprite: "🐒", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้ออะไรให้สัตว์กิน?",
                    Choice: [
                        { ChoiceText: "กล้วย", Sprite: "🍌", isCorrect: true },
                        { ChoiceText: "แครอท", Sprite: "🥕", isCorrect: false },
                        { ChoiceText: "แตงโม", Sprite: "🍉", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไปเดิน ตลาดน้ำ เห็น น้ำแข็งใส น่ากินมาก แต่สุดท้ายก็ซื้อ ขนมครก มากิน แล้วก็ซื้อ น้ำมะพร้าว กลับบ้าน",
            Questions: [
                {
                    Question: "สรุปหลานซื้อขนมอะไรมากิน?",
                    Choice: [
                        { ChoiceText: "ขนมครก", Sprite: "🥞", isCorrect: true },
                        { ChoiceText: "น้ำแข็งใส", Sprite: "🍧", isCorrect: false },
                        { ChoiceText: "ลูกชิ้น", Sprite: "🍡", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานซื้อน้ำอะไรกลับบ้าน?",
                    Choice: [
                        { ChoiceText: "น้ำมะพร้าว", Sprite: "🥥", isCorrect: true },
                        { ChoiceText: "น้ำส้ม", Sprite: "🍊", isCorrect: false },
                        { ChoiceText: "น้ำแตงโม", Sprite: "🍉", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "อากาศ ร้อน มากครับ เพื่อนซื้อรส สตรอว์เบอร์รี แต่ผมซื้อ ไอศกรีม รสช็อกโกแลต มากินที่ใต้ ต้นไม้ใหญ่",
            Questions: [
                {
                    Question: "หลานกินไอศกรีมรสอะไร?",
                    Choice: [
                        { ChoiceText: "ช็อกโกแลต", Sprite: "🍫", isCorrect: true },
                        { ChoiceText: "สตรอว์เบอร์รี", Sprite: "🍓", isCorrect: false },
                        { ChoiceText: "วานิลลา", Sprite: "🍦", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานไปนั่งกินไอศกรีมที่ไหน?",
                    Choice: [
                        { ChoiceText: "ต้นไม้ใหญ่", Sprite: "🌳", isCorrect: true },
                        { ChoiceText: "ห้องแอร์", Sprite: "❄️", isCorrect: false },
                        { ChoiceText: "ริมสระน้ำ", Sprite: "🏖️", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "วันเกิดปีนี้ แม่ซื้อ กระเป๋า สีดำให้ แต่ผมอยากได้ สีน้ำตาล มากกว่า เลยไปเปลี่ยนที่ ห้างสรรพสินค้า",
            Questions: [
                {
                    Question: "ตอนแรกแม่ซื้อกระเป๋าสีอะไรให้?",
                    Choice: [
                        { ChoiceText: "สีดำ", Sprite: "⬛", isCorrect: true },
                        { ChoiceText: "สีน้ำตาล", Sprite: "🟫", isCorrect: false },
                        { ChoiceText: "สีแดง", Sprite: "🟥", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานเอาของไปเปลี่ยนที่ไหน?",
                    Choice: [
                        { ChoiceText: "ห้างสรรพสินค้า", Sprite: "🏬", isCorrect: true },
                        { ChoiceText: "ร้านสะดวกซื้อ", Sprite: "🏪", isCorrect: false },
                        { ChoiceText: "ตลาด", Sprite: "🎪", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไป ทะเล ตอนเช้ากะจะ ว่ายน้ำ แต่คลื่นแรง เลยเปลี่ยนใจมาสร้าง ปราสาททราย แทน",
            Questions: [
                {
                    Question: "ตอนแรกหลานตั้งใจจะทำกิจกรรมอะไร?",
                    Choice: [
                        { ChoiceText: "ว่ายน้ำ", Sprite: "🏊", isCorrect: true },
                        { ChoiceText: "เล่นเซิร์ฟ", Sprite: "🏄", isCorrect: false },
                        { ChoiceText: "ดำน้ำ", Sprite: "🤿", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วหลานทำกิจกรรมอะไร?",
                    Choice: [
                        { ChoiceText: "สร้างปราสาททราย", Sprite: "🏰", isCorrect: true },
                        { ChoiceText: "เตะฟุตบอล", Sprite: "⚽", isCorrect: false },
                        { ChoiceText: "เก็บหอย", Sprite: "🐚", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตอนแรกผมตั้งใจจะซื้อเสื้อ แขนสั้น แต่แอร์ที่ห้างเย็นมาก เลยเปลี่ยนใจซื้อเสื้อ แขนยาว แทน",
            Questions: [
                {
                    Question: "ตอนแรกหลานตั้งใจจะซื้อเสื้อแบบไหน?",
                    Choice: [
                        { ChoiceText: "แขนสั้น", Sprite: "👕", isCorrect: true },
                        { ChoiceText: "แขนยาว", Sprite: "🧥", isCorrect: false },
                        { ChoiceText: "แขนกุด", Sprite: "🎽", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วหลานซื้อเสื้อแบบไหน?",
                    Choice: [
                        { ChoiceText: "แขนยาว", Sprite: "🧥", isCorrect: true },
                        { ChoiceText: "แขนสั้น", Sprite: "👕", isCorrect: false },
                        { ChoiceText: "แขนกุด", Sprite: "🎽", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมอยากกินพิซซ่าหน้า ฮาวายเอี้ยน แต่เพื่อนแพ้สับปะรด เราเลยสั่งหน้า ซีฟู้ด มากินแทน",
            Questions: [
                {
                    Question: "ตอนแรกหลานอยากกินหน้าอะไร?",
                    Choice: [
                        { ChoiceText: "ฮาวายเอี้ยน", Sprite: "🍍", isCorrect: true },
                        { ChoiceText: "ซีฟู้ด", Sprite: "🦐", isCorrect: false },
                        { ChoiceText: "ชีส", Sprite: "🧀", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วสั่งพิซซ่าหน้าอะไร?",
                    Choice: [
                        { ChoiceText: "ซีฟู้ด", Sprite: "🦐", isCorrect: true },
                        { ChoiceText: "ฮาวายเอี้ยน", Sprite: "🍍", isCorrect: false },
                        { ChoiceText: "เปปเปอโรนี", Sprite: "🥓", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตอนแรกผมอยากเลี้ยง แมว มากๆ แต่พ่อบอกว่าแพ้ขนมัน สุดท้ายเลยไปซื้อ หมา มาเลี้ยงแทน",
            Questions: [
                {
                    Question: "ตอนแรกหลานอยากเลี้ยงสัตว์อะไร?",
                    Choice: [
                        { ChoiceText: "แมว", Sprite: "🐱", isCorrect: true },
                        { ChoiceText: "หมา", Sprite: "🐶", isCorrect: false },
                        { ChoiceText: "กระต่าย", Sprite: "🐰", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วที่บ้านเลี้ยงสัตว์อะไร?",
                    Choice: [
                        { ChoiceText: "หมา", Sprite: "🐶", isCorrect: true },
                        { ChoiceText: "แมว", Sprite: "🐱", isCorrect: false },
                        { ChoiceText: "แฮมสเตอร์", Sprite: "🐹", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมชอบรองเท้าสี ขาว นะ แต่มันเปื้อนง่ายมาก ผมเลยตัดสินใจซื้อสี ดำ มาใส่",
            Questions: [
                {
                    Question: "หลานชอบรองเท้าสีอะไร?",
                    Choice: [
                        { ChoiceText: "สีขาว", Sprite: "⚪", isCorrect: true },
                        { ChoiceText: "สีดำ", Sprite: "⚫", isCorrect: false },
                        { ChoiceText: "สีแดง", Sprite: "🔴", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วหลานซื้อรองเท้าสีอะไร?",
                    Choice: [
                        { ChoiceText: "สีดำ", Sprite: "⚫", isCorrect: true },
                        { ChoiceText: "สีขาว", Sprite: "⚪", isCorrect: false },
                        { ChoiceText: "สีฟ้า", Sprite: "🔵", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ไปตลาดว่าจะหาซื้อ มะม่วง มากิน แต่มันหมดเกลี้ยง เลยได้ แตงโม กลับมาบ้านแทน",
            Questions: [
                {
                    Question: "ตอนแรกหลานตั้งใจไปซื้อผลไม้อะไร?",
                    Choice: [
                        { ChoiceText: "มะม่วง", Sprite: "🥭", isCorrect: true },
                        { ChoiceText: "แตงโม", Sprite: "🍉", isCorrect: false },
                        { ChoiceText: "กล้วย", Sprite: "🍌", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานได้ผลไม้อะไรกลับมา?",
                    Choice: [
                        { ChoiceText: "แตงโม", Sprite: "🍉", isCorrect: true },
                        { ChoiceText: "มะม่วง", Sprite: "🥭", isCorrect: false },
                        { ChoiceText: "ส้ม", Sprite: "🍊", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เข้าร้านกาแฟ สั่ง ชาเขียว ไปแล้ว แต่เห็นโต๊ะข้างๆ น่ากิน เลยเดินไปเปลี่ยนออเดอร์เป็น กาแฟ ทันที",
            Questions: [
                {
                    Question: "หลานสั่งเครื่องดื่มอะไรไปตอนแรก?",
                    Choice: [
                        { ChoiceText: "ชาเขียว", Sprite: "🍵", isCorrect: true },
                        { ChoiceText: "กาแฟ", Sprite: "☕", isCorrect: false },
                        { ChoiceText: "โกโก้", Sprite: "🍫", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วหลานได้ดื่มอะไร?",
                    Choice: [
                        { ChoiceText: "กาแฟ", Sprite: "☕", isCorrect: true },
                        { ChoiceText: "ชาเขียว", Sprite: "🍵", isCorrect: false },
                        { ChoiceText: "ชาไข่มุก", Sprite: "🧋", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "กำลังจะหยิบ ดินสอ มาจดงาน แต่ไส้มันหักพอดี ผมเลยต้องใช้ ปากกา จดแทน",
            Questions: [
                {
                    Question: "ตอนแรกหลานจะใช้อะไรจดงาน?",
                    Choice: [
                        { ChoiceText: "ดินสอ", Sprite: "✏️", isCorrect: true },
                        { ChoiceText: "ปากกา", Sprite: "🖊️", isCorrect: false },
                        { ChoiceText: "สีเทียน", Sprite: "🖍️", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วหลานใช้อะไรจดงาน?",
                    Choice: [
                        { ChoiceText: "ปากกา", Sprite: "🖊️", isCorrect: true },
                        { ChoiceText: "ดินสอ", Sprite: "✏️", isCorrect: false },
                        { ChoiceText: "พู่กัน", Sprite: "🖌️", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เพื่อนชวนไปดูหนัง ผี แต่ผมกลัวจนนอนไม่หลับ เลยบังคับเพื่อนให้ดูหนัง ตลก แทน",
            Questions: [
                {
                    Question: "เพื่อนชวนหลานดูหนังแนวไหน?",
                    Choice: [
                        { ChoiceText: "หนังผี", Sprite: "👻", isCorrect: true },
                        { ChoiceText: "หนังตลก", Sprite: "😂", isCorrect: false },
                        { ChoiceText: "หนังแอคชัน", Sprite: "💥", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วได้ดูหนังแนวไหน?",
                    Choice: [
                        { ChoiceText: "หนังตลก", Sprite: "😂", isCorrect: true },
                        { ChoiceText: "หนังผี", Sprite: "👻", isCorrect: false },
                        { ChoiceText: "หนังเศร้า", Sprite: "😭", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เราขับรถตั้งใจจะไป ภูเขา แต่ฝนตกหนักดินถล่ม เลยเปลี่ยนเส้นทางไปเที่ยวน้ำตกแทน",
            Questions: [
                {
                    Question: "เป้าหมายแรกของการไปเที่ยวคือที่ไหน?",
                    Choice: [
                        { ChoiceText: "ภูเขา", Sprite: "⛰️", isCorrect: true },
                        { ChoiceText: "น้ำตก", Sprite: "🏞️", isCorrect: false },
                        { ChoiceText: "ทะเล", Sprite: "🌊", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วได้ไปเที่ยวที่ไหน?",
                    Choice: [
                        { ChoiceText: "น้ำตก", Sprite: "🏞️", isCorrect: true },
                        { ChoiceText: "ภูเขา", Sprite: "⛰️", isCorrect: false },
                        { ChoiceText: "เกาะ", Sprite: "🏝️", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "วันหยุดนี้กะจะ นอน ทั้งวันให้ฉ่ำ แต่ตื่นมาเบื่อๆ เลยหยิบ หนังสือ มาอ่านจนจบเล่ม",
            Questions: [
                {
                    Question: "ความตั้งใจแรกในวันหยุดคือทำอะไร?",
                    Choice: [
                        { ChoiceText: "นอน", Sprite: "🛌", isCorrect: true },
                        { ChoiceText: "อ่านหนังสือ", Sprite: "📖", isCorrect: false },
                        { ChoiceText: "เล่นเกม", Sprite: "🎮", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วหลานทำกิจกรรมอะไร?",
                    Choice: [
                        { ChoiceText: "อ่านหนังสือ", Sprite: "📖", isCorrect: true },
                        { ChoiceText: "นอน", Sprite: "🛌", isCorrect: false },
                        { ChoiceText: "ดูทีวี", Sprite: "📺", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ไปร้านขนมเห็น เค้ก สตรอว์เบอร์รีน่ากินมาก แต่เงินในกระเป๋าไม่พอ เลยได้ โดนัท ชิ้นเล็กๆ มาแทน",
            Questions: [
                {
                    Question: "หลานอยากกินขนมอะไรมากที่สุด?",
                    Choice: [
                        { ChoiceText: "เค้ก", Sprite: "🍰", isCorrect: true },
                        { ChoiceText: "โดนัท", Sprite: "🍩", isCorrect: false },
                        { ChoiceText: "คุกกี้", Sprite: "🍪", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วหลานได้ซื้อขนมอะไร?",
                    Choice: [
                        { ChoiceText: "โดนัท", Sprite: "🍩", isCorrect: true },
                        { ChoiceText: "เค้ก", Sprite: "🍰", isCorrect: false },
                        { ChoiceText: "ครัวซองต์", Sprite: "🥐", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมตั้งใจจะซื้อ ตุ๊กตา เป็นของขวัญวันเกิดให้น้อง แต่คิดไปคิดมาซื้อ นาฬิกา น่าจะมีประโยชน์กว่า",
            Questions: [
                {
                    Question: "ตอนแรกหลานจะซื้ออะไรเป็นของขวัญ?",
                    Choice: [
                        { ChoiceText: "ตุ๊กตา", Sprite: "🧸", isCorrect: true },
                        { ChoiceText: "นาฬิกา", Sprite: "⌚", isCorrect: false },
                        { ChoiceText: "เสื้อผ้า", Sprite: "👗", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานซื้ออะไรเป็นของขวัญ?",
                    Choice: [
                        { ChoiceText: "นาฬิกา", Sprite: "⌚", isCorrect: true },
                        { ChoiceText: "ตุ๊กตา", Sprite: "🧸", isCorrect: false },
                        { ChoiceText: "กระเป๋า", Sprite: "🎒", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ไปท่ารถเพื่อจะนั่ง รถบัส กลับบ้าน แต่รอไปชั่วโมงนึงรถไม่มา เลยเดินไปขึ้น เรือ แทน",
            Questions: [
                {
                    Question: "หลานตั้งใจจะเดินทางกลับด้วยอะไร?",
                    Choice: [
                        { ChoiceText: "รถบัส", Sprite: "🚌", isCorrect: true },
                        { ChoiceText: "เรือ", Sprite: "🚢", isCorrect: false },
                        { ChoiceText: "รถไฟ", Sprite: "🚆", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานเดินทางกลับด้วยอะไร?",
                    Choice: [
                        { ChoiceText: "เรือ", Sprite: "🚢", isCorrect: true },
                        { ChoiceText: "รถบัส", Sprite: "🚌", isCorrect: false },
                        { ChoiceText: "เครื่องบิน", Sprite: "✈️", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "นัดเพื่อนไปตี แบดมินตัน กันตอนเย็น แต่สนามเต็มทุกคอร์ด เลยย้ายไปตี ปิงปอง โต๊ะข้างๆ แทน",
            Questions: [
                {
                    Question: "หลานนัดเพื่อนไปเล่นกีฬาอะไร?",
                    Choice: [
                        { ChoiceText: "แบดมินตัน", Sprite: "🏸", isCorrect: true },
                        { ChoiceText: "ปิงปอง", Sprite: "🏓", isCorrect: false },
                        { ChoiceText: "เทนนิส", Sprite: "🎾", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานเล่นกีฬาอะไร?",
                    Choice: [
                        { ChoiceText: "ปิงปอง", Sprite: "🏓", isCorrect: true },
                        { ChoiceText: "แบดมินตัน", Sprite: "🏸", isCorrect: false },
                        { ChoiceText: "ฟุตบอล", Sprite: "⚽", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ไปปากคลองตลาดจะหา ดอกกุหลาบ ไปไหว้พระ แต่ช่อมันแพงมาก เลยซื้อ ดอกมะลิ มาร้อยพวงมาลัยแทน",
            Questions: [
                {
                    Question: "ตอนแรกหลานตั้งใจซื้อดอกอะไร?",
                    Choice: [
                        { ChoiceText: "กุหลาบ", Sprite: "🌹", isCorrect: true },
                        { ChoiceText: "มะลิ", Sprite: "💮", isCorrect: false },
                        { ChoiceText: "ทานตะวัน", Sprite: "🌻", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานซื้อดอกอะไรกลับมา?",
                    Choice: [
                        { ChoiceText: "มะลิ", Sprite: "💮", isCorrect: true },
                        { ChoiceText: "กุหลาบ", Sprite: "🌹", isCorrect: false },
                        { ChoiceText: "ทิวลิป", Sprite: "🌷", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตอนเช้าแม่ทำ ข้าวต้ม ไว้ให้บนโต๊ะ แต่ผมแอบปั่นจักรยานออกไปซื้อ โจ๊ก ปากซอยมากิน",
            Questions: [
                {
                    Question: "แม่ทำอาหารเช้าอะไรเตรียมไว้ให้?",
                    Choice: [
                        { ChoiceText: "ข้าวต้ม", Sprite: "🍲", isCorrect: true },
                        { ChoiceText: "โจ๊ก", Sprite: "🥣", isCorrect: false },
                        { ChoiceText: "ไข่ดาว", Sprite: "🍳", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วหลานกินอะไรเป็นมื้อเช้า?",
                    Choice: [
                        { ChoiceText: "โจ๊ก", Sprite: "🥣", isCorrect: true },
                        { ChoiceText: "ข้าวต้ม", Sprite: "🍲", isCorrect: false },
                        { ChoiceText: "ขนมปัง", Sprite: "🍞", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตอนสร้างบ้านพ่อบอกอยากทาห้องสี ฟ้า แต่แม่สั่งช่างให้ทาสี ชมพู ทั้งหมด สรุปแม่ชนะครับ",
            Questions: [
                {
                    Question: "พ่ออยากได้ห้องสีอะไร?",
                    Choice: [
                        { ChoiceText: "สีฟ้า", Sprite: "🟦", isCorrect: true },
                        { ChoiceText: "สีชมพู", Sprite: "🟪", isCorrect: false },
                        { ChoiceText: "สีเขียว", Sprite: "🟩", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วช่างทาสีห้องเป็นสีอะไร?",
                    Choice: [
                        { ChoiceText: "สีชมพู", Sprite: "🟪", isCorrect: true },
                        { ChoiceText: "สีฟ้า", Sprite: "🟦", isCorrect: false },
                        { ChoiceText: "สีเหลือง", Sprite: "🟨", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมนัดเจอเพื่อนตอน เช้า ที่สยาม แต่เพื่อนบอกว่าตื่นไม่ไหว เลยเลื่อนไปเจอกันตอน บ่าย แทน",
            Questions: [
                {
                    Question: "เวลานัดครั้งแรกคือตอนไหน?",
                    Choice: [
                        { ChoiceText: "ตอนเช้า", Sprite: "🌅", isCorrect: true },
                        { ChoiceText: "ตอนบ่าย", Sprite: "🌇", isCorrect: false },
                        { ChoiceText: "ตอนค่ำ", Sprite: "🌃", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วได้เจอกันตอนไหน?",
                    Choice: [
                        { ChoiceText: "ตอนบ่าย", Sprite: "🌇", isCorrect: true },
                        { ChoiceText: "ตอนเช้า", Sprite: "🌅", isCorrect: false },
                        { ChoiceText: "ตอนเที่ยง", Sprite: "🕛", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตอนแรกผมเล็งรถ เก๋ง คันเล็กๆ ไว้ขับไปทำงาน แต่คิดไปคิดมา ออกรถ กระบะ เผื่อขนของด้วยดีกว่า",
            Questions: [
                {
                    Question: "ตอนแรกหลานอยากซื้อรถประเภทไหน?",
                    Choice: [
                        { ChoiceText: "รถเก๋ง", Sprite: "🚗", isCorrect: true },
                        { ChoiceText: "รถกระบะ", Sprite: "🛻", isCorrect: false },
                        { ChoiceText: "มอเตอร์ไซค์", Sprite: "🏍️", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานตัดสินใจซื้อรถประเภทไหน?",
                    Choice: [
                        { ChoiceText: "รถกระบะ", Sprite: "🛻", isCorrect: true },
                        { ChoiceText: "รถเก๋ง", Sprite: "🚗", isCorrect: false },
                        { ChoiceText: "รถตู้", Sprite: "🚐", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "อ่างหน้าบ้านเคยใช้เลี้ยง ปลาทอง มาหลายปี แต่ตอนนี้ผมซื้อ ปลาคาร์ป มาปล่อยแทนแล้วครับ",
            Questions: [
                {
                    Question: "เมื่อก่อนหลานเลี้ยงปลาอะไร?",
                    Choice: [
                        { ChoiceText: "ปลาทอง", Sprite: "🐠", isCorrect: true },
                        { ChoiceText: "ปลาคาร์ป", Sprite: "🎏", isCorrect: false },
                        { ChoiceText: "ปลาหางนกยูง", Sprite: "🐟", isCorrect: false }
                    ]
                },
                {
                    Question: "ปัจจุบันหลานเลี้ยงปลาอะไร?",
                    Choice: [
                        { ChoiceText: "ปลาคาร์ป", Sprite: "🎏", isCorrect: true },
                        { ChoiceText: "ปลาทอง", Sprite: "🐠", isCorrect: false },
                        { ChoiceText: "ฉลาม", Sprite: "🦈", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ปกติผมเป็นคนชอบกินรส เผ็ด จัดมาก แต่วันนี้ปวดท้องเลยขอสั่งส้มตำรส เปรี้ยว นำแทน",
            Questions: [
                {
                    Question: "ปกติหลานชอบกินอาหารรสชาติไหน?",
                    Choice: [
                        { ChoiceText: "รสเผ็ด", Sprite: "🌶️", isCorrect: true },
                        { ChoiceText: "รสเปรี้ยว", Sprite: "🍋", isCorrect: false },
                        { ChoiceText: "รสเค็ม", Sprite: "🧂", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปวันนี้หลานสั่งส้มตำรสอะไร?",
                    Choice: [
                        { ChoiceText: "รสเปรี้ยว", Sprite: "🍋", isCorrect: true },
                        { ChoiceText: "รสเผ็ด", Sprite: "🌶️", isCorrect: false },
                        { ChoiceText: "รสหวาน", Sprite: "🍯", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมอยากเล่น กีตาร์ มากๆ แต่ที่บ้านไม่มีใครสอน สุดท้ายเลยต้องเรียน เปียโน กับพี่สาวแทน",
            Questions: [
                {
                    Question: "หลานอยากเล่นเครื่องดนตรีอะไรมากที่สุด?",
                    Choice: [
                        { ChoiceText: "กีตาร์", Sprite: "🎸", isCorrect: true },
                        { ChoiceText: "เปียโน", Sprite: "🎹", isCorrect: false },
                        { ChoiceText: "ไวโอลิน", Sprite: "🎻", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานได้เรียนเครื่องดนตรีอะไร?",
                    Choice: [
                        { ChoiceText: "เปียโน", Sprite: "🎹", isCorrect: true },
                        { ChoiceText: "กีตาร์", Sprite: "🎸", isCorrect: false },
                        { ChoiceText: "กลอง", Sprite: "🥁", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ไปร้านต้นไม้จะซื้อกระถาง พลาสติก เพราะมันเบา แต่เห็นกระถาง ดินเผา ลายสวยกว่าเลยซื้อกลับมา",
            Questions: [
                {
                    Question: "เหตุผลที่หลานจะซื้อกระถางพลาสติกตอนแรกคืออะไร?",
                    Choice: [
                        { ChoiceText: "พลาสติก", Sprite: "🪣", isCorrect: true },
                        { ChoiceText: "ดินเผา", Sprite: "🏺", isCorrect: false },
                        { ChoiceText: "ไม้", Sprite: "🪵", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานซื้อกระถางแบบไหนมา?",
                    Choice: [
                        { ChoiceText: "ดินเผา", Sprite: "🏺", isCorrect: true },
                        { ChoiceText: "พลาสติก", Sprite: "🪣", isCorrect: false },
                        { ChoiceText: "ปูน", Sprite: "🧱", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เมื่อคืนผมนอนหาหมอน ข้าง ไม่เจอ คลำไปคลำมาเลยหยิบหมอน หนุน อีกใบมากอดแทนจนหลับ",
            Questions: [
                {
                    Question: "ตอนแรกหลานกำลังหาหมอนอะไร?",
                    Choice: [
                        { ChoiceText: "หมอนข้าง", Sprite: "🌭", isCorrect: true },
                        { ChoiceText: "หมอนหนุน", Sprite: "🛏️", isCorrect: false },
                        { ChoiceText: "หมอนรองคอ", Sprite: "🍩", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานกอดหมอนอะไรนอน?",
                    Choice: [
                        { ChoiceText: "หมอนหนุน", Sprite: "🛏️", isCorrect: true },
                        { ChoiceText: "หมอนข้าง", Sprite: "🌭", isCorrect: false },
                        { ChoiceText: "อิง", Sprite: "🛋️", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมจะซื้อไฟฉายแบบใส่ ถ่าน เพราะถูกดี แต่คิดว่าแบบชาร์จ แบตเตอรี่ น่าจะสะดวกกว่าเลยซื้อแบบนั้น",
            Questions: [
                {
                    Question: "ตอนแรกหลานจะซื้อไฟฉายแบบไหน?",
                    Choice: [
                        { ChoiceText: "ใส่ถ่าน", Sprite: "🔋", isCorrect: true },
                        { ChoiceText: "ชาร์จแบต", Sprite: "🔌", isCorrect: false },
                        { ChoiceText: "โซลาร์เซลล์", Sprite: "☀️", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานซื้อไฟฉายแบบไหน?",
                    Choice: [
                        { ChoiceText: "ชาร์จแบต", Sprite: "🔌", isCorrect: true },
                        { ChoiceText: "ใส่ถ่าน", Sprite: "🔋", isCorrect: false },
                        { ChoiceText: "เทียน", Sprite: "🕯️", isCorrect: false }
                    ]
                }
            ]
        }
    ],
    [Difficulty.HARD]: [
        {
            Postcard: "ผมไป สวนสนุก ชวนเพื่อนไป 4 คน แต่มาจริงแค่ 3 คน ตอนแรกว่าจะขึ้น ม้าหมุน แต่คิวยาว เลยไปเล่น รถไฟเหาะ หวาดเสียวมากครับ",
            Questions: [
                {
                    Question: "สรุปแล้วหลานไปเที่ยวกับเพื่อนกี่คน?",
                    Choice: [
                        { ChoiceText: "3 คน", Sprite: "3️⃣", isCorrect: true },
                        { ChoiceText: "4 คน", Sprite: "4️⃣", isCorrect: false },
                        { ChoiceText: "2 คน", Sprite: "2️⃣", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานเล่นเครื่องเล่นอะไร?",
                    Choice: [
                        { ChoiceText: "รถไฟเหาะ", Sprite: "🎢", isCorrect: true },
                        { ChoiceText: "ม้าหมุน", Sprite: "🎠", isCorrect: false },
                        { ChoiceText: "ชิงช้าสวรรค์", Sprite: "🎡", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมซื้อ เสื้อใหม่ มา 2 ตัว สีแดงกับสีฟ้า ตอนแรกกะจะซื้อ 3 ตัวแต่เงินไม่พอ จ่ายแบงก์ 1000 ได้ทอนมา 500 บาทครับ",
            Questions: [
                {
                    Question: "หลานซื้อเสื้อใหม่มากี่ตัว?",
                    Choice: [
                        { ChoiceText: "2 ตัว", Sprite: "2️⃣", isCorrect: true },
                        { ChoiceText: "3 ตัว", Sprite: "3️⃣", isCorrect: false },
                        { ChoiceText: "1 ตัว", Sprite: "1️⃣", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานใช้เงินซื้อเสื้อไปกี่บาท?",
                    Choice: [
                        { ChoiceText: "500 บาท", Sprite: "💵", isCorrect: true },
                        { ChoiceText: "1000 บาท", Sprite: "💴", isCorrect: false },
                        { ChoiceText: "300 บาท", Sprite: "🪙", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "วันนี้ผมตื่น 7 โมงเช้า ปกติจะตื่น 8 โมง เพื่อรีบไปนั่ง รถไฟ ไปเยี่ยม ยาย ที่ต่างจังหวัด",
            Questions: [
                {
                    Question: "วันนี้หลานตื่นกี่โมง?",
                    Choice: [
                        { ChoiceText: "7 โมงเช้า", Sprite: "🕖", isCorrect: true },
                        { ChoiceText: "8 โมงเช้า", Sprite: "🕗", isCorrect: false },
                        { ChoiceText: "6 โมงเช้า", Sprite: "🕕", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานเดินทางด้วยยานพาหนะอะไร?",
                    Choice: [
                        { ChoiceText: "รถไฟ", Sprite: "🚆", isCorrect: true },
                        { ChoiceText: "รถบัส", Sprite: "🚌", isCorrect: false },
                        { ChoiceText: "เครื่องบิน", Sprite: "✈️", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ไปกิน หมูกระทะ กับครอบครัว ผู้ใหญ่ 4 เด็ก 2 คน ผมกิน กุ้งเผา ไปเยอะมากจนพุงกางเลย",
            Questions: [
                {
                    Question: "มีเด็กไปกินหมูกระทะกี่คน?",
                    Choice: [
                        { ChoiceText: "2 คน", Sprite: "2️⃣", isCorrect: true },
                        { ChoiceText: "4 คน", Sprite: "4️⃣", isCorrect: false },
                        { ChoiceText: "6 คน", Sprite: "6️⃣", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานกินอะไรเยอะที่สุด?",
                    Choice: [
                        { ChoiceText: "กุ้งเผา", Sprite: "🦐", isCorrect: true },
                        { ChoiceText: "หมูสามชั้น", Sprite: "🥓", isCorrect: false },
                        { ChoiceText: "ปลาหมึก", Sprite: "🦑", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมเก็บเงินได้ 300 บาท แม่ให้เพิ่ม 200 บาท รวมเป็น 500 บาท เลยเอาไปซื้อ หนังสือการ์ตูน เล่มใหม่ที่เพิ่งออก",
            Questions: [
                {
                    Question: "สรุปแล้วหลานมีเงินรวมกี่บาท?",
                    Choice: [
                        { ChoiceText: "500 บาท", Sprite: "💵", isCorrect: true },
                        { ChoiceText: "300 บาท", Sprite: "🪙", isCorrect: false },
                        { ChoiceText: "200 บาท", Sprite: "💴", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานเอาเงินไปซื้ออะไร?",
                    Choice: [
                        { ChoiceText: "หนังสือการ์ตูน", Sprite: "📕", isCorrect: true },
                        { ChoiceText: "ของเล่น", Sprite: "🤖", isCorrect: false },
                        { ChoiceText: "ขนม", Sprite: "🍬", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมไปตลาดซื้อ ส้ม มา 5 กิโลกรัม แบ่งให้ข้างบ้านไป 2 กิโลกรัม ตอนนี้ผมเหลือส้มกินเอง 3 กิโลกรัมครับ",
            Questions: [
                {
                    Question: "หลานซื้อส้มมาทั้งหมดกี่กิโลกรัม?",
                    Choice: [
                        { ChoiceText: "5 กิโล", Sprite: "5️⃣", isCorrect: true },
                        { ChoiceText: "2 กิโล", Sprite: "2️⃣", isCorrect: false },
                        { ChoiceText: "3 กิโล", Sprite: "3️⃣", isCorrect: false }
                    ]
                },
                {
                    Question: "ตอนนี้หลานเหลือส้มกี่กิโลกรัม?",
                    Choice: [
                        { ChoiceText: "3 กิโล", Sprite: "3️⃣", isCorrect: true },
                        { ChoiceText: "5 กิโล", Sprite: "5️⃣", isCorrect: false },
                        { ChoiceText: "2 กิโล", Sprite: "2️⃣", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เรานัดเจอกันตอน 10 โมงเช้า แต่เพื่อนตื่นสายเลยขอเลื่อนไปอีก 2 ชั่วโมง สรุปว่าเจอกันตอน เที่ยง ตรงเป๊ะเลย",
            Questions: [
                {
                    Question: "เวลานัดครั้งแรกคือตอนกี่โมง?",
                    Choice: [
                        { ChoiceText: "10 โมงเช้า", Sprite: "🕙", isCorrect: true },
                        { ChoiceText: "เที่ยงตรง", Sprite: "🕛", isCorrect: false },
                        { ChoiceText: "8 โมงเช้า", Sprite: "🕗", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วเจอกันตอนกี่โมง?",
                    Choice: [
                        { ChoiceText: "เที่ยงตรง", Sprite: "🕛", isCorrect: true },
                        { ChoiceText: "10 โมงเช้า", Sprite: "🕙", isCorrect: false },
                        { ChoiceText: "บ่ายสอง", Sprite: "🕑", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ของเล่นชิ้นนี้ป้ายราคา 500 บาท แต่ทางร้านใจดีลดราคาให้ 100 บาท ผมเลยจ่ายเงินไปแค่ 400 บาทเท่านั้น",
            Questions: [
                {
                    Question: "ของเล่นชิ้นนี้ราคาป้ายกี่บาท?",
                    Choice: [
                        { ChoiceText: "500 บาท", Sprite: "💵", isCorrect: true },
                        { ChoiceText: "100 บาท", Sprite: "🪙", isCorrect: false },
                        { ChoiceText: "400 บาท", Sprite: "💴", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปหลานจ่ายเงินไปกี่บาท?",
                    Choice: [
                        { ChoiceText: "400 บาท", Sprite: "💴", isCorrect: true },
                        { ChoiceText: "500 บาท", Sprite: "💵", isCorrect: false },
                        { ChoiceText: "100 บาท", Sprite: "🪙", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตอนเช้าผมวิ่งไป 5 กิโลเมตร พอเหนื่อยก็สลับเดินอีก 2 กิโลเมตร รวมระยะทางที่ออกกำลังกายวันนี้คือ 7 กิโลเมตร",
            Questions: [
                {
                    Question: "หลานวิ่งไปเป็นระยะทางเท่าไหร่?",
                    Choice: [
                        { ChoiceText: "5 กิโล", Sprite: "5️⃣", isCorrect: true },
                        { ChoiceText: "2 กิโล", Sprite: "2️⃣", isCorrect: false },
                        { ChoiceText: "7 กิโล", Sprite: "7️⃣", isCorrect: false }
                    ]
                },
                {
                    Question: "รวมระยะทางทั้งหมดคือกี่กิโลเมตร?",
                    Choice: [
                        { ChoiceText: "7 กิโล", Sprite: "7️⃣", isCorrect: true },
                        { ChoiceText: "5 กิโล", Sprite: "5️⃣", isCorrect: false },
                        { ChoiceText: "2 กิโล", Sprite: "2️⃣", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ในกล่องมี ดินสอ 10 แท่ง ผมแจกให้เพื่อนๆ ไป 4 แท่ง ทำให้ตอนนี้เหลือดินสอใช้เองแค่ 6 แท่ง",
            Questions: [
                {
                    Question: "หลานแจกดินสอให้เพื่อนไปกี่แท่ง?",
                    Choice: [
                        { ChoiceText: "4 แท่ง", Sprite: "4️⃣", isCorrect: true },
                        { ChoiceText: "10 แท่ง", Sprite: "🔟", isCorrect: false },
                        { ChoiceText: "6 แท่ง", Sprite: "6️⃣", isCorrect: false }
                    ]
                },
                {
                    Question: "ตอนนี้หลานเหลือดินสอกี่แท่ง?",
                    Choice: [
                        { ChoiceText: "6 แท่ง", Sprite: "6️⃣", isCorrect: true },
                        { ChoiceText: "10 แท่ง", Sprite: "🔟", isCorrect: false },
                        { ChoiceText: "4 แท่ง", Sprite: "4️⃣", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "แม่ใช้ให้ไปซื้อ ไข่ 12 ฟอง แต่ผมเดินสะดุดล้ม ไข่แตกไป 3 ฟอง กลับถึงบ้านเหลือไข่ดีแค่ 9 ฟอง",
            Questions: [
                {
                    Question: "แม่ใช้ไปซื้อไข่ทั้งหมดกี่ฟอง?",
                    Choice: [
                        { ChoiceText: "12 ฟอง", Sprite: "🥚", isCorrect: true },
                        { ChoiceText: "9 ฟอง", Sprite: "🍳", isCorrect: false },
                        { ChoiceText: "3 ฟอง", Sprite: "🐣", isCorrect: false }
                    ]
                },
                {
                    Question: "ไข่แตกไปกี่ฟอง?",
                    Choice: [
                        { ChoiceText: "3 ฟอง", Sprite: "🐣", isCorrect: true },
                        { ChoiceText: "12 ฟอง", Sprite: "🥚", isCorrect: false },
                        { ChoiceText: "9 ฟอง", Sprite: "🍳", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "วันนี้ผมทำงานปกติ 8 ชั่วโมง และทำโอทีเพิ่มอีก 2 ชั่วโมง รวมแล้ววันนี้ทำงานหนักถึง 10 ชั่วโมงเลย",
            Questions: [
                {
                    Question: "หลานทำโอทีเพิ่มกี่ชั่วโมง?",
                    Choice: [
                        { ChoiceText: "2 ชั่วโมง", Sprite: "2️⃣", isCorrect: true },
                        { ChoiceText: "8 ชั่วโมง", Sprite: "8️⃣", isCorrect: false },
                        { ChoiceText: "10 ชั่วโมง", Sprite: "🔟", isCorrect: false }
                    ]
                },
                {
                    Question: "รวมเวลาทำงานทั้งหมดคือกี่ชั่วโมง?",
                    Choice: [
                        { ChoiceText: "10 ชั่วโมง", Sprite: "🔟", isCorrect: true },
                        { ChoiceText: "8 ชั่วโมง", Sprite: "8️⃣", isCorrect: false },
                        { ChoiceText: "2 ชั่วโมง", Sprite: "2️⃣", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ที่ฟาร์มคุณลุงมี ไก่ 20 ตัว และมี เป็ด อีก 10 ตัว รวมมีสัตว์ปีกในฟาร์มทั้งหมด 30 ตัวครับ",
            Questions: [
                {
                    Question: "ที่ฟาร์มคุณลุงมีไก่กี่ตัว?",
                    Choice: [
                        { ChoiceText: "20 ตัว", Sprite: "🐔", isCorrect: true },
                        { ChoiceText: "10 ตัว", Sprite: "🦆", isCorrect: false },
                        { ChoiceText: "30 ตัว", Sprite: "🥚", isCorrect: false }
                    ]
                },
                {
                    Question: "รวมมีสัตว์ปีกทั้งหมดกี่ตัว?",
                    Choice: [
                        { ChoiceText: "30 ตัว", Sprite: "🥚", isCorrect: true },
                        { ChoiceText: "20 ตัว", Sprite: "🐔", isCorrect: false },
                        { ChoiceText: "10 ตัว", Sprite: "🦆", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เดือนก่อนผมหนัก 60 กิโล พอออกกำลังกายหนักน้ำหนักก็ลดไป 5 กิโล ตอนนี้เหลือแค่ 55 กิโลแล้ว",
            Questions: [
                {
                    Question: "น้ำหนักหลานลดไปกี่กิโล?",
                    Choice: [
                        { ChoiceText: "5 กิโล", Sprite: "5️⃣", isCorrect: true },
                        { ChoiceText: "60 กิโล", Sprite: "6️⃣", isCorrect: false },
                        { ChoiceText: "55 กิโล", Sprite: "⚖️", isCorrect: false }
                    ]
                },
                {
                    Question: "ตอนนี้น้ำหนักของหลานคือเท่าไหร่?",
                    Choice: [
                        { ChoiceText: "55 กิโล", Sprite: "⚖️", isCorrect: true },
                        { ChoiceText: "60 กิโล", Sprite: "6️⃣", isCorrect: false },
                        { ChoiceText: "5 กิโล", Sprite: "5️⃣", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ตอนพักเที่ยงผมซื้อ ข้าว 40 บาท และซื้อ น้ำแข็งใส อีก 15 บาท รวมจ่ายเงินไป 55 บาทพอดี",
            Questions: [
                {
                    Question: "หลานซื้อข้าวไปกี่บาท?",
                    Choice: [
                        { ChoiceText: "40 บาท", Sprite: "🍛", isCorrect: true },
                        { ChoiceText: "15 บาท", Sprite: "🍧", isCorrect: false },
                        { ChoiceText: "55 บาท", Sprite: "💵", isCorrect: false }
                    ]
                },
                {
                    Question: "รวมค่าอาหารและน้ำทั้งหมดกี่บาท?",
                    Choice: [
                        { ChoiceText: "55 บาท", Sprite: "💵", isCorrect: true },
                        { ChoiceText: "40 บาท", Sprite: "🍛", isCorrect: false },
                        { ChoiceText: "15 บาท", Sprite: "🍧", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "หนังสือนิทานเล่มนี้มี 70 หน้า ผมอ่านไปแล้ว 50 หน้า เหลืออีกแค่ 20 หน้าก็จะจบเล่มแล้ว",
            Questions: [
                {
                    Question: "หนังสือนิทานมีทั้งหมดกี่หน้า?",
                    Choice: [
                        { ChoiceText: "70 หน้า", Sprite: "📖", isCorrect: true },
                        { ChoiceText: "50 หน้า", Sprite: "🔖", isCorrect: false },
                        { ChoiceText: "20 หน้า", Sprite: "📄", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานเหลือหน้าที่ต้องอ่านอีกกี่หน้า?",
                    Choice: [
                        { ChoiceText: "20 หน้า", Sprite: "📄", isCorrect: true },
                        { ChoiceText: "70 หน้า", Sprite: "📖", isCorrect: false },
                        { ChoiceText: "50 หน้า", Sprite: "🔖", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมสะสมแสตมป์เซเว่นได้ 15 ดวง วันนี้เอาไปแลกของใช้ 10 ดวง ตอนนี้เลยเหลือแสตมป์ 5 ดวง",
            Questions: [
                {
                    Question: "ตอนแรกหลานมีแสตมป์กี่ดวง?",
                    Choice: [
                        { ChoiceText: "15 ดวง", Sprite: "🎫", isCorrect: true },
                        { ChoiceText: "10 ดวง", Sprite: "🛒", isCorrect: false },
                        { ChoiceText: "5 ดวง", Sprite: "🌟", isCorrect: false }
                    ]
                },
                {
                    Question: "ตอนนี้หลานเหลือแสตมป์กี่ดวง?",
                    Choice: [
                        { ChoiceText: "5 ดวง", Sprite: "🌟", isCorrect: true },
                        { ChoiceText: "15 ดวง", Sprite: "🎫", isCorrect: false },
                        { ChoiceText: "10 ดวง", Sprite: "🛒", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ข้อสอบวิชานี้มีคะแนนเต็ม 100 คะแนน ผมทำผิดโดนหักไป 20 คะแนน สรุปผมได้ 80 คะแนนครับ",
            Questions: [
                {
                    Question: "หลานทำข้อสอบผิดโดนหักกี่คะแนน?",
                    Choice: [
                        { ChoiceText: "20 คะแนน", Sprite: "❌", isCorrect: true },
                        { ChoiceText: "100 คะแนน", Sprite: "💯", isCorrect: false },
                        { ChoiceText: "80 คะแนน", Sprite: "✅", isCorrect: false }
                    ]
                },
                {
                    Question: "สรุปแล้วหลานสอบได้กี่คะแนน?",
                    Choice: [
                        { ChoiceText: "80 คะแนน", Sprite: "✅", isCorrect: true },
                        { ChoiceText: "100 คะแนน", Sprite: "💯", isCorrect: false },
                        { ChoiceText: "20 คะแนน", Sprite: "❌", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ในกระเป๋ามี ลูกอม 10 เม็ด เดินผ่านร้านขนมเลยซื้อเพิ่มอีก 5 เม็ด รวมเป็นมีลูกอม 15 เม็ด",
            Questions: [
                {
                    Question: "ตอนแรกหลานมีลูกอมในกระเป๋ากี่เม็ด?",
                    Choice: [
                        { ChoiceText: "10 เม็ด", Sprite: "🍬", isCorrect: true },
                        { ChoiceText: "5 เม็ด", Sprite: "🍭", isCorrect: false },
                        { ChoiceText: "15 เม็ด", Sprite: "🍫", isCorrect: false }
                    ]
                },
                {
                    Question: "รวมแล้วหลานมีลูกอมทั้งหมดกี่เม็ด?",
                    Choice: [
                        { ChoiceText: "15 เม็ด", Sprite: "🍫", isCorrect: true },
                        { ChoiceText: "10 เม็ด", Sprite: "🍬", isCorrect: false },
                        { ChoiceText: "5 เม็ด", Sprite: "🍭", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "แม่ทำ เค้ก 2 ก้อน เค้กแต่ละก้อนใช้แป้ง 500 กรัม รวมแล้วแม่ใช้แป้งไปทั้งหมด 1000 กรัม",
            Questions: [
                {
                    Question: "แม่ทำเค้กทั้งหมดกี่ก้อน?",
                    Choice: [
                        { ChoiceText: "2 ก้อน", Sprite: "🍰", isCorrect: true },
                        { ChoiceText: "5 ก้อน", Sprite: "🧁", isCorrect: false },
                        { ChoiceText: "10 ก้อน", Sprite: "🎂", isCorrect: false }
                    ]
                },
                {
                    Question: "รวมแม่ใช้แป้งไปทั้งหมดกี่กรัม?",
                    Choice: [
                        { ChoiceText: "1000 กรัม", Sprite: "⚖️", isCorrect: true },
                        { ChoiceText: "500 กรัม", Sprite: "🥄", isCorrect: false },
                        { ChoiceText: "200 กรัม", Sprite: "🥣", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "วันนี้วันที่ 5 แม่บอกว่าพรุ่งนี้วันที่ 6 จะพาไปสวนสนุก และมะรืนวันที่ 7 จะพาไปดูหนัง",
            Questions: [
                {
                    Question: "วันนี้คือวันที่เท่าไหร่?",
                    Choice: [
                        { ChoiceText: "วันที่ 5", Sprite: "🗓️", isCorrect: true },
                        { ChoiceText: "วันที่ 6", Sprite: "📅", isCorrect: false },
                        { ChoiceText: "วันที่ 7", Sprite: "📆", isCorrect: false }
                    ]
                },
                {
                    Question: "วันมะรืนคือวันที่เท่าไหร่?",
                    Choice: [
                        { ChoiceText: "วันที่ 7", Sprite: "📆", isCorrect: true },
                        { ChoiceText: "วันที่ 6", Sprite: "📅", isCorrect: false },
                        { ChoiceText: "วันที่ 5", Sprite: "🗓️", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "เราช่วยกันปลูก ต้นไม้ 4 ต้น แต่แดดร้อนมากตายไป 1 ต้น ตอนนี้เหลือรอดแค่ 3 ต้นครับ",
            Questions: [
                {
                    Question: "ตอนแรกช่วยกันปลูกต้นไม้กี่ต้น?",
                    Choice: [
                        { ChoiceText: "4 ต้น", Sprite: "🌱", isCorrect: true },
                        { ChoiceText: "1 ต้น", Sprite: "🥀", isCorrect: false },
                        { ChoiceText: "3 ต้น", Sprite: "🌳", isCorrect: false }
                    ]
                },
                {
                    Question: "เหลือต้นไม้รอดกี่ต้น?",
                    Choice: [
                        { ChoiceText: "3 ต้น", Sprite: "🌳", isCorrect: true },
                        { ChoiceText: "4 ต้น", Sprite: "🌱", isCorrect: false },
                        { ChoiceText: "1 ต้น", Sprite: "🥀", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "แมว ที่บ้านคลอดลูก 5 ตัว เป็นลูกแมวสีดำ 2 ตัว และเป็นสีขาว 3 ตัว น่ารักมากเลยครับ",
            Questions: [
                {
                    Question: "มีลูกแมวเกิดใหม่ทั้งหมดกี่ตัว?",
                    Choice: [
                        { ChoiceText: "5 ตัว", Sprite: "🐈", isCorrect: true },
                        { ChoiceText: "2 ตัว", Sprite: "⬛", isCorrect: false },
                        { ChoiceText: "3 ตัว", Sprite: "⬜", isCorrect: false }
                    ]
                },
                {
                    Question: "มีลูกแมวสีขาวกี่ตัว?",
                    Choice: [
                        { ChoiceText: "3 ตัว", Sprite: "⬜", isCorrect: true },
                        { ChoiceText: "2 ตัว", Sprite: "⬛", isCorrect: false },
                        { ChoiceText: "5 ตัว", Sprite: "🐈", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ผมนอนดูดาวอยู่บนหลังคา เห็นดาวสว่าง 8 ดวง จู่ๆ ก็มีดาวตกหายไป 2 ดวง เลยเหลือ 6 ดวง",
            Questions: [
                {
                    Question: "ตอนแรกหลานเห็นดาวบนฟ้ากี่ดวง?",
                    Choice: [
                        { ChoiceText: "8 ดวง", Sprite: "⭐", isCorrect: true },
                        { ChoiceText: "2 ดวง", Sprite: "☄️", isCorrect: false },
                        { ChoiceText: "6 ดวง", Sprite: "✨", isCorrect: false }
                    ]
                },
                {
                    Question: "เห็นดาวตกลงมากี่ดวง?",
                    Choice: [
                        { ChoiceText: "2 ดวง", Sprite: "☄️", isCorrect: true },
                        { ChoiceText: "8 ดวง", Sprite: "⭐", isCorrect: false },
                        { ChoiceText: "6 ดวง", Sprite: "✨", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "แม่สั่งให้ซื้อ ดอกกุหลาบ ช่อละ 10 ดอก ผมซื้อมา 2 ช่อ รวมได้ดอกกุหลาบมา 20 ดอก",
            Questions: [
                {
                    Question: "หลานซื้อกุหลาบมากี่ช่อ?",
                    Choice: [
                        { ChoiceText: "2 ช่อ", Sprite: "💐", isCorrect: true },
                        { ChoiceText: "10 ช่อ", Sprite: "🌹", isCorrect: false },
                        { ChoiceText: "20 ช่อ", Sprite: "🥀", isCorrect: false }
                    ]
                },
                {
                    Question: "รวมได้ดอกกุหลาบทั้งหมดกี่ดอก?",
                    Choice: [
                        { ChoiceText: "20 ดอก", Sprite: "🥀", isCorrect: true },
                        { ChoiceText: "10 ดอก", Sprite: "🌹", isCorrect: false },
                        { ChoiceText: "2 ดอก", Sprite: "💐", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "ของชิ้นนี้ราคา 150 บาท ผมยื่นแบงก์ 500 บาทให้แม่ค้า แม่ค้าเลยทอนเงินมาให้ 350 บาทครับ",
            Questions: [
                {
                    Question: "หลานจ่ายแบงก์อะไรให้แม่ค้า?",
                    Choice: [
                        { ChoiceText: "แบงก์ 500", Sprite: "💷", isCorrect: true },
                        { ChoiceText: "แบงก์ 100", Sprite: "💴", isCorrect: false },
                        { ChoiceText: "แบงก์ 1000", Sprite: "💶", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานได้รับเงินทอนกี่บาท?",
                    Choice: [
                        { ChoiceText: "350 บาท", Sprite: "💵", isCorrect: true },
                        { ChoiceText: "150 บาท", Sprite: "🪙", isCorrect: false },
                        { ChoiceText: "500 บาท", Sprite: "💷", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "งานวันเกิดผมเป่า ลูกโป่ง 12 ใบ เล่นไปเล่นมาแตกไป 5 ใบ สรุปเหลือก่อนเริ่มงานแค่ 7 ใบ",
            Questions: [
                {
                    Question: "ตอนแรกเป่าลูกโป่งไว้ทั้งหมดกี่ใบ?",
                    Choice: [
                        { ChoiceText: "12 ใบ", Sprite: "🎈", isCorrect: true },
                        { ChoiceText: "5 ใบ", Sprite: "💥", isCorrect: false },
                        { ChoiceText: "7 ใบ", Sprite: "🎉", isCorrect: false }
                    ]
                },
                {
                    Question: "ลูกโป่งแตกไปกี่ใบ?",
                    Choice: [
                        { ChoiceText: "5 ใบ", Sprite: "💥", isCorrect: true },
                        { ChoiceText: "12 ใบ", Sprite: "🎈", isCorrect: false },
                        { ChoiceText: "7 ใบ", Sprite: "🎉", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "แม่ซื้อ นม มา 6 กล่อง ผมกินวันละ 2 กล่อง ผ่านไป 3 วันนมก็หมดตู้เย็นพอดีเลยครับ",
            Questions: [
                {
                    Question: "แม่ซื้อนมมาให้ทั้งหมดกี่กล่อง?",
                    Choice: [
                        { ChoiceText: "6 กล่อง", Sprite: "🥛", isCorrect: true },
                        { ChoiceText: "2 กล่อง", Sprite: "🧃", isCorrect: false },
                        { ChoiceText: "3 กล่อง", Sprite: "📆", isCorrect: false }
                    ]
                },
                {
                    Question: "หลานใช้เวลากี่วันกินนมหมด?",
                    Choice: [
                        { ChoiceText: "3 วัน", Sprite: "📆", isCorrect: true },
                        { ChoiceText: "6 วัน", Sprite: "🥛", isCorrect: false },
                        { ChoiceText: "2 วัน", Sprite: "🧃", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "สั่ง พิซซ่า ถาดใหญ่มา 8 ชิ้น ผมกับน้องแย่งกันกินไป 3 ชิ้น เลยเหลือพิซซ่าในกล่อง 5 ชิ้น",
            Questions: [
                {
                    Question: "พิซซ่าถาดนี้มีกี่ชิ้น?",
                    Choice: [
                        { ChoiceText: "8 ชิ้น", Sprite: "🍕", isCorrect: true },
                        { ChoiceText: "3 ชิ้น", Sprite: "🍽️", isCorrect: false },
                        { ChoiceText: "5 ชิ้น", Sprite: "📦", isCorrect: false }
                    ]
                },
                {
                    Question: "เหลือพิซซ่าในกล่องกี่ชิ้น?",
                    Choice: [
                        { ChoiceText: "5 ชิ้น", Sprite: "📦", isCorrect: true },
                        { ChoiceText: "8 ชิ้น", Sprite: "🍕", isCorrect: false },
                        { ChoiceText: "3 ชิ้น", Sprite: "🍽️", isCorrect: false }
                    ]
                }
            ]
        },
        {
            Postcard: "พ่อสอนให้หยอด กระปุก วันละ 20 บาท พอผ่านไป 5 วัน ผมแคะกระปุกมานับได้เงิน 100 บาทพอดี",
            Questions: [
                {
                    Question: "พ่อให้หยอดกระปุกวันละกี่บาท?",
                    Choice: [
                        { ChoiceText: "20 บาท", Sprite: "🪙", isCorrect: true },
                        { ChoiceText: "5 บาท", Sprite: "🗓️", isCorrect: false },
                        { ChoiceText: "100 บาท", Sprite: "💵", isCorrect: false }
                    ]
                },
                {
                    Question: "รวมเงินที่เก็บได้ทั้งหมดคือกี่บาท?",
                    Choice: [
                        { ChoiceText: "100 บาท", Sprite: "💵", isCorrect: true },
                        { ChoiceText: "20 บาท", Sprite: "🪙", isCorrect: false },
                        { ChoiceText: "5 บาท", Sprite: "🗓️", isCorrect: false }
                    ]
                }
            ]
        }
    ]
};