import axios from "axios";
import { useEffect } from 'react';
// import { parse, stringify, toJSON, fromJSON } from 'flatted';
import { stringify } from 'circular-json'

const proxy = 'http://localhost:5334';

const getQuery = async (prps = {
    query: null,
    respTo: 'notParseQuery',
    format: (d) => d,
    setState: null,
    mainState: null
}) => {
    console.log((await axios.get(proxy + '/api?' + prps.query)))
    const rg = await prps.format((await axios.get(proxy + '/api?' + prps.query)).data);
    if (rg === undefined)
        await prps.setState({ ...prps.mainState, notParseQuery: 'no query found' });
    else
        await prps.setState({ ...prps.mainState, [prps.respTo]: rg });
    console.log(rg)
    return rg;
}

const useQuery = (prps = {
    query: null,
    respTo: 'notParseQuery',
    format: (d) => d,
    afterExec: () => '',
    setState: null,
    mainState: null,
    trigger: null
}) => {
    useEffect(() => {
        const fetchData = async (prps) => {
            try {
                const rg = await prps.format((await axios.get(proxy + '/api?' + prps.query)).data);
                if (rg === undefined)
                    prps.setState({ ...prps.mainState, notParseQuery: 'no query found' });
                else
                    prps.setState({ ...prps.mainState, [prps.respTo]: rg });
            } catch (error) {
                console.error('Error fetching data', error);
            }
            if (prps.afterExec) await prps.afterExec();
        };

        if (!prps.query) {
            prps.setState((props) => { return { ...props.mainState, notParseQuery: 'no query found' } });
        } else {
            fetchData(prps);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prps.trigger, prps.setState, prps.query]);
};

const GetJson = (num, mainState, setMainState) => {
    getQuery({
        query: 'select=jsn from fam where id_family = ' + num,
        respTo: 'json',
        format: (d) => d[0] ? d[0].jsn : null,
        setState: setMainState,
        mainState: mainState,
    });
};

const GetUserById = async (mainState, setMainState) => {
    getQuery({
        query: 'select=* from person where node_id = ' + mainState.cardCheckedId,
        respTo: 'checkedUser',
        format: (d) => d[0],
        setState: setMainState,
        mainState: mainState
    });
};

const GetNodeId = async () => {
    return await axios.get(proxy + '/api?getnodeid');
};

const SaveUserById = (state, mainState, setMainState) => {
    var out = "";
    const cavs = ['fio', 'destription', 'town', 'nodecolor', 'cardcolor', 'birsday', 'death', 'img'];
    for (const key in state.checkedUser) {
        if (state.checkedUser.hasOwnProperty(key) && state.checkedUser[key] !== mainState.checkedUser[key]) {
            console.log(out);
            const value = cavs.includes(key) && state.checkedUser[key] !== 'NULL' ? `'${state.checkedUser[key]}'` : state.checkedUser[key];
            out += `${key} = ${encodeURIComponent(value)}, `;
            console.log(out);
        }
    }
    if (out === "") return;

    out = out.slice(0, -2);
    getQuery({
        query: `update= person set ${out} where node_id = ${mainState.cardCheckedId}`,
        format: (d) => d,
        setState: setMainState,
        mainState: mainState
    });
};

const SaveJsonFamilyById = (mainState, setMainState, exec = (d) => d.json) => {
    getQuery({
        query: `update= fam set jsn='${encodeURIComponent(stringify(exec(mainState)))}' where id_family = ${mainState.selectedFamilyId}`,
        format: (d) => d,
        setState: setMainState,
        mainState: mainState
    });
}

const InsertJsonFamily = async (jsn, id_user, mainState, setMainState, exec = (d) => d.json) => {
    let json = encodeURIComponent(JSON.stringify(jsn))
    return await getQuery({
        query: `insert= into fam(jsn, id_user) values ('${json}', ${id_user})`,
        format: (d) => d,
        setState: setMainState,
        mainState: mainState
    });
}

const DeletePersonsById = (array, mainState, setMainState) => {
    let out = '';
    for (let key of array) {
        out += 'node_id = ' + key + ' or '
    }
    out = out.slice(0, -3);
    console.log(`delete= from person where ${out}`);
    getQuery({
        query: `delete= from person where ${out}`,
        format: (d) => d,
        setState: setMainState,
        mainState: mainState
    });
};

const InsertPersonById = async (id, mainState, setMainState) => {
    await getQuery({
        query: `insert= into person(node_id, fio) values (${id}, '')`,
        format: (d) => d,
        setState: setMainState,
        mainState: mainState
    });
};

const ValidateName = async (username, mainState, setMainState) => {
    console.log(1)
    return await getQuery({
        query: `nameexist=${username}`,
        respTo: 'isUsernamePrimary',
        format: (d) => d.exist,
        setState: setMainState,
        mainState: mainState
    });
}

const SetCookie = (name, value, days = 10) => {
    console.log(value);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    const cookieString = `${name}=${value.hash}; expires=${expirationDate.toUTCString()}; path=/`;
    document.cookie = cookieString;
    return value
}

const GetCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
};

