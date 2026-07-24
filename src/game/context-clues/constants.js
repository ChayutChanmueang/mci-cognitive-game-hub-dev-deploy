// ---------------------------------------------------------------------------
// Start Menu Panel Settings
// ---------------------------------------------------------------------------
export const StartMenuSetting = Object.freeze({
    title: 'นักสืบเติมคำ',
    description: 'เกมฝึกอ่านบริบทและเลือกคำเติมประโยคให้ถูกต้อง',
    instructions: 'อ่านประโยคให้เข้าใจ แล้วเลือกคำที่เหมาะสมที่สุดเพื่อเติมลงในช่องว่าง',
    coverImage: 'assets/common/cover/cover_context_clue.png',
    titleFontSize: '80px',
    /** Default level shown when none is stored in session (1 = easy, 2 = medium, 3 = hard) */
    defaultLevel: 1,
    /** Callback-style template for the level detail string; receives `level` at render time */
    levelDetailTemplate: (level) => {
        if (level === 1) return 'ประโยคสั้น / ตัวเลือกพื้นฐาน';
        if (level === 2) return 'ประโยคยาวขึ้น / ใช้บริบทมากขึ้น';
        return 'โจทย์ซับซ้อน / ต้องตีความหลายส่วน';
    },
    // Panel colour tokens — override the shared CSS defaults for this game
    panelBorderColor: '#C73969',
    panelHeaderColor: '#E34F81',
    // Font colour tokens
    primaryFontColor: '#8F2448',
    secondaryFontColor: '#C8577C',
});

export const TutorialText = Object.freeze({
    T1: "สวัสดีตอน [...] นะครับ\n \n[เช้า] [กลางวัน] [เย็น]"
})

export const Config = Object.freeze({
    TimeLimitSeconds: 180,
    IncreaseScore: {
        easy: 5,
        medium: 5,
        hard: 5,
    },
    DecreaseScore: {
        easy: 0,
        medium: 0,
        hard: 0,
    },
    MaxRound: {
        easy: 10,
        medium: 10,
        hard: 10,
    },
    defaultGuide: "ลากคำศัพท์ไปเติมในช่องว่าง",
    fontSize_Guide: "56px",
})

export const QuizUI_Setting = Object.freeze({
    setting: {
        scaleSlot: {x: 320, y: 120},
        quizTextSize: 62.0,
        labelFontSize: 56.0,
        slotFontSize: 62.0,
        slotWidth: 300,
        // Answer choice box (the draggable option cards at the bottom).
        //   size     : visible card size (also drives the layout spacing between cards).
        //   hitArea  : pointer grab/collision size. Set it a bit larger than `size` so
        //              near-misses still register (US-E7-23). Keep each side's overflow
        //              smaller than the gap between cards (choiceGapX/Y = 62) so adjacent
        //              cards don't steal each other's input.
        //   hitOffset: nudge the collision box relative to the card center, in px.
        answerBox: {
            size: {x: 455, y: 145},
            hitArea: {x: 495, y: 185},
            hitOffset: {x: 0, y: 0},
        },
        // Blank "วางคำ" slot inside the sentence (where a word is dropped).
        //   size    : visible dashed-box size (width x height). width also reserves
        //             the space the slot occupies in the sentence flow. Falls back to
        //             the auto width (max of slotWidth / placeholder text) and to the
        //             sentence line height (scaleSlot.y) when not set.
        //   hitArea : the invisible drop/collision rect size. Set ≥ size so a word
        //             snaps in even on a near-miss drop (US-E7-23). Defaults to size.
        //   offset  : nudge the whole slot (border + drop rect + hint) in px, without
        //             changing where the surrounding sentence text flows.
        blankSlot: {
            size: {x: 420, y: 140},
            hitArea: {x: 455, y: 150},
            offset: {x: 0, y: 0},
        },
    },
    // White question panel size. Increase height here if the text area should be taller.
    quizBoxSize: {
        easy: [
            {
                width: 1020, 
                height:640
            }
        ],
        medium: [
            {
                width: 1020, 
                height:780
            }
        ],
        hard: [
            {
                width: 1020, 
                height:780
            }
        ]
    },
    paddingBoxQuestion: {
        easy: [
            {
                paddingX: 52,
                paddingY: 34,
            }
        ],
        medium: [
            {
                paddingX: 48,
                paddingY: 34,
            }
        ],
        hard: [
            {
                paddingX: 34,
                paddingY: 34,
            }
        ]
    },
    decreaseScorePosition: {
        easy: [
            {
                x: 0,
                y: -380
            }
        ],
        medium: [
            {
                x: 0,
                y: -460
            }
        ],
        hard: [
            {
                x: 0,
                y: -480
            }
        ]
    }
});

export const LevelMap = Object.freeze({
    1: "easy",
    2: "medium",
    3: "hard"
});

export const BlankWord = Object.freeze({
    text: "    วางคำ    ",
    isRender: true
});

