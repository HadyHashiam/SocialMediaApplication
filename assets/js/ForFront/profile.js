
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    USER: '/users/:id',
    POSTS: '/users/:userId/posts',
    COMMENTS: '/comment',
    POST_COMMENTS: '/comment/post',
    REPLIES: '/comment/post/reply',
    LIKE_POST: '/posts/like',
    CREATE_POST: '/posts',
    PROFILE_PICTURE: '/users/profilePicture',
    COVER_PICTURE: '/users/coverPicture',
    FRIEND_REQUESTS: '/friend/friendRequests/:userId',
    FRIENDS: '/friend/user/:userId',
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
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Raw user response:', result);
      if (result.data) {
        console.log('Fetched user data:', result.data);
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
  fetchFriends: async (userId) => {
    try {
      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.FRIENDS.replace(':userId', userId)}`;
      console.log('Fetching friends from:', url);
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Raw friends response:', result);
      if (result.status === 'success' && Array.isArray(result.data)) {
        console.log('Fetched friends:', result.data);
        return result.data;
      } else {
        console.warn('No friends found in response:', result);
        return [];
      }
    } catch (error) {
      console.error('Error fetching friends:', userId, error);
      return [];
    }
  },
  fetchPosts: async (userId) => {
    try {
      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POSTS.replace(':userId', userId)}`;
      console.log('Fetching posts from:', url);
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Raw posts response:', result);
      if (result.status === 'success' && Array.isArray(result.data)) {
        console.log('Fetched posts:', result.data);
        return result.data;
      } else {
        console.warn('No posts found in response:', result);
        return [];
      }
    } catch (error) {
      console.error('Error fetching posts:', userId, error);
      return [];
    }
  },
  fetchComments: async (postId) => {
    try {
      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POST_COMMENTS}/${postId}`;
      console.log('Fetching comments from:', url);
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.COMMENTS}`;
      console.log('Creating comment at:', url, 'with data:', { postId, content });
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Created comment for post', postId, ':', result);
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.error('Error creating comment for post', postId, ':', error.message);
      return null;
    }
  },
  createReply: async (commentId, content) => {
    try {
      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.REPLIES}`;
      console.log('Creating reply at:', url, 'with data:', { commentId, content });
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, content }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Created reply for comment', commentId, ':', result);
      return result.status === 'success' ? result.data.reply : null;
    } catch (error) {
      console.error('Error creating reply for comment', commentId, ':', error.message);
      return null;
    }
  },
  likePost: async (postId) => {
    try {
      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.LIKE_POST}`;
      console.log('Liking post at:', url, 'with postId:', postId);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Like action for post', postId, ':', result);
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.error('Error liking post', postId, ':', error.message);
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

      const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CREATE_POST}`;
      console.log('Creating post at:', url);
      const response = await fetch(url, {
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
  console.log('Accepting friend with ID:', id);
  await sendFriendAction('/friend/accept', { friendId: id }, 'Friend accepted');
}

async function rejectFriendRequest(id) {
  console.log('Rejecting friend with ID:', id);
  await sendFriendAction('/friend/reject', { friendId: id }, 'Friend rejected');
}

async function sendFriendRequest(id) {
  console.log('Sending friend request for ID:', id);
  await sendFriendAction('/friend/sentrequest', { friendId: id, currentUserId: document.getElementById('currentUserId')?.value }, 'Friend request sent');
}

async function cancelFriendRequest(id) {
  console.log('Cancelling friend request for ID:', id);
  await sendFriendAction('/friend/cancel', { friendId: id }, 'Friend request cancelled');
}

async function deleteFriend(id) {
  console.log('Deleting friend with ID:', id);
  await sendFriendAction('/friend/delete', { friendId: id }, 'Friend deleted');
}

async function sendFriendAction(url, data, successMessage) {
  try {
    const fullUrl = `${CONFIG.API_BASE_URL}${url}`;
    console.log('Sending friend action to:', fullUrl, 'with data:', data);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(successMessage, result);

    if (url === '/friend/sentrequest') {
      const currentUserData = await API.fetchUser(data.currentUserId);
      const paramUserData = await API.fetchUser(data.friendId);
      console.log('Emitting socket event for friend request:', {
        currentUserId: data.currentUserId,
        CurrentUserName: currentUserData?.name,
        ParamUserId: data.friendId,
        CurrentUserImage: Helpers.processImage(currentUserData?.image),
        ParamUserName: paramUserData?.name,
      });
      socket.emit('sendFriendRequest', {
        currentUserId: data.currentUserId,
        CurrentUserName: currentUserData?.name || 'User',
        ParamUserId: data.friendId,
        CurrentUserImage: Helpers.processImage(currentUserData?.image) || CONFIG.DEFAULT_IMAGE,
        ParamUserName: paramUserData?.name || 'User',
      });
    }

    location.reload();
  } catch (error) {
    console.error('Error in sendFriendAction:', error.message);
    alert('Failed to perform friend action. Please try again.');
  }
}

const LikeManager = {
  getLikeImages: (users) => {
    const safeUsers = Array.isArray(users) ? users : [];
    console.log('Like users:', safeUsers.map(user => ({
      _id: user._id,
      name: user.name,
      image: user.image,
    })));
    return safeUsers.slice(0, 3).map(user => ({
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
      ${likeImages.map(img => `<span><img src="${img.image}" alt="${img.name}" /></span>`).join('')}
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
      try {
        const updatedPost = await API.likePost(post._id);
        if (updatedPost) {
          console.log('Updated post likes:', updatedPost.likes?.users?.map(user => ({
            _id: user._id,
            name: user.name,
            image: user.image,
          })));
          post.likes = updatedPost.likes || { likesCount: 0, users: [] };
          const isNowLiked = Helpers.safeAccess(post, ['likes', 'users'], []).some(user => user._id === currentUserId);
          button.classList.toggle('liked', isNowLiked);
          button.querySelector('span').innerHTML = `<i class="uil uil-heart"></i> ${isNowLiked ? 'Unlike' : 'Like'}`;
          const likeImages = LikeManager.getLikeImages(post.likes.users);
          LikeManager.renderLikes(likedByContainer, post.likes.likesCount, likeImages);
        } else {
          alert('Failed to like/unlike post. Please try again.');
        }
      } catch (error) {
        console.error('Error liking post:', error.message);
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
    visibleReplies.forEach(reply => container.appendChild(CommentManager.renderReply(reply)));
    if (safeReplies.length > CONFIG.VISIBLE_REPLIES) {
      const toggleLink = Helpers.createElement('a', ['replies-toggle-link'], showAll ? 'Hide replies' : `Show ${safeReplies.length - CONFIG.VISIBLE_REPLIES} more replies`);
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
    visibleComments.forEach(comment => container.appendChild(CommentManager.renderComment(comment, container)));
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
        try {
          console.log('Attempting to create comment with content:', content);
          const newComment = await API.createComment(postId, content);
          console.log('New comment:', newComment);
          if (newComment) {
            const noComments = commentsContainer.querySelector('.no-comments');
            if (noComments) noComments.remove();
            const comments = await API.fetchComments(postId);
            CommentManager.renderComments(comments, commentsContainer);
            input.value = '';
          } else {
            alert('Failed to post comment. Please try again.');
          }
        } catch (error) {
          console.error('Error creating comment:', error.message);
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
        try {
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
          } else {
            alert('Failed to post reply. Please try again.');
          }
        } catch (error) {
          console.error('Error creating reply:', error.message);
          alert('Failed to post reply. Please try again.');
        }
      }
    });
  },
  addReplyKeypressEvent: (input, button) => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        button.click();
      }
    });
  },
};

const FriendManager = {
  determineFriendStatus: (currentUser, paramUser, friends) => {
    if (!currentUser || !paramUser) return 'none';
    if (currentUser._id === paramUser._id) return 'owner';
    if (friends?.some(f => f.id === paramUser._id)) return 'friends';
    if (currentUser.sentRequests?.some(r => r.id === paramUser._id)) return 'requestSent';
    if (paramUser.friendRequests?.some(r => r.id === currentUser._id)) return 'requestReceived';
    return 'none';
  },
  renderFriendActions: (friendStatus, container, paramUserId, currentUserId) => {
    console.log('Rendering friend actions for status:', friendStatus);
    const form = Helpers.createElement('form', [], '');
    form.method = 'POST';
    form.id = 'friends-form';

    switch (friendStatus) {
      case 'friends':
        form.innerHTML = `
          <button type="button" id="deleteBtn" class="btn btn-danger">Delete Friend</button>
        `;
        setTimeout(() => {
          const deleteBtn = document.getElementById('deleteBtn');
          if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteFriend(paramUserId));
            console.log('Delete friend button initialized');
          }
        }, 0);
        break;
      case 'requestSent':
        form.innerHTML = `
          <button type="button" id="cancelBtn" class="btn btn-danger">Cancel Request</button>
        `;
        setTimeout(() => {
          const cancelBtn = document.getElementById('cancelBtn');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', () => cancelFriendRequest(paramUserId));
            console.log('Cancel request button initialized');
          }
        }, 0);
        break;
      case 'requestReceived':
        form.innerHTML = `
          <button type="button" id="acceptBtn" class="btn btn-success">Accept Friend Request</button>
          <button type="button" id="rejectBtn" class="btn btn-danger">Reject</button>
        `;
        setTimeout(() => {
          const acceptBtn = document.getElementById('acceptBtn');
          const rejectBtn = document.getElementById('rejectBtn');
          if (acceptBtn) {
            acceptBtn.addEventListener('click', () => acceptFriendRequest(paramUserId));
            console.log('Accept friend button initialized');
          }
          if (rejectBtn) {
            rejectBtn.addEventListener('click', () => rejectFriendRequest(paramUserId));
            console.log('Reject friend button initialized');
          }
        }, 0);
        break;
      case 'owner':
        console.log('User is owner, no friend action buttons needed');
        return;
      case 'none':
      default:
        form.innerHTML = `
          <button type="button" id="addBtn" class="btn btn-primary">Add Friend</button>
        `;
        setTimeout(() => {
          const addBtn = document.getElementById('addBtn');
          if (addBtn) {
            addBtn.addEventListener('click', () => sendFriendRequest(paramUserId));
            console.log('Add friend button initialized');
          }
        }, 0);
        break;
    }

    container.innerHTML = '';
    container.appendChild(form);
    console.log('Friend action form appended with status:', friendStatus);
  },
};

const PostManager = {
  renderPost: (post, feedsContainer, currentUserId) => {
    const feedElement = Helpers.createElement('div', ['feed']);
    feedElement.dataset.postId = post._id;

    const isLiked = currentUserId && Helpers.safeAccess(post, ['likes', 'users'], []).some(user => user._id === currentUserId);
    const likeImages = LikeManager.getLikeImages(Helpers.safeAccess(post, ['likes', 'users'], []));
    const processedAuthorImage = Helpers.processImage(Helpers.safeAccess(post, ['user', 'image']));
    const processedPostImage = Helpers.processImage(post.image);

    console.log('Processed post images:', {
      postId: post._id,
      userImage: processedAuthorImage,
      postImage: processedPostImage,
    });

    const postImageHTML = post.image ? `
      <div class="photo">
