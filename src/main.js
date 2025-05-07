class TextAlign {
    static leftAlignedIcon = '<path d="M17 9.5H3M21 4.5H3M21 14.5H3M17 19.5H3"/>'
    static centerAlignedIcon = '<path d="M19 9.5H5M21 4.5H3M21 14.5H3M19 19.5H5"/>'
    static rightAlignedIcon = '<path d="M21 9.5H7M21 4.5H3M21 14.5H3M21 19.5H7"/>' //'<path d="M17 9.5H3M21 4.5H3M21 14.5H3M17 19.5H3"/>'
    static justifyAlignedIcon = '<path d="M21 9.5H3M21 4.5H3M21 14.5H3M21 19.5H3"/>'
    
    static get isInline() {
        return true;
    }

    static get title() {
        return 'Text Alignment';
    }

    /**
     * Allow the inline alignment settings to be saved in the HTML
     */
    static get sanitize() {
        return {
            p: {
                class: true,
                style: true,
                'data-text-align': true
            },
            div: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h1: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h2: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h3: {
                class: true, 
                style: true,
                'data-text-align': true
            },
            h4: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h5: {
                class: true,
                style: true,
                'data-text-align': true
            },
            h6: {
                class: true,
                style: true,
                'data-text-align': true
            }
        };
    }

    constructor({api, config = {}}){
        this.currenticon = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs"></svg>';
        this.button = null;
        this.state = "left";
        this.api = api;
        this.config = config;
    }

    render(){
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.classList.add('text-align-tool');
        this.currentvalue = this.config?.default;
        this.setIcon();
        return this.button;
    }

    surround(range){
        const firstParentNode = this.getParentNode(range.startContainer);
        
        // Store alignment in both style and data attribute for better persistence
        if (this.state === "left") {
            firstParentNode.style.textAlign = "center";
            firstParentNode.dataset.textAlign = "center";
            this.state = "center";
        }
        else if (this.state === "center") {
            firstParentNode.style.textAlign = "right";
            firstParentNode.dataset.textAlign = "right";
            this.state = "right";
        }
        else if (this.state === "right") {
            firstParentNode.style.textAlign = "justify";
            firstParentNode.dataset.textAlign = "justify";
            this.state = "justify";
        }
        else if (this.state === "justify") {
            firstParentNode.style.textAlign = "left";
            firstParentNode.dataset.textAlign = "left";
            this.state = "left";
        }
        
        // Force the editor to recognize this change as a content update
        this.api.inlineToolbar.close();
    }

    checkState(selection){
        if (!selection) {
            return;
        }

        try {
            const anchorReq = this.api.selection.findParentTag(selection);
            
            // First check data attribute (our stored value)
            if (anchorReq.dataset.textAlign) {
                this.state = anchorReq.dataset.textAlign;
            }
            // Fallback to computed style
            else {
                const textAlign = window.getComputedStyle(anchorReq).textAlign;
                if (textAlign === 'center') {
                    this.state = 'center';
                } else if (textAlign === 'right') {
                    this.state = 'right';
                } else if (textAlign === 'justify') {
                    this.state = 'justify';
                } else {
                    this.state = 'left';
                }
            }
        } catch (e) {
            // If there's an error, default to left alignment
            this.state = 'left';
        }
        
        this.setIcon();
    }

    getParentNode(node){
        const validTags = ["DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6"];
        if (node?.parentNode && validTags.includes(node.parentNode.tagName)) {
            return node.parentNode;
        }
        else {
            return this.getParentNode(node.parentNode);
        }
    }

    setIcon(){
        if (this.state === "center") {
            this.currenticon = TextAlign.centerAlignedIcon;
        }
        else if (this.state === "right") {
            this.currenticon = TextAlign.rightAlignedIcon;
        }
        else if (this.state === "justify") {
            this.currenticon = TextAlign.justifyAlignedIcon;
        }
        else {
            this.currenticon = TextAlign.leftAlignedIcon;
        }
        
        const icon = this.currenticon;
        this.button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="arcs">' + icon + '</svg>';
    }
}

export default TextAlign;
