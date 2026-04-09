"""Fix regex that splits numbered steps - handle 10, 11, 12 etc correctly."""
path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx"
with open(path, "r") as f:
    c = f.read()

# The problem: split(/(?=\d+[\.\)])/) splits "10." into "1" and "0."
# Fix: use a regex that matches number-dot at word boundary or start of string
# Replace all occurrences of the bad split pattern

# In Planning.jsx operations list
c = c.replace(
    r"op.description.split(/(?=\d+[\.\)])/).filter(s => s.trim()).map((step, si) =>",
    r"op.description.split(/(?:^|\s)(?=\d{1,2}[\.\)])/g).filter(s => s.trim()).map((step, si) =>"
)

with open(path, "w") as f:
    f.write(c)
print("Planning.jsx fixed")

# Also fix in FailureCapture.jsx
fc_path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/FailureCapture.jsx"
with open(fc_path, "r") as f:
    fc = f.read()

# Fix the suggested action split
fc = fc.replace(
    r"form.suggestedAction.split(/(?=\d+[\.\)])/).filter(s => s.trim()).map((step, i) =>",
    r"form.suggestedAction.split(/(?:^|\s)(?=\d{1,2}[\.\)])/g).filter(s => s.trim()).map((step, i) =>"
)

# Also fix the test regex
fc = fc.replace(
    r"form.suggestedAction && /\d+[\.\)]/.test(form.suggestedAction)",
    r"form.suggestedAction && /\d{1,2}[\.\)]\s/.test(form.suggestedAction)"
)

with open(fc_path, "w") as f:
    f.write(fc)
print("FailureCapture.jsx fixed")
