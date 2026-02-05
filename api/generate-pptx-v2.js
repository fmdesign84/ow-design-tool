/**
 * PPTX Engine API - OOXML 직접 조작 기반 PPT 생성
 *
 * POST /api/generate-pptx-v2
 *
 * Body:
 * {
 *   "template": {
 *     "background": { "color": "FFFFFF" },
 *     "elements": [...]
 *   },
 *   "filename": "output.pptx"
 * }
 */

const JSZip = require('jszip');

// 단위 변환
const EMU_PER_INCH = 914400;
const EMU_PER_PT = 12700;

const units = {
  inch: (v) => Math.round(v * EMU_PER_INCH),
  pt: (v) => Math.round(v * EMU_PER_PT),
  px: (v) => Math.round(v * EMU_PER_INCH / 96),
  fontSize: (v) => Math.round(v * 100),
  lineSpacing: (v) => Math.round(v * 100),
  charSpacing: (v) => Math.round(v * 100),
  percent: (v) => Math.round(v * 1000),
};

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createTextElement(el, id) {
  const x = units.inch(el.x);
  const y = units.inch(el.y);
  const w = units.inch(el.width);
  const h = units.inch(el.height);
  const fontSize = units.fontSize(el.fontSize || 12);
  const color = el.color || '000000';
  const fontFamily = el.fontFamily || 'Pretendard';
  const bold = el.bold ? ' b="1"' : '';
  const italic = el.italic ? ' i="1"' : '';
  const align = el.align || 'l';
  const valign = el.valign || 't';
  const rotation = el.rotation ? ` rot="${Math.round(el.rotation * 60000)}"` : '';

  let lineSpacingXml = '';
  if (el.lineSpacing) {
    if (el.lineSpacingType === 'percent') {
      lineSpacingXml = `<a:lnSpc><a:spcPct val="${units.percent(el.lineSpacing)}"/></a:lnSpc>`;
    } else {
      lineSpacingXml = `<a:lnSpc><a:spcPts val="${units.lineSpacing(el.lineSpacing)}"/></a:lnSpc>`;
    }
  }

  const charSpacing = el.charSpacing ? ` spc="${units.charSpacing(el.charSpacing)}"` : '';

  let spacingXml = '';
  if (el.spaceBefore) {
    spacingXml += `<a:spcBef><a:spcPts val="${units.lineSpacing(el.spaceBefore)}"/></a:spcBef>`;
  }
  if (el.spaceAfter) {
    spacingXml += `<a:spcAft><a:spcPts val="${units.lineSpacing(el.spaceAfter)}"/></a:spcAft>`;
  }

  const lines = (el.text || '').split('\n');
  const paragraphs = lines.map(line => `
    <a:p>
      <a:pPr algn="${align}">${lineSpacingXml}${spacingXml}<a:buNone/></a:pPr>
      <a:r>
        <a:rPr lang="ko-KR" sz="${fontSize}"${bold}${italic}${charSpacing}>
          <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
          <a:latin typeface="${fontFamily}" pitchFamily="34" charset="0"/>
          <a:ea typeface="${fontFamily}" pitchFamily="34" charset="-122"/>
          <a:cs typeface="${fontFamily}" pitchFamily="34" charset="-120"/>
        </a:rPr>
        <a:t>${escapeXml(line)}</a:t>
      </a:r>
    </a:p>
  `).join('');

  return `
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="${id}" name="Text ${id}"/>
        <p:cNvSpPr/><p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm${rotation}>
          <a:off x="${x}" y="${y}"/>
          <a:ext cx="${w}" cy="${h}"/>
        </a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        <a:noFill/>
      </p:spPr>
      <p:txBody>
        <a:bodyPr wrap="square" rtlCol="0" anchor="${valign}"/>
        <a:lstStyle/>
        ${paragraphs}
      </p:txBody>
    </p:sp>
  `;
}

