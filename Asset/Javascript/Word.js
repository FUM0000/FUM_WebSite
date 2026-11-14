
// Word Book
// Shared localStorage store for word cards and Japanese_WordBook.html.
(function () {
    const STORAGE_WEAK = 'fum-wordbook-weak-v1';
    const STORAGE_GRADUATED = 'fum-wordbook-graduated-v1';
    const STORAGE_STATS = 'fum-wordbook-stats-v1';
    const STORAGE_TROPHIES = 'fum-wordbook-trophies-v1';
    const STORAGE_HISTORY = 'fum-wordbook-history-v1';
    const STORAGE_FLIP_GUARD = 'fum-wordbook-flip-guard-v1';
    const FLIP_INTERVAL = 10 * 60 * 1000;
    const STORAGE_REVIEW_GUARD = 'fum-wordbook-review-guard-v1';
    const REVIEW_POINT_INTERVAL = 10 * 60 * 1000;
    // Study points. Reviews pay the same whether the answer is right or
    // wrong (results are self-reported anyway), so honest daily practice
    // is what earns points.
    const POINTS = {
        flip: 1,
        review: 5,
        graduate: 5
    };

    const runtimeReading = {};

    function Read_Json(_key, _fallback) {
        try {
            const raw = localStorage.getItem(_key);
            if (!raw) return _fallback;
            const value = JSON.parse(raw);
            return value === null || value === undefined ? _fallback : value;
        } catch (error) {
            return _fallback;
        }
    }
    function Write_Json(_key, _value) {
        try {
            localStorage.setItem(_key, JSON.stringify(_value));
        } catch (error) {
            // Storage can be unavailable (private mode / file://). Keep the page usable.
        }
    }
    const CHANGE_EVENT = 'fum-wordbook-change';
    function Emit_Change() {
        try {
            window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
        } catch (error) {
            // No CustomEvent support: pages keep the previous view until reload.
        }
    }
    function Get_Flip_Guard() {
        const guard = Read_Json(STORAGE_FLIP_GUARD, {});
        return guard && typeof guard === 'object' ? guard : {};
    }
    function Hash_Text(_text) {
        let hash = 5381;
        for (let i = 0; i < _text.length; i++) {
            hash = ((hash << 5) + hash + _text.charCodeAt(i)) >>> 0;
        }
        return hash.toString(36);
    }
    function Make_Id(_japanese, _english, _sourceUrl) {
        return 'w' + Hash_Text([_japanese || '', _english || '', _sourceUrl || ''].join('\u0001'));
    }
    function To_Date_Key(_date) {
        const d = _date || new Date();
        const y = d.getFullYear();
        const m = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        return y + '-' + m + '-' + day;
    }
    function Yesterday_Key() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return To_Date_Key(d);
    }
    function New_Day() {
        return { flips: 0, weakAdded: 0, reviews: 0, correct: 0, wrong: 0, graduated: 0, points: 0 };
    }
    function New_Stats() {
        return {
            totalFlips: 0,
            totalWeakAdded: 0,
            totalReviews: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalGraduated: 0,
            totalPoints: 0,
            totalEarned: 0,
            pages: {},
            days: {},
            streak: 0,
            bestStreak: 0,
            lastStudyDate: '',
            firstStudyAt: 0,
            lastStudyAt: 0
        };
    }
    function Get_Stats() {
        const saved = Read_Json(STORAGE_STATS, {});
        const stats = New_Stats();
        if (saved && typeof saved === 'object') {
            Object.keys(stats).forEach(function (_key) {
                if (saved[_key] !== undefined) stats[_key] = saved[_key];
            });
            if (!stats.pages || typeof stats.pages !== 'object') stats.pages = {};
            if (!stats.days || typeof stats.days !== 'object') stats.days = {};
        }
        ['totalFlips', 'totalWeakAdded', 'totalReviews', 'totalCorrect', 'totalWrong', 'totalGraduated', 'totalPoints', 'totalEarned', 'streak', 'bestStreak', 'firstStudyAt', 'lastStudyAt'].forEach(function (_key) {
            stats[_key] = Number(stats[_key]) || 0;
        });
        // Older saves have no points yet. Derive a starting balance from the
        // stored day records so the total is not stuck at zero after upgrade.
        if (!saved || saved.totalPoints === undefined) {
            let total = 0;
            Object.keys(stats.days).forEach(function (_key) {
                const day = stats.days[_key] || {};
                if (day.points === undefined) day.points = Day_Points(day);
                total += Number(day.points) || 0;
            });
            stats.totalPoints = total;
            stats.totalEarned = total;
            Write_Json(STORAGE_STATS, stats);
        } else if (saved.totalEarned === undefined) {
            // The lifetime counter was added when points became spendable:
            // everything owned so far counts as earned.
            stats.totalEarned = stats.totalPoints;
            Write_Json(STORAGE_STATS, stats);
        }
        return stats;
    }
    function Save_Stats(_stats) {
        Write_Json(STORAGE_STATS, _stats);
    }
    function Ensure_Day(_stats, _key) {
        if (!_stats.days[_key]) _stats.days[_key] = New_Day();
        const day = _stats.days[_key];
        ['flips', 'weakAdded', 'reviews', 'correct', 'wrong', 'graduated', 'points'].forEach(function (_name) {
            day[_name] = Number(day[_name]) || 0;
        });
        return day;
    }
    function Ensure_Page(_stats, _url) {
        if (!_url) return null;
        if (!_stats.pages[_url]) {
            _stats.pages[_url] = { title: '', visits: 0, flips: 0, weakAdded: 0, reviews: 0, lastVisit: 0 };
        }
        const page = _stats.pages[_url];
        ['visits', 'flips', 'weakAdded', 'reviews', 'lastVisit'].forEach(function (_name) {
            page[_name] = Number(page[_name]) || 0;
        });
        return page;
    }
    function Touch_Study(_stats) {
        const today = To_Date_Key();
        let streakBonus = 0;
        if (_stats.lastStudyDate !== today) {
            if (_stats.lastStudyDate === Yesterday_Key()) {
                _stats.streak = (_stats.streak || 0) + 1;
            } else {
                _stats.streak = 1;
            }
            _stats.lastStudyDate = today;
            // Reward continuity once per day: the streak day count itself
            // is the bonus for the first activity of the day.
            streakBonus = Number(_stats.streak) || 0;
        }
        _stats.bestStreak = Math.max(_stats.bestStreak || 0, _stats.streak || 0);
        if (!_stats.firstStudyAt) _stats.firstStudyAt = Date.now();
        _stats.lastStudyAt = Date.now();
        return streakBonus;
    }
    function Day_Points(_day) {
        const day = _day || {};
        return (Number(day.flips) || 0) * POINTS.flip +
            (Number(day.reviews) || 0) * POINTS.review +
            (Number(day.graduated) || 0) * POINTS.graduate;
    }
    function Add_Points(_stats, _day, _points) {
        const points = Number(_points) || 0;
        if (!points) return 0;
        _stats.totalPoints = (Number(_stats.totalPoints) || 0) + points;
        // Lifetime counter for levels and trophies: spending points later
        // must never lower them.
        _stats.totalEarned = (Number(_stats.totalEarned) || 0) + points;
        if (_day) _day.points = (Number(_day.points) || 0) + points;
        return points;
    }
    function Start_Of_Week(_date) {
        const d = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate());
        const offset = (d.getDay() + 6) % 7; // Monday = 0
        d.setDate(d.getDate() - offset);
        return d;
    }
    function Period_Bounds(_mode, _date) {
        const now = _date || new Date();
        let start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (_mode === 'week') {
            start = Start_Of_Week(now);
            end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
        } else if (_mode === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (_mode === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
        }
        return {
            start: To_Date_Key(start),
            end: To_Date_Key(end),
            startDate: start,
            endDate: end
        };
    }
    function Is_Active_Day(_day) {
        return ((Number(_day.flips) || 0) + (Number(_day.weakAdded) || 0) +
            (Number(_day.reviews) || 0) + (Number(_day.graduated) || 0)) > 0;
    }
    function Get_Period(_stats, _mode) {
        const stats = _stats || Get_Stats();
        const mode = _mode || 'today';
        const out = {
            mode: mode,
            flips: 0,
            weakAdded: 0,
            reviews: 0,
            correct: 0,
            wrong: 0,
            graduated: 0,
            points: 0,
            activeDays: 0
        };

        if (mode === 'all') {
            out.flips = Number(stats.totalFlips) || 0;
            out.weakAdded = Number(stats.totalWeakAdded) || 0;
            out.reviews = Number(stats.totalReviews) || 0;
            out.correct = Number(stats.totalCorrect) || 0;
            out.wrong = Number(stats.totalWrong) || 0;
            out.graduated = Number(stats.totalGraduated) || 0;
            out.points = Number(stats.totalEarned !== undefined ? stats.totalEarned : stats.totalPoints) || 0;
            out.activeDays = Object.keys(stats.days || {}).filter(function (_key) {
                return Is_Active_Day(stats.days[_key] || {});
            }).length;
            return out;
        }

        const bounds = Period_Bounds(mode);
        const days = stats.days || {};
        Object.keys(days).forEach(function (_key) {
            if (_key < bounds.start || _key > bounds.end) return;
            const day = days[_key] || {};
            out.flips += Number(day.flips) || 0;
            out.weakAdded += Number(day.weakAdded) || 0;
            out.reviews += Number(day.reviews) || 0;
            out.correct += Number(day.correct) || 0;
            out.wrong += Number(day.wrong) || 0;
            out.graduated += Number(day.graduated) || 0;
            out.points += Number(day.points) || 0;
            if (Is_Active_Day(day)) out.activeDays += 1;
        });
        return out;
    }
    // Level-up requirements grow exponentially: 10 points for the first
    // level, then doubling with every level (10, 20, 40, 80, ...).
    const LEVEL_BASE = 10;
    const LEVEL_GROWTH = 2;
    function Level_Cost(_level) {
        return LEVEL_BASE * Math.pow(LEVEL_GROWTH, Math.max(1, Number(_level) || 1) - 1);
    }
    function Get_Level(_points) {
        const points = Math.max(0, Math.floor(Number(_points) || 0));
        let level = 1;
        let current = points;
        let next = Level_Cost(level);
        while (current >= next && level < 999) {
            current -= next;
            level += 1;
            next = Level_Cost(level);
        }
        return {
            level: level,
            current: current,
            next: next,
            remaining: next - current,
            progress: Math.round((current / next) * 100)
        };
    }
    function Get_Weak() {
        const rows = Read_Json(STORAGE_WEAK, []);
        return Array.isArray(rows) ? rows : [];
    }
    function Save_Weak(_rows) {
        Write_Json(STORAGE_WEAK, _rows);
    }
    function Get_Graduated() {
        const rows = Read_Json(STORAGE_GRADUATED, []);
        return Array.isArray(rows) ? rows : [];
    }
    function Get_History() {
        const rows = Read_Json(STORAGE_HISTORY, []);
        return Array.isArray(rows) ? rows : [];
    }
    function Add_History(_type, _word) {
        const history = Get_History();
        const word = _word || {};
        history.unshift({
            type: _type,
            id: word.id || '',
            japanese: word.japanese || '',
            english: word.english || '',
            source: word.source || '',
            sourceUrl: word.sourceUrl || '',
            correct: word.correct === true,
            at: Date.now()
        });
        Write_Json(STORAGE_HISTORY, history.slice(0, 80));
    }
    function Reading_Key(_japanese, _english) {
        return (_japanese || '') + '\u0001' + (_english || '');
    }
    function Cache_Word(_word) {
        if (!_word) return;
        if (_word.reading) {
            runtimeReading[Reading_Key(_word.japanese, _word.english)] = _word.reading;
            runtimeReading[(_word.japanese || '') + '\u0001'] = _word.reading;
        }
    }
    function Cache_Words(_words) {
        if (!Array.isArray(_words)) return;
        _words.forEach(Cache_Word);
    }
    function Lookup_Reading(_japanese, _english) {
        return runtimeReading[Reading_Key(_japanese, _english)] ||
            runtimeReading[(_japanese || '') + '\u0001'] || '';
    }
    function Get_Source_Url() {
        return (window.location.pathname.split('/').pop() || window.location.pathname || '');
    }
    function Get_Source_Label() {
        const bars = document.querySelectorAll('.v-system-bar');
        for (let i = 0; i < bars.length; i++) {
            let text = (bars[i].textContent || '').replace(/\s+/g, ' ').trim();
            if (!text) continue;
            text = text.replace(/^BGM playback\s*/i, '').replace(/\s*MENU\s*$/i, '').trim();
            const start = text.indexOf('Japanese Language');
            if (start >= 0) text = text.slice(start);
            if (text && text.length < 140) return text;
        }
        return document.title || '';
    }
    function Is_Weak(_japanese, _english, _sourceUrl) {
        const id = Make_Id(_japanese, _english, _sourceUrl || Get_Source_Url());
        return Get_Weak().some(function (_word) { return _word.id === id; });
    }
    function Add_Weak(_word) {
        const word = _word || {};
        const sourceUrl = word.sourceUrl || Get_Source_Url();
        const id = Make_Id(word.japanese, word.english, sourceUrl);
        const rows = Get_Weak();
        if (rows.some(function (_row) { return _row.id === id; })) return false;

        const entry = {
            id: id,
            japanese: word.japanese || '',
            english: word.english || '',
            reading: word.reading || Lookup_Reading(word.japanese, word.english),
            source: word.source || Get_Source_Label(),
            sourceUrl: sourceUrl,
            addedAt: Date.now(),
            reviewCount: 0,
            correctCount: 0,
            wrongCount: 0,
            lastReviewed: 0,
            lastResult: ''
        };
        rows.unshift(entry);
        Save_Weak(rows);

        const stats = Get_Stats();
        stats.totalWeakAdded += 1;
        const streakBonus = Touch_Study(stats);
        const day = Ensure_Day(stats, To_Date_Key());
        day.weakAdded += 1;
        Add_Points(stats, day, streakBonus);
        const page = Ensure_Page(stats, sourceUrl);
        if (page) {
            if (entry.source) page.title = entry.source;
            page.weakAdded += 1;
            page.lastVisit = Date.now();
        }
        Save_Stats(stats);
        Add_History('weak', entry);
        Emit_Change();
        return true;
    }
    function Remove_Weak(_id) {
        const rows = Get_Weak();
        const index = rows.findIndex(function (_word) { return _word.id === _id; });
        if (index < 0) return false;

        // A word that has been reviewed at least once is graduated when its
        // bookmark is turned off. Unreviewed words are simply removed.
        if ((Number(rows[index].reviewCount) || 0) > 0) {
            Graduate_Weak(_id);
        } else {
            rows.splice(index, 1);
            Save_Weak(rows);
        }
        Emit_Change();
        return true;
    }
    function Toggle_Weak(_word) {
        const word = _word || {};
        const sourceUrl = word.sourceUrl || Get_Source_Url();
        const id = Make_Id(word.japanese, word.english, sourceUrl);
        if (Get_Weak().some(function (_row) { return _row.id === id; })) {
            Remove_Weak(id);
            return false;
        }
        Add_Weak(word);
        return true;
    }
    function Graduate_Weak(_id) {
        const rows = Get_Weak();
        const index = rows.findIndex(function (_word) { return _word.id === _id; });
        if (index < 0) return false;

        const entry = rows.splice(index, 1)[0];
        Save_Weak(rows);
        const graduated = Get_Graduated();
        // Graduation points are only paid the first time a word graduates, so
        // re-adding and removing the same word cannot farm points.
        const firstGraduation = !graduated.some(function (_row) { return _row.id === entry.id; });
        graduated.unshift(Object.assign({}, entry, { graduatedAt: Date.now() }));
        Write_Json(STORAGE_GRADUATED, graduated.slice(0, 300));

        const stats = Get_Stats();
        stats.totalGraduated += 1;
        const streakBonus = Touch_Study(stats);
        const day = Ensure_Day(stats, To_Date_Key());
        day.graduated += 1;
        Add_Points(stats, day, (firstGraduation ? POINTS.graduate : 0) + streakBonus);
        const page = Ensure_Page(stats, entry.sourceUrl);
        if (page) {
            if (entry.source) page.title = entry.source;
            page.lastVisit = Date.now();
        }
        Save_Stats(stats);
        Add_History('graduated', entry);
        return true;
    }
    function Record_Review(_id, _correct) {
        const rows = Get_Weak();
        const index = rows.findIndex(function (_word) { return _word.id === _id; });
        if (index < 0) return null;

        const now = Date.now();
        const entry = rows[index];
        entry.reviewCount = (Number(entry.reviewCount) || 0) + 1;
        entry.lastReviewed = now;
        if (_correct) {
            entry.correctCount = (Number(entry.correctCount) || 0) + 1;
            entry.lastResult = 'correct';
        } else {
            entry.wrongCount = (Number(entry.wrongCount) || 0) + 1;
            entry.lastResult = 'wrong';
        }
        rows[index] = entry;
        Save_Weak(rows);

        // Review points for the same word are limited to once per interval,
        // so finishing a session and instantly replaying it cannot farm points.
        // Right or wrong pays the same: results are self-reported anyway.
        const reviewGuard = Read_Json(STORAGE_REVIEW_GUARD, {});
        const reviewKey = Make_Id(entry.japanese, entry.english);
        let reviewPoints = 0;
        if (now - (Number(reviewGuard[reviewKey]) || 0) >= REVIEW_POINT_INTERVAL) {
            reviewPoints = POINTS.review;
            Object.keys(reviewGuard).forEach(function (_key) {
                if (now - (Number(reviewGuard[_key]) || 0) >= REVIEW_POINT_INTERVAL) delete reviewGuard[_key];
            });
            reviewGuard[reviewKey] = now;
            Write_Json(STORAGE_REVIEW_GUARD, reviewGuard);
        }

        const stats = Get_Stats();
        stats.totalReviews += 1;
        if (_correct) stats.totalCorrect += 1;
        else stats.totalWrong += 1;
        const streakBonus = Touch_Study(stats);
        const day = Ensure_Day(stats, To_Date_Key());
        day.reviews += 1;
        if (_correct) day.correct += 1;
        else day.wrong += 1;
        Add_Points(stats, day, reviewPoints + streakBonus);
        const page = Ensure_Page(stats, entry.sourceUrl);
        if (page) {
            if (entry.source) page.title = entry.source;
            page.reviews += 1;
            page.lastVisit = now;
        }
        Save_Stats(stats);
        Add_History('review', Object.assign({}, entry, { correct: _correct === true }));
        return entry;
    }
    function Record_Flip(_word) {
        const word = _word || {};
        const sourceUrl = word.sourceUrl || Get_Source_Url();
        const now = Date.now();

        // Same word can only add to the flip count once per interval, so
        // rapidly opening / closing a card cannot farm points. The guard is
        // keyed by the word itself, not by the page it appears on.
        const guard = Get_Flip_Guard();
        const id = Make_Id(word.japanese, word.english);
        if (now - (Number(guard[id]) || 0) < FLIP_INTERVAL) return false;

        Object.keys(guard).forEach(function (_key) {
            if (now - (Number(guard[_key]) || 0) >= FLIP_INTERVAL) delete guard[_key];
        });
        guard[id] = now;
        Write_Json(STORAGE_FLIP_GUARD, guard);

        const stats = Get_Stats();
        stats.totalFlips += 1;
        const streakBonus = Touch_Study(stats);
        const day = Ensure_Day(stats, To_Date_Key());
        day.flips += 1;
        Add_Points(stats, day, POINTS.flip + streakBonus);
        const page = Ensure_Page(stats, sourceUrl);
        if (page) {
            if (word.source) page.title = word.source;
            page.flips += 1;
            page.lastVisit = now;
        }
        Save_Stats(stats);
        Add_History('flip', word);
        return true;
    }
    function Record_Page_Visit(_word) {
        const word = _word || {};
        const url = word.sourceUrl || Get_Source_Url();
        const stats = Get_Stats();
        const page = Ensure_Page(stats, url);
        if (!page) return;
        page.visits += 1;
        page.title = word.source || page.title || document.title || url;
        page.lastVisit = Date.now();
        Save_Stats(stats);
    }
    function Get_Today(_stats) {
        const stats = _stats || Get_Stats();
        const day = (stats.days || {})[To_Date_Key()];
        return day ? Object.assign(New_Day(), day) : New_Day();
    }
    function Get_Display_Streak(_stats) {
        const stats = _stats || Get_Stats();
        if (!stats.lastStudyDate) return 0;
        if (stats.lastStudyDate === To_Date_Key() || stats.lastStudyDate === Yesterday_Key()) {
            return Number(stats.streak) || 0;
        }
        return 0;
    }
    function Count_Studied_Pages(_stats) {
        const stats = _stats || Get_Stats();
        return Object.keys(stats.pages || {}).filter(function (_url) {
            const page = stats.pages[_url] || {};
            return (Number(page.flips) || 0) + (Number(page.weakAdded) || 0) + (Number(page.reviews) || 0) > 0;
        }).length;
    }
    function Accuracy(_stats) {
        const stats = _stats || Get_Stats();
        if (!stats.totalReviews) return 0;
        return Math.round((stats.totalCorrect / stats.totalReviews) * 100);
    }
    function Accuracy_Value(_stats) {
        const stats = _stats || Get_Stats();
        if (stats.totalReviews < 20) return 0;
        return Accuracy(stats);
    }
    function Max_Day_Value(_stats, _field) {
        // Largest single-day record of one activity, used for
        // "in one day" reward milestones.
        const stats = _stats || Get_Stats();
        let max = 0;
        Object.keys(stats.days || {}).forEach(function (_key) {
            const day = stats.days[_key] || {};
            max = Math.max(max, Number(day[_field]) || 0);
        });
        return max;
    }
    function Count_Days(_stats) {
        const stats = _stats || Get_Stats();
        return Object.keys(stats.days || {}).length;
    }

    const TROPHY_DEFS = [
        { id: 'first_flip', title: 'First Step', description: 'Flip a word card once', icon: 'mdi-sprout', tier: 'bronze', category: 'start', target: 1, value: function (s) { return s.totalFlips; } },
        { id: 'flip_25', title: 'Card Rookie', description: 'Flip word cards 25 times', icon: 'mdi-cards-outline', tier: 'bronze', category: 'start', target: 25, value: function (s) { return s.totalFlips; } },
        { id: 'flip_100', title: 'Card Master', description: 'Flip word cards 100 times', icon: 'mdi-cards', tier: 'silver', category: 'start', target: 100, value: function (s) { return s.totalFlips; } },
        { id: 'flip_300', title: 'Word Explorer', description: 'Flip word cards 300 times', icon: 'mdi-compass-outline', tier: 'gold', category: 'start', target: 300, value: function (s) { return s.totalFlips; } },
        { id: 'flip_600', title: 'Card Legend', description: 'Flip word cards 600 times', icon: 'mdi-crown-outline', tier: 'gold', category: 'start', target: 600, value: function (s) { return s.totalFlips; } },

        { id: 'weak_1', title: 'First Note', description: 'Add 1 tricky word', icon: 'mdi-bookmark-plus-outline', tier: 'bronze', category: 'weak', target: 1, value: function (s) { return s.totalWeakAdded; } },
        { id: 'weak_10', title: 'Tricky Collector', description: 'Add 10 tricky words', icon: 'mdi-bookmark-multiple', tier: 'silver', category: 'weak', target: 10, value: function (s) { return s.totalWeakAdded; } },
        { id: 'weak_30', title: 'Weakness Hunter', description: 'Add 30 tricky words', icon: 'mdi-crosshairs-gps', tier: 'gold', category: 'weak', target: 30, value: function (s) { return s.totalWeakAdded; } },
        { id: 'weak_75', title: 'Tricky Archivist', description: 'Add 75 tricky words', icon: 'mdi-bookmark-multiple-outline', tier: 'silver', category: 'weak', target: 75, value: function (s) { return s.totalWeakAdded; } },
        { id: 'weak_150', title: 'Trickiest Collector', description: 'Add 150 tricky words', icon: 'mdi-bookshelf', tier: 'gold', category: 'weak', target: 150, value: function (s) { return s.totalWeakAdded; } },

        { id: 'review_1', title: 'Review Debut', description: 'Review tricky words once', icon: 'mdi-repeat', tier: 'bronze', category: 'review', target: 1, value: function (s) { return s.totalReviews; } },
        { id: 'review_25', title: 'Review Habit', description: 'Review tricky words 25 times', icon: 'mdi-calendar-check-outline', tier: 'silver', category: 'review', target: 25, value: function (s) { return s.totalReviews; } },
        { id: 'review_100', title: 'Memory Artisan', description: 'Review tricky words 100 times', icon: 'mdi-brain', tier: 'gold', category: 'review', target: 100, value: function (s) { return s.totalReviews; } },
        { id: 'review_300', title: 'Memory Master', description: 'Review tricky words 300 times', icon: 'mdi-head-cog-outline', tier: 'gold', category: 'review', target: 300, value: function (s) { return s.totalReviews; } },

        { id: 'correct_50', title: 'Sharp Eye', description: 'Answer 50 reviews correctly', icon: 'mdi-eye-check-outline', tier: 'bronze', category: 'review', target: 50, value: function (s) { return s.totalCorrect; } },
        { id: 'correct_250', title: 'Sharpness Expert', description: 'Answer 250 reviews correctly', icon: 'mdi-check-decagram-outline', tier: 'silver', category: 'review', target: 250, value: function (s) { return s.totalCorrect; } },
        { id: 'correct_600', title: 'Unshakeable Eye', description: 'Answer 600 reviews correctly', icon: 'mdi-check-underline', tier: 'gold', category: 'review', target: 600, value: function (s) { return s.totalCorrect; } },

        { id: 'graduate_1', title: 'First Graduation', description: 'Graduate 1 tricky word', icon: 'mdi-school-outline', tier: 'bronze', category: 'review', target: 1, value: function (s) { return s.totalGraduated; } },
        { id: 'graduate_10', title: 'Weak Breaker', description: 'Graduate 10 tricky words', icon: 'mdi-hammer-screwdriver', tier: 'silver', category: 'review', target: 10, value: function (s) { return s.totalGraduated; } },
        { id: 'graduate_30', title: 'Weakness Master', description: 'Graduate 30 tricky words', icon: 'mdi-crown', tier: 'gold', category: 'review', target: 30, value: function (s) { return s.totalGraduated; } },
        { id: 'graduate_60', title: 'Weakness Scholar', description: 'Graduate 60 tricky words', icon: 'mdi-school', tier: 'silver', category: 'review', target: 60, value: function (s) { return s.totalGraduated; } },
        { id: 'graduate_100', title: 'Professor of Mastery', description: 'Graduate 100 tricky words', icon: 'mdi-account-school', tier: 'gold', category: 'review', target: 100, value: function (s) { return s.totalGraduated; } },

        { id: 'streak_3', title: 'Three-Day Streak', description: 'Study 3 days in a row', icon: 'mdi-fire', tier: 'bronze', category: 'streak', target: 3, value: function (s) { return s.bestStreak; } },
        { id: 'streak_7', title: 'Week Streak', description: 'Study 7 days in a row', icon: 'mdi-calendar-week-outline', tier: 'silver', category: 'streak', target: 7, value: function (s) { return s.bestStreak; } },
        { id: 'streak_14', title: 'Two-Week Streak', description: 'Study 14 days in a row', icon: 'mdi-lightning-bolt', tier: 'gold', category: 'streak', target: 14, value: function (s) { return s.bestStreak; } },
        { id: 'streak_30', title: 'Monthly Flame', description: 'Study 30 days in a row', icon: 'mdi-fire-alert', tier: 'gold', category: 'streak', target: 30, value: function (s) { return s.bestStreak; } },
        { id: 'streak_60', title: 'Eternal Flame', description: 'Study 60 days in a row', icon: 'mdi-fire-circle', tier: 'gold', category: 'streak', target: 60, value: function (s) { return s.bestStreak; } },

        { id: 'pages_5', title: 'Page Hopper', description: 'Study on 5 word pages', icon: 'mdi-map-marker', tier: 'bronze', category: 'explore', target: 5, value: function (s) { return Count_Studied_Pages(s); } },
        { id: 'pages_15', title: 'Genre Explorer', description: 'Study on 15 word pages', icon: 'mdi-map-outline', tier: 'silver', category: 'explore', target: 15, value: function (s) { return Count_Studied_Pages(s); } },
        { id: 'pages_30', title: 'Word Traveler', description: 'Study on 30 word pages', icon: 'mdi-earth', tier: 'gold', category: 'explore', target: 30, value: function (s) { return Count_Studied_Pages(s); } },
        { id: 'pages_50', title: 'World Wanderer', description: 'Study on 50 word pages', icon: 'mdi-earth-box', tier: 'gold', category: 'explore', target: 50, value: function (s) { return Count_Studied_Pages(s); } },

        { id: 'accuracy_80', title: 'Sharp Shooter', description: 'Reach 80% accuracy with 20+ reviews', icon: 'mdi-target', tier: 'gold', category: 'special', target: 80, value: function (s) { return Accuracy_Value(s); } },
        { id: 'points_100', title: 'Point Collector', description: 'Earn 100 study points', icon: 'mdi-star-circle-outline', tier: 'silver', category: 'points', target: 100, value: function (s) { return s.totalEarned !== undefined ? s.totalEarned : s.totalPoints; } },
        { id: 'points_1000', title: 'Point Master', description: 'Earn 1,000 study points', icon: 'mdi-seal', tier: 'gold', category: 'points', target: 1000, value: function (s) { return s.totalEarned !== undefined ? s.totalEarned : s.totalPoints; } },
        { id: 'points_250', title: 'Point Hunter', description: 'Earn 250 study points', icon: 'mdi-star-four-points-outline', tier: 'silver', category: 'points', target: 250, value: function (s) { return s.totalEarned !== undefined ? s.totalEarned : s.totalPoints; } },
        { id: 'points_2500', title: 'Point Champion', description: 'Earn 2,500 study points', icon: 'mdi-star-shooting', tier: 'gold', category: 'points', target: 2500, value: function (s) { return s.totalEarned !== undefined ? s.totalEarned : s.totalPoints; } },
        { id: 'points_5000', title: 'Point Grandmaster', description: 'Earn 5,000 study points', icon: 'mdi-creation', tier: 'gold', category: 'points', target: 5000, value: function (s) { return s.totalEarned !== undefined ? s.totalEarned : s.totalPoints; } },

        { id: 'day_flips_50', title: 'Card Marathon', description: 'Flip 50 cards in one day', icon: 'mdi-run-fast', tier: 'gold', category: 'special', target: 50, value: function (s) { return Max_Day_Value(s, 'flips'); } },
        { id: 'day_reviews_20', title: 'Focused Reviewer', description: 'Complete 20 reviews in one day', icon: 'mdi-timer-outline', tier: 'gold', category: 'special', target: 20, value: function (s) { return Max_Day_Value(s, 'reviews'); } },
        { id: 'day_graduated_5', title: 'Graduation Day', description: 'Graduate 5 words in one day', icon: 'mdi-party-popper', tier: 'gold', category: 'special', target: 5, value: function (s) { return Max_Day_Value(s, 'graduated'); } },
        { id: 'wrong_50', title: 'Resilient Learner', description: 'Miss 50 reviews and keep going', icon: 'mdi-hand-heart', tier: 'silver', category: 'special', target: 50, value: function (s) { return s.totalWrong; } },
        { id: 'days_30', title: 'Monthly Veteran', description: 'Record activity on 30 different days', icon: 'mdi-calendar-multiple-check', tier: 'gold', category: 'special', target: 30, value: function (s) { return Count_Days(s); } },
        { id: 'all_rounder', title: 'Well Rounded', description: 'Flip 100+ cards, add 10+ words, review 25+ times and graduate 5+', icon: 'mdi-arm-flex', tier: 'gold', category: 'special', target: 1, value: function (s) { return (s.totalFlips >= 100 && s.totalWeakAdded >= 10 && s.totalReviews >= 25 && s.totalGraduated >= 5) ? 1 : 0; } },
        { id: 'zero_weak', title: 'Clean Slate', description: 'Graduate 5+ words and empty your tricky list', icon: 'mdi-shield-star', tier: 'gold', category: 'special', target: 1, value: function (s, weakCount) { return (s.totalGraduated >= 5 && weakCount === 0) ? 1 : 0; } }
    ];

    function Get_Trophies() {
        const earned = Read_Json(STORAGE_TROPHIES, {});
        const stats = Get_Stats();
        const weakCount = Get_Weak().length;
        let changed = false;

        const list = TROPHY_DEFS.map(function (_def) {
            const raw = Math.max(0, Number(_def.value(stats, weakCount)) || 0);
            const reached = raw >= _def.target;
            // Once earned, a trophy stays earned even if the live value drops
            // (for example the weak list is refilled after "zero weak").
            const unlocked = reached || !!earned[_def.id];
            if (reached && !earned[_def.id]) {
                earned[_def.id] = Date.now();
                changed = true;
            }
            return {
                id: _def.id,
                title: _def.title,
                description: _def.description,
                icon: _def.icon,
                tier: _def.tier,
                category: _def.category,
                target: _def.target,
                rawValue: raw,
                value: unlocked ? _def.target : Math.min(raw, _def.target),
                progress: unlocked ? 100 : Math.min(100, Math.round((raw / _def.target) * 100)),
                unlocked: unlocked,
                earnedAt: earned[_def.id] || 0
            };
        });

        if (changed) Write_Json(STORAGE_TROPHIES, earned);
        return list;
    }

    window.FUM_WordBook = {
        Change_Event: CHANGE_EVENT,
        To_Date_Key: To_Date_Key,
        Get_Stats: Get_Stats,
        Get_Weak: Get_Weak,
        Get_Graduated: Get_Graduated,
        Get_History: Get_History,
        Get_Trophies: Get_Trophies,
        Get_Today: Get_Today,
        Get_Period: Get_Period,
        Get_Period_Bounds: Period_Bounds,
        Get_Level: Get_Level,
        Points_Rules: POINTS,
        Get_Display_Streak: Get_Display_Streak,
        Count_Studied_Pages: Count_Studied_Pages,
        Accuracy: Accuracy,
        Is_Weak: Is_Weak,
        Add_Weak: Add_Weak,
        Remove_Weak: Remove_Weak,
        Toggle_Weak: Toggle_Weak,
        Graduate_Weak: Graduate_Weak,
        Record_Review: Record_Review,
        Record_Flip: Record_Flip,
        Record_Page_Visit: Record_Page_Visit,
        Make_Id: Make_Id,
        Get_Source_Label: Get_Source_Label,
        Get_Source_Url: Get_Source_Url,
        Cache_Word: Cache_Word,
        Cache_Words: Cache_Words,
        Lookup_Reading: Lookup_Reading
    };
})();

