import*as d from"three";import{OrbitControls as Vt}from"three/addons/controls/OrbitControls.js";import{GLTFLoader as zt}from"three/addons/loaders/GLTFLoader.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function e(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=e(o);fetch(o.href,r)}})();const M=["root","hips","spine","chest","neck","head","l_shoulder","l_upper_arm","l_forearm","l_hand","r_shoulder","r_upper_arm","r_forearm","r_hand","l_hip","l_thigh","l_shin","l_foot","r_hip","r_thigh","r_shin","r_foot","l_thumb","l_thumb_tip","l_index","l_index_tip","l_middle","l_middle_tip","l_ring","l_ring_tip","l_pinky","l_pinky_tip","r_thumb","r_thumb_tip","r_index","r_index_tip","r_middle","r_middle_tip","r_ring","r_ring_tip","r_pinky","r_pinky_tip"];function P(t){return{id:t,flex:0,abduct:2,twist:1,flexSign:1,abductSign:1,twistSign:1}}function b(t){return{id:t,flex:0,abduct:2,twist:1,flexSign:-1,abductSign:1,twistSign:1}}function mt(t,n){const e=n==="left"?b(t):w(t);return{...e,flexSign:-e.flexSign}}function w(t){return{id:t,flex:0,abduct:2,twist:1,flexSign:-1,abductSign:-1,twistSign:-1}}const Z={root:P("root"),hips:P("hips"),spine:P("spine"),chest:P("chest"),neck:P("neck"),head:P("head"),l_shoulder:b("l_shoulder"),l_upper_arm:b("l_upper_arm"),l_forearm:b("l_forearm"),l_hand:b("l_hand"),r_shoulder:w("r_shoulder"),r_upper_arm:w("r_upper_arm"),r_forearm:w("r_forearm"),r_hand:w("r_hand"),l_hip:b("l_hip"),l_thigh:b("l_thigh"),l_shin:mt("l_shin","left"),l_foot:b("l_foot"),r_hip:w("r_hip"),r_thigh:w("r_thigh"),r_shin:mt("r_shin","right"),r_foot:w("r_foot"),l_thumb:b("l_thumb"),l_thumb_tip:b("l_thumb_tip"),l_index:b("l_index"),l_index_tip:b("l_index_tip"),l_middle:b("l_middle"),l_middle_tip:b("l_middle_tip"),l_ring:b("l_ring"),l_ring_tip:b("l_ring_tip"),l_pinky:b("l_pinky"),l_pinky_tip:b("l_pinky_tip"),r_thumb:w("r_thumb"),r_thumb_tip:w("r_thumb_tip"),r_index:w("r_index"),r_index_tip:w("r_index_tip"),r_middle:w("r_middle"),r_middle_tip:w("r_middle_tip"),r_ring:w("r_ring"),r_ring_tip:w("r_ring_tip"),r_pinky:w("r_pinky"),r_pinky_tip:w("r_pinky_tip")};function Qt(t){return M.includes(t)}const Kt={l_upper_arm:{abduct:8,flex:4},r_upper_arm:{abduct:8,flex:4},l_forearm:{flex:8},r_forearm:{flex:8},l_thigh:{abduct:6},r_thigh:{abduct:6}},Jt=["thumb","index","middle","ring","pinky"],Xt={palm:{thumb:{prox:{flex:22},tip:{flex:16}},index:{prox:{flex:0},tip:{flex:0}},middle:{prox:{flex:0},tip:{flex:0}},ring:{prox:{flex:0},tip:{flex:0}},pinky:{prox:{flex:0},tip:{flex:0}}},fist:{thumb:{prox:{flex:42},tip:{flex:68}},index:{prox:{flex:95},tip:{flex:100}},middle:{prox:{flex:95},tip:{flex:100}},ring:{prox:{flex:95},tip:{flex:100}},pinky:{prox:{flex:95},tip:{flex:100}}},sword:{thumb:{prox:{flex:58},tip:{flex:22}},index:{prox:{flex:0},tip:{flex:0}},middle:{prox:{flex:0},tip:{flex:0}},ring:{prox:{flex:95},tip:{flex:100}},pinky:{prox:{flex:95},tip:{flex:100}}},hook:{thumb:{prox:{flex:70,abduct:-10},tip:{flex:78}},index:{prox:{flex:28,abduct:-6},tip:{flex:88}},middle:{prox:{flex:24},tip:{flex:88}},ring:{prox:{flex:28,abduct:-4},tip:{flex:90}},pinky:{prox:{flex:34,abduct:-8},tip:{flex:92}}}};function gt(t,n,e){return`${t==="left"?"l":"r"}_${n}${e?"_tip":""}`}function Yt(t,n,e){const i=Xt[e];for(const o of Jt){const r=t[gt(n,o,!1)],l=t[gt(n,o,!0)];r.flex=i[o].prox.flex,r.abduct=i[o].prox.abduct??0,r.twist=i[o].prox.twist??0,l.flex=i[o].tip.flex,l.abduct=i[o].tip.abduct??0,l.twist=i[o].tip.twist??0}}const Zt={palm:"palm",zhang:"palm",open:"palm",fist:"fist",quan:"fist",punch:"fist",sword:"sword",jian:"sword",jianzhi:"sword",swordfinger:"sword","sword-finger":"sword",hook:"hook",gou:"hook",hookhand:"hook","hook-hand":"hook"},te={left:"left",l:"left",right:"right",r:"right"};function nt(t){return Zt[t.toLowerCase()]??null}function vt(t){return te[t.toLowerCase()]??null}const tt={flex:[0,0],abduct:[0,0],twist:[0,0]},ee={root:tt,hips:{flex:[-35,50],abduct:[-25,25],twist:[-45,45]},spine:{flex:[-40,60],abduct:[-35,35],twist:[-45,45]},chest:{flex:[-30,45],abduct:[-30,30],twist:[-50,50]},neck:{flex:[-70,60],abduct:[-45,45],twist:[-80,80]},head:{flex:[-40,40],abduct:[-25,25],twist:[-45,45]},shoulder:{flex:[-20,40],abduct:[-20,30],twist:[-25,25]},upper_arm:{flex:[-70,180],abduct:[-50,180],twist:[-100,100]},forearm:{flex:[-5,160],abduct:[0,0],twist:[-90,90]},hand:{flex:[-80,90],abduct:[-35,45],twist:[-30,30]},hip:tt,thigh:{flex:[-40,145],abduct:[-35,80],twist:[-50,60]},shin:{flex:[-5,155],abduct:[-12,12],twist:[-20,20]},foot:{flex:[-35,70],abduct:[-35,35],twist:[-30,30]}},ne={flex:[-25,110],abduct:[-20,30],twist:[-15,15]},ie={flex:[0,110],abduct:[0,0],twist:[0,0]},oe={flex:[0,100],abduct:[-40,40],twist:[-30,30]},re={flex:[0,100],abduct:[0,0],twist:[0,0]};function Et(t){const n=t.replace(/^[lr]_/,"");return n==="thumb"?oe:n==="thumb_tip"?re:n.endsWith("_tip")?ie:n==="index"||n==="middle"||n==="ring"||n==="pinky"?ne:ee[n]??tt}function se(){const t=[];for(const n of M){const e=Et(n);for(const i of["flex","abduct","twist"]){const[o,r]=e[i];o!==r&&t.push({joint:n,axis:i,min:o,max:r})}}return t}function ae(t,n){return Math.min(n[1],Math.max(n[0],t))}function le(t){const n=[];for(const e of Object.keys(t)){const i=Et(e),o=t[e];for(const r of["flex","abduct","twist"]){const l=o[r],a=ae(l,i[r]);a!==l&&(o[r]=a,n.push({joint:e,axis:r,requested:l,applied:a}))}}return n}const I=Math.PI/180;function fe(t,n=0,e=0,i=0){const o=new d.Bone;return o.name=t,o.position.set(n,e,i),o}function _t(t,n,e){const i=n==="l"?1:-1,o=-.0785,r=[["index",i*.016,o+.0025,.052],["middle",0,o,.058],["ring",i*-.014,o+.0035,.05],["pinky",i*-.028,o+.0095,.042]];for(const[m,x,R,V]of r){const C=e(`${n}_${m}`,x,R,.006),z=e(`${n}_${m}_tip`,0,-V,0);t.add(C),C.add(z)}const l=e(`${n}_thumb`,i*.036,-.026,.004),a=e(`${n}_thumb_tip`,0,-.038,0);t.add(l),l.add(a);const s=new d.Vector3(i*.45,-.86,.16).normalize(),f=new d.Vector3(i*-.72,-.4,.56).normalize(),c=new d.Vector3().crossVectors(s,f).normalize().multiplyScalar(-1),u=s.clone().multiplyScalar(-1),_=new d.Vector3().crossVectors(c,u).normalize(),$=new d.Vector3().crossVectors(_,c).normalize();l.quaternion.setFromRotationMatrix(new d.Matrix4().makeBasis(c,$,_)),l.userData.oppose=!0}function de(){const t=new d.Group;t.name="wooden-dummy";const n={},e=(E,Wt=0,Gt=0,Ut=0)=>{const pt=fe(E,Wt,Gt,Ut);return n[E]=pt,pt},i=e("root"),o=e("hips",0,.96,0),r=e("spine",0,.18,0),l=e("chest",0,.22,0),a=e("neck",0,.18,0),s=e("head",0,.1,0),f=e("l_shoulder",.2,.02,0),c=e("l_upper_arm",0,0,0),u=e("l_forearm",0,-.32,0),_=e("l_hand",0,-.26,0),$=e("r_shoulder",-.2,.02,0),m=e("r_upper_arm",0,0,0),x=e("r_forearm",0,-.32,0),R=e("r_hand",0,-.26,0),V=e("l_hip",.1,-.02,0),C=e("l_thigh",0,0,0),z=e("l_shin",0,-.44,0),Dt=e("l_foot",0,-.42,.02),lt=e("r_hip",-.1,-.02,0),ft=e("r_thigh",0,0,0),dt=e("r_shin",0,-.44,0),Ot=e("r_foot",0,-.42,.02);i.add(o),o.add(r),r.add(l),l.add(a),a.add(s),l.add(f),f.add(c),c.add(u),u.add(_),l.add($),$.add(m),m.add(x),x.add(R),o.add(V),V.add(C),C.add(z),z.add(Dt),o.add(lt),lt.add(ft),ft.add(dt),dt.add(Ot),_t(_,"l",e),_t(R,"r",e),t.add(i),t.updateMatrixWorld(!0);const ht=Object.values(n),Bt=new d.Skeleton(ht),ct=new Map;for(const E of ht)E.userData.oppose&&(E.userData.restQuat=E.quaternion.clone()),ct.set(E,E.rotation.clone());const ut={};for(const E of Object.keys(Z))ut[E]={flex:0,abduct:0,twist:0};return{root:t,bones:n,skeleton:Bt,angles:ut,restRotations:ct}}function he(t,n,e,i){if(t.userData.oppose){const a=t.userData.restQuat.clone();a.multiply(new d.Quaternion().setFromAxisAngle(new d.Vector3(1,0,0),e.flex*n.flexSign*I)),a.multiply(new d.Quaternion().setFromAxisAngle(new d.Vector3(0,0,1),e.abduct*n.abductSign*I)),t.quaternion.copy(a);return}const o=new d.Euler(i.x,i.y,i.z,"XYZ"),r=(l,a)=>{l===0?o.x+=a*I:l===1?o.y+=a*I:o.z+=a*I};r(n.flex,e.flex*n.flexSign),r(n.abduct,e.abduct*n.abductSign),r(n.twist,e.twist*n.twistSign),t.rotation.copy(o)}function ce(t,n){const e=t.angles[n.joint];n.flex!==void 0&&(e.flex=n.flex),n.abduct!==void 0&&(e.abduct=n.abduct),n.twist!==void 0&&(e.twist=n.twist)}function it(t){for(const n of Object.keys(t.angles))t.angles[n]={flex:0,abduct:0,twist:0};for(const[n,e]of Object.entries(Kt)){const i=t.angles[n];e.flex!==void 0&&(i.flex=e.flex),e.abduct!==void 0&&(i.abduct=e.abduct),e.twist!==void 0&&(i.twist=e.twist)}}function L(t){const n=le(t.angles);for(const e of Object.keys(Z))he(t.bones[e],Z[e],t.angles[e],t.restRotations.get(t.bones[e]));return t.skeleton.update(),n}function Lt(t,n){for(const e of n.statements)e.kind==="reset"?it(t):e.kind==="hand"?Yt(t.angles,e.side,e.shape):ce(t,e);return L(t)}const ue=.008,xt=new d.Vector3;function q(t){t.root.updateMatrixWorld(!0);let n=1/0;for(const e of["l_foot","r_foot"])t.bones[e].getWorldPosition(xt),n=Math.min(n,xt.y);Number.isFinite(n)&&(t.root.position.y+=ue-n,t.root.updateMatrixWorld(!0))}const pe={flex:"flex",bend:"flex",raise:"flex",abduct:"abduct",straddle:"abduct",spread:"abduct",twist:"twist",turn:"twist"};function me(t){const n=Number(t);return Number.isFinite(n)?n:null}function g(t,n,e,i){const o={kind:"joint",joint:t};return n!==void 0&&(o.flex=n),e!==void 0&&(o.abduct=e),i!==void 0&&(o.twist=i),o}function ge(){return[g("l_upper_arm",58,16),g("l_forearm",30),g("r_upper_arm",58,16),g("r_forearm",30)]}function _e(){return[g("l_upper_arm",8,168),g("l_forearm",18),g("r_upper_arm",8,168),g("r_forearm",18)]}function xe(t){return[g(`${t}_thigh`,68),g(`${t}_shin`,95)]}function be(t,n){const e=t==="left"?"l":"r",i=t==="left"?"r":"l",o=n==="left"?"l":"r",r=n==="left"?"r":"l";return[g("hips",26),g("spine",-22),g("chest",-8),g(`${i}_thigh`,-20,24,16),g(`${i}_shin`,8),g(`${i}_foot`,48,-12,6),g(`${e}_thigh`,112,2,0),g(`${e}_shin`,90),g(`${e}_foot`,4),g(`${o}_upper_arm`,80,-4,-80),g(`${o}_forearm`,10,0,-85),g(`${r}_upper_arm`,-50,0,0),g(`${r}_forearm`,105),{kind:"hand",side:n,shape:"fist"},{kind:"hand",side:n==="left"?"right":"left",shape:"fist"}]}function we(t){return t.toLowerCase().replace(/[.,!?;:]/g," ").replace(/\b(the|a|an|please|to)\b/g," ").replace(/\bpalms\b/g,"palm").replace(/\bfists\b/g,"fist").replace(/\bhooks\b/g,"hook").replace(/\bsword fingers\b/g,"sword").replace(/\bsword finger\b/g,"sword").replace(/\bopen palm\b/g,"palm").replace(/\s+/g," ").trim()}const bt="(palm|zhang|fist|quan|sword|jianzhi|hook|gou)";function je(t){return nt(t)}function ye(t){if(t==="both")return["left","right"];const n=vt(t);return n?[n]:null}function ke(t){let n=we(t);if(/^open (left|right|both)\b/.test(n)&&(n=n.replace(/^open /,"")),/^(stand|neutral|open stance|stand open|reset)$/.test(n))return{statements:[{kind:"reset"}]};if(/^(hands by ears|arms up|arms overhead|raise both arms|raise arms)$/.test(n))return{statements:_e()};if(/^(arms forward|bring arms forward)$/.test(n))return{statements:ge()};let e=n.match(/^(raise|lift) (left|right|both) knees?$/);if(e)return{statements:(e[2]==="both"?["l","r"]:e[2]==="left"?["l"]:["r"]).flatMap(o=>xe(o))};if(e=n.match(/^(bend|flex) (left|right) elbow(?: (-?\d+(?:\.\d+)?))?$/),e){const i=e[2]==="left"?"l":"r",o=e[3]?Number(e[3]):40;return{statements:[g(`${i}_forearm`,o)]}}if(e=n.match(/^(left|right) (?:gong ?bu|bow stance|bow)(?: (left|right))?(?: arm)? punch$/),e){const i=e[1],o=e[2]??(i==="right"?"left":"right");return{statements:be(i,o)}}if(e=n.match(/^(raise|lift) (left|right) arm(?: (-?\d+(?:\.\d+)?))?$/),e){const i=e[2]==="left"?"l":"r",o=e[3]?Number(e[3]):70;return{statements:[g(`${i}_upper_arm`,o,16)]}}if(e=n.match(new RegExp(`^(left|right|both)(?: hand| hands)? ${bt}$`)),e||(e=n.match(new RegExp(`^${bt}(?: (left|right|both))?$`))),e){const i=nt(e[1]),o=i?e[1]:e[2],r=i?e[2]??"both":e[1],l=je(o),a=ye(r);return!l||!a?{error:`Unknown hand phrase "${t.trim()}"`}:{statements:a.map(s=>({kind:"hand",side:s,shape:l}))}}return/^(stand|neutral|raise|lift|bend|flex|arms|hands|bring|left|right|both|palm|fist|sword|hook|make|open)\b/.test(n)?{error:'Try "stand", "raise left knee", "right gong bu left punch", "hands by the ears", "both palms", or "sword fingers"'}:null}function qt(t){const n=[],e=t.split(/\r?\n/);for(let i=0;i<e.length;i++){const o=e[i],r=i+1,l=o.trim();if(!l||l.startsWith("#"))continue;const a=ke(l);if(a&&"error"in a)return{ok:!1,error:a.error,line:r};if(a){n.push(...a.statements);continue}const s=l.split(/\s+/),f=s[0].toLowerCase();if(f==="reset"){if(s.length>1)return{ok:!1,error:"reset takes no arguments",line:r};n.push({kind:"reset"});continue}if(f==="hand"){const $=s[1]?vt(s[1]):null,m=s[2]?nt(s[2]):null;if(!$||!m||s.length!==3)return{ok:!1,error:'Use "hand left|right palm|fist|sword|hook" (aliases: zhang, quan, jianzhi, gou)',line:r};n.push({kind:"hand",side:$,shape:m});continue}if(f!=="joint")return{ok:!1,error:`Unrecognized line "${l}". Try "raise left knee" or "both palms", or a joint line.`,line:r};if(s.length<2)return{ok:!1,error:"joint requires a name",line:r};const c=s[1].toLowerCase();if(!Qt(c))return{ok:!1,error:`Unknown joint "${s[1]}"`,line:r};const u={kind:"joint",joint:c};let _=2;for(;_<s.length;){const $=s[_].toLowerCase(),m=pe[$];if(!m)return{ok:!1,error:`Unknown axis "${s[_]}" (use flex/bend/raise, abduct/straddle, twist/turn)`,line:r};if(_++,_>=s.length)return{ok:!1,error:`Missing degrees after ${$}`,line:r};const x=me(s[_]);if(x===null)return{ok:!1,error:`Expected number (degrees), got "${s[_]}"`,line:r};u[m]=x,_++}if(u.flex===void 0&&u.abduct===void 0&&u.twist===void 0)return{ok:!1,error:"joint line needs at least one axis angle",line:r};n.push(u)}return{ok:!0,program:{statements:n}}}const y=new d.Quaternion,$e=new d.Quaternion().setFromRotationMatrix(new d.Matrix4().makeBasis(new d.Vector3(0,-1,0),new d.Vector3(0,0,-1),new d.Vector3(1,0,0))),Se=new d.Quaternion().setFromRotationMatrix(new d.Matrix4().makeBasis(new d.Vector3(0,1,0),new d.Vector3(0,0,-1),new d.Vector3(-1,0,0))),ve=[["Index","index"],["Middle","middle"],["Ring","ring"],["Pinky","pinky"]];function wt(t,n,e){const i=[{bone:`${t}Shoulder`,joint:`${n}_shoulder`,align:y,weight:1,mode:"joint"},{bone:`${t}Arm`,joint:`${n}_upper_arm`,align:e,weight:1,mode:"joint"},{bone:`${t}ForeArm`,joint:`${n}_forearm`,align:e,weight:1,mode:"joint"},{bone:`${t}Hand`,joint:`${n}_hand`,align:e,weight:1,mode:"joint"},{bone:`${t}HandThumb1`,joint:`${n}_thumb`,align:e,weight:1,mode:"thumb"},{bone:`${t}HandThumb2`,joint:`${n}_thumb_tip`,align:e,weight:.55,mode:"thumb-tip"},{bone:`${t}HandThumb3`,joint:`${n}_thumb_tip`,align:e,weight:.45,mode:"thumb-tip"}];for(const[o,r]of ve)i.push({bone:`${t}Hand${o}1`,joint:`${n}_${r}`,align:e,weight:1,mode:"joint"},{bone:`${t}Hand${o}2`,joint:`${n}_${r}_tip`,align:e,weight:.58,mode:"joint"},{bone:`${t}Hand${o}3`,joint:`${n}_${r}_tip`,align:e,weight:.42,mode:"joint"});return i}const Tt=[{bone:"Hips",joint:"hips",align:y,weight:1,mode:"joint"},{bone:"Spine",joint:"spine",align:y,weight:.5,mode:"joint"},{bone:"Spine1",joint:"spine",align:y,weight:.5,mode:"joint"},{bone:"Spine2",joint:"chest",align:y,weight:1,mode:"joint"},{bone:"Neck",joint:"neck",align:y,weight:1,mode:"joint"},{bone:"Head",joint:"head",align:y,weight:1,mode:"joint"},...wt("Left","l",$e),...wt("Right","r",Se),{bone:"LeftUpLeg",joint:"l_thigh",align:y,weight:1,mode:"joint"},{bone:"LeftLeg",joint:"l_shin",align:y,weight:1,mode:"joint"},{bone:"LeftFoot",joint:"l_foot",align:y,weight:1,mode:"joint"},{bone:"RightUpLeg",joint:"r_thigh",align:y,weight:1,mode:"joint"},{bone:"RightLeg",joint:"r_shin",align:y,weight:1,mode:"joint"},{bone:"RightFoot",joint:"r_foot",align:y,weight:1,mode:"joint"}];function Rt(t){return`mixamorig${t}`}const Ee=new Map(Tt.map(t=>[Rt(t.bone),t.align])),Y=new d.Quaternion,jt=new d.Quaternion,N=new d.Quaternion,yt=new d.Quaternion,H=new d.Vector3;function Le(t,n){const e=t.bones[n.joint];if(n.mode==="joint")return N.copy(e.quaternion);if(n.mode==="thumb"){const r=e.userData.restQuat;return r?N.copy(e.quaternion).multiply(yt.copy(r).invert()):N.copy(e.quaternion)}const o=t.bones[n.joint.replace(/_tip$/,"")].userData.restQuat;return o?N.copy(o).invert().multiply(n.align).multiply(e.quaternion).multiply(yt.copy(n.align).invert()).multiply(o):N.copy(e.quaternion)}function qe(t,n){for(const e of Tt){const i=t.getObjectByName(Rt(e.bone));if(!i)continue;const o=i.parent&&Ee.get(i.parent.name)||y,r=Le(n,e);if(Y.identity().slerpQuaternions(y,r,e.weight),e.mode==="thumb-tip"){i.quaternion.copy(Y);continue}jt.copy(o).invert().multiply(Y).multiply(e.align),i.quaternion.copy(jt)}}const Te=.008;function Re(t){const n=t.getAttribute("position"),e=new Map;for(let i=0;i<n.count;i++){const o=n.getX(i),r=n.getY(i),l=n.getZ(i);if(Math.abs(o)<.03)continue;const a=`${o>0?"l":"r"}${l>.02?"f":"b"}`;let s=e.get(a);if(s||(s=[],e.set(a,s)),s.length<8)s.push({index:i,y:r});else{let f=0;for(let c=1;c<s.length;c++)s[c].y>s[f].y&&(f=c);r<s[f].y&&(s[f]={index:i,y:r})}}return[...e.values()].flat().map(i=>i.index)}function Ae(t){const n=new zt;return new Promise((e,i)=>{n.load(t,o=>{const r=o.scene;r.name="xbot";const l=[];if(r.traverse(f=>{f instanceof d.SkinnedMesh&&(f.castShadow=!0,f.frustumCulled=!1,l.push(f))}),!l.find(f=>f.name==="Beta_Surface")){i(new Error("Xbot is missing its surface mesh."));return}const s=l.map(f=>({mesh:f,position:f.geometry.getAttribute("position"),indices:Re(f.geometry)}));e({object:r,apply(f){qe(r,f),r.position.y=0,r.updateMatrixWorld(!0);let c=1/0;for(const u of s)for(const _ of u.indices)H.fromBufferAttribute(u.position,_),u.mesh.applyBoneTransform(_,H),u.mesh.localToWorld(H),H.y<c&&(c=H.y);Number.isFinite(c)&&(r.position.y=Te-c),r.updateMatrixWorld(!0)}})},void 0,o=>i(o))})}function Me(){const t=new d.Scene;t.background=new d.Color(659992);const n=new d.PerspectiveCamera(42,1,.05,40);n.position.set(.35,1.15,2.8);const e=new d.WebGLRenderer({antialias:!0});e.shadowMap.enabled=!0,e.setPixelRatio(Math.min(window.devicePixelRatio,2));const i=new Vt(n,e.domElement);i.target.set(0,.95,0),i.enableDamping=!0,i.enablePan=!1,i.minDistance=1.2,i.maxDistance=5,t.add(new d.HemisphereLight(12118271,2241348,1.05));const o=new d.DirectionalLight(16777215,1.2);o.position.set(2.5,4,2),o.castShadow=!0,o.shadow.mapSize.set(1024,1024),t.add(o),t.add(new d.AmbientLight(8952234,.35));const r=new d.Mesh(new d.PlaneGeometry(8,8),new d.MeshStandardMaterial({color:1716288,roughness:.92}));r.rotation.x=-Math.PI/2,r.receiveShadow=!0,t.add(r);const l=new d.GridHelper(8,32,3828346,2373704);l.position.y=.002,t.add(l);let a=null,s=null,f=null,c=null,u=0;const _=()=>{u=requestAnimationFrame(_),i.update(),c&&s&&c.apply(s),e.render(t,n)},$=()=>{if(!a)return;const m=a.clientWidth,x=a.clientHeight;m<1||x<1||(n.aspect=m/x,n.updateProjectionMatrix(),e.setSize(m,x,!1))};return{scene:t,camera:n,renderer:e,controls:i,mount(m){a=m,m.appendChild(e.domElement),e.domElement.style.display="block",e.domElement.style.width="100%",e.domElement.style.height="100%",$(),_(),new ResizeObserver(()=>$()).observe(m)},setDummy(m){f&&(t.remove(f),f.dispose()),s&&t.remove(s.root),s=m,q(m),t.add(m.root),f=new d.SkeletonHelper(m.root),f.frustumCulled=!1,t.add(f);const x=new d.Vector3;m.bones.hips.getWorldPosition(x),i.target.copy(x),i.update()},async useHumanFigure(m){const x=await Ae(m);if(!s)return;c&&s.root.remove(c.object),c=x,s.root.add(x.object),x.apply(s),f&&(t.remove(f),f.dispose(),f=null);const R=new d.Vector3;s.bones.hips.getWorldPosition(R),i.target.copy(R),i.update()},resize:$,dispose(){cancelAnimationFrame(u),e.dispose(),a!=null&&a.contains(e.domElement)&&a.removeChild(e.domElement)}}}const Q=`
joint l_upper_arm flex -46
joint l_forearm flex 110
joint r_upper_arm flex -46
joint r_forearm flex 110
hand left fist
hand right fist`;function j(t,n,e,i,o,r,l=!1){return{id:t,name:e,chinese:i,category:"五步拳",description:o,program:r.trim(),transitional:l,routine:"五步拳",step:n}}const At=[j("wbq-ready","起势","Ready, fists at the waist","并步抱拳","Feet together. Both fists chamber at the waist, palms up. Eyes forward.",`stand
    joint l_thigh abduct 3
    joint r_thigh abduct 3
    ${Q}`),j("wbq-step-bow","1","Step in, punch leaving the waist","上步","Left foot steps forward while the right fist leaves the waist. The elbow is still bent. Teaching step into the bow punch.",`stand
    joint hips flex 14
    joint spine flex -8
    joint l_thigh flex 62 abduct 8
    joint l_shin flex 48
    joint l_foot flex 12
    joint r_thigh flex 10 abduct 12 twist 8
    joint r_shin flex 20
    joint r_foot flex 24
    joint r_upper_arm flex 38 abduct 6 twist -40
    joint r_forearm flex 62 twist -40
    joint l_upper_arm flex -44
    joint l_forearm flex 108
    hand left fist
    hand right fist`,!0),j("wbq-bow-punch","1","Left bow, right punch","拗弓步冲拳","Left bow stance. The right fist punches forward and the left fist stays at the waist. Eyes on the right fist.",`stand
    left gong bu right punch
    joint head flex -6`),j("wbq-knee-chamber","2","Lift the right knee, fists home","提膝收拳","The left leg straightens to stand. The right knee lifts, and both fists return to the waist before the snap kick.",`stand
    joint hips flex 6
    joint l_thigh flex 16 abduct 4
    joint l_shin flex 14
    joint l_foot flex 6
    joint r_thigh flex 86 abduct 10
    joint r_shin flex 108
    joint r_foot flex -6
    ${Q}`,!0),j("wbq-snap-kick","2","Right snap kick, left punch","弹腿冲拳","The right shin snaps straight to hip height. The left fist punches as the right fist chambers. Eyes on the left fist.",`stand
    joint hips flex 4
    joint spine flex -6
    joint l_thigh flex 12 abduct 4
    joint l_shin flex 10
    joint l_foot flex 6
    joint r_thigh flex 76 abduct 8
    joint r_shin flex 8
    joint r_foot flex -18
    joint l_upper_arm flex 80 abduct -4 twist -80
    joint l_forearm flex 10 twist -85
    joint r_upper_arm flex -48
    joint r_forearm flex 108
    hand left fist
    hand right fist
    joint head flex -4`),j("wbq-land-horse","3","Right foot lands toward horse stance","落步","The right foot comes down and both knees bend. The left arm starts upward and the right fist is ready to punch to the side.",`stand
    joint hips flex 16 twist 18
    joint chest twist 12
    joint l_thigh flex 38 abduct 30
    joint l_shin flex 42
    joint l_foot flex 12
    joint r_thigh flex 42 abduct 24
    joint r_shin flex 38
    joint r_foot flex 14
    joint l_upper_arm flex 36 abduct 78 twist -16
    joint l_forearm flex 36
    joint l_hand flex -8
    joint r_upper_arm flex -16
    joint r_forearm flex 92
    hand left palm
    hand right fist`,!0),j("wbq-horse-frame","3","Horse stance, frame and punch","马步架打","Horse stance, chest turned toward the right. The left palm frames above the forehead and the right fist punches to the side. Eyes on the right fist.",`stand
    joint hips flex 18 twist 24
    joint spine twist 10
    joint chest twist 28
    joint l_thigh flex 50 abduct 38 twist -8
    joint l_shin flex 80
    joint l_foot flex 18 abduct 8
    joint r_thigh flex 50 abduct 38 twist -8
    joint r_shin flex 80
    joint r_foot flex 18 abduct 8
    joint l_upper_arm flex 18 abduct 156 twist -28
    joint l_forearm flex 86 twist -16
    joint l_hand flex -18
    joint r_upper_arm flex 76 abduct 20 twist -72
    joint r_forearm flex 12 twist -68
    hand left palm
    hand right fist
    joint head twist 16
    joint neck twist 10`),j("wbq-cross-behind","4","Left foot crosses behind","插步","The left foot steps behind the right. The right palm starts to cover downward and the left fist is still near the waist.",`stand
    joint hips flex 24 twist 10
    joint l_thigh flex 68 abduct -6 twist -14
    joint l_shin flex 82
    joint r_thigh flex 58 abduct 14 twist 12
    joint r_shin flex 74
    joint r_upper_arm flex 48 abduct -16 twist -18
    joint r_forearm flex 78
    joint r_hand flex 12
    joint l_upper_arm flex 8
    joint l_forearm flex 86
    hand left fist
    hand right palm`,!0),j("wbq-rest-cover","4","Resting stance, cover and punch","歇步盖打","Resting stance, left foot behind. The right palm covers down across the body and the left fist punches out. Eyes on the left fist.",`stand
    joint hips flex 28 twist 20
    joint r_thigh flex 74 abduct -16 twist -28
    joint r_shin flex 108
    joint l_thigh flex 82 abduct 20 twist 22
    joint l_shin flex 118
    joint r_upper_arm flex 38 abduct -24 twist -12
    joint r_forearm flex 118 twist 10
    joint r_hand flex 26
    joint l_upper_arm flex 68 abduct 34 twist -62
    joint l_forearm flex 14 twist -48
    hand right palm
    hand left fist
    joint head twist -18`),j("wbq-lift-again","5","Fists home, right knee lifts","提膝","Both hands close to fists at the waist and the right knee lifts. This is the first half of threading into the drop stance.",`stand
    joint l_thigh flex 12 abduct 4
    joint l_shin flex 10
    joint l_foot flex 4
    joint r_thigh flex 84 abduct 8
    joint r_shin flex 102
    joint r_foot flex -8
    ${Q}`,!0),j("wbq-drop-thread","5","Left drop stance, threading palm","仆步穿掌","The right leg squats and the left leg extends. The left palm threads forward, palm up, and the right hand draws back. Eyes on the left palm.",`stand
    joint hips flex 28 twist -16
    joint spine flex 24 abduct -16
    joint r_thigh flex 112 abduct 30 twist -16
    joint r_shin flex 125
    joint r_foot flex 28
    joint l_thigh flex 10 abduct 46 twist 16
    joint l_shin flex 8
    joint l_foot flex -6
    joint l_upper_arm flex 70 abduct 8 twist 46
    joint l_forearm flex 8 twist 40
    joint l_hand flex -10
    joint r_upper_arm flex 18 abduct 18
    joint r_forearm flex 72
    hand left palm
    hand right palm
    joint head twist -16
    joint neck abduct -8`),j("wbq-shift-forward","6","Weight shifts into a passing bow","前移","Weight moves onto the left leg into a passing bow. The right palm begins to rise and the left palm comes back.",`stand
    joint hips flex 18 twist -6
    joint spine flex -6
    joint l_thigh flex 80 abduct 8
    joint l_shin flex 68
    joint l_foot flex 8
    joint r_thigh flex 22 abduct 16 twist 8
    joint r_shin flex 18
    joint r_foot flex 28
    joint l_upper_arm flex 28 abduct 18
    joint l_forearm flex 64
    joint r_upper_arm flex 50 abduct 6 twist -18
    joint r_forearm flex 42
    hand left palm
    hand right palm`,!0),j("wbq-empty-lift","6","Right empty stance, lifting palm","虚步挑掌","Weight stays on the left leg. The right toes touch in front, the right palm lifts before the face, and the left palm rests by the right elbow.",`stand
    joint hips flex 18 twist 8
    joint l_thigh flex 50 abduct 16
    joint l_shin flex 74
    joint l_foot flex 16
    joint r_thigh flex 34 abduct 8
    joint r_shin flex 16
    joint r_foot flex 42
    joint r_upper_arm flex 92 abduct 10 twist -30
    joint r_forearm flex 24 twist -20
    joint r_hand flex -30
    joint l_upper_arm flex 46 abduct 24 twist -16
    joint l_forearm flex 96
    joint l_hand flex 6
    hand left palm
    hand right palm
    joint head flex -8`),j("wbq-feet-together","收势","Right foot draws in, fists home","并步抱拳","The right foot draws beside the left and both fists chamber at the waist before the arms lower.",`stand
    joint l_thigh abduct 3
    joint r_thigh flex 14 abduct 6
    joint r_shin flex 16
    ${Q}`,!0),j("wbq-close","收势","Close, arms at the sides","并步直立","Feet together and the arms hang. End of the form.",`stand
    joint l_thigh abduct 2
    joint r_thigh abduct 2
    joint l_upper_arm flex 0 abduct 4
    joint r_upper_arm flex 0 abduct 4
    joint l_forearm flex 0
    joint r_forearm flex 0`)],h=(t,n,e,i,o,r,l=!1)=>({id:t,name:n,chinese:e,category:i,description:o,program:r.trim(),transitional:l}),K=`
