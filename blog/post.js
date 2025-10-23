document.addEventListener('DOMContentLoaded', function() {
    const postContentContainer = document.querySelector('#post-content .container');
    if (!postContentContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // posts.jsで定義されたposts変数を参照
    const post = posts.find(p => p.id === postId);

    if (post) {
        // Set the page title
        document.title = `${post.title} | CraneAI`;

        // Create and append post elements
        const titleElement = document.createElement('h1');
        titleElement.textContent = post.title;

        const dateElement = document.createElement('p');
        dateElement.classList.add('post-date');
        dateElement.textContent = `Published on: ${post.date}`;

        const contentElement = document.createElement('div');
        contentElement.classList.add('post-body');
        contentElement.innerHTML = post.content; // Use innerHTML to render the HTML tags in the content

        postContentContainer.appendChild(titleElement);
        postContentContainer.appendChild(dateElement);
        postContentContainer.appendChild(contentElement);
    } else {
        postContentContainer.innerHTML = '<h1>Post not found</h1><p>The requested blog post could not be found.</p>';
    }
});
