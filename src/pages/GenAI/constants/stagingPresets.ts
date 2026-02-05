/**
 * 연출 생성 (Portrait Staging) 프리셋 정의
 * - 6개 카테고리, 총 18개 프리셋
 */

// 카테고리 타입
export type StagingCategoryKey = 'corporate' | 'editorial' | 'lifestyle' | 'event' | 'studio' | 'creative';

// 프리셋 비율 타입
export type StagingAspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

// 카테고리 인터페이스
export interface StagingCategory {
  key: StagingCategoryKey;
  label: string;
  icon: string;
  description: string;
}

// 프롬프트 설정 서브 인터페이스
interface IdentityPreservation {
  use_reference_image: boolean;
  strict_identity_lock: boolean;
  alter_face: boolean;
  alter_hairstyle: boolean;
  alter_expression: boolean;
  notes: string;
}

interface SubjectConfig {
  gender: string;
  aesthetic: string;
  expression: string;
  grooming: string;
  pose: string;
}

interface WardrobeConfig {
  top: string;
  bottom?: string;
  accessories: string;
  rules: string[];
}

interface EnvironmentConfig {
  location: string;
  details: string;
  atmosphere: string;
}

interface LightingConfig {
  technique: string;
  setup: string;
  effects: string[];
}

interface CameraConfig {
  model: string;
  lens: string;
  aperture: string;
  depth_of_field: string;
  color_grading: string;
}

interface QualityConfig {
  realism: string;
  detail_level: string;
  look: string;
}

// 프롬프트 설정 인터페이스
export interface PromptConfig {
  type: string;
  aspect_ratio: string;
  resolution: string;
  style: string;
  identity_preservation: IdentityPreservation;
  subject: SubjectConfig;
  wardrobe: WardrobeConfig;
  environment: EnvironmentConfig;
  lighting: LightingConfig;
  camera: CameraConfig;
  quality: QualityConfig;
  constraints: string[];
  output_goal: string;
}

// 프리셋 인터페이스
export interface StagingPreset {
  key: string;
  label: string;
  category: StagingCategoryKey;
  description: string;
  thumbnail: string;
  aspectRatio: StagingAspectRatio;
  promptConfig: PromptConfig;
}

// 6개 카테고리
export const STAGING_CATEGORIES: StagingCategory[] = [
  { key: 'corporate', label: '비즈니스', icon: '💼', description: '임원, 링크드인, 오피스' },
  { key: 'editorial', label: '에디토리얼', icon: '📸', description: '럭셔리, 패션, 골든아워' },
  { key: 'lifestyle', label: '라이프스타일', icon: '☕', description: '카페, 여행, 도시' },
  { key: 'event', label: '프로모션', icon: '🎉', description: '시상식, 갈라, 런칭' },
  { key: 'studio', label: '스튜디오', icon: '🎬', description: '클래식, 하이키, 로우키' },
  { key: 'creative', label: '크리에이티브', icon: '🎨', description: '사이버펑크, 빈티지, 팝아트' },
];