joint hips flex 20
joint l_thigh flex 45 abduct 38 twist -12
joint l_shin flex 72
joint l_foot flex 22 abduct 8
joint r_thigh flex 45 abduct 38 twist -12
joint r_shin flex 72
joint r_foot flex 22 abduct 8`,Mt=`
joint hips flex 18 twist -8
joint r_thigh flex 42 abduct 20
joint r_shin flex 68
joint r_foot flex 20
joint l_thigh flex 68 abduct 12
joint l_shin flex 88
joint l_foot flex -12`,Pe=Mt.replaceAll("r_","TEMP_").replaceAll("l_","r_").replaceAll("TEMP_","l_").replace("twist -8","twist 8"),v=`
joint l_upper_arm flex 62 abduct 24 twist -35
joint l_forearm flex 92 twist -35
joint l_hand flex 12
joint r_upper_arm flex 62 abduct 24 twist -35
joint r_forearm flex 92 twist -35
joint r_hand flex 12
hand left palm
hand right palm`,k=[...At,h("wuji","Neutral stance","无极式","Foundations","Relaxed standing reference pose.","stand"),h("kaibu","Ready stance","开步预备式","Foundations","Open ready stance with fists chambered by the waist.",`
    stand
    joint l_thigh abduct 10
    joint r_thigh abduct 10
    joint l_upper_arm flex -35 abduct 4
    joint r_upper_arm flex -35 abduct 4
    joint l_forearm flex 105
    joint r_forearm flex 105
    hand left fist
    hand right fist`),h("baoquan","Fist-palm salute","抱拳礼","Foundations","Traditional greeting: right fist covered by the left palm.",`
    stand
    joint l_upper_arm flex 62 abduct 28 twist -35
    joint l_forearm flex 105 twist -55
    joint l_hand flex 12
    joint r_upper_arm flex 58 abduct 18 twist -55
    joint r_forearm flex 110 twist 55
    joint r_hand flex 8
    hand left palm
    hand right fist`),h("mabu-guard","Horse stance guard","马步架掌","Stances & techniques","Low horse stance with an open two-hand guard.",`stand
