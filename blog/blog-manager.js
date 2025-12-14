// ブログ記事管理システム
class BlogManager {
    constructor() {
        this.posts = [];
        this.categories = ['AI', '業務効率化', 'Web開発', 'チュートリアル', 'その他'];
        this.loadPosts();
    }

    // 記事データの読み込み
    loadPosts() {
        // posts.jsから記事データを読み込み
        if (typeof posts !== 'undefined') {
            this.posts = posts;
        }
    }

    // 記事の追加
    addPost(postData) {
        const newPost = {
            id: this.generateId(),
            title: postData.title,
            date: postData.date || new Date().toISOString().split('T')[0],
            category: postData.category || 'その他',
            tags: postData.tags || [],
            metaDescription: postData.metaDescription,
            content: postData.content,
            author: postData.author || '鶴村佳輝',
            featured: postData.featured || false
        };

        this.posts.unshift(newPost); // 新しい記事を先頭に追加
        this.savePosts();
        return newPost;
    }

    // 記事の更新
    updatePost(id, postData) {
        const index = this.posts.findIndex(post => post.id === id);
        if (index !== -1) {
            this.posts[index] = { ...this.posts[index], ...postData };
            this.savePosts();
            return this.posts[index];
        }
        return null;
    }

    // 記事の削除
    deletePost(id) {
        const index = this.posts.findIndex(post => post.id === id);
        if (index !== -1) {
            const deletedPost = this.posts.splice(index, 1)[0];
            this.savePosts();
            return deletedPost;
        }
        return null;
    }

    // 記事の検索
    searchPosts(query) {
        const searchTerm = query.toLowerCase();
        return this.posts.filter(post =>
            post.title.toLowerCase().includes(searchTerm) ||
            post.metaDescription.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    // カテゴリ別記事取得
    getPostsByCategory(category) {
        return this.posts.filter(post => post.category === category);
    }

    // タグ別記事取得
    getPostsByTag(tag) {
        return this.posts.filter(post => post.tags.includes(tag));
    }

    // 注目記事の取得
    getFeaturedPosts() {
        return this.posts.filter(post => post.featured);
    }

    // 最新記事の取得
    getRecentPosts(limit = 5) {
        return this.posts.slice(0, limit);
    }

    // IDの生成
    generateId() {
        return 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
    }

    // 記事データの保存（LocalStorageを使用）
    savePosts() {
        try {
            localStorage.setItem('blog-posts', JSON.stringify(this.posts));
        } catch (error) {
            console.error('記事の保存に失敗しました:', error);
        }
    }

    // LocalStorageから記事データを読み込み
    loadFromStorage() {
        try {
            const savedPosts = localStorage.getItem('blog-posts');
            if (savedPosts) {
                this.posts = JSON.parse(savedPosts);
            }
        } catch (error) {
            console.error('記事の読み込みに失敗しました:', error);
        }
    }

    // 全タグの取得
    getAllTags() {
        const allTags = new Set();
        this.posts.forEach(post => {
            post.tags.forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags);
    }

    // 記事統計の取得
    getStats() {
        return {
            totalPosts: this.posts.length,
            categories: this.categories.map(cat => ({
                name: cat,
                count: this.getPostsByCategory(cat).length
            })),
            tags: this.getAllTags().map(tag => ({
                name: tag,
                count: this.getPostsByTag(tag).length
            })),
            featuredCount: this.getFeaturedPosts().length
        };
    }
}

// グローバルインスタンス
window.blogManager = new BlogManager();