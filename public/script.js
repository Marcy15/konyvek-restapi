const API_BASE = '';

let currentBooks = [];
let currentAuthors = [];
let currentPublishers = [];
let currentCategories = [];
let currentRatings = [];

let selectedId = {
    books: null,
    authors: null,
    publishers: null,
    categories: null,
    ratings: null
};

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

    document.getElementById('authors-operation-mode').addEventListener('change', (e) => {
        toggleEditMode('authors', e.target.value === 'edit');
    });
    document.getElementById('authors-form').addEventListener('submit', (e) => handleSubmit(e, 'authors'));
    document.getElementById('authors-reset-btn').addEventListener('click', () => resetForm('authors'));

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
    document.getElementById(`${section}-submit-btn`).textContent = isEdit ? '✏️ Frissítés' : '💾 Mentés';

    if (!isEdit) {
        resetForm(section);
    }
}

function switchTab(tab, event) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(`tab-${tab}`).classList.add('active');
    if (event) {
        event.target.classList.add('active');
    }

    if (tab === 'authors') loadAuthors();
    if (tab === 'publishers') loadPublishers();
    if (tab === 'categories') loadCategories();
    if (tab === 'ratings') loadRatings();
    if (tab === 'books') loadBooks();
}

async function loadMetadata() {
    try {
        const [authors, publishers, categories, books] = await Promise.all([
            fetch('/authors').then(r => r.json()),
            fetch('/publishers').then(r => r.json()),
            fetch('/categories').then(r => r.json()),
            fetch('/books').then(r => r.json())
        ]);

        currentAuthors = authors.items || [];
        currentPublishers = publishers.items || [];
        currentCategories = categories.items || [];
        currentBooks = books.items || [];

        populateSelect('books-author-id', currentAuthors, 'id', 'name');
        populateSelect('books-publisher-id', currentPublishers, 'id', 'name');
        populateSelect('books-category-id', currentCategories, 'id', 'name');

        populateSelect('filter-author', currentAuthors, 'id', 'name', true);
        populateSelect('filter-publisher', currentPublishers, 'id', 'name', true);
        populateSelect('filter-category', currentCategories, 'id', 'name', true);

        populateSelect('ratings-book-id', currentBooks, 'id', 'title');
    } catch (err) {
        console.error('Metadata load error:', err);
        showAlert('Nem sikerült betölteni a metaadatokat.', 'error');
    }
}

function populateSelect(elementId, items, valueKey, textKey, keepFirst = false) {
    const select = document.getElementById(elementId);
    if (!select) return;

    const firstOption = keepFirst ? select.querySelector('option')?.outerHTML || '' : '';
    select.innerHTML = firstOption;

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        select.appendChild(option);
    });
}

async function loadBooks() {
    const container = document.getElementById('books-container');
    container.innerHTML = loadingTemplate();

    try {
        const response = await fetch('/books');
        const data = await response.json();
        currentBooks = data.items || [];
        renderBooks(currentBooks);
    } catch (err) {
        console.error(err);
        container.innerHTML = emptyTemplate('Hiba történt a könyvek betöltésekor.');
    }
}

