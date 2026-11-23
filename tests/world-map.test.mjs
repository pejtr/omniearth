import test from 'node:test';
import assert from 'node:assert/strict';
import {PROJECTS,REGIONAL_ANCHORS,validPoint,geoToCartesian,publicAnchor,filterAnchors} from '../src/world-map-core.mjs';

test('WGS84 and 3D position validation',()=>{
 assert.deepEqual(validPoint({lat:0,lng:0}),{lat:0,lng:0});
 assert.throws(()=>validPoint({lat:91,lng:0}),/INVALID_WGS84/);
 assert.throws(()=>validPoint({lat:0,lng:Infinity}),/INVALID_WGS84/);
 assert.throws(()=>geoToCartesian(0,0,-1),/INVALID_RADIUS/);
 const xyz=geoToCartesian(0,0);
 assert.ok(Math.abs(xyz[0])<1e-8);
 assert.ok(Math.abs(xyz[1])<1e-8);
 assert.ok(Math.abs(xyz[2]-1)<1e-8);
 assert.ok(Math.abs(geoToCartesian(90,23)[1]-1)<1e-8);
});
test('public regional anchors and project layer filter',()=>{
 const points=REGIONAL_ANCHORS.map(publicAnchor);
 assert.equal(points.length,8);
 assert.ok(points.every(p=>p.verified===false));
 assert.ok(points.some(p=>p.id==='jp-uji'));
 assert.equal(filterAnchors(REGIONAL_ANCHORS,['teahub']).length,5);
 assert.equal(filterAnchors(REGIONAL_ANCHORS,['travel']).length,2);
 assert.equal(Object.keys(PROJECTS).length,3);
});
test('no private records or unsupported verified claims escape to public map',()=>{
 const record=REGIONAL_ANCHORS[0];
 assert.throws(()=>publicAnchor({...record,customerEmail:'private@example.com'}),/PRIVATE_FIELD_/);
 assert.throws(()=>publicAnchor({...record,verified:true}),/EVIDENCE_REQUIRED/);
 assert.throws(()=>publicAnchor({...record,sourceUrl:'javascript:alert(1)'}),/INVALID_EVIDENCE_URL/);
 assert.throws(()=>publicAnchor({...record,project:'passport'}),/UNKNOWN_PROJECT/);
 assert.deepEqual(Object.keys(publicAnchor({...record,unusedSecret:'not-projected'})).includes('unusedSecret'),false);
});
