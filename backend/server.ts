// FIX: Disambiguated express Request and Response types to prevent conflict with global types.
// FIX: Explicitly import Request and Response from express to fix type resolution issues.
// FIX: Changed import to use default export and qualified types to avoid ambiguity.
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// FIX: Removed `type` keyword from import to comply with coding guidelines.
import { GoogleGenAI, Chat, Part, FunctionDeclaration, Type, Content } from "@google/genai";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
// FIX: Swapped order to resolve potential type overload issue.
app.use(express.json({ limit: '10mb' })); // Allow large JSON bodies for images
app.use(cors());


if (!process.env.API_KEY) {
    console.error("FATAL ERROR: API_KEY is not defined in environment variables.");
    process.exit(1); // Exit if API key is not set
}

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// System instructions and tools
const systemInstruction = `
You are a world-class business assistant for airline ticketing agents in Vietnam. Your name is 'TKT Assistant'. You are an expert in all aspects of airline ticketing operations.

Your core competencies include:
1.  **GDS Mastery:** You are fluent in Amadeus (1A), Sabre (1B), and Galileo (1G). You can provide command formats, explain entries, and troubleshoot common issues. When asked for a command, provide it in a clear, code-formatted block.
    *   **Amadeus (1A) Name Entry:** The command to enter passenger names is \`NM1\`. The format for each passenger is \`lastName/firstName middleName\`. A maximum of 9 passengers can be entered in a single command, with each name separated by a hyphen (' - '). For example: \`NM1nguyen/van a - nguyen/van b - nguyen/van c\`.
2.  **Airline Fare & Policy Expertise:** You have deep, encyclopedic knowledge of the fare structures, ticket conditions, and baggage policies for major Vietnamese airlines. When asked, provide detailed and accurate information based on the data below.

    **Vietnam Airlines (VNA):**
    *   **Hạng Thương gia (Business Class):**
        *   **Linh hoạt (Flex) - J, C:**
            *   Điều kiện vé: Miễn phí đổi vé, hoàn vé. Được phép đổi tên (thu phí).
            *   Hành lý: 2 kiện xách tay (tổng 18kg), 1 kiện ký gửi 32kg.
        *   **Tiêu chuẩn (Classic) - D:**
            *   Điều kiện vé: Đổi vé, hoàn vé có thu phí.
            *   Hành lý: 2 kiện xách tay (tổng 18kg), 1 kiện ký gửi 32kg.
        *   **Tiết kiệm (Lite) - I:**
            *   Điều kiện vé: Đổi vé có thu phí. Không được hoàn vé.
            *   Hành lý: 2 kiện xách tay (tổng 18kg), 1 kiện ký gửi 23kg.
    *   **Hạng Phổ thông Đặc biệt (Premium Economy Class):**
        *   **Linh hoạt (Flex) - W:**
            *   Điều kiện vé: Miễn phí đổi vé, hoàn vé.
            *   Hành lý: 2 kiện xách tay (tổng 18kg), 1 kiện ký gửi 32kg.
        *   **Tiêu chuẩn (Classic) - Z:**
            *   Điều kiện vé: Đổi vé, hoàn vé có thu phí.
            *   Hành lý: 2 kiện xách tay (tổng 18kg), 1 kiện ký gửi 23kg.
        *   **Tiết kiệm (Lite) - U:**
            *   Điều kiện vé: Đổi vé có thu phí. Không được hoàn vé.
            *   Hành lý: 2 kiện xách tay (tổng 18kg), 1 kiện ký gửi 23kg.
    *   **Hạng Phổ thông (Economy Class):**
        *   **Linh hoạt (Flex) - Y, B, M, S:**
            *   Điều kiện vé: Miễn phí đổi vé, hoàn vé (có thể thu phí chênh lệch).
            *   Hành lý: 1 kiện xách tay 12kg, 1 kiện ký gửi 23kg.
        *   **Tiêu chuẩn (Classic) - H, K, L, Q:**
            *   Điều kiện vé: Đổi vé, hoàn vé có thu phí.
            *   Hành lý: 1 kiện xách tay 12kg, 1 kiện ký gửi 23kg.
        *   **Tiết kiệm (Lite) - N, R, T:**
            *   Điều kiện vé: Đổi vé có thu phí. Không được hoàn vé.
            *   Hành lý: 1 kiện xách tay 12kg. Không bao gồm hành lý ký gửi.
        *   **Siêu Tiết kiệm (Super Lite) - E, P:**
            *   Điều kiện vé: Không được phép đổi vé, hoàn vé, đổi tên.
            *   Hành lý: 1 kiện xách tay 12kg. Không bao gồm hành lý ký gửi.

    **VietJet Air (VJ):**
    *   **SkyBoss Business:**
        *   Điều kiện vé: Miễn phí thay đổi (thu chênh lệch nếu có), hoàn vé (bảo lưu tín dụng).
        *   Hành lý: 18kg xách tay, 40-60kg ký gửi + 1 bộ dụng cụ chơi golf.
    *   **SkyBoss:**
        *   Điều kiện vé: Miễn phí thay đổi (thu chênh lệch nếu có), hoàn vé (bảo lưu tín dụng).
        *   Hành lý: 10kg-14kg xách tay, 30-50kg ký gửi + 1 bộ dụng cụ chơi golf.
    *   **Deluxe:**
        *   Điều kiện vé: Miễn phí thay đổi (thu chênh lệch nếu có). Không hoàn vé.
        *   Hành lý: 7-10kg xách tay, 20-40kg ký gửi.
    *   **Eco:**
        *   Điều kiện vé: Thay đổi có thu phí. Không hoàn vé.
        *   Hành lý: 7kg xách tay. Không bao gồm hành lý ký gửi.

    **Bamboo Airways (QH):**
    *   **Business Flex:**
        *   Điều kiện vé: Miễn phí thay đổi, miễn phí đổi tên. Hoàn vé có thu phí.
        *   Hành lý: 2 kiện x 7kg xách tay, 40kg ký gửi.
    *   **Business Smart:**
        *   Điều kiện vé: Thay đổi có thu phí, đổi tên có thu phí. Hoàn vé có thu phí.
        *   Hành lý: 2 kiện x 7kg xách tay, 30kg ký gửi.
    *   **Economy Flex:**
        *   Điều kiện vé: Miễn phí thay đổi. Hoàn vé có thu phí.
        *   Hành lý: 7kg xách tay, 25kg ký gửi.
    *   **Economy Smart:**
        *   Điều kiện vé: Thay đổi có thu phí. Hoàn vé có thu phí.
        *   Hành lý: 7kg xách tay, 20kg ký gửi.
    *   **Economy Saver:**
        *   Điều kiện vé: Thay đổi có thu phí. Không được hoàn vé.
        *   Hành lý: 7kg xách tay. Không bao gồm hành lý ký gửi.
    *   **Economy Saver Max:**
        *   Điều kiện vé: Không được phép thay đổi, hoàn vé, đổi tên.
        *   Hành lý: 7kg xách tay. Không bao gồm hành lý ký gửi.

    **Vietravel Airlines (VU):**
    *   **Phổ thông (Standard):**
        *   Điều kiện vé: Thay đổi chuyến bay, ngày bay, tên có thu phí. Không được hoàn vé.
        *   Hành lý: 7kg xách tay. Không bao gồm hành lý ký gửi. Hành lý ký gửi phải được mua thêm dưới dạng gói.

3.  **BSP Ticketing Policy Reference (Source: 1gindo.com/bsp/index.htm):** When asked about ticketing rules ('quy định xuất vé') for a specific airline (e.g., MU, CX, 3U, 7C), you MUST consult the structured data below and provide the aexact, full text for the corresponding airline. This is a critical instruction for GDS Galileo (1G) users. After providing the rule, you MUST also add the following line for source verification: \`Nguồn: https://1gindo.com/bsp/index.htm\`. If the requested airline is not in your list, state that the specific rule is not in your database and recommend checking the official source at \`1gindo.com/bsp/index.htm\` for the latest information.

    **[START BSP DATA]**
    - **Hãng 3U:**
      - Xuất giá tự động.
      - SITI đi Trung Quốc, chuyến bay thẳng: Z4
      - SITI đi Trung Quốc và các quốc gia khác, chuyến bay nối chuyến và giá thẳng: Z7
      - SITI đi Trung Quốc và các quốc gia khác, chuyến bay nối chuyến và giá break: Z4
      - Từ Nga/Y/New Zealand nối chuyến ở TFU bay về Việt Nam và giá thẳng: Z2
      - Những vé có hành trình khác không được đề cập đến trong chính sách này: Z0
      - Lưu ý: Commission không áp dụng trên chuyến bay codeshare.
    - **Hãng 7C:**
      - Xuất giá tự động.
      - SITI (toàn bộ hành trình trên 7C): Z5
      - SOTO, các chuyến bay nội địa, codeshare: Z0
    - **Hãng 8M:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO: Z0
    - **Hãng AC:** Xuất giá tự động, Z0
    - **Hãng AE:**
      - Xuất giá tự động.
      - SITI: Z7
      - SOTO, codeshare: Z0
    - **Hãng AI:**
      - Xuất giá tự động, Z1 (chỉ được áp dụng trên base fare cho các vé xuất lần đầu) (áp dụng đến 31JUL25)
      - Xuất giá tự động, Z0 (áp dụng từ ngày 01AUG25)
    - **Hãng BI:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO: Z0
    - **Hãng BR:**
      - Break fare: Z0 (áp dụng với cả SITI và SOTO)
      - SITI: Z5 (nếu ko có Q+/S)
      - SITI nếu có Q+/S và add on (từ VN): trừ 5% (không áp dụng cho Q+/S): Nhập NF/AI-00000000
      - SOTO: Z3
      - INF: COM giống ADT nếu through fare
      - *** Lưu ý: Commission không áp dụng cho Q+/S (kể từ 14Mar2024)
      - *** Lưu ý về việc VOID vé: Tránh xuất vé, đổi vé, hoàn vé BR trong khoảng thời gian từ 0h sáng đến 1h sáng. Lý do: BR sẽ khóa trạng thái Coupon lúc 1h sáng giờ VN, khiến các vé này không VOID được sau 1h sáng.
    - **Hãng CA:**
      - Xuất giá tự động.
      - SITI: Z4
      - SOTO, các chuyến bay nội địa TQ, codeshare: Z0
    - **Hãng CI:**
      - Xuất giá tự động.
      - SITI: Z7
      - SOTO, codeshare: Z0
    - **Hãng CX:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO, codeshare: Z0
    - **Hãng CZ:**
      - Xuất giá tự động.
      - SITI đi Trung Quốc, chuyến bay thẳng: Z4
      - SITI đi các nước khác, nối chuyến: Z7
      - SOTO, nội địa TQ, codeshare: Z0
    - **Hãng DT:** Xuất giá tự động, Z0
    - **Hãng EK:** Xuất giá tự động, Z0
    - **Hãng ET:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO, codeshare: Z0
    - **Hãng EY:** Xuất giá tự động, Z0
    - **Hãng FM:**
      - Xuất giá tự động.
      - SITI: Z4
      - SOTO, các chuyến bay nội địa TQ, codeshare: Z0
    - **Hãng GA:** Xuất giá tự động, Z0
    - **Hãng GP:** Xuất giá tự động, Z0
    - **Hãng HA:** Xuất giá tự động, Z0
    - **Hãng HB:**
      - Xuất giá tự động, Z0
      - ***Lưu ý y về việc VOID vé: không được phép void vé. Trường hợp có yêu cầu, vui lòng liên hệ HB SGN để được hướng dẫn.
    - **Hãng HO:**
      - Xuất giá tự động.
      - SITI (toàn bộ hành trình trên HO): Z5
      - SOTO, codeshare: Z0
    - **Hãng HR:**
      - Xuất giá tự động, Z0
      - ***Lưu ý: chỉ xuất giá public; t.hợp khác vui lòng l.hệ hãng
    - **Hãng HX:**
      - Xuất giá tự động (kể từ 18Jul25)
      - SITI: Z3
      - SOTO: Z0 (phải nhập Z0 trong lệnh TMU)
      - Giá riêng Airline private fares: tra hoa hồng trong *NTD1/D và nhập FS
    - **Hãng JL:** Xuất giá tự động, Z0. Trường hợp có hoa hồng: nhập NF/AI-
    - **Hãng JX:**
      - Xuất giá tự động
      - **SITI:**
        - từ VN đến TW: Z5
        - từ VN đến JP: Z7
        - từ VN đến US: Z7 (Giá add-on kết hợp chặng nội địa Mỹ với AA vẫn được tính Z7 đối với vé SITI Through fare (bao gồm cả Q surcharge, nếu có. Quý Đại lý vui lòng book kết hợp chuyến bay của AA theo thứ tự RBD từ thấp đến cao.)
        (áp dụng cho public fare và chuyến bay do JX khai thác. Không áp dụng cho giá khuyến mại đặc biệt)
      - **Nếu break fare:** nhập h.hồng theo số tiền (làm tròn đến hàng ngàn)
        Ví dụ: hoa hồng là 100000 thì sẽ nhập là ZA100000
        /Dùng ZA cho hoa hồng không quá 7 con số, tức tối đa là 9999999.
    - **Hãng KE:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO, codeshare: Z0
    - **Hãng MF:**
      - Xuất giá tự động.
      - SITI: Z4
      - SOTO, codeshare: Z0
    - **Hãng MU:**
      - Xuất giá tự động.
      - SITI: Z4
      - SOTO, các chuyến bay nội địa TQ, codeshare: Z0
    - **Hãng NH:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO, codeshare: Z0
    - **Hãng NX:** Xuất giá tự động, Z0
    - **Hãng NZ:** Xuất giá tự động, Z0
    - **Hãng OM:** Xuất giá tự động, Z0
    - **Hãng OZ:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO, codeshare: Z0
    - **Hãng PG:** Xuất giá tự động, Z0
    - **Hãng PR:** Xuất giá tự động, Z0
    - **Hãng QF:** Xuất giá tự động, Z0
    - **Hãng QR:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO, codeshare: Z0
    - **Hãng SC:**
      - Xuất giá tự động.
      - SITI: Z4
      - SOTO, codeshare: Z0
    - **Hãng SQ:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO, codeshare: Z0
    - **Hãng TG:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO, codeshare: Z0
    - **Hãng TK:**
      - Xuất giá tự động.
      - SITI: Z5
      - SOTO, codeshare: Z0
    - **Hãng VN:** Luôn luôn xuất giá Z0. (Bao gồm SOTO, SITI, nội địa và quốc tế)
    - **Hãng ZH:** Xuất giá tự động, Z0
    **[END BSP DATA]**

4.  **TIMATIC Expertise:** You use an internal, real-time TIMATIC tool to provide detailed and accurate information regarding visa, health, and transit requirements for any nationality traveling to any destination. You MUST use this tool for all such queries.
5.  **SR DOCS Generation:** You can automatically generate the correct SR DOCS command for Amadeus (1A). You MUST use the 'generateSrDocs' tool for this task. Your primary goal is to meticulously extract passenger passport details from various input formats and pass them as arguments to the tool.
    *   **Input Sources:** The user might provide information as unstructured text (e.g., "làm hộ chiếu cho khách..."), a list of details, or an image of a passport. You must be able to parse all of these.
    *   **Data Extraction from Images:** When an image of a passport is provided, perform OCR to extract all necessary fields: full name, passport number, nationality, date of birth, gender, expiry date, and issuing country. Be very precise.
    *   **Data Extraction from Text:** When text is provided, carefully identify each piece of information, even if it's written in a conversational way.
    *   **Name Splitting:** For Vietnamese names like "NGUYEN THI HUONG", you must correctly identify the last name and first/middle names. Set \`lastName: "NGUYEN"\` and \`firstName: "THI HUONG"\`.
    *   **Date Conversion:** Dates are critical. The tool requires the \`DDMMMYY\` format (e.g., 01JAN90). You MUST convert any user-provided date format (e.g., '12/03/1988', '10 Oct 2030', '10-10-2030') into this exact format.
    *   **Country Codes:** You must use the correct 3-letter IATA country codes (e.g., VNM for Vietnam). Infer this from the context if a full country name is given.
6.  **General Booking Analysis & Message Generation:** If a user provides booking text or an image for general analysis (that isn't a request for SR DOCS or TIMATIC), your primary task is to extract the details and generate two message templates. You MUST NOT summarize it as a bulleted list. Instead, you MUST generate two distinct messages.

    **CRITICAL INSTRUCTION:** When analyzing the booking, first determine if it's ticketed (has a ticket number) or unticketed (has a ticketing time limit).
    - If ticketed, use the label "Số vé".
    - If unticketed, use the label "Hạn xuất vé".

    **Your response must start with:** "Đây là các mẫu tin nhắn được tạo từ booking của bạn:"
    
    Then, you must present the two templates inside separate, clearly labeled markdown code blocks.

    **Template 1: Tin nhắn gửi khách**
    Format the message exactly like this, including all fields if present in the booking.
    \`\`\`
Mã đặt chỗ : [PNR]

Họ tên : [Passenger Name]
Số vé : [Ticket Number] OR Hạn xuất vé : [Ticketing Time Limit]
Hạng đặt chỗ : [Booking Class and Fare Family]
Số thẻ : [Frequent Flyer Info]
VIP - [VIP Info]

Hành trình :
[Formatted Itinerary, each segment on a new line]
    \`\`\`

    **Template 2: Tin nhắn check in**
    Format the message exactly like this, including all fields if present in the booking.
    \`\`\`
Giữ chỗ, check in online

Hành trình :
[Formatted Itinerary, each segment on a new line]

Mã đặt chỗ : [PNR]

Họ tên : [Passenger Name]
Số vé : [Ticket Number] OR Hạn xuất vé : [Ticketing Time Limit]
Hạng đặt chỗ : [Booking Class and Fare Family]
    \`\`\`

    **Formatting Rules:**
    - For "Hạng đặt chỗ", you MUST use your **Airline Fare & Policy Expertise** to map the class code to the full Vietnamese fare family name (e.g., 'U' for VNA is 'Phổ thông Đặc biệt Tiết kiệm').
    - For "Hành trình", format each segment like 'HAN - SGN | VN263 | 29SEP | 20:00–22:15'.
    - Omit any lines for which information is not available in the booking (e.g., if there's no VIP info, omit the "VIP - ..." line).
7.  **GDS Screen Analysis:** If the user uploads an image of a raw GDS PNR screen (like the output of *A, *I, RT, or a history log), you MUST analyze the image and present the content back to the user. CRITICAL: You must preserve the original line breaks and structure of the text from the image. Present the result inside a formatted code block (\`\`\`) to maintain the fixed-width layout and make it easy to read.
8.  **Web Search & Industry Resources:** You can search for information on travel websites and key industry resources.
    *   When asked to check fares, you MUST prioritize checking the internal website **abtrip.vn** first, but you are also proficient with **trip.com** and **traveloka.com**. Always state which site you are "checking".
    *   For GDS-specific news and guides in Vietnam, you are now aware of resources like **1gindo.com/bsp/index.htm** for Galileo (1G) and will incorporate knowledge from it into your responses.
9.  **Professional Tone:** Maintain a professional, helpful, and concise tone. All your responses MUST be in Vietnamese.
10. **Problem Solving:** Help agents solve complex ticketing scenarios, such as re-issuing tickets, calculating fares, and understanding airline rules.
`;