// 18개 프리셋 (카테고리당 3개)
export const STAGING_PRESETS: StagingPreset[] = [
  // ============================================
  // Corporate (비즈니스) - 3개
  // ============================================
  {
    key: 'executive-portrait',
    label: '임원 프로필',
    category: 'corporate',
    description: '고급 정장, 어두운 배경, 영화같은 조명',
    thumbnail: '/images/stagings/executive-portrait.webp',
    aspectRatio: '3:4',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '3:4',
      resolution: '8K',
      style: 'executive corporate portrait, Fortune 500 annual report quality, cinematic lighting',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Preserve 100% of facial identity, skin texture, facial structure, and hair. The person MUST be immediately recognizable as the same individual.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'commanding presence, established leader, trustworthy authority',
        expression: 'confident yet approachable, slight knowing smile, direct eye contact',
        grooming: 'impeccable professional grooming, clean-shaven or well-maintained facial hair, polished appearance',
        pose: 'three-quarter turn to camera, shoulders squared and relaxed, chin slightly elevated, hands not visible or clasped professionally',
      },
      wardrobe: {
        top: 'perfectly tailored navy or charcoal wool suit jacket, crisp white dress shirt with subtle texture, conservative silk tie in burgundy or navy with minimal pattern',
        bottom: 'matching suit trousers, not visible in frame',
        accessories: 'understated luxury watch (silver or gold), simple cufflinks, no visible jewelry except wedding band if appropriate',
        rules: [
          'NO loud patterns or colors',
          'NO visible logos or brand names',
          'Fabric must show quality texture - visible wool weave',
          'Perfect fit - no pulling, bunching, or loose fabric',
          'Tie knot must be symmetrical and properly dimpled',
          'Collar points must lay flat',
        ],
      },
      environment: {
        location: 'executive office or professional studio with dark backdrop',
        details: 'deep charcoal or navy gradient background, subtle hint of mahogany wood or leather in periphery, completely clean and uncluttered',
        atmosphere: 'established success, quiet confidence, corporate gravitas',
      },
      lighting: {
        technique: 'classic Rembrandt lighting with fill',
        setup: 'key light at 45 degrees creating subtle shadow under nose, soft fill light opposite at 1:3 ratio, gentle hair light for separation from background',
        effects: [
          'Defined cheekbones without harsh shadows',
          'Catch lights in both eyes at 10-11 o\'clock position',
          'Subtle rim light on shoulder for depth',
          'Gradual falloff into shadow on far side of face',
          'No hot spots or blown highlights on forehead',
        ],
      },
      camera: {
        model: 'Canon EOS R5 or equivalent full-frame',
        lens: '85mm f/1.4 portrait lens',
        aperture: 'f/4 for sharp focus on entire face',
        depth_of_field: 'moderate - face sharp, shoulders slightly soft, background smoothly blurred',
        color_grading: 'neutral with slight warmth, rich shadows, professional color accuracy, subtle contrast boost',
      },
      quality: {
        realism: 'photorealistic',
        detail_level: 'ultra - visible skin texture, fabric weave, individual hairs',
        look: 'Fortune 500 annual report, Wall Street Journal profile, corporate website hero',
      },
      constraints: [
        'DO NOT alter facial bone structure or proportions',
        'DO NOT smooth skin unnaturally - maintain realistic texture',
        'DO NOT change eye color, shape, or position',
        'DO NOT add or remove facial hair',
        'DO NOT change hair color, style, or texture',
        'NO glamour or beauty retouching',
        'NO dramatic color grading or filters',
        'NO visible watermarks, text, or logos',
        'Subject must look 100% human, not AI-generated',
      ],
      output_goal: 'Create a distinguished executive portrait suitable for corporate communications, annual reports, LinkedIn, and press materials. The subject should project confidence, competence, and approachability while maintaining absolute fidelity to their actual appearance.',
    },
  },
  {
    key: 'linkedin-pro',
    label: '링크드인 프로필',
    category: 'corporate',
    description: '전문적, 신뢰감, 소프트 조명',
    thumbnail: '/images/stagings/linkedin-pro.webp',
    aspectRatio: '1:1',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '1:1',
      resolution: '4K',
      style: 'professional headshot, LinkedIn profile optimized, approachable business portrait',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: This is for professional networking - the person MUST be instantly recognizable in real life. Preserve every facial feature exactly.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'professional, competent, approachable, trustworthy',
        expression: 'genuine warm smile showing slight teeth, friendly eyes, confident but not intimidating',
        grooming: 'neat and professional, natural makeup if any, well-groomed hair',
        pose: 'straight-on or slight angle, head tilted slightly, shoulders visible, open and welcoming body language',
      },
      wardrobe: {
        top: 'business casual - solid color blazer or smart cardigan over collared shirt, or professional blouse/shirt alone. Colors: navy, charcoal, soft blue, white, cream',
        accessories: 'minimal - simple stud earrings, thin necklace if any, no distracting jewelry',
        rules: [
          'NO busy patterns or loud colors',
          'NO casual t-shirts or athletic wear',
          'Solid colors photograph best',
          'Neckline should be professional',
          'Clothing should fit well, not tight or loose',
        ],
      },
      environment: {
        location: 'clean, simple background',
        details: 'soft gradient background in light gray, soft blue, or warm neutral. Alternatively, subtly blurred modern office environment',
        atmosphere: 'professional, clean, contemporary, inviting',
      },
      lighting: {
        technique: 'soft, even beauty lighting',
        setup: 'large softbox or ring light creating even illumination, minimal shadows, slight fill from below to reduce under-eye shadows',
        effects: [
          'Even skin illumination without flat look',
          'Subtle catch lights in eyes',
          'No harsh shadows under nose or chin',
          'Gentle highlight on hair',
          'Clean separation from background',
        ],
      },
      camera: {
        model: 'professional DSLR or mirrorless',
        lens: '70-85mm portrait lens',
        aperture: 'f/2.8 - f/4',
        depth_of_field: 'shallow enough to blur background, face entirely in focus',
        color_grading: 'natural, true-to-life colors, slight warmth for approachability, clean whites',
      },
      quality: {
        realism: 'photorealistic',
        detail_level: 'high - natural skin texture, not over-smoothed',
        look: 'professional headshot photographer quality, suitable for corporate LinkedIn',
      },
      constraints: [
        'DO NOT over-smooth skin - keep natural texture',
        'DO NOT whiten teeth excessively',
        'DO NOT alter facial proportions',
        'DO NOT change eye color or shape',
        'DO NOT add makeup that wasn\'t there',
        'NO beauty filters or glamour effects',
        'NO dramatic shadows or artistic lighting',
        'Must look like a real photo, not AI-generated',
        'Person must be recognizable when met in person',
      ],
      output_goal: 'Create a professional, approachable headshot optimized for LinkedIn and professional networking. The subject should look competent, friendly, and trustworthy - someone others would want to work with. Must be instantly recognizable as the same person in real life.',
    },
  },
  {
    key: 'modern-office',
    label: '모던 오피스',
    category: 'corporate',
    description: '트렌디한 사무실, 자연광',
    thumbnail: '/images/stagings/modern-office.webp',
    aspectRatio: '4:3',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '4:3',
      resolution: '4K',
      style: 'environmental business portrait, modern workplace, natural light photography',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Preserve complete facial identity. The environmental context should enhance, not distract from, the person\'s authentic appearance.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'modern professional, innovative, dynamic, forward-thinking',
        expression: 'engaged and confident, natural smile or thoughtful expression, eyes showing intelligence and openness',
        grooming: 'polished but contemporary, less formal than traditional corporate',
        pose: 'relaxed professional stance, possibly leaning against desk or standing by window, body angled with shoulders open',
      },
      wardrobe: {
        top: 'smart casual - well-fitted blazer with no tie, quality sweater, or clean button-down shirt. Modern cuts, not stuffy. Colors: navy, gray, soft earth tones, muted colors',
        bottom: 'tailored chinos or modern dress pants, not visible or barely visible',
        accessories: 'modern watch, minimal jewelry, possibly glasses if originally worn',
        rules: [
          'NO formal suits with ties (too stuffy)',
          'NO hoodies or overly casual wear',
          'Modern fit - not baggy, not too tight',
          'Quality fabrics that photograph well',
          'Clean, pressed, well-maintained clothing',
        ],
      },
      environment: {
        location: 'contemporary open-plan office or co-working space',
        details: 'large windows with natural light, modern furniture, plants, clean desks, possibly exposed brick or concrete, glass partitions, warm wood accents. Background slightly blurred but recognizable as modern workplace',
        atmosphere: 'innovative, collaborative, energetic yet focused, tech-forward',
      },
      lighting: {
        technique: 'natural window light with ambient fill',
        setup: 'large window as main light source (soft, diffused daylight), office ambient lighting as fill, no harsh direct sunlight',
        effects: [
          'Soft, flattering natural light on face',
          'Slight warmth from afternoon light',
          'Natural shadows adding depth',
          'Ambient office glow in background',
          'No harsh contrast or blown windows',
        ],
      },
      camera: {
        model: 'full-frame mirrorless',
        lens: '35-50mm for environmental context',
        aperture: 'f/2.8 - f/4',
        depth_of_field: 'moderate - subject sharp, background recognizable but soft',
        color_grading: 'warm, natural tones, slightly lifted shadows, contemporary color palette',
      },
      quality: {
        realism: 'photorealistic',
        detail_level: 'high - natural textures throughout',
        look: 'corporate website about page, company culture photography, modern annual report',
      },
      constraints: [
        'DO NOT alter any facial features',
        'DO NOT make environment look fake or CGI',
        'DO NOT use unnatural color grading',
        'DO NOT add people or objects that distract',
        'Background should be realistic modern office',
        'Natural light only - no studio lighting look',
        'Must feel authentic, not staged',
        'Person must be the clear focal point',
      ],
      output_goal: 'Create an environmental business portrait showing the subject in a modern, innovative workplace. The image should communicate that this person works in a contemporary, dynamic environment while maintaining complete authenticity in their appearance. Suitable for company websites, team pages, and professional profiles.',
    },
  },

  // ============================================
  // Editorial (에디토리얼) - 3개
  // ============================================
  {
    key: 'quiet-luxury',
    label: '콰이어트 럭셔리',
    category: 'editorial',
    description: '미니멀 고급스러움, 시네마틱',
    thumbnail: '/images/stagings/quiet-luxury.webp',
    aspectRatio: '3:4',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '3:4',
      resolution: '8K',
      style: 'high-end editorial portrait, quiet luxury aesthetic, cinematic realism, understated elegance',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Preserve 100% of the person\'s facial identity, proportions, skin texture, age characteristics, and hairstyle exactly as in the reference image. This is luxury editorial, not beauty retouching.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'understated elegance, effortless sophistication, old money sensibility, refined minimalism',
        expression: 'calm, composed, quietly confident, subtle knowing expression, serene but not blank',
        grooming: 'impeccable but natural, no obvious makeup, clean and polished, hair styled but not overdone',
        pose: 'relaxed yet poised, natural weight distribution, elegant hand positioning, editorial posture without stiffness',
      },
      wardrobe: {
        top: 'premium cashmere crew-neck sweater in muted tone (ivory, oatmeal, camel, soft gray, or charcoal), or fine-gauge merino wool, or silk blouse in neutral',
        bottom: 'tailored wool trousers or dark indigo premium denim, minimal visible',
        accessories: 'single understated piece only - fine leather-strap watch, thin gold chain, small pearl earrings. NO logos, NO statement pieces',
        rules: [
          'ONLY premium natural fabrics - cashmere, wool, silk, fine cotton',
          'NO visible logos or branding whatsoever',
          'NO bright colors - only neutrals, earth tones, muted shades',
          'NO trendy or fast-fashion items',
          'Monochromatic or tonal color palette',
          'Perfect fit is essential - no bunching, pulling, or excess fabric',
          'Clothing should look expensive through quality, not flash',
          'The Row, Brunello Cucinelli, Loro Piana aesthetic',
        ],
      },
      environment: {
        location: 'refined minimalist interior space',
        details: 'clean architectural lines, neutral palette (warm whites, soft grays, natural wood), subtle texture from quality materials (linen, bouclé, travertine, oak), soft natural light through large windows, minimal but curated objects',
        atmosphere: 'serene sophistication, gallery-like calm, quiet wealth, timeless rather than trendy',
      },
      lighting: {
        technique: 'soft directional natural light with architectural shadows',
        setup: 'large window as primary source creating gentle directional light, subtle fill from reflected surfaces, no artificial lighting visible',
        effects: [
          'Soft shadows that add dimension without drama',
          'Gentle highlights on fabric texture showing quality',
          'Luminous skin without being glossy',
          'Depth through subtle light gradation',
          'Atmospheric quality without haze',
        ],
      },
      camera: {
        model: 'Hasselblad X2D 100C or Phase One medium format',
        lens: '90mm portrait lens for medium format',
        aperture: 'f/2.8 - f/4',
        depth_of_field: 'cinematic shallow - subject sharp, background softly blurred but recognizable',
        color_grading: 'muted, desaturated palette, lifted shadows, subtle warmth, luxury fashion editorial tones, no heavy contrast',
      },
      quality: {
        realism: 'cinematic photorealistic',
        detail_level: 'ultra - extreme texture detail on skin pores, fabric weave, material quality',
        look: 'The Row lookbook, Loro Piana campaign, WSJ Magazine editorial, luxury brand content',
      },
      constraints: [
        'DO NOT alter facial identity, structure, or features',
        'DO NOT smooth skin to plastic perfection - keep natural texture',
        'DO NOT add glamour or beauty retouching',
        'DO NOT use bright, saturated colors',
        'DO NOT include any visible branding or logos',
        'DO NOT make it look like Instagram influencer content',
        'Avoid anything trendy, flashy, or attention-seeking',
        'NO heavy makeup looks',
        'NO obvious posing - must feel natural',
        'Must look like actual photography, not CGI',
      ],
      output_goal: 'Create a sophisticated quiet luxury editorial portrait that embodies understated elegance and timeless refinement. The image should whisper wealth through quality materials, perfect fit, and serene confidence - never through logos or flash. Suitable for luxury brand campaigns, high-end magazine editorials, or refined personal branding.',
    },
  },
  {
    key: 'fashion-editorial',
    label: '패션 에디토리얼',
    category: 'editorial',
    description: '보그/GQ 스타일, 드라마틱 조명',
    thumbnail: '/images/stagings/fashion-editorial.webp',
    aspectRatio: '3:4',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '3:4',
      resolution: '8K',
      style: 'high fashion editorial, Vogue/GQ aesthetic, dramatic studio lighting, editorial glamour',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: While this is high fashion, the person\'s actual face must be 100% preserved. Editorial styling enhances, it does not alter identity.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'editorial fashion, striking presence, magnetic confidence, high-fashion sensibility',
        expression: 'intense and captivating, slight attitude, piercing gaze, editorial "look" - confident without being aggressive',
        grooming: 'editorial-level polished, defined features, styled hair with movement or sleek perfection',
        pose: 'dynamic fashion pose, angular and intentional, strong silhouette, shoulders engaged, chin defined',
      },
      wardrobe: {
        top: 'designer fashion piece - structured blazer with sharp shoulders, luxury silk blouse, or architectural top. Bold but sophisticated - black, white, deep jewel tones, or striking single color',
        accessories: 'statement piece appropriate to editorial - sculptural earrings, bold cuff, or nothing at all. Intentional choice',
        rules: [
          'Fashion-forward, designer aesthetic',
          'Strong silhouettes and clean lines',
          'Quality fabrics with visible texture',
          'Can be bold but must be sophisticated',
          'NO cheap or poorly fitted clothing',
          'Clothing should photograph as ART',
          'Think runway translated to portrait',
        ],
      },
      environment: {
        location: 'fashion studio or minimalist architectural space',
        details: 'clean backdrop - seamless paper (white, gray, or black), or stark architectural environment with interesting shadows. Nothing distracting from the subject',
        atmosphere: 'controlled, intentional, magazine-ready, every element purposeful',
      },
      lighting: {
        technique: 'dramatic fashion lighting with intention',
        setup: 'strong key light creating defined shadows, possible rim light for separation, strategic shadows for drama and dimension',
        effects: [
          'Sculpted cheekbones through shadow',
          'Dramatic but flattering contrast',
          'Catch lights adding intensity to eyes',
          'Defined jaw and neck through lighting',
          'Hair light or rim for editorial polish',
          'Shadows as compositional element',
        ],
      },
      camera: {
        model: 'Hasselblad H6D or Phase One XF',
        lens: '80mm or 120mm medium format lens',
        aperture: 'f/5.6 - f/8 for fashion sharpness',
        depth_of_field: 'moderate - entire outfit in focus, background clean',
        color_grading: 'high-fashion color grade, rich blacks, clean highlights, editorial contrast, can be desaturated or bold depending on mood',
      },
      quality: {
        realism: 'editorial photorealistic',
        detail_level: 'ultra - magazine print quality',
        look: 'Vogue, GQ, Harper\'s Bazaar, W Magazine editorial spread',
      },
      constraints: [
        'DO NOT alter facial bone structure or proportions',
        'DO NOT change the person\'s actual appearance',
        'DO NOT over-retouch to plastic perfection',
        'Dramatic lighting must still be FLATTERING',
        'Fashion-forward but not costume-like',
        'NO cheesy or dated fashion photography tropes',
        'Must look like actual magazine photography',
        'Shadows should sculpt, not obscure features',
      ],
      output_goal: 'Create a striking high-fashion editorial portrait worthy of Vogue or GQ. The image should be dramatic, sophisticated, and fashion-forward while maintaining the subject\'s authentic identity. The lighting, styling, and pose work together to create magazine-worthy impact.',
    },
  },
  {
    key: 'golden-hour',
    label: '골든아워',
    category: 'editorial',
    description: '일몰 빛, 따뜻한 색감',
    thumbnail: '/images/stagings/golden-hour.webp',
    aspectRatio: '16:9',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '16:9',
      resolution: '4K',
      style: 'golden hour portrait, magic hour cinematography, warm natural light editorial',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: The warm light enhances but must not alter facial features. Person must be completely recognizable.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'warm, luminous, naturally beautiful, effortlessly captivating',
        expression: 'serene, genuine warmth, soft smile or peaceful contemplation, eyes catching the golden light',
        grooming: 'natural and effortless, wind-touched hair acceptable, minimal visible makeup',
        pose: 'relaxed and natural, possibly looking toward light source, profile or three-quarter view to catch light beautifully',
      },
      wardrobe: {
        top: 'flowy natural fabrics that catch light - linen, cotton, silk. Earth tones, cream, white, soft pastels, or warm neutrals that complement golden light',
        accessories: 'minimal - delicate gold jewelry catches light beautifully, or none',
        rules: [
          'Natural, breathable fabrics',
          'Colors that harmonize with warm light',
          'Nothing too structured or formal',
          'Clothing should move naturally',
          'White and cream fabrics glow beautifully',
          'NO harsh black or cold colors',
        ],
      },
      environment: {
        location: 'outdoor location during golden hour',
        details: 'natural setting - open field, beach, rooftop, hillside, or architectural space with golden light flooding in. Background softly blurred but showing warm ambient glow',
        atmosphere: 'magical, warm, romantic, cinematic, fleeting beauty of golden hour',
      },
      lighting: {
        technique: 'natural golden hour backlighting with fill',
        setup: 'sun at 15-30 degrees above horizon behind or to side of subject, natural bounce fill from environment or reflector effect',
        effects: [
          'Warm golden rim light around hair and shoulders',
          'Soft, glowing skin illumination',
          'Lens flare acceptable and beautiful',
          'Long shadows adding depth',
          'Hair lit up like a halo',
          'Warm color cast on everything',
          'Backlit glow creating ethereal quality',
        ],
      },
      camera: {
        model: 'Sony A7R V or Canon EOS R5',
        lens: '85mm f/1.4 or 70-200mm f/2.8',
        aperture: 'f/2 - f/2.8 for dreamy bokeh',
        depth_of_field: 'very shallow - subject sharp, background melting into golden bokeh',
        color_grading: 'warm, golden tones enhanced, lifted shadows with warm fill, slight fade for film look, orange and teal hints in shadows',
      },
      quality: {
        realism: 'cinematic photorealistic',
        detail_level: 'high - but softened by light quality',
        look: 'lifestyle campaign, fragrance advertisement, romantic editorial, film still',
      },
      constraints: [
        'DO NOT alter facial features despite warm light',
        'DO NOT make it look artificially warm/orange',
        'DO NOT lose detail in highlights',
        'DO NOT make skin look sunburned',
        'Light should enhance, not obscure features',
        'Must still look natural, not over-processed',
        'Golden hour is warm but not nuclear orange',
        'Person must be recognizable despite backlighting',
      ],
      output_goal: 'Create a stunning golden hour portrait that captures the magical quality of sunset light. The warm, cinematic lighting should make the subject glow while maintaining their authentic appearance. Perfect for lifestyle brands, personal branding, or romantic editorial content.',
    },
  },

  // ============================================
  // Lifestyle (라이프스타일) - 3개
  // ============================================
  {
    key: 'cafe-moment',
    label: '카페 모먼트',
    category: 'lifestyle',
    description: '커피숍, 여유로운 분위기',
    thumbnail: '/images/stagings/cafe-moment.webp',
    aspectRatio: '4:3',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '4:3',
      resolution: '4K',
      style: 'lifestyle portrait, cozy cafe aesthetic, authentic moment, Instagram-worthy but genuine',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Lifestyle photography must show the REAL person in a lifestyle context. Do not idealize or alter their appearance.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'relaxed sophistication, approachable warmth, weekend mood',
        expression: 'genuine warm smile or relaxed contemplation, comfortable and at ease, natural and unposed feeling',
        grooming: 'casual-chic, effortless style, natural hair, minimal makeup',
        pose: 'naturally seated at cafe table, possibly holding cup, relaxed shoulders, engaged with environment or camera',
      },
      wardrobe: {
        top: 'cozy knit sweater, casual blazer, quality cotton shirt, or soft cashmere. Warm, inviting colors - cream, camel, soft gray, muted earth tones',
        accessories: 'simple watch, delicate necklace, possibly reading glasses, nothing distracting',
        rules: [
          'Comfortable but put-together',
          'Natural, touchable fabrics',
          'Colors that feel warm and cozy',
          'NO overdressed or formal looks',
          'NO athletic or sloppy casual',
          'Should look like actual weekend outfit',
          'Quality basics over trendy items',
        ],
      },
      environment: {
        location: 'stylish Korean/Japanese influenced cafe interior',
        details: 'warm wood surfaces, exposed brick or white walls, indoor plants, ceramic coffee cup visible, quality pastry on plate, soft ambient lighting, other cafe elements slightly blurred in background',
        atmosphere: 'hygge, cozy, warm, inviting, perfect weekend morning',
      },
      lighting: {
        technique: 'natural window light with cafe ambiance',
        setup: 'soft diffused daylight from large window, warm ambient lighting from cafe fixtures, no harsh shadows',
        effects: [
          'Soft, flattering light on face',
          'Warm glow in overall image',
          'Slight overexposure in window areas acceptable',
          'Steam from coffee catching light',
          'Cozy contrast between light and shadow',
        ],
      },
      camera: {
        model: 'Fujifilm X-T5 or Sony A7C',
        lens: '35mm or 50mm for environmental context',
        aperture: 'f/1.8 - f/2.8',
        depth_of_field: 'moderate shallow - subject sharp, cafe ambiance softly blurred',
        color_grading: 'warm, slightly muted, film-like tones, Fuji film simulation aesthetic, lifted shadows',
      },
      quality: {
        realism: 'authentic photorealistic',
        detail_level: 'high but natural',
        look: 'lifestyle blog, brand ambassador content, premium coffee brand campaign',
      },
      constraints: [
        'DO NOT alter facial features',
        'DO NOT make it look like stock photography',
        'DO NOT use fake or CGI-looking cafe',
        'Must feel AUTHENTIC and REAL',
        'NO obviously posed or stiff positioning',
        'NO over-filtered Instagram look',
        'Person should look like they actually go to cafes',
        'Environment must be believable Korean/Japanese cafe',
      ],
      output_goal: 'Create an authentic lifestyle portrait showing the subject enjoying a quiet cafe moment. The image should feel genuine and relatable while maintaining visual appeal. Perfect for personal branding, social media, or lifestyle brand partnerships.',
    },
  },
  {
    key: 'travel-wanderlust',
    label: '여행 원더러스트',
    category: 'lifestyle',
    description: '여행지 배경, 자유로움',
    thumbnail: '/images/stagings/travel-wanderlust.webp',
    aspectRatio: '16:9',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '16:9',
      resolution: '4K',
      style: 'travel portrait, wanderlust aesthetic, adventure and freedom, cinematic travel photography',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Travel photos are personal memories - the person must be 100% recognizable. Natural windswept hair is fine but facial features are sacred.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'adventurous, free-spirited, cultured traveler, not tourist',
        expression: 'wonder, joy, peaceful contentment, genuine happiness, eyes taking in the view',
        grooming: 'natural, travel-appropriate, windswept hair acceptable and often beautiful',
        pose: 'gazing at view, walking into frame, standing at viewpoint, arms relaxed or slightly raised, back partially to camera acceptable',
      },
      wardrobe: {
        top: 'practical but stylish travel wear - linen shirt, light jacket, comfortable quality basics. Natural earth tones, navy, olive, cream',
        bottom: 'comfortable travel pants or jeans, not visible or barely visible',
        accessories: 'quality leather bag, sunglasses on head, simple watch, comfortable walking shoes visible',
        rules: [
          'Practical but photogenic',
          'Appropriate for destination climate',
          'Quality basics that travel well',
          'NO obvious tourist gear (fanny packs, etc)',
          'NO overdressed or underdressed',
          'Should look like seasoned traveler',
          'Breathable, natural fabrics',
        ],
      },
      environment: {
        location: 'stunning travel destination - overlook, ancient street, coastal cliff, mountain vista',
        details: 'dramatic landscape or charming destination as backdrop - could be European old town, Asian temple area, coastal Mediterranean, mountain range. Location should be aspirational but believable',
        atmosphere: 'wanderlust, freedom, discovery, the joy of travel, golden hour preferred',
      },
      lighting: {
        technique: 'natural outdoor light, preferably golden hour or soft daylight',
        setup: 'sun position creating flattering light on subject while illuminating destination, possible backlight for cinematic effect',
        effects: [
          'Natural outdoor illumination',
          'Destination properly exposed',
          'Subject well-lit but not artificially',
          'Atmospheric haze acceptable',
          'Sun flare can add to mood',
        ],
      },
      camera: {
        model: 'Sony A7C or Fujifilm X100V',
        lens: '24-35mm for environmental context',
        aperture: 'f/4 - f/8 to keep destination in focus',
        depth_of_field: 'deeper - both subject and destination should be relatively sharp',
        color_grading: 'rich, vibrant but natural, travel photography aesthetic, enhanced blues and greens, warm skin tones',
      },
      quality: {
        realism: 'photorealistic',
        detail_level: 'high throughout - landscape and subject both important',
        look: 'National Geographic Traveler, Condé Nast Traveller, premium travel blog',
      },
      constraints: [
        'DO NOT alter facial features',
        'DO NOT use obviously fake or CGI backgrounds',
        'Destination must look REAL and SPECIFIC',
        'NO generic or stock photo destinations',
        'Subject and location must feel cohesive',
        'Must look like actual travel photo, not composite',
        'NO overly saturated or HDR look',
        'Weather and lighting must match',
      ],
      output_goal: 'Create an aspirational travel portrait that captures the joy and freedom of exploration. The image should make viewers want to book a flight while showing the subject authentically enjoying a stunning destination. Perfect for travel content, personal memories, or adventure brand partnerships.',
    },
  },
  {
    key: 'urban-casual',
    label: '어반 캐주얼',
    category: 'lifestyle',
    description: '도시 일상, 스타일리시',
    thumbnail: '/images/stagings/urban-casual.webp',
    aspectRatio: '9:16',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '9:16',
      resolution: '4K',
      style: 'urban lifestyle portrait, street style aesthetic, city cool, casual sophistication',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Street style celebrates individual identity - preserve the person\'s authentic appearance completely.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'effortlessly cool, urban sophisticate, city dweller confidence',
        expression: 'confident, slightly mysterious, cool but not cold, natural street style energy',
        grooming: 'intentionally casual, styled but not overdone, urban-appropriate',
        pose: 'walking, standing casually, leaning against wall, natural movement, candid energy even if posed',
      },
      wardrobe: {
        top: 'elevated casual - quality leather jacket, oversized blazer, designer hoodie, premium basics. Neutral palette with possible statement piece',
        bottom: 'well-fitted jeans, tailored trousers, or quality joggers',
        accessories: 'stylish sneakers or boots, quality bag, sunglasses, minimal jewelry',
        rules: [
          'Elevated streetwear aesthetic',
          'Quality over logos',
          'Mix of casual and refined pieces',
          'Contemporary silhouettes',
          'NO sloppy or ill-fitting items',
          'Should look intentionally styled',
          'Think Scandinavian street style',
        ],
      },
      environment: {
        location: 'stylish urban setting - modern city street, architectural detail, hip neighborhood',
        details: 'clean modern architecture, interesting textures (concrete, glass, brick), possibly graffiti art, urban greenery, coffee shop storefront. Background should be recognizably cool city area',
        atmosphere: 'metropolitan energy, contemporary cool, aspirational urban lifestyle',
      },
      lighting: {
        technique: 'natural urban daylight with city shadows',
        setup: 'overcast sky or open shade for even lighting, or dramatic building shadows creating interesting light patterns',
        effects: [
          'Even, flattering light on subject',
          'Interesting shadow patterns from architecture',
          'Urban contrast and texture',
          'Clean, contemporary lighting feel',
          'No harsh midday sun',
        ],
      },
      camera: {
        model: 'Sony A7 IV or Leica Q2',
        lens: '35mm or 50mm',
        aperture: 'f/2 - f/4',
        depth_of_field: 'moderate - subject sharp, environment provides context',
        color_grading: 'contemporary urban tones, slightly desaturated with selective color, clean and modern, cool undertones',
      },
      quality: {
        realism: 'photorealistic',
        detail_level: 'high - clothing texture and urban details both important',
        look: 'street style blog, fashion brand lookbook, urban lifestyle campaign',
      },
      constraints: [
        'DO NOT alter facial features',
        'DO NOT make it look like fashion week street style photographer bait',
        'Must feel AUTHENTIC to real urban life',
        'NO obviously staged poses',
        'Environment must be believably cool city',
        'NO generic or boring backgrounds',
        'Subject should look like they belong in this environment',
        'Avoid clichéd street style tropes',
      ],
      output_goal: 'Create a stylish urban lifestyle portrait that captures contemporary city cool. The subject should look effortlessly fashionable in an authentically metropolitan setting. Perfect for fashion content, personal branding, or lifestyle brand partnerships.',
    },
  },

  // ============================================
  // Event (이벤트) - 3개
  // ============================================
  {
    key: 'awards-ceremony',
    label: '시상식',
    category: 'event',
    description: '레드카펫, 포토월, 플래시',
    thumbnail: '/images/stagings/awards-ceremony.webp',
    aspectRatio: '3:4',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '3:4',
      resolution: '8K',
      style: 'red carpet portrait, awards ceremony photography, celebrity event aesthetic, glamorous formal',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Event photography captures real moments - the person\'s face must be exactly preserved. Glamour comes from lighting and context, not facial alteration.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'red carpet ready, star quality, celebratory confidence, photogenic presence',
        expression: 'camera-ready smile (genuine, not forced), confident and happy, eyes engaging with camera, enjoying the moment',
        grooming: 'event-ready hair and makeup, polished to perfection, camera-ready but not overdone',
        pose: 'classic red carpet stance - three-quarter angle, one hand on hip or both arms down, shoulders back, chin slightly down, practiced but natural',
      },
      wardrobe: {
        top: 'formal evening wear - for men: perfectly fitted tuxedo with satin lapels, crisp white shirt, black bow tie. For women: elegant gown or sophisticated cocktail dress in jewel tones, black, or metallics',
        accessories: 'statement jewelry (women), elegant watch and cufflinks (men), designer clutch, possibly award/trophy in hand',
        rules: [
          'Black tie appropriate',
          'Impeccable fit is essential',
          'Luxurious fabrics - silk, satin, velvet',
          'Can be bold or classic',
          'Quality should be obvious',
          'NO casual or underdressed looks',
          'Everything should photograph beautifully',
          'Hair and makeup camera-ready',
        ],
      },
      environment: {
        location: 'awards show step-and-repeat or red carpet',
        details: 'sponsor logo wall (logos blurred but recognizable as press wall), red carpet visible beneath, velvet ropes in periphery, other guests blurred in background, professional event setting',
        atmosphere: 'glamorous, exclusive, celebratory, major event energy',
      },
      lighting: {
        technique: 'multi-flash event photography setup',
        setup: 'multiple flashes simulating paparazzi/press pit, beauty dish for key light, even illumination to handle multiple angles',
        effects: [
          'Bright, even illumination',
          'Multiple catch lights in eyes',
          'Subtle flash reflections on satin/silk',
          'Clean shadow fill',
          'Sparkle on jewelry/accessories',
          'Professional event photography look',
        ],
      },
      camera: {
        model: 'Canon EOS R3 or Nikon Z9',
        lens: '70-200mm f/2.8',
        aperture: 'f/4 - f/5.6',
        depth_of_field: 'moderate - full outfit sharp, background soft but recognizable',
        color_grading: 'vibrant and clean, true colors, high clarity, red carpet pop',
      },
      quality: {
        realism: 'photorealistic event photography',
        detail_level: 'ultra - fabric texture, jewelry sparkle, skin detail',
        look: 'Getty Images red carpet, Associated Press celebrity event, magazine event coverage',
      },
      constraints: [
        'DO NOT alter facial features',
        'DO NOT over-retouch to celebrity perfection',
        'Must look like REAL event photography',
        'Flash lighting should be flattering not harsh',
        'NO obviously fake or CGI press wall',
        'Clothing must be appropriately formal',
        'Should look like actual awards show moment',
        'Expression must look genuine not forced',
      ],
      output_goal: 'Create a glamorous red carpet portrait that captures awards ceremony elegance. The subject should look star-quality ready for a major event while maintaining their authentic appearance. Perfect for event recaps, press materials, or celebrating personal milestones.',
    },
  },
  {
    key: 'gala-night',
    label: '갈라 나이트',
    category: 'event',
    description: '정장/드레스, 파티 조명',
    thumbnail: '/images/stagings/gala-night.webp',
    aspectRatio: '3:4',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '3:4',
      resolution: '8K',
      style: 'gala event portrait, sophisticated party photography, elegant evening aesthetic, celebratory luxury',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Gala portraits are often shared professionally - the person must be completely recognizable. Event glamour enhances, it doesn\'t alter.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'gala elegance, sophisticated celebrant, refined party energy',
        expression: 'warm, celebratory, genuine enjoyment, elegant smile, eyes sparkling with event energy',
        grooming: 'formal event-ready, hair elegantly styled, refined makeup',
        pose: 'elegant social pose, holding champagne flute optional, engaged and open body language, sophisticated but approachable',
      },
      wardrobe: {
        top: 'formal evening attire - men: dark suit or tuxedo with creative touches (colored pocket square, interesting shirt). Women: evening gown, elegant cocktail dress, or sophisticated jumpsuit',
        accessories: 'elegant jewelry, quality timepiece, champagne glass as prop, designer clutch',
        rules: [
          'Formal but not stiff',
          'Sophisticated color choices',
          'Quality evident in fabric and fit',
          'Can show personality within formal dress code',
          'Statement piece acceptable',
          'Everything immaculately maintained',
          'Accessories should complement not overwhelm',
        ],
      },
      environment: {
        location: 'upscale gala venue - ballroom, museum, historic mansion',
        details: 'crystal chandeliers visible, elegant floral arrangements, other guests in background (blurred), warm ambient lighting, hints of gold and luxury, possibly large windows with city view',
        atmosphere: 'refined celebration, exclusive gathering, sophisticated social event',
      },
      lighting: {
        technique: 'ambient event lighting with subtle fill',
        setup: 'warm ambient chandeliers and event lighting as base, subtle flash or continuous fill to ensure flattering face illumination',
        effects: [
          'Warm, golden ambient glow',
          'Chandelier sparkle and reflections',
          'Soft, flattering face lighting',
          'Background sparkle and bokeh',
          'Candlelight warmth if present',
          'Glamorous but not harsh',
        ],
      },
      camera: {
        model: 'Sony A7S III (low light specialist)',
        lens: '50mm or 85mm f/1.4',
        aperture: 'f/1.8 - f/2.8',
        depth_of_field: 'shallow - subject sharp, beautiful bokeh from venue lights',
        color_grading: 'warm and rich, golden tones, luxurious color palette, elegant contrast',
      },
      quality: {
        realism: 'photorealistic',
        detail_level: 'high - fabric texture, jewelry sparkle, ambient light quality',
        look: 'charity gala coverage, society page photography, luxury event documentation',
      },
      constraints: [
        'DO NOT alter facial features',
        'DO NOT make venue look fake or CGI',
        'Lighting should be warm but not orange',
        'Must feel like actual gala moment',
        'NO harsh flash washing out ambient mood',
        'Background should feel genuinely luxurious',
        'Expression should feel natural not posed',
        'Champagne optional, never cheesy',
      ],
      output_goal: 'Create an elegant gala portrait capturing sophisticated celebration. The subject should look refined and celebratory in a genuinely luxurious setting while maintaining their authentic appearance. Perfect for event coverage, personal milestones, or professional social documentation.',
    },
  },
  {
    key: 'launch-event',
    label: '런칭 이벤트',
    category: 'event',
    description: '신제품 발표, 무대 조명',
    thumbnail: '/images/stagings/launch-event.webp',
    aspectRatio: '16:9',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '16:9',
      resolution: '4K',
      style: 'product launch event portrait, tech keynote aesthetic, professional presenter, stage presence',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Launch events are professional moments - the person must be 100% recognizable for press and professional use.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'confident presenter, innovative leader, keynote energy, Steve Jobs/Tim Cook vibe',
        expression: 'passionate and engaged, speaking with conviction, genuine enthusiasm, connecting with audience',
        grooming: 'polished professional, stage-ready but not overdone',
        pose: 'FULL BODY standing on stage, explaining gesture with hands open, NO microphone, NO remote control, natural presenting posture',
      },
      wardrobe: {
        top: 'polished casual or smart professional - quality dark sweater, blazer without tie, or clean button-down. Tech CEO aesthetic - premium but approachable',
        bottom: 'dark jeans or trousers, not formal suit pants - MUST be visible as full body shot',
        accessories: 'minimal - quality watch only, NO microphone, NO remote, NO clicker, NO handheld devices',
        rules: [
          'Tech leader aesthetic - polished but not corporate',
          'Dark colors work best on stage',
          'Quality basics over formal suits',
          'NO loud patterns that strobe on camera',
          'Full body must be visible including shoes',
          'Fit must be perfect for stage movement',
        ],
      },
      environment: {
        location: 'large auditorium or keynote venue, FULL BODY wide shot showing entire stage',
        details: 'CRITICAL: Large LED back screen prominently displaying KEY VISUAL/branding graphics. Person standing FULL BODY on stage, audience silhouettes in foreground darkness. Modern minimal stage design. Back screen should show colorful graphics/brand visuals as if presenting a product.',
        atmosphere: 'innovation, excitement, the future being unveiled, tech keynote energy, grand auditorium scale',
      },
      lighting: {
        technique: 'professional stage lighting with environmental context',
        setup: 'strong front key light for presenter visibility, colorful stage lights visible (blue/cyan/purple accents), large screen glow from behind, dramatic contrast between lit stage and dark audience',
        effects: [
          'Clear illumination on presenter from moderate distance',
          'Colorful stage lighting visible in environment',
          'Large screen glow and graphics visible',
          'Dramatic stage atmosphere with visible lighting rigs',
          'Dark audience area creating depth',
        ],
      },
      camera: {
        model: 'Sony FX6 or Canon C70',
        lens: '24-35mm wide angle for environmental context',
        aperture: 'f/4 - f/5.6',
        depth_of_field: 'deep - both presenter and stage environment in focus',
        color_grading: 'clean and modern, slight cool tint, tech-forward color palette, vibrant stage colors',
      },
      quality: {
        realism: 'photorealistic event photography',
        detail_level: 'high - presenter in sharp focus',
        look: 'Apple keynote photography, TED talk, major product launch coverage',
      },
      constraints: [
        'DO NOT alter facial features',
        'Stage setup must look professional and real',
        'Lighting should be dramatic but flattering',
        'NO cheap or amateur event look',
        'Must feel like major launch moment',
        'CRITICAL: FULL BODY shot - show person from head to toe standing on stage',
        'CRITICAL: Large back screen must display KEY VISUAL/colorful graphics',
        'NO microphone, NO remote control, NO clicker in hands',
        'Hands should be in natural explaining/presenting gesture',
        'Stage and large LED screen must be prominently visible',
        'Person should occupy roughly 40-50% of frame height showing full body',
        'NO obviously fake or CGI stage',
      ],
      output_goal: 'Create a FULL BODY launch event portrait in large auditorium. Person standing on stage with explaining hand gestures (NO mic/remote). CRITICAL: Large LED back screen displaying KEY VISUAL/brand graphics prominently visible behind presenter. Wide shot showing entire stage setup. Perfect for press coverage showing the scale of event and brand presentation.',
    },
  },

  // ============================================
  // Studio (스튜디오) - 3개
  // ============================================
  {
    key: 'classic-portrait',
    label: '클래식 포트레이트',
    category: 'studio',
    description: '전통 스튜디오, 무채색 배경',
    thumbnail: '/images/stagings/classic-portrait.webp',
    aspectRatio: '3:4',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '3:4',
      resolution: '8K',
      style: 'classic studio portrait, timeless photography, traditional portraiture, museum-quality',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Classic portraiture celebrates the individual - every facial feature must be preserved exactly. This is fine art portraiture, not beauty retouching.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'timeless, dignified, naturally elegant, classically beautiful',
        expression: 'neutral to slight smile, composed, timeless expression that ages well, engaging eyes',
        grooming: 'clean and polished, natural, nothing trendy that will date',
        pose: 'classic portrait positioning - slight head tilt, shoulders at angle, traditional but not stiff, hands possibly visible and elegantly positioned',
      },
      wardrobe: {
        top: 'simple, elegant, timeless - solid color top in black, navy, burgundy, forest green, or cream. V-neck, crew neck, or subtle collar. Quality fabric with subtle texture',
        accessories: 'minimal to none - small stud earrings, thin chain, wedding ring if relevant. Nothing that dates the image',
        rules: [
          'Solid colors only - no patterns',
          'Timeless pieces that won\'t date',
          'Nothing trendy or of-the-moment',
          'Quality fabric visible but subtle',
          'Color should complement skin tone',
          'NO logos or branding',
          'Classic necklines only',
        ],
      },
      environment: {
        location: 'professional portrait studio',
        details: 'seamless backdrop in neutral gray, charcoal, or mottled traditional portrait background. Completely clean and distraction-free',
        atmosphere: 'timeless, professional, focused entirely on subject',
      },
      lighting: {
        technique: 'classic portrait lighting - loop or Rembrandt',
        setup: 'main light at 30-45 degrees creating gentle shadow under nose, fill light at 1:2 ratio, hair light for separation',
        effects: [
          'Dimensional but flattering',
          'Subtle shadow defining facial structure',
          'Beautiful catch lights in eyes',
          'Clean separation from background',
          'Sculpted but not harsh',
        ],
      },
      camera: {
        model: 'medium format - Hasselblad or Phase One',
        lens: '80-110mm portrait lens',
        aperture: 'f/5.6 - f/8 for optimal sharpness',
        depth_of_field: 'moderate - entire face in sharp focus',
        color_grading: 'neutral, true to life, subtle contrast, timeless tones',
      },
      quality: {
        realism: 'photorealistic fine art',
        detail_level: 'ultra - this is archival quality portraiture',
        look: 'Yousuf Karsh, Annie Leibovitz classic work, museum portrait, legacy photography',
      },
      constraints: [
        'DO NOT alter any facial features',
        'DO NOT over-smooth or beautify',
        'Wrinkles and character lines are beautiful - keep them',
        'NO trendy editing or color grading',
        'Must look timeless, not dated to any era',
        'NO glamour or fashion photography techniques',
        'This is about the person, not the photography',
        'Should age gracefully - still beautiful in 50 years',
        'NO frames, borders, or decorative elements around the image',
        'Full-bleed image only - no picture frames or ornamental borders',
      ],
      output_goal: 'Create a timeless classic portrait that honors the subject\'s authentic appearance. This should be fine art portraiture suitable for professional archives. The image should look beautiful today and in 50 years. Output must be a clean, full-bleed photograph without any frame or border design.',
    },
  },
  {
    key: 'high-key-white',
    label: '하이키 화이트',
    category: 'studio',
    description: '순백 배경, 밝고 깨끗',
    thumbnail: '/images/stagings/high-key-white.webp',
    aspectRatio: '3:4',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '3:4',
      resolution: '4K',
      style: 'high-key studio portrait, pure white background, bright and clean aesthetic, commercial quality',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: High-key lighting is bright but must not wash out or alter facial features. Preserve every detail of the person\'s actual appearance.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'fresh, clean, vibrant, approachable, healthy',
        expression: 'bright, genuine smile, positive energy, open and friendly, eyes alive with warmth',
        grooming: 'fresh and clean, natural, healthy-looking',
        pose: 'open and approachable, straight-on or slight angle, relaxed shoulders, natural hand positioning',
      },
      wardrobe: {
        top: 'clean, simple top - can be white (floating effect), soft pastels, or any color that pops cleanly. Fresh, modern, not busy',
        accessories: 'minimal - small jewelry if any, nothing that competes with pure white background',
        rules: [
          'Clean, simple clothing',
          'Solid colors preferred',
          'White on white can be beautiful',
          'Bright colors pop against white',
          'NO busy patterns',
          'NO dark heavy colors unless intentional',
          'Fresh, approachable aesthetic',
        ],
      },
      environment: {
        location: 'high-key white studio',
        details: 'pure, blown-out white background (255,255,255), seamless white infinity curve, completely clean and shadowless backdrop',
        atmosphere: 'pure, clean, fresh, optimistic, modern',
      },
      lighting: {
        technique: 'high-key lighting setup',
        setup: 'background lit to pure white, large soft key light on subject, fill light for shadowless face, possible hair light',
        effects: [
          'Pure white background with no gray',
          'Even, flattering light on face',
          'Minimal shadows - fresh and clean',
          'Subject "pops" from white',
          'No harsh shadows under chin or nose',
          'Bright, optimistic feeling',
        ],
      },
      camera: {
        model: 'Canon EOS R5 or Sony A7R V',
        lens: '85mm portrait lens',
        aperture: 'f/4 - f/5.6',
        depth_of_field: 'moderate - face sharp, background pure white',
        color_grading: 'clean, bright, true colors, pure whites, subtle vibrance boost',
      },
      quality: {
        realism: 'commercial photorealistic',
        detail_level: 'high - but softened slightly by bright light',
        look: 'Apple-style product shot with person, commercial headshot, corporate website, app interface',
      },
      constraints: [
        'DO NOT alter facial features',
        'DO NOT wash out face with too much light',
        'Background must be PURE white, no gray',
        'Subject must still have dimension',
        'NO fake or unnatural glow',
        'Skin should look healthy, not pale',
        'Must feel natural despite high-key setup',
        'Eyes must have catch lights and life',
        'NO frames, borders, or decorative elements around the image',
        'Full-bleed image only - no picture frames or ornamental borders',
      ],
      output_goal: 'Create a bright, clean high-key portrait with pure white background. The subject should look fresh, approachable, and vibrant while maintaining their authentic appearance. Perfect for corporate headshots, app profiles, commercial work, or modern professional use. Output must be a clean, full-bleed photograph without any frame or border design.',
    },
  },
  {
    key: 'low-key-dramatic',
    label: '로우키 드라마틱',
    category: 'studio',
    description: '어두운 배경, 렘브란트 조명',
    thumbnail: '/images/stagings/low-key-dramatic.webp',
    aspectRatio: '3:4',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '3:4',
      resolution: '8K',
      style: 'low-key dramatic portrait, Rembrandt lighting, fine art photography, cinematic drama',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Dramatic lighting sculpts but must not alter facial structure. Shadows enhance - they don\'t hide or change the person\'s actual face.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'dramatic intensity, mysterious depth, artistic gravitas, powerful presence',
        expression: 'intense, thoughtful, slight mystery, eyes conveying depth - not smiling, serious but not angry',
        grooming: 'can be more dramatic - defined features, possibly wind-touched hair, artistic styling acceptable',
        pose: 'dramatic angle, possibly looking away or partial profile, strong angular positioning, artistic composition',
      },
      wardrobe: {
        top: 'dark, textured clothing - black sweater, dark jacket, simple dark shirt. Fabric texture should catch the light beautifully',
        accessories: 'minimal to none - the drama comes from light and shadow',
        rules: [
          'Dark colors only',
          'Interesting textures that catch light',
          'Simple, not distracting',
          'NO bright colors or patterns',
          'Clothing should recede into shadow',
          'Face is the focus',
        ],
      },
      environment: {
        location: 'low-key studio or dark environment',
        details: 'deep black or very dark gray background, subject emerging from darkness, completely clean of distractions',
        atmosphere: 'dramatic, mysterious, artistic, fine art gallery worthy',
      },
      lighting: {
        technique: 'classic Rembrandt or split lighting',
        setup: 'single strong light source at 45+ degrees, no fill or minimal fill, creating deep shadows on opposite side of face',
        effects: [
          'Triangle of light under eye (Rembrandt triangle)',
          'Deep, sculpting shadows',
          'Dramatic chiaroscuro effect',
          'Subject emerging from darkness',
          'Strong contrast ratio (4:1 or higher)',
          'Catch light in visible eye essential',
        ],
      },
      camera: {
        model: 'Phase One IQ4 or Hasselblad X2D',
        lens: '100mm macro portrait lens for extreme detail',
        aperture: 'f/4 - f/5.6',
        depth_of_field: 'moderate - face sharp, dramatic falloff',
        color_grading: 'rich blacks, subtle warm or cool cast, fine art contrast, deep shadows without crushing',
      },
      quality: {
        realism: 'fine art photorealistic',
        detail_level: 'ultra - visible skin texture, every pore and hair',
        look: 'Rembrandt painting translated to photography, Peter Lindbergh, Irving Penn, museum-quality portrait',
      },
      constraints: [
        'DO NOT alter facial bone structure',
        'DO NOT lose detail in shadows',
        'Shadows must sculpt, not obscure',
        'Eye must have catch light - never dead',
        'Must be DRAMATICALLY lit but still flattering',
        'NO horror or unflattering angles',
        'This is fine art, not shock value',
        'Person must still be recognizable and dignified',
        'NO frames, borders, or decorative elements around the image',
        'Full-bleed image only - no picture frames or ornamental borders',
      ],
      output_goal: 'Create a dramatic low-key portrait worthy of fine art galleries. The lighting should sculpt and dramatize while honoring the subject\'s authentic appearance. Perfect for artistic portfolios, premium personal branding, or fine art collections. Output must be a clean, full-bleed photograph without any frame or border design.',
    },
  },

  // ============================================
  // Creative (크리에이티브) - 3개
  // ============================================
  {
    key: 'neon-cyberpunk',
    label: '네온 사이버펑크',
    category: 'creative',
    description: '네온 조명, 미래적',
    thumbnail: '/images/stagings/neon-cyberpunk.webp',
    aspectRatio: '9:16',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '9:16',
      resolution: '4K',
      style: 'cyberpunk portrait, neon-lit urban futurism, Blade Runner aesthetic, neo-noir',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: Neon lighting dramatically colors the face but must not alter bone structure or features. The person must be 100% recognizable despite dramatic colored lighting.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'cyberpunk protagonist, tech-noir rebel, futuristic urban dweller',
        expression: 'intense, slightly mysterious, cool confidence, slight attitude, penetrating gaze',
        grooming: 'can be edgy - slicked or textured hair, defined features, wet-look acceptable',
        pose: 'dynamic urban pose, slight angle, confident stance, looking at or past camera',
      },
      wardrobe: {
        top: 'tech-wear or cyber-fashion - sleek black jacket, leather, technical fabrics. Possibly with reflective elements or subtle tech details',
        accessories: 'minimal chrome jewelry, possible AR-style glasses frame, nothing too costume-y',
        rules: [
          'Dark base colors - black, deep purple, navy',
          'Reflective or metallic accents work well',
          'Modern, slightly futuristic silhouettes',
          'NOT full costume - this is elevated streetwear',
          'Quality fabrics with interesting textures',
          'NO obvious cosplay elements',
        ],
      },
      environment: {
        location: 'neon-lit urban environment - Tokyo/Seoul/Hong Kong inspired',
        details: 'rain-wet streets reflecting neon, vertical neon signs (can include Korean/Chinese/Japanese characters), steam or atmospheric haze, urban geometry, possibly elevated or alley setting',
        atmosphere: 'electric, futuristic, slightly dangerous, cinematic',
      },
      lighting: {
        technique: 'multi-color neon lighting',
        setup: 'primary colored neon sources (typically magenta/pink and cyan/blue), possible green or purple accents, dramatic color contrast',
        effects: [
          'Colored light spilling across face',
          'Neon rim lights creating separation',
          'Color split across face (pink one side, blue other)',
          'Reflections in wet surfaces',
          'Atmospheric haze catching light',
          'Dramatic but still flattering',
        ],
      },
      camera: {
        model: 'Sony A7S III (low light master)',
        lens: '35mm f/1.4',
        aperture: 'f/1.8 - f/2.2',
        depth_of_field: 'very shallow - neon bokeh circles in background',
        color_grading: 'high contrast, teal-orange split toning, crushed blacks, vibrant neons, cinematic color grade',
      },
      quality: {
        realism: 'cinematic stylized realism',
        detail_level: 'high - neon reflections on skin and surfaces',
        look: 'Blade Runner 2049, Ghost in the Shell, cyberpunk music video, game cinematic',
      },
      constraints: [
        'DO NOT alter facial bone structure',
        'Neon light colors face but doesn\'t CHANGE face',
        'Person must be recognizable despite dramatic lighting',
        'NO full anime/cartoon stylization',
        'Must still look like real photography',
        'Environment should be believable cyberpunk city',
        'NOT cheesy sci-fi - this is grounded futurism',
        'Avoid racist stereotypes in environment design',
      ],
      output_goal: 'Create a striking cyberpunk portrait that places the subject in a neon-soaked futuristic urban environment. The dramatic colored lighting should create visual impact while maintaining the subject\'s authentic appearance. Perfect for social media, album art, gaming content, or creative personal branding.',
    },
  },
  {
    key: 'vintage-film',
    label: '빈티지 필름',
    category: 'creative',
    description: '80-90년대 필름 느낌',
    thumbnail: '/images/stagings/vintage-film.webp',
    aspectRatio: '4:3',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '4:3',
      resolution: '4K',
      style: 'vintage film photography, 80s-90s aesthetic, nostalgic analog, retro portrait',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: The vintage styling is applied to the image aesthetic, NOT to the person\'s face. Their features must be exactly preserved, just with vintage film treatment.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'nostalgic, authentic, captured moment in time, candid vintage',
        expression: 'natural and unstaged, genuine moment, relaxed and authentic, slight smile or thoughtful',
        grooming: 'natural, slightly imperfect, authentic to the person',
        pose: 'candid or casually posed, not overly styled, natural body language',
      },
      wardrobe: {
        top: 'timeless casual or slightly vintage-inspired - could be contemporary clothes that happen to look timeless, or subtle nods to 80s-90s style without costume',
        accessories: 'period-appropriate or timeless - analog watch, simple jewelry',
        rules: [
          'NOT full 80s costume - too obvious',
          'Clothes should feel effortless, not try-hard',
          'Earth tones, muted colors work well',
          'Denim, simple knits, basic tees',
          'Should look like it could be from then OR now',
          'Timeless over trendy',
        ],
      },
      environment: {
        location: 'timeless setting that could exist in any decade',
        details: 'simple indoor or outdoor setting - kitchen, living room, park bench, car interior, beach. Nothing too modern (no smartphones, modern screens)',
        atmosphere: 'nostalgic, warm, intimate, slice of life',
      },
      lighting: {
        technique: 'natural or simple artificial light',
        setup: 'available light aesthetic - window light, ambient room lighting, outdoor natural light. Soft, slightly flat, as film often captured',
        effects: [
          'Soft, slightly desaturated',
          'Warm or cool color cast (film stock dependent)',
          'Lower contrast than modern digital',
          'Slight highlight roll-off',
          'Shadow detail retained',
        ],
      },
      camera: {
        model: 'simulating Contax T2, Canon AE-1, or Nikon FM2',
        lens: '35mm or 50mm standard lens',
        aperture: 'f/2.8 - f/5.6',
        depth_of_field: 'moderate - film-like focus characteristics',
        color_grading: 'film emulation - Kodak Portra, Fuji Superia, or Kodachrome tones. Slightly faded, grain visible, halation on highlights',
      },
      quality: {
        realism: 'analog film realistic',
        detail_level: 'medium - film grain softens detail naturally',
        look: 'found photo from the 80s-90s, vintage family album, Nan Goldin, film photography era',
      },
      constraints: [
        'DO NOT alter facial features',
        'Film effects applied to IMAGE not FACE',
        'Must look like actual film photo, not filter',
        'Grain should be natural film grain, not digital noise',
        'NO modern elements visible in scene',
        'Color treatment must be believable for era',
        'Should feel nostalgic, not costume party',
        'Person looks real, photographed authentically',
      ],
      output_goal: 'Create a nostalgic vintage film portrait that feels like a discovered treasure from the 80s-90s. The film aesthetic should evoke memories and emotions while maintaining the subject\'s authentic appearance. Perfect for artistic personal branding, nostalgia-driven content, or retro aesthetic enthusiasts.',
    },
  },
  {
    key: 'pop-art',
    label: '팝아트',
    category: 'creative',
    description: '앤디워홀 스타일, 강렬',
    thumbnail: '/images/stagings/pop-art.webp',
    aspectRatio: '1:1',
    promptConfig: {
      type: 'portrait_staging_prompt',
      aspect_ratio: '1:1',
      resolution: '4K',
      style: 'pop art portrait, Andy Warhol inspired, bold graphic treatment, contemporary pop art',
      identity_preservation: {
        use_reference_image: true,
        strict_identity_lock: true,
        alter_face: false,
        alter_hairstyle: false,
        alter_expression: false,
        notes: 'CRITICAL: This is pop art TREATMENT of a real face - the underlying facial structure and features MUST be exactly preserved. Bold colors overlay the real face, they don\'t replace it.',
      },
      subject: {
        gender: 'preserve_original',
        aesthetic: 'iconic, bold, instantly recognizable, celebrity treatment',
        expression: 'direct, engaging, iconic pose - the kind of expression that becomes instantly memorable',
        grooming: 'clean and defined, features that translate well to high-contrast treatment',
        pose: 'straight-on or classic three-quarter, iconic and memorable, Warhol Marilyn-style directness',
      },
      wardrobe: {
        top: 'simple, solid colors work best - or let the pop art treatment define the colors. Nothing busy that competes with the style',
        accessories: 'bold if any - statement earrings, strong lip color (will be graphically enhanced)',
        rules: [
          'Simple is better - pop art adds visual complexity',
          'Solid colors become bold graphic elements',
          'Neckline should be clean and simple',
          'NO busy patterns - they\'ll fight the treatment',
          'Think iconic silhouette',
        ],
      },
      environment: {
        location: 'studio or graphic background',
        details: 'can be single bold color, or Ben-Day dots pattern, or simple graphic elements. Background becomes part of the pop art composition',
        atmosphere: 'bold, graphic, museum-worthy, instantly striking',
      },
      lighting: {
        technique: 'flat, even lighting that translates to graphic treatment',
        setup: 'even front lighting minimizing shadows, creating clean areas of tone for pop art conversion',
        effects: [
          'Even illumination',
          'Minimal shadows for graphic clarity',
          'Clean separation of tonal areas',
          'Features clearly defined',
          'High contrast potential',
        ],
      },
      camera: {
        model: 'standard digital',
        lens: '85mm for clean portrait',
        aperture: 'f/5.6 - f/8 for even focus',
        depth_of_field: 'moderate to deep - everything in focus',
        color_grading: 'BOLD - highly saturated, non-realistic colors, graphic color treatment. Magentas, cyans, yellows, electric colors',
      },
      quality: {
        realism: 'stylized graphic realism',
        detail_level: 'medium-high - detail simplified for graphic impact',
        look: 'Andy Warhol Marilyn series, Roy Lichtenstein, contemporary pop art, gallery print',
      },
      constraints: [
        'DO NOT change facial STRUCTURE - only colors and contrast',
        'Face must be clearly recognizable under the treatment',
        'Pop art style enhances, doesn\'t disguise',
        'Should still read as THIS specific person',
        'NOT cartoon or caricature',
        'Colors are bold but face is real',
        'Could hang in a museum as pop art portrait',
        'Person would recognize themselves immediately',
      ],
      output_goal: 'Create a bold pop art portrait in the style of Andy Warhol. The treatment should be graphic and striking while maintaining the subject\'s recognizable identity underneath. Perfect for creative personal branding, art prints, social media impact, or contemporary art enthusiasts.',
    },
  },
];

