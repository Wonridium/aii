"""Single source of truth for timing. 96 bpm, 12 bars of 4/4 = 30 s."""
BPM = 96
BEAT = 60 / BPM          # 0.625 s
BAR = 4 * BEAT           # 2.5 s
DUR = 12 * BAR           # 30.0 s


def b(bar, beat=1.0):
    """Time of (1-based) bar/beat."""
    return (bar - 1) * BAR + (beat - 1) * BEAT


T = dict(
    # A: late-night coding
    typing_end=b(2, 1) - 0.1,
    run=b(2, 1) - 0.35,
    ok=[b(2, 1), b(2, 2), b(2, 3)],
    fail=b(2, 4),
    # B: close-up, the bug crawls out
    cut_close=b(3, 1),
    bug_out=b(3, 1.5),
    eep=b(3, 2.2),
    clawd_in=b(3, 2.6),
    found=b(3, 3.3),
    # C: chase
    cut_chase=b(4, 1),
    bug_jump=b(4, 1),
    keys=[b(4, 2) + i * BEAT / 2 for i in range(8)],   # bug hops across keys on 8ths
    to_mug=b(5, 2),
    under_mug=b(6, 1),
    lift=b(6, 3),
    reveal=b(6, 4),
    # D: tender
    cut_tender=b(7, 1),
    hop_down=b(7, 2),
    sign=b(7, 3),
    lost=b(8, 1) - 0.1,
    nod=b(8, 3) - 0.05,
    cup=b(8, 4),
    # E: window
    cut_window=b(9, 1),
    open=b(9, 1.5),
    glow=b(9, 2.5),
    go=b(9, 2) - 0.2,
    fly=b(9, 3),
    thanks=b(9, 3.5),
    # F: tests re-run
    cut_tests=b(10, 1),
    checks=[b(10, 2) + i * BEAT / 2 for i in range(8)],
    passed=b(11, 2),
    green=b(11, 3.4),
    # G: goodbye
    cut_end=b(12, 1),
    blinks=[b(12, 2), b(12, 2.5)],
    title=b(12, 3),
)
