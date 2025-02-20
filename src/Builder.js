/*
 * TODO:
 *    - Add support for GraphicFill
 *    - Add support for GraphicStroke
 *    - Add support for Raster Symbolizers
 *    ...
 */

let version;
const SLD11 = ['StyledLayerDescriptor', 'NameLayer', 'UserLayer', 'Value', 'UserStyle', 'IsDefault'];

const FilterBuilders = {
  abstract: (value, result) => {
    addNodeProperty(value, result, ns('Abstract'));
  },
  default: (value, result) => {
    if (value) addNodeProperty(1, result, ns('IsDefault'));
  },
  elsefilter: (value, result) => {
    addEmptyNode(result, ns('ElseFilter'));
  },
  size: (obj, result) => {
    addNodeProperty(obj, result, ns('Size'));
  },
  wellknownname: (obj, result) => {
    addNodeProperty(obj, result, ns('WellKnownName'));
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
    const attributes = { escape: obj.escapechar, singleChar: obj.singlechar, wildCard: obj.wildcard };
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
    addNodePropertyLiteral(obj, result, 'ogc:LowerBoundary');
  },
  upperboundary: (obj, result) => {
    addNodePropertyLiteral(obj, result, 'ogc:UpperBoundary');
  },
  type: ignore,
};

const SymbBuilders = {
  polygonsymbolizer: (obj, result) => {
    addNode(obj, result, ns('PolygonSymbolizer'), ['geometry', 'fill', 'stroke']);
  },
  linesymbolizer: (obj, result) => {
    addNode(obj, result, ns('LineSymbolizer'), ['geometry', 'stroke']);
  },
  pointsymbolizer: (obj, result) => {
    addNode(obj, result, ns('PointSymbolizer'), ['geometry', 'graphic']);
  },
  textsymbolizer: (obj, result) => {
    addNode(obj, result, ns('TextSymbolizer'), ['geometry', 'label', 'font', 'labelplacement', 'halo', 'fill']);
  },
  fill: (obj, result) => {
    addNode(obj, result, ns('Fill'));
  },
  stroke: (obj, result) => {
    addNode(obj, result, ns('Stroke'));
  },
  graphic: (obj, result) => {
    addNode(obj, result, ns('Graphic'), ['externalgraphic', 'mark', 'size']);
  },
  externalgraphic: (obj, result) => {
    // Add format as Reader stripped it and it's required by SLD
    obj.format = fileNameToMimeType(obj.onlineresource);
    addNode(obj, result, ns('ExternalGraphic'), ['onlineresource', 'format']);
  },
  mark: (obj, result) => {
    addNode(obj, result, ns('Mark'), ['wellknownname', 'fill', 'stroke']);
  },
  label: (value, result) => {
    addNodeProperty(value, result, ns('Label'));
  },
  halo: (obj, result) => {
    addNode(obj, result, ns('Halo'), ['radius', 'fill']);
  },
  font: (obj, result) => {
    addNode(obj, result, ns('Font'));
  },
  radius: (value, result) => {
    addNodeProperty(value, result, ns('Value'));
  },
  labelplacement: (obj, result) => {
    addNode(obj, result, ns('LabelPlacement'), ['pointplacement', 'lineplacement']);
  },
  pointplacement: (obj, result) => {
    addNode(obj, result, ns('PointPlacement'), ['anchorpoint', 'displacement', 'rotation']);
  },
  lineplacement: (obj, result) => {
    addNode(obj, result, ns('LinePlacement'), ['perpendicularoffset']);
  },
  perpendicularoffset: (value, result) => {
    addNodeProperty(value, result, ns('PerpendicularOffset'));
  },
  anchorpoint: (obj, result) => {
    addNode(obj, result, ns('AnchorPoint'), ['anchorpointx', 'anchorpointy']);
  },
  anchorpointx: (value, result) => {
    addNodeProperty(value, result, ns('AnchorPointX'));
  },
  anchorpointy: (value, result) => {
    addNodeProperty(value, result, ns('AnchorPointY'));
  },
  rotation: (value, result) => {
    addNodeProperty(value, result, ns('Rotation'));
  },
  displacement: (obj, result) => {
    addNode(obj, result, ns('Displacement'), ['displacementx', 'displacementy']);
  },
  displacementx: (value, result) => {
    addNodeProperty(value, result, ns('DisplacementX'));
  },
  displacementy: (value, result) => {
    addNodeProperty(value, result, ns('DisplacementY'));
  },
  size: (value, result) => {
    addNodeProperty(value, result, ns('Size'));
  },
  wellknownname: (value, result) => {
    addNodeProperty(value, result, ns('WellKnownName'));
  },
  // vendoroptions: (members, result) => {
  //  NOT YET
  // }
  onlineresource: (obj, result) => {
    const attributes = {
      'xlink:href': obj,
    };
    addEmptyNode(result, ns('OnlineResource'), attributes);
  },
  format: (obj, result) => {
    addNodeProperty(obj, result, ns('Format'));
  },
  styling: (members, result) => {
    let nodeName;
    if (version == '1.0.0') {
      nodeName = 'Css';
    } else {
      nodeName = 'Svg';
    }
    addParameterNode(members, result, ns(nodeName));
  },
  //css: (members, result) => {
    //addParameterNode(members, result, ns('Css'));
  //},
  //svg: (members, result) => {
    //addParameterNode(members, result, ns('Svg'));
  //},
};

