#!/usr/bin/env python3
"""Attempt Apple's official Shortcuts signature on macOS, and report honestly."""
from pathlib import Path
import json
import subprocess

root = Path(__file__).resolve().parents[1]
src = root / "dist" / "unsigned"
out = root / "dist" / "signed"
out.mkdir(parents=True, exist_ok=True)
report = {"method":"Apple macOS shortcuts sign --mode anyone","successes":[],"failures":[]}
for file in sorted(src.glob("*.shortcut")):
    destination = out / file.name
    command = ["shortcuts", "sign", "--mode", "anyone",
               "--input", str(file), "--output", str(destination)]
    try:
        r = subprocess.run(command, capture_output=True, text=True, timeout=60)
        if r.returncode == 0 and destination.exists() and destination.stat().st_size > 0:
            report["successes"].append(file.name)
            print("SIGNED:", file.name)
        else:
            report["failures"].append({"name":file.name,
                "reason":(r.stderr or r.stdout or f"Return code {r.returncode}")[:1200]})
            destination.unlink(missing_ok=True)
            print("SIGNING NOT AVAILABLE:", file.name)
    except (OSError, subprocess.TimeoutExpired) as e:
        report["failures"].append({"name":file.name,"reason":str(e)})
        destination.unlink(missing_ok=True)
        print("SIGNING NOT AVAILABLE:", file.name)
(root / "dist" / "SIGNATURE-REPORT.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