${K}
${v}`),h("mabu-chamber","Horse stance chamber","马步抱拳","Stances & techniques","Horse stance with both fists chambered at the hips.",`
    stand
    ${K}
    joint l_upper_arm flex -45
    joint l_forearm flex 110
    joint r_upper_arm flex -45
    joint r_forearm flex 110
    hand left fist
    hand right fist`),h("mabu-left-punch","Horse stance left punch","马步左冲拳","Stances & techniques","Level left punch from horse stance.",`
    stand
    ${K}
    joint l_upper_arm flex 82 twist -80
    joint l_forearm flex 8 twist -80
    joint r_upper_arm flex -45
    joint r_forearm flex 110
    hand left fist
    hand right fist`),h("mabu-right-punch","Horse stance right punch","马步右冲拳","Stances & techniques","Level right punch from horse stance.",`
    stand
    ${K}
    joint r_upper_arm flex 82 twist -80
    joint r_forearm flex 8 twist -80
    joint l_upper_arm flex -45
    joint l_forearm flex 110
    hand left fist
    hand right fist`),h("right-gongbu-left-punch","Right bow stance, left punch","右弓步左冲拳","Stances & techniques","Right leg leads; left fist punches and right fist chambers.",`stand
right gong bu left punch`),h("left-gongbu-right-punch","Left bow stance, right punch","左弓步右冲拳","Stances & techniques","Left leg leads; right fist punches and left fist chambers.",`stand
left gong bu right punch`),h("right-gongbu-left-palm","Right bow stance, left palm","右弓步左推掌","Stances & techniques","Right bow stance with a forward left palm strike.",`
    stand
    right gong bu left punch
    joint l_hand flex -12
    hand left palm`),h("left-gongbu-right-palm","Left bow stance, right palm","左弓步右推掌","Stances & techniques","Left bow stance with a forward right palm strike.",`
    stand
    left gong bu right punch
    joint r_hand flex -12
    hand right palm`),h("left-xubu","Left empty stance guard","左虚步亮掌","Stances & techniques","Weight stays on the rear leg; the left toes touch lightly.",`stand
