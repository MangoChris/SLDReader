/* global ol SLDReader CodeMirror */
// the xml editor
const editor = CodeMirror.fromTextArea(document.getElementById('sld'), {
  lineNumbers: true,
  lineWrapping: true,
  mode: 'xml',
  foldGutter: true,
  extraKeys: {"Ctrl-Q": function(cm){ CodeMirror.commands.foldAll(cm); }},
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
});

const editor2 = CodeMirror.fromTextArea(document.getElementById('sld2'), {
  lineNumbers: true,
  lineWrapping: true,
  mode: 'xml',
  foldGutter: true,
  readOnly: true,
  extraKeys: {"Ctrl-Q": function(cm){ CodeMirror.commands.foldAll(cm); }},
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
});

const sldChooser = document.getElementById('sld_chooser');

fetch('assets/test.xml')
  .then(response => response.text())
  .then(text => editor.setValue(text));

/**
 * Update SLD file
 */

sldChooser.onchange = function() {
  fetch(`assets/${sldChooser.value}`)
    .then(response => response.text())
    .then(text => editor.setValue(text));
}

/**
 * update editor 2 if sld is edited
 */
editor.on('change', cm => {
  const sldObject = SLDReader.Reader(cm.getValue());

  // Here we can see what's going on in the JavaScript model
  console.log('SLDReader Output from Standard SLD:');
  console.log(SLDReader.Reader(cm.getValue()));

  const sldText = SLDReader.Builder(sldObject);
  editor2.setValue(sldText);
  console.log('SLDReader Output from SLDBuilder Generated SLD:');
  console.log(SLDReader.Reader(sldText));
});
