const socket = io();
// Elements
socket.emit('Hello!', error => {
    if (error) {
        alert(error)
    }
})

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $attachFileButton = document.querySelector("#attach-file");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
    "#location-message-template"
).innerHTML;
const imagePreviewTemplate = document.querySelector('#image-preview-template').innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// query string
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

const imageTypes = [
    'jpg',
    'jpeg',
    'png'
]

socket.on('file', (fileName, message) => {
    const fileType = fileName.split('.')[1].toLowerCase()
    if (imageTypes.includes(fileType)) {
        const html = Mustache.render(imagePreviewTemplate, {
            username: message.username,
            url: message.url,
            placeholder: fileName,
            createdAt: moment(message.createdAt).format("MMMM Do YYYY, h:mm a"),
        });
        $messages.insertAdjacentHTML("beforeend", html);
    } else {
        const html = Mustache.render(locationMessageTemplate, {
            username: message.username,
            url: message.url,
            placeholder: fileName,
            createdAt: moment(message.createdAt).format("MMMM Do YYYY, h:mm a"),
        });
        $messages.insertAdjacentHTML("beforeend", html);
    }
    
    autoscroll();
})

socket.on("message", (message) => {

    var nameDivElement = document.getElementById('maxCharacters');
    nameDivElement.innerHTML = "0/500 characters"
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("MMMM Do YYYY, h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on("locationMessage", (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        placeholder: 'My current location',
        createdAt: moment(message.createdAt).format("MMMM Do YYYY, h:mm a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on("roomData", ({
    room,
    users
}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    });
    document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute("disabled", "disabled");

    const message = e.target.elements.message.value;

    if (message.length > 500) {
        alert('Message is too long.')
    }

    socket.emit("sendMessage", message, (error) => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log("Message delivered!");
    });
});

$attachFileButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => { 
        const file = e.target.files[0]; 
        if (file.size > 75000000) {
            return alert('File is too big.')
        }
        socket.emit(
            'attachFile',
            file,
            file.name,
            () => {
                console.log('sent')
            }
        )
    }
    input.click();
})

$sendLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser.");
    }

    $sendLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit(
            "sendLocation", {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            },
            () => {
                $sendLocationButton.removeAttribute("disabled");
                console.log("Location shared!");
            }
        );
    });
});

socket.on("connect_failed", () => {
    alert("Connection failed, refreshing..");
    location.href = "/";
});

socket.on("error", () => {
    alert("Connection failed, refreshing..");
    location.href = "/";
});

socket.emit("join", {
    username,
    room
}, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});

setInterval(() => {
    if (!socket.connected) {
        alert("Connection failed, refreshing...");
        location.href = "/chat";
    }
}, 1000);