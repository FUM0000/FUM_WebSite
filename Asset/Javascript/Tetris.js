/*
 * Tetris
 * ------------------------------------------------------------------
 * A classic falling-block puzzle built in the same visual style as
 * Block Rush.
 *
 * The board is 10 columns x 20 rows. Rotate and drop tetrominoes,
 * fill a full row to clear it, and level up as the speed increases.
 * ------------------------------------------------------------------
 */
(function (global) {
    'use strict';

    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 520;

    const CELL = 24;
    const COLS = 10;
    const ROWS = 20;

    const BOARD_WIDTH = COLS * CELL;
    const BOARD_HEIGHT = ROWS * CELL;
    const BOARD_X = 20;
    const BOARD_Y = 20;

    const PANEL_X = 276;
    const PANEL_WIDTH = 104;

    const PREVIEW_CELL = 16;
    const PREVIEW_BOX_HEIGHT = 62;
    const PREVIEW_GAP = 6;
    const PREVIEW_Y = 36;

    const HOLD_LABEL_Y = 264;
    const HOLD_BOX_Y = 274;
    const HOLD_BOX_HEIGHT = 78;

    const BEST_KEY = 'tetrisBest';

    const LOCK_DELAY = 500;
    const MAX_LOCK_RESETS = 12;
    const SOFT_DROP_INTERVAL = 42;
    const LINES_PER_LEVEL = 10;
    const MAX_LEVEL = 20;

    const LINE_SCORES = [0, 100, 300, 500, 800];
    const SOFT_DROP_SCORE = 1;
    const HARD_DROP_SCORE = 2;

    const COLOR = {
        bgTop: '#060a12',
        bgBottom: '#0b1322',
        board: 'rgba(8, 15, 29, 0.94)',
        boardBorder: 'rgba(56, 189, 248, 0.24)',
        cellA: 'rgba(255, 255, 255, 0.016)',
        cellB: 'rgba(255, 255, 255, 0.034)',
        grid: 'rgba(148, 163, 184, 0.075)',
        panel: 'rgba(8, 15, 29, 0.9)',
        panelBorder: 'rgba(56, 189, 248, 0.18)',
        label: '#78909c'
    };

    const PIECES = {
        I: {
            color: { light: '#cffafe', mid: '#22d3ee', dark: '#0e7490' },
            rotations: [
                [[0, 1], [1, 1], [2, 1], [3, 1]],
                [[2, 0], [2, 1], [2, 2], [2, 3]],
                [[0, 2], [1, 2], [2, 2], [3, 2]],
                [[1, 0], [1, 1], [1, 2], [1, 3]]
            ]
        },
        O: {
            color: { light: '#fef9c3', mid: '#facc15', dark: '#a16207' },
            rotations: [
                [[0, 0], [1, 0], [0, 1], [1, 1]],
                [[0, 0], [1, 0], [0, 1], [1, 1]],
                [[0, 0], [1, 0], [0, 1], [1, 1]],
                [[0, 0], [1, 0], [0, 1], [1, 1]]
            ]
        },
        T: {
            color: { light: '#e9d5ff', mid: '#c084fc', dark: '#7e22ce' },
            rotations: [
                [[1, 0], [0, 1], [1, 1], [2, 1]],
                [[1, 0], [1, 1], [2, 1], [1, 2]],
                [[0, 1], [1, 1], [2, 1], [1, 2]],
                [[1, 0], [0, 1], [1, 1], [1, 2]]
            ]
        },
        S: {
            color: { light: '#bbf7d0', mid: '#4ade80', dark: '#15803d' },
            rotations: [
                [[1, 0], [2, 0], [0, 1], [1, 1]],
                [[1, 0], [1, 1], [2, 1], [2, 2]],
                [[1, 1], [2, 1], [0, 2], [1, 2]],
                [[0, 0], [0, 1], [1, 1], [1, 2]]
            ]
        },
        Z: {
            color: { light: '#fecaca', mid: '#f87171', dark: '#b91c1c' },
            rotations: [
                [[0, 0], [1, 0], [1, 1], [2, 1]],
                [[2, 0], [1, 1], [2, 1], [1, 2]],
                [[0, 1], [1, 1], [1, 2], [2, 2]],
                [[1, 0], [0, 1], [1, 1], [0, 2]]
            ]
        },
        J: {
            color: { light: '#bfdbfe', mid: '#60a5fa', dark: '#1d4ed8' },
            rotations: [
                [[0, 0], [0, 1], [1, 1], [2, 1]],
                [[1, 0], [2, 0], [1, 1], [1, 2]],
                [[0, 1], [1, 1], [2, 1], [2, 2]],
                [[1, 0], [1, 1], [0, 2], [1, 2]]
            ]
        },
        L: {
            color: { light: '#fed7aa', mid: '#fb923c', dark: '#c2410c' },
            rotations: [
                [[2, 0], [0, 1], [1, 1], [2, 1]],
                [[1, 0], [1, 1], [1, 2], [2, 2]],
                [[0, 1], [1, 1], [2, 1], [0, 2]],
                [[0, 0], [1, 0], [1, 1], [1, 2]]
            ]
        }
    };

    const TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    const KICKS = [
        [0, 0],
        [-1, 0], [1, 0], [-2, 0], [2, 0],
        [0, -1], [-1, -1], [1, -1], [-2, -1], [2, -1],
        [0, -2], [-1, -2], [1, -2]
    ];

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

    class TetrisGame {
        constructor(canvas, options) {
            options = options || {};

            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.onChange = typeof options.onChange === 'function' ? options.onChange : null;
            this.best = LoadBestScore();
            this._savedBest = this.best;

            this._boundLoop = this._loop.bind(this);
            this._boundKeyDown = this._handleKeyDown.bind(this);
            this._boundKeyUp = this._handleKeyUp.bind(this);
            this._boundBlur = this._handleBlur.bind(this);
            this._boundPointerUp = this._handlePointerUp.bind(this);
            this._boundResize = this._resizeCanvas.bind(this);
            this._boundVisibility = this._handleVisibility.bind(this);

            this._resizeCanvas();
            global.addEventListener('resize', this._boundResize);
            global.addEventListener('keydown', this._boundKeyDown);
            global.addEventListener('keyup', this._boundKeyUp);
            global.addEventListener('blur', this._boundBlur);
            global.addEventListener('pointerup', this._boundPointerUp);
            global.addEventListener('pointercancel', this._boundPointerUp);
            document.addEventListener('visibilitychange', this._boundVisibility);

            this.reset();
            this._lastTime = performance.now();
            this._animationFrame = global.requestAnimationFrame(this._boundLoop);
        }

        /* Public API ------------------------------------------------- */

        reset() {
            this.board = this._createEmptyBoard();
            this.bag = [];
            this.nextQueue = [];

            for (let i = 0; i < 3; i++) {
                this.nextQueue.push(this._takeFromBag());
            }

            this.holdType = null;
            this.canHold = true;
            this.score = 0;
            this.lines = 0;
            this.level = 1;
            this.pieces = 0;
            this.gravityTimer = 0;
            this.lockTimer = 0;
            this.lockResets = 0;
            this.softDropHeld = false;
            this.softDropTimer = 0;
            this.flash = 0;
            this.state = 'playing';
            this.reason = '';
            this._lastEmitKey = '';

            this._spawnNext();
            this._emitIfChanged();
        }

        move(direction) {
            if (this.state !== 'playing') return;

            const nextX = this.piece.x + direction;
            if (!this._canPlace(this.piece.type, this.piece.rotation, nextX, this.piece.y)) {
                return;
            }

            this.piece.x = nextX;
            this._touchLockDelay();
        }

        rotate(direction) {
            if (this.state !== 'playing') return;

            const step = direction < 0 ? 3 : 1;
            const nextRotation = (this.piece.rotation + step) % 4;

            for (let i = 0; i < KICKS.length; i++) {
                const offset = KICKS[i];
                const nextX = this.piece.x + offset[0];
                const nextY = this.piece.y + offset[1];

                if (this._canPlace(this.piece.type, nextRotation, nextX, nextY)) {
                    this.piece.rotation = nextRotation;
                    this.piece.x = nextX;
                    this.piece.y = nextY;
                    this._touchLockDelay();
                    return;
                }
            }
        }

        pressSoftDrop() {
            if (this.state !== 'playing') return;

            this.softDropHeld = true;
            this.softDropTimer = 0;
            this._softDropStep();
        }

        releaseSoftDrop() {
            this.softDropHeld = false;
            this.softDropTimer = 0;
        }

        hardDrop() {
            if (this.state !== 'playing') return;

            let distance = 0;
            while (this._canPlace(
                this.piece.type,
                this.piece.rotation,
                this.piece.x,
                this.piece.y + 1
            )) {
                this.piece.y++;
                distance++;
            }

            this.score += distance * HARD_DROP_SCORE;
            this._updateBest();
            this._lockPiece();
            this._emitIfChanged();
        }

        hold() {
            if (this.state !== 'playing' || !this.canHold) return;

            const currentType = this.piece.type;

            if (this.holdType) {
                const swapType = this.holdType;
                this.holdType = currentType;
                this._spawnPiece(swapType);
            } else {
                this.holdType = currentType;
                this._spawnNext();
            }

            this.canHold = false;
            this.gravityTimer = 0;
            this.lockTimer = 0;
            this.lockResets = 0;
            this._emitIfChanged();
        }

        togglePause() {
            if (this.state === 'playing') {
                this.state = 'paused';
                this.releaseSoftDrop();
            } else if (this.state === 'paused') {
                this.state = 'playing';
                this._lastTime = performance.now();
            } else {
                return;
            }

            this._emitIfChanged();
        }

        destroy() {
            this.releaseSoftDrop();
            global.cancelAnimationFrame(this._animationFrame);
            global.removeEventListener('resize', this._boundResize);
            global.removeEventListener('keydown', this._boundKeyDown);
            global.removeEventListener('keyup', this._boundKeyUp);
            global.removeEventListener('blur', this._boundBlur);
            global.removeEventListener('pointerup', this._boundPointerUp);
            global.removeEventListener('pointercancel', this._boundPointerUp);
            document.removeEventListener('visibilitychange', this._boundVisibility);
        }

        /* Game logic ------------------------------------------------- */

        _createEmptyBoard() {
            return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
        }

        _takeFromBag() {
            if (!this.bag.length) {
                this.bag = TYPES.slice();
                for (let i = this.bag.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const temp = this.bag[i];
                    this.bag[i] = this.bag[j];
                    this.bag[j] = temp;
                }
            }

            return this.bag.pop();
        }

        _spawnNext() {
            const type = this.nextQueue.shift();
            this.nextQueue.push(this._takeFromBag());
            this._spawnPiece(type);
        }

        _spawnPiece(type) {
            this.piece = {
                type: type,
                rotation: 0,
                x: this._spawnX(type),
                y: 0
            };
            this.pieces++;
            this.gravityTimer = 0;
            this.lockTimer = 0;
            this.lockResets = 0;

            if (!this._canPlace(this.piece.type, this.piece.rotation, this.piece.x, this.piece.y)) {
                this.state = 'gameover';
                this.reason = 'stack';
                this.releaseSoftDrop();
                this._saveBest();
            }
        }

        _spawnX(type) {
            const cells = PIECES[type].rotations[0];
            let maxX = 0;

            for (let i = 0; i < cells.length; i++) {
                maxX = Math.max(maxX, cells[i][0]);
            }

            return Math.floor((COLS - (maxX + 1)) / 2);
        }

        _canPlace(type, rotation, x, y) {
            const cells = PIECES[type].rotations[rotation];

            for (let i = 0; i < cells.length; i++) {
                const boardX = x + cells[i][0];
                const boardY = y + cells[i][1];

                if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                    return false;
                }
                if (boardY >= 0 && this.board[boardY][boardX] !== 0) {
                    return false;
                }
            }

            return true;
        }

        _canMove(dx, dy) {
            return this._canPlace(
                this.piece.type,
                this.piece.rotation,
                this.piece.x + dx,
                this.piece.y + dy
            );
        }

        _getGhostY() {
            let y = this.piece.y;

            while (this._canPlace(
                this.piece.type,
                this.piece.rotation,
                this.piece.x,
                y + 1
            )) {
                y++;
            }

            return y;
        }

        _touchLockDelay() {
            if (this._canMove(0, 1)) return;
            if (this.lockResets >= MAX_LOCK_RESETS) return;

            this.lockTimer = 0;
            this.lockResets++;
        }

        _softDropStep() {
            if (this.state !== 'playing') return;

            if (this._canMove(0, 1)) {
                this.piece.y++;
                this.score += SOFT_DROP_SCORE;
                this.lockTimer = 0;
                this.lockResets = 0;
                this._updateBest();
                return;
            }

            // Holding down on a grounded piece makes it lock a little sooner.
            this.lockTimer = Math.max(this.lockTimer, LOCK_DELAY - 150);
        }

        _lockPiece() {
            if (this.state !== 'playing') return;

            const type = this.piece.type;
            const cells = PIECES[type].rotations[this.piece.rotation];
            let lockedAboveBoard = false;

            for (let i = 0; i < cells.length; i++) {
                const boardX = this.piece.x + cells[i][0];
                const boardY = this.piece.y + cells[i][1];

                if (boardY < 0) {
                    lockedAboveBoard = true;
                    continue;
                }

                this.board[boardY][boardX] = type;
            }

            const cleared = this._clearFullLines();

            if (cleared > 0) {
                this.score += LINE_SCORES[Math.min(cleared, 4)] * this.level;
                this.lines += cleared;
                this.level = Math.min(
                    MAX_LEVEL,
                    Math.floor(this.lines / LINES_PER_LEVEL) + 1
                );
                this.flash = 1;
                this._updateBest();
            }

            this.canHold = true;
            this.gravityTimer = 0;
            this.lockTimer = 0;
            this.lockResets = 0;

            if (lockedAboveBoard) {
                this._endGame('stack');
                return;
            }

            this._spawnNext();
            this._saveBest();
            this._emitIfChanged();
        }

        _clearFullLines() {
            let cleared = 0;

            for (let y = ROWS - 1; y >= 0; y--) {
                const isFull = this.board[y].every((value) => value !== 0);
                if (!isFull) continue;

                this.board.splice(y, 1);
                this.board.unshift(new Array(COLS).fill(0));
                cleared++;

                // Check the same row index again: a new row has fallen into it.
                y++;
            }

            return cleared;
        }

        _getDropInterval() {
            const level = Math.min(this.level, MAX_LEVEL);
            return Math.max(70, 800 * Math.pow(0.86, level - 1));
        }

        _updateBest() {
            if (this.score > this.best) {
                this.best = this.score;
            }
        }

        _saveBest() {
            if (this.best <= this._savedBest) return;
            this._savedBest = this.best;
            SaveBestScore(this.best);
        }

        _endGame(reason) {
            this.state = 'gameover';
            this.reason = reason;
            this.releaseSoftDrop();
            this.gravityTimer = 0;
            this.lockTimer = 0;
            this._saveBest();
            this._emitIfChanged();
        }

        /* Loop ------------------------------------------------------- */

        _loop(now) {
            let deltaTime = now - this._lastTime;
            this._lastTime = now;

            if (!Number.isFinite(deltaTime) || deltaTime < 0) deltaTime = 0;
            deltaTime = Math.min(deltaTime, 100);

            if (this.state === 'playing') {
                this._updatePlaying(deltaTime);
            }

            if (this.flash > 0) {
                this.flash = Math.max(0, this.flash - deltaTime / 240);
            }

            this._draw();
            this._emitIfChanged();
            this._animationFrame = global.requestAnimationFrame(this._boundLoop);
        }

        _updatePlaying(deltaTime) {
            if (this.softDropHeld) {
                this.softDropTimer += deltaTime;

                while (
                    this.softDropTimer >= SOFT_DROP_INTERVAL &&
                    this.state === 'playing'
                ) {
                    this.softDropTimer -= SOFT_DROP_INTERVAL;
                    this._softDropStep();
                }
            }

            if (this.state !== 'playing') return;

            if (this._canMove(0, 1)) {
                this.gravityTimer += deltaTime;
                const interval = this._getDropInterval();

                while (this.gravityTimer >= interval && this.state === 'playing') {
                    this.gravityTimer -= interval;

                    if (!this._canMove(0, 1)) {
                        this.gravityTimer = 0;
                        break;
                    }

                    this.piece.y++;
                    this.lockTimer = 0;
                    this.lockResets = 0;
                }

                this.lockTimer = 0;
                this.lockResets = 0;
                return;
            }

            this.lockTimer += deltaTime;

            if (this.lockTimer >= LOCK_DELAY) {
                this._lockPiece();
            }
        }

        /* Input ------------------------------------------------------ */

        _handleKeyDown(event) {
            const key = event.key;

            const isMoveKey = key === 'ArrowLeft' || key === 'ArrowRight' ||
                key === 'a' || key === 'A' || key === 'd' || key === 'D';
            const isDropKey = key === 'ArrowDown' || key === 's' || key === 'S';
            const isRotateKey = key === 'ArrowUp' || key === 'w' || key === 'W' ||
                key === 'x' || key === 'X' || key === 'z' || key === 'Z';
            const isHardDropKey = key === ' ' || key === 'Spacebar' || key === 'Space';

            if (isMoveKey || isDropKey || isRotateKey || isHardDropKey) {
                event.preventDefault();
            }

            if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
                this.move(-1);
                return;
            }
            if (key === 'ArrowRight' || key === 'd' || key === 'D') {
                this.move(1);
                return;
            }
            if (isDropKey) {
                if (!event.repeat && !this.softDropHeld) this.pressSoftDrop();
                return;
            }
            if (key === 'ArrowUp' || key === 'w' || key === 'W' || key === 'x' || key === 'X') {
                if (!event.repeat) this.rotate(1);
                return;
            }
            if (key === 'z' || key === 'Z') {
                if (!event.repeat) this.rotate(-1);
                return;
            }
            if (isHardDropKey) {
                if (!event.repeat) this.hardDrop();
                return;
            }
            if (key === 'c' || key === 'C' || key === 'Shift') {
                if (!event.repeat) this.hold();
                return;
            }
            if (key === 'p' || key === 'P' || key === 'Escape') {
                if (!event.repeat) this.togglePause();
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

            if (key === 'ArrowDown' || key === 's' || key === 'S') {
                this.releaseSoftDrop();
            }
        }

        _handleBlur() {
            this.releaseSoftDrop();
        }

        _handlePointerUp() {
            this.releaseSoftDrop();
        }

        _handleVisibility() {
            if (document.hidden && this.state === 'playing') {
                this.togglePause();
            }
        }

        _emitIfChanged() {
            const key = [
                this.score,
                this.best,
                this.level,
                this.lines,
                this.state,
                this.reason
            ].join('|');

            if (key === this._lastEmitKey) return;
            this._lastEmitKey = key;

            if (!this.onChange) return;

            this.onChange({
                score: this.score,
                best: this.best,
                level: this.level,
                lines: this.lines,
                state: this.state,
                reason: this.reason
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

            ctx.save();
            RoundRect(ctx, BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT, 10);
            ctx.clip();

            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    const type = this.board[y][x];
                    if (!type) continue;
                    this._drawBlock(x, y, type, false);
                }
            }

            if (this.state === 'playing' || this.state === 'paused') {
                this._drawGhost();
                this._drawCurrentPiece();
            }

            if (this.flash > 0) {
                ctx.globalAlpha = this.flash * 0.14;
                ctx.fillStyle = '#e0f2fe';
                ctx.fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT);
                ctx.globalAlpha = 1;
            }

            ctx.restore();

            this._drawPanel();
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
                CANVAS_WIDTH / 2, BOARD_Y + BOARD_HEIGHT / 2, 340
            );
            glow.addColorStop(0, 'rgba(56, 189, 248, 0.10)');
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

        _drawCurrentPiece() {
            const cells = PIECES[this.piece.type].rotations[this.piece.rotation];

            for (let i = 0; i < cells.length; i++) {
                const x = this.piece.x + cells[i][0];
                const y = this.piece.y + cells[i][1];

                if (y < 0) continue;
                this._drawBlock(x, y, this.piece.type, true);
            }
        }

        _drawGhost() {
            const ghostY = this._getGhostY();
            if (ghostY === this.piece.y) return;

            const ctx = this.ctx;
            const color = PIECES[this.piece.type].color;
            const cells = PIECES[this.piece.type].rotations[this.piece.rotation];

            ctx.save();
            ctx.setLineDash([4, 4]);

            for (let i = 0; i < cells.length; i++) {
                const x = this.piece.x + cells[i][0];
                const y = ghostY + cells[i][1];

                if (y < 0) continue;

                const px = BOARD_X + x * CELL + 3;
                const py = BOARD_Y + y * CELL + 3;
                const size = CELL - 6;

                RoundRect(ctx, px, py, size, size, 5);
                ctx.globalAlpha = 0.14;
                ctx.fillStyle = color.mid;
                ctx.fill();

                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = color.light;
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }

            ctx.restore();
        }

        _drawBlock(x, y, type, isFalling) {
            const px = BOARD_X + x * CELL + 2;
            const py = BOARD_Y + y * CELL + 2;
            const size = CELL - 4;
            const color = PIECES[type].color;
            const ctx = this.ctx;

            ctx.save();

            if (isFalling) {
                ctx.shadowColor = color.mid;
                ctx.shadowBlur = 12;
            }

            const gradient = ctx.createLinearGradient(px, py, px, py + size);

            if (isFalling) {
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.35, color.light);
                gradient.addColorStop(1, color.mid);
            } else {
                gradient.addColorStop(0, color.light);
                gradient.addColorStop(0.45, color.mid);
                gradient.addColorStop(1, color.dark);
            }

            RoundRect(ctx, px, py, size, size, 5);
            ctx.fillStyle = gradient;
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = isFalling
                ? 'rgba(255, 255, 255, 0.9)'
                : 'rgba(8, 47, 73, 0.55)';
            ctx.lineWidth = 1.1;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(px + 4, py + 4);
            ctx.lineTo(px + size - 4, py + 4);
            ctx.strokeStyle = isFalling
                ? 'rgba(255, 255, 255, 0.9)'
                : 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.restore();
        }

        _drawPanel() {
            const ctx = this.ctx;

            ctx.save();
            ctx.textBaseline = 'alphabetic';
            ctx.font = '700 10px "Space Mono", monospace';
            ctx.fillStyle = COLOR.label;
            ctx.fillText('NEXT', PANEL_X, 26);

            for (let i = 0; i < 3; i++) {
                const boxY = PREVIEW_Y + i * (PREVIEW_BOX_HEIGHT + PREVIEW_GAP);
                this._drawPreviewBox(
                    PANEL_X,
                    boxY,
                    PANEL_WIDTH,
                    PREVIEW_BOX_HEIGHT,
                    this.nextQueue[i],
                    1
                );
            }

            ctx.font = '700 10px "Space Mono", monospace';
            ctx.fillStyle = COLOR.label;
            ctx.fillText('HOLD', PANEL_X, HOLD_LABEL_Y);

            this._drawPreviewBox(
                PANEL_X,
                HOLD_BOX_Y,
                PANEL_WIDTH,
                HOLD_BOX_HEIGHT,
                this.holdType,
                this.canHold ? 1 : 0.35
            );

            const progress = (this.lines % LINES_PER_LEVEL) / LINES_PER_LEVEL;
            const progressLabelY = 386;

            ctx.font = '700 10px "Space Mono", monospace';
            ctx.fillStyle = COLOR.label;
            ctx.fillText('LEVEL ' + this.level, PANEL_X, progressLabelY);

            RoundRect(ctx, PANEL_X, progressLabelY + 10, PANEL_WIDTH, 8, 4);
            ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
            ctx.fill();

            if (progress > 0) {
                const bar = ctx.createLinearGradient(
                    PANEL_X, 0,
                    PANEL_X + PANEL_WIDTH, 0
                );
                bar.addColorStop(0, '#38bdf8');
                bar.addColorStop(1, '#22d3ee');

                RoundRect(
                    ctx,
                    PANEL_X,
                    progressLabelY + 10,
                    Math.max(4, PANEL_WIDTH * progress),
                    8,
                    4
                );
                ctx.fillStyle = bar;
                ctx.fill();
            }

            ctx.font = '400 8px "Space Mono", monospace';
            ctx.fillStyle = 'rgba(120, 144, 156, 0.85)';
            ctx.fillText(
                this.level >= MAX_LEVEL
                    ? 'MAX LEVEL'
                    : (LINES_PER_LEVEL - (this.lines % LINES_PER_LEVEL)) + ' LINES TO NEXT',
                PANEL_X,
                progressLabelY + 34
            );

            ctx.restore();
        }

        _drawPreviewBox(x, y, width, height, type, alpha) {
            const ctx = this.ctx;

            ctx.save();
            RoundRect(ctx, x, y, width, height, 8);
            ctx.fillStyle = COLOR.panel;
            ctx.fill();
            ctx.strokeStyle = COLOR.panelBorder;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (type) {
                const cells = PIECES[type].rotations[0];
                let minX = Infinity;
                let maxX = -Infinity;
                let minY = Infinity;
                let maxY = -Infinity;

                for (let i = 0; i < cells.length; i++) {
                    minX = Math.min(minX, cells[i][0]);
                    maxX = Math.max(maxX, cells[i][0]);
                    minY = Math.min(minY, cells[i][1]);
                    maxY = Math.max(maxY, cells[i][1]);
                }

                const shapeWidth = (maxX - minX + 1) * PREVIEW_CELL;
                const shapeHeight = (maxY - minY + 1) * PREVIEW_CELL;
                const startX = x + (width - shapeWidth) / 2;
                const startY = y + (height - shapeHeight) / 2;

                for (let i = 0; i < cells.length; i++) {
                    const px = startX + (cells[i][0] - minX) * PREVIEW_CELL;
                    const py = startY + (cells[i][1] - minY) * PREVIEW_CELL;
                    this._drawMiniBlock(px, py, PREVIEW_CELL, type, alpha);
                }
            }

            ctx.restore();
        }

        _drawMiniBlock(x, y, size, type, alpha) {
            const ctx = this.ctx;
            const color = PIECES[type].color;

            ctx.save();
            ctx.globalAlpha = alpha;

            const gradient = ctx.createLinearGradient(x, y, x, y + size);
            gradient.addColorStop(0, color.light);
            gradient.addColorStop(0.45, color.mid);
            gradient.addColorStop(1, color.dark);

            RoundRect(ctx, x + 1.5, y + 1.5, size - 3, size - 3, 3);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = 'rgba(8, 47, 73, 0.55)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }
    }

    global.TetrisGame = TetrisGame;
})(window);
