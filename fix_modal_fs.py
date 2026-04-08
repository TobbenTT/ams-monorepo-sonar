"""Add fullscreen toggle to WO modal in Planning.jsx"""
path = "/root/ASSET-MANAGEMENT-SOFTWARE/frontend/src/pages/Planning.jsx"
with open(path, "r") as f:
    c = f.read()

# 1. Add fullscreen state near other modal states
c = c.replace(
    "const [otModalTab, setOtModalTab] = useState('summary');",
    "const [otModalTab, setOtModalTab] = useState('summary');\n  const [modalFullscreen, setModalFullscreen] = useState(false);"
)

# 2. Change modal sizing to use state
c = c.replace(
    '<div className="bg-white rounded-2xl shadow-xl w-[95vw] h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>',
    '<div className={`bg-white rounded-2xl shadow-xl flex flex-col transition-all duration-300 ${modalFullscreen ? "w-[98vw] h-[96vh]" : "w-[90vw] max-w-5xl h-[85vh]"}`} onClick={e => e.stopPropagation()}>'
)

# 3. Add fullscreen toggle button next to the X close button
# Find the close button
old_close = '<button onClick={() => setSelectedOT(null)} className="p-1.5 hover:bg-gray-100 rounded-full">'
new_close = '''<button onClick={() => setModalFullscreen(f => !f)} className="p-1.5 hover:bg-gray-100 rounded-full" title={modalFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                      {modalFullscreen ? (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                      )}
                    </button>
                    <button onClick={() => setSelectedOT(null)} className="p-1.5 hover:bg-gray-100 rounded-full">'''

c = c.replace(old_close, new_close, 1)

# 4. Reset fullscreen when modal closes
c = c.replace(
    "onClick={() => setSelectedOT(null)}>",
    "onClick={() => { setSelectedOT(null); setModalFullscreen(false); }}>",
    1  # Only first occurrence (the backdrop)
)

with open(path, "w") as f:
    f.write(c)
print("Done")