// Component
//// General
Vue.component('card-word-general', {
    template: `
    <v-card class="mx-auto d-flex flex-column">
        <v-card-title class="pb-1 justify-center">
            <div class="pt-8 text-center text-h4 font-weight-medium">
                <slot name="first"></slot>
            </div>
        </v-card-title>
        
        <v-card-actions class="justify-center align-center" style="position: relative;">
            <v-btn
                icon
                small
                class="wordbook-weak-toggle"
                :class="{ 'wordbook-weak-toggle--active': weak }"
                :color="weak ? 'deep-orange' : 'blue-grey lighten-1'"
                :title="weak ? 'Remove from tricky words' : 'Add to tricky words'"
                :aria-label="weak ? 'Remove from tricky words' : 'Add to tricky words'"
                :aria-pressed="weak ? 'true' : 'false'"
                style="position: absolute; left: 16px;"
                @click="toggleWeak"
            >
                <v-icon>{{ weak ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}</v-icon>
            </v-btn>

            <v-btn color="primary" @click="openAnswer" text>Answer</v-btn>
            
            <v-btn 
                v-if="japanese" 
                icon 
                @click="toggleAudio" 
                color="primary" 
                style="position: absolute; right: 16px;"
            >
                <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
            </v-btn>
        </v-card-actions>

        <v-expand-transition>
            <v-card v-if="show" class="d-flex flex-column transition-fast-in-fast-out v-card--reveal" style="height: 100%;" color="teal lighten-5" outlined>
                <v-spacer />
                <v-card-title class="justify-center">
                    <div class="py-8 text-center text-h4 font-weight-medium">
                        <slot name="second"></slot>
                    </div>
                </v-card-title>
                <v-card-actions class="justify-center" style="position: relative;">
                    <v-btn
                        icon
                        small
                        class="wordbook-weak-toggle"
                        :class="{ 'wordbook-weak-toggle--active': weak }"
                        :color="weak ? 'deep-orange' : 'blue-grey lighten-1'"
                        :title="weak ? 'Remove from tricky words' : 'Add to tricky words'"
                        :aria-label="weak ? 'Remove from tricky words' : 'Add to tricky words'"
                        :aria-pressed="weak ? 'true' : 'false'"
                        style="position: absolute; left: 16px;"
                        @click="toggleWeak"
                    >
                        <v-icon>{{ weak ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}</v-icon>
                    </v-btn>

                    <v-btn color="teal accent-4" @click="show = false" text>Close</v-btn>
                    <v-btn 
                        v-if="english" 
                        icon 
                        @click="toggleAudio2" 
                        color="primary"
                        style="position: absolute; right: 16px;"
                    >
                        <v-icon>{{ isPlaying2 ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-expand-transition>
    </v-card>
    `,
    data: function () {
        return {
            show: false,
            weak: false,
            isPlaying: false,
            synthUtterance: null,
            ttsVoice: null,
            isPlaying2: false,
            synthUtterance2: null,
            ttsVoice2: null,
        }
    },
    created: function () {
        var self = this;
        self.syncWeak();
        if (window.speechSynthesis) {
            var voices = window.speechSynthesis.getVoices();
            if (voices.length) {
                self.ttsVoice = self.pickVoiceForLang(self.ttsLang, voices);
                self.ttsVoice2 = self.pickVoiceForLang(self.ttsLang2, voices);
            }
            window.speechSynthesis.onvoiceschanged = function () {
                var v = window.speechSynthesis.getVoices();
                self.ttsVoice = self.pickVoiceForLang(self.ttsLang, v);
                self.ttsVoice2 = self.pickVoiceForLang(self.ttsLang2, v);
            };
        }
    },
    props: {
        showall: Boolean,
        japanese: {
            type: String,
            default: ''
        },
        reading: {
            type: String,
            default: ''
        },
        ttsLang: {
            type: String,
            default: 'ja-JP'
        },
        english: {
            type: String,
            default: ''
        },
        ttsLang2: {
            type: String,
            default: 'en-US'
        },
        sourceUrl: {
            type: String,
            default: ''
        },
        sourceLabel: {
            type: String,
            default: ''
        }
    },
    computed: {
        Source_Url: function () {
            if (this.sourceUrl) return this.sourceUrl;
            return window.FUM_WordBook ? window.FUM_WordBook.Get_Source_Url() : '';
        },
        Source_Label: function () {
            if (this.sourceLabel) return this.sourceLabel;
            return window.FUM_WordBook ? window.FUM_WordBook.Get_Source_Label() : '';
        }
    },
    watch: {
        showall: function (newVal, _old) {
            this.show = newVal;
        },
        japanese: function () {
            this.syncWeak();
        },
        english: function () {
            this.syncWeak();
        }
    },
    methods: {
        syncWeak: function () {
            if (!window.FUM_WordBook) return;
            this.weak = window.FUM_WordBook.Is_Weak(this.japanese, this.english, this.Source_Url);
        },
        openAnswer: function () {
            const firstOpen = !this.show;
            this.show = true;
            if (firstOpen && window.FUM_WordBook) {
                window.FUM_WordBook.Record_Flip({
                    japanese: this.japanese,
                    english: this.english,
                    source: this.Source_Label,
                    sourceUrl: this.Source_Url
                });
            }
        },
        toggleWeak: function () {
            this.weak = !this.weak;
            this.onWeakChange();
        },
        onWeakChange: function () {
            if (!window.FUM_WordBook) return;
            const sourceUrl = this.Source_Url;
            const active = window.FUM_WordBook.Toggle_Weak({
                japanese: this.japanese,
                english: this.english,
                reading: this.reading || window.FUM_WordBook.Lookup_Reading(this.japanese, this.english),
                source: this.Source_Label,
                sourceUrl: sourceUrl
            });
            this.weak = active;
        },
        pickVoiceForLang: function (langPref, voices) {
            var preferred = null, fallback = null;
            var langPrefix = langPref.split('-')[0];
            for (var i = 0; i < voices.length; i++) {
                var v = voices[i];
                if (v.lang && v.lang.indexOf(langPrefix) === 0) {
                    if (!fallback) fallback = v;
                    if (v.name.indexOf('Google') !== -1) {
                        if (v.name.indexOf('女性') !== -1 || v.name.indexOf('Female') !== -1) return v;
                        if (!preferred) preferred = v;
                    }
                    if (langPrefix === 'ja') {
                        if (v.name.indexOf('Haruka') !== -1 || v.name.indexOf('Ichiro') !== -1) {
                            if (!preferred) preferred = v;
                        }
                    }
                    if (langPrefix === 'en') {
                        if (v.name.indexOf('Samantha') !== -1 || v.name.indexOf('Zira') !== -1 || v.name.indexOf('David') !== -1) {
                            if (!preferred) preferred = v;
                        }
                    }
                }
            }
            return preferred || fallback || null;
        },
        speak: function (text, lang, voice, volume, onEnd) {
            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.85;
            utterance.volume = volume;
            if (voice) utterance.voice = voice;
            utterance.onend = onEnd;
            window.speechSynthesis.speak(utterance);
            return utterance;
        },
        toggleAudio() {
            if (this.isPlaying) {
                if (this.synthUtterance) {
                    window.speechSynthesis.cancel();
                    this.synthUtterance = null;
                }
                this.isPlaying = false;
                return;
            }

            this.synthUtterance = this.speak(this.japanese, this.ttsLang, this.ttsVoice, 1.0, function () {
                this.isPlaying = false;
                this.synthUtterance = null;
            }.bind(this));
            this.isPlaying = true;
        },
        toggleAudio2() {
            if (this.isPlaying2) {
                if (this.synthUtterance2) {
                    window.speechSynthesis.cancel();
                    this.synthUtterance2 = null;
                }
                this.isPlaying2 = false;
                return;
            }

            this.synthUtterance2 = this.speak(this.english, this.ttsLang2, this.ttsVoice2, 0.6, function () {
                this.isPlaying2 = false;
                this.synthUtterance2 = null;
            }.bind(this));
            this.isPlaying2 = true;
        }
    },
    beforeDestroy() {
        window.speechSynthesis.cancel();
    }
})

