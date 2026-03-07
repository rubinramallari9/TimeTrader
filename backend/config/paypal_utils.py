import requests
from django.conf import settings


def _base_url():
    if getattr(settings, "PAYPAL_MODE", "sandbox") == "live":
        return "https://api-m.paypal.com"
    return "https://api-m.sandbox.paypal.com"


def _get_access_token():
    resp = requests.post(
        f"{_base_url()}/v1/oauth2/token",
        data={"grant_type": "client_credentials"},
        auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def create_order(amount: str, description: str) -> dict:
    token = _get_access_token()
    resp = requests.post(
        f"{_base_url()}/v2/checkout/orders",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {"currency_code": "EUR", "value": amount},
                "description": description,
            }],
        },
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def capture_order(order_id: str) -> dict:
    token = _get_access_token()
    resp = requests.post(
        f"{_base_url()}/v2/checkout/orders/{order_id}/capture",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()
