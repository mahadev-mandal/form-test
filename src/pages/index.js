import React, { useEffect } from "react";
import Layout from "../components/dfa-theme/layout";
import "./index.scss";
// import { Col, Row } from "react-flexbox-grid";

const McqPage = () => {
  console.log('deploy test outside')
  useEffect(() => {
    const formContainer = document.querySelector('#form-container');
    const formStackForm = document.querySelector('#fsform-container');
    console.log(formContainer, formStackForm)
    if (formContainer && formStackForm) {
      formContainer.appendChild(formStackForm);
    }
  }, [])
  return (
    <Layout>
      <section id="form-container">

      </section>
    </Layout>
  );
};

export default McqPage;
