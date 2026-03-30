const API_BASE = '';
let currentBooks = [];
let currentPublishers = [];
let currentCategories = [];
let currentRatings = [];
let selectedId = { books: null, publishers: null, categories: null, ratings: null };

document.addEventListener('DOMContentLoaded', () => {
    loadMetadata();
    loadBooks();
    setupForms();
});

function setupForms() {
    document.getElementById('books-operation-mode').addEventListener('change', (e) => {
        toggleEditMode('books', e.target.value === 'edit');
    });
    document.getElementById('books-form').addEventListener('submit', (e) => handleSubmit(e, 'books'));
    document.getElementById('books-reset-btn').addEventListener('click', () => resetForm('books'));

    document.getElementById('publishers-operation-mode').addEventListener('change', (e) => {
        toggleEditMode('publishers', e.target.value === 'edit');
    });
    document.getElementById('publishers-form').addEventListener('submit', (e) => handleSubmit(e, 'publishers'));
    document.getElementById('publishers-reset-btn').addEventListener('click', () => resetForm('publishers'));

    document.getElementById('categories-operation-mode').addEventListener('change', (e) => {
        toggleEditMode('categories', e.target.value === 'edit');
    });
    document.getElementById('categories-form').addEventListener('submit', (e) => handleSubmit(e, 'categories'));
    document.getElementById('categories-reset-btn').addEventListener('click', () => resetForm('categories'));

    document.getElementById('ratings-operation-mode').addEventListener('change', (e) => {
        toggleEditMode('ratings', e.target.value === 'edit');
    });
    document.getElementById('ratings-form').addEventListener('submit', (e) => handleSubmit(e, 'ratings'));
    document.getElementById('ratings-reset-btn').addEventListener('click', () => resetForm('ratings'));
}

function toggleEditMode(section, isEdit) {
    document.getElementById(`${section}-edit-info`).style.display = isEdit ? 'block' : 'none';
    document.getElementById(`${section}-submit-btn`).textContent = isEdit ? '\u270f\ufe0f Friss\u00edt\u00e9s' : '\ud83d\udcbe Ment\u00e9s';
    if (!isEdit) resetForm(section);
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    event.target.classList.add('active');
    if (tab === 'publishers') loadPublishers();
    if (tab === 'categories') loadCategories();
    if (tab === 'ratings') loadRatings();
}

async function loadMetadata() {
    try {
        const [authors, publishers, categories, books] = await Promise.all([
            fetch('/authors').then(r => r.json()),
            fetch('/publishers').then(r => r.json()),
            fetch('/categories').then(r => r.json()),
            fetch('/books').then(r => r.json())
        ]);
        populateSelect('books-author-id', authors.items, 'id', 'name');
        populateSelect('books-publisher-id', publishers.items, 'id', 'name');
        populateSelect('books-category-id', categories.items, 'id', 'name');
        populateSelect('filter-author', authors.items, 'id', 'name', true);
        populateSelect('filter-publisher', publishers.items, 'id', 'name', true);
        populateSelect('filter-category', categories.items, 'id', 'name', true);
        populateSelect('ratings-book-id', books.items, 'id', 'title');
    } catch (err) {
        console.error('Metadata load error:', err);
    }
}

function populateSelect(elementId, items, valueKey, textKey, keepFirst = false) {
    const select = document.getElementById(elementId);
    if (!keepFirst) select.innerHTML = '<option value="">-- V\u00e1lassz --</option>';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        select.appendChild(option);
    });
}

