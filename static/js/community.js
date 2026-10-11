const communityPosts = [
    {
        id: 'post-1',
        category: 'ideas',
        grade: 'elementary-4',
        author: 'Maya Chen',
        initials: 'MC',
        avatar: 'avatar-coral',
        details: 'Grade 4 · 18 min ago',
        search: 'maya chen reading workshop book clubs literacy groups small groups',
        tag: 'Teaching idea',
        tagClass: 'tag-idea',
        paragraphs: [
            'We tried “book tasting” this week and my reluctant readers asked to stay in during recess to finish their books. 🍎📚',
            'Set up little table stations with a different genre at each one. Five minutes to sample, then they leave a tiny review card. The conversations were the best part.',
        ],
        illustration: true,
        likes: 24,
        commentCount: 6,
        comments: [
            { author: 'Jordan Lee', text: 'Love this! Adding it to our literacy week.' },
            { author: 'Sam Rivera', text: 'The review cards are such a nice touch ✨' },
        ],
    },
    {
        id: 'post-2',
        category: 'wins',
        author: 'Jordan Lee',
        initials: 'JL',
        avatar: 'avatar-lilac',
        details: 'Middle school math · 1 hr ago',
        search: 'jordan lee classroom win fractions pizza math students parents',
        tag: 'Classroom win',
        tagClass: 'tag-win',
        paragraphs: [
            'One of those moments that makes the long week worth it: a student who’s been afraid of fractions volunteered to explain equivalent fractions to the class today. 🥹',
            'We used paper “pizza” slices to make it click. Their proud little grin? I’m keeping that one.',
        ],
        likes: 38,
        commentCount: 12,
        comments: [
            { author: 'Alex Morgan', text: 'That confidence is everything. Congrats!' },
        ],
    },
    {
        id: 'post-3',
        category: 'questions',
        grade: 'elementary-2',
        author: 'Alex Morgan',
        initials: 'AM',
        avatar: 'avatar-mint',
        details: 'Grade 2 · 3 hrs ago',
        search: 'alex morgan question calm transitions classroom routine attention focus',
        tag: 'Question',
        tagClass: 'tag-question',
        paragraphs: [
            'What’s your go-to for calmer transitions after lunch? We come back with plenty of energy (which I love!) but it takes a while to settle into our afternoon routine.',
            'Would love to hear what works in your classroom. 🌿',
        ],
        likes: 16,
        commentCount: 9,
        comments: [
            { author: 'Maya Chen', text: 'We do a two-minute drawing prompt. Helps us all reset!' },
        ],
    },
];

