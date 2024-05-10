from typing import Any

import requests
from django.conf import settings

from sentry.utils import json


def get_autofix_state_from_pr_id(provider: str, pr_id: int) -> dict[str, Any] | None:
    response = requests.post(
        f"{settings.SEER_AUTOFIX_URL}/v1/automation/autofix/get-state-from-pr",
        data=json.dumps(
            {
                "provider": provider,
                "pr_id": pr_id,
            }
        ),
        headers={"content-type": "application/json;charset=utf-8"},
    )

    response.raise_for_status()
    result = response.json()

    if result and result["state"]:
        return result["state"]

    return None