Zakaria        <img src="${processedPostImage}" alt="Post Image"/>
      </div>
    ` : '';

    feedElement.innerHTML = `
      <div class="head">
        <div class="user">
          <div class="profile-photo">
            <a href="/profile/${Helpers.safeAccess(post, ['user', '_id'], '')}">
              <img src="${processedAuthorImage || CONFIG.DEFAULT_IMAGE}" alt="${post.authorname || 'User'}" />
            </a>
          </div>
          <div class="info">
            <a href="/profile/${Helpers.safeAccess(post, ['user', '_id'], '')}">
              <h3>${post.authorname || 'User'}</h3>
              <small>${Helpers.formatDate(post.createdAt)}</small>
            </a>
          </div>
        </div>
        <span class="edit"><i class="uil uil-ellipsis-h"></i></span>
      </div>
      ${postImageHTML}
      <div class="caption">
        <p><b> </b> ${post.content || ''}</p>
      </div>
      <div class="liked-by"></div>
      <div class="action-buttons">
        <div class="buttonss">
          <div class="interaction-button like-button ${isLiked ? 'liked' : ''}">
            <span><i class="uil uil-heart"></i> ${isLiked ? 'Unlike' : 'Like'}</span>
          </div>
        </div>
        <div class="buttonss">
          <div class="interaction-button comment-button">
            <span><i class="uil uil-comment-dots"></i> Comment</span>
          </div>
        </div>
        <div class="buttonss">
          <div class="interaction-button">
            <span><i class="uil uil-share-alt"></i> Share</span>
          </div>
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
    API.fetchComments(post._id).then(comments => {
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
    console.log('Rendering posts:', posts);
    if (!Array.isArray(posts) || !posts.length) {
      feedsContainer.innerHTML = '<div class="card mt-2 p-3">No posts to show</div>';
      return;
    }
    feedsContainer.innerHTML = '';
    posts.forEach(post => PostManager.renderPost(post, feedsContainer, currentUserId));
  },
};

const CreatePostManager = {
  init: (currentUserId, currentUserName, currentUserImage, isOwner) => {
    if (!isOwner) {
      console.log('CreatePostManager not initialized: User is not the profile owner');
      return;
    }

    const form = document.getElementById('create-post-form');
    const contentInput = document.getElementById('post-content');
    const imageInput = document.getElementById('post-image-input');
    const imagePreview = document.getElementById('post-image-preview');
    const imageContainer = document.getElementById('post-image-container');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const submitBtn = document.getElementById('post-submit-btn');
    const feedsContainer = document.getElementById('feedsContainer');

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

    if (currentUserName && contentInput) {
      contentInput.placeholder = `What's on your mind, ${currentUserName}?`;
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
              image: Helpers.processImage(currentUserImage) || CONFIG.DEFAULT_IMAGE,
            },
            authorname: currentUserName || 'User',
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
          console.error('Failed to create post: No data returned');
          alert('Failed to create post. Please try again.');
        }
      } catch (error) {
        console.error('Error creating post:', error.message);
        alert(`Failed to create post: ${error.message}`);
      }
    });
  },
};

const ProfileImageManager = {
  init: (paramUserData, isOwner) => {
    console.log('ProfileImageManager.init started');

    try {
      const profileCard = document.querySelector('.card[data-owner]');
      const coverContainer = document.querySelector('.social-wallpaper[data-owner]');

      if (!profileCard) console.error('Profile card not found! Check .card[data-owner]');
      if (!coverContainer) console.error('Cover container not found! Check .social-wallpaper[data-owner]');

      const profileImage = document.getElementById('ProfileImage');
      if (profileImage && paramUserData?.image) {
        profileImage.src = Helpers.processImage(paramUserData.image);
        console.log('Updated profileImage.src:', profileImage.src);
      }

      const coverImage = coverContainer;
      if (coverImage && paramUserData?.coverImage) {
        coverImage.style.background = `url(${Helpers.processImage(paramUserData.coverImage)}) no-repeat center/cover`;
        console.log('Updated coverImage.style.background:', coverImage.style.background);
      }

      if (!isOwner) {
        const profileHvr = profileCard?.querySelector('.profile-hvr');
        const coverHvr = coverContainer?.querySelector('.profile-hvr');
        if (profileHvr) {
          profileHvr.style.display = 'none';
          console.log('Hid profile-hvr for non-owner');
        }
        if (coverHvr) {
          coverHvr.style.display = 'none';
          console.log('Hid cover-hvr for non-owner');
        }
        return;
      }

      const profileImageInput = document.getElementById('profileImageInput');
      const profileEditContainer = profileCard?.querySelector('.profile-hvr');
      const profileSaveBtn = profileCard?.querySelector('.profile-save');
      const profileCancelBtn = profileCard?.querySelector('.profile-cancel');
      const profileActions = profileCard?.querySelector('.profile-actions');

      const coverImageInput = document.getElementById('coverImageInput');
      const coverEditContainer = coverContainer?.querySelector('.profile-hvr');
      const coverSaveBtn = coverContainer?.querySelector('.cover-save');
      const coverCancelBtn = coverContainer?.querySelector('.cover-cancel');
      const coverActions = coverContainer?.querySelector('.cover-actions');

      console.log('Profile elements:', {
        profileImage: !!profileImage,
        profileImageInput: !!profileImageInput,
        profileEditContainer: !!profileEditContainer,
        profileSaveBtn: !!profileSaveBtn,
        profileCancelBtn: !!profileCancelBtn,
        profileActions: !!profileActions,
      });

      console.log('Cover elements:', {
        coverImage: !!coverImage,
        coverImageInput: !!coverImageInput,
        coverEditContainer: !!coverEditContainer,
        coverSaveBtn: !!coverSaveBtn,
        coverCancelBtn: !!coverCancelBtn,
        coverActions: !!coverActions,
      });

      let originalProfileSrc = paramUserData?.image ? Helpers.processImage(paramUserData.image) : CONFIG.DEFAULT_IMAGE;
      let originalCoverStyle = paramUserData?.coverImage ? `url(${Helpers.processImage(paramUserData.coverImage)}) no-repeat center/cover` : `url(${CONFIG.DEFAULT_IMAGE}) no-repeat center/cover`;

      if (profileEditContainer && profileImageInput && profileImage && profileActions) {
        console.log('Profile image event listeners added');
        profileEditContainer.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Profile edit container clicked');
          profileImageInput.click();
        });

        profileImageInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
              profileImage.src = event.target.result;
              profileActions.style.display = 'flex';
              console.log('Profile image preview updated:', event.target.result);
            };
            reader.readAsDataURL(file);
          } else {
            console.log('No valid image selected for profile');
          }
        });

        profileSaveBtn?.addEventListener('click', async () => {
          console.log('Profile image save clicked');
          if (!profileImageInput.files[0]) {
            console.log('No profile image selected for upload');
            profileActions.style.display = 'none';
            return;
          }

          try {
            const formData = new FormData();
            formData.append('image', profileImageInput.files[0]);
            formData.append('imageType', 'profile');

            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.PROFILE_PICTURE}`, {
              method: 'POST',
              body: formData,
              credentials: 'include',
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to upload profile image');

            console.log('Profile image uploaded:', result);
            profileImage.src = Helpers.processImage(result.data.image);
            originalProfileSrc = profileImage.src;
            profileActions.style.display = 'none';
            profileImageInput.value = '';
          } catch (error) {
            console.error('Error uploading profile image:', error.message);
            alert('Failed to upload profile image. Please try again.');
          }
        });

        profileCancelBtn?.addEventListener('click', () => {
          profileImage.src = originalProfileSrc;
          profileActions.style.display = 'none';
          profileImageInput.value = '';
          console.log('Profile image change cancelled');
        });
      } else {
        console.error('Profile image setup failed: Missing elements');
      }

      if (coverEditContainer && coverImageInput && coverImage && coverActions) {
        console.log('Cover image event listeners added');
        coverEditContainer.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Cover edit container clicked');
          if (!e.target.classList.contains('cover-delete')) {
            coverImageInput.click();
          }
        });

        coverImageInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
              coverImage.style.background = `url(${event.target.result}) no-repeat center/cover`;
              coverActions.style.display = 'flex';
              console.log('Cover image preview updated:', event.target.result);
            };
            reader.readAsDataURL(file);
          } else {
            console.log('No valid image selected for cover');
          }
        });

        coverSaveBtn?.addEventListener('click', async () => {
          console.log('Cover image save clicked');
          if (!coverImageInput.files[0]) {
            console.log('No cover image selected for upload');
            coverActions.style.display = 'none';
            return;
          }

          try {
            const formData = new FormData();
            formData.append('image', coverImageInput.files[0]);
            formData.append('imageType', 'cover');

            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.COVER_PICTURE}`, {
              method: 'POST',
              body: formData,
              credentials: 'include',
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to upload cover image');

            console.log('Cover image uploaded:', result);
            coverImage.style.background = `url(${Helpers.processImage(result.data.coverImage)}) no-repeat center/cover`;
            originalCoverStyle = coverImage.style.background;
            coverActions.style.display = 'none';
            coverImageInput.value = '';
          } catch (error) {
            console.error('Error uploading cover image:', error.message);
            alert('Failed to upload cover image. Please try again.');
          }
        });

        coverCancelBtn?.addEventListener('click', () => {
          coverImage.style.background = originalCoverStyle;
          coverActions.style.display = 'none';
          coverImageInput.value = '';
          console.log('Cover image change cancelled');
        });
      } else {
        console.error('Cover image setup failed: Missing elements');
      }
    } catch (error) {
      console.error('Error in ProfileImageManager.init:', error);
    }
  },
};