${Mt}
${v}`),h("right-xubu","Right empty stance guard","右虚步亮掌","Stances & techniques","Weight stays on the rear leg; the right toes touch lightly.",`stand
${Pe}
${v}`),h("left-pubu","Left drop stance palm","左仆步穿掌","Stances & techniques","Deep right squat with the left leg extended and left palm threading outward.",`
    stand
    joint hips flex 28 twist -18
    joint spine flex 26 abduct -18
    joint r_thigh flex 112 abduct 30 twist -18
    joint r_shin flex 125
    joint r_foot flex 30
    joint l_thigh flex 12 abduct 45 twist 18
    joint l_shin flex 8
    joint l_foot flex -6
    joint l_upper_arm flex 72 abduct 62 twist -35
    joint l_forearm flex 10
    joint r_upper_arm flex 35 abduct 25
    joint r_forearm flex 85
    hand left palm
    hand right palm`),h("right-pubu","Right drop stance palm","右仆步穿掌","Stances & techniques","Deep left squat with the right leg extended and right palm threading outward.",`
    stand
    joint hips flex 28 twist 18
    joint spine flex 26 abduct 18
    joint l_thigh flex 112 abduct 30 twist -18
    joint l_shin flex 125
    joint l_foot flex 30
    joint r_thigh flex 12 abduct 45 twist 18
    joint r_shin flex 8
    joint r_foot flex -6
    joint r_upper_arm flex 72 abduct 62 twist -35
    joint r_forearm flex 10
    joint l_upper_arm flex 35 abduct 25
    joint l_forearm flex 85
    hand left palm
    hand right palm`),h("left-xiebu","Left cross stance guard","左歇步架掌","Stances & techniques","Crossed low stance with the left leg wrapping in front.",`
    stand
    joint hips flex 28 twist -22
    joint l_thigh flex 74 abduct -18 twist -30
    joint l_shin flex 105
    joint r_thigh flex 82 abduct 22 twist 25
    joint r_shin flex 118
    ${v}`),h("right-xiebu","Right cross stance guard","右歇步架掌","Stances & techniques","Crossed low stance with the right leg wrapping in front.",`
    stand
    joint hips flex 28 twist 22
    joint r_thigh flex 74 abduct -18 twist -30
    joint r_shin flex 105
    joint l_thigh flex 82 abduct 22 twist 25
    joint l_shin flex 118
    ${v}`),h("left-duli","Left one-leg stance","左独立步","Stances & techniques","Balance on the right leg with the left knee raised.",`
    stand
    joint l_thigh flex 82 abduct 12
    joint l_shin flex 105
    joint l_foot flex -12
    joint r_thigh flex 8
    joint r_shin flex 12
    ${v}`),h("right-duli","Right one-leg stance","右独立步","Stances & techniques","Balance on the left leg with the right knee raised.",`
    stand
    joint r_thigh flex 82 abduct 12
    joint r_shin flex 105
    joint r_foot flex -12
    joint l_thigh flex 8
    joint l_shin flex 12
    ${v}`),h("left-side-stance","Left side stance","左横裆步","Stances & techniques","Wide lateral stance facing over the left side.",`
    stand
    joint hips flex 16 twist -25
    joint chest twist -18
    joint l_thigh flex 66 abduct 38 twist -24
    joint l_shin flex 80
    joint r_thigh flex 10 abduct 42 twist 20
    joint r_shin flex 12
    ${v}`),h("right-side-stance","Right side stance","右横裆步","Stances & techniques","Wide lateral stance facing over the right side.",`
    stand
    joint hips flex 16 twist 25
    joint chest twist 18
    joint r_thigh flex 66 abduct 38 twist -24
    joint r_shin flex 80
    joint l_thigh flex 10 abduct 42 twist 20
    joint l_shin flex 12
    ${v}`),h("kf-double-chamber","Keyframe: double chamber","过渡：双抱拳","Transition keyframes","Preparation keyframe before alternating punches.",`
    stand
    joint hips flex 12
    joint l_upper_arm flex -50
    joint l_forearm flex 112
    joint r_upper_arm flex -50
    joint r_forearm flex 112
    hand left fist
    hand right fist`,!0),h("kf-shift-right","Keyframe: weight shift right","过渡：右移重心","Transition keyframes","Intermediate weight transfer before entering a right bow stance.",`
    stand
    joint hips flex 20 twist 10
    joint spine flex -8
    joint l_thigh flex 25 abduct 20
    joint l_shin flex 35
    joint r_thigh flex 72 abduct 12
    joint r_shin flex 70
    ${v}`,!0),h("kf-shift-left","Keyframe: weight shift left","过渡：左移重心","Transition keyframes","Intermediate weight transfer before entering a left bow stance.",`
    stand
    joint hips flex 20 twist -10
    joint spine flex -8
    joint r_thigh flex 25 abduct 20
    joint r_shin flex 35
    joint l_thigh flex 72 abduct 12
    joint l_shin flex 70
    ${v}`,!0),h("kf-left-punch-extension","Keyframe: left punch extension","过渡：左拳半出","Transition keyframes","Midpoint with the left punch halfway extended.",`
    stand
    joint l_upper_arm flex 48 abduct 8 twist -45
    joint l_forearm flex 62 twist -45
    joint r_upper_arm flex -42
    joint r_forearm flex 108
    hand left fist
    hand right fist`,!0),h("kf-right-punch-extension","Keyframe: right punch extension","过渡：右拳半出","Transition keyframes","Midpoint with the right punch halfway extended.",`
    stand
    joint r_upper_arm flex 48 abduct 8 twist -45
    joint r_forearm flex 62 twist -45
    joint l_upper_arm flex -42
    joint l_forearm flex 108
    hand left fist
    hand right fist`,!0),h("gesture-palm","Open palm","掌","Hand gestures","Both open palms displayed forward.",`stand
