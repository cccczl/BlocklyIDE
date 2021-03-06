// JavaScript Document
// event handle for webpage
function run() {
    // Generate JavaScript code and run it.
    window.LoopTrap = 1000;
    Blockly.JavaScript.INFINITE_LOOP_TRAP =
        'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
    debuginf(code);
    try {
        eval(code);
    } catch (e) {
        alert(e);
    }
}
var example_list;
function save() {
    // Generate XML code and display it.
    var dom = Blockly.Xml.workspaceToDom(workspace);
    var xml = Blockly.Xml.domToPrettyText(dom);
    var file = document.getElementById("dialog_filename").value;
    debuginf(xml);
    var json = {
        file: file,
        xml: xml
    }
    for(i in example_list)
    {
        if(example_list[i] == file){
            var body = {
                query : {file:json.file},
                command : {$set:{xml:json.xml}}
            }
            ajax_post("/db/update/blockly_example", body);
            load_example_list();
            return;
        }
    }
    ajax_post("/db/add/blockly_example", json);
    load_example_list();
}

function stop() {
    parseCode();
    code_runing = false;
}

var code_runing = false;
function step() {
    if (code_runing == false) {
        parseCode();
        code_runing = true;
    }
    else {
        stepCode();
    }
}
function stepCode() {
    try {
        var ok = myInterpreter.step();
    } finally {
        if (!ok) {
            // Program complete, no more code to execute.
            code_runing = false;
            return;
        }
    }
    if (highlightPause) {
        // A block has been highlighted.  Pause execution here.
        highlightPause = false;
    } else {
        // Keep executing until a highlight statement is reached.
        stepCode();
    }
}

function reboot() {
    debuginf("reboot");
    ajax_get("reboot");
}

function configrations(event) {
    var filename = event.srcElement.innerText;
    //document.getElementById('broadpic').src = 'config/' + version + '.jpg';
    debuginf("configrations");
    debuginf(filename);
    ajax_post("/fpga/config", { "filename" : filename +".rbf" });
}

function fpga() {
    window.location.port = 8686;
}

function load_example(event) {
    var example = event.srcElement.innerText;
    debuginf(example);
    debuginf("load code");
    var query = { "file": { "$eq": example } }
    var json = ajax_post("/db/query/blockly_example", query)
    debuginf(json[0]);
    debuginf(document.getElementById('startBlocks'));
    workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(json[0].xml),
        workspace);
}


var timer = null;

function mousedown(event) {
    load_example(event);
    timer = setTimeout(function () {
        delete_example(event)
    }, 1500); //set the timeout
};

function mouseup(event) {
    clearTimeout(timer);
};

function delete_example(event) {
    var file = event.srcElement.innerText;
    debuginf(file);
    document.getElementById("pop_message").innerText = file;
    $("#popdialog").modal();
}

function do_delete_example() {
    file = document.getElementById("pop_message").innerText;
    debuginf("do delete code");
    debuginf(file);
    var json = { file: file }
    ajax_delete("/db/remove/blockly_example", json);
    load_example_list();
}

function delay_refresh() {
    window.location.reload();
}

function page_refresh() {
    setTimeout('delay_refresh()', 60000);

}

function load_config_list() {
    var html_list ="";
    list = ajax_get("/fpga/config/list");
    debuginf(list);
    for (var index in list) {
        debuginf(list[index]);
        var name = list[index].split('.')[0];
        var ext = list[index].split('.')[1];
        if (ext == 'rbf') {
            html_list += "<li><a href='#' onClick= configrations(event)>" +
                name + "</a></li>";
        }
    }
    document.getElementById("version_list").innerHTML = html_list;
}

function load_example_list() {
    var list = ajax_get("/db/list/blockly_example");
    debuginf(list);
    if (list == null) return;
    example_list = [];
    var html_list = "";
    for (var index in list) {
        debuginf(list[index]);
        var name = list[index].file;
        example_list.push(name);
        html_list += "<span id=" + name + " onmousedown='mousedown(event)' onmouseup='mouseup(event)' class='btn btn-info'>" + name + "</span>";
    }
    document.getElementById("Ex").innerHTML = html_list;
}


window.onload = function () {
    load_blockly();
    load_chart();
    load_example_list();
    load_config_list();                   
}
