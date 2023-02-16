import unittest
from translate import translate
from language import Language


class UnitTest(unittest.TestCase):

    def test_empty_string(self):
        self.assertEqual(translate(Language.deu, ''), '')

    def test_whitespace(self):
        text = '   \n\t\r'
        self.assertEqual(translate(Language.deu, text), text)

    def test_translate(self):
        self.assertEqual(translate(Language.ita, 'This is a test.'), "Questo e' un test.")  # english -> italian
        self.assertEqual(translate(Language.fra, "Il s'agit d'un test."), "C'est un test.")  # italian -> french
        self.assertEqual(translate(Language.por, "Questo è un test."), 'É um teste.')  # french -> portuguese
        self.assertEqual(translate(Language.spa, "Isto é um teste."), 'Esto es una prueba.')  # portuguese -> spanish
        self.assertEqual(translate(Language.deu, "Esto es una prueba."), 'Das ist ein Test.')  # spanish -> german
        self.assertEqual(translate(Language.ita, "Dies ist ein Test."), "Questo e' un test.")  # german -> italian

        multi_language_text = "This is a test. C'est la deuxième phrase du test en français."
        multi_language_translation = "Das ist ein Test. Das ist die zweite Aussprache des französischen Tests."
        self.assertEqual(translate(Language.deu, multi_language_text), multi_language_translation)
