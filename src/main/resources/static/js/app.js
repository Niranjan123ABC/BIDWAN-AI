// API URL - same origin since Thymeleaf serves from same server
const API_URL = '/api/chat';
let currentSessionId = null;
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    autoResizeTextarea();

    // If page loaded with a sessionId in URL, load that session
    const path = window.location.pathname;
    if (path.startsWith('/chat/')) {
        const sessionId = path.split('/')[2];
        if (sessionId) loadSession(sessionId);
    }
});

// Auto-resize textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
}

// Handle Enter key (Shift+Enter = new line)
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Send message
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message || isLoading) return;

    // Hide welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) welcomeScreen.style.display = 'none';

    // Add user message to UI
    addMessageToUI('user', message);
    input.value = '';
    input.style.height = 'auto';

    // Show loading
    showLoading();
    isLoading = true;
    setSendButtonState(true);

    try {
        const response = await fetch(`${API_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sessionId: currentSessionId  // null on first message → server creates new UUID
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // ✅ FIX: data.sessionId now correctly returned from server
        if (!currentSessionId && data.sessionId) {
            currentSessionId = data.sessionId;
            addToHistory(currentSessionId, message);
            window.history.pushState({}, '', `/chat/${currentSessionId}`);
        }

        // ✅ FIX: data.content correctly returned from server
        removeLoading();
        addMessageToUI('assistant', data.content);

    } catch (error) {
        removeLoading();
        addMessageToUI('assistant', '⚠️ Error: ' + error.message);
        console.error('Send error:', error);
    } finally {
        isLoading = false;
        setSendButtonState(false);
    }
}

// Send suggestion chip
function sendSuggestion(text) {
    document.getElementById('messageInput').value = text;
    sendMessage();
}

// Enable / disable send button
function setSendButtonState(loading) {
    const btn = document.getElementById('sendBtn');
    btn.disabled = loading;
}

// Add message to UI
// ✅ FIX: Unified class — always use 'assistant-message' for AI, 'user-message' for user
function addMessageToUI(role, content) {
    const container = document.getElementById('messagesContainer');

    const messageDiv = document.createElement('div');
    // ✅ FIX: 'assistant-message' class used consistently (was 'ai-message' in old code)
    messageDiv.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatContent(content);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    container.appendChild(messageDiv);

    container.scrollTop = container.scrollHeight;
}

// Format content with basic markdown-like rendering
function formatContent(text) {
    if (!text) return '';

    // Escape HTML first
    text = text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    // Fenced code blocks (``` ... ```)
    text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code (`code`)
    text = text.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // Bold (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic (*text*)
    text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

    // Unordered lists (lines starting with - or *)
    text = text.replace(/^[*-] (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Numbered lists
    text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
}

// Show loading dots
function showLoading() {
    const container = document.getElementById('messagesContainer');
    const loadingDiv = document.createElement('div');
    // ✅ FIX: Use 'assistant-message' here too (was 'ai-message')
    loadingDiv.className = 'message assistant-message loading';
    loadingDiv.id = 'loadingMessage';

    loadingDiv.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="loading-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;

    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
}

// Remove loading indicator
function removeLoading() {
    const loading = document.getElementById('loadingMessage');
    if (loading) loading.remove();
}

// Generate a fallback session ID (used if server doesn't return one)
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Start a brand new chat
function startNewChat() {
    currentSessionId = null;
    document.getElementById('messagesContainer').innerHTML = `
        <div class="welcome-screen" id="welcomeScreen">
            <h1>What can I help you with?</h1>
            <p>Ask me anything - I can write, code, analyze, and more.</p>
            <div class="suggestion-chips">
                <button onclick="sendSuggestion('Explain quantum computing simply')">Explain quantum computing simply</button>
                <button onclick="sendSuggestion('Write a Python function to sort a list')">Write a Python function to sort a list</button>
                <button onclick="sendSuggestion('Help me plan a 7-day trip to Japan')">Help me plan a 7-day trip to Japan</button>
                <button onclick="sendSuggestion(\\'Analyze this data: sales up 20%\\')">Analyze this data: sales up 20%</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.chat-session').forEach(el => el.classList.remove('active'));
    window.history.pushState({}, '', '/chat');
    document.getElementById('currentSessionTitle').textContent = 'New Conversation';
}

// Add session to sidebar
function addToHistory(sessionId, firstMessage) {
    const historyContainer = document.getElementById('chatHistory');

    // Don't duplicate
    const existing = historyContainer.querySelector(`[data-session-id="${sessionId}"]`);
    if (existing) {
        document.querySelectorAll('.chat-session').forEach(el => el.classList.remove('active'));
        existing.classList.add('active');
        return;
    }

    const sessionDiv = document.createElement('div');
    sessionDiv.className = 'chat-session active';
    sessionDiv.textContent = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
    sessionDiv.setAttribute('data-session-id', sessionId);
    sessionDiv.onclick = () => loadSession(sessionId);

    // Remove active from all others
    document.querySelectorAll('.chat-session').forEach(el => el.classList.remove('active'));

    historyContainer.insertBefore(sessionDiv, historyContainer.firstChild);
}

// Load all sessions from server into sidebar
async function loadChatHistory() {
    try {
        const response = await fetch('/api/chat/sessions');
        if (!response.ok) return;

        const sessions = await response.json();
        const historyContainer = document.getElementById('chatHistory');
        historyContainer.innerHTML = '';

        sessions.forEach(session => {
            const sessionDiv = document.createElement('div');
            sessionDiv.className = 'chat-session';
            sessionDiv.textContent = session.title;
            sessionDiv.setAttribute('data-session-id', session.id);
            sessionDiv.onclick = () => loadSession(session.id);
            historyContainer.appendChild(sessionDiv);
        });
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Load a specific session's messages
async function loadSession(sessionId) {
    currentSessionId = sessionId;

    document.querySelectorAll('.chat-session').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-session-id') === sessionId);
    });

    window.history.pushState({}, '', `/chat/${sessionId}`);
    document.getElementById('currentSessionTitle').textContent = 'Conversation';

    try {
        const response = await fetch(`${API_URL}/history/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load history');

        const messages = await response.json();
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';

        messages.forEach(msg => {
            // msg.role will be 'user' or 'assistant' from DB
            addMessageToUI(msg.role, msg.content);
        });

    } catch (error) {
        console.error('Error loading session:', error);
        addMessageToUI('assistant', '⚠️ Error loading conversation history.');
    }
}

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    if (path === '/chat' || path === '/') {
        startNewChat();
    } else if (path.startsWith('/chat/')) {
        const sessionId = path.split('/')[2];
        if (sessionId) loadSession(sessionId);
    }
});