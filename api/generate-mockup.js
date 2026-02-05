/**
 * Vercel Serverless Function - Mockup Image Generation v3
 *
 * 모드 기반 목업 생성:
 * - COMPOSITE: 제품을 씬에 자연스럽게 배치 (빌보드, 옥외광고)
 * - EXTEND: 제품 중심으로 배경 확장 (SNS, 포스터, 배너)
 * - FIT: 디바이스/프레임 화면에 이미지 삽입 (폰, 노트북)
 *
 * 핵심: 제품 이미지의 비율과 형태를 왜곡 없이 유지
 */

const { createClient } = require('@supabase/supabase-js');

// 에러 로깅
async function logError(errorType, errorMessage, requestData, responseData = null) {
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('error_logs').insert({
            service: 'generate-mockup-v3',
            error_type: errorType,
            error_message: errorMessage,
            request_data: requestData,
            response_data: responseData,
            resolved: false
        });
    } catch (e) {
        console.error('[ErrorLog] Exception:', e.message);
    }
}

/**
 * 목업 카테고리 및 상세 설정
 */
const MOCKUP_CONFIGS = {
    // ===============================
    // 디지털 (Digital) - EXTEND 모드
    // ===============================
    'web-banner': {
        category: 'digital',
        mode: 'EXTEND',
        ratio: '16:9',
        label: '웹 배너',
        prompt: `Create a professional web banner (16:9) featuring this product.

CRITICAL - IMAGE HANDLING:
- DO NOT stretch, distort, or change the aspect ratio of the product
- Keep the product's original proportions exactly as provided
- The product should be the hero element, prominently displayed

COMPOSITION:
- Product positioned on one side (left or right) at its natural size
- Extend the background naturally to fill the 16:9 frame
- Leave space on the opposite side for potential text/copy area
- Clean, modern gradient or lifestyle background

STYLE: Premium e-commerce hero banner, studio lighting, professional advertising quality`
    },

    'mobile-banner': {
        category: 'digital',
        mode: 'EXTEND',
        ratio: '9:16',
        label: '모바일 배너',
        prompt: `Create a vertical mobile banner (9:16) featuring this product.

CRITICAL - SINGLE IMAGE ONLY:
- Generate exactly ONE single continuous image
- DO NOT split the frame into multiple images or panels
- DO NOT create a collage, grid, or before/after comparison
- The entire vertical space must be ONE unified scene

CRITICAL - IMAGE HANDLING:
- DO NOT stretch, distort, or change the aspect ratio of the product
- Keep the product's original proportions exactly as provided
- Product should fill about 50-60% of the vertical space

COMPOSITION:
- Product centered or in upper portion
- Extend background vertically to fill 9:16 frame
- Bottom area clean for CTA buttons/text
- Mobile-optimized, thumb-stopping visual

STYLE: Instagram/TikTok ad quality, vibrant, scroll-stopping`
    },

    'social-square': {
        category: 'digital',
        mode: 'EXTEND',
        ratio: '1:1',
        label: 'SNS 피드',
        prompt: `Create an Instagram-worthy square post (1:1) featuring this product.

CRITICAL - IMAGE HANDLING:
- DO NOT stretch, distort, or change the aspect ratio of the product
- Keep the product's original proportions exactly as provided
- Product should be the clear focal point

COMPOSITION:
- Product prominently displayed, naturally sized
- Extend background to create a lifestyle context
- Add complementary props if appropriate (plants, textures, surfaces)
- Balanced, aesthetically pleasing arrangement

STYLE: Influencer-quality product photography, lifestyle aesthetic, Instagram-ready`
    },

    'social-story': {
        category: 'digital',
        mode: 'EXTEND',
        ratio: '9:16',
        label: 'SNS 스토리',
        prompt: `Create a vertical story format (9:16) featuring this product.

CRITICAL - SINGLE IMAGE ONLY:
- Generate exactly ONE single continuous image
- DO NOT split the frame into multiple images or panels
- DO NOT create a collage, grid, or before/after comparison
- The entire vertical space must be ONE unified scene

CRITICAL - IMAGE HANDLING:
- DO NOT stretch, distort, or change the aspect ratio of the product
- Keep the product's original proportions exactly as provided

COMPOSITION:
- Product in center or upper-center at natural size
- Trendy, engaging background extended vertically
- Space for stickers, text overlays, swipe-up area
- Dynamic, story-native composition

STYLE: Instagram/TikTok story aesthetic, trendy, engaging`
    },

    'thumbnail': {
        category: 'digital',
        mode: 'EXTEND',
        ratio: '16:9',
        label: '썸네일',
        prompt: `Create a YouTube/blog thumbnail (16:9) featuring this product.

CRITICAL - IMAGE HANDLING:
- DO NOT stretch, distort, or change the aspect ratio of the product
- Keep the product's original proportions exactly as provided

COMPOSITION:
- Product displayed prominently at natural size
- Bold, attention-grabbing background
- High contrast for small-size visibility
- Space for title text overlay

STYLE: YouTube thumbnail quality, bold, eye-catching, high contrast`
    },

    // ===============================
    // 인쇄물 (Print) - EXTEND 모드
    // ===============================
    'poster-a4': {
        category: 'print',
        mode: 'EXTEND',
        ratio: '3:4',
        label: '포스터',
        prompt: `Create a premium poster mockup featuring this design.

CRITICAL - IMAGE HANDLING:
- The design should appear on the poster
- Keep proportions exactly as provided

POSTER DISPLAY OPTIONS (choose one):
- Poster HUNG ON A WALL with clips or tape
- Poster HANGING FROM WIRE/STRING with binder clips
- Poster in a minimal frame on a wall

PREMIUM STYLING:
- MODERN INTERIOR: white wall, concrete wall, or brick wall
- Natural lighting from window or dramatic spotlight
- Soft shadows
- Show the poster in a real environment context
- Maybe partial view of furniture or plants (subtle)

DO NOT: just show a flat poster on plain background

STYLE: Interior design mockup, gallery exhibition quality, modern art display aesthetic`
    },

    'magazine-cover': {
        category: 'print',
        mode: 'EXTEND',
        ratio: '3:4',
        label: '매거진',
        prompt: `Create a premium fashion magazine mockup featuring this design on the cover.

CRITICAL - IMAGE HANDLING:
- The design should appear on the magazine cover
- Keep proportions exactly as provided

CRITICAL - MAGAZINE FORMAT:
- LARGE FORMAT magazine (like Vogue, Elle, GQ size)
- THIN - only a few pages, NOT thick like a book
- Show thin spine, thin page edges
- Glossy cover with light reflections

COMPOSITION:
- 1-2 magazines only
- One laying flat, maybe one slightly underneath at angle
- Show the LARGE size and THIN profile

PREMIUM BACKGROUND:
- MODERN SETTING: dark marble, concrete, matte black, or wooden surface
- Dramatic editorial lighting
- Soft elegant shadows
- Minimalist composition

DO NOT: make it look thick like a book or catalog

STYLE: Fashion editorial, Vogue/GQ aesthetic, luxury coffee table magazine`
    },

    'business-card': {
        category: 'print',
        mode: 'EXTEND',
        ratio: '16:9',
        label: '명함',
        prompt: `Create a premium business card mockup featuring this logo/design.

CRITICAL - IMAGE HANDLING:
- The logo/design should appear on the business card
- Keep proportions, size appropriately for a business card

PREMIUM STYLING:
- Stack of 2-3 cards showing front and back
- One card slightly angled or floating
- MODERN BACKGROUND: dark concrete, black marble, brushed metal, or matte black surface
- Dramatic studio lighting with soft shadows
- Show paper texture (cotton, textured, or soft-touch matte)
- Optional: subtle gold foil edge or embossed effect
- Minimalist composition, plenty of negative space

DO NOT: use plain white background or cluttered scenes

STYLE: Luxury brand identity mockup, Behance/Dribbble portfolio quality`
    },

    'brochure': {
        category: 'print',
        mode: 'EXTEND',
        ratio: '4:3',
        label: '브로슈어',
        prompt: `Create a premium thin brochure/leaflet mockup featuring this design.

CRITICAL - IMAGE HANDLING:
- The design should appear on the brochure cover
- Keep proportions exactly as provided

CRITICAL - BROCHURE TYPE:
- THIN folded brochure (tri-fold or bi-fold style) - NOT a thick book
- Only 1-2 brochures in the scene
- GLOSSY COATED paper finish - shiny, reflective surface
- Show the thin, lightweight nature of a marketing brochure

PREMIUM STYLING:
- One brochure slightly open showing fold
- MODERN BACKGROUND: dark concrete, marble, or matte black surface
- Dramatic lighting with reflections on glossy surface
- Elegant shadows
- Minimalist composition

DO NOT: make it look like a thick book or catalog

STYLE: Marketing collateral mockup, modern luxury aesthetic`
    },

    // ===============================
    // 옥외/대형 (Outdoor) - COMPOSITE 모드
    // ===============================
    'billboard': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '빌보드',
        prompt: `Create a realistic billboard mockup in a Korean metropolitan city featuring this product.

CRITICAL - IMAGE HANDLING:
- The product image should appear ON the billboard advertisement
- DO NOT distort the product - maintain its exact proportions
- Scale the product appropriately for billboard viewing (large and clear)

CRITICAL - KOREAN CITY SETTING:
- SEOUL GANGNAM style urban environment (modern Korean metropolis)
- Sleek glass high-rise buildings, modern architecture
- Clean streets, contemporary cityscape
- Korean city vibe - developed, stylish, premium feel

CRITICAL - TEXT HANDLING:
- AVOID Korean text on buildings/signs (AI generates broken text)
- Buildings should have minimal or no visible signage
- Focus on architecture and city atmosphere, not text

SCENE REQUIREMENTS:
- Large billboard structure in premium urban location
- The billboard displays the product advertisement
- Modern buildings, clean sky, urban elements
- Dramatic lighting (golden hour or blue hour preferred)
- Slight upward perspective as if viewing from street level

STYLE: Premium Korean outdoor advertising mockup, Seoul cityscape, cinematic urban photography`
    },

    'bus-shelter': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '9:16',
        label: '버스 정류장',
        prompt: `Create a realistic bus shelter advertisement mockup featuring this product.

CRITICAL - SINGLE IMAGE ONLY:
- Generate exactly ONE single continuous image
- DO NOT split the frame into multiple images or panels
- DO NOT create a collage, grid, or before/after comparison
- The entire vertical space must be ONE unified scene

CRITICAL - IMAGE HANDLING:
- The product image should appear ON the bus shelter ad panel
- DO NOT distort the product - maintain its exact proportions
- Scale appropriately for the vertical ad panel

SCENE REQUIREMENTS:
- Realistic bus stop/shelter with vertical ad panel
- Urban street environment
- People waiting, street elements for context
- Daytime or evening city atmosphere
- The ad panel clearly shows the product

STYLE: Photorealistic street advertising mockup, urban photography`
    },

    'subway-interior': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '지하철 내부',
        prompt: `Create a realistic subway car interior advertisement mockup featuring this product.

CRITICAL - IMAGE HANDLING:
- The product image should appear ON the ad panel ABOVE the seats
- DO NOT distort the product - maintain its exact proportions

CRITICAL - KOREAN SUBWAY STYLE:
- MODERN, CLEAN Korean metro interior (like Seoul Metro, not NYC)
- Bright, well-lit, SPOTLESS train car
- Stainless steel poles, clean seats
- Horizontal ad panel strip running ABOVE the passenger seats
- The ad appears on the overhead panel (not on doors or walls)

SCENE COMPOSITION:
- Show interior of a clean, modern subway car
- Passengers sitting or standing (minimal, not crowded)
- The ad panel above seats features the product/design
- Clean floors, no graffiti, bright lighting

STYLE: Premium Korean transit advertising mockup, modern metro interior`
    },

    'subway-psd': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '승강장 안전문',
        prompt: `Create a realistic subway platform screen door (PSD) advertisement mockup.

CRITICAL - IMAGE HANDLING:
- The product image should appear ON the platform screen door glass panel
- DO NOT distort the product - maintain its exact proportions

CRITICAL - KOREAN SUBWAY PLATFORM:
- MODERN, CLEAN Korean metro station platform
- Platform Screen Doors (PSD) - the glass safety barriers between platform and tracks
- Bright, spacious, well-lit station
- The advertisement appears ON the PSD glass panels

SCENE COMPOSITION:
- Station platform perspective looking at the PSD doors
- The PSD glass panels have the advertisement visible
- Clean platform floor, modern lighting
- Maybe a train visible behind the doors (optional)
- Few passengers waiting on platform

STYLE: Premium Korean transit advertising mockup, modern metro platform, PSD advertisement`
    },

    'storefront': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '매장 간판',
        prompt: `Create a realistic storefront/shop sign mockup featuring this product/brand.

CRITICAL - IMAGE HANDLING:
- The product/logo should appear ON the store signage
- DO NOT distort - maintain exact proportions
- Use as store logo/branding element

SCENE REQUIREMENTS:
- Attractive retail storefront with prominent signage
- Street-level view of the shop
- Clean, modern store design
- The product/logo as the store brand

STYLE: Premium retail storefront mockup, boutique aesthetic`
    },

    'building-wrap': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '9:16',
        label: '건물 랩핑',
        prompt: `Create a dramatic building wrap advertisement mockup featuring this product.

CRITICAL - SINGLE IMAGE ONLY:
- Generate exactly ONE single continuous image
- DO NOT split the frame into multiple images or panels
- DO NOT create a collage, grid, or before/after comparison
- The entire vertical space must be ONE unified scene

CRITICAL - IMAGE HANDLING:
- The product should appear as part of a MASSIVE building wrap ad
- DO NOT distort - maintain exact proportions
- Scale dramatically for building-size impact

SCENE REQUIREMENTS:
- Tall building with large-scale advertisement wrap
- Urban cityscape context
- Dramatic perspective looking up at the building
- The product appears HUGE on the building facade

STYLE: Epic outdoor advertising mockup, architectural scale`
    },

    'x-banner': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '9:16',
        label: 'X배너',
        prompt: `Create a compact X-banner stand mockup featuring this design.

CRITICAL - SINGLE IMAGE ONLY:
- Generate exactly ONE single continuous image
- DO NOT split the frame into multiple images or panels
- DO NOT create a collage, grid, or before/after comparison
- The entire vertical space must be ONE unified scene

CRITICAL - IMAGE HANDLING:
- The design should appear printed on the vertical banner
- DO NOT distort - maintain exact proportions

CRITICAL - BANNER SIZE:
- SMALLER, COMPACT X-banner (not oversized)
- Human-scale standing banner, approximately 160-180cm tall
- Portable event signage size

CRITICAL - BANNER LAYOUT (top to bottom):
1. TOP (70%): Main title/logo from the provided design - this is the HERO area, large and prominent
2. BOTTOM (30%): Small info section with:
   - Small date and time text (subtle, not dominant)
   - Small directional arrow pointing LEFT or RIGHT
   - Keep this section minimal and compact
- The main design should dominate, bottom info is secondary

SCENE REQUIREMENTS:
- Compact X-banner stand with X-shaped base
- Indoor setting (lobby, event hall, exhibition entrance)
- Clean floor, professional environment
- Show full banner with stand base visible
- Maybe a person nearby for scale reference (optional)

STYLE: Event wayfinding X-banner mockup, compact directional signage`
    },

    'bus-wrap': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '21:9',
        label: '버스 광고',
        prompt: `Create a photorealistic bus side advertisement mockup.

CRITICAL - BUS ANATOMY (VERY IMPORTANT):
- The bus must have ONE FRONT (driver cabin) and ONE BACK (rear)
- LEFT side = FRONT with driver cabin, windshield, front door
- RIGHT side = BACK with rear window, tail lights, exhaust
- DO NOT create a symmetrical bus with two fronts
- DO NOT mirror the bus - front and back must be DIFFERENT
- A real bus has: front windshield → passenger doors → rear window

CRITICAL - REALISTIC COMPOSITE:
- The advertisement is a VINYL WRAP applied to the bus side panel
- The wrap covers the lower body panel BELOW the windows (not over windows)
- Show the vinyl wrap following the bus body contours naturally
- Include subtle reflections and highlights matching bus surface

CRITICAL - IMAGE PLACEMENT:
- Place the product/design prominently on the bus side wrap
- Maintain exact proportions - DO NOT stretch or distort the product
- The design should be clearly visible and centered on the wrap area
- Scale the product appropriately for large outdoor viewing

CRITICAL - REALISM DETAILS:
- Show the bus body panels and seams visible through/around the wrap
- Include realistic lighting matching the scene
- The wrap should look professionally applied (no bubbles, wrinkles)
- Bus windows, wheels, and structure clearly visible above/around the ad

SCENE COMPOSITION:
- Modern Korean city bus (green, blue, or standard city bus colors for non-ad areas)
- Side view showing the full length of the bus from front to back
- Front of bus on LEFT, rear of bus on RIGHT (or vice versa - but NOT same on both sides)
- Urban street with buildings in background (slightly blurred)
- Daytime with good lighting
- The bus should be stationary or at a bus stop

DO NOT: Create two driver cabins, make symmetrical bus, cover windows with ad, use unrealistic perspective

STYLE: Professional transit advertising photography, realistic bus wrap mockup, Korean city bus advertising`
    },

    'taxi-door': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '택시 광고',
        prompt: `Create a photorealistic taxi side vinyl wrap advertisement mockup.

CRITICAL - VINYL WRAP COVERAGE:
- The advertisement wrap covers BOTH front and rear passenger doors
- The wrap spans across both doors as one continuous design
- Covers the lower portion of both doors (below windows)
- The vinyl follows the door surface contours seamlessly

CRITICAL - IMAGE PLACEMENT:
- Place the product/design across both door panels
- Maintain exact proportions - DO NOT stretch or distort
- The design spans the full side of the taxi (front + rear doors)
- Professional vehicle wrap quality

CRITICAL - REALISM:
- The wrap blends naturally with the car surface
- Include subtle reflections matching the car paint
- Door handles visible, wrap goes around them naturally
- The seam between doors is visible but wrap is continuous
- Clean, professional application look

SCENE:
- Korean taxi (white or silver sedan, Hyundai Sonata style)
- Roof-mounted taxi sign showing "TAXI" in English (NOT Korean text)
- Side view showing BOTH front and rear doors
- Urban street background (blurred)
- Daylight, clean lighting

STYLE: Professional taxi advertising photography, Korean taxi wrap mockup`
    },

    'frp-sculpture': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: 'FRP 조형물',
        prompt: `Giant FRP sculpture mockup featuring this brand character/mascot.
- Large outdoor fiberglass sculpture (2-3 meters tall)
- Brand mascot or character as 3D FRP statue
- Placed at plaza, shopping mall entrance, or theme park
- Vibrant colors, glossy FRP finish
- People nearby for scale reference
- Daytime outdoor setting, photo op spot style`
    },

    'giant-balloon-day': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '벌룬 (낮)',
        prompt: `Giant inflatable balloon character mockup featuring this brand mascot.
- Massive air-filled balloon sculpture (6+ meters tall)
- Brand character/mascot as inflatable balloon
- Firmly planted on the ground, standing upright on plaza or event space
- Bright vivid colors, smooth seamless balloon surface
- NO visible seams, NO stitching lines, clean smooth fabric texture
- NO ropes, NO strings visible
- People walking nearby for massive scale reference
- Clear blue sky background, sunny daytime outdoor atmosphere
STYLE: Commercial event photography, giant character balloon promotional display, clean professional polished look`
    },

    'giant-balloon-night': {
        category: 'outdoor',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '벌룬 (밤)',
        prompt: `Giant illuminated inflatable balloon character mockup featuring this brand mascot at night.
- Massive air-filled balloon sculpture (6+ meters tall)
- Brand character/mascot as inflatable balloon
- Firmly planted on the ground, standing upright on plaza or event space
- GLOWING from inside, internal LED lighting illuminating the balloon
- Soft warm light emanating through smooth balloon surface
- NO visible seams, NO stitching lines, clean smooth fabric texture
- NO ropes, NO strings visible
- Night time setting, dark sky background
- People silhouettes nearby for massive scale reference
- Festival atmosphere, magical glowing effect
STYLE: Night event photography, illuminated giant character balloon, dramatic lighting, polished professional look`
    },

    // ===============================
    // 부스 (Booth) - COMPOSITE 모드
    // ===============================
    'popup-outdoor': {
        category: 'booth',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '팝업스토어 (야외)',
        prompt: `Outdoor pop-up store mockup featuring this brand.
- Temporary retail booth/container on street or plaza
- Brand signage and colors on facade
- Urban outdoor setting, Seongsu/Gangnam style
- Trendy brand activation space`
    },

    'popup-indoor': {
        category: 'booth',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '팝업스토어 (실내)',
        prompt: `Indoor pop-up store mockup in shopping mall featuring this brand.
- Temporary retail space inside department store or mall
- Brand signage on storefront
- Mall corridor/atrium visible in background
- Premium indoor retail pop-up style`
    },

    'island-booth': {
        category: 'booth',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '아일랜드 부스',
        prompt: `Create a photorealistic island booth mockup featuring this brand/design.

CRITICAL - BRAND APPLICATION:
- Apply the brand/design to the island booth structure
- Top signage/header prominently displays the brand
- Maintain exact proportions - DO NOT distort the design
- Brand identity reflected throughout the booth

SCENE COMPOSITION:
- Freestanding island booth in a shopping mall atrium
- 360-degree accessible booth structure
- Located in mall common area with high foot traffic
- Modern, premium mall interior background
- Bright, well-lit environment

BOOTH ELEMENTS:
- Overhead signage/canopy with brand
- Product display counters or shelves
- Clean, professional booth structure
- Interactive elements or screens (optional)
- Staff area or counter

STYLE: Premium retail island booth, shopping mall promotion booth, brand activation kiosk`
    },

    'exhibition-booth': {
        category: 'booth',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '전시 부스',
        prompt: `Create a photorealistic exhibition booth mockup featuring this brand/design.

CRITICAL - BRAND APPLICATION:
- Apply the brand/design to the exhibition booth backdrop and signage
- Large header/fascia displays the brand prominently
- Maintain exact proportions - DO NOT distort the design
- Cohesive brand identity throughout the booth

SCENE COMPOSITION:
- Professional trade show or exhibition booth
- Convention center or exhibition hall setting
- Modern booth design with clean lines
- Professional lighting (spotlights, LED strips)
- Exhibition hall floor and neighboring booths visible

BOOTH ELEMENTS:
- Large backdrop wall with brand graphics
- Header/fascia signage with brand name
- Product display areas or demo stations
- Meeting area or counter
- Promotional materials/brochures visible
- Professional flooring (carpet or raised platform)

STYLE: Trade show booth mockup, B2B exhibition stand, professional expo booth`
    },

    'kiosk': {
        category: 'booth',
        mode: 'COMPOSITE',
        ratio: '9:16',
        label: '키오스크',
        prompt: `Create a photorealistic digital kiosk mockup with a person using it.

CRITICAL - SINGLE IMAGE ONLY:
- Generate exactly ONE single continuous image
- DO NOT split the frame into multiple images or panels
- DO NOT create a collage, grid, or before/after comparison
- The entire vertical space must be ONE unified scene

CRITICAL - MINIMAL BRANDING (IMPORTANT):
- Brand/logo appears ONLY on the SCREEN display
- The kiosk BODY must remain NEUTRAL color (white, black, silver, or gray)
- DO NOT apply brand colors to the kiosk frame or body
- DO NOT wrap or cover the kiosk machine with brand graphics
- Keep the kiosk looking like a standard commercial terminal
- Small logo sticker on header is acceptable, but subtle

CRITICAL - PERSON USING KIOSK:
- Show a person ACTIVELY USING the kiosk (touching screen or standing in front)
- Person shown from behind or side angle (not facing camera)
- Natural, realistic interaction pose
- Person dressed casually or in business casual

SCENE COMPOSITION:
- Modern self-service digital kiosk (standard commercial design)
- Located in a shopping mall, store, or public space
- Clean, bright environment
- The person is the focal point interacting with the kiosk

KIOSK ELEMENTS:
- Large touchscreen display showing brand content/UI
- Sleek, modern kiosk body in NEUTRAL color (white/black/silver)
- Clean floor area around kiosk
- Optional: small brand logo on top header panel only

STYLE: Lifestyle kiosk mockup, user interaction shot, realistic commercial terminal`
    },

    'info-desk': {
        category: 'booth',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '안내데스크',
        prompt: `Create a photorealistic PREMIUM exhibition information desk mockup featuring this brand/design.

CRITICAL - THIS IS A LARGE-SCALE EXHIBITION DESK:
- COEX/BEXCO level major convention center setting
- Premium booth for major corporations or large exhibitions
- NOT a cheap pop-up or fabric backdrop
- Professional, high-end trade show quality

CRITICAL - DESK DESIGN (FRONT):
- Modern, sleek reception counter with brand logo on front panel
- High-quality materials (glossy white, matte black, or brand colored)
- Curved or angular contemporary design
- LED edge lighting or backlit logo panel
- Premium finish, polished surfaces

CRITICAL - BACKDROP WALL (BEHIND DESK):
- SOLID PANEL backdrop (NOT fabric, NOT roll-up banner)
- Rigid wall structure with premium finish
- DESIGN OPTIONS for backdrop (choose one):
  1. LOGO PATTERN: Small brand logos repeated in subtle pattern across the wall
  2. BRAND COLORS: Solid or gradient using brand's primary colors, minimal and modern
  3. GEOMETRIC: Abstract geometric pattern derived from brand colors
- The backdrop should feel DESIGNED and INTENTIONAL, not just a logo slapped on
- Modern, sophisticated brand expression

SCENE COMPOSITION:
- Large exhibition hall (COEX/BEXCO scale convention center)
- High ceilings, professional exhibition lighting
- Spacious booth area with clean flooring
- Neighboring premium booths visible (blurred in background)
- Overall atmosphere of a major industry expo or trade fair

STYLE: Premium exhibition booth, major trade show information desk, corporate-level brand presence, modern minimalist design`
    },

    // ===============================
    // 디바이스 (Device) - FIT 모드
    // ===============================
    'iphone-hand': {
        category: 'device',
        mode: 'FIT',
        ratio: '9:16',
        label: '아이폰 (손)',
        prompt: `Create an iPhone mockup held in a hand with this image displayed on the screen.

CRITICAL - SINGLE IMAGE ONLY:
- Generate exactly ONE single continuous image
- DO NOT split the frame into multiple images or panels
- DO NOT create a collage, grid, or before/after comparison
- The entire vertical space must be ONE unified scene

CRITICAL - IMAGE HANDLING:
- Place this image INSIDE the iPhone screen area
- Adjust/crop the image to fit the phone screen naturally
- The phone frame should be clearly visible

CRITICAL - PHONE ORIENTATION:
- Show the FRONT of the phone (screen side) facing the camera
- The screen with the image must be visible to the viewer
- Do NOT show the back of the phone or camera module
- The user is looking AT the screen

SCENE REQUIREMENTS:
- Modern iPhone held naturally in a human hand
- The provided image displayed on the phone screen
- Clean, blurred background (cafe, office, outdoor)
- Natural hand position, casual grip
- Realistic screen lighting

STYLE: Lifestyle app screenshot, natural usage mockup`
    },

    'iphone-topview': {
        category: 'device',
        mode: 'FIT',
        ratio: '1:1',
        label: '아이폰 (탑뷰)',
        prompt: `Create a top-view flat lay iPhone mockup with this image displayed on the screen.

CRITICAL - IMAGE HANDLING:
- Place this image INSIDE the iPhone screen area
- Adjust/crop the image to fit the phone screen naturally
- The phone should be viewed from directly above

SCENE REQUIREMENTS:
- Modern iPhone laying flat, viewed from top (bird's eye view)
- The provided image displayed on the phone screen
- Clean desk/table surface (marble, wood, white)
- Minimal props around (coffee cup, plant, notebook - optional)
- Flat lay photography style

STYLE: Flat lay mockup, Instagram aesthetic, top-down photography`
    },

    'macbook-screen': {
        category: 'device',
        mode: 'FIT',
        ratio: '16:9',
        label: '맥북 화면',
        prompt: `Create a MacBook mockup with this image displayed on the screen.

CRITICAL - IMAGE HANDLING:
- Place this image INSIDE the MacBook screen area
- Adjust/crop the image to fit the laptop screen naturally
- The laptop frame and keyboard should be visible

SCENE REQUIREMENTS:
- Modern MacBook Pro/Air aesthetic
- The provided image displayed on the laptop screen
- Clean desk setup (minimal props)
- Professional workspace environment
- Realistic screen lighting

STYLE: Website/app showcase quality, professional workspace mockup`
    },

    'ipad-screen': {
        category: 'device',
        mode: 'FIT',
        ratio: '4:3',
        label: '아이패드',
        prompt: `Create an iPad mockup with this image displayed on the screen.

CRITICAL - IMAGE HANDLING:
- Place this image INSIDE the iPad screen area
- Adjust/crop the image to fit the tablet screen naturally
- The iPad frame should be clearly visible

SCENE REQUIREMENTS:
- Modern iPad Pro aesthetic
- The provided image displayed on the tablet screen
- Clean background or minimal desk setup
- Can include Apple Pencil for context

STYLE: App showcase quality, tablet device mockup`
    },

    'tv-screen': {
        category: 'device',
        mode: 'FIT',
        ratio: '16:9',
        label: 'TV 화면',
        prompt: `Create a TV/monitor mockup with this image displayed on the screen.

CRITICAL - IMAGE HANDLING:
- Place this image INSIDE the TV/monitor screen area
- Adjust/crop the image to fit the screen naturally
- The TV frame and stand should be visible

SCENE REQUIREMENTS:
- Modern flat-screen TV or monitor
- The provided image displayed on the screen
- Living room or office environment
- Realistic ambient lighting

STYLE: Smart TV app or streaming service quality, home entertainment mockup`
    },

    'watch-face': {
        category: 'device',
        mode: 'FIT',
        ratio: '1:1',
        label: '애플워치',
        prompt: `Create an Apple Watch mockup with this image as the watch face.

CRITICAL - IMAGE HANDLING:
- Place this image INSIDE the watch face area
- Crop to circular/rounded square watch face
- The watch body and band should be visible

SCENE REQUIREMENTS:
- Modern Apple Watch aesthetic
- The provided image as watch face display
- Clean background or wrist shot
- Realistic watch proportions

STYLE: Watch face/app showcase quality, wearable device mockup`
    },

    // ===============================
    // 패키징 (Packaging) - COMPOSITE 모드
    // ===============================
    'product-box': {
        category: 'packaging',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '제품 박스',
        prompt: `Create a 3D product box mockup featuring this product/design.

CRITICAL - IMAGE HANDLING:
- The product/design should appear ON the box surface
- DO NOT distort - maintain exact proportions
- Apply to box front face naturally

CRITICAL - ALL FACES DESIGN:
- FRONT FACE: Main key visual/design prominently displayed
- SIDE FACES: Extract background colors, patterns, or design elements from the key visual and apply to side panels
- TOP FACE: Apply coordinating design elements or solid color from the key visual's color palette
- All visible faces should feel cohesive, as if designed together as a complete package
- Use the key visual's dominant colors for secondary faces

SCENE REQUIREMENTS:
- 3D product box with the design applied to ALL visible faces
- Slight angle showing front, side, AND top faces clearly
- Clean studio background
- Professional product photography lighting
- Premium packaging material appearance

STYLE: E-commerce product photography, unboxing experience quality, cohesive brand packaging`
    },

    'shopping-bag-color': {
        category: 'packaging',
        mode: 'COMPOSITE',
        ratio: '3:4',
        label: '쇼핑백 (포토인쇄)',
        prompt: `Create a COLORFUL shopping bag mockup with full-coverage print design.

CRITICAL - DESIGN APPLICATION:
- Apply the full design/image to COVER the entire bag surface
- GLOSSY LAMINATED finish - shiny, reflective coating
- Full bleed printing - design extends edge to edge
- Rich, vibrant colors

IMAGE HANDLING:
- If provided image contains illustrations, photos, or patterns - apply them FULLY across the bag
- Maintain original colors and vibrancy
- Create seamless wrap-around effect if possible

SCENE REQUIREMENTS:
- Premium paper shopping bag with glossy coating
- High-quality commercial printing look
- Clean studio setting or lifestyle context
- Rope or ribbon handles

STYLE: High-end retail packaging, fashion brand quality, vivid full-color print`
    },

    'shopping-bag-kraft': {
        category: 'packaging',
        mode: 'COMPOSITE',
        ratio: '3:4',
        label: '쇼핑백 (로고만)',
        prompt: `Create a PREMIUM minimalist shopping bag mockup with elegant finishing.

CRITICAL - MATERIAL & FINISH:
- KRAFT or premium paper material (natural tan/brown or elegant white/cream/black)
- MATTE finish - sophisticated, tactile appearance
- Focus on LOGO ONLY - ignore detailed images or complex graphics

PREMIUM FINISHING EFFECTS (choose appropriate):
- EMBOSSING/DEBOSSING - raised or pressed logo into paper
- GOLD FOIL STAMPING - metallic gold accent on logo
- SILVER FOIL STAMPING - metallic silver accent
- BLACK FOIL - glossy black on matte background
- SPOT UV - selective glossy coating on logo area

DESIGN APPROACH:
- Extract ONLY the main logo/symbol from provided image
- Simple, elegant, minimalist branding
- Premium luxury feel
- High contrast between logo and bag material

SCENE REQUIREMENTS:
- Sophisticated paper shopping bag
- Cotton rope or grosgrain ribbon handles
- Clean studio background
- Subtle shadows for depth

STYLE: Luxury boutique packaging, premium brand identity, minimalist elegance`
    },

    'beverage-can': {
        category: 'packaging',
        mode: 'COMPOSITE',
        ratio: '3:4',
        label: '음료 캔',
        prompt: `Create a fully branded beverage can mockup.

CRITICAL - FULL CAN DESIGN:
- The can BODY must be fully colored/branded - NOT just a middle label strip
- Extract the main color from the provided design and apply it to the whole can body
- The can should look like a FULLY PRINTED can (like Coca-Cola or Monster Energy)
- The provided design/logo appears prominently on the can front

IMPORTANT - PULL TAB AREA:
- The pull tab (opening mechanism on top) must remain METALLIC SILVER - this is realistic
- The top lid surface around the tab can be brand colored
- Only the pull tab ring itself stays silver/metallic

SCENE REQUIREMENTS:
- Modern beverage can with seamless full-body print
- Realistic metallic pull tab on top
- Studio lighting with subtle reflections
- Clean background

STYLE: Premium beverage branding, realistic can design`
    },

    'cake-box-kraft': {
        category: 'packaging',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '손잡이 박스 (크래프트)',
        prompt: `Gable box mockup with handle featuring main logo only.

CRITICAL - MATERIAL:
- KRAFT PAPER material - natural brown/tan cardboard color
- Eco-friendly, rustic, natural texture appearance
- Matte finish, recycled paper look

DESIGN:
- Print ONLY main logo/icon on box, ignore small text and details
- Logo should contrast nicely against the kraft paper background
- Simple, minimalist branding

SCENE:
- Clean white studio background, product shot
- Professional packaging photography
- Show the gable box with handle clearly visible`
    },

    'cake-box-color': {
        category: 'packaging',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '손잡이 박스 (컬러)',
        prompt: `Gable box mockup with handle featuring full color print design.

CRITICAL - FULL COLOR PRINTING:
- Extract colors from the uploaded key visual
- Apply the dominant colors as the box background/base color
- The entire box should be COLOR PRINTED, not plain white
- Use the key visual's color palette for the box surface

DESIGN:
- Print main logo/icon prominently on the box
- Box color should match or complement the key visual's colors
- Cohesive brand look - as if professionally designed together

SCENE:
- Clean white studio background, product shot
- Professional packaging photography
- Show the gable box with handle clearly visible`
    },

    'tshirt-front': {
        category: 'packaging',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '티셔츠 (전면)',
        prompt: `T-shirt front mockup with full design on center chest.
- Full design printed large on center chest area
- White or black t-shirt, flat lay or mannequin
- Apparel product photography style`
    },

    'tshirt-symbol': {
        category: 'packaging',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '티셔츠 (심볼)',
        prompt: `T-shirt mockup with small logo on left chest.
- Extract ONLY main icon/symbol from design
- Print small on upper left chest area (like polo logo placement)
- White or black t-shirt, minimal branding style`
    },

    'tshirt-staff': {
        category: 'packaging',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '티셔츠 (스태프)',
        prompt: `Staff t-shirt back view mockup worn by a young woman.
- Young woman wearing the t-shirt, BACK VIEW (facing away from camera)
- Face barely visible or not visible at all
- Large bold "STAFF" text on center back
- Small logo/symbol from uploaded image below or above STAFF text
- Use brand colors from uploaded image
- Modern minimal studio, clean simple background
- Fashion lookbook style photography`
    },

    // ===============================
    // 굿즈 (Goods) - COMPOSITE 모드
    // ===============================
    'ballpoint-pen': {
        category: 'goods',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '볼펜',
        prompt: `Branded promotional pen mockup featuring main logo only.
- Print ONLY main logo/icon on pen barrel, ignore small text and details
- Corporate ballpoint pen, white studio background`
    },

    'sticker-sheet': {
        category: 'goods',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '스티커',
        prompt: `Die-cut vinyl sticker mockup featuring this design.
- Two stickers: one on MacBook lid, one inside open diary/planner pages
- Glossy finish, minimal desk setting`
    },

    'wristband': {
        category: 'goods',
        mode: 'COMPOSITE',
        ratio: '16:9',
        label: '입장 밴드',
        prompt: `Event paper wristband mockup featuring this design.

- Standard Tyvek event wristband (concert, theme park, conference style)
- Print the logo on the wristband
- TWO color variations: brand color band + white band (logo shape stays same)
- White studio background, product shot style`
    },

    'pin-button': {
        category: 'goods',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '핀버튼',
        prompt: `Button pin badge mockup on canvas tote bag.
- Round pinback button pinned to eco bag or canvas tote
- Show partial view of bag with pin attached
- Lifestyle product shot, not close-up`
    },

    'metal-badge': {
        category: 'goods',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '금속 뱃지',
        prompt: `Enamel pin mockup featuring main design element only.
- Convert ONLY the main logo/icon to enamel pin
- Small text and details stay as printed paper background
- Hard enamel lapel pin with gold/silver metal border
- Pin displayed on branded paper card backing`
    },

    'keychain': {
        category: 'goods',
        mode: 'COMPOSITE',
        ratio: '1:1',
        label: '키링',
        prompt: `Acrylic keychain charm mockup featuring this design.
- Clear acrylic with printed design, metal ring attachment
- White studio background, merchandise product shot`
    }
};

