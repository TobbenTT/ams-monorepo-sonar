"""Remove old duplicate cost cards + Planned Dates from Costs tab in Planning."""

with open('/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx', 'r') as f:
    lines = f.readlines()

# Find the line with "grid grid-cols-4 gap-2 text-xs" (inline cost summary)
# and the line with "HISTORIAL" comment
# Remove everything between them

start_del = None
end_del = None

for i, line in enumerate(lines):
    if 'grid-cols-4 gap-2 text-xs' in line and start_del is None:
        start_del = i
    if start_del is not None and "otModalTab === 'historial'" in line:
        # Go back to find the closing of costos section: "                )}\n"
        for j in range(i-1, start_del, -1):
            stripped = lines[j].strip()
            if stripped == ')}':
                end_del = j
                break
        break

if start_del is not None and end_del is not None:
    # Replace: keep lines before start_del, add closing </div>, skip to end_del+1
    print(f'Removing lines {start_del+1} to {end_del+1}')
    # The line before start_del should be the closing </table> of the new table
    # We need to close the emerald box div, then close the costs section
    new_lines = lines[:start_del]
    new_lines.append('                    </div>\n')  # close emerald box
    new_lines.append('                  </div>\n')  # close costs space-y-4
    new_lines.append('                )}\n')  # close costs tab
    new_lines.append('\n')
    # Find where HISTORIAL starts
    for i in range(end_del, len(lines)):
        if '{/* HISTORIAL' in lines[i]:
            new_lines.extend(lines[i:])
            break

    with open('/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx', 'w') as f:
        f.writelines(new_lines)
    print(f'Done - removed {end_del - start_del} lines')
else:
    print(f'Could not find boundaries: start={start_del}, end={end_del}')