export const PresetQuiz = Object.freeze({
    easy: {
        s1: [
            {
                id: "quiz_001",
                textParts: ["ครอบครัวเราขับรถไปเที่ยว", ""],
                correctAnswers: ["ทะเล"],
                options: ["ทะเล", "ทราย", "คลื่น"]
            },
            {
                id: "quiz_002",
                textParts: ["พอถึงที่พัก เราก็เอาของไปเก็บใน", ""],
                correctAnswers: ["ห้อง"],
                options: ["ห้อง", "ทะเล", "แดด"]
            },
            {
                id: "quiz_003",
                textParts: ["น้องชายรีบวิ่งไปเล่น", "ที่ริมหาด"],
                correctAnswers: ["ทราย"],
                options: ["ทราย", "ห้อง", "แดด"]
            },
            {
                id: "quiz_004",
                textParts: ["พ่อพาน้องลงไปว่าย", "ในทะเล"],
                correctAnswers: ["น้ำ"],
                options: ["น้ำ", "ลม", "แดด"]
            },
            {
                id: "quiz_005",
                textParts: ["มื้อเที่ยงเรากินอาหาร", "อร่อยมาก"],
                correctAnswers: ["ทะเล"],
                options: ["ทะเล", "ทราย", "คลื่น"]
            },
            {
                id: "quiz_006",
                textParts: ["ตอนบ่ายแม่นอนอาบ", "บนเตียงผ้าใบ"],
                correctAnswers: ["แดด"],
                options: ["แดด", "น้ำ", "ทราย"]
            },
            {
                id: "quiz_007",
                textParts: ["ตอนเย็นเรานั่งดูพระอาทิตย์", ""],
                correctAnswers: ["ตก"],
                options: ["ตก", "ว่าย", "สาด"]
            },
            {
                id: "quiz_008",
                textParts: ["มื้อค่ำเรากินกุ้ง", "น้ำจิ้มแซ่บมาก"],
                correctAnswers: ["เผา"],
                options: ["เผา", "อาบ", "จม"]
            },
            {
                id: "quiz_009",
                textParts: ["คืนนี้เรานอนฟังเสียง", "จนหลับไป"],
                correctAnswers: ["คลื่น"],
                options: ["คลื่น", "แดด", "กุ้ง"]
            },
            {
                id: "quiz_010",
                textParts: ["วันรุ่งขึ้นเราเก็บของนั่งรถกลับ", ""],
                correctAnswers: ["บ้าน"],
                options: ["บ้าน", "ทะเล", "หาดทราย"]
            },
        ],
        s2: [
            {
                id: "quiz_001",
                textParts: ["วันหยุดนี้เราไปกาง", "กันเถอะ"],
                correctAnswers: ["เต็นท์"],
                options: ["เต็นท์", "ต้นไม้", "กองไฟ"]
            },
            {
                id: "quiz_002",
                textParts: ["เราขับรถขึ้น", "ไปหาที่พัก"],
                correctAnswers: ["เขา"],
                options: ["เขา", "เต็นท์", "ดาว"]
            },
            {
                id: "quiz_003",
                textParts: ["เราหาที่กางเต็นท์ใต้ต้น", ""],
                correctAnswers: ["ไม้"],
                options: ["ไม้", "ถุงดำ", "เต็นท์"]
            },
            {
                id: "quiz_004",
                textParts: ["พ่อช่วยกันตอก", "ให้แน่น"],
                correctAnswers: ["สมอบก"],
                options: ["สมอบก", "กองไฟ", "กระทะ"]
            },
            {
                id: "quiz_005",
                textParts: ["ตอนเย็นอากาศเริ่ม", "มาก"],
                correctAnswers: ["หนาว"],
                options: ["หนาว", "มืด", "แคบ"]
            },
            {
                id: "quiz_006",
                textParts: ["พวกเราช่วยกันก่อกอง", "แก้หนาว"],
                correctAnswers: ["ไฟ"],
                options: ["ไฟ", "น้ำ", "ลม"]
            },
            {
                id: "quiz_007",
                textParts: ["แม่ทำอาหารด้วยกระทะ", ""],
                correctAnswers: ["ปิกนิก"],
                options: ["ปิกนิก", "สมอบก", "ต้นไม้"]
            },
            {
                id: "quiz_008",
                textParts: ["ดึกๆ เรานั่งดู", "เต็มท้องฟ้า"],
                correctAnswers: ["ดาว"],
                options: ["ดาว", "เต็นท์", "กองไฟ"]
            },
            {
                id: "quiz_009",
                textParts: ["ตื่นเช้ามาดูพระอาทิตย์", ""],
                correctAnswers: ["ขึ้น"],
                options: ["ขึ้น", "ตก", "หนาว"]
            },
            {
                id: "quiz_010",
                textParts: ["ก่อนกลับเราเก็บขยะใส่ถุง", ""],
                correctAnswers: ["ดำ"],
                options: ["ดำ", "ดาว", "ไฟ"]
            },
        ],
        s3: [
            {
                id: "quiz_001",
                textParts: ["เช้านี้ฉันตื่น", "เพราะลืมตั้งนาฬิกาปลุก"],
                correctAnswers: ["สาย"],
                options: ["สาย", "ประชุม", "เอกสาร"]
            },
            {
                id: "quiz_002",
                textParts: ["ฉันรีบอาบน้ำแต่ง", "เพื่อไปทำงานให้ทัน"],
                correctAnswers: ["ตัว"],
                options: ["ตัว", "งาน", "โต๊ะ"]
            },
            {
                id: "quiz_003",
                textParts: ["ฉันวิ่งไปขึ้นรถ", "ที่ป้ายหน้าปากซอย"],
                correctAnswers: ["เมล์"],
                options: ["เมล์", "ออฟฟิศ", "โต๊ะ"]
            },
            {
                id: "quiz_004",
                textParts: ["วันนี้รถติดหนักมากเพราะฝนเพิ่งจะ", ""],
                correctAnswers: ["ตก"],
                options: ["ตก", "สาย", "พิมพ์"]
            },
            {
                id: "quiz_005",
                textParts: ["ถึงที่ทำงานก็รีบสแกน", "เพื่อเข้างาน"],
                correctAnswers: ["นิ้ว"],
                options: ["นิ้ว", "โต๊ะ", "เก้าอี้"]
            },
            {
                id: "quiz_006",
                textParts: ["ตอนสายมีเรียก", "ด่วนกับหัวหน้า"],
                correctAnswers: ["ประชุม"],
                options: ["ประชุม", "สแกน", "เลิกงาน"]
            },
            {
                id: "quiz_007",
                textParts: ["ฉันนั่งพิมพ์งานจนปวด", "ไปหมด"],
                correctAnswers: ["ตา"],
                options: ["ตา", "รถ", "ฝน"]
            },
            {
                id: "quiz_008",
                textParts: ["มื้อเที่ยงลงไปกินข้าวที่ศูนย์อาหารใต้", ""],
                correctAnswers: ["ตึก"],
                options: ["ตึก", "โต๊ะ", "เมล์"]
            },
            {
                id: "quiz_009",
                textParts: ["ตอนบ่ายลูกค้าโทรมาสั่ง", "ล็อตใหญ่"],
                correctAnswers: ["สินค้า"],
                options: ["สินค้า", "ประชุม", "ฝน"]
            },
            {
                id: "quiz_010",
                textParts: ["เลิกงานตอนเย็นฉันก็รีบกลับ", "ไปพักผ่อน"],
                correctAnswers: ["บ้าน"],
                options: ["บ้าน", "ออฟฟิศ", "คอมพิวเตอร์"]
            },
        ],
        s4: [
            {
                id: "quiz_001",
                textParts: ["วันนี้ฉันรู้สึกไม่สบาย เลยต้องไป", ""],
                correctAnswers: ["โรงพยาบาล"],
                options: ["โรงพยาบาล", "ตลาด", "วัด"]
            },
            {
                id: "quiz_002",
                textParts: ["แม่พาฉันไปนั่งรอพบคุณ", ""],
                correctAnswers: ["หมอ"],
                options: ["หมอ", "ครู", "ตำรวจ"]
            },
            {
                id: "quiz_003",
                textParts: ["พยาบาลเรียกชื่อให้ไปวัด", ""],
                correctAnswers: ["ไข้"],
                options: ["ไข้", "หน้า", "จมูก"]
            },
            {
                id: "quiz_004",
                textParts: ["ฉันกลัวตอนที่พยาบาลจะฉีด", ""],
                correctAnswers: ["ยา"],
                options: ["ยา", "น้ำ", "นม"]
            },
            {
                id: "quiz_005",
                textParts: ["คุณหมอบอกว่าฉันเป็นไข้", ""],
                correctAnswers: ["หวัด"],
                options: ["หวัด", "หลับ", "ใจ"]
            },
            {
                id: "quiz_006",
                textParts: ["แม่รับถุงยาแล้วจ่าย", ""],
                correctAnswers: ["เงิน"],
                options: ["เงิน", "ทอง", "กระดาษ"]
            },
            {
                id: "quiz_007",
                textParts: ["ฉันต้องกินยาหลังอาหารทุก", ""],
                correctAnswers: ["มื้อ"],
                options: ["มื้อ", "ปี", "เดือน"]
            },
            {
                id: "quiz_008",
                textParts: ["ยาน้ำขวดนี้มีรสชาติ", ""],
                correctAnswers: ["หวาน"],
                options: ["หวาน", "เผ็ด", "เสีย"]
            },
            {
                id: "quiz_009",
                textParts: ["หมอบอกให้ฉันนอนพักผ่อนให้", ""],
                correctAnswers: ["เพียงพอ"],
                options: ["เพียงพอ", "น้อย", "มากเกิน"]
            },
            {
                id: "quiz_010",
                textParts: ["รับยาเสร็จแล้วก็เดินทางกลับ", ""],
                correctAnswers: ["บ้าน"],
                options: ["บ้าน", "ทะเล", "ภูเขา"]
            },
        ],
        s5: [
            {
                id: "quiz_001",
                textParts: ["แม่พาฉันไปเปิดบัญชีที่", ""],
                correctAnswers: ["ธนาคาร"],
                options: ["ธนาคาร", "ไปรษณีย์", "ตลาด"]
            },
            {
                id: "quiz_002",
                textParts: ["เดินเข้าไปปุ๊บก็ต้องกดบัตร", ""],
                correctAnswers: ["คิว"],
                options: ["คิว", "โทรศัพท์", "เกม"]
            },
            {
                id: "quiz_003",
                textParts: ["พนักงานให้กรอก", "เพื่อเปิดบัญชีใหม่"],
                correctAnswers: ["เอกสาร"],
                options: ["เอกสาร", "ข้อสอบ", "จดหมาย"]
            },
            {
                id: "quiz_004",
                textParts: ["ฉันยื่นบัตร", "ให้พนักงานดู"],
                correctAnswers: ["ประชาชน"],
                options: ["ประชาชน", "ปลอม", "ห้องสมุด"]
            },
            {
                id: "quiz_005",
                textParts: ["พนักงานมอบสมุด", "เล่มใหม่ให้ฉัน"],
                correctAnswers: ["บัญชี"],
                options: ["บัญชี", "นิทาน", "วาดเขียน"]
            },
            {
                id: "quiz_006",
                textParts: ["แม่เอาเงินไป", "ที่หน้าเคาน์เตอร์"],
                correctAnswers: ["ฝาก"],
                options: ["ฝาก", "ทิ้ง", "ซ่อน"]
            },
            {
                id: "quiz_007",
                textParts: ["ฉันตั้งรหัส", "สำหรับใช้ตู้เอทีเอ็ม"],
                correctAnswers: ["ผ่าน"],
                options: ["ผ่าน", "เก่า", "ประตู"]
            },
            {
                id: "quiz_008",
                textParts: ["วันนี้คนมาธนาคารเยอะจนต้องยืน", ""],
                correctAnswers: ["รอ"],
                options: ["รอ", "หลับ", "เต้น"]
            },
            {
                id: "quiz_009",
                textParts: ["สมุดบัญชีช่วยให้เรารู้จักการ", "เงิน"],
                correctAnswers: ["ออม"],
                options: ["ออม", "เสีย", "แจก"]
            },
            {
                id: "quiz_010",
                textParts: ["ทำธุระเสร็จแล้วเราก็กลับ", ""],
                correctAnswers: ["บ้าน"],
                options: ["บ้าน", "โรงพยาบาล", "วัด"]
            },
        ],
    },
    medium: {
        s1: [
            {
                id: "quiz_001",
                textParts: ["วันหยุดยาวนี้ พวกเราตกลงกันว่าจะขับรถไปพักผ่อนที่", ""],
                correctAnswers: ["ชายหาด"],
                options: ["ชายหาด", "ชุดว่ายน้ำ", "เกลียวคลื่น"]
            },
            {
                id: "quiz_002",
                textParts: ["ทันทีที่ไปถึงรีสอร์ต เรานำกระเป๋าไปเก็บและเตรียมตัวเปลี่ยน", ""],
                correctAnswers: ["ชุด"],
                options: ["ชุด", "แดด", "เตียงผ้าใบ"]
            },
            {
                id: "quiz_003",
                textParts: ["น้องชายหยิบอุปกรณ์ไปนั่งก่อปราสาท", "อย่างสนุกสนานริมชายหาด"],
                correctAnswers: ["ทราย"],
                options: ["ทราย", "น้ำทะเล", "ซีฟู้ด"]
            },
            {
                id: "quiz_004",
                textParts: ["คุณพ่อสวมเสื้อชูชีพให้น้องก่อนที่จะพาลงไปเล่น", ""],
                correctAnswers: ["น้ำทะเล"],
                options: ["น้ำทะเล", "แดด", "ลมทะเล"]
            },
            {
                id: "quiz_005",
                textParts: ["มื้อเที่ยงครอบครัวของเราไปทานอาหาร", "ริมหาดที่สดและอร่อยมาก"],
                correctAnswers: ["ทะเล"],
                options: ["ทะเล", "เสื้อชูชีพ", "ปราสาททราย"]
            },
            {
                id: "quiz_006",
                textParts: ["ช่วงบ่ายคุณแม่เลือกที่จะนอนอ่านหนังสือและอาบ", "บนเตียงผ้าใบ"],
                correctAnswers: ["แดด"],
                options: ["แดด", "น้ำทะเล", "เกลียวคลื่น"]
            },
            {
                id: "quiz_007",
                textParts: ["ก่อนค่ำพวกเรามานั่งรวมตัวกันเพื่อชมความสวยงามของพระอาทิตย์", ""],
                correctAnswers: ["ตกดิน"],
                options: ["ตกดิน", "ว่ายน้ำ", "ก่อทราย"]
            },
            {
                id: "quiz_008",
                textParts: ["มื้อค่ำเรามีปาร์ตี้บาร์บีคิวและกุ้ง", "พร้อมน้ำจิ้มรสเด็ด"],
                correctAnswers: ["เผา"],
                options: ["เผา", "อาบ", "สวม"]
            },
            {
                id: "quiz_009",
                textParts: ["คืนนี้ทุกคนหลับสนิทไปพร้อมกับเสียง", "ที่พัดเข้าหาฝั่ง"],
                correctAnswers: ["คลื่น"],
                options: ["คลื่น", "แสงแดด", "ชุดว่ายน้ำ"]
            },
            {
                id: "quiz_010",
                textParts: ["รุ่งเช้าพวกเราเก็บสัมภาระและเดินทางกลับ", "ด้วยความประทับใจ"],
                correctAnswers: ["ภูมิลำเนา"],
                options: ["ภูมิลำเนา", "ชายหาด", "ท้องทะเล"]
            },
        ],
        s2: [
            {
                id: "quiz_001",
                textParts: ["วันหยุดยาวนี้ฉันจะไปตั้งแคมป์รับลม", "บนยอดดอย"],
                correctAnswers: ["หนาว"],
                options: ["หนาว", "เต็นท์", "ฟืน"]
            },
            {
                id: "quiz_002",
                textParts: ["ถนนทางขึ้นดอยคดเคี้ยวมาก ต้องใช้ความ", "ในการขับรถ"],
                correctAnswers: ["ระวัง"],
                options: ["ระวัง", "สว่าง", "อบอุ่น"]
            },
            {
                id: "quiz_003",
                textParts: ["พวกเราเลือกทำเลกางเต็นท์ใต้ร่ม", "เพื่อหลบแสงแดด"],
                correctAnswers: ["ไม้"],
                options: ["ไม้", "ดอย", "สมอบก"]
            },
            {
                id: "quiz_004",
                textParts: ["ทุกคนช่วยกันขึงฟลายชีทและตอก", "เพื่อยึดเต็นท์ให้มั่นคง"],
                correctAnswers: ["สมอบก"],
                options: ["สมอบก", "ไม้", "หน้าผา"]
            },
            {
                id: "quiz_005",
                textParts: ["พอตกเย็น อุณหภูมิลดต่ำลงจนรู้สึก", "ไปถึงกระดูก"],
                correctAnswers: ["หนาวเย็น"],
                options: ["หนาวเย็น", "มืดมิด", "ร้อนระอุ"]
            },
            {
                id: "quiz_006",
                textParts: ["เพื่อนๆ ช่วยกันหาฟืนแห้งมาก่อกอง", "เพื่อให้ความอบอุ่น"],
                correctAnswers: ["ไฟ"],
                options: ["ไฟ", "ไม้", "หิน"]
            },
            {
                id: "quiz_007",
                textParts: ["มื้อค่ำเราทำอาหารง่ายๆ ด้วยเตาแก๊ส", "ที่พกพาสะดวก"],
                correctAnswers: ["ปิกนิก"],
                options: ["ปิกนิก", "ฟืน", "สมอบก"]
            },
            {
                id: "quiz_008",
                textParts: ["ท้องฟ้ามืดสนิททำให้เรามองเห็นดวง", "ส่องแสงระยิบระยับชัดเจน"],
                correctAnswers: ["ดาว"],
                options: ["ดาว", "ไฟ", "นก"]
            },
            {
                id: "quiz_009",
                textParts: ["พวกเราตื่นแต่เช้ามาชงกาแฟและชมพระอาทิตย์", "ท่ามกลางหมอกหนา"],
                correctAnswers: ["ขึ้น"],
                options: ["ขึ้น", "ตก", "สว่าง"]
            },
            {
                id: "quiz_010",
                textParts: ["ก่อนเดินทางกลับ เราเก็บกวาดพื้นที่และนำขยะไป", "ให้เรียบร้อย"],
                correctAnswers: ["ทิ้ง"],
                options: ["ทิ้ง", "กาง", "ตอก"]
            },
        ],
        s3: [
            {
                id: "quiz_001",
                textParts: ["เช้าวันจันทร์ที่สดใส แต่ฉันเผลอนอนตื่น", "ไปเสียได้"],
                correctAnswers: ["สาย"],
                options: ["สาย", "ด่วน", "รวดเร็ว"]
            },
            {
                id: "quiz_002",
                textParts: ["ฉันรีบทำภารกิจส่วนตัวและแต่ง", "อย่างรวดเร็วที่สุด"],
                correctAnswers: ["กาย"],
                options: ["กาย", "โต๊ะ", "คอมพิวเตอร์"]
            },
            {
                id: "quiz_003",
                textParts: ["ฉันรีบวิ่งไปป้ายรถประจำทางเพื่อรอขึ้นรถ", "สายประจำ"],
                correctAnswers: ["เมล์"],
                options: ["เมล์", "ผู้จัดการ", "ลูกค้า"]
            },
            {
                id: "quiz_004",
                textParts: ["การจราจรเช้านี้ติดขัดอย่างหนักเนื่องจากฝน", "ลงมา"],
                correctAnswers: ["ตก"],
                options: ["ตก", "ประชุม", "เลิกงาน"]
            },
            {
                id: "quiz_005",
                textParts: ["เมื่อถึงออฟฟิศฉันก็รีบวิ่งไปสแกน", "ให้ทันเวลา"],
                correctAnswers: ["ลายนิ้วมือ"],
                options: ["ลายนิ้วมือ", "แป้นพิมพ์", "หน้าจอ"]
            },
            {
                id: "quiz_006",
                textParts: ["พอเริ่มงาน หัวหน้าก็เรียกทีมงานเข้า", "ด่วนทันที"],
                correctAnswers: ["ประชุม"],
                options: ["ประชุม", "จราจร", "ภารกิจ"]
            },
            {
                id: "quiz_007",
                textParts: ["ฉันนั่งจ้องหน้าจอคอมพิวเตอร์นานจนรู้สึกปวด", "สายตา"],
                correctAnswers: ["ล้า"],
                options: ["ล้า", "สาย", "ด่วน"]
            },
            {
                id: "quiz_008",
                textParts: ["พักเที่ยงฉันลงไปทานก๋วยเตี๋ยวที่ศูนย์", "เพื่อความรวดเร็ว"],
                correctAnswers: ["อาหาร"],
                options: ["อาหาร", "ออฟฟิศ", "คอมพิวเตอร์"]
            },
            {
                id: "quiz_009",
                textParts: ["ช่วงบ่ายมีลูกค้าโทรศัพท์มาเจรจาเรื่อง", "ชิ้นสำคัญ"],
                correctAnswers: ["ธุรกิจ"],
                options: ["ธุรกิจ", "ลายนิ้วมือ", "การจราจร"]
            },
            {
                id: "quiz_010",
                textParts: ["หลังเลิกงานฉันก็เดินทางกลับ", "ด้วยความเหนื่อยล้าเต็มทน"],
                correctAnswers: ["ที่พัก"],
                options: ["ที่พัก", "ที่ทำงาน", "ศูนย์อาหาร"]
            },
        ],
        s4: [
            {
                id: "quiz_001",
                textParts: ["เมื่อเช้าฉันตื่นมามีอาการปวด", "อย่างรุนแรง"],
                correctAnswers: ["ศีรษะ"],
                options: ["ศีรษะ", "รถ", "เสีย"]
            },
            {
                id: "quiz_002",
                textParts: ["พ่อรีบขับรถยนต์พาฉันไปที่ห้อง", "ของโรงพยาบาล"],
                correctAnswers: ["ฉุกเฉิน"],
                options: ["ฉุกเฉิน", "นั่งเล่น", "ครัว"]
            },
            {
                id: "quiz_003",
                textParts: ["พยาบาลให้นั่งรอหน้าห้อง", "เพื่อรอเรียกชื่อ"],
                correctAnswers: ["ตรวจ"],
                options: ["ตรวจ", "เรียน", "ครัว"]
            },
            {
                id: "quiz_004",
                textParts: ["คุณหมอใช้เครื่องมือตรวจร่างกายของฉันอย่าง", ""],
                correctAnswers: ["ละเอียด"],
                options: ["ละเอียด", "ลวกๆ", "ช้า"]
            },
            {
                id: "quiz_005",
                textParts: ["หมอสั่งให้ไปเจาะ", "เพื่อนำไปตรวจหาเชื้อ"],
                correctAnswers: ["เลือด"],
                options: ["เลือด", "น้ำ", "ดิน"]
            },
            {
                id: "quiz_006",
                textParts: ["พยาบาลให้นั่งรถเข็นเพราะฉันเดินไม่ค่อย", ""],
                correctAnswers: ["ไหว"],
                options: ["ไหว", "ช้า", "เอียง"]
            },
            {
                id: "quiz_007",
                textParts: ["ฉันนั่งรอรับยาที่ช่อง", "หมายเลขสาม"],
                correctAnswers: ["จ่ายยา"],
                options: ["จ่ายยา", "จ่ายเงิน", "ต้อนรับ"]
            },
            {
                id: "quiz_008",
                textParts: ["เภสัชกรอธิบายวิธีใช้ยาอย่าง", "และเข้าใจง่าย"],
                correctAnswers: ["ชัดเจน"],
                options: ["ชัดเจน", "คลุมเครือ", "มึนงง"]
            },
            {
                id: "quiz_009",
                textParts: ["ยาบางตัวต้องเก็บไว้ในตู้เย็นเพื่อไม่ให้ยา", ""],
                correctAnswers: ["เสื่อมสภาพ"],
                options: ["เสื่อมสภาพ", "เผ็ด", "อร่อย"]
            },
            {
                id: "quiz_010",
                textParts: ["เมื่อเสร็จธุระแล้ว ฉันก็เดินทางกลับบ้านด้วยความ", ""],
                correctAnswers: ["สบายใจ"],
                options: ["สบายใจ", "โกรธแค้น", "อิจฉา"]
            },
        ],
        s5: [
            {
                id: "quiz_001",
                textParts: ["วันนี้ฉันต้องไปทำ", "ทางการเงินที่สาขาในห้าง"],
                correctAnswers: ["ธุรกรรม"],
                options: ["ธุรกรรม", "อาหาร", "ข้อสอบ"]
            },
            {
                id: "quiz_002",
                textParts: ["พ่อรับหน้าที่ไปกดบัตรคิวที่หน้าตู้", ""],
                correctAnswers: ["อัตโนมัติ"],
                options: ["อัตโนมัติ", "น้ำดื่ม", "เกม"]
            },
            {
                id: "quiz_003",
                textParts: ["คนในธนาคารเยอะมาก ฉันเลยต้องนั่ง", "นานกว่าปกติ"],
                correctAnswers: ["รอคอย"],
                options: ["รอคอย", "เต้น", "วิ่งเล่น"]
            },
            {
                id: "quiz_004",
                textParts: ["เมื่อถึงคิว พนักงานก็เรียก", "ของฉันผ่านไมโครโฟน"],
                correctAnswers: ["หมายเลข"],
                options: ["หมายเลข", "สุนัข", "รหัสลับ"]
            },
            {
                id: "quiz_005",
                textParts: ["ฉันต้องการนำเช็คไป", "สดที่หน้าเคาน์เตอร์"],
                correctAnswers: ["ขึ้นเงิน"],
                options: ["ขึ้นเงิน", "ทิ้ง", "ฉีก"]
            },
            {
                id: "quiz_006",
                textParts: ["พนักงานตรวจสอบเอกสารอย่าง", "ก่อนดำเนินการ"],
                correctAnswers: ["ละเอียด"],
                options: ["ละเอียด", "ลวกๆ", "ช้า"]
            },
            {
                id: "quiz_007",
                textParts: ["คุณลุงข้างๆ กำลังกรอกใบ", "เพื่อโอนให้ลูก"],
                correctAnswers: ["ฝากเงิน"],
                options: ["ฝากเงิน", "หย่า", "ลาออก"]
            },
            {
                id: "quiz_008",
                textParts: ["พนักงานนำธนบัตรเข้าเครื่อง", "เพื่อความแม่นยำ"],
                correctAnswers: ["นับเงิน"],
                options: ["นับเงิน", "ซักผ้า", "ปั่นผลไม้"]
            },
            {
                id: "quiz_009",
                textParts: ["เสร็จธุระแล้ว พนักงานกล่าว", "ด้วยรอยยิ้ม"],
                correctAnswers: ["ขอบคุณ"],
                options: ["ขอบคุณ", "เสียใจ", "ลาก่อน"]
            },
            {
                id: "quiz_010",
                textParts: ["ฉันเก็บสมุดบัญชีและบัตรเอทีเอ็มใส่", "ให้มิดชิด"],
                correctAnswers: ["กระเป๋า"],
                options: ["กระเป๋า", "ถุงขยะ", "ตู้เย็น"]
            },
        ],
    },
    hard: {
        s1: [
            {
                id: "quiz_001",
                textParts: ["เช้าตรู่วันหยุดยาว พวกเราช่วยกันขน", "ขึ้นรถเพื่อเดินทางไปพักผ่อนรับลม", ""],
                correctAnswers: ["สัมภาระ", "ทะเล"],
                options: ["สัมภาระ", "ทะเล", "ทราย", "แดด"]
            },
            {
                id: "quiz_002",
                textParts: ["เมื่อมาถึงที่พัก พนักงานต้อนรับนำ", "มาเสิร์ฟให้เราดื่มเพื่อดับความ", ""],
                correctAnswers: ["เครื่องดื่ม", "กระหาย"],
                options: ["เครื่องดื่ม", "กระหาย", "อาหารไทย", "เศร้า"]
            },
            {
                id: "quiz_003",
                textParts: ["แดดเริ่มร่มลมตก น้องชายจึงนำ", "ไปนั่งก่อปราสาททรายบริเวณ", ""],
                correctAnswers: ["อุปกรณ์", "ชายหาด"],
                options: ["อุปกรณ์", "ชายหาด", "ชูชีพ", "น้ำทะเล"]
            },
            {
                id: "quiz_004",
                textParts: ["เพื่อความปลอดภัย คุณพ่อจึงให้น้องสวมเสื้อ", "ทุกครั้งก่อนที่จะลงไปเล่น", ""],
                correctAnswers: ["ชูชีพ", "น้ำทะเล"],
                options: ["ชูชีพ", "น้ำทะเล", "ผ้าใบ", "แดด"]
            },
            {
                id: "quiz_005",
                textParts: ["มื้อเที่ยงเราไปทานร้านอาหารชื่อดัง เมนูเด่นคืออาหาร", "ที่มีความ", "มาก"],
                correctAnswers: ["ทะเล", "สดใหม่"],
                options: ["ทะเล", "สดใหม่", "ว่ายน้ำ", "เค็ม"]
            },
            {
                id: "quiz_006",
                textParts: ["ช่วงบ่ายอากาศค่อนข้างร้อน คุณแม่จึงทาครีมกัน", "ก่อนไปนอนพักผ่อนบนเตียง", ""],
                correctAnswers: ["แดด", "ผ้าใบ"],
                options: ["แดด", "ผ้าใบ", "คลื่น", "ทราย"]
            },
            {
                id: "quiz_007",
                textParts: ["บรรยากาศยามเย็นช่างโรแมนติก พวกเรานั่งชม", "ค่อยๆ ลับขอบฟ้าไปใน", ""],
                correctAnswers: ["พระอาทิตย์", "ทะเล"],
                options: ["พระอาทิตย์", "ทะเล", "ดวงดาว", "ปลา"]
            },
            {
                id: "quiz_008",
                textParts: ["มื้อค่ำเราจัดปาร์ตี้บาร์บีคิว โดยมีเมนูหลักคือ", "ที่ทานคู่กับน้ำจิ้มรส", ""],
                correctAnswers: ["กุ้งเผา", "จัดจ้าน"],
                options: ["กุ้งเผา", "จัดจ้าน", "น้ำทะเล", "เค็มปี๋"]
            },
            {
                id: "quiz_009",
                textParts: ["คืนนี้ทุกคนรู้สึกอ่อนเพลีย จึงล้มตัวลง", "และหลับไปพร้อมกับเสียง", "กระทบฝั่ง"],
                correctAnswers: ["นอน", "คลื่น"],
                options: ["นอน", "คลื่น", "นั่ง", "ลม"]
            },
            {
                id: "quiz_010",
                textParts: ["เช้าวันรุ่งขึ้น พวกเราทำขั้นตอนการเช็ค", "และเดินทางกลับบ้านด้วยความ", ""],
                correctAnswers: ["เอาท์", "ประทับใจ"],
                options: ["เอาท์", "ประทับใจ", "อิน", "ไม่พอใจ"]
            },
        ],
        s2: [
            {
                id: "quiz_001",
                textParts: ["เราเดินทางไปตั้ง", "เพื่อรับลมหนาวบนยอด", ""],
                correctAnswers: ["แคมป์", "ดอย"],
                options: ["แคมป์", "ดอย", "บ้าน", "ไม้"]
            },
            {
                id: "quiz_002",
                textParts: ["เส้นทางขับรถขึ้นภูเขานั้น", "จึงต้องขับขี่ด้วยความ", ""],
                correctAnswers: ["คดเคี้ยว", "ระมัดระวัง"],
                options: ["คดเคี้ยว", "ระมัดระวัง", "มืดมิด", "หวาดกลัว"]
            },
            {
                id: "quiz_003",
                textParts: ["พวกเราเดินหา", "ที่เหมาะสมเพื่อลงมือกาง", "ใต้ร่มไม้ใหญ่"],
                correctAnswers: ["ทำเล", "เต็นท์"],
                options: ["ทำเล", "เต็นท์", "ฟืน", "กองไฟ"]
            },
            {
                id: "quiz_004",
                textParts: ["ทุกคนช่วยกันขึงฟลาย", "และตอกสมอบกเพื่อป้องกัน", "กรรโชกแรง"],
                correctAnswers: ["ชีท", "ลม"],
                options: ["ชีท", "ลม", "เต็นท์", "แดด"]
            },
            {
                id: "quiz_005",
                textParts: ["พอตกเย็นอุณหภูมิเริ่มลด", "ลงจนทุกคนรู้สึกได้ถึงความ", ""],
                correctAnswers: ["ต่ำ", "หนาวเย็น"],
                options: ["ต่ำ", "หนาวเย็น", "สูง", "อบอุ่น"]
            },
            {
                id: "quiz_006",
                textParts: ["เพื่อนๆ ช่วยกันรวบรวมกิ่งไม้แห้งเพื่อมาก่อกอง", "สำหรับให้ความ", ""],
                correctAnswers: ["ไฟ", "อบอุ่น"],
                options: ["ไฟ", "อบอุ่น", "ขยะ", "สกปรก"]
            },
            {
                id: "quiz_007",
                textParts: ["แม่ครัวประจำทริปใช้เตาแก๊ส", "ทำซุปร้อนๆ ให้ทุกคนซดคล่อง", ""],
                correctAnswers: ["ปิกนิก", "คอ"],
                options: ["ปิกนิก", "คอ", "ถ่าน", "ท้อง"]
            },
            {
                id: "quiz_008",
                textParts: ["คืนนี้ท้องฟ้าเปิดโล่งและปราศจากแสง", "ทำให้มองเห็นทางช้าง", "ชัดเจน"],
                correctAnswers: ["รบกวน", "เผือก"],
                options: ["รบกวน", "เผือก", "สีฟ้า", "ม้า"]
            },
            {
                id: "quiz_009",
                textParts: ["พวกเราตื่นแต่เช้าตรู่มาชง", "ร้อนๆ นั่งจิบพลางชมพระอาทิตย์", "ท่ามกลางสายหมอก"],
                correctAnswers: ["กาแฟ", "ขึ้น"],
                options: ["กาแฟ", "ขึ้น", "น้ำแข็ง", "ตก"]
            },
            {
                id: "quiz_010",
                textParts: ["ก่อนกลับพวกเราช่วยกันเก็บ", "ทุกชิ้นไปทิ้งเพื่อไม่ให้ทำลายสภาพ", ""],
                correctAnswers: ["ขยะ", "แวดล้อม"],
                options: ["ขยะ", "แวดล้อม", "สมอบก", "อากาศ"]
            },
        ],
        s3: [
            {
                id: "quiz_001",
                textParts: ["วันนี้ฉันลืมตั้งนาฬิกา", "เลยสะดุ้งตื่นขึ้นมาตอนที่สาย", "แล้ว"],
                correctAnswers: ["ปลุก", "มาก"],
                options: ["ปลุก", "มาก", "แขวน", "เร็ว"]
            },
            {
                id: "quiz_002",
                textParts: ["ฉันรีบวิ่งเข้าห้อง", "เพื่อจัดการธุระส่วนตัวและแต่งตัวอย่าง", ""],
                correctAnswers: ["น้ำ", "รวดเร็ว"],
                options: ["น้ำ", "รวดเร็ว", "ประชุม", "เชื่องช้า"]
            },
            {
                id: "quiz_003",
                textParts: ["ฉันวิ่งกระหืดกระหอบไปที่ป้ายรถ", "เพื่อรอขึ้นรถเมล์สายที่ผ่านหน้า", ""],
                correctAnswers: ["ประจำทาง", "ออฟฟิศ"],
                options: ["ประจำทาง", "ออฟฟิศ", "รถไฟ", "ห้องน้ำ"]
            },
            {
                id: "quiz_004",
                textParts: ["การจราจรบนถนนติดขัดอย่าง", "เนื่องจากมีฝนตกลงมาอย่างต่อ", ""],
                correctAnswers: ["หนัก", "เนื่อง"],
                options: ["หนัก", "เนื่อง", "เบา", "เวลา"]
            },
            {
                id: "quiz_005",
                textParts: ["ทันทีที่ก้าวเข้าประตูบริษัท ฉันรีบพุ่งไปที่เครื่องสแกน", "เพื่อบันทึกเวลาเข้า", ""],
                correctAnswers: ["นิ้ว", "ทำงาน"],
                options: ["นิ้ว", "ทำงาน", "เท้า", "นอน"]
            },
            {
                id: "quiz_006",
                textParts: ["ช่วงสายหัวหน้าเรียกทุกคนเข้า", "ด่วนเพื่ออัปเดตความคืบหน้าของ", ""],
                correctAnswers: ["ประชุม", "โปรเจกต์"],
                options: ["ประชุม", "โปรเจกต์", "ห้องน้ำ", "วันหยุด"]
            },
            {
                id: "quiz_007",
                textParts: ["การนั่งจ้องหน้าจอ", "ติดต่อกันหลายชั่วโมงทำให้ฉันรู้สึกปวดเมื่อย", ""],
                correctAnswers: ["คอมพิวเตอร์", "สายตา"],
                options: ["คอมพิวเตอร์", "สายตา", "หน้าต่าง", "หัวใจ"]
            },
            {
                id: "quiz_008",
                textParts: ["ช่วงพักกลางวัน ฉันลงไปหาข้าวเที่ยงทานที่ศูนย์", "ใต้ตึกเพื่อประหยัด", ""],
                correctAnswers: ["อาหาร", "เวลา"],
                options: ["อาหาร", "เวลา", "โต๊ะ", "รถ"]
            },
            {
                id: "quiz_009",
                textParts: ["ตกบ่ายฉันต้องรับสาย", "จากลูกค้าเพื่อเจรจาต่อรองเรื่อง", "ซื้อขาย"],
                correctAnswers: ["โทรศัพท์", "สัญญา"],
                options: ["โทรศัพท์", "สัญญา", "ดื่มด่ำ", "รองเท้า"]
            },
            {
                id: "quiz_010",
                textParts: ["เมื่อถึงเวลาเลิก", "ฉันรีบเก็บของและเดินทางกลับ", "ไปพักผ่อนทันที"],
                correctAnswers: ["งาน", "บ้าน"],
                options: ["งาน", "บ้าน", "เรียน", "วัด"]
            },
        ],
        s4: [
            {
                id: "quiz_001",
                textParts: ["ฉันมีอาการไอและเจ็บ", "ติดต่อกันหลาย", ""],
                correctAnswers: ["คอ", "วัน"],
                options: ["คอ", "วัน", "มึนงง", "ชาติ"]
            },
            {
                id: "quiz_002",
                textParts: ["เมื่อไปถึง ฉันยื่นบัตร", "เพื่อทำประวัติ", "ใหม่"],
                correctAnswers: ["ประชาชน", "ผู้ป่วย"],
                options: ["ประชาชน", "ผู้ป่วย", "เครดิต", "ลูกจ้าง"]
            },
            {
                id: "quiz_003",
                textParts: ["พยาบาลทำการวัดความ", "และชั่งน้ำ", "ที่จุดคัดกรอง"],
                correctAnswers: ["ดัน", "หนัก"],
                options: ["ดัน", "หนัก", "เย็น", "เบา"]
            },
            {
                id: "quiz_004",
                textParts: ["คุณหมอใช้ไฟฉายส่องดู", "และใช้หูฟังตรวจเสียง", "ของฉัน"],
                correctAnswers: ["คอ", "ปอด"],
                options: ["คอ", "ปอด", "เท้า", "หัวเข่า"]
            },
            {
                id: "quiz_005",
                textParts: ["หมอวินิจฉัยว่าเป็นโรคหลอด", "อักเสบ ต้องนอน", "ที่โรงพยาบาล"],
                correctAnswers: ["ลม", "พัก"],
                options: ["ลม", "พัก", "ปอด", "วิ่ง"]
            },
            {
                id: "quiz_006",
                textParts: ["พยาบาลนำน้ำเกลือมาเจาะเข้าที่เส้น", "ที่หลัง", "ของฉัน"],
                correctAnswers: ["เลือด", "มือ"],
                options: ["เลือด", "มือ", "ตรง", "ก้น"]
            },
            {
                id: "quiz_007",
                textParts: ["เภสัชกรจัดยาพร้อมพิมพ์ฉลากระบุขนาดรับ", "และข้อควร", ""],
                correctAnswers: ["ประทาน", "ระวัง"],
                options: ["ประทาน", "ระวัง", "ขาย", "ลืม"]
            },
            {
                id: "quiz_008",
                textParts: ["ยานี้มีผลข้าง", "อาจทำให้มีอาการ", "หลังจากกินเข้าไป"],
                correctAnswers: ["เคียง", "ง่วงนอน"],
                options: ["เคียง", "ง่วงนอน", "หน้า", "อร่อย"]
            },
            {
                id: "quiz_009",
                textParts: ["แม่นำใบเสร็จไปติดต่อที่ช่องการ", "เพื่อชำระค่า", ""],
                correctAnswers: ["เงิน", "รักษา"],
                options: ["เงิน", "รักษา", "เรียน", "เทอม"]
            },
            {
                id: "quiz_010",
                textParts: ["หลังจากได้พักผ่อนอย่างเต็ม", "อาการป่วยของฉันก็เริ่มดี", ""],
                correctAnswers: ["ที่", "ขึ้น"],
                options: ["ที่", "ขึ้น", "ตัว", "ลง"]
            },
        ],
        s5: [
            {
                id: "quiz_001",
                textParts: ["ฉันเตรียมเอก", "และบัตรประชาชนเพื่อไปขอสิน", "ที่ธนาคาร"],
                correctAnswers: ["สาร", "เชื่อ"],
                options: ["สาร", "เชื่อ", "ไม้", "ค้า"]
            },
            {
                id: "quiz_002",
                textParts: ["เมื่อเดินเข้าประตู พนักงานรักษาความ", "ได้ช่วยกดบัตร", "ให้ฉัน"],
                correctAnswers: ["ปลอดภัย", "คิว"],
                options: ["ปลอดภัย", "คิว", "สะอาด", "โทรศัพท์"]
            },
            {
                id: "quiz_003",
                textParts: ["ฉันนั่งรอที่โซฟาสำหรับผู้มาใช้", "จนกว่าหน้าจอจะแสดงหมาย", "ของฉัน"],
                correctAnswers: ["บริการ", "เลข"],
                options: ["บริการ", "เลข", "งาน", "โทรศัพท์"]
            },
            {
                id: "quiz_004",
                textParts: ["ฉันต้องการเปิดบัญชีเงินฝากประจำเพื่อรับดอก", "ที่สูงกว่าบัญชีออม", ""],
                correctAnswers: ["เบี้ย", "ทรัพย์"],
                options: ["เบี้ย", "ทรัพย์", "ไม้", "ยืม"]
            },
            {
                id: "quiz_005",
                textParts: ["พนักงานขอให้ฉันเซ็น", "ลงบนเอกสารด้วยปากกาอย่างบรร", ""],
                correctAnswers: ["ชื่อ", "จง"],
                options: ["ชื่อ", "จง", "สัญญาณ", "เลอะ"]
            },
            {
                id: "quiz_006",
                textParts: ["ระบบความปลอดภัยของธนาคารต้องใช้การสแกนใบ", "เพื่อยืนยันตัว", ""],
                correctAnswers: ["หน้า", "ตน"],
                options: ["หน้า", "ตน", "ไม้", "ปลอม"]
            },
            {
                id: "quiz_007",
                textParts: ["ฉันนำเงินสดจำนวนมากไปฝากเข้าบัญชีออม", "เพื่อเก็บไว้ใช้ในอนา", ""],
                correctAnswers: ["ทรัพย์", "คต"],
                options: ["ทรัพย์", "คต", "สิน", "ไม้"]
            },
            {
                id: "quiz_008",
                textParts: ["พนักงานแจ้งว่าฉันสามารถใช้โทรศัพท์มือถือในการโอน", "ผ่านแอปพลิเค", ""],
                correctAnswers: ["เงิน", "ชัน"],
                options: ["เงิน", "ชัน", "สาย", "โทรศัพท์"]
            },
            {
                id: "quiz_009",
                textParts: ["การตั้งรหัสผ่านควรหลีกเลี่ยงการใช้วันเดือนปี", "เพื่อป้องกันมิจฉา", ""],
                correctAnswers: ["เกิด", "ชีพ"],
                options: ["เกิด", "ชีพ", "ตาย", "ชน"]
            },
            {
                id: "quiz_010",
                textParts: ["หลังจากตรวจสอบยอดเงินในสมุด", "เรียบร้อยแล้ว ฉันก็เดินทางกลับด้วยความสบาย", ""],
                correctAnswers: ["บัญชี", "ใจ"],
                options: ["บัญชี", "ใจ", "บันทึก", "กาย"]
            },
        ],
    },
})