arms forward
both palms`),h("gesture-fist","Closed fist","拳","Hand gestures","Both fists displayed forward.",`stand
arms forward
both fists`),h("gesture-sword","Sword fingers","剑指","Hand gestures","Index and middle fingers extended; remaining fingers folded.",`stand
arms forward
sword fingers`),h("gesture-hook","Hook hand","勾手","Hand gestures","Fingers gathered with the wrists sharply flexed to show hook hands.",`
    stand
    joint l_upper_arm flex 25 abduct 78 twist -20
    joint l_forearm flex 18
    joint l_hand flex 78
    joint r_upper_arm flex 25 abduct 78 twist -20
    joint r_forearm flex 18
    joint r_hand flex 78
    hand left hook
    hand right hook`)],kt=new Set;for(const t of k){if(kt.has(t.id))throw new Error(`Duplicate pose id ${t.id}`);kt.add(t.id)}if(At.length<8)throw new Error("五步拳 is missing postures");const Ce={},Ie=document.querySelector("#app");Ie.innerHTML=`
  <div class="layout">
    <aside class="panel">
      <h1>Wushu pose studio</h1>
      <p class="lede">
        Step through 五步拳. Named postures are the form’s key poses. The steps between them are the teaching transitions. Every change moves over 500 ms.
      </p>
      <section class="pose-browser" aria-labelledby="pose-browser-title">
        <div class="section-heading">
          <h2 id="pose-browser-title">Pose library</h2>
          <span id="pose-count">1 / ${k.length}</span>
        </div>
        <label for="pose-select">Form step</label>
        <select id="pose-select"></select>
        <div class="pose-title">
          <strong id="pose-name"></strong>
          <span id="pose-chinese"></span>
          <span class="pose-badge key-pose-badge" id="key-pose-badge" hidden>Key pose</span>
          <span class="pose-badge keyframe-badge" id="keyframe-badge" hidden>Transition</span>
        </div>
        <p class="pose-description" id="pose-description"></p>
        <div class="toolbar pose-actions">
          <button type="button" id="previous-pose">← Previous</button>
          <button type="button" class="primary" id="next-pose">Next →</button>
          <button type="button" id="save-pose">Save edits</button>
          <button type="button" id="restore-pose">Restore default</button>
        </div>
        <p class="save-note">Save edits writes the pose into the project when this studio server is running. The published page is a static copy and cannot save.</p>
      </section>
      <details class="grammar-editor">
        <summary>Pose grammar</summary>
      <label for="grammar">Pose program</label>
      <textarea id="grammar" class="grammar" spellcheck="false"></textarea>
      <div class="toolbar">
        <button type="button" class="primary" id="apply">Apply pose</button>
      </div>
      </details>
      <p id="status" class="status" aria-live="polite"></p>
      <section class="sliders">
        <div class="section-heading">
          <h2>Joint sliders</h2>
          <span>95 movable axes</span>
        </div>
        <p class="hint">Drag a slider, then mirror that arm or leg onto the other side. Save edits stores the whole pose in the project.</p>
        <div class="slider-scroll" id="sliders"></div>
      </section>
    </aside>
    <div class="viewport-wrap" id="viewport">
      <span class="viewport-hint">Drag to orbit · scroll to zoom</span>
      <span class="figure-state" id="figure-state">Loading the human figure…</span>
    </div>
  </div>
