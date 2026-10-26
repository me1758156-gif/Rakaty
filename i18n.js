/* Rakah Tracker: Arabic interface.
   The app is written in English. When the language is Arabic, every piece of text that appears on the
   page (including messages the app writes later) is translated by this small dictionary.
   The choice is remembered in localStorage ("rakah-lang") and the page is reloaded when it changes. */
(function(){
  var lang = 'en';
  try{ lang = localStorage.getItem('rakah-lang') || 'en'; }catch(e){}
  window.RAKAH_LANG = lang;
  if(lang !== 'ar') return;

  document.documentElement.setAttribute('lang','ar');
  document.documentElement.setAttribute('dir','rtl');

  function rak(n){ n = +n; return n===1 ? 'ركعة' : n===2 ? 'ركعتان' : (n>=3 && n<=10) ? n+' ركعات' : n+' ركعة'; }
  function ap(x){ return x==='AM' ? 'ص' : 'م'; }

  // exact texts (normalised: plain hyphen, plain apostrophe, three dots)
  var D = {
    'Salah Companion':'رفيق الصلاة',
    'Rakah Tracker':'متتبع الركعات',
    '⚙️ Settings':'⚙️ الإعدادات',
    'Settings':'الإعدادات',
    'Colour':'اللون',
    'Language':'اللغة',
    'Pocket lock':'قفل الجيب',
    'In Motion mode the screen goes dark and ignores touches. Hold a finger on it to unlock (this also pauses counting)':'في وضع الحركة تُظلم الشاشة وتتجاهل اللمس. اضغط بإصبعك مطولاً لفتح القفل (ويُوقف العدّ مؤقتاً أيضاً)',
    'Hold to unlock':'اضغط مطولاً لفتح القفل',
    '✔ Works offline — everything is saved on this phone':'✔ يعمل بدون إنترنت — كل شيء محفوظ على هذا الهاتف',
    'Offline mode is not ready yet — open the app once with internet':'وضع عدم الاتصال غير جاهز بعد — افتح التطبيق مرة واحدة مع الإنترنت',
    'Quick start':'بداية سريعة',
    'Opens on the prayer whose time it is now, ready to track':'يفتح على الصلاة الحالية جاهزاً للتتبّع',
    'How to use':'طريقة الاستخدام',
    '? How to use':'؟ طريقة الاستخدام',
    'Blue':'أزرق','Black':'أسود','Pink':'وردي','Green':'أخضر','Red':'أحمر','Purple':'بنفسجي',
    '🧭 Qibla':'🧭 القبلة',
    'Enable Qibla':'تفعيل القبلة','Disable Qibla':'إيقاف القبلة',
    'Qibla off · tap Enable Qibla, then hold your phone flat and rotate until the Kaaba icon points to the top':'القبلة متوقفة · اضغط «تفعيل القبلة» ثم أمسك الهاتف أفقياً وأدِره حتى تشير أيقونة الكعبة إلى الأعلى',
    "Phone compasses can be wrong near metal, magnets or electronics. Always double-check the direction with a trusted source (a mosque's Qibla wall, or an official Qibla finder).":'قد تخطئ بوصلة الهاتف قرب المعادن أو المغناطيس أو الأجهزة الإلكترونية. تأكّد دائماً من الاتجاه بمصدر موثوق (محراب مسجد أو تطبيق رسمي للقبلة).',
    '✔ Compass: the phone is giving a real north reference':'✔ البوصلة: الهاتف يعطي مرجع الشمال الحقيقي',
    '⚠ Compass: the phone is NOT giving a north reference, so the direction is unreliable. Wave the phone in a figure-8, keep it away from metal, magnets and magnetic cases, then tap Disable and Enable Qibla again.':'⚠ البوصلة: الهاتف لا يعطي مرجع الشمال، فالاتجاه غير موثوق. حرّك الهاتف على شكل رقم 8، وابعده عن المعادن والمغناطيس والأغطية المغناطيسية، ثم أوقف القبلة وفعّلها من جديد.',
    'rotate until the Kaaba icon points to the top':'أدِر حتى تشير أيقونة الكعبة إلى الأعلى',
    'note: no magnetic-north correction for this location':'ملاحظة: لا يوجد تصحيح للشمال المغناطيسي لهذا الموقع',
    "GPS unavailable, using your last saved location — only valid if you haven't travelled":'تعذّر تحديد الموقع، يُستخدم آخر موقع محفوظ — صالح فقط إن لم تسافر',
    'Getting your location...':'جارٍ تحديد موقعك...',
    "Couldn't get your location. Turn on Location (GPS works without internet), step near a window or outside, and tap Enable Qibla again. Allow location for this site if asked.":'تعذّر تحديد موقعك. فعّل الموقع (يعمل GPS بدون إنترنت)، واقترب من نافذة أو اخرج، ثم اضغط «تفعيل القبلة» مرة أخرى. اسمح بالوصول إلى الموقع إذا طُلب منك.',
    "This browser doesn't support location access, needed to calculate Qibla direction.":'هذا المتصفح لا يدعم الوصول إلى الموقع اللازم لحساب اتجاه القبلة.',
    'Compass access denied · enable motion & orientation access for this site in Settings, then try again':'رُفض الوصول إلى البوصلة · فعّل إذن الحركة والاتجاه لهذا الموقع من الإعدادات ثم حاول مرة أخرى',
    'Could not request compass access on this device.':'تعذّر طلب الوصول إلى البوصلة على هذا الجهاز.',
    "No compass data received · check that this site has motion/orientation access in your browser's site settings, or that your device has a compass sensor.":'لم تصل بيانات من البوصلة · تأكد من إذن الحركة والاتجاه لهذا الموقع في إعدادات المتصفح، أو من وجود حساس بوصلة في جهازك.',
    'Next prayer':'الصلاة القادمة',
    'Alexandria':'الإسكندرية','Your location':'موقعك',
    'Fajr':'الفجر','Sunrise':'الشروق','Dhuhr':'الظهر','Asr':'العصر','Maghrib':'المغرب','Isha':'العشاء','Custom':'مخصص',
    '📍 Use my location':'📍 استخدم موقعي',
    '📍 Location updated':'📍 تم تحديث الموقع',
    'Getting location...':'جارٍ تحديد الموقع...',
    'Location not supported':'تحديد الموقع غير مدعوم',
    'Location denied · tap to retry':'رُفض الموقع · اضغط للمحاولة مرة أخرى',
    'Open as its own full-screen page →':'افتحها كصفحة كاملة ←',
    '← Open Rakah Tracker':'افتح متتبع الركعات →',
    'Calculated on your phone · Egyptian General Authority method · can differ by a few minutes from your local mosque':'تُحسب على هاتفك · طريقة الهيئة المصرية العامة للمساحة · قد تختلف بضع دقائق عن مسجدك',
    'Step 1 · Choose your prayer':'الخطوة 1 · اختر صلاتك',
    'Step 2 · How should it track?':'الخطوة 2 · كيف تريد التتبّع؟',
    'rakahs':'ركعات',
    '← Change prayer':'تغيير الصلاة →',
    'Camera · Sujud':'الكاميرا · السجود',
    'Lay the phone screen-up on your mat — the front camera senses Sujud.':'ضع الهاتف وشاشته إلى الأعلى على سجادتك — تلتقط الكاميرا الأمامية السجود.',
    'Motion · Pocket':'الحركة · الجيب',
    'Keep the phone in your pocket — it senses the bow of Sujud by feel.':'ضع الهاتف في جيبك — يستشعر حركة السجود.',
    'Motion mode':'وضع الحركة','Camera mode':'وضع الكاميرا',
    'Change':'تغيير',
    'Enable Camera':'تفعيل الكاميرا','Disable Camera':'إيقاف الكاميرا',
    'Front camera (phone screen-up)':'الكاميرا الأمامية (الشاشة إلى الأعلى)',
    'Back camera (phone screen-down)':'الكاميرا الخلفية (الشاشة إلى الأسفل)',
    'Sensitivity':'الحساسية','Low':'منخفضة','Medium':'متوسطة','High':'عالية','Recalibrate':'إعادة المعايرة',
    'Camera off · lay the phone screen-up on your mat, then tap Enable Camera':'الكاميرا متوقفة · ضع الهاتف وشاشته إلى الأعلى على سجادتك ثم اضغط «تفعيل الكاميرا»',
    'Calibrating — keep the phone still and well-lit for a second...':'جارٍ المعايرة — أبقِ الهاتف ثابتاً ومضاءً لحظة...',
    'Calibrated · watching for Sujud...':'تمت المعايرة · أراقب السجود...',
    'Dark detected — in Sujud...':'تم رصد العتمة — في السجود...',
    'Recalibrating...':'جارٍ إعادة المعايرة...',
    'Watching for Sujud...':'أراقب السجود...',
    'Sujud counted · watching...':'احتُسبت سجدة · أراقب...',
    'Enable Motion':'تفعيل الحركة','Disable Motion':'إيقاف الحركة',
    'Motion off · pocket the phone upright, stand still, then tap Enable Motion':'الحركة متوقفة · ضع الهاتف في جيبك منتصباً، وقف ساكناً، ثم اضغط «تفعيل الحركة»',
    'Motion sensors are not supported on this device/browser':'حساسات الحركة غير مدعومة في هذا الجهاز/المتصفح',
    'Motion permission denied':'رُفض إذن الحركة',
    "No motion data received — check that this site has motion access in your browser's site settings, or your device/browser may not support it":'لم تصل بيانات حركة — تأكد من إذن الحركة لهذا الموقع في إعدادات المتصفح، أو قد لا يدعمها جهازك/متصفحك',
    'Paused · nothing is counted. Tap Resume when the phone is back in your pocket':'متوقف مؤقتاً · لا يُحتسب شيء. اضغط «استئناف» عندما يعود الهاتف إلى جيبك',
    'Pause':'إيقاف مؤقت','Resume':'استئناف','Reset':'إعادة ضبط',
    'Rakah':'الركعة','SUJUD':'سجود',
    'Select a prayer':'اختر صلاة',
    'Waiting for 1st Sujud':'في انتظار السجدة الأولى',
    'Standing · waiting for 1st Sujud':'واقف · في انتظار السجدة الأولى',
    'Prayer complete':'تمّت الصلاة','Finish with Salam':'ثم التسليم',
    '2ND SUJUD MISSED':'فاتتك السجدة الثانية',
    'NO TASHAHHUD SIT':'لم تجلس للتشهّد',
    'Pick a prayer first':'اختر صلاة أولاً',
    'Prayer already complete — tap Reset to start again':'تمّت الصلاة — اضغط «إعادة ضبط» للبدء من جديد',
    'Enable the camera first':'فعّل الكاميرا أولاً',
    'Enable motion first':'فعّل الحركة أولاً',
    // first-time guide
    'Welcome':'أهلاً بك',
    "Rakah Tracker counts your prayer for you, so you never lose track of which rak'ah you are in.":'متتبع الركعات يعدّ صلاتك عنك، فلا تضيع منك الركعة أبداً.',
    'Place your phone':'ضع هاتفك',
    'Motion: keep the phone in your pocket, upright, the same way every time. Camera: lay it screen-up on your mat.':'الحركة: ضع الهاتف في جيبك منتصباً وبالطريقة نفسها كل مرة. الكاميرا: ضعه على السجادة وشاشته إلى الأعلى.',
    'Start praying':'ابدأ الصلاة',
    'Pick your prayer, tap Enable Motion, then stand still until the countdown ends. After that, just pray.':'اختر صلاتك، واضغط «تفعيل الحركة»، ثم قف ساكناً حتى ينتهي العدّ التنازلي. بعدها صلِّ فقط.',
    'What the buzzes mean':'معنى الاهتزازات',
    'Two short buzzes: a sujud was counted. One long triple buzz: a mistake (a missed sujud, or no Tashahhud sit).':'اهتزازتان قصيرتان: احتُسبت سجدة. ثلاث اهتزازات طويلة: خطأ (سجدة فاتتك، أو عدم الجلوس للتشهّد).',
    'Need to look at the screen?':'تريد النظر إلى الشاشة؟',
    "Hold a finger on the dark screen to unlock it (this also pauses counting). Tap Resume when the phone is back in your pocket. The big number is your rak'ah; the small one counts the sujuds in it.":'اضغط بإصبعك مطولاً على الشاشة المظلمة لفتحها (ويُوقف هذا العدّ مؤقتاً). اضغط «استئناف» عندما يعود الهاتف إلى جيبك. الرقم الكبير هو ركعتك، والصغير يعدّ السجدات فيها.',
    'Skip':'تخطي','Next':'التالي','Start':'ابدأ',
    'Prayer times':'مواقيت الصلاة'
  };

  function norm(s){
    return s.replace(/[\u2010\u2011]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/\u2026/g,'...');
  }

  var P = [
    [/^Rakah (\d+) of (\d+)$/, function(m){ return 'الركعة '+m[1]+' من '+m[2]; }],
    [/^Ready · (\d+) rakahs?$/, function(m){ return 'جاهز · '+rak(m[1]); }],
    [/^(\d+) rakahs?$/, function(m){ return rak(m[1]); }],
    [/^at (\d{1,2}:\d{2}) (AM|PM)$/, function(m){ return 'عند '+m[1]+' '+ap(m[2]); }],
    [/^(\d{1,2}:\d{2}) (AM|PM)$/, function(m){ return m[1]+' '+ap(m[2]); }],
    [/^(.+) \(default\)$/, function(m){ return tr(m[1])+' (افتراضي)'; }],
    [/^Pocket the phone now — calibrating in (\d+)\.\.\.$/, function(m){ return 'ضع الهاتف في جيبك الآن — المعايرة بعد '+m[1]+'...'; }],
    [/^Resuming in (\d+)\.\.\. put the phone back$/, function(m){ return 'يُستأنف بعد '+m[1]+'... أعد الهاتف إلى جيبك'; }],
    [/^Qibla is (\d+)° from North$/, function(m){ return 'القبلة '+m[1]+'° من الشمال'; }],
    [/^(\d+) km to Mecca — hold phone flat and rotate$/, function(m){ return m[1]+' كم إلى مكة — أمسك الهاتف أفقياً وأدِره'; }],
    [/^Could not get motion permission \((.*)\)$/, function(m){ return 'تعذّر الحصول على إذن الحركة ('+m[1]+')'; }],
    [/^Could not access the camera \((.*)\)$/, function(m){ return 'تعذّر الوصول إلى الكاميرا ('+m[1]+')'; }]
  ];

  function tr(core){
    var n = norm(core);
    if(D.hasOwnProperty(n)) return D[n];
    for(var i=0;i<P.length;i++){ var m = P[i][0].exec(n); if(m) return P[i][1](m); }
    if(n.indexOf(' · ') > -1){
      var parts = n.split(' · '), changed = false;
      var out = parts.map(function(p){ var t = tr(p); if(t !== p){ changed = true; return t; } return p; });
      if(changed) return out.join(' · ');
    }
    return core;
  }
  window.rakahTr = tr;

  var ARABIC = /[\u0600-\u06FF]/;
  function textNode(n){
    var p = n.parentNode;
    if(!p || (p.closest && p.closest('script,style,[data-notr]'))) return;
    var v = n.nodeValue, core = v.trim();
    if(!core || ARABIC.test(core)) return;
    var t = tr(core);
    if(t !== core) n.nodeValue = v.replace(core, t);
  }
  function walk(root){
    if(root.nodeType === 3){ textNode(root); return; }
    if(root.nodeType !== 1) return;
    if(root.matches && root.matches('script,style,[data-notr]')) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, list = [];
    while((n = w.nextNode())) list.push(n);
    list.forEach(textNode);
    if(root.querySelectorAll){
      root.querySelectorAll('[aria-label]').forEach(function(e){
        var a = e.getAttribute('aria-label'), t = tr(a);
        if(t !== a) e.setAttribute('aria-label', t);
      });
    }
  }

  function start(){
    walk(document.body);
    new MutationObserver(function(muts){
      muts.forEach(function(m){
        if(m.type === 'characterData') textNode(m.target);
        else m.addedNodes.forEach(walk);
      });
    }).observe(document.body, {childList:true, subtree:true, characterData:true});
  }
  if(document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