const timaticTool: FunctionDeclaration = {
  name: 'lookupTimatic',
  description: 'Looks up visa, health, and transit requirements from the TIMATIC database. Can handle complex routes with multiple transit points and suggest alternative transit routes if the requested one has issues.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      nationality: {
        type: Type.STRING,
        description: 'The nationality of the passenger (e.g., "Việt Nam").',
      },
      destination: {
        type: Type.STRING,
        description: 'The final destination country (e.g., "Mỹ").',
      },
      transitPoints: {
        type: Type.ARRAY,
        description: 'An optional list of countries the passenger will transit through.',
        items: {
          type: Type.STRING,
        },
      },
      suggestAlternatives: {
          type: Type.BOOLEAN,
          description: "If set to true, the tool will suggest alternative transit routes if the primary route is problematic (e.g., requires a difficult visa)."
      }
    },
    required: ['nationality', 'destination'],
  },
};

const generateSrDocsTool: FunctionDeclaration = {
    name: 'generateSrDocs',
    description: 'Generates the Amadeus (1A) SR DOCS command string based on passenger passport details.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            issuingCountryCode: {
                type: Type.STRING,
                description: "The passport's issuing country as a 3-letter IATA country code (e.g., VNM for Vietnam). Infer this from context if not explicitly provided."
            },
            passportNumber: {
                type: Type.STRING,
                description: "The passenger's passport number."
            },
            nationalityCode: {
                type: Type.STRING,
                description: "The passenger's nationality as a 3-letter IATA country code (e.g., VNM for Vietnam)."
            },
            dateOfBirth: {
                type: Type.STRING,
                description: "The passenger's date of birth in DDMMMYY format (e.g., 01JAN90). You MUST convert natural language dates (e.g., 'January 1st, 1990', '01/01/1990') into this specific format."
            },
            gender: {
                type: Type.STRING,
                description: "The passenger's gender, must be 'M' for male or 'F' for female."
            },
            passportExpiryDate: {
                type: Type.STRING,
                description: "The passport's expiry date in DDMMMYY format (e.g., 20APR28). You MUST convert natural language dates (e.g., 'April 20, 2028', '20/04/2028') into this specific format."
            },
            lastName: {
                type: Type.STRING,
                description: "The passenger's last name or surname (e.g., 'NGUYEN')."
            },
            firstName: {
                type: Type.STRING,
                description: "The passenger's first and middle names (e.g., 'THI HUONG')."
            }
        },
        required: ["issuingCountryCode", "passportNumber", "nationalityCode", "dateOfBirth", "gender", "passportExpiryDate", "lastName", "firstName"]
    }
};