const builders = Object.assign(
  {
    layers: (members, result) => {
      addNodeArray(members, result, ns('NamedLayer'), ['name', 'styles']);
    },
    styles: (members, result) => {
      addNodeArray(members, result, ns('UserStyle'), ['name', 'abstact', 'default', 'featuretypestyles']);
    },
    featuretypestyles: (members, result) => {
      addNodeArray(members, result, ns('FeatureTypeStyle'), ['name', 'rules']);
    },
    rules: (members, result) => {
      addNodeArray(
        members,
        result,
        ns('Rule'),
        [
          'name',
          'filter',
          'elsefilter',
          'minscaledenominator',
          'maxscaledenominator',
          'symbolizers']
      );
    },
    symbolizers: (members, result) => {
      for (let i = 0; i < members.length; i += 1) {
        const symbolizer = members[i];
        const type = Object.keys(symbolizer)[0];
        builders[type](members[i][type], result);
      }
    },
    name: (value, result) => {
      addNodeProperty(value, result, ns('Name'));
    },
    maxscaledenominator: (value, result) => {
      addNodeProperty(value, result, ns('MaxScaleDenominator'));
    },
    minscaledenominator: (value, result) => {
      addNodeProperty(value, result, ns('MinScaleDenominator'));
    },
  },
  FilterBuilders,
  SymbBuilders
);

function addNodeArray(members, result, type, sequence) {
  for (let i = 0; i < members.length; i += 1) {
    const child = { fragment: '' };
    readObj(members[i], child, sequence);
    const fragment = `
<${type}>
  ${child.fragment}
</${type}>\n`.trimStart();
    result.fragment += fragment;
  }
}

function addFeatureIdArray(members, result) {
  for (let i = 0; i < members.length; i += 1) {
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

function addParameterNode(members, result, type) {
  Object.keys(members).forEach(key => {
    parameter(key, members[key], result, type);
  });
}

function parameter(key, value, result, type) {
  const fragment = `
<${type}Parameter name='${camelCaseToDash(key)}'>${value}</${type}Parameter>\n`.trimStart();
  result.fragment += fragment;
}

function addNodeProperty(value, result, type) {
  const fragment = `
<${type}>${value}</${type}>\n`.trimStart();
  result.fragment += fragment;
}

function addNodePropertyLiteral(value, result, type) {
  const fragment = `
<${type}><ogc:Literal>${value}</ogc:Literal></${type}>\n`.trimStart();
  result.fragment += fragment;
}

function addEmptyNode(result, type, attributes) {
  const attributesText = stringifyAttributes(attributes);
  const fragment = `
<${type}${attributesText}/>\n`.trimStart();
  result.fragment += fragment;
}

function stringifyAttributes(attributes) {
  let attributeText = '';
  if (attributes && typeof attributes == 'object' && !Array.isArray(attributes)) {
    Object.keys(attributes).forEach(key => {
      attributeText += ` ${key}='${attributes[key]}'`;
    });
  }
  return attributeText;
}

function mapSequence(obj, sequence) {
  if (sequence) {
    const map = new Map();
    sequence.forEach(nodeName => {
      if (obj[nodeName]) {
        map.set(nodeName, obj[nodeName]);
      }
    });
    return map;
  }
  return new Map(Object.entries(obj));
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

function fileNameToMimeType(fileName) {
  const mimeTypes = { png: 'image/png', jpg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml' };
  return mimeTypes[fileName.split('.').pop()];
}

function ns(name) {
  if (version == '1.0.0' || SLD11.includes(name)) return name;
  return `se:${name}`;
}

function ignore() {
  // do nonthing
}

function isFilter(obj) {
  const filterTypes = ['comparison', 'not', 'or', 'and'];
  return (obj.type && filterTypes.includes(obj.type));
}

// Filters follow a different pattern,
// the sld type is a property rather than the name so we need to remap them.
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
  const map = mapSequence(obj, sequence);
  if (isFilter(obj)) {
    readFilter(obj, result);
  } else {
    map.forEach((value, key) => {
      try {
        builders[key](value, result);
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
  version = obj.version || '1.0.0';
  const result = { fragment: '' };
  addNodeArray(obj.layers, result, 'NamedLayer');
  const symbolizer = (obj.version == '1.1.0') ? ' xmlns:se="http://www.opengis.net/se"' : '';
  const fragment = `<StyledLayerDescriptor version="${version}"
                        xmlns="http://www.opengis.net/sld"
                        xmlns:ogc="http://www.opengis.net/ogc"
                        xmlns:gml="http://www.opengis.net/gml"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/${version}/StyledLayerDescriptor.xsd"${symbolizer}>
                        ${result.fragment}
                    </StyledLayerDescriptor>`;

  // Strip the empty white lines - speed vs readablity trade off
  return prettifyXml(fragment);
}
