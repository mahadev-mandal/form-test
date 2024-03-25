import React, { Component } from 'react';
import {
	FormGroup,
	InputGroup,
	Checkbox,
	Radio,
	RadioGroup,
	Text,
} from '@blueprintjs/core';
import axios from 'axios';
import SourceEmitter from '../../lib/emitter';
import { Row, Col } from 'react-flexbox-grid';
import { loadReCaptcha, ReCaptcha } from 'react-recaptcha-v3';
import endpoint, { whichSite } from '../helpers';

// integration or  development
const RECAPTCHA_SITE_KEY =
	whichSite() === 'development'
		? '6LcaEIIaAAAAAOvSgY5AQiG-jUu-hM0sFohwDzzl'
		: '6LeXeboZAAAAAAJ7opsQpnfBVkXwbGTrPWJoJsjY';

const DATA_API_URL = '/api/fellows-survey';

class RegisterForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			question1: '',
			question2: '',
			question3: '',
			question4: '',
			question5: '',
			question6: '',
			prevCurrentFellowship: '',
			fellowshipProgram: null,
			session: false,
			checkingReCaptchaForSubmit: false,
			ReCaptchaToken: '',
			isLoading: false,
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.validateEmail = this.validateEmail.bind(this);
		this.resetValues = this.resetValues.bind(this);
	}

	queryParams = {}; // Used for handling query parameters that are sent along with form data
	parseParams = (param) => {
		const query =
			param &&
			param
				.split('&')
				.map((p) => p.split('='))
				.reduce((prev, cur) => {
					prev[cur[0]] = cur[1];
					return prev;
				}, {});
		let updatedQuery = { ...query };
		if (query && query.hasOwnProperty('emid')) {
			updatedQuery = { ...updatedQuery, EndoMdmId: updatedQuery['emid'] };
			delete updatedQuery['emid'];
		} else {
			updatedQuery = { ...updatedQuery, EndoMdmId: '' };
		}
		if (updatedQuery && updatedQuery.hasOwnProperty('JobId')) {
			updatedQuery = { ...updatedQuery, jid: updatedQuery['JobId'] };
			delete updatedQuery['JobId'];
		} else {
			updatedQuery = { ...updatedQuery, jid: '' };
		}
		if (updatedQuery && updatedQuery.hasOwnProperty('SubscriberId')) {
			updatedQuery = { ...updatedQuery, SubscriberId: updatedQuery['SubscriberId'] };
			delete updatedQuery['SubscriberId'];
		} else {
			updatedQuery = { ...updatedQuery, SubscriberId: '' };
		}
		if (updatedQuery && updatedQuery.hasOwnProperty('CampaignId')) {
			updatedQuery = { ...updatedQuery, cid: updatedQuery['CampaignId'] };
			delete updatedQuery['CampaignId'];
		} else {
			updatedQuery = { ...updatedQuery, cid: '' };
		}
		if (updatedQuery && updatedQuery.hasOwnProperty('TacticId')) {
			updatedQuery = { ...updatedQuery, tid: updatedQuery['TacticId'] };
			delete updatedQuery['TacticId'];
		} else {
			updatedQuery = { ...updatedQuery, tid: '' };
		}

		this.queryParams = { ...updatedQuery };
		console.log(this.queryParams);
	};

	componentDidMount() {
		typeof window !== 'undefined' &&
			this.parseParams(
				window.location.search.substr(1, window.location.search.length)
			); // strip out question mark from the url
		loadReCaptcha(RECAPTCHA_SITE_KEY, () => {});
	}

	validateEmail = (_email) => {
		const emailREGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return emailREGEX.test(_email);
	};

	handleButtonDisable = () => {
		let disabled =
			this.state.question1 &&
			this.state.question1.length >= 1 &&
			this.state.question2 &&
			this.state.question2.length >= 1 &&
			this.state.question3 &&
			this.state.question3.length >= 1 &&
			this.state.question4 &&
			this.state.question4.length >= 1 &&
			this.state.question5 &&
			this.state.question5.length >= 1 &&
			this.state.question6 &&
			this.state.question6.length >= 1 &&
			!this.state.isLoading;



		return disabled;
	};

	resetValues = () => {
		var e = document.getElementsByTagName("input");
		for (var i = 0; i < e.length; i++) {
			if (e[i].type == "text") {
				e[i].value = "";
			}
		}
	}

	handleChange = async (event) => {
		event.persist();
		if (event.target.type === 'checkbox') {
			await this.setState({
				[event.target.name]: event.target.checked,
			});
		} else {
			await this.setState({
				[event.target.name]: event.target.value,
			});
		}
	};

	verifyCallback = async (recaptchaToken) => {
		if (this.state.checkingReCaptchaForSubmit) {
			await this.setState({
				checkingReCaptchaForSubmit: false,
				ReCaptchaToken: recaptchaToken,
			});
			await this.handleSubmit();
		}
	};

	updateRecaptchaToken = () => {
		this.recaptcha.execute();
	};

	handleSubmitForCaptcha = async () => {
		await this.setState({ checkingReCaptchaForSubmit: true });
		this.updateRecaptchaToken();
		this.resetValues();
	};

	// will need to update this for the API - mjm1374 - 1/3/2023
	handleSubmit = async () => {
		const dataToSend = {
			// contactKey: this.state.email,
			// EventDefinitionKey: "",
			// data: {
			Q1Response: this.state.question1,
			Q2Response: this.state.question2,
			Q3Response: this.state.question3,
			Q4Response: this.state.question4,
			Q5Response: this.state.question5,
			Q6Response: this.state.question6,
			// FellowshipName: this.state.prevCurrentFellowship,
			// CurrentlyEnrolled: this.state.fellowshipProgram,
			Event: 'HCP_20211019',
			ReCaptchaToken: this.state.ReCaptchaToken,
			...this.queryParams,
		};
		// },

		//Submit form
		try {
			await this.setState({ isLoading: true });
			const res = await axios.post(DATA_API_URL, dataToSend);
			SourceEmitter.emit(`FormSubmitted`, true);
			await this.setState({ isLoading: false });


		} catch (e) {
			console.log(e);
		}
		// axios
		//   .post(endpoint, dataToSend)
		//   .then((response) => {
		//     this.setState({
		//       email: "",
		//       xiaflexUnsub: false,
		//       endoUnsub: false,
		//       FormError: false,
		//     });
		//     SourceEmitter.emit(`FormSubmitted`, true);
		//   })
		//   .catch((error) => {
		//     console.log(error);
		//   });
	};

	render() {
		const {
			question1,
			question2,
			question3,
			question4,
			question5,
			question6,
			xiaflexUnsub,
			endoUnsub,
			email_Error,

			//fellowshipProgram,
			//prevCurrentFellowship,
			session,
		} = this.state;
		const renderQuestion1 = () => (
			<Row>
				<Col xs={12} md={8}>
					<FormGroup
						label="What did the Dupuytren's contracture education/training look like in your fellowship?"
						labelFor='text-question-1'
						id='form-question-1'
					>
						<InputGroup
							id='text-question-1'
							// intent={this.checkValidation("fellowship")} # we don't need to check as button is disabled until all requied fields are filled out
							intent='primary'
							large
							onChange={this.handleChange}
							name='question1'
							value={question1}
						/>
					</FormGroup>
				</Col>
			</Row>
		);
		const renderQuestion2 = () => (
			<Row>
				<Col xs={12} md={8}>
					<FormGroup
						label='How were you exposed to XIAFLEX?  If applicable, what did that training look like?  Did you leave feeling clinically prepared to enter practice?'
						labelFor='text-question-2'
						id='form-question-2'
					>
						<InputGroup
							id='text-question-2'
							// intent={this.checkValidation("exposed")}
							intent='primary'
							large
							onChange={this.handleChange}
							name='question2'
							value={question2}
						/>
					</FormGroup>
				</Col>
			</Row>
		);
		const renderQuestion3 = () => (
			<Row>
				<Col xs={12} md={8}>
					<FormGroup
						label='What clinical pain points around XIAFLEX have you experienced since you’ve entered practice?'
						labelFor='text-question-3'
						id='form-question-3'
					>
						<InputGroup
							id='text-question-3'
							// intent={this.checkValidation("email")}
							intent='primary'
							large
							onChange={this.handleChange}
							name='question3'
							value={question3}
						/>
					</FormGroup>
				</Col>
			</Row>
		);
		const renderQuestion4 = () => (
			<Row>
				<Col xs={12} md={8}>
					<FormGroup
						label='What operational pain points (product acquisition, billing, etc) regarding XIAFLEX have you experienced since you’ve entered practice?'
						labelFor='text-question-4'
						id='form-question-4'
					>
						<InputGroup
							id='text-question-4'
							large
							onChange={this.handleChange}
							name='question4'
							value={question4}
							// intent={this.checkValidation("renderQuestion4")}
							intent='primary'
						/>
					</FormGroup>
				</Col>
			</Row>
		);
		const renderQuestion5 = () => (
			<Row>
				<Col xs={12} md={8}>
					<FormGroup
						helperText=''
						label='Is there anything you wish you had learned in fellowship that would have been useful when starting out in practice?'
						labelFor='text-question-5'
						id='form-question-5'
					>
						<InputGroup
							id='text-question-5'
							large
							onChange={this.handleChange}
							name='question5'
							value={question5} // intent={this.checkValidation("city")}
							intent='primary'
						/>
					</FormGroup>
				</Col>
			</Row>
		);
		const renderQuestion6 = () => (
			<Row>
				<Col xs={12} md={8}>
					<FormGroup
						helperText=''
						label='How can Endo better support the integration of XIAFLEX into your practice?'
						labelFor='text-question-6'
						id='form-question-6'
					>
						<InputGroup
							id='text-question-6'
							large
							onChange={this.handleChange}
							name='question6'
							value={question6} // intent={this.checkValidation("state")}
							intent='primary'
						/>
					</FormGroup>
				</Col>
			</Row>
		);

		const renderUnsubscribe = () => {};
		return (
      <div className="form-container">
        {renderQuestion1()}
        {renderQuestion2()}
        {renderQuestion3()}
        {renderQuestion4()}
        {renderQuestion5()}
        {renderQuestion6()}
        <Row>
          <Col xs={12}>
            <button
              type="button"
              onClick={this.handleSubmitForCaptcha}
              className={`btn-submit-registration ${
                !this.handleButtonDisable() ? "disabled" : ""
              }`}
              disabled={!this.handleButtonDisable()}
            >
              SUBMIT
            </button>{" "}
            {this.state.isLoading && <span className="form-submitted">Thank you.</span>}
            <ReCaptcha
              ref={(ref) => (this.recaptcha = ref)}
              sitekey={RECAPTCHA_SITE_KEY}
              verifyCallback={this.verifyCallback}
            />
          </Col>
        </Row>
      </div>
    );
	}
}

export default RegisterForm;
