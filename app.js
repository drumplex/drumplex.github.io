// COR (Containment of Relics) - Database & GitHub Integration Engine

const DEFAULT_RELICS = [
    {
        id: "COR-001",
        name: "The Obsidian Compass",
        objectClass: "Safe",
        image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80",
        content: `**Item #:** COR-001\n\n**Object Class:** Safe\n\n**Special Containment Procedures:** COR-001 is to be kept in a standard secure containment locker at Site-19. Testing requires Level 3 authorization.\n\n**Description:** COR-001 is a hand-carved compass composed of high-purity obsidian and brass. Instead of pointing toward magnetic north, the needle consistently rotates to indicate the nearest point of temporal anomaly or spatial distortion within a [REDACTED] kilometer radius.`
    },
    {
        id: "COR-449",
        name: "Amnestic Phonograph",
        objectClass: "Euclid",
        image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80",
        content: `**Item #:** COR-449\n\n**Object Class:** Euclid\n\n**Special Containment Procedures:** Stored in an acoustic dampening vault. No personnel are permitted within 5 meters while the cylinder is mounted.\n\n**Description:** COR-449 is a 19th-century brass horn phonograph. When any wax cylinder is played on COR-449, listeners within hearing range immediately experience complete retrograde amnesia spanning the preceding [REDACTED] hours.`
    }
];

let relics = [];
let currentEditingId = null;

// GitHub Config state
let ghConfig = {
    owner: localStorage.getItem('cor_gh_owner') || '',
    repo: localStorage.getItem('cor_gh_repo') || '',
    branch: localStorage.getItem('cor_gh_branch') || 'main',
    token: localStorage.getItem('cor_gh_token') || ''
};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await loadRelics();
    setupEventListeners();
    updateSyncStatusUI();
});

// Load relics from GitHub data folder or fallback to localStorage / defaults
async function loadRelics() {
    try {
        if (ghConfig.owner && ghConfig.repo && ghConfig.token) {
            // Try loading index of relics from repository folder `data/relics.json`
            const res = await fetch(`https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/data/relics.json`, {
                headers: { 'Authorization': `token ${ghConfig.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const jsonContent = JSON.parse(atob(data.content));
                relics = jsonContent;
                localStorage.setItem('cor_relics_cache', JSON.stringify(relics));
                renderRelicList();
                updateStats();
                return;
            }
        }
    } catch (e) {
        console.warn("Could not fetch remote GitHub index, checking local cache.", e);
    }

    // Fallback to local storage or defaults
    const cached = localStorage.getItem('cor_relics_cache');
    if (cached) {
        relics = JSON.parse(cached);
    } else {
        relics = DEFAULT_RELICS;
        localStorage.setItem('cor_relics_cache', JSON.stringify(relics));
    }
    renderRelicList();
    updateStats();
}

// Save all relics to GitHub and local cache
async function saveRelicsToStorage() {
    localStorage.setItem('cor_relics_cache', JSON.stringify(relics));
    renderRelicList();
    updateStats();

    if (ghConfig.owner && ghConfig.repo && ghConfig.token) {
        try {
            const filePath = 'data/relics.json';
            const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(relics, null, 2))));
            
            // Get current file sha if exists
            let sha = null;
            const getRes = await fetch(`https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${filePath}`, {
                headers: { 'Authorization': `token ${ghConfig.token}` }
            });
            if (getRes.ok) {
                const fileData = await getRes.json();
                sha = fileData.sha;
            }

            // Commit to GitHub repo
            const putRes = await fetch(`https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${ghConfig.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `COR Database Update: Record saved (${new Date().toISOString()})`,
                    content: contentEncoded,
                    branch: ghConfig.branch,
                    sha: sha
                })
            });

            if (putRes.ok) {
                alert("Successfully saved and committed globally to GitHub!");
            } else {
                const err = await putRes.json();
                console.error("GitHub commit failed:", err);
                alert("Saved locally, but GitHub sync failed: " + (err.message || 'Check your token permissions.'));
            }
        } catch (e) {
            console.error("GitHub API error:", e);
            alert("Saved locally, but encountered an error connecting to GitHub.");
        }
    }
}