// Mixins
window.Mixins_Word = {
    data() {
        return {
            Ready_Page: false,
            Drawer: false,
            Switch: false,
            List: [],
        };
    },
    methods: {
        ChangeDrawer(_value) { this.Drawer = _value; },
        CreateList(_japanese, _reading, _english) {
            let list = [];
            for (let i = 0; i < _japanese.length; i++) {
                list.push({
                    id: i,
                    japanese: _japanese[i],
                    reading: _reading[i],
                    english: _english[i]
                });
            }
            this.List = list;
            if (window.FUM_WordBook) {
                window.FUM_WordBook.Cache_Words(list);
            }
        },
        applyMainColor() {
            try {
                const saved = localStorage.getItem('appSettings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    if (settings.mainColor) {
                        document.documentElement.style.backgroundColor = settings.mainColor;
                        const vApp = document.querySelector('.v-application');
                        if (vApp) {
                            vApp.style.setProperty('background-color', settings.mainColor, 'important');
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to apply main color:', error);
            }
        }
    },
    mounted() {
        this.applyMainColor();
        if (window.FUM_WordBook) {
            window.FUM_WordBook.Record_Page_Visit({
                source: window.FUM_WordBook.Get_Source_Label(),
                sourceUrl: window.FUM_WordBook.Get_Source_Url()
            });
        }
        $(window).ready(() => { this.Ready_Page = true; });
        $(window).on('beforeunload', () => {
            $('#App').css('opacity', '0');
            $(window).scrollTop(0);
        });
    },
};