// Tool execution helpers
async function runTimaticTool(nationality: string, destination: string, transitPoints?: string[], suggestAlternatives?: boolean): Promise<string> {
    const transitInfo = transitPoints && transitPoints.length > 0 ? ` với các điểm quá cảnh tại '${transitPoints.join(', ')}'` : '';
    let timaticPrompt = `Với vai trò là hệ thống TIMATIC, hãy cung cấp thông tin chi tiết và chính xác về yêu cầu visa, sức khỏe và quá cảnh cho hành khách có quốc tịch '${nationality}' đi đến '${destination}'${transitInfo}. 
    
Phân tích kỹ lưỡng các quy định cho từng chặng (nếu có quá cảnh). Trả lời bằng dữ liệu thực tế, định dạng rõ ràng. Phản hồi phải bằng tiếng Việt.`;

    if (suggestAlternatives) {
        timaticPrompt += `\n\nQUAN TRỌNG: Nếu tuyến đường được yêu cầu (với các điểm quá cảnh đã nêu) gặp vấn đề về visa (ví dụ: yêu cầu visa quá cảnh khó xin), hãy đề xuất 1-2 tuyến đường thay thế khả thi không yêu cầu visa hoặc có chính sách visa khi đến (visa on arrival) cho quốc tịch này.`;
    }
    
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: timaticPrompt });
        return response.text ?? '';
    } catch (error) {
        console.error("Error in TIMATIC tool simulation:", error);
        return "Xin lỗi, không thể tra cứu thông tin TIMATIC vào lúc này.";
    }
}

