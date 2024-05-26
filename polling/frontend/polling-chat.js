const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text
  };

  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }

  const res = await fetch("/poll", options);

  return res.json();
}

async function getNewMsgs() {
  try {
    const res = await fetch("/poll");
    const json = await res.json();

    if (res.status >= 400) {
      throw new Error("bad response from server");
    }

    allChat = json.msg;
    render();
    failedTries = 0;
  } catch (e) {
    failedTries++;
    // console.error(e);
  }

  
  // setTimeout(getNewMsgs, INTERVAL);
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

// make the first request
// getNewMsgs();
let timeToMakeNextRequest = 0;
let failedTries = 0;
let BACKOFF = 5000;
async function requestAnimationFrameTimer(time) {
  if (timeToMakeNextRequest <= time) {
    await getNewMsgs();
    timeToMakeNextRequest = document.timeline.currentTime + INTERVAL + failedTries * BACKOFF;
    console.log(failedTries * BACKOFF);
  }
  requestAnimationFrame(requestAnimationFrameTimer);
}
requestAnimationFrame(requestAnimationFrameTimer);