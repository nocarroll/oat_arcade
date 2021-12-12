import React from 'react';

function Modal ({ children, title, confirmText, onConfirm }) {
  return (
    <div className="modal">
      <section className="overlay"></section>
      <section className="dialog">
        <header>
          {title}
        </header>
        <main>
          {children}
        </main>
        <footer>
          <button
            onClick={onConfirm}
          >{confirmText}</button>
        </footer>
      </section>
    </div>
  );
}

export default Modal;