function renderBooks(books) {
    const container = document.getElementById('books-container');

    if (!books.length) {
        container.innerHTML = emptyTemplate('Nincs megjeleníthető könyv.');
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="book-card ${selectedId.books === book.id ? 'selected' : ''}" onclick="selectItem('books', ${book.id})">
            <div class="book-title">${escapeHtml(book.title || '')}</div>
            <div class="book-meta"><strong>Szerző:</strong> ${escapeHtml(book.author_name || book.author?.name || '')}</div>
            <div class="book-meta"><strong>Kiadó:</strong> ${escapeHtml(book.publisher_name || book.publisher?.name || '')}</div>
            <div class="book-meta"><strong>Kategória:</strong> ${escapeHtml(book.category_name || book.category?.name || '')}</div>
            ${book.isbn ? `<div class="book-meta"><span class="badge badge-isbn">${escapeHtml(book.isbn)}</span></div>` : ''}
            ${book.price !== undefined && book.price !== null ? `<div class="book-price">${Number(book.price)} Ft</div>` : ''}
            ${book.description ? `<div class="book-meta">${escapeHtml(book.description)}</div>` : ''}
            <div class="book-actions">
                <button type="button" class="btn-warning" onclick="event.stopPropagation(); editItem('books', ${book.id})">✏️ Szerkesztés</button>
                <button type="button" class="btn-danger" onclick="event.stopPropagation(); deleteItem('books', ${book.id})">✖️ Törlés</button>
            </div>
        </div>
    `).join('');
}

async function loadAuthors() {
    const container = document.getElementById('authors-container');
    container.innerHTML = loadingTemplate();

    try {
        const response = await fetch('/authors');
        const data = await response.json();
        currentAuthors = data.items || [];
        renderAuthors(currentAuthors);
    } catch (err) {
        console.error(err);
        container.innerHTML = emptyTemplate('Hiba történt az írók betöltésekor.');
    }
}

function renderAuthors(items) {
    const container = document.getElementById('authors-container');

    if (!items.length) {
        container.innerHTML = emptyTemplate('Nincs megjeleníthető író.');
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="list-item ${selectedId.authors === item.id ? 'selected' : ''}" onclick="selectItem('authors', ${item.id})">
            <div class="list-item-info">
                <div class="list-item-title">${escapeHtml(item.name || '')}</div>
                <div class="list-item-sub">${escapeHtml(item.bio || 'Nincs bemutatkozás')}</div>
            </div>
            <div class="list-item-actions">
                <button type="button" class="btn-warning" onclick="event.stopPropagation(); editItem('authors', ${item.id})">✏️ Szerkesztés</button>
                <button type="button" class="btn-danger" onclick="event.stopPropagation(); deleteItem('authors', ${item.id})">✖️ Törlés</button>
            </div>
        </div>
    `).join('');
}

async function loadPublishers() {
    const container = document.getElementById('publishers-container');
    container.innerHTML = loadingTemplate();

    try {
        const response = await fetch('/publishers');
        const data = await response.json();
        currentPublishers = data.items || [];
        renderSimpleList('publishers', currentPublishers, 'publishers-container', 'Nincs megjeleníthető kiadó.');
    } catch (err) {
        console.error(err);
        container.innerHTML = emptyTemplate('Hiba történt a kiadók betöltésekor.');
    }
}

async function loadCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = loadingTemplate();

    try {
        const response = await fetch('/categories');
        const data = await response.json();
        currentCategories = data.items || [];
        renderSimpleList('categories', currentCategories, 'categories-container', 'Nincs megjeleníthető kategória.');
    } catch (err) {
        console.error(err);
        container.innerHTML = emptyTemplate('Hiba történt a kategóriák betöltésekor.');
    }
}

async function loadRatings() {
    const container = document.getElementById('ratings-container');
    container.innerHTML = loadingTemplate();

    try {
        const response = await fetch('/ratings');
        const data = await response.json();
        currentRatings = data.items || [];
        renderRatings(currentRatings);
    } catch (err) {
        console.error(err);
        container.innerHTML = emptyTemplate('Hiba történt az értékelések betöltésekor.');
    }
}

function renderSimpleList(section, items, containerId, emptyMessage) {
    const container = document.getElementById(containerId);

    if (!items.length) {
        container.innerHTML = emptyTemplate(emptyMessage);
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="list-item ${selectedId[section] === item.id ? 'selected' : ''}" onclick="selectItem('${section}', ${item.id})">
            <div class="list-item-info">
                <div class="list-item-title">${escapeHtml(item.name || '')}</div>
                ${item.description ? `<div class="list-item-sub">${escapeHtml(item.description)}</div>` : ''}
            </div>
            <div class="list-item-actions">
                <button type="button" class="btn-warning" onclick="event.stopPropagation(); editItem('${section}', ${item.id})">✏️ Szerkesztés</button>
                <button type="button" class="btn-danger" onclick="event.stopPropagation(); deleteItem('${section}', ${item.id})">✖️ Törlés</button>
            </div>
        </div>
    `).join('');
}

function renderRatings(items) {
    const container = document.getElementById('ratings-container');

    if (!items.length) {
        container.innerHTML = emptyTemplate('Nincs megjeleníthető értékelés.');
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="list-item ${selectedId.ratings === item.id ? 'selected' : ''}" onclick="selectItem('ratings', ${item.id})">
            <div class="list-item-info">
                <div class="list-item-title">${escapeHtml(item.book_title || item.book?.title || 'Ismeretlen könyv')}</div>
                <div class="list-item-sub">
                    <span class="badge badge-score">${escapeHtml(String(item.score ?? '-'))}/5</span>
                    ${item.review ? ` — ${escapeHtml(item.review)}` : ''}
                </div>
            </div>
            <div class="list-item-actions">
                <button type="button" class="btn-danger" onclick="event.stopPropagation(); deleteItem('ratings', ${item.id})">✖️ Törlés</button>
            </div>
        </div>
    `).join('');
}

