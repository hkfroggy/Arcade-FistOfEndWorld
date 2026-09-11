// Presentation-only localization: save data, asset keys and combat identifiers stay stable.
const GAME_I18N=(()=>{
const rows=`
FIST OF THE NORTH STAR|北斗の拳|北斗神拳
WASTELAND BRAWLER|荒野の激闘|荒野激鬥
Nine battles. One road through the wasteland.|九つの戦い。荒野を貫く一本の道。|九場決戰，一條穿越荒野的道路。
PRESS START|スタート|開始遊戲
THE WASTELAND IS WAITING|荒野が待っている|荒野正等待著你
I  /  THE BROKEN WORLD|I ／ 崩壊した世界|I ／ 崩壞的世界
II  /  PRISONS & TYRANTS|II ／ 牢獄と暴君|II ／ 牢獄與暴君
III  /  THE ROAD TO RAOH|III ／ ラオウへの道|III ／ 通往拉歐之路
WASTELAND ENFORCER|荒野の処刑人|荒野執行者
THE HUMAN FORTRESS|人間要塞|人肉堡壘
LORD OF SOUTHERN CROSS|サザンクロスの支配者|南十字城之主
THE FALSE SUCCESSOR|偽りの伝承者|冒牌傳人
WARDEN OF CASSANDRA|カサンドラの獄長|卡珊德拉獄長
THE AWAKENED GIANT|目覚めた巨人|甦醒的巨人
THE HOLY EMPEROR|聖帝|聖帝
THE LONE WOLF|孤高の狼|孤狼
THE CONQUEROR|世紀末覇者|世紀末霸者
A ruthless opening challenge.|最初に立ちはだかる冷酷な敵。|最先擋路的冷酷強敵。
Watch his thrust, then punish the lunge.|突きを見極め、突進の隙を突け。|看準突刺，在衝刺後反擊。
Heavy armor. Overwhelming force.|強固な守り。圧倒的な力。|堅固防禦，壓倒性的力量。
Evade his charge to find an opening.|突進をかわし、隙を見つけろ。|閃避衝撞，尋找破綻。
Precision strikes and relentless pressure.|鋭い一撃と絶え間ない攻勢。|精準打擊與無止盡的攻勢。
Read the delay before his next attack.|次の一撃までの間を見極めろ。|看穿下一擊前的停頓。
A masked rival who fights without honor.|卑劣な手段を使う仮面の敵。|不擇手段的蒙面宿敵。
Close the distance while he reloads.|装填中に距離を詰めろ。|趁他裝填時拉近距離。
The prison gates answer to his whip.|その鞭が牢獄を支配する。|以長鞭統治牢獄的暴君。
Escape the sweep. Sidestep the charge.|薙ぎ払いを避け、突進をかわせ。|避開橫掃，側閃衝撞。
A towering threat from the depths.|深淵から現れた巨大な脅威。|來自深淵的巨大威脅。
Keep clear of his crushing hands.|叩きつける巨腕から離れろ。|遠離他碾壓一切的巨掌。
An iron guard and deadly aerial strikes.|鉄壁の守りと必殺の空中攻撃。|銅牆鐵壁的防禦與致命空襲。
Survive his assault to expose a gap.|猛攻をしのぎ、隙を暴け。|撐過猛攻，找出破綻。
Swift lunges cut through the battlefield.|素早い突進が戦場を切り裂く。|迅速突進劃破戰場。
Do not commit before his delayed strike.|遅れて来る一撃に飛び込むな。|別在延遲攻擊前貿然出手。
The final road leads to the strongest foe.|道の果てに最強の敵が待つ。|道路盡頭，最強之敵正在等待。
Face his charge, crushing blows and aura.|突進、剛拳、闘気に立ち向かえ。|迎戰衝撞、重拳與鬥氣。
SELECT YOUR FIGHTER|闘士を選べ|選擇你的鬥士
CHOOSE YOUR MARTIAL ART|拳法を選べ|選擇你的拳法
TWO WARRIORS. ONE ROAD THROUGH THE WASTELAND.|二人の戦士、同じ荒野の道。|兩位戰士，共闖荒野。
Relentless combinations|怒涛の連撃|連綿不絕的連擊
Swift cutting strikes|鋭く素早い斬撃|迅捷銳利的斬擊
Precise pressure points|的確な秘孔攻撃|精準點穴
THE JOURNEY BEGINS|旅が始まる|旅程即將開始
PRESS PUNCH / KICK TO JOIN|パンチ／キックで参加|按拳擊／踢擊加入
PUNCH / KICK TO JOIN · MOVE TO CHOOSE · PUNCH / KICK TO CONFIRM|パンチ／キックで参加・移動で選択・パンチ／キックで決定|拳擊／踢擊加入・移動選擇・拳擊／踢擊確認
JOIN IN PRESS ORDER · SECOND PLAYER CAN JOIN DURING PLAY|参加順に割り当て・途中参加も可能|依加入順序分配・第二位玩家可中途加入
Punch + kick to change selection|パンチ＋キックで選び直す|拳擊＋踢擊可重新選擇
Move to choose · Attack to confirm|移動で選択・攻撃で決定|移動選擇・攻擊確認
Move to choose · Punch / kick to confirm|移動で選択・パンチ／キックで決定|移動選擇・拳擊／踢擊確認
Unused keyboard controls or controller|未使用のキーまたはコントローラー|使用尚未分配的鍵盤按鍵或控制器
PUNCH / KICK TO JOIN|パンチ／キックで参加|拳擊／踢擊加入
CONTROLLER SETTINGS|コントローラー設定|控制器設定
ARROWS / D-PAD TO MOVE · LEFT / RIGHT TO CHANGE · ENTER TO TOGGLE|上下で選択・左右で変更・ENTERで切替|上下選擇・左右調整・ENTER切換
JOYSTICK INPUT|コントローラー入力|控制器輸入
STICK DEADZONE|スティックのデッドゾーン|搖桿死區
INVERT Y AXIS|縦軸を反転|反轉垂直軸
P1 CONTROLLER|P1 コントローラー|P1 控制器
P2 CONTROLLER|P2 コントローラー|P2 控制器
T = SETTINGS FROM TITLE · ESC = BACK|タイトルでT：設定・ESC：戻る|標題畫面按T：設定・ESC：返回
ON|オン|開啟
OFF|オフ|關閉
AUTO|自動|自動
NONE|なし|無
READY|準備完了|準備完成
SELECT|選択|選擇
SCORE|スコア|分數
TOTAL|合計|總分
METER|闘気|鬥氣
PHASE|段階|階段
OPENING|隙あり|破綻
WATCH THE TELL|予備動作を見ろ|注意起手動作
RESCUE + SUPPLIES|救出＋物資|救援＋補給
CHAPTER COMPLETE|章クリア|章節完成
CLEAR|敵を倒せ|清除敵人
GO →|進め →|前進 →
GAME OVER|ゲームオーバー|遊戲結束
VICTORY!!|勝利！！|勝利！！
LEVEL CLEAR!|ステージクリア！|關卡完成！
PRESS ENTER TO CONTINUE|ENTERで続ける|按ENTER繼續
THE NINE-CHAPTER JOURNEY IS COMPLETE|九章にわたる旅が終わった|九章旅程已完成
Raoh’s final salute. A new dawn for the wasteland.|ラオウの最後の別れ。荒野に新たな夜明け。|拉歐最後的致意，荒野迎來新的黎明。
Kenshiro and Julia leave together. The survivors rebuild.|ケンシロウとユリアは共に旅立つ。人々は再建を始める。|健次郎與尤加利攜手離去，倖存者開始重建。
Kenshiro|ケンシロウ|健次郎
Ken|ケン|健
Rei|レイ|雷伊
Toki|トキ|托席
Spade|スペード|黑桃
Heart|ハート|紅心
Shin|シン|阿星
Jagi|ジャギ|傑基
Uighur|ウイグル|維吾爾
Devil Rebirth|デビルリバース|惡魔利巴斯
Souther|サウザー|沙烏薩
Ryuga|リュウガ|龍牙
Raoh|ラオウ|拉歐
Julia|ユリア|尤加利
Hokuto Shinken|北斗神拳|北斗神拳
Nanto Suichoken|南斗水鳥拳|南斗水鳥拳
Hokuto Ujoken|北斗有情拳|北斗有情拳
Wasteland Awakening|荒野の目覚め|荒漠覺醒
Ruined Village Siege|廃村包囲戦|廢村圍城戰
Southern Cross City and Shin Arc|サザンクロスとシン|南十字城與阿星
Desert Convoy Ambush|砂漠の輸送隊襲撃|沙漠車隊伏擊
Cassandra Prison|カサンドラ獄|卡珊德拉監獄
Devil Rebirth and Cult Stronghold|巨人と教団の砦|惡魔利巴斯與教團要塞
Nanto Generals War and Souther|南斗の将と聖帝|南斗諸將與聖帝
Capital and Raoh Territory|王都とラオウの領地|王都與拉歐領地
Final Battlefield and Raoh|最終決戦とラオウ|最終戰場與拉歐
Reach the settlement and follow the trail of Julia.|集落へ向かい、ユリアの足跡を追え。|抵達聚落，追尋尤加利的下落。
Clear an evacuation route through the village.|村を抜ける避難路を確保せよ。|打通穿越村莊的撤離路線。
Break through KING and confront Shin about Julia.|KINGを突破し、ユリアの行方をシンに問え。|突破KING軍團，向阿星追問尤加利的下落。
Protect the refugee convoy and expose the impostor.|避難民の輸送隊を守り、偽者を暴け。|保護難民車隊，揭穿冒牌者。
Expose the false healer and free Toki from Cassandra.|偽の治療師を暴き、カサンドラからトキを救え。|揭穿假醫者，從卡珊德拉救出托席。
Free the captives and stop Jackal at the sealed chamber.|捕虜を解放し、封印の間でジャッカルを止めろ。|解救俘虜，在封印密室阻止傑卡爾。
Support Shu, free the work crews, and challenge Souther.|シュウを助け、労働者を解放し、サウザーに挑め。|支援修武、解放勞工，挑戰沙烏薩。
Break the army’s hold and reach the final battlefield.|軍の支配を打ち破り、最終決戦の地へ進め。|打破軍隊控制，抵達最終戰場。
Face Raoh and bring Julia home.|ラオウと対峙し、ユリアを連れ帰れ。|迎戰拉歐，帶尤加利回家。
Road tutorial|荒野の道|荒野入門
Wrecked checkpoint|崩れた検問所|破敗檢查站
Water cache|水の備蓄|儲水處
Quiet road to the gate|門へ続く静かな道|通往大門的寂靜道路
Outer houses|外縁の家々|外圍民宅
Market rescue|市場の救出|市場救援
Evacuation lane|避難路|撤離通道
Well defense|井戸の防衛|水井防衛
Gate assault|城門への攻撃|攻打城門
Ceremonial avenue|儀式の大通り|儀式大道
Palace corridor|宮殿の回廊|宮殿走廊
Quiet terrace approach|静かな露台への道|通往露臺的靜路
Convoy boarding|輸送隊への合流|登上車隊
Canyon ambush|峡谷の待ち伏せ|峽谷伏擊
Refugee rescue spur|避難民の救出|難民救援支線
Convoy travel|輸送隊の旅路|車隊旅程
Prison gate breach|獄門突破|突破獄門
Inner cell rescue|独房の救出|內部牢房救援
Inner cells|奥の独房|內部牢房
Barred galleries|鉄格子の回廊|鐵欄長廊
Captive cells|捕虜の牢|俘虜牢房
Explosive pursuit|爆炎の追跡|爆破追擊
Silent seal opening|封印の扉|開啟封印
Resistance refuge|抵抗軍の隠れ家|反抗軍避難所
Occupied work camp|占領下の作業場|遭佔領的勞動營
Canal escape|水路の脱出|運河逃脫
Shu’s sacrifice|シュウの犠牲|修武的犧牲
Pyramid terraces|聖帝十字陵の露台|金字塔露臺
Occupied streets|占領された街路|遭佔領的街道
Resistance rendezvous|抵抗軍との合流|反抗軍會合點
Army camp escape|軍営からの脱出|軍營逃脫
The Chariot Stars|南斗五車星|南斗五車星
Military yard|軍の広場|軍事廣場
Quiet approach|静かな進軍|寂靜前路
Julia at the battlefield|決戦の地のユリア|戰場上的尤加利
Club Enforcer|クラブの処刑人|梅花執行者
Shield Captain|盾隊長|盾兵隊長
Diamond|ダイヤ|方塊
Club|クラブ|梅花
Fang Chief|牙一族の長|牙一族首領
Amiba|アミバ|阿米巴
Jackal|ジャッカル|傑卡爾
Yuda|ユダ|猶大
Command Captain|指揮隊長|指揮隊長
THRUST|突き|突刺
CRUSH|粉砕打|粉碎重擊
LUNGE|突進撃|突進攻擊
DELAYED STRIKE|遅延打撃|延遲打擊
SHOTGUN — RELOAD AFTER|散弾銃・発射後に装填|霰彈槍・射擊後裝填
WHIP SWEEP|鞭の薙ぎ払い|長鞭橫掃
CHARGE|突進|衝撞
HAND SLAM|巨掌叩きつけ|巨掌重擊
ARM SWEEP|腕の薙ぎ払い|巨臂橫掃
DIVING STRIKE|急降下攻撃|俯衝攻擊
AURA BURST|闘気放出|鬥氣爆發
EXPLOSIVE|爆発物|爆裂物
`;
const dictionaries={en:{},ja:{},'zh-Hant':{}};
const cache=new Map();let compiled=null;
function add(table){cache.clear();compiled=null;for(const row of table.trim().split('\n')){const [en,ja,zh]=row.split('|');if(!zh)continue;dictionaries.ja[en]=ja;dictionaries['zh-Hant'][en]=zh;}}
add(rows);
let language='en';try{const saved=localStorage.getItem('fist-language');if(['en','ja','zh-Hant'].includes(saved))language=saved;}catch(_){}
function translate(value){
 const source=String(value),key=language+'|'+source;
 if(cache.has(key))return cache.get(key);
 const dict=dictionaries[language];let out=dict[source];
 if(out===undefined&&language==='en')out=source;
 if(out===undefined){
  if(!compiled){compiled={};for(const lang of ['ja','zh-Hant']){
   const keys=Object.keys(dictionaries[lang]).sort((a,b)=>b.length-a.length);
   compiled[lang]={lookup:Object.fromEntries(keys.map(k=>[k.toUpperCase(),dictionaries[lang][k]])),pattern:new RegExp('(?<![A-Za-z])(?:'+keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![A-Za-z])','gi')};
  }}
  const c=compiled[language];out=c.lookup[source.toUpperCase()]??source.replace(c.pattern,match=>c.lookup[match.toUpperCase()]);
  out=out.replace(/LEVEL (\d+)/g,language==='ja'?'ステージ $1':'第 $1 關').replace(/STAGE (\d+)/g,language==='ja'?'ステージ $1':'第 $1 關');
 }
 if(cache.size>2000)cache.clear();cache.set(key,out);return out;
}
function setLanguage(next){if(!['en','ja','zh-Hant'].includes(next))return;language=next;cache.clear();try{localStorage.setItem('fist-language',next);}catch(_){};if(typeof document!=='undefined'){document.documentElement?.setAttribute('lang',next);}}
function install(ctx){for(const method of ['fillText','strokeText']){const original=ctx[method].bind(ctx);ctx[method]=function(value,x,y,maxWidth){const font=this.font;if(language!=='en')this.font=font.replace(/Courier New|sans-serif|serif/g,'"Hiragino Sans", "Microsoft JhengHei", "Noto Sans CJK JP", sans-serif');const args=[translate(value),x,y];if(maxWidth!==undefined)args.push(maxWidth);original(...args);this.font=font;};}}
return {translate,setLanguage,install,add,get language(){return language;},dictionaries};
})();
