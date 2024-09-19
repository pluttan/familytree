import React, { Component } from 'react';
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { IoMdHome } from "react-icons/io";
import { IoExit } from "react-icons/io5";
import { CgTrash } from "react-icons/cg";
import { GiArrowCursor } from "react-icons/gi";
import { BiHide } from "react-icons/bi";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import './Menu.scss';
import { HexColorPicker } from 'react-colorful';
import data from './Data';
import l from './Locate';
import { IoIosAddCircleOutline } from "react-icons/io";

class Menu extends Component {
    constructor(props) {
        super(props);

        this.setMainState = props.setMainState;
        this.mainState = props.mainState;

        this.id = props.id;

        this.parseBD = null;

        this.state = {
            isDragging: false,
            initialX: 0,
            offsetX: 0,
            deltaX: 0
        };
        this.darkDatePickerTheme = createTheme({
            palette: {
                mode: 'dark',
                background: {
                    default: 'rgba(28, 45, 76, 0.7)',
                    paper: 'rgba(14, 20, 39, 0.9)',
                },
                primary: {
                    main: '#64B5F6',
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: 'rgba(255, 255, 255, 0.7)',
                },
            },
            components: {
                MuiBackdrop: {
                    styleOverrides: {
                        root: {
                            backdropFilter: 'blur(8px)',
                        },
                    },
                },
                MuiPickersDay: {
                    styleOverrides: {
                        "root": {
                            "&.Mui-selected": {
                                "backgroundColor": "#64B5F6",
                                "&:hover": {
                                    "backgroundColor": "#64B5F6"
                                }
                            }
                        }
                    },
                },
            },
        });

        this.stateTable = {
            isTableVisible: false,
            icon: this.changeicon(false),
            rows: [
                { id: 1, selectedValue: '', showInput: false, key: '', value: '' }
            ],
            selectedImage: null,
            options: l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].options,
            unorderedOptions: l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].unorderedOptions
        };

        this.stateParams = {
            languageOptions: [
                { code: 'en', name: 'English', flag: '🇺🇸' },
                { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                { code: 'it', name: 'Italiano', flag: '🇮🇹' },
                { code: 'es', name: 'Español', flag: '🇪🇸' },
                { code: 'ja', name: '日本語', flag: '🇯🇵' },
                { code: 'zh', name: '中文', flag: '🇨🇳' },
            ],
            isInstVisible: false,
            icon: this.changeicon(false)
        };

        this.stateInst = {
            isInstVisible: false,
            icon: this.changeicon(false)
        };


    }

    toParentExec(obj) {
        if (obj.parent) {
            this.toParentExec(obj.parent);
        }
        return obj;
    }

    findNodeAndExecute(obj, targetId, callback, pnode) {
        if (obj.id === targetId) {
            callback(obj);
            return pnode;
        }
        if (obj.children && obj.children.length > 0) {
            for (const child of obj.children) {
                const foundNode = this.findNodeAndExecute(child, targetId, callback, pnode);
                if (foundNode) {
                    return pnode;
                }
            }
        }
        return null;
    }


    findOptions(optionValue, optionType = 'name') {
        const foundOption = this.stateTable.unorderedOptions.find(
            option => option[optionType] === optionValue
        );
        return foundOption;
    }

    saveTableBD = () => {
        var state = { ...this.props.mainState };
        let jsonUpdate = false
        for (let i of this.stateTable.rows) {
            const option = this.findOptions(i.selectedValue);
            if (
                i.selectedValue !== '' &&
                this.props.mainState.checkedUser[option.bdname] !== i.value
            ) {
                let json = this.props.mainState.json;
                if (option.bdname === 'fio') {
                    this.findNodeAndExecute(json, this.props.mainState.cardCheckedId, (node) => {
                        node.name = i.value;
                    }, json);
                    jsonUpdate = true;
                }
                if (option.bdname === 'cardcolor') {
                    this.findNodeAndExecute(json, this.props.mainState.cardCheckedId, (node) => {
                        node.cardcolor = i.showInput ? i.value : undefined;
                    }, json);
                    jsonUpdate = true;
                }
                if (option.bdname === "nodecolor") {
                    this.findNodeAndExecute(json, this.props.mainState.cardCheckedId, (node) => {
                        node.nodecolor = i.showInput ? i.value : undefined;
                    }, json);
                    jsonUpdate = true;
                }
                if (option.bdname === "img") {
                    this.findNodeAndExecute(json, this.props.mainState.cardCheckedId, (node) => {
                        node.img = i.showInput ? i.value : undefined;
                    }, json);
                    jsonUpdate = true;
                }
                state = {
                    ...state,
                    treeNeedUpdate: true,
                    json: json,
                    checkedUser: {
                        ...state.checkedUser,
                        [option.bdname]: i.showInput ? i.value : 'NULL'
                    }
                };

            }
        }
        this.props.setMainState(state);
        if (jsonUpdate) data.saveJsonFamilyById(this.props.mainState, this.props.setMainState);
        data.saveUserById(state, this.props.mainState, this.props.setMainState);
    }

    handleChangeOption = (event, id, getValue = (d) => d.target.value) => {
        this.stateTable.rows.find(row => (row.id === id)).value = getValue(event);
        this.forceUpdate();
    };

    handleChangeLanguage = async (event) => {
        await this.props.setMainState({ ...this.props.mainState, user: { ...this.props.mainState.user, lang: event.target.value } });
        await data.updateLanguage(this.props.mainState, this.props.setMainState);
    };

    handleChangeAcientcolorDirectly = async (event) => {
        await this.props.setMainState({ ...this.props.mainState, user: { ...this.props.mainState.user, acientcolor: event } });
    }

    handleChangeAcientcolor = async (event) => {
        await this.props.setMainState({ ...this.props.mainState, treeNeedUpdate: true })
        await data.updateAcientcolor(this.props.mainState, this.props.setMainState);
    };


    async componentDidMount() {
        if (this.props.mainState.hash) {
            let dt = await data.validateCookie(this.props.mainState.hash, this.props.mainState, this.props.setMainState);
            await this.props.setMainState({ ...this.props.mainState, user: { ...this.props.mainState.user, ...dt[0] } });
            let family = await data.selectFamilyByUserId(dt[0].user_id, this.props.mainState, this.props.setMainState);
            if (family.length !== 0) {
                await this.props.setMainState({
                    ...this.props.mainState, selectedFamilyId: family[0].id_family
                })
            }
            else {
                let example = {
                    id: parseInt((await data.getNodeId()).data[0].min),
                    name: ''
                }
                await data.insertPersonById(example.id, this.props.mainState, this.props.setMainState);
                await data.insertJsonFamily(example, dt[0].user_id, this.props.mainState, this.props.setMainState);
                let family = await data.selectFamilyByUserId(dt[0].user_id, this.props.mainState, this.props.setMainState);
                await this.props.setMainState({ ...this.props.mainState, selectedFamilyId: family[0].id_family, json: { ...this.props.mainState.checkedUser, ...example } }); window.location.reload();
            }

        }

        this.componentDidUpdate({ mainState: { checkedUser: {} } });

    }


    async componentDidUpdate(prevProps, prevState) {
        if (
            this.props.mainState.checkedUser !== prevProps.mainState.checkedUser &&
            !this.props.mainState.dataCheckedUser
        ) {
            const obj = this.props.mainState.checkedUser;
            this.parseBD = null;
            this.stateTable.rows = [
                { id: 1, selectedValue: '', showInput: false, key: '', value: '' }
            ];
            this.stateTable.options = l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].options;
            for (let key in obj) {
                if (obj.hasOwnProperty(key) && obj[key] !== null && key !== 'node_id' && key !== 'id_person') {
                    let option = this.findOptions(key, 'bdname');
                    this.handleSelectChange(option.name, obj[key]);
                }
            }
            await this.props.setMainState({ ...this.props.mainState, dataCheckedUser: true });
            this.forceUpdate();
            return await this.parseBD;
        }
    }

    changeicon(bol) {
        if (bol) return (<IoIosArrowDown />)
        else return (<IoIosArrowForward />)
    }

    handleMouseDown = (e) => {
        const isTitleOrChild =
            e.target.id === 'menu-title' ||
            e.target.id === 'menu-titleText' ||
            e.target === this.menuContainer;

        if (isTitleOrChild && e.target.id !== 'menu-titleLogo') {
            this.setState({
                isDragging: true,
                initialX: e.clientX,
                offsetX: this.menuContainer.getBoundingClientRect().left,
            });

            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        }
    };

    handleMouseMove = (e) => {
        if (this.state.isDragging) {
            this.setState({ deltaX: e.clientX - this.state.initialX });
            const newX = this.state.offsetX + this.state.deltaX;
            this.titleContainer.style.left = `${Math.max(newX, 0)}px`;
            this.menuContainer.style.left = this.titleContainer.style.left;
        }
    };

    handleMouseUp = () => {
        if (this.state.deltaX > 0) this.logoclick = true;
        this.setState({
            isDragging: false,
            initialX: 0,
            offsetX: 0,
            deltaX: 0
        });


        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    };

    handleLogoClick = () => {
        this.logoclick = true;
    };

    handleTitleClick = () => {
        if (!this.logoclick) {
        } else {
            this.logoclick = false;
        }
    };

    handleTitleTableClick = () => {
        this.stateTable.isTableVisible = !this.stateTable.isTableVisible;
        this.stateTable.icon = this.changeicon(this.stateTable.isTableVisible);
        this.forceUpdate();
    };

    handleTitleParamsClick = () => {
        this.stateParams.isParamsVisible = !this.stateParams.isParamsVisible;
        this.stateParams.icon = this.changeicon(this.stateParams.isParamsVisible);
        this.forceUpdate();
    };

    handleTitleInstClick = () => {
        this.stateInst.isInstVisible = !this.stateInst.isInstVisible;
        this.stateInst.icon = this.changeicon(this.stateInst.isInstVisible);
        this.forceUpdate();
    };

    handleSelectChange = (selectedValue, value = '', deleteElem = 1) => {
        let last = this.stateTable.rows.pop(this.stateTable.rows.length - 1);
        let num = this.stateTable.rows.length;
        this.stateTable.rows.push({
            ...last,
            selectedValue: selectedValue,
            showInput: true,
            id: num + 1,
            value: value
        });
        this.stateTable.rows.push({ ...last, id: num + 2 });
        if (deleteElem === 1) {
            const updatedOptions = [...this.stateTable.options];
            const indexToRemove = updatedOptions.indexOf(selectedValue);
            if (indexToRemove >= 0) {
                updatedOptions.splice(indexToRemove, 1);
                this.stateTable.options = updatedOptions;
            }
        }
        this.forceUpdate();
        return num + 1;
    }

    handleDateChange(d) {
        this.props.mainState.selectedDate = d;
    }

    handleInstClick = (event) => {
        const instIcons = document.getElementsByClassName("menu-instIcon");
        for (let i of instIcons) {
            i.style.color = 'white';
        }

        let target = event.target;
        while (target && !target.classList.contains("menu-instIcon")) {
            target = target.parentNode;
        }

        if (target) {
            target.style.color = 'pink';
            this.props.setMainState({
                ...this.props.mainState,
                inst: target.id
            });
        }
    }



    getInputField(typekey, svalue, id) {
        const inputProps = {
            placeholder: l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].placeholderinputProps
        };

        switch (typekey.type) {
            case "textarea":
                return <textarea
                    onChange={(event) => this.handleChangeOption(event, id)}
                    {...inputProps}
                    value={svalue}
                    className="menu-inputTextarea"
                    id={"menu-input_" + typekey.name}
                />;
            case "date":
                svalue = dayjs(svalue);
                return (
                    <ThemeProvider theme={this.darkDatePickerTheme}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                onChange={
                                    (event) =>
                                        this.handleChangeOption(
                                            event, id, (d) =>
                                            dayjs(d).format('YYYY-MM-DD')
                                        )
                                }
                                value={!isNaN(svalue.$D) ? svalue : null}
                            />
                        </LocalizationProvider>
                    </ThemeProvider>
                );
            case "color":
                return <HexColorPicker
                    onChange={(event) => this.handleChangeOption(event, id, (d) => d)}
                    color={svalue}
                />;
            case "image":
                return (
                    <label
                        {...inputProps}
                        className="menu-inputImage"
                        id={"menu-input_" + typekey.name}
                    >
                        {this.state.selectedImage && (
                            <img alt="" src={this.state.selectedImage} />
                        )}
                        <input type="file" name="file" accept="image/*" onChange={async (event) => {
                            let file = event.target.files[0];
                            let oc = (await data.imageUpload(file)).data.filePath;
                            this.handleChangeOption(oc, id, (d) => d);
                        }} />
                        <span>
                            {
                                svalue ?
                                    l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].imgeditfile :
                                    l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].imgcheckfile
                            }
                        </span>
                    </label >
                );
            default:
                return <input
                    onChange={(event) => this.handleChangeOption(event, id)}
                    type="text"
                    {...inputProps}
                    value={svalue}
                    className="menu-inputText"
                    id={"menu-input_" + typekey.name}
                />;
        }
    }

    generateTitle() {
        return (
            <div
                id="menu-title"
                ref={(ref) => (this.titleContainer = ref)}
                onMouseDown={this.handleMouseDown}
                onClick={this.handleTitleClick}>
                <div id="menu-titleLogo" onClick={this.handleLogoClick}></div>
                <p id="menu-titleText" className="menu-titles">Family Tree</p>
            </div>
        );
    }

    generateTable() {
        const options = this.stateTable.options;

        return (
            <div id="menu-tableContainer" className="menu-containers">
                <h2 id="menu-tableTitle" className='menu-titles' onClick={this.handleTitleTableClick}>{this.stateTable.icon}{l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].tableparams}</h2>
                <table id="menu-table" style={!this.stateTable.isTableVisible ? { display: 'none' } : {}}>
                    <tbody>
                        {this.stateTable.rows.map(row => (
                            row.showInput ? (
                                <tr key={row.id}>
                                    <td>
                                        {row.selectedValue !== '' && (
                                            <p key={row.id} className="menu-tableP" value={row.selectedValue}>
                                                {
                                                    (this.findOptions(row.selectedValue).bdname !== 'fio') && (
                                                        <CgTrash onClick={
                                                            (event) => {
                                                                row.showInput = false;
                                                                this.forceUpdate();
                                                                this.saveTableBD();
                                                            }
                                                        } />
                                                    )
                                                }
                                                {' '}
                                                {row.selectedValue}
                                            </p>
                                        )}

                                    </td>
                                    {row.showInput && (
                                        <td>
                                            {this.getInputField(this.findOptions(row.selectedValue), row.value, row.id)}
                                        </td>
                                    )}

                                </tr>) :
                                (
                                    row.selectedValue === '' && (
                                        <tr key={row.id}>
                                            {
                                                options.length > 0 &&
                                                (
                                                    <td>
                                                        <select
                                                            value={this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'}
                                                            onChange={(event) => this.handleSelectChange(event.target.value)}
                                                        >
                                                            <option value="">{l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].select}</option>
                                                            {options.map((option, optionIndex) => (
                                                                <option key={optionIndex} value={option}>
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                )
                                            }
                                            <td onClick={this.saveTableBD} id='menu-tableSave'>
                                                <div>{l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].save}</div>
                                            </td>
                                        </tr>
                                    )
                                )
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    generateParams() {
        return (
            <div id="menu-tableContainer" className="menu-containers">
                <h2 id="menu-tableTitle" className='menu-titles' onClick={this.handleTitleParamsClick}>{this.stateParams.icon}{l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].userparams}</h2>
                <table id="menu-table" style={!this.stateParams.isParamsVisible ? { display: 'none' } : {}}>
                    <tbody>
                        <tr>
                            <td><p className="menu-tableP">{l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].language}</p></td>
                            <td>
                                <select
                                    id="languageSelect"
                                    value={this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'}
                                    onChange={this.handleChangeLanguage}
                                >
                                    {this.stateParams.languageOptions.map(
                                        (option) => (
                                            (<option key={option.code} value={option.code} >
                                                {option.flag} {option.name}
                                            </option>)
                                        ))}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td><p className="menu-tableP">{l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].colorakcient}</p></td>
                            <td>
                                <HexColorPicker
                                    onChange={this.handleChangeAcientcolorDirectly}
                                    color={this.props.mainState.user.acientcolor}
                                />
                                <p className="menu-tableP" id="colorpickerbutton" onClick={this.handleChangeAcientcolor}>{l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].commit}</p>
                            </td>
                        </tr>
                        {/* <tr>
                            <td><p className="menu-tableP">{l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].background}</p></td>
                            <td>
                                <label className="menu-inputImage">
                                    {this.state.selectedImage && (
                                        <img alt="" src={this.state.selectedImage} />
                                    )}
                                    <input type="file" name="file" accept="image/*" onChange={async (event) => {
                                        let file = event.target.files[0];
                                        (await data.imageUpload(file)).data.filePath;
                                        this.handleFileInputChange(file, event);
                                        this.handleChangeOption(oc, id, (d) => d);
                                    }} />
                                    <span>
                                        {
                                            svalue ?
                                            l[this.props.ma/inState.lang].imgeditfile :
                                            l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].imgcheckfile
                                        }
                                    </span>
                                </label >
                            </td>
                        </tr> */}
                    </tbody>
                </table>
            </div >
        );
    }

    generateInstruments() {
        return (
            <div id="menu-instContainer" className="menu-containers">
                <h2 id="menu-instTitle" className='menu-titles' onClick={this.handleTitleInstClick}>{this.stateInst.icon}{l[this.props.mainState.user.lang ? this.props.mainState.user.lang : 'ru'].instruments}</h2>
                {this.stateInst.isInstVisible && (
                    <div id="menu-instBlock" className="menu-containers">
                        <GiArrowCursor className="menu-instIcon" id="arrowinst" onClick={this.handleInstClick} />
                        <IoIosAddCircleOutline className="menu-instIcon" id="addinst" onClick={this.handleInstClick} />
                        <CgTrash className="menu-instIcon" id="deleteinst" onClick={this.handleInstClick} />
                        <BiHide className="menu-instIcon" id="toggleinst" onClick={this.handleInstClick} />
                        <IoMdHome className="menu-instIcon" id="homeinst" onClick={() => {
                            this.props.setMainState(
                                {
                                    ...this.props.mainState,
                                    home: true
                                }
                            )
                        }
                        } />
                        <IoExit className="menu-instIcon" id="homeinst" onClick={() => {
                            data.deleteCookie();
                            window.location.reload();
                        }
                        } />

                    </div>)}
            </div>
        );

    }

    render() {
        return (
            <div>
                {this.generateTitle()}
                <div
                    id={this.id}
                    ref={(ref) => (this.menuContainer = ref)}
                    className="menu-containers">
                    {this.generateInstruments()}
                    {this.generateTable()}
                    {this.generateParams()}
                </div>
            </div>
        );

    }
}

export default Menu;