function selectItem(section, id) {
    selectedId[section] = id;

    if (section === 'books') renderBooks(currentBooks);
    if (section === 'authors') renderAuthors(currentAuthors);
    if (section === 'publishers') renderSimpleList('publishers', currentPublishers, 'publishers-container', 'Nincs megjeleníthető kiadó.');
    if (section === 'categories') renderSimpleList('categories', currentCategories, 'categories-container', 'Nincs megjeleníthető kategória.');
    if (section === 'ratings') renderRatings(currentRatings);
}

function editItem(section, id) {
    const itemsMap = {
        books: currentBooks,
        authors: currentAuthors,
        publishers: currentPublishers,
        categories: currentCategories,
        ratings: currentRatings
    };

    const item = itemsMap[section].find(i => i.id === id);
    if (!item) return;

    document.getElementById(`${section}-operation-mode`).value = 'edit';
    toggleEditMode(section, true);
    selectedId[section] = id;

    if (section === 'books') {
        document.getElementById('books-title').value = item.title || '';
        document.getElementById('books-author-id').value = item.author_id || item.author?.id || '';
        document.getElementById('books-publisher-id').value = item.publisher_id || item.publisher?.id || '';
        document.getElementById('books-category-id').value = item.category_id || item.category?.id || '';
        document.getElementById('books-isbn').value = item.isbn || '';
        document.getElementById('books-price').value = item.price ?? '';
        document.getElementById('books-description').value = item.description || '';
        renderBooks(currentBooks);
    }

    if (section === 'authors') {
        document.getElementById('authors-name').value = item.name || '';
        document.getElementById('authors-bio').value = item.bio || '';
        renderAuthors(currentAuthors);
    }

    if (section === 'publishers') {
        document.getElementById('publishers-name').value = item.name || '';
        renderSimpleList('publishers', currentPublishers, 'publishers-container', 'Nincs megjeleníthető kiadó.');
    }

    if (section === 'categories') {
        document.getElementById('categories-name').value = item.name || '';
        renderSimpleList('categories', currentCategories, 'categories-container', 'Nincs megjeleníthető kategória.');
    }

    if (section === 'ratings') {
        document.getElementById('ratings-book-id').value = item.book_id || item.book?.id || '';
        document.getElementById('ratings-score').value = item.score ?? '';
        document.getElementById('ratings-review').value = item.review || '';
        renderRatings(currentRatings);
    }
}

function resetForm(section) {
    const form = document.getElementById(`${section}-form`);
    if (form) form.reset();

    selectedId[section] = null;

    if (section === 'books') renderBooks(currentBooks);
    if (section === 'authors') renderAuthors(currentAuthors);
    if (section === 'publishers') renderSimpleList('publishers', currentPublishers, 'publishers-container', 'Nincs megjeleníthető kiadó.');
    if (section === 'categories') renderSimpleList('categories', currentCategories, 'categories-container', 'Nincs megjeleníthető kategória.');
    if (section === 'ratings') renderRatings(currentRatings);
}

async function handleSubmit(e, section) {
    e.preventDefault();

    const mode = document.getElementById(`${section}-operation-mode`).value;
    const isEdit = mode === 'edit';
    const id = selectedId[section];

    if (isEdit && !id) {
        showAlert('Előbb válassz ki egy elemet szerkesztéshez.', 'error');
        return;
    }

    const payload = buildPayload(section, isEdit);

    const config = getSectionConfig(section);
    const url = isEdit ? `${config.endpoint}/${id}` : config.endpoint;
    const method = isEdit ? 'PATCH' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        showAlert(isEdit ? 'Sikeres frissítés.' : 'Sikeres mentés.', 'success');
        resetForm(section);

        await reloadSection(section);
        await loadMetadata();
    } catch (err) {
        console.error(err);
        showAlert('A mentés nem sikerült.', 'error');
    }
}