function runGenerateSrDocsTool(args: any): { command: string } {
    const { issuingCountryCode, passportNumber, nationalityCode, dateOfBirth, gender, passportExpiryDate, lastName, firstName } = args;
    const command = `SR DOCS YY HK1-P-${issuingCountryCode}-${passportNumber}-${nationalityCode}-${dateOfBirth}-${gender}-${passportExpiryDate}-${lastName}-${firstName}`;
    return { command };
}


// --- API Endpoints ---

// FIX: Changed Request and Response to express.Request and express.Response to use correct types.
app.post('/api/chat', async (req: express.Request, res: express.Response) => {
    try {
        const { history, message, image } = req.body;
        
        const formattedHistory: Content[] = (history || []).map((msg: { content: string, role: 'user' | 'model' }) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                tools: [{ functionDeclarations: [timaticTool, generateSrDocsTool] }],
            },
            history: formattedHistory
        });

        // Correctly type messageParts as an array of Part objects
        const messageParts: Part[] = [];
        if (message) {
            messageParts.push({ text: message });
        }
        if (image) {
            messageParts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
        }
        
        // FIX: sendMessageStream expects an object with a `message` property.
        const resultStream = await chat.sendMessageStream({ message: messageParts });
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        const functionCalls: any[] = [];

        // Handle the initial stream to find function calls or text
        for await (const chunk of resultStream) {
            if (chunk.text) {
                res.write(JSON.stringify({ text: chunk.text }) + '\n');
            }
            if (chunk.functionCalls) {
                functionCalls.push(...chunk.functionCalls);
            }
        }

        if (functionCalls.length > 0) {
            const toolResponses = [];
            
            for (const fc of functionCalls) {
                let toolResponsePayload;
                if (fc.name === 'lookupTimatic') {
                    const toolResult = await runTimaticTool(fc.args.nationality, fc.args.destination, fc.args.transitPoints, fc.args.suggestAlternatives);
                    toolResponsePayload = { result: toolResult };
                } else if (fc.name === 'generateSrDocs') {
                    toolResponsePayload = runGenerateSrDocsTool(fc.args);
                }

                if (toolResponsePayload) {
                    toolResponses.push({
                        id: fc.id,
                        name: fc.name,
                        response: toolResponsePayload
                    });
                }
            }
            
            if (toolResponses.length > 0) {
                 const functionResponseParts: Part[] = toolResponses.map(toolResponse => ({
                    functionResponse: { name: toolResponse.name, response: toolResponse.response },
                }));

                // FIX: sendMessageStream expects an object with a `message` property.
                const finalStream = await chat.sendMessageStream({ message: functionResponseParts });
                
                for await (const chunk of finalStream) {
                    if (chunk.text) {
                         res.write(JSON.stringify({ text: chunk.text }) + '\n');
                    }
                }
            }
        }
        
        res.end();

    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Failed to process chat message.' });
    }
});


