function addNodeArray(members, result, type) {
  for (let i = 0; i < members.length; i += 1) {
    const child = { fragment: '' };
    readObj(members[i], child);
    const fragment = `
<${type}>
  ${child.fragment}
</${type}>\n`.trimStart();
    result.fragment += fragment;
  }
}

function addFeatureIdArray(members, result) {
  for (let i = 0; i < members.length; i += 1) {
    const child = { fragment: '' };
    const fragment = `
<ogc:FeatureId fid='${members[i]}' />\n`.trimStart();
    result.fragment += fragment;
  }
}

function addFilterArray(members, result, type) {
  const child = { fragment: '' };
  for (let i = 0; i < members.length; i += 1) {
    readObj(members[i], child);
  }
  const fragment = `
<${type}>
  ${child.fragment}
</${type}>\n`.trimStart();
  result.fragment += fragment;
}

/**
 * addNode
 *
 * @param obj
 * @param result
 * @param type
 * @param attributes Optional
 * @returns {undefined}
 */

function addNode(obj, result, type, sequence, attributes) {
  const attributesText = stringifyAttributes(attributes); 
  const child = { fragment: '' };
  readObj(obj, child, sequence);
  const fragment = `
<${type}${attributesText}>
  ${child.fragment}
</${type}>\n`.trimStart();
  result.fragment += fragment;
}

function stringifyAttributes(attributes) {
  let attributeText = '';
  if (attributes && typeof attributes == 'object' && !Array.isArray(attributes)) {
    Object.keys(attributes).forEach(key => {
      attributeText = attributeText += ` ${key}='${attributes[key]}'`;
    });
  }
  return attributeText;
}

function addParameterNode(members, result, type) {
  const myObj = {};

  Object.keys(members).forEach(key => {
    parameter(key, members[key], result, type);
  });
}

function parameter(key, value, result, type) {
  const fragment = `
<sld:${type}Parameter name='${camelCaseToDash(key)}'>
    <ogc:Literal>${value}</ogc:Literal>
</sld:${type}Parameter>\n`.trimStart();
  result.fragment += fragment;
}

function addNodeProperty(value, result, type) {
  const fragment = `
<${type}>${value}</${type}>\n`.trimStart();
  result.fragment = fragment + result.fragment;
}

function addEmptyNode(result, type, attributes) {
  const attributesText = stringifyAttributes(attributes); 
  const fragment = `
<${type}${attributesText}/>\n`.trimStart();
  result.fragment += fragment;
}

/**
 * camelCaseToDash
 *
 * @param str
 * @returns {undefined}
 */
function camelCaseToDash(str) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([0-9])([^0-9])/g, '$1-$2')
    .replace(/([^0-9])([0-9])/g, '$1-$2')
    .replace(/-+/g, '-')
    .toLowerCase();
}

