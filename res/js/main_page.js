const search_result_div = document.getElementById('search_result');
const search_value_inp = document.getElementById('search_inp');
const deatil_tube = document.getElementById('tube-deatil');
const noselect_tube = document.getElementById('tube-noselect');
const tube_img_pindefine = document.getElementById('tube-img-pindefine');
const tube_noimg_pindefine_text = document.getElementById('tube-noimg-pindefine-text');
const deatil_tube_name = document.getElementById('tube-name');
const deatil_tube_maker = document.getElementById('tube-maker');
const deatil_tube_use = document.getElementById('tube-use');
const deatil_tube_args = document.getElementById('args');
const deatil_tube_supplements = document.getElementById('supplement_forjs');
const deatil_tube_supplement_text = document.getElementById('supplement-text');
const deatil_tube_imgs = document.getElementById('tube-imgs');
const pdf_tube_nofile_text = document.getElementById('tube-pdf-nofile');
const tube_pdfreader = document.getElementById("pdfreader");
let symbols_trans = null;
let now_select_tube = {};
let tube_elm = null;

function loadSymbolList() {
    fetch("symbols_trans.json").then((response) => {
        if (!response.ok) {
            throw new Error(`加载资源symbols_trans.json失败\nCode: ${response.status} ${response.statusText}\n请刷新重试，如果多次不行请联系管理员`);
        } else {
            return response.json();
        }
    }).then(data0 => {
        symbols_trans =  data0;
    }).catch(err => {
        console.error(err);
    });
}

function clearDeatil() {
    tube_img_pindefine.src = '';
    tube_img_pindefine.style.display = 'none';
    tube_noimg_pindefine_text.style.display = 'block';
    deatil_tube_name.innerHTML = '';
    deatil_tube_maker.innerHTML = '';
    deatil_tube_use.innerHTML = '';
    deatil_tube_args.innerHTML = '';
    deatil_tube_supplements.innerHTML = '';
    deatil_tube_imgs.innerHTML = '';
    pdf_tube_nofile_text.style.display = "block";
    tube_pdfreader.style.display = 'none';
}

const ArgTransformer = {
    replaceValue: function (value) {
        if (value.startsWith(">=")) {
            return value.replace(/>=/g, "大于等于");
        }else if(value.startsWith("<=")) {
            return value.replace(/<=/g, "小于等于");
        }else if (value.startsWith('>')) {
            return value.replace(/>/g, "大于");
        }else if (value.startsWith('<')) {
            return value.replace(/</g, "小于");
        }else {
            return value;
        }
    },

    checkName: function (k, val) {
        if (val !== void 0 || val) {
            return val;
        }else {
            console.error("No translation key or value: "+ k);
            return "[No translation key or value]";
        }
    },

    transArgs: function (aname, t) {
        if (t.hasOwnProperty("translation")) {
            if (t.translation.hasOwnProperty(aname)) {
                return t.translation[aname];
            }
        }
        if (aname.endsWith("max")) {
            if (symbols_trans.hasOwnProperty(aname)) {
                return symbols_trans[aname];
            }else {
                return this.checkName(aname, "最大" + symbols_trans[aname.replace(/max/g, '')]);
            }
        }else if (aname.endsWith("min")) {
            if (symbols_trans.hasOwnProperty(aname)) {
                return symbols_trans[aname];
            }else {
                return this.checkName(aname, "最小" + symbols_trans[aname.replace(/min/g, '')]);
            }
        }else if (aname.endsWith("_all")){
            if (symbols_trans.hasOwnProperty(aname)) {
                return symbols_trans[aname];
            }else {
                return this.checkName(aname, "平均" + symbols_trans[aname.replace(/_all/g, '')]);
            }
        } else {
            return this.checkName(aname, symbols_trans[aname]);
        }
    }
};

let onDeatil = false