app.post('/api/parse-pnr-to-quote', async (req: express.Request, res: express.Response) => {
    try {
        const { pnrText } = req.body;
        if (!pnrText) {
            return res.status(400).json({ error: 'pnrText is required.' });
        }
        const prompt = `CRITICAL TASK: Analyze the following raw GDS text which contains multiple PNRs for a group booking. Your goal is to structure this information for a price quote.

        Follow these steps precisely:
        1.  **Group by Itinerary:** Identify unique flight itineraries. Passengers with the exact same flight segments belong to the same itinerary group.
        2.  **Group by Class:** Within each itinerary group, further group passengers by their booking class (e.g., J, W, B).
        3.  **Extract Details:** For each group, extract:
            - \`itineraryDetails\`: The full, multi-line flight segments for the itinerary group. CRITICAL: For each flight segment string from the raw text, you must reformat it to be clean and readable. The output format MUST be: \`[Airline Code][Flight Number] [Origin]-[Destination] | [Date] | [Departure Time]-[Arrival Time]\`. For example, a raw segment like 'VN 253 J 02OCT 4 HANSGN HK1 1400 1610 02OCT E VN/EXXTGQ' MUST be converted to 'VN 253 HAN-SGN | 02OCT | 14:00-16:10'. You MUST remove the booking class, status codes (HK1), and any trailing identifiers. Preserve original line breaks between segments.
            - \`passengers\`: A single string listing all passengers for that specific booking class within that itinerary.
            - \`flightClass\`: Infer the Vietnamese fare family name (e.g., 'Thương gia', 'Phổ thông') based on the booking class code and your internal knowledge.
        4.  **Structure Output:** Return a single JSON object. The root object must have a key "itineraryGroups". This key holds an array of itinerary group objects. Each itinerary group object has an "itineraryDetails" string and a "priceRows" array. Each object in "priceRows" contains the "passengers" and "flightClass" for that subgroup.

        Booking Text to Analyze:
        ---
        ${pnrText}
        ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        itineraryGroups: {
                            type: Type.ARRAY,
                            description: "An array of groups, where each group has a unique itinerary.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    itineraryDetails: { type: Type.STRING, description: "The full, multi-line itinerary block for this group, cleaned and formatted." },
                                    priceRows: {
                                        type: Type.ARRAY,
                                        description: "An array of passenger groups within this itinerary, separated by fare class.",
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                passengers: { type: Type.STRING, description: 'Full name(s) of the passenger(s) for this specific fare class.' },
                                                flightClass: { type: Type.STRING, description: 'The inferred fare class name, e.g., "Thương gia", "Phổ thông".' },
                                            },
                                            required: ["passengers", "flightClass"]
                                        }
                                    }
                                },
                                required: ["itineraryDetails", "priceRows"]
                            }
                        }
                    },
                    required: ["itineraryGroups"]
                }
            }
        });

        const jsonString = response.text ?? '';
        if (!jsonString) {
            throw new Error('Received an empty response from the AI model.');
        }
        res.json(JSON.parse(jsonString));

    } catch (error) {
        console.error('Error in /api/parse-pnr-to-quote:', error);
        res.status(500).json({ error: 'Failed to parse PNR to quote.' });
    }
});


app.post('/api/parse-booking-to-messages', async (req: express.Request, res: express.Response) => {
    try {
        const { content, filePart } = req.body;
        const prompt = `
Analyze the provided flight booking confirmation (which could be text, an image, or a PDF) and extract the key details into a JSON object. Follow these rules precisely:
1.  **Determine Status**: First, determine if the booking has been ticketed. A ticketed booking will have a ticket number (e.g., \`738-1234567890\`, \`FA PAX...\`). An unticketed booking will have a ticketing time limit (e.g., \`TK TL...\`).
2.  **ticketNumber**: If ticketed, extract the e-ticket number. If not ticketed, return an empty string.
3.  **ticketingTimeLimit**: If not ticketed, extract the time limit (e.g., from \`TK TL01OCT/HANVN2205\`, extract \`01OCT\`). If ticketed, return an empty string.
4.  **pnr**: Find the booking reference code (Mã đặt chỗ).
5.  **passengerName**: Extract the full passenger name(s) exactly as written.
6.  **bookingClass**: Infer the booking class AND fare family (e.g., 'Thương gia Linh hoạt') using the booking class code and your internal knowledge.
7.  **frequentFlyer**: Extract the frequent flyer number and status (e.g., 'VN9011232222 ELITE PLUS'). If not present, return an empty string.
8.  **vipInfo**: Extract any special VIP remarks (e.g., 'UVTW DANG,DBQH,PHO BI THU CHUYEN TRACH DUQH'). Do not include frequent flyer status here. If not present, return an empty string.
9.  **itinerary**: Extract all flight segments. Each segment must be on a new line and follow the format: 'HAN - SGN | VN263 | 29SEP | 20:00–22:15'.

Return a JSON object based on the provided schema. All fields must be strings. A field should be an empty string if its corresponding information is not found. **Crucially, either \`ticketNumber\` or \`ticketingTimeLimit\` must be an empty string.**
`;      
        let requestParts: Part[] = [{ text: prompt }];
        if (content) requestParts.push({ text: content });
        if (filePart) requestParts.push(filePart);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: requestParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pnr: { type: Type.STRING, description: 'Mã đặt chỗ, e.g., "DRUR4L"' },
                        passengerName: { type: Type.STRING, description: 'Họ tên hành khách, e.g., "VU/HAI HA"' },
                        ticketNumber: { type: Type.STRING, description: 'Số vé (e.g., "738-2314760272"). Empty if not ticketed.' },
                        ticketingTimeLimit: { type: Type.STRING, description: 'Hạn xuất vé (e.g., "01OCT"). Empty if ticketed.' },
                        bookingClass: { type: Type.STRING, description: 'Hạng đặt chỗ, e.g., "Thương gia Linh hoạt"' },
                        frequentFlyer: { type: Type.STRING, description: 'Số thẻ khách hàng thường xuyên và hạng thẻ, e.g., "VN9011232222 ELITE PLUS"' },
                        vipInfo: { type: Type.STRING, description: 'Thông tin VIP, e.g., "UVTW DANG,DBQH,PHO BI THU CHUYEN TRACH DUQH"' },
                        itinerary: { type: Type.STRING, description: 'Hành trình bay, mỗi chặng một dòng, e.g., "HAN - SGN | VN263 | 29SEP | 20:00–22:15\\nSGN - HAN | VN212 | 30SEP | 12:00–14:05"' },
                    },
                    required: ["pnr", "passengerName", "ticketNumber", "ticketingTimeLimit", "bookingClass", "frequentFlyer", "vipInfo", "itinerary"]
                }
            }
        });

        const jsonString = response.text ?? '';
        if (!jsonString) {
            throw new Error('Received an empty response from the AI model.');
        }
        res.json(JSON.parse(jsonString));

    } catch (error) {
        console.error('Error in /api/parse-booking-to-messages:', error);
        res.status(500).json({ error: 'Failed to parse booking to messages.' });
    }
});


