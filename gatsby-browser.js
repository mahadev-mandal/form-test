


import React from "react";

export const wrapRootElement = ({ element, props }) => {

  document.addEventListener('DOMContentLoaded', (e) => {
    const formContainer = document.querySelector('#form-container');
    const formStackForm = document.querySelector('#fsform-container');
    console.log(formContainer, formStackForm)
    if (formContainer && formStackForm) {
      formContainer.appendChild(formStackForm);
    }
  })

  return element
}
