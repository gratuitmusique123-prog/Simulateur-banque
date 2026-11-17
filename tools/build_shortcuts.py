#!/usr/bin/env python3
"""Generate native Apple Shortcuts opening the Simulation Bank test application.

Produces unsigned .shortcut plist files. Apple signing must happen on macOS;
the GitHub Actions workflow attempts it, but a runner may lack an Apple ID.
These workflows never use Apple Intelligence or real payment credentials.
"""
import pathlib
import plistlib
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "unsigned"
OUT.mkdir(parents=True, exist_ok=True)

BASE = "https://gratuitmusique123-prog.github.io/Simulateur-banque/"
SHORTCUTS = [
    ("Simulation Bank", "Simulation-Bank", BASE + "#dashboard"),
    ("Simulation Bank - Cartes", "Simulation-Bank-Cartes", BASE + "?newcard=1#cards"),
    ("Simulation Bank - TPE", "Simulation-Bank-TPE", BASE + "#tpe"),
]

def action(identifier, **parameters):
    return {"WFWorkflowActionIdentifier": "is.workflow.actions." + identifier,
            "WFWorkflowActionParameters": {"UUID": str(uuid.uuid4()).upper(), **parameters}}

def build(name, url):
    actions = [
        action("url", WFURLActionURL=url),
        action("openurl"),
    ]
    return {
        "WFWorkflowActions": actions,
        "WFWorkflowClientVersion": "2700.0.4",
        "WFWorkflowMinimumClientVersion": 900,
        "WFWorkflowMinimumClientVersionString": "900",
        "WFWorkflowHasOutputFallback": False,
        "WFWorkflowIcon": {
            "WFWorkflowIconStartColor": 4282601983,
            "WFWorkflowIconGlyphNumber": 59511,
        },
        "WFWorkflowTypes": [],
        "WFWorkflowImportQuestions": [],
        "WFWorkflowOutputContentItemClasses": [],
        "WFWorkflowName": name,
    }

for display_name, filename, url in SHORTCUTS:
    payload = build(display_name, url)
    data = plistlib.dumps(payload, fmt=plistlib.FMT_BINARY, sort_keys=False)
    destination = OUT / (filename + ".shortcut")
    destination.write_bytes(data)
    assert plistlib.loads(destination.read_bytes())["WFWorkflowActions"][0]["WFWorkflowActionParameters"]["WFURLActionURL"] == url
    print(f"Generated: {destination} ({len(data)} bytes, {len(payload['WFWorkflowActions'])} actions)")