document.addEventListener('DOMContentLoaded', async () => {
  const ParamUserId = document.getElementById('paramUserId')?.value;
  const currentUserId = document.getElementById('currentUserId')?.value || null;
  const feedsContainer = document.getElementById('feedsContainer');
  const friendsContainer = document.getElementById('FriendsContainer');
  const friendRequestsList = document.getElementById('friendRequestsList');
  const friendActionContainer = document.getElementById('friendActionContainer');

  if (feedsContainer) {
    feedsContainer.innerHTML = '<div class="spinner">Loading...</div>';
  }

  try {
    if (!ParamUserId) {
      console.error('ParamUserId not found!');
      if (feedsContainer) {
        feedsContainer.innerHTML = '<div class="card mt-2 p-3">Invalid user profile</div>';
      }
      return;
    }

    if (!feedsContainer) {
      console.error('Feeds container not found! Check if #feedsContainer exists in HTML.');
      return;
    }
    if (!friendsContainer) {
      console.error('Friends container not found! Check if #FriendsContainer exists in HTML.');
    }
    if (!friendRequestsList) {
      console.error('Friend requests list not found! Check if #friendRequestsList exists in HTML.');
    }
    if (!friendActionContainer) {
      console.error('Friend action container not found! Check if #friendActionContainer exists in HTML.');
    }

    let currentUserData = null;
    if (currentUserId) {
      currentUserData = await API.fetchUser(currentUserId);
      if (!currentUserData) {
        console.error('Failed to fetch current user data');
        if (feedsContainer) {
          feedsContainer.innerHTML = '<div class="card mt-2 p-3">Failed to load user data. Please try again.</div>';
        }
        return;
      }
      console.log('Current user data:', {
        id: currentUserData._id,
        name: currentUserData.name,
        image: currentUserData.image,
      });
    } else {
      console.log('No currentUserId, user might not be logged in');
    }

    const paramUserData = await API.fetchUser(ParamUserId);
    if (!paramUserData) {
      console.error('Failed to fetch param user data');
      if (feedsContainer) {
        feedsContainer.innerHTML = '<div class="card mt-2 p-3">Failed to load profile data. Please try again.</div>';
      }
      return;
    }
    console.log('Param user data:', {
      id: paramUserData._id,
      name: paramUserData.name,
      image: paramUserData.image,
      coverImage: paramUserData.coverImage,
    });

    const isOwner = currentUserId === ParamUserId;

    const navbarImage = document.getElementById('navbarUserImage');
    const homeImageTwo = document.getElementById('HomeImagetwo');
    if (currentUserData?.image && navbarImage) {
      navbarImage.src = Helpers.processImage(currentUserData.image);
      console.log('Navbar image updated:', navbarImage.src);
    }
    if (currentUserData?.image && homeImageTwo) {
      homeImageTwo.src = Helpers.processImage(currentUserData.image);
      console.log('HomeImagetwo updated:', homeImageTwo.src);
    }

    const userName = document.getElementById('UserName');
    if (paramUserData.name && userName) {
      userName.textContent = paramUserData.name;
      console.log('User name updated:', paramUserData.name);
    }

    const postContent = document.getElementById('post-content');
    if (isOwner && currentUserData?.name && postContent) {
      postContent.placeholder = `What's on your mind, ${currentUserData.name}?`;
      console.log('Post content placeholder updated:', postContent.placeholder);
    }

    const timelineBtnDiv = document.querySelector('.timeline-btn');
    const chatIdInput = document.getElementById('chatId')?.value;

    if (timelineBtnDiv) {
      if (isOwner) {
        timelineBtnDiv.style.display = 'none';
        console.log('Timeline buttons hidden for owner');
      } else {
        const chatButton = timelineBtnDiv.querySelector('.btn-success');
        if (chatButton && chatIdInput) {
          chatButton.href = `/chatPage/${chatIdInput}`;
          console.log('Chat button updated directly from hidden input:', chatButton.href);
        } else {
          console.log('Chat button or chatId not found.');
        }
      }
    }


    ProfileImageManager.init(paramUserData, isOwner);

    if (currentUserData) {
      CreatePostManager.init(currentUserId, currentUserData.name, currentUserData.image, isOwner);
    }

    const posts = await API.fetchPosts(ParamUserId);
    PostManager.renderPosts(posts, feedsContainer, currentUserId);

    if (friendsContainer) {
      const friends = await API.fetchFriends(ParamUserId);
      if (friends.length > 0) {
        friends.forEach(friend => {
          const friendLink = Helpers.createElement('a', [], '');
          friendLink.href = `/profile/${friend.id}`;
          friendLink.title = friend.name;
          const friendImg = Helpers.createElement('img', ['media-object', 'img-radius']);
          friendImg.src = Helpers.processImage(friend.image);
          friendImg.alt = friend.name;
          friendLink.appendChild(friendImg);
          friendsContainer.appendChild(friendLink);
          console.log('Friend added:', friend.name, 'Image:', friendImg.src);
        });
      } else {
        friendsContainer.innerHTML = '<div class="text-muted p-2">No friends to show</div>';
        console.log('No friends found for user:', ParamUserId);
      }
    }

    if (currentUserId && friendRequestsList) {
      try {
        const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.FRIEND_REQUESTS.replace(':userId', currentUserId)}`;
        console.log('Fetching friend requests from:', url);
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
          friendRequestsList.innerHTML = `<input id="currentUserId" type="hidden" name="currentUserId" value="${currentUserId}">`;
          data.data.forEach(friend => {
            const friendElement = Helpers.createElement('div', ['friend-request']);
            friendElement.innerHTML = `
              <div class="friend-request-item" style="display: flex; align-items: center; gap: 10px; padding: 5px 0;">
                <a href="/profile/${friend.id}">
                  <img src="${Helpers.processImage(friend.image)}" alt="${friend.name}" style="width: 40px; height: 40px; border-radius: 50%;">
                </a>
                <a href="/profile/${friend.id}" style="flex-grow: 1; text-decoration: none; color: inherit;">
                  <span>${friend.name}</span>
                </a>
                <button class="btn btn-sm btn-success" onclick="acceptFriendRequest('${friend.id}')">Accept</button>
                <button class="btn btn-sm btn-danger" onclick="rejectFriendRequest('${friend.id}')">Reject</button>
              </div>
            `;
            friendRequestsList.appendChild(friendElement);
            console.log('Friend request added:', friend.name, 'Image:', friend.image);
          });
        } else {
          friendRequestsList.innerHTML = '<div id="no-friend-request" class="text-muted p-2">No friend requests</div>';
          console.log('No friend requests found for user:', currentUserId);
        }
      } catch (error) {
        console.error('Error fetching friend requests:', error.message);
        friendRequestsList.innerHTML = '<div class="card mt-2 p-3">Failed to load friend requests</div>';
      }
    }

    if (friendActionContainer) {
      const friends = await API.fetchFriends(ParamUserId);
      const friendStatus = FriendManager.determineFriendStatus(currentUserData, paramUserData, friends);
      FriendManager.renderFriendActions(friendStatus, friendActionContainer, ParamUserId, currentUserId);
    }

  } catch (error) {
    console.error('Error in main logic:', error.message);
    if (feedsContainer) {
      feedsContainer.innerHTML = '<div class="card mt-2 p-3">An error occurred. Please try again.</div>';
    }
  }
});

























































































// const ParamUserId = document.getElementById("paramUserId")?.value;
// const currentUserId = document.getElementById('currentUserId').value;
// const CurrentUserName = document.getElementById('CurrentUserName').value;
// const ParamUserImage = document.getElementById('ParamUserImage').value;
// const ParamUserName = document.getElementById("ParamUserName").value;
// const ParamUserCoverImage = document.getElementById("ParamUserCoverImage").value;
// const CurrentUserImage = document.getElementById("CurrentUserImage").value;
// const isOwner = document.getElementById('isOwner').value === 'true';
// const chatId = document.getElementById('chatId').value;

// // تكوين ثابت للتطبيق
// const CONFIG = {
//   API_BASE_URL: 'http://localhost:3000',
//   ENDPOINTS: {
//     USER: '/users/:id',
//     POSTS: '/users/:userId/posts',
//     COMMENTS: '/comment',
//     POST_COMMENTS: '/comment/post',
//     REPLIES: '/comment/post/reply',
//     LIKE_POST: '/posts/like',
//     CREATE_POST: '/posts',
//     PROFILE_PICTURE: '/users/profilePicture',
//     COVER_PICTURE: '/users/coverPicture',
//     FRIEND_REQUESTS: '/friend/friendRequests/:userId',

//   },
//   DEFAULT_IMAGE: '/images/default.png',
//   VISIBLE_COMMENTS: 3,
//   VISIBLE_REPLIES: 1,
// };

// // المساعدين للوظائف المتكررة
// const Helpers = {
//   formatDate: (dateStr) => {
//     try {
//       return new Date(dateStr).toLocaleString('en-GB', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//       });
//     } catch (error) {
//       console.error('Error formatting date:', dateStr, error);
//       return 'Unknown Date';
//     }
//   },
//   createElement: (tag, classes = [], content = '') => {
//     const element = document.createElement(tag);
//     if (classes.length) element.classList.add(...classes);
//     if (content) element.innerHTML = content;
//     return element;
//   },
//   fadeIn: (element) => {
//     element.style.opacity = '0';
//     setTimeout(() => {
//       element.style.transition = 'opacity 0.3s ease';
//       element.style.opacity = '1';
//     }, 50);
//   },
//   safeAccess: (obj, path, defaultValue = null) => {
//     try {
//       return path.reduce((current, key) => current[key], obj) || defaultValue;
//     } catch {
//       return defaultValue;
//     }
//   },
//   processImage: (imagePath) => {
//     if (!imagePath) {
//       console.warn('Image path is empty, using default image:', CONFIG.DEFAULT_IMAGE);
//       return CONFIG.DEFAULT_IMAGE;
//     }
//     if (imagePath.startsWith('http') || imagePath.startsWith('/images')) {
//       console.log('Image is a URL:', imagePath);
//       return imagePath;
//     }
//     console.log('Image is a local path, prepending /images/:', `/images/${imagePath}`);
//     return `/images/${imagePath}`;
//   },
// };

// // دوال الـ API
// const API = {
//     fetchUser: async (userId) => {
//     try {
//       const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.USER.replace(':id', userId)}`;
//       console.log('Fetching user from:', url);
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const result = await response.json();
//       console.log('Raw user response:', result);
//       if (result.data) {
//         console.log('Fetched user data:', result.data);
//         return result.data;
//       } else {
//         console.warn('No user data found in response:', result);
//         return null;
//       }
//     } catch (error) {
//       console.error('Error fetching user:', userId, error);
//       return null;
//     }
//   },

//   fetchPosts: async (userId) => {
//     try {
//       const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POSTS.replace(':userId', userId)}`);
//       const result = await response.json();
//       console.log('Fetched posts:', result.data);
//       return result.status === 'success' ? result.data || [] : [];
//     } catch (error) {
//       console.error('Error fetching posts:', error);
//       return [];
//     }
//   },
//   fetchComments: async (postId) => {
//     try {
//       const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POST_COMMENTS}/${postId}`);
//       const result = await response.json();
//       console.log('Fetched comments for post', postId, ':', result.data?.comments);
//       return result.status === 'success' ? result.data.comments || [] : [];
//     } catch (error) {
//       console.error('Error fetching comments for post', postId, ':', error);
//       return [];
//     }
//   },
//   createComment: async (postId, content) => {
//     try {
//       const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.COMMENTS}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ postId, content }),
//       });
//       const result = await response.json();
//       console.log('Created comment for post', postId, ':', result.data);
//       return result.status === 'success' ? result.data : null;
//     } catch (error) {
//       console.error('Error creating comment for post', postId, ':', error);
//       return null;
//     }
//   },
//   createReply: async (commentId, content) => {
//     try {
//       const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.REPLIES}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ commentId, content }),
//       });
//       const result = await response.json();
//       console.log('Created reply for comment', commentId, ':', result.data?.reply);
//       return result.status === 'success' ? result.data.reply : null;
//     } catch (error) {
//       console.error('Error creating reply for comment', commentId, ':', error);
//       return null;
//     }
//   },
//   likePost: async (postId) => {
//     try {
//       const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.LIKE_POST}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ postId }),
//       });
//       const result = await response.json();
//       console.log('Like action for post', postId, ':', result.data);
//       return result.status === 'success' ? result.data : null;
//     } catch (error) {
//       console.error('Error liking post', postId, ':', error);
//       return null;
//     }
//   },
//   createPost: async (content, imageFile) => {
//     try {
//       const formData = new FormData();
//       formData.append('content', content);
//       if (imageFile) {
//         formData.append('image', imageFile);
//         formData.append('imageType', 'post');
//       }
//       console.log('Creating post with data:', {
//         content,
//         hasImage: !!imageFile,
//         formData: [...formData.entries()],
//       });

//       const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CREATE_POST}`, {
//         method: 'POST',
//         body: formData,
//         credentials: 'include',
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log('Created post:', result);
//       return result.status === 'success' ? result.data : null;
//     } catch (error) {
//       console.error('Error creating post:', error.message);
//       throw error;
//     }
//   },
// };

// // إدارة قبول ورفض طلبات الصداقة باستخدام async/await
// async function acceptFriendRequest(id) {
//   console.log('Accepted friend with ID:', id);
//   await sendFriendAction('/friend/accept', { friendId: id }, 'Friend accepted');
// }

// async function rejectFriendRequest(id) {
//   console.log('Rejected friend with ID:', id);
//   await sendFriendAction('/friend/reject', { friendId: id }, 'Friend rejected');
// }

// async function sendFriendRequest(id) {
//   console.log('Sending friend request for ID:', id);
//   await sendFriendAction('/friend/sentrequest', { friendId: id }, 'Friend request sent');
// }

// async function cancelFriendRequest(id) {
//   console.log('Cancelling friend request for ID:', id);
//   await sendFriendAction('/friend/cancel', { friendId: id }, 'Friend request cancelled');
// }

// async function deleteFriend(id) {
//   console.log('Deleting friend with ID:', id);
//   await sendFriendAction('/friend/delete', { friendId: id }, 'Friend deleted');
// }

// async function sendFriendAction(url, data, successMessage) {
//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     });
//     if (!response.ok) throw new Error('Request failed');
//     const result = await response.json();
//     console.log(successMessage, result);

//     if (url === '/friend/sentrequest') {
//       console.log('Emitting socket event for friend request:', {
//         currentUserId,
//         CurrentUserName,
//         ParamUserId,
//         CurrentUserImage,
//         ParamUserName,
//       });
//       socket.emit('sendFriendRequest', {
//         currentUserId,
//         CurrentUserName,
//         ParamUserId,
//         CurrentUserImage: Helpers.processImage(CurrentUserImage),
//         ParamUserName,
//       });
//     }

//     location.reload();
//   } catch (error) {
//     console.error('Error in sendFriendAction:', error);
//   }
// }

// // تحديث أزرار الصداقة
// document.addEventListener('DOMContentLoaded', function () {
//   const friendStatus = document.getElementById('friendStatus')?.value;
//   const container = document.getElementById('friendActionContainer');

//   if (!container) {
//     console.error('Friend action container not found!');
//     return;
//   }

//   const form = document.createElement('form');
//   form.method = 'POST';
//   form.id = 'friends-form';

//   try {
//     switch (friendStatus) {
//       case 'friends':
//         form.innerHTML += `
//           <button type="button" id="deleteBtn" class="btn btn-danger">Delete Friend</button>
//         `;
//         setTimeout(() => {
//           const deleteBtn = document.getElementById('deleteBtn');
//           if (deleteBtn) {
//             deleteBtn.addEventListener('click', () => deleteFriend(ParamUserId));
//             console.log('Delete friend button initialized');
//           }
//         }, 0);
//         break;

//       case 'requestSent':
//         form.innerHTML += `
//           <button type="button" id="cancelBtn" class="btn btn-danger">Cancel Request</button>
//         `;
//         setTimeout(() => {
//           const cancelBtn = document.getElementById('cancelBtn');
//           if (cancelBtn) {
//             cancelBtn.addEventListener('click', () => cancelFriendRequest(ParamUserId));
//             console.log('Cancel request button initialized');
//           }
//         }, 0);
//         break;

//       case 'requestReceived':
//         form.innerHTML += `
//           <button type="button" id="acceptBtn" class="btn btn-success">Accept Friend Request</button>
//           <button type="button" id="rejectBtn" class="btn btn-danger">Reject</button>
//         `;
//         setTimeout(() => {
//           const acceptBtn = document.getElementById('acceptBtn');
//           const rejectBtn = document.getElementById('rejectBtn');
//           if (acceptBtn) {
//             acceptBtn.addEventListener('click', () => acceptFriendRequest(ParamUserId));
//             console.log('Accept friend button initialized');
//           }
//           if (rejectBtn) {
//             rejectBtn.addEventListener('click', () => rejectFriendRequest(ParamUserId));
//             console.log('Reject friend button initialized');
//           }
//         }, 0);
//         break;

//       case 'owner':
//         console.log('User is owner, no friend action buttons needed');
//         break;

//       case 'none':
//       default:
//         form.innerHTML += `
//           <button type="button" id="addBtn" class="btn btn-primary">Add Friend</button>
//         `;
//         setTimeout(() => {
//           const addBtn = document.getElementById('addBtn');
//           if (addBtn) {
//             addBtn.addEventListener('click', () => sendFriendRequest(ParamUserId));
//             console.log('Add friend button initialized');
//           }
//         }, 0);
//         break;
//     }

//     container.appendChild(form);
//     console.log('Friend action form appended with status:', friendStatus);
//   } catch (error) {
//     console.error('Error initializing friend action buttons:', error);
//   }
// });

// // إدارة اللايكات
// const LikeManager = {
//   getLikeImages: (users) => {
//     const safeUsers = Array.isArray(users) ? users : [];
//     console.log('Like users:', safeUsers.map(user => ({
//       _id: user._id,
//       name: user.name,
//       image: user.image,
//     })));
//     return safeUsers.slice(0, 3).map(user => ({
//       image: Helpers.processImage(user.image),
//       name: user.name || 'Unknown User',
//     }));
//   },
//   renderLikes: (container, likesCount, likeImages) => {
//     console.log('Rendering likes:', { likesCount, likeImages });
//     if (likesCount === 0) {
//       container.innerHTML = '';
//       return;
//     }
//     container.innerHTML = `
//       ${likeImages.map(img => `<span><img src="${img.image}" alt="${img.name}" /></span>`).join('')}
//       <p>Liked by <b>${likesCount} ${likesCount === 1 ? 'person' : 'people'}</b></p>
//     `;
//   },
//   addLikeEvent: (button, post, currentUserId, likedByContainer) => {
//     button.addEventListener('click', async (e) => {
//       e.preventDefault();
//       if (!currentUserId) {
//         alert('Please log in to like a post.');
//         return;
//       }
//       try {
//         const updatedPost = await API.likePost(post._id);
//         if (updatedPost) {
//           console.log('Updated post likes:', updatedPost.likes?.users?.map(user => ({
//             _id: user._id,
//             name: user.name,
//             image: user.image,
//           })));
//           post.likes = updatedPost.likes || { likesCount: 0, users: [] };
//           const isNowLiked = Helpers.safeAccess(post, ['likes', 'users'], []).some(user => user._id === currentUserId);
//           button.classList.toggle('liked', isNowLiked);
//           button.querySelector('span').innerHTML = `<i class="uil uil-heart"></i> ${isNowLiked ? 'Unlike' : 'Like'}`;
//           const likeImages = LikeManager.getLikeImages(post.likes.users);
//           LikeManager.renderLikes(likedByContainer, post.likes.likesCount, likeImages);
//         } else {
//           alert('Failed to like/unlike post. Please try again.');
//         }
//       } catch (error) {
//         console.error('Error liking post:', error);
//         alert('Failed to like/unlike post. Please try again.');
//       }
//     });
//   },
// };

// // إدارة الكومنتات
// const CommentManager = {
//   renderReply: (reply) => {
//     const replyElement = Helpers.createElement('div', ['reply']);
//     replyElement.innerHTML = `
//       <div class="reply-avatar">
//         <img src="${Helpers.processImage(Helpers.safeAccess(reply, ['userId', 'image'], CONFIG.DEFAULT_IMAGE))}" alt="${Helpers.safeAccess(reply, ['userId', 'name'], 'User')}">
//       </div>
//       <div class="reply-content">
//         <p><b>${Helpers.safeAccess(reply, ['userId', 'name'], 'User')}</b> ${reply.content || ''}</p>
//         <small class="text-muted">${Helpers.formatDate(reply.createdAt)}</small>
//       </div>
//     `;
//     Helpers.fadeIn(replyElement);
//     return replyElement;
//   },
//   renderReplies: (replies, container, comment, showAll = false) => {
//     container.innerHTML = '';
//     const safeReplies = Array.isArray(replies) ? replies : [];
//     if (!safeReplies.length) {
//       container.style.display = 'none';
//       return;
//     }
//     container.style.display = 'block';
//     const visibleReplies = showAll ? safeReplies : safeReplies.slice(0, CONFIG.VISIBLE_REPLIES);
//     visibleReplies.forEach(reply => container.appendChild(CommentManager.renderReply(reply)));
//     if (safeReplies.length > CONFIG.VISIBLE_REPLIES) {
//       const toggleLink = Helpers.createElement('a', ['replies-toggle-link'], showAll ? 'Hide replies' : `Show ${safeReplies.length - CONFIG.VISIBLE_REPLIES} more replies`);
//       toggleLink.href = '#';
//       toggleLink.addEventListener('click', (e) => {
//         e.preventDefault();
//         CommentManager.renderReplies(safeReplies, container, comment, !showAll);
//       });
//       container.appendChild(toggleLink);
//     }
//   },
//   renderComment: (comment, commentsContainer) => {
//     const commentElement = Helpers.createElement('div', ['comment']);
//     commentElement.dataset.commentId = comment._id;
//     commentElement.innerHTML = `
//       <div class="comment-avatar">
//         <img src="${Helpers.processImage(Helpers.safeAccess(comment, ['userId', 'image'], CONFIG.DEFAULT_IMAGE))}" alt="${Helpers.safeAccess(comment, ['userId', 'name'], 'User')}">
//       </div>
//       <div class="comment-content">
//         <p><b>${Helpers.safeAccess(comment, ['userId', 'name'], 'User')}</b> ${comment.content || ''}</p>
//         <small class="text-muted">${Helpers.formatDate(comment.createdAt)}</small>
//         <div class="comment-actions">
//           <a href="#" class="reply-link">Reply</a>
//           ${comment.replies?.length ? '<a href="#" class="show-replies-link">Show replies</a>' : ''}
//         </div>
//         <div class="replies-container"></div>
//         <div class="reply-input-container" style="display: none;">
//           <input type="text" class="reply-input" placeholder="Write a reply...">
//           <button class="reply-submit-btn">Submit</button>
//         </div>
//       </div>
//     `;
//     Helpers.fadeIn(commentElement);

//     const repliesContainer = commentElement.querySelector('.replies-container');
//     CommentManager.renderReplies(comment.replies, repliesContainer, comment);

//     const replyLink = commentElement.querySelector('.reply-link');
//     const replyInputContainer = commentElement.querySelector('.reply-input-container');
//     const replyInput = commentElement.querySelector('.reply-input');
//     const replySubmitBtn = commentElement.querySelector('.reply-submit-btn');

//     replyLink.addEventListener('click', (e) => {
//       e.preventDefault();
//       replyInputContainer.style.display = 'flex';
//       replyInput.focus();
//     });

//     const showRepliesLink = commentElement.querySelector('.show-replies-link');
//     if (showRepliesLink) {
//       showRepliesLink.addEventListener('click', (e) => {
//         e.preventDefault();
//         CommentManager.renderReplies(comment.replies, repliesContainer, comment, true);
//       });
//     }

//     CommentManager.addReplyEvent(replySubmitBtn, replyInput, comment, repliesContainer, commentElement);
//     CommentManager.addReplyKeypressEvent(replyInput, replySubmitBtn);

//     return commentElement;
//   },
//   renderComments: (comments, container, visibleCount = CONFIG.VISIBLE_COMMENTS) => {
//     container.innerHTML = '';
//     const safeComments = Array.isArray(comments) ? comments : [];
//     if (!safeComments.length) {
//       container.innerHTML = '<p class="text-muted no-comments">No comments yet.</p>';
//       return;
//     }
//     const visibleComments = safeComments.slice(0, visibleCount);
//     visibleComments.forEach(comment => container.appendChild(CommentManager.renderComment(comment, container)));
//     if (safeComments.length > visibleCount) {
//       const viewAllLink = Helpers.createElement('a', ['view-all-comments'], `View all ${safeComments.length} comments`);
//       viewAllLink.href = '#';
//       viewAllLink.addEventListener('click', (e) => {
//         e.preventDefault();
//         CommentManager.renderComments(safeComments, container, visibleCount + 3);
//       });
//       container.appendChild(viewAllLink);
//     }
//   },
//   addCommentEvent: (button, input, postId, commentsContainer) => {
//     button.addEventListener('click', async () => {
//       const content = input.value.trim();
//       if (content) {
//         try {
//           console.log('Attempting to create comment with content:', content);
//           const newComment = await API.createComment(postId, content);
//           console.log('New comment:', newComment);
//           if (newComment) {
//             const noComments = commentsContainer.querySelector('.no-comments');
//             if (noComments) noComments.remove();
//             const comments = await API.fetchComments(postId);
//             CommentManager.renderComments(comments, commentsContainer);
//             input.value = '';
//           } else {
//             alert('Failed to post comment. Please try again.');
//           }
//         } catch (error) {
//           console.error('Error creating comment:', error);
//           alert('Failed to post comment. Please try again.');
//         }
//       }
//     });
//   },
//   addCommentKeypressEvent: (input, button) => {
//     input.addEventListener('keypress', (e) => {
//       if (e.key === 'Enter') {
//         e.preventDefault();
//         button.click();
//       }
//     });
//   },
//   addReplyEvent: (button, input, comment, repliesContainer, commentElement) => {
//     button.addEventListener('click', async () => {
//       const content = input.value.trim();
//       if (content) {
//         try {
//           const newReply = await API.createReply(comment._id, content);
//           if (newReply) {
//             comment.replies = comment.replies || [];
//             comment.replies.unshift(newReply);
//             CommentManager.renderReplies(comment.replies, repliesContainer, comment);
//             input.value = '';
//             input.parentElement.style.display = 'none';
//             const commentActions = commentElement.querySelector('.comment-actions');
//             if (!commentActions.querySelector('.show-replies-link')) {
//               const showRepliesLink = Helpers.createElement('a', ['show-replies-link'], 'Show replies');
//               showRepliesLink.href = '#';
//               showRepliesLink.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 CommentManager.renderReplies(comment.replies, repliesContainer, comment, true);
//               });
//               commentActions.appendChild(showRepliesLink);
//             }
//           }
//         } catch (error) {
//           console.error('Error creating reply:', error);
//         }
//       }
//     });
//   },
//   addReplyKeypressEvent: (input, button) => {
//     input.addEventListener('keypress', (e) => {
//       if (e.key === 'Enter') button.click();
//     });
//   },
// };

// // إدارة البوستات
// const PostManager = {
//   renderPost: (post, feedsContainer, currentUserId) => {
//     const feedElement = Helpers.createElement('div', ['feed']);
//     feedElement.dataset.postId = post._id;

//     const isLiked = currentUserId && Helpers.safeAccess(post, ['likes', 'users'], []).some(user => user._id === currentUserId);
//     const likeImages = LikeManager.getLikeImages(Helpers.safeAccess(post, ['likes', 'users'], []));
//     const processedAuthorImage = Helpers.processImage(Helpers.safeAccess(post, ['user', 'image']));
//     const processedPostImage = Helpers.processImage(post.image);

//     console.log('Processed post images:', {
//       postId: post._id,
//       userImage: processedAuthorImage,
//       postImage: processedPostImage,
//     });

//     const postImageHTML = post.image ? `
//       <div class="photo">
//         <img src="${processedPostImage}" alt="Post Image"/>
//       </div>
//     ` : '';

//     feedElement.innerHTML = `
//       <div class="head">
//         <div class="user">
//           <div class="profile-photo">
//             <a href="/profile/${Helpers.safeAccess(post, ['user', '_id'], '')}">
//               <img src="${processedAuthorImage || CONFIG.DEFAULT_IMAGE}" alt="${post.authorname || 'User'}" />
//             </a>
//           </div>
//           <div class="info">
//             <a href="/profile/${Helpers.safeAccess(post, ['user', '_id'], '')}">
//               <h3>${post.authorname || 'User'}</h3>
//               <small>${Helpers.formatDate(post.createdAt)}</small>
//             </a>
//           </div>
//         </div>
//         <span class="edit"><i class="uil uil-ellipsis-h"></i></span>
//       </div>
//       ${postImageHTML}
//       <div class="caption">
//         <p><b>${post.authorname || 'User'}</b> ${post.content || ''}</p>
//       </div>
//       <div class="liked-by"></div>
//       <div class="action-buttons">
//         <div class="buttonss">
//           <div class="interaction-button like-button ${isLiked ? 'liked' : ''}">
//             <span><i class="uil uil-heart"></i> ${isLiked ? 'Unlike' : 'Like'}</span>
//           </div>
//         </div>
//         <div class="buttonss">
//           <div class="interaction-button comment-button">
//             <span><i class="uil uil-comment-dots"></i> Comment</span>
//           </div>
//         </div>
//         <div class="buttonss">
//           <div class="interaction-button">
//             <span><i class="uil uil-share-alt"></i> Share</span>
//           </div>
//         </div>
//       </div>
//       <div class="comments-container"></div>
//       <div class="comment-input-container">
//         <input type="text" class="comment-input" placeholder="Write a comment...">
//         <button class="comment-submit-btn">Submit</button>
//       </div>
//     `;

//     feedsContainer.prepend(feedElement); // تغيير إلى prepend عشان البوست الجديد يظهر في الأول

//     const likedByContainer = feedElement.querySelector('.liked-by');
//     LikeManager.renderLikes(likedByContainer, Helpers.safeAccess(post, ['likes', 'likesCount'], 0), likeImages);

//     const likeButton = feedElement.querySelector('.like-button');
//     LikeManager.addLikeEvent(likeButton, post, currentUserId, likedByContainer);

//     const commentsContainer = feedElement.querySelector('.comments-container');
//     API.fetchComments(post._id).then(comments => {
//       CommentManager.renderComments(comments, commentsContainer);
//     });

//     const commentButton = feedElement.querySelector('.comment-button');
//     const commentInput = feedElement.querySelector('.comment-input');
//     commentButton.addEventListener('click', (e) => {
//       e.preventDefault();
//       commentInput.focus();
//     });

//     const commentSubmitBtn = feedElement.querySelector('.comment-submit-btn');
//     CommentManager.addCommentEvent(commentSubmitBtn, commentInput, post._id, commentsContainer);
//     CommentManager.addCommentKeypressEvent(commentInput, commentSubmitBtn);
//   },
//   renderPosts: (posts, feedsContainer, currentUserId) => {
//     console.log('Rendering posts:', posts);
//     if (!Array.isArray(posts) || !posts.length) {
//       feedsContainer.innerHTML = '<div class="card mt-2 p-3">No posts to show</div>';
//       return;
//     }
//     feedsContainer.innerHTML = '';
//     posts.forEach(post => PostManager.renderPost(post, feedsContainer, currentUserId));
//   },
// };

// // إدارة إنشاء البوست
// const CreatePostManager = {
//   init: () => {
//     if (!isOwner) {
//       console.log('CreatePostManager not initialized: User is not the profile owner');
//       return;
//     }

//     const form = document.getElementById('create-post-form');
//     const contentInput = document.getElementById('post-content');
//     const imageInput = document.getElementById('post-image-input');
//     const imagePreview = document.getElementById('post-image-preview');
//     const imageContainer = document.getElementById('post-image-container');
//     const removeImageBtn = document.getElementById('remove-image-btn');
//     const submitBtn = document.getElementById('post-submit-btn');
//     const feedsContainer = document.getElementById('feedsContainer');

//     if (!form || !contentInput || !imageInput || !imagePreview || !imageContainer || !removeImageBtn || !submitBtn || !feedsContainer) {
//       console.error('Create post form elements missing:', {
//         form: !!form,
//         contentInput: !!contentInput,
//         imageInput: !!imageInput,
//         imagePreview: !!imagePreview,
//         imageContainer: !!imageContainer,
//         removeImageBtn: !!removeImageBtn,
//         submitBtn: !!submitBtn,
//         feedsContainer: !!feedsContainer,
//       });
//       return;
//     }

//     imageInput.addEventListener('change', (e) => {
//       const file = e.target.files[0];
//       if (file && file.type.startsWith('image/')) {
//         const reader = new FileReader();
//         reader.onload = (event) => {
//           imagePreview.src = event.target.result;
//           imageContainer.style.display = 'block';
//           console.log('Post image preview updated:', event.target.result);
//         };
//         reader.readAsDataURL(file);
//       } else {
//         console.log('No valid image selected for post');
//         imageContainer.style.display = 'none';
//       }
//     });

//     removeImageBtn.addEventListener('click', () => {
//       imageInput.value = '';
//       imagePreview.src = '';
//       imageContainer.style.display = 'none';
//       console.log('Post image removed');
//     });

//     form.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       const content = contentInput.value.trim();
//       const imageFile = imageInput.files[0];

//       if (!content && !imageFile) {
//         alert('Please add content or an image to post.');
//         return;
//       }

//       if (!currentUserId) {
//         alert('Please log in to create a post.');
//         return;
//       }

//       try {
//         const newPost = await API.createPost(content, imageFile);
//         if (newPost) {
//           console.log('New post created:', newPost);
//           const postData = {
//             _id: newPost._id,
//             user: {
//               _id: currentUserId,
//               image: Helpers.processImage(CurrentUserImage) || CONFIG.DEFAULT_IMAGE,
//             },
//             authorname: CurrentUserName || 'User',
//             content: newPost.content || '',
//             image: newPost.image || null,
//             createdAt: newPost.createdAt || new Date().toISOString(),
//             likes: { likesCount: 0, users: [] },
//           };
//           PostManager.renderPost(postData, feedsContainer, currentUserId);
//           Helpers.fadeIn(feedsContainer.firstChild);
//           contentInput.value = '';
//           imageInput.value = '';
//           imagePreview.src = '';
//           imageContainer.style.display = 'none';
//         } else {
//           console.log('Failed to create post');
//         }
//       } catch (error) {
//         console.error('Error creating post:', error.message);
//         alert(`Failed to create post: ${error.message}`);
//       }
//     });
//   },
// };

// // إدارة الصور الشخصية وصور الكافر
// const ProfileImageManager = {
//   init: () => {
//     console.log('ProfileImageManager.init started');

//     try {
//       const isOwner = document.getElementById('isOwner')?.value === 'true';
//       console.log('Is owner:', isOwner);

//       const ParamUserImage = document.getElementById('ParamUserImage')?.value;
//       const ParamUserCoverImage = document.getElementById('ParamUserCoverImage')?.value;
//       console.log('Profile images:', { ParamUserImage, ParamUserCoverImage });

//       const profileCard = document.querySelector('.card[data-owner]');
//       const coverContainer = document.querySelector('.social-wallpaper[data-owner]');

//       if (!profileCard) console.error('Profile card not found! Check .card[data-owner]');
//       if (!coverContainer) console.error('Cover container not found! Check .social-wallpaper[data-owner]');

//       const profileImage = document.getElementById('ProfileImage');
//       if (profileImage && ParamUserImage) {
//         profileImage.src = Helpers.processImage(ParamUserImage);
//         console.log('Updated profileImage.src:', profileImage.src);
//       }

//       const coverImage = coverContainer;
//       if (coverImage && ParamUserCoverImage) {
//         coverImage.style.background = `url(${Helpers.processImage(ParamUserCoverImage)}) no-repeat center/cover`;
//         console.log('Updated coverImage.style.background:', coverImage.style.background);
//       }

//       if (!isOwner) {
//         const profileHvr = profileCard?.querySelector('.profile-hvr');
//         const coverHvr = coverContainer?.querySelector('.profile-hvr');
//         if (profileHvr) {
//           profileHvr.style.display = 'none';
//           console.log('Hid profile-hvr for non-owner');
//         }
//         if (coverHvr) {
//           coverHvr.style.display = 'none';
//           console.log('Hid cover-hvr for non-owner');
//         }
//         return;
//       }

//       const profileImageInput = document.getElementById('profileImageInput');
//       const profileEditContainer = profileCard?.querySelector('.profile-hvr');
//       const profileSaveBtn = profileCard?.querySelector('.profile-save');
//       const profileCancelBtn = profileCard?.querySelector('.profile-cancel');
//       const profileActions = profileCard?.querySelector('.profile-actions');

//       const coverImageInput = document.getElementById('coverImageInput');
//       const coverEditContainer = coverContainer?.querySelector('.profile-hvr');
//       const coverSaveBtn = coverContainer?.querySelector('.cover-save');
//       const coverCancelBtn = coverContainer?.querySelector('.cover-cancel');
//       const coverActions = coverContainer?.querySelector('.cover-actions');

//       console.log('Profile elements:', {
//         profileImage: !!profileImage,
//         profileImageInput: !!profileImageInput,
//         profileEditContainer: !!profileEditContainer,
//         profileSaveBtn: !!profileSaveBtn,
//         profileCancelBtn: !!profileCancelBtn,
//         profileActions: !!profileActions,
//       });

//       console.log('Cover elements:', {
//         coverImage: !!coverImage,
//         coverImageInput: !!coverImageInput,
//         coverEditContainer: !!coverEditContainer,
//         coverSaveBtn: !!coverSaveBtn,
//         coverCancelBtn: !!coverCancelBtn,
//         coverActions: !!coverActions,
//       });

//       let originalProfileSrc = ParamUserImage ? Helpers.processImage(ParamUserImage) : CONFIG.DEFAULT_IMAGE;
//       let originalCoverStyle = ParamUserCoverImage ? `url(${Helpers.processImage(ParamUserCoverImage)}) no-repeat center/cover` : `url(${CONFIG.DEFAULT_IMAGE}) no-repeat center/cover`;

//       if (profileEditContainer && profileImageInput && profileImage && profileActions) {
//         console.log('Profile image event listeners added');
//         profileEditContainer.addEventListener('click', (e) => {
//           e.preventDefault();
//           console.log('Profile edit container clicked');
//           profileImageInput.click();
//         });

//         profileImageInput.addEventListener('change', (e) => {
//           const file = e.target.files[0];
//           if (file && file.type.startsWith('image/')) {
//             const reader = new FileReader();
//             reader.onload = (event) => {
//               profileImage.src = event.target.result;
//               profileActions.style.display = 'flex';
//               console.log('Profile image preview updated:', event.target.result);
//             };
//             reader.readAsDataURL(file);
//           } else {
//             console.log('No valid image selected for profile');
//           }
//         });

//         profileSaveBtn?.addEventListener('click', async () => {
//           console.log('Profile image save clicked');
//           if (!profileImageInput.files[0]) {
//             console.log('No profile image selected for upload');
//             profileActions.style.display = 'none';
//             return;
//           }

//           try {
//             const formData = new FormData();
//             formData.append('image', profileImageInput.files[0]);
//             formData.append('imageType', 'profile');

//             const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.PROFILE_PICTURE}`, {
//               method: 'POST',
//               body: formData,
//               credentials: 'include',
//             });

//             const result = await response.json();
//             if (!response.ok) throw new Error(result.error || 'Failed to upload profile image');

//             console.log('Profile image uploaded:', result);
//             profileImage.src = Helpers.processImage(result.data.image);
//             originalProfileSrc = profileImage.src;
//             profileActions.style.display = 'none';
//             profileImageInput.value = '';
//           } catch (error) {
//             console.error('Error uploading profile image:', error);
//             alert('Failed to upload profile image. Please try again.');
//           }
//         });

//         profileCancelBtn?.addEventListener('click', () => {
//           profileImage.src = originalProfileSrc;
//           profileActions.style.display = 'none';
//           profileImageInput.value = '';
//           console.log('Profile image change cancelled');
//         });
//       } else {
//         console.error('Profile image setup failed: Missing elements');
//       }

//       if (coverEditContainer && coverImageInput && coverImage && coverActions) {
//         console.log('Cover image event listeners added');
//         coverEditContainer.addEventListener('click', (e) => {
//           e.preventDefault();
//           console.log('Cover edit container clicked');
//           if (!e.target.classList.contains('cover-delete')) {
//             coverImageInput.click();
//           }
//         });

//         coverImageInput.addEventListener('change', (e) => {
//           const file = e.target.files[0];
//           if (file && file.type.startsWith('image/')) {
//             const reader = new FileReader();
//             reader.onload = (event) => {
//               coverImage.style.background = `url(${event.target.result}) no-repeat center/cover`;
//               coverActions.style.display = 'flex';
//               console.log('Cover image preview updated:', event.target.result);
//             };
//             reader.readAsDataURL(file);
//           } else {
//             console.log('No valid image selected for cover');
//           }
//         });

//         coverSaveBtn?.addEventListener('click', async () => {
//           console.log('Cover image save clicked');
//           if (!coverImageInput.files[0]) {
//             console.log('No cover image selected for upload');
//             coverActions.style.display = 'none';
//             return;
//           }

//           try {
//             const formData = new FormData();
//             formData.append('image', coverImageInput.files[0]);
//             formData.append('imageType', 'cover');

//             const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.COVER_PICTURE}`, {
//               method: 'POST',
//               body: formData,
//               credentials: 'include',
//             });

//             const result = await response.json();
//             if (!response.ok) throw new Error(result.error || 'Failed to upload cover image');

//             console.log('Cover image uploaded:', result);
//             coverImage.style.background = `url(${Helpers.processImage(result.data.coverImage)}) no-repeat center/cover`;
//             originalCoverStyle = coverImage.style.background;
//             coverActions.style.display = 'none';
//             coverImageInput.value = '';
//           } catch (error) {
//             console.error('Error uploading cover image:', error);
//             alert('Failed to upload cover image. Please try again.');
//           }
//         });

//         coverCancelBtn?.addEventListener('click', () => {
//           coverImage.style.background = originalCoverStyle;
//           coverActions.style.display = 'none';
//           coverImageInput.value = '';
//           console.log('Cover image change cancelled');
//         });
//       } else {
//         console.error('Cover image setup failed: Missing elements');
//       }
//     } catch (error) {
//       console.error('Error in ProfileImageManager.init:', error);
//     }
//   },
// };

// // المنطق الرئيسي
// document.addEventListener('DOMContentLoaded', async () => {
//   const ParamUserId = document.getElementById('paramUserId')?.value;
//   const currentUserId = document.getElementById('currentUserId')?.value || null;
//   const CurrentUserName = document.getElementById('CurrentUserName')?.value;
//   const ParamUserImage = document.getElementById('ParamUserImage')?.value;
//   const ParamUserName = document.getElementById('ParamUserName')?.value;
//   const ParamUserCoverImage = document.getElementById('ParamUserCoverImage')?.value;
//   const CurrentUserImage = document.getElementById('CurrentUserImage')?.value;
//   const isOwner = document.getElementById('isOwner')?.value === 'true';
//   const chatId = document.getElementById('chatId')?.value;
//   const HomeImagetwo = document.getElementById('HomeImagetwo');
//   if (CurrentUserImage) {
//     HomeImagetwo.src = Helpers.processImage(CurrentUserImage);
//   }
 

//   const feedsContainer = document.getElementById('feedsContainer');
//   // إضافة Spinner
//   if (feedsContainer) {
//     feedsContainer.innerHTML = '<div class="spinner">Loading...</div>';
//   }

//   try {
//     if (!ParamUserId) {
//       console.error('User ID not found!');
//       if (feedsContainer) {
//         feedsContainer.innerHTML = '<div class="card mt-2 p-3">No posts to show</div>';
//       }
//       return;
//     }

//     if (!feedsContainer) {
//       console.error('Feeds container not found! Check if #feedsContainer exists in HTML.');
//       return;
//     }

//     // تهيئة الصورة الشخصية وصورة الكافر
//     ProfileImageManager.init();

//     // تهيئة إنشاء البوست
//     CreatePostManager.init();

//     // تحديث الصورة في الـ Navbar
//     const navbarImage = document.getElementById('navbarUserImage');
//     if (CurrentUserImage && navbarImage) {
//       navbarImage.src = Helpers.processImage(CurrentUserImage);
//       console.log('Navbar image updated:', navbarImage.src);
//     }

//     // تحديث الاسم
//     const userName = document.getElementById('UserName');
//     if (ParamUserName && userName) {
//       userName.textContent = ParamUserName;
//       console.log('User name updated:', ParamUserName);
//     }

//     // تحديث placeholder للـ textarea إذا موجود
//     const postContent = document.getElementById('post-content');
//     if (isOwner && CurrentUserName && postContent) {
//       postContent.placeholder = `What's on your mind, ${CurrentUserName}?`;
//       console.log('Post content placeholder updated:', postContent.placeholder);
//     }

//     // تحديث أزرار الـ Timeline
//     const timelineBtnDiv = document.querySelector('.timeline-btn');
//     if (timelineBtnDiv) {
//       if (isOwner) {
//         timelineBtnDiv.style.display = 'none';
//         console.log('Timeline buttons hidden for owner');
//       } else {
//         const chatButton = timelineBtnDiv.querySelector('.btn-success');
//         if (chatButton && chatId) {
//           chatButton.href = `/chatPage/${chatId}`;
//           console.log('Chat button updated with href:', chatButton.href);
//         }
//       }
//     }

//     // جلب البوستات
//     const posts = await API.fetchPosts(ParamUserId);
//     PostManager.renderPosts(posts, feedsContainer, currentUserId);

//     // جلب الأصدقاء
//     const friendsInput = document.getElementById('ParamUserFriends');
//     const friendsContainer = document.getElementById('FriendsContainer');
//     if (friendsInput && friendsContainer) {
//       try {
//         const friends = JSON.parse(friendsInput.value);
//         console.log('Parsed friends:', friends);
//         friends.forEach(friend => {
//           const friendLink = Helpers.createElement('a', [], '');
//           friendLink.href = `/profile/${friend.id._id}`;
//           friendLink.title = friend.name;
//           const friendImg = Helpers.createElement('img', ['media-object', 'img-radius']);
//           friendImg.src = Helpers.processImage(friend.id.image);
//           friendImg.alt = friend.name;
//           friendLink.appendChild(friendImg);
//           friendsContainer.appendChild(friendLink);
//           console.log('Friend added:', friend.name, 'Image:', friendImg.src);
//         });
//       } catch (err) {
//         console.error('Error parsing friends JSON:', err);
//       }
//     }

//     // جلب طلبات الصداقة
//     if (currentUserId) {
//       try {
//         const response = await fetch(`/friend/friendRequests/${currentUserId}`);
//         const data = await response.json();
//         const listContainer = document.getElementById('friendRequestsList');
//         if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
//           listContainer.innerHTML = `<input id="currentUserId" type="hidden" name="currentUserId" value="${currentUserId}">`;
//           data.data.forEach(friend => {
//             const friendElement = Helpers.createElement('div', ['friend-request']);
//             friendElement.innerHTML = `
//               <div class="friend-request-item" style="display: flex; align-items: center; gap: 10px; padding: 5px 0;">
//                 <a href="/profile/${friend.id}">
//                   <img src="${Helpers.processImage(friend.image)}" alt="${friend.name}" style="width: 40px; height: 40px; border-radius: 50%;">
//                 </a>
//                 <a href="/profile/${friend.id}" style="flex-grow: 1; text-decoration: none; color: inherit;">
//                   <span>${friend.name}</span>
//                 </a>
//                 <button class="btn btn-sm btn-success" onclick="acceptFriendRequest('${friend.id}')">Accept</button>
//                 <button class="btn btn-sm btn-danger" onclick="rejectFriendRequest('${friend.id}')">Reject</button>
//               </div>
//             `;
//             listContainer.appendChild(friendElement);
//             console.log('Friend request added:', friend.name, 'Image:', friend.image);
//           });
//         } else {
//           listContainer.innerHTML += '<div id="no-friend-request" class="text-muted p-2">No friend requests</div>';
//         }
//       } catch (error) {
//         console.error('Error fetching friend requests:', error);
//       }
//     }
//   } catch (error) {
//     console.error('Error in main logic:', error);
//   }
// });
// console.log("profile.js done");