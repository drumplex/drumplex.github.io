const DEFAULT_RELICS = [
    {
        id: "COR-001",
        name: "The Obsidian Compass",
        category: "relics",
        objectClass: "Safe",
        image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80",
        content: `**Item #:** COR-001\n\n**Object Class:** Safe\n\n**Special Containment Procedures:** Stored in a standard secure locker at Site-19.\n\n**Description:** A compass composed of high-purity obsidian that indicates temporal anomalies within a <span class="redacted">[REDACTED]</span> kilometer radius.`
    },
    {
        id: "INC-042",
        name: "Site-44 Breach",
        category: "incidents",
        objectClass: "Euclid",
        image: "",
        content: `**Incident #:** INC-042\n\n**Date:** [REDACTED]\n\n**Description:** Security failure at Sector 4 resulted in unauthorized personnel accessing containment unit [[COR-449]]. <span class="redacted">All subjects were successfully amnesticized</span> within 3 hours.`
    },
    {
        id: "TGT-991",
        name: "Subject 'Null'",
        category: "targets",
        objectClass: "Keter",
        image: "",
        content: `**Target ID:** TGT-991\n\n**Status:** <span class="redacted">ACTIVE / UNCONTAINED</span>\n\n**Notes:** Primary entity responsible for reality-bending events in Sector 7. <span class="redacted">Do not engage without O5 authorization</span>.`
    }
];

let relics = [];
let currentCategory = 'relics';
let targetsUnlocked = false;
let currentEditingId = null;

let ghConfig = {
    owner: localStorage.getItem('cor_gh_owner') || '',
    repo: localStorage.getItem('cor_gh_repo') || '',
    branch: localStorage.getItem('cor_gh_branch') || 'main',
    token: localStorage.getItem('cor_gh_token') || ''
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadRelics();
    setupEventListeners();
    updateSyncStatusUI();
});

async function loadRelics() {
    try {
        if (ghConfig.owner && ghConfig.repo && ghConfig.token) {
            const res = await fetch(`https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/data/relics.json`, {
                headers: { 'Authorization': `token ${ghConfig.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                relics = JSON.parse(atob(data.content));
                localStorage.setItem('cor_relics_cache', JSON.stringify(relics));
                renderRelicList();
                updateStats();
                populateLinkDropdown();
                return;
            }
        }
    } catch (e) {
        console.warn("Using local cache fallback.");
    }

    const cached = localStorage.getItem('cor_relics_cache');
    relics = cached ? JSON.parse(cached) : DEFAULT_RELICS;
    localStorage.setItem('cor_relics_cache', JSON.stringify(relics));
    renderRelicList();
    updateStats();
    populateLinkDropdown();
}

async function saveRelicsToStorage() {
    localStorage.setItem('cor_relics_cache', JSON.stringify(relics));
    renderRelicList();
    updateStats();
    populateLinkDropdown();

    if (ghConfig.owner && ghConfig.repo && ghConfig.token) {
        try {
            const filePath = 'data/relics.json';
            const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(relics, null, 2))));
            let sha = null;
            const getRes = await fetch(`https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${filePath}`, {
                headers: { 'Authorization': `token ${ghConfig.token}` }
            });
            if (getRes.ok) sha = (await getRes.json()).sha;

            await fetch(`https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/${filePath}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${ghConfig.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `COR Update`, content: contentEncoded, branch: ghConfig.branch, sha })
            });
        } catch (e) {
            console.error("GitHub save error:", e);
        }
    }
}

