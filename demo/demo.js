const htmlToJson = require('../index');


let service = new htmlToJson({
    src: './**/*.tpl',
    dest: './demo/output/',
    options: {
        include_paths: false,
        as_variable: false
    }
});

service.compile();