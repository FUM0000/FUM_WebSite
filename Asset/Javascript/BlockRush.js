/*
 * Block Rush
 * ------------------------------------------------------------------
 * JavaScript port of the Pygame "Line Breaker" sample.
 *
 * The board is 8 columns x 10 rows. A single block falls from the top;
 * move it left / right, drop it, and fill a whole row to clear it.
 * Every cleared row is worth 10 points.
 * ------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 430;

    const CELL = 40;
    const COLS = 8;
    const ROWS = 10;

    const BOARD_WIDTH = COLS * CELL;
    const BOARD_HEIGHT = ROWS * CELL;
    const BOARD_X = (CANVAS_WIDTH - BOARD_WIDTH) / 2;
    const BOARD_Y = 15;

    const SPAWN_COL = 3;
    const DROP_INTERVAL_START = 500;
    const DROP_INTERVAL_END = 130;
    const DROP_HOLD_INTERVAL = 65;
    const GAME_DURATION = 3 * 60 * 1000;
    const GARBAGE_INTERVAL = 20 * 1000;
    const SCORE_PER_LINE = 10;
    const BEST_KEY = 'blockRushBest';

    const COLOR = {
        bgTop: '#060a12',
        bgBottom: '#0b1322',
        board: 'rgba(8, 15, 29, 0.94)',
        boardBorder: 'rgba(56, 189, 248, 0.24)',
        cellA: 'rgba(255, 255, 255, 0.016)',
        cellB: 'rgba(255, 255, 255, 0.034)',
        grid: 'rgba(148, 163, 184, 0.075)'
    };

    function LoadBestScore() {
        try {
            const value = Number(global.localStorage.getItem(BEST_KEY));
            return Number.isFinite(value) && value > 0 ? value : 0;
        } catch (error) {
            return 0;
        }
    }

    function SaveBestScore(score) {
        try {
            global.localStorage.setItem(BEST_KEY, String(score));
        } catch (error) {
            // localStorage can be unavailable in private mode.
        }
    }

    function FormatTime(totalSeconds) {
        const seconds = Math.max(0, Math.ceil(totalSeconds));
        const minutes = Math.floor(seconds / 60);
        const rest = seconds % 60;
        return minutes + ':' + String(rest).padStart(2, '0');
    }

    function RoundRect(ctx, x, y, width, height, radius) {
        const r = Math.max(0, Math.min(radius, width / 2, height / 2));
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r);
        ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r);
        ctx.closePath();
    }

    class BlockRushGame {
        constructor(canvas, options) {
            options = options || {};

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.onChange = typeof options.onChange === 'function' ? options.onChange : null;
            this.best = LoadBestScore();

            this._boundLoop = this._loop.bind(this);
            this._boundKeyDown = this._handleKeyDown.bind(this);
            this._boundKeyUp = this._handleKeyUp.bind(this);
            this._boundBlur = this._handleBlur.bind(this);
            this._boundPointerUp = this._handlePointerUp.bind(this);
            this._boundResize = this._resizeCanvas.bind(this);

            this._resizeCanvas();
            global.addEventListener('resize', this._boundResize);
            global.addEventListener('keydown', this._boundKeyDown);
            global.addEventListener('keyup', this._boundKeyUp);
            global.addEventListener('blur', this._boundBlur);
            global.addEventListener('pointerup', this._boundPointerUp);
            global.addEventListener('pointercancel', this._boundPointerUp);

            this.reset();
            this._lastTime = performance.now();
            this._animationFrame = global.requestAnimationFrame(this._boundLoop);
        }

        /* Public API ------------------------------------------------- */

        reset() {
            this.blocks = this._createEmptyBoard();
            this.blockX = SPAWN_COL;
            this.blockY = 0;
            this.score = 0;
            this.lines = 0;
            this.fallTimer = 0;
            this.flash = 0;
            this.elapsed = 0;
            this.timeLeft = GAME_DURATION;
            this.dropHeld = false;
            this.dropHoldTimer = 0;
            this.garbageTimer = 0;
            this.garbageWave = 0;
            this.garbageFlash = 0;
            this.recentGarbage = [];
            this.reason = '';
            this.state = 'playing';
            this._lastEmitSecond = null;
            this._emit();
        }

        move(direction) {
            if (this.state !== 'playing') return;

            const nextX = this.blockX + direction;
            if (nextX < 0 || nextX >= COLS) return;

            // Do not move sideways into a placed block at the same height.
            if (this.blocks[this.blockY][nextX] !== 0) return;

            this.blockX = nextX;
        }

        drop() {
            if (this.state !== 'playing') return;

            this.fallTimer = 0;
            this._stepDown();
        }

        pressDrop() {
            if (this.state !== 'playing') return;

            this.dropHeld = true;
            this.dropHoldTimer = 0;
            this.drop();
        }

        releaseDrop() {
            this.dropHeld = false;
            this.dropHoldTimer = 0;
        }

        destroy() {
            this.releaseDrop();
            global.cancelAnimationFrame(this._animationFrame);
            global.removeEventListener('resize', this._boundResize);
            global.removeEventListener('keydown', this._boundKeyDown);
            global.removeEventListener('keyup', this._boundKeyUp);
            global.removeEventListener('blur', this._boundBlur);
            global.removeEventListener('pointerup', this._boundPointerUp);
            global.removeEventListener('pointercancel', this._boundPointerUp);
        }

        /* Game logic ------------------------------------------------- */

        _createEmptyBoard() {
            return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
        }

        _stepDown() {
            const canFall =
                this.blockY < ROWS - 1 &&
                this.blocks[this.blockY + 1][this.blockX] === 0;

            if (canFall) {
                this.blockY++;
                return;
            }

            this._placeBlock();
        }

        _placeBlock() {
            // This mirrors drop_block() in the Pygame version.
            this.blocks[this.blockY][this.blockX] = 1;

            const cleared = this._clearFullLines();
            if (cleared > 0) {
                this.score += cleared * SCORE_PER_LINE;
                this.lines += cleared;
                this.flash = 1;

                if (this.score > this.best) {
                    this.best = this.score;
                    SaveBestScore(this.best);
                }
            }

            this.blockX = SPAWN_COL;
            this.blockY = 0;
            this.fallTimer = 0;

            // The next block cannot spawn: game over.
            if (this.blocks[this.blockY][this.blockX] !== 0) {
                this.state = 'gameover';
                this.reason = 'stack';
                this.dropHeld = false;
                this.dropHoldTimer = 0;
            }

            this._emit();
        }

        _clearFullLines() {
            let cleared = 0;

            for (let y = ROWS - 1; y >= 0; y--) {
                const isFull = this.blocks[y].every((value) => value !== 0);
                if (!isFull) continue;

                this.blocks.splice(y, 1);
                this.blocks.unshift(new Array(COLS).fill(0));
                cleared++;

                // Check the same row index again: a new row has fallen into it.
                y++;
            }

            return cleared;
        }

        _getGhostY() {
            let y = this.blockY;
            while (y < ROWS - 1 && this.blocks[y + 1][this.blockX] === 0) {
                y++;
            }
            return y;
        }

        _cellKey(x, y) {
            return y * COLS + x;
        }

        _wouldCompleteRow(y, x) {
            return this.blocks[y].every((value, index) => index === x || value !== 0);
        }

        _spawnGarbage(count) {
            const reserved = new Set([
                this._cellKey(SPAWN_COL, 0),
                this._cellKey(SPAWN_COL, 1),
                this._cellKey(this.blockX, this.blockY)
            ]);
            const candidates = [];

            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    if (this.blocks[y][x] !== 0) continue;
                    if (reserved.has(this._cellKey(x, y))) continue;
                    if (this._wouldCompleteRow(y, x)) continue;
                    candidates.push({ x, y });
                }
            }

            // Fisher-Yates shuffle so the obstacles appear in random cells.
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = candidates[i];
                candidates[i] = candidates[j];
                candidates[j] = temp;
            }

            const amount = Math.min(count, candidates.length);
            this.recentGarbage = [];

            for (let i = 0; i < candidates.length && this.recentGarbage.length < amount; i++) {
                const cell = candidates[i];

                // A previous pick in this wave may have filled the rest of the row.
                if (this._wouldCompleteRow(cell.y, cell.x)) continue;

                this.blocks[cell.y][cell.x] = 2;
                this.recentGarbage.push(cell);
            }

            if (this.recentGarbage.length > 0) this.garbageFlash = 1;
        }

        _getDropInterval() {
            const progress = Math.min(this.elapsed / GAME_DURATION, 1);
            return DROP_INTERVAL_START -
                (DROP_INTERVAL_START - DROP_INTERVAL_END) * progress;
        }

        _getDisplayedSecond() {
            return Math.ceil(this.timeLeft / 1000);
        }

        _endGame(reason) {
            this.state = 'gameover';
            this.reason = reason;
            this.releaseDrop();
            this.fallTimer = 0;
            this._emit();
        }

        /* Loop ------------------------------------------------------- */

        _loop(now) {
            let deltaTime = now - this._lastTime;
            this._lastTime = now;

            if (!Number.isFinite(deltaTime) || deltaTime < 0) deltaTime = 0;
            deltaTime = Math.min(deltaTime, 100);

            if (this.state === 'playing') {
                this.elapsed = Math.min(this.elapsed + deltaTime, GAME_DURATION);
                this.timeLeft = GAME_DURATION - this.elapsed;

                if (this.timeLeft <= 0) {
                    this._endGame('time');
                } else {
                    // Holding the drop button keeps moving the block down.
                    if (this.dropHeld) {
                        this.dropHoldTimer += deltaTime;
                        while (
                            this.dropHoldTimer >= DROP_HOLD_INTERVAL &&
                            this.state === 'playing'
                        ) {
                            this.dropHoldTimer -= DROP_HOLD_INTERVAL;
                            this.drop();
                        }
                    }

                    if (this.state === 'playing') {
                        const interval = this._getDropInterval();
                        this.fallTimer += deltaTime;

                        while (this.fallTimer >= interval) {
                            this.fallTimer -= interval;
                            this._stepDown();

                            if (this.state !== 'playing') {
                                this.fallTimer = 0;
                                break;
                            }
                        }
                    }

                    // Obstacle blocks appear on a timer and increase every wave.
                    if (this.state === 'playing') {
                        this.garbageTimer += deltaTime;
                        if (this.garbageTimer >= GARBAGE_INTERVAL) {
                            this.garbageTimer -= GARBAGE_INTERVAL;
                            this.garbageWave += 1;
                            this._spawnGarbage(this.garbageWave);
                        }
                    }
                }

                if (this.state === 'playing' &&
                    this._getDisplayedSecond() !== this._lastEmitSecond) {
                    this._emit();
                }
            }

            if (this.flash > 0) {
                this.flash = Math.max(0, this.flash - deltaTime / 240);
            }

            if (this.garbageFlash > 0) {
                this.garbageFlash = Math.max(0, this.garbageFlash - deltaTime / 700);
            }

            this._draw();
            this._animationFrame = global.requestAnimationFrame(this._boundLoop);
        }

        /* Input ------------------------------------------------------ */

        _handleKeyDown(event) {
            const key = event.key;
            const isMoveKey = key === 'ArrowLeft' || key === 'ArrowRight' ||
                key === 'a' || key === 'A' || key === 'd' || key === 'D';
            const isDropKey = key === 'ArrowDown' || key === 's' || key === 'S' ||
                key === ' ' || key === 'Spacebar';

            if (isMoveKey || isDropKey) event.preventDefault();

            if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
                this.move(-1);
                return;
            }
            if (key === 'ArrowRight' || key === 'd' || key === 'D') {
                this.move(1);
                return;
            }
            if (isDropKey) {
                if (!event.repeat && !this.dropHeld) this.pressDrop();
                return;
            }
            if (key === 'r' || key === 'R') {
                if (!event.repeat) this.reset();
                return;
            }
            if (key === 'Enter' && this.state === 'gameover') {
                this.reset();
            }
        }

        _handleKeyUp(event) {
            const key = event.key;
            if (key === 'ArrowDown' || key === 's' || key === 'S' ||
                key === ' ' || key === 'Spacebar') {
                this.releaseDrop();
            }
        }

        _handleBlur() {
            this.releaseDrop();
        }

        _handlePointerUp() {
            this.releaseDrop();
        }

        _emit() {
            const second = this._getDisplayedSecond();
            this._lastEmitSecond = second;

            if (!this.onChange) return;
            this.onChange({
                score: this.score,
                best: this.best,
                lines: this.lines,
                timeLeft: second,
                timeText: FormatTime(second),
                reason: this.reason,
                state: this.state
            });
        }

        /* Rendering -------------------------------------------------- */

        _resizeCanvas() {
            const dpr = Math.min(global.devicePixelRatio || 1, 2);
            this.canvas.width = CANVAS_WIDTH * dpr;
            this.canvas.height = CANVAS_HEIGHT * dpr;
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.ctx.imageSmoothingEnabled = true;
        }

        _draw() {
            const ctx = this.ctx;

            this._drawBackground();
            this._drawBoard();

            // Placed blocks (Pygame: draw_blocks)
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    if (this.blocks[y][x] === 1) {
                        this._drawBlock(x, y, false);
                    } else if (this.blocks[y][x] === 2) {
                        this._drawGarbage(x, y);
                    }
                }
            }

            // Falling block and its landing preview
            if (this.state === 'playing') {
                this._drawGhost();
                this._drawFallingTrail();
                this._drawBlock(this.blockX, this.blockY, true);
            }

            if (this.garbageFlash > 0) {
                this._drawGarbageFlash();
            }

            if (this.flash > 0) {
                ctx.save();
                ctx.globalAlpha = this.flash * 0.16;
                ctx.fillStyle = '#e0f2fe';
                RoundRect(ctx, BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT, 12);
                ctx.fill();
                ctx.restore();
            }
        }

        _drawBackground() {
            const ctx = this.ctx;

            const background = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            background.addColorStop(0, COLOR.bgTop);
            background.addColorStop(1, COLOR.bgBottom);
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            const glow = ctx.createRadialGradient(
                CANVAS_WIDTH / 2, BOARD_Y + BOARD_HEIGHT / 2, 30,
                CANVAS_WIDTH / 2, BOARD_Y + BOARD_HEIGHT / 2, 300
            );
            glow.addColorStop(0, 'rgba(56, 189, 248, 0.11)');
            glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }

        _drawBoard() {
            const ctx = this.ctx;

            ctx.save();
            RoundRect(ctx, BOARD_X - 5, BOARD_Y - 5, BOARD_WIDTH + 10, BOARD_HEIGHT + 10, 16);
            ctx.fillStyle = COLOR.board;
            ctx.fill();
            ctx.strokeStyle = COLOR.boardBorder;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

            // Checkerboard cell backgrounds
            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    ctx.fillStyle = (x + y) % 2 === 0 ? COLOR.cellA : COLOR.cellB;
                    ctx.fillRect(
                        BOARD_X + x * CELL,
                        BOARD_Y + y * CELL,
                        CELL,
                        CELL
                    );
                }
            }

            // Grid lines
            ctx.save();
            ctx.strokeStyle = COLOR.grid;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x <= COLS; x++) {
                const px = BOARD_X + x * CELL + 0.5;
                ctx.moveTo(px, BOARD_Y);
                ctx.lineTo(px, BOARD_Y + BOARD_HEIGHT);
            }
            for (let y = 0; y <= ROWS; y++) {
                const py = BOARD_Y + y * CELL + 0.5;
                ctx.moveTo(BOARD_X, py);
                ctx.lineTo(BOARD_X + BOARD_WIDTH, py);
            }
            ctx.stroke();
            ctx.restore();
        }

        _drawBlock(x, y, isFalling) {
            const ctx = this.ctx;
            const px = BOARD_X + x * CELL + 2.5;
            const py = BOARD_Y + y * CELL + 2.5;
            const size = CELL - 5;

            ctx.save();

            if (isFalling) {
                ctx.shadowColor = 'rgba(125, 211, 252, 0.8)';
                ctx.shadowBlur = 16;
            }

            const gradient = ctx.createLinearGradient(px, py, px, py + size);
            if (isFalling) {
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.45, '#e0f2fe');
                gradient.addColorStop(1, '#7dd3fc');
            } else {
                gradient.addColorStop(0, '#67d9ff');
                gradient.addColorStop(0.45, '#38bdf8');
                gradient.addColorStop(1, '#0e7cc4');
            }

            RoundRect(ctx, px, py, size, size, 7);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = isFalling
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(8, 47, 73, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Small top highlight
            if (isFalling) {
                ctx.beginPath();
                ctx.moveTo(px + 7, py + 7);
                ctx.lineTo(px + size - 7, py + 7);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            ctx.restore();
        }

        _drawGarbage(x, y) {
            const ctx = this.ctx;
            const px = BOARD_X + x * CELL + 2.5;
            const py = BOARD_Y + y * CELL + 2.5;
            const size = CELL - 5;

            ctx.save();

            const gradient = ctx.createLinearGradient(px, py, px, py + size);
            gradient.addColorStop(0, '#fdba74');
            gradient.addColorStop(0.45, '#f97316');
            gradient.addColorStop(1, '#c2410c');

            RoundRect(ctx, px, py, size, size, 7);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.strokeStyle = 'rgba(67, 20, 7, 0.65)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Cross mark to make obstacles easy to recognise.
            ctx.beginPath();
            ctx.moveTo(px + 11, py + 11);
            ctx.lineTo(px + size - 11, py + size - 11);
            ctx.moveTo(px + size - 11, py + 11);
            ctx.lineTo(px + 11, py + size - 11);
            ctx.strokeStyle = 'rgba(67, 20, 7, 0.5)';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            ctx.restore();
        }

        _drawGarbageFlash() {
            const ctx = this.ctx;
            const alpha = Math.min(1, this.garbageFlash);

            ctx.save();
            ctx.shadowColor = 'rgba(248, 113, 113, 0.9)';
            ctx.shadowBlur = 12;
            ctx.strokeStyle = 'rgba(254, 202, 202, ' + alpha + ')';
            ctx.lineWidth = 2;

            for (let i = 0; i < this.recentGarbage.length; i++) {
                const cell = this.recentGarbage[i];
                RoundRect(
                    ctx,
                    BOARD_X + cell.x * CELL + 1.5,
                    BOARD_Y + cell.y * CELL + 1.5,
                    CELL - 3,
                    CELL - 3,
                    8
                );
                ctx.stroke();
            }

            ctx.restore();
        }

        _drawGhost() {
            const ghostY = this._getGhostY();
            if (ghostY === this.blockY) return;

            const ctx = this.ctx;
            const px = BOARD_X + this.blockX * CELL + 4;
            const py = BOARD_Y + ghostY * CELL + 4;
            const size = CELL - 8;

            ctx.save();
            ctx.setLineDash([5, 4]);
            ctx.strokeStyle = 'rgba(125, 211, 252, 0.52)';
            ctx.lineWidth = 1.5;
            RoundRect(ctx, px, py, size, size, 6);
            ctx.stroke();
            ctx.restore();
        }

        _drawFallingTrail() {
            if (this.blockY <= 0) return;

            const ctx = this.ctx;
            const centerX = BOARD_X + this.blockX * CELL + CELL / 2;
            const topY = BOARD_Y + this.blockY * CELL;
            const trail = ctx.createLinearGradient(0, BOARD_Y, 0, topY);
            trail.addColorStop(0, 'rgba(125, 211, 252, 0)');
            trail.addColorStop(1, 'rgba(125, 211, 252, 0.16)');

            ctx.save();
            ctx.fillStyle = trail;
            ctx.fillRect(centerX - 4, BOARD_Y, 8, topY - BOARD_Y);
            ctx.restore();
        }
    }

    global.BlockRushGame = BlockRushGame;
})(window);
