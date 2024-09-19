import React, { Component } from 'react';
import './Blocks.scss';
import data from './Data';
import l from './Locate';
import CryptoJS from 'crypto-js';

class BlackBox extends Component {
    constructor(props) {
        super();
    }

    render() {
        return (
            <div className='blackbox'></div>
        )
    }
}

class Registration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            top: 0,
            left: 0,
            isVisible: true,
            errorMessages: [],
            username: '',
            email: '',
            password: '',
            thisUserPrimary: false
        };
    }

    handleMouseDown = (event) => {
        this.setState({
            isDragging: true,
            dragStartX: event.clientX,
            dragStartY: event.clientY,
        });
    };

    handleMouseMove = (event) => {
        if (this.state.isDragging) {
            const deltaX = event.clientX - this.state.dragStartX;
            const deltaY = event.clientY - this.state.dragStartY;

            this.setState((prevState) => ({
                top: prevState.top + deltaY,
                left: prevState.left + deltaX,
                dragStartX: event.clientX,
                dragStartY: event.clientY,
            }));
        }
    };

    handleMouseUp = () => {
        this.setState({
            isDragging: false,
        });
    };

    handleSubmit = async (event) => {
        event.preventDefault();
    };

    handleLoginClick = () => {
        this.setState({
            isVisible: false,
        });
    };

    handleRegisterClick = async () => {
        const { username, email, password } = this.state;

        const isUsernameValid = username.length >= 5;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailPattern.test(email);

        const isPasswordValid = password.length >= 8;

        this.setState({
            ...this.state,
            errorMessages: [],
        });



        if (!isUsernameValid) {
            this.setState((prevState) => ({
                ...this.state,
                errorMessages: [...prevState.errorMessages, l[this.props.mainState.user.lang].errornameuser5],
            }));
        }

        if (!isEmailValid) {
            this.setState((prevState) => ({
                ...this.state,
                errorMessages: [...prevState.errorMessages, l[this.props.mainState.user.lang].uncorrectemail],
            }));
        }

        if (!isPasswordValid) {
            this.setState((prevState) => ({
                ...this.state,
                errorMessages: [...prevState.errorMessages, l[this.props.mainState.user.lang].uncorrectpassword],
            }));
        }
        let thisUserPrimary = false;
        if (isUsernameValid && isEmailValid && isPasswordValid) {
            thisUserPrimary = await data.validateName(username, this.props.mainState, this.props.setMainState);
            if (!(thisUserPrimary)) {

                const dt = await data.insertNewUser({
                    ...this.props.mainState,
                    user: {
                        ...this.props.mainState.user,
                        username: username,
                        email: email,
                        pass: CryptoJS.AES.encrypt(password, username).toString(),
                    },
                }, this.props.setMainState);

                this.setState({
                    isVisible: false,
                    errorMessages: [],
                });

                await data.updateLanguage(this.props.mainState, this.props.setMainState, dt.user_id);
                await data.generateHash(username, this.props.mainState, this.props.setMainState);
                window.location.reload();
            } else {
                this.setState((prevState) => ({
                    ...this.state,
                    errorMessages: [...prevState.errorMessages, l[this.props.mainState.user.lang].usernameexists],
                }));
            }
        }
        this.setState({ thisUserPrimary: thisUserPrimary });
    }


    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({
            [name]: value,
        });
    };

    render() {
        const { top, left, isVisible, errorMessages, username, email, password } = this.state;



        return isVisible ? (
            <div
                className={`registration-container`}
                style={{ top: `${top}px`, left: `${left}px` }}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
            >
                <h2 id='registration-title' onMouseDown={this.handleMouseDown}>
                    {l[this.props.mainState.user.lang].registrationtitle}
                    <LnSelector mainState={this.props.mainState} setMainState={this.props.setMainState} />
                </h2>
                <form className="registration-form" onSubmit={this.handleSubmit}>
                    <label htmlFor="username" className="registration-label">{l[this.props.mainState.user.lang].usernamelabel}</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="registration-input"
                        value={username}
                        onChange={this.handleChange}
                    /><br />

                    <label htmlFor="email" className="registration-label">{l[this.props.mainState.user.lang].emaillabel}</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="registration-input"
                        value={email}
                        onChange={this.handleChange}
                    /><br />

                    <label htmlFor="password" className="registration-label">{l[this.props.mainState.user.lang].passwordlabel}</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="registration-input"
                        value={password}
                        onChange={this.handleChange}
                    /><br />

                    <div className="error-container">
                        {errorMessages.length > 0 && (
                            <div className="error-message">
                                {l[this.props.mainState.user.lang].errorheadlabel}{errorMessages.join(', ')}.
                            </div>
                        )}
                    </div>

                    <div className="registration-buttons">
                        <button className="registration-button" onClick={this.handleLoginClick}>
                            {l[this.props.mainState.user.lang].signuplabel}
                        </button>
                        <button className="registration-button" onClick={this.handleRegisterClick}>
                            {l[this.props.mainState.user.lang].reglabel}
                        </button>
                    </div>
                </form>
            </div>
        ) : (!this.state.thisUserPrimary && (
            <Login
                setMainState={this.props.setMainState}
                mainState={this.props.mainState}
            ></Login>));
    }
}