function setPage(tube) {
    if (!onDeatil) {
        noselect_tube.style.display = "none";
        deatil_tube.style.display = "block";
        onDeatil = true;
    }
    clearDeatil();
    deatil_tube_name.innerHTML = tube.name;
    if (tube.hasOwnProperty("pindefine")) {
        tube_noimg_pindefine_text.style.display = 'none';
        tube_img_pindefine.src = tube.pindefine;
        tube_img_pindefine.style.display = 'block';
    }
    deatil_tube_maker.innerHTML = "品牌：" + tube.maker;
    deatil_tube_use.innerHTML = "主要作用：" + tube.use;
    const keys = Object.keys(tube.args);
    for (const k of keys) {
        const arg_span_elm = document.createElement("span");
        arg_span_elm.classList.add("arg");
        arg_span_elm.innerHTML = `(${ArgTransformer.transArgs(k, tube)}-${k}) = ${ArgTransformer.replaceValue(tube.args[k])}`;
        deatil_tube_args.appendChild(arg_span_elm);
    }
    if (tube.hasOwnProperty("supplement")) {
        deatil_tube_supplement_text.style.display = "block";
        for (const k of Object.keys(tube.supplement)) {
            const supplement_span_elm = document.createElement("span");
            supplement_span_elm.classList.add("supplement");
            supplement_span_elm.innerHTML = `(${ArgTransformer.transArgs(k, tube)}-${k})&nbsp;&nbsp;&nbsp;${tube.supplement[k]}`;
            deatil_tube_supplements.appendChild(supplement_span_elm);
        }
    }else {
        deatil_tube_supplement_text.style.display = "none";
    }
    if (tube.hasOwnProperty("imgs")) {
        if (tube.imgs.length > 0) {
            for (const i of tube.imgs) {
                const img_c_div = document.createElement("div");
                img_c_div.classList.add("tube-img-block");
                const img = document.createElement("img");
                img.classList.add("tube-img");
                img.src = i.path;
                img.alt = i.name;
                img_c_div.appendChild(img);
                const img_text_cont = document.createElement("div");
                img_text_cont.classList.add("img-text-cont");
                const img_desc_p = document.createElement("p");
                img_desc_p.classList.add("tube-img-desc");
                img_desc_p.innerHTML = i.name;
                img_text_cont.appendChild(img_desc_p);
                const dw_img_btn = document.createElement("button");
                dw_img_btn.classList.add("tube-img-download");
                const dw_btn_icon_div = document.createElement("div");
                dw_btn_icon_div.classList.add("tube-img-dw-icon-c");
                const icon_img = document.createElement("img");
                icon_img.classList.add("tube-img-download-icon");
                icon_img.src = "./res/icon/icon_download.png";
                dw_btn_icon_div.appendChild(icon_img);
                dw_img_btn.appendChild(dw_btn_icon_div);
                img_text_cont.appendChild(dw_img_btn);
                img_c_div.appendChild(img_text_cont);
                deatil_tube_imgs.appendChild(img_c_div);
            }
        }else {
            const noimg_p = document.createElement("p");
            noimg_p.classList.add("tube-img-noimg");
            noimg_p.innerHTML = "暂无曲线图资料";
            deatil_tube_imgs.appendChild(noimg_p);
        }
    }
    if (tube.hasOwnProperty("pdfdatasheet")) {
        //
    }
}

function searchResultAddToPage(tube) {
    const elm = document.createElement("p");
    elm.classList.add("suggestion");
    elm.classList.add("suggestion-focus");
    elm.addEventListener("click", function () {
        if (tube_elm != null) {
            tube_elm.style.background = "white";
        }
        tube_elm = elm;
        now_select_tube = tube;
        elm.style.background = "#81e0ff91";
        setPage(now_select_tube);
    });
    const name = document.createElement("b");
    name.innerText = tube.name;
    name.classList.add("suggestion-focus");
    elm.appendChild(name);
    const maker = document.createElement("i");
    maker.classList.add("suggestion-maker");
    maker.classList.add("suggestion-focus");
    maker.innerHTML = tube.maker;
    elm.appendChild(maker);
    const type = document.createElement("i");
    type.classList.add("suggestion-type");
    type.classList.add("suggestion-focus");
    type.innerHTML = tube.type;
    elm.appendChild(type);
    search_result_div.appendChild(elm);
}

function searchTubeToPage() {
    search_result_div.innerHTML = "";
    if (search_value_inp.value.startsWith("#")) {
        searchTube(search_value_inp.value.slice(1), true).forEach(t => {
            searchResultAddToPage(t);
        });
    }else {
        searchTube(search_value_inp.value, false).forEach(t => {
            searchResultAddToPage(t);
        });
    }
}

const tube_arg_div = document.getElementById('tube-args');
const tube_img_div = document.getElementById('tube-imgs');
const tube_pdf_div = document.getElementById("tube-pdf");

function btnToArgsDiv() {
    tube_img_div.style.display = "none";
    tube_pdf_div.style.display = "none";
    tube_arg_div.style.display = "block";
}

function btnToImgsDiv() {
    tube_arg_div.style.display = "none";
    tube_pdf_div.style.display = "none";
    tube_img_div.style.display = "block";
}

function btnToPdfDiv() {
    tube_arg_div.style.display = "none";
    tube_img_div.style.display = "none";
    tube_pdf_div.style.display = "block";
}
