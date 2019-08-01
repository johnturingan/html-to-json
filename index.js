const glob = require('glob');
const fs = require('fs');
const path = require("path");
const frontMatter = require('front-matter');
const revHash = require('rev-hash');

const DIRECTIVE_REGEX = /^(.*=\s*([\w\.\*\/-]+)\s*:\s*([\w\.\*\/-]+\.html?\s*))$/gm;


class Processor {

    constructor (options) {

        this.options = options;
        this.content_output = {};
    }

    handle (contents, tpl_path, output) {

        let results, matches, include_paths = false;

        // Parse template group to get individual
        // html template path listed inside

        while (matches = DIRECTIVE_REGEX.exec(contents)) {

            let relative_path = path.dirname(tpl_path),
                html_path = path.join(relative_path,  matches[3].replace(/['"]/g, '')).trim(),
                key_variable = matches[2]
            ;

            let file_matches = [];

            // Check if include path is set
            // Use include path as base relative path
            // for each html template path

            let include_paths = this.options.include_paths;

            if (this.options.include_paths) {

                if (typeof include_paths == "string") {
                    // Arrayfy the string
                    include_paths = [include_paths];
                }

                include_paths.forEach((item) => {

                    let include_path = path.join(item, matches[3].replace(/['"]/g, '')).trim();

                    if (fs.existsSync(include_path)) {

                        let res = glob.sync(include_path, {mark: true});
                        file_matches = file_matches.concat(res);
                    }
                });

            } else {

                results = glob.sync(html_path, {mark: true});

                file_matches = file_matches.concat(results);
            }

            try {

                file_matches.forEach((i) => {

                    let content = Processor.extractContents(i);
                    let key = (key_variable.trim() === '*') ? Processor.keyVariable(i) : key_variable;
                    this.content_output[key] = content;
                });

            } catch (e) {

                console.log(e);
            }
        }

        return this.content_output;
    }

    static keyVariable(path) {

        let n = path.split('.');

        n.pop();

        let nLast = n.pop(), nArr = [];

        if (nLast.indexOf('/') >= 0) {

            nArr = nLast.split('/')

        } else {

            nArr = nLast.split('\\')
        }

        return nArr.pop();
    }

    static extractContents (path) {

        if (fs.existsSync(path)) {

            let bufferContents = fs.readFileSync(path),
                parsed = frontMatter(bufferContents.toString().replace(/\s+/g, ' '));

            return parsed.body;

        } else {

            throw new Error('File not found: ' + path);
        }
    }
}





/**
 * HTML to JSON Service
 * @param config
 * @constructor
 */
function HtmlToJson (config) {

    this.src = config.src;
    this.dest = config.dest;
    this.prefix = config.prefix;
    this.options = config.options;

    if (!fs.existsSync(this.dest)){
        fs.mkdirSync(this.dest);
    }
}


HtmlToJson.prototype = {

    templates () {

        return new Promise((resolve, reject) => {
            glob(this.src, { realpath: true }, (er, files) =>  {
                resolve (files);
            });
        });

    },

    compile () {
        this.templates()
            .then(this.readGroup.bind(this));
    },

    yield () {

        return new Promise((resolve, reject) => {

            this.templates()
                .then((files) => {

                    this.readGroup(files, (content) => {
                        resolve(content);
                    });
                });
        });
    },

    readGroup (files, cb) {

        if (!Array.isArray(files)) {

            throw Error('Template file is invalid');
        }

        let response = {};
        let rev = {};

        files.forEach((i) => {

            let contents = fs.readFileSync(i, 'utf8'),
                processor = new Processor(this.options),
                content_output = processor.handle(contents, i),
                name = Processor.keyVariable(i),
                ext = '.json'
            ;


            if (typeof cb  !== 'function') {

                content_output = JSON.stringify(content_output);

                let hash = revHash(content_output), versioned;

                if (this.options.as_variable) {

                    content_output = "var " + name + "=" +  content_output;
                    ext = '.js';
                }

                if (this.options.with_version) {

                    versioned = name + '-' + hash;
                    rev[name + ext] = versioned + ext;
                    name = versioned;
                }


                let filename = this.dest + name + ext;

                fs.writeFile(filename, content_output, (e) => {

                    if (e) {

                        console.error(e); return;
                    }

                    console.log(`${name} saved to ${this.dest}`);

                });

            } else  {

                response[name] = content_output;
            }
        });

        if (typeof cb  === 'function') {

            return cb(response);
        }

        this.generateManifest(rev);
    },

    generateManifest (rev) {

        if (!this.options.with_version) return;

        fs.writeFile(this.dest + 'rev-manifest.json', JSON.stringify(rev), (e) => {

            if (e) {
                console.error(e); return;
            }

            console.log(`Manifest file has been created`);

        });
    }

};

module.exports = HtmlToJson;