function DeleteCookie() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
}

const ValidateCookie = async (cookie, mainState, setMainState) => {
    console.log(mainState, `select * from users where user_id = (select id_user from sessions where hash = '${cookie}' and expired > '${(new Date()).toISOString().split('T')[0]}')`);
    return await getQuery({
        query: `select= user_id, email, username, lang, acientcolor, backimg from users where user_id = (select id_user from sessions where hash = '${cookie}' and expired > '${(new Date()).toISOString().split('T')[0]}' limit 1)`,
        format: (d) => { console.log(d); return d },
        respTo: 'user',
        setState: setMainState,
        mainState: mainState,
    });
}

const SelectFamilyByUserId = async (uid, mainState, setMainState) => {
    let out = await getQuery({
        query: `select= id_family from fam where id_user=${uid}`,
        format: (d) => { console.log(d); return d },
        respTo: 'user',
        setState: setMainState,
        mainState: mainState,
    });
    console.log(out);
    return out;
}

const GenerateHash = async (username, mainState, setMainState) => {
    await getQuery({
        query: `hashgen=${username}`,
        format: (d) => SetCookie('hash', d),
        setState: setMainState,
        mainState: mainState
    });
}

const InsertNewUser = async (mainState, setMainState) => {
    console.log(`insert= into user(username, email, pass) values (${mainState}, ${mainState.user.email}, ${mainState.user.pass})`, mainState);
    const result = await getQuery({
        query: `insert= INTO users(username, email, pass, lang, acientcolor)
        SELECT '${mainState.user.username}', '${mainState.user.email}', '${mainState.user.pass}', '${mainState.user.lang ? mainState.user.lang : 'ru'}', '{encodeURIComponent(#cc3344)}'
        WHERE NOT EXISTS (
            SELECT 1 FROM users WHERE username = '${mainState.user.username}'
        ) RETURNING user_id;`,
        format: (d) => d,
        setState: setMainState,
        mainState: mainState
    });
    return result;
};

const ValidateUser = async (login = '', pass = '', mainState, setMainState) => {
    return await getQuery({
        query: `login=${login}&pass=${pass}`,
        format: (d) => d,
        setState: setMainState,
        mainState: mainState
    });
};




const ImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return await axios.post(proxy + '/upload', formData);
};



const UpdateLanguage = async (mainState, setMainState, id = 0) => {
    return await getQuery({
        query: `update= users set lang= '${mainState.user.lang}' where user_id = ${mainState.user.user_id ? mainState.user.user_id : id}`,
        format: (d) => d,
        setState: setMainState,
        mainState: mainState
    });
};

const UpdateAcientcolor = async (mainState, setMainState) => {
    console.log(`update= users set acientcolor= '${mainState.user.acientcolor}' where user_id = ${mainState.user.user_id}`);
    return await getQuery({
        query: `update= users set acientcolor= '${encodeURIComponent(mainState.user.acientcolor)}' where user_id = ${mainState.user.user_id}`,
        format: (d) => d,
        setState: setMainState,
        mainState: mainState
    });
};



const data = {
    proxy: proxy,
    useQuery: useQuery,
    getJson: GetJson,
    getUserById: GetUserById,
    getQuery: getQuery,
    getNodeId: GetNodeId,
    getCookie: GetCookie,
    saveUserById: SaveUserById,
    saveJsonFamilyById: SaveJsonFamilyById,
    deletePersonsById: DeletePersonsById,
    deleteCookie: DeleteCookie,
    insertPersonById: InsertPersonById,
    insertNewUser: InsertNewUser,
    insertJsonFamily: InsertJsonFamily,
    validateName: ValidateName,
    validateCookie: ValidateCookie,
    validateUser: ValidateUser,
    setCookie: SetCookie,
    generateHash: GenerateHash,
    selectFamilyByUserId: SelectFamilyByUserId,
    imageUpload: ImageUpload,
    updateLanguage: UpdateLanguage,
    updateAcientcolor: UpdateAcientcolor
};

export default data;