async function loadBooks() {
    const container = document.getElementById('books-container');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Bet\u00f6lt\u00e9s...</div>';
    try {
        const params = new URLSearchParams();
        const q = document.getElementById('books-search').value;
        const authorId = document.getElementById('filter-author').value;
        const publisherId = document.getElementById('filter-publisher').value;
        const categoryId = document.getElementById('filter-category').value;
        if (q) params.append('q', q);
        if (authorId) params.append('author_id', authorId);
        if (publisherId) params.append('publisher_id', publisherId);
        if (categoryId) params.append('category_id', categoryId);
        const url = params.toString() ? `/books?${params}` : '/books';
        const data = await fetch(url).then(r => r.json());
        currentBooks = data.items;
        if (!currentBooks.length) {
            container.innerHTML = emptyState('\ud83d\udced', 'Nincsenek k\u00f6nyvek', 'Adj hozz\u00e1 \u00fajat a bal oldali \u0171rlappal!');
            return;
        }
        container.innerHTML = '<div class="books-grid">' + currentBooks.map(book => `
            <div class="book-card ${selectedId.books === book.id ? 'selected' : ''}" onclick="selectItem('books', ${book.id})">
                <div class="book-title">${escapeHtml(book.title)}</div>
                <div class="book-meta">
                    <strong>Szerz\u0151:</strong> ${escapeHtml(book.author_name)}<br>
                    <strong>Kiad\u00f3:</strong> ${escapeHtml(book.publisher_name)}<br>
                    <strong>Kateg\u00f3ria:</strong> ${escapeHtml(book.category_name)}
                </div>
                <div class="book-price">${Number(book.price).toLocaleString('hu-HU')} Ft</div>
                <div class="book-rating">
                    <span class="stars">${'\u2b50'.repeat(Math.round(book.avg_rating))}</span>
                    <span>${Number(book.avg_rating).toFixed(1)} (${book.ratings_count} \u00e9rt\u00e9kel\u00e9s)</span>
                </div>
                <span class="badge badge-isbn">ISBN: ${escapeHtml(book.isbn)}</span>
                <div class="book-actions">
                    <button onclick="event.stopPropagation(); editItem('books', ${book.id})" class="btn-warning">\u270f\ufe0f Szerkeszt</button>
                    <button onclick="event.stopPropagation(); deleteItem('books', ${book.id})" class="btn-danger">\ud83d\uddd1\ufe0f T\u00f6rl\u00e9s</button>
                </div>
            </div>
        `).join('') + '</div>';
    } catch (err) {
        container.innerHTML = '<div class="alert alert-error">\u274c Hiba a k\u00f6nyvek bet\u00f6lt\u00e9sekor!</div>';
    }
}

function clearBooksFilters() {
    document.getElementById('books-search').value = '';
    document.getElementById('filter-author').value = '';
    document.getElementById('filter-publisher').value = '';
    document.getElementById('filter-category').value = '';
    loadBooks();
}

async function loadPublishers() {
    const container = document.getElementById('publishers-container');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Bet\u00f6lt\u00e9s...</div>';
    try {
        const data = await fetch('/publishers').then(r => r.json());
        currentPublishers = data.items;
        if (!currentPublishers.length) {
            container.innerHTML = emptyState('\ud83c\udff7\ufe0f', 'Nincsenek kiad\u00f3k', 'Adj hozz\u00e1 \u00fajat a bal oldali \u0171rlappal!');
            return;
        }
        container.innerHTML = '<div class="simple-list">' + currentPublishers.map(p => `
            <div class="list-item ${selectedId.publishers === p.id ? 'selected' : ''}" onclick="selectItem('publishers', ${p.id})">
                <div class="list-item-info">
                    <div class="list-item-title">\ud83c\udff7\ufe0f ${escapeHtml(p.name)}</div>
                    <div class="list-item-sub">ID: ${p.id}</div>
                </div>
                <div class="list-item-actions">
                    <button onclick="event.stopPropagation(); editItem('publishers', ${p.id})" class="btn-warning">\u270f\ufe0f</button>
                    <button onclick="event.stopPropagation(); deleteItem('publishers', ${p.id})" class="btn-danger">\ud83d\uddd1\ufe0f</button>
                </div>
            </div>
        `).join('') + '</div>';
    } catch (err) {
        container.innerHTML = '<div class="alert alert-error">\u274c Hiba a kiad\u00f3k bet\u00f6lt\u00e9sekor!</div>';
    }
}

