const CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    USER: '/users/:id',
    TIMELINE_POSTS: '/posts/timeline',
    COMMENTS: '/comment',
    POST_COMMENTS: '/comment/post',
    REPLIES: '/comment/post/reply',
    LIKE_POST: '/posts/like',
    CREATE_POST: '/posts',
    PROFILE_PICTURE: '/user/profilePicture',
    COVER_PICTURE: '/user/coverPicture',
  },
  DEFAULT_IMAGE: '/images/default.png',
  VISIBLE_COMMENTS: 3,
  VISIBLE_REPLIES: 1,
};

const Helpers = {
  formatDate: (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', dateStr, error);
      return 'Unknown Date';
    }
  },
  createElement: (tag, classes = [], content = '') => {
    const element = document.createElement(tag);
    if (classes.length) element.classList.add(...classes);
    if (content) element.innerHTML = content;
    return element;
  },
  fadeIn: (element) => {
    element.style.opacity = '0';
    setTimeout(() => {
      element.style.transition = 'opacity 0.3s ease';
      element.style.opacity = '1';
    }, 50);
  },
  safeAccess: (obj, path, defaultValue = null) => {
    try {
      return path.reduce((current, key) => current[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  },
  processImage: (imagePath) => {
    console.log('Processing image path:', imagePath);
    if (!imagePath || typeof imagePath !== 'string') {
      console.warn('Image path is invalid or empty, using default image:', CONFIG.DEFAULT_IMAGE);
      return CONFIG.DEFAULT_IMAGE;
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('/images')) {
      console.log('Image is a URL or correct path:', imagePath);
      return imagePath;
    }
    const processedPath = `/images/${imagePath}`;
    console.log('Image is a local path, prepended /images/:', processedPath);
    return processedPath;
  },
};

const API = {
  fetchUser: async (userId) => {
    try {
      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USER.replace(':id', userId)}`;
      console.log('Fetching user from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      // console.log('Raw user response:', result);
      if (result.data) {
        // console.log('Fetched user data:', result.data);
        return result.data;
      } else {
        console.warn('No user data found in response:', result);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user:', userId, error);
      return null;
    }
  },
  fetchTimelinePosts: async () => {
    try {
      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.TIMELINE_POSTS}`;
      console.log('Fetching timeline posts from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Raw timeline posts response:', result);
      if (result.data) {
        console.log('Fetched timeline posts:', result.data);
        return result.data;
      } else {
        console.warn('No timeline posts found in response:', result);
        return [];
      }
    } catch (error) {
      console.error('Error fetching timeline posts:', error);
      return [];
    }
  },
  fetchComments: async (postId) => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POST_COMMENTS}/${postId}`);
      const result = await response.json();
      console.log('Fetched comments for post', postId, ':', result.data?.comments);
      return result.status === 'success' ? result.data.comments || [] : [];
    } catch (error) {
      console.error('Error fetching comments for post', postId, ':', error);
      return [];
    }
  },
  createComment: async (postId, content) => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.COMMENTS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content }),
      });
      const result = await response.json();
      console.log('Created comment for post', postId, ':', result.data);
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.error('Error creating comment for post', postId, ':', error);
      return null;
    }
  },
  createReply: async (commentId, content) => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.REPLIES}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, content }),
      });
      const result = await response.json();
      console.log('Created reply for comment', commentId, ':', result.data?.reply);
      return result.status === 'success' ? result.data.reply : null;
    } catch (error) {
      console.error('Error creating reply for comment', commentId, ':', error);
      return null;
    }
  },
  likePost: async (postId) => {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.LIKE_POST}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const result = await response.json();
      console.log('Like action for post', postId, ':', result.data);
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.error('Error liking post', postId, ':', error);
      return null;
    }
  },
  createPost: async (content, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (imageFile) {
        formData.append('image', imageFile);
        formData.append('imageType', 'post');
      }
      console.log('Creating post with data:', {
        content,
        hasImage: !!imageFile,
        formData: [...formData.entries()],
      });

      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CREATE_POST}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Created post:', result);
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.error('Error creating post:', error.message);
      throw error;
    }
  },
};

async function acceptFriendRequest(id) {
  console.log('Accepted friend with ID:', id);
  const url = `/friend/accept`;
  const data = { friendId: id };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Success:', result);
    location.reload();
  } catch (error) {
    console.error('Error:', error);
  }
}

async function rejectFriendRequest(id) {
  console.log('Rejected friend with ID:', id);
  const url = `/friend/reject`;
  const data = { friendId: id };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Success:', result);
    location.reload();
  } catch (error) {
    console.error('Error:', error);
  }
}

const LikeManager = {
  getLikeImages: (users) => {
    const safeUsers = Array.isArray(users) ? users : [];
    console.log('Like users:', safeUsers.map((user) => ({
      _id: user._id,
      name: user.name,
      image: user.image,
    })));
    return safeUsers.slice(0, 3).map((user) => ({
      image: Helpers.processImage(user.image),
      name: user.name || 'Unknown User',
    }));
  },
  renderLikes: (container, likesCount, likeImages) => {
    console.log('Rendering likes:', { likesCount, likeImages });
    if (likesCount === 0) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = `
      ${likeImages.map((img) => `<span><img src="${img.image}" alt="${img.name}" /></span>`).join('')}
      <p>Liked by <b>${likesCount} ${likesCount === 1 ? 'person' : 'people'}</b></p>
    `;
  },
  addLikeEvent: (button, post, currentUserId, likedByContainer) => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!currentUserId) {
        alert('Please log in to like a post.');
        return;
      }
      const updatedPost = await API.likePost(post._id);
      if (updatedPost) {
        console.log('Updated post likes:', updatedPost.likes?.users?.map((user) => ({
          _id: user._id,
          name: user.name,
          image: user.image,
        })));
        post.likes = updatedPost.likes || { likesCount: 0, users: [] };
        const isNowLiked = Helpers.safeAccess(post, ['likes', 'users'], []).some((user) => user._id === currentUserId);
        button.classList.toggle('liked', isNowLiked);
        button.querySelector('span').innerHTML = `<i class="uil uil-heart"></i> ${isNowLiked ? 'Unlike' : 'Like'}`;
        const likeImages = LikeManager.getLikeImages(post.likes.users);
        LikeManager.renderLikes(likedByContainer, post.likes.likesCount, likeImages);
      } else {
        alert('Failed to like/unlike post. Please try again.');
      }
    });
  },
};

const CommentManager = {
  renderReply: (reply) => {
    const replyElement = Helpers.createElement('div', ['reply']);
    replyElement.innerHTML = `
      <div class="reply-avatar">
        <img src="${Helpers.processImage(Helpers.safeAccess(reply, ['userId', 'image'], CONFIG.DEFAULT_IMAGE))}" alt="${Helpers.safeAccess(reply, ['userId', 'name'], 'User')}">
      </div>
      <div class="reply-content">
        <p><b>${Helpers.safeAccess(reply, ['userId', 'name'], 'User')}</b> ${reply.content || ''}</p>
        <small class="text-muted">${Helpers.formatDate(reply.createdAt)}</small>
      </div>
    `;
    Helpers.fadeIn(replyElement);
    return replyElement;
  },
  renderReplies: (replies, container, comment, showAll = false) => {
    container.innerHTML = '';
    const safeReplies = Array.isArray(replies) ? replies : [];
    if (!safeReplies.length) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'block';
    const visibleReplies = showAll ? safeReplies : safeReplies.slice(0, CONFIG.VISIBLE_REPLIES);
    visibleReplies.forEach((reply) => container.appendChild(CommentManager.renderReply(reply)));
    if (safeReplies.length > CONFIG.VISIBLE_REPLIES) {
      const toggleLink = Helpers.createElement(
        'a',
        ['replies-toggle-link'],
        showAll ? 'Hide replies' : `Show ${safeReplies.length - CONFIG.VISIBLE_REPLIES} more replies`
      );
      toggleLink.href = '#';
      toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        CommentManager.renderReplies(safeReplies, container, comment, !showAll);
      });
      container.appendChild(toggleLink);
    }
  },
  renderComment: (comment, commentsContainer) => {
    const commentElement = Helpers.createElement('div', ['comment']);
    commentElement.dataset.commentId = comment._id;
    commentElement.innerHTML = `
      <div class="comment-avatar">
        <img src="${Helpers.processImage(Helpers.safeAccess(comment, ['userId', 'image'], CONFIG.DEFAULT_IMAGE))}" alt="${Helpers.safeAccess(comment, ['userId', 'name'], 'User')}">
      </div>
      <div class="comment-content">
        <p><b>${Helpers.safeAccess(comment, ['userId', 'name'], 'User')}</b> ${comment.content || ''}</p>
        <small class="text-muted">${Helpers.formatDate(comment.createdAt)}</small>
        <div class="comment-actions">
          <a href="#" class="reply-link">Reply</a>
          ${comment.replies?.length ? '<a href="#" class="show-replies-link">Show replies</a>' : ''}
        </div>
        <div class="replies-container"></div>
        <div class="reply-input-container" style="display: none;">
          <input type="text" class="reply-input" placeholder="Write a reply...">
          <button class="reply-submit-btn">Submit</button>
        </div>
      </div>
    `;
    Helpers.fadeIn(commentElement);

    const repliesContainer = commentElement.querySelector('.replies-container');
    CommentManager.renderReplies(comment.replies, repliesContainer, comment);

    const replyLink = commentElement.querySelector('.reply-link');
    const replyInputContainer = commentElement.querySelector('.reply-input-container');
    const replyInput = commentElement.querySelector('.reply-input');
    const replySubmitBtn = commentElement.querySelector('.reply-submit-btn');

    replyLink.addEventListener('click', (e) => {
      e.preventDefault();
      replyInputContainer.style.display = 'flex';
      replyInput.focus();
    });

    const showRepliesLink = commentElement.querySelector('.show-replies-link');
    if (showRepliesLink) {
      showRepliesLink.addEventListener('click', (e) => {
        e.preventDefault();
        CommentManager.renderReplies(comment.replies, repliesContainer, comment, true);
      });
    }

    CommentManager.addReplyEvent(replySubmitBtn, replyInput, comment, repliesContainer, commentElement);
    CommentManager.addReplyKeypressEvent(replyInput, replySubmitBtn);

    return commentElement;
  },
  renderComments: (comments, container, visibleCount = CONFIG.VISIBLE_COMMENTS) => {
    container.innerHTML = '';
    const safeComments = Array.isArray(comments) ? comments : [];
    if (!safeComments.length) {
      container.innerHTML = '<p class="text-muted no-comments">No comments yet.</p>';
      return;
    }
    const visibleComments = safeComments.slice(0, visibleCount);
    visibleComments.forEach((comment) => container.appendChild(CommentManager.renderComment(comment, container)));
    if (safeComments.length > visibleCount) {
      const viewAllLink = Helpers.createElement('a', ['view-all-comments'], `View all ${safeComments.length} comments`);
      viewAllLink.href = '#';
      viewAllLink.addEventListener('click', (e) => {
        e.preventDefault();
        CommentManager.renderComments(safeComments, container, visibleCount + 3);
      });
      container.appendChild(viewAllLink);
    }
  },
  addCommentEvent: (button, input, postId, commentsContainer) => {
    button.addEventListener('click', async () => {
      const content = input.value.trim();
      if (content) {
        const newComment = await API.createComment(postId, content);
        if (newComment) {
          const noComments = commentsContainer.querySelector('.no-comments');
          if (noComments) noComments.remove();
          const comments = await API.fetchComments(postId);
          CommentManager.renderComments(comments, commentsContainer);
          input.value = '';
        } else {
          alert('Failed to post comment. Please try again.');
        }
      }
    });
  },
  addCommentKeypressEvent: (input, button) => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        button.click();
      }
    });
  },
  addReplyEvent: (button, input, comment, repliesContainer, commentElement) => {
    button.addEventListener('click', async () => {
      const content = input.value.trim();
      if (content) {
        const newReply = await API.createReply(comment._id, content);
        if (newReply) {
          comment.replies = comment.replies || [];
          comment.replies.unshift(newReply);
          CommentManager.renderReplies(comment.replies, repliesContainer, comment);
          input.value = '';
          input.parentElement.style.display = 'none';
          const commentActions = commentElement.querySelector('.comment-actions');
          if (!commentActions.querySelector('.show-replies-link')) {
            const showRepliesLink = Helpers.createElement('a', ['show-replies-link'], 'Show replies');
            showRepliesLink.href = '#';
            showRepliesLink.addEventListener('click', (e) => {
              e.preventDefault();
              CommentManager.renderReplies(comment.replies, repliesContainer, comment, true);
            });
            commentActions.appendChild(showRepliesLink);
          }
        }
      }
    });
  },
  addReplyKeypressEvent: (input, button) => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') button.click();
    });
  },
};


const PostManager = {
  renderPost: (post, feedsContainer, currentUserId) => {
    const feedElement = Helpers.createElement('div', ['feed']);
    feedElement.dataset.postId = post._id;

    const isLiked = currentUserId && Helpers.safeAccess(post, ['likes', 'users'], []).some((user) => user._id === currentUserId);
    const likeImages = LikeManager.getLikeImages(Helpers.safeAccess(post, ['likes', 'users'], []));
    const image = Helpers.processImage(post.user.image) || CONFIG.DEFAULT_IMAGE;
    console.log('Rendering post:', {
      postId: post._id,
      createdAt: post.createdAt,
      author: post.authorname,
      content: post.content
    });

    feedElement.innerHTML = `
      <div class="head">
        <div class="user">
          <div class="profile-photo">
            <a href="/profile/${post.user._id}">
              <img src="${image}" alt="${post.authorname || 'User'}" />
            </a>
          </div>
          <div class="info">
            <a href="/profile/${post.user._id}">
              <h3>${post.authorname || 'User'}</h3>
              <small>${Helpers.formatDate(post.createdAt)}</small>
            </a>
          </div>
        </div>
        <span class="edit"><i class="uil uil-ellipsis-h"></i></span>
      </div>
      ${post.image ? `<div class="photo"><img src="${Helpers.processImage(post.image)}" alt="Post Image" style="max-width: 100%; border-radius: 8px;" /></div>` : ''}
            <div class="caption">
        <p><b> </b> ${post.content || ''} <br> <span class="harsh-tag">#lifestyle</span></p>
      </div>
      <div class="liked-by"></div>

      <div class="action-buttons-below">
        <div class="interaction-button like-button ${isLiked ? 'liked' : ''}">
          <span><i class="uil uil-heart"></i> ${isLiked ? 'Unlike' : 'Like'}</span>
        </div>
        <div class="interaction-button comment-button">
          <span><i class="uil uil-comment-dots"></i> Comment</span>
        </div>
        <div class="interaction-button">
          <span><i class="uil uil-share-alt"></i> Share</span>
        </div>
      </div>
      <div class="comments-container"></div>
      <div class="comment-input-container">
        <input type="text" class="comment-input" placeholder="Write a comment...">
        <button class="comment-submit-btn">Submit</button>
      </div>
    `;

    feedsContainer.prepend(feedElement);

    const likedByContainer = feedElement.querySelector('.liked-by');
    LikeManager.renderLikes(likedByContainer, Helpers.safeAccess(post, ['likes', 'likesCount'], 0), likeImages);

    const likeButton = feedElement.querySelector('.like-button');
    LikeManager.addLikeEvent(likeButton, post, currentUserId, likedByContainer);

    const commentsContainer = feedElement.querySelector('.comments-container');
    API.fetchComments(post._id).then((comments) => {
      CommentManager.renderComments(comments, commentsContainer);
    });

    const commentButton = feedElement.querySelector('.comment-button');
    const commentInput = feedElement.querySelector('.comment-input');
    commentButton.addEventListener('click', (e) => {
      e.preventDefault();
      commentInput.focus();
    });

    const commentSubmitBtn = feedElement.querySelector('.comment-submit-btn');
    CommentManager.addCommentEvent(commentSubmitBtn, commentInput, post._id, commentsContainer);
    CommentManager.addCommentKeypressEvent(commentInput, commentSubmitBtn);
  },

  renderPosts: (posts, feedsContainer, currentUserId) => {
    console.log('Rendering posts:', posts.map(p => ({
      postId: p._id,
      createdAt: p.createdAt,
      author: p.authorname,
      content: p.content
    })));

    if (!Array.isArray(posts) || !posts.length) {
      feedsContainer.innerHTML = '<div class="card mt-2 p-3">No posts to show</div>';
      return;
    }

    const isSorted = posts.every((post, index, arr) =>
      index === 0 || new Date(post.createdAt) <= new Date(arr[index - 1].createdAt)
    );
    console.log('Are posts sorted (newest first)?', isSorted);

    feedsContainer.innerHTML = '';
    posts.forEach((post) => PostManager.renderPost(post, feedsContainer, currentUserId));
  },
};


const CreatePostManager = {
  init: (currentUserId, CurrentUserName, CurrentUserImage) => {
    const form = document.getElementById('create-post-form');
    const contentInput = document.getElementById('post-content');
    const imageInput = document.getElementById('post-image-input');
    const imagePreview = document.getElementById('post-image-preview');
    const imageContainer = document.getElementById('post-image-container');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const submitBtn = document.getElementById('post-submit-btn');
    const feedsContainer = document.querySelector('.feeds');

    if (!form || !contentInput || !imageInput || !imagePreview || !imageContainer || !removeImageBtn || !submitBtn || !feedsContainer) {
      console.error('Create post form elements missing:', {
        form: !!form,
        contentInput: !!contentInput,
        imageInput: !!imageInput,
        imagePreview: !!imagePreview,
        imageContainer: !!imageContainer,
        removeImageBtn: !!removeImageBtn,
        submitBtn: !!submitBtn,
        feedsContainer: !!feedsContainer,
      });
      return;
    }

    // تحديث placeholder
    if (CurrentUserName && contentInput) {
      contentInput.placeholder = `What's on your mind, ${CurrentUserName}?`;
      console.log('Post content placeholder updated:', contentInput.placeholder);
    }

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imagePreview.src = event.target.result;
          imageContainer.style.display = 'block';
          console.log('Post image preview updated:', event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        console.log('No valid image selected for post');
        imageContainer.style.display = 'none';
      }
    });

    removeImageBtn.addEventListener('click', () => {
      imageInput.value = '';
      imagePreview.src = '';
      imageContainer.style.display = 'none';
      console.log('Post image removed');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = contentInput.value.trim();
      const imageFile = imageInput.files[0];

      if (!content && !imageFile) {
        alert('Please add content or an image to post.');
        return;
      }

      if (!currentUserId) {
        alert('Please log in to create a post.');
        return;
      }

      try {
        const newPost = await API.createPost(content, imageFile);
        if (newPost) {
          console.log('New post created:', newPost);
          const postData = {
            _id: newPost._id,
            user: {
              _id: currentUserId,
              image: Helpers.processImage(CurrentUserImage) || CONFIG.DEFAULT_IMAGE,
            },
            authorname: CurrentUserName || 'User',
            content: newPost.content || '',
            image: newPost.image || null,
            createdAt: newPost.createdAt || new Date().toISOString(),
            likes: { likesCount: 0, users: [] },
          };
          PostManager.renderPost(postData, feedsContainer, currentUserId);
          Helpers.fadeIn(feedsContainer.firstChild);
          contentInput.value = '';
          imageInput.value = '';
          imagePreview.src = '';
          imageContainer.style.display = 'none';
        } else {
          console.log('Failed to create post');
        }
      } catch (error) {
        console.error('Error creating post:', error.message);
        alert(`Failed to create post: ${error.message}`);
      }
    });
  },
};

