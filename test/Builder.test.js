/* global describe it expect before */
import Reader from '../src/Reader';
import Builder from '../src/Builder';
import { sld } from './data/test.sld';
import { sld11 } from './data/test11.sld';

let js;
let jsString;
let builderSld;
let builderJs;
let builderJsString;

describe('Builder', () => {
  before(() => {
    // Read the SLD build it, then read it again.
    // If we are doing it right everything should still pass
    js = Reader(sld);
    jsString = JSON.stringify(js)
    builderSld = Builder(js);
    builderJs = Reader(builderSld);
    builderJsString = JSON.stringify(builderJs);
  });
  it('returns a string', () => {
    expect(typeof builderSld).to.equal('string');
  });
  it('returns an object when the string is passed to Reader', () => {
    expect(builderJs).to.be.an.instanceof(Object);
  });
  it('produces SLD that when passed back to Reader creates identical JavaScript', () => {
    expect(jsString).to.equal(builderJsString);
  });
});
