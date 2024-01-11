/**
 * PowerCord Library: A library for securely embedding iframes and establishing a
 * communication bus between the host and guest applications
 *
 * @class PowerCord
 */
class PowerCord {
  /**
   * Instantiates the PowerCord object.
   *
   * @param {string} domain - URL of the app to be iframed
   * @param {boolean} [debug=false] - whether debug info should be logged to console
   */
  constructor(domain, { debug = false, onInitialized } = {}) {
    this.domain = domain;
    this.debug = debug;
    this.eventHandlers = {};
    this.errorHandlers = [];
    this.host = new URL(this.domain).host;
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
    this.createInstance = this.createInstance.bind(this);
    this.emit = this.emit.bind(this);
    this.messageListener = this.messageListener.bind(this);
    this.onInitialized = onInitialized.bind(this);
    window.addEventListener("message", this.messageListener);
  }

  /**
   * Listens to messages.
   *
   * @param {object} event
   */
  messageListener(event) {
    const eventHost = new URL(event.origin).host;
    if (eventHost !== this.host) {
      if (this.debug) {
        console.log("Ignored message from domain ", event.origin, this.domain);
      }
      return;
    }
    if (event.data === "handshake") {
      if (typeof this.onInitialized === "function") {
        this.onInitialized(this);
        return;
      }
    }
    if (
      typeof event.data !== "object" ||
      typeof event.data.eventName !== "string"
    ) {
      if (this.debug) {
        console.log(
          "Ignored message from domain ",
          event.origin,
          ". Unexpected payload :",
          event.data
        );
      }
      return;
    }

    if (this.eventHandlers[event.data.eventName]) {
      this.eventHandlers[event.data.eventName].forEach((handler) => {
        handler(event.data.data);
      });
    }
  }

  /**
   * Creates an iframe with the specified URL, adds it as a child of the given parent
   * selector and sets the sandbox attributes 'allow-scripts' and 'allow-same-origin'.
   *
   * @param {string} querySelector - A CSS query selector indicating where the app
   * should be attached
   * @return {HTMLIFrameElement}
   */
  createInstance({ selector = false, hidden = false, style } = {}) {
    if (this.iframe && this.parentElement) {
      try {
        this.parentElement.removeChild(this.iframe);
      } catch (e) {}
    }
    this.iframe = document.createElement("iframe");
    // Enforces sandboxing to increase security
    this.iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation"
    );
    this.iframe.setAttribute("src", this.domain);
    const hiddenStyle = `pointer-events:none;opacity:0.00001;z-index:-1;`;
    this.iframe.setAttribute(
      "style",
      `
      width: "100%";
      height: "100%";
      position: fixed;
      margin: 0px;
      border: none;
      padding: 0px;
      z-index: 99;
      transition: ease-in-out 500ms;
      ${hidden ? hiddenStyle : ""}
      `
    );

    if (style) this.applyInstanceStyle(style);

    const parentElement = selector
      ? selector instanceof Element
        ? selector
        : document.querySelector(selector)
      : document.body;
    parentElement.appendChild(this.iframe);

    this.iframe.onload = () => {
      if (this.eventHandlers["load"]) {
        this.eventHandlers["load"](this.iframe);
      }
    };

    return this.iframe;
  }

  /**
   * Triggers the specified event in the embedded app.
   *
   * @param {string} eventName - The name of the event to trigger
   * @param {any} [data] - Data to send with the event
   */
  emit(eventName, data) {
    if (this.iframe) {
      this.iframe.contentWindow.postMessage(
        {
          eventName,
          data,
        },
        this.domain
      );
    } else if (this.debug) {
      console.error(
        "The method instanceApp() has to be called before sending messages."
      );
    }
  }

  applyInstanceStyle(style) {
    if (!this.iframe || !style) return;

    Object.keys(style).forEach((key) => {
      this.iframe.style[key] = style[key];
    });
  }

  /**
   * Adds an event listener for the specified eventName.
   *
   * @param {string} eventName - Name of the event to listen for
   * @param {function} callback
   */
  addEventListener(eventName, callback) {
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName].push(callback);
    } else {
      this.eventHandlers[eventName] = [callback];
    }
  }

  /**
   * Hide the Guest App UI.
   */
  hide() {
    this.iframe.style.zIndex = 0;
    this.iframe.style.opacity = 0;
    this.iframe.style.pointerEvents = "none";
    this.iframe.style.userSelect = "none";
  }

  /**
   * Show the Guest App UI.
   */
  show() {
    this.iframe.style.zIndex = 999;
    this.iframe.style.opacity = 1;
    this.iframe.style.pointerEvents = "all";
    this.iframe.style.userSelect = "all";
  }

  /**
   * Removes event listener for the specified eventName.
   *
   * @param {string} eventName - Name of the event to remove listener for
   * @param {function} callback
   */
  removeEventListener(eventName, callback) {
    this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(
      (cb) => cb !== callback
    );
  }
}

module.exports = PowerCord;
