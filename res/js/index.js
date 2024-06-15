const input = document.getElementById('inp_search');
const suggestions = document.getElementById('suggestions-list');
let tubes = null;

function parseBaseExp(inputString) {
    let pairs;
    if (inputString.includes("&")) {
        pairs = inputString.split('&');
    }else {
        pairs = [inputString,];
    }
    const arr_exp = [];
    for (const pair of pairs) {
        let sym = '';
        if (pair.includes('=>')) {
            sym = '=>';
        } else if (pair.includes('>=')) {
            sym = ">="
        } else if (pair.includes('<=')) {
            sym = '<=';
        } else if (pair.includes("=<")) {
            sym = "=<"
        } else if (pair.includes('=')) {
            sym = '=';
        } else if (pair.includes('<')) {
            sym = '<';
        } else if (pair.includes('>')) {
            sym = '>';
        }
        const a1 = pair.split(sym);
        const name = a1[0];
        const value = a1[1];
        arr_exp.push({"name": name, "value": value, "symbol": sym});
    }
    return arr_exp;
}

function completeDataVal(val) {
    return String(val)
        .replace(/=>/g, "").replace(/>=/g, "")
        .replace(/=</g, "").replace(/<=/g, "")
        .replace(/=/g, "").replace(/</g, "")
        .replace(/>/g, "");
}

const UnitMap = {
    'KV': 1000,
    'V': 1,
    'MV': 0.001,
    'UV': 0.000001,
    'NV': 0.000000001,
    'A': 1,
    'MA': 0.001,
    'UA': 0.000001,
    'NA': 0.000000001,
    'F': 1,
    'UF': 0.000001,
    'NF': 0.000000001,
    'PF': 0.000000000001,
    'R': 1,
    'KR': 1000,
    'MR': 1000000,
    "HZ": 1,
    "KHZ": 1000,
    "MHZ": 1000000,
    "S": 1,
    "MIN": 60
};
const physicValRegex = /(\d+\.?\d*)([a-zA-Z]+)/;

function convertPhysicValue(value1, value2) {
    let match1 = String(value1).match(physicValRegex);
    let match2 = String(value2).match(physicValRegex);
    if (match1 && match2) {
        let numericValue1 = parseFloat(match1[1]);
        let numericValue2 = parseFloat(match2[1]);
        let unit1 = match1[2].toUpperCase();
        let unit2 = match2[2].toUpperCase();
        let convertedValue1 = numericValue1 * UnitMap[unit1];
        let convertedValue2 = numericValue2 * UnitMap[unit2];
        if (!Number.isNaN(convertedValue1) && !Number.isNaN(convertedValue2)) {
            return [convertedValue1, convertedValue2];
        }else {
            return null;
        }
    }else {
        return null;
    }
}

function searchTube(text, shouldByexp) {
    return _.filter(tubes, e => {
        if (shouldByexp) {
            let exps = parseBaseExp(text);
            let pass_count = 0;
            for (let i=0;i<exps.length;i++) {
                let exp = exps[i];
                if (!Object.hasOwn(e.args, exp.name)) {
                    continue;
                }
                let v1 = e.args[exp.name];
                let v2 = String(completeDataVal(v1)).toUpperCase();
                let vals = convertPhysicValue(exp.value.toUpperCase(), v2);
                if (vals == null) {
                    continue;
                }
                switch (exp.symbol) {
                    case "=":
                        if (vals[0] === vals[1]) {
                            pass_count += 1;
                        }
                        break;
                    case "<":
                        if (vals[0] > vals[1]) {
                            pass_count += 1;
                        }
                        break;
                    case ">":
                        if (vals[0] < vals[1]) {
                            pass_count += 1;
                        }
                        break;
                    case "=>":
                        if (vals[0] < vals[1] || vals[0] === vals[1]) {
                            pass_count += 1;
                        }
                        break;
                    case ">=":
                        if (vals[0] < vals[1] || vals[0] === vals[1]) {
                            pass_count += 1;
                        }
                        break;
                    case "<=":
                        if (vals[0] > vals[1] || vals[0] === vals[1]) {
                            pass_count += 1;
                        }
                        break;
                    case "=<":
                        if (vals[0] > vals[1] || vals[0] === vals[1]) {
                            pass_count += 1;
                        }
                }
            }
            return pass_count === exps.length;
        }
        if (e.name.toUpperCase().startsWith(text.toUpperCase())) {
            return true;
        } else if (e.type.includes(text.toUpperCase())) {
            return true;
        } else if (e.maker.includes(text.toUpperCase())) {
            return true;
        } else return e.use.includes(text);
    });
}

function addSuggestion(tube0) {
    const elm = document.createElement("p");
    elm.classList.add("suggestion");
    elm.classList.add("suggestion-focus");
    const name = document.createElement("b");
    name.innerText = tube0.name;
    name.classList.add("suggestion-focus");
    elm.appendChild(name);
    const maker = document.createElement("i");
    maker.classList.add("suggestion-maker");
    maker.classList.add("suggestion-focus");
    maker.innerHTML = tube0.maker;
    elm.appendChild(maker);
    const type = document.createElement("i");
    type.classList.add("suggestion-type");
    type.classList.add("suggestion-focus");
    type.innerHTML = tube0.type;
    elm.appendChild(type);
    elm.addEventListener("click", function (e) {
        e.preventDefault();
        input.value = tube0.name;
        suggestions.style.display = 'none';
    });
    suggestions.appendChild(elm);
}

const debounce0 = _.debounce(function () {
    searchTube(input.value, false).forEach(t => {
        addSuggestion(t);
    });
}, 300);

function completeSearch() {
    suggestions.innerHTML = '';
    if (input.value || !input.value.startsWith("#")) {
        suggestions.style.display = 'block';
    } else {
        suggestions.style.display = 'none';
    }
    debounce0();
}

function gotoMainPage() {
    location.href = "./page.html?tubename=" + input.value;
}

function loadTubeData(callback) {
    fetch("tubes.json").then((response) => {
        if (!response.ok) {
            throw new Error(`加载资源tubes.json失败\nCode: ${response.status} ${response.statusText}\n请刷新重试，如果多次不行请联系管理员`);
        } else {
            return response.json();
        }
    }).then(data0 => {
        let d =  data0.tube_list;
        tubes = d;
        if (callback != null) {
            callback(d);
        }
    }).catch(err => {
        console.error(err);
    });
}

function load2() {
    input.addEventListener('input', completeSearch);
    input.addEventListener('click', completeSearch);
    document.documentElement.addEventListener('click', function (e) {
        if (!e.target.classList.contains('suggestion-focus')) {
            suggestions.style.display = 'none';
        }
    });
}