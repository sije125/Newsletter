(function () {
  const chatBox = document.getElementById('chat');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');

  const history = [];

  const KICKOFF =
    "Hi! I'm here to help you find a real way to make money online using AI. " +
    "Let's start simple: what skills, professional experience, or things are you " +
    "genuinely good at right now?";

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = 'msg ' + (role === 'assistant' ? 'agent' : 'user');
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = role === 'assistant' ? 'Niche Finder' : 'You';
    const body = document.createElement('div');
    body.textContent = text;
    el.appendChild(who);
    el.appendChild(body);
    chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function setBusy(busy) {
    input.disabled = busy;
    form.querySelector('button').disabled = busy;
  }

  async function sendToAgent() {
    setBusy(true);
    addMessage('assistant', '...');
    const placeholder = chatBox.lastElementChild;

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      placeholder.remove();

      if (!res.ok) {
        addMessage('assistant', 'Sorry, something went wrong: ' + (data.error || res.statusText));
        return;
      }

      history.push({ role: 'assistant', content: data.reply });
      addMessage('assistant', data.reply);
    } catch (err) {
      placeholder.remove();
      addMessage('assistant', 'Sorry, I could not reach the server. Please try again.');
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    history.push({ role: 'user', content: text });
    addMessage('user', text);
    input.value = '';

    sendToAgent();
  });

  // Show a fixed opening question locally. It is NOT added to `history`:
  // the Anthropic API requires the message list to start with a "user"
  // turn, so the first real API call is the user's answer to this question.
  addMessage('assistant', KICKOFF);
})();
