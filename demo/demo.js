const htmlToJson = require('../index');


let service = new htmlToJson({
    src: './**/*.tpl',
    dest: './demo/output/',
    options: {
        include_paths: false,
        as_variable: false
    }
});

// generate output file
service.compile();

// return content as promise
let promise = service.yield();
promise.then((response) => {

    console.log(response);
});