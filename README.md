# Inline text-align plugin for editorjs.
A fork from https://www.jsdelivr.com/package/npm/@canburaks/text-align-editorjs

Updated with type="button" to prevent unwanted form submissions
<br/>

![text-align plugin styled elements](https://github.com/canburaks/text-align-editorjs/blob/master/assets/text-align-nietzsche.gif)

## Installation
```
npm i @blumacdigital/text-align-editorjs
```


## Usage

```
import TextAlign from "blumac-digital-ltd/text-align-editorjs"

const editor = new EditorJS({ 
  	holder: 'editorjs', 
	tools: { 
        textAlign:TextAlign
    },
})

```


## License

[MIT](LICENSE).
