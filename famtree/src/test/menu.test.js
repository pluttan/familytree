import React from 'react';
import { shallow, mount } from 'enzyme';
import Menu from '../Menu';
import { IoIosArrowDown } from "react-icons/io";
import data from '../Data';

describe('Menu Component', () => {
    it('renders without crashing', () => {
        const wrapper = shallow(<Menu />);
        expect(wrapper.exists()).toBe(true);
    });

    it('renders the title correctly', () => {
        const wrapper = shallow(<Menu />);
        expect(wrapper.find('#menu-titleText').text()).toEqual('Family Tree');
    });

    it('changes state on logo click', () => {
        const wrapper = mount(<Menu />);
        const logo = wrapper.find('#menu-titleLogo');
        logo.simulate('click');
        expect(wrapper.instance().logoclick).toBe(true);
    });

    it('updates state on language change', async () => {
        const setMainStateMock = jest.fn();
        const wrapper = mount(<Menu setMainState={setMainStateMock} mainState={{ user: { lang: 'en' } }} />);
        const languageSelect = wrapper.find('#languageSelect');
        languageSelect.simulate('change', { target: { value: 'ru' } });
        expect(setMainStateMock).toHaveBeenCalledWith(expect.objectContaining({ lang: 'ru' }));
    });

    it('handles table title click', () => {
        const wrapper = mount(<Menu />);
        const titleTable = wrapper.find('#menu-tableTitle');
        titleTable.simulate('click');
        expect(wrapper.state('stateTable')).toHaveProperty('isTableVisible', true);
    });

    it('handles params title click', () => {
        const wrapper = mount(<Menu />);
        const titleParams = wrapper.find('#menu-tableTitle');
        titleParams.simulate('click');
        expect(wrapper.state('stateParams')).toHaveProperty('isParamsVisible', true);
    });

    it('handles instruments title click', () => {
        const wrapper = mount(<Menu />);
        const titleInst = wrapper.find('#menu-instTitle');
        titleInst.simulate('click');
        expect(wrapper.state('stateInst')).toHaveProperty('isInstVisible', true);
    });

    // ... (previous imports and setupTests.js)

    describe('Menu Component - Additional Tests', () => {
        it('renders instruments block when stateInst is true', () => {
            const wrapper = shallow(<Menu />);
            wrapper.setState({ stateInst: { isInstVisible: true, icon: <IoIosArrowDown /> } });
            expect(wrapper.find('#menu-instBlock').exists()).toBe(true);
        });

        it('updates state on instrument icon click', () => {
            const setMainStateMock = jest.fn();
            const wrapper = mount(<Menu setMainState={setMainStateMock} mainState={{ user: { lang: 'en' } }} />);
            const arrowInstIcon = wrapper.find('#arrowinst');
            arrowInstIcon.simulate('click');
            expect(setMainStateMock).toHaveBeenCalledWith(expect.objectContaining({ inst: 'arrowinst' }));
        });

        it('calls saveTableBD when an input value changes', () => {
            const wrapper = mount(<Menu />);
            const inputField = wrapper.find('.menu-inputText').first();
            const saveTableBDSpy = jest.spyOn(wrapper.instance(), 'saveTableBD');
            inputField.simulate('change', { target: { value: 'Test' } });
            expect(saveTableBDSpy).toHaveBeenCalled();
        });

        it('handles date change correctly', () => {
            const wrapper = mount(<Menu mainState={{ selectedDate: null }} />);
            const datePicker = wrapper.find('DatePicker');
            const newDate = new Date('2023-01-01');
            datePicker.props().onChange(newDate);
            expect(wrapper.props().mainState.selectedDate).toEqual(newDate);
        });

        it('handles file input change correctly', async () => {
            const wrapper = mount(<Menu />);
            const fileInput = wrapper.find('input[type="file"]');
            const imageUploadSpy = jest.spyOn(data, 'imageUpload');
            await fileInput.simulate('change', { target: { files: [new File([''], 'test.jpg', { type: 'image/jpeg' })] } });
            expect(imageUploadSpy).toHaveBeenCalled();
        });

        it('handles logo click correctly', () => {
            const wrapper = mount(<Menu />);
            const logo = wrapper.find('#menu-titleLogo');
            logo.simulate('click');
            expect(wrapper.instance().logoclick).toBe(true);
        });

        it('renders the correct language options in the select dropdown', () => {
            const wrapper = mount(<Menu mainState={{ user: { lang: 'en' } }} />);
            const languageSelect = wrapper.find('#languageSelect');
            const options = wrapper.state('stateParams').languageOptions;
            options.forEach((option, index) => {
                expect(languageSelect.find(`option`).at(index).text()).toBe(`${option.flag} ${option.name}`);
            });
        });

        it('updates state on color change in HexColorPicker', () => {
            const wrapper = mount(<Menu />);
            const hexColorPicker = wrapper.find('HexColorPicker');
            const newColor = '#FF5733';
            hexColorPicker.props().onChange(newColor);
            expect(wrapper.props().mainState.checkedUser.nodecolor).toEqual(newColor);
        });

        it('calls data.deleteCookie and window.location.reload on exit icon click', () => {
            const deleteCookieSpy = jest.spyOn(data, 'deleteCookie');
            const reloadSpy = jest.spyOn(window.location, 'reload');
            const wrapper = mount(<Menu />);
            const exitIcon = wrapper.find('#homeinst');
            exitIcon.simulate('click');
            expect(deleteCookieSpy).toHaveBeenCalled();
            expect(reloadSpy).toHaveBeenCalled();
        });

        it('handles mouse down, move, and up events correctly for dragging', () => {
            const wrapper = mount(<Menu />);
            const titleContainer = wrapper.find('#menu-title');
            titleContainer.simulate('mousedown', { clientX: 100 });
            titleContainer.simulate('mousemove', { clientX: 150 });
            titleContainer.simulate('mouseup');
            expect(wrapper.state('deltaX')).toBe(50);
        });

        it('renders the correct placeholder in textarea input', () => {
            const wrapper = mount(<Menu />);
            const textareaInput = wrapper.find('.menu-inputTextarea');
            expect(textareaInput.props().placeholder).toBe('Enter text...');
        });

        it('renders the correct placeholder in text input', () => {
            const wrapper = mount(<Menu />);
            const textInput = wrapper.find('.menu-inputText');
            expect(textInput.props().placeholder).toBe('Enter text...');
        });

        it('renders the correct placeholder in HexColorPicker', () => {
            const wrapper = mount(<Menu />);
            const hexColorPicker = wrapper.find('HexColorPicker');
            expect(hexColorPicker.props().placeholder).toBe('Select color...');
        });


    });

});