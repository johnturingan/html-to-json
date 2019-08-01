# html-to-json

>Makes inclusion of files easy and fast.
Compile html files and wrap it all in a single json file.
Enables you to include only the files you want.

>Can be useful if you want to generate various groups of templates and
include only the html files you want for that specific group.

> To run Demo:
>
```
$ cd demo
$ node demo.js
```
Just make sure the you already install all node modules including Dev Dependencies

Install :traffic_light:
-------

```bash
$ npm install html-2-json --save
```


## Usage
html-to-json has 2 methods available for usage depending on your needs.

* *htmlToJson.compile()* - Compile html to json and saves the output on the destination folder you specified
* *htmlToJson.yield()* - Compile html to json then return the content output as promise.

```javascript
const htmlToJson = require('html-2-json');

let engine = new htmlToJson({
    src: './**/*.tpl',
    dest: './demo/output/',
    options: {
        include_paths: false,
        as_variable: false
    }
});

// generate output file
engine.compile();

// return content as promise
let promise = engine.yield();
promise.then((response) => {

    console.log(response);
});

```

## Parmeters and Options

##### Parameters:
* `src` (required)
	* source of the template group file
	* can use glob

* `dest` (required if using compile method)
    * destination folder of compiled json
    * trailing / is a must

##### Options
* `as_variable` (optional)
    * default false
    * If set to true, it will output your file as a javascript variable. Otherwise, json file

* `include_paths` (optional)
    * Takes a String or an Array of paths.
    * If set, html-to-json will use these folders as base path when searching for files.



Sample output if as_variable = false;

```javascript
{
"header":"<header> <ul> <li>Nav 1</li> <li>Nav 2</li> <li>Nav 3</li> <li>Nav 4</li> </ul> </header>",
"body":"<div class=\"container\"> <div class=\"wrapper\"> <h1>THIS IS THE BODY</h1> <p>This is underscore template tags <%= variable %></p> </div> </div>",
"footer":"<footer> <div class=\"title\"> <h1>THIS IS THE FOOTER</h1> </div> </footer>"
}

```
output file is filename.json


Sample output if as_variable = true;

```javascript
var filename = {
"header":"<header> <ul> <li>Nav 1</li> <li>Nav 2</li> <li>Nav 3</li> <li>Nav 4</li> </ul> </header>",
"body":"<div class=\"container\"> <div class=\"wrapper\"> <h1>THIS IS THE BODY</h1> <p>This is underscore template tags <%= variable %></p> </div> </div>",
"footer":"<footer> <div class=\"title\"> <h1>THIS IS THE FOOTER</h1> </div> </footer>"
}

```
output file is filename.js

## Template Group file

In the file where you want want to compile you html, add a comment similar to this:

```javascript
//= key.name : relative/path/to/file.html
```

where key.name is the name want to associate with the html content in your json object.

If you use * as your key name like this :

```javascript
//= * : relative/path/to/file.html
```

It will automatically use the filename of your html as its key name.

If you want to use glob similar to commonly used in GruntJS, you may also to that like this:

```javascript
//= * : relative/path/to/**/*.html
```

Suggested key name is * so the it will use the filename as the keyname.

First sample code output:

```json
{
    "key.name" : "<div>your html content</div>"
}
```

Second sample code output:

```json
{
    "file" : "<div>your html content</div>"
}
```

Third sample will look into all html content inside the directory and output it like this:

```json
{
    "file" : "<div>your html content</div>",
    "file2" : "<div>your html content 2</div>"
}
```




----
**[MIT](LICENSE) LICENSE** <br>
copyright &copy; 2019 Scripts and Pixels.