function renderRelicList(filter = '') {
    const listEl = document.getElementById('relic-list');
    listEl.innerHTML = '';

    const filtered = relics.filter(r => {
        const matchesCategory = (r.category || 'relics') === currentCategory;
        const matchesSearch = r.id.toLowerCase().includes(filter.toLowerCase()) || r.name.toLowerCase().includes(filter.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    filtered.forEach(r => {
        const li = document.createElement('li');
        li.className = 'relic-item';
        li.innerHTML = `
            <div>
                <div class="r-id">${escapeHtml(r.id)}</div>
                <div class="r-name">${escapeHtml(r.name)}</div>
            </div>
            ${r.objectClass ? `<span class="class-badge">${r.objectClass}</span>` : ''}
        `;
        li.addEventListener('click', () => viewRelic(r.id));
        listEl.appendChild(li);
    });
}

function parseCustomMarkdown(content) {
    // Convert [[ID]] or [[ID|Custom Name]] into clickable internal links
    content = content.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
        let parts = p1.split('|');
        let id = parts[0].trim();
        let name = parts[1] ? parts[1].trim() : id;
        return `<span class="internal-link" onclick="viewRelic('${id}')">${escapeHtml(name)}</span>`;
    });

    let html = marked.parse(content);
    return html;
}

function viewRelic(id) {
    const r = relics.find(item => item.id === id);
    if (!r) {
        alert("Record not found in archive.");
        return;
    }

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-detail').classList.add('active');

    let html = `
        <div style="text-align: right; font-family: monospace; font-size: 0.75rem; color: #777; margin-bottom: 10px;">
            SECURE DOCUMENT // CLEARANCE LEVEL REQUIRED
        </div>
        <h1>${escapeHtml(r.id)} - ${escapeHtml(r.name)}</h1>
        ${r.objectClass ? `<p><strong>Object Class:</strong> <span class="class-badge">${r.objectClass}</span></p>` : ''}
    `;

    if (r.image) {
        html += `<div style="text-align: center;"><img src="${escapeHtml(r.image)}" alt="" style="max-height: 300px; border: 1px solid #111; padding: 3px; margin: 10px 0;"></div>`;
    }

    html += `<div class="doc-body">${parseCustomMarkdown(r.content)}</div>`;
    document.getElementById('document-render-area').innerHTML = html;

    document.querySelectorAll('.redacted').forEach(el => {
        el.addEventListener('click', () => el.classList.toggle('revealed'));
    });

    document.getElementById('btn-edit-doc').onclick = () => openEditor(r.id);
}

function switchCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    
    if (cat === 'targets' && !targetsUnlocked) {
        document.querySelector('[data-cat="targets"]').classList.add('active');
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-locked').classList.add('active');
        return;
    }

    document.querySelector(`[data-cat="${cat}"]`).classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-home').classList.add('active');
    renderRelicList();
}

function openEditor(id = null) {
    currentEditingId = id;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-editor').classList.add('active');

    if (id) {
        const r = relics.find(item => item.id === id);
        document.getElementById('editor-title-heading').textContent = `Edit Record: ${r.id}`;
        document.getElementById('edit-id').value = r.id;
        document.getElementById('edit-id').disabled = true;
        document.getElementById('edit-name').value = r.name;
        document.getElementById('edit-category').value = r.category || 'relics';
        document.getElementById('edit-class').value = r.objectClass || 'Safe';
        document.getElementById('edit-image').value = r.image || '';
        document.getElementById('edit-content').value = r.content;
    } else {
        document.getElementById('editor-title-heading').textContent = 'Create New Record';
        document.getElementById('edit-id').value = `COR-${Math.floor(1000 + Math.random() * 9000)}`;
        document.getElementById('edit-id').disabled = false;
        document.getElementById('edit-name').value = '';
        document.getElementById('edit-category').value = currentCategory;
        document.getElementById('edit-class').value = 'Safe';
        document.getElementById('edit-image').value = '';
        document.getElementById('edit-content').value = `**Item #:** COR-XXXX\n\n**Object Class:** Safe\n\n**Special Containment Procedures:** ...\n\n**Description:** ...`;
    }
    updatePreview();
}

function updatePreview() {
    document.getElementById('markdown-preview').innerHTML = parseCustomMarkdown(document.getElementById('edit-content').value);
}

