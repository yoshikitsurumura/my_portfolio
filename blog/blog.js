document.addEventListener('DOMContentLoaded', function() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    // posts.jsで定義されたposts変数を参照
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post-summary');

        const titleElement = document.createElement('h3');
        const linkElement = document.createElement('a');
        linkElement.href = `post.html?id=${post.id}`;
        linkElement.textContent = post.title;
        titleElement.appendChild(linkElement);

        const dateElement = document.createElement('p');
        dateElement.classList.add('post-date');
        dateElement.textContent = post.date;

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = post.metaDescription;

        postElement.appendChild(titleElement);
        postElement.appendChild(dateElement);
        postElement.appendChild(descriptionElement);

        postsContainer.appendChild(postElement);
    });
});
