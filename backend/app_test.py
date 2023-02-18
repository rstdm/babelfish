import unittest

from fastapi.testclient import TestClient
from app import app


class IntegrationTest(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_translate(self):
        response = self.client.post(
            "/api/translate",
            json={
                'destinationLanguage': 'deu',
                'sourceText': 'This is just a test.'
            })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"translatedText": "Das ist nur ein Test."})