// 헬퍼 함수: 카테고리별 프리셋 가져오기
export const getPresetsByCategory = (category: StagingCategoryKey): StagingPreset[] => {
  return STAGING_PRESETS.filter(preset => preset.category === category);
};

// 헬퍼 함수: 프리셋 키로 프리셋 가져오기
export const getPresetByKey = (key: string): StagingPreset | undefined => {
  return STAGING_PRESETS.find(preset => preset.key === key);
};

// 헬퍼 함수: 프롬프트 생성
export const generateStagingPrompt = (preset: StagingPreset): string => {
  const { promptConfig } = preset;

  const sections = [
    `Style: ${promptConfig.style}`,
    `Resolution: ${promptConfig.resolution}`,
    '',
    `Subject: ${promptConfig.subject.aesthetic}. Expression: ${promptConfig.subject.expression}. Pose: ${promptConfig.subject.pose}.`,
    '',
    `Wardrobe: ${promptConfig.wardrobe.top}. ${promptConfig.wardrobe.accessories ? `Accessories: ${promptConfig.wardrobe.accessories}.` : ''}`,
    '',
    `Environment: ${promptConfig.environment.location}. ${promptConfig.environment.details}. Atmosphere: ${promptConfig.environment.atmosphere}.`,
    '',
    `Lighting: ${promptConfig.lighting.technique}. ${promptConfig.lighting.setup}.`,
    '',
    `Camera: ${promptConfig.camera.lens}, ${promptConfig.camera.aperture}. ${promptConfig.camera.depth_of_field}. Color grading: ${promptConfig.camera.color_grading}.`,
    '',
    `Quality: ${promptConfig.quality.realism}. ${promptConfig.quality.detail_level}. Look: ${promptConfig.quality.look}.`,
    '',
    `CRITICAL IDENTITY PRESERVATION: ${promptConfig.identity_preservation.notes}`,
    '',
    `Constraints: ${promptConfig.constraints.join('. ')}.`,
    '',
    `Output Goal: ${promptConfig.output_goal}`,
  ];

  return sections.join('\n');
};