// 카테고리 정보
const CATEGORIES = {
    digital: { label: '디지털', icon: '🖥️' },
    print: { label: '인쇄물', icon: '🖨️' },
    outdoor: { label: '옥외광고', icon: '🏙️' },
    booth: { label: '부스', icon: '🏪' },
    device: { label: '디바이스', icon: '📱' },
    packaging: { label: '패키징', icon: '📦' },
    goods: { label: '굿즈', icon: '🎁' }
};

module.exports.config = {
    maxDuration: 60,
};

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // GET: 목업 설정 정보 반환
    if (req.method === 'GET') {
        const mockupList = Object.entries(MOCKUP_CONFIGS).map(([key, config]) => ({
            key,
            label: config.label,
            category: config.category,
            categoryLabel: CATEGORIES[config.category]?.label,
            mode: config.mode,
            ratio: config.ratio
        }));

        return res.status(200).json({
            success: true,
            categories: CATEGORIES,
            mockups: mockupList
        });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // 로고/키비주얼 두 개 이미지 또는 기존 productImage 지원 (하위호환)
    const { logoImage, keyVisualImage, productImage, mockupType = 'social-square', customPrompt } = req.body;

    // 하위호환: productImage가 있으면 keyVisualImage로 사용
    const effectiveLogoImage = logoImage || null;
    const effectiveKeyVisualImage = keyVisualImage || productImage || null;

    if (!effectiveLogoImage && !effectiveKeyVisualImage) {
        return res.status(400).json({ error: '최소 1개 이상의 이미지가 필요합니다 (로고 또는 키비주얼)' });
    }

    const config = MOCKUP_CONFIGS[mockupType] || MOCKUP_CONFIGS['social-square'];
    const startTime = Date.now();

    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        // 이미지 데이터 추출 헬퍼 함수
        const extractImageData = (imageData) => {
            if (!imageData) return null;
            let base64 = imageData;
            let mimeType = 'image/png';

            if (imageData.startsWith('data:')) {
                const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
                if (matches) {
                    mimeType = matches[1];
                    base64 = matches[2];
                }
            }
            return { base64, mimeType };
        };

        const logoData = extractImageData(effectiveLogoImage);
        const keyVisualData = extractImageData(effectiveKeyVisualImage);

        // 이미지 상태 확인
        const hasLogo = !!logoData;
        const hasKeyVisual = !!keyVisualData;
        const imageCount = (hasLogo ? 1 : 0) + (hasKeyVisual ? 1 : 0);

        console.log(`[Mockup v4] Type: ${mockupType}, Mode: ${config.mode}, Logo: ${hasLogo}, KeyVisual: ${hasKeyVisual}`);

        // 프롬프트 구성 - 로고/키비주얼 역할 명시
        let imageRolePrompt = '';
        if (hasLogo && hasKeyVisual) {
            imageRolePrompt = `
IMAGE ROLES (VERY IMPORTANT):
- FIRST IMAGE = LOGO: Use this for brand signage, headers, small branding elements
- SECOND IMAGE = KEY VISUAL: Use this as the main hero image, product shot, or background visual

Place each image according to its role. The logo should be smaller and used for branding. The key visual should be prominent and used as the main visual element.`;
        } else if (hasLogo) {
            imageRolePrompt = `
IMAGE ROLE: This image is a LOGO/BRAND SYMBOL. Use it for signage, headers, and branding elements. Keep it appropriately sized for brand identity.`;
        } else if (hasKeyVisual) {
            imageRolePrompt = `
IMAGE ROLE: This image is the KEY VISUAL/MAIN IMAGE. Use it as the hero element, main product shot, or primary visual. Make it prominent in the mockup.`;
        }

        const finalPrompt = customPrompt
            ? `${customPrompt}${imageRolePrompt}\n\nIMPORTANT: Do not distort or stretch images. Maintain exact original proportions.\nAspect ratio: ${config.ratio}`
            : `${config.prompt}${imageRolePrompt}`;

        // Gemini 3 Pro Image API 호출
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${geminiApiKey}`;

        // 프롬프트 구성
        const promptWithRatio = `${finalPrompt}\n\nAspect ratio: ${config.ratio}. Generate a photorealistic mockup image.`;

        // parts 배열 구성 (프롬프트 + 이미지들)
        const parts = [{ text: promptWithRatio }];

        // 로고 이미지 추가 (첫 번째)
        if (logoData) {
            parts.push({
                inline_data: {
                    mime_type: logoData.mimeType,
                    data: logoData.base64
                }
            });
        }

        // 키비주얼 이미지 추가 (두 번째)
        if (keyVisualData) {
            parts.push({
                inline_data: {
                    mime_type: keyVisualData.mimeType,
                    data: keyVisualData.base64
                }
            });
        }

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: parts
                }],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                    imageConfig: {
                        aspectRatio: config.ratio,
                        imageSize: '2K'
                    }
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[Mockup v3] Gemini error (${response.status}):`, errText);

            // 400 에러 상세 분석
            let errMessage = `Gemini API failed: ${response.status}`;
            try {
                const errJson = JSON.parse(errText);
                errMessage = errJson?.error?.message || errText.substring(0, 500);
            } catch (parseErr) {
                errMessage = errText.substring(0, 500) || `Gemini API failed: ${response.status}`;
            }
            throw new Error(errMessage);
        }

        const data = await response.json();
        let mockupImageBase64 = null;
        let modelResponse = null;

        // 응답에서 이미지 추출
        for (const candidate of (data.candidates || [])) {
            for (const part of (candidate.content?.parts || [])) {
                if (part.inlineData?.mimeType?.startsWith('image/')) {
                    mockupImageBase64 = part.inlineData.data;
                } else if (part.text) {
                    modelResponse = part.text;
                }
            }
        }

        if (!mockupImageBase64) {
            // 상세 로깅
            const responsePreview = JSON.stringify(data).substring(0, 1000);
            console.error(`[Mockup v3] No image for ${mockupType}:`, responsePreview);

            // 차단 원인 분석
            const blockReason = data?.candidates?.[0]?.finishReason;
            const safetyRatings = data?.candidates?.[0]?.safetyRatings;

            if (blockReason === 'SAFETY') {
                console.error('[Mockup v3] Blocked by safety filter:', safetyRatings);
                throw new Error(`안전 필터에 의해 차단되었습니다. 다른 이미지로 시도해주세요.`);
            }

            if (modelResponse) {
                console.error('[Mockup v3] Model text response:', modelResponse);
            }

            throw new Error(`${config.label} 목업 생성 실패. 다른 이미지나 목업 타입을 시도해주세요.`);
        }

        const totalTime = Date.now() - startTime;
        console.log(`[Mockup v3] Success in ${totalTime}ms`);

        // Supabase 저장
        let savedImage = null;
        try {
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );

            const buffer = Buffer.from(mockupImageBase64, 'base64');
            const fileName = `mockup-${mockupType}-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

            const { error: uploadError } = await supabase.storage
                .from('generated-images')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    cacheControl: '3600'
                });

            if (!uploadError) {
                // 업로드 후 잠시 대기 (스토리지 동기화)
                await new Promise(resolve => setTimeout(resolve, 500));

                const { data: { publicUrl } } = supabase.storage
                    .from('generated-images')
                    .getPublicUrl(fileName);

                const { data: dbData } = await supabase
                    .from('images')
                    .insert({
                        image_url: publicUrl,
                        prompt: `${config.label} 목업`,
                        model: 'gemini-3-pro-image',
                        style: mockupType,
                        aspect_ratio: config.ratio,
                        quality: 'standard'
                    })
                    .select()
                    .single();

                if (dbData) {
                    savedImage = dbData;
                    console.log('[Supabase] Saved:', savedImage.id);
                }
            }
        } catch (e) {
            console.error('[Supabase] Error:', e.message);
        }

        // 응답 (generate-image.js와 동일한 구조로 맞춤)
        res.status(200).json({
            success: true,
            image: savedImage?.image_url || `data:image/png;base64,${mockupImageBase64}`,
            savedImage,
            debug: {
                mockupType,
                mockupLabel: config.label,
                category: config.category,
                categoryLabel: CATEGORIES[config.category]?.label,
                mode: config.mode,
                aspectRatio: config.ratio,
                // 이미지 입력 상태
                hasLogo,
                hasKeyVisual,
                imageCount,
                // generate-image.js와 동일한 필드명
                originalPrompt: `${config.label} 목업`,
                finalPrompt: finalPrompt.substring(0, 200) + '...',
                geminiModel: 'gemini-3-pro-image-preview',
                imagenModel: null,
                model: 'gemini-3-pro-image',
                modelResponse,
                totalTime: `${totalTime}ms`
            }
        });

    } catch (err) {
        console.error('[Mockup v3 Error]', err);

        await logError('GENERATION_ERROR', err.message, { mockupType }, { stack: err.stack });

        res.status(500).json({
            error: 'Mockup generation failed',
            message: err.message,
            mockupType: mockupType,
            mockupLabel: config?.label,
            friendlyMessage: {
                message: err.message || '목업 생성에 실패했어요. 다시 시도해주세요 🔄',
                suggestion: '다른 목업 타입을 시도하거나 이미지를 다시 업로드해보세요.'
            }
        });
    }
};
