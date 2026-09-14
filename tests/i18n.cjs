const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),saved={};
function environment(){const env={console,localStorage:{getItem:k=>saved[k],setItem:(k,v)=>saved[k]=v},document:{documentElement:{setAttribute(){}}}};vm.createContext(env);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../arcade.js'),'utf8'),env);for(const file of ['i18n.js','i18n-story.js','campaign.js','opening.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),env);return env;}
let env=environment();env.assert=assert;
vm.runInContext(`
for(const lang of ['ja','zh-Hant']){
 GAME_I18N.setLanguage(lang);
 const t=GAME_I18N.translate;
 for(const level of CAMPAIGN_LEVELS){
  for(const text of [level.name,level.objective,...level.exit,...level.route.flatMap(n=>[n.name,...(n.text||[]),...(n.rescue?[n.rescue]:[])])])assert.notEqual(t(text),text,lang+': '+text);
 }
 assert(!t('P2 KENSHIRO READY').includes('KENSHIRO'));
 assert(!t('LEVEL 1 — WASTELAND AWAKENING').includes('LEVEL'));
 assert(!t('P2 · PUNCH / KICK TO JOIN').includes('PUNCH'));
 let called;const ctx={font:'bold 15px Courier New',fillText:(...args)=>called=args,strokeText(){}};
 GAME_I18N.install(ctx);ctx.fillText('PRESS START',10,20,400);
 assert.equal(called[0],t('PRESS START'));assert.equal(called[3],400);assert.equal(ctx.font,'bold 15px Courier New');
}
GAME_I18N.setLanguage('ja');assert.equal(GAME_I18N.translate('尤加利'),'ユリア');
GAME_I18N.setLanguage('en');assert.equal(GAME_I18N.translate('尤加利'),'Julia');
GAME_I18N.setLanguage('zh-Hant');assert.equal(GAME_I18N.translate('尤加利'),'尤加利');
GAME_I18N.setLanguage('invalid');assert.equal(GAME_I18N.language,'zh-Hant');
`,env);
env=environment();assert.equal(vm.runInContext('GAME_I18N.language',env),'zh-Hant');
console.log('PASS Japanese and Traditional Chinese campaign coverage, dynamic HUD, cinematic, canvas rendering and saved preference');