class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            top: 0,
            left: 0,
            isVisible: true,
            errorMessage: '',
        };
    }

    handleMouseDown = (event) => {
        this.setState({
            isDragging: true,
            dragStartX: event.clientX,
            dragStartY: event.clientY,
        });
    };

    handleMouseMove = (event) => {
        if (this.state.isDragging) {
            const deltaX = event.clientX - this.state.dragStartX;
            const deltaY = event.clientY - this.state.dragStartY;

            this.setState((prevState) => ({
                top: prevState.top + deltaY,
                left: prevState.left + deltaX,
                dragStartX: event.clientX,
                dragStartY: event.clientY,
            }));
        }
    };

    handleMouseUp = () => {
        this.setState({
            isDragging: false,
        });
    };

    handleSubmit = async (event) => {
        event.preventDefault();
    };

    handleRegisterClick = () => {
        this.setState({
            isVisible: false,
        });
    }

    handleLoginClick = async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            let dt = await data.validateUser(username, encodeURIComponent(CryptoJS.AES.encrypt(password, username).toString()), this.props.mainState, this.props.setMainState)

            if (dt.logined) {
                await data.updateLanguage(this.props.mainState, this.props.setMainState, dt.id);
                await data.generateHash(username, this.props.mainState, this.props.setMainState);
                window.location.reload();
            }

        } else {
            this.setState({
                errorMessage: l[this.props.mainState.user.lang].signuperror,
            });
        }
    };

    render() {
        const { top, left, isVisible, errorMessage } = this.state;

        return isVisible ? (
            <div
                className={`registration-container enter-contain`}
                style={{ top: `${top}px`, left: `${left}px` }}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
            >
                <h2 id='registration-title' onMouseDown={this.handleMouseDown}>
                    {l[this.props.mainState.user.lang].signupmainlabel}
                    <LnSelector mainState={this.props.mainState} setMainState={this.props.setMainState} />
                </h2>
                <div className="registration-form">
                    <label htmlFor="username" className="registration-label">{l[this.props.mainState.user.lang].usernamelabel}</label>
                    <input type="text" id="username" name="username" className="registration-input" /><br />

                    <label htmlFor="password" className="registration-label">{l[this.props.mainState.user.lang].passwordlabel}</label>
                    <input type="password" id="password" name="password" className="registration-input" /><br />

                    <div className="registration-buttons">
                        <button className="registration-button" onClick={this.handleRegisterClick}>
                            {l[this.props.mainState.user.lang].reglabel}
                        </button>
                        <button className="registration-button" onClick={this.handleLoginClick}>
                            {l[this.props.mainState.user.lang].signuplabel}
                        </button>
                    </div>

                    {errorMessage && (
                        <div className="error-message">
                            {errorMessage}
                        </div>
                    )}
                </div>
            </div>
        ) : (this.state.thisUserPrimary && (
            <Registration
                setMainState={this.props.setMainState}
                mainState={this.props.mainState}
            ></Registration>
        ));
    }
};


class LnSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            languageOptions: [
                { code: 'en', name: 'English', flag: '🇺🇸' },
                { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                { code: 'it', name: 'Italiano', flag: '🇮🇹' },
                { code: 'es', name: 'Español', flag: '🇪🇸' },
                { code: 'ja', name: '日本語', flag: '🇯🇵' },
                { code: 'zh', name: '中文', flag: '🇨🇳' },
            ],
        };
    }

    handleChangeLanguage = async (event) => {
        await this.props.setMainState({ ...this.props.mainState, user: { ...this.props.mainState.user, lang: event.target.value } });
    };

    render() {
        return (<select
            id="languageSelect"
            value={this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'}
            onChange={this.handleChangeLanguage}
        >
            {this.state.languageOptions.map(
                (option) => (
                    (<option key={option.code} value={option.code} >
                        {option.flag} {option.name}
                    </option>)
                ))}
        </select>)
    }
}


export { BlackBox, Registration };