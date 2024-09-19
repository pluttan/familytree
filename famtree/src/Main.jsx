import 'bootstrap/dist/css/bootstrap.min.css';
import './Main.scss';
import React, { useState, useEffect } from 'react';
import Tree from './Tree';
import Menu from './Menu';
import data from './Data';
import { BlackBox, Registration } from './Blocks';



const Main = () => {
    const treeRef = React.createRef();
    const menuRef = React.createRef();



    const [mainState, setMainState] = useState(
        {
            hash: data.getCookie('hash'),
            cardCheckedId: 1,
            selectedFamilyId: -1,
            json: null,
            data: null,
            dataCheckedUser: false,
            notParseQuery: null,
            inst: "arrowinst",
            treeNeedUpdate: false,
            home: false,
            checkedUser: {
                img: null,
                fio: null,
                birsday: null,
                death: null,
                town: null,
                destription: null,
                mother: null,
                father: null,
                cardcolor: null,
                nodecolor: null
            },
            isUsernamePrimary: false,
            user: {
                username: null,
                lang: 'ru',
                email: null,
                pass: null,
                acientcolor: '#cc3344',
                hash: null
            },
            idFamilies: []
        }
    );

    useEffect(() => {
        document.title = 'Family Tree';
    }, []);


    const menu = (
        <Menu
            id="menu-container"
            tree={treeRef}
            ref={menuRef}
            setMainState={setMainState}
            mainState={mainState}
        />
    );



    return mainState.hash ?
        (<div>
            {mainState.selectedFamilyId >= 0 && (
                <Tree
                    id="tree-container"
                    menu={menuRef}
                    ref={treeRef}
                    setMainState={setMainState}
                    mainState={mainState}
                />
            )}
            {menu}
        </div>) :
        (<>
            <Registration
                setMainState={setMainState}
                mainState={mainState}
            />
            <BlackBox />
        </>);
};


export default Main;