async function loadCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Bet\u00f6lt\u00e9s...</div>';
    try {
        const data = await fetch('/categories').then(r => r.json());
        currentCategories = data.items;
        if (!currentCategories.length) {
            container.innerHTML = emptyState('\ud83c\udff7\ufe0f', 'Nincsenek kateg\u00f3ri\u00e1k', 'Adj hozz\u00e1 \u00fajat a bal oldali \u0171rlappal!');
            return;
        }
        container.innerHTML = '<div class="simple-list">' + currentCategories.map(c => `
            <div class="list-item ${selectedId.categories === c.id ? 'selected' : ''}" onclick="selectItem('categories', ${c.id})">
                <div class="list-item-info">
                    <div class="list-item-title">\ud83c\udff7\ufe0f ${escapeHtml(c.name)}</div>
                    <div class="list-item-sub">ID: ${c.id}</div>
                </div>
                <div class="list-item-actions">
                    <button onclick="event.stopPropagation(); editItem('categories', ${c.id})" class="btn-warning">\u270f\ufe0f</button>
                    <button onclick="event.stopPropagation(); deleteItem('categories', ${c.id})" class="btn-danger">\ud83d\uddd1\ufe0f</button>
                </div>
            </div>
        `).join('') + '</div>';
    } catch (err) {
        container.innerHTML = '<div class="alert alert-error">\u274c Hiba a kateg\u00f3ri\u00e1k bet\u00f6lt\u00e9sekor!</div>';
    }
}

async function loadRatings() {
    const container = document.getElementById('ratings-container');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Bet\u00f6lt\u00e9s...</div>';
    try {
        const data = await fetch('/ratings').then(r => r.json());
        currentRatings = data.items;
        if (!currentRatings.length) {
            container.innerHTML = emptyState('\u2b50', 'Nincsenek \u00e9rt\u00e9kel\u00e9sek', 'Adj hozz\u00e1 \u00fajat a bal oldali \u0171rlappal!');
            return;
        }
        container.innerHTML = '<div class="simple-list">' + currentRatings.map(r => `
            <div class="list-item ${selectedId.ratings === r.id ? 'selected' : ''}" onclick="selectItem('ratings', ${r.id})">
                <div class="list-item-info">
                    <div class="list-item-title">
                        <span class="badge badge-score">${'\u2b50'.repeat(r.score)} ${r.score}/5</span>
                    </div>
                    <div class="list-item-sub">K\u00f6nyv ID: ${r.book_id} \u00b7 ${new Date(r.created_at).toLocaleDateString('hu-HU')}</div>
                </div>
                <div class="list-item-actions">
                    <button onclick="event.stopPropagation(); editItem('ratings', ${r.id})" class="btn-warning">\u270f\ufe0f</button>
                    <button onclick="event.stopPropagation(); deleteItem('ratings', ${r.id})" class="btn-danger">\ud83d\uddd1\ufe0f</button>
                </div>
            </div>
        `).join('') + '</div>';
    } catch (err) {
        container.innerHTML = '<div class="alert alert-error">\u274c Hiba az \u00e9rt\u00e9kel\u00e9sek bet\u00f6lt\u00e9sekor!</div>';
    }
}

function selectItem(section, id) {
    selectedId[section] = selectedId[section] === id ? null : id;
    reloadSection(section);
}