const FilterBuilders = {
  abstract: (value, result) => {
    addNodeProperty(value, result, 'sld:Abstract');
  },
  default: (value, result) => {
    if (value) addNodeProperty(1, result, 'sld:IsDefault');
  },
  elsefilter: (value, result) => {
    addEmptyNode(result, 'sld:ElseFilter');
  },
  size: (obj, result) => {
    addNodeProperty(obj, result, 'sld:Size');
  },
  wellknownname: (obj, result) => {
    addNodeProperty(obj, result, 'sld:WellKnownName');
  },
  version: ignore,
  filter: (obj, result) => {
    addNode(obj, result, 'ogc:Filter');
  },
  not: (obj, result) => {
    addNode(obj, result, 'ogc:Not');
  },
  and: (obj, result) => {
    addFilterArray(obj, result, 'ogc:And');
  },
  or: (obj, result) => {
    addFilterArray(obj, result, 'ogc:Or');
  },
  propertyisequalto: (obj, result) => {
    addNode(obj, result, 'ogc:PropertyIsEqualTo');
  },
  propertyisnotequalto: (obj, result) => {
    addNode(obj, result, 'ogc:PropertyIsNotEqualTo');
  },
  propertyislessthan: (obj, result) => {
    addNode(obj, result, 'ogc:PropertyIsLessThan');
  },
  propertyislessthanorequalto: (obj, result) => {
    addNode(obj, result, 'ogc:PropertyIsLessThanOrEqualTo');
  },
  propertyisgreaterthan: (obj, result) => {
    addNode(obj, result, 'ogc:PropertyIsGreaterThan');
  },
  propertyisgreaterthanorequalto: (obj, result) => {
    addNode(obj, result, 'ogc:PropertyIsGreaterThanOrEqualTo');
  },
  propertyisbetween: (obj, result) => {
    addNode(obj, result, 'ogc:PropertyIsBetween');
  },
  propertyislike: (obj, result) => {
    const attributes = { 'escape': obj.escapechar, 'singleChar': obj.singlechar, 'wildCard': obj.wildcard };
    delete obj.escapechar; 
    delete obj.singlechar;
    delete obj.wildcard;
    addNode(obj, result, 'ogc:PropertyIsLike', ['propertyname', 'literal'], attributes);
  },
  propertyname: (obj, result) => {
    addNodeProperty(obj, result, 'ogc:PropertyName');
  },
  literal: (obj, result) => {
    addNodeProperty(obj, result, 'ogc:Literal');
  },
  fids: (members, result) => {
    addFeatureIdArray(members, result, 'ogc:FeatureId');
  },
  lowerboundary: (obj, result) => {
    addNodeProperty(obj, result, 'ogc:LowerBoundary');
  },
  upperboundary: (obj, result) => {
    addNodeProperty(obj, result, 'ogc:UpperBoundary');
  },
  type: ignore,
}

const SymbBuilders =  {
  polygonsymbolizer: (obj, result) => {
    addNode(obj, result, 'sld:PolygonSymbolizer');
  },
  linesymbolizer: (obj, result) => {
    addNode(obj, result, 'sld:LineSymbolizer');
  },
  pointsymbolizer: (obj, result) => {
    addNode(obj, result, 'sld:PointSymbolizer');
  },
  textsymbolizer: (obj, result) => {
    addNode(obj, result, 'sld:TextSymbolizer');
  },
  fill: (obj, result) => {
    addNode(obj, result, 'sld:Fill');
  },
  stroke: (obj, result) => {
    addNode(obj, result, 'sld:Stroke');
  },
  graphic: (obj, result) => {
    addNode(obj, result, 'sld:Graphic');
  },
  externalgraphic: (obj, result) => {
    addNode(obj, result, 'sld:ExternalGraphic');
  },
  mark: (obj, result) => {
    addNode(obj, result, 'sld:Mark');
  },
  label: (value, result) => {
    addNodeProperty(value, result, 'sld:Label');
  },
  halo: (obj, result) => {
    addNode(obj, result, 'sld:Halo');
  },
  font: (obj, result) => {
    addNode(obj, result, 'sld:Font');
  },
  radius: (value, result) => {
    addNodeProperty(value, result, 'sld:Value');
  },
  labelplacement: (obj, result) => {
    addNode(obj, result, 'sld:LabelPlacement');
  },
  pointplacement: (obj, result) => {
    addNode(obj, result, 'sld:PointPlacement');
  },
  lineplacement: (obj, result) => {
    addNode(obj, result, 'sld:LinePlacement');
  },
  perpendicularoffset: (value, result) => {
    addNodeProperty(value, result, 'sld:PerpendicularOffset');
  },
  anchorpoint: (obj, result) => {
    addNode(obj, result, 'sld:AnchorPoint');
  },
  anchorpointx: (value, result) => {
    addNodeProperty(value, result, 'sld:AnchorPointX');
  },
  anchorpointy: (value, result) => {
    addNodeProperty(value, result, 'sld:AnchorPointY');
  },
  rotation: (value, result) => {
    addNodeProperty(value, result, 'sld:Rotation');
  },
  displacement: (obj, result) => {
    addNode(obj, result, 'sld:Displacement');
  },
  displacementx: (value, result) => {
    addNodeProperty(value, result, 'sld:DisplacementX');
  },
  displacementy: (value, result) => {
    addNodeProperty(value, result, 'sld:DisplacementY');
  },
  size: (value, result) => {
    addNodeProperty(value, result, 'sld:Size');
  },
  wellknownname: (value, result) => {
    addNodeProperty(value, result, 'sld:WellKnownName');
  },
  // vendoroptions: (members, result) => {
  //  NOT YET
  // }
  onlineresource: (obj, result) => {
    //function addEmptyNode(result, type, attributes) {
    const attributes = {
      'xlink:href': obj
    }
    addEmptyNode(result, 'sld:OnlineResource', attributes);
  },
  css: (members, result) => {
    addParameterNode(members, result, 'Css');
  },
  svg: (members, result) => {
    addParameterNode(members, result, 'Svg');
  },
}