(() => {
    const feed = document.querySelector('#post-list');
    if (!feed) return;

    const search = document.querySelector('#community-search');
    const curriculumFilters = [...document.querySelectorAll('[data-filter-field]')];
    const countryFilter = document.querySelector('#filter-country');
    const textbookFilter = document.querySelector('#filter-textbook');
    let activeFilter = 'all';

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function createIcon(className) {
        return createElement('i', `bi ${className}`);
    }

    function createComment(commentData) {
        const comment = createElement('p');
        comment.append(
            createElement('b', '', commentData.author),
            document.createTextNode(` ${commentData.text}`)
        );
        return comment;
    }

    function createPost(postData) {
        const post = createElement('article', 'community-post');
        post.dataset.category = postData.category;
        post.dataset.search = postData.search;
        if (postData.grade) post.dataset.grade = postData.grade;

        const topline = createElement('div', 'post-topline');
        topline.append(createElement('div', `teacher-avatar ${postData.avatar}`, postData.initials));
        const author = createElement('div', 'post-author');
        author.append(
            createElement('strong', '', postData.author),
            createElement('span', '', postData.details)
        );
        topline.append(author);
        const moreButton = createElement('button', 'post-more');
        moreButton.type = 'button';
        moreButton.setAttribute('aria-label', 'More post options');
        moreButton.append(createIcon('bi-three-dots'));
        topline.append(moreButton);
        post.append(topline);

        const copy = createElement('div', 'post-copy');
        copy.append(createElement('span', `post-tag ${postData.tagClass}`, postData.tag));
        postData.paragraphs.forEach((paragraph) => {
            copy.append(createElement('p', '', paragraph));
        });
        post.append(copy);

        if (postData.illustration) {
            const visual = createElement('div', 'post-visual book-visual');
            visual.setAttribute('aria-label', 'Illustration of a cozy stack of books');
            visual.append(createElement('span', 'book-sun'));
            const stack = createElement('div', 'book-stack');
            stack.append(createElement('i'), createElement('i'), createElement('i'));
            visual.append(stack);
            const note = createElement('span', 'book-note');
            note.append(
                document.createTextNode('a good'),
                createElement('br'),
                document.createTextNode('story starts'),
                createElement('br'),
                document.createTextNode('somewhere')
            );
            visual.append(note);
            visual.append(createElement('span', 'book-sparkle', '✳'));
            post.append(visual);
        }

        const meta = createElement('div', 'post-meta');
        const likes = createElement('span');
        likes.append(
            createIcon('bi-heart-fill'),
            document.createTextNode(' '),
            createElement('b', '', String(postData.likes)),
            document.createTextNode(' appreciations')
        );
        likes.querySelector('b').dataset.likeCount = '';
        const comments = createElement('span');
        comments.append(
            createElement('b', '', String(postData.commentCount)),
            document.createTextNode(' comments')
        );
        comments.querySelector('b').dataset.commentCount = '';
        meta.append(likes, comments);
        post.append(meta);

        const actions = createElement('div', 'post-actions');
        const likeButton = createElement('button', 'post-action like-button');
        likeButton.type = 'button';
        likeButton.setAttribute('aria-pressed', 'false');
        likeButton.append(createIcon('bi-heart'), createElement('span', '', 'Appreciate'));
        const commentButton = createElement('button', 'post-action comment-toggle');
        commentButton.type = 'button';
        commentButton.append(createIcon('bi-chat'), createElement('span', '', 'Comment'));
        const bookmarkButton = createElement('button', 'post-action bookmark-button');
        bookmarkButton.type = 'button';
        bookmarkButton.setAttribute('aria-label', 'Bookmark post');
        bookmarkButton.setAttribute('aria-pressed', 'false');
        bookmarkButton.append(createIcon('bi-bookmark'));
        actions.append(likeButton, commentButton, bookmarkButton);
        post.append(actions);

        const panel = createElement('div', 'comment-panel');
        panel.hidden = true;
        const commentList = createElement('div', 'comment-list');
        postData.comments.forEach((comment) => commentList.append(createComment(comment)));
        const form = createElement('form', 'comment-form');
        const inputId = `${postData.id}-comment`;
        const label = createElement('label', 'visually-hidden', 'Write a comment');
        label.htmlFor = inputId;
        const input = createElement('input');
        input.id = inputId;
        input.maxLength = 240;
        input.placeholder = 'Add something kind or helpful…';
        input.required = true;
        const submit = createElement('button');
        submit.type = 'submit';
        submit.setAttribute('aria-label', 'Post comment');
        submit.append(createIcon('bi-arrow-up'));
        form.append(label, input, submit);
        panel.append(commentList, form);
        post.append(panel);

        return post;
    }

    const posts = communityPosts.map(createPost);
    const empty = createElement('div', 'community-empty');
    empty.id = 'community-empty';
    empty.hidden = true;
    empty.append(
        createIcon('bi-search'),
        createElement('h2', '', 'No posts found'),
        createElement('p', '', 'Try another search or choose a different filter.')
    );
    feed.append(...posts, empty);

    function updateFeed() {
        const query = (search?.value || '').trim().toLowerCase();
        const selectedCurriculumFilters = curriculumFilters.filter((filter) => filter.value);
        let visibleCount = 0;
        posts.forEach((post) => {
            const matchesFilter = activeFilter === 'all' || post.dataset.category === activeFilter;
            const haystack = `${post.dataset.search || ''} ${post.textContent}`.toLowerCase();
            const matchesSearch = !query || haystack.includes(query);
            const matchesCurriculum = selectedCurriculumFilters.every(
                (filter) => post.dataset[filter.dataset.filterField] === filter.value
            );
            const visible = matchesFilter && matchesSearch && matchesCurriculum;
            post.hidden = !visible;
            if (visible) visibleCount += 1;
        });
        empty.hidden = visibleCount !== 0;
    }

    countryFilter?.addEventListener('change', () => {
        if (textbookFilter) {
            textbookFilter.options[0].textContent = countryFilter.value
                ? 'No textbooks available yet'
                : 'Select a country first';
        }
        updateFeed();
    });

    curriculumFilters.forEach((filter) => {
        filter.addEventListener('change', updateFeed);
    });

    document.querySelectorAll('.feed-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            activeFilter = tab.dataset.filter;
            document.querySelectorAll('.feed-tab').forEach((item) => {
                const selected = item === tab;
                item.classList.toggle('is-active', selected);
                item.setAttribute('aria-pressed', String(selected));
            });
            updateFeed();
        });
    });

    search?.addEventListener('input', updateFeed);
    document.addEventListener('keydown', (event) => {
        if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
            event.preventDefault();
            search?.focus();
        }
        if (event.key === 'Escape' && document.activeElement === search) {
            search.value = '';
            search.blur();
            updateFeed();
        }
    });

    posts.forEach((post) => {
        const like = post.querySelector('.like-button');
        const likeCount = post.querySelector('[data-like-count]');
        like.addEventListener('click', () => {
            const pressed = like.getAttribute('aria-pressed') === 'true';
            like.setAttribute('aria-pressed', String(!pressed));
            likeCount.textContent = String(Number(likeCount.textContent) + (pressed ? -1 : 1));
        });

        const bookmark = post.querySelector('.bookmark-button');
        bookmark.addEventListener('click', () => {
            const saved = bookmark.getAttribute('aria-pressed') === 'true';
            bookmark.setAttribute('aria-pressed', String(!saved));
            bookmark.setAttribute('aria-label', saved ? 'Bookmark post' : 'Remove bookmark');
        });

        const panel = post.querySelector('.comment-panel');
        const toggle = post.querySelector('.comment-toggle');
        toggle.addEventListener('click', () => {
            panel.hidden = !panel.hidden;
            if (!panel.hidden) panel.querySelector('input')?.focus();
        });

        const form = post.querySelector('.comment-form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input');
            const value = input.value.trim();
            if (!value) return;
            post.querySelector('.comment-list').append(createComment({ author: 'You', text: value }));
            const count = post.querySelector('[data-comment-count]');
            count.textContent = String(Number(count.textContent) + 1);
            input.value = '';
            updateFeed();
        });
    });
})();