app.post('/api/parse-group-fare', async (req: express.Request, res: express.Response) => {
    try {
        const { content, filePart } = req.body;
        const prompt = `
Analyze the provided text or image, which contains a request for a group flight booking. Your task is to extract the details for each flight segment and return them as a structured JSON array.

Follow these rules precisely:
1.  **Identify Segments:** Each distinct flight request is a segment. This is usually represented by a row or a separate block of text.
2.  **Extract Fields:** For each segment, you MUST extract the following seven fields:
    *   \`quantity\`: The number of passengers (Số lượng).
    *   \`itinerary\`: The route, formatted as a three-letter origin code, a hyphen, and a three-letter destination code (e.g., "HAN-ICN").
    *   \`date\`: The date of the flight. Try to format it as DD/MM/YYYY.
    *   \`time\`: The departure and arrival times, formatted as HH:MM-HH:MM.
    *   \`flightNumber\`: The flight number, including the airline code (e.g., "VJ962").
    *   \`agent\`: The name of the agent or company making the request (Tên Agent/Công ty).
    *   \`agentCode\`: The code associated with the agent (Mã Agent).
3.  **Handle Missing Data:** If a piece of information for a field is not present for a given segment, return an empty string for that field. This is especially important for \`agent\` and \`agentCode\`, which may not be in the request. Do not guess or make up data.
4.  **JSON Output:** The final output MUST be a JSON array of objects. Each object represents one flight segment and contains the seven fields listed above. Do not include any other text or explanations in your response.
`;
        let requestParts: Part[] = [{ text: prompt }];
        if (content) requestParts.push({ text: content });
        if (filePart) requestParts.push(filePart);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: requestParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            quantity: { type: Type.STRING, description: "Số lượng khách." },
                            itinerary: { type: Type.STRING, description: "Hành trình, e.g., 'HAN-ICN'." },
                            date: { type: Type.STRING, description: "Ngày bay, e.g., '11/03/2025'." },
                            time: { type: Type.STRING, description: "Giờ bay, e.g., '22:50-05:25'." },
                            flightNumber: { type: Type.STRING, description: "Số hiệu chuyến bay, e.g., 'VJ962'." },
                            agent: { type: Type.STRING, description: "Tên Agent/Công ty. Rỗng nếu không có." },
                            agentCode: { type: Type.STRING, description: "Mã Agent. Rỗng nếu không có." }
                        },
                        required: ["quantity", "itinerary", "date", "time", "flightNumber", "agent", "agentCode"]
                    }
                }
            }
        });

        const jsonString = response.text ?? '';
        if (!jsonString) {
            throw new Error('Received an empty response from the AI model.');
        }
        res.json(JSON.parse(jsonString));

    } catch (error) {
        console.error('Error in /api/parse-group-fare:', error);
        res.status(500).json({ error: 'Failed to parse group fare request.' });
    }
});