document.addEventListener('DOMContentLoaded', async () => {
  const feedsContainer = document.querySelector('.feeds');
  if (!feedsContainer) {
    console.error('Feeds container not found!');
    return;
  }

  const currentUserId = document.getElementById('currentUserId')?.value || null;
  console.log('Current user ID:', currentUserId);

  let userData = null;
  let CurrentUserName = 'User';
  let CurrentUserImage = CONFIG.DEFAULT_IMAGE;

  // جلب بيانات اليوزر
  if (currentUserId) {
    userData = await API.fetchUser(currentUserId);
    if (userData) {
      CurrentUserName = userData.name || 'User';
      CurrentUserImage = Helpers.processImage(userData.image) || CONFIG.DEFAULT_IMAGE;
      // console.log('User data loaded:', {
      //   id: userData._id,
      //   name: CurrentUserName,
      //   image: CurrentUserImage,
      // });
    } else {
      console.error('Failed to fetch user data, using defaults');
      feedsContainer.innerHTML = '<div class="card mt-2 p-3">Failed to load user data. Please try again.</div>';
      return;
    }
  } else {
    console.log('No currentUserId, user might not be logged in');
    feedsContainer.innerHTML = '<div class="card mt-2 p-3">Please log in to view content.</div>';
    return;
  }

  const navbarImage = document.getElementById('navbarUserImage');
  const HomeImage = document.getElementById('HomeImage');
  const HomeImagetwo = document.getElementById('HomeImagetwo');
  const UserName = document.getElementById('UserName');
  const tag = document.getElementById('tag');

  if (CurrentUserImage && navbarImage) {
    navbarImage.src = CurrentUserImage;
    console.log('Navbar image updated:', navbarImage.src);
  } else {
    console.warn('Navbar image not updated:', { CurrentUserImage, navbarImage: !!navbarImage });
  }
  if (CurrentUserImage && HomeImage) {
    HomeImage.src = CurrentUserImage;
    console.log('Home image updated:', HomeImage.src);
  } else {
    console.warn('Home image not updated:', { CurrentUserImage, HomeImage: !!HomeImage });
  }
  if (CurrentUserImage && HomeImagetwo) {
    HomeImagetwo.src = CurrentUserImage;
    console.log('Home image two updated:', HomeImagetwo.src);
  } else {
    console.warn('Home image two not updated:', { CurrentUserImage, HomeImagetwo: !!HomeImagetwo });
  }
  if (CurrentUserName && UserName) {
    UserName.textContent = CurrentUserName;
    console.log('User name updated:', UserName.textContent);
  } else {
    console.warn('User name not updated:', { CurrentUserName, UserName: !!UserName });
  }
  if (CurrentUserName && tag) {
    tag.textContent = `@${CurrentUserName}`;
    console.log('Tag updated:', tag.textContent);
  } else {
    console.warn('Tag not updated:', { CurrentUserName, tag: !!tag });
  }

  const timeLinePosts = await API.fetchTimelinePosts();
  PostManager.renderPosts(timeLinePosts, feedsContainer, currentUserId);

  CreatePostManager.init(currentUserId, CurrentUserName, CurrentUserImage);
});

