import React from "../_snowpack/pkg/react.js";
function Modal({children, title, confirmText, onConfirm}) {
  return /* @__PURE__ */ React.createElement("div", {
    className: "modal"
  }, /* @__PURE__ */ React.createElement("section", {
    className: "overlay"
  }), /* @__PURE__ */ React.createElement("section", {
    className: "dialog"
  }, /* @__PURE__ */ React.createElement("header", null, title), /* @__PURE__ */ React.createElement("main", null, children), /* @__PURE__ */ React.createElement("footer", null, /* @__PURE__ */ React.createElement("button", {
    onClick: onConfirm
  }, confirmText))));
}
export default Modal;