app.post('/api/find-nearest-airports', async (req: express.Request, res: express.Response) => {
    try {
        const { location } = req.body;
        if (!location) {
            return res.status(400).json({ error: 'location is required.' });
        }
        const prompt = `
    Act as an airport location expert. Find the 3 closest international airports to the following location: "${location}".
    Provide the airport name, IATA code, the city/country it's in, and the approximate distance from the location in Vietnamese.
    Return the result as a JSON array of objects.
  `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            airportName: { type: Type.STRING, description: "Full name of the airport." },
                            iataCode: { type: Type.STRING, description: "3-letter IATA code of the airport." },
                            location: { type: Type.STRING, description: "City and Country of the airport." },
                            distance: { type: Type.STRING, description: "Approximate distance from the provided location in Vietnamese (e.g., 'khoảng 15 km')." }
                        },
                        required: ["airportName", "iataCode", "location", "distance"]
                    }
                }
            }
        });
        const jsonString = response.text ?? '';
        if (!jsonString) {
             return res.json([]);
        }
        res.json(JSON.parse(jsonString));
    } catch (error) {
        console.error('Error in /api/find-nearest-airports:', error);
        res.status(500).json({ error: 'Failed to find nearest airports.' });
    }
});


app.post('/api/timatic-lookup', async (req: express.Request, res: express.Response) => {
    try {
        const { nationality, destination, transitPoints, bookingText } = req.body;

        let result;
        if (bookingText) {
             const prompt = `
    Analyze the provided flight booking text to extract information needed for a TIMATIC (visa requirements) lookup.
    Your task is to identify the passenger's nationality, their final destination, and any transit points.

    Rules:
    1.  **Nationality:** Find the passenger's nationality. Look for fields like 'NATIONALITY', 'QUOC TICH', or infer it from passport details (e.g., 'P/VNM/...'). If multiple nationalities are present, pick the first one. If not found, return an empty string.
    2.  **Destination:** Identify the final destination city/country of the entire journey.
    3.  **Transit Points:** List all intermediate stops where the passenger gets off the plane and boards another one. Do not include simple technical stops. If there are no transit points, return an empty array.
    4.  **JSON Output:** The final output MUST be a JSON object.

    Booking Text:
    ---
    ${bookingText}
    ---
    `;
             const extractResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            nationality: { type: Type.STRING, description: "The passenger's nationality as a country name (e.g., 'Việt Nam')." },
                            destination: { type: Type.STRING, description: "The final destination as a country name (e.g., 'Mỹ')." },
                            transitPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of transit countries as country names." }
                        },
                        required: ["nationality", "destination", "transitPoints"]
                    }
                }
            });
            const jsonString = extractResponse.text ?? '{}';
            const extractedDetails = JSON.parse(jsonString);

            if (!extractedDetails.nationality || !extractedDetails.destination) {
                return res.status(400).json({ error: 'Could not automatically determine Nationality or Destination from booking.' });
            }
            const timaticResult = await runTimaticTool(extractedDetails.nationality, extractedDetails.destination, extractedDetails.transitPoints);
            result = { timaticResult, extractedDetails };

        } else {
            if (!nationality || !destination) {
                 return res.status(400).json({ error: 'Nationality and Destination are required for manual lookup.' });
            }
            const transitArray = transitPoints ? transitPoints.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
            const timaticResult = await runTimaticTool(nationality, destination, transitArray);
            result = { timaticResult };
        }
        
        res.json(result);

    } catch (error) {
        console.error('Error in /api/timatic-lookup:', error);
        res.status(500).json({ error: 'Failed to perform TIMATIC lookup.' });
    }
});