`;const ot=document.querySelector("#grammar"),J=document.querySelector("#status"),Ne=document.querySelector("#viewport"),D=document.querySelector("#pose-select"),He=document.querySelector("#pose-name"),Fe=document.querySelector("#pose-chinese"),De=document.querySelector("#pose-description"),$t=document.querySelector("#pose-count"),Oe=document.querySelector("#keyframe-badge"),Be=document.querySelector("#key-pose-badge"),A=document.querySelector("#save-pose"),F=document.querySelector("#restore-pose"),p=de(),rt=Me(),St=document.querySelector("#figure-state");rt.mount(Ne);it(p);L(p);rt.setDummy(p);q(p);rt.useHumanFigure("./models/Xbot.glb").then(()=>{St.hidden=!0},()=>{St.textContent="The human figure did not load. Joint lines stay visible."});function S(t,n){J.textContent=n,J.className=t?"status ok":"status err"}const st=500;let O=0,T=0;const Pt=new Map,W=new Map;function B(){const t={};for(const n of M)t[n]={...p.angles[n]};return t}function et(t){for(const n of M)p.angles[n]={...t[n]}}function Ct(t){const n={};for(const e of M)n[e]={...t[e]};return n}function We(t){if(!t||typeof t!="object")return!1;const n=t;return M.every(e=>{const i=n[e];return i&&Number.isFinite(i.flex)&&Number.isFinite(i.abduct)&&Number.isFinite(i.twist)})}function Ge(){for(const t of k){const n=qt(t.program);if(!n.ok)throw new Error(`Invalid library pose "${t.name}": ${n.error}`);Lt(p,n.program),Pt.set(t.id,B())}it(p),L(p),q(p)}function Ue(){const t=Ce;for(const n of k){const e=t[n.id];We(e)&&W.set(n.id,Ct(e))}}async function It(t,n){const e=await fetch("/api/pose-edits",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(n?{id:t.id,name:t.name,angles:n}:{id:t.id,name:t.name,remove:!0})}),i=await e.json().catch(()=>({}));if(!e.ok)throw e.status===404||e.status===405||!i.error?new Error("This published page has no save server. Open the running studio to write the pose into the project."):new Error(i.error)}function Ve(t){return Ct(W.get(t.id)??Pt.get(t.id))}function ze(t){const n=W.has(t.id)?" • Edited":"";if(t.routine&&t.step){const e=t.transitional?"过渡":"定式";return`${t.step} ${e} · ${t.chinese}${n}`}return`${t.chinese} · ${t.name}${n}`}function at(){for(const t of D.options){const n=k[Number(t.dataset.index)];t.textContent=ze(n)}}function G(t){A.classList.toggle("unsaved",t),A.textContent=t?"Save edits *":"Save edits"}function U(t,n=!0){T=(t+k.length)%k.length;const e=k[T];if(D.value=e.id,He.textContent=e.name,Fe.textContent=e.chinese,De.textContent=e.description,e.routine){const r=k.filter(a=>a.routine===e.routine),l=r.findIndex(a=>a.id===e.id)+1;$t.textContent=`${e.routine} ${l} / ${r.length}`}else $t.textContent=`${T+1} / ${k.length}`;Oe.hidden=!e.transitional,Be.hidden=!(e.routine&&!e.transitional),ot.value=`${e.program}
`;const i=B(),o=Ve(e);G(!1),n?(Nt(i,o),S(!0,`${e.name} · moving for ${st} ms.`)):(et(o),L(p),q(p),X(),S(!0,`${e.name} loaded.`))}function Nt(t,n){const e=++O,i=performance.now(),o=r=>{if(e!==O)return;const l=Math.min(1,(r-i)/st),a=l*l*(3-2*l);for(const s of M){const f=p.angles[s];f.flex=t[s].flex+(n[s].flex-t[s].flex)*a,f.abduct=t[s].abduct+(n[s].abduct-t[s].abduct)*a,f.twist=t[s].twist+(n[s].twist-t[s].twist)*a}L(p),q(p),X(),l<1&&requestAnimationFrame(o)};return requestAnimationFrame(o),e}function Ht(t=!0){const n=qt(ot.value);if(!n.ok){S(!1,n.line?`Line ${n.line}: ${n.error}`:n.error);return}const e=B(),i=Lt(p,n.program),o=B();et(e),L(p),q(p),G(!0);const r=()=>{if(i.length===0){S(!0,`Applied ${n.program.statements.length} statement(s).`);return}const a=i.map(s=>`${s.joint} ${s.axis} ${s.requested}° → ${s.applied}°`).join("; ");J.textContent=`Clamped to human range: ${a}`,J.className="status warn"};if(!t){et(o),L(p),q(p),X(),r();return}const l=Nt(e,o);S(!0,"Moving into the pose."),window.setTimeout(()=>{l===O&&r()},st+40)}document.querySelector("#apply").addEventListener("click",()=>Ht());ot.addEventListener("keydown",t=>{(t.metaKey||t.ctrlKey)&&t.key==="Enter"&&(t.preventDefault(),Ht())});D.addEventListener("change",()=>{U(k.findIndex(t=>t.id===D.value))});document.querySelector("#previous-pose").addEventListener("click",()=>U(T-1));document.querySelector("#next-pose").addEventListener("click",()=>U(T+1));A.addEventListener("click",async()=>{const t=k[T],n=B();A.disabled=!0,F.disabled=!0,S(!0,`Saving ${t.name} into the project…`);try{await It(t,n),W.set(t.id,n),at(),G(!1),S(!0,`${t.name} saved into the project.`)}catch(e){S(!1,e instanceof Error?e.message:"Could not save this pose into the project.")}finally{A.disabled=!1,F.disabled=!1}});F.addEventListener("click",async()=>{const t=k[T];A.disabled=!0,F.disabled=!0,S(!0,`Restoring ${t.name} in the project…`);try{await It(t,null),W.delete(t.id),at(),U(T),S(!0,`${t.name} restored in the project.`)}catch(n){S(!1,n instanceof Error?n.message:"Could not restore this pose.")}finally{A.disabled=!1,F.disabled=!1}});const Qe=[{title:"Torso",test:t=>["hips","spine","chest","neck","head"].includes(t)},{title:"Left arm",test:t=>/^l_(shoulder|upper_arm|forearm|hand)$/.test(t)},{title:"Right arm",test:t=>/^r_(shoulder|upper_arm|forearm|hand)$/.test(t)},{title:"Left fingers",test:t=>/^l_(thumb|index|middle|ring|pinky)/.test(t)},{title:"Right fingers",test:t=>/^r_(thumb|index|middle|ring|pinky)/.test(t)},{title:"Left leg",test:t=>/^l_(thigh|shin|foot)$/.test(t)},{title:"Right leg",test:t=>/^r_(thigh|shin|foot)$/.test(t)}],Ke=["shoulder","upper_arm","forearm","hand","thumb","thumb_tip","index","index_tip","middle","middle_tip","ring","ring_tip","pinky","pinky_tip"],Je=["thigh","shin","foot"],Xe={"Left arm":{kind:"arm",from:"l",label:"Mirror to right arm"},"Right arm":{kind:"arm",from:"r",label:"Mirror to left arm"},"Left leg":{kind:"leg",from:"l",label:"Mirror to right leg"},"Right leg":{kind:"leg",from:"r",label:"Mirror to left leg"}},Ft=new Map;function Ye(t,n){return`${t}:${n}`}function Ze(t,n){const e=n==="l"?"r":"l",i=t==="arm"?Ke:Je;O+=1;for(const a of i){const s=p.angles[`${n}_${a}`],f=p.angles[`${e}_${a}`];f.flex=s.flex,f.abduct=s.abduct,f.twist=s.twist}L(p),q(p),X(),G(!0),S(!0,`Mirrored the ${n==="l"?"left":"right"} ${t} onto the ${n==="l"?"right":"left"}${t==="arm"?", including the hand":""}. Save edits to keep it.`)}function X(){for(const[t,n]of Ft){const[e,i]=t.split(":"),o=p.angles[e][i];n.input.value=String(o),n.out.textContent=`${Math.round(o)}°`}}function tn(){const t=document.querySelector("#sliders"),n=se();for(const e of Qe){const i=n.filter(a=>e.test(a.joint));if(i.length===0)continue;const o=document.createElement("details");o.open=e.title==="Torso"||e.title.endsWith("leg")||e.title.endsWith("arm");const r=document.createElement("summary");r.textContent=`${e.title} (${i.length})`,o.appendChild(r);const l=Xe[e.title];if(l){const a=document.createElement("button");a.type="button",a.className="mirror-action",a.textContent=l.label,a.addEventListener("click",()=>Ze(l.kind,l.from)),o.appendChild(a)}for(const a of i){const s=document.createElement("label");s.className="slider-row";const f=document.createElement("span");f.textContent=`${a.joint} ${a.axis}`;const c=document.createElement("output"),u=document.createElement("input");u.type="range",u.min=String(a.min),u.max=String(a.max),u.step="1",u.setAttribute("aria-label",`${a.joint} ${a.axis}`),u.addEventListener("input",()=>{O+=1,p.angles[a.joint][a.axis]=Number(u.value),L(p),q(p),c.textContent=`${u.value}°`,G(!0),S(!0,"Pose adjusted. Save edits to keep this version.")}),s.append(f,c,u),o.appendChild(s),Ft.set(Ye(a.joint,a.axis),{input:u,out:c})}t.appendChild(o)}}function en(){const t=new Map;k.forEach((n,e)=>{let i=t.get(n.category);i||(i=document.createElement("optgroup"),i.label=n.category,t.set(n.category,i),D.appendChild(i));const o=document.createElement("option");o.value=n.id,o.dataset.index=String(e),i.appendChild(o)}),at()}Ge();Ue();en();tn();U(k.findIndex(t=>t.id==="wbq-ready"),!1);
