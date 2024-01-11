# Data² PowerCord

![Data² PowerCord Logo](https://cdn.data2.media/file/c3-rkY7IQA1IjLe65bN0T)

> Connect your App to Data²

PowerCord is a JavaScript library that allows you to securely embed iframes and establish a communication bus between the host and guest applications. It provides a convenient way to interact with and control the embedded app.

## Installation

To start using PowerCord, you need to include the library in your project. You can either download the library and host it on your server, or include it directly from Data² system.

```html
<script
  type="text/javascript"
  src="https://cdn.data2.media/file/powercord-0.0.1.min.js"
></script>
```

## Usage

Once you have included the PowerCord library, you can create an instance of the `PowerCord` class. The `PowerCord` class takes two parameters: the URL of the app to be iframed and an optional `debug` flag to enable debug logging.

```js
// Instantiate PowerCord
const powerCord = new PowerCord("https://example.com/app");
```

## Embedding the App

To embed the app, you can use the `createInstance` method. Optionally, it takes a CSS query selector indicating where the app should be attached. Otherwiser it attaches the app in the `body`.

```js
powerCord.createInstance({ selector: "#my-app" });
```

This method creates an iframe with the specified URL, sets the sandbox attributes to allow scripts and same-origin access, and appends it as a child of the specified element.

## Communicating with the App

You can send messages to the embedded app using the `emit` method. It takes the name of the event to trigger and an optional data payload.

```js
// Send a message to the app
powerCord.emit("customEvent", { message: "Hello from the host app!" });
```

To listen for events from the embedded app, you can use the `addEventListener` method. It takes the name of the event to listen for and a callback function that will be called when the event is triggered.

```js
// Event listener for customEvent
powerCord.addEventListener("customEvent", (data) => {
  console.log("Message from app:", data);
});
```

You can also remove event listeners using the `removeEventListener` method.

```js
// Remove event listener for customEvent
powerCord.removeEventListener("customEvent", eventListener);
```

## Aditional Features

PowerCord provides some additional features to manage the visibility of the embedded app. You can hide the app's UI using the `hide` method, and show it again using the `show` method.

```js
// Hide the app UI
powerCord.hide();

// Show the app UI
powerCord.show();
```

## Conclusion

PowerCord provides a secure and convenient way to embed iframes and establish communication between the host and guest applications. With its simple API and additional features, you can easily integrate and control embedded apps in your projects.