function populateLinkDropdown() {
    const select = document.getElementById('tb-link-select');
    if (!select) return;
    select.innerHTML = '<option value="">-- Link to Record --</option>';
    relics.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.id}: ${r.name}`;
        select.appendChild(opt);
    });
}

function setupEventListeners() {
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.addEventListener('click', () => switchCategory(tab.getAttribute('data-cat')));
    });

    document.getElementById('btn-unlock-targets').addEventListener('click', () => {
        const val = document.getElementById('target-passcode').value.trim();
        if (val === 'O5' || val === 'admin' || val === 'COR') {
            targetsUnlocked = true;
            alert("Clearance granted. Targets unlocked.");
            switchCategory('targets');
        } else {
            alert("Invalid passcode. Access denied.");
        }
    });

    document.getElementById('btn-create').addEventListener('click', () => openEditor(null));
    document.getElementById('btn-back').addEventListener('click', () => switchCategory(currentCategory));
    document.getElementById('btn-cancel-edit').addEventListener('click', () => switchCategory(currentCategory));

    document.getElementById('search-input').addEventListener('input', (e) => renderRelicList(e.target.value));
    document.getElementById('edit-content').addEventListener('input', updatePreview);

    // Toolbar formatting actions
    const textarea = document.getElementById('edit-content');

    function insertAtCursor(before, after = '') {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        textarea.value = text.substring(0, start) + before + selected + after + text.substring(end);
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = end + before.length;
        textarea.focus();
        updatePreview();
    }

    document.getElementById('tb-redact').addEventListener('click', () => insertAtCursor('<span class="redacted">', '</span>'));
    document.getElementById('tb-bold').addEventListener('click', () => insertAtCursor('**', '**'));
    document.getElementById('tb-italic').addEventListener('click', () => insertAtCursor('*', '*'));
    document.getElementById('tb-h2').addEventListener('click', () => insertAtCursor('## '));
    document.getElementById('tb-quote').addEventListener('click', () => insertAtCursor('> '));

    document.getElementById('tb-link-select').addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) return;
        insertAtCursor(`[[${val}]]`);
        e.target.value = '';
    });

    document.getElementById('tb-template').addEventListener('click', () => {
        textarea.value = `**Item #:** COR-XXXX\n\n**Object Class:** Euclid\n\n**Special Containment Procedures:** [REDACTED]\n\n**Description:** \n\n**Addendum 1.1:** [DATA EXPUNGED]`;
        updatePreview();
    });

    document.getElementById('btn-save').addEventListener('click', async () => {
        const id = document.getElementById('edit-id').value.trim();
        const name = document.getElementById('edit-name').value.trim();
        const category = document.getElementById('edit-category').value;
        const objectClass = document.getElementById('edit-class').value;
        const image = document.getElementById('edit-image').value.trim();
        const content = document.getElementById('edit-content').value;

        if (!id || !name) {
            alert('ID and Name are required.');
            return;
        }

        const idx = relics.findIndex(r => r.id === id);
        if (idx >= 0) relics[idx] = { id, name, category, objectClass, image, content };
        else relics.unshift({ id, name, category, objectClass, image, content });

        await saveRelicsToStorage();
        switchCategory(category);
        viewRelic(id);
    });

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
        alert("Sync settings updated.");
    });

    document.getElementById('btn-disable-sync').addEventListener('click', () => {
        ghConfig = { owner: '', repo: '', branch: 'main', token: '' };
        localStorage.clear();
        modal.classList.remove('active');
        updateSyncStatusUI();
        alert("Sync disabled.");
    });
}

function updateSyncStatusUI() {
    document.getElementById('stat-sync').textContent = (ghConfig.owner && ghConfig.token) ? 'GitHub' : 'Local';
}

function updateStats() {
    document.getElementById('stat-count').textContent = relics.length;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