const builders = Object.assign(
  {
    layers: (members, result) => {
      addNodeArray(members, result, 'sld:NamedLayer');
    },
    styles: (members, result) => {
      addNodeArray(members, result, 'sld:UserStyle');
    },
    featuretypestyles: (members, result) => {
      addNodeArray(members, result, 'sld:FeatureTypeStyle');
    },
    rules: (members, result) => {
      addNodeArray(members, result, 'sld:Rule');
    },
    name: (value, result) => {
      addNodeProperty(value, result, 'sld:Name');
    },
    maxscaledenominator: (value, result) => {
      addNodeProperty(value, result, 'sld:MaxScaleDenominator');
    },
    minscaledenominator: (value, result) => {
      addNodeProperty(value, result, 'sld:MinScaleDenominator');
    },
  },
  FilterBuilders,
  SymbBuilders,
);

function ignore() {
  // do nonthing
}

function isFilter(obj) {
  const filterTypes = ['comparison', 'not', 'or', 'and'];
  return (obj.type && filterTypes.includes(obj.type));
}

// Filters follow a different pattern, the sld type is a property rather than the name so we need to remap them.
function readFilter(obj, result) {
  const type = obj.type;
  if (type == 'comparison') {
    const operator = obj.operator;
    delete obj.type;
    delete obj.operator;
    builders[operator](obj, result);
  } else if (type == 'not') {
    builders[type](obj.predicate, result);
  } else if (type == 'and' || type == 'or') {
    builders[type](obj.predicates, result);
  } else {
    throw new Error(`Filter type: ${type} is not recognised and no builder is available.`);
  }
}

function readObj(obj, result, sequence) {
  if (isFilter(obj)) {
    readFilter(obj, result);
  } else {
    Object.keys(obj).forEach(key => {
      try {
        builders[key](obj[key], result);
      } catch (e) {
        throw new Error(`Key: ${key}. ${e.message}`);
      }
    });
  }
}

function prettifyXml(sourceXml) {
  const xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
  const xslt = `
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output omit-xml-declaration="no" method="xml" indent="yes"/>
  <xsl:strip-space elements="*"/>
  <xsl:template match="/">
    <xsl:copy-of select="."/>
  </xsl:template>
</xsl:stylesheet>
`.trim();
  const xsltDoc = new DOMParser().parseFromString(xslt, 'application/xml');
  const xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsltDoc);
  const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  const resultXml = new XMLSerializer().serializeToString(resultDoc);
  return resultXml;
}

export default function Builder(obj) {
  const version = obj.version || '1.0.0';
  const result = { fragment: '' };
  readObj(obj, result);

  const fragment = `<sld:StyledLayerDescriptor version="${version}"
                        xmlns:sld="http://www.opengis.net/sld"
                        xmlns:ogc="http://www.opengis.net/ogc"
                        xmlns:gml="http://www.opengis.net/gml"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/${version}/StyledLayerDescriptor.xsd">
                        ${result.fragment}
                    </sld:StyledLayerDescriptor>`;

  // Strip the empty white lines - speed vs readablity trade off
  const prettyXml = prettifyXml(fragment);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${prettyXml}`;
}