function editItem(section, id) {
    const items = { books: currentBooks, publishers: currentPublishers, categories: currentCategories, ratings: currentRatings };
    const item = items[section].find(i => i.id === id);
    if (!item) return;
    document.getElementById(`${section}-operation-mode`).value = 'edit';
    document.getElementById(`${section}-edit-info`).style.display = 'block';
    document.getElementById(`${section}-submit-btn`).textContent = '\u270f\ufe0f Friss\u00edt\u00e9s';
    document.getElementById(`${section}-id`).value = item.id;
    if (section === 'books') {
        document.getElementById('books-title').value = item.title;
        document.getElementById('books-isbn').value = item.isbn;
        document.getElementById('books-price').value = item.price;
        document.getElementById('books-cover-url').value = item.cover_url;
        document.getElementById('books-summary').value = item.summary;
        document.getElementById('books-author-id').value = item.author_id;
        document.getElementById('books-publisher-id').value = item.publisher_id;
        document.getElementById('books-category-id').value = item.category_id;
    }
    if (section === 'publishers') document.getElementById('publishers-name').value = item.name;
    if (section === 'categories') document.getElementById('categories-name').value = item.name;
    if (section === 'ratings') {
        document.getElementById('ratings-book-id').value = item.book_id;
        document.getElementById('ratings-score').value = item.score;
    }
    selectedId[section] = id;
    document.getElementById(`${section}-form`).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deleteItem(section, id) {
    const names = { books: 'k\u00f6nyvet', publishers: 'kiad\u00f3t', categories: 'kateg\u00f3ri\u00e1t', ratings: '\u00e9rt\u00e9kel\u00e9st' };
    if (!confirm(`Biztosan t\u00f6rl\u00f6d ezt a ${names[section]}?`)) return;
    try {
        const response = await fetch(`/${section}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showAlert(section, '\u2705 Sikeresen t\u00f6r\u00f6lve!', 'success');
            if (selectedId[section] === id) resetForm(section);
            reloadSection(section);
        } else {
            const err = await response.json();
            showAlert(section, `\u274c Hiba: ${err.message || 'Ismeretlen hiba'}`, 'error');
        }
    } catch (err) {
        showAlert(section, '\u274c H\u00e1l\u00f3zati hiba!', 'error');
    }
}

async function handleSubmit(e, section) {
    e.preventDefault();
    const mode = document.getElementById(`${section}-operation-mode`).value;
    const id = document.getElementById(`${section}-id`).value;
    let payload = {};
    let endpoint = '';
    if (section === 'books') {
        payload = {
            title: document.getElementById('books-title').value,
            isbn: document.getElementById('books-isbn').value,
            price: parseFloat(document.getElementById('books-price').value),
            cover_url: document.getElementById('books-cover-url').value,
            summary: document.getElementById('books-summary').value,
            author_id: parseInt(document.getElementById('books-author-id').value),
            publisher_id: parseInt(document.getElementById('books-publisher-id').value),
            category_id: parseInt(document.getElementById('books-category-id').value)
        };
        endpoint = mode === 'edit' ? `/books/${id}` : '/books';
    }
    if (section === 'publishers') {
        payload = { name: document.getElementById('publishers-name').value };
        endpoint = mode === 'edit' ? `/publishers/${id}` : '/publishers';
    }
    if (section === 'categories') {
        payload = { name: document.getElementById('categories-name').value };
        endpoint = mode === 'edit' ? `/categories/${id}` : '/categories';
    }
    if (section === 'ratings') {
        const bookId = document.getElementById('ratings-book-id').value;
        payload = { score: parseInt(document.getElementById('ratings-score').value) };
        endpoint = mode === 'edit' ? `/ratings/${id}` : `/books/${bookId}/ratings`;
    }
    try {
        const response = await fetch(endpoint, {
            method: mode === 'edit' ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            showAlert(section, mode === 'edit' ? '\u2705 Sikeresen friss\u00edtve!' : '\u2705 Sikeresen hozz\u00e1adva!', 'success');
            resetForm(section);
            reloadSection(section);
            if (section === 'publishers' || section === 'categories') loadMetadata();
        } else {
            const err = await response.json();
            showAlert(section, `\u274c Hiba: ${err.message || err.error || 'Ismeretlen hiba'}`, 'error');
        }
    } catch (err) {
        showAlert(section, '\u274c H\u00e1l\u00f3zati hiba!', 'error');
    }
}

function resetForm(section) {
    document.getElementById(`${section}-form`).reset();
    document.getElementById(`${section}-id`).value = '';
    document.getElementById(`${section}-operation-mode`).value = 'add';
    document.getElementById(`${section}-edit-info`).style.display = 'none';
    document.getElementById(`${section}-submit-btn`).textContent = '\ud83d\udcbe Ment\u00e9s';
    selectedId[section] = null;
}

function reloadSection(section) {
    if (section === 'books') loadBooks();
    if (section === 'publishers') loadPublishers();
    if (section === 'categories') loadCategories();
    if (section === 'ratings') loadRatings();
}

function showAlert(section, message, type) {
    const container = document.getElementById(`alert-${section}`);
    container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 4000);
}

function emptyState(icon, title, sub) {
    return `<div class="empty-state"><div class="empty-state-icon">${icon}</div><h3>${title}</h3><p>${sub}</p></div>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