function buildPayload(section, isEdit = false) {
    if (section === 'books') {
        return {
            title: document.getElementById('books-title').value.trim(),
            author_id: Number(document.getElementById('books-author-id').value),
            publisher_id: Number(document.getElementById('books-publisher-id').value),
            category_id: Number(document.getElementById('books-category-id').value),
            isbn: document.getElementById('books-isbn').value.trim(),
            price: document.getElementById('books-price').value ? Number(document.getElementById('books-price').value) : null,
            description: document.getElementById('books-description').value.trim()
        };
    }

    if (section === 'authors') {
        return {
            name: document.getElementById('authors-name').value.trim(),
            bio: document.getElementById('authors-bio').value.trim()
        };
    }

    if (section === 'publishers') {
        return {
            name: document.getElementById('publishers-name').value.trim()
        };
    }

    if (section === 'categories') {
        return {
            name: document.getElementById('categories-name').value.trim()
        };
    }

    if (section === 'ratings') {
        return {
            book_id: Number(document.getElementById('ratings-book-id').value),
            score: Number(document.getElementById('ratings-score').value),
            review: document.getElementById('ratings-review').value.trim()
        };
    }

    return {};
}

async function deleteItem(section, id) {
    const config = getSectionConfig(section);

    if (!confirm('Biztosan törölni szeretnéd ezt az elemet?')) {
        return;
    }

    try {
        const response = await fetch(`${config.endpoint}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        showAlert('Sikeres törlés.', 'success');

        if (selectedId[section] === id) {
            selectedId[section] = null;
        }

        await reloadSection(section);
        await loadMetadata();
    } catch (err) {
        console.error(err);
        showAlert('A törlés nem sikerült.', 'error');
    }
}

function getSectionConfig(section) {
    const map = {
        books: { endpoint: '/books' },
        authors: { endpoint: '/authors' },
        publishers: { endpoint: '/publishers' },
        categories: { endpoint: '/categories' },
        ratings: { endpoint: '/ratings' }
    };

    return map[section];
}

async function reloadSection(section) {
    if (section === 'books') await loadBooks();
    if (section === 'authors') await loadAuthors();
    if (section === 'publishers') await loadPublishers();
    if (section === 'categories') await loadCategories();
    if (section === 'ratings') await loadRatings();
}

function applyBookFilters() {
    const title = document.getElementById('filter-title').value.trim().toLowerCase();
    const authorId = document.getElementById('filter-author').value;
    const publisherId = document.getElementById('filter-publisher').value;
    const categoryId = document.getElementById('filter-category').value;

    const filtered = currentBooks.filter(book => {
        const matchTitle = !title || (book.title || '').toLowerCase().includes(title);
        const matchAuthor = !authorId || String(book.author_id || book.author?.id) === String(authorId);
        const matchPublisher = !publisherId || String(book.publisher_id || book.publisher?.id) === String(publisherId);
        const matchCategory = !categoryId || String(book.category_id || book.category?.id) === String(categoryId);

        return matchTitle && matchAuthor && matchPublisher && matchCategory;
    });

    renderBooks(filtered);
}

function resetBookFilters() {
    document.getElementById('filter-title').value = '';
    document.getElementById('filter-author').value = '';
    document.getElementById('filter-publisher').value = '';
    document.getElementById('filter-category').value = '';
    renderBooks(currentBooks);
}

function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    const alert = document.createElement('div');

    alert.className = `alert alert-${type === 'success' ? 'success' : 'error'}`;
    alert.textContent = message;

    container.innerHTML = '';
    container.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}

function loadingTemplate() {
    return `
        <div class="loading">
            <div class="spinner"></div>
            <div>Betöltés...</div>
        </div>
    `;
}

function emptyTemplate(message) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">∅</div>
            <div>${escapeHtml(message)}</div>
        </div>
    `;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}