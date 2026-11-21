document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════
     1. 阅读进度条
  ══════════════════════════════════════════ */
  const progressBar = document.createElement('div');
  progressBar.id = 'read-progress';
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ══════════════════════════════════════════
     2. 开场动画（Lottie）
  ══════════════════════════════════════════ */
  const introAnimation = document.getElementById('intro-animation');
  const lottieContainer = document.getElementById('lottie-container');

  if (introAnimation && lottieContainer && typeof lottie !== 'undefined') {
    document.body.style.overflow = 'hidden';
    try {
      const anim = lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: animationData
      });
      anim.addEventListener('complete', () => {
        const hint = document.createElement('div');
        hint.className = 'intro-hint';
        hint.textContent = '点击屏幕进入';
        hint.style.cssText = [
          'position:absolute',
          'bottom:calc(50px + env(safe-area-inset-bottom))',
          'left:50%',
          'transform:translateX(-50%)',
          'color:#f2d98a',
          'font-size:18px',
          'font-family:"楷体","KaiTi",serif',
          'cursor:pointer',
          'animation:hintPulse 1.5s ease-in-out infinite',
          'z-index:10000',
          'text-shadow:1px 1px 4px rgba(0,0,0,.7)',
          'letter-spacing:3px'
        ].join(';');
        introAnimation.appendChild(hint);

        const enterPage = () => {
          if (bgMusic) { bgMusic.volume = 0.3; bgMusic.play().catch(() => {}); }
          introAnimation.style.opacity = '0';
          introAnimation.style.transition = 'opacity 0.6s ease-out';
          setTimeout(() => {
            document.body.style.overflow = '';
            introAnimation.style.display = 'none';
          }, 600);
        };
        introAnimation.addEventListener('click', enterPage);
      });
    } catch (e) {
      console.error('Lottie error:', e);
      introAnimation.style.display = 'none';
      document.body.style.overflow = '';
    }
  } else if (introAnimation) {
    introAnimation.style.display = 'none';
    document.body.style.overflow = '';
  }
  // 回退：移除网格冲突解决逻辑，保持静态布局
  /* ══════════════════════════════════════════
     3. 背景音乐
  ══════════════════════════════════════════ */
  const bgMusic = document.getElementById('bgMusic');

  /* ══════════════════════════════════════════
     4. 顶部导航 · 平滑滚动 + 激活状态 + 固定定位
  ══════════════════════════════════════════ */
  const topbar = document.querySelector('.topbar');
  const topnav = document.querySelector('.topnav');
  let topnavOriginalTop = 0;
  let isTopnavFixed = false;

  // 获取导航栏原始位置
  function getTopnavOriginalTop() {
    if (topnav) {
      const rect = topnav.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      return rect.top + scrollTop;
    }
    return 0;
  }

  // 初始化原始位置
  setTimeout(() => {
    topnavOriginalTop = getTopnavOriginalTop();
  }, 100);

  // 滚动时判断是否需要固定导航栏
  function handleTopnavScroll() {
    if (!topnav) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // 当滚动超过导航栏原始位置时，固定在顶部
    if (scrollTop >= topnavOriginalTop && !isTopnavFixed) {
      isTopnavFixed = true;
      topnav.style.position = 'fixed';
      topnav.style.top = '0';
      topnav.style.left = '0';
      topnav.style.right = '0';
      topnav.style.zIndex = '1000';
      topnav.style.width = '100%';
      // 给 body 加 padding 防止内容跳动
      document.body.style.paddingTop = topnav.offsetHeight + 'px';
    } else if (scrollTop < topnavOriginalTop && isTopnavFixed) {
      isTopnavFixed = false;
      topnav.style.position = '';
      topnav.style.top = '';
      topnav.style.left = '';
      topnav.style.right = '';
      topnav.style.zIndex = '';
      topnav.style.width = '';
      document.body.style.paddingTop = '0';
    }
  }

  window.addEventListener('scroll', handleTopnavScroll, { passive: true });
  window.addEventListener('resize', () => {
    // 窗口变化时重新计算原始位置
    topnavOriginalTop = getTopnavOriginalTop();
    // 重置固定状态，重新判断
    isTopnavFixed = false;
    // 移除可能的固定样式
    if (topnav) {
      topnav.style.position = '';
      topnav.style.top = '';
      topnav.style.left = '';
      topnav.style.right = '';
      topnav.style.zIndex = '';
      topnav.style.width = '';
      document.body.style.paddingTop = '0';
    }
    // 重新处理滚动状态
    handleTopnavScroll();
  });

  document.querySelectorAll('.topnav a').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      document.querySelectorAll('.topnav a').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // 滚动时自动高亮当前导航项
  const sections = document.querySelectorAll('.region[id]');
  const navItems = document.querySelectorAll('.topnav-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(item => {
          item.classList.toggle('active', item.getAttribute('data-target') === id);
        });
        
        // 自动滚动导航栏，使当前激活的导航项可见
        const activeNavItem = document.querySelector('.topnav-item.active');
        if (activeNavItem && topnav) {
          const navRect = topnav.getBoundingClientRect();
          const itemRect = activeNavItem.getBoundingClientRect();
          
          // 检查导航项是否在导航栏可视区域内
          if (itemRect.left < navRect.left || itemRect.right > navRect.right) {
            // 滚动导航栏，使当前导航项居中
            topnav.scrollLeft = activeNavItem.offsetLeft - (navRect.width / 2) + (itemRect.width / 2);
          }
        }
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });
  sections.forEach(s => observer.observe(s));

  /* ══════════════════════════════════════════
     5. 区域入场动画（Intersection Observer）
  ══════════════════════════════════════════ */
  const regionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        regionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.region').forEach((r, i) => {
    r.style.transitionDelay = (i * 0.04) + 's';
    regionObserver.observe(r);
  });

  /* ══════════════════════════════════════════
     6. 历史时间轴
  ══════════════════════════════════════════ */
  const yearData = {
    '1366': {
      title: '1366年 · 始建吴王府',
      content: '元至正二十六年，朱元璋采纳大将冯国用"金陵龙蟠虎踞适宜建都"的建议，下令建造吴王新宫。由精通堪舆术的刘基选址设计，征发军民工匠20多万人，填平燕雀湖"改筑新城"。初称"吴王新宫"，后又称"皇城"。明故宫以紫金山富贵山为靠山，壮丽巍峨，盛极一时。'
    },
    '1367': {
      title: '1367年 · 初步竣工',
      content: '明朝吴元年（1367年）1月17日，朱元璋主持举行了隆重的开工典礼并亲祀山川之神。随后召集驻京部队数万人兴建宫城，至同年10月23日初步竣工，确立了明代宫城制度的雏形。'
    },
    '1368': {
      title: '1368年 · 明朝建立',
      content: '洪武元年（1368年），朱元璋在应天府正式即位称帝，建立明朝，以应天府为南京，并正式迁入"新宫"。明故宫正式成为明朝皇宫，朱元璋在奉天殿举行登基大典。'
    },
    '1375': {
      title: '1375年 · 大规模扩建',
      content: '洪武八年（1375年），朱元璋放弃营建中都的计划，集中力量修建南京。下诏改建大内宫殿，增设午门左右两阙及左右掖门，增建文华殿、武英殿等建筑。'
    },
    '1392': {
      title: '1392年 · 增设宫墙',
      content: '洪武二十五年（1392年），再次增建，在皇城外增设宫墙。在宫城前建造了端门、承天门、金水桥，形成"T"字型广场，向南直抵洪武门。'
    },
    '1402': {
      title: '1402年 · 靖难之役',
      content: '建文四年（1402年），靖难之役经四年战争，燕王朱棣攻破京师。战乱中"都城陷，宫中火起"，奉天殿等宫殿被烧毁，建文帝下落不明。'
    },
    '1421': {
      title: '1421年 · 迁都北京',
      content: '永乐十九年（1421年）正月初一，明成祖正式迁都北京。据《明太宗实录》记载："凡庙社、郊祀、坛场、宫殿、门阙，规制悉如南京，而高敞壮丽过之。"此后南京明故宫作为留都宫殿。'
    },
    '1645': {
      title: '1645年 · 清军占领',
      content: '顺治二年（1645年），清军入关灭南明后，改应天府为江宁府，将南京故宫改为八旗驻防城，建筑遭到很大破坏。'
    },
    '1853': {
      title: '1853年 · 太平天国',
      content: '咸丰三年（1853年）3月29日，太平天国定都南京，拆取南京故宫大量石料砖瓦修建新宫，至太平天国灭亡时，南京故宫的宫殿和宫墙已基本无存。'
    },
    '1956': {
      title: '1956年 · 省级文保',
      content: '1956年，南京明故宫被列为江苏省文物保护单位，开始受到官方保护。'
    },
    '2006': {
      title: '2006年 · 国家级文保',
      content: '2006年，南京明故宫遗址被列入全国重点文物保护单位，获得最高级别的文物保护地位。'
    },
    '2011': {
      title: '2011年 · 遗址公园开放',
      content: '2011年，明故宫遗址公园建成并对外开放，成为市民休闲文化空间。公园占地面积约29万平方米，主要展示午门、东华门、西华门、五龙桥等历史遗迹。'
    }
  };

  const yearToIndex = {
    '1366':0,'1367':1,'1368':2,'1375':3,'1392':4,'1402':5,
    '1421':6,'1645':7,'1853':8,'1956':9,'2006':10,'2011':11
  };

  function showYearDetail(year) {
    const data = yearData[year];
    if (!data) return;
    const detailBox = document.getElementById('yearDetail');
    const yearTitle = document.getElementById('yearTitle');
    const yearContent = document.getElementById('yearContent');
    if (!detailBox || !yearTitle || !yearContent) return;

    yearTitle.textContent = data.title;
    yearContent.textContent = data.content;

    const imgContainers = detailBox.querySelectorAll('div');
    imgContainers.forEach((container, index) => {
      container.style.display = yearToIndex[year] === index ? 'block' : 'none';
    });

    detailBox.style.animation = 'none';
    detailBox.offsetHeight; // reflow
    detailBox.style.animation = 'fadeInUp .4s ease';

    detailBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    document.querySelectorAll('.year').forEach(b => b.classList.remove('active'));
    document.querySelector(`.year[data-year="${year}"]`)?.classList.add('active');
  }

  // 初始化第一个年份
  setTimeout(() => {
    const firstBtn = document.querySelector('.year');
    if (firstBtn) showYearDetail(firstBtn.getAttribute('data-year'));
  }, 100);

  document.querySelectorAll('.year').forEach(btn => {
    btn.addEventListener('click', function() {
      showYearDetail(this.getAttribute('data-year'));
    });
  });

  /* ══════════════════════════════════════════
     7. 折叠卡片（通用）
  ══════════════════════════════════════════ */
  function setupToggle(titleSelector, cardSelector, syncAll = false) {
    document.querySelectorAll(titleSelector).forEach(title => {
      title.addEventListener('click', () => {
        if (syncAll) {
          const cards = document.querySelectorAll(cardSelector);
          const isCollapsed = cards[0].classList.contains('collapsed');
          cards.forEach(card => {
            if (isCollapsed) {
              card.classList.remove('collapsed');
            } else {
              card.classList.add('collapsed');
            }
          });
        } else {
          const card = title.closest(cardSelector);
          if (card) card.classList.toggle('collapsed');
        }
      });
    });
  }
  setupToggle('.achievement-title', '.achievement-card', true);
  setupToggle('.craft-title',       '.craft-card', true);
  setupToggle('.scientist-title',   '.scientist-card', true);
  setupToggle('.project-title',     '.project-card');
  setupToggle('.reference-title',   '.reference-card');

  /* ══════════════════════════════════════════
     8. 宫殿平面图交互（事件委托 · 最高可靠性）
  ══════════════════════════════════════════ */
  const palaceInfo  = document.getElementById('palace-info');
  const tooltip     = document.getElementById('palace-tooltip');
  const palaceSVG   = document.querySelector('.palace-map-container svg');

  const palaceData = {
    // ═══════════ 宫城正门 ═══════════
    'chengtian': {
      name: '承天门',
      desc: '<strong>位置：</strong>午门正前方，宫城第一道门<br><br><strong>功能：</strong>南京明故宫皇城正门，是颁发诏令、举行重大礼仪的场所，对应北京天安门的前身。<br><br><strong>现状：</strong>毁'
    },
    'wumen': {
      name: '午门（宫城正门）',
      desc: '<strong>位置：</strong>宫城南端，端门正北<br><br><strong>功能：</strong>宫城正门，俗称"五凤楼"，是皇帝举行献俘礼、颁布诏书的地方，也是明代"廷杖"刑罚的执行地，彰显皇家威严。<br><br><strong>现状：</strong>现存城台与部分墙体（午朝门公园核心），是明故宫保存最完好的遗迹'
    },
    'jinshuiqiao': {
      name: '内金水桥（内五龙桥）',
      desc: '<strong>位置：</strong>午门内，奉天门南<br><br><strong>功能：</strong>礼仪通道，区分内外朝，防火排水<br><br><strong>现状：</strong>部分桥基与河道遗址尚存'
    },
    // ═══════════ 前朝三大殿 ═══════════
    'fengtianmen': {
      name: '奉天门（大朝门）',
      desc: '<strong>位置：</strong>前朝正门，内金水桥正北<br><br><strong>功能：</strong>御门听政（皇帝日常上朝理政），召见大臣、处理日常政务<br><br><strong>现状：</strong>仅存台基遗址'
    },
    'fengtian': {
      name: '奉天殿（金銮殿）',
      desc: '<strong>位置：</strong>宫城几何中心，奉天门正北，三层汉白玉须弥座台基上<br><br><strong>功能：</strong>南京明故宫外朝正殿，是明代皇帝举行登基、大婚、册立皇后等国家级大典的核心场所，为整个宫城等级最高的建筑，后北京故宫太和殿即仿此建造。<br><br><strong>现状：</strong>台基遗址尚存（考古已探明，南北长75.5米），殿身全毁'
    },
    'huagai': {
      name: '华盖殿',
      desc: '<strong>位置：</strong>奉天殿正北，同处三层台基<br><br><strong>功能：</strong>位于奉天殿之后，是皇帝在大典前小憩、接受执事官员朝拜的过渡性殿堂，功能类似北京中和殿。<br><br><strong>现状：</strong>毁，台基并入奉天殿遗址区'
    },
    'jinshen': {
      name: '谨身殿',
      desc: '<strong>位置：</strong>华盖殿正北，同处三层台基<br><br><strong>功能：</strong>外朝三大殿之一，是皇帝举行殿试、宴请王公大臣的场所，也是大典后更衣、赐宴的地方，对应北京保和殿。<br><br><strong>现状：</strong>毁，台基遗址尚存'
    },
    // ═══════════ 后寝 ═══════════
    'qianqingmen': {
      name: '乾清门',
      desc: '<strong>位置：</strong>谨身殿正北，后宫正门<br><br><strong>功能：</strong>连接外朝与内廷的门户，是明代皇帝"御门听政"的场所，严格区分"前朝后寝"的功能布局。<br><br><strong>现状：</strong>仅存遗址'
    },
    'qianqing': {
      name: '乾清宫',
      desc: '<strong>位置：</strong>乾清门正北<br><br><strong>功能：</strong>内廷正殿，是明代皇帝日常居住、处理日常政务的核心宫殿，也是皇帝驾崩后停灵的场所。<br><br><strong>现状：</strong>毁，遗址区'
    },
    'kunning': {
      name: '坤宁宫（皇后正宫）',
      desc: '<strong>位置：</strong>后寝中轴线最北端<br><br><strong>功能：</strong>位于乾清宫之后，是明代皇后的正寝，取"天清地宁"之意，象征帝后阴阳和合的传统礼制。<br><br><strong>现状：</strong>毁'
    },
    'neihuayuan': {
      name: '内花园',
      desc: '<strong>位置：</strong>坤宁宫下方<br><br><strong>功能：</strong>内廷核心园林，是帝后日常休憩、赏景的场所，兼具礼制与休闲功能，是宫城中的自然意趣空间。<br><br><strong>现状：</strong>毁'
    },
    // ═══════════ 宫城北门 ═══════════
    'xuanwumen': {
      name: '玄武门（宫城北门）',
      desc: '<strong>位置：</strong>宫城最北端，后改称神武门<br><br><strong>功能：</strong>宫城北门，因避康熙皇帝名讳，后改称"神武门"，是后宫及物资出入的主要通道，与南侧午门形成南北轴线。<br><br><strong>现状：</strong>毁'
    },
    // ═══════════ 东路建筑 ═══════════
    'wenhua': {
      name: '文华殿区',
      desc: '<strong>位置：</strong>奉天殿东侧<br><br><strong>功能：</strong>外朝东侧偏殿，是皇帝经筵讲学、召见文臣、处理文事的场所，也曾作为太子摄事的宫殿。<br><br><strong>现状：</strong>全毁'
    },
    'chunhe': {
      name: '春和殿',
      desc: '<strong>位置：</strong>文华殿东侧<br><br><strong>功能：</strong>文华殿的配殿，辅助文华殿开展日常政务与礼仪活动。<br><br><strong>现状：</strong>全毁'
    },
    'chongren': {
      name: '',
      desc: '<strong>位置：</strong>宫城东部偏北<br><br><strong>功能：</strong>太子居住、学习、处理东宫事务<br><br><strong>现状：</strong>全毁'
    },
    'fengxiandianjiu': {
      name: '奉先殿旧址',
      desc: '<strong>位置：</strong>崇仁宫左侧<br><br><strong>功能：</strong>明代皇家祭祀祖先的家庙，是皇室缅怀先祖、举行家祭礼仪的核心场所，体现"敬天法祖"的礼制传统。<br><br><strong>现状：</strong>全毁'
    },
    'dongliugong': {
      name: '东六宫',
      desc: '<strong>位置：</strong>宫城东部，崇仁宫下方<br><br><strong>功能：</strong>分布在乾清宫两侧，是妃嫔的居住区域，形成"众星拱月"的格局，体现后宫等级秩序。<br><br><strong>现状：</strong>全毁'
    },
    'dongwusuo': {
      name: '东五所',
      desc: '<strong>位置：</strong>宫城东部，东六宫下方<br><br><strong>功能：</strong>位于东西六宫北侧，是未成年皇子、公主的居所，也用于安置宫女、宦官等内廷服务人员。<br><br><strong>现状：</strong>全毁'
    },
    // ═══════════ 西路建筑 ═══════════
    'wuying': {
      name: '武英殿区',
      desc: '<strong>位置：</strong>奉天殿西侧<br><br><strong>功能：</strong>外朝西侧偏殿，与文华殿对称分布，是皇帝处理军务、召见武将、举行武臣赐宴的场所。<br><br><strong>现状：</strong>全毁'
    },
    'renzhi': {
      name: '奉先殿',
      desc: '<strong>位置：</strong>武英殿之后<br><br><strong>功能：</strong>延续祭祀祖先功能<br><br><strong>现状：</strong>全毁'
    },
    'rouyi': {
      name: '柔仪殿',
      desc: '<strong>位置：</strong>奉先殿东侧<br><br><strong>功能：</strong>多用于佛事祭祀、帝后祈福<br><br><strong>现状：</strong>全毁'
    },
    'dashan': {
      name: '大善殿',
      desc: '<strong>位置：</strong>柔仪殿下方<br><br><strong>功能：</strong>多用于佛事祭祀、帝后祈福<br><br><strong>现状：</strong>全毁'
    },
    'jiuwufeilong': {
      name: '九五飛龍殿',
      desc: '<strong>位置：</strong>大善殿下方<br><br><strong>功能：</strong>象征皇权祥瑞，是内廷精神生活与礼制需求的体现。<br><br><strong>现状：</strong>全毁'
    },
    'cining': {
      name: '西宫',
      desc: '<strong>位置：</strong>坤宁宫西侧<br><br><strong>功能：</strong>内廷西侧的辅助宫殿群，主要用于安置太后、太妃等皇室长辈，或作为临时寝宫与政务场所。<br><br><strong>现状：</strong>全毁'
    },
    'xiliugong': {
      name: '西六宫',
      desc: '<strong>位置：</strong>宫城西部，西宫下方<br><br><strong>功能：</strong>分布在乾清宫两侧，是妃嫔的居住区域，形成"众星拱月"的格局，体现后宫等级秩序。<br><br><strong>现状：</strong>全毁'
    },
    'xiliusuo': {
      name: '西五所',
      desc: '<strong>位置：</strong>宫城西部，西六宫下方<br><br><strong>功能：</strong>位于东西六宫北侧，是未成年皇子、公主的居所，也用于安置宫女、宦官等内廷服务人员。<br><br><strong>现状：</strong>全毁'
    },
    // ═══════════ 四角角楼 ═══════════
    'jiaolou_dongbei': {
      name: '东北角楼',
      desc: '<strong>位置：</strong>宫城城墙东北隅<br><br><strong>功能：</strong>防御+礼仪，强化宫城轮廓的视觉效果<br><br><strong>现状：</strong>全毁'
    },
    'jiaolou_xibei': {
      name: '西北角楼',
      desc: '<strong>位置：</strong>宫城城墙西北隅<br><br><strong>功能：</strong>防御+礼仪<br><br><strong>现状：</strong>全毁'
    },
    'jiaolou_dongnan': {
      name: '东南角楼',
      desc: '<strong>位置：</strong>宫城城墙东南隅<br><br><strong>功能：</strong>防御+礼仪<br><br><strong>现状：</strong>全毁'
    },
    'jiaolou_xinan': {
      name: '西南角楼',
      desc: '<strong>位置：</strong>宫城城墙西南隅<br><br><strong>功能：</strong>防御+礼仪<br><br><strong>现状：</strong>全毁'
    },
  };




  // 使用事件委托，在 SVG 容器上统一监听
  if (palaceSVG && tooltip && palaceInfo) {
    // 获取 info-panel 的子元素
    const infoH4 = palaceInfo ? palaceInfo.querySelector('h4') : null;
    const infoDetail = palaceInfo ? palaceInfo.querySelector('.building-detail') : null;

    palaceSVG.addEventListener('mouseover', function(e) {
      const rect = e.target.closest('.palace-zone');
      if (!rect) return;
      const key  = rect.getAttribute('data-zone');
      const info = palaceData[key];
      if (!info) return;
      // tooltip
      tooltip.innerHTML = `<strong style="color:#f2d98a;font-size:14px">${info.name}</strong><hr style="margin:6px 0;border-color:rgba(201,168,76,.3)"><span style="font-size:12.5px">${info.desc}</span>`;
      tooltip.classList.add('visible');
      rect.style.filter = 'brightness(1.2) drop-shadow(0 0 5px rgba(200,168,76,.7))';
    });

    palaceSVG.addEventListener('mousemove', function(e) {
      const container = tooltip.parentElement;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      let x = e.clientX - cRect.left + 14;
      let y = e.clientY - cRect.top  + 14;
      if (x + 280 > cRect.width)  x = e.clientX - cRect.left - 295;
      if (y + 160 > cRect.height) y = e.clientY - cRect.top  - 170;
      tooltip.style.left = x + 'px';
      tooltip.style.top  = y + 'px';
    });

    palaceSVG.addEventListener('mouseout', function(e) {
      const rect = e.target.closest('.palace-zone');
      if (!rect) return;
      tooltip.classList.remove('visible');
      rect.style.filter = '';
    });

    // 点击 → 高亮 + 锁定 info-panel
    palaceSVG.addEventListener('click', function(e) {
      const rect = e.target.closest('.palace-zone');
      if (!rect) return;
      const key  = rect.getAttribute('data-zone');
      const info = palaceData[key];
      if (!info) return;
      if (infoH4) infoH4.textContent = info.name;
      if (infoDetail) infoDetail.innerHTML = info.desc;
      // 边框闪烁反馈
      if (palaceInfo) {
        palaceInfo.style.transition = 'border-color .2s';
        palaceInfo.style.borderColor = 'var(--gold)';
        setTimeout(() => { if (palaceInfo) palaceInfo.style.borderColor = ''; }, 1200);
      }
      // 高亮当前选中
      document.querySelectorAll('.palace-zone').forEach(r => r.style.filter = '');
      rect.style.filter = 'brightness(1.25) drop-shadow(0 0 8px rgba(201,168,76,.8))';
    });

    // Simple collision resolution: separate overlapping palace zones on first render
    setTimeout(function() {
      try {
        const zones = palaceSVG.querySelectorAll('rect.palace-zone');
        const boxes = Array.from(zones).map(rect => {
          const x = parseFloat(rect.getAttribute('x') || '0');
          const y = parseFloat(rect.getAttribute('y') || '0');
          const w = parseFloat(rect.getAttribute('width') || '0');
          const h = parseFloat(rect.getAttribute('height') || '0');
          return {rect, x, y, w, h};
        });
        // 网格布局已回退，恢复静态布局与交互
      } catch (err) { /* ignore */ }
    }, 200);
  }

  /* ══════════════════════════════════════════
     9. 数据可视化 · 柱状图动画
  ══════════════════════════════════════════ */
  const chartObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.bar-animate').forEach(bar => {
          const targetH = bar.getAttribute('data-height');
          bar.style.transition = 'height 1.2s cubic-bezier(.4,0,.2,1), y 1.2s cubic-bezier(.4,0,.2,1)';
          bar.setAttribute('height', targetH);
          const fullH = 200;
          bar.setAttribute('y', 280 - parseInt(targetH));
        });
        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.data-svg-wrap').forEach(el => chartObserver.observe(el));

  /* ══════════════════════════════════════════
     10. 浮动按钮（返回顶部 + 音乐）
  ══════════════════════════════════════════ */
  const fabTop      = document.getElementById('fabTop');
  const musicToggle = document.getElementById('musicToggle');

  function toggleFabs() {
    const show = window.scrollY > 300;
    if (fabTop)      fabTop.style.display      = show ? 'flex' : 'none';
    if (musicToggle) musicToggle.style.display = show ? 'flex' : 'none';
  }
  window.addEventListener('scroll', toggleFabs, { passive: true });
  toggleFabs();

  if (fabTop) {
    fabTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play();
        musicToggle.classList.remove('muted');
      } else {
        bgMusic.pause();
        musicToggle.classList.add('muted');
      }
    });
  }

  /* ══════════════════════════════════════════
     11. 横屏提示（所有竖屏均提示）
  ══════════════════════════════════════════ */
  function checkOrientation() {
    // 用视口宽高比判断：高度 ≥ 宽度 → 竖屏
    const isPortrait = window.innerHeight >= window.innerWidth;
    const existing = document.querySelector('.orientation-hint');
    if (existing) existing.remove();

    // 所有竖屏（任意宽度）均显示横屏提示
    if (isPortrait) {
      const hint = document.createElement('div');
      hint.className = 'orientation-hint';
      hint.innerHTML = `
        <div style="background:#fff;padding:24px 32px;border-radius:12px;max-width:340px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.25);font-family:'楷体','KaiTi',serif;">
          <div style="font-size:32px;margin-bottom:12px;">📱</div>
          <div style="font-size:16px;color:#8B0000;font-weight:bold;margin-bottom:8px;">横屏体验更佳</div>
          <div style="font-size:13px;color:#555;line-height:1.7;margin-bottom:16px;">旋转设备至横屏模式<br>信息更丰富，排版更舒适</div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            <button onclick="this.closest('.orientation-hint').remove();sessionStorage.setItem('hideRotateHint','1');" style="background:#8B0000;color:#fff;border:none;padding:9px 24px;border-radius:20px;font-size:13px;cursor:pointer;">横屏浏览</button>
            <button onclick="this.closest('.orientation-hint').remove();sessionStorage.setItem('hideRotateHint','1');" style="background:#f5f0e8;color:#8B0000;border:1px solid #c9a84c;padding:9px 20px;border-radius:20px;font-size:13px;cursor:pointer;">继续竖屏</button>
          </div>
        </div>`;
      document.body.appendChild(hint);
    }
  }
  function onOrientationChange() {
    clearTimeout(window._orientTimer);
    window._orientTimer = setTimeout(checkOrientation, 250);
  }
  window.addEventListener('orientationchange', onOrientationChange);
  window.addEventListener('resize', onOrientationChange);
  // 用户选择"继续竖屏"后当天不再提示
  if (!sessionStorage.getItem('hideRotateHint')) {
    checkOrientation();
  }

  /* ══════════════════════════════════════════
     12. 数字滚动动画（统计数字）
  ══════════════════════════════════════════ */
  function animateNumber(el, target, suffix, duration) {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const numObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        animateNumber(el, target, suffix, 1500);
        numObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.count-up').forEach(el => numObserver.observe(el));

  /* ══════════════════════════════════════════
     9. 对比研究部分折叠/展开功能
  ══════════════════════════════════════════ */
  document.querySelectorAll('.compare-section .toggle-header').forEach(header => {
    header.addEventListener('click', function() {
      const content = this.nextElementSibling;
      const icon = this.querySelector('.toggle-icon');
      
      if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
        icon.style.transform = 'rotate(0deg)';
      } else {
        content.style.display = 'none';
        icon.textContent = '▶';
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });

  // 默认展开第一个对比部分
  setTimeout(() => {
    const firstSection = document.querySelector('.compare-section');
    if (firstSection) {
      const firstContent = firstSection.querySelector('.toggle-content');
      const firstIcon = firstSection.querySelector('.toggle-icon');
      if (firstContent) firstContent.style.display = 'block';
      if (firstIcon) firstIcon.textContent = '▼';
    }
    
    // 默认折叠其他对比部分
    document.querySelectorAll('.compare-section:not(:first-child) .toggle-content').forEach(content => {
      content.style.display = 'none';
    });
    document.querySelectorAll('.compare-section:not(:first-child) .toggle-icon').forEach(icon => {
      icon.textContent = '▶';
    });
  }, 100);

  /* ══════════════════════════════════════════
     13. 问答交互功能
  ══════════════════════════════════════════ */
  document.querySelectorAll('.qa-toggle').forEach(button => {
    button.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      if (answer.classList.contains('show')) {
        answer.classList.remove('show');
        this.textContent = '显示答案';
      } else {
        answer.classList.add('show');
        this.textContent = '隐藏答案';
      }
    });
  });

  /* ══════════════════════════════════════════
     14. 选择题交互功能
  ══════════════════════════════════════════ */
  document.querySelectorAll('.choice-button').forEach(button => {
    button.addEventListener('click', function() {
      const choiceCard = this.closest('.choice-card');
      const questionId = choiceCard.getAttribute('data-question');
      const isCorrect = this.getAttribute('data-correct') === 'true';
      const resultDiv = choiceCard.querySelector('.choice-result');

      // 移除所有选项的选择状态
      choiceCard.querySelectorAll('.choice-button').forEach(b => {
        b.classList.remove('selected');
        b.classList.remove('correct');
        b.classList.remove('incorrect');
      });

      // 标记当前选项
      this.classList.add('selected');
      this.classList.add(isCorrect ? 'correct' : 'incorrect');

      // 显示结果
      resultDiv.classList.add('show');
      resultDiv.classList.remove('correct', 'incorrect');
      resultDiv.classList.add(isCorrect ? 'correct' : 'incorrect');

      // 设置结果内容
      const answerText = this.textContent;
      const explanation = this.getAttribute('data-explanation');
      const source = this.getAttribute('data-source');

      if (isCorrect) {
        resultDiv.innerHTML = `
          <strong style="color:#4CAF50;">✓ 回答正确！</strong>
          <p style="margin:8px 0 0;">正确答案是：${answerText}</p>
          ${explanation ? `<p style="margin:8px 0 0;">${explanation}</p>` : ''}
          ${source ? `<p style="margin:8px 0 0; color:#888; font-size:12px;">资料来源：${source}</p>` : ''}
        `;
      } else {
        const correctAnswer = choiceCard.querySelector('.choice-button[data-correct="true"]').textContent;
        resultDiv.innerHTML = `
          <strong style="color:#F44336;">✗ 回答错误！</strong>
          <p style="margin:8px 0 0;">正确答案是：${correctAnswer}</p>
          ${explanation ? `<p style="margin:8px 0 0;">${explanation}</p>` : ''}
          ${source ? `<p style="margin:8px 0 0; color:#888; font-size:12px;">资料来源：${source}</p>` : ''}
        `;
      }

      // 滚动到结果
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  /* ══════════════════════════════════════════
     15. 判断题交互功能
  ══════════════════════════════════════════ */
  document.querySelectorAll('.judge-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.judge-card');
      const isCorrect = this.getAttribute('data-correct') === 'true';
      const answerDiv = card.querySelector('.judge-answer');
      const explanationEl = answerDiv ? answerDiv.querySelector('.judge-explanation') : null;
      const sourceEl = answerDiv ? answerDiv.querySelector('.judge-source') : null;

      // 移除同卡片内所有按钮状态
      card.querySelectorAll('.judge-btn').forEach(b => {
        b.classList.remove('selected', 'correct', 'incorrect');
      });

      this.classList.add('selected');
      this.classList.add(isCorrect ? 'correct' : 'incorrect');

      // 显示解释
      if (answerDiv) {
        answerDiv.style.display = 'block';
        answerDiv.style.animation = 'fadeInUp .35s ease';
      }

      // 滚动到解释区
      if (answerDiv) {
        answerDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

});
