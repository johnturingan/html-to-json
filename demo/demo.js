const htmlToJson = require('../index');


let service = new htmlToJson({
    src: './**/*.tpl',
    dest: './demo/output/',
    options: {
        as_variable: false,
        with_version: true,
        include_paths: false //'./demo/templates/partial'
    }
});

// generate output file
service.compile();

// return content as promise
let promise = service.yield();
promise.then((response) => {

    console.log(response);
});