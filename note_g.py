"""The first published computer program, run on a simulated Analytical Engine.

In 1843 Ada Lovelace appended seven notes to her translation of Menabrea's
paper on Babbage's Analytical Engine. Note G contains a table of 25 operations
that computes the Bernoulli number she calls B7 (B8 = -1/30 in modern
numbering). This module executes that table, operation card by operation card,
on a store of variable columns V0, V1, V2, ... with exact rational arithmetic.

The table as printed contains a slip in operation 4: it divides V5 by V4
(giving (2n+1)/(2n-1)) instead of V4 by V5. Both versions are available, so the
consequence of that 183-year-old bug can be observed directly.

Lovelace's identity, for n >= 1, with her B1, B3, B5 ... (modern B2, B4, B6 ...):

    0 = A0 + A1*B1 + A3*B3 + ... + B(2n-1)
    A0 = -1/2 * (2n-1)/(2n+1)
    A(2k-1) = 2n(2n-1)...(2n-2k+2) / (2*3*...*2k) = C(2n, 2k-1) / (2k)

Usage:
    python3 note_g.py              # 1843 table vs corrected table, n = 4
    python3 note_g.py --trace      # full operation-by-operation trace
    python3 note_g.py --chain 12   # chain the program to produce B1 ... B23
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from fractions import Fraction

MILL = {
    "+": lambda a, b: a + b,
    "-": lambda a, b: a - b,
    "×": lambda a, b: a * b,
    "÷": lambda a, b: a / b,
}


@dataclass(frozen=True)
class Card:
    """One operation card: V[out...] = V[left] <kind> V[right]."""

    number: int
    kind: str
    left: int
    right: int
    outputs: tuple[int, ...]
    meaning: str


# V21, V22, V23 ... hold B1, B3, B5 ... ; the result B(2n-1) goes to V(20+n).
# The sentinel B_COLUMN in op 10/21 means "the Bernoulli column for this term":
# the table itself uses V21 in op 10, V22 in the first pass of op 21, V23 in
# the second, which is exactly how Lovelace describes the repetition.
B_COLUMN = -1

NOTE_G = {
    1: Card(1, "×", 2, 3, (4, 5, 6), "2n"),
    2: Card(2, "-", 4, 1, (4,), "2n - 1"),
    3: Card(3, "+", 5, 1, (5,), "2n + 1"),
    4: Card(4, "÷", 5, 4, (11,), "(2n - 1)/(2n + 1)   [as printed: V5 ÷ V4]"),
    5: Card(5, "÷", 11, 2, (11,), "1/2 · (2n - 1)/(2n + 1)"),
    6: Card(6, "-", 13, 11, (13,), "A0"),
    7: Card(7, "-", 3, 1, (10,), "n - 1   (loop counter)"),
    8: Card(8, "+", 2, 7, (7,), "2"),
    9: Card(9, "÷", 6, 7, (11,), "A1 = 2n/2"),
    10: Card(10, "×", B_COLUMN, 11, (12,), "B1 · A1"),
    11: Card(11, "+", 12, 13, (13,), "A0 + B1·A1"),
    12: Card(12, "-", 10, 1, (10,), "n - 2"),
    13: Card(13, "-", 6, 1, (6,), "2n - 1, 2n - 3, ..."),
    14: Card(14, "+", 1, 7, (7,), "3, 5, ..."),
    15: Card(15, "÷", 6, 7, (8,), "(2n - 1)/3, ..."),
    16: Card(16, "×", 8, 11, (11,), "partial A"),
    17: Card(17, "-", 6, 1, (6,), "2n - 2, 2n - 4, ..."),
    18: Card(18, "+", 1, 7, (7,), "4, 6, ..."),
    19: Card(19, "÷", 6, 7, (9,), "(2n - 2)/4, ..."),
    20: Card(20, "×", 9, 11, (11,), "A3, A5, ..."),
    21: Card(21, "×", B_COLUMN, 11, (12,), "B3·A3, B5·A5, ..."),
    22: Card(22, "+", 12, 13, (13,), "running sum"),
    23: Card(23, "-", 10, 1, (10,), "loop counter - 1"),
}

CORRECTED_4 = Card(4, "÷", 4, 5, (11,), "(2n - 1)/(2n + 1)")


@dataclass
class Step:
    card: Card
    left: int
    right: int
    value: Fraction


class AnalyticalEngine:
    """A store of numbered columns and a mill that reads operation cards."""

    def __init__(self) -> None:
        self.store: dict[int, Fraction] = {}
        self.trace: list[Step] = []
        self.operations = {kind: 0 for kind in MILL}

    def v(self, i: int) -> Fraction:
        return self.store.get(i, Fraction(0))

    def execute(self, card: Card, left: int, right: int) -> None:
        value = MILL[card.kind](self.v(left), self.v(right))
        for out in card.outputs:
            self.store[out] = value
        self.operations[card.kind] += 1
        self.trace.append(Step(card, left, right, value))

    def run_note_g(self, n: int, faithful_1843: bool = False) -> Fraction:
        """Run Lovelace's table for a given n and return B(2n-1) (her numbering).

        B1 ... B(2n-3) must already sit in V21 ... V(19+n), as in the original.
        The only control flow is the one the table implies: the counter V10 is
        tested for zero, and cards 13-23 are repeated while it is not.
        """
        cards = dict(NOTE_G)
        if not faithful_1843:
            cards[4] = CORRECTED_4

        self.store.update({1: Fraction(1), 2: Fraction(2), 3: Fraction(n)})
        for scratch in (6, 7, 13):  # operation 25 leaves these at zero
            self.store[scratch] = Fraction(0)

        b_column = 21

        def run(number: int) -> None:
            nonlocal b_column
            card = cards[number]
            if card.left == B_COLUMN:
                self.execute(card, b_column, card.right)
                b_column += 1
            else:
                self.execute(card, card.left, card.right)

        for number in range(1, 8):
            run(number)
        if self.v(10) != 0:  # n = 1 needs no B term at all
            for number in range(8, 13):
                run(number)
            while self.v(10) != 0:
                for number in range(13, 24):
                    run(number)

        # Operation 24: B(2n-1) = -(A0 + A1·B1 + ... ), stored in V(20+n).
        result = 20 + n
        self.execute(Card(24, "-", 0, 13, (result,), f"B{2 * n - 1}"), 0, 13)
        # Operation 25: n + 1, ready for the next Bernoulli number.
        self.execute(Card(25, "+", 1, 3, (3,), "n + 1"), 1, 3)
        return self.v(result)


def bernoulli_reference(count: int) -> list[Fraction]:
    """Modern B2, B4, ..., B(2*count), via Akiyama–Tanigawa. Independent check."""
    size = 2 * count + 1
    row = [Fraction(0)] * (size + 1)
    numbers = []
    for m in range(size + 1):
        row[m] = Fraction(1, m + 1)
        for j in range(m, 0, -1):
            row[j - 1] = j * (row[j - 1] - row[j])
        numbers.append(row[0])
    return [numbers[2 * k] for k in range(1, count + 1)]


def chain(count: int, faithful_1843: bool = False) -> list[Fraction]:
    """Let the Engine feed each result into the next run, as Lovelace intended."""
    engine = AnalyticalEngine()
    return [engine.run_note_g(n, faithful_1843) for n in range(1, count + 1)]


def print_trace(engine: AnalyticalEngine) -> None:
    print(f"{'op':>3}  {'card':<16} {'result':<14} {'value':>12}   meaning")
    for step in engine.trace:
        c = step.card
        card = f"V{step.left} {c.kind} V{step.right}"
        outs = ", ".join(f"V{o}" for o in c.outputs)
        print(f"{c.number:>3}  {card:<16} {outs:<14} {str(step.value):>12}   {c.meaning}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--trace", action="store_true", help="show every card")
    parser.add_argument("--chain", type=int, metavar="N", help="compute B1 ... B(2N-1)")
    args = parser.parse_args()

    if args.chain:
        reference = bernoulli_reference(args.chain)
        fixed, buggy = chain(args.chain), chain(args.chain, faithful_1843=True)
        print(f"{'Lovelace':>9}  {'corrected Engine':>28}  {'1843 table as printed':>28}  check")
        for n, (ok, bad, ref) in enumerate(zip(fixed, buggy, reference), start=1):
            print(f"{'B' + str(2 * n - 1):>9}  {str(ok):>28}  {str(bad):>28}  "
                  f"{'✓' if ok == ref else '✗'}")
        return

    stored = bernoulli_reference(3)
    results = {}
    for label, faithful in (("1843 table", True), ("corrected", False)):
        engine = AnalyticalEngine()
        engine.store.update({21 + i: b for i, b in enumerate(stored)})
        results[label] = engine.run_note_g(4, faithful_1843=faithful)
        if args.trace:
            print(f"\n=== {label} ===")
            print_trace(engine)
    counts = ", ".join(f"{k} {v}" for k, v in engine.operations.items())

    expected = bernoulli_reference(4)[-1]
    print(f"\nB7 from the 1843 table as printed : {results['1843 table']}")
    print(f"B7 with operation 4 corrected     : {results['corrected']}"
          f"   {'✓' if results['corrected'] == expected else '✗'} (modern B8 = {expected})")
    print(f"Mill work for one run             : {counts}")


if __name__ == "__main__":
    main()