app.post('/api/gds-encoder', async (req: express.Request, res: express.Response) => {
    try {
        const { tool, params } = req.body;
        let prompt = '';

        switch (tool) {
            case 'airline_airport_lookup':
                prompt = `Với vai trò là chuyên gia GDS Amadeus, hãy cung cấp lệnh và kết quả cho việc mã hóa/giải mã '${params.query}'. Đây có thể là mã/tên hãng hàng không, sân bay, hoặc thành phố. Trình bày rõ ràng lệnh và kết quả. Phản hồi bằng tiếng Việt.`;
                break;
            case 'equipment_lookup':
                prompt = `Với vai trò là chuyên gia GDS Amadeus, hãy cung cấp lệnh và kết quả cho việc tra cứu mã máy bay '${params.code}'. Trình bày rõ ràng lệnh và kết quả. Phản hồi bằng tiếng Việt.`;
                break;
            case 'seat_map_lookup':
                prompt = `Với vai trò là chuyên gia GDS Amadeus, hãy cung cấp chuỗi lệnh để hiển thị sơ đồ ghế ngồi cho chuyến bay ${params.flightNumber} ngày ${params.date} chặng ${params.segment}. Giải thích từng bước và cho ví dụ kết quả có thể trông như thế nào. Phản hồi bằng tiếng Việt.`;
                break;
            case 'currency_conversion':
                const date = params.date || 'hôm nay';
                prompt = `Với vai trò là chuyên gia GDS Amadeus, hãy cung cấp lệnh và kết quả quy đổi ${params.amount} ${params.from} sang ${params.to} cho ngày ${date}. Trình bày rõ ràng lệnh và kết quả. Phản hồi bằng tiếng Việt.`;
                break;
            default:
                return res.status(400).json({ error: 'Invalid GDS tool specified.' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ result: response.text ?? '' });
    } catch (error) {
        console.error('Error in /api/gds-encoder:', error);
        res.status(500).json({ error: 'Failed to run GDS encoder tool.' });
    }
});


// Start server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
