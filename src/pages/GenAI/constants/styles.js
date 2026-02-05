/**
 * ImageGenPage 스타일 상수
 * 이미지 생성 스타일 프리셋
 */
import {
    StyleAutoIcon,
    StylePhotoIcon,
    StyleVectorIcon,
    StyleOilIcon,
    StyleWatercolorIcon,
    Style3DIcon,
} from '../../../components/common/Icons';

// 스타일 프리셋 옵션
export const STYLE_PRESETS = [
    { key: 'auto', label: 'Auto', Icon: StyleAutoIcon, desc: 'AI가 자동 판단' },
    { key: 'photo', label: '사진', Icon: StylePhotoIcon, desc: '실사 포토' },
    { key: 'illustration', label: '벡터', Icon: StyleVectorIcon, desc: '디지털 아트' },
    { key: 'oil', label: '유화', Icon: StyleOilIcon, desc: '클래식 유화풍' },
    { key: 'watercolor', label: '수채화', Icon: StyleWatercolorIcon, desc: '수채화 스타일' },
    { key: '3d', label: '3D', Icon: Style3DIcon, desc: '3D 렌더링' },
];
