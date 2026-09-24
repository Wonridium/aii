import unittest
from fractions import Fraction

from note_g import AnalyticalEngine, bernoulli_reference, chain


class NoteGTest(unittest.TestCase):
    def test_reference_matches_known_values(self):
        self.assertEqual(
            bernoulli_reference(4),
            [Fraction(1, 6), Fraction(-1, 30), Fraction(1, 42), Fraction(-1, 30)],
        )

    def test_corrected_table_computes_b7(self):
        engine = AnalyticalEngine()
        engine.store.update({21: Fraction(1, 6), 22: Fraction(-1, 30), 23: Fraction(1, 42)})
        self.assertEqual(engine.run_note_g(4), Fraction(-1, 30))
        self.assertEqual(engine.v(24), Fraction(-1, 30))
        self.assertEqual(engine.v(3), 5)  # operation 25 advanced n

    def test_loop_runs_twice_for_b7(self):
        engine = AnalyticalEngine()
        engine.store.update({21: Fraction(1, 6), 22: Fraction(-1, 30), 23: Fraction(1, 42)})
        engine.run_note_g(4)
        numbers = [step.card.number for step in engine.trace]
        self.assertEqual(numbers.count(13), 2)
        self.assertEqual(len(numbers), 25 + 11)

    def test_1843_table_is_wrong(self):
        engine = AnalyticalEngine()
        engine.store.update({21: Fraction(1, 6), 22: Fraction(-1, 30), 23: Fraction(1, 42)})
        self.assertEqual(engine.run_note_g(4, faithful_1843=True), Fraction(139, 630))

    def test_chained_engine_matches_reference(self):
        self.assertEqual(chain(20), bernoulli_reference(20))


if __name__ == "__main__":
    unittest.main()