// Render Sidebar List
function renderRelicList(filter = '') {
    const listEl = document.getElementById('relic-list');
    listEl.innerHTML = '';

    const filtered = relics.filter(r => 
        r.id.toLowerCase().includes(filter.toLowerCase()) || 
        r.name.toLowerCase().includes(filter.toLowerCase()) ||
        r.objectClass.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.forEach(r => {
        const li = document.createElement('li');
        li.className = 'relic-item';
        li.innerHTML = `
            <div class="relic-item-info">
                <div class="r-id">${escapeHtml(r.id)}</div>
                <div class="r-name">${escapeHtml(r.name)}</div>
            </div>
            <span class="class-badge class-${r.objectClass.toLowerCase()}">${r.objectClass}</span>
        `;
        li.addEventListener('click', () => viewRelic(r.id));
        listEl.appendChild(li);
    });
}

// View Relic Details
function viewRelic(id) {
    const r = relics.find(item => item.id === id);
    if (!r) return;

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-detail').classList.add('active');

    let html = `
        <div style="text-align: right; font-family: monospace; font-size: 0.8rem; color: #666; margin-bottom: 10px;">
            SECURE DOCUMENT // CLEARANCE LEVEL 4
        </div>
        <h1 style="font-family: 'Times New Roman', serif; font-size: 1.8rem; margin-bottom: 5px;">${escapeHtml(r.id)} - ${escapeHtml(r.name)}</h1>
        <p style="margin-bottom: 20px;"><strong>Object Class:</strong> <span class="class-badge class-${r.objectClass.toLowerCase()}">${r.objectClass}</span></p>
    `;

    if (r.image) {
        html += `<div style="text-align: center;"><img src="${escapeHtml(r.image)}" alt="${escapeHtml(r.name)}" style="max-height: 350px;"></div>`;
    }

    // Parse markdown and convert [REDACTED] tags into interactive black bars
    let parsedHtml = marked.parse(r.content);
    parsedHtml = parsedHtml.replace(/[REDACTED]/g, '<span class="redacted" title="Click to reveal">[REDACTED]</span>');
    parsedHtml = parsedHtml.replace(/[DATA EXPUNGED]/g, '<span class="redacted" title="Click to reveal">[DATA EXPUNGED]</span>');

    html += `<div class="doc-body">${parsedHtml}</div>`;

    document.getElementById('document-render-area').innerHTML = html;

    // Enable clicking redacted sections to reveal
    document.querySelectorAll('.redacted').forEach(el => {
        el.addEventListener('click', () => {
            el.style.backgroundColor = '#333';
            el.style.color = '#ff5555';
        });
    });

    document.getElementById('btn-edit-doc').onclick = () => openEditor(r.id);
}

// Open Editor for Creating or Editing
function openEditor(id = null) {
    currentEditingId = id;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-editor').classList.add('active');

    if (id) {
        const r = relics.find(item => item.id === id);
        document.getElementById('editor-title-heading').textContent = `Edit Record: ${r.id}`;
        document.getElementById('edit-id').value = r.id;
        document.getElementById('edit-id').disabled = true; // can't change ID once created
        document.getElementById('edit-name').value = r.name;
        document.getElementById('edit-class').value = r.objectClass;
        document.getElementById('edit-image').value = r.image || '';
        document.getElementById('edit-content').value = r.content;
    } else {
        document.getElementById('editor-title-heading').textContent = 'Create New Relic Record';
        document.getElementById('edit-id').value = `COR-${Math.floor(1000 + Math.random() * 9000)}`;
        document.getElementById('edit-id').disabled = false;
        document.getElementById('edit-name').value = '';
        document.getElementById('edit-class').value = 'Safe';
        document.getElementById('edit-image').value = '';
        document.getElementById('edit-content').value = `**Item #:** COR-XXXX\n\n**Object Class:** Safe\n\n**Special Containment Procedures:** ...\n\n**Description:** ...`;
    }

    updatePreview();
}

// Update Markdown Live Preview
function updatePreview() {
    const content = document.getElementById('edit-content').value;
    let parsed = marked.parse(content);
    parsed = parsed.replace(/[REDACTED]/g, '<span class="redacted">[REDACTED]</span>');
    document.getElementById('markdown-preview').innerHTML = parsed;
}

// Event Listeners Setup
function setupEventListeners() {
    document.getElementById('btn-create').addEventListener('click', () => openEditor(null));
    document.getElementById('btn-back').addEventListener('click', () => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-home').classList.add('active');
    });
    document.getElementById('btn-cancel-edit').addEventListener('click', () => {
        if (currentEditingId) viewRelic(currentEditingId);
        else {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById('view-home').classList.add('active');
        }
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
        renderRelicList(e.target.value);
    });

    document.getElementById('edit-content').addEventListener('input', updatePreview);

    // Save button
    document.getElementById('btn-save').addEventListener('click', async () => {
        const id = document.getElementById('edit-id').value.trim();
        const name = document.getElementById('edit-name').value.trim();
        const objectClass = document.getElementById('edit-class').value;
        const image = document.getElementById('edit-image').value.trim();
        const content = document.getElementById('edit-content').value;

        if (!id || !name) {
            alert('Item ID and Relic Name are required.');
            return;
        }

        const existingIndex = relics.findIndex(r => r.id === id);
        if (existingIndex >= 0) {
            relics[existingIndex] = { id, name, objectClass, image, content };
        } else {
            relics.unshift({ id, name, objectClass, image, content });
        }

        await saveRelicsToStorage();
        viewRelic(id);
    });

    // GitHub Modal bindings
    const modal = document.getElementById('sync-modal');
    document.getElementById('btn-sync-config').addEventListener('click', () => {
        document.getElementById('gh-owner').value = ghConfig.owner;
        document.getElementById('gh-repo').value = ghConfig.repo;
        document.getElementById('gh-branch').value = ghConfig.branch;
        document.getElementById('gh-token').value = ghConfig.token;
        modal.classList.add('active');
    });

    modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('active'));

    document.getElementById('btn-test-sync').addEventListener('click', async () => {
        ghConfig.owner = document.getElementById('gh-owner').value.trim();
        ghConfig.repo = document.getElementById('gh-repo').value.trim();
        ghConfig.branch = document.getElementById('gh-branch').value.trim() || 'main';
        ghConfig.token = document.getElementById('gh-token').value.trim();

        localStorage.setItem('cor_gh_owner', ghConfig.owner);
        localStorage.setItem('cor_gh_repo', ghConfig.repo);
        localStorage.setItem('cor_gh_branch', ghConfig.branch);
        localStorage.setItem('cor_gh_token', ghConfig.token);

        modal.classList.remove('active');
        updateSyncStatusUI();
        await loadRelics();
        alert("GitHub configuration updated successfully!");
    });

    document.getElementById('btn-disable-sync').addEventListener('click', () => {
        ghConfig = { owner: '', repo: '', branch: 'main', token: '' };
        localStorage.removeItem('cor_gh_owner');
        localStorage.removeItem('cor_gh_repo');
        localStorage.removeItem('cor_gh_branch');
        localStorage.removeItem('cor_gh_token');
        modal.classList.remove('active');
        updateSyncStatusUI();
        alert("Global sync disabled. Running in local mode.");
    });
}

function updateSyncStatusUI() {
    const syncStat = document.getElementById('stat-sync');
    if (ghConfig.owner && ghConfig.repo && ghConfig.token) {
        syncStat.textContent = `GitHub (${ghConfig.repo})`;
        syncStat.style.color = '#58a6ff';
    } else {
        syncStat.textContent = 'Local Mode';
        syncStat.style.color = '#8b949e';
    }
}

function updateStats() {
    document.getElementById('stat-count').textContent = relics.length;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
