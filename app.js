// ============================================= // 深漂三口之家 · 做账工作台 v3.0 // ============================================= // ──
// 全局状态 ── let currentPage = 'dashboard'; let currentYear,
// currentMonth; let currentUser = 'wife'; // 'wife' | 'husband' let
// recordType = 'expense'; // 'expense' | 'income' let
// selectedCategory = 'living'; let selectedSubcategory = ''; let
// selectedMember = 'wife'; let selectedPayment = '微信'; let
// selectedBillDay = null; // 账单页选中的日期 let editingRecordId = null;
// 编辑中的账单ID let editingNoteId = null; let reportTab = 'expense';
// 'expense' | 'trend' | 'budget' let noteTab = 'all'; //
// 'all' | 'monthly' | 'weekly' | 'plan' // ── 常量 ── const
// STORAGE_KEY = 'family_account_book_v3'; const PAYMENTS = [ {
// id:'微信', icon:'💬', color:'#07C160' }, { id:'支付宝',
// icon:'🔵', color:'#1677FF' }, { id:'银行卡', icon:'💳',
// color:'#F59E0B' }, { id:'信用卡', icon:'💎', color:'#8B5CF6' },
// { id:'花呗', icon:'🌸', color:'#EC4899' } ]; // ── 数据模型 ──
// const APP_DATA = { family: { name: '深漂三口之家', members: [ {
// id:'wife', name:'妻子', avatar:'👩', age:32, role:'admin' }, {
// id:'husband', name:'丈夫', avatar:'👨', age:33, role:'admin' },
// { id:'kid', name:'孩子', avatar:'👦', age:8, role:'viewer' } ],
// monthlyIncomes: {}, // 按月收入，格式: {'2026-7': 30000}
// personalAllowance: 500 }, budgets: [ { id:'living',
// name:'刚需生活', ratio:0.45, amount:13500, color:'#F59E0B',
// icon:'🏠', desc:'房租/水电/三餐/通勤/日用品' }, { id:'kid',
// name:'育儿专项', ratio:0.20, amount:6000, color:'#EC4899',
// icon:'👶', desc:'学费/兴趣班/儿童饮食/医疗' }, { id:'saving',
// name:'储蓄备用', ratio:0.20, amount:6000, color:'#10B981',
// icon:'💰', desc:'应急存款/大病备用/失业缓冲' }, { id:'leisure',
// name:'人情机动', ratio:0.10, amount:3000, color:'#8B5CF6',
// icon:'🎉', desc:'出游/人情/聚餐/个人消费' }, { id:'invest',
// name:'理财增值', ratio:0.05, amount:1500, color:'#3B82F6',
// icon:'📈', desc:'基金/理财/定期存款' } ], subcategories: { living:
// ['🏠 房租/房贷','💡 水电燃气','🍚 三餐食材','🚇 通勤交通','👔
// 服饰日用品','📱 通讯网络','🏥 医疗健康','🧹 家庭杂费'], kid:
// ['📚 学费','✏️ 教辅资料','🎹 兴趣班','👕 校服','🍎
// 儿童饮食','🩺 体检医药','🧸 玩具读物','🚌 亲子出行','🏫
// 课后托管'], saving: ['💳 应急存款','🏥 大病备用','🔒
// 失业缓冲','🏦 定期存款'], leisure: ['✈️ 短途出游','🎁
// 人情往来','🍽️ 聚餐娱乐','🛍️ 个人消费','🎬 文化娱乐'], invest:
// ['📊 基金定投','💹 股票理财','🏦 定期存款','💎 其他投资'] },
// records: [], notes: [], investments: [], assets: { cash:0,
// bankCards:0, wechatAlipay:0, deposits:0, investments:0, emergency:0 },
// liabilities: [], logs: [] }; // ── 工具函数 ── function uid() {
// return 'r' + Date.now().toString(36) +
// Math.random().toString(36).slice(2,8); } function pad2(n) { return
// String(n).padStart(2,'0'); } function fmt(n) { return '¥' +
// (n||0).toLocaleString('zh-CN'); } function getMonthlyIncome(y, m) {
// const key = y + '-' + (m+1); return
// APP_DATA.family.monthlyIncomes[key] || 30000; } function
// setMonthlyIncome(y, m, val) { const key = y + '-' + (m+1);
// APP_DATA.family.monthlyIncomes[key] = val; } function shortMoney(n) {
// if (n >= 10000) return (n/10000).toFixed(1) + 'w'; if (n >= 1000)
// return (n/1000).toFixed(1) + 'k'; return String(n); } function
// weekDayLabel(dateStr) { const d = new Date(dateStr); return
// ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
// } function formatDayTitle(dateStr) { const d = new Date(dateStr); return
// (d.getMonth()+1) + '月' + d.getDate() + '日 ' +
// weekDayLabel(dateStr); } // ── 数据存取 ── function loadData() { const
// raw = localStorage.getItem(STORAGE_KEY); if (raw) { try { const saved =
// JSON.parse(raw); // 深度合并（仅合并已知字段） if (saved.family)
// Object.assign(APP_DATA.family, saved.family); if (saved.budgets &&
// Array.isArray(saved.budgets)) { saved.budgets.forEach((sb, i) => { if
// (APP_DATA.budgets[i]) Object.assign(APP_DATA.budgets[i], sb); }); }
// if (saved.records && Array.isArray(saved.records)) APP_DATA.records =
// saved.records; if (saved.notes && Array.isArray(saved.notes))
// APP_DATA.notes = saved.notes; if (saved.investments &&
// Array.isArray(saved.investments)) APP_DATA.investments =
// saved.investments; if (saved.assets && typeof saved.assets ===
// 'object') Object.assign(APP_DATA.assets, saved.assets); if
// (saved.liabilities && Array.isArray(saved.liabilities))
// APP_DATA.liabilities = saved.liabilities; if (saved.logs &&
// Array.isArray(saved.logs)) APP_DATA.logs = saved.logs; if
// (saved.subcategories && typeof saved.subcategories === 'object') { for
// (const k of Object.keys(APP_DATA.subcategories)) { if
// (saved.subcategories[k]) APP_DATA.subcategories[k] =
// saved.subcategories[k]; } } } catch(e) {
// console.warn('数据损坏，重置'); localStorage.removeItem(STORAGE_KEY);
// initFresh(); } } if (!localStorage.getItem(STORAGE_KEY)) { initFresh();
// } } function initFresh() { APP_DATA.records = []; APP_DATA.notes =
// []; APP_DATA.investments = []; APP_DATA.assets = { cash:0,
// bankCards:0, wechatAlipay:0, deposits:0, investments:0, emergency:0 };
// APP_DATA.liabilities = []; APP_DATA.logs = [{ time: nowStr(), action:
// '欢迎使用深漂三口之家做账工作台！' }]; saveData(); } function
// saveData() { localStorage.setItem(STORAGE_KEY,
// JSON.stringify(APP_DATA)); } function nowStr() { return new
// Date().toLocaleString('zh-CN'); } function addLog(action) {
// APP_DATA.logs.unshift({ time: nowStr(), action }); if
// (APP_DATA.logs.length > 100) APP_DATA.logs.length = 100; } // ──
// 获取本月账单 ── function getMonthRecords(y, m) { const prefix = y +
// '-' + pad2(m+1); return APP_DATA.records.filter(r =>
// r.date.startsWith(prefix)); } // ── Toast ── let toastTimer = null;
// function toast(msg) { const el = document.getElementById('toast');
// el.textContent = msg; el.style.display = 'block';
// clearTimeout(toastTimer); toastTimer = setTimeout(() => {
// el.style.display = 'none'; }, 2000); } // ── 确认弹窗 ── function
// confirmAction(title, msg, cb) {
// document.getElementById('confirmTitle').textContent = title;
// document.getElementById('confirmMsg').textContent = msg; const modal =
// document.getElementById('modalConfirm'); const okBtn =
// document.getElementById('btnConfirmOk'); modal.style.display =
// 'flex'; okBtn.onclick = () => { modal.style.display = 'none'; cb();
// }; document.getElementById('btnConfirmClose').onclick = () => {
// modal.style.display = 'none'; }; modal.onclick = (e) => { if
// (e.target === modal) modal.style.display = 'none'; }; }
// ============================================================ // 初始化
// ============================================================ function
// init() { const now = new Date(); currentYear = now.getFullYear();
// currentMonth = now.getMonth(); selectedBillDay =
// now.toISOString().split('T')[0]; loadData(); setupEvents();
// render(); updateHeaderAvatar(); } function setupEvents() { // 底部导航
// document.querySelectorAll('.nav-item').forEach(item => {
// item.addEventListener('click', () => { currentPage =
// item.dataset.page; document.querySelectorAll('.nav-item').forEach(n
// => n.classList.toggle('active', n.dataset.page === currentPage));
// render(); updateHeaderTitle(); }); }); // FAB
// document.getElementById('fabAdd').addEventListener('click', () =>
// openRecordModal(null)); // 记账弹窗
// document.getElementById('btnRecordClose').addEventListener('click',
// closeRecordModal);
// document.getElementById('btnRecordDelete').addEventListener('click',
// () => { if (editingRecordId) { confirmAction('删除账单',
// '确定要删除这条账单吗？此操作不可恢复。', () => { APP_DATA.records =
// APP_DATA.records.filter(r => r.id !== editingRecordId);
// addLog('删除了一条账单'); saveData(); closeRecordModal(); render();
// toast('已删除'); }); } });
// document.getElementById('modalRecord').addEventListener('click', e
// => { if (e.target === e.currentTarget) closeRecordModal(); });
// document.querySelectorAll('#typeSwitch .type-btn').forEach(btn => {
// btn.addEventListener('click', () => { recordType = btn.dataset.type;
// document.querySelectorAll('#typeSwitch .type-btn').forEach(b => {
// b.classList.remove('active','expense-active','income-active'); });
// btn.classList.add('active'); btn.classList.add(recordType ===
// 'expense' ? 'expense-active' : 'income-active'); renderCatGrid();
// }); });
// document.getElementById('btnSaveRecord').addEventListener('click',
// saveRecord); // 搜索
// document.getElementById('btnSearch').addEventListener('click',
// openSearch);
// document.getElementById('btnSearchClose').addEventListener('click',
// closeSearch);
// document.getElementById('modalSearch').addEventListener('click', e
// => { if (e.target === e.currentTarget) closeSearch(); });
// document.getElementById('inputSearch').addEventListener('input',
// doSearch); // 类别选择弹窗
// document.getElementById('btnCategoryClose').addEventListener('click',
// closeCategoryPicker);
// document.getElementById('modalCategory').addEventListener('click', e
// => { if (e.target === e.currentTarget) closeCategoryPicker(); }); //
// 通知 document.getElementById('btnNotify').addEventListener('click',
// showNotifications); // 头像切换
// document.getElementById('headerAvatar').addEventListener('click',
// toggleUser); // 日期默认今天
// document.getElementById('inputDate').value = new
// Date().toISOString().split('T')[0]; } function updateHeaderTitle() {
// const titles = { dashboard:'做账工作台', bills:'账单明细',
// reports:'数据报表', notes:'做账笔记', profile:'我的' };
// document.getElementById('headerTitle').textContent =
// titles[currentPage] || '做账工作台'; } function
// updateHeaderAvatar() { const avatar =
// document.getElementById('headerAvatar'); const member =
// APP_DATA.family.members.find(m => m.id === currentUser);
// avatar.textContent = member ? member.avatar : (currentUser === 'wife'
// ? '👩' : '👨'); avatar.className = 'header-avatar' + (currentUser
// === 'husband' ? ' husband' : ''); } function toggleUser() {
// currentUser = currentUser === 'wife' ? 'husband' : 'wife';
// selectedMember = currentUser; updateHeaderAvatar(); render();
// toast('已切换为：' + (currentUser === 'wife' ? '妻子 👩' : '丈夫
// 👨')); } function render() { const main =
// document.getElementById('mainContent'); //
// 账单页使用固定日历+滚动明细布局 main.className = 'main-content' +
// (currentPage === 'bills' ? ' bills-page' : ''); switch
// (currentPage) { case 'dashboard': main.innerHTML = renderDashboard();
// break; case 'bills': main.innerHTML = renderBills(); break; case
// 'reports': main.innerHTML = renderReports(); break; case 'notes':
// main.innerHTML = renderNotes(); break; case 'profile': main.innerHTML
// = renderProfile(); break; } } //
// ============================================================ //
// 首页仪表盘 //
// ============================================================ function
// renderDashboard() { const records = getMonthRecords(currentYear,
// currentMonth); const ti = records.filter(r => r.type ===
// 'income').reduce((s,r) => s+r.amount, 0); const te = records.filter(r
// => r.type === 'expense').reduce((s,r) => s+r.amount, 0); const
// monthlyIncome = getMonthlyIncome(currentYear, currentMonth); const
// balance = monthlyIncome - te; const saving = APP_DATA.assets.emergency +
// APP_DATA.assets.deposits; let h = ''; // 月份切换 h += '<div
// class="month-bar">'; h += '<button
// onclick="navMonth(-1)">◀</button>'; h += '<span
// class="label">' + currentYear + '年' + (currentMonth+1) +
// '月</span>'; h += '<button
// onclick="navMonth(1)">▶</button>'; h += '</div>'; // 概览卡片
// h += '<div class="overview-grid">'; h += '<div
// class="overview-card"><div class="label">月收入预算 <span
// style="font-size:10px;color:var(--primary);cursor:pointer;float:right"
// onclick="editFamily()">✏️ 修改</span></div><div class="value
// val-save">' + fmt(monthlyIncome) + '</div></div>'; h += '<div
// class="overview-card"><div
// class="label">本月记账收入</div><div class="value
// val-income">' + fmt(ti) + '</div></div>'; h += '<div
// class="overview-card"><div class="label">本月支出</div><div
// class="value val-expense">' + fmt(te) + '</div></div>'; h +=
// '<div class="overview-card"><div
// class="label">本月结余</div><div class="value ' +
// (balance>=0?'val-save':'val-danger') + '">' + fmt(balance) +
// '</div></div>'; h += '</div>'; // 储蓄高亮 h += '<div
// class="saving-card"><div
// class="label">家庭储蓄备用金（累计）</div><div
// class="value">' + fmt(saving) + '</div><div
// class="desc">应急存款 + 定期存款 · 只存不取 ·
// 家庭安全垫</div></div>'; // 快捷操作 h += '<div
// class="quick-grid">'; h += '<div class="quick-item"
// onclick="openRecordModal(null)"><div class="icon">✏️</div><div
// class="label">记一笔</div></div>'; h += '<div
// class="quick-item" onclick="switchTab(\'bills\')"><div
// class="icon">📋</div><div
// class="label">查账单</div></div>'; h += '<div
// class="quick-item" onclick="switchTab(\'reports\')"><div
// class="icon">📊</div><div
// class="label">看报表</div></div>'; h += '<div
// class="quick-item" onclick="switchTab(\'notes\')"><div
// class="icon">📝</div><div
// class="label">写笔记</div></div>'; h += '</div>'; //
// 预算执行 h += '<div class="card"><div class="card-head"><span
// class="title">五大板块预算执行</span><span class="more"
// onclick="switchTab(\'profile\')">调整预算</span></div>';
// APP_DATA.budgets.forEach(b => { const spent = records.filter(r =>
// r.type==='expense' && r.category===b.id).reduce((s,r) => s+r.amount,
// 0); const pct = b.amount > 0 ? Math.min(spent / b.amount * 100, 100) :
// 0; let status = 'safe', statusText = '剩余 ' + fmt(b.amount -
// spent); if (pct >= 90) { status = 'danger'; statusText =
// '超支预警'; } else if (pct >= 70) { status = 'warn'; statusText =
// '即将超支'; } h += '<div class="budget-item">'; h += '<div
// class="budget-row1"><span class="budget-name"><span
// class="budget-dot" style="background:'+b.color+'"</span>' +
// b.icon + ' ' + b.name + '</span><span class="budget-nums">' +
// fmt(spent) + ' / ' + fmt(b.amount) + '</span></div>'; h +=
// '<div class="progress"><div class="progress-bar ' + status +
// '" style="width:' + pct + '%;background:' + (status==='safe' ?
// b.color : '') + '"></div></div>'; h += '<div
// class="budget-row2"><span>' + b.desc + '</span><span
// style="color:' +
// (status==='safe'?'var(--text-light)':status==='warn'?'var(--warning)':'var(--danger)') +
// '">' + statusText + '</span></div>'; h += '</div>'; }); h
// += '</div>'; // 最近账单 const recent = [...records].sort((a,b) =>
// (b.createdAt||b.date).localeCompare(a.createdAt||a.date)).slice(0,
// 5); if (recent.length > 0) { h += '<div class="card"><div
// class="card-head"><span class="title">最近账单</span><span
// class="more"
// onclick="switchTab(\'bills\')">查看全部</span></div><div
// class="recent-list">'; recent.forEach(r => h += renderBillRow(r));
// h += '</div></div>'; } return h; } function navMonth(d) {
// currentMonth += d; if (currentMonth < 0) { currentMonth = 11;
// currentYear--; } if (currentMonth > 11) { currentMonth = 0;
// currentYear++; } render(); } function switchTab(page) { currentPage =
// page; document.querySelectorAll('.nav-item').forEach(n =>
// n.classList.toggle('active', n.dataset.page === page)); render();
// updateHeaderTitle(); } //
// ============================================================ // 账单页
// ============================================================ function
// renderBills() { const monthRecords = APP_DATA.records .filter(r =>
// r.date.startsWith(currentYear + '-' + pad2(currentMonth+1)))
// .sort((a,b) => b.date.localeCompare(a.date) ||
// (b.createdAt||'').localeCompare(a.createdAt||'')); const
// todayStr = new Date().toISOString().split('T')[0]; if
// (!selectedBillDay || !selectedBillDay.startsWith(currentYear + '-' +
// pad2(currentMonth+1))) { selectedBillDay = todayStr; } const mi =
// monthRecords.filter(r => r.type === 'income').reduce((s,r) =>
// s+r.amount, 0); const me = monthRecords.filter(r => r.type ===
// 'expense').reduce((s,r) => s+r.amount, 0); let h = ''; // 日历
// v2（固定顶部） h += '<div class="bill-sticky-top">'; h += '<div
// class="cal-card v2">'; h += '<div class="cal-head"><button
// onclick="navBillMonth(-1)">◀</button><span class="title">' +
// currentYear + '年' + (currentMonth+1) + '月</span><button
// onclick="navBillMonth(1)">▶</button></div>'; h +=
// renderCalendarV2(); h += '</div>'; // 月度汇总 h += '<div
// class="month-summary">'; h += '<div><div
// class="ms-label">收入</div><div class="ms-value income">' +
// fmt(mi) + '</div></div>'; h += '<div><div
// class="ms-label">支出</div><div class="ms-value expense">' +
// fmt(me) + '</div></div>'; h += '<div><div
// class="ms-label">结余</div><div class="ms-value balance">' +
// fmt(mi - me) + '</div></div>'; h += '</div>'; h +=
// '</div>'; // 明细列表（可滚动） h += '<div
// class="bill-scroll-list">'; // 按日分组明细 const days = [...new
// Set(monthRecords.map(r => r.date))].sort((a,b) =>
// b.localeCompare(a)); if (days.length === 0) { h += '<div
// class="empty" style="padding-top:40px"><div
// class="icon">📭</div><div
// class="text">本月暂无账单</div></div>'; } else {
// days.forEach(day => { const recs = monthRecords.filter(r => r.date ===
// day); const inc = recs.filter(r => r.type === 'income').reduce((s,r)
// => s+r.amount, 0); const exp = recs.filter(r => r.type ===
// 'expense').reduce((s,r) => s+r.amount, 0); h += '<div
// class="bill-day">'; h += '<div class="bill-day-head">'; h +=
// '<div class="bill-day-title">' + formatDayTitle(day) +
// '</div>'; h += '<div class="bill-day-totals">'; if (inc > 0)
// h += '<span class="inc">收 ' + fmt(inc) + '</span>'; if (exp
// > 0) h += '<span class="exp">支 ' + fmt(exp) + '</span>'; h
// += '</div></div>'; h += '<div class="bill-day-list">';
// recs.forEach(r => h += renderBillRowV2(r)); h += '</div></div>';
// }); } h += '</div>'; // 关闭 bill-scroll-list return h; } function
// navBillMonth(d) { currentMonth += d; if (currentMonth < 0) {
// currentMonth = 11; currentYear--; } if (currentMonth > 11) {
// currentMonth = 0; currentYear++; } selectedBillDay = null; render(); }
// function renderCalendarV2() { const year = currentYear, month =
// currentMonth; const daysInMonth = new Date(year, month+1, 0).getDate();
// const firstDay0 = new Date(year, month, 1).getDay(); // 0=Sun const
// firstDay = firstDay0 === 0 ? 6 : firstDay0 - 1; // 周一=0 const todayStr
// = new Date().toISOString().split('T')[0]; const prevMonthEnd = new
// Date(year, month, 0).getDate(); const prevYear = month === 0 ? year - 1
// : year; const prevMonth = month === 0 ? 11 : month - 1; const
// prevMonthStr = prevYear + '-' + pad2(prevMonth+1) + '-'; const
// nextYear = month === 11 ? year + 1 : year; const nextMonth = month ===
// 11 ? 0 : month + 1; const nextMonthStr = nextYear + '-' +
// pad2(nextMonth+1) + '-'; const totalCells = 42; const nextCells =
// totalCells - firstDay - daysInMonth; let cells = []; for (let i =
// firstDay - 1; i >= 0; i--) { const d = prevMonthEnd - i; cells.push({
// date: prevMonthStr + pad2(d), day: d, current: false, prev: true }); }
// for (let d = 1; d <= daysInMonth; d++) { cells.push({ date: year +
// '-' + pad2(month+1) + '-' + pad2(d), day: d, current: true }); } for
// (let d = 1; d <= nextCells; d++) { cells.push({ date: nextMonthStr +
// pad2(d), day: d, current: false, next: true }); } let h = '<div
// class="cal-weekdays">';
// ['周一','周二','周三','周四','周五','周六','周日'].forEach(d
// => h += '<div>' + d + '</div>'); h += '</div><div
// class="cal-grid v2">'; cells.forEach(c => { const dayRecs =
// APP_DATA.records.filter(r => r.date === c.date); const inc =
// dayRecs.filter(r => r.type === 'income').reduce((s,r) => s+r.amount,
// 0); const exp = dayRecs.filter(r => r.type ===
// 'expense').reduce((s,r) => s+r.amount, 0); const sel = c.date ===
// selectedBillDay ? ' selected' : ''; const tdy = c.date === todayStr
// ? ' today' : ''; const cur = c.current ? ' current' : '
// neighbor'; const nav = c.prev ? ', navBillMonth(-1)' : c.next ? ',
// navBillMonth(1)' : ''; h += '<div class="cal-cell v2' + cur +
// sel + tdy + '" onclick="selectDayV2(\'' + c.date + '\'' +
// nav + ')">'; h += '<div class="cal-day-num">' + c.day +
// '</div>'; if (c.current && inc > 0) h += '<div
// class="cal-day-inc">' + fmtSmall(inc) + '</div>'; if (c.current
// && exp > 0) h += '<div class="cal-day-exp">' + fmtSmall(exp) +
// '</div>'; if (sel) h += '<div class="cal-day-dot"></div>'; h
// += '</div>'; }); h += '</div>'; return h; } function fmtSmall(n)
// { if (n >= 10000) return (n/10000).toFixed(1) + 'w'; if (n >= 1000)
// return (n/1000).toFixed(1) + 'k'; return String(Math.floor(n)); }
// function selectDayV2(day, changeMonth) { if (changeMonth) changeMonth();
// selectedBillDay = day; // 打开类别选择弹窗快速记账
// openCategoryPicker(day); } let pendingCategoryDate = ''; function
// openCategoryPicker(date) { pendingCategoryDate = date; const modal =
// document.getElementById('modalCategory'); const list =
// document.getElementById('categoryList'); // 统计该日期已有的支出类别
// const dayRecords = APP_DATA.records.filter(r => r.date === date &&
// r.type === 'expense'); const used = {}; dayRecords.forEach(r =>
// used[r.category] = (used[r.category] || 0) + 1); let h = '';
// APP_DATA.budgets.forEach(b => { const count = used[b.id] || 0; h +=
// '<div class="cat-opt" onclick="pickCategory(\'' + b.id +
// '\')">' + '<div class="dot" style="background:' + b.color +
// '">' + b.icon + '</div>' + '<div class="info"><div
// class="name">' + b.name + '</div><div class="desc">' +
// b.desc + '</div></div>' + (count > 0 ? '<div
// class="used">已有 ' + count + '</div>' : '') + '</div>';
// }); // 收入选项 h += '<div class="cat-opt"
// onclick="pickCategory(\'income\')">' + '<div class="dot"
// style="background:var(--c-income)">💰</div>' + '<div
// class="info"><div class="name">收入</div><div
// class="desc">工资 / 奖金 / 其他收入</div></div>' + '</div>';
// // 其他自定义 h += '<div class="cat-opt"
// onclick="pickCategory(\'other\')">' + '<div class="dot"
// style="background:var(--text-light)">📝</div>' + '<div
// class="info"><div class="name">自定义记账</div><div
// class="desc">选择更多分类和详情</div></div>' + '</div>';
// list.innerHTML = h; modal.style.display = 'flex'; } function
// closeCategoryPicker() {
// document.getElementById('modalCategory').style.display = 'none';
// pendingCategoryDate = ''; } function pickCategory(catId) {
// closeCategoryPicker(); if (catId === 'other') { openRecordModal(null,
// pendingCategoryDate); } else if (catId === 'income') { recordType =
// 'income'; selectedCategory = 'living'; // 收入不区分板块，占位
// selectedSubcategory = '收入'; openRecordModal(null,
// pendingCategoryDate, true); } else { recordType = 'expense';
// selectedCategory = catId; selectedSubcategory = '';
// openRecordModal(null, pendingCategoryDate, true); } } function
// renderBillRow(r) { const isIncome = r.type === 'income'; const cat =
// APP_DATA.budgets.find(b => b.id === r.category); const member =
// APP_DATA.family.members.find(m => m.id === r.member); const mColor =
// r.member === 'husband' ? 'var(--c-husband-bg)' :
// 'var(--c-wife-bg)'; const mIcon = member ? member.avatar : (r.member
// === 'husband' ? '👨' : '👩'); const subLabel = r.subcategory ||
// (isIncome ? '收入' : (cat ? cat.name : '')); const payment =
// PAYMENTS.find(p => p.id === r.payment); const time = (r.createdAt &&
// r.createdAt.includes(' ')) ? r.createdAt.split('
// ')[1].substring(0,5) : ''; const payStr = payment ? ' · ' +
// payment.icon : ''; const noteStr = r.note ? r.note : ''; return
// '<div class="bill-row" onclick="openRecordModal(\'' + r.id +
// '\')">' + '<div class="avatar" style="background:' +
// mColor + '">' + mIcon + '</div>' + '<div class="info"><div
// class="cat">' + subLabel + '</div><div class="meta">' +
// noteStr + payStr + '</div></div>' + '<div class="right"><div
// class="amt ' + (isIncome?'income':'expense') + '">' +
// (isIncome?'+':'-') + fmt(r.amount) + '</div><div
// class="time">' + time + '</div></div>' + '</div>'; }
// function renderBillRowV2(r) { const isIncome = r.type === 'income';
// const cat = APP_DATA.budgets.find(b => b.id === r.category); const
// member = APP_DATA.family.members.find(m => m.id === r.member); const
// catIcon = cat ? cat.icon : '💰'; const catColor = cat ? cat.color :
// '#9CA3AF'; const subLabel = r.subcategory || (isIncome ? '收入' :
// (cat ? cat.name : '')); const payment = PAYMENTS.find(p => p.id ===
// r.payment); const time = (r.createdAt && r.createdAt.includes(' ')) ?
// r.createdAt.split(' ')[1].substring(0,5) : ''; const noteStr =
// r.note ? r.note : (payment ? payment.icon + ' ' + payment.id : '');
// return '<div class="bill-item-v2" onclick="openRecordModal(\'' +
// r.id + '\')">' + '<div class="bill-icon-v2"
// style="background:' + catColor + '">' + catIcon + '</div>' +
// '<div class="bill-info-v2"><div class="bill-cat-v2">' +
// subLabel + '</div><div class="bill-note-v2">' + noteStr +
// '</div></div>' + '<div class="bill-right-v2"><div
// class="bill-amt-v2 ' + (isIncome?'income':'expense') + '">' +
// (isIncome?'+':'-') + fmt(r.amount) + '</div><div
// class="bill-time-v2">' + time + '</div></div>' + '</div>';
// } // ============================================================ //
// 记账弹窗 // ============================================================
// function openRecordModal(recordId, date, quick) { editingRecordId =
// recordId; document.getElementById('btnRecordDelete').style.display =
// recordId ? 'block' : 'none';
// document.getElementById('modalRecordTitle').textContent = recordId ?
// '编辑账单' : '记一笔'; if (recordId) { const r =
// APP_DATA.records.find(rec => rec.id === recordId); if (r) { recordType
// = r.type; selectedCategory = r.category; selectedSubcategory =
// r.subcategory || ''; selectedMember = r.member; selectedPayment =
// r.payment || '微信'; document.getElementById('inputAmount').value
// = r.amount; document.getElementById('inputNote').value = r.note ||
// ''; document.getElementById('inputDate').value = r.date; } } else {
// if (!quick) { recordType = 'expense'; selectedCategory = 'living';
// selectedSubcategory = ''; } selectedMember = currentUser;
// selectedPayment = '微信';
// document.getElementById('inputAmount').value = '';
// document.getElementById('inputNote').value = '';
// document.getElementById('inputDate').value = date || new
// Date().toISOString().split('T')[0]; } // 类型按钮
// document.querySelectorAll('#typeSwitch .type-btn').forEach(b => {
// b.classList.remove('active','expense-active','income-active'); if
// (b.dataset.type === recordType) { b.classList.add('active');
// b.classList.add(recordType === 'expense' ? 'expense-active' :
// 'income-active'); } });
// document.getElementById('modalRecord').style.display = 'flex';
// renderCatGrid(); renderSubGrid(); renderMemberChips();
// renderPaymentChips(); // ===== 修复：强制聚焦金额输入框，调出数字键盘
// ===== const amountInput = document.getElementById('inputAmount'); if
// (amountInput) { amountInput.setAttribute('inputmode', 'decimal');
// amountInput.removeAttribute('readonly');
// amountInput.removeAttribute('disabled'); // 延迟聚焦，确保弹窗完全渲染
// setTimeout(() => { amountInput.focus(); // 部分移动浏览器需要 click()
// 来触发键盘 amountInput.click(); }, 250); } } function closeRecordModal()
// { document.getElementById('modalRecord').style.display = 'none';
// editingRecordId = null; } function renderCatGrid() {
// document.getElementById('catGrid').innerHTML = APP_DATA.budgets.map(b
// => '<div class="cat-chip' + (selectedCategory===b.id?'
// active':'') + '" onclick="pickCat(\'' + b.id + '\')">' +
// '<div class="cc-dot" style="background:' + b.color + '">' +
// b.icon + '</div>' + '<div class="cc-name">' + b.name +
// '</div></div>' ).join(''); } function pickCat(id) {
// selectedCategory = id; selectedSubcategory = ''; renderCatGrid();
// renderSubGrid(); } function renderSubGrid() { const sec =
// document.getElementById('subSection'); const subs =
// APP_DATA.subcategories[selectedCategory]; if (!subs || subs.length
// === 0) { sec.style.display = 'none'; return; } sec.style.display =
// 'block'; document.getElementById('subGrid').innerHTML = subs.map(s
// => '<span class="sub-chip' + (selectedSubcategory===s?'
// active':'') + '" onclick="pickSub(\'' +
// s.replace(/'/g,"\\'") + '\')">' + s + '</span>'
// ).join(''); } function pickSub(s) { selectedSubcategory = s;
// renderSubGrid(); } function renderMemberChips() {
// document.getElementById('memberChips').innerHTML =
// APP_DATA.family.members .filter(m => m.role !== 'viewer') .map(m =>
// '<span class="chip' + (selectedMember===m.id?' active':'') +
// '" onclick="pickMember(\'' + m.id + '\')">' + m.avatar + ' '
// + m.name + '</span>') .join(''); } function pickMember(id) {
// selectedMember = id; renderMemberChips(); } function
// renderPaymentChips() {
// document.getElementById('paymentChips').innerHTML = PAYMENTS.map(p =>
// '<span class="chip' + (selectedPayment===p.id?' active':'') +
// '" onclick="pickPayment(\'' + p.id + '\')" style="' +
// (selectedPayment===p.id?'border-color:'+p.color+';background:'+p.color+'15':'') +
// '">' + p.icon + ' ' + p.id + '</span>' ).join(''); }
// function pickPayment(id) { selectedPayment = id; renderPaymentChips(); }
// function saveRecord() { const raw =
// document.getElementById('inputAmount').value.trim(); const amount =
// parseFloat(raw); const note =
// document.getElementById('inputNote').value.trim(); const date =
// document.getElementById('inputDate').value; if (isNaN(amount) ||
// amount <= 0) { toast('请输入有效金额'); return; } if (!date) {
// toast('请选择日期'); return; } if (editingRecordId) { const r =
// APP_DATA.records.find(rec => rec.id === editingRecordId); if (r) {
// Object.assign(r, { type: recordType, amount, category: selectedCategory,
// subcategory: selectedSubcategory, member: selectedMember, date, note,
// payment: selectedPayment }); addLog('编辑了账单：' +
// (selectedSubcategory||'') + ' ' + fmt(amount)); } } else { const
// now = new Date(); const createdAt = date + ' ' +
// pad2(now.getHours()) + ':' + pad2(now.getMinutes());
// APP_DATA.records.push({ id: uid(), type: recordType, amount, category:
// selectedCategory, subcategory: selectedSubcategory, member:
// selectedMember, date, note, createdAt, payment: selectedPayment });
// const member = APP_DATA.family.members.find(m => m.id ===
// selectedMember); addLog((member?member.name:'') + '记录了' +
// (recordType==='income'?'收入':'支出') + '：' +
// (selectedSubcategory||'') + ' ' + fmt(amount)); } saveData();
// closeRecordModal(); render(); toast(editingRecordId ? '已更新' :
// '记账成功 ✓'); editingRecordId = null; } //
// ============================================================ // 搜索 //
// ============================================================ function
// openSearch() { document.getElementById('modalSearch').style.display =
// 'flex'; document.getElementById('inputSearch').value = '';
// document.getElementById('searchResults').innerHTML = '';
// setTimeout(() => document.getElementById('inputSearch').focus(),
// 300); } function closeSearch() {
// document.getElementById('modalSearch').style.display = 'none'; }
// function doSearch() { const q =
// document.getElementById('inputSearch').value.trim().toLowerCase();
// const res = document.getElementById('searchResults'); if (!q) {
// res.innerHTML = ''; return; } const matched =
// APP_DATA.records.filter(r => (r.note||'').toLowerCase().includes(q)
// || String(r.amount).includes(q) ||
// (r.subcategory||'').toLowerCase().includes(q) ||
// r.date.includes(q) ).slice(0, 20); if (matched.length === 0) {
// res.innerHTML = '<div class="empty"><div
// class="icon">🔍</div><div
// class="text">未找到匹配账单</div></div>'; } else { res.innerHTML
// = matched.map(r => renderBillRow(r)).join(''); } } //
// ============================================================ // 报表 //
// ============================================================ function
// renderReports() { const records = getMonthRecords(currentYear,
// currentMonth); const ti = records.filter(r => r.type ===
// 'income').reduce((s,r) => s+r.amount, 0); const te = records.filter(r
// => r.type === 'expense').reduce((s,r) => s+r.amount, 0); let h =
// ''; h += '<div class="month-bar"><button
// onclick="navMonth(-1)">◀</button><span class="label">' +
// currentYear + '年' + (currentMonth+1) + '月</span><button
// onclick="navMonth(1)">▶</button></div>'; h += '<div
// class="summary-grid">'; h += '<div class="summary-item"><div
// class="sl">总收入</div><div class="sv"
// style="color:var(--c-income)">' + fmt(ti) + '</div></div>'; h
// += '<div class="summary-item"><div
// class="sl">总支出</div><div class="sv"
// style="color:var(--c-expense)">' + fmt(te) + '</div></div>';
// h += '<div class="summary-item"><div
// class="sl">储蓄率</div><div class="sv"
// style="color:var(--primary)">' +
// (ti>0?((ti-te)/ti*100).toFixed(1):'0') + '%</div></div>'; h +=
// '<div class="summary-item"><div
// class="sl">预算执行率</div><div class="sv" style="color:' +
// (te<=30000?'var(--success)':'var(--danger)') + '">' +
// (te/30000*100).toFixed(1) + '%</div></div>'; h += '</div>';
// // 报表 Tab h += '<div class="report-tabs">'; h += '<div
// class="report-tab' + (reportTab==='expense'?' active':'') + '"
// onclick="setReportTab(\'expense\')">支出结构</div>'; h +=
// '<div class="report-tab' + (reportTab==='trend'?'
// active':'') + '"
// onclick="setReportTab(\'trend\')">月度趋势</div>'; h +=
// '<div class="report-tab' + (reportTab==='budget'?'
// active':'') + '"
// onclick="setReportTab(\'budget\')">预算执行</div>'; h +=
// '</div>'; if (reportTab === 'expense') h +=
// renderPieChart(records); else if (reportTab === 'trend') h +=
// renderTrendChart(); else h += renderBudgetChart(records); return h; }
// function setReportTab(t) { reportTab = t; render(); } function
// renderPieChart(records) { const expenses = records.filter(r => r.type
// === 'expense'); const total = expenses.reduce((s,r) => s+r.amount,
// 0); if (total === 0) return '<div class="chart-box"><div
// class="title">本月支出结构</div><div class="empty"><div
// class="icon">📊</div><div
// class="text">本月暂无支出数据</div></div></div>'; const byCat
// = {}; APP_DATA.budgets.forEach(b => byCat[b.id] = 0);
// expenses.forEach(r => { byCat[r.category] =
// (byCat[r.category]||0) + r.amount; }); const data =
// APP_DATA.budgets.map(b => ({ ...b, value: byCat[b.id] })).filter(b
// => b.value > 0); const cx = 120, cy = 120, r = 100; let cum = 0, paths
// = ''; data.forEach(d => { const sa = (d.value / total) * 2 *
// Math.PI; const x1 = cx + r * Math.sin(cum), y1 = cy - r *
// Math.cos(cum); const x2 = cx + r * Math.sin(cum+sa), y2 = cy - r *
// Math.cos(cum+sa); const large = sa > Math.PI ? 1 : 0; paths += '<path
// d="M' + cx + ',' + cy + ' L' + x1.toFixed(1) + ',' +
// y1.toFixed(1) + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' +
// x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z" fill="' + d.color +
// '" stroke="#fff" stroke-width="2"/>'; cum += sa; }); let h =
// '<div class="chart-box"><div
// class="title">本月支出结构</div>'; h += '<svg class="pie-svg"
// viewBox="0 0 240 240">' + paths; h += '<text x="' + cx + '"
// y="' + (cy-6) + '" text-anchor="middle" font-size="20"
// font-weight="700" fill="#1F2937">' + (total/1000).toFixed(1) +
// 'k</text>'; h += '<text x="' + cx + '" y="' + (cy+14) + '"
// text-anchor="middle" font-size="12"
// fill="#9CA3AF">总支出</text>'; h += '</svg>'; h += '<div
// class="chart-legend">'; data.forEach(d => h += '<div
// class="legend-item"><span class="legend-dot"
// style="background:' + d.color + '"></span>' + d.icon + ' ' +
// d.name + ' ' + fmt(d.value) + ' (' +
// (d.value/total*100).toFixed(1) + '%)</div>'); h +=
// '</div></div>'; return h; } function renderTrendChart() { const
// months = []; const now = new Date(); for (let i = 5; i >= 0; i--) {
// const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
// months.push({ year: d.getFullYear(), month: d.getMonth(), label:
// (d.getMonth()+1) + '月' }); } const allVals = []; months.forEach(m
// => { const recs = getMonthRecords(m.year, m.month);
// allVals.push(recs.filter(r => r.type === 'expense').reduce((s,r) =>
// s+r.amount, 0)); allVals.push(recs.filter(r => r.type ===
// 'income').reduce((s,r) => s+r.amount, 0)); }); const maxV =
// Math.max(30000, ...allVals); const bw = 28, gap = 14, cw = 320, ch =
// 200, by = ch - 35; let bars = ''; months.forEach((m, i) => { const
// recs = getMonthRecords(m.year, m.month); const exp = recs.filter(r =>
// r.type === 'expense').reduce((s,r) => s+r.amount, 0); const inc =
// recs.filter(r => r.type === 'income').reduce((s,r) => s+r.amount,
// 0); const x = 35 + i * (bw * 2 + gap); const eh = maxV > 0 ? (exp /
// maxV) * (by - 20) : 0; const ih = maxV > 0 ? (inc / maxV) * (by - 20)
// : 0; bars += '<rect x="' + x + '" y="' + (by-eh) + '"
// width="' + bw + '" height="' + eh + '" rx="4" fill="#EF4444"
// opacity="0.85"/>'; bars += '<rect x="' + (x+bw) + '" y="' +
// (by-ih) + '" width="' + bw + '" height="' + ih + '" rx="4"
// fill="#10B981" opacity="0.85"/>'; bars += '<text x="' +
// (x+bw) + '" y="' + (ch-12) + '" text-anchor="middle"
// font-size="11" fill="#6B7280">' + m.label + '</text>'; });
// const budY = by - (30000 / maxV) * (by - 20); bars += '<line
// x1="10" y1="' + budY + '" x2="' + cw + '" y2="' + budY +
// '" stroke="#F59E0B" stroke-dasharray="5,3"
// stroke-width="1.5"/>'; bars += '<text x="' + (cw-40) + '"
// y="' + (budY-6) + '" font-size="10" fill="#F59E0B">预算线
// 30k</text>'; let h = '<div class="chart-box"><div
// class="title">近6个月收支趋势</div>'; h += '<svg
// class="chart-svg" viewBox="0 0 ' + cw + ' ' + ch + '">' +
// bars + '</svg>'; h += '<div class="chart-legend">'; h +=
// '<div class="legend-item"><span class="legend-dot"
// style="background:#EF4444"></span>支出</div>'; h += '<div
// class="legend-item"><span class="legend-dot"
// style="background:#10B981"></span>收入</div>'; h += '<div
// class="legend-item"><span class="legend-dot"
// style="background:#F59E0B;width:14px;height:2px;border-radius:0"></span>预算线</div>';
// h += '</div></div>'; return h; } function
// renderBudgetChart(records) { const expenses = records.filter(r =>
// r.type === 'expense'); const bars = APP_DATA.budgets.map(b => { const
// spent = expenses.filter(r => r.category === b.id).reduce((s,r) =>
// s+r.amount, 0); return { ...b, spent }; }); const maxV =
// Math.max(...bars.map(b => Math.max(b.spent, b.amount)), 1); const bh =
// 24, gap = 8, cw = 320, ch = bars.length * (bh+gap) + 30; let svg =
// ''; bars.forEach((b, i) => { const y = i * (bh+gap) + 10; const sw =
// (b.spent / maxV) * 210; const bw = (b.amount / maxV) * 210; const pct
// = b.amount > 0 ? (b.spent / b.amount * 100).toFixed(0) : 0; svg +=
// '<text x="0" y="' + (y+15) + '" font-size="11"
// fill="#374151">' + b.icon + ' ' + b.name + '</text>'; svg +=
// '<rect x="90" y="' + y + '" width="' + bw + '" height="' +
// bh + '" rx="4" fill="' + b.color + '" opacity="0.15"/>'; svg
// += '<rect x="90" y="' + y + '" width="' + Math.max(sw,2) +
// '" height="' + bh + '" rx="4" fill="' + b.color + '"/>';
// svg += '<text x="' + (90 + Math.max(bw, sw) + 8) + '" y="' +
// (y+15) + '" font-size="11" fill="#6B7280">' + pct +
// '%</text>'; }); let h = '<div class="chart-box"><div
// class="title">预算执行对比</div>'; h += '<svg
// class="chart-svg" viewBox="0 0 ' + cw + ' ' + ch + '">' +
// svg + '</svg>'; h += '<div
// style="font-size:11px;color:var(--text-light);margin-top:8px">浅色=预算总额
// | 深色=已消费 | 右侧=执行率</div>'; h += '</div>'; return h; }
// // ============================================================ // 笔记
// // ============================================================ function
// renderNotes() { let h = ''; h += '<div class="note-tabs">'; h +=
// '<div class="note-tab' + (noteTab==='all'?' active':'') + '"
// onclick="setNoteTab(\'all\')">全部</div>'; h += '<div
// class="note-tab' + (noteTab==='monthly'?' active':'') + '"
// onclick="setNoteTab(\'monthly\')">月度复盘</div>'; h +=
// '<div class="note-tab' + (noteTab==='weekly'?' active':'') +
// '" onclick="setNoteTab(\'weekly\')">周小结</div>'; h +=
// '<div class="note-tab' + (noteTab==='plan'?' active':'') +
// '" onclick="setNoteTab(\'plan\')">规划</div>'; h +=
// '</div>'; h += '<button class="btn-new"
// onclick="openNoteModal(null)">+ 写一篇新笔记</button>'; const
// notes = noteTab === 'all' ? [...APP_DATA.notes] :
// APP_DATA.notes.filter(n => n.type === noteTab); const tl = {
// monthly:'月度复盘', weekly:'周小结', plan:'财务规划' }; if
// (notes.length === 0) { h += '<div class="empty"><div
// class="icon">📝</div><div
// class="text">暂无笔记</div></div>'; } else { notes.forEach(n =>
// { h += '<div class="note-card" onclick="openNoteModal(\'' +
// n.id + '\')">'; h += '<div class="n-date">' +
// (tl[n.type]||'笔记') + ' · ' + n.date + '</div>'; h +=
// '<div class="n-title">' + n.title + '</div>'; h += '<div
// class="n-body">' + n.content + '</div>'; h += '</div>'; });
// } return h; } function setNoteTab(t) { noteTab = t; render(); } function
// openNoteModal(noteId) { ensureNoteModal(); editingNoteId = noteId;
// document.getElementById('noteTitle').value = '';
// document.getElementById('noteContent').value = '';
// document.getElementById('noteDate').value = new
// Date().toISOString().split('T')[0];
// document.getElementById('noteModalTitle').textContent = '写笔记';
// document.getElementById('btnNoteDelete').style.display = 'none';
// const tabs = document.querySelectorAll('#noteTypeTabs .note-tab');
// tabs.forEach(t => t.classList.remove('active'));
// tabs[0].classList.add('active'); if (noteId) { const n =
// APP_DATA.notes.find(no => no.id === noteId); if (n) {
// document.getElementById('noteTitle').value = n.title;
// document.getElementById('noteContent').value = n.content;
// document.getElementById('noteDate').value = n.date;
// document.getElementById('noteModalTitle').textContent = '编辑笔记';
// document.getElementById('btnNoteDelete').style.display = 'block';
// tabs.forEach(t => t.classList.remove('active')); const target =
// document.querySelector('#noteTypeTabs .note-tab[data-nt="' +
// n.type + '"]'); if (target) target.classList.add('active'); } }
// document.getElementById('modalNote').style.display = 'flex'; }
// function closeNoteModal() {
// document.getElementById('modalNote').style.display = 'none';
// editingNoteId = null; } function ensureNoteModal() { if
// (document.getElementById('modalNote')) return; const modal =
// document.createElement('div'); modal.id = 'modalNote';
// modal.className = 'modal-overlay'; modal.innerHTML = '<div
// class="modal-sheet">' + '<div class="modal-bar"></div>' +
// '<div class="modal-header">' + '<button class="btn-text"
// id="btnNoteDelete"
// style="display:none;color:var(--danger)">删除</button>' + '<h3
// id="noteModalTitle">写笔记</h3>' + '<button class="btn-text"
// id="btnNoteClose">取消</button>' + '</div>' + '<div
// class="modal-body">' + '<div class="note-tabs"
// id="noteTypeTabs">' + '<div class="note-tab active"
// data-nt="monthly">月度复盘</div>' + '<div class="note-tab"
// data-nt="weekly">周小结</div>' + '<div class="note-tab"
// data-nt="plan">规划</div>' + '</div>' + '<div
// class="form-row"><label>标题</label><input type="text"
// id="noteTitle" placeholder="笔记标题"
// autocomplete="off"></div>' + '<div
// class="form-row"><label>内容</label><textarea id="noteContent"
// placeholder="记录收支总结、省钱心得、资金规划..."
// rows="6"></textarea></div>' + '<div
// class="form-row"><label>日期</label><input type="date"
// id="noteDate"></div>' + '<button class="btn-save"
// id="btnSaveNote">保存笔记</button>' + '</div></div>';
// document.getElementById('app').appendChild(modal);
// modal.addEventListener('click', e => { if (e.target === modal)
// closeNoteModal(); });
// document.getElementById('btnNoteClose').addEventListener('click',
// closeNoteModal);
// document.getElementById('btnSaveNote').addEventListener('click',
// saveNote);
// document.getElementById('btnNoteDelete').addEventListener('click',
// () => { if (editingNoteId) { confirmAction('删除笔记',
// '确定要删除这篇笔记吗？', () => { APP_DATA.notes =
// APP_DATA.notes.filter(n => n.id !== editingNoteId);
// addLog('删除了一篇笔记'); saveData(); closeNoteModal(); render();
// toast('已删除'); }); } }); modal.querySelectorAll('#noteTypeTabs
// .note-tab').forEach(tab => { tab.addEventListener('click', () => {
// modal.querySelectorAll('#noteTypeTabs .note-tab').forEach(t =>
// t.classList.remove('active')); tab.classList.add('active'); }); });
// } function saveNote() { const title =
// document.getElementById('noteTitle').value.trim(); const content =
// document.getElementById('noteContent').value.trim(); const date =
// document.getElementById('noteDate').value; if (!title) {
// toast('请输入标题'); return; } if (!content) { toast('请输入内容');
// return; } const activeTab = document.querySelector('#noteTypeTabs
// .note-tab.active'); const type = activeTab ? activeTab.dataset.nt :
// 'monthly'; if (editingNoteId) { const n = APP_DATA.notes.find(no =>
// no.id === editingNoteId); if (n) { Object.assign(n, { type, title,
// content, date }); addLog('编辑了笔记：' + title); } } else {
// APP_DATA.notes.unshift({ id: uid(), type, title, content, date });
// addLog('添加了笔记：' + title); } saveData(); closeNoteModal();
// render(); toast('笔记已保存'); editingNoteId = null; } //
// ============================================================ // 个人中心
// ============================================================ function
// renderProfile() { const totalAssets =
// Object.values(APP_DATA.assets).reduce((s,v) => s+v, 0); const health =
// calcHealth(); let h = ''; // 头部 h += '<div
// class="profile-top">'; h += '<div class="row1"><div
// class="pf-avatar">👨‍👩‍👦</div><div><div class="pf-name">' +
// APP_DATA.family.name + '</div><div class="pf-sub">双职工家庭 ·
// 各月收入可独立设置</div><div class="pf-edit"
// onclick="editFamily()">修改信息</div></div></div>'; h +=
// '<div class="health-row"><div class="health-score">' +
// health + '</div><div class="health-info"><div
// class="hl">家庭财务健康评分</div><div class="hd">' +
// (health>=80?'财务状况良好，继续保持 👍':health>=60?'部分板块需优化
// ⚡':'建议调整支出结构 ⚠️') + '</div></div></div>'; h +=
// '</div>'; // 资产 h += '<div class="card"><div
// class="card-head"><span class="title">家庭资产总览</span><span
// class="more" onclick="editAssets()">编辑</span></div>'; h +=
// '<div
// style="font-size:28px;font-weight:700;color:var(--primary);margin-bottom:12px">' +
// fmt(totalAssets) + '</div>'; h += '<div
// style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12px;color:var(--text-secondary)">';
// h += '<div>现金 ' + fmt(APP_DATA.assets.cash) + '</div>'; h +=
// '<div>银行卡 ' + fmt(APP_DATA.assets.bankCards) + '</div>'; h +=
// '<div>微信/支付宝 ' + fmt(APP_DATA.assets.wechatAlipay) +
// '</div>'; h += '<div>定期存款 ' +
// fmt(APP_DATA.assets.deposits) + '</div>'; h += '<div>理财投资
// ' + fmt(APP_DATA.assets.investments) + '</div>'; h +=
// '<div>应急储备 ' + fmt(APP_DATA.assets.emergency) + '</div>'; h
// += '</div></div>'; // 预算 h += '<div class="card"><div
// class="card-head"><span
// class="title">五大板块预算配置</span><span class="more"
// onclick="editBudgets()">调整</span></div>';
// APP_DATA.budgets.forEach(b => { h += '<div
// class="budget-row"><span class="br-name">' + b.icon + ' ' +
// b.name + '</span><span class="br-amt">' + fmt(b.amount) + '
// <span
// style="color:var(--text-light);font-weight:400;font-size:11px">' +
// (b.ratio*100).toFixed(0) + '%</span></span></div>'; }); h +=
// '</div>'; // 成员 h += '<div class="card"><div
// class="card-head"><span class="title">家庭成员</span><span
// class="more" onclick="editMembers()">编辑</span></div>';
// APP_DATA.family.members.forEach(m => { h += '<div
// class="member-row"><div class="mr-avatar">' + m.avatar +
// '</div><div class="mr-info"><div class="mr-name">' +
// m.name + ' · ' + m.age + '岁</div><div class="mr-role">' +
// (m.role==='admin'?'管理员 · 可记账/编辑':'仅查看') +
// '</div></div></div>'; }); h += '</div>'; // 功能菜单 h +=
// '<div class="menu-group">'; h += '<div class="menu-item"
// onclick="showNotifications()"><div class="left"><span
// class="mi-icon">🔔</span><span
// class="mi-label">消息通知</span></div><span
// class="mi-arrow">›</span></div>'; h += '<div
// class="menu-item" onclick="showLogs()"><div class="left"><span
// class="mi-icon">📜</span><span
// class="mi-label">操作日志</span></div><span
// class="mi-arrow">›</span></div>'; h += '<div
// class="menu-item" onclick="exportCSV()"><div
// class="left"><span class="mi-icon">📤</span><span
// class="mi-label">导出账单</span></div><span
// class="mi-arrow">›</span></div>'; h += '<div class="menu-item
// danger" onclick="doReset()"><div class="left"><span
// class="mi-icon">🔄</span><span
// class="mi-label">重置数据</span></div><span
// class="mi-arrow">›</span></div>'; h += '</div>'; // 理财台账
// h += '<div class="menu-group"><div
// class="gtitle">理财台账</div>'; if (APP_DATA.investments.length
// === 0) { h += '<div class="menu-item"
// onclick="editInvestments()"><div class="left"><span
// class="mi-icon">📊</span><span
// class="mi-label">添加投资项目</span></div><span
// class="mi-arrow">›</span></div>'; } else {
// APP_DATA.investments.forEach(inv => { const profit = inv.currentValue -
// inv.principal; const pp = inv.principal > 0 ?
// (profit/inv.principal*100).toFixed(1) : '0'; h += '<div
// class="menu-item" onclick="editInvestments()"><div
// class="left"><span class="mi-icon">📊</span><div><div
// class="mi-label">' + inv.name + '</div><div
// style="font-size:11px;color:var(--text-light)">本金 ' +
// fmt(inv.principal) + ' · 月投 ' + fmt(inv.monthlyAdd) +
// '</div></div></div><div style="text-align:right"><div
// style="font-size:14px;font-weight:600">' + fmt(inv.currentValue) +
// '</div><div style="font-size:11px;color:' +
// (profit>=0?'var(--success)':'var(--danger)') + '">' +
// (profit>=0?'+':'') + pp + '%</div></div></div>'; }); } h +=
// '<div class="menu-item" onclick="editInvestments()"><div
// class="left"><span class="mi-icon">⚙️</span><span
// class="mi-label">管理台账</span></div><span
// class="mi-arrow">›</span></div>'; h += '</div>'; h +=
// '<div class="footer-text">深漂三口之家 · 做账工作台
// v3.0<br>所有数据均保存在本地浏览器<br>数据仅您可见，安全放心</div>';
// return h; } function calcHealth() { let s = 70; const recs =
// getMonthRecords(currentYear, currentMonth); const te = recs.filter(r =>
// r.type==='expense').reduce((s,r) => s+r.amount, 0); const ti =
// recs.filter(r => r.type==='income').reduce((s,r) => s+r.amount, 0);
// const sr = ti > 0 ? (ti-te)/ti : 0; if (sr >= 0.3) s += 15; else if
// (sr >= 0.15) s += 8; else s -= 5; if (te <= 27000) s += 10; else if
// (te <= 30000) s += 5; else s -= 10; if (APP_DATA.assets.emergency >=
// 30000) s += 5; else s -= 3; return Math.max(0, Math.min(100, s)); } //
// ============================================================ //
// 编辑弹窗（家庭/资产/预算/成员/投资） //
// ============================================================ function
// editFamily() { let modal = document.getElementById('modalFamily'); if
// (!modal) { modal = document.createElement('div'); modal.id =
// 'modalFamily'; modal.className = 'modal-overlay'; modal.innerHTML =
// '<div class="modal-sheet"><div class="modal-bar"></div><div
// class="modal-header"><h3>家庭设置</h3><button class="btn-text"
// id="btnFamilyClose">取消</button></div><div class="modal-body"
// id="familyForm"></div></div>';
// document.getElementById('app').appendChild(modal);
// modal.addEventListener('click', e => { if (e.target === modal)
// modal.style.display = 'none'; });
// document.getElementById('btnFamilyClose').addEventListener('click',
// () => modal.style.display = 'none'); } const income =
// getMonthlyIncome(currentYear, currentMonth); let f = ''; f += '<div
// class="form-row"><label>家庭名称</label><input type="text"
// id="fam_name" value="' + APP_DATA.family.name + '"
// style="flex:1;padding:10px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"></div>'; f +=
// '<div class="form-row"><label>当前月收入</label><input
// type="number" id="fam_income" value="' + income + '"
// step="100" style="flex:1;padding:10px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"><span
// style="font-size:12px;color:var(--text-light);margin-left:4px">元</span></div>';
// f += '<p
// style="font-size:12px;color:var(--text-light);margin-bottom:12px">仅修改
// <b>' + currentYear + '年' + (currentMonth+1) + '月</b>
// 的收入，其他月份不受影响。</p>'; f += '<div
// class="form-row"><label>零花钱</label><input type="number"
// id="fam_allow" value="' + APP_DATA.family.personalAllowance + '"
// step="10" style="flex:1;padding:10px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"><span
// style="font-size:12px;color:var(--text-light);margin-left:4px">元/人</span></div>';
// f += '<button class="btn-save"
// id="btnSaveFamily">保存</button>';
// document.getElementById('familyForm').innerHTML = f;
// document.getElementById('btnSaveFamily').onclick = () => { const name
// = document.getElementById('fam_name').value.trim(); const val =
// parseFloat(document.getElementById('fam_income').value); const allow =
// parseFloat(document.getElementById('fam_allow').value); if (!name) {
// toast('请输入家庭名称'); return; } if (isNaN(val) || val <= 0) {
// toast('请输入有效收入'); return; } if (isNaN(allow) || allow < 0) {
// toast('请输入有效零花钱'); return; } APP_DATA.family.name = name;
// APP_DATA.family.personalAllowance = allow; setMonthlyIncome(currentYear,
// currentMonth, val); APP_DATA.budgets.forEach(b => { b.ratio = val > 0
// ? b.amount / val : 0; }); addLog('设置 ' + currentYear + '年' +
// (currentMonth+1) + '月收入为 ' + fmt(val)); saveData();
// modal.style.display = 'none'; render(); toast('已更新'); };
// modal.style.display = 'flex'; } function editAssets() { let modal =
// document.getElementById('modalAssets'); if (!modal) { modal =
// document.createElement('div'); modal.id = 'modalAssets';
// modal.className = 'modal-overlay'; modal.innerHTML = '<div
// class="modal-sheet"><div class="modal-bar"></div><div
// class="modal-header"><h3>编辑资产</h3><button class="btn-text"
// id="btnAssetsClose">取消</button></div><div class="modal-body"
// id="assetsForm"></div></div>';
// document.getElementById('app').appendChild(modal);
// modal.addEventListener('click', e => { if (e.target === modal)
// modal.style.display = 'none'; });
// document.getElementById('btnAssetsClose').addEventListener('click',
// () => modal.style.display = 'none'); } const labels = {
// cash:'现金', bankCards:'银行卡', wechatAlipay:'微信/支付宝',
// deposits:'定期存款', investments:'理财投资', emergency:'应急储备'
// }; const a = APP_DATA.assets; let f = ''; for (const [k, lbl] of
// Object.entries(labels)) { f += '<div class="form-row"><label
// style="width:80px">' + lbl + '</label><input type="number"
// id="ast_' + k + '" value="' + a[k] + '" step="0.01"
// style="flex:1;padding:10px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"></div>'; } f +=
// '<button class="btn-save"
// id="btnSaveAssets">保存资产</button>';
// document.getElementById('assetsForm').innerHTML = f;
// document.getElementById('btnSaveAssets').onclick = () => { for (const
// k of Object.keys(labels)) { const v =
// parseFloat(document.getElementById('ast_' + k).value); if (!isNaN(v)
// && v >= 0) APP_DATA.assets[k] = v; } addLog('更新了家庭资产数据');
// saveData(); modal.style.display = 'none'; render();
// toast('资产已更新'); }; modal.style.display = 'flex'; } function
// editBudgets() { let modal = document.getElementById('modalBudgets');
// if (!modal) { modal = document.createElement('div'); modal.id =
// 'modalBudgets'; modal.className = 'modal-overlay'; modal.innerHTML =
// '<div class="modal-sheet"><div class="modal-bar"></div><div
// class="modal-header"><h3>调整预算金额</h3><button
// class="btn-text" id="btnBudgetsClose">取消</button></div><div
// class="modal-body" id="budgetsForm"></div></div>';
// document.getElementById('app').appendChild(modal);
// modal.addEventListener('click', e => { if (e.target === modal)
// modal.style.display = 'none'; });
// document.getElementById('btnBudgetsClose').addEventListener('click',
// () => modal.style.display = 'none'); } const income =
// getMonthlyIncome(currentYear, currentMonth); let f = '<p
// style="font-size:12px;color:var(--text-light);margin-bottom:12px">' +
// currentYear + '年' + (currentMonth+1) + '月收入基准：' +
// fmt(income) + '，比例将自动计算</p>'; APP_DATA.budgets.forEach(b =>
// { f += '<div class="form-row"><label style="width:70px">' +
// b.icon + ' ' + b.name + '</label><input type="number"
// id="bgt_' + b.id + '" value="' + b.amount + '" step="100"
// style="flex:1;padding:10px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"><span
// style="font-size:12px;color:var(--text-light);margin-left:4px">元</span></div>';
// }); f += '<button class="btn-save"
// id="btnSaveBudgets">保存预算</button>';
// document.getElementById('budgetsForm').innerHTML = f;
// document.getElementById('btnSaveBudgets').onclick = () => { const
// income = getMonthlyIncome(currentYear, currentMonth);
// APP_DATA.budgets.forEach(b => { const v =
// parseFloat(document.getElementById('bgt_' + b.id).value); if
// (!isNaN(v) && v >= 0) { b.amount = v; b.ratio = income > 0 ? v /
// income : 0; } }); addLog('调整了五大板块预算配置'); saveData();
// modal.style.display = 'none'; render(); toast('预算已更新'); };
// modal.style.display = 'flex'; } // ── 头像预设列表 ── const
// AVATAR_PRESETS = [ // 女性
// ['👩','👩🏻','👩🏼','👩🏽','👩🏾','👩🏿','👩‍🦰','👩‍🦱','👩‍🦳','👩‍🦲','👱‍♀️','👸','🤱','🙋‍♀️','🙆‍♀️','💁‍♀️','🤷‍♀️'],
// // 男性
// ['👨','👨🏻','👨🏼','👨🏽','👨🏾','👨🏿','👨‍🦰','👨‍🦱','👨‍🦳','👨‍🦲','👱‍♂️','🤴','🙋‍♂️','🙆‍♂️','💁‍♂️','🤷‍♂️'],
// // 小孩
// ['👦','👦🏻','👦🏼','👦🏽','👦🏾','👦🏿','👧','👧🏻','👧🏼','👧🏽','👧🏾','👧🏿','🧒','👶','🧑','🧑🏻','🧑🏼'],
// // 趣味
// ['🐱','🐶','🐼','🐨','🐰','🦊','🐸','🐵','🐯','🦁','🐮','🐷','🐔','🐙','🦄','🐳','🌟','🔥','💎','🎀'],
// // 表情
// ['😊','😎','🤩','🥳','😇','🤗','😄','😆','🥰','😍','🤓','🧐','😤','😈','🤖','👻','🎃','🤡','💩','👽']
// ]; function editMembers() { let modal =
// document.getElementById('modalMembers'); if (!modal) { modal =
// document.createElement('div'); modal.id = 'modalMembers';
// modal.className = 'modal-overlay'; modal.innerHTML = '<div
// class="modal-sheet"><div class="modal-bar"></div><div
// class="modal-header"><h3>编辑家庭成员</h3><button
// class="btn-text" id="btnMembersClose">取消</button></div><div
// class="modal-body" id="membersForm"></div></div>';
// document.getElementById('app').appendChild(modal);
// modal.addEventListener('click', e => { if (e.target === modal)
// modal.style.display = 'none'; });
// document.getElementById('btnMembersClose').addEventListener('click',
// () => modal.style.display = 'none'); } let f = '';
// APP_DATA.family.members.forEach(m => { f += '<div
// style="background:var(--bg);border-radius:10px;padding:14px;margin-bottom:12px">';
// f += '<div
// style="font-size:14px;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:6px"><span
// style="font-size:24px" id="mem_preview_' + m.id + '">' +
// m.avatar + '</span>' + m.name + '</div>'; // 头像选择器 f +=
// '<div style="margin-bottom:10px"><div
// style="font-size:12px;color:var(--text-light);margin-bottom:6px">选择头像</div>';
// f += '<div class="avatar-picker" id="avPick_' + m.id + '">';
// AVATAR_PRESETS.forEach((group, gi) => { f += '<div
// class="avatar-group">'; group.forEach(emoji => { f += '<span
// class="avatar-opt' + (m.avatar === emoji ? ' active' : '') + '"
// data-av="' + emoji + '" onclick="pickAvatarEl(\'' + m.id +
// '\',\'' + emoji + '\')">' + emoji + '</span>'; }); f +=
// '</div>'; }); f += '</div>'; // 自定义输入 f += '<div
// class="form-row"><label>自定义</label><input type="text"
// id="mem_av_' + m.id + '" value="' + m.avatar + '"
// placeholder="输入任意emoji或文字"
// oninput="updateAvatarPreview(\'' + m.id + '\',this.value)"
// style="flex:1;padding:8px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"></div>'; f +=
// '</div>'; // 姓名/年龄/角色 f += '<div
// class="form-row"><label>姓名</label><input type="text"
// id="mem_nm_' + m.id + '" value="' + m.name + '"
// style="flex:1;padding:8px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"></div>'; f +=
// '<div class="form-row"><label>年龄</label><input
// type="number" id="mem_ag_' + m.id + '" value="' + m.age + '"
// style="flex:1;padding:8px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"></div>'; f +=
// '<div class="form-row"><label>角色</label><select
// id="mem_rl_' + m.id + '" style="flex:1;padding:8px;border:1px
// solid var(--border);border-radius:8px;font-size:14px"><option
// value="admin" ' + (m.role==='admin'?'selected':'') +
// '>管理员</option><option value="viewer" ' +
// (m.role==='viewer'?'selected':'') +
// '>查看者</option></select></div>'; f += '</div>'; }); f +=
// '<button class="btn-save"
// id="btnSaveMembers">保存成员</button>';
// document.getElementById('membersForm').innerHTML = f; // 保存
// document.getElementById('btnSaveMembers').onclick = () => {
// APP_DATA.family.members.forEach(m => { const avInput =
// document.getElementById('mem_av_' + m.id); m.avatar = (avInput &&
// avInput.value.trim()) ? avInput.value.trim() : m.avatar; m.name =
// document.getElementById('mem_nm_' + m.id)?.value || m.name; m.age =
// parseInt(document.getElementById('mem_ag_' + m.id)?.value) ||
// m.age; m.role = document.getElementById('mem_rl_' + m.id)?.value ||
// m.role; }); addLog('更新了家庭成员信息'); saveData();
// modal.style.display = 'none'; render(); toast('成员信息已更新 ✓');
// updateHeaderAvatar(); }; modal.style.display = 'flex'; } //
// 全局：在弹窗中选头像 function pickAvatarEl(memberId, emoji) { const
// input = document.getElementById('mem_av_' + memberId); if (input)
// input.value = emoji; updateAvatarPreview(memberId, emoji); // 高亮 const
// picker = document.getElementById('avPick_' + memberId); if (picker) {
// picker.querySelectorAll('.avatar-opt').forEach(el =>
// el.classList.toggle('active', el.dataset.av === emoji)); } } function
// updateAvatarPreview(memberId, val) { const preview =
// document.getElementById('mem_preview_' + memberId); if (preview)
// preview.textContent = val || '👤'; // 同步高亮 const picker =
// document.getElementById('avPick_' + memberId); if (picker) {
// picker.querySelectorAll('.avatar-opt').forEach(el =>
// el.classList.toggle('active', el.dataset.av === val)); } } function
// editInvestments() { let modal =
// document.getElementById('modalInvest'); if (!modal) { modal =
// document.createElement('div'); modal.id = 'modalInvest';
// modal.className = 'modal-overlay'; modal.innerHTML = '<div
// class="modal-sheet"><div class="modal-bar"></div><div
// class="modal-header"><h3>理财台账</h3><button class="btn-text"
// id="btnInvestClose">取消</button></div><div class="modal-body"
// id="investForm"></div></div>';
// document.getElementById('app').appendChild(modal);
// modal.addEventListener('click', e => { if (e.target === modal)
// modal.style.display = 'none'; });
// document.getElementById('btnInvestClose').addEventListener('click',
// () => modal.style.display = 'none'); } renderInvestForm();
// modal.style.display = 'flex'; } function renderInvestForm() { let h =
// ''; APP_DATA.investments.forEach((inv, i) => { h += '<div
// style="background:var(--bg);border-radius:10px;padding:12px;margin-bottom:10px">';
// h += '<div
// style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span
// style="font-size:13px;font-weight:600">项目 #' + (i+1) +
// '</span><button onclick="delInvest(\'' + inv.id + '\')"
// style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px">删除</button></div>';
// h += '<div class="form-row"><label>名称</label><input
// type="text" id="inv_nm_' + inv.id + '" value="' + inv.name +
// '" style="flex:1;padding:8px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"></div>'; h +=
// '<div class="form-row"><label>本金</label><input
// type="number" id="inv_pr_' + inv.id + '" value="' +
// inv.principal + '" step="0.01" style="flex:1;padding:8px;border:1px
// solid var(--border);border-radius:8px;font-size:14px"></div>'; h
// += '<div class="form-row"><label>现值</label><input
// type="number" id="inv_cv_' + inv.id + '" value="' +
// inv.currentValue + '" step="0.01"
// style="flex:1;padding:8px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"></div>'; h +=
// '<div class="form-row"><label>月投</label><input
// type="number" id="inv_ma_' + inv.id + '" value="' +
// inv.monthlyAdd + '" step="0.01"
// style="flex:1;padding:8px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"></div>'; h +=
// '<div class="form-row"><label>备注</label><input type="text"
// id="inv_nt_' + inv.id + '" value="' + (inv.note||'') + '"
// style="flex:1;padding:8px;border:1px solid
// var(--border);border-radius:8px;font-size:14px"></div>'; h +=
// '</div>'; }); h += '<button class="btn-save"
// onclick="addInvest()"
// style="background:var(--success);margin-bottom:8px">+
// 新增投资项目</button>'; h += '<button class="btn-save"
// id="btnSaveInvest">保存台账</button>';
// document.getElementById('investForm').innerHTML = h;
// document.getElementById('btnSaveInvest').onclick = () => {
// APP_DATA.investments.forEach(inv => { inv.name =
// document.getElementById('inv_nm_' + inv.id)?.value || inv.name;
// inv.principal = parseFloat(document.getElementById('inv_pr_' +
// inv.id)?.value) || inv.principal; inv.currentValue =
// parseFloat(document.getElementById('inv_cv_' + inv.id)?.value) ||
// inv.currentValue; inv.monthlyAdd =
// parseFloat(document.getElementById('inv_ma_' + inv.id)?.value) ||
// inv.monthlyAdd; inv.note = document.getElementById('inv_nt_' +
// inv.id)?.value || ''; }); addLog('更新了理财台账'); saveData();
// document.getElementById('modalInvest').style.display = 'none';
// render(); toast('台账已保存'); }; } function addInvest() {
// APP_DATA.investments.push({ id: uid(), name:'新投资项目', principal:0,
// currentValue:0, monthlyAdd:0, note:'' }); renderInvestForm(); }
// function delInvest(id) { confirmAction('删除项目',
// '确定要删除这个投资项目吗？', () => { APP_DATA.investments =
// APP_DATA.investments.filter(inv => inv.id !== id); renderInvestForm();
// }); } // ============================================================ //
// 通知 / 日志 / 导出 / 重置 //
// ============================================================ function
// showNotifications() { const records = getMonthRecords(currentYear,
// currentMonth); const warnings = []; APP_DATA.budgets.forEach(b => {
// const spent = records.filter(r => r.type==='expense' &&
// r.category===b.id).reduce((s,r) => s+r.amount, 0); const pct = b.amount
// > 0 ? spent/b.amount*100 : 0; if (pct >= 90) warnings.push({
// type:'danger', icon:'🚨', title: b.name+'板块超支预警', desc:
// '已消费 '+fmt(spent)+'，预算 '+fmt(b.amount)+'，使用率
// '+pct.toFixed(0)+'%', time:'刚刚' }); else if (pct >= 70)
// warnings.push({ type:'warn', icon:'⚡', title:
// b.name+'板块即将超支', desc: '已消费 '+fmt(spent)+'，剩余
// '+fmt(b.amount-spent), time:'刚刚' }); }); const all =
// [...warnings, ...APP_DATA.logs.slice(0,10).map(l => ({
// type:'info', icon:'📋', title:l.action, desc:'', time:l.time
// }))]; let h = ''; if (all.length === 0) h += '<div
// class="empty"><div class="icon">🔔</div><div
// class="text">暂无通知</div></div>'; else all.forEach(n => {
// const bg =
// n.type==='danger'?'#FEE2E2':n.type==='warn'?'#FEF3C7':'var(--primary-bg)';
// h += '<div class="bill-row"
// style="cursor:default;align-items:flex-start"><div
// style="width:36px;height:36px;border-radius:50%;background:'+bg+';display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">'+n.icon+'</div><div
// class="info"><div class="cat"
// style="font-size:13px">'+n.title+'</div>'+(n.desc?'<div
// class="meta">'+n.desc+'</div>':'')+'<div
// style="font-size:11px;color:var(--text-light)">'+n.time+'</div></div></div>';
// }); document.getElementById('modalSearch').style.display = 'flex';
// document.getElementById('searchResults').innerHTML = h;
// document.getElementById('inputSearch').style.display = 'none'; }
// function showLogs() { let h = ''; APP_DATA.logs.forEach(l => { h +=
// '<div class="bill-row" style="cursor:default"><div
// style="width:36px;height:36px;border-radius:50%;background:var(--primary-bg);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">📋</div><div
// class="info"><div class="cat"
// style="font-size:13px">'+l.action+'</div><div
// style="font-size:11px;color:var(--text-light)">'+l.time+'</div></div></div>';
// }); document.getElementById('modalSearch').style.display = 'flex';
// document.getElementById('searchResults').innerHTML = h;
// document.getElementById('inputSearch').style.display = 'none'; }
// function exportCSV() { let csv =
// '类型,金额,板块,二级分类,成员,支付渠道,日期,备注\n';
// APP_DATA.records.forEach(r => { const cat = APP_DATA.budgets.find(b =>
// b.id === r.category); const member = APP_DATA.family.members.find(m =>
// m.id === r.member); csv += (r.type==='income'?'收入':'支出') +
// ',' + r.amount + ',' + (cat?cat.name:'') + ',' +
// (r.subcategory||'') + ',' + (member?member.name:'') + ',' +
// (r.payment||'') + ',' + r.date + ',' + (r.note||'') +
// '\n'; }); const blob = new Blob(['\uFEFF' + csv], { type:
// 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob);
// const a = document.createElement('a'); a.href = url; a.download =
// '深漂三口之家_账单_' + new Date().toISOString().split('T')[0] +
// '.csv'; a.click(); URL.revokeObjectURL(url); toast('账单已导出'); }
// function doReset() { confirmAction('重置所有数据',
// '此操作将清空所有账单、笔记和资产数据，且不可恢复。确定继续吗？', ()
// => { localStorage.removeItem(STORAGE_KEY); // 重置内存数据
// APP_DATA.records = []; APP_DATA.notes = []; APP_DATA.investments =
// []; APP_DATA.liabilities = []; APP_DATA.assets = { cash:0,
// bankCards:0, wechatAlipay:0, deposits:0, investments:0, emergency:0 };
// APP_DATA.family.monthlyIncomes = {}; const defs =
// [{amount:13500,ratio:0.45},{amount:6000,ratio:0.20},{amount:6000,ratio:0.20},{amount:3000,ratio:0.10},{amount:1500,ratio:0.05}];
// APP_DATA.budgets.forEach((b,i) => { b.amount = defs[i].amount;
// b.ratio = defs[i].ratio; }); APP_DATA.logs = [{ time: nowStr(),
// action: '数据已重置' }]; saveData(); // 重置UI currentPage =
// 'dashboard'; const now = new Date(); currentYear = now.getFullYear();
// currentMonth = now.getMonth(); selectedBillDay = null;
// document.querySelectorAll('.nav-item').forEach(n =>
// n.classList.toggle('active', n.dataset.page === 'dashboard'));
// updateHeaderTitle(); render(); toast('数据已重置 ✓'); }); } //
// ============================================================ // 启动 //
// ============================================================
// document.addEventListener('DOMContentLoaded', init);