function createShapeElement(el, id) {
  const x = units.inch(el.x);
  const y = units.inch(el.y);
  const w = units.inch(el.width);
  const h = units.inch(el.height);
  const fill = el.fill || 'FFFFFF';
  const fillOpacity = el.fillOpacity !== undefined ? el.fillOpacity : 1;
  const stroke = el.stroke;
  const strokeWidth = el.strokeWidth ? Math.round(el.strokeWidth * EMU_PER_PT) : 12700;
  const borderRadius = el.borderRadius || 0;

  const shapeType = borderRadius > 0 ? 'roundRect' : 'rect';
  const radiusAdj = borderRadius > 0
    ? `<a:gd name="adj" fmla="val ${Math.round(borderRadius * 1000)}"/>`
    : '';

  const fillXml = fillOpacity > 0
    ? `<a:solidFill><a:srgbClr val="${fill}"><a:alpha val="${Math.round(fillOpacity * 100000)}"/></a:srgbClr></a:solidFill>`
    : '<a:noFill/>';

  const lineXml = stroke
    ? `<a:ln w="${strokeWidth}"><a:solidFill><a:srgbClr val="${stroke}"/></a:solidFill></a:ln>`
    : '';

  let shadowXml = '';
  if (el.shadow) {
    const s = el.shadow;
    shadowXml = `
      <a:effectLst>
        <a:outerShdw blurRad="${units.pt(s.blur || 4)}" dist="${units.pt(s.offsetY || 2)}" dir="5400000" algn="bl">
          <a:srgbClr val="${s.color || '000000'}">
            <a:alpha val="${Math.round((s.opacity || 0.2) * 100000)}"/>
          </a:srgbClr>
        </a:outerShdw>
      </a:effectLst>
    `;
  }

  return `
    <p:sp>
      <p:nvSpPr>
        <p:cNvPr id="${id}" name="Shape ${id}"/>
        <p:cNvSpPr/><p:nvPr/>
      </p:nvSpPr>
      <p:spPr>
        <a:xfrm>
          <a:off x="${x}" y="${y}"/>
          <a:ext cx="${w}" cy="${h}"/>
        </a:xfrm>
        <a:prstGeom prst="${shapeType}"><a:avLst>${radiusAdj}</a:avLst></a:prstGeom>
        ${fillXml}
        ${lineXml}
        ${shadowXml}
      </p:spPr>
    </p:sp>
  `;
}

function createImageElement(el, id, rId) {
  const x = units.inch(el.x);
  const y = units.inch(el.y);
  const w = units.inch(el.width);
  const h = units.inch(el.height);
  const opacity = el.opacity !== undefined ? el.opacity : 1;

  const alphaXml = opacity < 1
    ? `<a:alphaModFix amt="${Math.round(opacity * 100000)}"/>`
    : '';

  return `
    <p:pic>
      <p:nvPicPr>
        <p:cNvPr id="${id}" name="Image ${id}"/>
        <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
        <p:nvPr/>
      </p:nvPicPr>
      <p:blipFill>
        <a:blip r:embed="${rId}">${alphaXml}</a:blip>
        <a:stretch><a:fillRect/></a:stretch>
      </p:blipFill>
      <p:spPr>
        <a:xfrm>
          <a:off x="${x}" y="${y}"/>
          <a:ext cx="${w}" cy="${h}"/>
        </a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      </p:spPr>
    </p:pic>
  `;
}

function createSlideXml(slide, imageRels) {
  const bgColor = slide.background?.color || 'FFFFFF';

  let elementsXml = '';
  let id = 2;

  for (const el of slide.elements || []) {
    if (el.type === 'text') {
      elementsXml += createTextElement(el, id++);
    } else if (el.type === 'shape') {
      elementsXml += createShapeElement(el, id++);
    } else if (el.type === 'image') {
      const rId = imageRels[el.imageId] || 'rId1';
      elementsXml += createImageElement(el, id++, rId);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="${bgColor}"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/><p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/><a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      ${elementsXml}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

async function createBasePptx() {
  const zip = new JSZip();

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

  zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`);

  zip.file('ppt/_rels/presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
</Relationships>`);

  zip.file('ppt/slides/_rels/slide1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);

  zip.file('ppt/slideLayouts/slideLayout1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sldLayout>`);

  zip.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`);

  zip.file('ppt/slideMasters/slideMaster1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:bg><p:bgRef idx="1001"><a:schemeClr val="bg1"/></p:bgRef></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`);

  zip.file('ppt/slideMasters/_rels/slideMaster1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`);

  zip.file('ppt/theme/theme1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="Office">
      <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="44546A"/></a:dk2>
      <a:lt2><a:srgbClr val="E7E6E6"/></a:lt2>
      <a:accent1><a:srgbClr val="4472C4"/></a:accent1>
      <a:accent2><a:srgbClr val="ED7D31"/></a:accent2>
      <a:accent3><a:srgbClr val="A5A5A5"/></a:accent3>
      <a:accent4><a:srgbClr val="FFC000"/></a:accent4>
      <a:accent5><a:srgbClr val="5B9BD5"/></a:accent5>
      <a:accent6><a:srgbClr val="70AD47"/></a:accent6>
      <a:hlink><a:srgbClr val="0563C1"/></a:hlink>
      <a:folHlink><a:srgbClr val="954F72"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont><a:latin typeface="Calibri Light"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
      <a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`);

  return zip;
}

async function generatePptx(template) {
  const zip = await createBasePptx();
  const slideXml = createSlideXml(template, {});
  zip.file('ppt/slides/slide1.xml', slideXml);

  return await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
}

// Vercel Serverless Handler
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { template, filename = 'presentation.pptx' } = req.body;

    if (!template) {
      return res.status(400).json({ error: 'template is required' });
    }

    const pptxBuffer = await generatePptx(template);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pptxBuffer.length);

    return res.send(pptxBuffer);

  } catch (error) {
    console.error('PPTX Generation Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
